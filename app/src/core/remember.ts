/**
 * Remembered jobs (Dan, D-136). As Dan types in the Satchel's box, the jobs he has had before come up underneath; one
 * picked carries on from the one before (its list, note, first step, avoided mark and minutes); a name added again and
 * again is offered, once, as a recurring job. Pure: facts + content in. Nothing here earns anything (rule 10).
 */
import * as W from './week';
import type { Content, Fact, FactOf, Job } from './types';

/** At most this many suggestions under the box. */
export const SUGGEST_MOST = 4;
/** The same name added this many times within this many days brings the offer to make it repeat. */
export const OFFER_TIMES = 3, OFFER_DAYS = 28;

export interface Suggestion {
  /** The job the suggestion stands for: the job itself if it is still Dan's (recurring, or a one-off not finished),
      else the latest finished one of its name. */
  job: Job;
  /** The job itself, not one to add again: a recurring job, or a one-off still to do (it is never duplicated). */
  same: boolean;
  /** How long it usually takes, once learned from every job of its name (core/week.ts). */
  usual: number | null;
}

/** A job still Dan's: recurring, or a one-off not finished. A finished one-off, or a job whose rhythm was stopped, is
    one he had before. */
function current(c: Content, facts: Fact[], j: Job): boolean {
  if (j.stopped) return false;
  if (c.rhythms.some(r => r.job === j.id)) return true;
  return !finished(c, facts).has(j.id);
}
const finishedOf = new WeakMap<Content, Set<string>>();
function finished(c: Content, facts: Fact[]): Set<string> {
  let s = finishedOf.get(c);
  if (!s) { s = new Set(W.oneOffDone(c, facts).map(f => f.job)); finishedOf.set(c, s); }
  return s;
}

/** Where a typed line matches a name: 0 the whole name, 1 its start, 2 the start of a later word; null: no match. */
function match(q: string, name: string): 0 | 1 | 2 | null {
  const n = W.nameKey(name);
  if (!q || !n) return null;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  for (let i = n.indexOf(q, 1); i > 0; i = n.indexOf(q, i + 1)) if (!/[\p{L}\p{N}]/u.test(n[i - 1])) return 2;
  return null;
}

/** When a job was last touched: added, delved on, ticked off or done (the latest fact about it). */
function lastTouched(facts: Fact[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const f of facts) {
    const id = f.type === 'itemAdded' ? f.id : 'job' in f && typeof f.job === 'string' ? f.job : null;
    if (id) out.set(id, f.seq);
  }
  return out;
}

/**
 * The jobs Dan has had before that match what he is typing, best first, one per name (D-136): current and finished
 * jobs, one-offs and recurring; deleted ones are gone from the content and never come up. Case and extra spaces don't
 * matter; any word's start matches ("bank" finds "Go to the bank"). Best: the whole name, then the name's start, then a
 * later word's; then the one touched most lately.
 */
export function suggest(base: Content, facts: Fact[], text: string, most = SUGGEST_MOST): Suggestion[] {
  const q = W.nameKey(text);
  if (!q) return [];
  const c = W.live(base, facts), touched = lastTouched(facts);
  const groups = new Map<string, { how: 0 | 1 | 2; last: number; jobs: Job[] }>();
  for (const j of c.jobs) {
    const how = match(q, j.name);
    if (how === null) continue;
    const k = W.nameKey(j.name), g = groups.get(k) ?? { how, last: -1, jobs: [] };
    g.jobs.push(j); g.last = Math.max(g.last, touched.get(j.id) ?? -1);
    groups.set(k, g);
  }
  return [...groups.values()]
    .sort((a, b) => a.how - b.how || b.last - a.last)
    .slice(0, most)
    .map(g => {
      const job = pick(c, facts, g.jobs, touched)!;
      return { job, same: current(c, facts, job), usual: W.realMinutes(facts, job.id, undefined, c) };
    });
}

/** Of the jobs of one name, the one that stands for them: a recurring one, else a one-off still to do (the latest),
    else the latest touched. */
function pick(c: Content, facts: Fact[], jobs: Job[], touched: Map<string, number>): Job | undefined {
  const by = (xs: Job[]) => xs.slice().sort((a, b) => (touched.get(b.id) ?? -1) - (touched.get(a.id) ?? -1))[0];
  const live = jobs.filter(j => current(c, facts, j));
  return live.find(j => c.rhythms.some(r => r.job === j.id)) ?? by(live) ?? by(jobs);
}

/**
 * What a line typed in the Satchel's box is (D-136): tied to `from` when that job has the line's name (a suggestion
 * picked, the box not changed since); else to the job of exactly that name, if Dan has had one; else a new job (null).
 * `same`: the job itself (recurring, or a one-off still to do), never added a second time; else the new job carries on
 * from it.
 */
export function tieFor(base: Content, facts: Fact[], line: string, from?: string): { job: Job; same: boolean } | null {
  const q = W.nameKey(line);
  if (!q) return null;
  const c = W.live(base, facts);
  const picked = from ? c.jobs.find(j => j.id === from) : undefined;
  if (picked && W.nameKey(picked.name) === q) return { job: picked, same: current(c, facts, picked) };
  const exact = suggest(base, facts, line, Infinity).find(s => W.nameKey(s.job.name) === q);
  return exact ? { job: exact.job, same: exact.same } : null;
}

/**
 * The one gentle offer (D-136): a name added a third time within 28 days, with no recurring job of that name, and never
 * answered "No thanks", is offered as a recurring job. `day`: today's game day (from 04:00). `job`: the one the editor opens on (a one-off still to do if
 * there is one, else the latest of that name). The latest such name only; null when there is none.
 */
export function repeatOffer(base: Content, facts: Fact[], day: string): { name: string; job: string } | null {
  const c = W.live(base, facts), since = W.addDays(day, -(OFFER_DAYS - 1));
  const declined = new Set(facts.filter((f): f is FactOf<'repeatDeclined'> => f.type === 'repeatDeclined').map(f => f.name));
  const recurring = new Set(c.rhythms.map(r => c.jobs.find(j => j.id === r.job)).filter((j): j is Job => !!j && !j.stopped).map(j => W.nameKey(j.name)));
  const adds = new Map<string, { n: number; name: string }>();
  for (const f of facts) {
    if (f.type !== 'itemAdded' || f.day < since || f.day > day) continue;
    const k = W.nameKey(f.name), a = adds.get(k) ?? { n: 0, name: f.name };
    a.n += 1; a.name = f.name.trim();
    /* re-inserted, so the latest name added is last */
    adds.delete(k); adds.set(k, a);
  }
  const touched = lastTouched(facts);
  for (const [k, a] of [...adds].reverse()) {
    if (a.n < OFFER_TIMES || declined.has(k) || recurring.has(k)) continue;
    const jobs = c.jobs.filter(j => !j.stopped && W.nameKey(j.name) === k);
    const job = pick(c, facts, jobs, touched);
    if (job) return { name: a.name, job: job.id };
  }
  return null;
}
