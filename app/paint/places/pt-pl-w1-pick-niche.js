/* SEALED (D-015). pt-pl-w1-pick-niche, round 3 (the kit's rock salt): a niche the length of an arm, low in
   the salt gallery's right wall: a long low slot with a cut-stone lip, the salt running straight to it; a row
   of empty strokes cut in the lip; beside it, in the salt, short score marks from a blade. The salt is banded
   grey and white (salt.pink stays 0: pink belongs to the lit salt of a later week, not here); the one light is
   the gallery's cold violet, raking along the wall from the left. Crouched, three-quarter on the niche. */
const ZN = 6;                                                       /* where the niche is */
export default {
  id: 'pt-pl-w1-pick-niche',
  name: 'The pick niche',
  line: '',
  cam: { x: 1.0, y: .5, z: ZN - .8, pitch: -9, yaw: 40, f: .64, cx: .5, cy: .5 },
  far: 45, fogK: 1 / 30, hazeFar: [.1, .09, .26],
  bloomAt: [-.3, 1.2, ZN + 34], bloomPow: 14, bloomC: [.44, .41, .82],
  glow: { threshold: .62, k: .7 },
  blur: { d0: 3, d1: 16 },
  expo: 1.75, grade: [1.1, 1, .9], grain: .4, shadowJitter: 1,
  salt: { pink: 0 },
  lights: [
    { p: [-1.1, 1.1, ZN + 7.5], c: [.62, .58, 1.2], k: 8, r: 4, shadow: 1 },   /* the gallery's light, raking along the wall from the left */
    { p: [-.3, 1.5, ZN + 32], c: [.62, .58, 1.2], k: 40, r: 9 },                 /* far down the gallery */
    { p: [1.62, .34, ZN + .5], c: [.62, .58, 1.2], k: .3, r: .22, shadow: 1 },      /* the same light, low from the front-left, raking the lip and its strokes */
    { p: [2.15, .35, ZN], c: [.4, .37, .85], k: .02, r: .25 },                    /* a trace of it at the niche's back */
    { p: [0, 1.4, ZN - 5], c: [.3, .28, .66], k: .4, r: 3 },                        /* faint fill from behind */
    { p: [.6, 1.5, ZN + 1.2], c: [.36, .33, .8], k: .12, r: 1.2 },                   /* a little of it up under the low roof, so the roof has form */
  ],
  glsl: /* glsl */ `
  const float ZN = ${ZN}.;
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    /* rock salt on the walls: uneven beds, pushed in and out a little */
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(1.9, 2.6, p.y));
    d.x += wl * rough(p, .05, 5.);
    /* the roof dips low between here and the light: the rock above you stays in shadow */
    d.x = min(d.x, (2.05 + 2.6 * smoothstep(.8, 3.2, abs(p.z - ZN - 2.8)) - p.y + rough(p, .12, 2.)) * .7);
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : (wl > .1 && p.y < 2.2 ? M_SALT : M_ROCK), NOUV);
    gTint = vec3(1. - .45 * smoothstep(1.1, 2., p.y));                               /* the salt goes dark as it rises out of the light */
    /* the niche: a long low slot, its head nearly flat, in a lip of cut stone */
    vec3 q = p - vec3(2., .3, ZN); vec2 m = vec2(q.z, q.y);
    float head = .12 + .04 * (1. - (m.x / .38) * (m.x / .38));
    float slot = min(min(.38 - abs(m.x), head - m.y), m.y);
    slot += rough(p, .03, 7.);                                                           /* the mouth hand-cut, uneven */
    d = A(d, vec4(min(slot, .55 - q.x), M_CUT_SMALL, NOUV));
    if (q.x > .06) gTint = vec3(mix(.6, .2, smoothstep(.06, .4, q.x)));                    /* the slot goes dark inside */
    /* its lip: the slot's floor carried out as a band of cut stone set flush in the salt, its arris worn round
       by hands; its ends feathered into the salt */
    float foot = -.105 + (fbm(vec2(m.x * 34., 1.), 3) - .5) * .016, end = .41 + (fbm(vec2(m.y * 30., 3.), 3) - .5) * .05;   /* ragged where it meets the salt */
    float band = (1. - smoothstep(end - .03, end + .03, abs(m.x))) * smoothstep(foot - .012, foot + .012, m.y) * step(m.y, .01);
    if (band > .5 && q.x < .06) { d.yzw = vec3(M_DRESSED, NOUV); gTint = vec3(.92); }
    d.x -= .008 * band * smoothstep(.06, -.02, q.x);                                     /* barely proud, and only at its face */
    /* on its face, a row of empty strokes: hand-cut, uneven, tapering to the foot */
    if (q.x < .01 && q.x > -.09 && m.y < 0. && m.y > -.09) {
      float k = floor((m.x + .25) / .1), c0 = -.25 + (k + .5) * .1 + (h2(vec2(k, 7.)) - .5) * .03;
      float t = clamp((m.y + .07) / .05, 0., 1.);
      float ln = length(vec2(m.x - c0 + (h2(vec2(k, 2.)) - .5) * .01 * t, max(abs(m.y + .045) - .022 - .006 * h2(vec2(k, 5.)), 0.)));
      if (k >= 0. && k < 5.) d.x += engrave(ln, .007 + .006 * t, .01);
    }
    /* score marks in the salt beside it: short blade cuts, all one way */
    vec2 w = vec2(m.x - .72, m.y - .25); float kk = floor(w.x / .12);
    float cut = abs(w.x - kk * .12 - .06 + w.y * .45);
    if (kk >= 0. && kk < 5. && abs(w.y) < .12 + .05 * h2(vec2(kk, 3.)) && q.x > -.15) d.x += engrave(cut, .011, .012);
    return d;
  }`,
  anchors: {
    glints: [[1.9, .6, ZN - .4], [1.9, 1, ZN + .2], [1.9, .5, ZN + .6], [1.92, .9, ZN + 1.1], [1.9, .75, ZN + .45], [1.9, 1.2, ZN - .2]].map(p => ({ p })),
    beam: [{ p: [1.3, 1.3, ZN + 1.4], w: .2 }, { p: [1.8, .1, ZN + .2], w: .3 }],
  },
  live: { motes: 'violet' },
};
