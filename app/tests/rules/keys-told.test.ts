/**
 * Every Key a recurring job earns is told on that job's return, when it is earned, whether it opens something at once or
 * is kept for later; a kept Key that opens something later says it was kept, never that the job in hand earned it
 * (Dan, 2026-10-01, D-141). Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import { returnOf } from '../../src/core/game';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { heavy } from '../review/heavy';

/* the Done whose facts a fact was written with: the last jobDone before it, the same day */
const doneOf = (facts: Fact[], seq: number) => [...facts].reverse().find(f => f.seq < seq && f.type === 'jobDone');
const arrivedSince = (facts: Fact[], from: number, to: number) => facts.some(f => f.seq > from && f.seq < to && f.type === 'arrived');

describe('Keys are told when earned, and kept Keys are told as kept (D-141)', () => {
  for (const h of [2, 3, 8]) it(`${h} hours a day for three weeks`, () => {
    const { facts } = heavy(21, h);
    let earned = 0, held = 0, keptOnReturn = 0;
    for (const f of facts) {
      if (f.type === 'keyEarned' && !f.rhythm.startsWith('floor:')) {
        const d = doneOf(facts, f.seq)!;
        const next = facts.find(g => g.seq === f.seq + 1)!;
        expect(returnOf(C, facts, d.seq).keyNote, `${f.day} ${f.rhythm}`).toBe(next.type === 'keyHeld' ? 'held' : 'earned');
        if (next.type === 'keyHeld') held++; else earned++;
      }
      /* a kept Key used on a job's return (not on an arrival the same Done reached) */
      if (f.type === 'keyUsed') {
        const d = doneOf(facts, f.seq);
        if (!d || d.day !== f.day || arrivedSince(facts, d.seq, f.seq)) continue;
        expect(returnOf(C, facts, d.seq).keyNote, f.day).toBe('kept');
        keptOnReturn++;
      }
    }
    expect(earned + held).toBeGreaterThan(0);
    if (h <= 3) { expect(held, 'some Keys are kept on a light day').toBeGreaterThan(0); expect(keptOnReturn).toBeGreaterThan(0); }
  }, 120_000);
});
