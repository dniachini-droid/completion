/* SEALED (D-015). pt-cv-06, the salt, close (camp view; the Salt Gallery of pt-b-2.A, reused, at the split of
   pt-pl-w3-salt-lit): the salt face at a stride, banded, the split packed with its river stones, and the band
   with its tally running into it. Where the air comes through the chinks between the stones, the salt has grown
   a skin of fine crystals, like frost, in the cuts nearest the split. Quiet: one form, one light (the gallery's
   cold violet, coming thin through the chinks). VP into the split. */
import room from './pt-b-2.A.js';
import { ZS, SPLIT } from './pt-pl-w3-salt-lit.js';

const V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-cv-06',
  name: 'The salt, close',
  line: '',
  cam: { x: -.85, y: 1.0, z: ZS - 1.0, pitch: -16, yaw: -46, f: .62, cx: .5, cy: .5 },
  far: 20,
  bloomAt: [-2.4, 1.2, ZS], bloomPow: 30, bloomC: [.12, .11, .26],
  glow: { threshold: .6, k: .6 },
  blur: { px: 1.4, d0: 1.6, d1: 5, k: .7 },
  lights: [
    { p: [-2.02, .5, ZS - .22], c: V, k: .03, r: .14, shadow: .6 },              /* the gallery's light, coming thin through the chinks, onto the frost */
    { p: [-1.75, .8, ZS + .15], c: V, k: .12, r: .5, shadow: .8 },                  /* and lower down, from inside the split */
    { p: [.6, 1.8, ZS + 3], c: [.36, .33, .8], k: 4.5, r: 2.5 },                   /* the gallery beyond, faint */
    { p: [0, 1.6, ZS - 4], c: [.3, .28, .66], k: .8, r: 3 },                     /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + SPLIT + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y < .05) gTint *= .4;                                                        /* the floor kept down */
    gTint *= mix(1., .55, smoothstep(.3, 1.4, abs(p.z - ZS)));                        /* the salt away from the split in the dark */
    vec4 a = splitAir(p);
    if (a.x > d.x) { d = a; gTint = vec3(mix(.6, .1, smoothstep(-2.0, -2.18, p.x))); }
    vec4 s = stones(p);
    if (s.x < d.x) { d = s; gTint = vec3(.6, .45, .33) * (.75 + .5 * h2(floor(vec2(p.z, p.y) / .085))); gPolish = .4; }
    /* frost: where the air comes through the chinks, the salt at the split's lower lips has grown a skin of
       fine crystals, white, standing a little proud */
    float lip = -a.x;                                                                   /* how far into the salt from the split's edge */
    float fr = (1. - smoothstep(.0, .07 + .04 * fbm(vec2(p.y * 9., p.z * 9.), 2), lip)) * (1. - smoothstep(.55, 1.05, p.y)) * smoothstep(.04, .12, p.y);
    if (fr > 0. && p.x > -2.15 && s.x > .004 && d.x < .03) {
      d.x -= fr * (.004 + .01 * fbm3(p * 90., 3));                                     /* the crystals, not a coat of paint */
      d.yzw = vec3(M_SALT, NOUV);
      gTint = mix(gTint, vec3(1.7, 1.7, 1.75), fr);
    }
    return d;
  }`,
  anchors: {
    glints: [[-2.02, .5, ZS - .25], [-2.02, .7, ZS + .3], [-1.98, .35, ZS - .3], [-2.05, .9, ZS + .05]].map(p => ({ p })),
  },
  live: { motes: 'violet' },
};
