/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §4 and §8.2, LIVES.md §1–§3, §6, §8, §12, NICHES.md weeks 1–7
 * and ARRIVALS_REGION1/2 (the partial renderings); those files are authoritative.
 *
 * A cut record is its sign string, one token per sign in the order cut, each sign carrying the English it renders as
 * in this record (LIVES §0.1; SCRIPT §8.2). Lines are the sign groups (the `·` of the notation); the formula at the
 * head and the closing tag are their own lines. With every sign held, the tokens joined read close to `full`; with the
 * week's signs held they reproduce the partial renderings quoted in ARR1/ARR2 and NICHES.
 *
 * Conventions:
 * - The reader-number in a formula head and a told line's opener renders as the numeral's plain English ("one",
 *   "two"), as the partial renderings quote it (`Once, [ring] one`); the authored full renderings say "the first".
 * - FIRE-GIVE (the first word) is two tokens: FIRE "fire", GIVE "lit" (or "given"), so the pair reads "fire lit".
 * - Numbers are number-bundle signs (`mk-number`, week 8) or the small numerals (`mk-two`, `mk-three`, `mk-four`).
 * - The Custodian's hand-mark is `{ hand: 'his' }`; told lines end with it on a line of its own.
 * - `full` is the authored rendering; the closing tag (MAKE {h} VOICE OF N AGAIN) is omitted from it, as LIVES does,
 *   except for V2, whose authored rendering includes it.
 */

import type { RecordFragment, Token } from '../../core/story-types';

const s = (sign: string, en: string): Token => ({ s: 'mk-' + sign, en });
const p = (x: string): Token => ({ p: x });
const pic = (x: string): Token => ({ pic: x });
const HIS: Token = { hand: 'his' };
const HERS: Token = { hand: 'hers' };
/** The Surveyor's own hook (V4), and a maker's hook (the Reading Room's tablet, B0): neither the tally's nor hers. */
const SURVEYOR: Token = { hand: 'surveyor' };
const MAKER: Token = { hand: 'maker' };
/** His own name-ring, KEEP-ONE: readable once KEEP and ONE are held. */
const KEEP_ONE: Token = { ring: 'keep-one', s: ['mk-keep', 'mk-one'] };
/** The Salt-Cutter's wife's ring. NOTE: `s` here is the sign that makes the ring readable (NAME, week 30), not signs inside it. */
const ASHTI: Token = { ring: 'ashti', en: 'Ashti', s: ['mk-name'] };
/** The overseer's ring (V-records): texture, never given a name in the canon, so it stays a ring. */
const OVERSEER: Token = { ring: 'overseer' };

/** The formula at the head of every transcription: ONCE ring(KEEP-ONE) N. */
const head = (n: 'one' | 'two'): Token[] => [s('once', 'Once'), p(','), KEEP_ONE, s(n, n), p('.')];
/** The closing tag: MAKE {h} VOICE OF N AGAIN (NOT). */
const tail = (n: 'one' | 'two', cameBack: boolean): Token[] => [
  s('make', 'Cut by'), HIS, p(','), s('voice', 'from the voice'), s('of', 'of'),
  s(n, n === 'one' ? 'the first' : 'the second'), p(';'), s('again', 'came again'),
  ...(cameBack ? [] : [s('not', 'not')]), p('.'),
];
/** A told line's opener: VOICE OF N: */
const told = (n: 'one' | 'two'): Token[] => [s('voice', 'Told'), s('of', 'by'), s(n, n), p(':')];

export const records: RecordFragment[] = [
  // ——— Week 1 ———
  {
    id: 'rec-l1', life: 'L', kind: 'cut', where: 'the wall by the lamp', w: 1,
    firstShown: ['b-1.A', 'b-1.3', 'b-1.4'],
    cut: [
      [pic('a lamp'), s('lamp', 'lamp')],
      [pic('a flame'), s('fire', 'fire')],
      // NOTE: the rod-shaped blank between the two marks is not a carved picture; carried as `pic` so it shows in brackets.
      [s('fire', 'fire'), pic('a blank'), s('give', 'lit')],
      [s('fire', 'Fire'), s('give', 'lit'), s('once', 'once'), KEEP_ONE, s('toward', 'for'), s('me', 'me'), p('.')],
      [s('fire', 'Fire'), s('give', 'lit'), s('me', 'by me'), s('toward', 'for'), s('one-who', 'the one who'), s('again', 'returns'), p('.')],
      [s('read', 'Read'), s('all', 'all'), p('.')],
      [s('toward', 'Then'), s('make', 'cut'), p('.'), HERS],
    ],
    // NOTE: LIVES authors the rendering of the last line only; the first three lines are the lesson (lamp, fire, the first word with its blank).
    full: 'He lit it for me. I have lit it for you, the one who returns. Read all of it. Then cut.',
  },
  {
    id: 'rec-l2', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 1, firstShown: ['b-1.C'],
    paper: [
      "Day 1. Down the ventilation shaft at 07:40, the padlock cut with the bolt-cutters I told the hardware man were for a gate. Eleven metres of ladder, then a dry passage cut dead straight. Not a railway tunnel. A lamp on a ledge, clay, lit. *Lit.* I stood there for a stupid amount of time. There's a tally cut in the salt wall by the old crack. I know a few marks from the log. It starts with a name.",
    ],
  },
  {
    id: 'rec-s1', life: 'S', kind: 'cut', where: 'along the Salt Gallery wall, beside the split', w: 1, firstShown: ['b-1.5'],
    cut: [
      head('one'),
      [s('stone', 'The stone'), s('up', 'of the hill'), s('move', 'moved'), s('once', 'once'), p('.')],
      [pic('the salt face'), s('open', 'opened'), p('.')],
      [s('path', 'A way'), p(','), s('deep', 'deep'), p(','), s('make', 'cut'), s('once', 'once'), p(';')],
      [s('water', 'by water'), s('not', 'not'), p(';')],
      [s('person', 'by person'), s('all', 'all'), s('not', 'not'), p('.')],
      // NOTE: beside HAND ONE the transcriber's numeral is cut (| 5, five strokes); the record view shows it beside the line, not in the rendering.
      [s('lamp', 'Lamp'), p(';'), pic('oil'), p(','), s('hand-sign', 'hand'), s('one', 'one'), p('.')],
      [s('go', 'Went'), s('deep', 'deep'), p('.')],
      [s('fire', 'Fire'), s('give', 'lit'), s('once', 'once'), s('here', 'here'), p(','), s('person', 'by some'), s('one', 'one'), p('.')],
      tail('one', true),
    ],
    sheet: 'hill… [stone moved]… opened… way… cut… lamp… went in… light …?… someone.',
    full: 'Once, the first. The hill\'s stone moved. The salt face opened. A way, deep, cut; not by water; not by us. Lamp; oil, one hand. Went in. Light had been given here, by someone.',
  },
  {
    id: 'rec-k1', life: 'K', kind: 'cut', where: "the base of the lamp on the ledge", w: 1, firstShown: ['b-1.A', 'b-3.3'],
    cut: [[s('fire', 'Fire'), s('give', 'lit'), s('once', 'once'), p('.'), HIS]],
    full: 'Lit.',
  },
  {
    id: 'rec-x-pick', life: 'X', kind: 'cut', where: 'the Salt Gallery, the pick niche', w: 1, firstShown: ['seal-1-2'],
    cut: [
      [...told('one'), pic('a pick'), s('of', 'of'), s('me', 'me'), p(';'), s('hand-sign', 'hand'), pic('a cord'), s('make', 'wound'), p(','), pic('a father'), p('.')],
      [HIS],
    ],
    full: 'Told: my pick. The handle my father wound.',
  },

  // ——— Week 2 ———
  {
    id: 'rec-s2', life: 'S', kind: 'cut', where: 'the Salt Gallery, further in, under the lone ring', w: 2, firstShown: ['b-2.A'],
    cut: [
      head('one'),
      [s('person', 'Stood'), s('one', 'one'), s('here', 'where'), s('path', 'the way'), pic('turns'), p(':')],
      [s('person', 'a person'), s('two', 'two'), s('me', 'of me'), p('and'), pic('a lamb'), p('.')],
      [s('hand-sign', 'On the hand'), s('four', 'four'), p(','), pic('a wading bird'), p('.')],
      [s('give', 'I gave'), pic('bread'), p('and'), pic('salt'), p('.')],
      [s('eat', 'Ate'), s('not', 'not'), p('.')],
      [s('voice', 'His voice'), s('give', 'gave'), p(':'), s('lamp', 'lamp'), p(','), s('good', 'good'), p('.')],
      [ASHTI, s('make', 'cut'), s('once', 'once'), p('.')],
      tail('one', true),
    ],
    sheet: 'one stood… way… two of me… hand four… …?… he ate… lamp… cut… [name].',
    full: 'Once, the first. One stood where the way turns: two of me and [a lamb]. Four on the hand, [a wading bird]. I gave [bread] and [salt]. Ate not. Said: lamp, good. He cut her name.',
  },
  {
    id: 'rec-l3', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 2, firstShown: ['b-2.3'],
    paper: [
      'Day 3. He was standing where the corridor turns. I took him for a pillar. Then the pillar said good morning in an accent I couldn’t place and I sat down on the floor. He waited. He did not shift his weight once, and I was down there a while. I asked what he was. He said a word in *their* language and then, in English: you will read it. Then he asked if he could write me down.',
    ],
  },
  {
    id: 'rec-x-daughter', life: 'X', kind: 'cut', where: "the Salt Gallery, the tally-stick’s niche", w: 2, firstShown: ['b-2.4', 'seal-2-2'],
    cut: [
      [s('voice', 'The voice of'), s('child', 'the child'), p(':'), pic('a father'), s('count', 'counts'), p(','), s('day', 'day'), s('not', 'not'), p(';'),
        s('four', 'four'), s('four', 'four'), p(';'), pic('an owl'), s('hand-sign', 'hand'), p('.')],
      [HIS],
    ],
    // NOTE: ARR1 2.4 / NICHES 2.2 render "four four" at week 2, before the numbers (week 8); every other partial leaves numbers unheld until week 8.
    full: "The child's voice: father counts at night; four and four; the owl's feet.",
  },
  {
    id: 'rec-x-comb', life: 'X', kind: 'cut', where: 'the Salt Gallery, a crack above the lone ring', w: 2, firstShown: ['seal-2-3'],
    cut: [
      [pic('a comb'), s('of', 'of'), ASHTI, p('.')],
      [s('me', 'I'), s('ask', 'asked'), s('not', 'not'), p('.')],
      [s('one', 'He'), s('give', 'left'), s('once', 'once'), s('here', 'here'), p(';'), s('deep', 'under'), { ring: 'ashti', en: 'the ring', s: ['mk-name'] }, p('.')],
      [HIS],
    ],
    full: 'Hers. I asked not for it. He left it under the ring.',
  },
  {
    id: 'rec-l4', life: 'L', kind: 'cut', where: "the rod’s handle, and the shelf beneath it in the Box Room", w: 2, firstShown: ['b-2.B'],
    cut: [
      [s('toward', 'For'), s('one-who', 'the one who'), s('again', 'returns'), p(':')],
      [s('make', 'cut'), s('mark', 'the marks'), s('two', 'two'), s('door', 'by the door'), s('here', 'here'), p('.'), HERS],
    ],
    // NOTE: L4 is both cut (the handle) and paper (the pencil line under the shelf, read at once); the pencil is carried in `paper`.
    paper: ["For the next one. Cut the two marks on the lintel. Don’t be precious about it."],
    full: 'For the one who returns: cut the two marks by the door.',
  },

  // ——— Week 3 ———
  {
    id: 'rec-s3', life: 'S', kind: 'cut', where: 'the Salt Gallery, the tally further on', w: 3, firstShown: ['b-3.1'],
    cut: [
      head('one'),
      [s('hand-sign', 'The hand'), s('of', 'of'), s('one', 'him'), s('up', 'over'), s('hand-sign', 'the hand'), s('of', 'of'), s('me', 'me'), p('.')],
      [s('make', 'We cut'), s('mark', 'marks'), s('two', 'two'), s('door', 'by the door'), s('here', 'here'), p('.')],
      // NOTE: beside the final HAND the transcriber's numeral is cut (| 5); shown beside the line, not in the rendering.
      [s('lamp', 'The lamps'), s('all', 'all'), s('fire', 'fire'), s('give', 'lit'), p(':'), s('one', 'one'), p(','), s('one', 'one'), p(','), s('one', 'one'), p(','), s('hand-sign', 'a hand'), p(';')],
      [s('count', 'counting'), s('not', 'not'), p('.')],
      [s('me', 'I'), pic('a figure sitting'), p('.')],
      [s('water', 'Water'), s('see', 'from my eyes'), p('.')],
      [s('person', 'Stood'), s('one', 'he'), s('here', 'here'), p(','), s('count', 'and counted'), p('.')],
      tail('one', true),
    ],
    full: 'Once, the first. His hand over my hand. We cut two marks by the door. The lamps took fire: one, one, one, a hand; then past counting. I sat. Water from my eyes. He stood and counted.',
  },
  {
    id: 'rec-l5', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 3, firstShown: ['b-3.2'],
    paper: [
      'Day 6. It works. IT WORKS. The lamps in the wall-cups went down the hall like a fuse. I cut two marks in a lintel with the rod he gave me (my pillar from Day 3), which is a stone pencil, basically, and a door opened where there was stone. Note to self: when I record today, don\'t cry on the tape. Note to self: the tape recorder is dying; batteries. I am going to have to write on the walls like everybody else.',
    ],
  },
  {
    id: 'rec-x-cord', life: 'X', kind: 'cut', where: "the Stair’s first turn, a recess", w: 3, firstShown: ['seal-3-3'],
    cut: [
      [pic('a cord'), s('of', 'of'), s('two', 'the second'), p('.')],
      [s('here', 'Here'), s('once', 'once'), p(';'), s('two', 'he'), s('toward', 'toward it'), s('again', 'came back'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: "The second's cord. Dropped here; he came not back for it.",
  },

  // ——— Week 4 ———
  {
    id: 'rec-s4', life: 'S', kind: 'cut', where: 'the Salt Gallery, past the lone ring, to where the crust was', w: 4, firstShown: ['b-4.A'],
    cut: [
      head('one'),
      [s('me', 'I'), s('go', 'go'), s('home', 'home'), p(';')],
      [s('child', 'the child'), s('of', 'of'), s('me', 'me'), s('one', 'alone'), p('.')],
      [s('keep', 'He kept'), s('me', 'me'), s('not', 'not'), p('.')],
      [s('voice', 'His voice'), s('give', 'gave'), p(':'), s('go', 'go'), p('.')],
      [s('ask', 'He asked for'), s('lamp', 'the lamp'), p(':'), s('toward', 'for'), s('one', 'the one who'), s('again', 'comes again'), p('.')],
      [s('give', 'I gave'), s('lamp', 'the lamp'), p('.')],
      [s('go', 'Went'), s('up', 'up'), s('path', 'the way'), pic('salt'), p(','), s('fire', 'fire'), s('not', 'not'), p(','), s('hand-sign', 'hand'), s('stone', 'on stone'), p('.')],
      [s('stone', 'Stones'), s('all', 'all'), p('in'), pic('the crack'), p(','), pic('salt'), p('.')],
      [s('voice', 'Voice'), s('give', 'given'), s('not', 'not'), p(';'), s('child', 'the child'), s('one', 'only'), p('.')],
      tail('one', true),
    ],
    sheet: '…go home… he held me… go… lamp… gave… went up… salt… stones…',
    full: 'Once, the first. I go home; my child is alone. He kept me not. He said: go. He asked for the lamp: for the one who comes again. I gave it. Up the salt way, no fire, hand on stone. Stones in the crack, salt over. Told no one but her.',
  },
  {
    id: 'rec-l6', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 4, firstShown: ['b-4.3'],
    paper: [
      "Day 9. Went down to the second flight of the stair. The little door there is open. Beyond it, more stair. I'm not going down yet. Rule: go up every night. I am a rational adult. The lamp's base has three marks: two I know, and a third I don't have. Also: he has never once asked me for anything.",
    ],
  },
  {
    id: 'rec-x-neighbour', life: 'X', kind: 'cut', where: 'a niche past the split, beside the salt block', w: 3, firstShown: ['b-4.B', 'seal-4-2'],
    cut: [
      [s('voice', 'Told'), p(':'), s('see', 'found'), pic('a salt face'), pic('a crack'), s('up', 'out'), p(';'), s('give', 'give'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: 'Told: found in the face past the split; not for sale.',
  },
  {
    id: 'rec-x-colleague', life: 'X', kind: 'paper', where: 'a printed email from the recess above the cot, kept in her folder', w: 3, firstShown: ['seal-4-3'],
    paper: [
      'To: I. Halloran',
      "Come home. Nobody's going to fund this. The department's asked where you are.",
    ],
  },
  {
    id: 'rec-x-sheep', life: 'X', kind: 'cut', where: 'the Salt Gallery, a hollow in the salt', w: 3, firstShown: ['seal-4-5'],
    cut: [
      [...told('one'), pic('a sheep'), s('of', 'of'), s('child', 'the child'), s('of', 'of'), s('me', 'me'), p(';'),
        s('child', 'the child'), s('give', 'gave'), s('once', 'once'), s('here', 'here'), s('toward', 'for'), pic('an owl'), p('.')],
      [HIS],
    ],
    full: "Told: my child's. She left it for the [owl].",
  },
  {
    // NOTE: MVP §4 gives w as 3–5 (b-3.4 on a High day, else b-5.0); `w` is the earliest.
    // NOTE: a ring and a hand-mark only; readable month 8 as a Builder's name, whose rendering is not yet authored, so no `full`.
    id: 'rec-k2', life: 'K', kind: 'cut', where: 'the second flight, one ring cut sharp among the worn ones', w: 3, firstShown: ['b-3.4', 'b-5.0'],
    cut: [[{ ring: 'builder', s: ['mk-name'] }, HIS]],
  },

  // ——— Week 5 ———
  {
    id: 'rec-s5', life: 'S', kind: 'cut', where: 'the Salt Gallery, the stretch that lay under the crust', w: 5, firstShown: ['b-5.3'],
    cut: [
      head('one'),
      [s('one', 'He'), s('give', 'gave'), s('see', 'to see'), p(':'), s('lamp', 'the lamp'), s('mark', 'mark'), p(','), s('fire', 'the fire'), s('mark', 'mark'), p(','), s('give', 'the giving'), s('mark', 'mark'), p(':')],
      [s('three', 'three'), s('one', 'as one'), p(':'), s('voice', 'a saying'), p(';')],
      [s('voice', 'a saying'), p(':'), s('make', 'a doing'), s('here', 'here'), p('.')],
      [s('voice', 'Sayings'), s('all', 'all'), s('count', 'counted'), s('not', 'not'), p(','), pic('sheep'), s('up', 'on the hill'), p('.')],
      [s('one', 'The first'), p(':'), s('fire', 'fire'), s('give', 'lit'), p(','), s('all', 'always'), p('.')],
      [s('ask', 'He asked'), s('question', 'why'), p('.')],
      [s('me', 'I'), p(':'), s('deep', 'deep'), p(','), s('fire', 'fire'), s('not', 'not'), p('.')],
      tail('one', true),
    ],
    full: 'Once, the first. He showed the lamp-mark, the fire-mark, the giving-mark: three as one is a saying; a saying is a doing, here. Sayings past counting, more than [sheep] on the hill. The first is always light. He asked why. I said: it is dark.',
  },
  {
    id: 'rec-l7', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 5, firstShown: ['b-5.2'],
    paper: [
      'Day 14. He was reading the salt wall when I came in, with his hands flat on it, at a height where I would want a ladder. He answers what you ask and not one word past it. I asked who cut the records on the walls. Same as on Day 3: a word in their language, then "you will read it". I asked what his ring says, the carved one. Same. He let me call the salt tally a "poem" for a week without a flicker, and he has the manner of someone who has been here longer than the lease, so I\'m calling him the Tenant until I know better. He let me.',
    ],
  },
  {
    id: 'rec-x-wax', life: 'X', kind: 'cut', where: "the Stair, the gap’s sill", w: 5, firstShown: ['seal-5-3'],
    cut: [
      [...told('two'), pic('a stylus'), s('of', 'of'), s('child', 'the child'), p('.')],
      [s('child', 'The child'), s('make', 'cut'), s('mark', 'the marks'), s('again', 'again'), s('here', 'here'), p(','), pic('a gap'), p('.')],
      [HIS],
    ],
    full: "Told: the child's. He cut the marks again here, through [the gap].",
  },
  {
    id: 'rec-x-hers-again', life: 'X', kind: 'cut', where: "the Lamp Hall, the ledge’s underside", w: 3, firstShown: ['seal-5-5'],
    cut: [
      [ASHTI, s('again', 'again'), p('.')],
      [s('me', 'I'), s('make', 'cut'), s('here', 'here'), p(';'), s('one', 'he'), s('see', 'saw'), s('me', 'me'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: 'Hers again. I cut it here; he saw me not.',
  },
  {
    // NOTE: MVP §4 gives w as 5–6 (seen through the gap at b-5.B, read in part at b-6.A); `w` is the earliest.
    id: 'rec-v1', life: 'V', kind: 'cut', where: 'the square gallery, on the square wall', w: 5, firstShown: ['b-5.B', 'b-6.A'],
    cut: [
      head('two'),
      [s('mark', 'Marks'), s('toward', 'for'), OVERSEER, p('.')],
      [s('count', 'At'), s('number', 'two hundred and ten'), pic('paces'), s('path', 'way'), s('stone', 'of stone'), s('toward', 'toward'), s('here', 'here'), s('make', 'made'), s('once', 'once'), p(',')],
      [s('make', 'cut'), s('hand-sign', 'by hand'), s('see', 'seen'), s('not', 'not'), p(',')],
      [s('once', 'before'), s('all', 'all'), s('path', 'the road'), p('.')],
      [s('person', 'person'), s('all', 'all'), s('go', 'went'), s('deep', 'deep'), s('not', 'not'), p(';'), s('fire', 'fire'), p('.')],
      [s('one', 'One'), s('go', 'went'), s('deep', 'deep'), p('.')],
      [s('lamp', 'A lamp'), p(','), s('fire', 'fire'), s('give', 'lit'), p('.')],
      [s('person', 'One'), s('one', 'other'), p('.')],
      tail('two', false),
    ],
    full: 'Once, the second. Marks for [ring]. At two hundred and ten [paces] the tunnel met a made place, cut by no hand I know, older than the road. The men go not past the light. This one went. A lamp, lit. And one other.',
  },

  // ——— Week 6 ———
  {
    id: 'rec-l8', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 6, firstShown: ['b-6.1'],
    paper: [
      "Day 20. I've stopped going up to the surface every day. It's forty minutes each way and there's nothing up there but a field and my car, which has a note on it from the farmer. The rule (go up every night) was a good rule. I have decided it was a rule for a version of me who didn't know thirty-one signs yet. Made a wall for the next one today, by the lamp (carved one, I mean, not built one): drew a lamp like a five-year-old. Worked out more lines of the salt tally too. Whoever is telling it is a person. A *funny* person.",
    ],
  },
  {
    id: 'rec-v2', life: 'V', kind: 'cut', where: "the crew’s wall in the square gallery", w: 6, firstShown: ['b-6.B'],
    cut: [
      head('two'),
      [s('mark', 'Marks'), s('toward', 'for'), OVERSEER, p('.')],
      [s('one', 'one'), s('eat', 'ate'), s('not', 'not'), p(','), s('person', 'person'), s('all', 'all'), p(';')],
      [s('sleep', 'sleep'), s('not', 'not'), p(';'), s('person', 'person'), s('all', 'all'), s('see', 'see'), s('not', 'not'), p('.')],
      [s('voice', 'Voice'), s('of', 'of'), s('one', 'one'), p(':'), s('path', 'way'), s('stone', 'of stone'), s('good', 'good'), s('not', 'not'), p(';'), s('up', 'up'), s('person', 'person'), s('all', 'all'), s('good', 'good'), p('.')],
      [s('keep', 'Kept'), s('person', 'person'), s('all', 'all'), s('not', 'not'), p('.')],
      [s('give', 'gave'), s('see', 'to see'), s('mark', 'marks'), s('two', 'two'), p(';'), s('door', 'door'), s('open', 'open'), p('.')],
      [s('person', 'person'), s('all', 'all'), s('give', 'gave'), s('day', 'days'), p('.')],
      tail('two', false),
    ],
    sheet: '…he held us…',
    full: "Once, the second. Marks for [ring]. He eats not with us; sleeps not, that any of us saw. His voice: poor in the works' tongue, good in the hill people's. He kept us not. He showed two marks; a door opened. The men: paid to this day. Cut by [hand], from the voice of the second; came again not.",
  },
  {
    id: 'rec-x-foreman', life: 'X', kind: 'cut', where: "the crew’s wall, the niche beneath it", w: 6, firstShown: ['b-6.B', 'seal-6-2'],
    cut: [
      // NOTE: follows the week-6 partial (ARR2 6.B, NICHES 6.2: "one door here open [ ]; give person"); LIVES §12's week-9 partial reads "he … opened not; gave person".
      [s('voice', 'Told'), p(':'), s('one', 'one'), s('door', 'door'), s('here', 'here'), s('open', 'open'), s('not', 'not'), p(';'),
        s('give', 'give'), s('person', 'person'), s('all', 'all'), s('not', 'not'), p(';'), s('two', 'two'), s('up', 'up'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: 'Told: he opened not the hill; we were not paid; the second came not up.',
  },
  {
    id: 'rec-x-mule', life: 'X', kind: 'cut', where: "the square gallery, on the wall above the mule-shoe’s stone", w: 6, firstShown: ['b-6.3'],
    cut: [
      [s('voice', 'Told'), p(':'), pic('a mule'), s('go', 'went'), s('deep', 'deep'), s('not', 'not'), p(';'), s('me', 'me'), s('make', 'made'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: 'Told: the mules went not in; I made them not.',
  },
  {
    // NOTE: MVP §4 gives w as 6–7 (seen behind the crust at seal-6-1, read at b-7.2); `w` is the earliest.
    id: 'rec-s6', life: 'S', kind: 'cut', where: 'the Salt Gallery, past where the crust was', w: 7, firstShown: ['b-7.2'],
    cut: [
      head('one'),
      [s('voice', 'My voice'), s('give', 'gave'), s('child', 'child'), p(':'), s('up', 'up'), pic('a barn'), pic('an owl'), s('here', 'here'), p('.')],
      [s('of', 'Of'), s('me', 'us'), s('not', 'not'), p(';'), s('toward', 'against'), s('me', 'us'), s('not', 'not'), p('.')],
      [s('eat', 'ate'), s('not', 'not'), p(';'), s('sleep', 'slept'), s('not', 'not'), p(';'), s('count', 'counted'), p('.')],
      [s('make', 'Cut'), pic('the salt face'), pic('the crack'), s('not', 'not'), p('.')],
      [s('child', 'child'), s('ask', 'asked'), p(':'), s('count', 'counts'), s('question', 'what?')],
      [s('me', 'I'), s('ask', 'asked'), s('not', 'not'), p(';'), s('good', 'good'), s('not', 'not'), p('.')],
      tail('one', true),
    ],
    full: 'Once, the first. I told my child: the hill is [a barn] with [an owl] in it. Not ours; not against us. It eats not, sleeps not; it counts. Cut not past the split. She asked: counts what? I asked not. Not good.',
  },

  // ——— Week 7 (NICHES 7.4; not in MVP §4's table) ———
  {
    id: 'rec-x-wages', life: 'X', kind: 'cut', where: 'a cache in the square gallery wall', w: 7, firstShown: ['b-7.4', 'seal-7-4'],
    cut: [
      [s('once', 'Once'), p(','), s('two', 'the second'), s('give', 'gave'), s('me', 'me'), pic('a bag'), p(':'), s('of', 'of'), s('person', 'person'), s('number', 'twelve'), p(','), s('child', 'child'), s('one', 'one'), p(';'), s('day', 'days'), s('number', 'thirteen'), p('.')],
      [s('shut', 'Shut'), s('door', 'door'), s('once', 'once'), p(','), s('day', 'the day'), s('toward', 'came'), s('not', 'not'), p('.')],
      [s('me', 'I'), s('keep', 'kept'), p('it'), p('.')],
      [HIS],
    ],
    full: "Once, the second gave me [a bag]: the twelve's and the child's, thirteen days. The door was shut; the day came not. I kept it.",
  },

  // ——— Week 8 (ARRIVALS_REGION2 week 8; LIVES §2, §5, §12) ———
  {
    // NOTE: V4 is in the Surveyor's own hand: no formula, his own hook in the corner (C-40). LOUD stays a glyph until month 8.
    id: 'rec-v4', life: 'V', kind: 'cut', where: 'the near lip of the channel that feeds the Water, cut low', w: 8, firstShown: ['b-8.2'],
    cut: [
      [s('water', 'The water'), pic('the channel'), s('move', 'moved'), s('not', 'not'), p(';'), s('here', 'here'), p('.')],
      [pic('mules'), s('go', 'went'), s('deep', 'deep'), s('not', 'not'), p('.')],
      [s('day', 'Day'), s('three', 'three'), p('.')],
      [s('person', 'This'), s('one', 'one'), s('here', 'here'), s('count', 'counted'), pic('paces'), s('deep', 'deep'), p(':'), s('number', 'two hundred and ten'), p('.')],
      [s('voice', 'The voice'), s('of', 'of'), s('one', 'the one'), p(':')],
      [s('make', 'cut'), s('loud', 'loud'), s('once', 'once'), p(','), s('toward', 'expected'), p(';')],
      [s('make', 'cut'), s('loud', 'loud'), s('again', 'again'), p(':'), s('good', 'good'), s('not', 'not'), p('.')],
      [s('ask', 'He asked'), p(':'), s('make', 'cut'), s('not', 'not'), p('.')],
      [SURVEYOR],
    ],
    full: 'The water in the channel: moved not. Still, as a floor. The [mules] went not in. Day three. This one counted [paces] down: two hundred and ten. His voice: after a loud cut, expected; the next loud cut, worse. He asked: cut not.',
  },
  {
    id: 'rec-l9', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 8, firstShown: ['b-8.3'],
    paper: [
      "Day 26. Counting. The salt tally gives its teller's count, and beside it, cut smaller, another count. Where he says \"two hands\", the small strokes beside it say \"eight and two\". So either whoever told the salt tally learned to count in eights like the Tenant, or whoever cut his words into the salt isn't him. I know which I'd bet on, and I don't know why I mind.",
    ],
  },
  {
    // NOTE: E1 is seen at b-8.C (the book lying open below, unread) and read at b-10.2 at the ledge.
    id: 'rec-e1', life: 'E', kind: 'paper', where: 'the log on the ledge in the blast room', w: 10, firstShown: ['b-10.2'],
    paper: [
      'Log. 14th. Broke into a chamber at 61 yards. Not ours. Dry, cut true, older than the hill by the look. A tall man with a lamp asked what I was cutting. Told him a railway. He asked which way it went. Told him through. He said: everything does, here. Then he asked what the sky had sounded like the day we broke through. Told him: like a sky.',
    ],
  },

  // ——— Week 9 ———
  {
    // NOTE: B0, a lesson-tablet in a maker's hand: the same lesson as the wall by the lamp (C-43).
    id: 'rec-b0', life: 'B', kind: 'cut', where: 'the Reading Room, the nearest tablet', w: 9, firstShown: ['b-9.A'],
    cut: [
      [pic('a flame'), s('fire', 'fire')],
      [pic('a lamp'), s('lamp', 'lamp')],
      [s('fire', 'fire'), s('give', 'lit')],
      [MAKER],
    ],
    full: 'Fire. Lamp. Fire lit.',
  },
  {
    // NOTE: the Reading Room's lintel, KEEP VOICE NOT (C-42): "[ ] [ ] [ ]" in week 8, "[ ] [ ] not" from week 9, "[ ] voice not" from week 11; KEEP in month 6.
    id: 'rec-lintel', life: 'B', kind: 'cut', where: 'the lintel over the Reading Room’s inner door', w: 9, firstShown: ['b-9.A', 'seal-9-4'],
    cut: [[s('keep', 'Keep'), s('voice', 'voice'), s('not', 'not'), p('.')]],
    full: 'Keep voice-not.',
  },
  {
    id: 'rec-l10', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 9, firstShown: ['b-9.1'],
    paper: [
      'Day 28. The report on the crew\'s wall (the surveyor\'s, I think) has a little cross after "held us", and so does the salt tally after "held me". I think it\'s emphasis. He *really* held them. That\'s the kind of thing you\'d want to underline.',
    ],
  },
  {
    id: 'rec-s7', life: 'S', kind: 'cut', where: 'the Salt Gallery, the tally past the sheet dated Day 9', w: 9, firstShown: ['b-9.3'],
    cut: [
      head('one'),
      [s('me', 'I'), pic('an old man'), s('open', 'opened'), pic('the crack'), s('again', 'again'), p(','), s('lamp', 'lamp'), s('one', 'one'), p('.')],
      [s('one', 'He'), s('here', 'here'), s('again', 'again'), p(';')],
      [s('one', 'he'), s('keep', 'kept'), s('lamp', 'the lamp'), s('of', 'of'), s('me', 'me'), p(';')],
      [s('lamp', 'the lamp'), s('fire', 'fire'), s('give', 'lit'), s('once', 'once'), s('here', 'here'), p(';')],
      [s('lamp', 'the lamp'), s('make', 'made'), s('again', 'again'), p('.')],
      [s('me', 'I'), s('voice', 'said'), s('give', 'gave'), s('day', 'days'), s('all', 'all'), p(';')],
      [s('one', 'he'), s('make', 'cut'), s('mark', 'marks'), p('.')],
      [s('ask', 'I asked'), s('question', 'why'), p('.')],
      [s('voice', 'He said'), p(':'), s('toward', 'for'), s('one', 'the one who'), s('again', 'comes again'), p('.')],
      [s('ask', 'I asked'), p(':'), s('person', 'person'), s('question', 'who?')],
      [s('voice', 'He said'), p(':'), s('see', 'seen'), s('not', 'not'), p('.')],
      tail('one', true),
    ],
    full: 'Once, the first. Old, I opened the crack again, with a new lamp. He was there; he had kept my lamp; it was lit beside him, made new. I said all my days; he cut them. Why? For the one who comes again. Who? Not yet seen.',
  },
  {
    // NOTE: X-binder-child: a makers' lesson for a child; the answer is in a smaller, sharper cut under it (NICHES 8.5, moved to week 9 row 2).
    id: 'rec-x-binder-child', life: 'B', kind: 'cut', where: 'the Reading Room, a small tablet on a low bench', w: 9, firstShown: ['b-9.C'],
    cut: [
      [pic('a flame'), s('fire', 'fire')],
      [s('question', 'why?')],
      [s('deep', 'deep'), p(';'), s('fire', 'fire'), s('not', 'not'), p('.')],
    ],
    full: 'Fire. Why? Deep; fire not: because it is dark.',
  },

  // ——— Week 10 ———
  {
    id: 'rec-v5', life: 'V', kind: 'cut', where: 'the standing stone before the fall, at the square gallery’s deep end', w: 13, firstShown: ['b-10.B'],
    cut: [
      head('two'),
      [s('mark', 'Marks'), s('toward', 'for'), OVERSEER, p('.')],
      [s('voice', 'His voice'), s('of', 'of'), s('one', 'the one'), p(':'), s('see', 'seen'), p('.')],
      [s('path', 'The way'), s('deep', 'deep'), p(':'), s('number', 'thirty'), pic('paces'), s('toward', 'to'), s('stone', 'stone'), s('all', 'fallen'), p('.')],
      [s('make', 'Cut'), s('loud', 'loud'), s('one', 'once'), p(':'), s('open', 'open'), p('.')],
      [s('one', 'He'), s('ask', 'asked'), p(':'), s('keep', 'keep'), p('.')],
      [s('one', 'This one'), s('keep', 'kept'), s('day', 'days'), s('number', 'nine'), p('.')],
      [s('path', 'The way'), s('keep', 'keeps'), s('not', 'not'), p('.')],
      tail('two', false),
    ],
    full: 'Once, the second. Marks for [ring]. His warning: seen. The lower way: thirty paces past a fall. One loud cut opens it. He asked: keep. This one kept nine days. The road keeps not.',
  },
  {
    id: 'rec-l11', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 10, firstShown: ['b-10.3'],
    paper: [
      'Day 31. He speaks English like a railway timetable that nobody has updated since the railway. I asked where he learned it. He said: from the fourth. I have started to think of the Engineer as a colleague. He\'d have hated my handwriting.',
    ],
  },

  // ——— Week 11 ———
  {
    // NOTE: C1 is her margin, in ink, on the page the book lies open at (the app shows the page, in English).
    id: 'rec-c1', life: 'C', kind: 'paper', where: 'the bound book on the ledge in the blast room, its open page', w: 11, firstShown: ['b-11.A'],
    paper: [
      'In the margin: these are holy words, set down by the surveyor\'s boy without knowing, and I have put gold on them. The little cross comes after the word it undoes. Eleven times now, and never before. The fork set over a word is a rank, as of angels; I have put more gold on those. The Guest, I think, was an angel who closed the hill to keep men out. The surveyor was proud. Gold leaf: two leaves.',
    ],
  },
  {
    // NOTE: K3, KEEP ONCE and the hand-mark: "[ ] once" until KEEP (week 22), then "Kept."
    id: 'rec-k3', life: 'K', kind: 'cut', where: 'the lip of the ledge beside the book, in the blast room', w: 11, firstShown: ['b-11.A', 'b-12.3'],
    cut: [[s('keep', 'Kept'), s('once', 'once'), p('.'), HIS]],
    full: 'Kept.',
  },
  {
    id: 'rec-e2', life: 'E', kind: 'paper', where: 'the log on the ledge in the blast room', w: 11, firstShown: ['b-11.2'],
    paper: [
      'Log. 22nd. Cut the moving-mark loud with the powder-charge, twelve pounds, and the whole gallery came down as one, which no charge does. The Inspector had shown me the loud-mark on a lintel and said it was a warning. The book has it in gold as a rank. Took it for a rating. Watch stopped at the blast: 4.10.',
    ],
  },
  {
    id: 'rec-l12', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 11, firstShown: ['b-11.3'],
    paper: [
      'Day 33. The book was here, on the ledge in the blast room, open. She never came. She read a copy of a copy of a report, in a copying house, and put gold on the marks, and thought the cross was an angel\'s grammar, and he counts her anyway. Third reader, who never came. She got a number for two leaves of gold and a wrong guess about angels. I want to know what I get.',
    ],
  },
  {
    id: 'rec-x-powder-man', life: 'X', kind: 'paper', where: 'a crack in the blast room, a scrap of the company’s paper', w: 11, firstShown: ['b-11.C'],
    paper: ['Not going back down for any wage. The sky made a noise. Tell him he can keep the book.'],
  },

  // ——— Week 12 ———
  {
    id: 'rec-e3', life: 'E', kind: 'paper', where: 'the log on the ledge in the blast room', w: 12, firstShown: ['b-12.A'],
    paper: [
      'Log. 25th. Well in the village stood still three days; the keeper came up to complain. Compasses swung to the hill. A sound in the sky at dusk like a door in a very large house. The men have gone. The company has written. I am taking my meals down.',
    ],
  },
  {
    id: 'rec-x-well-keeper', life: 'X', kind: 'paper', where: 'the blast room, inside the lid of an iron-bound bucket', w: 12, firstShown: ['b-12.A'],
    paper: ['Three days still. Not low. Still. Then it came back and was cold.'],
  },
  {
    id: 'rec-l13', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 12, firstShown: ['b-12.2'],
    paper: [
      'Day 35. Note. Loud use → something. Every single time. The surveyor: water stood still. The engineer: the well, the compasses, the sound. The makers\' own record, I think, though I\'ve only got a fifth of it: "the rock went still." I\'ve made a table. I hate the table.',
    ],
  },
  {
    id: 'rec-s8', life: 'S', kind: 'cut', where: 'the Salt Gallery, the end of the tally', w: 12, firstShown: ['b-12.B'],
    cut: [
      head('one'),
      [s('sleep', 'Sleep'), s('not', 'not'), p(','), s('day', 'day'), s('not', 'not'), p('.')],
      [s('count', 'Count'), s('hand-sign', 'hand'), s('of', 'of'), s('one', 'one'), p(':'), s('four', 'four'), p(','), s('four', 'four'), p(','), pic('long'), p('.')],
      // NOTE: beside HAND HAND the transcriber's numeral is cut (8+2), as in S1 and S3.
      [s('count', 'Count'), s('lamp', 'lamp'), s('mark', 'marks'), p(':'), s('hand-sign', 'hand'), p(','), s('hand-sign', 'hand'), p(','), s('all', 'more'), p('.')],
      [s('count', 'Count'), s('child', 'child'), s('of', 'of'), s('child', 'child'), p(':'), s('three', 'three'), p('.')],
      [s('count', 'Count'), s('not', 'not'), s('day', 'days'), s('all', 'all'), s('deep', 'deep'), p(':'), s('day', 'day'), s('one', 'one'), p('.')],
      [s('day', 'Days'), s('all', 'all'), s('again', 'since'), p(':'), s('all', 'many'), p(';'), s('good', 'good'), p('.')],
      [s('see', 'Seen'), s('all', 'all'), p('.')],
      tail('one', true),
    ],
    full: 'Once, the first. Some nights, no sleep: I count his fingers, four and four, long. I count the lamp-marks: a hand, a hand, more. I count my child\'s children: three. I count not the days in the hill: one day. Days since: many. Good. All I saw.',
  },

  // ——— Week 13 ———
  {
    // NOTE: V6 is his own statement at the shut door (K-type): no closing line. MAKE, LOUD, AGAIN and SHUT unheld in week 13.
    id: 'rec-v6', life: 'V', kind: 'cut', where: 'the shut door at the end of the side gallery', w: 13, firstShown: ['b-13.A'],
    cut: [
      [s('once', 'Once'), p(','), s('two', 'the second'), p(','), s('path', 'in this side way'), s('here', 'here'), p(':')],
      [s('make', 'cut'), s('move', 'moving'), s('stone', 'stone'), s('loud', 'loud'), s('again', 'again'), p('.')],
      [s('water', 'The water'), s('move', 'moved'), s('not', 'not'), s('again', 'again'), p(';'), s('move', 'moves'), s('not', 'not'), p('.')],
      [s('me', 'I'), s('shut', 'shut'), s('door', 'the door'), p('.')],
      [s('one', 'He'), s('long-sleep', 'long-slept'), s('not', 'not'), p(','), s('me', 'when I'), s('shut', 'shut'), s('once', 'it'), p('.')],
      [s('me', 'I'), s('open', 'opened'), s('not', 'not'), s('again', 'again'), p('.')],
      [HIS],
    ],
    full: 'Once, the second, in this side way, cut the moving-word loud again. The water moved not, again; it moves not. I shut the door. He long-slept not when I shut it. I have not opened it.',
  },
  {
    id: 'rec-l14', life: 'L', kind: 'paper', where: 'her notebook, from the cot in the Box Room', w: 13, firstShown: ['b-13.2'],
    paper: [
      'Day 38. Asked him about the second reader. He answered the way he gives a measurement: eleven paces by seven, and the rest. It\'s cut on the door in the side gallery, so I don\'t need to write it. I\'ve moved the cot to the wall furthest from the stair.',
    ],
  },
  {
    id: 'tl-ledger', life: 'X', kind: 'cut', where: 'the side gallery, a recess, beside a wax tablet of days', w: 13, firstShown: ['b-13.3'],
    cut: [
      [s('voice', 'Told'), p(':'), s('child', 'the child'), s('count', 'counted'), s('day', 'the days'), p(';'), s('one', 'he'), s('again', 'came again'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: 'Told: the child counted the days; he came again not.',
  },
  {
    id: 'tl-one-stroke', life: 'X', kind: 'cut', where: 'the Reading Room, along the edge of the bench apart', w: 13, firstShown: ['b-13.C'],
    cut: [
      [s('count', 'Count'), s('again', 'again'), s('not', 'not'), p(';'), s('one', 'one'), p('.')],
      [HIS],
    ],
    full: 'Count again not; one.',
  },

  // ——— Week 14 ———
  {
    id: 'rec-e4', life: 'E', kind: 'paper', where: 'the log on the ledge in the blast room', w: 14, firstShown: ['b-14.2'],
    paper: [
      'Log. Cut the hold-mark on the roof above the props; it held. The Inspector says the mark is not "hold". Would not say what it is. Said: you will read it. A distinction for a man with no roof to lose.',
    ],
  },
  {
    id: 'rec-s9', life: 'S', kind: 'cut', where: 'the Salt Gallery, a deep niche in the salt', w: 3, firstShown: ['b-14.4'],
    cut: [
      head('one'),
      [pic('lambs'), pic('spring'), p(';'), pic('salt'), pic('summer'), p(';')],
      [pic('salt blocks'), s('go', 'go'), p('to'), pic('the valley'), p(','), s('four', 'four'), s('up', 'up'), p('on'), pic('a donkey'), p('.')],
      [s('me', 'I'), s('up', 'up'), p('on'), pic('the hill'), p(':'), pic('salt'), s('here', 'here'), p('.')],
      [s('me', 'I'), s('see', 'looked for'), s('one', 'one'), s('not', 'not'), p(';'), s('ask', 'asked'), s('not', 'not'), p('.')],
      tail('one', true),
    ],
    full: 'Once, the first. [Lambs] in [spring]; [salt] in [summer]; [blocks] to [the valley], four up on [a donkey]. I was on the hill: the salt is here. I looked for nothing; asked not.',
  },

  // ——— The told lines (MVP §8.2), carried by finds ———
  {
    id: 'tl-wick', life: 'X', kind: 'cut', where: 'a crack beside the ledge, by a burnt wick end', w: 1, firstShown: ['fd-b08'],
    cut: [
      [...told('one'), pic('a wick'), s('of', 'of'), s('lamp', 'lamp'), s('of', 'of'), s('me', 'me'), p('.')],
      [s('once', 'Once'), p('.')],
      [HIS],
    ],
    full: "Told: my lamp's [wick]. Once.",
  },
  {
    id: 'tl-wool', life: 'X', kind: 'cut', where: "the Salt Gallery’s first turn, by a knot of grey wool", w: 1, firstShown: ['fd-c02'],
    cut: [
      [...told('one'), pic('wool'), s('here', 'here'), p('.')],
      [s('me', 'I'), s('go', 'went'), s('up', 'up'), p(','), s('fire', 'fire'), s('not', 'not'), p(';'), s('hand-sign', 'hand'), s('stone', 'on stone'), p('.')],
      [HIS],
    ],
    full: 'Told: [wool], here. I went up, no fire; hand on stone.',
  },
  {
    id: 'tl-salt-cake', life: 'X', kind: 'cut', where: 'a crack in the salt, under a small salt cake', w: 2, firstShown: ['fd-c03'],
    cut: [
      [...told('one'), pic('a salt cake'), p('.')],
      [s('me', 'me'), s('give', 'gave'), p(';'), s('one', 'one'), s('take', 'took'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: 'Told: [a salt cake]. I gave it; he took it not.',
  },
  {
    id: 'tl-count', life: 'X', kind: 'cut', where: 'the Salt Gallery, beside a chip of salt scratched in fives', w: 1, firstShown: ['fd-c04'],
    cut: [
      [...told('one'), s('count', 'the count of'), pic('salt blocks'), p(':')],
      // NOTE: beside HAND HAND the transcriber's numeral is cut (8+2); the record view shows it beside the line, not in the rendering.
      [s('hand-sign', 'a hand'), p(','), s('hand-sign', 'a hand'), p('.')],
      [HIS],
    ],
    full: 'Told: the count of [salt blocks]: a hand, a hand. (beside it, in eights: 8+2)',
  },
  {
    id: 'tl-yoke', life: 'X', kind: 'cut', where: 'the Salt Gallery, beside a carrying pole laid in the salt', w: 2, firstShown: ['fd-c05'],
    cut: [
      [...told('one'), pic('a pole'), s('of', 'of'), s('me', 'me'), p('.')],
      [pic('salt blocks'), s('two', 'two'), p('.')],
      [HIS],
    ],
    full: 'Told: my [pole]. [Blocks], two.',
  },
  {
    id: 'tl-seal', life: 'X', kind: 'cut', where: "the landing’s edge, by a wax seal", w: 3, firstShown: ['fd-e02'],
    cut: [
      [...told('two'), pic('a seal'), p('.')],
      [s('mark', 'marks'), s('toward', 'for'), OVERSEER, p('.')],
      [HIS],
    ],
    full: 'Told: [a seal]; marks for [ring].',
  },
  {
    id: 'tl-lamp', life: 'X', kind: 'cut', where: 'the square gallery, a niche at head height under a patch of soot', w: 6, firstShown: ['fd-g01'],
    cut: [
      [...told('two'), s('lamp', 'lamp'), s('of', 'of'), s('person', 'person'), s('all', 'all'), p('.')],
      [s('person', 'person'), s('all', 'all'), s('go', 'went'), s('deep', 'deep'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: "Told: the men's lamp. The men went not in.",
  },
  {
    id: 'tl-sandal', life: 'X', kind: 'cut', where: 'the square gallery, against the wall by a small sandal', w: 6, firstShown: ['fd-g02'],
    cut: [
      [...told('two'), pic('a sandal'), s('of', 'of'), s('child', 'the child'), p('.')],
      [s('child', 'the child'), s('go', 'went'), s('deep', 'deep'), p(';'), s('person', 'person'), s('all', 'all'), s('not', 'not'), p('.')],
      [HIS],
    ],
    full: "Told: the child's [sandal]. The child went in; the men, not.",
  },
];
