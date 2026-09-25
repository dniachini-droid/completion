/* SEALED (D-015). pt-b-2.B, the rod, round 4 (room scale, close: D-075, CRITIQUE-B1): her shelf in the Survey Cut
   (pt-b-1.C's room, reused), come up to within a metre of it, standing, looking down at it from the room's side.
   The shelf is a ledge of cut stone let into the back wall. On it the rod of stone lies at a low diagonal,
   forearm-long, one dark fine-grained stone from point to butt: a long blade that thickens without a step into a
   worn round handle; its blade end lifted on a chip of stone; on the handle a line of cut marks in cells and, in
   the last cell's corner, a hook with a tail. Its one fine edge takes the last of the clay lamp's light, weak and
   warm from the doorway behind you, as a single thin gold line: the brightest thing in the room. Under the shelf a
   pencilled line on the wall. Violet in the corners. */
import room from './pt-b-1.C.js';

export default {
  ...room,
  id: 'pt-b-2.B',
  name: 'The rod',
  line: '',
  cam: { x: -.24, y: 1.52, z: 3.24, pitch: -21, yaw: -20, f: 1.55, cx: .5, cy: .5 },   /* at the shelf, standing, looking down at the rod */
  far: 9, fogK: 1 / 15,
  bloomAt: [-.45, 1.26, 3.82], bloomPow: 24, bloomC: [.012, .012, .03],
  blur: { px: 1.2, d0: .9, d1: 2.2, k: .6 },
  expo: 2.2, sheen: 0,
  lights: [
    { ...room.lights[0], k: 6 },                                                          /* the clay lamp, in the passage behind you */
    { p: [-.36, 1.6, 3.74], c: [1, .7, .34], k: .036, r: .2, shadow: 1, reach: .5 },      /* its light reaching the shelf, weak */
    { p: [-.5, 1.34, 3.8], c: [1, .72, .38], k: .035, r: .07, reach: .15 },             /* the last of it, grazing the rod's honed edge */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1., r: 1.2 },                           /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .4, r: 1 },
    { p: [-.4, .95, 3.4], c: [.4, .37, .85], k: .1, r: .5 },                             /* violet on the wall under the shelf */
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)')
    .replace(/\n.*vec3\(-\.5, 1\.2, 3\.84\).*\n/, '\n')                   /* the plank shelf, its pegs and the rod: drawn below, in stone */
    .replace(/\n.*p\.y - 1\.16\)\).*\n/, '\n')
    .replace(/\n.*M_SLATE, NOUV\)\);\n/, '\n') + /* glsl */ `
  /* the rod, in its own frame: u from the blade's point (0) to the handle's butt (.38); y up; z across, the honed
     edge on the side toward the room (z -) */
  float gEdge = 0., gMark = 0.;
  vec4 rod(vec3 p) {
    vec3 o = vec3(-.68, 1.262, 3.94);                                               /* the point, on its chip */
    vec3 q = p - o; float b = .34, cb = cos(b), sb = sin(b); q.xz = vec2(cb * q.x - sb * q.z, sb * q.x + cb * q.z);
    float a = .045, ca = cos(a), sa = sin(a); q.xy = vec2(ca * q.x - sa * q.y, sa * q.x + ca * q.y);   /* the point lifted */
    float u = q.x, L = .38;
    float bl = 1. - smoothstep(.16, .26, u);                                       /* 1 along the blade, 0 on the handle */
    float tip = sqrt(clamp(u / .06, .08, 1.));
    float w = mix(.0125, .016, bl) * tip;                                          /* half width */
    float t = mix(.0105, .0072, bl) * mix(.6, 1., tip);                            /* half thickness */
    /* the blade's section: full on the spine, ground away to nothing at the edge */
    float bev = .45 * w;
    float ty = t * mix(1., clamp((q.z + w) / bev, .04, 1.), bl);
    float sec = max(abs(q.y) - ty, abs(q.z) - w) * .7;
    float ell = (length(vec2(q.y / t, q.z / w)) - 1.) * min(t, w);                 /* the handle's section, worn round */
    float s = mix(ell, sec, bl);
    float ends = max(-u, u - L);
    float r = max(s, ends) - .0012;
    r += rough(p, .0006, 120.);
    /* the honed edge: a thin line along the blade */
    gEdge = bl * smoothstep(.02, .06, u) * (1. - smoothstep(.0012, .004, q.z + w)) ;
    /* on the handle's top: a line of marks in cells, and in the last cell's corner a hook with a tail */
    gMark = 0.;
    if (u > .23 && u < .355 && q.y > 0.) {
      float cellW = .021, k = floor((u - .23) / cellW), fu = u - .23 - k * cellW + (h2(vec2(k, 3.)) - .5) * .004;
      float tick = abs(fu - .002);                                                  /* a cut across the handle between the cells */
      float line = abs(q.z + .003);                                                 /* the line along them */
      float m = min(tick < .0011 && abs(q.z) < .0075 ? tick : 1., line < .001 ? line : 1.);
      if (k > 4.5) {                                                                /* the last cell: the hook with its tail */
        vec2 h = vec2(fu - .012, q.z - .0045);
        float hook = abs(length(h) - .0032); if (h.y < 0. && h.x < 0.) hook = 1.;
        float tail = length(vec2(h.x - .0032 + clamp(h.x - .0032, -.0, 0.), max(abs(h.y + .002) - .003, 0.))) ;
        tail = h.x > .0025 && h.y < 0. ? abs(h.x - .0032) + max(-h.y - .006, 0.) : 1.;
        m = min(m, min(hook, tail));
      }
      gMark = 1. - smoothstep(.0005, .0011, m);
      r += gMark * .0006;
    }
    return vec4(r, M_SLATE, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.32) gTint *= mix(1., .3, smoothstep(1.32, 1.85, p.y));              /* the vault going dark overhead */
    if (p.y < .03) gTint *= .35;                                                       /* the floor, out of the light */
    if (p.z > 3.97 && p.y > 1.24) gTint *= mix(1., .6, smoothstep(1.24, 1.5, p.y));   /* the wall above the shelf kept back: the lamp's light is on the shelf, not the wall */
    /* the shelf: a ledge of cut stone let into the back wall, its front edge worn */
    vec4 sh = box(p, vec3(-.5, 1.21, 3.9), vec3(.47, .024, .11), M_DRESSED);
    sh.x -= .006; sh.x += rough(p, .003, 22.);
    if (sh.x < d.x) { d = sh; gTint = vec3(.5, .48, .58) * (.8 + .35 * fbm(p.xz * vec2(9, 14), 3)) * mix(1., .55, smoothstep(3.84, 3.78, p.z)); }   /* its front edge rounded off into shadow */
    /* the chip the blade's point rests on */
    vec3 cq = p - vec3(-.682, 1.244, 3.942);
    float chip = (length(cq / vec3(.016, .011, .013)) - 1.) * .01 + rough(p, .003, 80.);
    vec4 ch = vec4(chip, M_ROCK, NOUV);
    if (ch.x < d.x) { d = ch; gTint = vec3(.45, .43, .5); }
    vec4 r = rod(p);
    if (r.x < d.x) {
      d = r;
      gTint = vec3(.3, .29, .34) * (.85 + .3 * fbm(p.xz * 70., 2)); gStain = .35;           /* one dark stone, matt */
      gTint *= 1. - .6 * gMark;
      gTint = mix(gTint, vec3(4., 2.9, 1.7), gEdge); gPolish = gEdge; gStain *= 1. - gEdge;  /* the honed edge takes the light */
    }
    /* under the shelf, a pencilled line on the wall: graphite, grey with a faint sheen */
    if (p.z > 3.97 && abs(p.y - .99 - .004 * sin(p.x * 9.)) < .004 && p.x > -.86 && p.x < -.2) { gTint = vec3(.3, .3, .36); gPolish = .6; }
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.3, 1.5, 3.4], w: .3 }],
    glints: [{ p: [-.55, 1.27, 3.8] }],
  },
  live: { motes: 'gold', gold: true },
};
