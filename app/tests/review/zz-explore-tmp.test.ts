import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { act, see, settle, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
const OUT = '/tmp/claude-0/-home-user-completion/cbe3d0d5-06ef-54aa-b235-b21eb07c1eb5/scratchpad/';
type Week = 'normal' | 'low' | 'high' | 'away';
function ksim(bed?: 'kept' | 'late', useKeys = true) {
  let facts: Fact[] = []; let now = Date.parse('2026-09-28T08:00:00+01:00');
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
  const wait = (min: number) => { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); };
  const answer = () => {
    const st = S.storyState(facts, C.story);
    for (const m of st.offered) if (!st.guessed.has(m)) { const mk = S.markOf(C.story, m); if (mk?.candidates) run({ do: 'guess', mark: m, guess: mk.candidates[0] }); }
    if (useKeys) for (let k = 0; k < 10; k++) { const s2 = S.storyState(facts, C.story); const o = S.openable(C.story, s2)[0]; if (!o || s2.held < 1) break; run({ do: 'useKey', seal: o.id }); }
    let a = see(facts, C, at()).arrival;
    while (a) { run({ do: 'seen', what: 'arrival', ref: a.seq }); a = see(facts, C, at()).arrival; }
  };
  const day = (kind: Week) => {
    const d0 = now;
    if (kind === 'away') { now = d0 + 864e5; return; }
    run({ do: 'open' });
    if (kind === 'low') run({ do: 'capacity', capacity: 'low' });
    if (kind === 'high') run({ do: 'capacity', capacity: 'high' });
    for (let guard = 0; guard < 12; guard++) {
      answer();
      const v = see(facts, C, at());
      if (v.complete && kind !== 'high') break;
      if (v.complete && guard > 8) break;
      const job = v.next?.job ?? v.order.find(j => !v.done.has(j)) ?? (kind === 'high' ? C.jobs.find(j => !v.done.has(j.id) && !j.item)?.id : undefined);
      if (!job) break;
      const j = C.jobs.find(x => x.id === job)!;
      if (j.delve) { run({ do: 'startRun', job, minutes: 25, count: Math.ceil((j.enoughAt ?? j.length) / 25) }); wait((j.enoughAt ?? j.length) * 1.3 + 10); if (!see(facts, C, at()).done.has(job)) run({ do: 'done', job }); }
      else { run({ do: 'begin', job }); wait(j.length); run({ do: 'done', job }); }
      const e = see(facts, C, at()).runEnd; if (e) run({ do: 'seen', what: 'step', ref: e.seq });
    }
    answer();
    if (bed) { now = Math.max(now, d0 + (bed === 'kept' ? 13.75 : 15.5) * 3_600_000); run({ do: 'goodnight' }); }
    now = d0 + 864e5;
  };
  return { get facts() { return facts; }, week(k: Week | Week[]) { for (let i = 0; i < 7; i++) day(Array.isArray(k) ? k[i] : k); return this; } };
}
it('explore2', () => {
  const runs: Record<string, unknown> = {};
  const plans: [string, Week | Week[], 'kept' | 'late' | undefined, number][] = [
    ['normal-kept-keys', 'normal', 'kept', 18], ['high-kept-keys', 'high', 'kept', 8], ['low-kept-keys', 'low', 'kept', 22],
    ['slow-kept-keys', ['low', 'away', 'low', 'away', 'low', 'away', 'away'], 'kept', 22]];
  for (const [name, kind, bed, n] of plans) {
    const p = ksim(bed); const weeks: number[] = [];
    for (let i = 0; i < n; i++) { p.week(kind); weeks.push(S.storyState(p.facts, C.story).week); }
    runs[name] = { weeks, facts: p.facts };
  }
  writeFileSync(OUT + 'runs2.json', JSON.stringify(runs));
}, 1_500_000);
