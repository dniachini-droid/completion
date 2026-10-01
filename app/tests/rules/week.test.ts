/**
 * Slice 4, the week and the gaps (PLANNER.md; TOOLS.md §2, §6; BALANCING.md §6–7; CORE_LOOPS → evening close, absence).
 * Ids only: no story text is asserted here.
 */
import { describe, expect, it } from 'vitest';
import { act, LIST_MAX, presetRun, returnOf, see, settle, type Command } from '../../src/core/game';
import * as W from '../../src/core/week';
import * as S from '../../src/core/story';
import { calendarWeek, weekdayOf } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim } from './sim';

/** A player on a phone clock in British Summer Time; `day(n)` moves to 09:00 n days on. */
function player(start = '2026-09-28T09:00:00+01:00') {   /* a Monday */
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    /** Later the same game day, at a wall-clock time (after midnight: the night after). */
    clock(hhmm: string) { const [h, m] = hhmm.split(':').map(Number); now = Date.parse(see(facts, C, at()).day + 'T00:00:00+01:00') + ((h < 4 ? h + 24 : h) * 60 + m) * 60_000; return this; },
    next(days = 1) { now = Date.parse(W.addDays(see(facts, C, at()).day, days) + 'T09:00:00+01:00'); return this; },
    view() { return see(facts, C, at()); },
    /** A job worked on, as every job is (D-117): a delve to its enough, then said done if that didn't do it. */
    did(job: string) {
      const j = see(facts, C, at()).content.jobs.find(x => x.id === job), m = Math.min(90, j?.enoughAt ?? j?.length ?? 25);
      this.do({ do: 'startRun', job, minutes: m, count: 1 }).wait(m + 1);
      if (!see(facts, C, at()).done.has(job)) this.do({ do: 'done', job });
      return this;
    },
    get at() { return at(); },
  };
}
const MON = '2026-09-28';
const plan = () => W.planWeek(C, [], MON, MON);
const on = (job: string) => plan().filter(e => e.job === job).map(e => e.day);

describe('Plan my week (PLANNER.md, fixed rules)', () => {
  it('appointments and set days first, with their time', () => {
    expect(plan().filter(e => e.job === 'lesson')).toEqual([expect.objectContaining({ day: '2026-10-01', time: '18:00' })]);
    expect(on('meal')).toEqual(['2026-10-04']);
    expect(weekdayOf(on('lesson')[0])).toBe(4);
  });
  it('each rhythm gets its enough: gym 4, Course 4, Spanish 2, the tank once a fortnight', () => {
    expect(on('gym')).toHaveLength(4);
    expect(on('course')).toHaveLength(4);
    expect(on('spanish')).toHaveLength(2);
    expect(on('tank')).toHaveLength(1);
  });
  it('the gym never two days running where it can be avoided', () => {
    const d = on('gym').map(x => Date.parse(x) / 864e5);
    for (let i = 1; i < d.length; i++) expect(d[i] - d[i - 1]).toBeGreaterThan(1);
  });
  it('no day above a Normal day’s room in minutes (one long job alone aside), and one lighter day (D-114)', () => {
    const load = new Map<string, number[]>();
    for (const e of plan()) if (!e.time) load.set(e.day, [...(load.get(e.day) ?? []), W.roomOf(C.jobs.find(j => j.id === e.job)!)]);
    for (const [d, m] of load) if (m.length > 1) expect(m.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(weekdayOf(d) === 6 ? W.PLAN_LIGHT : W.PLAN_MIN);
    /* the planning room is 7 hours, the lighter day 3½ (Dan, D-131) */
    expect([W.PLAN_MIN, W.PLAN_LIGHT]).toEqual([420, 210]);
  });
  it('avoided one-offs early in the week', () => {
    for (const j of ['cat', 'post']) expect(weekdayOf(on(j)[0])).toBeLessThanOrEqual(2);
  });
  it('planned mid-week: only the days left, and nothing already done is planned again', () => {
    const p = player('2026-09-30T09:00:00+01:00').do({ do: 'open' }).did('gym');
    const e = W.planWeek(C, p.facts, MON, '2026-09-30');
    expect(e.every(x => x.day >= '2026-09-30')).toBe(true);
    expect(e.filter(x => x.job === 'gym').length).toBeLessThanOrEqual(3);
  });
});

describe('How the week drives Today', () => {
  it('a week with no plan is laid out at its first opening, from that day on (D-080)', () => {
    const p = player().do({ do: 'open' });
    expect(W.planOf(p.facts, MON)).not.toBeNull();
    expect(p.facts.filter(f => f.type === 'planMade')).toHaveLength(1);
    expect(p.do({ do: 'open' }).facts.filter(f => f.type === 'planMade')).toHaveLength(1);   /* once */
  });
  it('Today starts from today’s plan', () => {
    const v = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON }).view();
    const today = plan().filter(e => e.day === MON).map(e => e.job);
    expect(v.slate.slice(0, today.length)).toEqual(today);
    expect(v.next?.job).toBe(today[0]);
  });
  it('capacity overrides the plan, but an appointment stays on a Low day (P10)', () => {
    const p = player('2026-10-01T09:00:00+01:00').do({ do: 'open' }).do({ do: 'planWeek', week: MON }).do({ do: 'capacity', capacity: 'low' });
    const v = p.view();
    expect(v.size).toBe(2);
    expect(v.slate).toContain('lesson');
    expect(v.times.lesson).toBe('18:00');
  });
  it('the past shows only what was done; an undone job is re-placed on a later day below its size, or falls away', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON });
    const monday = plan().filter(e => e.day === MON).map(e => e.job);
    p.do({ do: 'done', job: monday[0] }).next();
    p.do({ do: 'open' });
    const wk = W.weekOf(C, p.facts, MON, '2026-09-29');
    expect(wk.days[0].jobs.map(j => j.job)).toEqual([monday[0]]);
    expect(wk.days[0].jobs.every(j => j.done)).toBe(true);
    for (const d of wk.days.slice(1)) { const m = d.jobs.filter(j => !j.time && !j.done).map(j => W.roomOf(C.jobs.find(x => x.id === j.job)!)); if (m.length > 1) expect(m.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(W.PLAN_MIN); }
    /* a one-off whose day passed undone is not placed again: it waits in the Satchel's "No day yet" (D-131) */
    for (const j of monday.slice(1).filter(id => !C.rhythms.some(r => r.job === id))) {
      expect(wk.days.slice(1).flatMap(d => d.jobs).some(x => x.job === j)).toBe(false);
      expect(W.satchelOf(C, p.facts, '2026-09-29').map(x => x.id)).toContain(j);
    }
  });
  it('once a rhythm’s enough for the week is met, its remaining planned sessions leave', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON });
    for (let i = 0; i < 2; i++) { p.did('spanish').next(); p.do({ do: 'open' }); }
    const wk = W.weekOf(C, p.facts, MON, '2026-09-30');
    expect(wk.days.slice(2).flatMap(d => d.jobs).filter(j => j.job === 'spanish' && !j.done)).toEqual([]);
  });
  it('moving, timing and taking a job off the week earn nothing', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON });
    const e = p.view() && W.planOf(p.facts, MON)!.find(x => x.job === 'gym')!;
    const before = p.facts.length;
    p.do({ do: 'movePlan', entry: e.id, day: '2026-10-03', time: '07:30' });
    const added = p.facts.slice(before).map(f => f.type);
    expect(added).toEqual(['planChanged']);
    expect(W.planOf(p.facts, MON)!.find(x => x.id === e.id)).toEqual(expect.objectContaining({ day: '2026-10-03', time: '07:30' }));
    p.do({ do: 'movePlan', entry: e.id, day: null });
    expect(W.planOf(p.facts, MON)!.some(x => x.id === e.id)).toBe(false);
  });
  it('the forecast names days only from the plan, and only doing moves Dan', () => {
    const p = player().do({ do: 'open' });
    const f = p.view().forecast;
    expect(f.length).toBeGreaterThan(0);
    expect(p.view().walked).toBe(0);
  });
});

describe('Dan’s rhythms and the satchel', () => {
  it('a new rhythm can be planned at once, and counts for Keys from its next full week (D-043 F7)', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'saveRhythm', rhythm: { id: 'r-walk', job: 'walk', times: 1 }, job: { id: 'walk', name: 'A long walk', delve: false, length: 60, doneBy: 'dan' } });
    expect(p.view().content.rhythms.some(r => r.id === 'r-walk')).toBe(true);
    const keys = () => p.facts.filter(f => f.type === 'keyEarned' && f.rhythm === 'r-walk').length;
    p.did('walk');
    expect(keys()).toBe(0);
    p.next(7).do({ do: 'open' }).did('walk');
    expect(keys()).toBe(1);
  });
  it('Stop repeating ends future sessions only', () => {
    const p = player().do({ do: 'open' }).do({ do: 'done', job: 'gym' }).do({ do: 'stopRhythm', id: 'r-gym' });
    expect(p.view().content.rhythms.some(r => r.id === 'r-gym')).toBe(false);
    expect(p.view().done.has('gym')).toBe(true);
  });
  it('lines are never on Today until planned; ticking one off Today moves nothing', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['- hoover the hall', 'clear the desk', ''] });
    const it0 = W.items(p.facts, MON);
    expect(it0.map(i => i.name)).toEqual(['hoover the hall', 'clear the desk']);
    expect(p.view().order).not.toContain(it0[0].id);
    const walked = p.view().walked;
    p.do({ do: 'tick', id: it0[0].id });
    expect(p.view().walked).toBe(walked);
    expect(W.items(p.facts, MON)[0].done).toBe(true);
  });
  it('a line accepted as one of today’s jobs moves the expedition when done', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['clear the desk'] });
    const id = W.items(p.facts, MON)[0].id;
    p.do({ do: 'planJob', job: id, day: MON });
    expect(p.view().slate).toContain(id);
    const walked = p.view().walked;
    p.did(id);
    expect(p.view().walked).toBeGreaterThan(walked);
  });
  it('lines untouched for three weeks go quietly to someday; nothing is deleted', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['fix the shelf'] });
    expect(W.items(p.facts, W.addDays(MON, 20))[0].someday).toBe(false);
    expect(W.items(p.facts, W.addDays(MON, 21))[0].someday).toBe(true);
  });
});

describe('Camp, bedtime and the morning', () => {
  it('goodnight by bedtime plays the week’s camp line; the morning after, its morning waits', () => {
    const p = player().do({ do: 'open' }).clock('22:40').do({ do: 'goodnight' });
    expect(p.view().night).toEqual({ kept: true, beat: 'b-w1.camp' });
    p.next().do({ do: 'open' });
    const v = p.view();
    /* week 1's camp has no morning line of its own (its morning id is the story's opening, never replayed); the find waits */
    expect(v.morning?.beat).toBeNull();
    expect(v.morning?.find).not.toBeNull();
    expect(v.suggested).toBe('normal');
    expect(v.suggestedBy).toBe('bedtime');
    p.do({ do: 'seen', what: 'morning', ref: v.morning!.seq });
    expect(p.view().morning).toBeNull();
  });
  it('a late night loses nothing: no camp line, no morning, and tomorrow is a Normal day as planned (D-089)', () => {
    const p = player().do({ do: 'open' }).clock('00:30').do({ do: 'goodnight' });
    expect(p.view().night).toEqual({ kept: false, beat: null });
    p.next().do({ do: 'open' });
    expect(p.view().morning).toBeNull();
    expect(p.view().capacity).toBe('normal');   /* no size suggested on Today any more: the plan is the day (Dan, D-089) */
  });
  it('the camp line plays once a story week; later kept nights bring a find in the morning', () => {
    const p = player().do({ do: 'open' }).clock('22:00').do({ do: 'goodnight' }).next().do({ do: 'open' }).clock('22:00').do({ do: 'goodnight' });
    expect(p.view().night?.beat).toBeNull();
    p.next().do({ do: 'open' });
    expect(p.view().morning).toEqual(expect.objectContaining({ beat: null }));
    expect(p.view().morning?.find).not.toBeNull();
  });
  it('bedtime is Dan’s to set', () => {
    const p = player().do({ do: 'open' }).do({ do: 'bedtime', time: '22:30' });
    expect(p.view().bedtime).toBe('22:30');
    p.clock('22:50').do({ do: 'goodnight' });
    expect(p.view().night?.kept).toBe(false);
  });
  it('guesses confirmed by a morning after camp settle only when that morning plays (D-070 hand-over)', () => {
    const p = sim(undefined, undefined, 'kept');
    for (let w = 0; w < 4; w++) p.week('normal');
    const st = p.st();
    for (const m of C.story.marks.filter(x => x.confirmedBy?.endsWith('.morning'))) {
      if (st.guessed.has(m.id) && st.played.has(m.confirmedBy!)) expect(S.markHeld(m, st)!.confirmed, m.id).toBe(true);
    }
    expect([...st.played].filter(x => /^b-w\d\.morning$/.test(x)).length).toBeGreaterThanOrEqual(3);
    expect(st.played.has('b-w3.morning')).toBe(true);
  });
});

describe('The daybook’s week close', () => {
  it('written once, at the first opening of the next week: learned lines, the month’s so far, the glimpse', () => {
    const p = sim().week('normal');
    const v = p.view();
    expect(v.close).toBeNull();   /* not until the next week is opened */
    const s2 = sim().week('normal');
    s2.week(['normal', 'away', 'away', 'away', 'away', 'away', 'away']);
    const closes = s2.facts.filter(f => f.type === 'weekClosed');
    expect(closes).toHaveLength(1);
    const c = closes[0] as Extract<Fact, { type: 'weekClosed' }>;
    expect(c.n).toBe(1);
    expect(c.learned.length).toBeGreaterThan(0);
    expect(c.learned.length).toBeLessThanOrEqual(3);
    expect(c.soFar.length).toBeGreaterThanOrEqual(3);
    expect(c.soFar.length).toBeLessThanOrEqual(5);
    expect(c.glimpse).toBe('b-w1.close');
  });
  it('learned lines never repeat, and only lines whose beats have played show', () => {
    const p = sim().week('normal').week('normal').week('normal').week('normal');
    const learned = p.facts.filter(f => f.type === 'weekClosed').flatMap(f => (f as { learned: string[] }).learned);
    expect(new Set(learned).size).toBe(learned.length);
    const st = p.st();
    for (const id of learned) expect(C.story.learned.find(l => l.id === id)!.req.every(r => S.met(st, r))).toBe(true);
  });
  it('a week with nothing done gets no page', () => {
    const p = sim().week('normal').week('away').week('normal').week(['normal', 'away', 'away', 'away', 'away', 'away', 'away']);
    expect(p.facts.filter(f => f.type === 'weekClosed').map(f => (f as { week: string }).week)).toEqual(['2026-09-28', '2026-10-12']);
  });
});

describe('Absence and the deep push', () => {
  it('three days away: "where you were", and the first day back is a Normal day as planned (D-089)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'done', job: 'gym' }).next(3).do({ do: 'open' });
    const v = p.view();
    expect(v.welcome).not.toBeNull();
    expect(v.capacity).toBe('normal');
    p.do({ do: 'seen', what: 'welcome', ref: v.welcome!.seq });
    expect(p.view().welcome).toBeNull();
  });
  it('two days away is not an absence', () => {
    const p = player().do({ do: 'open' }).next(2).do({ do: 'open' });
    expect(p.view().welcome).toBeNull();
    expect(p.view().capacity).toBe('normal');
  });
  it('pushing deeper is doing more: past a normal day’s jobs the deep beat plays, with no setting chosen (Dan, D-127)', () => {
    const p = sim().week('normal');
    const at0 = '2026-10-06T09:00:00+01:00';
    let log = p.facts.concat(act(p.facts, C, { do: 'open' }, at0));
    expect(S.nextDeep(C.story, S.storyState(log, C.story))).not.toBeNull();
    let t = Date.parse(at0);
    const iso = (ms: number) => new Date(ms + 3_600_000).toISOString().slice(0, 19) + '+01:00';
    /* a job past a normal day's that lands a Key brings the Key; the deep beat comes with the next (D-054) */
    const deep = () => log.some(f => f.type === 'beatPlayed' && S.beatOf(C.story, f.id)?.kind === 'deep');
    for (let k = 0; k < 6 && !deep(); k++) {
      const v = see(log, C, iso(t));
      /* a recurring job not yet done today (a one-off finished last week is finished, D-131), an hour at a time */
      const job = v.next?.job ?? C.jobs.find(j => !v.done.has(j.id) && C.rhythms.some(r => r.job === j.id))!.id;
      log = log.concat(act(log, C, { do: 'startRun', job, minutes: 60, count: 1 }, iso(t)));
      t += 65 * 60_000; log = log.concat(settle(log, C, iso(t)));
      if (!see(log, C, iso(t)).done.has(job)) log = log.concat(act(log, C, { do: 'done', job }, iso(t)));
    }
    expect(log.some(f => f.type === 'capacityChosen')).toBe(false);
    expect(log.some(f => f.type === 'beatPlayed' && S.beatOf(C.story, f.id)?.kind === 'deep')).toBe(true);
  });
  it('the deep push called in the morning plays once a Normal day’s jobs are done', () => {
    const p = sim().week('normal');
    /* the sim's week-1 log, then a High morning in week 2 */
    const facts = p.facts.slice();
    const at = '2026-10-06T09:00:00+01:00';
    let log = facts.concat(act(facts, C, { do: 'open' }, at));
    log = log.concat(act(log, C, { do: 'capacity', capacity: 'high' }, at));
    expect(S.nextDeep(C.story, S.storyState(log, C.story))).not.toBeNull();
    /* the offer to call it is gone (D-130); a save that called it before still has the fact, and it still counts */
    const last = log[log.length - 1];
    log = log.concat({ seq: last.seq + 1, at: last.at, day: last.day, type: 'deepCalled' });
    let t = Date.parse(at);
    for (let k = 0; k < 3; k++) {
      const v2 = see(log, C, new Date(t + 3_600_000).toISOString().slice(0, 19) + '+01:00');
      const job = v2.next?.job ?? C.jobs.find(j => !v2.done.has(j.id) && !j.item)!.id;   /* past the plan: Dan's own choice */
      const iso = (ms: number) => new Date(ms + 3_600_000).toISOString().slice(0, 19) + '+01:00';
      /* worked on, as every job is (D-117): a delve, then said done */
      log = log.concat(act(log, C, { do: 'startRun', job, minutes: 25, count: 1 }, iso(t)));
      t += 90 * 60_000;
      log = log.concat(settle(log, C, iso(t)));
      if (!see(log, C, iso(t)).done.has(job)) log = log.concat(act(log, C, { do: 'done', job }, iso(t)));
    }
    expect(log.some(f => f.type === 'beatPlayed' && S.beatOf(C.story, f.id)?.kind === 'deep')).toBe(true);
  });
});

describe('Choosing what to do: Not today, and a delve on anything (D-077)', () => {
  it('Not today takes a job off today’s list; the day then needs one job fewer; nothing is earned or lost', () => {
    const p = player().do({ do: 'open' });
    const before = p.view(), walked = before.walked, id = before.slate[0];
    p.do({ do: 'setAside', job: id });
    const v = p.view();
    expect(v.slate).not.toContain(id);
    expect(v.next?.job).not.toBe(id);
    expect(v.walked).toBe(walked);
    expect(v.complete).toBe(false);
    for (const x of v.slate) p.did(x);
    expect(p.view().complete).toBe(true);   /* the rest of the day's plan completes it (review finding, D-080) */
  });
  it('a job set aside and then begun comes back to the list', () => {
    const p = player().do({ do: 'open' });
    const id = p.view().slate[0];
    p.do({ do: 'setAside', job: id });
    expect(p.view().order).not.toContain(id);
    p.do({ do: 'startRun', job: id, minutes: 25, count: 1 });
    expect(p.view().order).toContain(id);
  });
  it('a job done or running cannot be set aside', () => {
    const p = player().do({ do: 'open' }).do({ do: 'done', job: 'gym' }).do({ do: 'setAside', job: 'gym' });
    expect(p.facts.some(f => f.type === 'setAside')).toBe(false);
    p.do({ do: 'startRun', job: 'course', minutes: 25, count: 1 }).do({ do: 'setAside', job: 'course' });
    expect(p.facts.some(f => f.type === 'setAside')).toBe(false);
  });
  it('after the day is complete, any job can still be delved on, and its minutes move Dan', () => {
    const p = player().do({ do: 'open' });
    for (const id of p.view().slate) p.did(id);
    expect(p.view().complete).toBe(true);
    const other = C.jobs.find(j => !p.view().done.has(j.id) && !j.item)!.id;
    const walked = p.view().walked;
    p.do({ do: 'startRun', job: other, minutes: 25, count: 1 }).wait(26);
    expect(p.view().walked).toBe(walked + 25);
  });
  it('something new, named on the spot, can be delved on at once; its delve counts, and "done" counts it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Fix the bike'] });
    const id = (p.facts.find(f => f.type === 'itemAdded') as { id: string }).id;
    const walked = p.view().walked;
    p.do({ do: 'startRun', job: id, minutes: 25, count: 1 }).wait(26);
    expect(p.view().walked).toBe(walked + 25);
    expect(p.view().runEnd?.ask).toBe(true);
    p.do({ do: 'done', job: id });
    expect(p.view().done.has(id)).toBe(true);
    expect(p.view().slate).toContain(id);
  });
});

describe('A guess is asked after its marks are seen (D-077)', () => {
  it('when a job’s Done reaches a place whose records carry the mark, its guess is asked there; otherwise on the return', () => {
    const p = player().do({ do: 'open' });
    let checked = 0;
    for (let d = 0; d < 21 && !checked; d++) {
      for (const id of C.jobs.filter(j => !j.item).map(j => j.id)) {
        if (p.view().done.has(id)) continue;
        const from = p.facts.length;
        p.did(id);
        const f = p.facts.slice(from);
        const done = f.find(x => x.type === 'jobDone'), arr = f.find(x => x.type === 'arrived' && x.kind === 'place');
        const beat = f.find(x => x.type === 'beatPlayed' && x.job === done?.seq) as { id: string } | undefined;
        const carries = beat ? S.beatOf(C.story, beat.id)?.carries?.guess ?? [] : [];
        if (done && arr && carries.length) {
          const place = (arr as { id: string }).id, here = S.marksIn(C.story, S.beatOf(C.story, place)?.carries?.records ?? []);
          const moves = (m: string) => here.includes(m) && S.markOf(C.story, m)?.confirmedBy !== place;
          expect(returnOf(C, p.facts, done.seq).guess).toEqual(carries.filter(m => !moves(m)));
          expect(p.view().arrival?.guess).toEqual(expect.arrayContaining(carries.filter(moves)));
          checked++;
        }
        for (const a of p.facts.filter(x => x.type === 'arrived')) p.do({ do: 'seen', what: 'arrival', ref: a.seq });
      }
      p.next().do({ do: 'open' });
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('After the day’s work, a tap on a job makes it the next one (D-077)', () => {
  it('a tapped job becomes next after day complete, until it is done', () => {
    const p = player().do({ do: 'open' });
    for (const id of p.view().slate) p.do({ do: 'done', job: id });
    expect(p.view().next).toBeNull();
    const other = C.jobs.find(j => !p.view().done.has(j.id))!.id;
    p.do({ do: 'focus', job: other });
    expect(p.view().next).toEqual({ job: other, mode: 'begin' });
    p.do({ do: 'setAside', job: other });
    expect(p.view().next).toBeNull();
    p.do({ do: 'focus', job: other });
    expect(p.view().next?.job).toBe(other);
    p.do({ do: 'done', job: other });
    expect(p.view().next).toBeNull();
  });
});

describe('Today follows the week’s plan (Dan, D-078)', () => {
  it('on a week laid out with Plan my week, Today offers only what the plan puts on the day', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON });
    for (let d = 0; d < 7; d++) {
      const v = p.view();
      const planned = W.weekOf(v.content, p.facts, MON, v.day).days.find(x => x.day === v.day)!.jobs.filter(j => j.entry).map(j => j.job);
      for (const id of v.slate) expect(planned).toContain(id);
      if (v.next) expect(planned).toContain(v.next.job);
      p.next().do({ do: 'open' });
    }
  });
  it('the day is complete once the plan’s jobs for it are done, even if fewer than a Normal day', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON });
    for (let d = 0; d < 7; d++) {
      const v = p.view();
      if (v.slate.length && v.slate.length < 3) {
        for (const id of v.slate) p.did(id);
        expect(p.view().complete).toBe(true);
        return;
      }
      p.next().do({ do: 'open' });
    }
  });
  it('a job Dan chose himself today stays on the list after the plan’s (D-080)', () => {
    const p = player().do({ do: 'open' });
    const other = C.jobs.find(j => !p.view().slate.includes(j.id) && !j.item)!.id;
    p.do({ do: 'startRun', job: other, minutes: 25, count: 1 }).wait(10).do({ do: 'finishHere' });
    expect(p.view().slate).toContain(other);
  });
});

describe('A delve left paused ends by itself (review finding, D-080)', () => {
  it('stepped away and never back: after three hours it finishes where it was paused, and Today is free', () => {
    const p = player().do({ do: 'open' });
    const job = p.view().slate[0];
    p.do({ do: 'startRun', job, minutes: 25, count: 1 }).wait(10).do({ do: 'stepAway' }).wait(200);
    const v = p.view();
    expect(v.run).toBeNull();
    const end = p.facts.find(f => f.type === 'delveEnded') as { minutes: number; day: string } | undefined;
    expect(end?.minutes).toBe(10);
    expect(v.next?.mode).not.toBe('carry');
  });
  it('an old Begin in a save (from when jobs had no timer) leaves nothing under way (D-117)', () => {
    const p = player().do({ do: 'open' });
    const f = p.facts[p.facts.length - 1];
    const old = p.facts.concat({ ...f, seq: f.seq + 1, type: 'jobBegun', job: 'gym', from: 'app' } as Fact);
    const v = see(old, C, p.at);
    expect(v.underWay).toBeNull();
    expect(v.next?.mode).not.toBe('underWay');
  });
  it('a Begin followed by a delve on the same job is no longer "under way" once the delve stops', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'begin', job: 'lesson' }).do({ do: 'startRun', job: 'lesson', minutes: 25, count: 1 }).wait(5).do({ do: 'finishHere' });
    expect(p.view().underWay).toBeNull();
  });
  it('a stopped delve never leaves its job "under way" (review finding, D-080)', () => {
    const p = player().do({ do: 'open' });
    const job = p.view().slate[0];
    p.do({ do: 'startRun', job, minutes: 25, count: 1 }).wait(5).do({ do: 'finishHere' });
    expect(p.view().underWay).toBeNull();
  });
});

describe('The planner’s own bugs (review findings, D-080)', () => {
  it('taking a planned job off the week never deletes a line Dan added himself', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Fix the bike', day: '2026-09-30' });
    const made = W.planOf(p.facts, MON)!.find(e => e.id.startsWith('pa-') === false)!;
    p.do({ do: 'movePlan', entry: made.id, day: null });
    expect(W.planOf(p.facts, MON)!.some(e => e.id.startsWith('pa-'))).toBe(true);
  });
  it('a missed appointment falls away; it is never moved to another day at its old time', () => {
    const p = player().do({ do: 'open' });
    const appt = W.planOf(p.facts, MON)!.find(e => e.time)!;
    p.next(W.daysBetween(MON, appt.day) + 1).do({ do: 'open' });
    const v = p.view();
    const wk = W.weekOf(v.content, p.facts, MON, v.day);
    expect(wk.days.filter(d => d.day >= v.day).some(d => d.jobs.some(j => j.job === appt.job && j.time === appt.time && !j.done))).toBe(false);
  });
});

describe('A High day adds one job beyond the plan, and only one (Dan, D-082)', () => {
  it('High: the day shows one job more than the plan; once done, no more are added', () => {
    const p = player().do({ do: 'open' });
    const planned = p.view().slate.length;
    p.do({ do: 'capacity', capacity: 'high' });
    const v = p.view();
    expect(v.slate.length).toBe(planned + 1);
    const extra = v.slate[v.slate.length - 1];
    for (const id of v.slate) p.did(id);
    expect(p.view().complete).toBe(true);
    expect(p.view().slate.filter(id => !p.view().done.has(id))).toEqual([]);   /* nothing further is added */
    expect(p.view().done.has(extra)).toBe(true);
  });
  it('Normal: the plan alone', () => {
    const p = player().do({ do: 'open' });
    const planned = W.plannedToday(p.view().content, p.facts, p.view().day, '09:00').map(x => x.job);
    expect([...p.view().slate].sort()).toEqual([...planned].sort());
  });
});

describe('Go to sleep: on time gives a head start (Dan, D-083)', () => {
  const sleepSteps = (facts: Fact[]) => facts.filter(f => f.type === 'stepsGained' && f.job === 'sleep').length;
  it('in bed by bedtime: the next morning begins a little further in, once', () => {
    const p = player().do({ do: 'open' }).clock('22:30').do({ do: 'goodnight' });
    const before = p.view().walked;
    p.next().do({ do: 'open' });
    expect(sleepSteps(p.facts)).toBe(1);
    expect(p.view().walked).toBe(before + 15);
    p.do({ do: 'open' });
    expect(sleepSteps(p.facts)).toBe(1);   /* once per night */
  });
  it('late, or at noon: no head start, and nothing lost', () => {
    const late = player().do({ do: 'open' }).clock('01:30').do({ do: 'goodnight' });
    late.next().do({ do: 'open' });
    expect(sleepSteps(late.facts)).toBe(0);
    const noon = player().do({ do: 'open' }).clock('12:00').do({ do: 'goodnight' });
    noon.next().do({ do: 'open' });
    expect(sleepSteps(noon.facts)).toBe(0);
  });
});

describe('Undoing a tap made by mistake (review 2, D-088)', () => {
  it('Not today can be put back: the job returns to today’s list', () => {
    const p = player().do({ do: 'open' });
    const id = p.view().slate[0];
    p.do({ do: 'setAside', job: id });
    expect(p.view().order).not.toContain(id);
    p.do({ do: 'putBack', job: id });
    expect(p.view().order).toContain(id);
    expect(p.view().next?.job).toBe(id);
  });
  it('placing a set-aside job on today again in the Week puts it back', () => {
    const p = player().do({ do: 'open' });
    const v = p.view(), id = v.slate[0];
    p.do({ do: 'setAside', job: id });
    const entry = W.planOf(p.facts, W.weekOf(C, p.facts, '2026-09-28', v.day).days[0].day)!.find(e => e.job === id && e.day === v.day)!;
    p.do({ do: 'movePlan', entry: entry.id, day: v.day });
    expect(p.view().order).toContain(id);
  });
});

describe('A line added by hand is an extra, never a takeover (review bug 1, D-107)', () => {
  it('one entry added to a week not laid out keeps the day’s rhythms on Today, plus the entry', () => {
    const before = player().view().slate;
    expect(before.length).toBeGreaterThan(0);
    const p = player().do({ do: 'addToWeek', line: 'Dentist', day: MON, time: '15:00' });
    const v = p.view(), id = p.facts.find(f => f.type === 'itemAdded')!.id;
    for (const job of before) expect(v.slate).toContain(job);
    expect(v.slate).toContain(id);
    expect(v.slate).toHaveLength(before.length + 1);
    expect(v.size).toBe(player().view().size + 1);
  });
  it('an appointment added to next week before it begins: that week is still laid out at its first opening', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Dentist', day: '2026-10-06', time: '15:00' });
    const dentist = p.facts.find(f => f.type === 'itemAdded')!.id;
    p.next(8).do({ do: 'open' });   /* Tuesday of next week */
    const v = p.view();
    expect(W.planMade(p.facts, '2026-10-05')).toBe(true);
    expect(v.slate).toContain(dentist);
    expect(v.slate.filter(id => id !== dentist).length).toBeGreaterThan(0);
  });
  it('a satchel line put on a day of a week not laid out is an extra too', () => {
    const before = player().view().slate;
    const p = player().do({ do: 'addItems', lines: ['Fix the bike'] });
    p.do({ do: 'planJob', job: 'it-1', day: MON });
    const v = p.view();
    for (const job of before) expect(v.slate).toContain(job);
    expect(v.slate).toContain('it-1');
  });
  it('a week laid out with Plan my week still leads Today, with the added entry on it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Dentist', day: MON, time: '15:00' });
    const v = p.view(), id = p.facts.filter(f => f.type === 'itemAdded').pop()!.id;
    const planned = W.weekOf(v.content, p.facts, MON, v.day).days.find(x => x.day === v.day)!.jobs.filter(j => j.entry).map(j => j.job);
    for (const job of v.slate) expect(planned).toContain(job);
    expect(v.slate).toContain(id);
  });
});

describe('One-tap capture (D-107)', () => {
  it('puts each line in the satchel in one step, and never starts anything or changes Today', () => {
    const p = player().do({ do: 'open' });
    const before = p.view();
    const n = p.facts.length;
    p.do({ do: 'addItems', lines: ['Call the bank', '- Renew the passport', '', '  '] });
    const added = p.facts.slice(n);
    expect(added.map(f => f.type)).toEqual(['itemAdded', 'itemAdded']);
    expect(W.items(p.facts, p.view().day).map(i => i.name)).toEqual(['Call the bank', 'Renew the passport']);
    expect(p.view().slate).toEqual(before.slate);
    expect(p.view().next).toEqual(before.next);
    expect(p.view().run).toBeNull();
  });
});

describe('Stage 2 fixes and lengths (D-110)', () => {
  it('a rhythm stopped before it was ever done leaves no one-off behind, and leaves the plan', () => {
    const p = player().do({ do: 'open' }).do({ do: 'stopRhythm', id: 'r-tank' });
    for (let d = 0; d < 14; d++) {
      expect(p.view().slate).not.toContain('tank');
      expect(p.view().order).not.toContain('tank');
      const wk = W.weekOf(p.view().content, p.facts, calendarWeek(p.view().day), p.view().day);
      expect(wk.days.flatMap(x => x.jobs).filter(j => !j.done).map(j => j.job)).not.toContain('tank');
      p.next().do({ do: 'open' });
    }
    expect(p.view().content.jobs.find(j => j.id === 'tank')?.stopped).toBe(true);
  });
  it('a stopped rhythm saved again repeats again', () => {
    const p = player().do({ do: 'stopRhythm', id: 'r-meal' });
    const job = { ...C.jobs.find(j => j.id === 'meal')! };
    p.do({ do: 'saveRhythm', rhythm: { id: 'r-meal', job: 'meal', days: [0] }, job }).do({ do: 'open' });
    expect(p.view().content.jobs.find(j => j.id === 'meal')?.stopped).toBeFalsy();
    expect(W.planOf(p.facts, MON)!.some(e => e.job === 'meal')).toBe(true);
  });
  it('a ticked satchel line stays ticked that day and leaves the list the day after', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['post the parcel', 'clear the desk'] });
    const [a, b] = W.items(p.facts, MON);
    p.do({ do: 'tick', id: a.id });
    expect(W.items(p.facts, MON).map(i => [i.id, i.done])).toEqual([[a.id, true], [b.id, false]]);
    expect(W.items(p.facts, W.addDays(MON, 1)).map(i => i.id)).toEqual([b.id]);
  });
  it('a 5-minute delve earns 5 minutes; a one-off opens at 30 × 1 (D-124), a recurring job at its own minutes (D-146)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'spanish', minutes: 5, count: 1 }).wait(6);
    expect(p.facts.filter(f => f.type === 'stepsGained').map(f => (f as { minutes: number }).minutes)).toEqual([5]);
    /* a one-off opens at 30 × 1 whatever its minutes (D-124); a recurring job at its own (D-146) */
    expect(presetRun({ id: 'x', name: 'x', delve: true, length: 10, doneBy: 'dan' })).toEqual({ minutes: 30, count: 1 });
    expect(presetRun({ id: 'x', name: 'x', delve: true, length: 180, doneBy: 'enough' }, { rhythms: [] })).toEqual({ minutes: 30, count: 1 });
    const r = { rhythms: [{ job: 'x' }] }, job = (length: number) => ({ id: 'x', name: 'x', delve: true, length, doneBy: 'enough' as const });
    expect(presetRun(job(60), r)).toEqual({ minutes: 60, count: 1 });
    expect(presetRun(job(5), r)).toEqual({ minutes: 5, count: 1 });
    expect(presetRun(job(120), r)).toEqual({ minutes: 60, count: 2 });
    expect(presetRun(job(180), r)).toEqual({ minutes: 90, count: 2 });
    expect(presetRun(job(240), r)).toEqual({ minutes: 60, count: 4 });
    expect(presetRun(job(50), r)).toEqual({ minutes: 25, count: 2 });
    expect(presetRun(job(55), r)).toEqual({ minutes: 60, count: 1 });
  });
  it('an old “usual session” in a save becomes the job’s minutes, so the plan doesn’t change (D-124)', () => {
    const job = { id: 'course', name: 'Course', delve: true, length: 180, enoughAt: 50, doneBy: 'enough' as const };
    const p = player().do({ do: 'saveRhythm', rhythm: C.rhythms.find(r => r.job === 'course')!, job });
    const j = p.view().content.jobs.find(x => x.id === 'course')!;
    expect(j.length).toBe(50);
    expect(j.enoughAt).toBeUndefined();
  });
});

describe('Edit anything (Stage 2, D-112)', () => {
  const job = (p: ReturnType<typeof player>, id: string) => p.view().content.jobs.find(j => j.id === id);
  it('any job can be renamed, resized, marked avoided and given a first step and a note', () => {
    const p = player().do({ do: 'open' });
    const gym = job(p, 'gym')!, r = p.view().content.rhythms.find(x => x.job === 'gym')!;
    p.do({ do: 'saveJob', job: { ...gym, name: 'Gym', length: 45, avoided: true, firstStep: 'Pack the bag', note: '  ' }, rhythm: r });
    expect(job(p, 'gym')).toMatchObject({ name: 'Gym', length: 45, avoided: true, firstStep: 'Pack the bag' });
    expect(job(p, 'gym')!.note).toBeUndefined();
    p.do({ do: 'noteJob', job: 'gym', note: 'legs next' }).do({ do: 'firstStep', job: 'gym', step: 'Shoes on' });
    expect(job(p, 'gym')).toMatchObject({ note: 'legs next', firstStep: 'Shoes on' });
    expect(p.view().content.rhythms.some(x => x.job === 'gym')).toBe(true);
  });
  it('"doesn’t repeat" ends the rhythm and keeps the job as a one-off', () => {
    const p = player().do({ do: 'open' });
    const tank = job(p, 'tank')!;
    p.do({ do: 'saveJob', job: tank, rhythm: null });
    expect(p.view().content.rhythms.some(x => x.job === 'tank')).toBe(false);
    expect(job(p, 'tank')!.stopped).toBeFalsy();
    p.do({ do: 'done', job: 'tank' });
    expect(p.view().done.has('tank')).toBe(true);
  });
  it('a removed job leaves Today, the plan and the lists; Undo (saving it again) brings it back as it was', () => {
    const p = player().do({ do: 'open' });
    const post = job(p, 'post')!;
    p.do({ do: 'removeJob', id: 'post' });
    expect(job(p, 'post')).toBeUndefined();
    expect(p.view().slate).not.toContain('post');
    expect(W.weekOf(p.view().content, p.facts, MON, MON).days.flatMap(d => d.jobs).some(j => j.job === 'post')).toBe(false);
    p.do({ do: 'saveJob', job: post, rhythm: null });
    expect(job(p, 'post')).toEqual(post);
    const gym = job(p, 'gym')!, r = p.view().content.rhythms.find(x => x.job === 'gym')!;
    p.do({ do: 'removeJob', id: 'gym' });
    expect(p.view().content.rhythms.some(x => x.job === 'gym')).toBe(false);
    p.do({ do: 'saveJob', job: gym, rhythm: r });
    expect(p.view().content.rhythms.find(x => x.job === 'gym')).toEqual(r);
  });
  it('a job added from anywhere is a delve, and can be renamed, removed and put back (D-117)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['post the parcle'] });
    const line = p.view().content.jobs.find(j => j.name === 'post the parcle')!;
    expect(line).toMatchObject({ delve: true, doneBy: 'dan' });
    expect(line.item).toBeUndefined();
    p.do({ do: 'saveJob', job: { ...line, name: 'Post the parcel' }, rhythm: null });
    expect(job(p, line.id)!.name).toBe('Post the parcel');
    p.do({ do: 'removeJob', id: line.id });
    expect(job(p, line.id)).toBeUndefined();
    p.do({ do: 'saveJob', job: line, rhythm: null });
    expect(job(p, line.id)!.name).toBe('post the parcle');
  });
});

describe('Capture from Siri, Shortcuts and the Action button (D-113)', () => {
  it('each line becomes a delve job once, marked as said to Siri, and changes nothing on Today (D-117)', () => {
    const p = player().do({ do: 'open' });
    const before = p.view().slate;
    const lines = [{ id: 'A1', text: ' Ring the vet ' }, { id: 'A2', text: '' }, { id: 'A3', text: 'Buy stamps' }];
    p.do({ do: 'takeInbox', lines });
    /* the app closed before the inbox was cleared: the same lines come again, and nothing is added twice */
    p.do({ do: 'takeInbox', lines });
    expect(p.view().content.jobs.filter(j => ['Ring the vet', 'Buy stamps'].includes(j.name)).map(j => [j.name, j.delve])).toEqual([['Ring the vet', true], ['Buy stamps', true]]);
    expect(p.facts.filter(f => f.type === 'itemAdded').every(f => (f as { via?: string }).via === 'siri')).toBe(true);
    expect(p.view().slate).toEqual(before);
  });
});

describe('Lay out the rest of the week (D-114)', () => {
  it('re-plans from today, keeps what Dan placed himself, and gives the new entries ids of their own', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Dentist', day: '2026-10-01', time: '15:00' });
    p.next(2).do({ do: 'open' });   /* Wednesday */
    const before = W.planOf(p.facts, MON)!;
    p.do({ do: 'replan' });
    const after = W.planOf(p.facts, MON)!;
    const dentist = before.find(e => e.id.startsWith('pa-'))!;
    expect(after.filter(e => e.id === dentist.id)).toEqual([dentist]);
    const fresh = after.filter(e => !e.id.startsWith('pa-'));
    expect(fresh.every(e => e.day >= '2026-09-30')).toBe(true);
    expect(fresh.some(e => before.some(b => b.id === e.id))).toBe(false);
    expect(fresh.filter(e => e.job === 'gym').length).toBeGreaterThan(0);
  });
});

describe('The week’s look-ahead (D-116)', () => {
  it('still wanted: up to three of the oldest lines, a week old or more; kept, its three weeks start again; someday by hand', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['a', 'b', 'c', 'd'] });
    expect(W.sweepOf(p.facts, W.addDays(MON, 6))).toEqual([]);
    const [a, b] = W.sweepOf(p.facts, W.addDays(MON, 7));
    expect(W.sweepOf(p.facts, W.addDays(MON, 7))).toHaveLength(3);
    p.next(7).do({ do: 'open' }).do({ do: 'keepItem', id: a.id }).do({ do: 'somedayItem', id: b.id });
    const it = (id: string, d: number) => W.items(p.facts, W.addDays(MON, d)).find(i => i.id === id)!;
    expect(it(a.id, 27).someday).toBe(false);
    expect(it(a.id, 28).someday).toBe(true);
    expect(it(b.id, 7).someday).toBe(true);
  });
  it('what matters most is placed first in the week and leads Today on its day; it earns what it always does', () => {
    const p = player().do({ do: 'open' }).do({ do: 'pinWeek', job: 'post' }).do({ do: 'replan' });
    const day = W.planOf(p.facts, MON)!.find(e => e.job === 'post')!.day;
    expect(day).toBe(MON);
    expect(p.view().slate[0]).toBe('post');
    expect(p.facts.some(f => f.type === 'findGiven' || f.type === 'stepsGained')).toBe(false);
  });
  it('coming up: the week’s fixed points from today', () => {
    const p = player().do({ do: 'open' });
    expect(W.comingUp(p.view().content, p.facts, MON).map(x => [x.day, x.job, x.kind])).toContainEqual(['2026-10-01', 'lesson', 'time']);
  });
});

describe('A job added on a day is a delve on that day; delved on, It\'s done marks it (D-117, D-120)', () => {
  const delveDone = (p: ReturnType<typeof player>, job: string) => {
    expect(p.view().slate).toContain(job);
    p.do({ do: 'startRun', job, minutes: 25, count: 1 }).wait(10).do({ do: 'finishHere' });
    p.do({ do: 'seen', what: 'step', ref: p.view().runEnd!.seq });
    p.do({ do: 'done', job });
    expect(p.view().done.has(job)).toBe(true);
    expect(p.facts.filter(f => f.type === 'jobBegun' && f.job === job).map(f => (f as { from: string }).from)).toEqual(['app']);
  };
  it('added on today in the Week', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Test', day: MON });
    delveDone(p, p.facts.find(f => f.type === 'itemAdded')!.id);
  });
  it('with a time set in the Week', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Test', day: MON, time: '15:00' });
    delveDone(p, p.facts.find(f => f.type === 'itemAdded')!.id);
  });
});

describe('A delve job worked on today can be said done later (Dan, 2026-09-27, D-120)', () => {
  it('after "Not yet" (or the question left), Done marks it, counting the delve\'s minutes once', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(10).do({ do: 'finishHere' });
    const walked = p.facts.filter(f => f.type === 'stepsGained').reduce((n, f) => n + (f as { minutes: number }).minutes, 0);
    expect(p.view().done.has('cat')).toBe(false);
    const before = p.facts.length;
    p.do({ do: 'done', job: 'cat' });
    const out = p.facts.slice(before);
    expect(out).toContainEqual(expect.objectContaining({ type: 'jobDone', job: 'cat', minutes: 10 }));
    expect(out.some(f => f.type === 'stepsGained')).toBe(false);   /* the minutes already moved Dan: none again */
    expect(p.facts.filter(f => f.type === 'stepsGained').reduce((n, f) => n + (f as { minutes: number }).minutes, 0)).toBe(walked);
    expect(p.view().done.has('cat')).toBe(true);
  });
});

describe('Done while its own delve still runs (Dan, 2026-09-27, D-120)', () => {
  const walked = (facts: Fact[]) => facts.filter(f => f.type === 'stepsGained').reduce((n, f) => n + (f as { minutes: number }).minutes, 0);
  it('Done on Today finishes the delve there: its minutes count once, and the delve ends', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(10);
    const w0 = walked(p.facts);
    p.do({ do: 'done', job: 'cat' });
    expect(p.view().run).toBeNull();
    expect(p.view().runEnd).toBeNull();   /* the job's return tells it; the delve's end doesn't come back */
    expect(p.facts).toContainEqual(expect.objectContaining({ type: 'jobDone', job: 'cat', minutes: 10 }));
    expect(walked(p.facts) - w0).toBe(10);
    p.wait(30);
    expect(walked(p.facts) - w0).toBe(10);   /* nothing more once the delve would have run out */
  });
  it('a satchel line ticked while delving on it: the same', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Bills'] });
    const id = p.facts.find(f => f.type === 'itemAdded')!.id;
    p.do({ do: 'startRun', job: id, minutes: 25, count: 2 }).wait(12);
    expect(p.view().slate).toContain(id);
    const w0 = walked(p.facts);
    p.do({ do: 'tick', id });
    expect(p.view().run).toBeNull();
    expect(p.view().done.has(id)).toBe(true);
    expect(walked(p.facts.concat()) - w0).toBe(12);
  });
  it('a delve on another job is left running', () => {
    const p = player().do({ do: 'open' }).do({ do: 'begin', job: 'gym' }).do({ do: 'startRun', job: 'cat', minutes: 25, count: 1 }).wait(5).do({ do: 'done', job: 'gym' });
    expect(p.view().run?.job.id).toBe('cat');
  });
});

describe('Everything is a delve (Dan, D-117)', () => {
  it('a job added by Siri waits in the satchel: no laying-out of the week places it (D-126)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'takeInbox', lines: [{ id: 'S1', text: 'Ring the vet' }] });
    const vet = p.view().content.jobs.find(j => j.name === 'Ring the vet')!;
    expect(vet).toMatchObject({ delve: true, doneBy: 'dan' });
    p.do({ do: 'replan' });
    expect(W.planOf(p.facts, MON)!.some(e => e.job === vet.id)).toBe(false);
    expect(W.satchelOf(p.view().content, p.facts, p.view().day).map(j => j.id)).toContain(vet.id);
  });
  it('the starting set has no job without a timer', () => {
    expect(C.jobs.every(j => j.delve)).toBe(true);
  });
  it('said done with no whole minute of delving, a job is off the list but earns nothing and brings no return (rule 10)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Water the plants', day: MON });
    const id = p.view().content.jobs.find(j => j.name === 'Water the plants')!.id;
    const walked = p.view().walked, from = p.facts.length;
    p.do({ do: 'startRun', job: id, minutes: 25, count: 1 }).do({ do: 'finishHere' }).do({ do: 'done', job: id });
    const after = p.facts.slice(from);
    expect(p.view().done.has(id)).toBe(true);
    expect(p.view().walked).toBe(walked);
    expect(after.find(f => f.type === 'jobDone')).toMatchObject({ minutes: 0 });
    expect(after.some(f => f.type === 'beatPlayed' || f.type === 'findGiven' || f.type === 'keyEarned')).toBe(false);
  });
  it('zero-minute Dones never complete a day, bring a camp, or count as a rhythm’s sessions (rule 10)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'low' });
    for (const id of p.view().slate) p.do({ do: 'startRun', job: id, minutes: 25, count: 1 }).do({ do: 'finishHere' }).do({ do: 'done', job: id });
    expect(p.view().slate.every(id => p.view().done.has(id))).toBe(true);
    expect(p.view().complete).toBe(false);
    expect(p.facts.some(f => f.type === 'dayCompleted' || f.type === 'arrived' || f.type === 'findGiven')).toBe(false);
    const gym = C.rhythms.find(r => r.job === 'gym')!;
    p.next().do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 25, count: 1 }).do({ do: 'finishHere' }).do({ do: 'done', job: 'gym' });
    expect(S.sessionsIn(p.facts, gym, p.view().day)).toBe(0);
  });
  it('old satchel lines dropped or ticked off stay gone: they are not jobs and never planned', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['old one', 'ticked one', 'kept one'] });
    const [a, b, k] = W.items(p.facts, MON).map(i => i.id);
    p.do({ do: 'dropItem', id: a }).do({ do: 'tick', id: b }).do({ do: 'replan' });
    const ids = p.view().content.jobs.map(j => j.id);
    expect(ids).not.toContain(a); expect(ids).not.toContain(b); expect(ids).toContain(k);
    expect(W.planOf(p.facts, MON)!.some(e => e.job === a || e.job === b)).toBe(false);
  });
  it('a job Dan placed himself in a week is not placed again when that week is laid out', () => {
    const SUN = W.addDays(MON, -1), WED = W.addDays(MON, 2);
    const p = player(`${SUN}T09:00:00+01:00`).do({ do: 'open' }).do({ do: 'addToWeek', line: 'Book the MOT', day: WED });
    const id = p.view().content.jobs.find(j => j.name === 'Book the MOT')!.id;
    p.next().do({ do: 'open' });
    expect(W.planOf(p.facts, MON)!.filter(e => e.job === id).map(e => e.day)).toEqual([WED]);
    p.do({ do: 'planWeek', week: MON });
    expect(W.planOf(p.facts, MON)!.filter(e => e.job === id).map(e => e.day)).toEqual([WED]);
  });
  it('a line delved on is in hand: the look-ahead does not ask about it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Paint the gate'] });
    const id = W.items(p.facts, MON)[0].id;
    p.next(5).do({ do: 'open' }).do({ do: 'startRun', job: id, minutes: 25, count: 1 }).wait(26);
    expect(W.sweepOf(p.facts, W.addDays(MON, 8)).some(i => i.id === id)).toBe(false);
  });
});

describe('any job counts for the minutes it was run for (Dan, D-121)', () => {
  const keys = (facts: Fact[], rhythm: string) => facts.filter(f => f.type === 'keyEarned' && f.rhythm === rhythm).length;
  it('a 10-minute gym session is that day’s session, credited with its 10 minutes', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 30, count: 2 }).wait(10).do({ do: 'finishHere' });
    expect(p.view().done.has('gym')).toBe(true);
    expect(p.facts.filter(f => f.type === 'jobDone')).toEqual([expect.objectContaining({ job: 'gym', minutes: 10 })]);
    expect(p.view().runEnd).toMatchObject({ enough: true, minutes: 10, ask: false });
    expect(S.sessionsIn(p.facts, C.rhythms.find(r => r.job === 'gym')!, MON)).toBe(1);
    expect(p.view().walked).toBe(10);
  });
  it('a run that runs out short of the job’s usual length counts too, at the run’s end, never mid-run', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'spanish', minutes: 10, count: 2 }).wait(12);
    expect(p.view().run?.phase).toBe('breather');
    expect(p.view().done.has('spanish')).toBe(false);   /* not done between delves: the run is the session */
    p.wait(20);
    expect(p.facts.filter(f => f.type === 'jobDone')).toEqual([expect.objectContaining({ job: 'spanish', minutes: 20 })]);
    expect(p.view().runEnd).toMatchObject({ enough: true, how: 'ranOut' });
  });
  it('a second run the same day moves Dan but is not a second session', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 10, count: 1 }).wait(11);
    p.do({ do: 'startRun', job: 'gym', minutes: 25, count: 1 }).wait(26);
    expect(p.facts.filter(f => f.type === 'jobDone')).toHaveLength(1);
    expect(p.view().walked).toBe(35);
  });
  it('a zero-minute Finish here earns nothing and completes nothing (rule 10)', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'gym', minutes: 30, count: 1 }).wait(0.5).do({ do: 'finishHere' });
    expect(p.view().done.has('gym')).toBe(false);
    expect(p.facts.some(f => f.type === 'jobDone' || f.type === 'stepsGained')).toBe(false);
  });
  it('a one-off still asks “Is it done?” after a short delve', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 10, count: 1 }).wait(11);
    expect(p.view().runEnd).toMatchObject({ ask: true, minutes: 10 });
    expect(p.view().done.has('cat')).toBe(false);
  });
  it('tiny sessions meet the rhythm, but only sessions of 5 minutes or more buy its Key (rule 10)', () => {
    const r = C.rhythms.find(x => x.job === 'spanish')!;
    const tiny = player().do({ do: 'open' });
    for (let d = 0; d < 2; d++) tiny.next(d ? 1 : 0).do({ do: 'open' }).do({ do: 'startRun', job: 'spanish', minutes: 5, count: 1 }).wait(3).do({ do: 'finishHere' });
    expect(S.sessionsIn(tiny.facts, r, tiny.view().day)).toBe(S.needOf(r));
    expect(keys(tiny.facts, r.id)).toBe(0);
    /* the rhythm is met: its remaining planned sessions leave the week (the planner and Today treat it as done) */
    const week = W.weekOf(tiny.view().content, tiny.facts, MON, tiny.view().day);
    expect(week.days.filter(d => d.day > tiny.view().day).flatMap(d => d.jobs).some(j => j.job === 'spanish' && !j.done)).toBe(false);
    const real = player().do({ do: 'open' });
    for (let d = 0; d < 2; d++) real.next(d ? 1 : 0).do({ do: 'open' }).do({ do: 'startRun', job: 'spanish', minutes: 5, count: 1 }).wait(6);
    expect(keys(real.facts, r.id)).toBe(1);
  });
});

describe('rule 10 with sessions of any length (review of D-121)', () => {
  it('one-minute sessions are done and move Dan, but play no story, complete no day and bring no floor Keys', () => {
    const p = player().do({ do: 'open' });
    for (let d = 0; d < 8; d++) {
      if (d) p.next(1).do({ do: 'open' });
      for (const job of ['gym', 'spanish', 'course', 'meal', 'tank']) p.do({ do: 'startRun', job, minutes: 5, count: 1 }).wait(1.5).do({ do: 'finishHere' });
    }
    expect(p.facts.filter(f => f.type === 'jobDone').every(f => (f as { minutes: number }).minutes === 1)).toBe(true);
    expect(p.facts.some(f => f.type === 'dayCompleted' || f.type === 'keyEarned')).toBe(false);
    expect(p.facts.filter(f => f.type === 'beatPlayed' && (f as { job?: number }).job)).toHaveLength(0);
  });
  it('Done during a repeating job’s run begun before 04:00: one session, on the run’s day, with its minutes', () => {
    const p = player('2026-09-28T03:50:00+01:00').do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 30, count: 1 }).wait(20);
    p.do({ do: 'done', job: 'course' });
    expect(p.facts.filter(f => f.type === 'jobDone').map(f => [(f as { minutes: number }).minutes, f.day])).toEqual([[20, '2026-09-27']]);
  });
});

describe('the side chamber is halfway to the next place, whatever the delves (Dan, D-122)', () => {
  it('found by Done in the middle of a delve, it is still shown on the delve’s end', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 60, count: 1 }).wait(45).do({ do: 'done', job: 'course' });
    expect(p.facts.filter(f => f.type === 'findGiven' && f.why === 'chamber')).toHaveLength(1);
    expect(p.view().runFinds).toHaveLength(1);
  });
  it('an arrival held for tomorrow: the new stretch’s chamber comes on the delve that reaches the place', () => {
    const p = player().do({ do: 'open' }).do({ do: 'capacity', capacity: 'normal' });
    for (const job of ['course', 'gym', 'spanish', 'meal']) p.do({ do: 'startRun', job, minutes: 90, count: 1 }).wait(91);
    expect(p.view().walked).toBe(360);   /* past the second place (225) and its stretch's halfway (300): arrival held */
    p.next(1).do({ do: 'open' }).do({ do: 'startRun', job: 'cat', minutes: 5, count: 1 }).wait(6);
    const n = p.facts.filter(f => f.type === 'findGiven' && f.why === 'chamber').length;
    expect(p.facts.filter(f => f.type === 'arrived' && f.kind === 'place' && f.how !== 'key').length).toBe(2);
    expect(n).toBe(3);
  });
  const chamberFinds = (facts: Fact[]) => facts.filter(f => f.type === 'findGiven' && f.why === 'chamber');
  const walkedAt = (facts: Fact[], seq: number) => facts.filter(f => f.type === 'stepsGained' && f.seq < seq).reduce((a, f) => a + (f as { minutes: number }).minutes, 0);
  it('the first is at 38 minutes (halfway to the first place, 75), on the delve that passes it', () => {
    const p = player().do({ do: 'open' });
    expect(p.view().toChamber).toBe(38);
    p.do({ do: 'startRun', job: 'course', minutes: 10, count: 1 }).wait(11);
    expect(p.view().toChamber).toBe(28);
    p.do({ do: 'startRun', job: 'course', minutes: 25, count: 1 }).wait(26);
    expect(chamberFinds(p.facts)).toHaveLength(0);
    p.do({ do: 'startRun', job: 'course', minutes: 5, count: 1 }).wait(6);
    expect(chamberFinds(p.facts)).toHaveLength(1);
    expect(p.view().runFinds).toEqual([(chamberFinds(p.facts)[0] as { id: string }).id]);   /* shown at the delve's end, as before */
    expect(p.view().toChamber).toBeNull();
  });
  it('the same point for any lengths and jobs: one long delve, or many short ones on different jobs', () => {
    const long = player().do({ do: 'open' }).do({ do: 'startRun', job: 'course', minutes: 60, count: 1 }).wait(61);
    expect(chamberFinds(long.facts)).toHaveLength(1);
    const short = player().do({ do: 'open' });
    for (const job of ['course', 'gym', 'spanish', 'cat', 'course', 'gym', 'spanish', 'cat']) short.do({ do: 'startRun', job, minutes: 5, count: 1 }).wait(6);
    const f = chamberFinds(short.facts);
    expect(f).toHaveLength(1);
    expect(walkedAt(short.facts, f[0].seq)).toBe(40);   /* the first 5-minute step past 38 */
  });
  it('once between two places, however far Dan walks; the next is halfway along the next stretch (150)', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'startRun', job: 'course', minutes: 30, count: 2 }).wait(66);
    expect(p.view().walked).toBe(60);
    expect(chamberFinds(p.facts)).toHaveLength(1);
    p.do({ do: 'startRun', job: 'gym', minutes: 25, count: 1 }).wait(26);
    expect(chamberFinds(p.facts)).toHaveLength(1);
    expect(p.facts.some(f => f.type === 'arrived' && f.kind === 'place')).toBe(true);   /* 85: the first place (75) reached */
    expect(p.view().toChamber).toBeNull();   /* the new stretch shows once its arrival has been seen */
    p.do({ do: 'seen', what: 'arrival', ref: p.view().arrival!.seq });
    expect(p.view().toChamber).toBe(150 - 85);
    p.do({ do: 'startRun', job: 'spanish', minutes: 60, count: 1 }).wait(61);
    expect(chamberFinds(p.facts)).toHaveLength(1);   /* 145 */
    p.do({ do: 'startRun', job: 'cat', minutes: 10, count: 1 }).wait(11);
    expect(chamberFinds(p.facts)).toHaveLength(2);   /* 155: past 150 */
  });
});

describe('one story, a new place every 150 minutes (Dan, D-123)', () => {
  it('a long day reaches several places, with no one-a-day limit and no wait for the calendar week', () => {
    const p = player().do({ do: 'open' });
    for (const job of ['course', 'gym', 'spanish', 'meal', 'tank']) p.do({ do: 'startRun', job, minutes: 90, count: 1 }).wait(91);
    expect(p.view().walked).toBe(450);
    /* 75, 225 and 375: three places the same day, unless the story itself holds one (a word to cut, a door a Key opens) */
    expect(p.facts.filter(f => f.type === 'arrived' && f.kind === 'place' && f.how !== 'key').length).toBeGreaterThanOrEqual(2);
  });
});

describe('The satchel: jobs with no day, and a job\'s list (Dan, D-126)', () => {
  const bag = (p: ReturnType<typeof player>) => W.satchelOf(p.view().content, p.facts, p.view().day).map(j => j.name);
  it('holds what is added with no day, newest first; a day taken off the week sends a job back; a day given takes it out', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Shopping'] }).do({ do: 'addItems', lines: ['Fix the gate'] });
    expect(bag(p).slice(0, 2)).toEqual(['Fix the gate', 'Shopping']);
    const gate = p.view().content.jobs.find(j => j.name === 'Fix the gate')!;
    p.do({ do: 'planJob', job: gate.id, day: W.addDays(MON, 3) });
    expect(bag(p)).not.toContain('Fix the gate');
    const e = W.planOf(p.facts, MON)!.find(x => x.job === gate.id)!;
    p.do({ do: 'movePlan', entry: e.id, day: null });
    expect(bag(p)).toContain('Fix the gate');
  });
  it('never holds a repeating job, a job done, or a deleted one', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Post the parcel', 'Old idea'] });
    for (const r of C.rhythms) expect(bag(p)).not.toContain(C.jobs.find(j => j.id === r.job)!.name);
    const parcel = p.view().content.jobs.find(j => j.name === 'Post the parcel')!, old = p.view().content.jobs.find(j => j.name === 'Old idea')!;
    p.did(parcel.id); p.next().do({ do: 'open' });
    expect(bag(p)).not.toContain('Post the parcel');
    p.do({ do: 'removeJob', id: old.id });
    expect(bag(p)).not.toContain('Old idea');
  });
  it('a job keeps a list a line at a time; lines struck off in a delve go when it ends; the rest stay for next time', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Shopping'] });
    const id = p.view().content.jobs.find(j => j.name === 'Shopping')!.id;
    const job = () => p.view().content.jobs.find(j => j.id === id)!;
    p.do({ do: 'listJob', job: id, list: 'shampoo' });
    p.next().do({ do: 'open' }).do({ do: 'listJob', job: id, list: 'shampoo\nmilk\n\n~ 2kg rice' });
    expect(job().list).toBe('shampoo\nmilk\n~ 2kg rice');
    /* no strike outside its own delve */
    p.do({ do: 'strikeLine', job: id, k: 0 });
    expect(job().struck).toBeUndefined();
    p.do({ do: 'startRun', job: id, minutes: 25, count: 1 }).do({ do: 'strikeLine', job: id, k: 0 }).do({ do: 'strikeLine', job: id, k: 1 }).do({ do: 'strikeLine', job: id, k: 1 });
    expect(job().struck).toEqual([0]);
    p.wait(26);
    /* a line typed with "~ " is Dan's, never taken for a struck one (review) */
    expect(job().list).toBe('milk\n~ 2kg rice');
    expect(job().struck).toBeUndefined();
    p.do({ do: 'listJob', job: id, list: '' });
    expect(job().list).toBeUndefined();
  });
  it('struck lines go at every end of a delve: Finish here, and Done while it runs', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Errands'] });
    const id = p.view().content.jobs.find(j => j.name === 'Errands')!.id;
    const job = () => p.view().content.jobs.find(j => j.id === id)!;
    p.do({ do: 'listJob', job: id, list: 'stamps\nbread' }).do({ do: 'startRun', job: id, minutes: 25, count: 1 }).do({ do: 'strikeLine', job: id, k: 1 }).wait(3).do({ do: 'finishHere' });
    expect(job().list).toBe('stamps');
    p.do({ do: 'listJob', job: id, list: 'stamps\nbread' }).do({ do: 'startRun', job: id, minutes: 25, count: 1 }).do({ do: 'strikeLine', job: id, k: 0 }).wait(3).do({ do: 'done', job: id });
    expect(job().list).toBe('bread');
  });
  it('a list keeps whole lines up to its length', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Long'] });
    const id = p.view().content.jobs.find(j => j.name === 'Long')!.id;
    p.do({ do: 'listJob', job: id, list: Array.from({ length: 400 }, (_, i) => `item number ${i}`).join('\n') });
    const list = p.view().content.jobs.find(j => j.id === id)!.list!;
    expect(list.length).toBeLessThanOrEqual(LIST_MAX);
    expect(list.split('\n').every(l => /^item number \d+$/.test(l))).toBe(true);
  });
  it('a repeating job made a one-off is in the satchel; a job set aside today waits there too', () => {
    const p = player().do({ do: 'open' });
    const gym = p.view().content.jobs.find(j => j.id === 'gym')!;
    p.did('gym').next().do({ do: 'open' });
    p.do({ do: 'saveJob', job: { ...gym }, rhythm: null });
    /* once the week it was planned in has passed, it is in no plan: the satchel holds it (review) */
    p.next(7).do({ do: 'open' });
    expect(bag(p)).toContain(gym.name);
    const q = player().do({ do: 'open' }).do({ do: 'addToWeek', line: 'Wash the car', day: MON });
    const car = q.view().content.jobs.find(j => j.name === 'Wash the car')!;
    expect(W.satchelOf(q.view().content, q.facts, MON).some(j => j.id === car.id)).toBe(false);
    q.do({ do: 'setAside', job: car.id });
    expect(W.satchelOf(q.view().content, q.facts, MON).some(j => j.id === car.id)).toBe(true);
  });

});

describe('Delete, everywhere (Dan, D-125)', () => {
  it('a job taken off the week with "Not this week", then another job done: the Done counts (it used to throw)', () => {
    const p = player().do({ do: 'open' });
    const e = W.planOf(p.facts, MON)!.find(x => x.day >= MON)!;
    p.do({ do: 'movePlan', entry: e.id, day: null });
    const id = p.view().slate.find(x => x !== e.job)!;
    const walked = p.view().walked;
    expect(() => p.did(id)).not.toThrow();
    expect(p.view().done.has(id)).toBe(true);
    expect(p.view().walked).toBeGreaterThan(walked);
  });
  it('a done job deleted leaves Today and the Week; the minutes it counted for stay; saved again, it is back', () => {
    const p = player().do({ do: 'open' });
    const id = p.view().slate.find(x => !C.rhythms.some(r => r.job === x))!;
    p.did(id);
    const walked = p.view().walked;
    const job = p.view().content.jobs.find(j => j.id === id)!;
    p.do({ do: 'removeJob', id });
    expect(p.view().slate).not.toContain(id);
    expect(W.weekOf(p.view().content, p.facts, MON, p.view().day).days.flatMap(d => d.jobs).some(j => j.job === id)).toBe(false);
    expect(p.view().walked).toBe(walked);
    p.do({ do: 'saveJob', job, rhythm: null });
    expect(p.view().slate).toContain(id);
    expect(p.view().done.has(id)).toBe(true);
  });
  it('a done session of a repeating job deleted: only that record goes; the repeat, its session and minutes stay; Undo', () => {
    const p = player().do({ do: 'open' });
    const r = C.rhythms.find(x => p.view().slate.includes(x.job))!;
    p.did(r.job);
    const walked = p.view().walked, day = p.view().day;
    p.do({ do: 'hideDone', job: r.job, on: day });
    expect(p.view().slate).not.toContain(r.job);
    expect(W.weekOf(p.view().content, p.facts, MON, day).days.flatMap(d => d.jobs).some(j => j.job === r.job && j.done)).toBe(false);
    expect(p.view().content.rhythms.some(x => x.id === r.id)).toBe(true);
    expect(S.sessionsIn(p.facts, r, day)).toBe(1);
    expect(p.view().walked).toBe(walked);
    p.do({ do: 'hideDone', job: r.job, on: day, back: true });
    expect(p.view().slate).toContain(r.job);
  });
  it('Undo puts a deleted job back in its place', () => {
    const p = player().do({ do: 'open' });
    const ids = p.view().content.jobs.map(j => j.id), k = 2, job = p.view().content.jobs[k];
    p.do({ do: 'removeJob', id: job.id }).do({ do: 'saveJob', job, rhythm: C.rhythms.find(r => r.job === job.id) ?? null });
    expect(p.view().content.jobs.map(j => j.id)).toEqual(ids);
  });
  it('a repeating job deleted takes its repeat with it; Undo brings both back', () => {
    const p = player().do({ do: 'open' });
    const r = C.rhythms[0], job = p.view().content.jobs.find(j => j.id === r.job)!;
    p.do({ do: 'removeJob', id: job.id });
    expect(p.view().content.rhythms.some(x => x.job === job.id)).toBe(false);
    expect(p.view().slate).not.toContain(job.id);
    p.do({ do: 'saveJob', job, rhythm: r });
    expect(p.view().content.rhythms.some(x => x.id === r.id)).toBe(true);
  });
});

describe('The break-it fixes (D-128)', () => {
  it('the phone clock set back across 04:00: facts stay on the day the phone says, in time order, and Not today still works', () => {
    const p = player('2026-09-28T10:00:00+01:00').do({ do: 'open' });
    /* on to Tuesday 09:00, where something happens; then the clock is set back to 03:00, still Monday's game day */
    p.next().do({ do: 'open' }).wait(-6 * 60);
    const v = p.view();
    expect(v.day).toBe(MON);
    const id = v.slate.find(x => !v.done.has(x) && x !== v.next?.job)!;
    p.do({ do: 'setAside', job: id });
    const k = p.facts.findIndex(x => x.type === 'setAside'), f = p.facts[k];
    expect(f.day).toBe(MON);
    expect(Date.parse(f.at)).toBeGreaterThanOrEqual(Date.parse(p.facts[k - 1].at));
    expect(p.view().slate).not.toContain(id);
  });
  it('a move to a day in another week is refused; a move within the week still works', () => {
    const p = player().do({ do: 'open' });
    const e = W.planOf(p.facts, MON)!.find(x => x.day > MON)!;
    p.do({ do: 'movePlan', entry: e.id, day: W.addDays(MON, 9) });
    expect(W.planOf(p.facts, MON)!.find(x => x.id === e.id)!.day).toBe(e.day);
    p.do({ do: 'movePlan', entry: e.id, day: W.addDays(MON, 6) });
    expect(W.planOf(p.facts, MON)!.find(x => x.id === e.id)!.day).toBe(W.addDays(MON, 6));
  });
  it('the job of a running delve, or of an end not yet answered, is not deleted', () => {
    const p = player().do({ do: 'open' }).do({ do: 'addItems', lines: ['Paint'] });
    const id = p.view().content.jobs.find(j => j.name === 'Paint')!.id;
    p.do({ do: 'startRun', job: id, minutes: 25, count: 1 }).do({ do: 'removeJob', id });
    expect(p.view().content.jobs.some(j => j.id === id)).toBe(true);
    p.wait(26).do({ do: 'removeJob', id });
    expect(p.view().content.jobs.some(j => j.id === id)).toBe(true);
    p.do({ do: 'seen', what: 'step', ref: p.view().runEnd!.seq }).do({ do: 'removeJob', id });
    expect(p.view().content.jobs.some(j => j.id === id)).toBe(false);
  });
});

