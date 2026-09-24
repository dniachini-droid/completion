import { describe, expect, it } from 'vitest';
import { act, daySize, presetRun, see, settle, type Command } from '../../src/core/game';
import type { Fact } from '../../src/core/types';
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
    view() { return see(facts, C, at()); },
    types() { return facts.map(f => f.type); },
  };
}

describe('Today', () => {
  it('a Normal day holds three jobs; the first is next', () => {
    const v = player().do({ do: 'open' }).view();
    expect(v.size).toBe(3);
    expect(v.slate).toEqual(['course', 'gym', 'spanish']);
    expect(v.next).toEqual({ job: 'course', mode: 'begin' });
    expect(v.here.id).toBeNull();   /* before the first place: the way in */
  });
  it('day sizes: Low 2, Normal 3, High 5; opened late, one fewer; in the evening, one', () => {
    expect(daySize('low', '2026-09-24T09:00:00+01:00')).toBe(2);
    expect(daySize('high', '2026-09-24T09:00:00+01:00')).toBe(5);
    expect(daySize('normal', '2026-09-24T14:30:00+01:00')).toBe(2);
    expect(daySize('high', '2026-09-24T19:10:00+01:00')).toBe(1);
    expect(daySize('normal', '2026-09-25T02:00:00+01:00')).toBe(1);
  });
  it('Swap brings in a job from beyond the slate', () => {
    const p = player().do({ do: 'open' }).do({ do: 'swap' });
    expect(p.view().slate).toEqual(['lesson', 'gym', 'spanish']);
    expect(p.view().next?.job).toBe('lesson');
  });
  it('a job that takes hours opens set to its enough', () => {
    expect(presetRun(C.jobs.find(j => j.id === 'course')!)).toEqual({ minutes: 25, count: 2 });
    expect(presetRun(C.jobs.find(j => j.id === 'spanish')!)).toEqual({ minutes: 30, count: 2 });
    expect(presetRun(C.jobs.find(j => j.id === 'cat')!)).toEqual({ minutes: 25, count: 1 });
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
    p.do({ do: 'done', job: 'cat' }).do({ do: 'seen', what: 'step', ref: p.view().runEnd!.seq });
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
    /* the gym: Begin marks it under way; Done plays its hour and completes the day, with no camp (a place was reached) */
    p.do({ do: 'begin', job: 'gym' });
    expect(p.view().next).toEqual({ job: 'gym', mode: 'underWay' });
    p.wait(70).do({ do: 'done', job: 'gym' });
    expect(p.view().complete).toBe(true);
    expect(p.view().walked).toBe(135);
    expect(p.view().arrival).toBeNull();
    expect(p.view().here.id).toBe('b-1.A');
    expect(p.view().next).toBeNull();
  });
  it('a short day still arrives: a camp with a view', () => {
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' });
    p.do({ do: 'done', job: 'gym' }).do({ do: 'done', job: 'tank' });
    expect(p.view().walked).toBe(120);
    /* 120 minutes passes the first place (75): a named place */
    expect(p.view().arrival?.kind).toBe('place');
    const q = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' });
    q.do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(25).do({ do: 'done', job: 'cat' });
    q.do({ do: 'startRun', job: 'post', minutes: 25, count: 1 }).wait(25).do({ do: 'done', job: 'post' });
    expect(q.view().arrival).toMatchObject({ kind: 'camp', completedDay: true });
    expect(q.view().arrival!.look).toBeTruthy();   /* a camp always has one thing to look at */
    expect(q.view().here.id).toBeNull();
  });
  it('Done with no Begin is recorded as afterwards; Begin then Done as from the app', () => {
    const p = player().do({ do: 'open' }).do({ do: 'done', job: 'gym' });
    expect(p.facts.find(f => f.type === 'jobBegun')).toMatchObject({ job: 'gym', from: 'record' });
    const q = player().do({ do: 'open' }).do({ do: 'begin', job: 'gym' }).do({ do: 'done', job: 'gym' });
    expect(q.facts.filter(f => f.type === 'jobBegun')).toEqual([expect.objectContaining({ job: 'gym', from: 'app' })]);
  });
  it('lowering capacity can complete the day, and day complete locks in', () => {
    const p = player().do({ do: 'open' }).do({ do: 'done', job: 'gym' }).do({ do: 'done', job: 'tank' });
    expect(p.view().complete).toBe(false);
    p.do({ do: 'capacity', capacity: 'low' });
    expect(p.view().complete).toBe(true);
    p.do({ do: 'capacity', capacity: 'high' });
    expect(p.view().complete).toBe(true);
    expect(p.types().filter(t => t === 'dayCompleted')).toHaveLength(1);
  });
  it('Step away keeps the minutes; Today offers Carry on; Finish here counts every minute', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(12).do({ do: 'stepAway' }).wait(120);
    expect(p.view().next).toEqual({ job: 'course', mode: 'carry' });
    expect(p.view().run).toMatchObject({ phase: 'held', leftMs: 13 * 60_000 });
    p.do({ do: 'resume' }).wait(3).do({ do: 'finishHere' });
    expect(p.view().runEnd).toMatchObject({ minutes: 15, how: 'finishedHere', enough: false });
    expect(p.view().walked).toBe(15);
    expect(p.view().done.has('course')).toBe(false);
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
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' }).do({ do: 'done', job: 'gym' }).do({ do: 'done', job: 'tank' });
    const first = p.view().arrival!; p.do({ do: 'seen', what: 'arrival', ref: first.seq });
    p.do({ do: 'startRun', job: 'spanish', minutes: 60, count: 3 }).wait(200);
    expect(p.view().walked).toBe(300);
    expect(p.view().arrival).toMatchObject({ kind: 'place', id: 'b-1.B', completedDay: false });
  });
  it('splitting work earns nothing extra: steps are time', () => {
    const a = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 25, count: 2 }).wait(60);
    const b = player().do({ do: 'open' });
    for (let i = 0; i < 5; i++) b.do({ do: 'startRun', job: 'course', minutes: 25, count: 1 }).wait(10).do({ do: 'finishHere' }).do({ do: 'seen', what: 'step', ref: b.view().runEnd!.seq });
    expect(b.view().walked).toBe(a.view().walked);
  });
});
