/* SEALED (D-015). pt-b-2.B, the rod, round 2: her shelf in the Survey Cut (the room is pt-b-1.C's, reused),
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
  cam: { x: -.69, y: 1.3, z: 3.63, pitch: -16, yaw: 50, f: .8, cx: .5, cy: .5 },   /* low and close at the blade end, looking along it */
  far: 8, fogK: 1 / 14,
  bloomAt: [-.55, 1.26, 3.75], bloomPow: 30, bloomC: [.06, .045, .02],
  blur: { px: 1.2, d0: .55, d1: 1.6, k: .8 },
  expo: 2.35,
  lights: [
    { p: [.2, 1.75, 2.3], c: [1, .7, .34], k: .3, r: .6, warm: .003, shadow: 1 },    /* the lamp's light from the doorway behind, weak */
    { p: [-.45, 1.262, 3.715], c: [1, .7, .34], k: .014, r: .05, shadow: 1 },          /* the last of it, grazing the rod's honed edge */
    { p: [-1.3, 1.9, 3.6], c: [.4, .37, .85], k: 1.4, r: 1.2 },                         /* violet in the far corners */
    { p: [.9, 1.8, 3.7], c: [.4, .37, .85], k: .12, r: 1 },
  ],
  glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)')
    .replace(/\n.*M_SLATE, NOUV\)\);\n/, '\n') +              /* the rod is not lying on the shelf now: it is drawn below */ /* glsl */ `
  /* the rod, in its own frame: u along it, from the blade's point (u -.2) to the handle's end (u .17); the honed
     edge on the side toward the room (z -) */
  bool gEdge = false;
  vec4 rod(vec3 p) {
    vec3 o = vec3(-.5, 1.2405, 3.8);                                                /* the handle's end rests on the shelf */
    float a = .08, ca = cos(a), sa = sin(a);                                       /* the blade end lifted a little, on its chip */
    vec3 q = p - o; float b = -.32, cb = cos(b), sb = sin(b); q.xz = vec2(cb * q.x - sb * q.z, sb * q.x + cb * q.z);
    q.xy = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float u = -q.x;
    /* the blade: narrowing to a rounded point, thick along its back, bevelled down to nothing at the edge */
    float bl = clamp((u + .2) / .19, 0., 1.);
    float w = .013 * mix(.35, 1., sqrt(bl));
    float t = .0072 * mix(.55, 1., bl) * smoothstep(-w, -w * .1, q.z) + .0006;
    float blade = max(max(abs(q.y) - t, abs(q.z) - w), max(-.2 - u, u - .005));
    blade = max(blade, length(vec2(max(-.185 - u, 0.) * 1.4, q.z)) - w);        /* the point rounded */
    blade *= .6;
    /* the handle: a worn round of the same stone, a little swollen, narrowing to its end */
    float hr = .0115 + .0015 * sin(clamp((u - .005) / .165, 0., 1.) * 3.1) - .003 * smoothstep(.14, .17, u);
    float handle = length(vec3(max(abs(u - .0875) - .0825, 0.), q.yz - vec2(.0005, .001))) - hr;   /* its end worn round */
    float r = smin(blade, handle, .006) + rough(p, .0006, 180.);
    gEdge = u < .005 && q.z < -w + .0012;                                            /* the edge, honed bright (applied only on the rod itself) */
    /* the handle's marks, cut not moulded: a line of small cells, and in the last cell's corner a hook with a tail */
    if (u > .025 && u < .17 && q.y > .004) {
      float k = floor((u - .025) / .02), fu = u - .025 - (k + .5) * .02 + (h2(vec2(k, 9.)) - .5) * .004;
      float mk = h2(vec2(k, 4.)) < .5 ? length(vec2(fu, max(abs(q.z) - .004 - .003 * h2(vec2(k, 1.)), 0.)))
                                      : length(vec2(fu + q.z * .6, max(abs(q.z) - .004, 0.)));
      if (k < 6.) r += engrave(mk, .0014, .0009);
      if (k == 6.) {
        vec2 h = vec2(fu - .003, q.z + .002);
        float hook = max(abs(length(h) - .0035), -h.y);
        hook = min(hook, length(vec2(h.x + .0035, max(abs(h.y + .0035) - .0035, 0.))));
        r += engrave(hook, .0012, .0009);
      }
    }
    return vec4(r, M_SLATE, NOUV);
  }
  vec4 scene(vec3 p) {
    vec4 d = roomScene(p);
    if (p.y > 1.28) gTint *= mix(1., .5, smoothstep(1.26, 1.6, p.y));               /* the wall above the shelf going dark */
    if (p.y < 1.19) gTint *= mix(.4, 1., smoothstep(.9, 1.19, p.y));                 /* and below it */
    gTint *= mix(1., .35, smoothstep(.15, .55, length((p - vec3(-.5, 1.24, 3.8)) * vec3(.8, 1., 1.))));   /* the room beyond the rod kept back, in the dark */
    if (p.y > 1.175 && p.y < 1.222 && p.z < 3.726) gTint *= .3;                            /* the shelf's front edge, in its own shadow */
    /* the chip the blade's point rests on: a small broken flake, not a stand */
    vec3 cq = p - vec3(-.33, 1.232, 3.853);
    float chip = (length(cq / vec3(.02, .011, .015)) - 1.) * .01 + rough(p, .006, 70.) + abs(cq.x + cq.z) * .15;
    vec4 ch = vec4(chip, M_ROCK, NOUV);
    if (ch.x < d.x) { d = ch; gTint = vec3(.42); }
    vec4 r = rod(p);
    if (r.x < d.x) { d = r; gTint = vec3(.55); if (gEdge) { gPolish = 1.; gTint = vec3(1.6); } }
    /* under the shelf, a pencilled line on the wall: graphite, grey with a faint sheen */
    if (p.z > 3.86 && abs(p.y - 1.13 - .004 * sin(p.x * 9.)) < .004 && p.x > -.84 && p.x < -.2) { gTint = vec3(.6, .6, .66); gPolish = .6; }
    return d;
  }`,
  anchors: {
    beam: [{ p: [-.42, 1.33, 3.76], w: .15 }],
    glints: [{ p: [-.36, 1.258, 3.84] }],
  },
  live: { motes: 'gold', gold: true },
};
