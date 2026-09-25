/* SEALED (D-015). pt-b-4.C, the Lower Door, close (the Lamp Hall of pt-b-1.A, reused, lit state): the great door
   at close range, its leaf filling the frame and going up past where the light reaches. At eye height, the
   Site's largest count: a row of long strokes cut into the door's cold smooth stone, every one empty. Beside it,
   a blank, and two marks by the blank (a bar with a drop; two drops parted). Under the count, a mark like a path
   doubling back. The last cup's warm light from low on the left, raking across the face so each empty stroke
   draws itself; cold haze down the face. Close and low; VP high. */
import hall from './pt-b-1.A.js';

const ZD = 66.45;                                                   /* the door's leaf, as in pt-b-1.A */
const W = [1, .68, .3];
export default {
  ...hall,
  id: 'pt-b-4.C',
  name: 'The Lower Door, close',
  line: '',
  cam: { x: .15, y: 1.25, z: ZD - 2.2, pitch: 16, yaw: 3, f: .6, cx: .5, cy: .5 },
  far: 30, fogK: 1 / 14, sheen: .02, gold: .8, expo: 2.2,
  hazeBase: [.028, .027, .075], hazeFar: [.04, .04, .12],
  bloomAt: [0, 1.6, ZD], bloomPow: 6, bloomC: [.04, .04, .1],
  glow: { threshold: .58, k: .6 },
  blur: { px: 1.2, d0: 4, d1: 12, k: .6 },
  lights: [
    { p: [-2.6, .8, ZD - 2.4], c: W, k: .3, r: .8, reach: 3.6, warm: .004, shadow: 1 },  /* the last cup, low on the left: its light raking across the face */
    { p: [-2.1, 1.75, ZD - .66], c: W, k: 2.6, r: .6, reach: 3.2, shadow: 1 },                /* and along the count, grazing: every empty stroke draws itself */
    { p: [0, 3, ZD - 12], c: [.3, .28, .66], k: 4, r: 6 },                                   /* the hall behind: a faint cold fill */
    { p: [1.2, 1.4, ZD - 1.4], c: [.34, .33, .75], k: .8, r: 2.2 },                          /* the door's own cold, broad and faint */
  ],
  glsl: hall.glsl.replace('vec4 scene(vec3 p)', 'vec4 hallScene(vec3 p)') + /* glsl */ `
  const float ZD = ${ZD.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = hallScene(p);
    /* the door's leaf, flush with the end wall: one stone, smoother and colder than the walls, a joint round its arch */
    vec4 leaf = vec4(ZD - .43 - p.z, M_ROCK, NOUV);
    if (leaf.x < d.x) d = leaf;
    float dr = archOpening2(vec2(p.x, p.y), 2.1, 6.2);
    dr = max(dr, min(dr, 2.9 - length(vec2(abs(p.x) + .8, p.y - 6.2))));
    if (p.z > ZD - .5 && dr > -.01) {
      d.x += engrave(dr, .02, .015);
      if (dr > .015) {
        d.yzw = vec3(M_SLATE, NOUV);
        gTint = vec3(2.4, 2.5, 2.8) * (.94 + .12 * fbm(p.xy * .7, 3));
        gTint *= mix(1., .25, smoothstep(2.4, 4.6, p.y));                                     /* up the face, into the dark: its top lost */
        gTint *= mix(.5, 1., smoothstep(-1.9, -.8, p.x));                                     /* nearest the cup the face kept down: its light is for the count */
        vec2 m = p.xy;
        /* the count: long strokes in a row, cut deep and clean, every one empty */
        float cy = 1.72, k = floor((m.x + .62) / .15), c = -.62 + (k + .5) * .15;
        float st = length(vec2(m.x - c, max(abs(m.y - cy) - .15, 0.)));
        float marks = 1e3;
        if (k >= 0. && k < 7.) { d.x += engrave(st, .022, .02); marks = st; }
        /* beside it, a blank: a clean-edged recess, a rod's length */
        vec2 bq = abs(m - vec2(.82, cy)) - vec2(.2, .035);
        float bl = length(max(bq, 0.)) + min(max(bq.x, bq.y), 0.) - .012;
        d.x = max(d.x, min(-bl, (ZD - .42) - p.z));
        if (bl < 0.) gTint *= 1.2;
        /* and by the blank, two marks: a bar with a drop; two drops parted */
        float by = m.y - cy, tw = .004 + .016 * smoothstep(.0, -.08, by);                          /* the bar swelling to a drop at its foot, one cut */
        float m1 = max(length(vec2(m.x - .53, max(abs(by + .005) - .08, 0.))) - tw, 0.);
        vec2 dq = m - vec2(1.12, cy);
        float m2 = min(length(vec2(dq.x + .03, max(abs(dq.y - .03) - .03 * (1. - (dq.y - .0) / .08), 0.))), length(vec2(dq.x - .03, max(abs(dq.y + .03) - .03 * (1. - (-.06 - dq.y) / .08), 0.))));
        d.x += engrave(min(m1, m2), .016, .014);
        /* under the count, a mark like a path doubling back: along, round, and back */
        vec2 pq = m - vec2(-.02, 1.26);
        float path = pq.x < .26 ? abs(abs(pq.y) - .06) : abs(length(pq - vec2(.26, 0.)) - .06);    /* a firm hairpin: out along the lower run, a tight turn, back along the upper */
        path = max(path, pq.y > 0. ? -.02 - pq.x : -.38 - pq.x);                                 /* the run back stops short of the start */
        d.x += engrave(path, .02, .016);                                                           /* cut as the count's strokes are */
        if (m.y < 1.4) gTint *= .8;                                                               /* below the count, a shade down: the count leads */
        if (marks < .02) gTint *= .92;
      }
    }
    if (floor(d.y + .5) != M_SLATE && p.z < ZD - .5) gTint *= .45;                            /* the side walls kept below the door */
    gTint *= mix(1., .3, smoothstep(3.5, 6., p.y));
    if (p.y < .03) gTint *= mix(.2, .55, smoothstep(ZD - 2.5, ZD - .4, p.z));                  /* the near floor kept down */
    return d;
  }`,
  anchors: {
    fog: [{ p: [-.2, .2, ZD - .5], w: 1.4, h: .2, a: .22 }, { p: [.3, 2.4, ZD - .1], w: .9, h: .6, a: .12, speed: .5 }],
    glints: [{ p: [-.4, 1.9, ZD - .43] }],
  },
  live: { fog: 'low', motes: 'gold', gold: true },
};
