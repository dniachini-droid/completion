/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §10; those files are authoritative.
 */

import type { OpenQuestion, SoFar, WeekCloseLine } from '../../core/story-types';

/** §10: up to three a week; a line shows only if its beat played in that story week. */
export const learned: WeekCloseLine[] = [
  { id: "wc-w1-1", w: 1, req: ["b-1.A"], line: "The lamp on the ledge in the Lamp Hall was already lit when you came down, yet there is no oil in it." },
  { id: "wc-w1-2", w: 1, req: ["b-1.5"], line: "In the Salt Gallery, one carver cut a long line of symbols that appears to be some kind of tally, and someone left pencilled sheets beside it." },
  { id: "wc-w1-3", w: 1, req: ["b-1.C"], line: "Someone lived in the Survey Cut, the small side chamber off the Lamp Hall, and left behind boots, a notebook and a stone rod." },
  { id: "wc-w2-1", w: 2, req: ["b-2.A"], line: "Read for yourself, the stretch of tally past the lone ring seems to tell of someone standing where the way turns, as tall as two of whoever told it and a lamb besides, the lamb shown as a small carved picture in the line." },
  { id: "wc-w2-2", w: 2, req: ["b-2.3"], line: "In her notebook, the woman who camped here wrote that she met someone where the corridor turns, and took him for a pillar." },
  { id: "wc-w2-3", w: 2, req: ["b-2.B"], line: "The rod was left for the next one, with a note: cut the two marks on the lintel." },
  { id: "wc-w3-1", w: 3, req: ["b-3.A"], line: "At the lintel, you cut the two symbols with the rod, and the cups lit one after another all the way down the Lamp Hall." },
  { id: "wc-w3-2", w: 3, req: ["b-3.2"], line: "Her notebook says that on her sixth day she cut the same two symbols, and a door opened for her too." },
  { id: "wc-w3-3", w: 3, req: ["b-3.B"], line: "At the head of the Stair, in a niche, there is a second clay lamp, unlit." },
  { id: "wc-w4-1", w: 4, req: ["b-4.A"], line: "Her sheet for the stretch of tally past the lone ring reads: *go home… lamp… gave… went up.*" },
  { id: "wc-w4-2", w: 4, req: ["b-4.4"], line: "Nearly every record here ends with a hook closed on a dot in its corner. The wall by the lamp has a different hook." },
  { id: "wc-w4-3", w: 4, req: ["b-4.3"], line: "On her ninth day down here, the woman who camped in the Survey Cut made herself a rule: go up every night." },
  { id: "wc-w5-1", w: 5, req: ["b-5.A"], line: "Every record in the tally begins with the same three symbols: the bar with a tick, a ring and a single drop." },
  { id: "wc-w5-2", w: 5, req: ["b-5.3"], line: "Behind the salt crust, the lamp's symbol, the flame's and the hook-and-drop stand in a row, with no doorway-shape anywhere near them." },
  { id: "wc-w5-3", w: 5, req: ["b-5.2"], line: "In her notebook, the woman who camped here called the one she met the Tenant, and he let her." },
  { id: "wc-w6-1", w: 6, req: ["b-6.1"], line: "According to her notebook, the carving on the wall by the lamp was cut on her twentieth day down here, for the next one." },
  { id: "wc-w6-2", w: 6, req: ["b-6.A"], line: "In the square gallery, square-cut stone meets the rounded stone, and the record on the square wall opens almost the way the tally's records do." },
  { id: "wc-w6-3", w: 6, req: ["b-6.B"], line: "In the square gallery is the crew's wall, and under it what looks like a pay tablet: a wax tablet with a ring at the head of every row." },
];

/**
 * The month's "so far" (the first week close of each month of play: calendar weeks 1 and 5).
 * NOTE: SoFar has no per-line condition, but each line shows only if its beats have played (the first five that have).
 * The per-line ids and conditions are in `soFarLines` below; `lines` here is in the same order.
 */
export const soFar: SoFar[] = [
  { id: 'sf-m1', w: 1, lines: [
    "The lamp on the ledge in the Lamp Hall was lit before you came, and there is no oil in it.", // sf-m1-1
    "Someone camped in the Survey Cut, the side chamber off the Lamp Hall, and left a stone rod behind.", // sf-m1-2
    "The long line of symbols in the salt, which seems to be some kind of tally, was cut by one carver.", // sf-m1-3
    "At the far end of the Lamp Hall is a great door that takes up most of the wall.", // sf-m1-4
  ] },
  { id: 'sf-m2', w: 5, lines: [
    "Her notebook's first page, Day 1, says the lamp on the ledge was already lit when she came down, just as it was for you.", // sf-m2-1
    "The woman who camped here met someone tall where the corridor turns, and the tally, the long record in the salt, tells of someone tall standing where the way turns too.", // sf-m2-2
    "Nearly everything here was cut by one carver. The wall by the lamp was not.", // sf-m2-3
    "The little door on the Stair, which she found open, is shut to you.", // sf-m2-4
    "The great door has a row of notches, and two symbols beside a blank.", // sf-m2-5
    "At the head of the Stair, in a niche, there is a second clay lamp, unlit.", // sf-m2-6
  ] },
];

/** NOTE: the so-far lines with their own ids (sf-mN-k) and conditions; `w` is the week of the month's first close, as in `soFar`. */
export const soFarLines: WeekCloseLine[] = [
  { id: "sf-m1-1", w: 1, req: ["b-1.A"], line: "The lamp on the ledge in the Lamp Hall was lit before you came, and there is no oil in it." },
  { id: "sf-m1-2", w: 1, req: ["b-1.C"], line: "Someone camped in the Survey Cut, the side chamber off the Lamp Hall, and left a stone rod behind." },
  { id: "sf-m1-3", w: 1, req: ["b-1.5"], line: "The long line of symbols in the salt, which seems to be some kind of tally, was cut by one carver." },
  { id: "sf-m1-4", w: 1, req: ["b-1.A"], line: "At the far end of the Lamp Hall is a great door that takes up most of the wall." },
  { id: "sf-m2-1", w: 5, req: ["b-2.3"], line: "Her notebook's first page, Day 1, says the lamp on the ledge was already lit when she came down, just as it was for you." },
  { id: "sf-m2-2", w: 5, req: ["b-2.A", "b-2.3"], line: "The woman who camped here met someone tall where the corridor turns, and the tally, the long record in the salt, tells of someone tall standing where the way turns too." },
  { id: "sf-m2-3", w: 5, req: ["b-4.4"], line: "Nearly everything here was cut by one carver. The wall by the lamp was not." },
  { id: "sf-m2-4", w: 5, req: ["b-4.3", "b-5.0"], line: "The little door on the Stair, which she found open, is shut to you." },
  { id: "sf-m2-5", w: 5, req: ["b-4.C"], line: "The great door has a row of notches, and two symbols beside a blank." },
  { id: "sf-m2-6", w: 5, req: ["b-3.B"], line: "At the head of the Stair, in a niche, there is a second clay lamp, unlit." },
];

/** §10.3 "where you were": the week's line whose beat has played, else the week before's. NOTE: OpenQuestion has no condition field; see `openQuestionReq`. */
export const openQuestions: OpenQuestion[] = [
  { id: "aw-w1", w: 1, line: "The lamp on the ledge was already lit when you came down, and there is no oil in it. So what keeps it burning?" },
  { id: "aw-w2", w: 2, until: "b-3.A", line: "The rod is in your hand, and the lintel on the side wall of the Lamp Hall has a blank exactly the width of its edge. What will happen if you cut the two symbols there?" },
  { id: "aw-w3", w: 3, line: "The Stair goes down from the landing already lit, and you did not light it. So what did?" },
  { id: "aw-w4", w: 4, line: "Past the lone ring, her sheet says: *…go home… he held me… lamp… gave… went up…* Who is the \"he\" in it?" },
  { id: "aw-w5", w: 5, line: "Every record in the tally begins the same way. The line on the wall by the lamp does not. Why is it different?" },
  { id: "aw-w6", w: 6, line: "Through the side passage is square-cut stone, quite unlike the rounded halls, and on it is a record cut by whoever cut the tally. So how did that same carver come to cut a record here?" },
];

/** NOTE: the beat each open question needs (the source's "Shows if"). */
export const openQuestionReq: Record<string, string[]> = {
  "aw-w1": ["b-1.A"],
  "aw-w2": ["b-2.B"],
  "aw-w3": ["b-3.B"],
  "aw-w4": ["b-4.A"],
  "aw-w5": ["b-5.A"],
  "aw-w6": ["b-6.A"],
};
