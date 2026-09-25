/* SEALED (D-015). pt-cv-10, camp view: the landing. Standing at the back of the landing at the head of the Stair,
   looking down the top flight into lamplight. On the left wall, just where the flight begins, one ring set apart
   from the faint rings around it, larger and cut deeper, its groove catching the light coming up the stair: the
   look-at, the first ring of the Stair. The Stair's lamps (warm), from below; fog lying on the steps.

   This file also carries the Stair's room, shared by the Stair's camp views (pt-cv-10 … pt-cv-15; a room of their
   own, as pt-b-1.C is for the camp): a vaulted stair wide enough for three, steps knee-high (0.42 m) on 0.55 m
   treads; the top flight goes down along +z from the landing (y 0, z -4 … 0) to a turn landing (y -5.04,
   z 6.6 … 9.8); the second flight turns right and goes down along +x. Lamps in arched cups in the walls, one every
   four steps; a rail cut from the right-hand wall, worn smooth on top, curling round the turn. */

export const ST = { W: 1.6, T: .55, R: .42, S: .42 / .55, Y1: -5.04, ZT: 6.6, ZF: 9.8 };
export const ramp1 = z => -Math.min(Math.max(z, 0), ST.ZT) * ST.S;                /* the top flight's nosing line */
export const ramp2 = x => ST.Y1 - Math.min(Math.max(x - ST.W, 0), 8) * ST.S;         /* the second flight's */
/* the lamps' flames: top flight in the left wall, second flight in the far wall */
export const LAMP1 = [2.5, 4.9].map(z => [-1.72, ramp1(z) + 1.98, z]);
export const LAMP2 = [3.0, 5.2, 7.4, 9.6].map(x => [x, ramp2(x) + 1.98, 9.92]);
export const lampLight = (f, k = .7, extra = {}) => ({ p: [f[0] + (f[0] < -1 ? .3 : 0), f[1] + .12, f[2] - (f[2] > 9 ? .3 : 0)], c: [1, .68, .34], k, r: .7, shadow: .6, ...extra });

export const STAIR_GLSL = /* glsl */ `
  const float SW = 1.6, ST_T = .55, ST_R = .42, ST_S = .42 / .55, ST_Y1 = -5.04, ST_ZT = 6.6, ST_ZF = 9.8;
  float ramp1(float z) { return -clamp(z, 0., ST_ZT) * ST_S; }
  float ramp2(float x) { return ST_Y1 - clamp(x - SW, 0., 8.) * ST_S; }
  /* a lamp cup: an arched recess in a wall (t along the wall, h up from the nosing line, n into the wall from its face) */
  float cupAir(float t, float h, float n) { return min(min(archOpening2(vec2(t, h - 1.72), .26, .38), .26 - n), n + .6); }
  float cupBowl(float t, float h, float n) {
    vec3 q = vec3(n - .12, h - 1.82, t);
    return max((length(q / vec3(.13, .09, .13)) - 1.) * .09, q.y - .05);
  }
  float cupFlame(float t, float h, float n) {
    vec3 q = vec3(n - .12, h - 1.98, t);
    float fr = .011 * (1. - smoothstep(-.02, .05, q.y)) + .004;
    return length(vec3(q.x, max(abs(q.y - .01) - .024, 0.), q.z)) - fr;
  }
  /* rings cut within reach, faint and worn (as the hall's) */
  float stRings(vec2 w, float seed) {
    w /= .6; vec2 c = floor(w), f = fract(w) - .5;
    float rr = .19 + .12 * h2(c + 3. + seed);
    return h2(c + seed) < .2 ? engrave(abs(length(f) - rr) * .6, .025, .008) : 0.;
  }
  /* the rail: a bar cut from the right-hand wall, 1.25 m above the nosing line, running round the corner of the turn */
  float gRailTop = 0.;
  float rail(vec3 p) {
    vec2 c = vec2(SW, ST_ZT);
    float dS = length(max(vec2(c.x - p.x, p.z - c.y), 0.)) + min(max(c.x - p.x, p.z - c.y), 0.);   /* to the wall's corner block */
    float ho = dS - .085;
    float yr = (p.x > SW ? ramp2(p.x) : ramp1(min(p.z, ST_ZT))) + 1.25;
    vec2 q = vec2(ho, p.y - yr);
    gRailTop = smoothstep(.0, .04, q.y) * (1. - smoothstep(.07, .1, abs(q.x) + .03));
    float r = length(max(abs(q) - vec2(.05, .035), 0.)) - .035;
    return max(r, .3 - p.z);
  }
  vec4 stairRoom(vec3 p) {
    /* the top flight and the landing: a round vault following the nosing line */
    vec3 q1 = vec3(p.x, p.y - ramp1(p.z) + .6, p.z);
    vec4 a1 = hallAir(q1, SW, 3.2, SW, -4., ST_ZF, M_CUT);
    /* the second flight, turning right */
    vec3 q2 = vec3(p.z - (ST_ZT + ST_ZF) * .5, p.y - ramp2(p.x) + .6, p.x);
    vec4 a2 = hallAir(q2, SW, 3.2, SW, -SW, 16., M_CUT);
    vec4 d = A(a1, a2);
    if (d.x == a1.x) d.x *= .8; else d.x *= .8;                                       /* the sheared vault: keep the march honest */
    /* the lamps' cups: in the left wall of the top flight, the far wall of the second */
    float z1 = p.z - clamp(floor((p.z - 2.5) / 2.4 + .5), 0., 1.) * 2.4 - 2.5;
    d = A(d, vec4(cupAir(z1, p.y - ramp1(p.z), -p.x - SW), M_CUT, NOUV));
    float x2 = p.x - clamp(floor((p.x - 3.) / 2.2 + .5), 0., 3.) * 2.2 - 3.;
    d = A(d, vec4(cupAir(x2, p.y - ramp2(p.x), p.z - ST_ZF), M_CUT, NOUV));
    /* rings on the walls within reach */
    float up1 = p.y - ramp1(p.z), up2 = p.y - ramp2(p.x);
    if (p.x < -SW + .05 && up1 > .4 && up1 < 2.4 && abs(p.z - 1.) > .9) d.x += stRings(vec2(p.z, up1), 1.);
    if (p.x > SW - .05 && p.z < ST_ZT && up1 > .4 && up1 < 1.05) d.x += stRings(vec2(p.z, up1), 7.);
    if (p.z > ST_ZF - .05 && up2 > .4 && up2 < 2.4) d.x += stRings(vec2(p.x, up2), 3.);
    /* floors: the landing, the treads, the turn landing, the second flight */
    d = U(d, box(p, vec3(0, -1., -3.), vec3(SW + .2, 1., 3.), M_FLOOR));
    d = U(d, stairs(p, -SW - .2, SW + .2, 0., 0., ST_T, ST_R, 12, M_FLOOR));
    d = U(d, box(p, vec3(0, ST_Y1 - 1., (ST_ZT + ST_ZF) * .5), vec3(SW + .2, 1., (ST_ZF - ST_ZT) * .5 + .2), M_FLOOR));
    vec4 s2 = stairs(vec3(p.z, p.y, p.x), ST_ZT - .2, ST_ZF + .2, SW, ST_Y1, ST_T, ST_R, 16, M_FLOOR);
    d = U(d, s2);
    /* the rail */
    vec4 rl = vec4(rail(p), M_CUT, NOUV);
    if (rl.x < d.x) { d = rl; gPolish = gRailTop * .9; }
    /* the lamps: clay bowls, and a small still flame in each */
    float b = min(cupBowl(z1, p.y - ramp1(p.z), -p.x - SW), cupBowl(x2, p.y - ramp2(p.x), p.z - ST_ZF));
    if (b < d.x) { d = vec4(b, M_ROCK, NOUV); gTint = vec3(.8, .62, .5); }
    float fl = min(cupFlame(z1, p.y - ramp1(p.z), -p.x - SW), cupFlame(x2, p.y - ramp2(p.x), p.z - ST_ZF));
    if (fl < d.x) d = vec4(fl, M_GLOW, NOUV);
    return d;
  }
`;

/* the Stair's look, shared */
export const STAIR_LOOK = {
  far: 40, fogK: 1 / 18, sheen: 0, gold: 1, expo: 2.1, amb: .9, ambC: [.8, .76, 1.8], stepK: .7, steps: 260,
  hazeBase: [.018, .016, .05], hazeFar: [.06, .05, .12],
  bloomPow: 14, bloomC: [.12, .08, .05],
  glow: { threshold: .55, k: .6 },
};

const RING = [-1.6, .72, 1.0];                                          /* the ring set apart, on the left wall at the flight's head */

export default {
  ...STAIR_LOOK,
  id: 'pt-cv-10',
  name: 'The landing',
  line: '',
  cam: { x: 0, y: 1.62, z: -1.0, pitch: -30, yaw: -12, f: .72, cx: .5, cy: .5 },
  bloomAt: [0, -3, 6],
  blur: { px: 1.8, d0: 5, d1: 14, k: .85 },
  lights: [
    lampLight(LAMP1[0], .45, { reach: 2.4 }),                                     /* light 0: the lamps' colour (the flames) */
    lampLight(LAMP1[1], .5, { reach: 2.6 }),
    { p: [0, -4.2, 6.8], c: [1, .68, .34], k: 2.6, r: 1.2, reach: 5 },                          /* the flight's lamplight, rising from below */
    { p: [-1.3, .3, 1.15], c: [1, .76, .48], k: .3, r: .3, shadow: .8, reach: 1. },  /* and catching the ring's groove from below */
    { p: [0, 2.5, -2.5], c: [.34, .31, .75], k: 5, r: 2.5 },
    { p: [0, -1, 4], c: [.34, .31, .75], k: 6, r: 3 },                        /* violet under the landing's vault */
  ],
  glsl: STAIR_GLSL + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = stairRoom(p);
    /* the ring set apart: larger, cut deeper, alone */
    if (p.x < -1.5) {
      vec2 f = vec2(p.z - ${RING[2].toFixed(2)}, p.y - ${RING[1].toFixed(2)});
      if (length(f) < .5) { d.x += engrave(abs(length(f) - .3), .032, .032); }
    }
    { float up = p.y - ramp1(p.z); if (up > 2.) gTint *= mix(1., .35, smoothstep(2., 3.8, up)); }   /* the vault into the dark */
    if (p.y < .02 && p.z < 0.) gTint *= mix(.45, 1., smoothstep(-2., -.2, p.z));     /* the landing floor at your feet */
    return d;
  }`,
  anchors: {
    flame: [...LAMP1.map(f => ({ p: f, size: .6 }))],
    fog: [{ p: [0, -2.4, 4], w: 1.2, h: .2, a: .14, speed: .6 }],
  },
  live: { fog: 'far', motes: 'gold', gold: true, flame: 'still' },
};
