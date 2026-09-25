<script lang="ts">
  /* Camp and bedtime (CORE_LOOPS → evening close; mock-up camp.html). By the lamp in the hall: what today held, the
     bedtime Dan chose, and Goodnight. In bed by then, and something small is waiting in the morning; missing it removes
     nothing and is never mentioned (rule 9). Bedtime also sets tomorrow's suggested size. */
  import { onMount } from 'svelte';
  import { game, content } from './game.svelte';
  import { t, inSentence } from '../content/copy/en';
  import { beatOf } from '../core/story';
  import { BEDTIME_WINDOW, pastBedtime } from '../core/game';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import './scene/lamp.js';
  import './scene/hall.js';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const s = content.story;
  const hall = s.stretches.find(x => x.id === 'st-hall')!;
  const lit = game.view.story.played.has(s.words[0]?.beats[0] ?? '');
  let hallEl: HTMLDivElement;

  const Hall = (window as unknown as { Hall: { draw(el: HTMLElement, o: object): unknown } }).Hall;
  onMount(() => { Hall.draw(hallEl, { cam: { x: .6, y: 1.55, z: 2.6, f: .6, cx: .44, cy: .52 }, gold: .6, cups: lit ? 'lit' : 'dark', res: .8 }); });

  const doneNames = $derived(v.slate.filter(id => v.done.has(id)).concat([...v.done].filter(id => !v.slate.includes(id)))
    .map(id => game.job(id)?.name ?? id));
  const reached = $derived(v.lastArrival && v.lastArrival.kind === 'place' && v.complete ? v.lastArrival : null);
  const line = $derived(v.night?.beat ? beatOf(s, v.night.beat)?.line ?? '' : '');

  /* the bedtime is the phone's own time box: a tap opens its wheel, and what it's set to is kept (D-090) */
  function set(time: string) { if (time && time !== v.bedtime) game.do({ do: 'bedtime', time }); }
  function pick(e: MouseEvent) { try { (e.currentTarget as HTMLInputElement).showPicker?.(); } catch { /* not every browser */ } }
  function goodnight() { game.do({ do: 'goodnight' }); }
  /* Go to sleep is offered from five hours before bedtime; earlier in the day camp says when to come back (D-083) */
  const early = $derived(pastBedtime(v.bedtime, game.now) < -BEDTIME_WINDOW);
  const from = $derived.by(() => { const [h, m] = v.bedtime.split(':').map(Number), x = ((h * 60 + m - BEDTIME_WINDOW) % 1440 + 1440) % 1440;
    return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; });
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
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
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
        <p class="soft">{v.night.kept ? t('camp.sleep.kept') : t('camp.sleep.late', { bedtime: v.bedtime })}</p>
        <!-- nothing more to press: the phone goes down (Dan, D-083); the small Today link above is enough -->
      </div>
    {:else}
      <div class="bed">
        <div class="label-line">{t('camp.bedtime')}</div>
        <label class="time-row">
          <span class="time carve">{v.bedtime}</span><span class="change">{t('camp.change')}</span>
          <input type="time" step="900" value={v.bedtime} aria-label={t('camp.bedtime')} onclick={pick} onchange={e => set(e.currentTarget.value)} />
        </label>
        <p class="soft promise">{early ? t('camp.notYet', { from }) : t('camp.promise', { bedtime: v.bedtime })}</p>
      </div>
      {#if !early}<button class="btn gold resting" onclick={goodnight}>{t('camp.goodnight')}</button>{/if}
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
  .time-row { position: relative; display: flex; align-items: baseline; gap: 14px; margin-top: 6px; cursor: pointer; width: fit-content; }
  .time-row input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; border: 0; padding: 0; margin: 0; cursor: pointer; -webkit-appearance: none; appearance: none; }
  .change { font-family: var(--life); font-style: italic; font-size: 16px; color: var(--ink-2); border-bottom: 1px solid var(--edge-3); }
  .time { font-size: 34px; letter-spacing: .06em; color: #fff; }
  .promise { text-align: left; margin-top: 6px; }
  .night h2 { margin-bottom: 10px; }
  .camp-line { font-style: italic; color: #fff; margin-bottom: 10px; line-height: 1.45; }
  .after { margin-top: 14px; }
  .gap { height: 12px; }
  button.home { color: var(--ink-2); }
</style>
