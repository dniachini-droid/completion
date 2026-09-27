<script lang="ts">
  /* Today (the morning screen, UX_PRINCIPLES → "The morning screen carries"): where you are, the sealed thing ahead,
     the one next job (no Low / Normal / High, and no "Already done": Dan, D-089) with one button, today's other jobs as plain rows, "I can't start".
     A tap on a row starts that job, as its own button would (D-100: it used to swap the row with the next job, and the
     rows seemed to change places by themselves); a swipe takes it off today; the last row chooses a delve on anything (D-077). After day complete: the day as done, until Dan taps a job or keeps going.
     Mock-up: design/directions/d-combined/morning.html. */
  import { game, content } from './game.svelte';
  import { presetRun, pastBedtime, BEDTIME_WINDOW } from '../core/game';
  import { beatOf } from '../core/story';
  import type { Job } from '../core/types';
  import { t, minutesWords, delves, inSentence } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import { flushSync } from 'svelte';
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
    /* every job is a delve (D-117): its row says how it runs */
    const r = presetRun(j);
    return r.count === 1 ? t('row.delve') : t('row.delves', { n: delves(r.count), len: r.minutes });
  }
  function teaser(j: Job): string {
    if (j.avoided) return t('today.teaser.avoided');
    return t('today.teaser.delve');
  }

  function begin(j: Job) {
    const r = presetRun(j);
    /* Starting needs no decision: a short delve job starts at once; a longer one opens set to its enough (D-038, D-047) */
    if (r.count === 1 && r.minutes <= 25) { game.do({ do: 'startRun', job: j.id, ...r }); go('delve'); }
    else go('set', j.id);
  }
  function done(j: Job) {
    const f = game.do({ do: 'done', job: j.id });
    const d = f.find(x => x.type === 'jobDone');
    if (d) go('step', d.seq);
  }
  /* a delve job worked on today, not yet said to be done: "Is it done?" answered "Not yet", or left unanswered. Its Done
     is here, so it never needs another delve to be marked (Dan, 2026-09-27, D-120) */
  const delvedToday = $derived(new Set(game.facts.filter(f => f.type === 'delveStarted' && f.day === v.day).map(f => f.job)));
  const sayDone = (j: Job) => j.delve && j.doneBy === 'dan' && !v.done.has(j.id) && delvedToday.has(j.id);
  const delvedOn = $derived(!!next && sayDone(next));
  function carry() { game.do({ do: 'resume' }); go('delve'); }
  function finish() { game.do({ do: 'finishHere' }); go('delve'); }
  /* a tap on a job starts that job, never another: nothing on the list moves (Dan, D-100) */
  function start(id: string) { if (swiped) { swiped = null; return; } if (!v.done.has(id)) begin(job(id)); }
  function aside(id: string) { swiped = null; game.do({ do: 'setAside', job: id }); lastAside = id; }
  /* "Not today" said once, with a way to take it back while Today is still open (review 2, D-088) */
  let lastAside = $state<string | null>(null);
  function putBack() { if (lastAside) game.do({ do: 'putBack', job: lastAside }); lastAside = null; }
  /* after the day's work: a timed job still ahead today is named, so "done" never hides it (review 2) */
  const still = $derived(v.slate.filter(id => !v.done.has(id) && v.times[id]).map(id => `${job(id).name} ${t('row.at', { time: v.times[id] })}`));

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
  function tapRow(id: string) { if (suppress) { suppress = false; return; } start(id); }
  const offset = (id: string) => drag?.id === id ? drag.dx : swiped === id ? -OPEN : 0;

  /* the evening (D-093): going to bed lives on Today, no page of its own. From five hours before bedtime (when Go to
     sleep counts, D-083) Today carries "Tonight": the bedtime, one tap to change it, and Go to sleep. Once said, the
     night's line shows here until morning. */
  const evening = $derived(!v.night && pastBedtime(v.bedtime, game.now) >= -BEDTIME_WINDOW);
  const nightLine = $derived(v.night?.beat ? beatOf(content.story, v.night.beat)?.line ?? '' : '');
  function setBedtime(time: string) { if (time && time !== v.bedtime) game.do({ do: 'bedtime', time }); }
  function pick(e: MouseEvent) { try { (e.currentTarget as HTMLInputElement).showPicker?.(); } catch { /* not every browser */ } }
  /* the story ahead folds to a few lines, so the next job is always in view; a tap reads it all (D-093) */
  let aheadOpen = $state(false);

  /* one-tap capture (D-107): "+ Add" opens a box already typing; what is put in becomes a delve job on today, one line
     or a pasted list (the satchel is gone, D-117). It never starts anything by itself */
  let capturing = $state(false), captured = $state(''), capEl = $state<HTMLTextAreaElement | null>(null), capSaid = $state(false);
  function startCapture() {
    if (capturing) { capturing = false; return; }
    capturing = true; capSaid = false; captured = '';
    /* focused inside the tap itself, so the phone's keyboard opens straight away */
    flushSync(); capEl?.focus({ preventScroll: true });
  }
  /* the size choice shows until Dan does anything with the day (D-114) */
  const sizeOffer = $derived(!v.run && !v.night && !v.complete && !game.facts.some(f => f.day === v.day
    && (f.type === 'jobBegun' || f.type === 'delveStarted' || f.type === 'jobDone' || f.type === 'capacityChosen')));
  function capture() {
    const lines = captured.split('\n');
    /* said for a moment where "+ Add" was, so nothing on Today moves */
    const put = lines.map(l => l.replace(/^[-*•\s]+/, '').trim()).filter(Boolean);
    for (const line of put) game.do({ do: 'addToWeek', line, day: v.day });
    if (put.length) { capSaid = true; setTimeout(() => (capSaid = false), 4000); }
    captured = ''; capturing = false;
  }
  /* Return puts it in (a pasted list keeps its lines); Shift-Return starts a new line */
  function capKey(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); capture(); } }
</script>

{#snippet tonight()}
  <div class="tonight">
    <div class="label-line gold">{t('today.tonight')}</div>
    <!-- the bedtime is the phone's own time box: a tap opens its wheel, and what it's set to is kept -->
    <label class="bed">
      <span class="bed-say">{t('today.bedtime')}</span><span class="bed-time carve">{v.bedtime}</span><span class="change">{t('camp.change')}</span>
      <input type="time" step="900" value={v.bedtime} aria-label={t('camp.bedtime')} onclick={pick} onchange={e => setBedtime(e.currentTarget.value)} />
    </label>
    <p class="soft promise">{t('today.tonight.say', { bedtime: v.bedtime })}</p>
    <button class="btn gold resting" onclick={() => game.do({ do: 'goodnight' })}>{t('camp.goodnight')}</button>
  </div>
{/snippet}

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
    <!-- a lighter or fuller day, only on the day's first open and never required: ignored, the day is as planned
         (Stage 3 item 13, D-114; D-089 keeps a late night from shrinking a day by itself) -->
    {#if sizeOffer && !capturing}
      <div class="size rise d1">
        <div class="seg small" role="group" aria-label={t('size.label')}>
          {#each ['low', 'normal', 'high'] as const as x (x)}<button aria-pressed={v.capacity === x} onclick={() => game.do({ do: 'capacity', capacity: x })}>{t(`size.${x}`)}</button>{/each}
        </div>
        {#if v.suggested !== 'normal' && v.suggestedBy && v.capacity === 'normal'}<p class="soft hint">{t(`size.hint.${v.suggestedBy}`)}</p>{/if}
      </div>
    {/if}
    {#if v.ahead && !capturing}
      <section class="ahead rise d2">
        <div class="label-line">{t('today.ahead')}</div>
        <button class="ahead-text" class:open={aheadOpen} aria-expanded={aheadOpen} onclick={() => (aheadOpen = !aheadOpen)}><p class="say on-scene">{v.ahead}</p></button>
      </section>
    {/if}
  </header>

  <div class="mid"></div>

  <section class="bottom fit col rise d3">
    <!-- on a short phone the day scrolls; the foot's links never leave the screen (review finding ui-11) -->
    <div class="scroll">
    <!-- while Dan types, the box stands alone above the keyboard: the next job and the list come back when he is done
         (Dan, 2026-09-27: the under-way job's words were drawn over the box) (D-120) -->
    {#if capturing}
      <form class="capture" onsubmit={(e) => { e.preventDefault(); capture(); }}>
        <textarea bind:this={capEl} bind:value={captured} rows="2" maxlength="2000" enterkeyhint="done" onkeydown={capKey}
          placeholder={t('today.add.placeholder')} aria-label={t('today.add.label')}></textarea>
        <div class="btn-row"><button class="btn-quiet" type="submit" disabled={!captured.trim()}><span>{t('today.add.put')}</span></button>
          <button class="btn-quiet" type="button" onclick={() => (capturing = false)}><span>{t('rhythms.cancel')}</span></button></div>
      </form>
    {:else}
    {#if v.night && !v.run}
      <div class="next">
        <div class="label-line gold">{t('today.tonight')}</div>
        <h2 class="say-lg">{t('camp.night')}</h2>
        {#if nightLine}<p class="say night-line">{nightLine}</p>{/if}
        <p class="soft">{v.night.kept ? t('camp.sleep.kept') : t('camp.sleep.late', { bedtime: v.bedtime })}</p>
      </div>
    {:else if v.next?.mode === 'carry' && v.run}
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
        <div class="cant"><button class="text-link" onclick={() => game.do({ do: 'unbegin', job: next.id })}><span>{t('today.unbegin')}</span></button></div>
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
          {#if delvedOn}<button class="text-link" onclick={() => done(next)}><span>{t('today.itsDone')}</span></button>
          {:else}<button class="text-link" onclick={() => go('cant', next.id)}><span>{t('today.cantStart')}</span></button>{/if}
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
        {#if still.length}<p class="soft still">{t('today.stillToCome', { what: still.join(', ') })}</p>{/if}
        {#if evening}{@render tonight()}{/if}
        <div class="btn-row after"><button class="btn-quiet" onclick={() => go('choose')}><span>{t('today.keepGoing')}</span></button></div>
        {#if lastPlace}<div class="cant"><button class="text-link" onclick={() => go('arrival')}><span>{t('today.look')}</span></button></div>{/if}
        <div class="gap"></div>
      </div>
    {/if}

    {#if lastAside && !v.order.includes(lastAside) && !v.done.has(lastAside)}
      <p class="said">{t('today.aside.said')} <button class="text-link" onclick={putBack}><span>{t('today.putBack')}</span></button></p>
    {/if}
    <div class="rows" onpointermove={move} onpointerup={up} onpointercancel={up}>
      {#each others as id (id)}
        {@const j = job(id)}
        <div class="swipe">
          <!-- VoiceOver can't swipe: "Not today", heard but not seen (accessibility A, D-111) -->
          {#if !v.done.has(id) && offset(id) >= 0}
            <button class="sr" onclick={() => aside(id)}>{t('row.srAside', { job: job(id).name })}</button>
          {/if}
          {#if !v.done.has(id) && offset(id) < 0}
            <button class="aside" tabindex={swiped === id ? 0 : -1} onclick={() => aside(id)}>{t('row.notToday')}</button>
          {/if}
          <button class="row" class:done={v.done.has(id)} style:transform={`translateX(${offset(id)}px)`} class:still={drag?.id === id}
            onpointerdown={(e) => down(e, id)} onclick={() => tapRow(id)} disabled={v.done.has(id) || !!v.run}>
            <span class="pip" class:done={v.done.has(id)}></span>
            <span class="t">{j.name}</span>
            <span class="s">{sayDone(j) ? '' : rowNote(j)}</span>
          </button>
          <!-- the same "It's done" on a row further down: a tap on the row itself still starts a delve (D-100, D-120) -->
          {#if sayDone(j) && !v.run && offset(id) === 0}<button class="text-link row-done" onclick={() => done(j)}><span>{t('today.itsDone')}</span></button>{/if}
        </div>
      {/each}
      {#if !v.run && v.next?.mode !== 'underWay' && !(v.complete && !v.next)}
        <button class="row else" onclick={() => go('choose')}>
          <span class="plus" aria-hidden="true">+</span><span class="t">{t('today.else')}</span><span class="s"></span>
        </button>
      {/if}
    </div>
    <!-- the evening, before the day's work is done: Tonight at the end of the day's list (D-093) -->
    {#if evening && !v.complete && !v.run}<section class="tonight-end">{@render tonight()}</section>{/if}
    {/if}
    </div>
    <nav class="foot" aria-label={t('today.label')}>
      <button class="text-link add" class:on={capturing} aria-label={t('today.add.label')} aria-expanded={capturing} onclick={startCapture}><span>{capSaid ? t('today.add.said') : t('today.add')}</span></button>
      <button class="text-link" onclick={() => go('week')}><span>{t('nav.week')}</span></button>
      <button class="text-link" onclick={() => go('daybook')}><span>{t('nav.daybook')}</span></button>
    </nav>
  </section>
</div>

<style>
  h1 { margin-top: 2px; }
  .ahead { margin-top: 12px; }
  .ahead p { font-size: 17.5px; line-height: 1.38; margin-top: 6px; }
  .ahead-text { display: block; width: 100%; padding: 0; background: none; border: 0; text-align: left; cursor: pointer; color: inherit; }
  .ahead-text:not(.open) p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; }
  .tonight-end { margin-top: 18px; }
  .tonight { margin: 4px 0 6px; }
  .bed { position: relative; display: flex; align-items: baseline; gap: 12px; margin-top: 8px; cursor: pointer; width: fit-content; }
  .bed input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; border: 0; padding: 0; margin: 0; cursor: pointer; -webkit-appearance: none; appearance: none; }
  .bed-say { font-family: var(--life); font-size: 18px; color: var(--ink-2); }
  .bed-time { font-size: 28px; letter-spacing: .06em; color: #fff; }
  .change { font-family: var(--life); font-style: italic; font-size: 16px; color: var(--ink-2); border-bottom: 1px solid var(--edge-3); }
  .next .tonight .promise { text-align: left; margin: 6px 0 14px; }
  .tonight .promise { text-align: left; margin: 6px 0 14px; }
  .night-line { font-style: italic; color: #fff; margin: 8px 0 10px; line-height: 1.45; }
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
  /* it clips a row sliding off, so it reaches out into the list's faded sides (base.css → .col .scroll), the words
     staying where they were: cut at the column's edge, it sliced the glow of a done job's diamond into a hard line
     (Dan, 2026-09-27) */
  .swipe { position: relative; overflow: hidden; margin: 0 -18px; padding: 0 18px; }
  @supports (overflow: clip) { .swipe { overflow-x: clip; overflow-y: visible; } }
  .swipe .row { position: relative; z-index: 1; transition: transform .22s ease; touch-action: pan-y; }
  .swipe .row.still { transition: none; }
  .aside { position: absolute; right: 18px; z-index: 0; top: 1px; bottom: 0; width: 112px; font-family: var(--life); font-style: italic; font-size: 16px;
    color: var(--ink); background: rgba(var(--violet-rgb), .28); }
  .sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  .row-done { position: absolute; z-index: 2; right: 18px; top: 50%; transform: translateY(-50%); min-height: 40px; padding: 0 0 0 12px; }
  .row-done span { font-size: 16px; color: var(--violet-hi); }
  .row.else .t { color: var(--ink-2); font-style: italic; }
  .plus { justify-self: center; color: var(--violet-hi); font-size: 20px; line-height: 1; }
  button.row:disabled { cursor: default; }
  .at { color: var(--ink-2); font-size: .8em; }
  .still { margin: -12px 0 16px; }
  .said { font-family: var(--life); font-style: italic; font-size: 15.5px; color: var(--ink-2); display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 2px 6px; margin: -6px 0 6px; }
  .said .text-link { min-height: 0; padding: 4px; }
  .deep { font-family: var(--life); font-size: 16px; color: var(--ink-2); margin: -10px 0 14px; text-align: left; }
  .deep .text-link { display: inline-flex; padding: 0 4px; min-height: 0; }
  .capture { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .capture textarea { box-sizing: border-box; width: 100%; min-height: 64px; padding: 10px 12px; font: inherit; font-size: 17px; color: #fff; resize: none;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .capture .btn-quiet:disabled { opacity: .5; }
  .foot .add span { color: var(--violet-hi); }
  .foot { display: flex; justify-content: space-around; margin: 6px -10px 0; }
  .foot span { font-size: 14px; letter-spacing: .1em; color: var(--ink-2); }
  .proto span { font-size: 14px; letter-spacing: .16em; color: var(--ink-3); }
  /* the day on the left; the map, records and the prototype's own link together on the right */
  .bar { display: flex; justify-content: space-between; }
  /* on a narrow bar the rehearsal badge takes a line of its own, never pushing the screen wider (Dan, review 2) */
  .bar { gap: 8px; align-items: flex-start; }
  .navs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0 4px; align-items: center; margin-right: -10px; min-width: 0; }
  .navs span { font-size: 14px; letter-spacing: .12em; color: var(--ink-2); }
  .proto .badge { color: var(--gold); }
  @media (max-height: 800px) {
    .ahead { margin-top: 8px; } .ahead p { margin-top: 4px; } .next .soft { margin-bottom: 14px; }
    :global(.row) { min-height: 44px; }
  }
  .size { margin-top: 10px; }
  .size .seg.small button { font-size: 12px; letter-spacing: .1em; padding-top: 6px; padding-bottom: 6px; }
  .size .hint { margin-top: 4px; font-style: italic; font-size: 14.5px; text-align: left; }
</style>
