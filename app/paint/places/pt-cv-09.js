/* SEALED (D-015). pt-cv-09, her shelf (camp view): in the Survey Cut (pt-b-1.C's room, reused), the plank shelf on
   the back wall, empty now, seen along its length at eye height. Grey dust lies on it everywhere but in one clean
   stripe, a forearm long, where the rod lay; the bare wood there takes the lamp's weak light as a thin sheen. Under
   the shelf, the pencilled line. The clay lamp's light, weak and warm; violet in the corner beyond. */
import room from './pt-b-1.C.js';

export default {
  ...room,
  id: 'pt-cv-09',
  name: 'Her shelf',
  line: '',
  cam: { x: -1.15, y: 1.38, z: 3.4, pitch: -11, yaw: 54, f: .72, cx: .5, cy: .5 },   /* from the corner past the shelf's end, looking along it toward the cot */
  far: 9, fogK: 1 / 15,
  bloomAt: [-.5, 1.24, 3.82], bloomPow: 26, bloomC: [.045, .034, .016],
  blur: { px: 1.3, d0: 1.2, d1: 2.8, k: .6 },
  expo: 2.3,
  lights: [
    { ...room.lights[0], k: 3.5 },                                                        /* the clay lamp, in the passage */
    { p: [-.45, 1.45, 3.62], c: [1, .72, .38], k: .07, r: .18, warm: .002 },    /* its light, reaching the shelf */
    { p: [-.3, 1.26, 3.7], c: [1, .72, .38], k: .006, r: .06 },                          /* and the last of it low over the far end, given back by the bare wood */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: .9, r: 1.2 },                            /* violet in the far corner */
    { p: [.9, 2.1, 2.2], c: [.4, .37, .85], k: .9, r: 1 },
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .6, r: 1 },
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)')
    .replace(/\n.*M_SLATE, NOUV\)\);\n/, '\n') +              /* the rod is gone from the shelf */ /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.45) gTint *= mix(1., .15, smoothstep(1.45, 2.2, p.y));               /* the vault dark overhead */
    if (p.y < 1.1) gTint *= mix(.45, 1., smoothstep(.5, 1.1, p.y));                 /* the wall and floor below, kept back */
    /* the shelf's top: grey dust everywhere, but one clean stripe where the rod lay */
    if (d.x < .004 && p.y > 1.214 && p.y < 1.225 && abs(p.x + .5) < .44 && p.z > 3.72 && p.z < 3.97) {
      float sx = abs(p.x + .5) - .215, sz = abs(p.z - 3.82 + .003 * sin(p.x * 30.)) - .02;
      float stripe = 1. - smoothstep(-.002, .002, max(sx, sz));
      float dust = (.8 + .4 * fbm(p.xz * 140., 3));
      gTint = mix(vec3(1.85, 1.75, 1.7) * dust, vec3(1.2, 1.1, 1.), stripe);
      gPolish = stripe * .9;
    }
    /* under the shelf, the pencilled line on the wall */
    if (p.z > 3.86 && abs(p.y - 1.1 - .004 * sin(p.x * 9.)) < .004 && p.x > -.86 && p.x < -.18) { gTint = vec3(1.1, 1.1, 1.2); gPolish = .5; }
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.6, 1.45, 3.6], w: .3 }],
  },
  live: { motes: 'gold', gold: true },
};
