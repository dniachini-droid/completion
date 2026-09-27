<script lang="ts">
  import Deleted from './Deleted.svelte';
  import Bedtime from './Bedtime.svelte';
  import SwipeRow from './SwipeRow.svelte';
  import { openMenu } from './menu.svelte';
  import { undoneFacts } from '../core/done';
  import { steady } from './taps';
  /* Today (the morning screen, UX_PRINCIPLES → "The morning screen carries"): where you are, the sealed thing ahead,
     the one next job (no Low / Normal / High, and no "Already done": Dan, D-089) with one button, today's other jobs as plain rows, "I can't start".
     A tap on a row starts that job, as its own button would (D-100: it used to swap the row with the next job, and the
     rows seemed to change places by themselves); a swipe takes it off today; the last row chooses a delve on anything (D-077). After day complete: the day as done, until Dan taps a job or keeps going.
     Mock-up: design/directions/d-combined/morning.html. */
  import { game, content } from './game.svelte';
  import { pastBedtime, BEDTIME_WINDOW, tomorrowFirst, satchelView } from '../core/game';
  import { beatOf } from '../core/story';
  import type { Job } from '../core/types';
  import { t, minutesWords, minutesShort, inSentence } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import { flushSync } from 'svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const job = (id: string) => game.job(id)!;
  const next = $derived(v.next ? job(v.next.job) : null);
  const weekday = $derived(t(`day.${new Date(Date.UTC(+v.day.slice(0, 4), +v.day.slice(5, 7) - 1, +v.day.slice(8, 10))).getUTCDay()}` as never));
  /* the finish line's jobs (its first 3 hours, D-131), then the rest, "If there's time" */
  const others = $derived(v.line.filter(id => id !== v.next?.job));
  const extra = $derived(v.slate.filter(id => !v.line.includes(id) && id !== v.next?.job));
  const lastPlace = $derived(v.lastArrival);

  function rowNote(j: Job): string {
    if (v.done.has(j.id)) return t('row.done');
    if (v.times[j.id]) return v.times[j.id];
    /* every job is a delve (D-117), so a row never says "a delve": it says the job's usual minutes, when they were set
       for it (a recurring job, or one made in the editor); a line jotted with + Add says nothing (D-130) */
    return j.item ? '' : minutesShort(j.length);
  }
  function teaser(j: Job): string {
    if (j.avoided) return t('today.teaser.avoided');
    return t('today.teaser.delve');
  }

  function begin(j: Job) {
    /* every job opens the set-up at one delve of 30 minutes; Dan sets the minutes and the delves (D-124) */
    go('set', j.id);
  }
  function done(j: Job) {
    const f = game.do({ do: 'done', job: j.id });
    /* a job with no whole minute behind it goes off the list and brings no return (rule 10, D-117) */
    const d = f.find(x => x.type === 'jobDone');
    /* its return, when there are minutes it hasn't shown before (said done again after "Not done after all", only the new
       ones, D-131) */
    if (d && d.type === 'jobDone' && d.minutes - takenBack(d.job, d.day) > 0) go('step', d.seq);
  }
  /* a delve job worked on today, not yet said to be done: "Is it done?" answered "Not yet", or left unanswered. Its Done
     is here, so it never needs another delve to be marked (Dan, 2026-09-27, D-120) */
  const delvedToday = $derived(new Set(game.facts.filter(f => f.type === 'delveStarted' && f.day === v.day).map(f => f.job)));
  const sayDone = (j: Job) => j.delve && j.doneBy === 'dan' && !v.done.has(j.id) && delvedToday.has(j.id);
  const delvedOn = $derived(!!next && sayDone(next));
  function carry() { game.do({ do: 'resume' }); go('delve'); }
  function finish() { game.do({ do: 'finishHere' }); go('delve'); }
  /* a tap on a job starts that job, never another: nothing on the list moves (Dan, D-100) */
  function start(id: string) { if (!v.done.has(id)) begin(job(id)); }
  function aside(id: string) { steady(); game.do({ do: 'setAside', job: id }); lastAside = id; }
  /* "Not today" said once, with a way to take it back while Today is still open (review 2, D-088) */
  let lastAside = $state<string | null>(null);
  function putBack() { if (lastAside) game.do({ do: 'putBack', job: lastAside }); lastAside = null; }
  /* after the day's work: a timed job still ahead today is named, so "done" never hides it (review 2) */
  const still = $derived(v.slate.filter(id => !v.done.has(id) && v.times[id]).map(id => `${job(id).name} ${t('row.at', { time: v.times[id] })}`));

  /* a row slides left to show "Not today" and "Delete"; a done row "Not done after all" and "Delete" (D-125, D-131) */
  function acts(j: Job) {
    const name = j.name;
    return v.done.has(j.id)
      ? [{ label: t('row.notDone'), sr: t('row.srNotDone', { job: name }), run: () => notDone(j.id) },
         { label: t('job.delete'), sr: t('row.srDelete', { job: name }), run: () => remove(j.id), del: true }]
      : [{ label: t('row.notToday'), sr: t('row.srAside', { job: name }), run: () => aside(j.id) },
         { label: t('job.delete'), sr: t('row.srDelete', { job: name }), run: () => remove(j.id), del: true }];
  }
  /* "Not done after all" (D-131): it is a job to do again; what it earned stays, and is never paid twice */
  /* the minutes a job's taken-back done record already counted today */
  const takenBack = (job: string, day: string) => undoneFacts(game.facts).filter(f => f.job === job && f.day === day).reduce((a, f) => Math.max(a, f.minutes), 0);
  function notDone(id: string) { steady(); game.do({ do: 'notDone', job: id }); }
  /* a done row: only that day's record goes (its minutes stay); otherwise the job (D-125) */
  function remove(id: string) { if (v.done.has(id)) game.removeDone(id, v.day); else game.remove(id); }

  /* the evening (D-093): going to bed lives on Today, no page of its own. From five hours before bedtime (when Go to
     sleep counts, D-083) Today carries "Tonight": the bedtime, one tap to change it, and Go to sleep. Once said, the
     night's line shows here until morning. */
  const evening = $derived(!v.night && pastBedtime(v.bedtime, game.now) >= -BEDTIME_WINDOW);
  /* in the last hour before bedtime, Tonight comes above the day's list, so going to bed is the next thing in view
     (D-130); before that it waits at the list's end */
  const BEDTIME_SOON = 60;
  const nearBed = $derived(evening && !v.complete && !v.run && pastBedtime(v.bedtime, game.now) >= -BEDTIME_SOON);
  const nightLine = $derived(v.night?.beat ? beatOf(content.story, v.night.beat)?.line ?? '' : '');
  /* the story ahead folds to a few lines, so the next job is always in view; a tap reads it all (D-093) */
  let aheadOpen = $state(false);

  /* "+ Add" (D-107) opens the Satchel's one box, ready to type in (D-131): focused inside the tap itself, so the phone's
     keyboard opens straight away */
  function add() {
    go('satchel');
    flushSync();
    document.querySelector<HTMLInputElement>('.satchel-add input')?.focus({ preventScroll: true });
  }

  /* Tonight, in the last hour before bed (D-131): what tomorrow starts with (prefilled with its first planned job; a tap
     changes it), and a line for anything on Dan's mind (into the Satchel). Both optional; skipped, nothing changes and
     nothing is said. */
  const lastHour = $derived(!v.night && pastBedtime(v.bedtime, game.now) >= -BEDTIME_SOON);
  const first = $derived(lastHour ? tomorrowFirst(content, game.facts, game.now) : null);
  let choosing = $state(false), mind = $state(''), mindSaid = $state(false);
  const choices = $derived.by(() => {
    if (!choosing || !first) return [] as string[];
    const s = satchelView(content, game.facts, game.now);
    return [...new Set([...first.planned, ...s.noDay.map(j => j.id), ...s.coming.map(x => x.job.id), ...s.recurring.map(j => j.id)])].filter(id => game.job(id));
  });
  function chooseFirst(id: string) { steady(); if (id !== first?.job) game.do({ do: 'firstJob', job: id }); choosing = false; }
  function putMind() {
    const line = mind.trim();
    if (!line) return;
    game.do({ do: 'addItems', lines: [line] }); mind = ''; mindSaid = true; setTimeout(() => (mindSaid = false), 4000);
  }
</script>

{#snippet tonight()}
  <div class="tonight">
    <div class="label-line gold">{t('today.tonight')}</div>
    <Bedtime />
    {#if lastHour && first}
      <!-- tomorrow's first job, and anything on Dan's mind (D-131): both optional, never asked twice -->
      <div class="first">
        <span class="first-say">{t('tonight.first')}</span>
        <button class="text-link first-job" aria-expanded={choosing} aria-label={t('tonight.first.label')} onclick={() => (choosing = !choosing)}><span>{first.job ? game.job(first.job)?.name ?? t('tonight.first.none') : t('tonight.first.none')}</span></button>
      </div>
      {#if choosing}
        <div class="choices" role="group" aria-label={t('tonight.first.label')}>
          {#each choices as id (id)}
            <button class="choice" aria-pressed={id === first.job} onclick={() => chooseFirst(id)}>{game.job(id)?.name}{#if first.planned.includes(id)}<small>{t('tonight.first.planned')}</small>{/if}</button>
          {/each}
        </div>
      {/if}
      <form class="mind" onsubmit={(e) => { e.preventDefault(); putMind(); }}>
        <input bind:value={mind} maxlength="120" enterkeyhint="done" aria-label={t('tonight.mind')} placeholder={t('tonight.mind')} />
        <button class="btn-quiet" type="submit" disabled={!mind.trim()}><span>{t('tonight.mind.put')}</span></button>
      </form>
      {#if mindSaid}<p class="soft said-mind" role="status">{t('tonight.mind.said')}</p>{/if}
    {/if}
    <p class="soft promise">{t('today.tonight.say', { bedtime: v.bedtime })}</p>
    <button class="btn gold resting" onclick={() => game.do({ do: 'goodnight' })}>{t('camp.goodnight')}</button>
  </div>
{/snippet}

<Scene painting={v.here.painting} framed bottom="50%" />
<div class="ui">
  <header class="top col">
    <div class="topbar bar rise">
      <span class="day">{weekday}</span>
      <span class="navs">
        <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
        {#if v.story.records.length}<button class="icon-link" onclick={() => go('records')}><span>{t('records.nav')}</span></button>{/if}
      <!-- the trial controls live at camp; here only while a rehearsal is on, so it can't be missed (D-080) -->
      {#if game.proto.rehearsal}<button class="icon-link proto" onclick={() => go('proto')}><span class="badge">{t('proto.badge')}</span></button>{/if}
      <!-- Settings: a small gear, Apple's usual place for it, out of the day's way (D-130; it was inside the Daybook) -->
      <button class="icon-link gear" aria-label={t('nav.settings')} onclick={() => go('settings')}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" /><circle cx="12" cy="12" r="6.4" /></svg></button>
      </span>
    </div>
    <h1 class="carve lg rise">{v.here.name}</h1>
    {#if v.ahead}
      <section class="ahead rise d2">
        <div class="label-line">{t('today.ahead')}</div>
        <button class="ahead-text" class:open={aheadOpen} aria-expanded={aheadOpen} onclick={() => (aheadOpen = !aheadOpen)}><p class="say on-scene">{v.ahead}</p></button>
      </section>
    {/if}
  </header>

  <div class="mid"></div>

  <section class="bottom fit col rise d3">
    <!-- on a short phone the day scrolls; the foot's links never leave the screen (review finding ui-11) -->
    <div class="scroll">
    <!-- while Dan types, the box stands alone above the keyboard: the next job and the list come back when he is done
         (Dan, 2026-09-27: the under-way job's words were drawn over the box) (D-120) -->
    {#if nearBed}<section class="tonight-top">{@render tonight()}</section>{/if}
    {#if v.night && !v.run}
      <div class="next">
        <div class="label-line gold">{t('today.tonight')}</div>
        <h2 class="say-lg">{t('camp.night')}</h2>
        {#if nightLine}<p class="say night-line">{nightLine}</p>{/if}
        <p class="soft">{v.night.kept ? t('camp.sleep.kept') : t('camp.sleep.late', { bedtime: v.bedtime })}</p>
      </div>
    {:else if v.next?.mode === 'carry' && v.run}
      <div class="next">
        <div class="label-line lit">{t('today.next')}</div>
        <h2 class="say-lg">{t('today.carry', { job: v.run.job.name })}</h2>
        <p class="soft">{t('today.carry.left', { min: minutesWords(Math.max(1, Math.ceil(v.run.leftMs / 60000))) })}</p>
        <div class="btn-row lead">
          <button class="btn" onclick={carry}>{t('today.carry.go')}</button>
          <button class="btn-quiet" onclick={finish}><span>{t('today.finishHere')}</span></button>
        </div>
      </div>
    {:else if v.next?.mode === 'running' && v.run}
      <!-- a delve running while Dan looks at Today: one way back to it, nothing else (review finding, D-080) -->
      <div class="next">
        <div class="label-line lit">{t('today.underWay')}</div>
        <h2 class="say-lg">{v.run.job.name}</h2>
        <p class="soft">{t('today.running.say')}</p>
        <div class="lead"><button class="btn full" onclick={() => go('delve')}>{t('today.running.go')}</button></div>
        <div class="gap"></div>
      </div>
    {:else if v.next && next}
      <div class="next">
        <div class="label-line lit">{t('today.next')}</div>
        <h2 class="say-lg">{next.name}{#if v.times[next.id]}<span class="at"> · {v.times[next.id]}</span>{/if}</h2>
        <p class="soft">{teaser(next)}</p>
        <div class="lead"><button class="btn full" onclick={() => begin(next)}>{t('today.delve')}</button></div>
        <div class="cant">
          {#if delvedOn}<button class="text-link" onclick={() => done(next)}><span>{t('today.itsDone')}</span></button>
          {:else}<button class="text-link" onclick={() => go('cant', next.id)}><span>{t('today.cantStart')}</span></button>{/if}
          <span class="dot" aria-hidden="true">·</span>
          <button class="text-link" onclick={() => aside(next.id)}><span>{t('today.notToday')}</span></button>
        </div>
      </div>
    {:else if !v.complete}
      <div class="next">
        <div class="label-line lit">{t('today.label')}</div>
        <h2 class="say-lg">{t('today.clear')}</h2>
        <p class="soft">{t('today.clear.say')}</p>
        <div class="gap"></div>
      </div>
    {:else}
      <div class="next">
        <div class="label-line gold">{t('today.label')}</div>
        <h2 class="say-lg">{t('today.enough')}</h2>
        {#if lastPlace}
          <p class="soft">{t(lastPlace.kind === 'place' ? 'today.reached' : 'today.camped', { place: inSentence(lastPlace.name) })}</p>
        {/if}
        {#if still.length}<p class="soft still">{t('today.stillToCome', { what: still.join(', ') })}</p>{/if}
        {#if evening}{@render tonight()}{/if}
        <div class="btn-row after"><button class="btn-quiet" onclick={() => go('satchel')}><span>{t('today.keepGoing')}</span></button></div>
        <!-- the one promise past the finish line: more work reaches the deep moments (D-127), said once, quietly (D-130) -->
        <p class="soft deeper">{t('today.deeper')}</p>
        {#if lastPlace}<div class="cant"><button class="text-link" onclick={() => go('arrival')}><span>{t('today.look')}</span></button></div>{/if}
        <div class="gap"></div>
      </div>
    {/if}

    <Deleted />
    {#if lastAside && !v.order.includes(lastAside) && !v.done.has(lastAside)}
      <p class="said">{t('today.aside.said')} <button class="text-link" onclick={putBack}><span>{t('today.putBack')}</span></button></p>
    {/if}
    {#snippet jobRow(id: string)}
      {@const j = job(id)}
      <SwipeRow key={`t:${id}`} actions={acts(j)} tap={() => start(id)} hold={() => openMenu(id, go, v.done.has(id) ? v.day : null)} disabled={!!v.run} done={v.done.has(id)}>
        {#snippet row()}<span class="pip" class:done={v.done.has(id)}></span><span class="t">{j.name}</span><span class="s">{sayDone(j) ? '' : rowNote(j)}</span>{/snippet}
        <!-- the same "It's done" on a row further down: a tap on the row itself still starts a delve (D-100, D-120) -->
        {#snippet over()}{#if sayDone(j) && !v.run}<button class="text-link row-done" onclick={() => done(j)}><span>{t('today.itsDone')}</span></button>{/if}{/snippet}
      </SwipeRow>
    {/snippet}
    <div class="rows">
      {#each others as id (id)}{@render jobRow(id)}{/each}
      {#if !v.run && v.next?.mode !== 'underWay' && !(v.complete && !v.next)}
        <button class="row else" onclick={() => go('satchel')}>
          <span class="plus" aria-hidden="true">+</span><span class="t">{t('today.else')}</span><span class="s"></span>
        </button>
      {/if}
    </div>
    <!-- past the finish line: the day's other jobs, for a day with room (D-131); doing more goes deeper (D-127) -->
    {#if extra.length}
      <div class="label-line if-time">{t('today.ifTime')}</div>
      <div class="rows">{#each extra as id (id)}{@render jobRow(id)}{/each}</div>
    {/if}
    <!-- the evening, before the day's work is done: Tonight at the end of the day's list (D-093) -->
    {#if evening && !v.complete && !v.run && !nearBed}<section class="tonight-end">{@render tonight()}</section>{/if}
    </div>
    <nav class="foot" aria-label={t('today.label')}>
      <button class="text-link add" aria-label={t('today.add.label')} onclick={add}><span>{t('today.add')}</span></button>
      <!-- the jobs with no day, by day and at night (D-126) -->
      <button class="text-link" onclick={() => go('satchel')}><span>{t('nav.satchel')}</span></button>
      <button class="text-link" onclick={() => go('week')}><span>{t('nav.week')}</span></button>
      <button class="text-link" onclick={() => go('daybook')}><span>{t('nav.daybook')}</span></button>
    </nav>
  </section>
</div>

<style>
  h1 { margin-top: 2px; }
  .ahead { margin-top: 12px; }
  .ahead p { font-size: 17.5px; line-height: 1.38; margin-top: 6px; }
  .ahead-text { display: block; width: 100%; padding: 0; background: none; border: 0; text-align: left; cursor: pointer; color: inherit; }
  .ahead-text:not(.open) p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; }
  .tonight-end { margin-top: 18px; }
  .tonight-top { margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--edge-2); }
  .tonight { margin: 4px 0 6px; }
  .next .tonight .promise { text-align: left; margin: 6px 0 14px; }
  .tonight .promise { text-align: left; margin: 6px 0 14px; }
  .night-line { font-style: italic; color: #fff; margin: 8px 0 10px; line-height: 1.45; }
  .bottom { padding-top: 8px; }
  .next h2 { margin: 8px 0 4px; }
  .next .soft { margin-bottom: 18px; }
  .cant { display: flex; justify-content: center; align-items: center; gap: 2px; margin-top: 4px; }
  .cant .dot { color: var(--ink-3); }
  .gap { height: 12px; }
  .after { margin-top: 12px; }
  .next .soft.deeper { font-style: italic; margin: 8px 0 4px; }
  .rows { margin-top: 2px; }
  button.row { width: 100%; text-align: left; }
  .lead .btn.full { width: 100%; }
  .rows :global(.row-done) { min-height: 40px; padding: 0 0 0 12px; }
  .rows :global(.row-done span) { font-size: 16px; color: var(--violet-hi); }
  .if-time { margin: 18px 0 4px; }
  .first { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin-top: 8px; }
  .first-say { font-family: var(--life); font-size: 18px; color: var(--ink-2); }
  .first-job span { font-size: 18px; color: #fff; }
  .choices { display: flex; flex-direction: column; margin: 4px 0 6px; border-top: 1px solid var(--edge-4); }
  .choice { text-align: left; min-height: 44px; padding: 8px 4px; border-bottom: 1px solid var(--edge-4); font-family: var(--life); font-size: 17px; color: var(--ink); }
  .choice[aria-pressed='true'] { color: var(--gold); }
  .choice small { display: block; font-style: italic; font-size: 14px; color: var(--ink-3); }
  .mind { display: flex; gap: 10px; margin: 10px 0 2px; }
  .mind input { flex: 1; min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: 17px; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .mind .btn-quiet { padding: 0 14px; }
  .mind .btn-quiet:disabled { opacity: .5; }
  .said-mind { font-style: italic; margin: 4px 0 0; text-align: left; }
  .row.else .t { color: var(--ink-2); font-style: italic; }
  .plus { justify-self: center; color: var(--violet-hi); font-size: 20px; line-height: 1; }
  button.row:disabled { cursor: default; }
  .at { color: var(--ink-2); font-size: .8em; }
  .still { margin: -12px 0 16px; }
  .said { font-family: var(--life); font-style: italic; font-size: 15.5px; color: var(--ink-2); display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 2px 6px; margin: -6px 0 6px; }
  .said .text-link { min-height: 0; padding: 4px; }
  .foot .add span { color: var(--violet-hi); }
  .foot { display: flex; justify-content: space-around; margin: 6px -10px 0; }
  .foot span { font-size: 14px; letter-spacing: .1em; color: var(--ink-2); }
  .proto span { font-size: 14px; letter-spacing: .16em; color: var(--ink-3); }
  /* the day on the left; the map, records and the prototype's own link together on the right */
  .bar { display: flex; justify-content: space-between; }
  /* on a narrow bar the rehearsal badge takes a line of its own, never pushing the screen wider (Dan, review 2) */
  .bar { gap: 8px; align-items: flex-start; }
  .navs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0 4px; align-items: center; margin-right: -10px; min-width: 0; }
  .navs span { font-size: 14px; letter-spacing: .12em; color: var(--ink-2); }
  .proto .badge { color: var(--gold); }
  .gear { min-width: 44px; justify-content: center; }
  .gear svg { width: 20px; height: 20px; fill: none; stroke: var(--ink-2); stroke-width: 1.6; stroke-linecap: round; }
  @media (max-height: 800px) {
    .ahead { margin-top: 8px; } .ahead p { margin-top: 4px; } .next .soft { margin-bottom: 14px; }
    :global(.row) { min-height: 44px; }
  }
</style>
