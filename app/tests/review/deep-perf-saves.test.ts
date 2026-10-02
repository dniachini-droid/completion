/**
 * Deep review (performance): the rules' hot calls timed on saved saves of growing length (written by
 * deep-perf-rules.test.ts into SAVES=<dir>), on a quiet machine, median of 15. What one tap costs the app is act() then
 * see() (the view is derived from the facts, ui/game.svelte.ts) then alertsDue() (reminders, on the phone); a delve's
 * second is settle() then see(). Runs with REVIEW_SLOW=1 SAVES=<dir>.
 */
import { expect, it } from 'vitest';
import { env, writeFileSync } from './node';
import { act, see, settle } from '../../src/core/game';
import { alertsDue } from '../../src/core/reminders';
import { readSave } from '../../src/core/save';
import { content as C } from '../../src/content/world';
import type { Fact } from '../../src/core/types';

const proc = (globalThis as unknown as { process: { getBuiltinModule(n: string): any } }).process;
const fs = proc.getBuiltinModule('node:fs');
const med = (f: () => unknown, n = 15) => { f(); const xs: number[] = []; for (let i = 0; i < n; i++) { const t = performance.now(); f(); xs.push(performance.now() - t); } xs.sort((a, b) => a - b); return +xs[n >> 1].toFixed(1); };

it.skipIf(!env.REVIEW_SLOW || !env.SAVES)('hot calls on saves of 1 week to 2 years (report)', () => {
  const rows: Record<string, number | string>[] = [];
  for (const w of [1, 4, 13, 26, 52, 78, 104]) {
    const path = `${env.SAVES}/save-${w}w.json`;
    if (!fs.existsSync(path)) continue;
    const raw: string = fs.readFileSync(path, 'utf8');
    const facts = readSave(raw)!.save.facts as Fact[];
    const last = facts[facts.length - 1].at;
    const at = last.slice(0, 10) + 'T20:00:00' + last.slice(19);
    const v = see(facts, C, at);
    const job = v.order.find(j => !v.done.has(j)) ?? C.jobs.find(j => j.delve)!.id;
    const running = facts.concat(act(facts, C, { do: 'startRun', job, minutes: 25, count: 1 }, at));
    const sec = at.replace(':00:00', ':00:07');
    const tap = (cmd: Parameters<typeof act>[2]) => () => { const f = facts.concat(act(facts, C, cmd, at)); see(f, C, at); alertsDue(C, f, at); };
    const row = {
      weeks: w, facts: facts.length, saveKB: Math.round(raw.length / 1024),
      load: med(() => readSave(raw), 7),
      see: med(() => see(facts, C, at)),
      'tap: done': med(tap({ do: 'done', job })),
      'tap: startRun': med(tap({ do: 'startRun', job, minutes: 25, count: 1 })),
      'open (cold start: settle+open+see)': med(() => { const f = facts.concat(settle(facts, C, at)); const g = f.concat(act(f, C, { do: 'open' }, at)); see(g, C, at); }, 7),
      'delve second (settle+see)': med(() => { settle(running, C, sec); see(running, C, sec); }),
      alertsDue: med(() => alertsDue(C, facts, at)),
    };
    rows.push(row);
    console.log(JSON.stringify(row));
  }
  writeFileSync(env.OUT ?? '/tmp/deep-perf-saves.json', JSON.stringify(rows, null, 1));
  expect(rows.length).toBeGreaterThan(0);
}, 1_200_000);
