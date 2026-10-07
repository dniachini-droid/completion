/**
 * D-160: the day ends only on Go to sleep; Dan camps where he is; no trips back to camp at the top. Played through all
 * fourteen story weeks at five paces. Ids only: no story text here.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../../src/core/story';
import { arrivalAt } from '../../src/core/game';
import type { Fact, FactOf } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { sim, type Week } from './sim';

const s = C.story;
const route = s.route.flatMap(r => r.places.map(p => p.id));
const arrivals = (facts: Fact[]) => facts.filter((f): f is FactOf<'arrived'> => f.type === 'arrived');
function life(kind: Week, bed: 'kept' | undefined, weeks: number) {
  const d = sim(undefined, undefined, bed);
  for (let i = 0; i < weeks; i++) { d.week(kind); if (S.storyState(d.facts, s).week >= 14 && S.weekDone(s, S.storyState(d.facts, s))) break; }
  return d.facts;
}
/** Where an item is: a beat's, a seal's, a find's, a view's stretch. */
const stretchOf = (id: string) => (S.beatOf(s, id) ?? S.sealOf(s, id) ?? s.finds.find(f => f.id === id) ?? s.camps.find(c => c.id === id))?.stretch;
/** The seq of the first arrival below the top: from then on, Dan has gone down. */
const departedAt = (facts: Fact[]) => arrivals(facts).find(a => a.kind === 'place' && !S.isTop(s, S.beatOf(s, a.id)!.stretch))?.seq ?? Infinity;

describe('camp where you are (D-160)', () => {
  const lives = {
    normal: life('normal', 'kept', 22), nobed: life('normal', undefined, 22), short: life('short', 'kept', 40),
    long: life('long', 'kept', 10), low: life('low', undefined, 40), high: life('high', 'kept', 10),
  };
  it('every pace reaches the end of week 14, every place once, nothing twice', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const st = S.storyState(facts, s);
      expect(st.week, name).toBe(14);
      const ids = arrivals(facts).filter(f => f.kind === 'place').map(f => f.id);
      expect(new Set(ids).size, name).toBe(ids.length);
      expect(route.filter(id => !ids.includes(id)), name).toEqual([]);
      const beats = facts.filter((f): f is FactOf<'beatPlayed'> => f.type === 'beatPlayed' && f.id !== 'passage').map(f => f.id);
      expect(beats.filter((id, i) => beats.indexOf(id) !== i), name).toEqual([]);
    }
  }, 600_000);
  it('nothing ends the day but Go to sleep: no day complete, no evening at camp, no stop short of a place', () => {
    for (const [name, facts] of Object.entries(lives)) {
      expect(facts.some(f => f.type === 'dayCompleted'), name).toBe(false);
      expect(arrivals(facts).some(a => a.kind === 'evening' || a.how === 'evening'), name).toBe(false);
      /* a camp only ever just after a goodnight */
      for (const a of arrivals(facts).filter(x => x.kind === 'camp')) {
        const before = facts.filter(f => f.seq < a.seq).pop();
        expect(before?.type, `${name} ${a.id}`).toBe('goodnight');
      }
    }
  });
  it('every goodnight after the first place camps, where Dan is: the place he reached or a view of his area, never the top once he has gone down', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const gone = departedAt(facts);
      for (const g of facts.filter(f => f.type === 'goodnight')) {
        const st = S.storyState(facts.filter(f => f.seq <= g.seq), s);
        const camp = facts.find(f => f.seq === g.seq + 1) as FactOf<'arrived'> | undefined;
        if (!st.here) { expect(camp?.type === 'arrived' && camp.kind === 'camp', name).toBe(false); continue; }
        expect(camp?.type === 'arrived' && camp.kind === 'camp', `${name} @${g.seq}`).toBe(true);
        const where = stretchOf(camp!.id)!;
        expect(S.areaOf(s, where), `${name} ${camp!.id}`).toBe(S.areaOf(s, st.stretch));
        if (g.seq > gone) expect(S.isTop(s, where), `${name} ${camp!.id}`).toBe(false);
      }
    }
  });
  it('once Dan has gone down, nothing at the top plays: no place, no moment, no find, no lock opened on the road', () => {
    for (const [name, facts] of Object.entries(lives)) {
      const gone = departedAt(facts);
      expect(gone, name).toBeLessThan(Infinity);
      const top = facts.filter(f => f.seq > gone).flatMap(f => {
        const id = f.type === 'arrived' && f.kind === 'place' ? f.id : f.type === 'beatPlayed' && f.id !== 'passage' ? f.id
          : f.type === 'findGiven' ? f.id : f.type === 'sealOpened' ? f.seal : null;
        if (!id) return [];
        const b = S.beatOf(s, id), x = S.sealOf(s, id);
        /* the night's thought, the morning's, the week's close: not set anywhere (D-160) */
        if (b && (b.kind === 'camp' || b.kind === 'morning' || b.kind === 'close')) return [];
        /* carried with him */
        if (b?.portable || x?.portable) return [];
        const where = stretchOf(id);
        return where && S.isTop(s, where) ? [id] : [];
      });
      expect(top, name).toEqual([]);
    }
  });
  it('every move to another area is announced: a new area, or back to one with how and why', () => {
    for (const [name, facts] of Object.entries(lives)) {
      for (const f of arrivals(facts).filter(a => a.kind === 'place')) {
        const a = arrivalAt(facts, C, f.seq)!;
        if (a.face !== 'back') continue;
        const b = S.beatOf(s, f.id)!;
        expect(!!a.wayIn || !!b.said || !!a.errand, `${name} ${f.id}`).toBe(true);
      }
    }
  });
});
