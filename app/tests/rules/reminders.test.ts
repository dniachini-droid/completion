/**
 * Reminders (D-107, Stage 1 item 2; core/reminders.ts): opt-in, one per item, only for things with a time; never
 * "you haven't opened the app". Ids only: no story text is asserted here.
 */
import { describe, expect, it } from 'vitest';
import { act, see, type Command } from '../../src/core/game';
import * as R from '../../src/core/reminders';
import * as W from '../../src/core/week';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

/** A player on a phone clock in British Summer Time, from a Monday at 09:00. */
function player(start = '2026-09-28T09:00:00+01:00') {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    to(iso: string) { now = Date.parse(iso); return this; },
    due() { return R.alertsDue(C, facts, at()); },
    get at() { return at(); },
  };
}
const THU = '2026-10-01';   /* the Spanish lesson, 18:00 */

describe('What alerts (D-107)', () => {
  it('nothing alerts unless Dan asked for it', () => {
    const p = player().do({ do: 'open' });
    expect(p.due()).toEqual([]);
  });
  it('an appointment set to remind 15 minutes before alerts once, on its day, at 17:45', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 15 });
    const due = p.due();
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ job: 'lesson', day: THU, date: THU, clock: '17:45', time: '18:00', lead: 15 });
  });
  it('a job done that day has no alert, and an alert already past is not laid out again', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 0 });
    p.to('2026-10-01T09:00:00+01:00').do({ do: 'open' }).do({ do: 'done', job: 'lesson' });
    expect(p.due().filter(a => a.day === THU)).toEqual([]);
    const q = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 0 });
    q.to('2026-10-01T18:30:00+01:00').do({ do: 'open' });
    expect(q.due().filter(a => a.day === THU)).toEqual([]);
  });
  it('an entry with a time added to the week can remind, and one entry can be turned off against its rhythm', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Dentist', day: '2026-09-30', time: '15:00' });
    const entry = W.planOf(p.facts, '2026-09-28')!.find(e => e.id.startsWith('pa-'))!;
    p.do({ do: 'remind', target: R.entryTarget(entry.id), lead: 60 });
    expect(p.due()).toEqual([expect.objectContaining({ job: entry.job, date: '2026-09-30', clock: '14:00' })]);
    p.do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 15 });
    const lesson = W.planOf(p.facts, '2026-09-28')!.find(e => e.job === 'lesson')!;
    p.do({ do: 'remind', target: R.entryTarget(lesson.id), lead: null });
    expect(p.due().map(a => a.job)).toEqual([entry.job]);
  });
  it('an entry moved to another time alerts at its new time', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 0 });
    const lesson = W.planOf(p.facts, '2026-09-28')!.find(e => e.job === 'lesson')!;
    p.do({ do: 'movePlan', entry: lesson.id, day: '2026-10-02', time: '19:30' });
    expect(p.due()).toEqual([expect.objectContaining({ day: '2026-10-02', clock: '19:30' })]);
  });
  it('next week, not yet laid out, still reminds of an appointment on its set day', () => {
    const p = player('2026-10-02T09:00:00+01:00').do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 60 });
    expect(W.planMade(p.facts, '2026-10-05')).toBe(false);
    expect(p.due()).toEqual([expect.objectContaining({ day: '2026-10-08', clock: '17:00' })]);
  });
  it('bedtime reminds each night until Dan goes to sleep; a bedtime after midnight sounds on the next date', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.BEDTIME, lead: 15 });
    expect(p.due()[0]).toMatchObject({ kind: 'bedtime', date: '2026-09-28', clock: '22:45' });
    expect(p.due()).toHaveLength(R.AHEAD_DAYS);
    p.to('2026-09-28T22:30:00+01:00').do({ do: 'goodnight' });
    expect(p.due()[0]).toMatchObject({ day: '2026-09-29' });
    const q = player().do({ do: 'open' }).do({ do: 'bedtime', time: '00:30' }).do({ do: 'remind', target: R.BEDTIME, lead: 60 });
    expect(q.due()[0]).toMatchObject({ day: '2026-09-28', date: '2026-09-28', clock: '23:30' });
    const r = player().do({ do: 'open' }).do({ do: 'bedtime', time: '00:30' }).do({ do: 'remind', target: R.BEDTIME, lead: 0 });
    expect(r.due()[0]).toMatchObject({ day: '2026-09-28', date: '2026-09-29', clock: '00:30' });
  });
  it('the one switch turns every reminder off, and back on as it was', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 15 }).do({ do: 'remind', target: R.BEDTIME, lead: 0 });
    const on = p.due();
    p.do({ do: 'reminders', on: false });
    expect(p.due()).toEqual([]);
    p.do({ do: 'reminders', on: true });
    expect(p.due()).toEqual(on);
  });
  it('setting a reminder earns and costs nothing, and changes nothing on Today', () => {
    const p = player().do({ do: 'open' });
    const before = see(p.facts, C, p.at);
    p.do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 15 }).do({ do: 'remind', target: R.BEDTIME, lead: 60 });
    const after = see(p.facts, C, p.at);
    expect(after.slate).toEqual(before.slate);
    expect(after.walked).toBe(before.walked);
  });
});

describe('The test can tell a start that followed a reminder (MVP.md, D-107)', () => {
  const started = (p: ReturnType<typeof player>) => p.facts.filter(f => f.type === 'delveStarted').pop()!;
  it('a delve begun within three hours after the alert followed it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 15 });
    p.to('2026-10-01T17:50:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'lesson', minutes: 30, count: 2 });
    expect(R.followedReminder(C, p.facts, started(p))).toBe(true);
  });
  it('a delve begun with no reminder set, or before the alert, did not', () => {
    const p = player().do({ do: 'open' });
    p.to('2026-10-01T17:50:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'lesson', minutes: 30, count: 2 });
    expect(R.followedReminder(C, p.facts, started(p))).toBe(false);
    const q = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 0 });
    q.to('2026-10-01T10:00:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'lesson', minutes: 30, count: 2 });
    expect(R.followedReminder(C, q.facts, started(q))).toBe(false);
  });
  it('a job recorded as already done is told apart from one begun in the app', () => {
    const p = player().do({ do: 'open' }).do({ do: 'remind', target: R.rhythmTarget('r-lesson'), lead: 15 });
    p.to('2026-10-01T19:10:00+01:00').do({ do: 'open' }).do({ do: 'done', job: 'lesson' });
    const b = p.facts.filter(f => f.type === 'jobBegun').pop() as Fact & { from: string };
    expect(b.from).toBe('record');
    expect(R.followedReminder(C, p.facts, b)).toBe(false);
  });
});

describe('The re-entry nudge (D-113)', () => {
  it('off unless Dan turns it on; "All off" silences it too', () => {
    const p = player().do({ do: 'open' });
    expect(R.nudgeDay(p.facts, null)).toBeNull();
    p.do({ do: 'nudge', on: true });
    expect(R.nudgeDay(p.facts, null)).toBe('2026-10-01');
    p.do({ do: 'reminders', on: false });
    expect(R.nudgeDay(p.facts, null)).toBeNull();
  });
  it('three days after the last opening; every opening moves it on', () => {
    const p = player().do({ do: 'open' }).do({ do: 'nudge', on: true });
    p.to('2026-09-30T09:00:00+01:00').do({ do: 'open' });
    expect(R.nudgeDay(p.facts, null)).toBe('2026-10-03');
  });
  it('never within a week of the last one', () => {
    const p = player().do({ do: 'open' }).do({ do: 'nudge', on: true });
    expect(R.nudgeDay(p.facts, '2026-09-27')).toBe('2026-10-04');
    expect(R.nudgeDay(p.facts, '2026-09-20')).toBe('2026-10-01');
  });
});
