<script lang="ts">
  /* The satchel (TOOLS §2; mock-up satchel.html): for the days Dan has a list. Never on the opening screen. One line or
     many at once; the first handful shows, the rest folded away. Ticking feels good, but only moves the expedition when
     the line is one of today's jobs ("Today" puts it there). No counts, no overdue marks; untouched lines go quietly to
     someday after three weeks, and nothing is announced. */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
  import { items } from '../core/week';
  import { platform } from '../platform';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { flushSync } from 'svelte';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const all = $derived(items(game.facts, v.day));
  const open = $derived(all.filter(i => !i.someday));
  const someday = $derived(all.filter(i => i.someday));
  let more = $state(false), showSomeday = $state(false), text = $state(''), adding = $state(false);
  const FIRST = 5;
  const shown = $derived(more ? open : open.slice(0, FIRST));
  /* "Add a line" opens its box already typing (as the Week's + does, D-107) */
  let box = $state<HTMLTextAreaElement | null>(null);
  function startAdd() { adding = true; flushSync(); box?.focus(); box?.scrollIntoView({ block: 'nearest' }); }

  function put() {
    const lines = text.split('\n');
    if (!lines.some(l => l.trim())) return;
    game.do({ do: 'addItems', lines }); text = ''; adding = false;
  }
  function tick(id: string) {
    const f = game.do({ do: 'tick', id });
    platform.sound.chime('breatherEnd');
    const d = f.find(x => x.type === 'jobDone');
    if (d) go('step', d.seq);
  }
  function today(id: string) { game.do({ do: 'planJob', job: id, day: v.day }); }
  let picked = $state<string | null>(null);
  function drop(id: string) { game.do({ do: 'dropItem', id }); picked = null; }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <h1 class="carve lg rise">{t('satchel.label')}</h1>
    <p class="soft say-note rise">{t('satchel.say')}</p>
  </header>

  <div class="body col rise d1">
    {#if !all.length && !adding}<p class="soft say-note">{t('satchel.empty')}</p>{/if}
    {#each shown as it (it.id)}
      <div class="item" class:done={it.done}>
        <button class="tickbox" aria-pressed={it.done} aria-label={t('satchel.tick', { name: it.name })} disabled={it.done} onclick={() => tick(it.id)}><span class="pip" class:done={it.done}></span></button>
        <!-- a tap on the line shows "Let it go", for a line no longer wanted (review 2, D-088) -->
        <button class="t" disabled={it.done || v.slate.includes(it.id)} onclick={() => (picked = picked === it.id ? null : it.id)}>{it.name}</button>
        {#if !it.done}
          {#if v.slate.includes(it.id)}<span class="s">{t('satchel.onToday')}</span>
          {:else if picked === it.id}<button class="text-link small" onclick={() => drop(it.id)}><span>{t('satchel.letGo')}</span></button>
          {:else}<button class="text-link small" onclick={() => today(it.id)}><span>{t('satchel.today')}</span></button>{/if}
        {/if}
      </div>
    {/each}
    {#if open.length > FIRST}
      <button class="text-link fold" onclick={() => (more = !more)}><span>{more ? t('satchel.less') : t('satchel.more')}</span></button>
    {/if}
    {#if adding}
      <textarea class="lines" bind:this={box} bind:value={text} rows="4" placeholder={t('satchel.addMany')}></textarea>
      <div class="btn-row"><button class="btn" onclick={put}>{t('satchel.put')}</button><button class="btn-quiet" onclick={() => (adding = false)}><span>{t('rhythms.cancel')}</span></button></div>
    {:else}
      <div class="links"><button class="text-link" onclick={startAdd}><span>{t('satchel.add')}</span></button>
        {#if someday.length}<button class="text-link" onclick={() => (showSomeday = !showSomeday)}><span>{t('satchel.someday')}</span></button>{/if}</div>
    {/if}
    {#if showSomeday}
      {#each someday as it (it.id)}
        <div class="item someday">
          <button class="tickbox" aria-label={t('satchel.tick', { name: it.name })} onclick={() => tick(it.id)}><span class="pip"></span></button>
          <button class="t" onclick={() => (picked = picked === it.id ? null : it.id)}>{it.name}</button>
          {#if picked === it.id}<button class="text-link small" onclick={() => drop(it.id)}><span>{t('satchel.letGo')}</span></button>
          {:else}<button class="text-link small" onclick={() => today(it.id)}><span>{t('satchel.today')}</span></button>{/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  .say-note { margin-top: 4px; text-align: left; }
  .item { display: flex; align-items: center; gap: 10px; min-height: 48px; border-bottom: 1px solid var(--edge-2); }
  .item .t { flex: 1; font-size: 17px; color: #fff; text-align: left; min-height: 44px; background: none; border: 0; padding: 0; font-family: inherit; }
  .item .t:disabled { cursor: default; }
  .item.done .t { color: var(--ink-3); text-decoration: line-through; text-decoration-thickness: 1px; }
  .item .s { font-family: var(--life); font-size: 15px; color: var(--gold); }
  .tickbox { width: 44px; height: 44px; display: grid; place-items: center; margin-left: -12px; }
  .small span { font-size: 15px; }
  .fold { margin-top: 8px; }
  .links { display: flex; justify-content: center; gap: 18px; margin-top: 16px; }
  textarea.lines { width: 100%; margin-top: 12px; padding: 10px 12px; font: inherit; font-size: 17px; color: #fff; background: rgba(255,255,255,.06); border: 1px solid var(--edge-2); border-radius: 0; resize: vertical; }
  .btn-row { margin-top: 10px; }
  button.home { color: var(--ink-2); }
</style>
