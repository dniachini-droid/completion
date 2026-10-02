/**
 * Deep review (performance): where see() and act() spend their time on a long save. Loads SAVE (a save file written by
 * deep-perf-rules.test.ts), runs each call 20 times under Node's own profiler, and lists the functions with the most
 * self time (function names and files only, no story text). Runs with REVIEW_SLOW=1 and SAVE=<path>.
 */
import { expect, it } from 'vitest';
import { env, writeFileSync } from './node';
import { act, see } from '../../src/core/game';
import { content as C } from '../../src/content/world';
import type { Fact } from '../../src/core/types';

const proc = (globalThis as unknown as { process: { getBuiltinModule(n: string): any } }).process;
const readFileSync = (p: string): string => proc.getBuiltinModule('node:fs').readFileSync(p, 'utf8');

it.skipIf(!env.REVIEW_SLOW || !env.SAVE)('profile see() and act(done) on a long save (report)', async () => {
  const facts = JSON.parse(readFileSync(env.SAVE!)).facts as Fact[];
  const last = facts[facts.length - 1].at;
  const at = last.slice(0, 10) + 'T20:00:00' + last.slice(19);
  const v = see(facts, C, at);
  const job = v.order.find(j => !v.done.has(j)) ?? C.jobs[0].id;
  const { Session } = proc.getBuiltinModule('node:inspector');
  const s = new Session(); s.connect();
  const post = (m: string, p?: object) => new Promise<any>((res, rej) => s.post(m, p ?? {}, (e: unknown, r: unknown) => e ? rej(e) : res(r)));
  const out: string[] = [];
  for (const [name, f] of [['see', () => see(facts, C, at)], ['done', () => act(facts, C, { do: 'done', job }, at)], ['open', () => act(facts, C, { do: 'open' }, at)]] as const) {
    await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 100 }); await post('Profiler.start');
    const t0 = performance.now(); for (let i = 0; i < 20; i++) f(); const ms = (performance.now() - t0) / 20;
    const { profile } = await post('Profiler.stop');
    const self = new Map<string, number>(); let total = 0;
    const dt = new Map<number, number>();
    profile.samples.forEach((id: number, i: number) => dt.set(id, (dt.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0)));
    for (const n of profile.nodes) {
      const t = dt.get(n.id) ?? 0; total += t;
      const k = `${n.callFrame.functionName || '(anon)'} ${String(n.callFrame.url).split('/').slice(-2).join('/')}:${n.callFrame.lineNumber + 1}`;
      self.set(k, (self.get(k) ?? 0) + t);
    }
    out.push(`${name}: ${ms.toFixed(1)} ms per call, ${facts.length} facts; top self time:`);
    for (const [k, t] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 14)) out.push(`  ${(100 * t / total).toFixed(1).padStart(5)}%  ${k}`);
  }
  s.disconnect();
  writeFileSync(env.OUT ?? '/tmp/deep-perf-profile.txt', out.join('\n'));
  console.log(out.join('\n'));
  expect(out.length).toBeGreaterThan(0);
}, 600_000);
