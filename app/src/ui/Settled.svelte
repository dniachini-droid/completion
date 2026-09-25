<script lang="ts">
  /* The confirming beat (SCRIPT §9): when a place answers, each guess it settles says so here, once, on the beat's own
     screen. A guess that held reads without its question mark; the tempting wrong one is struck, with its one line. */
  import { game, content } from './game.svelte';
  import { settledBy } from '../core/story';
  import { t } from '../content/copy/en';
  import Glyph from './Glyph.svelte';

  let { beat }: { beat: string | null } = $props();
  const list = $derived(beat ? settledBy(content.story, game.view.story, beat) : []);
</script>

{#each list as x (x.mark)}
  <div class="settled">
    <Glyph mark={x.mark} size={34} lit />
    {#if x.struck}
      <p class="say"><s>{x.held.guess}</s> <em>{x.held.word}</em>. {x.struck}</p>
    {:else}
      <p class="say">{t('settle.held', { word: x.held.word })}</p>
    {/if}
  </div>
{/each}

<style>
  .settled { display: flex; align-items: center; gap: 12px; justify-content: center; margin: 8px auto 4px; max-width: 34ch; text-align: left; animation: rise 1s var(--ease) both; }
  .settled p { font-size: 16.5px; line-height: 1.4; color: var(--ink-2); }
  .settled s { color: var(--ink-3); text-decoration-thickness: 1px; }
  .settled em { color: #fff; }
</style>
