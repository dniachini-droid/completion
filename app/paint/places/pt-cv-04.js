/* SEALED (D-015). pt-cv-04, camp view: the hall, from the far end (the Lamp Hall, pt-b-1.A, reused; LIT state, after
   b-3.A). Standing at the great door's foot, looking back up the hall and up into the vault: overhead, above the
   nearest cups, the rings cut high in the vault take the cups' light from below, every groove drawn in warm and
   shadow: the look-at. Below them the two lines of cup flames run back to the ledge, where the lamp is a small warm
   point at the vanishing point. Beside you, round the corner, a little cold light off the salt. Quieter than the
   places: one form, one light (the cups as one). */
import hall from './pt-b-1.A.js';

const CUPR = [57.45, 54.35, 51.25], CUPL = [55.7, 52.6];                     /* the nearest cups: right wall (x +), left (x -) */

export default {
  ...hall,
  id: 'pt-cv-04',
  name: 'The hall, from the far end',
  line: '',
  cam: { x: -.8, y: 1.5, z: 61.5, pitch: 55, yaw: 168, f: .5, cx: .5, cy: .5 },
  sheen: .05, gold: .5, ambC: [.8, .78, 2.1], expo: 2, glow: { threshold: .5, k: .8 },
  hazeBase: [.02, .018, .055], hazeFar: [.1, .08, .15], bloomAt: [2.3, 1.4, 5.6], bloomPow: 60, bloomC: [.12, .08, .05],
  fogK: 1 / 30,
  lights: [
    ...CUPR.map((z, i) => ({ p: [2.25, 5.0, z], c: [1, .72, .42], k: 3.4 - .8 * i, r: 1.1, shadow: .5, reach: 4. })),   /* the nearest cups on the right: up into the vault */
    ...CUPL.map((z, i) => ({ p: [-2.25, 5.0, z], c: [1, .72, .42], k: 2.2 - .5 * i, r: 1.1, shadow: .5, reach: 4. })),  /* and on the left */
    { p: [0, 5, 30], c: [.5, .42, .8], k: 45, r: 14 },                                  /* the lines of cups further back, as one glow in the violet */
    { p: [2.3, 1.42, 5.6], c: [1, .7, .4], k: 0, r: .5, air: .5 },                       /* the lamp on its ledge, a warm point at the far end */
    { p: [-3.4, 1.2, 61.5], c: [.6, .58, 1.1], k: 3, r: 1.2, shadow: .5 },               /* round the corner beside you: cold light off the salt */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  /* rings cut high in the vault over the cups: large, and cut deep */
  float vaultRings(vec2 uv, float side) {
    float z0 = side > 0. ? 2.2 : 3.75, id = floor((uv.x - z0) / 3.1 + .5), zl = uv.x - z0 - id * 3.1;
    vec2 f = vec2(zl + (h2(vec2(id, side)) - .5) * .4, uv.y - 6.75 - .25 * h2(vec2(id, 3. + side)));
    float rr = .72 + .12 * h2(vec2(id, 7. + side));
    float g = engrave(abs(length(f) - rr), .09, .07);
    vec2 f2 = f - vec2(1.15 * (h2(vec2(id, 2.)) > .5 ? 1. : -1.), 1.2 + .3 * h2(vec2(id, 9.)));      /* and a smaller one beside it, higher */
    g += h2(vec2(id, 5. + side)) < .7 ? engrave(abs(length(f2) - .36), .07, .05) : 0.;
    return g;
  }
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    float ax = abs(p.x);
    if (p.y > 5.6 && d.w > 5.7 && d.w < 10.5 && p.z > 44. && p.z < 60.5) d.x += vaultRings(d.zw, sign(p.x));
    if (p.y > 9.5) gTint *= mix(1., .4, smoothstep(9.5, 13., p.y));                    /* the crown falls away into the dark */
    if (p.y < .03) gTint *= mix(.5, 1., smoothstep(61., 52., p.z));                    /* the floor at your feet, out of the cups' light */
    if (p.z > 60.5 && p.y < 5.) gTint *= .6;                                           /* the door's jambs beside you, in shadow */
    /* the cups lit: a small still flame in every bowl, slim, the glow does the rest */
    float zl = p.x > 0. ? mod(p.z - 2.2, 3.1) - 1.55 : mod(p.z - 3.75, 3.1) - 1.55;
    vec3 qf = vec3(ax - 2.79, p.y - 3.69, zl);
    float fr = .012 * (1. - smoothstep(-.02, .05, qf.y)) + .004;
    if (p.z < 64.) d = U(d, vec4(length(vec3(qf.x, max(abs(qf.y - .01) - .025, 0.), qf.z)) - fr, M_GLOW, NOUV));
    if (ax > 2.72 && ax < 2.96 && p.y > 3.45 && p.y < 4.3 && abs(zl) < .32) gTint *= vec3(1.3, 1.05, .8);   /* the recess warmed by its flame */
    return d;
  }`,
  anchors: {
    flame: [...CUPR.slice(0, 2).map(z => ({ p: [2.79, 3.69, z], size: .6 })), ...CUPL.slice(0, 1).map(z => ({ p: [-2.79, 3.69, z], size: .6 }))],
    fog: [{ p: [0, 1.6, 40], w: 1.2, h: .3, a: .16 }, { p: [0, 1., 52], w: 1.3, h: .2, a: .1, speed: .6 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
