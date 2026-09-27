/**
 * Reminders (D-107, Stage 1): what alerts, and when. Pure: content, facts and the clock in, a list of alerts out; the
 * screens' glue schedules them on the phone. Only for things Dan gave a time, and only those he asked to be reminded of:
 * an appointment (a rhythm with a time), an entry on the week with a time, and bedtime. Never "you haven't opened the
 * app". One alert per item; a job done that day has none.
 *
 * Times are wall-clock ("HH:MM" on a calendar date), so a clock change between now and the alert moves with Dan.
 */
import { calendarWeek, gameDay, weekdayOf, type Moment } from './time';
import { addDays, daysBetween, live, planMade, weekOf } from './week';
import { fallsOn } from './repeat';
import type { Content, Fact, FactBody, FactOf } from './types';

/** How long before the time an alert comes: at the time, 15 minutes or an hour before. */
export const LEADS = [0, 15, 60] as const;
export type Lead = (typeof LEADS)[number];
/** What a reminder is set on: a rhythm (`r:<id>`), one entry on the week (`e:<id>`), or bedtime. */
export const rhythmTarget = (id: string) => `r:${id}`;
export const entryTarget = (id: string) => `e:${id}`;
export const BEDTIME = 'bedtime';
/** How far ahead alerts are laid out; the list is worked out again on every change and every opening. */
export const AHEAD_DAYS = 7;
/** A start within this long after an alert for its job counts as following it (the test's notes, MVP.md). */
export const FOLLOWED_MIN = 180;

export interface Alert {
  /** One per item and day: `<target>@<game day>`. */
  key: string;
  kind: 'job' | 'bedtime';
  job: string | null;
  /** The game day it belongs to, and the item's own time. */
  day: string; time: string;
  lead: Lead;
  /** When it sounds: a calendar date and a wall-clock time (a time before 04:00 belongs to the night after the day). */
  date: string; clock: string;
}

const ofType = <T extends FactBody['type']>(facts: Fact[], type: T) => facts.filter((f): f is FactOf<T> => f.type === type);

/** Whether reminders are on at all (the one switch in Settings): on until Dan turns them off. */
export const remindersOn = (facts: Fact[]) => { const s = ofType(facts, 'remindersSwitched'); return s.length ? s[s.length - 1].on : true; };
/** Every target's reminder as Dan last set it: a lead, or null for "off" (which overrides a rhythm's, for one entry). */
export function reminderSettings(facts: Fact[]): Map<string, Lead | null> {
  const out = new Map<string, Lead | null>();
  for (const f of ofType(facts, 'reminderSet')) out.set(f.target, f.lead);
  return out;
}
/** One target's reminder, or null (off). */
export const reminderOf = (facts: Fact[], target: string): Lead | null => reminderSettings(facts).get(target) ?? null;

/** A wall-clock time on a game day, less `lead` minutes, as a calendar date and a clock. */
export function wallOf(day: string, time: string, lead: number): { date: string; clock: string } {
  const [h, m] = time.split(':').map(Number);
  let mins = (h < 4 ? h + 24 : h) * 60 + m - lead, date = day;
  while (mins >= 24 * 60) { mins -= 24 * 60; date = addDays(date, 1); }
  while (mins < 0) { mins += 24 * 60; date = addDays(date, -1); }
  return { date, clock: `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}` };
}

/** The alerts belonging to one game day, whether or not they have sounded yet. */
export function alertsOn(base: Content, facts: Fact[], day: string, today = day): Alert[] {
  if (!remindersOn(facts)) return [];
  const c = live(base.base ?? base, facts);   /* Dan's own jobs and lines too */
  const set = reminderSettings(facts), out: Alert[] = [];
  const push = (target: string, kind: Alert['kind'], job: string | null, time: string, lead: Lead) =>
    out.push({ key: `${target}@${day}`, kind, job, day, time, lead, ...wallOf(day, time, lead) });
  const doneOn = new Set(ofType(facts, 'jobDone').filter(f => f.day === day).map(f => f.job));
  const rhythmOf = (job: string) => c.rhythms.find(r => r.job === job);
  const week = calendarWeek(day);
  const listed = new Set<string>();
  /* what the week puts on the day with a time: an entry's own reminder, else its rhythm's */
  for (const j of weekOf(c, facts, week, today).days.find(d => d.day === day)?.jobs ?? []) {
    if (!j.time || j.done || !j.entry || doneOn.has(j.job)) continue;
    listed.add(j.job);
    const e = entryTarget(j.entry), r = rhythmOf(j.job);
    const lead = set.has(e) ? set.get(e)! : r ? set.get(rhythmTarget(r.id)) ?? null : null;
    if (lead !== null) push(e, 'job', j.job, j.time, lead);
  }
  /* a week not laid out yet (next week, before its first opening): an appointment on its set days, at its own time */
  if (!planMade(facts, week)) for (const r of c.rhythms) {
    if (!r.time || !fallsOn(r, day) || listed.has(r.job) || doneOn.has(r.job)) continue;
    const lead = set.get(rhythmTarget(r.id)) ?? null;
    if (lead !== null) push(rhythmTarget(r.id), 'job', r.job, r.time, lead);
  }
  /* bedtime, unless Dan has already gone to sleep that day */
  const bed = set.get(BEDTIME) ?? null;
  if (bed !== null && !ofType(facts, 'goodnight').some(f => f.day === day)) {
    const b = ofType(facts, 'bedtimeSet');
    push(BEDTIME, 'bedtime', null, b.length ? b[b.length - 1].time : '23:00', bed);
  }
  return out;
}

/** The alerts still to sound from `now`, over the next week, soonest first. */
export function alertsDue(c: Content, facts: Fact[], now: Moment, days = AHEAD_DAYS): Alert[] {
  const today = gameDay(now), wall = now.slice(0, 16), out: Alert[] = [];
  for (let i = 0; i < days; i++) out.push(...alertsOn(c, facts, addDays(today, i), today));
  return out.filter(a => `${a.date}T${a.clock}` > wall).sort((a, b) => `${a.date}T${a.clock}`.localeCompare(`${b.date}T${b.clock}`));
}

const wallMs = (s: string) => Date.parse(`${s.slice(0, 16)}:00Z`);
/**
 * Whether a start (Begin, or a delve) followed a reminder for its job: an alert for it that had already sounded, within
 * FOLLOWED_MIN before. Worked out from the facts as they were, so no fact is written per alert (the test's notes, MVP.md).
 */
export function followedReminder(c: Content, facts: Fact[], start: Fact): boolean {
  if (start.type !== 'jobBegun' && start.type !== 'delveStarted') return false;
  if (start.type === 'jobBegun' && start.from !== 'app') return false;
  const before = facts.filter(f => f.seq < start.seq), at = wallMs(start.at);
  return alertsOn(c, before, start.day).some(a => {
    if (a.job !== start.job) return false;
    const t = wallMs(`${a.date}T${a.clock}`);
    return t <= at && at - t <= FOLLOWED_MIN * 60_000;
  });
}

/* ---------- the re-entry nudge (D-113; scope 23 B) ---------- */

/** After this many days without opening, one quiet word; never within a week of the last; at this hour. */
export const NUDGE_DAYS = 3, NUDGE_GAP = 7, NUDGE_HOUR = 18;
/** Off unless Dan turns it on; the "All off" switch silences it too. */
export const nudgeOn = (facts: Fact[]) => { const s = ofType(facts, 'nudgeChosen'); return remindersOn(facts) && !!s.length && s[s.length - 1].on; };
/**
 * The day the nudge would come, at NUDGE_HOUR: three days after the last opening, and at least a week after the last
 * nudge (`last`, the day one last came). Only after silence: every opening moves it on, so it never comes to a Dan who
 * is using the app, and it comes once per silence. Null when off. It never counts the days away in its words.
 */
export function nudgeDay(facts: Fact[], last: string | null): string | null {
  if (!nudgeOn(facts)) return null;
  const opens = ofType(facts, 'opened');
  if (!opens.length) return null;
  let day = addDays(opens[opens.length - 1].day, NUDGE_DAYS);
  if (last && daysBetween(last, day) < NUDGE_GAP) day = addDays(last, NUDGE_GAP);
  return day;
}
