/* SEALED (D-015). pt-cv-07, the tally, end on (camp view; the Salt Gallery of pt-b-2.A, round 2): the camera
   against the left wall, looking straight along it. The wall is a surface of banded salt rushing away; the tally,
   cut into the salt, is one line of shadow converging on the vanishing point down the gallery. Near, the lone
   ring's single unbroken stroke catches the raking light. One form, one light: the gallery's violet, raking
   back along the wall from further in. (This stretch is before the band of dressed stone: the marks are cut
   straight into the salt.) */
import room from './pt-b-2.A.js';

const ZR = 3.4;
const V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-cv-07',
  name: 'The tally, end on',
  line: '',
  cam: { x: -1.62, y: 1.5, z: ZR - 1.3, pitch: -2, yaw: -3, f: .72, cx: .5, cy: .5 },
  blur: { px: 1.8, d0: 2.5, d1: 14, k: .85 },
  glow: { threshold: .7, k: .45 },
  bloomC: [.3, .28, .6],
  lights: [
    { p: [-.5, 1.9, 9.5], c: V, k: 14, r: 3.5, shadow: .7 },                 /* the gallery's light, raking back along the wall from further in */
    { p: [.4, 1.6, 34], c: V, k: 18, r: 9 },                                 /* far down the gallery */
    { p: [-1.2, 1.75, ZR - 1.1], c: [.4, .37, .85], k: .25, r: .7, reach: 2.4 },   /* a little of it back off the far wall, into the near cuts */    /* the same light, caught in the ring's cut */
    { p: [0, 1.6, -5], c: [.3, .28, .66], k: .35, r: 3 },                    /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZR7 = ${ZR.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(2.4, 3.2, p.y));
    d.x += wl * (rough(p, .018, 7.) + rough(p, .006, 23.));
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : (p.y < 3.2 ? M_SALT : M_ROCK), NOUV);
    gTint = vec3(1. - .72 * smoothstep(1.8, 3., p.y));
    gTint *= .8 + .3 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds, grey and white */
    if (p.y < .05) gTint *= mix(.3, 1., smoothstep(2., 9., p.z));
    if (p.x > 1.5) gTint *= .45;                                                         /* the far wall kept back */
    if (p.x < -1.5 && p.y < 1.1) gTint *= mix(.45, 1., smoothstep(.2, 1.1, p.y));       /* the wall's foot in shadow */
    /* the tally, cut straight into the salt: one row of short cuts */
    float ty = 1.3 + .01 * sin(p.z * .7) + (vn(vec2(p.z * 3., 1.)) - .5) * .012;
    if (p.x < -1.8 && abs(p.y - ty) < .06) d.x += engrave(tally(vec2(p.z, p.y - ty)), .008, .016);
    /* above it, the lone ring: one clean cut, no start, no end */
    if (p.x < -1.7) { float rr = abs(length(vec2(p.z - ZR7, p.y - 1.66)) - .15); d.x += engrave(rr, .012, .018); if (rr < .013) { gPolish = 1.; gTint = vec3(1.9); } }   /* its cut clean, the crystals fresh in it */
    return d;
  }`,
  anchors: {
    glints: [[-1.96, 1.9, ZR + .9], [-1.95, 1.2, ZR + 2.3], [-1.96, 1.6, ZR + 4.4], [-1.97, 2.0, ZR + 1.5]].map(p => ({ p })),
    fog: [{ p: [-.5, .25, ZR + 6], w: 1.4, h: .18, a: .14 }],
  },
  live: { motes: 'violet', fog: 'low' },
};
