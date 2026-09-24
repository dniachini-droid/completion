/* Sample place 3 (invented, not in the story): THE POOL DOME.
   A round room under a dome, its lowest courses left as raw rock. A still pool
   fills the middle; on an island stands one old stone, and a shaft of light
   falls beside it through an opening in the crown: the thing to look at. */
export default {
  id: 'sample-pool-dome',
  name: 'The Pool Dome',
  line: 'Light falls through the crown into the still pool.',
  cam: { x: -1.4, y: 1.55, z: -7.2, pitch: 17, yaw: 9, f: .52, cx: .5, cy: .5 },
  far: 40,
  fogK: 1 / 40,
  bloomAt: [0, 16, 0], bloomPow: 20, bloomC: [.42, .39, .8],
  bloom: { alpha: .28 },
  glow: { threshold: .55, k: 1 },
  blur: { d0: 12, d1: 30 },
  expo: 1.9,
  sheen: .04,
  beam: { x: 0, z: 0, r: 1.25, k: .09, c: [.62, .58, 1.2], top: 13 },
  lights: [
    { p: [0, 26, 0], c: [.72, .66, 1.25], k: 900, r: 6, shadow: 1 },  /* the light through the crown */
    { p: [0, 6, 3], c: [.36, .33, .8], k: 22, r: 8 },                    /* the dome's own glow */
    { p: [0, 3, -9], c: [.3, .28, .66], k: 8, r: 6 },                    /* soft fill from behind */
    { p: [1.42, .42, -.62], c: [1, .58, .24], k: 1.5, r: .85, warm: .05, air: .06 }  /* the lamp at the stone's foot */
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
    float basin = min(5.6 - r + rough(p, .6, .9), min(p.y + .9, .3 - p.y));
    d.x = max(d.x, basin);
    d = U(d, vec4(p.y + .16, M_WATER, NOUV));
    /* the island and the standing stone */
    d = U(d, vec4(max(length(p.xz - vec2(.8, 0)) - 1.45 - rough(p, .4, 1.4), p.y - .02 - rough(p, .12, 2.)), M_ROCK, NOUV));
    vec3 q = p - vec3(.8, 0, .1);
    vec3 qt = vec3(q.x * (1. + .09 * q.y), q.y, q.z * (1. + .06 * q.y));   /* it narrows a little as it rises */
    vec4 st = box(qt, vec3(0, 1.75, 0), vec3(.48, 1.75, .26), M_ROCK);
    st.x = st.x * .85 + rough(p, .09, 2.6);                       /* weathered, chipped at the arrises */
    st.x = max(st.x, q.y - 3.25 - (vn(vec2(q.x * 6., 2.)) - .5) * .5);   /* its top broken off long ago */
    d = U(d, st);
    d = U(d, box(q, vec3(0, .09, 0), vec3(.66, .09, .42), M_DRESSED));   /* its footing */
    d = U(d, vec4(24. - p.y, M_GLOW, NOUV));                            /* the light itself, above the crown */
    return d;
  }`,
  anchors: {
    flame: [{ p: [1.42, .31, -.66], size: .9, body: true }],
    beam: [{ p: [0, 12.6, 0], w: .1 }, { p: [0, .3, 0], w: .22 }],
    fog: [{ p: [0, .1, 0], w: 1.3, h: .3, a: .55 }],
    glints: [{ p: [-2.2, -.14, -2.6] }, { p: [1.8, -.14, -1.9] }, { p: [-3.1, -.14, 0.4] }, { p: [2.9, -.14, 1.2] }, { p: [-0.6, -.14, -3.4] }, { p: [0.9, -.14, -4.1] }],
  },
  live: { beam: true, motes: 'violet' },
};
