/**
 * SEALED (D-015): the Cut's own lettering, one drawing per mark (keyed by mark id).
 * SCRIPT §2: every sign sits in a square cell and is made of straight chisel cuts; the ring is the only curve, and it
 * means a name. Each drawing is in a 40 × 40 cell, y down, straight cuts only (M and L, Z to close); `rings` are the
 * name-ring's circles. Elements keep one shape everywhere, so related marks share strokes (the bar is always ground,
 * the drop always a short upright, the hook always a cut that turns at a right angle).
 */

export interface Letter { d: string; rings?: [number, number, number][] }

/* the elements, as the marks below use them (kept here so a shape changes in one place) */
const HOOK = 'M13 32 L13 10 L26 10 L26 17';

export const lettering: Record<string, Letter> = {
  'mk-lamp': { d: 'M7 16 L11 33 L29 33 L33 16 M20 29 L20 23 M20 23 L14 11 M20 23 L26 11' },
  'mk-fire': { d: 'M20 33 L20 21 M20 21 L10 7 M20 21 L30 7' },
  'mk-give': { d: 'M10 32 L10 10 L23 10 L23 17 M31 21 L31 31' },
  'mk-person': { d: 'M20 11 L20 26 M9 31 L31 31' },
  'mk-one': { d: 'M20 12 L20 28' },
  'mk-me': { d: 'M17 9 L17 30 L25 30 L25 24' },
  'mk-here': { d: 'M8 22 L32 22' },
  'mk-door': { d: 'M8 10 L32 10 M13 14 L13 31 M27 14 L27 31' },
  'mk-deep': { d: 'M9 9 L20 31 L31 9' },
  'mk-once': { d: 'M9 25 L32 25 M9 25 L13 17' },
  'mk-path': { d: 'M7 26 L33 26 M12 13 L12 22' },
  'mk-go': { d: 'M7 26 L33 26 M31 13 L31 22' },
  'mk-open': { d: 'M9 12 L9 30 M31 12 L31 30' },
  'mk-eat': { d: 'M11 26 L11 8 L28 8 L28 20 L22 20 M19 12 L19 21 M7 31 L33 31' },
  'mk-up': { d: 'M9 31 L20 9 L31 31' },
  'mk-stone': { d: 'M10 8 L20 25 L30 8 M7 31 L33 31' },
  'mk-child': { d: 'M20 18 L20 27 M14 30 L26 30' },
  'mk-ring': { d: '', rings: [[20, 20, 12]] },
  'mk-hand': { d: 'M13 31 L13 9 L27 9 L27 23 L20 23 M19.5 15.5 L20.5 16.5' },
  /* her hand-mark, drawn in a record's corner (`{ hand: 'hers' }`): a hook with a tail (ARR1 voice rules); not a sign of the Cut */
  'mk-hand-hers': { d: 'M14 29 L14 9 L27 9 L27 17 M14 29 L8 35' },
  /* the Surveyor's own hook (V4: *a hook that is not the tally's either*): a hook crossed by a short cut */
  'mk-hand-surveyor': { d: 'M14 31 L14 9 L27 9 L27 17 M8 21 L20 21' },
  /* a maker's hook on the Reading Room's tablets: a hook with a short bar under its foot */
  'mk-hand-maker': { d: 'M15 28 L15 9 L27 9 L27 16 M9 33 L21 33' },
  'mk-number': { d: 'M5 12 L5 28 M9 12 L9 28 M13 20 L21 20 M24 12 L29 28 L34 12' },
  'mk-two': { d: 'M16 7 L16 33 M24 7 L24 33' },
  'mk-three': { d: 'M12 7 L12 33 M20 7 L20 33 M28 7 L28 33' },
  'mk-four': { d: 'M9 7 L9 33 M16.5 7 L16.5 33 M23.5 7 L23.5 33 M31 7 L31 33' },
  'mk-see': { d: 'M20 7 L33 20 L20 33 L7 20 Z' },
  'mk-count': { d: 'M8 11 L8 19 M14 11 L14 19 M20 11 L20 19 M26 11 L26 19 M32 11 L32 19 M8 27 L32 27' },
  'mk-day': { d: 'M9 33 L20 19 L31 33 M20 15 L20 11 M20 11 L15 5 M20 11 L25 5' },
  'mk-not': { d: 'M10 10 L30 30 M30 10 L10 30' },
  'mk-move': { d: 'M12 10 L12 22 M8 31 L33 19' },
  'mk-water': { d: 'M12 12 L28 12 M12 20 L28 20 M12 28 L28 28' },
  'mk-voice': { d: 'M6 20 L18 20 M18 20 L33 10 M18 20 L33 30' },
  'mk-sleep': { d: 'M8 16 L32 16 M8 26 L32 26' },
  'mk-take': { d: 'M17 31 L17 9 L30 9 L30 20 L25 20 M9 14 L9 24' },
  'mk-hand-sign': { d: HOOK },
  'mk-good': { d: 'M8 9 L32 9 M20 14 L20 26 M8 31 L32 31' },
  'mk-mark': { d: 'M8 8 L32 8 L32 32 L8 32 Z M20 8 L20 32' },
  'mk-make': { d: 'M6 32 L6 12 L13 12 L13 17 M17 12 L34 12 L34 32 L17 32 Z M25.5 12 L25.5 32' },
  'mk-read': { d: 'M11 13 L17 20 L11 27 L5 20 Z M20 11 L35 11 L35 29 L20 29 Z M27.5 11 L27.5 29' },
  'mk-of': { d: 'M16 28 L16 18 L25 18 L25 23' },
  'mk-all': { d: 'M11 15 L11 25 M20 15 L20 25 M29 15 L29 25' },
  'mk-home': { d: 'M7 31 L33 31 M13 26 L13 18 L20 18 L20 22 M28 14 L28 26' },
  'mk-ask': { d: 'M5 12 L15 12 L15 30 L5 30 L5 22 M19 30 L19 12 L28 12 L28 17 M34 20 L34 29' },
  'mk-question': { d: 'M8 8 L32 8 L32 32 L8 32 L8 20' },
  'mk-again': { d: 'M6 28 L32 28 L32 20 L14 20' },
  'mk-keep': { d: 'M11 32 L11 8 L29 8 L29 26 L17 26 M20 13 L20 21' },
  'mk-shut': { d: 'M8 9 L32 9 M12 13 L12 32 M28 13 L28 32 M15 15 L25 27 M25 15 L15 27' },
  'mk-toward': { d: 'M20 9 L20 25 M15 21 L20 31 L25 21' },
  'mk-long-sleep': { d: 'M6 13 L34 13 M6 21 L34 21 M6 29 L34 29' },
  'mk-world': { d: 'M10 25 L20 8 L30 25 M6 32 L34 32' },
  'mk-hear': { d: 'M29 10 L12 10 L12 30 L29 30' },
  'mk-loud': { d: 'M20 16 L20 11 M20 11 L13 4 M20 11 L27 4 M8 22 L32 22 L32 34 L8 34 Z' },
  'mk-name': { d: 'M21 10 L35 10 L35 30 L21 30 Z M28 10 L28 30', rings: [[11, 20, 7]] },
  'mk-one-who': { d: 'M20 7 L20 15 M13 17 L27 17 M20 21 L20 30 M12 33 L28 33' },
};

/** A partial sign (SCRIPT §8): one element, alone. */
export const parts: Record<string, Letter> = {
  hook: { d: HOOK },
  wedge: { d: 'M9 9 L20 31 L31 9' },
};
