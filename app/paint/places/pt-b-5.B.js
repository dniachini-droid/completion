/* SEALED (D-015). pt-b-5.B, through a gap (the Stair of pt-pl-w5-worn-steps, reused: the second flight, its
   paler stone). A gap in the stair's right wall at shoulder height, above the rail: a round hole through the
   round stone, its lip worn. Standing at it, looking through: beyond, darker and flat-faced, square-cut stone,
   laid in courses of square blocks with chisel marks, meeting the Site's rounded stone at a seam; on the square
   face a record in the tally's hand whose first marks end in two drops. The Stair's lamp behind you (in the
   left wall) throws its light across and through the gap: a pool of it, the gap's own shape, lies on the square
   stone beyond, the brightest thing in the frame. */
import { ST, STAIR, lampAt } from './pt-pl-w5-worn-steps.js';

const ZG = lampAt(1)[2] + .15;                                       /* the gap: just across from a lamp */
const noseY = z => -ST.RISE / ST.TREAD * z;
const YG = noseY(ZG) + 2.1;                                         /* its centre, at a tall man's shoulder above the treads */
const XW = ST.W;                                                     /* the right wall's face */
const XF = XW + 3.3;                                                 /* the square room's far wall */
const WARM = [1, .72, .4];
export default {
  id: 'pt-b-5.B',
  name: 'Through a gap',
  line: '',
  cam: { x: .75, y: YG + .05, z: ZG, pitch: -2, yaw: 90, f: .7, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 20,
  hazeBase: [.012, .011, .034], hazeFar: [.05, .045, .12],
  bloomAt: [XF, YG - .2, ZG], bloomPow: 12, bloomC: [.12, .09, .06],
  bloom: { alpha: .16 },
  glow: { threshold: .62, k: .6 },
  blur: { px: 1.4, d0: 2.4, d1: 8, k: .7 },
  gold: 1, sheen: 0, grain: .35, shadowJitter: 1, amb: 1.2, ambC: [.8, .76, 2.1], expo: 1.8,
  lights: [
    { p: [-XW + .1, YG - .1, ZG - .1], c: WARM, k: 1.1, r: 1., shadow: .7, reach: 5.5 },   /* the Stair's lamp behind you, on the round wall round the gap */
    { p: [XW + 1.3, YG + .1, ZG - .2], c: WARM, k: 1.1, r: 1.3, shadow: 1, reach: 4.5 },        /* the same light, gone through the gap into the room beyond */
    { p: [.2, YG + .8, ZG + 3.5], c: [.42, .39, .95], k: 4, r: 2.4, shadow: .4 },        /* the Stair's violet, down the flight */
    { p: [XF - 1.5, YG + 1.4, ZG - 2.4], c: [.35, .32, .75], k: .8, r: 1.4, reach: 3.5 },  /* a little cold light in the room beyond */
  ],
  glsl: STAIR + /* glsl */ `
  const vec3 G = vec3(${XW.toFixed(3)}, ${YG.toFixed(3)}, ${ZG.toFixed(3)});
  const float XF = ${XF.toFixed(3)};
  const vec3 LMP = vec3(${(-XW + .1).toFixed(3)}, ${(YG - .1).toFixed(3)}, ${(ZG - .1).toFixed(3)});
  /* the gap's shape in the wall's plane (y, z about its centre): round, uneven, a little wider than tall */
  float gapShape(vec2 yz) { return .44 + (fbm(vec2(atan(yz.x, yz.y) * 1.3, 7.), 3) - .5) * .09 - length(yz / vec2(.8, 1.)); }
  /* the record on the square face: a bar with a tick, a ring, then two drops; then its own marks */
  float record(vec2 w) {
    float cell = .08, k = floor(w.x / cell), fx = w.x - (k + .5) * cell, y = w.y;
    float bar = length(vec2(fx, max(abs(y) - .034, 0.)));
    float tick = min(bar, length(vec2(fx - .015 - (y - .017) * .9, max(abs(y - .017) - .012, 0.))));
    float ring = abs(length(vec2(fx, y)) - .02);
    float drop = length(vec2(fx, max(abs(y + .01) - .02 * (1. - (y + .032) / .064), 0.)));
    if (k < -.5 || k > 7.5) return 1.;
    if (k < .5) return tick;
    if (k < 1.5) return ring;
    if (k < 3.5) return drop;
    float kind = h2(vec2(k, 5.));
    return kind > .6 ? tick : (kind < .2 ? ring : bar);
  }
  vec4 scene(vec3 p) {
    stairPale = 1.;
    vec4 d = flight(p, -3., NST * TREAD + 3.);
    /* the room beyond: square-cut, flat-faced */
    vec4 room = boxAir(p, vec3((XF + G.x + .45) * .5, G.y, G.z + .4), vec3((XF - G.x - .45) * .5, 1.9, 2.8), M_CUT);
    /* the gap through the wall, its lip worn round */
    float gs = gapShape(vec2(p.y - G.y, p.z - G.z));
    float tube = min(gs, min(p.x - G.x + .3, G.x + .6 - p.x));
    vec4 air = A(room, vec4(tube, M_CUT, NOUV));
    d.x = -smin(-d.x, -air.x, .035);
    bool beyond = p.x > G.x + .44;
    if (beyond) {
      /* the round stone the square was cut against: a great curved face on the right, meeting the square wall */
      vec2 rc = vec2(p.x - (XF + .15), p.z - (G.z + 2.25));
      float rnd = length(rc) - 1.6;
      if (-rnd > d.x - .001 || rnd < .02) {}
      vec4 rs = vec4(rnd, M_CUT, NOUV);
      d = U(d, rs);
      if (rnd < .01) { gTint = vec3(.9, .88, 1.); gPolish = .25; }                              /* the Site's round stone: smooth, paler */
      else {
        /* square stone: darker, flat-faced, square blocks with chisel marks */
        gTint = vec3(.6, .58, .62);
        vec2 w = abs(p.x - XF) < .05 ? vec2(p.z, p.y) : (abs(p.y - G.y) > 1.85 ? p.xz : vec2(p.x, p.y));
        vec2 b = w / vec2(.46, .34); b.x += .5 * mod(floor(b.y), 2.);
        vec2 f = fract(b) - .5, id = floor(b);
        float jn = min(.5 - abs(f.x), .5 - abs(f.y));
        d.x += engrave(jn, .03, .012);                                                           /* square joints, sharp */
        float ch = sin((w.x * .6 + w.y) * 90. + h2(id) * 6.) * .5 + .5;
        d.x += .0012 * ch * (.6 + .4 * h2(id + 3.));                                             /* the chisel's even strokes */
        gTint *= .85 + .3 * h2(id + 7.);
        if (abs(p.x - XF) < .05) {
          vec2 rw = vec2((G.z + .42) - p.z, p.y - (G.y + .02));
          d.x += engrave(record(rw / 1.35) * 1.35, .009, .012);
        }
        /* the lamp's light through the gap: a pool, the gap's own shape, on the square stone */
        vec3 L = p - LMP; float t = (G.x - LMP.x) / L.x; vec3 hit = LMP + L * t;
        float g = gapShape(vec2(hit.y - G.y, hit.z - G.z));
        gTint *= mix(.35, 2.2, smoothstep(-.02, .03, g));
      }
    } else {
      if (p.x > G.x - .1 && gs > -.1) gTint *= mix(1., .6, smoothstep(.0, .3, p.x - G.x));      /* the gap's throat, going into shadow */
      gTint *= mix(1., .35, smoothstep(.5, 1.6, abs(p.y - G.y + .1)));                           /* the wall away from the gap falls into the dark */
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [XW + .5, YG - .1, ZG], w: .5, h: .15, a: .14 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true },
};
