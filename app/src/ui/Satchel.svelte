<script lang="ts">
  /* The satchel (Dan, D-126): the jobs with no day yet. Written down as they come to mind (no day, no questions), there
     whenever Dan wants them, by day or at night; a tap delves on one. A job can keep a list (the shopping: shampoo, then
     milk days later), shown here and in its delve. "Put on a day" places one; Delete lets it go, with Undo. No counts,
     no ages, nothing red (rule 9). Every job in it is a delve like any other (D-117). */
  import { game } from './game.svelte';
  import { t, byWords } from '../content/copy/en';
  import { satchelOf } from '../core/week';
  import { LIST_MAX } from '../core/game';
  import type { Job } from '../core/types';
  import Scene from './Scene.svelte';
  import Deleted from './Deleted.svelte';
  import DayPick from './DayPick.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { flushSync } from 'svelte';
  import { steady } from './taps';
  import art from './scene/satchel.jpg';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const jobs = $derived(satchelOf(v.content, game.facts, v.day));
  let text = $state('');
  /* one job at a time has its list open, or its days */
  let listing = $state<string | null>(null), placing = $state<string | null>(null), draft = $state('');
  let said = $state<string | null>(null);
  let box = $state<HTMLTextAreaElement | null>(null);

  function put() {
    const lines = text.split('\n').filter(l => l.trim());
    if (!lines.length) return;
    steady(); game.do({ do: 'addItems', lines }); text = ''; said = null;
  }
  const preview = (j: Job) => (j.list ?? '').split('\n').filter(l => l.trim()).join(' · ');
  function openList(j: Job) {
    placing = null; said = null;
    if (listing === j.id) { saveList(); return; }
    saveList();
    listing = j.id; draft = j.list ?? '';
    /* a new line to type on straight away, as the phone's keyboard opens */
    if (draft) draft += '\n';
    flushSync(); box?.focus(); box?.setSelectionRange(draft.length, draft.length);
  }
  /* what's typed is kept whenever the box loses the finger, and when the screen goes by any way (the phone's back
     included), not only on Done (review, D-126) */
  function keep() { if (listing) game.do({ do: 'listJob', job: listing, list: draft }); }
  function saveList() {
    if (!listing) return;
    keep();
    listing = null;
  }
  $effect(() => () => keep());
  function openDays(j: Job) { saveList(); said = null; placing = placing === j.id ? null : j.id; }
  function place(j: Job, day: string) {
    steady(); game.do({ do: 'planJob', job: j.id, day });
    placing = null; said = t('satchel.placed', { job: j.name, day: day === v.day ? t('pick.today') : byWords(day).replace(/^by /, '') });
  }
  function remove(j: Job) { saveList(); placing = null; said = null; game.remove(j.id); }
  /* the artwork shrinks as the list scrolls up (Dan, D-130): drawn smaller and fainter from its top edge, while the list
     keeps its place, so nothing under the finger jumps */
  let artEl = $state<HTMLImageElement | null>(null);
  function shrink(e: Event) {
    if (!artEl) return;
    const h = artEl.offsetHeight || 1, k = Math.min(1, Math.max(0, (e.currentTarget as HTMLElement).scrollTop / h));
    /* from its top edge and inside its own box: it never lies over the list */
    artEl.style.transform = k ? `scale(${(1 - k * 0.5).toFixed(3)})` : '';
    artEl.style.opacity = k ? (1 - k).toFixed(3) : '';
  }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => { saveList(); go('back'); }}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <h1 class="carve lg rise">{t('satchel.label')}</h1>
    <p class="soft say-note rise">{t('satchel.say')}</p>
  </header>

  <div class="body col rise d1" onscroll={shrink}>
    <img class="art" bind:this={artEl} src={art} alt="" aria-hidden="true" />
    <form class="new" onsubmit={(e) => { e.preventDefault(); put(); }}>
      <input bind:value={text} aria-label={t('satchel.add')} placeholder={t('satchel.add.hint')} maxlength="120" enterkeyhint="done" />
      <button class="btn-quiet" type="submit" disabled={!text.trim()}><span>{t('satchel.put')}</span></button>
    </form>
    <Deleted />
    {#if said}<p class="said" role="status">{said}</p>{/if}
    {#if !jobs.length}<p class="soft empty">{t('satchel.empty')}</p>{/if}
    {#each jobs as j (j.id)}
      <div class="item">
        <!-- while a delve runs, a tap here can't start another: as on Today (break-it review 6) -->
        <button class="row" disabled={!!v.run} onclick={() => { saveList(); go('set', j.id); }}>
          <span class="pip"></span><span class="t">{j.name}</span><span class="s">{j.by ? byWords(j.by) : ''}</span>
        </button>
        {#if listing === j.id}
          <textarea class="list" bind:this={box} bind:value={draft} rows="4" maxlength={LIST_MAX} onblur={keep} aria-label={t('satchel.list.label', { job: j.name })}
            placeholder={t('satchel.list.hint')}></textarea>
          {#if draft.length >= LIST_MAX}<p class="soft full">{t('satchel.list.full')}</p>{/if}
        {:else if preview(j)}
          <button class="preview" onclick={() => openList(j)}>{preview(j)}</button>
        {/if}
        <div class="acts">
          <button class="text-link" aria-expanded={listing === j.id} aria-label={`${listing === j.id ? t('satchel.list.done') : t('satchel.list')}: ${j.name}`} onclick={() => openList(j)}><span>{listing === j.id ? t('satchel.list.done') : t('satchel.list')}</span></button>
          <button class="text-link" aria-expanded={placing === j.id} aria-label={`${t('satchel.day')}: ${j.name}`} onclick={() => openDays(j)}><span>{t('satchel.day')}</span></button>
          <button class="text-link" aria-label={t('row.srDelete', { job: j.name })} onclick={() => remove(j)}><span>{t('job.delete')}</span></button>
        </div>
        {#if placing === j.id}<DayPick from={v.day} label={t('satchel.day')} pick={d => place(j, d)} />{/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  .say-note { margin-top: 4px; text-align: left; }
  /* the satchel on its shelf by the lamp (the Phase 4 mock-up, direction D) */
  .art { display: block; width: calc(100% + 36px); margin: 0 -18px 6px; aspect-ratio: 3 / 2; object-fit: cover;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 80%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 80%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%);
    mask-composite: intersect; transform-origin: 50% 0; will-change: transform, opacity; }
  .new { display: flex; gap: 10px; margin: 4px 0 10px; }
  .new input { flex: 1; min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: 17px; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .new .btn-quiet { padding: 0 14px; }
  .new .btn-quiet:disabled { opacity: .5; }
  .empty { margin-top: 10px; }
  .item { border-bottom: 1px solid var(--edge-1, rgba(255, 255, 255, .06)); padding-bottom: 4px; }
  button.row { width: 100%; text-align: left; border-bottom: 0; }
  .preview { display: block; width: 100%; text-align: left; padding: 0 0 4px 22px; background: none; border: 0; cursor: pointer;
    font-family: var(--life); font-style: italic; font-size: 16px; color: var(--ink-2); }
  .list { display: block; width: 100%; margin: 2px 0 6px; padding: 8px 12px; font: inherit; font-size: 17px; line-height: 1.4; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; resize: vertical; }
  .full { margin: -2px 0 6px; font-size: 15px; font-style: italic; }
  .acts { display: flex; flex-wrap: wrap; gap: 0 16px; padding-left: 22px; }
  .acts .text-link { min-height: 44px; min-width: 44px; font-size: 15px; }
  .said { font-family: var(--life); font-style: italic; font-size: 15.5px; color: var(--ink-2); text-align: center; margin: 4px 0 8px; }
  button.home { color: var(--ink-2); }
</style>
