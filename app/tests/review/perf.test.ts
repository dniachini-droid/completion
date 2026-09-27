/**
 * The hostile review (docs/reviews/BREAK-IT.md): how long see() and settle() take on a long save. During a delve the
 * screen rebuilds the view once a second (ui/game.svelte.ts tick), so its cost grows with Dan's history. Numbers only.
 */
import { expect, it } from 'vitest';
import { writeFileSync, env } from './node';
import { see, settle } from '../../src/core/game';
import { content as C } from '../../src/content/world';
import { sim } from '../rules/sim';

it('see() on 1, 3 and 6 months of normal play (report)', () => {
  const out: string[] = [];
  for (const weeks of [4, 13, 26]) {
    const p = sim('2026-09-28T08:00:00+01:00', m => m.candidates![0], 'kept');
    for (let i = 0; i < weeks; i++) p.week('normal');
    const at = p.at();
    const t0 = performance.now(); for (let i = 0; i < 10; i++) see(p.facts, C, at); const s = (performance.now() - t0) / 10;
    const t1 = performance.now(); for (let i = 0; i < 10; i++) settle(p.facts, C, at); const t = (performance.now() - t1) / 10;
    out.push(`${weeks} weeks: ${p.facts.length} facts, see ${s.toFixed(1)} ms, settle ${t.toFixed(1)} ms (this machine; a phone is several times slower)`);
  }
  writeFileSync(env.OUT ?? '/tmp/perf.txt', out.join('\n'));
  console.log(out.join('\n'));
  expect(out.length).toBe(3);
}, 600_000);
