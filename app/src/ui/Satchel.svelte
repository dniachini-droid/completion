<script lang="ts">
  /* The Satchel (D-126; one place for every job, D-131): every job that isn't on today, each in one place. "No day yet"
     (one-offs with no day, newest first, with their lists), "Coming up" (one-offs put on a later day, each with its
     day: a tap on the day moves it), "Recurring jobs". On its day a job moves to Today; if the day passes undone it
     comes back to "No day yet"; done, it is in the Daybook. One box to add a job: "Delve now" (a one-off on today, its
     delve begun at once) or "Save for later" (no day). A tap delves; a slide shows Edit and Delete (with Undo). No
     counts, no ages, nothing red (rule 9). As Dan types, the jobs he has had before come up under the box (D-136): one
     picked carries on from the one before; one still his (recurring, or still to do) is never added twice. A name added
     a third time in 28 days is offered, once, as a recurring job. */
  import { game, content } from './game.svelte';
  import { t, byWords, dayShort, oftenWords, minutesShort, minutesWords } from '../content/copy/en';
  import { satchelView, LIST_MAX } from '../core/game';
  import { cleanLine, repeatOffer, suggest, tieFor, type Suggestion } from '../core/remember';
  import { nameKey } from '../core/week';
  import type { Job } from '../core/types';
  import Scene from './Scene.svelte';
  import Deleted from './Deleted.svelte';
  import DayPick from './DayPick.svelte';
  import SwipeRow from './SwipeRow.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { flushSync, onMount } from 'svelte';
  import { steady } from './taps';
  import { openMenu, openTick } from './menu.svelte';
  import art from './scene/satchel.jpg';

  /* `to`: 'recurring' opens at that section (the Week). Today's "+ Add" focuses the box itself, inside its tap, so the
     phone's keyboard opens; nothing here focuses it again on the way back (review of D-131) */
  let { go, to }: { go: Go; to?: string } = $props();
  const v = $derived(game.view);
  /* a job not done today can be ticked off, done without a delve (D-134); not while a delve runs */
  const canTick = (j: Job) => !v.done.has(j.id) && !v.run;
  const s = $derived(satchelView(content, game.facts, game.now));
  let text = $state('');
  let input = $state<HTMLInputElement | null>(null);
  /* one job at a time has its list open, or its days */
  let listing = $state<string | null>(null), placing = $state<string | null>(null), draft = $state('');
  let said = $state<string | null>(null);
  let box = $state<HTMLTextAreaElement | null>(null);
  let recurringEl = $state<HTMLElement | null>(null);
  /* the job picked from under the box (D-136): it holds while the box still says its name */
  let picked = $state<string | null>(null);
  const pickedJob = $derived(picked ? v.content.jobs.find(j => j.id === picked) : undefined);
  const tied = $derived(!!pickedJob && nameKey(pickedJob.name) === nameKey(text));
  const before = $derived<Suggestion[]>(text.trim() && !tied ? suggest(content, game.facts, text) : []);
  /* the day alone, so the offer is worked out again only when the facts or the day change, not each second (D-132) */
  const day = $derived(v.day);
  const offer = $derived(repeatOffer(content, game.facts, day));

  onMount(() => {
    if (to === 'recurring') recurringEl?.scrollIntoView({ block: 'start' });
  });

  /* "Delve now": a one-off on today, its delve begun at once (D-131); "Save for later": no day */
  function now() {
    const line = text.trim();
    if (!line || v.run || v.runEnd) return;
    steady(); saveList();
    game.do({ do: 'delveNow', line, ...(tied ? { from: picked! } : {}) });
    text = ''; picked = null;
    if (game.view.run) go('delve');
  }
  function later() {
    const line = cleanLine(text);
    if (!line) return;
    steady();
    const tie = tieFor(content, game.facts, line, tied ? picked! : undefined);
    text = ''; picked = null;
    /* a job still Dan's is already in its place: say where (D-136) */
    if (tie?.same) { said = where(tie.job); return; }
    game.do({ do: 'saveForLater', line, ...(tie ? { from: tie.job.id } : {}) }); said = t('satchel.saved', { job: line });
  }
  function where(j: Job): string {
    if (s.recurring.some(x => x.id === j.id)) return t('satchel.have.recurring', { job: j.name });
    const coming = s.coming.find(x => x.job.id === j.id);
    if (coming) return t('satchel.have.coming', { job: j.name, day: dayShort(coming.day) });
    return t(s.noDay.some(x => x.id === j.id) ? 'satchel.have.noDay' : 'satchel.have.today', { job: j.name });
  }
  /* a job from before fills the box; the box keeps the keyboard (no press takes its focus) */
  function choose(x: Suggestion) { text = x.job.name; picked = x.job.id; said = null; }
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
     included), not only on Close (review, D-126) */
  function keep() { if (listing) game.do({ do: 'listJob', job: listing, list: draft }); }
  function saveList() {
    if (!listing) return;
    keep();
    listing = null;
  }
  $effect(() => () => keep());
  function openDays(j: Job) { saveList(); said = null; placing = placing === j.id ? null : j.id; }
  function place(j: Job, day: string) {
    steady(); game.do({ do: 'putOnDay', job: j.id, day });
    placing = null; said = t('satchel.placed', { job: j.name, day: day === v.day ? t('pick.today') : dayShort(day) });
  }
  function remove(j: Job) { saveList(); placing = null; said = null; game.remove(j.id); }
  function delve(j: Job) { saveList(); go('set', j.id); }
  function edit(j: Job) { saveList(); go('rhythms', j.id); }
  const acts = (j: Job) => [
    { label: t('menu.edit'), sr: t('menu.srEdit', { job: j.name }), run: () => edit(j) },
    { label: t('job.delete'), sr: t('row.srDelete', { job: j.name }), run: () => remove(j), del: true },
  ];
  const menu = (j: Job) => () => { saveList(); openMenu(j.id, go); };
  const rhythmOf = (j: Job) => v.content.rhythms.find(r => r.job === j.id);

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
    <!-- kept in its place while the suggestions show, so the box never moves as Dan types (review of D-136) -->
    <p class="soft say-note rise">{t('satchel.say')}</p>
    <!-- the one box for a new job (D-131): delve on it now, or keep it for later -->
    <form class="new satchel-add rise" onsubmit={(e) => { e.preventDefault(); later(); }}>
      <input bind:this={input} bind:value={text} oninput={() => (said = null)} aria-label={t('satchel.add')} placeholder={t('satchel.add.hint')} maxlength="120" enterkeyhint="done" autocomplete="off" />
      <div class="two">
        <button class="btn-quiet" type="button" disabled={!text.trim() || !!v.run || !!v.runEnd} onclick={now}><span>{t('satchel.now')}</span></button>
        <button class="btn-quiet" type="submit" disabled={!text.trim()}><span>{t('satchel.later')}</span></button>
      </div>
      <!-- the jobs Dan has had before (D-136): under the box and its buttons, so nothing he aims at moves as he types -->
      {#if before.length}
        <ul class="before" aria-label={t('satchel.before')}>
          {#each before as x (x.job.id)}
            <li><button type="button" class="pick" onpointerdown={e => e.preventDefault()} onclick={() => choose(x)}
              aria-label={x.usual ? t('satchel.pick.sr', { job: x.job.name, min: minutesWords(x.usual) }) : x.job.name}>
              <span class="t">{x.job.name}</span>{#if x.usual}<span class="u" aria-hidden="true">{t('satchel.usually', { min: minutesShort(x.usual) })}</span>{/if}
            </button></li>
          {/each}
        </ul>
      {/if}
    </form>
  </header>

  <div class="body col rise d1" onscroll={shrink}>
    <!-- the one offer (D-136): a name added a third time in 28 days; "No thanks" and it is never asked again -->
    {#if offer}
      <div class="offer" role="group" aria-labelledby="offer-q">
        <p id="offer-q">{t('satchel.offer', { job: offer.name })}</p>
        <div class="acts center">
          <button class="text-link" onclick={() => { saveList(); go('rhythms', `repeat:${offer.job}`); }}><span>{t('satchel.offer.yes')}</span></button>
          <button class="text-link" onclick={() => game.do({ do: 'declineRepeat', name: offer.name })}><span>{t('satchel.offer.no')}</span></button>
        </div>
      </div>
    {/if}
    <!-- what the box just did, under it, where the eye is (D-136) -->
    {#if said}<p class="said" role="status">{said}</p>{/if}
    <img class="art" bind:this={artEl} src={art} alt="" aria-hidden="true" />
    <Deleted />

    <div class="label-line">{t('satchel.noDay')}</div>
    {#if !s.noDay.length}<p class="soft empty">{t('satchel.empty')}</p>{/if}
    <div class="rows">
    {#each s.noDay as j (j.id)}
      <div class="item">
        <!-- while a delve runs, a tap here can't start another: as on Today (break-it review 6) -->
        <SwipeRow key={`s:${j.id}`} actions={acts(j)} tap={() => delve(j)} hold={menu(j)} disabled={!!v.run}>
          {#snippet lead()}{#if canTick(j)}<button class="tickbtn" aria-label={t('tick.sr', { job: j.name })} onclick={() => openTick(j.id, go)}><span class="ring"></span></button>{/if}{/snippet}
          {#snippet row()}<span class="pip" class:under={canTick(j)}></span><span class="t">{j.name}</span><span class="s">{j.by ? byWords(j.by) : ''}</span>{/snippet}
        </SwipeRow>
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
        </div>
        {#if placing === j.id}<DayPick from={v.day} label={t('satchel.day')} pick={d => place(j, d)} />{/if}
      </div>
    {/each}
    </div>

    {#if s.coming.length}
      <div class="label-line">{t('satchel.coming')}</div>
      <div class="rows">
      {#each s.coming as x (x.job.id)}
        <div class="item">
          <SwipeRow key={`s:${x.job.id}`} actions={acts(x.job)} tap={() => delve(x.job)} hold={menu(x.job)} disabled={!!v.run}>
            {#snippet lead()}{#if canTick(x.job)}<button class="tickbtn" aria-label={t('tick.sr', { job: x.job.name })} onclick={() => openTick(x.job.id, go)}><span class="ring"></span></button>{/if}{/snippet}
            {#snippet row()}<span class="pip" class:under={canTick(x.job)}></span><span class="t">{x.job.name}</span><span class="s ghost" aria-hidden="true">{dayShort(x.day)}</span>{/snippet}
            <!-- the day is its own button: a tap on it moves the job (D-131) -->
            {#snippet over()}<button class="text-link day" aria-expanded={placing === x.job.id} aria-label={t('satchel.move', { job: x.job.name, day: dayShort(x.day) })} onclick={() => openDays(x.job)}><span>{dayShort(x.day)}</span></button>{/snippet}
          </SwipeRow>
          {#if placing === x.job.id}<DayPick from={v.day} label={t('satchel.day')} pick={d => place(x.job, d)} />{/if}
        </div>
      {/each}
      </div>
    {/if}

    <div class="label-line" bind:this={recurringEl}>{t('satchel.recurring')}</div>
    <div class="rows">
    {#each s.recurring as j (j.id)}
      {@const r = rhythmOf(j)}
      <SwipeRow key={`s:${j.id}`} actions={acts(j)} tap={() => delve(j)} hold={menu(j)} disabled={!!v.run}>
        {#snippet lead()}{#if canTick(j)}<button class="tickbtn" aria-label={t('tick.sr', { job: j.name })} onclick={() => openTick(j.id, go)}><span class="ring"></span></button>{/if}{/snippet}
        {#snippet row()}<span class="pip" class:under={canTick(j)}></span><span class="t">{j.name}{#if r}<small>{oftenWords(r)} · {minutesShort(j.length)}</small>{/if}</span><span class="s">{r?.time ?? ''}</span>{/snippet}
      </SwipeRow>
    {/each}
    </div>
    <div class="links"><button class="text-link" onclick={() => go('rhythms', 'new')}><span>{t('satchel.recurring.add')}</span></button></div>
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
  .new { display: flex; flex-direction: column; gap: 8px; margin: 10px 0 4px; }
  .new input { min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: 17px; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .new .btn-quiet { padding: 0 8px; min-height: 44px; }
  .new .btn-quiet:disabled { opacity: .5; }
  .label-line { margin-top: 18px; margin-bottom: 4px; }
  .empty { margin: 6px 0 4px; text-align: left; }
  .item { padding-bottom: 2px; }
  .rows :global(.row small) { display: block; font-size: 14px; color: var(--ink-2); margin-top: 2px; }
  .ghost { visibility: hidden; }
  .day { min-height: 44px; padding: 0 0 0 12px; }
  .day span { font-size: 16px; color: var(--violet-hi); }
  .preview { display: block; width: 100%; text-align: left; padding: 0 0 4px 32px; background: none; border: 0; cursor: pointer;
    font-family: var(--life); font-style: italic; font-size: 16px; color: var(--ink-2); }
  .list { display: block; width: 100%; margin: 2px 0 6px; padding: 8px 12px; font: inherit; font-size: 17px; line-height: 1.4; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; resize: vertical; }
  .full { margin: -2px 0 6px; font-size: 15px; font-style: italic; }
  .acts { display: flex; flex-wrap: wrap; gap: 0 16px; padding-left: 32px; }
  .acts .text-link { min-height: 44px; min-width: 44px; font-size: 15px; }
  .said { font-family: var(--life); font-style: italic; font-size: 15.5px; color: var(--ink-2); text-align: center; margin: 4px 0 8px; }
  .links { display: flex; justify-content: center; margin-top: 12px; }
  button.home { color: var(--ink-2); }
  /* the jobs from before (D-136): quiet lines under the box, a finger high, the name first; nothing moves */
  .before { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--edge-2); }
  .pick { display: flex; align-items: baseline; gap: 12px; width: 100%; min-height: 44px; padding: 10px 12px; text-align: left;
    background: rgba(255, 255, 255, .03); border: 0; border-bottom: 1px solid var(--edge-2); cursor: pointer; font: inherit; color: #fff; }
  .pick .t { flex: 1; min-width: 0; font-size: 17px; overflow-wrap: anywhere; }
  .pick .u { flex: none; font-family: var(--life); font-style: italic; font-size: 15px; color: var(--ink-2); }
  .offer { margin: 8px 0 6px; padding: 10px 12px 2px; border: 1px solid var(--edge-2); background: rgba(255, 255, 255, .04); }
  .offer p { margin: 0; font-family: var(--life); font-style: italic; font-size: 16px; color: var(--ink); text-align: center; }
  .acts.center { justify-content: center; padding-left: 0; }
</style>
