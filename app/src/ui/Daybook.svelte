<script lang="ts">
  import { onMount } from 'svelte';
  import { doneFacts } from '../core/done';
  import Deleted from './Deleted.svelte';
  /* The daybook: the week close (TOOLS §6; BALANCING §7; mock-up daybook.html). One short page a week, written from real
     completions: what the week held, where it went, up to three things learned, the month's "so far" on its first page,
     the counts the week's Keys filled, and a glimpse further on (never "next week": one continuous story, D-123, D-130).
     Each page is titled by its dates. No charts, no percentages, no comparisons. A thin week
     gets a different kind of page, not a shorter one; a week with nothing done gets none. The newest page ends with one
     quiet offer to plan the week ahead (D-045), never repeated. */
  import { game, content } from './game.svelte';
  import { t, weekDatesShort, timesWords, dayName, byWords } from '../content/copy/en';
  import { comingUp, sweepOf, addDays } from '../core/week';
  import { calendarWeek } from '../core/time';
  import { hiddenDone, weekKept, paintingOf } from '../core/game';
  import { beatOf, sealOf } from '../core/story';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import type { FactOf } from '../core/types';

  let { go, week }: { go: Go; week?: string } = $props();
  const s = content.story;
  const v = $derived(game.view);
  const pages = $derived(game.facts.filter((f): f is FactOf<'weekClosed'> => f.type === 'weekClosed'));
  const page = $derived(pages.find(p => p.week === week) ?? pages[pages.length - 1]);
  const at = $derived(page ? pages.indexOf(page) : -1);
  const fresh = $derived(!!page && v.close?.week === page.week);
  /* the offer stays on the newest page until it is answered, or its week is over: leaving by the arrow is no answer
     (N clumsy 2) */
  const offer = $derived(!!page && at === pages.length - 1 && calendarWeek(v.day) === addDays(page.week, 7)
    && !game.facts.some(f => f.type === 'offerAnswered' && f.week === page!.week));
  /* what the week left to read again (D-143 B): its finds, and the niches its Keys opened */
  const kept = $derived(page ? weekKept(game.facts, page.week) : { finds: [], opened: [] });
  const findLine = (id: string) => s.finds.find(f => f.id === id)?.line ?? '';

  const held = $derived.by(() => {
    if (!page) return [];
    const n = new Map<string, number>();
    /* a deleted job, or a deleted record, leaves the page too (D-125) */
    const hidden = hiddenDone(game.facts);
    for (const f of doneFacts(game.facts)) if (calendarWeek(f.day) === page.week && game.job(f.job) && !hidden.has(`${f.job}|${f.day}`)) n.set(f.job, (n.get(f.job) ?? 0) + 1);
    return [...n].map(([job, k]) => ({ id: job, name: game.job(job)!.name, k }));
  });
  const places = $derived(page ? game.facts.filter((f): f is FactOf<'arrived'> => f.type === 'arrived' && f.kind === 'place' && calendarWeek(f.day) === page.week)
    .map(f => beatOf(s, f.id)?.name).filter((x): x is string => !!x) : []);
  /* the page leads with the furthest place the week reached, in its own painting (MORNING-REPORT Part 3 #9) */
  const furthest = $derived.by(() => {
    const f = page ? game.facts.filter((x): x is FactOf<'arrived'> => x.type === 'arrived' && x.kind === 'place' && calendarWeek(x.day) === page.week).pop() : undefined;
    const b = f ? beatOf(s, f.id) : undefined;
    return b?.name ? { name: b.name, painting: paintingOf(b.id, b.stretch) } : null;
  });
  /* what the week held, on one line */
  const tally = $derived(held.map(h => `${h.name} ${timesWords(h.k)}`).join(' · '));
  const line = (list: { id: string; line: string }[], id: string) => list.find(x => x.id === id)?.line ?? '';
  /* on a page with the month's "so far", a learned line it already covers (the same beats) isn't said twice */
  const soFarItems = s.soFar.flatMap(m => m.items ?? []);
  const learned = $derived.by(() => {
    if (!page) return [];
    const covered = new Set(page.soFar.flatMap(id => soFarItems.find(x => x.id === id)?.req ?? []));
    return page.learned.filter(id => !(s.learned.find(l => l.id === id)?.req ?? []).every(r => covered.has(r)));
  });

  /* plain, not watched: once read by a tap, a teardown (which sees the page as it was before that tap) does nothing
     (deep review NEW-1) */
  let wasRead = false;
  function read() { if (wasRead) return; if (page && fresh) { wasRead = true; game.do({ do: 'closeRead', week: page.week }); } }
  function leave() { read(); go('back'); }
  /* left by any way (the phone's back too): the page was shown, so it is read, as the arrow does (review of D-144) */
  onMount(() => () => read());
  function planIt() {
    if (!page) return;
    game.do({ do: 'offerAnswered', week: page.week }); read();
    const wk = calendarWeek(v.day);
    if (!game.facts.some(f => f.type === 'planMade' && f.week === wk)) game.do({ do: 'planWeek', week: wk });
    toWeek();
  }
  /* the week laid out, its arrow says Today: never back through the Daybook (L B4) */
  function toWeek() { go('back'); go('week'); }

  /* the week's look-ahead (D-116): about a minute, every step skippable, offered once; it earns nothing (P16) */
  let step = $state(0);
  const sweep = $state(sweepOf(game.facts, game.view.day));
  let swept = $state(0);
  const coming = $derived(step === 2 ? comingUp(v.content, game.facts, v.day) : []);
  const pickable = $derived(step === 3 ? v.content.jobs.filter(j => !j.stopped && !(doneFacts(game.facts).some(f => f.job === j.id) && !v.content.rhythms.some(r => r.job === j.id))) : []);
  /* the page is marked read at the end, not here: marking it read ends the offer this look-ahead lives in */
  function lookAhead() { step = sweep.length ? 1 : 2; }
  function sweepAnswer(what: 'keep' | 'letGo') {
    const it = sweep[swept];
    /* letting go is a Delete like any other: guarded, with Undo (break-it review 7) */
    if (it) { if (what === 'keep') game.do({ do: 'keepItem', id: it.id }); else game.remove(it.id); }
    swept++;
    if (swept >= sweep.length) step = 2;
  }
  function pinIt(job: string | null) {
    if (!page) return;
    game.do({ do: 'pinWeek', job });
    game.do({ do: 'replan' });
    game.do({ do: 'offerAnswered', week: page.week });
    game.do({ do: 'lookAhead', finished: true });
    read();
    toWeek();
  }
  function comingLine(x: ReturnType<typeof comingUp>[number]) {
    const name = game.job(x.job)?.name ?? '';
    return x.kind === 'time' ? `${dayName(x.day)} ${x.time} · ${name}` : x.kind === 'date' ? `${name} · ${byWords(x.day)}` : `${dayName(x.day)} · ${name}`;
  }
</script>

<Scene painting={furthest?.painting ?? v.here.painting} blur={!furthest} top="200px" bottom="70%" />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={leave}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <div class="label-line rise">{t('daybook.label')}</div>
    {#if page}
      <h1 class="carve lg rise">{weekDatesShort(page.week)}</h1>
      <p class="soft written rise">{t('daybook.written')}</p>
    {/if}
  </header>

  <div class="body col rise d1">
    <Deleted />
    {#if !page}
      <p class="soft">{t('daybook.none')}</p>
    {:else}
      <!-- a chapter, not a ledger (MORNING-REPORT Part 3 #9): the furthest place first, then what was learned, then further
           on; what the week held on one line -->
      {#if furthest}
        <div class="label-line lit">{t('daybook.reached')}</div>
        <p class="say-lg reached">{furthest.name}</p>
        {#if places.length > 1}<p class="soft went">{t('daybook.wentBy', { places: places.slice(0, -1).join(' · ') })}</p>{/if}
      {:else}<p class="say went">{t('daybook.camped')}</p>{/if}
      {#if learned.length}
        <div class="label-line">{t('daybook.learned')}</div>
        {#each learned as id (id)}<p class="say learned">{line(s.learned, id)}</p>{/each}
      {/if}
      {#if page.soFar.length}
        <div class="label-line">{t('daybook.soFar')}</div>
        {#each page.soFar as id (id)}<p class="say learned">{line(soFarItems, id)}</p>{/each}
      {/if}
      {#if kept.finds.length}
        <div class="label-line">{t('daybook.finds')}</div>
        {#each kept.finds as id (id)}{#if findLine(id)}<p class="say learned">{findLine(id)}</p>{/if}{/each}
      {/if}
      <!-- every niche a Key opened that week, each to read again (S4, D-143 B) -->
      {#each kept.opened as id (id)}{@const x = sealOf(s, id)}{#if x}<p class="say count">{t('daybook.count', { where: x.where })} <button class="text-link again" onclick={() => go('opened', `again:${id}`)}><span>{t('daybook.readAgain')}</span></button></p>{/if}{/each}
      {#if page.glimpse}
        <div class="label-line lit">{t('daybook.next')}</div>
        <p class="say glimpse">{beatOf(s, page.glimpse)?.line ?? ''}</p>
      {/if}
      {#if tally}<p class="soft tally">{tally}</p>{/if}
      {#if offer}
        <div class="offer">
          {#if step === 0}
            <!-- one quiet line at the foot (MORNING-REPORT, simplify 3): left alone, it stays until the week is over -->
            <p class="look-line"><button class="text-link" onclick={lookAhead}><span>{t('look.go')}</span></button> <span aria-hidden="true">·</span> <button class="text-link" onclick={planIt}><span>{t('daybook.planIt')}</span></button></p>
          {:else if step === 1 && sweep[swept]}
            <div class="label-line">{t('look.still')}</div>
            <p class="say line">{sweep[swept].name}</p>
            <div class="seg" role="group" aria-label={t('look.still')}>
              <button onclick={() => sweepAnswer('keep')}>{t('look.keep')}</button>
              <button onclick={() => sweepAnswer('letGo')}>{t('by.letGo')}</button>
            </div>
            <div class="btn-row after"><button class="btn-quiet" onclick={() => (step = 2)}><span>{t('look.skip')}</span></button></div>
          {:else if step === 1 || step === 2}
            <div class="label-line">{t('look.coming')}</div>
            {#each coming.slice(0, 5) as x, i (x.day + x.job + x.kind + i)}<p class="say line">{comingLine(x)}</p>{:else}<p class="soft">{t('look.nothing')}</p>{/each}
            {#if coming.length > 5}<p class="soft">{t('look.more')}</p>{/if}
            <button class="btn next" onclick={() => (step = 3)}>{t('look.next')}</button>
          {:else}
            <div class="label-line">{t('look.matters')}</div>
            <div class="rows">
              {#each pickable as j (j.id)}<button class="row" onclick={() => pinIt(j.id)}><span class="pip"></span><span class="t">{j.name}</span><span class="s"></span></button>{/each}
            </div>
            <div class="btn-row after"><button class="btn-quiet" onclick={() => pinIt(null)}><span>{t('look.nothingParticular')}</span></button></div>
          {/if}
        </div>
      {/if}
      <div class="pager">
        {#if at > 0}<button class="text-link" onclick={() => { read(); go('daybook', pages[at - 1].week); }}><span>{t('daybook.earlier')}</span></button>{:else}<span></span>{/if}
        {#if at < pages.length - 1}<button class="text-link" onclick={() => go('daybook', pages[at + 1].week)}><span>{t('daybook.later')}</span></button>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  .written { font-style: italic; margin-top: 2px; }
  h1 { margin-top: 6px; }
  .row.still { cursor: default; }
  .went { margin: 8px 0 12px; }
  .count { color: var(--gold-hi); margin-bottom: 10px; }
  .count .again { min-height: 0; padding: 2px 0; }
  .count .again span { font-size: calc(15px * var(--ts, 1)); }
  .label-line { margin-top: 14px; }
  .learned { margin-top: 8px; font-size: calc(16.5px * var(--ts, 1)); line-height: 1.45; }
  .glimpse { margin-top: 8px; font-style: italic; color: #fff; line-height: 1.45; }
  .offer { margin-top: 22px; border-top: 1px solid var(--edge-2); padding-top: 14px; }
  .look-line { display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0; font-style: italic; }
  .look-line .text-link { min-height: 44px; }
  .reached { margin-top: 6px; color: #fff; }
  .tally { margin-top: 18px; font-style: italic; line-height: 1.45; }
  .offer .say { margin-bottom: 12px; }
  .after { margin-top: 12px; }
  .offer .line { margin: 6px 0; }
  .offer .seg { margin-top: 10px; }
  .offer .next { margin-top: 14px; }

  .offer button.row { width: 100%; text-align: left; }
  .pager { display: flex; justify-content: space-between; margin-top: 18px; }
  button.home { color: var(--ink-2); }
</style>
