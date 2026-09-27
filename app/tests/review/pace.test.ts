/**
 * The hostile review (docs/reviews/BREAK-IT.md): does any calendar-week timing still hold the story back (D-123: one
 * continuous story, unlocked by work, no weeks)? A heavy worker delves for hours every day; each day's end records the
 * story week, minutes walked, the next place's mark, and whether a place is waiting on a Key. Ids and numbers only.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';

const kindOf = (id: string) => id.startsWith('seal-') ? 'seal' : id.startsWith('mk-') ? 'mark' : id.startsWith('fd-') ? 'find' : (S.beatOf(C.story, id)?.kind ?? 'other');
/** What the story waits on: this week's and next week's unplayed places with their unmet reqs, and unplayed steps. */
function whyHeld(st: S.StoryState): string {
  const out: string[] = [];
  for (const rw of C.story.route.filter(r => r.w === st.week || r.w === st.week + 1)) for (const p of rw.places) {
    if (st.played.has(p.id)) continue;
    const b = S.beatOf(C.story, p.id); const lack = (b?.req ?? []).filter(r => !S.met(st, r));
    out.push(`${p.id}${p.k ? '[key]' : ''}${lack.length ? '<' + lack.map(r => `${r}:${kindOf(r)}`).join('+') : ''}`);
  }
  const steps = C.story.beats.filter(b => b.w === st.week && b.kind === 'step' && !st.played.has(b.id));
  if (steps.length) out.push('steps:' + steps.map(b => b.id + (b.req.filter(r => !S.met(st, r)).length ? '<' + b.req.filter(r => !S.met(st, r)).join('+') : '') + (st.visited.has(b.stretch) ? '' : '(unvisited)')).join(','));
  return out.join(' ');
}
function heavy(days: number, hours: number, rhythmsToo = true) {
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
  const rows: { day: string; storyWeek: number; walked: number; nextAt: number | null; placesOnFoot: number; keyRowsWaiting: string[]; keysThisWeek: number; held: number; why: string }[] = [];
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
    run({ do: 'addItems', lines: [`deep work ${++n}`] });
    const id = see(facts, C, at()).content.jobs.at(-1)!.id;
    while (budget >= 60) { run({ do: 'startRun', job: id, minutes: 60, count: 1 }); wait(61); answer(); budget -= 60; }
    run({ do: 'done', job: id }); answer();
    const st = S.storyState(facts, C.story), vv = see(facts, C, at());
    const rw = C.story.route.find(r => r.w === st.week);
    rows.push({ day: vv.day, storyWeek: st.week, walked: vv.walked, nextAt: vv.nextAt, placesOnFoot: st.onFoot,
      keyRowsWaiting: (rw?.places ?? []).filter(p => p.k && !st.played.has(p.id)).map(p => p.id),
      keysThisWeek: S.keysIn(facts, vv.day), held: st.held, why: whyHeld(st) });
    now = d0 + 864e5;
  }
  return { rows, facts };
}

describe('pace: a heavy worker and the calendar', () => {
  it('records how far eight hours a day for three weeks gets, and what waits (report only)', () => {
    const { rows } = heavy(21, 8);
    const lines = rows.map(r => `${r.day} storyWeek ${r.storyWeek} walked ${r.walked} next ${r.nextAt ?? 'none'} onFoot ${r.placesOnFoot} keysThisWeek ${r.keysThisWeek} held ${r.held} waitingOnKey ${r.keyRowsWaiting.join(',') || '-'} | ${r.why}`);
    console.log(lines.join('\n'));
    /* the observation the review reports: minutes pile up far past the next place while a Key row waits */
    const stuck = rows.filter(r => r.nextAt === null && r.keyRowsWaiting.length);
    expect(rows.length).toBe(21);
    expect(stuck.length).toBeGreaterThanOrEqual(0);
  }, 600_000);
  it('the same for three hours a day, and for eight hours: days ending with no next place in reach (report)', () => {
    for (const h of [3, 8]) {
      const { rows } = heavy(21, h);
      const none = rows.filter(r => r.nextAt === null).length;
      console.log(`${h} h a day for 21 days: ${rows.at(-1)!.walked} minutes walked, ${rows.at(-1)!.placesOnFoot} places on foot `
        + `(${Math.floor((rows.at(-1)!.walked - 75) / 150) + 1} by minutes alone), story week ${rows.at(-1)!.storyWeek}, ${none} of 21 days ended with no next place in reach`);
    }
  }, 600_000);
});
