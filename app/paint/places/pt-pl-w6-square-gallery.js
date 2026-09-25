/* SEALED (D-015). pt-pl-w6-square-gallery, round 1 (room scale, D-075): the week-6 room (pt-b-6.A's square
   gallery, imported), seen straight down its axis from just past the clasp: flat roof, straight walls covered in
   small even chisel strokes, cracked, no cups; the Site's only one-point perspective, its vanishing point dead
   centre. The round side's warm light comes from behind and dies down the gallery; where it gives out, far down,
   the floor goes under a slope of broken stone, its faces catching the last of it. */
import { squareRoom, JZ, W, HT, RZ } from './pt-b-6.A.js';

const CAM = { x: 0, y: 1.5, z: RZ - 6.5 };
export default {
  id: 'pt-pl-w6-square-gallery',
  name: 'The square gallery',
  line: '',
  cam: { ...CAM, pitch: 0, yaw: 0, f: .66, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 16,
  hazeBase: [.014, .012, .038], hazeFar: [.04, .036, .1],
  bloomAt: [0, .9, RZ + 1.2], bloomPow: 40, bloomC: [.1, .08, .12],
  bloom: { alpha: .14 },
  glow: { threshold: .6, k: .5 },
  blur: { px: 1.4, d0: 6, d1: 20, k: .5 },
  gold: 1, grain: .4, shadowJitter: 1, amb: .5, expo: 1.9, ambC: [.86, .78, 1.5], sheen: 0,
  lights: [
    { p: [.1, 1.3, CAM.z - 3.5], c: [1, .7, .34], k: 1.4, r: 1, shadow: 1, reach: 8 },          /* the round side's light, from behind, dying down the gallery */
    { p: [0, 1.5, CAM.z - 2], c: [.4, .37, .85], k: 2.2, r: 1.3 },                            /* cold fill, behind */
    { p: [0, 1.2, CAM.z + 3], c: [.4, .37, .85], k: .6, r: 1.5 },                            /* cold, further down */
    { p: [0, 1.8, RZ - 1.1], c: [.95, .76, .56], k: .35, r: .7, shadow: 1, reach: 2.6 },     /* the last of the round side's light, on the broken stone */
  ],
  glsl: squareRoom(CAM) + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > HT - .05) gTint *= mix(.35, 1., smoothstep(${(CAM.z + 1).toFixed(2)}, ${(CAM.z + 6).toFixed(2)}, p.z));    /* the flat roof close overhead, dark */
    if (p.y < .04) gTint *= mix(.35, 1., smoothstep(${(CAM.z + .5).toFixed(2)}, ${(CAM.z + 6).toFixed(2)}, p.z));      /* the floor at your feet, calm */
    return d;
  }`,
  anchors: {
    fog: [{ p: [0, .2, 8], w: 1, h: .12, a: .14 }, { p: [0, .3, RZ - 2], w: .9, h: .15, a: .12, speed: .6 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true },
};
