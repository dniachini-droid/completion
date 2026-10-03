<script lang="ts">
  import { NAME_MAX } from '../core/remember';
  import Deleted from './Deleted.svelte';
  /* The job editor (D-112): any job, titled with its name (D-131). Recurring jobs are listed in the Satchel (D-131); this
     screen opens on one job (`job`), or on a new recurring job ('new'), and goes back where it came from. How often
     (N a week, set days, every 2 weeks, monthly, yearly, every N days, or once), about how long (for planning), a time,
     a date for a one-off. A one-off shows only What, About how long and By a date; the rest is under "More…" (D-131).
     One number is enough; no ranges. Stopping a repeat ends future sessions only; no confirmation. */
  import { game } from './game.svelte';
  import { t, minutesWords, minutesShort, byWords, dayOrd, yearWords, oftenWords, weeklyWords, type Weekday } from '../content/copy/en';
  import { addDays } from '../core/week';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { backTo } from './nav';
  import type { Job, Rhythm } from '../core/types';
  import Remind from './Remind.svelte';
  import DayPick from './DayPick.svelte';
  import { dateTarget, reminderOf, rhythmTarget, type Lead } from '../core/reminders';

  /* `job`: opened straight on that job's editor (from the Week, D-112); leaving it goes back there */
  let { go, job: jobArg }: { go: Go; job?: string } = $props();
  const v = $derived(game.whole);
  /* down to 5 min (D-110); every 5 minutes to two hours, so any length set before can be set again (Course's 50, deep
     review W F14), then by the quarter hour to four */
  const LEN = [...Array.from({ length: 24 }, (_, i) => 5 * (i + 1)), 135, 150, 165, 180, 195, 210, 225, 240];
  const DAYS = [1, 2, 3, 4, 5, 6, 0];

  interface Draft { id: string | null; job: Job; often: 'once' | 'week' | 'days' | 'fort' | 'month' | 'year' | 'every'; times: number;
    mode: 'date' | 'nth'; mday: number; nth: 1 | 2 | 3 | 4 | -1; wday: number; ydate: string; every: number; days: number[]; len: number; time: string | null; delve: boolean; remind: Lead | null;
    avoided: boolean; step: string; note: string; isNew: boolean; by: string | null; dremind: 0 | 1440 | null; }
  let d = $state<Draft | null>(null);
  /* a job just removed, for its Undo (D-112) */
  let removed = $state<{ job: Job; rhythm: Rhythm | null } | null>(null);
  const often = oftenWords;
  /* a one-off shows the three things it needs; the rest waits under "More…" (D-131) */
  let more = $state(false), picking = $state(false);
  const full = $derived(!!d && (d.often !== 'once' || more));
  function open(r: Rhythm | null) {
    if (r) { edit(game.job(r.job)!, r); return; }
    const j: Job = { id: `j-${Date.now().toString(36)}`, name: '', delve: true, length: 60, doneBy: 'enough' };
    d = { id: null, job: j, often: 'week', times: 2, days: [], len: 60, time: null, delve: true, remind: null, avoided: false, step: '', note: '', isNew: true, by: null, dremind: null, ...kinds(null) };
  }
  /** The monthly, yearly and every-N-days settings of a rhythm, or their starting values (D-114). */
  function kinds(r: Rhythm | null) {
    const m = r?.monthly, today = v.day;
    return { mode: (m && 'nth' in m ? 'nth' : 'date') as 'date' | 'nth', mday: m && 'day' in m ? m.day : +today.slice(8, 10),
      nth: (m && 'nth' in m ? m.nth : 1) as 1 | 2 | 3 | 4 | -1, wday: m && 'weekday' in m ? m.weekday : 5,
      ydate: r?.yearly ?? today.slice(5, 10), every: r?.everyDays ?? 3 };
  }
  /* what the rhythm was when the editor opened, to say "counts from next week" only when it changed */
  const rhythmKey = (x: NonNullable<typeof d>) => JSON.stringify([x.often, x.times, [...x.days].sort(), x.mode, x.mday, x.nth, x.wday, x.ydate, x.every]);
  let wasRhythm = $state('');
  /** Any job's editor: its rhythm if it has one, else "Once" (D-112). */
  function edit(j: Job, r = v.content.rhythms.find(x => x.job === j.id) ?? null) {
    removed = null;
    d = { ...kinds(r), id: r?.id ?? null, job: { ...j }, often: !r ? 'once' : r.days ? 'days' : r.every === 2 ? 'fort' : r.monthly ? 'month' : r.yearly ? 'year' : r.everyDays ? 'every' : 'week', times: r?.times ?? 2, days: r?.days ?? [], len: j.length,
      time: r?.time ?? null, delve: j.delve, remind: r ? reminderOf(game.facts, rhythmTarget(r.id)) : null,
      avoided: !!j.avoided, step: j.firstStep ?? '', note: j.note ?? '', isNew: false, by: j.by ?? null, dremind: reminderOf(game.facts, dateTarget(j.id)) as 0 | 1440 | null };
    wasRhythm = rhythmKey(d);
  }
  if (jobArg === 'new') open(null);
  /* "Make it repeat" in the Satchel (D-136): the job's editor with How often ready, twice a week to start */
  else if (jobArg?.startsWith('repeat:')) { const j = game.job(jobArg.slice(7)); if (j) { edit(j); if (d && d.often === 'once') d.often = 'week'; } }
  else if (jobArg) { const j = game.job(jobArg); if (j) edit(j); }
  /** Leave the editor: back to where it was opened from. */
  function close() { d = null; if (!removed) go('back'); }
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
    /* every job is a delve (D-117): a repeating one is that day's session once delved on (D-121), a one-off when Dan says so */
    const job: Job = { ...d.job, length: d.len, delve: true, doneBy: !once ? 'enough' : 'dan', firstStep: d.step, note: d.note };
    delete job.enoughAt;
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
    /* through the one guarded delete: never the job of a delve under way (break-it review 4) */
    const rhythm = v.content.rhythms.find(x => x.job === job.id) ?? null;
    game.remove(job.id);
    if (game.deleted?.job.id !== job.id) return;
    game.deleted = null;   /* this screen shows its own Undo */
    removed = { job: { ...job }, rhythm };
    d = null;
  }
  function undo() { if (removed) { game.do({ do: 'saveJob', job: removed.job, rhythm: removed.rhythm }); removed = null; if (jobArg) go('back'); } }
  function toggleDay(x: number) { if (d) d.days = d.days.includes(x) ? d.days.filter(y => y !== x) : [...d.days, x]; }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => (d ? close() : go('back'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <!-- editing: the arrow says where it goes (What repeats), the title what this is (review 2) -->
    <!-- titled with the job's name (D-131); a new one says so -->
    {#if !d && removed}
      <h1 class="carve lg rise">{removed.job.name}</h1>
    {:else}
      <h1 class="carve lg rise title">{d && !d.isNew ? game.job(d.job.id)?.name ?? d.job.name : t('rhythms.adding')}</h1>
    {/if}
  </header>

  <div class="body col rise d1">
    <Deleted />
    {#if !d}
      {#if removed}
        <!-- a job removed: one quiet line, and Undo (D-112); opened on that one job, also the way back -->
        <p class="said">{t('job.gone')}</p>
        <div class="links undo"><button class="text-link" onclick={undo}><span>{t('job.undo')}</span></button>
          <button class="text-link" onclick={() => go('back')}><span>{backTo(back.label)}</span></button></div>
      {/if}
    {:else}
      <div class="editor">
        <div class="label-line">{t('rhythms.name')}</div>
        <!-- one name limit in every box, said when reached, never a silent cut (deep review H#11) -->
        <input class="line" bind:value={d.job.name} maxlength={NAME_MAX} aria-label={t('rhythms.name')} />
        {#if d.job.name.length >= NAME_MAX}<p class="soft name-max">{t('name.max', { n: NAME_MAX })}</p>{/if}

        {#if full}
        <div class="label-line">{t('rhythms.often')}</div>
        <div class="seg often" role="group" aria-label={t('rhythms.often')}>
          <button aria-pressed={d.often === 'once'} onclick={() => (d!.often = 'once')}>{t('job.once')}</button>
          <button aria-pressed={d.often === 'week'} onclick={() => (d!.often = 'week')}>{t('rhythms.aWeek')}</button>
          <button aria-pressed={d.often === 'days'} onclick={() => (d!.often = 'days')}>{t('rhythms.setDays')}</button>
          <button aria-pressed={d.often === 'fort'} onclick={() => (d!.often = 'fort')}>{t('rhythms.fortnight')}</button>
        </div>
        <!-- the longer ones (D-114): rent on the 1st, a birthday, the haircut every few weeks -->
        <div class="seg often more" role="group" aria-label={t('rhythms.oftenMore')}>
          <button aria-pressed={d.often === 'month'} onclick={() => (d!.often = 'month')}>{t('rhythms.monthly')}</button>
          <button aria-pressed={d.often === 'year'} onclick={() => (d!.often = 'year')}>{t('rhythms.yearlyShort')}</button>
          <button aria-pressed={d.often === 'every'} onclick={() => (d!.often = 'every')}>{t('rhythms.everyShort')}</button>
        </div>
        {#if d.often === 'week'}
          <div class="stepper">
            <button class="btn-quiet step" disabled={d.times <= 1} onclick={() => (d!.times = Math.max(1, d!.times - 1))} aria-label={t('rhythms.lessTimes')}><span>−</span></button>
            <span class="val">{weeklyWords(d.times)}</span>
            <button class="btn-quiet step" disabled={d.times >= 7} onclick={() => (d!.times = Math.min(7, d!.times + 1))} aria-label={t('rhythms.moreTimes')}><span>+</span></button>
          </div>
        {:else if d.often === 'days'}
          <div class="seg days" role="group" aria-label={t('rhythms.setDays')}>
            {#each DAYS as x (x)}<button aria-pressed={d.days.includes(x)} onclick={() => toggleDay(x)}>{t(`days.short.${x as Weekday}`)}</button>{/each}
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
              <button class="btn-quiet step" disabled={d.mday <= 1} onclick={() => (d!.mday -= 1)} aria-label={t('rhythms.dayEarlier')}><span>−</span></button>
              <span class="val">{t('rhythms.monthDay', { n: dayOrd(d.mday) })}</span>
              <button class="btn-quiet step" disabled={d.mday >= 31} onclick={() => (d!.mday += 1)} aria-label={t('rhythms.dayLater')}><span>+</span></button>
            </div>
          {:else}
            <div class="seg days" role="group" aria-label={t('rhythms.onAWeekday')}>
              {#each ([1, 2, 3, 4, -1] as (1 | 2 | 3 | 4 | -1)[]) as x (x)}<button aria-pressed={d.nth === x} onclick={() => (d!.nth = x)}>{t(`rhythms.nth.${x}`)}</button>{/each}
            </div>
            <div class="seg days" role="group" aria-label={t('rhythms.onAWeekday')}>
              {#each DAYS as x (x)}<button aria-pressed={d.wday === x} onclick={() => (d!.wday = x)}>{t(`days.short.${x as Weekday}`)}</button>{/each}
            </div>
          {/if}
          <!-- (said once: a date's stepper already says it, W F14) -->
          {#if d.mode === 'nth'}<p class="soft val-note">{often({ monthly: { nth: d.nth, weekday: d.wday } })}</p>{/if}
        {:else if d.often === 'year'}
          <div class="stepper">
            <input class="clock val carve" type="date" value={`2026-${d.ydate}`} aria-label={t('rhythms.yearlyShort')}
              onchange={e => { const x = e.currentTarget.value; if (x) d!.ydate = x.slice(5, 10); }} />
          </div>
          <p class="soft val-note">{t('rhythms.yearly', { date: yearWords(d.ydate) })}</p>
        {:else if d.often === 'every'}
          <div class="stepper">
            <button class="btn-quiet step" disabled={d.every <= 2} onclick={() => (d!.every -= 1)} aria-label={t('rhythms.fewerDays')}><span>−</span></button>
            <span class="val">{t('rhythms.everyN', { n: d.every })}</span>
            <button class="btn-quiet step" disabled={d.every >= 90} onclick={() => (d!.every += 1)} aria-label={t('rhythms.moreDays')}><span>+</span></button>
          </div>
          <p class="soft val-note">{t('rhythms.everySay')}</p>
        {:else}
          <p class="soft val-note">{t('job.onceSay')}</p>
        {/if}
        {/if}

        <div class="label-line">{t('rhythms.each')}</div>
        <div class="stepper">
          <button class="btn-quiet step" disabled={d.len <= LEN[0]} onclick={() => (d!.len = step(LEN, d!.len, -1))} aria-label={t('rhythms.shorterLen', { len: minutesWords(d.len) })}><span>−</span></button>
          <span class="val">{minutesShort(d.len)}</span>
          <button class="btn-quiet step" disabled={d.len >= LEN[LEN.length - 1]} onclick={() => (d!.len = step(LEN, d!.len, 1))} aria-label={t('rhythms.longerLen', { len: minutesWords(d.len) })}><span>+</span></button>
        </div>
        <!-- the minutes only tell the Week how full a day is: every delve opens at 30 (D-124, D-130) -->
        <!-- the line follows the job: a recurring job's delve opens at its own minutes, a one-off's at 30 (D-146, deep review B11) -->
        <p class="soft val-note">{t(d.often === 'once' ? 'rhythms.each.sayOnce' : 'rhythms.each.say')}</p>

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
            <!-- the app's one calendar (D-130, D-131): the phone's date picker closed itself on the iPhone -->
            <div class="bydate"><span class="val">{byWords(d.by)}</span>
              <button class="text-link" aria-expanded={picking} onclick={() => (picking = !picking)}><span>{t('camp.change')}</span></button></div>
            {#if picking}<DayPick from={v.day} label={t('by.label')} pick={x => { d!.by = x; picking = false; }} />{/if}
            <div class="label-line">{t('remind.label')}</div>
            <div class="seg" role="group" aria-label={t('remind.label')}>
              <button aria-pressed={d.dremind === null} onclick={() => (d!.dremind = null)}>{t('remind.off')}</button>
              <button aria-pressed={d.dremind === 0} onclick={() => (d!.dremind = 0)}>{t('remind.date.day')}</button>
              <button aria-pressed={d.dremind === 1440} onclick={() => (d!.dremind = 1440)}>{t('remind.date.before')}</button>
            </div>
          {/if}
        {/if}

        {#if !full}<div class="links more"><button class="text-link" aria-expanded="false" onclick={() => (more = true)}><span>{t('job.more')}</span></button></div>
        {:else}
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
        {/if}

        <!-- only for a rhythm that was there and changed: never on a new one (W F14) -->
        {#if d.often !== 'once' && d.id !== null && rhythmKey(d) !== wasRhythm}<p class="soft val-note">{t('rhythms.newNumber')}</p>{/if}
      </div>
    {/if}
  </div>
  <!-- Save and Delete at the foot of the screen, always in view, the main action in the lower third (spacing review C3) -->
  {#if d}
    <div class="bottom col foot rise d1">
      <div class="btn-row lead"><button class="btn" disabled={!d.job.name.trim() || (d.often === 'days' && !d.days.length)} onclick={save}>{t('rhythms.save')}</button><button class="btn-quiet" onclick={close}><span>{t('rhythms.cancel')}</span></button></div>
      {#if !d.isNew}<div class="links del-line"><button class="text-link del" onclick={remove}><span>{t('job.remove')}</span></button></div>{/if}
    </div>
  {/if}
</div>

<style>
  /* the form fades out above the footer as well as under the header (spacing review S1, C3) */
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 20px), transparent);
    mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 20px), transparent); }
  .foot { padding-top: 8px; }
  /* the corner ticks stand 6 px out of the main button: room for them at the footer's top */
  .foot .btn-row { margin-top: 8px; }
  .links.del-line { margin-top: 4px; }
  h1 { margin-top: 4px; }
  .title { overflow-wrap: anywhere; }
  .bydate { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; min-height: 44px; }
  .bydate .val { font-family: var(--life); font-style: italic; font-size: calc(17px * var(--ts, 1)); color: #fff; }
  /* its words on the column's edge, like every label above it (spacing review S10) */
  .links.more { justify-content: flex-start; margin-top: 12px; }
  .links.more .text-link { margin-left: -8px; }
  .links { display: flex; justify-content: center; gap: 18px; margin-top: 16px; }
  .editor .label-line { margin-top: 14px; }
  .editor .seg { margin-top: 6px; }
  /* three choices on one line, even on a small phone (review 2) */
  .editor .seg:not(.days) button { letter-spacing: .08em; padding-left: 4px; padding-right: 4px; white-space: nowrap; }
  /* four choices of how often on one line, even on a small phone (D-112) */
  /* the choices flow onto as many rows as they need, always ending on the column's edge (spacing review S7) */
  .editor .seg.often { display: flex; flex-wrap: wrap; gap: 8px 6px; }
  .editor .seg.often button { flex: 1 1 auto; letter-spacing: 0; font-size: calc(14px * var(--ts, 1)); padding-left: 2px; padding-right: 2px; }
  .editor .seg.often.more { margin-top: 8px; }
  .said { margin: 8px 0 0; color: var(--ink-2); font-style: italic; }
  /* on the sentence's left edge, not centred under a left-set line (spacing review S14) */
  .links.undo { justify-content: flex-start; margin: 8px 0 16px -8px; }
  .stepper input.val { flex: 1; }
  .days button { padding-left: 0; padding-right: 0; font-size: calc(14px * var(--ts, 1)); letter-spacing: .02em; min-width: 0; }
  /* with the phone's text set larger, four to a row instead of seven run together (as in the Week, spacing review S12) */
  .seg.days { grid-auto-flow: row; grid-template-columns: repeat(auto-fit, minmax(min(calc(36px + (var(--ts, 1) - 1) * 1000px), calc((100% - 12px) / 4)), 1fr)); gap: 4px; }
  .stepper { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; border: 1px solid var(--edge-2); background: rgba(10,9,24,.55); }
  .stepper .val { color: #fff; font-size: calc(17px * var(--ts, 1)); }
  .step { min-width: 52px; }
  .step span { font-size: calc(20px * var(--ts, 1)); }
  .val-note { text-align: left; margin-top: 10px; }
  input.line { width: 100%; margin-top: 6px; padding: 10px 12px; font: inherit; font-size: calc(17px * var(--ts, 1)); color: #fff; background: rgba(255,255,255,.06); border: 1px solid var(--edge-2); border-radius: 0; }
  button.home { color: var(--ink-2); white-space: nowrap; }
</style>
