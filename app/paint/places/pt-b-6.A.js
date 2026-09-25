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

/* This place, round 4 (D-091 retry, a different approach): stand in the round passage and look at where it
   ends against the square stone's flat face. The round passage's wall and vault curve over and run straight into
   the flat, square-cut face; the low square doorway is cut through that face, to the right, into the square
   gallery. The clasp is the inside corner where curve meets flat: the square face's courses turn the corner and
   bite into the round wall in alternate courses, the round wall's courses running into the gaps between them.
   Both stones the same value: the joint shows only as the zigzag of the seam and the change from curved to flat.
   One warm pool, the landing's lamps behind, falls right across the corner; it dies away into the gallery. */
const FZ = JZ, R = 1.55, S = 1.1, GX = .25, CH = .4, TL = .42;       /* the face; the round passage; the doorway's offset; course height; tooth */
const CAM = { x: 0, y: 1.45, z: FZ - 2.3 };
export default {
  id: 'pt-b-6.A',
  name: 'The side passage',
  line: '',
  cam: { ...CAM, pitch: 0, yaw: -28, f: .64, cx: .5, cy: .47 },
  far: 30, fogK: 1 / 16,
  hazeBase: [.018, .016, .046], hazeFar: [.08, .07, .18],
  bloomAt: [GX, 1.1, RZ], bloomPow: 22, bloomC: [.1, .09, .2],
  bloom: { alpha: .2 },
  glow: { threshold: .6, k: .5 },
  blur: { px: 1.4, d0: 5, d1: 16, k: .5 },
  gold: 1, grain: .5, shadowJitter: 1, amb: .6, expo: 2, ambC: [.86, .78, 1.5], sheen: .04,
  lights: [
    { p: [-.95, 1.35, FZ - .42], c: [1, .7, .36], k: .4, r: .32, shadow: 1, reach: 1.6, warm: .004 },  /* the landing's lamps, behind: one pool, across the corner */
    { p: [.2, 1.8, CAM.z - 2.5], c: [.4, .37, .85], k: 3.4, r: 1.6 },                                    /* the landing's violet, behind */
    { p: [GX, 1.3, 7], c: [.42, .4, .9], k: .45, r: 2.2 },                                              /* cold, down the gallery */
  ],
  glsl: squareRoom(CAM) + TALLY + /* glsl */ `
  const float FZ = ${FZ.toFixed(2)}, RR = ${R.toFixed(2)}, SS = ${S.toFixed(2)}, GX = ${GX.toFixed(2)}, CH = ${CH.toFixed(2)}, TL = ${TL.toFixed(2)};
  const vec3 STONE = vec3(.62, .62, .76);
  float zTooth(float k) { return FZ - (mod(k, 2.) < 1. && k < 5. ? TL * (.85 + .3 * h2(vec2(k, 5.))) : 0.); }
  vec4 scene(vec3 p) {
    vec4 rd = hallAir(p, RR, SS, RR, -8., FZ, M_CUT_SMALL);
    vec3 q = p - vec3(GX, 0, 0);
    vec4 g = boxAir(q, vec3(0, HT * .5, (FZ + ${ZEND.toFixed(2)}) * .5 - .03), vec3(WW, HT * .5, (${ZEND.toFixed(2)} - FZ) * .5 + .03), M_DRESSED);
    vec4 d = A(rd, g);
    if (p.z > RZ - .5) { vec4 r = vec4(rubble(q), M_ROCK, NOUV); if (r.x < d.x) { d = r; gTint = vec3(.7, .68, .78); return d; } }
    /* which stone: the flat face and the gallery are square; so is every other course for a tooth's length up the round wall */
    float k = floor(p.y / CH);
    float zs = zTooth(k);
    bool wall = p.y > .03;
    bool sq = p.z > FZ - .02 || (wall && p.z > zs);
    bool face = p.z > FZ - .02 && q.z < FZ + .05;
    /* the seam on the round wall: the zigzag round the teeth, cut the same on both sides of it */
    float dj = 9.;
    if (wall && !face && p.z > FZ - TL * 1.3) {
      float za = zTooth(k - 1.), zb = zTooth(k + 1.);
      if (p.z < FZ - .02) dj = abs(p.z - zs);
      if (p.z > min(zs, za) && p.z < max(zs, za)) dj = min(dj, abs(p.y - k * CH));
      if (p.z > min(zs, zb) && p.z < max(zs, zb)) dj = min(dj, abs(p.y - (k + 1.) * CH));
      d.x += engrave(dj, .012, .006);
    }
    if (sq) {
      d.y = M_DRESSED; d.zw = NOUV; gTint = STONE;
      if (wall && q.z < FZ + .05) {
        vec2 w = face ? vec2(p.x, p.y) : vec2(p.z, p.y);
        d.zw = vec2(w.x, w.y * .1);                                          /* even mottling, no drag lines */
        /* the square stone is tooled: close-set small pecks, every way */
        float pk = (smoothstep(.6, .82, vn(w * 70.)) + .5 * smoothstep(.62, .85, vn(w * 130. + 7.))) * (.55 + .7 * fbm(w * 3., 2));
        d.x += .0018 * pk * smoothstep(.004, .016, dj);
      }
      if (face) {
        /* the face's own courses: bed joints level, end joints staggered */
        float bl = .6 + .35 * h2(vec2(k, 4.)), o = h2(vec2(k, 9.)) * bl, dx = abs(fract((p.x + o) / bl + .5) - .5) * bl;
        float df = min(abs(p.y - floor(p.y / CH + .5) * CH), dx);
        if (wall) d.x += engrave(df, .012, .006);
      }
      /* the gallery: cracks along its walls */
      if (p.z > FZ + .1 && abs(q.x) > WW - .05) { float cr = min(crack(vec2(p.z, p.y), 1.2, q.x < 0. ? 1. : 5.), crack(vec2(p.z * 1.3 + 4., p.y), .55, q.x < 0. ? 11. : 17.)); if (cr < .03) { d.x += engrave(cr, .009, .014); if (cr < .006) gTint *= .35; } }
      if (p.z > FZ + .1) gTint *= .92;
    } else {
      d.zw = vec2(rd.z, rd.w) * (.7 / CH);
      gTint = STONE * (.95 + .08 * fbm(p.zy * 2.2, 3)); gPolish = .2;       /* the round stone: smooth, worn */
    }
    /* keep the frame's edges calm: the vault close overhead, the floor at your feet */
    if (p.y > 1.9 && p.z < FZ - .4) gTint *= mix(1., .3, smoothstep(1.9, 2.7, p.y) * (1. - smoothstep(FZ - 1.4, FZ - .4, p.z)));
    if (p.y < .03) gTint *= mix(.45, .9, smoothstep(${CAM.z.toFixed(2)}, FZ, p.z));
    return d;
  }`,
  anchors: {
    fog: [{ p: [-.4, .25, FZ - .5], w: 1.2, h: .2, a: .12, speed: .6 }, { p: [GX, .3, FZ + 1], w: .9, h: .2, a: .1 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true },
};
