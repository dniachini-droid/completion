<script lang="ts">
  /* The story's words over a painting (D-081). They keep to the lower half of the screen so the painting stays seen:
     a soft wash, no box or edge, the words scrolling inside it. "Hide the words" folds them to a couple of lines so the
     whole painting shows; "Read on" brings them back. Short lines simply sit there: no scrolling, no link. */
  import type { Snippet } from 'svelte';
  import { t } from '../content/copy/en';

  let { children, length = 0 }: { children: Snippet; length?: number } = $props();
  /* long enough to need the fold (roughly more than four lines on a phone) */
  const foldable = $derived(length > 220);
  let open = $state(true);
</script>

<div class="words" class:folded={foldable && !open}>
  <div class="wash" aria-hidden="true"></div>
  <div class="scroll">{@render children()}</div>
  {#if foldable}
    <button class="text-link fold" onclick={() => (open = !open)} aria-expanded={open}><span>{open ? t('words.hide') : t('words.show')}</span></button>
  {/if}
</div>

<style>
  .words { position: relative; display: flex; flex-direction: column; align-items: stretch; min-height: 0; }
  /* the wash rises well above the words and fades out: never a panel */
  .wash { position: absolute; left: -100vw; right: -100vw; top: -90px; bottom: -70vh; z-index: -1; pointer-events: none;
    background: linear-gradient(180deg, rgba(6,5,16,0) 0, rgba(6,5,16,.62) 90px, rgba(6,5,16,.72) 100%);
    transition: opacity .5s var(--ease); }
  .scroll { max-height: 42vh; max-height: 42dvh; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 26px), transparent 100%);
            mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 26px), transparent 100%);
    padding: 8px 0 18px; transition: max-height .5s var(--ease); }
  .scroll::-webkit-scrollbar { display: none; }
  .folded .scroll { max-height: 5.4em; overflow: hidden; }
  .folded .wash { opacity: .55; }
  .fold { align-self: flex-end; min-height: 36px; font-style: italic; color: var(--ink-2); margin-top: -4px; }
</style>
