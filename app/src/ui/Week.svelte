<script lang="ts">
  import Deleted from './Deleted.svelte';
  /* The week (PLANNER.md, locked D-048; mock-up week.html). On request only, never the opening screen. One row per day,
     each day's jobs in plain words with a time where one is set; no hour grid, no tray of unplaced jobs. "Plan my week"
     lays it out; a tap moves a job, gives it a time, or takes it off this week. The past shows only what was done. The
     forecast is one line in the world's terms: predictive, never contractual. Nothing here earns anything. */
  import { game } from './game.svelte';
  import { t, dayName, minutesWords, weekDates, byWords } from '../content/copy/en';
  import { calendarWeek } from '../core/time';
  import { addDays, dayMinutes, eventsOn, planMade, realMinutes, weekOf, type DayJob } from '../core/week';
  import { hold } from './hold';
  import { openMenu } from './menu.svelte';
  import { asideToday } from '../core/game';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { flushSync } from 'svelte';
  import Remind from './Remind.svelte';
  import DayPick from './DayPick.svelte';
  import { entryTarget, reminderSettings, rhythmTarget, type Lead } from '../core/reminders';

  let { go, week }: { go: Go; week?: string } = $props();
  const v = $derived(game.view);
  const thisWeek = $derived(calendarWeek(v.day));
  const wk = $derived(week && week > thisWeek ? week : thisWeek);
  const isNext = $derived(wk !== thisWeek);
  const view = $derived(weekOf(v.content, game.facts, wk, v.day));

  let open = $state<string | null>(null);
  /* adding (the clunkiness pass, D-093): the + on a day opens a line right under that day's name, already typing */
  let addingTo = $state<string | null>(null), line = $state(''), lineEl = $state<HTMLInputElement | null>(null);

  /* jobs taken off today's list ("Not today"): the Week says so, and can put them back (review 2, D-088) */
  const aside = $derived(asideToday(game.facts, v.day));
  const isAside = (j: DayJob, day: string) => day === v.day && !j.done && aside.has(j.job);
  function note(j: DayJob, day: string): string {
    if (j.done) return t('row.done');
    if (isAside(j, day)) return t('week.asideNote');
    if (j.time) return j.time;
    const job = game.job(j.job);
    if (!job) return '';
    if (job.by) return byWords(job.by);
    return minutesWords(job.length);
  }
  const forecast = $derived.by(() => {
    if (isNext || !v.forecast.length) return '';
    const parts = [t('week.forecast.one', { day: dayName(v.forecast[0]) })];
    if (v.forecast[1] && v.forecast[1] !== v.forecast[0]) parts.push(t('week.forecast.then', { day: dayName(v.forecast[1]) }));
    return t('week.forecast', { what: parts.join(', ') });
  });
  const days = $derived(view.days.map(d => d.day).filter(d => d >= v.day));
  /* folding: days already gone are folded unless opened; any other day folds with a tap */
  let toggled = $state<Record<string, boolean>>({});
  const isFolded = (day: string) => toggled[day] ?? day < v.day;
  function fold(day: string) { toggled[day] = !isFolded(day); if (toggled[day]) { open = null; if (addingTo === day) addingTo = null; } }
  function summary(jobs: DayJob[]): string {
    const done = jobs.filter(j => j.done).length, left = jobs.length - done;
    return [done ? t('week.fold.done', { n: done }) : '', left ? t('week.fold.left', { n: left }) : ''].filter(Boolean).join(' · ');
  }

  /* a job's sheet: a tap on a day moves it there at once; the time opens the phone's own wheel and keeps what it's set
     to; nothing to save (D-093) */
  function edit(j: DayJob, day: string) {
    /* a done job opens too, to be deleted: its record goes, the minutes it counted for stay (Dan, D-125) */
    if (!j.done && (!j.entry || day < v.day)) return;
    addingTo = null;
    open = open === keyOf(j, day) ? null : keyOf(j, day);
  }
  $effect(() => { void open; otherOpen = false; });
  const keyOf = (j: DayJob, day: string) => j.done ? `done:${day}:${j.job}` : j.entry!;
  /* a done row: only that day's record goes (its minutes stay); otherwise the job (D-125) */
  function remove(j: DayJob, day: string) { open = null; if (j.done) game.removeDone(j.job, day); else game.remove(j.job); }
  function moveTo(j: DayJob, from: string, day: string) {
    if (day !== from) game.do({ do: 'movePlan', entry: j.entry!, day });
    open = null;
  }
  function setTime(j: DayJob, day: string, time: string | null) { game.do({ do: 'movePlan', entry: j.entry!, day, time }); }
  /* "Remind me" on a job with a time (D-107): this entry's own choice, else its rhythm's */
  const reminds = $derived(reminderSettings(game.facts));
  function leadOf(j: DayJob): Lead | null {
    const e = entryTarget(j.entry!), r = v.content.rhythms.find(x => x.job === j.job);
    return reminds.has(e) ? reminds.get(e)! : r ? reminds.get(rhythmTarget(r.id)) ?? null : null;
  }
  function remind(j: DayJob, lead: Lead | null) { game.do({ do: 'remind', target: entryTarget(j.entry!), lead }); }
  /* to a day in another week: its entry leaves this week, and the job is put on that day */
  function toDay(j: DayJob, day: string) {
    if (calendarWeek(day) === wk) { moveTo(j, '', day); return; }
    game.do({ do: 'movePlan', entry: j.entry!, day: null });
    game.do({ do: 'planJob', job: j.job, day, ...(j.time ? { time: j.time } : {}) });
    open = null;
  }
  function off(j: DayJob) { game.do({ do: 'movePlan', entry: j.entry!, day: null }); open = null; }
  function plan() { game.do({ do: 'planWeek', week: wk }); }
  /* a tap on "about 2 h" says where it comes from, in one line a job (D-131): how long a job usually takes Dan, once
     the planner has learned it; otherwise the minutes set for each job */
  let why = $state<string | null>(null);
  function whyOf(d: { jobs: DayJob[] }): string[] {
    const ids = [...new Set(d.jobs.filter(j => !j.done).map(j => j.job))];
    const out = ids.flatMap(id => { const m = realMinutes(game.facts, id, undefined, v.content), j = game.job(id); return m && j ? [t('week.about.why', { job: j.name, min: minutesWords(m) })] : []; });
    /* the rest, from the minutes set for them */
    return out.length === ids.length ? out : [...out, t(out.length ? 'week.about.rest' : 'week.about.set')];
  }
  /* a faint "about 2 h": the day's shape, not a score (D-114) */
  function about(m: number) {
    if (m < 60) return t('week.aboutMin', { n: Math.max(5, Math.round(m / 5) * 5) });
    const h = Math.round(m / 30) / 2;
    return t('week.aboutH', { n: Number.isInteger(h) ? String(h) : `${Math.floor(h)}½` });
  }
  function startAdd(day: string) {
    if (addingTo === day) { addingTo = null; return; }
    open = null; line = ''; addingTo = day; toggled[day] = false;
    /* focused inside the tap itself, so the phone's keyboard opens straight away */
    flushSync(); lineEl?.focus(); lineEl?.scrollIntoView({ block: 'nearest' });
  }
  function add() {
    if (!line.trim() || !addingTo) { addingTo = null; return; }
    game.do({ do: 'addToWeek', line, day: addingTo });
    line = ''; addingTo = null;
  }
  /* on a computer the time box opens its picker on any click too, as a phone's does */
  function pick(e: MouseEvent) { try { (e.currentTarget as HTMLInputElement).showPicker?.(); } catch { /* not every browser */ } }
  const short = (d: string) => t(`days.short.${new Date(`${d}T00:00:00Z`).getUTCDay()}` as never);
  /* "Another day…": the app's one calendar (DayPick), from today on (D-125, D-130) */
  let otherOpen = $state(false);
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span>
      <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
    </div>
    <h1 class="carve lg rise">{!isNext ? t('week.label') : wk === addDays(thisWeek, 7) ? t('week.next') : t('week.later')}</h1>
    <p class="soft dates rise">{weekDates(wk)}</p>
    {#if forecast}<p class="say forecast rise d1">{forecast}</p>{/if}
  </header>

  <div class="body col rise d1">
    <Deleted />
    {#if !planMade(game.facts, wk)}
      <div class="none">
        {#if !view.planned}<h2 class="say-lg">{isNext ? t('week.none.next') : t('week.none')}</h2>{/if}
        <p class="soft">{t('week.none.say')}</p>
        <button class="btn full" onclick={plan}>{t('week.plan')}</button>
      </div>
    {/if}
    {#each view.days as d (d.day)}
      {#if d.jobs.length || d.day >= v.day}
        <div class="day" class:past={d.day < v.day} class:today={d.day === v.day}>
          <div class="dhead">
            <!-- a tap on a day's name folds its jobs away; days already gone start folded (Dan, review 2) -->
            <button class="dname" aria-expanded={!isFolded(d.day)} onclick={() => fold(d.day)}>
              <span class="chev" class:shut={isFolded(d.day)} aria-hidden="true">›</span>{dayName(d.day)}{#if d.day === v.day}<em>{t('week.today')}</em>{/if}
              {#if isFolded(d.day) && d.jobs.length}<small>{summary(d.jobs)}</small>
              {/if}
            </button>
            {#if !isFolded(d.day) && d.day >= v.day && dayMinutes(v.content, d, game.facts) > 0}
              <button class="about" aria-expanded={why === d.day} onclick={() => (why = why === d.day ? null : d.day)}>{about(dayMinutes(v.content, d, game.facts))}</button>
            {/if}
            {#if d.day >= v.day}
              <button class="plus" class:on={addingTo === d.day} aria-label={t('week.addTo', { day: dayName(d.day) })} onclick={() => startAdd(d.day)}><span aria-hidden="true">+</span></button>
            {/if}
          </div>
          {#if why === d.day && !isFolded(d.day)}<div class="why" role="status">{#each whyOf(d) as line, k (k)}<p>{line}</p>{/each}</div>{/if}
          {#if addingTo === d.day}
            <form class="new" onsubmit={(e) => { e.preventDefault(); add(); }}>
              <input bind:this={lineEl} bind:value={line} placeholder={t('week.addPlaceholder')} maxlength="120" enterkeyhint="done" aria-label={t('week.addTo', { day: dayName(d.day) })} />
              <button class="btn-quiet" type="submit" disabled={!line.trim()}><span>{t('week.add')}</span></button>
            </form>
          {/if}
          {#if !isFolded(d.day)}
          <!-- the phone's calendar (D-115): fixed points, not jobs; nothing to tap, nothing earned -->
          {#each eventsOn(game.facts, d.day) as e (e.id)}
            <div class="event" class:allday={e.allDay}>{#if !e.allDay}<span class="at">{e.start.slice(0, 10) < d.day ? '' : e.start.slice(11, 16)}</span>{/if}<span class="what">{e.title}</span></div>
          {/each}
          {#each d.jobs as j (j.entry ?? j.job + j.done)}
            <button class="row" class:done={j.done} class:open={open === keyOf(j, d.day)} onclick={() => edit(j, d.day)} disabled={!j.done && d.day < v.day}
              use:hold={() => { open = null; openMenu(j.job, go, j.done ? d.day : null, j.done ? null : j.entry); }}>
              <span class="pip" class:done={j.done}></span><span class="t">{game.job(j.job)?.name ?? j.job}</span><span class="s">{note(j, d.day)}</span>
            </button>
            {#if open && j.done && open === keyOf(j, d.day)}
              <!-- a done job: only Delete; the minutes it counted for stay (Dan, D-125) -->
              <div class="sheet"><div class="off"><button class="text-link del" onclick={() => remove(j, d.day)}><span>{t('job.delete')}</span></button></div></div>
            {:else if open && open === j.entry}
              <div class="sheet">
                <div class="label-line">{t('week.moveTo')}</div>
                <div class="seg days" role="group" aria-label={t('week.moveTo')}>
                  {#each days as x (x)}<button aria-pressed={d.day === x} onclick={() => moveTo(j, d.day, x)}>{short(x)}</button>{/each}
                </div>
                <!-- another day: the app's one calendar, as in the Satchel, from today on (D-130), not the phone's date
                     picker, which closed itself within seconds on the iPhone (Dan, D-125) -->
                <div class="other"><button class="text-link" aria-expanded={otherOpen} onclick={() => (otherOpen = !otherOpen)}><span>{t('week.otherDay')}</span></button></div>
                {#if otherOpen}
                  <DayPick from={v.day} label={t('week.otherDay')} pick={x => toDay(j, x)} />
                {/if}
                <div class="when">
                  <!-- the time box is the phone's own: a tap opens its wheel, and what it's set to is kept (D-093) -->
                  <label class="clock-btn">
                    <span class="carve" class:set={!!j.time}>{j.time ? t('week.at', { time: j.time }) : t('week.setTime')}</span>
                    <input type="time" step="900" value={j.time ?? ''} aria-label={t('week.time')} onclick={pick}
                      onchange={e => { const x = e.currentTarget.value; if (x) setTime(j, d.day, x); }} />
                  </label>
                  {#if j.time}<button class="text-link" onclick={() => setTime(j, d.day, null)}><span>{t('week.anyTime')}</span></button>{/if}
                </div>
                {#if j.time}<Remind lead={leadOf(j)} pick={x => remind(j, x)} />{/if}
                <div class="off">
                  {#if isAside(j, d.day)}<button class="text-link" onclick={() => moveTo(j, '', v.day)}><span>{t('week.putBack')}</span></button>{/if}
                  <button class="text-link" onclick={() => off(j)}><span>{t('week.off')}</span></button>
                  <!-- the job itself: its name, length, first step… (D-112) -->
                  <button class="text-link" onclick={() => go('rhythms', j.job)}><span>{t('job.change')}</span></button>
                </div>
                <!-- Delete on a line of its own, at the sheet's end (D-131) -->
                {#if v.run?.job.id !== j.job}<div class="off"><button class="text-link del" onclick={() => remove(j, d.day)}><span>{t('job.delete')}</span></button></div>{/if}
              </div>
            {/if}
          {/each}
          {/if}
        </div>
      {/if}
    {/each}

    <div class="links">
      <!-- the recurring jobs live in the Satchel (D-131): this opens it there -->
      <button class="text-link" onclick={() => go('satchel', 'recurring')}><span>{t('week.rhythms')}</span></button>
      <button class="text-link" onclick={() => go('week', isNext ? thisWeek : addDays(thisWeek, 7))}><span>{isNext ? t('week.this') : t('week.next')}</span></button>
      <!-- any week ahead, a week at a time (D-114) -->
      {#if isNext}<button class="text-link" onclick={() => go('week', addDays(wk, 7))}><span>{t('week.after')}</span></button>{/if}
      <!-- a disrupted week: lay out the rest again from today, keeping what you placed yourself (D-114) -->
      {#if !isNext && planMade(game.facts, wk)}<button class="text-link" onclick={() => game.do({ do: 'replan' })}><span>{t('week.replan')}</span></button>{/if}
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
  .dname { font-family: var(--carve, inherit); font-size: 14px; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-2); display: flex; gap: 10px; align-items: baseline;
    width: 100%; min-height: 44px; background: none; border: 0; padding: 0; text-align: left; cursor: pointer; }
  .about { flex: none; min-height: 44px; padding: 0 10px; background: none; border: 0; cursor: pointer;
    font-family: var(--life); font-style: italic; font-size: 15px; color: var(--ink-3); text-decoration: underline dotted; text-underline-offset: 3px; }
  .why { margin: 0 0 6px 22px; }
  .why p { font-family: var(--life); font-style: italic; font-size: 15px; color: var(--ink-2); margin: 2px 0; }
  .row { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
  .dname small { margin-left: auto; font-family: var(--life); font-style: italic; text-transform: none; letter-spacing: 0; font-size: 15px; color: var(--ink-3); }
  .chev { display: inline-block; width: 10px; font-size: 16px; line-height: 1; color: var(--ink-3); transform: rotate(90deg); transition: transform .2s ease; }
  .chev.shut { transform: none; }
  .dname em { font-family: var(--life); text-transform: none; letter-spacing: 0; font-size: 15px; color: var(--gold); }
  .day.past .dname { color: var(--ink-3); }
  button.row { width: 100%; text-align: left; }
  /* a note stays on one line; a long job name wraps instead */
  button.row .s { white-space: nowrap; }
  button.row:disabled { cursor: default; }
  .dhead { display: flex; align-items: flex-start; }
  .dhead .dname { flex: 1; min-width: 0; }
  /* the + sits at the end of each day's line: a big enough target, quiet until wanted */
  .plus { width: 44px; height: 44px; margin: 0 -12px 0 0; align-self: flex-start; display: grid; place-items: center; background: none; border: 0; color: var(--violet-hi); font-size: 22px; line-height: 1; cursor: pointer; }
  .plus.on span { display: inline-block; transform: rotate(45deg); }
  .sheet { border: 1px solid var(--edge-2); background: rgba(10,9,24,.7); padding: 4px 14px 10px; margin: 6px 0 10px; }
  .sheet .label-line { margin-top: 8px; }
  .sheet .seg { margin-top: 6px; }
  /* seven days on one line at 14 px, even on a small phone (D-111): the carved spacing is tightened, not the size */
  .days button { padding-left: 0; padding-right: 0; font-size: 14px; letter-spacing: .02em; min-width: 0; }
  .seg.days { grid-auto-columns: minmax(0, 1fr); gap: 4px; }
  .when { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 12px; }
  .clock-btn { position: relative; flex: 1; min-height: 44px; display: grid; place-items: center; border: 1px solid var(--edge-2); cursor: pointer; }
  .clock-btn span { font-size: 14px; letter-spacing: .14em; color: var(--ink-2); }
  .clock-btn span.set { font-size: 18px; color: #fff; }
  /* the phone's own time box, laid over the button so any tap on it opens the wheel */
  .clock-btn input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; border: 0; padding: 0; margin: 0; cursor: pointer; -webkit-appearance: none; appearance: none; }
  .event { display: flex; gap: 10px; padding: 3px 0 3px 22px; font-style: italic; font-size: 15px; color: var(--ink-2); }
  .event .at { font-variant-numeric: tabular-nums; color: var(--ink-3); min-width: 3.2em; }
  .event.allday { color: var(--ink-3); }
  .event .what { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .other { display: flex; justify-content: center; margin-top: 8px; }
  /* the calendar reaches into the sheet's padding, so each day is a whole 44-point target on a small phone */
  .sheet :global(.cal) { margin-left: -13px; margin-right: -13px; }
  .off { display: flex; justify-content: center; flex-wrap: wrap; gap: 0 14px; margin-top: 6px; }
  .btn.full { width: 100%; }
  .new { display: flex; gap: 10px; margin: 4px 0 8px; }
  .new input { flex: 1; min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: 17px; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .new .btn-quiet { padding: 0 14px; }
  .new .btn-quiet:disabled { opacity: .5; }
  button.row.open { background: rgba(var(--violet-rgb), .12); }
  .links { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px 18px; margin-top: 18px; }
  button.home { color: var(--ink-2); }
</style>
