/* A screen's passing moment that the frame around it needs to know (the day's light stays violet while a word is cut). */
/* `wordLater`: the arrival whose word Dan left to cut later ("Later", the arrow): Today stays reachable, with a quiet line
   back to it, until he goes back (the flow review, A2); kept per save, so a restart never forces the word on him again
   (deep review U5). Set it with `leaveWord`. */
/* `keyChoice`: what Dan chose for a Key a job's return offered (by the return's Done), so the return looked at again (back
   from the opened screen, which remounts it) says what he did rather than offering it again */
/* `cutDone`: the arrival whose word has been cut to its end, so the phone's back then leaves it as its arrow does */
/* `ends`: a delve's end as Dan left it (by its seq), so a look at a record or a niche and back finds it as it was: his
   answer, the errand story he was on, the count already played (review of D-144) */
import { platform } from '../platform';
import { game } from './game.svelte';

const laterKey = () => `${game.saveKey}.wordLater`;
function storedLater(): number { try { return Number(platform.store.get(laterKey()) ?? 0) || 0; } catch { return 0; } }

export const moment = $state({ cutting: false, wordLater: storedLater(), cutDone: 0, keyChoice: {} as Record<number, 'used' | 'kept'>,
  ends: {} as Record<number, { answer?: 'yes' | 'no' | null; storyAt?: number; played?: boolean }> });

/** The word at arrival `seq` left for later (0: none), remembered across restarts of the same save (U5). */
export function leaveWord(seq: number) {
  moment.wordLater = seq;
  try { if (seq) platform.store.set(laterKey(), String(seq)); else platform.store.remove(laterKey()); } catch { /* kept for this run only */ }
}
