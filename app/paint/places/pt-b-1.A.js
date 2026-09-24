/* SEALED (D-015). pt-b-1.A, the Lamp Hall, DARK state (before the first word: cups unlit).
   The approved hall (regression/lamp-hall.js, same camera and light) with what the brief adds:
   the dark wall-cups on both walls, the lintel's sealed blank, rings cut within reach, and the
   great door filling the far end. Lit state (cups burning, after b-3.A): same file, later round. */
export default {
  id: 'pt-b-1.A',
  name: 'The Lamp Hall',
  line: '',
  cam: { x: .2, y: 1.6, z: 1.5, pitch: 0, f: .62, cx: .5, cy: .47 },
  far: 66, fogK: 1 / 34, sheen: .16, gold: .7, glow: { threshold: .55, k: .45 },
  bloomAt: [0, 4.5, 66],
  lights: [
    { p: [0, 5.5, 58], c: [.62, .58, 1.25], k: 560, r: 40 },                  /* the far end: the light before the great door */
    { p: [0, 7.8, 63.5], c: [.62, .58, 1.25], k: 60, r: 3 },                  /* and on the door's head, so the leaf stands dark inside the glow */
    { p: [0, 9, 20], c: [.36, .33, .8], k: 26, r: 12 },                       /* haze high in the vault */
    { p: [0, 7, -4], c: [.3, .28, .66], k: 5, r: 7 },                         /* soft fill from behind */
    { p: [2.26, 1.54, 5.6], c: [1, .68, .3], k: 1.9, r: 1.25, warm: .13 },     /* the clay lamp on its ledge */
    { p: [1.2, 2.6, 6.5], c: [.4, .37, .85], k: 3.2, r: 3.2 },                /* the hall's glow on the lintel wall */
  ],
  glsl: /* glsl */ `
  /* a wall-cup: an arched recess a third of the way up, a dark clay bowl on its sill */
  vec4 cups(vec3 p, float side, float z0) {
    float zl = mod(p.z - z0, 3.1) - 1.55, ax = p.x * side;
    if (p.z < z0 - 1.6 || p.z > z0 + 60.) return vec4(-1, M_CUT, NOUV);
    float op = archOpening2(vec2(zl, p.y - 3.5), .3, .42);
    return vec4(min(op, 2.94 - ax), M_CUT, NOUV);
  }
  vec4 bowl(vec3 p, float side, float z0) {
    float zl = mod(p.z - z0, 3.1) - 1.55;
    vec3 q = vec3(p.x * side - 2.8, p.y - 3.56, zl);
    float e = (length(q / vec3(.15, .1, .15)) - 1.) * .1;
    if (max(e, q.y - .05) < .01) gTint = vec3(.8, .66, .6);                        /* clay, a shade lighter than the stone, so its rim shows */
    vec4 b = vec4(max(e, q.y - .05), M_ROCK, NOUV);
    return b;
  }
  /* rings cut into the walls within reach: shallow grooves, some cells only */
  float rings(vec3 p) {
    vec2 w = vec2(p.z, p.y) / .55, c = floor(w), f = fract(w) - .5;
    float pick = h2(c + (p.x > 0. ? 7. : 0.)) + (length(vec2(p.z - 5.6, p.y - 1.22)) < .75 ? 1. : 0.);
    float rr = .2 + .12 * h2(c + 3.);
    return pick < .22 && p.y > .35 && p.y < 2.3 ? engrave(abs(length(f) - rr) * .55, .03, .012) : 0.;
  }
  vec4 scene(vec3 p) {
    float ax = abs(p.x);
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    if (p.y < .03) gTint = vec3(.8);                                              /* the floor a shade down, as the hall's */
    d = A(d, cups(p, 1., 2.2));
    d = A(d, cups(p, -1., 3.75));
    if (ax > 2.4) d.x += rings(p);
    d = A(d, vec4(min(min(p.z - 6.55, 8.05 - p.z), min(min(2.4 - p.y, p.y), min(2.83 + p.x, -2.5 - p.x))), M_CUT_SMALL, NOUV));  /* the lintel's sealed blank */
    /* the great door: most of the far wall, a darker leaf set back in a pointed arch */
    float dr = archOpening2(vec2(p.x, p.y), 2.1, 6.2);
    dr = max(dr, min(dr, 2.9 - length(vec2(ax + .8, p.y - 6.2))));
    d = A(d, vec4(min(dr, min(66.5 - p.z, p.z - 60.)), M_CUT, NOUV));
    d = U(d, vec4(66.45 - p.z, M_DARK, NOUV));
    d = U(d, box(p, vec3(2.55, 1.22, 5.6), vec3(.35, .1, .38), M_CUT));          /* the lamp's ledge */
    d = U(d, box(p, vec3(-2.69, 2.825, 7.3), vec3(.29, .425, 1.3), M_DRESSED));   /* the lintel */
    d = U(d, bowl(p, 1., 2.2));
    d = U(d, bowl(p, -1., 3.75));
    return d;
  }`,
  anchors: {
    flame: [{ p: [2.4, 1.4, 5.6], size: 1, body: true }],
    fog: [{ p: [0, 2.2, 40], w: 1.2, h: .3, a: .22 }, { p: [0, 1.4, 24], w: 1.3, h: .22, a: .12, speed: .6 }],
    beam: [{ p: [2.3, 1.9, 5.6], w: .06 }, { p: [2.1, .4, 5.6], w: .12 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
