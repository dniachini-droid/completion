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
  cam: { x: -1.32, y: .4, z: 1.78, pitch: -17, yaw: -22, f: 1.3, cx: .5, cy: .5 },   /* crouched low near the wall, a long step from the box, looking along the wall */
  far: 9, fogK: 1 / 15,
  bloomAt: [B[0] + .02, .2, B[1] + .08], bloomPow: 30, bloomC: [.04, .03, .014],
  blur: { px: 1.2, d0: 1.1, d1: 2.8, k: .6 },
  expo: 2.2, amb: .26, ambC: [.9, .8, 1.35],
  lights: [
    { ...room.lights[0], k: 5 },                                                          /* the clay lamp, in the passage behind */
    { p: [-1.42, .52, 2.16], c: [1, .7, .34], k: .035, r: .2, shadow: 1, reach: .5 },       /* the doorway's light, weak and warm, falling on the box's front */
    { p: [-1.505, .185, 2.335], c: [1, .76, .45], k: .002, r: .02, reach: .07, shadow: 1 },              /* and the lamp's last, one warm touch on the mug's rim */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: .8, r: 1.2 },                            /* violet in the far corners */
    { p: [-1.36, .3, 2.3], c: [.6, .56, .9], k: .03, r: .1, reach: .35 },                /* a cold lift on the mug from the room */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .5, r: 1 },
    { p: [-1.2, .5, 2.6], c: [.42, .38, .82], k: .1, r: .35 },                             /* violet half-light over the box */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > .3) gTint *= mix(1., .2, smoothstep(.3, 1., p.y));                  /* the walls going dark overhead */
    if (p.y < .03) gTint *= mix(.35, 1., smoothstep(1.5, 2.25, p.z));                 /* the floor near you, out of the light */
    vec3 b = p - vec3(${B[0]}, 0, ${B[1]});
    /* the box: grey card gone soft, its edges slumped, a little crushed on one corner */
    vec4 bx = box(b, vec3(0, .062, 0), vec3(.094, .044, .144), M_PAPER);
    bx.x -= .016 + .005 * (1. - abs(b.y - .06) / .06);                                /* its sides a little bellied */
    bx.x += .012 * smoothstep(.1, 0., length(b - vec3(.1, .11, -.15)));
    bx.x += .006 * smoothstep(.06, 0., length(b.zy - vec2(-.04, .08))) * step(.08, b.x);   /* a soft dent in its side */               /* one corner dented in */
    vec4 lid = box(b, vec3(0, .1 - .006 * (1. - b.z * b.z / .02), 0), vec3(.098, .014, .148), M_PAPER); lid.x -= .008;   /* its lid, a little wider, sagging in the middle */   /* its lid, a little wider, sitting on it */
    bx.x = min(bx.x, lid.x);
    bx.x += rough(p, .002, 45.);
    if (bx.x < d.x) { d = bx; gTint = vec3(.72, .74, .98) * (.8 + .35 * fbm3(p * 22., 3)) * (1. - .4 * smoothstep(.05, 0., b.y)); }   /* soft grey card, darker at the floor */
    /* the slate laid across the lid, smaller than it and a little askew, a count cut in it */
    float sa = .32, cs = cos(sa), sn = sin(sa);
    vec3 s = b - vec3(.018, .122, .01); s.xz = vec2(cs * s.x - sn * s.z, sn * s.x + cs * s.z);
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
    float ta = -.16, ct = cos(ta), st2 = sin(ta); m.zy = vec2(ct * m.z + st2 * m.y, -st2 * m.z + ct * m.y);   /* tipped a little */
    m.y -= .0022;
    float rad = .04 - .006 * m.y / .09 + .0015 * sin(atan(m.z, m.x) * 3. + m.y * 40.) * smoothstep(.02, .06, m.y);   /* dented */
    float cup = max(length(m.xz) - rad, max(-m.y, m.y - .085));
    cup = max(cup, -max(length(m.xz) - rad + .003, m.y - .08));                 /* hollow, open at the bottom */
    float bead = length(vec2(length(m.xz) - .0405, m.y - .003)) - .0028;        /* the rolled rim, down on the slate */
    float st = length(vec2(m.x - .044, (m.y - .03) * 1.15)) - .02;                  /* the handle set low, near the rim: the mug is upside down */
    float hd = max(max(abs(st) - .0016, abs(m.z) - .007), .036 - m.x);          /* a thin strap handle */
    vec4 mug = vec4(min(min(cup, bead), hd) - .0008, M_TIN, NOUV);
    if (mug.x < d.x) { d = mug; gTint = vec3(.72, .76, .86) * (m.y > .08 ? .45 : 1.); gPolish = bead < .002 ? 1. : 0.; if (bead < .002) gTint *= 2.2; else { gStain = .25; gTint *= 1.5; } }   /* cool grey tin; its upturned base dull */
    return d;
  }`,
  anchors: {
    glints: [{ p: [B[0] + .06, .137, B[1] + .065] }],
    beam: [{ p: [B[0] + .15, .3, B[1] - .2], w: .2 }],
  },
  live: { motes: 'gold', gold: true },
};
