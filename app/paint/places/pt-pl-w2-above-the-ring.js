/* SEALED (D-015). pt-pl-w2-above-the-ring, round 4 (room scale, D-075): the Salt Gallery's left wall
   (pt-b-2.A's room, reused), from close under it, looking up. At the frame's foot, an arc of the lone ring on its
   band; over it the salt has a crack two fingers wide running up into the dark; beside the crack, cut small, a
   count. The crack has an inside: its lip lit where the light rakes across it, its walls stepping back into
   black; and far back in it something pale, too far in to reach, seen only as a highlight: the brightest thing.
   The one light is the gallery's violet, raking across the salt from the left. */
import room from './pt-b-2.A.js';

const ZR = 3.4;                                                     /* the lone ring, as in pt-b-2.A */
const V = [.62, .58, 1.2];
const SL = .25, LEAN = .12, CZ0 = .06;                              /* the crack: slant as it goes in, lean as it rises, where it starts */
const PY = 2.45, PX = -2.2;                                         /* the pale thing, deep in it */
const PZ = ZR + CZ0 - (PY - 1.95) * LEAN - (PX + 2) * SL;
export default {
  ...room,
  id: 'pt-pl-w2-above-the-ring',
  name: 'Above the ring',
  line: '',
  cam: { x: -1.58, y: 1.8, z: ZR - .14, pitch: 55, yaw: -72, f: .7, cx: .5, cy: .5 },
  far: 20, fogK: 1 / 18,
  bloomAt: [PX, PY, PZ], bloomPow: 60, bloomC: [.06, .06, .13],
  glow: { threshold: .62, k: .55 },
  blur: { px: 1.4, d0: 1.6, d1: 4, k: .6 },
  lights: [
    { p: [-1.86, 2.45, ZR - .9], c: V, k: 1.6, r: .8, reach: 2.5, shadow: .8 },     /* the gallery's light, raking across the salt from the left */
    { p: [PX + .08, PY + .03, PZ - .004], c: V, k: .035, r: .03, reach: .09 },     /* the little of it that gets far into the crack, onto the pale thing */
    { p: [.5, 1.4, ZR - 4], c: [.3, .28, .66], k: .5, r: 3 },                     /* faint fill from behind */
    { p: [-.4, 3.2, ZR + 1], c: [.36, .33, .8], k: .15, r: 1.5 },                 /* a trace on the vault, so the roof has form */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZR2 = ${ZR.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.x < -1.5) gTint *= .8 + .3 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds, grey and white */
    if (p.x < -1.5 && p.y > 1.4) gTint *= mix(1., .35, smoothstep(2.7, 3.4, p.y));     /* the salt going up into the dark */
    if (p.x < -1.5) gTint *= mix(.18, 1., smoothstep(1.8, 2.15, p.y));                 /* and down, out of the light, round the ring */
    /* the crack: two fingers wide, wandering up from over the ring, going back into the dark, its walls stepping in */
    float quiet = 1. - exp(-(p.y - ${PY.toFixed(2)}) * (p.y - ${PY.toFixed(2)}) / .012);
    float cz = ZR2 + ${CZ0.toFixed(3)} + ((fbm(vec2(p.y * 4., 3.), 3) - .5) * .12 + (fbm(vec2(p.y * 17., 5.), 2) - .5) * .03) * quiet
             - (p.y - 1.95) * ${LEAN.toFixed(3)} - min(p.x + 2., 0.) * ${SL.toFixed(3)};
    float w = (.024 + .012 * fbm(vec2(p.y * 11., 7.), 2)) * smoothstep(1.86, 2., p.y) * (1. - smoothstep(2.8, 3.2, p.y)) * (1. + .4 * (1. - quiet));
    float step_ = floor((-2. - p.x) / .05);                                               /* its walls stepping in, ledge by ledge */
    float dz = abs(p.z - cz) + (h2(vec2(step_, floor(p.y * 9.))) - .5) * .012 * smoothstep(-2., -2.05, p.x);
    float crack = min(w * mix(1.15, .45, smoothstep(-1.99, -2.3, p.x)) - dz, p.x + 2.32);
    vec4 cr = vec4(min(crack, min(p.y - 1.86, 3.2 - p.y)), M_SALT, NOUV);
    if (cr.x > d.x) {
      d = cr;
      float lit = smoothstep(-.005, .005, p.z - cz);                                     /* the wall that faces the light */
      gTint = vec3(mix(mix(.35, 1.1, lit), .015, smoothstep(-1.985, -2.1, p.x)));        /* lit at the lip, then black */
    }
    /* far back in it, something pale, too far in to reach: a sliver, edge on */
    vec3 pq = p - vec3(${PX.toFixed(3)}, ${PY.toFixed(3)}, ${PZ.toFixed(4)}); pq.xy = vec2(.8 * pq.x - .6 * pq.y, .6 * pq.x + .8 * pq.y);
    vec4 pale = vec4((length(pq / vec3(.004, .03, .008)) - 1.) * .004, M_PAPER, NOUV);
    if (pale.x < d.x) { d = pale; gTint = vec3(1.15, 1.12, 1.06); gPolish = .6; }
    /* beside the crack, a count, cut small */
    if (p.x < -1.7 && abs(p.y - 2.18) < .06 && p.z > ZR2 + .12 && p.z < ZR2 + .3) {
      float k = floor((p.z - ZR2 - .12) / .036), sz = p.z - ZR2 - .12 - (k + .5) * .036 + (h2(vec2(k, 3.)) - .5) * .01;
      float yy = p.y - 2.18 - (h2(vec2(k, 6.)) - .5) * .012; sz += yy * (h2(vec2(k, 8.)) - .5) * .4;
      d.x += engrave(length(vec2(sz, max(abs(yy) - .02 - .012 * h2(vec2(k, 1.)), 0.))), .008, .01);
    }
    return d;
  }`,
  anchors: {
    glints: [[PX, PY, PZ], [-1.97, 2.3, ZR - .3], [-1.97, 2.2, ZR + .2], [-1.96, 2.6, ZR - .4]].map(p => ({ p })),
    beam: [{ p: [-1.85, 2.4, ZR], w: .3 }],
  },
  live: { motes: 'violet' },
};
