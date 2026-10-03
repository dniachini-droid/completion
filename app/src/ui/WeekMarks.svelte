<script lang="ts">
  /* A recurring job's week, under its row (Today, the Satchel; Dan chose option A, 2026-10-03): one thin notch per session
     its week asks for, like the notches on the minutes ring. Each session done this week lights one, violet-white, and
     gold on a day the job is done; all go dark on Monday. Only for a rhythm counted by the week (N a week, set days).
     The eye's only: the row says "3 of 4 this week" to VoiceOver itself. */
  let { done, need, gold = false }: { done: number; need: number; gold?: boolean } = $props();
  const marks = $derived(Array.from({ length: Math.min(7, need) }, (_, i) => i < done));
</script>

<span class="marks" class:gold aria-hidden="true">{#each marks as on, i (i)}<i class:on></i>{/each}</span>

<style>
  .marks { display: flex; gap: 5px; height: 10px; margin: 6px 0 9px; align-items: flex-end; }
  .marks i { display: block; width: 2px; height: 9px; border-radius: 1px; background: rgba(var(--violet-rgb), .5); }
  .marks i.on { background: #f1efff; box-shadow: 0 0 5px rgba(var(--violet-rgb), .95); }
  .gold i.on { background: var(--gold); box-shadow: 0 0 5px rgba(var(--gold-rgb), .9); }
</style>
