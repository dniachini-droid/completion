/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §11 and ARRIVALS_REGION1/2 weeks 1–7 (the "I can't start" rows); those files are authoritative.
 */

import type { Teaser } from '../../core/story-types';

/** §11 order within each week. The app shows the first whose condition holds, newest-written first within the week. The b-wN.tz rows are ARR1/ARR2's (they are the same 12 as §11 lists). */
export const teasers: Teaser[] = [
  { id: "b-w1.tz1", w: 1, req: [], until: "b-1.A", line: "Under the cap, eleven metres of ladder go down, and the air that comes up is dry." },
  { id: "b-w1.tz2", w: 1, req: ["b-1.A"], line: "There are three marks on the base of the lamp, and the lamp is warm." },
  { id: "tz-w1-a", w: 1, req: ["pl-w1-pick-niche"], until: "seal-1-2", line: "In the salt is a niche the length of an arm, with cut strokes along its lip." },
  { id: "tz-w1-b", w: 1, req: ["b-1.C"], until: "seal-2-1", line: "On her cot lies a tin box with a row of cut strokes across its lid." },
  { id: "tz-w1-c", w: 1, req: ["pl-w1-below-the-lamp"], until: "seal-1-3", line: "Under the lamp’s ledge is a small niche, and the stone round its mouth is darker." },
  { id: "b-w2.tz1", w: 2, req: [], until: "b-2.B", line: "On the shelf in her camp lies a rod of stone, with one edge finer than a knife’s." },
  { id: "b-w2.tz2", w: 2, req: ["b-2.B"], line: "The rod is in your hand, and on the lintel is a blank the width of its edge." },
  { id: "tz-w2-a", w: 2, req: ["pl-w2-above-the-ring"], until: "seal-2-3", line: "Above the lone ring, something pale lies far back in a crack." },
  { id: "tz-w2-b", w: 2, req: ["pl-w2-box-by-the-cot"], until: "seal-2-5", line: "In her camp, a tin mug stands upside down on a box with a count." },
  { id: "tz-w2-c", w: 2, req: ["b-2.A"], until: "seal-2-2", line: "In the salt is a long, narrow niche, the length of a stick, with a count on it." },
  { id: "b-w3.tz1", w: 3, req: [], until: "b-3.A", line: "The rod is in your hand, and on the lintel is a blank the width of its edge." },
  { id: "b-w3.tz2", w: 3, req: ["b-3.A"], line: "At the head of the stair is a lid with a doorway carved on it." },
  { id: "tz-w3-a", w: 3, req: ["b-3.C"], until: "seal-4-1", line: "At the stair’s first turn there is a niche with a count beside the rail." },
  { id: "tz-w3-b", w: 3, req: ["pl-w3-far-end"], line: "At the far end stands the great door, and cold comes off its face." },
  { id: "tz-w3-c", w: 3, req: ["b-3.B"], until: "seal-3-5", line: "On a ledge in her camp is a box with a count, and on its side a label in her hand." },
  { id: "b-w4.tz1", w: 4, req: [], line: "Every record here was cut by the same hand, except two." },
  { id: "tz-w4-a", w: 4, req: ["pl-w4-hollow"], until: "seal-4-5", line: "Low in the salt is a hollow with four small flat marks in its floor." },
  { id: "tz-w4-b", w: 4, req: ["pl-w4-recess-above-the-cot"], until: "seal-4-3", line: "Above her cot is a recess with a count, and a drawing pin beside it." },
  { id: "tz-w4-c", w: 4, req: ["b-4.1"], until: "seal-5-1", line: "Under the second turn is a recess with a count of its own." },
  { id: "b-w5.tz1", w: 5, req: [], line: "One line here does not begin with the bar with a tick." },
  { id: "tz-w5-a", w: 5, req: ["pl-w5-ledge-lip"], until: "seal-5-5", line: "Under the lamp’s ledge is a count, where no one standing would see it." },
  { id: "tz-w5-b", w: 5, req: ["b-5.B"], until: "b-6.A", line: "Through the gap you can see a record in the tally’s hand, on square stone." },
  { id: "tz-w5-c", w: 5, req: ["b-5.0"], line: "On the second flight the little door’s count is full, and it does not open." },
  { id: "b-w6.tz1", w: 6, req: [], until: "b-6.A", line: "Past the second landing is a low doorway, with square stone beyond it." },
  { id: "b-w6.tz2", w: 6, req: ["b-6.2"], line: "On the salt, a loaf is carved beside a mark." },
  { id: "tz-w6-a", w: 6, req: ["pl-w6-wall-shelf"], until: "seal-6-3", line: "On the square wall is a shelf with a count, and a level line is scratched along it." },
  { id: "tz-w6-b", w: 6, req: ["pl-w6-folder"], until: "seal-6-5", line: "Under her cot lies a folder with HILL on its spine." },
  { id: "tz-w6-c", w: 6, req: ["b-6.A"], until: "b-6.B", line: "On the square wall is a second record, longer than the first, with a niche under it." },
  { id: "b-w7.tz1", w: 7, req: [], until: "b-7.3", line: "At the first turn of the stair, the rail has the shape of a hand in it." },
  { id: "b-w7.tz2", w: 7, req: ["b-7.A"], line: "Beside the great door’s blank are the two marks from the lintel on the stair." },
];
