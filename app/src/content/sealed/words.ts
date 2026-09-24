/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §7 (the tap lines are the beats' own, in ARRIVALS_REGION1/2).
 */

import type { Word } from '../../core/story-types';

export const words: Word[] = [
  /** FIRE-GIVE, cut on the side-wall lintel; the lamp-cups wake. */
  { id: 'wd-light', marks: ['mk-fire', 'mk-give'], beats: ['b-3.A'], req: ['b-2.B', 'b-2.2'] },
  /** PATH-OPEN, at the lintel at the foot of the second flight, and again at the great door. */
  { id: 'wd-open-way', marks: ['mk-path', 'mk-open'], beats: ['b-7.A', 'b-7.C'], req: ['mk-path', 'mk-open'] },
];
