/* SEALED (D-015). pt-cv-11, camp view: halfway down (the Stair's room, pt-cv-10, reused). Seated on a step halfway
   down the top flight, looking back up it to the landing: every step knee-high, the rail running above the elbow on
   the far wall. In the near wall at hand height, a row of shallow finger hollows worn smooth: four, a space, four,
   their insides catching the nearest lamp's light: the look-at. A stair built for someone taller. */
import { STAIR_GLSL, STAIR_LOOK, LAMP1, lampLight, ramp1 } from './pt-cv-10.js';

const H = [3.15, ramp1(3.15) + 1.15];                                      /* the hollows' centre on the left wall: (z, y) */

export default {
  ...STAIR_LOOK,
  id: 'pt-cv-11',
  name: 'Halfway down',
  line: '',
  cam: { x: -.35, y: -2.2, z: 3.75, pitch: 24, yaw: 221, f: .72, cx: .5, cy: .5 },
  bloomAt: [0, 1.2, -3], bloomPow: 20, bloomC: [.05, .045, .1],
  blur: { px: 1.6, d0: 3.5, d1: 9, k: .8 },
  lights: [
    lampLight(LAMP1[0], .5, { reach: 2.6 }),                                       /* the nearest lamp, ahead and beside the hollows */
    { p: [-1.3, H[1] + .15, H[0] + .55], c: [1, .74, .44], k: .1, r: .3, shadow: 1, reach: 1. },   /* its light raking along the hollows */
    { p: [0, 1.6, -2.4], c: [.36, .33, .8], k: 4, r: 2.4 },                         /* the landing above, violet */
    { p: [.6, -1.2, 1.4], c: [.34, .31, .75], k: 3, r: 2 },                         /* violet along the flight */
    lampLight(LAMP1[1], .35, { reach: 2.2 }),                                      /* the lamp behind you, on the steps at your feet */
  ],
  glsl: STAIR_GLSL.replace('abs(p.z - 1.) > .9)', 'abs(p.z - 1.) > .9 && abs(p.z - 3.15) > .7)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = stairRoom(p);
    /* the finger hollows: four, a space, four, in a level row */
    if (p.x < -1.45 && abs(p.y - ${H[1].toFixed(3)}) < .1 && abs(p.z - ${H[0].toFixed(2)}) < .5) {
      float t = p.z - ${H[0].toFixed(2)};
      float g = t < 0. ? t + .23 : t - .23;                                         /* the two groups of four, a space between */
      float k = clamp(floor(g / .075 + 2.), 0., 3.), c = (k - 1.5) * .075;
      vec2 e = vec2((g - c) / .028, (p.y - ${H[1].toFixed(3)} - .006 * (k - 1.5) * (k - 1.5)) / .05);
      float r = length(e);
      if (abs(g) < .16) {
        float dent = .025 * max(0., 1. - r * r);
        d.x += dent;
        float inside = 1. - smoothstep(.7, 1., r);
        gPolish = max(gPolish, inside * .2);
        gTint *= mix(1., mix(1.2, .3, smoothstep(-.3, .5, e.y)) * (1. - .45 * smoothstep(.75, .95, r) * step(0., e.y)), inside);           /* shadowed under its upper lip, lit at its lower: a hollow, not a boss */
      }
    }
    { float up = p.y - ramp1(p.z); if (up > 2.2) gTint *= mix(1., .3, smoothstep(2.2, 3.8, up)); }   /* the vault into the dark */
    if (p.z > 3.9) gTint *= .5;                                                     /* the steps at your feet, in your own shadow */
    return d;
  }`,
  anchors: {
    flame: [{ p: LAMP1[0], size: .6 }],
    fog: [{ p: [-.6, -1.2, 2.2], w: 1.2, h: .2, a: .12, speed: .6 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
