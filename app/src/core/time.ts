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
