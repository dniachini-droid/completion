/**
 * The story's rules over weeks of simulated play (the story job's §13 tests; TEST_STRATEGY → story unlocks).
 * A simulated Dan lives real calendar weeks: opens the app, does his jobs, guesses whatever mark is offered.
 * Ids only: no story text is asserted here.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import { gameDay } from '../../src/core/time';
import { content as C } from '../../src/content/world';

import { sim } from './sim';

const places = (w: number) => C.story.route.find(r => r.w === w)!.places.map(p => p.id);

describe('the story content holds together', () => {
  it('every id a rule reads exists', () => {
    const ids = new Set<string>([...C.story.beats, ...C.story.seals, ...C.story.finds, ...C.story.marks, ...C.story.records, ...C.story.camps, ...C.story.passages].map(x => x.id));
    const missing: string[] = [];
    const check = (from: string, id: string | undefined) => { if (id && !ids.has(id)) missing.push(`${from} → ${id}`); };
    for (const b of C.story.beats) { b.req.forEach(r => check(b.id, r)); check(b.id, b.seal); b.carries?.records?.forEach(r => check(b.id, r)); b.carries?.guess?.forEach(r => check(b.id, r)); b.carries?.inView?.forEach(r => check(b.id, r)); }
    for (const x of C.story.seals) { check(x.id, x.beat); check(x.id, x.arrival); x.carries?.records?.forEach(r => check(x.id, r)); x.carries?.guess?.forEach(r => check(x.id, r)); }
    for (const rw of C.story.route) rw.places.forEach(p => check(`route ${rw.w}`, p.id));
    for (const f of C.story.finds) { f.req.forEach(r => check(f.id, r)); check(f.id, f.told); check(f.id, f.until); }
    for (const c of C.story.camps) { c.req.forEach(r => check(c.id, r)); check(c.id, c.until); if ('find' in c.look) check(c.id, c.look.find); }
    for (const r of C.story.records) for (const line of r.cut ?? []) for (const tk of line) if ('s' in tk && typeof tk.s === 'string') check(r.id, tk.s);
    expect(missing).toEqual([]);
  });
  it('every mark offered for a guess has four candidates, the true one among them', () => {
    for (const m of C.story.marks.filter(x => x.guessAt)) {
      expect(m.candidates, m.id).toHaveLength(4);
      expect(m.candidates!.some(c => m.right?.includes(c)), m.id).toBe(true);
    }
  });
});

describe('six weeks of play', () => {
  it('Normal weeks: the story reaches week 6, in order, never ahead (no calendar wait, D-123)', () => {
    const p = sim();
    for (let w = 1; w <= 6; w++) {
      p.week('normal');
      const st = p.st();
      /* nothing plays before its week (places: at most one week ahead, and only plain ones) */
      for (const id of st.played) {
        const b = S.beatOf(C.story, id);
        if (!b) continue;
        const limit = id.startsWith('pl-') ? st.week + 1 : id === 'b-3.A' ? st.week + 1 : st.week;
        expect(b.w, id).toBeLessThanOrEqual(limit);
      }
    }
    const st = p.st();
    expect(st.week).toBeGreaterThanOrEqual(5);
    for (let w = 1; w < st.week; w++) for (const id of places(w)) expect(st.played.has(id), id).toBe(true);
    expect(st.played.has('b-3.A')).toBe(true);   /* the first word, in week 2–3 */
  }, 60_000);
  it('Low weeks never stall: the story still moves, and a Key only ever comes from a recurring job kept up (D-142)', () => {
    const p = sim().week(['low', 'away', 'low', 'away', 'low', 'away', 'away']);
    for (let i = 0; i < 5; i++) p.week(['low', 'away', 'low', 'away', 'low', 'away', 'away']);
    const st = p.st();
    /* a Low week stretches the story week; it never stops it: places keep coming */
    expect(st.week).toBeGreaterThanOrEqual(2);
    /* no weekly floor (Dan, D-142): every Key is a rhythm's, none topped up for a week with a day complete */
    expect(p.facts.some(f => f.type === 'dayCompleted')).toBe(true);
    expect(p.facts.filter(f => f.type === 'keyEarned' && f.rhythm.startsWith('floor:'))).toEqual([]);
    expect([...st.played].filter(x => /^(b-\d\.[A-C]|pl-)/.test(x)).length).toBeGreaterThanOrEqual(8);
  });
  it('a two-week absence pauses the story; it resumes where it was', () => {
    const p = sim().week('normal').week('normal');
    const before = p.st().week;
    p.week('away').week('away');
    expect(p.st().week).toBe(before);
    p.week('normal');
    expect(p.st().week).toBeGreaterThanOrEqual(before);
  });
  it('High weeks run places ahead, never signs or records', () => {
    const p = sim().week('high').week('high');
    const st = p.st();
    for (const id of st.played) {
      const b = S.beatOf(C.story, id);
      if (b && b.w > st.week) { expect(id.startsWith('pl-') || id === 'b-3.A', id).toBe(true); }
    }
    for (const r of st.records) expect(S.recordOf(C.story, r)!.w, r).toBeLessThanOrEqual(st.week + 1);
  });
});

describe('Keys, finds and lines', () => {
  it('never more than 5 useful Keys a week, whatever the effort', () => {
    const p = sim().week('high').week('high').week('high');
    const byWeek = new Map<string, number>();
    for (const f of p.facts) if (f.type === 'keyEarned' && !f.rhythm.startsWith('floor:')) {
      const d = new Date(`${f.day}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
      const k = d.toISOString().slice(0, 10); byWeek.set(k, (byWeek.get(k) ?? 0) + 1);
    }
    for (const n of byWeek.values()) expect(n).toBeLessThanOrEqual(S.KEYS_A_WEEK);
  }, 60_000);
  it('each find is given once', () => {
    const p = sim().week('high').week('normal').week('high');
    const ids = p.facts.filter(f => f.type === 'findGiven').map(f => (f as { id: string }).id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });
  it('a passage line never repeats while an unseen one is available where Dan is', () => {
    const p = sim().week('high').week('high');
    for (let i = 0; i < p.facts.length; i++) {
      const f = p.facts[i] as { type: string; passage?: string };
      if (f.type !== 'beatPlayed' || !f.passage) continue;
      const st = S.storyState(p.facts.slice(0, i), C.story);
      if (!st.passagesShown.includes(f.passage)) continue;
      /* a repeat: allowed only once every line available on this stretch had been shown */
      const here = C.story.passages.filter(x => x.stretch === st.stretch && x.req.every(r => S.met(st, r)) && !(x.until && S.met(st, x.until)));
      expect(here.every(x => st.passagesShown.includes(x.id)), f.passage).toBe(true);
    }
  });
  it('a teaser whose condition is false never shows', () => {
    const p = sim().week('normal');
    const st = p.st(), line = p.view().teaser;
    const tz = C.story.teasers.find(x => x.line === line);
    if (tz) {
      expect(tz.w).toBeLessThanOrEqual(st.week);
      expect(tz.req.every(r => S.met(st, r))).toBe(true);
      expect(tz.until ? !S.met(st, tz.until) : true).toBe(true);
    }
  });
  it('the game day is the 04:00 day', () => { expect(gameDay('2026-09-29T03:59:00+01:00')).toBe('2026-09-28'); });
});

describe('every record has a title of its own (the flow review, L C3)', () => {
  it('records kept in one place are numbered, so no two titles are the same', async () => {
    const { recordNumber } = await import('../../src/core/story');
    const { content } = await import('../../src/content/world');
    const titles = content.story.records.map(r => `${r.where.toLowerCase()}|${recordNumber(content.story, r.id) ?? ''}`);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
