<script lang="ts">
  /* The ring at a delve's end (D-133): its light grows round the ring from where Dan was on this stretch of road to where
     he is now, led by a sparkle that slows to a stop there; in its middle the job's minutes count up. In step with the
     road line under it (EndRoad), by the same timing (tally.ts). Only transforms and opacity move: the arc is two halves
     of a ring turned into view, the number strips of digits moved in steps. It runs once, then rests (D-132). */
  import { eased, whenAt, once, reduced, TALLY_MS, TALLY_DELAY, type TallyMode } from './tally';
  import { minutesWords } from '../content/copy/en';

  let { from, to, fromN, toN, unit, mode }: { from: number; to: number; fromN: number; toN: number; unit: string; mode: TallyMode } = $props();

  let rr: HTMLElement, rl: HTMLElement, spark: HTMLElement, strips: HTMLElement[] = $state([]);
  const deg = (p: number) => Math.max(0, Math.min(1, p)) * 360;
  const halves = (a: number) => [Math.min(a, 180), Math.max(0, a - 180)];
  /* the number's columns: as many as its end has digits; a leading column stays blank until it is needed */
  const cols = $derived(Math.max(1, String(Math.max(0, toN)).length));
  const glyph = (n: number, col: number) => { const pow = 10 ** (cols - 1 - col); return n >= pow || pow === 1 ? Math.floor(n / pow) % 10 : 10; };

  function put(p: number, n: number) {
    const [r, l] = halves(deg(p));
    rr.style.transform = `rotate(${r}deg)`; rl.style.transform = `rotate(${l}deg)`;
    spark.style.transform = `rotate(${deg(p)}deg)`;
    strips.forEach((s, k) => { if (s) s.style.transform = `translateY(${-glyph(n, k)}em)`; });
  }
  let played = false;
  function play() {
    played = true;
    const a0 = deg(from), a1 = deg(to), N = 60, fr: Keyframe[] = [], fl: Keyframe[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, [r, l] = halves(a0 + (a1 - a0) * eased(t));
      fr.push({ offset: t, transform: `rotate(${r}deg)` }); fl.push({ offset: t, transform: `rotate(${l}deg)` });
    }
    /* sampled along the easing already: played evenly between the samples */
    once(rr, fr, { easing: 'linear' }); once(rl, fl, { easing: 'linear' });
    once(spark, [{ transform: `rotate(${a0}deg)` }, { transform: `rotate(${a1}deg)` }]);
    /* each digit steps when the count passes it */
    strips.forEach((s, k) => {
      if (!s) return;
      const frames: Keyframe[] = [{ offset: 0, transform: `translateY(${-glyph(fromN, k)}em)`, easing: 'step-end' }];
      let was = glyph(fromN, k);
      for (let n = fromN + 1; n <= toN; n++) {
        const g = glyph(n, k);
        if (g === was) continue;
        was = g;
        frames.push({ offset: whenAt((n - fromN) / (toN - fromN)), transform: `translateY(${-g}em)`, easing: 'step-end' });
      }
      frames.push({ offset: 1, transform: `translateY(${-glyph(toN, k)}em)` });
      once(s, frames, { easing: 'linear' });
    });
  }
  /* shown: it counts, or waits at its start while "Is it done?" is asked; answered, Done counts and "Not yet" shows the
     end as it is, without counting */
  $effect(() => {
    const m = mode;
    if (!rr || played || strips.length < cols) return;
    if (m === 'play' && !reduced()) play(); else put(m === 'from' ? from : to, m === 'from' ? fromN : toN);
  });
  const sparkLife = TALLY_MS + TALLY_DELAY;
</script>

<div class="tally" class:counting={mode === 'play'} aria-hidden="true" style="--life:{sparkLife}ms">
  <div class="half r"><div class="rot" bind:this={rr}><i class="arcband"></i></div></div>
  <div class="half l"><div class="rot" bind:this={rl}><i class="arcband"></i></div></div>
  <div class="spark" bind:this={spark}>
    <div class="arm"><i class="haze"></i><i class="tail"></i><i class="dot"></i><i class="glint"><b></b><b></b></i></div>
  </div>
</div>
<div class="count" class:shown={mode !== 'from'}>
  <div class="num" aria-hidden="true">{#each Array(cols) as _, k (k)}<span class="digit"><span class="strip" bind:this={strips[k]}>{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as d}<span>{d}</span>{/each}<span>&nbsp;</span></span></span>{/each}</div>
  <div class="unit" aria-hidden="true">{unit}</div>
  <!-- said in full words: the unit drawn under the count is short, so it never reads "1 minutes" mid-count (L C6) -->
  <span class="sr">{minutesWords(toN)}</span>
</div>

<style>
  /* the ring's own light is quiet at the end (light.js: .tallying); this one takes its place, on the same circle
     (radius .47 of the ring) */
  .tally { position: absolute; inset: -4%; pointer-events: none; z-index: 2; mix-blend-mode: plus-lighter; }
  .half { position: absolute; top: 0; width: 50%; height: 100%; overflow: hidden; }
  .half.r { left: 50%; }
  .half.l { left: 0; }
  .rot { position: absolute; top: 0; width: 100%; height: 100%; overflow: hidden; will-change: transform; }
  .r .rot { left: -100%; transform-origin: 100% 50%; }
  .l .rot { left: 100%; transform-origin: 0 50%; }
  .arcband { position: absolute; top: 0; width: 200%; height: 100%; border-radius: 50%;
    /* the lit arc: a violet bloom round a white core, as the delve's ring is drawn */
    background: radial-gradient(circle closest-side, transparent 76%, rgba(126, 110, 245, .16) 81%, rgba(185, 168, 255, .55) 84.4%,
      rgba(241, 239, 255, .98) 86.2%, #fff 87%, rgba(241, 239, 255, .98) 87.8%, rgba(185, 168, 255, .55) 89.6%, rgba(126, 110, 245, .16) 93%, transparent 98%); }
  .r .arcband { left: 0; }
  .l .arcband { left: -100%; }
  /* the sparkle at the arc's head: turned round the centre, out at the ring's radius */
  .spark { position: absolute; left: 50%; top: 50%; width: 0; height: 0; will-change: transform; }
  .arm { position: absolute; left: 0; top: 0; width: 0; height: 0; transform: translateY(calc(var(--R) * -.47)); }
  .arm i { position: absolute; display: block; border-radius: 50%; }
  .haze { left: calc(var(--R) * -.15); top: calc(var(--R) * -.15); width: calc(var(--R) * .3); height: calc(var(--R) * .3);
    background: radial-gradient(circle, rgba(236, 232, 255, .7), rgba(185, 168, 255, .3) 40%, rgba(143, 134, 255, 0) 70%); }
  .dot { left: -4px; top: -4px; width: 8px; height: 8px; background: radial-gradient(circle, #fff 35%, rgba(217, 214, 255, .8) 60%, rgba(185, 168, 255, 0)); box-shadow: 0 0 10px 3px rgba(185, 168, 255, .8); }
  /* a short comet's tail behind it, along the ring (it travels clockwise: the tail trails to the left) */
  .tail { left: calc(var(--R) * -.2); top: -2px; width: calc(var(--R) * .2); height: 4px; border-radius: 2px !important;
    background: linear-gradient(90deg, rgba(185, 168, 255, 0), rgba(228, 222, 254, .75)); transform-origin: 100% 50%; transform: rotate(-4deg); opacity: 0; }
  .glint { left: 0; top: 0; width: 0; height: 0; border-radius: 0 !important; opacity: .5; }
  .glint b { position: absolute; display: block; }
  .glint b:first-child { left: calc(var(--R) * -.08); top: -.5px; width: calc(var(--R) * .16); height: 1px; background: linear-gradient(90deg, rgba(217, 214, 255, 0), rgba(255, 255, 255, .95), rgba(217, 214, 255, 0)); }
  .glint b:last-child { left: -.5px; top: calc(var(--R) * -.08); width: 1px; height: calc(var(--R) * .16); background: linear-gradient(180deg, rgba(217, 214, 255, 0), rgba(255, 255, 255, .95), rgba(217, 214, 255, 0)); }
  /* while it travels: the tail shows and the glint twinkles; at the stop, one flare, then still */
  .counting .tail { animation: tail var(--life) linear both; }
  .counting .glint { animation: glint var(--life) ease-out both; }
  .counting .haze { animation: flare var(--life) ease-out both; }
  @keyframes tail { 0%, 14% { opacity: 0; } 24% { opacity: 1; } 80% { opacity: .5; } 100% { opacity: 0; } }
  @keyframes glint { 0% { opacity: .2; transform: scale(.6) rotate(0); } 30% { opacity: .8; transform: scale(1.1) rotate(20deg); } 55% { opacity: .5; transform: scale(.8) rotate(35deg); }
    88% { opacity: 1; transform: scale(1.5) rotate(45deg); } 100% { opacity: .55; transform: scale(1) rotate(45deg); } }
  @keyframes flare { 0% { opacity: .5; transform: scale(.8); } 86% { opacity: .75; transform: scale(1); } 93% { opacity: 1; transform: scale(1.35); } 100% { opacity: .7; transform: scale(1); } }

  /* the minutes in the middle, as the set-up's dial shows its minutes */
  .count { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity .5s var(--ease); z-index: 3; }
  .count.shown { opacity: 1; }
  .num { display: flex; font-family: var(--life); font-weight: 300; font-size: calc(var(--R) * .27); line-height: 1; height: 1em; color: #f6f7ff;
    font-variant-numeric: tabular-nums lining-nums;
    /* the glow on the number as a whole: a glow on each digit was cut square by its column's edges */
    filter: drop-shadow(0 0 1px rgba(10, 6, 34, .6)) drop-shadow(0 0 10px rgba(143, 134, 255, .85)); }
  .digit { display: block; height: 1em; overflow: hidden; }
  .strip { display: flex; flex-direction: column; will-change: transform; }
  .strip span { display: block; height: 1em; line-height: 1; text-align: center; }
  .unit { font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: #d6d4f2; margin-top: 6px; text-shadow: 0 1px 10px rgba(10, 6, 34, .9); }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .counting .tail, .counting .glint, .counting .haze { animation: none; } .count { transition: none; } }
</style>
