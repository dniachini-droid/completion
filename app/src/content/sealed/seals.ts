/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/NICHES.md (weeks 1–7), MVP_CONTENT.md §0.3 and §5, and
 * ARRIVALS_REGION1.md / ARRIVALS_REGION2.md (the (Key) rows); weeks 8–14 from NICHES.md as planned in STORY_JOB.md §8; those files are authoritative.
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
    line: 'In the Salt Gallery, you crouch at the pick niche, the arm-length alcove low in the salt wall that has stayed shut until now. Light runs along the notches on its lip, filling the whole row at once, and the niche opens. Inside lies a bronze salt-pick, like a small hand-pick. Its edge is worn to a curve and its handle is wrapped in cord gone black, as if it was used again and again for a long time. You look at it without lifting it out. On the wall beside the niche is a short line of symbols, cut by whoever cut the tally.',
    carries: { records: ['rec-x-pick'] } },
  { id: 'seal-1-3', w: 1, o: 3, where: 'The Lamp Hall, a low niche under the ledge', stretch: 'st-hall',
    line: 'Under the ledge where the lamp stands, the small niche at knee height, with the greasy stone round its mouth, begins to change. Its notches fill with light, the whole row at once, and the niche opens. Inside is a clay saucer, empty. It is the twin of the lamp\'s base, the same shape and the same size, as if the two belong together. You kneel to look, but leave the saucer where it sits.',
    plain: true },
  { id: 'seal-1-4', w: 1, o: 0, where: 'The Survey Cut, under the cot', stretch: 'st-camp', seenOnly: true },
  // NOTE: seen-only rows have no Key order; o is 0. seal-1-4 is seen in the open at b-1.C.
  { id: 'seal-1-5', w: 1, o: 4, where: 'The Mouth, a recess in the shaft wall', stretch: 'st-mouth',
    line: 'At the bottom of the shaft, beside the foot of the ladder, is a recess in the brick wall: a small alcove like a little cupboard, with a nail above it and a row of notches along its lip. Soft light fills the notches, the whole row at once, and the recess opens. Inside, a brass tag hangs on a nail, stamped with a shaft number. It looks like an official label for the shaft, the kind a company or council would use. You leave it hanging.',
    plain: true },
  { id: 'seal-1-6', w: 1, o: 5, where: 'The Salt Gallery, a niche by the split, low', stretch: 'st-salt',
    line: 'In the Salt Gallery, low down beside the split in the salt wall, is a niche with its mouth closed and a row of dark notches on its lip. Light fills them, the whole row at once, and the niche opens. Inside is a small clay flask, stoppered with a twist of wool. You lift it out: it is empty, and as light as an eggshell, like something put away with care. You set it back where you found it.',
    plain: true },

  /* ---- week 2 ---- */
  { id: 'seal-2-1', w: 2, o: 1, where: 'The Survey Cut, the tin box on the cot', stretch: 'st-camp', beat: 'b-2.1',
    carries: { guess: ['mk-person', 'mk-one', 'mk-me'], seen: ['mk-give'] } },
  // NOTE: mk-give is seen here (the sheet's question mark); its guess is offered at b-2.2 (its guessAt), with the lintel.
  { id: 'seal-2-2', w: 2, o: 2, where: 'The Salt Gallery, the tally-stick niche', stretch: 'st-salt', beat: 'b-2.4',
    carries: { records: ['rec-x-daughter'] } },
  { id: 'seal-2-3', w: 2, o: 3, where: 'The Salt Gallery, a crack above the lone ring', stretch: 'st-salt',
    line: 'Further in along the Salt Gallery, above the lone ring, the notches beside the crack in the salt fill with light, the whole row at once. Now you can see the pale thing inside: a bone comb, with two of its teeth gone. It looks like an ordinary belonging, put away with care. On the wall beside it is a short line of symbols, cut by whoever cut the tally.',
    carries: { records: ['rec-x-comb'] } },
  { id: 'seal-2-4', w: 2, o: 0, where: 'The Lamp Hall, the corner', stretch: 'st-hall', seenOnly: true },
  // NOTE: seal-2-4 is the named place pl-w2-smooth-place; its line is that place's.
  { id: 'seal-2-5', w: 2, o: 4, where: 'The Survey Cut, the box by the cot', stretch: 'st-camp',
    line: 'In the Survey Cut, the notches on the slate across the shoebox-sized box by the cot light up together, and you can lift the lid. Inside are a tin of tea, a spoon, a candle stub, and a shopping list in her handwriting: batteries, batteries, tape. It looks like her store of supplies, and batteries seem to have been on her mind.',
    plain: true },
  { id: 'seal-2-6', w: 2, o: 5, where: 'The Survey Cut, a slate on the floor by the cot’s head', stretch: 'st-camp',
    line: 'In the Survey Cut, by the head of the cot, a thin slate lies on the floor with a row of notches cut in it. The notches glow, and you lift the slate. Under it is a head torch, the kind worn on a strap round the head. The strap has gone stiff, and white powder has crusted in the battery case, as if the batteries were left in until they leaked.',
    plain: true },

  /* ---- week 3 ---- */
  { id: 'seal-3-1', w: 3, o: 1, where: 'The head of the Stair, the niche', stretch: 'st-stair', arrival: 'b-3.B',
    carries: { guess: ['mk-here', 'mk-door'] } },
  { id: 'seal-3-2', w: 3, o: 0, where: 'The Salt Gallery, the next stretch', stretch: 'st-salt', seenOnly: true },
  // NOTE: seal-3-2 is seen in the open at b-3.1.
  { id: 'seal-3-3', w: 3, o: 2, where: 'The Stair’s first turn, a recess', stretch: 'st-stair',
    line: 'At the first turn of the Stair is another alcove, separate from the niche beside the rail: the recess at the first turn. Its row of notches fills with light, and it opens. Inside is a coil of measuring cord, knotted every ten paces, its knots gone stiff. It looks like a cord for pacing out distances. Beside it on the wall is a short line of symbols, cut by whoever cut the tally, as if noting what the cord is.',
    carries: { records: ['rec-x-cord'] } },
  { id: 'seal-3-4', w: 3, o: 3, where: 'The Lamp Hall, the foot of the wall by the lamp', stretch: 'st-hall',
    line: 'In the Lamp Hall, at the foot of the wall by the lamp, the stretch of wall with the carved lamp and flame, a row of notches fills with light, and a small niche there opens. Inside, among a scatter of stone chips, lies a stub of stone: the broken-off edge of a rod, like the fine edge of the stone rod from the shelf. The chips look like the leftovers of cutting stone.',
    plain: true },
  { id: 'seal-3-5', w: 3, o: 4, where: 'The Survey Cut, a ledge', stretch: 'st-camp',
    line: 'In the Survey Cut, where she camped, a row of notches along the edge of a ledge in the wall fills with light. On the ledge is a box of tape cassettes, the small plastic kind played in an old tape recorder. Three are labelled in her handwriting: DAY 3 (HIM), DAY 6 (IT WORKS), DAY 14. They look like recordings she made of her days here.',
    plain: true },
  { id: 'seal-3-6', w: 3, o: 5, where: 'The head of the Stair, a crack in the landing’s floor', stretch: 'st-stair',
    line: 'On the landing at the head of the Stair, a row of notches runs along a crack in the floor, and it fills with light. Inside the crack is a foil blanket, the thin silver emergency kind that folds small, still in its packet. On the packet, in pencil: *in case I\'m an idiot*. It looks like spare kit, kept back for an emergency.',
    plain: true },

  /* ---- week 4 ---- */
  { id: 'seal-4-1', w: 4, o: 1, where: 'The Stair’s second niche', stretch: 'st-stair', beat: 'b-4.2',
    carries: { guess: ['mk-deep'] } },
  { id: 'seal-4-2', w: 4, o: 2, where: 'The Salt Gallery, past the split', stretch: 'st-salt', arrival: 'b-4.B',
    carries: { records: ['rec-x-neighbour'] } },
  { id: 'seal-4-3', w: 4, o: 3, where: 'The Survey Cut, the recess above the cot', stretch: 'st-camp',
    line: 'In the Survey Cut, the slate over the recess above the cot begins to change. Light fills its notches from end to end, and the recess opens. Pinned to the back of it is a printed email, a single sheet of ordinary paper. You reach up and read it where it hangs.',
    carries: { records: ['rec-x-colleague'] } },
  { id: 'seal-4-4', w: 4, o: 0, where: 'The Lamp Hall, the far end', stretch: 'st-hall', seenOnly: true },
  // NOTE: seal-4-4 is the great door's count, seen close at b-4.C; nothing opens (it opens as seal-7-5).
  { id: 'seal-4-5', w: 4, o: 4, where: 'The Salt Gallery, a hollow in the salt', stretch: 'st-salt',
    line: 'In the Salt Gallery, at the hollow low in the salt wall, light fills the notches round its rim. Lying in the hollow is a child\'s clay animal, a sheep. One of its legs has been mended with salt, as if someone cared enough to fix it. On the wall beside it is a short line of symbols, cut by whoever cut the tally. You leave the sheep where it lies.',
    carries: { records: ['rec-x-sheep'] } },
  { id: 'seal-4-6', w: 4, o: 5, where: 'The Survey Cut, a slate low on the back wall', stretch: 'st-camp',
    line: 'Low on the back wall of her camp in the Survey Cut, a thin slate with a row of notches is set against the stone like a lid. The notches fill with light, and you lift the slate away. Behind it is a paperback dictionary of a dead language. Its spine is broken open at the grammar section, and the margins there are full of pencil notes, as if someone worked through it hard.',
    plain: true },

  /* ---- week 5 ---- */
  { id: 'seal-5-1', w: 5, o: 1, where: 'The Stair, the recess under the second turn', stretch: 'st-flight2', beat: 'b-5.1',
    carries: { guess: ['mk-once', 'mk-path', 'mk-go'] } },
  { id: 'seal-5-2', w: 5, o: 2, where: 'The Salt Gallery, the crust', stretch: 'st-salt', beat: 'b-5.3',
    carries: { records: ['rec-s5'] } },
  { id: 'seal-5-3', w: 5, o: 3, where: 'The Stair, the gap’s sill', stretch: 'st-flight2',
    line: 'On the second flight, light fills the notches on the sill of the gap, the rough window in the wall. On the sill lie crumbs of wax and a broken stylus, a thin pointed tool for scratching writing into wax. Beside them, a short line of symbols is cut into the wall by whoever cut the tally. They look like the leftovers of someone writing on wax.',
    carries: { records: ['rec-x-wax'] } },
  { id: 'seal-5-4', w: 5, o: 4, where: 'The Survey Cut, the notebook’s back pocket', stretch: 'st-camp',
    line: 'In the Survey Cut, a pocket at the back of her notebook has its own row of notches, and they fill with light. Inside is a folded map of the hill. You unfold it. The shaft is marked in pen, and in another pen someone has written SALT? and TUNNEL? The question marks make them look like guesses at what lies inside the hill.',
    plain: true },
  // NOTE: seal-5-4's map is paper but not a record in MVP_CONTENT §4, so it counts as plain.
  { id: 'seal-5-5', w: 5, o: 5, where: 'The Lamp Hall, the ledge’s underside', stretch: 'st-hall',
    line: 'In the Lamp Hall, the notches under the front edge of the ledge fill with light. Beside them a small ring comes into view, cut where no one would look, and next to it a short line of symbols, cut by whoever cut the tally. It looks as if it was cut to be there rather than to be seen.',
    carries: { records: ['rec-x-hers-again'] } },

  /* ---- week 6 ---- */
  { id: 'seal-6-1', w: 6, o: 1, where: 'The Salt Gallery, the last hidden stretch', stretch: 'st-salt', beat: 'b-6.2',
    carries: { guess: ['mk-open', 'mk-eat'], records: ['rec-s6'] } },
  // NOTE: rec-s6 is only seen here (as glyphs); it is read at b-7.2.
  { id: 'seal-6-2', w: 6, o: 2, where: 'The square gallery, a niche under the crew’s wall', stretch: 'st-square', arrival: 'b-6.B',
    carries: { records: ['rec-x-foreman'] } },
  { id: 'seal-6-3', w: 6, o: 3, where: 'The square gallery, a wall-shelf', stretch: 'st-square',
    line: 'At the wall-shelf in the square gallery, light fills the row of notches on its lip. On the shelf lies a bronze level, a builder\'s tool for checking that something is flat, like a spirit level. Its bubble dried up long ago.',
    plain: true },
  { id: 'seal-6-4', w: 6, o: 0, where: 'The square gallery, the floor', stretch: 'st-square', seenOnly: true },
  // NOTE: seal-6-4 (the mule-shoe) is seen on the floor at b-6.3, which carries its line.
  { id: 'seal-6-5', w: 6, o: 4, where: 'The Survey Cut, her folder', stretch: 'st-camp',
    line: 'In the Survey Cut, light fills the notches on the slate across her folder, the one marked HILL, and the folder opens. In its first pocket are a letter from the council about the shaft and a note from a car\'s windscreen: "Your car\'s been here nine days. Ring me." Someone up above seems to have noticed her car.',
    plain: true },
  // NOTE: seal-6-5's papers are not records in MVP_CONTENT §4, so it counts as plain.
  { id: 'seal-6-6', w: 6, o: 5, where: 'The square gallery, a niche cut square, low', stretch: 'st-square',
    line: 'Low in the square gallery\'s wall is a niche cut square, like a small cupboard. The row of notches on its lip fills with light, and the niche opens. Inside stands a clay water jar. Its neck is stopped with wax, and the wax is cracked. It looks as if someone once kept drinking water here.',
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
  /* ---- week 8 (NICHES week 8; row 5 is new and the child's tablet moves to week 9: STORY_JOB §8.3) ---- */
  { id: 'seal-8-1', w: 8, o: 1, where: 'The Water, a niche by the Stair’s last step', stretch: 'st-water', beat: 'b-8.1',
    carries: { guess: ['mk-see', 'mk-count', 'mk-day', 'mk-number'] } },
  { id: 'seal-8-2', w: 8, o: 0, where: 'The channel’s near lip', stretch: 'st-water', seenOnly: true },
  // NOTE: seal-8-2 is V4, seen in the open at b-8.2.
  { id: 'seal-8-3', w: 8, o: 2, where: 'The Water, a step under the water', stretch: 'st-water', beat: 'b-8.4', plain: true },
  { id: 'seal-8-4', w: 8, o: 3, where: 'The Water’s far shore, a niche', stretch: 'st-blast', arrival: 'b-8.C' },
  { id: 'seal-8-5', w: 8, o: 4, where: 'The channel, a niche above the water', stretch: 'st-water',
    line: 'In the channel\'s side, the row of notches on the niche fills with light, and the niche opens. Inside lies a cork float, the kind that bobs on a fishing line, tied to a long cord knotted at even spaces. The cord is dry and neatly coiled. It looks as if someone once timed the channel\'s flow by letting the float drift along it.',
    plain: true },

  /* ---- week 9 ---- */
  { id: 'seal-9-1', w: 9, o: 1, where: 'The Reading Room, a tablet set low on the wall', stretch: 'st-reading', beat: 'b-9.2',
    carries: { guess: ['mk-not'] } },
  { id: 'seal-9-2', w: 9, o: 2, where: 'The Reading Room, a low bench', stretch: 'st-reading', arrival: 'b-9.C',
    carries: { records: ['rec-x-binder-child'] } },
  { id: 'seal-9-3', w: 9, o: 3, where: 'The Reading Room, a bench with notches along its edge', stretch: 'st-reading', beat: 'b-9.4', plain: true },
  { id: 'seal-9-4', w: 9, o: 4, where: 'The Reading Room, a flat stone on the floor', stretch: 'st-reading',
    line: 'Near the Reading Room\'s benches, the row of notches on the flat stone in the floor fills with light. The three small symbols on its face are the same three as on the lintel over the inner door, cut small: a hook closed round a drop, a fork open sideways, and a cross. It looks like a copy of the lintel set down at floor level, where someone could read it up close.',
    carries: { records: ['rec-lintel'] } },
  { id: 'seal-9-5', w: 9, o: 5, where: 'Below the Water, a niche beside the lintel', stretch: 'st-blast',
    line: 'Below the Water, beside the lintel that smells of powder, the row of notches on one of the two niches fills with light, and the niche opens. Inside stands a round tin with a tight lid, the kind blasting powder was kept in, with a company\'s name stamped on its side. It is empty.',
    plain: true },

  /* ---- week 10 ---- */
  { id: 'seal-10-1', w: 10, o: 1, where: 'Below the Water, the other niche beside the lintel', stretch: 'st-blast', beat: 'b-10.1',
    carries: { guess: ['mk-move', 'mk-water'] } },
  { id: 'seal-10-2', w: 10, o: 2, where: 'Below the Water, the lintel over solid stone', stretch: 'st-blast', arrival: 'b-10.A',
    carries: { word: 'wd-open-way' } },
  { id: 'seal-10-3', w: 10, o: 3, where: 'The square gallery, the standing stone before the fall', stretch: 'st-square', arrival: 'b-10.B',
    carries: { records: ['rec-v5'] } },
  { id: 'seal-10-4', w: 10, o: 4, where: 'The blast room, a recess by the ledge', stretch: 'st-blast', arrival: 'b-10.C' },
  { id: 'seal-10-5', w: 10, o: 5, where: 'The blast room, a shelf', stretch: 'st-blast',
    line: 'In the blast room, the row of notches along the shelf fills with light. On the shelf is a tin plate with a knife laid across it, as if someone ate here and meant to come back to it.',
    plain: true },

  /* ---- week 11 (rows 6 and 7 are new: STORY_JOB §8.3) ---- */
  { id: 'seal-11-1', w: 11, o: 1, where: 'The blast room, the cupboard', stretch: 'st-blast', beat: 'b-11.1',
    carries: { guess: ['mk-voice', 'mk-sleep'] } },
  { id: 'seal-11-2', w: 11, o: 2, where: 'The blast room, the ledge with the book', stretch: 'st-blast', arrival: 'b-11.A',
    carries: { records: ['rec-c1', 'rec-k3'] } },
  { id: 'seal-11-3', w: 11, o: 0, where: 'The blast room, the book’s other margins', stretch: 'st-blast', seenOnly: true },
  { id: 'seal-11-4', w: 11, o: 3, where: 'The blast room, a crack by the torn wall', stretch: 'st-blast', arrival: 'b-11.C',
    carries: { records: ['rec-x-powder-man'] } },
  { id: 'seal-11-5', w: 11, o: 0, where: 'The blast room, under the ledge', stretch: 'st-blast', seenOnly: true },
  // NOTE: seal-11-5 is the well-keeper's bucket, seen in the open at b-12.A.
  { id: 'seal-11-6', w: 11, o: 4, where: 'The blast room, a split in the floor by the rails', stretch: 'st-blast',
    line: 'Where the iron rails stop in the middle of the blast room, a row of notches along a split in the floor fills with light. Driven into the split is a spiked iron candle-holder, the kind miners drove into a wall to hold a candle while they worked. A stub of wax is still in its cup.',
    plain: true },
  { id: 'seal-11-7', w: 11, o: 5, where: 'The Reading Room, the end of a bench', stretch: 'st-reading',
    line: 'On the end of a bench in the Reading Room, a row of notches fills with light. Lying there is a pencil stub, worn down to the length of your thumb and sharpened to a point with a knife. It looks like one of hers.',
    plain: true },

  /* ---- week 12 ---- */
  { id: 'seal-12-1', w: 12, o: 1, where: 'The Water’s far end, a niche', stretch: 'st-water', beat: 'b-12.1',
    carries: { guess: ['mk-take', 'mk-hand-sign', 'mk-good'] } },
  { id: 'seal-12-2', w: 12, o: 2, where: 'The Salt Gallery, the tally’s last stretch', stretch: 'st-salt', arrival: 'b-12.B',
    carries: { records: ['rec-s8'] } },
  { id: 'seal-12-3', w: 12, o: 3, where: 'The blast room, the ledge’s lip', stretch: 'st-blast', beat: 'b-12.3',
    carries: { records: ['rec-k3'] } },
  { id: 'seal-12-4', w: 12, o: 4, where: 'The blast room, a box on the shelf', stretch: 'st-blast',
    line: 'At the back of the blast room, the notches on the slate across the box\'s lid fill with light, and you lift the lid. The box is empty. Its inside is stained brown halfway up, as if water once stood in it.',
    plain: true },
  { id: 'seal-12-5', w: 12, o: 5, where: 'The side gallery, a sill across the floor', stretch: 'st-side', arrival: 'b-12.C' },
  { id: 'seal-12-6', w: 12, o: 6, where: 'The blast room, a niche behind the shelf', stretch: 'st-blast',
    line: 'At the back of the blast room, the row of notches on the small niche behind the shelf fills with light, and it opens. Inside is a child\'s pocket compass in a dented brass case. Its needle is stuck fast against the glass.',
    plain: true },

  /* ---- week 13 (row 6 is new) ---- */
  { id: 'seal-13-1', w: 13, o: 1, where: 'The side gallery, a niche by the shut door', stretch: 'st-side', beat: 'b-13.1',
    carries: { guess: ['mk-long-sleep', 'mk-mark'] } },
  { id: 'seal-13-2', w: 13, o: 2, where: 'The side gallery, the shut door', stretch: 'st-side', arrival: 'b-13.A',
    carries: { records: ['rec-v6'] } },
  { id: 'seal-13-3', w: 13, o: 3, where: 'The side gallery, a recess across from the door', stretch: 'st-side', beat: 'b-13.3',
    carries: { records: ['tl-ledger'] } },
  { id: 'seal-13-4', w: 13, o: 0, where: 'The square gallery, the fall', stretch: 'st-square', seenOnly: true },
  // NOTE: seal-13-4 (the roof-fall) is opened by the word at b-13.B, not by a Key.
  { id: 'seal-13-5', w: 13, o: 4, where: 'The Reading Room, a bench apart from the rest', stretch: 'st-reading', arrival: 'b-13.C',
    carries: { records: ['tl-one-stroke'] } },
  { id: 'seal-13-6', w: 13, o: 5, where: 'The side gallery, a small niche by the floor', stretch: 'st-side',
    line: 'Low in the side gallery\'s wall, the row of notches on the small niche fills with light, and it opens. Inside lies a folding rule made of bone, the kind of measuring stick that folds in two, marked along its edge in tens.',
    plain: true },

  /* ---- week 14 (NICHES weeks 14–26, week 14) ---- */
  { id: 'seal-14-1', w: 14, o: 1, where: 'The blast room, the cupboard’s lower shelf', stretch: 'st-blast', beat: 'b-14.1',
    carries: { guess: ['mk-world', 'mk-hear'] } },
  { id: 'seal-14-2', w: 14, o: 2, where: 'The blast room, the ledge beside the log', stretch: 'st-blast',
    line: 'In the blast room, a row of notches along the ledge beside the log fills with light. Tucked inside the log\'s back cover is a second page, folded in four and stuck to the board with old damp. You leave it to come free rather than tear it.',
    plain: true },
  // NOTE: seal-14-2's folded page is the log's next page (E5), read in week 15.
  { id: 'seal-14-3', w: 14, o: 0, where: 'The blast room, the torn wall behind the fall', stretch: 'st-blast', seenOnly: true },
  // NOTE: seal-14-3 is the blank seen at b-14.A (a word's blank, not a Key's).
  { id: 'seal-14-4', w: 14, o: 3, where: 'The square gallery, under the line above the mule-shoe’s stone', stretch: 'st-square', beat: 'b-14.3',
    carries: { records: ['rec-x-mule'] } },
  { id: 'seal-14-5', w: 14, o: 4, where: 'The Salt Gallery, the deep niche', stretch: 'st-salt', beat: 'b-14.4',
    carries: { records: ['rec-s9'] } },
];
