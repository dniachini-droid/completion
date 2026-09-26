/* The delve's light, ported unchanged from the approved mock-up (design/directions/d-combined/delve.html, revision 3):
   the ring (a lit track, a glowing arc with a comet tip that sheds a few sparks) and the dust in the tunnel.
   The ring's fill comes from its --p style. tunnelLight(root) starts it; the returned function stops it. */
export function tunnelLight(root) {
/* revision 3: the light. The ring (a lit track, a glowing arc with a comet tip that sheds a few sparks) and
   the dust in the air (motes drifting in the light; a few coming down the tunnel towards you). Canvas, cheap.
   Reduced motion: the ring still shows the time, but nothing drifts, breathes or sheds. */
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, stopped = false, raf = 0;
  var ring = root.querySelector('.ring'), rc = ring.querySelector('.ringcv'), rx = rc.getContext('2d');
  var mc = root.querySelector('canvas.motes'), mx = mc.getContext('2d'), phone = root;
  var TAU = Math.PI * 2, R = 0, RW = 0, PW = 0, PH = 0, dpr = 1;
  function fit(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    R = ring.offsetWidth; RW = R * 1.6; arcKey = ''; prevBox = null; rc.width = Math.round(RW * dpr); rc.height = Math.round(RW * dpr);
    /* the dust is soft points of light: drawn at the screen's own size, not doubled, it looks the same and the phone
       moves a quarter of the pixels each frame (D-093, Dan: the phone warmed during a delve) */
    PW = phone.clientWidth; PH = phone.clientHeight; mc.width = Math.round(PW); mc.height = Math.round(PH);
    if (stage) stage.style.setProperty('--k', String(Math.max(PW / 390, PH / 844)));
  }
  var stage = ribs(root);
  /* sizes are read when the ring or the screen changes size, not every frame: reading one each frame made the phone
     lay the whole screen out again 30 times a second (D-103) */
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function(){ fit(); }) : null;
  fit(); if (ro) { ro.observe(ring); ro.observe(phone); } else window.addEventListener('resize', fit);

  /* a soft round sprite, made once */
  function sprite(inner, outer){
    var c = document.createElement('canvas'), g; c.width = c.height = 64; g = c.getContext('2d');
    var r = g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0, inner); r.addColorStop(.18, inner); r.addColorStop(.45, outer); r.addColorStop(1, 'rgba(143,134,255,0)');
    g.fillStyle = r; g.fillRect(0,0,64,64); return c;
  }
  var DOT = sprite('rgba(255,255,255,1)', 'rgba(185,168,255,.35)');
  var HAZE = sprite('rgba(217,214,255,.55)', 'rgba(160,130,255,.18)');

  function rnd(a,b){ return a + Math.random() * (b - a); }
  /* the far opening, where the light comes from (matches the painting) */
  function vp(){ return { x: PW * .749, y: PH * .296 }; }
  function lightAt(x,y){ var o = vp(), dx = (x - o.x) / PW, dy = (y - o.y) / PH; return Math.exp(-(dx*dx*3.2 + dy*dy*6)); }

  var dust = [], flow = [], sparks = [];
  for (var i = 0; i < 46; i++) dust.push({ x: Math.random(), y: Math.random(), r: rnd(.5, 1.9), vx: rnd(-.006, .006), vy: rnd(-.012, -.002),
    tw: rnd(.4, 1.6), ph: rnd(0, TAU), glint: i < 6, a: rnd(.35, .9) });
  function newFlow(age){ return { ang: rnd(0, TAU), d: rnd(.012, .05), z: 1, sp: rnd(.07, .12), r: rnd(.5, 1.1), ph: rnd(0, TAU), t: age || 0 }; }
  for (var j = 0; j < 14; j++) { var f = newFlow(); f.z = rnd(.15, 1); flow.push(f); }

  function glint(ctx, x, y, len, a){
    ctx.globalAlpha = a; ctx.lineWidth = 1;
    var g = ctx.createLinearGradient(x - len, y, x + len, y); g.addColorStop(0,'rgba(217,214,255,0)'); g.addColorStop(.5,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(217,214,255,0)');
    ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.stroke();
    g = ctx.createLinearGradient(x, y - len, x, y + len); g.addColorStop(0,'rgba(217,214,255,0)'); g.addColorStop(.5,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(217,214,255,0)');
    ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
  }

  function drawMotes(t, dt){
    var ctx = mx; ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,PW,PH); ctx.globalCompositeOperation = 'lighter';
    var o = vp(), diag = Math.hypot(PW, PH);
    dust.forEach(function(m){
      if (!still) { m.x += m.vx * dt; m.y += m.vy * dt; if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); } if (m.x < -.02) m.x = 1.02; if (m.x > 1.02) m.x = -.02; }
      var x = m.x * PW, y = m.y * PH, L = lightAt(x, y);
      var tw = still ? .8 : .55 + .45 * Math.sin(t * m.tw + m.ph);
      var a = m.a * tw * (.28 + .9 * L), s = m.r * (3.2 + 3 * L);
      ctx.globalAlpha = Math.min(1, a); ctx.drawImage(DOT, x - s, y - s, s * 2, s * 2);
      if (m.glint && !still) { var gA = Math.max(0, Math.sin(t * m.tw * .7 + m.ph)); gA = gA * gA * gA * gA; if (gA > .02) glint(ctx, x, y, 4 + 7 * gA, gA * .8 * (.5 + L)); }
    });
    if (!still) flow.forEach(function(f, k){
      f.z -= f.sp * dt * f.z * 1.6 + .006 * dt;   /* nearer, faster: coming down the tunnel towards you */
      var dist = f.d / Math.max(.04, f.z) * diag * .5;
      var x = o.x + Math.cos(f.ang) * dist * .8, y = o.y + Math.sin(f.ang) * dist;
      if (f.z <= .05 || x < -20 || x > PW + 20 || y < -20 || y > PH + 20) { flow[k] = newFlow(); return; }
      var fadeIn = Math.min(1, (1 - f.z) * 5), near = 1 - f.z, s = f.r * (1.5 + near * 6);
      ctx.globalAlpha = fadeIn * (.35 + .5 * near) * (.7 + .3 * Math.sin(t * 2 + f.ph));
      ctx.drawImage(near > .6 ? HAZE : DOT, x - s, y - s, s * 2, s * 2);
    });
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  var arcCv = document.createElement('canvas'), ax = arcCv.getContext('2d'), arcKey = '';
  function drawArc(ctx, p){
    var c = RW / 2, r = R * .47;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,RW,RW);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    /* the track: a faint lit groove */
    ctx.lineWidth = R * .05; ctx.strokeStyle = 'rgba(160,140,255,.10)'; ctx.beginPath(); ctx.arc(c,c,r,0,TAU); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(217,214,255,.30)'; ctx.beginPath(); ctx.arc(c,c,r,0,TAU); ctx.stroke();
    var a0 = -Math.PI / 2, a1 = a0 + p * TAU;
    if (p > .003) {
      var g;
      if (p > .998) g = 'rgba(236,232,255,1)';   /* a whole ring: one even light, no seam at the top */
      else if (ctx.createConicGradient) {
        g = ctx.createConicGradient(a0, c, c);
        g.addColorStop(0, 'rgba(126,110,245,.8)'); g.addColorStop(Math.max(.0001, p * .6), 'rgba(185,168,255,.95)');
        g.addColorStop(Math.max(.0002, p * .9), 'rgba(217,214,255,1)'); g.addColorStop(Math.max(.0003, p), '#ffffff'); g.addColorStop(Math.min(1, p + .0004), 'rgba(255,255,255,0)');
      } else g = 'rgba(200,190,255,.95)';
      /* bloom, then the arc itself */
      ctx.lineWidth = R * .2; ctx.strokeStyle = 'rgba(150,128,255,1)'; ctx.globalAlpha = .07; ctx.beginPath(); ctx.arc(c,c,r,a0,a1); ctx.stroke();
      ctx.lineWidth = R * .11; ctx.strokeStyle = 'rgba(150,132,255,1)'; ctx.globalAlpha = .13; ctx.beginPath(); ctx.arc(c,c,r,a0,a1); ctx.stroke();
      ctx.save(); ctx.shadowColor = 'rgba(160,136,255,1)'; ctx.shadowBlur = R * .12;
      ctx.lineWidth = R * .045; ctx.strokeStyle = g; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(c,c,r,a0,a1); ctx.stroke(); ctx.restore();
      ctx.globalAlpha = 1; ctx.lineWidth = R * .03; ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(c,c,r,a0,a1); ctx.stroke();
      ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(c,c,r,Math.max(a0, a1 - .9),a1); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  var tipA = 1, lastSpark = 0, prevBox = null;
  /* Each frame only the part of the ring where the comet, its trail and sparks are, or just were, is drawn again: the arc
     there is copied back from its finished picture and the light drawn over it, exactly as before, while the rest of the
     ring is left as it is (D-103). The arc itself is drawn again only when its end has moved by a pixel. */
  function box(x0, y0, x1, y1){ return [x0, y0, x1, y1]; }
  function grow(b, x, y, pad){ if (!b) return box(x - pad, y - pad, x + pad, y + pad);
    b[0] = Math.min(b[0], x - pad); b[1] = Math.min(b[1], y - pad); b[2] = Math.max(b[2], x + pad); b[3] = Math.max(b[3], y + pad); return b; }
  function drawRing(t, dt){
    var ctx = rx, p = parseFloat(ring.style.getPropertyValue('--p')) || 0;
    p = Math.max(0, Math.min(1, p));
    var quiet = ring.classList.contains('hold') || ring.classList.contains('rest');
    tipA += ((quiet ? 0 : 1) - tipA) * Math.min(1, dt * 2.2);
    var c = RW / 2, r = R * .47, a0 = -Math.PI / 2, a1 = a0 + p * TAU, breath = still ? 1 : 1 + .06 * Math.sin(t * 1.6);
    var tx = c + Math.cos(a1) * r, ty = c + Math.sin(a1) * r;
    /* the arc's end moves one pixel of the ring's picture at a time */
    var steps = Math.max(1, Math.round(TAU * r * dpr)), pa = p > .998 ? 1 : Math.round(p * steps) / steps;
    var key = pa + '|' + RW + '|' + dpr, whole = false;
    if (key !== arcKey) { arcKey = key; if (arcCv.width !== rc.width || arcCv.height !== rc.height) { arcCv.width = rc.width; arcCv.height = rc.height; } drawArc(ax, pa); whole = true; }
    /* where this frame's light goes: the tip with its haze and glint, the trail behind it, the sparks */
    var span = Math.min(p * TAU, .55), N = 12, i, b = null;
    if (p > .003) for (i = 0; i <= N; i++) { var aa = a1 - span * (1 - i / N); b = grow(b, c + Math.cos(aa) * r, c + Math.sin(aa) * r, R * .05 + 2); }
    b = grow(b, tx, ty, R * .18 + 3);
    /* a few sparks shed from the tip, drifting off and fading */
    if (tipA > .01 && !still && t - lastSpark > .42 && p > .003) { lastSpark = t;
      var back = a1 - .05, out = rnd(-.4, 1);
      sparks.push({ x: tx, y: ty, vx: Math.sin(a1) * 6 + Math.cos(back) * out * 7, vy: -Math.cos(a1) * 6 + Math.sin(back) * out * 7, life: 0, max: rnd(1.4, 2.4), r: rnd(1.4, 2.6) }); }
    sparks = sparks.filter(function(k){ k.life += dt; k.x += k.vx * dt; k.y += k.vy * dt; k.vy -= 2 * dt; return k.life < k.max; });
    sparks.forEach(function(k){ b = grow(b, k.x, k.y, k.r * 3.2 + 2); });
    var u = whole || !prevBox ? null : [Math.min(b[0], prevBox[0]), Math.min(b[1], prevBox[1]), Math.max(b[2], prevBox[2]), Math.max(b[3], prevBox[3])];
    prevBox = b;
    ctx.setTransform(1,0,0,1,0,0);
    if (u) {
      /* the region, in whole pixels of the canvas, cleared and the arc copied back into it */
      var X0 = Math.max(0, Math.floor(u[0] * dpr)), Y0 = Math.max(0, Math.floor(u[1] * dpr)),
          X1 = Math.min(rc.width, Math.ceil(u[2] * dpr)), Y1 = Math.min(rc.height, Math.ceil(u[3] * dpr));
      if (X1 <= X0 || Y1 <= Y0) return;
      ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip();
      ctx.clearRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.drawImage(arcCv, X0, Y0, X1 - X0, Y1 - Y0, X0, Y0, X1 - X0, Y1 - Y0);
    } else { ctx.save(); ctx.clearRect(0,0,rc.width,rc.height); ctx.drawImage(arcCv, 0, 0); }
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    if (p > .003) {
      /* the comet's glow trail, just behind the tip */
      for (i = 0; i < N; i++) {
        var q = i / N, s0 = a1 - span * (1 - q), s1 = a1 - span * (1 - (i + 1) / N);
        ctx.globalAlpha = tipA * .22 * q * q; ctx.lineWidth = R * (.03 + .06 * q); ctx.strokeStyle = '#e4defe';
        ctx.beginPath(); ctx.arc(c,c,r,s0,s1); ctx.stroke();
      }
    }
    /* the tip: always a whole, clean point of light (even at the very start) */
    if (tipA > .01) {
      var hs = R * .16 * breath; ctx.globalAlpha = tipA * .85; ctx.drawImage(HAZE, tx - hs, ty - hs, hs * 2, hs * 2);
      var ds = R * .05 * breath; ctx.globalAlpha = tipA; ctx.drawImage(DOT, tx - ds, ty - ds, ds * 2, ds * 2);
      if (!still) glint(ctx, tx, ty, R * (.07 + .015 * Math.sin(t * 1.3)), tipA * .45);
    }
    sparks.forEach(function(k){ var q = k.life / k.max, s = k.r * (1.6 - q * .6); ctx.globalAlpha = (1 - q) * (1 - q) * .8 * Math.max(tipA, .3); ctx.drawImage(DOT, k.x - s * 2, k.y - s * 2, s * 4, s * 4); });
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  }

  /* 30 frames a second, as the paintings' own live layers: the dust drifts slowly and the ring moves a hair a second,
     so a faster screen (60 or 120 a second on a newer iPhone) only warms the phone (D-093) */
  var t0 = null, prev = 0, STEP = 1000 / 30 - 2;
  function frame(ts){
    if (!stopped) raf = requestAnimationFrame(frame);
    if (t0 !== null && ts - prev * 1000 < STEP) return;
    var t = ts / 1000, dt = t0 === null ? 0 : Math.min(.1, t - prev); if (t0 === null) t0 = t; prev = t;
    drawRing(t, dt); drawMotes(t, dt);
  }
  raf = requestAnimationFrame(frame);
  return function () { stopped = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); else window.removeEventListener('resize', fit); };
}

/* The tunnel's ribs, as pictures the phone only moves (Dan, 2026-09-26: the delve made the phone hot and its motion
   jittery). In the mock-up each rib is a path inside one blurred full-screen drawing, so every frame the phone drew the
   whole tunnel again and blurred it. Here each rib is drawn once, softly, at low resolution (the softness stands in for
   the blur) into a picture, and the same `pass` animation moves and fades that picture: the graphics chip does it alone,
   smoothly, and nothing is redrawn. Same paths, widths, light and timing as the mock-up (delve.html, revision 3). */
function ribs(root) {
  var svg = root.querySelector('svg.flow');
  if (!svg) return null;
  var spill = svg.querySelector('linearGradient'), stops = spill ? Array.prototype.map.call(spill.querySelectorAll('stop'), function (s) {
    return [+s.getAttribute('offset'), s.getAttribute('stop-color'), s.hasAttribute('stop-opacity') ? +s.getAttribute('stop-opacity') : 1]; }) : [];
  var X0 = -10, Y0 = -110, BW = 610, BH = 750;   /* the ribs' reach, in the tunnel's 390 × 844 units */
  var R = .62, cache = {};                        /* canvas pixels per unit: about one per 1.7 screen points, soft as the blur was */
  var OPACITY = .9;                               /* the mock-up's .flow opacity */
  function bake(g) {
    var c = document.createElement('canvas'); c.width = Math.round(BW * R); c.height = Math.round(BH * R);
    var x = c.getContext('2d'); x.setTransform(R, 0, 0, R, -X0 * R, -Y0 * R); x.lineCap = 'butt';
    Array.prototype.forEach.call(g.querySelectorAll('path'), function (p) {
      var stroke = p.getAttribute('stroke') || '#000', paint = stroke;
      if (stroke.indexOf('url(') === 0 && spill) {
        paint = x.createLinearGradient(+spill.getAttribute('x1'), +spill.getAttribute('y1'), +spill.getAttribute('x2'), +spill.getAttribute('y2'));
        stops.forEach(function (st) { paint.addColorStop(st[0], rgba(st[1], st[2])); });
      }
      x.globalAlpha = OPACITY * (p.hasAttribute('opacity') ? +p.getAttribute('opacity') : 1);
      x.lineWidth = +(p.getAttribute('stroke-width') || 1); x.strokeStyle = paint; x.stroke(new Path2D(p.getAttribute('d')));
    });
    return c.toDataURL();
  }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  var stage = document.createElement('div'); stage.className = 'ribstage'; stage.setAttribute('aria-hidden', 'true');
  Array.prototype.forEach.call(svg.querySelectorAll('g.rib'), function (g) {
    var key = g.innerHTML, d = document.createElement('div'), im = document.createElement('img');
    d.className = 'rib'; d.style.animationDelay = g.style.animationDelay;
    im.alt = ''; im.src = cache[key] || (cache[key] = bake(g));
    im.style.cssText = 'position:absolute;left:' + X0 + 'px;top:' + Y0 + 'px;width:' + BW + 'px;height:' + BH + 'px';
    d.appendChild(im); stage.appendChild(d);
  });
  svg.replaceWith(stage);
  return stage;
}
