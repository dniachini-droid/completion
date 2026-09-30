/**
 * "Waiting on…" (Dan, D-137): a one-off Dan can't finish until someone replies leaves Today and the Satchel's lists, waits
 * in the Satchel's own Waiting, and comes back to Today on its day asking "Did they reply?": Back to it, Still waiting
 * (a new date), It's done (ticked off). Waiting earns nothing and costs nothing; minutes delved before it are kept.
 * Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, satchelView, see, settle, tomorrowFirst, type Command } from '../../src/core/game';
import { waitingOf, planOf } from '../../src/core/week';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';

/* 2026-09-24 is a Thursday */
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
    satchel() { return satchelView(C, facts, at()); },
    at,
    leave() { const e = see(facts, C, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq }); return this; },
    delve(job: string, min: number, len = 30) { return this.do({ do: 'startRun', job, minutes: len, count: 1 }).wait(min).do({ do: 'finishHere' }); },
  };
}
const steps = (facts: Fact[], job: string) =>
  facts.filter((f): f is FactOf<'stepsGained'> => f.type === 'stepsGained' && f.job === job).reduce((a, f) => a + f.minutes, 0);
const dones = (facts: Fact[], job: string) => facts.filter((f): f is FactOf<'jobDone'> => f.type === 'jobDone' && f.job === job);
const onToday = (p: ReturnType<typeof player>, job: string) => p.view().slate.includes(job) || p.view().order.includes(job);
const DAY = 24 * 60;

describe('Waiting on… (D-137)', () => {
  it('a one-off waiting leaves Today and the Satchel\'s lists, and sits in Waiting with its line', () => {
    const p = player().do({ do: 'open' });
    expect(onToday(p, 'cat')).toBe(true);
    const n = p.facts.length;
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-27', who: '  the vet  ' });
    expect(p.facts.slice(n).filter(f => f.type === 'waitSet')).toMatchObject([{ job: 'cat', until: '2026-09-27', who: 'the vet' }]);
    expect(onToday(p, 'cat')).toBe(false);
    expect(p.view().line).not.toContain('cat');
    expect(p.view().replies).toEqual([]);
    const s = p.satchel();
    expect(s.noDay.map(j => j.id)).not.toContain('cat');
    expect(s.coming.map(x => x.job.id)).not.toContain('cat');
    expect(s.waiting.map(x => [x.job.id, x.until, x.who])).toEqual([['cat', '2026-09-27', 'the vet']]);
  });

  it('waiting earns nothing and costs nothing: no minutes, no story, the road where it was', () => {
    const p = player().do({ do: 'open' });
    const walked = p.view().walked, n = p.facts.length;
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-27' });
    expect(p.facts.slice(n).map(f => f.type).filter(t => t !== 'planChanged' && t !== 'firstChosen')).toEqual(['waitSet']);
    expect(p.view().walked).toBe(walked);
    p.sleep(3 * DAY).do({ do: 'open' }).do({ do: 'backToIt', job: 'cat' });
    expect(p.view().walked).toBe(walked);
    expect(p.facts.some(f => f.type === 'stepsGained' || f.type === 'jobDone')).toBe(false);
  });

  it('on its day it comes back to Today, under the list, never on the finish line; an unanswered one stays', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-26', who: 'the vet' });
    p.sleep(DAY).do({ do: 'open' });
    expect(p.view().replies).toEqual([]);
    p.sleep(DAY).do({ do: 'open' });
    expect(p.view().day).toBe('2026-09-26');
    expect(p.view().replies).toEqual([{ job: 'cat', until: '2026-09-26', who: 'the vet' }]);
    expect(p.view().slate).not.toContain('cat');
    expect(p.view().line).not.toContain('cat');
    expect(p.satchel().waiting).toEqual([]);
    expect(p.satchel().noDay.map(j => j.id)).not.toContain('cat');
    /* nothing answered: the next day it is still there, with no mark against it */
    p.sleep(DAY).do({ do: 'open' });
    expect(p.view().replies.map(r => r.job)).toEqual(['cat']);
  });

  it('the day turns at 04:00: waiting until Saturday, it comes back at 04:00 on Saturday, not at midnight', () => {
    const p = player('2026-09-24T22:00:00+01:00').do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-26' });
    p.sleep(DAY + 5 * 60 + 30);   /* 03:30 on Saturday: still Friday's game day */
    expect(p.at().slice(0, 16)).toBe('2026-09-26T03:30');
    expect(p.view().replies).toEqual([]);
    p.sleep(60);
    expect(p.view().replies.map(r => r.job)).toEqual(['cat']);
  });

  it('only a later day: today or a past day, a bad date, a recurring job, a finished one-off or a stopped job is refused', () => {
    const p = player().do({ do: 'open' });
    const n = p.facts.length;
    for (const until of ['2026-09-24', '2026-09-20', 'soon', '2026-9-30']) p.do({ do: 'waitOn', job: 'cat', until });
    p.do({ do: 'waitOn', job: 'gym', until: '2026-09-27' });
    p.do({ do: 'waitOn', job: 'no-such-job', until: '2026-09-27' });
    expect(p.facts).toHaveLength(n);
    p.do({ do: 'tickOff', job: 'post', minutes: 15 });
    const m = p.facts.length;
    p.do({ do: 'waitOn', job: 'post', until: '2026-09-27' });
    expect(p.facts).toHaveLength(m);
  });

  it('never while its own delve runs or its end waits for an answer; another job\'s delve doesn\'t stop it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(5);
    const n = p.facts.length;
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-27' });
    expect(p.facts).toHaveLength(n);
    p.do({ do: 'finishHere' });
    const m = p.facts.length;
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-27' });
    expect(p.facts).toHaveLength(m);
    p.leave().do({ do: 'startRun', job: 'post', minutes: 30, count: 1 }).wait(2).do({ do: 'waitOn', job: 'cat', until: '2026-09-27' });
    expect(waitingOf(p.facts).has('cat')).toBe(true);
  });

  it('"Still waiting": a new date, the line kept; it leaves Today until then', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-25', who: 'the vet' });
    p.sleep(DAY).do({ do: 'open' });
    expect(p.view().replies.map(r => r.job)).toEqual(['cat']);
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-29' });
    expect(p.view().replies).toEqual([]);
    expect(p.satchel().waiting.map(x => [x.job.id, x.until, x.who])).toEqual([['cat', '2026-09-29', 'the vet']]);
    /* the same date and line again writes nothing */
    const n = p.facts.length;
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-29' });
    expect(p.facts).toHaveLength(n);
  });

  it('"Back to it" on its day: an ordinary job again, on today\'s list', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-25' });
    p.sleep(DAY).do({ do: 'open' }).do({ do: 'backToIt', job: 'cat' });
    expect(waitingOf(p.facts).has('cat')).toBe(false);
    expect(p.view().replies).toEqual([]);
    expect(p.view().slate).toContain('cat');
    expect(p.satchel().noDay.map(j => j.id)).not.toContain('cat');
  });

  it('"Back to it" from the Satchel before its day: with no day yet', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-28' }).do({ do: 'backToIt', job: 'cat' });
    expect(p.satchel().waiting).toEqual([]);
    expect(p.satchel().noDay.map(j => j.id)).toContain('cat');
    /* not waiting: nothing to go back to */
    const n = p.facts.length;
    p.do({ do: 'backToIt', job: 'cat' });
    expect(p.facts).toHaveLength(n);
  });

  it('"Back to it" just after waiting from Today (today): back on today\'s list, whatever its day', () => {
    const p = player().do({ do: 'open' }).do({ do: 'putOnDay', job: 'post', day: '2026-09-24' });
    expect(p.view().slate).toContain('post');
    p.do({ do: 'waitOn', job: 'post', until: '2026-09-28' });
    expect(p.view().slate).not.toContain('post');
    p.do({ do: 'backToIt', job: 'post', today: true });
    expect(p.view().slate).toContain('post');
    expect(p.satchel().waiting).toEqual([]);
  });

  it('"It\'s done" (ticked off): done, the wait over, its minutes counted once, with the minutes delved before it', () => {
    const p = player().do({ do: 'open' }).delve('cat', 12).leave();
    expect(steps(p.facts, 'cat')).toBe(12);
    p.do({ do: 'waitOn', job: 'cat', until: '2026-09-26', who: 'the vet' });
    p.sleep(2 * DAY).do({ do: 'open' });
    expect(p.view().replies.map(r => r.job)).toEqual(['cat']);
    p.do({ do: 'tickOff', job: 'cat', minutes: 0 });
    expect(dones(p.facts, 'cat').map(d => d.minutes)).toEqual([12]);
    expect(steps(p.facts, 'cat')).toBe(12);
    expect(waitingOf(p.facts).has('cat')).toBe(false);
    expect(p.view().replies).toEqual([]);
    expect(p.view().done.has('cat')).toBe(true);
    /* "Not done after all" makes it a job to do again, not a wait */
    p.do({ do: 'notDone', job: 'cat' });
    expect(waitingOf(p.facts).has('cat')).toBe(false);
    expect(p.view().replies).toEqual([]);
  });

  it('carry (D-133): the minutes delved before waiting are kept; the next delve carries on from them', () => {
    const p = player().do({ do: 'open' }).delve('cat', 12).leave().do({ do: 'waitOn', job: 'cat', until: '2026-09-26' });
    p.sleep(2 * DAY).do({ do: 'open' }).do({ do: 'backToIt', job: 'cat' });
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(3);
    expect(p.view().run).toMatchObject({ carried: 12 });
    p.do({ do: 'done', job: 'cat' });
    expect(dones(p.facts, 'cat').map(d => d.minutes)).toEqual([15]);
    expect(steps(p.facts, 'cat')).toBe(15);
  });

  it('a delve begun on a waiting job ends the wait (it is being worked on)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-28' });
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(waitingOf(p.facts).has('cat')).toBe(false);
    expect(p.view().run?.job.id).toBe('cat');
  });

  it('put on a day by hand ends the wait; the planner never lays a waiting job out', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'post', until: '2026-10-08' });
    p.do({ do: 'planWeek', week: '2026-09-21' });
    expect((planOf(p.facts, '2026-09-21') ?? []).some(e => e.job === 'post')).toBe(false);
    p.do({ do: 'putOnDay', job: 'post', day: '2026-09-26' });
    expect(waitingOf(p.facts).has('post')).toBe(false);
    expect(p.satchel().coming.map(x => x.job.id)).toContain('post');
  });

  it('waiting takes it off every day it was put on, and off tomorrow\'s first job', () => {
    const p = player().do({ do: 'open' }).do({ do: 'putOnDay', job: 'post', day: '2026-09-26' }).do({ do: 'firstJob', job: 'cat' });
    expect(tomorrowFirst(C, p.facts, p.at()).job).toBe('cat');
    p.do({ do: 'waitOn', job: 'post', until: '2026-10-01' }).do({ do: 'waitOn', job: 'cat', until: '2026-10-01' });
    expect(p.satchel().coming.map(x => x.job.id)).not.toContain('post');
    expect(tomorrowFirst(C, p.facts, p.at()).job).not.toBe('cat');
    p.sleep(DAY).do({ do: 'open' });
    expect(onToday(p, 'cat')).toBe(false);
    p.sleep(DAY).do({ do: 'open' });
    expect(onToday(p, 'post')).toBe(false);
  });

  it('a waiting job never holds the day back: the list done, the day is done with it unanswered', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-25' });
    p.sleep(DAY).do({ do: 'open' });
    const v = p.view();
    expect(v.replies.map(r => r.job)).toEqual(['cat']);
    for (const id of v.line) p.do({ do: 'tickOff', job: id, minutes: 30 });
    expect(p.view().complete).toBe(true);
  });

  it('deleted and brought back by Undo, it is still waiting; made a recurring job, it no longer waits', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-28' });
    const job = p.view().content.jobs.find(j => j.id === 'cat')!;
    p.do({ do: 'removeJob', id: 'cat' });
    expect(p.satchel().waiting).toEqual([]);
    p.do({ do: 'saveJob', job, rhythm: null });
    expect(p.satchel().waiting.map(x => x.job.id)).toEqual(['cat']);
    p.do({ do: 'saveJob', job, rhythm: { id: 'r-cat', job: 'cat', times: 1 } });
    expect(waitingOf(p.facts).has('cat')).toBe(false);
    expect(p.satchel().waiting).toEqual([]);
  });

  it('old saves: with no wait in them, nothing waits and nothing changes', () => {
    const p = player().do({ do: 'open' }).delve('cat', 10).leave().sleep(DAY).do({ do: 'open' });
    expect(waitingOf(p.facts).size).toBe(0);
    expect(p.view().replies).toEqual([]);
    expect(p.satchel().waiting).toEqual([]);
    const facts = p.facts.slice(), again = see(facts, C, p.at());
    expect(again.slate).toEqual(p.view().slate);
  });

  it('the line is a few words: trimmed and cut at 60 characters', () => {
    const p = player().do({ do: 'open' }).do({ do: 'waitOn', job: 'cat', until: '2026-09-27', who: 'x'.repeat(90) });
    expect(p.satchel().waiting[0].who).toHaveLength(60);
    p.do({ do: 'waitOn', job: 'post', until: '2026-09-27', who: '   ' });
    expect(p.satchel().waiting.find(x => x.job.id === 'post')!.who).toBeUndefined();
  });
});

void settle;
