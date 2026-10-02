/**
 * Time, as the rules see it (ARCHITECTURE.md → Time; BALANCING.md §6).
 *
 * The rules never read a clock. A moment is passed in as the phone saw it:
 * an ISO 8601 local time with its offset, e.g. "2026-09-24T03:59:00+01:00".
 * The day belongs to the phone's local wall clock, so clock changes and trips
 * abroad move with Dan instead of against him.
 */

/** A moment, as the phone's clock gave it: local wall time and its offset. */
export type Moment = string;

/** The day turns at 04:00 local, not midnight: a late night still belongs to the day before. */
export const DAY_EDGE_HOUR = 4;

const MOMENT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** The local wall-clock parts of a moment, exactly as written (no conversion to another zone). */
export function wallClock(at: Moment): { y: number; m: number; d: number; h: number; min: number } {
  const p = MOMENT.exec(at);
  if (!p) throw new Error(`not a moment: ${at}`);
  return { y: +p[1], m: +p[2], d: +p[3], h: +p[4], min: +p[5] };
}

/** Which game day a moment belongs to, as YYYY-MM-DD. The one function every rule asks. */
export function gameDay(at: Moment): string {
  const { y, m, d, h } = wallClock(at);
  const day = new Date(Date.UTC(y, m - 1, d));
  if (h < DAY_EDGE_HOUR) day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}

/** The instant a moment names, in milliseconds since 1970 (for durations; never for which day it is). */
export function epochOf(at: Moment): number {
  const ms = Date.parse(at);
  if (Number.isNaN(ms)) throw new Error(`not a moment: ${at}`);
  return ms;
}

/** A moment from an instant and the phone's offset from UTC in minutes (e.g. +60 for British Summer Time). */
export function momentOf(ms: number, offsetMinutes: number): Moment {
  const wall = new Date(ms + offsetMinutes * 60_000).toISOString().slice(0, 19);
  const sign = offsetMinutes < 0 ? '-' : '+', a = Math.abs(offsetMinutes);
  return `${wall}${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
}

/** The phone's offset carried by a moment, in minutes. */
export function offsetOf(at: Moment): number {
  const z = /(Z|([+-])(\d{2}):(\d{2}))$/.exec(at);
  if (!z || z[1] === 'Z') return 0;
  return (z[2] === '-' ? -1 : 1) * (+z[3] * 60 + +z[4]);
}

/** The calendar week a game day belongs to, named by its Monday (YYYY-MM-DD). Weeks run Monday to Sunday. */
const weeks = new Map<string, string>();   /* asked thousands of times per call, for a few hundred days (deep review F#4) */
export function calendarWeek(day: string): string {
  const had = weeks.get(day);
  if (had !== undefined) return had;
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const w = d.toISOString().slice(0, 10);
  if (weeks.size > 20000) weeks.clear();
  weeks.set(day, w);
  return w;
}

/** The weekday of a game day: 0 Sunday … 6 Saturday. */
export const weekdayOf = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay();
