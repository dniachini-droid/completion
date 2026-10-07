/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §7 (the tap lines are the beats' own, in ARRIVALS_REGION1/2).
 */

import type { Word } from '../../core/story-types';

export const words: Word[] = [
  /** FIRE-GIVE, cut on the side-wall lintel; the lamp-cups wake. */
  { id: 'wd-light', marks: ['mk-fire', 'mk-give'], beats: ['b-3.A'], req: ['b-2.B', 'b-2.2'] },
  /** PATH-OPEN, at the lintel at the foot of the second flight, and again below the Water. b-7.C (the great door) is retired
      for weeks 1-14 (D-160) and kept here for old saves that cut it. */
  { id: 'wd-open-way', marks: ['mk-path', 'mk-open'], beats: ['b-7.A', 'b-7.C', 'b-10.A'], req: ['mk-path', 'mk-open'] },
  /** STONE-MOVE, at the standing stone before the fall (week 13), and again on the blast room's fall (week 14). */
  { id: 'wd-move-stone', marks: ['mk-stone', 'mk-move'], beats: ['b-13.B', 'b-14.A'], req: ['mk-stone', 'mk-move'] },
];
