/* SEALED (D-015). pt-b-1.C, the Survey Cut: a low round-roofed side chamber someone lived in.
   A camp cot along the right wall, a pair of boots side by side beneath it; on the cot a notebook
   with a pencil in it and a tin box with a slate on its lid; on the back wall a shelf with the rod.
   The clay lamp's weak warm light comes from the doorway behind you; violet fills the corners. */
export default {
  id: 'pt-b-1.C',
  name: 'The Survey Cut',
  line: '',
  cam: { x: .05, y: 1.55, z: .12, pitch: -27, yaw: 13, f: .68, cx: .5, cy: .5 },
  far: 12, fogK: 1 / 14,
  hazeBase: [.02, .018, .05], hazeFar: [.03, .028, .08],
  bloomAt: [-.6, 1.2, 4.6], bloomPow: 8, bloomC: [.1, .09, .2],
  bloom: { alpha: .2 },
  glow: { threshold: .7, k: .6 },
  blur: { px: 1.4, d0: 3.5, d1: 7, k: .6 },
  expo: 1.9, ambC: [.7, .66, 1.5],
  lights: [
    { p: [-.25, 1.25, -1.7], c: [1, .6, .28], k: 5.5, r: 1.3, warm: .035, shadow: 1 },   /* the clay lamp, in the passage behind you */
    { p: [-1.35, .7, 3.9], c: [.4, .37, .85], k: .5, r: .8 },                           /* violet in the dark corners */
    { p: [1.35, 1.9, 4], c: [.4, .37, .85], k: .35, r: .8 },
  ],
  glsl: /* glsl */ `
  vec4 boot(vec3 p, vec3 at) {
    vec3 q = p - at;
    vec4 b = column(p, at.xz + vec2(.02, 0), .055, 0., .24, M_ROCK);                 /* the shaft */
    b.x -= .006;
    vec3 f = q - vec3(-.1, .045, 0);
    vec4 foot = vec4(length(max(abs(f) - vec3(.12, .02, .03), 0.)) - .03, M_ROCK, NOUV);
    return U(b, foot);
  }
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 1.8, 1.2, 1.8, 0., 4.4, M_CUT);
    d = A(d, boxAir(p, vec3(0, .95, -1.5), vec3(.55, .95, 1.55), M_CUT));            /* the doorway and passage */
    /* the cot: frame, sagging canvas, legs */
    float sag = .035 * (1. - pow(abs(p.z - 2.25) / .95, 2.)) * (1. - pow(abs(p.x - .95) / .4, 2.));
    d = U(d, box(p, vec3(.95, .445 - max(sag, 0.), 2.25), vec3(.38, .012, .95), M_DRESSED));
    d = U(d, box(vec3(abs(p.x - .95), p.y, p.z), vec3(.38, .44, 2.25), vec3(.02, .025, 1.), M_CUT_SMALL));
    d = U(d, box(vec3(abs(p.x - .95), p.y, abs(p.z - 2.25)), vec3(.36, .22, .88), vec3(.018, .22, .018), M_CUT_SMALL));
    /* the boots, side by side under the cot, toes out, as if for the morning */
    d = U(d, boot(p, vec3(.84, 0, 1.78)));
    d = U(d, boot(p, vec3(.85, 0, 1.94)));
    /* on the cot: the notebook with its pencil, the tin box with a slate on its lid */
    d = U(d, box(p, vec3(.85, .445, 2.6), vec3(.1, .012, .14), M_DRESSED));
    d = U(d, vec4(length(vec2(p.x - .86, p.y - .462)) - .005, M_ROCK, NOUV) * vec4(1) + vec4(max(0., abs(p.z - 2.59) - .09), 0, 0, 0));
    d = U(d, box(p, vec3(1.08, .5, 2.98), vec3(.1, .055, .07), M_CUT_SMALL));
    d = U(d, box(p, vec3(1.08, .56, 2.98), vec3(.105, .006, .075), M_ROCK));
    /* the shelf on the back wall, and the rod on it */
    d = U(d, box(p, vec3(-.55, 1.2, 4.3), vec3(.42, .03, .16), M_DRESSED));
    d = U(d, vec4(length(vec2(p.y - 1.25, p.z - 4.25)) - .022 + max(0., abs(p.x + .55) - .2), M_ROCK, NOUV));
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.2, 1.9, -.2], w: .35 }, { p: [.3, .1, 1.8], w: .6 }],
  },
  live: { motes: 'gold', gold: true },
};
