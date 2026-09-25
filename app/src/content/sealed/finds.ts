/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §8.1 (the Truth column is never shipped); those files are authoritative.
 */

import type { Find } from '../../core/story-types';

export const finds: Find[] = [
  { id: "fd-a01", stretch: "st-mouth", w: 1, req: [], line: "At the foot of the ladder, an old rung lies in the dust, bent through the middle. The rung above its place is newer than the rest." },
  { id: "fd-a02", stretch: "st-mouth", w: 1, req: [], line: "On the shaft brick at the ladder’s foot, an old chalk arrow points down. Beside it: 36 FT." },
  { id: "fd-a03", stretch: "st-mouth", w: 1, req: [], line: "A cereal-bar wrapper has been folded into a small square and pushed behind a bracket, foil turned out." },
  { id: "fd-a04", stretch: "st-mouth", w: 1, req: [], line: "The final course of shaft brick sits directly against the stone below, with no mortar in the join. The stone was here first." },
  { id: "fd-a05", stretch: "st-mouth", w: 1, req: [], line: "Bootprints cover the passage dust, all the same size, going in and coming out. There are enough of them to have worn a path." },
  { id: "fd-a06", stretch: "st-mouth", w: 1, req: [], line: "Blue rope is tied to the bottom rung. It has been cut; the loose end is melted into a hard knob." },
  { id: "fd-b01", stretch: "st-hall", w: 1, req: [], line: "A drip of glaze has hardened on the ledge’s lip, the same colour as the lamp and hard as glass." },
  { id: "fd-b02", stretch: "st-hall", w: 3, req: ["b-3.A"], line: "None of the cups has a wick. In each one the flame stands directly on the mark." },
  { id: "fd-b03", stretch: "st-hall", w: 6, req: ["b-6.1"], line: "Beneath the carved lamp, almost lost in the stone, a pencil grid of small squares shows where someone planned before cutting." },
  { id: "fd-b04", stretch: "st-hall", w: 1, req: [], line: "Old soot fans across the ceiling above the ledge, thickest at the point directly over it." },
  { id: "fd-b05", stretch: "st-hall", w: 1, req: [], line: "Five candle stubs stand in a row on the floor beside the ledge, burned down almost to the stone." },
  { id: "fd-b06", stretch: "st-hall", w: 3, req: ["b-3.A"], line: "One cup near the corner has been broken at the lip and repaired with a paste made from the same stone. The flame’s mark inside remains whole." },
  { id: "fd-b07", stretch: "st-hall", w: 1, req: [], line: "At the foot of the great door, the dust lies in a finer line than anywhere else, as though air has passed beneath it for a long time.", until: "b-7.C" },
  { id: "fd-b08", stretch: "st-hall", w: 1, req: [], line: "A burnt wick-end lies in a crack beside the ledge. Next to it, cut very small, is a line in the tally’s hand.", told: "tl-wick" }, // side chamber
  { id: "fd-b09", stretch: "st-hall", w: 1, req: [], line: "A flake of glaze lies under the ledge, one shade darker than the lamp." },
  { id: "fd-b10", stretch: "st-hall", w: 1, req: [], line: "An arrow in chalk points across the hall towards the side chamber. Beside it, in block letters: CAMP." },
  { id: "fd-b11", stretch: "st-hall", w: 3, req: ["b-3.A"], line: "In the lamplight, you can make out rings cut into the ceiling too, beyond any place a ladder could have stood." },
  { id: "fd-b12", stretch: "st-hall", w: 1, req: [], line: "You breathe across the lamp. The flame does not bend." },
  { id: "fd-c01", stretch: "st-hall", w: 1, req: [], line: "A dry brown leaf lies in the bottom of one trough at the corner, crumbling at the edges, the sort that grows on a hedge." },
  { id: "fd-c02", stretch: "st-salt", w: 1, req: [], line: "At the first turn of the gallery, greyed wool is knotted round a knob of salt. A short line is cut beside it.", told: "tl-wool" }, // side chamber
  { id: "fd-c03", stretch: "st-salt", w: 2, req: [], line: "In a crack in the salt is a small salt cake with a thumbprint pressed into it. A line in the tally’s hand is cut underneath.", told: "tl-salt-cake" }, // side chamber
  { id: "fd-c04", stretch: "st-salt", w: 1, req: [], line: "A chip of salt bears rows of scratches counted in fives. Beside it is a line in the tally’s hand.", told: "tl-count" }, // side chamber
  { id: "fd-c05", stretch: "st-salt", w: 2, req: [], line: "A carrying pole lies in the salt, its wood worn smooth into two grooves. A few marks are cut beside it.", told: "tl-yoke" }, // side chamber
  { id: "fd-c06", stretch: "st-salt", w: 1, req: [], line: "A bronze awl, green with age, has been driven point-first into a crack in the salt." },
  { id: "fd-c07", stretch: "st-salt", w: 1, req: [], line: "A strip of hide tied into a loop has dried hard as wood." },
  { id: "fd-c08", stretch: "st-salt", w: 1, req: [], line: "A pencil lies in the crack with her sheets, worn down to the length of a thumb." },
  { id: "fd-c09", stretch: "st-salt", w: 1, req: [], line: "Small salt crystals have grown in the tally’s lowest cuts, like frost caught in a crack." },
  { id: "fd-c10", stretch: "st-salt", w: 1, req: [], line: "A sandal-print is set hard in the salt floor by the split; even the straps have left their marks." },
  { id: "fd-c11", stretch: "st-salt", w: 1, req: [], line: "Between two stones packed into the split is a plug of wool, salt worked deep into it." },
  { id: "fd-c12", stretch: "st-salt", w: 2, req: ["b-2.A"], line: "Close to, the lone ring above the tally is one unbroken cut. There is no visible place where it begins or ends." },
  { id: "fd-c13", stretch: "st-salt", w: 1, req: ["seal-1-2"], line: "The floor of the pick niche is scored by the same repeated action: a pick laid down, lifted, laid down again." },
  { id: "fd-c14", stretch: "st-salt", w: 2, req: ["b-2.A"], line: "On the back of her Day 4 sheet she has drawn the two troughs at the corner, measured the gap between them, and written: *stride?? 1.4 m*" },
  { id: "fd-d01", stretch: "st-camp", w: 1, req: [], line: "A hair elastic is wound several times round the notebook’s pencil." },
  { id: "fd-d02", stretch: "st-camp", w: 1, req: [], line: "A page torn from an old railway timetable is printed on thin paper. One line has been ringed in pencil; the station name is torn away." },
  { id: "fd-d03", stretch: "st-camp", w: 1, req: [], line: "A used tea bag has dried flat against the lid of a mug, papery and stiff." },
  { id: "fd-d04", stretch: "st-camp", w: 2, req: [], line: "A photocopy of brown-ink handwriting has *Log.* at the top. Everything below is greyed out by the copier." },
  { id: "fd-d05", stretch: "st-camp", w: 1, req: [], line: "A roll of black tape lies beside a battery whose label has been peeled away." },
  { id: "fd-d06", stretch: "st-camp", w: 1, req: [], line: "The cup of a thermos stands upside down on the shelf. A brown ring has dried inside it." },
  { id: "fd-d07", stretch: "st-camp", w: 1, req: [], line: "A newspaper crossword lies torn in half, partly completed in pencil. The date is missing." },
  { id: "fd-d08", stretch: "st-camp", w: 1, req: [], line: "A strip of masking tape on the cot frame has DAY 1 written across it in marker." },
  { id: "fd-d09", stretch: "st-camp", w: 1, req: [], line: "Three matches remain in the box." },
  { id: "fd-d10", stretch: "st-camp", w: 6, req: ["b-6.1"], line: "Above the cot, twelve pencil strokes have been tallied in groups of five. A line is drawn beneath the last." },
  { id: "fd-d11", stretch: "st-camp", w: 1, req: [], line: "A paperback thriller lies face down, splayed open at page 211." },
  { id: "fd-d12", stretch: "st-camp", w: 1, req: [], line: "A fleece hat hangs from a nail beside the door." },
  { id: "fd-e01", stretch: "st-stair", w: 3, req: [], line: "Where the edge of one step has chipped away, the darker stone inside is threaded with something like glass." },
  { id: "fd-e02", stretch: "st-stair", w: 3, req: [], line: "At the landing’s edge lies a wax seal no larger than a coin, its stamp worn flat. The tally’s hand has cut a line beside it.", told: "tl-seal" }, // side chamber
  { id: "fd-e03", stretch: "st-stair", w: 3, req: [], line: "A long band down the wall of the top flight has been polished smooth at the height of a long hand, as though the same hand passed there again and again." },
  { id: "fd-e04", stretch: "st-stair", w: 3, req: [], line: "A bronze nail with a square head is driven into a crack at the first turn." },
  { id: "fd-e05", stretch: "st-stair", w: 3, req: [], line: "A pencil tick marks the rail. Beside it: *1.3 m. Rail for somebody tall.*" },
  { id: "fd-e06", stretch: "st-stair", w: 3, req: [], line: "A flake of candle wax rests on the top step beside the print of a trainer’s sole." },
  { id: "fd-e07", stretch: "st-stair", w: 3, req: [], line: "One ring is cut into the wall at the head of the top flight, apart from the others and noticeably deeper." },
  { id: "fd-e08", stretch: "st-stair", w: 4, req: [], line: "A rope has worn a groove round the edge of one step. A single blue thread remains caught in it." },
  { id: "fd-e09", stretch: "st-stair", w: 3, req: [], line: "At head height in the wall of the top flight are eight fingertip-sized hollows: four, a space, then four." },
  { id: "fd-e10", stretch: "st-stair", w: 3, req: [], line: "A folded page is wedged beneath a step. It carries a drawing of the Stair with every step marked *50 cm*, and underneath: *built for legs longer than mine*." },
  { id: "fd-f01", stretch: "st-flight2", w: 4, req: [], line: "A square of foam mat lies beside the little door, cut to kneel on." },
  { id: "fd-f02", stretch: "st-flight2", w: 5, req: ["b-5.0"], line: "In pencil on the little door’s jamb: *open. D9*" },
  { id: "fd-f03", stretch: "st-flight2", w: 4, req: [], line: "A straight black line runs along the second-flight wall at waist height, snapped there like a chalk line." },
  { id: "fd-f04", stretch: "st-flight2", w: 5, req: [], line: "A small clay lamp stands in the corner of the second landing, with a spout and handle. There is soot in the spout. The lamp is cold." },
  { id: "fd-f05", stretch: "st-flight2", w: 5, req: [], line: "A long shallow groove crosses the dust of every step on the second flight, as if something heavy was dragged down." },
  { id: "fd-f06", stretch: "st-flight2", w: 5, req: [], line: "Square-edged stone chips have been swept into a heap against the wall beneath the gap." },
  { id: "fd-f07", stretch: "st-flight2", w: 4, req: [], line: "A ring cut into one riser has been worn down until only a shine remains in the stone." },
  { id: "fd-f08", stretch: "st-flight2", w: 5, req: [], line: "A dry leather thong lies curled on the floor with a bronze bead threaded onto it." },
  { id: "fd-g01", stretch: "st-square", w: 6, req: [], line: "In a head-high niche beneath a soot patch stands a spouted clay lamp. A small line in the tally’s hand is cut below it.", told: "tl-lamp" }, // side chamber
  { id: "fd-g02", stretch: "st-square", w: 6, req: [], line: "A small hobnailed sandal lies against the square wall. Above it is a line of marks.", told: "tl-sandal" }, // side chamber
  { id: "fd-g03", stretch: "st-square", w: 6, req: [], line: "Seen close, the square wall is covered in chisel cuts a finger’s width long, row after row, each angled the same way." },
  { id: "fd-g04", stretch: "st-square", w: 6, req: [], line: "An iron hobnail has rusted where it fell, leaving a brown stain on the floor." },
  { id: "fd-g05", stretch: "st-square", w: 6, req: [], line: "At a man’s height, strokes have been scratched into the square wall in tens, a gap after every ten." },
  { id: "fd-g06", stretch: "st-square", w: 6, req: [], line: "A wooden peg has been driven into a crack. Its end is charred black." },
  { id: "fd-g07", stretch: "st-square", w: 6, req: [], line: "A sherd from a large jar bears a stamped mark, rubbed almost smooth." },
  { id: "fd-g08", stretch: "st-square", w: 6, req: [], line: "A grey whetstone has been worn into a hollow through its middle." },
  { id: "fd-g09", stretch: "st-square", w: 6, req: [], line: "At the join between square and round stone, grey metal has been poured into a crack to key one block to the other." },
  { id: "fd-g10", stretch: "st-square", w: 6, req: [], line: "A dead-level cut runs the length of the gallery at knee height." },
];
