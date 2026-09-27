/**
 * The week and Dan's own lists (slice 4; PLANNER.md, D-045–D-048; TOOLS.md §2). Pure: facts + content in.
 *
 * Four rules (PLANNER.md): the plan is a forecast, not a promise; planning predicts progress, action creates it (nothing
 * here earns anything); the app proposes, Dan edits; enough is fixed before more begins. The past shows only what was
 * done; a released job is re-placed only on a later day below its Normal size, otherwise it falls away (no avalanche).
 */
import { calendarWeek, weekdayOf } from './time';
import type { Content, Fact, FactBody, FactOf, Job, PlanEntry, Rhythm } from './types';

/** A Normal day's size: the plan never puts more on a day (PLANNER → Plan my week). */
export const PLAN_DAY = 3;
/** Satchel lines untouched this long go quietly to "someday" (TOOLS §2). */
export const SOMEDAY_DAYS = 21;

const ofType = <T extends FactBody['type']>(facts: Fact[], type: T) => facts.filter((f): f is FactOf<T> => f.type === type);

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
export const weekDays = (monday: string) => Array.from({ length: 7 }, (_, i) => addDays(monday, i));

/* ---------- Dan's own data, as it stands ---------- */

/**
 * The starting set changed by Dan's edits, and his satchel lines as jobs. With `before` (a calendar week), only edits made
 * before that week count: a new rhythm, or a changed number, counts for Keys from its next full period (D-043 F7).
 */
export function live(c: Content, facts: Fact[], before?: string): Content {
  let jobs = c.jobs, rhythms = c.rhythms, changed = false;
  for (const f of facts) {
    if (before && calendarWeek(f.day) >= before) continue;
    if (f.type === 'rhythmSaved') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      const j = jobs.findIndex(x => x.id === f.job.id), r = rhythms.findIndex(x => x.id === f.rhythm.id);
      if (j >= 0) jobs[j] = f.job; else jobs.push(f.job);
      if (r >= 0) rhythms[r] = f.rhythm; else rhythms.push(f.rhythm);
    } else if (f.type === 'rhythmStopped') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      const r = rhythms.find(x => x.id === f.id);
      rhythms = rhythms.filter(x => x.id !== f.id);
      /* its job doesn't stay behind as a one-off (D-110) */
      const j = r ? jobs.findIndex(x => x.id === r.job) : -1;
      if (j >= 0 && !rhythms.some(x => x.job === r!.job)) jobs[j] = { ...jobs[j], stopped: true };
    } else if (f.type === 'itemAdded') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      jobs.push({ id: f.id, name: f.name, delve: false, length: 25, doneBy: 'dan', item: true });
    }
  }
  return changed ? { ...c, jobs, rhythms, base: c.base ?? c } : c;
}

/** A job's room in a day, for planning and the forecast: a delve job's enough, any other job's usual length. */
export const roomOf = (j: Job) => j.delve ? j.enoughAt ?? j.length : j.length;

/* ---------- the satchel ---------- */

export interface Item { id: string; name: string; added: string; done: boolean; someday: boolean; }

/** Dan's lines, oldest first. Ticked ones stay ticked that day and leave the list the day after (D-110); dropped ones
    go; untouched for three weeks, someday (TOOLS §2). */
export function items(facts: Fact[], day: string): Item[] {
  const out = new Map<string, Item>(), touched = new Map<string, string>(), ticked = new Map<string, string>();
  for (const f of facts) {
    if (f.type === 'itemAdded') { out.set(f.id, { id: f.id, name: f.name, added: f.day, done: false, someday: false }); touched.set(f.id, f.day); }
    else if (f.type === 'itemTicked' || (f.type === 'jobDone' && out.has(f.job))) {
      const id = f.type === 'itemTicked' ? f.id : f.job, it = out.get(id);
      if (it && !it.done) { it.done = true; ticked.set(id, f.day); }
    }
    else if (f.type === 'itemDropped') out.delete(f.id);
    else if (f.type === 'planAdded' && out.has(f.entry.job)) touched.set(f.entry.job, f.day);
  }
  for (const [id, d] of ticked) if (d < day) out.delete(id);
  for (const it of out.values()) it.someday = !it.done && daysBetween(touched.get(it.id)!, day) >= SOMEDAY_DAYS;
  return [...out.values()];
}

/* ---------- the plan ---------- */

/** The plan for a week (Monday): what "Plan my week" laid out (made again, it replaces that part), what Dan added
    himself, and his changes; null if there is nothing planned at all. */
export function planOf(facts: Fact[], week: string): PlanEntry[] | null {
  let made: PlanEntry[] = [], any = false;
  const added: PlanEntry[] = [];
  for (const f of facts) {
    if (f.type === 'planMade' && f.week === week) { made = f.entries.map(e => ({ ...e })); any = true; }
    else if (f.type === 'planAdded' && calendarWeek(f.entry.day) === week) { added.push({ ...f.entry }); any = true; }
    else if (f.type === 'planChanged') {
      const e = made.find(x => x.id === f.entry) ?? added.find(x => x.id === f.entry);
      if (!e) continue;
      if (f.day === null) { made = made.filter(x => x !== e); if (added.includes(e)) added.splice(added.indexOf(e), 1); continue; }
      e.day = f.day;
      if (f.time === null) delete e.time; else if (f.time) e.time = f.time;
    }
  }
  return any ? made.concat(added).sort((a, b) => a.day.localeCompare(b.day)) : null;
}
/** Whether "Plan my week" has laid this week out (the week offers it until then). */
export const planMade = (facts: Fact[], week: string) => facts.some(f => f.type === 'planMade' && f.week === week);

const doneIn = (facts: Fact[], week: string) => ofType(facts, 'jobDone').filter(f => calendarWeek(f.day) === week);
const sameFortnight = (a: string, b: string) => Math.floor(Date.parse(a) / (14 * 864e5)) === Math.floor(Date.parse(b) / (14 * 864e5));
/** Sessions of a rhythm done in its period containing `week` (every 2 weeks: the fortnight). */
function sessions(facts: Fact[], r: Rhythm, week: string): number {
  return ofType(facts, 'jobDone').filter(f => f.job === r.job && (r.every === 2 ? sameFortnight(calendarWeek(f.day), week) : calendarWeek(f.day) === week)).length;
}
const need = (r: Rhythm) => r.days ? r.days.length : r.times ?? 1;

/**
 * "Plan my week" (PLANNER.md): fixed rules, no learning. Appointments and set days first; avoided one-offs early; the
 * same rhythm spread across days (never two days running where it can be avoided); no day above a Normal day's size;
 * one lighter day. Only days from `from` on; sessions already done this week are not planned again.
 */
export function planWeek(c: Content, facts: Fact[], week: string, from: string): PlanEntry[] {
  const days = weekDays(week).filter(d => d >= from);
  if (!days.length) return [];
  const out: PlanEntry[] = [];
  let n = 0;
  const put = (job: string, day: string, time?: string) => out.push({ id: `p${week.replace(/-/g, '')}-${++n}`, job, day, ...(time ? { time } : {}) });
  const load = (d: string) => out.filter(e => e.day === d).length;
  /* the lighter day: Saturday if it is still ahead, else the week's last day */
  const light = days.length > 2 ? (days.find(d => weekdayOf(d) === 6) ?? days[days.length - 1]) : null;
  const cap = (d: string) => d === light ? 1 : PLAN_DAY;
  const done = doneIn(facts, week);
  const doneOnDay = (job: string, d: string) => done.some(f => f.job === job && f.day === d);
  const ever = new Set(ofType(facts, 'jobDone').map(f => f.job));
  const rhythmJob = new Set(c.rhythms.map(r => r.job));

  /* appointments and set days first (they may pass a day's size: an appointment is fixed, P10) */
  for (const r of c.rhythms.filter(x => x.days)) for (const d of days) if (r.days!.includes(weekdayOf(d)) && !doneOnDay(r.job, d)) put(r.job, d, r.time);
  /* avoided one-offs early in the week, one to a day where the week allows */
  for (const j of c.jobs.filter(x => x.avoided && !x.item && !x.stopped && !rhythmJob.has(x.id) && !ever.has(x.id))) {
    const d = days.find(x => load(x) < cap(x) && !out.some(e => e.day === x && c.jobs.find(k => k.id === e.job)?.avoided)) ?? days.find(x => load(x) < cap(x));
    if (d) put(j.id, d);
  }
  /* every 2 weeks: once in the fortnight, on the lightest day */
  for (const r of c.rhythms.filter(x => x.every === 2)) {
    if (sessions(facts, r, week) >= 1) continue;
    const d = [...days].filter(x => load(x) < cap(x)).sort((a, b) => load(a) - load(b))[0];
    if (d) put(r.job, d, r.time);
  }
  /* N a week, the most frequent first, spread evenly */
  const weekly = c.rhythms.filter(x => !x.days && x.every !== 2).sort((a, b) => (b.times ?? 1) - (a.times ?? 1));
  for (const r of weekly) {
    const left = Math.max(0, need(r) - sessions(facts, r, week));
    for (let k = 0; k < left; k++) {
      const ideal = (k + .5) * days.length / left - .5;
      let best: string | null = null, score = Infinity;
      for (const [i, d] of days.entries()) {
        if (load(d) >= cap(d) || out.some(e => e.day === d && e.job === r.job) || doneOnDay(r.job, d)) continue;
        const next = (x: string) => out.some(e => e.job === r.job && e.day === x) || doneOnDay(r.job, x);
        const s = (next(addDays(d, -1)) || next(addDays(d, 1)) ? 10 : 0) + load(d) * 1.5 + Math.abs(i - ideal);
        if (s < score) { score = s; best = d; }
      }
      if (best) put(r.job, best, r.time);
    }
  }
  return out.sort((a, b) => a.day.localeCompare(b.day) || (a.time ?? '99').localeCompare(b.time ?? '99'));
}

/** One job on a day of the week as it stands: planned (an entry), or done (off-plan counts in full). */
export interface DayJob { entry: string | null; job: string; time?: string; done: boolean; }
export interface WeekView { week: string; planned: boolean; days: { day: string; jobs: DayJob[] }[]; }

/**
 * The week as it stands on `today` (PLANNER → How the week drives Today). The past shows only what was done. A planned
 * job that didn't happen is re-placed on the next day still below a Normal day's size, or falls away. Once a rhythm's
 * enough for the week is met, its remaining planned sessions quietly leave; a one-off done leaves the plan.
 */
export function weekOf(c: Content, facts: Fact[], week: string, today: string): WeekView {
  const plan = planOf(facts, week);
  const days = weekDays(week).map(day => ({ day, jobs: [] as DayJob[] }));
  const at = (d: string) => days.find(x => x.day === d);
  const done = doneIn(facts, week);
  /* what was done, on the day it was done */
  for (const f of done) if (f.day <= today) at(f.day)?.jobs.push({ entry: null, job: f.job, done: true });
  if (!plan) return { week, planned: false, days };
  const rhythm = (job: string) => c.rhythms.find(r => r.job === job);
  const met = (job: string) => { const r = rhythm(job); return r ? sessions(facts, r, week) >= need(r) : done.some(f => f.job === job) || ofType(facts, 'jobDone').some(f => f.job === job); };
  /* how many more sessions the plan may still hold of a job: a rhythm's enough left this period; a one-off, one */
  const room = new Map<string, number>();
  const left = (job: string) => {
    if (!room.has(job)) { const r = rhythm(job); room.set(job, r ? Math.max(0, need(r) - sessions(facts, r, week)) : met(job) ? 0 : 1); }
    return room.get(job)!;
  };
  const place = (e: PlanEntry, day: string) => {
    at(day)!.jobs.push({ entry: e.id, job: e.job, ...(e.time ? { time: e.time } : {}), done: false });
    room.set(e.job, left(e.job) - 1);
  };
  const released: PlanEntry[] = [];
  for (const e of plan) {
    if (!c.jobs.some(j => j.id === e.job && !j.stopped)) continue;
    const dj = at(e.day)?.jobs.find(x => x.done && x.job === e.job && x.entry === null);
    if (e.day <= today && dj) { dj.entry = e.id; if (e.time) dj.time = e.time; continue; }   /* done as planned */
    if (e.day < today) { if (!e.time) released.push(e); continue; }   /* a missed appointment falls away (D-080) */
    if (left(e.job) > 0 && !at(e.day)!.jobs.some(x => x.job === e.job && !x.done)) place(e, e.day);   /* past enough, it quietly leaves */
  }
  /* released: the first day from today still below a Normal day's size and without this job; otherwise it falls away */
  const size = (d: string) => at(d)!.jobs.filter(x => !x.done || x.entry).length;
  for (const e of released) {
    if (left(e.job) <= 0) continue;
    const to = weekDays(week).find(d => d >= today && size(d) < PLAN_DAY && !at(d)!.jobs.some(x => x.job === e.job));
    if (to) place(e, to);
  }
  for (const d of days) d.jobs.sort((a, b) => Number(b.done) - Number(a.done) || (a.time ?? '99').localeCompare(b.time ?? '99'));
  return { week, planned: true, days };
}

/** Today's planned jobs, not yet done: an appointment leads as its time nears (within two hours), the rest in order. */
export function plannedToday(c: Content, facts: Fact[], today: string, clock: string): { job: string; time?: string }[] {
  const wk = weekOf(c, facts, calendarWeek(today), today);
  if (!wk.planned) return [];
  const list = wk.days.find(d => d.day === today)!.jobs.filter(j => !j.done);
  const mins = (t?: string) => t ? +t.slice(0, 2) * 60 + +t.slice(3, 5) : null;
  const now = mins(clock)!;
  const rank = (j: DayJob) => { const m = mins(j.time); return m === null ? 1 : m - now <= 120 ? 0 : 2; };
  return list.map((j, i) => ({ j, i })).sort((a, b) => rank(a.j) - rank(b.j) || a.i - b.i).map(({ j }) => ({ job: j.job, ...(j.time ? { time: j.time } : {}) }));
}

/**
 * The forecast (PLANNER → the forecast): where the plan points, never a promise. The days on which the planned room,
 * from today on, would reach each next place (the first `toNext` minutes away, then one every `gap`). Only doing moves Dan.
 */
export function forecast(c: Content, facts: Fact[], today: string, toNext: number | null, gap: number): string[] {
  if (toNext === null) return [];
  const out: string[] = [];
  let need = toNext, sum = 0;
  for (const wk of [calendarWeek(today), addDays(calendarWeek(today), 7)]) {
    const w = weekOf(c, facts, wk, today);
    if (!w.planned) continue;
    for (const d of w.days) {
      if (d.day < today) continue;
      for (const j of d.jobs) if (!j.done) { const job = c.jobs.find(x => x.id === j.job); if (job) sum += roomOf(job); }
      while (sum >= need && out.length < 4) { out.push(d.day); need += gap; }
    }
  }
  return out;
}
