/* SEALED (D-015). pt-b-6.A, the side passage, round 1 (room scale, D-075). Also builds the week-6 room,
   the square-cut stone, once (squareRoom below), for the other week-6 places to import.
   The room: the landing's round stone (a round-vaulted end, z < .2, its lamps behind) with a low square
   doorway cut through its end wall into the square gallery, a straight passage a tall man's height, 2 m wide,
   flat-ceilinged, running on along +z. Its stone is darker, flat-faced, covered in small even chisel strokes,
   cracked, with no cups and no courses. Where square meets round (z ≈ JZ) the two are keyed into each other
   in teeth, course by course, like the fingers of two clasped hands; the square stone stands a finger proud,
   so every tooth's end catches the round side's light. Far down, the floor goes under a slope of broken stone.
   This place: at the join, eye height, looking down the square gallery; the clasp on the left jamb, lit warm
   from the landing's lamps behind; the record in the tally's hand on the square wall just past it. */
export const JZ = 1.6;                                              /* where the clasp runs across the passage */
export const W = 1.0, HT = 1.95, ZEND = 24, RZ = 15;                /* half width, height, far end, where the slope starts */

/* the room's GLSL: defines vec4 roomScene(vec3 p) and helpers; cam fades the chisel strokes with distance */
export function squareRoom(cam) {
  return /* glsl */ `
  const float JZ = ${JZ.toFixed(2)}, WW = ${W.toFixed(2)}, HT = ${HT.toFixed(2)}, RZ = ${RZ.toFixed(2)};
  const vec3 CAMP = vec3(${cam.x.toFixed(3)}, ${cam.y.toFixed(3)}, ${cam.z.toFixed(3)});
  /* the clasp: which stone a point of the passage's skin belongs to (1: square, 0: round) */
  float seamZ(vec3 p) {
    float t = abs(p.x) > WW - .05 ? floor(p.y / .33) : floor((p.x + WW) / .4) + 1.;   /* walls: by course; roof and floor: across */
    float s = mod(t, 2.) < 1. ? .2 : -.2;
    return JZ + s + (h2(vec2(t, 3.)) - .5) * .06;
  }
  /* small even chisel strokes, row on row, each a short dent at its own slant, a few missing */
  float chisel(vec2 w) {
    vec2 c = vec2(.032, .024), k = floor(w / c);
    w.x += h2(vec2(k.y, 5.)) * c.x; k = floor(w / c);                    /* each row set off from the last */
    vec2 f = w - (k + .5) * c;
    if (h2(k + 17.) < .25) return 0.;
    f += (vec2(h2(k), h2(k + 9.)) - .5) * vec2(.01, .006);
    float a = (mod(k.y, 2.) < 1. ? .75 : -.75) + (h2(k + 3.) - .5) * .7;
    vec2 t = vec2(cos(a), sin(a));
    float al = dot(f, t), ac = dot(f, vec2(-t.y, t.x)), L = .007 + .006 * h2(k + 5.);
    float dd = length(vec2(ac, max(abs(al) - L, 0.)));
    return engrave(dd, .0045, .0016 * (1. - .6 * smoothstep(-L, L, al)));   /* deeper where the chisel went in */
  }
  /* a crack wandering along a face: distance to it, where it runs */
  float crack(vec2 w, float y0, float seed) {
    float y = y0 + .35 * (fbm(vec2(w.x * .35, seed), 3) - .5) * 2. + .04 * (fbm(vec2(w.x * 4., seed + 3.), 2) - .5);
    float on = smoothstep(.45, .55, vn(vec2(w.x * .22, seed + 7.)));
    return on > 0. ? abs(w.y - y) / on : 9.;
  }
  float rubble(vec3 p) {
    float base = (p.y - .62 * (p.z - RZ) - .05 * sin(p.x * 3.)) * .8;
    vec3 sd; vec3 cl = cells3(p * vec3(3.2, 3.6, 3.2), sd);
    return base - .16 * cl.z - .05 * smoothstep(.0, .25, cl.y - cl.x) + rough(p, .02, 9.);
  }
  vec4 roomScene(vec3 p) {
    /* the landing's end: round stone, a round vault */
    vec4 d = hallAir(p, 1.9, 1.45, 1.9, -9., .2, M_CUT_SMALL);
    /* the square gallery, cut through the round end and on into the rock */
    vec4 g = boxAir(p, vec3(0, HT * .5, ${(ZEND / 2).toFixed(2)}), vec3(WW, HT * .5, ${(ZEND / 2).toFixed(2)}), M_DRESSED);
    d = A(d, g);
    bool inG = p.z > .15 && abs(p.x) < WW + .1 && p.y < HT + .1;
    if (inG) {
      float sz = seamZ(p);
      bool sq = p.z > sz;
      if (sq) {
        d.y = M_DRESSED;
        d.x -= .028;                                                        /* the square stone a finger proud of the round */
        gTint = vec3(.62, .6, .7);                                          /* darker, flat */
        float fade = 1. - smoothstep(2.2, 6.5, length(p - CAMP));
        vec2 w = abs(p.x) > WW - .05 ? vec2(p.z, p.y) : vec2(p.z, p.x);
        if (p.y > .03 && fade > 0.) d.x += chisel(w + (p.x < 0. ? 0. : 3.1)) * fade;
        /* cracks: two on each wall, one along the roof */
        float cr = 9.;
        if (abs(p.x) > WW - .05) cr = min(crack(vec2(p.z, p.y), 1.2, p.x < 0. ? 1. : 5.), crack(vec2(p.z * 1.3 + 4., p.y), .55, p.x < 0. ? 11. : 17.));
        else if (p.y > HT - .05) cr = crack(vec2(p.z, p.x), 0., 23.);
        if (cr < .03) { d.x += engrave(cr, .009, .014); if (cr < .006) gTint *= .35; }
      } else {
        d.y = M_CUT_SMALL; gTint = vec3(1.02, 1., 1.03);                                       /* the round stone, paler, its courses running into the clasp */
      }
      if (p.y < .03) gTint *= .8;
    }
    /* far down, the floor goes under a slope of broken stone */
    if (p.z > RZ - .5) { vec4 r = vec4(rubble(p), M_ROCK, NOUV); if (r.x < d.x) { d = r; gTint = vec3(.7, .68, .78); } }
    return d;
  }`;
}

/* the tally's hand: short cuts in a row; bars, bars with a tick, small rings, drops (as pt-b-2.A) */
export const TALLY = /* glsl */ `
  float tally(vec2 w, float cell, float s) {
    float k = floor(w.x / cell), fx = w.x - (k + .5) * cell, y = w.y;
    float kind = h2(vec2(k, s)), j = (h2(vec2(k, s + 2.)) - .5) * .008;
    float bar = length(vec2(fx + j, max(abs(y) - .026, 0.)));
    float d = bar;
    if (kind > .7) d = min(bar, length(vec2(fx + j - .01 - (y - .012), max(abs(y - .012) - .008, 0.))));
    if (kind > .92) d = abs(length(vec2(fx, y)) - .014);
    if (kind < .12) d = length(vec2(fx + j, max(abs(y + .01) - .014 * (1. - (y + .024) / .05), 0.)));
    if (h2(vec2(k, s + 31.)) < .08) d = 1.;
    return d;
  }`;

const CAM = { x: .5, y: 1.5, z: .2 };
export default {
  id: 'pt-b-6.A',
  name: 'The side passage',
  line: '',
  cam: { ...CAM, pitch: -4, yaw: -21, f: .66, cx: .5, cy: .47 },
  far: 30, fogK: 1 / 14,
  hazeBase: [.016, .014, .042], hazeFar: [.05, .045, .13],
  bloomAt: [0, .9, 20], bloomPow: 30, bloomC: [.06, .05, .12],
  bloom: { alpha: .14 },
  glow: { threshold: .62, k: .5 },
  blur: { px: 1.6, d0: 4, d1: 14, k: .7 },
  gold: 1, grain: .4, shadowJitter: 1, amb: .5, expo: 1.9, ambC: [.86, .78, 1.5], sheen: 0,
  lights: [
    { p: [.3, 1.25, -1.3], c: [1, .7, .34], k: .8, r: .9, shadow: 1, reach: 4.4 },          /* the landing's lamps, behind: their light comes weak through the doorway */
    { p: [-.1, 1.3, JZ - .75], c: [1, .72, .38], k: .22, r: .4, shadow: 1, reach: 1.5 },    /* and falls along the left wall, on the clasp */
    { p: [-.3, 1.5, JZ + .9], c: [.5, .47, .95], k: .25, r: .45, reach: 1.6 },               /* cold on the square side of it */
    { p: [.1, 1.8, -1.6], c: [.4, .37, .85], k: 3.2, r: 1.3 },                                 /* the landing's violet, behind */
    { p: [0, 1.4, 7], c: [.4, .37, .85], k: 1.6, r: 2.5 },                                       /* cold, far down the gallery, where the lamp gives out */
    { p: [0, 1.6, 13.5], c: [.45, .42, .9], k: 1.3, r: 3 },
  ],
  glsl: squareRoom(CAM) + TALLY + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    /* this side of the clasp the passage is the round side's: a round-headed passage, its vault springing at a
       man's chest, cut in the round stone; the square gallery's flat roof and straight corners meet it at the
       teeth, flush, so the curve of one stone runs into the flat face of the other */
    float sz = seamZ(p);
    if (p.z > .1 && p.z < JZ + .4) {
      float w = WW - .028 * smoothstep(JZ - 1., JZ - .35, p.z);              /* flush with the square stone at the joint */
      vec4 ra = hallAir(p, w, 1.15, w, -1., JZ + .4, M_CUT_SMALL);
      float rnd = min(ra.x, sz - p.z + .05), sqa = min(d.x, p.z - sz + .05);
      float land = hallAir(p, 1.9, 1.45, 1.9, -9., .2, M_CUT_SMALL).x;
      float a = max(land, max(rnd, sqa));
      if (p.z < sz) { d = vec4(a, M_CUT_SMALL, ra.zw); gTint = vec3(1.02, 1., 1.03) * mix(.4, 1., smoothstep(JZ - 1.1, JZ - .35, p.z)); } else d.x = a;   /* the round side near you in half-light, lit toward the joint */
    }
    /* one worn floor under both, level through the joint */
    if (p.z > .15 && p.z < 24. && abs(p.x) < WW - .05 && p.y < .2) {
      d.x = min(p.y, d.x + .028);
      if (p.y < .03) { d.y = M_DRESSED; d.zw = NOUV; gTint = vec3(.55, .53, .62); }
    }
    if (p.z < .25 && p.y > HT) gTint *= mix(.55, .15, smoothstep(HT, 2.5, p.y));         /* the round end above the door, in shadow */
    if (p.y < .03) gTint *= mix(.3, .8, smoothstep(0., JZ, p.z));                       /* the floor at your feet, calm */
    if (p.y > HT - .05 && p.z > sz) gTint *= mix(.45, .8, smoothstep(JZ - .9, JZ, p.z));  /* the flat roof overhead */
    else if (p.y > 1.3 && p.z < sz) gTint *= mix(1., .45, smoothstep(1.3, 2.15, p.y) * (1. - smoothstep(JZ - .5, JZ - .1, p.z)));   /* the round vault going up into shadow */
    /* the record, in the tally's hand, on the square wall just past the clasp */
    if (p.x < -WW + .05 && p.z > JZ + .5 && p.z < JZ + 1.25 && abs(p.y - 1.42) < .05) d.x += engrave(tally(vec2(p.z, p.y - 1.42), .05, 41.), .0045, .006);
    return d;
  }`,
  anchors: {
    fog: [{ p: [0, .25, JZ + 1.5], w: 1.2, h: .2, a: .14, speed: .6 }, { p: [0, .5, 8], w: 1, h: .25, a: .12 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true },
};
