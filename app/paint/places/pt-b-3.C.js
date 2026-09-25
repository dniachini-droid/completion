/* SEALED (D-015). pt-b-3.C, the top flight (the Stair of pt-b-3.B, reused). From the top step, looking down a
   stair wide enough for three, every step knee-high: steps built for someone twice your size, seen from above.
   The Stair's lamps are set every few steps in hooded recesses in the right wall, open down the stair, so from
   the top only their light shows, pooled on the treads below and ahead. At the first turn the stair meets a
   landing and turns right, out of sight, into more light; along the left wall a rail is cut from the stone, and
   where it turns along the landing's far wall its top, worn smooth by hands, catches the light from the turn.
   Beside it in the left wall, a second niche with a count. Fog lies on the steps like water. */
import head, { STAIR } from './pt-b-3.B.js';

const W = [1, .7, .4], V = [.5, .47, 1.1];
export default {
  ...head,
  id: 'pt-b-3.C',
  name: 'The top flight',
  line: '',
  cam: { x: -.35, y: 1.65, z: 2.55, pitch: -24, yaw: -2, f: .72, cx: .5, cy: .5 },
  far: 40, fogK: 1 / 16, sheen: 0, gold: .7, expo: 2.0,
  hazeBase: [.02, .018, .055], hazeFar: [.05, .045, .12],
  bloomAt: [1.5, -2.2, 8.3], bloomPow: 12, bloomC: [.1, .07, .05],
  glow: { threshold: .55, k: .6 },
  blur: { px: 1.4, d0: 5, d1: 14, k: .7 },
  lights: [
    { p: [1.8, -.6, 4.75], c: W, k: 1.2, r: .6, reach: 3.5, shadow: .6 },                   /* a lamp two steps down, in its hooded recess */
    { p: [1.8, -1.5, 5.95], c: W, k: 1.2, r: .6, reach: 3.5, shadow: .6 },                    /* another, further down */
    { p: [2.6, -1.1, 7.5], c: W, k: 1.1, r: .8, reach: 6, shadow: .8 },                   /* the lamps round the turn: their light out across the landing */
    { p: [-.2, -.95, 9.35], c: W, k: .45, r: .3, reach: 1.3, shadow: 1 },                  /* the same light along the far wall: the rail's worn top gives it back */
    { p: [-.3, 4.5, 1.5], c: V, k: 4, r: 3.5 },                                            /* the place's own cold, from the landing behind */
    { p: [0, 2.5, 6.5], c: [.36, .33, .8], k: 3, r: 3 },                                    /* and high in the vault over the flight */
  ],
  glsl: STAIR + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = stairScene(p);
    gTint *= mix(1., .35, smoothstep(stairLine(p.z) + 2.6, stairLine(p.z) + 4.6, p.y));     /* the vault into the dark: the words' band */
    if (p.z < 4.2 && p.y < .05) gTint *= mix(.4, 1., smoothstep(2.6, 4.2, p.z));            /* the near treads kept down */
    if (p.z > 9.75 && p.y > -1.36 && floor(d.y + .5) != M_DRESSED) gTint *= mix(.3, 1., smoothstep(.35, 0., p.y + 1.36) * .5);   /* the far wall above the rail kept down: the rail's top is the light's */
    if (floor(d.y + .5) == M_DRESSED && p.z > 9.75 && p.y > -1.43) { gPolish = 1.; gTint *= 1.25; }
    /* a second niche with a count, in the left wall of the turn's landing, beside the rail */
    vec4 n = vec4(min(archOpening2(vec2(p.z - 8.1, p.y + 1.05), .22, .16), p.x + 2.05), M_CUT_SMALL, NOUV);
    if (n.x > d.x) { d = n; gTint = vec3(mix(.8, .2, smoothstep(-1.75, -2., p.x))); }
    if (p.x < -1.66 && abs(p.y + .53) < .045 && abs(p.z - 8.1) < .16) {
      float k = floor((p.z - 8.1 + .16) / .064), c = -.16 + (k + .5) * .064;
      d.x += engrave(length(vec2(p.z - 8.1 - c, max(abs(p.y + .53) - .026, 0.))), .008, .005);
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [0, -1.1, 5.], w: 1.4, h: .22, a: .22 }, { p: [.3, -2.4, 8.3], w: 1.3, h: .2, a: .18, speed: .6 }],
    glints: [{ p: [-.4, -1.4, 9.88] }],
  },
  live: { fog: 'low', motes: 'gold', gold: true },
};
