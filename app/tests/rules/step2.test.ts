/**
 * The UI tidy's step 2 and what came with it (D-131): the Satchel as the one place for every job not on today; Tonight's
 * "Tomorrow starts with"; the planner learning real minutes and good hours; the 7-hour planning room with a 3-hour
 * finish line; "Not done after all". Ids only: no story text here.
 */
import { describe, expect, it } from 'vitest';
import { act, satchelView, see, settle, tomorrowFirst, type Command } from '../../src/core/game';
import * as W from '../../src/core/week';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import * as S from '../../src/core/story';
import { sim } from './sim';

function player(start = '2026-09-28T09:00:00+01:00', from: Fact[] = []) {   /* a Monday */
  let facts: Fact[] = from.slice();
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    get at() { return at(); },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    /** a delve of so many minutes, run out, then said done if that didn't do it */
    did(job: string, min = 25) {
      this.do({ do: 'startRun', job, minutes: min, count: 1 }).wait(min + 1);
      if (!see(facts, C, at()).done.has(job)) this.do({ do: 'done', job });
      return this;
    },
    to(iso: string) { now = Date.parse(iso); facts = facts.concat(settle(facts, C, at())); return this; },
    view() { return see(facts, C, at()); },
    satchel() { return satchelView(C, facts, at()); },
    walked() { return facts.filter(f => f.type === 'stepsGained').reduce((a, f) => a + (f as { minutes: number }).minutes, 0); },
    count(type: Fact['type']) { return facts.filter(f => f.type === type).length; },
    /** what a job's return pays: a story step or a find tied to a done record (the road's own finds are not a return) */
    paid() { return facts.filter(f => f.type === 'keyEarned' || ((f.type === 'beatPlayed' || f.type === 'findGiven') && f.job !== undefined)).length; },
  };
}

describe('"Not done after all" (D-131)', () => {
  it('a done job is to do again; its minutes stay counted once, and nothing is paid twice', () => {
    const p = player().do({ do: 'open' }).did('cat', 25);
    expect(p.view().done.has('cat')).toBe(true);
    const walked = p.walked(), paid = p.paid();
    p.do({ do: 'notDone', job: 'cat' });
    expect(p.view().done.has('cat')).toBe(false);
    expect(p.view().slate).toContain('cat');
    expect(p.walked()).toBe(walked);
    /* said done again with no new minutes: nothing more moves, nothing is paid again */
    p.do({ do: 'done', job: 'cat' });
    expect(p.view().done.has('cat')).toBe(true);
    expect(p.walked()).toBe(walked);
    expect(p.paid()).toBe(paid);
    /* taken back again, then more minutes: the new minutes count, once; still no second return */
    p.do({ do: 'notDone', job: 'cat' }).did('cat', 15);
    expect(p.walked()).toBe(walked + 15);
    expect(p.paid()).toBe(paid);
    expect(p.view().done.has('cat')).toBe(true);
  });
  it('a recurring job taken back and done again lands no second Key that week', () => {
    const p = player().do({ do: 'open' });
    /* the lesson is once a week, on Thursdays: one session meets it */
    p.to('2026-10-01T09:00:00+01:00').do({ do: 'open' }).did('lesson', 30);
    const keys = p.count('keyEarned');
    expect(keys).toBeGreaterThan(0);
    p.do({ do: 'notDone', job: 'lesson' }).did('lesson', 20);
    expect(p.view().done.has('lesson')).toBe(true);
    expect(p.count('keyEarned')).toBe(keys);
  });
  it('a one-off taken back and left undone is not finished: the next day it waits in "No day yet"', () => {
    const p = player().do({ do: 'open' }).did('cat', 25).do({ do: 'notDone', job: 'cat' });
    p.to('2026-09-29T09:00:00+01:00').do({ do: 'open' });
    const s = p.satchel();
    expect(s.noDay.map(j => j.id).concat(p.view().slate)).toContain('cat');
    expect(s.noDay.some(j => j.id === 'cat') && p.view().slate.includes('cat')).toBe(false);
  });
  it('only a job done today, and never mid-delve', () => {
    const p = player().do({ do: 'open' });
    expect(act(p.facts, C, { do: 'notDone', job: 'cat' }, p.at)).toEqual([]);
    p.did('gym', 30).do({ do: 'startRun', job: 'gym', minutes: 10, count: 1 });
    expect(act(p.facts, C, { do: 'notDone', job: 'gym' }, p.at)).toEqual([]);
  });
});

describe('the Satchel: one place for every job (D-131)', () => {
  const where = (p: ReturnType<typeof player>, id: string) => {
    const s = p.satchel(), v = p.view();
    return [v.slate.includes(id) && !v.done.has(id) ? 'today' : null, s.noDay.some(j => j.id === id) ? 'noDay' : null,
      s.coming.some(x => x.job.id === id) ? 'coming' : null, s.recurring.some(j => j.id === id) ? 'recurring' : null].filter(Boolean);
  };
  it('saved for later: No day yet, newest first; put on a later day: Coming up with its day; on its day: Today', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Shopping', 'Errands'] });
    expect(p.satchel().noDay.slice(0, 2).map(j => j.name)).toEqual(['Errands', 'Shopping']);
    const id = p.satchel().noDay.find(j => j.name === 'Shopping')!.id;
    p.do({ do: 'putOnDay', job: id, day: '2026-10-02' });
    expect(where(p, id)).toEqual(['coming']);
    expect(p.satchel().coming.find(x => x.job.id === id)!.day).toBe('2026-10-02');
    /* moved again (next week): still one place, the new day */
    p.do({ do: 'putOnDay', job: id, day: '2026-10-06' });
    expect(p.satchel().coming.filter(x => x.job.id === id).map(x => x.day)).toEqual(['2026-10-06']);
    p.to('2026-10-06T09:00:00+01:00').do({ do: 'open' });
    expect(where(p, id)).toEqual(['today']);
    /* its day passes undone: back to No day yet, not placed again */
    p.to('2026-10-07T09:00:00+01:00').do({ do: 'open' });
    expect(where(p, id)).toEqual(['noDay']);
    /* done: in no list at all (the Daybook has it) */
    p.did(id, 20).do({ do: 'done', job: id });
    expect(where(p, id)).toEqual([]);
  });
  it('a recurring job is only under Recurring jobs; a job on today is never in the Satchel', () => {
    const p = player().do({ do: 'open' });
    for (const r of C.rhythms) expect(where(p, r.job).filter(x => x !== 'today')).toEqual(['recurring']);
    for (const id of p.view().slate) expect(where(p, id).filter(x => x !== 'recurring')).toEqual(['today']);
  });
  it('"Not today" sends a one-off to No day yet; a later day from the menu takes it off today', () => {
    const p = player().do({ do: 'open' });
    expect(where(p, 'cat')).toEqual(['today']);
    p.do({ do: 'setAside', job: 'cat' });
    expect(where(p, 'cat')).toEqual(['noDay']);
    p.do({ do: 'putOnDay', job: 'cat', day: '2026-09-28' });
    expect(where(p, 'cat')).toEqual(['today']);
    p.do({ do: 'putOnDay', job: 'cat', day: '2026-09-30' });
    expect(where(p, 'cat')).toEqual(['coming']);
  });
  it('a job delved on from the Satchel is on Today only, "Not yet" and all', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Fix the shelf'] });
    const id = p.satchel().noDay[0].id;
    p.do({ do: 'startRun', job: id, minutes: 10, count: 1 }).wait(11);
    expect(where(p, id)).toEqual(['today']);
  });
  it('"Delve now": a one-off on today, its delve begun at once; done, it is done today; left, it returns to No day yet', () => {
    const p = player().do({ do: 'open' }).do({ do: 'delveNow', line: 'Call the bank' });
    const v = p.view();
    expect(v.run?.job.name).toBe('Call the bank');
    expect([v.run?.minutes, v.run?.count]).toEqual([30, 1]);
    const id = v.run!.job.id;
    expect(where(p, id)).toEqual(['today']);
    /* not while another delve runs */
    expect(act(p.facts, C, { do: 'delveNow', line: 'Another' }, p.at)).toEqual([]);
    p.wait(31);
    expect(where(p, id)).toEqual(['today']);   /* "Not yet": it stays on Today */
    /* the next day it stays on Today, its minutes so far kept (Dan, D-143 D: it used to go back to No day yet) */
    p.to('2026-09-29T09:00:00+01:00').do({ do: 'open' });
    expect(where(p, id)).toEqual(['today']);
  });
});

describe('Tonight: tomorrow starts with (D-131)', () => {
  it('prefilled with tomorrow’s first planned job; nothing is written by looking', () => {
    const p = player('2026-09-28T21:30:00+01:00').do({ do: 'open' });
    const n = p.facts.length;
    const first = tomorrowFirst(C, p.facts, p.at);
    expect(first.chosen).toBe(false);
    expect(first.job).toBe(W.plannedToday(W.live(C, p.facts), p.facts, '2026-09-29', '00:00')[0].job);
    expect(p.facts.length).toBe(n);
  });
  it('a job chosen at night leads the next morning as the big Delve, planned or not', () => {
    const p = player('2026-09-28T21:30:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['Write to Ana'] });
    const id = p.satchel().noDay[0].id;
    p.do({ do: 'firstJob', job: id });
    expect(tomorrowFirst(C, p.facts, p.at)).toMatchObject({ job: id, chosen: true });
    p.to('2026-09-29T08:00:00+01:00').do({ do: 'open' });
    expect(p.view().next?.job).toBe(id);
    expect(p.view().line[0]).toBe(id);
    expect(p.satchel().noDay.some(j => j.id === id)).toBe(false);
  });
  it('skipped, the morning is as planned', () => {
    const a = player('2026-09-28T21:30:00+01:00').do({ do: 'open' });
    const expected = tomorrowFirst(C, a.facts, a.at).job;
    a.to('2026-09-29T08:00:00+01:00').do({ do: 'open' });
    expect(a.view().next?.job).toBe(expected);
  });
});

describe('the planner learns (D-131)', () => {
  it('real minutes: the median of the last 5 delves of 5 minutes or more, once there are 3, rounded to 5', () => {
    const p = player().do({ do: 'open' });
    const room = () => W.roomOf(W.live(C, p.facts).jobs.find(j => j.id === 'spanish')!, p.facts);
    expect(room()).toBe(60);
    p.did('spanish', 41).do({ do: 'startRun', job: 'spanish', minutes: 3, count: 1 }).wait(4);
    p.to('2026-09-29T09:00:00+01:00').did('spanish', 52);
    expect(room()).toBe(60);   /* two delves of 5 minutes or more: not yet */
    p.to('2026-09-30T09:00:00+01:00').did('spanish', 48);
    expect(W.realMinutes(p.facts, 'spanish')).toBe(50);   /* 41, 48, 52 → 48 → 50 */
    expect(room()).toBe(50);
    /* the job's own minutes stay as written; a delve still opens at 30 */
    expect(W.live(C, p.facts).jobs.find(j => j.id === 'spanish')!.length).toBe(60);
    /* only the last five count */
    for (const [d, m] of [['10-01', 90], ['10-02', 90], ['10-03', 90]] as const) p.to(`2026-${d}T09:00:00+01:00`).did('spanish', m);
    expect(W.realMinutes(p.facts, 'spanish')).toBe(90);
  });
  it('good hours: a job usually started around this hour is offered first; hand-placed jobs never move', () => {
    const p = player().do({ do: 'open' });
    /* the Course started four times around 20:00 on earlier days */
    for (const d of ['09-21', '09-22', '09-23', '09-24']) {
      p.do({ do: 'open' });   /* keeps the clock moving through the log */
      const f: Fact = { seq: p.facts[p.facts.length - 1].seq + 1, at: `2026-${d}T20:05:00+01:00`, day: `2026-${d}`, type: 'delveStarted', job: 'course', minutes: 10, count: 1 };
      const e: Fact = { seq: f.seq + 1, at: `2026-${d}T20:15:00+01:00`, day: `2026-${d}`, type: 'delveEnded', job: 'course', minutes: 10, how: 'ranOut', run: f.seq };
      (p.facts as Fact[]).push(f, e);
    }
    expect(W.goodHour(p.facts, 'course', '20:00')).toBe(true);
    expect(W.goodHour(p.facts, 'course', '09:00')).toBe(false);
    /* a day of this week where the Course is on the finish line but not first */
    const day = W.weekDays('2026-09-28').find(d => { const v = see(p.facts, C, `${d}T10:00:00+01:00`); const todo = v.line.filter(id => !v.done.has(id)); return todo.includes('course') && todo[0] !== 'course'; });
    expect(day).toBeTruthy();
    const morning = see(p.facts, C, `${day}T10:00:00+01:00`), evening = see(p.facts, C, `${day}T19:45:00+01:00`);
    expect(evening.line.filter(id => !evening.done.has(id))[0]).toBe('course');
    expect(evening.next?.job).toBe('course');
    /* the same jobs on the line, only their order; never another day's job */
    expect([...evening.line].sort()).toEqual([...morning.line].sort());
    /* placed by hand, a job keeps its place */
    const q = player().do({ do: 'open' });
    (q.facts as Fact[]).push(...p.facts.filter(f => f.day < '2026-09-28' && (f.type === 'delveStarted' || f.type === 'delveEnded')).map((f, k) => ({ ...f, seq: q.facts[q.facts.length - 1].seq + 1 + k })));
    const e = W.planOf(q.facts, '2026-09-28')!.find(x => x.job === 'course' && x.day === day)!;
    q.do({ do: 'movePlan', entry: e.id, day: day! });
    const hand = see(q.facts, C, `${day}T19:45:00+01:00`), handAm = see(q.facts, C, `${day}T10:00:00+01:00`);
    expect(hand.line.filter(id => !hand.done.has(id))).toEqual(handAm.line.filter(id => !handAm.done.has(id)));
  });
});

describe('the fresh review of D-131: what it broke, now held', () => {
  it('a one-off chosen for tomorrow and done tonight is finished: it doesn’t come back, and pays once', () => {
    const p = player('2026-09-28T21:30:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['Write to Ana'] });
    const id = p.satchel().noDay[0].id;
    p.do({ do: 'firstJob', job: id }).did(id, 20);
    const paid = p.paid();
    p.to('2026-09-29T08:00:00+01:00').do({ do: 'open' });
    expect(p.view().slate).not.toContain(id);
    expect(tomorrowFirst(C, p.facts, p.at).job).not.toBe(id);
    /* and a finished one-off can't be chosen, or put on a day, again */
    expect(act(p.facts, C, { do: 'firstJob', job: id }, p.at)).toEqual([]);
    expect(act(p.facts, C, { do: 'putOnDay', job: id, day: '2026-09-30' }, p.at)).toEqual([]);
    expect(p.paid()).toBe(paid);
  });
  it('the finish line counts a done job by the minutes worked, never by how long it was meant to take (rule 10)', () => {
    const p = player().do({ do: 'open' });
    const big = { id: 'big', name: 'Big', delve: true, length: 240, doneBy: 'dan' as const };
    p.do({ do: 'saveJob', job: big, rhythm: null }).do({ do: 'putOnDay', job: 'big', day: '2026-09-28' }).did('big', 5);
    expect(p.view().done.has('big')).toBe(true);
    expect(p.view().complete).toBe(false);
    expect(p.view().line.length).toBeGreaterThan(1);
  });
  it('work done off the plan counts as the day’s real minutes: a line done completes the day', () => {
    const p = player().do({ do: 'open' });
    const line = p.view().line;
    p.did('post', 30);
    for (const id of line) { p.do({ do: 'startRun', job: id, minutes: 1, count: 1 }).wait(2); if (!p.view().done.has(id)) p.do({ do: 'done', job: id }); }
    expect(line.every(id => p.view().done.has(id))).toBe(true);
    expect(p.view().complete).toBe(true);
  });
  it('a recurring job done today keeps its place today; put on a later day it is planned there too', () => {
    const p = player().do({ do: 'open' }).did('gym', 30);
    const line = p.view().line;
    expect(act(p.facts, C, { do: 'putOnDay', job: 'gym', day: '2026-09-28' }, p.at)).toEqual([]);
    p.do({ do: 'putOnDay', job: 'gym', day: '2026-09-30' });
    expect(p.view().line).toEqual(line);
  });
  it('"Not done after all" never follows a deleted record; a taken-back legacy line is still a line', () => {
    const p = player().do({ do: 'open' }).did('gym', 30).do({ do: 'hideDone', job: 'gym', on: '2026-09-28' });
    expect(act(p.facts, C, { do: 'notDone', job: 'gym' }, p.at)).toEqual([]);
    const q = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Old line'] });
    const id = q.satchel().noDay[0].id;
    q.did(id, 10).do({ do: 'notDone', job: id }).to('2026-09-29T09:00:00+01:00').do({ do: 'open' });
    expect(W.items(q.facts, '2026-09-29').find(i => i.id === id)?.done).toBe(false);
  });
  it('"Delve now" waits while a delve’s end is still to be answered; a week whose only record was taken back gets no page', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 10, count: 1 }).wait(11);
    expect(p.view().runEnd).toBeTruthy();
    expect(act(p.facts, C, { do: 'delveNow', line: 'Another' }, p.at)).toEqual([]);
    const q = player().do({ do: 'open' }).did('cat', 10).do({ do: 'notDone', job: 'cat' });
    q.to('2026-10-05T09:00:00+01:00').do({ do: 'open' });
    expect(q.facts.some(f => f.type === 'weekClosed' && f.week === '2026-09-28')).toBe(false);
  });
});

describe('the second fresh review of D-131: what it broke, now held', () => {
  it('a recurring job made a one-off is not finished by its old sessions: it can be placed, chosen and pays its return', () => {
    const p = player().do({ do: 'open' }).did('gym', 30);
    p.to('2026-09-29T09:00:00+01:00').do({ do: 'open' });
    const gym = W.live(C, p.facts).jobs.find(j => j.id === 'gym')!;
    p.do({ do: 'saveJob', job: { ...gym, doneBy: 'dan' }, rhythm: null });
    const s = p.satchel(), v = p.view();
    const places = [v.slate.includes('gym'), s.noDay.some(j => j.id === 'gym'), s.coming.some(x => x.job.id === 'gym')].filter(Boolean);
    expect(places).toHaveLength(1);
    p.do({ do: 'putOnDay', job: 'gym', day: '2026-10-01' });
    expect(p.satchel().coming.find(x => x.job.id === 'gym')?.day).toBe('2026-10-01');
    const paid = p.paid();
    p.to('2026-10-01T09:00:00+01:00').do({ do: 'open' }).did('gym', 30);
    expect(p.paid()).toBeGreaterThan(paid);
  });
  it('the finish line doesn’t change while Dan works: what it learns today counts from tomorrow', () => {
    const p = player().do({ do: 'open' });
    const line = p.view().line;
    for (const id of line) { p.did(id, 5); expect(p.view().line).toEqual(line); }
  });
  it('the deep moment needs real work past the line: a line emptied by "Not today" and ten minutes is no push (rule 10)', () => {
    const p = player('2026-10-06T09:00:00+01:00', sim().week('normal').facts as Fact[]).do({ do: 'open' });
    expect(S.nextDeep(C.story, S.storyState(p.facts, C.story))).not.toBeNull();
    for (const id of p.view().slate) p.do({ do: 'setAside', job: id });
    p.did('gym', 5).did('spanish', 5);
    expect(p.facts.some(f => f.type === 'beatPlayed' && S.beatOf(C.story, f.id)?.kind === 'deep')).toBe(false);
  });
  it('a session held in the Week and put on another day moves itself, not another', () => {
    const p = player().do({ do: 'open' });
    const gyms = W.planOf(p.facts, '2026-09-28')!.filter(e => e.job === 'gym');
    const held = gyms.find(e => e.day > '2026-09-28')!;
    const others = gyms.filter(e => e !== held).map(e => e.day);
    p.do({ do: 'putOnDay', job: 'gym', day: '2026-10-03', entry: held.id });
    const now = W.planOf(p.facts, '2026-09-28')!.filter(e => e.job === 'gym').map(e => e.day).sort();
    expect(now).toEqual([...others, '2026-10-03'].sort());
  });
  it('put on a later day, a dated one-off stays there; chosen for tomorrow, a one-off leaves its later day, and back', () => {
    const p = player().do({ do: 'open' });
    const post = W.live(C, p.facts).jobs.find(j => j.id === 'post')!;
    p.do({ do: 'saveJob', job: { ...post, by: '2026-10-02' }, rhythm: null }).do({ do: 'putOnDay', job: 'post', day: '2026-10-01' });
    p.to('2026-09-29T09:00:00+01:00').do({ do: 'open' });
    expect(p.view().slate).not.toContain('post');
    expect(p.satchel().coming.find(x => x.job.id === 'post')?.day).toBe('2026-10-01');
    /* chosen for tomorrow: tomorrow's, and no longer on Thursday */
    p.to('2026-09-29T22:30:00+01:00').do({ do: 'firstJob', job: 'post' });
    expect(p.satchel().coming.some(x => x.job.id === 'post')).toBe(false);
    p.to('2026-09-30T08:00:00+01:00').do({ do: 'open' });
    expect(p.view().next?.job).toBe('post');
    expect(W.weekOf(W.live(C, p.facts), p.facts, '2026-09-28', '2026-09-30').days.filter(d => d.day > '2026-09-30').some(d => d.jobs.some(j => j.job === 'post'))).toBe(false);
    /* put elsewhere at night, tomorrow's choice goes with it */
    p.to('2026-09-30T22:30:00+01:00').do({ do: 'firstJob', job: 'cat' }).do({ do: 'putOnDay', job: 'cat', day: '2026-10-03' });
    expect(tomorrowFirst(C, p.facts, p.at).job).not.toBe('cat');
  });
  it('delved on from Coming up, a one-off is today’s only', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Tidy the shed'] });
    const id = p.satchel().noDay[0].id;
    p.do({ do: 'putOnDay', job: id, day: '2026-10-02' }).do({ do: 'startRun', job: id, minutes: 10, count: 1 });
    expect(p.satchel().coming.some(x => x.job.id === id)).toBe(false);
    expect(W.weekOf(W.live(C, p.facts), p.facts, '2026-09-28', '2026-09-28').days.some(d => d.day > '2026-09-28' && d.jobs.some(j => j.job === id))).toBe(false);
  });
});
