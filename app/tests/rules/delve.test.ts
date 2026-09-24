import { describe, expect, it } from 'vitest';
import { delveDone, delveEndsAt, delveLeft } from '../../src/core/delve';

const d = { startedAt: Date.UTC(2026, 8, 24, 10, 2), minutes: 30 };

describe('a delve is worked out from the clock', () => {
  it('knows what is left at any moment', () => {
    expect(delveLeft(d, d.startedAt)).toBe(30 * 60_000);
    expect(delveLeft(d, d.startedAt + 10 * 60_000)).toBe(20 * 60_000);
  });
  it('closing the app for the whole delve loses nothing: it is simply over', () => {
    expect(delveLeft(d, d.startedAt + 3 * 60 * 60_000)).toBe(0);
    expect(delveDone(d, d.startedAt + 3 * 60 * 60_000)).toBe(1);
  });
  it('fills the ring in proportion', () => {
    expect(delveDone(d, d.startedAt + 15 * 60_000)).toBeCloseTo(.5);
  });
  it('ends when it should', () => {
    expect(delveEndsAt(d)).toBe(Date.UTC(2026, 8, 24, 10, 32));
  });
});
