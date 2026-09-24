/* SEALED (D-015). pt-b-1.C, the Survey Cut, round 2: a low round-roofed side chamber someone lived in.
   A camp cot along the right wall (wooden frame, canvas slung on it), a pair of boots side by side beneath
   it, toes out, as if for the morning; on the cot a notebook with a pencil in it and a tin box with a slate
   on its lid; on the back wall a plank shelf with the rod, its stone darker and finer. The clay lamp's weak
   warm light comes through the doorway behind you and lays the doorway's shape on the floor; violet fills
   the corners. The only straight-edged, made things in week 1. */
export default {
  id: 'pt-b-1.C',
  name: 'The Survey Cut',
  line: '',
  cam: { x: -.1, y: 1.38, z: .45, pitch: -24, yaw: 15, f: .7, cx: .5, cy: .5 },
  far: 12, fogK: 1 / 16,
  hazeBase: [.016, .014, .042], hazeFar: [.03, .026, .08],
  bloomAt: [.6, .3, 1.6], bloomPow: 10, bloomC: [.12, .08, .06],
  bloom: { alpha: .14 },
  glow: { threshold: .66, k: .6 },
  blur: { px: 1.2, d0: 3.4, d1: 6.5, k: .6 },
  grain: .6, shadowJitter: 1, amb: .5, expo: 1.9, ambC: [.75, .7, 1.6],
  lights: [
    { p: [-.55, 1.3, -2.2], c: [1, .6, .28], k: 30, r: 1.6, warm: .012, shadow: 1 },   /* the clay lamp, in the passage behind you */
    { p: [-1.3, 2.1, 3.6], c: [.4, .37, .85], k: .9, r: 1.2 },                           /* violet in the far corners */
    { p: [1.35, 2.1, 3.7], c: [.4, .37, .85], k: .6, r: 1 },
    { p: [0, 2.4, 1.8], c: [.36, .33, .8], k: .35, r: 1.5 },                            /* and under the roof */
  ],
  glsl: /* glsl */ `
  vec4 boot(vec3 p, vec3 at, float lean) {
    vec3 q = p - at; q.x += q.y * lean;
    /* the leg: a slightly flattened tube, open at the top, its top folded over */
    float leg = max(length(q.xz * vec2(1., 1.2)) - .056, max(q.y - .27, -q.y));
    leg = max(leg, -max(length(q.xz * vec2(1., 1.2)) - .046, .25 - q.y));
    /* the foot: toes out, rounded, a little turned up at the toe */
    vec3 f = q - vec3(-.1, .045 + .02 * smoothstep(-.08, -.2, q.x), 0);
    float foot = length(max(abs(f) - vec3(.12, .018, .03), 0.)) - .036;
    vec4 b = vec4(smin(leg, foot, .03), M_LEATHER, NOUV);
    vec4 sole = box(q, vec3(-.08, .008, 0), vec3(.19, .008, .055), M_SLATE);
    return U(b, sole);
  }
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 1.7, 1.15, 1.7, 0., 4., M_CUT);
    if (p.z > 3.9) d.zw = NOUV;                                                    /* the back wall laid square */
    d = A(d, boxAir(p, vec3(0, .78, -1.6), vec3(.68, .78, 1.65), M_CUT));            /* the doorway and passage */
    d = U(d, box(p, vec3(0, .02, -.12), vec3(.69, .02, .1), M_DRESSED));            /* the threshold stone, worn low */
    /* the cot: a wooden frame, canvas slung between its rails, legs */
    float cx = abs(p.x - .95), sag = .05 * max(0., 1. - pow(abs(p.z - 1.85) / .92, 2.)) * max(0., 1. - pow((p.x - .95) / .34, 2.));
    d = U(d, box(p, vec3(.95, .44 - sag, 1.85), vec3(.33, .01, .92), M_CLOTH));
    d = U(d, box(vec3(cx, p.y, p.z), vec3(.35, .44, 1.85), vec3(.024, .026, 1.), M_WOOD));
    d = U(d, box(vec3(p.x, p.y, abs(p.z - 1.85)), vec3(.95, .44, .98), vec3(.36, .02, .02), M_WOOD));
    d = U(d, box(vec3(cx, p.y, abs(p.z - 1.85)), vec3(.34, .21, .9), vec3(.02, .21, .02), M_WOOD));
    /* a blanket folded at the cot's foot */
    d = U(d, box(p, vec3(.95, .47 - sag * .5, 2.55), vec3(.31, .03, .18), M_CLOTH));
    if (abs(p.z - 2.55) < .19 && p.y > .44 && p.y < .52) gTint = vec3(.62, .6, .72);
    /* the boots, side by side under the cot's edge, toes out, as if for the morning */
    d = U(d, boot(p, vec3(.62, 0, 1.26), .04));
    d = U(d, boot(p, vec3(.63, 0, 1.43), -.02));
    /* on the cot: the notebook, open, with its pencil in it; the tin box with a slate on its lid */
    d = U(d, box(p, vec3(.86, .452, 1.55), vec3(.105, .006, .15), M_CLOTH));        /* its cover */
    d = U(d, box(p, vec3(.86, .459, 1.55), vec3(.098, .004, .142), M_PAPER));       /* its pages */
    d = U(d, vec4(length(vec2(p.x - .83, p.y - .468)) - .004 + max(0., abs(p.z - 1.54) - .085), M_WOOD, NOUV));
    d = U(d, box(p, vec3(1.08, .5, 2.2), vec3(.1, .05, .065), M_TIN));
    d = U(d, box(p, vec3(1.08, .556, 2.2), vec3(.108, .006, .072), M_SLATE));
    /* the shelf on the back wall, a plank on two pegs, and the rod on it */
    d = U(d, box(p, vec3(-.5, 1.2, 3.84), vec3(.44, .018, .12), M_WOOD));
    d = U(d, vec4(length(vec2(p.y - 1.235, p.z - 3.82)) - .018 + max(0., abs(p.x + .5) - .21), M_SLATE, NOUV));
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.2, 1.4, -.2], w: .35 }, { p: [.3, .1, 1.6], w: .6 }],
  },
  live: { motes: 'gold', gold: true },
};
