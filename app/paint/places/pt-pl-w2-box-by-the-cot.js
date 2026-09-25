/* SEALED (D-015). pt-pl-w2-box-by-the-cot, round 2: in her camp (pt-b-1.C's room, reused), pushed against the
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
  expo: 2.2, amb: .2,
  lights: [
    { ...room.lights[0], k: 2.2 },                                                         /* the clay lamp, in the passage behind: further off here */
    { p: [-1.47, .17, 2.33], c: [1, .7, .34], k: .014, r: .05, shadow: 1 },               /* the last of its light, on the mug's rim */
    { p: [-1.45, .34, 2.18], c: [1, .7, .34], k: .006, r: .1, shadow: 1 },                /* and a small pool of it on the box and the floor before it */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: .45, r: 1.2 },                           /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .5, r: 1 },
    { p: [-1.1, .9, 3.1], c: [.4, .37, .85], k: .15, r: .6 },                            /* a little violet along the wall */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > .45) gTint *= mix(1., .16, smoothstep(.45, 1.4, p.y));                /* the walls going dark overhead */
    if (p.y < .03) gTint *= mix(.45, 1., smoothstep(1.9, 2.3, p.z));               /* the floor near you, out of the light */
    vec3 b = p - vec3(${B[0]}, 0, ${B[1]});
    /* the box: card gone soft, its edges slumped, a little crushed on one corner */
    vec4 bx = box(b, vec3(0, .062, 0), vec3(.1, .05, .15), M_PAPER);
    bx.x -= .012 + .005 * (1. - abs(b.y - .06) / .06);                               /* its sides bellied, gone soft */
    bx.x += .016 * smoothstep(.07, 0., length(b - vec3(.1, .112, -.15)));               /* one corner dented in */
    bx.x += rough(p, .003, 45.);
    if (bx.x < d.x) { d = bx; gTint = vec3(.68, .66, .64) * (.8 + .3 * fbm3(p * 30., 3)) * (1. - .3 * smoothstep(.05, 0., b.y)); }   /* pale card, darker where it meets the floor */
    /* the slate across its lid, a count cut in it */
    vec4 sl = box(b, vec3(.004, .128, -.005), vec3(.115, .005, .17), M_SLATE); sl.x -= .002;
    bool cut = false;
    if (b.y > .13 && abs(b.x + .03) < .035 && b.z > -.12 && b.z < .02) {
      float k = floor((b.z + .12) / .018), sz = b.z + .12 - (k + .5) * .018 + (h2(vec2(k, 5.)) - .5) * .006;   /* each stroke its own */
      float xx = b.x + .03 + (h2(vec2(k, 7.)) - .5) * .01; sz += xx * (h2(vec2(k, 3.)) - .5) * .5;
      float e = length(vec2(sz, max(abs(xx) - .012 - .012 * h2(vec2(k, 2.)), 0.)));
      if (k < 7.) { sl.x += engrave(e, .0028, .0025); cut = e < .0028; }
    }
    if (sl.x < d.x) { d = sl; gTint = cut ? vec3(1.9) : vec3(1.05, 1.05, 1.12); }   /* grey-black slate, the count paler where it is cut */
    /* on the slate, a tin mug, upside down: its rim on the slate, its handle to the room */
    vec3 m = b - vec3(.02, .134, .085);
    float rad = .042 - .008 * m.y / .09 + .0015 * sin(atan(m.z, m.x) * 3. + m.y * 40.) * smoothstep(.02, .06, m.y);   /* dented a little */
    float cup = max(length(m.xz) - rad, max(-m.y, m.y - .085));
    cup = max(cup, -max(length(m.xz) - rad + .003, m.y - .079));                 /* hollow, open at the bottom; its base closed above */
    float bead = length(vec2(length(m.xz) - .042, m.y - .003)) - .003;           /* the rolled rim, down on the slate */
    float ring = length(vec2(length(m.xz) - .03, m.y - .085)) - .002;            /* a pressed ring on its upturned base */
    float st = length(vec2(m.x - .05, m.y - .045)) - .022;
    float hd = max(max(abs(st) - .0014, abs(m.z) - .006), .038 - m.x);          /* a thin strap handle toward the room */
    vec4 mug = vec4(min(min(cup, bead), min(ring, hd)) - .0008, M_TIN, NOUV);
    if (mug.x < d.x) { d = mug; gTint = vec3(m.y > .08 ? .55 : .95); }   /* its upturned base dull, the rim below catching the light */
    return d;
  }`,
  anchors: {
    glints: [{ p: [B[0] + .06, .135, B[1] + .085] }, { p: [B[0] + .02, .225, B[1] + .085] }],
    beam: [{ p: [B[0] + .3, .4, B[1] - .2], w: .3 }],
  },
  live: { motes: 'gold', gold: true },
};
