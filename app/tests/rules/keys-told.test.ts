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
      if (f.type === 'keyUsed' && !f.chosen) {
        const d = doneOf(facts, f.seq);
        if (!d || d.day !== f.day || arrivedSince(facts, d.seq, f.seq)) continue;
        expect(returnOf(C, facts, d.seq).keyNote, f.day).toBe('kept');
        keptOnReturn++;
      }
    }
    expect(earned + held).toBeGreaterThan(0);
    /* kept Keys are used later: where Dan is, on a job's return, or on the Map (D-142) */
    if (days === 35) { expect(held, 'some Keys are kept').toBeGreaterThan(0); expect(keptOnReturn + facts.filter(f => f.type === 'keyUsed' && f.chosen).length).toBeGreaterThan(0); }
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

describe('a kept Key never sits beside a niche it could open where Dan is (D-142)', () => {
  it('at every day\'s end, the Map unused, with a Key kept, no plain niche of the stretch Dan is in is open to it', async () => {
    const S = await import('../../src/core/story');
    for (const h of [2, 3]) {
      const { facts } = heavy(35, h, true, 1, { noMap: true });
      for (const day of [...new Set(facts.map(f => f.day))]) {
        const st = S.storyState(facts.filter(f => f.day <= day), C.story);
        if (!st.held) continue;
        const open = S.openable(C.story, st).filter(x => x.stretch === st.stretch && x.w <= st.week
          && !(x.beat || x.arrival || x.carries?.records?.length || x.carries?.guess?.length));
        expect(open.map(x => x.id), `${h} h, ${day}: ${st.held} kept`).toEqual([]);
      }
    }
  }, 240_000);
  it('a Key never opens by itself a niche behind Dan: only one in the stretch he is in, or one he chose on the Map', async () => {
    const S2 = await import('../../src/core/story');
    const { facts } = heavy(35, 2, true, 1, { noMap: true });
    for (const f of facts) {
      if (f.type !== 'sealOpened' || f.how === 'road') continue;
      const x = C.story.seals.find(y => y.id === f.seal)!;
      const before = facts.filter(g => g.seq < f.seq);
      /* where Dan was when it opened: the stretch of the last place reached (an arrival opening it is in that stretch) */
      expect(x.stretch, f.seal).toBe(S2.storyState(before, C.story).stretch);
    }
  }, 120_000);
});

describe('Use a Key, on the Map (D-142)', () => {
  it('opens the niche chosen, spends one Key, is refused without a Key or on a niche not yet reached, and is no arrival\'s', async () => {
    const S = await import('../../src/core/story');
    const { act } = await import('../../src/core/game');
    const { facts } = heavy(35, 2, true, 1, { noMap: true });
    const st = S.storyState(facts, C.story), list = S.openable(C.story, st);
    expect(st.held).toBeGreaterThan(0);
    expect(list.length).toBeGreaterThan(0);
    const at = facts[facts.length - 1].at;
    /* not yet reachable: refused */
    const far = C.story.seals.find(x => !x.seenOnly && !S.onRoad(C.story, x.id) && !st.opened.has(x.id) && !list.includes(x))!;
    expect(act(facts, C, { do: 'useKey', seal: far.id }, at).filter(f => f.type === 'sealOpened')).toEqual([]);
    /* the last in the list (not the oldest): Dan chooses */
    const pick = list[list.length - 1];
    const out = facts.concat(act(facts, C, { do: 'useKey', seal: pick.id }, at));
    const after = S.storyState(out, C.story);
    expect(after.opened.has(pick.id)).toBe(true);
    expect(after.held).toBe(st.held - 1);
    /* the same tap again: nothing more */
    expect(act(out, C, { do: 'useKey', seal: pick.id }, at).filter(f => f.type === 'sealOpened')).toEqual([]);
    /* with no Key left, refused */
    let spent = out;
    for (let k = 0; k < 20; k++) { const s2 = S.storyState(spent, C.story), x = S.openable(C.story, s2)[0]; if (!s2.held || !x) break; spent = spent.concat(act(spent, C, { do: 'useKey', seal: x.id }, at)); }
    const s3 = S.storyState(spent, C.story), rest = S.openable(C.story, s3);
    if (!s3.held && rest.length) expect(act(spent, C, { do: 'useKey', seal: rest[0].id }, at).filter(f => f.type === 'sealOpened')).toEqual([]);
  }, 120_000);
  it('no niche needs another niche first, so they may open in any order', async () => {
    const S = await import('../../src/core/story');
    const niches = C.story.seals.filter(x => !x.seenOnly && !S.onRoad(C.story, x.id));
    const ids = new Set(niches.map(x => x.id));
    for (const x of niches) {
      const by = C.story.beats.filter(b => b.carries?.inView?.includes(x.id));
      for (const b of by) for (const r of b.req) expect(ids.has(r), `${x.id} seen by ${b.id} after ${r}`).toBe(false);
    }
  });
});
