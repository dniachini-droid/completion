/**
 * A job ticked off without a delve, with the time it took (Dan, D-134): those minutes move Dan and the job is done, with
 * its story moment, as a delve's would be; no limit on how many a day. Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, TICK_CHOICES, type Command } from '../../src/core/game';
import type { Fact, FactOf } from '../../src/core/types';
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
    view() { return see(facts, C, at()); },
    leave() { const e = see(facts, C, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq }); return this; },
  };
}
const steps = (facts: Fact[], job: string) =>
  facts.filter((f): f is FactOf<'stepsGained'> => f.type === 'stepsGained' && f.job === job).reduce((a, f) => a + f.minutes, 0);
const dones = (facts: Fact[], job: string) => facts.filter((f): f is FactOf<'jobDone'> => f.type === 'jobDone' && f.job === job);
const returned = (facts: Fact[], seq: number) => facts.some(f => (f.type === 'beatPlayed' || f.type === 'findGiven' || f.type === 'sealOpened') && (f as { job?: number }).job === seq);

describe('Ticked off with the time it took (D-134)', () => {
  it('a one-off never delved on: its minutes move Dan once, it is done, and it brings its story moment', () => {
    const p = player().do({ do: 'open' }).do({ do: 'tickOff', job: 'cat', minutes: 30 });
    expect(steps(p.facts, 'cat')).toBe(30);
    expect(p.view().walked).toBe(30);
    const d = dones(p.facts, 'cat');
    expect(d.map(x => [x.minutes, x.ticked])).toEqual([[30, 30]]);
    expect(p.view().done.has('cat')).toBe(true);
    expect(returned(p.facts, d[0].seq)).toBe(true);
  });

  it('only the offered times are taken; "No more" only with delved minutes behind the job', () => {
    const p = player().do({ do: 'open' });
    const n = p.facts.length;
    for (const minutes of [7, -30, 181, 0, 30.5]) p.do({ do: 'tickOff', job: 'cat', minutes });
    p.do({ do: 'tickOff', job: 'no-such-job', minutes: 30 });
    expect(p.facts).toHaveLength(n);
    expect([...TICK_CHOICES]).toEqual([15, 30, 45, 60, 90, 120, 180]);
  });

  it('after "Not yet": the delved minutes count with the time given, never twice; "No more" counts them alone', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(27).do({ do: 'finishHere' }).leave();
    p.sleep(24 * 60).do({ do: 'open' }).do({ do: 'tickOff', job: 'cat', minutes: 30 });
    expect(dones(p.facts, 'cat').map(x => [x.minutes, x.ticked])).toEqual([[57, 30]]);
    expect(steps(p.facts, 'cat')).toBe(57);
    const q = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(27).do({ do: 'finishHere' }).leave()
      .do({ do: 'tickOff', job: 'cat', minutes: 0 });
    expect(dones(q.facts, 'cat').map(x => x.minutes)).toEqual([27]);
    expect(steps(q.facts, 'cat')).toBe(27);
  });

  it('a repeating job ticked off is that day\'s session, with its minutes; once a day', () => {
    const p = player().do({ do: 'open' }).do({ do: 'tickOff', job: 'gym', minutes: 60 });
    expect(dones(p.facts, 'gym').map(x => x.minutes)).toEqual([60]);
    const n = p.facts.length;
    p.do({ do: 'tickOff', job: 'gym', minutes: 60 });
    expect(p.facts).toHaveLength(n);
    p.sleep(24 * 60).do({ do: 'open' }).do({ do: 'tickOff', job: 'gym', minutes: 45 });
    expect(dones(p.facts, 'gym').map(x => x.minutes)).toEqual([60, 45]);
  });

  it('never while its own delve runs; a one-off already done is not ticked again', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(5);
    const n = p.facts.length;
    p.do({ do: 'tickOff', job: 'cat', minutes: 30 });
    expect(p.facts).toHaveLength(n);
    p.do({ do: 'finishHere' }).do({ do: 'done', job: 'cat', keepEnd: true }).leave().sleep(24 * 60).do({ do: 'open' });
    const m = p.facts.length;
    p.do({ do: 'tickOff', job: 'cat', minutes: 30 });
    expect(p.facts.length).toBe(m);
  });

  it('no limit: a day of ticked jobs counts every minute, reaches places, and completes the day', () => {
    const p = player().do({ do: 'open' });
    const slate = p.view().slate;
    for (const id of slate) p.do({ do: 'tickOff', job: id, minutes: 180 });
    expect(p.view().walked).toBe(180 * slate.length);
    expect(p.facts.some(f => f.type === 'dayCompleted')).toBe(true);
    expect(p.facts.some(f => f.type === 'arrived' && f.kind === 'place')).toBe(true);
  });

  it('a delve\'s end not looked at is answered by the tick: it does not come back', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(10).do({ do: 'finishHere' });
    expect(p.view().runEnd).not.toBeNull();
    p.do({ do: 'tickOff', job: 'cat', minutes: 15 });
    expect(p.view().runEnd).toBeNull();
    expect(dones(p.facts, 'cat').map(x => x.minutes)).toEqual([25]);
  });
});
