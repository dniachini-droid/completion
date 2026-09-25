/* SEALED (D-015). pt-pl-w1-pick-niche, round 8 (room scale, D-075; the Salt Gallery of pt-b-2.A, reused):
   a niche the length of an arm, low in the gallery's right wall: a long low slot with a cut-stone lip, the salt
   running straight to it; a row of empty strokes cut in the lip; beside it, in the salt, short score marks from
   a blade. The salt is banded grey and white (salt.pink stays 0); the one light is the gallery's cold violet,
   coming back along the wall from further in (from the left as you crouch facing the niche). Crouched, a
   stride and a half off, three-quarter on the niche; the gallery runs away low on the left. */
import room from './pt-b-2.A.js';

const ZN = 6;                                                       /* where the niche is */
const V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-pl-w1-pick-niche',
  name: 'The pick niche',
  line: '',
  cam: { x: 1.05, y: .8, z: ZN - 1.0, pitch: -18, yaw: 34, f: .6, cx: .5, cy: .5 },
  blur: { px: 1.6, d0: 3, d1: 14, k: .85 },
  lights: [
    { p: [1.3, 1.9, 11], c: V, k: 16, r: 4.5, shadow: .55 },                 /* the gallery's light, further in, coming back along the wall */
    { p: [.4, 1.6, 34], c: V, k: 13, r: 9 },                                 /* far down the gallery */
    { p: [2.03, .38, ZN + .3], c: V, k: .09, r: .15, reach: .6, shadow: 1 },            /* the same light, low along the wall: raking the sill and its strokes */
    { p: [2.1, .38, ZN + .15], c: [.4, .37, .85], k: .03, r: .1, reach: .35 },            /* a trace of it at the niche's back */
    { p: [0, 1.6, -5], c: [.3, .28, .66], k: .5, r: 3 },                     /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZN = ${ZN.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.x > 1.5) gTint *= mix(1., .5, smoothstep(.5, 1.8, length(vec2(p.z - ZN - .1, (p.y - .35) * 1.4))));   /* the salt away from the niche falls into the dark */
    if (p.x > 1.5) gTint *= .82 + .3 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds, grey and white */
    vec3 q = p - vec3(2., .3, ZN); vec2 m = vec2(q.z, q.y);
    /* the sill: the slot's own cut stone, flush with the salt's face, the length of an arm under the mouth; its
       face dressed flat (the salt's grain gone), its edges dying softly into the salt */
    float ends = .43 + (fbm(vec2(m.y * 11., 4.), 2) - .5) * .09;
    float foot = -.045 + (fbm(vec2(m.x * 7., 9.), 2) - .5) * .03;
    float sill = smoothstep(ends, ends - .05, abs(m.x)) * smoothstep(foot - .03, foot + .02, m.y) * (1. - smoothstep(.0, .02, m.y - .0)) * step(q.x, .12);
    if (sill > 0. && q.x > -.1) {
      float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(2.4, 3.2, p.y));
      d.x -= sill * wl * rough(p, .006, 23.);                                             /* dressed: the salt's fine crystals gone from it */
      d.yzw = vec3(M_CUT_SMALL, NOUV);
      gTint = mix(gTint, vec3(.92) * (.9 + .2 * fbm(m * 12., 3)), sill);
    }
    /* the niche: a long low slot cut into the salt, its head nearly flat; the sill's top is its floor; every edge
       of the mouth rounded by the pick and by hands */
    float head = .13 + .04 * (1. - (m.x / .38) * (m.x / .38));
    float slot = min(min(.37 - abs(m.x), head - m.y), m.y);
    slot += rough(p, .025, 5.) * smoothstep(.0, .05, m.y);                               /* the head and ends hand-cut; the floor kept level */
    slot = min(slot, .45 - q.x);
    d.x = -smin(-d.x, -slot, .02);
    if (slot > -.004 && q.x > .005) {
      d.yzw = vec3(M_CUT_SMALL, NOUV);
      gTint = vec3(mix(.9, .12, smoothstep(.04, .4, q.x)) * (1. - .5 * smoothstep(.02, .12, m.y)));   /* the inside: its floor catching the light near the mouth, then dark */
    }
    gPolish = .8 * sill * (1. - smoothstep(.0, .02, abs(q.x - .005) + max(-m.y, 0.)));    /* the arris, worn bright by hands */
    /* on the lip, a row of empty strokes: V-cuts across the sill's top, hand-made, none alike */
    if (abs(m.y) < .02 && q.x > -.01 && q.x < .1 && abs(m.x) < .36) {
      float k = floor((m.x + .3) / .1), c0 = -.3 + (k + .5) * .1 + (h2(vec2(k, 7.)) - .5) * .03;
      float xc = .042 + (h2(vec2(k, 11.)) - .5) * .012, tilt = (h2(vec2(k, 2.)) - .5) * .4;
      float ln = length(vec2(m.x - c0 + (q.x - xc) * tilt, max(abs(q.x - xc) - .022 - .01 * h2(vec2(k, 5.)), 0.)));
      if (k >= 0. && k < 6.) d.x += .008 * max(0., 1. - ln / (m.x - c0 > 0. ? .005 : .011));   /* one flank steep, one long */
    }
    /* score marks in the salt beside it: short blade cuts, all one way, none alike */
    vec2 w = vec2(m.x - .62, m.y - .28); float kk = floor(w.x / .1);
    float cut = abs(w.x - kk * .1 - .05 - (h2(vec2(kk, 1.)) - .5) * .045 + w.y * (.25 + .35 * h2(vec2(kk, 4.))));
    if (kk >= 0. && kk < 5. && abs(w.y - (h2(vec2(kk, 6.)) - .5) * .09) < .05 + .07 * h2(vec2(kk, 3.)) && q.x > -.15) d.x += engrave(cut, .008, .009);
    return d;
  }`,
  anchors: {
    glints: [[1.93, .6, ZN - .4], [1.93, .75, ZN + .2], [1.93, .5, ZN + .5], [2.02, .31, ZN + .1]].map(p => ({ p })),
    beam: [{ p: [1.8, .45, ZN + .1], w: .25 }],
    fog: [{ p: [1.3, .15, ZN + 1.2], w: 1.2, h: .16, a: .14 }],
  },
  live: { motes: 'violet', fog: 'low' },
};
