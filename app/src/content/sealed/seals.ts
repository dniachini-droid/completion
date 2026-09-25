/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/NICHES.md (weeks 1–7), MVP_CONTENT.md §0.3 and §5, and
 * ARRIVALS_REGION1.md / ARRIVALS_REGION2.md (the (Key) rows); those files are authoritative.
 *
 * `o` is the Key order within the week (NICHES row order, Key rows only). Seen-only rows take no Key.
 * Where ARR has a (Key) step, `beat` names it; where ARR has a (Key) arrival, `arrival` names it.
 * Otherwise `line` is §5's authored line (the five new rows) or composed per §5's build rule, written out there
 * since the language pass (D-074): "The count on [the place] fills." ("The strokes on [the place] fill." in week 1).
 */
import type { Seal } from '../../core/story-types';

export const seals: Seal[] = [
  /* ---- week 1 ---- */
  { id: 'seal-1-1', w: 1, o: 1, where: 'The Salt Gallery, the inner count', stretch: 'st-salt', beat: 'b-1.6' },
  // NOTE: seal-1-1 opens the stretch of tally read at b-2.A (rec-s2); the record is carried by b-2.A, so none here, and not plain.
  { id: 'seal-1-2', w: 1, o: 2, where: 'The Salt Gallery, the pick niche', stretch: 'st-salt',
    line: 'The strokes at the pick niche fill. Inside rests a bronze salt-pick. Its edge has worn into a curve, so that the narrow point you expect is no longer there; the cord on its handle has gone black, and lies tight against the bronze. Beside the niche, a short line in the tally’s hand is cut into the wall. You can take in the pick and the line together from where you stand.',
    carries: { records: ['rec-x-pick'] } },
  { id: 'seal-1-3', w: 1, o: 3, where: 'The Lamp Hall, a low niche under the ledge', stretch: 'st-hall',
    line: 'Below the ledge, the niche’s strokes fill. An empty clay saucer sits inside, shallow enough for its whole interior to be visible at once. Its rim and low foot have the same shape as the lamp’s foot above. You measure one against the other with your eyes, the ledge between them; there is nothing in the saucer to interrupt the plain curve of the clay.',
    plain: true },
  { id: 'seal-1-4', w: 1, o: 0, where: 'The Survey Cut, under the cot', stretch: 'st-camp', seenOnly: true },
  // NOTE: seen-only rows have no Key order; o is 0. seal-1-4 is seen in the open at b-1.C.
  { id: 'seal-1-5', w: 1, o: 4, where: 'The Mouth, a recess in the shaft wall', stretch: 'st-mouth',
    line: 'The strokes on the shaft-wall recess fill. A brass tag hangs from a nail inside, its weight drawing it straight down against the back of the recess. A shaft number is stamped into it. The stamped depressions remain legible even where the brass has dulled; the tag can turn a little on the nail, though the recess gives it hardly any room.',
    plain: true },
  { id: 'seal-1-6', w: 1, o: 5, where: 'The Salt Gallery, a niche by the split, low', stretch: 'st-salt',
    line: 'By the split, the niche’s strokes fill. Inside sits a small clay flask, stopped with twisted wool. You lift it and find it empty, light as an eggshell; even the wool seems large against the narrow mouth. The clay has enough substance to keep its shape and little enough weight that you adjust your grip before it can slip between your fingers.',
    plain: true },

  /* ---- week 2 ---- */
  { id: 'seal-2-1', w: 2, o: 1, where: 'The Survey Cut, the tin box on the cot', stretch: 'st-camp', beat: 'b-2.1',
    carries: { guess: ['mk-person', 'mk-one', 'mk-me'], seen: ['mk-give'] } },
  // NOTE: mk-give is seen here (the sheet's question mark); its guess is offered at b-2.2 (its guessAt), with the lintel.
  { id: 'seal-2-2', w: 2, o: 2, where: 'The Salt Gallery, the tally-stick niche', stretch: 'st-salt', beat: 'b-2.4',
    carries: { records: ['rec-x-daughter'] } },
  { id: 'seal-2-3', w: 2, o: 3, where: 'The Salt Gallery, a crack above the lone ring', stretch: 'st-salt',
    line: 'The count beside the crack above the ring fills. Inside is a bone comb, two of its teeth missing. The gaps interrupt the even run of the others so plainly that you count them twice. A short line in the tally’s hand is cut into the wall beside it, close enough that your gaze moves from the broken teeth to the cut without changing position.',
    carries: { records: ['rec-x-comb'] } },
  { id: 'seal-2-4', w: 2, o: 0, where: 'The Lamp Hall, the corner', stretch: 'st-hall', seenOnly: true },
  // NOTE: seal-2-4 is the named place pl-w2-smooth-place; its line is that place's.
  { id: 'seal-2-5', w: 2, o: 4, where: 'The Survey Cut, the box by the cot', stretch: 'st-camp',
    line: 'The count on the box by the cot fills. Inside are a tin of tea, a spoon, a candle stub, and a shopping list in her hand: batteries, batteries, tape. The spoon lies at an angle to the tin; the candle has dwindled to something you could close your fingers around. On the list, the second batteries takes up its own place, with no attempt to cross out the first.',
    plain: true },
  { id: 'seal-2-6', w: 2, o: 5, where: 'The Survey Cut, a slate on the floor by the cot’s head', stretch: 'st-camp',
    line: 'A slate lies on the floor by the head of the cot. Its count fills. Underneath is a head torch, the strap gone stiff enough to hold a bent shape without a head inside it. White powder has crusted in the battery case. You turn the case towards the available light; the powder stays lodged in its small recesses, and the torch remains dark.',
    plain: true },

  /* ---- week 3 ---- */
  { id: 'seal-3-1', w: 3, o: 1, where: 'The head of the Stair, the niche', stretch: 'st-stair', arrival: 'b-3.B',
    carries: { guess: ['mk-here', 'mk-door'] } },
  { id: 'seal-3-2', w: 3, o: 0, where: 'The Salt Gallery, the next stretch', stretch: 'st-salt', seenOnly: true },
  // NOTE: seal-3-2 is seen in the open at b-3.1.
  { id: 'seal-3-3', w: 3, o: 2, where: 'The Stair’s first turn, a recess', stretch: 'st-stair',
    line: 'The recess at the first turn fills its count. Inside is a coil of measuring cord, knotted every ten paces. Its stiff knots hold the turns of the coil apart in uneven loops, so that you can follow the cord a little way without unrolling it. A short line in the tally’s hand is cut into the wall beside it, level with the recess.',
    carries: { records: ['rec-x-cord'] } },
  { id: 'seal-3-4', w: 3, o: 3, where: 'The Lamp Hall, the foot of the wall by the lamp', stretch: 'st-hall',
    line: 'The count at the foot of the wall by the lamp fills. Among scattered chips lies a stub of stone: the broken edge of a rod. Its fractured end is rougher than the length that survives. You can see where it stops abruptly amid pieces small enough to shift under a fingertip, while the lamp above holds the floor and the wall in the same pool of light.',
    plain: true },
  { id: 'seal-3-5', w: 3, o: 4, where: 'The Survey Cut, a ledge', stretch: 'st-camp',
    line: 'The count on the ledge in her camp fills. A box of tape cassettes sits there, its contents close together in the little space. Three bear labels in her hand: DAY 3 (HIM), DAY 6 (IT WORKS), DAY 14. You read them in that order. The gaps between the dates take up no room on the labels, though the box has room for each cassette.',
    plain: true },
  { id: 'seal-3-6', w: 3, o: 5, where: 'The head of the Stair, a crack in the landing’s floor', stretch: 'st-stair',
    line: 'A count follows a crack in the landing floor. It fills. Inside the crack is a foil blanket, still sealed in its packet. The packet has slipped into the narrow opening but has not opened there; you can see the folded foil pressed flat through its wrapping. In pencil on the packet: *in case I’m an idiot*. The words are small enough to fit beside the fold.',
    plain: true },

  /* ---- week 4 ---- */
  { id: 'seal-4-1', w: 4, o: 1, where: 'The Stair’s second niche', stretch: 'st-stair', beat: 'b-4.2',
    carries: { guess: ['mk-deep'] } },
  { id: 'seal-4-2', w: 4, o: 2, where: 'The Salt Gallery, past the split', stretch: 'st-salt', arrival: 'b-4.B',
    carries: { records: ['rec-x-neighbour'] } },
  { id: 'seal-4-3', w: 4, o: 3, where: 'The Survey Cut, the recess above the cot', stretch: 'st-camp',
    line: 'The count on the recess above the cot fills. A printed email is pinned to the back inside. The sheet hangs flat where the pin holds it and bows slightly below, close to the wall but clear of the recess floor. From the cot you would have to look up to read it; standing here, you can see the whole page at once.',
    carries: { records: ['rec-x-colleague'] } },
  { id: 'seal-4-4', w: 4, o: 0, where: 'The Lamp Hall, the far end', stretch: 'st-hall', seenOnly: true },
  // NOTE: seal-4-4 is the great door's count, seen close at b-4.C; nothing opens (it opens as seal-7-5).
  { id: 'seal-4-5', w: 4, o: 4, where: 'The Salt Gallery, a hollow in the salt', stretch: 'st-salt',
    line: 'The count around the hollow in the salt fills. Inside is a child’s clay sheep, one leg repaired with salt. The repair has the pale, granular look of the hollow around it against the more solid clay of the body. You can make out the little leg where it joins the sheep without lifting it. A short line in the tally’s hand is cut into the wall beside it.',
    carries: { records: ['rec-x-sheep'] } },
  { id: 'seal-4-6', w: 4, o: 5, where: 'The Survey Cut, a slate low on the back wall', stretch: 'st-camp',
    line: 'Low on the back wall of her camp, a slate’s count fills. Behind it is a paperback dictionary of a dead language. Its spine is broken at the grammar, where the pages settle open of their own accord; the margins there are thick with pencil. You hold it low to read, with the slate and the wall close behind the bent paper cover.',
    plain: true },

  /* ---- week 5 ---- */
  { id: 'seal-5-1', w: 5, o: 1, where: 'The Stair, the recess under the second turn', stretch: 'st-flight2', beat: 'b-5.1',
    carries: { guess: ['mk-once', 'mk-path', 'mk-go'] } },
  { id: 'seal-5-2', w: 5, o: 2, where: 'The Salt Gallery, the crust', stretch: 'st-salt', beat: 'b-5.3',
    carries: { records: ['rec-s5'] } },
  { id: 'seal-5-3', w: 5, o: 3, where: 'The Stair, the gap’s sill', stretch: 'st-flight2',
    line: 'The count on the gap’s sill fills. Wax crumbs and a broken stylus lie there, the crumbs small against the width of the sill. The broken end of the stylus faces the gap. Beside them, a short line in the tally’s hand is cut into the wall. You can see all three at once: the scattered wax, the shortened tool, and the cut beside it.',
    carries: { records: ['rec-x-wax'] } },
  { id: 'seal-5-4', w: 5, o: 4, where: 'The Survey Cut, the notebook’s back pocket', stretch: 'st-camp',
    line: 'The count on the notebook’s back pocket fills. Inside is a folded map of the hill. The folds resist you a little as you open it, and the hill spreads out across the paper. The shaft is marked in pen; in another pen: SALT? and TUNNEL? You hold the map by its edges while the two kinds of ink remain distinct on the same sheet.',
    plain: true },
  // NOTE: seal-5-4's map is paper but not a record in MVP_CONTENT §4, so it counts as plain.
  { id: 'seal-5-5', w: 5, o: 5, where: 'The Lamp Hall, the ledge’s underside', stretch: 'st-hall',
    line: 'The count under the ledge fills. You have to lower yourself to see the small ring cut there, out of sight of anyone standing. A short line in the tally’s hand sits beside it. From this low angle the underside of the ledge occupies most of your view, and the ring and line are close enough to take in together.',
    carries: { records: ['rec-x-hers-again'] } },

  /* ---- week 6 ---- */
  { id: 'seal-6-1', w: 6, o: 1, where: 'The Salt Gallery, the last hidden stretch', stretch: 'st-salt', beat: 'b-6.2',
    carries: { guess: ['mk-open', 'mk-eat'], records: ['rec-s6'] } },
  // NOTE: rec-s6 is only seen here (as glyphs); it is read at b-7.2.
  { id: 'seal-6-2', w: 6, o: 2, where: 'The square gallery, a niche under the crew’s wall', stretch: 'st-square', arrival: 'b-6.B',
    carries: { records: ['rec-x-foreman'] } },
  { id: 'seal-6-3', w: 6, o: 3, where: 'The square gallery, a wall-shelf', stretch: 'st-square',
    line: 'The count on the wall-shelf fills. A bronze level lies on the shelf, long enough to rest across your hands. Its bubble is long dry. The place where a bubble should move is still; you can turn the level, but nothing inside responds to the tilt. Its bronze weight stays steady against your palms when you set it level again.',
    plain: true },
  { id: 'seal-6-4', w: 6, o: 0, where: 'The square gallery, the floor', stretch: 'st-square', seenOnly: true },
  // NOTE: seal-6-4 (the mule-shoe) is seen on the floor at b-6.3, which carries its line.
  { id: 'seal-6-5', w: 6, o: 4, where: 'The Survey Cut, her folder', stretch: 'st-camp',
    line: 'The count on her folder fills. Its first pocket contains a council letter about the shaft and a note taken from a car windscreen: “Your car’s been here nine days. Ring me.” The two sheets sit together in the pocket, the official letter larger than the note. You lift their edges far enough to see both without taking them out of order.',
    plain: true },
  // NOTE: seal-6-5's papers are not records in MVP_CONTENT §4, so it counts as plain.
  { id: 'seal-6-6', w: 6, o: 5, where: 'The square gallery, a niche cut square, low', stretch: 'st-square',
    line: 'Low in the square wall, the square niche fills its count. Inside is a clay water jar stopped with wax. The wax is cracked, its surface divided across the mouth while the jar beneath remains whole. You bend to see into the low opening, but the stop covers the neck; only the shape of the jar and the broken surface of its seal are visible.',
    plain: true },

  /* ---- week 7 (run-ahead) ---- */
  { id: 'seal-7-1', w: 7, o: 1, where: 'The square gallery, a niche', stretch: 'st-square', beat: 'b-7.1',
    carries: { guess: ['mk-up', 'mk-stone', 'mk-child'] } },
  { id: 'seal-7-2', w: 7, o: 2, where: 'The square gallery, the crew’s wall', stretch: 'st-square', arrival: 'b-7.B',
    carries: {} },   /* X-boy has no told line or sign string of its own (the boy's slate is described in its beat) */
  // NOTE: rec-x-boy is not in MVP_CONTENT §4 (run-ahead); the id follows LIVES' X-boy.
  { id: 'seal-7-3', w: 7, o: 3, where: 'The Stair, the rail’s recess', stretch: 'st-stair', beat: 'b-7.3',
    plain: true },
  { id: 'seal-7-4', w: 7, o: 4, where: 'The square gallery, a cache', stretch: 'st-square', beat: 'b-7.4',
    carries: { records: ['rec-x-wages'] } },
  // NOTE: rec-x-wages is not in MVP_CONTENT §4 (run-ahead); the id follows LIVES §12 "the wages".
  { id: 'seal-7-5', w: 7, o: 5, where: 'The Lamp Hall, the great door', stretch: 'st-hall', arrival: 'b-7.C',
    carries: { word: 'wd-open-way' } },
];
