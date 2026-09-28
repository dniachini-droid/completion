/* ==========================================================================
   The live layers: what keeps a baked painting alive on the phone (D-041).
   The heavy painting is an image; these move on top of it, cheaply:
     - the whole scene drifts very slowly, like a camera breathing
     - mist and haze move where the scene says (anchors.fog)
     - flames flicker, with their warm halo (anchors.flame); a still flame (anchor still: true,
       or live.flame 'still' for them all) does not gutter: it only breathes, very slowly
     - glints wink on water (anchors.glints)
     - motes of light rise, or float in a shaft of light (anchors.beam)
   prefers-reduced-motion: everything is drawn, nothing moves.

     live(host, meta)   host: a positioned element holding <img class="paint">
                        meta: the <id>.json the bake wrote
   ========================================================================== */
const NS = 'http://www.w3.org/2000/svg';
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

/* image fractions → host pixels, as object-fit: cover lays the image out */
function coverMap(W, H, iw, ih) {
  const k = Math.max(W / iw, H / ih), ox = (W - iw * k) / 2, oy = (H - ih * k) / 2;
  const f = (u, v) => [ox + u * iw * k, oy + v * ih * k];
  f.k = k;
  return f;
}

/* a soft cloud texture, made once */
function cloudTexture(tint) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const cx = rnd() * 512, cy = 60 + rnd() * 136, r = 30 + rnd() * 70, a = .05 + rnd() * .09;
    for (const dx of [-512, 0, 512]) {           /* wraps sideways, so it can slide forever */
      const g = x.createRadialGradient(cx + dx, cy, 0, cx + dx, cy, r);
      g.addColorStop(0, `rgba(${tint},${a})`); g.addColorStop(1, `rgba(${tint},0)`);
      x.fillStyle = g; x.fillRect(cx + dx - r, cy - r, r * 2, r * 2);
    }
  }
  return c;
}

/* opts.still: drawn once and held (a painting seen only through a blur, behind a list: moving it there would only warm
   the phone, D-093) */
export function live(host, meta, opts = {}) {
  const still = reduced || !!opts.still;
  const img = host.querySelector('img.paint');
  const W = host.clientWidth, H = host.clientHeight;
  const map = coverMap(W, H, meta.width, meta.height);
  const A = meta.anchors || {};
  const warm = '255,214,150', violet = '214,210,255';

  /* 1. everything painted drifts together */
  const world = document.createElement('div');
  world.className = 'live-world';
  world.style.cssText = 'position:absolute;inset:0;transform-origin:50% 45%;' + (still ? '' : 'animation:live-drift 46s ease-in-out infinite alternate;');
  host.insertBefore(world, img); world.appendChild(img);

  /* 2. mist: its cloud drawn once, twice over side by side, and slid sideways by the graphics chip, so nothing is redrawn
     each frame (Dan, 2026-09-26: the phone ran hot). Two banks, as before: one drifting left, a fainter one right. */
  (A.fog || []).forEach(f => {
    const [x, y] = map(f.u, f.v), w = Math.round((f.w || 1) * W), h = Math.round(w * (f.h || .5)), sp = f.speed || 1;
    const box = document.createElement('div');
    box.style.cssText = `position:absolute;left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;overflow:hidden;mix-blend-mode:screen;pointer-events:none;opacity:${f.a || .8};` +
      '-webkit-mask-image:radial-gradient(closest-side,#000 40%,transparent);mask-image:radial-gradient(closest-side,#000 40%,transparent)';
    const tex = cloudTexture(f.tint || violet);
    const bank = (top, alpha, secs, dir) => {
      const c = document.createElement('canvas'); c.width = w * 2; c.height = h;
      const x2 = c.getContext('2d'); x2.drawImage(tex, 0, 0, w, h); x2.drawImage(tex, w, 0, w, h);
      c.style.cssText = `position:absolute;left:0;top:${top}px;width:${w * 2}px;height:${h}px;opacity:${alpha};will-change:transform;` +
        (still ? '' : `animation:live-slide-${dir} ${secs.toFixed(1)}s linear infinite`);
      box.appendChild(c);
    };
    bank(0, 1, w / (6 * sp), 'l');
    bank(Math.round(h * .08), .6, w / (3.5 * sp), 'r');
    world.appendChild(box);
  });

  /* 3. flames, halos, glints */
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, style: 'position:absolute;inset:0;pointer-events:none;overflow:visible' }, world);
  const defs = el('defs', {}, svg);
  defs.innerHTML =
    '<radialGradient id="lvHalo"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".9"/><stop offset=".25" stop-color="#f6a650" stop-opacity=".4"/><stop offset="1" stop-color="#f6a650" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="lvFlame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d0" stop-opacity=".1"/><stop offset=".35" stop-color="#ffd27a"/><stop offset="1" stop-color="#f08a2c"/></linearGradient>' +
    '<radialGradient id="lvGlint"><stop offset="0" stop-color="#f1efff"/><stop offset="1" stop-color="#b9b2ff" stop-opacity="0"/></radialGradient>';
  /* Each moving light is its own small drawing, and only that drawing is moved (Dan, 2026-09-26: the phone ran hot). In
     one full-screen drawing a flicker had the phone paint the whole of it again, clay lamp and all, on every frame; on
     a layer of its own it is painted once and the graphics chip moves it. A halo keeps its own layer too, so it still
     lightens the painting beneath it (screen) rather than only the drawing it sits in. */
  const small = (cx, cy, B, style) => el('svg', { viewBox: `${cx - B} ${cy - B} ${2 * B} ${2 * B}`, width: 2 * B, height: 2 * B,
    style: `position:absolute;left:${cx - B}px;top:${cy - B}px;overflow:visible;pointer-events:none;${style}` }, world);
  for (const f of A.flame || []) {
    const [x, y] = map(f.u, f.v), perM = f.s * meta.width * map.k;     /* host pixels per metre, there */
    const fs = Math.max(4, perM * .11 * (f.size || 1));
    const calm = f.still || (meta.live && meta.live.flame === 'still');
    const r = Math.max(10, perM * .7 * (f.size || 1)), hy = y - fs * .4, B = Math.ceil(Math.max(r + fs * .4, fs * 4.2) + 8);
    const flicker = still || calm ? '' : `transform-origin:${B}px ${B}px;animation:live-flicker 2.8s ease-in-out infinite;will-change:transform;`;
    const halo = small(x, y, B, 'mix-blend-mode:screen;' + (calm && !still ? `transform-origin:${B}px ${B - fs * .4}px;animation:live-breathe 7s ease-in-out infinite;will-change:transform,opacity;` : flicker));
    el('circle', { cx: x, cy: hy, r, fill: 'url(#lvHalo)' }, halo);
    const g = el('g', {}, small(x, y, B, flicker));   /* above its halo, as before */
    if (f.body && globalThis.ClayLamp) globalThis.ClayLamp.draw(g, { x, y, size: fs * 2.6, pool: .8 });
    el('path', { d: `M${x} ${y - fs * 1.15} Q${x + fs * .36} ${y - fs * .35} ${x + fs * .18} ${y - fs * .05} Q${x} ${y + fs * .1} ${x - fs * .2} ${y - fs * .05} Q${x - fs * .3} ${y - fs * .4} ${x} ${y - fs * 1.15}Z`, fill: 'url(#lvFlame)' }, g);
    el('ellipse', { cx: x, cy: y - fs * .22, rx: fs * .08, ry: fs * .2, fill: '#fffaf0' }, g);
  }
  (A.glints || []).forEach((q, i) => {
    const [x, y] = map(q.u, q.v), rr = q.r || 2.2;
    const host2 = still ? svg : small(x, y, Math.ceil(rr) + 2, `opacity:0;will-change:opacity;animation:live-glint ${3.5 + (i % 5) * .9}s ease-in-out ${(i * 1.37) % 5}s infinite`);
    el('circle', { cx: x, cy: y, r: rr, fill: 'url(#lvGlint)', style: still ? 'opacity:.5' : '' }, host2);
  });

  /* 4. motes: rising through the scene, or floating in a shaft of light. Each is a small layer the graphics chip moves
     and fades by itself along the same straight path, with the same fade in and out at its ends, twinkle and sway: no
     script runs while they move. Drawn before by script into a full-screen canvas 30 times a second, which kept the
     phone busy for as long as a screen was open (D-132, Dan: the phone still warmed). */
  const layer = document.createElement('div');
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  host.appendChild(layer);
  const beam = A.beam && A.beam.length === 2 ? A.beam.map(b => map(b.u, b.v).concat(b.w || .08)) : null;
  const tint = meta.live && meta.live.gold ? warm : violet;
  function place(t, qx) {
    if (!beam) return [qx * W, H * (.12 + (1 - t) * .78)];
    const [x0, y0, w0] = beam[0], [x1, y1, w1] = beam[1];
    const cx = x0 + (x1 - x0) * t, half = (w0 + (w1 - w0) * t) * W * .5;
    return [cx + (qx - .5) * 2 * half, y0 + (y1 - y0) * t];
  }
  const anims = [];
  for (let i = 0; i < (beam ? 46 : 32); i++) {
    const q = { t: Math.random(), x: Math.random(), r: .5 + Math.random() * 1.2, a: .12 + Math.random() * .4, p: Math.random() * 6.28, vy: .02 + Math.random() * .05 };
    const [xa, ya] = place(0, q.x), [xb, yb] = place(1, q.x);
    const m = document.createElement('i'), tw = document.createElement('b');
    m.style.cssText = `position:absolute;left:${(xa - q.r).toFixed(1)}px;top:${(ya - q.r).toFixed(1)}px;width:${(2 * q.r).toFixed(2)}px;height:${(2 * q.r).toFixed(2)}px` + (still ? '' : ';will-change:transform,opacity');
    tw.style.cssText = `position:absolute;inset:0;border-radius:50%;background:rgba(${tint},${q.a.toFixed(3)})`;
    m.appendChild(tw); layer.appendChild(m);
    if (still) {
      const [x, y] = place(q.t, q.x);
      m.style.transform = `translate(${(x - xa).toFixed(1)}px,${(y - ya).toFixed(1)}px)`;
      m.style.opacity = String(Math.min(1, q.t * 8, (1 - q.t) * 8) * .8);
      continue;
    }
    /* a rise takes as long as it did at 30 steps a second */
    const rise = 1 / (q.vy * .004 * (beam ? .5 : 1) * 30) * 1000;
    const go = (el, frames, o) => { const a = el.animate(frames, { iterations: Infinity, ...o }); if (document.documentElement.hasAttribute('data-resting')) a.pause(); anims.push(a); };
    go(m, [
      { transform: 'translate(0,0)', opacity: 0 },
      { transform: `translate(${((xb - xa) * .125).toFixed(1)}px,${((yb - ya) * .125).toFixed(1)}px)`, opacity: 1, offset: .125 },
      { transform: `translate(${((xb - xa) * .875).toFixed(1)}px,${((yb - ya) * .875).toFixed(1)}px)`, opacity: 1, offset: .875 },
      { transform: `translate(${(xb - xa).toFixed(1)}px,${(yb - ya).toFixed(1)}px)`, opacity: 0 },
    ], { duration: rise, delay: -q.t * rise, easing: 'linear' });
    /* the twinkle between .2 and 1 of its light, about every 9 s; the sway either side, every 19 s: .036 of the width it
       moves in (the screen's, or a shaft's), as the old drift of its place across it */
    const across = beam ? (beam[0][2] + beam[1][2]) * .5 * W : W, sway = across * .036;
    go(tw, [{ opacity: .2 }, { opacity: 1 }], { duration: 4400, direction: 'alternate', delay: -(q.p / 6.28) * 8800, easing: 'ease-in-out' });
    go(tw, [{ transform: `translateX(${(-sway).toFixed(1)}px)` }, { transform: `translateX(${sway.toFixed(1)}px)` }], { duration: 9400, direction: 'alternate', delay: -(q.p / 6.28) * 18800, easing: 'ease-in-out' });
  }
  return { stop() { for (const a of anims) a.cancel(); } };
}

/* the keyframes the layers use; added once */
if (typeof document !== 'undefined' && !document.getElementById('live-css')) {
  const s = document.createElement('style'); s.id = 'live-css';
  s.textContent = '@keyframes live-drift{from{transform:none}to{transform:scale(1.04) translate(-.6%,.8%)}}' +
    '@keyframes live-flicker{0%,100%{transform:scale(1,1)}30%{transform:scale(.94,1.07)}62%{transform:scale(1.04,.95)}}' +
    '@keyframes live-breathe{0%,100%{opacity:.88;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}' +
    '@keyframes live-glint{0%,100%{opacity:0}45%{opacity:.9}55%{opacity:.7}}' +
    '@keyframes live-slide-l{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '@keyframes live-slide-r{from{transform:translateX(-50%)}to{transform:translateX(0)}}';
  document.head.appendChild(s);
}
