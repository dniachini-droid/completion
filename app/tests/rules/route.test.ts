/**
 * The route walked as a journey (D-154): a descent from a home at the top, every move between areas announced (a new
 * area, back to one walked before, or an evening at camp that never moves where Dan is), and Dan's own save carried on
 * from wherever the old route left it. Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from '../review/node';
import * as S from '../../src/core/story';
import { arrivalAt } from '../../src/core/game';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim, type Week } from './sim';

const s = C.story;
const route = s.route.flatMap(r => r.places.map(p => p.id));
const arrivals = (facts: Fact[]) => facts.filter((f): f is FactOf<'arrived'> => f.type === 'arrived');

/** Where Dan is after each arrival (the area), and how each arrival was come to. */
function journey(facts: Fact[], from = 0) {
  const out: { seq: number; id: string; area: string; face: string; wayIn: string | null; here: string }[] = [];
  for (const f of arrivals(facts)) {
    if (f.seq <= from || f.kind === 'camp') continue;
    const upTo = facts.filter(g => g.seq <= f.seq), a = arrivalAt(upTo, C, f.seq)!;
    const st = S.storyState(upTo, s);
    out.push({ seq: f.seq, id: f.id, area: f.kind === 'evening' ? 'evening' : S.areaOf(s, S.beatOf(s, f.id)!.stretch), face: a.face, wayIn: a.wayIn, here: S.areaOf(s, st.stretch) });
  }
  return out;
}
/** The areas where Dan is, move by move (evenings never move him), and the changes. */
function moves(facts: Fact[]) {
  const here = journey(facts).filter(x => x.face !== 'evening').map(x => x.area);
  let changes = 0, bounces = 0;
  for (let i = 1; i < here.length; i++) if (here[i] !== here[i - 1]) changes++;
  for (let i = 2; i < here.length; i++) if (here[i] === here[i - 2] && here[i] !== here[i - 1]) bounces++;
  return { here, changes, bounces };
}
function life(kind: Week, bed?: 'kept', weeks = 22) {
  const d = sim(undefined, undefined, bed);
  for (let i = 0; i < weeks; i++) d.week(kind);
  return d.facts;
}

describe('the route is a journey: a descent with a home at the top (D-154)', () => {
  const lives = { normal: life('normal', 'kept'), low: life('low', undefined, 30), high: life('high', 'kept', 8) };
  it('every place on the route is reached once, and nothing plays twice', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const ids = arrivals(facts).filter(f => f.kind === 'place').map(f => f.id);
      expect(new Set(ids).size, name).toBe(ids.length);
      expect(route.filter(id => !ids.includes(id)), name).toEqual([]);
      const beats = facts.filter((f): f is FactOf<'beatPlayed'> => f.type === 'beatPlayed' && f.id !== 'passage').map(f => f.id);
      expect(beats.filter((id, i) => beats.indexOf(id) !== i), name).toEqual([]);
    }
  }, 300_000);
  it('the chapter shape: where Dan is changes area at most 20 times in 14 weeks (48 on the old route), never out and straight back', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const m = moves(facts);
      expect(m.changes, name).toBeLessThanOrEqual(20);
      /* one out-and-back at home, before the way down opens (weeks 1–2: the salt, her room, the salt; each a day from camp) */
      expect(m.bounces, name).toBeLessThanOrEqual(1);
    }
  }, 300_000);
  it('every move to another area is announced: a new area, or back to one walked before with how Dan got there', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const j = journey(facts);
      let last = 'st-mouth';
      for (const x of j) {
        if (x.face === 'evening') { expect(x.here, `${name} ${x.id}: an evening never moves him`).toBe(last); continue; }
        if (x.area !== last) {
          expect(['enter', 'back'], `${name} ${x.id}`).toContain(x.face);
          /* how he got there: the area's way-in line, or the place's own words (a turn-off on the way up says so itself) */
          if (x.face === 'back') expect(!!x.wayIn || !!S.beatOf(s, x.id)?.said, `${name} ${x.id}`).toBe(true);
        } else expect(x.face, `${name} ${x.id}`).toBe('on');
        last = x.area;
      }
    }
  }, 300_000);
  it('an evening at camp says so first, and a turn-off on the way up says why', () => {
    const first = (id: string) => (S.beatOf(s, id)!.line ?? S.beatOf(s, id)!.taps?.[0] ?? '').split(/(?<=[.!?])\s/)[0];
    const departed = route.indexOf('b-3.B');
    for (const id of route.slice(departed)) {
      const b = S.beatOf(s, id)!;
      if (S.isHome(s, b.stretch)) expect(first(id), id).toMatch(/\b(night|Tonight|tonight|camp|evening|This morning)\b/);
    }
    /* a turn-off: its reason, and that it is on the way back up, in its first two sentences */
    const two = (id: string) => (S.beatOf(s, id)!.line ?? '').split(/(?<=[.!?])\s/).slice(0, 2).join(' ');
    for (const id of ['pl-w10-deep-end', 'pl-w11-far-end', 'b-13.B']) expect(two(id), id).toMatch(/way (back )?up|on the way/i);
  });
  it('fails on the old route: the old order changed area 48 times (D-153)', () => {
    /* the old order's areas, as played (ROUTE_REDESIGN §2.1): the measure this test holds the route to */
    const OLD = 'hall hall salt box hall salt salt box hall box hall stair salt stair hall salt salt salt box hall hall stair stair salt stair sq sq sq sq box stair sq hall water water salt water blast reading reading salt reading blast sq blast blast sq blast blast blast reading water blast blast blast salt side side side side sq reading sq blast sq lower lower salt'.split(' ');
    let changes = 0; for (let i = 1; i < OLD.length; i++) if (OLD[i] !== OLD[i - 1]) changes++;
    expect(changes).toBeGreaterThan(20);
  });
});

describe('Dan\'s save carries on from wherever the old route left it (D-154)', () => {
  const lives = ['normal-kept', 'normal-nobed', 'high-kept'].map(n => ({ n, facts: JSON.parse(readFileSync(new URL(`../saves/route-old/${n}.json`, import.meta.url), 'utf8')).facts as Fact[] }));
  /* every stop point in story weeks 1–6 (after each place), and in the middle of weeks 7, 13 and 14 */
  function stops(facts: Fact[], every: boolean) {
    const out: number[] = [];
    let w = 1;
    const seenIn: Record<number, number> = {}, last: Record<number, number> = {};
    for (let i = 0; i < facts.length; i++) {
      const f = facts[i];
      if (f.type === 'storyWeekBegan') w = f.w;
      if (f.type !== 'arrived' || f.kind !== 'place') continue;
      seenIn[w] = (seenIn[w] ?? 0) + 1;
      last[w] = i;
      if ((every && w <= 6) || ([7, 13, 14].includes(w) && seenIn[w] === 2)) {
        /* the save as it stood once that command was done (its batch of facts), before anything else */
        let j = i; while (j + 1 < facts.length && facts[j + 1].at === f.at) j++;
        out.push(j);
      }
    }
    /* and the end of each of weeks 1–6 */
    for (let k = 1; k <= 6; k++) if (last[k] !== undefined) { let j = last[k]; while (j + 1 < facts.length && facts[j + 1].at === facts[last[k]].at) j++; out.push(j); }
    return [...new Set(out)].sort((a, b) => a - b);
  }
  for (const { n, facts } of lives) {
    it(`${n}: stopped after any place, it plays on to the end of week 14 with no stall, no replay, and every move announced`, () => {
      for (const j of stops(facts, n === 'normal-kept')) {
        const before = facts.slice(0, j + 1), lastSeq = before[before.length - 1].seq;
        const playedBefore = new Set(arrivals(before).filter(f => f.kind === 'place').map(f => f.id));
        const d = sim(undefined, undefined, n.endsWith('nobed') ? undefined : 'kept', before);
        /* on until the whole route is walked (and a week more, for the evenings left) */
        for (let k = 0, extra = 0; k < 30 && extra < 2; k++) { d.week(n.startsWith('high') ? 'high' : 'normal'); if (route.every(id => d.st().played.has(id))) extra++; }
        const after = d.facts, st = S.storyState(after, s);
        const at = `${n} stopped at ${before.filter(f => f.type === 'arrived').pop()!.id}`;
        /* nothing replays: no place reached twice, no story moment played twice */
        const ids = arrivals(after).filter(f => f.kind === 'place').map(f => f.id);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i), at).toEqual([]);
        const beats = after.filter((f): f is FactOf<'beatPlayed'> => f.type === 'beatPlayed' && f.id !== 'passage').map(f => f.id);
        expect(beats.filter((id, i) => beats.indexOf(id) !== i), at).toEqual([]);
        /* no stall: the whole route walked, the story through week 14 */
        expect(route.filter(id => !st.played.has(id)), at).toEqual([]);
        expect(st.week, at).toBe(14);
        /* never stranded or teleported: every move after the stop is announced; an evening never moves him */
        let last: string = S.areaOf(s, S.storyState(before, s).stretch);
        for (const x of journey(after, lastSeq)) {
          expect(playedBefore.has(x.id), `${at}: ${x.id} again`).toBe(false);
          if (x.face === 'evening') { expect(x.here, `${at}: ${x.id}`).toBe(last); continue; }
          if (x.area !== last) expect(['enter', 'back'], `${at}: ${x.id}`).toContain(x.face);
          last = x.area;
        }
      }
    }, 900_000);
  }
});
