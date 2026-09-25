/* SEALED (D-015). pt-pl-w2-above-the-ring, round 1 (the Salt Gallery's left wall, as pt-b-2.A): looking up
   from under the lone ring. Over it the salt has a crack two fingers wide, running up; beside the crack, cut
   small, a count. Far back in the crack, something pale, too far in to reach: seen only as a highlight in the
   dark. The one light is the gallery's violet, raking across the salt from the left. */
const ZR = 3.4;                                                     /* the lone ring, as in pt-b-2.A */
export default {
  id: 'pt-pl-w2-above-the-ring',
  name: 'Above the ring',
  line: '',
  cam: { x: -1.68, y: 1.72, z: ZR - .32, pitch: 52, yaw: -62, f: .62, cx: .5, cy: .53 },   /* close under it, looking steeply up: the crack runs away diagonally */
  far: 20, fogK: 1 / 22, hazeFar: [.08, .07, .2],
  bloomAt: [-2.3, 2.15, ZR + .02], bloomPow: 40, bloomC: [.1, .09, .2],
  glow: { threshold: .6, k: .7 },
  blur: { px: 1.4, d0: .2, d1: .6, k: .75 },
  expo: 1.7, grade: [1.1, 1, .9], grain: .4, shadowJitter: 1,
  salt: { pink: 0 },
  lights: [
    { p: [-1.1, 2.3, ZR + 1.7], c: [.62, .58, 1.2], k: 1.7, r: 1.3, shadow: .7 },   /* the gallery's light, raking across the salt */
    { p: [-1.86, 2.2, ZR - .2], c: [.62, .58, 1.2], k: .07, r: .2, shadow: .6 },   /* its spill, catching the crack's lips and its far inner wall */
    { p: [-2.04, 2.52, ZR + .035], c: [.62, .58, 1.2], k: .01, r: .03 },           /* the little of it that gets far into the crack, onto the pale thing */
    { p: [-.5, 1.4, ZR - 3], c: [.3, .28, .66], k: .3, r: 2.5 },                    /* faint fill from behind */
  ],
  glsl: /* glsl */ `
  const float ZR = ${ZR.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(2.4, 3.2, p.y));
    d.x += wl * (rough(p, .018, 7.) + rough(p, .006, 23.));
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : (p.y < 3.2 ? M_SALT : M_ROCK), NOUV);
    gTint = vec3(1. - .6 * smoothstep(2.4, 3.1, p.y)) * mix(.3, 1., smoothstep(1.15, 1.75, p.y)) * mix(.28, 1., smoothstep(1.65, 2.1, p.y));   /* dark below, where the light doesn't reach */
    /* the lone ring below */
    vec2 rq = vec2(p.z - ZR, p.y - 1.66);
    if (p.x < -1.6) { float rr = abs(length(rq) - .15); d.x += engrave(rr, .017, .016); if (rr < .018) gPolish = .6 * smoothstep(-.01, .01, rq.x); }   /* lit on one flank only */
    /* the crack: two fingers wide, wandering up from over the ring, going back into the dark */
    float cz = ZR + .02 + (fbm(vec2(p.y * 5., 3.), 3) - .5) * .06 + (p.y - 1.9) * .03;
    float w = (.028 + .012 * fbm(vec2(p.y * 14., 7.), 2)) * smoothstep(1.8, 1.88, p.y) * (1. - smoothstep(2.8, 3.1, p.y)) * (1. + .6 * smoothstep(2., 2.8, p.y));
    float dz = abs(p.z - cz) + (fbm(vec2(p.x * 30., p.y * 12.), 3) - .5) * .018 * smoothstep(-2., -2.15, p.x);   /* its inner walls broken, stepping in */
    float crack = min(w * mix(1., .55, smoothstep(-2., -2.4, p.x)) - dz, p.x + 2.42);   /* narrowing as it goes back */
    d = A(d, vec4(min(crack, min(p.y - 1.78, 3.1 - p.y)), M_SALT, NOUV));
    if (p.x < -1.99 && p.y > 1.79 && abs(p.z - cz) < w + .01) gTint = vec3(mix(1.15, .03, smoothstep(-1.98, -2.36, p.x)));   /* its lips lit, then dark as it goes in */
    /* far back in it, something pale, too far in to reach */
    vec3 pq = p - vec3(-2.07, 2.45, cz + .025); pq.xy = vec2(.8 * pq.x - .6 * pq.y, .6 * pq.x + .8 * pq.y);
    vec4 pale = vec4((length(pq / vec3(.004, .018, .005)) - 1.) * .004, M_PAPER, NOUV);    /* a sliver, edge on */
    if (pale.x < d.x) { d = pale; gTint = vec3(1.3, 1.27, 1.22); gPolish = .8; }
    /* beside the crack, a count, cut small */
    if (p.x < -1.7 && abs(p.y - 2.08) < .05 && p.z > ZR + .07 && p.z < ZR + .21) {
      float k = floor((p.z - ZR - .07) / .028), sz = p.z - ZR - .07 - (k + .5) * .028 + (h2(vec2(k, 3.)) - .5) * .01;   /* each stroke its own: spacing, length, lean */
      float yy = p.y - 2.08 - (h2(vec2(k, 6.)) - .5) * .012; sz += yy * (h2(vec2(k, 8.)) - .5) * .5;
      d.x += engrave(length(vec2(sz, max(abs(yy) - .014 - .014 * h2(vec2(k, 1.)), 0.))), .005, .006);
    }
    return d;
  }`,
  anchors: {
    glints: [[-2.3, 2.32, ZR + .02], [-1.97, 1.78, ZR + .12], [-1.96, 2.05, ZR - .2], [-1.97, 1.95, ZR - .3]].map(p => ({ p })),
    beam: [{ p: [-1.85, 2.3, ZR + .05], w: .2 }],
  },
  live: { motes: 'violet' },
};
