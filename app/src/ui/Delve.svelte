<script lang="ts">
  /* The delve (INTERACTION_NOTES → the delve; D-028, D-036, D-037, D-047). The glowing ring fills with the time left;
     the destination is the headline; the tunnel moves so the world is visibly travelling. Only two ideas, always in
     the same words: Pause (once Step away; review 2, D-088) and Finish here. The scene is the approved mock-up's own (delve.html, revision 3). */
  import { onMount } from 'svelte';
  import { game } from './game.svelte';
  import { t, minutesWords, ord } from '../content/copy/en';
  import { mmss, ofLine } from './panel';
  import { epochOf } from '../core/time';
  import tunnel from './scene/tunnel.html?raw';
  import fogFront from './scene/fog-front.html?raw';
  import { tunnelLight } from './scene/light.js';
  import type { Go } from './nav';
  import Return from './Return.svelte';
  import { steady } from './taps';
  import { unslide } from './keyboard';
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
  /* the breather right after the delve that reached enough is its own moment (D-047) */
  const enoughNow = $derived.by(() => {
    if (!run || run.phase !== 'breather' || !run.ends.length) return false;
    const jd = game.facts.find(f => f.type === 'jobDone' && f.job === run.job.id && f.seq > run.seq);
    return !!jd && Math.abs(epochOf(jd.at) - run.ends[run.ends.length - 1].at) < 1000;
  });
  const breathP = $derived(run?.phase === 'breather' ? 1 - run.breatherLeftMs / 300_000 : 0);

  /* the ring settles after an end: lit, then resting */
  $effect(() => {
    if (run && run.phase !== 'breather') { restful = false; return; }
    const id = setTimeout(() => (restful = true), 1200);
    return () => clearTimeout(id);
  });

  function leave(to: 'today' | 'arrival') {
    if (end) game.do({ do: 'seen', what: 'step', ref: end.seq });
    go(to);
  }
  function yes() { if (end) { steady(); game.do({ do: 'done', job: end.job.id, keepEnd: true }); answer = 'yes'; unslide(); } }
  /* the job's return, if this run finished it (enough, or "Is it done?" answered) */
  const doneSeq = $derived.by(() => {
    if (!end) return null;
    const start = game.facts.find(f => f.type === 'delveEnded' && f.seq === end.seq);
    /* on any day: a delve begun before 04:00 is answered on the next game day */
    const d = game.facts.find(f => f.type === 'jobDone' && f.job === end.job.id && start && f.seq > (start as { run: number }).run);
    return d ? d.seq : null;
  });
  /* the end carries the story (a step, a mark to guess, a find) */
  const told = $derived(!!end && (doneSeq !== null || v.runFinds.length > 0));
</script>

<div class="dv" class:told bind:this={root}>
  {@html tunnel}
  <div class="ui">
    <header class="top col">
      <div class="topbar rise">
        <button class="home" onclick={() => (end ? leave('today') : go('today'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
        <span></span><span></span>
      </div>
      <div class="head rise d1">
        <div class="label-line centred lit">{t('delve.further')}</div>
        <h1 class="carve">{v.here.name}</h1>
        <p class="soft on-scene breath-hide" class:gone={!run || run.phase !== 'delve'}>{t('delve.moves')}</p>
      </div>
    </header>

    <div class="mid">
      <div class="ring rise d2" class:ended={!run || run.phase === 'breather'} class:rest={restful} class:hold={run?.phase === 'held'}
        style="--p:{Math.min(1, p).toFixed(4)};--pc:{(Math.round(Math.min(1, p) * 200) / 200).toFixed(3)}" role="timer" aria-label={run ? `${left} ${t('delve.left', { len: run.minutes })}` : ''}>
        <div class="halo"></div><div class="disc"></div>
        <canvas class="ringcv" aria-hidden="true"></canvas>
        <div class="fog-front" aria-hidden="true">{@html fogFront}</div>
        {#if run?.phase === 'delve'}
          <div class="inner"><div class="time">{left}</div><div class="left">{t('delve.left', { len: run.minutes })}</div></div>
        {/if}
      </div>
    </div>

    <section class="bottom col rise d3" class:fit={told}>
      {#if run?.phase === 'delve'}
        <h2>{run.job.name}</h2>
        <p class="soft of">{of}</p>
        <p class="say away">{t(game.alertsOff ? 'delve.away.noAlerts' : 'delve.away.locked')}</p>
        <div class="two-quiet">
          <button class="btn-quiet" onclick={() => game.do({ do: 'stepAway' })}><span>{t('delve.stepAway')}</span></button>
          <button class="btn-quiet" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button>
        </div>
      {:else if run?.phase === 'held'}
        <!-- paused by Pause, or by going into another app: then it says so, and offers Carry on or Finish here (D-094) -->
        <div class="label-line centred">{run.away ? t('delve.awayLabel') : t('delve.paused')}</div>
        <h2 class="m">{run.job.name}</h2>
        <p class="say">{run.away ? t('delve.away.say') : t('delve.held.say')}</p>
        <button class="btn resting back" onclick={() => game.do({ do: 'resume' })}>
          <span>{run.away ? t('delve.carryOn') : t('delve.back')}</span><span class="tail">{t('delve.back.left', { min: minutesWords(Math.max(1, Math.ceil(run.leftMs / 60000))) })}</span>
        </button>
        <div class="cant"><button class="text-link" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button></div>
      {:else if run?.phase === 'breather'}
        <div class="label-line centred" class:lit={enoughNow}>{enoughNow ? t('delve.enoughLabel') : t('delve.breather')}</div>
        <h2 class="m">{enoughNow ? t('delve.sessionComplete', { job: run.job.name }) : t('delve.breather.done', { ord: ord(run.k) })}</h2>
        <p class="say">{enoughNow ? t('delve.breather.enough') : v.passage + ' ' + t('delve.breather.say')}</p>
        <div class="breath-line" aria-hidden="true"><i style="width:{(breathP * 100).toFixed(1)}%"></i></div>
        <button class="btn resting" onclick={() => game.do({ do: 'skipBreather' })}>{t('delve.startNow')}</button>
        <div class="cant"><button class="text-link" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button></div>
      {:else if end}
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
          <h2 class="m">{end.minutes > 0 ? t('delve.kept', { min: minutesWords(end.minutes) }) : t('delve.keptNone')}</h2>
          <p class="say">{t('delve.keptSay')}</p>
          <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
        {:else}
          <div class="scroll">
            <div class="label-line centred" class:lit={end.enough}>{end.enough ? t('delve.enoughLabel') : t('delve.label')}</div>
            <h2 class="m">
              {#if answer === 'yes'}{t('delve.yesSay')}
              {:else if end.enough}{t('delve.sessionComplete', { job: end.job.name })}
              {:else if end.how === 'finishedHere' && end.minutes > 0}{t('delve.finished', { min: minutesWords(end.minutes), job: end.job.name })}
              {:else}{end.count > 1 ? t('delve.doneRun') : t('delve.doneOne')}{/if}
            </h2>
            {#if doneSeq !== null}<Return {doneSeq} extraFinds={v.runFinds} {go} />
            {:else}<p class="say">{end.enough ? t('delve.enoughSay') : v.passage}</p><Return doneSeq={null} extraFinds={v.runFinds} />{/if}
          </div>
          {#if end.completedDay || game.view.arrival}
            <button class="btn" onclick={() => leave('arrival')}>{t('delve.see')}</button>
          {:else}
            <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
          {/if}
        {/if}
      {/if}
    </section>
  </div>
</div>

<style>
  .dv { display: contents; }
  /* the ring takes the room left between the place's name and the words below, never more; when the end carries the
     story it steps back, and on a phone too short for it, it gives way altogether */
  .dv :global(.mid) { container-type: size; }
  .dv :global(.ring) { --R: max(64px, min(250px, 66vw, 36vh, 86cqh)); }
  .dv.told :global(.ring) { --R: max(64px, min(170px, 44vw, 22vh, 76cqh)); }
  @container (max-height: 120px) { .dv.told :global(.ring) { visibility: hidden; } }
  .gone { opacity: 0; transition: opacity 1s var(--ease); }
  h2.m { margin-top: 10px; }
  .dv :global(.bottom p.say) { margin: 6px 0 20px; font-size: 17px; color: var(--ink-2); }
  .back { flex-direction: column; gap: 3px; padding-top: 10px; padding-bottom: 10px; line-height: 1.1; }
  .back .tail { font-family: var(--life); font-style: italic; font-weight: 500; font-size: 17px; letter-spacing: .01em; text-transform: none; }
  .cant { display: flex; justify-content: center; margin-top: 8px; }
  .pair { max-width: 340px; margin: 0 auto; }
  .breath-line i { transition: width .25s linear; }
  button.home { color: var(--ink-2); }
</style>
