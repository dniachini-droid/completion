<script lang="ts">
  /* The map (FIRST_PLAYABLE → the world; mock-up map.html; INTERACTION_NOTES → The map): lights on the region's own night
     sky, joined by routes that draw themselves in and settle to dust. Opens on the region, on where Dan is. Tap a light:
     the crosshair closes on it and what is known of it rises in the box. "Look closer" zooms into a stretch (the Close
     level: its named places, sealed things in view, the forecast's waypoints); "See the whole region" zooms back out.
     Only what has been reached is named; the way ahead is a faint light, unnamed. Never a count of what's left (UX 6). */
  import { game, content } from './game.svelte';
  import { t, dayName } from '../content/copy/en';
  import { nextPlace } from '../core/story';
  import skyUrl from './scene/map-sky.svg?url';
  import type { Go } from './nav';
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
    box: { label: string; title: string; say: string; closer?: StretchId };
  }

  /* ---------- the region: one light per stretch, laid out as the mock-up lays out the first region ---------- */
  const RW = 390, RH = 520;
  const AT: Record<StretchId, { x: number; y: number; lx: number; ly: number; anchor: Anchor }> = {
    'st-mouth':   { x: 150, y: 44,  lx: 186, ly: 40,  anchor: 'start' },
    'st-camp':    { x: 322, y: 134, lx: 372, ly: 98,  anchor: 'end' },
    'st-hall':    { x: 196, y: 204, lx: 160, ly: 200, anchor: 'end' },
    'st-salt':    { x: 62,  y: 268, lx: 24,  ly: 312, anchor: 'start' },
    'st-stair':   { x: 318, y: 326, lx: 344, ly: 372, anchor: 'end' },
    'st-flight2': { x: 262, y: 434, lx: 226, ly: 430, anchor: 'end' },
    'st-square':  { x: 132, y: 488, lx: 168, ly: 484, anchor: 'start' },
  };
  const LINKS: [StretchId, StretchId][] = [['st-mouth', 'st-hall'], ['st-hall', 'st-camp'], ['st-hall', 'st-salt'], ['st-hall', 'st-stair'], ['st-stair', 'st-flight2'], ['st-flight2', 'st-square']];

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
  const hereBox = $derived({ label: t('map.hereLabel'), title: v.here.name, say: v.ahead ? `${t('today.ahead')}: ${v.ahead}` : firstSentence(v.here.line) });

  const region = $derived.by((): Light[] => {
    const out: Light[] = [];
    for (const k of Object.keys(AT) as StretchId[]) {
      const a = AT[k], here = k === v.here.stretch;
      if (walkedOn.has(k)) {
        const names = placed.filter(b => b.stretch === k).map(b => b.name!);
        const fc = here && aheadOn === k && ahead.length ? t('map.forecast', { day: dayName(ahead[0]) }) : undefined;
        out.push({ key: k, ...a, kind: here ? 'here' : 'lit', name: stretchName(k),
          sub: here ? t('map.here') : sealedOn(k).length ? t('map.sealed') : undefined, subKind: here ? 'warm' : 'dim',
          box: here ? { ...hereBox, closer: k }
            : { label: t('map.walked'), title: stretchName(k), say: names.length ? names.join(' · ') : t('map.wayIn'), closer: names.length ? k : undefined } });
        if (fc) out[out.length - 1].sub += ` · ${fc}`;
      } else if (k === aheadOn) {
        out.push({ key: k, ...a, kind: 'faint',
          sub: ahead.length ? t('map.forecast', { day: dayName(ahead[0]) }) : t('map.ahead'), subKind: ahead.length ? 'gold' : 'dim',
          box: { label: t('map.aheadLabel'), title: t('map.aheadName'), say: ahead.length ? fcSay(ahead[0]) : t('map.aheadSay') } });
      }
    }
    return out;
  });
  const regionLinks = $derived(LINKS.filter(([a, b]) => walkedOn.has(a) && (walkedOn.has(b) || b === aheadOn))
    .map(([a, b]) => ({ d: curve(AT[a], AT[b]), walked: walkedOn.has(b) })));

  /* ---------- close: one stretch, its places in the order Dan reached them, down a winding line ---------- */
  let level = $state<'region' | 'close'>('region');
  let zoomed = $state<StretchId | null>(null);
  const cx = (i: number) => (i % 2 ? 272 : 118) + ((i * 37) % 30) - 15;
  const cy = (i: number) => 44 + i * 86;
  const close = $derived.by((): Light[] => {
    const k = zoomed ?? v.here.stretch, out: Light[] = [];
    const at = (i: number) => { const x = cx(i), right = x > 195; return { x, y: cy(i), lx: right ? x - 38 : x + 38, ly: cy(i) - 4, anchor: (right ? 'end' : 'start') as Anchor }; };
    const here = placed.filter(b => b.stretch === k);
    if (k === v.here.stretch && v.here.id === null) out.push({ key: 'here', ...at(0), kind: 'here', name: v.here.name, sub: t('map.here'), subKind: 'warm', box: hereBox });
    for (const b of here) {
      const isHere = b.id === v.here.id;
      out.push({ key: b.id, ...at(out.length), kind: isHere ? 'here' : 'lit', name: b.name, sub: isHere ? t('map.here') : undefined, subKind: 'warm',
        box: isHere ? hereBox : { label: t('map.reached'), title: b.name!, say: firstSentence(b.line ?? '') } });
    }
    for (const x of sealedOn(k))
      out.push({ key: x.id, ...at(out.length), kind: 'sealed', sub: t('map.sealed'), subKind: 'dim',
        box: { label: t('map.sealedLabel'), title: x.where.replace(/^./, c => c.toUpperCase()), say: t('map.sealedSay') } });
    if (k === v.here.stretch) for (const day of ahead)
      out.push({ key: 'fc-' + day + out.length, ...at(out.length), kind: 'waypoint', sub: t('map.forecast', { day: dayName(day) }), subKind: 'gold',
        box: { label: t('map.forecastLabel'), title: dayName(day), say: fcSay(day) } });
    return out;
  });
  const closeLinks = $derived(close.slice(1).map((b, i) => ({ d: curve(close[i], b), walked: b.kind === 'lit' || b.kind === 'here' })));
  const CH = $derived(Math.max(RH, cy(Math.max(0, close.length - 1)) + 70));

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

  const lights = $derived(level === 'region' ? region : close);
  const links = $derived(level === 'region' ? regionLinks : closeLinks);
  const H = $derived(level === 'region' ? RH : CH);
  /* what the crosshair is on; it opens on where Dan is */
  let picked = $state<string | null>(null);
  const sel = $derived(lights.find(l => l.key === picked) ?? lights.find(l => l.kind === 'here') ?? lights[0]);
  let turn = $state(0);   /* restarts the box's rise on each pick */
  let field: HTMLDivElement;
  /* Picking moves only the crosshair and the box's words: the box never changes size, so the sky and its lights never
     move (D-076). In a close view longer than the screen, the field alone scrolls to bring the light into view. */
  const pick = (l: Light, e?: Event) => {
    picked = l.key; turn++;
    const n = e?.currentTarget as Element | undefined;
    if (!n || !field || field.scrollHeight <= field.clientHeight) return;
    const r = n.getBoundingClientRect(), f = field.getBoundingClientRect();
    const dy = r.top < f.top ? r.top - f.top - 12 : r.bottom > f.bottom ? r.bottom - f.bottom + 12 : 0;
    if (dy) field.scrollBy({ top: dy, behavior: calm ? 'auto' : 'smooth' });
  };
  const zoomIn = (k: StretchId) => { zoomed = k; level = 'close'; picked = null; turn++; };
  const zoomOut = () => { level = 'region'; picked = zoomed; turn++; };
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
      <button class="home" onclick={() => go('today')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('delve.today')}</span></button><span></span><span></span>
    </div>
    <div class="head rise d1">
      {#if level === 'region'}
        <div class="label-line short">{t('map.regionLabel')}</div>
        <h1 class="carve lg">{t('map.regionName')}</h1>
      {:else}
        <button class="label-line short up" onclick={zoomOut}>{t('map.regionName')}</button>
        <h1 class="carve lg">{stretchName(zoomed ?? v.here.stretch)}</h1>
      {/if}
    </div>
  </header>

  <div class="field" class:fit={level === 'region'} bind:this={field}>
   {#key level + (zoomed ?? '')}
    <svg viewBox="0 0 {RW} {H}" preserveAspectRatio="xMidYMid meet" style={level === 'region' ? '' : `aspect-ratio:${RW}/${H}`} role="group" aria-label={t('map.label')}>
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
          onmousedown={e => e.preventDefault()} onclick={e => pick(l, e)} onkeydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(l, e); } }} />
      {/each}
    </svg>
   {/key}
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
        <!-- the action's row is always kept, so the box is the same size whatever is picked -->
        <div class="foot">
          {#if level === 'close'}
            <button class="more back" onclick={zoomOut}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>{t('map.whole')}</button>
          {:else if sel.box.closer}
            <button class="more" onclick={() => sel.box.closer && zoomIn(sel.box.closer)}>{t('map.closer')}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg></button>
          {/if}
        </div>
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
  button.up { background: none; border: 0; padding: 0; cursor: pointer; width: 100%; }
  button.up::before { content: "‹"; font-size: 18px; line-height: 0; margin-right: -4px; color: var(--edge); }
  button.home { color: var(--ink-2); }

  .field { position: relative; flex: 1; min-height: 0; overflow-y: auto; margin: 4px 0 8px; -webkit-overflow-scrolling: touch; }
  .field svg { display: block; width: 100%; max-width: 480px; margin: 0 auto; overflow: visible; }
  .field.fit svg { height: 100%; }

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

  /* one fixed size: two lines of name, three of words, the action's row always kept */
  .box { border: 1px solid var(--edge-2); padding: 14px 18px 16px; background: rgba(10,9,24,.6); height: 214px; display: flex; flex-direction: column; overflow: hidden; }
  .box .swap { flex: 1; min-height: 0; overflow: hidden; }
  .box h2 { margin: 8px 0 6px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .box .say { color: var(--ink-2); font-size: 16.5px; line-height: 1.42; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .foot { flex: none; height: 34px; display: flex; justify-content: flex-end; align-items: flex-end; }
  .more { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin: -10px -6px -10px 0; padding: 0 6px; background: none; border: 0; cursor: pointer;
    font-family: var(--carve); font-size: 14px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--ink); }
  .more.back { margin-right: auto; margin-left: -6px; color: var(--ink-2); }
  .more svg { width: 14px; height: 14px; fill: none; stroke: var(--edge); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; flex: none; }
  .more:hover, .more:focus-visible { color: var(--gold-hi); }
  .swap { animation: rise .45s var(--ease) both; }
  @media (prefers-reduced-motion: reduce) { .drawn, .dust, .pl, .labels, .reticle, .swap { animation: none; opacity: 1; } .drawn { opacity: 0; } .reticle { transition: none; } }
</style>
