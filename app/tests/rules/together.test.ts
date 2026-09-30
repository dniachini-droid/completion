/**
 * Where D-136 to D-139 meet (the review of the four together): a thought parked on an errand run's end leaves its strikes
 * to come; a thought parked with the name of a job still Dan's is not added twice; a job waiting on a reply is not taken
 * on an errand run. Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, errandChoices, type Command } from '../../src/core/game';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-24T09:00:00+01:00') {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    get at() { return at(); },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    view() { return see(facts, C, at()); },
  };
}
const added = (facts: Fact[], name: string) => facts.filter((f): f is FactOf<'itemAdded'> => f.type === 'itemAdded' && f.name === name);
const errands = () => player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Bank', 'Post office', 'Chemist'] });

describe('The four together (D-136 to D-139)', () => {
  it('a thought parked on an errand run\'s end is kept, and the errands are still struck off before they are counted', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(31);
    expect(p.view().runEnd?.pending).toBe(true);
    p.do({ do: 'park', line: 'Must email Sam' });
    expect(added(p.facts, 'Must email Sam')).toHaveLength(1);
    expect(p.view().runEnd?.pending).toBe(true);
    p.do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'countErrands' });
    expect(p.facts.some(f => f.type === 'jobDone' && f.job === 'it-1')).toBe(true);
    expect(p.facts.some(f => f.type === 'jobDone' && f.job === 'it-2')).toBe(false);
  });

  it('a thought parked with the name of a job still Dan\'s is not added twice; a finished one carries on', () => {
    const p = errands().do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(5);
    p.do({ do: 'park', line: '  bank ' });
    expect(p.facts.filter(f => f.type === 'itemAdded' && f.name.toLowerCase() === 'bank')).toHaveLength(1);
    p.do({ do: 'finishHere' }).do({ do: 'done', job: 'cat', keepEnd: true }).do({ do: 'tickOff', job: 'it-3', minutes: 15 });
    p.do({ do: 'startRun', job: 'it-2', minutes: 30, count: 1 }).wait(5).do({ do: 'park', line: 'Chemist' });
    expect(added(p.facts, 'Chemist').map(f => f.from ?? null)).toEqual([null, 'it-3']);
  });

  it('a job waiting on a reply is not taken on an errand run, nor offered for one', () => {
    const p = errands().do({ do: 'waitOn', job: 'it-1', until: '2026-09-27' });
    expect(errandChoices(C, p.facts, p.at)).not.toContain('it-1');
    const n = p.facts.length;
    p.do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 });
    expect(p.facts).toHaveLength(n);
  });
});
