# Deep review: performance, battery, memory, WebKit (round 5)

> Spoiler-free: screens are named by class names, saves by length, code by file. No story text.
> Reviewer's perspective: what the app costs the phone, and how that cost grows as Dan's save grows.
> Branch `claude/review-round-5`, build in `app/dist` (served with `vite preview` on 4187). Chromium (headless, software
> drawing, 4 shared vCPUs also running other reviewers' jobs, so milliseconds are relative; counts are exact).
> **WebKit could not be run here**: `/opt/pw-browsers` holds only Chromium, and installing browsers is not allowed in this
> review. The engine-neutral scripts below take `BROWSER=webkit` for a Mac or CI run; WebKit points are from reading the code.

## Scripts (all in `app/tests/review/`, nothing in `app/src` or existing tests changed)

| Script | What it measures |
|---|---|
| `deep-perf-rules.test.ts` | Simulated Dan for 104 weeks (mixed low/normal/high days, an away day every 9th week, goodnight each evening); at 1/4/13/26/52/78/104 weeks times see/settle/act/alertsDue and writes each save (`SAVES=<dir>`). `REVIEW_SLOW=1`. |
| `deep-perf-saves.test.ts` | The hot calls on those saves, median of 15: a tap (act + see + alertsDue), a cold open, a delve's second (settle + see). |
| `deep-perf-profile.test.ts` | Node CPU profile of see / act(done) / act(open) on a save: top self-time functions. |
| `deep-perf-lib.mjs` | Shared page helpers: Date-only clock shift (real timers and frames), counters for rAF, timer fires, live timers, window/document listeners, long tasks, first drawn screen. |
| `deep-perf-frames.mjs` | Chromium CDP trace per screen on a *played* save: compositor frames, main-thread frames, paints, rAF, timers, task ms/s, moving and rested, plus SMIL count. |
| `deep-perf-idle.mjs` | Engine-neutral: per screen, moving / rested / touched-again: rAF/s, timers/s, running and endless animations (`getAnimations`). |
| `deep-perf-big.mjs` | The app in the browser on 0 → 104-week saves: first drawn screen, long tasks, a screen change, a fact-writing tap, a rested delve's processor time, heap. |
| `deep-perf-cpuprof.mjs` | Chromium CPU profile of a rested delve on a long save, with the bundle code at each hot spot. |
| `deep-perf-mem.mjs` | 200 screen changes (Today ⇄ Week, Satchel, Map, delve set-up): heap after GC, DOM nodes, listeners, live timers, animations, every 20. |
| `deep-perf-fog.mjs` | Cost of rasterising the fog/grain noise pictures at the phone's pixel size. |
| `deep-perf-layers.mjs` | Compositing layers per screen (Chromium LayerTree). |

## Measurements

### A. Screens untouched (Chromium, 430 × 932 at 3×)

| Screen | Save | moving: frames/s | rested (≥17 s): frames/s | rested: main-thread paints/s | rested: rAF/s | rested: timers/s | rested: task ms/s | endless anims moving → rested |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Today | fresh | 60.5 | **0** | 0 | 0 | 1 | 0.3 | 112 → 0 |
| Week | fresh | 60.3 | **0** | 0 | 0 | 1 | 0.4 | 4 → 0 |
| Satchel | fresh | 59.9 | **0** | 0 | 0 | 1 | 0.5 | 4 → 0 |
| Map | fresh (no walked routes) | 60.4 | **0** | 0 | 0 | 1 | 0.3 | 4 → 0 |
| Delve running | fresh | – | – | – | 0 | 1 | 12 (big.mjs) | 212 → 0 |
| Delve's end | fresh | – | – | – | 0 | 1 | – | 212 → 0 |
| Today | 4 weeks played | 60.2 | **0** | 0 | 0 | 1 | 6.0 | – |
| Week / Satchel / Daybook | 4 weeks played | 60 | **0** | 0 | 0 | 1 | 0.3–5.1 | – |
| **Map** | **4 weeks played** | 91.5 | **111.3** | **102** | 0 | 1.1 | **143.9** | 0 → 0 (6 SMIL elements) |

Touching a rested screen wakes it correctly (Today 0 → 112 endless animations, delve 0 → 212).

### B. The rules engine as the save grows (Node, median, ms on this machine)

| Played | Facts | Save | Load (parse) | see() | Tap: done | Tap: startRun | Cold open | Delve second | alertsDue |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 week | 259 | 29 KB | 0.3 | 2.3 | 7.8 | 6.0 | 5.0 | 1.6 | 0.6 |
| 4 weeks | 955 | 108 KB | 1.4 | 2.4 | 7.8 | 6.1 | 5.9 | 1.9 | 0.7 |
| 3 months | 2 662 | 304 KB | 1.7 | 7.2 | 16.5 | 18.1 | 21.4 | 11.6 | 4.1 |
| 6 months | 4 999 | 573 KB | 3.0 | 12.5 | 38.8 | 24.8 | 24.8 | 10.6 | 2.9 |
| 1 year | 9 489 | 1.1 MB | 6.2 | 20.0 | 73.5 | 63.3 | 59.9 | 19.2 | 6.5 |
| 18 months | 13 979 | 1.6 MB | 15.5 | 20.3 | 86.7 | 83.6 | 56.8 | 22.4 | 9.0 |
| 2 years | 18 469 | 2.1 MB | 13.0 | 24.2 | 177.4 | 111.8 | 74.2 | 28.5 | 12.2 |

Growth is linear per call with a large constant (≈ 2 µs per fact for one see(), i.e. hundreds of full passes over the
log); "tap: done" grows a little faster than linear (2.4× for 1.95× the facts from 1 to 2 years). The simulation's own
week (a few hundred calls) grew from 0.5 s to 10 s, the cumulative O(n²) of linear calls. Profile at 1 year: `ofType`
and `onDay` (`facts.filter(...)` over the whole log) and `calendarWeek` are the top self time in see, done and open.

### C. The app in the browser on those saves (Chromium, 3×), as built vs. with the fix in finding 1

| Played | First screen drawn | Longest task | Back to Today | Satchel line added | Delve, rested: task ms/s | JS heap |
|---|---:|---:|---:|---:|---:|---:|
| fresh | 223 ms → 262 | 176 → 185 ms | 77 → 79 ms | 25 → 25 ms | 12 → 11.7 | 5.0 → 4.9 MB |
| 4 weeks | 472 → **214** | 370 → 165 | 92 → 33 | 192 → **62** | **40.7 → 9.0** | 7.0 → 5.4 |
| 6 months | 1 037 → **291** | 2 450 → 180 | 246 → 46 | 955 → **130** | **197.9 → 20.0** | 14 → 6.5 |
| 1 year | 1 485 → **469** | 2 844 → 323 | 594 → 46 | 1 990 → **169** | **483.1 → 31.5** | 21.8 → 7.7 |
| 2 years | 3 461 → **484** | 9 289 → 366 | 1 282 → 67 | 5 788 → **304** | **575.3 → 50.6** | 37.3 → 10.0 |

(Left of each arrow: the build as it is. Right: the same source with one word changed, built into the scratchpad, see
finding 1. "Satchel line added" includes the browser stand-in's whole-save `localStorage` write, which the phone's SQLite
does not do; the delve and screen-change columns apply to the phone as they are.)

### D. Memory across 200 screen changes (Chromium, fresh save, GC before each reading)

| Changes | 0 | 20 | 100 | 200 |
|---|---:|---:|---:|---:|
| JS heap | 3.9 MB | 4.6 | 5.1 | 5.5 |
| DOM nodes | 997 | 1 877 | 1 877 | 2 106 (alternates 1 877 / 2 106 with the screen) |
| Event listeners | 61 | 65 | 65 | 62 |
| Live timeouts / intervals | 2 / 0 | 2 / 0 | 2 / 0 | 2 / 0 |
| Endless animations on Today | 112 | 112 | 112 | 112 |

No leak: listeners, timers, animations and nodes are flat; heap drifts 0.9 MB over 200 changes (~4.5 KB each), within
JIT/code-cache noise. 0 misses, 0 page errors.

### E. Pictures, layers, bundle

| Item | Value |
|---|---|
| Paintings | 92 WebP, all 1320 × 2868 (the phone's own pixels), 16 MB in total, 175 KB mean, 320 KB max; decoded 15.1 MB each; one painting in the DOM per screen. |
| Fog noise (4 layers on Today, `direction.css`) | each 200% of the frame wide → 2580 × 2796 px at 3× = 27.5 MB; rasterising one took 614–992 ms here (software). Grain: 1.7 MB tile, 27 ms. |
| Compositing layers (moving) | Today 117 (20 full-screen or larger); Week 54 (23); Map 32 (8); a delve 239 (21). |
| JS | App 691 KB (203 KB gzip), runtime 57 KB, rest < 20 KB; CSS 116 KB. Loaded from the phone's disk. |

## Findings

### 1. URGENT: the whole fact log is a deeply reactive Svelte proxy; every second of a delve and every tap pays for it, more each week

- **Evidence:** table C. A rested delve (only its countdown changing) uses 40 ms of processor per second after 4 weeks,
  198 ms after 6 months, **483 ms after a year** (half a core, continuously) and 575 ms after two. Adding a Satchel line
  takes 2 s at a year, 5.8 s at two; going back to Today 0.6 s / 1.3 s; the first screen 1.5 s / 3.5 s, with single
  tasks of 2.8 s / 9.3 s. The CPU profile of the rested delve at a year (`deep-perf-cpuprof.mjs`): 61 % busy, of which
  Svelte's proxy `get` trap 27.5 %, `has` 4 %, signal reads 4.2 %; the rules' own filters only ~14 %. The same calls in
  Node, on plain arrays, take 20 ms (table B): the browser is 20× slower because of the proxies.
- **Why:** `facts = $state<Fact[]>([])` (`app/src/ui/game.svelte.ts:42`) makes Svelte wrap the array *and every fact
  object* in a proxy with a signal per property touched. `view = $derived(see(this.facts, …))` then reads every field of
  every fact, hundreds of times, through those proxies, once a second in a delve (the clock) and after every fact.
  The heap grows with it (37 MB vs 10 MB at two years).
- **This is Dan's "phone gets hot" for the future**: D-132 made the screens rest, but the cost here is script work the
  rest cannot stop, and CI's check (finding 3) uses a fresh save so it never sees it.
- **Fix:** `facts = $state.raw<Fact[]>([])`. Facts are never mutated in place (only replaced: `this.facts = this.facts.concat(f)`,
  `= this.load()`, `= s.facts`, `= []`), so nothing depends on deep reactivity. Verified on a copy of the source built to
  the scratchpad (table C, right of the arrows): delve 483 → 31.5 ms/s at a year, the Satchel tap 2 s → 0.17 s, first screen
  1.5 s → 0.47 s, longest task 2.8 s → 0.32 s, heap 22 → 7.7 MB. Run the flows after the change (nothing should differ
  visibly), and add a unit or flow check that a long save's delve stays under the limit (finding 3).

### 2. URGENT: the Map never rests once a route has been walked (SMIL that `rest.ts` cannot see)

- **Evidence:** table A, Map on a 4-week save: 111 frames/s, 102 main-thread repaints/s and 144 ms of processor per second
  while untouched, with `data-resting` set and 0 endless CSS/Web animations running. With a fresh save (no walked routes)
  the Map is 0 frames/s, which is why `idle.mjs` and CI pass.
- **Why:** `app/src/ui/Map.svelte:236`: every walked route has a spark `<circle>` with
  `<animateMotion repeatCount="indefinite">`. SMIL animations are not in `document.getAnimations()`, so `rest()` never
  pauses them; the spark's CSS opacity animation is paused (it may freeze visible or invisible), but the motion keeps the
  SVG repainting on the main thread forever. WebKit runs SMIL from a main-thread timer too, so the phone pays the same.
  It grows with the number of walked routes.
- **Fix (either):** in `rest.ts`, also pause SMIL: `for (const s of document.querySelectorAll('svg')) s.pauseAnimations()`
  in `rest()` and `unpauseAnimations()` in `wake()` (and for an SVG mounted while at rest, from the Map's own mount via
  `onRest`); or replace `animateMotion` with CSS motion (`offset-path: path(...)` + `offset-distance` keyframes), which
  `getAnimations()` lists and the existing rest pauses. Add the Map with walked routes to the idle check (finding 3).

### 3. BUG: CI's battery check only ever looks at a fresh save, so findings 1 and 2 pass it

- **Evidence:** `.github/workflows/tests.yml` runs `CHECK=1 … tests/flows/idle.mjs … 5 390 844`; `idle.mjs` starts from an
  empty save at 2026-09-30 09:00. With an empty save there are no walked routes on the Map and the fact log is tiny. With
  a 4-week save the delve's 40.7 ms/s already exceeds the check's own limit (25 ms/s), and the Map fails every limit.
  `tests/review/perf.test.ts` measures see/settle growth but only as a report, never a limit, and only in Node, where the
  proxies (finding 1) don't exist.
- **Fix:** run `idle.mjs` a second time with a played save seeded into `localStorage` (as `nav-flow.mjs` does with
  `tests/flows/saves/*.json`): a 3- or 6-month save made by the simulator, so the Map has walked routes and the delve's
  per-second rebuild is realistic. Keep the same limits. Optionally a vitest limit on `see()` for a year's save.
- Also observed: a local run of `idle.mjs` at 430 × 932 timed out finding a Today row to start the delve after the Map
  (`idle.mjs:117`); likely load on this shared machine (CI uses 390 × 844), but worth a retry/wait there.

### 4. BUG: the rules rebuild the whole view from the whole log, hundreds of passes per call, once a second in a delve

- **Evidence:** table B, and table C after the fix in finding 1: a rested delve still costs 31.5 ms/s at a year and
  50.6 ms/s at two (above CI's 25 ms/s delve limit), and a tap ("done") 73 ms → 177 ms in Node from 1 to 2 years, before
  the screen's own work. Profile: `ofType` (`facts.filter(f => f.type === t)`), `onDay` (`facts.filter(f => f.day === d)`)
  and `calendarWeek` dominate see, act(done) and act(open) (`app/src/core/game.ts:33–34`, the same `ofType` copied in
  `core/week.ts:24`, `core/story.ts:26`, `core/reminders.ts:44`; `core/time.ts:55 calendarWeek`). Each is a full scan, called per job, per day, per week considered.
- **Fix (no rule changes):** memoise per log, keyed by the array (a `WeakMap<Fact[], Index>` with `byType`, `byDay`,
  `byWeek`, built once in one pass; with `$state.raw` the array identity changes only when a fact is added). Cache
  `calendarWeek(day)` results. In a delve, split the derived view so the once-a-second clock only recomputes the run part
  (countdown, ring, phase) and the day's view is recomputed when facts or the minute change. Expected: a delve second back
  to a few ms regardless of history.

### 5. BUG: while the world moves, the phone composites ~20 full-screen layers, and the fog is drawn at 3× size

- **Evidence:** table E. Today has 117 compositing layers, 20 of them full-screen or larger; a delve 239 (21 full-screen),
  212 endless animations. Each fog layer (`direction.css` `.fog > i`, `width: 200%`) is a feTurbulence SVG rasterised at
  the element's device pixels: 2580 × 2796 = 27.5 MB, 0.6–1.0 s of software rasterising each, four on Today
  (two violet, two warm), plus the 4-layer fog on Week/Satchel/Daybook. During the 15 s after each touch, the phone
  composites all of these at 60–120 Hz (PERFORMANCE.md already names the grain and fog as the next suspects).
- **Fix:** bake each fog bank once into a small WebP (the noise is low-frequency, `baseFrequency .004–.02`: 390 × 422 is
  plenty) and scale it up, or render the SVG at ⅓ size and `transform: scale(3)`; merge the two banks of each fog into one
  layer with two backgrounds; drop `will-change` from the warm banks when `--warmth` is 0. Same look, a fraction of the
  memory and fill. Measure on the phone with Instruments (Core Animation FPS / GPU) if possible.

### 6. MINOR (WebKit, not measured here): blurs and blend modes on moving composited layers

- `app/src/ui/scene/tunnel.css`: `.nebula` (`inset: -25%`, `blur(38px)`, `mix-blend-mode: screen`), ring glows
  (`blur(10px)`/`blur(24px)`, `screen`), `.motes` (`screen`); `runset.css` dial glow (`blur(10px)`, `screen`);
  `light.js:96` `plus-lighter`. On iOS, a CSS filter on a composited, animated layer becomes a Core Animation layer filter,
  re-evaluated every frame while it moves, and blend modes on composited layers force extra offscreen passes. Only during
  the moving 15 s since D-132, so minor. **Fix:** pre-blurred pictures (as D-093 did for Records/Marks) for the nebula and
  glows; keep `screen` only where the look needs it.

### 7. MINOR: Today's minute tick costs 20× more on a played save

- **Evidence:** Today rested, task 0.3 ms/s fresh vs 6.0 ms/s with 4 weeks played (Chromium). With no delve,
  `game.tick()` changes `now` once a minute, which re-derives the whole view through the proxies. Fixed by findings 1 and 4;
  no separate change needed.

### 8. MINOR: odds and ends from the WebKit/iOS checklist (code reading)

- **Fine:** `viewport-fit=cover` with `env(safe-area-inset-*)` (`direction.css:77–78`); `100vh` then `100dvh` then the
  keyboard's `--vvh` (`direction.css:111–113`, `keyboard.ts`); every input and the textarea at 16–17 px, plus
  `maximum-scale=1` (no focus zoom); tap highlight off; `overscroll-behavior: none` and Capacitor `scrollEnabled: false`
  (no bounce); no `position: fixed` anywhere; `backdrop-filter` only on the two transient sheets' scrims
  (`TickSheet.svelte:49`, `JobMenu.svelte:83`); `rest()` on `visibilitychange` (hidden = at rest at once), `pageshow` wakes.
- `Map.svelte:334` `-webkit-overflow-scrolling: touch`: obsolete since iOS 13, no effect; remove.
- `Words.svelte:29` `.wash` is three viewport widths wide and extends 70vh below: a gradient only, but a large paint area
  each time it fades (`transition: opacity`); `left/right: -16px` would do inside the clipped frame.
- `base.css` `.col .scroll` uses two mask images with `mask-composite` on a scrolling box: WebKit repaints the mask on
  scroll of long lists; fine at today's list lengths.

### 9. No issue found

- **Memory across 200 screen changes:** no leaked listeners, timers, animations or nodes (table D).
- **Paintings:** exactly the phone's pixels, one per screen; total app size dominated by them (16 MB) and acceptable.
- **Bundle:** 750 KB of JS from disk; first screen 220–260 ms on a fresh save here.
- **The phone's save (SQLite)** writes only new facts (`platform/saves.ts`); the whole-save write per fact exists only in
  the browser stand-in. The daily backup copies the whole save once a day (1–2 MB at 1–2 years): fine.
- **Timers:** one clock timeout a second (D-132), no intervals; rest/wake correctly re-arm.

## Priority

1 and 2 first (one word in `game.svelte.ts`; a pause/unpause of SVG animations or CSS motion in the Map), then 3 so CI
holds them, then 4 (indexes) and 5 (fog at low resolution). Re-run `deep-perf-big.mjs` and `deep-perf-frames.mjs` with a
6-month save to confirm.
