<script lang="ts">
  /* Camp and bedtime (CORE_LOOPS → evening close; mock-up camp.html). By the lamp in the hall: what today held, the
     bedtime Dan chose, and Goodnight. In bed by then, and something small is waiting in the morning; missing it removes
     nothing and is never mentioned (rule 9). Bedtime also sets tomorrow's suggested size. */
  import { onMount } from 'svelte';
  import { game, content } from './game.svelte';
  import { t, inSentence } from '../content/copy/en';
  import { beatOf } from '../core/story';
  import type { Go } from './nav';
  import './scene/lamp.js';
  import './scene/hall.js';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const s = content.story;
  const hall = s.stretches.find(x => x.id === 'st-hall')!;
  const lit = game.view.story.played.has(s.words[0]?.beats[0] ?? '');
  let hallEl: HTMLDivElement;
  let changing = $state(false);
  let draft = $state(game.view.bedtime);

  const Hall = (window as unknown as { Hall: { draw(el: HTMLElement, o: object): unknown } }).Hall;
  onMount(() => { Hall.draw(hallEl, { cam: { x: .6, y: 1.55, z: 2.6, f: .6, cx: .44, cy: .52 }, gold: .6, cups: lit ? 'lit' : 'dark', res: .8 }); });

  const doneNames = $derived(v.slate.filter(id => v.done.has(id)).concat([...v.done].filter(id => !v.slate.includes(id)))
    .map(id => game.job(id)?.name ?? id));
  const reached = $derived(v.lastArrival && v.lastArrival.kind === 'place' && v.complete ? v.lastArrival : null);
  const line = $derived(v.night?.beat ? beatOf(s, v.night.beat)?.line ?? '' : '');

  function shift(min: number) {
    const [h, m] = draft.split(':').map(Number);
    const x = ((h * 60 + m + min) % 1440 + 1440) % 1440;
    draft = `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
  }
  function set() { game.do({ do: 'bedtime', time: draft }); changing = false; }
  function goodnight() { game.do({ do: 'goodnight' }); }
</script>

<div class="stage" aria-hidden="true"><div class="paint" bind:this={hallEl}></div></div>
<div class="fog" aria-hidden="true"><i class="drift-a"></i><i class="drift-b"></i></div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="scrim-top" aria-hidden="true"></div>
<div class="scrim-bottom" aria-hidden="true"></div>

<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span>
      <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
    </div>
    <h1 class="carve lg rise">{hall.name}</h1>
    <p class="say on-scene rise d1">{t('camp.where')}</p>
    <p class="soft on-scene rise d1 held">
      {doneNames.length ? t('camp.today', { jobs: doneNames.join(' · ') }) : t('camp.nothing')}
      {#if reached}{t('today.reached', { place: inSentence(reached.name) })}{/if}
    </p>
  </header>

  <div class="mid"></div>

  <section class="bottom col rise d2">
    {#if v.night}
      <div class="night">
        <h2 class="say-lg">{t('camp.night')}</h2>
        {#if line}<p class="say camp-line">{line}</p>{/if}
        <p class="soft">{t('camp.sleep')}</p>
        <div class="btn-row after"><button class="btn-quiet" onclick={() => go('today')}><span>{t('delve.today')}</span></button></div>
      </div>
    {:else}
      <div class="bed">
        <div class="label-line">{t('camp.bedtime')}</div>
        {#if changing}
          <div class="time-row">
            <button class="btn-quiet step" onclick={() => shift(-15)} aria-label={t('camp.earlier')}><span>−</span></button>
            <span class="time carve">{draft}</span>
            <button class="btn-quiet step" onclick={() => shift(15)} aria-label={t('camp.later')}><span>+</span></button>
            <button class="text-link" onclick={set}><span>{t('camp.set')}</span></button>
          </div>
        {:else}
          <div class="time-row">
            <span class="time carve">{v.bedtime}</span>
            <button class="text-link" onclick={() => { draft = v.bedtime; changing = true; }}><span>{t('camp.change')}</span></button>
          </div>
        {/if}
        <p class="soft promise">{t('camp.promise')}</p>
      </div>
      <button class="btn gold resting" onclick={goodnight}>{t('camp.goodnight')}</button>
      <div class="gap"></div>
    {/if}
  </section>
</div>

<style>
  .stage { position: absolute; inset: 0; }
  .stage .paint { position: absolute; inset: 0; }
  .scrim-top { height: 290px; }
  .scrim-bottom { height: 48%; }
  h1 { margin-top: 4px; }
  .top .say { margin-top: 8px; font-size: 18px; }
  .held { margin-top: 8px; text-align: left; }
  .bed { margin-bottom: 18px; }
  .time-row { display: flex; align-items: baseline; gap: 14px; margin-top: 6px; }
  .time { font-size: 34px; letter-spacing: .06em; color: #fff; }
  .step { min-width: 48px; }
  .step span { font-size: 22px; }
  .promise { text-align: left; margin-top: 6px; }
  .night h2 { margin-bottom: 10px; }
  .camp-line { font-style: italic; color: #fff; margin-bottom: 10px; line-height: 1.45; }
  .after { margin-top: 14px; }
  .gap { height: 12px; }
  button.home { color: var(--ink-2); }
</style>
