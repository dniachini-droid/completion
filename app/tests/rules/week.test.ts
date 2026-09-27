/**
 * Slice 4, the week and the gaps (PLANNER.md; TOOLS.md §2, §6; BALANCING.md §6–7; CORE_LOOPS → evening close, absence).
 * Ids only: no story text is asserted here.
 */
import { describe, expect, it } from 'vitest';
import { act, chamberAt, presetRun, returnOf, see, settle, type Command } from '../../src/core/game';
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
  it('no day above a Normal day’s size, and one lighter day', () => {
    const load = new Map<string, number>();
    for (const e of plan()) if (!e.time) load.set(e.day, (load.get(e.day) ?? 0) + 1);
    for (const n of load.values()) expect(n).toBeLessThanOrEqual(W.PLAN_DAY);
    expect(plan().filter(e => weekdayOf(e.day) === 6).length).toBeLessThanOrEqual(1);
  });
  it('avoided one-offs early in the week', () => {
    for (const j of ['cat', 'post']) expect(weekdayOf(on(j)[0])).toBeLessThanOrEqual(2);
  });
  it('planned mid-week: only the days left, and nothing already done is planned again', () => {
    const p = player('2026-09-30T09:00:00+01:00').do({ do: 'open' }).do({ do: 'done', job: 'gym' });
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
    for (const d of wk.days.slice(1)) expect(d.jobs.filter(j => !j.time).length).toBeLessThanOrEqual(W.PLAN_DAY);
  });
  it('once a rhythm’s enough for the week is met, its remaining planned sessions leave', () => {
    const p = player().do({ do: 'open' }).do({ do: 'planWeek', week: MON });
    for (let i = 0; i < 2; i++) { p.do({ do: 'done', job: 'spanish' }).next(); p.do({ do: 'open' }); }
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
    p.do({ do: 'done', job: 'walk' });
    expect(keys()).toBe(0);
    p.next(7).do({ do: 'open' }).do({ do: 'done', job: 'walk' });
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
    p.do({ do: 'tick', id });
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
  it('the deep push called in the morning plays once a Normal day’s jobs are done', () => {
    const p = sim().week('normal');
    /* the sim's week-1 log, then a High morning in week 2 */
    const facts = p.facts.slice();
    const at = '2026-10-06T09:00:00+01:00';
    let log = facts.concat(act(facts, C, { do: 'open' }, at));
    log = log.concat(act(log, C, { do: 'capacity', capacity: 'high' }, at));
    const v = see(log, C, at);
    expect(S.nextDeep(C.story, S.storyState(log, C.story))).not.toBeNull();
    expect(v.deepOffer).toBe(true);
    log = log.concat(act(log, C, { do: 'callDeep' }, at));
    expect(see(log, C, at).deepOffer).toBe(false);
    let t = Date.parse(at);
    for (let k = 0; k < 3; k++) {
      const v2 = see(log, C, new Date(t + 3_600_000).toISOString().slice(0, 19) + '+01:00');
      const job = v2.next?.job ?? C.jobs.find(j => !v2.done.has(j.id) && !j.item)!.id;   /* past the plan: Dan's own choice */
      t += 90 * 60_000;
      log = log.concat(act(log, C, { do: 'done', job }, new Date(t + 3_600_000).toISOString().slice(0, 19) + '+01:00'));
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
    for (const x of v.slate) p.do({ do: 'done', job: x });
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
    for (const id of p.view().slate) p.do({ do: 'done', job: id });
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
        const f = act(p.facts, C, { do: 'done', job: id }, p.at);
        p.do({ do: 'done', job: id });
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
        for (const id of v.slate) p.do({ do: 'done', job: id });
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
  it('a job delved on earlier in the day can still be begun away from the phone (Dan, 2026-09-26)', () => {
    const p = player().do({ do: 'open' });
    p.do({ do: 'startRun', job: 'lesson', minutes: 25, count: 1 }).wait(5).do({ do: 'finishHere' });
    p.do({ do: 'seen', what: 'step', ref: p.view().runEnd!.seq });
    p.do({ do: 'focus', job: 'lesson' }).do({ do: 'begin', job: 'lesson' });
    expect(p.view().underWay).toBe('lesson');
    expect(p.view().next).toEqual({ job: 'lesson', mode: 'underWay' });
    p.do({ do: 'done', job: 'lesson' });
    expect(p.view().done.has('lesson')).toBe(true);
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
    for (const id of v.slate) p.do({ do: 'done', job: id });
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
  it('a Begin can be taken back: the job is no longer under way, and a later Done counts as recorded afterwards', () => {
    const p = player().do({ do: 'open' });
    const away = p.view().slate.find(id => !C.jobs.find(j => j.id === id)!.delve)!;
    p.do({ do: 'begin', job: away });
    expect(p.view().underWay).toBe(away);
    p.do({ do: 'unbegin', job: away });
    expect(p.view().underWay).toBe(null);
    const walked = p.view().walked;
    p.do({ do: 'done', job: away });
    const begun = p.facts.filter(f => f.type === 'jobBegun' && f.job === away);
    expect(begun[begun.length - 1]).toMatchObject({ from: 'record' });
    expect(p.view().walked).toBeGreaterThan(walked);
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
  it('a side chamber needs four delves and 100 minutes: short delves can’t reach it cheaper (rule 10)', () => {
    expect([1, 2, 3, 4, 5].map(n => chamberAt(n, 25))).toEqual([false, false, false, true, false]);
    expect([3, 4].map(n => chamberAt(n, 90))).toEqual([false, true]);
    expect([4, 6, 7, 8].map(n => chamberAt(n, 15))).toEqual([false, false, true, false]);
    for (let n = 1; n <= 8; n++) { expect(chamberAt(n, 5)).toBe(false); expect(chamberAt(n, 10)).toBe(false); }
  });
  it('a 5-minute delve earns 5 minutes, and a short job starts on the stop that holds it', () => {
    const p = player().do({ do: 'open' }).do({ do: 'startRun', job: 'spanish', minutes: 5, count: 1 }).wait(6);
    expect(p.facts.filter(f => f.type === 'stepsGained').map(f => (f as { minutes: number }).minutes)).toEqual([5]);
    expect(presetRun({ id: 'x', name: 'x', delve: true, length: 10, doneBy: 'dan' })).toEqual({ minutes: 10, count: 1 });
    expect(presetRun({ id: 'x', name: 'x', delve: true, length: 25, doneBy: 'dan' })).toEqual({ minutes: 25, count: 1 });
    expect(presetRun({ id: 'x', name: 'x', delve: true, length: 180, enoughAt: 50, doneBy: 'enough' })).toEqual({ minutes: 25, count: 2 });
  });
});
