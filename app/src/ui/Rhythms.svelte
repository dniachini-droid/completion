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
  import Remind from './Remind.svelte';
  import { reminderOf, rhythmTarget, type Lead } from '../core/reminders';

  /* `job`: opened straight on that job's editor (from the satchel or the Week, D-112); leaving it goes back there */
  let { go, job: jobArg }: { go: Go; job?: string } = $props();
  const v = $derived(game.view);
  const LEN = [5, 10, 15, 25, 30, 45, 60, 90, 120, 180, 240];   /* down to 5 min (D-110) */
  const DAYS = [1, 2, 3, 4, 5, 6, 0];

  interface Draft { id: string | null; job: Job; often: 'once' | 'week' | 'days' | 'fort'; times: number; days: number[]; len: number; enough: number | null; time: string | null; delve: boolean; remind: Lead | null;
    avoided: boolean; step: string; note: string; isNew: boolean; }
  let d = $state<Draft | null>(null);
  /* a job just removed, for its Undo (D-112) */
  let removed = $state<{ job: Job; rhythm: Rhythm | null } | null>(null);
  /* the one-offs (Dan's own and the starting set's), not lines of the satchel: every job can be reached and changed */
  const others = $derived(v.content.jobs.filter(j => !j.item && !j.stopped && !v.content.rhythms.some(r => r.job === j.id)));

  function often(r: Rhythm) { return r.days ? r.days.map(x => t(`days.plural.${x}` as never)).join(', ') : r.every === 2 ? t('rhythms.every2') : t('rhythms.nWeek', { n: r.times ?? 1 }); }
  function size(j: Job) {
    const len = minutesWords(j.length);
    return j.delve && j.enoughAt && j.enoughAt < j.length ? t('rhythms.enoughRoom', { enough: minutesWords(j.enoughAt), len }) : len;
  }
  function open(r: Rhythm | null) {
    if (r) { edit(game.job(r.job)!, r); return; }
    const j: Job = { id: `j-${Date.now().toString(36)}`, name: '', delve: false, length: 60, doneBy: 'dan' };
    d = { id: null, job: j, often: 'week', times: 2, days: [], len: 60, enough: null, time: null, delve: false, remind: null, avoided: false, step: '', note: '', isNew: true };
  }
  /** Any job's editor: its rhythm if it has one, else "Once" (D-112). */
  function edit(j: Job, r = v.content.rhythms.find(x => x.job === j.id) ?? null) {
    removed = null;
    d = { id: r?.id ?? null, job: { ...j }, often: !r ? 'once' : r.days ? 'days' : r.every === 2 ? 'fort' : 'week', times: r?.times ?? 2, days: r?.days ?? [], len: j.length,
      enough: j.enoughAt ?? null, time: r?.time ?? null, delve: j.delve, remind: r ? reminderOf(game.facts, rhythmTarget(r.id)) : null,
      avoided: !!j.avoided, step: j.firstStep ?? '', note: j.note ?? '', isNew: false };
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
    /* a one-off is done when Dan says so; a repeating delve at its enough (PLANNER.md) */
    const enough = d.delve && !once && d.enough !== null && d.enough < d.len ? d.enough : undefined;
    const job: Job = { ...d.job, length: d.len, delve: d.delve, doneBy: d.delve && !once ? 'enough' : 'dan', ...(enough ? { enoughAt: enough } : {}),
      firstStep: d.step, note: d.note };
    if (!enough) delete job.enoughAt;
    if (d.avoided) job.avoided = true; else delete job.avoided;
    const rhythm: Rhythm | null = once ? null : { id: d.id ?? `r-${Date.now().toString(36)}`, job: job.id,
      ...(d.often === 'week' ? { times: d.times } : d.often === 'days' ? { days: [...d.days].sort() } : { every: 2 as const }), ...(d.time ? { time: d.time } : {}) };
    game.do({ do: 'saveJob', job, rhythm });
    /* "Remind me" (D-107) is kept with the rhythm; it alerts only while the rhythm has a time */
    if (rhythm && d.remind !== (d.id ? reminderOf(game.facts, rhythmTarget(rhythm.id)) : null)) game.do({ do: 'remind', target: rhythmTarget(rhythm.id), lead: d.remind });
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
    <h1 class="carve lg rise">{d ? t(d.id ? 'rhythms.editing' : 'rhythms.adding') : t('rhythms.label')}</h1>
    {#if !d}<p class="soft say-note rise">{t('rhythms.say')}</p>{/if}
  </header>

  <div class="body col rise d1">
    {#if !d}
      {#if removed}
        <!-- a job removed: one quiet line, and Undo (D-112) -->
        <p class="said">{t('job.removed', { name: removed.job.name })} <button class="text-link" onclick={undo}><span>{t('job.undo')}</span></button></p>
      {/if}
      <!-- opened on one job (from the satchel or the Week) and it was removed: only the Undo, and the way back -->
      {#if jobArg && removed}
        <div class="links"><button class="text-link" onclick={() => go('back')}><span>{t('job.back', { to: back.label })}</span></button></div>
      {:else}
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
      {#if others.length}
        <div class="label-line others">{t('job.others')}</div>
        {#each others as j (j.id)}
          <button class="row" onclick={() => edit(j)}>
            <span class="pip"></span>
            <span class="t">{j.name}<small>{t('job.onceUntil')} · {size(j)}{j.delve ? ' · ' + t('rhythms.asDelves') : ''}</small></span>
            <span class="s"></span>
          </button>
        {/each}
      {/if}
      <!-- the week is the arrow at the top: no second link to it (it said "Plan my week" and planned nothing; review 2) -->
      <div class="links"><button class="text-link" onclick={() => open(null)}><span>{t('rhythms.add')}</span></button></div>
      {/if}
    {:else}
      <div class="editor">
        <div class="label-line">{t('rhythms.name')}</div>
        <input class="line" bind:value={d.job.name} maxlength="60" aria-label={t('rhythms.name')} />

        <!-- a line of the satchel stays a line: it doesn't repeat (TOOLS §2) -->
        {#if !d.job.item}
        <div class="label-line">{t('rhythms.often')}</div>
        <div class="seg often" role="group" aria-label={t('rhythms.often')}>
          <button aria-pressed={d.often === 'once'} onclick={() => (d!.often = 'once')}>{t('job.once')}</button>
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
        {:else if d.often === 'fort'}
          <p class="soft val-note">{t('rhythms.every2long')}</p>
        {:else}
          <p class="soft val-note">{t('job.onceSay')}</p>
        {/if}
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
        {#if d.delve && d.often !== 'once'}
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
        {#if !d.isNew}<div class="links"><button class="text-link" onclick={remove}><span>{d.job.item ? t('satchel.letGo') : t('job.remove')}</span></button></div>{/if}
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
  .others { margin-top: 18px; }
  .said { margin: 0 0 10px; color: var(--ink-2); font-style: italic; }
  .stepper input.val { flex: 1; }
  .days button { padding-left: 0; padding-right: 0; font-size: 14px; }
  .stepper { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border: 1px solid var(--edge-2); background: rgba(10,9,24,.55); }
  .stepper .val { color: #fff; font-size: 17px; }
  .step { min-width: 52px; }
  .step span { font-size: 20px; }
  .val-note { text-align: left; margin-top: 10px; }
  input.line { width: 100%; margin-top: 6px; padding: 10px 12px; font: inherit; font-size: 17px; color: #fff; background: rgba(255,255,255,.06); border: 1px solid var(--edge-2); border-radius: 0; }
  button.home { color: var(--ink-2); white-space: nowrap; }
</style>
