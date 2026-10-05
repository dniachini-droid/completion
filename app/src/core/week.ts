/**
 * The week and Dan's own lists (slice 4; PLANNER.md, D-045–D-048; TOOLS.md §2). Pure: facts + content in.
 *
 * Four rules (PLANNER.md): the plan is a forecast, not a promise; planning predicts progress, action creates it (nothing
 * here earns anything); the app proposes, Dan edits; enough is fixed before more begins. The past shows only what was
 * done; a released job is re-placed only on a later day below its Normal size, otherwise it falls away (no avalanche).
 */
import { calendarWeek, weekdayOf } from './time';
import * as R from './repeat';
import { doneFacts } from './done';
import { ofType } from './facts';
import type { CalEvent, Content, Fact, FactBody, FactOf, Job, PlanEntry, Rhythm } from './types';

/** A Normal day's size in jobs, before planning by minutes (kept for the forecast's older tests). */
export const PLAN_DAY = 3;
/** A day's room in minutes when Plan my week lays it out: a day about 7 h, the lighter day about 3½ h (Dan, D-131; it
    was 3 h and 1½ h, D-114). For planning the Week only: the day's finish line is its first 3 hours (FINISH_MIN, D-131).
    An appointment is fixed and may pass it (P10); one long job alone may fill a day. */
export const PLAN_MIN = 420, PLAN_LIGHT = 210;
/** The day's finish line: the first this many minutes' worth of the day's jobs, in order (Dan, D-131). */
export const FINISH_MIN = 180;
/** Satchel lines untouched this long go quietly to "someday" (TOOLS §2). */
export const SOMEDAY_DAYS = 21;


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
  const gone = new Map<string, number>();
  for (const f of facts) {
    /* a plan change carries its own "day" (where the entry moves to, or none for "Not this week"), which stands in for
       the fact's day; it never edits the jobs, so it is passed over before any day is read. Read as a date, "none"
       threw, and every Done after a "Not this week" failed (Dan, D-125). */
    if (f.type === 'planChanged') continue;
    /* (a fact with no day, in a file the rules can't run, is passed over: deep review F1) */
    if (before && (typeof f.day !== 'string' || calendarWeek(f.day) >= before)) continue;
    if (f.type === 'rhythmSaved') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      const j = jobs.findIndex(x => x.id === f.job.id), r = rhythms.findIndex(x => x.id === f.rhythm.id);
      if (j >= 0) jobs[j] = f.job; else if (gone.has(f.job.id)) jobs.splice(Math.min(gone.get(f.job.id)!, jobs.length), 0, f.job); else jobs.push(f.job);
      if (r >= 0) rhythms[r] = f.rhythm; else rhythms.push(f.rhythm);
    } else if (f.type === 'rhythmStopped') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      const r = rhythms.find(x => x.id === f.id);
      rhythms = rhythms.filter(x => x.id !== f.id);
      /* its job doesn't stay behind as a one-off (D-110) */
      const j = r ? jobs.findIndex(x => x.id === r.job) : -1;
      if (j >= 0 && !rhythms.some(x => x.job === r!.job)) jobs[j] = { ...jobs[j], stopped: true };
    } else if (f.type === 'jobSaved') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      const j = jobs.findIndex(x => x.id === f.job.id);
      /* a job brought back by Undo returns to its place (D-125 review) */
      if (j >= 0) jobs[j] = f.job; else if (gone.has(f.job.id)) jobs.splice(Math.min(gone.get(f.job.id)!, jobs.length), 0, f.job); else jobs.push(f.job);
    } else if (f.type === 'jobRemoved') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      const at = jobs.findIndex(x => x.id === f.id);
      if (at >= 0) gone.set(f.id, at);
      jobs = jobs.filter(x => x.id !== f.id);
      rhythms = rhythms.filter(x => x.job !== f.id);
    } else if (f.type === 'itemAdded') {
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      /* a job added from anywhere (+ Add, the Week, Siri) is a delve like any other (D-117) */
      const job: Job = { id: f.id, name: f.name, delve: true, length: 25, doneBy: 'dan' };
      /* picked from a job Dan had before (D-136): it carries on with what that job held, as it stood then; never its
         day, its date, its minutes delved or its lines struck in a delve */
      const was = f.from ? jobs.find(x => x.id === f.from) : undefined;
      if (was) {
        job.length = was.enoughAt !== undefined ? Math.min(was.length, was.enoughAt) : was.length;
        for (const k of ['list', 'note', 'firstStep'] as const) if (was[k]) job[k] = was[k];
        if (was.avoided) job.avoided = true;
      }
      jobs.push(job);
    } else if (f.type === 'itemDropped' || f.type === 'itemTicked') {
      /* an old satchel line dropped, or ticked off there, is finished with: it doesn't come back as a job (D-117) */
      if (!changed) { jobs = jobs.slice(); rhythms = rhythms.slice(); changed = true; }
      jobs = jobs.filter(x => x.id !== f.id);
    }
  }
  if (!changed) return c;
  /* everything is a delve (Dan, D-117): a job saved before as "no timer", or as a line of the satchel, is read as a
     delve; a repeating one is done at its enough, a one-off when Dan says so after delving on it */
  jobs = jobs.map(j => {
    /* no "usual session" (Dan, D-124): an old one becomes the job's minutes, so a week's plan doesn't change */
    if (j.enoughAt !== undefined) { j = { ...j, length: Math.min(j.length, j.enoughAt) }; delete j.enoughAt; }
    if (j.delve && !j.item) return j;
    const k: Job = { ...j, delve: true };
    delete k.item;
    if (rhythms.some(r => r.job === j.id)) k.doneBy = 'enough';
    return k;
  });
  /* a recurring job's sessions are also those of any other job of its name (Dan, D-151: "Gym" typed before Gym
     repeated, then made to repeat, left its earlier sessions on a job of its own, and the week's marks missed them) */
  const key = new Map(jobs.map(j => [j.id, nameKey(j.name)])), ruled = new Set(rhythms.map(r => r.job));
  rhythms = rhythms.map(r => {
    const { also: _, ...x } = r, k = key.get(r.job);
    const also = k ? jobs.filter(j => j.id !== r.job && !ruled.has(j.id) && key.get(j.id) === k).map(j => j.id) : [];
    return also.length ? { ...x, also } : x;
  });
  return { ...c, jobs, rhythms, base: c.base ?? c };
}

/* ---------- the planner learns (D-131): real minutes and good hours, from the delves alone; nothing to set up ---------- */

/** A job's name as the planner and the Satchel's suggestions compare it (D-136): trimmed, lower case, single spaces;
    curly and straight apostrophes alike (the keyboard and Siri may give either). */
export const nameKey = (name: string) => name.normalize('NFC').replace(/[’‘`]/g, "'").trim().toLowerCase().replace(/\s+/g, ' ');
/** The jobs that share a job's history: every job in `c` with the same name (D-136), the job itself always. Without
    content, the job alone. */
export function sameName(c: Content | undefined, job: string): Set<string> {
  const j = c?.jobs.find(x => x.id === job);
  if (!c || !j) return new Set([job]);
  const k = nameKey(j.name);
  return new Set([job, ...c.jobs.filter(x => nameKey(x.name) === k).map(x => x.id)]);
}

/** Delves of at least this many minutes teach the planner; this many of them first; the last this many are used. */
export const LEARN_MIN = 5, LEARN_FROM = 3, LEARN_LAST = 5;
const learned = new WeakMap<Fact[], { n: number; mins: Map<string, number | null> }>();
/** How long a job really takes Dan, for planning: the median of its last 5 runs of 5 minutes or more, once there are
    3, rounded to 5 minutes. Null until then (its written minutes are used). The job's own minutes are never changed, and
    every delve still opens at 30 (D-124). A run here is one delve, its minutes as counted at its end; a job ticked off
    (D-134) is one run of all its minutes, the delves behind it included ("On top of the 27 minutes you delved": one
    sitting of 27 + the time given, not two). With content, every job of the same name shares one history (D-136): "Go
    to the bank" added again learns from every trip to the bank. */
export function realMinutes(facts: Fact[], job: string, before?: string, c?: Content): number | null {
  let m = learned.get(facts);
  if (!m || m.n !== facts.length) { m = { n: facts.length, mins: new Map() }; learned.set(facts, m); }
  const j = c?.jobs.find(x => x.id === job);
  const key = `${j ? `n:${nameKey(j.name)}` : `j:${job}`}|${before ?? ''}`;
  if (m.mins.has(key)) return m.mins.get(key)!;
  const ids = sameName(c, job), recurring = new Set(c?.rhythms.map(r => r.job) ?? []);
  /* the done records still standing, for where a tick's sitting began (after the last of them, as the carry, D-133) */
  const standing = doneFacts(facts);
  let runs: { job: string; day: string; seq: number; minutes: number }[] = [];
  for (const f of facts) {
    if (f.type === 'delveEnded' && ids.has(f.job)) runs.push({ job: f.job, day: f.day, seq: f.seq, minutes: f.minutes });
    else if (f.type === 'jobDone' && f.ticked && ids.has(f.job)) {
      const from = standing.filter(d => d.job === f.job && d.seq < f.seq).pop()?.seq ?? -1;
      runs = runs.filter(r => !(r.job === f.job && r.seq > from && (!recurring.has(f.job) || r.day === f.day)));
      runs.push({ job: f.job, day: f.day, seq: f.seq, minutes: f.minutes });
    }
  }
  const mins = runs.filter(r => r.minutes >= LEARN_MIN && (!before || r.day < before)).slice(-LEARN_LAST).map(r => r.minutes).sort((a, b) => a - b);
  let out: number | null = null;
  if (mins.length >= LEARN_FROM) {
    const k = mins.length >> 1, med = mins.length % 2 ? mins[k] : (mins[k - 1] + mins[k]) / 2;
    out = Math.max(5, Math.round(med / 5) * 5);
  }
  m.mins.set(key, out);
  return out;
}
/** A job's room in a day, for planning and the forecast: how long it really takes, once learned, else its minutes
    (D-124, D-131); learned from every job of its name, given the content (D-136). */
export const roomOf = (j: Job, facts?: Fact[], before?: string, c?: Content) => (facts && realMinutes(facts, j.id, before, c)) || j.length;
const jobRoom = (c: Content, id: string, facts?: Fact[]) => { const j = c.jobs.find(x => x.id === id); return j ? roomOf(j, facts, undefined, c) : 25; };
/** About how long a day of the week holds (not yet done), in minutes: a shape, not a score (D-114). */
export const dayMinutes = (c: Content, d: { jobs: DayJob[] }, facts?: Fact[]) => d.jobs.filter(j => !j.done).reduce((a, j) => a + jobRoom(c, j.job, facts), 0);

/** Starts of a job that teach its good hours: this many first (D-131). */
export const HOURS_FROM = 4;
/** Whether a job is usually started around this hour: at least half of its delves began within an hour of it, once it
    has 4 starts (starts after bedtime are passed over, so late nights never become good hours). Null: not learned yet.
    With content, the starts of every job of the same name count (D-136). */
export function goodHour(facts: Fact[], job: string, clock: string, bedtime?: string, c?: Content): boolean | null {
  const mins = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  const late = (at: string) => { if (!bedtime) return false; const s = (x: number) => x < 240 ? x + 1440 : x; return s(mins(at.slice(11, 16))) > s(mins(bedtime)); };
  const ids = sameName(c, job);
  const starts = ofType(facts, 'delveStarted').filter(f => ids.has(f.job) && !late(f.at)).map(f => mins(f.at.slice(11, 16)));
  if (starts.length < HOURS_FROM) return null;
  const now = mins(clock), near = starts.filter(x => { const d = Math.abs(x - now) % 1440; return Math.min(d, 1440 - d) <= 60; }).length;
  return near * 2 >= starts.length;
}

/** The done records that finish a one-off: those since it last stopped recurring (a recurring job made a one-off in the
    editor is not finished by its old sessions, D-126; second review of D-131). */
const finishing = new WeakMap<Fact[], { n: number; c: Content; out: FactOf<'jobDone'>[] }>();
export function oneOffDone(c: Content, facts: Fact[]): FactOf<'jobDone'>[] {
  const m = finishing.get(facts);
  if (m && m.n === facts.length && m.c === c) return m.out;
  const rhythmOfId = new Map((c.base ?? c).rhythms.map(r => [r.id, r.job]));
  const stoppedAt = new Map<string, number>();
  for (const f of facts) {
    if (f.type === 'rhythmSaved') rhythmOfId.set(f.rhythm.id, f.rhythm.job);
    else if (f.type === 'rhythmStopped') { const job = rhythmOfId.get(f.id); if (job) stoppedAt.set(job, f.seq); }
  }
  const out = doneFacts(facts).filter(f => f.seq > (stoppedAt.get(f.job) ?? -1));
  finishing.set(facts, { n: facts.length, c, out });
  return out;
}

/* ---------- the satchel ---------- */

export interface Item { id: string; name: string; added: string; done: boolean; someday: boolean; by?: string; touched?: string; }

/** Dan's lines, oldest first. Ticked ones stay ticked that day and leave the list the day after (D-110); dropped ones
    go; untouched for three weeks, someday (TOOLS §2). */
export function items(facts: Fact[], day: string): Item[] {
  const out = new Map<string, Item>(), touched = new Map<string, string>(), ticked = new Map<string, string>(), gone = new Map<string, Item>(), shelved = new Set<string>();
  const live = new Set<Fact>(doneFacts(facts));
  for (const f of facts) {
    if (f.type === 'itemAdded') { out.set(f.id, { id: f.id, name: f.name, added: f.day, done: false, someday: false }); touched.set(f.id, f.day); }
    /* a done record taken back ("Not done after all", D-131) doesn't tick it */
    else if (f.type === 'itemTicked' || (f.type === 'jobDone' && out.has(f.job) && live.has(f))) {
      const id = f.type === 'itemTicked' ? f.id : f.job, it = out.get(id);
      if (it && !it.done) { it.done = true; ticked.set(id, f.day); }
    }
    else if (f.type === 'itemDropped') out.delete(f.id);
    /* the job editor (D-112): a line renamed, removed, or put back by Undo */
    else if (f.type === 'jobSaved' && f.job.item) {
      const it = out.get(f.job.id) ?? gone.get(f.job.id);
      if (it) { it.name = f.job.name; if (f.job.by) it.by = f.job.by; else delete it.by; out.set(it.id, it); gone.delete(it.id); touched.set(it.id, f.day); }
    }
    else if (f.type === 'jobRemoved' && out.has(f.id)) { gone.set(f.id, out.get(f.id)!); out.delete(f.id); }
    else if (f.type === 'planAdded' && out.has(f.entry.job)) { touched.set(f.entry.job, f.day); shelved.delete(f.entry.job); }
    /* the look-ahead (D-116): kept, its three weeks start again; put to someday by hand, it goes there now */
    else if (f.type === 'itemKept' && out.has(f.id)) { touched.set(f.id, f.day); shelved.delete(f.id); }
    /* delved on, it's in hand: the look-ahead doesn't ask about it (D-117 review) */
    else if (f.type === 'delveStarted' && out.has(f.job)) { touched.set(f.job, f.day); shelved.delete(f.job); }
    /* set waiting on a reply, or taken back from it: Dan's own choice about it, so "Still wanted?" doesn't ask (review of D-137) */
    else if ((f.type === 'waitSet' || f.type === 'waitEnded') && out.has(f.job)) { touched.set(f.job, f.day); shelved.delete(f.job); }
    else if (f.type === 'itemSomeday' && out.has(f.id)) shelved.add(f.id);
  }
  for (const [id, d] of ticked) if (d < day) out.delete(id);
  /* a line put back by Undo returns to its place (D-112) */
  const order = [...new Set(ofType(facts, 'itemAdded').map(f => f.id))];
  const sorted = [...out.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  out.clear(); for (const it of sorted) out.set(it.id, it);
  /* a dated line never goes to someday (D-114) */
  for (const it of out.values()) { it.touched = touched.get(it.id); it.someday = !it.done && !it.by && (shelved.has(it.id) || daysBetween(touched.get(it.id)!, day) >= SOMEDAY_DAYS); }
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

const doneIn = (facts: Fact[], week: string) => doneFacts(facts).filter(f => calendarWeek(f.day) === week);
/** Sessions of a rhythm done in its period containing `week` (core/repeat.ts; a period of days counts back from the
    week's end, D-114). */
const sessions = (facts: Fact[], r: Rhythm, week: string) => R.sessionsIn(facts, r, R.daysOf(r) ? addDays(week, 6) : week);
const need = R.needOf;

/**
 * "Plan my week" (PLANNER.md): fixed rules, no learning. Appointments and set days first; avoided one-offs early; the
 * same rhythm spread across days (never two days running where it can be avoided); no day above a Normal day's size;
 * one lighter day. Only days from `from` on; sessions already done this week are not planned again.
 */
export function planWeek(c: Content, facts: Fact[], week: string, from: string, fixed: PlanEntry[] = []): PlanEntry[] {
  /* each laying-out of a week has its own entry ids, so a reminder on an entry never moves to another job */
  const round = facts.filter(f => f.type === 'planMade' && f.week === week).length;
  const days = weekDays(week).filter(d => d >= from);
  if (!days.length) return [];
  const out: PlanEntry[] = [];
  let n = 0;
  /* entries Dan placed himself stay where they are and take their room (Lay out the rest, D-114) */
  for (const e of fixed) if (e.day >= from) out.push({ ...e });
  const put = (job: string, day: string, time?: string) => out.push({ id: `p${week.replace(/-/g, '')}${round ? `.${round}` : ''}-${++n}`, job, day, ...(time ? { time } : {}) });
  const size = (job: string) => { const j = c.jobs.find(x => x.id === job); return j ? roomOf(j, facts, undefined, c) : 25; };
  const load = (d: string) => out.filter(e => e.day === d).reduce((a, e) => a + size(e.job), 0);
  /* the lighter day: Saturday if it is still ahead, else the week's last day */
  const light = days.length > 2 ? (days.find(d => weekdayOf(d) === 6) ?? days[days.length - 1]) : null;
  const cap = (d: string) => d === light ? PLAN_LIGHT : PLAN_MIN;
  /* a job fits a day with room for it, or an empty day (by minutes, not by count, D-114) */
  /* a busy day in the calendar gets less work (D-115): half its busy time comes off the day's room, but at least an hour
     stays, so a working day in the calendar never empties the plan */
  const busy = new Map(days.map(d => [d, busyMinutes(facts, d)]));
  const capLeft = (d: string) => cap(d) - Math.min(busy.get(d)! / 2, Math.max(0, cap(d) - 60));
  const fits = (d: string, job: string) => load(d) === 0 || load(d) + size(job) <= capLeft(d);
  const done = doneIn(facts, week);
  const doneOnDay = (job: string, d: string) => done.some(f => f.job === job && f.day === d);
  const ever = new Set(oneOffDone(c, facts).map(f => f.job));
  const rhythmJob = new Set(c.rhythms.map(r => r.job));
  /* a one-off Dan placed himself this week stays where he put it: the planner never places it again (D-117 review) */
  const hand = new Set(ofType(facts, 'planAdded').filter(f => calendarWeek(f.entry.day) === week && !rhythmJob.has(f.entry.job)).map(f => f.entry.job));
  /* a one-off waiting on a reply is never laid out: it comes back on its own day (D-137) */
  for (const id of waitingOf(facts).keys()) hand.add(id);

  /* the one thing that matters most this week (the look-ahead, D-116): first, early in the week */
  const pin = pinnedIn(facts, week);
  if (pin && !hand.has(pin) && c.jobs.some(j => j.id === pin && !j.stopped) && !(ever.has(pin) && !c.rhythms.some(r => r.job === pin)) && !done.some(f => f.job === pin)) {
    const d = days.find(x => fits(x, pin));
    if (d) put(pin, d);
  }
  /* dated work first (D-114): on the last day with room at least 2 days before its date; already that close, the first
     day with room. A date further off waits for its own week. */
  for (const j of c.jobs.filter(x => x.by && !x.stopped && !ever.has(x.id) && !hand.has(x.id))) {
    const target = addDays(j.by!, -2);
    if (target > days[days.length - 1]) continue;
    const room = (x: string) => fits(x, j.id);
    const d = [...days].reverse().find(x => x <= target && room(x)) ?? days.find(room);
    if (d) put(j.id, d);
  }
  /* appointments and set days first (they may pass a day's size: an appointment is fixed, P10) */
  const placed = (job: string, d: string) => out.some(e => e.job === job && e.day === d);
  for (const r of c.rhythms) for (const d of days) if (R.fallsOn(r, d) && !doneOnDay(r.job, d) && !placed(r.job, d)) put(r.job, d, r.time);
  /* every N days since last done: on the day it falls due, then every N days after (D-114); every 2 weeks too, 14 days
     after the last time (deep review Part 2 #4) */
  for (const r of c.rhythms.filter(x => R.daysOf(x) && !R.fortnightFresh(facts, x))) {
    for (let d = R.dueFrom(facts, r, days[0]); d <= days[days.length - 1]; d = addDays(d, R.daysOf(r)!)) {
      const on = days.find(x => x >= d && fits(x, r.job) && !doneOnDay(r.job, x)) ?? null;
      if (!on) break;
      put(r.job, on, r.time);
      d = on;
    }
  }
  /* avoided one-offs early in the week, one to a day where the week allows */
  for (const j of c.jobs.filter(x => x.avoided && !x.stopped && !x.by && !rhythmJob.has(x.id) && !ever.has(x.id) && !hand.has(x.id))) {
    const d = days.find(x => fits(x, j.id) && !out.some(e => e.day === x && c.jobs.find(k => k.id === e.job)?.avoided)) ?? days.find(x => fits(x, j.id));
    if (d) put(j.id, d);
  }
  /* every 2 weeks, never done yet: once in the fortnight, on the lightest day */
  for (const r of c.rhythms.filter(x => R.fortnightFresh(facts, x))) {
    if (sessions(facts, r, week) >= 1) continue;
    const d = [...days].filter(x => fits(x, r.job)).sort((a, b) => load(a) - load(b))[0];
    if (d) put(r.job, d, r.time);
  }
  /* N a week, the most frequent first, spread evenly */
  const weekly = c.rhythms.filter(x => !x.days && R.weekly(x)).sort((a, b) => (b.times ?? 1) - (a.times ?? 1));
  for (const r of weekly) {
    const left = Math.max(0, need(r) - sessions(facts, r, week));
    for (let k = 0; k < left; k++) {
      const ideal = (k + .5) * days.length / left - .5;
      let best: string | null = null, score = Infinity;
      for (const [i, d] of days.entries()) {
        if (!fits(d, r.job) || out.some(e => e.day === d && e.job === r.job) || doneOnDay(r.job, d)) continue;
        const next = (x: string) => out.some(e => e.job === r.job && e.day === x) || doneOnDay(r.job, x);
        const s = (next(addDays(d, -1)) || next(addDays(d, 1)) ? 10 : 0) + load(d) / 60 * 1.5 + Math.abs(i - ideal);
        if (s < score) { score = s; best = d; }
      }
      if (best) put(r.job, best, r.time);
    }
  }
  /* a job with no day of its own (added in the satchel, by Siri, or taken off a week) waits in the satchel until Dan
     puts it on a day or delves on it: the planner never places it (D-126) */
  return out.filter(e => !fixed.some(x => x.id === e.id)).sort((a, b) => a.day.localeCompare(b.day) || (a.time ?? '99').localeCompare(b.time ?? '99'));
}

/** One job on a day of the week as it stands: planned (an entry), or done (off-plan counts in full). */
export interface DayJob { entry: string | null; job: string; time?: string; done: boolean; }
export interface WeekView { week: string; planned: boolean; days: { day: string; jobs: DayJob[] }[]; }

/**
 * The week as it stands on `today` (PLANNER → How the week drives Today). The past shows only what was done. A planned
 * job that didn't happen is re-placed on the next day still below a Normal day's size, or falls away. Once a rhythm's
 * enough for the week is met, its remaining planned sessions quietly leave; a one-off done leaves the plan.
 */
/* the week as it stands is asked for many times while one screen is drawn: kept for the same log, content and day */
const weeks = new WeakMap<Fact[], { n: number; c: Content; views: Map<string, WeekView> }>();
export function weekOf(c: Content, facts: Fact[], week: string, today: string): WeekView {
  let m = weeks.get(facts);
  if (!m || m.n !== facts.length || m.c !== c) { m = { n: facts.length, c, views: new Map() }; weeks.set(facts, m); }
  const key = `${week}|${today}`;
  if (!m.views.has(key)) m.views.set(key, weekAt(c, facts, week, today));
  return m.views.get(key)!;
}
function weekAt(c: Content, facts: Fact[], week: string, today: string): WeekView {
  const plan = planOf(facts, week);
  const days = weekDays(week).map(day => ({ day, jobs: [] as DayJob[] }));
  const at = (d: string) => days.find(x => x.day === d);
  const done = doneIn(facts, week);
  /* what was done, on the day it was done */
  /* a job deleted after it was done no longer shows; the minutes it counted for stay (Dan, D-125) */
  const hidden = new Set<string>();
  for (const f of ofType(facts, 'doneHidden')) { const k = `${f.job}|${f.on}`; if (f.back) hidden.delete(k); else hidden.add(k); }
  for (const f of done) if (f.day <= today && c.jobs.some(j => j.id === f.job) && !hidden.has(`${f.job}|${f.day}`)) at(f.day)?.jobs.push({ entry: null, job: f.job, done: true });
  if (!plan) return { week, planned: false, days };
  const rhythm = (job: string) => c.rhythms.find(r => r.job === job);
  const met = (job: string) => { const r = rhythm(job); return r ? sessions(facts, r, week) >= need(r) : oneOffDone(c, facts).some(f => f.job === job); };
  /* how many more sessions the plan may still hold of a job: a rhythm's enough left this period; a one-off, one */
  const room = new Map<string, number>();
  const left = (job: string) => {
    /* every N days: as many as the plan placed; each falls due again after the last (D-114) */
    if (!room.has(job)) { const r = rhythm(job); room.set(job, r && R.daysOf(r) ? 7 : r ? Math.max(0, need(r) - sessions(facts, r, week)) : met(job) ? 0 : 1); }
    return room.get(job)!;
  };
  const place = (e: PlanEntry, day: string) => {
    at(day)!.jobs.push({ entry: e.id, job: e.job, ...(e.time ? { time: e.time } : {}), done: false });
    room.set(e.job, left(e.job) - 1);
  };
  const released: PlanEntry[] = [];
  /* the days of an absence (between the last day opened and a welcome back): their sessions fall away; a single day not
     opened is no absence, and its sessions are placed again like any missed one (fresh review) */
  const absences = ofType(facts, 'welcomed').map(f => [f.since, f.day] as const);
  const away = (d: string) => absences.some(([from, to]) => d > from && d < to);
  /* the day of a welcome back holds what was planned for it, and nothing missed before (Dan, deep review Part 2 #1) */
  const welcomeDay = ofType(facts, 'welcomed').some(f => f.day === today);
  for (const e of plan) {
    if (!c.jobs.some(j => j.id === e.job && !j.stopped)) continue;
    if (e.day <= today && hidden.has(`${e.job}|${e.day}`)) continue;   /* done there, and its record deleted (D-125) */
    const dj = at(e.day)?.jobs.find(x => x.done && x.job === e.job && x.entry === null);
    if (e.day <= today && dj) { dj.entry = e.id; if (e.time) dj.time = e.time; continue; }   /* done as planned */
    /* a missed appointment falls away (D-080); a one-off whose day passed goes back to the Satchel's "No day yet" (D-131):
       only a recurring job's missed session is placed again */
    /* (a session missed while Dan was away falls away too: nothing piles up for his return, W F4) */
    if (e.day < today) { if (!e.time && rhythm(e.job) && !away(e.day)) released.push(e); continue; }
    if (left(e.job) > 0 && !at(e.day)!.jobs.some(x => x.job === e.job && !x.done)) place(e, e.day);   /* past enough, it quietly leaves */
  }
  /* released: the first day from today still below a Normal day's size and without this job; otherwise it falls away */
  const mins = (d: string) => at(d)!.jobs.filter(x => !x.done || x.entry).reduce((a, x) => a + jobRoom(c, x.job, facts), 0);
  for (const e of released) {
    /* a missed session placed again on today and done there is done as planned: it keeps its place on the day (the
       flow review, L A1: it fell off the finish line when done, and the line refilled) */
    /* only when the plan would have put it on today: one placed on a later day (today was full) never takes today's line
       room because the job was done off-plan today (review of D-144) */
    const dj = today >= weekDays(week)[0] && today <= weekDays(week)[6] ? at(today)?.jobs.find(x => x.done && x.job === e.job && x.entry === null) : undefined;
    const to = weekDays(week).find(d => d >= today && !(welcomeDay && d === today) && mins(d) + jobRoom(c, e.job, facts) <= PLAN_MIN && !at(d)!.jobs.some(x => x.job === e.job && x !== dj));
    if (dj && to === today) { dj.entry = e.id; continue; }
    if (left(e.job) <= 0) continue;
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
      for (const j of d.jobs) if (!j.done) { const job = c.jobs.find(x => x.id === j.job); if (job) sum += roomOf(job, facts, undefined, c); }
      while (sum >= need && out.length < 4) { out.push(d.day); need += gap; }
    }
  }
  return out;
}

/* ---------- what slipped (D-114) ---------- */

export type Slip = { job: string; kind: 'date' | 'appt'; day: string; time?: string };
/** What went by while Dan was away, for the welcome back: a date that passed (the soonest), and every appointment he
    added himself that went by, each asked about once, in one list (Dan, deep review Part 2 #5; the date stays one, P7).
    Rhythms' appointments come round again, so they are not named. Never a count. */
export function slipped(c: Content, facts: Fact[], since: string, today: string): Slip[] {
  const out: Slip[] = [];
  const ever = new Set(doneFacts(facts).map(f => f.job));
  const passed = c.jobs.filter(j => j.by && j.by < today && !j.stopped && !ever.has(j.id)).sort((a, b) => a.by!.localeCompare(b.by!));
  if (passed.length) out.push({ job: passed[0].id, kind: 'date', day: passed[0].by! });
  const rhythmJobs = new Set(c.rhythms.map(r => r.job)), own = new Set(ofType(facts, 'planAdded').map(f => f.entry.id));
  /* every week of the absence, not only its first and last (fresh review) */
  const weeks: string[] = [];
  for (let w = calendarWeek(since); w <= calendarWeek(today); w = addDays(w, 7)) weeks.push(w);
  for (const week of weeks) {
    const missed = (planOf(facts, week) ?? []).filter(e => own.has(e.id) && e.time && e.day >= since && e.day < today && !rhythmJobs.has(e.job)
      && c.jobs.some(j => j.id === e.job && !j.stopped) && !doneFacts(facts).some(f => f.job === e.job && f.day === e.day));
    for (const e of missed) if (!out.some(x => x.job === e.job)) out.push({ job: e.job, kind: 'appt', day: e.day, time: e.time });
  }
  return out;
}

/* ---------- the phone's calendar, read-only (D-115) ---------- */

/** Whether the calendar is shown, and which calendars (null: all). */
export function calendarOf(facts: Fact[]): { on: boolean; calendars: string[] | null } {
  const c = ofType(facts, 'calendarChosen');
  return c.length ? { on: c[c.length - 1].on, calendars: c[c.length - 1].calendars } : { on: false, calendars: null };
}
/** The events on a day, as last read: timed ones by start time, then all-day ones; none while the calendar is off. */
export function eventsOn(facts: Fact[], day: string): CalEvent[] {
  const ch = calendarOf(facts);
  if (!ch.on) return [];
  const reads = ofType(facts, 'calendarRead');
  const last = reads[reads.length - 1];
  if (!last) return [];
  return last.events.filter(e => (!ch.calendars || ch.calendars.includes(e.cal))
    && (e.allDay ? e.start.slice(0, 10) <= day && day <= e.end.slice(0, 10) : e.start.slice(0, 10) <= day && day <= e.end.slice(0, 10)))
    .sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
}
/** Minutes a day's timed events take between 07:00 and 22:00 (overlaps counted once): the room they use when Plan my
    week lays the day out. All-day events take none. */
export function busyMinutes(facts: Fact[], day: string): number {
  const mins = (s: string) => +s.slice(11, 13) * 60 + +s.slice(14, 16);
  const spans = eventsOn(facts, day).filter(e => !e.allDay).map(e => [
    e.start.slice(0, 10) < day ? 0 : mins(e.start), e.end.slice(0, 10) > day ? 24 * 60 : mins(e.end)] as [number, number])
    .map(([a, b]) => [Math.max(a, 7 * 60), Math.min(b, 22 * 60)] as [number, number]).filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  let total = 0, end = -1;
  for (const [a, b] of spans) { if (b <= end) continue; total += b - Math.max(a, end); end = b; }
  return total;
}

/* ---------- the week's look-ahead (D-116) ---------- */

/** The one thing Dan said matters most this week, if he said one. */
export function pinnedIn(facts: Fact[], week: string): string | null {
  const p = ofType(facts, 'weekPinned').filter(f => f.week === week);
  return p.length ? p[p.length - 1].job : null;
}
/** "Still wanted?": up to three of the oldest jobs Dan added, not done and untouched for a week or more (kept or put on
    a day counts as touched), never the whole list, never a count (P7). Dated jobs have their own question. */
export function sweepOf(facts: Fact[], day: string, most = 3): Item[] {
  /* never one waiting on a reply: Dan has parked it himself (review of D-137) */
  const waiting = waitingOf(facts);
  return items(facts, day).filter(i => !i.done && !i.by && !waiting.has(i.id) && daysBetween(i.touched ?? i.added, day) >= 7).slice(0, most);
}
/** "Coming up": the week's fixed points from `day`, one line each: appointments and entries with a time, dated work,
    and monthly or yearly rhythms on their day. The caller shows five and folds the rest. */
export function comingUp(c: Content, facts: Fact[], day: string): { day: string; job: string; time?: string; kind: 'time' | 'date' | 'repeat' }[] {
  const out: { day: string; job: string; time?: string; kind: 'time' | 'date' | 'repeat' }[] = [];
  const ever = new Set(doneFacts(facts).map(f => f.job));
  for (let i = 0; i < 7; i++) {
    const d = addDays(day, i), wk = weekOf(c, facts, calendarWeek(d), day).days.find(x => x.day === d)!;
    for (const j of wk.jobs) if (j.time && !j.done) out.push({ day: d, job: j.job, time: j.time, kind: 'time' });
    for (const j of c.jobs) if (j.by === d && !ever.has(j.id)) out.push({ day: d, job: j.id, kind: 'date' });
    for (const r of c.rhythms) if ((r.monthly || r.yearly) && R.fallsOn(r, d) && !wk.jobs.some(x => x.job === r.job && x.time)) out.push({ day: d, job: r.job, kind: 'repeat' });
  }
  return out;
}

/* ---------- the satchel (D-126) ---------- */

/**
 * The jobs with no day (D-126): one-offs not finished, with no place in any plan from `day` on, newest first. A job
 * added in the satchel or by Siri, a job taken off a week ("Not this week"), a job whose day has passed. A repeating
 * job is never here: it comes round by itself. A job done today stays on Today, not here.
 */
/** A one-off waiting on someone's reply (Dan, D-137): the day it comes back (`until`, a game day) and who or what it waits
    on. "Back to it" ends the wait, and so does anything that puts the job to work again: a delve begun on it, the job
    done, placed on a day by hand, or made a recurring job. A job deleted keeps its wait, so Undo brings it back as it
    was. Waiting earns nothing and costs nothing: it only moves the job out of the lists until its day. */
export interface Wait { until: string; who?: string; }
const waits = new WeakMap<Fact[], { n: number; out: Map<string, Wait> }>();
export function waitingOf(facts: Fact[]): Map<string, Wait> {
  const m = waits.get(facts);
  if (m && m.n === facts.length) return m.out;
  const out = new Map<string, Wait>();
  for (const f of facts) {
    if (f.type === 'waitSet') out.set(f.job, { until: f.until, ...(f.who ? { who: f.who } : {}) });
    else if (!out.size) continue;
    else if (f.type === 'waitEnded' || f.type === 'delveStarted' || f.type === 'jobDone') out.delete(f.job);
    else if (f.type === 'planAdded') out.delete(f.entry.job);
    else if (f.type === 'rhythmSaved') out.delete(f.rhythm.job);
  }
  waits.set(facts, { n: facts.length, out });
  return out;
}

export function satchelOf(c: Content, facts: Fact[], day: string): Job[] {
  const rhythmJob = new Set(c.rhythms.map(r => r.job));
  /* finished: done since it last stopped repeating (a repeating job made a one-off is not finished by its old sessions,
     review, D-126) */
  const rhythmOfId = new Map((c.base ?? c).rhythms.map(r => [r.id, r.job]));
  const stoppedAt = new Map<string, number>(), finished = new Set<string>(), live = new Set<Fact>(doneFacts(facts));
  for (const f of facts) {
    if (f.type === 'rhythmSaved') rhythmOfId.set(f.rhythm.id, f.rhythm.job);
    else if (f.type === 'rhythmStopped') { const job = rhythmOfId.get(f.id); if (job) { stoppedAt.set(job, f.seq); finished.delete(job); } }
    else if (f.type === 'jobDone' && live.has(f)) finished.add(f.job);
  }
  /* set aside today ("Not today"): today's place doesn't hold it, so it waits here (review, D-126) */
  const aside = new Set<string>();
  for (const f of facts) if (f.day === day) { if (f.type === 'setAside') aside.add(f.job); else if (f.type === 'putBack') aside.delete(f.job); }
  const weeks = new Set<string>();
  for (const f of facts) {
    if (f.type === 'planMade' && f.week >= calendarWeek(day)) weeks.add(f.week);
    else if (f.type === 'planAdded' && f.entry.day >= day) weeks.add(calendarWeek(f.entry.day));
  }
  const placed = new Set<string>();
  for (const wk of weeks) for (const e of planOf(facts, wk) ?? []) if (e.day > day || (e.day === day && !aside.has(e.job))) placed.add(e.job);
  /* waiting on a reply: in the Satchel's own Waiting, then back on Today on its day (D-137) */
  const waiting = waitingOf(facts);
  return c.jobs.filter(j => !j.stopped && !rhythmJob.has(j.id) && !finished.has(j.id) && !placed.has(j.id) && !waiting.has(j.id)).reverse();
}

