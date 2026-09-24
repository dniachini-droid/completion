<script lang="ts">
  /* The map (FIRST_PLAYABLE → the world; mock-up map.html): stars on the dark for the places, opening on where Dan is.
     Two levels (MVP.md: Close and Region). Only what has been seen is named; the way ahead is a faint star, unnamed.
     Sealed things in view are marked. Never a count of what's left (UX 6). */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import type { StretchId } from '../core/story-types';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const s = content.story;
  let level = $state<'close' | 'region'>('close');

  /* where each stretch sits on the region's sky (the first region, as the mock-up lays it out) */
  const AT: Record<StretchId, [number, number]> = {
    'st-mouth': [175, 70], 'st-hall': [210, 205], 'st-camp': [325, 140], 'st-salt': [92, 290],
    'st-stair': [318, 330], 'st-flight2': [282, 430], 'st-square': [140, 470],
  };
  const LINKS: [StretchId, StretchId][] = [['st-mouth', 'st-hall'], ['st-hall', 'st-camp'], ['st-hall', 'st-salt'], ['st-hall', 'st-stair'], ['st-stair', 'st-flight2'], ['st-flight2', 'st-square']];

  const placed = $derived(s.beats.filter(b => (b.kind === 'arrival' || b.kind === 'arrivalKey' || b.kind === 'word') && v.story.played.has(b.id)));
  const walkedOn = $derived(new Set<StretchId>([s.stretches[0].id, v.here.stretch, ...placed.map(b => b.stretch)]));   /* the way in is always walked */
  /* the stretch the next place is on: a faint star, unnamed */
  const aheadOn = $derived.by(() => {
    for (const rw of s.route) for (const p of rw.places) {
      if (v.story.played.has(p.id)) continue;
      const b = s.beats.find(x => x.id === p.id);
      if (b && b.w <= v.story.week + 1) return b.stretch;
    }
    return null;
  });
  const stretchName = (id: StretchId) => s.stretches.find(x => x.id === id)!.name;
  const sealedHere = $derived(s.seals.filter(x => !x.seenOnly && !v.story.opened.has(x.id) && x.stretch === v.here.stretch
    && s.beats.some(b => v.story.played.has(b.id) && b.carries?.inView?.includes(x.id))));

  /* close: the places on this stretch, in the order Dan reached them, down a winding line */
  const closeHere = $derived(placed.filter(b => b.stretch === v.here.stretch));
  const cx = (i: number) => (i % 2 ? 270 : 110) + ((i * 37) % 30) - 15;
  const cy = (i: number) => 70 + i * 78;
  /* the sky's height in the drawing's units; labels are placed in % of it, so they sit on their stars at any width */
  const H = $derived(level === 'region' ? 520 : Math.max(420, cy(closeHere.length + sealedHere.length) + 40));
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span>
      <div class="seg lv" role="group" aria-label={t('map.label')}>
        <button aria-pressed={level === 'close'} onclick={() => (level = 'close')}>{t('map.close')}</button>
        <button aria-pressed={level === 'region'} onclick={() => (level = 'region')}>{t('map.region')}</button>
      </div>
    </div>
    <div class="label-line rise">{level === 'region' ? t('map.label') : stretchName(v.here.stretch)}</div>
  </header>

  <div class="sky rise d1">
   <div class="frame" style="aspect-ratio: 390 / {H}">
    <svg viewBox="0 0 390 {H}" aria-hidden="true">
      {#if level === 'region'}
        {#each LINKS as [a, b]}
          {#if walkedOn.has(a) && (walkedOn.has(b) || b === aheadOn)}
            <path d="M{AT[a][0]} {AT[a][1]}L{AT[b][0]} {AT[b][1]}" class="link" class:faint={!walkedOn.has(b)} />
          {/if}
        {/each}
        {#each Object.keys(AT) as id}
          {@const k = id as StretchId}
          {#if walkedOn.has(k) || k === aheadOn}
            <circle cx={AT[k][0]} cy={AT[k][1]} r={k === v.here.stretch ? 6 : walkedOn.has(k) ? 4 : 2.2} class="star" class:here={k === v.here.stretch} class:faint={!walkedOn.has(k)} />
          {/if}
        {/each}
      {:else}
        {#each closeHere as b, i (b.id)}
          {#if i > 0}<path d="M{cx(i - 1)} {cy(i - 1)}Q{(cx(i - 1) + cx(i)) / 2} {cy(i) - 50} {cx(i)} {cy(i)}" class="link" />{/if}
          <circle cx={cx(i)} cy={cy(i)} r={b.id === v.here.id ? 6 : 4} class="star" class:here={b.id === v.here.id} />
        {/each}
        {#each sealedHere as x, j (x.id)}
          {@const i = closeHere.length + j}
          <path d="M{cx(Math.max(0, closeHere.length - 1))} {cy(Math.max(0, closeHere.length - 1))}L{cx(i)} {cy(i)}" class="link faint" />
          <rect x={cx(i) - 4} y={cy(i) - 4} width="8" height="8" transform="rotate(45 {cx(i)} {cy(i)})" class="sealed" />
        {/each}
      {/if}
    </svg>
    <!-- labels as text over the sky, so they wrap and scale like the rest of the words -->
    {#if level === 'region'}
      {#each Object.keys(AT) as id}
        {@const k = id as StretchId}
        {#if walkedOn.has(k)}
          <div class="tag" class:right={AT[k][0] > 200} style="left:{(AT[k][0] / 390) * 100}%;top:{(AT[k][1] / 520) * 100}%">
            <span class="carve sm">{stretchName(k)}</span>
            {#if k === v.here.stretch}<em class="here">{t('map.here')}</em>{/if}
          </div>
        {/if}
      {/each}
    {:else}
      {#each closeHere as b, i (b.id)}
        <div class="tag" class:right={cx(i) > 200} style="left:{(cx(i) / 390) * 100}%;top:{(cy(i) / H) * 100}%">
          <span class="carve sm">{b.name}</span>
          {#if b.id === v.here.id}<em class="here">{t('map.here')}</em>{/if}
        </div>
      {/each}
      {#each sealedHere as x, j (x.id)}
        {@const i = closeHere.length + j}
        <div class="tag" class:right={cx(i) > 200} style="left:{(cx(i) / 390) * 100}%;top:{(cy(i) / H) * 100}%">
          <em class="sealed-t">{x.where}</em><em>{t('map.sealed')}</em>
        </div>
      {/each}
    {/if}
   </div>
  </div>

  <section class="bottom col">
    <div class="card">
      <div class="label-line">{t('map.here')}</div>
      <h2 class="carve md">{v.here.name}</h2>
      {#if v.ahead}<p class="say">{t('today.ahead')}: {v.ahead}</p>{/if}
    </div>
  </section>
</div>

<style>
  .lv { margin: 0; width: auto; }
  .lv button { padding: 6px 12px; font-size: 13px; }
  .sky { position: relative; flex: 1; min-height: 0; overflow-y: auto; margin: 6px 0; }
  .frame { position: relative; width: 100%; }
  .sky svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .top { position: relative; z-index: 3; }
  .link { fill: none; stroke: rgba(222,218,255,.55); stroke-width: 1.2; filter: drop-shadow(0 0 3px rgba(143,134,255,.9)); }
  .link.faint { stroke: rgba(222,218,255,.2); stroke-dasharray: 2 5; filter: none; }
  .star { fill: #f1efff; filter: drop-shadow(0 0 6px rgba(143,134,255,1)) drop-shadow(0 0 14px rgba(143,134,255,.7)); }
  .star.here { fill: #ffe2a8; filter: drop-shadow(0 0 8px rgba(242,193,112,1)) drop-shadow(0 0 20px rgba(242,193,112,.6)); }
  .star.faint { fill: rgba(222,218,255,.5); filter: none; }
  .sealed { fill: none; stroke: #cfcaff; stroke-width: 1.2; }
  .tag { position: absolute; transform: translate(12px, -50%); display: flex; flex-direction: column; max-width: 58%; pointer-events: none; }
  .tag.right { transform: translate(calc(-100% - 12px), -50%); align-items: flex-end; text-align: right; }
  .tag em { font-family: var(--life); font-size: 15px; color: var(--ink-2); }
  .tag em.here { color: var(--gold); }
  .tag .sealed-t { color: var(--ink); }
  .card { border: 1px solid var(--edge-2); padding: 14px 18px 16px; background: rgba(10,9,24,.55); }
  .card h2 { margin: 8px 0 6px; }
  .card .say { color: var(--ink-2); font-size: 16px; }
  button.home { color: var(--ink-2); }
</style>
