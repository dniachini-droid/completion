<script lang="ts">
  import { doneFacts } from '../core/done';
  /* The delve (INTERACTION_NOTES → the delve; D-028, D-036, D-037, D-047). The glowing ring fills with the time left;
     the destination is the headline; the tunnel moves so the world is visibly travelling. Only two ideas, always in
     the same words: Pause (once Step away; review 2, D-088) and Finish here. The scene is the approved mock-up's own (delve.html, revision 3). */
  import { onMount, flushSync } from 'svelte';
  import { game } from './game.svelte';
  import { t, minutesWords, minutesShort, ord } from '../content/copy/en';
  import { mmss, ofLine } from './panel';
  import tunnel from './scene/tunnel.html?raw';
  import fogFront from './scene/fog-front.html?raw';
  import { tunnelLight } from './scene/light.js';
  import type { Go } from './nav';
  import Return from './Return.svelte';
  import { steady } from './taps';
  import { unslide } from './keyboard';
  import { listLines } from '../core/game';
  import EndRing from './EndRing.svelte';
  import EndRoad from './EndRoad.svelte';
  import type { TallyMode } from './tally';
  import './scene/tunnel.css';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const run = $derived(v.run);
  const end = $derived(v.runEnd);
  /* keep the end on screen while its story plays (a guess, a choice), even after it's marked seen */
  let answer = $state<'yes' | 'no' | null>(null);
  let root: HTMLDivElement;
  let restful = $state(false);

  $effect(() => { if (!run && !end) go('today'); });

  onMount(() => tunnelLight(root.closest('.phone') as HTMLElement));

  const L = $derived(run ? run.minutes * 60_000 : 1);
  const p = $derived(!run ? 1 : run.phase === 'delve' || run.phase === 'held' ? run.doneMs / L : 1);
  const left = $derived(mmss(run?.leftMs ?? 0));
  const past = $derived(!!run && v.done.has(run.job.id));
  const of = $derived(run ? ofLine(run, run.k, past) : '');
  const breathP = $derived(run?.phase === 'breather' ? 1 - run.breatherLeftMs / 300_000 : 0);
  /* a one-off's delve carries on from its earlier minutes (D-133): the job's minutes so far, a whole minute at a time */
  const soFar = $derived(!run || !run.carried ? 0
    : run.carried + run.ends.length * run.minutes + (run.phase === 'delve' || run.phase === 'held' ? Math.floor(run.doneMs / 60_000) : 0));

  /* the count at the end (D-133): the ring and the road line from where Dan was on this stretch to where he is now (only
     this delve's minutes move him), and the job's minutes counted up in the ring. It waits while "Is it done?" is asked;
     Done counts; "Not yet" shows the end as it is, without counting */
  const tally = $derived(!!end && !run);
  const road = $derived(v.road);
  const share = (m: number) => Math.max(0, Math.min(1, (m - road.from) / Math.max(1, road.to - road.from)));
  const toW = $derived(end ? end.walked : v.walked);
  const fromW = $derived(end ? Math.max(0, end.walked - end.gained) : v.walked);
  const mode = $derived<TallyMode>(!end ? 'still' : end.ask && answer === null ? 'from' : answer === 'no' ? 'still' : 'play');

  /* the ring settles after an end: lit, then resting */
  $effect(() => {
    if (run && run.phase !== 'breather') { restful = false; return; }
    const id = setTimeout(() => (restful = true), 1200);
    return () => clearTimeout(id);
  });

  /* "Where did you stop?" after Finish here (D-112): optional; kept as the job's note, shown at its next Begin and in
     "I can't start" */
  let stopAt = $state('');
  function keepNote() { if (end && stopAt.trim()) game.do({ do: 'noteJob', job: end.job.id, note: stopAt }); }
  function leave(to: 'today' | 'arrival') {
    keepNote();
    if (end) game.do({ do: 'seen', what: 'step', ref: end.seq });
    go(to);
  }
  function yes() { if (end) { steady(); game.do({ do: 'done', job: end.job.id, keepEnd: true }); answer = 'yes'; unslide(); } }
  /* the job's return, if this run finished it (enough, or "Is it done?" answered) */
  const doneSeq = $derived.by(() => {
    if (!end) return null;
    const start = game.facts.find(f => f.type === 'delveEnded' && f.seq === end.seq);
    /* on any day: a delve begun before 04:00 is answered on the next game day */
    const d = doneFacts(game.facts).find(f => f.job === end.job.id && start && f.seq > (start as { run: number }).run);
    return d ? d.seq : null;
  });
  /* the end carries the story (a step, a mark to guess, a find) */
  const told = $derived(!!end && (doneSeq !== null || v.runFinds.length > 0));
  /* the job's list (D-126): a tap strikes a line off (the shampoo is in the basket) or back; struck lines go when the
     delve ends, the rest stay for next time */
  const lines = (id: string) => listLines(game.job(id));
  const struck = (id: string, k: number) => !!game.job(id)?.struck?.includes(k);
  /* a quick second tap is not a second strike (break-it review) */
  function strike(id: string, k: number) { steady(); game.do({ do: 'strikeLine', job: id, k }); }

  /* Park a thought (D-138): a stray thought ("must email Sam") typed in one line over the lower part of the screen, kept
     in the Satchel's No day yet; the delve runs on meanwhile, never paused by it. The box stays open, and keeps what is
     typed, if the delve ends meanwhile. Nothing here moves on its own: the "Parked" line comes and goes once. */
  let parking = $state(false), thought = $state(''), parkedSay = $state<string | null>(null);
  let parkBox = $state<HTMLInputElement | null>(null);
  let sayTimer: ReturnType<typeof setTimeout> | undefined;
  function openPark() {
    steady(); parkedSay = null; parking = true;
    /* the keyboard comes up with the tap itself, as the phone wants */
    flushSync(); parkBox?.focus();
  }
  function closePark() { parking = false; thought = ''; }
  function park() {
    const line = thought.replace(/\s+/g, ' ').trim();
    if (!line) return;
    steady();
    game.do({ do: 'park', line });
    parkBox?.blur(); closePark();
    parkedSay = t('park.parked', { job: line.slice(0, 120) });
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => (parkedSay = null), 4000);
  }
  onMount(() => () => clearTimeout(sayTimer));
  const canPark = $derived(!!run);
  /* at the end: the thoughts this delve parked, once its question is answered; a tap opens the Satchel */
  const parkedN = $derived(end && !run && !(end.ask && answer === null) ? end.parked : 0);
  function toSatchel() { keepNote(); go('satchel'); }
</script>

{#snippet theList(id: string)}
  {#if lines(id).length}
    <ul class="list" aria-label={t('delve.list')}>
      {#each lines(id) as l, k (k)}
        <!-- a small circle beside each line, as in Reminders: ticked when struck (D-130) -->
        <li><button class:struck={struck(id, k)} aria-pressed={struck(id, k)} onclick={() => strike(id, k)}><span class="tick" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4.5 8.3 7 10.7l4.6-5.2" /></svg></span><span class="l">{l}</span></button></li>
      {/each}
    </ul>
  {/if}
{/snippet}

<div class="dv" class:told class:tallying={tally} bind:this={root}>
  {@html tunnel}
  <div class="ui">
    <header class="top col">
      <div class="topbar rise">
        <button class="home" onclick={() => (end ? leave('today') : go('today'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
        <span></span>
        {#if canPark && !parking}<button class="text-link park-link" onclick={openPark}><span>{t('park.link')}</span></button>{:else}<span></span>{/if}
      </div>
      <div class="head rise d1">
        <div class="label-line centred lit">{t('delve.further')}</div>
        <h1 class="carve">{v.here.name}</h1>
        <p class="soft on-scene breath-hide" class:gone={!run || run.phase !== 'delve'}>{t('delve.moves')}</p>
      </div>
      {#if parkedSay}<p class="parked-say" role="status">{parkedSay}</p>{/if}
    </header>

    <div class="mid">
      <div class="ring rise d2" class:ended={!run || run.phase === 'breather'} class:rest={restful} class:hold={run?.phase === 'held'} class:tallying={tally}
        style="--p:{tally ? 0 : Math.min(1, p).toFixed(4)};--pc:{(Math.round(Math.min(1, p) * 200) / 200).toFixed(3)}" role="timer" aria-label={run ? `${left} ${t('delve.left', { len: run.minutes })}` : ''}>
        <div class="halo"></div><div class="disc"></div>
        <canvas class="ringcv" aria-hidden="true"></canvas>
        <div class="fog-front" aria-hidden="true">{@html fogFront}</div>
        {#if run?.phase === 'delve'}
          <div class="inner"><div class="time">{left}</div><div class="left">{t('delve.left', { len: run.minutes })}</div>
            {#if soFar}<div class="left sofar">{t('delve.sofar', { min: minutesShort(soFar) })}</div>{/if}</div>
        {/if}
        {#if tally && end}
          <EndRing from={share(fromW)} to={share(toW)} fromN={end.carried} toN={end.total} unit={t('set.minutes')} {mode} />
        {/if}
      </div>
    </div>

    <section class="bottom col rise d3" class:fit={told}>
      {#if run?.phase === 'delve'}
        <h2>{run.job.name}</h2>
        <p class="soft of">{of}</p>
        {@render theList(run.job.id)}
        <!-- no standing "lock the phone" note (Dan, D-130); only the warning that no sound will come, when alerts are off -->
        {#if game.alertsOff}<p class="say away">{t('delve.away.noAlerts')}</p>{/if}
        <div class="two-quiet">
          <button class="btn-quiet" onclick={() => game.do({ do: 'stepAway' })}><span>{t('delve.stepAway')}</span></button>
          <button class="btn-quiet" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button>
        </div>
      {:else if run?.phase === 'held'}
        <!-- paused by Pause, or by going into another app: then it says so, and offers Carry on or Finish here (D-094) -->
        <div class="label-line centred">{run.away ? t('delve.awayLabel') : t('delve.paused')}</div>
        <h2 class="m">{run.job.name}</h2>
        <p class="say">{run.away ? t('delve.away.say') : t('delve.held.say')}</p>
        {@render theList(run.job.id)}
        <button class="btn resting back" onclick={() => game.do({ do: 'resume' })}>
          <span>{run.away ? t('delve.carryOn') : t('delve.back')}</span><span class="tail">{t('delve.back.left', { min: minutesWords(Math.max(1, Math.ceil(run.leftMs / 60000))) })}</span>
        </button>
        <div class="cant"><button class="text-link" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button></div>
      {:else if run?.phase === 'breather'}
        <div class="label-line centred">{t('delve.breather')}</div>
        <h2 class="m">{t('delve.breather.done', { ord: ord(run.k) })}</h2>
        <p class="say">{v.passage + ' ' + t('delve.breather.say')}</p>
        <div class="breath-line" aria-hidden="true"><i style="width:{(breathP * 100).toFixed(1)}%"></i></div>
        <button class="btn resting" onclick={() => game.do({ do: 'skipBreather' })}>{t('delve.startNow')}</button>
        <div class="cant"><button class="text-link" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button></div>
      {:else if end}
        <!-- the road line, always, whichever way the delve ended (D-133) -->
        <EndRoad {road} from={fromW} to={toW} {mode} />
        {#if end.ask && answer === null}
          <div class="label-line centred">{t('delve.label')}</div>
          <h2 class="m">{t('delve.ask')}</h2>
          <p class="say">{end.job.name}</p>
          <div class="btn-row pair">
            <button class="btn resting" onclick={yes}>{t('delve.yes')}</button>
            <button class="btn-quiet" onclick={() => { steady(); answer = 'no'; unslide(); }}><span>{t('delve.notYet')}</span></button>
          </div>
        {:else if answer === 'no'}
          <div class="label-line centred">{t('delve.label')}</div>
          <h2 class="m">{end.total > 0 ? t('delve.kept', { min: minutesWords(end.total) }) : t('delve.keptNone')}</h2>
          <p class="say">{t('delve.keptSay')}</p>
          <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
        {:else}
          <div class="scroll">
            <!-- no "Enough" at a recurring job's end: any session counts for its minutes (D-121, D-130) -->
            <div class="label-line centred">{t('delve.label')}</div>
            <h2 class="m">
              {#if answer === 'yes'}{t('delve.yesSay')}
              {:else if end.enough}{t('delve.sessionComplete', { job: end.job.name, min: minutesWords(end.minutes) })}
              {:else if end.how === 'finishedHere' && end.minutes > 0}{t('delve.finished', { min: minutesWords(end.total), job: end.job.name })}
              {:else}{end.count > 1 ? t('delve.doneRun') : t('delve.doneOne')}{/if}
            </h2>
            {#if end.how === 'finishedHere' && !end.enough && doneSeq === null}
              <input class="line stop" bind:value={stopAt} maxlength="160" placeholder={t('delve.whereStopped')} aria-label={t('delve.whereStopped')}
                enterkeyhint="done" onkeydown={e => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }} />
            {/if}
            {#if doneSeq !== null}<Return {doneSeq} extraFinds={v.runFinds} {go} />
            {:else}<p class="say">{v.passage}</p><Return doneSeq={null} extraFinds={v.runFinds} />{/if}
          </div>
          {#if end.completedDay || game.view.arrival}
            <button class="btn" onclick={() => leave('arrival')}>{t('delve.see')}</button>
          {:else}
            <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
          {/if}
        {/if}
        {#if parkedN > 0}
          <div class="cant"><button class="text-link" onclick={toSatchel}><span>{parkedN === 1 ? t('park.count.1') : t('park.count', { n: parkedN })}</span></button></div>
        {/if}
      {/if}
    </section>
  </div>
  {#if parking}
    <!-- the one line for a thought (D-138): Return or Park it keeps it; the delve's own screen stays in view above -->
    <form class="park" aria-label={t('park.link')} onsubmit={(e) => { e.preventDefault(); park(); }}>
      <input bind:this={parkBox} bind:value={thought} aria-label={t('park.label')} placeholder={t('park.hint')} maxlength="120"
        enterkeyhint="done" autocomplete="off" onkeydown={(e) => { if (e.key === 'Escape') closePark(); }} />
      <div class="two">
        <button class="btn-quiet" type="button" onclick={closePark}><span>{t('park.cancel')}</span></button>
        <button class="btn-quiet" type="submit" disabled={!thought.trim()}><span>{t('park.save')}</span></button>
      </div>
    </form>
  {/if}
</div>

<style>
  /* the job's list, struck off a line at a time (D-126) */
  .list { list-style: none; margin: 4px auto 10px; padding: 0; max-width: 320px; max-height: 26vh; overflow-y: auto; overflow-x: hidden; text-align: left; }
  .list button { overflow-wrap: anywhere; }
  .list button { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 44px; padding: 4px 10px; text-align: left; background: none; border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, .08); font-family: var(--life); font-size: 17px; color: #fff; cursor: pointer; }
  .list .l { flex: 1; min-width: 0; }
  .list button.struck .l { text-decoration: line-through; color: var(--ink-3); }
  .tick { flex: none; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--ink-3); }
  .tick svg { width: 14px; height: 14px; fill: none; stroke: #1a1030; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
  .list button.struck .tick { background: var(--violet-hi); border-color: var(--violet-hi); }
  .list button.struck .tick svg { opacity: 1; }
  .dv { display: contents; }
  /* the ring takes the room left between the place's name and the words below, never more; when the end carries the
     story it steps back, and on a phone too short for it, it gives way altogether */
  .dv :global(.mid) { container-type: size; }
  .dv :global(.ring) { --R: max(64px, min(250px, 66vw, 36vh, 86cqh)); }
  .dv.told :global(.ring) { --R: max(64px, min(170px, 44vw, 22vh, 76cqh)); }
  @container (max-height: 120px) { .dv.told:not(.tallying) :global(.ring) { visibility: hidden; } }
  /* at a delve's end the ring keeps room for its count, even with the story's words below it (D-133): they scroll */
  .dv.told.tallying :global(.mid) { min-height: clamp(112px, 17vh, 160px); }
  .gone { opacity: 0; transition: opacity 1s var(--ease); }
  h2.m { margin-top: 10px; }
  .sofar { margin-top: 2px; font-size: 14px; opacity: .85; }
  .dv :global(.bottom p.say) { margin: 6px 0 20px; font-size: 17px; color: var(--ink-2); }
  .back { flex-direction: column; gap: 3px; padding-top: 10px; padding-bottom: 10px; line-height: 1.1; }
  .back .tail { font-family: var(--life); font-style: italic; font-weight: 500; font-size: 17px; letter-spacing: .01em; text-transform: none; }
  .cant { display: flex; justify-content: center; margin-top: 8px; }
  input.stop { width: 100%; margin: 10px 0 4px; padding: 10px 12px; font: inherit; font-size: 16px; color: #fff; background: rgba(255,255,255,.06);
    border: 1px solid var(--edge-2); border-radius: 0; }
  .pair { max-width: 340px; margin: 0 auto; }
  .breath-line i { transition: width .25s linear; }
  button.home { color: var(--ink-2); }
  /* Park a thought (D-138): a quiet link in the top bar; the box over the lower part of the screen, above the keyboard
     (the phone frame is the part above it, keyboard.ts); the "Parked" line under the top bar for a few seconds */
  .park-link { font-size: 16px; }
  .park { position: absolute; z-index: 20; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; gap: 8px;
    padding: 12px 16px calc(var(--safe-b, 0px) + 4px); background: rgb(18, 16, 38); border-top: 1px solid var(--edge-2);
    animation: park-up .18s ease-out; }
  :global(html.kb) .park { padding-bottom: 12px; }
  @keyframes park-up { from { opacity: 0; } }
  .park input { min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: 17px; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .park .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .park .btn-quiet { padding: 0 8px; min-height: 44px; }
  .park .btn-quiet:disabled { opacity: .5; }
  .parked-say { position: absolute; z-index: 6; left: 50%; transform: translateX(-50%); top: calc(var(--safe-t, 0px) + 50px); width: max-content;
    max-width: calc(100% - 32px); margin: 0; padding: 6px 14px; pointer-events: none; background: rgb(18, 16, 38); border: 1px solid var(--edge-2);
    font-family: var(--life); font-style: italic; font-size: 16px; color: var(--ink-2); text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; animation: park-say .3s ease-out; }
  @keyframes park-say { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .park, .parked-say { animation: none; } }
</style>
