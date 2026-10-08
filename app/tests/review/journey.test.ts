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
import { returnOf } from '../../src/core/game';
import { the } from '../../src/content/copy/en';
import { sim } from '../rules/sim';
import * as S from '../../src/core/story';

/** What a player saw between two arrivals (their jobs' returns: the story's steps, tablets, passage lines, finds; the week's
    page): its words, in order, for the reviewer. Written outside the repository (story text, D-015). */
function between(facts: Fact[], from: number, to: number): string[] {
  const s = C.story, out: string[] = [], asked = new Set<string>();
  for (const f of facts.slice(from, to)) {
    if (f.type === 'beatPlayed' && f.job !== undefined) {
      if (f.id === 'passage') { const p = s.passages.find(x => x.id === f.passage); if (p) out.push(`(a job's return) ${p.line}`); continue; }
      const b = s.beats.find(x => x.id === f.id), x = b?.seal ? s.seals.find(y => y.id === b.seal) : s.seals.find(y => y.id === f.id);
      /* a moment at the top after Dan has gone down (an old save's): the screen says first that he climbs back up (D-160) */
      /* as its return screen says it: a climb up said first (D-160), a move to another room said (D-161), its own words */
      const done = facts.filter(g => g.type === 'jobDone' && g.seq < f.seq).pop();
      const r0 = done ? returnOf(C, facts, done.seq) : null, r = r0 && [b?.id, x?.id, b?.seal].includes(r0.beat ?? '') ? r0 : null;
      const lead = r?.up ? `${r.upWhy ?? `First, a climb back up to ${the(r.up)}; then back down to where you were.`} ` : r?.moved ? `You go to ${the(r.moved)} for this, and then back to ${the(r.from ?? '')}. ` : '';
      const line = r?.line || (b?.line ?? x?.line); if (line) out.push(`(a job's return) ${lead}${line}`);
      for (const m of [...new Set([...(b?.carries?.guess ?? []), ...(x?.carries?.guess ?? [])])].filter(m => !asked.has(m) && asked.add(m))) out.push(`(you are asked to guess a symbol: you guess "${s.marks.find(k => k.id === m)?.candidates?.[0] ?? '?'}")`);
    }
    if (f.type === 'sealOpened' && f.how !== 'road') { const x = s.seals.find(y => y.id === f.seal); const line = x?.beat ? s.beats.find(b => b.id === x.beat)?.line : x?.line; if (line) out.push(`(you used a Key) ${line}`); }
    /* (a find at a day's end is shown on its own screen, the move itself) */
    if (f.type === 'findGiven' && f.why !== 'camp') { const x = s.finds.find(y => y.id === f.id); if (x) out.push(`(a find) ${x.line}`); }
    if (f.type === 'beatPlayed' && f.job === undefined && s.beats.find(b => b.id === f.id)?.kind === 'close') out.push(`(the week's page) ${s.beats.find(b => b.id === f.id)!.line}`);
    if (f.type === 'beatPlayed' && f.job === undefined && /\.(camp|morning)$/.test(f.id)) { const b = s.beats.find(x => x.id === f.id); if (b?.line) out.push(`(${f.id.endsWith('camp') ? 'going to sleep, the night\'s thought' : 'the morning'}) ${b.line}`); }
    /* the day's minutes, so a reader knows how long the days are (D-160's paces) */
    if (f.type === 'goodnight') out.push(`(Go to sleep pressed, ${f.at.slice(11, 16)})`);
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
  const lives: { name: string; facts: Fact[]; cuts: number[]; from?: number; past?: string[] }[] = [];
  /* PACE (D-160): short days (about an hour), normal (about three), long (about eight) */
  const pace = (env.PACE ?? 'normal') as 'short' | 'normal' | 'long';
  const fresh = sim(undefined, undefined, 'kept');
  for (let i = 0; i < (pace === 'short' ? 40 : pace === 'long' ? 10 : 22); i++) fresh.week(pace);
  /* the fourteen weeks: every arrival until the last place on the route (the open route after it is not the journey) */
  const route = C.story.route.flatMap(r => r.places.map(p => p.id));
  const end = fresh.facts.findIndex((_, i) => route.every(id => fresh.facts.slice(0, i + 1).some(g => g.type === 'arrived' && g.id === id)));
  lives.push({ name: 'fresh', facts: fresh.facts, cuts: cuts(fresh.facts).filter(c => end < 0 || c <= end + 1) });
  /* Dan's possible points: the end of each of weeks 1–6, and the middle of weeks 2–4, under the old route */
  /* OLD=1: the old saves only (their own walk, judged apart) */
  if (env.OLD) lives.length = 0;
  else { writeFileSync(`${dir}/journey.json`, JSON.stringify({ version: SAVE_VERSION, content: C.version, lives: lives.map(l => ({ ...l, between: l.cuts.map((c, i) => between(l.facts, i ? l.cuts[i - 1] : 0, c)) })) })); return; }
  /* where an old save had been, by name: its own words were an older build's, so only the places are told */
  const pastOf = (before: Fact[]) => ({ from: before[before.length - 1].seq,
    past: [...new Set(before.flatMap(f => f.type === 'arrived' && f.kind === 'place' ? [S.beatOf(C.story, f.id)?.name ?? ''] : []))].filter(Boolean) });
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
    lives.push({ name: `old-${before[before.length - 1].seq}`, facts: d.facts, cuts: cuts(d.facts, before[before.length - 1].seq).slice(0, 10), ...pastOf(before) });
  }
  /* saves from the last two builds (D-154, D-159), carried on from where they stopped */
  /* (each cut at the start of a story week, so there is a journey left to carry on into) */
  for (const [set, name, wk] of [['route-d154', 'normal-kept', 6], ['route-d154', 'normal-nobed', 9], ['route-d159', 'normal-kept', 5],
    ['route-d159', 'normal-nobed', 8], ['route-d159', 'high-kept', 4], ['route-d159', 'low-nobed', 11]] as const) {
      const all = JSON.parse(readFileSync(new URL(`../saves/${set}/${name}.json`, import.meta.url), 'utf8')).facts as Fact[];
      const cut = all.findIndex(f => f.type === 'storyWeekBegan' && f.w === wk);
      const before = cut > 0 ? all.slice(0, cut) : all;
      const d = sim(undefined, undefined, 'kept', before);
      for (let i = 0; i < 4; i++) d.week('normal');
      lives.push({ name: `${set.slice(6)}-${name}-w${wk}`, facts: d.facts, cuts: cuts(d.facts, before[before.length - 1].seq).slice(0, 10), ...pastOf(before) });
    }
  /* the words seen between each arrival and the one before it */
  /* (an old save's own past was played under an older build's words: only what played after it is shown) */
  const out = lives.map(l => ({ ...l, between: l.cuts.map((c, i) => between(l.facts, i ? l.cuts[i - 1] : (l.from ?? 0), c)) }));
  writeFileSync(`${dir}/journey.json`, JSON.stringify({ version: SAVE_VERSION, content: C.version, lives: out }));
}, 3_600_000);
