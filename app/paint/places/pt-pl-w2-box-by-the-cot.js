/* SEALED (D-015). pt-pl-w2-box-by-the-cot, round 3 (room scale, D-075): in her camp (pt-b-1.C's room, reused),
   pushed against the left wall across from her cot, a box the size of a shoebox, its grey card gone soft; a thin
   slate laid across its lid, a little askew, with a count cut in it; on the slate a dented tin mug, upside down, one
   side of its rim just lifted off the slate. The clay lamp's light comes weak and warm from the doorway and ends as
   one warm line on the mug's rim; the rest sits in violet half-light. Low, near the floor, looking along the wall. */
import room from './pt-b-1.C.js';

const B = [-1.585, 2.35];                                            /* the box, against the left wall */
export default {
  ...room,
  id: 'pt-pl-w2-box-by-the-cot',
  name: 'The box by the cot',
  line: '',
  cam: { x: -.93, y: .6, z: 1.45, pitch: -20, yaw: -36, f: .76, cx: .5, cy: .5 },   /* crouched in the middle of the room, turned to the wall */
  far: 9, fogK: 1 / 15,
  bloomAt: [B[0] + .02, .2, B[1] + .08], bloomPow: 30, bloomC: [.04, .03, .014],
  blur: { px: 1.2, d0: 1.1, d1: 2.8, k: .6 },
  expo: 2.2, amb: .26, ambC: [.9, .8, 1.35],
  lights: [
    { ...room.lights[0], k: 5 },                                                          /* the clay lamp, in the passage behind */
    { p: [-1.42, .3, 2.22], c: [.62, .58, .9], k: .018, r: .1, shadow: .6 },               /* a cold lift on the mug from the room */
    { p: [-1.49, .145, 2.33], c: [1, .74, .42], k: .0025, r: .015 },                      /* and the lamp's last, one warm touch on the rim */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: .55, r: 1.2 },                           /* violet in the far corners */
    { p: [-1.28, .2, 2.02], c: [1, .7, .34], k: .025, r: .16, shadow: 1 },                             /* the doorway's light, a weak warm pool on the floor short of the box */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .5, r: 1 },
    { p: [-1.3, .38, 2.12], c: [.42, .38, .82], k: .04, r: .22 },                          /* violet half-light on the box */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > .6) gTint *= mix(1., .3, smoothstep(.6, 1.7, p.y));                  /* the walls going dark overhead */
    if (p.y < .03) gTint *= mix(.35, 1., smoothstep(1.5, 2.25, p.z));                 /* the floor near you, out of the light */
    vec3 b = p - vec3(${B[0]}, 0, ${B[1]});
    /* the box: grey card gone soft, its edges slumped, a little crushed on one corner */
    vec4 bx = box(b, vec3(0, .062, 0), vec3(.1, .05, .15), M_PAPER);
    bx.x -= .01 + .003 * (1. - abs(b.y - .06) / .06);                                /* its sides a little bellied */
    bx.x += .016 * smoothstep(.07, 0., length(b - vec3(.1, .112, -.15)));               /* one corner dented in */
    vec4 lid = box(b, vec3(0, .1, 0), vec3(.104, .018, .154), M_PAPER); lid.x -= .006;   /* its lid, a little wider, sitting on it */
    bx.x = min(bx.x, lid.x);
    bx.x += rough(p, .002, 45.);
    if (bx.x < d.x) { d = bx; gTint = vec3(.95, .98, 1.12) * (.85 + .25 * fbm3(p * 30., 3)) * (1. - .35 * smoothstep(.05, 0., b.y)); }   /* soft grey card, darker at the floor */
    /* the slate laid across the lid, smaller than it and a little askew, a count cut in it */
    float sa = .1, cs = cos(sa), sn = sin(sa);
    vec3 s = b - vec3(.01, .128, .0); s.xz = vec2(cs * s.x - sn * s.z, sn * s.x + cs * s.z);
    vec4 sl = box(s, vec3(0), vec3(.082, .005, .118), M_SLATE); sl.x -= .002;
    bool cut = false;
    if (s.y > .002 && abs(s.x + .025) < .03 && s.z > -.1 && s.z < .02) {
      float k = floor((s.z + .1) / .017), sz = s.z + .1 - (k + .5) * .017 + (h2(vec2(k, 5.)) - .5) * .005;
      float xx = s.x + .025 + (h2(vec2(k, 7.)) - .5) * .008; sz += xx * (h2(vec2(k, 3.)) - .5) * .25;
      float e = length(vec2(sz, max(abs(xx) - .011 - .01 * h2(vec2(k, 2.)), 0.)));
      if (k < 7.) { sl.x += engrave(e, .0024, .0022); cut = e < .0024; }
    }
    if (sl.x < d.x) { d = sl; gTint = cut ? vec3(1.3) : vec3(.95, .95, 1.02); }
    /* on the slate, a tin mug, upside down: its rim on the slate, one side lifted a hair off it; its handle to the room */
    vec3 m = s - vec3(.02, .0065, .06);
    float ta = .045, ct = cos(ta), st2 = sin(ta); m.xy = vec2(ct * m.x + st2 * m.y, -st2 * m.x + ct * m.y);   /* tipped a little */
    m.y -= .0022;
    float rad = .04 - .006 * m.y / .09 + .0015 * sin(atan(m.z, m.x) * 3. + m.y * 40.) * smoothstep(.02, .06, m.y);   /* dented */
    float cup = max(length(m.xz) - rad, max(-m.y, m.y - .085));
    cup = max(cup, -max(length(m.xz) - rad + .003, m.y - .08));                 /* hollow, open at the bottom */
    float bead = length(vec2(length(m.xz) - .0405, m.y - .003)) - .0028;        /* the rolled rim, down on the slate */
    float st = length(vec2(m.x - .044, (m.y - .03) * 1.15)) - .02;                  /* the handle set low, near the rim: the mug is upside down */
    float hd = max(max(abs(st) - .0016, abs(m.z) - .007), .036 - m.x);          /* a thin strap handle */
    vec4 mug = vec4(min(min(cup, bead), hd) - .0008, M_TIN, NOUV);
    if (mug.x < d.x) { d = mug; gTint = vec3(.72, .76, .86) * (m.y > .082 ? 1.15 - .3 * smoothstep(.003, .0, abs(length(m.xz) - .028)) : 1.); gPolish = bead < .002 ? .8 : 0.; if (bead >= .002) { gStain = .3; gTint *= 1.25; } }   /* cool grey tin; its upturned base dull */
    return d;
  }`,
  anchors: {
    glints: [{ p: [B[0] + .06, .137, B[1] + .065] }],
    beam: [{ p: [B[0] + .4, .45, B[1] - .3], w: .3 }],
  },
  live: { motes: 'gold', gold: true },
};
