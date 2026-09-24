import { describe, expect, it } from 'vitest';
import { alertsAfter, runAt } from '../../src/core/run';

const M = 60_000, T0 = Date.UTC(2026, 8, 24, 9, 0);
const plan = { startedAt: T0, minutes: 25, count: 2 };

describe('a run of delves, from timestamps', () => {
  it('runs a delve, a 5-minute breather, then the next delve by itself', () => {
    expect(runAt(plan, [], T0 + 10 * M)).toMatchObject({ k: 1, phase: 'delve', doneMs: 10 * M, leftMs: 15 * M });
    expect(runAt(plan, [], T0 + 27 * M)).toMatchObject({ k: 1, phase: 'breather', breatherLeftMs: 3 * M });
    expect(runAt(plan, [], T0 + 31 * M)).toMatchObject({ k: 2, phase: 'delve', doneMs: 1 * M });
    const end = runAt(plan, [], T0 + 90 * M);
    expect(end).toMatchObject({ phase: 'ended', how: 'ranOut', countedMs: 50 * M, endedAt: T0 + 55 * M });
    expect(end.ends.map(e => e.at)).toEqual([T0 + 25 * M, T0 + 55 * M]);
  });
  it('the app closed for the whole run loses nothing', () => {
    expect(runAt(plan, [], T0 + 24 * 60 * M)).toMatchObject({ phase: 'ended', countedMs: 50 * M });
  });
  it('Start it now skips the breather without loss', () => {
    const s = runAt(plan, [{ kind: 'skip', at: T0 + 26 * M }], T0 + 30 * M);
    expect(s).toMatchObject({ k: 2, phase: 'delve', doneMs: 4 * M });
    expect(runAt(plan, [{ kind: 'skip', at: T0 + 26 * M }], T0 + 60 * M).endedAt).toBe(T0 + 51 * M);
  });
  it('Step away holds the delve with its minutes kept, however long Dan is gone', () => {
    const marks = [{ kind: 'hold' as const, at: T0 + 12 * M }];
    expect(runAt(plan, marks, T0 + 5 * 60 * M)).toMatchObject({ phase: 'held', doneMs: 12 * M, leftMs: 13 * M, countedMs: 12 * M });
    const back = [...marks, { kind: 'resume' as const, at: T0 + 60 * M }];
    expect(runAt(plan, back, T0 + 70 * M)).toMatchObject({ k: 1, phase: 'delve', doneMs: 22 * M });
    expect(runAt(plan, back, T0 + 200 * M)).toMatchObject({ phase: 'ended', countedMs: 50 * M, endedAt: T0 + 60 * M + 13 * M + 5 * M + 25 * M });
  });
  it('Finish here counts every minute done', () => {
    const s = runAt(plan, [{ kind: 'finish', at: T0 + 40 * M }], T0 + 90 * M);
    expect(s).toMatchObject({ phase: 'ended', how: 'finishedHere', partialMs: 10 * M, countedMs: 35 * M });
  });
  it('pieces never earn more than an unbroken run', () => {
    const marks = [{ kind: 'hold' as const, at: T0 + 5 * M }, { kind: 'resume' as const, at: T0 + 8 * M },
      { kind: 'hold' as const, at: T0 + 20 * M }, { kind: 'resume' as const, at: T0 + 40 * M }];
    expect(runAt(plan, marks, T0 + 999 * M).countedMs).toBe(50 * M);
  });
  it('one alert per delve and breather end, from now on', () => {
    expect(alertsAfter(plan, [], T0 + M).map(a => [(a.at - T0) / M, a.what])).toEqual([[25, 'delveEnd'], [30, 'breatherEnd'], [55, 'delveEnd']]);
    expect(alertsAfter(plan, [{ kind: 'hold', at: T0 + 2 * M }], T0 + 3 * M)).toEqual([]);
  });
});
