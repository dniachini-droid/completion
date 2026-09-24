/* SEALED (D-015). pt-b-1.B, the corner, round 2: where the Lamp Hall bends right toward the gallery.
   Two troughs a stride apart are worn into the floor along the outer side of the bend, smooth as basins;
   the outer wall beside them is polished by touch to twice a man's shoulder, a soft shine in the matt
   stone, its marks rubbed away, while the wall above it is still cut with marks. The one light is the
   gallery's violet, round the bend; the troughs and the band catch it. Low, near the floor. */
const R = 6, PHI = 1.2, ZC = 20;                                    /* the bend: radius, angle, where it starts */
const P2 = [R - R * Math.cos(PHI), ZC + R * Math.sin(PHI)], T = [Math.sin(PHI), Math.cos(PHI)];
const beyond = k => [P2[0] + T[0] * k, P2[1] + T[1] * k];
const L = beyond(8);
export default {
  id: 'pt-b-1.B',
  name: 'The corner',
  line: '',
  cam: { x: -1.2, y: .55, z: 13.5, pitch: -3, yaw: 11, f: .62, cx: .5, cy: .5 },
  far: 50, fogK: 1 / 26,
  hazeBase: [.018, .016, .05], hazeFar: [.1, .09, .26],
  bloomAt: [L[0], 1.4, L[1]], bloomPow: 14, bloomC: [.5, .46, .9],
  bloom: { alpha: .18 },
  glow: { threshold: .6, k: .8 },
  blur: { d0: 9, d1: 26 },
  sheen: .1, grain: .5, grade: [1.08, 1, .95],
  amb: .55, expo: 1.8,
  lights: [
    { p: [L[0], 1.8, L[1]], c: [.62, .58, 1.2], k: 380, r: 9, shadow: .8 },     /* the gallery's light, round the bend */
    { p: [beyond(1.5)[0], 3.5, beyond(1.5)[1]], c: [.44, .41, .9], k: 18, r: 4 }, /* its spill at the turn */
    { p: [0, 4, 9], c: [.3, .28, .66], k: 9, r: 6 },                             /* the hall behind, faint */
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
  /* marks cut in the outer wall above the band */
  float marks(vec2 w) {
    w /= vec2(.16, .3); vec2 c = floor(w), f = fract(w) - .5;
    f.x += (h2(c + 2.) - .5) * .5; f.y += (h2(c + 9.) - .5) * .3;
    float g = max(abs(f.x + f.y * .5 * (h2(c) - .5)) - .07, abs(f.y) - .16 - .2 * h2(c + 4.)) * .16;
    return h2(c + 5.) < .5 ? -g : -1.;
  }
  vec4 scene(vec3 p) {
    vec2 b = bend(p);
    vec3 h = vec3(b.x, p.y, b.y);
    vec4 d = hallAir(h, 2.7, 6., 12.47, -10., 70., M_CUT);
    /* the troughs: two smooth hollows a stride apart, worn deepest at the bend, fading out at both ends */
    float fade = smoothstep(ZC - 14., ZC - 4., b.y) * (1. - smoothstep(ZC + 8., ZC + 14., b.y));
    float s = abs(b.x + 1.15) - .42, e = s / .22, q = max(0., 1. - e * e), dep = .06 * fade * q;
    d = A(d, vec4(min(p.y + dep, .3 - abs(s)) * .9, M_FLOOR, NOUV));
    if (p.y < .05 && q > 0.) gPolish = .9 * sqrt(q) * fade;
    /* the band: rubbed smooth to twice a shoulder on the outer wall; above it, marks */
    float top = 2.9 + (vn(vec2(b.y * 1.1, 3.)) - .5) * .3;
    float along = smoothstep(ZC - 9., ZC - 4., b.y) * (1. - smoothstep(ZC + 8., ZC + 12., b.y));
    if (b.x < -2.5 && p.y > .02) gPolish = .95 * along * (1. - smoothstep(top - .25, top + .1, p.y));
    float dw = -2.7 - b.x;
    if (p.y > top && p.y < 4.6) d = A(d, vec4(min(marks(vec2(b.y, p.y)), min(.014 - dw, dw + .2)), M_CUT, NOUV));
    return d;
  }`,
  anchors: {
    fog: [{ p: [beyond(2)[0], 1.1, beyond(2)[1]], w: 1.3, h: .38, a: .26 }, { p: [-.5, .3, 19], w: 1.2, h: .2, a: .12, speed: .6 }],
    glints: [beyond(6), beyond(8), beyond(10), beyond(12)].map(([x, z], i) => ({ p: [x + (i % 2 ? 2.2 : -2.2) * T[1], .5 + i * .3, z - (i % 2 ? 2.2 : -2.2) * T[0]], r: 1.6 })),
  },
  live: { fog: 'far', motes: 'violet' },
};
