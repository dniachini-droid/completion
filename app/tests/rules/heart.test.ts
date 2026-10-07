import { describe, expect, it } from 'vitest';
import { act, daySize, presetRun, see, settle, type Command } from '../../src/core/game';
import type { Fact } from '../../src/core/types';
import * as W from '../../src/core/week';
import { content as C } from '../../src/content/world';

/** A tiny player: a log, and a phone clock on the same day in British Summer Time. */
function player(start = '2026-09-24T09:00:00+01:00') {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    /** Time passing with the app asleep in the background: nothing is settled until it wakes. */
    sleep(min: number) { now += min * 60_000; return this; },
    get ms() { return now; },
    view() { return see(facts, C, at()); },
    /** A job worked on, as every job is (D-117): a delve to its enough, then said done if that didn't do it. */
    did(job: string) {
      const j = see(facts, C, at()).content.jobs.find(x => x.id === job), m = Math.min(90, j?.enoughAt ?? j?.length ?? 25);
      this.do({ do: 'startRun', job, minutes: m, count: 1 }).wait(m + 1);
      if (!see(facts, C, at()).done.has(job)) this.do({ do: 'done', job });
      return this;
    },
    types() { return facts.map(f => f.type); },
  };
}

describe('Today', () => {
  it('the first opening lays the week out, and Today is the day’s plan; the first job is next (D-080)', () => {
    const v = player().do({ do: 'open' }).view();
    expect(v.size).toBeLessThanOrEqual(3);
    const planned = W.weekOf(v.content, [], '2026-09-21', v.day) && W.plannedToday(v.content, player().do({ do: 'open' }).facts, v.day, '09:00').map(p => p.job);
    expect([...v.slate].sort()).toEqual([...planned].sort());
    expect(v.next).toEqual({ job: v.slate[0], mode: 'begin' });
    expect(v.here.id).toBeNull();   /* before the first place: the way in */
  });
  it('day sizes (a week not laid out): Low 2, Normal 3, High 5; never lowered for opening late (D-130)', () => {
    expect(daySize('low')).toBe(2);
    expect(daySize('normal')).toBe(3);
    expect(daySize('high')).toBe(5);
  });
  it('Swap brings in the next job of the day', () => {
    const p = player().do({ do: 'open' });
    const [a, b] = p.view().slate;
    p.do({ do: 'swap' });
    expect(p.view().next?.job).toBe(b);
    expect(p.view().slate).toContain(a);
  });
  it('a one-off opens at one delve of 30 minutes (D-124); a recurring job at the minutes Dan set for it (D-146)', () => {
    for (const j of C.jobs) {
      const p = presetRun(j, C);
      if (C.rhythms.some(r => r.job === j.id)) expect(p.minutes * p.count, j.id).toBe(j.length);
      else expect(p, j.id).toEqual({ minutes: 30, count: 1 });
    }
  });
});

describe('the heart: open → Begin → delve → back → Done → the step → day complete → arrival', () => {
  it('plays a whole Normal day and arrives at a named place', () => {
    const p = player().do({ do: 'open' });
    /* the cat's medication: one delve, then "Is it done?" */
    p.do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(10);
    expect(p.view().run).toMatchObject({ phase: 'delve', k: 1 });
    p.wait(20);
    expect(p.view().runEnd).toMatchObject({ ask: true, minutes: 25 });
    p.do({ do: 'done', job: 'cat', keepEnd: true }).do({ do: 'seen', what: 'step', ref: p.view().runEnd!.seq });   /* answered on the delve's end */
    expect(p.view().done.has('cat')).toBe(true);
    /* the Course: its hour is two delves of 25; it's done at enough */
    p.do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(60);
    expect(p.view().runEnd).toMatchObject({ enough: true, minutes: 50 });
    p.do({ do: 'seen', what: 'step', ref: p.view().runEnd!.seq });
    /* 75 minutes in: the first place plays the moment it is reached, mid-day (D-073) */
    const v = p.view();
    expect(v.complete).toBe(false);
    expect(v.walked).toBe(75);
    expect(v.arrival).toMatchObject({ kind: 'place', id: 'b-1.A', completedDay: false });
    expect(v.here.id).toBeNull();   /* revealed on the arrival's own screen, not before */
    p.do({ do: 'seen', what: 'arrival', ref: v.arrival!.seq });
    /* the gym, a delve like every job (D-117): its hour, done at its enough. Three jobs done, but the Spanish lesson is
       still on today's list, so the day is not done: no hidden count (D-130) */
    p.do({ do: 'startRun', job: 'gym', minutes: 30, count: 2 }).wait(70);
    expect(p.view().complete).toBe(false);
    expect(p.view().next).toEqual({ job: 'lesson', mode: 'begin' });
    /* the lesson, the list's last job, completes the day, with no camp (a place was reached today) */
    p.do({ do: 'startRun', job: 'lesson', minutes: 30, count: 1 }).wait(31);
    expect(p.view().complete).toBe(true);
    expect(p.view().walked).toBe(165);
    expect(p.view().arrival).toBeNull();
    expect(p.view().here.id).toBe('b-1.A');
    expect(p.view().next).toBeNull();
  });
  it('a short day ends nowhere by itself; Go to sleep is where Dan camps (D-160)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' });
    p.did('gym').did('tank');
    expect(p.view().walked).toBe(120);
    /* 120 minutes passes the first place (75): a named place */
    expect(p.view().arrival?.kind).toBe('place');
    /* today's whole list done in short delves, short of the first place: nothing happens, nothing is said */
    const q = player().do({ do: 'open' });
    for (const job of q.view().line) {
      q.do({ do: 'startRun', job, minutes: 15, count: 1 }).wait(15);
      if (!q.view().done.has(job)) q.do({ do: 'done', job });
    }
    expect(q.view().walked).toBe(60);
    expect(q.view().arrival).toBeNull();
    expect(q.types()).not.toContain('dayCompleted');
    /* asleep before the first place: no camp yet (he is still at the ladder's foot), and nothing else */
    q.do({ do: 'goodnight' });
    expect(q.facts.some(f => f.type === 'arrived')).toBe(false);
    /* asleep soon after a place: he camps at it */
    p.do({ do: 'seen', what: 'arrival', ref: p.view().arrival!.seq }).do({ do: 'goodnight' });
    expect(p.view().arrival).toMatchObject({ kind: 'camp', campAt: true, id: p.view().here.id });
    /* the next day starts there: nothing moved */
    expect(p.view().here.id).toBe(p.view().arrival!.id);
  });
  it('asleep again at the same place: a view of that place if it has one, else the place; never anywhere else (D-160)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' });
    p.did('gym').did('tank');
    for (const a of p.facts.filter(f => f.type === 'arrived')) p.do({ do: 'seen', what: 'arrival', ref: a.seq });
    const here = p.view().here.id!;
    p.do({ do: 'goodnight' });
    const a = p.view().arrival!;
    expect(a.kind).toBe('camp');
    const view = C.story.camps.find(c => c.id === a.id);
    if (view) expect(view.near).toBe(here); else expect(a.id).toBe(here);
    expect(p.view().here.id).toBe(here);
  });
  it('Done with no delve is recorded as afterwards; a delve to its enough counts as from the app (D-117)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'done', job: 'gym' });
    expect(p.facts.find(f => f.type === 'jobBegun')).toMatchObject({ job: 'gym', from: 'record' });
    const q = player().do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 30, count: 2 }).wait(70);
    expect(q.facts.filter(f => f.type === 'jobBegun')).toEqual([expect.objectContaining({ job: 'gym', from: 'app' })]);
    expect(q.view().done.has('gym')).toBe(true);
  });
  it('"Not today" on the list’s last job to do leaves the list done, and ends nothing (D-130, D-160)', () => {
    const p = player().do({ do: 'open' }).did('cat').did('gym').did('course');
    expect(p.view().complete).toBe(false);
    p.do({ do: 'setAside', job: 'lesson' });
    expect(p.view().complete).toBe(true);
    expect(p.types()).not.toContain('dayCompleted');
    expect(p.facts.some(f => f.type === 'arrived' && f.kind === 'camp')).toBe(false);
  });
  it("a delve begun before 04:00 and answered after: Done answers it, and it stays answered (Dan's report)", () => {
    const p = player('2026-09-24T23:30:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['a job of his own'] });
    const id = (p.facts[p.facts.length - 1] as { id: string }).id;
    p.do({ do: 'startRun', job: id, minutes: 25, count: 1 }).sleep(8 * 60).wait(0).do({ do: 'open' });
    expect(p.view().runEnd).toMatchObject({ ask: true });
    p.do({ do: 'done', job: id, keepEnd: true });   /* answered on the delve's end */
    expect(p.view().done.has(id)).toBe(true);
    expect(p.view().runEnd).toMatchObject({ ask: false });
  });
  it('Step away keeps the minutes; Today offers Carry on; Finish here counts every minute, and the session (D-121)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(12).do({ do: 'stepAway' }).wait(120);
    expect(p.view().next).toEqual({ job: 'course', mode: 'carry' });
    expect(p.view().run).toMatchObject({ phase: 'held', leftMs: 13 * 60_000 });
    p.do({ do: 'resume' }).wait(3).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ minutes: 15, how: 'finishedHere', enough: true });
    expect(p.view().walked).toBe(15);
    expect(p.view().done.has('course')).toBe(true);
  });
  it('going into another app pauses the delve where Dan left; the time away does not count (D-094)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(10);
    const left = p.ms;
    p.sleep(40).do({ do: 'away', from: left, to: p.ms });
    expect(p.view().run).toMatchObject({ phase: 'held', k: 1, doneMs: 10 * 60_000, leftMs: 15 * 60_000, away: true });
    expect(p.facts.filter(f => f.type === 'stepsGained')).toHaveLength(0);
    expect(p.facts.find(f => f.type === 'delveHeld')!.at).toBe('2026-09-24T09:10:00+01:00');
    expect(p.view().next).toEqual({ job: 'course', mode: 'carry' });
    /* Carry on: the delve goes on from where it was */
    p.do({ do: 'resume' }).wait(5);
    expect(p.view().run).toMatchObject({ phase: 'delve', doneMs: 15 * 60_000, away: false });
  });
  it('left in a breather: the delve after it waits, and the delve before it keeps its step (D-094)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(27);
    const left = p.ms;
    p.sleep(30).do({ do: 'away', from: left, to: p.ms });
    expect(p.view().run).toMatchObject({ phase: 'held', k: 2, doneMs: 0, away: true });
    expect(p.facts.filter(f => f.type === 'stepsGained').map(f => f.minutes)).toEqual([25]);
  });
  it('back before the breather ran out, or while paused by hand: nothing changes', () => {
    const a = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(26);
    const left = a.ms, n = a.facts.length;
    a.sleep(2).do({ do: 'away', from: left, to: a.ms });
    expect(a.facts).toHaveLength(n);
    expect(a.view().run).toMatchObject({ phase: 'breather' });
    const b = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(5).do({ do: 'stepAway' });
    const bl = b.ms;
    b.sleep(20).do({ do: 'away', from: bl, to: b.ms });
    expect(b.facts.filter(f => f.type === 'delveHeld')).toHaveLength(1);
    expect(b.view().run).toMatchObject({ phase: 'held', away: false });
  });
  it('away for hours: the delve finishes where Dan left, every minute before it kept', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(10);
    const left = p.ms;
    p.sleep(5 * 60).do({ do: 'away', from: left, to: p.ms });
    expect(p.view().run).toBeNull();
    expect(p.view().runEnd).toMatchObject({ minutes: 10, how: 'finishedHere' });
  });
  it('the clock settles a run that ended while the phone was locked, stamped when it really ended', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 });
    p.wait(8 * 60);
    const ended = p.facts.find(f => f.type === 'delveEnded')!;
    expect(ended.at).toBe('2026-09-24T09:55:00+01:00');
    expect(p.facts.filter(f => f.type === 'stepsGained').map(f => f.at)).toEqual(['2026-09-24T09:25:00+01:00', '2026-09-24T09:55:00+01:00']);
  });
  it('settling twice adds nothing', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(40);
    expect(settle(p.facts, C, '2026-09-24T10:00:00+01:00')).toEqual([]);
  });
  it('a delve running across 04:00 belongs to the day it began', () => {
    const p = player('2026-09-25T03:50:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(30);
    expect(p.facts.find(f => f.type === 'stepsGained')!.day).toBe('2026-09-24');
  });
  it('Keep going after day complete still arrives at the next place (no dead ends for effort)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' }).did('gym').did('tank');
    const first = p.view().arrival!; p.do({ do: 'seen', what: 'arrival', ref: first.seq });
    p.do({ do: 'startRun', job: 'spanish', minutes: 60, count: 3 }).wait(200);
    expect(p.view().walked).toBe(300);
    /* the second place along the hall (the route walked as a journey, D-154) */
    expect(p.view().arrival).toMatchObject({ kind: 'place', id: 'pl-w1-below-the-lamp', completedDay: false });
  });
  it('splitting work earns nothing extra: steps are time', () => {
    const a = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(60);
    const b = player().do({ do: 'open' });
    for (let i = 0; i < 5; i++) b.do({ do: 'startRun', job: 'course', minutes: 25, count: 1 }).wait(10).do({ do: 'finishHere' }).do({ do: 'seen', what: 'step', ref: b.view().runEnd!.seq });
    expect(b.view().walked).toBe(a.view().walked);
  });
});
