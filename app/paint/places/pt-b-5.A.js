/* SEALED (D-015). pt-b-5.A, the tally, from the head (the Salt Gallery of pt-b-2.A, reused, in the cups' light).
   Standing where the tally begins, at the head of its band, looking along it: the band of cut stone at a man's
   chest runs away down the left wall, and every record on it starts the same way (the bar with a tick, a ring,
   a single drop), then runs on in its own marks to a gap. The three head marks are cut fresh and clean, so the
   eye finds them repeating down the wall, smaller and smaller. The light is the cups' glow along the wall
   (warm, from behind you, raking forward); the gallery beyond goes on in its own cold violet. */
import room from './pt-b-2.A.js';

const V = [.62, .58, 1.2], WM = [1, .8, .56];
export const CELL = .075;
export default {
  ...room,
  id: 'pt-b-5.A',
  name: 'The tally, from the head',
  line: '',
  cam: { x: -.95, y: 1.45, z: -.5, pitch: -8, yaw: -36, f: .7, cx: .5, cy: .5 },
  bloomC: [.26, .24, .55],
  salt: { pink: .3 },
  sheen: .05, gold: .8, expo: 1.8, grade: [1, 1, 1],
  blur: { px: 1.8, d0: 3.5, d1: 16, k: .85 },
  lights: [
    { p: [-.7, 1.3, -1.6], c: WM, k: .6, r: 1.2, shadow: .7 },                        /* the cups' glow, from behind you along the wall */
    { p: [-1.55, 1.3, -.2], c: WM, k: .16, r: .45, shadow: 1, reach: 4.5 },           /* its reach along the band, raking the cuts */
    { p: [.6, 1.9, 10], c: V, k: 5, r: 4, shadow: .5 },                                  /* the gallery's violet, further in */
    { p: [.4, 1.6, 34], c: V, k: 12, r: 9 },                                             /* far down the gallery */
    { p: [1.5, 2.4, 1.5], c: [.36, .33, .76], k: 1.2, r: 2.5 },                         /* cold fill on the right wall */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float CELL = ${CELL.toFixed(3)};
  /* the tally, in records: each opens with the same three marks (bar with a tick, ring, drop), then its own
     marks, then a gap. Returns (distance to the nearest cut, 1 if it is one of the three head marks) */
  vec2 records(vec2 w) {
    float k = floor(w.x / CELL);
    /* records of 7 to 12 cells and a gap; find where this cell's record starts */
    float s = 0., len = 0.;
    for (int i = 0; i < 12; i++) { len = 8. + floor(h2(vec2(float(i), 71.)) * 6.); if (k < s + len) break; s += len; }
    float j = k - s, fx = w.x - (k + .5) * CELL, y = w.y;
    float jit = (h2(vec2(k, 2.)) - .5) * .008;
    float bar = length(vec2(fx + jit, max(abs(y) - .032, 0.)));
    float tick = min(bar, length(vec2(fx - .014 - (y - .016) * .9, max(abs(y - .016) - .011, 0.))));
    float ring = abs(length(vec2(fx, y)) - .018);
    float drop = length(vec2(fx, max(abs(y + .01) - .018 * (1. - (y + .03) / .06), 0.)));
    if (j < .5) return vec2(tick, 1.);
    if (j < 1.5) return vec2(ring, 1.);
    if (j < 2.5) return vec2(drop, 1.);
    if (j > len - 1.5) return vec2(1., 0.);                                                /* the gap before the next record */
    float kind = h2(vec2(k, 13.));
    float d = bar;
    if (kind > .62) d = tick;
    if (kind > .9) d = ring;
    if (kind < .14) d = drop;
    return vec2(d, 0.);
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    /* the old tally of the room is replaced: the band's face refilled, then cut again in records */
    float by = 1.28 + .015 * sin(p.z * .7) + .012 * sin(p.z * 1.9 + 1.) + (vn(vec2(p.z * 3., 1.)) - .5) * .01;
    if (floor(d.y + .5) == M_DRESSED) {
      if (p.x < -1.8 && abs(p.y - by) < .06) d.x -= engrave(tally(vec2(p.z, p.y - by)), .0045, .006);
      gTint *= .85;
    }
    if (floor(d.y + .5) == M_DRESSED && p.x < -1.8 && abs(p.y - by) < .06 && p.z > 0.) {
      vec2 r = records(vec2(p.z - .06, p.y - by));
      d.x += engrave(r.x, .0065, .009);
      if (r.y > .5 && r.x < .008) { gPolish = .8; gTint = vec3(1.35); }                   /* the head marks cut clean, the stone fresh in them */
    }
    gTint *= mix(1., .35, smoothstep(1.4, 2.4, p.y));                                        /* the salt going up out of the light */
    if (p.x < -1.5 && floor(d.y + .5) == M_SALT) gTint *= .85 + .25 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds */
    if (p.y < .05) gTint *= mix(.35, 1., smoothstep(0., 7., p.z));                          /* the near floor kept down */
    if (p.y < 1.1 && p.x < -1.5) gTint *= mix(.5, 1., smoothstep(.2, 1.1, p.y));          /* the wall's foot */
    if (p.x > 1.5) gTint *= .7;                                                            /* the far wall quiet */
    return d;
  }`,
  anchors: {
    glints: [[-1.95, 1.7, 2.2], [-1.93, 1.6, 3.6], [-1.95, 1.0, 3], [-1.94, 1.1, 5.4], [-1.95, 1.8, 6.5]].map(p => ({ p })),
    fog: [{ p: [-1.7, .25, 6], w: 1.4, h: .18, a: .14 }, { p: [-1.5, .3, 12], w: 1.3, h: .2, a: .1, speed: .6 }],
  },
  live: { motes: 'gold', fog: 'low' },
};
