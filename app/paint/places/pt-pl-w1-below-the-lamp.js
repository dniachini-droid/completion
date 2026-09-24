/* SEALED (D-015). pt-pl-w1-below-the-lamp, round 2: kneeling under the lamp's ledge on the hall's right wall.
   The ledge's underside is a dark band across the top; the lamp above it, out of frame, lays a steady warm
   pool on the floor past the lip, and that pool's glow is all that reaches the wall under the ledge. A small
   niche at knee height, a row of cut strokes over it; round its mouth the stone is darkened, flat, as if by oil.
   The hall's violet comes from behind on the left. DARK state (cups unlit). */
export default {
  id: 'pt-pl-w1-below-the-lamp',
  name: 'Below the lamp',
  line: '',
  cam: { x: 1.85, y: .5, z: 5.52, pitch: -6, yaw: 89, f: .78, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 26,
  hazeBase: [.012, .011, .034], hazeFar: [.03, .028, .08],
  bloomAt: [2.1, .05, 5.6], bloomPow: 6, bloomC: [.1, .07, .06],
  bloom: { alpha: .1 },
  glow: { threshold: .6, k: .7 },
  blur: { px: 1, d0: 1.6, d1: 4, k: .6 },
  grain: .8, amb: .4, ambC: [.8, .76, 1.8], expo: 1.75,
  lights: [
    { p: [2.26, 1.55, 5.6], c: [1, .58, .24], k: 2.4, r: .8, shadow: 1 },           /* the clay lamp on the ledge, above and out of frame */
    { p: [2.05, .04, 5.58], c: [1, .62, .32], k: .55, r: .42 },                     /* its pool on the floor, glowing back up at the wall */
    { p: [.6, 2.6, 2.4], c: [.4, .37, .85], k: 5, r: 3.6, shadow: .6 },
    { p: [2.5, .55, 4.5], c: [.4, .37, .85], k: .35, r: .6 },                        /* the hall's violet, grazing along the wall from the left */          /* the hall's violet, from behind on the left */
    { p: [0, 2.5, 9], c: [.36, .33, .8], k: 3, r: 4 },                            /* the hall further on */
  ],
  glsl: /* glsl */ `
  /* the hall's rings cut in the wall within reach (as pt-b-1.A) */
  float rings(vec3 p) {
    vec2 w = vec2(p.z, p.y) / .55, c = floor(w), f = fract(w) - .5;
    float pick = h2(c + (p.x > 0. ? 7. : 0.)), rr = .2 + .12 * h2(c + 3.);
    float g = abs(length(f) - rr) * .55 - .007;
    return pick < .32 && p.y > .35 && p.y < 2.3 && length(vec2(p.z - 5.6, p.y - .45)) > .55 ? -g : -1.;
  }
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    d = A(d, vec4(min(rings(p), min(2.712 - abs(p.x), abs(p.x) - 2.5)), M_CUT, NOUV));
    vec3 q = p - vec3(2.7, .3, 5.6); vec2 m = vec2(q.z, q.y);
    /* round the niche's mouth the stone is darkened as if by oil: flat and dark, a shadow that stays */
    float rr = length((m - vec2(0, .15)) / vec2(1., 1.2)) + (fbm(m * 6., 3) - .5) * .035;
    if (q.x > -.03) gStain = (1. - smoothstep(.2, .245, rr)) * .9;
    d = A(d, vec4(min(archOpening2(m, .14, .15), .3 - q.x), M_CUT_SMALL, NOUV));      /* the niche, a hand deep and more */
    /* a row of cut strokes over its mouth, clean stone above the dark */
    float sz = mod(q.z + .125, .05) - .025, st = max(abs(sz) - .0045, abs(q.y - .41) - .028);
    if (abs(q.z) < .125 && q.x > -.03) { d.x = max(d.x, -max(st, q.x - .012)); if (st < .004) gStain = 0.; }
    vec4 lg = box(p, vec3(2.55, 1.22, 5.6), vec3(.33, .08, .36), M_CUT);            /* the lamp's ledge, its arrises worn round */
    lg.x -= .02;
    if (lg.x < .01 && p.y < 1.16) gTint = vec3(.45);                                /* its underside: dark, only the floor's glow on it */
    d = U(d, lg);
    return d;
  }`,
  anchors: {
    beam: [{ p: [2.12, 1.05, 5.6], w: .4 }, { p: [1.95, .05, 5.6], w: .7 }],
  },
  live: { motes: 'gold', gold: true },
};
