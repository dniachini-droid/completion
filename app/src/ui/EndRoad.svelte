<script lang="ts">
  /* The road line at a delve's end (D-133), as on the run set-up: this stretch from the last place, the side chamber
     halfway, the next place at its end. A sparkly flame travels from where Dan was to where he is now, lighting the way
     behind it, in step with the ring's count (EndRing, tally.ts); the chamber and the place light as it passes them.
     Only the minutes this delve moved Dan are travelled (never counted twice). Transforms and opacity only; once.
     Today shows it still, with the minutes still to go after each label (`notes`, Dan, D-140). */
  import { t, minutesShort } from '../content/copy/en';
  import { once, whenAt, reduced, TALLY_MS, TALLY_DELAY, type TallyMode } from './tally';

  /* `spoken`: the line said in words for VoiceOver (deep review A#42), where nothing around it already says it (Today does) */
  let { road, from, to, mode, notes = {}, spoken = true }: { road: { from: number; chamber: number; to: number; place: boolean }; from: number; to: number; mode: TallyMode; notes?: { side?: string; place?: string }; spoken?: boolean } = $props();
  const say = $derived([
    ...(road.place && road.to - to > 0 ? [t('today.road.place', { min: minutesShort(road.to - to) })] : []),
    ...(road.chamber - to > 0 ? [t('today.road.side', { min: minutesShort(road.chamber - to) })] : []),
  ].join(', '));

  let W = $state(300);
  let lit: HTMLElement, flame: HTMLElement;
  const X0 = 10;
  const span = $derived(Math.max(1, road.to - road.from));
  const f = (m: number) => Math.max(0, Math.min(1, (m - road.from) / span));
  const fFrom = $derived(f(from)), fTo = $derived(f(to)), fSide = $derived(f(road.chamber));
  const px = (q: number) => X0 + (W - 2 * X0) * q;
  /* when the flame reaches a mark: never (it is behind or beyond), at once, or partway through the count */
  const at = (q: number): number | null => {
    if (q > fTo + 1e-6) return null;
    if (mode !== 'play' || reduced() || q <= fFrom) return 0;
    return TALLY_DELAY + whenAt((q - fFrom) / Math.max(1e-6, fTo - fFrom)) * TALLY_MS;
  };
  const sideAt = $derived(at(fSide)), placeAt = $derived(road.place ? at(1) : null);

  function put(end: boolean) {
    lit.style.transform = `scaleX(${end ? 1 : 0})`;
    flame.style.transform = `translateX(${px(end ? fTo : fFrom)}px)`;
  }
  let played = false, anims: Animation[] = [];
  $effect(() => {
    const m = mode, w = W;
    if (!lit || !w) return;
    /* counted already, and the line changed size (a turn of the phone): its end, where it is now */
    if (played) { for (const a of anims) a.cancel(); anims = []; put(true); return; }
    if (m === 'play' && !reduced()) {
      played = true;
      anims = [once(lit, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]),
        once(flame, [{ transform: `translateX(${px(fFrom)}px)` }, { transform: `translateX(${px(fTo)}px)` }])];
    } else put(m !== 'from');
  });
  const ARCH = 'M-6 8 V-1 Q-6 -8 0 -8 Q6 -8 6 -1 V8';
</script>

{#if spoken && say}<p class="sr-only">{say}</p>{/if}
<div class="road" class:moving={mode === 'play'} bind:clientWidth={W} aria-hidden="true" style="--life:{TALLY_MS + TALLY_DELAY}ms">
  <i class="track"></i>
  <i class="was" style="transform:scaleX({fFrom})"></i>
  <!-- the lit part's place and length on its box, its growth on the element inside (its style is the count's alone) -->
  <div class="litbox" style="left:{px(fFrom)}px;width:{Math.max(0, px(fTo) - px(fFrom))}px"><i class="lit" bind:this={lit}></i></div>
  <i class="start"></i>
  <!-- the side chamber, halfway (D-122) -->
  <div class="mark side" style="left:{px(fSide)}px">
    <svg viewBox="-9 -11 18 21"><path d="{ARCH} Z" fill="#0b0b1c" /><path d={ARCH} fill="none" stroke="#d9d6ff" stroke-width="1.5" stroke-linecap="round" /></svg>
    <svg class="on" style={sideAt === null ? 'opacity:0' : `transition-delay:${sideAt}ms`} class:go={sideAt !== null} viewBox="-9 -11 18 21"><path d={ARCH} fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" /></svg>
    <span class="lab">{t('set.side')}{#if notes.side}<b>{notes.side}</b>{/if}</span>
  </div>
  <!-- the next place, at the stretch's end -->
  <div class="mark place" class:far={!road.place} style="left:{px(1)}px">
    <svg viewBox="-9 -11 18 21"><path d="{ARCH} Z" fill="#0b0b1c" /><path d={ARCH} fill="none" stroke="#ece9ff" stroke-width="1.3" stroke-linecap="round" /></svg>
    <svg class="on" style={placeAt === null ? 'opacity:0' : `transition-delay:${placeAt}ms`} class:go={placeAt !== null} viewBox="-9 -11 18 21"><path d={ARCH} fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" /></svg>
    <span class="lab">{road.place ? t('set.nextPlace') : t('set.onward')}{#if notes.place}<b>{notes.place}</b>{/if}</span>
  </div>
  <!-- the flame: where Dan is -->
  <div class="flame" bind:this={flame}><i class="glow"></i><i class="s s1"></i><i class="s s2"></i><i class="s s3"></i><i class="core"></i></div>
</div>

<style>
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  /* the line sits low enough for the label over it, and the box is tall enough for the label under it, whatever the
     phone's text size (spacing review D2): nothing hangs out of it into the words that follow */
  .road { --ty: calc(12px + 20px * var(--ts, 1)); position: relative; width: 100%; max-width: 340px; height: calc(24px + 41px * var(--ts, 1)); margin: 0 auto 8px; }
  .road > i { position: absolute; display: block; }
  .track { left: 10px; right: 10px; top: var(--ty); height: 1px; background: linear-gradient(90deg, rgba(186, 186, 255, .34), rgba(186, 186, 255, .2)); }
  /* the way already walked on this stretch, gold as on the step's line; this delve's, lit violet-white */
  .was { left: 10px; right: 10px; }
  .litbox { position: absolute; top: calc(var(--ty) - 1px); height: 3px; }
  .was { top: calc(var(--ty) - .5px); height: 2px; transform-origin: 0 50%; border-radius: 1px; }
  .was { background: rgba(242, 193, 112, .55); }
  .lit { position: absolute; display: block; left: 0; top: 0; width: 100%; height: 3px; border-radius: 1px; transform-origin: 0 50%; background: linear-gradient(90deg, rgba(143, 134, 255, .5), #f1efff); box-shadow: 0 0 6px rgba(143, 134, 255, .95); transform: scaleX(0); will-change: transform; }
  .start { left: 7px; top: calc(var(--ty) - 2.5px); width: 6px; height: 6px; border-radius: 50%; background: rgba(242, 193, 112, .7); }
  .mark { position: absolute; top: var(--ty); width: 0; height: 0; }
  .mark svg { position: absolute; left: -9px; top: -13px; width: 18px; height: 21px; overflow: visible; }
  .side svg { transform: scale(.7); transform-origin: 50% 70%; opacity: .6; }
  .side svg.on, .place svg.on { opacity: 0; filter: drop-shadow(0 0 4px rgba(143, 134, 255, 1)); transition: opacity .5s var(--ease); }
  .side svg.on.go, .place svg.on.go { opacity: 1; }
  .place.far svg { opacity: .35; }
  .lab { position: absolute; top: -30px; left: 0; transform: translateX(-50%); white-space: nowrap; font-family: var(--life); font-style: italic; font-size: calc(14px * var(--ts, 1)); color: #c7c9e6; }
  .place .lab { transform: translateX(-100%); left: 9px; top: 12px; }
  /* anchored by its foot, so a larger text size grows it upward, never down onto its arch (T10) */
  .side .lab { top: auto; bottom: 12px; }
  .lab b { font-weight: inherit; color: #ece9ff; }
  .lab b::before { content: ' · '; color: #c7c9e6; }
  /* the flame: a gold point with a soft glow, flickering and shedding sparks while it travels, still once there */
  .flame { position: absolute; left: 0; top: var(--ty); width: 0; height: 0; will-change: transform; }
  .flame i { position: absolute; display: block; border-radius: 50%; }
  .glow { left: -14px; top: -14px; width: 28px; height: 28px; background: radial-gradient(circle, rgba(255, 210, 122, .75), rgba(242, 193, 112, .25) 45%, rgba(242, 193, 112, 0) 70%); }
  .core { left: -3.6px; top: -5.2px; width: 7.2px; height: 9px; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38% !important;
    background: radial-gradient(circle at 50% 62%, #fff 20%, #ffe7b0 45%, #ffd27a 75%); box-shadow: 0 0 6px 2px rgba(242, 193, 112, .9); transform-origin: 50% 80%; }
  .s { left: -1.2px; top: -1.2px; width: 2.4px; height: 2.4px; background: #fff3d6; box-shadow: 0 0 4px 1px rgba(255, 210, 122, .9); opacity: 0; }
  .moving .core { animation: flicker .38s ease-in-out 8 alternate; }
  .moving .glow { animation: bloom var(--life) ease-out both; }
  .moving .s1 { animation: shed .9s ease-out .45s 3; }
  .moving .s2 { animation: shed .9s ease-out .75s 3; --dy: 5px; }
  .moving .s3 { animation: shed .9s ease-out 1.05s 2; --dy: -3px; }
  @keyframes flicker { from { transform: scale(1, 1); } to { transform: scale(.88, 1.14); } }
  @keyframes bloom { 0% { transform: scale(.8); } 88% { transform: scale(1); } 94% { transform: scale(1.45); } 100% { transform: scale(1); } }
  @keyframes shed { 0% { opacity: .95; transform: translate(0, 0) scale(1); } 100% { opacity: 0; transform: translate(-16px, calc(var(--dy, -7px))) scale(.4); } }
  @media (prefers-reduced-motion: reduce) { .moving .core, .moving .glow, .moving .s { animation: none; } .side svg.on, .place svg.on { transition: none; } }
</style>
