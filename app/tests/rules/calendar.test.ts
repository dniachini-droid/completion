/**
 * The phone's calendar, read-only (Stage 7, D-115). Ids and made-up events only.
 */
import { describe, expect, it } from 'vitest';
import { act, see, type Command } from '../../src/core/game';
import * as W from '../../src/core/week';
import type { CalEvent, Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-28T09:00:00+01:00') {   /* a Monday */
  let facts: Fact[] = [];
  const at = () => new Date(Date.parse(start) + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    view() { return see(facts, C, at()); },
  };
}
const MON = '2026-09-28', TUE = '2026-09-29';
const ev = (id: string, start: string, end: string, cal = 'work', allDay = false): CalEvent => ({ id, cal, title: id, start, end, allDay });
const busyTue = [ev('standup', `${TUE}T09:00`, `${TUE}T17:00`), ev('lunch', `${TUE}T12:00`, `${TUE}T13:00`), ev('mum', '2026-10-03', '2026-10-03', 'home', true)];

describe('the calendar (D-115)', () => {
  it('read only while shown; written only when it changed', () => {
    const p = player().do({ do: 'calendarRead', events: busyTue, days: 14 });
    expect(p.facts.some(f => f.type === 'calendarRead')).toBe(false);
    p.do({ do: 'calendarShow', on: true, calendars: null }).do({ do: 'calendarRead', events: busyTue, days: 14 }).do({ do: 'calendarRead', events: busyTue, days: 14 });
    expect(p.facts.filter(f => f.type === 'calendarRead')).toHaveLength(1);
    expect(W.eventsOn(p.facts, TUE).map(e => e.id)).toEqual(['standup', 'lunch']);
    expect(W.eventsOn(p.facts, '2026-10-03').map(e => e.id)).toEqual(['mum']);
  });
  it('only the calendars chosen; off, nothing shows', () => {
    const p = player().do({ do: 'calendarShow', on: true, calendars: ['home'] }).do({ do: 'calendarRead', events: busyTue, days: 14 });
    expect(W.eventsOn(p.facts, TUE)).toEqual([]);
    expect(W.eventsOn(p.facts, '2026-10-03')).toHaveLength(1);
    p.do({ do: 'calendarShow', on: false, calendars: ['home'] });
    expect(W.eventsOn(p.facts, '2026-10-03')).toEqual([]);
  });
  it('busy time counts overlaps once, between 07:00 and 22:00; all-day events take none', () => {
    const p = player().do({ do: 'calendarShow', on: true, calendars: null }).do({ do: 'calendarRead', events: busyTue, days: 14 });
    expect(W.busyMinutes(p.facts, TUE)).toBe(8 * 60);
    expect(W.busyMinutes(p.facts, '2026-10-03')).toBe(0);
  });
  it('a busy day gets less placed on it, but never nothing; events never become jobs', () => {
    const plain = W.planWeek(C, [], MON, MON);
    const p = player().do({ do: 'calendarShow', on: true, calendars: null }).do({ do: 'calendarRead', events: busyTue, days: 14 });
    const busy = W.planWeek(C, p.facts, MON, MON);
    const mins = (plan: typeof plain, d: string) => plan.filter(e => e.day === d && !e.time).reduce((a, e) => a + W.roomOf(C.jobs.find(j => j.id === e.job)!), 0);
    expect(mins(busy, TUE)).toBeLessThan(mins(plain, TUE));
    expect(busy.filter(e => e.day === TUE).length).toBeGreaterThan(0);
    p.do({ do: 'open' });
    expect(p.view().slate.some(id => ['standup', 'lunch', 'mum'].includes(id))).toBe(false);
  });
});
