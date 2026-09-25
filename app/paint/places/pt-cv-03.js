/* SEALED (D-015). pt-cv-03, camp view: the hall, from the passage (the Lamp Hall, pt-b-1.A, reused; DARK state,
   cups unlit). Just inside, standing at the passage mouth: the lamp on its ledge near on the right, its flame
   still; past it the hall goes away into the dark, its far end only a trace of violet in the fog. One small warm
   light against a long dark. Quieter than the places: one form, one light. */
import hall from './pt-b-1.A.js';

const F = [2.325, 1.376, 5.6];                                                          /* the flame */

export default {
  ...hall,
  id: 'pt-cv-03',
  name: 'The hall, from the passage',
  line: '',
  cam: { x: 1.92, y: 1.47, z: 4.72, pitch: 1, yaw: 21, f: .62, cx: .5, cy: .47 },
  sheen: 0, gold: 1, expo: 2.1, glow: { threshold: .5, k: .7 }, bloom: { alpha: .22 }, grain: .3, shadowJitter: 1,
  hazeBase: [.02, .018, .06], hazeFar: [.09, .085, .22], bloomC: [.06, .055, .13],
  blur: { px: 1.6, d0: 4, d1: 20, k: .85 },
  lights: [
    { p: [F[0] - .02, F[1] + .03, F[2]], c: [1, .68, .3], k: .22, r: .4, warm: .004, shadow: .7, reach: .6 },   /* the clay lamp's flame: the one light */
    { p: [F[0] - .1, F[1] + .05, F[2]], c: [1, .66, .3], k: .25, r: .9, shadow: .8, reach: 2.4 },          /* its warm pool, lying on the wall and floor round the ledge */
    { p: [F[0], F[1] + .008, F[2]], c: [1, .8, .5], k: 0, r: .022, air: 1.2 },         /* the flame itself: a small hot core, glowing in the air */
    { p: [F[0], F[1] + .02, F[2]], c: [1, .62, .26], k: 0, r: .07, air: .3 },       /* and its soft halo */
    { p: [0, 5.5, 58], c: [.62, .58, 1.25], k: 3.2, r: 40 },                              /* the far end: a trace of violet in the fog */
    { p: [0, 9, 20], c: [.36, .33, .8], k: 40, r: 12 },                                 /* haze high in the vault */
    { p: [-1.2, 2.5, 14], c: [.36, .33, .8], k: 8, r: 5 },                            /* and low down the hall, so its walls show */
    { p: [0, 3, 1], c: [.3, .28, .66], k: 5, r: 4 },                                   /* the passage behind you, faint */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)')
    .replace('d = U(d, box(p, vec3(2.55, 1.22, 5.6), vec3(.35, .1, .38), M_CUT));', 'vec4 lg = box(p, vec3(2.57, 1.22, 5.6), vec3(.32, .07, .35), M_CUT); lg.x -= .03 + rough(p, .012, 7.); if (lg.x < .01) gTint = vec3(.72); d = U(d, lg);') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    if (p.y > 2.6) gTint *= mix(1., .45, smoothstep(2.6, 6., p.y));                    /* the vault falls away into the dark */
    if (p.y < .03) gTint *= mix(.7, 1., smoothstep(4., 9., p.z));                      /* the near floor, below the lamp's reach */
    /* a corbel under the ledge, so it grows from the wall */
    vec3 qc = p - vec3(2.7, 1.12, 5.6);
    float corb = max(max(abs(qc.z) - .2, -qc.x - .22 * clamp((qc.y + .3) / .3, 0., 1.)), max(qc.y, -qc.y - .3));
    d = U(d, vec4(corb - .01, M_CUT, NOUV));
    /* the clay lamp: a low round body with a sunken top, a spout drawn out toward the hall, the wick at its tip */
    vec3 q = p - vec3(2.47, 1.345, 5.6);
    float body = (length(q / vec3(.065, .03, .065)) - 1.) * .03;
    body = max(body, -(length(q - vec3(0, .045, 0)) - .042));                          /* the dished top */
    vec3 qn = p - vec3(2.38, 1.352, 5.6); qn.y -= .12 * max(2.38 - p.x, 0.);          /* the spout rises a little to its tip */
    float noz = (length(qn / vec3(.06, .014, .022)) - 1.) * .014;
    vec4 lamp = vec4(smin(body, noz, .018), M_ROCK, NOUV);
    if (lamp.x < .01) gTint = vec3(.8, .55, .4) * (.85 + .3 * fbm(p.xz * 80., 2));
    d = U(d, lamp);
    /* the flame: a small hot teardrop at the spout's tip; its glow is the lights' */
    vec3 qf = p - vec3(${F[0].toFixed(3)}, ${F[1].toFixed(3)}, ${F[2].toFixed(2)});
    float fr = .0045 * (1. - smoothstep(-.004, .02, qf.y)) + .0015;
    d = U(d, vec4(length(vec3(qf.x, max(abs(qf.y - .006) - .01, 0.), qf.z)) - fr, M_GLOW, NOUV));
    return d;
  }`,
  anchors: {
    flame: [{ p: [F[0], F[1] - .01, F[2]], size: .8 }],
    fog: [{ p: [0, 2.2, 30], w: 1.2, h: .3, a: .2 }, { p: [0, 1.2, 18], w: 1.3, h: .22, a: .12, speed: .6 }],
    beam: [{ p: [2.3, 1.9, 5.6], w: .06 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
