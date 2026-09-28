<script lang="ts">
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
  import { comingUp, sweepOf } from '../core/week';
  import { calendarWeek } from '../core/time';
  import { hiddenDone } from '../core/game';
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
    /* a deleted job, or a deleted record, leaves the page too (D-125) */
    const hidden = hiddenDone(game.facts);
    for (const f of doneFacts(game.facts)) if (calendarWeek(f.day) === page.week && game.job(f.job) && !hidden.has(`${f.job}|${f.day}`)) n.set(f.job, (n.get(f.job) ?? 0) + 1);
    return [...n].map(([job, k]) => ({ id: job, name: game.job(job)!.name, k }));
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
  function notNow() { if (page) game.do({ do: 'offerAnswered', week: page.week }); if (step > 0) game.do({ do: 'lookAhead', finished: false }); leave(); }

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
    go('week');
  }
  function comingLine(x: ReturnType<typeof comingUp>[number]) {
    const name = game.job(x.job)?.name ?? '';
    return x.kind === 'time' ? `${dayName(x.day)} ${x.time} · ${name}` : x.kind === 'date' ? `${name} · ${byWords(x.day)}` : `${dayName(x.day)} · ${name}`;
  }
</script>

<Scene painting={v.here.painting} blur />
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
      <div class="rows">
        <!-- keyed by the job, not its name: two jobs may share a name ("Shopping" twice), and a repeated key crashed
             the page on every opening (break-it review 1) -->
        {#each held as h (h.id)}
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
          {#if step === 0}
            <p class="say">{t('look.offer')}</p>
            <button class="btn" onclick={lookAhead}>{t('look.go')}</button>
            <div class="btn-row after"><button class="btn-quiet" onclick={planIt}><span>{t('daybook.planIt')}</span></button><button class="btn-quiet" onclick={notNow}><span>{t('daybook.notNow')}</span></button></div>
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
  .label-line { margin-top: 14px; }
  .learned { margin-top: 8px; font-size: 16.5px; line-height: 1.45; }
  .glimpse { margin-top: 8px; font-style: italic; color: #fff; line-height: 1.45; }
  .offer { margin-top: 22px; border-top: 1px solid var(--edge-2); padding-top: 14px; }
  .offer .say { margin-bottom: 12px; }
  .after { margin-top: 12px; }
  .offer .line { margin: 6px 0; }
  .offer .seg { margin-top: 10px; }
  .offer .next { margin-top: 14px; }

  .offer button.row { width: 100%; text-align: left; }
  .pager { display: flex; justify-content: space-between; margin-top: 18px; }
  button.home { color: var(--ink-2); }
</style>
