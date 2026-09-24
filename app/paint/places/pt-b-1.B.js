/* SEALED (D-015). pt-b-1.B, the corner, round 3: where the Lamp Hall bends right toward the gallery.
   Two troughs a stride apart are worn into the floor along the outer side of the bend, smooth as basins;
   the outer wall beside them is polished by touch to twice a man's shoulder, a soft shine in the matt
   stone, its marks rubbed away, while the wall above it is still cut with marks. The one light is the
   gallery's violet, round the bend; the troughs and the band catch it. Low, near the floor. */
const R = 6, PHI = 1.2, ZC = 20;                                    /* the bend: radius, angle, where it starts */
const P2 = [R - R * Math.cos(PHI), ZC + R * Math.sin(PHI)], T = [Math.sin(PHI), Math.cos(PHI)];
const beyond = k => [P2[0] + T[0] * k, P2[1] + T[1] * k];
const L = beyond(8);
const arcX = (across, ph) => R - (R - across) * Math.cos(ph), arcZ = (across, ph) => ZC + (R - across) * Math.sin(ph);
export default {
  id: 'pt-b-1.B',
  name: 'The corner',
  line: '',
  cam: { x: -1.15, y: .42, z: 13.5, pitch: -4, yaw: 11, f: .62, cx: .5, cy: .5 },
  far: 50, fogK: 1 / 26,
  hazeBase: [.018, .016, .05], hazeFar: [.07, .063, .18],
  bloomAt: [beyond(12)[0], 1.2, beyond(12)[1]], bloomPow: 24, bloomC: [.56, .5, .86],
  bloom: { alpha: .18 },
  glow: { threshold: .6, k: .5 },
  blur: { d0: 9, d1: 26 },
  sheen: .1, grain: .3, grade: [1.12, .98, .86],
  amb: .55, expo: 1.6,
  lights: [
    { p: [L[0], .5, L[1]], c: [.62, .58, 1.2], k: 190, r: 9, shadow: .8 },     /* low, so it grazes the floor */     /* the gallery's light, round the bend */
    { p: [beyond(1.5)[0], 3.5, beyond(1.5)[1]], c: [.44, .41, .9], k: 18, r: 4 }, /* its spill at the turn */
    { p: [0, 4, 9], c: [.3, .28, .66], k: 9, r: 6 },
    { p: [arcX(-1.6, .6), 1.6, arcZ(-1.6, .6)], c: [.44, .41, .9], k: 6, r: 3 },   /* the lit wall's bounce onto the inner wall */                             /* the hall behind, faint */
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
    w /= vec2(.35, .5); vec2 c = floor(w), f = fract(w) - .5;
    f.x += (h2(c + 2.) - .5) * .3; f.y += (h2(c + 9.) - .5) * .2;
    float ln = length(vec2(f.x + f.y * .5 * (h2(c) - .5), max(abs(f.y) - .12 - .12 * h2(c + 4.), 0.))) * .35;
    return h2(c + 5.) < .3 ? engrave(ln, .014, .012) : 0.;
  }
  vec4 scene(vec3 p) {
    vec2 b = bend(p);
    vec3 h = vec3(b.x, p.y, b.y);
    vec4 d = hallAir(h, 2.7, 6., 12.47, -10., 70., M_CUT);
    /* the troughs: two smooth hollows a stride apart, worn deepest at the bend, fading out at both ends */
    float fade = smoothstep(ZC - 14., ZC - 4., b.y) * (1. - smoothstep(ZC + 8., ZC + 14., b.y));
    float s = abs(b.x + 1.15) - .42, e = s / .22, q = max(0., 1. - e * e), dep = .15 * fade * sqrt(q);
    d = A(d, vec4(min(p.y + dep, .3 - abs(s)) * .5, M_FLOOR, NOUV));
    if (p.y < .05 && q > 0.) gPolish = .9 * sqrt(q) * fade;
    /* the band: rubbed smooth to twice a shoulder on the outer wall; above it, marks */
    float top = 2.9 + (vn(vec2(b.y * 1.1, 3.)) - .5) * .3;
    float along = smoothstep(ZC - 9., ZC - 4., b.y) * (1. - smoothstep(ZC + 8., ZC + 12., b.y));
    if (b.x < -2.5 && p.y > .02) gPolish = .95 * along * (1. - smoothstep(top - .25, top + .1, p.y));
    float dw = -2.7 - b.x;
    if (p.y > top && p.y < 4.6 && dw > -.1) d.x += marks(vec2(b.y, p.y));
    return d;
  }`,
  anchors: {
    fog: [{ p: [beyond(2)[0], 1.1, beyond(2)[1]], w: 1.3, h: .38, a: .26 }, { p: [-.5, .3, 19], w: 1.2, h: .2, a: .12, speed: .6 }],
    glints: [beyond(3), beyond(4.5), beyond(6), beyond(7.5)].map(([x, z], i) => ({ p: [x - (1.2 + .5 * (i % 2)) * T[1], .06, z + (1.2 + .5 * (i % 2)) * T[0]], r: 1.6 })),
  },
  live: { fog: 'far', motes: 'violet' },
};
