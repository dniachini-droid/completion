<script lang="ts">
  /* The morning after a kept bedtime (CORE_LOOPS → evening close): something small waiting at camp. A morning the story
     wrote settles the guesses it confirms (D-070) and points back to a record that now reads further; otherwise, a find.
     Looked at once, then Today. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { beatOf, recordOf } from '../core/story';
  import Scene from './Scene.svelte';
  import Settled from './Settled.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const s = content.story;
  const m = game.view.morning;
  const v = $derived(game.view);
  const find = m?.find ? s.finds.find(f => f.id === m.find)?.line ?? '' : '';
  /* a later week's morning the story wrote a line for (week 1's morning beat is the opening screen, not this one) */
  const said = m?.beat ? (b => b && b.kind === 'morning' && b.w > 1 ? b.line ?? '' : '')(beatOf(s, m.beat)) : '';
  /* the newest record that carries a mark Dan has guessed: it reads differently this morning */
  const record = m?.beat ? [...game.view.story.records].reverse().find(id => recordOf(s, id)?.cut?.some(l => l.some(tk => 's' in tk && typeof tk.s === 'string' && game.view.story.guessed.has(tk.s)))) ?? null : null;

  $effect(() => { if (!m) go('today'); });
  /* a look at the record isn't leaving: back returns here (N bug 2); only going on to Today marks it seen */
  function leave(to: 'today' | 'records') {
    if (to === 'records' && record) { go('records', record); return; }
    if (m) game.do({ do: 'seen', what: 'morning', ref: m.seq });
    go('today');
  }
</script>

<Scene painting={v.here.painting} top="280px" bottom="52%" />
<div class="ui">
  <header class="topbar col rise">
    <button class="home" onclick={() => leave('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
    <span></span><span></span>
  </header>
  <section class="col head rise d1">
    <div class="label-line gold">{t('morning.label')}</div>
    <h1 class="say-lg">{t('morning.title')}</h1>
  </section>
  <div class="mid"></div>
  <section class="bottom col center rise d2">
    {#if game.facts.some(f => f.type === 'stepsGained' && f.job === 'sleep' && f.day === v.day)}<p class="say">{t('morning.headStart')}</p>{/if}
    {#if said}<p class="say look">{said}</p>{/if}
    {#if m?.beat}<Settled beat={m.beat} />{/if}
    {#if find}
      <div class="label-line centred">{t('find.label')}</div>
      <p class="say look">{find}</p>
    {/if}
    {#if record}<button class="text-link" onclick={() => leave('records')}><span>{t('morning.read')}</span></button>{/if}
    <button class="btn resting go" onclick={() => leave('today')}>{t('morning.go')}</button>
  </section>
</div>

<style>
  .head { margin-top: 14px; }
  .head h1 { margin-top: 10px; }
  .look { color: var(--gold-hi); margin: 8px auto 12px; max-width: 34ch; }
  .go { margin-top: 18px; }
  button.home { color: var(--ink-2); }
</style>
