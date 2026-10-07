/**
 * The story's wiring (deep review FIX-LIST Stage 7; sealed report docs/narrative/sealed/reviews/DEEP-STORY.md). Ids only:
 * no story text is asserted or printed here (D-015). Each test fails on the code before the fix.
 */
import { describe, expect, it } from 'vitest';
import { act } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { CampView, Story } from '../../src/core/story-types';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { curl } from '../../src/content/sealed';
import { emphasis, plain } from '../../src/ui/emphasis';
import { sim } from './sim';

const s = C.story;
type Close = Extract<Fact, { type: 'weekClosed' }>;
const closes = (f: Fact[]) => f.filter((x): x is Close => x.type === 'weekClosed');
/** The story week Dan was in when each page was written. */
const weekAt = (f: Fact[], seq: number) => S.storyState(f.filter(x => x.seq < seq), s).week;

describe('S#1: a week close never shows a glimpse the story has moved past', () => {
  it('each glimpse whose sealed state later opens stops once it has', () => {
    const until = Object.fromEntries(s.beats.filter(b => b.kind === 'close' && b.until).map(b => [b.id, b.until]));
    expect(until).toMatchObject({ 'b-w1.close': 'b-3.A', 'b-w4.close': 'b-5.0', 'b-w6.close': 'b-7.A', 'b-w9.close': 'b-10.A' });
  });
  it('at a High pace, no page shows a glimpse whose condition had already played', () => {
    const p = sim().week('high').week('high').week('normal');
    p.week(['normal', 'away', 'away', 'away', 'away', 'away', 'away']);
    const f = p.facts, bad: string[] = [];
    for (const c of closes(f)) {
      const b = c.glimpse ? S.beatOf(s, c.glimpse)! : null;
      if (b?.until && S.met(S.storyState(f.filter(x => x.seq < c.seq), s), b.until)) bad.push(b.id);
    }
    expect(closes(f).length).toBeGreaterThanOrEqual(3);
    expect(bad).toEqual([]);
  }, 120_000);
});

describe('S#2b: a camp line is not tied to the story week Dan is in', () => {
  it('a story week walked through with no kept bedtime keeps its camp line for the next kept night', () => {
    const p = sim().week('high');
    let f = p.facts;
    expect(S.storyState(f, s).week).toBeGreaterThan(1);
    expect(S.storyState(f, s).played.has('b-w1.camp')).toBe(false);
    f = f.concat(act(f, C, { do: 'open' }, '2026-10-05T09:00:00+01:00'));
    f = f.concat(act(f, C, { do: 'goodnight' }, '2026-10-05T22:45:00+01:00'));
    const night = f.find(x => x.type === 'goodnight')!;
    expect(night).toMatchObject({ kept: true });
    /* the earliest one not played yet: week 1's */
    expect(f.filter(x => x.seq > night.seq && x.type === 'beatPlayed').map(x => (x as { id: string }).id)).toEqual(['b-w1.camp']);
  }, 60_000);
});

describe('S#4: the week close keeps pace with the story', () => {
  it('at a High pace a glimpse lags the story week by 3 at most, and a page learns more when several story weeks were walked', () => {
    const p = sim().week('high').week('high').week('normal');
    p.week(['normal', 'away', 'away', 'away', 'away', 'away', 'away']);
    const f = p.facts;
    for (const c of closes(f)) if (c.glimpse) expect(weekAt(f, c.seq) - S.beatOf(s, c.glimpse)!.w, c.week).toBeLessThanOrEqual(3);
    expect(Math.max(...closes(f).map(c => c.learned.length))).toBeGreaterThan(3);
    expect(Math.max(...closes(f).map(c => c.learned.length))).toBeLessThanOrEqual(9);
    const learned = closes(f).flatMap(c => c.learned);
    expect(new Set(learned).size).toBe(learned.length);
  }, 120_000);
});

describe('S#5: the months\' summaries follow the story, not the weeks of play', () => {
  it('every line comes once, six at most a page, never before the story reaches its month', () => {
    const p = sim().week('high').week('high').week('high').week('normal');
    p.week(['normal', 'away', 'away', 'away', 'away', 'away', 'away']);
    const f = p.facts, all = closes(f), shown = all.flatMap(c => c.soFar);
    expect(new Set(shown).size).toBe(shown.length);
    for (const c of all) {
      expect(c.soFar.length).toBeLessThanOrEqual(6);
      for (const id of c.soFar) expect(s.soFar.find(m => m.items?.some(l => l.id === id))!.w, id).toBeLessThanOrEqual(weekAt(f, c.seq));
    }
    /* the story reached its last month in the first weeks: every line has come by the fifth page, the sixth of one month too */
    expect(s.soFar.flatMap(m => m.items ?? []).filter(l => !shown.includes(l.id)).map(l => l.id)).toEqual([]);
  }, 180_000);
});

describe('S#8: authored emphasis', () => {
  it('*…* becomes emphasis; no asterisk is ever left', () => {
    expect(emphasis('a *b c* d')).toEqual([{ t: 'a ', em: false }, { t: 'b c', em: true }, { t: ' d', em: false }]);
    expect(emphasis('*a* and *b*').filter(p => p.em).map(p => p.t)).toEqual(['a', 'b']);
    expect(emphasis('a stray * here').map(p => p.t).join('')).toBe('a stray  here');
    expect(emphasis('plain')).toEqual([{ t: 'plain', em: false }]);
    expect(plain('x *y* z')).toBe('x y z');
  });
  it('every story text with an asterisk pairs them up', () => {
    const bad: string[] = [];
    const walk = (o: unknown, id: string) => {
      if (typeof o === 'string') { if ((o.match(/\*/g) ?? []).length % 2) bad.push(id); return; }
      if (Array.isArray(o)) { o.forEach(v => walk(v, id)); return; }
      if (o && typeof o === 'object') { const r = o as Record<string, unknown>; for (const v of Object.values(r)) walk(v, typeof r.id === 'string' ? r.id : id); }
    };
    walk(s, '');
    expect(bad).toEqual([]);
  });
});

describe('S#9: one apostrophe', () => {
  it('a straight apostrophe in or closing a word is made curly; quotes and ids are left alone', () => {
    expect(curl("it's the cats' bowl")).toBe('it’s the cats’ bowl');
    expect(curl('"hello"')).toBe('"hello"');
    expect(curl('b-w1.camp')).toBe('b-w1.camp');
  });
  it('no story text carries a straight apostrophe', () => {
    const hits: string[] = [];
    const walk = (o: unknown, id: string) => {
      if (typeof o === 'string') { if (/\w'\w|s'(?!\w)/.test(o)) hits.push(id); return; }
      if (Array.isArray(o)) { o.forEach(v => walk(v, id)); return; }
      if (o && typeof o === 'object') { const r = o as Record<string, unknown>; for (const v of Object.values(r)) walk(v, typeof r.id === 'string' ? r.id : id); }
    };
    walk(s, '');
    expect(hits).toEqual([]);
  });
});

describe('S#10: no calendar weeks in the story lines', () => {
  it('no line speaks of a first week or of the week ending (D-123)', () => {
    expect(s.beats.filter(b => /\b(your first week|The week ends)\b/.test(b.line ?? '')).map(b => b.id)).toEqual([]);
  });
});

describe('S#12: a camp view that will stop being offered comes first', () => {
  const view = (id: string, stretch: 'st-hall' | 'st-salt', until?: string): CampView =>
    ({ id, stretch, w: 1, req: [], ...(until ? { until } : {}), name: id, line: id, look: { line: id } });
  const story = (camps: CampView[]): Story => ({
    version: 't', stretches: [{ id: 'st-hall', name: 'h', w: 1, req: [] }, { id: 'st-salt', name: 's', w: 1, req: [] }], route: [], beats: [],
    seals: [], records: [], marks: [], words: [], finds: [], camps, passages: [], teasers: [], learned: [], soFar: [], openQuestions: [] });
  /* a camp at a view (D-160): far enough past the last place (here, 120 minutes) */
  const far = 120;
  it('an unused view with an end comes before the stretch\'s other unused views; never another area\'s (D-154, D-160)', () => {
    const t = story([view('a', 'st-hall'), view('b', 'st-hall', 'x-later'), view('c', 'st-salt', 'x-later')]);
    const st = { ...S.storyState([], t), visited: new Set(['st-hall', 'st-salt'] as const), stretch: 'st-hall' as const, here: 'p' };
    expect(S.campHere(t, st, far).id).toBe('b');
    expect(S.campHere(t, { ...st, campsShown: ['b'] }, far).id).toBe('a');
    /* where Dan camps is where he is: never the salt's view while he is in the hall */
    expect(S.campHere(t, { ...st, campsShown: ['b', 'a'] }, far).id).not.toBe('c');
  });
  it('one whose end has come is never offered', () => {
    const t = story([view('a', 'st-hall'), view('b', 'st-hall', 'x-done')]);
    const st = { ...S.storyState([], t), played: new Set(['x-done']), here: 'p' };
    expect(S.campHere(t, st, far).id).toBe('a');
  });
  it('soon after a place, he camps at it (D-160)', () => {
    const t = story([view('a', 'st-hall')]);
    const st = { ...S.storyState([], t), here: 'p' };
    expect(S.campHere(t, st, 30)).toEqual({ at: 'place', id: 'p' });
  });
});

describe('S#13: the morning after a camp line points back to its own record', () => {
  it('a camp line\'s morning record is a record carried by its week or before', () => {
    const named = s.beats.filter(b => b.kind === 'camp' && b.morningRecord);
    expect(named.length).toBeGreaterThanOrEqual(10);
    for (const b of named) {
      const r = S.recordOf(s, b.morningRecord!);
      expect(r, b.id).toBeTruthy();
      expect(r!.w, b.id).toBeLessThanOrEqual(b.w);
    }
  });
  it('the Morning screen\'s record: the named one when Dan holds it, else none (the old rule decides)', () => {
    const b = s.beats.find(x => x.kind === 'camp' && x.morningRecord)!, m = b.id.replace(/\.camp$/, '.morning');
    expect(S.morningRecord(s, m, [b.morningRecord!])).toBe(b.morningRecord);
    expect(S.morningRecord(s, m, [])).toBeNull();
    expect(S.morningRecord(s, 'b-w99.morning', [b.morningRecord!])).toBeNull();
  });
});

describe('S#16: no dead route data; the Key-named kinds open on the road', () => {
  it('no route place carries a flag nothing reads', () => {
    for (const rw of s.route) for (const p of rw.places) expect(Object.keys(p).filter(k => k !== 'id' && k !== 'k'), p.id).toEqual([]);
  });
  it('every row behind an arrivalKey place, and every route place marked k, opens on the road (D-129), as the types say', () => {
    const road = S.roadSeals(s);
    const rows = s.seals.filter(x => x.arrival && S.beatOf(s, x.arrival)?.kind === 'arrivalKey');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter(x => !road.has(x.id)).map(x => x.id)).toEqual([]);
    const k = s.route.flatMap(r => r.places.filter(p => p.k));
    expect(k.filter(p => !s.seals.some(x => x.arrival === p.id && road.has(x.id))).map(p => p.id)).toEqual([]);
  });
});
