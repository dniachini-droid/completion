// A delve is a timestamp and a length, never a running count (ARCHITECTURE.md → "Time").
// Where it stands is worked out from the clock, so closing the app or a restart loses nothing.

export interface Delve {
  /** When it began, ms since the epoch. */
  startedAt: number;
  minutes: number;
}

export interface DelveNow {
  endsAt: number;
  elapsedMs: number;
  leftMs: number;
  /** 0 at the start, 1 at the end. */
  fraction: number;
  ended: boolean;
}

const MINUTE = 60_000;

export function startDelve(now: number, minutes: number): Delve {
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error(`A delve needs a length; got ${minutes}`);
  return { startedAt: now, minutes };
}

export function delveEndsAt(d: Delve): number {
  return d.startedAt + d.minutes * MINUTE;
}

export function delveNow(d: Delve, now: number): DelveNow {
  const total = d.minutes * MINUTE;
  const endsAt = delveEndsAt(d);
  // A clock set backwards never takes time away: elapsed is never negative.
  const elapsedMs = Math.min(total, Math.max(0, now - d.startedAt));
  return { endsAt, elapsedMs, leftMs: total - elapsedMs, fraction: elapsedMs / total, ended: elapsedMs >= total };
}

/** Minutes left, rounded up so "0" only ever shows at the very end. */
export function minutesLeft(n: DelveNow): number {
  return Math.ceil(n.leftMs / MINUTE);
}
