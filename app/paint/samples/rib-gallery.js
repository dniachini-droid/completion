/* Sample place 2 (invented, not in the story): THE RIB GALLERY.
   A long nave under pointed ribs, arcades opening on dark aisles either side,
   a channel of still water down the middle. At the far end the rock is split
   and light comes through the crack: the thing to look at. */
export default {
  id: 'sample-rib-gallery',
  name: 'The Rib Gallery',
  line: 'Water runs down the middle, towards the crack of light.',
  cam: { x: -1.25, y: 1.45, z: 0, pitch: 3, yaw: 2, f: .66, cx: .5, cy: .5 },
  far: 64,
  fogK: 1 / 60,
  expo: 2,
  bloomAt: [.3, 4.5, 52], bloomPow: 90, bloomC: [.45, .42, .8],
  blur: { d0: 10, d1: 34 },
  lights: [
    { p: [.3, 4.5, 57], c: [.66, .6, 1.28], k: 300, r: 22, air: .025 },  /* the light through the crack */
    { p: [0, 9, 26], c: [.36, .33, .8], k: 36, r: 12 },                  /* haze high in the vault */
    { p: [0, 5, -3], c: [.34, .31, .74], k: 34, r: 11 },                 /* soft fill from behind */
    { p: [1.05, .35, 7.2], c: [1, .58, .24], k: 2.2, r: .9, air: .05 }   /* the lamp by the water */
  ],
  glsl: /* glsl */ `
  const float P = 3.6;               /* bay length */
  vec4 scene(vec3 p) {
    float ax = abs(p.x);
    /* the nave: pointed vault */
    vec4 air = hallAir(p, 3., 5.2, 4.4, -6., 52., M_CUT);
    /* the aisles either side, low and flat-roofed */
    air = A(air, vec4(min(min(7.2 - ax, ax - 3.55), min(4.3 - p.y, p.y)), M_CUT, NOUV));
    /* the arcades between: a round-headed opening in every bay */
    float zl = mod(p.z, P) - P * .5;
    float op = archOpening2(vec2(zl, p.y), 1.25, 2.55);
    air = A(air, vec4(min(op, min(ax - 2.6, 4. - ax)), M_CUT, NOUV));
    /* the crack at the far end, splitting the end wall */
    float cr = .55 + .2 * sin(p.y * 1.3) - .3 * smoothstep(5., 9., p.y) - abs(p.x - .6 * sin(p.y * .45) - .3 * vn(vec2(p.y * 2., 3.)));
    air = A(air, vec4(min(min(cr, p.z - 51.5), min(p.y - .2, min(9.4 - p.y * .9, 60. - p.z))), M_ROCK, NOUV));
    vec4 d = air;
    /* the ribs: bands standing out from the vault over every pier */
    float zr = mod(p.z + P * .5, P) - P * .5;
    vec4 hin = hallAir(p + vec3(0, 50, 0), 3., 55.2, 4.4, -1e3, 1e3, M_DRESSED);   /* walls and vault only, no floor */
    d = U(d, vec4(max(hin.x - .32, abs(zr) - .22), M_DRESSED, hin.z * 3., hin.w));
    /* the channel: a slot in the floor, with still water in it */
    d.x = max(d.x, min(min(.72 - ax, p.y + .6), min(.3 - p.y, 50.5 - p.z)));
    d = U(d, vec4(p.y + .22, M_WATER, NOUV));
    d = U(d, vec4(58.5 - p.z, M_GLOW, NOUV));           /* the light itself, seen only through the crack */
    return d;
  }`,
  anchors: {
    flame: [{ p: [1.12, .47, 7.2], size: 1, body: true }],
    fog: [{ p: [0, 1.2, 36], w: 1.3, h: .3, a: .7 }],
    glints: [{ p: [-0.3, -.2, 11] }, { p: [0.25, -.2, 14] }, { p: [-0.1, -.2, 18] }, { p: [0.3, -.2, 22] }, { p: [-0.25, -.2, 27] }, { p: [0.1, -.2, 33] }, { p: [-0.15, -.2, 40] }],
  },
  live: { fog: 'far', motes: 'violet' },
};
