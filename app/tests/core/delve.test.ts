import { describe, expect, it } from 'vitest';
import { delveNow, minutesLeft, startDelve } from '../../src/core/delve';

const t0 = Date.UTC(2026, 8, 24, 10, 2);
const min = 60_000;

describe('a delve is worked out from the clock', () => {
  it('knows where it stands at any moment', () => {
    const d = startDelve(t0, 30);
    expect(delveNow(d, t0).fraction).toBe(0);
    expect(minutesLeft(delveNow(d, t0))).toBe(30);
    expect(minutesLeft(delveNow(d, t0 + 10 * min + 1))).toBe(20);
    expect(delveNow(d, t0 + 15 * min).fraction).toBe(0.5);
  });
  it('the app closed for the whole length: it has simply ended', () => {
    const n = delveNow(startDelve(t0, 25), t0 + 3 * 60 * min);
    expect(n.ended).toBe(true);
    expect(n.fraction).toBe(1);
    expect(n.leftMs).toBe(0);
  });
  it('a clock moved backwards never takes minutes away or goes negative', () => {
    const n = delveNow(startDelve(t0, 25), t0 - 5 * min);
    expect(n.elapsedMs).toBe(0);
    expect(n.ended).toBe(false);
  });
  it('refuses a delve with no length', () => {
    expect(() => startDelve(t0, 0)).toThrow();
  });
});
