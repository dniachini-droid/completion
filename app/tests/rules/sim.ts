/**
 * A simulated Dan living real calendar weeks, for the story's rule tests: opens the app, does his jobs, guesses whatever
 * mark is offered (the true candidate unless told otherwise), looks at every arrival. Ids only: no story text here.
 */
import { act, see, settle, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Mark } from '../../src/core/story-types';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { live } from '../../src/core/week';

export type Week = 'normal' | 'low' | 'high' | 'away';

/** `bed`: say goodnight each evening, on time (22:45, before the 23:00 bedtime) or late (00:30). */
/** `pick`: the guess Dan makes for a mark on offer; null: he leaves it unanswered (a guess is always optional). */
/** `from`: a save to carry on from (its own facts, D-154's old-route saves): the next day at 08:00 after its last fact. */
export function sim(start = '2026-09-28T08:00:00+01:00', pick: (m: Mark) => string | null = m => m.candidates![0], bed?: 'kept' | 'late', from?: Fact[]) {   /* a Monday */
  let facts: Fact[] = from ? from.slice() : [];
  let now = from?.length ? Date.parse(`${from[from.length - 1].day}T08:00:00+01:00`) + 864e5 : Date.parse(start);
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
  const wait = (min: number) => { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); };
  /** Guess every mark on offer, and look at every arrival. */
  const answer = () => {
    const v = see(facts, C, at()), st = S.storyState(facts, C.story);
    const offered = new Set<string>();
    for (const b of C.story.beats) if (st.played.has(b.id)) b.carries?.guess?.forEach(m => offered.add(m));
    for (const x of C.story.seals) if (st.opened.has(x.id)) x.carries?.guess?.forEach(m => offered.add(m));
    for (const m of offered) if (!st.guessed.has(m)) { const mk = S.markOf(C.story, m), g = mk?.candidates ? pick(mk) : null; if (g) run({ do: 'guess', mark: m, guess: g }); }
    let a = see(facts, C, at()).arrival;
    while (a) { run({ do: 'seen', what: 'arrival', ref: a.seq }); a = see(facts, C, at()).arrival; }
    return v;
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
      /* past the day's plan, a High day's player chooses more work himself ("Something else…", D-080) */
      const job = v.next?.job ?? v.order.find(j => !v.done.has(j)) ?? (kind === 'high' ? C.jobs.find(j => !v.done.has(j.id) && !j.item)?.id : undefined);
      if (!job) break;
      /* the save's own jobs too (a carried-on save may have added its own, D-154) */
      const j = C.jobs.find(x => x.id === job) ?? live(C, facts).jobs.find(x => x.id === job)!;
      if (j.delve) { run({ do: 'startRun', job, minutes: 25, count: Math.ceil((j.enoughAt ?? j.length) / 25) }); wait((j.enoughAt ?? j.length) * 1.3 + 10); if (!see(facts, C, at()).done.has(job)) run({ do: 'done', job }); }
      else { run({ do: 'begin', job }); wait(j.length); run({ do: 'done', job }); }
      const e = see(facts, C, at()).runEnd; if (e) run({ do: 'seen', what: 'step', ref: e.seq });
    }
    answer();
    /* goodnight shows that night's evening at camp, as the app does (D-154) */
    if (bed) { now = Math.max(now, d0 + (bed === 'kept' ? 13.75 : 15.5) * 3_600_000); run({ do: 'goodnight' }); answer(); }
    now = d0 + 864e5;
  };
  return {
    get facts() { return facts; },
    week(kind: Week | Week[]) { for (let i = 0; i < 7; i++) day(Array.isArray(kind) ? kind[i] : kind); return this; },
    st() { return S.storyState(facts, C.story); },
    view() { return see(facts, C, at()); },
    at,
  };
}
