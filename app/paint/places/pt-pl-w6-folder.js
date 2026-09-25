/* SEALED (D-015). pt-pl-w6-folder, round 1 (room scale, D-075): in her camp (pt-b-1.C's room, reused), on the
   floor, looking in under her cot to the wall behind it: at the back, lying flat, a document folder of grey card
   with an elastic band round it and a thin slate on its cover with a count cut in it; its spine turned out toward
   you, and on the spine, in black marker, HILL. The clay lamp's weak warm light comes from the doorway, low,
   under the cot's rail, and ends on the spine; the canvas sags dark overhead. */
import room from './pt-b-1.C.js';

const F = [1.36, 2.02];                                             /* the folder's centre on the floor, under the cot at the back */
const SX = F[0] - .115;                                             /* its spine's face */
const CAM = { x: .15, y: .16, z: 2.1 };
export default {
  ...room,
  id: 'pt-pl-w6-folder',
  name: 'Her folder',
  line: '',
  cam: { ...CAM, pitch: 2, yaw: 90, f: .95, cx: .5, cy: .5 },
  far: 9, fogK: 1 / 15,
  bloomAt: [SX, .05, F[1]], bloomPow: 30, bloomC: [.04, .03, .014],
  blur: { px: 1.2, d0: 2.2, d1: 4, k: .5 },
  expo: 2.15, amb: .42, ambC: [.9, .8, 1.35], bloom: { alpha: .16 },
  hazeBase: [.018, .015, .045], hazeFar: [.05, .04, .11],
  lights: [
    { ...room.lights[0], k: 5 },                                                            /* the clay lamp, in the passage behind */
    { p: [SX - .13, .03, F[1] - .04], c: [1, .72, .38], k: .006, r: .07, reach: .3 },    /* its light, low under the rail, ending on the spine */
    { p: [SX - .6, .09, F[1] - .35], c: [1, .72, .38], k: .07, r: .3, reach: .9 },   /* a warm pool on the floor, under the cot, leading in to it */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.4, r: 1.2 },                              /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: 1, r: 1 },
    { p: [.8, .3, 2.3], c: [.42, .38, .82], k: .025, r: .3, reach: .9 },
    { p: [.4, .2, 2.9], c: [.42, .38, .82], k: .04, r: .4, reach: 1.2 },                     /* violet half-light under the cot */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.)); }
  /* HILL in black marker, capitals, a little uneven, as a hand writes them on a spine */
  float hill(vec2 q) {
    float h = .0095, d = 9.;
    d = min(d, seg(q, vec2(0, -h), vec2(0, h)));
    d = min(d, seg(q, vec2(.0135, -h), vec2(.014, h)));
    d = min(d, seg(q, vec2(0, .0005), vec2(.0138, .001)));
    d = min(d, seg(q, vec2(.0255, -h), vec2(.0255, h)));
    d = min(d, seg(q, vec2(.037, -h), vec2(.0368, h)));
    d = min(d, seg(q, vec2(.037, -h), vec2(.0485, -h + .0005)));
    d = min(d, seg(q, vec2(.056, -h), vec2(.0558, h)));
    d = min(d, seg(q, vec2(.056, -h), vec2(.0675, -h)));
    return d;
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > .3) gTint *= mix(1., .55, smoothstep(.3, 1., p.y));                      /* the canvas and the wall above, dark */
    if (p.y < .03) gTint *= mix(.45, .9, smoothstep(.4, 1.2, p.x));                   /* the floor near you, out of the light */
    vec3 b = p - vec3(${F[0].toFixed(3)}, 0, ${F[1].toFixed(3)});
    /* the folder: grey card, a little bowed, its spine toward you */
    vec4 fo = box(b, vec3(0, .02, 0), vec3(.108, .015, .153), M_PAPER); fo.x -= .006; fo.x += rough(p, .0012, 70.);
    fo.x += .002 * smoothstep(.0, .15, abs(b.z)) * step(.03, b.y);
    if (fo.x < d.x) {
      d = fo; gTint = vec3(.72, .74, .88) * (.85 + .2 * fbm3(p * 25., 3));                 /* grey card */
      /* the elastic band, round it the short way, near one end */
      if (abs(b.z - .1) < .004) gTint = vec3(.18, .17, .22);
      /* HILL on the spine, in black marker: reads left to right as you face it */
      if (b.x < -.1) {
        vec2 q = vec2(-(b.z) + .034, b.y - .02);
        float hd = hill(q);
        if (hd < .0019) gTint = vec3(.05, .05, .06);
        else if (hd < .003) gTint *= mix(.3, 1., (hd - .0019) / .0011);
      }
    }
    /* on its cover, a thin slate with a count cut in it */
    vec4 sl = box(b, vec3(.01, .041, -.03), vec3(.06, .004, .08), M_SLATE); sl.x -= .002;
    if (sl.x < d.x) {
      d = sl; gTint = vec3(1.);
      if (b.y > .043 && abs(b.x - .01) < .025 && b.z > -.09 && b.z < .0) {
        float k = floor((b.z + .09) / .015), sz = b.z + .09 - (k + .5) * .015;
        if (k < 5.) { float e = length(vec2(sz, max(abs(b.x - .01) - .014, 0.))); d.x += engrave(e, .0022, .002); if (e < .002) gTint = vec3(1.4); }
      }
    }
    return d;
  }`,
  anchors: {
    glints: [{ p: [SX, .03, F[1]] }],
    beam: [{ p: [SX - .2, .08, F[1] - .05], w: .1 }],
  },
  live: { motes: 'gold', gold: true },
};
