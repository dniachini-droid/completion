/**
 * "Not yet" keeps a one-off's minutes, and its next delve carries on from them (Dan's report and choice, D-133).
 * Minutes delved are never lost and never counted twice: the road moves by each delve's own minutes once; the job's
 * done record, its return and the delve's end count the job's whole minutes. Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import { RETURN_MIN } from '../../src/core/story';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-24T09:00:00+01:00') {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    sleep(min: number) { now += min * 60_000; return this; },
    view() { return see(facts, C, at()); },
    /** Dan leaves the delve's end (any answer): it is marked seen, as the screen does */
    leave() { const e = see(facts, C, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq }); return this; },
    /** a delve of `len` minutes on a job, finished by Finish here after `min` minutes */
    delve(job: string, min: number, len = 30) { return this.do({ do: 'startRun', job, minutes: len, count: 1 }).wait(min).do({ do: 'finishHere' }); },
  };
}
const steps = (facts: Fact[], job: string) =>
  facts.filter((f): f is FactOf<'stepsGained'> => f.type === 'stepsGained' && f.job === job).reduce((a, f) => a + f.minutes, 0);
const dones = (facts: Fact[], job: string) => facts.filter((f): f is FactOf<'jobDone'> => f.type === 'jobDone' && f.job === job);
/** the story's return for a done record: a step, a passage line, a Key's niche or a find tied to it */
const returned = (facts: Fact[], seq: number) => facts.some(f => (f.type === 'beatPlayed' || f.type === 'findGiven' || f.type === 'sealOpened') && (f as { job?: number }).job === seq);

describe('Dan\'s report: Finish here after 27 minutes, "Not yet", then the same job again', () => {
  it('the same day: the road moves 27 + 10 once; the second delve carries on from 27; Done counts 37', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27);
    expect(p.view().runEnd).toMatchObject({ ask: true, minutes: 27, carried: 0, total: 27 });
    p.leave();
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(4);
    expect(p.view().run).toMatchObject({ carried: 27 });
    p.wait(6).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ ask: true, minutes: 10, carried: 27, total: 37, gained: 10 });
    p.do({ do: 'done', job: 'cat', keepEnd: true });
    expect(steps(p.facts, 'cat')).toBe(37);
    expect(p.view().walked).toBe(37);
    expect(dones(p.facts, 'cat').map(d => d.minutes)).toEqual([37]);
  });

  it('the next day: the 27 are not lost from the job: Done counts 37, and a short finish still brings its return', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27).leave().sleep(24 * 60).do({ do: 'open' });
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.view().run).toMatchObject({ carried: 27 });
    p.wait(3).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ minutes: 3, carried: 27, total: 30 });
    p.do({ do: 'done', job: 'cat', keepEnd: true });
    const d = dones(p.facts, 'cat');
    expect(d.map(x => x.minutes)).toEqual([30]);
    /* 3 minutes alone are under RETURN_MIN; the job's 30 are not */
    expect(3).toBeLessThan(RETURN_MIN);
    expect(returned(p.facts, d[0].seq)).toBe(true);
    expect(steps(p.facts, 'cat')).toBe(30);
  });

  it('"Not yet" twice: the third delve carries on from both; nothing is counted twice', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27).leave().delve('cat', 10).leave();
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.view().run).toMatchObject({ carried: 37 });
    p.wait(30);   /* runs out */
    expect(p.view().runEnd).toMatchObject({ how: 'ranOut', minutes: 30, carried: 37, total: 67, gained: 30 });
    p.do({ do: 'done', job: 'cat', keepEnd: true });
    expect(steps(p.facts, 'cat')).toBe(67);
    expect(dones(p.facts, 'cat').map(x => x.minutes)).toEqual([67]);
  });

  it('Done ends the carry: a later end of the same job starts again from nothing', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27).leave().delve('cat', 10).do({ do: 'done', job: 'cat', keepEnd: true }).leave();
    p.sleep(24 * 60).do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.view().run).toMatchObject({ carried: 0 });
  });

  it('"It\'s done" on Today the next day, with no delve that day: the carried minutes are the job\'s, counted once', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27).leave().sleep(24 * 60).do({ do: 'open' }).do({ do: 'done', job: 'cat' });
    expect(dones(p.facts, 'cat').map(x => x.minutes)).toEqual([27]);
    expect(steps(p.facts, 'cat')).toBe(27);
  });
});

describe('The carry never double-counts', () => {
  it('a delve begun before 04:00 and finished after it: carried once, on to the next delve', () => {
    const p = player('2026-09-25T03:30:00+01:00').do({ do: 'open' }).sleep(20).delve('cat', 20).leave();
    p.do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.view().run).toMatchObject({ carried: 20 });
    p.wait(5).do({ do: 'done', job: 'cat', keepEnd: true });
    expect(steps(p.facts, 'cat')).toBe(25);
    expect(dones(p.facts, 'cat').map(x => x.minutes)).toEqual([25]);
  });

  it('"Not done after all": the job carries on from all its minutes; done again, nothing is paid twice', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27).leave().delve('cat', 10).do({ do: 'done', job: 'cat', keepEnd: true }).leave();
    const first = dones(p.facts, 'cat')[0];
    expect(returned(p.facts, first.seq)).toBe(true);
    p.do({ do: 'notDone', job: 'cat' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.view().run).toMatchObject({ carried: 37 });
    p.wait(5).do({ do: 'done', job: 'cat', keepEnd: true });
    const again = dones(p.facts, 'cat')[1];
    expect(again.minutes).toBe(42);
    expect(returned(p.facts, again.seq)).toBe(false);
    expect(steps(p.facts, 'cat')).toBe(42);
  });

  it('a repeating job never carries: each run is its own session', () => {
    const p = player().do({ do: 'open' }).delve('gym', 20).leave().sleep(24 * 60).do({ do: 'open' });
    p.do({ do: 'startRun', job: 'gym', minutes: 30, count: 1 });
    expect(p.view().run).toMatchObject({ carried: 0 });
    p.wait(10).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ carried: 0, total: 10, enough: true });
  });

  it('a run of several delves: the end\'s own minutes are the whole run\'s', () => {
    const p = player().do({ do: 'open' }).delve('cat', 7).leave();
    p.do({ do: 'startRun', job: 'cat', minutes: 10, count: 2 }).wait(10 + 5 + 4).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ minutes: 14, carried: 7, total: 21, gained: 14 });
    expect(steps(p.facts, 'cat')).toBe(21);
  });
});

describe('Carried minutes are the job\'s, never another day\'s work (rule 10, fresh review of D-133)', () => {
  /* day B: every other job on the day's list said done with no minute, then the one-off finished with no minute that day */
  const dayB = (p: ReturnType<typeof player>) => {
    p.sleep(24 * 60).do({ do: 'open' });
    for (const id of p.view().slate) if (id !== 'cat') p.do({ do: 'done', job: id });
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).do({ do: 'finishHere' }).do({ do: 'done', job: 'cat', keepEnd: true });
    return p.facts.filter(f => f.day === p.view().day);
  };
  it('"Not yet" yesterday, finished today with no minute: the job counts its minutes, the day is not completed by them', () => {
    const p = player().do({ do: 'open' }).delve('cat', 27).leave();
    const b = dayB(p);
    expect(b.filter((f): f is FactOf<'jobDone'> => f.type === 'jobDone' && f.job === 'cat').map(f => [f.minutes, f.today])).toEqual([[27, 0]]);
    expect(b.some(f => f.type === 'dayCompleted')).toBe(false);
  });
  it('done yesterday, taken back, done again today with no minute: no day completed, no camp find', () => {
    const p = player().do({ do: 'open' }).delve('cat', 30).do({ do: 'done', job: 'cat', keepEnd: true }).leave().do({ do: 'notDone', job: 'cat' });
    const b = dayB(p);
    expect(b.some(f => f.type === 'dayCompleted')).toBe(false);
    expect(b.some(f => f.type === 'findGiven' && f.why === 'camp')).toBe(false);
  });
});


describe('a job left on "Not yet" stays on Today, "N min so far", until done or moved (Dan, D-143 D)', () => {
  it('it is on the next days\' lists, never in the Satchel\'s No day yet; done, or put on another day, or Not today, it goes', async () => {
    const { satchelView, inProgress, carriedOf } = await import('../../src/core/game');
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' }).do({ do: 'saveForLater', line: 'Tax return' });
    const id = p.view().content.jobs.find(j => j.name === 'Tax return')!.id;
    p.delve(id, 27).leave();
    expect(carriedOf(p.facts, p.view().content, id)).toBe(27);
    /* the next morning, and the one after: on Today */
    for (const k of [1, 2]) {
      p.sleep(24 * 60).do({ do: 'open' });
      expect(p.view().slate, `day ${k}`).toContain(id);
      expect(satchelView(C, p.facts, p.facts[p.facts.length - 1].at).noDay.map(j => j.id), `day ${k}`).not.toContain(id);
    }
    /* "Not today": off today, and it does not come back by itself */
    p.do({ do: 'setAside', job: id });
    expect(p.view().slate).not.toContain(id);
    expect(inProgress(p.view().content, p.facts).has(id)).toBe(false);
    p.sleep(24 * 60).do({ do: 'open' });
    expect(p.view().slate).not.toContain(id);
    /* delved on again: on Today again, until it is done */
    p.delve(id, 10).leave();
    p.sleep(24 * 60).do({ do: 'open' });
    expect(p.view().slate).toContain(id);
    p.do({ do: 'tickOff', job: id, minutes: 0 });
    p.sleep(24 * 60).do({ do: 'open' });
    expect(p.view().slate).not.toContain(id);
    expect(inProgress(p.view().content, p.facts).has(id)).toBe(false);
  });
  it('put on a later day, it goes there and leaves Today', () => {
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' }).do({ do: 'saveForLater', line: 'Garage' });
    const id = p.view().content.jobs.find(j => j.name === 'Garage')!.id;
    p.delve(id, 15).leave();
    p.sleep(24 * 60).do({ do: 'open' });
    expect(p.view().slate).toContain(id);
    p.do({ do: 'putOnDay', job: id, day: '2026-10-09' });
    expect(p.view().slate).not.toContain(id);
    p.sleep(24 * 60).do({ do: 'open' });
    expect(p.view().slate).not.toContain(id);
  });
});
