/**
 * SEALED STORY CONTENT (D-015). Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/ (ARRIVALS_REGION1.md weeks 1-5, ARRIVALS_REGION2.md weeks 6-7,
 * MVP_CONTENT.md §0-§3; STORY_JOB.md §8 for weeks 8-14). Those files are authoritative; fix them first, then this.
 */
import type { RouteWeek, Stretch } from '../../core/story-types';

/** The areas (D-154, D-160; MVP_CONTENT §0.3): `home` the top (finished before he leaves it; after that only a told trip
    goes there); `area` the area a stretch is shown as; `parent` the area it opens off on the Map; `wayIn` how Dan gets there
    from the area next to it (shown when he comes back to it from elsewhere), never from camp. */
// NOTE: st-hall is dark until b-3.A and lit after (a state, not a req).
// NOTE: st-flight2 is walked from w4 (the second landing, after b-4.1); `w` is the week walked. Its req (b-3.C, the top flight)
//       and st-square's (b-5.B, the gap) are physical access, a judgement call: §0.3 names only the Stair's (after b-3.A).
// NOTE: st-lower is first reached from the lower gallery (after b-13.B), not from the blast room (D-154, ROUTE_REDESIGN §4.7).
export const stretches: Stretch[] = [
  { id: "st-mouth", name: "The Mouth", w: 1, req: [],
    wayIn: "Back to the foot of the ladder, at the bottom of the shaft." },
  { id: "st-hall", name: "The Lamp Hall", w: 1, req: [], home: true,
    wayIn: "Back in the Lamp Hall, where the lamp burns on its ledge." },
  { id: "st-salt", name: "The Salt Gallery", w: 1, req: [], home: true, parent: "st-hall",
    wayIn: "Back into the Salt Gallery, where the air smells of salt." },
  { id: "st-camp", name: "The Box Room", w: 1, req: [], home: true, parent: "st-hall",
    wayIn: "Back through the round-topped doorway into the Box Room." },
  { id: "st-stair", name: "The Stair", w: 4, req: ["b-3.A"],
    wayIn: "Back onto the Stair." },
  { id: "st-flight2", name: "The second flight", w: 4, req: ["b-3.C"], area: "st-stair",
    wayIn: "Back onto the Stair's second flight." },
  { id: "st-square", name: "The square gallery", w: 6, req: ["b-5.B"],
    wayIn: "Back into the square gallery, off the Stair's second landing." },
  { id: "st-water", name: "The Water", w: 8, req: ["b-7.A"],
    wayIn: "Back to the Water, black and still in its lit hall." },
  { id: "st-reading", name: "The Reading Room", w: 9, req: ["b-8.A"],
    wayIn: "Back through the wide doorway into the Reading Room." },
  { id: "st-blast", name: "Below the Water", w: 8, req: ["b-8.A"],
    wayIn: "Back down the narrow way below the Water, where the powder smell comes up." },
  { id: "st-side", name: "The side gallery", w: 12, req: ["b-10.C"],
    wayIn: "Back into the side gallery, off the blast room." },
  { id: "st-lower", name: "The lower way", w: 14, req: ["b-13.B"],
    wayIn: "Back onto the lower way." },
];

/** The route (D-154, D-160): the whole journey as one descent. Week 3 finishes the top (the lit hall, the salt, her room);
    week 4 opens with the step through the lintel (`b-3.B`, departure), and nothing on the route goes back up to camp: Dan
    camps wherever he is when he goes to sleep (CAMP_REHOME.md). Retired places (merged, cut, or made steps) stay in
    beats.ts for old saves, off the route. */
export const route: RouteWeek[] = [
  { w: 1, places: [{ id: "b-1.A" }, { id: "pl-w1-below-the-lamp" }, { id: "b-1.B" }, { id: "pl-w1-pick-niche" }, { id: "b-1.C" }] },
  { w: 2, places: [{ id: "b-2.A" }, { id: "pl-w2-above-the-ring" }, { id: "pl-w2-box-by-the-cot" }, { id: "b-2.B" }] },
  { w: 3, places: [{ id: "b-3.A" }, { id: "b-4.C" }, { id: "b-3.2" }, { id: "b-3.5", k: true }, { id: "b-3.6" }] },
  { w: 4, places: [{ id: "b-3.B", k: true }, { id: "b-3.C" }, { id: "b-4.2", k: true }, { id: "pl-w5-second-landing" }] },
  { w: 5, places: [{ id: "b-5.1", k: true }, { id: "b-5.B" }] },
  { w: 6, places: [{ id: "b-6.A" }, { id: "pl-w6-square-gallery" }, { id: "b-6.B", k: true }] },
  { w: 7, places: [{ id: "b-7.B", k: true }, { id: "b-7.A" }] },
  { w: 8, places: [{ id: "b-8.A" }, { id: "pl-w8-channel" }, { id: "pl-w8-steep-foot" }] },
  { w: 9, places: [{ id: "b-9.A" }, { id: "pl-w9-benches" }, { id: "b-9.C", k: true }, { id: "b-8.C", k: true }, { id: "pl-w9-approach" }] },
  { w: 10, places: [{ id: "b-10.A", k: true }, { id: "pl-w10-blast-floor" }, { id: "b-10.C", k: true }] },
  { w: 11, places: [{ id: "pl-w11-cupboard" }, { id: "b-11.A", k: true }, { id: "b-11.C", k: true }, { id: "pl-w11-far-end" }, { id: "b-11.B" }, { id: "b-13.C", k: true }] },
  { w: 12, places: [{ id: "b-12.A" }, { id: "b-12.C", k: true }] },
  { w: 13, places: [{ id: "b-13.1", k: true }, { id: "b-13.A", k: true }, { id: "b-13.B" }, { id: "pl-w13-lower-gallery" }] },
  { w: 14, places: [{ id: "pl-w14-meeting" }, { id: "b-14.A" }, { id: "b-14.B" }] },
];
