<script lang="ts">
  // A painted scene and its live layers (D-041: every screen keeps moving once settled).
  // The painting is baked (paint/bake.mjs); only light layers move on the phone.
  import { onMount } from 'svelte';

  let { src, gold = false, drift = true, dim = 0 }: { src: string; gold?: boolean; drift?: boolean; dim?: number } = $props();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = canvas.getContext('2d')!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, raf = 0, last = 0;
    const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    addEventListener('resize', size);
    const rgb = gold ? '255,214,150' : '214,210,255';
    const P = Array.from({ length: 34 }, () => ({
      x: Math.random() * W, y: H * (.15 + Math.random() * .75), r: .5 + Math.random() * 1.2,
      a: .12 + Math.random() * .4, vx: (Math.random() - .5) * .08, vy: -.03 - Math.random() * .07, p: Math.random() * 6.28,
    }));
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 33) return;
      last = t;
      x.clearRect(0, 0, W, H);
      for (const q of P) {
        q.x += q.vx + Math.sin(t / 3000 + q.p) * .05; q.y += q.vy;
        if (q.y < H * .12) { q.y = H * .9; q.x = Math.random() * W; }
        const al = q.a * (.6 + .4 * Math.sin(t / 1400 + q.p * 3));
        x.beginPath(); x.arc(q.x, q.y, q.r, 0, 6.283); x.fillStyle = `rgba(${rgb},${al.toFixed(3)})`; x.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); };
  });
</script>

<div class={drift ? 'world-drift' : 'world-still'} aria-hidden="true">
  <div class="paint"><img {src} alt="" decoding="async" /></div>
  <div class="pool"></div>
  <div class="fog"><i class="drift-a"></i><i class="drift-b"></i></div>
  <div class="fog warm"><i class="drift-a"></i><i class="drift-b"></i></div>
</div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
{#if dim > 0}<div class="dim" style:opacity={dim} aria-hidden="true"></div>{/if}
<canvas class="motes" bind:this={canvas} aria-hidden="true"></canvas>
<div class="scrim-top" aria-hidden="true"></div>
<div class="scrim-bottom" aria-hidden="true"></div>

<style>
  .world-still { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .motes { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; }
  .dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #05050c; transition: opacity 1.2s var(--ease); }
</style>
