<script lang="ts">
  /* Day complete and the arrival (INTERACTION_NOTES → day complete; mock-up complete.html). Violet turns to gold
     from the floor up; "That's the day. Enough." The day's success is locked in; rest is the main offer, and a quiet
     "Keep going" is always there (D-038, D-039). A tap anywhere settles the motion at once. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { platform } from '../platform';
  import Scene from './Scene.svelte';
  import Guess from './Guess.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const a = $derived(v.arrival ?? v.lastArrival);
  const fresh = !!game.view.arrival;
  let root: HTMLDivElement;

  $effect(() => { if (!a) go('today'); });

  function settleNow(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    root.getAnimations({ subtree: true }).forEach(x => { try { x.finish(); } catch { /* endless */ } });
  }
  /* a word is cut in four taps, one line each (the story job's §7); the scene's own line comes after the fourth */
  let tap = $state(0);
  const taps = $derived(a?.taps ?? []);
  const cutting = $derived(fresh && taps.length > 0 && tap < taps.length);
  const picked = $derived(a ? game.facts.find(f => f.type === 'choiceMade' && f.beat === a.id) : undefined);
  function next() { tap++; void platform.haptics.tick(); }

  function leave(to: 'today' | 'set') {
    if (v.arrival) {
      game.do({ do: 'seen', what: 'arrival', ref: v.arrival.seq });
      /* a big day reached more than one place: each plays in turn */
      const more = game.view.arrival;
      if (more && to === 'today') { go('arrival', more.seq); return; }
    }
    if (to === 'set') {
      const job = v.order.find(x => !v.done.has(x) && content.jobs.find(j => j.id === x)?.delve) ?? 'course';
      go('set', job);
    } else go('today');
  }
</script>

{#if a}
  <div class="arr" class:fresh bind:this={root} onpointerdown={settleNow} role="presentation">
    <Scene painting={a.painting} top="260px" bottom="34%" />
    <div class="facelight" aria-hidden="true"></div>
    <div class="ui">
      <header class="topbar col">
        <button class="home" onclick={() => leave('today')}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg><span>{t('delve.today')}</span></button>
        <span></span><span></span>
      </header>
      <section class="col head">
        <div class="label-line gold">{a.kind === 'place' ? t('arrive.label') : t('arrive.camp')}</div>
        <h1 class="carve lg">{a.name}</h1>
        {#if taps.length && (a.byKey || !cutting)}<span class="soft on-scene">{a.line}</span>{/if}
        {#if !taps.length}<span class="soft on-scene">{a.line}</span>{/if}
        {#if a.look}<span class="soft on-scene look">{a.look}</span>{/if}
      </section>
      <div class="mid col">
        {#if cutting}
          <div class="taps">
            {#each taps.slice(0, tap + 1) as line, i (i)}<p class="say on-scene tapline">{line}</p>{/each}
          </div>
        {:else}
          {#each a.guess as mark (mark)}<Guess {mark} />{/each}
          {#if a.choice && !picked && fresh}
            <div class="choice">
              {#each a.choice as c, i}<button class="text-link" onclick={() => game.do({ do: 'choose', beat: a.id, pick: i })}><span>{c}</span></button>{/each}
            </div>
          {/if}
          {#if a.completedDay}
            <p class="enough">{t('arrive.enough')} <em>{t('arrive.enough2')}</em></p>
          {/if}
        {/if}
      </div>
      {#if cutting}
        <section class="bottom col"><button class="btn" onclick={next}>{t('arrive.cut')}</button></section>
      {:else}
      <section class="bottom col">
        <button class="btn resting" onclick={() => leave('today')}>{a.completedDay ? t('arrive.rest') : t('arrive.onward')}</button>
        <div class="btn-row"><button class="btn-quiet" onclick={() => leave('set')}><span>{t('today.keepGoing')}</span></button></div>
      </section>
      {/if}
    </div>
  </div>
{/if}

<style>
  .arr { display: contents; }
  .facelight { position: absolute; inset: 0; z-index: 1; pointer-events: none; mix-blend-mode: screen;
    background: radial-gradient(90% 34% at 50% 68%, rgba(255,178,84,.3) 0%, rgba(250,160,60,.12) 55%, rgba(250,160,60,0) 100%), linear-gradient(0deg, rgba(200,110,30,.3) 0%, rgba(240,150,55,.18) 22%, rgba(250,170,70,.06) 40%, rgba(250,170,70,0) 52%); }
  .fresh :global(.pool), .fresh .facelight { opacity: 0; animation: gold 4.2s .6s ease-in-out forwards; }
  .fresh :global(.fog.warm) { opacity: 0; animation: gold 4.2s 1s ease-in-out forwards; }
  @keyframes gold { to { opacity: 1; } }
  .head { margin-top: 14px; animation: rise 1.4s .4s var(--ease) both; }
  .head .label-line { margin-bottom: 12px; }
  .head .soft { display: block; margin-top: 6px; }
  .head .look { color: var(--gold-hi); margin-top: 12px; }
  .taps { width: 100%; padding-bottom: 18px; }
  .tapline { text-align: center; font-size: 19px; line-height: 1.4; margin-top: 12px; animation: rise 1s var(--ease) both; }
  .choice { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; margin-bottom: 14px; }
  .topbar { animation: rise 1.2s .2s var(--ease) both; }
  .mid { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 18px; }
  .enough { font-family: var(--life); font-size: min(31px, 8vw); line-height: 1.15; color: #fff; text-align: center;
    text-shadow: 0 0 26px rgba(242,193,112,.45), 0 2px 18px rgba(8,6,20,.9); animation: rise 1.6s 2.2s var(--ease) both; }
  .enough em { display: inline-block; animation: rise 1.6s 3s var(--ease) both; }
  /* the way out is there early (by about 2.5 s), even while the scene is still turning gold */
  .bottom { animation: rise 1s 1.4s var(--ease) both; }
  .bottom .btn-row { margin-top: 16px; }
  button.home { color: var(--ink-2); }
</style>
