/**
 * The continuity guard (D-079): across many ways of playing six weeks, nothing the story shows may belong to a stretch
 * of the route Dan has not reached yet. Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim, type Week } from './sim';

const order = C.story.stretches.map(s => s.id);
const rank = (id: string | undefined) => (id ? order.indexOf(id as never) : -1);

/** Every story item shown ahead of Dan's place on the route: "kind:id (item stretch > Dan's stretch)". */
export function aheadOfDan(facts: Fact[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    let id: string | undefined, stretch: string | undefined;
    if (f.type === 'sealOpened') { id = f.seal; stretch = S.sealOf(C.story, f.seal)?.stretch; }
    else if (f.type === 'beatPlayed' && f.id !== 'passage') { const b = S.beatOf(C.story, f.id); id = f.id; stretch = b?.stretch; }
    if (!id || !stretch) continue;
    const here = S.storyState(facts.slice(0, i), C.story).stretch;
    if (rank(stretch) > rank(here)) out.push(`${f.type}:${id} (${stretch} > ${here})`);
  }
  return [...new Set(out)];
}

const PLANS: [string, Week[]][] = [
  ['normal', ['normal', 'normal', 'normal', 'normal', 'normal', 'normal']],
  ['low', ['low', 'low', 'low', 'low', 'low', 'low']],
  ['high', ['high', 'high', 'high', 'high', 'high', 'high']],
  ['mixed', ['normal', 'low', 'high', 'away', 'normal', 'low']],
  ['away first', ['away', 'normal', 'normal', 'normal', 'normal', 'normal']],
];

describe('The continuity guard: the story never runs ahead of where Dan is (D-079)', () => {
  for (const [name, weeks] of PLANS) {
    it(`${name} weeks`, () => {
      const p = sim();
      for (const w of weeks) p.week(w);
      expect(aheadOfDan(p.facts)).toEqual([]);
    });
  }
});
