/* SEALED (D-015). pt-pl-w2-above-the-ring, round 1 (the Salt Gallery's left wall, as pt-b-2.A): looking up
   from under the lone ring. Over it the salt has a crack two fingers wide, running up; beside the crack, cut
   small, a count. Far back in the crack, something pale, too far in to reach: seen only as a highlight in the
   dark. The one light is the gallery's violet, raking across the salt from the left. */
const ZR = 3.4;                                                     /* the lone ring, as in pt-b-2.A */
export default {
  id: 'pt-pl-w2-above-the-ring',
  name: 'Above the ring',
  line: '',
  cam: { x: -1.2, y: 1.3, z: ZR - .12, pitch: 26, yaw: -90, f: .78, cx: .5, cy: .56 },
  far: 20, fogK: 1 / 22, hazeFar: [.08, .07, .2],
  bloomAt: [-2.3, 2.15, ZR + .02], bloomPow: 40, bloomC: [.1, .09, .2],
  glow: { threshold: .6, k: .7 },
  blur: { px: 1.2, d0: 1.6, d1: 5, k: .6 },
  expo: 1.7, grade: [1.1, 1, .9], grain: .4, shadowJitter: 1,
  salt: { pink: 0 },
  lights: [
    { p: [-1.45, 2.3, ZR + 1.6], c: [.62, .58, 1.2], k: 2.4, r: 1.1, shadow: 1 },   /* the gallery's light, raking across the salt from the left */
    { p: [-2.22, 2.12, ZR + .03], c: [.62, .58, 1.2], k: .004, r: .06 },            /* the little of it that gets far into the crack, onto the pale thing */
    { p: [-.5, 1.4, ZR - 3], c: [.3, .28, .66], k: .3, r: 2.5 },                    /* faint fill from behind */
  ],
  glsl: /* glsl */ `
  const float ZR = ${ZR.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(2.4, 3.2, p.y));
    d.x += wl * rough(p, .05, 5.);
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : (p.y < 3.2 ? M_SALT : M_ROCK), NOUV);
    gTint = vec3(1. - .6 * smoothstep(2.4, 3.1, p.y));
    /* the lone ring below */
    vec2 rq = vec2(p.z - ZR, p.y - 1.66);
    if (p.x < -1.6) { float rr = abs(length(rq) - .12); d.x += engrave(rr, .017, .016); if (rr < .018) gPolish = .6; }
    /* the crack: two fingers wide, wandering up from over the ring, going back into the dark */
    float cz = ZR + .02 + (fbm(vec2(p.y * 5., 3.), 3) - .5) * .06 + (p.y - 1.9) * .03;
    float w = (.02 + .008 * fbm(vec2(p.y * 14., 7.), 2)) * smoothstep(1.82, 1.9, p.y) * (1. - smoothstep(2.45, 2.62, p.y));
    float crack = min(w - abs(p.z - cz), -2.42 - p.x + .5);
    d = A(d, vec4(min(crack, min(p.y - 1.8, 2.66 - p.y)), M_SALT, NOUV));
    if (p.x < -2.03 && abs(p.z - cz) < w + .01) gTint = vec3(mix(.35, .05, smoothstep(-2.03, -2.3, p.x)));   /* dark as it goes in */
    /* far back in it, something pale, too far in to reach */
    vec4 pale = box(p, vec3(-2.36, 2.13, cz), vec3(.012, .045, .006), M_PAPER); pale.x -= .003;
    if (pale.x < d.x) { d = pale; gTint = vec3(1.15, 1.12, 1.05); }
    /* beside the crack, a count, cut small */
    if (p.x < -1.7 && abs(p.y - 2.08) < .04 && p.z > ZR + .07 && p.z < ZR + .2) {
      float k = floor((p.z - ZR - .07) / .025), sz = p.z - ZR - .07 - (k + .5) * .025;
      d.x += engrave(length(vec2(sz, max(abs(p.y - 2.08) - .022 - .006 * h2(vec2(k, 1.)), 0.))), .0045, .006);
    }
    return d;
  }`,
  anchors: {
    glints: [[-2.35, 2.15, ZR + .02], [-1.97, 1.78, ZR + .12], [-1.96, 2.3, ZR - .2], [-1.97, 1.55, ZR - .3]].map(p => ({ p })),
    beam: [{ p: [-1.6, 2.2, ZR + .5], w: .2 }],
  },
  live: { motes: 'violet' },
};
