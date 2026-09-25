/* SEALED (D-015). pt-cv-03, camp view: the hall, from the passage (the Lamp Hall, pt-b-1.A, reused; DARK state,
   cups unlit). Just inside, standing at the passage mouth: the lamp on its ledge near on the right, its flame
   still; past it the hall goes away into the dark, its far end only a trace of violet in the fog. One small warm
   light against a long dark. Quieter than the places: one form, one light. */
import hall from './pt-b-1.A.js';

export default {
  ...hall,
  id: 'pt-cv-03',
  name: 'The hall, from the passage',
  line: '',
  cam: { x: .9, y: 1.52, z: 3.3, pitch: -1, yaw: 9, f: .62, cx: .5, cy: .47 },
  sheen: .1, gold: 1, glow: { threshold: .55, k: .5 },
  hazeBase: [.02, .018, .06], hazeFar: [.09, .085, .22], bloomC: [.2, .18, .38],
  lights: [
    { p: [2.36, 1.6, 5.6], c: [1, .68, .3], k: 1.7, r: 1.1, warm: .02, shadow: .7 },    /* the clay lamp on its ledge: the one light */
    { p: [2.46, 1.36, 5.6], c: [1, .7, .34], k: .05, r: .12 },                         /* and pooled on the ledge under it */
    { p: [0, 5.5, 58], c: [.62, .58, 1.25], k: 45, r: 40 },                            /* the far end: a trace of violet in the fog */
    { p: [0, 9, 20], c: [.36, .33, .8], k: 12, r: 12 },                                  /* haze high in the vault */
    { p: [0, 7, -4], c: [.3, .28, .66], k: 3, r: 7 },                                   /* the passage behind you, faint */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    if (p.y > 2.6) gTint *= mix(1., .45, smoothstep(2.6, 6., p.y));                    /* the vault falls away into the dark */
    if (p.y < .03) gTint *= mix(.8, 1., smoothstep(4., 9., p.z));                      /* the near floor, below the lamp's reach */
    /* the clay lamp: a low round body, a pinched nozzle toward the hall, and its flame, still */
    vec3 q = p - vec3(2.45, 1.352, 5.6);
    float body = (length(q / vec3(.062, .032, .072)) - 1.) * .032;
    vec3 qn = p - vec3(2.37, 1.365, 5.6);
    float noz = (length(qn / vec3(.045, .014, .018)) - 1.) * .014;
    vec4 lamp = vec4(smin(body, noz, .012), M_ROCK, NOUV);
    if (lamp.x < .01) gTint = vec3(.62, .5, .44) * (.9 + .2 * fbm(p.xz * 60., 2));
    d = U(d, lamp);
    vec3 qf = p - vec3(2.34, 1.412, 5.6); qf.x += .006 * smoothstep(-.02, .03, qf.y);
    d = U(d, vec4((length(qf / vec3(.012, .032, .012)) - 1.) * .012, M_GLOW, NOUV));
    return d;
  }`,
  anchors: {
    flame: [{ p: [2.34, 1.39, 5.6], size: 1 }],
    fog: [{ p: [0, 2.2, 30], w: 1.2, h: .3, a: .2 }, { p: [0, 1.2, 18], w: 1.3, h: .22, a: .12, speed: .6 }],
    beam: [{ p: [2.3, 1.9, 5.6], w: .06 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
