/* SEALED (D-015). pt-b-2.B, the rod, round 3 (room scale, D-075): her shelf in the Survey Cut (pt-b-1.C's room,
   reused), seen from the middle of the room, past the foot of her cot. On the plank shelf on the back wall the rod
   of stone lies at a low diagonal, forearm-long, dark and fine-grained, its blade end lifted on a chip of stone;
   its one fine edge takes the last of the clay lamp's light, which comes weak and warm from the doorway behind you,
   and is the brightest line in the room. Under the shelf a pencilled line on the wall. Violet in the corners. */
import room from './pt-b-1.C.js';

export default {
  ...room,
  id: 'pt-b-2.B',
  name: 'The rod',
  line: '',
  cam: { x: .08, y: 1.44, z: 3.0, pitch: -8, yaw: -40, f: 1.02, cx: .5, cy: .5 },   /* standing past the cot's foot, turned to the shelf */
  far: 9, fogK: 1 / 15,
  bloomAt: [-.45, 1.25, 3.78], bloomPow: 24, bloomC: [.05, .038, .018],
  blur: { px: 1.3, d0: 1.4, d1: 3.2, k: .6 },
  expo: 2.15,
  lights: [
    { ...room.lights[0], k: 7 },                                                          /* the clay lamp, in the passage behind you */
    { p: [-.35, 1.6, 3.35], c: [1, .7, .34], k: .05, r: .25, warm: .003, shadow: 1 },      /* its light reaching the shelf, weak */
    { p: [-.62, 1.4, 3.6], c: [1, .7, .34], k: .06, r: .14, shadow: 1 },              /* a small pool of it on the wall behind the rod */
    { p: [-.69, 1.29, 3.74], c: [1, .72, .38], k: .02, r: .06, shadow: .6 },               /* the last of it, grazing the rod's honed edge */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.1, r: 1.2 },                           /* violet in the far corners */
    { p: [1.35, 1.9, 3.7], c: [.4, .37, .85], k: .6, r: 1 },
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)')
    .replace(/\n.*M_SLATE, NOUV\)\);\n/, '\n') +              /* the rod is not lying square on the shelf: it is drawn below */ /* glsl */ `
  /* the rod, in its own frame: u along it, from the blade's point (u -.2) to the handle's end (u .17); the honed
     edge on the side toward the room (z -) */
  float gEdge = 0.;
  vec4 rod(vec3 p) {
    vec3 o = vec3(-.62, 1.231, 3.8);                                               /* the handle's end rests on the shelf */
    float a = .05, ca = cos(a), sa = sin(a);                                       /* the blade end lifted a little, on its chip */
    vec3 q = p - o; float b = .3, cb = cos(b), sb = sin(b); q.xz = vec2(cb * q.x - sb * q.z, sb * q.x + cb * q.z);
    q.xy = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float u = q.x;                                                                   /* the blade toward the shelf's left end */
    float bl = clamp((u + .2) / .19, 0., 1.);
    float w = .014 * mix(.4, 1., sqrt(bl));
    float t = .008 * mix(.55, 1., bl) * smoothstep(-w, -w * .1, q.z) + .0008;
    float blade = max(max(abs(q.y) - t, abs(q.z) - w), max(-.2 - u, u - .02));
    blade = max(blade, length(vec2(max(-.18 - u, 0.) * 1.3, q.z)) - w);            /* the point rounded */
    blade *= .6;
    float hr = .0098 - .002 * smoothstep(.13, .17, u);                              /* the handle: the same stone, worn round */
    float handle = (length(vec3(max(abs(u - .09) - .08, 0.) / hr, q.y / (hr * .75), q.z / (hr * 1.25))) - 1.) * hr * .75;
    float r = smin(blade, handle, .01) + rough(p, .0005, 90.);
    gEdge = (1. - smoothstep(-.01, .03, u)) * smoothstep(-w + .003, -w + .0003, q.z);   /* the honed edge, fading along the blade */
    return vec4(r, M_SLATE, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.45) gTint *= mix(1., .45, smoothstep(1.45, 2.3, p.y));              /* the vault going dark overhead */
    if (p.y < .03) gTint *= mix(.25, .55, smoothstep(3., 3.8, p.z));               /* the floor near you, out of the light */
    if (p.z > 3.86) gTint *= mix(1., .55, smoothstep(.35, .9, length(vec2(p.x + .5, (p.y - 1.2) * 1.4))));   /* the back wall kept back round the shelf */
    /* the shelf: old wood, worn at its front edge */
    if (p.y > 1.18 && p.y < 1.222 && p.z > 3.7 && p.z < 3.97 && p.x > -.95 && p.x < -.05 && d.x < .005) gTint *= (.6 + .3 * fbm(p.xz * vec2(30, 5), 3)) * (p.y > 1.216 ? .8 : .45);
    /* the chip the blade's point rests on */
    vec3 cq = p - vec3(-.795, 1.226, 3.858);
    float chip = (length(cq / vec3(.018, .01, .014)) - 1.) * .009 + rough(p, .004, 70.);
    vec4 ch = vec4(chip, M_ROCK, NOUV);
    if (ch.x < d.x) { d = ch; gTint = vec3(.4); }
    vec4 r = rod(p);
    if (r.x < d.x) { d = r; gTint = vec3(.2, .2, .22) * (.85 + .3 * fbm(p.xz * 60., 2)); gPolish = gEdge; gTint = mix(gTint, vec3(2.), gEdge); }
    /* under the shelf, a pencilled line on the wall: graphite, grey with a faint sheen */
    if (p.z > 3.86 && abs(p.y - 1.1 - .004 * sin(p.x * 9.)) < .005 && p.x > -.86 && p.x < -.18) { gTint = vec3(1.1, 1.1, 1.2); gPolish = .6; }
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.2, 1.5, 3.2], w: .35 }],
    glints: [{ p: [-.72, 1.243, 3.8] }],
  },
  live: { motes: 'gold', gold: true },
};
