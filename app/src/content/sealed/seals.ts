/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/NICHES.md (weeks 1–7), MVP_CONTENT.md §0.3 and §5, and
 * ARRIVALS_REGION1.md / ARRIVALS_REGION2.md (the (Key) rows); those files are authoritative.
 *
 * `o` is the Key order within the week (NICHES row order, Key rows only). Seen-only rows take no Key.
 * Where ARR has a (Key) step, `beat` names it; where ARR has a (Key) arrival, `arrival` names it.
 * Otherwise `line` is §5's authored line (the five new rows) or composed per §5's build rule
 * ("The [place]: its count fills. Inside, [what it opens]."; "its strokes fill" in week 1).
 */
import type { Seal } from '../../core/story-types';

export const seals: Seal[] = [
  /* ---- week 1 ---- */
  { id: 'seal-1-1', w: 1, o: 1, where: 'The Salt Gallery, the inner count', stretch: 'st-salt', beat: 'b-1.6' },
  // NOTE: seal-1-1 opens the stretch of tally read at b-2.A (rec-s2); the record is carried by b-2.A, so none here, and not plain.
  { id: 'seal-1-2', w: 1, o: 2, where: 'The Salt Gallery, the pick niche', stretch: 'st-salt',
    line: 'The pick niche: its strokes fill. Inside, a salt-pick, bronze, the edge worn to a curve, the handle wrapped in cord gone black. Beside it on the wall, a short line in the tally\'s hand.',
    carries: { records: ['rec-x-pick'] } },
  { id: 'seal-1-3', w: 1, o: 3, where: 'The Lamp Hall, a low niche under the ledge', stretch: 'st-hall',
    line: 'The niche below the ledge: its strokes fill. Inside, a clay saucer, the twin of the lamp\'s foot, empty.',
    plain: true },
  { id: 'seal-1-4', w: 1, o: 0, where: 'The Survey Cut, under the cot', stretch: 'st-camp', seenOnly: true },
  // NOTE: seen-only rows have no Key order; o is 0. seal-1-4 is seen in the open at b-1.C.
  { id: 'seal-1-5', w: 1, o: 4, where: 'The Mouth, a recess in the shaft wall', stretch: 'st-mouth',
    line: 'The recess in the shaft wall: its strokes fill. Inside, a brass tag stamped with a shaft number, hung on a nail.',
    plain: true },
  { id: 'seal-1-6', w: 1, o: 5, where: 'The Salt Gallery, a niche by the split, low', stretch: 'st-salt',
    line: 'The niche by the split: its strokes fill. Inside, a small clay flask, stoppered with a twist of wool, empty and light as an eggshell.',
    plain: true },

  /* ---- week 2 ---- */
  { id: 'seal-2-1', w: 2, o: 1, where: 'The Survey Cut, the tin box on the cot', stretch: 'st-camp', beat: 'b-2.1',
    carries: { guess: ['mk-give', 'mk-person', 'mk-one', 'mk-me'] } },
  // NOTE: mk-give's guess is offered at b-2.2 (its guessAt); the tablet that brings it into view is here.
  { id: 'seal-2-2', w: 2, o: 2, where: 'The Salt Gallery, the tally-stick niche', stretch: 'st-salt', beat: 'b-2.4',
    carries: { records: ['rec-x-daughter'] } },
  { id: 'seal-2-3', w: 2, o: 3, where: 'The Salt Gallery, a crack above the lone ring', stretch: 'st-salt',
    line: 'The crack above the ring: its count fills. Inside, a bone comb, two teeth gone. Beside it on the wall, a short line in the tally\'s hand.',
    carries: { records: ['rec-x-comb'] } },
  { id: 'seal-2-4', w: 2, o: 0, where: 'The Lamp Hall, the corner', stretch: 'st-hall', seenOnly: true },
  // NOTE: seal-2-4 is the named place pl-w2-smooth-place; its line is that place's.
  { id: 'seal-2-5', w: 2, o: 4, where: 'The Survey Cut, the box by the cot', stretch: 'st-camp',
    line: 'The box by the cot: its count fills. Inside, a tin of tea, a spoon, a candle stub, and a shopping list in her hand: batteries, batteries, tape.',
    plain: true },
  { id: 'seal-2-6', w: 2, o: 5, where: 'The Survey Cut, a slate on the floor by the cot\'s head', stretch: 'st-camp',
    line: 'By the cot\'s head, a slate on the floor with a count, and the count fills. Under it, a head torch, the strap gone stiff, and in its battery case a crust of white powder.',
    plain: true },

  /* ---- week 3 ---- */
  { id: 'seal-3-1', w: 3, o: 1, where: 'The head of the Stair, the niche', stretch: 'st-stair', arrival: 'b-3.B',
    carries: { guess: ['mk-here', 'mk-door'] } },
  { id: 'seal-3-2', w: 3, o: 0, where: 'The Salt Gallery, the next stretch', stretch: 'st-salt', seenOnly: true },
  // NOTE: seal-3-2 is seen in the open at b-3.1.
  { id: 'seal-3-3', w: 3, o: 2, where: 'The Stair\'s first turn, a recess', stretch: 'st-stair',
    line: 'The recess at the first turn: its count fills. Inside, a coil of measuring cord, knotted every ten paces, the knots stiff. Beside it on the wall, a short line in the tally\'s hand.',
    carries: { records: ['rec-x-cord'] } },
  { id: 'seal-3-4', w: 3, o: 3, where: 'The Lamp Hall, the foot of the wall by the lamp', stretch: 'st-hall',
    line: 'The foot of the wall by the lamp: its count fills. Inside, a stub of stone, the broken edge of a rod, and a scatter of chips.',
    plain: true },
  { id: 'seal-3-5', w: 3, o: 4, where: 'The Survey Cut, a ledge', stretch: 'st-camp',
    line: 'The ledge in her camp: its count fills. On it, a box of tape cassettes, three labelled in her hand: DAY 3 (HIM), DAY 6 (IT WORKS), DAY 14.',
    plain: true },
  { id: 'seal-3-6', w: 3, o: 5, where: 'The head of the Stair, a crack in the landing\'s floor', stretch: 'st-stair',
    line: 'A crack in the landing\'s floor, with a count along it: it fills. Inside, a foil blanket still in its packet, and on the packet in pencil: *in case I\'m an idiot*.',
    plain: true },

  /* ---- week 4 ---- */
  { id: 'seal-4-1', w: 4, o: 1, where: 'The Stair\'s second niche', stretch: 'st-stair', beat: 'b-4.2',
    carries: { guess: ['mk-deep'] } },
  { id: 'seal-4-2', w: 4, o: 2, where: 'The Salt Gallery, past the split', stretch: 'st-salt', arrival: 'b-4.B',
    carries: { records: ['rec-x-neighbour'] } },
  { id: 'seal-4-3', w: 4, o: 3, where: 'The Survey Cut, the recess above the cot', stretch: 'st-camp',
    line: 'The recess above the cot: its count fills. Inside, pinned to the back of the recess, a printed email.',
    carries: { records: ['rec-x-colleague'] } },
  { id: 'seal-4-4', w: 4, o: 0, where: 'The Lamp Hall, the far end', stretch: 'st-hall', seenOnly: true },
  // NOTE: seal-4-4 is the great door's count, seen close at b-4.C; nothing opens (it opens as seal-7-5).
  { id: 'seal-4-5', w: 4, o: 4, where: 'The Salt Gallery, a hollow in the salt', stretch: 'st-salt',
    line: 'The hollow in the salt: its count fills. In it, a child\'s clay animal, a sheep, one leg mended with salt. Beside it on the wall, a short line in the tally\'s hand.',
    carries: { records: ['rec-x-sheep'] } },
  { id: 'seal-4-6', w: 4, o: 5, where: 'The Survey Cut, a slate low on the back wall', stretch: 'st-camp',
    line: 'Low on the back wall of her camp, a slate with a count: it fills. Behind it, a paperback dictionary of a dead language, its spine broken open at the grammar, the margins full of pencil.',
    plain: true },

  /* ---- week 5 ---- */
  { id: 'seal-5-1', w: 5, o: 1, where: 'The Stair, the recess under the second turn', stretch: 'st-flight2', beat: 'b-5.1',
    carries: { guess: ['mk-once', 'mk-path', 'mk-go'] } },
  { id: 'seal-5-2', w: 5, o: 2, where: 'The Salt Gallery, the crust', stretch: 'st-salt', beat: 'b-5.3',
    carries: { records: ['rec-s5'] } },
  { id: 'seal-5-3', w: 5, o: 3, where: 'The Stair, the gap\'s sill', stretch: 'st-flight2',
    line: 'The sill of the gap: its count fills. On it, wax crumbs and a broken stylus. Beside them on the wall, a short line in the tally\'s hand.',
    carries: { records: ['rec-x-wax'] } },
  { id: 'seal-5-4', w: 5, o: 4, where: 'The Survey Cut, the notebook\'s back pocket', stretch: 'st-camp',
    line: 'The notebook\'s back pocket: its count fills. Inside, a folded map of the hill, the shaft marked in pen and, in another pen, SALT? and TUNNEL?',
    plain: true },
  // NOTE: seal-5-4's map is paper but not a record in MVP_CONTENT §4, so it counts as plain.
  { id: 'seal-5-5', w: 5, o: 5, where: 'The Lamp Hall, the ledge\'s underside', stretch: 'st-hall',
    line: 'The ledge\'s lip: its count fills. Under it, a ring cut small, where no one would look. Beside it, a short line in the tally\'s hand.',
    carries: { records: ['rec-x-hers-again'] } },

  /* ---- week 6 ---- */
  { id: 'seal-6-1', w: 6, o: 1, where: 'The Salt Gallery, the last hidden stretch', stretch: 'st-salt', beat: 'b-6.2',
    carries: { guess: ['mk-open', 'mk-eat'], records: ['rec-s6'] } },
  // NOTE: rec-s6 is only seen here (as glyphs); it is read at b-7.2.
  { id: 'seal-6-2', w: 6, o: 2, where: 'The square gallery, a niche under the crew\'s wall', stretch: 'st-square', arrival: 'b-6.B',
    carries: { records: ['rec-x-foreman'] } },
  { id: 'seal-6-3', w: 6, o: 3, where: 'The square gallery, a wall-shelf', stretch: 'st-square',
    line: 'The wall-shelf: its count fills. On it, a level, bronze, the bubble long dry.',
    plain: true },
  { id: 'seal-6-4', w: 6, o: 0, where: 'The square gallery, the floor', stretch: 'st-square', seenOnly: true },
  // NOTE: seal-6-4 (the mule-shoe) is seen on the floor at b-6.3, which carries its line.
  { id: 'seal-6-5', w: 6, o: 4, where: 'The Survey Cut, her folder', stretch: 'st-camp',
    line: 'Her folder: its count fills. In its first pocket, a letter from the council about the shaft, and a note from a car\'s windscreen: "Your car\'s been here nine days. Ring me."',
    plain: true },
  // NOTE: seal-6-5's papers are not records in MVP_CONTENT §4, so it counts as plain.
  { id: 'seal-6-6', w: 6, o: 5, where: 'The square gallery, a niche cut square, low', stretch: 'st-square',
    line: 'A square niche low in the square wall: its count fills. Inside, a clay water jar, its neck stopped with wax, the wax cracked.',
    plain: true },

  /* ---- week 7 (run-ahead) ---- */
  { id: 'seal-7-1', w: 7, o: 1, where: 'The square gallery, a niche', stretch: 'st-square', beat: 'b-7.1',
    carries: { guess: ['mk-up', 'mk-stone', 'mk-child'] } },
  { id: 'seal-7-2', w: 7, o: 2, where: 'The square gallery, the crew\'s wall', stretch: 'st-square', arrival: 'b-7.B',
    carries: {} },   /* X-boy has no told line or sign string of its own (the boy's slate is described in its beat) */
  // NOTE: rec-x-boy is not in MVP_CONTENT §4 (run-ahead); the id follows LIVES' X-boy.
  { id: 'seal-7-3', w: 7, o: 3, where: 'The Stair, the rail\'s recess', stretch: 'st-stair', beat: 'b-7.3',
    plain: true },
  { id: 'seal-7-4', w: 7, o: 4, where: 'The square gallery, a cache', stretch: 'st-square', beat: 'b-7.4',
    carries: { records: ['rec-x-wages'] } },
  // NOTE: rec-x-wages is not in MVP_CONTENT §4 (run-ahead); the id follows LIVES §12 "the wages".
  { id: 'seal-7-5', w: 7, o: 5, where: 'The Lamp Hall, the great door', stretch: 'st-hall', arrival: 'b-7.C',
    carries: { word: 'wd-open-way' } },
];
