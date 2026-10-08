/**
 * The route walked as a journey (D-154): a descent from a home at the top, every move between areas announced (a new
 * area, back to one walked before, or an evening at camp that never moves where Dan is), and Dan's own save carried on
 * from wherever the old route left it. Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from '../review/node';
import * as S from '../../src/core/story';
import { arrivalAt, see } from '../../src/core/game';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim, type Week } from './sim';

const s = C.story;
const route = s.route.flatMap(r => r.places.map(p => p.id));
/** Route places not yet behind Dan (an old save's place whose sealed row it already opened is behind him, D-160). */
const left = (st: S.StoryState) => s.route.flatMap(r => r.places).filter(p => !S.placeDone(s, st, p)).map(p => p.id);
const arrivals = (facts: Fact[]) => facts.filter((f): f is FactOf<'arrived'> => f.type === 'arrived');

/** Where Dan is after each arrival (the area), and how each arrival was come to. */
function journey(facts: Fact[], from = 0) {
  const out: { seq: number; id: string; area: string; face: string; wayIn: string | null; here: string; was: string }[] = [];
  for (const f of arrivals(facts)) {
    if (f.seq <= from || f.kind === 'camp') continue;
    const upTo = facts.filter(g => g.seq <= f.seq), a = arrivalAt(upTo, C, f.seq)!;
    const st = S.storyState(upTo, s);
    out.push({ seq: f.seq, id: f.id, area: f.kind === 'evening' ? 'evening' : S.areaOf(s, S.beatOf(s, f.id)!.stretch), face: a.face, wayIn: a.wayIn ?? (a.errand ? 'errand' : null), here: S.areaOf(s, st.stretch),
      /* where he was just before it (a job's moment in another room takes him there, D-160) */
      was: S.areaOf(s, S.storyState(facts.filter(g => g.seq < f.seq), s).stretch) });
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
  it('an evening plays at most one home moment of its own week (the camp\'s line and line-only seals aside, D-159)', () => {
    for (const [name, facts] of Object.entries(lives)) {
      for (const f of arrivals(facts)) {
        if (!(f.kind === 'evening' || f.how === 'evening')) continue;
        const upTo = facts.filter(g => g.seq <= f.seq), a = arrivalAt(facts, C, f.seq)!, wk = S.storyState(upTo, s).week;
        /* the home moments of its own week it played (a line-only seal and the camp's own line take no slot) */
        const mine = a.then.filter(t => { const b = S.beatOf(s, t.beat), z = b ? undefined : S.sealOf(s, t.beat);
          return b ? S.eveningMoment(s, b.id) && b.kind !== 'camp' && b.w >= wk : !!z && (!!z.beat || !!z.arrival) && z.w >= wk; });
        expect(mine.length, `${name} ${f.id} @${f.seq}`).toBeLessThanOrEqual(1);
      }
    }
  }, 300_000);
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
        if (x.area !== x.was) {
          expect(['enter', 'back'], `${name} ${x.id}`).toContain(x.face);
          /* how he got there: the area's way-in line, or the place's own words (a turn-off on the way up says so itself) */
          if (x.face === 'back') expect(!!x.wayIn || !!S.beatOf(s, x.id)?.said, `${name} ${x.id}`).toBe(true);
        } else expect(x.face, `${name} ${x.id}`).toBe('on');
        last = x.area;
      }
    }
  }, 300_000);
  it('an evening at camp says so first, and a turn-off on the way up says why', () => {
    const firstTwo = (id: string) => (S.beatOf(s, id)!.line ?? S.beatOf(s, id)!.taps?.[0] ?? '').split(/(?<=[.!?])\s/).slice(0, 2).join(' ');
    const departed = route.indexOf('b-3.B');
    for (const id of route.slice(departed)) {
      const b = S.beatOf(s, id)!;
      /* (its reason may come first: "The tablet … That night you …"; the label says "Tonight, at camp" above it) */
      if (S.isHome(s, b.stretch)) expect(firstTwo(id), id).toMatch(/\b(night|Tonight|tonight|camp|evening|This morning)\b/);
    }
    /* a turn-off: its reason, and that it is on the way back up, in its first two sentences */
    const two = (id: string) => (S.beatOf(s, id)!.line ?? '').split(/(?<=[.!?])\s/).slice(0, 2).join(' ');
    const turnOffs = s.beats.filter(b => b.turnOff).map(b => b.id);
    expect(turnOffs.sort()).toEqual(['b-13.B', 'b-14.A', 'b-5.B', 'pl-w10-deep-end', 'pl-w11-far-end']);
    /* (or a few steps back up within an area: "back up", "uphill", the round-6 short review) */
    for (const id of turnOffs) expect(two(id), id).toMatch(/way (back )?up|on the way|back up|uphill/i);
  });
  it('nothing names what Dan has not yet seen: b-4.C before b-6.2, pl-w14-mule-stone before pl-w13-lower-gallery', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const at = (id: string) => facts.findIndex(f => (f.type === 'beatPlayed' || f.type === 'arrived') && f.id === id);
      /* b-6.2 assumes b-4.C (the independent review of the branch, B1; ids only, D-015) */
      expect(at('b-4.C'), name).toBeGreaterThanOrEqual(0);
      expect(at('b-4.C'), `${name}: b-6.2`).toBeLessThan(at('b-6.2') < 0 ? facts.findIndex(f => f.type === 'sealOpened' && f.seal === 'seal-6-1') : at('b-6.2'));
      /* pl-w14-mule-stone is a stop on the way to pl-w13-lower-gallery (ROUTE_REDESIGN §12) */
      expect(at('pl-w14-mule-stone'), name).toBeLessThan(at('pl-w13-lower-gallery'));
    }
  }, 300_000);
  it('fails on the old route: the old order changed area 48 times (D-153)', () => {
    /* the old order's areas, as played (ROUTE_REDESIGN §2.1): the measure this test holds the route to */
    const OLD = 'hall hall salt box hall salt salt box hall box hall stair salt stair hall salt salt salt box hall hall stair stair salt stair sq sq sq sq box stair sq hall water water salt water blast reading reading salt reading blast sq blast blast sq blast blast blast reading water blast blast blast salt side side side side sq reading sq blast sq lower lower salt'.split(' ');
    let changes = 0; for (let i = 1; i < OLD.length; i++) if (OLD[i] !== OLD[i - 1]) changes++;
    expect(changes).toBeGreaterThan(20);
  });
});

describe('Dan\'s save carries on from wherever the old route left it (D-154)', () => {
  /* keys-light: a light worker who used Keys on the Map (D-142), carried on after a week away */
  const lives = ['normal-kept', 'normal-nobed', 'high-kept', 'keys-light'].map(n => ({ n, facts: JSON.parse(readFileSync(new URL(`../saves/route-old/${n}.json`, import.meta.url), 'utf8')).facts as Fact[] }));
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
  /* saves made on the D-154 order (merged), where her notebook's pages played as evenings (D-155) */
  const d154 = ['normal-kept', 'normal-nobed'].map(n => ({ n, facts: JSON.parse(readFileSync(new URL(`../saves/route-d154/${n}.json`, import.meta.url), 'utf8')).facts as Fact[] }));
  it('a D-154 save\'s evening keeps the notebook pages it played that night (carried pages are no longer evening moments, D-155)', () => {
    let checked = 0;
    for (const { n, facts } of d154) {
      for (const f of arrivals(facts).filter(x => x.kind === 'evening' || x.how === 'evening')) {
        /* the pages played in the same command, right after it */
        const after = facts.filter(g => g.seq > f.seq && g.at === f.at);
        const pages = after.filter((g): g is FactOf<'beatPlayed'> => g.type === 'beatPlayed' && g.job === undefined && !!S.beatOf(s, g.id)?.portable).map(g => g.id);
        if (!pages.length) continue;
        const a = arrivalAt(facts, C, f.seq)!;
        for (const p of pages) { expect(a.then.map(x => x.beat), `${n} ${f.seq}: ${p}`).toContain(p); checked++; }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
  it('a D-154 save carries on to week 14 from the end of each of weeks 3–6: no stall, no replay, every page once and in order', () => {
    /* her notebook's pages (D-155); the copy's readings are carried too since D-160, each in its own week */
    const pages = s.beats.filter(b => b.portable && b.stretch === 'st-camp').sort((a, b) => a.w - b.w || a.o - b.o).map(b => b.id);
    for (const { n, facts } of d154) {
      for (const wk of [4, 5, 6, 7]) {
        const i = facts.findIndex(f => f.type === 'storyWeekBegan' && f.w === wk);
        if (i < 0) continue;
        const d = sim(undefined, undefined, n.endsWith('nobed') ? undefined : 'kept', facts.slice(0, i));
        for (let k = 0, extra = 0; k < 30 && extra < 2; k++) { d.week('normal'); if (!left(d.st()).length) extra++; }
        const at = `${n} from week ${wk}`, st = S.storyState(d.facts, s);
        expect(left(st), at).toEqual([]);
        expect(st.week, at).toBe(14);
        const played = d.facts.filter((f): f is FactOf<'beatPlayed'> => f.type === 'beatPlayed' && f.id !== 'passage').map(f => f.id);
        expect(played.filter((id, j) => played.indexOf(id) !== j), at).toEqual([]);
        const order = played.filter(id => pages.includes(id));
        expect(order, at).toEqual(pages.filter(id => order.includes(id)));
      }
    }
  }, 900_000);
  for (const { n, facts } of lives) {
    it(`${n}: stopped after any place, it plays on to the end of week 14 with no stall, no replay, and every move announced`, () => {
      for (const j of stops(facts, n === 'normal-kept')) {
        const before = facts.slice(0, j + 1), lastSeq = before[before.length - 1].seq;
        const playedBefore = new Set(arrivals(before).filter(f => f.kind === 'place').map(f => f.id));
        const d = sim(undefined, undefined, n.endsWith('nobed') ? undefined : 'kept', before);
        if (n === 'keys-light') d.week('away');
        /* on until the whole route is walked (and a week more, for the evenings left) */
        for (let k = 0, extra = 0; k < 30 && extra < 2; k++) { d.week(n.startsWith('high') ? 'high' : 'normal'); if (!left(d.st()).length) extra++; }
        const after = d.facts, st = S.storyState(after, s);
        const at = `${n} stopped at ${before.filter(f => f.type === 'arrived').pop()!.id}`;
        /* nothing replays: no place reached twice, no story moment played twice */
        const ids = arrivals(after).filter(f => f.kind === 'place').map(f => f.id);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i), at).toEqual([]);
        const beats = after.filter((f): f is FactOf<'beatPlayed'> => f.type === 'beatPlayed' && f.id !== 'passage').map(f => f.id);
        expect(beats.filter((id, i) => beats.indexOf(id) !== i), at).toEqual([]);
        /* no stall: the whole route walked, the story through week 14 */
        expect(left(st), at).toEqual([]);
        expect(st.week, at).toBe(14);
        /* never stranded or teleported: every move after the stop is announced; an evening never moves him */
        let last: string = S.areaOf(s, S.storyState(before, s).stretch);
        for (const x of journey(after, lastSeq)) {
          expect(playedBefore.has(x.id), `${at}: ${x.id} again`).toBe(false);
          if (x.face === 'evening') { expect(x.here, `${at}: ${x.id}`).toBe(last); continue; }
          if (x.area !== x.was) {
            expect(['enter', 'back'], `${at}: ${x.id}`).toContain(x.face);
            /* how he got there, as on a fresh save; a trip back up to the top (D-160) says so and leaves him where he was */
            if (x.face === 'back') expect(!!x.wayIn || !!S.beatOf(s, x.id)?.said, `${at}: ${x.id}`).toBe(true);
          }
          last = x.here;
        }
      }
    }, 900_000);
  }
});
