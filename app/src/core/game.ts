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
import { dayOf, ofType, onDay } from './facts';
import type { CalEvent, Capacity, Content, Fact, FactBody, FactOf, Job, Rhythm } from './types';
import * as S from './story';
import * as W from './week';
import * as R from './reminders';
import * as Rep from './repeat';
import { doneFacts, undoneFacts } from './done';
import { cleanLine, tieFor } from './remember';
import type { Beat, Seal, StretchId } from './story-types';

export const STEP_MIN = 25;
/** "How long did it take?" for a job ticked off without a delve, in minutes (Dan, D-134). */
export const TICK_CHOICES = [5, 10, 15, 30, 45, 60, 90, 120, 180] as const;                                   /* BALANCING §1 */
export const DAY_SIZE: Record<Capacity, number> = { low: 2, normal: 3, high: 5 };   /* §6 */
export const DIAL = [5, 10, 15, 25, 30, 45, 60, 90] as const;   /* the dial's stops (D-033; 5–15 and 90, D-110) */
const MIN = 60_000;
/** The errand run (Dan, D-139): several jobs in one delve. Its run is on this job, which is no job of Dan's. */
export const ERRAND_RUN = 'errand-run';
/** How many errands one run can hold (two at least: one is a delve on that job). */
export const ERRANDS_MIN = 2, ERRANDS_MAX = 12;

/* ---------- reading the log ---------- */

const jobOf = (c: Content, id: string): Job => c.jobs.find(j => j.id === id)
  ?? (id === ERRAND_RUN ? { id, name: 'Errand run', delve: true, length: PRESET.minutes, doneBy: 'dan' } : { id, name: id, delve: false, length: STEP_MIN, doneBy: 'dan' });

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
    else if (m.type === 'delveHeld') marks.push({ kind: 'hold', at: m.from ?? epochOf(m.at) });
    else if (m.type === 'delveResumed') marks.push({ kind: 'resume', at: epochOf(m.at) });
  }
  const rewarded = facts.slice(start + 1).filter(g => g.type === 'stepsGained' && g.run === f.seq).length;
  /* an errand run's errands struck off so far (D-139): each tap strikes one off, or back */
  const struck = new Set<string>();
  for (const g of facts.slice(start + 1)) if (g.type === 'errandStruck' && g.run === f.seq) { if (struck.has(g.job)) struck.delete(g.job); else struck.add(g.job); }
  return { fact: f, plan, marks, rewarded, struck };
}
/** Whether a job is the delve under way's, or one of its errands (D-139): its end still has to be counted. */
/** An errand run that has ended but whose errands are not yet counted (D-139): its end screen still takes strikes (the
    run may have run out while Dan was still out), until "Count them", or until he leaves it or does anything else. */
function pendingErrands(facts: Fact[]) {
  let end: FactOf<'delveEnded'> | undefined;
  for (let i = facts.length - 1; i >= 0; i--) { const f = facts[i]; if (f.type === 'delveEnded') { end = f; break; } if (f.type === 'delveStarted') return null; }
  if (!end) return null;
  const e = end, fact = facts.find(f => f.seq === e.run) as FactOf<'delveStarted'> | undefined;
  if (!fact?.errands || facts.some(f => f.type === 'errandsCounted' && f.run === fact.seq)) return null;
  const struck = new Set<string>();
  for (const g of facts) if (g.type === 'errandStruck' && g.run === fact.seq) { if (struck.has(g.job)) struck.delete(g.job); else struck.add(g.job); }
  return { fact, struck, end: e };
}
const inRun = (facts: Fact[], job: string) => {
  const r = activeRun(facts) ?? pendingErrands(facts);
  return !!r && (r.fact.job === job || !!r.fact.errands?.includes(job));
};

function capacityOn(facts: Fact[], day: string): Capacity {
  const c = ofType(onDay(facts, day), 'capacityChosen');
  /* the day as Dan chose it (Stage 3 item 13, D-114: an optional choice on the day's first open); not chosen, Normal:
     a late night or days away never shrink a day by themselves (Dan, D-089), the choice only says a lighter one may suit */
  return c.length ? c[c.length - 1].capacity : 'normal';
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
  /* (the night's last goodnight: Go to sleep again after more work is when he went to bed, D-160) */
  const last = night[night.length - 1];
  const late = pastBedtime(bedtimeOf(facts.filter(f => f.seq <= last.seq)), last.at);
  return { capacity: late >= LATE_NIGHT ? 'low' : 'normal', by: 'bedtime' };
}

/** How many jobs a week not laid out puts on today's list: Low 2, Normal 3, High 5 (§6). Opening the app late no longer
    lowers it (Dan, D-130: no hidden count, no discount; the day is done when its list is). */
export function daySize(capacity: Capacity): number {
  return DAY_SIZE[capacity];
}
/** Whether Dan laid this week out with Plan my week: then Today follows the plan (D-078). A line or appointment added by
    hand to a week not laid out is an extra on its day, never a takeover (D-107). */
const planLeads = (facts: Fact[], day: string) => W.planMade(facts, calendarWeek(day));
/** How many jobs the week puts on a day (done as planned, or still to do; a job set aside no longer counts, D-080). */
function plannedCount(c: Content, facts: Fact[], day: string): number {
  const aside = asideOn(facts, day);
  return W.weekOf(c, facts, calendarWeek(day), day).days.find(d => d.day === day)!.jobs.filter(j => j.entry && (j.done || (!aside.has(j.job) && !weekMet(c, facts, day, j.job)))).length;
}
/** The day's size: from capacity; on a planned week, never more than the plan puts on the day (at least one) (D-078).
    On a week not laid out, the entries Dan added to the day come on top of it (D-107). */
function sizeOn(facts: Fact[], day: string, c?: Content) {
  const size = daySize(capacityOn(facts, day));
  if (!c) return size;
  const n = plannedCount(c, facts, day);
  if (!planLeads(facts, day)) return size + n;
  /* a High day holds one more than the plan (D-082) */
  return Math.max(1, Math.min(size, n + (capacityOn(facts, day) === 'high' ? 1 : 0)));
}

/* what stands done: a done record taken back ("Not done after all", D-131) no longer counts */
const doneOn = (facts: Fact[], day: string) => new Set(doneFacts(facts).filter(f => f.day === day).map(f => f.job));
/** Jobs done with real minutes behind them: only these complete a day or call the deep push (rule 10, D-117, D-121). */
/** A one-off's minutes carried from earlier days are its own, never that day's work (rule 10, D-133): only the minutes
    delved on the day count here. */
const workedOn = (facts: Fact[], day: string) => new Set(doneFacts(facts).filter(f => f.day === day && (f.today ?? f.minutes) >= S.RETURN_MIN).map(f => f.job));
/** Done records Dan deleted (D-125), as "job|day": they leave the lists; the minutes they counted for stay. */
export function hiddenDone(facts: Fact[]): Set<string> {
  const out = new Set<string>();
  for (const f of ofType(facts, 'doneHidden')) { const k = `${f.job}|${f.on}`; if (f.back) out.delete(k); else out.add(k); }
  return out;
}
export const delveMinutesOn = (facts: Fact[], day: string, job: string) =>
  ofType(onDay(facts, day), 'stepsGained').filter(f => f.job === job && f.run !== undefined).reduce((a, f) => a + f.minutes, 0);

export const rhythmOf = (c: Content, job: string): Rhythm | undefined => c.rhythms.find(r => r.job === job);
/** A rhythm as saved: without what `live` works out (D-151). */
const unsaved = ({ also: _, ...r }: Rhythm): Rhythm => r;
/** Whether a job belongs in today's suggestion at all: a set-day rhythm on its day; a one-off until it's done. */
function offeredOn(c: Content, facts: Fact[], day: string, j: Job, planned: Set<string>): boolean {
  if (j.stopped) return false;   /* a stopped rhythm leaves no one-off behind (D-110) */
  if (planned.has(j.id)) return true;
  if (dueSoon(facts, j, day)) return true;
  if (j.item) return false;   /* a satchel line is offered only once it is planned for the day (TOOLS §2) */
  const r = rhythmOf(c, j.id);
  const on = r ? Rep.fallsOn(r, day) : null;
  if (on !== null) return on;
  /* every N days: offered once it falls due, until done (D-114) */
  if (r && Rep.daysOf(r) && !Rep.fortnightFresh(facts, r)) return Rep.dueFrom(facts, r, day) <= day || doneFacts(facts).some(f => f.job === j.id && f.day === day);
  if (!r) return !doneFacts(facts).some(f => f.job === j.id && f.day !== day);
  return true;
}
/** One-offs left on "Not yet" (Dan, D-143 D): minutes behind them, not finished, and not moved since their last work
    (put on a day, "Not today", waiting on a reply): they stay on Today, day after day, "N min so far", until done or
    moved. */
export function inProgress(c: Content, facts: Fact[]): Set<string> {
  const last = new Map<string, number>(), moved = new Map<string, number>();
  const entryJob = new Map<string, string>();
  for (const f of facts) {
    if (f.type === 'planMade') for (const e of f.entries) entryJob.set(e.id, e.job);
    else if (f.type === 'planAdded') entryJob.set(f.entry.id, f.entry.job);
    if (f.type === 'delveEnded' && f.minutes > 0) last.set(f.job, f.seq);
    else if (f.type === 'stepsGained' && f.tick) last.set(f.job, f.seq);
    /* an errand run's minutes shared over errands not struck off are no "Not yet": they stay where they were (review) */
    else if (f.type === 'setAside' || f.type === 'waitSet') moved.set(f.job, f.seq);
    /* "Put back" after "Not today" undoes the move: the job is on Today again (review of D-144) */
    else if (f.type === 'putBack') moved.delete(f.job);
    /* put on another day by Dan (a delve's own clearing of later days is part of its start, before its end) */
    else if (f.type === 'planAdded') moved.set(f.entry.job, f.seq);
    else if (f.type === 'planChanged' && f.day) { const j = entryJob.get(f.entry); if (j) moved.set(j, f.seq); }
  }
  const out = new Set<string>();
  if (!last.size) return out;
  const waiting = W.waitingOf(facts), finished = new Set(W.oneOffDone(c, facts).map(f => f.job));
  for (const [job, seq] of last) {
    if ((moved.get(job) ?? -1) > seq || finished.has(job) || waiting.has(job) || c.rhythms.some(r => r.job === job)) continue;
    if (!c.jobs.some(j => j.id === job && !j.stopped) || job === ERRAND_RUN) continue;
    if (carriedOf(facts, c, job) > 0) out.add(job);
  }
  return out;
}
/** Dated work within three days of its date (or past it), not yet done: offered on Today even without a plan (D-114). */
export const SOON_DAYS = 3;
const dueSoon = (facts: Fact[], j: Job, day: string) =>
  !!j.by && W.daysBetween(day, j.by) <= SOON_DAYS && !doneFacts(facts).some(f => f.job === j.id && f.day !== day);
/** A rhythm whose enough is met this week stops leading (PLANNER → How the week drives Today). */
const metThisWeek = (c: Content, facts: Fact[], day: string, job: string) => {
  const r = rhythmOf(c, job);
  return !!r && S.sessionsIn(facts.filter(f => f.day !== day), r, day) >= S.needOf(r);
};

/** A "times a week" job whose week's number is already met on other days (Rep.metBefore). */
export const weekMet = (c: Content, facts: Fact[], day: string, job: string) => {
  const r = rhythmOf(c, job);
  return !!r && Rep.metBefore(facts, r, day);
};
/** A recurring job's sessions this week against its number, for the marks under its row (Dan, 2026-10-03): only for a
    rhythm counted by the week (N a week, set days); null for the rest. A session done today counts at once. */
export function weekCount(c: Content, facts: Fact[], day: string, job: string): { done: number; need: number } | null {
  const r = rhythmOf(c, job);
  return r && Rep.weekly(r) ? { done: Rep.sessionsIn(facts, r, day), need: Rep.needOf(r) } : null;
}

/** The job Dan chose at night to start `day` with (Tonight's "Tomorrow starts with", D-131), the last choice standing;
    null: as planned. */
export function firstChosen(facts: Fact[], day: string): string | null {
  const f = ofType(facts, 'firstChosen').filter(x => x.on === day).pop();
  return f?.job ?? null;
}
/** A one-off done (and not taken back) before `day`, or on it, is finished: it is never offered, chosen or put on a day
    again (review of D-131: one chosen for tomorrow and done tonight came back the next morning and paid twice). */
const finishedBy = (c: Content, facts: Fact[], job: string, day: string) =>
  !c.rhythms.some(r => r.job === job) && W.oneOffDone(c, facts).some(f => f.job === job && f.day <= day);
/** What tomorrow starts with, for Tonight's prefill (D-131): Dan's own choice, else the first job planned for tomorrow
    (the plan as it stands, or as Plan my week would lay tomorrow's week out). Nothing is written by looking. */
export function tomorrowFirst(base: Content, facts: Fact[], now: Moment): { job: string | null; chosen: boolean; planned: string[] } {
  const c = W.live(base, facts), on = W.addDays(dayOf(facts, now), 1);
  const own = firstChosen(facts, on);
  const wk = calendarWeek(on);
  const planned = [...new Set(W.planMade(facts, wk) ? W.plannedToday(c, facts, on, '00:00').map(p => p.job)
    : W.planWeek(c, facts, wk, on).filter(e => e.day === on).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99')).map(e => e.job))]
    .filter(id => !weekMet(c, facts, on, id));
  if (own && c.jobs.some(j => j.id === own && !j.stopped) && !finishedBy(c, facts, own, on) && !W.waitingOf(facts).has(own)) return { job: own, chosen: true, planned };
  return { job: planned[0] ?? null, chosen: false, planned };
}

/** The jobs with a place in a plan on a day after `day` (this week or later). */
function laterDays(facts: Fact[], day: string): Map<string, string[]> {
  const weeks = new Set([calendarWeek(day), ...ofType(facts, 'planMade').map(f => f.week), ...ofType(facts, 'planAdded').map(f => calendarWeek(f.entry.day))]);
  const out = new Map<string, string[]>();
  for (const wk of [...weeks].filter(x => x >= calendarWeek(day))) for (const e of W.planOf(facts, wk) ?? []) if (e.day > day) out.set(e.job, [...(out.get(e.job) ?? []), e.id]);
  return out;
}
/** Today's jobs in order: today's plan first (an appointment as its time nears), then the content's order, rhythms
    already met this week last; changed by Swap. Without a plan, Today works exactly as before (PLANNER.md). */
function orderOn(c: Content, facts: Fact[], day: string, clock: string): string[] {
  const aside = asideOn(facts, day);
  const plan = W.plannedToday(c, facts, day, clock).map(p => p.job).filter(id => !aside.has(id));
  /* the week's one thing that matters most leads Today on the day it is planned (D-116), after an appointment that is due */
  const pin = W.pinnedIn(facts, calendarWeek(day)), times = W.plannedToday(c, facts, day, clock);
  if (pin && plan.includes(pin)) {
    plan.splice(plan.indexOf(pin), 1);
    const due = times.filter(x => x.time && plan.indexOf(x.job) === 0).length;
    plan.splice(due, 0, pin);
  }
  /* the job chosen last night leads the day (Tonight, D-131): first on the list, planned or not */
  const first = ((f: string | null) => f && !aside.has(f) && c.jobs.some(j => j.id === f && !j.stopped) && !finishedBy(c, facts, f, W.addDays(day, -1)) ? f : null)(firstChosen(facts, day));
  if (first) { if (plan.includes(first)) plan.splice(plan.indexOf(first), 1); plan.unshift(first); }
  const planned = new Set(plan);
  /* a week laid out with Plan my week: Today is the plan, nothing else slipped in (Dan, D-078); "Something else…" is there */
  /* on a planned week, a job Dan chose himself today (begun, delved on or tapped) joins the list after the plan's (D-080) */
  const chosenIds = new Set(onDay(facts, day).flatMap(f => f.type === 'jobBegun' || f.type === 'delveStarted' || f.type === 'picked' ? [f.job] : []));
  const chosen = [...chosenIds]
    .filter(id => !planned.has(id) && !aside.has(id) && c.jobs.some(j => j.id === id)).map(id => c.jobs.find(j => j.id === id)!);
  /* a "times a week" job whose number is met leaves Today until Monday (Dan, 2026-10-02), unless Dan chose it himself
     today or last night; it stays in the Satchel */
  const gone = (id: string) => !chosenIds.has(id) && id !== first && weekMet(c, facts, day, id);
  for (let i = plan.length - 1; i >= 0; i--) if (gone(plan[i])) plan.splice(i, 1);
  /* a High day adds one job beyond the plan (the next one due), and only one; more is Dan's own choice (Dan, D-082) */
  const off = new Set([...doneOn(facts, day)].filter(id => !planned.has(id)));
  const extra = planLeads(facts, day) && capacityOn(facts, day) === 'high' && off.size === 0
    ? c.jobs.filter(j => !j.item && !planned.has(j.id) && !aside.has(j.id) && !chosen.includes(j) && offeredOn(c, facts, day, j, planned) && !metThisWeek(c, facts, day, j.id)).slice(0, 1) : [];
  /* dated work near its date joins a planned day too (D-114) */
  /* …unless Dan put it on a later day himself (second review of D-131) */
  const later = laterDays(facts, day);
  const soon = c.jobs.filter(j => !planned.has(j.id) && !aside.has(j.id) && !chosen.includes(j) && dueSoon(facts, j, day) && !later.has(j.id));
  /* a one-off left on "Not yet" stays on Today until done or moved (Dan, D-143 D) */
  const prog = inProgress(c, facts);
  const going = c.jobs.filter(j => prog.has(j.id) && !planned.has(j.id) && !aside.has(j.id) && !chosen.includes(j) && !soon.includes(j) && !later.has(j.id));
  const offered = planLeads(facts, day) ? [...chosen, ...going, ...soon, ...extra.filter(j => !soon.includes(j) && !going.includes(j))]
    : [...going, ...c.jobs.filter(j => !going.includes(j) && offeredOn(c, facts, day, j, planned) && !planned.has(j.id) && !aside.has(j.id))];
  const left = offered.filter(j => !gone(j.id));
  const order = [...plan, ...left.filter(j => !metThisWeek(c, facts, day, j.id)), ...left.filter(j => metThisWeek(c, facts, day, j.id))].map(j => typeof j === 'string' ? j : j.id);
  for (const s of ofType(onDay(facts, day), 'swapped')) {
    const a = order.indexOf(s.from), b = order.indexOf(s.to);
    if (a >= 0 && b >= 0) [order[a], order[b]] = [order[b], order[a]];
  }
  /* a job waiting on a reply is never on the day's list, nor its finish line: on its day it comes back under the list,
     asking "Did they reply?", and never holds the day back (D-137) */
  const waiting = W.waitingOf(facts);
  return waiting.size ? order.filter(id => !waiting.has(id)) : order;
}

/** Jobs taken off today's list ("Not today"), unless begun again after (D-077). Setting aside earns and costs nothing. */
function asideOn(facts: Fact[], day: string): Set<string> {
  const out = new Set<string>();
  for (const f of onDay(facts, day)) {
    if (f.type === 'setAside') out.add(f.job);
    else if (f.type === 'jobBegun' || f.type === 'delveStarted' || f.type === 'picked' || f.type === 'putBack') out.delete(f.job);
  }
  return out;
}

/** A job begun away from the phone (Begin on a no-timer job) and not yet done today. */
function underWayOn(facts: Fact[], day: string): string | null {
  const done = doneOn(facts, day);
  /* a delve stopped early is not "under way": its job simply stays on the list (review finding, D-080). Only the Begins
     before it are cleared: a Begin pressed after a delve on the same job stands (Dan, 2026-09-26: a job delved on
     earlier in the day could not be begun) */
  const begun: string[] = [];
  for (const f of onDay(facts, day)) {
    if (f.type === 'delveStarted') { for (let i = begun.length - 1; i >= 0; i--) if (begun[i] === f.job) begun.splice(i, 1); }
    else if (f.type === 'jobBegun' && f.from === 'app') begun.push(f.job);
    /* "I haven't started" takes a Begin back */
    else if (f.type === 'beginUndone') for (let i = begun.length - 1; i >= 0; i--) if (begun[i] === f.job) begun.splice(i, 1);
  }
  for (let i = begun.length - 1; i >= 0; i--) if (!done.has(begun[i])) return begun[i];
  return null;
}

/** The day a job's current date was first set: its earliest save still carrying that date (D-114). */
function datedSince(facts: Fact[], job: string): string | null {
  let since: string | null = null, by: string | undefined;
  for (const f of facts) if (f.type === 'jobSaved' && f.job.id === job) { if (f.job.by !== by) { by = f.job.by; since = by ? f.day : null; } }
  return since;
}

/** Whether a job was begun today and the Begin still stands (not taken back since). */
/** A delve begun on a job (the set-up's Begin, or "Delve now" on a job Dan already has, D-136). A one-off delved on today
    is today's: it leaves a later day it was put on, so it is in one place (second review of D-131); undone, it goes
    back to No day yet. */
function beginRun(w: W, c: Content, job: string, minutes: number, count: number, day: string) {
  if (!begunOn(w.all, day, job)) w.put({ type: 'jobBegun', job, from: 'app' });
  w.put({ type: 'delveStarted', job, minutes, count: Math.max(1, count) });
  if (!c.rhythms.some(r => r.job === job)) for (const e of laterDays(w.all, day).get(job) ?? []) w.put({ type: 'planChanged', entry: e, day: null });
}

function begunOn(facts: Fact[], day: string, job: string): boolean {
  let on = false;
  for (const f of onDay(facts, day)) {
    if (f.type === 'jobBegun' && f.job === job) on = true;
    else if (f.type === 'beginUndone' && f.job === job) on = false;
  }
  return on;
}
/** Jobs set aside today and not put back: the Week shows them as "not today" (review 2, D-088). */
export const asideToday = (facts: Fact[], day: string): Set<string> => asideOn(facts, day);

/* ---------- the route ---------- */

/** Where Dan stands on the road (minutes of effort from the start), and the minutes taken back still owed (deep review
    B3): a tick taken back by "Not done after all" never moves the flame back (nothing reached is taken away, rule 9);
    the next minutes fill it before the flame moves on. */
const roadMemo = new WeakMap<Fact[], { n: number; walked: number; owed: number; taken: number }>();
export function roadOf(facts: Fact[]): { walked: number; owed: number; taken: number } {
  const m = roadMemo.get(facts);
  if (m && m.n === facts.length) return m;
  let walked = 0, owed = 0, taken = 0;
  for (const f of facts) {
    if (f.type === 'stepsGained') { const pay = Math.min(owed, f.minutes); owed -= pay; walked += f.minutes - pay; }
    else if (f.type === 'tickTakenBack') { owed += f.minutes; taken = f.minutes; }
  }
  const out = { n: facts.length, walked, owed, taken };
  roadMemo.set(facts, out);
  return out;
}
export const walked = (facts: Fact[]) => roadOf(facts).walked;

export { dayOf };

/* ---------- writing ---------- */

function writer(facts: Fact[], now: Moment) {
  const all = facts.slice(), out: Fact[] = [];
  let seq = facts.length ? facts[facts.length - 1].seq : 0;
  const off = offsetOf(now);
  /* the phone's clock set back by hand: what happens now is written no earlier than the log's last fact, so the log
     keeps its time order (break-it review 11) */
  const last = facts.length ? facts[facts.length - 1].at : null;
  const nowAt = last && epochOf(now) < epochOf(last) ? last : now, today = dayOf(facts, now);
  const put = (body: FactBody, at0?: Moment, day0?: string): Fact => {
    /* only the timestamp is held back: the fact stays on the day the phone says it is, as everything else reads it
       (review of the break-it fixes) */
    const at = at0 === undefined || at0 === now ? nowAt : at0, day = day0 ?? (at0 === undefined || at0 === now ? today : gameDay(at0));
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
function arrive(w: W, c: Content, b: Beat, how: 'foot' | 'key' | 'evening' | 'trip', at: Moment, day: string, night?: { night: string; late: boolean }) {
  /* a place a Key used to play, reached on foot (or at an evening): its row opens with it, with no Key (D-129) */
  const x = how !== 'key' && b.seal ? S.sealOf(c.story, b.seal) : undefined;
  if (x && !S.storyState(w.all, c.story).opened.has(x.id)) { w.put({ type: 'sealOpened', seal: x.id, how: 'road' }, at, day); show(w, c, x.carries?.records, at, day); }
  w.put({ type: 'arrived', kind: 'place', id: b.id, how, ...(night ? { night: night.night, ...(night.late ? { late: true } : {}) } : {}) }, at, day);
  show(w, c, b.carries?.records, at, day);
  /* a Key kept for later is never spent for Dan on arriving (D-143 A, was D-079): it is his to use, here or on the Map */
}
/** The story as Dan knows it: a place reached but not yet shown on its arrival screen doesn't count yet, so nothing a job
    brings (a find, the story's next step, a line of the passage) describes a room before the screen that brings him into
    it (the journey review, D-154; finds did so first). */
function knownState(w: W, c: Content) {
  const seen = new Set(w.all.filter(f => f.type === 'seen' && f.what === 'arrival').map(f => (f as FactOf<'seen'>).ref));
  /* (nor the approach told in that place's words, its `before` step: the climb down, the short-day review) */
  const unseen = new Set(w.all.filter(f => f.type === 'arrived' && f.kind === 'place' && !seen.has(f.seq)).map(f => (f as FactOf<'arrived'>).id));
  return S.storyState(w.all.filter(f => !(f.type === 'arrived' && !seen.has(f.seq))
    && !(f.type === 'beatPlayed' && f.job === undefined && unseen.has(S.beatOf(c.story, f.id)?.before ?? ''))), c.story);
}
/** What the walk opened or played just before a place reached but not yet shown on its screen (its `way`, told there):
    ids of those beats and seals. */
function onTheWay(w: W, c: Content): Set<string> {
  const seen = new Set(w.all.filter(f => f.type === 'seen' && f.what === 'arrival').map(f => (f as FactOf<'seen'>).ref));
  const out = new Set<string>();
  w.all.forEach((f, i) => {
    if (f.type !== 'arrived' || f.kind !== 'place' || seen.has(f.seq)) return;
    for (let j = i - 1; j >= 0; j--) {
      const g = w.all[j];
      if (g.type === 'recordShown' || g.type === 'storyWeekBegan' || g.type === 'findGiven') continue;
      if (g.type === 'sealOpened' && g.how === 'road') { out.add(g.seal); continue; }
      if (g.type === 'beatPlayed' && g.job === undefined && g.id !== 'passage') { out.add(g.id); continue; }
      break;
    }
  });
  return out;
}
function giveFind(w: W, c: Content, why: FactOf<'findGiven'>['why'], at: Moment, day: string, job?: number) {
  /* nothing is found down the way in before the climb down it is told: on a job's return the climb comes first (D-160,
     the round-4 review); a side chamber before it (no return to tell it on) gives a find that reads right before the climb */
  const st0 = S.storyState(w.all, c.story), first = c.story.route[0]?.places[0]?.id;
  const climb = job && !S.pastMouth(c.story, st0) && first ? c.story.beats.find(b => b.kind === 'step' && b.before === first && !st0.played.has(b.id) && b.req.every(r => S.met(st0, r))) : undefined;
  if (climb) { w.put({ type: 'beatPlayed', id: climb.id, job }, at, day); show(w, c, climb.carries?.records, at, day); }
  /* from what Dan has been shown, but once he has gone down never the top, even before the screen that took him down
     has shown (D-160) */
  const f = S.pickFind(c.story, { ...knownState(w, c), departed: S.storyState(w.all, c.story).departed }, why);
  if (!f) return;
  w.put({ type: 'findGiven', id: f.id, why, ...(job ? { job } : {}) }, at, day);
  if (f.told) show(w, c, [f.told], at, day);
}

/** The story's week: the first begins on the first opening; the next as soon as this one is done (D-123). Returns
    whether a week began. */
function storyClock(w: W, c: Content, at: Moment, day: string): boolean {
  const st = S.storyState(w.all, c.story);
  if (st.weekBegan === null) { w.put({ type: 'storyWeekBegan', w: 1 }, at, day); return true; }
  if (S.mayAdvance(c.story, st, day)) { w.put({ type: 'storyWeekBegan', w: st.week + 1 }, at, day); return true; }
  return false;
}

/** Where Dan camps when he goes to sleep (D-160): the place he reached, if not long ago, or a view of his stretch with its
    one thing to look at (its find, or the stretch's next if that one was already found). Not moved by it: he is where he
    was, and the next day starts there. */
function camp(w: W, c: Content, at: Moment, day: string) {
  const st = S.storyState(w.all, c.story);
  const since = walked(w.all) - S.lastPlaceAt(st);
  const where = S.campHere(c.story, st, since);
  w.put({ type: 'arrived', kind: 'camp', id: where.id, ...(where.at === 'place' ? { where: 'place' as const } : {}) }, at, day);
  /* its one thing to look at: the view's own (a find, or a line), else something noticed where he is (D-160) */
  const view = where.at === 'view' ? c.story.camps.find(x => x.id === where.id) : undefined;
  const own = where.at === 'view' ? where : undefined;
  /* (a night again at a view he camped at before: something new from where he is, never the same words alone, round 5) */
  const repeat = where.at === 'view' && st.campsShown.includes(where.id);
  const find = own?.find && !st.given.has(own.find) ? own.find : own?.line && !repeat ? null : S.pickFind(c.story, st, 'camp', view?.stretch ?? st.stretch)?.id;
  if (find) {
    w.put({ type: 'findGiven', id: find, why: 'camp' }, at, day);
    /* (its record, as any find's: handed over with it) */
    const told = c.story.finds.find(x => x.id === find)?.told;
    if (told) show(w, c, [told], at, day);
  }
}

/** A Key lands: it is kept, never spent for Dan (D-143 A). Its job's return offers "Use it here" when something is locked
    where he is; anything else is his to open on the Map (D-142). */
function landKey(w: W, rhythm: string, at: Moment, day: string, late?: string) {
  w.put({ type: 'keyEarned', rhythm, ...(late ? { for: late } : {}) }, at, day);
  w.put({ type: 'keyHeld' }, at, day);
}
function openSeal(w: W, c: Content, seal: Seal, at: Moment, day: string, job?: number, road = false): Seal {
  w.put({ type: 'sealOpened', seal: seal.id, ...(road ? { how: 'road' as const } : {}) }, at, day);
  show(w, c, seal.carries?.records, at, day);
  if (seal.arrival) { const b = S.beatOf(c.story, seal.arrival); if (b) arrive(w, c, b, 'key', at, day); }
  else w.put({ type: 'beatPlayed', id: seal.beat ?? seal.id, ...(job ? { job } : {}) }, at, day);
  if (seal.beat) show(w, c, S.beatOf(c.story, seal.beat)?.carries?.records, at, day);
  return seal;
}

function pushOn(facts: Fact[], day: string): boolean {
  const today = onDay(facts, day);
  /* doing more is pushing deeper, with no setting to choose (Dan, D-127): past a day's first 3 hours (D-131). Nothing
     ends the day there or says so (D-160): it only lets the walk go on into next week's places */
  return capacityOn(facts, day) === 'high' || today.some(f => f.type === 'deepCalled')
    /* (less any tick taken back: taken-back minutes never push on, rule 10) */
    || ofType(today, 'stepsGained').filter(f => f.job !== 'sleep').reduce((a, f) => a + f.minutes, 0)
      - ofType(today, 'tickTakenBack').reduce((a, f) => a + f.minutes, 0) > W.FINISH_MIN;
}

/** After anything that can move Dan: the places reached (§4; the story job's §0.2). Nothing ends the day but Go to sleep
    (D-160): no day complete, no stop short of a place. */
function gifts(w: W, c: Content, at: Moment, day: string) {
  storyClock(w, c, at, day);
  /* a deep push (a High day, a called push, or Keep going after the day's work) may go on to next week's places (§0.2) */
  const push = pushOn(w.all, day);
  /* every 150 minutes reaches a place, as many a day as Dan walks (Dan, D-123: no one-a-day limit); a story week done on
     the way opens the next at once, so its places can be reached too */
  const reach = () => {
    let n = 0, trip = false;
    for (;;) {
      const st = S.storyState(w.all, c.story);
      /* a trip back up (an old save's, D-160) sees everything still waiting at the top at once: one climb, not several;
         the top's moments it needs on the way (a row the road opens, a step) play in it too, before the place they lead
         to; it costs no walking (its places are not walked to) */
      if (trip) {
        const step = S.tripStep(c.story, st, push);
        if (step) { playOnRoad(step); continue; }
        const more = S.nextPlace(c.story, st, push);
        if (more && S.isErrand(c.story, st, more)) { arrive(w, c, more, 'trip', at, day); n++; continue; }
        trip = false;
      }
      if (walked(w.all) < S.nextPlaceAt(st)) return n;
      const next = S.nextPlace(c.story, st, push);
      if (!next) {
        if (storyClock(w, c, at, day)) continue;
        /* story bits that stand between Dan and a place he has walked to play on the way: a long day never holds a
           place back (Dan, D-129) */
        const way = S.onTheWay(c.story, st);
        if (!way) return n;
        /* one at a time, so a story week they finish begins before the next week's bits play */
        playOnRoad(way[0]);
        continue;
      }
      /* the side chamber of the stretch this arrival closes, if a big move passed it on the way (deep review B5) */
      sideChamber(w, c, at, day);
      /* the steps that come before it in the story, where he is or there, play on the way to it */
      for (let k = 0; k < 6; k++) {
        const b = S.stepBefore(c.story, S.storyState(w.all, c.story), next);
        if (!b) break;
        w.put({ type: 'beatPlayed', id: b.id }, at, day); show(w, c, b.carries?.records, at, day);
      }
      if (S.isErrand(c.story, st, next)) {
        /* the first place of a trip up: the top's moments it needs first, then the place, at no walking cost */
        trip = true;
        for (let k = 0, b = S.tripStep(c.story, st, push); b && k < 6; k++, b = S.tripStep(c.story, S.storyState(w.all, c.story), push)) playOnRoad(b);
        const first = S.nextPlace(c.story, S.storyState(w.all, c.story), push) ?? next;
        arrive(w, c, first, 'trip', at, day); n++; continue;
      }
      arrive(w, c, next, 'foot', at, day); n++;
    }
  };
  /* a story bit played on the way (no job): a row the road opens, or a step */
  const playOnRoad = (b: Beat) => {
    if (b.kind === 'stepKey') openSeal(w, c, S.sealOf(c.story, b.seal!)!, at, day, undefined, true);
    else { w.put({ type: 'beatPlayed', id: b.id }, at, day); show(w, c, b.carries?.records, at, day); }
  };
  /* a place plays the moment it is reached (Dan, 2026-09-24, D-073) */
  reach();
}

/** A job's delve minutes from runs begun on an earlier game day that ended on this one (a delve begun before 04:00 and
    said done after it): they count for this day's Done, so they aren't paid again (D-120). */
function crossedIn(facts: Fact[], day: string, job: string): number {
  let n = 0;
  for (const e of ofType(facts, 'delveEnded')) if (e.job === job && e.day < day && gameDay(e.at) === day && !doneOn(facts, e.day).has(job)) n += e.minutes;
  return n;
}
/** A one-off's minutes from its delves since it was last done, before the fact `before` (Dan, D-133): "Not yet" keeps
    them, and its next delve carries on from them, on any day, until it is done. They moved Dan once, when each delve
    ended; here they are only the job's own count (its done record, its return, the delve's end), never paid again. A
    done record taken back ("Not done after all", D-131) no longer stands, so the job carries on from all its minutes;
    what that record earned is never paid twice (paidBefore). A repeating job never carries: each run is its session. */
export function carriedOf(facts: Fact[], c: Content, job: string, before = Infinity): number {
  /* an errand run's minutes are its errands', never carried as a run (D-139) */
  if (job === ERRAND_RUN || c.rhythms.some(r => r.job === job)) return 0;
  const last = doneFacts(facts).filter(f => f.job === job && f.seq < before).pop();
  const from = last ? last.seq : -1;
  let n = 0;
  for (const e of ofType(facts, 'delveEnded')) if (e.job === job && e.seq > from && e.seq < before) n += e.minutes;
  /* and the minutes it was ticked off with, since, less any tick taken back by "Not done after all" (deep review B3) */
  for (const g of ofType(facts, 'stepsGained')) if (g.tick && g.job === job && g.seq > from && g.seq < before) n += g.minutes;
  for (const g of ofType(facts, 'tickTakenBack')) if (g.job === job && g.seq > from && g.seq < before) n -= g.minutes;
  /* and its shares of errand runs, since (D-139) */
  for (const g of ofType(facts, 'errandShare')) if (g.job === job && g.seq > from && g.seq < before) n += g.minutes;
  return n;
}
/** A job's tick minutes since the fact `from`, less any taken back since (deep review B3). */
const ticksSince = (facts: Fact[], job: string, from: number) => Math.max(0,
  ofType(facts, 'stepsGained').filter(f => f.tick && f.job === job && f.seq > from).reduce((a, f) => a + f.minutes, 0)
  - ofType(facts, 'tickTakenBack').filter(f => f.job === job && f.seq > from).reduce((a, f) => a + f.minutes, 0));
/** The minutes a job was ticked off with on a day, less any taken back (D-134, deep review B3). */
const ticksOn = (facts: Fact[], day: string, job: string) => Math.max(0,
  ofType(onDay(facts, day), 'stepsGained').filter(f => f.tick && f.job === job).reduce((a, f) => a + f.minutes, 0)
  - ofType(facts, 'tickTakenBack').filter(f => f.job === job && f.on === day).reduce((a, f) => a + f.minutes, 0));
/** A one-off made recurring keeps its "Not yet" minutes (deep review): they count into its first session as a recurring
    job, once (its minutes since it was last done, before its rhythm began; none once it has a done record since). */
function carriedIntoRhythm(facts: Fact[], c: Content, job: string, today: string): number {
  const began = ofType(facts, 'rhythmSaved').find(f => f.rhythm.job === job && c.rhythms.some(r => r.id === f.rhythm.id));
  if (!began || doneFacts(facts).some(f => f.job === job && f.seq > began.seq) || undoneFacts(facts).some(f => f.job === job && f.seq > began.seq)) return 0;
  /* its minutes from the days before its first session's day (that day's own are already the session's) */
  const before = facts.filter(f => f.seq < began.seq);
  return carriedOf(before, { ...c, rhythms: c.rhythms.filter(r => r.job !== job) }, job)
    - delveMinutesOn(before, today, job) - ticksOn(before, today, job)
    - ofType(onDay(before, today), 'errandShare').filter(f => f.job === job).reduce((a, f) => a + f.minutes, 0);
}
/** The minutes a job was ticked off with on a day (D-134), its errand shares too. */
const tickedOn = (facts: Fact[], day: string, job: string) => ticksOn(facts, day, job)
  /* and its shares of errand runs on the day (D-139): the job's own minutes, as a tick's are */
  + ofType(onDay(facts, day), 'errandShare').filter(f => f.job === job).reduce((a, f) => a + f.minutes, 0);
/** The minutes a job already has behind it, for "On top of …" when it is ticked off (D-134): a one-off's carried minutes;
    a repeating job's delve minutes on this day. */
export function behindOf(facts: Fact[], c: Content, job: string, day: string): number {
  return c.rhythms.some(r => r.job === job) ? delveMinutesOn(facts, day, job) + crossedIn(facts, day, job) + tickedOn(facts, day, job) : carriedOf(facts, c, job);
}
function markDoneIn(w: W, c: Content, job: string, at: Moment, day: string, ticked = 0, errand?: number) {
  if (doneOn(w.all, day).has(job)) return;
  /* a one-off counts all its minutes since it was last done, whatever day they were delved (D-133); a repeating job,
     its day's (and a run begun before 04:00 that ended on this day, D-120) */
  /* a job ticked off counts the minutes Dan gave it too, on this day (D-134) */
  const ownDay = delveMinutesOn(w.all, day, job) + crossedIn(w.all, day, job) + tickedOn(w.all, day, job);
  const j = jobOf(c, job), timed = c.rhythms.some(r => r.job === job) ? ownDay + carriedIntoRhythm(w.all, c, job, day) : carriedOf(w.all, c, job);
  /* what of them was delved on this day, when fewer: only that is the day's work (workedOn) */
  const today = { ...(timed > ownDay ? { today: ownDay } : {}), ...(ticked ? { ticked } : {}), ...(errand ? { errand } : {}) };
  /* a delve's minutes have already moved Dan (counted once, even across 04:00, D-120). Every job is a delve (D-117): one
     said done with no whole minute behind it is off the list, but earns no minutes and brings no return: no step of the
     story, no find, no Key, and it is no work towards the day (rule 10). It is off the list, though: if it was the list's
     last job and the day has had real work, the day is done (D-130) */
  if (timed === 0) {
    w.put({ type: 'jobDone', job, minutes: 0, ...(errand ? { errand } : {}) }, at, day);
    return;
  }
  /* a session of a minute or two is done and its minutes have moved Dan, but a few one-minute stops never open the story
     or complete a day (rule 10, D-121) */
  if (timed < S.RETURN_MIN) { w.put({ type: 'jobDone', job, minutes: timed, ...today }, at, day); gifts(w, c, at, day); return; }
  const done = w.put({ type: 'jobDone', job, minutes: timed, ...today }, at, day);
  storyClock(w, c, at, day);
  /* said done again after "Not done after all" (D-131): its minutes already moved Dan and its return was already given,
     so nothing is paid twice: no story step, find or Key. A one-off has one return ever; a recurring job one a day. */
  if (paidBefore(w.all, c, job, day, done.seq)) { gifts(w, c, at, day); return; }
  /* a rhythm met this week lands a Key, until the week's supply is used; past it, one find a week (§3). A rhythm Dan
     added or changed counts for Keys from its next full period (D-043 F7): the rhythms as they stood when the week began. */
  /* a recurring job made this week counts at once: its Key follows the marks under its row (Dan, D-152) */
  const r = rhythmOf(W.live(c.base ?? c, w.all, calendarWeek(day)), job) ?? rhythmOf(c, job);
  /* any session meets the rhythm (Dan, D-121), but only sessions of the dial's shortest delve or more count towards its
     Key: a few one-minute sessions never open the story (rule 10) */
  /* one Key a rhythm a period, even if a session is taken back and done again (D-131) */
  const keyedAlready = !!r && ofType(w.all, 'keyEarned').some(k => k.rhythm === r.id && Rep.samePeriod(r, k.for ?? k.day, day));
  /* (at least: an every-N-days rhythm kept up more often than every N days has two sessions in its window, deep review B4;
     keyedAlready keeps it to one Key a period) */
  /* a rhythm stopped since the week began lands no Key (deep review: a stopped rhythm's Key) */
  /* its sessions under another job of its name count as they stand now (D-151) */
  if (r && rhythmOf(c, job) && !keyedAlready && S.sessionsIn(w.all, { ...r, also: rhythmOf(c, job)!.also }, day, S.RETURN_MIN) >= S.needOf(r)) {
    const surplus = () => { if (!ofType(w.all, 'findGiven').some(f => f.why === 'surplus' && calendarWeek(f.day) === calendarWeek(day))) giveFind(w, c, 'surplus', at, day, done.seq); };
    if (S.keysIn(w.all, day) < S.KEYS_A_WEEK) {
      landKey(w, r.id, at, day);
      /* the Key is kept (D-143 A); with nothing locked it could open (every such thing already has a kept Key for it),
         the job still brings something: the week's one surplus find, as before (D-129, BALANCING §3) */
      const st = S.storyState(w.all, c.story);
      if (S.openable(c.story, st).length < st.held) surplus();
    } else surplus();
  }
  /* a Key kept for later is never spent for Dan on a job's return (D-143 A, was D-129): it is his to use */
  /* the return: the deep push's next beat (once a day) on a High day past a Normal day's size, or once a Normal day's
     jobs are done if Dan called the push in the morning (D-054); else the story's next step; else a line of the passage */
  {
    /* from where Dan knows he is: a place the job reached comes after its words, on its own screen (D-154) */
    /* (nor on what the walk opened just before a place not yet on screen: that place's screen tells it, after this
       return, the round-8 review) */
    const st = knownState(w, c), ahead = onTheWay(w, c), next = S.nextStep(c.story, st);
    const step = next && !next.req.some(r => ahead.has(r)) ? next : null;
    const n = workedOn(w.all, day).size, called = onDay(w.all, day).some(f => f.type === 'deepCalled');
    /* pushing deeper is doing more: past the day's finish line (its first 3 hours, D-131), the deep push's next beat
       plays, once a day, with no setting to choose first (Dan, D-127; a High day or a morning call did it before, D-054) */
    /* (a day's first 3 hours were its finish line; nothing ends the day there now, D-160) */
    /* past the line, and more than a short day's work behind it: 3 hours delved today, or more than a normal day's jobs
       (a line emptied by "Not today" never makes ten minutes a push, rule 10; second review of D-131) */
    const delved = ofType(onDay(w.all, day), 'stepsGained').filter(f => f.run !== undefined || f.tick).reduce((a, f) => a + f.minutes, 0)
      - ofType(w.all, 'tickTakenBack').filter(f => f.on === day).reduce((a, f) => a + f.minutes, 0);
    const deep = ((delved >= W.FINISH_MIN || n > DAY_SIZE.normal) || (called && n >= DAY_SIZE.normal))
      && !ofType(onDay(w.all, day), 'beatPlayed').some(f => S.beatOf(c.story, f.id)?.kind === 'deep') ? S.nextDeep(c.story, st) : null;
    if (deep) { w.put({ type: 'beatPlayed', id: deep.id, job: done.seq }, at, day); show(w, c, deep.carries?.records, at, day); }
    /* a road row's step opens its sealed thing on the way, with no Key (D-129) */
    else if (step?.kind === 'stepKey') openSeal(w, c, S.sealOf(c.story, step.seal!)!, at, day, done.seq, true);
    else if (step) { w.put({ type: 'beatPlayed', id: step.id, job: done.seq }, at, day); show(w, c, step.carries?.records, at, day); }
    else { const p = S.nextPassage(c.story, st); if (p) w.put({ type: 'beatPlayed', id: 'passage', passage: p, job: done.seq }, at, day); }
  }
  /* an avoided job always brings a find (P5) */
  if (j.avoided) giveFind(w, c, 'avoided', at, day, done.seq);
  /* dated work done before its date may bring a find, once a week: it rewards doing the work, never keeping to the plan;
     a date set within two days of doing it doesn't count (rule 10, D-114) */
  else if (j.by && day < j.by && datedSince(w.all, j.id) !== null && W.daysBetween(datedSince(w.all, j.id)!, day) >= 2
    && !ofType(w.all, 'findGiven').some(f => f.why === 'dated' && calendarWeek(f.day) === calendarWeek(day))) giveFind(w, c, 'dated', at, day, done.seq);
  gifts(w, c, at, day);
}

/** Whether a job's return was already paid by a done record since taken back (D-131): for a recurring job, that day's;
    for a one-off, any. */
function paidBefore(facts: Fact[], c: Content, job: string, day: string, self: number): boolean {
  const recurring = c.rhythms.some(r => r.job === job);
  /* a job recurring once and a one-off now: only records since it stopped repeating were its one-off return (deep review) */
  const its = new Set([...(c.base ?? c).rhythms.filter(r => r.job === job).map(r => r.id), ...ofType(facts, 'rhythmSaved').filter(x => x.rhythm.job === job).map(x => x.rhythm.id)]);
  const since = recurring ? -1 : Math.max(-1, ...ofType(facts, 'rhythmStopped').filter(f => its.has(f.id)).map(f => f.seq));
  /* (a session formed again by a later delve, B2, was set aside, not taken back: it is the same session) */
  if (undoneFacts(facts).some(f => f.job === job && f.seq > since && f.minutes >= S.RETURN_MIN && (!recurring || f.day === day))) return true;
  /* a one-off has one return ever, however it came to be done twice */
  return !recurring && W.oneOffDone(c, facts).some(f => f.job === job && f.seq > since && f.seq !== self && f.minutes >= S.RETURN_MIN);
}

/** A repeating job counts for the minutes it was run for (Dan, D-121): a run on it that ends with a whole minute or more
    is that day's session, whatever its enough (which only sets the delve's usual length and the plan's room). */
const sessionEnds = (all: Fact[], day: string, j: Job, minutes: number) =>
  j.doneBy === 'enough' && minutes > 0 && !doneOn(all, day).has(j.id);

/** A later delve on a recurring job already done that day joins its session (Dan, deep review B2: 3 + 60 = 63, counted
    for the Key): the standing record is set aside and the session formed again from all the day's minutes. What the
    first record earned is never paid twice (paidBefore). */
function joinSession(w: W, c: Content, day: string, j: Job, minutes: number, at: Moment): boolean {
  if (j.doneBy !== 'enough' || minutes <= 0 || !c.rhythms.some(r => r.job === j.id) || !doneOn(w.all, day).has(j.id) || hiddenDone(w.all).has(`${j.id}|${day}`)) return false;
  w.put({ type: 'doneUndone', job: j.id, on: day, joined: true }, at, day);
  markDoneIn(w, c, j.id, at, day, ticksOn(w.all, day, j.id));
  return true;
}

/** How long a job's list may be, in characters (D-126). */
export const LIST_MAX = 2000;
/** The longest "Waiting on…" line (D-137): a few words, "the vet". */
export const WHO_MAX = 60;
/** "Waiting on…" opens on the day this many days ahead (D-137). */
export const WAIT_DAYS = 3;
/** The lines of a job's list, as kept. */
export const listLines = (j: Job | undefined) => (j?.list ?? '').split('\n').filter(l => l.trim());
/** A delve's end takes the lines struck off during it out of the job's list (D-126). */
function clearStruck(w: W, c: Content, id: string, at: Moment, day: string) {
  const j = c.jobs.find(x => x.id === id);
  if (!j?.struck?.length) return;
  const gone = new Set(j.struck), list = listLines(j).filter((_, k) => !gone.has(k)).join('\n');
  const job: Job = { ...j };
  delete job.stopped; delete job.struck;
  if (list) job.list = list; else delete job.list;
  w.put({ type: 'jobSaved', job }, at, day);
}

/** Finish a run at an instant: every minute counts; a repeating job's run is its session. */
function finishRun(w: W, c: Content, r: NonNullable<ReturnType<typeof activeRun>>, atMs: number, at: Moment) {
  const s = runAt(r.plan, r.marks, atMs), rday = r.fact.day, j = jobOf(c, r.fact.job);
  const part = s.phase === 'delve' || s.phase === 'held' ? Math.floor(s.doneMs / MIN) : 0;
  const counted = s.ends.length * r.plan.minutes + part;
  if (part > 0) {
    w.put({ type: 'stepsGained', minutes: part, job: j.id, run: r.fact.seq }, at, rday);
    sideChamber(w, c, at, rday);
  }
  w.put({ type: 'delveEnded', job: j.id, minutes: counted, how: 'finishedHere', run: r.fact.seq }, at, rday);
  clearStruck(w, c, j.id, at, rday);
  /* an errand run's errands are counted once Dan has struck off what got done, on its end (D-139) */
  if (r.fact.errands) gifts(w, c, at, rday);
  else if (sessionEnds(w.all, rday, j, counted)) markDoneIn(w, c, j.id, at, rday);
  else if (!joinSession(w, c, rday, j, counted, at)) gifts(w, c, at, rday);
  /* a place reached on this delve starts a new stretch, whose halfway may already be behind Dan (an arrival held for
     tomorrow, D-122) */
  if (part > 0) sideChamber(w, c, at, rday);
}
/** An errand run's end (Dan, D-139). Its minutes already moved Dan along the road, once, as each delve ended. Each errand
    struck off is done on the run's day with an even share of them (whole minutes, the remainder to the first), counted
    once as that job's own minutes, and brings its story moment, paid once (D-121, D-133, D-134). The errands not struck
    off stay as they were; the minutes went to those done. With none struck off, the minutes are shared among the errands,
    kept as each job's own: a one-off carries its share into its next delve or tick (D-133), so nothing is lost. */
function errandsEnd(w: W, c: Content, r: NonNullable<ReturnType<typeof pendingErrands>>, at: Moment) {
  const day = r.end.day, minutes = r.end.minutes;
  w.put({ type: 'errandsCounted', run: r.fact.seq }, at, day);
  const open = (r.fact.errands ?? []).filter(id => c.jobs.some(j => j.id === id) && !doneOn(w.all, day).has(id)
    && (c.rhythms.some(x => x.job === id) || !W.oneOffDone(c, w.all).some(f => f.job === id)));
  const struck = open.filter(id => r.struck.has(id)), to = struck.length ? struck : open;
  if (!to.length) return;
  const each = Math.floor(minutes / to.length), share = new Map<string, number>();
  to.forEach((id, k) => {
    const m = each + (k === 0 ? minutes - each * to.length : 0);
    share.set(id, m);
    if (m > 0) w.put({ type: 'errandShare', run: r.fact.seq, job: id, minutes: m }, at, day);
  });
  /* an errand is done by the run only with a whole minute of it: a strike in a run of no minutes (or a minute shared
     among many) marks nothing done (rule 10; review of D-139). It stays as it was. */
  for (const id of struck.filter(x => (share.get(x) ?? 0) > 0)) {
    if (!begunOn(w.all, day, id)) w.put({ type: 'jobBegun', job: id, from: 'record' }, at, day);
    /* a one-off done today is today's: it leaves a later day it was put on, as a tick does (D-134) */
    if (!c.rhythms.some(x => x.job === id)) for (const e of laterDays(w.all, day).get(id) ?? []) w.put({ type: 'planChanged', entry: e, day: null }, at, day);
    markDoneIn(w, c, id, at, day, 0, r.fact.seq);
  }
}
/** Said done while its own delve still runs (Done on Today, a tick in the satchel): the delve finishes there first, so
    its minutes count once and the job is not paid twice (Dan, 2026-09-27, D-120). Its end is marked seen: the job's
    return tells the story, and the delve's end doesn't come back later. */
function endRunOn(w: W, c: Content, job: string, nowMs: number, now: Moment, keepEnd = false) {
  const r = activeRun(w.all), from = w.all.length;
  if (r && r.fact.job === job) finishRun(w, c, r, nowMs, now);
  /* a side chamber found on the delve Done ended is shown on its end, not swallowed (D-122) */
  if (w.all.slice(from).some(f => f.type === 'findGiven' && f.why === 'chamber')) return;
  /* an end of this job's delve not yet looked at (it ended with Dan on another screen, or "Is it done?" was left) is
     answered by this Done: it doesn't come back on a later opening (D-120). The delve screen answering its own end
     keeps it, and marks it seen itself when Dan leaves. */
  const end = ofType(w.all, 'delveEnded').pop();
  if (!keepEnd && end && end.job === job && !w.all.some(f => f.type === 'seen' && f.ref === end.seq)) w.put({ type: 'seen', what: 'step', ref: end.seq });
}
/** Going into another app pauses the delve (D-094): at the moment Dan left, or, if he left in a breather, at the moment
    the next delve would have begun without him. Time away never counts; nothing already done is lost. */
function pauseAway(w: W, from: number, to: number) {
  const r = activeRun(w.all);
  /* a time away from before this run began (an old one met again) never pauses it (fresh review) */
  if (!r || from < r.plan.startedAt) return;
  const s = runAt(r.plan, r.marks, from);
  let at = s.phase === 'delve' ? from : s.phase === 'breather' ? from + s.breatherLeftMs : null;
  if (at === null || at >= to) return;
  /* never stamped before something already in the log (the log stays in time order); the hold still counts from when
     he left, so a background write (the inbox, the calendar) landing after it never counts the time away (deep review) */
  const stamp = Math.max(at, epochOf(w.all[w.all.length - 1].at));
  if (runAt(r.plan, r.marks, at).phase === 'delve') w.put({ type: 'delveHeld', why: 'away', ...(stamp > at ? { from: at } : {}) }, momentOf(stamp, w.off));
}

/** Whether the side chamber between the last place reached on foot and the next has been found (D-122): once there. */
function chamberFound(facts: Fact[]): boolean {
  for (let i = facts.length - 1; i >= 0; i--) {
    const f = facts[i];
    if (f.type === 'findGiven' && f.why === 'chamber') return true;
    if (f.type === 'arrived' && f.kind === 'place' && f.how !== 'key') return false;
  }
  return false;
}
/** Minutes of effort from here to the side chamber, if it is still ahead on this stretch of road (D-122). */
export function toChamber(facts: Fact[], st: S.StoryState): number | null {
  /* minutes taken back are made up first: they are part of the way there (fresh review) */
  const r = roadOf(facts);
  return chamberFound(facts) ? null : Math.max(0, S.chamberAt(st) - r.walked + r.owed);
}
/** The side chamber is halfway to the next place, the same distance whatever the delves' lengths or jobs (Dan, D-122):
    reached once the minutes walked pass it, found on the delve that passes it (its find is shown at the delve's end). */
function sideChamber(w: W, c: Content, at: Moment, day: string) {
  if (toChamber(w.all, S.storyState(w.all, c.story)) === 0) giveFind(w, c, 'chamber', at, day);
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
    /* halfway to the next place, a side chamber (D-122); the first delve on a new job after a long stretch brings a find (§1, D-044) */
    sideChamber(w, c, at, day);   /* before the place: the stretch it ends */
    const others = [...new Set(before.map(g => g.job))].filter(x => x !== j.id);
    if (before.length && before[before.length - 1].job !== j.id && others.some(x => delveMinutesOn(w.all, day, x) >= S.LONG_STRETCH)
      && !ofType(onDay(w.all, day), 'findGiven').some(f => f.why === 'switching')) giveFind(w, c, 'switching', at, day);
    gifts(w, c, at, day);
    sideChamber(w, c, at, day);   /* after it: the new stretch's, if Dan is already past its halfway (a held arrival) */
  }
  /* stepped away and never back: after three hours, or once its day is over, it finishes where it was paused, on its day */
  const hold = r.marks[r.marks.length - 1];
  if (s.phase === 'held' && hold?.kind === 'hold' && (nowMs - hold.at > HOLD_MAX || gameDay(momentOf(nowMs, w.off)) !== gameDay(momentOf(hold.at, w.off)))) {
    /* its minutes as they were at the pause; written no earlier than the log's last fact, so the log keeps time order (D-120) */
    finishRun(w, c, activeRun(w.all)!, hold.at, momentOf(Math.max(hold.at, epochOf(w.all[w.all.length - 1].at)), w.off));
    return;
  }
  if (s.phase === 'ended' && s.how === 'ranOut') {
    const at = momentOf(s.endedAt!, w.off), minutes = Math.round(s.countedMs / MIN);
    w.put({ type: 'delveEnded', job: j.id, minutes, how: 'ranOut', run: r.fact.seq }, at, day);
    clearStruck(w, c, j.id, at, day);
    if (r.fact.errands) gifts(w, c, at, day);
    /* a repeating job's run is its session, at the run's end (D-121) */
    else if (sessionEnds(w.all, day, j, minutes)) markDoneIn(w, c, j.id, at, day);
    else joinSession(w, c, day, j, minutes, at);
  }
}

/* ---------- the week close, the morning after camp, the welcome back (slice 4) ---------- */

/** The week of play a calendar week is (1 = the week of the first opening). */
function playWeek(facts: Fact[], week: string): number {
  const first = facts.find(f => f.type === 'opened');
  return first ? Math.round(W.daysBetween(calendarWeek(first.day), week) / 7) + 1 : 1;
}

/** The most story weeks a week close's glimpse may lag behind the story week Dan is in: an older one is passed and is
    never shown (deep review S#4: at a fast pace the page showed a place left many weeks before). */
const GLIMPSE_LAG = 3;
/** Things learned a week close shows for each story week begun in its calendar week, and at most (deep review S#4). */
const LEARNED_PER_WEEK = 3, LEARNED_MAX = 9;
/** The most "so far" lines one week close shows (deep review S#5: one month has six). */
const SO_FAR_MAX = 6;

/**
 * The daybook's page for each calendar week that had anything done, written once at the first opening after the week
 * (TOOLS §6; BALANCING §7): what was learned (three for each story week begun in the week, up to nine), the months'
 * "so far" lines once the story has reached their month (by story week, not by week of play, so a slow or a fast player
 * gets every line; one whose beats haven't played yet waits for a later page: deep review S#5), the story week's glimpse
 * (never one the story has moved past, nor one lagging far behind: S#1, S#4), and the sealed things the Keys opened. A
 * week with nothing done gets no page, and no gap is marked (D-043). What the real week held is read from the log when
 * the page is shown.
 */
function weekClose(w: W, c: Content, at: Moment, day: string, storyWeek: number) {
  const closed = new Set(ofType(w.all, 'weekClosed').map(f => f.week));
  const weeks = [...new Set(doneFacts(w.all).map(f => calendarWeek(f.day)))].filter(x => x < calendarWeek(day) && !closed.has(x)).sort();
  for (const wk of weeks) {
    const st = S.storyState(w.all, c.story);
    const before = new Set(ofType(w.all, 'weekClosed').flatMap(f => f.learned));
    /* the story weeks played in this calendar week first, in order; then the oldest: a niche opened long after its week
       never pushes out what this week learned (D-129) */
    const began = ofType(w.all, 'storyWeekBegan'), weekAt = (d: string) => began.filter(f => f.day < d).pop()?.w ?? 1;
    const from = weekAt(wk), to = Math.max(from, ...began.filter(f => calendarWeek(f.day) === wk).map(f => f.w));
    const learned = c.story.learned.filter(l => l.w <= storyWeek && !before.has(l.id) && l.req.every(r => S.met(st, r)))
      .map((l, k) => ({ l, k, here: l.w >= from && l.w <= to ? 0 : 1 })).sort((a, b) => a.here - b.here || a.l.w - b.l.w || a.k - b.k)
      /* and up to a week's worth of lines left behind (an evening at camp can trail its week, D-154) */
      .slice(0, Math.min(LEARNED_MAX, LEARNED_PER_WEEK * (to - from + 2))).map(({ l }) => l.id);
    const n = playWeek(w.all, wk);
    /* every month whose first story week has come: its lines not shown yet whose beats have played, in order */
    const shownSoFar = new Set(ofType(w.all, 'weekClosed').flatMap(f => f.soFar));
    const soFar = c.story.soFar.filter(m => m.w <= storyWeek).flatMap(m => m.items ?? [])
      .filter(l => !shownSoFar.has(l.id) && l.req.every(r => S.met(st, r))).slice(0, SO_FAR_MAX).map(l => l.id);
    /* the glimpse waits until Dan has been where it looks (D-079), and has seen what it says he has (D-154): a later
       week's close shows it then */
    /* (the latest such: the week just walked, before the story moves past it, D-160) */
    const glimpse = [...c.story.beats].reverse().find(b => b.kind === 'close' && b.w <= storyWeek && b.w >= storyWeek - GLIMPSE_LAG
      && !st.played.has(b.id) && st.visited.has(b.stretch) && b.req.every(r => S.met(st, r)) && !(b.until && S.met(st, b.until))) ?? null;
    if (glimpse) w.put({ type: 'beatPlayed', id: glimpse.id }, at, day);
    /* every niche a Key opened in the week, however it came to be used (S4: built only from the old floor's Keys, it never
       filled once D-142 took the floor away) */
    const seals = keyOpenedIn(w.all, wk).map(f => f.seal);
    w.put({ type: 'weekClosed', week: wk, n, learned, soFar, glimpse: glimpse?.id ?? null, seals }, at, day);
  }
}

/** The niches a Key opened in a calendar week, in order: a sealOpened just after a Key was used (or, in an old save, just
    after one was earned and spent at once). */
function keyOpenedIn(facts: Fact[], week: string): FactOf<'sealOpened'>[] {
  const bySeq = new Map(facts.map(f => [f.seq, f]));
  return ofType(facts, 'sealOpened').filter(f => f.how !== 'road' && calendarWeek(f.day) === week
    && (bySeq.get(f.seq - 1)?.type === 'keyUsed' || bySeq.get(f.seq - 1)?.type === 'keyEarned'));
}
/** What a calendar week kept for Dan to read again on its Daybook page (D-143 B): the finds it gave and the niches its
    Keys opened, in the order they came. */
export function weekKept(facts: Fact[], week: string): { finds: string[]; opened: string[] } {
  const finds = [...new Set(ofType(facts, 'findGiven').filter(f => calendarWeek(f.day) === week).map(f => f.id))];
  return { finds, opened: [...new Set(keyOpenedIn(facts, week).map(f => f.seal))] };
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
  /* the last night's last goodnight, if it was kept (a later Go to sleep the same night, past bedtime, is when he went to
     bed: no head start, D-160 review) */
  const gns = ofType(w.all, 'goodnight').filter(f => f.day < day), lastGn = gns[gns.length - 1];
  const night = lastGn?.kept ? lastGn : undefined;
  /* once per night: a later morning find (saves from before the head start) or a later head start (when no find was left
     to give, every open paid it again: deep review R#1) says this night was already paid */
  if (!night || w.all.some(f => f.seq > night.seq && ((f.type === 'findGiven' && f.why === 'morning') || (f.type === 'stepsGained' && f.job === 'sleep')))) return;
  /* in bed on time: the day begins a little further in (Dan, D-083); once per night, with the morning's find */
  w.put({ type: 'stepsGained', minutes: HEAD_START, job: 'sleep' }, at, day);
  gifts(w, c, at, day);
  const camp = w.all.find(f => f.seq > night.seq && f.type === 'beatPlayed' && f.id.endsWith('.camp')) as FactOf<'beatPlayed'> | undefined;
  if (camp && camp.day === night.day) {
    const id = camp.id.replace(/\.camp$/, '.morning');
    /* the story's opening (the hillside, before any job) shares the week-1 morning's id: it is never a morning after camp */
    const opening = S.beatOf(c.story, id)?.kind === 'morning' && S.beatOf(c.story, id)?.w === 1 && !confirms(id).length;
    if (!opening && !confirms(id).length && !S.storyState(w.all, c.story).played.has(id)) w.put({ type: 'beatPlayed', id }, at, day);
  }
  giveFind(w, c, 'morning', at, day);
}

/** Last week's Keys that should have landed and didn't (Dan, D-152): a "times a week" job whose marks met its number,
    with no Key for that week (made to repeat mid-week, or its last session under another job of its name), lands its
    Key now, counted to last week (its five Keys a week included), and Today says so. Once: the Key is then that week's. */
function lateKeys(w: W, c: Content, at: Moment, day: string) {
  const last = W.addDays(calendarWeek(day), -1);
  /* only a rhythm that stood by last week's end: a job made to repeat since is not paid for the weeks before */
  const stood = W.live(c.base ?? c, w.all, calendarWeek(day)).rhythms;
  for (const r of c.rhythms.filter(x => Rep.weekly(x) && stood.some(y => y.id === x.id))) {
    if (ofType(w.all, 'keyEarned').some(k => k.rhythm === r.id && Rep.samePeriod(r, k.for ?? k.day, last))) continue;
    if (S.keysIn(w.all, last) >= S.KEYS_A_WEEK || S.sessionsIn(w.all, r, last, S.RETURN_MIN) < S.needOf(r)) continue;
    landKey(w, r.id, at, day, last);
  }
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
  /** "Just this one today" (MORNING-REPORT Part 3 #7): every other job still to do today is set aside, as "Not today". */
  | { do: 'justThis'; job: string }
  | { do: 'begin'; job: string }
  | { do: 'unbegin'; job: string }
  | { do: 'putBack'; job: string }
  | { do: 'startRun'; job: string; minutes: number; count: number }
  /** An errand run (D-139): one delve over several jobs, each struck off as it is done */
  | { do: 'startErrands'; jobs: string[]; minutes: number; count: number }
  | { do: 'strikeErrand'; job: string }
  /** "Count them": the errand run's end counted as struck off (any other command counts it too) */
  | { do: 'countErrands' }
  | { do: 'skipBreather' }
  | { do: 'stepAway' }
  | { do: 'resume' }
  | { do: 'finishHere' }
  /** Dan was in another app from `from` to `to` (game-clock ms): the delve pauses where he left (D-094). */
  | { do: 'away'; from: number; to: number }
  /** "It's done": a job delved on said done (every job is a delve, D-117; "Already done" and "yesterday" are gone);
      `keepEnd`: a delve under way on it ends and its end screen stays (D-120) */
  | { do: 'done'; job: string; keepEnd?: boolean }
  /** Ticked off without a delve, with the time it took (D-134): one of TICK_CHOICES, or 0 ("No more") for a job with
      delved minutes behind it */
  | { do: 'tickOff'; job: string; minutes: number }
  /** "Not done after all" (D-131): a job done today is to do again; what it earned stays and is never paid twice */
  | { do: 'notDone'; job: string }
  /** "Waiting on…" (D-137): a one-off set aside until someone replies, back on Today on `until`; `who` the short line
      ("the vet"; left out: the line it had). Again on a job waiting: "Still waiting", a new date */
  | { do: 'waitOn'; job: string; until: string; who?: string }
  /** "Back to it" (D-137): an ordinary job again (on Today if it had come back there, else with no day); `today`: back
      on today's list whatever its day (taking back a wait just set from Today) */
  | { do: 'backToIt'; job: string; today?: boolean }
  /** Tonight's "Tomorrow starts with" (D-131): the job tomorrow opens with (null: as planned) */
  | { do: 'firstJob'; job: string | null }
  | { do: 'cantStart'; job: string }
  | { do: 'seen'; what: 'step' | 'arrival' | 'morning' | 'welcome'; ref: number }
  | { do: 'guess'; mark: string; guess: string }
  | { do: 'choose'; beat: string; pick: number }
  | { do: 'read'; record: string }
  /* slice 4 */
  | { do: 'saveRhythm'; rhythm: Rhythm; job: Job }
  | { do: 'stopRhythm'; id: string }
  /* the job editor (D-112): any job, with or without a rhythm; removing it (Undo saves it again); its first step, its note */
  | { do: 'saveJob'; job: Job; rhythm: Rhythm | null }
  | { do: 'removeJob'; id: string }
  | { do: 'hideDone'; job: string; on: string; back?: boolean }
  | { do: 'firstStep'; job: string; step: string }
  | { do: 'noteJob'; job: string; note: string }
  /* the job's list (D-126): its whole text, as Dan leaves it */
  | { do: 'listJob'; job: string; list: string }
  /* a line of the job's list struck off (or back) in its delve (D-126) */
  | { do: 'strikeLine'; job: string; k: number }
  | { do: 'addItems'; lines: string[] }
  /** A stray thought parked mid-delve (D-138): a job with no day in the Satchel, the delve carrying on untouched */
  | { do: 'park'; line: string }
  /** A kept Key used on a locked thing Dan chose on the Map (D-142). */
  | { do: 'useKey'; seal: string; from?: number }
  /** Lines from outside the app (D-113), each added once, whatever happens between writing and clearing */
  | { do: 'takeInbox'; lines: { id: string; text: string }[] }
  | { do: 'tick'; id: string }
  | { do: 'dropItem'; id: string }
  | { do: 'planWeek'; week: string }
  /** Lay out the rest of the week from today, keeping what Dan placed himself (D-114) */
  | { do: 'replan' }
  | { do: 'movePlan'; entry: string; day: string | null; time?: string | null }
  | { do: 'planJob'; job: string; day: string; time?: string }
  /** Put a job on a day, from the Satchel or the job menu (D-131): a one-off leaves every other day it was on (a job is
      in one place); a recurring job's session moves off today if it was there */
  | { do: 'putOnDay'; job: string; day: string; entry?: string }
  /** "Delve now" (D-131): a new one-off on today, its delve begun at once (one delve of 30 minutes, D-124). `from`: a
      job Dan had before, picked under the box (D-136): the new one carries on from it; a job still his (recurring, or a
      one-off still to do) is delved on itself, never added twice */
  | { do: 'delveNow'; line: string; from?: string }
  /** "Save for later" in the Satchel's box (D-131): a new one-off with no day; tied as "Delve now" is (D-136), and a
      job still Dan's is not added again */
  | { do: 'saveForLater'; line: string; from?: string }
  /** "No thanks" to "… keeps coming back. Make it repeat?" (D-136) */
  | { do: 'declineRepeat'; name: string }
  | { do: 'addToWeek'; line: string; day: string; time?: string }
  /** Today's "Add a job" (D-143 C): a job on today; `from`: a job Dan had before, picked under the box (D-136) */
  | { do: 'addToday'; line: string; from?: string }
  | { do: 'bedtime'; time: string }
  | { do: 'goodnight' }
  | { do: 'closeRead'; week: string }
  | { do: 'offerAnswered'; week: string }
  | { do: 'remind'; target: string; lead: R.Lead | null }
  | { do: 'reminders'; on: boolean }
  | { do: 'nudge'; on: boolean }
  /* the week's look-ahead in the Daybook (D-116): earns nothing (P16) */
  | { do: 'keepItem'; id: string }
  | { do: 'somedayItem'; id: string }
  | { do: 'pinWeek'; job: string | null }
  | { do: 'lookAhead'; finished: boolean }
  /* the phone's calendar, read-only (D-115) */
  | { do: 'calendarShow'; on: boolean; calendars: string[] | null }
  | { do: 'calendarRead'; events: CalEvent[]; days: number };

/** Only a run the dial can set: whole minutes up to its longest stop, one to eight delves (D-120). */
const dialRun = (minutes: number, count: number) =>
  Number.isInteger(minutes) && minutes >= 1 && minutes <= DIAL[DIAL.length - 1] && Number.isInteger(count) && count >= 1 && count <= 8;
/** A job that can go on an errand run (D-139): Dan's, not done today, and not a one-off already finished. */
const errandable = (c: Content, facts: Fact[], day: string, id: string) => {
  const j = c.jobs.find(x => x.id === id);
  /* a job waiting on a reply is not taken on a run until it is back (D-137) */
  return !!j && !j.stopped && id !== ERRAND_RUN && !doneOn(facts, day).has(id) && !W.waitingOf(facts).has(id)
    && (c.rhythms.some(r => r.job === id) || !W.oneOffDone(c, facts).some(f => f.job === id));
};

/** Put a job on a day (the Satchel, the job menu, a name typed again, D-131, D-143): a one-off leaves every other day it
    was on (a job is in one place); a recurring job's session moves off today if it was there. */
function putOn(w: W, c: Content, v: View, day: string, job: string, to: string, entry?: string) {
  const j = c.jobs.find(x => x.id === job && !x.stopped);
  if (!j || to < day || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return;
  const recurring = c.rhythms.some(x => x.job === j.id);
  /* a one-off done is finished (review of D-131); a recurring job done today keeps today's place, its record there */
  if (!recurring && W.oneOffDone(c, w.all).some(f => f.job === j.id)) return;
  if (recurring && v.done.has(j.id) && to === day) return;
  /* where it is now, from today on: a one-off's every place; a recurring job's place today only */
  const weeks = new Set([calendarWeek(day), ...ofType(w.all, 'planMade').map(f => f.week), ...ofType(w.all, 'planAdded').map(f => calendarWeek(f.entry.day))]);
  /* a session held in the Week moves itself, not another (second review of D-131) */
  const all = [...weeks].filter(x => x >= calendarWeek(day)).flatMap(x => W.planOf(w.all, x) ?? []);
  const held = entry ? all.find(e => e.id === entry && e.job === j.id && e.day >= day) : undefined;
  if (entry && !held) return;
  const at = held ? [held] : all.filter(e => e.job === j.id && (recurring ? e.day === day && !v.done.has(j.id) : e.day >= day));
  if (held && held.day === day && recurring && v.done.has(j.id)) return;
  /* chosen for tomorrow and put elsewhere: the choice goes with it */
  if (firstChosen(w.all, W.addDays(day, 1)) === j.id && to !== W.addDays(day, 1) && !recurring) w.put({ type: 'firstChosen', job: null, on: W.addDays(day, 1) });
  if (at.length === 1 && at[0].day === to && !asideOn(w.all, day).has(j.id)) return;
  for (const e of at) w.put({ type: 'planChanged', entry: e.id, day: null });
  const n = ofType(w.all, 'planAdded').length + 1;
  w.put({ type: 'planAdded', entry: { id: `pa-${n}`, job: j.id, day: to } });
  /* on today: back on the list if it was set aside; to a later day: off today's list, begun or not */
  if (to === day) { if (asideOn(w.all, day).has(j.id)) w.put({ type: 'putBack', job: j.id }); }
  else if (v.slate.includes(j.id) && !v.done.has(j.id) && v.run?.job.id !== j.id && !asideOn(w.all, day).has(j.id)) w.put({ type: 'setAside', job: j.id });
}
/** A new job typed in (the Week's +, Today's box, Tonight's line, Siri): one Dan still has is never added twice (D-136,
    the flow review J4): it is put on the day instead (with no day: it is left where it is). Returns the job. */
function addJob(w: W, c: Content, v: View, base: Content, day: string, line: string, on: string | null, from?: string, time?: string, extra: Partial<FactOf<'itemAdded'>> = {}): string | null {
  const name = cleanLine(line);
  if (!name) return null;
  const tie = tieFor(base, w.all, name, from);
  if (tie?.same) {
    const recurring = c.rhythms.some(r => r.job === tie.job.id);
    /* a recurring job typed for a later day is one more session there: today's stays where it is (review of D-144) */
    if (on && recurring && on > day) {
      const planned = [calendarWeek(on)].flatMap(x => W.planOf(w.all, x) ?? []).some(e => e.job === tie.job.id && e.day === on);
      if (!planned) w.put({ type: 'planAdded', entry: { id: `pa-${ofType(w.all, 'planAdded').length + 1}`, job: tie.job.id, day: on, ...(time ? { time } : {}) } });
    } else if (on && !(recurring && v.done.has(tie.job.id) && on === day)) {
      putOn(w, c, v, day, tie.job.id, on);
      const e = ofType(w.all, 'planAdded').pop();
      if (time && e && e.entry.job === tie.job.id && e.entry.day === on) w.put({ type: 'planChanged', entry: e.entry.id, day: on, time });
    }
    return tie.job.id;
  }
  const id = `it-${ofType(w.all, 'itemAdded').length + 1}`;
  w.put({ type: 'itemAdded', id, name, ...extra, ...(tie ? { from: tie.job.id } : {}) });
  if (on) w.put({ type: 'planAdded', entry: { id: `pa-${ofType(w.all, 'planAdded').length + 1}`, job: id, day: on, ...(time ? { time } : {}) } });
  return id;
}

/** Whether a log runs on this build's rules: the clock settled, an opening, the view (deep review B14: a file is tried
    this way before it is ever restored). */
export function runs(facts: Fact[], base: Content, now: Moment): boolean {
  try { const all = facts.concat(settle(facts, base, now)); see(all.concat(act(all, base, { do: 'open' }, now)), base, now); return true; } catch { return false; }
}

/** The facts a command adds to the log (including anything the clock made due first). */
export function act(facts: Fact[], base: Content, cmd: Command, now: Moment): Fact[] {
  const w = writer(facts, now), nowMs = epochOf(now), c = W.live(base, facts);
  /* before anything the clock made due: the time away must not have counted */
  if (cmd.do === 'away') { settleIn(w, c, Math.min(cmd.from, nowMs)); pauseAway(w, cmd.from, Math.min(cmd.to, nowMs)); }   /* what was due before he left first, in time order (D-120) */
  settleIn(w, c, nowMs);
  /* an errand run's end not yet counted is counted before anything else Dan does, except striking on it (D-139) */
  /* a thought parked on an errand run's end never counts it: its strikes are still to come (D-138 × D-139) */
  /* a new delve never starts while its "What got done?" waits: counted then, its stories would be lost (review of D-144) */
  const waits = !!pendingErrands(w.all);
  if (cmd.do !== 'strikeErrand' && cmd.do !== 'away' && cmd.do !== 'park' && !(waits && (cmd.do === 'startRun' || cmd.do === 'startErrands'))) { const p = pendingErrands(w.all); if (p) errandsEnd(w, c, p, now); }
  const day = dayOf(w.all, now), v = see(w.all, c, now);
  switch (cmd.do) {
    case 'open': {
      const was = S.storyState(w.all, c.story).week, first = !onDay(w.all, day).some(f => f.type === 'opened');
      w.put({ type: 'opened' });
      if (first) welcomeBack(w, c, now, day);
      /* a week with no plan yet is laid out at its first opening, from today on, so the Week and Today always agree;
         Dan changes it as he likes (Dan, D-078; review finding, D-080) */
      if (!W.planMade(w.all, calendarWeek(day))) w.put({ type: 'planMade', week: calendarWeek(day), entries: W.planWeek(c, w.all, calendarWeek(day), day) });
      /* no weekly floor of Keys any more (Dan, D-142): a Key always means a recurring job kept up */
      storyClock(w, c, now, day);
      lateKeys(w, c, now, day);
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
      /* choosing the day as planned is an answer too: the choice has been seen (D-114) */
      if (cmd.capacity !== v.capacity || !ofType(onDay(w.all, day), 'capacityChosen').length) {
        w.put({ type: 'capacityChosen', capacity: cmd.capacity, suggested: v.suggested });
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
    case 'justThis': {
      const aside = asideOn(w.all, day);
      if (!v.order.includes(cmd.job) || v.done.has(cmd.job)) break;
      /* an appointment keeps its time: it is never set aside by this (fresh review) */
      for (const id of v.order) if (id !== cmd.job && !v.done.has(id) && !aside.has(id) && !v.times[id] && v.run?.job.id !== id && v.underWay !== id) w.put({ type: 'setAside', job: id });
      break;
    }
    case 'begin':
      if (!jobOf(c, cmd.job).delve && !v.done.has(cmd.job) && v.underWay !== cmd.job) w.put({ type: 'jobBegun', job: cmd.job, from: 'app' });
      break;
    /* undoing a tap made by mistake (review 2, D-088): Begin taken back, or a job set aside put back on today's list */
    case 'unbegin': if (v.underWay === cmd.job) w.put({ type: 'beginUndone', job: cmd.job }); break;
    case 'putBack': if (asideOn(w.all, day).has(cmd.job)) w.put({ type: 'putBack', job: cmd.job }); break;
    case 'startRun':
      /* only a run the dial can set: whole minutes up to its longest stop, one to eight delves (D-120) */
      if (v.run || waits || !dialRun(cmd.minutes, cmd.count) || cmd.job === ERRAND_RUN) break;
      beginRun(w, c, cmd.job, cmd.minutes, cmd.count, day);
      break;
    case 'startErrands': {
      /* never while another delve runs; only jobs still to do, each once (D-139) */
      const jobs = Array.isArray(cmd.jobs) ? cmd.jobs : [];
      if (v.run || waits || !dialRun(cmd.minutes, cmd.count) || jobs.length < ERRANDS_MIN || jobs.length > ERRANDS_MAX || new Set(jobs).size !== jobs.length) break;
      if (!jobs.every(id => errandable(c, w.all, day, id))) break;
      w.put({ type: 'delveStarted', job: ERRAND_RUN, minutes: cmd.minutes, count: cmd.count, errands: jobs.slice() });
      break;
    }
    case 'strikeErrand': {
      /* in its own run, running or paused, or on its end before it is counted: a strike never outlives it */
      const r = activeRun(w.all) ?? pendingErrands(w.all);
      if (r?.fact.errands?.includes(cmd.job)) w.put({ type: 'errandStruck', run: r.fact.seq, job: cmd.job });
      break;
    }
    case 'countErrands': break;   /* counted above */
    case 'skipBreather': if (v.run?.phase === 'breather') w.put({ type: 'breatherSkipped' }); break;
    case 'stepAway': if (v.run?.phase === 'delve') w.put({ type: 'delveHeld' }); break;
    case 'resume': if (v.run?.phase === 'held') w.put({ type: 'delveResumed' }); break;
    case 'finishHere': {
      const r = activeRun(w.all);
      if (r) finishRun(w, c, r, nowMs, now);
      break;
    }
    case 'done': {
      const on = day;
      if (!c.jobs.some(j => j.id === cmd.job) || doneOn(w.all, on).has(cmd.job)) break;
      /* an errand is done by being struck off in its run: its end counts it (D-139) */
      if (activeRun(w.all)?.fact.errands?.includes(cmd.job)) break;
      /* done while a delve on it runs: that delve ends first (D-120); a repeating job's run is then its session, on the
         run's day (D-121), and nothing more is written (not a second, empty session after 04:00) */
      const from = w.all.length;
      endRunOn(w, c, cmd.job, nowMs, now, cmd.keepEnd);
      if (w.all.slice(from).some(f => f.type === 'jobDone' && f.job === cmd.job)) break;
      /* Done with no Begin: recorded afterwards (the test's sharpest line, MVP.md) */
      if (!begunOn(w.all, day, cmd.job)) w.put({ type: 'jobBegun', job: cmd.job, from: 'record' }, now, on);
      markDoneIn(w, c, cmd.job, now, on);
      break;
    }
    case 'tickOff': {
      /* a job done without a delve, ticked off with the time it took (Dan, D-134): those minutes move Dan and the job is
         done, with its story moment, as a delve's would be. "No more" (0) only for a job with delved minutes behind it */
      const j = c.jobs.find(x => x.id === cmd.job), recurring = c.rhythms.some(r => r.job === cmd.job);
      /* never while a delve runs (its own, or another's: Dan is in the middle of that one) */
      if (!j || doneOn(w.all, day).has(cmd.job) || activeRun(w.all)) break;
      if (!recurring && W.oneOffDone(c, w.all).some(f => f.job === cmd.job)) break;   /* a one-off is finished once */
      const behind = behindOf(w.all, c, cmd.job, day);
      if (!(TICK_CHOICES as readonly number[]).includes(cmd.minutes) && !(cmd.minutes === 0 && behind > 0)) break;
      /* an end of its delve not yet looked at is answered by this (D-120) */
      endRunOn(w, c, cmd.job, nowMs, now);
      if (!begunOn(w.all, day, cmd.job)) w.put({ type: 'jobBegun', job: cmd.job, from: 'record' });
      /* a one-off done today is today's: it leaves a later day it was put on, as a delve on it does (D-131) */
      if (!recurring) for (const e of laterDays(w.all, day).get(cmd.job) ?? []) w.put({ type: 'planChanged', entry: e, day: null });
      if (cmd.minutes > 0) { w.put({ type: 'stepsGained', minutes: cmd.minutes, job: cmd.job, tick: true }); sideChamber(w, c, now, day); }
      markDoneIn(w, c, cmd.job, now, day, cmd.minutes);
      if (cmd.minutes > 0) sideChamber(w, c, now, day);
      break;
    }
    case 'notDone': {
      /* only a job done today and still done; never while a delve on it runs (its end answers it) */
      if (!doneOn(w.all, day).has(cmd.job) || inRun(w.all, cmd.job) || hiddenDone(w.all).has(`${cmd.job}|${day}`)) break;
      /* the minutes it was ticked off with are taken back too (Dan, deep review B3); its delved minutes never are: a
         recurring job's ticks that day, a one-off's since it was last done */
      const recurring = c.rhythms.some(r => r.job === cmd.job);
      const prev = doneFacts(w.all).filter(f => f.job === cmd.job && !(f.day === day)).pop();
      const taken = recurring ? ticksOn(w.all, day, cmd.job) : ticksSince(w.all, cmd.job, prev?.seq ?? -1);
      w.put({ type: 'doneUndone', job: cmd.job, on: day });
      if (taken > 0) w.put({ type: 'tickTakenBack', job: cmd.job, minutes: taken, on: day });
      break;
    }
    case 'waitOn': {
      /* only a one-off still to do: a recurring job simply comes again on its next day (D-137) */
      const j = c.jobs.find(x => x.id === cmd.job && !x.stopped);
      if (!j || c.rhythms.some(r => r.job === j.id) || W.oneOffDone(c, w.all).some(f => f.job === j.id)) break;
      /* a later day: it comes back on it */
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cmd.until) || cmd.until <= day) break;
      /* never while its own delve runs, or that delve's end is still to be answered */
      if (inRun(w.all, j.id) || v.runEnd?.job.id === j.id || v.runEnd?.errands?.some(e => e.job.id === j.id)) break;
      const was = W.waitingOf(w.all).get(j.id);
      const who = (cmd.who ?? was?.who ?? '').trim().slice(0, WHO_MAX);
      if (was && was.until === cmd.until && (was.who ?? '') === who) break;
      w.put({ type: 'waitSet', job: j.id, until: cmd.until, ...(who ? { who } : {}) });
      /* it leaves every day it was put on, from today on: it comes back on its own day (a job is in one place, D-131) */
      const weeks = new Set([calendarWeek(day), ...ofType(w.all, 'planMade').map(f => f.week), ...ofType(w.all, 'planAdded').map(f => calendarWeek(f.entry.day))]);
      for (const wk of [...weeks].filter(x => x >= calendarWeek(day))) for (const e of W.planOf(w.all, wk) ?? []) if (e.job === j.id && e.day >= day) w.put({ type: 'planChanged', entry: e.id, day: null });
      /* chosen for tomorrow: the choice goes with it */
      if (firstChosen(w.all, W.addDays(day, 1)) === j.id) w.put({ type: 'firstChosen', job: null, on: W.addDays(day, 1) });
      break;
    }
    case 'backToIt': {
      const was = W.waitingOf(w.all).get(cmd.job);
      if (!was || !c.jobs.some(j => j.id === cmd.job && !j.stopped)) break;
      w.put({ type: 'waitEnded', job: cmd.job });
      /* come back on Today: it stays on today's list, as an ordinary job; still ahead: with no day, in the Satchel */
      if (was.until <= day || cmd.today) {
        const n = ofType(w.all, 'planAdded').length + 1;
        w.put({ type: 'planAdded', entry: { id: `pa-${n}`, job: cmd.job, day } });
        if (asideOn(w.all, day).has(cmd.job)) w.put({ type: 'putBack', job: cmd.job });
      }
      break;
    }
    case 'firstJob': {
      const on = W.addDays(day, 1), was = firstChosen(w.all, on);
      /* never a one-off already done: it is finished */
      /* never a job waiting on a reply: it comes back on its own day (review of D-137) */
      if ((cmd.job === null || (c.jobs.some(j => j.id === cmd.job && !j.stopped) && !finishedBy(c, w.all, cmd.job, on) && !W.waitingOf(w.all).has(cmd.job))) && was !== cmd.job) {
        w.put({ type: 'firstChosen', job: cmd.job, on });
        /* a one-off chosen for tomorrow is tomorrow's: off any later day it was put on (second review of D-131) */
        if (cmd.job && !c.rhythms.some(r => r.job === cmd.job)) for (const e of laterDays(w.all, on).get(cmd.job) ?? []) w.put({ type: 'planChanged', entry: e, day: null });
      }
      break;
    }
    case 'cantStart': w.put({ type: 'cantStartUsed', job: cmd.job }); break;
    /* Dan's own rhythms and lines: editing earns nothing and loses nothing (P16, D-038) */
    case 'saveRhythm': if (cmd.job.name.trim()) w.put({ type: 'rhythmSaved', rhythm: { ...unsaved(cmd.rhythm), job: cmd.job.id }, job: { ...cmd.job, name: cmd.job.name.trim() } }); break;
    case 'stopRhythm': if (c.rhythms.some(r => r.id === cmd.id)) w.put({ type: 'rhythmStopped', id: cmd.id }); break;
    case 'saveJob': {
      const name = cmd.job.name.trim().slice(0, 120);
      if (!name) break;
      const job: Job = { ...cmd.job, name, length: Math.min(240, Math.max(5, Math.round(cmd.job.length))) };
      delete job.stopped;
      for (const k of ['firstStep', 'note'] as const) { const x = job[k]?.trim(); if (x) job[k] = x.slice(0, 160); else delete job[k]; }
      if (cmd.rhythm) { w.put({ type: 'rhythmSaved', rhythm: { ...unsaved(cmd.rhythm), job: job.id }, job }); break; }
      /* "doesn't repeat": its rhythm ends (a one-off from now, until done), then the job as edited */
      for (const r of c.rhythms.filter(x => x.job === job.id)) w.put({ type: 'rhythmStopped', id: r.id });
      w.put({ type: 'jobSaved', job });
      break;
    }
    /* never the job of a delve under way: its end still has to be answered (break-it review 4) */
    case 'removeJob': if (c.jobs.some(j => j.id === cmd.id) && !inRun(w.all, cmd.id) && v.runEnd?.job.id !== cmd.id && !v.runEnd?.errands?.some(e => e.job.id === cmd.id)) w.put({ type: 'jobRemoved', id: cmd.id }); break;
    case 'hideDone': if (doneOn(w.all, cmd.on).has(cmd.job)) w.put({ type: 'doneHidden', job: cmd.job, on: cmd.on, ...(cmd.back ? { back: true } : {}) }); break;
    case 'firstStep': case 'noteJob': {
      const j = c.jobs.find(x => x.id === cmd.job);
      const text = (cmd.do === 'firstStep' ? cmd.step : cmd.note).trim().slice(0, 160), key = cmd.do === 'firstStep' ? 'firstStep' : 'note';
      if (!j || (j[key] ?? '') === text) break;
      const job: Job = { ...j };
      delete job.stopped;
      if (text) job[key] = text; else delete job[key];
      w.put({ type: 'jobSaved', job });
      break;
    }
    case 'listJob': {
      const j = c.jobs.find(x => x.id === cmd.job);
      /* whole lines only, up to LIST_MAX characters (review, D-126) */
      const kept: string[] = [];
      let n = 0;
      for (const l of cmd.list.split('\n').map(x => x.replace(/\s+$/, '')).filter(x => x.trim())) { if (n + l.length > LIST_MAX) break; kept.push(l); n += l.length + 1; }
      const list = kept.join('\n');
      if (!j || (j.list ?? '') === list) break;
      const job: Job = { ...j };
      delete job.stopped; delete job.struck;
      if (list) job.list = list; else delete job.list;
      /* a line struck off in the delve under way stays struck when the list is edited around it (break-it review 8) */
      if (j.struck?.length) {
        const gone = listLines(j).filter((_, k) => j.struck!.includes(k)), struck: number[] = [];
        kept.forEach((l, k) => { const i = gone.indexOf(l); if (i >= 0) { struck.push(k); gone.splice(i, 1); } });
        if (struck.length) job.struck = struck;
      }
      w.put({ type: 'jobSaved', job });
      break;
    }
    case 'strikeLine': {
      /* only in the job's own delve, running or paused: a strike never outlives it (review, D-126) */
      const j = c.jobs.find(x => x.id === cmd.job), r = activeRun(w.all);
      if (!j || !r || r.fact.job !== j.id || cmd.k < 0 || cmd.k >= listLines(j).length) break;
      const set = new Set(j.struck ?? []);
      if (set.has(cmd.k)) set.delete(cmd.k); else set.add(cmd.k);
      const job: Job = { ...j, struck: [...set].sort((a, b) => a - b) };
      delete job.stopped;
      if (!job.struck!.length) delete job.struck;
      w.put({ type: 'jobSaved', job });
      break;
    }
    case 'takeInbox': {
      const seen = new Set([...ofType(w.all, 'itemAdded').map(f => f.ref), ...ofType(w.all, 'inboxSkipped').map(f => f.ref)].filter(Boolean));
      let k = ofType(w.all, 'itemAdded').length;
      for (const x of cmd.lines) {
        const name = String(x.text ?? '').trim().slice(0, 120);
        if (!name || !x.id || seen.has(x.id)) continue;
        seen.add(x.id);
        /* a job Dan still has is not added again (J4) */
        const tie = tieFor(base, w.all, name);
        /* remembered as taken, so if the app closes before the phone's inbox is cleared it is never added later (review) */
        if (tie?.same) { w.put({ type: 'inboxSkipped', ref: x.id }); continue; }
        w.put({ type: 'itemAdded', id: `it-${++k}`, name, via: 'siri', ref: x.id, ...(tie ? { from: tie.job.id } : {}) });
      }
      break;
    }
    case 'addItems':
      /* a job Dan still has is not added again (J4) */
      for (const line of cmd.lines) addJob(w, c, v, base, day, line, null);
      break;
    case 'tick': {
      const it = W.items(w.all, day).find(x => x.id === cmd.id);
      /* an errand of a run under way, or not yet counted, is done by its run's end (D-139) */
      if (!it || it.done || (activeRun(w.all) ?? pendingErrands(w.all))?.fact.errands?.includes(cmd.id)) break;
      /* a line moves the expedition only as one of today's main jobs (TOOLS §2, P5); otherwise ticking just feels good */
      if (v.slate.includes(cmd.id)) {
        endRunOn(w, c, cmd.id, nowMs, now);
        if (!begunOn(w.all, day, cmd.id)) w.put({ type: 'jobBegun', job: cmd.id, from: 'record' });
        markDoneIn(w, c, cmd.id, now, day);
      } else w.put({ type: 'itemTicked', id: cmd.id });
      break;
    }
    case 'dropItem': if (W.items(w.all, day).some(x => x.id === cmd.id) && activeRun(w.all)?.fact.job !== cmd.id) w.put({ type: 'itemDropped', id: cmd.id }); break;
    case 'planWeek': w.put({ type: 'planMade', week: cmd.week, entries: W.planWeek(c, w.all, cmd.week, day) }); break;
    case 'replan': {
      const wk = calendarWeek(day), plan = W.planOf(w.all, wk) ?? [];
      const own = new Set(ofType(w.all, 'planAdded').map(f => f.entry.id));
      const fixed = plan.filter(e => own.has(e.id));
      w.put({ type: 'planMade', week: wk, entries: W.planWeek(c, w.all, wk, day, fixed) });
      break;
    }
    case 'movePlan': {
      /* within its own week only: another week is reached by taking it off this one and placing it there (the Week's
         "Another day…", D-114); a move across weeks broke the Week (break-it review 12) */
      if (cmd.day) {
        const made = ofType(w.all, 'planMade').find(f => f.entries.some(x => x.id === cmd.entry));
        const added = ofType(w.all, 'planAdded').find(f => f.entry.id === cmd.entry);
        /* the week the entry is in now: where it was last moved to (an old save may hold a move across weeks), else
           where it was made */
        const moved = ofType(w.all, 'planChanged').filter(f => f.entry === cmd.entry && f.day).pop();
        const wk = moved?.day ? calendarWeek(moved.day) : made ? made.week : added ? calendarWeek(added.entry.day) : null;
        if (wk && calendarWeek(cmd.day) !== wk) break;
      }
      w.put({ type: 'planChanged', entry: cmd.entry, day: cmd.day, ...(cmd.time !== undefined ? { time: cmd.time } : {}) });
      /* a job set aside today and placed on today again in the Week is back on today's list (review 2, D-088) */
      const e = W.planOf(w.all, calendarWeek(day))?.find(x => x.id === cmd.entry);
      if (e && cmd.day === day && asideOn(w.all, day).has(e.job)) w.put({ type: 'putBack', job: e.job });
      break;
    }
    case 'planJob': {
      if (!c.jobs.some(j => j.id === cmd.job)) break;
      const n = ofType(w.all, 'planAdded').length + 1;
      w.put({ type: 'planAdded', entry: { id: `pa-${n}`, job: cmd.job, day: cmd.day, ...(cmd.time ? { time: cmd.time } : {}) } });
      break;
    }
    case 'putOnDay': putOn(w, c, v, day, cmd.job, cmd.day, cmd.entry); break;
    case 'useKey': {
      /* only a niche a Key can open now, and only with a Key in hand: refused otherwise (a double tap opens one) */
      const st = S.storyState(w.all, c.story), x = S.openable(c.story, st).find(y => y.id === cmd.seal);
      if (!x || st.held < 1) break;
      w.put({ type: 'keyUsed', chosen: true, ...(cmd.from !== undefined ? { from: cmd.from } : {}) });
      openSeal(w, c, x, now, day);
      break;
    }
    case 'park': {
      /* one line, capped like every job's name; empty does nothing. It never touches the delve or earns anything. Typed
         as the delve ran out, it is still kept, and still that delve's (its end not yet answered) */
      const name = cmd.line.replace(/\s+/g, ' ').trim().slice(0, 120);
      if (!name) break;
      const r = activeRun(w.all), end = v.runEnd ? ofType(w.all, 'delveEnded').find(f => f.seq === v.runEnd!.seq) : undefined;
      const run = r ? r.fact.seq : end?.run;
      /* a job Dan has had before (D-136): one still his is never added twice; a finished one carries on */
      const tie = tieFor(base, w.all, name);
      if (tie?.same) break;
      w.put({ type: 'itemAdded', id: `it-${ofType(w.all, 'itemAdded').length + 1}`, name, via: 'park', ...(run !== undefined ? { run } : {}), ...(tie ? { from: tie.job.id } : {}) });
      break;
    }
    case 'delveNow': {
      const name = cleanLine(cmd.line);
      /* never over a delve under way, or one whose end is still to be answered */
      if (!name || v.run || v.runEnd) break;
      /* a job Dan has had before (D-136): one still his is delved on itself, as a tap on its row would, never added again */
      const tie = tieFor(base, w.all, name, cmd.from);
      if (tie?.same) { const p = presetRun(tie.job, c); beginRun(w, c, tie.job.id, p.minutes, p.count, day); break; }
      const id = `it-${ofType(w.all, 'itemAdded').length + 1}`, n = ofType(w.all, 'planAdded').length + 1;
      w.put({ type: 'itemAdded', id, name, ...(tie ? { from: tie.job.id } : {}) });
      w.put({ type: 'planAdded', entry: { id: `pa-${n}`, job: id, day } });
      w.put({ type: 'jobBegun', job: id, from: 'app' });
      w.put({ type: 'delveStarted', job: id, minutes: PRESET.minutes, count: PRESET.count });
      break;
    }
    case 'saveForLater': {
      const name = cleanLine(cmd.line);
      if (!name) break;
      const tie = tieFor(base, w.all, name, cmd.from);
      /* a job still Dan's is already in its place: nothing is added (the Satchel says where it is) */
      if (tie?.same) break;
      w.put({ type: 'itemAdded', id: `it-${ofType(w.all, 'itemAdded').length + 1}`, name, ...(tie ? { from: tie.job.id } : {}) });
      break;
    }
    case 'declineRepeat': {
      const k = W.nameKey(cmd.name);
      if (k && !ofType(w.all, 'repeatDeclined').some(f => f.name === k)) w.put({ type: 'repeatDeclined', name: k });
      break;
    }
    /* a day gone by while the Week's + was open (past 04:00): the line goes on today, never lost (review of D-144) */
    case 'addToWeek': if (/^\d{4}-\d{2}-\d{2}$/.test(cmd.day)) addJob(w, c, v, base, day, cmd.line, cmd.day >= day ? cmd.day : day, undefined, cmd.day >= day ? cmd.time : undefined); break;
    /* Today's own "Add a job": on today (Dan, D-143 C); the Satchel's box still keeps a job with no day */
    case 'addToday': addJob(w, c, v, base, day, cmd.line, day, cmd.from); break;
    case 'bedtime': if (/^\d\d:\d\d$/.test(cmd.time)) w.put({ type: 'bedtimeSet', time: cmd.time }); break;
    case 'goodnight': {
      /* once a night: again on the same day only after more work since (a nap's camp, then the evening's, D-160) */
      const gn0 = ofType(w.all, 'goodnight').pop();
      if (gn0 && gn0.day === day && !ofType(w.all, 'stepsGained').some(f => f.seq > gn0.seq && f.job !== 'sleep')) break;
      const past = pastBedtime(bedtimeOf(w.all), now), kept = past <= BEDTIME_GRACE && past >= -BEDTIME_WINDOW;
      w.put({ type: 'goodnight', kept });
      /* the day ends here and only here (D-160): Dan camps where he is, at the place he reached or at a view of the stretch
         he is walking, with one thing to look at; the next day starts from it. Before the first place, no camp. */
      camp(w, c, now, day);
      /* kept: a camp line plays tonight, the earliest not played yet, one a night; its morning waits for tomorrow. Not
         tied to the story week Dan is in: a story week walked through between two bedtimes keeps its line (deep review S#2b) */
      if (kept) {
        /* from what Dan has been shown: a word reached but not yet cut, a place not yet on its screen, isn't known (D-154) */
        const st = knownState(w, c);
        /* never before what it describes, nor after it has changed (review, 2026-09-25) */
        /* (nor a week long behind him, an old save's that never kept bedtime: its night was thought somewhere he left long
           ago, D-160) */
        const line = c.story.beats.find(b => b.kind === 'camp' && b.w <= st.week && b.w >= st.week - 1 && !st.played.has(b.id)
          && b.req.every(r => S.met(st, r)) && !(b.until && S.met(st, b.until)));
        if (line) w.put({ type: 'beatPlayed', id: line.id });
      }
      break;
    }
    case 'closeRead': if (!ofType(w.all, 'closeRead').some(f => f.week === cmd.week)) w.put({ type: 'closeRead', week: cmd.week }); break;
    case 'offerAnswered': if (!ofType(w.all, 'offerAnswered').some(f => f.week === cmd.week)) w.put({ type: 'offerAnswered', week: cmd.week }); break;
    case 'seen': w.put({ type: 'seen', what: cmd.what, ref: cmd.ref }); break;
    /* reminders (D-107): settings only; nothing earned or lost */
    case 'remind':
      if ((cmd.lead === null || (cmd.target.startsWith('d:') ? (R.DATE_LEADS as readonly number[]) : (R.LEADS as readonly number[])).includes(cmd.lead)) && R.reminderSettings(w.all).get(cmd.target) !== cmd.lead) w.put({ type: 'reminderSet', target: cmd.target, lead: cmd.lead });
      break;
    case 'reminders': if (R.remindersOn(w.all) !== cmd.on) w.put({ type: 'remindersSwitched', on: cmd.on }); break;
    case 'keepItem': if (W.items(w.all, day).some(i => i.id === cmd.id)) w.put({ type: 'itemKept', id: cmd.id }); break;
    case 'somedayItem': if (W.items(w.all, day).some(i => i.id === cmd.id)) w.put({ type: 'itemSomeday', id: cmd.id }); break;
    case 'pinWeek': if (cmd.job === null || c.jobs.some(j => j.id === cmd.job)) w.put({ type: 'weekPinned', week: calendarWeek(day), job: cmd.job }); break;
    case 'lookAhead': w.put({ type: 'lookAheadSeen', week: calendarWeek(day), finished: cmd.finished }); break;
    case 'calendarShow': {
      const was = W.calendarOf(w.all);
      if (was.on !== cmd.on || JSON.stringify(was.calendars) !== JSON.stringify(cmd.calendars)) w.put({ type: 'calendarChosen', on: cmd.on, calendars: cmd.calendars });
      break;
    }
    case 'calendarRead': {
      /* written only when what the calendar holds changed: the same facts, the same week (ARCHITECTURE) */
      if (!W.calendarOf(w.all).on) break;
      /* as a set, sorted by start (then id): the same events read in another order change nothing (deep review P#6) */
      const events = cmd.events.filter(e => e && typeof e.start === 'string' && typeof e.end === 'string')
        .map(e => ({ id: String(e.id), cal: String(e.cal), title: String(e.title ?? '').slice(0, 80), start: e.start.slice(0, 16), end: e.end.slice(0, 16), allDay: !!e.allDay }))
        .sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id)).slice(0, 400);
      const reads = ofType(w.all, 'calendarRead'), last = reads[reads.length - 1];
      if (last && JSON.stringify(last.events) === JSON.stringify(events)) break;
      w.put({ type: 'calendarRead', from: day, to: W.addDays(day, cmd.days), events });
      break;
    }
    case 'nudge': { const s = ofType(w.all, 'nudgeChosen'); if ((s.length ? s[s.length - 1].on : false) !== cmd.on) w.put({ type: 'nudgeChosen', on: cmd.on }); break; }
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
  /** Instants, for the screen's clock words. */
  startedAt: number;
  /** Held because Dan went into another app, not by Pause (D-094). */
  away: boolean;
  /** A one-off's minutes from its earlier delves, which this one carries on from (D-133). */
  carried: number;
  /** An errand run's errands, in the order chosen, each struck off or not (D-139); null for a delve on one job. */
  errands: { job: Job; struck: boolean }[] | null;
}
/** The run's part of the view at a later second, the log unchanged (deep review F#4): a delve's once-a-second tick moves
    only its countdown, so the rest of the view is kept from the minute. null: the run has ended by now (the whole view
    is wanted again). Nothing but the clock differs from `see` at the same moment. */
export function runSecond(facts: Fact[], run: RunView, now: Moment): RunView | null {
  const r = activeRun(facts);
  if (!r || r.fact.seq !== run.seq) return null;
  const s = runAt(r.plan, r.marks, epochOf(now));
  if (s.phase === 'ended') return null;
  return { ...run, ...s, away: s.phase === 'held' && run.away };
}
export interface RunEnd {
  seq: number; job: Job; minutes: number; how: 'ranOut' | 'finishedHere';
  /** A one-off's minutes carried into this run from its earlier delves, and the job's whole minutes with this run's
      (D-133); 0 and the run's minutes for a repeating job. */
  carried: number; total: number;
  /** The minutes this run moved Dan along the road (its steps: counted once, when each delve ended). */
  gained: number;
  /** Where Dan stood on the road when it ended (minutes walked from the start). */
  walked: number;
  /** A one-off that isn't done yet: ask "Is it done?" */
  ask: boolean;
  /** A repeating job's session was done by this run (D-121). */
  enough: boolean;
  /** This run completed the day (the next screen is the arrival). */
  completedDay: boolean;
  count: number;
  /** Thoughts parked in the Satchel during this run, still there (D-138). */
  parked: number;
  /** An errand run's errands (D-139): each one's share of the minutes, and its done record if it was struck off. */
  errands: { job: Job; minutes: number; done: number | null; struck: boolean }[] | null;
  /** An errand run's errands not yet counted: its end still takes strikes, then "Count them" (D-139). */
  pending: boolean;
}
export interface Arrival {
  seq: number; kind: 'place' | 'camp' | 'evening'; id: string; name: string; line: string;
  /** How Dan came here (D-154): the first place in an area; the next place in the area he is in; back to an area walked
      before; or an evening at camp (`late`: last night's, shown at this opening). Worked out when it plays. */
  face: 'enter' | 'on' | 'back' | 'evening';
  late: boolean;
  /** The area's name, as every screen shows it, and how Dan gets there (shown when he comes back to it). */
  area: string;
  wayIn: string | null;
  /** A turn-off on the way back up (a return whose own words say why, D-154): "Back up"; a few steps back up within an
      area too (the round-6 short review). */
  turnOff?: boolean;
  /** An evening from before last night, played at this opening: "One evening, at camp". */
  earlier?: boolean;
  /** A day's end at a stop made before: its words are not said again, only that he stops there again (D-154). */
  stopAgain?: boolean;
  /** A place at the top reached after Dan went down (an old save's, D-160): a trip back up, said, that leaves him where
      he was. */
  errand?: boolean;
  /** Why he climbs back up for it, in the story's words (the beat's `back`); null: the plain line. */
  errandWhy?: string | null;
  /** A later place of the same trip up: no climb of its own. */
  errandMore?: boolean;
  /** Not the trip's last place: the way back down is said on the last. */
  errandStays?: boolean;
  /** A later place of the trip: the area of the place before it on the trip. */
  errandFrom?: string;
  /** Tonight's camp is the place he reached (D-160): the screen says he camps there. */
  campAt?: boolean;
  /** An evening's moments at home after its place (her notebook, the tally): each one's line, beat and records. */
  then: { beat: string; line: string; records: string[]; choice?: [string, string]; area: string }[];
  /** A word cut in four taps: one line per tap. */
  taps?: string[];
  choice?: [string, string];
  /** The story bits that played on the way here (D-129): each one's line, beat (for the guesses it settles) and records.
      No Key's words. */
  way: { beat: string; line: string; records: string[]; choice?: [string, string] }[];
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
  /** What Dan is told about a Key on this return (D-141): `earned` this job kept up its rhythm and its Key opened what
      plays here; `kept` a Key kept from earlier opened it; `held` this job earned a Key with nothing sealed in reach, so it
      is kept; null: no Key. */
  keyNote: 'earned' | 'kept' | 'held' | null;
  /** A recurring job kept up again in a period whose Key it already earned (L C4): its period, said in one quiet line
      ("Already earned this fortnight's Key"); null otherwise. */
  keyAlready: 'week' | 'fortnight' | 'month' | 'year' | 'days' | 'cap' | null;
  /** A partial sign found on a deep push: its element, and the mark it belongs to (SCRIPT §8). */
  part?: { el: string; mark: string };
  /** A moment at the top played after Dan went down (an old save's, D-160): the area he climbs back up to for it. */
  up?: string;
  /** Why, in the story's words (the beat's `back`), said in place of the plain line. */
  upWhy?: string;
  /** A moment in another area: its name, said; he goes there for it and comes back (D-160, round 8). */
  moved?: string;
  /** (and the area he comes back to afterwards, where he still is) */
  from?: string;
}
/** Where Dan stands. */
/** Where Dan stands: the last place he walked to (D-154), its area's name, and its arrival (to read again). */
export interface Here { id: string | null; name: string; line: string; stretch: StretchId; painting: string; area: string; seq: number | null; }

export interface View {
  day: string;
  /** Minutes taken back from a tick ("Not done after all", deep review B3) still to be made up by the next minutes, said
      on the day it was taken back: the minutes taken back, and how many are left. */
  owed: { taken: number; left: number } | null;
  capacity: Capacity;
  suggested: Capacity;
  size: number;
  order: string[];
  /** Today's main jobs, in order (only today's; never counts, D-038): the finish line's first, then the rest. */
  slate: string[];
  /** The finish line (D-131): the first 3 hours' worth of the day's jobs; the rest of the slate is "If there's time". */
  line: string[];
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
  /** The sealed thing ahead opens only with a Key (a niche), not on foot (D-142). */
  aheadKey: boolean;
  /** The jobs whose Key from last week landed late today, at the opening (D-152): Today says so, that day. */
  lateKeys: string[];
  /** Keys earned and kept, not yet used (D-142). */
  keys: number;
  /** Where a kept Key can open something now, chosen on the Map (its stretch), if anywhere (D-142): the stretch Dan is
      in first. The Map lists it there (one definition, D-143 A). */
  keyUse: StretchId | null;
  /** A niche a kept Key can open in the stretch Dan is in ("Use it here", D-143 A). */
  keyHere: string | null;
  /** The sealed thing "ahead" is behind Dan, on another stretch: Today says so and opens the Map there (D-143). */
  aheadBehind: StretchId | null;
  /** The locked thing in view is where Dan stands (it carries the place's name): "Here", never "Ahead" (deep review W F13). */
  aheadHere: boolean;
  walked: number;
  /** Minutes of effort from here to the next named place, if one is reachable (never shown as steps owed). */
  toNext: number | null;
  /** The next place's distance mark, in minutes from the start. */
  nextAt: number | null;
  /** Minutes of effort from here to the side chamber halfway to the next place, until it is found (D-122). */
  toChamber: number | null;
  /** This stretch of road, in minutes from the start: the last place reached on foot, the side chamber halfway, the next
      place; `place`: a next place is in reach (D-133: the line at a delve's end). */
  road: { from: number; chamber: number; to: number; place: boolean };
  /** The next place on foot is in the area Dan is in (true), a new one (false), or there is none in reach (null). */
  nextHere: boolean | null;
  nextBack: boolean;
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
  /** Today's planned appointments (job → time). */
  times: Record<string, string>;
  /** Where the plan points: the day each next place would be reached (a forecast, never a promise). */
  forecast: string[];
  /** A find still waits for a job Dan tends to put off (its mark and its set-up's line promise nothing that won't come). */
  findWaits: boolean;
  /** Dan's own data as it stands (his edits applied). */
  content: Content;
  /** One-offs waiting on a reply whose day has come (D-137): under today's list, "Did they reply?"; never on the list or
      its finish line. Soonest first. */
  replies: { job: string; until: string; who?: string }[];
  /** Jobs taken off today ("Not today") and not done: Today keeps them, struck, with "Put back", all day (J7). */
  aside: string[];
}

/** The stand-in painting for a place until its own is painted from its brief (PROTOTYPE_NOTES.md). */
export const STAND_IN: Record<StretchId, string> = {
  /* the Box Room is small and low: it borrows its own first painting, not a hall's (the round-6 short review) */
  'st-mouth': 'sample-well-stair', 'st-hall': 'sample-rib-gallery', 'st-salt': 'sample-pool-dome', 'st-camp': 'pt-pl-w2-box-by-the-cot',
  'st-stair': 'sample-well-stair', 'st-flight2': 'sample-well-stair', 'st-square': 'sample-rib-gallery',
  /* story weeks 8–14: the side gallery is square stone, so it borrows the square gallery's own painting */
  'st-water': 'sample-pool-dome', 'st-reading': 'sample-rib-gallery', 'st-blast': 'sample-well-stair',
  'st-side': 'pt-pl-w6-square-gallery', 'st-lower': 'sample-rib-gallery',
};
/** The places painted from their briefs so far (ids only; D-015): each shows its own painting, `pt-<id>`, which
    ui/paintings.ts carries (a test keeps the two in step); every other place shows its stretch's stand-in. */
export const PAINTED: ReadonlySet<string> = new Set<string>(['b-1.A', 'b-1.B', 'b-1.C', 'b-2.A', 'pl-w2-smooth-place', 'pl-w1-pick-niche', 'b-5.A', 'pl-w5-ledge-lip', 'pl-w5-second-landing', 'b-7.A', 'b-7.B', 'pl-w6-square-gallery', 'b-6.B', 'pl-w6-folder', 'cv-02', 'cv-10', 'cv-11', 'cv-12', 'cv-13', 'cv-14', 'pl-w5-worn-steps', 'b-5.B', 'b-7.C', 'cv-15', 'cv-03', 'cv-04', 'cv-05', 'cv-07', 'cv-08', 'cv-09', 'pl-w2-above-the-ring', 'pl-w2-box-by-the-cot', 'b-3.A', 'b-3.B', 'b-3.C', 'b-4.A', 'b-4.B', 'b-2.B', 'pl-w1-below-the-lamp', 'pl-w3-far-end', 'cv-06', 'b-4.C', 'pl-w3-salt-lit', 'pl-w4-recess-above-the-cot', 'pl-w6-wall-shelf', 'cv-01', 'pl-w4-hollow', 'b-6.A', 'b-8.A', 'pl-w8-channel', 'b-8.B', 'pl-w8-steep-foot', 'b-8.C', 'b-9.A', 'pl-w9-benches', 'b-9.B', 'b-9.C', 'pl-w9-approach', 'pl-w10-deep-end', 'b-10.A', 'pl-w10-blast-floor', 'b-10.B', 'b-10.C', 'pl-w11-cupboard', 'b-11.A', 'b-11.B', 'pl-w11-far-end', 'b-11.C', 'b-12.A', 'pl-w12-shelf', 'b-12.B', 'pl-w12-square-way', 'b-12.C', 'pl-w13-side-gallery', 'b-13.A', 'b-13.B', 'b-13.C', 'pl-w13-lower-gallery', 'b-14.A', 'pl-w14-mule-stone', 'b-14.B', 'pl-w14-meeting', 'pl-w14-deep-niche', 'cv-16', 'cv-17', 'cv-18', 'cv-19', 'cv-20', 'cv-21']);
/** A place D-160 made of a retired one, shown with that one's painting (ids only). */
/* (and a view at a painted place, where its stretch's stand-in would show the wrong thing: cv-49, round 8) */
const PAINTED_AS: Readonly<Record<string, string>> = { 'b-3.5': 'pl-w3-salt-lit', 'cv-49': 'pl-w11-far-end' };
export const paintingOf = (id: string | null, stretch: StretchId): string => {
  const as = id ? PAINTED_AS[id] ?? id : null;
  return as && PAINTED.has(as) ? `pt-${as}` : STAND_IN[stretch];
};

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

/** A place or camp reached before, to read again (the Map's "Read again", D-135; camps too, the flow review). */
export function arrivalAt(facts: Fact[], base: Content, seq: number): Arrival | null {
  const f = facts.find(x => x.seq === seq);
  return f && f.type === 'arrived' ? arrivalOf(W.live(base, facts), facts, f) : null;
}
/** A carried page (D-155) that played in an evening's own command, as a D-154 save's did: that evening's, unless the
    same command walked on to a place, when it was on the way there (a long day) and is that place's. */
function pageOfEvening(c: Content, all: Fact[], g: Fact, f: FactOf<'arrived'>): boolean {
  return g.type === 'beatPlayed' && !!S.beatOf(c.story, g.id)?.portable && g.at === f.at
    && !all.some(h => h.seq > g.seq && h.type === 'arrived' && h.kind === 'place' && h.how !== 'evening' && h.at === g.at);
}
/** The story moments played just after an evening at camp, before anything else happened: its home moments (D-154). */
function thenOf(c: Content, all: Fact[], f: FactOf<'arrived'>): Arrival['then'] {
  const out: Arrival['then'] = [];
  for (const g of all) {
    if (g.seq <= f.seq || g.type === 'recordShown' || g.type === 'storyWeekBegan' || (g.type === 'sealOpened' && g.how === 'road')) continue;
    /* (a carried page that played in the same evening, as an old save's did, D-155: still part of it) */
    if (g.type !== 'beatPlayed' || g.job !== undefined || g.id === 'passage' || !(S.eveningMoment(c.story, g.id) || pageOfEvening(c, all, g, f))) break;
    const bx = S.beatOf(c.story, g.id), x = bx?.kind === 'stepKey' && bx.seal ? S.sealOf(c.story, bx.seal) : bx ? undefined : S.sealOf(c.story, g.id);
    const line = bx?.line ?? x?.line;
    const where = bx?.stretch ?? x?.stretch;
    if (line) out.push({ beat: g.id, line, records: [...(x?.carries?.records ?? []), ...(bx?.carries?.records ?? [])], ...(bx?.choice ? { choice: bx.choice } : {}), area: where ? S.areaName(c.story, where) : '' });
  }
  return out;
}
/** The marks a story moment offers for a guess: its own and its sealed row's. */
function guessesOf(c: Content, id: string): string[] {
  const b = S.beatOf(c.story, id), x = b?.seal ? S.sealOf(c.story, b.seal) : S.sealOf(c.story, id);
  return [...(b?.carries?.guess ?? []), ...(x?.carries?.guess ?? [])];
}
/** How a place was come to (D-154), from where Dan had been before it: worked out, never stored. */
function faceOf(c: Content, all: Fact[], f: FactOf<'arrived'>, b: Beat): Arrival['face'] {
  const before = S.storyState(all.filter(g => g.seq < f.seq), c.story);
  if (f.how === 'evening') return 'evening';
  /* a place at the top once Dan has gone down (an old save's, D-160): a told trip back up */
  if (S.isErrand(c.story, before, b)) return 'back';
  const area = S.areaOf(c.story, b.stretch);
  if (![...before.visited].some(x => S.areaOf(c.story, x) === area)) return 'enter';
  return area === S.areaOf(c.story, before.stretch) && before.here !== null ? 'on' : 'back';
}
function arrivalOf(c: Content, all: Fact[], f: FactOf<'arrived'>): Arrival {
  if (f.kind === 'evening') {
    /* an evening with no place: only the night's moments at home, by the lamp (D-154) */
    const then = thenOf(c, all, f);
    const guess = [...new Set(then.flatMap(x => guessesOf(c, x.beat)))]
      .filter(m => !then.some(x => x.beat === S.markOf(c.story, m)?.confirmedBy));
    /* named for where its first moment is (her notebook: the Box Room), never only "the Lamp Hall" (the journey review) */
    return { seq: f.seq, kind: 'evening', face: 'evening', late: !!f.late, earlier: !!f.late && !!f.night && W.daysBetween(f.night, f.day) > 1, area: then[0]?.area || S.areaName(c.story, 'st-hall'), wayIn: null, then,
      opened: [], way: [], id: f.id, name: '', line: '', records: [], guess, look: null, stretch: 'st-hall',
      painting: paintingOf('b-1.A', 'st-hall'), completedDay: false, byKey: false };
  }
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
      if ((g.type !== 'keyUsed' || g.chosen) && !ANSWERS.has(g.type)) break;
      if (g.type === 'sealOpened' && all.some(k => k.type === 'keyUsed' && k.seq === g.seq - 1)) {
        const x = S.sealOf(c.story, g.seal), line = x?.beat ? S.beatOf(c.story, x.beat)?.line : x?.line;
        if (line) opened.push(line);
        /* a tablet a kept Key opened here asks its marks here, where it is read (it has no return screen of its own) */
        keyed.push(...(x?.carries?.guess ?? []), ...(x?.beat ? S.beatOf(c.story, x.beat)?.carries?.guess ?? [] : []));
      }
    }
    /* the story bits that played on the way here, just before it: their lines, records and guesses (D-129) */
    const way: Arrival['way'] = [];
    for (let i = all.findIndex(g => g.seq === f.seq) - 1; i >= 0; i--) {
      const g = all[i];
      /* (the side chamber passed on the way is part of the walk too) */
      if (g.type === 'recordShown' || g.type === 'storyWeekBegan' || (g.type === 'findGiven' && g.why === 'chamber') || (g.type === 'sealOpened' && g.how === 'road' && S.sealOf(c.story, g.seal)?.arrival === b.id)) continue;
      if (g.type !== 'beatPlayed' || g.job !== undefined || g.id === 'passage') break;
      /* a page an evening just before it holds is that evening's, not the walk's (D-155) */
      if (all.some(e => e.type === 'arrived' && (e.kind === 'evening' || e.how === 'evening') && e.seq < g.seq && pageOfEvening(c, all, g, e as FactOf<'arrived'>))) break;
      let j = i - 1;
      while (all[j]?.type === 'recordShown') j--;
      const o = all[j];
      const road = o?.type === 'sealOpened' && o.how === 'road' && (S.sealOf(c.story, o.seal)?.beat ?? o.seal) === g.id ? S.sealOf(c.story, o.seal) : undefined;
      const bx = S.beatOf(c.story, g.id);
      if (!road && bx?.kind !== 'step') break;
      const line = bx?.line ?? road?.line;
      if (line) way.unshift({ beat: g.id, line, records: [...(road?.carries?.records ?? []), ...(bx?.carries?.records ?? [])], ...(bx?.choice ? { choice: bx.choice } : {}) });
      keyed.push(...(road?.carries?.guess ?? []), ...(bx?.carries?.guess ?? []));
      if (road) i = j;
    }
    /* never a guess the screen itself answers: the place, or a bit on the way here (D-129) */
    /* an evening's home moments after it: their lines, records and guesses, asked here (D-154) */
    const face = faceOf(c, all, f, b), then = face === 'evening' ? thenOf(c, all, f) : [];
    const first = (x: Arrival['way'][number]) => errand || S.beatOf(c.story, x.beat)?.before === b.id || (S.beatOf(c.story, x.beat)?.kind === 'stepKey' && !x.choice);
    for (const x of then) keyed.push(...guessesOf(c, x.beat));
    const answers = new Set([b.id, ...way.map(x => x.beat), ...then.map(x => x.beat)]);
    const guess = [...new Set([...(b.carries?.guess ?? []), ...carried, ...keyed])].filter(m => !answers.has(S.markOf(c.story, m)?.confirmedBy ?? ''));
    const area = S.areaName(c.story, b.stretch), wayIn = c.story.stretches.find(x => x.id === S.areaOf(c.story, b.stretch))?.wayIn ?? null;
    const errand = face === 'back' && S.isErrand(c.story, S.storyState(all.filter(g => g.seq < f.seq), c.story), b);
    /* one trip back up sees all that waits at the top (D-160): the climb is said on its first place, the way back down on
       its last; the places between follow on with no climb of their own */
    const tripOf = (g: Fact | undefined) => g?.type === 'arrived' && g.kind === 'place' && g.at === f.at && !!S.beatOf(c.story, g.id)
      && S.isErrand(c.story, S.storyState(all.filter(h => h.seq < g.seq), c.story), S.beatOf(c.story, g.id)!);
    const prevPlace = all.filter(g => g.seq < f.seq && g.type === 'arrived').pop(), nextPlace = all.find(g => g.seq > f.seq && g.type === 'arrived');
    const errandMore = errand && tripOf(prevPlace), errandStays = errand && tripOf(nextPlace);
    /* a place whose own line says how Dan came (a turn-off on the way up) needs no way-in line over it */
    return { seq: f.seq, kind: 'place', face, late: !!f.late, earlier: !!f.late && !!f.night && W.daysBetween(f.night, f.day) > 1, area, wayIn: face === 'back' && !b.said ? wayIn : null, turnOff: ((face === 'back' || face === 'on') && !!b.turnOff) || (face === 'back' && errand), errand,
      /* (a place with its own reason says it on every trip, first or not, the round-8 review) */
        ...(errand ? { errandWhy: b.back ?? null, errandMore, errandStays,
        ...(errandMore && prevPlace?.type === 'arrived' ? { errandFrom: S.areaName(c.story, S.beatOf(c.story, prevPlace.id)!.stretch) } : {}) } : {}), then,
      /* the walk to it (a step marked `before` it) is told first, as the start of its words (D-160) */
      /* (on a trip up, what it saw on the way is told first too, before the place: never after "Then you go back down") */
      /* (and a sealed thing the road opened on the way here, before it: in the order it happened, the round-8 review;
         one with buttons of its own stays after) */
      opened, way: way.filter(x => !errand && !first(x)), id: b.id, name: (errand && b.againName ? b.againName : b.name) ?? '',
      line: [...way.filter(first).map(x => x.line), (errand && b.again ? b.again : b.line) ?? ''].filter(Boolean).join(' '), taps: b.taps, choice: b.choice,
      records: [...way.filter(first).flatMap(x => x.records), ...(b.carries?.records ?? [])], guess, look: null, stretch: b.stretch, painting: paintingOf(b.id, b.stretch), completedDay, byKey: f.how === 'key' };
  }
  /* tonight's camp at the place he reached (D-160): its name and painting; the screen says he camps there */
  const p = f.where === 'place' ? S.beatOf(c.story, f.id) : undefined;
  const found = all.find(g => g.type === 'findGiven' && g.why === 'camp' && g.seq === f.seq + 1) as FactOf<'findGiven'> | undefined;
  /* (the place's own first sentence under it, so the night is never bare, the review's round 2) */
  /* (camped at before: it says so, and only what is new follows, as at a view) */
  const before = !!p && all.some(g => g.type === 'arrived' && g.kind === 'camp' && g.id === f.id && g.seq < f.seq);
  if (p) return { seq: f.seq, kind: 'camp', face: 'on', late: false, area: S.areaName(c.story, p.stretch), wayIn: null, then: [], campAt: true, stopAgain: before,
    opened: [], way: [], id: p.id, name: p.name ?? '', line: before ? '' : (p.line ?? p.taps?.[0] ?? '').split(/(?<=[.!?])\s/)[0] ?? '', records: [], guess: [], look: found ? c.story.finds.find(x => x.id === found.id)?.line ?? null : null, stretch: p.stretch, painting: paintingOf(p.id, p.stretch), completedDay: false, byKey: false };
  const k = c.story.camps.find(x => x.id === f.id)!;
  const find = all.find(g => g.type === 'findGiven' && g.why === 'camp' && g.seq > f.seq && g.seq <= f.seq + 1) as FactOf<'findGiven'> | undefined;
  /* a stop made before: never its words again (the journey review, D-154): the screen says he stops there again, and
     only what is new (a find) follows */
  const again = all.some(g => g.type === 'arrived' && g.kind === 'camp' && g.id === f.id && g.seq < f.seq);
  const look = find ? c.story.finds.find(x => x.id === find.id)?.line ?? null : 'line' in k.look && !again ? k.look.line : null;
  return { seq: f.seq, kind: 'camp', face: 'on', late: false, area: S.areaName(c.story, k.stretch), wayIn: null, then: [], stopAgain: again,
    /* made again: where it is and one line of what is there (its first two sentences), never the whole again */
    opened: [], way: [], id: k.id, name: k.name, line: again ? k.line.split(/(?<=[.!?])\s/)[0] : k.line, records: [], guess: [], look, stretch: k.stretch, painting: paintingOf(k.id, k.stretch), completedDay, byKey: false };
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
/** What a job's return says about a Key (D-141). A Key kept for later (no niche in reach when it was earned) used to be
    told of only when it opened something, days on, as if the job then had just earned it (Dan, 2026-10-01). */
function keyNoteOf(facts: Fact[], doneSeq: number, sealId: string | null): Return['keyNote'] {
  if (sealId) {
    const o = facts.find(f => f.type === 'sealOpened' && f.seal === sealId);
    const before = o && facts.find(f => f.seq === o.seq - 1);
    if (before?.type === 'keyUsed') return 'kept';
    if (before?.type === 'keyEarned') return 'earned';
  }
  /* this job's own Key, kept: what the same Done wrote, before any later Done (only a Done lands a rhythm's Key) */
  const done = facts.find(f => f.seq === doneSeq);
  if (done?.type !== 'jobDone') return null;
  for (const f of facts) {
    if (f.seq <= doneSeq) continue;
    if (f.type === 'jobDone' || f.day !== done.day) break;
    if (f.type === 'keyEarned' && !f.for && !f.rhythm.startsWith('floor:')) return facts.find(g => g.seq === f.seq + 1)?.type === 'keyHeld' ? 'held' : null;
  }
  return null;
}
/** A recurring job's session done after its period's Key was already earned (L C4): the period, for one quiet line. */
function keyAlreadyOf(c: Content, facts: Fact[], doneSeq: number): Return['keyAlready'] {
  const done = facts.find(f => f.seq === doneSeq);
  if (done?.type !== 'jobDone' || done.minutes < S.RETURN_MIN) return null;
  const r = rhythmOf(c, done.job);
  if (!r) return null;
  if (!ofType(facts, 'keyEarned').some(k => k.rhythm === r.id && k.seq < doneSeq && Rep.samePeriod(r, k.for ?? k.day, done.day))) {
    /* kept up past the week's five Keys: said once, plainly (deep review W F12) */
    const upTo = facts.filter(f => f.seq <= doneSeq);
    return S.keysIn(facts.filter(f => f.seq < doneSeq), done.day) >= S.KEYS_A_WEEK && S.sessionsIn(upTo, r, done.day, S.RETURN_MIN) >= S.needOf(r)
      && !ofType(facts, 'keyEarned').some(k => k.rhythm === r.id && k.seq > doneSeq && k.day === done.day) ? 'cap' : null;
  }
  return r.every === 2 ? 'fortnight' : r.monthly ? 'month' : r.yearly ? 'year' : r.everyDays ? 'days' : 'week';
}
function rawReturn(c: Content, facts: Fact[], doneSeq: number): Return {
  const beat = facts.find(f => f.type === 'beatPlayed' && f.job === doneSeq) as FactOf<'beatPlayed'> | undefined;
  const keyAlready = keyAlreadyOf(c, facts, doneSeq);
  const finds = facts.filter((f): f is FactOf<'findGiven'> => f.type === 'findGiven' && f.job === doneSeq).map(f => f.id);
  const seal0 = beat && beat.id !== 'passage' ? S.sealOf(c.story, beat.id) ?? (S.beatOf(c.story, beat.id)?.kind === 'stepKey' ? S.sealOf(c.story, S.beatOf(c.story, beat.id)!.seal!) : undefined) : undefined;
  const keyNote = keyNoteOf(facts, doneSeq, seal0 && !facts.some(f => f.type === 'sealOpened' && f.seal === seal0.id && f.how === 'road') ? seal0.id : null);
  if (!beat) return { beat: null, line: '', key: false, guess: [], records: [], finds, keyNote, keyAlready };
  if (beat.id === 'passage') return { beat: null, line: c.story.passages.find(p => p.id === beat.passage)?.line ?? '', key: false, guess: [], records: [], finds, keyNote, keyAlready };
  /* a moment at the top that plays after Dan went down (an old save's, D-160): a trip back up, said first */
  const up = (x: { stretch: StretchId; portable?: boolean; back?: string } | undefined) => x && !x.portable
    && S.isErrand(c.story, S.storyState(facts.filter(f => f.seq < beat.seq), c.story), x) ? { up: S.areaName(c.story, x.stretch), ...(x.back ? { upWhy: x.back } : {}) } : {};
  const seal = S.sealOf(c.story, beat.id);
  if (seal) return { ...up(seal), beat: seal.id, line: seal.line ?? '', key: !facts.some(f => f.type === 'sealOpened' && f.seal === seal.id && f.how === 'road'), guess: seal.carries?.guess ?? [], records: seal.carries?.records ?? [], finds, keyNote, keyAlready };
  const b = S.beatOf(c.story, beat.id)!;
  const viaSeal = b.seal ? S.sealOf(c.story, b.seal) : undefined;
  const guess = [...new Set([...(b.carries?.guess ?? []), ...(viaSeal?.carries?.guess ?? [])])];
  const part = b.carries?.partial && b.carries.seen?.[0] ? { el: b.carries.partial, mark: b.carries.seen[0] } : undefined;
  /* a Key's return says so; a row the road opened is a step like any other (D-129) */
  const byRoad = facts.some(f => f.type === 'sealOpened' && f.seal === b.seal && f.how === 'road');
  const trip = up(b);
  /* a moment in another area (a job's there, D-160): he goes there for it and comes back, said, never a silent jump
     (the round-8 review) */
  const was = S.storyState(facts.filter(f => f.seq < beat.seq), c.story);
  const moved = !('up' in trip) && !b.portable && S.areaOf(c.story, b.stretch) !== S.areaOf(c.story, was.stretch) ? { moved: S.areaName(c.story, b.stretch), from: S.areaName(c.story, was.stretch) } : {};
  return { ...trip, ...moved, beat: b.id, line: ('up' in trip && b.again ? b.again : b.line) ?? '', key: b.kind === 'stepKey' && !byRoad, guess, choice: b.choice, records: [...(b.carries?.records ?? []), ...(viaSeal?.carries?.records ?? [])], finds, keyNote, keyAlready, ...(part ? { part } : {}) };
}

/** Today's list, as Today shows it and as the day's finish line reads it (D-130): on a planned week, every job the plan
    puts on the day (with what Dan chose himself); without a plan, the first of the day's jobs by capacity, "Not today"
    taking one off rather than bringing in the next. Done jobs stay on it, and anything done from outside it joins it. */
function slateOf(c: Content, facts: Fact[], day: string, clock: string) {
  const size = sizeOn(facts, day, c);
  const done = doneOn(facts, day), order = orderOn(c, facts, day, clock);
  /* an appointment planned for today stays on the slate whatever the day's size (P10); the rest fill it in order */
  const planned = W.plannedToday(c, facts, day, clock);
  const times: Record<string, string> = {};
  for (const p of planned) if (p.time) times[p.job] = p.time;
  /* on a planned week Today shows every job planned for the day, as the Week does (review finding, D-080). Without a
     plan, capacity sizes the list; a job Dan said "Not today" to shortens it, as on a planned week (D-130) */
  const entries = new Set(planned.map(p => p.job)), aside = asideOn(facts, day);
  const off = [...aside].filter(id => !entries.has(id) && c.jobs.some(j => j.id === id)).length;
  const slate = planLeads(facts, day) ? order.slice() : order.slice(0, Math.max(0, size - off));
  for (const id of Object.keys(times)) {
    /* an appointment Dan said "Not today" to is off the list like any job (D-130) */
    if (slate.includes(id) || aside.has(id)) continue;
    let k = slate.length - 1;
    while (k >= 0 && (times[slate[k]] || done.has(slate[k]))) k--;
    if (k >= 0) slate.splice(k, 1);
    slate.push(id);
  }
  slate.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  /* a job deleted after it was done leaves the list; the minutes it counted for stay (Dan, D-125) */
  const hidden = hiddenDone(facts), kept = (id: string) => c.jobs.some(j => j.id === id) && !hidden.has(`${id}|${day}`);
  for (const id of order) if (done.has(id) && !slate.includes(id) && kept(id)) slate.push(id);   /* off-plan counts in full */
  for (const id of done) if (!slate.includes(id) && kept(id)) slate.push(id);   /* so does something chosen from outside the list (D-077) */
  /* a done record deleted leaves even a planned place on the list (D-125) */
  for (let i = slate.length - 1; i >= 0; i--) if (done.has(slate[i]) && hidden.has(`${slate[i]}|${day}`)) slate.splice(i, 1);
  /* the finish line (Dan, D-131): the first 3 hours' worth of the day's jobs, in order; the rest wait below, "If there's
     time". Its jobs are fixed by the day's order, not by what is done first, so doing a job out of order never pulls it in
     or pushes another out (review of D-131): the job chosen last night, then the plan's jobs in the order the plan laid
     them, then jobs Dan chose himself today; each counted by how long it takes (learned, or its minutes), until 3 hours
     are reached. An appointment is always on it (P10: the day is never gold with one still to come). A job done from
     outside the list never holds the line back, and is the line only when nothing else is on the day. */
  /* learned from the days before today, so the line never changes while Dan works (second review of D-131) */
  const room = (id: string) => W.roomOf(jobOf(c, id), facts, day, c);
  const ownFirst = firstChosen(facts, day), wk = calendarWeek(day);
  const todays = W.weekOf(c, facts, wk, day).days.find(d => d.day === day)!.jobs;
  const planIdx = new Map((W.planOf(facts, wk) ?? []).map((e, k) => [e.id, k]));
  const byPlan = todays.filter(j => j.entry).sort((a, b) => (planIdx.get(a.entry!) ?? -1) - (planIdx.get(b.entry!) ?? -1)).map(j => j.job);
  const plannedIds = new Set([...byPlan, ...(ownFirst ? [ownFirst] : [])]);
  const onSlate = new Set(slate);
  /* a job on the line when it was done stays on it, whatever put it there (a rhythm falling due, a date near): the line
     never refills because of a completion (L A1). Only a job done from outside the line never holds a place on it */
  const stayed = new Set(doneFacts(facts).filter(f => f.day === day && !plannedIds.has(f.job) && wasOnLine(c, facts, f)).map(f => f.job));
  /* …and keeps its place on it, ahead of the jobs still to do that came after it */
  /* a job Dan set aside ("Not today") still holds its room on the line: the line shortens, never refills (Dan, deep
     review Part 2 #3, W F9) */
  const held = (id: string) => aside.has(id) && !done.has(id) && c.jobs.some(j => j.id === id && !j.stopped);
  let cand = [...new Set([...(ownFirst ? [ownFirst] : []), ...byPlan, ...stayed, ...order, ...slate])].filter(id => (onSlate.has(id) && (plannedIds.has(id) || !done.has(id) || stayed.has(id))) || held(id));
  if (!cand.some(id => onSlate.has(id))) cand = slate.slice();
  /* a job added to today by Dan himself is always on the line, never "If there's time" (Dan, deep review Part 2 #3, W F10) */
  const addedToday = new Set(ofType(onDay(facts, day), 'planAdded').filter(f => f.entry.day === day).map(f => f.entry.job));
  const inLine = new Set<string>();
  let sum = 0;
  for (const id of cand) {
    if (!(times[id] || addedToday.has(id) || sum < W.FINISH_MIN || !inLine.size)) continue;
    sum += room(id);
    if (!held(id)) inLine.add(id);
  }
  const line = slate.filter(id => inLine.has(id));
  /* good hours (D-131): among the line's jobs still to do, the planner's own entries usually started around this hour
     come first. Never a job Dan placed or moved himself, an appointment, the week's pinned job, the one chosen last
     night or one he swapped; never another day's job; any job can still be tapped */
  const todo = line.filter(id => !done.has(id));
  const own = new Set([...ofType(facts, 'planAdded').map(f => f.entry.id), ...ofType(facts, 'planChanged').map(f => f.entry)]);
  const mine = new Set(todays.filter(j => j.entry && own.has(j.entry)).map(j => j.job));
  const swapped = new Set(ofType(onDay(facts, day), 'swapped').flatMap(f => [f.from, f.to]));
  const pin = W.pinnedIn(facts, calendarWeek(day)), bed = bedtimeOf(facts);
  const movable = (id: string) => plannedIds.has(id) && !mine.has(id) && !times[id] && id !== pin && id !== ownFirst && !swapped.has(id);
  const slots = todo.map((id, i) => movable(id) ? i : -1).filter(i => i >= 0);
  const moved = slots.map(i => todo[i]).map((id, k) => ({ id, k, good: W.goodHour(facts, id, clock, bed, c) === true }))
    .sort((a, b) => Number(b.good) - Number(a.good) || a.k - b.k).map(x => x.id);
  slots.forEach((i, k) => { todo[i] = moved[k]; });
  const lineOrdered = [...line.filter(id => done.has(id)), ...todo];
  const rest = slate.filter(id => !line.includes(id));
  return { size, done, order, times, slate: [...lineOrdered.filter(id => !done.has(id)), ...lineOrdered.filter(id => done.has(id)), ...rest], line: lineOrdered };
}
/** Whether a job was on the day's finish line just before it was done (L A1): worked out once for each done record,
    from the log as it stood then (each earlier done record of the day is answered the same way, once). */
const lineMemo = new WeakMap<Fact, boolean>();
function wasOnLine(c: Content, facts: Fact[], f: FactOf<'jobDone'>): boolean {
  const hit = lineMemo.get(f);
  if (hit !== undefined) return hit;
  const before = facts.filter(g => g.seq < f.seq);
  const on = slateOf(W.live(c.base ?? c, before), before, f.day, f.at.slice(11, 16)).line.includes(f.job);
  lineMemo.set(f, on);
  return on;
}
/** The Satchel (D-131): the one list of every job not on today, each in one place. "No day yet": one-offs with no
    day, newest first; "Coming up": one-offs put on a later day, soonest first, with their day; "Recurring jobs". A job
    on today's list is on Today, never here; done, it is in the Daybook. */
/** The jobs waiting on a reply (D-137), soonest first: those whose day has come are on Today, the rest in the Satchel. */
function waitsOf(c: Content, facts: Fact[]) {
  return [...W.waitingOf(facts)].flatMap(([id, x]) => { const j = c.jobs.find(k => k.id === id && !k.stopped); return j && !c.rhythms.some(r => r.job === id) ? [{ job: j, ...x }] : []; })
    .sort((a, b) => a.until.localeCompare(b.until));
}
export function satchelView(base: Content, facts: Fact[], now: Moment): { noDay: Job[]; coming: { job: Job; day: string }[]; recurring: Job[]; waiting: { job: Job; until: string; who?: string }[] } {
  const c = W.live(base, facts), day = dayOf(facts, now);
  const { slate } = slateOf(c, facts, day, now.slice(11, 16));
  const today = new Set(slate);
  /* a delve under way is on Today, even one begun before 04:00 */
  const run = activeRun(facts);
  if (run) today.add(run.fact.job);
  const noDay = W.satchelOf(c, facts, day).filter(j => !today.has(j.id));
  const recurringIds = new Set(c.rhythms.map(r => r.job)), finished = new Set(W.oneOffDone(c, facts).map(f => f.job));
  const weeks = new Set([...ofType(facts, 'planMade').map(f => f.week), ...ofType(facts, 'planAdded').map(f => calendarWeek(f.entry.day))]);
  const soonest = new Map<string, string>();
  for (const wk of [...weeks].filter(x => x >= calendarWeek(day))) for (const e of W.planOf(facts, wk) ?? []) {
    if (e.day <= day || recurringIds.has(e.job) || finished.has(e.job) || today.has(e.job) || W.waitingOf(facts).has(e.job)) continue;
    if (!soonest.has(e.job) || e.day < soonest.get(e.job)!) soonest.set(e.job, e.day);
  }
  const coming = [...soonest].flatMap(([id, d]) => { const j = c.jobs.find(x => x.id === id && !x.stopped); return j ? [{ job: j, day: d }] : []; })
    .sort((a, b) => a.day.localeCompare(b.day));
  const inComing = new Set(coming.map(x => x.job.id));
  const recurring = c.rhythms.map(r => c.jobs.find(j => j.id === r.job)).filter((j): j is Job => !!j && !j.stopped);
  /* waiting on a reply, until its day (then it is on Today, D-137) */
  const waiting = waitsOf(c, facts).filter(x => x.until > day);
  return { noDay: noDay.filter(j => !inComing.has(j.id)), coming, recurring: [...new Map(recurring.map(j => [j.id, j])).values()], waiting };
}

/** The errand run's pick list (D-139): today's one-offs still to do, in Today's order, then the Satchel's (no day yet,
    then coming up). Never a job done, a one-off finished, a recurring job, or the delve under way's. */
export function errandChoices(base: Content, facts: Fact[], now: Moment): string[] {
  const c = W.live(base, facts), day = dayOf(facts, now), { slate } = slateOf(c, facts, day, now.slice(11, 16)), s = satchelView(base, facts, now);
  const ids = [...new Set([...slate, ...s.noDay.map(j => j.id), ...s.coming.map(x => x.job.id)])];
  /* a recurring session (the gym, a course) is no errand (J12, L C2) */
  return ids.filter(id => errandable(c, facts, day, id) && !inRun(facts, id) && !c.rhythms.some(r => r.job === id));
}

/** The day's finish line (Dan, D-130): every job on today's list is done, with no hidden count and nothing lowered for
    opening late. At least one of the day's jobs must have real minutes behind it, so a list said done without any work
    never completes a day (rule 10). An empty list completes with the first job worked on, which then is the list. */
function listDone(c: Content, facts: Fact[], day: string, at: Moment): boolean {
  const { line, slate, done } = slateOf(c, facts, day, at.slice(11, 16));
  /* the real minutes must be on today's list: a done record deleted (D-125) leaves it, and an emptied list is not a
     finished day. Anywhere on it: work done off the plan counts too (review of D-131) */
  const worked = workedOn(facts, day);
  return slate.some(id => worked.has(id)) && line.every(id => done.has(id));
}

export function see(facts: Fact[], base: Content, now: Moment): View {
  const c = W.live(base, facts);
  const day = dayOf(facts, now), nowMs = epochOf(now), clock = now.slice(11, 16);
  const capacity = capacityOn(facts, day);
  const { size, done, order, times, slate, line } = slateOf(c, facts, day, clock);
  /* the list's jobs are all done, with real work on it: a fact about the list, said nowhere and ending nothing (D-160: the
     day ends only on Go to sleep) */
  const complete = listDone(c, facts, day, now);
  /* "under way" was a job without a timer begun away from the phone; every job is a delve now (D-117), so an old Begin
     in a save leaves nothing under way */
  const underWay = ((u: string | null) => u && c.jobs.some(j => j.id === u && !j.delve) ? u : null)(underWayOn(facts, day));
  const seen = new Set(ofType(facts, 'seen').map(f => f.ref));

  let run: RunView | null = null;
  const r = activeRun(facts);
  if (r) {
    const s = runAt(r.plan, r.marks, nowMs), j = jobOf(c, r.fact.job);
    const held = ofType(facts, 'delveHeld').filter(f => f.seq > r.fact.seq).pop();
    if (s.phase !== 'ended') run = { ...s, seq: r.fact.seq, job: j, minutes: r.plan.minutes, count: r.plan.count, startedAt: r.plan.startedAt,
      away: s.phase === 'held' && held?.why === 'away', carried: carriedOf(facts, c, j.id, r.fact.seq),
      errands: r.fact.errands ? r.fact.errands.map(id => ({ job: jobOf(c, id), struck: r.struck.has(id) })) : null };
  }

  let runEnd: RunEnd | null = null, runFinds: string[] = [];
  const ends = ofType(facts, 'delveEnded');
  const last = ends[ends.length - 1];
  if (last && !seen.has(last.seq) && !run) {
    const j = jobOf(c, last.job), start = facts.find(f => f.seq === last.run) as FactOf<'delveStarted'> | undefined;
    /* answered on a later game day (a delve begun before 04:00, answered after): still this run's answer */
    const doneFact = doneFacts(facts).find(f => f.job === j.id && f.seq > last.run);
    const completedDay = facts.some(f => f.type === 'dayCompleted' && f.seq > last.run);
    const carried = carriedOf(facts, c, j.id, last.seq);
    /* where Dan stood when it ended (a night's head start after it never moves the count's start), and how far this run
       moved him: on the road as Today counts it, minutes taken back made up first (fresh review of B3) */
    const at = walked(facts.filter(f => f.seq < last.seq));
    const gained = Math.max(0, at - walked(facts.filter(f => f.seq < last.run)));
    /* an errand run asks nothing: its errands struck off are done at its end (D-139) */
    const pend = pendingErrands(facts);
    const errands = start?.errands ? start.errands.map(id => ({ job: jobOf(c, id), struck: !!pend?.struck.has(id),
      minutes: ofType(facts, 'errandShare').filter(f => f.run === last.run && f.job === id).reduce((a, f) => a + f.minutes, 0),
      done: ofType(facts, 'jobDone').find(f => f.errand === last.run && f.job === id)?.seq ?? null })) : null;
    runEnd = { seq: last.seq, job: j, minutes: last.minutes, how: last.how, carried, total: carried + last.minutes, gained, walked: at,
      ask: !errands && j.doneBy === 'dan' && !doneOn(facts, last.day).has(j.id) && !doneFact,
      enough: j.doneBy === 'enough' && !!doneFact, completedDay, count: start?.count ?? 1, errands, pending: !!pend,
      parked: ofType(facts, 'itemAdded').filter(f => f.via === 'park' && f.run === last.run && c.jobs.some(x => x.id === f.id)).length };
    /* a side chamber is found at the delve's end, and can come just after it, once a place it reached starts a new stretch */
    /* (a chamber a tick reached since is the tick's, shown on its step screen, D-134) */
    const ticks = ofType(facts, 'stepsGained').filter(g => g.tick && g.seq > last.run);
    runFinds = ofType(facts, 'findGiven').filter(f => f.seq > last.run && !f.job && (f.seq < last.seq || f.why === 'chamber')
      && !ticks.some(g => g.seq < f.seq && g.at === f.at)).map(f => f.id);
  }

  const arrivals = ofType(facts, 'arrived');
  /* (a camp from a night before today is past: its screen said tonight, and he went to sleep, D-160 review) */
  const unseen = arrivals.find(a => !seen.has(a.seq) && !(a.kind === 'camp' && a.day < day));
  const arrival = unseen ? arrivalOf(c, facts, unseen) : null;
  const lastArr = arrivals.length ? arrivalOf(c, facts, arrivals[arrivals.length - 1]) : null;

  let next: View['next'] = null;
  if (run?.phase === 'held') next = { job: run.job.id, mode: 'carry' };
  else if (run) next = { job: run.job.id, mode: 'running' };
  else if (underWay) next = { job: underWay, mode: 'underWay' };
  else if (!complete) { const id = slate.find(x => !done.has(x)); if (id) next = { job: id, mode: 'begin' }; }
  if (!next) {
    /* after the day's work (or with today's list cleared), the job Dan tapped, until it is done or set aside (D-077) */
    const aside = asideOn(facts, day), waiting = W.waitingOf(facts), picks = ofType(onDay(facts, day), 'picked').map(f => f.job).filter(id => !done.has(id) && !aside.has(id) && !waiting.has(id));
    if (picks.length) next = { job: picks[picks.length - 1], mode: 'begin' };
  }

  /* an arrival not yet seen isn't where Dan stands yet: it is revealed on its own screen */
  const shown = arrival ? facts.filter(f => !(f.type === 'arrived' && f.seq >= arrival.seq)) : facts;
  const st = S.storyState(shown, c.story);
  /* where Dan is: the last place he walked to; an evening at camp never moves him (D-154) */
  const lastPlace = st.here ? S.beatOf(c.story, st.here) : undefined;
  const opening = c.story.beats.find(b => b.kind === 'morning' && b.w === 1);
  const stretch = c.story.stretches.find(x => x.id === st.stretch)!;
  const area = S.areaName(c.story, st.stretch);
  const hereSeq = lastPlace ? ofType(shown, 'arrived').filter(a => a.kind === 'place' && a.id === lastPlace.id).pop()?.seq ?? null : null;
  const here: Here = lastPlace
    ? { id: lastPlace.id, name: lastPlace.name ?? stretch.name, line: lastPlace.line ?? '', stretch: st.stretch, painting: paintingOf(lastPlace.id, st.stretch), area, seq: hereSeq }
    /* (camped on the way in, before the first place: that spot, by the camp's name and words, round 5) */
    : ((k) => k ? { id: null, name: k.name, line: k.line, stretch: st.stretch, painting: paintingOf(k.id, st.stretch), area, seq: null }
      : { id: null, name: stretch.name, line: opening?.line ?? '', stretch: st.stretch, painting: STAND_IN[st.stretch], area, seq: null })(
      c.story.camps.find(x => x.id === ofType(shown, 'arrived').filter(a => a.kind === 'camp').pop()?.id));
  /* the road counts on from the last place reached, even one not yet looked at (a word left for later): the minutes
     still visibly go somewhere (deep review B13, W F7); it names nothing, so it reveals nothing */
  const wordWaits = !!arrival && S.beatOf(c.story, arrival.id)?.kind === 'word';
  const full = wordWaits ? S.storyState(facts, c.story) : st;
  const w = walked(facts), nextBeat = S.nextPlace(c.story, full, pushOn(facts, day)),
    /* a place the story bits on the way will open is still the next place (D-129) */
    nextAt = nextBeat || S.placeAhead(c.story, full) ? S.nextPlaceAt(full) : null;
  /* one in the stretch Dan is in first: a thing behind him is never "ahead" (D-143) */
  const view = S.inView(c.story, st, st.stretch);
  const openNow = S.openable(c.story, st);

  /* slice 4: tonight, the morning after, the welcome back, the daybook's new page, the deep push */
  const sugg = suggestedOn(facts, day);
  /* tonight's: the last goodnight of the day, unless there has been work since (then the day goes on, D-160) */
  const gn = ((g) => g && !ofType(facts, 'stepsGained').some(f => f.seq > g.seq && f.job !== 'sleep') ? g : undefined)(ofType(onDay(facts, day), 'goodnight').pop());
  const campLine0 = gn ? facts.find(f => f.seq > gn.seq && f.type === 'beatPlayed' && f.id.endsWith('.camp') && f.day === day) as FactOf<'beatPlayed'> | undefined : undefined;
  /* an evening that night already ends on the bedtime line: Today doesn't say it twice (D-154) */
  const campLine = campLine0 && !facts.some(f => f.type === 'arrived' && (f.kind === 'evening' || f.how === 'evening') && f.seq > gn!.seq && f.seq < campLine0.seq) ? campLine0 : undefined;
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
  /* (minutes taken back and still owed come first: they are part of the way to it, fresh review) */
  const toNext = nextAt !== null ? Math.max(0, nextAt - w + roadOf(facts).owed) : null;
  /* shown only while it holds a find to give */
  const chamber = S.pickFind(c.story, full, 'chamber') ? toChamber(wordWaits ? facts : shown, full) : null;

  return {
    /* what is still owed in all, and what was taken back today (two take-backs on different days read rightly, fresh review) */
    owed: ((r, today) => r.owed > 0 && today > 0 ? { taken: today, left: r.owed } : null)(roadOf(facts), ofType(facts, 'tickTakenBack').filter(f => f.on === day).reduce((a, f) => a + f.minutes, 0)),
    suggestedBy: sugg.by, bedtime: bedtimeOf(facts), night: gn ? { kept: gn.kept, beat: campLine?.id ?? null } : null,
    morning, welcome, close, times, content: c,
    replies: waitsOf(c, facts).filter(x => x.until <= day).map(x => ({ job: x.job.id, until: x.until, ...(x.who ? { who: x.who } : {}) })),
    /* (a job moved to a later day was moved, not set aside: it is on its day) */
    aside: ((later) => [...asideOn(facts, day)].filter(id => c.jobs.some(j => j.id === id && !j.stopped) && !done.has(id) && !W.waitingOf(facts).has(id) && !slate.includes(id) && !later.has(id)))(laterDays(facts, day)),
    forecast: W.forecast(c, facts, day, toNext, S.PLACE_GAP),
    findWaits: !!S.pickFind(c.story, st, 'avoided'),
    day, capacity, suggested: sugg.capacity, size, order, slate, line, done, underWay, complete, next, run, runEnd, arrival,
    /* ahead: the sealed thing in view; before any, the way in (the first morning), then a line from just ahead */
    aheadKey: !!view && !S.onRoad(c.story, view.id), keys: st.held,
    lateKeys: ofType(facts, 'keyEarned').filter(k => k.for && k.day === day)
      .map(k => c.jobs.find(j => j.id === c.rhythms.find(r => r.id === k.rhythm)?.job)?.name).filter((n): n is string => !!n),
    aheadBehind: view && !S.onRoad(c.story, view.id) && S.areaOf(c.story, view.stretch) !== S.areaOf(c.story, st.stretch) ? view.stretch : null,
    /* "Area, place…": the place after its area's name (D-154) */
    aheadHere: !!view && S.areaOf(c.story, view.stretch) === S.areaOf(c.story, st.stretch) && !!here.name
      && view.where.toLowerCase().replace(`${here.area.toLowerCase()}, `, '').startsWith(here.name.toLowerCase()),
    /* in the area Dan is in first (a lock on another stretch of it is still "here", D-154) */
    keyUse: st.held ? (openNow.find(x => S.areaOf(c.story, x.stretch) === S.areaOf(c.story, st.stretch)) ?? openNow[0])?.stretch ?? null : null,
    keyHere: st.held ? openNow.find(x => S.areaOf(c.story, x.stretch) === S.areaOf(c.story, st.stretch))?.id ?? null : null,
    here, ahead: view ? view.where : here.id === null ? here.line || S.teaser(c.story, st) : S.teaser(c.story, st), walked: w, toNext, nextAt, toChamber: chamber,
    road: { from: S.lastPlaceAt(full), chamber: S.chamberAt(full), to: S.nextPlaceAt(full), place: nextAt !== null },
    /* the next place on foot is in the area Dan is in (the road says "Further into …"), or a new one ("On down"); never
       its name before he reaches it (D-154) */
    nextHere: ((b: Beat | null) => b ? S.areaOf(c.story, b.stretch) === S.areaOf(c.story, full.stretch) : null)(nextBeat ?? S.placeAhead(c.story, full)),
    /* the next place is back in an area walked before (a turn-off, a return): never "On down" (the second branch review) */
    nextBack: ((b: Beat | null) => !!b && S.areaOf(c.story, b.stretch) !== S.areaOf(c.story, full.stretch)
      && [...full.visited].some(x => S.areaOf(c.story, x) === S.areaOf(c.story, b.stretch)))(nextBeat ?? S.placeAhead(c.story, full)),
    lastArrival: lastArr, story: wordWaits ? full : S.storyState(facts, c.story), teaser: S.teaser(c.story, st), runFinds,
    passage: c.story.passages.find(p => p.id === S.nextPassage(c.story, st))?.line ?? '',
  };
}

/** The run set-up for a job: a one-off opens at one delve of 30 minutes (D-124); a recurring job at its own minutes, the
    ones Dan set for it (Dan, D-146): one delve on a dial stop, else the fewest equal delves on a stop that make them
    (120 → 2 × 60, 50 → 2 × 25), else the nearest stop. Dan still sets the minutes and the delves himself. */
export const PRESET = { minutes: 30, count: 1 } as const;
export function presetRun(j?: Job, c?: { rhythms: { job: string }[] }): { minutes: number; count: number } {
  if (!j || !c?.rhythms.some(r => r.job === j.id) || !(j.length > 0)) return { ...PRESET };
  for (let count = 1; count <= 8; count++) {
    const m = j.length / count;
    if ((DIAL as readonly number[]).includes(m)) return { minutes: m, count };
  }
  const near = [...DIAL].sort((a, b) => Math.abs(a - j.length) - Math.abs(b - j.length) || b - a)[0];
  return { minutes: near, count: 1 };
}

export { alertsAfter, runAt };
export type { RunPlan, RunMark };
