/* SEALED (D-015). pt-pl-w1-below-the-lamp, round 9 (from round 7's close composition): kneeling under the lamp's
   ledge on the hall's right wall, under a metre from it. The ledge's underside is a dark band across the top; the
   lamp above it, out of frame, lays a thin gold light along the wall's foot and a little into the recess. A small
   low recess at knee height, a row of cut strokes over it; round its mouth, weighted to the sill where hands
   reached in, the stone is darkened as if by oil: a dull sheen on the sill, faint at the top and sides, like a
   shadow that stays. The hall's violet from behind on the left keeps the stone cold. DARK state (cups unlit). */
export default {
  id: 'pt-pl-w1-below-the-lamp',
  name: 'Below the lamp',
  line: '',
  cam: { x: 1.98, y: .45, z: 5.47, pitch: 9, yaw: 80, f: .75, cx: .5, cy: .47 },
  far: 30, fogK: 1 / 26,
  hazeBase: [.012, .011, .034], hazeFar: [.06, .055, .16],
  bloomAt: [2.5, .05, 5.6], bloomPow: 6, bloomC: [.08, .06, .03],
  bloom: { alpha: .1 },
  glow: { threshold: .6, k: .7 },
  blur: { px: 1, d0: 1.6, d1: 4, k: .6 },
  gold: 1, sheen: 0, grain: .3, shadowJitter: 1, amb: .5, ambC: [.85, .78, 1.5], expo: 1.7,
  lights: [
    { p: [2.12, 1.42, 5.6], c: [1, .72, .36], k: .5, r: .5, shadow: 1, reach: 1.1 },           /* the clay lamp on the ledge, above and out of frame */
    { p: [2.6, .06, 5.62], c: [1, .72, .36], k: .022, r: .15, reach: .22 },            /* its gold, lying on the floor at the wall's foot */                     /* its light on the floor at the wall's foot, glowing back up */
    { p: [2.78, .5, 5.6], c: [1, .74, .42], k: .012, r: .15, reach: .25 },         /* a little of it into the recess, on its floor and back */
    { p: [.6, 2.6, 2.4], c: [.4, .37, .85], k: 8, r: 3.6, shadow: .6 },            /* the hall's violet, from behind on the left */
    { p: [2.05, .85, 5.1], c: [.42, .39, .85], k: .7, r: .55 },                  /* the same, on the stone round the ring */
    { p: [2.3, .12, 5.5], c: [.55, .5, .95], k: .05, r: .2, reach: .6 },        /* and given back by the oil on the sill */
  ],
  glsl: /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2.7, 6., 12.47, -10., 66., M_CUT);
    d.z += 1.1; d.w += .55;                                                                    /* the wall's courses laid so no joint runs up the middle of the view */
    if (p.y < .03) gTint = vec3(mix(.14, .35, smoothstep(2.3, 2.68, p.x)));      /* the near floor, out of the lamp's reach */
    else if (p.x > 2.6) gTint *= mix(1., .6, smoothstep(.03, .1, p.y) * smoothstep(.3, .15, p.y));   /* the wall's foot in the ledge's shadow, but for a line of gold at the floor */
    if (p.x > 2.6) gTint *= 1. - .75 * smoothstep(.8, 1.1, p.y);                   /* beside and above the ledge: one dark band */
    vec3 q = p - vec3(2.7, .33, 5.6); vec2 m = vec2(q.z, q.y);
    /* the recess: a flat sill, a round head, a hand deep; hand-cut, its lip worn round, no two sides alike */
    float wob = (fbm(m * 9., 3) - .5) * .028;
    float op = archOpening2(vec2(q.z * (1. + .12 * q.y), q.y), .15 + wob, .07) + wob * .5;
    float sd = -op;
    if (q.x > -.06) {
      /* the oil: faint at the top and sides, heaviest along the sill, fading out wide with no clean edge */
      float nz = (fbm(m * 3. + 2., 4) - .5) * .14;
      float ring = 1. - smoothstep(.0, .22, sd + nz);
      ring *= mix(.3, 1., smoothstep(.2, .0, m.y));
      gStain = ring; gTint *= mix(1., .4, ring); gPolish = .25 * ring * smoothstep(.06, -.02, m.y);   /* flat dark stain; a dull oily sheen on the sill */
      /* a row of cut strokes over it: shallow cuts, darker in their floors */
      float k = floor((q.z + .125) / .05), sz = q.z + .125 - (k + .5) * .05 + (h2(vec2(k, 3.)) - .5) * .022;
      float tilt = (h2(vec2(k, 8.)) - .5) * .5, yc = .33 + .018 * (h2(vec2(k, 1.)) - .5);
      float side = sz + (q.y - yc) * tilt, ln = length(vec2(side, max(abs(q.y - yc) - .018 - .016 * h2(vec2(k, 4.)), 0.)));
      if (k >= 0. && k < 5.) { d.x += .005 * max(0., 1. - ln / .009); gTint *= mix(1., .3, smoothstep(.007, .0, ln)); gPolish *= smoothstep(.0, .01, ln); }
    }
    float dep = .2 - q.x;
    float air = min(op, dep);
    d.x = -smin(-d.x, -air, .006);                                                  /* the lip: a plain cut edge, no collar */
    if (q.x > -.02 && op > -.02) {
      float inn = smoothstep(-.02, .03, q.x);
      gTint *= mix(1., .12, inn); gStain = mix(gStain, .75, (1. - inn) * smoothstep(.12, 0., q.y + .02));   /* the oil runs over the sill and a little in */
      if (q.x > .03) { gPolish = 0.; gStain = 0.; d.yzw = vec3(M_ROCK, NOUV); }    /* inside: rough, lit only by what comes in */
    }
    vec4 lg = box(p, vec3(2.55, 1.22, 5.6), vec3(.31, .06, .6), M_CUT);            /* the lamp's ledge, its arrises worn round and uneven */
    lg.x -= .04 + rough(p, .01, 6.);
    if (lg.x < .01) gTint = vec3(p.y < 1.14 ? .12 : .6);                            /* dark: its underside only the floor's glow on it */
    d = U(d, lg);
    return d;
  }`,
  anchors: {
    beam: [{ p: [2.55, .9, 5.45], w: .1 }, { p: [2.6, .03, 5.6], w: .15 }],
  },
  live: { motes: 'gold', gold: true },
};
