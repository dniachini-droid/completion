/* SEALED (D-015). pt-pl-w2-above-the-ring, round 3 (room scale, D-075): the Salt Gallery's left wall
   (pt-b-2.A's room, reused), seen from two strides out in the gallery, looking up. Low in the frame the lone
   ring on its band; over it the salt has a crack two fingers wide, running up; beside the crack, cut small,
   a count. Far back in the crack, something pale, too far in to reach: seen only as a highlight in the dark.
   The one light is the gallery's violet, raking across the salt from the left. */
import room from './pt-b-2.A.js';

const ZR = 3.4;                                                     /* the lone ring, as in pt-b-2.A */
const V = [.62, .58, 1.2];
const SL = .5;                                                      /* how far the crack slants away from you as it goes in */
export default {
  ...room,
  id: 'pt-pl-w2-above-the-ring',
  name: 'Above the ring',
  line: '',
  cam: { x: -.15, y: 1.45, z: ZR - 1.5, pitch: 16, yaw: -41, f: .7, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 20,
  bloomAt: [.6, 1.3, 36], bloomPow: 14, bloomC: [.22, .2, .45],
  glow: { threshold: .66, k: .45 },
  blur: { px: 1.6, d0: 2.6, d1: 6, k: .8 },
  lights: [
    { p: [-1.35, 2.55, ZR - 1.25], c: V, k: .9, r: .85, shadow: .6 },              /* the gallery's light, raking across the salt from the left */
    { p: [-1.8, 2.45, ZR - .3], c: V, k: .07, r: .25, shadow: .5 },                 /* its spill on the crack's left lip and the far inner wall */
    { p: [-2.13, 2.47, ZR + .0085 + .13 * SL], c: V, k: .02, r: .025 },                          /* the little of it that gets far into the crack, onto the pale thing */
    { p: [1.3, 1.9, 11], c: V, k: 10, r: 4.5, shadow: .55 },                         /* the gallery going on, beyond (as pt-b-2.A) */
    { p: [.4, 1.6, 34], c: V, k: 12, r: 9 },
    { p: [.5, 1.4, ZR - 5], c: [.3, .28, .66], k: .5, r: 3 },                       /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.x < -1.5 && p.y > 1.4) gTint *= mix(1., .45, smoothstep(2.6, 3.3, p.y));     /* the salt above the crack going into the dark */
    /* the crack: two fingers wide, wandering up from over the ring, going back into the dark */
    float cz = ZR + .22 + ((fbm(vec2(p.y * 4., 3.), 3) - .5) * .14 + (fbm(vec2(p.y * 19., 5.), 2) - .5) * .025) * (1. - exp(-(p.y - 2.42) * (p.y - 2.42) / .01)) - (p.y - 1.95) * .45 - min(p.x + 2., 0.) * ${SL.toFixed(2)};   /* it goes in slanting away from you; (quiet where the pale thing sits, so it stays in the crack) */
    float w = (.038 + .014 * fbm(vec2(p.y * 11., 7.), 2)) * smoothstep(1.86, 1.96, p.y) * (1. - smoothstep(2.75, 3.05, p.y)) * (1. + .45 * exp(-(p.y - 2.42) * (p.y - 2.42) / .02));   /* a little wider where the pale thing is */
    float dz = abs(p.z - cz) + (fbm(vec2(p.x * 26., p.y * 10.), 3) - .5) * .02 * smoothstep(-2., -2.12, p.x);   /* its inner walls broken, stepping in */
    float crack = min(w * mix(1., .5, smoothstep(-2., -2.35, p.x)) - dz, p.x + 2.36);   /* narrowing as it goes back */
    vec4 cr = vec4(min(crack, min(p.y - 1.86, 3.05 - p.y)), M_SALT, NOUV);
    if (cr.x > d.x) { d = cr; gTint = vec3(mix(.9, .02, smoothstep(-1.97, -2.12, p.x))); }   /* inside: lit at the mouth, then dark */
    /* far back in it, something pale, too far in to reach: a sliver, edge on */
    vec3 pq = p - vec3(-2.2, 2.42, ZR + .22 - (2.42 - 1.95) * .45 + .2 * ${SL.toFixed(2)} + .012); pq.xy = vec2(.8 * pq.x - .6 * pq.y, .6 * pq.x + .8 * pq.y);
    vec4 pale = vec4((length(pq / vec3(.006, .04, .012)) - 1.) * .006, M_PAPER, NOUV);
    if (pale.x < d.x) { d = pale; gTint = vec3(1.1, 1.07, 1.02); gPolish = .5; }
    /* beside the crack, a count, cut small */
    if (p.x < -1.7 && abs(p.y - 2.12) < .06 && p.z > ZR + .3 && p.z < ZR + .47) {
      float k = floor((p.z - ZR - .3) / .034), sz = p.z - ZR - .3 - (k + .5) * .034 + (h2(vec2(k, 3.)) - .5) * .01;
      float yy = p.y - 2.12 - (h2(vec2(k, 6.)) - .5) * .012; sz += yy * (h2(vec2(k, 8.)) - .5) * .4;
      d.x += engrave(length(vec2(sz, max(abs(yy) - .018 - .012 * h2(vec2(k, 1.)), 0.))), .007, .008);
    }
    return d;
  }`,
  anchors: {
    glints: [[-2.26, 2.42, ZR + .06], [-1.96, 2.3, ZR - .3], [-1.97, 1.9, ZR + .4], [-1.96, 2.6, ZR - .6]].map(p => ({ p })),
    beam: [{ p: [-1.8, 2.4, ZR], w: .3 }],
  },
  live: { motes: 'violet' },
};
