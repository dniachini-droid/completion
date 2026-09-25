/* SEALED (D-015). pt-b-3.A, the lintel (the word), SEALED state (as the player first meets it; the open state
   and the hall's waking are the cinematic's, later). The Lamp Hall of pt-b-1.A, reused, dark: the side-wall
   lintel over its blind doorway, seen from across the hall at eye height, a little below it. On the lintel's
   face, two cut marks, and beside them a rod-shaped blank: a clean recess the length of a forearm, its edges
   sharp, its floor dressed flat and pale, waiting for a word. The clay lamp is off-frame left and behind (on
   its ledge on the far wall); its warm light rakes along the lintel so the blank's edges draw themselves. */
import hall from './pt-b-1.A.js';

const LAMP = [1, .68, .3], V = [.62, .58, 1.25];
export default {
  ...hall,
  id: 'pt-b-3.A',
  name: 'The lintel',
  line: '',
  cam: { x: -.3, y: 1.5, z: 6.35, pitch: 8, yaw: -58, f: .62, cx: .5, cy: .5 },
  far: 30, sheen: .03, gold: .7, expo: 2.1, glow: { threshold: .5, k: .7 },
  bloomAt: [0, 3.5, 40], bloomPow: 5, bloomC: [.07, .065, .17],                                /* the hall going away on the right, into its violet */
  blur: { px: 1.2, d0: 4, d1: 14, k: .6 },
  lights: [
    { p: [2.26, 1.54, 5.6], c: LAMP, k: 2.5, r: 1.25, warm: .012 },                          /* the clay lamp on its ledge, behind and to the left */
    { p: [-.9, 2.3, 5.2], c: LAMP, k: .7, r: .9, reach: 3.2, shadow: 1 },                   /* its light, along the lintel from the left, raking */
    { p: [-2.25, 3.0, 7.38], c: LAMP, k: .06, r: .2, reach: .7, shadow: 1 },                /* and grazing the lintel's face, so the blank's edges draw */
    { p: [-.9, .7, 6.3], c: LAMP, k: .3, r: .8, reach: 2.2 },                                  /* the lamp's light, pooled warm on the floor at your left */
    { p: [0, 9, 20], c: [.36, .33, .8], k: 26, r: 12 },                                     /* haze high in the vault */
    { p: [.5, 2.6, 10.5], c: V, k: 4, r: 3.2 },                                          /* the hall's cold glow along the wall */
    { p: [0, 7, -4], c: [.3, .28, .66], k: 5, r: 7 },                                       /* soft fill from behind */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  /* the rod-shaped blank on the lintel's face: a rounded slot (z along, y up), distance to its outline */
  float blankD(vec2 q) { vec2 e = abs(q - vec2(7.72, 2.86)) - vec2(.22, .026); return length(max(e, 0.)) + min(max(e.x, e.y), 0.) - .022; }
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    if (p.y < .03) gTint *= mix(.35, 1., smoothstep(4., 7.5, -p.x + 5.));                 /* the near floor kept down */
    if (p.y > .03) gTint *= mix(1., .4, smoothstep(3.3, 5., p.y));          /* the vault into the dark: the words' band */
    if (p.x < -2.3 && p.y < 2.35) gTint *= mix(.45, .8, smoothstep(.2, 2.3, p.y));          /* the blind doorway's stone, quiet under the lintel */
    if (floor(d.y + .5) == M_DRESSED) d.x += rough(p, .014, 6.) + rough(p, .004, 25.);
    gTint *= .82 + .36 * fbm(p.zy * 1.7 + p.x, 3);                                                /* the stone's own mottling, block to block */      /* the lintel hand-dressed, not a plate */
    /* the lintel's face: two marks, then the blank */
    if (p.x > -2.47 && p.x < -2.36 && p.y > 2.42 && p.y < 3.23 && p.z > 6.02 && p.z < 8.58) {
      vec2 q = vec2(p.z, p.y);
      float m1 = length(vec2(q.x - 6.72, max(abs(q.y - 2.86) - .07, 0.)));                  /* a bar */
      m1 = min(m1, length(vec2(q.x - 6.72 - (q.y - 2.93) * .9, max(abs(q.y - 2.95) - .03, 0.)) * vec2(1., 1.)));   /* with a short stroke off its head */
      float m2 = length(vec2(q.x - 7.07, max(abs(q.y - 2.87) - .05 * (1. - (q.y - 2.82) / .1 * .5), 0.)) * vec2(1. + .9 * smoothstep(2.92, 2.8, q.y), 1.));   /* a drop, tapering up */
      d.x += engrave(min(m1, m2), .014, .012);
      float b = blankD(q);
      d.x = max(d.x, min(-b, p.x + 2.435));                                                 /* the blank: cut square into the face, its edges sharp */
      if (b < -.0005 && p.x < -2.4) { gTint = vec3(1.35); gPolish = .35; d.yzw = vec3(M_CUT_SMALL, NOUV); }  /* its floor dressed clean and pale: fresh stone */
      else gTint *= .82 * (.9 + .2 * fbm(q * vec2(9., 30.), 3));                                   /* the lintel's face dressed by hand: tooling, not a plate */
      if (b < -.0005) gTint *= mix(.62, 1., smoothstep(2.838, 2.872, p.y));                          /* the blank's lower inner edge in its own shadow: a recess, not a slot of light */
    }
    return d;
  }`,
  anchors: {
    flame: [],
    fog: [{ p: [-1.6, .3, 9.5], w: 1.3, h: .2, a: .14 }],
    beam: [],
    glints: [{ p: [-2.4, 2.88, 7.5] }],
  },
  live: { fog: 'low', motes: 'gold', gold: true },
};
