/* SEALED (D-015). pt-cv-05, camp view: in the trough (the corner, pt-b-1.B, reused). Crouched in the outer trough,
   looking down and across at the inner one a stride away, worn to the same depth; both run on and bend away into
   the turn, where the gallery's violet comes from. In the inner trough lies one dry hedge leaf, curled, brown: a
   leaf from outside, the only green-brown in the MVP. Quieter than the places: one form, one light. */
import corner from './pt-b-1.B.js';

const R = 6, PHI = 1.2, ZC = 20;
const P2 = [R - R * Math.cos(PHI), ZC + R * Math.sin(PHI)], T = [Math.sin(PHI), Math.cos(PHI)];
const beyond = k => [P2[0] + T[0] * k, P2[1] + T[1] * k];
const LEAF = [-.57, 15.45];                                              /* in the inner trough, lying up its far flank, facing you (its bottom at x -.73) */

export default {
  ...corner,
  id: 'pt-cv-05',
  name: 'In the trough',
  line: '',
  cam: { x: -1.57, y: .62, z: 14.3, pitch: -12, yaw: 19, f: .62, cx: .5, cy: .5 },
  blur: { px: 1.4, d0: 3, d1: 16, k: .8 },
  lights: [
    ...corner.lights.slice(0, 3),
    { ...corner.lights[4], k: 5 },                                                         /* low along the floor from the outer side: rakes across the troughs */
    { p: [LEAF[0] - .09, .06, LEAF[1] - .05], c: [.85, .8, 1.], k: .012, r: .07, shadow: .5 },          /* the turn's light, caught on the leaf's curled edge */
  ],
  glsl: corner.glsl.replace('vec4 scene(vec3 p)', 'vec4 cornerScene(vec3 p)') + /* glsl */ `
  /* the leaf: an oval blade, curled up along its length and at the tip, a midrib, lying in contact on the trough's floor */
  vec3 gLeaf = vec3(1);
  vec4 leaf(vec3 p, float fy) {
    vec3 q = p - vec3(${LEAF[0].toFixed(2)}, fy, ${LEAF[1].toFixed(2)});
    float t = -.66, ct = cos(t), st = sin(t); q.xy = vec2(ct * q.x - st * q.y, st * q.x + ct * q.y);  /* lying up the flank, as the flank slopes */
    float a = .25, ca = cos(a), sa = sin(a); q.xz = vec2(ca * q.x - sa * q.z, sa * q.x + ca * q.z);   /* and at a slant to the trough */
    float u = q.z / .08, w = q.x / .036;                                                             /* along (-1 stem .. 1 tip), across */
    float curl = .024 * w * w + .014 * max(u - .5, 0.) * max(u - .5, 0.) * 4. + .004 * max(-u - .6, 0.) * 6.;                       /* the edges and the tip lifted as it dried */
    q.y -= curl + .005;
    float wid = max(1. - u * u, 0.) * (1.1 - .3 * u) * (1. - .06 * step(.5, fract(u * 7.)) * step(-.3, u));   /* pointed at both ends, broadest below the middle, the edge a little toothed */
    float blade = max(max(abs(w) - wid, abs(u) - 1.), 0.) * .036;
    float stem = length(vec2(q.x, max(abs(q.z + .094) - .016, 0.))) - .0015;
    float d = min(max(blade, abs(q.y) - .0012) - .0003, max(stem, abs(q.y) - .0015));
    gLeaf = vec3(.78, .64, .36) * (.85 + .3 * fbm(vec2(u, w) * 5., 3)) * (1. - .3 * smoothstep(.1, 0., abs(w))) * (1. - .18 * smoothstep(.12, 0., abs(fract((u - abs(w) * .8) * 3.5) - .5))) * (1. - .25 * smoothstep(.7, 1., abs(w) / max(wid, .01)));   /* dry, olive going brown, the midrib and the curled rim darker */
    return vec4(d, M_PAPER, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 d = cornerScene(p);
    vec2 b = bend(p);
    if (p.y < .05 && b.y < 15.8) gTint *= mix(.6, 1., smoothstep(14.3, 15.8, b.y));        /* at your feet, out of the light */
    /* the trough's floor under the leaf: the depth there, so the leaf lies on it */
    float fade = smoothstep(ZC - 14., ZC - 4., ${LEAF[1].toFixed(2)}) * (1. - smoothstep(ZC + 8., ZC + 14., ${LEAF[1].toFixed(2)}));
    float s = abs(${LEAF[0].toFixed(2)} + 1.15) - .42, e = s / .27, q = max(0., 1. - e * e);
    vec4 lf = leaf(p, -.14 * fade * q * q);
    if (lf.x < d.x) { d = lf; gTint = gLeaf; gPolish = 0.; }                                 /* only the leaf itself takes its colour */
    return d;
  }`,
  anchors: {
    fog: [{ p: [-.9, .3, 19.5], w: 1.2, h: .2, a: .12, speed: .6 }],
  },
  live: { fog: 'far', motes: 'violet' },
};
