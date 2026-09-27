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
import type { CalEvent, Capacity, Content, Fact, FactBody, FactOf, Job, Rhythm } from './types';
import * as S from './story';
import * as W from './week';
import * as R from './reminders';
import * as Rep from './repeat';
import type { Beat, Seal, StretchId } from './story-types';

export const STEP_MIN = 25;                                   /* BALANCING §1 */
export const DAY_SIZE: Record<Capacity, number> = { low: 2, normal: 3, high: 5 };   /* §6 */
export const DIAL = [5, 10, 15, 25, 30, 45, 60, 90] as const;   /* the dial's stops (D-033; 5–15 and 90, D-110) */
const MIN = 60_000;

/* ---------- reading the log ---------- */

const ofType = <T extends FactBody['type']>(facts: Fact[], type: T) => facts.filter((f): f is FactOf<T> => f.type === type);
const onDay = (facts: Fact[], day: string) => facts.filter(f => f.day === day);
const jobOf = (c: Content, id: string): Job => c.jobs.find(j => j.id === id) ?? { id, name: id, delve: false, length: STEP_MIN, doneBy: 'dan' };

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
/** Whether Dan laid this week out with Plan my week: then Today follows the plan (D-078). A line or appointment added by
    hand to a week not laid out is an extra on its day, never a takeover (D-107). */
const planLeads = (facts: Fact[], day: string) => W.planMade(facts, calendarWeek(day));
/** How many jobs the week puts on a day (done as planned, or still to do; a job set aside no longer counts, D-080). */
function plannedCount(c: Content, facts: Fact[], day: string): number {
  const aside = asideOn(facts, day);
  return W.weekOf(c, facts, calendarWeek(day), day).days.find(d => d.day === day)!.jobs.filter(j => j.entry && (j.done || !aside.has(j.job))).length;
}
/** The day's size: from capacity; on a planned week, never more than the plan puts on the day (at least one) (D-078).
    On a week not laid out, the entries Dan added to the day come on top of it (D-107). */
function sizeOn(facts: Fact[], day: string, c?: Content) {
  const first = onDay(facts, day).find(f => f.type === 'opened');
  const size = daySize(capacityOn(facts, day), first ? first.at : null);
  if (!c) return size;
  const n = plannedCount(c, facts, day);
  if (!planLeads(facts, day)) return size + n;
  /* a High day holds one more than the plan (D-082) */
  return Math.max(1, Math.min(size, n + (capacityOn(facts, day) === 'high' ? 1 : 0)));
}

const doneOn = (facts: Fact[], day: string) => new Set(ofType(onDay(facts, day), 'jobDone').map(f => f.job));
/** Jobs done with real minutes behind them: only these complete a day or call the deep push (rule 10, D-117, D-121). */
const workedOn = (facts: Fact[], day: string) => new Set(ofType(onDay(facts, day), 'jobDone').filter(f => f.minutes >= S.RETURN_MIN).map(f => f.job));
/** Done records Dan deleted (D-125), as "job|day": they leave the lists; the minutes they counted for stay. */
export function hiddenDone(facts: Fact[]): Set<string> {
  const out = new Set<string>();
  for (const f of ofType(facts, 'doneHidden')) { const k = `${f.job}|${f.on}`; if (f.back) out.delete(k); else out.add(k); }
  return out;
}
const completedOn = (facts: Fact[], day: string) => onDay(facts, day).some(f => f.type === 'dayCompleted');
export const delveMinutesOn = (facts: Fact[], day: string, job: string) =>
  ofType(onDay(facts, day), 'stepsGained').filter(f => f.job === job && f.run !== undefined).reduce((a, f) => a + f.minutes, 0);

export const rhythmOf = (c: Content, job: string): Rhythm | undefined => c.rhythms.find(r => r.job === job);
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
  if (r?.everyDays) return Rep.dueFrom(facts, r, day) <= day || ofType(facts, 'jobDone').some(f => f.job === j.id && f.day === day);
  if (!r) return !ofType(facts, 'jobDone').some(f => f.job === j.id && f.day !== day);
  return true;
}
/** Dated work within three days of its date (or past it), not yet done: offered on Today even without a plan (D-114). */
export const SOON_DAYS = 3;
const dueSoon = (facts: Fact[], j: Job, day: string) =>
  !!j.by && W.daysBetween(day, j.by) <= SOON_DAYS && !ofType(facts, 'jobDone').some(f => f.job === j.id && f.day !== day);
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
  /* the week's one thing that matters most leads Today on the day it is planned (D-116), after an appointment that is due */
  const pin = W.pinnedIn(facts, calendarWeek(day)), times = W.plannedToday(c, facts, day, clock);
  if (pin && plan.includes(pin)) {
    plan.splice(plan.indexOf(pin), 1);
    const due = times.filter(x => x.time && plan.indexOf(x.job) === 0).length;
    plan.splice(due, 0, pin);
  }
  const planned = new Set(plan);
  /* a week laid out with Plan my week: Today is the plan, nothing else slipped in (Dan, D-078); "Something else…" is there */
  /* on a planned week, a job Dan chose himself today (begun, delved on or tapped) joins the list after the plan's (D-080) */
  const chosen = [...new Set(onDay(facts, day).flatMap(f => f.type === 'jobBegun' || f.type === 'delveStarted' || f.type === 'picked' ? [f.job] : []))]
    .filter(id => !planned.has(id) && !aside.has(id) && c.jobs.some(j => j.id === id)).map(id => c.jobs.find(j => j.id === id)!);
  /* a High day adds one job beyond the plan (the next one due), and only one; more is Dan's own choice (Dan, D-082) */
  const off = new Set(ofType(onDay(facts, day), 'jobDone').map(f => f.job).filter(id => !planned.has(id)));
  const extra = planLeads(facts, day) && capacityOn(facts, day) === 'high' && off.size === 0
    ? c.jobs.filter(j => !j.item && !planned.has(j.id) && !aside.has(j.id) && !chosen.includes(j) && offeredOn(c, facts, day, j, planned) && !metThisWeek(c, facts, day, j.id)).slice(0, 1) : [];
  /* dated work near its date joins a planned day too (D-114) */
  const soon = c.jobs.filter(j => !planned.has(j.id) && !aside.has(j.id) && !chosen.includes(j) && dueSoon(facts, j, day));
  const offered = planLeads(facts, day) ? [...chosen, ...soon, ...extra.filter(j => !soon.includes(j))] : c.jobs.filter(j => offeredOn(c, facts, day, j, planned) && !planned.has(j.id) && !aside.has(j.id));
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
  /* a find comes from where Dan knows he is: a place reached but not yet shown on its arrival screen doesn't count yet,
     or a find could describe a room on the screen before the one that brings him into it */
  const seen = new Set(w.all.filter(f => f.type === 'seen' && f.what === 'arrival').map(f => (f as FactOf<'seen'>).ref));
  const known = w.all.filter(f => !(f.type === 'arrived' && !seen.has(f.seq)));
  const f = S.pickFind(c.story, S.storyState(known, c.story), why);
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
  /* every 150 minutes reaches a place, as many a day as Dan walks (Dan, D-123: no one-a-day limit); a story week done on
     the way opens the next at once, so its places can be reached too */
  const reach = () => {
    let n = 0;
    for (;;) {
      const st = S.storyState(w.all, c.story);
      if (walked(w.all) < S.nextPlaceAt(st)) return n;
      const next = S.nextPlace(c.story, st, push);
      if (!next) { if (storyClock(w, c, at, day)) continue; return n; }
      arrive(w, c, next, 'foot', at, day); n++;
    }
  };
  /* a place plays the moment it is reached, not held for day complete (Dan, 2026-09-24, D-073) */
  if (!completedOn(w.all, day)) {
    if (workedOn(w.all, day).size < sizeOn(w.all, day, c)) { reach(); return; }
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

/** A job's delve minutes from runs begun on an earlier game day that ended on this one (a delve begun before 04:00 and
    said done after it): they count for this day's Done, so they aren't paid again (D-120). */
function crossedIn(facts: Fact[], day: string, job: string): number {
  let n = 0;
  for (const e of ofType(facts, 'delveEnded')) if (e.job === job && e.day < day && gameDay(e.at) === day && !doneOn(facts, e.day).has(job)) n += e.minutes;
  return n;
}
function markDoneIn(w: W, c: Content, job: string, at: Moment, day: string) {
  if (doneOn(w.all, day).has(job)) return;
  const j = jobOf(c, job), timed = delveMinutesOn(w.all, day, job) + crossedIn(w.all, day, job);
  /* a delve's minutes have already moved Dan (counted once, even across 04:00, D-120). Every job is a delve (D-117): one
     said done with no whole minute behind it is off the list, but earns no minutes and brings no return: no step of the
     story, no find, no Key, and it doesn't count towards the day's completion (rule 10) */
  if (timed === 0) { w.put({ type: 'jobDone', job, minutes: 0 }, at, day); return; }
  /* a session of a minute or two is done and its minutes have moved Dan, but a few one-minute stops never open the story
     or complete a day (rule 10, D-121) */
  if (timed < S.RETURN_MIN) { w.put({ type: 'jobDone', job, minutes: timed }, at, day); gifts(w, c, at, day); return; }
  const done = w.put({ type: 'jobDone', job, minutes: timed }, at, day);
  storyClock(w, c, at, day);
  /* a rhythm met this week lands a Key, until the week's supply is used; past it, one find a week (§3). A rhythm Dan
     added or changed counts for Keys from its next full period (D-043 F7): the rhythms as they stood when the week began. */
  const r = rhythmOf(W.live(c.base ?? c, w.all, calendarWeek(day)), job);
  let keyed = false;
  /* any session meets the rhythm (Dan, D-121), but only sessions of the dial's shortest delve or more count towards its
     Key: a few one-minute sessions never open the story (rule 10) */
  if (r && S.sessionsIn(w.all, r, day, S.RETURN_MIN) === S.needOf(r)) {
    if (S.keysIn(w.all, day) < S.KEYS_A_WEEK) keyed = !!landKey(w, c, r.id, at, day, done.seq);
    else if (!ofType(w.all, 'findGiven').some(f => f.why === 'surplus' && calendarWeek(f.day) === calendarWeek(day))) giveFind(w, c, 'surplus', at, day, done.seq);
  }
  /* the return: the deep push's next beat (once a day) on a High day past a Normal day's size, or once a Normal day's
     jobs are done if Dan called the push in the morning (D-054); else the story's next step; else a line of the passage */
  if (!keyed) {
    const st = S.storyState(w.all, c.story), step = S.nextStep(c.story, st);
    const n = workedOn(w.all, day).size, called = onDay(w.all, day).some(f => f.type === 'deepCalled');
    const deep = capacityOn(w.all, day) === 'high' && (n > DAY_SIZE.normal || (called && n >= DAY_SIZE.normal))
      && !ofType(onDay(w.all, day), 'beatPlayed').some(f => S.beatOf(c.story, f.id)?.kind === 'deep') ? S.nextDeep(c.story, st) : null;
    if (deep) { w.put({ type: 'beatPlayed', id: deep.id, job: done.seq }, at, day); show(w, c, deep.carries?.records, at, day); }
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

/** A repeating job counts for the minutes it was run for (Dan, D-121): a run on it that ends with a whole minute or more
    is that day's session, whatever its enough (which only sets the delve's usual length and the plan's room). */
const sessionEnds = (all: Fact[], day: string, j: Job, minutes: number) =>
  j.doneBy === 'enough' && minutes > 0 && !doneOn(all, day).has(j.id);

/** A delve's end takes the lines struck off during it out of the job's list (D-126). */
export const STRUCK = '~ ';
function clearStruck(w: W, c: Content, id: string, at: Moment, day: string) {
  const j = c.jobs.find(x => x.id === id);
  if (!j?.list || !j.list.split('\n').some(l => l.startsWith(STRUCK))) return;
  const list = j.list.split('\n').filter(l => !l.startsWith(STRUCK)).join('\n');
  const job: Job = { ...j };
  delete job.stopped;
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
  if (sessionEnds(w.all, rday, j, counted)) markDoneIn(w, c, j.id, at, rday);
  else gifts(w, c, at, rday);
  /* a place reached on this delve starts a new stretch, whose halfway may already be behind Dan (an arrival held for
     tomorrow, D-122) */
  if (part > 0) sideChamber(w, c, at, rday);
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
  if (!r) return;
  const s = runAt(r.plan, r.marks, from);
  let at = s.phase === 'delve' ? from : s.phase === 'breather' ? from + s.breatherLeftMs : null;
  if (at === null || at >= to) return;
  /* never stamped before something already in the log (the log stays in time order) */
  at = Math.max(at, epochOf(w.all[w.all.length - 1].at));
  if (runAt(r.plan, r.marks, at).phase === 'delve') w.put({ type: 'delveHeld', why: 'away' }, momentOf(at, w.off));
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
  return chamberFound(facts) ? null : Math.max(0, S.chamberAt(st) - walked(facts));
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
    /* a repeating job's run is its session, at the run's end (D-121) */
    if (sessionEnds(w.all, day, j, minutes)) markDoneIn(w, c, j.id, at, day);
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
 * (weeks 1, 5, 9 and 13), the story week's glimpse, and the sealed things the weekly floor opened. A week with nothing done
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
    /* the first close of each month of play: weeks 1, 5, 9, 13… */
    const month = (n - 1) % 4 === 0 ? c.story.soFar[(n - 1) / 4] : undefined;
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
    /* the story's opening (the hillside, before any job) shares the week-1 morning's id: it is never a morning after camp */
    const opening = S.beatOf(c.story, id)?.kind === 'morning' && S.beatOf(c.story, id)?.w === 1 && !confirms(id).length;
    if (!opening && !confirms(id).length && !S.storyState(w.all, c.story).played.has(id)) w.put({ type: 'beatPlayed', id }, at, day);
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
  | { do: 'unbegin'; job: string }
  | { do: 'putBack'; job: string }
  | { do: 'startRun'; job: string; minutes: number; count: number }
  | { do: 'skipBreather' }
  | { do: 'stepAway' }
  | { do: 'resume' }
  | { do: 'finishHere' }
  /** Dan was in another app from `from` to `to` (game-clock ms): the delve pauses where he left (D-094). */
  | { do: 'away'; from: number; to: number }
  /** "It's done": a job delved on said done (every job is a delve, D-117; "Already done" and "yesterday" are gone);
      `keepEnd`: a delve under way on it ends and its end screen stays (D-120) */
  | { do: 'done'; job: string; keepEnd?: boolean }
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
  | { do: 'addItems'; lines: string[] }
  /** Lines from outside the app (D-113), each added once, whatever happens between writing and clearing */
  | { do: 'takeInbox'; lines: { id: string; text: string }[] }
  | { do: 'tick'; id: string }
  | { do: 'dropItem'; id: string }
  | { do: 'planWeek'; week: string }
  /** Lay out the rest of the week from today, keeping what Dan placed himself (D-114) */
  | { do: 'replan' }
  | { do: 'movePlan'; entry: string; day: string | null; time?: string | null }
  | { do: 'planJob'; job: string; day: string; time?: string }
  | { do: 'addToWeek'; line: string; day: string; time?: string }
  | { do: 'bedtime'; time: string }
  | { do: 'goodnight' }
  | { do: 'callDeep' }
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

/** The facts a command adds to the log (including anything the clock made due first). */
export function act(facts: Fact[], base: Content, cmd: Command, now: Moment): Fact[] {
  const w = writer(facts, now), nowMs = epochOf(now), c = W.live(base, facts);
  /* before anything the clock made due: the time away must not have counted */
  if (cmd.do === 'away') { settleIn(w, c, Math.min(cmd.from, nowMs)); pauseAway(w, cmd.from, Math.min(cmd.to, nowMs)); }   /* what was due before he left first, in time order (D-120) */
  settleIn(w, c, nowMs);
  const day = gameDay(now), v = see(w.all, c, now);
  switch (cmd.do) {
    case 'open': {
      const was = S.storyState(w.all, c.story).week, first = !onDay(w.all, day).some(f => f.type === 'opened');
      w.put({ type: 'opened' });
      if (first) welcomeBack(w, c, now, day);
      /* a week with no plan yet is laid out at its first opening, from today on, so the Week and Today always agree;
         Dan changes it as he likes (Dan, D-078; review finding, D-080) */
      if (!W.planMade(w.all, calendarWeek(day))) w.put({ type: 'planMade', week: calendarWeek(day), entries: W.planWeek(c, w.all, calendarWeek(day), day) });
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
      /* choosing the day as planned is an answer too: the choice has been seen (D-114) */
      if (cmd.capacity !== v.capacity || !ofType(onDay(w.all, day), 'capacityChosen').length) {
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
    /* undoing a tap made by mistake (review 2, D-088): Begin taken back, or a job set aside put back on today's list */
    case 'unbegin': if (v.underWay === cmd.job) w.put({ type: 'beginUndone', job: cmd.job }); break;
    case 'putBack': if (asideOn(w.all, day).has(cmd.job)) w.put({ type: 'putBack', job: cmd.job }); break;
    case 'startRun':
      /* only a run the dial can set: whole minutes up to its longest stop, one to eight delves (D-120) */
      if (v.run || !Number.isInteger(cmd.minutes) || cmd.minutes < 1 || cmd.minutes > DIAL[DIAL.length - 1] || !Number.isInteger(cmd.count) || cmd.count < 1 || cmd.count > 8) break;
      if (!begunOn(w.all, day, cmd.job)) w.put({ type: 'jobBegun', job: cmd.job, from: 'app' });
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
    case 'done': {
      const on = day;
      if (!c.jobs.some(j => j.id === cmd.job) || doneOn(w.all, on).has(cmd.job)) break;
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
    case 'cantStart': w.put({ type: 'cantStartUsed', job: cmd.job }); break;
    /* Dan's own rhythms and lines: editing earns nothing and loses nothing (P16, D-038) */
    case 'saveRhythm': if (cmd.job.name.trim()) w.put({ type: 'rhythmSaved', rhythm: { ...cmd.rhythm, job: cmd.job.id }, job: { ...cmd.job, name: cmd.job.name.trim() } }); break;
    case 'stopRhythm': if (c.rhythms.some(r => r.id === cmd.id)) w.put({ type: 'rhythmStopped', id: cmd.id }); break;
    case 'saveJob': {
      const name = cmd.job.name.trim().slice(0, 120);
      if (!name) break;
      const job: Job = { ...cmd.job, name, length: Math.min(240, Math.max(5, Math.round(cmd.job.length))) };
      delete job.stopped;
      for (const k of ['firstStep', 'note'] as const) { const x = job[k]?.trim(); if (x) job[k] = x.slice(0, 160); else delete job[k]; }
      if (cmd.rhythm) { w.put({ type: 'rhythmSaved', rhythm: { ...cmd.rhythm, job: job.id }, job }); break; }
      /* "doesn't repeat": its rhythm ends (a one-off from now, until done), then the job as edited */
      for (const r of c.rhythms.filter(x => x.job === job.id)) w.put({ type: 'rhythmStopped', id: r.id });
      w.put({ type: 'jobSaved', job });
      break;
    }
    case 'removeJob': if (c.jobs.some(j => j.id === cmd.id)) w.put({ type: 'jobRemoved', id: cmd.id }); break;
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
      const list = cmd.list.split('\n').map(l => l.replace(/\s+$/, '')).filter(l => l.trim()).join('\n').slice(0, 2000);
      if (!j || (j.list ?? '') === list) break;
      const job: Job = { ...j };
      delete job.stopped;
      if (list) job.list = list; else delete job.list;
      w.put({ type: 'jobSaved', job });
      break;
    }
    case 'takeInbox': {
      const seen = new Set(ofType(w.all, 'itemAdded').map(f => f.ref).filter(Boolean));
      let k = ofType(w.all, 'itemAdded').length;
      for (const x of cmd.lines) {
        const name = String(x.text ?? '').trim().slice(0, 120);
        if (!name || !x.id || seen.has(x.id)) continue;
        seen.add(x.id);
        w.put({ type: 'itemAdded', id: `it-${++k}`, name, via: 'siri', ref: x.id });
      }
      break;
    }
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
        endRunOn(w, c, cmd.id, nowMs, now);
        if (!begunOn(w.all, day, cmd.id)) w.put({ type: 'jobBegun', job: cmd.id, from: 'record' });
        markDoneIn(w, c, cmd.id, now, day);
      } else w.put({ type: 'itemTicked', id: cmd.id });
      break;
    }
    case 'dropItem': if (W.items(w.all, day).some(x => x.id === cmd.id)) w.put({ type: 'itemDropped', id: cmd.id }); break;
    case 'planWeek': w.put({ type: 'planMade', week: cmd.week, entries: W.planWeek(c, w.all, cmd.week, day) }); break;
    case 'replan': {
      const wk = calendarWeek(day), plan = W.planOf(w.all, wk) ?? [];
      const own = new Set(ofType(w.all, 'planAdded').map(f => f.entry.id));
      const fixed = plan.filter(e => own.has(e.id));
      w.put({ type: 'planMade', week: wk, entries: W.planWeek(c, w.all, wk, day, fixed) });
      break;
    }
    case 'movePlan': {
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
      const events = cmd.events.filter(e => e && typeof e.start === 'string' && typeof e.end === 'string').slice(0, 400)
        .map(e => ({ id: String(e.id), cal: String(e.cal), title: String(e.title ?? '').slice(0, 80), start: e.start.slice(0, 16), end: e.end.slice(0, 16), allDay: !!e.allDay }));
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
}
export interface RunEnd {
  seq: number; job: Job; minutes: number; how: 'ranOut' | 'finishedHere';
  /** A one-off that isn't done yet: ask "Is it done?" */
  ask: boolean;
  /** A repeating job's session was done by this run (D-121). */
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
  /** Minutes of effort from here to the side chamber halfway to the next place, until it is found (D-122). */
  toChamber: number | null;
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
  /* story weeks 8–14: the side gallery is square stone, so it borrows the square gallery's own painting */
  'st-water': 'sample-pool-dome', 'st-reading': 'sample-rib-gallery', 'st-blast': 'sample-well-stair',
  'st-side': 'pt-pl-w6-square-gallery', 'st-lower': 'sample-rib-gallery',
};
/** The places painted from their briefs so far (ids only; D-015): each shows its own painting, `pt-<id>`, which
    ui/paintings.ts carries (a test keeps the two in step); every other place shows its stretch's stand-in. */
export const PAINTED: ReadonlySet<string> = new Set<string>(['b-1.A', 'b-1.B', 'b-1.C', 'b-2.A', 'pl-w2-smooth-place', 'pl-w1-pick-niche', 'b-5.A', 'pl-w5-ledge-lip', 'pl-w5-second-landing', 'b-7.A', 'b-7.B', 'pl-w6-square-gallery', 'b-6.B', 'pl-w6-folder', 'cv-02', 'cv-10', 'cv-11', 'cv-12', 'cv-13', 'cv-14', 'pl-w5-worn-steps', 'b-5.B', 'b-7.C', 'cv-15', 'cv-03', 'cv-04', 'cv-05', 'cv-07', 'cv-08', 'cv-09', 'pl-w2-above-the-ring', 'pl-w2-box-by-the-cot', 'b-3.A', 'b-3.B', 'b-3.C', 'b-4.A', 'b-4.B', 'b-2.B', 'pl-w1-below-the-lamp', 'pl-w3-far-end', 'cv-06', 'b-4.C', 'pl-w3-salt-lit', 'pl-w4-recess-above-the-cot', 'pl-w6-wall-shelf', 'cv-01', 'pl-w4-hollow', 'b-6.A', 'b-8.A', 'pl-w8-channel', 'b-8.B', 'pl-w8-steep-foot', 'b-8.C', 'b-9.A', 'pl-w9-benches', 'b-9.B', 'b-9.C', 'pl-w9-approach', 'pl-w10-deep-end', 'b-10.A', 'pl-w10-blast-floor', 'b-10.B', 'b-10.C', 'pl-w11-cupboard', 'b-11.A', 'b-11.B', 'pl-w11-far-end', 'b-11.C', 'b-12.A', 'pl-w12-shelf', 'b-12.B', 'pl-w12-square-way', 'b-12.C', 'pl-w13-side-gallery', 'b-13.A', 'b-13.B', 'b-13.C', 'pl-w13-lower-gallery', 'b-14.A', 'pl-w14-mule-stone', 'b-14.B', 'pl-w14-meeting', 'pl-w14-deep-niche', 'cv-16', 'cv-17', 'cv-18', 'cv-19', 'cv-20', 'cv-21']);
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
  /* a job deleted after it was done leaves the list; the minutes it counted for stay (Dan, D-125) */
  const hidden = hiddenDone(facts), kept = (id: string) => c.jobs.some(j => j.id === id) && !hidden.has(`${id}|${day}`);
  for (const id of order) if (done.has(id) && !slate.includes(id) && kept(id)) slate.push(id);   /* off-plan counts in full */
  for (const id of done) if (!slate.includes(id) && kept(id)) slate.push(id);   /* so does something chosen from outside the list (D-077) */
  /* a done record deleted leaves even a planned place on the list (D-125) */
  for (let i = slate.length - 1; i >= 0; i--) if (done.has(slate[i]) && hidden.has(`${slate[i]}|${day}`)) slate.splice(i, 1);
  const complete = completedOn(facts, day);
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
      away: s.phase === 'held' && held?.why === 'away' };
  }

  let runEnd: RunEnd | null = null, runFinds: string[] = [];
  const ends = ofType(facts, 'delveEnded');
  const last = ends[ends.length - 1];
  if (last && !seen.has(last.seq) && !run) {
    const j = jobOf(c, last.job), start = facts.find(f => f.seq === last.run) as FactOf<'delveStarted'> | undefined;
    /* answered on a later game day (a delve begun before 04:00, answered after): still this run's answer */
    const doneFact = ofType(facts, 'jobDone').find(f => f.job === j.id && f.seq > last.run);
    const completedDay = facts.some(f => f.type === 'dayCompleted' && f.seq > last.run);
    runEnd = { seq: last.seq, job: j, minutes: last.minutes, how: last.how, ask: j.doneBy === 'dan' && !doneOn(facts, last.day).has(j.id) && !doneFact,
      enough: j.doneBy === 'enough' && !!doneFact, completedDay, count: start?.count ?? 1 };
    /* a side chamber is found at the delve's end, and can come just after it, once a place it reached starts a new stretch */
    runFinds = ofType(facts, 'findGiven').filter(f => f.seq > last.run && !f.job && (f.seq < last.seq || f.why === 'chamber')).map(f => f.id);
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
  /* shown only while it holds a find to give */
  const chamber = S.pickFind(c.story, st, 'chamber') ? toChamber(shown, st) : null;

  return {
    suggestedBy: sugg.by, bedtime: bedtimeOf(facts), night: gn ? { kept: gn.kept, beat: campLine?.id ?? null } : null,
    morning, welcome, close, deepOffer, deepCalled, times, content: c,
    forecast: W.forecast(c, facts, day, toNext, S.PLACE_GAP),
    day, capacity, suggested: sugg.capacity, size, order, slate, done, underWay, complete, next, run, runEnd, arrival,
    /* ahead: the sealed thing in view; before any, the way in (the first morning), then a line from just ahead */
    here, ahead: view ? view.where : here.id === null ? here.line || S.teaser(c.story, st) : S.teaser(c.story, st), walked: w, toNext, nextAt, toChamber: chamber,
    lastArrival: lastArr, story: S.storyState(facts, c.story), teaser: S.teaser(c.story, st), runFinds,
    passage: c.story.passages.find(p => p.id === S.nextPassage(c.story, st))?.line ?? '',
  };
}

/** The run set-up for a job: every job opens at one delve of 30 minutes; Dan sets the minutes and the delves himself
    (Dan, D-124). */
export const PRESET = { minutes: 30, count: 1 } as const;
export function presetRun(_j?: Job): { minutes: number; count: number } {
  return { ...PRESET };
}

export { alertsAfter, runAt };
export type { RunPlan, RunMark };
