/* SEALED (D-015). pt-b-7.B, the crew's wall, again (THE SQUARE GALLERY, built here: a straight gallery a tall
   man's height, flat ceiling, flat walls of square-set blocks covered in small even chisel marks, darker than the
   round stone, no cups). On the right wall, below a record in the tally's hand, a row of rings: twelve the same,
   and at the row's end a thirteenth, smaller. Beneath, in its niche, opened, a wax tablet gone hard, amber-grey,
   ruled and marked. The one light is the round side's (warm, low, from the gallery's mouth behind you on the
   left), raking along the wall so every cut shows its shadow; it catches the row's end first. Close on the rings
   and the niche; VP down the gallery. */
const ZR = 2.75;                                                      /* where the row of rings starts; it runs back toward you */
const SP = .115;                                                      /* ring spacing */
const Z13 = ZR - 12 * SP;                                             /* the thirteenth */
const XW = 1.1;                                                       /* the right wall's face */
const WARM = [1, .74, .44];
export const SQUARE = /* glsl */ `
  /* square-cut stone: square-set blocks, sharp joints, the chisel's small even strokes. w: the face's own coords */
  float squareFace(vec2 w, out float tone) {
    vec2 b = w / vec2(.46, .34); b.x += .5 * mod(floor(b.y), 2.);
    vec2 f = fract(b) - .5, id = floor(b);
    float jn = min(.5 - abs(f.x), .5 - abs(f.y));
    float ch = sin((w.x * .6 + w.y) * 90. + h2(id) * 6.) * .5 + .5;
    tone = .85 + .3 * h2(id + 7.);
    return engrave(jn, .03, .012) + .0012 * ch * (.6 + .4 * h2(id + 3.));
  }
`;
export default {
  id: 'pt-b-7.B',
  name: 'The crew\'s wall, again',
  line: '',
  cam: { x: .2, y: 1.3, z: Z13 - .45, pitch: -5, yaw: 52, f: .66, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 18,
  hazeBase: [.012, .011, .034], hazeFar: [.06, .05, .14],
  bloomAt: [0, 1.2, 20], bloomPow: 30, bloomC: [.1, .09, .2],
  bloom: { alpha: .14 },
  glow: { threshold: .62, k: .5 },
  blur: { px: 1.4, d0: 2.5, d1: 9, k: .75 },
  gold: 1, sheen: 0, grain: .4, shadowJitter: 1, amb: 1.1, ambC: [.8, .76, 2.1], expo: 1.8,
  lights: [
    { p: [-.6, .95, Z13 - 2.4], c: WARM, k: 2, r: 1.1, shadow: .8, reach: 7 },            /* the round side's light, low, from the gallery's mouth */
    { p: [XW - .16, 1.24, Z13 + .01], c: WARM, k: .03, r: .12, shadow: 1, reach: .32 },       /* its first catch, at the row's end */
    { p: [0, 1.9, 9], c: [.42, .39, .92], k: 3, r: 3, shadow: .4 },                          /* cold far down the gallery */
    { p: [-.8, 1.8, Z13 + .5], c: [.36, .33, .8], k: .8, r: 1.5 },                          /* cold fill */
  ],
  glsl: SQUARE + /* glsl */ `
  const float ZR = ${ZR.toFixed(3)}, SP = ${SP.toFixed(3)}, Z13 = ${Z13.toFixed(3)}, XW = ${XW.toFixed(2)};
  /* a record above: marks in a row, the tally's hand */
  float rec(vec2 w) {
    float cell = .075, k = floor(w.x / cell), fx = w.x - (k + .5) * cell, y = w.y;
    if (k < 0. || k > 17.) return 1.;
    float bar = length(vec2(fx, max(abs(y) - .03, 0.)));
    float kind = h2(vec2(k, 17.));
    if (kind > .65) return min(bar, length(vec2(fx - .013 - (y - .015) * .9, max(abs(y - .015) - .01, 0.))));
    if (kind < .18) return abs(length(vec2(fx, y)) - .018);
    if (kind < .3) return length(vec2(fx, max(abs(y + .01) - .018 * (1. - (y + .028) / .056), 0.)));
    return bar;
  }
  vec4 scene(vec3 p) {
    vec4 d = boxAir(p, vec3(0., 1.05, 8.), vec3(XW, 1.05, 12.), M_CUT);
    /* the niche under the rings, opened */
    vec4 ni = boxAir(p, vec3(XW + .14, .82, Z13 + .55), vec3(.15, .13, .24), M_ROCK);
    d = A(d, ni);
    float tone = 1.;
    bool wallR = p.x > XW - .02 && ni.x < -.005;
    if (p.y > .02 && p.y < 2.08 && abs(p.x) > XW - .02) d.x += squareFace(vec2(p.z, p.y), tone);
    else if (p.y >= 2.08) d.x += squareFace(vec2(p.x + 3., p.z), tone);
    gTint = vec3(.62, .6, .66) * tone;                                                       /* the square stone: darker */
    if (wallR) {
      /* the rings: twelve alike, then a thirteenth, smaller */
      float k = floor((ZR + SP * .5 - p.z) / SP);
      if (k >= 0. && k <= 12.) {
        float zc = ZR - k * SP, r = k > 11.5 ? .027 : .045;
        float rr = abs(length(vec2(p.z - zc, p.y - 1.19)) - r);
        d.x += engrave(rr, k > 11.5 ? .0085 : .01, .011);
      }
      /* the record above them */
      d.x += engrave(rec(vec2(ZR + .1 - p.z, p.y - 1.53)), .007, .009);
    }
    /* the wax tablet, leaning against the niche's back: hard wax, amber-grey, ruled, marked */
    vec3 q = p - vec3(XW + .22, .82, Z13 + .55);
    q.xy = mat2(.94, -.34, .34, .94) * q.xy;
    vec4 tb = box(q, vec3(0.), vec3(.012, .1, .15), M_SLATE); tb.x -= .004;
    if (tb.x < d.x) {
      d = tb; gTint = vec3(1.25, 1.02, .78); gPolish = .2;
      if (q.x < -.008) {
        float row = abs(fract((q.y + .1) / .05) - .5) * .05;
        d.x += engrave(row, .002, .002);
        vec2 mq = vec2(q.z + .15, q.y + .1);
        float mk = floor(mq.x / .03), fx = mq.x - (mk + .5) * .03, ry = fract(mq.y / .05) * .05 - .025;
        if (mk > 0. && mk < 9.) d.x += engrave(length(vec2(fx + ry * (h2(vec2(mk, floor(mq.y / .05))) - .5), max(abs(ry) - .012, 0.))), .003, .003);
      }
    }
    if (floor(d.y + .5) == M_ROCK) gTint *= .6;                                               /* inside the niche, in shadow */
    if (p.y < .03) gTint *= mix(.35, 1., smoothstep(Z13, Z13 + 6., p.z));                        /* the floor, kept down */
    if (p.y > 2.06) gTint *= .45;                                                                /* the flat ceiling, dark */
    if (p.x < -XW + .03) gTint *= .6;                                                            /* the far wall, quiet */
    return d;
  }`,
  anchors: {
    fog: [{ p: [.95, .35, Z13 + .6], w: 1.2, h: .15, a: .1 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true },
};
