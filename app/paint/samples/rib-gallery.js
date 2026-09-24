/* Sample place 2 (invented, not in the story): THE RIB GALLERY.
   A long nave under pointed ribs, arcades opening on aisles either side,
   a channel of still water down the middle. Lamps along the walkway lead
   the eye to the far end, where the rock is split and light comes through. */
export default {
  id: 'sample-rib-gallery',
  name: 'The Rib Gallery',
  line: 'Water runs down the middle, towards the crack of light.',
  cam: { x: -1.3, y: .75, z: 0, pitch: 4, yaw: 11, f: .6, cx: .5, cy: .5 },
  far: 50,
  fogK: 1 / 42,
  expo: 1.9,
  bloomAt: [.3, 3, 40], bloomPow: 60, bloomC: [.45, .42, .8],
  blur: { d0: 10, d1: 34 },
  glow: { threshold: .6, k: .8 },
  lights: [
    { p: [.3, 3, 44], c: [.66, .6, 1.28], k: 420, r: 18, air: .03 },   /* the light through the crack */
    { p: [0, 3, 36], c: [.4, .37, .85], k: 10, r: 5 },                  /* its spill on the end wall's lips */
    { p: [0, 9, 20], c: [.36, .33, .8], k: 30, r: 11 },                 /* haze high in the vault */
    { p: [0, 5, -3], c: [.34, .31, .74], k: 26, r: 11 },                /* soft fill from behind */
    { p: [-5.5, 2, 20], c: [.4, .37, .85], k: 5, r: 4 },                /* deep in the left aisle */
    { p: [1.05, .35, 7.2], c: [1, .58, .24], k: 2.2, r: .9, warm: .08, air: .05 },   /* lamps along the walkway */
    { p: [1.05, .35, 16.2], c: [1, .58, .24], k: 2, r: .9, warm: .07, air: .04 },
    { p: [1.05, .35, 27], c: [1, .58, .24], k: 2, r: .9, warm: .07, air: .04 },
  ],
  glsl: /* glsl */ `
  const float P = 3.6;               /* bay length */
  vec4 scene(vec3 p) {
    float ax = abs(p.x);
    vec4 air = hallAir(p, 3., 5.2, 4.4, -6., 40., M_CUT);
    /* the aisles either side, low and flat-roofed */
    air = A(air, vec4(min(min(7.2 - ax, ax - 3.55), min(4.3 - p.y, p.y)), M_CUT, NOUV));
    /* the arcades: a round-headed opening in every bay; two were walled up long ago */
    float bay = floor(p.z / P), zl = mod(p.z, P) - P * .5;
    float op = archOpening2(vec2(zl, p.y), 1.25, 2.55);
    float walled = (bay == 3. && p.x > 0.) || (bay == 6. && p.x < 0.) ? -1. : 1.;
    air = A(air, vec4(min(op, min(ax - 2.6, 4. - ax)) * walled - (walled < 0. ? .01 : 0.), M_CUT, NOUV));
    /* the crack at the far end: wide at the floor, jagged, closing to a hairline */
    float jag = (fbm(vec2(p.y * 1.7, 2.), 4) - .5) * 1.1 + (vn(vec2(p.y * 9., 5.)) - .5) * .18;
    float wid = mix(.75, .04, smoothstep(0., 8.5, p.y));
    float cr = wid - abs(p.x - .3 - jag);
    air = A(air, vec4(min(min(cr, p.z - 39.5), min(p.y - .05, min(9. - p.y, 48. - p.z))), M_ROCK, NOUV));
    vec4 d = air;
    /* the ribs: voussoirs standing out from the vault over every pier */
    float zr = mod(p.z + P * .5, P) - P * .5;
    vec4 hin = hallAir(p + vec3(0, 50, 0), 3., 55.2, 4.4, -1e3, 1e3, M_CUT_SMALL);
    d = U(d, vec4(max(hin.x - .32, abs(zr) - .22), M_CUT_SMALL, hin.w * .5, hin.z * 3.));
    /* the channel, with a dressed kerb, and still water in it */
    d.x = max(d.x, min(min(.72 - ax, p.y + .6), min(.3 - p.y, 38.5 - p.z)));
    d = U(d, box(vec3(ax, p.y, p.z), vec3(.84, .05, 16), vec3(.12, .06, 22.5), M_DRESSED));
    d = U(d, vec4(p.y + .22, M_WATER, NOUV));
    d = U(d, vec4(46.5 - p.z, M_GLOW, NOUV));           /* the light itself, seen only through the crack */
    return d;
  }`,
  anchors: {
    flame: [{ p: [1.12, .47, 7.2], size: 1, body: true }, { p: [1.12, .47, 16.2], size: 1, body: true }, { p: [1.12, .47, 27], size: 1, body: true }],
    fog: [{ p: [0, 1.2, 30], w: 1.1, h: .22, a: .22 }, { p: [0, 1, 20], w: 1.3, h: .2, a: .14, speed: .7 }],
    glints: [{ p: [-.3, -.2, 11] }, { p: [.25, -.2, 14] }, { p: [-.1, -.2, 18] }, { p: [.3, -.2, 22] }, { p: [-.25, -.2, 27] }, { p: [.1, -.2, 33] }, { p: [-.15, -.2, 36] }],
  },
  live: { fog: 'far', motes: 'violet' },
};
