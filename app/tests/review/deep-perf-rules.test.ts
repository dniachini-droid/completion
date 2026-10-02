/**
 * Deep review (performance): what the rules engine costs as the save grows. A simulated Dan plays normal weeks (with a
 * mix of low/high days and goodnight each evening) for up to two years; at checkpoints every call the app makes on its
 * hot paths is timed: see() (the view, rebuilt on every fact and once a second in a delve), settle() (the clock), act()
 * for a few commands, the reminders' list, a save's parse. Also the cost of the simulation itself per week (it does a few
 * hundred see/act calls a week, so a week that gets slower and slower is the O(n^2) signal).
 * Numbers only, ids only (no story text). Runs with REVIEW_SLOW=1; writes OUT (default /tmp/deep-perf-rules.json) and
 * SAVES=<dir> writes each checkpoint's save, to load into the browser (deep-perf-big.mjs).
 */
import { expect, it } from 'vitest';
import { writeFileSync, env } from './node';
import { act, see, settle } from '../../src/core/game';
import { alertsDue } from '../../src/core/reminders';
import { readSave, SAVE_VERSION } from '../../src/core/save';
import { content as C } from '../../src/content/world';
import { sim, type Week } from '../rules/sim';

const time = (f: () => unknown, n = 5) => { f(); const t0 = performance.now(); for (let i = 0; i < n; i++) f(); return +((performance.now() - t0) / n).toFixed(2); };

it.skipIf(!env.REVIEW_SLOW)('the rules engine on 1 week to 2 years of play (report)', () => {
  const CHECK = new Set([1, 4, 13, 26, 52, 78, 104]);
  const mix: Week[] = ['normal', 'normal', 'low', 'normal', 'high', 'normal', 'normal'];
  const p = sim('2026-09-28T08:00:00+01:00', m => m.candidates![0], 'kept');
  const rows: Record<string, unknown>[] = [];
  const weekMs: number[] = [];
  for (let w = 1; w <= 104; w++) {
    const t0 = performance.now();
    p.week(w % 9 === 0 ? 'away' : mix);
    weekMs.push(+(performance.now() - t0).toFixed(0));
    if (!CHECK.has(w)) continue;
    const facts = p.facts, at = p.at();
    const raw = JSON.stringify({ version: SAVE_VERSION, content: C.version, facts });
    const v = see(facts, C, at);
    const job = v.order.find(j => !v.done.has(j)) ?? C.jobs.find(j => j.delve)!.id;
    /* a delve under way: the once-a-second tick is settle() then see() with the run on */
    const running = facts.concat(act(facts, C, { do: 'startRun', job, minutes: 25, count: 1 }, at));
    const later = at.replace(/T(\d\d):/, (_, h) => `T${String(Math.min(23, +h + 0)).padStart(2, '0')}:`);
    const row = {
      weeks: w, facts: facts.length, saveKB: +(raw.length / 1024).toFixed(0),
      parseMs: time(() => readSave(raw)),
      stringifyMs: time(() => JSON.stringify({ facts })),
      seeMs: time(() => see(facts, C, at)),
      settleMs: time(() => settle(facts, C, at)),
      openMs: time(() => act(facts, C, { do: 'open' }, at)),
      startRunMs: time(() => act(facts, C, { do: 'startRun', job, minutes: 25, count: 1 }, at)),
      doneMs: time(() => act(facts, C, { do: 'done', job }, at)),
      delveTickMs: time(() => { settle(running, C, later); see(running, C, later); }),
      alertsDueMs: time(() => alertsDue(C, facts, at)),
      simWeekMs: weekMs[w - 1],
    };
    rows.push(row);
    console.log(JSON.stringify(row));
    if (env.SAVES) writeFileSync(`${env.SAVES}/save-${w}w.json`, raw);
  }
  writeFileSync(env.OUT ?? '/tmp/deep-perf-rules.json', JSON.stringify({ rows, weekMs }, null, 1));
  expect(rows.length).toBe(CHECK.size);
}, 3_600_000);
