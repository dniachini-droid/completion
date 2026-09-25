/* SEALED (D-015). pt-pl-w4-hollow (the Salt Gallery of pt-b-2.A, reused, in the cups' light): low in the left
   wall, at its foot, a bank of salt; in its top a hollow the size of two cupped hands, worn smooth inside to a
   glassy finish, a count cut on its rim. At its bottom the salt is pressed flat in four small places, two and
   two: four tiny footprints of something that is not there. The cups' warm light from above and behind.
   Crouched beside it, looking down into the hollow; VP at its centre. */
import room from './pt-b-2.A.js';

const ZH = 15.2, XH = -1.72, H0 = .42, RX = .55, RZ = 1.1;
const YH = H0 * (1 - ((XH + 1.95) / RX) ** 2);                               /* the hollow's centre, on the bank's top */
const W = [1, .84, .66], V = [.62, .58, 1.2];
export default {
  ...room,
  id: 'pt-pl-w4-hollow',
  name: 'The hollow',
  line: '',
  cam: { x: -1.2, y: .92, z: ZH - .36, pitch: -54, yaw: -52, f: .75, cx: .5, cy: .5 },
  salt: { pink: .3 },
  expo: 1.85, grade: [1, 1, 1], bloomC: [.1, .09, .2], sheen: 0,
  blur: { px: 1.6, d0: 1.2, d1: 5, k: .8 },
  lights: [
    { p: [-.9, 1.6, ZH - .9], c: W, k: .5, r: 1., reach: 1.9 },              /* the cups' glow, from above and behind */
    { p: [XH + .16, YH + .3, ZH + .2], c: W, k: .07, r: .2, reach: .8 },       /* its reach into the hollow: the pressed places give it back */
    { p: [.4, 1.6, 34], c: V, k: 5, r: 9 },                                                   /* the gallery going on in its own violet */
    { p: [.3, 1.2, ZH + 3], c: V, k: 2.2, r: 2.5 },
    { p: [0, 1.6, ZH - 6], c: [.3, .28, .66], k: .5, r: 3 },                                  /* faint fill from behind */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + /* glsl */ `
  const float ZH = ${ZH.toFixed(2)}, XH = ${XH.toFixed(2)}, YH = ${YH.toFixed(2)};
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > .05 && p.y < YH + .12 && abs(p.z - ZH) < 1.2) gTint = vec3(1);                  /* the bank's zone: none of the room's wall-foot shading (it drew a hard line across the bank) */
    if (floor(d.y + .5) == M_DRESSED) gTint *= .5;                                           /* the band kept down */
    gTint *= mix(1., .12, smoothstep(.4, .9, p.y));                                          /* the wall going up out of the light */
    if (p.x < -1.5 && p.y > YH + .12) gTint *= .85 + .25 * smoothstep(.3, .7, vn(vec2(p.y * 5. + fbm(p.xz * .4, 2) * 2., 1.)));   /* the beds (on the wall, not across the bank's top) */
    if (p.x < -1.85 && p.y > .5) gTint *= .4;                                                 /* the wall above, out of the light */
    if (p.y < .05) gTint *= mix(.45, .8, smoothstep(ZH - 1.5, ZH + 3., p.z));
    /* the bank: salt heaped at the wall's foot, its top roughly level */
    vec3 b = p - vec3(-1.95, 0., ZH);
    vec2 bq = vec2(b.x / ${RX.toFixed(2)}, b.z / ${RZ.toFixed(2)});
    float bank = (p.y - ${H0.toFixed(2)} * (1. - dot(bq, bq)) - .015 * fbm(p.xz * 6., 2)) * .5;
    bank += rough(p, .014, 7.) + rough(p, .005, 23.);
    if (bank < d.x) { d = vec4(bank, M_SALT, NOUV); gTint = vec3(.95) * mix(.5, 1., smoothstep(0., YH, p.y)); }
    if (floor(d.y + .5) == M_SALT && p.x > -2.1 && p.y < YH + .08) {
      /* evens out the kit's salt beds here (the same bed sum as the kit's), so no dark bed runs across the bank */
      float bb = p.y * 1.7 + (fbm3(p * vec3(.3, .5, .3), 3) - .5) * 3.2, bi = floor(bb), nx = smoothstep(.25, 1., bb - bi);
      float wh = smoothstep(.2, .7, mix(h2(vec2(bi, 71.)), h2(vec2(bi + 1., 71.)), nx));
      gTint *= mix(2.4, 1., wh);
    }
    /* the hollow: a bowl the size of two cupped hands, worn glassy inside */
    vec3 q = p - vec3(XH, YH + .03, ZH);
    float bowl = length(q / vec3(.14, .065, .16)) - 1.;
    bowl *= .065;
    if (-bowl > d.x - .03 && p.y > YH - .1) {
      d.x = -smin(-d.x, bowl, .025);                                                        /* its lip worn round, no edge left on it */
      if (bowl < .03) {
        d.yzw = vec3(M_ROCK, NOUV);                                                            /* worn past its crystals and beds: one even glassy face */
        float depth = smoothstep(.0, -.035, q.y), wk = smoothstep(.03, .0, bowl);
        gTint = vec3(mix(.9, 1.7, depth)) * mix(.8, 1., wk) * vec3(.97, .96, 1.);                                   /* its walls in their own shade, no lit rim */
        gPolish = .3 * wk;                                                          /* worn to a glassy smoothness */
        /* four small places at the bottom pressed flat, two and two */
        vec2 f = q.xz;
        float fp = 1e3;
        vec2 e = vec2(.8, 1.2);                                                                /* each a little longer than wide, set loosely, not in a square */
        fp = min(fp, length((f - vec2(-.03, -.045)) * e) / .0125);
        fp = min(fp, length((f - vec2(.018, -.022)) * e) / .011);
        fp = min(fp, length((f - vec2(-.012, .03)) * e) / .012);
        fp = min(fp, length((f - vec2(.036, .058)) * e) / .0105);
        float pr = 1. - smoothstep(.7, 1.15, fp);
        if (pr > 0. && q.y < -.02) {
          d.x += .0035 * pr;                                                                    /* pressed in: a shallow flat dip, its lip shading one side */
          gTint = mix(gTint, vec3(2.3), pr); gPolish = mix(gPolish, .45, pr);                  /* matte, a little lighter than round it, a soft sheen */
        }
      }
    }
    /* the count on its rim: short strokes cut across the lip, on the side toward you */
    /* straight short strokes, parallel, cut in the rim's near side (toward you), away from the bank's ends */
    vec2 tn = normalize(vec2(.83, -.56)), sn = vec2(-tn.y, tn.x);
    vec2 w = q.xz - tn * .2;
    if (abs(p.y - YH) < .06) {
      float a = dot(w, sn), k = floor(a / .022 + 2.5), c = (k - 2.) * .022;
      float st = length(vec2(a - c, max(abs(dot(w, tn)) - .016, 0.)));
      if (k >= 0. && k < 5.) d.x += engrave(st, .005, .004);
    }
    return d;
  }`,
  anchors: {
    glints: [[XH - .03, YH - .03, ZH - .04], [XH + .03, YH - .03, ZH + .05], [XH + .1, YH + .01, ZH + .1], [XH - .05, YH + .02, ZH - .18]].map(p => ({ p })),
    fog: [{ p: [-1.55, .12, ZH + .25], w: 1.2, h: .14, a: .12 }],
  },
  live: { motes: 'gold', fog: 'low' },
};
