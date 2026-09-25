/* SEALED (D-015). pt-cv-01, camp view: the ladder's foot. At the bottom of the brick shaft, looking up it: the
   brick walls closing to a small square of pale grey sky, the only daylight in the MVP; the iron ladder up the
   right-hand wall, rung after rung. On the brick in front, a little above head height, a chalk arrow pointing up
   and 40 FT beside it: the look-at, the sharpest thing in the frame. Quieter than the places: one form, one light
   (the daylight from above). */

const TOP = 12.2;                                                   /* 40 ft of shaft */
const C = [-.3, .78], LX = .24;                                             /* the chalk, on the front wall (z = +.55): its centre (x, y) */

export default {
  id: 'pt-cv-01',
  name: "The ladder's foot",
  line: '',
  cam: { x: -.02, y: .42, z: -.48, pitch: 50, yaw: 0, f: .44, cx: .5, cy: .31 },
  far: 20, fogK: 1 / 40, sheen: 0, expo: 2.3, amb: 1.6, ambC: [.8, .8, 1.5],
  hazeBase: [.012, .012, .03], hazeFar: [.05, .05, .08],
  bloomAt: [0, 16, 0], bloomPow: 60, bloomC: [.05, .05, .06],
  bloom: { alpha: .12 }, glow: { threshold: .7, k: .45 },
  blur: { px: 1.4, d0: 3, d1: 11, k: .8 },
  grain: .4, shadowJitter: 1,
  beam: { x: 0, z: 0, r: .5, k: .045, c: [.6, .62, .75], top: 12 },
  lights: [
    { p: [0, TOP + 1.5, 0], c: [.36, .37, .43], k: 75, r: 2.2, shadow: .6 },        /* the daylight: the square of sky above */
    { p: [.1, 8.5, -.1], c: [.55, .56, .75], k: 12, r: 2.4 },
    { p: [-.1, 3.4, -.1], c: [.5, .51, .7], k: 2.4, r: 1.6 },                        /* and lower down, fainter */
    { p: [LX, 3.2, .05], c: [.62, .63, .8], k: .6, r: .6, reach: 3.2 },            /* the sky's grey on the rungs' faces */                         /* its grey falling down the shaft */
    { p: [-.3, 1.3, .2], c: [.85, .87, 1.], k: .06, r: .25, shadow: .4, reach: .8 },   /* a little of it, grazing the chalk */
  ],
  glsl: /* glsl */ `
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.)); }
  /* the chalk: an arrow pointing up, and 40 FT beside it (letters 9 cm tall), in the wall's plane (x, y) */
  float chalk(vec2 q) {
    float e = 1e3;
    vec2 a = q - vec2(-.2, 0.);
    e = min(e, seg(a, vec2(0, -.13), vec2(0, .13)));
    e = min(e, seg(a, vec2(0, .135), vec2(-.05, .07)));
    e = min(e, seg(a, vec2(0, .135), vec2(.052, .075)));
    float h = .09, w = .055;
    vec2 o = q - vec2(-.1, -h * .5);
    /* 4 */
    e = min(e, seg(o, vec2(w * .75, 0), vec2(w * .72, h)));
    e = min(e, seg(o, vec2(w * .72, h), vec2(0, h * .33)));
    e = min(e, seg(o, vec2(0, h * .33), vec2(w, h * .33)));
    /* 0 */
    o.x -= w * 1.5;
    { vec2 z = (o - vec2(w * .5, h * .5)) / vec2(w * .5, h * .5); e = min(e, abs(length(z) - 1.) * w * .45); }
    /* F */
    o.x -= w * 2.1;
    e = min(e, seg(o, vec2(0), vec2(.002, h)));
    e = min(e, seg(o, vec2(.002, h), vec2(w * .9, h * .98)));
    e = min(e, seg(o, vec2(0, h * .52), vec2(w * .7, h * .52)));
    /* T */
    o.x -= w * 1.35;
    e = min(e, seg(o, vec2(0, h), vec2(w, h * 1.02)));
    e = min(e, seg(o, vec2(w * .5, h), vec2(w * .52, 0)));
    return e;
  }
  vec4 scene(vec3 p) {
    /* the shaft: a square of brick, open to the sky at the top */
    vec3 q = vec3(.55) - abs(p - vec3(0, 0, 0));
    float air = min(q.x, q.z);
    air = min(air, p.y);
    vec4 d = vec4(air, M_CUT_SMALL, NOUV);
    /* brick courses: 7.5 cm, bricks 22 cm, laid from each wall's own axis */
    bool xw = abs(p.x) > abs(p.z);
    vec2 bu = vec2((xw ? p.z : p.x) * 6.4 + (xw ? 3.1 : 0.), p.y * 9.3);
    if (p.y > .02) { d.zw = bu; d.x += rough(p, .004, 18.); }                      /* old brick: each face a little uneven */
    /* the sky: past the shaft's mouth, pale grey */
    d = U(d, vec4(TOPY + 1.6 - p.y, M_GLOW, NOUV));
    if (p.y > .02) {
      float n = fbm(bu * .8, 3);
      gTint = vec3(.84, .76, .76) * (.75 + .4 * h2(floor(vec2(bu.x / 1.4 + floor(bu.y / .7) * .5, bu.y / .7))));   /* each brick its own shade, muted */
      gTint *= .85 + .3 * n;
      gTint *= mix(.5, 1., smoothstep(0., 8., p.y));                              /* the foot of the shaft in its own dark */
    }
    if (p.y < .02) gTint = vec3(.45) * (.7 + .5 * fbm(p.xz * 8., 3));                 /* the floor: grit and a little rubble */
    /* the ladder: two round iron rails and round rungs, standing off the front wall on stays, its feet on the floor */
    vec3 lq = p - vec3(${LX.toFixed(2)}, 0., .42);
    float rails = length(vec2(abs(lq.x) - .21, lq.z)) - .016;
    rails = max(rails, -p.y); rails = max(rails, p.y - TOPY - .4);
    float ry = mod(p.y - .3, .3) - .15;
    float rung = length(vec2(lq.z, ry)) - .016; rung = max(rung, abs(lq.x) - .21);
    rung = max(rung, .2 - p.y);
    float stays = length(vec2(abs(lq.x) - .21, mod(p.y - 1., 1.8) - .9)) - .011; stays = max(stays, max(-lq.z, lq.z - .13));
    vec4 lad = vec4(min(min(rails, rung), stays), M_TIN, NOUV);
    if (lad.x < d.x) { d = lad; gTint = vec3(.62, .52, .46) * (.8 + .4 * fbm(p.xy * 30., 2));
      if (rung < min(rails, stays) + .001) gTint = vec3(1.15, 1.05, .98) * mix(.55, 1., smoothstep(-.012, .012, ry)) * (1. + 1.6 * smoothstep(.008, .016, ry)); }   /* each rung round, lit along its upper edge by the sky */
    /* the chalk on the front wall: dry white strokes, a little broken */
    if (p.z > .53 && p.y > .4 && p.y < 1.2 && p.x < .0 && d.x < .01) {
      vec2 cq = vec2(p.x - ${C[0].toFixed(3)}, p.y - ${C[1].toFixed(3)});
      float e = chalk(cq / .8) * .8 + (fbm(cq * 300., 2) - .5) * .004;
      float k = (1. - smoothstep(.004, .0075, e)) * (.72 + .28 * smoothstep(.35, .6, fbm(cq * 140., 3)));
      gTint = mix(gTint, vec3(4.2, 4.2, 4.5), k);
    }
    return d;
  }`.replaceAll('TOPY', TOP.toFixed(2)),
  anchors: {
    beam: [{ p: [0, 3.2, 0], w: .5 }, { p: [0, 6, 0], w: .4 }],
    glints: [{ p: [LX + .21, 1.2, .42] }],
  },
  live: { motes: 'violet' },
};
