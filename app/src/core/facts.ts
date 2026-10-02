/**
 * The log, indexed once (deep review F#4). The rules ask "every fact of this type" and "every fact of this day" hundreds
 * of times per call; each used to be a pass over the whole log. Here each log array is read once and kept by type and by
 * day; a log that grew in place (a command adding its facts as it goes) is read on from where it was. Pure, no rule here.
 */
import type { Fact, FactBody, FactOf } from './types';
import { gameDay, type Moment } from './time';

interface Index { n: number; byType: Map<string, Fact[]>; byDay: Map<string, Fact[]> }
const memo = new WeakMap<Fact[], Index>();
const add = <K>(m: Map<K, Fact[]>, k: K, f: Fact) => { const a = m.get(k); if (a) a.push(f); else m.set(k, [f]); };

function read(facts: Fact[]): Index {
  let x = memo.get(facts);
  if (!x || x.n > facts.length) { x = { n: 0, byType: new Map(), byDay: new Map() }; memo.set(facts, x); }
  for (; x.n < facts.length; x.n++) { const f = facts[x.n]; add(x.byType, f.type, f); add(x.byDay, f.day, f); }
  return x;
}

/** Every fact of one type, in log order (a fresh array: the caller may change it). */
export const ofType = <T extends FactBody['type']>(facts: Fact[], type: T): FactOf<T>[] =>
  (read(facts).byType.get(type)?.slice() ?? []) as FactOf<T>[];
/** Every fact written on one day, in log order (a fresh array). */
export const onDay = (facts: Fact[], day: string): Fact[] => read(facts).byDay.get(day)?.slice() ?? [];

/** The game day at `now`, never behind the latest day already in the log (deep review R#6: flying west after 04:00 sent
    it back, and a session could be written to a day already behind). Looked for back to the last opening. */
export function dayOf(facts: Fact[], now: Moment): string {
  let d = gameDay(now);
  /* (a plan change's day is the day a job moves to, never a day played: it is passed over) */
  for (let i = facts.length - 1; i >= 0; i--) { const f = facts[i]; if (f.type !== 'planChanged' && f.day > d) d = f.day; if (f.type === 'opened') break; }
  return d;
}
