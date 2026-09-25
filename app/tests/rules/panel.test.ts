import { describe, expect, it } from 'vitest';
import { runAt, type RunMark, type RunPlan } from '../../src/core/run';
import type { RunView } from '../../src/core/game';
import { panelOf } from '../../src/ui/panel';

/* The delve's panel on the lock screen (D-094): what it says now, and what it turns to once the phone is left locked. */
const M = 60_000, T0 = Date.UTC(2026, 8, 24, 9, 0);
const clock = (ms: number) => new Date(ms).toISOString().slice(11, 16);
const o = { place: 'The Salt Gallery', past: false, real: (ms: number) => ms, clock };
const view = (plan: RunPlan, marks: RunMark[], now: number, enoughK: number | null = null): RunView =>
  ({ ...runAt(plan, marks, now), seq: 7, job: { name: 'Writing' }, minutes: plan.minutes, count: plan.count, enoughK, startedAt: plan.startedAt }) as unknown as RunView;
const at = (plan: RunPlan, now: number, marks: RunMark[] = []) => panelOf(view(plan, marks, now), marks, now, o);

describe('the delve’s panel', () => {
  it('one delve: its own countdown, then “over” once it ends with the app closed', () => {
    const p = at({ startedAt: T0, minutes: 25, count: 1 }, T0 + 10 * M);
    expect(p).toMatchObject({ run: 7, phase: 'delve', place: 'The Salt Gallery', job: 'Writing', line: 'one delve',
      start: T0, end: T0 + 25 * M, staleAt: T0 + 25 * M, afterStart: 0, afterEnd: 0, afterLabel: 'The delve is over' });
  });

  it('a run: after a delve, the rest of the run as one countdown to its end, true however long the phone stays locked', () => {
    const plan = { startedAt: T0, minutes: 25, count: 3 };
    const p = at(plan, T0 + 5 * M);
    expect(p).toMatchObject({ line: 'the first of three delves', end: T0 + 25 * M, staleAt: T0 + 25 * M,
      afterLabel: 'The run goes on', afterStart: T0 + 25 * M, afterEnd: T0 + 85 * M });
    expect(p.afterLine).toBe('It goes on by itself, and ends at 10:25.');
  });

  it('a breather before the last delve turns into exactly that delve', () => {
    const plan = { startedAt: T0, minutes: 25, count: 2 };
    const p = at(plan, T0 + 27 * M);
    expect(p).toMatchObject({ phase: 'breather', label: 'A breather', start: T0 + 25 * M, end: T0 + 30 * M,
      afterLabel: 'Further in', afterLine: 'the second of two delves', afterStart: T0 + 30 * M, afterEnd: T0 + 55 * M });
  });

  it('a pause stands still, with nothing to turn to', () => {
    const plan = { startedAt: T0, minutes: 20, count: 1 }, marks: RunMark[] = [{ kind: 'hold', at: T0 + 5 * M }];
    const p = at(plan, T0 + 50 * M, marks);
    expect(p).toMatchObject({ phase: 'held', label: 'Paused', heldFraction: 0.25, heldTime: '15:00', staleAt: 0 });
  });

  it('follows Start it now and a pause: the end moves with them', () => {
    const plan = { startedAt: T0, minutes: 25, count: 2 };
    const skip: RunMark[] = [{ kind: 'skip', at: T0 + 26 * M }];
    expect(at(plan, T0 + 30 * M, skip)).toMatchObject({ phase: 'delve', start: T0 + 26 * M, end: T0 + 51 * M, afterStart: 0 });
    const back: RunMark[] = [{ kind: 'hold', at: T0 + 10 * M }, { kind: 'resume', at: T0 + 40 * M }];
    expect(at(plan, T0 + 41 * M, back)).toMatchObject({ start: T0 + 30 * M, end: T0 + 55 * M, afterEnd: T0 + 85 * M });
  });

  it('in a rehearsal its times are the phone’s real ones', () => {
    const real = (ms: number) => T0 + (ms - T0) / 60;
    const p = panelOf(view({ startedAt: T0, minutes: 30, count: 1 }, [], T0 + 6 * M), [], T0 + 6 * M, { ...o, real });
    expect(p.end - p.start).toBe(30 * 1000);
  });

  it('says the same thing from one moment to the next, so the phone is not asked to redraw it', () => {
    const plan = { startedAt: T0, minutes: 25, count: 3 };
    expect(at(plan, T0 + 3 * M + 250)).toEqual(at(plan, T0 + 17 * M + 500));
  });
});
