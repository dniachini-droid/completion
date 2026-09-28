/**
 * The road never waits on a Key (Dan, D-129, option C): places a Key used to hold are reached on foot, by minutes, in
 * the story's order; a Key opens only the niches. Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import { returnOf, see } from '../../src/core/game';
import { calendarWeek } from '../../src/core/time';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { heavy } from '../review/heavy';
import { aheadOfDan, outOfOrder } from './guards';

const s = C.story;
const road = S.roadSeals(s);
const opened = (facts: Fact[]) => facts.filter((f): f is FactOf<'sealOpened'> => f.type === 'sealOpened');

describe('the road and the niches (D-129)', () => {
  it('the road takes the rows that play a place, carry a sign, or that anything on the road needs; the rest are niches', () => {
    /* pinned, so a content change that moves a row between the two is seen and decided */
    expect([...road].sort()).toEqual(['seal-1-1', 'seal-10-1', 'seal-10-2', 'seal-10-3', 'seal-10-4', 'seal-10-5', 'seal-11-1', 'seal-11-2', 'seal-11-4',
      'seal-12-1', 'seal-12-2', 'seal-12-5', 'seal-13-1', 'seal-13-2', 'seal-13-5', 'seal-14-1', 'seal-2-1', 'seal-3-1', 'seal-4-1', 'seal-4-2',
      'seal-5-1', 'seal-5-2', 'seal-6-1', 'seal-6-2', 'seal-7-1', 'seal-7-2', 'seal-7-4', 'seal-7-5', 'seal-8-1', 'seal-8-4', 'seal-9-1', 'seal-9-2', 'seal-9-5']);
    /* each plays: a place, a step, or its own line as a step */
    for (const id of road) { const x = S.sealOf(s, id)!; expect(!!(x.beat || x.arrival || x.line), id).toBe(true); expect(x.seenOnly, id).toBeFalsy(); }
    /* each can open on the road: its step is a Key's step, its place is on the route, and whatever brings it into view is
       on the road too (else the road would wait on a Key) */
    const places = new Set(s.route.flatMap(r => r.places.map(p => p.id)));
    const roadBeat = (b: { id: string; kind: string; seal?: string }) => places.has(b.id) || b.kind === 'step' || b.kind === 'word' || (b.kind === 'stepKey' && road.has(b.seal!));
    for (const id of road) {
      const x = S.sealOf(s, id)!;
      if (x.beat) expect(S.beatOf(s, x.beat)!.kind, id).toBe('stepKey');
      if (x.arrival) expect(places.has(x.arrival), id).toBe(true);
      const by = s.beats.filter(b => b.carries?.inView?.includes(id));
      if (by.length) expect(by.some(roadBeat), id).toBe(true);
    }
    /* every place a Key used to play is on the road */
    for (const rw of s.route) for (const p of rw.places) if (p.k) expect(road.has(S.beatOf(s, p.id)!.seal!), p.id).toBe(true);
  });
  it('nothing on the road needs a niche: no place, step, word or stretch, and no sign it confirms or cuts', () => {
    const niche = (id: string) => { const x = S.sealOf(s, id) ?? S.sealOf(s, S.beatOf(s, id)?.kind === 'stepKey' ? S.beatOf(s, id)!.seal! : '');
      return !!x && !x.seenOnly && !road.has(x.id); };
    const places = new Set(s.route.flatMap(r => r.places.map(p => p.id)));
    const onTheRoad = s.beats.filter(b => places.has(b.id) || b.kind === 'step' || b.kind === 'word' || (b.kind === 'stepKey' && road.has(b.seal!)));
    const bad: string[] = [];
    for (const b of onTheRoad) for (const r of b.req) if (niche(r)) bad.push(`${b.id}<${r}`);
    for (const x of s.stretches) for (const r of x.req) if (niche(r)) bad.push(`${x.id}<${r}`);
    /* a sign the road confirms, or a word cuts, is offered on the road */
    const offeredOnRoad = new Set<string>();
    for (const b of onTheRoad) b.carries?.guess?.forEach(m => offeredOnRoad.add(m));
    for (const id of road) S.sealOf(s, id)!.carries?.guess?.forEach(m => offeredOnRoad.add(m));
    const roadIds = new Set(onTheRoad.map(b => b.id));
    for (const m of s.marks) if (m.candidates?.length && m.confirmedBy && roadIds.has(m.confirmedBy) && !offeredOnRoad.has(m.id)) bad.push(`${m.confirmedBy} confirms ${m.id}`);
    for (const w of s.words) for (const m of w.marks) if (S.markOf(s, m)?.candidates?.length && !offeredOnRoad.has(m)) bad.push(`${w.id} cuts ${m}`);
    expect(bad).toEqual([]);
  });
});

describe('with no Keys at all, the story goes on by work alone (D-129)', () => {
  /* eight hours a day in four jobs of Dan's own, no repeating job: no Key but the weekly floor's */
  const { facts, rows } = heavy(10, 8, false, 4);
  it('the places a Key held are reached on foot, their rows opened by the road, in order', () => {
    expect(facts.filter(f => f.type === 'keyEarned' && !f.rhythm.startsWith('floor:'))).toEqual([]);
    expect(rows.at(-1)!.storyWeek).toBeGreaterThanOrEqual(6);
    const st = S.storyState(facts, s);
    for (const id of ['b-3.B', 'b-4.B', 'b-6.B']) {
      expect(st.played.has(id), id).toBe(true);
      expect(facts.find(f => f.type === 'arrived' && f.id === id)).toMatchObject({ how: 'foot' });
      const x = S.beatOf(s, id)!.seal!;
      expect(opened(facts).find(f => f.seal === x), x).toMatchObject({ how: 'road' });
    }
    /* the rows the road opened came in the order Keys opened them */
    const order = opened(facts).filter(f => f.how === 'road').map(f => S.sealOf(s, f.seal)!);
    for (let i = 1; i < order.length; i++) expect(order[i].w * 100 + order[i].o, order[i].id).toBeGreaterThan(order[i - 1].w * 100 + order[i - 1].o);
    expect(aheadOfDan(facts)).toEqual([]);
    expect(outOfOrder(facts)).toEqual([]);
  }, 60_000);
  it('a row the road opens is a step like any other: its return never says a Key was earned', () => {
    const steps = opened(facts).filter(f => f.how === 'road' && !S.sealOf(s, f.seal)!.arrival)
      .map(f => facts.find(g => g.type === 'beatPlayed' && g.id === (S.sealOf(s, f.seal)!.beat ?? f.seal)) as FactOf<'beatPlayed'>)
      .filter(p => p.job !== undefined);
    expect(steps.length).toBeGreaterThan(0);
    for (const p of steps) expect(returnOf(C, facts, p.job!).key, p.id).toBe(false);
  }, 60_000);
});

describe('long days never hold a place back (Dan, D-129)', () => {
  const byMinutes = (m: number) => m < 75 ? 0 : Math.floor((m - 75) / 150) + 1;
  /* checked after every delve's end, not only at the day's end */
  const everyDelve = (bad: string[]) => (facts: Fact[], at: string) => {
    const v = see(facts, C, at), st = S.storyState(facts, s);
    if (v.nextAt === null) bad.push(`${at}: no next place`);
    if (st.onFoot !== byMinutes(v.walked)) bad.push(`${at}: ${st.onFoot} places for ${v.walked} minutes`);
  };
  it('one long job a day: every place the minutes reach comes as soon as they reach it, in order', () => {
    const bad: string[] = [];
    const { facts } = heavy(7, 8, false, 1, { afterDelve: everyDelve(bad) });
    expect(bad).toEqual([]);
    expect(aheadOfDan(facts)).toEqual([]);
    expect(outOfOrder(facts)).toEqual([]);
  }, 60_000);
  it('one big project, delved on all day and never said done: the places still come', () => {
    const bad: string[] = [];
    const { facts } = heavy(6, 8, false, 1, { afterDelve: everyDelve(bad), neverDone: true });
    expect(bad).toEqual([]);
    expect(aheadOfDan(facts)).toEqual([]);
    expect(outOfOrder(facts)).toEqual([]);
  }, 60_000);
});

describe('Keys kept for later never pile up while a niche could open (D-129 review)', () => {
  it('two and three hours a day with repeating jobs: a kept Key waits only while no niche can be opened', () => {
    for (const h of [2, 3]) {
      const { facts } = heavy(35, h);
      /* kept Keys drain, one on each job's return, whenever a niche can open: they never pile up (the review saw 25) */
      for (const day of new Set(facts.map(f => f.day))) {
        const st = S.storyState(facts.filter(f => f.day <= day), s);
        expect(st.held <= 2 || S.nextSeal(s, st) === null, `${h} h, ${day}: ${st.held} kept`).toBe(true);
      }
      const end = S.storyState(facts, s);
      expect(end.held <= 1 || S.nextSeal(s, end) === null, `${h} h: ${end.held} kept at the end`).toBe(true);
      /* a Key with nothing to open still brings the week's one surplus find with it */
      for (const k of facts.filter(g => g.type === 'keyHeld')) {
        const earned = facts.filter(g => g.seq < k.seq && g.type === 'keyEarned').pop()!;
        if (earned.type === 'keyEarned' && earned.rhythm.startsWith('floor:')) continue;
        expect(facts.some(g => g.type === 'findGiven' && g.why === 'surplus' && calendarWeek(g.day) === calendarWeek(k.day)), k.day).toBe(true);
      }
    }
  }, 120_000);
});

describe('Keys open only the niches; the road opens its own rows on the way (D-129)', () => {
  const { facts } = heavy(14, 8);
  it('a story bit that played on the way to a place shows on that place\'s arrival, with its record, and no Key\'s words', () => {
    /* one job a day besides the repeating ones: the minutes run ahead of the story bits, so they play on the way */
    let shown = 0, roadRows = 0, withRecords = 0;
    for (let i = 0; i < facts.length; i++) {
      const f = facts[i];
      if (f.type !== 'beatPlayed' || f.job !== undefined || f.id === 'passage') continue;
      const b = S.beatOf(s, f.id), x = S.sealOf(s, f.id) ?? (b?.kind === 'stepKey' ? S.sealOf(s, b.seal!) : undefined);
      if (b?.kind !== 'step' && !(x && S.onRoad(s, x.id))) continue;   /* a Key's niche on the floor or a kept Key: not this */
      if (x && !facts.some(g => g.type === 'sealOpened' && g.seal === x.id && g.how === 'road')) continue;
      /* played on the way: the next arrival is a place, and shows the bit's line, its records and its guesses */
      const arr = facts.slice(i).find((g): g is FactOf<'arrived'> => g.type === 'arrived')!;
      expect(arr.kind, f.id).toBe('place');
      const upTo = facts.findIndex(g => g.type === 'seen' && g.what === 'arrival' && g.ref === arr.seq);
      const a = see(facts.slice(0, upTo), C, arr.at).arrival!;
      expect(a.seq, f.id).toBe(arr.seq);
      const line = b?.line ?? x?.line;
      const w = a.way.find(v => v.beat === f.id);
      expect(!!w && w.line === line, f.id).toBe(true);
      expect(a.opened.includes(line!), f.id).toBe(false);
      const recs = [...(x?.carries?.records ?? []), ...(b?.carries?.records ?? [])];
      for (const r of recs) expect(w!.records.includes(r), `${f.id} ${r}`).toBe(true);
      for (const m of [...(x?.carries?.guess ?? []), ...(b?.carries?.guess ?? [])])
        if (S.markOf(s, m)?.confirmedBy !== arr.id) expect(a.guess.includes(m), `${f.id} ${m}`).toBe(true);
      /* a bit with a small choice offers it here */
      if (b?.choice) expect(w!.choice, f.id).toEqual(b.choice);
      shown++; if (x) roadRows++; if (recs.length) withRecords++;
    }
    expect(shown).toBeGreaterThan(0);
    expect(roadRows).toBeGreaterThan(0);
    expect(withRecords).toBeGreaterThan(0);
  }, 60_000);
  it('every row a Key opened is a niche, and Keys still open some; their return says a Key', () => {
    const byKey = opened(facts).filter(f => f.how !== 'road');
    expect(byKey.length).toBeGreaterThan(3);
    for (const f of byKey) expect(road.has(f.seal), f.seal).toBe(false);
    for (const f of opened(facts).filter(f => f.how === 'road')) expect(road.has(f.seal), f.seal).toBe(true);
    /* Keys still come only from repeating jobs kept up, at most five a calendar week, plus the floor (rule 10) */
    const perWeek = new Map<number, number>();
    for (const f of facts) if (f.type === 'keyEarned' && !f.rhythm.startsWith('floor:')) { const d = Math.floor((Date.parse(f.day) - Date.parse('2026-09-28')) / 7 / 864e5); perWeek.set(d, (perWeek.get(d) ?? 0) + 1); }
    for (const n of perWeek.values()) expect(n).toBeLessThanOrEqual(S.KEYS_A_WEEK);
    /* a niche's step a Key played as a job's return still says a Key */
    const keyed = byKey.map(f => facts.find(g => g.type === 'beatPlayed' && g.id === S.sealOf(s, f.seal)!.beat) as FactOf<'beatPlayed'> | undefined)
      .filter(p => p?.job);
    expect(keyed.length).toBeGreaterThan(0);
    for (const p of keyed) expect(returnOf(C, facts, p!.job!).key, p!.id).toBe(true);
    expect(aheadOfDan(facts)).toEqual([]);
    expect(outOfOrder(facts)).toEqual([]);
  }, 60_000);
});
