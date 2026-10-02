/* Records that now read differently (MORNING-REPORT Part 3 #8): lit softly in Records until opened. Kept per save on the
   phone, never in the log: it is how the list looks, not something that happened. Each beat lights its records once: a
   screen shown again (back from reading) never lights them again (fresh review). */
import { platform } from '../platform';
import { game } from './game.svelte';

const key = () => `${game.saveKey}.reread`;
interface Kept { glow: string[]; beats: string[] }
function stored(): Kept {
  try {
    const x = JSON.parse(platform.store.get(key()) ?? '{}');
    /* (an early build kept the lit records alone, as a list) */
    if (Array.isArray(x)) return { glow: x, beats: [] };
    return { glow: Array.isArray(x?.glow) ? x.glow : [], beats: Array.isArray(x?.beats) ? x.beats : [] };
  } catch { return { glow: [], beats: [] }; }
}
function keep() { try { platform.store.set(key(), JSON.stringify({ glow: reread.glow.slice(-200), beats: reread.beats.slice(-400) })); } catch { /* this run only */ } }

export const reread = $state(stored());
/** These records now read differently, by this beat: lit until opened, once per beat. */
export function light(beat: string, ids: string[]) {
  if (reread.beats.includes(beat)) return;
  reread.beats = [...reread.beats, beat];
  reread.glow = [...reread.glow, ...ids.filter(id => !reread.glow.includes(id))];
  keep();
}
/** Opened: no longer lit. */
export function opened(id: string) { if (reread.glow.includes(id)) { reread.glow = reread.glow.filter(x => x !== id); keep(); } }
/** A new log (Restore, a wipe, the rehearsal): read again from its own store. */
export function resetReread() { const k = stored(); reread.glow = k.glow; reread.beats = k.beats; }
