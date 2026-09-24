/* Sample place 3 (invented, not in the story): THE POOL DOME.
   A round room under a dome, its lowest courses left as raw rock. A still pool
   fills the middle; on an island stands one dressed stone, and a shaft of
   light falls on it through an opening in the crown: the thing to look at. */
export default {
  id: 'sample-pool-dome',
  name: 'The Pool Dome',
  line: 'Light falls through the crown onto the standing stone.',
  cam: { x: .6, y: 1.55, z: -7.3, pitch: 13, yaw: -3, f: .6, cx: .5, cy: .5 },
  far: 40,
  fogK: 1 / 40,
  bloomAt: [0, 16, 0], bloomPow: 60, bloomC: [.4, .37, .78],
  blur: { d0: 12, d1: 30 },
  expo: 1.9,
  sheen: .04,
  beam: { x: 0, z: 0, r: 1.25, k: .11, c: [.62, .58, 1.2], top: 13 },
  lights: [
    { p: [0, 17, 0], c: [.72, .66, 1.25], k: 520, r: 5.5, shadow: 1 },  /* the light through the crown */
    { p: [0, 7, 3], c: [.36, .33, .8], k: 30, r: 9 },                    /* the dome's own glow */
    { p: [0, 3, -9], c: [.3, .28, .66], k: 8, r: 6 },                    /* soft fill from behind */
    { p: [.62, .42, -.72], c: [1, .58, .24], k: 1.6, r: .8, air: .05 }  /* the lamp at the stone's foot */
  ],
  glsl: /* glsl */ `
  vec4 scene(vec3 p) {
    float r = length(p.xz), ang = atan(p.z, p.x);
    vec4 air = domeAir(p, vec2(0), 9., 4., M_CUT);
    /* the lowest courses were never cut: raw rock, its top edge uneven */
    float edge = 2.3 + (vn(vec2(ang * 5., 1.)) - .5) * 1.6;
    float raw = 1. - smoothstep(edge - .15, edge + .15, p.y);
    air.x += rough(p, 1.1, .6) * raw * smoothstep(6.5, 8., r) * step(.02, p.y);
    if (raw > .5 && r > 6.) air.yzw = vec3(M_ROCK, NOUV);
    /* the opening in the crown, and the light above it */
    air = A(air, shaftAir(p, vec2(0), 1.25, 8., 30., M_CUT_SMALL));
    vec4 d = air;
    /* the pool: a basin in the floor, still water in it */
    float basin = min(5.6 - r + rough(p, .3, .9), min(p.y + .9, .3 - p.y));
    d.x = max(d.x, basin);
    d = U(d, vec4(p.y + .16, M_WATER, NOUV));
    /* the island and the standing stone */
    d = U(d, vec4(max(r - 1.35 - rough(p, .18, 1.4), p.y - .04), M_ROCK, NOUV));
    vec3 q = p - vec3(0, 0, .1);
    vec3 qt = vec3(q.x * (1. + .09 * q.y), q.y, q.z * (1. + .06 * q.y));   /* it narrows a little as it rises */
    vec4 st = box(qt, vec3(0, 1.75, 0), vec3(.48, 1.75, .26), M_CUT);
    st.x = st.x * .9 + (fbm3(p * 3., 3) - .5) * .02;
    d = U(d, st);
    d = U(d, box(q, vec3(0, .09, 0), vec3(.66, .09, .42), M_DRESSED));   /* its footing */
    d = U(d, vec4(24. - p.y, M_GLOW, NOUV));                            /* the light itself, above the crown */
    return d;
  }`,
  anchors: {
    flame: [{ p: [.62, .31, -.75], size: .8 }],
  },
  live: { beam: true, motes: 'violet' },
};
