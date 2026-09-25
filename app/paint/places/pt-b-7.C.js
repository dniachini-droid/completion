/* SEALED (D-015). pt-b-7.C, the great door, open (the Lamp Hall of pt-b-1.A, reused: its far end, LIT state).
   The great door is gone. Standing on the threshold, in the door's deep cold reveal (its stone at the frame's
   left edge), looking down: beyond, a stair twice as steep as the Stair's, going down into the dark. The hall's
   cups behind you throw their warm light through the doorway and down the steps, and on the eleventh step it
   stops: a clean line across the tread, and below it only cold dark and the faint violet of the stone. Cold air
   comes up the stair toward you (the fog-flow layer). VP far below, in the dark. */
import hall from './pt-b-1.A.js';

const Z0 = 66.5, RI = .5, TR = .42;                                  /* the steep stair: its head at the door's back face */
const K11 = 10;                                                      /* the eleventh step (0 is the first below the sill) */
const Y11 = -RI * (K11 + 1), Z11 = Z0 + (K11 + .55) * TR;
const WARM = [1, .74, .46];
export default {
  ...hall,
  id: 'pt-b-7.C',
  name: 'The great door, open',
  line: '',
  cam: { x: -.7, y: 1.7, z: 66.2, pitch: -60, yaw: 3, f: .52, cx: .5, cy: .5 },
  far: 50, fogK: 1 / 20,
  hazeBase: [.01, .009, .03], hazeFar: [.03, .028, .08],
  bloomAt: [0, -20, 90], bloomPow: 30, bloomC: [0, 0, 0],
  bloom: { alpha: .14 },
  glow: { threshold: .62, k: .5 },
  blur: { px: 1.8, d0: 4, d1: 14, k: .8 },
  steps: 400, gold: 1, sheen: 0, grain: .3, shadowJitter: 1, amb: 1.4, ambC: [.7, .68, 2.1], expo: 1.8,
  lights: [
    { p: [.3, 7.6, 63.2], c: WARM, k: 80, r: 3, shadow: 1 },                           /* the hall's cups, behind you, their light through the doorway */
    { p: [0, -4.3, 70.6], c: WARM, k: 3, r: 1., reach: 2.2 },                       /* the same, given back off the lit treads */
    { p: [0, Y11 - .6, Z11 + 3.6], c: [.4, .38, .9], k: 3.5, r: 3, shadow: .4 },                                 /* the stone's own faint violet, far below */
    { p: [-.5, 3.2, 64.5], c: [.42, .4, .95], k: 3, r: 2.5, shadow: .5 },              /* the hall's violet on the door's cold reveal */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)').replace('d = U(d, vec4(66.45 - p.z, M_DARK, NOUV));', '') + /* glsl */ `
  const float Z0 = ${Z0.toFixed(2)}, RI = ${RI.toFixed(2)}, TR = ${TR.toFixed(2)}, Z11 = ${Z11.toFixed(3)}, Y11 = ${Y11.toFixed(3)};
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    /* beyond the door: a passage going down at the stair's pitch, round-vaulted, a little narrower than the door */
    float ny = -RI / TR * max(p.z - Z0, 0.);
    vec3 q = vec3(p.x, p.y - ny + 1.4, p.z);
    vec4 pa = hallAir(q, 1.95, 3.6, 1.95, Z0 - .6, Z0 + 16., M_CUT); pa.x *= .75;
    d = A(d, pa);
    d.x += rough(p, .015, 3.) * step(1.85, abs(p.x)) * step(Z0, p.z);
    vec4 st = stairs(p, -2.2, 2.2, Z0, 0., TR, RI, 60, M_CUT);
    st.x += .004 * vn(p.xz * 12.);
    d = U(d, st);
    if (p.z > Z0 - .1) {
      /* where the light stops: a clean line across the eleventh tread, leaning a little with the doorway's edge */
      float cut = p.z - Z11 - .12 * p.x + (p.y - Y11) * .3;
      float lit = smoothstep(.02, -.02, cut);
      gTint *= mix(.3, 1., lit);
      if (lit < .5) gTint *= mix(1., .1, smoothstep(Z11 + 1., Z11 + 7., p.z));   /* below it, the unlit steps go on, fading to nothing */
      gTint *= mix(.3, 1., smoothstep(Z0 + .3, Z11 - 1.2, p.z));                   /* the first steps under the sill's own shadow, darker */
      if (abs(p.x) > 1.85) gTint *= vec3(.4, .4, .55);                                             /* the side walls, darker than the treads */
    } else {
      gTint *= vec3(.62, .66, 1.05);                                                  /* the door's reveal: cold */
      if (p.y < .03) gTint *= .25;                                                   /* the sill at your feet */
    }
    if (p.y > 3.) gTint *= mix(1., .2, smoothstep(3., 7., p.y));
    return d;
  }`,
  anchors: {
    fog: [{ p: [0, Y11 - 1.2, Z11 + 3], w: 1.2, h: .3, a: .2 }, { p: [0, Y11 + .4, Z11 - .5], w: 1.3, h: .2, a: .12, speed: .6 }],
  },
  live: { motes: 'gold', fog: 'low', gold: true, flame: 'still' },
};
