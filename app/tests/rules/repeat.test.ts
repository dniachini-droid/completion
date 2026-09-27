/**
 * More repeat kinds (Stage 3 item 6, D-114): monthly by date or nth weekday, yearly, every N days since last done.
 * Ids only: no story text is asserted here.
 */
import { describe, expect, it } from 'vitest';
import { act, see, type Command } from '../../src/core/game';
import * as Rep from '../../src/core/repeat';
import * as W from '../../src/core/week';
import type { Fact, Job, Rhythm } from '../../src/core/types';
import { content as C } from '../../src/content/world';

const r = (x: Partial<Rhythm>): Rhythm => ({ id: 'r-x', job: 'x', ...x });
function player(start = '2026-09-28T09:00:00+01:00') {   /* a Monday */
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    to(day: string) { now = Date.parse(`${day}T09:00:00+01:00`); return this; },
    view() { return see(facts, C, at()); },
  };
}
const job: Job = { id: 'rent', name: 'Pay the rent', delve: false, length: 15, doneBy: 'dan' };

describe('when a rhythm falls', () => {
  it('monthly on a date; a 31st is the last day of a short month', () => {
    expect(Rep.fallsOn(r({ monthly: { day: 1 } }), '2026-10-01')).toBe(true);
    expect(Rep.fallsOn(r({ monthly: { day: 1 } }), '2026-10-02')).toBe(false);
    expect(Rep.fallsOn(r({ monthly: { day: 31 } }), '2026-09-30')).toBe(true);
    expect(Rep.fallsOn(r({ monthly: { day: 31 } }), '2026-10-30')).toBe(false);
  });
  it('monthly on the nth weekday, and on the last one', () => {
    expect(Rep.fallsOn(r({ monthly: { nth: 1, weekday: 5 } }), '2026-10-02')).toBe(true);   /* the first Friday */
    expect(Rep.fallsOn(r({ monthly: { nth: 2, weekday: 5 } }), '2026-10-09')).toBe(true);
    expect(Rep.fallsOn(r({ monthly: { nth: -1, weekday: 5 } }), '2026-10-30')).toBe(true);  /* the last Friday */
    expect(Rep.fallsOn(r({ monthly: { nth: -1, weekday: 5 } }), '2026-10-23')).toBe(false);
  });
  it('yearly on its date; 29 Feb falls on 28 Feb in other years', () => {
    expect(Rep.fallsOn(r({ yearly: '10-11' }), '2026-10-11')).toBe(true);
    expect(Rep.fallsOn(r({ yearly: '02-29' }), '2027-02-28')).toBe(true);
    expect(Rep.fallsOn(r({ yearly: '02-29' }), '2028-02-28')).toBe(false);
  });
  it('every N days counts back from the day; the rest have no date', () => {
    expect(Rep.fallsOn(r({ everyDays: 3 }), '2026-10-01')).toBeNull();
    expect(Rep.samePeriod(r({ everyDays: 3 }), '2026-09-29', '2026-10-01')).toBe(true);
    expect(Rep.samePeriod(r({ everyDays: 3 }), '2026-09-28', '2026-10-01')).toBe(false);
    expect(Rep.samePeriod(r({ monthly: { day: 1 } }), '2026-10-01', '2026-10-31')).toBe(true);
  });
});

describe('Today and the plan follow the new kinds', () => {
  it('a monthly rhythm is planned and offered on its day only, and met once done', () => {
    const p = player().do({ do: 'saveRhythm', rhythm: { id: 'r-rent', job: 'rent', monthly: { day: 1 } }, job }).do({ do: 'open' });
    expect(W.planOf(p.facts, '2026-09-28')!.filter(e => e.job === 'rent').map(e => e.day)).toEqual(['2026-10-01']);
    expect(p.view().slate).not.toContain('rent');
    p.to('2026-10-01').do({ do: 'open' });
    expect(p.view().slate).toContain('rent');
    p.do({ do: 'done', job: 'rent' });
    expect(Rep.sessionsIn(p.facts, { id: 'r-rent', job: 'rent', monthly: { day: 1 } }, '2026-10-20')).toBe(1);
  });
  it('every 3 days: planned when due, then every 3 days; done early, it moves on', () => {
    const plants: Job = { id: 'plants', name: 'Water the plants', delve: false, length: 10, doneBy: 'dan' };
    const rh: Rhythm = { id: 'r-plants', job: 'plants', everyDays: 3 };
    const p = player().do({ do: 'saveRhythm', rhythm: rh, job: plants }).do({ do: 'open' });
    const on = () => W.weekOf(p.view().content, p.facts, '2026-09-28', p.view().day).days.filter(d => d.jobs.some(j => j.job === 'plants' && !j.done)).map(d => d.day);
    expect(on()).toEqual(['2026-09-28', '2026-10-01', '2026-10-04']);
    expect(Rep.dueFrom(p.facts, rh, '2026-09-29')).toBe('2026-09-29');
    p.do({ do: 'done', job: 'plants' });
    expect(Rep.dueFrom(p.facts, rh, '2026-09-29')).toBe('2026-10-01');
  });
});
