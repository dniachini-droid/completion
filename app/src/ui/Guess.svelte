<script lang="ts">
  /* A mark, and four things it might mean (SCRIPT §9): one tap, never "wrong" at guess time. The place confirms it
     later. Once guessed, it shows the guess with a question mark; the marks screen can change it until then. */
  import { game, content } from './game.svelte';
  import { t, type CopyKey, partWords } from '../content/copy/en';
  import Glyph from './Glyph.svelte';

  import { beatOf, seenAt } from '../core/story';
  import { inSentence } from '../content/copy/en';

  /* `at`: the place this is asked at, if any; a mark seen somewhere else says where (D-077) */
  let { mark, at }: { mark: string; at?: string } = $props();
  const from = $derived.by(() => {
    const places = game.facts.filter(f => f.type === 'arrived' && f.kind === 'place').map(f => (f as { id: string }).id);
    const id = seenAt(content.story, places).get(mark);
    return id && id !== at ? beatOf(content.story, id)?.name ?? null : null;
  });
  const m = $derived(content.story.marks.find(x => x.id === mark));
  const guessed = $derived(game.whole.story.guessed.get(mark));
  /* a partial sign of it found on a deep push (SCRIPT §8): said once here, never a hint about which candidate */
  const part = $derived.by(() => {
    for (const b of content.story.beats) if (game.whole.story.played.has(b.id) && b.carries?.partial && b.carries.seen?.includes(mark)) return b.carries.partial;
    return null;
  });
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
    {#if from && !guessed}<p class="soft ctx">{t('guess.from', { place: inSentence(from) })}</p>{/if}
    {#if m.context}<p class="soft ctx">{m.context}</p>{/if}
    {#if part && !guessed}<p class="soft ctx">{t('guess.part', { part: partWords(part) })}</p>{/if}
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
  .opts { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap); max-width: 340px; margin: 0 auto; }
  .opts .btn-quiet { justify-content: center; min-height: var(--ctl-h); }
</style>
