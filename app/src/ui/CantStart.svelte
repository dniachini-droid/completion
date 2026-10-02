<script lang="ts">
  /* "I can't start" (TOOLS.md; CONCEPT §2 → stuck): a line from just ahead, one tiny physical step, then "10 minutes?".
     Never a demand; never new story (P4, D-038). */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { platform } from '../platform';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';

  let { go, jobId }: { go: Go; jobId: string } = $props();
  const v = $derived(game.view);
  const job = $derived(game.job(jobId)!);
  const teaser = game.view.teaser ?? t('cant.fallback');

  /* the first step: where Dan stopped last time, else the job's own first step; with neither, it asks once and keeps
     the answer as the job's first step (D-112) */
  const first = $derived(job.note ?? job.firstStep ?? null);
  let answer = $state('');
  function keep() { if (answer.trim()) game.do({ do: 'firstStep', job: jobId, step: answer }); }
  function ten() {
    keep();
    platform.sound.unlock();
    game.do({ do: 'startRun', job: jobId, minutes: 10, count: 1 });
    /* only if it started (C#10): an end still to answer, or another delve, comes first */
    go(game.view.run ? 'delve' : 'today');
  }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
  </header>
  <div class="mid col center tease">
    <div class="label-line centred rise">{t('cant.label')}</div>
    <p class="say-lg rise d1">{teaser}</p>
  </div>
  <section class="bottom col center">
    {#if first}
      <p class="soft rise d2">{t('cant.first')}</p>
      <p class="say step rise d2">{first}</p>
    {:else}
      <p class="soft rise d2">{t('cant.ask')}</p>
      <input class="line ask rise d2" bind:value={answer} maxlength="160" aria-label={t('cant.ask')} enterkeyhint="done"
        onkeydown={e => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }} />
    {/if}
    <div class="rise d3">
      <button class="btn" onclick={ten}>{t('cant.ten')}</button>
      <div class="later"><button class="text-link" onclick={() => { keep(); go('back'); }}><span>{t('cant.notNow')}</span></button></div>
    </div>
  </section>
</div>

<style>
  .tease { display: flex; flex-direction: column; justify-content: center; gap: 18px; }
  .tease .say-lg { font-size: calc(25px * var(--ts, 1)); line-height: 1.25; }
  .step { font-size: calc(20px * var(--ts, 1)); margin: 6px 0 24px; }
  input.ask { width: 100%; margin: 8px 0 20px; padding: 10px 12px; font: inherit; font-size: calc(17px * var(--ts, 1)); color: #fff; background: rgba(255,255,255,.06);
    border: 1px solid var(--edge-2); border-radius: 0; }
  .later { display: flex; justify-content: center; margin-top: 8px; }
  button.home { color: var(--ink-2); }
</style>
