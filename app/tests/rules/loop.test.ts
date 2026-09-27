/**
 * The begin → delve → pause → done loop, tried adversarially (D-120, 2026-09-27): across 04:00, long pauses, time
 * order, stray and double commands, runs the dial can't set. Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import { epochOf } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-24T09:00:00+01:00') {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    sleep(min: number) { now += min * 60_000; return this; },
    get ms() { return now; },
    view() { return see(facts, C, at()); },
  };
}
const steps = (facts: Fact[], job: string) =>
  facts.filter((f): f is Extract<Fact, { type: 'stepsGained' }> => f.type === 'stepsGained' && f.job === job).reduce((a, f) => a + f.minutes, 0);
const outOfTime = (facts: Fact[]) => {
  const bad: string[] = [];
  for (let i = 1; i < facts.length; i++) if (epochOf(facts[i].at) < epochOf(facts[i - 1].at)) bad.push(`${facts[i - 1].type}@${facts[i - 1].at} > ${facts[i].type}@${facts[i].at}`);
  return bad;
};

describe('A delve begun before 04:00 and said Done after it is paid once', () => {
  it('ran out at 04:15, Done at 04:20: 25 minutes of work earn 25, not 50', () => {
    const p = player('2026-09-25T03:30:00+01:00').do({ do: 'open' }).sleep(20)
      .do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(30).do({ do: 'done', job: 'cat' });
    expect(steps(p.facts, 'cat')).toBe(25);
  });
  it('still running at 04:10 when Done is said: 20 minutes earn 20, as the same run at 09:50 would', () => {
    const p = player('2026-09-25T03:30:00+01:00').do({ do: 'open' }).sleep(20)
      .do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).sleep(20).do({ do: 'done', job: 'cat' });
    const q = player('2026-09-25T09:30:00+01:00').do({ do: 'open' }).sleep(20)
      .do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).sleep(20).do({ do: 'done', job: 'cat' });
    expect(steps(q.facts, 'cat')).toBe(20);
    expect(steps(p.facts, 'cat')).toBe(steps(q.facts, 'cat'));
  });
});

describe('A run begun before 04:00 and paused after it can be carried on', () => {
  it('Step away at 04:30: five minutes later, Back to the delve still carries on', () => {
    const p = player('2026-09-25T03:30:00+01:00').do({ do: 'open' }).sleep(20)
      .do({ do: 'startRun', job: 'course', minutes: 25, count: 3 }).wait(40).do({ do: 'stepAway' }).wait(5);
    expect(p.view().run).toMatchObject({ phase: 'held' });
    p.do({ do: 'resume' });
    expect(p.view().run).toMatchObject({ phase: 'delve' });
  });
});

describe('The log keeps time order', () => {
  it('a held delve finished after HOLD_MAX is written after the facts already in the log', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(5).do({ do: 'stepAway' })
      .wait(60).do({ do: 'done', job: 'gym' }).wait(200);
    expect(p.view().run).toBeNull();
    expect(outOfTime(p.facts)).toEqual([]);
  });
  it('away reported while an earlier delve end is still unsettled: that step is written first', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 });
    p.sleep(40);
    const left = p.ms;
    p.sleep(20).do({ do: 'away', from: left, to: p.ms });
    expect(p.view().run).toMatchObject({ phase: 'held', k: 2 });
    expect(outOfTime(p.facts)).toEqual([]);
  });
});

describe('Only a run the dial can set is started', () => {
  it('a run of -25 minutes is refused, and the distance walked never goes down', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: -25, count: 1 }).wait(1);
    expect(p.view().walked).toBeGreaterThanOrEqual(0);
    expect(p.facts.some(f => f.type === 'delveStarted')).toBe(false);
  });
});

describe('Double and stray commands change nothing', () => {
  it('done twice, startRun twice, resume when not held, skip outside a breather, away with from > to', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(5);
    const n = p.facts.length;
    p.do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).do({ do: 'resume' }).do({ do: 'skipBreather' })
      .do({ do: 'away', from: p.ms, to: p.ms - 60_000 });
    expect(p.facts).toHaveLength(n);
    p.do({ do: 'done', job: 'gym' });
    const m = p.facts.length;
    p.do({ do: 'done', job: 'gym' });
    expect(p.facts).toHaveLength(m);
    expect(outOfTime(p.facts)).toEqual([]);
  });
  it('Done during its own delve ends the run once, pays the delve minutes once, and leaves nothing asking', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(10).do({ do: 'done', job: 'cat' }).wait(60);
    expect(steps(p.facts, 'cat')).toBe(10);
    expect(p.facts.filter(f => f.type === 'delveEnded')).toHaveLength(1);
    expect(p.view().runEnd).toBeNull();
    expect(p.view().next?.job).not.toBe('cat');
  });
});
