/**
 * The story's rules over weeks of simulated play (the story job's §13 tests; TEST_STRATEGY → story unlocks).
 * A simulated Dan lives real calendar weeks: opens the app, does his jobs, guesses whatever mark is offered.
 * Ids only: no story text is asserted here.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import { gameDay } from '../../src/core/time';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

type Week = 'normal' | 'low' | 'high' | 'away';

function sim(start = '2026-09-28T08:00:00+01:00') {   /* a Monday */
  let facts: Fact[] = [];
  let now = Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
  const wait = (min: number) => { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); };
  /** Guess every mark on offer, and look at every arrival. */
  const answer = () => {
    const v = see(facts, C, at()), st = S.storyState(facts, C.story);
    const offered = new Set<string>();
    for (const b of C.story.beats) if (st.played.has(b.id)) b.carries?.guess?.forEach(m => offered.add(m));
    for (const x of C.story.seals) if (st.opened.has(x.id)) x.carries?.guess?.forEach(m => offered.add(m));
    for (const m of offered) if (!st.guessed.has(m)) { const mk = S.markOf(C.story, m); if (mk?.candidates) run({ do: 'guess', mark: m, guess: mk.candidates[0] }); }
    let a = see(facts, C, at()).arrival;
    while (a) { run({ do: 'seen', what: 'arrival', ref: a.seq }); a = see(facts, C, at()).arrival; }
    return v;
  };
  const day = (kind: Week) => {
    const d0 = now;
    if (kind === 'away') { now = d0 + 864e5; return; }
    run({ do: 'open' });
    if (kind === 'low') run({ do: 'capacity', capacity: 'low' });
    if (kind === 'high') run({ do: 'capacity', capacity: 'high' });
    for (let guard = 0; guard < 12; guard++) {
      answer();
      const v = see(facts, C, at());
      if (v.complete && kind !== 'high') break;
      if (v.complete && guard > 8) break;
      const job = v.next?.job ?? v.order.find(j => !v.done.has(j));
      if (!job) break;
      const j = C.jobs.find(x => x.id === job)!;
      if (j.delve) { run({ do: 'startRun', job, minutes: 25, count: Math.ceil((j.enoughAt ?? j.length) / 25) }); wait((j.enoughAt ?? j.length) * 1.3 + 10); if (!see(facts, C, at()).done.has(job)) run({ do: 'done', job }); }
      else { run({ do: 'begin', job }); wait(j.length); run({ do: 'done', job }); }
      const e = see(facts, C, at()).runEnd; if (e) run({ do: 'seen', what: 'step', ref: e.seq });
    }
    answer();
    now = d0 + 864e5;
  };
  return {
    get facts() { return facts; },
    week(kind: Week | Week[]) { for (let i = 0; i < 7; i++) day(Array.isArray(kind) ? kind[i] : kind); return this; },
    st() { return S.storyState(facts, C.story); },
    view() { return see(facts, C, at()); },
    at,
  };
}

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
  it('Normal weeks: the story reaches week 6, one story week per calendar week, never ahead', () => {
    const p = sim();
    for (let w = 1; w <= 6; w++) {
      p.week('normal');
      const st = p.st();
      expect(st.week, `calendar week ${w}`).toBeLessThanOrEqual(w);
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
  });
  it('Low weeks never stall: the floor keeps Keys coming and the story still moves', () => {
    const p = sim().week(['low', 'away', 'low', 'away', 'low', 'away', 'away']);
    for (let i = 0; i < 5; i++) p.week(['low', 'away', 'low', 'away', 'low', 'away', 'away']);
    const st = p.st();
    /* a Low week stretches the story week; it never stops it: places keep coming, and the floor opens 2 a week */
    expect(st.week).toBeGreaterThanOrEqual(2);
    expect(st.opened.size).toBeGreaterThanOrEqual(10);
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
  });
  it('each find is given once', () => {
    const p = sim().week('high').week('normal').week('high');
    const ids = p.facts.filter(f => f.type === 'findGiven').map(f => (f as { id: string }).id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });
  it('passage lines do not repeat on a stretch until its list is used', () => {
    const p = sim().week('high').week('high');
    const shown = p.facts.filter(f => f.type === 'beatPlayed' && (f as { passage?: string }).passage).map(f => (f as { passage: string }).passage);
    const byStretch = new Map<string, string[]>();
    for (const id of shown) { const ps = C.story.passages.find(x => x.id === id)!; byStretch.set(ps.stretch, [...(byStretch.get(ps.stretch) ?? []), id]); }
    for (const [stretch, list] of byStretch) {
      const pool = C.story.passages.filter(x => x.stretch === stretch).length;
      expect(new Set(list.slice(0, pool)).size, stretch).toBe(Math.min(pool, list.length));
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
