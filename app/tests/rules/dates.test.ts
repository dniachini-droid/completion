/**
 * Deadlines (Stage 3 item 5, D-114): a "by" date on satchel lines and one-offs. Ids only: no story text is asserted.
 */
import { describe, expect, it } from 'vitest';
import { act, see, type Command } from '../../src/core/game';
import * as W from '../../src/core/week';
import * as R from '../../src/core/reminders';
import type { Fact, Job } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-28T09:00:00+01:00') {   /* a Monday */
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    to(day: string, hhmm = '09:00') { now = Date.parse(`${day}T${hhmm}:00+01:00`); return this; },
    view() { return see(facts, C, at()); },
    get at() { return at(); },
  };
}
const MON = '2026-09-28';
const tax: Job = { id: 'tax', name: 'Send the tax form', delve: false, length: 30, doneBy: 'dan', by: '2026-10-03' };   /* a Saturday */

describe('a date on a job (D-114)', () => {
  it('Plan my week places it on the last day with room at least two days before its date', () => {
    const p = player().do({ do: 'saveJob', job: tax, rhythm: null }).do({ do: 'open' });
    expect(W.planOf(p.facts, MON)!.filter(e => e.job === 'tax').map(e => e.day)).toEqual(['2026-10-01']);
  });
  it('a date further off waits for its own week', () => {
    const p = player().do({ do: 'saveJob', job: { ...tax, by: '2026-10-20' }, rhythm: null }).do({ do: 'open' });
    expect(W.planOf(p.facts, MON)!.some(e => e.job === 'tax')).toBe(false);
  });
  it('within three days of its date it is on Today even unplanned; before that it isn’t', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveJob', job: { ...tax, by: '2026-10-05' }, rhythm: null });
    expect(p.view().slate).not.toContain('tax');
    p.to('2026-10-02').do({ do: 'open' });
    expect(p.view().slate).toContain('tax');
  });
  it('a dated satchel line never goes to someday', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Renew the passport'] });
    const line = p.view().content.jobs.find(j => j.item)!;
    p.do({ do: 'saveJob', job: { ...line, by: '2026-12-01' }, rhythm: null });
    const [it] = W.items(p.facts, W.addDays(MON, 30));
    expect(it).toMatchObject({ by: '2026-12-01', someday: false });
  });
  it('done before its date brings a find, once a week, and only for a date set two days or more before', () => {
    const finds = (p: ReturnType<typeof player>) => p.facts.filter(f => f.type === 'findGiven' && (f as { why: string }).why === 'dated').length;
    const early = player().do({ do: 'open' }).do({ do: 'saveJob', job: { ...tax, by: '2026-10-09' }, rhythm: null });
    early.to('2026-10-01').do({ do: 'open' }).do({ do: 'done', job: 'tax' });
    expect(finds(early)).toBe(1);
    const late = player().do({ do: 'open' }).do({ do: 'saveJob', job: { ...tax, by: '2026-10-09' }, rhythm: null }).do({ do: 'done', job: 'tax' });
    expect(finds(late)).toBe(0);
  });
  it('a date’s reminder: the morning of it, or the day before, at nine; none once done', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveJob', job: tax, rhythm: null }).do({ do: 'remind', target: R.dateTarget('tax'), lead: 1440 });
    expect(R.alertsDue(C, p.facts, p.at).filter(a => a.kind === 'by').map(a => [a.date, a.clock])).toEqual([['2026-10-02', '09:00']]);
    p.do({ do: 'remind', target: R.dateTarget('tax'), lead: 0 });
    expect(R.alertsDue(C, p.facts, p.at).filter(a => a.kind === 'by').map(a => [a.date, a.clock])).toEqual([['2026-10-03', '09:00']]);
    p.do({ do: 'done', job: 'tax' });
    expect(R.alertsDue(C, p.facts, p.at).filter(a => a.kind === 'by')).toEqual([]);
  });
});

describe('What slipped, after days away (D-114)', () => {
  it('names one passed date first, the soonest; never a list', () => {
    const p = player().do({ do: 'open' })
      .do({ do: 'saveJob', job: { ...tax, by: '2026-10-02' }, rhythm: null })
      .do({ do: 'saveJob', job: { ...tax, id: 'visa', name: 'Visa form', by: '2026-09-30' }, rhythm: null });
    expect(W.slipped(p.view().content, p.facts, MON, '2026-10-05')).toEqual({ job: 'visa', kind: 'date', day: '2026-09-30' });
  });
  it('else an appointment Dan added himself that went by; a rhythm’s comes round again and isn’t named', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Dentist', day: '2026-09-29', time: '15:00' });
    const dentist = p.view().content.jobs.find(j => j.name === 'Dentist')!.id;
    expect(W.slipped(p.view().content, p.facts, MON, '2026-10-02')).toEqual({ job: dentist, kind: 'appt', day: '2026-09-29', time: '15:00' });
    const q = player().do({ do: 'open' });
    expect(W.slipped(q.view().content, q.facts, MON, '2026-10-05')).toBeNull();   /* the lesson on Thursday isn't named */
  });
});

describe('A lighter or fuller day, never required (D-114)', () => {
  it('not chosen, the day is as planned even after a late night (D-089); chosen, it changes the day’s size', () => {
    const p = player().do({ do: 'open' });
    expect(p.view().capacity).toBe('normal');
    const size = p.view().size;
    p.do({ do: 'capacity', capacity: 'low' });
    expect(p.view().capacity).toBe('low');
    expect(p.view().size).toBeLessThanOrEqual(size);
    const q = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'normal' });
    expect(q.facts.filter(f => f.type === 'capacityChosen')).toHaveLength(1);   /* "as planned" is an answer too */
  });
});
