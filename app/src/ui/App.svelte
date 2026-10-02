<script lang="ts">
  /* The screens, one at a time, inside the phone. On opening, the next action is obvious (rule 16):
     a delve that ended while away shows its end; a run in progress shows the ring; an unseen arrival shows itself. */
  import { game, content } from './game.svelte';
  import { arrivalAt } from '../core/game';
  import { leaveWord, moment } from './moment.svelte';
  import { onMount, tick } from 'svelte';
  import type { Back, Go, Screen } from './nav';
  import { back } from './back.svelte';
  import { platform } from '../platform';
  import Today from './Today.svelte';
  import RunSet from './RunSet.svelte';
  import Delve from './Delve.svelte';
  import Step from './Step.svelte';
  import Arrival from './Arrival.svelte';
  import Opened from './Opened.svelte';
  import CantStart from './CantStart.svelte';
  import Proto from './Proto.svelte';
  import Map from './Map.svelte';
  import Records from './Records.svelte';
  import Marks from './Marks.svelte';
  import Stair from './Stair.svelte';
  import Scene from './Scene.svelte';
  import Morning from './Morning.svelte';
  import Welcome from './Welcome.svelte';
  import Daybook from './Daybook.svelte';
  import Week from './Week.svelte';
  import Rhythms from './Rhythms.svelte';
  import Satchel from './Satchel.svelte';
  import Errands from './Errands.svelte';
  import Settings from './Settings.svelte';
  import JobMenu from './JobMenu.svelte';
  import { closeMenu, closeTick } from './menu.svelte';
  import TickSheet from './TickSheet.svelte';
  import { closeRows } from './SwipeRow.svelte';
  import { t } from '../content/copy/en';
  import { sealOf } from '../core/story';
  import { calendarWeek } from '../core/time';
  import { addDays } from '../core/week';
  import { steady } from './taps';
  import { unslide } from './keyboard';
  import { wake } from './rest';

  const beatKind = (id: string) => content.story.beats.find(b => b.id === id)?.kind;
  function first(): Screen {
    const v = game.view;
    /* an errand run's "What got done?" left unanswered waits for Dan without holding Today: Today says it waits (J1) */
    if ((v.runEnd && !v.runEnd.pending) || (v.run && v.run.phase !== 'held')) return 'delve';
    /* a word left to cut later waits for Dan on Today's quiet line, never forced on him (A2) */
    /* after days away the welcome back comes first: a word waiting then waits as Today's line (U5, W F8) */
    if (v.arrival && v.arrival.seq !== moment.wordLater && v.welcome && beatKind(v.arrival.id) === 'word') leaveWord(v.arrival.seq);
    if (v.arrival && v.arrival.seq !== moment.wordLater) return 'arrival';
    /* then, once each: the morning after camp, the welcome back, the daybook's new page */
    /* after days away the morning is folded into the welcome back: one screen before Today (deep review W F8) */
    if (v.morning && !v.welcome) return 'morning';
    if (v.welcome) return 'welcome';
    /* after days away, the welcome back only: the new page waits as a quiet line on Today (Dan, D-143 F) */
    /* (still a line after 04:00: a welcome since the page was written keeps it so, review of D-144) */
    /* (and on a Monday whose morning was already shown: one screen before Today, not two, W F8) */
    if (v.close && !game.facts.some(f => (f.type === 'welcomed' && f.day >= v.close!.day) || (f.type === 'seen' && f.what === 'morning' && f.day === v.day))) return 'daybook';
    return 'today';
  }
  let screen = $state<Screen>(first());
  let arg = $state<string | number | undefined>(undefined);
  /* a new day reached by coming back to the app opens as a cold start would: what waits is shown first (D-080) */
  let lastWoke = game.woke;
  /* VoiceOver: a new screen's title is read out (accessibility A, D-111), through a quiet live line rather than by moving
     focus: moving focus could slide a screen sideways (Dan, review 2) */
  let announce = $state('');
  $effect(() => {
    void screen; void arg;
    void tick().then(() => {
      const h = document.querySelector<HTMLElement>('.ui h1, h1') ?? document.querySelector<HTMLElement>('.ui h2, h2');
      announce = h?.textContent?.trim() ?? '';
    });
  });
  /* (through one way home: the trail, an open menu or sheet and the Undo go too, deep review C#3) */
  $effect(() => { if (game.woke !== lastWoke) { lastWoke = game.woke; goHome(); } });
  function goHome() { trail = []; closeMenu(); closeTick(); closeRows(); game.deleted = null; game.cantDelete = null; screen = first(); arg = undefined; }

  /* Back (review 2, D-088): the screens Dan looks through keep a trail, so the arrow and the phone's own back return to
     where each was opened from. Today and the day's own moments (a delve, a place reached, the stair, the morning)
     start the trail again; their way out stays Today. */
  /* a niche opened with a Key is looked through too: back from the Map never returns to it in a loop (S1, D-143); so is a
     job's return (the step): back returns to the Satchel or the Week it was ticked off in (N clumsy 3) */
  const LOOK = new Set<Screen>(['map', 'records', 'marks', 'week', 'rhythms', 'daybook', 'set', 'proto', 'cant', 'settings', 'satchel', 'errands', 'opened', 'step']);
  const TABS = new Set<Screen>(['records', 'marks']);
  let trail = $state<Back[]>([]);
  /* Records ⇄ Marks is a tab: the screen swaps in place, with nothing rising or fading in again (Dan, D-093) */
  let still = $state(false);
  const go: Go = (to, a) => {
    steady(); void tick().then(() => { steady(); unslide(); });
    /* leaving a delve's end by any way out (the arrow, the phone's back): looked at, so it never comes back later (D-120).
       A look at a record, the Satchel or a Key's niche from it isn't leaving: back returns to it (N bug 2). An errand
       run's end still to count is never marked: its question waits (J1) */
    const e = game.view.runEnd;
    if (screen === 'delve' && e && !e.pending && !game.view.run && to !== 'delve' && !LOOK.has(to as Screen)) game.do({ do: 'seen', what: 'step', ref: e.seq });
    still = TABS.has(screen) && TABS.has(to);
    closeMenu(); closeTick(); closeRows();
    game.deleted = null; game.cantDelete = null;   /* a delete's Undo stays on the screen it was made on (D-125) */
    /* back to Today goes the way "Today" does, past what waits: a delve that ended while Dan typed elsewhere is shown
       (break-it review 5) */
    /* a delve's set-up for a job since deleted (from its editor) is passed by on the way back (D-131) */
    while (to === 'back' && trail.length && trail[trail.length - 1].screen === 'set' && trail[trail.length - 1].arg !== 'errands' && !game.job(String(trail[trail.length - 1].arg))) trail.pop();
    /* the phone's back on a moment that waits (a place just reached, the morning, the welcome back, a new Daybook page, a
       word to cut) does what its own arrow does, never nothing (N clumsy 5) */
    if (to === 'back' && !trail.length) {
      const v = game.view;
      if (screen === 'arrival' && v.arrival && !(typeof arg === 'string' && arg.startsWith('again:'))) { if (beatKind(v.arrival.id) === 'word' && moment.cutDone !== v.arrival.seq) leaveWord(v.arrival.seq); else game.do({ do: 'seen', what: 'arrival', ref: v.arrival.seq }); }
      else if (screen === 'morning' && v.morning) game.do({ do: 'seen', what: 'morning', ref: v.morning.seq });
      else if (screen === 'welcome' && v.welcome) { if (v.morning) game.do({ do: 'seen', what: 'morning', ref: v.morning.seq }); game.do({ do: 'seen', what: 'welcome', ref: v.welcome.seq }); }
      else if (screen === 'daybook' && v.close) game.do({ do: 'closeRead', week: v.close.week });
    }
    if (to === 'back') { const p = trail.pop(); if (p && p.screen !== 'today') { screen = p.screen; arg = p.arg; } else go('today'); return; }
    if (to === 'cant' && typeof a === 'string') game.do({ do: 'cantStart', job: a });
    /* "Today" never skips what waits: a place just reached, the morning, the welcome back, a new daybook page (D-080).
       'stay' is the one way past it: the word left to cut later. */
    /* a screen reached so is a root: its arrow and the phone's back lead to Today, never into what was left (the morning,
       the word left for later; deep review B7, B8) */
    let rooted = false;
    if (to === 'today' && a !== 'stay') { const f = first(); if (f !== 'today' && (f !== 'delve' || !game.view.run)) { to = f; rooted = true; trail = []; } }
    /* a place read again (the Map, Today's place name, D-135) is looked through: back returns where it was opened from */
    if (rooted) trail = [];
    else if (LOOK.has(to) || (to === 'arrival' && typeof a === 'string' && a.startsWith('again:'))) {
      const top = trail[trail.length - 1];
      if (top && top.screen === to && top.arg === a) trail.pop();                  /* going where back would go */
      /* the same screen, another page: replaced (the Daybook's Earlier and Later alike, N polish) */
      else if (screen === to && (to === 'daybook' || !(arg === undefined && a !== undefined))) { /* replaced */ }
      /* Records ⇄ Symbols by the tab bar: a tab, whatever was open on either, never a step back (N clumsy 1) */
      else if (TABS.has(screen) && TABS.has(to) && screen !== to && a === undefined) {
        /* a tab: the pages opened inside either go too, so the arrow and back lead out of both (review of D-144) */
        while (trail.length && TABS.has(trail[trail.length - 1].screen)) trail.pop();
      }
      else trail.push({ screen, arg });
    } else trail = [];
    screen = to; arg = to === 'today' ? undefined : a;
  };
  /* what the arrow says: the screen it returns to */
  /* every arrow names where it goes, deepest places included (N clumsy 6, bug 3) */
  const NAMES: Partial<Record<Screen, string>> = { today: 'delve.today', map: 'map.nav', records: 'records.nav', marks: 'marks.nav',
    rhythms: 'rhythms.label', daybook: 'nav.daybook', settings: 'nav.settings', satchel: 'nav.satchel', errands: 'errand.title', opened: 'opened.nav',
    delve: 'delve.label', step: 'step.label', morning: 'morning.label', welcome: 'welcome.label', stair: 'stair.label', cant: 'cant.label', proto: 'nav.proto' };
  function nameOf(top: Back): string {
    /* this week, next week, or a later one: named by which it is (deep review B19, C#4) */
    if (top.screen === 'week') { const wk = calendarWeek(game.view.day), a = String(top.arg ?? ''); return t(!top.arg || a <= wk ? 'week.label' : a === addDays(wk, 7) ? 'week.next' : 'week.later'); }
    /* the set-up: its job's name ("Back to Tax return", never "Back to Back") */
    if (top.screen === 'set') return top.arg === 'errands' ? t('errand.title') : game.job(String(top.arg))?.name ?? t('set.label');
    /* a job's return and a delve's end: by the job (never "Back to Done", review of D-144) */
    if (top.screen === 'step') { const f = game.facts.find(x => x.seq === top.arg); if (f?.type === 'jobDone') return game.job(f.job)?.name ?? t('step.label'); }
    /* a delve's end already left goes on to Today, so the arrow says Today */
    if (top.screen === 'delve') { const e = game.view.runEnd ?? game.view.run; return e ? (e.errands ? t('errand.title') : e.job.name) : t('delve.today'); }
    /* a niche opened with a Key: by its own name */
    if (top.screen === 'opened') { const x = sealOf(content.story, String(top.arg).replace(/^again:/, '')); if (x) return x.where; }
    /* a place: its own name */
    if (top.screen === 'arrival') {
      const a = typeof top.arg === 'string' && top.arg.startsWith('again:') ? arrivalAt(game.facts, content, +top.arg.slice(6)) : game.view.arrival ?? game.view.lastArrival;
      return a?.name || t('arrive.label');
    }
    return NAMES[top.screen] ? t(NAMES[top.screen] as never) : t('nav.back');
  }
  $effect(() => {
    const top = trail[trail.length - 1];
    back.label = !top ? t('delve.today') : nameOf(top);
    back.today = first() === 'today';
  });

  /* back by history, one step at a time (the screen checks use it); on Today with nothing behind, nothing more */
  const home = () => screen === 'today' && !trail.length;
  onMount(() => {
    history.pushState({ app: 1 }, '');
    const pop = () => { if (home()) { history.back(); return; } go('back'); history.pushState({ app: 1 }, ''); };
    addEventListener('popstate', pop);
    /* in the phone app there is no browser: a swipe in from the left edge goes back, as in any iPhone app */
    let edge: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => { edge = platform.app && e.clientX < 24 && !home() ? { x: e.clientX, y: e.clientY } : null; };
    const up = (e: PointerEvent) => { if (edge && e.clientX - edge.x > 70 && Math.abs(e.clientY - edge.y) < 60) go('back'); edge = null; };
    addEventListener('pointerdown', down); addEventListener('pointerup', up);
    return () => { removeEventListener('popstate', pop); removeEventListener('pointerdown', down); removeEventListener('pointerup', up); };
  });

  /* a delve that ends while Dan is on another screen: its end is shown (as it is on opening), unless he is typing; the
     chime has already called him (D-120). A change of the delve's phase or of Today's next job steadies taps too. */
  /* an errand run's end counted from elsewhere (any other command counts it, J1) is shown then, with its story */
  let lastEnd = game.view.runEnd?.seq ?? 0, lastPending = !!game.view.runEnd?.pending;
  $effect(() => {
    const e = game.view.runEnd;
    if (!e || (e.seq === lastEnd && (e.pending || !lastPending))) { lastPending = !!e?.pending; return; }
    lastEnd = e.seq; lastPending = e.pending;
    const typing = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
    if (screen !== 'delve' && !typing) go('delve');
  });
  /* a day finished away from a delve's end ("Not today" or Delete on the list's last job, a short job said done, a job
     moved off today in the Week): its camp or place is shown at once, as a delve's end would lead to it (D-130). The
     day's own moments route themselves. */
  const QUIET = new Set<Screen>(['today', 'week', 'rhythms', 'satchel', 'settings', 'daybook', 'errands']);
  let lastArr = game.view.arrival?.seq ?? 0;
  $effect(() => {
    const a = game.view.arrival;
    if (!a || a.seq === lastArr) return;
    lastArr = a.seq;
    const typing = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
    if (QUIET.has(screen) && !typing && !game.view.run && !game.view.runEnd) go('arrival');
  });
  const phaseKey = $derived.by(() => { const v = game.view; return `${v.run?.phase}.${v.run?.k}.${v.runEnd?.seq}.${v.next?.mode}.${v.next?.job}`; });
  let lastMoment = '';
  $effect(() => { if (phaseKey !== lastMoment) { if (lastMoment) { steady(); unslide(); } lastMoment = phaseKey; } });
  /* a new screen, or the delve's moment changing, shows its motion again before it rests (D-132) */
  /* (the delve's moments only: the next job changing on a minute's tick is no reason to move the world again, deep review U4) */
  const runKey = $derived.by(() => { const v = game.view; return `${v.run?.phase}.${v.run?.k}.${v.runEnd?.seq}`; });
  $effect(() => { void screen; void arg; void runKey; wake(); });

  /* the save kept as it was, offered as a file (B15) */
  let copied = $state('');
  async function copyKept() {
    const raw = game.keptAside ? platform.saves.get(game.keptAside) : null;
    try { if (raw) { await platform.copies.share(`Long Answer save kept ${new Date().toISOString().slice(0, 10)}.json`, raw); copied = t('blocked.copied'); } }
    catch { copied = t('settings.copy.failed'); }
  }

  /* the day's light: gold once the day has turned (DESIGN_SYSTEM → colour) */
  $effect(() => {
    const gold = (screen === 'arrival' && !moment.cutting) || (screen === 'today' && game.view.complete) || (screen === 'today' && !!game.view.night);
    document.body.className = gold ? 's-done' : game.view.done.size ? 's-day2' : 's-day';
  });
</script>

<main class="phone" class:still>
  <!-- a rehearsal's clock runs 60 times faster (an evening passes in minutes): said on every screen, so the day it
       shows is never mistaken for the real one (Dan, review 2). Today carries its own badge. -->
  <div class="sr-live" aria-live="polite" aria-atomic="true">{announce}</div>
  {#if game.proto.rehearsal && !['today', 'proto'].includes(screen)}<div class="rehearsal" aria-live="polite">{t('proto.badge')}</div>{/if}
  <!-- a screen that fails shows a way back, never a blank phone; the save is untouched (review finding, D-080) -->
  <!-- a save this build can't read: kept as it is, never written over; nothing else opens on it (deep review B15) -->
  {#if game.blocked}
    <div class="ui"><section class="col oops">
      <p class="say">{t(game.blocked === 'newer' ? 'blocked.newer' : 'blocked.broken')}</p>
      <button class="btn" onclick={copyKept}>{t('blocked.copy')}</button>
      {#if copied}<p class="soft">{copied}</p>{/if}
    </section></div>
  {:else}
  <svelte:boundary onerror={(e) => console.error(e)}>
  <!-- Records ⇄ Marks share one painting, drawn once: switching tabs swaps only what is under the tab bar (Dan, D-093) -->
  {#if TABS.has(screen)}<Scene painting={game.view.here.painting} blur bottom="40%" />{/if}
  {#key screen + String(arg ?? '')}
    {#if screen === 'today'}<Today {go} />
    {:else if screen === 'set'}<RunSet {go} jobId={String(arg)} />
    {:else if screen === 'delve'}<Delve {go} />
    {:else if screen === 'step'}<Step {go} seq={Number(arg)} />
    {:else if screen === 'arrival'}<Arrival {go} seq={typeof arg === 'string' && arg.startsWith('again:') ? +arg.slice(6) : null} />
    {:else if screen === 'cant'}<CantStart {go} jobId={String(arg)} />
    {:else if screen === 'proto'}<Proto {go} />
    {:else if screen === 'map'}<Map {go} focus={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'records'}<Records {go} id={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'marks'}<Marks {go} id={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'stair'}<Stair {go} />
    {:else if screen === 'morning'}<Morning {go} />
    {:else if screen === 'welcome'}<Welcome {go} />
    {:else if screen === 'daybook'}<Daybook {go} week={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'week'}<Week {go} week={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'rhythms'}{#key arg}<Rhythms {go} job={typeof arg === 'string' ? arg : undefined} />{/key}
    {:else if screen === 'satchel'}<Satchel {go} to={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'errands'}<Errands {go} />
    {:else if screen === 'opened'}<Opened {go} id={String(arg)} />
    {:else if screen === 'settings'}<Settings {go} />{/if}
  {/key}
    {#snippet failed(_error, reset)}
      <div class="ui"><section class="col oops">
        <p class="say">{t('oops.say')}</p>
        <button class="btn" onclick={() => { goHome(); reset(); }}>{t('delve.today')}</button>
      </section></div>
    {/snippet}
  </svelte:boundary>
  <JobMenu />
  <TickSheet />
  {/if}
</main>

<style>
  .still :global(.rise), .still :global(.scene), .still :global(.fade) { animation: none !important; }
  .rehearsal { position: absolute; z-index: 20; left: 50%; transform: translateX(-50%); top: calc(var(--safe-t, 0px) + 4px); pointer-events: none;
    font-family: var(--carve); font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold); opacity: .85; white-space: nowrap; }
  .sr-live { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
