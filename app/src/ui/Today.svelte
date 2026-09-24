<script lang="ts">
  /* Today (the morning screen, UX_PRINCIPLES → "The morning screen carries"): where you are, the sealed thing ahead,
     Low / Normal / High, the one next job with Begin and Swap, today's other jobs as plain rows, "I can't start".
     After day complete: the day as done, not a next job. Mock-up: design/directions/d-combined/morning.html. */
  import { game, content } from './game.svelte';
  import { presetRun } from '../core/game';
  import type { Capacity, Job } from '../core/types';
  import { t, minutesWords, delves, inSentence } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const job = (id: string) => content.jobs.find(j => j.id === id)!;
  const next = $derived(v.next ? job(v.next.job) : null);
  const weekday = $derived(t(`day.${new Date(Date.UTC(+v.day.slice(0, 4), +v.day.slice(5, 7) - 1, +v.day.slice(8, 10))).getUTCDay()}` as never));
  const others = $derived(v.slate.filter(id => id !== v.next?.job));
  const lastPlace = $derived(v.lastArrival);

  function rowNote(j: Job): string {
    if (v.done.has(j.id)) return t('row.done');
    if (v.underWay === j.id) return t('row.underWay');
    if (!j.delve) return t('row.about', { len: minutesWords(j.length) });
    const r = presetRun(j);
    return r.count === 1 ? t('row.delve') : t('row.delves', { n: delves(r.count), len: r.minutes });
  }
  function teaser(j: Job): string {
    if (j.avoided) return t('today.teaser.avoided');
    return j.delve ? t('today.teaser.delve') : t('today.teaser.away');
  }

  function choose(c: Capacity) { game.do({ do: 'capacity', capacity: c }); }
  function begin(j: Job) {
    if (!j.delve) { game.do({ do: 'begin', job: j.id }); return; }
    const r = presetRun(j);
    /* Starting needs no decision: a short delve job starts at once; a longer one opens set to its enough (D-038, D-047) */
    if (r.count === 1 && r.minutes === 25) { game.do({ do: 'startRun', job: j.id, ...r }); go('delve'); }
    else go('set', j.id);
  }
  function done(j: Job) {
    const f = game.do({ do: 'done', job: j.id });
    const d = f.find(x => x.type === 'jobDone');
    if (d) go('step', d.seq);
  }
  function carry() { game.do({ do: 'resume' }); go('delve'); }
  function finish() { game.do({ do: 'finishHere' }); go('delve'); }
  function focus(id: string) { if (!v.done.has(id)) game.do({ do: 'focus', job: id }); }
  function keepGoing() {
    const id = v.order.find(x => !v.done.has(x) && job(x).delve) ?? v.order.find(x => job(x).delve)!;
    go('set', id);
  }
</script>

<Scene painting={v.here.painting} framed bottom="50%" />
<div class="ui">
  <header class="top col">
    <div class="topbar bar rise">
      <span class="day">{weekday}</span>
      <span class="navs">
        <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
        {#if v.story.records.length}<button class="icon-link" onclick={() => go('records')}><span>{t('records.nav')}</span></button>{/if}
      <button class="icon-link proto" onclick={() => go('proto')}>
        {#if game.proto.rehearsal}<span class="badge">{t('proto.badge')}</span>{:else}<span>{t('nav.proto')}</span>{/if}
      </button>
      </span>
    </div>
    <h1 class="carve lg rise">{v.here.name}</h1>
    <div class="seg rise d1" role="group" aria-label={t('today.capacity')}>
      {#each ['low', 'normal', 'high'] as const as c}
        <button aria-pressed={v.capacity === c} onclick={() => choose(c)}>{t(`cap.${c}`)}</button>
      {/each}
    </div>
    <p class="seg-note rise d1">{v.capacity === 'low' ? t('today.lighter') : t('today.suggested')}</p>
    {#if v.ahead}
      <section class="ahead rise d2">
        <div class="label-line">{t('today.ahead')}</div>
        <p class="say on-scene">{v.ahead}</p>
      </section>
    {/if}
  </header>

  <div class="mid"></div>

  <section class="bottom col rise d3">
    {#if v.next?.mode === 'carry' && v.run}
      <div class="next">
        <div class="label-line lit">{t('today.next')}</div>
        <h2 class="say-lg">{t('today.carry', { job: v.run.job.name })}</h2>
        <p class="soft">{t('today.carry.left', { min: minutesWords(Math.max(1, Math.ceil(v.run.leftMs / 60000))) })}</p>
        <div class="btn-row lead">
          <button class="btn" onclick={carry}>{t('today.carry.go')}</button>
          <button class="btn-quiet" onclick={finish}><span>{t('today.finishHere')}</span></button>
        </div>
      </div>
    {:else if v.next?.mode === 'underWay' && next}
      <div class="next">
        <div class="label-line lit">{t('today.underWay')}</div>
        <h2 class="say-lg">{next.name}</h2>
        <p class="soft">{t('today.underWay.say')}</p>
        <button class="btn" onclick={() => done(next)}>{t('today.done')}</button>
        <div class="gap"></div>
      </div>
    {:else if v.next && next}
      <div class="next">
        <div class="label-line lit">{t('today.next')}</div>
        <h2 class="say-lg">{next.name}</h2>
        <p class="soft">{teaser(next)}</p>
        <div class="btn-row lead">
          <button class="btn" onclick={() => begin(next)}>{t('today.begin')}</button>
          <button class="btn-quiet" onclick={() => game.do({ do: 'swap' })} aria-label={t('today.swap')}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 5h9.5L10 2.5M13 11H3.5L6 13.5" /></svg><span>{t('today.swap')}</span>
          </button>
        </div>
        <div class="cant">
          <button class="text-link" onclick={() => go('cant', next.id)}><span>{t('today.cantStart')}</span></button>
          <span class="dot" aria-hidden="true">·</span>
          <button class="text-link" onclick={() => done(next)}><span>{t('today.already')}</span></button>
        </div>
      </div>
    {:else}
      <div class="next">
        <div class="label-line gold">{t('today.label')}</div>
        <h2 class="say-lg">{t('today.enough')}</h2>
        {#if lastPlace}
          <p class="soft">{t(lastPlace.kind === 'place' ? 'today.reached' : 'today.camped', { place: inSentence(lastPlace.name) })}</p>
        {/if}
        <button class="btn gold resting" onclick={() => go('arrival')}>{t('today.look')}</button>
        <div class="btn-row after"><button class="btn-quiet" onclick={keepGoing}><span>{t('today.keepGoing')}</span></button></div>
        <div class="gap"></div>
      </div>
    {/if}

    {#if others.length}
      <div class="rows">
        {#each others as id (id)}
          {@const j = job(id)}
          <button class="row" class:done={v.done.has(id)} onclick={() => focus(id)} disabled={v.done.has(id) || !!v.run}>
            <span class="pip" class:done={v.done.has(id)}></span>
            <span class="t">{j.name}</span>
            <span class="s">{rowNote(j)}</span>
          </button>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  h1 { margin-top: 2px; }
  .seg { margin-top: 12px; }
  .seg-note { text-align: left; margin-top: 4px; }
  .ahead { margin-top: 12px; }
  .ahead p { font-size: 17.5px; line-height: 1.38; margin-top: 6px; }
  .bottom { padding-top: 8px; }
  .next h2 { margin: 8px 0 4px; }
  .next .soft { margin-bottom: 18px; }
  .cant { display: flex; justify-content: center; align-items: center; gap: 2px; margin-top: 4px; }
  .cant .dot { color: var(--ink-3); }
  .gap { height: 12px; }
  .after { margin-top: 12px; }
  .rows { margin-top: 2px; }
  button.row { width: 100%; text-align: left; }
  button.row:disabled { cursor: default; }
  .proto span { font-size: 14px; letter-spacing: .16em; color: var(--ink-3); }
  /* the day on the left; the map, records and the prototype's own link together on the right */
  .bar { display: flex; justify-content: space-between; }
  .navs { display: flex; gap: 4px; align-items: center; margin-right: -10px; }
  .navs span { font-size: 13px; letter-spacing: .14em; color: var(--ink-2); }
  .proto .badge { color: var(--gold); }
  @media (max-height: 800px) {
    .seg { margin-top: 10px; } .ahead { margin-top: 8px; } .ahead p { margin-top: 4px; } .next .soft { margin-bottom: 14px; }
    :global(.row) { min-height: 44px; }
  }
</style>
