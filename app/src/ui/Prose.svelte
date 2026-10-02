<script lang="ts">
  /* A piece of story text, its authored emphasis in italics (deep review S#8): never a literal asterisk on screen. */
  import { emphasis } from './emphasis';
  let { text }: { text: string | null | undefined } = $props();
  const parts = $derived(emphasis(text ?? ''));
</script>

{#each parts as p, i (i)}{#if p.em}<em>{p.t}</em>{:else}{p.t}{/if}{/each}
