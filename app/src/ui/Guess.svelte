<script lang="ts">
  /* A mark, and four things it might mean (SCRIPT §9): one tap, never "wrong" at guess time. The place confirms it
     later. Once guessed, it shows the guess with a question mark (the marks screen comes with slice 3). */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import Glyph from './Glyph.svelte';

  let { mark }: { mark: string } = $props();
  const m = $derived(content.story.marks.find(x => x.id === mark));
  const guessed = $derived(game.view.story.guessed.get(mark));
  /* shuffled once per mark, the same every time it's shown */
  const options = $derived.by(() => {
    const c = [...(m?.candidates ?? [])];
    let h = 0; for (const ch of mark) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    for (let i = c.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [c[i], c[j]] = [c[j], c[i]]; }
    return c;
  });
</script>

{#if m && m.candidates?.length}
  <div class="guess">
    <div class="mk"><Glyph {mark} size={46} lit={!!guessed} /></div>
    {#if m.context}<p class="soft ctx">{m.context}</p>{/if}
    {#if guessed}
      <p class="say kept">{t('guess.kept', { guess: guessed })}</p>
    {:else}
      <p class="say ask">{t('guess.ask')}</p>
      <div class="opts">
        {#each options as o}
          <button class="btn-quiet" onclick={() => game.do({ do: 'guess', mark, guess: o })}><span>{o}</span></button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .guess { text-align: center; margin: 6px 0 14px; }
  .mk { display: flex; justify-content: center; margin-bottom: 6px; }
  .ctx { margin: 0 0 8px; }
  .ask { color: var(--ink-2); margin: 4px 0 10px; }
  .kept { color: var(--ink-2); font-style: italic; }
  .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 340px; margin: 0 auto; }
  .opts .btn-quiet { justify-content: center; min-height: 46px; }
</style>
