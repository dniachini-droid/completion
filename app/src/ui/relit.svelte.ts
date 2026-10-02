/* Records that now read differently (MORNING-REPORT Part 3 #8): lit softly in Records until opened. Kept per save on the
   phone, never in the log: it is how the list looks, not something that happened. */
import { platform } from '../platform';
import { game } from './game.svelte';

const key = () => `${game.saveKey}.reread`;
function stored(): string[] { try { const x = JSON.parse(platform.store.get(key()) ?? '[]'); return Array.isArray(x) ? x : []; } catch { return []; } }
function keep() { try { platform.store.set(key(), JSON.stringify(reread.glow.slice(-200))); } catch { /* this run only */ } }

export const reread = $state({ glow: stored() });
/** These records now read differently: lit until opened. */
export function light(ids: string[]) { const add = ids.filter(id => !reread.glow.includes(id)); if (add.length) { reread.glow = [...reread.glow, ...add]; keep(); } }
/** Opened: no longer lit. */
export function opened(id: string) { if (reread.glow.includes(id)) { reread.glow = reread.glow.filter(x => x !== id); keep(); } }
/** A new log (Restore, a wipe, the rehearsal): read again from its own store. */
export function resetReread() { reread.glow = stored(); }
