<script lang="ts">
  /* A job ticked off without a delve (Dan, D-134): "How long did it take?", then those minutes move Dan and the job is
     done, with its story moment, on the step screen (its road line and count). Nothing counts until a time is chosen;
     Cancel or a tap outside leaves the job as it was. A job with delved minutes behind it says so, and "No more" counts
     those alone. Shown over the screen, in the job menu's look. */
  import { game } from './game.svelte';
  import { t, minutesWords } from '../content/copy/en';
  import { ticking, closeTick } from './menu.svelte';
  import { closeRows } from './SwipeRow.svelte';
  import { steady } from './taps';
  import { TICK_CHOICES, behindOf } from '../core/game';

  const j = $derived(ticking.job ? game.job(ticking.job) : undefined);
  const v = $derived(game.view);
  const behind = $derived(j ? behindOf(game.facts, v.content, j.id, v.day) : 0);
  /* the finger's lift from the tap that opened it is never a choice in it */
  const settling = () => performance.now() - ticking.at < 450;
  const label = (m: number) => m === 90 ? t('tick.halfHour') : m >= 60 ? t('tick.hour', { n: m / 60 }) : t('min.short', { n: m });

  function pick(minutes: number) {
    if (settling() || !j) return;
    const go = ticking.go, id = j.id;
    steady();
    const f = game.do({ do: 'tickOff', job: id, minutes });
    closeTick(); closeRows();
    const d = f.find(x => x.type === 'jobDone');
    if (d && go) go('step', d.seq);
  }
  function key(e: KeyboardEvent) { if (e.key === 'Escape') closeTick(); }
</script>

<svelte:window onkeydown={key} />
{#if j}
  <div class="scrim" role="presentation" onclick={() => { if (!settling()) closeTick(); }}></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label={t('tick.title')}>
    <p class="name">{j.name}</p>
    <h2>{t('tick.title')}</h2>
    {#if behind > 0}<p class="soft">{t('tick.onTop', { min: minutesWords(behind) })}</p>{/if}
    <!-- "No more" is an answer, not a length of time: on its own row (J20) -->
    {#if behind > 0}<button class="chip nomore" onclick={() => pick(0)}>{t('tick.noMore')}</button>{/if}
    <div class="grid">
      {#each TICK_CHOICES as m (m)}<button class="chip" onclick={() => pick(m)}>{label(m)}</button>{/each}
    </div>
    <button class="cancel" onclick={() => { if (!settling()) closeTick(); }}>{t('rhythms.cancel')}</button>
  </div>
{/if}

<style>
  .scrim { position: absolute; inset: 0; z-index: 30; background: rgba(4, 4, 12, .55); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
  .sheet { position: absolute; z-index: 31; left: 16px; right: 16px; bottom: calc(var(--safe-b, 0px) + 16px); max-height: calc(100% - 80px); overflow-y: auto;
    background: rgba(18, 16, 38, .96); border: 1px solid var(--edge-2); padding: 10px 16px 6px; text-align: center; animation: up .18s ease-out; }
  @keyframes up { from { transform: translateY(12px); opacity: 0; } }
  .name { margin: 4px 0 2px; font-family: var(--life); font-size: 15px; font-style: italic; color: var(--ink-2); overflow-wrap: anywhere; }
  h2 { margin: 4px 0 6px; font-family: var(--life); font-weight: 500; font-size: 22px; color: #fff; }
  .soft { margin: 0 0 8px; font-size: 16px; }
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 10px 0 8px; }
  .chip { min-height: 48px; font-family: var(--life); font-size: 17px; color: #fff; background: rgba(var(--violet-rgb), .16);
    border: 1px solid var(--edge-2); }
  .chip:active { background: rgba(var(--violet-rgb), .34); }
  .chip.nomore { display: block; width: 100%; margin: 6px 0 0; font-style: italic; background: rgba(255, 255, 255, .06); }
  .cancel { display: block; width: 100%; min-height: 48px; margin-top: 4px; font-family: var(--life); font-size: 18px; color: var(--ink-2); border-top: 1px solid var(--edge-4); }
  @media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }
</style>
