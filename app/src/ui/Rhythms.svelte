<script lang="ts">
  /* What repeats (PLANNER.md → Rhythms; mock-up rhythms.html). Dan's own rhythms, preloaded and all his to change: what,
     how often (N a week, set days, every 2 weeks), how long each time, enough at (as delves), a time (an appointment),
     every job a delve (D-117). One number is enough; no ranges. Stop repeating ends future sessions only; no confirmation. */
  import { game } from './game.svelte';
  import { t, minutesWords, byWords } from '../content/copy/en';
  import { addDays } from '../core/week';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import type { Job, Rhythm } from '../core/types';
  import Remind from './Remind.svelte';
  import { dateTarget, reminderOf, rhythmTarget, type Lead } from '../core/reminders';

  /* `job`: opened straight on that job's editor (from the Week, D-112); leaving it goes back there */
  let { go, job: jobArg }: { go: Go; job?: string } = $props();
  const v = $derived(game.view);
  const LEN = [5, 10, 15, 25, 30, 45, 60, 90, 120, 180, 240];   /* down to 5 min (D-110) */
  const DAYS = [1, 2, 3, 4, 5, 6, 0];

  interface Draft { id: string | null; job: Job; often: 'once' | 'week' | 'days' | 'fort' | 'month' | 'year' | 'every'; times: number;
    mode: 'date' | 'nth'; mday: number; nth: 1 | 2 | 3 | 4 | -1; wday: number; ydate: string; every: number; days: number[]; len: number; enough: number | null; time: string | null; delve: boolean; remind: Lead | null;
    avoided: boolean; step: string; note: string; isNew: boolean; by: string | null; dremind: 0 | 1440 | null; }
  let d = $state<Draft | null>(null);
  /* a job just removed, for its Undo (D-112) */
  let removed = $state<{ job: Job; rhythm: Rhythm | null } | null>(null);
  /* the one-offs (Dan's own and the starting set's), not yet finished: every job can be reached and changed (D-117) */
  const others = $derived(v.content.jobs.filter(j => !j.stopped && !v.content.rhythms.some(r => r.job === j.id)
    && !game.facts.some(f => f.type === 'jobDone' && f.job === j.id && f.day !== v.day)));

  function often(r: Rhythm) {
    if (r.monthly) return 'day' in r.monthly ? t('rhythms.monthDay', { n: dayOrd(r.monthly.day) }) : t('rhythms.monthNth', { nth: t(`rhythms.nth.${r.monthly.nth}` as never), day: t(`day.${r.monthly.weekday}` as never) });
    if (r.yearly) return t('rhythms.yearly', { date: yearWords(r.yearly) });
    if (r.everyDays) return t('rhythms.everyN', { n: r.everyDays });
    return r.days ? r.days.map(x => t(`days.plural.${x}` as never)).join(', ') : r.every === 2 ? t('rhythms.every2') : t('rhythms.nWeek', { n: r.times ?? 1 });
  }
  /* "the 1st", "the 31st" (a 31st is the last day of a shorter month) */
  const dayOrd = (n: number) => n >= 31 ? t('rhythms.lastDay') : `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
  const yearWords = (md: string) => new Date(`2000-${md}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  function size(j: Job) {
    const len = minutesWords(j.length);
    return j.delve && j.enoughAt && j.enoughAt < j.length ? t('rhythms.enoughRoom', { enough: minutesWords(j.enoughAt), len }) : len;
  }
  function open(r: Rhythm | null) {
    if (r) { edit(game.job(r.job)!, r); return; }
    const j: Job = { id: `j-${Date.now().toString(36)}`, name: '', delve: true, length: 60, doneBy: 'enough' };
    d = { id: null, job: j, often: 'week', times: 2, days: [], len: 60, enough: null, time: null, delve: true, remind: null, avoided: false, step: '', note: '', isNew: true, by: null, dremind: null, ...kinds(null) };
  }
  /** The monthly, yearly and every-N-days settings of a rhythm, or their starting values (D-114). */
  function kinds(r: Rhythm | null) {
    const m = r?.monthly, today = v.day;
    return { mode: (m && 'nth' in m ? 'nth' : 'date') as 'date' | 'nth', mday: m && 'day' in m ? m.day : +today.slice(8, 10),
      nth: (m && 'nth' in m ? m.nth : 1) as 1 | 2 | 3 | 4 | -1, wday: m && 'weekday' in m ? m.weekday : 5,
      ydate: r?.yearly ?? today.slice(5, 10), every: r?.everyDays ?? 3 };
  }
  /** Any job's editor: its rhythm if it has one, else "Once" (D-112). */
  function edit(j: Job, r = v.content.rhythms.find(x => x.job === j.id) ?? null) {
    removed = null;
    d = { ...kinds(r), id: r?.id ?? null, job: { ...j }, often: !r ? 'once' : r.days ? 'days' : r.every === 2 ? 'fort' : r.monthly ? 'month' : r.yearly ? 'year' : r.everyDays ? 'every' : 'week', times: r?.times ?? 2, days: r?.days ?? [], len: j.length,
      enough: j.enoughAt ?? null, time: r?.time ?? null, delve: j.delve, remind: r ? reminderOf(game.facts, rhythmTarget(r.id)) : null,
      avoided: !!j.avoided, step: j.firstStep ?? '', note: j.note ?? '', isNew: false, by: j.by ?? null, dremind: reminderOf(game.facts, dateTarget(j.id)) as 0 | 1440 | null };
  }
  if (jobArg) { const j = game.job(jobArg); if (j) edit(j); }
  /** Leave the editor: back to the list, or to where it was opened from. */
  function close() { d = null; if (jobArg && !removed) go('back'); }
  const step = (xs: number[], x: number, k: number) => { const i = xs.findIndex(y => y >= x); return xs[Math.min(xs.length - 1, Math.max(0, (i < 0 ? xs.length - 1 : i) + k))]; };
  function shiftTime(min: number) {
    if (!d) return;
    const [h, m] = (d.time ?? '18:00').split(':').map(Number);
    const x = Math.min(23 * 60 + 45, Math.max(5 * 60, h * 60 + m + min));
    d.time = `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
  }
  function save() {
    if (!d || !d.job.name.trim() || (d.often === 'days' && !d.days.length)) return;
    const once = d.often === 'once';
    /* every job is a delve (D-117): a repeating one is done at its enough, a one-off when Dan says so after delving */
    const enough = !once && d.enough !== null && d.enough < d.len ? d.enough : undefined;
    const job: Job = { ...d.job, length: d.len, delve: true, doneBy: !once ? 'enough' : 'dan', ...(enough ? { enoughAt: enough } : {}),
      firstStep: d.step, note: d.note };
    if (!enough) delete job.enoughAt;
    if (d.avoided) job.avoided = true; else delete job.avoided;
    /* a date only for a one-off or a line (D-114) */
    if (once && d.by) job.by = d.by; else delete job.by;
    const rhythm: Rhythm | null = once ? null : { id: d.id ?? `r-${Date.now().toString(36)}`, job: job.id,
      ...(d.often === 'week' ? { times: d.times } : d.often === 'days' ? { days: [...d.days].sort() } : d.often === 'fort' ? { every: 2 as const }
        : d.often === 'month' ? { monthly: d.mode === 'date' ? { day: d.mday } : { nth: d.nth, weekday: d.wday } }
        : d.often === 'year' ? { yearly: d.ydate } : { everyDays: d.every }), ...(d.time ? { time: d.time } : {}) };
    game.do({ do: 'saveJob', job, rhythm });
    /* "Remind me" (D-107) is kept with the rhythm; it alerts only while the rhythm has a time */
    if (rhythm && d.remind !== (d.id ? reminderOf(game.facts, rhythmTarget(rhythm.id)) : null)) game.do({ do: 'remind', target: rhythmTarget(rhythm.id), lead: d.remind });
    /* a date's reminder: the morning of it, or the day before (D-114) */
    const dr = job.by ? d.dremind : null;
    if (dr !== reminderOf(game.facts, dateTarget(job.id))) game.do({ do: 'remind', target: dateTarget(job.id), lead: dr });
    close();
  }
  /* Remove: gone from every list at once, with an Undo; no confirmation (D-112) */
  function remove() {
    if (!d || d.isNew) return;
    const job = game.job(d.job.id);
    if (!job) return;
    removed = { job: { ...job }, rhythm: v.content.rhythms.find(x => x.job === job.id) ?? null };
    game.do({ do: 'removeJob', id: job.id });
    d = null;
  }
  function undo() { if (removed) { game.do({ do: 'saveJob', job: removed.job, rhythm: removed.rhythm }); removed = null; if (jobArg) go('back'); } }
  function toggleDay(x: number) { if (d) d.days = d.days.includes(x) ? d.days.filter(y => y !== x) : [...d.days, x]; }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => (d ? close() : go('back'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{d && !jobArg ? t('rhythms.label') : back.label}</span></button>
      <span></span><span></span>
    </div>
    <!-- editing: the arrow says where it goes (What repeats), the title what this is (review 2) -->
    {#if !d && jobArg && removed}
      <h1 class="carve lg rise">{removed.job.name}</h1>
    {:else}
      <h1 class="carve lg rise">{d ? t(d.id || !d.isNew ? 'rhythms.editing' : 'rhythms.adding') : t('rhythms.label')}</h1>
      {#if !d}<p class="soft say-note rise">{t('rhythms.say')}</p>{/if}
    {/if}
  </header>

  <div class="body col rise d1">
    {#if !d}
      {#if removed}
        <!-- a job removed: one quiet line, and Undo (D-112); opened on that one job, also the way back -->
        <p class="said">{jobArg ? t('job.gone') : t('job.removed', { name: removed.job.name })}</p>
        <div class="links undo"><button class="text-link" onclick={undo}><span>{t('job.undo')}</span></button>
          {#if jobArg}<button class="text-link" onclick={() => go('back')}><span>{t('job.back', { to: back.label })}</span></button>{/if}</div>
      {/if}
      {#if !(jobArg && removed)}
      {#each v.content.rhythms as r (r.id)}
        {@const j = game.job(r.job)}
        {#if j}
          <button class="row" onclick={() => open(r)}>
            <span class="pip"></span>
            <span class="t">{j.name}<small>{often(r)} · {size(j)}</small></span>
            <span class="s">{r.time ?? ''}</span>
          </button>
        {/if}
      {/each}
      {#if others.length}
        <div class="label-line others">{t('job.others')}</div>
        {#each others as j (j.id)}
          <button class="row" onclick={() => edit(j)}>
            <span class="pip"></span>
            <span class="t">{j.name}<small>{j.by ? byWords(j.by) : t('job.onceUntil')} · {size(j)}</small></span>
            <span class="s"></span>
          </button>
          {#if j.by && j.by < v.day}
            <!-- a date passed: one question, no red, no count (D-038, D-114) -->
            <div class="passed"><span>{t('by.passed')}</span>
              <button class="text-link small" onclick={() => { const job = { ...j }; delete job.by; game.do({ do: 'saveJob', job, rhythm: null }); }}><span>{t('by.still')}</span></button>
              <button class="text-link small" onclick={() => edit(j)}><span>{t('by.new')}</span></button>
              <button class="text-link small" onclick={() => game.do({ do: 'removeJob', id: j.id })}><span>{t('by.letGo')}</span></button></div>
          {/if}
        {/each}
      {/if}
      <!-- the week is the arrow at the top: no second link to it (it said "Plan my week" and planned nothing; review 2) -->
      <div class="links"><button class="text-link" onclick={() => open(null)}><span>{t('rhythms.add')}</span></button></div>
      {/if}
    {:else}
      <div class="editor">
        <div class="label-line">{t('rhythms.name')}</div>
        <input class="line" bind:value={d.job.name} maxlength="60" aria-label={t('rhythms.name')} />

        <div class="label-line">{t('rhythms.often')}</div>
        <div class="seg often" role="group" aria-label={t('rhythms.often')}>
          <button aria-pressed={d.often === 'once'} onclick={() => (d!.often = 'once')}>{t('job.once')}</button>
          <button aria-pressed={d.often === 'week'} onclick={() => (d!.often = 'week')}>{t('rhythms.aWeek')}</button>
          <button aria-pressed={d.often === 'days'} onclick={() => (d!.often = 'days')}>{t('rhythms.setDays')}</button>
          <button aria-pressed={d.often === 'fort'} onclick={() => (d!.often = 'fort')}>{t('rhythms.fortnight')}</button>
        </div>
        <!-- the longer ones (D-114): rent on the 1st, a birthday, the haircut every few weeks -->
        <div class="seg often more" role="group" aria-label={t('rhythms.often')}>
          <button aria-pressed={d.often === 'month'} onclick={() => (d!.often = 'month')}>{t('rhythms.monthly')}</button>
          <button aria-pressed={d.often === 'year'} onclick={() => (d!.often = 'year')}>{t('rhythms.yearlyShort')}</button>
          <button aria-pressed={d.often === 'every'} onclick={() => (d!.often = 'every')}>{t('rhythms.everyShort')}</button>
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
        {:else if d.often === 'fort'}
          <p class="soft val-note">{t('rhythms.every2long')}</p>
        {:else if d.often === 'month'}
          <div class="seg" role="group" aria-label={t('rhythms.monthly')}>
            <button aria-pressed={d.mode === 'date'} onclick={() => (d!.mode = 'date')}>{t('rhythms.onADate')}</button>
            <button aria-pressed={d.mode === 'nth'} onclick={() => (d!.mode = 'nth')}>{t('rhythms.onAWeekday')}</button>
          </div>
          {#if d.mode === 'date'}
            <div class="stepper">
              <button class="btn-quiet step" disabled={d.mday <= 1} onclick={() => (d!.mday -= 1)} aria-label={t('rhythms.less')}><span>−</span></button>
              <span class="val">{t('rhythms.monthDay', { n: dayOrd(d.mday) })}</span>
              <button class="btn-quiet step" disabled={d.mday >= 31} onclick={() => (d!.mday += 1)} aria-label={t('rhythms.more')}><span>+</span></button>
            </div>
          {:else}
            <div class="seg days" role="group" aria-label={t('rhythms.onAWeekday')}>
              {#each [1, 2, 3, 4, -1] as x (x)}<button aria-pressed={d.nth === x} onclick={() => (d!.nth = x as 1)}>{t(`rhythms.nth.${x}` as never)}</button>{/each}
            </div>
            <div class="seg days" role="group" aria-label={t('rhythms.onAWeekday')}>
              {#each DAYS as x (x)}<button aria-pressed={d.wday === x} onclick={() => (d!.wday = x)}>{t(`days.short.${x}` as never)}</button>{/each}
            </div>
          {/if}
          <p class="soft val-note">{often({ id: '', job: '', monthly: d.mode === 'date' ? { day: d.mday } : { nth: d.nth, weekday: d.wday } })}</p>
        {:else if d.often === 'year'}
          <div class="stepper">
            <input class="clock val carve" type="date" value={`2026-${d.ydate}`} aria-label={t('rhythms.yearlyShort')}
              onchange={e => { const x = e.currentTarget.value; if (x) d!.ydate = x.slice(5, 10); }} />
          </div>
          <p class="soft val-note">{t('rhythms.yearly', { date: yearWords(d.ydate) })}</p>
        {:else if d.often === 'every'}
          <div class="stepper">
            <button class="btn-quiet step" disabled={d.every <= 2} onclick={() => (d!.every -= 1)} aria-label={t('rhythms.less')}><span>−</span></button>
            <span class="val">{t('rhythms.everyN', { n: d.every })}</span>
            <button class="btn-quiet step" disabled={d.every >= 90} onclick={() => (d!.every += 1)} aria-label={t('rhythms.more')}><span>+</span></button>
          </div>
          <p class="soft val-note">{t('rhythms.everySay')}</p>
        {:else}
          <p class="soft val-note">{t('job.onceSay')}</p>
        {/if}

        <div class="label-line">{t('rhythms.each')}</div>
        <div class="stepper">
          <button class="btn-quiet step" disabled={d.len <= LEN[0]} onclick={() => (d!.len = step(LEN, d!.len, -1))} aria-label={t('rhythms.shorter')}><span>−</span></button>
          <span class="val">{minutesWords(d.len)}</span>
          <button class="btn-quiet step" disabled={d.len >= LEN[LEN.length - 1]} onclick={() => (d!.len = step(LEN, d!.len, 1))} aria-label={t('rhythms.longer')}><span>+</span></button>
        </div>

        {#if d.often !== 'once'}
          <div class="label-line">{t('rhythms.enough')}</div>
          <div class="stepper">
            <button class="btn-quiet step" disabled={(d.enough ?? d.len) <= LEN[0]} onclick={() => (d!.enough = step(LEN.filter(x => x <= d!.len), d!.enough ?? d!.len, -1))} aria-label={t('rhythms.less')}><span>−</span></button>
            <span class="val">{d.enough === null || d.enough >= d.len ? t('rhythms.all') : minutesWords(d.enough)}</span>
            <button class="btn-quiet step" disabled={d.enough === null || d.enough >= d.len} onclick={() => { const x = step(LEN, d!.enough ?? d!.len, 1); d!.enough = x >= d!.len ? null : x; }} aria-label={t('rhythms.more')}><span>+</span></button>
          </div>
        {/if}

        <!-- a one-off's time is set where it sits in the Week -->
        {#if d.often !== 'once'}
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
          <Remind lead={d.remind} pick={x => (d!.remind = x)} />
        {/if}
        {/if}

        {#if d.often === 'once'}
          <!-- by a date (D-114): the plan works back from it; no red, no count -->
          <div class="label-line">{t('by.label')}</div>
          <div class="seg" role="group" aria-label={t('by.label')}>
            <button aria-pressed={d.by === null} onclick={() => (d!.by = null)}>{t('by.none')}</button>
            <button aria-pressed={d.by !== null} onclick={() => (d!.by ??= addDays(v.day, 7))}>{t('by.set')}</button>
          </div>
          {#if d.by !== null}
            <div class="stepper">
              <input class="clock val carve" type="date" value={d.by} min={v.day} aria-label={t('by.label')}
                onchange={e => { const x = e.currentTarget.value; if (x) d!.by = x; }} />
            </div>
            <p class="soft val-note">{byWords(d.by)}</p>
            <div class="label-line">{t('remind.label')}</div>
            <div class="seg" role="group" aria-label={t('remind.label')}>
              <button aria-pressed={d.dremind === null} onclick={() => (d!.dremind = null)}>{t('remind.off')}</button>
              <button aria-pressed={d.dremind === 0} onclick={() => (d!.dremind = 0)}>{t('remind.date.day')}</button>
              <button aria-pressed={d.dremind === 1440} onclick={() => (d!.dremind = 1440)}>{t('remind.date.before')}</button>
            </div>
          {/if}
        {/if}

        <!-- "I tend to put this off" (D-030, P5): an avoided job is offered early, and brings a find when done -->
        <div class="label-line">{t('job.avoided')}</div>
        <div class="seg" role="group" aria-label={t('job.avoided')}>
          <button aria-pressed={d.avoided} onclick={() => (d!.avoided = true)}>{t('job.yes')}</button>
          <button aria-pressed={!d.avoided} onclick={() => (d!.avoided = false)}>{t('job.no')}</button>
        </div>

        <!-- the first small step, for "I can't start" (TOOLS.md); a new job asks for it, and it may stay empty -->
        <div class="label-line">{t('job.step')}</div>
        <input class="line" bind:value={d.step} maxlength="160" placeholder={t('job.stepHint')} aria-label={t('job.step')} />
        <div class="label-line">{t('job.note')}</div>
        <input class="line" bind:value={d.note} maxlength="160" placeholder={t('job.noteHint')} aria-label={t('job.note')} />

        {#if d.often !== 'once'}<p class="soft val-note">{t('rhythms.newNumber')}</p>{/if}
        <div class="btn-row lead"><button class="btn" onclick={save}>{t('rhythms.save')}</button><button class="btn-quiet" onclick={close}><span>{t('rhythms.cancel')}</span></button></div>
        {#if !d.isNew}<div class="links"><button class="text-link" onclick={remove}><span>{t('job.remove')}</span></button></div>{/if}
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
  /* four choices of how often on one line, even on a small phone (D-112) */
  .editor .seg.often button { letter-spacing: .03em; font-size: 12px; padding-left: 2px; padding-right: 2px; }
  .editor .seg.often.more { margin-top: 4px; }
  .others { margin-top: 18px; }
  .passed { display: flex; flex-wrap: wrap; align-items: center; gap: 0 12px; padding: 2px 0 8px 22px; font-style: italic; font-size: 15px; color: var(--ink-2); }
  .said { margin: 8px 0 0; color: var(--ink-2); font-style: italic; }
  .links.undo { margin: 4px 0 14px; }
  .stepper input.val { flex: 1; }
  .days button { padding-left: 0; padding-right: 0; font-size: 14px; letter-spacing: .02em; min-width: 0; }
  .seg.days { grid-auto-columns: minmax(0, 1fr); gap: 4px; }
  .stepper { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border: 1px solid var(--edge-2); background: rgba(10,9,24,.55); }
  .stepper .val { color: #fff; font-size: 17px; }
  .step { min-width: 52px; }
  .step span { font-size: 20px; }
  .val-note { text-align: left; margin-top: 10px; }
  input.line { width: 100%; margin-top: 6px; padding: 10px 12px; font: inherit; font-size: 17px; color: #fff; background: rgba(255,255,255,.06); border: 1px solid var(--edge-2); border-radius: 0; }
  button.home { color: var(--ink-2); white-space: nowrap; }
</style>
