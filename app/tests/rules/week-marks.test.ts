/**
 * A recurring job's week (Dan, 2026-10-02/03): a "times a week" job leaves Today once its week's number is done, and comes
 * back on Monday; its row shows this week's sessions; a rhythm reads in words. Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, weekCount, type Command } from '../../src/core/game';
import { epochOf, momentOf } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { oftenWords } from '../../src/content/copy/en';

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
    look() {
      for (let k = 0; k < 20; k++) { const a = see(facts, C, at()).arrival; if (!a) break; p.do({ do: 'seen', what: 'arrival', ref: a.seq }); }
      const e = see(facts, C, at()).runEnd; if (e) p.do({ do: 'seen', what: 'step', ref: e.seq });
      return p;
    },
    delve(job: string, min = 30) { return p.do({ do: 'startRun', job, minutes: min, count: 1 }).wait(min + 1).look(); },
  };
  return p;
}
const DAYS = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01'];
/** Gym on Monday to Thursday: its 4 of 4 by Thursday. */
function gymWeek(plan: boolean) {
  const p = player();
  for (const d of DAYS) { p.to(d).do({ do: 'open' }); if (plan && d === DAYS[0]) p.do({ do: 'planWeek', week: DAYS[0] }); p.delve('gym'); }
  return p;
}

describe('a "times a week" job whose number is done leaves Today', () => {
  for (const plan of [true, false]) {
    it(`stays on the day it was done, is gone for the rest of the week, back on Monday (${plan ? 'planned' : 'no plan'})`, () => {
      const p = gymWeek(plan);
      expect(p.view().slate).toContain('gym');   /* Thursday: done, on the list */
      for (const d of ['2026-10-02', '2026-10-03', '2026-10-04']) {
        p.to(d).do({ do: 'open' });
        expect(p.view().slate, d).not.toContain('gym');
        expect(p.view().line, d).not.toContain('gym');
      }
      p.to('2026-10-05').do({ do: 'open' });
      if (plan) p.do({ do: 'planWeek', week: '2026-10-05' });
      expect(p.view().slate).toContain('gym');
    });
  }
  it('three of four keeps it on Today', () => {
    const p = player();
    for (const d of DAYS.slice(0, 3)) p.to(d).do({ do: 'open' }).delve('gym');
    p.to('2026-10-02').do({ do: 'open' });
    expect(p.view().slate).toContain('gym');
  });
  it('started again by Dan himself, it is on Today again', () => {
    const p = gymWeek(true);
    p.to('2026-10-02').do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 30, count: 1 });
    expect(p.view().slate.concat(p.view().run ? [p.view().run!.job.id] : [])).toContain('gym');
    p.wait(31).look();
    expect(p.view().slate).toContain('gym');
  });
  it('stays in the Satchel the whole week', () => {
    const p = gymWeek(true).to('2026-10-02').do({ do: 'open' });
    expect(p.view().content.rhythms.some(r => r.job === 'gym')).toBe(true);
  });
});

describe("a recurring job's week, counted", () => {
  it('counts this week\'s sessions against its number, today\'s at once, and starts again on Monday', () => {
    const p = player();
    expect(weekCount(C, p.facts, DAYS[0], 'gym')).toEqual({ done: 0, need: 4 });
    for (const d of DAYS.slice(0, 3)) p.to(d).do({ do: 'open' }).delve('gym');
    expect(weekCount(C, p.facts, DAYS[2], 'gym')).toEqual({ done: 3, need: 4 });
    expect(weekCount(C, p.facts, '2026-10-05', 'gym')).toEqual({ done: 0, need: 4 });
  });
  it('only for a rhythm counted by the week', () => {
    const job = C.rhythms.find(r => r.everyDays || r.monthly || r.yearly || r.every);
    if (job) expect(weekCount(C, [], DAYS[0], job.job)).toBeNull();
    expect(weekCount(C, [], DAYS[0], 'no-such-job')).toBeNull();
  });
});

describe('a rhythm in words', () => {
  it('"once a week", "twice a week", "4 times a week", never "4 a week"', () => {
    expect(oftenWords({ times: 1 })).toBe('once a week');
    expect(oftenWords({ times: 2 })).toBe('twice a week');
    expect(oftenWords({ times: 4 })).toBe('4 times a week');
    expect(oftenWords({})).toBe('once a week');
  });
});
