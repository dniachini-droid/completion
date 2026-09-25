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
const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

export function live(host, meta) {
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

  /* 2. mist */
  const fogs = (A.fog || []).map(f => {
    const [x, y] = map(f.u, f.v), w = (f.w || 1) * W;
    const c = document.createElement('canvas');
    c.width = Math.round(w); c.height = Math.round(w * (f.h || .5));
    c.style.cssText = `position:absolute;left:${x - w / 2}px;top:${y - c.height / 2}px;mix-blend-mode:screen;pointer-events:none;opacity:${f.a || .8};` +
      '-webkit-mask-image:radial-gradient(closest-side,#000 40%,transparent);mask-image:radial-gradient(closest-side,#000 40%,transparent)';
    world.appendChild(c);
    return { c, x: c.getContext('2d'), tex: cloudTexture(f.tint || violet), speed: f.speed || 1 };
  });

  /* 3. flames, halos, glints */
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, style: 'position:absolute;inset:0;pointer-events:none;overflow:visible' }, world);
  const defs = el('defs', {}, svg);
  defs.innerHTML =
    '<radialGradient id="lvHalo"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".9"/><stop offset=".25" stop-color="#f6a650" stop-opacity=".4"/><stop offset="1" stop-color="#f6a650" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="lvFlame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d0" stop-opacity=".1"/><stop offset=".35" stop-color="#ffd27a"/><stop offset="1" stop-color="#f08a2c"/></linearGradient>' +
    '<radialGradient id="lvGlint"><stop offset="0" stop-color="#f1efff"/><stop offset="1" stop-color="#b9b2ff" stop-opacity="0"/></radialGradient>';
  for (const f of A.flame || []) {
    const [x, y] = map(f.u, f.v), perM = f.s * meta.width * map.k;     /* host pixels per metre, there */
    const fs = Math.max(4, perM * .11 * (f.size || 1));
    const calm = f.still || (meta.live && meta.live.flame === 'still');
    const g = el('g', { style: `transform-origin:${x}px ${y}px;${still || calm ? '' : 'animation:live-flicker 2.8s ease-in-out infinite;'}` }, svg);
    el('circle', { cx: x, cy: y - fs * .4, r: Math.max(10, perM * .7 * (f.size || 1)), fill: 'url(#lvHalo)', style: 'mix-blend-mode:screen;' + (calm && !still ? `transform-origin:${x}px ${y - fs * .4}px;animation:live-breathe 7s ease-in-out infinite` : '') }, g);
    if (f.body && globalThis.ClayLamp) globalThis.ClayLamp.draw(g, { x, y, size: fs * 2.6, pool: .8 });
    el('path', { d: `M${x} ${y - fs * 1.15} Q${x + fs * .36} ${y - fs * .35} ${x + fs * .18} ${y - fs * .05} Q${x} ${y + fs * .1} ${x - fs * .2} ${y - fs * .05} Q${x - fs * .3} ${y - fs * .4} ${x} ${y - fs * 1.15}Z`, fill: 'url(#lvFlame)' }, g);
    el('ellipse', { cx: x, cy: y - fs * .22, rx: fs * .08, ry: fs * .2, fill: '#fffaf0' }, g);
  }
  (A.glints || []).forEach((q, i) => {
    const [x, y] = map(q.u, q.v);
    el('circle', { cx: x, cy: y, r: q.r || 2.2, fill: 'url(#lvGlint)', style: still ? 'opacity:.5' : `opacity:0;animation:live-glint ${3.5 + (i % 5) * .9}s ease-in-out ${(i * 1.37) % 5}s infinite` }, svg);
  });

  /* 4. motes: rising through the scene, or floating in a shaft of light */
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  host.appendChild(cv);
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  const mx = cv.getContext('2d'); mx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const beam = A.beam && A.beam.length === 2 ? A.beam.map(b => map(b.u, b.v).concat(b.w || .08)) : null;
  const P = [];
  for (let i = 0; i < (beam ? 46 : 32); i++) P.push({ t: Math.random(), x: Math.random(), r: .5 + Math.random() * 1.2, a: .12 + Math.random() * .4, p: Math.random() * 6.28, vy: .02 + Math.random() * .05 });
  function place(q) {
    if (!beam) return [q.x * W, H * (.12 + (1 - q.t) * .78)];
    const [x0, y0, w0] = beam[0], [x1, y1, w1] = beam[1], k = q.t;
    const cx = x0 + (x1 - x0) * k, half = (w0 + (w1 - w0) * k) * W * .5;
    return [cx + (q.x - .5) * 2 * half, y0 + (y1 - y0) * k];
  }

  let last = 0, stop = false;
  function tick(t) {
    if (stop) return;
    requestAnimationFrame(tick);
    if (t - last < 33) return; last = t;
    for (const f of fogs) {
      const w = f.c.width, h = f.c.height, off = (t / 1000 * 6 * f.speed) % w;
      f.x.clearRect(0, 0, w, h);
      f.x.drawImage(f.tex, -off, 0, w, h); f.x.drawImage(f.tex, w - off, 0, w, h);
      f.x.globalAlpha = .6; const o2 = (t / 1000 * 3.5 * f.speed) % w;
      f.x.drawImage(f.tex, o2, h * .08, w, h); f.x.drawImage(f.tex, o2 - w, h * .08, w, h); f.x.globalAlpha = 1;
    }
    mx.clearRect(0, 0, W, H);
    for (const q of P) {
      q.t = (q.t + q.vy * .004 * (beam ? .5 : 1)) % 1;
      q.x += Math.sin(t / 3000 + q.p) * .0004;
      const [x, y] = place(q);
      const al = q.a * (.6 + .4 * Math.sin(t / 1400 + q.p * 3)) * Math.min(1, q.t * 8, (1 - q.t) * 8);
      mx.beginPath(); mx.arc(x, y, q.r, 0, 6.283); mx.fillStyle = `rgba(${meta.live && meta.live.gold ? warm : violet},${al.toFixed(3)})`; mx.fill();
    }
  }
  if (still) { tick(0); stop = true; } else requestAnimationFrame(tick);
  return { stop() { stop = true; } };
}

/* the keyframes the layers use; added once */
if (typeof document !== 'undefined' && !document.getElementById('live-css')) {
  const s = document.createElement('style'); s.id = 'live-css';
  s.textContent = '@keyframes live-drift{from{transform:none}to{transform:scale(1.04) translate(-.6%,.8%)}}' +
    '@keyframes live-flicker{0%,100%{transform:scale(1,1)}30%{transform:scale(.94,1.07)}62%{transform:scale(1.04,.95)}}' +
    '@keyframes live-breathe{0%,100%{opacity:.88;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}' +
    '@keyframes live-glint{0%,100%{opacity:0}45%{opacity:.9}55%{opacity:.7}}';
  document.head.appendChild(s);
}
