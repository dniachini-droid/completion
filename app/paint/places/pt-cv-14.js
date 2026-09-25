/* SEALED (D-015). pt-cv-14, camp view: the gap (the Stair's room, pt-cv-10, reused). A step back from a gap in the
   second flight's wall at shoulder height, its edge clean and rounded as the Stair's stone is; through it, square
   stone: a straight gallery, flat-ceilinged, chisel-marked and darkened by old smoke, going away into the dark.
   Under the gap, on the tread at the wall's foot, a heap of square-edged chips, pale and fresh against the worn
   stone, lit by the Stair's lamps behind you: the look-at. Fog drawn in through the gap. */
import { STAIR_LOOK } from './pt-cv-10.js';
import { STAIR2_GLSL } from './pt-cv-12.js';

const ramp2 = x => -5.04 - Math.max(x - 1.6, 0) * .42 / .55;            /* the second flight's nosing line, all the way down */
const GX = 11.225;                                                         /* the gap's centre, over tread 17 */
const TOP = -5.04 - .42 * 18;                                              /* that tread's top */
const G = { y0: ramp2(GX) + 1.3, y1: ramp2(GX) + 1.95, w: .32 };            /* the gap: sill, head, half width */
const FL = G.y0 - .35;                                                      /* the square gallery's floor */

export default {
  ...STAIR_LOOK,
  id: 'pt-cv-14',
  name: 'The gap',
  line: '',
  cam: { x: GX - .1, y: TOP + 1.78, z: 7.9, pitch: -26, yaw: 2, f: .74, cx: .5, cy: .5 },
  bloomAt: [GX, FL + 1, 20], bloomPow: 30, bloomC: [.05, .04, .05],
  blur: { px: 1.6, d0: 3.4, d1: 9, k: .85 },
  lights: [
    { p: [GX - .1, TOP + 2.7, 6.95], c: [1, .68, .34], k: .85, r: .8, shadow: .7, reach: 4.5, warm: .003 },      /* the Stair's lamps behind you, their light falling into the gap */
    { p: [GX + .1, TOP + .55, 9.2], c: [1, .72, .4], k: .22, r: .22, shadow: .8, reach: .75 },
    { p: [GX, FL + .9, 10.7], c: [1, .66, .32], k: .35, r: .5, shadow: .5, reach: 3 },           /* the lamps' light, through the gap, on the square stone */       /* and on the chips at the wall's foot */
    { p: [GX, FL + 1.2, 13.5], c: [.3, .27, .6], k: 2, r: 1.8 },                                  /* the gallery beyond: a little cold light, dying */
    { p: [GX - 2.2, ramp2(GX - 2.2) + 1.5, 8.2], c: [.34, .31, .75], k: 1.5, r: 2 },                 /* violet up the flight */
    { p: [GX + 2.2, ramp2(GX + 2.2) + 1.2, 8.2], c: [.34, .31, .75], k: 1, r: 2 },                 /* and down it */
  ],
  glsl: STAIR2_GLSL.replace('clamp(floor((p.x - 3.) / 2.2 + .5), 0., 3.)', 'clamp(floor((p.x - 3.) / 2.2 + .5), 0., 2.)') + /* glsl */ `
  const float GX = ${GX.toFixed(3)}, TOP = ${TOP.toFixed(3)}, GY0 = ${G.y0.toFixed(3)}, GY1 = ${G.y1.toFixed(3)}, GW = ${G.w.toFixed(2)}, FL = ${FL.toFixed(3)};
  /* the heap of chips: small square-cut blocks, tumbled, each its own size and turn, piled against the wall */
  vec4 chips(vec3 p) {
    float best = 1e3;
    for (int L = 0; L < 2; L++) {
      vec2 off = L == 0 ? vec2(0) : vec2(.034, .027);
      vec2 g = (p.xz - off) / .07, c = floor(g), f = (fract(g) - .5) * .07;
      float hx = h2(c + float(L) * 17.), hz = h2(c + 5. + float(L) * 9.), ha = h2(c + 11. + float(L) * 3.);
      vec2 cw = (c + .5) * .07 + off;
      float r = length(vec2((cw.x - GX) / .38, (cw.y - 9.8) / .42));
      float hh = .19 * max(0., 1. - r * r);                                           /* the heap's height here */
      if (hh < .012 || cw.y > 9.79) continue;
      float s = .014 + .015 * hx;
      vec3 q = vec3(f.x, p.y - (TOP + hh * (.5 + .5 * hz) - s * .6), f.y);
      float a = ha * 6.28, ca = cos(a), sa = sin(a); q.xz = vec2(ca * q.x - sa * q.z, sa * q.x + ca * q.z);
      float tl = (hz - .5) * .9; float ct = cos(tl), st = sin(tl); q.xy = vec2(ct * q.x - st * q.y, st * q.x + ct * q.y);
      vec3 b = abs(q) - vec3(s * (1. + .5 * hz), s * .7, s);
      float db = length(max(b, 0.)) + min(max(b.x, max(b.y, b.z)), 0.) - .0015;
      best = min(best, db);
    }
    return vec4(best, M_CUT_SMALL, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 d = stairRoom(p);
    /* the gap through the wall: a rounded opening, its edges eased as the Stair's stone is */
    float n = p.z - ST_ZF;
    vec2 gq = vec2(p.x - GX, p.y - (GY0 + GY1) * .5);
    vec2 gb = abs(gq) - vec2(GW, (GY1 - GY0) * .5 - .1);
    float gap = -(length(max(gb, 0.)) + min(max(gb.x, gb.y), 0.) - .1);
    gap += .06 * (1. - smoothstep(0., .06, n));                                        /* the lip flared toward the stair */
    d = A(d, vec4(min(gap, min(n + .1, .55 - n)), M_CUT, NOUV));
    /* the square gallery beyond: straight, flat-ceilinged, a tall man's height */
    vec4 sq = boxAir(p, vec3(GX, FL + 1.1, 16.3), vec3(.62, 1.1, 6.), M_DRESSED);
    d = A(d, sq);
    if (p.z > ST_ZF + .5) {
      gTint = vec3(.44, .42, .48) * (.8 + .35 * fbm(p.xy * 3. + p.z, 3));             /* smoke-darkened square stone */
      d.x += .002 * sin(p.y * 90. + sin(p.z * 17.) * 2.) * sin(p.z * 70. + p.x * 50.);   /* small even chisel marks */
      if (p.y > FL + 2.18) gTint *= .6;                                                /* the flat ceiling, blacker */
    }
    /* the chips */
    if (p.z > 9.3 && p.z < 9.85 && abs(p.x - GX) < .45 && p.y < TOP + .26) {
      vec4 ch = chips(p);
      if (ch.x < d.x) { d = ch; gTint = vec3(1.6, 1.55, 1.5) * (.85 + .3 * h2(floor(p.xz * 60.))); }
    }
    float up = p.y - ramp2(p.x);
    if (p.z < ST_ZF + .02) gTint *= mix(1., .25, smoothstep(1.9, 3.1, up));   /* the vault, dark */
    if (up < .1 && p.z < 9.25) gTint *= mix(.35, 1., smoothstep(8.4, 9.25, p.z));
    if (p.x < GX - .26 && p.z < 9.78 && p.y < TOP + .5) gTint *= .3;                                        /* the step above, kept back */                                                 /* the treads at your feet */
    return d;
  }`,
  anchors: {
    fog: [{ p: [GX, G.y0 + .2, 11], w: .8, h: .2, a: .14, speed: .5 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true },
};
