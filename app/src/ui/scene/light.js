/* The delve's light, from the approved mock-up (design/directions/d-combined/delve.html, revision 3): the ring (a lit
   track, a glowing arc with a comet tip that sheds a few sparks) and the dust in the tunnel. The ring's fill comes from
   its --p style. tunnelLight(root) starts it; the returned function stops it.
   Nothing here runs by script frame by frame (D-132, Dan: the phone still warmed). The arc and its trail are drawn into
   the ring's canvas only when the fill has moved by a pixel of it, which is at most once a second (the countdown's own
   step). The comet's tip is a small layer turned to the fill's end by the fill itself (--p); its breath, glint and
   sparks, and every mote of dust, are small layers the graphics chip moves and fades alone, so they rest with the rest
   of the world (rest.ts). Reduced motion: the ring still shows the time, but nothing drifts, breathes or sheds. */
export function tunnelLight(root) {
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ring = root.querySelector('.ring'), rc = ring.querySelector('.ringcv'), rx = rc.getContext('2d');
  var dustHost = root.querySelector('.motes'), phone = root;
  var TAU = Math.PI * 2, R = 0, RW = 0, PW = 0, PH = 0, dpr = 1, anims = [], sizeKey = '';
  var stage = ribs(root);

  /* a soft round sprite, made once */
  function sprite(inner, outer){
    var c = document.createElement('canvas'), g; c.width = c.height = 64; g = c.getContext('2d');
    var r = g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0, inner); r.addColorStop(.18, inner); r.addColorStop(.45, outer); r.addColorStop(1, 'rgba(143,134,255,0)');
    g.fillStyle = r; g.fillRect(0,0,64,64); return c;
  }
  var DOT = sprite('rgba(255,255,255,1)', 'rgba(185,168,255,.35)');
  var HAZE = sprite('rgba(217,214,255,.55)', 'rgba(160,130,255,.18)');
  var DOTURL = 'url(' + DOT.toDataURL() + ')', HAZEURL = 'url(' + HAZE.toDataURL() + ')';
  function rnd(a,b){ return a + Math.random() * (b - a); }
  function el(tag, css, parent){ var e = document.createElement(tag); e.style.cssText = css; if (parent) parent.appendChild(e); return e; }
  function play(e, frames, opts){ if (still) return; anims.push(e.animate(frames, Object.assign({ iterations: Infinity }, opts))); }
  var CROSS = 'background:linear-gradient(90deg,rgba(217,214,255,0),rgba(255,255,255,.95),rgba(217,214,255,0))';

  /* ---- the ring ---- */
  function drawArc(ctx, p){
    var c = RW / 2, r = R * .47;
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
  /* the comet's glow trail, just behind the tip (gone while the ring is quiet: held, or resting after an end) */
  function drawTrail(ctx, p){
    var c = RW / 2, r = R * .47, a1 = -Math.PI / 2 + p * TAU, span = Math.min(p * TAU, .55), N = 12;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (var i = 0; i < N; i++) {
      var q = i / N, s0 = a1 - span * (1 - q), s1 = a1 - span * (1 - (i + 1) / N);
      ctx.globalAlpha = .22 * q * q; ctx.lineWidth = R * (.03 + .06 * q); ctx.strokeStyle = '#e4defe';
      ctx.beginPath(); ctx.arc(c,c,r,s0,s1); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  var arcKey = '';
  function drawRing(){
    if (!R) return;
    var p = Math.max(0, Math.min(1, parseFloat(ring.style.getPropertyValue('--p')) || 0));
    var quiet = ring.classList.contains('hold') || ring.classList.contains('rest');
    /* the arc's end moves one pixel of the ring's picture at a time */
    var steps = Math.max(1, Math.round(TAU * R * .47 * dpr)), pa = p > .998 ? 1 : Math.round(p * steps) / steps;
    var key = pa + '|' + RW + '|' + dpr + '|' + quiet;
    if (key === arcKey) return;
    arcKey = key;
    rx.setTransform(1,0,0,1,0,0); rx.clearRect(0,0,rc.width,rc.height); rx.setTransform(dpr,0,0,dpr,0,0);
    drawArc(rx, pa);
    if (quiet) return;
    if (pa > .003) drawTrail(rx, pa);
    /* the tip: always a whole, clean point of light (even at the very start), drawn as before */
    var c = RW / 2, a1 = -Math.PI / 2 + pa * TAU, tx = c + Math.cos(a1) * R * .47, ty = c + Math.sin(a1) * R * .47, hs = R * .16, ds = R * .05;
    rx.globalCompositeOperation = 'lighter';
    rx.globalAlpha = .85; rx.drawImage(HAZE, tx - hs, ty - hs, hs * 2, hs * 2);
    rx.globalAlpha = 1; rx.drawImage(DOT, tx - ds, ty - ds, ds * 2, ds * 2);
    rx.globalCompositeOperation = 'source-over';
  }

  /* the tip's motion: turned to the fill's end by --p, it breathes, glints and sheds sparks behind the point of light
     drawn with the arc. Its pieces add their light to the ring's (plus-lighter), as they did drawn in its canvas. */
  var tip = el('div', 'position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;transform:rotate(calc(var(--p) * 1turn))', null);
  tip.className = 'tipfx'; tip.setAttribute('aria-hidden', 'true');
  var arm = el('div', 'position:absolute;left:0;top:0;width:0;height:0;transform:translateY(calc(var(--R) * -.47))', tip);
  ring.insertBefore(tip, ring.querySelector('.fog-front'));
  function buildTip(){
    arm.textContent = '';
    var hs = R * .16, gl = R * .07;
    var sparkBox = el('div', 'position:absolute;left:0;top:0', arm);
    /* its breath (the tip swelling by 6% and back, every 4 s): a faint haze over it that brightens and fades */
    var breath = el('i', 'mix-blend-mode:plus-lighter;position:absolute;left:' + (-hs) + 'px;top:' + (-hs) + 'px;width:' + (2 * hs) + 'px;height:' + (2 * hs) + 'px;opacity:0;background:' + HAZEURL + ' center/100% 100%', arm);
    play(breath, [{ opacity: 0, transform: 'scale(.94)' }, { opacity: .16, transform: 'scale(1.06)' }], { duration: 1963, direction: 'alternate', easing: 'ease-in-out' });
    if (still) return;
    /* the glint: a small cross of light, its arms 2 × R(.07 ± .015) long */
    var g = el('div', 'position:absolute;left:0;top:0;width:0;height:0;opacity:.45;mix-blend-mode:plus-lighter', arm);
    el('i', 'position:absolute;left:' + (-gl) + 'px;top:-.5px;width:' + (2 * gl) + 'px;height:1px;' + CROSS, g);
    el('i', 'position:absolute;left:-.5px;top:' + (-gl) + 'px;width:1px;height:' + (2 * gl) + 'px;' + CROSS.replace('90deg', '180deg'), g);
    play(g, [{ transform: 'scale(.79)' }, { transform: 'scale(1.21)' }], { duration: 2417, direction: 'alternate', easing: 'ease-in-out' });
    /* sparks: one shed every .42 s, drifting back along the ring and outwards, fading as they go */
    for (var i = 0; i < 5; i++) {
      var life = rnd(1.4, 2.05), out = rnd(-.4, 1), r = rnd(1.4, 2.6), s = r * 3.2, k = life / 2.1;
      var sp = el('i', 'mix-blend-mode:plus-lighter;position:absolute;left:' + (-s) + 'px;top:' + (-s) + 'px;width:' + (2 * s) + 'px;height:' + (2 * s) + 'px;opacity:0;background:' + DOTURL + ' center/100% 100%', sparkBox);
      play(sp, [
        { transform: 'translate(0,0) scale(1)', opacity: .8 },
        { transform: 'translate(' + (-3 * life) + 'px,' + (-3.5 * out * life) + 'px) scale(.8)', opacity: .2, offset: k / 2 },
        { transform: 'translate(' + (-6 * life) + 'px,' + (-7 * out * life) + 'px) scale(.625)', opacity: 0, offset: k },
        { transform: 'translate(' + (-6 * life) + 'px,' + (-7 * out * life) + 'px) scale(.625)', opacity: 0 },
      ], { duration: 2100, delay: -i * 420, easing: 'linear' });
    }
  }

  /* ---- the dust: motes drifting in the light, and a few coming down the tunnel towards you ---- */
  /* the far opening, where the light comes from (matches the painting) */
  function vp(){ return { x: PW * .749, y: PH * .296 }; }
  function lightAt(x,y){ var o = vp(), dx = (x - o.x) / PW, dy = (y - o.y) / PH; return Math.exp(-(dx*dx*3.2 + dy*dy*6)); }
  function buildDust(){
    dustHost.textContent = '';
    var i, k;
    for (i = 0; i < 46; i++) {
      var m = { x: Math.random(), y: Math.random(), r: rnd(.5, 1.9), vx: rnd(-.006, .006), vy: rnd(-.012, -.002), tw: rnd(.4, 1.6), ph: rnd(0, TAU), glint: i < 6, a: rnd(.35, .9) };
      /* rising from below the screen to above it, drifting a little sideways */
      var T = 1.04 / -m.vy, dx = Math.max(-.25, Math.min(.25, m.vx * T)), f = (1.02 - m.y) / 1.04, xs = m.x - dx * f;
      var big = m.r * 6.2, mover = el('i', 'position:absolute;left:' + (xs * PW - big) + 'px;top:' + (1.02 * PH - big) + 'px;width:' + (2 * big) + 'px;height:' + (2 * big) + 'px', dustHost);
      var lit = el('i', 'position:absolute;inset:0', mover), twk = el('i', 'position:absolute;inset:0;background:' + DOTURL + ' center/100% 100%', lit);
      var path = [], glow = [], Lmid = lightAt((xs + dx * .5) * PW, .5 * PH);
      for (k = 0; k <= 8; k++) {
        var q = k / 8, x = (xs + dx * q) * PW, y = (1.02 - 1.04 * q) * PH, L = lightAt(x, y);
        path.push({ transform: 'translate(' + ((x - xs * PW)).toFixed(1) + 'px,' + ((y - 1.02 * PH)).toFixed(1) + 'px) scale(' + ((3.2 + 3 * L) / 6.2).toFixed(3) + ')' });
        glow.push({ opacity: Math.min(1, m.a * (.28 + .9 * L)).toFixed(3) });
        if (k === 4) Lmid = L;
      }
      if (still) {
        k = Math.round(f * 8); mover.style.transform = path[k].transform; lit.style.opacity = String(glow[k].opacity * .8);
        continue;
      }
      play(mover, path, { duration: T * 1000, delay: -f * T * 1000, easing: 'linear' });
      play(lit, glow, { duration: T * 1000, delay: -f * T * 1000, easing: 'linear' });
      /* its twinkle: .55 + .45 sin(tw t + ph) */
      var P = TAU / m.tw * 1000;
      play(twk, [{ opacity: .1 }, { opacity: 1 }], { duration: P / 2, direction: 'alternate', delay: -(m.ph / TAU) * P, easing: 'ease-in-out' });
      if (m.glint) {
        /* now and then a mote flares into a small cross: sin⁴ of its own slower beat */
        var gz = el('i', 'position:absolute;left:50%;top:50%;width:0;height:0;opacity:0', mover), gl = 11 / ((3.2 + 3 * Lmid) / 6.2);
        el('i', 'position:absolute;left:' + (-gl) + 'px;top:-.5px;width:' + (2 * gl) + 'px;height:1px;' + CROSS, gz);
        el('i', 'position:absolute;left:-.5px;top:' + (-gl) + 'px;width:1px;height:' + (2 * gl) + 'px;' + CROSS.replace('90deg', '180deg'), gz);
        var G = TAU / (m.tw * .7) * 1000, peak = Math.min(1, .8 * (.5 + Lmid));
        play(gz, [{ opacity: 0, transform: 'scale(.36)' }, { opacity: 0, transform: 'scale(.36)', offset: .15 }, { opacity: peak * .2, transform: 'scale(.6)', offset: .2 },
          { opacity: peak, transform: 'scale(1)', offset: .25 }, { opacity: peak * .2, transform: 'scale(.6)', offset: .3 },
          { opacity: 0, transform: 'scale(.36)', offset: .35 }, { opacity: 0, transform: 'scale(.36)' }], { duration: G, delay: -(m.ph / TAU) * G, easing: 'linear' });
      }
    }
    if (still) return;
    var o = vp(), diag = Math.hypot(PW, PH);
    for (i = 0; i < 14; i++) {
      var fl = { ang: rnd(0, TAU), d: rnd(.012, .05), sp: rnd(.07, .12), r: rnd(.5, 1.1) };
      /* its way down the tunnel, worked out as it was drawn: 30 steps a second, nearer and faster */
      var z = 1, t = 0, pts = [], dt = 1 / 30;
      for (;;) {
        var dist = fl.d / Math.max(.04, z) * diag * .5, px = o.x + Math.cos(fl.ang) * dist * .8, py = o.y + Math.sin(fl.ang) * dist;
        var near = 1 - z;
        pts.push({ t: t, x: px - o.x, y: py - o.y, s: fl.r * (1.5 + near * 6), a: Math.min(1, near * 5) * (.35 + .5 * near) * .85, near: near });
        if (z <= .05 || px < -20 || px > PW + 20 || py < -20 || py > PH + 20 || t > 90) break;
        z -= fl.sp * dt * z * 1.6 + .006 * dt; t += dt;
      }
      var Tf = Math.max(.5, t), smax = fl.r * 7.5, pick = pts.filter(function(_, j){ return j % 8 === 0; }).concat([pts[pts.length - 1]]);
      var fm = el('i', 'position:absolute;left:' + (o.x - smax) + 'px;top:' + (o.y - smax) + 'px;width:' + (2 * smax) + 'px;height:' + (2 * smax) + 'px', dustHost);
      var dot = el('i', 'position:absolute;inset:0;background:' + DOTURL + ' center/100% 100%', fm), haze = el('i', 'position:absolute;inset:0;opacity:0;background:' + HAZEURL + ' center/100% 100%', fm);
      var d0 = -Math.random() * Tf * 1000, off = function(p){ return Math.min(1, p.t / Tf); };
      play(fm, pick.map(function(p){ return { offset: off(p), transform: 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + (p.s / smax).toFixed(3) + ')', opacity: p.a.toFixed(3) }; }),
        { duration: Tf * 1000, delay: d0, easing: 'linear' });
      /* the nearest are soft haze rather than a point */
      var k6 = (pts.find(function(p){ return p.near > .6; }) || pts[pts.length - 1]).t / Tf;
      if (k6 < 1) {
        play(dot, [{ opacity: 1 }, { opacity: 1, offset: k6 }, { opacity: 0, offset: Math.min(1, k6 + .001) }, { opacity: 0 }], { duration: Tf * 1000, delay: d0, easing: 'linear' });
        play(haze, [{ opacity: 0 }, { opacity: 0, offset: k6 }, { opacity: 1, offset: Math.min(1, k6 + .001) }, { opacity: 1 }], { duration: Tf * 1000, delay: d0, easing: 'linear' });
      }
    }
  }

  /* sizes are read when the ring or the screen changes size, never frame by frame (D-103) */
  function fit(){
    var d = Math.min(2, window.devicePixelRatio || 1), r = ring.offsetWidth, w = phone.clientWidth, h = phone.clientHeight;
    var key = [d, r, w, h].join('|');
    if (key === sizeKey) return;
    sizeKey = key; dpr = d; R = r; RW = R * 1.6; PW = w; PH = h;
    rc.width = Math.round(RW * dpr); rc.height = Math.round(RW * dpr); arcKey = '';
    if (stage) stage.style.setProperty('--k', String(Math.max(PW / 390, PH / 844)));
    for (var i = 0; i < anims.length; i++) anims[i].cancel();
    anims = [];
    buildTip(); buildDust(); drawRing();
  }
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
  fit(); if (ro) { ro.observe(ring); ro.observe(phone); } else window.addEventListener('resize', fit);
  /* the fill moves when the countdown does (its --p, once a second): only then is the arc looked at again */
  var mo = new MutationObserver(drawRing);
  mo.observe(ring, { attributes: true, attributeFilter: ['style', 'class'] });
  return function () {
    mo.disconnect(); if (ro) ro.disconnect(); else window.removeEventListener('resize', fit);
    for (var i = 0; i < anims.length; i++) anims[i].cancel();
  };
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
