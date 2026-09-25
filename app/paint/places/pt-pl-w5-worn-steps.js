/* SEALED (D-015). pt-pl-w5-worn-steps, the worn steps, and THE STAIR ROOM for the week-5/7 stair places
   (pt-b-5.B, pt-pl-w5-second-landing, pt-b-7.A import STAIR from here, so the Stair looks the same in each).
   The Stair: a flight wide enough for three, every step knee-high, in a vaulted passage cut in the round
   stone; a rail cut from the right wall (a bar left standing in a long groove), worn smooth along its top; the
   Stair's lamps in small arched niches in the left wall, one every four steps, burning.
   This place: halfway down the top flight, low, a step's height above the treads, looking down the flight to
   the first turn. The nearest step below is worn in two places a stride apart, two smooth hollows catching the
   lamps' light; the rail shines along its top; the flight drops away into lamplight at the turn. */

/* the Stair's measures, in its own frame: the flight runs down along +z from z = 0, top tread at y = 0 */
export const ST = { W: 1.55, RISE: .42, TREAD: .66, N: 16, LAMP: 4 };
/* a lamp's flame in the flight's own frame (i: the lamp's number, 0 at the top): x, y, z */
export const lampAt = i => { const z = (i * ST.LAMP + 2.5) * ST.TREAD; return [-ST.W - .2, -ST.RISE * (i * ST.LAMP + 3) + 1.35, z]; };

export const STAIR = /* glsl */ `
  const float SW = ${ST.W.toFixed(2)}, RISE = ${ST.RISE.toFixed(2)}, TREAD = ${ST.TREAD.toFixed(2)}, NST = ${ST.N.toFixed(1)}, LAMPE = ${ST.LAMP.toFixed(1)};
  float stairPale = 0.;                                                   /* 0: the top flight's stone; 1: the second flight's, paler */
  /* the line of the step noses, and the height of a point above it */
  float noseY(float z) { return -RISE / TREAD * z; }
  /* the flight's passage (air): a round-vaulted tunnel following the pitch of the stair, z0..z1 along it */
  vec4 flightAir(vec3 p, float z0, float z1) {
    vec3 q = vec3(p.x, p.y - noseY(clamp(p.z, 0., NST * TREAD)) + 1.2, p.z);
    vec4 a = hallAir(q, SW + .05, 3.1, SW + .05, z0, z1, M_CUT);
    a.x *= .84;
    return a;
  }
  /* the treads, worn at their noses */
  vec4 flightSteps(vec3 p) {
    vec4 s = stairs(p, -SW - .3, SW + .3, 0., 0., TREAD, RISE, int(NST), M_CUT);
    s.x += .003 * vn(p.xz * 14.);
    return s;
  }
  /* the rail: a long groove cut in the right wall, leaving a round bar standing in it, a man's chest above the treads */
  vec4 railCut(vec3 p, out float onRail) {
    float h = p.y - noseY(p.z);                                               /* height above the noses */
    vec2 rc = vec2(p.x - (SW + .1), h - 1.35);
    float groove = min(min(.2 - abs(rc.y), SW + .22 - p.x), p.x - SW + .3);                 /* the groove: air, 40 cm tall, 17 cm deep */
    float bar = length(rc / vec2(1.3, 1.)) - .075;                            /* the bar left standing */
    onRail = smoothstep(.02, 0., bar) * smoothstep(-.02, .06, rc.y + .02);
    return vec4(max(groove, -bar), M_CUT_SMALL, NOUV);
  }
  /* a lamp's niche in the left wall, its clay bowl and small still flame (i: the lamp's number) */
  vec4 lampNiche(vec3 p, float i) {
    float z = (i * LAMPE + 2.5) * TREAD, y = -RISE * (i * LAMPE + 3.) + 1.2;
    return vec4(min(archOpening2(vec2(p.z - z, p.y - y), .22, .22), min(-SW - p.x + .3, p.x + SW + .32)), M_CUT_SMALL, NOUV);
  }
  vec4 lampBody(vec3 p, float i) {
    float z = (i * LAMPE + 2.5) * TREAD, y = -RISE * (i * LAMPE + 3.) + 1.2;
    vec3 q = vec3(p.x + SW + .17, p.y - y - .05, p.z - z);
    vec4 b = vec4(max((length(q / vec3(.1, .06, .1)) - 1.) * .06, q.y - .03), M_ROCK, NOUV);
    vec3 qf = q - vec3(0., .1, 0.);
    float fr = .014 * (1. - smoothstep(-.03, .05, qf.y)) + .004;
    vec4 f = vec4(length(vec3(qf.x, max(abs(qf.y) - .03, 0.), qf.z)) - fr, M_GLOW, NOUV);
    return U(b, f);
  }
  /* the whole top flight, in its own frame, with its lamps (nearest first up to nL) */
  vec4 flight(vec3 p, float z0, float z1) {
    vec4 d = flightAir(p, z0, z1);
    float onRail = 0.;
    vec4 rl = railCut(p, onRail);
    if (p.z > z0 && p.z < min(z1, NST * TREAD)) d = A(d, rl);
    float li = clamp(floor((p.z / TREAD - 2.5) / LAMPE + .5), 0., floor(NST / LAMPE) - 1.);
    if (p.x < -SW + .1) d = A(d, lampNiche(p, li));
    float bump = rough(p, .012, 3.);
    d.x += bump * step(.5, float(abs(p.x) > SW - .05));                      /* the walls hand-cut, not sawn */
    d = U(d, flightSteps(p));
    vec4 lb = lampBody(p, li);
    if (lb.x < d.x) { d = lb; gTint = vec3(.8, .66, .6); }
    if (onRail > .01 && d.x < .01) { gPolish = .9 * onRail; }                           /* the rail worn smooth along its top */
    gTint *= mix(vec3(1), vec3(1.25, 1.22, 1.14), stairPale);
    return d;
  }
`;

const WARM = [1, .72, .4];
const L = i => { const [x, y, z] = lampAt(i); return [x + .25, y + .2, z]; };
export default {
  id: 'pt-pl-w5-worn-steps',
  name: 'The worn steps',
  line: '',
  cam: { x: -.02, y: -ST.RISE * 7 + .46, z: 6.9 * ST.TREAD, pitch: -47, yaw: -3, f: .58, cx: .5, cy: .5 },
  far: 40, fogK: 1 / 22,
  hazeBase: [.014, .012, .04], hazeFar: [.08, .07, .16],
  bloomAt: [0, -ST.RISE * 16 + 1, 17 * ST.TREAD], bloomPow: 10, bloomC: [.3, .2, .12],
  bloom: { alpha: .2 },
  glow: { threshold: .6, k: .7 },
  blur: { px: 1.8, d0: 3, d1: 12, k: .85 },
  gold: 1, sheen: 0, grain: .35, shadowJitter: 1, amb: 1.4, ambC: [.8, .76, 2.2], expo: 1.8,
  lights: [
    { p: L(2), c: WARM, k: .45, r: .6, shadow: .8, reach: 3.5, air: .03 },          /* the Stair's lamps below, in the left wall */
    { p: L(3), c: WARM, k: .5, r: .7, shadow: .7, reach: 4.5, air: .03 },
    { p: [.4, -ST.RISE * 16 + 1.6, 17.5 * ST.TREAD], c: WARM, k: 1., r: 1.4, shadow: .5 },   /* the first turn, lit */
    { p: L(1), c: WARM, k: .25, r: .5, shadow: .8, reach: 2.2 },                  /* the lamp you have passed, just behind on the left */
    { p: [0, -ST.RISE * 8 + .5, 8.1 * ST.TREAD], c: [1, .76, .48], k: .32, r: .35, reach: 1.3, shadow: 1 },   /* its light lying along the nearest step */
    { p: [.2, -1.2, 2.4], c: [.42, .39, .95], k: 6, r: 2.6, shadow: .5 },                               /* the violet from the landing above, behind you */
  ],
  glsl: STAIR + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = flight(p, -3., NST * TREAD + .4);
    /* the first turn: a landing at the flight's foot, the way on turning right */
    vec4 land = boxAir(p, vec3(1.4, noseY(NST * TREAD) + 1.4, NST * TREAD + 1.5), vec3(2.95, 1.9, 1.5), M_CUT);
    land.x = max(land.x, -1.) ;
    d = A(d, vec4(min(land.x, p.y - noseY(NST * TREAD) + .0), M_CUT, NOUV));
    /* the nearest step below you: two smooth hollows a stride apart, worn by feet */
    float k = 7., top = -RISE * (k + 1.), zc = (k + .55) * TREAD;
    if (abs(p.y - top) < .08 && d.x < .05) {
      for (int s = 0; s < 2; s++) {
        vec2 c = vec2(float(s) == 0. ? -.42 : .4, zc + (float(s) - .5) * .06);
        vec2 e = (p.xz - c) / vec2(.19, .25);                               /* longer front-to-back than wide */
        e += (vec2(fbm(p.xz * 7. + float(s) * 5., 3), fbm(p.xz * 7. + 11., 3)) - .5) * .25;   /* worn, not drawn */
        float r = length(e);
        float front = smoothstep(-1., 1., e.y);                                /* deepest toward the step's front edge */
        float dip = .032 * (.55 + .45 * front) * smoothstep(1., .35, r);      /* the rim feathered into the tread */
        d.x += dip;
        float w = smoothstep(1.1, .3, r);
        gPolish = max(gPolish, .9 * w); gTint *= 1. + .35 * w;
      }
    }
    /* every other tread worn the same way, fainter */
    float kk = floor(p.z / TREAD);
    if (kk != 7. && kk > 0. && kk < NST && abs(p.y + RISE * (kk + 1.)) < .06) {
      for (int s = 0; s < 2; s++) {
        vec2 e = (p.xz - vec2(float(s) == 0. ? -.42 : .4, (kk + .38) * TREAD)) / vec2(.2, .17);
        d.x += .02 * (1. - smoothstep(0., 1., dot(e, e)));
      }
    }
    if (p.z < 7. * TREAD) gTint *= .3;                                          /* behind you, out of the lamps' light */
    if (p.y > noseY(p.z) + 2.4) gTint *= mix(1., .3, smoothstep(2.4, 3.8, p.y - noseY(p.z)));   /* the vault going up into the dark */
    return d;
  }`,
  anchors: {
    flame: [2, 3].map(i => ({ p: lampAt(i).map((v, j) => j === 1 ? v - .05 : v), size: .6 })),
    fog: [{ p: [0, -ST.RISE * 12 + .2, 12 * ST.TREAD], w: 1.2, h: .2, a: .16 }, { p: [.3, -ST.RISE * 15 + .2, 15 * ST.TREAD], w: 1.3, h: .2, a: .12, speed: .6 }],
  },
  live: { motes: 'gold', fog: 'low', flame: 'still', gold: true },
};
