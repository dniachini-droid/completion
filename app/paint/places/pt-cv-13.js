/* SEALED (D-015). pt-cv-13, camp view: the second flight (the Stair's room, pt-cv-10, and the little door, pt-cv-12,
   reused). Standing on the second flight, three-quarter on the little door under the rail: shut, its count above it
   full; beside it one ring with sharp edges among worn ones. On the wall at the door's jamb, in pencil, in her hand:
   open. D9: the look-at. The second flight's lamps (warm) on the far wall; the flight going on down into the dark. */
import { STAIR_LOOK, LAMP2, lampLight, ramp2 } from './pt-cv-10.js';
import { STAIR2_GLSL, PENCIL_GLSL, DOOR_GLSL, DOOR } from './pt-cv-12.js';

const JX = DOOR.x - DOOR.w - .035, JY = DOOR.y + .62;                  /* the pencil: from the jamb's edge, going up the flight */
const RG = [DOOR.x - DOOR.w - .38, DOOR.y + .86];                       /* the sharp ring, beside the door */

export default {
  ...STAIR_LOOK,
  id: 'pt-cv-13',
  name: 'The second flight',
  line: '',
  cam: { x: 5.1, y: ramp2(5.1) + 1.3, z: 7.75, pitch: -36, yaw: 131, f: .74, cx: .5, cy: .5 },
  bloomAt: [12, ramp2(12), 8.2], bloomPow: 14,
  blur: { px: 1.6, d0: 3, d1: 9, k: .85 },
  lights: [
    lampLight(LAMP2[1], .7, { reach: 3 }),
    lampLight(LAMP2[2], .8, { reach: 3.4 }),
    { p: [JX - .15, JY + .25, 6.95], c: [1, .74, .44], k: .05, r: .25, shadow: .6, reach: .7 },    /* the lamps' light on the jamb, where she wrote */
    { p: [DOOR.x - .6, DOOR.y + 1.2, 7.3], c: [1, .72, .4], k: .2, r: .4, shadow: .7, reach: 1.4 },  /* and on the door, the count and the ring */
    { p: [3.8, ramp2(3.8) + 1.4, 8.2], c: [.34, .31, .75], k: 3, r: 2 },                         /* violet on the flight */
    { p: [9, ramp2(9) + 1.2, 8.2], c: [.34, .31, .75], k: 3, r: 2.4 },                            /* and further down */
  ],
  glsl: STAIR2_GLSL + PENCIL_GLSL + DOOR_GLSL                                             /* seen close: the leaf shut, nearly flush, a dark seam round it */
    .replace('float rec = min(min(op, .1 - n), n + .02);', 'float rec = min(min(op, .045 - n + .03 * (1. - smoothstep(.0, .012, op))), n + .02);')
    .replace('if (n > .06 && op > -.01) gTint *= .8;', 'if (n > .03 && op > -.01) gTint *= mix(.35, 1.05, smoothstep(.004, .016, op));') + /* glsl */ `
  float gO2(vec2 o) { return gO(o); }
  vec4 scene(vec3 p) {
    vec4 d = stairRoom(p);
    d = door(p, d);
    float up = p.y - ramp2(p.x);
    if (up < .05 && p.z > 6.75) gTint *= mix(.5, 1., smoothstep(.1, .8, length(vec2(p.x - DOOR.x, p.z - 6.6)) * -1. + 1.4));   /* the treads away from the door, kept back */
    if (up > 1.9) gTint *= mix(1., .3, smoothstep(1.9, 3.6, up));                                   /* the vault, dark */
    if (p.z < 6.66 && p.z > 6.5) {
      /* rings on the wall by the door: worn soft, all but one; that one's edges sharp */
      vec2 w = vec2(p.x, p.y);
      d.x += engrave(abs(length(w - vec2(${(RG[0] - .55).toFixed(2)}, ${(RG[1] + .1).toFixed(2)})) - .11), .03, .005);
      d.x += engrave(abs(length(w - vec2(${(DOOR.x + DOOR.w + .35).toFixed(2)}, ${(RG[1] - .15).toFixed(2)})) - .1), .03, .005);
      d.x += engrave(abs(length(w - vec2(${(RG[0] + .02).toFixed(2)}, ${(RG[1] + .42).toFixed(2)})) - .09), .03, .004);
      float sr = abs(length(w - vec2(${RG[0].toFixed(3)}, ${RG[1].toFixed(3)})) - .1);
      d.x += .012 * (1. - smoothstep(.006, .008, sr));                                               /* the sharp one: cut square, not worn */
      /* the pencil on the jamb: open. D9, read from the stair */
      vec2 q = vec2(${JX.toFixed(3)} - p.x, p.y - ${JY.toFixed(3)});
      if (q.x > -.02 && q.x < .36 && abs(q.y) < .08) {
        vec2 o = q / .045;
        float t = gO(o); o.x -= .55; t = min(t, gP(o)); o.x -= .55; t = min(t, gE(o)); o.x -= .58; t = min(t, gN(o)); o.x -= .5; t = min(t, gDot(o));
        o.x -= .45; t = min(t, gD(o * vec2(1., 1.) - vec2(0., 0.))); o.x -= .72; t = min(t, gNine(o));
        float ink = pencilLine(t * .045 + (fbm(q * 600., 2) - .5) * .0012, .005);
        gTint = mix(gTint, vec3(.12, .12, .15), ink * .9);
      }
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [8.5, ramp2(8.5) + .3, 8.2], w: 1.2, h: .25, a: .12, speed: .6 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true },
};
