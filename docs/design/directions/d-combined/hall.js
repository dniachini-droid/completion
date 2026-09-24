/* ==========================================================================
   hall.js — the one painted Lamp Hall for direction D.

   A long, high hall rounded like the inside of a shell: the walls swell a
   little and curve without a break into a slightly pointed vault, far taller
   than wide. Large cut blocks with chisel texture and bevelled joints; a line
   of dark wall-cups (recesses in perspective) a third of the way up; the
   heavy lintel ON the left side wall over a sealed blank; the clay lamp,
   always lit, on its ledge on the right wall; purple light and deep haze
   toward the great door at the far end. One vanishing point.

   It is painted per pixel (a small ray-caster: lit masses, relief from a
   point light, fog and blur by depth), then light and flame go on top in SVG.

   Usage:
     var h = Hall.draw(el, {
       scene: 'hall' | 'stair',          // the stair beyond the lintel uses the same hand
       cam: { x, y, z, pitch, f, cx, cy }, // position (m), pitch (deg, − looks down),
                                         // focal length and principal point as fractions of width / height
       cups: 'dark' | 'waking' | 'lit',  // dark everywhere except during the cut
       lintel: 'sealed' | 'open' | 'opening',  // 'opening' paints both states for the cut
       gold: 0..1,                       // how much the lamp's warmth has spread
       res: 1                            // render resolution multiplier (× devicePixelRatio, max 2)
     });
     h.project(x, y, z) → [px, py]       // world → element pixels
     h.onRod(u, v)      → [px, py]       // the lintel's rod-shaped blank: u 0..1 near→far, v 0..1 bottom→top
     h.openStone(ms)                     // 'opening' only: the slab sinks and the light spills
     h.wake()                            // cups wake one by one, near to far (CSS: .hall.cups-waking)

   Sample world. Every mark on the lintel is an invented sample shape.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- noise ---------- */
  function h2(x, y) {
    var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vn(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, o) {
    var s = 0, a = .5, n = 0;
    for (var i = 0; i < o; i++) { s += a * vn(x, y); n += a; x = x * 2.03 + 17.1; y = y * 2.01 + 3.7; a *= .5; }
    return s / n;
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- the section: a shell ---------- */
  function catmull(pts, seg) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (var k = 0; k < seg; k++) {
        var t = k / seg, t2 = t * t, t3 = t2 * t;
        out.push([
          .5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }
  /* right half, floor to apex (metres). Swells to its widest a little under half height,
     then curves in to a slightly pointed crown: about 2.8 times taller than wide. */
  var HALL_HALF = [[2.3, 0], [2.45, 1.2], [2.56, 2.4], [2.64, 3.6], [2.69, 4.8], [2.7, 6.0], [2.65, 7.2], [2.53, 8.4],
    [2.3, 9.6], [1.95, 10.8], [1.48, 11.9], [.92, 12.8], [.4, 13.4], [0, 13.75]];

  function buildSection(half, scale, bottom) {
    var hp = catmull(half.map(function (p) { return [p[0] * scale[0], p[1] * scale[1]]; }), 6);
    var arch = hp.slice();
    for (var i = hp.length - 2; i >= 0; i--) arch.push([-hp[i][0], hp[i][1]]);
    var poly = arch.slice(), floorY = 0;
    if (bottom != null) { poly.unshift([hp[0][0], bottom]); poly.push([-hp[0][0], bottom]); floorY = bottom; }
    var E = [], s = 0, n = poly.length, archStart = bottom != null ? 1 : 0, archEnd = archStart + arch.length - 1;
    for (i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      var nx = dy / L, ny = -dx / L;
      var isFloor = (bottom == null && i === n - 1);
      E.push({ ax: a[0], ay: a[1], dx: dx, dy: dy, L: L, nx: nx, ny: ny, c: nx * a[0] + ny * a[1], s0: s, floor: isFloor });
      s += L;
    }
    /* smooth normals: average with neighbours (not across the floor corner) */
    for (i = 0; i < n; i++) {
      var e = E[i], p = E[(i - 1 + n) % n], q = E[(i + 1) % n];
      var ok0 = !e.floor && !p.floor && Math.abs(p.nx * e.nx + p.ny * e.ny) > .7;
      var ok1 = !e.floor && !q.floor && Math.abs(q.nx * e.nx + q.ny * e.ny) > .7;
      var ax = ok0 ? p.nx + e.nx : e.nx, ay = ok0 ? p.ny + e.ny : e.ny, la = Math.hypot(ax, ay);
      var bx = ok1 ? q.nx + e.nx : e.nx, by = ok1 ? q.ny + e.ny : e.ny, lb = Math.hypot(bx, by);
      e.n0x = ax / la; e.n0y = ay / la; e.n1x = bx / lb; e.n1y = by / lb;
    }
    var wallAt = function (y) { /* the right wall's x at height y (y ≥ 0 part) */
      for (var j = 0; j < hp.length - 1; j++) if (hp[j + 1][1] >= y) {
        var t = (y - hp[j][1]) / (hp[j + 1][1] - hp[j][1]); return hp[j][0] + (hp[j + 1][0] - hp[j][0]) * t; }
      return 0;
    };
    return { E: E, total: s, wallAt: wallAt, floorY: floorY, crown: hp[hp.length - 1][1] };
  }

  /* exit distance of a 2D ray from inside the (convex) section, tabulated by angle */
  function angleTable(sec, ox, oy, N) {
    var R = new Float32Array(N), I = new Int16Array(N), F = new Float32Array(N), E = sec.E;
    for (var k = 0; k < N; k++) {
      var th = -Math.PI + (k + .5) * 2 * Math.PI / N, dx = Math.cos(th), dy = Math.sin(th), best = 1e9, bi = 0;
      for (var i = 0; i < E.length; i++) {
        var e = E[i], nd = e.nx * dx + e.ny * dy;
        if (nd > 1e-9) { var t = (e.c - e.nx * ox - e.ny * oy) / nd; if (t < best) { best = t; bi = i; } }
      }
      var e2 = E[bi], hx = ox + best * dx - e2.ax, hy = oy + best * dy - e2.ay;
      R[k] = best; I[k] = bi; F[k] = clamp((hx * e2.dx + hy * e2.dy) / (e2.L * e2.L), 0, 1);
    }
    return { R: R, I: I, F: F, N: N };
  }

  /* ray / axis-aligned box: returns [t, nx, ny, nz] or null */
  function hitBox(ox, oy, oz, dx, dy, dz, b) {
    var t0 = -1e9, t1 = 1e9, ax = 0, n = 0, s = 0, lo, hi, o, d, ta, tb, sg;
    for (var i = 0; i < 3; i++) {
      if (i === 0) { lo = b[0]; hi = b[1]; o = ox; d = dx; } else if (i === 1) { lo = b[2]; hi = b[3]; o = oy; d = dy; } else { lo = b[4]; hi = b[5]; o = oz; d = dz; }
      if (Math.abs(d) < 1e-12) { if (o < lo || o > hi) return null; continue; }
      ta = (lo - o) / d; tb = (hi - o) / d; sg = -1;
      if (ta > tb) { var tmp = ta; ta = tb; tb = tmp; sg = 1; }
      if (ta > t0) { t0 = ta; ax = i; s = sg; }
      if (tb < t1) t1 = tb;
      if (t0 > t1) return null;
    }
    if (t1 < 0 || t0 < 0) return null;
    return [t0, ax === 0 ? s : 0, ax === 1 ? s : 0, ax === 2 ? s : 0];
  }

  /* ---------- the sample marks on the lintel (abstract, invented; no figure) ---------- */
  /* in face units: u along the beam (m, from its near end), v up (m, from its underside) */
  var LINTEL_MARKS = [
    /* a hooked bar */
    [[.30, .16], [.30, .62], [.46, .62], [.46, .50]],
    /* a notched square */
    [[.66, .18], [.66, .60], [.78, .60], [.78, .52], [.88, .52], [.88, .60], [1.0, .60], [1.0, .18], [.66, .18]]
  ];

  /* ---------- the scene ---------- */
  function makeScene(o) {
    var S = { stair: o.scene === 'stair' };
    if (S.stair) {
      S.sec = buildSection(HALL_HALF, [.72, .72], -90);
      S.zFar = 90; S.zLip = 1.05; S.tread = .38; S.riser = .3;
      S.lights = [
        { x: 0, y: -26, z: 31, c: [.78, .72, 1.25], k: 260, r: 9 },     /* light from below, far down the stair */
        { x: 0, y: -9, z: 12, c: [.6, .55, 1.1], k: 22, r: 4 },
        { x: .3, y: 3.2, z: -.6, c: [.5, .47, .95], k: 2.6, r: 2.2 }       /* the lintel's light behind you, falling on the treads */
      ];
      S.fogK = 1 / 30; S.boxes = []; S.niches = []; S.door = null;
    } else {
      S.sec = buildSection(HALL_HALF, [1, 1], null);
      S.zFar = 66;
      var g = o.gold || 0;
      S.lamp = { x: 2.36, y: 1.4, z: 5.6 };
      S.lights = [
        { x: 0, y: 5.5, z: 58, c: [.62, .58, 1.25], k: 420, r: 36 },      /* the far end: the great door's light */
        { x: 0, y: 9, z: 20, c: [.36, .33, .8], k: 26, r: 12 },           /* haze high in the vault */
        { x: 0, y: 7, z: -4, c: [.3, .28, .66], k: 5, r: 7 },             /* soft fill from behind you */
        { x: S.lamp.x - .1, y: S.lamp.y + .14, z: S.lamp.z, c: [1, .58, .24], k: 1.1 + 4 * g, r: .75 + 1.5 * g, warm: 1 }
      ];
      S.fogK = 1 / 34;
      /* the lamp's ledge */
      S.boxes = [{ b: [2.2, 2.9, 1.12, 1.32, 5.22, 5.98], kind: 'ledge' }];
      /* the lintel: a heavy beam on the left wall over a sealed blank */
      S.door = { z0: 6.55, z1: 8.05, y1: 2.4, side: -1 };
      S.beam = [-2.98, -2.4, 2.4, 3.25, 6.0, 8.6];
      S.boxes.push({ b: S.beam, kind: 'beam' });
      /* wall-cups: recesses on both walls, a third of the way up */
      S.niches = [];
      for (var k = 0; k < 20; k++) {
        var zc = 2.2 + k * 3.1;
        S.niches.push({ side: 1, z0: zc - .34, z1: zc + .34, y0: 3.5, y1: 4.5, zc: zc });
        S.niches.push({ side: -1, z0: zc + 1.21, z1: zc + 1.89, y0: 3.5, y1: 4.5, zc: zc + 1.55 });
      }
      if (o.lintel === 'open') S.lights.push({ x: -2.8, y: -.8, z: 7.3, c: [.72, .66, 1.25], k: 10, r: 2.2, spill: 1 });
      S.lights.push({ x: 1.2, y: 2.6, z: 6.5, c: [.4, .37, .85], k: 3.2, r: 3.2 });   /* the hall's own glow on the lintel wall */
    }
    return S;
  }

  function archTop(N, z) { var r = (N.z1 - N.z0) / 2, dz = z - (N.z0 + r); return N.y1 - r + Math.sqrt(Math.max(0, r * r - dz * dz)); }

  /* ---------- the renderer ---------- */
  function render(canvas, W, H, dpr, o, S) {
    var cam = o.cam, w = Math.round(W * dpr), h = Math.round(H * dpr);
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d'), img = ctx.createImageData(w, h), px = img.data;
    var depth = new Float32Array(w * h);
    var f = cam.f * W * dpr, cx = cam.cx * W * dpr, cy = cam.cy * H * dpr;
    var pr = (cam.pitch || 0) * Math.PI / 180, cp = Math.cos(pr), sp = Math.sin(pr);
    var Ox = cam.x, Oy = cam.y, Oz = cam.z;
    var sec = S.sec, E = sec.E, NT = 16384, T = angleTable(sec, Ox, Oy, NT);
    var shm = S.stair ? S.riser / S.tread : 0, TS = S.stair ? angleTable(sec, Ox, Oy + shm * (Oz - S.zLip), NT) : null;
    var LK_i = 0, LK_f = 0, LK_t = 0;
    function look(Tb, ax, ay) {
      var l2 = Math.sqrt(ax * ax + ay * ay);
      var th = Math.atan2(ay, ax), kf = (th + Math.PI) / (2 * Math.PI) * NT - .5, k0 = Math.floor(kf), fr = kf - k0;
      var ka = (k0 + NT) % NT, kb = (k0 + 1) % NT;
      var ei = Tb.I[ka], r2d = Tb.R[ka], efr = Tb.F[ka];
      if (Tb.I[kb] === ei) { r2d += (Tb.R[kb] - r2d) * fr; efr += (Tb.F[kb] - efr) * fr; }
      LK_i = ei; LK_f = efr; LK_t = r2d / l2;
    }
    var open = o.lintel === 'open', gold = o.gold || 0;
    var lights = S.lights, nl = lights.length;
    /* screen boxes for the solid objects, for a cheap test */
    var boxes = S.boxes.map(function (bx) {
      var b = bx.b, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (var i = 0; i < 8; i++) {
        var p = proj(b[i & 1], b[2 + ((i >> 1) & 1)], b[4 + ((i >> 2) & 1)]);
        if (!p) { x0 = -1e9; x1 = 1e9; y0 = -1e9; y1 = 1e9; break; }
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
      }
      return { b: b, kind: bx.kind, x0: x0 - 2, x1: x1 + 2, y0: y0 - 2, y1: y1 + 2 };
    });
    function proj(x, y, z) { /* world → canvas pixels */
      var X = x - Ox, Y = y - Oy, Z = z - Oz;
      var yc = Y * cp - Z * sp, zc = Y * sp + Z * cp;
      if (zc < .05) return null;
      return [cx + f * X / zc, cy - f * yc / zc];
    }
    var farDir = (function () { var X = 0 - Ox, Y = 4.5 - Oy, Z = S.zFar - Oz, L = Math.hypot(X, Y, Z); return [X / L, Y / L, Z / L]; })();
    if (S.stair) { var mL = Math.hypot(1, shm); farDir = [0, -shm / mL, 1 / mL]; }
    var col = [0, 0, 0];

    function lightAt(x, y, z, nx, ny, nz, alb, out, wrap) {
      /* ambient: violet, a little more from above */
      var am = .016 + .012 * (ny * .5 + .5);
      var r = alb[0] * am * .9, g = alb[1] * am * .85, b = alb[2] * am * 1.9;
      for (var i = 0; i < nl; i++) {
        var L = lights[i], lx = L.x - x, ly = L.y - y, lz = L.z - z, d2 = lx * lx + ly * ly + lz * lz, d = Math.sqrt(d2);
        var ndl = (nx * lx + ny * ly + nz * lz) / d;
        var wr = wrap != null ? wrap : .25;
        ndl = (ndl + wr) / (1 + wr); if (ndl <= 0) continue;
        var att = L.k / (1 + d2 / (L.r * L.r)) / (L.r * L.r) * 1.0;
        if (L.warm) att *= 1;
        var e = ndl * att;
        r += alb[0] * L.c[0] * e; g += alb[1] * L.c[1] * e; b += alb[2] * L.c[2] * e;
      }
      out[0] = r; out[1] = g; out[2] = b;
    }

    var alb = [0, 0, 0], JD = S.stair ? .4 : .62;
    /* stone: blocks with bevelled joints, chisel texture and stain */
    function stone(u, v, fp, courseH, blockL, seed, out, fpv) {
    if (fpv == null) fpv = fp;
      /* hand-cut: the joints wander a little */
      var wu = u + (vn(u * .9 + seed, v * .9) - .5) * .1, wv = v + (vn(u * .8, v * .8 + seed) - .5) * .08;
      var row = Math.floor(wv / courseH), off = h2(row, seed) * blockL, bl = blockL * (.8 + .5 * h2(row, seed + 7));
      var col = Math.floor((wu + off) / bl), fu = (wu + off) / bl - col, fv = wv / courseH - row;
      var du = Math.min(fu, 1 - fu) * bl, dv = Math.min(fv, 1 - fv) * courseH, dj = Math.min(du, dv);
      var jw = .022, j = Math.min(sstep(jw - fp, jw + fp * 1.5 + .004, du), sstep(jw - fpv, jw + fpv * 1.5 + .004, dv));
      var br = h2(col * 31 + row, seed + 3);
      var tone = .82 + .3 * br;
      var fq = Math.min(fp, fpv * 2), detail = fq < .04 ? 1 - fq / .04 : 0;
      var m = fbm(u * .45 + seed, v * .45, 3);                      /* large stain */
      var streak = vn(u * 1.3 + seed, v * .12);                     /* water has run down it */
      var chis = detail > 0 ? (fbm(u * 9, v * 9, 3) - .5) * detail : 0;  /* chisel */
      var t = tone * (.78 + .44 * m) * (1 + .38 * chis);
      /* bevel: the arris toward each joint turns away from the face */
      var bev = .09, tiltU = 0, tiltV = 0;
      if (du < bev) tiltU = (fu < .5 ? -1 : 1) * (1 - du / bev) * .55;
      if (dv < bev) tiltV = (fv < .5 ? -1 : 1) * (1 - dv / bev) * .55;
      /* each block's face is slightly out of true */
      tiltU += (h2(col, row + seed) - .5) * .18 + chis * .25;
      tiltV += (h2(row, col + seed * 3) - .5) * .18 + chis * .2;
      out[0] = t * (JD + (1 - JD) * j) * (.8 + .4 * streak); out[1] = tiltU * j; out[2] = tiltV * j;
      out[3] = j;
    }
    var st = [0, 0, 0, 0];

    var lamp = S.lamp;
    for (var py = 0; py < h; py++) {
      for (var pxi = 0; pxi < w; pxi++) {
        var vx = (pxi + .5 - cx) / f, vy = -(py + .5 - cy) / f;
        var dx = vx, dy = vy * cp + sp, dz = -vy * sp + cp;
        var dl = Math.sqrt(dx * dx + dy * dy + dz * dz), ndx = dx / dl, ndy = dy / dl, ndz = dz / dl;
        look(T, dx, dy);
        var ei = LK_i, efr = LK_f, t = LK_t, kind = 1, nx, ny, nz, u = 0, v = 0, e = E[ei], sheared = false;
        var zh = Oz + t * dz;
        if (TS && zh > S.zLip) {
          /* beyond the lip the whole passage tilts down with the stair (a sheared section) */
          look(TS, dx, dy + shm * dz);
          ei = LK_i; efr = LK_f; t = LK_t; e = E[ei]; zh = Oz + t * dz; sheared = true;
        }
        if (e.floor) kind = 2;
        if (dz <= .02) { t = 1e9; kind = 3; } else if (zh > S.zFar) { t = (S.zFar - Oz) / dz; kind = 3; }
        /* the stair */
        if (S.stair) {
          var hitS = -1, tS = 1e9, sn = 0;
          if (dy < 0) {
            var tl = (0 - Oy) / dy, zl = Oz + tl * dz;
            if (zl < S.zLip) { tS = tl; hitS = 0; }
            else if (dz > 0) {
              var s = dy / dz, m = S.riser / S.tread;
              if (s + m < 0) {
                var zs = (m * S.zLip - Oy + Oz * s) / (s + m);
                var k = Math.max(0, Math.floor((zs - S.zLip) / S.tread) - 1);
                for (var kk = k; kk < k + 4; kk++) {
                  var hk = -S.riser * (kk + 1), ze = S.zLip + (kk + 1) * S.tread, te = (ze - Oz) / dz;
                  if (Oy + te * dy <= hk) { tS = (hk - Oy) / dy; hitS = kk + 1; sn = ze; break; }
                }
              }
            }
          }
          if (tS < t) { t = tS; kind = 4; }
        }
        /* solid things: the beam, the ledge */
        var bxk = null, bh = null;
        for (var bi = 0; bi < boxes.length; bi++) {
          var B = boxes[bi];
          if (pxi < B.x0 || pxi > B.x1 || py < B.y0 || py > B.y1) continue;
          var hb = hitBox(Ox, Oy, Oz, dx, dy, dz, B.b);
          if (hb && hb[0] < t) { t = hb[0]; bh = hb; bxk = B; kind = 5; }
        }
        var X = Ox + t * dx, Y = Oy + t * dy, Z = Oz + t * dz, dist = t * dl;
        var fp = dist / f * 1.2, fpv = null, ao = 1, glowAdd = 0, extra = null;
        var albR = .5, albG = .5, albB = .62;

        if (kind === 1) {
          /* wall or vault */
          nx = e.n0x + (e.n1x - e.n0x) * efr; ny = e.n0y + (e.n1y - e.n0y) * efr; nz = sheared ? shm * ny : 0;
          var nL = Math.sqrt(nx * nx + ny * ny + nz * nz); nx = -nx / nL; ny = -ny / nL; nz = -nz / nL;
          u = Z; v = e.s0 + efr * e.L;
          var cosI = Math.abs(nx * ndx + ny * ndy); fpv = dist / f; fp = fpv / Math.max(.12, cosI);
          /* recesses: the wall-cups and the lintel's blank */
          var rec = null, side = X < 0 ? -1 : 1;
          if (Y > 3.4 && Y < 4.6 && S.niches.length) {
            for (var ni = 0; ni < S.niches.length; ni++) { var Nn = S.niches[ni];
              if (Nn.side === side && Z > Nn.z0 && Z < Nn.z1 && Y > Nn.y0 && Y < archTop(Nn, Z)) { rec = Nn; break; } }
          }
          var D = S.door, isDoor = false;
          if (!rec && D && side === D.side && Z > D.z0 && Z < D.z1 && Y < D.y1) { rec = { z0: D.z0, z1: D.z1, y0: 0, y1: D.y1, depth: open ? .55 : .13 }; isDoor = true; }
          if (rec) {
            var depthR = rec.depth || .34, rate = -(nx * dx + ny * dy), tb = t + depthR / Math.max(1e-4, rate), tj = 1e9, jn = null;
            var zb = Oz + tb * dz, yb = Oy + tb * dy, tt;
            if (dz > 0 && zb > rec.z1) { tt = (rec.z1 - Oz) / dz; if (tt < tj) { tj = tt; jn = [0, 0, -1]; } }
            if (dz < 0 && zb < rec.z0) { tt = (rec.z0 - Oz) / dz; if (tt < tj) { tj = tt; jn = [0, 0, 1]; } }
            var ytop = rec.zc != null ? archTop(rec, clamp(zb, rec.z0, rec.z1)) : rec.y1;
            if (dy > 0 && yb > ytop) { tt = (ytop - Oy) / dy; if (tt < tj) { tj = tt; jn = [0, -1, 0]; } }
            if (dy < 0 && yb < rec.y0) { tt = (rec.y0 - Oy) / dy; if (tt < tj) { tj = tt; jn = [0, 1, 0]; } }
            if (tj < tb) {
              t = tj; X = Ox + t * dx; Y = Oy + t * dy; Z = Oz + t * dz; nx = jn[0]; ny = jn[1]; nz = jn[2];
              kind = 6; ao = isDoor ? .75 : .55; u = jn[2] ? Y * 3 : Z; v = jn[2] ? X * 3 : X * 3 + 50;
            } else {
              t = tb; X = Ox + t * dx; Y = Oy + t * dy; Z = Oz + t * dz;
              if (isDoor && open) { kind = 8; }
              else if (isDoor) { kind = 9; ao = .72; u = Z * 1.3 + 40; v = Y * 1.3; }
              else {
                kind = 7; ao = .5;
                /* the cup: a small dark clay bowl sitting on the sill */
                var zl2 = Z - rec.zc, yl = Y - rec.y0;
                var ex = zl2 / .17, ey = (yl - .15) / .13;
                if (yl < .16 && ex * ex + ey * ey < 1) { extra = 'cup'; }
                else if (yl < .19 && yl >= .15 && Math.abs(zl2) < .19) { extra = 'rim'; }
              }
            }
            dist = t * dl;
          }
        } else if (kind === 2) {
          nx = 0; ny = 1; nz = 0; u = Z; v = X + 20;
          fpv = dist / f; fp = fpv / Math.max(.08, Math.abs(ndy));
        } else if (kind === 3) {
          nx = 0; ny = 0; nz = -1; u = X + 30; v = Y;
        } else if (kind === 4) {
          nx = 0; ny = 1; nz = 0; u = Z; v = X + 20; fp = dist / f / Math.max(.08, Math.abs(ndy));
        } else if (kind === 5) {
          nx = bh[1]; ny = bh[2]; nz = bh[3];
          u = nz ? Y * 2 : Z; v = ny ? X * 2 : Y;
          fp = dist / f / Math.max(.12, Math.abs(nx * ndx + ny * ndy + nz * ndz));
        }

        /* albedo and relief */
        var tiltU = 0, tiltV = 0, jmask = 1;
        if (kind === 1 || kind === 6 || kind === 7 || kind === 9) {
          stone(u, v, fp, kind === 9 ? .7 : 1.3, kind === 9 ? 1.4 : 2.9, 11, st, fpv);
          var tone = st[0]; tiltU = st[1]; tiltV = st[2]; jmask = st[3];
          albR *= tone; albG *= tone; albB *= tone;
        } else if (kind === 2 || kind === 4) {
          stone(v, u, fpv || fp, 1.7, 1.25, 5, st, fp);
          var tone2 = st[0] * .92; tiltU = st[1] * .5; tiltV = st[2] * .5;
          albR *= tone2; albG *= tone2; albB *= tone2;
        } else if (kind === 3) {
          stone(u, v, fp, 1.4, 2.6, 19, st); albR *= st[0]; albG *= st[0]; albB *= st[0];
          /* the great door: a tall darker leaf in an arch */
          var ax2 = Math.abs(X), inDoor = (Y < 3.6 && ax2 < 1.25) || (Y >= 3.6 && (ax2 * ax2 + (Y - 3.6) * (Y - 3.6)) < 1.56);
          if (inDoor) { albR *= .35; albG *= .35; albB *= .45; }
        } else if (kind === 5) {
          if (bxk.kind === 'beam') {
            /* one long heavy block, finer dressed; marks cut into its face */
            stone(u * .3 + 3, v * 3 + 1, fp, 9, 9, 23, st);
            var tb2 = st[0] * 1.08; albR *= tb2 * 1.02; albG *= tb2; albB *= tb2 * .98;
            tiltU = st[1] * .4; tiltV = st[2] * .4;
            if (nx > .5) {
              var fu2 = Z - S.beam[4], fv2 = Y - S.beam[2];
              /* the rod-shaped blank: a smoothed, faintly sunk band */
              var rz0 = 1.4, rz1 = 2.3, rv0 = .2, rv1 = .64;
              if (fu2 > rz0 && fu2 < rz1 && fv2 > rv0 && fv2 < rv1) {
                var edgeD = Math.min(fu2 - rz0, rz1 - fu2, fv2 - rv0, rv1 - fv2);
                if (edgeD < .03) { albR *= .45; albG *= .45; albB *= .5; tiltU = fu2 - rz0 < .03 ? .6 : -.6; }
                else { albR *= 1.05; albG *= 1.05; albB *= 1.08; tiltU *= .3; tiltV *= .3; }
              }
              /* the two sample marks */
              for (var mi = 0; mi < LINTEL_MARKS.length; mi++) {
                var M = LINTEL_MARKS[mi], best = 9;
                for (var si = 0; si < M.length - 1; si++) {
                  var ax3 = M[si][0], ay3 = M[si][1], bx3 = M[si + 1][0] - ax3, by3 = M[si + 1][1] - ay3;
                  var tq = clamp(((fu2 - ax3) * bx3 + (fv2 - ay3) * by3) / (bx3 * bx3 + by3 * by3), 0, 1);
                  var ddx = fu2 - ax3 - tq * bx3, ddy = fv2 - ay3 - tq * by3, dd = ddx * ddx + ddy * ddy;
                  if (dd < best) best = dd;
                }
                best = Math.sqrt(best);
                var gw = .028;
                if (best < gw + fp) {
                  var gm = sstep(gw + fp, gw - fp * .5, best);
                  albR *= 1 - .62 * gm; albG *= 1 - .62 * gm; albB *= 1 - .55 * gm;
                  tiltV += gm * .5;
                }
              }
            }
          } else {
            stone(u * 2, v * 2, fp, 3, 3, 29, st); albR *= st[0]; albG *= st[0]; albB *= st[0];
          }
        }
        if (kind === 4 && S.stair) {
          /* the tread's front edge catches the light from below */
          var edge = (sn - Z);
          if (sn && edge < .03) glowAdd = .22 * (1 - edge / .03);
          /* the inside corner under the tread above is in shadow: bright edge, then a drop */
          if (sn) ao = .3 + .7 * sstep(0, S.tread * .55, Z - (sn - S.tread));
        }

        /* perturb the normal: tangent frame on the surface */
        if (tiltU || tiltV) {
          var tux, tuy, tuz, tvx, tvy, tvz;
          if (kind === 1 || kind === 7 || kind === 9) { tux = 0; tuy = 0; tuz = 1; tvx = ny; tvy = -nx; tvz = 0; }
          else if (kind === 2 || kind === 4) { tux = 0; tuy = 0; tuz = 1; tvx = 1; tvy = 0; tvz = 0; }
          else if (kind === 5) { if (nx) { tux = 0; tuy = 0; tuz = 1; tvx = 0; tvy = 1; tvz = 0; } else if (nz) { tux = 0; tuy = 1; tuz = 0; tvx = 1; tvy = 0; tvz = 0; } else { tux = 0; tuy = 0; tuz = 1; tvx = 1; tvy = 0; tvz = 0; } }
          else { tux = 0; tuy = 1; tuz = 0; tvx = 1; tvy = 0; tvz = 0; }
          nx += tux * tiltU + tvx * tiltV; ny += tuy * tiltU + tvy * tiltV; nz += tuz * tiltU + tvz * tiltV;
          var nn = Math.sqrt(nx * nx + ny * ny + nz * nz); nx /= nn; ny /= nn; nz /= nn;
        }

        var R, G, Bc;
        if (kind === 8) {
          /* the opened blank: dark, with light rising from below */
          var yb2 = Y, glow = Math.pow(clamp(1 - yb2 / 2.35, 0, 1), 2.2);
          R = .015 + .55 * glow; G = .014 + .5 * glow; Bc = .05 + 1.05 * glow;
        } else {
          alb[0] = albR; alb[1] = albG; alb[2] = albB;
          lightAt(X, Y, Z, nx, ny, nz, alb, col, (kind === 6 || kind === 7 || kind === 9) ? 1 : null);
          R = col[0] * ao; G = col[1] * ao; Bc = col[2] * ao;
          if (kind === 2 || kind === 4) {
            /* a worn sheen on the floor toward the far light */
            var rx = ndx, ry = -ndy, rz = ndz, sp2 = rx * farDir[0] + ry * farDir[1] + rz * farDir[2];
            if (sp2 > 0) { var sh = Math.pow(sp2, 14) * .22 * (S.stair ? .4 : 1); R += sh * .55; G += sh * .52; Bc += sh * 1.0; }
          }
          if (extra === 'cup') { R = R * .5 + .006; G = G * .36 + .004; Bc = Bc * .3 + .006; }
          else if (extra === 'rim') { R *= 2.2; G *= 1.9; Bc *= 1.7; }
          if (glowAdd) { R += glowAdd * .5; G += glowAdd * .46; Bc += glowAdd * .95; }
          if (jmask < 1 && kind !== 5) { var jd = .8 + .2 * jmask; R *= jd; G *= jd; Bc *= jd; }
        }

        /* haze: deeper and brighter toward the far end; a gold bank near the lamp's floor */
        var fz = 1 - Math.exp(-dist * S.fogK), bl = ndx * farDir[0] + ndy * farDir[1] + ndz * farDir[2];
        var bloom = Math.pow(Math.max(0, bl), 30), fR, fG, fB;
        if (S.stair) {
          var down = sstep(-.3, -.8, ndy), dd4 = clamp(dist / 40, 0, 1);
          fR = .025 + .12 * dd4 + .1 * down + .7 * bloom; fG = .022 + .11 * dd4 + .09 * down + .64 * bloom; fB = .07 + .3 * dd4 + .22 * down + 1.0 * bloom;
        } else {
          var dd2 = clamp(dist / S.zFar, 0, 1), dd3 = dd2 * dd2;
          fR = .03 + .16 * dd3 + .6 * bloom; fG = .027 + .15 * dd3 + .56 * bloom; fB = .085 + .38 * dd3 + .9 * bloom;
        }
        if (lamp) {
          /* the lamp's warmth in the air around it */
          var lx = lamp.x - X, ly = lamp.y - Y, lz = lamp.z - Z, ld = lx * lx + ly * ly + lz * lz;
          var warm = (.05 + .16 * gold) / (1 + ld / (1.2 + 3 * gold));
          R += warm * 1.0; G += warm * .55; Bc += warm * .2;
        }
        R = R * (1 - fz) + fR * fz; G = G * (1 - fz) + fG * fz; Bc = Bc * (1 - fz) + fB * fz;

        /* tone: soft shoulder, then display gamma */
        var ex2 = 1.7;
        R = 1 - Math.exp(-R * ex2); G = 1 - Math.exp(-G * ex2); Bc = 1 - Math.exp(-Bc * ex2);
        var di = (h2(pxi, py) - .5) * 2.4, idx = (py * w + pxi) * 4;
        px[idx] = clamp(Math.pow(R, .92) * 255 + di, 0, 255);
        px[idx + 1] = clamp(Math.pow(G, .92) * 255 + di, 0, 255);
        px[idx + 2] = clamp(Math.pow(Bc, .92) * 255 + di, 0, 255);
        px[idx + 3] = 255;
        depth[py * w + pxi] = dist;
      }
    }
    ctx.putImageData(img, 0, 0);

    /* blur by depth: far things go soft */
    try {
      var tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
      var tc = tmp.getContext('2d'); tc.filter = 'blur(' + (2.2 * dpr).toFixed(1) + 'px)'; tc.drawImage(canvas, 0, 0);
      var bd = tc.getImageData(0, 0, w, h).data, sd = ctx.getImageData(0, 0, w, h), sdd = sd.data;
      var d0 = S.stair ? 6 : 9, d1 = S.stair ? 22 : 30;
      for (var i = 0, n = w * h; i < n; i++) {
        var wgt = sstep(d0, d1, depth[i]) * .9; if (!wgt) continue;
        var q = i * 4;
        sdd[q] += (bd[q] - sdd[q]) * wgt; sdd[q + 1] += (bd[q + 1] - sdd[q + 1]) * wgt; sdd[q + 2] += (bd[q + 2] - sdd[q + 2]) * wgt;
      }
      ctx.putImageData(sd, 0, 0);
      /* bloom: the haze glows over the stone so no line-work shows */
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .34;
      ctx.filter = 'blur(' + (16 * dpr).toFixed(0) + 'px)'; ctx.drawImage(canvas, 0, 0); ctx.restore();
    } catch (err) { /* filters unsupported: the sharp painting stands */ }
    return { proj: proj };
  }

  /* ---------- overlay: flame, cup-light, bloom (SVG, element pixels) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function draw(el, opts) {
    var o = Object.assign({ scene: 'hall', cups: 'dark', lintel: 'sealed', gold: 0, res: 1 }, opts || {});
    o.cam = Object.assign({ x: 0, y: 1.6, z: 0, pitch: 0, f: .85, cx: .5, cy: .5 }, o.cam || {});
    el.classList.add('hall');
    if (o.scene === 'stair') el.classList.add('hall-stair');
    var W = el.clientWidth || 390, H = el.clientHeight || 844;
    var dpr = Math.min(2, (global.devicePixelRatio || 1)) * o.res;
    el.innerHTML = '';

    var two = o.lintel === 'opening';
    var S = makeScene(Object.assign({}, o, { lintel: two ? 'sealed' : o.lintel }));
    var base = document.createElement('canvas'); base.className = 'hall-paint';
    var R = render(base, W, H, dpr, o, S);
    var under = null;
    if (two) {
      under = document.createElement('canvas'); under.className = 'hall-paint hall-open';
      render(under, W, H, dpr, Object.assign({}, o, { lintel: 'open' }), makeScene(Object.assign({}, o, { lintel: 'open' })));
      el.appendChild(under);
    }
    el.appendChild(base);

    function project(x, y, z) { var p = R.proj(x, y, z); return p ? [p[0] / dpr, p[1] / dpr] : null; }

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'class': 'hall-over', 'aria-hidden': 'true' }, el);
    var defs = svgEl('defs', {}, svg);
    defs.innerHTML =
      '<radialGradient id="hlHalo"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".95"/><stop offset=".22" stop-color="#f6a650" stop-opacity=".45"/><stop offset="1" stop-color="#f6a650" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hlWarm"><stop offset="0" stop-color="#ffc47a" stop-opacity=".5"/><stop offset=".45" stop-color="#d9803a" stop-opacity=".15"/><stop offset="1" stop-color="#d9803a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hlFlame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d0" stop-opacity=".1"/><stop offset=".35" stop-color="#ffd27a"/><stop offset="1" stop-color="#f08a2c"/></linearGradient>' +
      '<radialGradient id="hlClay" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#d49060"/><stop offset=".45" stop-color="#8a4a2a"/><stop offset="1" stop-color="#2a130b"/></radialGradient>' +
      '<radialGradient id="hlCup"><stop offset="0" stop-color="#fff0c4"/><stop offset=".18" stop-color="#ffc766" stop-opacity=".85"/><stop offset=".5" stop-color="#f08a34" stop-opacity=".22"/><stop offset="1" stop-color="#f08a34" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hlFar"><stop offset="0" stop-color="#eef0ff" stop-opacity=".75"/><stop offset=".3" stop-color="#a8a2ff" stop-opacity=".28"/><stop offset="1" stop-color="#8f86ff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hlSpill"><stop offset="0" stop-color="#ece8ff" stop-opacity=".9"/><stop offset=".35" stop-color="#a49cff" stop-opacity=".38"/><stop offset="1" stop-color="#8f86ff" stop-opacity="0"/></radialGradient>' +
      '<filter id="hlSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>';

    var H2 = { el: el, svg: svg, W: W, H: H, project: project, cups: [] };

    if (o.scene === 'stair') {
      var pd = project(0, -24, 34);
      if (pd) svgEl('ellipse', { cx: pd[0], cy: pd[1], rx: W * .5, ry: H * .2, fill: 'url(#hlFar)', 'class': 'hall-far', style: 'mix-blend-mode:screen' }, svg);
      return H2;
    }

    /* the far end's bloom */
    var pf = project(0, 3.2, S.zFar - 1);
    if (pf) svgEl('ellipse', { cx: pf[0], cy: pf[1], rx: W * .34, ry: W * .42, fill: 'url(#hlFar)', 'class': 'hall-far', style: 'mix-blend-mode:screen' }, svg);

    /* the wall-cups: dark; during the cut they wake one by one, near to far */
    var cupsG = svgEl('g', { 'class': 'hall-cups' }, svg);
    var order = S.niches.slice().sort(function (a, b) { return a.zc - b.zc; });
    order.forEach(function (N, i) {
      var xw = S.sec.wallAt(N.y0 + .2) * N.side, p = project(xw - N.side * .12, N.y0 + .22, N.zc);
      if (!p || p[0] < -80 || p[0] > W + 80 || p[1] < -80 || p[1] > H + 80) return;
      var zc = N.zc - o.cam.z, sc = o.cam.f * W / Math.max(.5, zc);
      var g = svgEl('g', { 'class': 'hall-cup', style: '--i:' + i }, cupsG);
      svgEl('circle', { cx: p[0], cy: p[1] - sc * .1, r: sc * 1.5, fill: 'url(#hlCup)', opacity: .7, style: 'mix-blend-mode:screen' }, g);
      svgEl('path', { d: 'M' + p[0] + ' ' + (p[1] - sc * .34) + ' q' + (sc * .05) + ' ' + (sc * .14) + ' 0 ' + (sc * .24) + ' q' + (-sc * .05) + ' ' + (-sc * .1) + ' 0 ' + (-sc * .24) + 'z', fill: 'url(#hlFlame)' }, g);
      H2.cups.push({ x: p[0], y: p[1], s: sc, i: i });
    });
    if (o.cups !== 'dark') el.classList.add(o.cups === 'lit' ? 'cups-lit' : 'cups-waking');

    /* the clay lamp, always lit, on its ledge */
    var L = S.lamp, pl = project(L.x, L.y, L.z);
    if (pl) {
      var s = o.cam.f * W / Math.max(.5, L.z - o.cam.z), g = o.gold || 0;
      var lg = svgEl('g', { 'class': 'hall-lamp' }, svg);
      svgEl('ellipse', { cx: pl[0], cy: pl[1] - s * .1, rx: s * (1.3 + g * 1.4), ry: s * (1.05 + g * 1.1), fill: 'url(#hlWarm)', 'class': 'hall-lamplight', style: 'mix-blend-mode:screen' }, lg);
      /* the dish: a small, heavy clay bowl with a pinched spout toward the hall */
      var dw = s * .2, dh = s * .075;
      svgEl('ellipse', { cx: pl[0] + dw * .1, cy: pl[1] + dh * .5, rx: dw * 1.15, ry: dh * .6, fill: '#0a0610', opacity: .55, filter: 'url(#hlSoft)' }, lg);
      svgEl('path', { d: 'M' + (pl[0] - dw) + ' ' + (pl[1] - dh * .2) + ' Q' + (pl[0] - dw * .95) + ' ' + (pl[1] + dh * 1.1) + ' ' + pl[0] + ' ' + (pl[1] + dh * 1.05) + ' Q' + (pl[0] + dw * .9) + ' ' + (pl[1] + dh) + ' ' + (pl[0] + dw * 1.35) + ' ' + (pl[1] - dh * .45) + ' L' + (pl[0] + dw * .9) + ' ' + (pl[1] - dh * .3) + ' Z', fill: 'url(#hlClay)' }, lg);
      svgEl('ellipse', { cx: pl[0] - dw * .05, cy: pl[1] - dh * .25, rx: dw * .92, ry: dh * .38, fill: '#1c0d07' }, lg);
      svgEl('path', { d: 'M' + (pl[0] - dw * .9) + ' ' + (pl[1] - dh * .3) + ' Q' + pl[0] + ' ' + (pl[1] - dh * .85) + ' ' + (pl[0] + dw * .85) + ' ' + (pl[1] - dh * .35), stroke: '#f6b877', 'stroke-width': Math.max(.6, s * .012), fill: 'none', opacity: .8 }, lg);
      var fx = pl[0] + dw * 1.05, fy = pl[1] - dh * .45, fs = s * .16;
      var fl = svgEl('g', { 'class': 'hall-flame', style: 'transform-origin:' + fx + 'px ' + fy + 'px' }, lg);
      svgEl('circle', { cx: fx, cy: fy - fs * .4, r: s * .55, fill: 'url(#hlHalo)', 'class': 'hall-halo' }, fl);
      svgEl('path', { d: 'M' + fx + ' ' + (fy - fs * 1.15) + ' Q' + (fx + fs * .36) + ' ' + (fy - fs * .35) + ' ' + (fx + fs * .18) + ' ' + (fy - fs * .05) + ' Q' + fx + ' ' + (fy + fs * .1) + ' ' + (fx - fs * .2) + ' ' + (fy - fs * .05) + ' Q' + (fx - fs * .3) + ' ' + (fy - fs * .4) + ' ' + fx + ' ' + (fy - fs * 1.15) + 'Z', fill: 'url(#hlFlame)' }, fl);
      svgEl('ellipse', { cx: fx, cy: fy - fs * .22, rx: fs * .08, ry: fs * .2, fill: '#fffaf0' }, fl);
      H2.lamp = { x: pl[0], y: pl[1], s: s };
    }

    /* the lintel: where its parts fall on screen */
    var B = S.beam;
    H2.onRod = function (u, v) { return project(B[1], B[2] + .2 + v * .44, B[4] + 1.4 + u * .9); };
    H2.onBeam = function (u, v) { return project(B[1], B[2] + v, B[4] + u); };
    var dm = S.door;
    var wa = S.sec.wallAt;
    H2.door = [project(-wa(0), 0, dm.z0), project(-wa(dm.y1), dm.y1, dm.z0), project(-wa(dm.y1), dm.y1, dm.z1), project(-wa(0), 0, dm.z1)];
    H2.mapPath = function (d, u0, u1) {
      /* map a mark drawn in a 40×40 box onto the rod blank between u0 and u1 (absolute M/L/Q/Z only) */
      return d.replace(/(-?[\d.]+)[ ,](-?[\d.]+)/g, function (_, a, b) {
        var p = H2.onRod(u0 + (u1 - u0) * (+a / 40), 1 - (+b / 40));
        return p[0].toFixed(1) + ' ' + p[1].toFixed(1);
      });
    };

    if (two) {
      /* the stone sinks: the sealed painting loses the blank from the top down, then the light arrives */
      var spill = svgEl('g', { 'class': 'hall-spill' }, svg);
      var c0 = project(-2.3, .1, (dm.z0 + dm.z1) / 2);
      if (c0) svgEl('ellipse', { cx: c0[0], cy: c0[1], rx: W * .42, ry: W * .2, fill: 'url(#hlSpill)', style: 'mix-blend-mode:screen' }, spill);
      H2.openStone = function (ms, done) {
        var t0 = null, q = H2.door;
        function frame(ts) {
          if (t0 == null) t0 = ts;
          var k = clamp((ts - t0) / ms, 0, 1), e2 = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          /* the slab's top edge goes down the opening */
          var tl = [q[1][0] + (q[0][0] - q[1][0]) * e2, q[1][1] + (q[0][1] - q[1][1]) * e2];
          var tr = [q[2][0] + (q[3][0] - q[2][0]) * e2, q[2][1] + (q[3][1] - q[2][1]) * e2];
          var hole = 'M' + q[1][0] + ' ' + q[1][1] + ' L' + q[2][0] + ' ' + q[2][1] + ' L' + tr[0] + ' ' + tr[1] + ' L' + tl[0] + ' ' + tl[1] + ' Z';
          base.style.clipPath = "path(evenodd, 'M-10 -10 H" + (W + 10) + ' V' + (H + 10) + ' H-10 Z ' + hole + "')";
          if (k < 1) requestAnimationFrame(frame); else if (done) done();
        }
        requestAnimationFrame(frame);
        el.classList.add('opened');
      };
    }
    H2.wake = function () { el.classList.add('cups-waking'); };
    return H2;
  }

  global.Hall = { draw: draw };
})(window);
