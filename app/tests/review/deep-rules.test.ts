/**
 * Deep review of the rules engine (docs/reviews/deep/RULES.md). Each probe states what happens now and asserts the bug
 * as it stands, so a passing probe here is a reproduced finding. Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import { epochOf, momentOf } from '../../src/core/time';
import * as S from '../../src/core/story';
import type { Content, Fact, FactOf, Job, Rhythm } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim } from '../rules/sim';

function player(start = '2026-09-28T09:00:00+01:00', offset = 60, base: Content = C) {
  let facts: Fact[] = [];
  let ms = epochOf(start), off = offset;
  const at = () => momentOf(ms, off);
  return {
    get facts() { return facts; },
    get now() { return at(); },
    do(cmd: Command) { facts = facts.concat(act(facts, base, cmd, at())); return this; },
    wait(min: number) { ms += min * 60_000; facts = facts.concat(settle(facts, base, at())); return this; },
    sleep(min: number) { ms += min * 60_000; return this; },
    to(moment: string) { ms = epochOf(moment); off = offsetOfMoment(moment); return this; },
    offset(o: number) { off = o; return this; },
    view() { return see(facts, base, at()); },
    /** look at every arrival / delve end, as the screens do */
    look() {
      for (let k = 0; k < 20; k++) { const a = see(facts, base, at()).arrival; if (!a) break; this.do({ do: 'seen', what: 'arrival', ref: a.seq }); }
      const e = see(facts, base, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq });
      return this;
    },
    /** a full delve of `min` minutes, run out */
    delve(job: string, min = 30) { return this.do({ do: 'startRun', job, minutes: min, count: 1 }).wait(min + 1).look(); },
  };
}
function offsetOfMoment(m: string) { const z = /([+-])(\d\d):(\d\d)$/.exec(m); return z ? (z[1] === '-' ? -1 : 1) * (+z[2] * 60 + +z[3]) : 0; }
const of = <T extends Fact['type']>(facts: Fact[], t: T) => facts.filter((f): f is FactOf<T> => f.type === t);
const walked = (facts: Fact[]) => of(facts, 'stepsGained').reduce((a, f) => a + f.minutes, 0);
const keys = (facts: Fact[], rhythm?: string) => of(facts, 'keyEarned').filter(k => !rhythm || k.rhythm === rhythm);

describe('Keys: every N days', () => {
  it('BUG: an every-3-days job kept up every 2 days earns its first Key, then never another', () => {
    /* Sunday: Dan makes the tank every 3 days (counts for Keys from the next week, D-043 F7) */
    const tank: Job = { ...C.jobs.find(j => j.id === 'tank')! };
    const p = player('2026-09-27T09:00:00+01:00').do({ do: 'open' })
      .do({ do: 'saveJob', job: tank, rhythm: { id: 'r-tank', job: 'tank', everyDays: 3 } });
    /* from Monday 28 Sep, a 30-minute tank session every 2 days, for four weeks */
    const days: string[] = [];
    for (let d = 0; d < 28; d += 2) {
      const day = new Date(Date.UTC(2026, 8, 28 + d)).toISOString().slice(0, 10);
      days.push(day);
      p.to(`${day}T10:00:00+${day >= '2026-10-25' ? '00' : '01'}:00`).do({ do: 'open' }).delve('tank', 30);
    }
    const sessions = of(p.facts, 'jobDone').filter(f => f.job === 'tank' && f.minutes >= 30);
    expect(sessions.length).toBe(14);
    /* 14 sessions over 28 days, never more than 2 days apart: only ONE Key, ever */
    expect(keys(p.facts, 'r-tank').length).toBe(1);
    /* doing it every 3 days exactly instead earns one each time (see the next probe): keeping up MORE earns less */
  });
  it('control: the same job every 3 days exactly earns a Key each time', () => {
    const tank: Job = { ...C.jobs.find(j => j.id === 'tank')! };
    const p = player('2026-09-27T09:00:00+01:00').do({ do: 'open' })
      .do({ do: 'saveJob', job: tank, rhythm: { id: 'r-tank', job: 'tank', everyDays: 3 } });
    for (let d = 0; d < 27; d += 3) {
      const day = new Date(Date.UTC(2026, 8, 28 + d)).toISOString().slice(0, 10);
      p.to(`${day}T10:00:00+${day >= '2026-10-25' ? '00' : '01'}:00`).do({ do: 'open' }).delve('tank', 30);
    }
    expect(keys(p.facts, 'r-tank').length).toBe(9);
  });
});

describe('Recurring job: a short first session, then "Delve again"', () => {
  it('BUG: a 3-minute gym session then a 60-minute "Delve again" the same day: the hour never joins the session', () => {
    const p = player().do({ do: 'open' });
    /* 3 minutes, then Finish here (a call came) */
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(3).do({ do: 'finishHere' }).look();
    expect(see(p.facts, C, p.now).done.has('gym')).toBe(true);
    /* the job menu's "Delve again" on the done recurring row: an hour */
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(61).look();
    const d = of(p.facts, 'jobDone').filter(f => f.job === 'gym');
    expect(d.map(f => f.minutes)).toEqual([3]);       /* the session stays 3 minutes */
    expect(walked(p.facts)).toBe(63);                  /* the road did move */
    return p;
  });
  it('BUG: …so a week of four real gym sessions earns no Key (the first one counted as 3 minutes)', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(3).do({ do: 'finishHere' }).look();
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(61).look();
    for (const d of ['2026-09-29', '2026-09-30', '2026-10-01']) p.to(`${d}T09:00:00+01:00`).do({ do: 'open' }).delve('gym', 60);
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'gym').map(f => f.minutes)).toEqual([3, 60, 60, 60]);
    expect(keys(p.facts, 'r-gym').length).toBe(0);
  });
});

describe('Morning head start (HEAD_START) when no morning find is left', () => {
  it('BUG: with no find to give, every later "open" (each cold start of the app) pays the 15-minute head start again', () => {
    const noFinds: Content = { ...C, story: { ...C.story, finds: [] } };
    const p = player('2026-09-28T09:00:00+01:00', 60, noFinds).do({ do: 'open' });
    p.to('2026-09-28T22:45:00+01:00').do({ do: 'goodnight' });
    expect(of(p.facts, 'goodnight')[0].kept).toBe(true);
    /* next morning: the app is cold-started five times (iOS closes it in the background) */
    for (const t of ['08:00', '09:30', '12:00', '15:00', '19:00']) p.to(`2026-09-29T${t}:00+01:00`).do({ do: 'open' });
    const sleep = of(p.facts, 'stepsGained').filter(f => f.job === 'sleep');
    expect(sleep.length).toBe(5);
    expect(walked(p.facts)).toBe(75);   /* 5 × 15 minutes for one night in bed on time */
    /* and on every later day too, for as long as that night stays the last one kept */
    p.to('2026-10-02T09:00:00+01:00').do({ do: 'open' }).to('2026-10-02T13:00:00+01:00').do({ do: 'open' });
    expect(walked(p.facts)).toBe(105);
  });
  it('BUG (real content): five weeks of on-time bedtimes, then four app starts on 2 Nov pay the head start four times', () => {
    const s = sim('2026-09-28T08:00:00+01:00', undefined, 'kept');
    for (let w = 0; w < 5; w++) s.week('normal');
    let f = s.facts;
    for (const t of ['09:00', '10:00', '11:00', '12:00']) f = f.concat(act(f, C, { do: 'open' }, `2026-11-02T${t}:00+01:00`));
    expect(of(f, 'stepsGained').filter(x => x.job === 'sleep' && x.day === '2026-11-02').length).toBe(4);
  });
});

describe('The side chamber halfway (D-122)', () => {
  it('BUG: a 180-minute tick that passes a place, the next chamber and the next place skips that chamber for good', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    p.do({ do: 'tickOff', job: 'cat', minutes: 180 }).look();          /* walked 180: chambers at 38 and 150 found */
    p.delve('gym', 40);                                                   /* walked 220 */
    p.do({ do: 'tickOff', job: 'post', minutes: 180 }).look();          /* walked 400: past 225 (place), 300 (chamber), 375 (place) */
    expect(walked(p.facts)).toBe(400);
    const places = of(p.facts, 'arrived').filter(a => a.kind === 'place' && a.how === 'foot');
    const chambers = of(p.facts, 'findGiven').filter(f => f.why === 'chamber');
    expect(places.length).toBe(3);
    expect(chambers.length).toBe(2);                                      /* three stretches walked, two chambers */
    expect(p.view().road).toMatchObject({ from: 375, chamber: 450 });      /* the one at 300 is behind him, never found */
  });
});

describe('"Not done after all" then ticked off again', () => {
  it('BUG: a one-off ticked at 3 h by mistake, taken back, ticked at 30 min: the road keeps 210 minutes and the record says 210', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'tickOff', job: 'cat', minutes: 180 }).sleep(1).do({ do: 'notDone', job: 'cat' }).sleep(1).do({ do: 'tickOff', job: 'cat', minutes: 30 });
    expect(walked(p.facts)).toBe(210);
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'cat').map(f => f.minutes)).toEqual([180, 210]);
  });
  it('BUG: the same loop on a recurring job: 120 taken back, 60 given: road +180, session 180', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'tickOff', job: 'gym', minutes: 120 }).sleep(1).do({ do: 'notDone', job: 'gym' }).sleep(1).do({ do: 'tickOff', job: 'gym', minutes: 60 });
    expect(walked(p.facts)).toBe(180);
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'gym').map(f => f.minutes)).toEqual([120, 180]);
  });
});

describe('Clocks', () => {
  it('holds: a 2 × 90 delve across the October clock change counts by real time (90 minutes after 2 h)', () => {
    let f: Fact[] = act([], C, { do: 'open' }, '2026-10-24T22:00:00+01:00');
    f = f.concat(act(f, C, { do: 'startRun', job: 'cat', minutes: 90, count: 2 }, '2026-10-25T00:30:00+01:00'));
    f = f.concat(settle(f, C, '2026-10-25T02:30:00+00:00'));   /* 120 real minutes later */
    expect(walked(f)).toBe(90);
    expect(see(f, C, '2026-10-25T02:30:00+00:00').run?.doneMs).toBe(85 * 60_000);
  });
  it('MINOR: flying west after 04:00 sends the game day back: a Tuesday gym session, then a second one written to Monday', () => {
    let f: Fact[] = act([], C, { do: 'open' }, '2026-09-28T09:00:00+01:00');
    f = f.concat(act(f, C, { do: 'startRun', job: 'gym', minutes: 60, count: 1 }, '2026-09-29T04:30:00+01:00'));
    f = f.concat(settle(f, C, '2026-09-29T05:31:00+01:00'));
    /* lands in New York: 02:00 local, which the rules read as Monday's game day */
    f = f.concat(act(f, C, { do: 'open' }, '2026-09-29T02:00:00-04:00'));
    expect(see(f, C, '2026-09-29T02:01:00-04:00').day).toBe('2026-09-28');
    f = f.concat(act(f, C, { do: 'startRun', job: 'gym', minutes: 60, count: 1 }, '2026-09-29T02:05:00-04:00'));
    f = f.concat(settle(f, C, '2026-09-29T03:06:00-04:00'));
    expect(of(f, 'jobDone').map(d => [d.job, d.day])).toEqual([['gym', '2026-09-29'], ['gym', '2026-09-28']]);
    /* the log's days now run backwards */
    expect(f.at(-1)!.day < f.find(x => x.type === 'delveEnded')!.day).toBe(true);
  });
});
