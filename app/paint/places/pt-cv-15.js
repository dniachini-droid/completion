/* SEALED (D-015). pt-cv-15, camp view: the join. Close against the wall where the Stair's round stone meets the
   square stone, looking up along the join: on the left the round wall curving away, its courses eased and worn; on
   the right the square stone, flat, darker, covered in small even chisel marks; between them the seam, keyed in
   square steps, running up the frame into the dark. Poured into the joint above head height, a sliver of lead, dull
   grey, catching the warm light from the round side: the look-at. */

const L = [2.28, 2.97];                                                  /* (the seam's run at x = +.045 spans 2.25 .. 3.0) */                                                  /* the lead, between these heights */

export default {
  id: 'pt-cv-15',
  name: 'The join',
  line: '',
  cam: { x: -.4, y: 1.5, z: -.6, pitch: 57, yaw: 16, f: .66, cx: .5, cy: .5 },
  far: 14, fogK: 1 / 12, sheen: 0, gold: 1, expo: 2.1, amb: .9, ambC: [.8, .76, 1.8], grain: .5, shadowJitter: 1,
  hazeBase: [.012, .011, .035], hazeFar: [.03, .026, .07],
  bloomAt: [0, 7, 0], bloomPow: 20, bloomC: [.03, .025, .05],
  glow: { threshold: .6, k: .5 },
  blur: { px: 1.4, d0: 2.2, d1: 6, k: .8 },
  lights: [
    { p: [-1.6, 1.1, -1.3], c: [1, .68, .34], k: 1.1, r: .9, shadow: .8 },                             /* the round side's light (the Stair's lamps), warm, low on the left */
    { p: [-.3, (L[0] + L[1]) / 2 - .35, -.42], c: [1, .76, .48], k: .05, r: .25, reach: .9 },   /* and on the stone round the lead */
    { p: [1.5, 2.5, -1.5], c: [.32, .29, .7], k: 1.2, r: 1.5 },                                        /* violet on the square side */
    { p: [0, 5, -1.2], c: [.3, .27, .65], k: 1.5, r: 2 },                                              /* and high up the join, fading */
  ],
  glsl: /* glsl */ `
  const float L0 = ${L[0].toFixed(2)}, L1 = ${L[1].toFixed(2)};
  float seamX(float y) { return fract((y - .75) / 1.5) < .5 ? .045 : -.045; }                  /* the square stone keyed into the round in steps */
  vec4 scene(vec3 p) {
    float sx = seamX(p.y);
    float zr = -p.x * p.x / 4.2;                                                          /* the round wall curves toward you, to the left */
    bool isRound = p.x < sx;
    float wz = isRound ? zr : -.004;                                                        /* the square face, near flush */
    vec4 d = vec4((wz - p.z) * .9, isRound ? M_CUT : M_CUT_SMALL, isRound ? vec2(p.x * 1.1, p.y) : NOUV);
    d = A(d, vec4(-(p.z + 3.), M_CUT, NOUV));
    d = U(d, vec4(p.y, M_FLOOR, NOUV));
    d.x = min(d.x, 6.5 - p.y);
    /* the joint: a narrow gap along the stepped seam */
    float jd = abs(p.x - sx);
    float fy = fract(p.y / .75), step_ = min(fy, 1. - fy) * .75;   /* (every .75: the steps' runs) */                        /* the horizontal runs of the steps */
    float jj = min(jd, abs(p.x) < .05 ? step_ : 1.);
    float gapW = .006;
    bool lead = p.y > L0 && p.y < L1 && p.x > 0.;
    /* the joint open, a narrow dark gap; where the lead was poured it fills the joint's full width, flush, flat-faced */
    if (!lead) d.x += .018 * (1. - smoothstep(gapW * .5, gapW, jj));
    else if (jd < .012 && d.x < .01) { d.y = M_TIN; gTint = vec3(.72, .74, .84) * (.9 + .15 * fbm(p.xy * 90., 2));
      float pk = length(vec2((p.x - .045) / .007, (p.y - 2.72) / .05)); gTint *= 1. + 14. * (1. - smoothstep(.3, 1., pk)); gSmooth = .3; }   /* one small pick of sheen along the metal */
    if (!isRound && d.x < .02 && p.z > -.1) {
      gTint *= vec3(.62, .6, .66);                                                       /* square stone, darker, smoke-dulled */
      d.x += .0015 * sin(p.y * 160. + p.x * 60.) * smoothstep(.2, .6, fbm(p.xy * 6., 2));  /* small even chisel marks */
    }
    if (p.y > 3.3) gTint *= mix(1., .3, smoothstep(3.3, 5.5, p.y));                      /* up into the dark */
    if (p.y < .02) gTint *= .5;
    if (p.y < 2.1) gTint *= mix(.4, 1., smoothstep(.9, 2.1, p.y));                        /* the wall low down, kept back */
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.3, 1.8, -.4], w: .3 }],
    glints: [{ p: [.045, (L[0] + L[1]) / 2, -.01] }],
  },
  live: { motes: 'gold', gold: true },
};
