/**
 * The continuity guards (D-079; the playable's story review), shared by the rule tests. Ids only: no story text.
 */
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

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

/**
 * Every story moment that came before what it depends on (the story review, 2026-09-25), as "kind:id (what it lacked)":
 * a mark confirmed before it was offered (a numeral, which has no candidates, is learned with its bundle, never offered); a sealed thing opened before the beat that brings it into view; a place a
 * Key plays before its own req; a camp line before what it describes, or after the story moved past it; a glimpse
 * the story has moved past.
 */
export function outOfOrder(facts: Fact[]): string[] {
  const out: string[] = [];
  const st = (i: number) => S.storyState(facts.slice(0, i), C.story);
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    const id = f.type === 'beatPlayed' ? f.id : f.type === 'arrived' && f.kind === 'place' ? f.id : f.type === 'sealOpened' ? f.seal : null;
    if (!id || id === 'passage') continue;
    const confirms = C.story.marks.filter(m => m.confirmedBy === id);
    if (confirms.length) { const s = st(i); for (const m of confirms) if (!s.offered.has(m.id) && m.candidates?.length) out.push(`confirmed:${m.id} (${id} before its offer)`); }
    if (f.type === 'sealOpened') {
      const by = C.story.beats.filter(b => b.carries?.inView?.includes(id));
      if (by.length && !by.some(b => st(i).played.has(b.id))) out.push(`sealOpened:${id} (before ${by.map(b => b.id).join('/')})`);
      continue;
    }
    const b = S.beatOf(C.story, id);
    if (!b) continue;
    if (b.kind !== 'morning') {
      const s = st(i), lacks = b.req.filter(r => !S.met(s, r));
      if (lacks.length) out.push(`${b.kind}:${id} (before ${lacks.join('/')})`);
      if (b.until && S.met(s, b.until)) out.push(`${b.kind}:${id} (after ${b.until})`);
    }
  }
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    if (f.type !== 'welcomed' || !f.question) continue;
    const q = C.story.openQuestions.find(x => x.id === f.question);
    if (q?.until && S.met(st(i), q.until)) out.push(`welcomed:${q.id} (after ${q.until})`);
  }
  return [...new Set(out)];
}

