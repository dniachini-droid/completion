<script lang="ts">
  /* The head of the stair, beyond the lintel (mock-up stair.html; D-039: no dead ends for effort). The same painted hand
     as the hall; the view drifts slowly down towards the well, light wakes down the treads and a slow pulse keeps running
     down them, "this way" (D-041). Go down opens the next delve; Today is always there. */
  import { onMount } from 'svelte';
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import type { Go } from './nav';
  import './scene/lamp.js';
  import './scene/hall.js';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const s = content.story;
  /* the stretch beyond the first word: the one whose walking waits on it */
  const stretch = s.stretches.find(x => x.req.includes(s.words[0]?.beats[0] ?? '')) ?? s.stretches[0];
  let hallEl: HTMLDivElement, motes: HTMLCanvasElement;

  interface HallView { svg: SVGSVGElement; project(x: number, y: number, z: number): [number, number] | null; }
  const Hall = (window as unknown as { Hall: { draw(el: HTMLElement, o: object): HallView } }).Hall;

  onMount(() => {
    const H = Hall.draw(hallEl, { scene: 'stair', cam: { x: -1.05, y: 1.7, z: .3, pitch: -28, f: .6, cx: .42, cy: .4 }, res: .8 });
    /* light on the treads' front edges (the stair's geometry from hall.js: lip at z 1.05, tread .34, riser .31) */
    const NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'tread-glow'); g.style.mixBlendMode = 'screen';
    const fl = document.createElementNS(NS, 'filter');
    fl.id = 'treadSoft'; fl.setAttribute('x', '-20%'); fl.setAttribute('y', '-200%'); fl.setAttribute('width', '140%'); fl.setAttribute('height', '500%');
    fl.innerHTML = '<feGaussianBlur stdDeviation="1.6"/>'; H.svg.querySelector('defs')?.appendChild(fl);
    g.setAttribute('filter', 'url(#treadSoft)');
    for (let n = 1; n <= 22; n++) {
      const m = n - 1, y = -.31 * m, z = 1.05 + m * .34, a = H.project(-.28, y, z), b = H.project(1.62, y, z);
      if (!a || !b) continue;
      const w = Math.max(.5, 5 / (z + .6)), fade = Math.exp(-n / 8);
      for (const k of ['base', 'pulse']) {
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', String(a[0])); l.setAttribute('y1', String(a[1])); l.setAttribute('x2', String(b[0])); l.setAttribute('y2', String(b[1]));
        l.setAttribute('stroke-width', (k === 'pulse' ? w * 2.4 : w).toFixed(2)); l.setAttribute('class', k);
        l.style.setProperty('--n', String(n)); l.style.setProperty('--o', (.55 * fade + .08).toFixed(3)); l.style.setProperty('--p', Math.min(1, 1.2 * fade + .25).toFixed(3));
        g.appendChild(l);
      }
    }
    H.svg.appendChild(g);
    requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('awake')));

    /* dust in the air, rising slowly */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = motes.getContext('2d')!, dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, Hh = 0, raf = 0, last = 0;
    const size = () => { W = motes.clientWidth; Hh = motes.clientHeight; motes.width = W * dpr; motes.height = Hh * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const P = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Hh * (.2 + Math.random() * .55), r: .5 + Math.random() * 1.3, a: .15 + Math.random() * .45, vx: (Math.random() - .5) * .08, vy: -.02 - Math.random() * .06, p: Math.random() * 6.28 }));
    const tick = (tm: number) => {
      raf = requestAnimationFrame(tick);
      if (tm - last < 33) return; last = tm;
      x.clearRect(0, 0, W, Hh);
      for (const q of P) {
        q.x += q.vx + Math.sin(tm / 3000 + q.p) * .05; q.y += q.vy; q.p += .002;
        if (q.y < Hh * .2 - 10) { q.y = Hh * .75; q.x = Math.random() * W; }
        x.beginPath(); x.arc(q.x, q.y, q.r, 0, 6.283); x.fillStyle = `rgba(214,210,255,${(q.a * (.6 + .4 * Math.sin(tm / 1400 + q.p * 3))).toFixed(3)})`; x.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  function down() {
    const job = v.order.find(x => !v.done.has(x) && game.job(x)?.delve) ?? content.jobs.find(j => j.delve)?.id;
    if (job) go('set', job); else go('today');
  }
  function today() { go(v.arrival ? 'arrival' : 'today'); }
</script>

<div class="push" aria-hidden="true"><div class="paint" bind:this={hallEl}></div></div>
<div class="fog fast" aria-hidden="true"><i class="drift-a"></i><i class="drift-b"></i></div>
<canvas class="motes" bind:this={motes} aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="scrim-top" aria-hidden="true"></div>
<div class="scrim-bottom" aria-hidden="true"></div>

<div class="ui">
  <header class="topbar col rise">
    <button class="home" onclick={today}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
    <span></span>
    <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
  </header>
  <div class="top col head rise d2">
    <div class="label-line lit">{t('stair.label')}</div>
    <h1 class="carve lg">{stretch.name}</h1>
  </div>
  <div class="mid"></div>
  <section class="bottom col rise d4">
    <p class="soft on-scene">{t('stair.say')}</p>
    <div class="btn-row lead"><button class="btn" onclick={down}>{t('stair.down')}</button><button class="btn-quiet" onclick={today}><span>{t('delve.today')}</span></button></div>
  </section>
</div>

<style>
  .motes { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; }
  .scrim-top { height: 250px; }
  .scrim-bottom { height: 30%; }
  .push { position: absolute; inset: 0; transform-origin: 50% 40%; animation: push 3.2s cubic-bezier(.2,.7,.1,1) both; }
  .push .paint { position: absolute; inset: 0; }
  @keyframes push { from { transform: scale(1.1); opacity: 0; } 30% { opacity: 1; } to { transform: none; opacity: 1; } }
  .head { margin-top: 12px; }
  .head .carve { margin-top: 12px; }
  .bottom .soft { text-align: center; margin-bottom: 18px; }
  button.home { color: var(--ink-2); }
  /* the stair moves (D-041): the view drifts slowly down towards the well; light wakes down the treads, then a slow pulse
     keeps running down them into the mist */
  .push :global(.hall) { animation: stair-drift 26s ease-in-out 3.2s infinite alternate; transform-origin: 62% 55%; }
  @keyframes stair-drift { from { transform: none; } to { transform: scale(1.045) translate(-.6%, 1.2%); } }
  .push :global(.tread-glow line) { stroke: #dcd8ff; stroke-linecap: round; fill: none; }
  .push :global(.tread-glow .base) { opacity: 0; transition: opacity 1.4s var(--ease); transition-delay: calc(1.6s + var(--n) * .16s); }
  .push :global(.tread-glow.awake .base) { opacity: var(--o); }
  .push :global(.tread-glow .pulse) { opacity: 0; animation: tread-pulse 7s linear infinite; animation-delay: calc(5.5s + var(--n) * .13s); }
  @keyframes tread-pulse { 0% { opacity: 0; } 4% { opacity: var(--p); } 14% { opacity: 0; } 100% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .push :global(.hall) { animation: none; } .push :global(.tread-glow .pulse) { display: none; } }
</style>
