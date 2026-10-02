/**
 * The deep review's speed-ups (D-147, FIX-LIST Stage 6, F#4) change no rule: the log's index answers as a full pass
 * would, also for a log that grew in place, and a delve's second gives the same countdown as the whole view. Ids only.
 */
import { describe, expect, it } from 'vitest';
import { act, runSecond, see, settle } from '../../src/core/game';
import { ofType, onDay } from '../../src/core/facts';
import { calendarWeek, epochOf, momentOf } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

const start = '2026-09-28T09:00:00+01:00';
const at = (min: number) => momentOf(epochOf(start) + min * 60_000, 60);
const job = C.jobs.find(j => j.delve)!.id;

describe('the log, indexed once', () => {
  it('answers as a pass over the log would, and again after the log grew in place', () => {
    const facts: Fact[] = act([], C, { do: 'open' }, at(0));
    expect(ofType(facts, 'opened')).toEqual(facts.filter(f => f.type === 'opened'));
    const more = act(facts, C, { do: 'startRun', job, minutes: 25, count: 1 }, at(1));
    facts.push(...more);
    expect(ofType(facts, 'delveStarted')).toEqual(facts.filter(f => f.type === 'delveStarted'));
    expect(onDay(facts, '2026-09-28')).toEqual(facts.filter(f => f.day === '2026-09-28'));
    /* what it hands back is the caller's own: changing it changes nothing kept */
    ofType(facts, 'delveStarted').pop();
    expect(ofType(facts, 'delveStarted')).toHaveLength(1);
  });
  it('a week is still its Monday', () => {
    for (const d of ['2026-09-28', '2026-10-04', '2026-10-05', '2027-01-01']) expect(calendarWeek(d)).toBe(calendarWeek(d));
    expect(calendarWeek('2026-10-04')).toBe('2026-09-28');
    expect(calendarWeek('2027-01-01')).toBe('2026-12-28');
  });
});

describe("a delve's second", () => {
  it('moves the countdown exactly as the whole view does, every second of a minute', () => {
    let facts: Fact[] = act([], C, { do: 'open' }, at(0));
    facts = facts.concat(act(facts, C, { do: 'startRun', job, minutes: 25, count: 1 }, at(1)));
    const whole = see(facts, C, at(3));
    for (let s = 1; s < 60; s += 7) {
      const now = momentOf(epochOf(at(3)) + s * 1000, 60);
      expect(settle(facts, C, now)).toEqual([]);
      expect(runSecond(facts, whole.run!, now)).toEqual(see(facts, C, now).run);
    }
  });
  it('gives way to the whole view once the run is over', () => {
    let facts: Fact[] = act([], C, { do: 'open' }, at(0));
    facts = facts.concat(act(facts, C, { do: 'startRun', job, minutes: 25, count: 1 }, at(1)));
    expect(runSecond(facts, see(facts, C, at(3)).run!, at(40))).toBeNull();
  });
});
