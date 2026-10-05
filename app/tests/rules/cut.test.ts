/**
 * Slice 3, learning the Cut (MVP.md → build order; SCRIPT §8–9; the story job's §6–7): guesses, the place confirming
 * them, a struck guess, the marks screen's list, the first word, and a deep push's partial sign.
 * Ids only: no story text is asserted here (D-015).
 */
import { describe, expect, it } from 'vitest';
import { act, see, returnOf } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim } from './sim';

const mark = (id: string) => S.markOf(C.story, id)!;
/** A story state with these beats played and these guesses made (no clock needed for reading). */
function state(played: string[], guesses: Record<string, string>): S.StoryState {
  const st = S.storyState([], C.story);
  played.forEach(b => st.played.add(b));
  Object.entries(guesses).forEach(([m, g]) => st.guessed.set(m, g));
  return st;
}

describe('a guess, and the place confirming it', () => {
  it('reads as a guess until its confirming beat plays; then a right guess holds', () => {
    const m = mark('mk-lamp'), right = m.right![0];
    const before = S.markHeld(m, state([], { [m.id]: right }))!;
    expect(before).toMatchObject({ asGuess: true, confirmed: false, struck: false, word: right });
    const after = S.markHeld(m, state([m.confirmedBy!], { [m.id]: right }))!;
    expect(after).toMatchObject({ asGuess: false, confirmed: true, struck: false, word: right });
  });
  it('the tempting wrong guess is struck only when the place answers, and the mark then reads as what it is', () => {
    const m = mark('mk-fire');
    expect(S.markHeld(m, state([], { [m.id]: m.tempting! }))).toMatchObject({ struck: false, asGuess: true, word: m.tempting });
    const h = S.markHeld(m, state([m.confirmedBy!], { [m.id]: m.tempting! }))!;
    expect(h).toMatchObject({ struck: true, asGuess: false, word: m.candidates![0] });
    const settled = S.settledBy(C.story, state([m.confirmedBy!], { [m.id]: m.tempting! }), m.confirmedBy!);
    expect(settled.find(x => x.mark === m.id)?.struck).toBe(m.struck);
  });
  it('a true second sense is never struck', () => {
    for (const m of C.story.marks.filter(x => x.right && x.right.length > 1 && !x.provisional)) {
      for (const g of m.right!) expect(S.markHeld(m, state([m.confirmedBy!], { [m.id]: g }))!.struck, `${m.id}:${g}`).toBe(false);
    }
  });
  it('a mark never guessed is learned when the place confirms it (failure is information)', () => {
    const m = mark('mk-lamp');
    expect(S.markHeld(m, state([], {}))).toBeNull();
    expect(S.markHeld(m, state([m.confirmedBy!], {}))).toMatchObject({ guess: null, asGuess: false, word: m.candidates![0] });
    expect(S.settledBy(C.story, state([m.confirmedBy!], {}), m.confirmedBy!)).toEqual([]);
  });
  it('a provisional mark keeps its right guesses as guesses; only the tempting one is struck', () => {
    const m = mark('mk-give');
    expect(m.provisional).toBe(true);
    expect(S.markHeld(m, state([m.confirmedBy!], { [m.id]: m.right![1] }))).toMatchObject({ asGuess: true, struck: false });
    expect(S.markHeld(m, state([m.confirmedBy!], { [m.id]: m.tempting! }))).toMatchObject({ struck: true, asGuess: true });
    expect(S.settledBy(C.story, state([m.confirmedBy!], { [m.id]: m.right![0] }), m.confirmedBy!)).toEqual([]);
  });
});

describe('guessing: one tap, changeable until the place answers', () => {
  const at = '2026-09-28T10:00:00+01:00';
  it('a guess can change before its confirming beat, never after, and only to a candidate', () => {
    let facts: Fact[] = [];
    const run = (m: string, g: string) => { facts = facts.concat(act(facts, C, { do: 'guess', mark: m, guess: g }, at)); };
    const m = mark('mk-lamp');
    run(m.id, m.candidates![1]); run(m.id, m.candidates![0]); run(m.id, 'not a candidate');
    expect(S.storyState(facts, C.story).guessed.get(m.id)).toBe(m.candidates![0]);
    facts.push({ seq: facts.length + 1, at, day: '2026-09-28', type: 'arrived', kind: 'place', id: m.confirmedBy!, how: 'foot' });
    run(m.id, m.candidates![2]);
    expect(S.storyState(facts, C.story).guessed.get(m.id)).toBe(m.candidates![0]);
  });
});

describe('weeks of play: the first word and the marks screen', () => {
  it('Normal weeks: the first word is cut and confirms the guesses it answers; no mark reads before it is held', () => {
    const p = sim();
    for (let w = 0; w < 3; w++) p.week('normal');
    const st = p.st(), held = S.marksHeld(C.story, st);
    expect(st.played.has('b-3.A')).toBe(true);
    const answered = C.story.marks.filter(m => m.confirmedBy === 'b-3.A');
    expect(answered.length).toBeGreaterThan(0);
    for (const m of answered) expect(held.get(m.id), m.id).toMatchObject({ confirmed: true, asGuess: false });
    /* the word's provisional mark stays a guess (its contest is the story's) */
    for (const m of C.story.words[0].marks.map(mark).filter(m => m.provisional)) expect(held.get(m.id)?.asGuess, m.id).toBe(true);
    /* every mark rendered in English in a record shown is one Dan holds; every other is still a glyph */
    for (const r of st.records) for (const line of S.recordOf(C.story, r)!.cut ?? []) {
      S.render(line, held, C.story).forEach((tk, i) => {
        const src = line[i];
        if (tk.t === 'word' && 's' in src && !('ring' in src)) expect(held.has(src.s as string), `${r}:${src.s}`).toBe(true);
        if ('s' in src && !('ring' in src) && !held.has(src.s as string)) expect(tk.t, `${r}:${src.s}`).toBe('glyph');
      });
    }
    /* the marks screen lists every mark met, and none it hasn't: no mark before its week */
    const seen = S.marksSeen(C.story, st);
    expect(seen.length).toBeGreaterThan(3);
    for (const x of seen) if (x.state === 'held' || x.state === 'guess') expect(mark(x.id).w, x.id).toBeLessThanOrEqual(st.week + 1);
    expect(seen.find(x => x.id === C.story.words[0].marks[0])?.state).toBe('held');
  });
  it('a Dan who always picks the tempting guess still reaches the word, and sees his guesses struck, never stuck', () => {
    const p = sim(undefined, m => m.tempting ?? m.candidates![0]);
    for (let w = 0; w < 3; w++) p.week('normal');
    const st = p.st();
    expect(st.played.has('b-3.A')).toBe(true);
    const struck = S.marksSeen(C.story, st).filter(x => x.struck);
    expect(struck.length).toBeGreaterThan(0);
    /* a provisional mark's right readings stay guesses after its tempting one is struck (SCRIPT §7.6) */
    for (const x of struck) expect(x.state).toBe(S.markOf(C.story, x.id)!.provisional ? 'guess' : 'held');
  });
  it('every mark on the marks screen has a drawing in the Cut\'s lettering', async () => {
    const { lettering } = await import('../../src/content/sealed/lettering');
    for (const m of C.story.marks) expect(lettering[m.id]?.d !== undefined, m.id).toBe(true);
  });
});

describe('a deep push: part of a sign', () => {
  it('a High day past a Normal day\'s size plays the deep beat as a job\'s return, once a day, with its partial sign', () => {
    const p = sim().week('high');
    const st = p.st();
    const deep = C.story.beats.filter(b => b.kind === 'deep' && st.played.has(b.id));
    expect(deep.length).toBeGreaterThan(0);
    const days = new Map<string, number>();
    for (const f of p.facts) if (f.type === 'beatPlayed' && deep.some(b => b.id === f.id)) days.set(f.day, (days.get(f.day) ?? 0) + 1);
    for (const n of days.values()) expect(n).toBe(1);
    /* its return carries the element, and the mark it belongs to */
    const f = p.facts.find(x => x.type === 'beatPlayed' && x.id === deep[0].id) as Fact & { job: number };
    const r = returnOf(C, p.facts, f.job);
    expect(r.part?.el).toBe(deep[0].carries?.partial);
  });
  it('Normal weeks never play a deep beat', () => {
    const p = sim().week('normal').week('normal');
    expect(C.story.beats.filter(b => b.kind === 'deep').some(b => p.st().played.has(b.id))).toBe(false);
  });
  it('the partial shows on the marks screen until the full mark is offered', () => {
    const b = C.story.beats.find(x => x.kind === 'deep' && x.carries?.partial)!;
    const m = b.carries!.seen![0];
    const st = state([...b.req, b.id], {});
    expect(S.marksSeen(C.story, st).find(x => x.id === m)).toMatchObject({ state: 'part', part: b.carries!.partial });
    const view = see([], C, '2026-09-28T10:00:00+01:00');
    expect(view.story.guessed.size).toBe(0);
  });
});
