<script lang="ts">
  import Prose from './Prose.svelte';
  import Deleted from './Deleted.svelte';
  import Bedtime from './Bedtime.svelte';
  import SwipeRow from './SwipeRow.svelte';
  import { openMenu, openTick, waited, sayWaited, menu } from './menu.svelte';
  import WaitPick from './WaitPick.svelte';
  import { undoneFacts } from '../core/done';
  import { steady } from './taps';
  /* Today (the morning screen, UX_PRINCIPLES → "The morning screen carries"): where you are (a tap on its name reads it
     again), the sealed thing ahead, one button to add a job, and the day's jobs as one list, none put forward (Dan, D-135).
     A tap on a row starts that job, as its own button would (D-100: it used to swap the row with the next job, and the
     rows seemed to change places by themselves); a swipe takes it off today; the last row chooses a delve on anything (D-077). After day complete: the day as done, until Dan taps a job or keeps going.
     Mock-up: design/directions/d-combined/morning.html. */
  import { game, content } from './game.svelte';
  import { pastBedtime, BEDTIME_WINDOW, tomorrowFirst, firstChosen, satchelView, carriedOf, weekCount } from '../core/game';
  import { tieFor } from '../core/remember';
  import { leaveWord, moment } from './moment.svelte';
  import { ofLine } from './panel';
  import { beatOf } from '../core/story';
  import type { FactOf, Job } from '../core/types';
  import { t, minutesWords, minutesShort, inSentence, dayShort, type Weekday } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import EndRoad from './EndRoad.svelte';
  import WeekMarks from './WeekMarks.svelte';
  import { flushSync } from 'svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.whole);
  const job = (id: string) => game.job(id)!;
  const weekday = $derived(t(`day.${new Date(Date.UTC(+v.day.slice(0, 4), +v.day.slice(5, 7) - 1, +v.day.slice(8, 10))).getUTCDay() as Weekday}`));
  /* the finish line's jobs (its first 3 hours, D-131), then the rest, "If there's time" */
  /* the jobs still to do first, then those done (on a list with no job put forward, the next one is its top row, D-135);
     a delve running or paused is on its own card, not the list */
  const todoFirst = (ids: string[]) => [...ids.filter(id => !v.done.has(id)), ...ids.filter(id => v.done.has(id))].filter(id => id !== v.run?.job.id);
  const others = $derived(todoFirst(v.line));
  const extra = $derived(todoFirst(v.slate.filter(id => !v.line.includes(id))));
  /* the last place reached (never a camp): its entry, read again from its name (D-135) */
  const placeSeq = $derived(game.facts.filter(f => f.type === 'arrived' && f.kind === 'place').pop()?.seq ?? null);
  const lastPlace = $derived(v.lastArrival);

  const recurring = (id: string) => v.content.rhythms.some(r => r.job === id);
  /* minutes into the game day, which turns at 04:00: 01:00 comes after 18:00 (review of D-144) */
  const fromFour = (hm: string) => ((+hm.slice(0, 2) + 20) % 24) * 60 + +hm.slice(3, 5);
  function rowNote(j: Job): string {
    if (v.done.has(j.id)) return t('row.done');
    /* an errand of the run under way, or of one whose "What got done?" waits: said so (deep review H#10) */
    if (v.run?.errands?.some(e => e.job.id === j.id) || v.runEnd?.errands?.some(e => e.job.id === j.id)) return t('row.inErrand');
    /* an appointment gone by is noticed, never scolded (L C5) */
    if (v.times[j.id]) return fromFour(game.now.slice(11, 16)) > fromFour(v.times[j.id]) ? t('row.wentBy', { time: v.times[j.id] }) : v.times[j.id];
    /* every job is a delve (D-117), so a row never says "a delve". A recurring job says its usual minutes, which Dan set
       for it; a one-off says the minutes it already has ("27 min so far", D-143 D), else nothing: never a number
       nobody chose (J2) */
    return recurring(j.id) ? minutesShort(j.length) : '';
  }
  /* under a one-off's name, beside its "It's done" (J2, J10) */
  const soFar = (j: Job) => { if (v.done.has(j.id) || recurring(j.id)) return ''; const m = carriedOf(game.facts, v.content, j.id); return m > 0 ? t('row.sofar', { min: minutesShort(m) }) : ''; };

  function begin(j: Job) {
    /* the set-up: a one-off at one delve of 30 minutes (D-124), a recurring job at its own minutes (D-146) */
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
  const delvedToday = $derived(new Set(game.facts.filter((f): f is FactOf<'delveStarted'> => f.type === 'delveStarted' && f.day === v.day).map(f => f.job)));
  const sayDone = (j: Job) => j.delve && j.doneBy === 'dan' && !v.done.has(j.id) && delvedToday.has(j.id);
  function carry() { game.do({ do: 'resume' }); go('delve'); }
  function finish() { game.do({ do: 'finishHere' }); go('delve'); }
  /* a tap on a job starts that job, never another: nothing on the list moves (Dan, D-100) */
  /* a job not yet done can be ticked off, done without a delve (D-134); not while a delve runs */
  /* a delve under way, or an errand run's "What got done?" still waiting: anything that counts a job would count it first */
  const busy = $derived(!!v.run || !!v.runEnd?.pending);
  const canTick = (id: string) => !v.done.has(id) && !busy;
  /* during a delve another job can be edited, moved or deleted, never started (D-143 E): a tap opens its menu. A done
     recurring job opens its menu too (Delve again, Not done after all, J11); a done one-off is finished */
  function start(id: string) {
    if (v.done.has(id)) { if (recurring(id)) openMenu(id, go, v.day, null, 'today'); return; }
    if (v.run || v.runEnd?.pending) { openMenu(id, go, null, null, 'today'); return; }
    begin(job(id));
  }
  function aside(id: string) { steady(); game.do({ do: 'setAside', job: id }); }
  /* "Not today": the row stays, struck, with "Put back", for the rest of the day (J7; was only while Today stayed open) */
  function putBack(id: string) { steady(); game.do({ do: 'putBack', job: id }); }
  /* after the day's work: a timed job still ahead today is named, so "done" never hides it (review 2) */
  const stillToCome = $derived(v.slate.filter(id => !v.done.has(id) && v.times[id]).map(id => `${job(id).name} ${t('row.at', { time: v.times[id] })}`));

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
  /* a recurring job deleted with its plan asks first, as the job menu does (H#9) */
  function remove(id: string) { if (v.done.has(id)) game.removeDone(id, v.day); else if (recurring(id)) openMenu(id, go, null, null, 'today', true); else game.remove(id); }

  /* a one-off waiting on a reply, back on its day (D-137): "Did they reply?" Back to it · Still waiting (a new date) ·
     It's done (ticked off, with the time it took). Unanswered, it simply stays here; it never holds the day back */
  let still = $state<string | null>(null);
  function backToIt(id: string, today = false) { steady(); still = null; game.do({ do: 'backToIt', job: id, ...(today ? { today } : {}) }); }
  function stillWaiting(id: string, until: string, who: string) { steady(); still = null; game.do({ do: 'waitOn', job: id, until, who }); sayWaited(id, until, true); }
  const replyActs = (j: Job) => [{ label: t('job.delete'), sr: t('row.srDelete', { job: j.name }), run: () => remove(j.id), del: true }];
  /* the job just set waiting: where it went, and the way back (D-137); said only on this visit */
  $effect(() => () => sayWaited(null));
  const waitedJob = $derived(waited.job && !v.replies.some(r => r.job === waited.job) && !v.slate.includes(waited.job) ? game.job(waited.job) : undefined);

  /* the evening (D-093): going to bed lives on Today, no page of its own. From five hours before bedtime (when Go to
     sleep counts, D-083) Today carries "Tonight": the bedtime, one tap to change it, and Go to sleep. Once said, the
     night's line shows here until morning. */
  const evening = $derived(!v.night && pastBedtime(v.bedtime, game.now) >= -BEDTIME_WINDOW);
  /* in the last hour before bedtime, Tonight comes above the day's list, so going to bed is the next thing in view
     (D-130); before that it waits at the list's end */
  const BEDTIME_SOON = 60;
  const nearBed = $derived(evening && !v.complete && !v.run && pastBedtime(v.bedtime, game.now) >= -BEDTIME_SOON);
  const nightLine = $derived(v.night?.beat ? beatOf(content.story, v.night.beat)?.line ?? '' : '');
  /* where Dan is on this stretch (Dan, D-140): the delve's end's road line, still, with the minutes still to go to
     the side chamber (while it holds a find) and to the next place; nothing moves on it here */
  const roadNotes = $derived({
    ...(v.toChamber !== null && v.toChamber > 0 ? { side: minutesShort(v.toChamber) } : {}),
    ...(v.toNext !== null && v.toNext > 0 ? { place: minutesShort(v.toNext) } : {}),
  });
  const roadSay = $derived([
    ...(roadNotes.place ? [t('today.road.place', { min: roadNotes.place })] : []),
    ...(roadNotes.side ? [t('today.road.side', { min: roadNotes.side })] : []),
  ].join(', '));
  /* the story ahead folds to a few lines, so the next job is always in view; a tap reads it all (D-093) */
  let aheadOpen = $state(false);
  let keysOpen = $state(false);
  /* "Use one here": asked once, then the Key is used on what is locked where Dan is, as a job's return offers (H#8) */
  let keyAsk = $state(false);
  function useHere() { const id = v.keyHere; keyAsk = false; if (!id) return; steady(); game.do({ do: 'useKey', seal: id }); go('opened', id); }

  /* the errand run (D-139): quietly at the list's end, when two jobs or more could go on one trip out */
  /* the day's first start (a delve begun, or a job ticked off) puts the line away */
  const started = $derived(game.facts.some(f => (f.type === 'delveStarted' || f.type === 'jobDone') && f.day === v.day));
  const chosenFirst = $derived.by(() => { const id = firstChosen(game.facts, v.day); return id && !started && !busy && !v.night && !v.done.has(id) && game.job(id) ? id : null; });
  const cantFor = $derived(started || busy || v.night || v.complete ? null
    : v.line.find(id => !v.done.has(id) && game.job(id)?.avoided) ?? v.line.find(id => !v.done.has(id)) ?? null);

  /* "Add a job" opens the Satchel's one box, ready to type in (D-131), whose Return puts the job on today (Dan, D-143 C):
     focused inside the tap itself, so the phone's keyboard opens straight away */
  function add() {
    go('satchel', 'today');
    flushSync();
    document.querySelector<HTMLInputElement>('.satchel-add input')?.focus({ preventScroll: true });
  }

  /* Tonight, in the evening (D-131; all evening since MORNING-REPORT Part 3 #5): what tomorrow starts with (prefilled with its first planned job; a tap
     changes it), and a line for anything on Dan's mind (into the Satchel). Both optional; skipped, nothing changes and
     nothing is said. */
  /* offered all evening, as Tonight is, not only in its last hour (MORNING-REPORT Part 3 #5) */
  const lastHour = $derived(evening);
  const first = $derived(lastHour ? tomorrowFirst(content, game.facts, game.minute) : null);
  let choosing = $state(false), mind = $state(''), mindSaid = $state(false);
  const choices = $derived.by(() => {
    if (!choosing || !first) return [] as string[];
    const s = satchelView(content, game.facts, game.minute);
    return [...new Set([...first.planned, ...s.noDay.map(j => j.id), ...s.coming.map(x => x.job.id), ...s.recurring.map(j => j.id)])].filter(id => game.job(id));
  });
  function chooseFirst(id: string) { steady(); if (id !== first?.job) game.do({ do: 'firstJob', job: id }); choosing = false; }
  let mindHave = $state<string | null>(null);
  function putMind() {
    const line = mind.trim();
    if (!line) return;
    /* a job Dan already has is not added twice (J4): it says so */
    const tie = tieFor(content, game.facts, line);
    mindHave = tie?.same ? tie.job.name : null;
    game.do({ do: 'addItems', lines: [line] }); mind = ''; mindSaid = true;
    /* one timer, cleared before a new one and when Today goes (deep review C#14) */
    clearTimeout(mindTimer); mindTimer = setTimeout(() => (mindSaid = false), 4000);
  }
  let mindTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => () => clearTimeout(mindTimer));
  /* the avoided job, the only one left on the line: said, once it is all that holds the day (Dan, D-143 G) */
  const onlyAvoided = $derived.by(() => {
    const left = v.line.filter(id => !v.done.has(id));
    return !v.complete && !v.run && left.length === 1 && v.line.length > 1 && game.job(left[0])?.avoided ? game.job(left[0])!.name : null;
  });
  /* "Press and hold a job for more", said until the first time the job menu is opened (J19) */
  let held = $state(holdSeen());
  function holdSeen() { try { return localStorage.getItem('hint.hold') === '1'; } catch { return true; } }
  /* the menu found while Today is open: the hint goes once the menu closes, not at the next visit, and never while the
     finger is still down (the rows under it would move, D-131) (review of D-144) */
  let menuOpened = false;
  $effect(() => { if (menu.job) menuOpened = true; else if (menuOpened) held = true; });
  const holdHint = $derived(!held && !v.run && others.length > 0);
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
      {#if mindSaid}<p class="soft said-mind" role="status">{mindHave ? t('park.have', { job: mindHave }) : t('tonight.mind.said')}</p>{/if}
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
    <!-- the place's name: a tap reads its entry again, with its painting, at any time of day (Dan, D-135) -->
    {#if placeSeq !== null && v.here.id}<h1 class="carve lg rise"><button class="here" aria-describedby="here-again" onclick={() => go('arrival', `again:${placeSeq}`)}>{v.here.name}</button></h1><span id="here-again" class="sr-only">{t('map.readHere')}</span>
    {:else}<h1 class="carve lg rise">{v.here.name}</h1>{/if}
    <section class="where rise d2" aria-label={roadSay || undefined}>
      <EndRoad road={v.road} from={v.walked} to={v.walked} mode="still" notes={roadNotes} spoken={false} />
    </section>
    <!-- the Keys kept (Dan, D-142): always in view; a tap says what they are for. One line, with one Key link at most
         (deep review H#8, D simplify 2): with something locked where Dan is, "Use one here" asks once (Use it here · Keep
         it) and opens it here; else the Map, where it is behind him -->
    <div class="key-line rise d2">
      <button class="keys" aria-expanded={keysOpen} onclick={() => (keysOpen = !keysOpen)}>
        <svg viewBox="0 0 24 12" aria-hidden="true"><circle cx="5" cy="6" r="3.6" /><path d="M8.6 6H22M18 6v3.4M21.4 6v2.6" /></svg>
        <span>{v.keys === 0 ? t('today.keys.none') : v.keys === 1 ? t('today.keys.one') : t('today.keys.many', { n: v.keys })}</span>
      </button>
      {#if v.keyHere}<span class="dot" aria-hidden="true">·</span><button class="text-link key-use" aria-expanded={keyAsk} onclick={() => (keyAsk = !keyAsk)}><span>{t(v.keys > 1 ? 'today.keys.hereMany' : 'today.keys.here')}</span></button>
      {:else if v.keyUse}<span class="dot" aria-hidden="true">·</span><button class="text-link key-use" onclick={() => go('map', v.keyUse!)}><span>{t('today.behindMap')}</span></button>{/if}
    </div>
    {#if keyAsk && v.keyHere}<div class="key-ask rise"><button class="text-link use" onclick={useHere}><span>{t('step.useHere')}</span></button><button class="text-link" onclick={() => (keyAsk = false)}><span>{t('step.keepIt')}</span></button></div>{/if}
    {#if keysOpen}<p class="soft keys-say">{t('today.keys.say')}{#if v.keys} {t('today.keys.useOnMap')}{/if}</p>{/if}
    {#if v.ahead}
      <section class="ahead rise d2">
        <!-- a locked thing left behind is never called "ahead": it is behind him, and on the Map (S3, D-143) -->
        <div class="label-line">{v.aheadBehind ? t('today.behind') : v.aheadHere ? t('today.here') : t('today.ahead')}{#if v.aheadKey}<span class="needs-key"> · {t('today.aheadKey')}</span>{/if}</div>
        <!-- read as words, never as a button whose name is the whole passage (A#38): VoiceOver reads it all anyway; a tap
             unfolds it for the eye -->
        <div class="ahead-text" class:open={aheadOpen} role="presentation" onclick={() => (aheadOpen = !aheadOpen)}><p class="say on-scene"><Prose text={v.ahead} /></p></div>
        {#if v.aheadBehind && !v.keyUse}<p class="behind-map"><button class="text-link" onclick={() => go('map', v.aheadBehind!)}><span>{t('today.behindMap')}</span></button></p>{/if}
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
        {#if nightLine}<p class="say night-line"><Prose text={nightLine} /></p>{/if}
        <p class="soft">{v.night.kept ? t('camp.sleep.kept') : t('camp.sleep.late', { bedtime: v.bedtime })}</p>
      </div>
    {:else if v.next?.mode === 'carry' && v.run}
      <div class="next">
        <div class="label-line lit">{t('today.next')}</div>
        <h2 class="say-lg">{t('today.carry', { job: v.run.job.name })}</h2>
        <!-- which of the run's delves, as the delve screen says (J18) -->
        {#if v.run.count > 1}<p class="soft of">{ofLine(v.run, v.run.k, false)}</p>{/if}
        <p class="soft">{t('today.carry.left', { min: minutesWords(Math.max(1, Math.ceil(v.run.leftMs / 60000))) })}</p>
        <div class="btn-row lead">
          <button class="btn" onclick={carry}>{t('today.carry.go')}</button>
          <button class="btn-quiet" onclick={finish}><span>{t('today.finishHere')}</span></button>
        </div>
        <!-- another job can be added during a delve (D-143 E) -->
        <div class="cant"><button class="text-link today-add" onclick={add}><span>{t('today.addJob')}</span></button></div>
      </div>
    {:else if v.next?.mode === 'running' && v.run}
      <!-- a delve running while Dan looks at Today: one way back to it, nothing else (review finding, D-080) -->
      <div class="next">
        <div class="label-line lit">{t('today.underWay')}</div>
        <h2 class="say-lg">{v.run.job.name}</h2>
        <p class="soft">{t('today.running.say')}</p>
        <div class="lead"><button class="btn full" onclick={() => go('delve')}>{t('today.running.go')}</button></div>
        <div class="cant"><button class="text-link today-add" onclick={add}><span>{t('today.addJob')}</span></button></div>
        <div class="gap"></div>
      </div>
    {:else if v.runEnd?.pending}
      <!-- an errand run's "What got done?", left by the arrow: it waits here, never counted behind Dan's back (J1) -->
      <div class="next">
        <div class="label-line lit">{t('errand.title')}</div>
        <h2 class="say-lg">{t('errand.waits')}</h2>
        <div class="lead"><button class="btn full" onclick={() => go('delve')}>{t('errand.waitsGo')}</button></div>
        <div class="gap"></div>
      </div>
    {:else if !v.complete}
      <!-- no job is put forward (Dan, D-135): the day's jobs are one list below, each started, ticked off or set aside
           from its row; the one button adds a job (the Satchel's box, ready to type) -->
      <div class="next addcard">
        <div class="label-line lit">{t('today.label')}</div>
        {#if !v.slate.some(id => !v.done.has(id))}
          <h2 class="say-lg">{t('today.clear')}</h2>
          <p class="soft">{t('today.clear.say')}</p>
        {/if}
        <div class="lead"><button class="btn full today-add" onclick={add}>{t('today.addJob')}</button></div>
      </div>
    {:else}
      <div class="next">
        <div class="label-line gold">{t('today.label')}</div>
        <h2 class="say-lg">{t('today.enough')}</h2>
        {#if lastPlace}
          <p class="soft">{t(lastPlace.kind === 'place' ? 'today.reached' : 'today.camped', { place: inSentence(lastPlace.name) })}</p>
        {/if}
        {#if stillToCome.length}<p class="soft still">{t('today.stillToCome', { what: stillToCome.join(', ') })}</p>{/if}
        {#if evening}{@render tonight()}{/if}
        <div class="btn-row after"><button class="btn-quiet" onclick={() => go('satchel')}><span>{t('today.keepGoing')}</span></button></div>
        <p class="soft to-satchel">{t('today.keepGoingSay')}</p>
        <!-- the one promise past the finish line: more work reaches the deep moments (D-127), said once, quietly (D-130) -->
        <p class="soft deeper">{t('today.deeper')}</p>
        {#if lastPlace}<div class="cant"><button class="text-link" onclick={() => go('arrival')}><span>{t('today.look')}</span></button></div>{/if}
        <div class="gap"></div>
      </div>
    {/if}

    <Deleted />
    <!-- a word left to cut later (A2), and a Daybook page written after days away (D-143 F): quiet lines back to them -->
    <!-- a tick taken back (B3): said once, plainly; nothing reached is taken away -->
    {#if v.owed}<p class="said owed">{t('today.owed', { taken: minutesShort(v.owed.taken), left: minutesShort(v.owed.left) })}</p>{/if}
    {#if v.arrival && v.arrival.seq === moment.wordLater}<p class="said waits"><button class="text-link" onclick={() => { leaveWord(0); go('arrival'); }}><span>{t('today.wordWaits')}</span></button></p>{/if}
    {#if v.close}<p class="said waits"><button class="text-link" onclick={() => go('daybook')}><span>{t('today.pageWaits')}</span></button></p>{/if}
    {#if onlyAvoided}<p class="said only" role="status">{t('today.onlyAvoided', { job: onlyAvoided })}</p>{/if}
    {#if waitedJob}
      <p class="said" role="status">{t('wait.said', { job: waitedJob.name, day: dayShort(waited.until) })} <button class="text-link" aria-label={t('wait.srBack', { job: waitedJob.name })} onclick={() => { backToIt(waitedJob.id, waited.today); sayWaited(null); }}><span>{t('wait.back')}</span></button></p>
    {/if}
    {#snippet jobRow(id: string)}
      {@const j = job(id)}
      {@const wk = weekCount(v.content, game.facts, v.day, id)}
      <SwipeRow key={`t:${id}`} actions={acts(j)} tap={() => start(id)} hold={() => openMenu(id, go, v.done.has(id) ? v.day : null, null, 'today')} done={v.done.has(id)} quiet={v.done.has(id) && !recurring(id)}>
        {#snippet row()}<span class="pip" class:done={v.done.has(id)} class:under={canTick(id)}></span><span class="t" class:putoff={j.avoided && v.findWaits && !v.done.has(id)}>{j.name}{#if soFar(j)}<small>{soFar(j)}</small>{/if}{#if wk}<WeekMarks done={wk.done} need={wk.need} gold={v.done.has(id)} />{/if}</span>{#if wk}<span class="sr-only">{t('rhythms.weekCount', { n: wk.done, need: wk.need })}</span>{/if}{#if j.avoided && v.findWaits && !v.done.has(id)}<span class="sr-only">{t('row.findWaits')}</span>{/if}<span class="s">{sayDone(j) ? '' : rowNote(j)}</span>{/snippet}
        <!-- the same "It's done" on a row further down: a tap on the row itself still starts a delve (D-100, D-120) -->
        <!-- the tick circle over the marker: done without a delve, with the time it took (D-134) -->
        {#snippet lead()}{#if canTick(id)}<button class="tickbtn" aria-label={t('tick.sr', { job: j.name })} onclick={() => openTick(id, go)}><span class="ring"></span></button>{/if}{/snippet}
        {#snippet over()}{#if sayDone(j) && !busy}<button class="text-link row-done" onclick={() => done(j)}><span>{t('today.itsDone')}</span></button>{/if}{/snippet}
      </SwipeRow>
    {/snippet}
    <!-- last night's own choice starts the day, until it is started (MORNING-REPORT Part 3 #5) -->
    {#if chosenFirst}<p class="soft chosen-first">{t('today.chosenFirst', { job: job(chosenFirst).name })} <span aria-hidden="true">·</span> <button class="text-link" aria-label={t('today.chosenBegin', { job: job(chosenFirst).name })} onclick={() => go('set', chosenFirst)}><span>{t('set.begin')}</span></button></p>{/if}
    <div class="rows">
      {#each others as id (id)}{@render jobRow(id)}{/each}
    </div>
    {#if holdHint}<p class="soft hold-hint">{t('today.holdHint')}</p>{/if}
    <!-- taken off today: still here, struck, with Put back, all day (J7) -->
    {#if v.aside.length}
      <div class="rows aside">
        {#each v.aside as id (id)}
          <div class="row still aside-row"><span class="pip"></span><span class="t">{job(id).name}</span><span class="s">{t('row.notToday')}</span></div>
          <div class="put-back"><button class="text-link" aria-label={t('today.srPutBack', { job: job(id).name })} onclick={() => putBack(id)}><span>{t('today.putBack')}</span></button></div>
        {/each}
      </div>
    {/if}
    <!-- back from waiting on a reply (D-137): under the day's list, never on it -->
    {#if v.replies.length}
      <div class="rows replies">
        {#each v.replies as r (r.job)}
          {@const j = job(r.job)}
          <div class="reply">
            <SwipeRow key={`r:${r.job}`} actions={replyActs(j)} tap={() => start(r.job)} hold={() => openMenu(r.job, go, null, null, 'today')}>
              {#snippet row()}<span class="pip" class:under={canTick(r.job)}></span><span class="t">{j.name}{#if r.who}<small>{t('wait.onNow', { who: r.who })}</small>{/if}</span><span class="s"></span>{/snippet}
              {#snippet lead()}{#if canTick(r.job)}<button class="tickbtn" aria-label={t('tick.sr', { job: j.name })} onclick={() => openTick(r.job, go)}><span class="ring"></span></button>{/if}{/snippet}
            </SwipeRow>
            <p class="ask">{t('wait.ask')}</p>
            <div class="reply-acts">
              <button class="text-link" aria-label={t('wait.srBack', { job: j.name })} disabled={busy} onclick={() => backToIt(r.job)}><span>{t('wait.back')}</span></button>
              <button class="text-link" aria-label={t('wait.srStill', { job: j.name })} aria-expanded={still === r.job} disabled={busy} onclick={() => (still = still === r.job ? null : r.job)}><span>{t('wait.still')}</span></button>
              <button class="text-link" aria-label={t('wait.srDone', { job: j.name })} disabled={busy} onclick={() => openTick(r.job, go)}><span>{t('wait.done')}</span></button>
            </div>
            {#if still === r.job}<WaitPick day={v.day} who={r.who ?? ''} name={j.name} pick={(u, w) => stillWaiting(r.job, u, w)} />{/if}
          </div>
        {/each}
      </div>
    {/if}
    <!-- past the finish line: the day's other jobs, for a day with room (D-131); doing more goes deeper (D-127) -->
    {#if extra.length}
      <div class="label-line if-time">{t('today.ifTime')}</div>
      <div class="rows">{#each extra as id (id)}{@render jobRow(id)}{/each}</div>
    {/if}
    <!-- "Can't get started?" until the day's first start: "I can't start" for the first job on the line, one put off first
         (MORNING-REPORT Part 3 #4); the errand run lives in the Satchel and the job menu (simplify) -->
    {#if cantFor}<div class="cant"><button class="text-link" aria-label={t('today.cantSr', { job: job(cantFor).name })} onclick={() => go('cant', cantFor)}><span>{t('today.cantGetStarted')}</span></button></div>{/if}
    <!-- the evening, before the day's work is done: Tonight at the end of the day's list (D-093) -->
    {#if evening && !v.complete && !v.run && !nearBed}<section class="tonight-end">{@render tonight()}</section>{/if}
    </div>
    <nav class="foot" aria-label={t('today.label')}>
      <!-- the jobs with no day, by day and at night (D-126) -->
      <button class="text-link" onclick={() => go('satchel')}><span>{t('nav.satchel')}</span></button>
      <button class="text-link" onclick={() => go('week')}><span>{t('nav.week')}</span></button>
      <!-- only once there is a page to read (N polish) -->
      {#if game.facts.some(f => f.type === 'weekClosed')}<button class="text-link" onclick={() => go('daybook')}><span>{t('nav.daybook')}</span></button>{/if}
    </nav>
  </section>
</div>

<style>
  h1 { margin-top: 2px; }
  /* the heading's own words are its name; "Read it again" is said after it (A#47); a finger's height at least (A#40) */
  h1 .here { font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; text-shadow: inherit; background: none; border: 0; padding: 0; text-align: left; cursor: pointer; min-height: 44px; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  /* a job Dan tends to put off brings a find: a small hollow gold mark says so (MORNING-REPORT Part 3 #3) */
  .chosen-first { margin: 6px 0 2px; font-style: italic; }
  .chosen-first .text-link { min-height: 44px; }
  /* drawn, not written: the job's name stays its name (flows and VoiceOver read it) */
  .t.putoff::after { content: '◇'; content: '◇' / ''; margin-left: .4em; font-size: .8em; color: var(--gold-hi); opacity: .85; }
  .where { margin-top: 6px; }
  .where :global(.road) { margin: 0 auto 4px; }
  .key-line { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0 6px; margin: 16px auto 2px; }
  .keys { display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 6px; background: none; border: 0; cursor: pointer;
    font-family: var(--life); font-style: italic; font-size: calc(15px * var(--ts, 1)); color: #e9d9b4; }
  .keys svg { width: 22px; height: 11px; fill: none; stroke: #f2c170; stroke-width: 1.4; stroke-linecap: round; }
  .key-line .dot { color: #b9a77e; }
  .key-line .key-use { min-height: 44px; font-size: calc(15px * var(--ts, 1)); color: #f2c170; }
  .key-line .key-use span { color: #f2c170; }
  .key-ask { display: flex; justify-content: center; gap: 18px; margin: -2px 0 8px; }
  .key-ask .use span { color: #f2c170; }
  .keys-say { margin: 0 0 8px; text-align: center; font-size: calc(14.5px * var(--ts, 1)); }
  .needs-key { color: #f2c170; }
  .behind-map { margin: 0; }
  .behind-map .text-link { min-height: 44px; padding: 0; }
  .ahead { margin-top: 12px; }
  .ahead p { font-size: calc(17.5px * var(--ts, 1)); line-height: 1.38; margin-top: 6px; }
  .ahead-text { display: block; width: 100%; padding: 0; background: none; border: 0; text-align: left; cursor: pointer; color: inherit; }
  .ahead-text:not(.open) p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; }
  .tonight-end { margin-top: 18px; }
  .tonight-top { margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--edge-2); }
  .tonight { margin: 4px 0 6px; }
  .next .tonight .promise { text-align: left; margin: 6px 0 14px; }
  .tonight .promise { text-align: left; margin: 6px 0 14px; }
  .night-line { font-style: italic; color: #fff; margin: 8px 0 10px; line-height: 1.45; }
  .bottom { padding-top: 8px; }
  /* the list's fade starts below the header, never under the Ahead passage: rows never show through it (deep review H#12) */
  .bottom > .scroll { margin-top: 0; }
  .next h2 { margin: 8px 0 4px; }
  .next .soft { margin-bottom: 18px; }
  .cant { display: flex; justify-content: center; align-items: center; gap: 2px; margin-top: 4px; }
  .gap { height: 12px; }
  .after { margin-top: 12px; }
  .next .soft.deeper { font-style: italic; margin: 8px 0 4px; }
  .rows { margin-top: 2px; }
  .lead .btn.full { width: 100%; }
  /* the day's label and the one button: room between them (Dan, D-135) */
  .addcard .lead { margin: 18px 0 12px; }
  .addcard .soft + .lead { margin-top: 0; }
  .rows :global(.row-done) { min-height: 40px; padding: 0 0 0 12px; }
  .rows :global(.row-done span) { font-size: calc(16px * var(--ts, 1)); color: var(--violet-hi); }
  .if-time { margin: 18px 0 4px; }
  .replies { margin-top: 10px; }
  .reply { padding-bottom: 4px; }
  .rows :global(.row small) { display: block; font-size: calc(14px * var(--ts, 1)); color: var(--ink-2); margin-top: 2px; }
  .ask { margin: 0; padding-left: 32px; font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: var(--ink-2); }
  .reply-acts { display: flex; flex-wrap: wrap; gap: 0 16px; padding-left: 32px; }
  .reply-acts .text-link { min-height: 44px; min-width: 44px; }
  .reply-acts .text-link span { font-size: calc(15px * var(--ts, 1)); }
  .reply-acts .text-link:disabled { opacity: .5; }
  .waits { margin: 0 0 6px; }
  .waits .text-link span { color: var(--gold-hi); }
  .next .soft.to-satchel { margin: -8px 0 4px; font-size: calc(14px * var(--ts, 1)); font-style: italic; text-align: center; }
  .hold-hint { margin: 6px 0 0; text-align: center; font-size: calc(14px * var(--ts, 1)); font-style: italic; }
  .of { margin: -2px 0 4px !important; font-style: italic; }
  .only { margin: 2px 0 6px; }
  .aside { margin-top: 8px; }
  .aside-row { cursor: default; opacity: .62; }
  .aside-row .t { text-decoration: line-through; }
  .put-back { display: flex; justify-content: flex-end; margin: -8px 0 4px; }
  .put-back .text-link { min-height: 44px; padding: 0; }
  .put-back .text-link span { font-size: calc(15px * var(--ts, 1)); }
  .first { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin-top: 8px; }
  .first-say { font-family: var(--life); font-size: calc(18px * var(--ts, 1)); color: var(--ink-2); }
  .first-job span { font-size: calc(18px * var(--ts, 1)); color: #fff; }
  .choices { display: flex; flex-direction: column; margin: 4px 0 6px; border-top: 1px solid var(--edge-4); }
  .choice { text-align: left; min-height: 44px; padding: 8px 4px; border-bottom: 1px solid var(--edge-4); font-family: var(--life); font-size: calc(17px * var(--ts, 1)); color: var(--ink); }
  .choice[aria-pressed='true'] { color: var(--gold); }
  .choice small { display: block; font-style: italic; font-size: calc(14px * var(--ts, 1)); color: var(--ink-3); }
  .mind { display: flex; gap: 10px; margin: 10px 0 2px; }
  .mind input { flex: 1; min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: calc(17px * var(--ts, 1)); color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .mind .btn-quiet { padding: 0 14px; }
  .mind .btn-quiet:disabled { opacity: .5; }
  .said-mind { font-style: italic; margin: 4px 0 0; text-align: left; }
  .still { margin: -12px 0 16px; }
  .said { font-family: var(--life); font-style: italic; font-size: calc(15.5px * var(--ts, 1)); color: var(--ink-2); display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 2px 6px; margin: -6px 0 6px; }
  .said .text-link { display: inline-flex; align-items: center; min-height: 44px; padding: 0 4px; vertical-align: middle; }   /* a finger high (A#40) */
  .foot { display: flex; justify-content: space-around; margin: 6px -10px 0; }
  .foot span { font-size: calc(14px * var(--ts, 1)); letter-spacing: .1em; color: var(--ink-2); }
  .proto span { font-size: calc(14px * var(--ts, 1)); letter-spacing: .16em; color: var(--ink-3); }
  /* the day on the left; the map, records and the prototype's own link together on the right */
  .bar { display: flex; justify-content: space-between; }
  /* on a narrow bar the rehearsal badge takes a line of its own, never pushing the screen wider (Dan, review 2) */
  .bar { gap: 8px; align-items: flex-start; }
  .navs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0 4px; align-items: center; margin-right: -10px; min-width: 0; }
  .navs span { font-size: calc(14px * var(--ts, 1)); letter-spacing: .12em; color: var(--ink-2); }
  .proto .badge { color: var(--gold); }
  .gear { min-width: 44px; justify-content: center; }
  .gear svg { width: 20px; height: 20px; fill: none; stroke: var(--ink-2); stroke-width: 1.6; stroke-linecap: round; }
  @media (max-height: 800px) {
    .ahead { margin-top: 8px; } .ahead p { margin-top: 4px; } .next .soft { margin-bottom: 14px; }
    :global(.row) { min-height: 44px; }
  }
</style>
