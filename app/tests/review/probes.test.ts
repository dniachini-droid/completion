/**
 * The hostile review's targeted probes (docs/reviews/BREAK-IT.md): commands the screens don't send today, or send in an
 * odd order, and clocks that misbehave. Each probe states what happens now; `it.fails` marks a finding (it passes while
 * the problem is there, and fails once it is fixed, so it can be turned into an ordinary test). Ids only.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import { epochOf, momentOf } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import * as W from '../../src/core/week';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-28T09:00:00+01:00', offset = 60) {
  let facts: Fact[] = [];
  let ms = epochOf(start), off = offset;
  const at = () => momentOf(ms, off);
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { ms += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    sleep(min: number) { ms += min * 60_000; return this; },
    offset(o: number) { off = o; return this; },
    view() { return see(facts, C, at()); },
    get day() { return see(facts, C, at()).day; },
  };
}
const paid = (facts: Fact[]) => facts.filter(f => f.type === 'stepsGained').reduce((a, f) => a + (f as { minutes: number }).minutes, 0);

describe('probes: the week', () => {
  it('a plan entry moved by the rules to a day in another week is refused, and the Week stays whole (fixed)', () => {
    const p = player().do({ do: 'open' });
    const wk = p.view().content && W.weekOf(p.view().content, p.facts, '2026-09-28', p.day);
    const e = wk.days.flatMap(d => d.jobs).find(j => j.entry)!;
    p.do({ do: 'movePlan', entry: e.entry!, day: '2026-10-07' });
    expect(() => p.view()).not.toThrow();
  });
});

describe('probes: deleting', () => {
  it('the rules refuse to delete the job of a running delve, or one whose end is still to be answered; the run pays once (fixed)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['x'] });
    const id = p.view().content.jobs.at(-1)!.id;
    p.do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(10).do({ do: 'removeJob', id });
    expect(p.facts.some(f => f.type === 'jobRemoved')).toBe(false);
    expect(p.view().run?.job.name).toBe('x');
    p.wait(30);
    expect(paid(p.facts)).toBe(30);
    /* the end not yet answered: still refused */
    p.do({ do: 'removeJob', id });
    expect(p.facts.some(f => f.type === 'jobRemoved')).toBe(false);
  });
});

describe('probes: clocks', () => {
  it('the phone clock set back an hour mid-delve: nothing throws and nothing is paid for time that never passed', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(10);
    p.sleep(-70);
    expect(() => p.view()).not.toThrow();
    const r = p.view().run;
    p.do({ do: 'finishHere' });
    expect(paid(p.facts)).toBeLessThanOrEqual(10);
    expect(r === null || r.leftMs <= 30 * 60_000).toBe(true);
  });
  it('a flight west mid-delve (offset +01:00 to -05:00): the run keeps its minutes, the day may step back', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(20);
    p.offset(-300).wait(45);
    expect(paid(p.facts)).toBe(60);
    expect(() => p.view()).not.toThrow();
  });
});

describe('probes: lists', () => {
  it('editing a list during its delve keeps the lines already struck: they go when it ends (fixed)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Shopping'] });
    const id = p.view().content.jobs.at(-1)!.id;
    p.do({ do: 'listJob', job: id, list: 'milk\nshampoo' })
      .do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(2)
      .do({ do: 'strikeLine', job: id, k: 0 })                         /* milk is in the basket */
      .do({ do: 'listJob', job: id, list: 'milk\nshampoo\neggs' })   /* eggs remembered in the Satchel */
      .wait(30);
    expect(p.view().content.jobs.find(j => j.id === id)!.list).toBe('shampoo\neggs');
  });
});
