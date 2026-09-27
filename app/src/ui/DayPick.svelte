<script lang="ts">
  /* A day from today on, in the app's own small calendar: five weeks from this Monday (D-125, D-126). The phone's date
     picker closed itself on the iPhone; this one stays until a day is chosen. */
  import { t, dayName } from '../content/copy/en';
  import { addDays } from '../core/week';
  import { calendarWeek } from '../core/time';

  let { from, pick, label }: { from: string; pick: (day: string) => void; label: string } = $props();
  const days = $derived(Array.from({ length: 35 }, (_, i) => addDays(calendarWeek(from), i)));
  const monthOf = (d: string) => t(`month.${+d.slice(5, 7)}` as never);
</script>

<div class="cal" role="group" aria-label={label}>
  {#each [1, 2, 3, 4, 5, 6, 0] as w (w)}<span class="wd" aria-hidden="true">{t(`days.short.${w}` as never)}</span>{/each}
  {#each days as x (x)}
    {#if x < from}<span></span>
    {:else}
      <button class:today={x === from} aria-label={`${dayName(x)} ${+x.slice(8)} ${monthOf(x)}`} onclick={() => pick(x)}>
        <span>{+x.slice(8)}</span>{#if x === from || x.endsWith('-01')}<small>{x === from ? t('pick.today') : monthOf(x).slice(0, 3)}</small>{/if}
      </button>
    {/if}
  {/each}
</div>

<style>
  .cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; margin-top: 6px; }
  .wd { text-align: center; font-size: 14px; letter-spacing: .08em; color: var(--ink-3); }
  button { min-height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0;
    font: inherit; font-size: 17px; color: var(--ink); background: transparent; border: 1px solid var(--edge-2); cursor: pointer; }
  button.today { border-color: var(--edge-3); }
  small { font-size: 14px; line-height: 1; color: var(--ink-3); }
</style>
