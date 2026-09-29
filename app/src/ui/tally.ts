/**
 * The count at a delve's end (Dan, D-133): a sparkly flame travels along the road line to where Dan now is; the minutes
 * in the ring count up; the ring's sparkle travels round it; all three in step, once, then still. Everything moves by
 * transform and opacity alone, on the graphics chip, by animations made once (no script frame by frame, D-132); the
 * numbers are strips of digits moved in steps. Reduced motion: the end at once.
 */
/** How long the count takes, and how long it waits for the screen's own entrance. */
export const TALLY_MS = 2600, TALLY_DELAY = 450;
/** One easing for all three: brisk at first, slowing to a gentle stop where Dan now is. */
const P = [.3, .04, .16, 1] as const;
export const TALLY_EASE = `cubic-bezier(${P.join(',')})`;

const bez = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
function solve(target: number, f: (s: number) => number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m) < target) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** How far along the count is (0–1) at a share of its time. */
export const eased = (t: number) => t <= 0 ? 0 : t >= 1 ? 1 : bez(P[1], P[3], solve(t, s => bez(P[0], P[2], s)));
/** The share of the count's time at which it is this far along. */
export const whenAt = (q: number) => q <= 0 ? 0 : q >= 1 ? 1 : bez(P[0], P[2], solve(q, s => bez(P[1], P[3], s)));

export const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** What the count shows: from where it starts (as the question is asked), counting, or at its end without counting. */
export type TallyMode = 'from' | 'play' | 'still';

/** An animation that runs once and then leaves its end written on the element, so nothing is kept running. */
export function once(el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions = {}) {
  const a = el.animate(frames, { duration: TALLY_MS, delay: TALLY_DELAY, easing: TALLY_EASE, fill: 'both', ...opts });
  a.onfinish = () => { try { a.commitStyles(); } catch { /* removed */ } a.cancel(); };
  return a;
}
