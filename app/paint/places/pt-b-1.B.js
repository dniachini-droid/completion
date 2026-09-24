/* SEALED (D-015). pt-b-1.B, the corner: where the Lamp Hall bends right toward the gallery.
   Two troughs a stride apart are worn into the floor along the outer side of the bend; the outer
   wall beside them is rubbed smooth and pale to twice a man's shoulder, its marks gone, while the
   wall above is still cut with marks. The one light is the gallery's violet, round the bend. */
const R = 6, PHI = 1.2, ZC = 20;                                    /* the bend: radius, angle, where it starts */
const P2 = [R - R * Math.cos(PHI), ZC + R * Math.sin(PHI)], T = [Math.sin(PHI), Math.cos(PHI)];
const beyond = k => [P2[0] + T[0] * k, P2[1] + T[1] * k];
const L = beyond(9);
const arc = (across, ph, y) => [R - (R - across) * Math.cos(ph), y, ZC + (R - across) * Math.sin(ph)];
export default {
  id: 'pt-b-1.B',
  name: 'The corner',
  line: '',
  cam: { x: -1, y: .5, z: 11, pitch: 5, yaw: 6, f: .6, cx: .5, cy: .5 },
  far: 50, fogK: 1 / 28,
  bloomAt: [L[0], 1, L[1]], bloomPow: 16, bloomC: [.44, .41, .8],
  glow: { threshold: .6, k: .8 },
  blur: { d0: 8, d1: 26 },
  sheen: .12,
  expo: 1.9, grade: [1.1, 1, .9],
  lights: [
    { p: [L[0], 1.6, L[1]], c: [.62, .58, 1.2], k: 420, r: 10, shadow: .7 },   /* the gallery's light, round the bend */
    { p: [0, 5, 13], c: [.34, .31, .74], k: 6, r: 6 },                         /* haze before the bend */
    { p: arc(-2.05, .45, 1.5), c: [.52, .49, .95], k: 1.6, r: 1.1 },           /* the sheen on the band, where it faces the light */
    { p: arc(-2.05, .8, 1.5), c: [.52, .49, .95], k: 1.4, r: 1.1 },
  ],
  glsl: /* glsl */ `
  const float R = ${R}., PHI = ${PHI}, ZC = ${ZC}.;
  /* (across, along) the bent hall: across is negative toward the outer wall */
  vec2 bend(vec3 p) {
    if (p.z < ZC) return vec2(p.x, p.z);
    vec2 q = p.xz - vec2(R, ZC), P2 = vec2(${P2[0].toFixed(3)}, ${P2[1].toFixed(3)}), T = vec2(${T[0].toFixed(4)}, ${T[1].toFixed(4)});
    float ph = atan(q.y, -q.x), a = dot(p.xz - P2, T);
    if (a < 0.) return vec2(R - length(q), ZC + R * ph);
    return vec2(dot(p.xz - P2, vec2(T.y, -T.x)), ZC + R * PHI + a);
  }
  /* marks cut in the outer wall within reach; none where the band is */
  float marks(vec2 w, float band) {
    w /= vec2(.16, .3); vec2 c = floor(w), f = fract(w) - .5;
    f.x += (h2(c + 2.) - .5) * .5; f.y += (h2(c + 9.) - .5) * .3;
    float g = max(abs(f.x + f.y * .5 * (h2(c) - .5)) - .06, abs(f.y) - .16 - .2 * h2(c + 4.)) * .16;
    return h2(c + 5.) < .55 && band < .5 ? -g : -1.;
  }
  vec4 scene(vec3 p) {
    vec2 b = bend(p);
    vec3 h = vec3(b.x, p.y, b.y);
    vec4 d = hallAir(h, 2.7, 6., 12.47, -10., 70., M_CUT);
    /* the troughs: two smooth hollows a stride apart, fading out at both ends */
    float fade = smoothstep(ZC - 13., ZC - 5., b.y) * (1. - smoothstep(ZC + 9., ZC + 14., b.y));
    float s = abs(b.x + 1.) - .4, e = s / .3, q = max(0., 1. - e * e), dep = .14 * fade * q * q;
    d = A(d, vec4(min(p.y + dep, .3 - abs(s)) * .8, M_FLOOR, NOUV));
    /* the band: rubbed smooth and pale to twice a shoulder, on the outer wall of the bend */
    float top = 2.95 + (vn(vec2(b.y * 1.3, 3.)) - .5) * .25;
    float band = p.y > .02 && p.y < top && b.x < -2.55 && b.y > ZC - 5. && b.y < ZC + 12. ? 1. : 0.;
    float dw = -2.7 - b.x;
    if (p.y > .3 && p.y < 4.2) d = A(d, vec4(min(marks(vec2(b.y, p.y), band), min(.012 - dw, dw + .2)), M_CUT, NOUV));
    if (band > .5) d.yzw = vec3(M_DRESSED, NOUV);
    return d;
  }`,
  anchors: {
    fog: [{ p: [beyond(2)[0], 1, beyond(2)[1]], w: 1.2, h: .35, a: .22 }, { p: [.5, .5, 19], w: 1.2, h: .2, a: .12, speed: .6 }],
    glints: [beyond(5), beyond(7), beyond(10), beyond(12)].map(([x, z], i) => ({ p: [x + (i % 2 ? 2.2 : -2.2) * T[1], .4 + i * .35, z - (i % 2 ? 2.2 : -2.2) * T[0]] })),
  },
  live: { fog: 'far', motes: 'violet' },
};
