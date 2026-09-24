/* Regression, not a place: the approved Lamp Hall (design/directions/d-combined/hall.js)
   rebuilt from the kit with the hall's own numbers, morning camera, gold .15.
   After any change to the kit, bake this and compare it with the hall: it must stay the hall. */
export default {
  id: 'regression-lamp-hall',
  name: 'The Lamp Hall',
  line: 'The kit painting the approved hall, to prove it is the same hand.',
  cam: { x: .2, y: 1.6, z: 1.5, pitch: 0, f: .62, cx: .5, cy: .47 },
  far: 66, fogK: 1 / 34,
  bloomAt: [0, 4.5, 66],
  lights: [
    { p: [0, 5.5, 58], c: [.62, .58, 1.25], k: 420, r: 36 },
    { p: [0, 9, 20], c: [.36, .33, .8], k: 26, r: 12 },
    { p: [0, 7, -4], c: [.3, .28, .66], k: 5, r: 7 },
    { p: [2.26, 1.54, 5.6], c: [1, .58, .24], k: 1.7, r: .975, warm: .074 },
    { p: [1.2, 2.6, 6.5], c: [.4, .37, .85], k: 3.2, r: 3.2 },
  ],
  glsl: /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    d = U(d, box(p, vec3(2.55, 1.22, 5.6), vec3(.35, .1, .38), M_CUT));         /* the lamp's ledge */
    d = U(d, box(p, vec3(-2.69, 2.825, 7.3), vec3(.29, .425, 1.3), M_DRESSED));  /* the lintel */
    return d;
  }`,
  anchors: { flame: [{ p: [2.4, 1.4, 5.6], size: 1, body: true }] },
};
