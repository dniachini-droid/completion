<script lang="ts">
  /* The app's one calendar (D-125, D-126, D-130), a month at a time (Dan, D-131: at the end of a month the next one
     couldn't be reached). The month's name as its title, ‹ › to go back and forward (never before this month; at least a
     year ahead), past days not choosable, today marked, each day a 44-point target. It stays open until a day is chosen:
     the phone's date picker closed itself on the iPhone. Used everywhere a day is chosen: the Satchel's "Put on a day",
     the job menu, the Week's "Another day…", the job editor's "By a date". */
  import { t, dayName, type Weekday, type Month } from '../content/copy/en';
  import { addDays } from '../core/week';
  import { calendarWeek } from '../core/time';

  let { from, pick, label }: { from: string; pick: (day: string) => void; label: string } = $props();
  /** Months ahead that can be reached. */
  const AHEAD = 12;
  const first = (day: string) => `${day.slice(0, 7)}-01`;
  const shift = (month: string, k: number) => { const d = new Date(`${month}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + k); return d.toISOString().slice(0, 10); };
  const home = $derived(first(from));
  let offset = $state(0);
  const month = $derived(shift(home, offset));
  /* whole weeks, Monday first, from the week holding the 1st to the week holding the last day */
  const days = $derived.by(() => {
    const start = calendarWeek(month), last = addDays(shift(month, 1), -1), out: string[] = [];
    for (let d = start; d <= last || out.length % 7; d = addDays(d, 1)) out.push(d);
    return out;
  });
  const monthOf = (d: string) => t(`month.${+d.slice(5, 7) as Month}`);
  const title = $derived(`${monthOf(month)} ${month.slice(0, 4)}`);
</script>

<div class="cal" role="group" aria-label={label}>
  <div class="head">
    <button class="nav" aria-label={t('pick.prev')} disabled={offset <= 0} onclick={() => (offset = Math.max(0, offset - 1))}><span aria-hidden="true">‹</span></button>
    <span class="title" aria-live="polite">{title}</span>
    <button class="nav" aria-label={t('pick.next')} disabled={offset >= AHEAD} onclick={() => (offset = Math.min(AHEAD, offset + 1))}><span aria-hidden="true">›</span></button>
  </div>
  <div class="grid">
    {#each ([1, 2, 3, 4, 5, 6, 0] as Weekday[]) as w (w)}<span class="wd" aria-hidden="true">{t(`days.short.${w}`)}</span>{/each}
    {#each days as x (x)}
      {#if x.slice(0, 7) !== month.slice(0, 7)}<span></span>
      {:else if x < from}<span class="past" aria-hidden="true">{+x.slice(8)}</span>
      {:else}
        <button class:today={x === from} aria-label={`${dayName(x)} ${+x.slice(8)} ${monthOf(x)}${x === from ? `, ${t('pick.today')}` : ''}`} onclick={() => pick(x)}>
          <span>{+x.slice(8)}</span>{#if x === from}<small>{t('pick.today')}</small>{/if}
        </button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .cal { margin-top: 6px; }
  .head { display: flex; align-items: center; justify-content: space-between; }
  .title { font-family: var(--carve); font-size: calc(15px * var(--ts, 1)); letter-spacing: .12em; text-transform: uppercase; color: var(--ink); }
  .nav { min-width: 44px; min-height: 44px; display: grid; place-items: center; font-size: calc(26px * var(--ts, 1)); line-height: 1; color: var(--violet-hi); background: none; border: 0; cursor: pointer; }
  .nav:disabled { color: var(--ink-3); opacity: .35; cursor: default; }
  /* a thin gap, so each day stays a 44-point target at 360 wide (D-130) */
  .grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; margin-top: 2px; }
  .wd { text-align: center; font-size: calc(14px * var(--ts, 1)); letter-spacing: .08em; color: var(--ink-3); }
  .past { min-height: 44px; display: grid; place-items: center; font-size: calc(17px * var(--ts, 1)); color: var(--ink-3); opacity: .45; }
  button:not(.nav) { min-height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0;
    font: inherit; font-size: calc(17px * var(--ts, 1)); color: var(--ink); background: transparent; border: 1px solid var(--edge-2); cursor: pointer; }
  button.today { border-color: var(--gold); color: #fff; }
  small { font-size: calc(14px * var(--ts, 1)); line-height: 1; color: var(--gold); }
</style>
