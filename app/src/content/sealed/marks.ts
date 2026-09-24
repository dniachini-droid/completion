/**
 * SEALED (D-015): story content. Never shown to Dan outside the game.
 * Transcribed from docs/narrative/sealed/MVP_CONTENT.md §6 (the marks guessed and recognised in the six weeks and the
 * run-ahead) and SCRIPT.md §3 (elements) and §6 (the arrival schedule); those files are authoritative.
 *
 * The first nineteen entries are MVP §6's (seventeen guessed, two recognised). The rest are every other sign the records
 * use (`records.ts`), with the week SCRIPT §6 / NICHES schedules them and no candidates yet: they stay glyphs in the MVP.
 * Shapes follow the ARR voice rules (fixed names for the three hooks) and the tablets' own descriptions.
 */

import type { Mark } from '../../core/story-types';

export const marks: Mark[] = [
  // ——— MVP §6: guessed ———
  {
    id: 'mk-lamp', sign: 'LAMP', w: 1, elements: ['fork', 'cup'], shape: 'two cuts from a point, inside a cup',
    guessAt: 'b-1.3', context: 'a carved lamp', candidates: ['lamp', 'cup', 'hand', 'fire'], right: ['lamp'],
    tempting: 'cup', confirmedBy: 'b-3.A', struck: 'Not a cup. A cup with fire in it.',
  },
  {
    // NOTE: confirmed at b-3.A, then again at b-3.1 (the flame's mark and the hook-and-drop in one cell).
    id: 'mk-fire', sign: 'FIRE', w: 1, elements: ['fork'], shape: 'two cuts diverging from a point',
    guessAt: 'b-1.4', context: 'a carved flame', candidates: ['fire', 'light', 'sun', 'fork'], right: ['fire'],
    tempting: 'light', confirmedBy: 'b-3.A', struck: "That's the flame's own mark: the flame itself.",
  },
  {
    // NOTE: give, send and answer are all provisionally right until month 9 (SCRIPT §7.6); only "open" is struck, at b-5.3.
    // `confirmedBy` is that striking beat, not a confirmation of the true sense.
    id: 'mk-give', sign: 'GIVE', w: 2, elements: ['hook-open', 'drop-leaving'], shape: 'a hook, and a drop leaving it',
    guessAt: 'b-2.2', context: 'the lintel, beside the flame\'s mark; her box sheet has only a question mark',
    candidates: ['give', 'send', 'answer', 'open'], right: ['give', 'send', 'answer'],
    tempting: 'open', confirmedBy: 'b-5.3',
    struck: 'Not open. Here it stands with the lamp\'s mark and the flame\'s, and there is no door near it.',
  },
  {
    id: 'mk-person', sign: 'PERSON', w: 2, elements: ['drop', 'bar'], shape: 'a drop standing on a bar',
    guessAt: 'seal-2-1', context: 'her box sheet: someone', candidates: ['person', 'someone', 'stranger', 'standing'],
    right: ['person', 'someone'], tempting: 'stranger', confirmedBy: 'b-3.1', struck: 'Not just a stranger. Anyone at all who stands.',
  },
  {
    id: 'mk-one', sign: 'ONE', w: 2, elements: ['drop'], shape: 'a single drop',
    guessAt: 'seal-2-1', context: 'her box sheet: one', candidates: ['one', 'the first', 'a drop', 'small'],
    right: ['one', 'the first'], tempting: 'a drop', confirmedBy: 'b-8.1', struck: "A drop, yes, but it's counting. One.",
  },
  {
    id: 'mk-me', sign: 'ME', w: 2, elements: ['drop', 'hook-small-foot'], shape: 'a drop with a small hook at its foot',
    guessAt: 'seal-2-1', context: 'her box sheet: me', candidates: ['me', 'you', 'mine', 'here'], right: ['me'],
    tempting: 'you', confirmedBy: 'b-3.1', struck: "It's whoever is doing the talking.",
  },
  {
    // NOTE: confirmed the morning after b-3.B (S1 re-rendered); the id follows MVP §0.1's `b-wN.morning` form.
    id: 'mk-here', sign: 'HERE', w: 3, elements: ['bar'], shape: 'a bar',
    guessAt: 'seal-3-1', context: 'a carved bar', candidates: ['here', 'floor', 'ground', 'place'], right: ['here', 'place'],
    tempting: 'floor', confirmedBy: 'b-w3.morning', struck: 'It means where you are. Here.',
  },
  {
    id: 'mk-door', sign: 'DOOR', w: 3, elements: ['bar', 'drop', 'drop'], shape: 'two drops under a bar',
    guessAt: 'b-3.B', context: 'a carved doorway', candidates: ['door', 'lintel', 'gate', 'arch'], right: ['door'],
    tempting: 'lintel', confirmedBy: 'b-w3.morning', struck: 'Not the lintel. All of it: a door.',
  },
  {
    id: 'mk-deep', sign: 'DEEP', w: 4, elements: ['wedge'], shape: 'a wedge',
    guessAt: 'b-4.2', context: 'a carved well', candidates: ['deep', 'down', 'well', 'water'], right: ['deep', 'down'],
    tempting: 'well', confirmedBy: 'b-w4.morning', struck: "The well was only the picture. It's how far down.",
  },
  {
    // NOTE: confirmed at b-5.A (every record opens with it) and by K1 ("Lit.").
    id: 'mk-once', sign: 'ONCE', w: 5, elements: ['bar', 'tick-left'], shape: 'a bar with a tick',
    guessAt: 'b-5.1', context: 'a setting sun', candidates: ['once', 'evening', 'over', 'end'], right: ['once'],
    tempting: 'evening', confirmedBy: 'b-5.A', struck: "Something that's over, not the evening.",
  },
  {
    // NOTE: the true candidate is "way" (SCRIPT §3: PATH / WAY).
    id: 'mk-path', sign: 'PATH', w: 5, elements: ['bar', 'drop-near-end'], shape: 'a bar with a drop',
    guessAt: 'b-5.1', context: 'a road', candidates: ['way', 'road', 'line', 'floor'], right: ['way'],
    tempting: 'road', confirmedBy: 'b-7.A', struck: 'Not only a road. Any way at all.',
  },
  {
    id: 'mk-go', sign: 'GO', w: 5, elements: ['bar', 'drop-far-end'], shape: 'the bar with its drop at the far end',
    guessAt: 'b-5.1', context: 'the same bar, its drop at the far end', candidates: ['go', 'leave', 'arrive', 'walk'],
    right: ['go', 'leave'], tempting: 'arrive', confirmedBy: 'b-w5.morning', struck: "The drop's at the far end: leaving, not arriving.",
  },
  {
    id: 'mk-open', sign: 'OPEN', w: 6, elements: ['drop-parted', 'drop-parted'], shape: 'two drops parted',
    guessAt: 'b-6.2', context: 'a doorway', candidates: ['open', 'gap', 'two', 'apart'], right: ['open'],
    tempting: 'two', confirmedBy: 'b-7.A', struck: 'Not two. A door with its lintel gone: open.',
  },
  {
    // NOTE: confirmed the week's morning (S2 re-rendered), then by S6 at b-7.2.
    id: 'mk-eat', sign: 'EAT', w: 6, elements: ['hook-closing', 'drop', 'bar'], shape: 'a hook closed on a drop, over a bar',
    guessAt: 'b-6.2', context: 'a loaf', candidates: ['eat', 'bread', 'take', 'food'], right: ['eat'],
    tempting: 'bread', confirmedBy: 'b-w6.morning', struck: "The loaf's the picture. The mark is what you do with it.",
  },
  {
    id: 'mk-up', sign: 'UP', w: 7, elements: ['wedge-inverted'], shape: 'an inverted wedge',
    guessAt: 'b-7.1', context: 'the sky', candidates: ['up', 'out', 'sky', 'roof'], right: ['up', 'out'],
    tempting: 'sky', confirmedBy: 'b-7.2', struck: 'Not the sky. Which way: up, and out.',
  },
  {
    // NOTE: confirmed in week 13 by the word MOVE-STONE; that beat is outside the MVP, so the word id stands in for it.
    id: 'mk-stone', sign: 'STONE', w: 7, elements: ['wedge', 'bar'], shape: 'a wedge on a bar',
    guessAt: 'b-7.1', context: 'a block', candidates: ['stone', 'wall', 'block', 'hill'], right: ['stone'],
    tempting: 'wall', confirmedBy: 'wd-move-stone', struck: 'Not the wall. What the wall is made of.',
  },
  {
    id: 'mk-child', sign: 'CHILD', w: 7, elements: ['drop-small', 'bar-small'], shape: 'a small drop standing on a small bar',
    guessAt: 'b-7.1', context: "a child's tablet", candidates: ['child', 'boy', 'small', 'pupil'], right: ['child'],
    tempting: 'boy', confirmedBy: 'b-7.2', struck: 'Not only a boy. Any child.',
  },

  // ——— MVP §6: recognised, not guessed ———
  { id: 'mk-ring', sign: 'RING', w: 1, elements: ['ring'], shape: 'a ring', recognised: true },
  { id: 'mk-hand', sign: 'HAND-MARK', w: 4, elements: ['hook-closed', 'dot'], shape: 'a hook closed on a dot', recognised: true },

  // ——— Signs the records use that stay glyphs in the MVP (SCRIPT §6; NICHES for the weeks) ———
  { id: 'mk-number', sign: 'NUMBERS', w: 8, elements: ['strokes', 'bar', 'wedge'], shape: 'strokes in a row, then a bar, then a wedge' },
  { id: 'mk-two', sign: 'TWO', w: 8, elements: ['stroke', 'stroke'], shape: 'two strokes' },
  { id: 'mk-three', sign: 'THREE', w: 8, elements: ['stroke', 'stroke', 'stroke'], shape: 'three strokes' },
  { id: 'mk-four', sign: 'FOUR', w: 8, elements: ['stroke', 'stroke', 'stroke', 'stroke'], shape: 'four strokes' },
  { id: 'mk-see', sign: 'SEE', w: 8, elements: ['diamond'], shape: 'a diamond' },
  { id: 'mk-count', sign: 'COUNT', w: 8, elements: ['strokes'], shape: 'strokes in a row' },
  { id: 'mk-day', sign: 'DAY', w: 8, elements: ['fork', 'wedge-inverted'], shape: 'an inverted wedge with a fork above it' },
  { id: 'mk-not', sign: 'NOT', w: 9, elements: ['cross'], shape: 'a cross' },
  { id: 'mk-move', sign: 'MOVE', w: 10, elements: ['drop', 'bar-rising'], shape: 'a drop with a rising bar' },
  { id: 'mk-water', sign: 'WATER', w: 10, elements: ['bar-short', 'bar-short', 'bar-short'], shape: 'three short bars' },
  { id: 'mk-voice', sign: 'VOICE', w: 11, elements: ['fork-sideways'], shape: 'a fork open sideways' },
  { id: 'mk-sleep', sign: 'SLEEP', w: 11, elements: ['bar', 'bar'], shape: 'a bar over a bar' },
  { id: 'mk-take', sign: 'TAKE', w: 12, elements: ['hook-closing', 'drop-entering'], shape: 'a hook closing on a drop' },
  // NOTE: the HAND sign (a plain hook) needs its own id: `mk-hand` is MVP §6's recognised hand-mark.
  { id: 'mk-hand-sign', sign: 'HAND', w: 12, elements: ['hook'], shape: 'a plain hook' },
  { id: 'mk-good', sign: 'GOOD', w: 12, elements: ['bar', 'drop', 'bar'], shape: 'a full cell: a bar, a drop, a bar' },
  { id: 'mk-mark', sign: 'MARK', w: 13, elements: ['cell-divided'], shape: 'a cell divided by one cut' },
  { id: 'mk-make', sign: 'MAKE', w: 15, elements: ['hook', 'cell-divided'], shape: 'a hook beside a divided cell' },
  { id: 'mk-read', sign: 'READ', w: 15, elements: ['diamond', 'cell-divided'], shape: 'a diamond beside a divided cell' },
  { id: 'mk-of', sign: 'OF', w: 16, elements: ['hook-small'], shape: 'a small hook linking two marks' },
  { id: 'mk-all', sign: 'ALL', w: 16, elements: ['drop', 'drop', 'drop'], shape: 'three drops' },
  // NOTE: HOME is compositional (PLACE + OF + ONE); SCRIPT puts it in month 4 with OF, so week 16.
  { id: 'mk-home', sign: 'HOME', w: 16, elements: ['bar', 'hook-small', 'drop'], shape: 'a bar, a small hook, a drop' },
  { id: 'mk-ask', sign: 'ASK', w: 17, elements: ['cell-open', 'hook-open', 'drop-leaving'], shape: 'an open cell beside the hook and the drop' },
  { id: 'mk-question', sign: 'QUESTION', w: 20, elements: ['cell-open'], shape: 'a cell with a cut that does not close' },
  { id: 'mk-again', sign: 'AGAIN', w: 20, elements: ['bar-doubling-back'], shape: 'a path doubling back' },
  { id: 'mk-keep', sign: 'KEEP', w: 22, elements: ['hook-closed', 'drop-inside'], shape: 'a hook closed round a drop' },
  { id: 'mk-shut', sign: 'SHUT', w: 23, elements: ['cross', 'bar', 'drop', 'drop'], shape: 'a cross over a doorway' },
  { id: 'mk-toward', sign: 'TOWARD', w: 24, elements: ['drop-pointed'], shape: 'a pointed drop' },
  { id: 'mk-name', sign: 'NAME', w: 30, elements: ['ring', 'cell-divided'], shape: 'a ring beside a divided cell' },
  // NOTE: ONE-WHO arrives in month 9 (REVELATION_MAP: the rule-stone, week 36).
  { id: 'mk-one-who', sign: 'ONE-WHO', w: 36, elements: ['drop', 'bar'], shape: 'a drop on a bar, under another mark' },
];
