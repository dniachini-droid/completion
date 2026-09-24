/* SEALED (D-015). pt-pl-w1-pick-niche: a niche an arm long, low in the salt gallery's right wall,
   its mouth framed in cut stone; a row of empty strokes cut in its lip; beside it, in the salt,
   short score marks from a blade. The salt is banded and crystalline; the one light is the
   gallery's cold violet, raking from the left. Crouched, three-quarter on the niche. */
const ZN = 6;                                                       /* where the niche is */
export default {
  id: 'pt-pl-w1-pick-niche',
  name: 'The pick niche',
  line: '',
  cam: { x: .8, y: .62, z: ZN - 1.4, pitch: -13, yaw: 20, f: .7, cx: .5, cy: .5 },
  far: 45, fogK: 1 / 30, hazeFar: [.1, .09, .26],
  bloomAt: [-.3, 1.2, ZN + 34], bloomPow: 22, bloomC: [.44, .41, .82],
  glow: { threshold: .62, k: .7 },
  blur: { d0: 4, d1: 18 },
  expo: 1.75, grade: [1.08, 1, .92],
  lights: [
    { p: [-1.1, .45, ZN + 7.5], c: [.62, .58, 1.2], k: 40, r: 4, shadow: 1 },   /* the gallery's light, raking along the wall from the left */
    { p: [-.3, 1.5, ZN + 32], c: [.62, .58, 1.2], k: 60, r: 9 },     /* far down the gallery */                /* far down the gallery */
    { p: [0, 1, ZN - 5], c: [.3, .28, .66], k: 1.5, r: 3 },                         /* faint fill from behind */
  ],
  glsl: /* glsl */ `
  const float ZN = ${ZN}.;
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    /* rock salt on the walls: uneven bands of harder and softer salt, crystalline grain */
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(1.9, 2.6, p.y));
    float bnd = fract(p.y * 2.4 + fbm(vec2(p.z * .22, p.y * .6), 3) * 2.4);
    d.x += wl * (smoothstep(0., .1, bnd) * .025 - smoothstep(.5, .6, bnd) * .018 + rough(p, .035, 9.));
    /* the roof dips low between here and the light: the salt above you stays in shadow */
    d.x = min(d.x, (2.05 + 2.6 * smoothstep(.8, 3.2, abs(p.z - ZN - 2.8)) - p.y + rough(p, .25, 1.3)) * .7);
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : M_ROCK, NOUV);
    /* the niche: round-headed, an arm long, its mouth ringed and silled in cut stone */
    vec3 q = p - vec3(2., .28, ZN); vec2 m = vec2(q.z, q.y);
    float inner = archOpening2(m, .36, .14), outer = archOpening2(m + vec2(0, .07), .44, .14);
    d = A(d, vec4(min(inner, .5 - q.x), M_CUT_SMALL, NOUV));
    vec4 ring = vec4(max(max(-outer, inner), abs(q.x - .1) - .11) + rough(p, .01, 6.), M_DRESSED, NOUV);
    d = U(d, ring);
    d = U(d, box(q, vec3(.08, -.04, 0), vec3(.12, .04, .47), M_DRESSED));          /* the lip */
    /* a row of empty strokes cut in the lip's face */
    float sz = mod(q.z + .32, .075) - .0375;
    if (abs(q.z) < .3) d.x = max(d.x, -max(max(abs(sz) - .007, abs(q.y + .04) - .028), q.x + .028));
    /* score marks in the salt beside it: short blade cuts, all one way */
    vec2 w = vec2(q.z - .72, q.y - .25); float k = floor(w.x / .07);
    float cut = abs(w.x - k * .07 - .035 + w.y * .45) - .005;
    if (k >= 0. && k < 6. && abs(w.y) < .09 + .04 * h2(vec2(k, 3.)) && q.x > -.1) d.x = max(d.x, -max(cut, -.012 - q.x));
    return d;
  }`,
  anchors: {
    glints: [[1.9, .9, ZN + .9], [1.95, 1.3, ZN + 1.6], [1.92, .35, ZN + 1.3], [1.85, 1.6, ZN + 2.6], [-1.9, 1.1, ZN + 5], [1.9, .7, ZN + 3.4]].map(p => ({ p })),
    beam: [{ p: [-1.1, 1.8, ZN + 2.6], w: .25 }, { p: [.8, .1, ZN + .6], w: .35 }],
  },
  live: { motes: 'violet' },
};
