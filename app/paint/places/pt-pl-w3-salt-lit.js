/* SEALED (D-015). pt-pl-w3-salt-lit (the Salt Gallery of pt-b-2.A, reused, in the cups' light): once the hall
   is lit, the glow of its cups comes round the corner behind you and lies warm on the salt for the first time,
   and the salt shows its colour: banded grey and white, pink at the edges of the beds, glittering. In the
   middle distance on the left, the split: a gap in the salt the height of a man, packed with round brown
   river stones, water-worn. Beyond it the gallery goes on in its own cold violet. Eye height; VP at the split. */
import room from './pt-b-2.A.js';

export const ZS = 8.2;                                              /* where the split is, past the lone ring */
/* the split and its stones, shared with pt-cv-06: splitAir(p) is the gap (air, positive inside); stones(p) the
   packed river stones (solid). Both in the left wall. */
export const SPLIT = /* glsl */ `
  const float ZS = ${ZS.toFixed(2)};
  float splitHalf(float y) { float t = clamp((y - .5) / .5, -1., 1.); return .6 * pow(1. - t * t, .35) * (.85 + .3 * fbm(vec2(y * 3., 41.), 2)) - .01; }   /* low in the wall, wider than it is tall */
  vec4 splitAir(vec3 p) {
    float cz = ZS + (fbm(vec2(p.y * 1.3, 43.), 2) - .5) * .1;
    float dz = p.z - cz; dz *= dz > 0. ? 1. : 1.3;                                    /* one side steeper than the other */
    float g = min(splitHalf(p.y) - abs(dz) + rough(p, .035, 4.) + rough(p, .01, 13.), p.x + 2.6);
    g = min(g, min(1.1 - p.y, p.y - .02));
    g = min(g, -1.8 - p.x);                                                          /* only in the wall */
    return vec4(g, M_ROCK, NOUV);
  }
  /* round river stones, water-worn, packed two deep in the gap, set back in its shadow, each its own */
  vec4 stones(vec3 p) {
    float best = 1e3;
    for (int l = 0; l < 2; l++) {
      float fl = float(l), cell = .17;
      vec2 w = vec2(p.z - ZS + fl * .085, p.y - fl * .09);
      vec2 c0 = floor(w / cell);
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 c = c0 + vec2(i, j);
        vec2 jit = vec2(h2(c + fl * 17.), h2(c.yx + 5. + fl * 3.)) - .5;
        vec2 ctr = (c + .5 + jit * .35) * cell;
        float r = .05 + .04 * h2(c + 9. + fl * 4.);
        vec3 e = vec3(p.x - (-2.16 - fl * .09 + (h2(c + 2.) - .5) * .04), w - ctr);
        float an = h2(c + 21. + fl) * 3.1, ca = cos(an), sa = sin(an);
        e.yz = vec2(ca * e.y - sa * e.z, sa * e.y + ca * e.z);
        float s = length(e / vec3(.8, 1., 1.2 + .3 * h2(c + 31.))) - r;
        best = min(best, s * .85);
      }
    }
    best += rough(p, .002, 40.);
    return vec4(max(best, -splitAir(p).x - .005), M_ROCK, NOUV);                 /* only in the gap */
  }
`;

const W = [1, .9, .8];
export default {
  ...room,
  id: 'pt-pl-w3-salt-lit',
  name: 'The salt, lit',
  line: '',
  cam: { x: -.25, y: 1.15, z: ZS - 1.55, pitch: -16, yaw: -44, f: .62, cx: .5, cy: .5 },
  salt: { pink: .45 },
  expo: 1.9, grade: [1, 1, 1],
  blur: { px: 1.8, d0: 4, d1: 16, k: .85 },
  lights: [
    { p: [.4, 1.8, ZS - 2.2], c: [1, .84, .66], k: 3.2, r: 1.8, shadow: .6 },         /* the cups' glow, round the corner behind you */
    { p: [-1.78, 1.02, ZS - .2], c: [1, .75, .48], k: .22, r: .25, reach: .75, shadow: 1 },   /* its last reach, from above, onto the stones' tops */
    { p: [.6, 1.9, ZS + 2.5], c: [.62, .58, 1.2], k: 1, r: 2, shadow: .5 },        /* the gallery's violet, from further in */                  /* its last reach, onto the split's stones */
    { p: [.4, 1.6, 34], c: [.62, .58, 1.2], k: 22, r: 9 },                         /* the gallery going on in its own violet */
    { p: [1.3, 1.9, 16], c: [.62, .58, 1.2], k: 6, r: 4.5 },
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + SPLIT + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (floor(d.y + .5) == M_DRESSED) gTint *= .5;                                       /* the band kept down to the salt's value */
    gTint *= mix(1., .3, smoothstep(1.75, 2.7, p.y));                                     /* the salt going up out of the light */
    if (p.x < -1.5) gTint *= .85 + .25 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds */
    if (p.y < .05) gTint *= mix(.3, .8, smoothstep(ZS - 1., ZS + 5., p.z));            /* the near floor kept down */
    if (p.y < .7 && p.x < -1.5) gTint *= mix(.55, 1., smoothstep(.1, .7, p.y));        /* and the wall's foot */
    vec4 a = splitAir(p);
    if (a.x > d.x) { d = a; gTint = vec3(mix(.5, .05, smoothstep(-1.99, -2.1, p.x))); }   /* the gap: dark, in its own shadow */                                      /* the split's inside, in shadow */
    vec4 s = stones(p);
    if (s.x < d.x) {
      d = s;
      gTint = vec3(.78, .5, .3) * (.8 + .4 * h2(floor(vec2(p.z, p.y) / .085)));     /* river stones: brown, each its own */
      gPolish = .5;                                                                  /* water-worn smooth */
    }
    return d;
  }`,
  anchors: {
    glints: [[-1.95, 1.9, ZS - .9], [-1.95, 1.4, ZS - .6], [-1.94, 2.1, ZS + .5], [-2.05, 1.2, ZS + .05], [-1.95, 1.6, ZS + .9]].map(p => ({ p })),
    fog: [{ p: [-1, .2, ZS + .6], w: 1.4, h: .18, a: .14 }],
  },
  live: { motes: 'gold', fog: 'low' },
};
