<script lang="ts">
  import Prose from './Prose.svelte';
  /* Records (FIRST_PLAYABLE → the world; mock-up record.html): what Dan has found, newest first. A record in the Cut
     shows as its marks; every mark he holds reads as his guess or its meaning, the rest stay marks, carved pictures
     read in brackets (LIVES §0). Her sheet, where she made one, shows in her hand. Paper reads at once. */
  import { game, content } from './game.svelte';
  import { marksHeld, render, recordOf, recordNumber } from '../core/story';
  import { t } from '../content/copy/en';
  import Glyph from './Glyph.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { reread, opened } from './relit.svelte';

  let { go, id }: { go: Go; id?: string } = $props();
  const v = $derived(game.whole);
  const s = content.story;
  const list = $derived([...v.story.records].reverse().map(r => recordOf(s, r)).filter(r => !!r));
  const open = $derived(id ? recordOf(s, id) : undefined);
  const held = $derived(marksHeld(s, v.story));
  /* records kept in one place (a notebook's pages) are told apart by their number (L C3) */
  const title = (r: { id: string; where: string; kind: string }) => {
    const n = recordNumber(content.story, r.id), w = r.where.charAt(0).toUpperCase() + r.where.slice(1);
    return n === null ? w : `${w}, ${t(r.kind === 'paper' ? 'records.page' : 'records.part', { n })}`;
  };
  /* (nothing is written: a record read was never read back by anything, C#21) */
  function read(r: string) { go('records', r); }
  /* a record that now reads differently is lit until it is opened (MORNING-REPORT Part 3 #8) */
  $effect(() => { if (id) opened(id); });
  const isMark = (m: string) => s.marks.some(x => x.id === m);
  /* a record in the Cut says once that its marks can be opened */
  const tappable = $derived(open?.kind === 'cut' && (open.cut ?? []).some(l => render(l, held, s).some(tk => tk.t === 'glyph' && isMark(tk.mark))));
</script>

<!-- the painting behind is drawn once by App, shared by both tabs (D-093) -->
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    {#if !open}
      <!-- the two tabs on a row of their own, two equal halves: in the top bar they ran into the arrow at large text
           (spacing review, Dan's decision C4) -->
      <div class="seg lv tabs rise" role="group" aria-label={t('records.label')}>
        <button aria-pressed="true">{t('records.nav')}</button>
        <button aria-pressed="false" onclick={() => go('marks')}>{t('marks.nav')}</button>
      </div>
      <div class="label-line rise">{t('records.label')}</div>
      <h1 class="carve lg rise">{t('records.title')}</h1>
    {:else}
      <h1 class="carve lg rise">{title(open)}</h1>
      {#if tappable}<p class="soft on-scene rise">{t('records.tapMark')}</p>{/if}
    {/if}
  </header>

  <div class="body rise d1">
    {#if !open}
      <div class="col">
        {#if !list.length}<p class="soft">{t('records.none')}</p>{/if}
        {#each list as r (r!.id)}
          <button class="row" class:lit={reread.glow.includes(r!.id)} onclick={() => read(r!.id)}>
            <span class="pip"></span><span class="t">{title(r!)}</span>{#if reread.glow.includes(r!.id)}<span class="sr-only">{t('reread.sr')}</span>{/if}
          </button>
        {/each}
      </div>
    {:else if open.kind === 'paper'}
      <div class="col">{#each open.paper ?? [] as para}<p class="say paper"><Prose text={para} /></p>{/each}</div>
    {:else}
      <!-- the line of marks sits in a channel cut smooth into the face (mock-up record.html); a mark opens what Dan knows of it -->
      <section class="band">
        <div class="col">
          {#each open.cut ?? [] as line, li (li)}
            <p class="cutline">
              {#each render(line, held, s) as tk, i (i)}
                {#if tk.t === 'glyph'}{@render mark(tk.mark)}
                {:else if tk.t === 'word'}<span class="w" class:guess={tk.guess}>{tk.text}{tk.guess ? '?' : ''}</span>
                {:else if tk.t === 'pic'}<span class="pic">[{tk.text}]</span>
                {:else if tk.t === 'ring'}{@render mark('mk-ring')}
                {:else if tk.t === 'hand'}{#if tk.who === 'hers' || tk.who === 'surveyor' || tk.who === 'maker'}<span class="g"><Glyph mark={`mk-hand-${tk.who}`} size={24} /></span>{:else}{@render mark('mk-hand')}{/if}
                {:else}<span class="p">{tk.text}</span>{/if}
              {/each}
            </p>
          {/each}
        </div>
      </section>
      <!-- a cut record with a line in pencil beside it (the rod's shelf): the pencil reads at once, as paper does -->
      {#if open.paper?.length}<div class="col">{#each open.paper as para}<p class="say paper"><Prose text={para} /></p>{/each}</div>{/if}
      {#if open.sheet}
        <div class="col sheet">
          <div class="label-line">{t('records.her')}</div>
          <p class="her"><Prose text={open.sheet} /></p>
        </div>
      {/if}
    {/if}
  </div>
  {#if open}
    <section class="bottom col rise d2">
      <!-- the arrow's way: back where the record was opened from (S8, N clumsy 7) -->
      <button class="text-link" onclick={() => go('back')}><span>{t('records.done')}</span></button>
    </section>
  {/if}
</div>

{#snippet mark(id: string)}
  {#if isMark(id)}
    <button class="g" onclick={() => go('marks', id)} aria-label={t('marks.this')}><Glyph mark={id} size={34} /></button>
  {:else}<span class="g"><Glyph mark={id} size={34} /></span>{/if}
{/snippet}

<style>
  .row.lit .t { color: #fff; text-shadow: 0 0 12px rgba(var(--violet-rgb), .9), 0 0 26px rgba(var(--violet-rgb), .5); }
  .row.lit .pip { box-shadow: 0 0 10px 2px rgba(var(--violet-rgb), .8); }
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-top: 14px; padding-bottom: 28px; }
  h1 { margin-top: 8px; }
  h1 + .soft { margin-top: 6px; }
  button.row { width: 100%; text-align: left; }
  /* the list closes on a hairline, as Today's rows do (spacing review) */
  .body .col > button.row:last-of-type { border-bottom: 1px solid var(--edge-4); }
  .paper { font-size: calc(18px * var(--ts, 1)); line-height: 1.5; margin-bottom: 14px; }
  .band { position: relative; margin-top: 10px; padding: 20px 0 6px; }
  .band::before { content: ""; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(60% 90% at 50% 45%, rgba(206, 202, 255, .16), rgba(206, 202, 255, 0) 70%),
      linear-gradient(180deg, #1f1c44 0%, #2c2960 38%, #312e68 62%, #26234f 100%);
    -webkit-mask-image: linear-gradient(90deg, transparent 2px, #000 20px, #000 calc(100% - 20px), transparent calc(100% - 2px));
            mask-image: linear-gradient(90deg, transparent 2px, #000 20px, #000 calc(100% - 20px), transparent calc(100% - 2px));
    box-shadow: inset 0 9px 12px -6px rgba(3, 2, 10, .8), inset 0 -1px 0 rgba(222, 218, 255, .32), 0 -1px 0 rgba(222, 218, 255, .14),
      0 1px 0 rgba(222, 218, 255, .22), 0 12px 22px -10px rgba(3, 2, 10, .7); }
  .band .col { position: relative; }
  .cutline { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 4px 6px; margin: 0 0 14px; font-family: var(--life); font-size: calc(19px * var(--ts, 1)); line-height: 1.5; color: #fff; }
  .g { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; height: 44px; }
  button.g { color: inherit; transition: filter .3s var(--ease); }
  button.g:active, button.g:focus-visible { filter: drop-shadow(0 0 8px rgba(var(--violet-rgb), 1)); }
  .w.guess { color: var(--ink-2); font-style: italic; }
  .pic { color: var(--ink-2); font-style: italic; }
  .p { margin-left: -6px; color: var(--ink-2); }
  .tabs { margin: 4px 0 16px; grid-template-columns: 1fr 1fr; }
  .tabs button { padding: 6px 12px; font-size: calc(14px * var(--ts, 1)); }
  .sheet { margin-top: 22px; }
  .her { font-family: var(--life); font-style: italic; font-size: calc(17.5px * var(--ts, 1)); line-height: 1.5; color: var(--ink-2); margin-top: 8px; }
  .bottom { display: flex; justify-content: center; }
  button.home { color: var(--ink-2); }
</style>
