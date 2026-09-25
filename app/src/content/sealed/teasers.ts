/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §11 and ARRIVALS_REGION1/2 weeks 1–7 (the "I can't start" rows); those files are authoritative.
 */

import type { Teaser } from '../../core/story-types';

/** §11 order within each week. The app shows the first whose condition holds, newest-written first within the week. The b-wN.tz rows are ARR1/ARR2's (they are the same 12 as §11 lists). */
export const teasers: Teaser[] = [
  { id: "b-w1.tz1", w: 1, req: [], until: "b-1.A", line: "Under the iron cap on the hillside is an old shaft. A ladder goes eleven metres down it, and the air that comes up is dry." },
  { id: "b-w1.tz2", w: 1, req: ["b-1.A"], line: "In the Lamp Hall, the small clay lamp on the ledge has three carved symbols on its base, and it is warm." },
  { id: "tz-w1-a", w: 1, req: ["pl-w1-pick-niche"], until: "seal-1-2", line: "In the Salt Gallery, low in the salt wall, is a closed niche as long as your arm, with a row of small, empty notches along its lip." },
  { id: "tz-w1-b", w: 1, req: ["b-1.C"], until: "seal-2-1", line: "In the Survey Cut, the side chamber where someone camped, a tin box lies on the cot with a row of small notches across its lid." },
  { id: "tz-w1-c", w: 1, req: ["pl-w1-below-the-lamp"], until: "seal-1-3", line: "In the Lamp Hall, under the ledge where the lamp stands, is a small closed niche, and the stone round its mouth is darker than the rest." },
  { id: "b-w2.tz1", w: 2, req: [], until: "b-2.B", line: "In the Survey Cut, on the shelf in her camp, lies a rod of stone as long as your forearm, with one edge finer than a knife's." },
  { id: "b-w2.tz2", w: 2, req: ["b-2.B"], until: "b-3.A", line: "The stone rod is in your hand, and on the lintel in the Lamp Hall is a blank, an empty gap beside two symbols, the width of its edge." },
  { id: "tz-w2-a", w: 2, req: ["pl-w2-above-the-ring"], until: "seal-2-3", line: "In the Salt Gallery, above the lone ring, something pale lies far back in a crack in the salt." },
  { id: "tz-w2-b", w: 2, req: ["pl-w2-box-by-the-cot"], until: "seal-2-5", line: "In the Survey Cut, a tin mug stands upside down on a shoebox-sized box by the cot, on a slate with a row of notches." },
  { id: "tz-w2-c", w: 2, req: ["b-2.A"], until: "seal-2-2", line: "In the Salt Gallery is a long, narrow niche in the salt, the length of a stick, with a row of notches on it." },
  { id: "b-w3.tz1", w: 3, req: [], until: "b-3.A", line: "The stone rod is in your hand, and on the lintel in the Lamp Hall is a blank, an empty gap beside two symbols, the width of its edge." },
  { id: "b-w3.tz2", w: 3, req: ["b-3.A"], line: "At the head of the Stair, beyond the lintel, is a closed niche, and lying on its lid is a small stone tablet with a doorway carved on it." },
  { id: "tz-w3-a", w: 3, req: ["b-3.C"], until: "seal-4-1", line: "At the Stair's first turn, beside the rail, is a closed niche with a row of notches." },
  { id: "tz-w3-b", w: 3, req: ["pl-w3-far-end"], line: "At the far end of the Lamp Hall stands the great door, and cold comes off its face." },
  { id: "tz-w3-c", w: 3, req: ["b-3.B"], until: "seal-3-5", line: "In the Survey Cut, where she camped, a box with a label in her handwriting on its side sits on a ledge, and a row of dark notches runs along the ledge's edge." },
  { id: "b-w4.tz1", w: 4, req: [], line: "Every carved record here was cut by the same carver, except two." },
  { id: "tz-w4-a", w: 4, req: ["pl-w4-hollow"], until: "seal-4-5", line: "Low in the salt wall of the Salt Gallery is a hollow the size of two cupped hands, with four small flat places pressed into its floor." },
  { id: "tz-w4-b", w: 4, req: ["pl-w4-recess-above-the-cot"], until: "seal-4-3", line: "In the Survey Cut, above her cot, is a recess closed by a slate with a row of notches, and a drawing pin is pushed into the crack beside it." },
  { id: "tz-w4-c", w: 4, req: ["b-4.1"], until: "seal-5-1", line: "On the Stair, under the second turn, is a recess, an alcove with a row of notches of its own." },
  { id: "b-w5.tz1", w: 5, req: [], line: "Of all the carved lines here, one does not begin with the bar with a tick, the short bar with a small tick cut on it." },
  { id: "tz-w5-a", w: 5, req: ["pl-w5-ledge-lip"], until: "seal-5-5", line: "In the Lamp Hall, under the front edge of the ledge where the lamp stands, is a row of notches, cut where no one standing would see it." },
  { id: "tz-w5-b", w: 5, req: ["b-5.B"], until: "b-6.A", line: "On the Stair, through a gap in the wall, you can see a record cut by whoever cut the tally, on square-cut stone." },
  { id: "tz-w5-c", w: 5, req: ["b-5.0"], line: "On the second flight of the Stair, every notch on the little door is full of light, yet the door does not open." },
  { id: "b-w6.tz1", w: 6, req: [], until: "b-6.A", line: "On the Stair's second landing, a low doorway leads off, and beyond it is square-cut stone." },
  { id: "b-w6.tz2", w: 6, req: ["b-6.2"], line: "In the Salt Gallery, on the tablet behind the opened salt crust, a loaf is carved beside a symbol." },
  { id: "tz-w6-a", w: 6, req: ["pl-w6-wall-shelf"], until: "seal-6-3", line: "In the square gallery, a shelf is cut into the wall, with a row of notches on its lip and a dead-level line scratched along it." },
  { id: "tz-w6-b", w: 6, req: ["pl-w6-folder"], until: "seal-6-5", line: "In the Survey Cut, under her cot, lies a document folder with HILL written on its spine." },
  { id: "tz-w6-c", w: 6, req: ["b-6.A"], until: "b-6.B", line: "On the square gallery's wall is a second record, longer than the first, with a closed niche under it." },
  { id: "b-w7.tz1", w: 7, req: [], until: "b-7.3", line: "At the Stair's first turn, the rail cut from the wall has the shape of a hand in its stone." },
  { id: "b-w7.tz2", w: 7, req: ["b-7.A"], line: "At the far end of the Lamp Hall, beside the great door's blank, are the same two symbols as beside the second lintel on the Stair." },
];
