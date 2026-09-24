// The game's day and its edge (BALANCING.md §6, ARCHITECTURE.md → "Time").
// The clock is always passed in; nothing in core reads the real time.

/** The day ends at 04:00 local time. */
export const DAY_EDGE_HOUR = 4;

/** The game day a moment belongs to, as YYYY-MM-DD, in the phone's local time. */
export function gameDay(at: Date): string {
  let y = at.getFullYear(), m = at.getMonth(), d = at.getDate();
  if (at.getHours() < DAY_EDGE_HOUR) {
    // Step back one calendar date by date arithmetic, never by subtracting hours (clock changes).
    const prev = new Date(Date.UTC(y, m, d - 1));
    y = prev.getUTCFullYear(); m = prev.getUTCMonth(); d = prev.getUTCDate();
  }
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
