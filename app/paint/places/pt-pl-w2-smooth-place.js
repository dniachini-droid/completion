/* SEALED (D-015). pt-pl-w2-smooth-place, round 1: at the corner (pt-b-1.B's bend, reused), on the polished
   outer wall: one patch where the marks are rubbed away altogether, at the height of a long hand, above the
   troughs. The stone there has gone smooth the way a banister does, to a mirror: the brightest value in the
   frame. The marks round it rubbed faint. Violet place-light from beyond the corner, on the right. Looking up
   at it from beside the troughs. */
import corner from './pt-b-1.B.js';

const R = 6, ZC = 20, AL = 1.2;                                     /* the bend, as in pt-b-1.B; the patch, along it */
const ph = AL / R, across = -2.7;
const PX = R - (R - across) * Math.cos(ph), PZ = ZC + (R - across) * Math.sin(ph), PY = 3.05;
const CAM = { x: -1.0, y: 1.1, z: 16.0 };
/* a light where the polish mirrors it back to the eye: the camera's direction reflected about the wall's normal */
const N = (() => { const a = [R - PX, 0, ZC - PZ], l = Math.hypot(...a); return a.map(x => x / l); })();
const V = [CAM.x - PX, CAM.y - PY, CAM.z - PZ], vn = V[0] * N[0] + V[1] * N[1] + V[2] * N[2];
const M = V.map((x, i) => 2 * vn * N[i] - x), ml = Math.hypot(...M);
const SPEC = M.map((x, i) => [PX, PY, PZ][i] + x / ml * 1.6);

export default {
  ...corner,
  id: 'pt-pl-w2-smooth-place',
  name: 'The smooth place',
  line: '',
  cam: { ...CAM, pitch: 14, yaw: 2, f: .62, cx: .5, cy: .5 },
  lights: [
    ...corner.lights.slice(0, 3),
    { ...corner.lights[4], k: 3 },                                                                            /* low along the floor: a trace on the troughs' rims */
    { p: [PX + (R - PX) / (R - across) * 1.3, PY + .25, PZ + (ZC - PZ) / (R - across) * 1.3 + .5], c: [.62, .58, 1.2], k: .45, r: 1.1 },        /* the light from beyond the corner, on the patch */
    { p: SPEC, c: [.62, .58, 1.2], k: .5, r: .8 },
    { p: [SPEC[0] - .35, SPEC[1] - .1, SPEC[2] - .8], c: [.62, .58, 1.2], k: .35, r: .6 },                  /* and a little along, so the polish gives back a streak along the curve, not a spot */                                                      /* the same light, as the polish gives it back */
  ],
  glsl: corner.glsl.replace('vec4 scene(vec3 p)', 'vec4 cornerScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = cornerScene(p);
    if (p.y < .06) gTint *= 2.1;                                                       /* the floor, lifted a little from the dark below: the troughs show */
    if (p.y < 2.75) { float lo = smoothstep(.9, 2.75, p.y); gTint *= mix(.28, 1., pow(lo, 1.5)); gPolish *= mix(.25, 1., lo); }   /* low down, out of the light: the button's band stays calm */
    /* the patch: the marks rubbed away altogether, the stone gone to a mirror; round it, the marks rubbed faint */
    vec3 c = vec3(${PX.toFixed(3)}, ${PY.toFixed(2)}, ${PZ.toFixed(3)});
    vec2 b = bend(p);
    if (b.x < -2.5) {
      float r = length(vec2((b.y - ${(ZC + AL).toFixed(2)}) * .55, p.y - c.y)) + (fbm(vec2(b.y, p.y) * 3., 3) - .5) * .12;
      float k = 1. - smoothstep(.18, .5, r), faint = 1. - smoothstep(.5, 1.2, r);
      float top = 2.9 + (vn(vec2(b.y * 1.1, 3.)) - .5) * .3;
      if (p.y > top && p.y < 4.6 && -2.7 - b.x > -.1) {
        float mk = marks(vec2(b.y, p.y));
        d.x -= mk * faint;                                                              /* the marks round it rubbed faint: full depth far off, shallower toward it, gone at it */
        if (mk > 0.) gTint *= mix(1.3, 1., faint);                                      /* worn cuts: their floors pale, never black */
      }
      if (faint > 0.) gPolish = max(gPolish, faint * .9);
      if (k > 0.) { gPolish = max(gPolish, k); gSmooth = .5 * k; gTint *= 1. + .45 * k; d.zw = mix(d.zw, vec2(${(ZC + AL).toFixed(2)}, c.y), k); }   /* a paler field, the joints rubbed out of it */
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [PX + .4, PY, PZ], w: .9, h: .3, a: .14 }, { p: [-1.2, .3, 21.5], w: 1.2, h: .2, a: .12, speed: .6 }],
    glints: [{ p: [PX + .02, PY + .1, PZ] }, { p: [PX + .02, PY - .15, PZ - .2] }],
  },
  live: { fog: 'far', motes: 'violet' },
};
