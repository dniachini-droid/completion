/* SEALED (D-015). pt-cv-02, camp view: the pipe. The passage from the ladder: a tube of cut stone, floor and walls
   one curve, no corners, bending away to the right. Seen low along the floor. Grey dust lies in the bottom of the
   curve, and down its middle a path is worn through it by boots: the nearest prints still whole, heel and sole, a
   stride apart, going away round the bend: the look-at. Violet place-light from round the bend ahead. Quieter than
   the places: one form, one light. */

const ZB = 4.2, RB = 3.2;                                                 /* straight to z = 6, then bending right, radius 5 */
const A = 1.35;                                                       /* where the light stands round the bend (radians) */
const LP = [RB - RB * Math.cos(A), .55, ZB + RB * Math.sin(A)];

export default {
  id: 'pt-cv-02',
  name: 'The pipe',
  line: '',
  cam: { x: -.08, y: .5, z: .2, pitch: -12, yaw: 7, f: 1.1, cx: .5, cy: .5 },
  far: 24, fogK: 1 / 16, sheen: 0, expo: 2.1, amb: 1.1,
  hazeBase: [.016, .014, .045], hazeFar: [.1, .09, .24],
  bloomAt: LP, bloomPow: 16, bloomC: [.14, .12, .3],
  glow: { threshold: .6, k: .45 }, bloom: { alpha: .14 }, grain: .4, shadowJitter: 1,
  blur: { px: 2.2, d0: 2.6, d1: 7, k: .95 },
  lights: [
    { p: LP, c: [.62, .58, 1.25], k: 30, r: 3, shadow: .5 },                      /* the violet place-light, round the bend */
    { p: [.5, .3, 4.2], c: [.66, .62, 1.2], k: .2, r: .5, shadow: .8, reach: 3.6 },   /* the same light, low along the floor: it rakes across the prints */
    { p: [0, .9, -1.5], c: [.3, .28, .66], k: .6, r: 2 },                         /* faint fill from the ladder behind */
  ],
  glsl: /* glsl */ `
  const float ZB = ${ZB.toFixed(1)}, RB = ${RB.toFixed(1)};
  /* the passage's centreline: (lateral offset, distance along) */
  vec2 path(vec3 p) {
    if (p.z < ZB) return vec2(p.x, p.z);
    vec2 v = p.xz - vec2(RB, ZB);
    float a = atan(v.y, -v.x);
    return vec2(RB - length(v), ZB + RB * a);
  }
  /* one boot print: sole and heel, toe along +s; (lateral, along) in the print's frame */
  float print(vec2 q) {
    float hw = mix(.036, .048, smoothstep(-.05, .05, q.y)) * (1. - .1 * exp(-pow((q.y + .035) / .03, 2.)));
    return length(vec2(max(abs(q.x) - hw + .03, 0.), max(abs(q.y) - .115, 0.))) - .03;
  }
  vec4 scene(vec3 p) {
    vec2 ps = path(p);
    float lat = ps.x, s = ps.y;
    vec2 cs = vec2(lat, p.y - .98);
    float air = min(1. - length(cs), p.y);
    float ang = atan(cs.x, -cs.y);
    vec4 d = vec4(min(air, 30. - s), M_CUT, vec2(s, ang * 1.));
    d.x += rough(p, .012, 5.) * smoothstep(.1, .35, p.y);                               /* the tube's stone, a little uneven, worn smooth underfoot */
    if (p.y > .55) gTint *= mix(1., .3, smoothstep(.55, 1.7, p.y));                       /* the crown of the tube, dark: the words' band stays calm */
    /* the dust in the bottom of the curve; a path worn through it; the prints */
    float low = 1. - smoothstep(.12, .32, p.y);
    if (low > 0. && d.x < .02) {
      float n = fbm(vec2(lat * 9., s * 4.), 3);
      vec3 dust = vec3(1.7, 1.66, 1.5) * (.7 + .5 * n) * (.8 + .4 * fbm(vec2(lat * 2.5, s * 1.2), 3));
            float trackW = .2 + .03 * sin(s * 1.3);
      float track = 1. - smoothstep(trackW - .06, trackW + .05, abs(lat + .02 * sin(s * .7)));
      d.x += (fbm(vec2(lat * 14., s * 11.), 3) - .5) * .006 * (1. - track);          /* the dust lies in soft drifts, ridged a little either side of the path */
      vec3 c = mix(dust, vec3(.8, .78, .82) * (.9 + .2 * n), track * .8);
      /* the prints: a stride apart, left and right, going away; whole near, blurring into the path further on */
      float k = floor(s / .38), side = mod(k, 2.) < .5 ? -1. : 1.;
      vec2 q = vec2(lat - side * .1, s - (k + .5) * .38);
      float e = print(q);
      float whole = 1. - smoothstep(2.6, 7., s);
      float inP = (1. - smoothstep(-.002, .004, e)) * whole * step(1.25, (k + .5) * .38);
      float rim = (smoothstep(-.001, .002, e) - smoothstep(.003, .01, e)) * whole * step(1.25, (k + .5) * .38);
      float tread = .85 + .15 * step(.5, fract(q.y * 38.));                                 /* the sole's tread, across */
      c = mix(c, vec3(.78, .76, .84) * tread, inP);
      c *= 1. + .7 * rim;                                                                  /* the dust pushed up at its edge */
      d.x += inP * .004 - rim * .002;
      gTint = mix(gTint, c, low);
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [LP[0] - .6, .5, LP[2] - .8], w: 1, h: .2, a: .12, speed: .6 }],
    beam: [{ p: [0, .35, 2.4], w: .6 }],
  },
  live: { fog: 'far', motes: 'violet' },
};
