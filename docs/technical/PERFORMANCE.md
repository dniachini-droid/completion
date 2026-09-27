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
