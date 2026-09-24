/* Sample place 1 (invented, not in the story): THE WELL STAIR.
   A great round shaft; a stair winds down its wall into lit cloud. Lamps stand
   in doorways along the stair, gold stepping stones down to the violet below. */
export default {
  id: 'sample-well-stair',
  name: 'The Well Stair',
  line: 'The stair goes down round the wall, into the light.',
  cam: { x: -2.2, y: 2.2, z: -3.6, pitch: -64, yaw: 28, f: .74, cx: .5, cy: .54 },
  far: 90,
  fogK: 1 / 28,
  bloomAt: [0, -34, 0], bloomPow: 14, bloomC: [.5, .46, .88],
  hazeBase: [.022, .02, .06], hazeFar: [.05, .045, .14],
  blur: { d0: 7, d1: 26 },
  expo: 1.9,
  bloom: { alpha: .26 },
  glow: { threshold: .55, k: .9 },
  mist: { y: -27, thick: 12, deep: 16, c: [.22, .2, .52], cDeep: [.36, .32, .62] },
  lights: [
    { p: [0, -40, 0], c: [.78, .72, 1.25], k: 380, r: 8, shadow: .8 },   /* the light below, inside the cloud */
    { p: [0, -20, 0], c: [.55, .5, 1.1], k: 16, r: 6 },
    { p: [-6.24, -8.81, -1.99], c: [1, .58, .24], k: 2.2, r: 1.1, warm: .09, air: .05 },  /* lamps in the doorways */
    { p: [-2.01, -11.38, -6.23], c: [1, .58, .24], k: 1.8, r: 1, warm: .07, air: .04 },
    { p: [5.36, -14.82, -3.77], c: [1, .58, .24], k: 1.6, r: 1, warm: .06, air: .04 },
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
    vec4 air = shaftAir(p, vec2(0), R, -80., 9., M_CUT);
    air = A(air, doorAt(p, 1.3, .55));
    air = A(air, doorAt(p, 3.1, .55));
    air = A(air, doorAt(p, 3.45, .6));      /* lamp */
    air = A(air, doorAt(p, 4.4, .6));       /* lamp */
    air = A(air, doorAt(p, 5.67, .6));      /* lamp */
    air = A(air, doorAt(p, 7.9, .55));
    air = A(air, doorAt(p, 10.4, .55));
    vec4 d = air;
    /* the treads, worn and chipped at their noses */
    vec4 st = spiralStair(p, vec2(0), R - 1.7, R + .1, 0., DROP, 88., 3., .55, M_FLOOR);
    st.x += rough(p, .07, 2.5);
    d = U(d, st);
    vec4 kb = spiralStair(p, vec2(0), R - 1.72, R - 1.52, .45 + .12 * sin(atan(p.z, p.x) * 3.), DROP, 88., 3., 1., M_DRESSED);
    d = U(d, kb);   /* the kerb */
    return d;
  }`,
  anchors: {
    flame: [
      { p: [-6.53, -8.93, -2.08], size: 1, body: true },
      { p: [-2.11, -11.5, -6.52], size: 1, body: true },
      { p: [5.6, -14.94, -3.94], size: 1, body: true },
    ],
    fog: [{ p: [0, -28, 0], w: 1.2, h: .75, a: .9 }, { p: [0, -17, 0], w: 1.3, h: .8, a: .45, speed: .6 }],
  },
  live: { mist: 'below', motes: 'violet' },
};
