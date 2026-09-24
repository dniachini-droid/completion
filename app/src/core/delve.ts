/**
 * A delve is a timestamp and a length, never a count (ARCHITECTURE.md → Time).
 * Where it stands is worked out from the clock whenever it's asked.
 */
export interface Delve { startedAt: number; minutes: number; }

/** Milliseconds left, never below zero. */
export function delveLeft(d: Delve, now: number): number {
  return Math.max(0, d.startedAt + d.minutes * 60_000 - now);
}

/** How far through, 0 to 1 (for the ring). */
export function delveDone(d: Delve, now: number): number {
  return Math.min(1, Math.max(0, (now - d.startedAt) / (d.minutes * 60_000)));
}

/** When the phone should sound the end. */
export function delveEndsAt(d: Delve): number {
  return d.startedAt + d.minutes * 60_000;
}
