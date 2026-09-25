/* SEALED (D-015). pt-pl-w4-recess-above-the-cot: in her camp (pt-b-1.C's room, reused), above her cot at the height
   of a raised arm, where the wall turns into the vault, a recess with a slate set across its mouth and a count cut
   in the slate; beside it a crack in the stone, and in the crack, alone, a steel drawing pin. The clay lamp's weak
   light comes from the doorway, from below; violet in the vault. Seen looking up from the cot's foot. */
import room from './pt-b-1.C.js';

const C = [1.405, 1.95, 1.72];                                       /* the recess's mouth, on the vault over the cot */
export default {
  ...room,
  id: 'pt-pl-w4-recess-above-the-cot',
  name: 'The recess above the cot',
  line: '',
  cam: { x: 1.0, y: 1.42, z: 2.24, pitch: 40, yaw: 139, f: 1.45, cx: .5, cy: .5 },   /* at the cot's foot end, looking up at the wall over it */
  far: 9, fogK: 1 / 15,
  bloomAt: [C[0] - .05, C[1] - .02, C[2] + .26], bloomPow: 30, bloomC: [.02, .015, .008],
  blur: { px: 1.3, d0: 1., d1: 2.6, k: .6 },
  expo: 2.15, amb: .3, sheen: 0,
  lights: [
    { ...room.lights[0], k: 2.5 },                                                          /* the clay lamp, in the passage: its light rises into the vault */
    { p: [1.26, 1.62, 1.8], c: [1, .7, .34], k: .06, r: .2, shadow: 1, reach: .5 },       /* its light, weak, from below, raking up the wall and into the recess's lip */
    { p: [1.36, 1.945, 1.972], c: [.9, .92, 1.], k: .0025, r: .012, reach: .03 },             /* a cold point given back by the pin's steel */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: .8, r: 1.2 },                            /* violet in the corners */
    { p: [.2, 2.4, .8], c: [.4, .37, .85], k: .7, r: 1 },
    { p: [.6, 1.7, 2.5], c: [.4, .37, .85], k: .12, r: .8 },                              /* violet fill on the wall over the cot */                               /* violet in the vault */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    vec3 c = vec3(${C.join(', ')});
    vec3 n = normalize(vec3(-c.x, -(c.y - 1.), 0.));                              /* the vault's face here, toward the room */
    vec3 t = vec3(-n.y, n.x, 0.);                                                 /* up the vault */
    vec3 q = p - c; vec3 l = vec3(dot(q, n), dot(q, t), q.z);                     /* out of the stone, up it, along it */
    /* the recess, a hand deep, cut square into the curve */
    vec4 rc = boxAir(l, vec3(-.12, 0, 0), vec3(.14, .1, .13), M_ROCK);
    rc.x += rough(p, .006, 30.);
    d = A(d, rc);
    /* the slate set across its mouth, a little proud and a little askew */
    float sa = .05, cs = cos(sa), sn = sin(sa);
    vec3 s = l - vec3(-.012, -.022, -.02); s.yz = vec2(cs * s.y - sn * s.z, sn * s.y + cs * s.z);
    vec4 sl = box(s, vec3(0), vec3(.007, .074, .1), M_SLATE); sl.x -= .003;   /* leaning in the mouth: a dark gap above it and at one side */
    bool cut = false;
    if (s.x > 0. && abs(s.y + .01) < .05 && abs(s.z) < .11) {
      float k = floor((s.z + .11) / .024), sz = s.z + .11 - (k + .5) * .024 + (h2(vec2(k, 5.)) - .5) * .006;
      float yy = s.y + .01 + (h2(vec2(k, 7.)) - .5) * .01; sz += yy * (h2(vec2(k, 3.)) - .5) * .3;
      float e = length(vec2(sz, max(abs(yy) - .026 - .012 * h2(vec2(k, 2.)), 0.)));
      if (k < 9.) { sl.x += engrave(e, .003, .003); cut = e < .003; }
    }
    sl.x += rough(p, .0015, 60.);
    if (sl.x < d.x) { d = sl; gTint = cut ? vec3(1.2) : vec3(.72, .72, .78) * (.85 + .3 * fbm(p.yz * 40., 2)); }
    /* beside it, a crack running up the stone, and in it the drawing pin */
    float cz = l.z - .245 - .03 * l.y - .004 * (fbm(vec2(l.y * 18., 3.), 3) - .5) * 2. - .0015 * (vn(vec2(l.y * 90., 8.)) - .5);   /* straight-ish, jagged */
    float crack = abs(cz);
    bool nearWall = sl.x > .004 && abs(l.x) < .02;
    if (nearWall && l.y > -.2 && l.y < .2) {
      float brk = smoothstep(.4, .55, vn(vec2(l.y * 14., 21.)));                              /* broken: it closes up in places */
      float w = (.0012 + .0016 * brk) * (1. - smoothstep(.1, .2, abs(l.y)));
      d.x += engrave(crack, w, .008 * brk + .002);
      if (crack < w * .7) gTint *= .2;                                                           /* its inner shadow */
      else if (cz < 0. && crack < w * 1.8) gTint *= 1.35;                                         /* the lit lip on the lamp's side */
    }
    vec3 pq = l - vec3(.003, -.02, .245 - .03 * -.02);
    float ta = .45, ct = cos(ta), st = sin(ta);
    vec3 hq = vec3(ct * pq.x - st * pq.z, pq.y, st * pq.x + ct * pq.z);                         /* the head tipped a little: an ellipse, seen edge-on */
    float rr = length(hq.yz);
    float head = max(rr - .0075, abs(hq.x) - .0005);                                              /* a flat steel disc */
    float shaft = max(length(pq.yz) - .0007, max(-pq.x - .012, pq.x));                            /* its point, going into the crack */
    vec4 pin = vec4(min(head, shaft), M_TIN, NOUV);
    if (pin.x < d.x) {
      d = pin; gTint = vec3(.8, .82, .88); gPolish = .5;
      if (rr > .0062) gTint *= .55;                                                               /* a thin darker rim */
    }
    if (nearWall && length(l.yz - vec2(-.02 - .004, .245 + .006)) < .006) gTint *= .5;             /* the head's small shadow on the stone */
    if (p.y > 2.15) gTint *= mix(1., .35, smoothstep(2.15, 2.6, p.y));              /* the crown of the vault in the dark */
    if (p.y < 1.15) gTint *= mix(.3, 1., smoothstep(.4, 1.15, p.y));                  /* the cot and the wall below, kept back */
    if (p.y < 1.75) gTint *= mix(.5, 1., smoothstep(1.3, 1.75, p.y));                 /* the wall below falling off toward the cot */
    if (p.y < .65) gTint *= .3;                                                         /* the cot and the floor under you, in the dark */
    return d;
  }`,
  anchors: {
    glints: [{ p: [C[0] - .01, C[1] - .012, C[2] + .245] }],
    beam: [{ p: [1.22, 1.72, 1.85], w: .2 }],
  },
  live: { motes: 'gold', gold: true },
};
