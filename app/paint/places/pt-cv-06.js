/* SEALED (D-015). pt-cv-06, the salt, close (camp view; the Salt Gallery of pt-b-2.A, round 2): the salt face at
   arm's length, low by the split, filling the frame: beds of grey and white salt, and running through them one of
   the split's chinks, a narrow dark gap going in. The gallery's cold light comes thin through it from beyond.
   Where the air comes through, the salt has grown a skin of fine crystals like frost, needles on the chink's
   lowest lip and in the small cuts below it: the bright note. Quiet: one form, one light. VP into the chink. */
import room from './pt-b-2.A.js';
import { ZS } from './pt-pl-w3-salt-lit.js';

const ZC = ZS + 1.05, YC = .62;                                     /* the chink, past the split's end */
const V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-cv-06',
  name: 'The salt, close',
  line: '',
  cam: { x: -1.3, y: .8, z: ZC - .25, pitch: -3, yaw: -76, f: .66, cx: .5, cy: .5 },
  far: 12, fogK: 1 / 10,
  hazeBase: [.02, .02, .06],
  bloomAt: [-2.2, YC, ZC], bloomPow: 30, bloomC: [.08, .08, .18],
  glow: { threshold: .6, k: .55 },
  blur: { px: 1.2, d0: 1.2, d1: 3, k: .5 },
  lights: [
    { p: [-1.96, YC - .1, ZC - .02], c: V, k: .012, r: .05, reach: .22, shadow: 1 },   /* the gallery's cold light, coming thin out of the chink, onto its lip */
    { p: [-1.5, 1.3, ZC + 1.6], c: V, k: .9, r: 1.1, reach: 3, shadow: .8 },                      /* and along the face, raking the beds */
    { p: [.4, 1.8, ZC - 1.5], c: [.36, .33, .8], k: .6, r: 2 },                                  /* the gallery, faint, on the salt's face */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZC = ${ZC.toFixed(3)}, YC = ${YC.toFixed(3)};
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(2.4, 3.2, p.y));
    d.x += wl * (rough(p, .014, 7.) + rough(p, .005, 23.));
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : M_SALT, NOUV);
    /* beds of salt, grey and white, laid one on another and bent a little */
    float bed = vn(vec2(p.y * 7. + fbm(p.xz * 1.2, 2) * 1.6, 3.));
    gTint = vec3(.55 + .6 * smoothstep(.35, .65, bed));
    gTint *= mix(1., .6, smoothstep(.3, 1.1, length(vec2(p.z - ZC, (p.y - YC) * 1.2))));   /* away from the chink, the salt in the dark */
    if (p.y < .05) gTint *= .3;
    /* the chink: a narrow gap running up through the beds, going back into the dark */
    vec2 t = vec2(p.z - ZC, p.y - YC);
    float along = t.y * .94 + t.x * .34, across = t.x * .94 - t.y * .34 + (fbm(vec2(along * 9., 2.), 2) - .5) * .03 + (fbm(vec2(along * 40., 7.), 2) - .5) * .008;
    float half_ = .016 * (1. - smoothstep(.18, .34, abs(along))) * (.7 + .6 * fbm(vec2(along * 20., 5.), 2));
    float ck = min(min(half_ - abs(across) + .002, p.x + 2.4), -1.8 - p.x);
    if (ck > d.x) { d = vec4(ck, M_SALT, NOUV); gTint = vec3(mix(.6, .04, smoothstep(-1.99, -2.06, p.x))); }
    /* frost: fine needles grown on the chink's lowest lip and in the little cuts below it, where the air comes out */
    float low = smoothstep(.02, -.12, along) * (1. - smoothstep(.0, .09, abs(across) - half_));
    vec2 nd = vec2(p.z, p.y) * vec2(1., 1.);
    float needles = smoothstep(.42, .72, fbm(vec2(dot(nd, vec2(.8, .6)) * 90., dot(nd, vec2(-.6, .8)) * 14.), 3));
    /* the little cuts below: three short scores in the salt, their floors furred with frost */
    float cuts = 1.;
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      vec2 c = vec2(ZC - .07 + fk * .06 + (h2(vec2(fk, 3.)) - .5) * .02, YC - .3 - fk * .015);
      vec2 q = vec2(p.z, p.y) - c;
      cuts = min(cuts, length(vec2(q.x + q.y * .3, max(abs(q.y) - .035 - .015 * h2(vec2(fk, 5.)), 0.))));
    }
    if (p.x < -1.85) d.x += engrave(cuts, .007, .008);
    float fr = max(low, (1. - smoothstep(.002, .008, cuts)) * .9) * step(p.x, -1.9);
    if (fr > 0. && ck < d.x + .01) {
      d.x -= fr * needles * .005;                                                     /* crystals standing off the salt */
      gTint = mix(gTint, vec3(1.8, 1.8, 1.85), fr * (.35 + .65 * needles));
    }
    return d;
  }`,
  anchors: {
    glints: [[-1.99, YC - .08, ZC - .03], [-1.99, YC - .3, ZC], [-1.98, YC + .15, ZC + .05], [-1.99, YC - .2, ZC + .1]].map(p => ({ p })),
    beam: [{ p: [-1.95, YC, ZC], w: .12 }],
  },
  live: { motes: 'violet' },
};
