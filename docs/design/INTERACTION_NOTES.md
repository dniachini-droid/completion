# Interaction Notes

> How the chosen look (direction D, D-032) moves and responds. Mock-up behaviour in `directions/d-combined/`; spoiler-free. **Draft for Dan's approval**, 2026-09-24.

## Motion principle
**Smooth and quiet every day; cinematic at the big moments only** (taste session, 8B + 8C).
- Everyday: taps answer at once with a short light swell; screens ease in (≈ 200–300 ms, ease-out); the lamp breathes; fog drifts.
- Big moments (cutting a word, an arrival): a few seconds of orchestrated motion, then everything settles and the main button is there. The main button never takes longer than ≈ 2.5 s to appear.
- `prefers-reduced-motion`: every animation jumps to its settled state.

## The morning
One tap to start: **Begin** opens the delve-length dial with 25 minutes already set, so starting still needs no decision. Swap and "I can't start" are one tap away. After day complete, morning shows the day as done ("To camp"), not a next job.

## Setting the delve's length (D-033, Dan's pick: the dial)
- A ring with four stops: **25, 30, 45, 60 minutes**. Drag the glowing handle round, tap a number, or use the keys.
- The ring fills in proportion to the time (30 = half, 60 = full) with violet light; the number ticks up; each stop gives a small visual tick and a gentle settle on release (phone vibration is unreliable on the web, so the visual tick carries the feel).
- Underneath, **where it will take you**, only ever to places you can reach. At 25 it shows the usual destination; longer times reveal further places. Never a warning, never shown as falling short.
- The breather stays 5 minutes. B (the hall slider) and C (the flame) are kept in `delve-set-variants.html` for comparison.

## The delve
The glowing ring fills with the time left in the middle (D-028); the destination is the headline ("Towards the Salt Gallery"); the tunnel and fog move so the world is visibly travelling. The phone can go away; the end must be heard or felt (Phase 7). **In flow:** "Keep going" at the end, and "Skip the breather" during the break, both without loss. **Interrupted (D-036):** a quiet "Step away" keeps the minutes, holds the delve and starts the breather, whose main button becomes "Back to the delve · N min left". If he's gone longer, the morning screen's first offer is "Carry on: <job> · N min left". Dan can go anywhere in the app meanwhile; the hold belongs to the job. Beside it, **"Finish here"** ends the delve with every minute counted; a done-or-not job then asks "Is it done?" (Done / Not yet). Never shown as falling short.

## The map
Routes draw themselves in, then settle to dust. Tap a place: a crosshair closes on it and its description rises in a box underneath. Places you've walked are warm-lit; places seen but not reached are dim; the unknown is dark.

## Reading a record
The line of marks sits in a clean band on the stone and **never moves**. Tap a mark: corner ticks close round it; below, a fixed area says what you know of it. An unknown mark offers a few guesses as boxes; choosing one writes it under the mark with a question mark. Re-reading (later): a minimal before → now.

## Cutting a word (cinematic)
The interface fades away. You tap the marks in order; each is cut into the lintel **on the stone's own plane, in perspective**, with light filling the grooves; the word locks in its floating box; the stone sinks; the wall-cups wake one by one down the hall and the view moves towards the opening. The interface returns with "Go through".

## Day complete (cinematic)
Violet turns to gold from the floor up; "That's the day. Enough." The main action is resting ("Rest here for today"); reading is quiet and secondary.

## Sound (later; Claude's recommendation, Dan deferred)
Room tone and small material sounds (stone, flame, the cut of a mark) everyday; music at arrivals and reveals.
