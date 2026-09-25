/**
 * The continuity guard (D-079): across many ways of playing six weeks, nothing the story shows may belong to a stretch
 * of the route Dan has never reached; and (the playable's story review) nothing may come before what it depends on, a
 * skipped guess never holds the story up, a guess is asked where its marks are, and a Normal week keeps its pace.
 * Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim, type Week } from './sim';
import { see } from '../../src/core/game';
import { lettering } from '../../src/content/sealed/lettering';

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
 * a mark confirmed before it was offered; a sealed thing opened before the beat that brings it into view; a place a
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
    if (confirms.length) { const s = st(i); for (const m of confirms) if (!s.offered.has(m.id)) out.push(`confirmed:${m.id} (${id} before its offer)`); }
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
      expect(outOfOrder(p.facts)).toEqual([]);
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

describe('The story never waits on a guess (story review, 2026-09-25)', () => {
  it('a Dan who never answers a guess still reaches story week 6 in six Normal weeks, everything in order', () => {
    for (const bed of [undefined, 'kept'] as const) {
      const p = sim(undefined, () => null, bed);
      for (let w = 0; w < 6; w++) p.week('normal');
      const st = p.st();
      expect(st.guessed.size).toBe(0);
      expect(st.week).toBe(6);
      expect(st.played.has('b-3.A')).toBe(true);   /* the first word */
      expect(aheadOfDan(p.facts)).toEqual([]);
      expect(outOfOrder(p.facts)).toEqual([]);
    }
  }, 60_000);
  it('the word asks for any mark its req names that is still unguessed (offered is enough to reach it)', () => {
    for (const w of C.story.beats.filter(b => b.kind === 'word')) {
      for (const r of w.req.filter(x => x.startsWith('mk-'))) {
        expect(C.story.beats.some(b => b.carries?.guess?.includes(r)) || C.story.seals.some(x => x.carries?.guess?.includes(r)), `${w.id} ${r}`).toBe(true);
      }
    }
  });
});

describe('Guesses are asked where their marks are, never where they are answered (story review)', () => {
  it('each mark is offered only at its own guessing place (or the sealed thing that plays it)', () => {
    const at = (m: string) => S.markOf(C.story, m)!.guessAt!;
    const bad: string[] = [];
    for (const b of C.story.beats) for (const m of b.carries?.guess ?? []) if (at(m) !== b.id && at(m) !== b.seal) bad.push(`${b.id}:${m}`);
    for (const x of C.story.seals) for (const m of x.carries?.guess ?? []) if (at(m) !== x.id && at(m) !== x.beat && at(m) !== x.arrival) bad.push(`${x.id}:${m}`);
    expect(bad).toEqual([]);
  });
  it('an arrival never asks a guess it confirms, and asks only marks it or a tablet opened on it carries', () => {
    for (const plan of ['normal', 'high', 'low'] as Week[]) {
      const p = sim();
      for (let w = 0; w < 6; w++) p.week(plan);
      const facts = p.facts, bad: string[] = [];
      let asked = 0;
      for (const f of facts) {
        if (f.type !== 'arrived' || f.kind !== 'place') continue;
        const seenAt = facts.find(g => g.type === 'seen' && g.what === 'arrival' && g.ref === f.seq);
        const before = seenAt ? facts.filter(g => g.seq < seenAt.seq) : facts;
        const a = see(before, C, before[before.length - 1].at).arrival;
        if (!a || a.seq !== f.seq) continue;
        const b = S.beatOf(C.story, f.id)!, here = S.marksIn(C.story, b.carries?.records ?? []);
        for (const m of a.guess) {
          asked++;
          if (S.markOf(C.story, m)?.confirmedBy === f.id) bad.push(`${f.id}:${m} (its own confirmation)`);
          const tablet = a.opened.length > 0;
          if (!(b.carries?.guess ?? []).includes(m) && !here.includes(m) && !tablet) bad.push(`${f.id}:${m} (not carried here)`);
        }
      }
      expect(bad, plan).toEqual([]);
      expect(asked, plan).toBeGreaterThan(0);
    }
  }, 120_000);
});

describe('The pace of a Normal week (story review)', () => {
  it('next week’s places only on a deep push; one place a day on foot; never the same camp view two days running', () => {
    const p = sim();
    for (let w = 0; w < 6; w++) p.week('normal');
    const facts = p.facts, bad: string[] = [];
    const days = [...new Set(facts.map(f => f.day))];
    let lastCamp: string | null = null;
    for (const d of days) {
      const foot = facts.filter(f => f.day === d && f.type === 'arrived' && f.kind === 'place' && f.how !== 'key');
      if (foot.length > 1) bad.push(`${d}: ${foot.length} places on foot`);
      for (const f of foot) {
        const i = facts.indexOf(f), b = S.beatOf(C.story, (f as { id: string }).id)!, st = S.storyState(facts.slice(0, i), C.story);
        if (b.w > st.week && b.id !== 'b-3.A') bad.push(`${d}: ${b.id} ahead of story week ${st.week}`);
      }
      const camp = facts.find(f => f.day === d && f.type === 'arrived' && f.kind === 'camp') as { id: string } | undefined;
      if (camp && camp.id === lastCamp) bad.push(`${d}: ${camp.id} again`);
      lastCamp = camp?.id ?? null;
    }
    expect(bad).toEqual([]);
    expect(p.st().week).toBe(6);
  }, 60_000);
});

describe('Mornings and hands (story review)', () => {
  it('without a single kept bedtime, every mark a morning confirms is confirmed once its tablet has opened', () => {
    const p = sim(undefined, undefined, 'late');
    for (let w = 0; w < 6; w++) p.week('normal');
    const st = p.st();
    for (const m of C.story.marks.filter(x => x.confirmedBy?.endsWith('.morning'))) {
      if (st.offered.has(m.id)) expect(st.played.has(m.confirmedBy!), m.id).toBe(true);
    }
    expect(st.played.has('b-w4.morning')).toBe(true);
  }, 60_000);
  it('her hand-mark is drawn as its own shape and is not listed as his', () => {
    expect(lettering['mk-hand-hers'].d).not.toBe(lettering['mk-hand'].d);
    const hers = C.story.records.filter(r => r.cut?.some(l => l.some(tk => 'hand' in tk && tk.hand === 'hers')) && !r.cut?.some(l => l.some(tk => 'hand' in tk && tk.hand === 'his')));
    expect(hers.length).toBeGreaterThan(0);
    const st = S.storyState([], C.story);
    st.records.push(...hers.map(r => r.id));
    expect(S.marksSeen(C.story, st).some(x => x.id === 'mk-hand')).toBe(false);
  });
});

describe('Seven weeks reach the story’s turn (Dan: the test runs seven weeks, D-082)', () => {
  for (const kind of ['normal', 'low'] as const) {
    it(`${kind}: story week 7 begins by the seventh calendar week, nothing out of place`, () => {
      const p = sim();
      for (let i = 0; i < 7; i++) p.week(kind);
      expect(S.storyState(p.facts, C.story).week).toBe(7);
      expect(aheadOfDan(p.facts)).toEqual([]);
    }, 120_000);
  }
});

describe('The opening is never replayed as a morning after camp', () => {
  it('the hillside opening does not play once Dan has been underground (bedtime kept or late)', () => {
    for (const bed of ['kept', 'late'] as const) {
      const s = sim(undefined, undefined, bed).week('normal');
      const opening = C.story.beats.find(b => b.kind === 'morning' && b.w === 1)!.id;
      const firstJob = s.facts.find(f => f.type === 'jobDone');
      const late = s.facts.filter(f => f.type === 'beatPlayed' && (f as { id: string }).id === opening && firstJob && f.seq > firstJob.seq);
      expect(late, `bedtime ${bed}`).toHaveLength(0);
    }
  });
});

describe('A find never describes a place Dan has not reached', () => {
  it('every find given is from an area already walked into (bedtime kept, late, none)', () => {
    for (const bed of ['kept', 'late', undefined] as const) {
      const s = sim(undefined, undefined, bed).week('normal').week('normal');
      const facts = s.facts;
      for (const f of facts) {
        if (f.type !== 'findGiven') continue;
        const find = C.story.finds.find(x => x.id === (f as { id: string }).id)!;
        const st = S.storyState(facts.filter(x => x.seq <= f.seq), C.story);
        expect(st.visited.has(find.stretch), `${find.id} in ${find.stretch}, bedtime ${bed}`).toBe(true);
      }
    }
  });
});
