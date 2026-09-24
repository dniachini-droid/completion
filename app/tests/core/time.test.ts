import { describe, expect, it } from 'vitest';
import { gameDay } from '../../src/core/time';

// Runs under TZ=Europe/London (see vitest setup in package.json) so clock changes are real.
describe('gameDay: the day ends at 04:00', () => {
  it('03:59 belongs to the day before; 04:00 starts a new one', () => {
    expect(gameDay(new Date(2026, 8, 24, 3, 59))).toBe('2026-09-23');
    expect(gameDay(new Date(2026, 8, 24, 4, 0))).toBe('2026-09-24');
  });
  it('midnight is still the evening before', () => {
    expect(gameDay(new Date(2026, 8, 24, 0, 0))).toBe('2026-09-23');
    expect(gameDay(new Date(2026, 8, 23, 23, 59))).toBe('2026-09-23');
  });
  it('crosses months and years', () => {
    expect(gameDay(new Date(2027, 0, 1, 2, 0))).toBe('2026-12-31');
    expect(gameDay(new Date(2026, 2, 1, 1, 0))).toBe('2026-02-28');
  });
  it('holds across the spring and autumn clock changes', () => {
    // UK: clocks go forward 29 Mar 2026 01:00, back 25 Oct 2026 02:00.
    expect(gameDay(new Date(2026, 2, 29, 3, 30))).toBe('2026-03-28');
    expect(gameDay(new Date(2026, 2, 29, 4, 0))).toBe('2026-03-29');
    expect(gameDay(new Date(2026, 9, 25, 1, 30))).toBe('2026-10-24');
    expect(gameDay(new Date(2026, 9, 25, 4, 0))).toBe('2026-10-25');
  });
});
