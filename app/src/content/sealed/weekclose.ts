/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §10; those files are authoritative.
 */

import type { OpenQuestion, SoFar, WeekCloseLine } from '../../core/story-types';

/** §10: up to three a week; a line shows only if its beat played in that story week. */
export const learned: WeekCloseLine[] = [
  { id: "wc-w1-1", w: 1, req: ["b-1.A"], line: "The lamp on the ledge in the Lamp Hall was already lit when you came down, yet there is no oil in it." },
  { id: "wc-w1-2", w: 1, req: ["b-1.5"], line: "In the Salt Gallery, one carver cut a long line of symbols that appears to be some kind of tally, and someone left pencilled sheets beside it." },
  { id: "wc-w1-3", w: 1, req: ["b-1.C"], line: "Someone lived in the Box Room, the small side chamber off the Lamp Hall, and left behind boots, a notebook and a stone rod." },
  { id: "wc-w2-1", w: 2, req: ["b-2.A"], line: "Read for yourself, the stretch of tally past the lone ring seems to tell of someone standing where the way turns, as tall as two of whoever told it and a lamb besides, the lamb shown as a small carved picture in the line." },
  { id: "wc-w2-2", w: 2, req: ["b-2.3"], line: "In her notebook, the woman who lived here wrote that she met someone where the corridor turns, and took him for a pillar." },
  { id: "wc-w2-3", w: 2, req: ["b-2.B"], line: "The rod was left for the next one, with a note: cut the two marks on the lintel." },
  { id: "wc-w3-1", w: 3, req: ["b-3.A"], line: "At the lintel, you cut the two symbols with the rod, and the cups lit one after another all the way down the Lamp Hall." },
  { id: "wc-w3-2", w: 3, req: ["b-3.2"], line: "Her notebook says that on her sixth day she cut the same two symbols, and a door opened for her too." },
  { id: "wc-w3-4", w: 3, req: ["b-3.6"], line: "You copied the whole tally, the base of the lamp and the wall by the lamp, and you carry the copy with you, with her dated sheets." },
  { id: "wc-w3-3", w: 4, req: ["b-3.B"], line: "At the head of the Stair, in a niche, there is a second clay lamp, unlit." },   /* week 4 since D-160: the step through the lintel opens week 4 */
  { id: "wc-w4-1", w: 4, req: ["b-4.A"], line: "Her sheet for the stretch of tally past the lone ring reads: *go home… lamp… gave… went up.*" },
  { id: "wc-w4-2", w: 4, req: ["b-4.4"], line: "Nearly every record here ends with a hook closed on a dot in its corner. The wall by the lamp has a different hook." },
  { id: "wc-w4-3", w: 4, req: ["b-4.3"], line: "On her ninth day down here, the woman who lived in the Box Room made herself a rule: go up every night." },
  { id: "wc-w5-1", w: 5, req: ["b-5.A"], line: "Every record in the tally begins with the same three symbols: the bar with a tick, a ring and a single drop." },
  { id: "wc-w5-2", w: 5, req: ["b-5.3"], line: "On the stretch of tally that lay under the salt crust, the lamp's symbol, the flame's and the hook-and-drop stand in a row, with no doorway-shape anywhere near them." },
  { id: "wc-w5-3", w: 5, req: ["b-5.2"], line: "In her notebook, the woman who lived here called the one she met the Tenant, and he let her." },
  { id: "wc-w6-1", w: 6, req: ["b-6.1"], line: "According to her notebook, the carving on the wall by the lamp was cut on her twentieth day down here, for the next one." },
  { id: "wc-w6-2", w: 6, req: ["b-6.A"], line: "In the square gallery, square-cut stone meets the rounded stone, and the record on the square wall opens almost the way the tally's records do." },
  { id: "wc-w6-3", w: 6, req: ["b-6.B"], line: "In the square gallery is the crew's wall, and under it what looks like a pay tablet: a wax tablet with a ring at the head of every row." },
  /* week 7, filled in, and story weeks 8–14 (STORY_JOB §8) */
  { id: "wc-w7-1", w: 7, req: ["b-7.A"], line: "At the lintel at the foot of the second flight, you cut the bar with a drop and the two drops parted, the stone beneath it went, and the Stair went on down." },
  { id: "wc-w7-2", w: 7, req: ["b-7.B"], line: "On the crew's wall are twelve rings and a thirteenth, smaller, and beneath them a wax tablet of symbols copied out by a beginner." },   /* the great door no longer opens in weeks 1-14 (D-160) */
  { id: "wc-w7-3", w: 7, req: ["b-7.3"], line: "On the Stair's rail, the stone has taken the shape of a hand with four long fingers." },
  { id: "wc-w8-1", w: 8, req: ["b-8.A"], line: "At the foot of the Stair lies the Water, a lake so still that nothing on it moves, and something tall stood at its far end without moving." },
  { id: "wc-w8-2", w: 8, req: ["b-8.3"], line: "Beside the tally's own count runs a second count in small strokes, and her notebook says it counts in eights." },
  { id: "wc-w8-3", w: 8, req: ["b-8.2"], line: "The record on the channel's lip was cut by someone else, not whoever cut the tally, and it does not begin with the bar with a tick." },
  { id: "wc-w9-1", w: 9, req: ["b-9.B"], line: "The cross means not. On the salt, after the symbol she read as held, there is a cross her sheet leaves out." },
  { id: "wc-w9-2", w: 9, req: ["b-9.A"], line: "Across the Water is the Reading Room, and its first tablet teaches the same lesson as the wall by the lamp, in cuts worn round with age." },
  { id: "wc-w9-3", w: 9, req: ["b-9.1"], line: "In her notebook she guessed the cross was there for emphasis." },
  { id: "wc-w10-1", w: 10, req: ["b-10.2"], line: "In the blast room lies a log, and in it a tall man with a lamp asks what is being cut." },
  { id: "wc-w10-2", w: 10, req: ["b-10.C"], line: "One wall of the blast room was torn open in one piece, and a watch there stopped at ten past four." },
  { id: "wc-w10-3", w: 13, req: ["b-10.B"],   /* the standing stone is reached in week 13 (D-160) */ line: "The standing stone before the fall carries a record that opens like the square gallery's records, with two drops." },
  { id: "wc-w11-1", w: 11, req: ["b-11.A"], line: "On the ledge beside the log lies a bound book with gold laid over some of the symbols in its margins." },
  { id: "wc-w11-2", w: 11, req: ["b-11.B"], line: "The lintel over the Reading Room's inner door ends: voice not." },
  { id: "wc-w11-3", w: 11, req: ["b-11.3"], line: "Her notebook says the book's writer never came down here, and was counted anyway." },
  { id: "wc-w12-1", w: 12, req: ["b-12.A"], line: "According to the log, after the blast a village well stood still for three days, and compasses swung towards the hill." },
  { id: "wc-w12-2", w: 12, req: ["b-12.B"], line: "The tally ends with counts: a hand, four and four, long; lamps, a hand and a hand; a child's child, three; and then the word good." },
  { id: "wc-w12-3", w: 12, req: ["b-12.C"], line: "At the end of the side gallery is a shut door, with stone chips at its foot on this side." },
  { id: "wc-w13-1", w: 13, req: ["b-13.A"], line: "The record on the shut door says: He long-slept not, when I [ ] it." },
  { id: "wc-w13-2", w: 13, req: ["b-13.B"], line: "At the standing stone you cut the wedge on a bar and the drop with a rising bar, and the fall of stone lifted aside." },
  { id: "wc-w13-3", w: 11, req: ["b-13.C"], line: "On a bench apart in the Reading Room, a tally of eights ends in a single sharp stroke." },
  { id: "wc-w14-1", w: 14, req: ["b-14.A"], line: "At the head of the lower way, the same two symbols as on the standing stone moved the rubble aside and opened a short way through to the blast room. Low on the rounded stone beside it is a blank, with a diamond and the bar with a tick." },
  { id: "wc-w14-2", w: 14, req: ["b-14.B"], line: "The lower way goes further down than anywhere yet, and its cups were already lit." },
  { id: "wc-w14-3", w: 14, req: ["b-14.2"], line: "The log says a mark cut on a roof held it up, and that the mark is not \"hold\"." },
];

/**
 * The month's "so far" (the first week close of each month of play: calendar weeks 1, 5, 9 and 13).
 * NOTE: SoFar has no per-line condition, but each line shows only if its beats have played (the first five that have).
 * The per-line ids and conditions are in `soFarLines` below; `lines` here is in the same order.
 */
export const soFar: SoFar[] = [
  { id: 'sf-m1', w: 1, lines: [
    "The lamp on the ledge in the Lamp Hall was lit before you came, and there is no oil in it.", // sf-m1-1
    "Someone lived in the Box Room, the side chamber off the Lamp Hall, and left a stone rod behind.", // sf-m1-2
    "The long line of symbols in the salt, which seems to be some kind of tally, was cut by one carver.", // sf-m1-3
    "At the far end of the Lamp Hall is a great door that takes up most of the wall.", // sf-m1-4
  ] },
  { id: 'sf-m2', w: 5, lines: [
    "Her notebook's first page, Day 1, says the lamp on the ledge was already lit when she came down, just as it was for you.", // sf-m2-1
    "The woman who lived here met someone tall where the corridor turns, and the tally, the long record in the salt, tells of someone tall standing where the way turns too.", // sf-m2-2
    "Nearly everything here was cut by one carver. The wall by the lamp was not.", // sf-m2-3
    "The little door on the Stair, which she found open, is shut to you.", // sf-m2-4
    "The great door has a row of notches, and two symbols beside a blank.", // sf-m2-5
    "At the head of the Stair, in a niche, there is a second clay lamp, unlit.", // sf-m2-6
  ] },  { id: 'sf-m3', w: 9, lines: [
    "At the foot of the Stair lies the Water, perfectly still, and something tall once stood at its far end.", // sf-m3-1
    "Two counts run side by side in the tally: the teller's own, and another in small strokes.", // sf-m3-2
    "Not every record here was cut by the same carver: the one on the channel's lip has a hook of its own.", // sf-m3-3
    "Her pencilled sheets were made before she knew the cross.", // sf-m3-4
    "You have met two new carved hooks: the cramped one on the channel's record, and a maker's hook on the Reading Room's first tablet.", // sf-m3-5
  ] },
  { id: 'sf-m4', w: 13, lines: [
    "A railway man broke into the blast room and kept a log, and in it a tall man with a lamp asks him questions.", // sf-m4-1
    "On the ledge in the blast room lies a bound book with gold in its margins; her notebook says its writer never came.", // sf-m4-2
    "After the blast, a village well stood still and compasses swung towards the hill.", // sf-m4-3
    "The tally ends on a count, and on the word good.", // sf-m4-4
    "At the end of the side gallery is a shut door, and on it a record cut by whoever cut the tally.", // sf-m4-5
  ] },
];

/** NOTE: the so-far lines with their own ids (sf-mN-k) and conditions; `w` is the week of the month's first close, as in `soFar`. */
export const soFarLines: WeekCloseLine[] = [
  { id: "sf-m1-1", w: 1, req: ["b-1.A"], line: "The lamp on the ledge in the Lamp Hall was lit before you came, and there is no oil in it." },
  { id: "sf-m1-2", w: 1, req: ["b-1.C"], line: "Someone lived in the Box Room, the side chamber off the Lamp Hall, and left a stone rod behind." },
  { id: "sf-m1-3", w: 1, req: ["b-1.5"], line: "The long line of symbols in the salt, which seems to be some kind of tally, was cut by one carver." },
  { id: "sf-m1-4", w: 1, req: ["b-1.A"], line: "At the far end of the Lamp Hall is a great door that takes up most of the wall." },
  { id: "sf-m2-1", w: 5, req: ["b-2.3"], line: "Her notebook's first page, Day 1, says the lamp on the ledge was already lit when she came down, just as it was for you." },
  { id: "sf-m2-2", w: 5, req: ["b-2.A", "b-2.3"], line: "The woman who lived here met someone tall where the corridor turns, and the tally, the long record in the salt, tells of someone tall standing where the way turns too." },
  { id: "sf-m2-3", w: 5, req: ["b-4.4"], line: "Nearly everything here was cut by one carver. The wall by the lamp was not." },
  { id: "sf-m2-4", w: 5, req: ["b-4.3", "b-5.0"], line: "The little door on the Stair, which she found open, is shut to you." },
  { id: "sf-m2-5", w: 5, req: ["b-4.C"], line: "The great door has a row of notches, and two symbols beside a blank." },
  { id: "sf-m2-6", w: 5, req: ["b-3.B"], line: "At the head of the Stair, in a niche, there is a second clay lamp, unlit." },
  { id: "sf-m3-1", w: 9, req: ["b-8.A"], line: "At the foot of the Stair lies the Water, perfectly still, and something tall once stood at its far end." },
  { id: "sf-m3-2", w: 9, req: ["b-8.B"], line: "Two counts run side by side in the tally: the teller's own, and another in small strokes." },
  { id: "sf-m3-3", w: 9, req: ["b-8.2"], line: "Not every record here was cut by the same carver: the one on the channel's lip has a hook of its own." },
  { id: "sf-m3-4", w: 9, req: ["b-9.B"], line: "Her pencilled sheets were made before she knew the cross." },
  { id: "sf-m3-5", w: 9, req: ["b-8.2", "b-9.A"], line: "You have met two new carved hooks: the cramped one on the channel's record, and a maker's hook on the Reading Room's first tablet." },
  { id: "sf-m4-1", w: 13, req: ["b-10.2"], line: "A railway man broke into the blast room and kept a log, and in it a tall man with a lamp asks him questions." },
  { id: "sf-m4-2", w: 13, req: ["b-11.3"], line: "On the ledge in the blast room lies a bound book with gold in its margins; her notebook says its writer never came." },
  { id: "sf-m4-3", w: 13, req: ["b-12.A"], line: "After the blast, a village well stood still and compasses swung towards the hill." },
  { id: "sf-m4-4", w: 13, req: ["b-12.B"], line: "The tally ends on a count, and on the word good." },
  { id: "sf-m4-5", w: 13, req: ["b-13.A"], line: "At the end of the side gallery is a shut door, and on it a record cut by whoever cut the tally." },
];

/** §10.3 "where you were": the week's line whose beat has played, else the week before's. NOTE: OpenQuestion has no condition field; see `openQuestionReq`. */
export const openQuestions: OpenQuestion[] = [
  { id: "aw-w1", w: 1, line: "The lamp on the ledge was already lit when you came down, and there is no oil in it. So what keeps it burning?" },
  { id: "aw-w2", w: 2, until: "b-3.A", line: "The rod is in your hand, and the lintel on the side wall of the Lamp Hall has a blank exactly the width of its edge. What will happen if you cut the two symbols there?" },
  { id: "aw-w3", w: 3, line: "The Stair goes down from the landing already lit, and you did not light it. So what did?" },
  { id: "aw-w4", w: 4, line: "Past the lone ring, her sheet says: *…go home… he held me… lamp… gave… went up…* Who is the \"he\" in it?" },
  { id: "aw-w5", w: 5, line: "Every record in the tally begins the same way. The line on the wall by the lamp does not. Why is it different?" },
  { id: "aw-w6", w: 6, line: "Through the low doorway is square-cut stone, quite unlike the rounded halls, and on it is a record cut by whoever cut the tally. So how did that same carver come to cut a record here?" },
  { id: "aw-w7", w: 7, line: "On the crew's wall, twelve rings stand in a row, and beside them a thirteenth, smaller. Who was the thirteenth?" },
  { id: "aw-w8", w: 8, line: "Something tall stood at the far end of the Water and did not move while you watched. What was it?" },
  { id: "aw-w9", w: 9, line: "Her sheet says he held me, but on the salt there is a cross after held. What does the line really say?" },
  { id: "aw-w10", w: 10, line: "The log says a tall man with a lamp asked what was being cut. Who was the tall man?" },
  { id: "aw-w11", w: 11, line: "Someone laid gold over the symbols in the book's margins. Who did it, and why?" },
  { id: "aw-w12", w: 12, line: "Stone chips lie on this side of the shut door. What is behind it?" },
  { id: "aw-w13", w: 13, line: "The record on the shut door says the water moved not, and moves not. What stopped it?" },
  { id: "aw-w14", w: 14, line: "The lower way goes down, and its cups were already lit. Who lit them?" },
];

/** NOTE: the beat each open question needs (the source's "Shows if"). */
export const openQuestionReq: Record<string, string[]> = {
  "aw-w1": ["b-1.A"],
  "aw-w2": ["b-2.B"],
  "aw-w3": ["b-3.B"],
  "aw-w4": ["b-4.A"],
  "aw-w5": ["b-5.A"],
  "aw-w6": ["b-6.A"],
  "aw-w7": ["b-7.B"],
  "aw-w8": ["b-8.A"],
  "aw-w9": ["b-9.B"],
  "aw-w10": ["b-10.2"],
  "aw-w11": ["b-11.A"],
  "aw-w12": ["b-12.C"],
  "aw-w13": ["b-13.A"],
  "aw-w14": ["b-14.B"],
};
