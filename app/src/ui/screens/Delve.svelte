<script lang="ts">
  // Phase 8 trial delve: a plain ring over the dimmed hall (a placeholder for delve.html's tunnel and ring, D-036).
  // Everything shown is worked out from the start time and the clock, every second and on every return to the app.
  import { onMount } from 'svelte';
  import { t } from '../../content/copy';
  import { delveNow, minutesLeft, type Delve } from '../../core/delve';
  import { platform } from '../../platform';
  import { bloom } from '../bloom';
  import Scene from '../layers/Scene.svelte';
  import { clearDelve, DELVE_ALERT_ID } from '../trial-state';

  let { delve, onleave }: { delve: Delve; onleave: () => void } = $props();

  let now = $state(platform.now());
  const dv = $derived(delveNow(delve, now));
  const left = $derived(minutesLeft(dv));
  let celebrated = false;

  $effect(() => {
    if (dv.ended && !celebrated) { celebrated = true; platform.haptics.success(); }
  });

  onMount(() => {
    const tick = () => { now = platform.now(); };
    const id = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  });

  async function leave(stepAway: boolean) {
    platform.haptics.tap();
    if (stepAway) await platform.notifications.cancel(DELVE_ALERT_ID);
    await clearDelve();
    onleave();
  }

  const R = 110, C = 2 * Math.PI * R;
</script>

<Scene src="./paint/hall-early.jpg" dim={dv.ended ? 0.35 : 0.55} gold={dv.ended} />
<div class="ui">
  <header class="top col center">
    <div class="label-line centred rise">{t('delve.towards')}</div>
    <h1 class="carve lg rise d1">{t('delve.place')}</h1>
  </header>
  <div class="mid ringwrap">
    <svg class="ring" class:ended={dv.ended} viewBox="0 0 260 260" role="img" aria-label={dv.ended ? t('delve.ended') : t('delve.left', { n: left })}>
      <defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter></defs>
      <circle cx="130" cy="130" r={R} class="track" />
      <circle cx="130" cy="130" r={R} class="fill blur" filter="url(#glow)" style:stroke-dashoffset={C * (1 - dv.fraction)} stroke-dasharray={C} />
      <circle cx="130" cy="130" r={R} class="fill" style:stroke-dashoffset={C * (1 - dv.fraction)} stroke-dasharray={C} />
      {#if !dv.ended}
        <text x="130" y="138" class="time">{left}</text>
        <text x="130" y="168" class="unit">{left === 1 ? t('delve.unitOne') : t('delve.unit')}</text>
      {/if}
    </svg>
  </div>
  <section class="bottom col center">
    {#if dv.ended}
      <p class="say-lg">{t('delve.ended')}</p>
      <p class="soft">{t('delve.ended.soft')}</p>
      <button class="btn gold" use:bloom onclick={() => leave(false)}>{t('delve.back')}</button>
    {:else}
      <p class="soft">{t('delve.lock')}</p>
      <button class="btn-quiet full" use:bloom onclick={() => leave(true)}>{t('delve.stepAway')}</button>
    {/if}
  </section>
</div>

<style>
  .ringwrap { display: flex; align-items: center; justify-content: center; }
  .ring { width: min(270px, 70vw, 38vh); height: auto; transform: rotate(-90deg); overflow: visible; }
  .ring text { transform: rotate(90deg); transform-origin: 130px 130px; text-anchor: middle; }
  .track { fill: none; stroke: rgba(190, 196, 255, .15); stroke-width: 3; }
  .fill { fill: none; stroke: #d6deff; stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .fill.blur { stroke: var(--violet); stroke-width: 12; opacity: .8; }
  .ring.ended .fill { stroke: var(--gold-hi); }
  .ring.ended .fill.blur { stroke: var(--gold); }
  .time { font-family: var(--life); font-weight: 400; font-size: 64px; fill: #f6f7ff; font-variant-numeric: tabular-nums; }
  .unit { font-family: var(--life); font-style: italic; font-size: 16px; fill: var(--ink-2); }
  .bottom .say-lg { margin-bottom: 6px; }
  .bottom .soft { margin-bottom: 18px; }
</style>
