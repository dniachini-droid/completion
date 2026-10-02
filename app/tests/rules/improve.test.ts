/**
 * The deep review's improvements (D-147, FIX-LIST Stage 8; MORNING-REPORT Part 3) that live in the rules: "Just this one
 * today" and which records a known mark makes read differently. (The panel's 5-minute mark is in panel.test.) Ids only.
 */
import { describe, expect, it } from 'vitest';
import { act, see, type Command } from '../../src/core/game';
import { rereadBy } from '../../src/core/reread';
import { epochOf, momentOf } from '../../src/core/time';
import type { StoryState } from '../../src/core/story';
import type { Story } from '../../src/core/story-types';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

const at = momentOf(epochOf('2026-09-28T09:00:00+01:00'), 60);
const run = (cmds: Command[]) => cmds.reduce<Fact[]>((f, c) => f.concat(act(f, C, c, at)), []);

describe('Just this one today (Part 3 #7)', () => {
  it('sets every other job still to do today aside, and Put back brings each one back', () => {
    const facts = run([{ do: 'open' }]);
    const v = see(facts, C, at), keep = v.order[0], others = v.order.filter(id => id !== keep && !v.done.has(id));
    expect(others.length).toBeGreaterThan(0);
    const put = act(facts, C, { do: 'justThis', job: keep }, at), after = facts.concat(put);
    expect(see(after, C, at).order).toEqual([keep]);
    expect(put.map(f => f.type === 'setAside' ? f.job : '').sort()).toEqual([...others].sort());
    const back = others.reduce<Fact[]>((f, job) => f.concat(act(f, C, { do: 'putBack', job }, at)), after);
    expect(see(back, C, at).order.sort()).toEqual([...v.order].sort());
  });
  it('does nothing for a job not on today, or done', () => {
    const facts = run([{ do: 'open' }]);
    expect(act(facts, C, { do: 'justThis', job: 'no-such-job' }, at)).toEqual([]);
  });
});

describe('re-reading made felt (Part 3 #8)', () => {
  const s = {
    marks: [{ id: 'mk-a', confirmedBy: 'b-1', sign: 'A' }, { id: 'mk-b', confirmedBy: 'b-2', sign: 'B' }],
    records: [{ id: 'r-1', cut: [[{ s: 'mk-a' }]] }, { id: 'r-2', cut: [[{ s: 'mk-b' }]] }, { id: 'r-3', cut: [[{ s: 'mk-a' }]] }, { id: 'r-4' }],
    beats: [{ id: 'b-1', carries: { records: ['r-3'] } }, { id: 'b-2' }],
  } as unknown as Story;
  const st = (played: string[], records: string[]) => ({ played: new Set(played), guessed: new Map(), offered: new Set(), opened: new Set(), given: new Set(), records }) as unknown as StoryState;
  it('names the records already found that carry the mark the beat made known, never one the beat itself hands over', () => {
    expect(rereadBy(s, st(['b-1'], ['r-1', 'r-2', 'r-3', 'r-4']), 'b-1')).toEqual(['r-1']);
  });
  it('nothing when the beat makes no mark known, or no record found carries it', () => {
    expect(rereadBy(s, st([], ['r-1']), 'b-1')).toEqual([]);
    expect(rereadBy(s, st(['b-2'], ['r-1', 'r-4']), 'b-2')).toEqual([]);
  });
});
