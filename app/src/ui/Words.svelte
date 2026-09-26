<script lang="ts">
  /* The story's words over a painting (D-085). They keep to the lower half of the screen so the painting stays seen:
     a soft wash, no box or edge, the words scrolling inside it. "Hide the words" folds them to a couple of lines so the
     whole painting shows; "Read on" brings them back. Short lines simply sit there: no scrolling, no link.
     Over a place's painting the link is "Look" instead (D-105): everything fades and the painting is seen whole. */
  import type { Snippet } from 'svelte';
  import { t } from '../content/copy/en';

  /* plain: the screen already scrolls its words and darkens the painting itself (a job's return), so here they only fold */
  let { children, length = 0, plain = false, look }: { children: Snippet; length?: number; plain?: boolean; look?: () => void } = $props();
  /* long enough to need the fold (roughly more than four lines on a phone) */
  const foldable = $derived(!look && length > 220);
  let open = $state(true);
</script>

<div class="words" class:plain class:folded={foldable && !open}>
  {#if !plain}<div class="wash" aria-hidden="true"></div>{/if}
  <div class="scroll">{@render children()}</div>
  {#if look}
    <button class="text-link fold" onclick={look}><span>{t('look.open')}</span></button>
  {:else if foldable}
    <button class="text-link fold" onclick={() => (open = !open)} aria-expanded={open}><span>{open ? t('words.hide') : t('words.show')}</span></button>
  {/if}
</div>

<style>
  .words { position: relative; display: flex; flex-direction: column; align-items: stretch; min-height: 0; }
  /* the wash rises well above the words and fades out: never a panel */
  .wash { position: absolute; left: -100vw; right: -100vw; top: -90px; bottom: -70vh; z-index: -1; pointer-events: none;
    background: linear-gradient(180deg, rgba(6,5,16,0) 0, rgba(6,5,16,.62) 90px, rgba(6,5,16,.72) 100%);
    transition: opacity .5s var(--ease); }
  .scroll { max-height: 42vh; max-height: 42dvh; overflow-x: hidden; overflow-y: auto; overscroll-behavior: none; scrollbar-width: none;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 26px), transparent 100%);
            mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 26px), transparent 100%);
    padding: 8px 0 18px; transition: max-height .5s var(--ease); }
  .scroll::-webkit-scrollbar { display: none; }
  .folded .scroll { max-height: 5.4em; overflow: hidden; }
  .folded .wash { opacity: .55; }
  .plain .scroll { max-height: none; overflow: visible; -webkit-mask-image: none; mask-image: none; padding: 0; }
  .plain.folded .scroll { max-height: 5.4em; overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent 100%); mask-image: linear-gradient(180deg, #000 60%, transparent 100%); }
  .fold { align-self: flex-end; min-height: 36px; font-style: italic; color: var(--ink-2); }
</style>
