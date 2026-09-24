import { describe, expect, it } from 'vitest';
import { gameDay } from '../../src/core/time';

describe('the day edge (04:00 local)', () => {
  it('a moment before 04:00 belongs to the day before', () => {
    expect(gameDay('2026-09-25T03:59:00+01:00')).toBe('2026-09-24');
  });
  it('04:00 starts the new day', () => {
    expect(gameDay('2026-09-25T04:00:00+01:00')).toBe('2026-09-25');
  });
  it('midnight is still the day before', () => {
    expect(gameDay('2026-09-25T00:00:00+01:00')).toBe('2026-09-24');
  });
  it('crosses months and years', () => {
    expect(gameDay('2027-01-01T02:30:00+00:00')).toBe('2026-12-31');
    expect(gameDay('2026-03-01T01:00:00+00:00')).toBe('2026-02-28');
  });
  it('follows the wall clock through a clock change', () => {
    /* the night the clocks go back: 01:30 happens twice, both still the day before */
    expect(gameDay('2026-10-25T01:30:00+01:00')).toBe('2026-10-24');
    expect(gameDay('2026-10-25T01:30:00+00:00')).toBe('2026-10-24');
    expect(gameDay('2026-10-25T04:00:00+00:00')).toBe('2026-10-25');
  });
  it('follows the phone across time zones', () => {
    /* the same instant, seen in two places, can be two game days: the phone's local day wins */
    expect(gameDay('2026-09-25T03:00:00+01:00')).toBe('2026-09-24');
    expect(gameDay('2026-09-25T11:00:00+09:00')).toBe('2026-09-25');
  });
  it('refuses a moment without its offset', () => {
    expect(() => gameDay('2026-09-25T03:00:00')).toThrow();
  });
});
