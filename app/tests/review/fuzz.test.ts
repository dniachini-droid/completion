/**
 * The hostile review's fuzz test (docs/reviews/BREAK-IT.md). Random but valid command sequences with random clock jumps
 * into act / settle / see; invariants in ./fuzz.ts. Small by default so `npm test` stays quick; for the review's full
 * run (thousands of sequences): FUZZ_RUNS=250 FUZZ_LEN=200 npx vitest run tests/review/fuzz.test.ts
 * `it.fails` marks a finding: it passes while the problem is there, and fails once it is fixed. Ids only.
 */
import { describe, expect, it } from 'vitest';
import { play, roundTrip, type Problem } from './fuzz';
import { env } from './node';

const RUNS = +(env.FUZZ_RUNS ?? 6), LEN = +(env.FUZZ_LEN ?? 120), SEED = +(env.FUZZ_SEED ?? 1);
/* a job deleted (or let go) while its delve runs, or while its delve's end waits to be looked at: see the report's R5 */
const ORPHAN = new Set(['runMissingJob', 'nextMissingJob', 'runEndMissingJob']);

function batch(opts: { uiOnly?: boolean; backwards?: boolean }, seed0: number) {
  const found: (Problem & { seed: number; step: number })[] = [];
  for (let s = seed0; s < seed0 + RUNS; s++) {
    const g = play(s, LEN, opts);
    for (const p of g.problems) found.push({ ...p, seed: s });
    for (const p of roundTrip(g.facts, g.now)) found.push({ ...p, seed: s, step: LEN });
  }
  const first = (pred: (p: Problem) => boolean) => found.filter(pred).slice(0, 3).map(p => `${p.kind} seed ${p.seed} step ${p.step}: ${p.detail}`);
  return { found, first };
}

describe('fuzz: the rules under random play (clock forward, as the screens send)', () => {
  const b = batch({ uiOnly: true }, SEED);
  it('nothing throws; days are dates; minutes never negative; no job paid twice; the slate and Satchel stay true; saves round-trip', () => {
    expect(b.first(p => !ORPHAN.has(p.kind))).toEqual([]);
  });
});

describe('fuzz: findings', () => {
  it('R5 (fixed): a job removed while its delve runs, or before its end is looked at, never leaves the run or end without its job', () => {
    /* found with larger runs (FUZZ_RUNS=250); seed 7005 / 5008 reach it within 200 steps */
    const g1 = play(7005, 94, { uiOnly: false }), g2 = play(5008, 196, { uiOnly: true });
    expect([...g1.problems, ...g2.problems].filter(p => ORPHAN.has(p.kind))).toEqual([]);
  });
  it('R7 (fixed): a phone clock set back keeps the log in time order and a delve end that says what it paid', () => {
    const g = play(2001, 20, { backwards: true }), h = play(2017, 142, { backwards: true });
    expect([...g.problems, ...h.problems].filter(p => p.kind === 'timeOrder' || p.kind === 'endVsPaid')).toEqual([]);
  });
});
