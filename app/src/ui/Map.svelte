<script lang="ts">
  import Prose from './Prose.svelte';
  /* The map (FIRST_PLAYABLE → the world; mock-up map.html; INTERACTION_NOTES → The map): lights on the region's own night
     sky, joined by routes that draw themselves in and settle to dust. One map, one level (D-092: the closer view was two
     maps to Dan): the region, opening on where Dan is. Tap a light: the crosshair closes on it and what is known of it
     rises in the box (a stretch's places reached, a sealed thing in view, the forecast). Only what has been reached is
     named; the way ahead is a faint light, unnamed. Never a count of what's left (UX 6). */
  import { game, content } from './game.svelte';
  import { t, dayName, relDay, minutesShort } from '../content/copy/en';
  import { placeAhead, openable, lockedOn, openedNiches, areaOf, areaName } from '../core/story';
  import skyUrl from './scene/map-sky.svg?url';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import type { StretchId } from '../core/story-types';
  import type { FactOf } from '../core/types';
  import { onMount } from 'svelte';
  import { onRest } from './rest';
  /* the sparks move by SMIL, which only the drawing's own clock pauses: opened while at rest, they rest too (F#2) */
  let chart = $state<SVGSVGElement | null>(null);
  onMount(() => onRest(r => { if (r) chart?.pauseAnimations(); else chart?.unpauseAnimations(); }));

  /* focus: a stretch to open on (Today's "Use it on the Map", D-142) */
  let { go, focus }: { go: Go; focus?: string } = $props();
  const v = $derived(game.whole);
  const s = content.story;
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  type Anchor = 'start' | 'middle' | 'end';
  /** A light on the sky: where it sits, how it is lit, its words and where they sit. */
  interface Light {
    key: string; x: number; y: number;
    kind: 'here' | 'lit' | 'faint' | 'sealed' | 'waypoint';
    name?: string; sub?: string; subKind?: 'warm' | 'dim' | 'gold';
    /** the forecast, on a line of its own under "you are here" */
    sub2?: string;
    lx: number; ly: number; anchor: Anchor;
    /** letters before its name breaks onto another line (default 16) */
    wrap?: number;
    /** a name that wraps grows upward from its first line's place, not down */
    up?: boolean;
    box: { label: string; title: string; say: string };
    /** the places reached in this area, in the order walked, each to read again (D-135, D-154) */
    reads?: { name: string; seq: number; camp?: boolean; here?: boolean }[];
  }

  /* ---------- the region: one light per stretch, laid out as the mock-up lays out the first region ---------- */
  type At = { x: number; y: number; lx: number; ly: number; anchor: Anchor; wrap?: number; up?: boolean };
  const AT: Partial<Record<StretchId, At>> = {
    'st-mouth':   { x: 150, y: 44,  lx: 186, ly: 40,  anchor: 'start' },
    /* under its light, on two short lines: above, it met the first light's words and sat in its own crosshair; on one
     line under it, it ran into the crosshair on the light where Dan stands (spacing review) */
    'st-camp':    { x: 322, y: 134, lx: 372, ly: 192, anchor: 'end', wrap: 10 },
    'st-hall':    { x: 196, y: 204, lx: 164, ly: 200, anchor: 'end', up: true },   /* a name wrapped at large text grows upward, clear of the light below */
    'st-salt':    { x: 62,  y: 268, lx: 24,  ly: 312, anchor: 'start' },
    /* the Stair is one area, its two flights one light (D-154) */
    'st-stair':   { x: 290, y: 380, lx: 254, ly: 376, anchor: 'end' },
    'st-square':  { x: 132, y: 488, lx: 168, ly: 484, anchor: 'start' },
    /* story weeks 8–14: below the first region; the map grows (and is dragged) only once they are walked or ahead */
    'st-water':   { x: 238, y: 586, lx: 274, ly: 582, anchor: 'start' },
    'st-side':    { x: 58,  y: 626, lx: 24,  ly: 666, anchor: 'start' },
    'st-reading': { x: 330, y: 668, lx: 372, ly: 638, anchor: 'end' },
    'st-blast':   { x: 164, y: 716, lx: 200, ly: 712, anchor: 'start' },
    'st-lower':   { x: 238, y: 826, lx: 202, ly: 822, anchor: 'end' },
  };
  /* how the areas join: home at the top (the Box Room and the Salt Gallery off the Lamp Hall), the way down through the
     Stair to the Water and below it, the branches off it; and the lower way, which the square gallery's lower gallery
     meets too (D-154) */
  const LINKS: [StretchId, StretchId][] = [['st-mouth', 'st-hall'], ['st-hall', 'st-camp'], ['st-hall', 'st-salt'], ['st-hall', 'st-stair'], ['st-stair', 'st-square'],
    ['st-stair', 'st-water'], ['st-water', 'st-reading'], ['st-water', 'st-blast'], ['st-blast', 'st-side'], ['st-blast', 'st-lower'], ['st-square', 'st-lower']];

  const placed = $derived(s.beats.filter(b => (b.kind === 'arrival' || b.kind === 'arrivalKey' || b.kind === 'word') && v.story.played.has(b.id)));
  /* one light per area (the Stair's two stretches are one, D-154) */
  const area = (id: StretchId) => areaOf(s, id);
  const walkedOn = $derived(new Set<StretchId>([s.stretches[0].id, area(v.here.stretch), ...placed.map(b => area(b.stretch))]));   /* the way in is always walked */
  /* the area the next place is in: a faint light, unnamed, until walked */
  const aheadOn = $derived(((b) => b ? area(b.stretch) : null)(placeAhead(s, v.story)));
  const stretchName = (id: StretchId) => areaName(s, id);
  const hereArea = $derived(area(v.here.stretch));
  /* only what a Key opens: the road's own rows open on foot (D-129). Every niche a Key can open there, and any other the
     story has shown there: the same test as Today's "Use it on the Map", so the link never points at nothing (D-143 A) */
  const sealedOn = (id: StretchId) => s.stretches.filter(x => area(x.id) === id).flatMap(x => lockedOn(s, v.story, x.id));
  /* the niches opened with a Key, under their stretch, each to read again (D-143 B) */
  const opened = $derived(openedNiches(s, game.facts));
  const openedOn = (id: StretchId) => opened.filter(x => area(x.stretch) === id);
  /* a locked thing's words without its area's name, which the box's title already says (D-154) */
  const thing = (where: string, id: StretchId) => { const n = stretchName(id); return where.toLowerCase().startsWith(n.toLowerCase() + ', ') ? where.slice(n.length + 2).replace(/^./, c => c.toUpperCase()) : where; };
  /* the locked things seen on a stretch, each with "Use a Key" when one can open it now (Dan, D-142): a Key opens by
     itself only what is where Dan is; anything behind him waits here for him to choose */
  const canOpen = $derived(new Set(openable(s, v.story).map(x => x.id)));
  function useKey(id: string) { game.do({ do: 'useKey', seal: id }); go('opened', id); }
  /* the plan's forecast (PLANNER → the forecast): where the next places would be reached; gone the moment the plan changes */
  const ahead = $derived(v.forecast.slice(0, 2));
  const fcSay = (day: string) => t('map.forecastSay', { day: relDay(day, v.day) });
  const firstSentence = (line: string) => (line.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? line);
  /* "Ahead: The Survey Cut, the tin box…" under "The Survey Cut" says the name twice: the ahead line drops it */
  const unsaid = (where: string, name: string) => where.toLowerCase().startsWith(name.toLowerCase() + ', ') ? where.slice(name.length + 2) : where;
  /* the light is named for the stretch, the box for the place: both said, so a glance never reads two places (L B7); a
     locked thing behind him is "Behind you", as Today says (deep review B6) */
  /* the box is always named for the area (as the light is), the place where Dan stands marked in its list (D-154) */
  const hereBox = $derived({ label: t('map.hereLabel'), title: v.here.area, say: v.ahead ? `${v.aheadBehind ? t('today.behind') : v.aheadHere ? t('today.here') : t('today.ahead')}: ${firstSentence(unsaid(v.ahead, v.here.area))}` : firstSentence(v.here.line) });

  /* the places reached on foot or by Key, by stretch, in the order reached: each one's entry can be read again (D-135);
     and the camps made there, each once (its latest night), so an earlier camp's words are never lost (the flow review) */
  const reached = $derived.by(() => {
    const out: { seq: number; name: string; stretch: StretchId; camp?: boolean }[] = [], camps = new Map<string, number>();
    for (const f of game.facts) {
      if (f.type !== 'arrived') continue;
      if (f.kind === 'place') { const b = s.beats.find(x => x.id === f.id); if (b?.name && f.seq !== v.arrival?.seq) out.push({ seq: f.seq, name: b.name, stretch: area(b.stretch) }); }
      else if (f.kind === 'camp' && f.seq !== v.arrival?.seq) camps.set(f.id, f.seq);
    }
    for (const [id, seq] of camps) { const k = s.camps.find(x => x.id === id); if (k) out.push({ seq, name: k.name, stretch: area(k.stretch), camp: true }); }
    return out.sort((a, b) => a.seq - b.seq);
  });
  const region = $derived.by((): Light[] => {
    const out: Light[] = [];
    for (const k of Object.keys(AT) as StretchId[]) {
      const a = AT[k]!, here = k === hereArea;
      if (walkedOn.has(k)) {
        const fc = here && aheadOn === k && ahead.length ? t('map.forecast', { day: relDay(ahead[0], v.day) }) : undefined;
        out.push({ key: k, ...a, kind: here ? 'here' : 'lit', name: stretchName(k),
          sub: here ? t('map.here') : sealedOn(k).length ? t('map.sealed') : undefined, subKind: here ? 'warm' : 'dim',
          box: here ? hereBox
            : { label: sealedOn(k).length ? t('map.walkedSealed') : t('map.walked'), title: stretchName(k), say: t('map.wayIn') } });
        /* on its own line: joined to "you are here" it ran off the screen's left edge (UI review, D-130) */
        if (fc) out[out.length - 1].sub2 = fc;
        /* the next place in this area, walked before or where Dan is: its minutes (MORNING-REPORT Part 3 #10; D-154) */
        else if (aheadOn === k && v.toNext) out[out.length - 1].sub2 = t('map.nextOn', { min: minutesShort(v.toNext) });
        /* camp, by the lamp, where Dan sleeps every night (D-154) */
        else if (k === 'st-hall' && !here && v.story.departed) out[out.length - 1].sub2 = t('map.camp');
        /* every place walked to here, in the order walked, the one where Dan stands marked (D-154) */
        const reads = reached.filter(r => r.stretch === k).map(r => ({ ...r, here: !r.camp && r.seq === v.here.seq }));
        if (reads.length) out[out.length - 1].reads = reads;
      } else if (k === aheadOn) {
        out.push({ key: k, ...a, kind: 'faint',
          /* the next place, with its minutes (MORNING-REPORT Part 3 #10); the forecast keeps its own line uncluttered */
          sub: ahead.length ? t('map.forecast', { day: relDay(ahead[0], v.day) }) : v.toNext ? `${t('map.ahead')} · ${minutesShort(v.toNext)}` : t('map.ahead'), subKind: ahead.length ? 'gold' : 'dim',
          box: { label: t('map.aheadLabel'), title: t('map.aheadName'), say: ahead.length ? fcSay(ahead[0]) : t('map.aheadSay') } });
      }
    }
    return out;
  });
  /* the region's size comes from the lights shown, never less than the first region: a bigger region is dragged around */
  const RW = $derived(Math.max(390, ...region.map(a => a.x + 60))), RH = $derived(Math.max(548, ...region.map(a => a.y + 60)));
  const regionLinks = $derived(LINKS.filter(([a, b]) => walkedOn.has(a) && (walkedOn.has(b) || b === aheadOn))
    .map(([a, b]) => ({ d: curve(AT[a]!, AT[b]!), walked: walkedOn.has(b) })));

  function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    return `M${a.x} ${a.y}Q${(mx - dy * 0.18).toFixed(1)} ${(my + dx * 0.18).toFixed(1)} ${b.x} ${b.y}`;
  }
  /* the phone's text size (Dynamic Type, --ts): the names wrap sooner and their lines open up with it, so a bigger name
     never runs off the screen's edge or onto the line under it (spacing review) */
  const ts = typeof document === 'undefined' ? 1 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ts')) || 1;
  const pitch = 20 * ts;
  /** Carved names break onto a second line past about 16 letters (SVG text does not wrap). */
  function lines(name: string, max = Math.floor(16 / ts)): string[] {
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
  let picked = $state<string | null>(focus ?? null);
  const sel = $derived(lights.find(l => l.key === picked) ?? lights.find(l => l.kind === 'here') ?? lights[0]);
  let turn = $state(0);   /* restarts the box's rise on each pick */
  /* Picking moves only the crosshair and the box's words: the box never changes size, so the sky and its lights never
     move (D-076). */
  const pick = (l: Light) => { if (dragged) return; picked = l.key; turn++; };

  /* One map that can be bigger than the screen (Dan): drawn at the scale that fills the screen's width, it is dragged
     around (a finger drags it), and opens centred on where Dan is. Picking a light
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
    const h = (focus ? region.find(l => l.key === focus) : undefined) ?? region.find(l => l.kind === 'here'), f = field, scale = k;
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
  let upTimer: ReturnType<typeof setTimeout> | undefined;
  const up = () => { drag = null; clearTimeout(upTimer); upTimer = setTimeout(() => { dragged = false; }, 0); };
  onMount(() => () => clearTimeout(upTimer));
</script>

<div class="sky" aria-hidden="true"><img src={skyUrl} alt="" /></div>
<div class="fog" aria-hidden="true"><i></i></div>
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
    <svg bind:this={chart} viewBox="0 0 {RW} {RH}" width={RW * k} height={RH * k} role="group" aria-label={t('map.label')}>
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
              <!-- the next place as a dim outline, not yet a light (MORNING-REPORT Part 3 #10) -->
              <circle r="24" fill="url(#seenPool)" opacity=".42" /><circle r="4" fill="#aeb6f0" opacity=".3" filter="url(#b1)" />
              <path d="M-6 8 V-1 Q-6 -8 0 -8 Q6 -8 6 -1 V8" transform="translate(0 -1) scale(.9)" fill="none" stroke="#dfe3ff" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="2.2 1.6" />
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
            <!-- the way walked, a faint gold path under the route (MORNING-REPORT Part 3 #10) -->
            <path d={k.d} class="fadein" stroke="#f2c170" stroke-width="2.6" stroke-linecap="round" stroke-opacity=".2" style="animation-delay:{1.4 + i * 0.18}s" />
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

      <!-- the places inside each area: a small light for each one walked to, round its area's light; the one Dan stands at
           gold (D-154: an area reads as a place with places in it) -->
      <g class="labels places-dots" aria-hidden="true">
        {#each lights as l (l.key)}
          {@const ps = (l.reads ?? []).filter(r => !r.camp)}
          {#each ps as r, j (r.seq)}
            {@const ang = (-150 + (ps.length > 1 ? j * (120 / (ps.length - 1)) : 60)) * Math.PI / 180}
            <circle cx={l.x + 19 * Math.cos(ang)} cy={l.y + 19 * Math.sin(ang)} r={r.here ? 2.6 : 1.7} fill={r.here ? '#ffd27a' : '#dcd8ff'} opacity={r.here ? 1 : .75} />
          {/each}
        {/each}
      </g>

      <!-- the words, carved on the sky -->
      <g class="labels">
        {#each lights as l (l.key)}
          {@const ls = l.name ? lines(l.name, Math.floor((l.wrap ?? 16) / ts)) : []}
          {@const ly = l.up ? l.ly - (ls.length - 1) * pitch : l.ly}
          {#each ls as line, j}
            <text x={l.lx} y={ly + j * pitch} text-anchor={l.anchor} class="nn" class:here={l.kind === 'here'}>{line}</text>
          {/each}
          {#if l.sub}
            <text x={l.lx} y={ly + ls.length * pitch + (ls.length ? 0 : 4)} text-anchor={l.anchor} class="ns {l.subKind ?? ''}">{l.sub}</text>
          {/if}
          {#if l.sub2}
            <text x={l.lx} y={ly + ls.length * pitch + (ls.length ? 0 : 4) + pitch} text-anchor={l.anchor} class="ns gold">{l.sub2}</text>
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
            <!-- one list, one look (D-154): the places walked to here first, in the order walked, each a tap from its entry
                 and painting (D-135), the one Dan stands at marked; then what is said ahead; then the locked things here,
                 with "Use a Key" (D-142) or "Read again" once opened (D-143 B) -->
            {#if sel.reads?.length}
              <ul class="rows">
                {#each sel.reads as r (r.seq)}
                  <li class="row"><span class="name">{r.name}</span>
                    <button class="text-link state read" class:here={r.here} aria-label={t('map.readAgain', { place: r.name })} onclick={() => go('arrival', `again:${r.seq}`)}><span>{r.here ? t('map.here') : r.camp ? t('map.turnedBack') : t('daybook.readAgain')}</span></button></li>
                {/each}
              </ul>
            {:else}
              <p class="say"><Prose text={sel.box.say} /></p>
            {/if}
            {#if sel.kind === 'here' && sel.box.say && sel.reads?.length}<p class="say ahead-say"><Prose text={sel.box.say} /></p>{/if}
            {#if sel.kind === 'here' || sel.kind === 'lit'}
              {@const locks = sealedOn(sel.key as StretchId)}
              {@const done = openedOn(sel.key as StretchId)}
              {#if locks.length || done.length}
                <ul class="rows locks">
                  {#each locks as x (x.id)}
                    <li class="row"><span class="name">{thing(x.where, sel.key as StretchId)}</span>
                      {#if v.keys && canOpen.has(x.id)}<button class="text-link state use" aria-label={t('map.useKeySr', { where: x.where })} onclick={() => useKey(x.id)}><span>{t('map.useKey')}</span></button>
                      {:else}<span class="sr-only">, </span><span class="state needs">{t('map.sealed')}</span>{/if}</li>
                  {/each}
                  {#each done as x (x.id)}
                    <li class="row"><span class="name">{thing(x.where, sel.key as StretchId)}</span>
                      <button class="text-link state" aria-label={t('map.openedSr', { where: x.where })} onclick={() => go('opened', `again:${x.id}`)}><span>{t('daybook.readAgain')}</span></button></li>
                  {/each}
                </ul>
                {#if locks.length && !v.keys}<p class="soft lock-say">{t('map.noKey')}</p>{/if}
              {/if}
            {/if}
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
  .head { margin-top: 8px; }
  .head h1 { margin-top: 8px; }
  button.home { color: var(--ink-2); }

  .field { position: relative; flex: 1; min-height: 0; margin: 4px 0 8px; overflow: auto; scrollbar-width: none; overscroll-behavior: contain;
    touch-action: pan-x pan-y; cursor: grab; }
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
  .nn { font-family: var(--carve); font-size: calc(15px * var(--ts, 1)); font-weight: 600; letter-spacing: .08em; fill: #e9e7ff; filter: url(#halo); }
  .nn.here { fill: #fff; }
  .ns { font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); fill: #c3c3e8; filter: url(#halo); }
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
  .box { border: 1px solid var(--edge-2); padding: 14px 18px 16px; background: rgba(10,9,24,.6); height: calc(180px * var(--ts, 1)); display: flex; flex-direction: column; overflow: hidden; }
  .box .swap { flex: 1; min-height: 0; overflow: hidden; }
  .box h2 { margin: 8px 0 6px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .box .say { color: var(--ink-2); font-size: calc(16.5px * var(--ts, 1)); line-height: 1.42; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .swap { animation: rise .45s var(--ease) both; }
  /* the places reached: all of them, scrolling inside the box if there are many (the box keeps its size, D-076) */
  /* the locked things on a stretch (D-142): the box keeps its size and scrolls (D-076) */
  /* what scrolls in the box fades at its foot, never sliced mid-line against the edge (spacing review) */
  /* one row style for every place and locked thing (D-154): its name, and what a tap does */
  .box .swap { overflow-y: auto; scrollbar-width: none; padding-bottom: 16px;
    -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 24px), transparent); mask-image: linear-gradient(180deg, #000 calc(100% - 24px), transparent); }
  .rows { list-style: none; margin: 0 0 6px; padding: 0; }
  .rows.locks { border-top: 1px solid var(--edge-2); padding-top: 4px; }
  .row { display: flex; gap: 10px; align-items: center; justify-content: space-between; min-height: 44px; font-family: var(--life); font-size: calc(16px * var(--ts, 1)); line-height: 1.3; color: var(--ink); }
  .row .name { flex: 1; min-width: 0; }
  .row .state { flex: none; padding: 0; min-height: 44px; font-size: calc(14.5px * var(--ts, 1)); color: var(--ink-2); }
  .row .state.here { color: var(--gold); }
  .row .state.use { color: #f2c170; }
  .row .needs { font-style: italic; color: #e9d9b4; display: flex; align-items: center; }
  .ahead-say { margin: 2px 0 8px; font-size: calc(15px * var(--ts, 1)) !important; }
  .lock-say { margin: 4px 0 0; font-size: calc(14px * var(--ts, 1)); }
  @media (prefers-reduced-motion: reduce) { .drawn, .dust, .pl, .labels, .reticle, .swap { animation: none; opacity: 1; } .drawn { opacity: 0; } .reticle { transition: none; } }
</style>
