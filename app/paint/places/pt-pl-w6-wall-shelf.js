/* SEALED (D-015). pt-pl-w6-wall-shelf, round 1 (room scale, D-075): in the week-6 room (pt-b-6.A's square
   gallery, imported), further down its left wall: a shelf cut into the square wall at chest height, a count cut
   on its lip; along the lip's edge a scratched line, pale and dead level, with a short tick at each end. The eye
   is exactly level with the line, so it runs straight across the frame while every other edge in the gallery
   runs away to the vanishing point at its end. The round side's light, warm and weak, from behind. */
import { squareRoom, W, RZ } from './pt-b-6.A.js';

const SZ = 8.2, LY = 1.1;                                           /* the shelf's centre along the wall; the line's height */
const CAM = { x: .3, y: LY, z: SZ - 1.1 };
export default {
  id: 'pt-pl-w6-wall-shelf',
  name: 'The wall-shelf',
  line: '',
  cam: { ...CAM, pitch: 0, yaw: -46, f: .45, cx: .5, cy: .5 },
  far: 24, fogK: 1 / 14,
  hazeBase: [.014, .012, .038], hazeFar: [.04, .036, .1],
  bloomAt: [0, .9, RZ], bloomPow: 40, bloomC: [.06, .05, .1],
  bloom: { alpha: .12 },
  glow: { threshold: .62, k: .45 },
  blur: { px: 1.2, d0: 4.5, d1: 12, k: .5 },
  gold: 1, grain: .4, shadowJitter: 1, amb: .5, expo: 1.9, ambC: [.86, .78, 1.5], sheen: 0,
  lights: [
    { p: [.4, 1.35, SZ - 4], c: [1, .7, .34], k: .4, r: .9, shadow: 1, reach: 6 },              /* the round side's light, weak, from behind */
    { p: [-W + .3, LY + .03, SZ - 1.3], c: [1, .74, .42], k: .1, r: .35, reach: 2.4 },   /* and the last of it, raking along the lip */
    { p: [-W + .22, LY + .02, SZ + .95], c: [.62, .58, 1.1], k: .08, r: .3, reach: 1.9 },   /* cold, from further down, along the lip the other way */
    { p: [.4, 1.6, SZ - 2], c: [.4, .37, .85], k: 1.8, r: 1.2 },                                  /* cold fill */
    { p: [0, 1.3, SZ + 4], c: [.4, .37, .85], k: 1, r: 2 },                                      /* cold, down the gallery */
  ],
  glsl: squareRoom(CAM) + /* glsl */ `
  const float SZ = ${SZ.toFixed(2)}, LY = ${LY.toFixed(3)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    /* no crack runs near the shelf: take back the room's cracks along this stretch of wall, so nothing but the
       scratched line runs level here */
    if (p.x < -WW + .05 && p.z > JZ + .2 && abs(p.z - SZ) < 1.4 && p.y > .03 && p.y < HT - .05) {
      float cr = min(crack(vec2(p.z, p.y), 1.2, 1.), crack(vec2(p.z * 1.3 + 4., p.y), .55, 11.));
      if (cr < .03) { d.x -= engrave(cr, .009, .014); if (cr < .006) gTint /= .35; }
    }
    if (p.y > HT - .05) gTint *= .35;                                                       /* the flat roof overhead, dark */
    if (p.y < .04) gTint *= mix(.3, .8, smoothstep(SZ - .5, SZ + 3., p.z));                  /* the floor, calm */
    if (p.x < 0. && p.y < .75) gTint *= mix(.35, 1., smoothstep(.1, .75, p.y));            /* the wall's foot, out of the light */
    if (p.x > 0. && p.y > .04 && p.y < HT - .05) gTint *= .6;                               /* the far wall */
    /* the shelf: cut square into the wall at chest height, a forearm deep */
    vec4 sh = boxAir(p, vec3(-WW - .15, LY + .115, SZ), vec3(.19, .095, .66), M_DRESSED);
    if (sh.x > d.x) { d = sh; gTint = vec3(.55, .53, .62) * (p.y < LY + .03 ? 1.1 : .75); }
    /* on the lip's face, under the shelf: the scratched line, dead level, a short tick at each end; and the count */
    if (p.x < -WW + .06 && abs(p.y - LY) < .06 && abs(p.z - SZ) < .66) {
      float along = p.z - SZ, e = .6;
      float ln = length(vec2(max(abs(along) - e, 0.), p.y - LY));
      float tk = length(vec2(abs(along) - e, max(abs(p.y - LY) - .014, 0.)));
      float sc = min(ln, tk);
      d.x += engrave(sc, .004, .0018);
      if (sc < .0035) { gTint = vec3(2.6, 2.5, 2.7); gStain = 0.; }                          /* the scratch pale: fresh stone in the cut */
      /* the count: six short upright strokes, under the line near its left end */
      float k = floor((along + .55) / .028), sz = along + .55 - (k + .5) * .028;
      float cs = length(vec2(sz, max(abs(p.y - LY + .036) - .015, 0.)));
      if (k >= 0. && k < 6.) { d.x += engrave(cs, .004, .005); if (cs < .003) gTint *= .5; }
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [-.3, .3, SZ + 1.5], w: 1, h: .15, a: .12, speed: .6 }],
    glints: [{ p: [-W + .025, LY, SZ - .6] }, { p: [-W + .025, LY, SZ + .6] }],
  },
  live: { motes: 'gold', gold: true },
};
