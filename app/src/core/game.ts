/**
 * The heart (MVP.md → build order, slice 1): Today, capacity, Begin, the delve and runs, Done, the step,
 * day complete, the arrival. Pure: facts + content + the clock in, new facts or a view out.
 *
 * Commands return the facts to append. Anything the clock has made due (a delve that ran out while the
 * phone was locked) is settled first, stamped with the moment it really happened. The world's gifts
 * (steps, day complete, arrivals) are worked out once, when they happen, and kept as facts (rule 9, rule 18).
 */
import { epochOf, gameDay, momentOf, offsetOf, wallClock, type Moment } from './time';
import { runAt, alertsAfter, type RunMark, type RunNow, type RunPlan } from './run';
import type { Capacity, Content, Fact, FactBody, FactOf, Job, Place } from './types';

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

/** Today's jobs in order: the content's order, changed by Swap. */
function orderOn(c: Content, facts: Fact[], day: string): string[] {
  const order = c.jobs.map(j => j.id);
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
const placesReached = (facts: Fact[]) => ofType(facts, 'arrived').filter(a => a.kind === 'place').map(a => a.id);

/** Where Dan stands: the last named place he arrived at, or the start. */
export function herePlace(c: Content, facts: Fact[]): Place {
  const ids = placesReached(facts);
  return c.route.find(p => p.id === ids[ids.length - 1]) ?? c.route[0];
}
/** The next named place along the route, if the content has one. */
export function nextPlace(c: Content, facts: Fact[]): Place | null {
  const here = herePlace(c, facts);
  return c.route[c.route.indexOf(here) + 1] ?? null;
}

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

/** After anything that can complete the day or move Dan: day complete, then the arrival (§4). */
function gifts(w: W, c: Content, at: Moment, day: string) {
  const next = nextPlace(c, w.all);
  if (!completedOn(w.all, day)) {
    if (doneOn(w.all, day).size < sizeOn(w.all, day)) return;
    w.put({ type: 'dayCompleted' }, at, day);
    if (next && walked(w.all) >= next.at) w.put({ type: 'arrived', kind: 'place', id: next.id }, at, day);
    else {
      const n = ofType(w.all, 'arrived').filter(a => a.kind === 'camp').length;
      w.put({ type: 'arrived', kind: 'camp', id: c.camps[n % c.camps.length].id }, at, day);
    }
  } else if (next && walked(w.all) >= next.at) {
    /* after day complete, Keep going still arrives somewhere (no dead ends for effort, D-039) */
    w.put({ type: 'arrived', kind: 'place', id: next.id }, at, day);
  }
}

function markDoneIn(w: W, c: Content, job: string, at: Moment, day: string) {
  if (doneOn(w.all, day).has(job)) return;
  const j = jobOf(c, job), timed = delveMinutesOn(w.all, day, job);
  /* a delve's minutes have already moved Dan; a job without them earns its usual length (§1) */
  const minutes = timed > 0 ? timed : enoughOf(j);
  w.put({ type: 'jobDone', job, minutes }, at, day);
  if (timed === 0) w.put({ type: 'stepsGained', minutes, job }, at, day);
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
  for (const e of s.ends.slice(r.rewarded)) {
    const at = momentOf(e.at, w.off);
    w.put({ type: 'stepsGained', minutes: r.plan.minutes, job: j.id, run: r.fact.seq }, at, day);
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
  | { do: 'seen'; what: 'step' | 'arrival'; ref: number };

/** The facts a command adds to the log (including anything the clock made due first). */
export function act(facts: Fact[], c: Content, cmd: Command, now: Moment): Fact[] {
  const w = writer(facts, now), nowMs = epochOf(now);
  settleIn(w, c, nowMs);
  const day = gameDay(now), v = see(w.all, c, now);
  switch (cmd.do) {
    case 'open': w.put({ type: 'opened' }); break;
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
export interface Arrival { seq: number; kind: 'place' | 'camp'; place?: Place; name: string; line: string; first: boolean; completedDay: boolean; }

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
  here: Place;
  ahead: Place | null;
  walked: number;
  /** Minutes of effort from here to the next named place (never shown as a number of steps owed). */
  toNext: number | null;
  passage: string;
  lastArrival: Arrival | null;
}

function arrivalOf(c: Content, all: Fact[], f: FactOf<'arrived'>): Arrival {
  const completedDay = all.some(g => g.type === 'dayCompleted' && g.seq === f.seq - 1);
  if (f.kind === 'place') {
    const p = c.route.find(r => r.id === f.id)!;
    return { seq: f.seq, kind: 'place', place: p, name: p.name, line: p.line, first: true, completedDay };
  }
  const k = c.camps.find(x => x.id === f.id)!;
  return { seq: f.seq, kind: 'camp', name: k.name, line: k.look, first: false, completedDay };
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

  let runEnd: RunEnd | null = null;
  const ends = ofType(facts, 'delveEnded');
  const last = ends[ends.length - 1];
  if (last && !seen.has(last.seq) && !run) {
    const j = jobOf(c, last.job), start = facts.find(f => f.seq === last.run) as FactOf<'delveStarted'> | undefined;
    const doneFact = ofType(facts, 'jobDone').find(f => f.job === j.id && f.day === last.day && f.seq > last.run);
    const completedDay = facts.some(f => f.type === 'dayCompleted' && f.seq > last.run);
    runEnd = { seq: last.seq, job: j, minutes: last.minutes, how: last.how, ask: j.doneBy === 'dan' && !doneOn(facts, last.day).has(j.id),
      enough: j.doneBy === 'enough' && !!doneFact, completedDay, count: start?.count ?? 1 };
  }

  const arrivals = ofType(facts, 'arrived');
  const lastArr = arrivals.length ? arrivalOf(c, facts, arrivals[arrivals.length - 1]) : null;
  const arrival = lastArr && !seen.has(lastArr.seq) ? lastArr : null;

  let next: View['next'] = null;
  if (run?.phase === 'held') next = { job: run.job.id, mode: 'carry' };
  else if (run) next = { job: run.job.id, mode: 'running' };
  else if (underWay) next = { job: underWay, mode: 'underWay' };
  else if (!complete) { const id = slate.find(x => !done.has(x)); if (id) next = { job: id, mode: 'begin' }; }

  /* an arrival not yet seen isn't where Dan stands yet: it is revealed on its own screen */
  const shown = arrival ? facts.filter(f => f.seq !== arrival.seq) : facts;
  const here = herePlace(c, shown), ahead = nextPlace(c, shown), w = walked(facts);
  const steps = ofType(facts, 'stepsGained').length;
  return {
    day, capacity, suggested: 'normal', size, order, slate, done, underWay, complete, next, run, runEnd, arrival,
    here, ahead, walked: w, toNext: ahead ? Math.max(0, ahead.at - w) : null,
    passage: c.passages[Math.max(0, steps - 1) % c.passages.length], lastArrival: lastArr,
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
