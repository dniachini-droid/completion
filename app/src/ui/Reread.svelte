<script lang="ts">
  /* "N records you found now read differently · Read them" (MORNING-REPORT Part 3 #8): said once, where a beat makes a
     mark known; the records are lit in Records until opened. */
  import { game, content } from './game.svelte';
  import { rereadBy } from '../core/reread';
  import { t } from '../content/copy/en';
  import { light } from './relit.svelte';
  import type { Go } from './nav';

  /* (several beats on one screen, a place and the bits on the way to it: one line for all, never the same line twice) */
  let { beat = null, beats = [], go }: { beat?: string | null; beats?: (string | null)[]; go?: Go } = $props();
  const each = $derived([beat, ...beats].filter((b): b is string => !!b).map(b => ({ b, ids: rereadBy(content.story, game.whole.story, b) })));
  const ids = $derived([...new Set(each.flatMap(x => x.ids))]);
  $effect(() => { for (const x of each) if (x.ids.length) light(x.b, x.ids); });
</script>

{#if ids.length}
  <p class="reread">{ids.length === 1 ? t('reread.one') : t('reread.n', { n: ids.length })}{#if go} <span aria-hidden="true">·</span> <button class="text-link" onclick={() => go('records', ids.length === 1 ? ids[0] : undefined)}><span>{ids.length === 1 ? t('reread.read1') : t('reread.read')}</span></button>{/if}</p>
{/if}

<style>
  .reread { text-align: center; font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: var(--violet-hi); margin: 6px auto 8px; max-width: 34ch; }
  .reread .text-link { min-height: 44px; }
</style>
