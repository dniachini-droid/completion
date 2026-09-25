/**
 * SEALED STORY CONTENT (D-015). Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/ (ARRIVALS_REGION1.md weeks 1-5, ARRIVALS_REGION2.md weeks 6-7,
 * MVP_CONTENT.md §0-§3). Those files are authoritative; fix them first, then this.
 */
import type { RouteWeek, Stretch } from '../../core/story-types';

/** Where Dan is on the map (MVP_CONTENT §0.3). */
// NOTE: st-hall is dark until b-3.A and lit after (a state, not a req).
// NOTE: st-flight2 is seen from w4 (b-4.1) and walked from w5; `w` is the week walked. Its req (b-3.C, the top flight) and
//       st-square's (b-5.B, the gap) are physical access, a judgement call: §0.3 names only the Stair's (after b-3.A).
export const stretches: Stretch[] = [
  { id: "st-mouth", name: "The Mouth and the pipe", w: 1, req: [] },
  { id: "st-hall", name: "The Lamp Hall", w: 1, req: [] },
  { id: "st-salt", name: "The Salt Gallery", w: 1, req: [] },
  { id: "st-camp", name: "The Survey Cut", w: 1, req: [] },
  { id: "st-stair", name: "The top of the Stair", w: 3, req: ["b-3.A"] },
  { id: "st-flight2", name: "The second flight", w: 5, req: ["b-3.C"] },
  { id: "st-square", name: "The square gallery", w: 6, req: ["b-5.B"] },
];

/** The route: each story week's named places in arrival order (MVP_CONTENT §1). Week 7 is the run-ahead. */
export const route: RouteWeek[] = [
  { w: 1, places: [{ id: "b-1.A" }, { id: "b-1.B" }, { id: "pl-w1-pick-niche" }, { id: "b-1.C" }, { id: "pl-w1-below-the-lamp" }] },
  { w: 2, places: [{ id: "b-2.A" }, { id: "pl-w2-above-the-ring" }, { id: "b-2.B", kGated: true }, { id: "pl-w2-smooth-place" }, { id: "pl-w2-box-by-the-cot" }] },
  { w: 3, places: [{ id: "b-3.A" }, { id: "b-3.B", k: true }, { id: "pl-w3-salt-lit" }, { id: "b-3.C" }, { id: "pl-w3-far-end" }] },
  { w: 4, places: [{ id: "b-4.A" }, { id: "pl-w4-hollow" }, { id: "b-4.B", k: true }, { id: "pl-w4-recess-above-the-cot" }, { id: "b-4.C" }] },
  { w: 5, places: [{ id: "pl-w5-ledge-lip" }, { id: "pl-w5-worn-steps" }, { id: "b-5.A", kGated: true }, { id: "b-5.B" }, { id: "pl-w5-second-landing" }] },
  { w: 6, places: [{ id: "b-6.A" }, { id: "pl-w6-square-gallery" }, { id: "b-6.B", k: true }, { id: "pl-w6-wall-shelf" }, { id: "pl-w6-folder" }] },
  { w: 7, places: [{ id: "b-7.A", kGated: true }, { id: "b-7.B", k: true }, { id: "b-7.C", k: true }] },
];
