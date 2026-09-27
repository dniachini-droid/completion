/**
 * A heavy worker, for the pace probe (docs/reviews/BREAK-IT.md, finding 2) and the road's rule tests (D-129): delves for
 * hours every day from a Monday; each day's end records the story week, minutes walked, the next place's mark, and what
 * the story waits on. Ids and numbers only: no story text.
 */
import { act, see, settle, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

const kindOf = (id: string) => id.startsWith('seal-') ? 'seal' : id.startsWith('mk-') ? 'mark' : id.startsWith('fd-') ? 'find' : (S.beatOf(C.story, id)?.kind ?? 'other');
/** A row only a Key opens (a niche), or its step (D-129). */
const keyOnly = (id: string) => { const x = S.sealOf(C.story, id) ?? S.sealOf(C.story, S.beatOf(C.story, id)?.seal ?? '');
  return !!x && !x.seenOnly && !S.onRoad(C.story, x.id) && (id === x.id || S.beatOf(C.story, id)?.kind === 'stepKey'); };
/** What the road waits on that only a Key could open: this week's and next week's unplayed places and this week's steps,
    their unmet reqs that are Key-only rows. Empty under D-129. */
export function keyOnlyHolds(st: S.StoryState): string[] {
  const out: string[] = [];
  const road = [...C.story.route.filter(r => r.w === st.week || r.w === st.week + 1).flatMap(r => r.places.map(p => S.beatOf(C.story, p.id)!)),
    ...C.story.beats.filter(b => b.w === st.week && b.kind === 'step')];
  for (const b of road) if (b && !st.played.has(b.id)) for (const r of b.req) if (!S.met(st, r) && keyOnly(r)) out.push(`${b.id}<${r}`);
  return out;
}
/** What the story waits on: this week's and next week's unplayed places with their unmet reqs, and unplayed steps. */
export function whyHeld(st: S.StoryState): string {
  const out: string[] = [];
  for (const rw of C.story.route.filter(r => r.w === st.week || r.w === st.week + 1)) for (const p of rw.places) {
    if (st.played.has(p.id)) continue;
    const b = S.beatOf(C.story, p.id); const lack = (b?.req ?? []).filter(r => !S.met(st, r));
    out.push(`${p.id}${p.k ? '[key]' : ''}${lack.length ? '<' + lack.map(r => `${r}:${kindOf(r)}`).join('+') : ''}`);
  }
  const steps = C.story.beats.filter(b => b.w === st.week && (b.kind === 'step' || (b.kind === 'stepKey' && S.onRoad(C.story, b.seal))) && !st.played.has(b.id));
  if (steps.length) out.push('steps:' + steps.map(b => b.id + (b.req.filter(r => !S.met(st, r)).length ? '<' + b.req.filter(r => !S.met(st, r)).join('+') : '') + (st.visited.has(b.stretch) ? '' : '(unvisited)')).join(','));
  return out.join(' ');
}
/** `oneOffs`: how many one-off jobs of Dan's own share the hours left after the repeating ones. */
export function heavy(days: number, hours: number, rhythmsToo = true, oneOffs = 1) {
  let facts: Fact[] = [];
  let now = Date.parse('2026-09-28T07:00:00Z');   /* a Monday, 08:00 at +01:00 */
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
  const wait = (min: number) => { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); };
  const answer = () => {
    const st = S.storyState(facts, C.story);
    for (const m of st.offered) if (!st.guessed.has(m)) { const mk = S.markOf(C.story, m); if (mk?.candidates?.length) run({ do: 'guess', mark: m, guess: mk.candidates[0] }); }
    let v = see(facts, C, at());
    for (let g = 0; g < 40 && (v.arrival || v.runEnd || v.morning || v.welcome); g++) {
      if (v.arrival) run({ do: 'seen', what: 'arrival', ref: v.arrival.seq });
      else if (v.runEnd) run({ do: 'seen', what: 'step', ref: v.runEnd.seq });
      else if (v.morning) run({ do: 'seen', what: 'morning', ref: v.morning.seq });
      else if (v.welcome) run({ do: 'seen', what: 'welcome', ref: v.welcome.seq });
      v = see(facts, C, at());
    }
  };
  const rows: { day: string; storyWeek: number; walked: number; nextAt: number | null; placesOnFoot: number; keyRowsWaiting: string[]; keyOnly: string[]; keysThisWeek: number; held: number; why: string }[] = [];
  let n = 0;
  for (let d = 0; d < days; d++) {
    const d0 = now;
    run({ do: 'open' }); answer();
    let budget = hours * 60;
    /* today's repeating jobs first (each a session), then a long one-off of Dan's own for the rest of the hours */
    const v = see(facts, C, at());
    if (rhythmsToo) for (const job of v.slate.filter(j => C.rhythms.some(r => r.job === j))) {
      if (budget < 60) break;
      run({ do: 'startRun', job, minutes: 60, count: 1 }); wait(61); answer(); budget -= 60;
    }
    for (let k = oneOffs; k > 0; k--) {
      run({ do: 'addItems', lines: [`deep work ${++n}`] });
      const id = see(facts, C, at()).content.jobs.at(-1)!.id;
      let mine = k === 1 ? budget : Math.floor(budget / k / 60) * 60;
      budget -= mine;
      while (mine >= 60) { run({ do: 'startRun', job: id, minutes: 60, count: 1 }); wait(61); answer(); mine -= 60; }
      run({ do: 'done', job: id }); answer();
    }
    const st = S.storyState(facts, C.story), vv = see(facts, C, at());
    const rw = C.story.route.find(r => r.w === st.week);
    rows.push({ day: vv.day, storyWeek: st.week, walked: vv.walked, nextAt: vv.nextAt, placesOnFoot: st.onFoot,
      keyRowsWaiting: (rw?.places ?? []).filter(p => p.k && !st.played.has(p.id)).map(p => p.id),
      keyOnly: keyOnlyHolds(st), keysThisWeek: S.keysIn(facts, vv.day), held: st.held, why: whyHeld(st) });
    now = d0 + 864e5;
  }
  return { rows, facts };
}
