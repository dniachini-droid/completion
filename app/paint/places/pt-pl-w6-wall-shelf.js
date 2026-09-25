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
  far: 24, fogK: 1 / 16,
  hazeBase: [.018, .016, .046], hazeFar: [.1, .09, .24],
  bloomAt: [0, 1.0, RZ - .5], bloomPow: 16, bloomC: [.2, .18, .38],
  bloom: { alpha: .18 },
  glow: { threshold: .8, k: .3 },
  blur: { px: 1.4, d0: 4.5, d1: 12, k: .6 },
  gold: 1, grain: .5, shadowJitter: 1, amb: .6, expo: 2.05, ambC: [.86, .78, 1.5], sheen: .05,
  lights: [
    { p: [.5, 1.35, SZ - 3.6], c: [1, .7, .34], k: 1.6, r: .9, shadow: 1, reach: 5.5, warm: .005 },   /* the round side's light, from behind: a warm pool along the wall and floor */
    { p: [-W + .3, LY + .03, SZ - 1.3], c: [1, .74, .42], k: .1, r: .35, reach: 2.4 },     /* and the last of it, raking along the lip */
    { p: [.4, 1.6, SZ - 2], c: [.4, .37, .85], k: 2, r: 1.2 },                                      /* cold fill */
    { p: [0, 1.3, SZ + 3.5], c: [.4, .37, .85], k: 1.6, r: 2 },                                     /* cold, down the gallery */
    { p: [0, 1.4, RZ - 1.2], c: [.48, .45, .95], k: 2.4, r: 2.5 },                                  /* a far glow, at the gallery's end */
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
    if (p.y > HT - .05) gTint *= .5;                                                       /* the flat roof overhead, dark */
    if (p.y < .04) gTint *= mix(.5, .9, smoothstep(SZ - .5, SZ + 3., p.z));                  /* the floor, calm */
    if (p.x < 0. && p.y < .75) gTint *= mix(.35, 1., smoothstep(.1, .75, p.y));            /* the wall's foot, out of the light */
    if (p.x > 0. && p.y > .04 && p.y < HT - .05) gTint *= .6;                               /* the far wall */
    /* the shelf: cut square into the wall at chest height, a forearm deep */
    vec4 sh = boxAir(p, vec3(-WW - .15, LY + .115, SZ), vec3(.19, .095, .66), M_DRESSED);
    if (sh.x > d.x) { d = sh; gTint = vec3(.55, .53, .62) * (p.y < LY + .03 ? 1.1 : .75); }
    /* on the lip's face, under the shelf: the scratched line, dead level, a short tick at each end; and the count */
    if (p.x < -WW + .06 && abs(p.y - LY) < .07 && abs(p.z - SZ) < .68) {
      float along = p.z - SZ, e = .6;
      float ln = length(vec2(max(abs(along) - e, 0.), p.y - LY));
      float tk = length(vec2(abs(along) - e, max(abs(p.y - LY) - .032, 0.)));
      float sc = min(ln, tk);
      /* a flat incised line, no body: pale fresh stone in the cut, a dark hairline along its upper edge (the cut's
         wall in shadow); the ticks short cut strokes across it */
      float up = p.y - LY;
      bool inLine = abs(up) < .0075 && abs(along) < e + .002, inTick = abs(abs(along) - e) < .0045 && abs(up) < .03;
      if (inLine || inTick) { gTint = vec3(2.7, 2.6, 2.8); gStain = 0.; gPolish = 0.; }
      else if ((up > .0075 && up < .0115 && abs(along) < e) || (abs(abs(along) - e) < .0085 && abs(along) - e < 0. && abs(up) < .03 && abs(up) > .0075)) gTint *= .3;
      /* the count: six short upright strokes, under the line near its left end */
      float k = floor((along + .55) / .028), sz = along + .55 - (k + .5) * .028;
      float cs = length(vec2(sz, max(abs(p.y - LY + .05) - .012, 0.)));
      if (k >= 0. && k < 6.) { d.x += engrave(cs, .004, .005); if (cs < .003) gTint *= .5; }
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [-.3, .3, SZ + 1.5], w: 1, h: .15, a: .12, speed: .6 }],
  },
  live: { motes: 'gold', gold: true },
};
