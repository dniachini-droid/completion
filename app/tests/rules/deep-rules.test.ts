/**
 * The deep review's rule fixes (D-147, FIX-LIST Stage 2) that had no probe of their own: the welcome-back day, the finish
 * line, every 2 weeks, the Keys cap said, and the four suspicions. (The probes flipped are in tests/review/deep-rules.)
 * Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { act, returnOf, see, settle, type Command } from '../../src/core/game';
import { epochOf, momentOf } from '../../src/core/time';
import * as W from '../../src/core/week';
import { doneFacts } from '../../src/core/done';
import type { Fact, FactOf, Job } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-28T09:00:00+01:00') {
  let facts: Fact[] = [];
  let ms = epochOf(start);
  const at = () => momentOf(ms, 60);
  const p = {
    get facts() { return facts; },
    get now() { return at(); },
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
const of = <T extends Fact['type']>(facts: Fact[], t: T) => facts.filter((f): f is FactOf<T> => f.type === t);

describe('the welcome-back day (Part 2 #1, W F4)', () => {
  it('missed recurring sessions from days away never pile onto the day he comes back', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: '2026-09-28' });
    const planned = (day: string) => W.weekOf(p.view().content, p.facts, '2026-09-28', day).days.find(d => d.day === day)!.jobs.map(j => j.job);
    const sunday = planned('2026-10-04');
    /* away Tuesday to Saturday; back on Sunday */
    p.to('2026-10-04').do({ do: 'open' });
    expect(p.view().welcome).not.toBeNull();
    expect(planned('2026-10-04').sort()).toEqual(sunday.sort());
  });
});

describe('the finish line (Part 2 #3, W F9, W F10)', () => {
  it('a job added to today always joins the line, never "If there\'s time"', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: '2026-09-28' });
    p.do({ do: 'addToWeek', line: 'Call the bank', day: '2026-09-28' });
    const id = p.view().content.jobs.find(j => j.name === 'Call the bank')!.id;
    expect(p.view().line).toContain(id);
  });
  it('"Not today" shortens the line, never refills it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: '2026-09-28' });
    const before = p.view().line, rest = p.view().slate.filter(x => !before.includes(x));
    p.do({ do: 'setAside', job: before[0] });
    expect(p.view().line).toEqual(before.slice(1));
    for (const x of rest) expect(p.view().line).not.toContain(x);
  });
});

describe('every 2 weeks (Part 2 #4, W F6)', () => {
  it('counts from the last time done: due again 14 days after, its Key once in those 14 days', () => {
    const p = player('2026-10-10T09:00:00+01:00').do({ do: 'open' }).delve('tank', 60);
    expect(of(p.facts, 'keyEarned').filter(k => k.rhythm === 'r-tank')).toHaveLength(1);
    /* a fixed fortnight would have it due again on Monday 12 Oct; from the last time, on Saturday 24 Oct */
    p.to('2026-10-13').do({ do: 'open' });
    expect(p.view().slate).not.toContain('tank');
    p.to('2026-10-24').do({ do: 'open' });
    expect(p.view().order).toContain('tank');
    p.delve('tank', 60);
    expect(of(p.facts, 'keyEarned').filter(k => k.rhythm === 'r-tank')).toHaveLength(2);
  });
});

describe('a passed appointment (Part 2 #5, W F5)', () => {
  it('every appointment that went by while away is listed, with the dated job', () => {
    const p = player().do({ do: 'open' })
      .do({ do: 'addToWeek', line: 'Haircut', day: '2026-09-30', time: '10:00' })
      .do({ do: 'addToWeek', line: 'Dentist', day: '2026-10-01', time: '15:00' });
    const s = W.slipped(p.view().content, p.facts, '2026-09-28', '2026-10-04');
    expect(s.map(x => [p.view().content.jobs.find(j => j.id === x.job)!.name, x.kind])).toEqual([['Haircut', 'appt'], ['Dentist', 'appt']]);
  });
});

describe('the week\'s five Keys said (W F12)', () => {
  it('a recurring job kept up past the week\'s five Keys says so', () => {
    /* six jobs of his own, each once a week, set on Sunday so they count for Keys from Monday */
    const q = player('2026-09-27T09:00:00+01:00').do({ do: 'open' });
    const names = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
    q.do({ do: 'addItems', lines: names });
    const ids = names.map(n => q.view().content.jobs.find(j => j.name === n)!.id);
    for (const id of ids) q.do({ do: 'saveJob', job: { ...q.view().content.jobs.find(j => j.id === id)!, doneBy: 'enough' }, rhythm: { id: `r-${id}`, job: id, times: 1 } });
    q.to('2026-09-28').do({ do: 'open' });
    for (const id of ids) q.delve(id, 30);
    expect(of(q.facts, 'keyEarned').filter(k => k.rhythm.startsWith('r-it')).length).toBe(5);
    const last = doneFacts(q.facts).filter(f => f.job === ids[5]).pop()!;
    expect(returnOf(q.view().content, q.facts, last.seq).keyAlready).toBe('cap');
    /* one earlier in the week says nothing of the cap */
    const first = doneFacts(q.facts).filter(f => f.job === ids[0]).pop()!;
    expect(returnOf(q.view().content, q.facts, first.seq).keyAlready).toBeNull();
  });
});

describe('the suspicions (deep review RULES)', () => {
  it('a rhythm stopped since the week began lands no Key', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'stopRhythm', id: 'r-meal' });
    /* Sunday is the meal's day; stopped on Monday, it is no longer offered, but a session said done lands nothing */
    p.to('2026-10-04').do({ do: 'open' }).do({ do: 'tickOff', job: 'meal', minutes: 60 });
    expect(of(p.facts, 'keyEarned').filter(k => k.rhythm === 'r-meal')).toHaveLength(0);
  });
  it('a one-off with "Not yet" minutes made recurring keeps them in its first session', () => {
    const p = player('2026-09-27T09:00:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['Piano'] });
    const id = p.view().content.jobs.find(j => j.name === 'Piano')!.id;
    p.do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(20).do({ do: 'finishHere' }).look();
    const job: Job = { ...p.view().content.jobs.find(j => j.id === id)!, doneBy: 'enough' };
    p.do({ do: 'saveJob', job, rhythm: { id: 'r-piano', job: id, times: 3 } });
    p.do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(31).look();
    expect(doneFacts(p.facts).filter(f => f.job === id).map(f => f.minutes)).toEqual([50]);
    /* and only once: its next session is its own */
    p.to('2026-09-29').do({ do: 'open' }).delve(id, 30);
    expect(doneFacts(p.facts).filter(f => f.job === id).map(f => f.minutes)).toEqual([50, 30]);
  });
  it('a job recurring once, a one-off now, still gets its one return', () => {
    const p = player().do({ do: 'open' }).delve('spanish', 30);
    p.do({ do: 'notDone', job: 'spanish' });
    const job: Job = { ...C.jobs.find(j => j.id === 'spanish')!, doneBy: 'dan' };
    p.do({ do: 'saveJob', job, rhythm: null });
    const beats = of(p.facts, 'beatPlayed').length + of(p.facts, 'sealOpened').length;
    p.to('2026-09-29').do({ do: 'open' }).do({ do: 'startRun', job: 'spanish', minutes: 30, count: 1 }).wait(31).do({ do: 'done', job: 'spanish', keepEnd: true });
    expect(of(p.facts, 'beatPlayed').length + of(p.facts, 'sealOpened').length).toBeGreaterThan(beats);
  });
  it('a pause for another app counts from when he left, even when the log already holds a later write', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(5);
    const left = epochOf(p.now);
    /* a background write lands 10 minutes after he left (the inbox), then he is back at 20 */
    p.wait(10).do({ do: 'saveForLater', line: 'from Siri' }).wait(5);
    p.do({ do: 'away', from: left, to: epochOf(p.now) });
    const held = of(p.facts, 'delveHeld').pop()!;
    expect(held.from).toBe(left);
    expect(p.view().run?.doneMs).toBe(5 * 60_000);
  });
});

describe('the road while a word waits (B13, W F7)', () => {
  it('counts on from the last place reached: the minutes still go somewhere', () => {
    const fs = (globalThis as unknown as { process: { getBuiltinModule(n: string): { readFileSync(u: URL, e: string): string } } }).process.getBuiltinModule('node:fs');
    const save = JSON.parse(fs.readFileSync(new URL('../flows/saves/word.json', import.meta.url), 'utf8')) as { facts: Fact[] };
    const at = '2026-10-06T11:05:00+01:00';
    const f = save.facts.concat(settle(save.facts, C, at));
    const v = see(f, C, at);
    expect(v.arrival).not.toBeNull();
    expect(C.story.beats.find(b => b.id === v.arrival!.id)?.kind).toBe('word');
    expect(v.toNext).toBeGreaterThan(0);
    expect(v.walked).toBeGreaterThanOrEqual(v.road.from);
  });
});

describe('the game day never goes back (R#6)', () => {
  it('a job moved to a later day never moves today along with it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: '2026-09-28' });
    const e = W.planOf(p.facts, '2026-09-28')!.find(x => x.day === '2026-09-28')!;
    p.do({ do: 'movePlan', entry: e.id, day: '2026-10-03' });
    expect(p.view().day).toBe('2026-09-28');
    p.do({ do: 'setAside', job: p.view().slate[0] });
    expect(p.facts.at(-1)!.day).toBe('2026-09-28');
  });
});
