/* SEALED (D-015). pt-pl-w1-below-the-lamp, round 8 (room scale, D-075): the Lamp Hall (pt-b-1.A, reused), seen
   kneeling a stride out from the right wall, just short of the lamp's ledge. The ledge crosses the top of the frame,
   its underside dark; the lamp on it is above and out of frame, and its gold falls past the ledge's lip onto the
   floor and lies in a thin line along the wall's foot. Under the ledge, at knee height, a small recess with a row
   of cut strokes over it; round its mouth, heaviest at the sill where hands reached in, the stone is darkened as
   if by oil, a shadow that does not move. The hall goes on to the left into its violet. DARK state (cups unlit). */
import hall from './pt-b-1.A.js';

export default {
  ...hall,
  id: 'pt-pl-w1-below-the-lamp',
  name: 'Below the lamp',
  line: '',
  cam: { x: 1.45, y: .5, z: 4.7, pitch: -18, yaw: 54, f: .9, cx: .5, cy: .5 },
  far: 66,
  blur: { px: 1.4, d0: 3, d1: 14, k: .8 },
  gold: 1, grain: .8, shadowJitter: 1, amb: .6,
  lights: [
    hall.lights[0], hall.lights[2], hall.lights[3],                                     /* the far glow, the vault's haze, the fill from behind */
    { p: [2.27, 1.4, 5.62], c: [1, .68, .3], k: 1.2, r: .6, warm: .02, shadow: 1 },       /* the clay lamp on its ledge, out of frame above */
    { p: [2.62, .03, 5.45], c: [1, .7, .34], k: .07, r: .22 },                          /* its gold, a thin line on the floor at the wall's foot */
    { p: [2.62, .03, 5.95], c: [1, .7, .34], k: .05, r: .2 },
    { p: [2.3, .5, 5.2], c: [.6, .55, .98], k: .35, r: .35 },                            /* the hall's violet on the wall under the ledge */
    { p: [2.82, .36, 5.62], c: [1, .72, .38], k: .05, r: .1 },                        /* a trace of the gold inside the recess, on its floor */
  ],
  glsl: /* glsl */ `
  /* the lamp's ledge, as the hall's but seen close: its arrises worn round and uneven, its underside dark */
  vec4 ledge(vec3 p) {
    vec4 l = box(p, vec3(2.57, 1.22, 5.6), vec3(.31, .075, .34), M_CUT);
    l.x -= .025 + rough(p, .006, 9.);
    if (l.x < .01) gTint = vec3(mix(.12, .45, smoothstep(1.16, 1.26, p.y)));
    return l;
  }` + hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)')
    .replace('d = U(d, box(p, vec3(2.55, 1.22, 5.6), vec3(.35, .1, .38), M_CUT));', 'd = U(d, ledge(p));') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    vec3 q = p - vec3(2.7, .3, 5.6); vec2 m = vec2(q.z, q.y);
    if (p.x > 2.4 && length(vec2(p.z - 5.6, p.y - .6)) < 1.3) d.x -= rings(p);        /* no rings of the hall's cut round the recess */
    if (p.x > 1.8) {
      /* the recess: low and a little wider than high, hand-cut, its corners worn round */
      vec2 mc = (m - vec2(.01, .13)) / vec2(.15, .105);
      float sd = (length(mc) - 1.) * .105 + (fbm(m * 11., 3) - .5) * .03 + .01 * sin(atan(mc.y, mc.x) * 3. + 1.);
      if (q.x > -.06 && sd > -.02) {
        /* the oil: faint at the top and sides, heaviest along the sill; it runs a little way in, and fades out wide */
        float nz = (fbm(m * 3. + 2., 4) - .5) * .12;
        float ring = smoothstep(-.03, -.008, sd) * (1. - smoothstep(.05, .3, sd + nz));
        ring *= mix(.25, 1., smoothstep(.2, -.02, m.y));
        gStain = max(gStain, .85 * ring); gPolish = .5 * ring * smoothstep(.02, .06, sd);   /* the dull sheen out on the face, not on the lip */
        /* a row of cut strokes over it, V-cut */
        float k = floor((q.z + .125) / .05), sz = q.z + .125 - (k + .5) * .05 + (h2(vec2(k, 3.)) - .5) * .022;
        float tilt = (h2(vec2(k, 8.)) - .5) * .5, yc = .34 + .018 * (h2(vec2(k, 1.)) - .5);
        float side = sz + (q.y - yc) * tilt, ln = length(vec2(side, max(abs(q.y - yc) - .016 - .016 * h2(vec2(k, 4.)), 0.)));
        if (k >= 0. && k < 5.) { d.x += .01 * max(0., 1. - ln / (side > 0. ? .011 : .004)); if (ln < .005) gTint *= .6; }
      }
      d = A(d, vec4(min(-sd, .45 - q.x), M_CUT_SMALL, NOUV));
      if (q.x > -.015 && sd < .01) { gTint = vec3(mix(.55, .3, smoothstep(.0, .3, q.x))); d.yzw = vec3(M_ROCK, NOUV); }   /* inside: rough, a hand's depth of dark */
      if (p.x > 2.6 && p.y > .9 && p.y < 1.12 && abs(p.z - 5.6) < .6) gTint *= mix(1., .55, smoothstep(.9, 1.1, p.y));
    }
    if (p.y > .6 && p.x > 2.) gTint *= mix(1., .5, smoothstep(.6, 1.2, p.y));          /* the wall under the ledge: only the floor's glow reaches it */
    if (p.y < .03) gTint *= mix(.25, .8, smoothstep(1.6, 2.6, p.x) * (1. - smoothstep(6.2, 8., p.z)));                    /* the near floor, out of the lamp's reach */                     /* the wall above the ledge falls into the dark */
    return d;
  }`,
  anchors: {
    beam: [{ p: [2.3, .75, 5.45], w: .1 }],
    fog: [{ p: [2.3, .2, 5.8], w: .6, h: .12, a: .1 }],
  },
  live: { motes: 'gold', gold: true, fog: 'far' },
};
