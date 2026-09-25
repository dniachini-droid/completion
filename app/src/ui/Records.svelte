<script lang="ts">
  /* Records (FIRST_PLAYABLE → the world; mock-up record.html): what Dan has found, newest first. A record in the Cut
     shows as its marks; every mark he holds reads as his guess or its meaning, the rest stay marks, carved pictures
     read in brackets (LIVES §0). Her sheet, where she made one, shows in her hand. Paper reads at once. */
  import { game, content } from './game.svelte';
  import { marksHeld, render, recordOf } from '../core/story';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import Glyph from './Glyph.svelte';
  import type { Go } from './nav';

  let { go, id }: { go: Go; id?: string } = $props();
  const v = $derived(game.view);
  const s = content.story;
  const list = $derived([...v.story.records].reverse().map(r => recordOf(s, r)).filter(r => !!r));
  const open = $derived(id ? recordOf(s, id) : undefined);
  const held = $derived(marksHeld(s, v.story));
  const title = (r: { where: string }) => r.where.charAt(0).toUpperCase() + r.where.slice(1);
  function read(r: string) { game.do({ do: 'read', record: r }); go('records', r); }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => (open ? go('records') : go('today'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{open ? t('records.label') : t('delve.today')}</span></button>
      <span></span>
      {#if !open}
        <div class="seg lv" role="group" aria-label={t('records.label')}>
          <button aria-pressed="true">{t('records.nav')}</button>
          <button aria-pressed="false" onclick={() => go('marks')}>{t('marks.nav')}</button>
        </div>
      {:else}<span></span>{/if}
    </div>
    {#if !open}
      <div class="label-line rise">{t('records.label')}</div>
      <h1 class="carve lg rise">{t('records.title')}</h1>
    {:else}
      <div class="label-line rise">{t('records.label')}</div>
      <h1 class="carve md rise">{title(open)}</h1>
    {/if}
  </header>

  <div class="body col rise d1">
    {#if !open}
      {#if !list.length}<p class="soft">{t('records.none')}</p>{/if}
      {#each list as r (r!.id)}
        <button class="row" onclick={() => read(r!.id)}>
          <span class="pip"></span><span class="t">{title(r!)}</span>
        </button>
      {/each}
    {:else if open.kind === 'paper'}
      {#each open.paper ?? [] as para}<p class="say paper">{para}</p>{/each}
    {:else}
      {#each open.cut ?? [] as line, li (li)}
        <p class="cutline">
          {#each render(line, held, s) as tk, i (i)}
            {#if tk.t === 'glyph'}<span class="g"><Glyph mark={tk.mark} size={24} /></span>
            {:else if tk.t === 'word'}<span class="w" class:guess={tk.guess}>{tk.text}{tk.guess ? '?' : ''}</span>
            {:else if tk.t === 'pic'}<span class="pic">[{tk.text}]</span>
            {:else if tk.t === 'ring'}<span class="g"><Glyph mark="mk-ring" size={24} /></span>
            {:else if tk.t === 'hand'}<span class="g"><Glyph mark={tk.who === 'hers' ? 'mk-hand-hers' : 'mk-hand'} size={24} /></span>
            {:else}<span class="p">{tk.text}</span>{/if}
          {/each}
        </p>
      {/each}
      <!-- a cut record with a line in pencil beside it (the rod's shelf): the pencil reads at once, as paper does -->
      {#each open.paper ?? [] as para}<p class="say paper">{para}</p>{/each}
      {#if open.sheet}
        <div class="sheet">
          <div class="label-line">{t('records.her')}</div>
          <p class="her">{open.sheet}</p>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-top: 14px; padding-bottom: 28px; }
  h1 { margin-top: 8px; }
  button.row { width: 100%; text-align: left; }
  .paper { font-size: 18px; line-height: 1.5; margin-bottom: 14px; }
  .cutline { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin: 0 0 16px; font-family: var(--life); font-size: 19px; line-height: 1.5; color: #fff; }
  .w.guess { color: var(--ink-2); font-style: italic; }
  .pic { color: var(--ink-2); font-style: italic; }
  .p { margin-left: -6px; color: var(--ink-2); }
  .lv { margin: 0; width: auto; }
  .lv button { padding: 6px 12px; font-size: 13px; }
  .sheet { margin-top: 18px; }
  .her { font-family: var(--life); font-style: italic; font-size: 17.5px; line-height: 1.5; color: var(--ink-2); margin-top: 8px; }
  button.home { color: var(--ink-2); }
</style>
