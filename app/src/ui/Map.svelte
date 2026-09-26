<script lang="ts">
  /* The map (FIRST_PLAYABLE → the world; mock-up map.html; INTERACTION_NOTES → The map): lights on the region's own night
     sky, joined by routes that draw themselves in and settle to dust. One map, one level (D-092: the closer view was two
     maps to Dan): the region, opening on where Dan is. Tap a light: the crosshair closes on it and what is known of it
     rises in the box (a stretch's places reached, a sealed thing in view, the forecast). Only what has been reached is
     named; the way ahead is a faint light, unnamed. Never a count of what's left (UX 6). */
  import { game, content } from './game.svelte';
  import { t, dayName } from '../content/copy/en';
  import { nextPlace } from '../core/story';
  import skyUrl from './scene/map-sky.svg?url';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import type { StretchId } from '../core/story-types';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const s = content.story;
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  type Anchor = 'start' | 'middle' | 'end';
  /** A light on the sky: where it sits, how it is lit, its words and where they sit. */
  interface Light {
    key: string; x: number; y: number;
    kind: 'here' | 'lit' | 'faint' | 'sealed' | 'waypoint';
    name?: string; sub?: string; subKind?: 'warm' | 'dim' | 'gold';
    lx: number; ly: number; anchor: Anchor;
    box: { label: string; title: string; say: string };
  }

  /* ---------- the region: one light per stretch, laid out as the mock-up lays out the first region ---------- */
  const AT: Record<StretchId, { x: number; y: number; lx: number; ly: number; anchor: Anchor }> = {
    'st-mouth':   { x: 150, y: 44,  lx: 186, ly: 40,  anchor: 'start' },
    'st-camp':    { x: 322, y: 134, lx: 372, ly: 98,  anchor: 'end' },
    'st-hall':    { x: 196, y: 204, lx: 160, ly: 200, anchor: 'end' },
    'st-salt':    { x: 62,  y: 268, lx: 24,  ly: 312, anchor: 'start' },
    'st-stair':   { x: 318, y: 326, lx: 344, ly: 372, anchor: 'end' },
    'st-flight2': { x: 262, y: 434, lx: 226, ly: 430, anchor: 'end' },
    'st-square':  { x: 132, y: 488, lx: 168, ly: 484, anchor: 'start' },
    /* story weeks 8–14: below the first region; the map grows (and is dragged) only once they are walked or ahead */
    'st-water':   { x: 238, y: 586, lx: 274, ly: 582, anchor: 'start' },
    'st-side':    { x: 58,  y: 626, lx: 24,  ly: 666, anchor: 'start' },
    'st-reading': { x: 330, y: 668, lx: 372, ly: 638, anchor: 'end' },
    'st-blast':   { x: 164, y: 716, lx: 200, ly: 712, anchor: 'start' },
    'st-lower':   { x: 238, y: 826, lx: 202, ly: 822, anchor: 'end' },
  };
  const LINKS: [StretchId, StretchId][] = [['st-mouth', 'st-hall'], ['st-hall', 'st-camp'], ['st-hall', 'st-salt'], ['st-hall', 'st-stair'], ['st-stair', 'st-flight2'], ['st-flight2', 'st-square'],
    ['st-flight2', 'st-water'], ['st-water', 'st-reading'], ['st-water', 'st-blast'], ['st-blast', 'st-side'], ['st-blast', 'st-lower']];

  const placed = $derived(s.beats.filter(b => (b.kind === 'arrival' || b.kind === 'arrivalKey' || b.kind === 'word') && v.story.played.has(b.id)));
  const walkedOn = $derived(new Set<StretchId>([s.stretches[0].id, v.here.stretch, ...placed.map(b => b.stretch)]));   /* the way in is always walked */
  /* the stretch the next place is on: a faint light, unnamed */
  const aheadOn = $derived(nextPlace(s, v.story)?.stretch ?? null);
  const stretchName = (id: StretchId) => s.stretches.find(x => x.id === id)!.name;
  const sealedOn = (id: StretchId) => s.seals.filter(x => !x.seenOnly && !v.story.opened.has(x.id) && x.stretch === id
    && s.beats.some(b => v.story.played.has(b.id) && b.carries?.inView?.includes(x.id)));
  /* the plan's forecast (PLANNER → the forecast): where the next places would be reached; gone the moment the plan changes */
  const ahead = $derived(v.forecast.slice(0, 2));
  const fcSay = (day: string) => t('map.forecastSay', { day: dayName(day) });
  const firstSentence = (line: string) => (line.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? line);
  /* "Ahead: The Survey Cut, the tin box…" under "The Survey Cut" says the name twice: the ahead line drops it */
  const unsaid = (where: string, name: string) => where.toLowerCase().startsWith(name.toLowerCase() + ', ') ? where.slice(name.length + 2) : where;
  const hereBox = $derived({ label: t('map.hereLabel'), title: v.here.name, say: v.ahead ? `${t('today.ahead')}: ${firstSentence(unsaid(v.ahead, v.here.name))}` : firstSentence(v.here.line) });

  const region = $derived.by((): Light[] => {
    const out: Light[] = [];
    for (const k of Object.keys(AT) as StretchId[]) {
      const a = AT[k], here = k === v.here.stretch;
      if (walkedOn.has(k)) {
        const names = placed.filter(b => b.stretch === k).map(b => b.name!);
        const fc = here && aheadOn === k && ahead.length ? t('map.forecast', { day: dayName(ahead[0]) }) : undefined;
        out.push({ key: k, ...a, kind: here ? 'here' : 'lit', name: stretchName(k),
          sub: here ? t('map.here') : sealedOn(k).length ? t('map.sealed') : undefined, subKind: here ? 'warm' : 'dim',
          box: here ? hereBox
            : { label: sealedOn(k).length ? t('map.walkedSealed') : t('map.walked'), title: stretchName(k), say: names.length ? names.join(' · ') : t('map.wayIn') } });
        if (fc) out[out.length - 1].sub += ` · ${fc}`;
      } else if (k === aheadOn) {
        out.push({ key: k, ...a, kind: 'faint',
          sub: ahead.length ? t('map.forecast', { day: dayName(ahead[0]) }) : t('map.ahead'), subKind: ahead.length ? 'gold' : 'dim',
          box: { label: t('map.aheadLabel'), title: t('map.aheadName'), say: ahead.length ? fcSay(ahead[0]) : t('map.aheadSay') } });
      }
    }
    return out;
  });
  /* the region's size comes from the lights shown, never less than the first region: a bigger region is dragged around */
  const RW = $derived(Math.max(390, ...region.map(a => a.x + 60))), RH = $derived(Math.max(548, ...region.map(a => a.y + 60)));
  const regionLinks = $derived(LINKS.filter(([a, b]) => walkedOn.has(a) && (walkedOn.has(b) || b === aheadOn))
    .map(([a, b]) => ({ d: curve(AT[a], AT[b]), walked: walkedOn.has(b) })));

  function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    return `M${a.x} ${a.y}Q${(mx - dy * 0.18).toFixed(1)} ${(my + dx * 0.18).toFixed(1)} ${b.x} ${b.y}`;
  }
  /** Carved names break onto a second line past about 16 letters (SVG text does not wrap). */
  function lines(name: string, max = 16): string[] {
    const out: string[] = [];
    for (const w of name.toUpperCase().split(' ')) {
      const last = out[out.length - 1];
      if (last !== undefined && (last + ' ' + w).length <= max) out[out.length - 1] = last + ' ' + w; else out.push(w);
    }
    return out;
  }

  const lights = $derived(region);
  const links = $derived(regionLinks);
  /* what the crosshair is on; it opens on where Dan is */
  let picked = $state<string | null>(null);
  const sel = $derived(lights.find(l => l.key === picked) ?? lights.find(l => l.kind === 'here') ?? lights[0]);
  let turn = $state(0);   /* restarts the box's rise on each pick */
  /* Picking moves only the crosshair and the box's words: the box never changes size, so the sky and its lights never
     move (D-076). */
  const pick = (l: Light) => { if (dragged) return; picked = l.key; turn++; };

  /* One map that can be bigger than the screen (Dan): drawn at the scale that fills the screen's width, it is dragged
     around (a finger scrolls it; a mouse drags it on the web link), and opens centred on where Dan is. Picking a light
     never moves it (D-076). */
  let field = $state<HTMLDivElement>();
  let fw = $state(390);
  const k = $derived(Math.min(fw, 480) / 390);
  $effect(() => {
    if (!field) return;
    const ro = new ResizeObserver(() => { fw = field!.clientWidth; });
    ro.observe(field);
    return () => ro.disconnect();
  });
  let centred = false;
  $effect(() => {
    const h = region.find(l => l.kind === 'here'), f = field, scale = k;
    if (!f || !h || centred) return;
    requestAnimationFrame(() => { f.scrollLeft = h.x * scale - f.clientWidth / 2; f.scrollTop = h.y * scale - f.clientHeight / 2; centred = true; });
  });
  let drag: { x: number; y: number; l: number; t: number } | null = null, dragged = false;
  const down = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !field) return;
    drag = { x: e.clientX, y: e.clientY, l: field.scrollLeft, t: field.scrollTop }; dragged = false;
  };
  const move = (e: PointerEvent) => {
    if (!drag || !field) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) dragged = true;
    if (dragged) { field.scrollLeft = drag.l - dx; field.scrollTop = drag.t - dy; }
  };
  const up = () => { drag = null; setTimeout(() => { dragged = false; }, 0); };
</script>

<div class="sky" aria-hidden="true"><img src={skyUrl} alt="" /></div>
<div class="fog" aria-hidden="true"><i class="drift-a"></i><i class="drift-b"></i></div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="scrim-top" aria-hidden="true" style="height:200px"></div>
<div class="scrim-bottom" aria-hidden="true" style="height:30%"></div>

<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button><span></span><span></span>
    </div>
    <div class="head rise d1">
      <div class="label-line short">{t('map.regionLabel')}</div>
      <h1 class="carve lg">{t('map.regionName')}</h1>
    </div>
  </header>

  <div class="field" data-pan="map" bind:this={field} onpointerdown={down} onpointermove={move} onpointerup={up} onpointerleave={up} role="presentation">
    <svg viewBox="0 0 {RW} {RH}" width={RW * k} height={RH * k} role="group" aria-label={t('map.label')}>
      <defs>
        <radialGradient id="litPool"><stop offset="0" stop-color="#f4f2ff" stop-opacity="1"/><stop offset=".1" stop-color="#cdc6ff" stop-opacity=".75"/><stop offset=".32" stop-color="#8a7cf0" stop-opacity=".38"/><stop offset=".65" stop-color="#4a3fb0" stop-opacity=".14"/><stop offset="1" stop-color="#1c1846" stop-opacity="0"/></radialGradient>
        <radialGradient id="seenPool"><stop offset="0" stop-color="#dfe2ff" stop-opacity=".85"/><stop offset=".12" stop-color="#9aa3f4" stop-opacity=".45"/><stop offset=".45" stop-color="#4a50b0" stop-opacity=".16"/><stop offset="1" stop-color="#141638" stop-opacity="0"/></radialGradient>
        <radialGradient id="warmPool"><stop offset="0" stop-color="#ffe0a8" stop-opacity=".95"/><stop offset=".12" stop-color="#f4a95a" stop-opacity=".5"/><stop offset=".45" stop-color="#8a4a8a" stop-opacity=".16"/><stop offset="1" stop-color="#2a1a40" stop-opacity="0"/></radialGradient>
        <filter id="b1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1"/></filter>
        <filter id="b4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4.5"/></filter>
        <filter id="b16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>
        <filter id="halo" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/><feFlood flood-color="#05040f" flood-opacity=".95"/><feComposite in2="b" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <!-- the pools of light, under everything -->
      <g class="pools">
        {#each lights as l, i (l.key)}
          <g transform="translate({l.x} {l.y})" class="pl" style="animation-delay:{0.1 + i * 0.12}s">
            {#if l.kind === 'here'}
              <circle r="60" fill="#8b7cff" opacity=".16" filter="url(#b16)" />
              <g class="breathe"><circle r="62" fill="url(#litPool)" /><circle r="34" fill="url(#warmPool)" opacity=".9" /></g>
              <circle r="12" fill="#ffd9a0" opacity=".5" filter="url(#b4)" /><circle r="4" fill="#fff4de" filter="url(#b1)" />
            {:else if l.kind === 'lit'}
              <circle r="60" fill="url(#litPool)" opacity=".8" /><circle r="9" fill="#d2ccff" opacity=".55" filter="url(#b4)" /><circle r="3" fill="#fbfaff" filter="url(#b1)" />
            {:else if l.kind === 'faint'}
              <circle r="24" fill="url(#seenPool)" opacity=".42" /><circle r="4" fill="#aeb6f0" opacity=".3" filter="url(#b1)" /><circle r="1.8" fill="#dfe3ff" opacity=".85" />
            {:else if l.kind === 'sealed'}
              <circle r="26" fill="url(#seenPool)" opacity=".4" />
              <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="none" stroke="#dcd8ff" stroke-width="1.2" filter="url(#b1)" />
              <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="none" stroke="#efedff" stroke-width="1" />
            {:else}
              <circle r="22" fill="url(#warmPool)" opacity=".35" /><circle r="4" fill="none" stroke="#f2c170" stroke-opacity=".85" stroke-width="1.2" stroke-dasharray="2 2.4" />
            {/if}
          </g>
        {/each}
      </g>

      <!-- routes: walked ones draw themselves in, then settle to dust; the way ahead is a faint dashed line -->
      <g fill="none">
        {#each links as k, i}
          {#if k.walked}
            <path d={k.d} class="drawn" pathLength="100" stroke="#d6d2ff" stroke-width="1.1" stroke-opacity=".72" filter="url(#lineGlow)" style="animation-delay:{0.35 + i * 0.18}s,{2.2 + i * 0.18}s" />
            <path d={k.d} class="dust" stroke="#dcd8ff" stroke-width="1.7" stroke-linecap="round" stroke-dasharray=".1 6" stroke-opacity=".38" style="animation-delay:{1.8 + i * 0.18}s" />
            {#if !calm}
              <circle r="1.6" fill="#fff6e4" class="spark" style="animation-delay:{3 + i * 1.3}s"><animateMotion dur="5.5s" begin="{3 + i * 1.3}s" repeatCount="indefinite" path={k.d} /></circle>
            {/if}
          {:else}
            <path d={k.d} class="fadein" stroke="#d6d2ff" stroke-width="1.1" stroke-opacity=".22" stroke-dasharray="2 5" style="animation-delay:2s" />
          {/if}
        {/each}
      </g>

      <!-- the words, carved on the sky -->
      <g class="labels">
        {#each lights as l (l.key)}
          {@const ls = l.name ? lines(l.name) : []}
          {#each ls as line, j}
            <text x={l.lx} y={l.ly + j * 20} text-anchor={l.anchor} class="nn" class:here={l.kind === 'here'}>{line}</text>
          {/each}
          {#if l.sub}
            <text x={l.lx} y={l.ly + ls.length * 20 + (ls.length ? 0 : 4)} text-anchor={l.anchor} class="ns {l.subKind ?? ''}">{l.sub}</text>
          {/if}
        {/each}
      </g>

      <!-- the crosshair closes on the light picked -->
      {#if sel}
        <g class="reticle" style="transform:translate({sel.x}px,{sel.y}px)">
          <g class="spin"><circle r="25" fill="none" stroke="#dcd8ff" stroke-opacity=".55" stroke-width="1" stroke-dasharray="14 8" /></g>
          <path d="M-29 -29 h8 M-29 -29 v8 M29 -29 h-8 M29 -29 v8 M-29 29 h8 M-29 29 v-8 M29 29 h-8 M29 29 v-8" fill="none" stroke="#efedff" stroke-opacity=".95" stroke-width="1.2" />
          <path d="M0 -34 v5 M0 34 v-5 M-34 0 h5 M34 0 h-5" stroke="#efedff" stroke-opacity=".6" stroke-width="1" />
        </g>
      {/if}

      <!-- a generous tap target on every light -->
      {#each lights as l (l.key)}
        <circle class="node" data-kind={l.kind} cx={l.x} cy={l.y} r="32" fill="transparent" role="button" tabindex="0" aria-label={l.name ?? l.box.title}
          onmousedown={e => e.preventDefault()} onclick={() => pick(l)} onkeydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(l); } }} />
      {/each}
    </svg>
  </div>

  <section class="bottom col rise d3">
    {#if sel}
      <div class="box ticks" aria-live="polite">
        {#key turn}
          <div class="swap">
            <div class="label-line">{sel.box.label}</div>
            <h2 class="carve md">{sel.box.title}</h2>
            <p class="say">{sel.box.say}</p>
          </div>
        {/key}
      </div>
    {/if}
  </section>
</div>

<style>
  .sky { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: #07071a; }
  .sky img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; animation: fadein 1.2s var(--ease) both; }
  .top { position: relative; z-index: 3; flex: none; }
  .head { margin-top: 6px; }
  .head h1 { margin-top: 8px; }
  button.home { color: var(--ink-2); }

  .field { position: relative; flex: 1; min-height: 0; margin: 4px 0 8px; overflow: auto; scrollbar-width: none; overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y; cursor: grab; }
  .field::-webkit-scrollbar { display: none; }
  .field svg { display: block; margin: 0 auto; overflow: visible; }

  .pools { mix-blend-mode: screen; }
  .pl { animation: fadein 1.4s var(--ease) both; }
  .breathe { animation: breathe 7s ease-in-out infinite; }
  .drawn { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 1.6s var(--ease-in-out) both, settle 1.4s ease forwards; }
  @keyframes settle { to { opacity: 0; } }
  .dust { opacity: 0; animation: fadein 1.4s ease forwards; }
  .fadein { animation: fadein 1.2s var(--ease) both; }
  .spark { opacity: 0; animation: spark 5.5s ease-in-out infinite; }
  @keyframes spark { 0% { opacity: 0; } 15%, 80% { opacity: .9; } 100% { opacity: 0; } }

  .labels { animation: fadein 1.2s var(--ease) .9s both; pointer-events: none; }
  .nn { font-family: var(--carve); font-size: 15px; font-weight: 600; letter-spacing: .08em; fill: #e9e7ff; filter: url(#halo); }
  .nn.here { fill: #fff; }
  .ns { font-family: var(--life); font-style: italic; font-size: 16px; fill: #c3c3e8; filter: url(#halo); }
  .ns.warm { fill: #f1c98e; }
  .ns.gold { fill: var(--gold); }
  .ns.dim { fill: #9d9dcc; }

  .reticle { transition: transform .55s var(--ease); animation: fadein .8s var(--ease) 1.2s both; pointer-events: none; }
  .spin { animation: spin 50s linear infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .node { cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
  .node:focus-visible { stroke: var(--edge); stroke-width: 1; }

  /* one fixed size: two lines of name, three of words. 180px holds them all: border 2 + padding 30 + label 20 + name
     margins 14 + two names 41 + three lines 70 = 177 (at 162 the third line was cut in half when the name took two) */
  .box { border: 1px solid var(--edge-2); padding: 14px 18px 16px; background: rgba(10,9,24,.6); height: 180px; display: flex; flex-direction: column; overflow: hidden; }
  .box .swap { flex: 1; min-height: 0; overflow: hidden; }
  .box h2 { margin: 8px 0 6px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .box .say { color: var(--ink-2); font-size: 16.5px; line-height: 1.42; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .swap { animation: rise .45s var(--ease) both; }
  @media (prefers-reduced-motion: reduce) { .drawn, .dust, .pl, .labels, .reticle, .swap { animation: none; opacity: 1; } .drawn { opacity: 0; } .reticle { transition: none; } }
</style>
