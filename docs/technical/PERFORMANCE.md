# Performance: what the app costs the phone (D-132)

> Spoiler-free. What keeps the phone busy while Long Answer sits open, measured, and what was done about it.
> Earlier rounds: D-093 (the delve's frame rate), D-099 (moving pictures, not repainting them), D-103 (the whole app
> audited; the ring's partial redraw). This round follows Dan's report of 2026-09-27: *"My phone still gets warm when
> using the app and drains battery fast. Not even on a delve. It just gets hot."*

## How it is measured

`app/tests/flows/idle.mjs` opens the built app in Chromium at 430 × 932 (Dan's iPhone 16 Pro Max, in points) and at 3×
pixels. It visits each main screen and leaves it untouched, counting from the browser's own trace:

- **frames/s**: frames the compositor made. Anything that moves makes one, even a layer the graphics chip moves alone.
  An untouched screen should make none.
- **main/s**: frames that needed the page's own work (a style or layout change, a redraw).
- **rAF/s**: script-drawn animation frames (canvases drawn by code).
- **timers/s**: script timers firing.
- **task ms/s**: the processor's time on the page each second.
- **running**: animations still playing when the reading ends.

The clock is real: only `Date` is shifted to reach the evening or a delve's end, so timers and frames run as on the phone.
The browser here has no graphics chip, so the milliseconds compare builds; they are not the phone's. The frame counts are
the real signal: on the iPhone every frame means compositing full-screen layers at 1320 × 2868 pixels, 60 or 120 times a
second.

Run it (from `app/`, with a build served by `npx vite preview`):
`node tests/flows/idle.mjs http://localhost:4173/ 20` (add `MOVING=1` to also read the first seconds after a screen opens).
`CHECK=1` fails on any settled screen above the limits; CI runs it on every push (`tests.yml`, Chromium, 390 × 844).

## What kept the phone busy (before)

Found by reading every source of continuous work and confirmed by the readings below:

1. **Nothing ever stopped moving.** D-041 made every screen "always alive", so every screen ran its looping animations for
   as long as it was open: on Today and every place, the whole painting's slow drift, two mist banks per mist, every
   flame's flicker and halo, the four full-screen fog layers (two violet, two warm), the main button's breath; the fog
   on the Week, Satchel, Daybook and Map; the map's breathing pool and turning spark; in a delve, the tunnel's ribs,
   clouds, rays, opening and fog. Moving these as finished pictures (D-099) took the repainting away, but the phone
   still had to composite the whole screen, with its blended grain and masked fog, 60 (or 120) times a second, for as
   long as the app was open.
2. **Canvases drawn by script 30 times a second:** the paintings' rising motes (a full-screen canvas cleared and redrawn,
   then sent to the graphics chip, on Today and every place); in a delve, the tunnel's dust (another full-screen canvas)
   and the ring (its comet, trail, glint and sparks). This is main-thread work that never stopped, even with the screen
   untouched.
3. **The game's clock looked four times a second** (a 250 ms timer), all day.

Checked and not a cause:

- **Paintings' size:** every place is 1320 × 2868, exactly the iPhone 16 Pro Max's screen: served at the size shown.
  Records and Marks blur their painting once and hold it (D-093).
- **No video, no audio session left running** (the chime is a short sound on a tap-unlocked context).
- **Native side (`app/ios`):** no Swift timers. The lock-screen panel (Live Activity) is ticked by the phone itself
  (`Text(timerInterval:)`, `ProgressView(timerInterval:)`); the app updates it only when the delve's phase changes
  (start, breather, end, pause), never per second. The lock detection (D-094, D-096) runs only when the app goes to the
  background during a delve: one background task of at most 15 s with two one-off checks (at 1 s and at 15 s), no
  sensors, no polling. Calendar and inbox are read on opening and on return only.

### Readings before (build of `main` at 2d692a7; 20 s each, starting 4.5 s after the screen opened)

| Screen | frames/s | main/s | rAF/s | timers/s | task ms/s | running |
|---|---:|---:|---:|---:|---:|---:|
| Today, morning | 79.5 | 41 | 21 | 4 | 62.5 | 16 |
| Week | 60 | 0 | 0 | 4 | 2.8 | 4 |
| Satchel | 60 | 0 | 0 | 4 | 1.2 | 4 |
| Daybook | 60 | 0 | 0 | 4 | 1.5 | 4 |
| Map | 60 | 0 | 0 | 4 | 2.0 | 4 |
| A delve running | 74.5 | 31.8 | 16.3 | 4 | 66.2 | 19 |
| A delve's end | 74.8 | 34.2 | 17.5 | 4 | 45.1 | 20 |
| Today, day done (gold) | 79.3 | 41 | 20.9 | 4 | 64.1 | 15 |
| Today, evening (Tonight) | 77.8 | 38.8 | 19.8 | 4 | 60.6 | 16 |
| Goodnight | 79 | 41.6 | 21.4 | 4 | 64 | 15 |

(Headless Chromium draws in software and paces its frames loosely, hence counts above 60.)

## What was done (D-132)

1. **The world rests** (`app/src/ui/rest.ts`). Ambient motion plays when a screen opens and while Dan touches it; after
   15 s untouched every looping animation is held exactly where it is (style animations by a `data-rest` mark that
   `direction.css` reads as `animation-play-state: paused`, so the stylesheet keeps charge of them; script animations
   paused and played). A touch, scroll, key, new screen, the delve's moment changing, or coming back to the app wakes
   it. Hidden: at rest at once. One-off animations (entrances, the cut, the stair's reveal, a delve's end) always play
   through.
2. **No script frame loops** on Today, the places or the delve. The paintings' motes (`app/paint/kit/live.js`) and the
   tunnel's dust (`app/src/ui/scene/light.js`) are small layers moved and faded by the graphics chip along the same
   paths. The ring's arc, trail and tip are drawn only when the fill moves a pixel (at most once a second); the tip's
   breath, glint and sparks are small layers on top. The stair's dust stops at rest.
3. **The ring's halo and disc** follow the fill in half-percent steps again (a later style rule had undone D-103's steps).
4. **The clock** looks once a second, just after each whole second (it looked four times).
5. **The standing check:** `CHECK=1` in CI, limits: a settled screen ≤ 1 frame/s, ≤ 0.2 script frames/s,
   ≤ 8 ms/s; a running delve ≤ 7 frames/s (its once-a-second change), ≤ 25 ms/s.

### Readings after (same screens; "moving" = 10 s from 3 s after opening, "settled" = 20 s from 17 s after opening)

| Screen | moving: frames/s | moving: rAF/s | settled: frames/s | settled: rAF/s | timers/s | settled: task ms/s |
|---|---:|---:|---:|---:|---:|---:|
| Today, morning | 60 | 0 | **0** | 0 | 1 | 1.2 |
| Week | 60 | 0 | **0** | 0 | 1 | 0.6 |
| Satchel | 60 | 0 | **0** | 0 | 1 | 0.2 |
| Daybook | 60 | 0 | **0** | 0 | 1 | 0.2 |
| Map | 60 | 0 | **0** | 0 | 1 | 0.4 |
| A delve running | 61 | 0 | **5.2** (1 change/s) | 0 | 1 | 7 |
| A delve's end | 60 | 0 | **0** | 0 | 1 | 0.3 |
| Today, day done (gold) | 60 | 0 | **0** | 0 | 1 | 0.4 |
| Today, evening (Tonight) | 60 | 0 | **0** | 0 | 1 | 0.3 |
| Goodnight | 60 | 0 | **0** | 0 | 1 | 0.4 |

(A page whose only change is one number a second shows about 2.4 frames a second in this browser; the delve changes its
countdown and its ring once a second.)

## What changed visually

- Left untouched for 15 s, the scene's drift, mist, fog, flames, motes, the button's breath, the map's pool and spark,
  and the delve's tunnel come to a soft stop where they are (they move slowly, so the stop is gentle). Any touch brings
  them back from there. A delve left open keeps its countdown and filling ring, over a still tunnel.
- While moving: the same look. Compared side by side with the old build: Today, the delve, the ring's tip (drawn as
  before). Small differences: the dust in the tunnel is laid over the scene rather than added to itself, and each mote
  repeats its own path rather than starting a new random one.

## What only the phone can tell

The browser here has no graphics chip, so heat and battery can only be judged on the iPhone. Dan's test is in
`CURRENT_STATE.md` (Settings → Battery before and after a day; Today left untouched for 10 minutes; a delve left open).
If the phone still warms while the motion runs, the next candidates are the full-screen grain (blended over the moving
scene) and the four fog layers, which could be baked into fewer layers.

## The deep review's performance work (D-147, D-148; measured 2026-10-02)

What changed: the fact log is no longer watched fact by fact (`$state.raw`); the rules read it once per log, indexed by
type and day, with calendar weeks cached (`core/facts.ts`); a delve's tick moves only its countdown, and every other
screen reads the view by the minute; the Map's sparks rest with the rest of the screen; each fog is one small baked
picture drawn at a third of its size, with no gold fog in the morning; the tunnel's glows and nebula use soft gradients
and masks instead of live blurs. Saves made by the rules' simulator (`tests/review/deep-perf-rules.test.ts`), the same
machine for before and after (shared, so compare within a table).

**The rules alone (Node, median ms; `deep-perf-saves.test.ts`), before → after:**

| Played | Facts | see() | Tap: done | Cold open | Delve second |
|---|---:|---:|---:|---:|---:|
| 1 week | 259 | 1.5 → 1.1 | 5.0 → 3.0 | 3.8 → 2.3 | 1.3 → 0.6 |
| 3 months | 2 605 | 9.5 → 4.2 | 20.4 → 14.6 | 14.6 → 10.5 | 5.8 → 4.6 |
| 6 months | 4 885 | 11.5 → 4.6 | 31.8 → 20.6 | 23.7 → 14.3 | 7.8 → 4.9 |
| 1 year | 9 249 | 13.8 → 6.8 | 59.2 → 33.1 | 38.5 → 22.3 | 16.7 → 7.8 |
| 2 years | 17 977 | 22.2 → 14.1 | 100 → 63.5 | 65.7 → 42.4 | 26.4 → 15.7 |

In the app a delve's second is now only the run's own part (the "delve second" column is the whole view, still used once
a minute).

**The app in the browser (Chromium, 3×; `deep-perf-big.mjs`).** The review's figures (before any fix) → now:

| Played | First screen drawn | Longest task | A Satchel line added | Delve, rested: task ms/s | JS heap |
|---|---:|---:|---:|---:|---:|
| 4 weeks | 472 → 225 ms | 370 → 135 ms | 192 → 48 ms | 40.7 → 9.2 | 7.0 → 5.6 MB |
| 6 months | 1 037 → 301 ms | 2 450 → 232 ms | 955 → 71 ms | 197.9 → 10.1 | 14 → 6.7 MB |
| 1 year | 1 485 → 270 ms | 2 844 → 193 ms | 1 990 → 94 ms | 483.1 → 10.5 | 21.8 → 7.9 MB |
| 2 years | 3 461 → 414 ms | 9 289 → 293 ms | 5 788 → 142 ms | 575.3 → 11.9 | 37.3 → 10.2 MB |

A rested delve now costs about the same whatever the save's age (a fresh save: 9.5 ms/s).

**Screens untouched, on a 6-month save (`deep-perf-frames.mjs`):** Today, Week, Satchel, Map and Daybook all rest at
0 frames a second, 0 repaints, 0.3–0.4 ms of processor a second (the Map was at 111 frames and 144 ms/s before: its
sparks never rested). Moving (the 15 s after a touch) is 60 frames a second everywhere; the Map's moving sparks still
repaint on the main thread while they move (112 ms/s for those 15 s), then rest.

**What only the phone can tell:** the fog and glows' look and cost on the GPU (Instruments → Core Animation), and the
battery over a day (Settings → Battery). CI keeps the rest of it: the battery check runs on a fresh save and on a
4-month one.
