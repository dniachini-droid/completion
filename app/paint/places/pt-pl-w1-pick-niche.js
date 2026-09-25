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
  cam: { x: .95, y: .56, z: ZN - 1.15, pitch: -13, yaw: 30, f: .6, cx: .5, cy: .5 },
  blur: { px: 1.6, d0: 3, d1: 14, k: .85 },
  lights: [
    { p: [1.3, 1.9, 11], c: V, k: 16, r: 4.5, shadow: .55 },                 /* the gallery's light, further in, coming back along the wall */
    { p: [.4, 1.6, 34], c: V, k: 13, r: 9 },                                 /* far down the gallery */
    { p: [1.74, .31, ZN + .3], c: V, k: .08, r: .2, shadow: .6 },            /* the same light, low along the wall: raking the sill and its strokes */
    { p: [2.12, .37, ZN - .05], c: [.4, .37, .85], k: .04, r: .12 },            /* a trace of it at the niche's back */
    { p: [0, 1.6, -5], c: [.3, .28, .66], k: .5, r: 3 },                     /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZN = ${ZN.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.x > 1.5) gTint *= mix(1., .55, smoothstep(.9, 1.7, p.y));                    /* the right wall darker as it rises out of the low light */
    /* the sill: a ledge of cut stone, three fingers proud of the salt, the length of an arm; its foot and ends
       grow out of the salt (blended, no seam of shadow), its top arris worn round by hands and lit */
    vec3 q = p - vec3(2., .3, ZN); vec2 m = vec2(q.z, q.y);
    float ends = .41 + (fbm(vec2(m.y * 20., 4.), 2) - .5) * .08 - .03 * smoothstep(-.03, -.09, m.y);   /* its ends worn back toward the foot */
    vec3 sq = abs(q - vec3(-.02, -.045, 0.)) - vec3(.03, .045, ends);
    float sillD = length(max(sq, 0.)) + min(max(sq.x, max(sq.y, sq.z)), 0.) - .009 + rough(p, .004, 30.);
    float wallD = d.x;
    d.x = smin(d.x, sillD, .035);
    float isSill = 1. - smoothstep(-.004, .012, sillD - wallD);                          /* how much of this surface is the sill's */
    if (isSill > 0.) {
      d.yzw = vec3(M_CUT_SMALL, NOUV);
      gTint = mix(gTint, vec3(1.05) * (.88 + .24 * fbm(m * 14., 3)), isSill);
      gPolish = .75 * smoothstep(-.03, -.004, m.y) * isSill;                               /* the arris worn bright */
    }
    /* the niche: a long low slot behind the sill, its head nearly flat, its mouth hand-cut; the sill's top is its floor */
    float head = .12 + .04 * (1. - (m.x / .38) * (m.x / .38));
    float slot = min(min(.37 - abs(m.x), head - m.y), m.y);
    slot += rough(p, .03, 6.) * smoothstep(.0, .03, m.y) + rough(p, .012, 19.);
    vec4 sl = vec4(min(slot, .5 - q.x), M_CUT_SMALL, NOUV);
    if (sl.x > d.x) { d = sl; gTint = vec3(mix(.6, .1, smoothstep(.0, .35, q.x))); gPolish = 0.; }   /* the slot goes dark inside */
    /* on the sill's face, a row of empty strokes: V-cuts, hand-made, uneven, tapering to the foot */
    if (q.x < -.02 && q.x > -.08 && m.y < -.012 && m.y > -.09 && abs(m.x) < .36) {
      float k = floor((m.x + .27) / .09), c0 = -.27 + (k + .5) * .09 + (h2(vec2(k, 7.)) - .5) * .03;
      float yc = -.048 + (h2(vec2(k, 11.)) - .5) * .01, tilt = (h2(vec2(k, 2.)) - .5) * .35;
      float ln = length(vec2(m.x - c0 + (m.y - yc) * tilt, max(abs(m.y - yc) - .016 - .008 * h2(vec2(k, 5.)), 0.)));
      if (k >= 0. && k < 6.) d.x += .007 * max(0., 1. - ln / (m.x - c0 > 0. ? .004 : .01));   /* one flank steep, one long: the long one takes the light */
    }
    /* score marks in the salt beside it: short blade cuts, all one way, none alike */
    vec2 w = vec2(m.x - .62, m.y - .28); float kk = floor(w.x / .1);
    float cut = abs(w.x - kk * .1 - .05 - (h2(vec2(kk, 1.)) - .5) * .03 + w.y * (.4 + .15 * h2(vec2(kk, 4.))));
    if (kk >= 0. && kk < 5. && abs(w.y - (h2(vec2(kk, 6.)) - .5) * .05) < .08 + .05 * h2(vec2(kk, 3.)) && q.x > -.15) d.x += engrave(cut, .008, .009);
    return d;
  }`,
  anchors: {
    glints: [[1.92, .6, ZN - .4], [1.92, 1, ZN + .2], [1.92, .5, ZN + .6], [1.93, .9, ZN + 1.1], [1.93, 1.2, ZN - .2]].map(p => ({ p })),
    beam: [{ p: [1.7, .6, ZN + .4], w: .25 }],
    fog: [{ p: [0, .25, ZN + 5], w: 1.4, h: .18, a: .14 }],
  },
  live: { motes: 'violet', fog: 'low' },
};
