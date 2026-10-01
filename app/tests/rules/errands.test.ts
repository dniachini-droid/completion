/**
 * The errand run (Dan, D-139): several jobs ticked into one delve, struck off as each is done. The road moves once by the
 * run's minutes; each errand struck off is done that day with its share of them, and brings its story moment, paid once.
 * Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, carriedOf, errandChoices, ERRAND_RUN, type Command } from '../../src/core/game';
import { live } from '../../src/core/week';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start = '2026-09-24T09:00:00+01:00') {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    get at() { return at(); },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    sleep(min: number) { now += min * 60_000; return this; },
    view() { return see(facts, C, at()); },
    leave() { const e = see(facts, C, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq }); return this; },
  };
}
const road = (facts: Fact[]) => facts.filter((f): f is FactOf<'stepsGained'> => f.type === 'stepsGained').reduce((a, f) => a + f.minutes, 0);
const dones = (facts: Fact[], job: string) => facts.filter((f): f is FactOf<'jobDone'> => f.type === 'jobDone' && f.job === job);
const returned = (facts: Fact[], seq: number) => facts.some(f => (f.type === 'beatPlayed' || f.type === 'findGiven' || f.type === 'sealOpened') && (f as { job?: number }).job === seq);
/* two jobs jotted in the Satchel (no day yet): it-1 "Bank", it-2 "Post office", it-3 "Chemist" */
const errands = () => player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Bank', 'Post office', 'Chemist'] });

describe('The errand run (D-139)', () => {
  it('starts one delve over the chosen jobs, listed on the run; never while another delve runs', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2', 'it-3'], minutes: 30, count: 2 });
    const r = p.view().run!;
    expect(r.job.id).toBe(ERRAND_RUN);
    expect([r.minutes, r.count]).toEqual([30, 2]);
    expect(r.errands!.map(e => [e.job.id, e.struck])).toEqual([['it-1', false], ['it-2', false], ['it-3', false]]);
    expect(r.carried).toBe(0);
    const n = p.facts.length;
    p.do({ do: 'startErrands', jobs: ['cat', 'post'], minutes: 30, count: 1 }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.facts).toHaveLength(n);
  });

  it('refuses what is not an errand run: one job, unknown or repeated jobs, a job done today, a length off the dial', () => {
    const p = errands().do({ do: 'tickOff', job: 'it-3', minutes: 15 });
    const n = p.facts.length;
    for (const jobs of [['it-1'], ['it-1', 'nope'], ['it-1', 'it-1'], ['it-1', 'it-3'], [], [ERRAND_RUN, 'it-1']]) p.do({ do: 'startErrands', jobs, minutes: 30, count: 1 });
    for (const [minutes, count] of [[0, 1], [91, 1], [30, 0], [30, 9], [12.5, 1]]) p.do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes, count });
    expect(p.facts).toHaveLength(n);
  });

  it('a tap strikes an errand off, and back; only in its own run, only its errands', () => {
    const p = errands().do({ do: 'strikeErrand', job: 'it-1' });
    expect(p.facts.some(f => f.type === 'errandStruck')).toBe(false);
    p.do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(5)
      .do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'strikeErrand', job: 'it-3' });
    expect(p.view().run!.errands!.map(e => e.struck)).toEqual([true, false]);
    p.do({ do: 'strikeErrand', job: 'it-1' });
    expect(p.view().run!.errands!.map(e => e.struck)).toEqual([false, false]);
  });

  it('Finish here: the road moves once by the run\'s minutes; each errand struck off is done with its share (the remainder to the first) and brings its story moment', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2', 'it-3'], minutes: 30, count: 1 }).wait(10)
      .do({ do: 'strikeErrand', job: 'it-2' }).wait(15).do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'finishHere' });
    /* the end waits for "Count them", with the strikes as they stand */
    expect(p.view().runEnd!.pending).toBe(true);
    expect(dones(p.facts, 'it-1')).toEqual([]);
    p.do({ do: 'countErrands' });
    expect(p.view().runEnd!.pending).toBe(false);
    expect(road(p.facts)).toBe(25);
    const [bank, post] = [dones(p.facts, 'it-1'), dones(p.facts, 'it-2')];
    expect(bank.map(d => d.minutes)).toEqual([13]);
    expect(post.map(d => d.minutes)).toEqual([12]);
    expect(dones(p.facts, 'it-3')).toEqual([]);
    expect(returned(p.facts, bank[0].seq) && returned(p.facts, post[0].seq)).toBe(true);
    const v = p.view();
    expect([...v.done].sort()).toEqual(['it-1', 'it-2']);
    /* the end asks nothing and names each errand with its minutes */
    const e = v.runEnd!;
    expect([e.ask, e.minutes, e.gained]).toEqual([false, 25, 25]);
    expect(e.errands!.map(x => [x.job.id, x.minutes, x.done !== null])).toEqual([['it-1', 13, true], ['it-2', 12, true], ['it-3', 0, false]]);
    /* the one left stays as it was: in the Satchel, nothing carried (its minutes went to the ones done) */
    expect(carriedOf(p.facts, live(C, p.facts), 'it-3')).toBe(0);
    /* and nothing is paid again later: the done records are the run's */
    p.leave().do({ do: 'open' });
    expect(road(p.facts)).toBe(25);
  });

  it('a run that runs out ends the same way, with nothing counted twice', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 15, count: 2 }).wait(3)
      .do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'strikeErrand', job: 'it-2' }).wait(40).do({ do: 'countErrands' });
    expect(p.view().run).toBeNull();
    expect(road(p.facts)).toBe(30);
    expect(dones(p.facts, 'it-1').map(d => d.minutes)).toEqual([15]);
    expect(dones(p.facts, 'it-2').map(d => d.minutes)).toEqual([15]);
    p.wait(60);
    expect(dones(p.facts, 'it-1')).toHaveLength(1);
    expect(road(p.facts)).toBe(30);
  });

  it('nothing struck off: the minutes moved Dan, and are shared among the errands, carried to their next delve or tick', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(21).do({ do: 'finishHere' }).leave();
    expect(road(p.facts)).toBe(21);
    const c = live(C, p.facts);
    expect([carriedOf(p.facts, c, 'it-1'), carriedOf(p.facts, c, 'it-2')]).toEqual([11, 10]);
    /* the next day, the bank ticked off with "No more": its 11 minutes, never moving the road again */
    p.sleep(24 * 60).do({ do: 'open' }).do({ do: 'tickOff', job: 'it-1', minutes: 0 });
    expect(dones(p.facts, 'it-1').map(d => d.minutes)).toEqual([11]);
    expect(road(p.facts)).toBe(21);
    /* and the post office's delve carries on from its 10 */
    p.do({ do: 'startRun', job: 'it-2', minutes: 30, count: 1 });
    expect(p.view().run!.carried).toBe(10);
  });

  it('an errand run\'s own minutes are never carried into another run', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(30).leave()
      .do({ do: 'startErrands', jobs: ['it-1', 'cat'], minutes: 30, count: 1 });
    expect(p.view().run!.carried).toBe(0);
  });

  it('a repeating job struck off is that day\'s session with its share; unstruck, it is not', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Bank'] })
      .do({ do: 'startErrands', jobs: ['gym', 'it-1', 'meal'], minutes: 60, count: 1 }).wait(40)
      .do({ do: 'strikeErrand', job: 'gym' }).do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'finishHere' }).leave();
    expect(dones(p.facts, 'gym').map(d => d.minutes)).toEqual([20]);
    expect(dones(p.facts, 'meal')).toEqual([]);
    expect(road(p.facts)).toBe(40);
  });

  it('an errand can\'t be said done, ticked off or deleted while its run is under way', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(10);
    const n = p.facts.length;
    p.do({ do: 'done', job: 'it-1' }).do({ do: 'tickOff', job: 'it-2', minutes: 30 }).do({ do: 'removeJob', id: 'it-1' }).do({ do: 'notDone', job: 'it-1' });
    expect(p.facts).toHaveLength(n);
  });

  it('a few minutes shared among many is done, but brings no story moment (rule 10)', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2', 'it-3'], minutes: 30, count: 1 }).wait(6)
      .do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'strikeErrand', job: 'it-2' }).do({ do: 'strikeErrand', job: 'it-3' }).do({ do: 'finishHere' }).do({ do: 'countErrands' });
    const d = ['it-1', 'it-2', 'it-3'].map(id => dones(p.facts, id)[0]);
    expect(d.map(x => x.minutes)).toEqual([2, 2, 2]);
    expect(d.some(x => returned(p.facts, x.seq))).toBe(false);
    expect(road(p.facts)).toBe(6);
  });

  it('"Not done after all" on an errand, done again: its return is never paid twice, its minutes never counted twice', () => {
    const q = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(10)
      .do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'strikeErrand', job: 'it-2' }).wait(20).leave();
    expect(q.view().runEnd).toBeNull();
    const first = dones(q.facts, 'it-1')[0];
    expect(first.minutes).toBe(15);
    q.do({ do: 'notDone', job: 'it-1' }).do({ do: 'tickOff', job: 'it-1', minutes: 0 });
    const again = dones(q.facts, 'it-1')[1];
    expect(again.minutes).toBe(15);
    expect(returned(q.facts, again.seq)).toBe(false);
    expect(road(q.facts)).toBe(30);
  });

  it('a run across 04:00 counts once, on its own day', () => {
    const p = player('2026-09-24T03:40:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['Bank', 'Post office'] });
    const day = p.view().day;
    p.do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 45, count: 1 }).wait(10).do({ do: 'strikeErrand', job: 'it-1' })
      .wait(30).do({ do: 'finishHere' }).do({ do: 'countErrands' });
    expect(p.view().day).not.toBe(day);
    expect(dones(p.facts, 'it-1').map(d => [d.day, d.minutes])).toEqual([[day, 40]]);
    expect(road(p.facts)).toBe(40);
  });

  it('left paused past three hours, it ends where it was paused, with the errands struck so far', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(12)
      .do({ do: 'strikeErrand', job: 'it-2' }).do({ do: 'stepAway' }).wait(200).do({ do: 'open' });
    expect(p.view().run).toBeNull();
    expect(dones(p.facts, 'it-2').map(d => d.minutes)).toEqual([12]);
    expect(road(p.facts)).toBe(12);
  });

  it('a one-off struck off leaves a later day it was put on', () => {
    const p = errands().do({ do: 'putOnDay', job: 'it-1', day: '2026-09-28' });
    p.do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(20).do({ do: 'strikeErrand', job: 'it-1' }).do({ do: 'finishHere' }).do({ do: 'countErrands' });
    expect(p.facts.some(f => f.type === 'planChanged' && f.day === null)).toBe(true);
  });

  it('the pick list: today\'s one-offs not done, then the one-offs with no day or a later day; never a job done, or a recurring job (J12)', () => {
    const p = errands().do({ do: 'putOnDay', job: 'it-3', day: '2026-09-28' });
    const v = p.view();
    const ids = errandChoices(C, p.facts, p.at);
    const recurring = new Set(C.rhythms.map(r => r.job));
    const todays = v.slate.filter(id => !v.done.has(id) && !recurring.has(id));
    expect(ids.slice(0, todays.length)).toEqual(todays);
    expect(ids).toEqual(expect.arrayContaining(['it-1', 'it-2', 'it-3']));
    expect(ids.filter(id => recurring.has(id))).toEqual([]);
    p.do({ do: 'tickOff', job: 'it-2', minutes: 15 });
    expect(errandChoices(C, p.facts, p.at)).not.toContain('it-2');
  });

  it('the run ran out while Dan was still out: its end takes strikes, then counts them once', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2', 'it-3'], minutes: 30, count: 1 }).wait(10)
      .do({ do: 'strikeErrand', job: 'it-1' }).wait(45);
    expect(p.view().run).toBeNull();
    expect(p.view().runEnd!.errands!.map(e => e.struck)).toEqual([true, false, false]);
    p.do({ do: 'strikeErrand', job: 'it-3' }).do({ do: 'countErrands' });
    expect(dones(p.facts, 'it-1').map(d => d.minutes)).toEqual([15]);
    expect(dones(p.facts, 'it-3').map(d => d.minutes)).toEqual([15]);
    expect(dones(p.facts, 'it-2')).toEqual([]);
    /* counted once: no strike after it, and nothing written twice */
    const n = p.facts.length;
    p.do({ do: 'strikeErrand', job: 'it-2' }).do({ do: 'countErrands' });
    expect(p.facts).toHaveLength(n);
    expect(road(p.facts)).toBe(30);
  });

  it('left without "Count them" (any other tap, the next opening), it is counted as struck', () => {
    const p = errands().do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(10)
      .do({ do: 'strikeErrand', job: 'it-2' }).do({ do: 'finishHere' }).sleep(24 * 60).do({ do: 'open' });
    expect(dones(p.facts, 'it-2').map(d => [d.minutes, d.day])).toEqual([[10, '2026-09-24']]);
  });

  it('a run of no minutes marks nothing done, whatever was struck (rule 10, review)', () => {
    const p = player().do({ do: 'open' });
    const before = p.view().complete;
    p.do({ do: 'startErrands', jobs: ['gym', 'course', 'cat'], minutes: 30, count: 1 })
      .do({ do: 'strikeErrand', job: 'gym' }).do({ do: 'strikeErrand', job: 'course' }).do({ do: 'strikeErrand', job: 'cat' })
      .do({ do: 'finishHere' }).do({ do: 'countErrands' });
    expect(p.facts.filter(f => f.type === 'jobDone')).toEqual([]);
    expect(p.view().complete).toBe(before);
    /* one minute among three: only the first has a minute of it */
    const q = player().do({ do: 'open' }).do({ do: 'startErrands', jobs: ['gym', 'course', 'cat'], minutes: 30, count: 1 }).wait(1)
      .do({ do: 'strikeErrand', job: 'gym' }).do({ do: 'strikeErrand', job: 'course' }).do({ do: 'strikeErrand', job: 'cat' })
      .do({ do: 'finishHere' }).do({ do: 'countErrands' });
    expect(q.facts.filter((f): f is FactOf<'jobDone'> => f.type === 'jobDone').map(f => [f.job, f.minutes])).toEqual([['gym', 1]]);
  });

  it('a Satchel line can\'t be ticked done by another way while its run is under way', () => {
    const p = errands().do({ do: 'putOnDay', job: 'it-1', day: '2026-09-24' })
      .do({ do: 'startErrands', jobs: ['it-1', 'it-2'], minutes: 30, count: 1 }).wait(5);
    const n = p.facts.length;
    p.do({ do: 'tick', id: 'it-1' });
    expect(p.facts).toHaveLength(n);
  });

  it('a plain delve is as before: it asks "Is it done?" and is no errand run', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.view().run!.errands).toBeNull();
    p.wait(30);
    expect(p.view().runEnd!.ask).toBe(true);
    expect(p.view().runEnd!.errands).toBeNull();
  });
});
