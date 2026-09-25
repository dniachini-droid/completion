/* Regression, not a place: the kit's materials side by side (D-072), so a kit change that alters one shows.
   Back wall, left to right: rock salt (pink edges at .5), cut stone polished by touch in a band, a flat dark stain.
   On a cut-stone floor: cloth, leather, tin, paper, wood, slate. Violet light from the left, a clay lamp at the right. */
export default {
  id: 'regression-materials',
  name: 'The kit\'s materials',
  line: 'Salt, polish, stain; cloth, leather, tin, paper, wood, slate.',
  cam: { x: .3, y: .75, z: .2, pitch: -8, yaw: -12, f: .62, cx: .5, cy: .5 },
  amb: .6,
  far: 20, fogK: 1 / 30, bloomAt: [-3, 2, 6], bloomPow: 10, bloomC: [.3, .28, .6],
  glow: { threshold: .6, k: .7 }, blur: { d0: 6, d1: 14 },
  salt: { pink: .5 },
  lights: [
    { p: [-.6, 2.2, .4], c: [.62, .58, 1.2], k: 5, r: 2.2, shadow: 1 },
    { p: [1.3, .5, 1.1], c: [1, .58, .24], k: 1.2, r: .6, warm: .01, shadow: 1 },
    { p: [0, 2, -2], c: [.3, .28, .66], k: 2, r: 3 },
  ],
  glsl: /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = boxAir(p, vec3(0, 1.5, 0), vec3(1.6, 1.5, 2.6), M_CUT);
    if (p.z > 2.55) {
      if (p.x < -.55) d.yzw = vec3(M_SALT, NOUV);
      else if (p.x < .55) gPolish = smoothstep(.9, 1., p.y) * (1. - smoothstep(1.9, 2., p.y));
      else gStain = 1. - smoothstep(.25, .45, length(vec2(p.x - 1.05, p.y - 1.3)));
    }
    if (p.x < -1.55) d.yzw = vec3(M_SALT, NOUV);                     /* the whole left wall is salt too */
    if (p.y < .02) d.yzw = vec3(M_FLOOR, NOUV);
    d = U(d, box(p, vec3(-1.05, .06, 1.4), vec3(.22, .06, .3), M_CLOTH));
    d = U(d, vec4(length((p - vec3(-.5, .1, 1.4)) / vec3(.14, .1, .07)) * .07 - .07, M_LEATHER, NOUV));
    d = U(d, box(p, vec3(0, .07, 1.4), vec3(.12, .07, .08), M_TIN));
    d = U(d, box(p, vec3(.5, .004, 1.4), vec3(.1, .004, .14), M_PAPER));
    d = U(d, box(p, vec3(1.05, .05, 1.4), vec3(.25, .05, .06), M_WOOD));
    d = U(d, box(p, vec3(0, .012, 1.9), vec3(.18, .012, .12), M_SLATE));
    return d;
  }`,
};
