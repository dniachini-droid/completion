/* SEALED (D-015). pt-b-1.C, the Survey Cut, round 3: a low round-roofed side chamber someone lived in.
   A camp cot along the right wall (a canvas sling sagging between wooden rails, X-legs), a pair of boots
   side by side beneath its edge, toes out, as if for the morning; on the cot a notebook with a pencil in it
   and a tin box with a slate on its lid; on the back wall a plank shelf on two pegs, with the rod, its stone
   darker and finer. The clay lamp's weak warm light comes through the doorway behind you, lays the
   doorway's shape on the floor and ends on the boots; violet fills the corners. Seen low, from the door. */
export default {
  id: 'pt-b-1.C',
  name: 'The Survey Cut',
  line: '',
  cam: { x: -.25, y: 1.05, z: .25, pitch: -13, yaw: 22, f: .72, cx: .5, cy: .46 },
  far: 12, fogK: 1 / 16,
  hazeBase: [.016, .014, .042], hazeFar: [.03, .026, .08],
  bloomAt: [.6, .3, 1.6], bloomPow: 10, bloomC: [.08, .06, .03],
  bloom: { alpha: .12 },
  glow: { threshold: .66, k: .6 },
  blur: { px: 1.4, d0: 2.4, d1: 6, k: .6 },
  gold: 1, grain: .3, shadowJitter: 1, amb: .42, expo: 2.05, ambC: [.86, .76, 1.45],
  lights: [
    { p: [-.3, 1.95, -3.], c: [1, .7, .34], k: 12, r: 1.2, warm: .01, shadow: 1 },   /* the clay lamp, high in the passage behind you: its light comes down through the doorway */
    { p: [.4, .26, 1.05], c: [1, .7, .34], k: .2, r: .22 },                             /* its light ending on the boots' toes */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.1, r: 1.2 },                        /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .8, r: 1 },
    { p: [-.9, 1.5, 3.3], c: [.44, .41, .9], k: .25, r: .5 },                          /* a violet rim along the rod */
    { p: [0, 2.2, 1.8], c: [.36, .33, .8], k: .08, r: 1.5 },
    { p: [1.05, .9, 2.0], c: [.4, .37, .85], k: .25, r: .6 },                          /* a little violet on the cot's things */                           /* under the roof */
  ],
  glsl: /* glsl */ `
  float ell(vec3 p, vec3 r) { return (length(p / r) - 1.) * min(r.x, min(r.y, r.z)); }
  /* an old leather boot, toe toward -x: an oval leg narrowing to the ankle, its top slumped and folded over at the
     back; a low flat foot with a real toe, turned up a little; laces only down the front */
  vec4 boot(vec3 p, vec3 at, float lean) {
    vec3 q = p - at; q.x += q.y * lean;
    float r = mix(.04, .054, smoothstep(.07, .25, q.y));                                   /* narrow at the ankle */
    vec2 o = vec2(q.x / 1.18, q.z);
    float top = .25 - .035 * smoothstep(-.02, .05, q.x);                                     /* the back slumps lower */
    float leg = max(length(o) - r, max(q.y - top, .04 - q.y));
    leg = max(leg, -max(length(o) - r + .006, top - .02 - q.y));                              /* open at the top */
    float cuff = length(vec2(length(o) - r - .004, q.y - top + .012)) - .011;                 /* the fold at the cuff */
    cuff = max(cuff, -.005 - q.x * .4);                                                       /* folded over at the back only */
    vec3 f = q;
    float heel = ell(f - vec3(-.02, .05, 0), vec3(.075, .052, .046));
    float instep = ell(f - vec3(-.1, .042, 0), vec3(.09, .04, .044));
    float toe = ell(f - vec3(-.185, .034, 0), vec3(.05, .03, .04));
    float foot = smin(smin(heel, instep, .03), toe, .025);
    foot = max(foot, .006 - q.y);
    float b = smin(min(leg, cuff), foot, .03);
    /* the laces: crossed, only down the front of the leg and over the instep */
    float t = fract(q.y / .03), zz = (abs(t - .5) * 2. - .5) * .026, lace = min(abs(q.z - zz), abs(q.z + zz));
    if (q.x < -.028 && q.y > .06 && q.y < .21) b += engrave(lace, .0035, .0035);
    vec4 bt = vec4(b, M_LEATHER, NOUV);
    if (b < .01) gTint = vec3(.58, .52, .5) * (1. - .25 * smoothstep(.2, .25, q.y));      /* the cuff darker, handled */
    float sl = max(smin(smin(heel, instep, .03), toe, .025) - .006, max(q.y - .012, -q.y));
    vec4 sole = vec4(sl, M_LEATHER, NOUV);
    if (sole.x < bt.x && sole.x < .01) gTint = vec3(.4);                                 /* only on the sole itself */
    return U(bt, sole);
  }
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 1.7, 1., 1.7, 0., 4., M_CUT);
    if (p.z > 3.9) d.zw = NOUV;                                                    /* the back wall laid square */
    d = A(d, boxAir(p, vec3(0, .78, -1.6), vec3(.68, .78, 1.65), M_CUT));            /* the doorway and passage */
    d = A(d, boxAir(p, vec3(0, 1.15, -2.), vec3(.68, 1.15, 1.6), M_CUT));             /* the passage rises behind the door, to the lamp's niche */
    d = U(d, box(p, vec3(0, .02, -.12), vec3(.69, .02, .1), M_DRESSED));            /* the threshold stone, worn low */
    if (p.y < .03) gTint = mix(vec3(.16, .15, .24), vec3(1), smoothstep(.7, 1.3, p.z));   /* the near floor in the doorway's shadow, cold */
    if (p.y > 1.3) gTint = vec3(mix(1., .38, smoothstep(1.3, 2.4, p.y)));             /* the roof close and dark overhead */
    /* the cot: canvas slung over two wooden rails, sagging between the ends; X-legs at each end */
    float u = (p.z - 1.85) / .92, vx = (p.x - .95) / .34;
    float sag = .14 * max(0., 1. - u * u) * (1. - .55 * vx * vx);
    vec4 canvas = box(p, vec3(.95, .47 - sag, 1.85), vec3(.35, .008, .92), M_CLOTH);
    canvas.x -= .006;
    d = U(d, canvas);
    d = U(d, box(vec3(abs(p.x - .95), p.y, p.z), vec3(.345, .455, 1.85), vec3(.022, .022, 1.), M_WOOD));
    vec3 lq = vec3(abs(p.x - .95), p.y, abs(p.z - 1.85) - .86);
    float ang = .62, ca = cos(ang), sa = sin(ang);
    vec2 xy = vec2(lq.x - .0, lq.y - .23);
    vec2 r1 = vec2(ca * xy.x + sa * xy.y, -sa * xy.x + ca * xy.y);
    d = U(d, vec4(length(max(abs(vec3(r1.x, r1.y, lq.z)) - vec3(.018, .28, .018), 0.)) - .004, M_WOOD, NOUV));
    /* a blanket folded at the cot's foot, slumped over its end */
    vec4 bl = box(p, vec3(.95, .5 - sag * .6, 2.58), vec3(.29, .025, .16), M_CLOTH); bl.x -= .025;
    if (bl.x < .01) gTint = vec3(.55, .54, .66);
    d = U(d, bl);
    /* the boots, side by side under the cot's edge, toes out, as if for the morning */
    d = U(d, boot(p, vec3(.58, 0, 1.25), -.12));                                     /* leaning on its pair */
    d = U(d, boot(p, vec3(.6, 0, 1.42), .02));
    /* on the cot: the notebook, open, its pencil across the page; the tin box with a slate on its lid */
    d = U(d, box(p, vec3(.86, .358, 1.62), vec3(.105, .006, .15), M_CLOTH));
    d = U(d, box(p, vec3(.86, .365, 1.62), vec3(.098, .004, .142), M_PAPER));
    vec3 pq = p - vec3(.85, .374, 1.6); float pa = .5, pc = cos(pa), ps = sin(pa);
    vec2 pxz = vec2(pc * pq.x - ps * pq.z, ps * pq.x + pc * pq.z);
    d = U(d, vec4(length(vec2(pxz.x, pq.y)) - .006 + max(0., abs(pxz.y) - .085), M_WOOD, NOUV));
    d = U(d, box(p, vec3(1.08, .5 - .1, 2.2), vec3(.1, .05, .065), M_TIN));
    d = U(d, box(p, vec3(1.08, .556 - .1, 2.2), vec3(.108, .006, .072), M_SLATE));
    /* the shelf on the back wall, a plank on two pegs, and the rod on it */
    d = U(d, box(p, vec3(-.5, 1.2, 3.84), vec3(.44, .018, .12), M_WOOD));
    d = U(d, vec4(length(vec2(abs(p.x + .5) - .3, p.y - 1.16)) - .016 + max(0., 3.9 - p.z - .1), M_WOOD, NOUV));
    d = U(d, vec4(length(vec2(p.y - 1.235, p.z - 3.82)) - .018 + max(0., abs(p.x + .5) - .21), M_SLATE, NOUV));
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.2, 1.3, .9], w: .3 }, { p: [.3, .1, 1.3], w: .45 }],
  },
  live: { motes: 'gold', gold: true },
};
