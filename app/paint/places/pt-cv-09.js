/* SEALED (D-015). pt-cv-09, her shelf (camp view), round 2: in the Survey Cut (pt-b-1.C's room, reused), the stone
   ledge on the back wall (as in pt-b-2.B), empty now, seen end-on from its right-hand end, at eye height just above
   it, so it runs away from you along the wall into the far corner's violet. Grey dust lies on it everywhere but in
   one clean stripe the shape of the rod (narrow at the point, wider at the handle), where the rod lay; the bare stone
   there is darker and takes the lamp's weak light as a dull sheen, the dust's grain thinning toward its edges.
   Under the ledge, the pencilled line. The clay lamp's light, weak and warm, from the doorway behind. */
import room from './pt-b-1.C.js';

export default {
  ...room,
  id: 'pt-cv-09',
  name: 'Her shelf',
  line: '',
  cam: { x: .1, y: 1.47, z: 3.72, pitch: -17, yaw: -72, f: 1.3, cx: .5, cy: .5 },   /* at the ledge's right-hand end, eye just above it, looking along it */
  far: 9, fogK: 1 / 14,
  bloomAt: [-1.7, 1.4, 3.7], bloomPow: 18, bloomC: [.05, .045, .11],
  blur: { px: 1.3, d0: .8, d1: 2.2, k: .6 },
  expo: 2.2, sheen: 0,
  lights: [
    { ...room.lights[0], k: 4 },                                                          /* the clay lamp, in the passage */
    { p: [-.5, 1.4, 3.66], c: [1, .72, .38], k: .05, r: .2, shadow: 1, reach: .5 },
    { p: [-.9, 1.3, 3.9], c: [1, .72, .38], k: .012, r: .1, reach: .75 },       /* its light, reaching the ledge, weak */
    { p: [-1.5, 1.7, 3.6], c: [.4, .37, .85], k: 1.1, r: .9 },                             /* violet in the far corner */
    { p: [.9, 2.1, 2.2], c: [.4, .37, .85], k: .5, r: 1 },
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)')
    .replace(/\n.*vec3\(-\.5, 1\.2, 3\.84\).*\n/, '\n')                   /* the plank shelf, its pegs and the rod: the ledge is stone, and empty */
    .replace(/\n.*p\.y - 1\.16\)\).*\n/, '\n')
    .replace(/\n.*M_SLATE, NOUV\)\);\n/, '\n') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.3) gTint *= mix(1., .25, smoothstep(1.3, 1.8, p.y));
    if (p.z > 3.97) gTint *= mix(1., .5, smoothstep(-.3, .1, p.x));                  /* the wall beside you in your own shadow */                  /* the vault dark overhead */
    if (p.y < 1.1) gTint *= mix(.4, 1., smoothstep(.5, 1.1, p.y));                    /* the wall and floor below, kept back */
    /* the ledge: cut stone let into the back wall (as pt-b-2.B) */
    vec4 sh = box(p, vec3(-.5, 1.21, 3.9), vec3(.47, .024, .11), M_DRESSED);
    sh.x -= .006; sh.x += rough(p, .003, 22.);
    if (sh.x < d.x) {
      d = sh;
      gTint = vec3(.5, .48, .58) * (.8 + .35 * fbm(p.xz * vec2(9, 14), 3));
      if (p.y > 1.232) {
        /* where the rod lay: its footprint, in the rod's frame (as pt-b-2.B) */
        vec3 q = p - vec3(-.68, 1.262, 3.94); float b = .34, cb = cos(b), sb = sin(b); q.xz = vec2(cb * q.x - sb * q.z, sb * q.x + cb * q.z);
        float u = q.x;
        float bl = 1. - smoothstep(.16, .26, u), tip = sqrt(clamp(u / .06, .08, 1.));
        float w = mix(.011, .015, 1. - bl) * tip + .002;                               /* narrow at the point, wider at the handle */
        float e = max(abs(q.z) - w, max(-u, u - .38));
        float grain = fbm(p.xz * 260., 3);
        float clean = 1. - smoothstep(-.003, .004 + .005 * grain, e);                 /* soft-edged: the dust thins toward it */
        float dust = smoothstep(.0, .03, e) * (.75 + .5 * grain);
        vec3 dustC = vec3(1.45, 1.4, 1.38) * mix(.8, 1., dust) * (.85 + .3 * fbm(p.xz * 90., 2));
        float rim = smoothstep(.0, .003, e) * (1. - smoothstep(.004, .012 + .006 * grain, e));   /* the dust a little heaped along its edge */
        dustC *= 1. + .45 * rim;
        float streak = 1. - smoothstep(0., w * .7, abs(q.z + .002 * sin(u * 40.)));   /* the bare stone, wiped, a dull sheen along its middle */
        gTint = mix(dustC, vec3(.55, .52, .56) * (1. + .35 * streak), clean);
        gPolish = clean;
      }
    }
    /* under the ledge, the pencilled line on the wall */
    if (p.z > 3.97 && abs(p.y - 1.08 - .004 * sin(p.x * 9.)) < .004 && p.x > -.86 && p.x < -.2) { gTint = vec3(.3, .3, .36); gPolish = .6; }
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.55, 1.36, 3.75], w: .25 }],
  },
  live: { motes: 'gold', gold: true },
};
