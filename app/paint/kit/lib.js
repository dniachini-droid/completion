/* ==========================================================================
   The painting kit: the shared hand (D-057, D-058).

   The method of the approved hall (design/directions/d-combined/hall.js),
   made reusable: lit masses from a few point lights, relief from cut stone,
   haze and bloom toward the far light, blur by depth. The hall cast rays
   against one shell; the kit marches rays through any shape a scene file
   builds from the forms below, on the GPU, so a place is a page of code.

   A scene file supplies one GLSL function:
     vec4 scene(vec3 p)   → (distance to solid, material, u, v)
   Air is positive. u, v lay the stone out on curved surfaces (courses follow
   a vault); give NOUV to let the kit lay it out from the world axes.

   Units are metres. y is up. The camera looks along +z at yaw 0.
   ========================================================================== */

export const MAT = { CUT: 1, CUT_SMALL: 2, ROCK: 3, DRESSED: 4, WATER: 5, GLOW: 6, DARK: 7, FLOOR: 8,
  SALT: 9, CLOTH: 10, LEATHER: 11, TIN: 12, PAPER: 13, WOOD: 14, SLATE: 15 };

export const LIB = /* glsl */ `
#define PI 3.14159265
#define NOUV vec2(-1e4)
#define M_CUT 1.
#define M_CUT_SMALL 2.
#define M_ROCK 3.
#define M_DRESSED 4.
#define M_WATER 5.
#define M_GLOW 6.
#define M_DARK 7.
#define M_FLOOR 8.
/* materials that are not the Site's stone (kit v1, D-072): each its own colour, grain and shine */
#define M_SALT 9.      /* rock salt: banded grey and white (pink at the band edges: the scene's salt.pink), crystalline, glinting */
#define M_CLOTH 10.    /* canvas, wool: matt, a fine weave */
#define M_LEATHER 11.  /* dark brown, creased, a low sheen */
#define M_TIN 12.      /* tin: dull grey, dented, a soft metal shine */
#define M_PAPER 13.    /* paper: pale, matt, fibrous */
#define M_WOOD 14.     /* old wood: dark brown, grain along u */
#define M_SLATE 15.    /* slate or dark fine-grained stone: near-black grey, a dull sheen */

/* Set inside scene() where a surface has them (the kit resets them before each shading):
   gPolish 0..1: stone polished by touch (smoother, paler, a sheen that catches the light);
   gStain  0..1: a flat dark stain (as if by oil, or a shadow that stays): darker, no relief, no shine;
   gTint: a colour to multiply this surface by (a material's own variation, kept muted). */
float gPolish = 0., gStain = 0.;
vec3 gTint = vec3(1);

/* ---------- noise (as the hall) ---------- */
float h2(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p)) + ivec2(40000));
  uint h = q.x * 374761393u + q.y * 668265263u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  return float(h ^ (h >> 16u)) / 4294967296.0;
}
float vn(vec2 p) {
  vec2 i = floor(p), f = p - i, u = f * f * (3. - 2. * f);
  float a = h2(i), b = h2(i + vec2(1, 0)), c = h2(i + vec2(0, 1)), d = h2(i + vec2(1, 1));
  return a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y;
}
float fbm(vec2 p, int o) {
  float s = 0., a = .5, n = 0.;
  for (int i = 0; i < 6; i++) { if (i >= o) break; s += a * vn(p); n += a; p = p * vec2(2.03, 2.01) + vec2(17.1, 3.7); a *= .5; }
  return s / n;
}
float vn3(vec3 p) { return mix(vn(p.xz + floor(p.y) * 7.13), vn(p.xz + (floor(p.y) + 1.) * 7.13), smoothstep(0., 1., fract(p.y))); }
float fbm3(vec3 p, int o) {
  float s = 0., a = .5, n = 0.;
  for (int i = 0; i < 5; i++) { if (i >= o) break; s += a * vn3(p); n += a; p = p * 2.02 + vec3(17.1, 3.7, 9.2); a *= .5; }
  return s / n;
}

/* 3D cells, for crystals: (distance to the nearest seed, to the second, the nearest cell's hash) and its seed */
vec3 cells3(vec3 p, out vec3 seed) {
  vec3 i = floor(p), f = p - i; float d1 = 9., d2 = 9., id = 0.;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(x, y, z), c = i + g;
    float a = h2(c.xy + c.z * 57.13), b = h2(c.yz + c.x * 31.7 + 5.), e = h2(c.zx + c.y * 13.3 + 9.);
    vec3 r = g + vec3(a, b, e) - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = a * .61 + b * .27 + e * .12; seed = c + vec3(a, b, e); } else if (d < d2) d2 = d;
  }
  return vec3(sqrt(d1), sqrt(d2), id);
}

/* ---------- combining ---------- */
vec4 U(vec4 a, vec4 b) { return a.x < b.x ? a : b; }          /* union of solids */
vec4 A(vec4 a, vec4 b) { return a.x > b.x ? a : b; }          /* union of air spaces */
vec4 carve(vec4 air) { return air; }   /* the rock around an air space: inside the air, its value is already the distance to the rock */
float smin(float a, float b, float k) { float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }

/* ---------- forms: air spaces (positive inside the air) ---------- */
/* A pointed-arch section (the hall's shell family) extruded along z.
   w: half width at the springing, s: springing height, r: arch radius (r = w: round; r > w: pointed),
   z0..z1: its length. uv: u = z, v = distance up the wall and over the vault (courses follow it). */
vec4 hallAir(vec3 p, float w, float s, float r, float z0, float z1, float m) {
  float ax = abs(p.x), cx = w - r;
  float inside = p.y < s ? min(w - ax, p.y) : min(r - length(vec2(ax - cx, p.y - s)), p.y);
  inside = min(inside, min(p.z - z0, z1 - p.z));
  float th = atan(p.y - s, ax - cx);
  float v = p.y < s ? p.y : s + r * max(th, 0.);
  return vec4(inside, m, p.z, v);
}
/* A box of air. */
vec4 boxAir(vec3 p, vec3 c, vec3 h, float m) {
  vec3 q = h - abs(p - c);
  return vec4(min(min(q.x, q.y), q.z), m, NOUV);
}
/* A vertical shaft of radius R, from y0 to y1. uv: u around the wall, v = height. */
vec4 shaftAir(vec3 p, vec2 c, float R, float y0, float y1, float m) {
  vec2 d = p.xz - c; float r = length(d);
  float inside = min(R - r, min(p.y - y0, y1 - p.y));
  return vec4(inside, m, atan(d.y, d.x) * R, p.y);
}
/* A round room: a drum of radius R up to height s, under a dome of the same radius. */
vec4 domeAir(vec3 p, vec2 c, float R, float s, float m) {
  vec2 d = p.xz - c; float r = length(d);
  float drum = min(R - r, s - p.y);
  float dome = R - length(vec3(d.x, p.y - s, d.y));
  float inside = min(max(drum, dome), p.y);
  float v = p.y < s ? p.y : s + R * atan(p.y - s, r);
  return vec4(inside, m, atan(d.y, d.x) * R, v);
}
/* A round-headed opening in a wall: arch of half width a, springing at s, in the (t, y) plane. */
float archOpening2(vec2 q, float a, float s) {
  float side = a - abs(q.x);
  float head = a - length(vec2(q.x, q.y - s));
  return min(q.y < s ? side : head, q.y);
}

/* ---------- forms: solids (positive outside the solid) ---------- */
vec4 box(vec3 p, vec3 c, vec3 h, float m) {
  vec3 q = abs(p - c) - h;
  return vec4(length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.), m, NOUV);
}
vec4 column(vec3 p, vec2 c, float r, float y0, float y1, float m) {
  vec2 d = p.xz - c; float dr = length(d) - r;
  float dy = max(y0 - p.y, p.y - y1);
  float dist = length(max(vec2(dr, dy), 0.)) + min(max(dr, dy), 0.);
  return vec4(dist, m, atan(d.y, d.x) * r * 1.5, p.y);
}
/* A straight flight going down along +z: first tread edge at z0, top at y0. */
vec4 stairs(vec3 p, float x0, float x1, float z0, float y0, float tread, float riser, int n, float m) {
  float k = clamp(floor((p.z - z0) / tread), 0., float(n - 1));
  float top = y0 - riser * (k + 1.);
  vec4 b = box(p, vec3((x0 + x1) * .5, top - 3., z0 + (k + .5) * tread), vec3((x1 - x0) * .5, 3., tread * .5), m);
  vec4 b2 = box(p, vec3((x0 + x1) * .5, top - 3. + riser, z0 + (k - .5) * tread), vec3((x1 - x0) * .5, 3., tread * .5), m);
  return U(b, b2);
}
/* A stair winding down round a shaft wall (centre c). r0..r1: its band; y0: its top at angle 0;
   drop: metres per turn; nSteps: steps per turn; turns: how far it goes; slab: thickness under the treads. */
vec4 spiralStair(vec3 p, vec2 c, float r0, float r1, float y0, float drop, float nSteps, float turns, float slab, float m) {
  vec2 d = p.xz - c; float r = length(d);
  float ph = atan(d.y, d.x); if (ph < 0.) ph += 2. * PI;          /* 0..2π, descending with φ */
  float x = (y0 - p.y) / drop * 2. * PI - ph;
  float best = 1e3;
  float dr = max(r0 - r, r - r1);
  float dphi = 2. * PI / nSteps;
  for (int j = 0; j < 2; j++) {
    float k = floor(x / (2. * PI)) + float(j);
    float a = ph + 2. * PI * k;                                     /* unwrapped angle of this turn */
    if (a < 0. || a > turns * 2. * PI) continue;
    float si = floor(a / dphi);
    float top = y0 - drop * (si * dphi) / (2. * PI);
    float bot = y0 - drop * a / (2. * PI) - slab;
    float dy = max(p.y - top, bot - p.y);
    float dd = max(dr, dy);
    /* the riser of the step above, behind this one, keeps the march honest */
    float toRiser = (a - si * dphi) * max(r, .5);
    if (dd > 0.) dd = min(dd, max(toRiser, .02) + max(p.y - (top + drop * dphi / (2. * PI)), 0.) + max(dr, 0.));
    best = min(best, dd);
  }
  return vec4(best, m, NOUV);
}
/* Rough, unworked rock: push a surface in and out. */
float rough(vec3 p, float amp, float scale) { return (fbm3(p * scale, 4) - .5) * amp; }

/* ---------- the hall's stone ---------- */
/* returns (tone, tiltU, tiltV, joint mask) */
vec4 stone(vec2 uv, float fp, float fpv, float courseH, float blockL, float seed) {
  float u = uv.x, v = uv.y;
  float wu = u + (vn(vec2(u * .9 + seed, v * .9)) - .5) * .1, wv = v + (vn(vec2(u * .8, v * .8 + seed)) - .5) * .08;
  float row = floor(wv / courseH), off = h2(vec2(row, seed)) * blockL, bl = blockL * (.8 + .5 * h2(vec2(row, seed + 7.)));
  float col = floor((wu + off) / bl), fu = (wu + off) / bl - col, fv = wv / courseH - row;
  float du = min(fu, 1. - fu) * bl, dv = min(fv, 1. - fv) * courseH;
  float jw = .022;
  float j = min(smoothstep(jw - fp, jw + fp * 1.5 + .004, du), smoothstep(jw - fpv, jw + fpv * 1.5 + .004, dv));
  float br = h2(vec2(col * 31. + row, seed + 3.));
  float tone = .82 + .3 * br;
  float fq = min(fp, fpv * 2.), detail = fq < .04 ? 1. - fq / .04 : 0.;
  float mm = fbm(vec2(u * .45 + seed, v * .45), 3);
  float streak = vn(vec2(u * 1.3 + seed, v * .12));
  float chis = detail > 0. ? (fbm(vec2(u * 9., v * 9.), 3) - .5) * detail : 0.;
  float t = tone * (.78 + .44 * mm) * (1. + .38 * chis);
  float bev = .09, tU = 0., tV = 0.;
  if (du < bev) tU = (fu < .5 ? -1. : 1.) * (1. - du / bev) * .55;
  if (dv < bev) tV = (fv < .5 ? -1. : 1.) * (1. - dv / bev) * .55;
  tU += (h2(vec2(col, row + seed)) - .5) * .18 + chis * .25;
  tV += (h2(vec2(row, col + seed * 3.)) - .5) * .18 + chis * .2;
  const float JD = .62;
  return vec4(t * (JD + (1. - JD) * j) * (.88 + .24 * streak), tU * j, tV * j, j);
}
`;

/* The frame every scene is painted in. Scene GLSL goes between LIB and this. */
export const MAIN = /* glsl */ `
uniform vec2 uRes;
uniform vec3 uCam; uniform float uPitch, uYaw, uF; uniform vec2 uC;
uniform int uN; uniform vec3 uLp[8]; uniform vec3 uLc[8]; uniform float uLk[8], uLr[8], uLair[8], uLsh[8], uLwarm[8];
uniform vec3 uGrade;
uniform float uFogK, uFar, uBloomPow, uAmb, uExpo, uAO, uWrap, uSheen;
uniform vec3 uHazeBase, uHazeFar, uBloomC, uBloomDir, uAmbC;
uniform vec4 uMist; uniform vec3 uMistC, uMistDeep;       /* mist bank: (y, thickness, depth scale, on) */
uniform vec4 uBeam; uniform vec3 uBeamC; uniform float uBeamTop; /* a shaft of light: (x, z, radius, strength) */
uniform int uSteps; uniform float uStepK;
uniform float uSaltPink;
uniform float uGrain;
uniform float uShJit;                                      /* 1: finer soft shadows for close views (0: as the hall) */                                      /* close views: the pick marks in cut stone (0: the hall's long-view stone) */                                   /* how much the salt's band edges go pink (0: grey and white only) */
out vec4 outColor;

float map(vec3 p) { return scene(p).x; }
vec3 normalAt(vec3 p, float e) {
  vec2 k = vec2(1, -1);
  return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) + k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
}
float march(vec3 o, vec3 d, float tMax, out float tHit) {
  float t = .02;
  for (int i = 0; i < 400; i++) {
    if (i >= uSteps) break;
    float h = map(o + d * t);
    if (h < .0006 * t + .0015) { tHit = t; return 1.; }
    t += h * uStepK;
    if (t > tMax) break;
  }
  tHit = tMax; return 0.;
}
float softShadow(vec3 o, vec3 d, float tMax) {
  /* uShJit 1 (close views, where soft shadows band): finer steps, and a scattered start for what banding is left */
  bool fine = uShJit > 0.;
  float res = 1., t = .05 + (fine ? h2(gl_FragCoord.xy) * .015 : 0.);
  int n = fine ? 140 : 48; float lo = fine ? .008 : .03;
  for (int i = 0; i < 140; i++) {
    if (i >= n) break;
    float h = map(o + d * t);
    res = min(res, 10. * h / t);
    t += clamp(h * .8, lo, .6);
    if (res < .02 || t > tMax - .3) break;
  }
  return clamp(res, 0., 1.);
}
float ambOcc(vec3 p, vec3 n) {
  float o = 0., s = 1.;
  for (int i = 1; i <= 5; i++) { float h = .06 + .16 * float(i); o += (h - map(p + n * h)) * s; s *= .7; }
  return clamp(1. - uAO * o, .25, 1.);
}
vec2 worldUV(vec3 q, vec3 n) {
  vec3 a = abs(n);
  if (a.x >= a.y && a.x >= a.z) return vec2(q.z, q.y);
  if (a.z >= a.y) return vec2(q.x, q.y);
  return vec2(q.x + 20., q.z);
}
vec2 uvAt(vec3 q, vec3 n, bool given) { return given ? scene(q).zw : worldUV(q, n); }

/* diffuse light; with specK > 0 also a shine toward each light (power specP), tinted by the light */
vec3 lightAt(vec3 p, vec3 n, vec3 alb, float wrap, vec3 d, float specK, float specP) {
  float am = .016 + .012 * (n.y * .5 + .5);
  vec3 c = alb * am * uAmbC * uAmb;
  for (int i = 0; i < 8; i++) {
    if (i >= uN) break;
    vec3 L = uLp[i] - p; float d2 = dot(L, L), dd = sqrt(d2);
    float ndl = (dot(n, L) / dd + wrap) / (1. + wrap);
    if (ndl <= 0.) continue;
    float r2 = uLr[i] * uLr[i];
    float att = uLk[i] / (1. + d2 / r2) / r2;
    float sh = uLsh[i] > 0. ? mix(1., softShadow(p + n * .03, L / dd, dd), uLsh[i]) : 1.;
    c += alb * uLc[i] * ndl * att * sh;
    if (specK > 0.) {
      vec3 hv = normalize(L / dd - d);
      float nl = max(dot(n, L / dd), 0.);
      c += uLc[i] * specK * pow(max(dot(n, hv), 0.), specP) * (specP + 8.) / 50. * nl * att * sh;
    }
  }
  /* a lamp's warmth lies on the stone around it as gold, as in the hall (added, not tinted by the violet) */
  for (int i = 0; i < 8; i++) {
    if (i >= uN) break;
    if (uLwarm[i] <= 0.) continue;
    vec3 L = uLp[i] - p; float ld = dot(L, L);
    c += vec3(1., .55, .2) * uLwarm[i] / (1. + ld / (uLr[i] * uLr[i] * 1.6));
  }
  return c;
}

/* shade a hit: albedo from the stone, relief, light. Water is handled by the caller. */
vec3 shade(vec3 p, vec3 d, float t, vec3 n, vec4 hs, float fpx) {
  float m = floor(hs.y + .5);
  if (m == M_GLOW) return uLc[0] * 1.6;
  if (m == M_DARK) return vec3(.004, .004, .012);
  bool given = hs.z > -1e3;
  bool floorLike = n.y > .7 && m != M_DRESSED && m != M_ROCK;
  if (floorLike) given = false;
  vec2 uv = uvAt(p, n, given);
  float fpv = t / fpx, cosI = abs(dot(n, d)), fp = fpv / max(.12, cosI);
  vec3 alb = vec3(.5, .5, .62);
  float tU = 0., tV = 0.;
  /* the scene's marks on this surface (polish, stain, tint): read here, fresh */
  gPolish = 0.; gStain = 0.; gTint = vec3(1); scene(p);
  float pol = clamp(gPolish, 0., 1.), stn = clamp(gStain, 0., 1.); vec3 tint = gTint;
  float specK = 0., specP = 16., wrap = uWrap;
  vec3 nb = vec3(0);                                        /* a bump straight in 3D (materials that have no courses) */
  if (floorLike || m == M_FLOOR) {
    vec4 s = stone(vec2(uv.x, uv.y), fp, fpv, 1.7, 1.25, 5.); alb *= s.x * .92; tU = s.y * .5; tV = s.z * .5;
  } else if (m == M_CUT) {
    vec4 s = stone(uv, fp, fpv, 1.3, 2.9, 11.); alb *= s.x; tU = s.y; tV = s.z;
  } else if (m == M_CUT_SMALL) {
    vec4 s = stone(uv, fp, fpv, .7, 1.4, 17.); alb *= s.x; tU = s.y; tV = s.z;
  } else if (m == M_DRESSED) {
    vec4 s = stone(uv * vec2(.3, 3.) + vec2(3, 1), fp, fpv, 9., 9., 23.); alb *= s.x * 1.08; tU = s.y * .4; tV = s.z * .4;
  } else if (m == M_ROCK) {
    float g = fbm3(p * 1.7, 4), g2 = fbm3(p * 7., 3);
    alb *= .62 + .5 * g; alb *= .85 + .3 * g2;
    tU = (g2 - .5) * .9; tV = (fbm3(p * 7. + 11., 3) - .5) * .9;
  } else if (m == M_SALT) {
    /* beds of salt laid down one on another: grey, white, with thin dark seams between; crystals in each bed */
    float b = p.y * 1.7 + (fbm3(p * vec3(.3, .5, .3), 3) - .5) * 3.2 + (fbm3(p * 2.5, 2) - .5) * .25, bi = floor(b), bf = b - bi;
    float bed = h2(vec2(bi, 71.)), white = smoothstep(.25, .65, bed) * (.7 + .3 * fbm3(p * 3., 2));
    vec3 grey = vec3(.27, .27, .31) * (.7 + .45 * h2(vec2(bi, 5.))), wh = vec3(.9, .89, .93);
    alb = mix(grey, wh, white);
    float bd = min(bf, 1. - bf);
    alb = mix(alb, vec3(.82, .6, .64), (1. - smoothstep(0., .2, bd)) * uSaltPink * (.4 + .6 * white));   /* pink only at the edges of the beds */
    alb *= 1. - .35 * (1. - smoothstep(0., .025, bd)) * h2(vec2(bi, 17.));                   /* a thin dark seam under some beds */
    vec3 sd; vec3 cl = cells3(p * 28., sd);
    float grain = smoothstep(0., .1, cl.y - cl.x);                                           /* the boundary between crystals */
    float fade = 1. - smoothstep(.01, .035, fp);                                             /* crystals only where they can be seen */
    alb *= mix(1., (.94 + .12 * cl.z) * (.93 + .07 * grain), fade);
    alb *= .88 + .24 * fbm3(p * 1.4, 3);
    vec3 cn = vec3(h2(sd.xy), h2(sd.yz + 3.), h2(sd.zx + 7.)) - .5;
    nb = (cn - n * dot(cn, n)) * .3 * fade + (vec3(fbm3(p * 4., 2), fbm3(p * 4. + 7., 2), fbm3(p * 4. + 13., 2)) - .5) * .6;
    vec3 gs; vec3 gc = cells3(p * 70. + 3.7, gs);                                              /* glints: a few small faces, finer than the crystals */
    float glint = step(.9, h2(gs.xz + gs.y * 3.1)) * (1. - smoothstep(.25, .45, gc.x)) * fade;
    specK = .12 + 2.2 * glint; specP = mix(24., 140., glint); wrap = max(wrap, .45);    /* light goes a little into salt */
  } else if (m == M_CLOTH) {
    alb = vec3(.46, .42, .35) * (.8 + .35 * fbm3(p * 3., 3));
    float wv = fp < .004 ? (sin(uv.x * 900.) * sin(uv.y * 900.)) * (1. - fp / .004) : 0.;
    alb *= 1. + .08 * wv;
    nb = (vec3(fbm3(p * 9., 3), fbm3(p * 9. + 5., 3), fbm3(p * 9. + 9., 3)) - .5) * .35;  /* soft creases */
    wrap = max(wrap, .5);
  } else if (m == M_LEATHER) {
    alb = vec3(.2, .13, .085) * (.75 + .5 * fbm3(p * 14., 3));
    nb = (vec3(fbm3(p * 30., 3), fbm3(p * 30. + 5., 3), fbm3(p * 30. + 9., 3)) - .5) * .45;
    specK = .35; specP = 12.;
  } else if (m == M_TIN) {
    alb = vec3(.3, .31, .34) * (.7 + .45 * fbm3(p * 11., 3));                          /* dull, a little patchy */
    nb = (vec3(fbm3(p * 16., 2), fbm3(p * 16. + 5., 2), fbm3(p * 16. + 9., 2)) - .5) * .18;
    specK = 1.3; specP = 40.;
  } else if (m == M_PAPER) {
    alb = vec3(.74, .7, .6) * (.9 + .12 * fbm3(p * 40., 3));
    wrap = max(wrap, .5);
  } else if (m == M_WOOD) {
    float gr = fbm(vec2(uv.x * 1.2, uv.y * 26.), 4);
    alb = vec3(.28, .19, .12) * (.65 + .6 * gr);
    tU = (gr - .5) * .3;
    specK = .12; specP = 10.;
  } else if (m == M_SLATE) {
    alb = vec3(.15, .155, .18) * (.85 + .3 * fbm3(p * 20., 3));
    specK = .45; specP = 22.;
  }
  /* seen close, cut stone shows the tool: the shallow dents of a pick, close set */
  if (uGrain > 0. && m <= M_DRESSED && m != M_ROCK && !floorLike) {            /* floors are worn smooth */
    float cd = (1. - smoothstep(.0015, .01, fp)) * uGrain;
    if (cd > 0.) {
      vec3 sd; vec3 cl = cells3(vec3(uv * 19., .5), sd);
      vec2 r = sd.xy - uv * 19.;                                                 /* toward the mark's centre */
      float pit = (1. - smoothstep(.15, .55, cl.x)) * step(.3, cl.z) * (.6 + .4 * h2(sd.xy));
      tU -= r.x * pit * .8 * cd; tV -= r.y * pit * .8 * cd;
      alb *= 1. + (-pit * .1 + (fbm(uv * 45., 2) - .5) * .1) * cd;
    }
  }
  alb *= tint;
  /* polish: the grain and the chisel rubbed away, the stone paler and shining */
  if (pol > 0.) { tU *= 1. - .85 * pol; tV *= 1. - .85 * pol; nb *= 1. - .85 * pol; alb *= 1. + .3 * pol; specK += 1.1 * pol; specP = mix(specP, 34., pol); }
  /* a stain: dark and flat, nothing of the stone's relief or shine left */
  if (stn > 0.) { alb *= 1. - .9 * stn; tU *= 1. - stn; tV *= 1. - stn; nb *= 1. - stn; specK *= 1. - stn; }
  if (dot(nb, nb) > 0.) n = normalize(n + nb);
  /* relief: tilt the normal along the directions u and v grow */
  if (tU != 0. || tV != 0.) {
    vec3 t1 = normalize(cross(n, abs(n.y) < .9 ? vec3(0, 1, 0) : vec3(1, 0, 0))), t2 = cross(n, t1);
    float e = .01; vec2 u0 = uvAt(p, n, given), u1 = uvAt(p + t1 * e, n, given), u2 = uvAt(p + t2 * e, n, given);
    vec2 g1 = (u1 - u0) / e, g2 = (u2 - u0) / e;
    vec3 Tu = g1.x * t1 + g2.x * t2, Tv = g1.y * t1 + g2.y * t2;
    if (dot(Tu, Tu) > 1e-6 && dot(Tu, Tu) < 1e4) Tu = normalize(Tu); else Tu = vec3(0);
    if (dot(Tv, Tv) > 1e-6 && dot(Tv, Tv) < 1e4) Tv = normalize(Tv); else Tv = vec3(0);
    n = normalize(n + Tu * tU + Tv * tV);
  }
  vec3 c = lightAt(p, n, alb, wrap, d, specK, specP) * ambOcc(p, n);
  /* polished stone mirrors the far light's haze, faintly */
  if (pol > 0.) c += pol * pow(max(dot(reflect(d, n), uBloomDir), 0.), 6.) * uBloomC * .35;
  if (floorLike) {
    /* a worn sheen toward the far light */
    vec3 r = reflect(d, vec3(0, 1, 0));
    float sp = max(dot(r, uBloomDir), 0.);
    c += pow(sp, 14.) * uSheen * vec3(.55, .52, 1.);
  }
  return c;
}

vec3 haze(vec3 c, vec3 o, vec3 d, float t) {
  float fz = 1. - exp(-t * uFogK);
  float bloom = pow(max(dot(d, uBloomDir), 0.), uBloomPow);
  float dd = clamp(t / uFar, 0., 1.);
  vec3 f = uHazeBase + uHazeFar * dd * dd + uBloomC * bloom;
  c = mix(c, f, fz);
  /* lights glow in the air around them */
  for (int i = 0; i < 8; i++) {
    if (i >= uN) break;
    if (uLair[i] <= 0.) continue;
    float s = clamp(dot(uLp[i] - o, d), 0., t);
    float dl = length(uLp[i] - (o + d * s)), r = uLr[i];
    c += uLc[i] * uLair[i] / (1. + dl * dl / (r * r * .35));
  }
  /* a level bank of lit mist */
  if (uMist.w > 0. && d.y < 0.) {
    float te = (uMist.x - o.y) / d.y;
    if (t > te) {
      float inl = t - max(te, 0.), mf = 1. - exp(-inl / uMist.y);
      float deep = clamp(-(o.y + d.y * t - uMist.x) / uMist.z, 0., 1.);
      /* cloud, not a flat disc: the mist's top is uneven and lit unevenly */
      vec3 e = o + d * max(te, 0.);
      float cl = fbm(e.xz * .22 + 3., 4), cl2 = fbm(e.xz * .6 - 7., 3);
      mf *= .55 + .6 * cl;
      c = mix(c, (uMistC + uMistDeep * deep) * (.75 + .5 * cl2), clamp(mf, 0., 1.));
    }
  }
  /* a shaft of light falling from above */
  if (uBeam.w > 0.) {
    vec2 oc = o.xz - uBeam.xy, dv = d.xz;
    float a = dot(dv, dv), b = dot(oc, dv), cc = dot(oc, oc) - uBeam.z * uBeam.z, disc = b * b - a * cc;
    if (disc > 0. && a > 1e-6) {
      float sq = sqrt(disc), t0 = max((-b - sq) / a, 0.), t1 = min((-b + sq) / a, t);
      if (t1 > t0) {
        float tm = (t0 + t1) * .5, ym = o.y + d.y * tm;
        /* soft at its edges: how close the ray passes to the beam's axis */
        vec2 cq = oc + dv * (-b / a);
        float edge = 1. - smoothstep(0., uBeam.z, length(cq));
        float dens = .55 + .9 * fbm(vec2(ym * .35, length(cq) * 1.5 + 4.), 3);
        float fall = smoothstep(-1., 2., ym) * (.75 + .25 * smoothstep(uBeamTop, 0., ym));
        c += uBeamC * uBeam.w * (t1 - t0) / (2. * uBeam.z) * edge * edge * dens * fall * 1.6;
      }
    }
  }
  return c;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float f = uF * uRes.x; vec2 cc = uC * uRes;
  float vx = (px.x - cc.x) / f, vy = -(px.y - cc.y) / f;
  float pr = radians(uPitch), yr = radians(uYaw), cp = cos(pr), sp = sin(pr);
  vec3 d = vec3(vx, vy * cp + sp, -vy * sp + cp);
  d = vec3(d.x * cos(yr) + d.z * sin(yr), d.y, -d.x * sin(yr) + d.z * cos(yr));
  d = normalize(d);
  vec3 o = uCam;
  float t; float hit = march(o, d, uFar, t);
  vec3 c;
  if (hit > 0.) {
    vec3 p = o + d * t; vec4 hs = scene(p);
    vec3 n = normalAt(p, max(.0015, t * .0008));
    if (floor(hs.y + .5) == M_WATER) {
      /* still water: the room again, upside down, darkened, a slow ripple */
      vec3 wn = normalize(vec3((fbm(p.xz * 1.3, 3) - .5) * .06, 1., (fbm(p.xz * 1.3 + 9., 3) - .5) * .06));
      vec3 rd = reflect(d, wn); float t2;
      vec3 q = p + wn * .02; float h2x = march(q, rd, uFar, t2);
      vec3 rc;
      if (h2x > 0.) { vec3 p2 = q + rd * t2; vec4 hs2 = scene(p2); rc = floor(hs2.y + .5) == M_WATER ? vec3(0) : shade(p2, rd, t + t2, normalAt(p2, max(.0015, (t + t2) * .0008)), hs2, f); }
      else rc = vec3(0);
      rc = haze(rc, q, rd, t2);
      float fr = .4 + .5 * pow(1. - max(dot(-d, wn), 0.), 4.);
      c = mix(vec3(.004, .004, .014), rc, fr);
      /* a long streak of the far light down the water */
      float sw = max(dot(rd, uBloomDir), 0.);
      c += (pow(sw, 60.) * .5 + pow(sw, 8.) * .06) * uBloomC;
    } else {
      c = shade(p, d, t, n, hs, f);
    }
  } else c = vec3(0);
  c = haze(c, o, d, t);
  c *= uGrade;
  c = 1. - exp(-c * uExpo);
  c = pow(c, vec3(.92));
  outColor = vec4(c, t);
}
`;
