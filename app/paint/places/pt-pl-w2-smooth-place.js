/* SEALED (D-015). pt-pl-w2-smooth-place, round 1: at the corner (pt-b-1.B's bend, reused), on the polished
   outer wall: one patch where the marks are rubbed away altogether, at the height of a long hand, above the
   troughs. The stone there has gone smooth the way a banister does, to a mirror: the brightest value in the
   frame. The marks round it rubbed faint. Violet place-light from beyond the corner, on the right. Looking up
   at it from beside the troughs. */
import corner from './pt-b-1.B.js';

const R = 6, ZC = 20, AL = 1.2;                                     /* the bend, as in pt-b-1.B; the patch, along it */
const ph = AL / R, across = -2.7;
const PX = R - (R - across) * Math.cos(ph), PZ = ZC + (R - across) * Math.sin(ph), PY = 3.05;

export default {
  ...corner,
  id: 'pt-pl-w2-smooth-place',
  name: 'The smooth place',
  line: '',
  cam: { x: -.45, y: .9, z: 18.2, pitch: 27, yaw: -30, f: .7, cx: .5, cy: .5 },
  lights: [
    ...corner.lights.slice(0, 3),
    { p: [PX + (R - PX) / (R - across) * 1.3, PY + .25, PZ + (ZC - PZ) / (R - across) * 1.3 + .5], c: [.62, .58, 1.2], k: 2.2, r: 1.1 },        /* the light from beyond the corner, full on the patch */
  ],
  glsl: corner.glsl.replace('vec4 scene(vec3 p)', 'vec4 cornerScene(vec3 p)') + /* glsl */ `
  vec4 scene(vec3 p) {
    vec4 d = cornerScene(p);
    if (p.y < .06) gTint *= .5;                                                       /* the floor, darker still */
    if (p.y < 2.4) { float lo = smoothstep(.6, 2.4, p.y); gTint *= mix(.38, 1., lo); gPolish *= mix(.3, 1., lo); }   /* low down, out of the light: the button's band stays calm */
    /* the patch: the marks rubbed away altogether, the stone gone to a mirror; round it, the marks rubbed faint */
    vec3 c = vec3(${PX.toFixed(3)}, ${PY.toFixed(2)}, ${PZ.toFixed(3)});
    vec2 b = bend(p);
    if (b.x < -2.5) {
      float r = length(vec2((b.y - ${(ZC + AL).toFixed(2)}) * .8, p.y - c.y)) + (fbm(vec2(b.y, p.y) * 3., 3) - .5) * .12;
      float k = 1. - smoothstep(.3, .38, r), faint = 1. - smoothstep(.45, .9, r);
      if (faint > 0.) {
        float top = 2.9 + (vn(vec2(b.y * 1.1, 3.)) - .5) * .3;
        if (p.y > top && p.y < 4.6 && -2.7 - b.x > -.1) d.x -= marks(vec2(b.y, p.y)) * faint;                  /* the marks round it rubbed faint */
        gPolish = max(gPolish, faint * .9);
      }
      if (k > 0.) { gPolish = 1.; gTint = vec3(1. + .55 * k); }
    }
    return d;
  }`,
  anchors: {
    fog: [{ p: [PX + .4, PY, PZ], w: .9, h: .3, a: .14 }, { p: [-1.2, .3, 21.5], w: 1.2, h: .2, a: .12, speed: .6 }],
    glints: [{ p: [PX + .02, PY + .1, PZ] }, { p: [PX + .02, PY - .15, PZ - .2] }],
  },
  live: { fog: 'far', motes: 'violet' },
};
