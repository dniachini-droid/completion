/**
 * The fresh review of the deep review's build (D-148): each fix it asked for, as the rules see it. Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import { factsSound } from '../../src/core/save';
import { epochOf, momentOf } from '../../src/core/time';
import * as W from '../../src/core/week';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-28T09:00:00+01:00') {
  let facts: Fact[] = [];
  let ms = epochOf(start);
  const at = () => momentOf(ms, 60);
  const p = {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return p; },
    wait(min: number) { ms += min * 60_000; facts = facts.concat(settle(facts, C, at())); return p; },
    to(day: string, time = '09:00') { ms = epochOf(`${day}T${time}:00+01:00`); return p; },
    view() { return see(facts, C, at()); },
  };
  return p;
}

describe('a save with a job taken off a day can be restored', () => {
  it('a moved plan entry\'s day of null is a sound fact', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: '2026-09-28' });
    const e = W.planOf(p.facts, '2026-09-28')!.find(x => x.day === '2026-09-28')!;
    p.do({ do: 'movePlan', entry: e.id, day: null });
    expect(p.facts.some(f => f.type === 'planChanged' && f.day === null)).toBe(true);
    expect(factsSound(p.facts)).toBe(true);
  });
});

describe('minutes taken back are part of the way', () => {
  it('the next place is that much further, and a delve\'s end starts where Today says he stands', () => {
    const p = player().do({ do: 'open' });
    const toNext = p.view().toNext!;
    p.do({ do: 'tickOff', job: 'cat', minutes: 30 }).do({ do: 'notDone', job: 'cat' });
    const v = p.view();
    expect(v.toNext).toBe(toNext);
    p.do({ do: 'startRun', job: 'gym', minutes: 20, count: 1 }).wait(21);
    const end = p.view().runEnd!;
    expect(end.walked).toBe(p.view().walked);
    expect(end.gained).toBe(0);
    /* 20 of the 30 owed made up: 20 closer, as minutes count */
    expect(p.view().toNext).toBe(toNext - 20);
  });
});

describe('every appointment missed while away is asked about', () => {
  it('a long absence: the middle week\'s too', () => {
    const p = player().do({ do: 'open' })
      .do({ do: 'addToWeek', line: 'Haircut', day: '2026-10-01', time: '10:00' })
      .do({ do: 'addToWeek', line: 'Dentist', day: '2026-10-07', time: '15:00' })
      .do({ do: 'addToWeek', line: 'Optician', day: '2026-10-13', time: '11:00' });
    const s = W.slipped(p.view().content, p.facts, '2026-09-28', '2026-10-14');
    expect(s.map(x => p.view().content.jobs.find(j => j.id === x.job)!.name)).toEqual(['Haircut', 'Dentist', 'Optician']);
  });
});

describe('Just this one today keeps appointments', () => {
  it('a timed job today is never set aside by it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Dentist', day: '2026-09-28', time: '15:00' });
    const dentist = p.view().content.jobs.find(j => j.name === 'Dentist')!.id;
    const keep = p.view().order.find(id => id !== dentist)!;
    const put = act(p.facts, C, { do: 'justThis', job: keep }, '2026-09-28T09:00:00+01:00');
    expect(put.some(f => f.type === 'setAside' && f.job === dentist)).toBe(false);
  });
});

describe('an old time away never pauses a new delve', () => {
  it('a time away from before the run began is passed over', () => {
    const p = player().do({ do: 'open' });
    const before = epochOf('2026-09-28T08:30:00+01:00');
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(5);
    p.do({ do: 'away', from: before, to: epochOf('2026-09-28T09:05:00+01:00') });
    expect(p.facts.some(f => f.type === 'delveHeld')).toBe(false);
    expect(p.view().run?.phase).toBe('delve');
  });
});
