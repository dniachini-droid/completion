/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §8.1 (the Truth column is never shipped); those files are authoritative.
 */

import type { Find } from '../../core/story-types';

export const finds: Find[] = [
  { id: "fd-a01", stretch: "st-mouth", w: 1, req: [], line: "At the ladder's foot, an old rung lies in the dust, bent in the middle, and the rung above it on the ladder is newer than the rest." },
  { id: "fd-a02", stretch: "st-mouth", w: 1, req: [], line: "On the shaft's brick at the ladder's foot, an arrow in old chalk pointing down, and beside it: 36 FT." },
  { id: "fd-a03", stretch: "st-mouth", w: 1, req: [], line: "Folded small and pushed behind a bracket, a cereal-bar wrapper, foil side out." },
  { id: "fd-a04", stretch: "st-mouth", w: 1, req: [], line: "Where the shaft's brick stops, its last course is laid right against the stone below, with no mortar between them. The stone was here first." },
  { id: "fd-a05", stretch: "st-mouth", w: 1, req: [], line: "In the passage dust, bootprints, one size, in and out, so many they have worn a path." },
  { id: "fd-a06", stretch: "st-mouth", w: 1, req: [], line: "Tied to the bottom rung, a length of blue rope, cut, the end melted into a knob." },
  { id: "fd-b01", stretch: "st-hall", w: 1, req: [], line: "On the ledge's lip, a drip of glaze the lamp's colour, hard as glass." },
  { id: "fd-b02", stretch: "st-hall", w: 3, req: ["b-3.A"], line: "In each cup the flame has no wick. It stands on the mark itself." },
  { id: "fd-b03", stretch: "st-hall", w: 6, req: ["b-6.1"], line: "Under the carved lamp on the wall, faint, in pencil, a grid of small squares, the kind you draw before you cut." },
  { id: "fd-b04", stretch: "st-hall", w: 1, req: [], line: "On the ceiling above the ledge, a fan of old soot, thick at its point." },
  { id: "fd-b05", stretch: "st-hall", w: 1, req: [], line: "Five candle stubs in a row on the floor by the ledge, burned down to the stone." },
  { id: "fd-b06", stretch: "st-hall", w: 3, req: ["b-3.A"], line: "One cup near the corner was broken at the lip and has been mended with a paste of the same stone. The flame's mark inside it is whole." },
  { id: "fd-b07", stretch: "st-hall", w: 1, req: [], line: "At the foot of the great door, the dust lies in a line along the floor, finer than anywhere else, as if air has moved under it for a long time.", until: "b-7.C" },
  { id: "fd-b08", stretch: "st-hall", w: 1, req: [], line: "In a crack beside the ledge, the burnt end of a wick, and beside it, cut small, a line in the tally's hand.", told: "tl-wick" }, // side chamber
  { id: "fd-b09", stretch: "st-hall", w: 1, req: [], line: "Under the ledge, a flake of glaze a shade darker than the lamp's." },
  { id: "fd-b10", stretch: "st-hall", w: 1, req: [], line: "On the hall floor, in chalk, an arrow pointing at the side chamber, and the word CAMP." },
  { id: "fd-b11", stretch: "st-hall", w: 3, req: ["b-3.A"], line: "In the lamplight there are rings on the ceiling too, cut where no ladder has been." },
  { id: "fd-b12", stretch: "st-hall", w: 1, req: [], line: "The lamp's flame doesn't bend, even when you breathe on it." },
  { id: "fd-c01", stretch: "st-hall", w: 1, req: [], line: "In the bottom of one trough at the corner, a dry leaf of the kind that grows on a hedge, brown and crumbling." },
  { id: "fd-c02", stretch: "st-salt", w: 1, req: [], line: "A knot of wool gone grey, tied round a knob of salt at the gallery's first turn. A short line is cut beside it.", told: "tl-wool" }, // side chamber
  { id: "fd-c03", stretch: "st-salt", w: 2, req: [], line: "In a crack in the salt, a small cake of salt with a thumbprint pressed into it. Under it, a line in the tally's hand.", told: "tl-salt-cake" }, // side chamber
  { id: "fd-c04", stretch: "st-salt", w: 1, req: [], line: "A chip of salt scratched with strokes in rows of five, and a line beside it in the tally's hand.", told: "tl-count" }, // side chamber
  { id: "fd-c05", stretch: "st-salt", w: 2, req: [], line: "A length of wood worn smooth in two grooves, a carrying pole, laid in the salt with a few marks cut beside it.", told: "tl-yoke" }, // side chamber
  { id: "fd-c06", stretch: "st-salt", w: 1, req: [], line: "Point first in a crack of the salt, a bronze awl gone green." },
  { id: "fd-c07", stretch: "st-salt", w: 1, req: [], line: "A strip of hide gone hard as wood, knotted in a loop." },
  { id: "fd-c08", stretch: "st-salt", w: 1, req: [], line: "In the crack with her sheets, a pencil worn down to the length of a thumb." },
  { id: "fd-c09", stretch: "st-salt", w: 1, req: [], line: "In the tally's lowest cuts, salt has grown in small crystals, like frost in a crack." },
  { id: "fd-c10", stretch: "st-salt", w: 1, req: [], line: "In the salt floor by the split, the print of a sandal, the strap marks showing, set hard." },
  { id: "fd-c11", stretch: "st-salt", w: 1, req: [], line: "Between two of the stones in the split, a plug of wool with salt worked into it." },
  { id: "fd-c12", stretch: "st-salt", w: 2, req: ["b-2.A"], line: "The lone ring over the tally, close: its curve is one cut, with no place where it starts or stops." },
  { id: "fd-c13", stretch: "st-salt", w: 1, req: ["seal-1-2"], line: "In the pick niche, the floor is scored where a pick was laid down and taken up, many times." },
  { id: "fd-c14", stretch: "st-salt", w: 2, req: ["b-2.A"], line: "On the back of her Day 4 sheet, a sketch of the corner's two troughs, a measurement across them, and: *stride?? 1.4 m*" },
  { id: "fd-d01", stretch: "st-camp", w: 1, req: [], line: "A hair elastic wound round the notebook's pencil." },
  { id: "fd-d02", stretch: "st-camp", w: 1, req: [], line: "A page of an old railway timetable, printed thin, one line ringed in pencil, the station's name torn away." },
  { id: "fd-d03", stretch: "st-camp", w: 1, req: [], line: "A tea bag dried to paper on the lid of a mug." },
  { id: "fd-d04", stretch: "st-camp", w: 2, req: [], line: "A photocopy of a page of handwriting in brown ink, *Log.* at the top, the rest greyed out by the copier." },
  { id: "fd-d05", stretch: "st-camp", w: 1, req: [], line: "A roll of black tape and a battery with its label peeled off." },
  { id: "fd-d06", stretch: "st-camp", w: 1, req: [], line: "A thermos, its cup upside down on the shelf, a brown ring dried inside it." },
  { id: "fd-d07", stretch: "st-camp", w: 1, req: [], line: "A crossword torn from a newspaper, half done in pencil, the date torn off." },
  { id: "fd-d08", stretch: "st-camp", w: 1, req: [], line: "On the cot's frame, a strip of masking tape with DAY 1 written on it in marker." },
  { id: "fd-d09", stretch: "st-camp", w: 1, req: [], line: "A box of matches with three left in it." },
  { id: "fd-d10", stretch: "st-camp", w: 6, req: ["b-6.1"], line: "On the wall above the cot, pencil tallies in fives, twelve strokes, and a line drawn under the last." },
  { id: "fd-d11", stretch: "st-camp", w: 1, req: [], line: "A paperback thriller left face down, open at page 211." },
  { id: "fd-d12", stretch: "st-camp", w: 1, req: [], line: "A fleece hat on a nail by the door." },
  { id: "fd-e01", stretch: "st-stair", w: 3, req: [], line: "Where a step's edge is chipped, the stone inside is darker and threaded with something like glass." },
  { id: "fd-e02", stretch: "st-stair", w: 3, req: [], line: "At the landing's edge, a wax seal the size of a coin, its stamp worn flat. The tally's hand has cut a line beside it.", told: "tl-seal" }, // side chamber
  { id: "fd-e03", stretch: "st-stair", w: 3, req: [], line: "Down the wall of the top flight, a long band polished smooth at the height of a long hand, as if one hand went down this wall many times." },
  { id: "fd-e04", stretch: "st-stair", w: 3, req: [], line: "Driven into a crack at the first turn, a bronze nail with a square head." },
  { id: "fd-e05", stretch: "st-stair", w: 3, req: [], line: "On the rail, a pencil tick, and beside it: *1.3 m. Rail for somebody tall.*" },
  { id: "fd-e06", stretch: "st-stair", w: 3, req: [], line: "On the top step, a flake of candle wax, and beside it the print of a trainer's sole." },
  { id: "fd-e07", stretch: "st-stair", w: 3, req: [], line: "At the head of the top flight, on the wall, one ring set apart from the rest and cut deeper." },
  { id: "fd-e08", stretch: "st-stair", w: 4, req: [], line: "Round the edge of one step, a groove worn by a rope, and a thread of blue caught in it." },
  { id: "fd-e09", stretch: "st-stair", w: 3, req: [], line: "In the top flight's wall, at the height of your head, a row of small cut hollows, each the size of a fingertip: four, then a space, then four." },
  { id: "fd-e10", stretch: "st-stair", w: 3, req: [], line: "Wedged under a step, a folded page: a sketch of the stair, every step marked *50 cm*, and underneath, *built for legs longer than mine*." },
  { id: "fd-f01", stretch: "st-flight2", w: 4, req: [], line: "By the little door, a square of foam mat, cut to kneel on." },
  { id: "fd-f02", stretch: "st-flight2", w: 5, req: ["b-5.0"], line: "On the little door's jamb, in pencil: *open. D9*" },
  { id: "fd-f03", stretch: "st-flight2", w: 4, req: [], line: "Along the second flight's wall at waist height, a straight black line, snapped like a chalk line." },
  { id: "fd-f04", stretch: "st-flight2", w: 5, req: [], line: "In a corner of the second landing, a small clay lamp with a spout and a handle, soot in the spout, cold." },
  { id: "fd-f05", stretch: "st-flight2", w: 5, req: [], line: "Down the second flight, a long shallow groove in the dust of every step, where something heavy was dragged." },
  { id: "fd-f06", stretch: "st-flight2", w: 5, req: [], line: "Swept against the wall under the gap, a heap of stone chips, square-edged." },
  { id: "fd-f07", stretch: "st-flight2", w: 4, req: [], line: "On one step's riser, a ring worn so smooth it is only a shine in the stone." },
  { id: "fd-f08", stretch: "st-flight2", w: 5, req: [], line: "A leather thong, dry and curled, with a bronze bead on it." },
  { id: "fd-g01", stretch: "st-square", w: 6, req: [], line: "In a niche at a man's head height, under a patch of soot, a clay lamp with a spout; under it, cut small, a line in the tally's hand.", told: "tl-lamp" }, // side chamber
  { id: "fd-g02", stretch: "st-square", w: 6, req: [], line: "A small sandal against the square wall, its hobnails in rows, and a line of marks above it.", told: "tl-sandal" }, // side chamber
  { id: "fd-g03", stretch: "st-square", w: 6, req: [], line: "The square wall, close: chisel marks a finger's width, row on row, each one angled the same way." },
  { id: "fd-g04", stretch: "st-square", w: 6, req: [], line: "An iron hobnail, rusted to a brown stain on the floor." },
  { id: "fd-g05", stretch: "st-square", w: 6, req: [], line: "Scratched into the square wall at a man's height, strokes in tens, a gap after each ten." },
  { id: "fd-g06", stretch: "st-square", w: 6, req: [], line: "A wooden peg driven into a crack, charred black at its end." },
  { id: "fd-g07", stretch: "st-square", w: 6, req: [], line: "A sherd of a big jar, with a stamped mark on it rubbed smooth." },
  { id: "fd-g08", stretch: "st-square", w: 6, req: [], line: "A grey whetstone, worn hollow in the middle." },
  { id: "fd-g09", stretch: "st-square", w: 6, req: [], line: "In the join where square meets round, a sliver of grey metal poured into a crack to key a block." },
  { id: "fd-g10", stretch: "st-square", w: 6, req: [], line: "At knee height, a line cut the length of the gallery, dead level." },
];
