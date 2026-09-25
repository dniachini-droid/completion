<script lang="ts">
  /* Back after days away (CORE_LOOPS → absence; D-043 F9): "where you were": the last place, the sealed thing in view,
     the last record, and the one open question for the story week. No counts, no summary of what was missed. The day is
     suggested Low; one small real job picks the route up. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const w = game.view.welcome;
  const q = w?.question ? content.story.openQuestions.find(x => x.id === w.question)?.line ?? '' : '';
  const view = $derived(v.ahead);

  $effect(() => { if (!w) go('today'); });
  function leave(to: 'today' | 'records') {
    if (w) game.do({ do: 'seen', what: 'welcome', ref: w.seq });
    if (to === 'records' && w?.record) go('records', w.record); else go('today');
  }
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
</script>

<Scene painting={v.here.painting} top="300px" bottom="56%" />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <span></span><span></span>
      <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
    </div>
    <div class="label-line lit rise welcome">{t('welcome.label')}</div>
    <h1 class="carve lg rise">{v.here.name}</h1>
    {#if view}<p class="say on-scene rise d1">{cap(view)}</p>{/if}
  </header>
  <div class="mid"></div>
  <section class="bottom col rise d2">
    {#if q}<p class="say question">{q}</p>{/if}
    <p class="soft">{t('welcome.say')}</p>
    {#if w?.record}<div class="center"><button class="text-link" onclick={() => leave('records')}><span>{t('welcome.record')}</span></button></div>{/if}
    <button class="btn" onclick={() => leave('today')}>{t('welcome.go')}</button>
    <div class="gap"></div>
  </section>
</div>

<style>
  h1 { margin-top: 10px; }
  .top .say { margin-top: 10px; }
  .question { font-style: italic; color: #fff; line-height: 1.45; margin-bottom: 12px; }
  .bottom .soft { margin-bottom: 10px; text-align: left; }
  .center { display: flex; justify-content: center; margin-bottom: 8px; }
  .gap { height: 12px; }
</style>
