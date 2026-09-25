/* SEALED (D-015). pt-b-4.B, the salt block (the Salt Gallery of pt-b-2.A, reused, in the cups' light): a niche
   past the split, opened: a mouth of cut stone in the salt wall, and in it a block of clean salt, near-white. On
   the block's face, thumbnail-sized, a hook closed on a dot, cut into the salt, not stone. Beside it, on the
   niche's sill, a line in the tally's hand. The cups' warm glow comes from the left (the gallery's near end).
   Close, the block centred, square on; VP inside the niche. */
import room from './pt-b-2.A.js';

const ZB = 10.2, YB = .66;                                         /* the niche: past the split (pt-pl-w3-salt-lit's ZS 8.2) */
const W = [1, .84, .66], V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-b-4.B',
  name: 'The salt block',
  line: '',
  cam: { x: -1.0, y: .95, z: ZB + .04, pitch: -13, yaw: -90, f: .82, cx: .5, cy: .5 },
  salt: { pink: .3 },
  expo: 1.85, grade: [1, 1, 1], bloomAt: [-2.2, YB + .1, ZB], bloomC: [.05, .045, .1], sheen: 0,
  blur: { px: 1.4, d0: 1.3, d1: 5, k: .7 },
  lights: [
    { p: [-.9, 1.4, ZB - 2.2], c: W, k: .3, r: 1.2, shadow: .6, reach: 3.2 },               /* the cups' glow, from the left: the gallery's near end */
    { p: [-1.97, YB + .12, ZB - .19], c: W, k: .03, r: .12, reach: .45, shadow: 1 },           /* its reach into the niche, raking across the block's face */
    { p: [.3, 1.6, ZB + 6], c: V, k: 3, r: 4 },                                                 /* the gallery going on in its own violet, on the right */
    { p: [0, 1.6, ZB - 7], c: [.3, .28, .66], k: .5, r: 3 },                                   /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZB = ${ZB.toFixed(2)}, YB = ${YB.toFixed(2)};
  /* the hook closed on a dot: a shank down, a bend, and the point coming back up and in over a dot inside the bend */
  float hookD(vec2 m) {
    m = mat2(.77, .64, -.64, .77) * vec2(-m.x, m.y);                                           /* leaning over, as a hook hangs, not upright as a letter; its bend to the right */
    float r = .011;
    vec2 c = vec2(0., -.01);                                                                    /* the bend's centre */
    float shank = length(vec2(m.x + r, max(abs(m.y - .022) - .032, 0.)));                     /* a long shank */
    vec2 q = m - c;
    float bend = q.y < 0. ? abs(length(q) - r) : 1.;                                             /* the bend */
    float point = (q.y >= 0. && q.x > 0.) ? length(vec2(q.x - r, max(q.y - .008, 0.))) : 1.;   /* the point: a short way up, then in */
    vec2 tip = c + vec2(r, .008);
    vec2 dt = c + vec2(.002, .012);                                                               /* the dot, where the point closes on it */
    point = min(point, length(vec2(max(abs(m.x - (tip.x + dt.x) * .5) - (tip.x - dt.x) * .5, 0.), m.y - tip.y - (m.x - tip.x) * -.5)));
    float dd = length(m - dt) - .0035;
    return min(min(shank, bend), min(point, max(dd, 0.) + .0015));
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (floor(d.y + .5) == M_DRESSED) gTint *= .55;                                             /* the band kept down */
    gTint *= mix(1., .25, smoothstep(1.1, 1.9, p.y));                                           /* the salt going up out of the light: the words' band */
    if (p.x < -1.5) gTint *= .85 + .25 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds */
    if (p.y < .05) gTint *= .35;
    if (p.x < -1.5) gTint *= mix(.45, 1., smoothstep(1.3, .35, length(vec2(p.z - ZB, (p.y - YB - .1) * 1.2))));   /* the salt away from the niche falls into the dark */
    /* the niche's surround: cut stone set in the salt, a hand proud of it, round an opened mouth */
    vec4 fr = box(p, vec3(-1.98, YB + .12, ZB), vec3(.09, .3, .34), M_CUT_SMALL); fr.x -= .01;
    fr.x += rough(p, .004, 14.);
    if (fr.x < d.x) { d = fr; gTint = vec3(.8); }
    vec4 mouth = boxAir(p, vec3(-2.2, YB + .12, ZB), vec3(.34, .19, .23), M_CUT_SMALL);
    if (mouth.x > d.x) { d = mouth; gTint = vec3(mix(.75, .2, smoothstep(-2., -2.4, p.x))); }
    /* the block of salt: clean, near-white, its edges softened */
    vec4 bl = box(p, vec3(-2.2, YB + .045, ZB), vec3(.15, .115, .17), M_SALT); bl.x -= .012;
    bl.x += rough(p, .002, 30.);
    if (bl.x < d.x) {
      d = bl; gTint = vec3(1.25) * (.95 + .08 * fbm(p.zy * 14., 3));
      /* on its face, a hook closed on a dot, cut into the salt */
      if (p.x > -2.05) {
        float h = hookD(vec2(p.z - ZB, p.y - YB - .05) * .85);
        d.x += engrave(h, .0045, .0045);
        if (h < .004) gTint *= .8;
      }
    }
    /* on the sill's face, below the mouth: a line in the tally's hand */
    if (p.x > -1.91 && abs(p.y - (YB - .11)) < .05 && abs(p.z - ZB) < .28) d.x += engrave(tally(vec2(p.z - ZB + 20., p.y - (YB - .11))), .0045, .005);
    return d;
  }`,
  anchors: {
    glints: [[-2.06, YB + .12, ZB - .1], [-2.06, YB - .02, ZB + .12], [-2.1, YB + .16, ZB + .05], [-1.95, YB + .5, ZB + .5]].map(p => ({ p })),
    fog: [{ p: [-1.6, .35, ZB], w: 1.2, h: .14, a: .1 }],
  },
  live: { motes: 'gold', fog: 'low' },
};
