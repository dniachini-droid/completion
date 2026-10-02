<script lang="ts">
  import { doneFacts } from '../core/done';
  /* The delve (INTERACTION_NOTES → the delve; D-028, D-036, D-037, D-047). The glowing ring fills with the time left;
     the destination is the headline; the tunnel moves so the world is visibly travelling. Only two ideas, always in
     the same words: Pause (once Step away; review 2, D-088) and Finish here. The scene is the approved mock-up's own (delve.html, revision 3). */
  import { onMount, flushSync, tick, untrack } from 'svelte';
  import { moment } from './moment.svelte';
  import { game, content } from './game.svelte';
  import { t, minutesWords, minutesShort, ord } from '../content/copy/en';
  import { mmss, ofLine } from './panel';
  import { tieFor } from '../core/remember';
  import tunnel from './scene/tunnel.html?raw';
  import fogFront from './scene/fog-front.html?raw';
  import { tunnelLight } from './scene/light.js';
  import type { Go } from './nav';
  import Return from './Return.svelte';
  import { steady } from './taps';
  import { unslide } from './keyboard';
  import { listLines, returnOf } from '../core/game';
  import { RETURN_MIN } from '../core/story';
  import EndRing from './EndRing.svelte';
  import EndRoad from './EndRoad.svelte';
  import type { TallyMode } from './tally';
  import './scene/tunnel.css';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const run = $derived(v.run);
  const end = $derived(v.runEnd);
  /* keep the end on screen while its story plays (a guess, a choice), even after it's marked seen */
  /* as left, if Dan looked at a record or a niche from this end and came back (it is shown again, not replayed) */
  const was = end ? moment.ends[end.seq] : undefined;
  let answer = $state<'yes' | 'no' | null>(was?.answer ?? null);
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
  const mode = $derived<TallyMode>(!end ? 'still' : (end.ask && answer === null) || end.pending ? 'from' : answer === 'no' || was?.played ? 'still' : 'play');
  $effect(() => {
    if (!end) return;
    const seq = end.seq, a = answer, at = storyAt, playing = mode === 'play';
    untrack(() => { moment.ends[seq] = { answer: a, storyAt: at, played: (moment.ends[seq]?.played ?? false) || playing }; });
  });

  /* the ring settles after an end: lit, then resting */
  $effect(() => {
    if (run && run.phase !== 'breather') { restful = false; return; }
    const id = setTimeout(() => (restful = true), 1200);
    return () => clearTimeout(id);
  });

  /* "Where did you stop?" after Finish here (D-112): optional; kept as the job's note, shown at its next Begin and in
     "I can't start" */
  let stopAt = $state('');
  /* the end's job, held past the end being marked seen: the phone's back marks it before this screen goes (review of D-144) */
  let noteJob = '';
  $effect(() => { if (end) noteJob = end.job.id; });
  /* plain, not watched: a teardown reads the box's text from before the tap that closed the screen, so the note kept
     by that tap is known here and never written twice (deep review NEW-1) */
  let keptNote = '';
  /* typing where he stopped, with the keyboard up: the ring and the road step aside, so the box stands fully above the
     keyboard and no label runs into another (deep review H#6) */
  let typing = $state(false);
  function keepNote() { if (noteJob && stopAt.trim() && stopAt !== keptNote) { keptNote = stopAt; game.do({ do: 'noteJob', job: noteJob, note: stopAt }); stopAt = ''; } }
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
  /* an errand run's errands struck off, each with its story moment (D-139): the ones with words to show */
  const errandsDone = $derived(end?.errands?.filter(e => e.done !== null) ?? []);
  const errandStory = $derived(errandsDone.filter(e => { const r = returnOf(content, game.facts, e.done!); return !!r.line || r.finds.length > 0 || !!r.keyNote; }));
  /* the end carries the story (a step, a mark to guess, a find) */
  const told = $derived(!!end && (doneSeq !== null || v.runFinds.length > 0 || errandStory.length > 0));
  /* the errand run's stories, one at a time (L B5) */
  let storyAt = $state(was?.storyAt ?? 0);
  /* an errand run is named as one, never by a job (D-139) */
  const title = (r: { errands: unknown; job: { name: string } }) => r.errands ? t('errand.title') : r.job.name;
  /* an errand struck off (or back) with a tap, as a job's list line is (D-126) */
  function strikeErrand(id: string) { steady(); game.do({ do: 'strikeErrand', job: id }); }
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
  let parkBox = $state<HTMLInputElement | null>(null), parkLink = $state<HTMLButtonElement | null>(null);
  let sayTimer: ReturnType<typeof setTimeout> | undefined;
  function openPark() {
    steady(); parkedSay = null; parking = true;
    /* the keyboard comes up with the tap itself, as the phone wants */
    flushSync(); parkBox?.focus();
  }
  /* back to the link, so VoiceOver keeps its place (review) */
  function closePark() { parking = false; thought = ''; void tick().then(() => parkLink?.focus()); }
  function park() {
    const line = thought.replace(/\s+/g, ' ').trim();
    if (!line) return;
    steady();
    /* a job still Dan's is not parked twice (D-136): it says so instead */
    const have = tieFor(content, game.facts, line);
    game.do({ do: 'park', line });
    parkBox?.blur(); closePark();
    parkedSay = have?.same ? t('park.have', { job: have.job.name }) : t('park.parked', { job: line.slice(0, 120) });
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => (parkedSay = null), 4000);
  }
  /* leaving the delve with a thought typed (Today, the phone's back): it is kept, never lost (review) */
  /* where he stopped, typed and left by the phone's back, is kept as the arrow would keep it (review of D-144) */
  onMount(() => () => { clearTimeout(sayTimer); if (parking && thought.trim()) game.do({ do: 'park', line: thought }); keepNote(); });
  const canPark = $derived(!!run);
  /* at the end: the thoughts this delve parked, once its question is answered; a tap opens the Satchel */
  const parkedN = $derived(end && !run && !end.pending && !(end.ask && answer === null) ? end.parked : 0);
  /* after "Not yet" the end is answered: marked seen first, so back from the Satchel never asks again */
  function toSatchel() { keepNote(); if (answer === 'no' && end) game.do({ do: 'seen', what: 'step', ref: end.seq }); go('satchel'); }
</script>

{#snippet errandList(es: { job: { id: string; name: string }; struck: boolean }[])}
  <ul class="list" aria-label={t('errand.list')}>
    {#each es as e (e.job.id)}
      <li><button class:struck={e.struck} aria-pressed={e.struck} onclick={() => strikeErrand(e.job.id)}><span class="tick" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4.5 8.3 7 10.7l4.6-5.2" /></svg></span><span class="l">{e.job.name}</span></button></li>
    {/each}
  </ul>
{/snippet}

{#snippet theList(id: string)}
  {#if run?.errands}
    <!-- the errand run (D-139): its errands, struck off one by one as each is done -->
    {@render errandList(run.errands)}
  {:else if lines(id).length}
    <ul class="list" aria-label={t('delve.list')}>
      {#each lines(id) as l, k (k)}
        <!-- a small circle beside each line, as in Reminders: ticked when struck (D-130) -->
        <li><button class:struck={struck(id, k)} aria-pressed={struck(id, k)} onclick={() => strike(id, k)}><span class="tick" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4.5 8.3 7 10.7l4.6-5.2" /></svg></span><span class="l">{l}</span></button></li>
      {/each}
    </ul>
  {/if}
{/snippet}

<div class="dv" class:told class:tallying={tally} class:typing bind:this={root}>
  {@html tunnel}
  <div class="ui">
    <header class="top col">
      <div class="topbar rise">
        <!-- an errand run's "What got done?" is left waiting, never counted by the arrow (J1): Today says it waits -->
        <button class="home" onclick={() => (end && !end.pending ? leave('today') : go('today'))}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
        <span></span>
        {#if canPark && !parking}<button class="text-link park-link" bind:this={parkLink} onclick={openPark}><span>{t('park.link')}</span></button>{:else}<span></span>{/if}
      </div>
      <div class="head rise d1">
        <div class="label-line centred lit">{t('delve.further')}</div>
        <h1 class="carve">{v.here.name}</h1>
        <!-- faded out, it is hidden from VoiceOver too (deep review A#39) -->
        <p class="soft on-scene breath-hide" class:gone={!run || run.phase !== 'delve'} aria-hidden={!run || run.phase !== 'delve'}>{t('delve.moves')}</p>
      </div>
      <!-- always there, so VoiceOver reads the line when it is written (review) -->
      <p class="parked-say" class:shown={!!parkedSay} role="status">{parkedSay ?? ''}</p>
    </header>

    <div class="mid">
      <div class="ring rise d2" class:ended={!run || run.phase === 'breather'} class:rest={restful} class:hold={run?.phase === 'held'} class:tallying={tally}
        style="--p:{tally ? 0 : Math.min(1, p).toFixed(4)};--pc:{(Math.round(Math.min(1, p) * 200) / 200).toFixed(3)}" role={run ? 'timer' : undefined} aria-label={run ? t('delve.leftSay', { n: Math.ceil((run.leftMs ?? 0) / 60_000), len: run.minutes }) : undefined}>
        <div class="halo"></div><div class="disc"></div>
        <canvas class="ringcv" aria-hidden="true"></canvas>
        <div class="fog-front" aria-hidden="true">{@html fogFront}</div>
        {#if run?.phase === 'delve'}
          <div class="inner"><div class="time">{left}</div><div class="left">{t('delve.left', { len: run.minutes })}</div>
            {#if soFar}<div class="left sofar">{t('delve.sofar', { min: minutesShort(soFar) })}</div>{/if}</div>
        {/if}
        {#if tally && end}
          <EndRing from={share(fromW)} to={share(toW)} fromN={end.carried} toN={end.total} unit={t('tally.unit')} {mode} />
        {/if}
      </div>
    </div>

    <section class="bottom col rise d3" class:fit={told}>
      {#if run?.phase === 'delve'}
        <h2>{title(run)}</h2>
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
        <h2 class="m">{title(run)}</h2>
        <p class="say">{run.away ? t('delve.away.say') : t('delve.held.say')}</p>
        {@render theList(run.job.id)}
        <button class="btn resting back" onclick={() => game.do({ do: 'resume' })}>
          <!-- a pause between the two, for VoiceOver (A#45) -->
          <span>{run.away ? t('delve.carryOn') : t('delve.back')}</span><span class="sr-only">, </span><span class="tail">{t('delve.back.left', { min: minutesWords(Math.max(1, Math.ceil(run.leftMs / 60000))) })}</span>
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
          <!-- the minutes it has, so the answer is an informed one (J17) -->
          {#if end.total > 0}<p class="soft on-it">{t('delve.onIt', { min: minutesWords(end.total) })}</p>{/if}
          <div class="btn-row pair">
            <button class="btn resting" onclick={yes}>{t('delve.yes')}</button>
            <button class="btn-quiet" onclick={() => { steady(); answer = 'no'; unslide(); }}><span>{t('delve.notYet')}</span></button>
          </div>
        {:else if end.errands && end.pending}
          <!-- the run ended (it may have run out while Dan was still out): what got done is struck off here, then counted
               once (D-139) -->
          <div class="scroll">
            <div class="label-line centred">{t('errand.title')}</div>
            <h2 class="m">{t('errand.ask')}</h2>
            <p class="say">{t('errand.askSay')}</p>
            {@render errandList(end.errands)}
          </div>
          <button class="btn resting" onclick={() => { steady(); game.do({ do: 'countErrands' }); unslide(); }}>{t('errand.count')}</button>
        {:else if end.errands}
          <!-- the errand run's end (D-139): the run's minutes, each errand struck off done with its share, then each one's
               story moment in turn; the ones left stay as they were -->
          <div class="scroll">
            <div class="label-line centred">{t('errand.title')}</div>
            <h2 class="m">{end.minutes > 0 ? t('errand.end', { min: minutesWords(end.minutes) }) : t('errand.endNone')}</h2>
            <ul class="errs">
              {#each end.errands as e (e.job.id)}
                <li class:done={e.done !== null}><span class="pip" class:done={e.done !== null}></span><span class="t">{e.job.name}</span><span class="s">{e.done !== null ? t('errand.doneRow', { min: minutesShort(e.minutes) }) : t('errand.leftRow')}</span></li>
              {/each}
            </ul>
            {#if !errandsDone.length && end.minutes > 0}<p class="say">{t('errand.carried')}</p>{/if}
            <!-- one errand's story moment at a time, with Next: never a wall of stories and guesses at once (L B5) -->
            {#each errandStory as e, i (e.job.id)}
              {#if i === storyAt}
                <div class="errand-story">
                  <!-- the errand's name over its story moment: plain words, never a carved label (D-131) -->
                  <p class="errand-name">{t('errand.doneSay', { job: e.job.name })}</p>
                  <Return doneSeq={e.done} extraFinds={i === 0 ? v.runFinds : []} {go} />
                </div>
              {/if}
            {/each}
            {#if !errandStory.length}<p class="say">{v.passage}</p><Return doneSeq={null} extraFinds={v.runFinds} />{/if}
          </div>
          {#if storyAt < errandStory.length - 1}
            <button class="btn resting" onclick={() => { steady(); storyAt++; }}>{t('errand.next')}</button>
          {:else if end.completedDay || game.view.arrival}
            <button class="btn" onclick={() => leave('arrival')}>{t('delve.see')}</button>
          {:else}
            <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
          {/if}
        {:else if answer === 'no'}
          <div class="label-line centred">{t('delve.label')}</div>
          <h2 class="m">{end.total > 0 ? t('delve.kept', { min: minutesWords(end.total) }) : t('delve.keptNone')}</h2>
          <p class="say">{t('delve.keptSay')}</p>
          <!-- where Dan stopped, for next time: here, where it is useful (D-112, J3) -->
          <input class="line stop" bind:value={stopAt} onfocus={() => (typing = true)} onblur={() => (typing = false)} maxlength="160" placeholder={t('delve.whereStopped')} aria-label={t('delve.whereStopped')}
            enterkeyhint="done" onkeydown={e => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }} />
          <button class="btn resting" onclick={() => leave('today')}>{t('delve.toToday')}</button>
        {:else}
          <div class="scroll">
            <!-- no "Enough" at a recurring job's end: any session counts for its minutes (D-121, D-130) -->
            <div class="label-line centred">{t('delve.label')}</div>
            <h2 class="m">
              {#if answer === 'yes'}{t('delve.yesSay')}
              <!-- a session of a few minutes is counted, never congratulated (J14) -->
              {:else if end.enough}{end.minutes < RETURN_MIN ? t('delve.counted', { min: minutesWords(end.minutes) }) : t('delve.sessionComplete', { job: end.job.name, min: minutesWords(end.minutes) })}
              {:else if end.how === 'finishedHere' && end.minutes > 0}{t('delve.finished', { min: minutesWords(end.total), job: end.job.name })}
              {:else}{end.count > 1 ? t('delve.doneRun') : t('delve.doneOne')}{/if}
            </h2>
            {#if end.how === 'finishedHere' && !end.enough && doneSeq === null}
              <input class="line stop" bind:value={stopAt} onfocus={() => (typing = true)} onblur={() => (typing = false)} maxlength="160" placeholder={t('delve.whereStopped')} aria-label={t('delve.whereStopped')}
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
          <!-- a place waiting (the day done, an arrival): only said, so the way on stays the one button (review) -->
          {#if end.completedDay || v.arrival}<p class="say parked-n">{parkedN === 1 ? t('park.count.1') : t('park.count', { n: parkedN })}</p>
          {:else}<div class="cant"><button class="text-link" onclick={toSatchel}><span>{parkedN === 1 ? t('park.count.1') : t('park.count', { n: parkedN })}</span></button></div>{/if}
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
  .list { list-style: none; margin: 4px auto 10px; padding: 0; width: 100%; max-width: 320px; max-height: 26vh; overflow-y: auto; overflow-x: hidden; text-align: left; }
  .list button { overflow-wrap: anywhere; }
  .list button { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 44px; padding: 4px 10px; text-align: left; background: none; border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, .08); font-family: var(--life); font-size: calc(17px * var(--ts, 1)); color: #fff; cursor: pointer; }
  .list .l { flex: 1; min-width: 0; }
  .list button.struck .l { text-decoration: line-through; color: var(--ink-3); }
  .tick { flex: none; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--ink-3); }
  .tick svg { width: 14px; height: 14px; fill: none; stroke: #1a1030; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
  .list button.struck .tick { background: var(--violet-hi); border-color: var(--violet-hi); }
  .list button.struck .tick svg { opacity: 1; }
  .dv { display: contents; }
  /* the errand run's end (D-139): each errand, done with its minutes or still to do */
  .errs { list-style: none; margin: 8px auto 10px; padding: 0; max-width: 340px; text-align: left; }
  .errs li { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: center; column-gap: 12px; min-height: 40px; border-top: 1px solid var(--edge-4); }
  .errs li:last-child { border-bottom: 1px solid var(--edge-4); }
  .errs .t { font-family: var(--life); font-size: calc(17px * var(--ts, 1)); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
  .errs .s { font-family: var(--life); font-style: italic; font-size: calc(15px * var(--ts, 1)); color: var(--ink-2); text-align: right; }
  .errs li.done .s { color: #ecc890; }
  .errand-story { margin-top: 14px; }
  .errand-name { margin: 0 0 2px; font-family: var(--life); font-style: italic; font-size: calc(16.5px * var(--ts, 1)); color: #ecc890; text-align: center; overflow-wrap: anywhere; }
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
  .sofar { margin-top: 2px; font-size: calc(14px * var(--ts, 1)); opacity: .85; }
  .dv :global(.bottom p.on-it) { margin: -12px 0 14px; font-style: italic; }
  .dv :global(.bottom p.say) { margin: 6px 0 20px; font-size: calc(17px * var(--ts, 1)); color: var(--ink-2); }
  .back { flex-direction: column; gap: 3px; padding-top: 10px; padding-bottom: 10px; line-height: 1.1; }
  .back .tail { font-family: var(--life); font-style: italic; font-weight: 500; font-size: calc(17px * var(--ts, 1)); letter-spacing: .01em; text-transform: none; }
  .cant { display: flex; justify-content: center; margin-top: 8px; }
  input.stop { width: 100%; margin: 10px 0 4px; padding: 10px 12px; font: inherit; font-size: calc(16px * var(--ts, 1)); color: #fff; background: rgba(255,255,255,.06);
    border: 1px solid var(--edge-2); border-radius: 0; }
  .pair { max-width: 340px; margin: 0 auto; }
  .breath-line i { transition: width .25s linear; }
  button.home { color: var(--ink-2); }
  /* Park a thought (D-138): a quiet link in the top bar; the box over the lower part of the screen, above the keyboard
     (the phone frame is the part above it, keyboard.ts); the "Parked" line under the top bar for a few seconds */
  .park-link { font-size: calc(16px * var(--ts, 1)); }
  .park { position: absolute; z-index: 20; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; gap: 8px;
    padding: 12px 16px calc(var(--safe-b, 0px) + 4px); background: rgb(18, 16, 38); border-top: 1px solid var(--edge-2);
    animation: park-up .18s ease-out; }
  :global(html.kb) .park { padding-bottom: 12px; }
  @keyframes park-up { from { opacity: 0; } }
  .park input { min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: calc(17px * var(--ts, 1)); color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .park .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .park .btn-quiet { padding: 0 8px; min-height: 44px; }
  .park .btn-quiet:disabled { opacity: .5; }
  .parked-say { position: absolute; z-index: 6; left: 50%; transform: translateX(-50%); top: calc(var(--safe-t, 0px) + 50px); width: max-content;
    max-width: calc(100% - 32px); margin: 0; padding: 6px 14px; pointer-events: none; background: rgb(18, 16, 38); border: 1px solid var(--edge-2);
    font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: var(--ink-2); text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .parked-say:not(.shown) { position: absolute; width: 1px; height: 1px; padding: 0; border: 0; clip-path: inset(50%); }
  .parked-say.shown { animation: park-say .3s ease-out; }
  .dv :global(.bottom p.parked-n) { margin: 10px 0 0; font-size: calc(16px * var(--ts, 1)); font-style: italic; text-align: center; }
  @keyframes park-say { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .park, .parked-say.shown { animation: none; } }
  :global(html.kb) .dv.typing .mid, :global(html.kb) .dv.typing .bottom :global(.road) { display: none; }
  :global(html.kb) .dv.typing .bottom { margin-top: auto; }
</style>
