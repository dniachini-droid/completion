<script lang="ts">
  import Prose from './Prose.svelte';
  /* The morning after a kept bedtime (CORE_LOOPS → evening close): something small waiting at camp. A morning the story
     wrote settles the guesses it confirms (D-070) and points back to a record that now reads further; otherwise, a find.
     Looked at once, then Today. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { beatOf, morningRecord, recordOf } from '../core/story';
  import { firstChosen } from '../core/game';
  import Scene from './Scene.svelte';
  import Settled from './Settled.svelte';
  import Reread from './Reread.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const s = content.story;
  const m = game.whole.morning;
  const v = $derived(game.whole);
  const find = m?.find ? s.finds.find(f => f.id === m.find)?.line ?? '' : '';
  /* a later week's morning the story wrote a line for (week 1's morning beat is the opening screen, not this one) */
  const said = m?.beat ? (b => b && b.kind === 'morning' && b.w > 1 ? b.line ?? '' : '')(beatOf(s, m.beat)) : '';
  /* the record this morning was written to point back to, if Dan has it (deep review S#13); else the newest record that
     carries a mark Dan has guessed: it reads differently this morning */
  const record = m?.beat ? morningRecord(s, m.beat, game.whole.story.records) ?? [...game.whole.story.records].reverse().find(id => recordOf(s, id)?.cut?.some(l => l.some(tk => 's' in tk && typeof tk.s === 'string' && game.whole.story.guessed.has(tk.s)))) ?? null : null;

  $effect(() => { if (!m) go('today'); });
  /* a look at the record isn't leaving: back returns here (N bug 2); only going on to Today marks it seen */
  /* last night's own choice of what to start with: the morning's button starts it (MORNING-REPORT Part 3 #5) */
  const chosen = $derived(((id: string | null) => id && !v.done.has(id) && !v.run ? game.job(id) ?? null : null)(firstChosen(game.facts, v.day)));
  function leave(to: 'today' | 'records' | 'set') {
    if (to === 'records' && record) { go('records', record); return; }
    if (m) game.do({ do: 'seen', what: 'morning', ref: m.seq });
    /* through Today, so the set-up's arrow says Today: the morning, once seen, is never on the way back (B7) */
    go('today'); if (to === 'set' && chosen) go('set', chosen.id);
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
    {#if said}<p class="say look"><Prose text={said} /></p>{/if}
    {#if m?.beat}<Settled beat={m.beat} /><Reread beat={m.beat} {go} />{/if}
    {#if find}
      <div class="label-line centred">{t('find.label')}</div>
      <p class="say look"><Prose text={find} /></p>
    {/if}
    {#if record}<button class="text-link" onclick={() => leave('records')}><span>{t('morning.read')}</span></button>{/if}
    {#if chosen}<button class="btn resting go" onclick={() => leave('set')}>{t('morning.startWith', { job: chosen.name })}</button>
    {:else}<button class="btn resting go" onclick={() => leave('today')}>{t('morning.go')}</button>{/if}
  </section>
</div>

<style>
  .head { margin-top: 14px; }
  .head h1 { margin-top: 10px; }
  .look { color: var(--gold-hi); margin: 8px auto 12px; max-width: 34ch; }
  .go { margin-top: 18px; }
  button.home { color: var(--ink-2); }
</style>
