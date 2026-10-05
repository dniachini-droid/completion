<script lang="ts">
  /* The step, for a job done away from the phone (CONCEPT §2 → coming back): its minutes move Dan along the route,
     a line of the passage, then out. Settled within a moment; a tap is all it needs. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import Return from './Return.svelte';
  import Look from './Look.svelte';
  import EndRoad from './EndRoad.svelte';
  import EndRing from './EndRing.svelte';
  import { backTo, type Go } from './nav';
  import { back } from './back.svelte';
  import { walked } from '../core/game';
  import { moment } from './moment.svelte';
  import { onMount } from 'svelte';

  let { go, seq }: { go: Go; seq: number } = $props();
  const v = $derived(game.whole);
  const fact = $derived(game.facts.find(f => f.seq === seq));
  const job = $derived(fact && fact.type === 'jobDone' ? game.job(fact.job) : undefined);
  const completedDay = $derived(game.facts.some(f => f.seq > seq && f.type === 'dayCompleted'));

  /* the count, as at a delve's end (D-133, D-134): the road line from where Dan was to where this moved him, the ring's
     arc and sparkle in step with it, and the job's minutes counted up; a tick's own minutes are what moved him now */
  const jd = $derived(fact && fact.type === 'jobDone' ? fact : null);
  /* only a tick's own minutes move Dan here: a delve's moved him at its own end, so said done afterwards (It's done, No
     more) the line and the count stand still at the job's minutes, never replayed as new (J13) */
  /* where Dan stands on the road, as the rules count it (a tick taken back is made up first, deep review B3) */
  const atW = $derived(walked(game.facts.filter(f => f.seq < seq)));
  /* a side chamber the tick's minutes reached is shown here, on the tick's own screen (D-122, D-134) */
  const tickAt = $derived(jd?.ticked ? game.facts.filter(f => f.type === 'stepsGained' && f.job === jd.job && (f as { tick?: true }).tick && f.seq < seq).pop() : undefined);
  const moved = $derived(tickAt ? atW - walked(game.facts.filter(f => f.seq < tickAt.seq)) : 0);
  /* the count plays once: looked at again (back from a record, a Key's niche), it stands as left (deep review B9) */
  const played = !!moment.ends[seq]?.played;
  onMount(() => { moment.ends[seq] = { ...(moment.ends[seq] ?? {}), played: true }; });
  const mode = $derived(moved && !played ? 'play' : 'still');
  const chambers = $derived(tickAt ? game.facts.filter(f => f.type === 'findGiven' && f.why === 'chamber' && !f.job && f.seq > tickAt.seq && f.at === tickAt.at).map(f => (f as { id: string }).id) : []);
  const share = (m: number) => Math.max(0, Math.min(1, (m - v.road.from) / Math.max(1, v.road.to - v.road.from)));

  /* the painting, seen without the words (D-105) */
  let looking = $state(false);
  const look = () => (looking = true);

  /* back where it was ticked off (Today, the Satchel, the Week), or on to a place it reached (N clumsy 3) */
  function leave() { go(v.arrival ? 'arrival' : 'back'); }
</script>

<Scene painting={v.here.painting} />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={leave}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><!-- never the next place's name before it is reached (D-154) -->
      <span>{v.arrival ? t('arrive.toward') : back.label}</span></button>
      <span></span><span></span>
    </div>
  </header>
  <!-- the painting, left clear: a tap on it looks at it -->
  <div class="mid" onclick={look} role="presentation">
    {#if jd}<div class="tring"><EndRing from={share(atW - moved)} to={share(atW)} fromN={Math.max(0, jd.minutes - (jd.ticked ?? 0))} toN={jd.minutes} unit={t('tally.unit')} {mode} /></div>{/if}
  </div>
  <section class="bottom fit col center">
    <div class="scroll">
      <!-- the road line first, then what was done: in the same order as a delve's end (spacing review D20, Dan: C8) -->
      {#if jd}<div class="rise route"><EndRoad road={v.road} from={atW - moved} to={atW} {mode} /></div>{/if}
      <div class="label-line centred gold rise d1">{t('step.label')}</div>
      <h2 class="say-lg rise d2">{job ? t('step.done', { job: job.name }) : ''}</h2>
      <div class="rise d3"><Return doneSeq={fact && fact.type === 'jobDone' ? seq : null} extraFinds={chambers} {go} {look} /></div>
    </div>
    <div class="go rise d3">
      {#if v.arrival}
        <button class="btn" onclick={leave}>{t('delve.see')}</button>
      {:else}
        <button class="btn resting" onclick={leave}>{backTo(back.label)}</button>
      {/if}
    </div>
  </section>
</div>
{#if looking}<Look close={() => (looking = false)} />{/if}

<style>
  .bottom h2 { margin-top: 10px; }
  /* the ring over the painting, as large as the room left for it (never under the room kept for it below) */
  /* it keeps room for the count, even with the story's words below it: they scroll (as at a delve's end, D-133) */
  .mid { container-type: size; display: flex; align-items: center; justify-content: center; min-height: clamp(112px, 19vh, 180px); }
  .tring { --R: min(170px, 46vw, 72cqh); position: relative; width: var(--R); height: var(--R); pointer-events: none; }
  .tring::before { content: ""; position: absolute; inset: 3%; border-radius: 50%; border: 1.2px solid rgba(217, 214, 255, .3);
    background: radial-gradient(circle, rgba(12, 8, 40, .5), rgba(12, 8, 40, .25) 60%, transparent 72%); }
  /* the story's last line fades out above the button's corner marks, not under them (spacing review D18) */
  .go { margin-top: 8px; }
  button.home { color: var(--ink-2); }
</style>
