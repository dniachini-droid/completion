/**
 * Which jobs are done (D-131). A job said done can be taken back on Today ("Not done after all"): its done record stays in
 * the log, with what it earned, but it no longer counts as done anywhere (the day's list, the week, a rhythm's sessions,
 * the Satchel). Every rule that asks "is it done?" reads the done records through here. Pure.
 */
import type { Fact, FactOf } from './types';

const memo = new WeakMap<Fact[], { n: number; live: FactOf<'jobDone'>[]; undone: FactOf<'jobDone'>[] }>();

function read(facts: Fact[]) {
  const m = memo.get(facts);
  if (m && m.n === facts.length) return m;
  const live: FactOf<'jobDone'>[] = [], undone: FactOf<'jobDone'>[] = [];
  for (const f of facts) {
    if (f.type === 'jobDone') live.push(f);
    /* "Not done after all" takes back the latest done record of that job on that day */
    else if (f.type === 'doneUndone') {
      for (let i = live.length - 1; i >= 0; i--) if (live[i].job === f.job && live[i].day === f.on) { undone.push(...live.splice(i, 1)); break; }
    }
  }
  const out = { n: facts.length, live, undone };
  memo.set(facts, out);
  return out;
}

/** The done records that still stand (none taken back), in log order. */
export const doneFacts = (facts: Fact[]): FactOf<'jobDone'>[] => read(facts).live;
/** The done records taken back by "Not done after all": what they earned stays, and is never paid again. */
export const undoneFacts = (facts: Fact[]): FactOf<'jobDone'>[] => read(facts).undone;
