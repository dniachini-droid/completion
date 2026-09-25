/* SEALED (D-015). pt-b-6.B, the crew's wall, round 1 (room scale, D-075): in the week-6 room (pt-b-6.A's square
   gallery, imported), on its left wall a few paces past the clasp: a longer record in the tally's hand at chest
   height; under it a niche with a count on its lintel, opened; in it a wax tablet gone hard, amber-grey, in a
   thin wooden frame, turned a little out toward the gallery: ruled in rows, a ring cut at the head of every row.
   The round side's warm light comes low from the left and rakes across the wax, so every ruled line and every
   ring shows its shadow. Close on the wall, the niche below centre, the wall running away to the right. */
import { squareRoom, TALLY, W } from './pt-b-6.A.js';

const NZ = 5.0, NY = .98;                                           /* the niche's centre on the left wall */
const CAM = { x: -.35, y: 1.32, z: NZ - .78 };
export default {
  id: 'pt-b-6.B',
  name: "The crew's wall",
  line: '',
  cam: { ...CAM, pitch: -12, yaw: -36, f: .9, cx: .5, cy: .47 },
  far: 24, fogK: 1 / 14,
  hazeBase: [.018, .016, .046], hazeFar: [.1, .09, .24],
  bloomAt: [0, 1., 13], bloomPow: 20, bloomC: [.2, .18, .38],
  bloom: { alpha: .18 },
  glow: { threshold: .62, k: .45 },
  blur: { px: 1.3, d0: 2.6, d1: 8, k: .6 },
  gold: 1, grain: .5, shadowJitter: 1, amb: .6, expo: 2, ambC: [.86, .78, 1.5], sheen: .05,
  lights: [
    { p: [-.62, 1.02, NZ - .7], c: [1, .72, .38], k: .2, r: .35, shadow: 1, reach: 1.3 },     /* the round side's light, low from the left, raking across the wax */
    { p: [.3, 1.3, NZ - 3.2], c: [1, .7, .34], k: 1.3, r: .9, shadow: 1, reach: 5, warm: .004 },            /* and the rest of it, weak, down the wall */
    { p: [.4, 1.6, NZ - 1.6], c: [.4, .37, .85], k: 1.6, r: 1.2 },                               /* cold fill */
    { p: [0, 1.3, NZ + 4], c: [.4, .37, .85], k: 1.4, r: 2 },
    { p: [0, 1.4, 14], c: [.48, .45, .95], k: 4, r: 2.5 },                                     /* a far glow down the gallery */                                     /* cold, down the gallery */
  ],
  glsl: squareRoom(CAM) + TALLY + /* glsl */ `
  const float NZ = ${NZ.toFixed(2)}, NY = ${NY.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > HT - .05) gTint *= .35;                                                       /* the flat roof overhead, dark */
    if (p.y < .04) gTint *= mix(.35, .8, smoothstep(NZ - .5, NZ + 3., p.z));                 /* the floor, calm */
    if (p.x < 0. && p.y < .92) gTint *= mix(.22, 1., smoothstep(.15, .92, p.y));             /* the wall's foot, out of the light: the button's band stays calm */
    if (p.x > 0. && p.y > .04 && p.y < HT - .05) gTint *= .6;                               /* the far wall, out of the light */
    /* the longer record, in the tally's hand, at chest height above the niche */
    if (p.x < -WW + .05 && abs(p.y - 1.4) < .05 && abs(p.z - NZ) < 1.2) d.x += engrave(tally(vec2(p.z + 7., p.y - 1.4), .05, 57.), .0045, .006);
    /* the niche, opened: a square hole a hand deep in the wall, its edges cut sharp */
    vec4 ni = boxAir(p, vec3(-WW - .15, NY, NZ - .02), vec3(.21, .17, .31), M_DRESSED);
    if (ni.x > d.x) { d = ni; gTint = vec3(.5, .48, .58); }
    /* its count, on the lintel's face: five short strokes */
    if (p.x < -WW + .06 && p.y > NY + .19 && p.y < NY + .25 && abs(p.z - NZ) < .08) {
      float k = floor((p.z - NZ + .08) / .032), sz = p.z - NZ + .08 - (k + .5) * .032;
      d.x += engrave(length(vec2(sz, max(abs(p.y - NY - .22) - .022, 0.))), .004, .005);
    }
    /* the tablet: a thin wooden frame, hard wax in it, stood at the niche's back and turned a little out */
    vec3 q = p - vec3(-WW - .085, NY - .005, NZ + .03);
    float ta = -.25, tb = .1;                                                             /* turned toward the gallery; leaning back */
    q.xz = mat2(cos(ta), -sin(ta), sin(ta), cos(ta)) * q.xz;
    q.xy = mat2(cos(tb), -sin(tb), sin(tb), cos(tb)) * q.xy;
    vec4 fr = box(q, vec3(0), vec3(.011, .143, .198), M_WOOD); fr.x -= .006; fr.x += rough(p, .002, 60.);
    if (fr.x < d.x) { d = fr; gTint = vec3(.95, .88, .92) * (.8 + .3 * fbm3(p * 40., 2)); }                       /* old wood, worn round at the edges */
    vec4 wx = box(q, vec3(.006, 0, 0), vec3(.012, .128, .183), M_PAPER);
    if (wx.x < d.x) {
      d = wx; d.zw = NOUV;
      gTint = vec3(.84, .76, .64) * (.82 + .24 * fbm3(p * 26., 3)); gPolish = .5;             /* hard wax, amber-grey, a low waxy sheen */
      if (q.x > .016) {
        /* ruled in rows; at the head of every row a ring; after it, a few faint marks */
        float ry = (q.y + .128) / .04267, ri = floor(ry), fy = (fract(ry) - .5) * .04267;
        float rule = fract(ry) * .04267;
        float ruled = engrave(min(rule, .04267 - rule), .0026, .0032);
        float hz = q.z;                                                                    /* along the row, from its head */
        vec2 rc = vec2(hz + .152, fy);
        float ring = ri < 6. ? engrave(abs(length(rc) - .0125), .0034, .0045) : 0.;
        float mk = 0.;
        if (hz > -.125 && hz < .17 && ri < 6.) {
          float c = floor((hz + .13) / .02), cx = hz + .13 - (c + .5) * .02;
          if (h2(vec2(c, ri)) < .55 + .3 * h2(vec2(ri, 4.))) mk = engrave(length(vec2(cx, max(abs(fy) - .006, 0.))), .0015, .0012);
        }
        d.x += ruled + ring + mk * .7;
        if (ring > .0015) gTint *= .55;
      }
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [-.75, .35, NZ + .45], w: .9, h: .15, a: .1, speed: .6 }],
    glints: [{ p: [-W - .06, NY + .1, NZ - .12] }],
  },
  live: { motes: 'gold', gold: true },
};
