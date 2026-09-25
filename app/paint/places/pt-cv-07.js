/* SEALED (D-015). pt-cv-07, the tally, end on (camp view; the Salt Gallery of pt-b-2.A, reused): standing
   close against the left wall, looking along it. The band runs away to a point down the gallery, the tally a
   line of shadow on it; above it, near, the lone ring's one unbroken stroke catches the light. Quieter than the
   places: one form, one light (the gallery's violet, raking back along the wall from further in). */
import room from './pt-b-2.A.js';

const ZR = 3.4;
const V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-cv-07',
  name: 'The tally, end on',
  line: '',
  cam: { x: -1.42, y: 1.58, z: ZR - 1.45, pitch: -3, yaw: -9, f: .72, cx: .5, cy: .5 },
  blur: { px: 1.8, d0: 3, d1: 16, k: .85 },
  lights: [
    { p: [.9, 1.9, 11], c: V, k: 12, r: 4.5, shadow: .55 },                  /* the gallery's light, further in, raking back along the wall */
    { p: [.4, 1.6, 34], c: V, k: 22, r: 9 },                                 /* far down the gallery */
    { p: [-1.74, 1.78, ZR + .15], c: V, k: .5, r: .17, shadow: 1 },           /* the same light, catching the ring first */
    { p: [0, 1.6, -5], c: [.3, .28, .66], k: .35, r: 3 },                    /* faint fill from behind */
  ],
  anchors: {
    glints: [[-1.95, 1.95, ZR + .9], [-1.93, 1.9, ZR + 2.3], [-1.94, 1.1, ZR + 4.4], [-1.95, 2.1, ZR + 1.2]].map(p => ({ p })),
    fog: [{ p: [-.5, .25, ZR + 6], w: 1.4, h: .18, a: .14 }],
  },
  live: { motes: 'violet', fog: 'low' },
};
