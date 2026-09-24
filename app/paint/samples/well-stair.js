/* Sample place 1 (invented, not in the story): THE WELL STAIR.
   A great round shaft; a stair winds down its wall into violet mist.
   Far down, one doorway on a landing holds a lamp: the thing to look at. */
export default {
  id: 'sample-well-stair',
  name: 'The Well Stair',
  line: 'The stair goes down round the wall, into the light.',
  cam: { x: -2.2, y: 2.2, z: -3.6, pitch: -58, yaw: 28, f: .78, cx: .5, cy: .46 },
  far: 90,
  fogK: 1 / 48,
  bloomAt: [0, -60, 0], bloomPow: 6, bloomC: [.34, .31, .7],
  hazeBase: [.028, .025, .08], hazeFar: [.12, .11, .32],
  blur: { d0: 18, d1: 50 },
  mist: { y: -30, thick: 5, deep: 18, c: [.2, .18, .5], cDeep: [.3, .27, .55] },
  lights: [
    { p: [0, -46, 0], c: [.78, .72, 1.25], k: 520, r: 9, shadow: .8 },   /* the light below, up the well */
    { p: [0, -24, 0], c: [.55, .5, 1.1], k: 40, r: 5 },
    { p: [0, -9, 0], c: [.42, .39, .9], k: 34, r: 7 },                    /* the well's own glow, part way down */
    { p: [5.45, -14.9, -3.83], c: [1, .58, .24], k: 3.2, r: 1.1, air: .06 } /* the lamp in the far doorway */
  ],
  glsl: /* glsl */ `
  const float R = 6.5, DROP = 17.;
  /* a doorway off the stair where it has wound round a (radians from the top) */
  vec4 doorAt(vec3 p, float a, float hw) {
    float ph = mod(a, 2. * PI), y = -DROP * a / (2. * PI);
    vec2 dir = vec2(cos(ph), sin(ph));
    float rad = dot(p.xz, dir), tg = dot(p.xz, vec2(-dir.y, dir.x));
    float o = archOpening2(vec2(tg, p.y - y), hw, hw * 1.9);
    return vec4(min(o, min(rad - (R - .6), R + 1.6 - rad)), M_CUT_SMALL, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 air = shaftAir(p, vec2(0), R, -80., 9., M_CUT_SMALL);
    air = A(air, doorAt(p, 1.3, .55));
    air = A(air, doorAt(p, 3.1, .55));
    air = A(air, doorAt(p, 5.67, .7));      /* the lamp's doorway */
    air = A(air, doorAt(p, 7.9, .55));
    air = A(air, doorAt(p, 10.4, .55));
    vec4 d = air;
    d = U(d, spiralStair(p, vec2(0), R - 1.7, R + .1, 0., DROP, 88., 3., .55, M_FLOOR));
    d = U(d, spiralStair(p, vec2(0), R - 1.72, R - 1.52, .45, DROP, 88., 3., 1., M_DRESSED));  /* the kerb */
    return d;
  }`,
  anchors: {
    flame: [{ p: [5.7, -15.0, -4.0], size: 1 }],
    fog: [{ p: [0, -30, 0], w: 1.15, h: .7, a: .9 }],
  },
  live: { mist: 'below', motes: 'violet' },
};
