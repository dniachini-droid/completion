/* SEALED (D-015). pt-b-2.A, the Salt Gallery further in, round 1 (week 1's salt): the tally runs on along
   the left wall, cut in a band of stone a hand's width proud of the salt, at a man's chest; above it, one
   ring alone, larger than the others, catching the light before anything near it. Her sheets stop here: no
   pencil ticks on this stretch. The one light is the gallery's cold violet, from further in on the right,
   raking along the wall so every cut shows its shadow. Eye height; the gallery runs away to the right. */
const ZR = 3.4;                                                     /* where the lone ring is */
export default {
  id: 'pt-b-2.A',
  name: 'The Salt Gallery, further in',
  line: '',
  cam: { x: -.75, y: 1.5, z: 1.5, pitch: 1, yaw: -30, f: .66, cx: .5, cy: .5 },
  far: 45, fogK: 1 / 28, hazeFar: [.1, .09, .26],
  bloomAt: [.6, 1.3, 36], bloomPow: 14, bloomC: [.36, .33, .7],
  glow: { threshold: .62, k: .6 },
  blur: { d0: 4, d1: 18 },
  expo: 1.7, grade: [1.1, 1, .9], grain: .4, shadowJitter: 1,
  salt: { pink: 0 },
  lights: [
    { p: [1.3, 1.9, 11], c: [.62, .58, 1.2], k: 16, r: 4.5, shadow: 1 },          /* the gallery's light, further in on the right, raking back along the wall */
    { p: [.4, 1.6, 34], c: [.62, .58, 1.2], k: 26, r: 9 },                        /* far down the gallery */
    { p: [-1.5, 1.95, ZR + .5], c: [.62, .58, 1.2], k: 1.1, r: .32, shadow: 1 },  /* the same light, catching the ring first */
    { p: [0, 1.6, -5], c: [.3, .28, .66], k: .5, r: 3 },                          /* faint fill from behind */
  ],
  glsl: /* glsl */ `
  const float ZR = ${ZR.toFixed(2)};
  /* the tally: short cuts in a row along the band; bars, bars with a tick, small rings, drops; none twice alike */
  float tally(vec2 w) {
    float cell = .055, k = floor(w.x / cell), fx = w.x - (k + .5) * cell, y = w.y;
    float kind = h2(vec2(k, 13.)), j = (h2(vec2(k, 2.)) - .5) * .008;
    float bar = length(vec2(fx + j, max(abs(y) - .026, 0.)));
    float d = bar;
    if (kind > .7) d = min(bar, length(vec2(fx + j - .01 - (y - .012), max(abs(y - .012) - .008, 0.))) );   /* a bar with a tick */
    if (kind > .92) d = abs(length(vec2(fx, y)) - .014);                                                 /* a small ring */
    if (kind < .12) d = length(vec2(fx + j, max(abs(y + .01) - .014 * (1. - (y + .024) / .05), 0.)));    /* a drop, tapering up */
    if (h2(vec2(k, 31.)) < .08) d = 1.;                                                                  /* a gap, as between words */
    return d;
  }
  vec4 scene(vec3 p) {
    vec4 d = hallAir(p, 2., 2.6, 2.3, -10., 60., M_ROCK);
    /* rock salt on the walls: uneven beds, pushed in and out a little */
    float wl = smoothstep(1.4, 1.9, abs(p.x)) * (1. - smoothstep(2.4, 3.2, p.y));
    d.x += wl * rough(p, .05, 5.);
    d.yzw = vec3(p.y < .05 && abs(p.x) < 1.8 ? M_FLOOR : (p.y < 3.2 ? M_SALT : M_ROCK), NOUV);
    gTint = vec3(1. - .72 * smoothstep(1.8, 3., p.y));                                  /* the salt goes dark as it rises; the roof darker */
    if (p.y < 1.2 && p.x < -1.7) gTint *= mix(.5, 1., smoothstep(.2, 1.2, p.y));        /* under the band, in its shadow */
    if (p.y < .05) gTint *= mix(.55, 1., smoothstep(2., 6., p.z));                      /* the near floor, out of the light */
    /* the band that carries the tally: cut stone, a hand's width proud of the salt, at a man's chest */
    float by = 1.28 + .015 * sin(p.z * .7);
    vec4 band = box(p, vec3(-1.93, by, 20.), vec3(.1, .065, 40.), M_DRESSED); band.x -= .008;
    if (band.x < d.x) { d = band; gTint = vec3(.95); }
    /* its face: the tally, one row, clean-cut, the same depth throughout */
    if (p.x < -1.8 && abs(p.y - by) < .06) d.x += engrave(tally(vec2(p.z, p.y - by)), .0045, .006);
    /* above it, one ring alone, larger than the others: one cut, with no place where it starts or stops */
    vec2 rq = vec2(p.z - ZR, p.y - 1.66);
    if (p.x < -1.6) {
      float rr = abs(length(rq) - .12);
      d.x += engrave(rr, .017, .016);
      if (rr < .018) { gPolish = .7; gTint = vec3(1.15); }                                /* its cut clean and bright, the salt's crystals fresh in it */
    }
    return d;
  }`,
  anchors: {
    glints: [[-1.95, 1.66, ZR + .1], [-1.95, 1.56, ZR], [-1.93, 1.9, ZR + 1.3], [-1.95, .8, ZR + 2], [-1.94, 1.1, ZR + 3.4], [-1.95, 1.7, ZR - .8]].map(p => ({ p })),
    fog: [{ p: [0, .25, ZR + 6], w: 1.4, h: .18, a: .16 }, { p: [.5, .3, ZR + 14], w: 1.3, h: .2, a: .12, speed: .6 }],
  },
  live: { motes: 'violet', fog: 'low' },
};
