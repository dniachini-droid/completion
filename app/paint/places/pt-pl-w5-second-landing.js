/* SEALED (D-015). pt-pl-w5-second-landing, the second landing (the Stair of pt-pl-w5-worn-steps, reused: its
   stone, paler here as on the second flight; its lamps in the same arched niches). At the foot of the second
   flight a landing opens, as wide as the hall above, round-vaulted; lamps burn in niches along its right wall.
   Opposite the stair, in the far wall, a doorway far too low for the stair's makers, cut square: sharp corners,
   a flat head, the only right angles in a round world. The lamps light the wall round it; through it, dark,
   and a little cold violet far in. From the foot of the flight, eye height; VP through the low doorway. */
import { STAIR } from './pt-pl-w5-worn-steps.js';

const LZ = [2.4, 4.7, 7.0];                                          /* the lamps along the right wall */
const WARM = [1, .72, .4];
export const LAND = /* glsl */ `
  const float LW = 2.7, LZ1 = 8.;                                    /* the landing: half width (the hall's), its far wall */
  const vec3 DOOR = vec3(0., 1.5, 8.);                               /* the low doorway: centre x, height, in the far wall */
  const float DW = .52;                                              /* its half width */
  /* a lamp in the landing's right wall at z, as the Stair's (lampNiche, lampBody, mirrored into this wall) */
  vec3 toLamp(vec3 p, float z) { return vec3(-p.x + LW - SW, p.y + RISE * 3. - RISE * 6., p.z - z + 2.5 * TREAD); }
  vec4 landing(vec3 p) {
    vec4 d = hallAir(p, LW, 3.4, LW, -1., LZ1, M_CUT);
    d.x += rough(p, .012, 3.) * step(LW - .08, abs(p.x));
    /* the low doorway: square, sharp, a stride deep, then a passage going on in the dark */
    vec4 dr = boxAir(p, vec3(DOOR.x, DOOR.y * .5, LZ1 + 3.), vec3(DW, DOOR.y * .5, 3.02), M_CUT_SMALL);
    d = A(d, dr);
    return d;
  }
`;
export default {
  id: 'pt-pl-w5-second-landing',
  name: 'The second landing',
  line: '',
  cam: { x: -.9, y: 1.55, z: 3.3, pitch: -5, yaw: 13, f: .64, cx: .5, cy: .5 },
  far: 40, fogK: 1 / 22,
  hazeBase: [.014, .012, .04], hazeFar: [.07, .06, .16],
  bloomAt: [0, .8, 14], bloomPow: 40, bloomC: [.05, .05, .12],
  bloom: { alpha: .28 },
  glow: { threshold: .6, k: .7 },
  blur: { px: 1.8, d0: 5, d1: 16, k: .85 },
  gold: 1, sheen: 0, grain: .55, shadowJitter: 1, amb: 1.2, ambC: [.8, .76, 2.1], expo: 1.8,
  lights: [
    ...LZ.map((z, i) => ({ p: [2.35, 1.5, z], c: WARM, k: [.35, .5, .75][i], r: .7, shadow: .8, reach: 5, air: .03 })),   /* the landing's lamps, along the right wall */
    { p: [.6, 1.8, 7.2], c: WARM, k: .5, r: .8, shadow: .8, reach: 2.4 },                  /* the last lamp's light on the far wall, round the doorway */
    { p: [0, .9, 13.5], c: [.45, .42, 1], k: .45, r: 2 },                                  /* cold violet, far in beyond the doorway */
    { p: [-1.5, 2.6, 1.], c: [.4, .37, .88], k: 3, r: 3, shadow: .4 },                    /* the Stair's violet, down the flight behind you */
  ],
  glsl: STAIR + LAND + /* glsl */ `
  vec4 scenePrev(vec3 p) {
    vec4 d = landing(p);
    /* the lamps' niches and bodies in the right wall */
    float zi = p.z < 3.55 ? ${LZ[0].toFixed(2)} : (p.z < 5.85 ? ${LZ[1].toFixed(2)} : ${LZ[2].toFixed(2)});
    vec3 q = toLamp(p, zi);
    if (p.x > LW - .4) d = A(d, lampNiche(q, 0.));
    vec4 lb = lampBody(q, 0.);
    if (lb.x < d.x) { d = lb; gTint = vec3(.8, .66, .6); }
    if (p.z > LZ1 - .02 && abs(p.x - DOOR.x) < DW + .01 && p.y < DOOR.y + .01 && p.y > .03) gTint *= mix(.55, .15, smoothstep(LZ1, LZ1 + .6, p.z));        /* the doorway's reveals, going dark */
    if (p.z > LZ1 + .6) gTint *= p.y < .03 ? mix(.9, .2, smoothstep(LZ1 + .6, LZ1 + 4., p.z)) : .12;   /* beyond: only its floor, going on into the dark */                                                                 /* the passage beyond, dark */
    gTint *= vec3(1.25, 1.22, 1.14);                                                                 /* the second flight's paler stone */
    if (p.y > 3.) gTint *= mix(1., .3, smoothstep(3., 5.5, p.y));                                   /* the vault going up into the dark */
    if (p.y < .03) gTint *= mix(.3, 1., smoothstep(1., 6., p.z));                                    /* the floor at your feet, kept down */
    return d;
  }
  /* polish pass: the stone's own relief and mottling, hand-worked, never machine-flat */
  vec4 scene(vec3 p) {
    vec4 d = scenePrev(p);
    float m = floor(d.y + .5);
    if (d.x < .05 && (m == M_CUT || m == M_CUT_SMALL || m == M_DRESSED || m == M_FLOOR)) {
      d.x += rough(p, 0.014, 2.0) + rough(p, 0.0042, 10.0);
      gTint *= .86 + .28 * fbm(p.xz * 1.7 + p.y * 1.3, 3);
    }
    return d;
  }`,
  anchors: {
    flame: LZ.slice(2).map(z => ({ p: [2.85, 1.33, z], size: .6 })),
    fog: [{ p: [0, .25, 6.5], w: 1.2, h: .2, a: .16 }, { p: [0, .3, 7.8], w: .6, h: .15, a: .14, speed: .6 }],
  },
  live: { motes: 'gold', fog: 'low', flame: 'still', gold: true },
};
