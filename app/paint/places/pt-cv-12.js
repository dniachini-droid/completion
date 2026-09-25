/* SEALED (D-015). pt-cv-12, camp view: the first turn (the Stair's room, pt-cv-10, reused). Standing on the turn
   landing, looking down past the rail: the rail curls round the corner of the turn and runs away down the second
   flight, the frame's line; below, the little door with its count, where the flight meets the eye (the vanishing
   point). On the rail's worn top, just past the curl, a short pencil tick across it and, beside it in her hand,
   0.9 m: the look-at. The Stair's lamps (warm); fog spilling down the second flight.

   This file also carries the little door (shared with pt-cv-13): a small stone door set in the second flight's far
   wall, on one tread, its count above it (full), a sharp-edged ring beside it among worn ones. */
import { STAIR_GLSL, STAIR_LOOK, LAMP2, lampLight, ramp1, ramp2 } from './pt-cv-10.js';

/* the second flight goes on down, past the door, into the dark */
export const STAIR2_GLSL = STAIR_GLSL.replace('-SW, 16., M_CUT', '-SW, 30., M_CUT').replace('ST_T, ST_R, 16, M_FLOOR', 'ST_T, ST_R, 40, M_FLOOR').replace('clamp(x - SW, 0., 8.)', 'clamp(x - SW, 0., 22.)');

export const DOOR = { x: 6.275, y: ramp2(6.275) - .42 * 1 + .0, w: .275, h: 1.0 };   /* centre x, sill y (on its tread), half width, height */
DOOR.y = -5.04 - .42 * (Math.floor((DOOR.x - 1.6) / .55) + 1);

/* a few pencil letters: segments in a plane (u right, v up), 1 unit = letter height */
export const PENCIL_GLSL = /* glsl */ `
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.)); }
  float oval(vec2 p, vec2 c, vec2 r) { return abs(length((p - c) / r) - 1.) * min(r.x, r.y); }
  float gZero(vec2 o) { return oval(o, vec2(.28, .5), vec2(.28, .5)); }
  float gDot(vec2 o) { return length(o - vec2(.06, .04)) - .02; }
  float gNine(vec2 o) { return min(oval(o, vec2(.27, .7), vec2(.26, .28)), seg(o, vec2(.53, .72), vec2(.46, 0.))); }
  float gM(vec2 o) { return min(min(seg(o, vec2(0), vec2(0, .55)), seg(o, vec2(0, .42), vec2(.2, .55))), min(seg(o, vec2(.2, .55), vec2(.25, 0.)), min(seg(o, vec2(.25, .42), vec2(.45, .55)), seg(o, vec2(.45, .55), vec2(.5, 0.))))); }
  float gO(vec2 o) { return oval(o, vec2(.22, .28), vec2(.22, .28)); }
  float gP(vec2 o) { return min(seg(o, vec2(0, .56), vec2(0, -.35)), oval(o, vec2(.2, .3), vec2(.2, .26))); }
  float gE(vec2 o) { float a = atan(o.y - .28, o.x - .22); float ring = oval(o, vec2(.22, .28), vec2(.22, .28)); if (a < -.1 && a > -.9) ring = 1.; return min(ring, seg(o, vec2(0, .3), vec2(.44, .3))); }
  float gN(vec2 o) { return min(seg(o, vec2(0), vec2(0, .55)), min(seg(o, vec2(0, .4), vec2(.2, .55)), min(seg(o, vec2(.2, .55), vec2(.38, .45)), seg(o, vec2(.38, .45), vec2(.4, 0.))))); }
  float gD(vec2 o) { return min(seg(o, vec2(0), vec2(0, 1.)), oval(o, vec2(0., .5), vec2(.5, .5)) + step(o.x, -.01)); }
  float pencilLine(float e, float w) { return 1. - smoothstep(w * .5, w, e); }
`;

export const DOOR_GLSL = /* glsl */ `
  const vec4 DOOR = vec4(${DOOR.x.toFixed(3)}, ${DOOR.y.toFixed(3)}, ${DOOR.w.toFixed(3)}, ${DOOR.h.toFixed(2)});
  /* the little door: a doorway cut square with a rounded head, a stone leaf set back in it; the count above it */
  vec4 door(vec3 p, vec4 d) {
    vec2 q = vec2(p.x - DOOR.x, p.y - DOOR.y);
    float n = ST_ZT - p.z;                                                             /* into the near wall, under the rail */
    float op = archOpening2(q, DOOR.z, DOOR.w - DOOR.z);
    float rec = min(min(op, .1 - n), n + .02);
    d = A(d, vec4(rec, M_CUT, NOUV));
    if (n > .06 && op > -.01) gTint *= .8;                                             /* the leaf, a shade darker than the wall */
    /* the count above it: a row of strokes, every one cut (full) */
    if (abs(n) < .05 && q.y > DOOR.w + .12 && q.y < DOOR.w + .28 && abs(q.x) < .3) {
      float sx = mod(q.x + .3, .06) - .03;
      d.x += engrave(abs(sx), .01, .012) * step(abs(q.y - DOOR.w - .2), .07);
    }
    return d;
  }
`;

const TZ = 6.42, TICK = [1.515, -TZ * .42 / .55 + 1.25 + .07, TZ];     /* the tick on the rail's top, just before the curl */

export default {
  ...STAIR_LOOK,
  id: 'pt-cv-12',
  name: 'The first turn',
  line: '',
  cam: { x: .75, y: -3.3, z: 7.45, pitch: -36, yaw: 118, f: .56, cx: .5, cy: .5 },
  bloomAt: [DOOR.x, DOOR.y + .5, 9.8], bloomPow: 16,
  blur: { px: 1.8, d0: 2.6, d1: 8, k: .85 },
  lights: [
    lampLight(LAMP2[0], .5, { reach: 2.6 }),
    lampLight(LAMP2[1], .55, { reach: 2.6 }),
    lampLight(LAMP2[2], .55, { reach: 2.6 }),
    { p: [TICK[0] - .35, TICK[1] + .35, TICK[2] + .2], c: [1, .74, .44], k: .06, r: .25, shadow: .6, reach: .8 },   /* the nearest lamp's light along the rail's top */
    { p: [1.2, -4, 8.2], c: [.34, .31, .75], k: 4, r: 2.2 },                        /* violet on the turn landing */
    { p: [4.2, ramp2(4.2) + 1.3, 8.2], c: [.34, .31, .75], k: 3, r: 2 },               /* and down the flight */
    { p: [DOOR.x - .2, DOOR.y + .9, 7.3], c: [1, .7, .38], k: .25, r: .45, shadow: .6, reach: 1.6 },   /* the lamps' light pooled at the little door */
  ],
  glsl: STAIR2_GLSL + PENCIL_GLSL + DOOR_GLSL + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = stairRoom(p);
    d = door(p, d);
    { float up = p.y - (p.x > 1.6 ? ramp2(p.x) : -5.04); if (up > 1.9) gTint *= mix(1., .3, smoothstep(1.9, 3.6, up)); }   /* the vault, dark */
    if (p.y < -5.03 && p.x < 1.6) gTint *= .55;                                          /* the landing at your feet */
    /* the pencil on the rail's worn top, just before its curl: a tick across it, and 0.9 m beside it */
    if (p.x < SW && p.z > 6. && p.z < 6.52 && abs(rail(p)) < .01 && p.y - ramp1(p.z) - 1.25 > .045) {
      vec2 q = vec2(${TZ.toFixed(2)} - p.z, p.x - (SW - .085));                           /* u along the rail, v across it */
      float e = seg(q, vec2(0, -.045), vec2(.004, .045));
      vec2 o = (q - vec2(.05, -.026)) / .052;
      float t = gZero(o); o.x -= .7; t = min(t, gDot(o)); o.x -= .3; t = min(t, gNine(o)); o.x -= 1.; t = min(t, gM(o));
      e = min(e, t * .052);
      float ink = pencilLine(e + (fbm(q * 600., 2) - .5) * .0015, .006);
      gTint = mix(gTint, vec3(.1, .1, .12), ink * .92);
      gPolish *= 1. - .6 * ink;
    }
    return d;
  }`,
  anchors: {
    flame: [{ p: LAMP2[2], size: .6 }],
    fog: [{ p: [4.5, -7.6, 8.2], w: 1.2, h: .25, a: .14, speed: .6 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
