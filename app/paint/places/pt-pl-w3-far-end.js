/* SEALED (D-015). pt-pl-w3-far-end (the Lamp Hall of pt-b-1.A, reused, lit state): the last cup before the
   great door, a stride from it, up on the right wall and out of frame; its flame's light lies warm on the foot
   of the door's face and gives out fast as the face rises, and the rest of the face goes up past where any
   light reaches, its top lost. The door's stone is smoother and colder than the walls; cold haze slides down
   it and pools on the floor. Low, near the floor by the last cup, looking up the door's face. */
import hall from './pt-b-1.A.js';

const ZD = 66.45;                                                   /* the door's leaf, as in pt-b-1.A */
export default {
  ...hall,
  id: 'pt-pl-w3-far-end',
  name: 'The far end',
  line: '',
  cam: { x: -1.05, y: .5, z: ZD - 2.9, pitch: 22, yaw: 17, f: .66, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 16, sheen: .05, gold: .7, expo: 1.9,
  hazeBase: [.03, .028, .08], hazeFar: [.05, .05, .14],
  bloomAt: [1.4, .6, ZD], bloomPow: 8, bloomC: [.05, .05, .12],
  glow: { threshold: .6, k: .5 },
  blur: { px: 1.4, d0: 5, d1: 14, k: .7 },
  lights: [
    { p: [2.3, 3.6, ZD - 1.2], c: [1, .68, .3], k: 2.4, r: .8, warm: .006, shadow: 1 },   /* the last cup's flame, up on the right, a stride from the door */
    { p: [0, 3, ZD - 14], c: [.3, .28, .66], k: 5, r: 6 },                                /* the hall behind, its cups far off: a faint cold fill */
    { p: [-1.1, .5, ZD - .7], c: [.4, .38, .86], k: .9, r: 1.3 },                         /* and the cold that comes off it, low on the left */                      /* the door's own cold, low on the left */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  const float ZD = ${ZD.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    /* the door's leaf: not the dark of the far view, but stone, smoother and colder than the walls */
    if (floor(d.y + .5) == M_DARK) {
      d.y = M_DRESSED; d.zw = vec2(p.y + 20., p.x);                                      /* its grain runs down the face */
      gTint = vec3(.8, .84, 1.02) * (.9 + .2 * fbm(p.xy * 1.3, 3));
      gPolish = .35;
      gTint *= mix(1., .12, smoothstep(2.8, 5.5, p.y));                                        /* up the face, into the dark */
    }
    /* the last cup: an arched recess up in the right wall, a stride from the door, its bowl and its flame */
    float zl = p.z - (ZD - 1.3);
    d = A(d, vec4(min(archOpening2(vec2(zl, p.y - 3.45), .3, .42), 2.94 - p.x), M_CUT, NOUV));
    vec3 bq = vec3(p.x - 2.8, p.y - 3.51, zl);
    vec4 bw = vec4(max((length(bq / vec3(.15, .1, .15)) - 1.) * .1, bq.y - .05), M_ROCK, NOUV);
    if (bw.x < d.x) { d = bw; gTint = vec3(.8, .66, .6); }
    vec4 fl = vec4(length((p - vec3(2.75, 3.64, ZD - 1.3)) / vec3(.03, .07, .03)) * .03 - .03, M_GLOW, NOUV);
    d = U(d, fl);
    gTint *= mix(1., .25, smoothstep(4., 7.5, p.y));                                          /* everything high goes into the dark: the top is lost */
    if (p.y < .03) gTint *= mix(.25, .8, smoothstep(ZD - 2., ZD - .2, p.z));                    /* the near floor kept down */
    return d;
  }`,
  anchors: {
    fog: [{ p: [.6, .25, ZD - .4], w: 1.2, h: .2, a: .2 }, { p: [.9, 2.4, ZD - .08], w: .8, h: .5, a: .12, speed: .5 }],
    glints: [{ p: [1.2, 1.2, ZD - .01] }],
  },
  live: { fog: 'low', motes: 'gold', gold: true },
};
