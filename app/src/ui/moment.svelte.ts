/* A screen's passing moment that the frame around it needs to know (the day's light stays violet while a word is cut). */
/* `wordLater`: the arrival whose word Dan left to cut later ("Later", the arrow): Today stays reachable, with a quiet line
   back to it, until he goes back or the app starts again (the flow review, A2) */
/* `keyChoice`: what Dan chose for a Key a job's return offered (by the return's Done), so the return looked at again (back
   from the opened screen, which remounts it) says what he did rather than offering it again */
/* `cutDone`: the arrival whose word has been cut to its end, so the phone's back then leaves it as its arrow does */
export const moment = $state({ cutting: false, wordLater: 0, cutDone: 0, keyChoice: {} as Record<number, 'used' | 'kept'> });
