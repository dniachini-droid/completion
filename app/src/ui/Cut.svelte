<script lang="ts">
  /* A word, cut (the story job's §7; mock-up cut.html). Four taps, one line each: the rod's edge in the blank, the first
     mark, the second, the lock. Then the place answers on its own (about 6 s, no tap): for the first word the cups
     wake down the hall, near to far, and the stone under the lintel goes; the interface steps aside while it happens.
     Then the arrival settles: the place's line, the guesses it confirmed, the day's gold, and the way through.
     The hall is the approved painted Lamp Hall (scene/hall.js); the marks are the Cut's own lettering. */
  import { game, content } from './game.svelte';
  import { moment } from './moment.svelte';
  import { t } from '../content/copy/en';
  import { platform } from '../platform';
  import { lettering } from '../content/sealed/lettering';
  import { beatOf } from '../core/story';
  import type { Arrival } from '../core/game';
  import Glyph from './Glyph.svelte';
  import Guess from './Guess.svelte';
  import Settled from './Settled.svelte';
  import './scene/lamp.js';
  import './scene/hall.js';

  let { a, leave }: { a: Arrival; leave: (to: 'through' | 'today' | 'later') => void } = $props();

  interface HallView {
    W: number; H: number; cups: { s: number }[]; door: number[][];
    project(x: number, y: number, z: number): [number, number] | null;
    onBeam(u: number, v: number): [number, number];
    openStone?(ms: number): void; wake(): void;
  }
  const Hall = (window as unknown as { Hall: { draw(el: HTMLElement, o: object): HallView } }).Hall;

  const s = content.story;
  const beat = beatOf(s, a.id);
  const word = s.words.find(w => w.id === beat?.carries?.word);
  const marks = word?.marks ?? [];
  /* the first word wakes the hall; a later one is cut where the lamps are already lit */
  const wakes = word?.id === s.words[0]?.id;
  const taps = a.taps ?? [];
  /* a mark the word's req names that Dan left unguessed: asked here, before the first tap, one tap, any candidate
     (a guess never holds the story up; the word is where it counts) */
  const ask = $derived((beat?.req ?? []).filter(r => r.startsWith('mk-') && !game.view.story.guessed.has(r)));
  /* what Dan read the marks as before the place answered, and after */
  const before = $derived(marks.map(m => game.view.story.guessed.get(m) ?? ''));
  const after = $derived(marks.map(m => {
    const h = game.view.story.guessed.get(m);
    const mk = s.marks.find(x => x.id === m);
    return h && mk?.right?.includes(h) ? h : mk?.candidates?.[0] ?? h ?? '';
  }));

  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = $state(0);                         /* taps made: 0 … 4 */
  let phase = $state<'' | 'lock' | 'cine' | 'answer' | 'settled'>('');
  const hint = $derived(step === 0 ? t('cut.hint.rod') : step === 1 ? t('cut.hint.first') : step === 2 ? t('cut.hint.second') : step === 3 ? t('cut.hint.lock') : '');
  const said = $derived(step === 0 ? t('cut.ask') : taps[Math.min(step, taps.length) - 1] ?? '');
  const has = (p: typeof phase) => ['lock', 'cine', 'answer', 'settled'].indexOf(phase) >= ['lock', 'cine', 'answer', 'settled'].indexOf(p) && phase !== '';

  let root: HTMLDivElement, hallEl: HTMLDivElement, cutsEl: HTMLDivElement, stage: HTMLDivElement;
  let h: HallView | null = null;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, reduce ? 0 : ms));

  /* a mark's drawing (40 × 40, straight cuts) as polylines, placed on the beam's face beside the blank (metres) */
  function onFace(d: string, u0: number): number[][][] {
    const lines: number[][][] = [];
    let cur: number[][] = [];
    for (const m of d.matchAll(/([MLZ])\s*(-?[\d.]+)?\s*(-?[\d.]+)?/g)) {
      if (m[1] === 'M') { if (cur.length > 1) lines.push(cur); cur = []; }
      if (m[1] === 'Z') { if (cur.length) cur.push(cur[0]); continue; }
      cur.push([u0 + (+m[2] / 40) * .42, .62 - (+m[3] / 40) * .42]);
    }
    if (cur.length > 1) lines.push(cur);
    return lines;
  }

  $effect(() => {
    moment.cutting = true;
    const faceMarks = marks.flatMap((m, i) => onFace(lettering[m]?.d ?? '', 1.44 + i * .48));
    h = Hall.draw(hallEl, { cam: { x: .1, y: 1.65, z: 2.4, f: .62, cx: .62, cy: .42 }, lintel: 'opening', gold: .15, cups: wakes ? 'dark' : 'lit', marks: faceMarks, res: .8 });
    const hv = h;
    /* the cups wake as small warm points receding in perspective: each glow's radius and strength shrink with distance */
    const cupEls = hallEl.querySelectorAll<SVGGElement>('.hall-cup');
    hv.cups.forEach((c, i) => {
      const g = cupEls[i]; if (!g) return;
      const glow = g.querySelector('circle'), k = Math.min(1, Math.pow(c.s / 40, .8));
      if (glow) { glow.setAttribute('r', Math.max(1.5, c.s * 1.5 * k).toFixed(1)); glow.style.setProperty('--a', (.7 * Math.min(1, .15 + c.s / 45)).toFixed(3)); }
      for (const el of Array.from(g.children)) if (el !== glow) (el as SVGElement).style.setProperty('--a', Math.min(1, .45 + c.s / 30).toFixed(3));
    });
    /* the marks Dan cuts go into the rod-shaped blank on the lintel itself: drawn flat on the beam's face (metres × 400),
       then laid onto the painted beam with a perspective transform, so strokes and glow foreshorten with the stone */
    const K = 400, FW = 2.6 * K, FH = .85 * K;
    const q0 = hv.onBeam(0, .85), q1 = hv.onBeam(2.6, .85), q2 = hv.onBeam(2.6, 0), q3 = hv.onBeam(0, 0);
    const [x0, y0] = q0, [x1, y1] = q1, [x2, y2] = q2, [x3, y3] = q3;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
    const A = x1 - x0 + g * x1, B = x3 - x0 + hh * x3, D = y1 - y0 + g * y1, E = y3 - y0 + hh * y3;
    cutsEl.style.width = FW + 'px'; cutsEl.style.height = FH + 'px';
    cutsEl.style.transform = `matrix3d(${[A / FW, D / FW, 0, g / FW, B / FH, E / FH, 0, hh / FH, 0, 0, 1, 0, x0, y0, 0, 1].join(',')})`;
    const glyph = (d: string, u0: number, u1: number, cls: string, stroke: string, sw: number, dy = 0) => {
      const x = (.27 + .9 * u0) * K, w = .9 * (u1 - u0) * K, y = (.85 - .63) * K + dy, hgt = .42 * K;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(w / 40).toFixed(3)} ${(hgt / 40).toFixed(3)})"><path class="${cls}" pathLength="1" d="${d}" fill="none" stroke="${stroke}" stroke-width="${(sw / 4.1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    };
    const rx = .27 * K, ry = (.85 - .63) * K, rw = .9 * K, rh = .42 * K;
    let svg = `<svg viewBox="0 0 ${FW} ${FH}" preserveAspectRatio="none"><rect class="lockflash" x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="${rh * .5}" fill="rgba(228,226,255,.75)" style="filter:blur(12px)"/>`;
    marks.forEach((m, i) => {
      const d = lettering[m]?.d ?? '', u0 = i ? .52 : .04, u1 = i ? .96 : .48, c = `cutm c${i + 1}`;
      /* the lower lip catching light, the dark groove, then the lit cut in it */
      svg += glyph(d, u0, u1, c, 'rgba(214,210,255,.35)', 17, 5) + glyph(d, u0, u1, c, '#0e0c1e', 14) + glyph(d, u0, u1, c + ' lit', '#f0eeff', 8);
    });
    cutsEl.innerHTML = svg + '</svg>';
    /* the camera: down the hall toward the opening */
    const door = hv.door, vp = hv.project(0, 1.65, 60) ?? [hv.W / 2, hv.H / 2];
    const ox = ((door[0][0] + door[3][0]) / 2) * .62 + vp[0] * .38, oy = ((door[1][1] + door[0][1]) / 2) * .6 + vp[1] * .4;
    stage.style.setProperty('--ox', ox + 'px'); stage.style.setProperty('--oy', oy + 'px');
    stage.style.setProperty('--tx', (hv.W * .42 - ox) * .5 + 'px'); stage.style.setProperty('--ty', (hv.H * .4 - oy) * .5 + 'px');
    return () => { timers.forEach(clearTimeout); moment.cutting = false; };
  });

  function tapRod() {
    if (step === 0) { if (ask.length) return; step = 1; void platform.haptics.tick(); }
    else if (step === 3) lock();
  }
  function tapMark(i: number) {
    if (step !== i + 1) return;
    step = i + 2; void platform.haptics.tick();
  }
  function lock() {
    step = 4; phase = 'lock'; void platform.haptics.ring();
    later(() => { phase = 'cine'; }, 1400);                        /* the interface steps aside */
    later(() => { phase = 'answer'; h?.openStone?.(reduce ? 1 : 1900); if (wakes) h?.wake(); }, 1900);
    later(() => { phase = 'settled'; moment.cutting = false; moment.cutDone = a.seq; }, 7400);   /* about 6 s of the place answering */
  }
  /* a tap during the answer settles it at once (as every arrival settles on a tap) */
  function hurry(e: PointerEvent) {
    if (phase !== 'answer' && phase !== 'cine') return;
    if ((e.target as HTMLElement).closest('button')) return;
    timers.forEach(clearTimeout);
    if (phase === 'cine') { phase = 'answer'; h?.openStone?.(1); if (wakes) h?.wake(); }
    root.getAnimations({ subtree: true }).forEach(x => { try { x.finish(); } catch { /* endless */ } });
    phase = 'settled'; moment.cutting = false; moment.cutDone = a.seq;
  }
</script>

<div class="cut" class:rod={step >= 1} class:c1={step >= 2} class:c2={step >= 3} class:lock={has('lock')} class:cine={has('cine')}
  class:answer={has('answer')} class:settled={phase === 'settled'} bind:this={root} onpointerdown={hurry} role="presentation">
  <div class="stage" bind:this={stage}>
    <div class="paint" bind:this={hallEl} aria-hidden="true"></div>
    <div class="lintel-cuts" bind:this={cutsEl} aria-hidden="true"></div>
  </div>
  <div class="fog" aria-hidden="true"><i></i></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>
  <div class="scrim-top" aria-hidden="true"></div>
  <div class="scrim-bottom" aria-hidden="true"></div>

  <div class="ui">
    <header class="topbar col rise fade-out">
      <button class="home" onclick={() => leave(phase === 'settled' ? 'today' : 'later')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button>
      <span></span><span></span>
    </header>

    <div class="top col head rise d1 fade-out" aria-live="polite">
      <div class="before">
        <div class="label-line">{t('cut.label')}</div>
        <h1 class="carve lg">{a.name}</h1>
        {#key step}<p class="soft on-scene said">{said}</p>{/key}
      </div>
      <div class="after">
        <div class="label-line gold">{t('arrive.label')}</div>
        <h1 class="carve lg">{a.name}</h1>
        <p class="soft on-scene">{a.line}</p>
      </div>
    </div>

    <div class="mid"></div>

    <section class="bottom col word rise d2" class:fit={phase === 'settled'} aria-label={t('cut.label')}>
      {#if phase === 'settled'}
        <div class="scroll">
          <div class="settle-list"><Settled beat={a.id} /></div>
          {#if a.completedDay}<p class="enough">{t('arrive.enough')} <em>{t('arrive.enough2')}</em></p>{/if}
        </div>
      {/if}
      {#if step === 0 && ask.length}<div class="ask">{#each ask as m (m)}<Guess mark={m} at={a.id} />{/each}</div>{/if}
      <div class="box ticks wordbox">
        <button class="rodbtn" class:ready={(step === 0 && !ask.length) || step === 3} onclick={tapRod} disabled={(step !== 0 && step !== 3) || (step === 0 && ask.length > 0)} aria-label={step === 0 ? t('cut.hint.rod') : t('cut.hint.lock')}>
          <svg class="rodsvg" viewBox="0 0 300 92" aria-hidden="true">
            <rect class="rodbody" x="44" y="8" width="212" height="72" rx="36" />
            <path d="M150 20 V68" stroke="rgba(206,204,255,.22)" />
            {#each marks as m, i (m)}
              <g transform="translate({i ? 176 : 78} 21) scale(1.15)">
                <path class="ghostm" d={lettering[m]?.d ?? ''} fill="none" stroke-width="1.04" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                <path class="rm c{i + 1}" d={lettering[m]?.d ?? ''} pathLength="1" fill="none" stroke="#f4f2ff" stroke-width="1.91" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
              </g>
            {/each}
            <g class="lockring">
              <rect x="36" y="0" width="228" height="88" rx="44" fill="none" stroke="#e8e6ff" stroke-width="1.2" />
              <path d="M18 44 H36 M264 44 H282" stroke="#e8e6ff" stroke-width="1.2" />
            </g>
          </svg>
        </button>
        <div class="readings" aria-hidden="true">
          {#each marks as _, i}<span class="r{i + 1}">{has('lock') ? after[i] : before[i]}{#if before[i] && !has('lock')}<span class="q">?</span>{/if}</span>{/each}
        </div>
        <p class="hint fade-out">{hint}</p>
      </div>
      <div class="slot">
        <div class="keys">
          {#each marks as m, i (m)}
            <button class="key" class:ready={step === i + 1} class:done={step > i + 1} disabled={step !== i + 1} onclick={() => tapMark(i)}>
              <Glyph mark={m} size={28} lit={step === i + 1} />
              <span>{before[i]}{#if before[i]}<span class="q">?</span>{/if}</span>
            </button>
          {/each}
        </div>
        <button class="btn go" onclick={() => leave(wakes ? 'through' : 'today')}>{wakes ? t('cut.through') : t('arrive.onward')}</button>
      </div>
      {#if step === 0}<div class="after-row"><button class="text-link" onclick={() => leave('later')}><span>{t('cut.later')}</span></button></div>{/if}
    </section>
  </div>
</div>

<style>
  .cut { display: contents; }
  /* the stage: the painting and the marks on the lintel move together (the camera) */
  .stage { position: absolute; inset: 0; z-index: 0; transform-origin: var(--ox, 30%) var(--oy, 45%); transition: transform 3.2s cubic-bezier(.45, 0, .2, 1); will-change: transform; }
  .answer .stage { transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(1.42); }
  .stage .paint { position: absolute; inset: 0; }
  .lintel-cuts { position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; overflow: visible; transform-origin: 0 0; backface-visibility: hidden; }
  .lintel-cuts :global(svg) { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; display: block; }
  .lintel-cuts :global(.cutm) { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; transition: stroke-dashoffset .9s var(--ease-in-out), opacity .1s; }
  .c1 .lintel-cuts :global(.cutm.c1), .c2 .lintel-cuts :global(.cutm.c2) { stroke-dashoffset: 0; opacity: 1; }
  .lintel-cuts :global(.cutm.lit) { filter: drop-shadow(0 0 8px rgba(var(--violet-rgb), 1)) drop-shadow(0 0 26px rgba(var(--violet-rgb), .8)); transition: stroke-dashoffset .9s var(--ease-in-out), opacity .1s, stroke 2s var(--ease) .6s; }
  .answer .lintel-cuts :global(.cutm.lit) { stroke: #ffe3a8; }
  .lintel-cuts :global(.lockflash) { opacity: 0; }
  .lock .lintel-cuts :global(.lockflash) { animation: flash 1.4s ease-out forwards; }
  @keyframes flash { 0% { opacity: 0; } 15% { opacity: .9; } 100% { opacity: 0; } }

  /* the full-screen moment: the interface steps aside; the painting has the whole phone */
  .scrim-top, .scrim-bottom { transition: opacity .5s var(--ease); }
  .scrim-top { height: 230px; }
  .scrim-bottom { height: 52%; }
  .fade-out { transition: filter .45s var(--ease); }
  .cine .fade-out { filter: opacity(0); pointer-events: none; }
  .cine .scrim-top { opacity: 0; }
  .cine .scrim-bottom { opacity: .35; }
  .settled .fade-out { filter: none; pointer-events: auto; transition-duration: .9s; }
  .settled .scrim-top, .settled .scrim-bottom { opacity: 1; transition-duration: .9s; }
  /* the place's line is long: the top wash deepens under it so the lit lintel never shows through the words */
  .scrim-top { transition: opacity .5s var(--ease), height .9s var(--ease); }
  .settled .scrim-top { height: 58%; }

  /* the heading: one before, one after (the same place name, carved) */
  .head { position: relative; margin-top: 8px; display: grid; }
  .head > div { grid-area: 1 / 1; transition: opacity .8s var(--ease), transform .8s var(--ease); }
  .head .after { opacity: 0; transform: translateY(8px); pointer-events: none; }
  .settled .head .before { opacity: 0; }
  .settled .head .after { opacity: 1; transform: none; pointer-events: auto; }
  .head .label-line { margin-bottom: 10px; }
  .head .soft { display: block; margin-top: 8px; max-width: 34ch; }
  .said { animation: rise .8s var(--ease) both; font-size: calc(17.5px * var(--ts, 1)); line-height: 1.4; color: var(--ink); }

  /* the word, in its box, floating over the scene; at the reveal its fill and edge fade so the whole phone is the hall */
  .wordbox { text-align: center; padding: 12px 16px 10px; background: linear-gradient(180deg, rgba(20, 18, 52, .5), rgba(8, 7, 24, .62));
    transition: transform 1.2s var(--ease), background .8s var(--ease), border-color .8s var(--ease), box-shadow .8s var(--ease); }
  .wordbox::before { transition: opacity .8s var(--ease); }
  .cine .wordbox { background: transparent; transform: translateY(-7.5vh); border-color: transparent; box-shadow: none; }
  .cine .wordbox::before { opacity: 0; }
  .settled .wordbox { background: linear-gradient(180deg, rgba(20, 18, 52, .5), rgba(8, 7, 24, .62)); transform: none; border-color: var(--edge-3); }
  .settled .wordbox::before { opacity: 1; }
  .rodbtn { display: block; width: min(280px, 100%); margin: 0 auto; padding: 0; border-radius: 46px; }
  .rodbtn:disabled { cursor: default; }
  .rodsvg { display: block; width: 100%; height: auto; overflow: visible; }
  .rodbody { fill: rgba(10, 9, 30, .55); stroke: rgba(206, 204, 255, .45); stroke-width: 1; transition: stroke .6s var(--ease), fill .6s var(--ease); }
  .rodbtn.ready .rodbody { stroke: rgba(236, 234, 255, .95); animation: rodglow 2.4s ease-in-out infinite; }
  .rod .rodbody { fill: rgba(40, 36, 96, .55); }
  @keyframes rodglow { 0%,100% { filter: drop-shadow(0 0 3px rgba(var(--violet-rgb), .6)); } 50% { filter: drop-shadow(0 0 10px rgba(var(--violet-rgb), 1)); } }
  .ghostm { stroke: rgba(206, 204, 255, .16); stroke-dasharray: 2 3; }
  .rm { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; transition: stroke-dashoffset .9s var(--ease-in-out), opacity .1s; filter: drop-shadow(0 0 3px rgba(var(--violet-rgb), 1)) drop-shadow(0 0 10px rgba(var(--violet-rgb), .7)); }
  .c1 .rm.c1, .c2 .rm.c2 { stroke-dashoffset: 0; opacity: 1; }
  .lockring { opacity: 0; transform: scale(1.08); transform-box: fill-box; transform-origin: center; transition: opacity .6s var(--ease), transform .6s var(--ease);
    filter: drop-shadow(0 0 4px rgba(var(--violet-rgb), 1)) drop-shadow(0 0 14px rgba(var(--violet-rgb), .6)); }
  .lock .lockring { opacity: 1; transform: none; }
  .readings { display: grid; grid-template-columns: 1fr 1fr; width: min(280px, 100%); margin: 2px auto 0; padding: 0 17.33%; text-align: center; min-height: 26px; }
  .readings span { font-family: var(--life); font-size: calc(18px * var(--ts, 1)); color: var(--ink); opacity: 0; transition: opacity .6s var(--ease) .5s; }
  .readings span.q { color: var(--cold-hi); opacity: 1; transition: none; }
  .c1 .readings .r1, .c2 .readings .r2 { opacity: 1; }
  .hint { margin-top: 4px; min-height: 24px; font-family: var(--life); font-style: italic; font-size: calc(16.5px * var(--ts, 1)); color: var(--ink-2); text-align: center; }
  .settled .hint { display: none; }

  /* the keys and the way on share one slot */
  .slot { display: grid; margin-top: 12px; }
  .slot > * { grid-area: 1 / 1; }
  .keys { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap); }
  .key { position: relative; min-height: var(--btn-h); display: flex; align-items: center; justify-content: center; gap: 12px;
    font-family: var(--life); font-style: italic; font-size: calc(19px * var(--ts, 1)); color: var(--ink-2);
    border: 1px solid var(--edge-3); border-radius: 2px; background: linear-gradient(180deg, rgba(26,24,64,.5), rgba(10,9,28,.66));
    transition: color .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease), opacity .3s var(--ease); }
  .key.ready { color: #fff; border-color: rgba(236,234,255,.9); background: linear-gradient(180deg, rgba(var(--violet-rgb), .34), rgba(var(--violet-rgb), .12));
    box-shadow: inset 0 0 18px rgba(var(--violet-rgb), .3), 0 0 26px rgba(var(--violet-rgb), .45); animation: keyglow 2.4s ease-in-out infinite; }
  @keyframes keyglow { 0%,100% { box-shadow: inset 0 0 18px rgba(var(--violet-rgb), .26), 0 0 20px rgba(var(--violet-rgb), .36); } 50% { box-shadow: inset 0 0 22px rgba(var(--violet-rgb), .36), 0 0 34px rgba(var(--violet-rgb), .6); } }
  .key.done { opacity: .5; }
  .key:disabled:not(.done):not(.ready) { opacity: .7; }
  .key .q { color: var(--cold-hi); font-style: normal; }
  .cine .keys { opacity: 0; pointer-events: none; transition: opacity .4s var(--ease); }
  .settled .keys { visibility: hidden; }
  .go { opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity .9s var(--ease) .5s, transform .9s var(--ease) .5s; }
  .settled .go { opacity: 1; transform: none; pointer-events: auto; }
  .after-row { display: flex; justify-content: center; margin-top: 6px; }
  .settle-list { margin-bottom: 6px; }
  .ask { margin-bottom: 4px; }
  .enough { font-family: var(--life); font-size: min(27px, 7vw); line-height: 1.15; color: #fff; text-align: center; margin: 2px 0 12px;
    text-shadow: 0 0 26px rgba(242,193,112,.45), 0 2px 18px rgba(8,6,20,.9); animation: rise 1.6s .8s var(--ease) both; }
  button.home { color: var(--ink-2); }
  /* cups: the group stays fully opaque; its glow and flame fade in themselves */
  .stage :global(.hall-cup) { opacity: 1; transition: none; }
  .stage :global(.hall-cup > *) { opacity: 0; transition: opacity 1.2s var(--ease); }
  .stage :global(.hall.cups-waking .hall-cup > *), .stage :global(.hall.cups-lit .hall-cup > *) { opacity: var(--a, 1); }
  .stage :global(.hall.cups-waking .hall-cup > *) { transition-delay: calc(var(--i) * .09s); }
  @media (max-height: 800px) { .head .soft { font-size: calc(15.5px * var(--ts, 1)); } .wordbox { padding-top: 8px; padding-bottom: 6px; } .slot { margin-top: 10px; } .rodbtn { width: min(240px, 100%); } }
</style>
