<script lang="ts">
  /* Today (the morning screen, UX_PRINCIPLES → "The morning screen carries"): where you are, the sealed thing ahead,
     Low / Normal / High, the one next job with one button, today's other jobs as plain rows, "I can't start".
     A tap on a row makes it the next job, at any time of day; a swipe takes it off today; the last row chooses a delve
     on anything (D-077). After day complete: the day as done, until Dan taps a job or keeps going.
     Mock-up: design/directions/d-combined/morning.html. */
  import { game, content } from './game.svelte';
  import { presetRun } from '../core/game';
  import type { Capacity, Job } from '../core/types';
  import { t, minutesWords, delves, inSentence } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const job = (id: string) => game.job(id)!;
  const next = $derived(v.next ? job(v.next.job) : null);
  const weekday = $derived(t(`day.${new Date(Date.UTC(+v.day.slice(0, 4), +v.day.slice(5, 7) - 1, +v.day.slice(8, 10))).getUTCDay()}` as never));
  const others = $derived(v.slate.filter(id => id !== v.next?.job));
  const lastPlace = $derived(v.lastArrival);

  function rowNote(j: Job): string {
    if (v.done.has(j.id)) return t('row.done');
    if (v.underWay === j.id) return t('row.underWay');
    if (v.times[j.id]) return v.times[j.id];
    if (j.item) return t('row.oneOff');
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
  function focus(id: string) { if (swiped) { swiped = null; return; } if (!v.done.has(id)) game.do({ do: 'focus', job: id }); }
  function aside(id: string) { swiped = null; game.do({ do: 'setAside', job: id }); }

  /* a row slides left to show "Not today" (the phone's own gesture for taking something off a list) */
  let swiped = $state<string | null>(null), drag = $state<{ id: string; x0: number; y0: number; dx: number } | null>(null);
  const OPEN = 112;
  function down(e: PointerEvent, id: string) { if (!v.done.has(id) && !v.run) drag = { id, x0: e.clientX, y0: e.clientY, dx: swiped === id ? -OPEN : 0 }; }
  function move(e: PointerEvent) {
    if (!drag) return;
    const base = swiped === drag.id ? -OPEN : 0, dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 12) return;
    drag.dx = Math.min(0, Math.max(-OPEN - 24, base + dx));
  }
  function up() {
    if (!drag) return;
    const moved = Math.abs(drag.dx - (swiped === drag.id ? -OPEN : 0)) > 8;
    if (moved) { swiped = drag.dx < -OPEN / 2 ? drag.id : null; suppress = true; }
    drag = null;
  }
  let suppress = false;
  function tapRow(id: string) { if (suppress) { suppress = false; return; } focus(id); }
  const offset = (id: string) => drag?.id === id ? drag.dx : swiped === id ? -OPEN : 0;
</script>

<Scene painting={v.here.painting} framed bottom="50%" />
<div class="ui">
  <header class="top col">
    <div class="topbar bar rise">
      <span class="day">{weekday}</span>
      <span class="navs">
        <button class="icon-link" onclick={() => go('map')}><span>{t('map.nav')}</span></button>
        {#if v.story.records.length}<button class="icon-link" onclick={() => go('records')}><span>{t('records.nav')}</span></button>{/if}
      <!-- the trial controls live at camp; here only while a rehearsal is on, so it can't be missed (D-080) -->
      {#if game.proto.rehearsal}<button class="icon-link proto" onclick={() => go('proto')}><span class="badge">{t('proto.badge')}</span></button>{/if}
      </span>
    </div>
    <h1 class="carve lg rise">{v.here.name}</h1>
    <div class="seg rise d1" role="group" aria-label={t('today.capacity')}>
      {#each ['low', 'normal', 'high'] as const as c}
        <button aria-pressed={v.capacity === c} onclick={() => choose(c)}>{t(`cap.${c}`)}</button>
      {/each}
    </div>
    <p class="seg-note rise d1">{v.capacity === 'low' && !v.suggestedBy ? t('today.lighter') : v.capacity === v.suggested && v.suggestedBy ? t(v.suggestedBy === 'back' ? 'today.byBack' : 'today.byBedtime') : v.capacity === 'low' ? t('today.lighter') : t('today.suggested')}</p>
    {#if v.ahead}
      <section class="ahead rise d2">
        <div class="label-line">{t('today.ahead')}</div>
        <p class="say on-scene">{v.ahead}</p>
      </section>
    {/if}
  </header>

  <div class="mid"></div>

  <section class="bottom fit col rise d3">
    <!-- on a short phone the day scrolls; the foot's links never leave the screen (review finding ui-11) -->
    <div class="scroll">
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
    {:else if v.next?.mode === 'running' && v.run}
      <!-- a delve running while Dan looks at Today: one way back to it, nothing else (review finding, D-080) -->
      <div class="next">
        <div class="label-line lit">{t('today.underWay')}</div>
        <h2 class="say-lg">{v.run.job.name}</h2>
        <p class="soft">{t('today.running.say')}</p>
        <div class="lead"><button class="btn full" onclick={() => go('delve')}>{t('today.running.go')}</button></div>
        <div class="gap"></div>
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
        <h2 class="say-lg">{next.name}{#if v.times[next.id]}<span class="at"> · {v.times[next.id]}</span>{/if}</h2>
        <p class="soft">{teaser(next)}</p>
        {#if v.deepOffer}
          <p class="deep">{t('today.deep')} <button class="text-link" onclick={() => game.do({ do: 'callDeep' })}><span>{t('today.deep.call')}</span></button></p>
        {:else if v.deepCalled && !v.complete}<p class="deep">{t('today.deep.called')}</p>{/if}
        <div class="lead"><button class="btn full" onclick={() => begin(next)}>{next.delve ? t('today.delve') : t('today.begin')}</button></div>
        <div class="cant">
          <button class="text-link" onclick={() => go('cant', next.id)}><span>{t('today.cantStart')}</span></button>
          <span class="dot" aria-hidden="true">·</span>
          <button class="text-link" onclick={() => done(next)}><span>{t('today.already')}</span></button>
          <span class="dot" aria-hidden="true">·</span>
          <button class="text-link" onclick={() => aside(next.id)}><span>{t('today.notToday')}</span></button>
        </div>
      </div>
    {:else if !v.complete}
      <div class="next">
        <div class="label-line lit">{t('today.label')}</div>
        <h2 class="say-lg">{t('today.clear')}</h2>
        <p class="soft">{t('today.clear.say')}</p>
        <div class="gap"></div>
      </div>
    {:else}
      <div class="next">
        <div class="label-line gold">{t('today.label')}</div>
        <h2 class="say-lg">{t('today.enough')}</h2>
        {#if lastPlace}
          <p class="soft">{t(lastPlace.kind === 'place' ? 'today.reached' : 'today.camped', { place: inSentence(lastPlace.name) })}</p>
        {/if}
        <button class="btn gold resting" onclick={() => go('camp')}>{t('today.toCamp')}</button>
        <div class="btn-row after"><button class="btn-quiet" onclick={() => go('choose')}><span>{t('today.keepGoing')}</span></button></div>
        {#if lastPlace}<div class="cant"><button class="text-link" onclick={() => go('arrival')}><span>{t('today.look')}</span></button></div>{/if}
        <div class="gap"></div>
      </div>
    {/if}

    <div class="rows" onpointermove={move} onpointerup={up} onpointercancel={up}>
      {#each others as id (id)}
        {@const j = job(id)}
        <div class="swipe">
          {#if !v.done.has(id) && offset(id) < 0}<button class="aside" tabindex={swiped === id ? 0 : -1} onclick={() => aside(id)}>{t('row.notToday')}</button>{/if}
          <button class="row" class:done={v.done.has(id)} style:transform={`translateX(${offset(id)}px)`} class:still={drag?.id === id}
            onpointerdown={(e) => down(e, id)} onclick={() => tapRow(id)} disabled={v.done.has(id) || !!v.run}>
            <span class="pip" class:done={v.done.has(id)}></span>
            <span class="t">{j.name}</span>
            <span class="s">{rowNote(j)}</span>
          </button>
        </div>
      {/each}
      {#if !v.run && v.next?.mode !== 'underWay' && !(v.complete && !v.next)}
        <button class="row else" onclick={() => go('choose')}>
          <span class="plus" aria-hidden="true">+</span><span class="t">{t('today.else')}</span><span class="s"></span>
        </button>
      {/if}
    </div>
    </div>
    <nav class="foot" aria-label={t('today.label')}>
      <button class="text-link" onclick={() => go('satchel')}><span>{t('nav.satchel')}</span></button>
      <button class="text-link" onclick={() => go('week')}><span>{t('nav.week')}</span></button>
      <button class="text-link" onclick={() => go('daybook')}><span>{t('nav.daybook')}</span></button>
      <button class="text-link" onclick={() => go('camp')}><span>{t('nav.camp')}</span></button>
    </nav>
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
  .lead .btn.full { width: 100%; }
  /* a row slides over its "Not today" */
  .swipe { position: relative; overflow: hidden; }
  .swipe .row { position: relative; z-index: 1; transition: transform .22s ease; touch-action: pan-y; }
  .swipe .row.still { transition: none; }
  .aside { position: absolute; right: 0; z-index: 0; top: 1px; bottom: 0; width: 112px; font-family: var(--life); font-style: italic; font-size: 16px;
    color: var(--ink); background: rgba(var(--violet-rgb), .28); }
  .row.else .t { color: var(--ink-2); font-style: italic; }
  .plus { justify-self: center; color: var(--violet-hi); font-size: 20px; line-height: 1; }
  button.row:disabled { cursor: default; }
  .at { color: var(--ink-2); font-size: .8em; }
  .deep { font-family: var(--life); font-size: 16px; color: var(--ink-2); margin: -10px 0 14px; text-align: left; }
  .deep .text-link { display: inline-flex; padding: 0 4px; min-height: 0; }
  .foot { display: flex; justify-content: space-between; margin: 6px -10px 0; }
  .foot span { font-size: 13px; letter-spacing: .12em; color: var(--ink-2); }
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
