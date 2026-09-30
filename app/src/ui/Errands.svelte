<script lang="ts">
  /* The errand run's pick list (Dan, D-139): the jobs still to do (today's, then the Satchel's one-offs), each ticked to
     go on one trip out; "Start the run" opens the usual delve set-up for them (D-124). Reached from the Satchel and,
     quietly, from the foot of Today's list. Nothing is written until the run begins. */
  import { game, content } from './game.svelte';
  import { errandChoices, satchelView, ERRANDS_MAX } from '../core/game';
  import { t, dayShort } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { errandPick } from './errand-pick.svelte';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const ids = $derived(errandChoices(content, game.facts, game.now));
  const s = $derived(satchelView(content, game.facts, game.now));
  const onDay = $derived(new Map(s.coming.map(x => [x.job.id, x.day])));
  const today = $derived(ids.filter(id => v.slate.includes(id)));
  const later = $derived(ids.filter(id => !v.slate.includes(id)));
  /* a tick kept from before that is no longer a choice (done since, deleted) is let go */
  const picked = $derived(errandPick.jobs.filter(id => ids.includes(id)));
  const ready = $derived(picked.length >= 2 && !v.run);

  function toggle(id: string) {
    const on = errandPick.jobs.includes(id);
    if (!on && picked.length >= ERRANDS_MAX) return;
    errandPick.jobs = on ? errandPick.jobs.filter(x => x !== id) : [...errandPick.jobs.filter(x => ids.includes(x)), id];
  }
  /* the run's errands in the list's order, whatever order they were ticked in */
  function start() { if (ready) { errandPick.jobs = ids.filter(id => picked.includes(id)); go('set', 'errands'); } }
</script>

{#snippet pickRow(id: string)}
  {@const j = game.job(id)}
  {#if j}
    {@const on = picked.includes(id)}
    <button class="row pick" class:on role="checkbox" aria-checked={on} aria-label={t('errand.sr', { job: j.name })} onclick={() => toggle(id)}>
      <span class="tick" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4.5 8.3 7 10.7l4.6-5.2" /></svg></span>
      <span class="t">{j.name}</span><span class="s">{onDay.has(id) ? dayShort(onDay.get(id)!) : ''}</span>
    </button>
  {/if}
{/snippet}

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <h1 class="carve lg rise">{t('errand.title')}</h1>
    <p class="soft say-note rise">{t('errand.say')}</p>
  </header>

  <div class="body col rise d1">
    {#if ids.length < 2}
      <p class="soft empty">{t('errand.none')}</p>
    {:else}
      {#if today.length}
        <div class="label-line">{t('errand.today')}</div>
        <div class="rows">{#each today as id (id)}{@render pickRow(id)}{/each}</div>
      {/if}
      {#if later.length}
        <div class="label-line">{t('nav.satchel')}</div>
        <div class="rows">{#each later as id (id)}{@render pickRow(id)}{/each}</div>
      {/if}
    {/if}
  </div>

  {#if ids.length >= 2}
    <section class="bottom col rise d2">
      {#if !ready}<p class="soft more" aria-live="polite">{t('errand.more')}</p>{/if}
      <button class="btn" disabled={!ready} onclick={start}>{t('errand.start')}</button>
    </section>
  {/if}
</div>

<style>
  h1 { margin-top: 4px; }
  .say-note { margin-top: 4px; text-align: left; }
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 16px; }
  .label-line { margin-top: 18px; margin-bottom: 4px; }
  .empty { margin: 18px 0 4px; text-align: left; }
  .pick { width: 100%; text-align: left; background: none; border-left: 0; border-right: 0; border-bottom: 0; padding: 0; cursor: pointer; color: inherit; }
  .tick { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--ink-3); justify-self: center; }
  .tick svg { width: 14px; height: 14px; fill: none; stroke: #1a1030; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
  .pick.on .tick { background: var(--violet-hi); border-color: var(--violet-hi); }
  .pick.on .tick svg { opacity: 1; }
  .bottom { padding-top: 10px; padding-bottom: 14px; }
  .bottom .btn { width: 100%; }
  .bottom .btn:disabled { opacity: .5; }
  .more { margin: 0 0 8px; text-align: center; font-style: italic; }
  button.home { color: var(--ink-2); }
</style>
