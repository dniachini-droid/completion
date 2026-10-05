/**
 * The acceptance walk's saves (D-154): a fresh save lived through fourteen story weeks, and Dan's possible saves under the
 * old route carried on, each cut at every arrival so the built app can show it (tests/flows/journey.mjs). Run only for
 * the walk: JOURNEY=<dir> npx vitest run tests/review/journey.test.ts. Writes outside the repository (story text never
 * lands in it, D-015: the saves hold ids only, but the walk's pictures do not).
 */
import { it } from 'vitest';
import { env, readFileSync, writeFileSync } from './node';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { SAVE_VERSION } from '../../src/core/save';
import { sim } from '../rules/sim';

/** What a player saw between two arrivals (their jobs' returns: the story's steps, tablets, passage lines, finds; the week's
    page): its words, in order, for the reviewer. Written outside the repository (story text, D-015). */
function between(facts: Fact[], from: number, to: number): string[] {
  const s = C.story, out: string[] = [];
  for (const f of facts.slice(from, to)) {
    if (f.type === 'beatPlayed' && f.job !== undefined) {
      if (f.id === 'passage') { const p = s.passages.find(x => x.id === f.passage); if (p) out.push(`(a job's return) ${p.line}`); continue; }
      const b = s.beats.find(x => x.id === f.id), x = b?.seal ? s.seals.find(y => y.id === b.seal) : s.seals.find(y => y.id === f.id);
      const line = b?.line ?? x?.line; if (line) out.push(`(a job's return) ${line}`);
      for (const m of [...(b?.carries?.guess ?? []), ...(x?.carries?.guess ?? [])]) out.push(`(you are asked to guess a symbol: you guess "${s.marks.find(k => k.id === m)?.candidates?.[0] ?? '?'}")`);
    }
    if (f.type === 'sealOpened' && f.how !== 'road') { const x = s.seals.find(y => y.id === f.seal); const line = x?.beat ? s.beats.find(b => b.id === x.beat)?.line : x?.line; if (line) out.push(`(you used a Key) ${line}`); }
    /* (a find at a day's end is shown on its own screen, the move itself) */
    if (f.type === 'findGiven' && f.why !== 'camp') { const x = s.finds.find(y => y.id === f.id); if (x) out.push(`(a find) ${x.line}`); }
    if (f.type === 'beatPlayed' && f.job === undefined && s.beats.find(b => b.id === f.id)?.kind === 'close') out.push(`(the week's page) ${s.beats.find(b => b.id === f.id)!.line}`);
    if (f.type === 'beatPlayed' && f.job === undefined && /\.(camp|morning)$/.test(f.id)) { const b = s.beats.find(x => x.id === f.id); if (b?.line) out.push(`(${f.id.endsWith('camp') ? 'bedtime, by the lamp' : 'the morning'}) ${b.line}`); }
  }
  return out;
}
/** Every arrival's moment: the facts up to it (its command's batch), not yet looked at. */
function cuts(facts: Fact[], from = 0) {
  const out: number[] = [];
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    if (f.type !== 'arrived' || f.seq <= from) continue;
    /* up to the first look at it: the arrival still to be shown, any before it already seen */
    const seen = facts.findIndex(g => g.type === 'seen' && g.what === 'arrival' && g.ref === f.seq);
    out.push(seen < 0 ? facts.length : seen);
  }
  return out;
}
it.skipIf(!env.JOURNEY)('the journey: a fresh save, and old-route saves carried on', () => {
  const dir = env.JOURNEY!;
  const lives: { name: string; facts: Fact[]; cuts: number[] }[] = [];
  const fresh = sim(undefined, undefined, 'kept');
  for (let i = 0; i < 22; i++) fresh.week('normal');
  /* the fourteen weeks: every arrival until the last place on the route (the open route after it is not the journey) */
  const route = C.story.route.flatMap(r => r.places.map(p => p.id));
  const end = fresh.facts.findIndex((_, i) => route.every(id => fresh.facts.slice(0, i + 1).some(g => g.type === 'arrived' && g.id === id)));
  lives.push({ name: 'fresh', facts: fresh.facts, cuts: cuts(fresh.facts).filter(c => end < 0 || c <= end + 1) });
  /* Dan's possible points: the end of each of weeks 1–6, and the middle of weeks 2–4, under the old route */
  const old = JSON.parse(readFileSync(new URL('../saves/route-old/normal-kept.json', import.meta.url), 'utf8')).facts as Fact[];
  const ends: number[] = [];
  let w = 1, n = 0;
  for (let i = 0; i < old.length; i++) {
    const f = old[i];
    if (f.type === 'storyWeekBegan') { if (f.w >= 2 && f.w <= 7) ends.push(i - 1); w = f.w; n = 0; }
    if (f.type === 'arrived' && f.kind === 'place' && ++n === 3 && w >= 2 && w <= 4) { let j = i; while (j + 1 < old.length && old[j + 1].at === f.at) j++; ends.push(j); }
  }
  for (const end of [...new Set(ends)].sort((a, b) => a - b)) {
    const before = old.slice(0, end + 1);
    const d = sim(undefined, undefined, 'kept', before);
    for (let i = 0; i < 4; i++) d.week('normal');
    /* the moves after the stop: the next ten arrivals */
    lives.push({ name: `old-${before[before.length - 1].seq}`, facts: d.facts, cuts: cuts(d.facts, before[before.length - 1].seq).slice(0, 10) });
  }
  /* the words seen between each arrival and the one before it */
  const out = lives.map(l => ({ ...l, between: l.cuts.map((c, i) => between(l.facts, i ? l.cuts[i - 1] : 0, c)) }));
  writeFileSync(`${dir}/journey.json`, JSON.stringify({ version: SAVE_VERSION, content: C.version, lives: out }));
}, 900_000);
