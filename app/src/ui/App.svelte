<script lang="ts">
  /* The screens, one at a time, inside the phone. On opening, the next action is obvious (rule 16):
     a delve that ended while away shows its end; a run in progress shows the ring; an unseen arrival shows itself. */
  import { game } from './game.svelte';
  import { moment } from './moment.svelte';
  import type { Go, Screen } from './nav';
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
  import Camp from './Camp.svelte';
  import Morning from './Morning.svelte';
  import Welcome from './Welcome.svelte';
  import Daybook from './Daybook.svelte';
  import Week from './Week.svelte';
  import Rhythms from './Rhythms.svelte';
  import Satchel from './Satchel.svelte';
  import Choose from './Choose.svelte';

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

  const go: Go = (to, a) => {
    if (to === 'cant' && typeof a === 'string') game.do({ do: 'cantStart', job: a });
    screen = to; arg = a;
  };

  /* the day's light: gold once the day has turned (DESIGN_SYSTEM → colour) */
  $effect(() => {
    const gold = (screen === 'arrival' && !moment.cutting) || (screen === 'today' && game.view.complete) || screen === 'camp';
    document.body.className = gold ? 's-done' : game.view.done.size ? 's-day2' : 's-day';
  });
</script>

<main class="phone">
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
    {:else if screen === 'camp'}<Camp {go} />
    {:else if screen === 'morning'}<Morning {go} />
    {:else if screen === 'welcome'}<Welcome {go} />
    {:else if screen === 'daybook'}<Daybook {go} week={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'week'}<Week {go} week={typeof arg === 'string' ? arg : undefined} />
    {:else if screen === 'rhythms'}<Rhythms {go} />
    {:else if screen === 'satchel'}<Satchel {go} />
    {:else if screen === 'choose'}<Choose {go} />{/if}
  {/key}
</main>
