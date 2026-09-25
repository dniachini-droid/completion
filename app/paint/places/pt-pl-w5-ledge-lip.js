/* SEALED (D-015). pt-pl-w5-ledge-lip, the ledge's lip (the Lamp Hall of pt-b-1.A, reused; LIT state, cups
   burning): kneeling beside the lamp's ledge on the hall's right wall, looking up under it. The ledge is a dark
   slab across the upper frame; the lamp on it is out of sight above, its light spilling round the ledge's front
   edge and curling a little under it, where, in the shadow, a small count is cut into the underside close to
   the lip, where no one standing would ever see it. The rest of the underside and the wall below stay dark;
   the hall's cups keep a low warm glow on the far wall behind. */
export default {
  id: 'pt-pl-w5-ledge-lip',
  name: 'The ledge\'s lip',
  line: '',
  cam: { x: 1.8, y: .5, z: 5.35, pitch: 36, yaw: 80, f: .66, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 26,
  hazeBase: [.012, .011, .034], hazeFar: [.06, .055, .16],
  bloomAt: [2.2, 1.5, 5.6], bloomPow: 8, bloomC: [.06, .045, .03],
  bloom: { alpha: .28 },
  glow: { threshold: .6, k: .6 },
  blur: { px: 1.2, d0: 1.8, d1: 6, k: .7 },
  gold: 1, sheen: 0, grain: .55, shadowJitter: 1, amb: .5, ambC: [.85, .78, 1.5], expo: 1.7,
  lights: [
    { p: [2.3, 1.42, 5.6], c: [1, .72, .36], k: .45, r: .5, shadow: 1, reach: 1.2 },          /* the clay lamp on the ledge, above and out of sight */
    { p: [2.14, 1.09, 5.62], c: [1, .76, .46], k: .07, r: .14, reach: .42, shadow: .6 },           /* its light curling round the lip, just under it */
    { p: [.4, 2.2, 3.4], c: [.42, .39, .9], k: 12, r: 3.4, shadow: .6 },                          /* the hall's violet, from behind on the left */
    { p: [-1.9, 3.7, 9.], c: [1, .74, .45], k: 1.4, r: 1.4, reach: 5. },                       /* the cups on the far wall, a low warm glow */
    { p: [2.3, .08, 5.6], c: [1, .72, .36], k: .035, r: .25, reach: .6 },                      /* the lamp's gold lying at the wall's foot */
  ],
  glsl: /* glsl */ `
  vec4 scenePrev(vec3 p) {
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    d.z += 1.1; d.w += .55;
    if (p.y < .03) gTint = vec3(mix(.14, .3, smoothstep(1.8, 2.68, p.x)));                  /* the floor, kept down */
    if (p.x > 2.6) gTint *= mix(.55, 1., smoothstep(.3, 1., p.y));                          /* the wall low down, in shadow */
    if (p.x > 2.6 && p.y > 1.28) gTint *= mix(.6, .25, smoothstep(1.3, 2.4, p.y));          /* above the ledge: the lamp's light, held down */
    if (p.x < -2.4 && p.y > 2.) gTint *= .6;
    vec4 lg = box(p, vec3(2.55, 1.22, 5.6), vec3(.31, .06, .6), M_CUT);                       /* the lamp's ledge, arrises worn round */
    lg.x -= .04 + rough(p, .008, 6.);
    if (lg.x < .01) {
      gTint = vec3(p.y < 1.15 ? .5 : .75);
      /* the count: six short strokes cut into the underside, close to the lip, across its width */
      vec2 m = vec2(p.z - 5.6, p.x - 2.36);
      float k = floor((m.x + .09) / .03), sz = m.x + .09 - (k + .5) * .03 + (h2(vec2(k, 3.)) - .5) * .006;
      float ln = length(vec2(sz + m.y * (h2(vec2(k, 8.)) - .5) * .3, max(abs(m.y) - .026 - .006 * h2(vec2(k, 4.)), 0.)));
      if (p.y < 1.17 && k >= 0. && k < 6.) { lg.x += engrave(ln, .0065, .006); gTint *= mix(1., 2.2, smoothstep(.006, .0, ln)); }
      /* and a short cross-bar above them, closing the count */
      float cb = length(vec2(max(abs(m.x) - .095, 0.), m.y - .042));
      if (p.y < 1.17) lg.x += engrave(cb, .005, .004);
      if (p.y < 1.17) gTint *= mix(.35, 1., smoothstep(2.6, 2.3, p.x));                        /* the underside darker toward the wall */
    }
    d = U(d, lg);
    return d;
  }
  /* polish pass: the stone's own relief and mottling, hand-worked, never machine-flat */
  vec4 scene(vec3 p) {
    vec4 d = scenePrev(p);
    float m = floor(d.y + .5);
    if (d.x < .05 && (m == M_CUT || m == M_CUT_SMALL || m == M_DRESSED || m == M_FLOOR)) {
      d.x += rough(p, 0.006, 4.0) + rough(p, 0.0018, 20.0);
      gTint *= .86 + .28 * fbm(p.xz * 1.7 + p.y * 1.3, 3);
    }
    return d;
  }`,
  anchors: {
    beam: [{ p: [2.18, 1.2, 5.6], w: .1 }],
  },
  live: { motes: 'gold', gold: true },
};
