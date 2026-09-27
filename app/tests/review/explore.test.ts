/**
 * The review's exploration runner: many seeds, each problem kind with its first seed and step, written to a file.
 * Only runs when asked: RUNS=250 LEN=200 [UI=0] [BACK=1] OUT=/tmp/explore.txt npx vitest run tests/review/explore.test.ts
 */
import { it } from 'vitest';
import { appendFileSync, env } from './node';
import { play } from './fuzz';

it.skipIf(!env.RUNS)('explore', () => {
  const N = +(env.RUNS ?? 40), L = +(env.LEN ?? 150), start = +(env.SEED ?? 1), out = env.OUT ?? '/tmp/explore.txt';
  const kinds = new Map<string, { n: number; seed: number; step: number; detail: string }>();
  const t0 = Date.now();
  for (let s = start; s < start + N; s++) {
    const g = play(s, L, { uiOnly: env.UI !== '0', backwards: env.BACK === '1' });
    for (const p of g.problems) { const k = kinds.get(p.kind); if (!k) kinds.set(p.kind, { n: 1, seed: s, step: p.step, detail: p.detail }); else k.n++; }
  }
  appendFileSync(out, `runs ${N} × ${L} in ${Date.now() - t0} ms\n`);
  for (const [k, v] of kinds) appendFileSync(out, [k, v.n, 'seed', v.seed, 'step', v.step, v.detail.slice(0, 400)].join(' ') + '\n');
}, 3_600_000);

/* Replay: CASES="seed:step:kind:ui:back,..." prints the last commands before each problem. */
it.skipIf(!env.CASES)('replay', () => {
  for (const spec of (env.CASES ?? '').split(',')) {
    const [seed, step, kind, ui, back] = spec.split(':');
    const g = play(+seed, +step + 1, { uiOnly: ui !== '0', backwards: back === '1' });
    const p = g.problems.find(x => x.kind === kind);
    appendFileSync(env.OUT ?? '/tmp/replay.txt', [`== seed ${seed} ${kind}: ${p?.detail} at step ${p?.step}`,
      ...g.log.slice(-14).map(l => `${l.at} ${JSON.stringify(l.cmd).slice(0, 160)}`)].join('\n') + '\n');
  }
}, 600_000);
