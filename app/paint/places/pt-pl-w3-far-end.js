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
  cam: { x: .55, y: .42, z: ZD - 1.45, pitch: 20, yaw: 4, f: .7, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 14, sheen: .04, gold: .8, expo: 2.3,
  hazeBase: [.028, .027, .075], hazeFar: [.04, .04, .12],
  bloomAt: [-1, .4, ZD], bloomPow: 6, bloomC: [.05, .05, .12],
  glow: { threshold: .58, k: .6 },
  blur: { px: 1.4, d0: 5, d1: 14, k: .7 },
  lights: [
    { p: [2.1, 2.6, ZD - 1.7], c: [1, .68, .3], k: 1.6, r: .8, warm: .002, shadow: .6 },   /* the last cup's flame, a stride from the door: its light gives out partway up the face */
    { p: [2.62, 3.72, ZD - 1.3], c: [1, .68, .3], k: 0, r: .16, air: 1.6 },                  /* the flame's glow in the air */
    { p: [0, 3, ZD - 12], c: [.3, .28, .66], k: 4, r: 6 },                                /* the hall behind: a faint cold fill */
    { p: [-.6, 1.4, ZD - 1.6], c: [.34, .33, .75], k: 1.8, r: 2.2 },                     /* the door's own cold, broad and faint */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  const float ZD = ${ZD.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    /* the door's leaf, brought flush with the end wall so the flame reaches it: one stone, smoother and colder
       than the walls, a joint round its arch */
    vec4 leaf = vec4(ZD - .43 - p.z, M_ROCK, NOUV);
    if (leaf.x < d.x) d = leaf;
    float dr = archOpening2(vec2(p.x, p.y), 2.1, 6.2);
    dr = max(dr, min(dr, 2.9 - length(vec2(abs(p.x) + .8, p.y - 6.2))));
    if (p.z > ZD - .5 && dr > -.01) {
      d.x += engrave(dr, .02, .015);                                                        /* the joint between leaf and frame */
      if (dr > .015) {
        d.yzw = vec3(M_SLATE, NOUV);                                                       /* fine-grained, close, cold */
        gTint = vec3(2.5, 2.6, 2.9) * (.94 + .12 * fbm(p.xy * .7, 3));
        gTint *= mix(1., .16, smoothstep(1.45, 1.95, p.y + .06 * (fbm(p.xy * 1.5, 3) - .5)));   /* where the flame's light gives out: a level edge */
      }
    }
    /* the last cup: an arched recess up in the right wall, a stride from the door, its bowl and its flame */
    float zl = p.z - (ZD - 1.3);
    d = A(d, vec4(min(archOpening2(vec2(zl, p.y - 3.45), .3, .42), 2.94 - p.x), M_CUT, NOUV));
    vec3 bq = vec3(p.x - 2.72, p.y - 3.53, zl);
    vec4 bw = vec4(max((length(bq / vec3(.15, .1, .15)) - 1.) * .1, bq.y - .05), M_ROCK, NOUV);
    if (bw.x < d.x) { d = bw; gTint = vec3(.8, .66, .6); }
    vec4 fl = vec4(length((p - vec3(2.62, 3.72, ZD - 1.3)) / vec3(.05, .12, .05)) * .05 - .05, M_GLOW, NOUV);
    d = U(d, fl);
    if (floor(d.y + .5) != M_ROCK && floor(d.y + .5) != M_GLOW && p.x > 2.) gTint *= .5;     /* the side wall kept below the door */
    gTint *= mix(1., .25, smoothstep(4., 7.5, p.y));                                          /* everything high goes into the dark: the top is lost */
    if (p.y < .03) gTint *= mix(.2, .6, smoothstep(ZD - 2., ZD - .2, p.z));                    /* the near floor kept down */
    return d;
  }`,
  anchors: {
    fog: [{ p: [.3, .2, ZD - .6], w: 1.4, h: .2, a: .22 }, { p: [.5, 2.4, ZD - .5], w: .9, h: .6, a: .12, speed: .5 }],
    glints: [{ p: [.9, 1.1, ZD - .44] }],
      },
  live: { fog: 'low', motes: 'gold', gold: true, flame: 'still' },
};
