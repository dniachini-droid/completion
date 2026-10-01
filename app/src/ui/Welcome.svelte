<script lang="ts">
  import Deleted from './Deleted.svelte';
  /* Back after days away (CORE_LOOPS → absence; D-043 F9): "where you were": the last place, the sealed thing in view,
     the last record, and the one open question for the story week. No counts, no summary of what was missed. The day is
     suggested Low; one small real job picks the route up. */
  import { game, content } from './game.svelte';
  import { t, byWords, dayName } from '../content/copy/en';
  import { slipped, type Slip } from '../core/week';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const w = game.view.welcome;
  const q = w?.question ? content.story.openQuestions.find(x => x.id === w.question)?.line ?? '' : '';
  const view = $derived(v.ahead);
  /* a thing that ends with its own mark keeps it, with no full stop after it (review of D-144) */
  const stop = (x: string) => x.replace(/([.!?…])\s*\.$/, '$1');

  $effect(() => { if (!w) go('today'); });
  /* what slipped (D-114): a date that passed, one question; and every appointment of his own that went by, in one list
     (Dan, deep review Part 2 #5: one vanished with no question). Never a count */
  const since = (game.facts.find(f => f.seq === w?.seq) as { since?: string } | undefined)?.since ?? v.day;
  const slips = slipped(v.content, game.facts, since, v.day);
  const slip = slips.find(x => x.kind === 'date') ?? null;
  const appts = slips.filter(x => x.kind === 'appt');
  let answered = $state<string[]>([]);
  const nameOf = (s: Slip) => game.job(s.job)?.name ?? '';
  const slipName = $derived(slip ? nameOf(slip) : '');
  const apptsLeft = $derived(appts.filter(x => nameOf(x) && !answered.includes(x.job)));
  function still(s: Slip) {
    const j = game.job(s.job);
    if (s.kind === 'date' && j) { const job = { ...j }; delete job.by; game.do({ do: 'saveJob', job, rhythm: null }); }
    else game.do({ do: 'planJob', job: s.job, day: v.day });
    answered = [...answered, s.job];
  }
  function letGo(s: Slip) { game.remove(s.job); answered = [...answered, s.job]; }
  /* a look at the record isn't leaving: back returns here (S9); only going on to Today marks it seen */
  function leave(to: 'today' | 'records') {
    if (to === 'records' && w?.record) { go('records', w.record); return; }
    if (w) game.do({ do: 'seen', what: 'welcome', ref: w.seq });
    go('today');
  }
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
</script>

<Scene painting={v.here.painting} top="300px" bottom="56%" />
<div class="ui">
  <header class="top col">
    <!-- an arrow, as every screen has (N polish) -->
    <div class="topbar rise">
      <button class="home" onclick={() => leave('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span>
      <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
    </div>
    <div class="label-line lit rise welcome">{t('welcome.label')}</div>
    <h1 class="carve lg rise">{v.here.name}</h1>
    <!-- the locked thing in view, said as what it is (S9): ahead of him, or left behind him -->
    {#if view}<p class="say on-scene rise d1">{stop(v.aheadBehind ? `${t('today.behind')}: ${view}.` : t('welcome.ahead', { thing: view }))}</p>{/if}
  </header>
  <div class="mid"></div>
  <section class="bottom col rise d2">
    {#if q}<p class="say question">{q}</p>{/if}
    <p class="soft">{t('welcome.say')}</p>
    {#if slip && slipName && !answered.includes(slip.job)}
      <p class="say slip">{t('slip.date', { job: slipName, date: byWords(slip.day) })}</p>
      <div class="center links">
        <button class="text-link" onclick={() => still(slip)}><span>{t('by.still')}</span></button>
        <button class="text-link" onclick={() => go('rhythms', slip.job)}><span>{t('by.new')}</span></button>
        <button class="text-link" onclick={() => letGo(slip)}><span>{t('by.letGo')}</span></button>
      </div>
    {/if}
    {#if apptsLeft.length}
      <div class="label-line">{t('slip.wentBy')}</div>
      <ul class="appts">
        {#each apptsLeft as a (a.job)}
          <li>
            <p class="say slip">{t('slip.apptRow', { job: nameOf(a), day: dayName(a.day), time: a.time ?? '' })}</p>
            <div class="links"><button class="text-link" onclick={() => still(a)}><span>{t('slip.today')}</span></button><button class="text-link" onclick={() => letGo(a)}><span>{t('by.letGo')}</span></button></div>
          </li>
        {/each}
      </ul>
    {/if}
    <Deleted />
    {#if w?.record}<div class="center"><button class="text-link" onclick={() => leave('records')}><span>{t('welcome.record')}</span></button></div>{/if}
    <button class="btn" onclick={() => leave('today')}>{t('welcome.go')}</button>
    <div class="gap"></div>
  </section>
</div>

<style>
  button.home { color: var(--ink-2); }
  h1 { margin-top: 10px; }
  .top .say { margin-top: 10px; }
  .question { font-style: italic; color: #fff; line-height: 1.45; margin-bottom: 12px; }
  .bottom .soft { margin-bottom: 10px; text-align: left; }
  .center { display: flex; justify-content: center; margin-bottom: 8px; }
  .gap { height: 12px; }
  .slip { font-style: italic; margin-bottom: 4px; line-height: 1.4; }
  .links { display: flex; gap: 14px; flex-wrap: wrap; }
  .appts { list-style: none; margin: 4px 0 10px; padding: 0; }
  .appts li { margin-bottom: 6px; }
</style>
