/* SEALED (D-015). pt-b-2.B, the rod, round 1: her shelf in the Survey Cut (the room is pt-b-1.C's, reused),
   close. The rod of stone, forearm-long, dark and fine-grained, lying at a low diagonal with its blade end
   lifted on a chip of stone; one edge finer than a knife, catching the lamp's light like a blade. On its handle
   a line of marks, and in the last cell's corner a hook with a tail. Under the shelf, a pencilled line on the
   wall. The clay lamp's light comes weak and warm from the doorway behind; violet in the corners. */
import room from './pt-b-1.C.js';

export default {
  ...room,
  id: 'pt-b-2.B',
  name: 'The rod',
  line: '',
  cam: { x: -.5, y: 1.36, z: 3.44, pitch: -20, yaw: -3, f: .64, cx: .5, cy: .5 },
  far: 8, fogK: 1 / 14,
  bloomAt: [-.55, 1.26, 3.75], bloomPow: 30, bloomC: [.06, .045, .02],
  blur: { px: 1.2, d0: 1.1, d1: 2.6, k: .7 },
  expo: 2.35,
  lights: [
    { p: [.2, 1.75, 2.3], c: [1, .7, .34], k: .45, r: .6, warm: .004, shadow: 1 },   /* the lamp's light from the doorway behind, weak */
    { p: [-.3, 1.7, 3.2], c: [1, .7, .34], k: .1, r: .2, shadow: 1 },             /* the last of it, catching the rod's edge */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.1, r: 1.2 },                       /* violet in the far corners */
    { p: [.9, 1.8, 3.7], c: [.4, .37, .85], k: .5, r: 1 },
      ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)')
    .replace(/\n.*M_SLATE, NOUV\)\);\n/, '\n') +              /* the rod is not lying on the shelf now: it is drawn below */ /* glsl */ `
  /* the rod: u along it (blade end at -), a blade whose front edge thins to nothing, then a round handle */
  vec4 rod(vec3 p) {
    vec3 o = vec3(-.52, 1.257, 3.8);
    float a = -.1, ca = cos(a), sa = sin(a);                                        /* the blade end lifted a little */
    vec3 q = p - o; float b = -.32, cb = cos(b), sb = sin(b); q.xz = vec2(cb * q.x - sb * q.z, sb * q.x + cb * q.z);   /* turned on the shelf, the handle toward you */
    q.xy = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float u = q.x;
    float t = .009 * clamp((q.z + .013) / .02, 0., 1.);
    float blade = max(max(abs(q.y) - t, abs(q.z + .002) - .011), abs(u + .075) - .15) * .7;
    float handle = length(max(vec2(length(q.yz - vec2(0, .002)) - .013, abs(u - .145) - .08), 0.));
    float r = min(blade, handle);
    if (u < .075 && q.z < -.008) gPolish = smoothstep(-.008, -.012, q.z);            /* the fine edge, honed bright */
    /* the handle's marks: a line of small cells, and in the last cell's corner a hook with a tail */
    if (u > .08 && q.y > .006) {
      float k = floor((u - .08) / .022), fu = u - .08 - (k + .5) * .022;
      float mk = h2(vec2(k, 4.)) < .5 ? length(vec2(fu, max(abs(q.z) - .006, 0.))) : length(vec2(fu + q.z * .6, max(abs(q.z) - .005, 0.)));
      if (k < 6.) r += engrave(mk, .0018, .0014);
      if (k == 6.) {
        vec2 h = vec2(fu - .004, q.z + .003);
        float hook = max(abs(length(h) - .004) , -h.y);                                /* the hook */
        hook = min(hook, length(vec2(h.x + .004, max(abs(h.y + .004) - .004, 0.))));  /* and its tail */
        r += engrave(hook, .0015, .0014);
      }
    }
    return vec4(r, M_SLATE, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.3) gTint *= mix(1., .25, smoothstep(1.28, 1.55, p.y));               /* the wall above the shelf going dark */
    vec4 chip = box(p, vec3(-.71, 1.243, 3.75), vec3(.016, .024, .014), M_ROCK); chip.x -= .003 - rough(p, .003, 60.);
    if (chip.x < d.x) { d = chip; gTint = vec3(.45); }    /* the chip the blade end rests on */
    vec4 r = rod(p);
    if (r.x < d.x) { d = r; gTint = vec3(.8); }
    /* under the shelf, a pencilled line on the wall */
    if (p.z > 3.86 && abs(p.y - 1.13 - .004 * sin(p.x * 9.)) < .0022 && p.x > -.84 && p.x < -.2) gTint = vec3(.42, .42, .48);
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.45, 1.35, 3.75], w: .2 }],
    glints: [{ p: [-.6, 1.25, 3.83] }],
  },
  live: { motes: 'gold', gold: true },
};
