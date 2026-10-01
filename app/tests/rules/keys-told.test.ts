/**
 * Every Key a recurring job earns is told on that job's return, when it is earned, whether it opens something at once or
 * is kept for later; a kept Key that opens something later says it was kept, never that the job in hand earned it
 * (Dan, 2026-10-01, D-141). Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import { returnOf } from '../../src/core/game';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { heavy } from '../review/heavy';

/* the Done whose facts a fact was written with: the last jobDone before it, the same day */
const doneOf = (facts: Fact[], seq: number) => [...facts].reverse().find(f => f.seq < seq && f.type === 'jobDone');
const arrivedSince = (facts: Fact[], from: number, to: number) => facts.some(f => f.seq > from && f.seq < to && f.type === 'arrived');

describe('Keys are told when earned, and kept Keys are told as kept (D-141)', () => {
  /* five weeks at 2 hours runs ahead of the niches in reach, so some Keys are kept for later */
  for (const [days, h] of [[21, 3], [21, 8], [35, 2]] as const) it(`${h} hours a day for ${days} days`, () => {
    const { facts } = heavy(days, h);
    let earned = 0, held = 0, keptOnReturn = 0;
    for (const f of facts) {
      if (f.type === 'keyEarned' && !f.rhythm.startsWith('floor:')) {
        const d = doneOf(facts, f.seq)!;
        const next = facts.find(g => g.seq === f.seq + 1)!;
        expect(returnOf(C, facts, d.seq).keyNote, `${f.day} ${f.rhythm}`).toBe(next.type === 'keyHeld' ? 'held' : 'earned');
        if (next.type === 'keyHeld') held++; else earned++;
      }
      /* a kept Key used on a job's return (not on an arrival the same Done reached) */
      if (f.type === 'keyUsed') {
        const d = doneOf(facts, f.seq);
        if (!d || d.day !== f.day || arrivedSince(facts, d.seq, f.seq)) continue;
        expect(returnOf(C, facts, d.seq).keyNote, f.day).toBe('kept');
        keptOnReturn++;
      }
    }
    expect(earned + held).toBeGreaterThan(0);
    if (days === 35) { expect(held, 'some Keys are kept').toBeGreaterThan(0); expect(keptOnReturn).toBeGreaterThan(0); }
  }, 120_000);
});

describe('Today shows the Keys kept and what needs one (Dan, D-142)', () => {
  it('the count is the Keys earned and not yet used; "Needs a Key" only on a sealed thing a Key alone opens', async () => {
    const S = await import('../../src/core/story');
    const { see } = await import('../../src/core/game');
    const { facts } = heavy(35, 2);
    let kept = 0, needs = 0;
    for (const day of [...new Set(facts.map(f => f.day))]) {
      const upTo = facts.filter(f => f.day <= day), last = upTo[upTo.length - 1];
      const v = see(upTo, C, last.at), st = S.storyState(upTo, C.story);
      expect(v.keys, day).toBe(st.held);
      const view = S.inView(C.story, st);
      expect(v.aheadKey, day).toBe(!!view && !S.onRoad(C.story, view.id));
      if (v.keys) kept++; if (v.aheadKey) needs++;
    }
    /* a light worker holds a Key on some days, and meets something only a Key opens */
    expect(kept).toBeGreaterThan(0);
    expect(needs).toBeGreaterThan(0);
  }, 120_000);
});

describe('a kept Key never sits beside a niche it could open (D-142)', () => {
  it('at every day\'s end, with a Key kept, no plain niche of the story so far is open to it', async () => {
    const S = await import('../../src/core/story');
    for (const h of [2, 3]) {
      const { facts } = heavy(35, h);
      for (const day of [...new Set(facts.map(f => f.day))]) {
        const st = S.storyState(facts.filter(f => f.day <= day), C.story);
        if (!st.held) continue;
        /* a plain niche (no story of its own) that is due and can be reached: a Key should have opened it */
        const open = C.story.seals.filter(x => !x.seenOnly && !st.opened.has(x.id) && !S.onRoad(C.story, x.id) && x.w <= st.week
          && !(x.beat || x.arrival || x.carries?.records?.length || x.carries?.guess?.length) && S.mayOpen(C.story, st, x));
        expect(open.map(x => x.id), `${h} h, ${day}: ${st.held} kept`).toEqual([]);
      }
    }
  }, 240_000);
});
