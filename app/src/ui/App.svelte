<script lang="ts">
  import { onMount } from 'svelte';
  import type { Delve } from '../core/delve';
  import { loadDelve } from './trial-state';
  import Hall from './screens/Hall.svelte';
  import DelveScreen from './screens/Delve.svelte';

  let delve = $state<Delve | null>(null);
  let ready = $state(false);

  // A running delve survives closing the app: it is read back and worked out from the clock.
  onMount(async () => { delve = await loadDelve(); ready = true; });
</script>

{#if ready}
  {#if delve}
    <DelveScreen {delve} onleave={() => (delve = null)} />
  {:else}
    <Hall onbegin={(d) => (delve = d)} />
  {/if}
{/if}
