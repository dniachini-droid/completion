/* SEALED (D-015). pt-pl-w1-below-the-lamp: kneeling under the lamp's ledge on the hall's right wall.
   A small niche at knee height with a row of cut strokes over it; round its mouth the stone is
   darkened as if by oil, a shadow that does not move. The ledge's underside is a dark band across
   the top; the lamp above, out of frame, throws its light down past the lip onto the floor.
   DARK state (cups unlit); the lit state (after b-3.A) adds the cups' glow from the hall: later round. */
export default {
  id: 'pt-pl-w1-below-the-lamp',
  name: 'Below the lamp',
  line: '',
  cam: { x: 1.5, y: .62, z: 5.6, pitch: -4, yaw: 90, f: .95, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 30,
  hazeBase: [.02, .018, .05], hazeFar: [.05, .045, .12],
  bloomAt: [-2, 3, 30], bloomPow: 30, bloomC: [.2, .18, .4],
  glow: { threshold: .62, k: .8 },
  blur: { px: .8, d0: .2, d1: .7, k: 1 },
  expo: 1.7, grade: [1, 1.06, .9],
  lights: [
    { p: [2.23, 1.55, 5.6], c: [1, .68, .3], k: 2.6, r: .9, shadow: 1 },              /* the clay lamp on the ledge, above */
    { p: [2.05, .3, 5.6], c: [1, .7, .34], k: .15, r: .4, warm: .015 },                  /* its light off the floor, back up */
    { p: [-2, 3.5, 9], c: [.4, .37, .85], k: 7, r: 5 },                                    /* the hall's violet, from behind */
  ],
  glsl: /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    vec3 q = p - vec3(2.7, .28, 5.6); vec2 m = vec2(q.z, q.y);
    /* the stone round the niche's mouth, darkened as if by oil: flat, like a shadow that stays */
    float rr = length((m - vec2(0, .19)) / vec2(1., 1.2)) + (fbm(m * 7., 3) - .5) * .08;
    float oil = (1. - smoothstep(.17, .36, rr)) * .95;
    if (q.x > -.02 && h2(floor(m / .0012)) < oil) d.yzw = vec3(M_DARK, NOUV);
    d = A(d, vec4(min(archOpening2(m, .15, .17), .28 - q.x), M_CUT_SMALL, NOUV));    /* the niche */
    /* a row of cut strokes under its mouth, clean stone in the dark */
    float sz = mod(q.z + .13, .052) - .026, st = max(abs(sz) - .0045, abs(q.y + .07) - .032);
    if (abs(q.z) < .13 && q.x > -.03) { d.x = max(d.x, -max(st, q.x - .012)); if (st < .004) d.yzw = vec3(M_CUT_SMALL, NOUV); }
    d = U(d, box(p, vec3(2.55, 1.22, 5.6), vec3(.35, .1, .38), M_CUT));              /* the lamp's ledge */
    return d;
  }`,
  anchors: {
    beam: [{ p: [2.15, 1.1, 5.6], w: .5 }, { p: [1.9, .05, 5.6], w: .8 }],
  },
  live: { motes: 'gold', gold: true },
};
