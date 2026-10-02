<script lang="ts">
  /* "Waiting on…" (D-137): who or what, if Dan likes ("the vet"), and the day it comes back: in 3 days with one tap, or
     another day on the app's one calendar. Used in the job menu and for "Still waiting" on Today. */
  import DayPick from './DayPick.svelte';
  import { t, dayShort } from '../content/copy/en';
  import { addDays } from '../core/week';
  import { WAIT_DAYS, WHO_MAX } from '../core/game';
  import { untrack } from 'svelte';

  let { day, who = '', name, pick }: { day: string; who?: string; name: string; pick: (until: string, who: string) => void } = $props();
  let line = $state(untrack(() => who));
  let other = $state(false);
  const soon = $derived(addDays(day, WAIT_DAYS));
</script>

<div class="wait">
  <form onsubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement | null)?.blur(); }}>
    <input bind:value={line} maxlength={WHO_MAX} enterkeyhint="done" aria-label={t('wait.who.label', { job: name })} placeholder={t('wait.who')} />
  </form>
  <button class="btn-quiet wait-soon" onclick={() => pick(soon, line)}><span>{t('wait.until', { day: dayShort(soon) })}</span></button>
  <button class="text-link other" aria-expanded={other} onclick={() => (other = !other)}><span>{t('wait.another')}</span></button>
  {#if other}<DayPick from={addDays(day, 1)} label={t('wait.another')} pick={d => pick(d, line)} />{/if}
</div>

<style>
  .wait { display: flex; flex-direction: column; gap: 8px; margin: 6px 0 8px; }
  input { width: 100%; min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: calc(17px * var(--ts, 1)); color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .wait-soon { width: 100%; min-height: 44px; padding: 0 8px; }
  .other { align-self: center; min-height: 44px; min-width: 44px; }
  .other span { font-size: calc(16px * var(--ts, 1)); }
</style>
