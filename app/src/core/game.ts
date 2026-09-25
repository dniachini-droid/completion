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
import * as W from './week';
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
  return c.length ? c[c.length - 1].capacity : suggestedOn(facts, day).capacity;
}

/* ---------- bedtime, absence and the suggested day (slice 4; BALANCING §6) ---------- */

/** Bedtime as Dan set it (the camp screen), "23:00" until he changes it. */
export const DEFAULT_BEDTIME = '23:00';
export const bedtimeOf = (facts: Fact[]) => { const b = ofType(facts, 'bedtimeSet'); return b.length ? b[b.length - 1].time : DEFAULT_BEDTIME; };
/** Goodnight within this many minutes after bedtime keeps it, and no earlier than the evening before it (so a Goodnight
    at noon is only a goodnight); this late or later suggests a Low day tomorrow. */
export const BEDTIME_GRACE = 15;
export const BEDTIME_WINDOW = 300;   /* Go to sleep counts from five hours before bedtime (18:00 for 23:00), D-083 */
/** Minutes of distance a night in bed on time gives the next morning: a head start (Dan, D-083). */
export const HEAD_START = 15;
export const LATE_NIGHT = 60;
/** Days without opening that make an absence (BALANCING §6). */
export const ABSENCE_DAYS = 3;

/** Minutes past bedtime on a game day (negative: before it). A bedtime before 04:00 belongs to the night after the day. */
export function pastBedtime(bedtime: string, at: Moment): number {
  const { h, min } = wallClock(at);
  const b = +bedtime.slice(0, 2) * 60 + +bedtime.slice(3, 5);
  const shift = (x: number) => x < 4 * 60 ? x + 24 * 60 : x;
  return shift(h * 60 + min) - shift(b);
}

/** The day before's first opening, if Dan was away ABSENCE_DAYS days or more before this one (the first day back). */
function backFrom(facts: Fact[], day: string): string | null {
  const before = ofType(facts, 'opened').filter(f => f.day < day);
  if (!before.length) return null;
  const last = before[before.length - 1].day;
  return W.daysBetween(last, day) >= ABSENCE_DAYS ? last : null;
}

/**
 * Today's suggested size: Low on the first day back after an absence (D-043 F9); otherwise from last night's bedtime,
 * Low after a late night, else Normal. A guess, never a verdict; one tap changes it (P3). High is never suggested.
 */
export function suggestedOn(facts: Fact[], day: string): { capacity: Capacity; by: 'back' | 'bedtime' | null } {
  if (backFrom(facts, day)) return { capacity: 'low', by: 'back' };
  const night = ofType(facts, 'goodnight').filter(f => f.day === W.addDays(day, -1));
  if (!night.length) return { capacity: 'normal', by: null };
  const late = pastBedtime(bedtimeOf(facts.filter(f => f.seq <= night[0].seq)), night[0].at);
  return { capacity: late >= LATE_NIGHT ? 'low' : 'normal', by: 'bedtime' };
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
/** Whether Dan laid this week out with Plan my week: then Today follows the plan (D-078). */
const planLeads = (facts: Fact[], day: string) => W.planOf(facts, calendarWeek(day)) !== null;
/** How many jobs the plan puts on a day (done as planned, or still to do), when the plan leads; else null. */
function plannedCount(c: Content, facts: Fact[], day: string): number | null {
  if (!planLeads(facts, day)) return null;
  /* a job set aside ("Not today") no longer counts toward the day (review finding, D-080) */
  const aside = asideOn(facts, day);
  return W.weekOf(c, facts, calendarWeek(day), day).days.find(d => d.day === day)!.jobs.filter(j => j.entry && (j.done || !aside.has(j.job))).length;
}
/** The day's size: from capacity; on a planned week, never more than the plan puts on the day (at least one) (D-078). */
function sizeOn(facts: Fact[], day: string, c?: Content) {
  const first = onDay(facts, day).find(f => f.type === 'opened');
  const size = daySize(capacityOn(facts, day), first ? first.at : null);
  const n = c ? plannedCount(c, facts, day) : null;
  /* a High day holds one more than the plan (D-082) */
  return n === null ? size : Math.max(1, Math.min(size, n + (capacityOn(facts, day) === 'high' ? 1 : 0)));
}

const doneOn = (facts: Fact[], day: string) => new Set(ofType(onDay(facts, day), 'jobDone').map(f => f.job));
const completedOn = (facts: Fact[], day: string) => onDay(facts, day).some(f => f.type === 'dayCompleted');
export const delveMinutesOn = (facts: Fact[], day: string, job: string) =>
  ofType(onDay(facts, day), 'stepsGained').filter(f => f.job === job && f.run !== undefined).reduce((a, f) => a + f.minutes, 0);

export const rhythmOf = (c: Content, job: string): Rhythm | undefined => c.rhythms.find(r => r.job === job);
/** Whether a job belongs in today's suggestion at all: a set-day rhythm on its day; a one-off until it's done. */
function offeredOn(c: Content, facts: Fact[], day: string, j: Job, planned: Set<string>): boolean {
  if (planned.has(j.id)) return true;
  if (j.item) return false;   /* a satchel line is offered only once it is planned for the day (TOOLS §2) */
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

/** Today's jobs in order: today's plan first (an appointment as its time nears), then the content's order, rhythms
    already met this week last; changed by Swap. Without a plan, Today works exactly as before (PLANNER.md). */
function orderOn(c: Content, facts: Fact[], day: string, clock: string): string[] {
  const aside = asideOn(facts, day);
  const plan = W.plannedToday(c, facts, day, clock).map(p => p.job).filter(id => !aside.has(id));
  const planned = new Set(plan);
  /* a week laid out with Plan my week: Today is the plan, nothing else slipped in (Dan, D-078); "Something else…" is there */
  /* on a planned week, a job Dan chose himself today (begun, delved on or tapped) joins the list after the plan's (D-080) */
  const chosen = [...new Set(onDay(facts, day).flatMap(f => f.type === 'jobBegun' || f.type === 'delveStarted' || f.type === 'picked' ? [f.job] : []))]
    .filter(id => !planned.has(id) && !aside.has(id) && c.jobs.some(j => j.id === id)).map(id => c.jobs.find(j => j.id === id)!);
  /* a High day adds one job beyond the plan (the next one due), and only one; more is Dan's own choice (Dan, D-082) */
  const off = new Set(ofType(onDay(facts, day), 'jobDone').map(f => f.job).filter(id => !planned.has(id)));
  const extra = planLeads(facts, day) && capacityOn(facts, day) === 'high' && off.size === 0
    ? c.jobs.filter(j => !j.item && !planned.has(j.id) && !aside.has(j.id) && !chosen.includes(j) && offeredOn(c, facts, day, j, planned) && !metThisWeek(c, facts, day, j.id)).slice(0, 1) : [];
  const offered = planLeads(facts, day) ? [...chosen, ...extra] : c.jobs.filter(j => offeredOn(c, facts, day, j, planned) && !planned.has(j.id) && !aside.has(j.id));
  const order = [...plan, ...offered.filter(j => !metThisWeek(c, facts, day, j.id)), ...offered.filter(j => metThisWeek(c, facts, day, j.id))].map(j => typeof j === 'string' ? j : j.id);
  for (const s of ofType(onDay(facts, day), 'swapped')) {
    const a = order.indexOf(s.from), b = order.indexOf(s.to);
    if (a >= 0 && b >= 0) [order[a], order[b]] = [order[b], order[a]];
  }
  return order;
}

/** Jobs taken off today's list ("Not today"), unless begun again after (D-077). Setting aside earns and costs nothing. */
function asideOn(facts: Fact[], day: string): Set<string> {
  const out = new Set<string>();
  for (const f of onDay(facts, day)) {
    if (f.type === 'setAside') out.add(f.job);
    else if (f.type === 'jobBegun' || f.type === 'delveStarted' || f.type === 'picked') out.delete(f.job);
  }
  return out;
}

/** A job begun away from the phone (Begin on a no-timer job) and not yet done today. */
function underWayOn(facts: Fact[], day: string): string | null {
  const done = doneOn(facts, day);
  /* a delve stopped early is not "under way": its job simply stays on the list (review finding, D-080) */
  const delved = new Set(ofType(onDay(facts, day), 'delveStarted').map(f => f.job));
  const begun = ofType(onDay(facts, day), 'jobBegun').filter(f => f.from === 'app' && !delved.has(f.job)).map(f => f.job);
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
  /* a Key kept for later opens what is sealed here, on the arrival itself (D-079) */
  let st = S.storyState(w.all, c.story);
  while (st.held > 0) {
    const seal = S.nextSeal(c.story, st);
    if (!seal || seal.arrival) break;
    w.put({ type: 'keyUsed' }, at, day);
    openSeal(w, c, seal, at, day);
    st = S.storyState(w.all, c.story);
  }
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
  /* nothing sealed where Dan has been: the Key is kept, never lost (D-079) */
  if (!seal) { w.put({ type: 'keyHeld' }, at, day); return null; }
  return openSeal(w, c, seal, at, day, job);
}
function openSeal(w: W, c: Content, seal: Seal, at: Moment, day: string, job?: number): Seal {
  w.put({ type: 'sealOpened', seal: seal.id }, at, day);
  show(w, c, seal.carries?.records, at, day);
  if (seal.arrival) { const b = S.beatOf(c.story, seal.arrival); if (b) arrive(w, c, b, 'key', at, day); }
  else w.put({ type: 'beatPlayed', id: seal.beat ?? seal.id, ...(job ? { job } : {}) }, at, day);
  if (seal.beat) show(w, c, S.beatOf(c.story, seal.beat)?.carries?.records, at, day);
  return seal;
}

/** Places reached on foot in a day that isn’t a deep push: one; the rest of the distance is kept for tomorrow (review, 2026-09-25). */
const FOOT_A_DAY = 1;
function pushOn(facts: Fact[], day: string): boolean {
  const today = onDay(facts, day), dc = today.find(f => f.type === 'dayCompleted');
  return capacityOn(facts, day) === 'high' || today.some(f => f.type === 'deepCalled')
    || (!!dc && today.some(f => f.type === 'stepsGained' && f.seq > dc.seq));   /* Keep going: effort after the day's work */
}

/** After anything that can complete the day or move Dan: day complete, then the places reached (§4; the story job's §0.2). */
function gifts(w: W, c: Content, at: Moment, day: string) {
  storyClock(w, c, at, day);
  /* a deep push (a High day, a called push, or Keep going after the day's work) may go on to next week's places (§0.2) */
  const push = pushOn(w.all, day);
  const reach = () => {
    let n = 0;
    for (;;) {
      const st = S.storyState(w.all, c.story), next = S.nextPlace(c.story, st, push);
      if (!next || walked(w.all) < S.nextPlaceAt(st)) return n;
      /* otherwise one place a day on foot: the rest of the distance is kept, and plays tomorrow (nothing is lost) */
      if (!push && ofType(onDay(w.all, day), 'arrived').filter(a => a.kind === 'place' && a.how !== 'key').length >= FOOT_A_DAY) return n;
      arrive(w, c, next, 'foot', at, day); n++;
    }
  };
  /* a place plays the moment it is reached, not held for day complete (Dan, 2026-09-24, D-073) */
  if (!completedOn(w.all, day)) {
    if (doneOn(w.all, day).size < sizeOn(w.all, day, c)) { reach(); return; }
    w.put({ type: 'dayCompleted' }, at, day);
    const earlier = ofType(onDay(w.all, day), 'arrived').some(a => a.kind === 'place');
    if (reach() === 0 && !earlier) {
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
  /* a rhythm met this week lands a Key, until the week's supply is used; past it, one find a week (§3). A rhythm Dan
     added or changed counts for Keys from its next full period (D-043 F7): the rhythms as they stood when the week began. */
  const r = rhythmOf(W.live(c.base ?? c, w.all, calendarWeek(day)), job);
  let keyed = false;
  if (r && S.sessionsIn(w.all, r, day) === S.needOf(r)) {
    if (S.keysIn(w.all, day) < S.KEYS_A_WEEK) keyed = !!landKey(w, c, r.id, at, day, done.seq);
    else if (!ofType(w.all, 'findGiven').some(f => f.why === 'surplus' && calendarWeek(f.day) === calendarWeek(day))) giveFind(w, c, 'surplus', at, day, done.seq);
  }
  /* the return: the deep push's next beat (once a day) on a High day past a Normal day's size, or once a Normal day's
     jobs are done if Dan called the push in the morning (D-054); else the story's next step; else a line of the passage */
  if (!keyed) {
    const st = S.storyState(w.all, c.story), step = S.nextStep(c.story, st);
    const n = doneOn(w.all, day).size, called = onDay(w.all, day).some(f => f.type === 'deepCalled');
    const deep = capacityOn(w.all, day) === 'high' && (n > DAY_SIZE.normal || (called && n >= DAY_SIZE.normal))
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

/** Finish a run at an instant: every minute counts; a repeating delve at its enough is done. */
function finishRun(w: W, c: Content, r: NonNullable<ReturnType<typeof activeRun>>, atMs: number, at: Moment) {
  const s = runAt(r.plan, r.marks, atMs), rday = r.fact.day, j = jobOf(c, r.fact.job);
  const part = s.phase === 'delve' || s.phase === 'held' ? Math.floor(s.doneMs / MIN) : 0;
  const counted = s.ends.length * r.plan.minutes + part;
  if (part > 0) w.put({ type: 'stepsGained', minutes: part, job: j.id, run: r.fact.seq }, at, rday);
  w.put({ type: 'delveEnded', job: j.id, minutes: counted, how: 'finishedHere', run: r.fact.seq }, at, rday);
  if (reachesEnough(w.all, rday, j)) markDoneIn(w, c, j.id, at, rday);
  else gifts(w, c, at, rday);
}
/** A delve left stepped-away this long ends by itself where it was paused (review finding, D-080). */
export const HOLD_MAX = 3 * 60 * MIN;

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
  /* stepped away and never back: after three hours, or once its day is over, it finishes where it was paused, on its day */
  const hold = r.marks[r.marks.length - 1];
  if (s.phase === 'held' && hold?.kind === 'hold' && (nowMs - hold.at > HOLD_MAX || gameDay(momentOf(nowMs, w.off)) !== r.fact.day)) {
    finishRun(w, c, activeRun(w.all)!, hold.at, momentOf(hold.at, w.off));
    return;
  }
  if (s.phase === 'ended' && s.how === 'ranOut') {
    w.put({ type: 'delveEnded', job: j.id, minutes: Math.round(s.countedMs / MIN), how: 'ranOut', run: r.fact.seq }, momentOf(s.endedAt!, w.off), day);
  }
}

/* ---------- the week close, the morning after camp, the welcome back (slice 4) ---------- */

/** The week of play a calendar week is (1 = the week of the first opening). */
function playWeek(facts: Fact[], week: string): number {
  const first = facts.find(f => f.type === 'opened');
  return first ? Math.round(W.daysBetween(calendarWeek(first.day), week) / 7) + 1 : 1;
}

/**
 * The daybook's page for each calendar week that had anything done, written once at the first opening after the week
 * (TOOLS §6; BALANCING §7): up to three things learned, the month's "so far" on the first close of each month of play
 * (weeks 1 and 5), the story week's glimpse, and the sealed things the weekly floor opened. A week with nothing done
 * gets no page, and no gap is marked (D-043). What the real week held is read from the log when the page is shown.
 */
function weekClose(w: W, c: Content, at: Moment, day: string, storyWeek: number) {
  const closed = new Set(ofType(w.all, 'weekClosed').map(f => f.week));
  const weeks = [...new Set(ofType(w.all, 'jobDone').map(f => calendarWeek(f.day)))].filter(x => x < calendarWeek(day) && !closed.has(x)).sort();
  for (const wk of weeks) {
    const st = S.storyState(w.all, c.story);
    const before = new Set(ofType(w.all, 'weekClosed').flatMap(f => f.learned));
    const learned = c.story.learned.filter(l => l.w <= storyWeek && !before.has(l.id) && l.req.every(r => S.met(st, r))).slice(0, 3).map(l => l.id);
    const n = playWeek(w.all, wk);
    const month = n === 1 ? c.story.soFar[0] : n === 5 ? c.story.soFar[1] : undefined;
    const soFar = (month?.items ?? []).filter(l => l.req.every(r => S.met(st, r))).slice(0, 5).map(l => l.id);
    /* the glimpse waits until Dan has been where it looks (D-079): a later week's close shows it then */
    const glimpse = c.story.beats.find(b => b.kind === 'close' && b.w <= storyWeek && !st.played.has(b.id) && st.visited.has(b.stretch)
      && !(b.until && S.met(st, b.until))) ?? null;
    if (glimpse) w.put({ type: 'beatPlayed', id: glimpse.id }, at, day);
    const seals = ofType(w.all, 'keyEarned').filter(k => k.rhythm === `floor:${wk}`)
      .map(k => w.all.find(f => f.seq === k.seq + 1)).filter((f): f is FactOf<'sealOpened'> => f?.type === 'sealOpened').map(f => f.seal);
    w.put({ type: 'weekClosed', week: wk, n, learned, soFar, glimpse: glimpse?.id ?? null, seals }, at, day);
  }
}

/**
 * The morning (CORE_LOOPS → evening close). A story week's morning that confirms marks (`b-wN.morning`, D-070) plays on
 * the first morning after those marks were offered, bedtime kept or not: the truth never waits on bedtime, and never
 * comes before the guess (D-073). A kept bedtime brings something small besides: the camp line's own morning if it
 * confirms nothing, and always a find, so what waits is always something to look at.
 */
function morningAfter(w: W, c: Content, at: Moment, day: string) {
  const st = S.storyState(w.all, c.story), before = S.storyState(w.all.filter(f => f.day < day), c.story);
  const confirms = (id: string) => c.story.marks.filter(m => m.confirmedBy === id);
  for (const b of c.story.beats.filter(x => x.kind === 'camp')) {
    const id = b.id.replace(/\.camp$/, '.morning'), ms = confirms(id);
    if (ms.length && !st.played.has(id) && ms.every(m => before.offered.has(m.id))) w.put({ type: 'beatPlayed', id }, at, day);
  }
  const nights = ofType(w.all, 'goodnight').filter(f => f.day < day && f.kept);
  const night = nights[nights.length - 1];
  if (!night || w.all.some(f => f.seq > night.seq && f.type === 'findGiven' && f.why === 'morning')) return;
  /* in bed on time: the day begins a little further in (Dan, D-083); once per night, with the morning's find */
  w.put({ type: 'stepsGained', minutes: HEAD_START, job: 'sleep' }, at, day);
  gifts(w, c, at, day);
  const camp = w.all.find(f => f.seq > night.seq && f.type === 'beatPlayed' && f.id.endsWith('.camp')) as FactOf<'beatPlayed'> | undefined;
  if (camp && camp.day === night.day) {
    const id = camp.id.replace(/\.camp$/, '.morning');
    if (!confirms(id).length && !S.storyState(w.all, c.story).played.has(id)) w.put({ type: 'beatPlayed', id }, at, day);
  }
  giveFind(w, c, 'morning', at, day);
}

/** The first opening after an absence: "where you were", with the one open question for the story week (BALANCING §7). */
function welcomeBack(w: W, c: Content, at: Moment, day: string) {
  const since = backFrom(w.all, day);
  if (!since || onDay(w.all, day).some(f => f.type === 'welcomed')) return;
  const st = S.storyState(w.all, c.story);
  const qs = c.story.openQuestions.filter(q => q.w <= st.week && (q.req ?? []).every(r => S.met(st, r)) && !(q.until && S.met(st, q.until)));
  w.put({ type: 'welcomed', since, question: qs.length ? qs[qs.length - 1].id : null }, at, day);
}

/* ---------- commands: Dan's actions ---------- */

export type Command =
  | { do: 'open' }
  | { do: 'capacity'; capacity: Capacity }
  | { do: 'swap' }
  | { do: 'focus'; job: string }
  | { do: 'setAside'; job: string }
  | { do: 'begin'; job: string }
  | { do: 'startRun'; job: string; minutes: number; count: number }
  | { do: 'skipBreather' }
  | { do: 'stepAway' }
  | { do: 'resume' }
  | { do: 'finishHere' }
  | { do: 'done'; job: string }
  | { do: 'cantStart'; job: string }
  | { do: 'seen'; what: 'step' | 'arrival' | 'morning' | 'welcome'; ref: number }
  | { do: 'guess'; mark: string; guess: string }
  | { do: 'choose'; beat: string; pick: number }
  | { do: 'read'; record: string }
  /* slice 4 */
  | { do: 'saveRhythm'; rhythm: Rhythm; job: Job }
  | { do: 'stopRhythm'; id: string }
  | { do: 'addItems'; lines: string[] }
  | { do: 'tick'; id: string }
  | { do: 'dropItem'; id: string }
  | { do: 'planWeek'; week: string }
  | { do: 'movePlan'; entry: string; day: string | null; time?: string | null }
  | { do: 'planJob'; job: string; day: string; time?: string }
  | { do: 'addToWeek'; line: string; day: string; time?: string }
  | { do: 'bedtime'; time: string }
  | { do: 'goodnight' }
  | { do: 'callDeep' }
  | { do: 'closeRead'; week: string }
  | { do: 'offerAnswered'; week: string };

/** The facts a command adds to the log (including anything the clock made due first). */
export function act(facts: Fact[], base: Content, cmd: Command, now: Moment): Fact[] {
  const w = writer(facts, now), nowMs = epochOf(now), c = W.live(base, facts);
  settleIn(w, c, nowMs);
  const day = gameDay(now), v = see(w.all, c, now);
  switch (cmd.do) {
    case 'open': {
      const was = S.storyState(w.all, c.story).week, first = !onDay(w.all, day).some(f => f.type === 'opened');
      w.put({ type: 'opened' });
      if (first) welcomeBack(w, c, now, day);
      /* a week with no plan yet is laid out at its first opening, from today on, so the Week and Today always agree;
         Dan changes it as he likes (Dan, D-078; review finding, D-080) */
      if (W.planOf(w.all, calendarWeek(day)) === null) w.put({ type: 'planMade', week: calendarWeek(day), entries: W.planWeek(c, w.all, calendarWeek(day), day) });
      storyClock(w, c, now, day); floor(w, c, now, day);
      weekClose(w, c, now, day, was);
      morningAfter(w, c, now, day);
      break;
    }
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
      /* a tap on a job makes it the next one; after the day's work, too (D-077) */
      if (v.run || v.done.has(cmd.job) || v.next?.job === cmd.job) break;
      if (v.next?.mode === 'begin' && !v.complete) w.put({ type: 'swapped', from: v.next.job, to: cmd.job });
      else if (v.complete || !v.next) w.put({ type: 'picked', job: cmd.job });
      break;
    case 'setAside':
      /* "Not today": off today's list, with no mark against it; the next job in order takes its place (D-077) */
      if ((v.order.includes(cmd.job) || v.next?.job === cmd.job) && !v.done.has(cmd.job) && v.run?.job.id !== cmd.job && v.underWay !== cmd.job) w.put({ type: 'setAside', job: cmd.job });
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
      if (r) finishRun(w, c, r, nowMs, now);
      break;
    }
    case 'done':
      if (v.done.has(cmd.job)) break;
      /* Done with no Begin: recorded afterwards (the test's sharpest line, MVP.md) */
      if (!ofType(onDay(w.all, day), 'jobBegun').some(f => f.job === cmd.job)) w.put({ type: 'jobBegun', job: cmd.job, from: 'record' });
      markDoneIn(w, c, cmd.job, now, day);
      break;
    case 'cantStart': w.put({ type: 'cantStartUsed', job: cmd.job }); break;
    /* Dan's own rhythms and lines: editing earns nothing and loses nothing (P16, D-038) */
    case 'saveRhythm': if (cmd.job.name.trim()) w.put({ type: 'rhythmSaved', rhythm: { ...cmd.rhythm, job: cmd.job.id }, job: { ...cmd.job, name: cmd.job.name.trim() } }); break;
    case 'stopRhythm': if (c.rhythms.some(r => r.id === cmd.id)) w.put({ type: 'rhythmStopped', id: cmd.id }); break;
    case 'addItems': {
      let k = ofType(w.all, 'itemAdded').length;
      for (const line of cmd.lines.map(x => x.replace(/^[-*•\s]+/, '').trim()).filter(Boolean)) w.put({ type: 'itemAdded', id: `it-${++k}`, name: line.slice(0, 120) });
      break;
    }
    case 'tick': {
      const it = W.items(w.all, day).find(x => x.id === cmd.id);
      if (!it || it.done) break;
      /* a line moves the expedition only as one of today's main jobs (TOOLS §2, P5); otherwise ticking just feels good */
      if (v.slate.includes(cmd.id)) {
        if (!ofType(onDay(w.all, day), 'jobBegun').some(f => f.job === cmd.id)) w.put({ type: 'jobBegun', job: cmd.id, from: 'record' });
        markDoneIn(w, c, cmd.id, now, day);
      } else w.put({ type: 'itemTicked', id: cmd.id });
      break;
    }
    case 'dropItem': if (W.items(w.all, day).some(x => x.id === cmd.id)) w.put({ type: 'itemDropped', id: cmd.id }); break;
    case 'planWeek': w.put({ type: 'planMade', week: cmd.week, entries: W.planWeek(c, w.all, cmd.week, day) }); break;
    case 'movePlan': w.put({ type: 'planChanged', entry: cmd.entry, day: cmd.day, ...(cmd.time !== undefined ? { time: cmd.time } : {}) }); break;
    case 'planJob': {
      if (!c.jobs.some(j => j.id === cmd.job)) break;
      const n = ofType(w.all, 'planAdded').length + 1;
      w.put({ type: 'planAdded', entry: { id: `pa-${n}`, job: cmd.job, day: cmd.day, ...(cmd.time ? { time: cmd.time } : {}) } });
      break;
    }
    case 'addToWeek': {
      const name = cmd.line.trim().slice(0, 120);
      if (!name) break;
      const id = `it-${ofType(w.all, 'itemAdded').length + 1}`, n = ofType(w.all, 'planAdded').length + 1;
      w.put({ type: 'itemAdded', id, name });
      w.put({ type: 'planAdded', entry: { id: `pa-${n}`, job: id, day: cmd.day, ...(cmd.time ? { time: cmd.time } : {}) } });
      break;
    }
    case 'bedtime': if (/^\d\d:\d\d$/.test(cmd.time)) w.put({ type: 'bedtimeSet', time: cmd.time }); break;
    case 'goodnight': {
      if (ofType(onDay(w.all, day), 'goodnight').length) break;
      const past = pastBedtime(bedtimeOf(w.all), now), kept = past <= BEDTIME_GRACE && past >= -BEDTIME_WINDOW;
      w.put({ type: 'goodnight', kept });
      /* kept: the story week's camp line plays tonight, once a week; its morning waits for tomorrow */
      if (kept) {
        const st = S.storyState(w.all, c.story);
        /* never before what it describes, nor after it has changed (review, 2026-09-25) */
        const camp = c.story.beats.find(b => b.kind === 'camp' && b.w === st.week && !st.played.has(b.id)
          && b.req.every(r => S.met(st, r)) && !(b.until && S.met(st, b.until)));
        if (camp) w.put({ type: 'beatPlayed', id: camp.id });
      }
      break;
    }
    case 'callDeep':
      if (!v.deepOffer) break;
      if (v.capacity !== 'high') w.put({ type: 'capacityChosen', capacity: 'high', suggested: v.suggested });
      w.put({ type: 'deepCalled' });
      break;
    case 'closeRead': if (!ofType(w.all, 'closeRead').some(f => f.week === cmd.week)) w.put({ type: 'closeRead', week: cmd.week }); break;
    case 'offerAnswered': if (!ofType(w.all, 'offerAnswered').some(f => f.week === cmd.week)) w.put({ type: 'offerAnswered', week: cmd.week }); break;
    case 'seen': w.put({ type: 'seen', what: cmd.what, ref: cmd.ref }); break;
  }
  return w.out;
}

/** Facts the clock alone has made due (call on open and while a run is on screen). */
export function settle(facts: Fact[], c: Content, now: Moment): Fact[] {
  const w = writer(facts, now);
  /* Dan's own jobs too (a satchel line or a job he added can be the one delved on) */
  settleIn(w, W.live(c.base ?? c, facts), epochOf(now));
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
  /** What a Key kept for this place opened on arriving (its line), if anything (D-079). */
  opened: string[];
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
  /* slice 4: the week and the gaps */
  /** Why today's size is suggested as it is: last night's bedtime, or the first day back. */
  suggestedBy: 'bedtime' | 'back' | null;
  bedtime: string;
  /** Tonight's goodnight, once said: kept or not, and the camp line it played. */
  night: { kept: boolean; beat: string | null } | null;
  /** Something waiting in the morning, not yet looked at. */
  morning: { seq: number; beat: string | null; find: string | null } | null;
  /** Back after days away, not yet looked at: "where you were". */
  welcome: { seq: number; question: string | null; record: string | null } | null;
  /** The daybook's newest page, not yet read. */
  close: FactOf<'weekClosed'> | null;
  /** A High day's morning: the deep push may be called (D-054). */
  deepOffer: boolean;
  deepCalled: boolean;
  /** Today's planned appointments (job → time). */
  times: Record<string, string>;
  /** Where the plan points: the day each next place would be reached (a forecast, never a promise). */
  forecast: string[];
  /** Dan's own data as it stands (his edits applied). */
  content: Content;
}

/** The stand-in painting for a place until its own is painted from its brief (PROTOTYPE_NOTES.md). */
export const STAND_IN: Record<StretchId, string> = {
  'st-mouth': 'sample-well-stair', 'st-hall': 'sample-rib-gallery', 'st-salt': 'sample-pool-dome', 'st-camp': 'sample-rib-gallery',
  'st-stair': 'sample-well-stair', 'st-flight2': 'sample-well-stair', 'st-square': 'sample-rib-gallery',
};
/** The places painted from their briefs so far (ids only; D-015): each shows its own painting, `pt-<id>`, which
    ui/paintings.ts carries (a test keeps the two in step); every other place shows its stretch's stand-in. */
export const PAINTED: ReadonlySet<string> = new Set<string>(['b-1.A', 'b-1.B', 'b-1.C', 'b-2.A', 'pl-w2-smooth-place', 'pl-w1-pick-niche', 'b-5.A', 'pl-w5-ledge-lip', 'pl-w5-second-landing', 'b-7.A', 'b-7.B', 'pl-w6-square-gallery', 'b-6.B', 'pl-w6-folder', 'cv-02', 'cv-10', 'cv-11', 'cv-12', 'cv-13', 'cv-14', 'pl-w5-worn-steps', 'b-5.B', 'b-7.C', 'cv-15', 'cv-03', 'cv-04', 'cv-05', 'cv-07', 'cv-08', 'cv-09', 'pl-w2-above-the-ring', 'pl-w2-box-by-the-cot', 'b-3.A', 'b-3.B', 'b-3.C', 'b-4.A', 'b-4.B', 'b-2.B', 'pl-w1-below-the-lamp', 'pl-w3-far-end', 'cv-06']);
export const paintingOf = (id: string | null, stretch: StretchId): string => id && PAINTED.has(id) ? `pt-${id}` : STAND_IN[stretch];

/** The place a job's Done reached, if its return and the arrival came together: only the world's answers between. */
const ANSWERS = new Set(['stepsGained', 'dayCompleted', 'keyEarned', 'sealOpened', 'recordShown', 'findGiven', 'beatPlayed', 'storyWeekBegan']);
function reachedBy(all: Fact[], doneSeq: number): FactOf<'arrived'> | null {
  for (const f of all) {
    if (f.seq <= doneSeq) continue;
    if (f.type === 'arrived') return f.kind === 'place' ? f : null;
    if (!ANSWERS.has(f.type)) return null;
  }
  return null;
}

function arrivalOf(c: Content, all: Fact[], f: FactOf<'arrived'>): Arrival {
  /* one of the places played at day complete: nothing but the world's answers between the lock-in and it */
  const dc = all.find(g => g.type === 'dayCompleted' && g.day === f.day && g.seq < f.seq);
  const quiet = new Set(['arrived', 'recordShown', 'findGiven', 'sealOpened', 'keyEarned', 'beatPlayed', 'storyWeekBegan']);
  const completedDay = !!dc && all.every(g => g.seq <= dc.seq || g.seq >= f.seq || quiet.has(g.type));
  if (f.kind === 'place') {
    const b = S.beatOf(c.story, f.id)!;
    /* the guess the same job's return brought is asked here, after the marks have been seen, not before (D-077),
       when this place's own records carry the mark (handedOn) */
    const by = ofType(all, 'jobDone').filter(d => d.seq < f.seq).pop();
    const carried = by && reachedBy(all, by.seq)?.seq === f.seq ? handedOn(c, all, by.seq) : [];
    const opened: string[] = [], keyed: string[] = [];
    for (const g of all) {
      if (g.seq <= f.seq) continue;
      if (g.type !== 'keyUsed' && !ANSWERS.has(g.type)) break;
      if (g.type === 'sealOpened' && all.some(k => k.type === 'keyUsed' && k.seq === g.seq - 1)) {
        const x = S.sealOf(c.story, g.seal), line = x?.beat ? S.beatOf(c.story, x.beat)?.line : x?.line;
        if (line) opened.push(line);
        /* a tablet a kept Key opened here asks its marks here, where it is read (it has no return screen of its own) */
        keyed.push(...(x?.carries?.guess ?? []), ...(x?.beat ? S.beatOf(c.story, x.beat)?.carries?.guess ?? [] : []));
      }
    }
    const guess = [...new Set([...(b.carries?.guess ?? []), ...carried, ...keyed])].filter(m => S.markOf(c.story, m)?.confirmedBy !== b.id);
    return { seq: f.seq, kind: 'place', opened, id: b.id, name: b.name ?? '', line: b.line ?? '', taps: b.taps, choice: b.choice,
      records: b.carries?.records ?? [], guess, look: null, stretch: b.stretch, painting: paintingOf(b.id, b.stretch), completedDay, byKey: f.how === 'key' };
  }
  const k = c.story.camps.find(x => x.id === f.id)!;
  const find = all.find(g => g.type === 'findGiven' && g.why === 'camp' && g.seq > f.seq && g.seq <= f.seq + 1) as FactOf<'findGiven'> | undefined;
  const look = find ? c.story.finds.find(x => x.id === find.id)?.line ?? null : 'line' in k.look ? k.look.line : null;
  return { seq: f.seq, kind: 'camp', opened: [], id: k.id, name: k.name, line: k.line, records: [], guess: [], look, stretch: k.stretch, painting: paintingOf(k.id, k.stretch), completedDay, byKey: false };
}

/** What a job's return (a jobDone fact) shows. A guess it brings moves to the place the same job reached (D-077). */
export function returnOf(c: Content, facts: Fact[], doneSeq: number): Return {
  const r = rawReturn(c, facts, doneSeq), moved = handedOn(c, facts, doneSeq);
  return moved.length ? { ...r, guess: r.guess.filter(m => !moved.includes(m)) } : r;
}
/** The guesses a job's return hands on to the place the same job reached: only marks that place's own records carry,
    and never to the place that confirms them (a guess is never asked on the screen that answers it). The rest stay on
    the return, before the arrival (review of D-077). */
function handedOn(c: Content, facts: Fact[], doneSeq: number): string[] {
  const a = reachedBy(facts, doneSeq);
  if (!a) return [];
  const here = S.marksIn(c.story, S.beatOf(c.story, a.id)?.carries?.records ?? []);
  return rawReturn(c, facts, doneSeq).guess.filter(m => here.includes(m) && S.markOf(c.story, m)?.confirmedBy !== a.id);
}
function rawReturn(c: Content, facts: Fact[], doneSeq: number): Return {
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

export function see(facts: Fact[], base: Content, now: Moment): View {
  const c = W.live(base, facts);
  const day = gameDay(now), nowMs = epochOf(now), clock = now.slice(11, 16);
  const capacity = capacityOn(facts, day), size = sizeOn(facts, day, c);
  const done = doneOn(facts, day), order = orderOn(c, facts, day, clock);
  /* an appointment planned for today stays on the slate whatever the day's size (P10); the rest fill it in order */
  const planned = W.plannedToday(c, facts, day, clock);
  const times: Record<string, string> = {};
  for (const p of planned) if (p.time) times[p.job] = p.time;
  /* on a planned week Today shows every job planned for the day, as the Week does; capacity only sets how many make
     the day complete (review finding, D-080). Without a plan, capacity sizes the list as before. */
  const slate = planLeads(facts, day) ? order.slice() : order.slice(0, size);
  for (const id of Object.keys(times)) {
    if (slate.includes(id)) continue;
    let k = slate.length - 1;
    while (k >= 0 && (times[slate[k]] || done.has(slate[k]))) k--;
    if (k >= 0) slate.splice(k, 1);
    slate.push(id);
  }
  slate.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  for (const id of order) if (done.has(id) && !slate.includes(id)) slate.push(id);   /* off-plan counts in full */
  for (const id of done) if (!slate.includes(id)) slate.push(id);   /* so does something chosen from outside the list (D-077) */
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
  if (!next) {
    /* after the day's work (or with today's list cleared), the job Dan tapped, until it is done or set aside (D-077) */
    const aside = asideOn(facts, day), picks = ofType(onDay(facts, day), 'picked').map(f => f.job).filter(id => !done.has(id) && !aside.has(id));
    if (picks.length) next = { job: picks[picks.length - 1], mode: 'begin' };
  }

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
  const w = walked(facts), nextBeat = S.nextPlace(c.story, st, pushOn(facts, day)), nextAt = nextBeat ? S.nextPlaceAt(st) : null;
  const view = S.inView(c.story, st);

  /* slice 4: tonight, the morning after, the welcome back, the daybook's new page, the deep push */
  const sugg = suggestedOn(facts, day);
  const gn = ofType(onDay(facts, day), 'goodnight')[0];
  const campLine = gn ? facts.find(f => f.seq > gn.seq && f.type === 'beatPlayed' && f.id.endsWith('.camp') && f.day === day) as FactOf<'beatPlayed'> | undefined : undefined;
  const mf = facts.filter(f => (f.type === 'beatPlayed' && f.id.endsWith('.morning')) || (f.type === 'findGiven' && f.why === 'morning'));
  const mLast = mf[mf.length - 1];
  let morning: View['morning'] = null;
  if (mLast && !seen.has(mLast.seq)) {
    const group = mf.filter(f => f.day === mLast.day && f.seq >= mLast.seq - 1);
    const beat = group.find(f => f.type === 'beatPlayed') as FactOf<'beatPlayed'> | undefined, find = group.find(f => f.type === 'findGiven') as FactOf<'findGiven'> | undefined;
    morning = { seq: mLast.seq, beat: beat?.id ?? null, find: find?.id ?? null };
  }
  const wf = ofType(facts, 'welcomed').filter(f => f.day === day && !seen.has(f.seq))[0];
  const welcome = wf ? { seq: wf.seq, question: wf.question, record: st.records.length ? st.records[st.records.length - 1] : null } : null;
  const closes = ofType(facts, 'weekClosed'), lastClose = closes[closes.length - 1];
  const close = lastClose && !ofType(facts, 'closeRead').some(f => f.week === lastClose.week) ? lastClose : null;
  const deepCalled = onDay(facts, day).some(f => f.type === 'deepCalled');
  const deepToday = ofType(onDay(facts, day), 'beatPlayed').some(f => S.beatOf(c.story, f.id)?.kind === 'deep');
  const deepOffer = capacity === 'high' && !deepCalled && !deepToday && !complete && done.size < DAY_SIZE.normal && !!S.nextDeep(c.story, st);
  const toNext = nextAt !== null ? Math.max(0, nextAt - w) : null;

  return {
    suggestedBy: sugg.by, bedtime: bedtimeOf(facts), night: gn ? { kept: gn.kept, beat: campLine?.id ?? null } : null,
    morning, welcome, close, deepOffer, deepCalled, times, content: c,
    forecast: W.forecast(c, facts, day, toNext, S.PLACE_GAP),
    day, capacity, suggested: sugg.capacity, size, order, slate, done, underWay, complete, next, run, runEnd, arrival,
    /* ahead: the sealed thing in view; before any, the way in (the first morning), then a line from just ahead */
    here, ahead: view ? view.where : here.id === null ? here.line || S.teaser(c.story, st) : S.teaser(c.story, st), walked: w, toNext, nextAt,
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
