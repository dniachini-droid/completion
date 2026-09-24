<script lang="ts">
  /* The screens, one at a time, inside the phone. On opening, the next action is obvious (rule 16):
     a delve that ended while away shows its end; a run in progress shows the ring; an unseen arrival shows itself. */
  import { game } from './game.svelte';
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

  function first(): Screen {
    const v = game.view;
    if (v.runEnd || (v.run && v.run.phase !== 'held')) return 'delve';
    if (v.arrival) return 'arrival';
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
    const gold = screen === 'arrival' || (screen === 'today' && game.view.complete);
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
    {:else if screen === 'records'}<Records {go} id={typeof arg === 'string' ? arg : undefined} />{/if}
  {/key}
</main>
