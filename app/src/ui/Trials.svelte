<script lang="ts">
  /* Phase 8, trials (b) and (c): the delve alert with the phone locked, and the feel.
     Throwaway screen on an invented sample place; not the game's Today screen. */
  import { onMount } from 'svelte';
  import { t } from '../content/copy/en';
  import { platform } from '../platform';
  import { delveDone, delveEndsAt, delveLeft, type Delve } from '../core/delve';
  import { live } from '../../paint/kit/live.js';
  import paintUrl from '../../paint/view/img/sample-well-stair.webp?url';
  import meta from '../../paint/view/img/sample-well-stair.json';

  const KEY = 'trial.delve', ALERT = 1;
  let delve: Delve | null = $state(null);
  let now = $state(Date.now());
  let denied = $state(false);
  let host: HTMLDivElement;

  const saved = platform.store.get(KEY);
  if (saved) { try { delve = JSON.parse(saved); } catch { platform.store.remove(KEY); } }

  const left = $derived(delve ? delveLeft(delve, now) : 0);
  const done = $derived(delve ? delveDone(delve, now) : 0);
  const over = $derived(!!delve && left === 0);
  const mmss = $derived(`${Math.floor(left / 60000)}:${String(Math.ceil((left % 60000) / 1000) % 60).padStart(2, '0')}`);
  const R = 92, C = 2 * Math.PI * R;

  async function begin() {
    await platform.haptics.tick();
    denied = !(await platform.notifier.permit());
    const d = { startedAt: platform.now().getTime(), minutes: 1 };
    await platform.notifier.cancel(ALERT);
    await platform.notifier.at(ALERT, new Date(delveEndsAt(d)), t('notify.delveEnd.title'), t('notify.delveEnd.body'));
    delve = d; platform.store.set(KEY, JSON.stringify(d));
  }
  function reset() { delve = null; platform.store.remove(KEY); platform.haptics.tick(); }

  onMount(() => {
    const img = host.querySelector('img')!;
    const start = () => live(host, meta);
    img.complete ? start() : img.addEventListener('load', start, { once: true });
    const iv = setInterval(() => (now = Date.now()), 250);
    const vis = () => (now = Date.now());
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', vis); };
  });
</script>

<div class="scene" bind:this={host}><img class="paint" src={paintUrl} alt="" /></div>
<div class="scrim-top"></div><div class="scrim-bottom"></div>

<main>
  <header>
    <div class="kicker">{t('trial.kicker')}</div>
    <h1>{t('trial.title')}</h1>
  </header>

  <section class="alert">
    <div class="label">{t('trial.alert.label')}</div>
    {#if delve && !over}
      <div class="ring">
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <circle cx="110" cy="110" r={R} class="track" />
          <circle cx="110" cy="110" r={R} class="fill" style="stroke-dasharray:{C};stroke-dashoffset:{C * (1 - done)}" />
        </svg>
        <div class="time"><span>{mmss}</span><small>{t('trial.alert.left')}</small></div>
      </div>
      <p>{t('trial.alert.running')}</p>
    {:else if over}
      <p>{t('trial.alert.done')}</p>
      <button class="main" onclick={begin}>{t('trial.alert.again')}</button>
      <button class="quiet" onclick={reset}>×</button>
    {:else}
      <p>{t('trial.alert.what')}</p>
      <button class="main" onclick={begin}>{t('trial.alert.begin')}</button>
    {/if}
    {#if denied}<p class="note">{t('trial.alert.denied')}</p>{/if}
  </section>

  <section class="feel">
    <div class="label">{t('trial.feel.label')}</div>
    <button class="box" onclick={() => platform.haptics.tick()}>{t('trial.feel.tap')}</button>
    <p class="note">{t('trial.feel.hint')}</p>
  </section>
</main>

<style>
  .scene { position: fixed; inset: 0; overflow: hidden; }
  .scene :global(img.paint) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .scrim-top { position: fixed; inset: 0 0 auto; height: 30%; background: linear-gradient(rgba(5,5,12,.75), rgba(5,5,12,0)); pointer-events: none; }
  .scrim-bottom { position: fixed; inset: auto 0 0; height: 55%; background: linear-gradient(rgba(5,5,12,0), rgba(5,5,12,.82) 55%); pointer-events: none; }
  main { position: fixed; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
    padding: calc(env(safe-area-inset-top) + 36px) var(--gutter) calc(env(safe-area-inset-bottom) + 24px); }
  .kicker, .label { font: 500 14px/1 Cinzel, serif; letter-spacing: .22em; text-transform: uppercase; color: var(--ink-2); display: flex; align-items: center; gap: 12px; }
  .kicker::after, .label::after { content: ''; flex: 1; height: 1px; background: var(--edge-3); }
  h1 { font: 500 30px/1.15 Cinzel, serif; letter-spacing: .12em; text-transform: uppercase; margin: 14px 0 0; text-shadow: 0 1px 14px rgba(5,5,12,.8); }
  section { display: flex; flex-direction: column; gap: 14px; }
  .alert { margin-top: auto; margin-bottom: 28px; align-items: stretch; }
  p { font: 400 17px/1.4 Spectral, serif; color: var(--ink-2); margin: 0; text-shadow: 0 1px 10px rgba(5,5,12,.9); }
  .note { font-style: italic; font-size: 16px; color: var(--ink-3); }
  .main { min-height: 56px; font: 500 16px/1 Cinzel, serif; letter-spacing: .18em; text-transform: uppercase; color: #0b0a1a;
    background: linear-gradient(180deg, #cfc9ff, var(--violet)); border: 1px solid var(--violet-hi);
    box-shadow: 0 0 24px rgba(143,134,255,.55), inset 0 0 18px rgba(255,255,255,.35); padding: 0 16px; }
  .main:active { transform: scale(.985); }
  .box { min-height: 52px; border: 1px solid var(--edge); font: 500 15px/1 Cinzel, serif; letter-spacing: .18em; text-transform: uppercase; background: rgba(5,5,12,.35); }
  .box:active { background: rgba(143,134,255,.18); }
  .quiet { align-self: center; min-width: 44px; min-height: 44px; color: var(--ink-3); font-size: 22px; }
  .ring { position: relative; width: 220px; height: 220px; align-self: center; }
  .ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .track { fill: none; stroke: rgba(217,214,255,.2); stroke-width: 1.5; }
  .fill { fill: none; stroke: var(--violet-hi); stroke-width: 4; stroke-linecap: round; filter: drop-shadow(0 0 8px rgba(143,134,255,.9)); transition: stroke-dashoffset .25s linear; }
  .time { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .time span { font: 400 58px/1 Spectral, serif; font-variant-numeric: tabular-nums; }
  .time small { font: italic 400 16px/1.2 Spectral, serif; color: var(--ink-2); margin-top: 8px; }
</style>
