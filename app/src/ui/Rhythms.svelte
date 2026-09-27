<script lang="ts">
  /* What repeats (PLANNER.md → Rhythms; mock-up rhythms.html). Dan's own rhythms, preloaded and all his to change: what,
     how often (N a week, set days, every 2 weeks), how long each time, enough at (as delves), a time (an appointment),
     delves or no timer. One number is enough; no ranges. Stop repeating ends future sessions only; no confirmation. */
  import { game } from './game.svelte';
  import { t, minutesWords } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import type { Job, Rhythm } from '../core/types';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const LEN = [5, 10, 15, 25, 30, 45, 60, 90, 120, 180, 240];   /* down to 5 min (D-110) */
  const DAYS = [1, 2, 3, 4, 5, 6, 0];

  interface Draft { id: string | null; job: Job; often: 'week' | 'days' | 'fort'; times: number; days: number[]; len: number; enough: number | null; time: string | null; delve: boolean; }
  let d = $state<Draft | null>(null);

  function often(r: Rhythm) { return r.days ? r.days.map(x => t(`days.plural.${x}` as never)).join(', ') : r.every === 2 ? t('rhythms.every2') : t('rhythms.nWeek', { n: r.times ?? 1 }); }
  function size(j: Job) {
    const len = minutesWords(j.length);
    return j.delve && j.enoughAt && j.enoughAt < j.length ? t('rhythms.enoughRoom', { enough: minutesWords(j.enoughAt), len }) : len;
  }
  function open(r: Rhythm | null) {
    const j = r ? game.job(r.job)! : { id: `j-${Date.now().toString(36)}`, name: '', delve: false, length: 60, doneBy: 'dan' as const };
    d = { id: r?.id ?? null, job: j, often: r?.days ? 'days' : r?.every === 2 ? 'fort' : 'week', times: r?.times ?? 2, days: r?.days ?? [], len: j.length,
      enough: j.enoughAt ?? null, time: r?.time ?? null, delve: j.delve };
  }
  const step = (xs: number[], x: number, k: number) => { const i = xs.findIndex(y => y >= x); return xs[Math.min(xs.length - 1, Math.max(0, (i < 0 ? xs.length - 1 : i) + k))]; };
  function shiftTime(min: number) {
    if (!d) return;
    const [h, m] = (d.time ?? '18:00').split(':').map(Number);
    const x = Math.min(23 * 60 + 45, Math.max(5 * 60, h * 60 + m + min));
    d.time = `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
  }
  function save() {
    if (!d || !d.job.name.trim() || (d.often === 'days' && !d.days.length)) return;
    const enough = d.delve && d.enough !== null && d.enough < d.len ? d.enough : undefined;
    const job: Job = { ...d.job, length: d.len, delve: d.delve, doneBy: d.delve ? 'enough' : 'dan', ...(enough ? { enoughAt: enough } : {}) };
    if (!enough) delete job.enoughAt;
    const rhythm: Rhythm = { id: d.id ?? `r-${Date.now().toString(36)}`, job: job.id,
      ...(d.often === 'week' ? { times: d.times } : d.often === 'days' ? { days: [...d.days].sort() } : { every: 2 as const }), ...(d.time ? { time: d.time } : {}) };
    game.do({ do: 'saveRhythm', rhythm, job });
    d = null;
  }
  function stop() { if (d?.id) game.do({ do: 'stopRhythm', id: d.id }); d = null; }
  function toggleDay(x: number) { if (d) d.days = d.days.includes(x) ? d.days.filter(y => y !== x) : [...d.days, x]; }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => (d ? (d = null) : go('back'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{d ? t('rhythms.label') : back.label}</span></button>
      <span></span><span></span>
    </div>
    <!-- editing: the arrow says where it goes (What repeats), the title what this is (review 2) -->
    <h1 class="carve lg rise">{d ? t(d.id ? 'rhythms.editing' : 'rhythms.adding') : t('rhythms.label')}</h1>
    {#if !d}<p class="soft say-note rise">{t('rhythms.say')}</p>{/if}
  </header>

  <div class="body col rise d1">
    {#if !d}
      {#each v.content.rhythms as r (r.id)}
        {@const j = game.job(r.job)}
        {#if j}
          <button class="row" onclick={() => open(r)}>
            <span class="pip"></span>
            <span class="t">{j.name}<small>{often(r)} · {size(j)}{j.delve ? ' · ' + t('rhythms.asDelves') : ''}</small></span>
            <span class="s">{r.time ?? ''}</span>
          </button>
        {/if}
      {/each}
      <!-- the week is the arrow at the top: no second link to it (it said "Plan my week" and planned nothing; review 2) -->
      <div class="links"><button class="text-link" onclick={() => open(null)}><span>{t('rhythms.add')}</span></button></div>
    {:else}
      <div class="editor">
        <div class="label-line">{t('rhythms.name')}</div>
        <input class="line" bind:value={d.job.name} maxlength="60" />

        <div class="label-line">{t('rhythms.often')}</div>
        <div class="seg" role="group" aria-label={t('rhythms.often')}>
          <button aria-pressed={d.often === 'week'} onclick={() => (d!.often = 'week')}>{t('rhythms.aWeek')}</button>
          <button aria-pressed={d.often === 'days'} onclick={() => (d!.often = 'days')}>{t('rhythms.setDays')}</button>
          <button aria-pressed={d.often === 'fort'} onclick={() => (d!.often = 'fort')}>{t('rhythms.fortnight')}</button>
        </div>
        {#if d.often === 'week'}
          <div class="stepper">
            <button class="btn-quiet step" disabled={d.times <= 1} onclick={() => (d!.times = Math.max(1, d!.times - 1))} aria-label={t('rhythms.less')}><span>−</span></button>
            <span class="val">{d.times === 1 ? t('rhythms.onceWeek') : t('rhythms.timesWeek', { n: d.times })}</span>
            <button class="btn-quiet step" disabled={d.times >= 7} onclick={() => (d!.times = Math.min(7, d!.times + 1))} aria-label={t('rhythms.more')}><span>+</span></button>
          </div>
        {:else if d.often === 'days'}
          <div class="seg days" role="group" aria-label={t('rhythms.setDays')}>
            {#each DAYS as x (x)}<button aria-pressed={d.days.includes(x)} onclick={() => toggleDay(x)}>{t(`days.short.${x}` as never)}</button>{/each}
          </div>
        {:else}
          <p class="soft val-note">{t('rhythms.every2long')}</p>
        {/if}

        <div class="label-line">{t('rhythms.each')}</div>
        <div class="stepper">
          <button class="btn-quiet step" disabled={d.len <= LEN[0]} onclick={() => (d!.len = step(LEN, d!.len, -1))} aria-label={t('rhythms.shorter')}><span>−</span></button>
          <span class="val">{minutesWords(d.len)}</span>
          <button class="btn-quiet step" disabled={d.len >= LEN[LEN.length - 1]} onclick={() => (d!.len = step(LEN, d!.len, 1))} aria-label={t('rhythms.longer')}><span>+</span></button>
        </div>

        <div class="label-line">{t('rhythms.runs')}</div>
        <div class="seg" role="group" aria-label={t('rhythms.runs')}>
          <button aria-pressed={d.delve} onclick={() => (d!.delve = true)}>{t('rhythms.delves')}</button>
          <button aria-pressed={!d.delve} onclick={() => (d!.delve = false)}>{t('rhythms.noTimer')}</button>
        </div>
        {#if d.delve}
          <div class="label-line">{t('rhythms.enough')}</div>
          <div class="stepper">
            <button class="btn-quiet step" disabled={(d.enough ?? d.len) <= LEN[0]} onclick={() => (d!.enough = step(LEN.filter(x => x <= d!.len), d!.enough ?? d!.len, -1))} aria-label={t('rhythms.less')}><span>−</span></button>
            <span class="val">{d.enough === null || d.enough >= d.len ? t('rhythms.all') : minutesWords(d.enough)}</span>
            <button class="btn-quiet step" disabled={d.enough === null || d.enough >= d.len} onclick={() => { const x = step(LEN, d!.enough ?? d!.len, 1); d!.enough = x >= d!.len ? null : x; }} aria-label={t('rhythms.more')}><span>+</span></button>
          </div>
        {/if}

        <div class="label-line">{t('week.time')}</div>
        <div class="seg" role="group" aria-label={t('week.time')}>
          <button aria-pressed={d.time === null} onclick={() => (d!.time = null)}>{t('week.anyTime')}</button>
          <button aria-pressed={d.time !== null} onclick={() => (d!.time ??= '18:00')}>{t('week.setTime')}</button>
        </div>
        {#if d.time !== null}
          <div class="stepper">
            <button class="btn-quiet step" onclick={() => shiftTime(-15)} aria-label={t('camp.earlier')}><span>−</span></button>
            <input class="clock val carve" type="time" step="900" value={d.time} aria-label={t('week.time')}
              onchange={e => (d!.time = e.currentTarget.value || d!.time)} />
            <button class="btn-quiet step" onclick={() => shiftTime(15)} aria-label={t('camp.later')}><span>+</span></button>
          </div>
        {/if}

        <p class="soft val-note">{t('rhythms.newNumber')}</p>
        <div class="btn-row lead"><button class="btn" onclick={save}>{t('rhythms.save')}</button><button class="btn-quiet" onclick={() => (d = null)}><span>{t('rhythms.cancel')}</span></button></div>
        {#if d.id}<div class="links"><button class="text-link" onclick={stop}><span>{t('rhythms.stop')}</span></button></div>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  .say-note { margin-top: 4px; text-align: left; }
  button.row { width: 100%; text-align: left; }
  .row small { display: block; font-size: 14px; color: var(--ink-2); margin-top: 2px; }
  .links { display: flex; justify-content: center; gap: 18px; margin-top: 16px; }
  .editor .label-line { margin-top: 14px; }
  .editor .seg { margin-top: 6px; }
  /* three choices on one line, even on a small phone (review 2) */
  .editor .seg:not(.days) button { letter-spacing: .08em; padding-left: 4px; padding-right: 4px; white-space: nowrap; }
  .stepper input.val { flex: 1; }
  .days button { padding-left: 0; padding-right: 0; font-size: 13px; }
  .stepper { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border: 1px solid var(--edge-2); background: rgba(10,9,24,.55); }
  .stepper .val { color: #fff; font-size: 17px; }
  .step { min-width: 52px; }
  .step span { font-size: 20px; }
  .val-note { text-align: left; margin-top: 10px; }
  input.line { width: 100%; margin-top: 6px; padding: 10px 12px; font: inherit; font-size: 17px; color: #fff; background: rgba(255,255,255,.06); border: 1px solid var(--edge-2); border-radius: 0; }
  button.home { color: var(--ink-2); white-space: nowrap; }
</style>
