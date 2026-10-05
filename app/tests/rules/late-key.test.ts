/**
 * A recurring job's Key follows its marks (Dan, 2026-10-05, D-152): Gym made to repeat mid-week and done 4 times got no
 * Key, with 4 of 4 under its row. Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import { epochOf, momentOf } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

function player(start: string) {
  let facts: Fact[] = [];
  let ms = epochOf(start);
  const at = () => momentOf(ms, 60);
  const p = {
    get facts() { return facts; },
    do(cmd: Command) { facts = facts.concat(act(facts, C, cmd, at())); return p; },
    wait(min: number) { ms += min * 60_000; facts = facts.concat(settle(facts, C, at())); return p; },
    to(day: string, time = '09:00') { ms = epochOf(`${day}T${time}:00+01:00`); return p; },
    view() { return see(facts, C, at()); },
    look() {
      for (let k = 0; k < 20; k++) { const a = see(facts, C, at()).arrival; if (!a) break; p.do({ do: 'seen', what: 'arrival', ref: a.seq }); }
      const e = see(facts, C, at()).runEnd; if (e) p.do({ do: 'seen', what: 'step', ref: e.seq });
      return p;
    },
    delve(job: string, min = 30) { return p.do({ do: 'startRun', job, minutes: min, count: 1 }).wait(min + 1).look(); },
  };
  return p;
}
const keys = (facts: Fact[]) => facts.filter(f => f.type === 'keyEarned');
const gym = C.jobs.find(j => j.id === 'gym')!, gymR = C.rhythms.find(r => r.job === 'gym')!;
/** Gym stopped before the week, made to repeat again on Wednesday 30 September. */
function midWeek() {
  const p = player('2026-09-21T09:00:00+01:00');
  p.do({ do: 'open' }).do({ do: 'stopRhythm', id: gymR.id });
  p.to('2026-09-30').do({ do: 'open' }).do({ do: 'saveRhythm', rhythm: { ...gymR, id: 'r-gym2' }, job: gym });
  return p;
}

describe("a recurring job's Key follows its marks", () => {
  it('made to repeat mid-week, its fourth session that week lands the Key', () => {
    const p = midWeek();
    for (const d of ['2026-10-01', '2026-10-02', '2026-10-03']) p.to(d).do({ do: 'open' }).delve('gym');
    expect(keys(p.facts)).toHaveLength(0);
    p.to('2026-10-04').do({ do: 'open' }).delve('gym');
    expect(keys(p.facts)).toHaveLength(1);
    /* and no second Key at the next opening */
    p.to('2026-10-05').do({ do: 'open' });
    expect(keys(p.facts)).toHaveLength(1);
    expect(p.view().lateKeys).toEqual([]);
  });

  it("a week met with no Key (a save from before the fix) lands its Key at Monday's opening, said once on Today", () => {
    const p = midWeek();
    for (const d of ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']) p.to(d).do({ do: 'open' }).delve('gym');
    /* the old rule's outcome: take the Key and what it brought out, as a save from before the fix holds it */
    const k = keys(p.facts)[0];
    const old = p.facts.filter(f => f.seq !== k.seq && !(f.type === 'keyHeld' && f.seq === k.seq + 1));
    const facts = old.concat(act(old, C, { do: 'open' }, momentOf(epochOf('2026-10-05T09:00:00+01:00'), 60)));
    const late = keys(facts);
    expect(late).toHaveLength(1);
    expect(late[0]).toMatchObject({ day: '2026-10-05', for: '2026-10-04' });
    const v = see(facts, C, momentOf(epochOf('2026-10-05T09:05:00+01:00'), 60));
    expect(v.lateKeys).toEqual([gym.name]);
    expect(v.keys).toBeGreaterThanOrEqual(1);
    /* counted to last week: this week's own Key for Gym still lands on its fourth session */
    const again = facts.concat(act(facts, C, { do: 'open' }, momentOf(epochOf('2026-10-05T10:00:00+01:00'), 60)));
    expect(keys(again)).toHaveLength(1);
    expect(see(again, C, momentOf(epochOf('2026-10-06T09:00:00+01:00'), 60)).lateKeys).toEqual([]);
  });

  it('three of four last week lands nothing late', () => {
    const p = midWeek();
    for (const d of ['2026-10-01', '2026-10-02', '2026-10-03']) p.to(d).do({ do: 'open' }).delve('gym');
    p.to('2026-10-05').do({ do: 'open' });
    expect(keys(p.facts)).toHaveLength(0);
  });

  it('a job made to repeat this week is not paid for last week', () => {
    const p = player('2026-09-21T09:00:00+01:00');
    p.do({ do: 'open' }).do({ do: 'stopRhythm', id: gymR.id });
    for (const d of ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01']) p.to(d).do({ do: 'open' }).delve('gym');
    p.to('2026-10-05').do({ do: 'open' }).do({ do: 'saveRhythm', rhythm: { ...gymR, id: 'r-gym2' }, job: gym });
    p.to('2026-10-06').do({ do: 'open' });
    expect(keys(p.facts)).toHaveLength(0);
  });
});
