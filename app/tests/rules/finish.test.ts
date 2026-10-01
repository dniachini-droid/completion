import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim } from './sim';

/* The day's finish line (Dan, D-130): the day is done when every job on today's list is done. No hidden count, nothing
   lowered for opening late; "Not today" still shortens the day; the deep moments still come from doing more (D-127). */
function player(start: string, from: Fact[] = []) {
  let facts: Fact[] = from.slice();
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    /** Worked on: a delve of so many minutes, then said done if that didn't do it. */
    did(job: string, min = 25) {
      this.do({ do: 'startRun', job, minutes: min, count: 1 });
      now += (min + 1) * 60_000; facts = facts.concat(settle(facts, C, at()));
      if (!see(facts, C, at()).done.has(job)) this.do({ do: 'done', job });
      return this;
    },
    view() { return see(facts, C, at()); },
  };
}
const SUN = '2026-10-04T09:00:00+01:00';   /* the plan puts four jobs on this Sunday */

describe('the day’s finish line (D-130)', () => {
  it('the finish line is the first 3 hours of the day’s jobs, in order; the rest is "If there’s time" (D-131)', () => {
    const p = player(SUN).do({ do: 'open' });
    const { slate, line } = p.view();
    expect(slate.length).toBeGreaterThan(line.length);
    const mins = (ids: string[]) => ids.reduce((a, id) => a + C.jobs.find(j => j.id === id)!.length, 0);
    /* at least 3 hours, and no job more than it takes to reach them */
    expect(mins(line)).toBeGreaterThanOrEqual(180);
    expect(mins(line.slice(0, -1))).toBeLessThan(180);
    expect(slate.slice(0, line.length)).toEqual(line);
    for (const id of line.slice(0, -1)) p.did(id);
    expect(p.view().complete).toBe(false);
    expect(p.view().next?.job).toBe(line[line.length - 1]);
    p.did(line[line.length - 1]);
    expect(p.view().complete).toBe(true);
    /* the rest is still there to do, and doing more goes deeper */
    for (const id of slate.slice(line.length)) expect(p.view().done.has(id)).toBe(false);
  });
  it('jobs added to today join the list the day needs', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' }).do({ do: 'addToWeek', line: 'Fix the shelf', day: '2026-09-28' });
    const list = p.view().slate;
    expect(list).toHaveLength(3);
    for (const id of list.slice(0, 2)) p.did(id);
    expect(p.view().complete).toBe(false);
    p.did(list[2]);
    expect(p.view().complete).toBe(true);
  });
  it('opening the app late lowers nothing: one job in the evening does not finish a list of three', () => {
    const p = player('2026-10-01T19:30:00+01:00').do({ do: 'open' });
    const list = p.view().slate;
    expect(list.length).toBeGreaterThan(1);
    p.did(list[0]);
    expect(p.view().complete).toBe(false);
    for (const id of list.slice(1)) p.did(id);
    expect(p.view().complete).toBe(true);
  });
  it('a job done from outside the list neither finishes it nor holds it back', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    const list = p.view().slate, other = C.jobs.find(j => !list.includes(j.id) && !j.item)!.id;
    p.did(other).did(list[0]);
    expect(p.view().complete).toBe(false);
    p.did(list[1]);
    expect(p.view().complete).toBe(true);
  });
  it('"Not today" shortens the day, and on the last job left it finishes a day that had its work', () => {
    const p = player('2026-09-30T09:00:00+01:00').do({ do: 'open' });
    const [a, b, c] = p.view().slate;
    p.do({ do: 'setAside', job: c });
    expect(p.view().complete).toBe(false);   /* nothing worked yet: nothing finished */
    p.did(a);
    expect(p.view().complete).toBe(false);
    p.did(b);
    expect(p.view().complete).toBe(true);
  });
  it('an emptied list is not a finished day; the first job worked on is then the list, and finishes it', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    for (const id of p.view().slate) p.do({ do: 'setAside', job: id });
    expect(p.view().slate).toEqual([]);
    expect(p.view().complete).toBe(false);
    expect(p.facts.some(f => f.type === 'dayCompleted')).toBe(false);
    p.did('course');
    expect(p.view().slate).toEqual(['course']);
    expect(p.view().complete).toBe(true);
  });
  it('any change that shortens the list finishes a day that had its work: a recurring job stopped (review, D-130)', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    expect(p.view().slate).toEqual(['cat', 'gym']);
    p.did('cat');
    const r = p.view().content.rhythms.find(x => x.job === 'gym')!;
    p.do({ do: 'stopRhythm', id: r.id });
    expect(p.view().slate).toEqual(['cat']);
    expect(p.view().complete).toBe(true);
  });
  it('a done record deleted leaves the list, and a list emptied that way is not a finished day (review, D-130)', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    const [a, b] = p.view().slate;
    p.did(a).do({ do: 'hideDone', job: a, on: p.view().day }).do({ do: 'setAside', job: b });
    expect(p.view().slate).toEqual([]);
    expect(p.view().complete).toBe(false);
  });
  it('a list said done without real minutes never finishes the day (rule 10)', () => {
    const p = player('2026-09-28T09:00:00+01:00').do({ do: 'open' });
    for (const id of p.view().slate) p.did(id, 2);
    expect(p.view().slate.every(id => p.view().done.has(id))).toBe(true);
    expect(p.view().complete).toBe(false);
  });
  it('past the finished day, doing more still brings the deep moment, once (D-127)', () => {
    /* a week in, where the story has a deep moment waiting */
    const p = player('2026-10-06T09:00:00+01:00', sim().week('normal').facts).do({ do: 'open' });
    expect(S.nextDeep(C.story, S.storyState(p.facts, C.story))).not.toBeNull();
    const list = p.view().slate;
    for (const id of list) p.did(id);
    expect(p.view().complete).toBe(true);
    const deep = () => p.facts.filter(f => f.type === 'beatPlayed' && S.beatOf(C.story, f.id)?.kind === 'deep').length;
    expect(deep()).toBe(0);
    /* real work past the line (D-131: three hours delved today, or more than a normal day's jobs), on jobs not yet finished */
    p.do({ do: 'addItems', lines: ['Paint the fence', 'Clear the loft'] });
    const extra = p.facts.filter(f => f.type === 'itemAdded').slice(-2).map(f => (f as { id: string }).id);
    for (const id of extra) p.did(id, 90);
    expect(deep()).toBe(1);
  });
});

describe('the finish line never moves under Dan (the flow review, L A1)', () => {
  it('over three weeks of ticking off the line\'s jobs one by one, a completion never brings a new job onto the line', () => {
    let facts: Fact[] = [];
    let now = Date.parse('2026-10-01T07:00:00Z');
    const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
    const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
    let checked = 0, doneDays = 0;
    for (let d = 0; d < 21; d++) {
      run({ do: 'open' });
      /* first, a job from off today's list, delved on: it joins the list as Dan begins it; done, it must not let the line
         refill with the next jobs (the review's Sunday) */
      {
        const v = see(facts, C, at());
        const off = C.jobs.find(j => !v.slate.includes(j.id) && !v.done.has(j.id) && C.rhythms.some(r => r.job === j.id));
        if (off) {
          run({ do: 'startRun', job: off.id, minutes: 60, count: 1 });
          now += 61 * 60_000; facts = facts.concat(settle(facts, C, at()));
          const mid = see(facts, C, at()), before = new Set(mid.line.filter(id => !mid.done.has(id)));
          if (!mid.done.has(off.id)) run({ do: 'done', job: off.id });
          while (see(facts, C, at()).runEnd) run({ do: 'seen', what: 'step', ref: see(facts, C, at()).runEnd!.seq });
          const w = see(facts, C, at());
          const added = w.line.filter(id => !w.done.has(id) && !before.has(id));
          expect(added, `${w.day}: ${off.id}, delved from off the list, brought ${added.join(', ')} onto the line`).toEqual([]);
          checked++;
        }
      }
      for (let k = 0; k < 8; k++) {
        const v = see(facts, C, at());
        while (see(facts, C, at()).arrival) run({ do: 'seen', what: 'arrival', ref: see(facts, C, at()).arrival!.seq });
        const todo = v.line.filter(id => !v.done.has(id));
        if (!todo.length) break;
        const before = new Set(todo);
        run({ do: 'tickOff', job: todo[todo.length - 1], minutes: 60 });
        now += 60 * 60_000;
        const w = see(facts, C, at());
        const added = w.line.filter(id => !w.done.has(id) && !before.has(id));
        expect(added, `${w.day}: ${todo[todo.length - 1]} done brought ${added.join(', ')} onto the line`).toEqual([]);
        checked++;
      }
      if (see(facts, C, at()).complete) doneDays++;
      now = Date.parse('2026-10-01T07:00:00Z') + (d + 1) * 864e5;
    }
    expect(checked).toBeGreaterThan(20);
    /* doing the line's jobs, and only those, finishes the day */
    expect(doneDays).toBeGreaterThan(15);
  }, 120_000);
});

describe('the review\'s Sunday (L A1): a missed session placed again on today keeps its place on the line when done', () => {
  it('Thursday\'s and Friday\'s work, then Sunday\'s three jobs ticked off: the day is done, nothing climbs into the line', () => {
    let facts: Fact[] = [];
    let now = 0;
    const set = (s: string) => { now = Date.parse(s); };
    const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
    const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
    const clear = () => { for (let g = 0; g < 20; g++) { const v = see(facts, C, at()); if (v.arrival) run({ do: 'seen', what: 'arrival', ref: v.arrival.seq }); else if (v.runEnd) run({ do: 'seen', what: 'step', ref: v.runEnd.seq }); else if (v.morning) run({ do: 'seen', what: 'morning', ref: v.morning.seq }); else break; } };
    const delve = (job: string, min: number, count = 1) => { run({ do: 'startRun', job, minutes: min, count }); now += (min * count + 5 * (count - 1) + 1) * 60_000; facts = facts.concat(settle(facts, C, at())); if (!see(facts, C, at()).done.has(job)) run({ do: 'done', job }); clear(); };
    set('2026-10-01T08:00:00Z'); run({ do: 'open' }); clear();
    delve('course', 30, 2);
    set('2026-10-01T14:00:00Z'); run({ do: 'tickOff', job: 'gym', minutes: 60 }); clear();
    set('2026-10-01T18:10:00Z'); run({ do: 'tickOff', job: 'lesson', minutes: 60 }); clear();
    set('2026-10-02T08:00:00Z'); run({ do: 'open' }); clear();
    delve('course', 45);
    set('2026-10-04T08:00:00Z'); run({ do: 'open' }); clear();
    const first = see(facts, C, at()).line;
    expect(first.length).toBeGreaterThan(1);
    for (const id of first) { run({ do: 'tickOff', job: id, minutes: 60 }); clear(); now += 3_600_000; expect(see(facts, C, at()).line, id).toEqual(expect.arrayContaining(first)); }
    const v = see(facts, C, at());
    expect(v.line.filter(id => !first.includes(id))).toEqual([]);
    expect(v.complete).toBe(true);
  }, 60_000);
});
