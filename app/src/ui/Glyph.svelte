<script lang="ts">
  /* A mark of the Cut, drawn from its elements (SCRIPT §3: forks, cups, drops, bars, hooks, wedges…), cut in light.
     Every mark sits in the same square; unknown elements fall back to a short cut so nothing is ever blank. */
  import { content } from './game.svelte';

  let { mark, size = 34, lit = false }: { mark: string; size?: number; lit?: boolean } = $props();
  const m = $derived(content.story.marks.find(x => x.id === mark));

  /* each element in a 24 × 24 cell; several elements share the cell, placed as a scribe would */
  const EL: Record<string, string> = {
    fork: 'M12 20V12M12 12L7 4M12 12L17 4',
    cup: 'M5 11Q5 20 12 20Q19 20 19 11',
    drop: 'M12 9Q9.5 13 12 15Q14.5 13 12 9Z',
    'drop-leaving': 'M17 14Q15.5 16.5 17 18Q18.5 16.5 17 14Z',
    'drop-entering': 'M7 14Q5.5 16.5 7 18Q8.5 16.5 7 14Z',
    bar: 'M4 19H20',
    'bar-top': 'M4 6H20',
    hook: 'M8 20V9Q8 4 13 4Q17 4 17 8',
    'hook-open': 'M8 20V9Q8 4 13 4Q17 4 17 8',
    'hook-closed': 'M8 20V9Q8 4 13 4Q17 4 17 9Q17 13 12 13',
    'hook-closing': 'M8 20V9Q8 4 13 4Q17 4 17 9Q17 12 14 12',
    wedge: 'M5 5L12 19L19 5',
    'wedge-inverted': 'M5 19L12 5L19 19',
    diamond: 'M12 4L19 12L12 20L5 12Z',
    strokes: 'M6 6V18M10 6V18M14 6V18M18 6V18',
    cell: 'M4 4H20V20H4ZM12 4V20',
    ring: 'M12 5A7 7 0 1 0 12.01 5Z',
    dot: 'M12 11.2A.8.8 0 1 0 12.01 11.2Z',
    tick: 'M17 15L19 12',
    'two-drops': 'M8 10Q6 13 8 15Q10 13 8 10ZM16 10Q14 13 16 15Q18 13 16 10Z',
    'two-drops-parted': 'M6 10Q4 13 6 15Q8 13 6 10ZM18 10Q16 13 18 15Q20 13 18 10Z',
    'three-bars': 'M6 7H18M6 12H18M6 17H18',
    'rising-bar': 'M6 18L18 8',
    'fork-sideways': 'M4 12H12M12 12L20 7M12 12L20 17',
    'bar-over-bar': 'M4 9H20M4 15H20',
  };
  function path(name: string, i: number): string {
    if (EL[name]) return EL[name];
    /* a name like "drop on a bar": try each word */
    for (const w of name.split(/[\s_]+/)) if (EL[w]) return EL[w];
    return `M${7 + i * 3} 8V16`;
  }
  const d = $derived((m?.elements ?? []).map(path).join(' ') || 'M8 6V18M16 6V18');
</script>

<svg class="glyph" class:lit width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {d} /></svg>

<style>
  .glyph { display: inline-block; vertical-align: middle; overflow: visible; }
  .glyph path { fill: none; stroke: #d9d6ff; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
    filter: drop-shadow(0 0 3px rgba(143,134,255,.8)); }
  .glyph.lit path { stroke: #fff; filter: drop-shadow(0 0 5px rgba(143,134,255,1)) drop-shadow(0 0 12px rgba(143,134,255,.6)); }
</style>
