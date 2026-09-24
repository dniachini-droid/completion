/**
 * A run of delves, worked out from timestamps (ARCHITECTURE.md → Time; INTERACTION_NOTES.md → the delve).
 *
 * A run is "started at 10:02, N delves of L minutes". Between delves is a 5-minute breather, after which
 * the next delve starts by itself (D-037). Dan's marks change the course: Start it now (skips the breather),
 * Step away (holds the delve; its minutes are kept), Back to the delve, Finish here. Where the run stands
 * at any moment is worked out from these, never counted, so a closed app or a dead battery loses nothing.
 */
export const BREATHER_MIN = 5;
const MIN = 60_000;

export interface RunPlan { startedAt: number; minutes: number; count: number; }
export type RunMark = { kind: 'skip' | 'hold' | 'resume' | 'finish'; at: number };

export interface RunNow {
  /** The delve Dan is on (1-based). */
  k: number;
  phase: 'delve' | 'breather' | 'held' | 'ended';
  /** Time done in this delve, and left of it. */
  doneMs: number;
  leftMs: number;
  /** In a breather: time left of it (the next delve starts by itself when it runs out). */
  breatherLeftMs: number;
  /** When the hold began (Step away), for the breather it starts. */
  heldAt?: number;
  /** Delves that ran to their end, with the instant each ended. */
  ends: { k: number; at: number }[];
  /** Delve time done in the whole run. */
  countedMs: number;
  /** The part of the current delve done, when the run was finished partway. */
  partialMs: number;
  endedAt?: number;
  how?: 'ranOut' | 'finishedHere';
}

export function runAt(plan: RunPlan, marks: RunMark[], now: number): RunNow {
  const L = plan.minutes * MIN, B = BREATHER_MIN * MIN, N = plan.count;
  const s: RunNow = { k: 1, phase: 'delve', doneMs: 0, leftMs: L, breatherLeftMs: 0, ends: [], countedMs: 0, partialMs: 0 };
  let t = plan.startedAt, e = 0; /* e: time into the current delve or breather */

  const advance = (to: number) => {
    while (t < to && (s.phase === 'delve' || s.phase === 'breather')) {
      if (s.phase === 'delve') {
        const rem = L - e;
        if (t + rem <= to) {
          t += rem; s.countedMs += rem; s.ends.push({ k: s.k, at: t });
          if (s.k >= N) { s.phase = 'ended'; s.endedAt = t; s.how = 'ranOut'; e = L; }
          else { s.phase = 'breather'; e = 0; }
        } else { s.countedMs += to - t; e += to - t; t = to; }
      } else {
        const rem = B - e;
        if (t + rem <= to) { t += rem; s.k++; s.phase = 'delve'; e = 0; }
        else { e += to - t; t = to; }
      }
    }
    if (t < to) t = to;
  };

  for (const m of marks) {
    if (m.at > now || s.phase === 'ended') break;
    advance(m.at);
    if (m.kind === 'skip' && s.phase === 'breather') { s.k++; s.phase = 'delve'; e = 0; }
    else if (m.kind === 'hold' && s.phase === 'delve') { s.phase = 'held'; s.heldAt = m.at; }
    else if (m.kind === 'resume' && s.phase === 'held') { s.phase = 'delve'; s.heldAt = undefined; }
    else if (m.kind === 'finish') {
      if (s.phase === 'delve' || s.phase === 'held') s.partialMs = e;
      s.phase = 'ended'; s.endedAt = m.at; s.how = 'finishedHere';
    }
  }
  advance(now);

  if (s.phase === 'delve' || s.phase === 'held') { s.doneMs = e; s.leftMs = L - e; }
  else if (s.phase === 'breather') { s.doneMs = L; s.leftMs = 0; s.breatherLeftMs = B - e; }
  else { s.doneMs = s.how === 'ranOut' ? L : s.partialMs; s.leftMs = 0; }
  return s;
}

/** Every moment the phone should sound, from now on, if nothing changes (a run sets one per delve and breather end). */
export function alertsAfter(plan: RunPlan, marks: RunMark[], now: number): { at: number; what: 'delveEnd' | 'breatherEnd' }[] {
  const s = runAt(plan, marks, now);
  if (s.phase !== 'delve' && s.phase !== 'breather') return [];
  const L = plan.minutes * MIN, B = BREATHER_MIN * MIN, out: { at: number; what: 'delveEnd' | 'breatherEnd' }[] = [];
  let t = now, k = s.k;
  if (s.phase === 'delve') { t += s.leftMs; out.push({ at: t, what: 'delveEnd' }); }
  else { t += s.breatherLeftMs; k++; out.push({ at: t, what: 'breatherEnd' }); t += L; out.push({ at: t, what: 'delveEnd' }); }
  while (k < plan.count) { t += B; out.push({ at: t, what: 'breatherEnd' }); t += L; k++; out.push({ at: t, what: 'delveEnd' }); }
  return out;
}
