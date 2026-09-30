/**
 * Park a thought mid-delve (Dan, D-138): one line typed during a delve becomes a job with no day in the Satchel, the
 * delve carries on untouched, nothing is earned, and the delve's end says how many thoughts it parked. Ids only.
 */
import { describe, expect, it } from 'vitest';
import { act, satchelView, see, settle, type Command } from '../../src/core/game';
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
    view() { return see(facts, C, at()); },
    satchel() { return satchelView(C, facts, at()); },
    leave() { const e = see(facts, C, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq }); return this; },
  };
}
const noDay = (p: ReturnType<typeof player>) => p.satchel().noDay.map(j => j.name);
/** everything that earns or moves Dan: none of it may come from parking */
const EARNS = new Set(['stepsGained', 'findGiven', 'beatPlayed', 'sealOpened', 'keyEarned', 'jobDone', 'dayCompleted', 'arrived']);

describe('parking a thought during a delve', () => {
  it('lands in the Satchel\'s No day yet, and the delve runs on exactly as it would have', () => {
    const a = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(7);
    const b = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(7);
    const n = a.facts.length;
    a.do({ do: 'park', line: '  must email Sam  ' });
    const added = a.facts.slice(n);
    expect(added.map(f => f.type)).toEqual(['itemAdded']);
    expect(noDay(a)).toContain('must email Sam');
    expect(a.view().run).toMatchObject({ phase: 'delve' });
    expect(a.view().run!.doneMs).toBe(b.view().run!.doneMs);
    expect(a.view().run!.leftMs).toBe(b.view().run!.leftMs);
    /* not on today's list: parked is for later */
    expect(a.view().slate.some(id => a.facts.some(f => f.type === 'itemAdded' && f.id === id))).toBe(false);
  });

  it('earns nothing, now or when the delve ends', () => {
    const a = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(10);
    const b = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(10);
    a.do({ do: 'park', line: 'one' }).do({ do: 'park', line: 'two' }).do({ do: 'park', line: 'three' });
    a.wait(20); b.wait(20);
    const earned = (p: ReturnType<typeof player>) => p.facts.filter(f => EARNS.has(f.type)).map(f => ({ ...f, seq: 0, at: '' }));
    expect(earned(a)).toEqual(earned(b));
    expect(a.view().walked).toBe(b.view().walked);
  });

  it('empty or blank text does nothing', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(2);
    const n = p.facts.length;
    p.do({ do: 'park', line: '' }).do({ do: 'park', line: '   \n  ' });
    expect(p.facts.slice(n).filter(f => f.type === 'itemAdded')).toEqual([]);
  });

  it('long text is capped like every job\'s name, and kept on one line', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    p.do({ do: 'park', line: 'x'.repeat(300) }).do({ do: 'park', line: 'ring\nthe bank' });
    const names = noDay(p);
    expect(names).toContain('x'.repeat(120));
    expect(names).toContain('ring the bank');
  });

  it('works while the delve is paused, and it stays paused', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(4).do({ do: 'stepAway' });
    const left = p.view().run!.leftMs;
    p.do({ do: 'park', line: 'buy stamps' }).wait(3);
    expect(p.view().run).toMatchObject({ phase: 'held', leftMs: left });
    expect(noDay(p)).toContain('buy stamps');
  });
});

describe('the delve\'s end counts the thoughts parked in it', () => {
  it('two parked: the end says 2; none: 0', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(3);
    p.do({ do: 'park', line: 'must email Sam' }).wait(2).do({ do: 'park', line: 'book the dentist' }).wait(5).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ parked: 2 });
    p.leave().do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(3).do({ do: 'finishHere' });
    /* the last delve's thoughts are never counted again */
    expect(p.view().runEnd).toMatchObject({ parked: 0 });
  });

  it('a thought added in the Satchel the usual way, even during a delve, is not a parked one', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(3);
    p.do({ do: 'addItems', lines: ['from the Satchel'] }).wait(1).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ parked: 0 });
  });

  it('typed as the delve runs out, it is still kept, and still counted at that end', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 10, count: 1 }).wait(11);
    expect(p.view().run).toBeNull();
    p.do({ do: 'park', line: 'call Mum' });
    expect(noDay(p)).toContain('call Mum');
    expect(p.view().runEnd).toMatchObject({ parked: 1 });
  });

  it('a thought deleted from the Satchel before the end is not counted', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(3);
    p.do({ do: 'park', line: 'a' }).do({ do: 'park', line: 'b' });
    const id = p.satchel().noDay.find(j => j.name === 'a')!.id;
    p.do({ do: 'removeJob', id }).wait(2).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ parked: 1 });
  });

  it('a delve across 04:00: parked after it, the thought is in No day yet and counted at the end', () => {
    const p = player('2026-09-24T03:40:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(25);
    p.do({ do: 'park', line: 'late thought' }).wait(10);
    expect(noDay(p)).toContain('late thought');
    expect(p.view().runEnd).toMatchObject({ parked: 1 });
  });

  it('an old save (an item added with no mark) reads as no thoughts parked', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(3);
    p.do({ do: 'addItems', lines: ['old'] }).wait(1).do({ do: 'finishHere' });
    expect(p.view().runEnd!.parked).toBe(0);
  });

  it('with no delve at all, a parked line is simply kept in the Satchel', () => {
    const p = player().do({ do: 'open' }).do({ do: 'park', line: 'after the fact' });
    expect(noDay(p)).toContain('after the fact');
  });
});
