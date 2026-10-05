/**
 * SEALED STORY CONTENT (D-015). Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/ (ARRIVALS_REGION1.md weeks 1-5, ARRIVALS_REGION2.md weeks 6-7,
 * MVP_CONTENT.md §0-§3; STORY_JOB.md §8 for weeks 8-14). Those files are authoritative; fix them first, then this.
 */
import type { RouteWeek, Stretch } from '../../core/story-types';

/** The areas (D-154; MVP_CONTENT §0.3): `home` the top, where Dan sleeps; `area` the area a stretch is shown as; `parent` the
    area it opens off on the Map; `wayIn` how Dan gets there from camp (shown when he comes back to it from elsewhere). */
// NOTE: st-hall is dark until b-3.A and lit after (a state, not a req).
// NOTE: st-flight2 is walked from w4 (the second landing, after b-4.1); `w` is the week walked. Its req (b-3.C, the top flight)
//       and st-square's (b-5.B, the gap) are physical access, a judgement call: §0.3 names only the Stair's (after b-3.A).
// NOTE: st-lower is first reached from the lower gallery (after b-13.B), not from the blast room (D-154, ROUTE_REDESIGN §4.7).
export const stretches: Stretch[] = [
  { id: "st-mouth", name: "The Mouth", w: 1, req: [],
    wayIn: "Down the ladder in the shaft, and along the passage shaped like the inside of a pipe." },
  { id: "st-hall", name: "The Lamp Hall", w: 1, req: [], home: true,
    wayIn: "Out into the Lamp Hall, where you sleep by the lamp on its ledge." },
  { id: "st-salt", name: "The Salt Gallery", w: 1, req: [], home: true, parent: "st-hall",
    wayIn: "Round the corner at the far end of the Lamp Hall, where the air smells of salt." },
  { id: "st-camp", name: "The Box Room", w: 1, req: [], home: true, parent: "st-hall",
    wayIn: "Through the round-topped doorway in the side wall of the Lamp Hall." },
  { id: "st-stair", name: "The Stair", w: 3, req: ["b-3.A"],
    wayIn: "Through the opening under the lintel in the Lamp Hall's side wall, and down the Stair." },
  { id: "st-flight2", name: "The second flight", w: 4, req: ["b-3.C"], area: "st-stair",
    wayIn: "Down the Stair's top flight, past its first turn, to the second flight." },
  { id: "st-square", name: "The square gallery", w: 6, req: ["b-5.B"],
    wayIn: "Down the Stair to the second landing, and through the low, square doorway there." },
  { id: "st-water", name: "The Water", w: 8, req: ["b-7.A"],
    wayIn: "Down the Stair past the second lintel, flight after flight, to where the last step ends at water." },
  { id: "st-reading", name: "The Reading Room", w: 9, req: ["b-8.A"],
    wayIn: "Down to the Water, and round its shore to the wide doorway on the far side." },
  { id: "st-blast", name: "Below the Water", w: 8, req: ["b-8.A"],
    wayIn: "Down to the Water, round to its far shore, and down the narrow way that smells of powder." },
  { id: "st-side", name: "The side gallery", w: 12, req: ["b-10.C"],
    wayIn: "Down to the blast room, and past the end of its iron rails into square-cut stone." },
  { id: "st-lower", name: "The lower way", w: 14, req: ["b-13.B"],
    wayIn: "Down to the blast room, and through the gap where its rubble stood." },
];

/** The route (D-154): the whole journey as one descent from a home at the top (ROUTE_REDESIGN.md §4.4). A place at home
    once the way down is open (from `b-3.B`) plays as an evening at camp, off the walking meter. */
export const route: RouteWeek[] = [
  { w: 1, places: [{ id: "b-1.A" }, { id: "pl-w1-below-the-lamp" }, { id: "b-1.B" }, { id: "pl-w2-smooth-place" }, { id: "pl-w1-pick-niche" }, { id: "b-1.C" }] },
  { w: 2, places: [{ id: "b-2.A" }, { id: "pl-w2-above-the-ring" }, { id: "pl-w2-box-by-the-cot" }, { id: "b-2.B" }] },
  { w: 3, places: [{ id: "b-3.A" }, { id: "b-3.B", k: true }, { id: "b-3.C" }, { id: "pl-w5-worn-steps" }, { id: "pl-w3-salt-lit" }, { id: "pl-w3-far-end" }] },
  { w: 4, places: [{ id: "pl-w5-second-landing" }, { id: "b-4.A" }, { id: "b-4.B", k: true }] },
  { w: 5, places: [{ id: "b-5.B" }, { id: "b-5.A" }] },
  { w: 6, places: [{ id: "b-6.A" }, { id: "pl-w6-square-gallery" }, { id: "b-4.C" }, { id: "b-6.B", k: true }, { id: "pl-w6-wall-shelf" }, { id: "pl-w6-folder" }] },
  { w: 7, places: [{ id: "b-7.B", k: true }, { id: "b-7.A" }, { id: "b-7.C", k: true }] },
  { w: 8, places: [{ id: "b-8.A" }, { id: "pl-w8-channel" }, { id: "pl-w8-steep-foot" }, { id: "b-8.C", k: true }, { id: "b-8.B" }] },
  { w: 9, places: [{ id: "b-9.A" }, { id: "pl-w9-benches" }, { id: "b-9.B" }, { id: "b-9.C", k: true }, { id: "pl-w9-approach" }] },
  { w: 10, places: [{ id: "b-10.A", k: true }, { id: "pl-w10-blast-floor" }, { id: "b-10.C", k: true }, { id: "pl-w10-deep-end" }, { id: "b-10.B", k: true }, { id: "pl-w4-hollow" }] },
  { w: 11, places: [{ id: "pl-w11-cupboard" }, { id: "b-11.A", k: true }, { id: "b-11.C", k: true }, { id: "pl-w11-far-end" }, { id: "b-11.B" }, { id: "b-13.C", k: true }] },
  { w: 12, places: [{ id: "b-12.A" }, { id: "pl-w12-shelf" }, { id: "b-12.B", k: true }, { id: "pl-w12-square-way" }, { id: "b-12.C", k: true }, { id: "pl-w4-recess-above-the-cot" }] },
  { w: 13, places: [{ id: "pl-w13-side-gallery" }, { id: "b-13.A", k: true }, { id: "b-13.B" }, { id: "pl-w14-mule-stone" }, { id: "pl-w13-lower-gallery" }, { id: "pl-w5-ledge-lip" }] },
  { w: 14, places: [{ id: "pl-w14-meeting" }, { id: "b-14.A" }, { id: "b-14.B" }, { id: "pl-w14-deep-niche" }] },
];
