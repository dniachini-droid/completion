<script lang="ts">
  /* "N records you found now read differently · Read them" (MORNING-REPORT Part 3 #8): said once, where a beat makes a
     mark known; the records are lit in Records until opened. */
  import { game, content } from './game.svelte';
  import { rereadBy } from '../core/reread';
  import { t } from '../content/copy/en';
  import { light } from './relit.svelte';
  import type { Go } from './nav';

  let { beat, go }: { beat: string | null; go?: Go } = $props();
  const ids = $derived(beat ? rereadBy(content.story, game.view.story, beat) : []);
  $effect(() => { if (ids.length) light(ids); });
</script>

{#if ids.length}
  <p class="reread">{ids.length === 1 ? t('reread.one') : t('reread.n', { n: ids.length })}{#if go} <span aria-hidden="true">·</span> <button class="text-link" onclick={() => go('records', ids.length === 1 ? ids[0] : undefined)}><span>{ids.length === 1 ? t('reread.read1') : t('reread.read')}</span></button>{/if}</p>
{/if}

<style>
  .reread { text-align: center; font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: var(--violet-hi); margin: 6px auto 8px; max-width: 34ch; }
  .reread .text-link { min-height: 44px; }
</style>
