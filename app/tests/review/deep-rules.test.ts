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
  it('FIXED (B4): an every-3-days job kept up every 2 days earns a Key whenever none was earned in the last 3 days', () => {
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
    /* 14 sessions over 28 days, two days apart: a Key on day 0, 4, 8 … (one every window of 3 days with none), never fewer
       than doing it every 3 days exactly would earn; the week's cap still holds */
    expect(keys(p.facts, 'r-tank').length).toBe(7);
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
  it('FIXED (B2): a 3-minute gym session then a 60-minute "Delve again" the same day: the hour joins the session', () => {
    const p = player().do({ do: 'open' });
    /* 3 minutes, then Finish here (a call came) */
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(3).do({ do: 'finishHere' }).look();
    expect(see(p.facts, C, p.now).done.has('gym')).toBe(true);
    /* the job menu's "Delve again" on the done recurring row: an hour */
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(61).look();
    const d = of(p.facts, 'jobDone').filter(f => f.job === 'gym');
    expect(d.map(f => f.minutes)).toEqual([3, 63]);   /* the session formed again: 3 + 60 */
    expect(see(p.facts, C, p.now).done.has('gym')).toBe(true);
    expect(of(p.facts, 'doneUndone').filter(f => f.job === 'gym').map(f => f.joined)).toEqual([true]);
    expect(walked(p.facts)).toBe(63);                  /* the road moved once for each minute */
    return p;
  });
  it('FIXED (B2): …so a week of four real gym sessions earns its Key', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(3).do({ do: 'finishHere' }).look();
    p.do({ do: 'startRun', job: 'gym', minutes: 60, count: 1 }).wait(61).look();
    for (const d of ['2026-09-29', '2026-09-30', '2026-10-01']) p.to(`${d}T09:00:00+01:00`).do({ do: 'open' }).delve('gym', 60);
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'gym').map(f => f.minutes)).toEqual([3, 63, 60, 60, 60]);
    expect(keys(p.facts, 'r-gym').length).toBe(1);
  });
  it('B2: a joined session never pays its return twice (a full session, then another delve the same day)', () => {
    const p = player().do({ do: 'open' }).delve('gym', 60);
    const beats = of(p.facts, 'beatPlayed').length, finds = of(p.facts, 'findGiven').length;
    p.delve('gym', 30);
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'gym').map(f => f.minutes)).toEqual([60, 90]);
    expect(of(p.facts, 'beatPlayed').filter(f => f.job !== undefined).length).toBe(of(p.facts, 'beatPlayed').filter(f => f.job !== undefined && f.seq < p.facts.length).length);
    expect(of(p.facts, 'beatPlayed').filter(f => typeof f.job === 'number').length).toBeLessThanOrEqual(beats);
    expect(of(p.facts, 'findGiven').filter(f => f.why !== 'chamber').length).toBeLessThanOrEqual(finds);
  });
});

describe('Morning head start (HEAD_START) when no morning find is left', () => {
  it('FIXED (U2): with no find to give, later opens the same morning never pay the head start again', () => {
    const noFinds: Content = { ...C, story: { ...C.story, finds: [] } };
    const p = player('2026-09-28T09:00:00+01:00', 60, noFinds).do({ do: 'open' });
    p.to('2026-09-28T22:45:00+01:00').do({ do: 'goodnight' });
    expect(of(p.facts, 'goodnight')[0].kept).toBe(true);
    /* next morning: the app is cold-started five times (iOS closes it in the background) */
    for (const t of ['08:00', '09:30', '12:00', '15:00', '19:00']) p.to(`2026-09-29T${t}:00+01:00`).do({ do: 'open' });
    const sleep = of(p.facts, 'stepsGained').filter(f => f.job === 'sleep');
    expect(sleep.length).toBe(1);
    expect(walked(p.facts)).toBe(15);   /* one night in bed on time, paid once */
    /* nor on any later day while that night stays the last one kept */
    p.to('2026-10-02T09:00:00+01:00').do({ do: 'open' }).to('2026-10-02T13:00:00+01:00').do({ do: 'open' });
    expect(walked(p.facts)).toBe(15);
  });
  it('FIXED (U2, real content): five weeks of on-time bedtimes, then four app starts on 2 Nov pay the head start at most once', () => {
    const s = sim('2026-09-28T08:00:00+01:00', undefined, 'kept');
    for (let w = 0; w < 5; w++) s.week('normal');
    let f = s.facts;
    for (const t of ['09:00', '10:00', '11:00', '12:00']) f = f.concat(act(f, C, { do: 'open' }, `2026-11-02T${t}:00+01:00`));
    expect(of(f, 'stepsGained').filter(x => x.job === 'sleep' && x.day === '2026-11-02').length).toBeLessThanOrEqual(1);
  });
  it('U2: an old save whose night has a morning find but no head start is not paid on the first open after the update', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    p.to('2026-09-28T22:45:00+01:00').do({ do: 'goodnight' });
    p.to('2026-09-29T08:00:00+01:00').do({ do: 'open' });
    /* as a save from before D-083: drop the head start, keep the find */
    const old = p.facts.filter(f => !(f.type === 'stepsGained' && f.job === 'sleep'));
    expect(old.some(f => f.type === 'findGiven' && f.why === 'morning')).toBe(true);
    const more = act(old, C, { do: 'open' }, '2026-09-29T10:00:00+01:00');
    expect(more.some(f => f.type === 'stepsGained' && f.job === 'sleep')).toBe(false);
  });
});

describe('The side chamber halfway (D-122)', () => {
  it('FIXED (B5): a 180-minute tick that passes a place, the next chamber and the next place finds that chamber too', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    p.do({ do: 'tickOff', job: 'cat', minutes: 180 }).look();          /* walked 180: chambers at 38 and 150 found */
    p.delve('gym', 40);                                                   /* walked 220 */
    p.do({ do: 'tickOff', job: 'post', minutes: 180 }).look();          /* walked 400: past 225 (place), 300 (chamber), 375 (place) */
    expect(walked(p.facts)).toBe(400);
    const places = of(p.facts, 'arrived').filter(a => a.kind === 'place' && a.how === 'foot');
    const chambers = of(p.facts, 'findGiven').filter(f => f.why === 'chamber');
    expect(places.length).toBe(3);
    expect(chambers.length).toBe(3);                                      /* three stretches walked, three chambers */
    expect(p.view().road).toMatchObject({ from: 375, chamber: 450 });
  });
});

describe('"Not done after all" then ticked off again', () => {
  it('FIXED (B3): a one-off ticked at 3 h by mistake, taken back, ticked at 30 min: the record says 30; the flame stays put, 2 h 30 owed', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'tickOff', job: 'cat', minutes: 180 }).sleep(1).do({ do: 'notDone', job: 'cat' });
    expect(p.view().walked).toBe(180);                 /* nothing reached is taken away */
    expect(p.view().owed).toEqual({ taken: 180, left: 180 });
    p.sleep(1).do({ do: 'tickOff', job: 'cat', minutes: 30 });
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'cat').map(f => f.minutes)).toEqual([180, 30]);
    expect(p.view().walked).toBe(180);                 /* the 30 make up part of what was taken back */
    expect(p.view().owed).toEqual({ taken: 180, left: 150 });
    /* the next real minutes fill the rest before the flame moves on */
    p.delve('gym', 60).delve('post', 90);
    expect(p.view().walked).toBe(180);
    expect(p.view().owed).toBeNull();
    p.delve('post', 30);
    expect(p.view().walked).toBe(210);
  });
  it('FIXED (B3): the same loop on a recurring job: 120 taken back, 60 given: the session is 60, the flame stays at 120', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'tickOff', job: 'gym', minutes: 120 }).sleep(1).do({ do: 'notDone', job: 'gym' }).sleep(1).do({ do: 'tickOff', job: 'gym', minutes: 60 });
    expect(p.view().walked).toBe(120);
    expect(of(p.facts, 'jobDone').filter(f => f.job === 'gym').map(f => f.minutes)).toEqual([120, 60]);
  });
  it('B3: delved minutes are never taken back', () => {
    const p = player().do({ do: 'open' }).delve('cat', 30);
    p.do({ do: 'done', job: 'cat' }).do({ do: 'notDone', job: 'cat' });
    expect(of(p.facts, 'tickTakenBack').length).toBe(0);
    expect(p.view().walked).toBe(30);
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
  it('FIXED (R#6): flying west after 04:00 never sends the game day back behind the latest day opened', () => {
    let f: Fact[] = act([], C, { do: 'open' }, '2026-09-28T09:00:00+01:00');
    f = f.concat(act(f, C, { do: 'startRun', job: 'gym', minutes: 60, count: 1 }, '2026-09-29T04:30:00+01:00'));
    f = f.concat(settle(f, C, '2026-09-29T05:31:00+01:00'));
    /* lands in New York: 02:00 local, which the rules read as Monday's game day */
    f = f.concat(act(f, C, { do: 'open' }, '2026-09-29T02:00:00-04:00'));
    expect(see(f, C, '2026-09-29T02:01:00-04:00').day).toBe('2026-09-29');
    /* gym is already done today: a second delve joins its session (B2), on the same day */
    f = f.concat(act(f, C, { do: 'startRun', job: 'gym', minutes: 60, count: 1 }, '2026-09-29T02:05:00-04:00'));
    expect(f.filter(x => x.day < '2026-09-29' && x.seq > f.find(y => y.type === 'delveEnded')!.seq).length).toBe(0);
  });
});
