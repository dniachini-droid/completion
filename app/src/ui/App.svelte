<script lang="ts">
  /* The screens, one at a time, inside the phone. On opening, the next action is obvious (rule 16):
     a delve that ended while away shows its end; a run in progress shows the ring; an unseen arrival shows itself. */
  import { game } from './game.svelte';
  import { moment } from './moment.svelte';
  import { onMount } from 'svelte';
  import type { Back, Go, Screen } from './nav';
  import { back } from './back.svelte';
  import { platform } from '../platform';
  import Today from './Today.svelte';
  import RunSet from './RunSet.svelte';
  import Delve from './Delve.svelte';
  import Step from './Step.svelte';
  import Arrival from './Arrival.svelte';
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
  import Choose from './Choose.svelte';
  import { t } from '../content/copy/en';

  function first(): Screen {
    const v = game.view;
    if (v.runEnd || (v.run && v.run.phase !== 'held')) return 'delve';
    if (v.arrival) return 'arrival';
    /* then, once each: the morning after camp, the welcome back, the daybook's new page */
    if (v.morning) return 'morning';
    if (v.welcome) return 'welcome';
    if (v.close) return 'daybook';
    return 'today';
  }
  let screen = $state<Screen>(first());
  let arg = $state<string | number | undefined>(undefined);
  /* a new day reached by coming back to the app opens as a cold start would: what waits is shown first (D-080) */
  let lastWoke = game.woke;
  $effect(() => { if (game.woke !== lastWoke) { lastWoke = game.woke; screen = first(); arg = undefined; } });

  /* Back (review 2, D-088): the screens Dan looks through keep a trail, so the arrow and the phone's own back return to
     where each was opened from. Today and the day's own moments (a delve, a place reached, the stair, the morning)
     start the trail again; their way out stays Today. */
  const LOOK = new Set<Screen>(['map', 'records', 'marks', 'week', 'rhythms', 'satchel', 'daybook', 'choose', 'set', 'proto', 'cant']);
  const TABS = new Set<Screen>(['records', 'marks']);
  let trail = $state<Back[]>([]);
  /* Records ⇄ Marks is a tab: the screen swaps in place, with nothing rising or fading in again (Dan, D-093) */
  let still = $state(false);
  const go: Go = (to, a) => {
    still = TABS.has(screen) && TABS.has(to);
    if (to === 'back') { const p = trail.pop(); if (p) { screen = p.screen; arg = p.arg; } else go('today'); return; }
    if (to === 'cant' && typeof a === 'string') game.do({ do: 'cantStart', job: a });
    /* "Today" never skips what waits: a place just reached, the morning, the welcome back, a new daybook page (D-080).
       'stay' is the one way past it: the word left to cut later. */
    if (to === 'today' && a !== 'stay') { const f = first(); if (f !== 'today' && f !== 'delve') to = f; }
    if (LOOK.has(to)) {
      const top = trail[trail.length - 1];
      if (top && top.screen === to && top.arg === a) trail.pop();                  /* going where back would go */
      else if (screen === to && !(arg === undefined && a !== undefined)) { /* the same screen, another page: replaced */ }
      else if (TABS.has(screen) && TABS.has(to) && arg === undefined && a === undefined) { /* Records ⇄ Marks: a tab */ }
      else trail.push({ screen, arg });
    } else trail = [];
    screen = to; arg = to === 'today' ? undefined : a;
  };
  /* what the arrow says: the screen it returns to */
  const NAMES: Partial<Record<Screen, string>> = { today: 'delve.today', map: 'map.nav', records: 'records.nav', marks: 'marks.nav',
    rhythms: 'rhythms.label', satchel: 'nav.satchel', daybook: 'nav.daybook' };
  $effect(() => {
    const top = trail[trail.length - 1];
    back.label = !top ? t('delve.today') : top.screen === 'week' ? t(top.arg ? 'week.next' : 'week.label')
      : NAMES[top.screen] ? t(NAMES[top.screen] as never) : t('nav.back');
  });

  /* the phone's own back: the browser's back button or swipe on the web link, one step at a time; on Today with
     nothing behind, the browser's back leaves as it always has */
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

  /* the day's light: gold once the day has turned (DESIGN_SYSTEM → colour) */
  $effect(() => {
    const gold = (screen === 'arrival' && !moment.cutting) || (screen === 'today' && game.view.complete) || (screen === 'today' && !!game.view.night);
    document.body.className = gold ? 's-done' : game.view.done.size ? 's-day2' : 's-day';
  });
</script>

<main class="phone" class:still>
  <!-- a rehearsal's clock runs 60 times faster (an evening passes in minutes): said on every screen, so the day it
       shows is never mistaken for the real one (Dan, review 2). Today carries its own badge. -->
  {#if game.proto.rehearsal && !['today', 'proto'].includes(screen)}<div class="rehearsal" aria-live="polite">{t('proto.badge')}</div>{/if}
  <!-- a screen that fails shows a way back, never a blank phone; the save is untouched (review finding, D-080) -->
  <svelte:boundary onerror={(e) => console.error(e)}>
  <!-- Records ⇄ Marks share one painting, drawn once: switching tabs swaps only what is under the tab bar (Dan, D-093) -->
  {#if TABS.has(screen)}<Scene painting={game.view.here.painting} blur bottom="40%" />{/if}
  {#key screen + String(arg ?? '')}
    {#if screen === 'today'}<Today {go} />
    {:else if screen === 'set'}<RunSet {go} jobId={String(arg)} />
    {:else if screen === 'delve'}<Delve {go} />
    {:else if screen === 'step'}<Step {go} seq={Number(arg)} />
    {:else if screen === 'arrival'}<Arrival {go} />
    {:else if screen === 'cant'}<CantStart {go} jobId={String(arg)} />
    {:else if screen === 'proto'}<Proto {go} />
    {:else if screen === 'map'}<Map {go} />
    {:else if screen === 'records'}<Records {go} id={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'marks'}<Marks {go} id={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'stair'}<Stair {go} />
    {:else if screen === 'morning'}<Morning {go} />
    {:else if screen === 'welcome'}<Welcome {go} />
    {:else if screen === 'daybook'}<Daybook {go} week={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'week'}<Week {go} week={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'rhythms'}<Rhythms {go} />
    {:else if screen === 'satchel'}<Satchel {go} />
    {:else if screen === 'choose'}<Choose {go} />{/if}
  {/key}
    {#snippet failed(_error, reset)}
      <div class="ui"><section class="col oops">
        <p class="say">{t('oops.say')}</p>
        <button class="btn" onclick={() => { screen = 'today'; arg = undefined; reset(); }}>{t('delve.today')}</button>
      </section></div>
    {/snippet}
  </svelte:boundary>
</main>

<style>
  .still :global(.rise), .still :global(.scene), .still :global(.fade) { animation: none !important; }
  .rehearsal { position: absolute; z-index: 20; left: 50%; transform: translateX(-50%); top: calc(var(--safe-t, 0px) + 4px); pointer-events: none;
    font-family: var(--carve); font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold); opacity: .85; white-space: nowrap; }
</style>
