/**
 * The delve's panel on the lock screen and in the Dynamic Island (D-095): what it shows, worked out from the run.
 * The phone ticks its countdown and ring by itself, so the app needn't run; but without the app (and with no server,
 * D-057) nothing can change the panel's words. So each panel also carries what it shows once the current delve or
 * breather ends with the app closed: the rest of the run as one countdown to its end, or, after the last delve, that
 * the delve is over. Both stay true however long the phone stays locked; opening the app puts the panel right.
 */
import type { RunView } from '../core/game';
import { alertsAfter, BREATHER_MIN, type RunMark } from '../core/run';
import type { PanelState } from '../platform/types';
import { card, ord, t } from '../content/copy/en';

const MIN = 60_000;

/** "the second of three delves", "one delve", "This one is extra: the fourth delve." (the delve screen's line too) */
export function ofLine(run: { count: number; enoughK: number | null }, k: number, past: boolean): string {
  const N = run.count, kE = run.enoughK;
  if (past) return t('delve.more', { ord: ord(k) });
  if (kE) return Math.min(N, kE) === 1 ? (N === 1 ? t('delve.single') : t('delve.enoughAfter')) : t('delve.ofRun', { ord: ord(k), card: card(kE) });
  return N === 1 ? t('delve.single') : t('delve.ofRun', { ord: ord(k), card: card(N) });
}

/** "12:40": minutes and seconds left */
export const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export interface PanelInputs {
  /** Where the expedition is (the delve screen's headline). */
  place: string;
  /** The job was already done today (the delve is extra). */
  past: boolean;
  /** A game-clock instant as the phone's real one (a rehearsal runs 60 times faster). */
  real: (ms: number) => number;
  /** A game-clock instant as the time of day, "11:42". */
  clock: (ms: number) => string;
}

export function panelOf(run: RunView, marks: RunMark[], now: number, o: PanelInputs): PanelState {
  const L = run.minutes * MIN, B = BREATHER_MIN * MIN, sec = (ms: number) => Math.round(o.real(ms) / 1000) * 1000;
  const base = { run: run.seq, place: o.place, job: run.job.name, heldFraction: 0, heldTime: '',
    awayLabel: t('delve.paused'), awayLine: t('panel.away.line'), awayLeft: t('panel.paused'), awayLen: run.phase === 'held' ? 0 : L };
  const none = { afterLabel: '', afterLine: '', afterLeft: '', afterStart: 0, afterEnd: 0, staleAt: 0 };

  if (run.phase === 'held') {
    return { ...base, ...none, phase: 'held', label: t('delve.paused'), line: ofLine(run, run.k, o.past), left: t('panel.paused'),
      start: 0, end: 0, heldFraction: Math.min(1, run.doneMs / L), heldTime: mmss(run.leftMs) };
  }

  const plan = { startedAt: run.startedAt, minutes: run.minutes, count: run.count };
  const ahead = alertsAfter(plan, marks, now);
  const runEnd = ahead[ahead.length - 1].at;
  const delving = run.phase === 'delve';
  const end = now + (delving ? run.leftMs : run.breatherLeftMs), start = delving ? now - run.doneMs : end - B;
  /* delves still to come once this delve or breather is over */
  const rest = ahead.filter(a => a.what === 'delveEnd' && a.at > end).length;

  const current = delving
    ? { label: t('delve.further'), line: ofLine(run, run.k, o.past), left: t('delve.left', { len: run.minutes }) }
    : { label: t('delve.breather'), line: t('panel.breather.line', { ord: ord(run.k + 1) }), left: t('panel.breather.left') };

  const after = rest === 0
    ? { afterLabel: t('notify.delveEnd.title'), afterLine: t('notify.delveEnd.body'), afterLeft: '', afterStart: 0, afterEnd: 0 }
    : !delving && rest === 1
      /* a breather before the last delve: after it comes exactly that delve */
      ? { afterLabel: t('delve.further'), afterLine: ofLine(run, run.k + 1, o.past), afterLeft: t('delve.left', { len: run.minutes }),
          afterStart: sec(end), afterEnd: sec(runEnd) }
      : { afterLabel: t('panel.goesOn'), afterLine: t('panel.goesOn.line', { end: o.clock(runEnd) }), afterLeft: t('panel.goesOn.left'),
          afterStart: sec(end), afterEnd: sec(runEnd) };

  return { ...base, phase: delving ? 'delve' : 'breather', ...current, start: sec(start), end: sec(end), ...after, staleAt: sec(end) };
}
