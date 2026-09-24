<script lang="ts">
  /* The step, for a job done away from the phone (CONCEPT §2 → coming back): its minutes move Dan along the route,
     a line of the passage, then out. Settled within a moment; a tap is all it needs. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go, seq }: { go: Go; seq: number } = $props();
  const v = $derived(game.view);
  const fact = $derived(game.facts.find(f => f.seq === seq));
  const job = $derived(fact && fact.type === 'jobDone' ? content.jobs.find(j => j.id === fact.job) : undefined);
  const completedDay = $derived(game.facts.some(f => f.seq > seq && f.type === 'dayCompleted'));
  const gained = $derived(fact && fact.type === 'jobDone' ? fact.minutes : 0);

  /* the route: from where Dan was to where he is, towards the next place */
  const W = 300, y = 20;
  const target = $derived(v.ahead ? v.ahead.at : v.walked + 200);
  const from = $derived(Math.max(0, v.walked - gained));
  const startAt = $derived(v.ahead ? Math.max(0, v.ahead.at - 400) : from - 50);
  const px = (m: number) => 8 + (W - 16) * Math.min(1, Math.max(0, (m - startAt) / Math.max(1, target - startAt)));

  function leave() { go(completedDay && v.arrival ? 'arrival' : 'today'); }
</script>

<Scene painting={v.here.painting} />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span><span></span>
    </div>
  </header>
  <div class="mid"></div>
  <section class="bottom col center">
    <div class="label-line centred gold rise">{t('step.label')}</div>
    <h2 class="say-lg rise d1">{job ? t('step.done', { job: job.name }) : ''}</h2>
    <svg class="route rise d2" viewBox="0 0 {W} 44" aria-hidden="true">
      <path d="M8 {y}H{W - 8}" stroke="rgba(186,186,255,.22)" stroke-width="1" />
      <path d="M8 {y}H{px(from)}" stroke="rgba(242,193,112,.55)" stroke-width="1.5" />
      <path class="drawn" style="--len:{Math.max(1, px(v.walked) - px(from))}" d="M{px(from)} {y}H{px(v.walked)}" stroke="#f1efff" stroke-width="2" stroke-linecap="round" filter="drop-shadow(0 0 4px rgba(143,134,255,.95))" />
      {#if v.ahead}
        <g transform="translate({px(v.ahead.at)} {y})"><path d="M-6 8 V-1 Q-6 -8 0 -8 Q6 -8 6 -1 V8 Z" fill="#0b0b1c" /><path d="M-6 8 V-1 Q-6 -8 0 -8 Q6 -8 6 -1 V8" fill="none" stroke="#ece9ff" stroke-width="1.3" /></g>
      {/if}
      <circle cx={px(v.walked)} cy={y} r="3.4" fill="#ffd27a" />
    </svg>
    <p class="say on-scene rise d3">{v.passage}</p>
    <div class="go rise d3">
      {#if completedDay && v.arrival}
        <button class="btn" onclick={leave}>{t('delve.see')}</button>
      {:else}
        <button class="btn resting" onclick={leave}>{t('delve.toToday')}</button>
      {/if}
    </div>
  </section>
</div>

<style>
  .bottom h2 { margin-top: 10px; }
  .route { width: 100%; max-width: 300px; height: 44px; margin: 14px auto 4px; display: block; overflow: visible; }
  .go { margin-top: 20px; }
  button.home { color: var(--ink-2); }
</style>
