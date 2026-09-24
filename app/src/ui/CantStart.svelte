<script lang="ts">
  /* "I can't start" (TOOLS.md; CONCEPT §2 → stuck): a line from just ahead, one tiny physical step, then "10 minutes?".
     Never a demand; never new story (P4, D-038). */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { platform } from '../platform';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go, jobId }: { go: Go; jobId: string } = $props();
  const v = $derived(game.view);
  const job = $derived(game.job(jobId)!);
  const teaser = game.view.teaser ?? t('cant.fallback');

  function ten() {
    platform.sound.unlock();
    game.do({ do: 'startRun', job: jobId, minutes: 10, count: 1 });
    go('delve');
  }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span><span></span>
    </div>
  </header>
  <div class="mid col center tease">
    <div class="label-line centred rise">{t('cant.label')}</div>
    <p class="say-lg rise d1">{teaser}</p>
  </div>
  <section class="bottom col center">
    <p class="soft rise d2">{t('cant.first')}</p>
    <p class="say step rise d2">{job.firstStep ?? job.name}</p>
    <div class="rise d3">
      <button class="btn" onclick={ten}>{t('cant.ten')}</button>
      <div class="later"><button class="text-link" onclick={() => go('today')}><span>{t('cant.notNow')}</span></button></div>
    </div>
  </section>
</div>

<style>
  .tease { display: flex; flex-direction: column; justify-content: center; gap: 18px; }
  .tease .say-lg { font-size: 25px; line-height: 1.25; }
  .step { font-size: 20px; margin: 6px 0 24px; }
  .later { display: flex; justify-content: center; margin-top: 8px; }
  button.home { color: var(--ink-2); }
</style>
