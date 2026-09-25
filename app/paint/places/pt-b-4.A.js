/* SEALED (D-015). pt-b-4.A, the sheet dated Day 9 (the Salt Gallery of pt-b-2.A, reused, in the cups' light):
   the tally band runs on past the lone ring and the split, and dives under a crust of salt, thicker and whiter
   than the face round it, grown over the band; set in the crust, a count, its strokes cut into the salt itself.
   Just before the crust, her Day 9 sheet, pencil on paper, held flat against the wall, one corner lifting.
   The light is the cups' glow, warm, from the gallery's near end behind you. Close along the wall; VP down it.
   Writing that goes under salt. */
import room from './pt-b-2.A.js';

const ZC = 12.4;                                                    /* where the crust is */
const W = [1, .84, .66], V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-b-4.A',
  name: 'The sheet dated Day 9',
  line: '',
  cam: { x: -1.1, y: 1.5, z: ZC - 1.1, pitch: -6, yaw: -35, f: .64, cx: .5, cy: .5 },
  salt: { pink: .3 },
  expo: 1.9, grade: [1, 1, 1], bloomC: [.14, .12, .26], bloomPow: 10,
  blur: { px: 1.6, d0: 3.5, d1: 14, k: .8 },
  lights: [
    { p: [.3, 1.9, ZC - 4.2], c: W, k: 2.1, r: 1.5, shadow: .6 },                          /* the cups' glow, from the gallery's near end behind you */
    { p: [-1.42, 1.52, ZC + .12], c: W, k: .07, r: .22, reach: .8, shadow: 1 },             /* its last reach, raking along the crust: every stroke of the count shows */
    { p: [.4, 1.6, 34], c: V, k: 10, r: 9 },                                                 /* the gallery going on in its own violet */
    { p: [.8, 1.9, ZC + 4], c: V, k: 4, r: 3.5 },
    { p: [0, 1.6, ZC - 9], c: [.3, .28, .66], k: .6, r: 3 },                                 /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZC = ${ZC.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (floor(d.y + .5) == M_DRESSED) gTint *= .6;                                          /* the band kept down to the salt's value */
    gTint *= mix(1., .3, smoothstep(1.9, 2.8, p.y));                                        /* the salt going up out of the light: the words' band */
    if (p.x < -1.5) gTint *= .85 + .25 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds */
    if (p.y < .05) gTint *= mix(.25, .8, smoothstep(ZC - 2., ZC + 5., p.z));                /* the near floor kept down */
    if (p.y < .8 && p.x < -1.5) gTint *= mix(.45, 1., smoothstep(.1, .8, p.y));            /* and the wall's foot */
    /* the crust: salt grown thick and white over the wall and the band, lumpy at its edges, smoother on its face */
    vec2 cq = vec2((p.z - ZC - .35) / 1.25, (p.y - 1.3) / .6);
    float t = .27 * (1. - dot(cq, cq)) + (fbm(vec2(p.z * 2.5, p.y * 2.5), 3) - .5) * .09;
    float sm = smoothstep(.12, .35, length(vec2(p.z - ZC - .24, (p.y - 1.4) * 1.5)));          /* its face smoother where the count is cut */
    float edge = 1. - smoothstep(.0, .09, t);                                                   /* near its edge the crust is thin, broken, crystalline */
    float cr = (p.x - (-2.03 + max(t, -.3))) * .6 + rough(p, .01, 9.) * (.3 + .7 * sm) + rough(p, .004, 30.) * sm + rough(p, .012, 22.) * edge;
    if (cr < d.x + .03) {
      float k = clamp(.5 + .5 * (d.x - cr) / .03, 0., 1.);
      d.x = smin(d.x, cr, .03);
      if (k > .5) {
        d.yzw = vec3(M_SALT, NOUV);
        gTint = vec3(1.02 + .12 * edge) * (.92 + .1 * fbm(p.zy * 9., 3));                                  /* thicker, whiter */
        /* the count set in it: a row of strokes cut into the salt, clean, one depth */
        vec2 w = vec2(p.z - (ZC + .06), p.y - 1.4);
        float kk = floor(w.x / .08), cx = (kk + .5) * .08 + (h2(vec2(kk, 3.)) - .5) * .008;
        float st = length(vec2(w.x - cx, max(abs(w.y) - .085, 0.)));
        if (kk >= 0. && kk < 5.) {
          d.x += engrave(st, .016, .02);
          if (st < .01) gTint *= .55;                                                       /* the cut's floor a shade darker than the fresh crust */
        }
      }
    }
    /* the tally band dives under it: the band's cuts stop at the crust's edge (the crust is over them) */
    /* her Day 9 sheet: paper, held flat to the wall just before the crust, one corner lifting */
    vec3 s = p - vec3(-1.87, 1.76, ZC - .75);
    s.x -= .06 * smoothstep(-.05, .15, s.z) * smoothstep(-.02, .15, s.y);                   /* its top corner lifting off the wall */
    vec4 sh = box(s, vec3(0), vec3(.004, .15, .105), M_PAPER); sh.x -= .002;
    if (sh.x < d.x) {
      d = sh;
      gTint = vec3(.5, .48, .46);                                                            /* in the crust's shadow: paper, kept under the salt's white */
      vec2 g = s.zy;
      float ln = abs(fract(g.y * 22.) - .5);
      if (abs(g.x) < .08 && abs(g.y) < .12 && ln < .07 && h2(floor(vec2(g.x * 30., g.y * 22.))) > .35) gTint *= .7;   /* pencil lines */
    }
    return d;
  }`,
  anchors: {
    glints: [[-1.8, 1.05, ZC - .3], [-1.78, 1.75, ZC + .9], [-1.72, 1.55, ZC + .3], [-1.75, 1.1, ZC + .8], [-1.8, 1.7, ZC + 1.1], [-1.95, 1.9, ZC + 2.2], [-1.9, .9, ZC - .6]].map(p => ({ p })),
    fog: [{ p: [-1.3, .2, ZC + 1.8], w: 1.4, h: .18, a: .14 }],
  },
  live: { motes: 'gold', fog: 'low' },
};
