/* SEALED (D-015). pt-pl-w2-box-by-the-cot, round 1: in her camp (pt-b-1.C's room, reused), pushed against the
   left wall, a box the size of a shoebox, its card gone soft; a thin slate laid across its lid with a count cut in
   it; on the slate a tin mug, upside down. The clay lamp's light comes weak and warm from the doorway; violet in
   the corners. Low, near the floor, looking along the wall. */
import room from './pt-b-1.C.js';

const B = [-1.585, 2.35];                                            /* the box, against the left wall */
export default {
  ...room,
  id: 'pt-pl-w2-box-by-the-cot',
  name: 'The box by the cot',
  line: '',
  cam: { x: -1.3, y: .36, z: 1.95, pitch: -16, yaw: -22, f: .66, cx: .5, cy: .55 },
  far: 8, fogK: 1 / 14,
  bloomAt: [B[0], .3, B[1]], bloomPow: 30, bloomC: [.05, .035, .015],
  blur: { px: 1.2, d0: 1.3, d1: 3.2, k: .6 },
  expo: 2.2,
  lights: [
    { ...room.lights[0], k: 6 },                                                           /* the clay lamp, in the passage behind: further off here */
    { p: [-1.42, .32, 2.3], c: [1, .7, .34], k: .02, r: .1, shadow: 1 },                /* the last of its light, on the mug */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.1, r: 1.2 },                           /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .8, r: 1 },
    { p: [-1.1, .9, 3.1], c: [.4, .37, .85], k: .15, r: .6 },                            /* a little violet along the wall */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > .6) gTint *= mix(1., .3, smoothstep(.6, 1.5, p.y));                  /* the walls going dark overhead */
    vec3 b = p - vec3(${B[0]}, 0, ${B[1]});
    /* the box: card gone soft, its edges slumped, a little crushed on one corner */
    vec4 bx = box(b, vec3(0, .062, 0), vec3(.1, .05, .15), M_PAPER); bx.x -= .012 + .006 * smoothstep(.0, .15, b.z) * smoothstep(0., .1, b.y);
    if (bx.x < d.x) { d = bx; gTint = vec3(.58, .5, .4) * (.85 + .3 * fbm3(p * 30., 3)); }
    /* the slate across its lid, a count cut in it */
    vec4 sl = box(b, vec3(.004, .128, -.005), vec3(.115, .005, .17), M_SLATE); sl.x -= .002;
    if (b.y > .13 && abs(b.x + .03) < .03 && b.z > -.12 && b.z < .02) {
      float k = floor((b.z + .12) / .018), sz = b.z + .12 - (k + .5) * .018;
      if (k < 7.) sl.x += engrave(length(vec2(sz, max(abs(b.x + .03) - .02 - .006 * h2(vec2(k, 2.)), 0.))), .0028, .0025);
    }
    if (sl.x < d.x) d = sl;
    /* on the slate, a tin mug, upside down: its rim on the slate, its handle to the room */
    vec3 m = b - vec3(.02, .134, .085);
    float cup = max(length(m.xz) - .042 + .008 * m.y / .09, max(-m.y, m.y - .085));
    cup = max(cup, -max(length(m.xz) - .036, m.y - .085));                       /* hollow, open at the bottom */
    float hd = length(vec2(length(vec2(m.x - .05, m.y - .045)) - .024, m.z)) - .005;
    hd = max(hd, .038 - m.x);                                                     /* its handle toward the room */
    vec4 mug = vec4(min(cup, hd) - .0015, M_TIN, NOUV);
    if (mug.x < d.x) { d = mug; gTint = vec3(.9); }
    return d;
  }`,
  anchors: {
    glints: [{ p: [B[0] + .06, .135, B[1] + .085] }, { p: [B[0] + .02, .225, B[1] + .085] }],
    beam: [{ p: [B[0] + .3, .4, B[1] - .2], w: .3 }],
  },
  live: { motes: 'gold', gold: true },
};
