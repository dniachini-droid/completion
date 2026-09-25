/* SEALED (D-015). pt-cv-04, camp view: the hall, from the far end (the Lamp Hall, pt-b-1.A, reused; LIT state, after
   b-3.A). Standing at the great door's foot, looking back up the hall: the two lines of cup flames run back to the
   ledge, where the lamp is a small warm point at the vanishing point. Above the nearest cups, the rings cut high in
   the vault take their light from below, every groove drawn in warm and shadow: the look-at. Beside you, round
   the corner, a little cold light off the salt. Quieter than the places: one form, one light (the cups as one). */
import hall from './pt-b-1.A.js';

const CUP = [[2.72, 57.45], [-2.72, 55.7], [2.72, 54.35], [-2.72, 52.6], [2.72, 51.25], [-2.72, 49.5]];   /* the nearest cups' flames: x, z */

export default {
  ...hall,
  id: 'pt-cv-04',
  name: 'The hall, from the far end',
  line: '',
  cam: { x: .25, y: 1.5, z: 61.2, pitch: 22, yaw: 180, f: .62, cx: .5, cy: .5 },
  sheen: .08, gold: .4, ambC: [.8, .78, 2.1], expo: 1.95, glow: { threshold: .5, k: .9 },
  hazeBase: [.02, .018, .055], hazeFar: [.1, .08, .16], bloomAt: [0, 2, 5.6], bloomPow: 40, bloomC: [.14, .1, .1],
  lights: [
    ...CUP.map(([x, z]) => ({ p: [x * .97, 3.92, z], c: [1, .76, .52], k: .9, r: .7 })),   /* the nearest cups */
    { p: [0, 5, 30], c: [.42, .38, .85], k: 40, r: 14 },                              /* the lines of cups further back, as one glow in the violet */
    { p: [-2.1, 1.1, 60.4], c: [.55, .52, 1.05], k: .7, r: 1.1 },                     /* round the corner beside you: cold light off the salt */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  /* rings cut high in the vault above the cups: larger than those within reach */
  float vaultRings(vec3 p) {
    float zl = p.x > 0. ? mod(p.z - 2.2, 3.1) - 1.55 : mod(p.z - 3.75, 3.1) - 1.55, id = floor((p.z - (p.x > 0. ? 2.2 : 3.75)) / 3.1 + .5);
    vec2 f = vec2(zl + (h2(vec2(id, p.x)) - .5) * .3, p.y - 4.95 - .25 * h2(vec2(id, 3.)));
    float rr = .3 + .08 * h2(vec2(id, 7.));
    float g = engrave(abs(length(f) - rr), .045, .04);
    vec2 f2 = f - vec2(.95, .55 + .2 * h2(vec2(id, 9.)));                                  /* and a smaller one beside it, higher */
    return g + (h2(vec2(id, 5.)) < .6 ? engrave(abs(length(f2) - .17), .025, .016) : 0.);
  }
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    float ax = abs(p.x);
    if (ax > 1.2 && p.y > 4.3 && p.y < 7.2 && p.z > 46. && p.z < 59.) d.x += vaultRings(p);
    if (p.y > 5.) gTint *= mix(1., .45, smoothstep(5., 10., p.y));                     /* the crown falls away into the dark */
    if (p.y < .03) gTint *= mix(.55, 1., smoothstep(59., 50., p.z));                   /* the floor at your feet, out of the cups' light */
    /* the cups lit: a small still flame in every bowl */
    float zl = p.x > 0. ? mod(p.z - 2.2, 3.1) - 1.55 : mod(p.z - 3.75, 3.1) - 1.55;
    vec3 qf = vec3(ax - 2.77, p.y - 3.69, zl);
    if (p.z < 64.) d = U(d, vec4((length(qf / vec3(.025, .07, .025)) - 1.) * .025, M_GLOW, NOUV));
    if (ax > 2.72 && ax < 2.96 && p.y > 3.45 && p.y < 4.3 && abs(zl) < .32) gTint *= vec3(1.25, 1.05, .85);   /* the recess warmed by its flame */
    return d;
  }`,
  anchors: {
    flame: CUP.slice(0, 4).map(([x, z]) => ({ p: [x > 0 ? 2.79 : -2.79, 3.67, z], size: .6 })),
    fog: [{ p: [0, 1.6, 40], w: 1.2, h: .3, a: .16 }, { p: [0, 1., 52], w: 1.3, h: .2, a: .1, speed: .6 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
