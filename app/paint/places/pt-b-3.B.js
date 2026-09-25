/* SEALED (D-015). pt-b-3.B, the head of the Stair. Beyond the lintel: a landing, and at its end the top flight
   going down, wide enough for three, every step knee-high, lit already by the Stair's own lamps below (set in
   hooded recesses in the right wall, their flames facing down the stair, so from above only their light shows).
   In the landing's left wall, a niche with a count; its lid, a small tablet (a carved doorway, a carved bar, two
   marks), stands leaned against the wall beneath it; inside, a second clay lamp, unlit, its glaze unchipped and
   new-looking. The light comes UP from below the landing's edge. Standing on the landing: the niche on the left,
   the stair's head dropping away on the right.
   The Stair's room (STAIR: the landing, the flight, the rail, the lamps' recesses, the first turn) is shared
   with pt-b-3.C. */

/* the nominal line of the treads' tops: the landing at 0, the flight down along +z from z 3 (riser .45, tread
   .6), the turn's landing at -2.7, six steps down */
export const STAIR = /* glsl */ `
  float stairLine(float z) { return -clamp((z - 3.) / .6 * .45, 0., 2.7); }
  float railY(float z) { return stairLine(z) + 1.25; }
  /* a hooded lamp recess in the right wall, open down the stair: its hood on the uphill side */
  vec4 lampRecess(vec3 p, float z0, float y0) {
    vec4 a = boxAir(p, vec3(1.86, y0 + .1, z0), vec3(.2, .28, .26), M_CUT_SMALL);
    return a;
  }
  vec4 stairScene(vec3 p) {
    float fa = stairLine(p.z) - .6;
    vec4 d = hallAir(vec3(p.x, p.y - fa, p.z), 1.7, 3.5, 1.7, 2.9, 10., M_CUT);
    d.x *= .78;
    d = A(d, hallAir(vec3(p.x + .8, p.y + .6, p.z), 2.5, 3.2, 2.5, -4., 3., M_CUT));      /* the landing: wider than the stair, on the left */
    /* the turn: an opening in the right wall, the next flight going on down out of sight */
    vec4 side = boxAir(p, vec3(4., -2.7 + .8, 8.3), vec3(2.4, 2.4, 1.1), M_CUT);
    d = A(d, side);
    d = A(d, lampRecess(p, 4.55, -.9));
    d = A(d, lampRecess(p, 5.75, -1.8));
    /* the landing, the flight, the turn's landing */
    vec4 land = box(p, vec3(-.8, -1., -.5), vec3(2.6, 1., 3.5), M_DRESSED);
    vec4 st = stairs(p, -1.8, 1.8, 3., 0., .6, .45, 6, M_DRESSED);
    vec4 tl = box(p, vec3(.9, -3.7, 8.3), vec3(2.7, 1., 1.72), M_DRESSED);
    vec4 fl = U(land, U(st, tl));
    fl.x -= .012;                                                                   /* the noses rounded by wear */
    fl.x += rough(p, .006, 9.);
    if (fl.x < d.x) {
      d = fl;
      float top = smoothstep(.04, .0, abs(p.y - (p.z < 3. ? 0. : p.z > 6.6 ? -2.7 : -.45 * (floor((p.z - 3.) / .6) + 1.))));
      gPolish = .35 * top * (1. - smoothstep(.8, 1.7, abs(p.x)));                   /* treads worn smooth down the middle */
    }
    /* the hoods over the lamps: a lip of the wall on each recess's uphill side */
    vec4 hd = U(box(p, vec3(1.8, -.9 + .12, 4.44), vec3(.14, .3, .15), M_CUT_SMALL), box(p, vec3(1.8, -1.8 + .12, 5.64), vec3(.14, .3, .15), M_CUT_SMALL));
    hd.x -= .02;
    if (hd.x < d.x) { d = hd; gTint = vec3(.55); }
    /* the rail, cut from the left wall: down the flight, round the turn's landing and along its far wall */
    float yr = railY(p.z);
    vec2 q1 = vec2(p.x + 1.64, p.y - yr);
    vec2 e1 = abs(q1) - vec2(.07, .055);
    float r1 = (length(max(e1, 0.)) + min(max(e1.x, e1.y), 0.) - .03) * .8;
    r1 = max(r1, max(3.1 - p.z, p.z - 10.));
    vec2 q2 = vec2(p.z - 9.94, p.y - (-2.7 + 1.25));
    vec2 e2 = abs(q2) - vec2(.07, .055);
    float r2 = max(length(max(e2, 0.)) + min(max(e2.x, e2.y), 0.) - .03, p.x - 1.1);
    float rail = min(r1, r2);
    if (rail < d.x + .02) {
      float k = clamp(.5 + .5 * (d.x - rail) / .05, 0., 1.);
      d.x = smin(d.x, rail, .05);
      if (k > .5) {
        d.yzw = vec3(M_DRESSED, NOUV);
        float ry = p.y - (p.z > 9.8 ? -1.45 : yr);
        gPolish = smoothstep(.0, .06, ry) * smoothstep(3.3, 4.5, p.z);                                          /* its top worn smooth by hands */
        gTint = vec3(1. + .3 * smoothstep(.02, .07, ry)) * mix(.45, 1., smoothstep(3.3, 4.5, p.z));
      }
    }
    return d;
  }
`;

const XN = -2.3, YN = 1.0;                                            /* the niche */
const W = [1, .7, .4], V = [.5, .47, 1.1];
export default {
  id: 'pt-b-3.B',
  name: 'The head of the Stair',
  line: '',
  cam: { x: -1.7, y: 1.55, z: 1.35, pitch: -15, yaw: 7, f: .6, cx: .5, cy: .5 },
  far: 40, fogK: 1 / 18, sheen: 0, gold: .7, expo: 2.0,
  hazeBase: [.02, .018, .055], hazeFar: [.06, .05, .13],
  bloomAt: [.3, -2.5, 8], bloomPow: 10, bloomC: [.14, .09, .06],
  glow: { threshold: .55, k: .6 },
  blur: { px: 1.4, d0: 4, d1: 14, k: .7 },
  lights: [
    { p: [.9, -.3, 4.3], c: W, k: 1.4, r: .9, reach: 5, shadow: .7 },                        /* the Stair's lamps below: their light coming up over the landing's edge */
    { p: [1.3, -1.4, 5.9], c: W, k: 1.2, r: 1, reach: 4, shadow: .5, air: .02 },              /* and further down */
    { p: [XN + .02, YN + .2, 2.95], c: [1, .8, .58], k: .05, r: .13, reach: .42, shadow: 1 },               /* the same light, from below the niche's sill: the glaze gives it back */
    { p: [0, 3.6, -3], c: V, k: 4, r: 3.5 },                                                  /* the place's own cold, from the lintel behind */
    { p: [-.5, 3.4, 3], c: [.36, .33, .8], k: 2.5, r: 2.5 },                                  /* and high in the vault */
  ],
  glsl: STAIR + /* glsl */ `
  const float XN = ${XN.toFixed(2)}, YN = ${YN.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = stairScene(p);
    gTint *= mix(1., .35, smoothstep(2.4, 4.6, p.y));                                          /* the vault into the dark: the words' band */
    if (p.y < .03 && p.z < 2.9 && abs(d.y - M_DRESSED) < .5) gTint *= mix(.3, 1., smoothstep(-.5, 2.8, p.z));   /* the near landing kept down */
    /* the niche: an arched recess in the landing's end wall, left of the stair's head, an arm deep */
    vec4 n = vec4(min(archOpening2(vec2(p.x - XN, p.y - YN), .27, .21), 3.42 - p.z), M_CUT_SMALL, NOUV);
    if (n.x > d.x) { d = n; gTint = vec3(mix(.9, .3, smoothstep(3.05, 3.4, p.z))); }
    /* the count on its head: a short row of strokes */
    if (p.z > 2.94 && p.z < 3.02 && abs(p.y - (YN + .62)) < .05 && abs(p.x - XN) < .2) {
      float k = floor((p.x - XN + .2) / .08), c = -.2 + (k + .5) * .08;
      d.x += engrave(length(vec2(p.x - XN - c, max(abs(p.y - YN - .62) - .03, 0.))), .009, .006);
    }
    /* the second clay lamp, unlit, on the niche's floor: a low round body, a dished top, the spout toward you */
    vec3 q = p - vec3(XN - .04, YN + .056, 3.2);
    float body = (length(q / vec3(.115, .055, .115)) - 1.) * .055;
    body = max(body, -(length(q - vec3(0, .075, 0)) - .066));                                   /* the dished top, a filling-hole in it */
    vec3 qn = p - vec3(XN + .09, YN + .068, 3.17); qn.y -= .2 * max(p.x - XN - .09, 0.);
    float noz = (length(qn / vec3(.1, .024, .036)) - 1.) * .024;                                 /* the spout, drawn out to the right, rising a little */
    vec3 qh = p - vec3(XN - .15, YN + .07, 3.2);
    float hand = length(vec2(length(qh.xy) - .035, qh.z)) - .011;                                /* a small ring handle behind */
    noz = min(noz, max(hand, XN - .12 - p.x));
    vec4 lamp = vec4(smin(body, noz, .025), M_ROCK, NOUV);
    if (lamp.x < d.x) {
      d = lamp;
      gTint = vec3(1.35, 1.12, .88) * (.95 + .1 * fbm(p.xz * 60., 2));                            /* its glaze: honey-coloured, whole, unchipped */
      gPolish = 1.; gSmooth = .15;
      if (length(p - vec3(XN + .19, YN + .09, 3.17)) < .016) gTint = vec3(.08);                    /* the wick, dark: never lit */
    }
    /* its lid: a small tablet leaned against the wall beneath, carved: a doorway, a bar, two marks */
    vec3 t = p - vec3(XN + .05, .3, 2.93);
    t.zy = vec2(t.z * .985 - t.y * .17, t.z * .17 + t.y * .985);
    vec4 tab = box(t, vec3(0), vec3(.22, .28, .025), M_DRESSED); tab.x -= .008;
    if (tab.x < d.x) {
      d = tab; gTint = vec3(.85);
      if (t.z < -.015) {
        vec2 u = t.xy;
        float door = abs(archOpening2(u - vec2(-.1, -.12), .055, .1));
        float bar = length(vec2(u.x - .03, max(abs(u.y + .02) - .09, 0.)));
        float m = min(length(vec2(u.x - .1, max(abs(u.y - .03) - .03, 0.))), length(vec2(u.x - .15, max(abs(u.y + .04) - .03, 0.))));
        d.x += engrave(min(min(door, bar), m), .007, .004);
      }
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [.3, -.2, 4.2], w: 1.4, h: .25, a: .2 }],
    glints: [{ p: [XN - .03, YN + .08, 3.12] }],
  },
  live: { fog: 'low', motes: 'gold', gold: true },
};
