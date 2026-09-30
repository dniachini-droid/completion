/**
 * Remembered jobs (Dan, D-136): the jobs Dan has had before come up as he types in the Satchel's box; one picked carries
 * on from the one before; the planner learns from every job of a name, ticked minutes included; a name added a third
 * time in 28 days is offered, once, as a recurring job. Nothing here earns anything (rule 10). Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, carriedOf, satchelView, see, settle, type Command } from '../../src/core/game';
import { repeatOffer, suggest, tieFor } from '../../src/core/remember';
import * as W from '../../src/core/week';
import { gameDay } from '../../src/core/time';
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
    live() { return W.live(C, facts); },
    job(id: string) { return W.live(C, facts).jobs.find(j => j.id === id); },
    /** the id of the job added last */
    /** the job added last, ticked off at 15 minutes (finished, so the next of its name is a new job) */
    tick() { const id = facts.filter((f): f is FactOf<'itemAdded'> => f.type === 'itemAdded').pop()!.id; this.do({ do: 'tickOff', job: id, minutes: 15 }); return this.leave(); },
    last() { return facts.filter((f): f is FactOf<'itemAdded'> => f.type === 'itemAdded').pop()!.id; },
  };
}
const adds = (facts: Fact[]) => facts.filter((f): f is FactOf<'itemAdded'> => f.type === 'itemAdded');
const EARN = new Set(['stepsGained', 'findGiven', 'keyEarned', 'keyHeld', 'beatPlayed', 'sealOpened', 'arrived', 'jobDone', 'dayCompleted']);

/** A day of: "Go to the bank" saved, delved on for `min` minutes and said done. */
function bankTrip(p: ReturnType<typeof player>, min: number, name = 'Go to the bank', from?: string) {
  p.do({ do: 'open' }).do({ do: 'saveForLater', line: name, ...(from ? { from } : {}) });
  const id = p.last();
  p.do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(min).do({ do: 'done', job: id }).leave();
  return id;
}

describe('Suggestions as Dan types (D-136)', () => {
  it('any word start matches, whatever the case and spaces; never the middle of a word', () => {
    const p = player();
    bankTrip(p, 20);
    for (const q of ['bank', 'BANK', '  go   to ', 'the b', 'Go to the bank']) expect(suggest(C, p.facts, q).map(s => s.job.name)).toContain('Go to the bank');
    for (const q of ['ank', 'o to', '', '   ']) expect(suggest(C, p.facts, q).map(s => s.job.name)).not.toContain('Go to the bank');
  });

  it('current and finished jobs, one-offs and recurring, one per name; a finished one-off is added again, the rest are the job itself', () => {
    const p = player();
    bankTrip(p, 20); p.sleep(24 * 60);
    bankTrip(p, 20);
    const s = suggest(C, p.facts, 'spanish');
    expect(s.map(x => [x.job.id, x.same])).toEqual(expect.arrayContaining([['spanish', true], ['lesson', true]]));
    const b = suggest(C, p.facts, 'bank');
    expect(b).toHaveLength(1);   /* two trips to the bank: one suggestion */
    expect(b[0].same).toBe(false);
    p.do({ do: 'saveForLater', line: 'Buy stamps' });
    expect(suggest(C, p.facts, 'stamps').map(x => x.same)).toEqual([true]);   /* still to do: the job itself */
  });

  it('deleted jobs never come up', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Return the parcel' });
    p.do({ do: 'removeJob', id: p.last() });
    expect(suggest(C, p.facts, 'parcel')).toEqual([]);
  });

  it('at most 4, best first: the whole name, then its start, then a later word; then the latest touched', () => {
    const p = player().do({ do: 'open' });
    for (const x of ['Paint the shed', 'Shed tidy', 'Shed', 'Fix the shed door', 'Shed roof', 'Clear the shed']) p.do({ do: 'saveForLater', line: x });
    const s = suggest(C, p.facts, 'shed').map(x => x.job.name);
    expect(s).toHaveLength(4);
    expect(s[0]).toBe('Shed');
    expect(s.slice(1, 3).sort()).toEqual(['Shed roof', 'Shed tidy']);
    expect(s[1]).toBe('Shed roof');   /* the later of the two */
  });

  it('"usually N min" once learned from every job of that name', () => {
    const p = player();
    let id = '';
    for (const m of [20, 30, 40]) { id = bankTrip(p, m, 'go to the  Bank'); p.sleep(24 * 60); }
    expect(suggest(C, p.facts, 'bank')[0].usual).toBe(30);
    expect(suggest(C, p.facts, 'bank')[0].job.id).toBe(id);
  });
});

describe('A job picked carries on from the one before (D-136)', () => {
  it('its list, note, first step, avoided mark and minutes; never its date, struck lines or minutes delved', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Shopping' });
    const was = p.last();
    p.do({ do: 'saveJob', job: { ...p.job(was)!, length: 45, avoided: true, note: 'Aldi was shut', firstStep: 'Find the bags', by: '2026-10-10' }, rhythm: null });
    p.do({ do: 'listJob', job: was, list: 'milk\nshampoo' });
    p.do({ do: 'startRun', job: was, minutes: 30, count: 1 }).wait(20).do({ do: 'done', job: was }).leave();
    p.sleep(24 * 60).do({ do: 'open' }).do({ do: 'delveNow', line: 'Shopping', from: was });
    const id = p.last(), j = p.job(id)!;
    expect(id).not.toBe(was);
    expect(adds(p.facts).pop()!.from).toBe(was);
    expect([j.list, j.note, j.firstStep, j.avoided, j.length, j.by, j.struck]).toEqual(['milk\nshampoo', 'Aldi was shut', 'Find the bags', true, 45, undefined, undefined]);
    expect(p.view().run?.job.id).toBe(id);
    expect(carriedOf(p.facts, p.live(), id)).toBe(0);   /* the old job's minutes stay with it: never counted twice */
  });

  it('typed exactly (any case), it is tied without a tap; a new name is a fresh job; a tap and then a new name is a fresh job', () => {
    const p = player();
    const was = bankTrip(p, 20);
    p.do({ do: 'saveForLater', line: '  GO TO the bank ' });
    expect(adds(p.facts).pop()!.from).toBe(was);
    p.do({ do: 'saveForLater', line: 'Go to the post office', from: was });
    expect(adds(p.facts).pop()!.from).toBeUndefined();
    expect(p.job(p.last())!.length).toBe(25);
  });

  it('a job still Dan\'s is never added twice: Delve now delves on it; Save for later adds nothing', () => {
    const p = player().do({ do: 'open' });
    const n = adds(p.facts).length;
    p.do({ do: 'saveForLater', line: 'Gym, then the sauna', from: 'gym' });
    expect(adds(p.facts)).toHaveLength(n);
    expect(tieFor(C, p.facts, 'gym, then the sauna')).toMatchObject({ same: true, job: { id: 'gym' } });
    p.do({ do: 'delveNow', line: 'Gym, then the sauna', from: 'gym' });
    expect(adds(p.facts)).toHaveLength(n);
    expect(p.view().run?.job.id).toBe('gym');
    /* a one-off still to do, typed again */
    const q = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Buy stamps' });
    const stamps = q.last();
    q.do({ do: 'saveForLater', line: 'buy stamps' }).do({ do: 'delveNow', line: 'Buy stamps' });
    expect(adds(q.facts)).toHaveLength(1);
    expect(q.view().run?.job.id).toBe(stamps);
  });

  it('a one-off put on a later day, delved on from the box, is today\'s, as from its row', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Buy stamps' });
    const id = p.last();
    p.do({ do: 'putOnDay', job: id, day: '2026-09-29' });
    p.do({ do: 'delveNow', line: 'Buy stamps' });
    expect(p.view().run?.job.id).toBe(id);
    expect(satchelView(C, p.facts, p.at).coming.map(x => x.job.id)).not.toContain(id);
  });

  it('"Not done after all" makes a one-off Dan\'s again: picked, it is the job itself', () => {
    const p = player();
    const was = bankTrip(p, 20);
    p.do({ do: 'notDone', job: was });
    expect(tieFor(C, p.facts, 'Go to the bank', was)).toMatchObject({ same: true });
    const n = adds(p.facts).length;
    p.do({ do: 'saveForLater', line: 'Go to the bank', from: was });
    expect(adds(p.facts)).toHaveLength(n);
  });

  it('a recurring job whose repeat was stopped is one Dan had before: picked, a new one-off carries on from it', () => {
    const p = player().do({ do: 'open' });
    const r = p.live().rhythms.find(x => x.job === 'tank')!;
    p.do({ do: 'stopRhythm', id: r.id });
    p.do({ do: 'saveForLater', line: 'Tank clean', from: 'tank' });
    const j = p.job(p.last())!;
    expect(adds(p.facts).pop()!.from).toBe('tank');
    expect([j.firstStep, j.length, j.doneBy]).toEqual(['Fill the bucket.', 60, 'dan']);
    expect(p.live().rhythms.some(x => x.job === j.id)).toBe(false);
  });

  it('an old save\'s added job, with no tie, reads as before', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Go to the bank'] });
    expect(p.job(p.last())).toEqual({ id: p.last(), name: 'Go to the bank', delve: true, length: 25, doneBy: 'dan' });
  });

  it('suggesting, picking, saving and declining earn nothing (rule 10)', () => {
    const p = player();
    const was = bankTrip(p, 20);
    const before = p.facts.length;
    suggest(C, p.facts, 'bank'); tieFor(C, p.facts, 'bank', was);
    p.do({ do: 'saveForLater', line: 'Go to the bank', from: was }).do({ do: 'declineRepeat', name: 'Go to the bank' });
    expect(p.facts.slice(before).filter(f => EARN.has(f.type))).toEqual([]);
  });
});

describe('The planner learns by name, ticked minutes too (D-136)', () => {
  it('every job of a name shares one history; without content, the job alone', () => {
    const p = player();
    for (const m of [20, 30, 40]) { bankTrip(p, m); p.sleep(24 * 60); }
    p.do({ do: 'open' }).do({ do: 'saveForLater', line: 'Go to  the BANK' });
    const fresh = p.last();
    expect(W.realMinutes(p.facts, fresh, undefined, p.live())).toBe(30);
    expect(W.roomOf(p.job(fresh)!, p.facts, undefined, p.live())).toBe(30);
    expect(W.realMinutes(p.facts, fresh)).toBeNull();
  });

  it('minutes given when ticking a job off teach it, one run each; "No more" adds no run', () => {
    const p = player();
    for (let k = 0; k < 3; k++) {
      p.do({ do: 'open' }).do({ do: 'saveForLater', line: 'Post office' });
      p.do({ do: 'tickOff', job: p.last(), minutes: 45 }).leave();
      p.sleep(24 * 60);
    }
    expect(W.realMinutes(p.facts, p.last(), undefined, p.live())).toBe(45);
    /* a repeating job ticked off three times */
    const q = player();
    for (let k = 0; k < 3; k++) { q.do({ do: 'open' }).do({ do: 'tickOff', job: 'meal', minutes: 90 }).leave(); q.sleep(24 * 60); }
    expect(W.realMinutes(q.facts, 'meal', undefined, q.live())).toBe(90);
    expect(W.realMinutes(q.facts, 'meal')).toBe(90);
  });

  it('good hours follow the name too', () => {
    const p = player('2026-09-24T19:00:00+01:00');
    for (let k = 0; k < 4; k++) { bankTrip(p, 20); p.sleep(24 * 60 - 20); }
    p.do({ do: 'open' }).do({ do: 'saveForLater', line: 'Go to the bank' });
    const fresh = p.last(), clock = p.at.slice(11, 16);
    expect(W.goodHour(p.facts, fresh, clock, undefined, p.live())).toBe(true);
    expect(W.goodHour(p.facts, fresh, clock)).toBeNull();
  });
});

describe('"… keeps coming back. Make it repeat?" (D-136)', () => {
  it('the third time within 28 days, once; "No thanks" never asks again for that name', () => {
    const p = player();
    bankTrip(p, 20); p.sleep(10 * 24 * 60);
    bankTrip(p, 20); p.sleep(10 * 24 * 60);
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
    p.do({ do: 'open' }).do({ do: 'saveForLater', line: 'go to the bank ' });
    const o = repeatOffer(C, p.facts, gameDay(p.at));
    expect(o).toEqual({ name: 'go to the bank', job: p.last() });
    p.do({ do: 'declineRepeat', name: 'Go To The Bank' });
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
    p.do({ do: 'saveForLater', line: 'Go to the bank' });
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
  });

  it('not when the three are spread over more than 28 days (game days, from 04:00)', () => {
    const p = player('2026-09-24T03:30:00+01:00');   /* 03:30: still 23 September's game day */
    p.do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' }).tick();
    expect(adds(p.facts)[0].day).toBe('2026-09-23');
    p.sleep(14 * 24 * 60).do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' }).tick();
    /* 28 days after 23 September's game day began: 21 October, 04:30, out of the window */
    p.sleep(13 * 24 * 60 + 60).do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' }).tick();
    expect(adds(p.facts).map(f => f.day)).toEqual(['2026-09-23', '2026-10-07', '2026-10-21']);
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
    const q = player('2026-09-24T03:30:00+01:00');
    q.do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' }).tick();
    q.sleep(14 * 24 * 60).do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' }).tick();
    q.sleep(13 * 24 * 60 - 60).do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' }).tick();   /* 02:30: 20 October still */
    expect(adds(q.facts).map(f => f.day)).toEqual(['2026-09-23', '2026-10-07', '2026-10-20']);
    expect(repeatOffer(C, q.facts, gameDay(q.at))).not.toBeNull();
  });

  it('not for a name that already repeats; gone once made to repeat', () => {
    const p = player().do({ do: 'open' });
    for (let k = 0; k < 3; k++) p.do({ do: 'addItems', lines: ['Meal prep'] });
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
    for (let k = 0; k < 3; k++) p.do({ do: 'addItems', lines: ['Water the plants'] });
    const o = repeatOffer(C, p.facts, gameDay(p.at))!;
    expect(o.name).toBe('Water the plants');
    p.do({ do: 'saveJob', job: { ...p.job(o.job)!, doneBy: 'enough' }, rhythm: { id: 'r-plants', job: o.job, times: 2 } });
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
  });

  it('not when every job of that name is deleted; the job it opens is one still to do', () => {
    const p = player().do({ do: 'open' });
    const ids: string[] = [];
    for (let k = 0; k < 3; k++) { p.do({ do: 'saveForLater', line: `Water the plants ${k}` }); }
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();   /* three different names */
    bankTrip(p, 20); ids.push(p.last());
    p.do({ do: 'addItems', lines: ['Go to the bank'] }); ids.push(p.last());
    p.do({ do: 'addItems', lines: ['Go to the bank'] }); ids.push(p.last());
    p.do({ do: 'tickOff', job: ids[2], minutes: 15 }).leave();
    expect(repeatOffer(C, p.facts, gameDay(p.at))!.job).toBe(ids[1]);
    for (const id of ids) p.do({ do: 'removeJob', id });
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
  });
});

describe('The fresh review of D-136', () => {
  it('a job of the starting set done after it was suggested is finished: a new one is added, not the old delved again', () => {
    const p = player().do({ do: 'open' });
    expect(suggest(C, p.facts, 'sort the post')[0]).toMatchObject({ same: true, job: { id: 'post' } });
    p.do({ do: 'tickOff', job: 'post', minutes: 15 }).leave();
    expect(tieFor(C, p.facts, 'Sort the post')).toMatchObject({ same: false, job: { id: 'post' } });
    p.do({ do: 'delveNow', line: 'Sort the post' });
    expect(p.view().run?.job.id).not.toBe('post');
    expect(adds(p.facts).pop()!.from).toBe('post');
  });

  it('a tick "on top of" delved minutes teaches one run of the whole sitting', () => {
    const p = player();
    for (let k = 0; k < 3; k++) {
      p.do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' });
      const id = p.last();
      p.do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(15).do({ do: 'finishHere' }).leave();
      p.do({ do: 'tickOff', job: id, minutes: 15 }).leave();
      p.sleep(24 * 60);
    }
    expect(W.realMinutes(p.facts, p.last(), undefined, p.live())).toBe(30);
    /* taken back and ticked again: one sitting still */
    const q = player().do({ do: 'open' }).do({ do: 'tickOff', job: 'meal', minutes: 30 }).leave();
    q.do({ do: 'notDone', job: 'meal' }).do({ do: 'tickOff', job: 'meal', minutes: 30 }).leave();
    for (let k = 0; k < 2; k++) { q.sleep(24 * 60).do({ do: 'open' }).do({ do: 'tickOff', job: 'meal', minutes: 60 }).leave(); }
    expect(W.realMinutes(q.facts, 'meal', undefined, q.live())).toBe(60);
  });

  it('a name once made to repeat, then stopped, is not offered again', () => {
    const p = player().do({ do: 'open' });
    for (let k = 0; k < 3; k++) p.do({ do: 'addItems', lines: ['Water the plants'] });
    const o = repeatOffer(C, p.facts, gameDay(p.at))!;
    p.do({ do: 'saveJob', job: { ...p.job(o.job)!, doneBy: 'enough' }, rhythm: { id: 'r-plants', job: o.job, times: 2 } });
    p.do({ do: 'stopRhythm', id: 'r-plants' });
    expect(repeatOffer(C, p.facts, gameDay(p.at))).toBeNull();
  });

  it('a bulleted line is the same line for both buttons', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Buy stamps' });
    expect(tieFor(C, p.facts, '- Buy stamps')).toMatchObject({ same: true });
    p.do({ do: 'delveNow', line: '• Buy stamps' });
    expect(adds(p.facts)).toHaveLength(1);
    expect(p.view().run?.job.id).toBe(p.last());
  });

  it('a finished job picked while one of its name is still to do: that one, never a third', () => {
    const p = player();
    const was = bankTrip(p, 20);
    p.do({ do: 'addItems', lines: ['Go to the bank'] });   /* by Siri or the Week meanwhile: never tied */
    const still = p.last();
    expect(tieFor(C, p.facts, 'Go to the bank', was)).toMatchObject({ same: true, job: { id: still } });
    p.do({ do: 'saveForLater', line: 'Go to the bank', from: was });
    expect(p.last()).toBe(still);
  });

  it('apostrophes: curly and straight alike; never the middle of a word', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Wash Dan’s car' });
    expect(suggest(C, p.facts, 's car')).toEqual([]);
    expect(suggest(C, p.facts, "dan's").map(x => x.job.name)).toEqual(['Wash Dan’s car']);
    p.do({ do: 'saveForLater', line: "Wash Dan's car" });
    expect(adds(p.facts)).toHaveLength(1);
  });

  it('a job named like an id never shares another job\'s learning', () => {
    const p = player().do({ do: 'open' }).do({ do: 'saveForLater', line: 'Bank' });
    const id = p.last();
    for (let k = 0; k < 3; k++) p.do({ do: 'startRun', job: id, minutes: 30, count: 1 }).wait(30).leave();
    expect(W.realMinutes(p.facts, id)).toBe(30);
    p.do({ do: 'saveForLater', line: `#${id}` });
    expect(W.realMinutes(p.facts, p.last(), undefined, p.live())).toBeNull();
    expect(W.realMinutes(p.facts, id)).toBe(30);
  });
});

