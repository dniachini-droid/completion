/**
 * The heart (MVP.md → build order, slice 1): Today, capacity, Begin, the delve and runs, Done, the step,
 * day complete, the arrival. Pure: facts + content + the clock in, new facts or a view out.
 *
 * Commands return the facts to append. Anything the clock has made due (a delve that ran out while the
 * phone was locked) is settled first, stamped with the moment it really happened. The world's gifts
 * (steps, day complete, arrivals) are worked out once, when they happen, and kept as facts (rule 9, rule 18).
 */
import { calendarWeek, epochOf, gameDay, momentOf, offsetOf, wallClock, weekdayOf, type Moment } from './time';
import { runAt, alertsAfter, type RunMark, type RunNow, type RunPlan } from './run';
import type { Capacity, Content, Fact, FactBody, FactOf, Job, Rhythm } from './types';
import * as S from './story';
import type { Beat, Seal, StretchId } from './story-types';

export const STEP_MIN = 25;                                   /* BALANCING §1 */
export const DAY_SIZE: Record<Capacity, number> = { low: 2, normal: 3, high: 5 };   /* §6 */
export const DIAL = [25, 30, 45, 60] as const;                /* the dial's stops (D-033) */
const MIN = 60_000;

/* ---------- reading the log ---------- */

const ofType = <T extends FactBody['type']>(facts: Fact[], type: T) => facts.filter((f): f is FactOf<T> => f.type === type);
const onDay = (facts: Fact[], day: string) => facts.filter(f => f.day === day);
const jobOf = (c: Content, id: string): Job => c.jobs.find(j => j.id === id) ?? { id, name: id, delve: false, length: STEP_MIN, doneBy: 'dan' };
export const enoughOf = (j: Job) => j.enoughAt ?? j.length;

/** The run in progress, if any, with Dan's marks on it. */
function activeRun(facts: Fact[]) {
  let start = -1;
  for (let i = facts.length - 1; i >= 0; i--) {
    const f = facts[i];
    if (f.type === 'delveEnded') return null;
    if (f.type === 'delveStarted') { start = i; break; }
  }
  if (start < 0) return null;
  const f = facts[start] as FactOf<'delveStarted'>;
  const plan: RunPlan = { startedAt: epochOf(f.at), minutes: f.minutes, count: f.count };
  const marks: RunMark[] = [];
  for (const m of facts.slice(start + 1)) {
    if (m.type === 'breatherSkipped') marks.push({ kind: 'skip', at: epochOf(m.at) });
    else if (m.type === 'delveHeld') marks.push({ kind: 'hold', at: epochOf(m.at) });
    else if (m.type === 'delveResumed') marks.push({ kind: 'resume', at: epochOf(m.at) });
  }
  const rewarded = facts.slice(start + 1).filter(g => g.type === 'stepsGained' && g.run === f.seq).length;
  return { fact: f, plan, marks, rewarded };
}

function capacityOn(facts: Fact[], day: string): Capacity {
  const c = ofType(onDay(facts, day), 'capacityChosen');
  return c.length ? c[c.length - 1].capacity : 'normal';
}

/** The day's size: Low 2, Normal 3, High 5; opened after 14:00 one fewer, after 19:00 one job completes it (§6). */
export function daySize(capacity: Capacity, firstOpen: Moment | null): number {
  const base = DAY_SIZE[capacity];
  if (!firstOpen) return base;
  const h = wallClock(firstOpen).h;
  if (h >= 19 || h < 4) return 1;
  if (h >= 14) return Math.max(1, base - 1);
  return base;
}
function sizeOn(facts: Fact[], day: string) {
  const first = onDay(facts, day).find(f => f.type === 'opened');
  return daySize(capacityOn(facts, day), first ? first.at : null);
}

const doneOn = (facts: Fact[], day: string) => new Set(ofType(onDay(facts, day), 'jobDone').map(f => f.job));
const completedOn = (facts: Fact[], day: string) => onDay(facts, day).some(f => f.type === 'dayCompleted');
export const delveMinutesOn = (facts: Fact[], day: string, job: string) =>
  ofType(onDay(facts, day), 'stepsGained').filter(f => f.job === job && f.run !== undefined).reduce((a, f) => a + f.minutes, 0);

export const rhythmOf = (c: Content, job: string): Rhythm | undefined => c.rhythms.find(r => r.job === job);
/** Whether a job belongs in today's suggestion at all: a set-day rhythm on its day; a one-off until it's done. */
function offeredOn(c: Content, facts: Fact[], day: string, j: Job): boolean {
  const r = rhythmOf(c, j.id);
  if (r?.days) return r.days.includes(weekdayOf(day));
  if (!r) return !ofType(facts, 'jobDone').some(f => f.job === j.id && f.day !== day);
  return true;
}
/** A rhythm whose enough is met this week stops leading (PLANNER → How the week drives Today). */
const metThisWeek = (c: Content, facts: Fact[], day: string, job: string) => {
  const r = rhythmOf(c, job);
  return !!r && S.sessionsIn(facts.filter(f => f.day !== day), r, day) >= S.needOf(r);
};

/** Today's jobs in order: the content's order, rhythms already met this week last, changed by Swap. */
function orderOn(c: Content, facts: Fact[], day: string): string[] {
  const offered = c.jobs.filter(j => offeredOn(c, facts, day, j));
  const order = [...offered.filter(j => !metThisWeek(c, facts, day, j.id)), ...offered.filter(j => metThisWeek(c, facts, day, j.id))].map(j => j.id);
  for (const s of ofType(onDay(facts, day), 'swapped')) {
    const a = order.indexOf(s.from), b = order.indexOf(s.to);
    if (a >= 0 && b >= 0) [order[a], order[b]] = [order[b], order[a]];
  }
  return order;
}

/** A job begun away from the phone (Begin on a no-timer job) and not yet done today. */
function underWayOn(facts: Fact[], day: string): string | null {
  const done = doneOn(facts, day);
  const begun = ofType(onDay(facts, day), 'jobBegun').filter(f => f.from === 'app').map(f => f.job);
  for (let i = begun.length - 1; i >= 0; i--) if (!done.has(begun[i])) return begun[i];
  return null;
}

/* ---------- the route ---------- */

export const walked = (facts: Fact[]) => ofType(facts, 'stepsGained').reduce((a, f) => a + f.minutes, 0);

/* ---------- writing ---------- */

function writer(facts: Fact[], now: Moment) {
  const all = facts.slice(), out: Fact[] = [];
  let seq = facts.length ? facts[facts.length - 1].seq : 0;
  const off = offsetOf(now);
  const put = (body: FactBody, at: Moment = now, day: string = gameDay(at)): Fact => {
    const f = { seq: ++seq, at, day, ...body } as Fact;
    all.push(f); out.push(f); return f;
  };
  return { all, out, put, off, now };
}
type W = ReturnType<typeof writer>;

/** A story item's records, each shown once. */
function show(w: W, c: Content, ids: string[] | undefined, at: Moment, day: string) {
  const st = S.storyState(w.all, c.story);
  for (const id of ids ?? []) if (!st.records.includes(id)) w.put({ type: 'recordShown', id }, at, day);
}
function arrive(w: W, c: Content, b: Beat, how: 'foot' | 'key', at: Moment, day: string) {
  w.put({ type: 'arrived', kind: 'place', id: b.id, how }, at, day);
  show(w, c, b.carries?.records, at, day);
}
function giveFind(w: W, c: Content, why: FactOf<'findGiven'>['why'], at: Moment, day: string, job?: number) {
  const f = S.pickFind(c.story, S.storyState(w.all, c.story), why);
  if (!f) return;
  w.put({ type: 'findGiven', id: f.id, why, ...(job ? { job } : {}) }, at, day);
  if (f.told) show(w, c, [f.told], at, day);
}

/** The story's week: the first begins on the first opening; the next when this one is done and a new calendar week has come. */
function storyClock(w: W, c: Content, at: Moment, day: string) {
  const st = S.storyState(w.all, c.story);
  if (st.weekBegan === null) { w.put({ type: 'storyWeekBegan', w: 1 }, at, day); return; }
  if (S.mayAdvance(c.story, st, day)) w.put({ type: 'storyWeekBegan', w: st.week + 1 }, at, day);
}

/** The weekly floor: a week that had a day complete brings at least 2 Keys; the new week's first opening lands the rest (§3). */
function floor(w: W, c: Content, at: Moment, day: string) {
  const thisWeek = calendarWeek(day);
  const weeks = [...new Set(ofType(w.all, 'dayCompleted').map(f => calendarWeek(f.day)))].filter(x => x < thisWeek);
  const last = weeks[weeks.length - 1];
  if (!last || ofType(w.all, 'keyEarned').some(f => f.rhythm === `floor:${last}`)) return;
  const had = S.keysIn(w.all, last);   /* the week's own Keys, not floor Keys landed in it for the week before */
  for (let i = had; i < S.KEY_FLOOR; i++) landKey(w, c, `floor:${last}`, at, day);
  if (had >= S.KEY_FLOOR) w.put({ type: 'keyEarned', rhythm: `floor:${last}` }, at, day);   /* noted, so it's checked once */
}

/** A Key lands: the next sealed thing opens, and its line plays (as this job's return, if there is one). */
function landKey(w: W, c: Content, rhythm: string, at: Moment, day: string, job?: number): Seal | null {
  w.put({ type: 'keyEarned', rhythm }, at, day);
  const seal = S.nextSeal(c.story, S.storyState(w.all, c.story));
  if (!seal) return null;
  w.put({ type: 'sealOpened', seal: seal.id }, at, day);
  show(w, c, seal.carries?.records, at, day);
  if (seal.arrival) { const b = S.beatOf(c.story, seal.arrival); if (b) arrive(w, c, b, 'key', at, day); }
  else w.put({ type: 'beatPlayed', id: seal.beat ?? seal.id, ...(job ? { job } : {}) }, at, day);
  if (seal.beat) show(w, c, S.beatOf(c.story, seal.beat)?.carries?.records, at, day);
  return seal;
}

/** After anything that can complete the day or move Dan: day complete, then the places reached (§4; the story job's §0.2). */
function gifts(w: W, c: Content, at: Moment, day: string) {
  storyClock(w, c, at, day);
  const reach = () => {
    let n = 0;
    for (;;) {
      const st = S.storyState(w.all, c.story), next = S.nextPlace(c.story, st);
      if (!next || walked(w.all) < S.nextPlaceAt(st)) return n;
      arrive(w, c, next, 'foot', at, day); n++;
    }
  };
  if (!completedOn(w.all, day)) {
    if (doneOn(w.all, day).size < sizeOn(w.all, day)) return;
    w.put({ type: 'dayCompleted' }, at, day);
    if (reach() === 0) {
      /* short of the next place: a camp with a view, always with one thing to look at */
      const camp = S.nextCamp(c.story, S.storyState(w.all, c.story));
      w.put({ type: 'arrived', kind: 'camp', id: camp.id }, at, day);
      /* its one thing to look at: the view's own find, or the stretch's next if that one was already found */
      const st = S.storyState(w.all, c.story);
      const find = camp.find && !st.given.has(camp.find) ? camp.find : camp.line ? null : S.pickFind(c.story, st, 'camp')?.id;
      if (find) w.put({ type: 'findGiven', id: find, why: 'camp' }, at, day);
    }
  } else reach();   /* after day complete, Keep going still arrives somewhere (no dead ends for effort, D-039) */
}

function markDoneIn(w: W, c: Content, job: string, at: Moment, day: string) {
  if (doneOn(w.all, day).has(job)) return;
  const j = jobOf(c, job), timed = delveMinutesOn(w.all, day, job);
  /* a delve's minutes have already moved Dan; a job without them earns its usual length (§1) */
  const minutes = timed > 0 ? timed : enoughOf(j);
  const done = w.put({ type: 'jobDone', job, minutes }, at, day);
  if (timed === 0) w.put({ type: 'stepsGained', minutes, job }, at, day);
  storyClock(w, c, at, day);
  /* a rhythm met this week lands a Key, until the week's supply is used; past it, one find a week (§3) */
  const r = rhythmOf(c, job);
  let keyed = false;
  if (r && S.sessionsIn(w.all, r, day) === S.needOf(r)) {
    if (S.keysIn(w.all, day) < S.KEYS_A_WEEK) keyed = !!landKey(w, c, r.id, at, day, done.seq);
    else if (!ofType(w.all, 'findGiven').some(f => f.why === 'surplus' && calendarWeek(f.day) === calendarWeek(day))) giveFind(w, c, 'surplus', at, day, done.seq);
  }
  /* the return: on a High day past a Normal day's size, the deep push's next beat (once a day); else the story's next
     step; else a line of the passage */
  if (!keyed) {
    const st = S.storyState(w.all, c.story), step = S.nextStep(c.story, st);
    const deep = capacityOn(w.all, day) === 'high' && doneOn(w.all, day).size > DAY_SIZE.normal
      && !ofType(onDay(w.all, day), 'beatPlayed').some(f => S.beatOf(c.story, f.id)?.kind === 'deep') ? S.nextDeep(c.story, st) : null;
    if (deep) { w.put({ type: 'beatPlayed', id: deep.id, job: done.seq }, at, day); show(w, c, deep.carries?.records, at, day); }
    else if (step) { w.put({ type: 'beatPlayed', id: step.id, job: done.seq }, at, day); show(w, c, step.carries?.records, at, day); }
    else { const p = S.nextPassage(c.story, st); if (p) w.put({ type: 'beatPlayed', id: 'passage', passage: p, job: done.seq }, at, day); }
  }
  /* an avoided job always brings a find (P5) */
  if (j.avoided) giveFind(w, c, 'avoided', at, day, done.seq);
  gifts(w, c, at, day);
}

const reachesEnough = (all: Fact[], day: string, j: Job) =>
  j.doneBy === 'enough' && !doneOn(all, day).has(j.id) && delveMinutesOn(all, day, j.id) >= enoughOf(j);

/** Write down whatever the clock has made due in a run: each delve's step, enough, the run's end. */
function settleIn(w: W, c: Content, nowMs: number) {
  const r = activeRun(w.all);
  if (!r) return;
  const s = runAt(r.plan, r.marks, nowMs);
  const day = r.fact.day, j = jobOf(c, r.fact.job);
  for (const [k, e] of s.ends.entries()) {
    if (k < r.rewarded) continue;
    const at = momentOf(e.at, w.off);
    const before = ofType(onDay(w.all, day), 'stepsGained').filter(g => g.run !== undefined);
    w.put({ type: 'stepsGained', minutes: r.plan.minutes, job: j.id, run: r.fact.seq }, at, day);
    /* a long delve reaches a side chamber; the first delve on a new job after a long stretch brings a find (§1, D-044) */
    if (k + 1 === S.CHAMBER_RUN) giveFind(w, c, 'chamber', at, day);
    const others = [...new Set(before.map(g => g.job))].filter(x => x !== j.id);
    if (before.length && before[before.length - 1].job !== j.id && others.some(x => delveMinutesOn(w.all, day, x) >= S.LONG_STRETCH)
      && !ofType(onDay(w.all, day), 'findGiven').some(f => f.why === 'switching')) giveFind(w, c, 'switching', at, day);
    if (reachesEnough(w.all, day, j)) markDoneIn(w, c, j.id, at, day);
    else gifts(w, c, at, day);
  }
  if (s.phase === 'ended' && s.how === 'ranOut') {
    w.put({ type: 'delveEnded', job: j.id, minutes: Math.round(s.countedMs / MIN), how: 'ranOut', run: r.fact.seq }, momentOf(s.endedAt!, w.off), day);
  }
}

/* ---------- commands: Dan's actions ---------- */

export type Command =
  | { do: 'open' }
  | { do: 'capacity'; capacity: Capacity }
  | { do: 'swap' }
  | { do: 'focus'; job: string }
  | { do: 'begin'; job: string }
  | { do: 'startRun'; job: string; minutes: number; count: number }
  | { do: 'skipBreather' }
  | { do: 'stepAway' }
  | { do: 'resume' }
  | { do: 'finishHere' }
  | { do: 'done'; job: string }
  | { do: 'cantStart'; job: string }
  | { do: 'seen'; what: 'step' | 'arrival'; ref: number }
  | { do: 'guess'; mark: string; guess: string }
  | { do: 'choose'; beat: string; pick: number }
  | { do: 'read'; record: string };

/** The facts a command adds to the log (including anything the clock made due first). */
export function act(facts: Fact[], c: Content, cmd: Command, now: Moment): Fact[] {
  const w = writer(facts, now), nowMs = epochOf(now);
  settleIn(w, c, nowMs);
  const day = gameDay(now), v = see(w.all, c, now);
  switch (cmd.do) {
    case 'open': w.put({ type: 'opened' }); storyClock(w, c, now, day); floor(w, c, now, day); break;
    case 'guess': {
      /* a guess, never "wrong" at guess time; it may change until the place confirms it (SCRIPT §9; mock-up record.html) */
      const st = S.storyState(w.all, c.story), m = S.markOf(c.story, cmd.mark);
      if (!m?.candidates?.includes(cmd.guess) || st.guessed.get(cmd.mark) === cmd.guess) break;
      if (st.guessed.has(cmd.mark) && !S.mayGuess(c.story, st, cmd.mark)) break;
      w.put({ type: 'markGuessed', mark: cmd.mark, guess: cmd.guess }); gifts(w, c, now, day);
      break;
    }
    case 'choose': w.put({ type: 'choiceMade', beat: cmd.beat, pick: cmd.pick }); break;
    case 'read': w.put({ type: 'recordOpened', id: cmd.record }); break;
    case 'capacity':
      if (cmd.capacity !== v.capacity) {
        w.put({ type: 'capacityChosen', capacity: cmd.capacity, suggested: v.suggested });
        gifts(w, c, now, day);   /* lowering capacity can complete the day (D-043) */
      }
      break;
    case 'swap': {
      const from = v.next?.job;
      if (!from) break;
      const pool = v.order.filter(id => id !== from && !v.done.has(id));
      const to = pool.find(id => !v.slate.includes(id)) ?? pool[0];
      if (to) w.put({ type: 'swapped', from, to });
      break;
    }
    case 'focus':
      if (v.next && v.next.job !== cmd.job && !v.done.has(cmd.job)) w.put({ type: 'swapped', from: v.next.job, to: cmd.job });
      break;
    case 'begin':
      if (!jobOf(c, cmd.job).delve && !v.done.has(cmd.job) && v.underWay !== cmd.job) w.put({ type: 'jobBegun', job: cmd.job, from: 'app' });
      break;
    case 'startRun':
      if (v.run) break;
      if (!ofType(onDay(w.all, day), 'jobBegun').some(f => f.job === cmd.job)) w.put({ type: 'jobBegun', job: cmd.job, from: 'app' });
      w.put({ type: 'delveStarted', job: cmd.job, minutes: cmd.minutes, count: Math.max(1, cmd.count) });
      break;
    case 'skipBreather': if (v.run?.phase === 'breather') w.put({ type: 'breatherSkipped' }); break;
    case 'stepAway': if (v.run?.phase === 'delve') w.put({ type: 'delveHeld' }); break;
    case 'resume': if (v.run?.phase === 'held') w.put({ type: 'delveResumed' }); break;
    case 'finishHere': {
      const r = activeRun(w.all);
      if (!r) break;
      const s = runAt(r.plan, r.marks, nowMs), rday = r.fact.day, j = jobOf(c, r.fact.job);
      const part = s.phase === 'delve' || s.phase === 'held' ? Math.floor(s.doneMs / MIN) : 0;
      const counted = s.ends.length * r.plan.minutes + part;
      if (part > 0) w.put({ type: 'stepsGained', minutes: part, job: j.id, run: r.fact.seq }, now, rday);
      w.put({ type: 'delveEnded', job: j.id, minutes: counted, how: 'finishedHere', run: r.fact.seq }, now, rday);
      /* Finish here counts every minute; a repeating delve at its enough is done */
      if (reachesEnough(w.all, rday, j)) markDoneIn(w, c, j.id, now, rday);
      else gifts(w, c, now, rday);
      break;
    }
    case 'done':
      if (v.done.has(cmd.job)) break;
      /* Done with no Begin: recorded afterwards (the test's sharpest line, MVP.md) */
      if (!ofType(onDay(w.all, day), 'jobBegun').some(f => f.job === cmd.job)) w.put({ type: 'jobBegun', job: cmd.job, from: 'record' });
      markDoneIn(w, c, cmd.job, now, day);
      break;
    case 'cantStart': w.put({ type: 'cantStartUsed', job: cmd.job }); break;
    case 'seen': w.put({ type: 'seen', what: cmd.what, ref: cmd.ref }); break;
  }
  return w.out;
}

/** Facts the clock alone has made due (call on open and while a run is on screen). */
export function settle(facts: Fact[], c: Content, now: Moment): Fact[] {
  const w = writer(facts, now);
  settleIn(w, c, epochOf(now));
  return w.out;
}

/* ---------- what the player can see now ---------- */

export interface RunView extends RunNow {
  seq: number; job: Job; minutes: number; count: number;
  /** The delve in which the job reaches its enough (1-based), if it does within this run. */
  enoughK: number | null;
  /** Instants, for the screen's clock words. */
  startedAt: number;
}
export interface RunEnd {
  seq: number; job: Job; minutes: number; how: 'ranOut' | 'finishedHere';
  /** A one-off that isn't done yet: ask "Is it done?" */
  ask: boolean;
  /** The job reached its enough in this run. */
  enough: boolean;
  /** This run completed the day (the next screen is the arrival). */
  completedDay: boolean;
  count: number;
}
export interface Arrival {
  seq: number; kind: 'place' | 'camp'; id: string; name: string; line: string;
  /** A word cut in four taps: one line per tap. */
  taps?: string[];
  choice?: [string, string];
  /** Records this place brought (a choice opens them to read). */
  records: string[];
  /** Marks offered for a guess here. */
  guess: string[];
  /** A camp's one thing to look at. */
  look: string | null;
  stretch: StretchId; painting: string; completedDay: boolean; byKey: boolean;
}
/** What a job's return shows: the story's step (or a Key's sealed thing opening), else a passage line; and any finds. */
export interface Return {
  beat: string | null; line: string; key: boolean; guess: string[]; choice?: [string, string]; records: string[];
  finds: string[];
  /** A partial sign found on a deep push: its element, and the mark it belongs to (SCRIPT §8). */
  part?: { el: string; mark: string };
}
/** Where Dan stands. */
export interface Here { id: string | null; name: string; line: string; stretch: StretchId; painting: string; }

export interface View {
  day: string;
  capacity: Capacity;
  suggested: Capacity;
  size: number;
  order: string[];
  /** Today's main jobs, in order (only today's; never counts, D-038). */
  slate: string[];
  done: Set<string>;
  underWay: string | null;
  complete: boolean;
  next: { job: string; mode: 'begin' | 'underWay' | 'carry' | 'running' } | null;
  run: RunView | null;
  runEnd: RunEnd | null;
  arrival: Arrival | null;
  here: Here;
  /** The sealed thing ahead that Dan can see (where it is, in plain words). */
  ahead: string | null;
  walked: number;
  /** Minutes of effort from here to the next named place, if one is reachable (never shown as steps owed). */
  toNext: number | null;
  /** The next place's distance mark, in minutes from the start. */
  nextAt: number | null;
  lastArrival: Arrival | null;
  story: S.StoryState;
  teaser: string | null;
  /** Finds given on the run that just ended (a side chamber, switching). */
  runFinds: string[];
  /** A line of the passage for where Dan is (a breather, a delve's end). */
  passage: string;
}

/** The stand-in painting for a place until its own is painted from its brief (PROTOTYPE_NOTES.md). */
export const STAND_IN: Record<StretchId, string> = {
  'st-mouth': 'sample-well-stair', 'st-hall': 'sample-rib-gallery', 'st-salt': 'sample-pool-dome', 'st-camp': 'sample-rib-gallery',
  'st-stair': 'sample-well-stair', 'st-flight2': 'sample-well-stair', 'st-square': 'sample-rib-gallery',
};
/** The places painted from their briefs so far (ids only; D-015): each shows its own painting, `pt-<id>`, which
    ui/paintings.ts carries (a test keeps the two in step); every other place shows its stretch's stand-in. */
export const PAINTED: ReadonlySet<string> = new Set<string>([]);
export const paintingOf = (id: string | null, stretch: StretchId): string => id && PAINTED.has(id) ? `pt-${id}` : STAND_IN[stretch];

function arrivalOf(c: Content, all: Fact[], f: FactOf<'arrived'>): Arrival {
  /* one of the places played at day complete: nothing but the world's answers between the lock-in and it */
  const dc = all.find(g => g.type === 'dayCompleted' && g.day === f.day && g.seq < f.seq);
  const quiet = new Set(['arrived', 'recordShown', 'findGiven', 'sealOpened', 'keyEarned', 'beatPlayed', 'storyWeekBegan']);
  const completedDay = !!dc && all.every(g => g.seq <= dc.seq || g.seq >= f.seq || quiet.has(g.type));
  if (f.kind === 'place') {
    const b = S.beatOf(c.story, f.id)!;
    return { seq: f.seq, kind: 'place', id: b.id, name: b.name ?? '', line: b.line ?? '', taps: b.taps, choice: b.choice,
      records: b.carries?.records ?? [], guess: b.carries?.guess ?? [], look: null, stretch: b.stretch, painting: paintingOf(b.id, b.stretch), completedDay, byKey: f.how === 'key' };
  }
  const k = c.story.camps.find(x => x.id === f.id)!;
  const find = all.find(g => g.type === 'findGiven' && g.why === 'camp' && g.seq > f.seq && g.seq <= f.seq + 1) as FactOf<'findGiven'> | undefined;
  const look = find ? c.story.finds.find(x => x.id === find.id)?.line ?? null : 'line' in k.look ? k.look.line : null;
  return { seq: f.seq, kind: 'camp', id: k.id, name: k.name, line: k.line, records: [], guess: [], look, stretch: k.stretch, painting: paintingOf(k.id, k.stretch), completedDay, byKey: false };
}

/** What a job's return (a jobDone fact) shows. */
export function returnOf(c: Content, facts: Fact[], doneSeq: number): Return {
  const beat = facts.find(f => f.type === 'beatPlayed' && f.job === doneSeq) as FactOf<'beatPlayed'> | undefined;
  const finds = facts.filter((f): f is FactOf<'findGiven'> => f.type === 'findGiven' && f.job === doneSeq).map(f => f.id);
  if (!beat) return { beat: null, line: '', key: false, guess: [], records: [], finds };
  if (beat.id === 'passage') return { beat: null, line: c.story.passages.find(p => p.id === beat.passage)?.line ?? '', key: false, guess: [], records: [], finds };
  const seal = S.sealOf(c.story, beat.id);
  if (seal) return { beat: seal.id, line: seal.line ?? '', key: true, guess: seal.carries?.guess ?? [], records: seal.carries?.records ?? [], finds };
  const b = S.beatOf(c.story, beat.id)!;
  const viaSeal = b.seal ? S.sealOf(c.story, b.seal) : undefined;
  const guess = [...new Set([...(b.carries?.guess ?? []), ...(viaSeal?.carries?.guess ?? [])])];
  const part = b.carries?.partial && b.carries.seen?.[0] ? { el: b.carries.partial, mark: b.carries.seen[0] } : undefined;
  return { beat: b.id, line: b.line ?? '', key: b.kind === 'stepKey', guess, choice: b.choice, records: [...(b.carries?.records ?? []), ...(viaSeal?.carries?.records ?? [])], finds, ...(part ? { part } : {}) };
}

export function see(facts: Fact[], c: Content, now: Moment): View {
  const day = gameDay(now), nowMs = epochOf(now);
  const capacity = capacityOn(facts, day), size = sizeOn(facts, day);
  const done = doneOn(facts, day), order = orderOn(c, facts, day);
  const slate = order.slice(0, size);
  for (const id of order) if (done.has(id) && !slate.includes(id)) slate.push(id);   /* off-plan counts in full */
  const complete = completedOn(facts, day);
  const underWay = underWayOn(facts, day);
  const seen = new Set(ofType(facts, 'seen').map(f => f.ref));

  let run: RunView | null = null;
  const r = activeRun(facts);
  if (r) {
    const s = runAt(r.plan, r.marks, nowMs), j = jobOf(c, r.fact.job);
    let enoughK: number | null = null;
    if (j.doneBy === 'enough' && !doneOn(facts, r.fact.day).has(j.id)) {
      const before = delveMinutesOn(facts, r.fact.day, j.id) - s.ends.slice(0, r.rewarded).length * r.plan.minutes;
      const k = Math.ceil((enoughOf(j) - before) / r.plan.minutes);
      enoughK = k >= 1 && k <= r.plan.count ? k : null;
    }
    if (s.phase !== 'ended') run = { ...s, seq: r.fact.seq, job: j, minutes: r.plan.minutes, count: r.plan.count, enoughK, startedAt: r.plan.startedAt };
  }

  let runEnd: RunEnd | null = null, runFinds: string[] = [];
  const ends = ofType(facts, 'delveEnded');
  const last = ends[ends.length - 1];
  if (last && !seen.has(last.seq) && !run) {
    const j = jobOf(c, last.job), start = facts.find(f => f.seq === last.run) as FactOf<'delveStarted'> | undefined;
    const doneFact = ofType(facts, 'jobDone').find(f => f.job === j.id && f.day === last.day && f.seq > last.run);
    const completedDay = facts.some(f => f.type === 'dayCompleted' && f.seq > last.run);
    runEnd = { seq: last.seq, job: j, minutes: last.minutes, how: last.how, ask: j.doneBy === 'dan' && !doneOn(facts, last.day).has(j.id),
      enough: j.doneBy === 'enough' && !!doneFact, completedDay, count: start?.count ?? 1 };
    runFinds = ofType(facts, 'findGiven').filter(f => f.seq > last.run && f.seq < last.seq && !f.job).map(f => f.id);
  }

  const arrivals = ofType(facts, 'arrived');
  const unseen = arrivals.find(a => !seen.has(a.seq));
  const arrival = unseen ? arrivalOf(c, facts, unseen) : null;
  const lastArr = arrivals.length ? arrivalOf(c, facts, arrivals[arrivals.length - 1]) : null;

  let next: View['next'] = null;
  if (run?.phase === 'held') next = { job: run.job.id, mode: 'carry' };
  else if (run) next = { job: run.job.id, mode: 'running' };
  else if (underWay) next = { job: underWay, mode: 'underWay' };
  else if (!complete) { const id = slate.find(x => !done.has(x)); if (id) next = { job: id, mode: 'begin' }; }

  /* an arrival not yet seen isn't where Dan stands yet: it is revealed on its own screen */
  const shown = arrival ? facts.filter(f => !(f.type === 'arrived' && f.seq >= arrival.seq)) : facts;
  const st = S.storyState(shown, c.story);
  const places = ofType(shown, 'arrived').filter(a => a.kind === 'place');
  const lastPlace = places.length ? S.beatOf(c.story, places[places.length - 1].id) : undefined;
  const opening = c.story.beats.find(b => b.kind === 'morning' && b.w === 1);
  const stretch = c.story.stretches.find(x => x.id === st.stretch)!;
  const here: Here = lastPlace
    ? { id: lastPlace.id, name: lastPlace.name ?? stretch.name, line: lastPlace.line ?? '', stretch: st.stretch, painting: paintingOf(lastPlace.id, st.stretch) }
    : { id: null, name: stretch.name, line: opening?.line ?? '', stretch: st.stretch, painting: STAND_IN[st.stretch] };
  const w = walked(facts), nextBeat = S.nextPlace(c.story, st), nextAt = nextBeat ? S.nextPlaceAt(st) : null;
  const view = S.inView(c.story, st);
  return {
    day, capacity, suggested: 'normal', size, order, slate, done, underWay, complete, next, run, runEnd, arrival,
    /* ahead: the sealed thing in view; before any, the way in (the first morning), then a line from just ahead */
    here, ahead: view ? view.where : here.id === null ? here.line || S.teaser(c.story, st) : S.teaser(c.story, st), walked: w, toNext: nextAt !== null ? Math.max(0, nextAt - w) : null, nextAt,
    lastArrival: lastArr, story: S.storyState(facts, c.story), teaser: S.teaser(c.story, st), runFinds,
    passage: c.story.passages.find(p => p.id === S.nextPassage(c.story, st))?.line ?? '',
  };
}

/** The run set-up for a job (INTERACTION_NOTES → the morning): a job that takes hours opens set to its enough. */
export function presetRun(j: Job): { minutes: number; count: number } {
  const need = enoughOf(j);
  if (need <= DIAL[0]) return { minutes: DIAL[0], count: 1 };
  for (const m of DIAL.slice(0, 2)) if (need % m === 0) return { minutes: m, count: need / m };
  return { minutes: DIAL[0], count: Math.ceil(need / DIAL[0]) };
}

export { alertsAfter, runAt };
export type { RunPlan, RunMark };
