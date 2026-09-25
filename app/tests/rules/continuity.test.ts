/**
 * The continuity guard (D-079): across many ways of playing six weeks, nothing the story shows may belong to a stretch
 * of the route Dan has never reached. Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim, type Week } from './sim';

/** The stretches Dan has set foot in (the route loops back, so "reached" means ever reached). */
function visited(facts: Fact[]): Set<string> {
  const out = new Set<string>([C.story.stretches[0].id]);
  for (const f of facts) if (f.type === 'arrived' && f.kind === 'place') { const b = S.beatOf(C.story, f.id); if (b) out.add(b.stretch); }
  return out;
}

/** Every story item shown in a stretch Dan has never reached: "kind:id (its stretch; where Dan is)". */
export function aheadOfDan(facts: Fact[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    let id: string | undefined, stretch: string | undefined;
    /* exempt: a Key whose opening carries Dan there, and a deep push, which goes further in on purpose */
    if (f.type === 'sealOpened') { const x = S.sealOf(C.story, f.seal); if (x?.arrival) continue; id = f.seal; stretch = x?.stretch; }
    else if (f.type === 'beatPlayed' && f.id !== 'passage') { const b = S.beatOf(C.story, f.id); if (b?.kind === 'deep') continue; id = f.id; stretch = b?.stretch; }
    if (!id || !stretch) continue;
    const before = facts.slice(0, i);
    if (!visited(before).has(stretch)) out.push(`${f.type}:${id} (${stretch}; Dan at ${S.storyState(before, C.story).stretch})`);
  }
  return [...new Set(out)];
}

const PLANS: [string, Week[]][] = [
  ['normal', ['normal', 'normal', 'normal', 'normal', 'normal', 'normal']],
  ['low', ['low', 'low', 'low', 'low', 'low', 'low']],
  ['high', ['high', 'high', 'high', 'high', 'high', 'high']],
  ['mixed', ['normal', 'low', 'high', 'away', 'normal', 'low']],
  ['away first', ['away', 'normal', 'normal', 'normal', 'normal', 'normal']],
  ['high then low', ['high', 'high', 'low', 'low', 'low', 'normal']],
  ['two weeks away', ['normal', 'away', 'away', 'normal', 'high', 'normal']],
];

describe('The continuity guard: the story never runs ahead of where Dan is (D-079)', () => {
  for (const [name, weeks] of PLANS) {
    it(`${name} weeks`, () => {
      for (const bed of [undefined, 'kept', 'late'] as const) {
      const p = sim(undefined, undefined, bed);
      for (const w of weeks) p.week(w);
      expect(aheadOfDan(p.facts)).toEqual([]);
      }
    }, 60_000);
  }
});

describe('A Key earned before its sealed thing is reached is kept, never lost (D-079)', () => {
  it('kept Keys are used on arrival and shown there', () => {
    const p = sim();
    for (const w of ['normal', 'normal', 'normal', 'normal', 'normal', 'normal'] as Week[]) p.week(w);
    const held = p.facts.filter(f => f.type === 'keyHeld').length, used = p.facts.filter(f => f.type === 'keyUsed').length;
    expect(used).toBeLessThanOrEqual(held);
    expect(S.storyState(p.facts, C.story).held).toBe(held - used);
    if (used) {
      const k = p.facts.find(f => f.type === 'keyUsed')!;
      const arr = [...p.facts].reverse().find(f => f.type === 'arrived' && f.seq < k.seq)!;
      expect(arr.type).toBe('arrived');
    }
  }, 60_000);
});
