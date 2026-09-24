/* SEALED (D-015). pt-pl-w1-below-the-lamp, round 3: kneeling under the lamp's ledge on the hall's right wall.
   The ledge's underside is a dark band across the top; the lamp above it, out of frame, lays a thin gold
   light along the wall's foot, and that glow is all that reaches the wall under the ledge. A small low
   recess at knee height, a row of cut strokes over it; round its mouth, weighted to the sill where hands
   reached in, the stone is darkened as if by oil: a ring with a dull sheen, like a shadow that stays.
   The hall's violet from behind on the left keeps the stone cold. DARK state (cups unlit). */
export default {
  id: 'pt-pl-w1-below-the-lamp',
  name: 'Below the lamp',
  line: '',
  cam: { x: 1.75, y: .42, z: 5.6, pitch: 4, yaw: 87, f: .74, cx: .5, cy: .44 },
  far: 30, fogK: 1 / 26,
  hazeBase: [.012, .011, .034], hazeFar: [.06, .055, .16],
  bloomAt: [2.5, .05, 5.6], bloomPow: 6, bloomC: [.08, .06, .03],
  bloom: { alpha: .1 },
  glow: { threshold: .6, k: .7 },
  blur: { px: 1, d0: 1.6, d1: 4, k: .6 },
  gold: 1, grain: .3, shadowJitter: 1, amb: .5, ambC: [.75, .72, 1.9], expo: 1.7,
  lights: [
    { p: [2.26, 1.55, 5.6], c: [1, .72, .36], k: .7, r: .8, shadow: 1 },           /* the clay lamp on the ledge, above and out of frame */
    { p: [2.6, .03, 5.6], c: [1, .72, .36], k: .2, r: .3 },                      /* its light on the floor at the wall's foot, glowing back up */
    { p: [2.66, .38, 5.6], c: [1, .72, .36], k: .003, r: .1 },                     /* a trace of it inside the recess, on its back */
    { p: [.6, 2.6, 2.4], c: [.4, .37, .85], k: 9, r: 3.6, shadow: .6 },            /* the hall's violet, from behind on the left */
    { p: [2.5, .45, 5.05], c: [.4, .37, .85], k: .35, r: .45 },                      /* the same, grazing along the wall */
  ],
  glsl: /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    if (p.y < .03 && p.x < 2.3) gTint = vec3(.62);
    if (p.x > 2.6) gTint *= 1. - .65 * smoothstep(.85, 1.1, p.y) * smoothstep(.2, .45, abs(p.z - 5.6));   /* beside and above the ledge's ends: one dark band */                                 /* the near floor, out of the lamp's reach */
    vec3 q = p - vec3(2.7, .3, 5.6); vec2 m = vec2(q.z, q.y);
    /* the recess: low and a little wider than high, its corners worn round */
    vec2 e = abs(m - vec2(0, .14)) - vec2(.16, .1) + .03;
    float sd = length(max(e, 0.)) + min(max(e.x, e.y), 0.) - .03 + (fbm(m * 14., 3) - .5) * .018 - .02 * smoothstep(.1, .2, m.y) * (1. - abs(m.x) / .16);   /* hand-cut: uneven, its head a little arched */
    if (q.x > -.06) {
      /* the oil: a ring round the mouth, wiped clean at the very edge, heaviest at the sill and low sides */
      float nz = (fbm(m * 3. + 2., 4) - .5) * .12;
      float ring = smoothstep(-.005, .006, sd) * (1. - smoothstep(.08, .24, sd + nz));   /* the oil starts at the very edge */
      ring *= mix(.45, 1., smoothstep(.3, .02, m.y));
      gStain = .88 * ring; gPolish = .3 * ring;
      /* a row of cut strokes over it, V-cut, clean stone */
      float k = floor((q.z + .125) / .05), sz = q.z + .125 - (k + .5) * .05 + (h2(vec2(k, 3.)) - .5) * .01;
      float t = clamp((q.y - .31) / .06, 0., 1.), tilt = (h2(vec2(k, 8.)) - .5) * .25;
      float ln = length(vec2(sz + (q.y - .34) * tilt, max(abs(q.y - .34 - .004 * h2(vec2(k, 1.))) - .024 - .006 * h2(vec2(k, 4.)), 0.)));
      if (k >= 0. && k < 5.) d.x += engrave(ln, .005 + .006 * t, .01);             /* hand-cut, uneven, tapering to the foot */
    }
    d = A(d, vec4(min(-sd, .45 - q.x), M_CUT_SMALL, NOUV));
    if (q.x > .03 && sd < .01) gTint = vec3(.3);                                    /* inside, the dark of a hand's depth */
    vec4 lg = box(p, vec3(2.55, 1.22, 5.6), vec3(.31, .06, .34), M_CUT);            /* the lamp's ledge, its arrises worn round */
    lg.x -= .04;
    if (lg.x < .01 && p.y < 1.14) gTint = vec3(.5);                                 /* its underside: dark, only the floor's glow on it */
    d = U(d, lg);
    return d;
  }`,
  anchors: {
    beam: [{ p: [2.4, 1.1, 5.6], w: .15 }, { p: [2.55, .02, 5.6], w: .15 }],
  },
  live: { motes: 'gold', gold: true },
};
