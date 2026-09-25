<script lang="ts">
  /* A mark of the Cut in its own lettering (SCRIPT §2; content/sealed/lettering.ts): straight chisel cuts in a square
     cell, the ring the only curve. Drawn as the record mock-up draws them: a dark groove under a lit cut.
     `part` draws a partial sign (one element alone, SCRIPT §8). A mark with no drawing yet shows an empty cell. */
  import { lettering, parts, type Letter } from '../content/sealed/lettering';

  let { mark = '', part = '', size = 34, lit = false, dim = false }: { mark?: string; part?: string; size?: number; lit?: boolean; dim?: boolean } = $props();
  const L = $derived<Letter>((part ? parts[part] : lettering[mark]) ?? { d: 'M8 8 L32 8 L32 32 L8 32 Z' });
  /* the cut stays the same weight on screen whatever the size */
  const w = $derived(Math.max(1.9, Math.min(3.2, 2.4 * 34 / size)));
</script>

<svg class="glyph" class:lit class:dim width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
  <g class="groove" transform="translate(.9 1.1)">
    {#if L.d}<path d={L.d} stroke-width={w * 1.25} />{/if}
    {#each L.rings ?? [] as [cx, cy, r]}<circle {cx} {cy} {r} stroke-width={w * 1.25} />{/each}
  </g>
  <g class="cut">
    {#if L.d}<path d={L.d} stroke-width={w} />{/if}
    {#each L.rings ?? [] as [cx, cy, r]}<circle {cx} {cy} {r} stroke-width={w} />{/each}
  </g>
</svg>

<style>
  .glyph { display: inline-block; vertical-align: middle; overflow: visible; flex: none; }
  .glyph :global(path), .glyph :global(circle) { fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .groove :global(*) { stroke: #05040c; stroke-opacity: .75; }
  .cut :global(*) { stroke: #d9d6ff; }
  .cut { filter: drop-shadow(0 0 3px rgba(143,134,255,.75)); }
  .lit .cut :global(*) { stroke: #fff; }
  .lit .cut { filter: drop-shadow(0 0 4px rgba(143,134,255,1)) drop-shadow(0 0 11px rgba(143,134,255,.6)); }
  .dim .cut :global(*) { stroke: rgba(217,214,255,.55); }
  .dim .cut { filter: none; }
</style>
