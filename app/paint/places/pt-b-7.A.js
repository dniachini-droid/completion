/* SEALED (D-015). pt-b-7.A, the lintel at the foot of the second flight, SEALED state (the second landing of
   pt-pl-w5-second-landing, reused: the Stair's paler stone). In the landing's left wall, where the Stair would
   go on down, an opening filled with stone and a lintel over it, lower than the hall's; on the lintel's face,
   two marks (the bar with a drop; the two drops parted) beside a blank: a clean rod-shaped recess, sharp-edged,
   waiting. The landing's lamps behind you light it, warm; a little raking light across the face picks out
   every edge of the blank. Eye height at the lintel, a stride and a half off. Open state: later. */
import { STAIR } from './pt-pl-w5-worn-steps.js';
import { LAND } from './pt-pl-w5-second-landing.js';

const ZL = 4.2;                                                       /* the lintel's centre along the left wall */
const WARM = [1, .72, .4];
export default {
  id: 'pt-b-7.A',
  name: 'The lintel',
  line: '',
  cam: { x: -1.15, y: 1.75, z: ZL - .1, pitch: 12, yaw: -90, f: .66, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 22,
  hazeBase: [.014, .012, .04], hazeFar: [.07, .06, .16],
  bloomAt: [-2.7, 2.4, ZL], bloomPow: 30, bloomC: [.06, .05, .08],
  bloom: { alpha: .14 },
  glow: { threshold: .62, k: .6 },
  blur: { px: 1.4, d0: 3, d1: 10, k: .7 },
  gold: 1, sheen: 0, grain: .35, shadowJitter: 1, amb: 1.2, ambC: [.8, .76, 2.1], expo: 1.8,
  lights: [
    { p: [2.3, 1.5, 4.7], c: WARM, k: 2.4, r: 1.2, shadow: .7, reach: 9 },                  /* the landing's lamp behind you, on the right wall */
    { p: [2.3, 1.5, 2.4], c: WARM, k: .8, r: 1.2, shadow: .7, reach: 9 },
    { p: [-2.42, 2.6, ZL - .7], c: [1, .76, .48], k: .035, r: .25, shadow: 1, reach: 1.1 },  /* the lamps' light raking across the lintel's face */
    { p: [0, 3.4, 3.], c: [.42, .39, .92], k: 3.5, r: 3, shadow: .4 },                       /* the Stair's violet */
  ],
  glsl: STAIR + LAND + /* glsl */ `
  const float ZL = ${ZL.toFixed(2)};
  /* the two marks: a bar with a drop at its foot; two drops leaning apart */
  /* a teardrop, point up, bulb at c */
  float drop(vec2 q) { float t = clamp(q.y / .045, 0., 1.); return length(vec2(q.x, q.y - clamp(q.y, 0., .045))) - .013 * (1. - t); }
  float marks(vec2 w) {
    vec2 a = w - vec2(-.21, 0.);
    float bar = length(vec2(a.x, max(abs(a.y - .03) - .035, 0.)));
    float m1 = min(bar, drop(a - vec2(0., -.03)));                                  /* the bar with a drop hanging from its foot */
    vec2 b = w - vec2(-.08, -.02);
    float c = cos(.45), sn = sin(.45);
    vec2 b1 = b + vec2(.028, 0.), b2 = b - vec2(.028, 0.);
    b1 = vec2(c * b1.x + sn * b1.y, -sn * b1.x + c * b1.y); b2 = vec2(c * b2.x - sn * b2.y, sn * b2.x + c * b2.y);
    return min(m1, min(drop(b1), drop(b2)));                                         /* two drops, parted */
  }
  vec4 scene(vec3 p) {
    vec4 d = landing(p);
    /* the sealed opening: stone set in, a hand back from the wall's face */
    vec4 op = boxAir(p, vec3(-LW - .05, 1.05, ZL), vec3(.12, 1.05, 1.15), M_DRESSED);
    d = A(d, op);
    bool fill = p.x < -LW + .02 && abs(p.z - ZL) < 1.16 && p.y < 2.11;
    /* the lintel: a long dressed stone over it, standing a little proud */
    vec4 lt = box(p, vec3(-LW + .02, 2.42, ZL), vec3(.1, .3, 1.5), M_DRESSED);
    lt.x -= .02 + rough(p, .012, 5.);
    bool onLint = lt.x < d.x + .002;
    d = U(d, lt);
    if (onLint) {
      vec2 w = vec2(ZL - p.z, p.y - 2.45);
      /* the blank: rod-shaped, clean-edged, the stone smooth in it */
      vec2 bq = w - vec2(.25, 0.);
      float blank = max(abs(bq.x) - .23, abs(bq.y) - .028);
      float fx = -LW + .13;                                                                     /* the lintel's face */
      d.x = max(d.x, min(-blank, p.x - (fx - .03)));                                           /* cut three fingers deep */
      if (blank < .004 && p.x < fx - .005) { gTint = vec3(1.3); gPolish = .5; }
      d.x += engrave(max(marks(w), 0.), .006, .012);
      gTint *= 1.05;
    }
    if (fill && !onLint) {
      /* the fill: square-set blocks, flat, closer-jointed than the wall */
      vec2 b = vec2(p.z, p.y) / vec2(.55, .35); b.x += .5 * mod(floor(b.y), 2.);
      vec2 f = fract(b) - .5;
      d.x += engrave(min(.5 - abs(f.x), .5 - abs(f.y)), .02, .006);
      gTint *= .75;
    }
    gTint *= vec3(1.25, 1.22, 1.14);                                                                 /* the paler stone */
    if (p.y > 2.74) gTint *= mix(.75, .2, smoothstep(2.74, 4.2, p.y));                                /* above the lintel, falling into the dark */
    if (p.y < .03) gTint *= .4;
    if (!onLint && abs(p.z - ZL) > 1.6) gTint *= .7;
    return d;
  }`,
  anchors: {
    fog: [{ p: [-2.4, .6, ZL], w: 1.2, h: .2, a: .14 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true },
};
