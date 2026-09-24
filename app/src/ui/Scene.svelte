<script lang="ts">
  /* A place's painting, full-bleed and alive (D-041): the baked image with its live layers, the day's gold pooling in,
     drifting fog, grain and vignette, and washes so words read on it. Never framed (DESIGN_SYSTEM → Never). */
  import { live } from '../../paint/kit/live.js';
  import { paintings, lift } from './paintings';

  let { painting, blur = false, framed = false, top = '300px', bottom = '58%' }: { painting: string; blur?: boolean; framed?: boolean; top?: string; bottom?: string } = $props();
  let host: HTMLDivElement;
  const p = $derived(paintings[painting]);
  const f = $derived(framed ? lift(p) : { s: 1, t: 0 });

  $effect(() => {
    const meta = p.meta, img = host.querySelector('img')!;
    let handle: { stop(): void } | null = null, gone = false;
    const start = () => { if (!gone) handle = live(host, meta); };
    img.complete && img.naturalWidth ? start() : img.addEventListener('load', start, { once: true });
    return () => { gone = true; handle?.stop(); };
  });
</script>

{#key painting}
  <div class="paint scene" class:blur bind:this={host} aria-hidden="true" style="--ls:{f.s.toFixed(2)};--lt:{(f.t * 100).toFixed(1)}%"><img class="paint-img paint" src={p.url} alt="" /></div>
{/key}
<div class="pool" aria-hidden="true"></div>
<div class="fog" aria-hidden="true"><i class="drift-a"></i><i class="drift-b"></i></div>
<div class="fog warm" aria-hidden="true"><i class="drift-a"></i><i class="drift-b"></i></div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="scrim-top" aria-hidden="true" style="height:{top}"></div>
<div class="scrim-bottom" aria-hidden="true" style="height:{bottom}"></div>

<style>
  .scene { overflow: hidden; transform: translateY(var(--lt, 0)) scale(var(--ls, 1)); animation: fadein 1.2s var(--ease) both; }
  .scene :global(img.paint) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .scene.blur { filter: blur(6px) brightness(.7); }
</style>
