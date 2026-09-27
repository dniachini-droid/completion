<script lang="ts">
  /* The daybook: the week close (TOOLS §6; BALANCING §7; mock-up daybook.html). One short page a week, written from real
     completions: what the week held, where it went, up to three things learned, the month's "so far" on its first page,
     the counts the week's Keys filled, and a glimpse of next week. No charts, no percentages, no comparisons. A thin week
     gets a different kind of page, not a shorter one; a week with nothing done gets none. The newest page ends with one
     quiet offer to plan the week ahead (D-045), never repeated. */
  import { game, content } from './game.svelte';
  import { t, card, timesWords } from '../content/copy/en';
  import { calendarWeek } from '../core/time';
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
  const offer = $derived(fresh && !game.facts.some(f => f.type === 'offerAnswered' && f.week === page!.week));

  const held = $derived.by(() => {
    if (!page) return [];
    const n = new Map<string, number>();
    for (const f of game.facts) if (f.type === 'jobDone' && calendarWeek(f.day) === page.week) n.set(f.job, (n.get(f.job) ?? 0) + 1);
    return [...n].map(([job, k]) => ({ name: game.job(job)?.name ?? job, k }));
  });
  const places = $derived(page ? game.facts.filter((f): f is FactOf<'arrived'> => f.type === 'arrived' && f.kind === 'place' && calendarWeek(f.day) === page.week)
    .map(f => beatOf(s, f.id)?.name).filter((x): x is string => !!x) : []);
  const line = (list: { id: string; line: string }[], id: string) => list.find(x => x.id === id)?.line ?? '';
  /* on a page with the month's "so far", a learned line it already covers (the same beats) isn't said twice */
  const soFarItems = s.soFar.flatMap(m => m.items ?? []);
  const learned = $derived.by(() => {
    if (!page) return [];
    const covered = new Set(page.soFar.flatMap(id => soFarItems.find(x => x.id === id)?.req ?? []));
    return page.learned.filter(id => !(s.learned.find(l => l.id === id)?.req ?? []).every(r => covered.has(r)));
  });

  function read() { if (page && fresh) game.do({ do: 'closeRead', week: page.week }); }
  function leave() { read(); go('back'); }
  function planIt() {
    if (!page) return;
    game.do({ do: 'offerAnswered', week: page.week }); read();
    const wk = calendarWeek(v.day);
    if (!game.facts.some(f => f.type === 'planMade' && f.week === wk)) game.do({ do: 'planWeek', week: wk });
    go('week');
  }
  function notNow() { if (page) game.do({ do: 'offerAnswered', week: page.week }); leave(); }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={leave}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span>
      <!-- settings (reminders, the save's copies; the trial's controls under it): in the daybook, out of the day's way
           (D-080, D-093, D-107) -->
      <button class="icon-link trial" onclick={() => go('settings')}><span>{t('nav.settings')}</span></button>
    </div>
    <div class="label-line rise">{t('daybook.label')}</div>
    {#if page}
      <h1 class="carve lg rise">{t('daybook.week', { n: card(page.n) })}</h1>
      <p class="soft written rise">{t('daybook.written')}</p>
    {/if}
  </header>

  <div class="body col rise d1">
    {#if !page}
      <p class="soft">{t('daybook.none')}</p>
    {:else}
      <div class="rows">
        {#each held as h (h.name)}
          <div class="row still"><span class="pip done"></span><span class="t">{h.name}</span><span class="s">{timesWords(h.k)}</span></div>
        {/each}
      </div>
      {#if places.length}
        <div class="label-line">{t('daybook.went')}</div>
        <p class="say went">{places.join(' · ')}</p>
      {:else}<p class="say went">{t('daybook.camped')}</p>{/if}
      {#each page.seals as id (id)}{@const x = sealOf(s, id)}{#if x}<p class="say count">{t('daybook.count', { where: x.where })}</p>{/if}{/each}
      {#if learned.length}
        <div class="label-line">{t('daybook.learned')}</div>
        {#each learned as id (id)}<p class="say learned">{line(s.learned, id)}</p>{/each}
      {/if}
      {#if page.soFar.length}
        <div class="label-line">{t('daybook.soFar')}</div>
        {#each page.soFar as id (id)}<p class="say learned">{line(soFarItems, id)}</p>{/each}
      {/if}
      {#if page.glimpse}
        <div class="label-line lit">{t('daybook.next')}</div>
        <p class="say glimpse">{beatOf(s, page.glimpse)?.line ?? ''}</p>
      {/if}
      {#if offer}
        <div class="offer">
          <p class="say">{t('daybook.offer')}</p>
          <button class="btn" onclick={planIt}>{t('daybook.planIt')}</button>
          <div class="btn-row after"><button class="btn-quiet" onclick={notNow}><span>{t('daybook.notNow')}</span></button></div>
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
  .label-line { margin-top: 14px; }
  .learned { margin-top: 8px; font-size: 16.5px; line-height: 1.45; }
  .glimpse { margin-top: 8px; font-style: italic; color: #fff; line-height: 1.45; }
  .offer { margin-top: 22px; border-top: 1px solid var(--edge-2); padding-top: 14px; }
  .offer .say { margin-bottom: 12px; }
  .after { margin-top: 12px; }
  .pager { display: flex; justify-content: space-between; margin-top: 18px; }
  button.home { color: var(--ink-2); }
  .trial span { font-size: 12px; letter-spacing: .14em; color: var(--ink-3); }
</style>
