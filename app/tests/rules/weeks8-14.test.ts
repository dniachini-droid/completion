/**
 * Story weeks 8–14 (STORY_JOB §8, sealed): the new weeks play in order, every `req` can be met, nothing plays ahead of
 * where Dan is or before what it depends on, and each week closes with its own lines. Ids only: no story text is
 * asserted or printed (D-015).
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import { content as C } from '../../src/content/world';
import { lettering } from '../../src/content/sealed/lettering';
import { STAND_IN } from '../../src/core/game';
import { sim, type Week } from './sim';
import { aheadOfDan, outOfOrder } from './guards';

const s = C.story;
const NEW = (w: number) => w >= 8 && w <= 14;

describe('weeks 8–14: the content is whole', () => {
  it('every id a req, until, seal, record or inView names exists', () => {
    const ids = new Set<string>([
      ...s.beats.map(b => b.id), ...s.seals.map(x => x.id), ...s.marks.map(m => m.id), ...s.finds.map(f => f.id),
      ...s.records.map(r => r.id), ...s.words.map(w => w.id),
    ]);
    const bad: string[] = [];
    const check = (from: string, list: (string | undefined)[] | undefined) => list?.forEach(x => { if (x && !ids.has(x)) bad.push(`${from} -> ${x}`); });
    for (const b of s.beats) if (NEW(b.w)) {
      check(b.id, b.req); check(b.id, [b.until, b.seal]);
      check(b.id, b.carries?.records); check(b.id, b.carries?.inView); check(b.id, b.carries?.guess); check(b.id, [b.carries?.word]);
    }
    for (const x of s.seals) if (NEW(x.w)) { check(x.id, [x.beat, x.arrival]); check(x.id, x.carries?.records); check(x.id, x.carries?.guess); }
    for (const t of s.teasers) if (NEW(t.w)) check(t.id, [...t.req, t.until]);
    for (const l of [...s.learned, ...s.soFar.flatMap(m => m.items ?? [])]) if (l.w >= 7) check(l.id, l.req);
    for (const q of s.openQuestions) if (q.w >= 7) check(q.id, q.req);
    for (const f of s.finds) if (NEW(f.w)) check(f.id, f.req);
    for (const k of s.camps) if (NEW(k.w)) check(k.id, [...k.req, k.until, 'find' in k.look ? k.look.find : undefined]);
    for (const m of s.marks) check(m.id, [m.guessAt, m.confirmedBy?.endsWith('.morning') ? undefined : m.confirmedBy]);   /* a week's morning is an id, not always a beat */
    expect(bad).toEqual([]);
  });

  it('every route place of weeks 8–14 is a place, on a stretch with a stand-in painting', () => {
    for (const rw of s.route.filter(r => NEW(r.w))) {
      expect(rw.places.length, `week ${rw.w}`).toBe(5);
      for (const p of rw.places) {
        const b = S.beatOf(s, p.id)!;
        expect(b, p.id).toBeDefined();
        expect(['arrival', 'arrivalKey', 'word'], p.id).toContain(b.kind);
        expect(b.name, p.id).toBeTruthy();
        expect(b.w, p.id).toBe(rw.w);
        expect(STAND_IN[b.stretch], p.id).toBeDefined();
        /* a place a Key plays is a sealed thing's arrival; a place on foot is not */
        expect(!!p.k, p.id).toBe(s.seals.some(x => x.arrival === p.id));
      }
    }
  });

  it('every mark guessed in weeks 8–14 has four candidates, the truth among the right ones, and its lettering', () => {
    for (const m of s.marks.filter(m => NEW(m.w) && m.candidates)) {
      expect(m.candidates!.length, m.id).toBe(4);
      expect(m.right, m.id).toContain(m.candidates![0]);
      expect(m.candidates, m.id).toContain(m.tempting);
      expect(m.right, m.id).not.toContain(m.tempting);
      expect(lettering[m.id], m.id).toBeDefined();
      expect(s.beats.some(b => b.id === m.guessAt && b.carries?.guess?.includes(m.id)), m.id).toBe(true);
    }
    for (const r of s.records) for (const line of r.cut ?? []) for (const tk of line) {
      if ('s' in tk && typeof tk.s === 'string') expect(S.markOf(s, tk.s), `${r.id}: ${tk.s}`).toBeDefined();
      if ('hand' in tk && tk.hand !== 'his') expect(lettering[`mk-hand-${tk.hand}`], `${r.id}: ${tk.hand}`).toBeDefined();
    }
  });

  it('a mark is confirmed only by a beat that comes after the one offering it', () => {
    for (const m of s.marks.filter(m => NEW(m.w) && m.confirmedBy && m.candidates)) {
      expect(m.confirmedBy, m.id).not.toBe(m.guessAt);
      const c = S.beatOf(s, m.confirmedBy!);
      /* a morning confirms what the week's tablet offered; any other confirming beat waits for the tablet's seal */
      if (c && c.kind !== 'morning') {
        const seal = s.seals.find(x => x.carries?.guess?.includes(m.id))!;
        const later = !!c.seal && S.sealOf(s, c.seal)!.w === seal.w && S.sealOf(s, c.seal)!.o > seal.o;   /* Keys open in order */
        expect(later || c.req.includes(seal.id) || c.req.some(r => S.beatOf(s, r)?.req.includes(seal.id)) || c.kind === 'word', `${m.id} at ${c.id}`).toBe(true);
      }
    }
  });
});

const LIVES: [string, Week][] = [['normal', 'normal'], ['low', 'low'], ['high', 'high']];

describe('weeks 8–14 play in order', () => {
  for (const [name, kind] of LIVES) {
    it(`${name} weeks: fourteen calendar weeks, nothing ahead of Dan, nothing out of order`, () => {
      const p = sim(undefined, undefined, 'kept');
      const weeks: number[] = [];
      for (let i = 0; i < 14; i++) { p.week(kind); weeks.push(p.st().week); }
      /* the story never goes backwards and never runs more than one story week a calendar week */
      for (let i = 1; i < weeks.length; i++) { expect(weeks[i]).toBeGreaterThanOrEqual(weeks[i - 1]); expect(weeks[i]).toBeLessThanOrEqual(i + 2); }
      if (kind !== 'low') expect(weeks[13]).toBe(14);
      else expect(weeks[13]).toBeGreaterThanOrEqual(10);
      expect(aheadOfDan(p.facts)).toEqual([]);
      expect(outOfOrder(p.facts)).toEqual([]);
      /* a story arrival is never reached ahead of its week (a deep push may reach next week's plain places) */
      const bad: string[] = [];
      for (const f of p.facts) if (f.type === 'arrived' && f.kind === 'place') {
        const b = S.beatOf(s, f.id)!, wk = S.storyState(p.facts.filter(x => x.seq < f.seq), s).week;
        if (b.w > wk && !(b.id.startsWith('pl-') && b.w === wk + 1) && b.id !== 'b-3.A') bad.push(`${f.id} in story week ${wk}`);
      }
      expect(bad).toEqual([]);
      if (kind !== 'low') {
        const st = p.st();
        /* every place and ordered step of weeks 8–13 has played, and week 14's places */
        const missing = s.beats.filter(b => NEW(b.w) && (b.w < 14 ? ['step', 'arrival', 'word'] : ['arrival', 'word']).includes(b.kind)
          && s.route.some(r => r.w === b.w) && !st.played.has(b.id) && (b.kind !== 'arrival' || s.route.find(r => r.w === b.w)!.places.some(x => x.id === b.id) || !b.id.startsWith('pl-')));
        expect(missing.map(b => b.id)).toEqual([]);
      }
    }, 240_000);
  }
});

describe('the week close for weeks 8–14', () => {
  it('each week closes with its own learned lines, and the third month sums up at play week 9', () => {
    const p = sim(undefined, undefined, 'kept');
    for (let i = 0; i < 15; i++) p.week('normal');
    const closes = p.facts.filter(f => f.type === 'weekClosed');
    const learned = new Set(closes.flatMap(f => f.learned));
    for (let w = 8; w <= 14; w++) expect(s.learned.filter(l => l.w === w).some(l => learned.has(l.id)), `week ${w}`).toBe(true);
    const nine = closes.find(f => f.n === 9)!;
    expect(nine.soFar.length).toBeGreaterThan(0);
    expect(nine.soFar.every(id => id.startsWith('sf-m3-'))).toBe(true);
    const thirteen = closes.find(f => f.n === 13)!;
    expect(thirteen.soFar.every(id => id.startsWith('sf-m4-'))).toBe(true);
    /* every week's glimpse has been shown by the end */
    const glimpses = new Set(closes.map(f => f.glimpse).filter(Boolean));
    for (let w = 8; w <= 13; w++) expect(glimpses.has(`b-w${w}.close`), `week ${w}`).toBe(true);
  }, 240_000);
});
