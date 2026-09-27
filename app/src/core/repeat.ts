/**
 * How a rhythm repeats (PLANNER.md → Rhythms; D-114): N a week, set weekdays, every 2 weeks, and (Stage 3) monthly, yearly
 * and every N days since last done. One place answers "does it fall on this day?" and "which sessions count toward it
 * now?", so Today, the plan, Keys and reminders agree. Pure.
 */
import { calendarWeek, weekdayOf } from './time';
import type { Fact, Rhythm } from './types';

const addDays = (day: string, n: number) => { const d = new Date(`${day}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const between = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const sameFortnight = (a: string, b: string) => Math.floor(Date.parse(a) / (14 * 864e5)) === Math.floor(Date.parse(b) / (14 * 864e5));

/** The last day of a day's month. */
const monthEnd = (day: string) => { const d = new Date(`${day.slice(0, 7)}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + 1); d.setUTCDate(0); return d.toISOString().slice(0, 10); };

/** Whether a rhythm with a date falls on a day: its weekdays, its day of the month (a 31st in a short month is its
    last day), its nth weekday of the month (nth -1: the last), or its yearly date (29 Feb: 28 Feb in other years).
    Null for a rhythm without dates (N a week, every 2 weeks, every N days). */
export function fallsOn(r: Rhythm, day: string): boolean | null {
  if (r.days) return r.days.includes(weekdayOf(day));
  if (r.monthly) {
    const m = r.monthly;
    if ('day' in m) return +day.slice(8, 10) === Math.min(m.day, +monthEnd(day).slice(8, 10));
    if (weekdayOf(day) !== m.weekday) return false;
    const d = +day.slice(8, 10);
    return m.nth === -1 ? d + 7 > +monthEnd(day).slice(8, 10) : Math.ceil(d / 7) === m.nth;
  }
  if (r.yearly) {
    const md = day.slice(5, 10);
    if (md === r.yearly) return true;
    /* 29 Feb in a year without one */
    return r.yearly === '02-29' && md === '02-28' && monthEnd(day).slice(8, 10) === '28';
  }
  return null;
}

/** Sessions a rhythm needs in its period: one per set weekday in a week, N a week, else one. */
export const needOf = (r: Rhythm) => r.days ? r.days.length : r.times ?? 1;

/** Whether a session done on `done` counts toward the rhythm's period containing `day`: the week (N a week, set days),
    the fortnight, the month, the year, or the last N days. */
export function samePeriod(r: Rhythm, done: string, day: string): boolean {
  if (r.every === 2) return sameFortnight(calendarWeek(done), calendarWeek(day));
  if (r.monthly) return done.slice(0, 7) === day.slice(0, 7);
  if (r.yearly) return done.slice(0, 4) === day.slice(0, 4);
  if (r.everyDays) { const k = between(done, day); return k >= 0 && k < r.everyDays; }
  return calendarWeek(done) === calendarWeek(day);
}

/** Sessions of a rhythm done in its period containing `day`: any with a whole minute behind it (Dan, D-121), or, with
    `min`, only those at least that long (the Key's count, rule 10). */
export const sessionsIn = (facts: Fact[], r: Rhythm, day: string, min = 1) =>
  facts.filter(f => f.type === 'jobDone' && f.job === r.job && f.minutes >= min && samePeriod(r, f.day, day)).length;

/** The day an every-N-days rhythm is next due, from `from` on: N days after it was last done (before `from`), or
    `from` if it never was or is already due. */
export function dueFrom(facts: Fact[], r: Rhythm, from: string): string {
  const n = r.everyDays ?? 1;
  let last: string | null = null;
  for (const f of facts) if (f.type === 'jobDone' && f.job === r.job && f.day < from && (!last || f.day > last)) last = f.day;
  if (!last) return from;
  const due = addDays(last, n);
  return due > from ? due : from;
}

/** Whether the rhythm counts by week (N a week, set days): the rest have a period of their own. */
export const weekly = (r: Rhythm) => !r.every && !r.monthly && !r.yearly && !r.everyDays;
