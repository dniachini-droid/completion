<script lang="ts">
  /* The delve (INTERACTION_NOTES → the delve; D-028, D-036, D-037, D-047). The glowing ring fills with the time left;
     the destination is the headline; the tunnel moves so the world is visibly travelling. Only two ideas, always in
     the same words: Step away and Finish here. The scene is the approved mock-up's own (delve.html, revision 3). */
  import { onMount } from 'svelte';
  import { game } from './game.svelte';
  import { t, minutesWords, ord, card } from '../content/copy/en';
  import { platform } from '../platform';
  import { epochOf } from '../core/time';
  import tunnel from './scene/tunnel.html?raw';
  import fogFront from './scene/fog-front.html?raw';
  import { tunnelLight } from './scene/light.js';
  import type { Go } from './nav';
  import Return from './Return.svelte';
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
  const mmss = $derived.by(() => {
    const s = Math.ceil((run?.leftMs ?? 0) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });
  const past = $derived(!!run && v.done.has(run.job.id));
  const ofLine = $derived.by(() => {
    if (!run) return '';
    const { k, count: N, enoughK: kE } = run;
    if (past) return t('delve.more', { ord: ord(k) });
    if (kE) return Math.min(N, kE) === 1 ? (N === 1 ? t('delve.single') : t('delve.enoughAfter')) : t('delve.ofRun', { ord: ord(k), card: card(kE) });
    return N === 1 ? t('delve.single') : t('delve.ofRun', { ord: ord(k), card: card(N) });
  });
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
  function yes() { if (end) { game.do({ do: 'done', job: end.job.id }); answer = 'yes'; } }
  /* the job's return, if this run finished it (enough, or "Is it done?" answered) */
  const doneSeq = $derived.by(() => {
    if (!end) return null;
    const start = game.facts.find(f => f.type === 'delveEnded' && f.seq === end.seq);
    const d = game.facts.find(f => f.type === 'jobDone' && f.job === end.job.id && start && f.day === start.day && f.seq > (start as { run: number }).run);
    return d ? d.seq : null;
  });
</script>

<div class="dv" class:told={!!end && (doneSeq !== null || v.runFinds.length > 0)} bind:this={root}>
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
        style="--p:{Math.min(1, p).toFixed(4)}" role="timer" aria-label={run ? `${mmss} ${t('delve.left', { len: run.minutes })}` : ''}>
        <div class="halo"></div><div class="disc"></div>
        <canvas class="ringcv" aria-hidden="true"></canvas>
        <div class="fog-front" aria-hidden="true">{@html fogFront}</div>
        {#if run?.phase === 'delve'}
          <div class="inner"><div class="time">{mmss}</div><div class="left">{t('delve.left', { len: run.minutes })}</div></div>
        {/if}
      </div>
    </div>

    <section class="bottom col rise d3">
      {#if run?.phase === 'delve'}
        <h2>{run.job.name}</h2>
        <p class="soft of">{ofLine}</p>
        <p class="say away">{platform.notifier.locked ? t(game.alertsOff ? 'delve.away.noAlerts' : 'delve.away.locked') : t('delve.away.web')}</p>
        <div class="two-quiet">
          <button class="btn-quiet" onclick={() => game.do({ do: 'stepAway' })}><span>{t('delve.stepAway')}</span></button>
          <button class="btn-quiet" onclick={() => game.do({ do: 'finishHere' })}><span>{t('delve.finishHere')}</span></button>
        </div>
      {:else if run?.phase === 'held'}
        <div class="label-line centred">{t('delve.breather')}</div>
        <h2 class="m">{run.job.name}</h2>
        <p class="say">{t('delve.held.say')}</p>
        <button class="btn resting back" onclick={() => game.do({ do: 'resume' })}>
          <span>{t('delve.back')}</span><span class="tail">{t('delve.back.left', { min: minutesWords(Math.max(1, Math.ceil(run.leftMs / 60000))) })}</span>
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
            <button class="btn-quiet" onclick={() => (answer = 'no')}><span>{t('delve.notYet')}</span></button>
          </div>
        {:else if answer === 'no'}
          <div class="label-line centred">{t('delve.label')}</div>
          <h2 class="m">{t('delve.kept', { min: minutesWords(end.minutes) })}</h2>
          <p class="say">{t('delve.keptSay')}</p>
          <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
        {:else}
          <div class="label-line centred" class:lit={end.enough}>{end.enough ? t('delve.enoughLabel') : t('delve.label')}</div>
          <h2 class="m">
            {#if answer === 'yes'}{t('delve.yesSay')}
            {:else if end.enough}{t('delve.sessionComplete', { job: end.job.name })}
            {:else if end.how === 'finishedHere' && end.minutes > 0}{t('delve.finished', { min: minutesWords(end.minutes), job: end.job.name })}
            {:else}{end.count > 1 ? t('delve.doneRun') : t('delve.doneOne')}{/if}
          </h2>
          {#if doneSeq !== null}<Return {doneSeq} extraFinds={v.runFinds} {go} />
          {:else}<p class="say">{end.enough ? t('delve.enoughSay') : v.passage}</p><Return doneSeq={null} extraFinds={v.runFinds} />{/if}
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
  /* when the end carries the story, the ring steps back to make room for it */
  .dv.told :global(.ring) { --R: min(170px, 44vw, 22vh); }
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
