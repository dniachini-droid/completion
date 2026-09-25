/* SEALED (D-015). pt-cv-08, her cot (camp view): the Survey Cut (pt-b-1.C's room, reused) from just inside the
   doorway, lower than pt-b-1.C and closer to the cot: its wooden rail running away along the right wall, the canvas
   sagging where someone slept, the boots beneath; on the rail's side, a strip of masking tape with DAY 1 on it in
   marker. The clay lamp's weak warm light from behind; violet in the far corners. */
import room from './pt-b-1.C.js';

const T = [.5815, .455, 1.1];                                        /* the tape, on the cot's inner rail */
export default {
  ...room,
  id: 'pt-cv-08',
  name: 'Her cot',
  line: '',
  cam: { x: .16, y: .74, z: .66, pitch: -19, yaw: 33, f: .92, cx: .5, cy: .5 },   /* crouched just inside the door, lower and closer than pt-b-1.C */
  far: 10, fogK: 1 / 16,
  bloomAt: [.45, .5, 2.4], bloomPow: 12, bloomC: [.06, .045, .024],
  blur: { px: 1.3, d0: .8, d1: 2.6, k: .6 },
  expo: 2.35,
  lights: [
    { ...room.lights[0], k: 11 },                                                          /* the clay lamp, in the passage behind you */
    { p: [.4, .26, 1.05], c: [1, .7, .34], k: .05, r: .22, reach: .6 },                  /* its light ending on the boots' toes, as in pt-b-1.C */
    { p: [.15, 1., 1.3], c: [1, .7, .34], k: .08, r: .35, shadow: 1, reach: 1.3 },          /* the doorway's weak warm pool, lying along the cot and the floor under it */
    { p: [.45, .56, 1.04], c: [1, .72, .38], k: .012, r: .06, reach: .2 },                  /* and ending on the rail, on the tape */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.1, r: 1.2 },                           /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .8, r: 1 },
    { p: [1.05, .9, 2.4], c: [.4, .37, .85], k: .2, r: .6 },                            /* a little violet on the cot's far end */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.)); }
  /* DAY 1 in marker, in the tape's plane (u along the tape, v up; letters 1.2 cm tall) */
  float dayOne(vec2 q) {
    float h = .012, w = .008, e = 1e3;
    vec2 o = q - vec2(-.028, -h * .5);
    /* D */
    e = min(e, seg(o, vec2(0), vec2(0, h)));
    e = min(e, seg(o, vec2(0, h), vec2(w * .55, h * .96)));
    e = min(e, seg(o, vec2(w * .55, h * .96), vec2(w, h * .6)));
    e = min(e, seg(o, vec2(w, h * .6), vec2(w * .92, h * .25)));
    e = min(e, seg(o, vec2(w * .92, h * .25), vec2(w * .5, h * .02)));
    e = min(e, seg(o, vec2(w * .5, h * .02), vec2(0)));
    /* A */
    o.x -= w * 1.45;
    e = min(e, seg(o, vec2(0), vec2(w * .5, h)));
    e = min(e, seg(o, vec2(w * .5, h), vec2(w, 0)));
    e = min(e, seg(o, vec2(w * .22, h * .42), vec2(w * .8, h * .42)));
    /* Y */
    o.x -= w * 1.4;
    e = min(e, seg(o, vec2(0, h), vec2(w * .5, h * .5)));
    e = min(e, seg(o, vec2(w, h * 1.02), vec2(w * .5, h * .5)));
    e = min(e, seg(o, vec2(w * .5, h * .5), vec2(w * .48, 0)));
    /* 1, after a space */
    o.x -= w * 2.1;
    e = min(e, seg(o, vec2(w * .3, h * .78), vec2(w * .55, h)));
    e = min(e, seg(o, vec2(w * .55, h), vec2(w * .52, 0)));
    return e;
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.2) gTint *= mix(1., .45, smoothstep(1.2, 2.2, p.y));               /* the roof close and dark */
    if (p.y < .03) gTint *= mix(.55, 1., smoothstep(.6, 1.1, p.z));                 /* the floor at your feet in your own shadow */
    /* the canvas: a soft sheen along its sag, where someone slept */
    { float u = (p.z - 1.85) / .92, vx = (p.x - .95) / .34;
      float sag = .14 * max(0., 1. - u * u) * (1. - .55 * vx * vx);
      if (abs(vx) < 1. && abs(u) < 1. && abs(p.y - (.47 - sag)) < .016 && d.x < .01) { gTint = vec3(1.15, 1.1, 1.05); gPolish = .3; } }
    /* the masking tape round the rail's side: pale, a little creased, its ends torn */
    vec3 tq = p - vec3(${T.join(', ')});
    float ends = .036 + .002 * sin(tq.y * 900.);
    vec4 tape = box(tq, vec3(0), vec3(.0012, .0165, ends), M_PAPER);
    tape.x += rough(p, .0004, 300.);
    if (tape.x < d.x) {
      d = tape;
      vec2 q = vec2(-tq.z, tq.y);                                                 /* read from the room: left to right is toward the door */
      float ink = 1. - smoothstep(.0007, .0013, dayOne(q));
      gTint = mix(vec3(1.18, 1.1, .92) * (.92 + .12 * fbm(q * 400., 2)), vec3(.1, .1, .13), ink);
    }
    return d;
  }`,
  anchors: {
    beam: [{ p: [.2, .7, 1.4], w: .35 }],
    glints: [{ p: [T[0] - .002, T[1] + .01, T[2] + .02] }],
  },
  live: { motes: 'gold', gold: true },
};
