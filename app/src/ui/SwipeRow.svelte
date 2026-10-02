<script lang="ts" module>
  /* one row slid open at a time, anywhere */
  let openKey = $state<string | null>(null);
  export const closeRows = () => { openKey = null; };
</script>

<script lang="ts">
  /* A job's row that slides left to show its actions (Today, the Satchel: D-125, D-131), and opens the job menu on a
     press and hold (D-131, step 3). A press leaves the row perfectly still (Dan's screenshot, D-131): nothing moves until
     the finger has slid sideways past a small dead zone, and then only by whole pixels; the phone's own long-press
     (text selection, the callout, the tap highlight) is off. VoiceOver hears the actions as buttons (accessibility A). */
  import type { Snippet } from 'svelte';
  import { steady } from './taps';
  import { platform } from '../platform';

  interface Action { label: string; sr: string; run: () => void; del?: boolean }
  /* `quiet`: a tap on the row does nothing (a finished job); `done` alone only marks it done (a done recurring job still
     opens its menu with a tap, J11) */
  /* `label`: the row's name for VoiceOver, when what it shows runs together (a recurring row's time, A#26) */
  let { key, actions, tap, hold, disabled = false, done = false, quiet = undefined, row, over, lead, label }: {
    key: string; actions: Action[]; tap: () => void; hold?: () => void; disabled?: boolean; done?: boolean; quiet?: boolean;
    row: Snippet; over?: Snippet; lead?: Snippet; label?: string;
  } = $props();
  const dead = $derived(quiet ?? done);

  /* narrower actions on a small phone, so the job's name stays readable beside them (360 × 780, N polish) */
  const W = typeof innerWidth === 'number' && innerWidth < 380 ? 78 : 96, DEAD = 10, HOLD_MS = 480;
  const open = $derived(openKey === key);
  const width = $derived(actions.length * W);
  let dx = $state(0), sliding = $state(false);
  let start: { x: number; y: number; base: number; id: number } | null = null;
  let timer = 0, held = false, moved = false;

  function down(e: PointerEvent) {
    if (e.button > 0 || disabled) return;
    /* a tap on a slid-out action, or on a link over the row, is a tap, never the start of a slide (review, D-125) */
    if ((e.target as Element).closest?.('.acts, .over, .swipe-lead')) return;
    held = false; moved = false;
    start = { x: e.clientX, y: e.clientY, base: open ? -width : 0, id: e.pointerId };
    if (hold) timer = window.setTimeout(() => { if (start && !sliding) { held = true; start = null; void platform.haptics.tick().catch(() => {}); hold!(); } }, HOLD_MS);
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel);
  }
  function move(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return;
    const x = e.clientX - start.x, y = e.clientY - start.y;
    if (!sliding) {
      /* inside the dead zone, or mostly up and down (a scroll): the row stays exactly where it is */
      if (Math.abs(x) < DEAD || Math.abs(y) > Math.abs(x)) { if (Math.hypot(x, y) > DEAD) { clearTimeout(timer); if (Math.abs(y) > Math.abs(x)) cancel(); } return; }
      sliding = true; clearTimeout(timer);
    }
    moved = true;
    const from = x > 0 ? x - DEAD : x + DEAD;
    dx = Math.round(Math.min(0, Math.max(-width - 24, start.base + from)) - start.base);
  }
  function up() {
    clearTimeout(timer);
    if (start && sliding) {
      const at = start.base + dx;
      openKey = at < -width / 2 ? key : openKey === key ? null : openKey;
      steady();
    }
    reset();
  }
  function cancel() { clearTimeout(timer); reset(); }
  function reset() {
    start = null; sliding = false; dx = 0;
    removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel);
  }
  $effect(() => () => { clearTimeout(timer); reset(); });
  function click() {
    /* the lift after a slide or a hold is not a tap */
    if (moved || held) { moved = false; held = false; return; }
    if (open) { openKey = null; return; }
    if (openKey) { openKey = null; return; }
    if (!disabled && !dead) tap();
  }
  const offset = $derived(sliding ? (open ? -width : 0) + dx : open ? -width : 0);
</script>

<div class="swipe" onpointerdown={down} role="presentation">
  <!-- read in this order by VoiceOver: the tick circle, the job, then what a slide offers (deep review A#37) -->
  <!-- a control over the row's marker, at its left (the tick circle on Today, D-134) -->
  {#if lead && offset === 0}<div class="swipe-lead">{@render lead()}</div>{/if}
  {#if offset < 0}
    <div class="acts">
      {#each actions as a (a.sr)}<button class="act" class:del={a.del} tabindex={open ? 0 : -1} onclick={() => { openKey = null; a.run(); }}>{a.label}</button>{/each}
    </div>
  {/if}
  <!-- slid open, the row narrows beside its actions rather than sliding off: the job's name stays in view, wrapping if it
       must (a small phone hid it, N polish); only the finger's slide itself moves it -->
  <button class="row" class:done class:moving={sliding} class:narrowed={open && !sliding} style:transform={sliding && offset ? `translate3d(${offset}px,0,0)` : null}
    style:width={open && !sliding ? `calc(100% - ${width}px)` : null}
    onclick={click} oncontextmenu={(e) => e.preventDefault()} aria-disabled={disabled || dead} aria-label={label}>
    {@render row()}
  </button>
  {#if over && offset === 0}<div class="over">{@render over()}</div>{/if}
  {#if offset >= 0}
    {#each actions as a (a.sr)}<button class="sr" onclick={() => { openKey = null; a.run(); }}>{a.sr}</button>{/each}
  {/if}
</div>

<style>
  /* it clips a row sliding off, reaching out into the list's faded sides (base.css → .col .scroll), the words staying
     where they were (Dan, 2026-09-27: cut at the column's edge it sliced a done diamond's glow) */
  .swipe { position: relative; overflow: hidden; margin: 0 -18px; padding: 0 18px; }
  @supports (overflow: clip) { .swipe { overflow-x: clip; overflow-y: visible; } }
  /* a press never moves, selects or highlights anything (D-131): no text selection, no callout, no tap highlight, no
     transform until a slide begins */
  .swipe, .swipe .row { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
  .swipe .row { position: relative; z-index: 1; width: 100%; text-align: left; touch-action: pan-y; transition: transform .22s ease; }
  .swipe .row.moving { transition: none; }
  .swipe .row.narrowed { transition: width .22s ease; }
  .acts { position: absolute; right: 18px; z-index: 0; top: 1px; bottom: 0; display: flex; }
  .act { width: 96px; font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: var(--ink); background: rgba(var(--violet-rgb), .28); }
  @media (max-width: 379px) { .act { width: 78px; font-size: calc(15px * var(--ts, 1)); line-height: 1.15; padding: 0 4px; } }
  /* Delete never looks like every other link (D-131): its own colour, on the slide only */
  .act.del { background: rgba(160, 64, 88, .55); color: #fff; }
  .swipe-lead { position: absolute; z-index: 2; left: 18px; top: 50%; transform: translateY(-50%); }
  .over { position: absolute; z-index: 2; right: 18px; top: 50%; transform: translateY(-50%); }
  .sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
