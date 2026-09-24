<script lang="ts">
  /* The week (PLANNER.md, locked D-048; mock-up week.html). On request only, never the opening screen. One row per day,
     each day's jobs in plain words with a time where one is set; no hour grid, no tray of unplaced jobs. "Plan my week"
     lays it out; a tap moves a job, gives it a time, or takes it off this week. The past shows only what was done. The
     forecast is one line in the world's terms: predictive, never contractual. Nothing here earns anything. */
  import { game } from './game.svelte';
  import { t, dayName, minutesWords, weekDates } from '../content/copy/en';
  import { calendarWeek } from '../core/time';
  import { addDays, planMade, weekOf, type DayJob } from '../core/week';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go, week }: { go: Go; week?: string } = $props();
  const v = $derived(game.view);
  const thisWeek = $derived(calendarWeek(v.day));
  const wk = $derived(week && week > thisWeek ? week : thisWeek);
  const isNext = $derived(wk !== thisWeek);
  const view = $derived(weekOf(v.content, game.facts, wk, v.day));

  let open = $state<string | null>(null);
  let draftDay = $state(''), draftTime = $state<string | null>(null);
  let adding = $state(false), line = $state(''), addDay = $state('');

  function note(j: DayJob): string {
    if (j.done) return t('row.done');
    if (j.time) return j.time;
    const job = game.job(j.job);
    if (!job) return '';
    if (job.item) return t('row.oneOff');
    const r = v.content.rhythms.find(x => x.job === job.id);
    if (!r && job.avoided) return t('row.oneOff');
    if (job.delve && job.enoughAt && job.enoughAt < job.length) return t('row.room', { enough: minutesWords(job.enoughAt), len: minutesWords(job.length) });
    return minutesWords(job.length);
  }
  const forecast = $derived.by(() => {
    if (isNext || !v.forecast.length) return '';
    const parts = [t('week.forecast.one', { day: dayName(v.forecast[0]) })];
    if (v.forecast[1] && v.forecast[1] !== v.forecast[0]) parts.push(t('week.forecast.then', { day: dayName(v.forecast[1]) }));
    return t('week.forecast', { what: parts.join(', ') });
  });
  const days = $derived(view.days.map(d => d.day).filter(d => d >= v.day));

  function edit(j: DayJob, day: string) {
    if (j.done || !j.entry || day < v.day) return;
    if (open === j.entry) { open = null; return; }
    open = j.entry; draftDay = day; draftTime = j.time ?? null;
  }
  function shift(min: number) {
    const [h, m] = (draftTime ?? '18:00').split(':').map(Number);
    const x = Math.min(23 * 60 + 45, Math.max(5 * 60, h * 60 + m + min));
    draftTime = `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
  }
  function save(j: DayJob) { game.do({ do: 'movePlan', entry: j.entry!, day: draftDay, time: draftTime }); open = null; }
  function off(j: DayJob) { game.do({ do: 'movePlan', entry: j.entry!, day: null }); open = null; }
  function plan() { game.do({ do: 'planWeek', week: wk }); }
  function add() {
    if (!line.trim()) return;
    game.do({ do: 'addToWeek', line, day: addDay || days[0] });
    line = ''; adding = false;
  }
  const short = (d: string) => t(`days.short.${new Date(`${d}T00:00:00Z`).getUTCDay()}` as never);
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span>
      <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
    </div>
    <h1 class="carve lg rise">{isNext ? t('week.next') : t('week.label')}</h1>
    <p class="soft dates rise">{weekDates(wk)}</p>
    {#if forecast}<p class="say forecast rise d1">{forecast}</p>{/if}
  </header>

  <div class="body col rise d1">
    {#if !planMade(game.facts, wk)}
      <div class="none">
        {#if !view.planned}<h2 class="say-lg">{t('week.none')}</h2>{/if}
        <p class="soft">{t('week.none.say')}</p>
        <div class="btn-row lead"><button class="btn" onclick={plan}>{t('week.plan')}</button><button class="btn-quiet" onclick={() => go('today')}><span>{t('week.notNow')}</span></button></div>
      </div>
    {/if}
    {#each view.days as d (d.day)}
      {#if view.planned || d.jobs.length}
        <div class="day" class:past={d.day < v.day} class:today={d.day === v.day}>
          <div class="dname">{dayName(d.day)}{#if d.day === v.day}<em>{t('week.today')}</em>{/if}</div>
          {#if !d.jobs.length}<div class="nothing">{t('week.empty')}</div>{/if}
          {#each d.jobs as j (j.entry ?? j.job + j.done)}
            <button class="row" class:done={j.done} onclick={() => edit(j, d.day)} disabled={j.done || d.day < v.day}>
              <span class="pip" class:done={j.done}></span><span class="t">{game.job(j.job)?.name ?? j.job}</span><span class="s">{note(j)}</span>
            </button>
            {#if open && open === j.entry}
              <div class="sheet">
                <div class="label-line">{t('week.day')}</div>
                <div class="seg days" role="group" aria-label={t('week.day')}>
                  {#each days as x (x)}<button aria-pressed={draftDay === x} onclick={() => (draftDay = x)}>{short(x)}</button>{/each}
                </div>
                <div class="label-line">{t('week.time')}</div>
                <div class="seg" role="group" aria-label={t('week.time')}>
                  <button aria-pressed={draftTime === null} onclick={() => (draftTime = null)}>{t('week.anyTime')}</button>
                  <button aria-pressed={draftTime !== null} onclick={() => (draftTime ??= '18:00')}>{t('week.setTime')}</button>
                </div>
                {#if draftTime !== null}
                  <div class="time-row">
                    <button class="btn-quiet step" onclick={() => shift(-15)} aria-label={t('camp.earlier')}><span>−</span></button>
                    <span class="time carve">{draftTime}</span>
                    <button class="btn-quiet step" onclick={() => shift(15)} aria-label={t('camp.later')}><span>+</span></button>
                  </div>
                {/if}
                <div class="btn-row"><button class="btn" onclick={() => save(j)}>{t('week.done')}</button><button class="btn-quiet" onclick={() => off(j)}><span>{t('week.off')}</span></button></div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    {/each}

    {#if adding}
      <div class="sheet add">
        <div class="label-line">{t('week.addLine')}</div>
        <input class="line" bind:value={line} placeholder={t('week.addPlaceholder')} maxlength="120" onkeydown={e => e.key === 'Enter' && add()} />
        <div class="seg days" role="group" aria-label={t('week.day')}>
          {#each days as x (x)}<button aria-pressed={(addDay || days[0]) === x} onclick={() => (addDay = x)}>{short(x)}</button>{/each}
        </div>
        <div class="btn-row"><button class="btn" onclick={add}>{t('week.add')}</button><button class="btn-quiet" onclick={() => (adding = false)}><span>{t('rhythms.cancel')}</span></button></div>
      </div>
    {/if}

    <div class="links">
      {#if days.length && !adding}<button class="text-link" onclick={() => (adding = true)}><span>{t('week.add')}</span></button>{/if}
      <button class="text-link" onclick={() => go('rhythms')}><span>{t('week.rhythms')}</span></button>
      <button class="text-link" onclick={() => go('week', isNext ? thisWeek : addDays(thisWeek, 7))}><span>{isNext ? t('week.this') : t('week.next')}</span></button>
    </div>
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  .dates { margin-top: 2px; }
  .forecast { margin-top: 8px; font-size: 16.5px; line-height: 1.4; }
  .none { margin: 8px 0 12px; }
  .none .soft { margin: 6px 0 16px; text-align: left; }
  .day { margin-top: 12px; }
  .dname { font-family: var(--carve, inherit); font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-2); display: flex; gap: 10px; align-items: baseline; }
  .dname em { font-family: var(--life); text-transform: none; letter-spacing: 0; font-size: 15px; color: var(--gold); }
  .day.past .dname { color: var(--ink-3); }
  .nothing { color: var(--ink-3); padding: 4px 0 2px 18px; }
  button.row { width: 100%; text-align: left; }
  button.row:disabled { cursor: default; }
  .sheet { border: 1px solid var(--edge-2); background: rgba(10,9,24,.7); padding: 10px 14px 14px; margin: 6px 0 10px; }
  .sheet .label-line { margin-top: 8px; }
  .sheet .seg { margin-top: 6px; }
  .days button { padding-left: 0; padding-right: 0; font-size: 13px; }
  .time-row { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
  .time { font-size: 26px; color: #fff; }
  .step { min-width: 48px; }
  .step span { font-size: 20px; }
  .sheet .btn-row { margin-top: 12px; }
  input.line { width: 100%; margin-top: 8px; padding: 10px 12px; font: inherit; font-size: 17px; color: #fff; background: rgba(255,255,255,.06); border: 1px solid var(--edge-2); border-radius: 0; }
  .links { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px 18px; margin-top: 18px; }
  button.home { color: var(--ink-2); }
</style>
