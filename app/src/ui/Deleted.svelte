<script lang="ts">
  /* A job just deleted (D-125): one quiet line and Undo, on the screen where it was deleted. */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
</script>

{#if game.cantDelete}
  <p class="said deleted" role="status">{t(game.cantDelete.ended ? 'job.cantDeleteEnd' : 'job.cantDelete', { job: game.cantDelete.job })}</p>
{:else if game.deleted}
  <p class="said deleted" role="status">{t('job.removed', { name: game.deleted.job.name })} <button class="text-link" onclick={() => game.undoRemove()}><span>{t('job.undo')}</span></button></p>
{/if}

<style>
  .deleted { font-family: var(--life); font-style: italic; font-size: calc(15.5px * var(--ts, 1)); color: var(--ink-2); display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 2px 6px; margin: 4px 0 8px; }
</style>
