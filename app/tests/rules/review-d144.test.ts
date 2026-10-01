/**
 * The fresh review of the flow review's fixes (D-143, D-144): a job half done and put back stays on Today; a recurring
 * job typed for a later day leaves today's session; an errand run's shared minutes are no "Not yet"; no new delve while
 * an errand run's "What got done?" waits. Ids only: no story text.
 */
import { describe, expect, it } from 'vitest';
import { act, inProgress, see, settle, type Command } from '../../src/core/game';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { live } from '../../src/core/week';

function player(start: string) {
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  return {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return this; },
    wait(min: number) { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); return this; },
    sleep(min: number) { now += min * 60_000; return this; },
    view() { return see(facts, C, at()); },
    leave() { const e = see(facts, C, at()).runEnd; if (e) this.do({ do: 'seen', what: 'step', ref: e.seq }); return this; },
  };
}

describe('the fresh review of D-144', () => {
  it('a half-done job, "Not today", then "Put back": back on Today, not in the Satchel', () => {
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' });
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 }).wait(25).do({ do: 'finishHere' }).leave();
    p.sleep(24 * 60).do({ do: 'open' });
    expect(p.view().slate).toContain('cat');
    p.do({ do: 'setAside', job: 'cat' });
    expect(p.view().aside).toContain('cat');
    p.do({ do: 'putBack', job: 'cat' });
    expect(p.view().slate).toContain('cat');
    expect(p.view().aside).not.toContain('cat');
  });

  it('a recurring job typed in the Week\'s + for a later day adds a session there and leaves today\'s', () => {
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' }).do({ do: 'planWeek', week: '2026-10-05' });
    const today = p.view().slate.includes('gym');
    expect(today, 'gym is on today').toBe(true);
    p.do({ do: 'addToWeek', line: C.jobs.find(j => j.id === 'gym')!.name, day: '2026-10-08' });
    expect(p.view().slate.includes('gym')).toBe(today);
    expect(p.facts.some(f => f.type === 'planAdded' && f.entry.job === 'gym' && f.entry.day === '2026-10-08')).toBe(true);
    expect(p.facts.some(f => f.type === 'itemAdded')).toBe(false);
  });

  it('an errand run counted with nothing struck off leaves its errands where they were', () => {
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['Bank', 'Post office', 'Pharmacy'] });
    const ids = p.facts.filter(f => f.type === 'itemAdded').map(f => (f as { id: string }).id);
    expect(ids.length).toBe(3);
    p.do({ do: 'startErrands', jobs: ids, minutes: 30, count: 1 }).wait(31).do({ do: 'countErrands' }).leave();
    p.sleep(24 * 60).do({ do: 'open' });
    const going = inProgress(live(C, p.facts), p.facts);
    for (const id of ids) expect(going.has(id), id).toBe(false);
  });

  it('no new delve starts while an errand run\'s "What got done?" waits; it waits still', () => {
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' }).do({ do: 'addItems', lines: ['Bank', 'Post office'] });
    const ids = p.facts.filter(f => f.type === 'itemAdded').map(f => (f as { id: string }).id);
    p.do({ do: 'startErrands', jobs: ids, minutes: 30, count: 1 }).wait(31);
    expect(p.view().runEnd?.pending).toBe(true);
    const n = p.facts.length;
    p.do({ do: 'startRun', job: 'cat', minutes: 30, count: 1 });
    expect(p.facts.slice(n).some(f => f.type === 'delveStarted')).toBe(false);
    expect(p.view().run).toBe(null);
    expect(p.view().runEnd?.pending).toBe(true);
  });
});

describe('the fresh review of D-144: the finish line and Siri', () => {
  it('a recurring job ticked off a day the plan did not give it never pushes the day\'s own jobs off the line', () => {
    let checked = 0;
    for (const skip of [1, 2, 3]) {
      const p = player('2026-10-05T08:00:00+01:00').do({ do: 'open' }).do({ do: 'planWeek', week: '2026-10-05' });
      /* days away from the plan: their sessions are missed and placed again where there is room */
      p.sleep(skip * 24 * 60).do({ do: 'open' });
      /* today full, so a missed session is placed on a later day */
      p.do({ do: 'saveJob', job: { id: 'big', name: 'A long job', delve: true, length: 90, doneBy: 'dan' }, rhythm: null });
      for (const job of ['meal', 'tank', 'lesson', 'cat', 'big']) p.do({ do: 'planJob', job, day: p.view().day });
      const before = p.view().line.filter(id => !p.view().done.has(id));
      for (const job of p.view().content.rhythms.map(r => r.job)) {
        if (before.includes(job) || p.view().done.has(job)) continue;
        checked++;
        p.do({ do: 'tickOff', job, minutes: 60 });
        const still = p.view().line;
        for (const id of before) expect(still, `${skip} days, ${job} ticked: ${id} left the line`).toContain(id);
        break;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('a Siri line matching a job Dan has is remembered as taken: a second drain never adds it, even once the job is done', () => {
    const p = player('2026-10-05T09:00:00+01:00').do({ do: 'open' });
    const name = C.jobs.find(j => j.id === 'cat')!.name;
    p.do({ do: 'takeInbox', lines: [{ id: 'siri-1', text: name }] });
    expect(p.facts.some(f => f.type === 'itemAdded')).toBe(false);
    p.do({ do: 'tickOff', job: 'cat', minutes: 30 });
    p.do({ do: 'takeInbox', lines: [{ id: 'siri-1', text: name }] });
    expect(p.facts.some(f => f.type === 'itemAdded')).toBe(false);
  });
});
