# Interaction Notes

> How the chosen look (direction D, D-032) moves and responds. Mock-up behaviour in `directions/d-combined/`; spoiler-free. **Approved by Dan**, 2026-09-24 (D-040).

## Motion principle
**Smooth and quiet every day; cinematic at the big moments only** (taste session, 8B + 8C).
- Everyday: taps answer at once with a short light swell; screens ease in (≈ 200–300 ms, ease-out); the lamp breathes; fog drifts.
- Big moments (cutting a word, an arrival): a few seconds of orchestrated motion, then everything settles and the main button is there. The main button never takes longer than ≈ 2.5 s to appear.
- **Starting is never delayed by motion** (D-038): nothing plays between tapping Begin and the delve starting.
- **Never still (D-041).** Once settled, every screen keeps a little life (`ambient.js`): on scene screens (morning, camp, the arrival, the dial) the painting drifts very slowly, like a camera breathing, with all its light moving together; fog drifts visibly (40 s and 64 s cycles); light motes rise (gold once the day has turned). The map sends a spark along each walked route and pulses "you are here". The stair lights its steps one by one going down, then a slow pulse keeps running down them into the mist. Reading screens (record, satchel, daybook) move only around the words, never the words (UX 17).
- `prefers-reduced-motion`: every animation jumps to its settled state.

## The morning
Starting needs no decision: **Begin** on a short delve job starts a single 25-minute delve at once; a job that isn't a delve has no ring: Begin marks it under way and Done on return plays its steps (D-038). Which jobs are delves is Dan's to set, for any job, and switchable for today with one tap (D-041); a job that takes hours (the Course) opens the run screen already set to **its enough** (the Course's hour: 2 delves of 25), never to its whole planned length, so it is one more tap on Begin (D-047). Swap and "I can't start" are one tap away. After day complete, morning shows the day as done ("To camp"), not a next job, with a quiet "Keep going" that opens the run screen (D-038).

## Setting the delve's length (D-033, Dan's pick: the dial)
- A ring with four stops: **25, 30, 45, 60 minutes**. Drag the glowing handle round, tap a number, or use the keys.
- The ring fills in proportion to the time (30 = half, 60 = full) with violet light; the number ticks up; each stop gives a small visual tick and a gentle settle on release (phone vibration is unreliable on the web, so the visual tick carries the feel).
- Underneath, **the run (D-037)**: one route line. Each delve adds a segment in proportion to its minutes (set the count with − / + or by tapping along the line); the next named place sits at its real distance and lights when the run reaches it; the side chamber sits at its own place on the line, halfway between the last place and the next (D-122), and lights when the run reaches it; one plain line gives the finish time. No debt numbers. During the run, the next delve starts by itself when a breather ends (only inside a run Dan set; after a single delve nothing starts by itself, D-038).
- The breather stays 5 minutes. B (the hall slider) and C (the flame) are kept in `delve-set-variants.html` for comparison.

## The delve
The glowing ring fills with the time left in the middle (D-028); the destination is the headline ("Towards the Salt Gallery"); the tunnel and fog move so the world is visibly travelling. The phone can go away; the end must be heard or felt (Phase 7). **In flow:** "Keep going" at the end; during the breather, "Start it now" starts the next one at once (that is how the breather is skipped), without loss. **Only two ideas, always in the same words:** "Step away" (hold it, I'll be back) and "Finish here" (I'm done, count what I did). Every delve state has at most one main button and one quiet "Finish here"; the Today link at the top is the way back. **Interrupted (D-036):** a quiet "Step away" keeps the minutes, holds the delve and starts the breather, whose main button becomes "Back to the delve · N min left". If he's gone longer, the morning screen's first offer is "Carry on: <job> · N min left". Dan can go anywhere in the app meanwhile; the hold belongs to the job. Beside it, **"Finish here"** ends the delve with every minute counted; a done-or-not job then asks "Is it done?" (Done / Not yet). Never shown as falling short. **"Not yet" keeps the minutes (D-133):** the next delve on that job carries on from them (the set-up says "Carries on from 27 minutes."; the ring shows the job's minutes so far), until it is done. **Today (D-135):** no job is put forward: the big card is "Add a job" (the Satchel's box); every job is in the list; the place's name reads its entry again; the Map's "Read again" opens any place reached. **Ticked off (D-134):** any job can also be finished without a delve: the circle on its row (Today, the Satchel), Tick off on the next job or in the job menu, then "How long did it take?" (15 min to 3 h); those minutes count as delve minutes, and the step screen shows the road line and the count before the story's words. **The errand run (D-139):** "Errand run" in the Satchel (and quietly at the end of Today's list) opens a pick list of the jobs still to do; "Start the run" opens the usual set-up titled "Errand run"; in the delve the errands are a list struck off with a tap; its end asks "What got done?" (strikes still taken) and "Count them"; then each errand struck off is done with its share of the minutes, and its story moment follows, one after another. **Every delve's end shows the road line** (the last place, the side chamber halfway, the next place); at Done, or an end with no question, a flame travels along it to where Dan now is while the ring's sparkle travels round and its minutes count up, once, then still.

## Enough, then more: the Course day (D-047; **superseded by D-121**)
> **D-121 (Dan, 2026-09-27):** a repeating job counts for the minutes it was run for: any run on it that ends with a whole minute or more is the day's session, at the run's end. The gold *enough* mark on the run line, "enough around…" and the mid-run enough moment below are gone; the enough only sets the usual delve length and the plan's room. Kept below for the record.

A job's session counts at its **enough** (`game/PLANNER.md`). For the Course that's its first hour, even on a day planned for 3.
- **Before:** the plan reads "1 h · room for 3"; the run line has a small gold *enough* mark, and a longer run reads "enough around 10:25 · ends 12:25". Never "six delves".
- **At enough:** its own moment: "Course session complete. Enough for today." It counts at once for the rhythm and the day; Today shows the Course done ("enough · more if you like").
- **Then a real choice:** **Continue** and **Back to today** side by side, equal weight; neither is the default. Continue carries on into the day's remaining room as more. If Dan set a longer run himself before Begin, the moment still shows, and the run carries on by itself as he chose (D-037), with Finish here beside it.
- **After:** the line under the job says "more · the third delve". No count of what's left, ever.
- **Finish here** before enough keeps every minute and shows no shortfall; after it, it says "Enough for today."

## The week (planner copy, D-047)
- The forecast is predictive, not a promise: "Current forecast: the Salt Gallery around Thursday"; waypoints are tagged *forecast*. Never "if the plan holds", never "by" for an estimate.
- On a Low day Today says only "A lighter day." Where released jobs went is never narrated on Today.
- A rhythm's editor ends with "Stop repeating" (it ends future sessions only; no confirmation).

## The map
Routes draw themselves in, then settle to dust. Tap a place: a crosshair closes on it and its description rises in a box underneath. Places you've walked are warm-lit; places seen but not reached are dim; the unknown is dark.

**At scale (the map keeps growing: about one named place per working day, D-037).** One map, three zoom levels (pinch, or tap in and out):
1. **Close:** the stretch you're in: today's steps, passages between two named places, small finds, the side chamber halfway between two places (D-122).
2. **Region** (the everyday view, the mock-up above): named places as lights joined by routes; sealed things marked by what they need.
3. **The Site:** the whole descent as a cross-section, regions stacked downward like constellations; walked regions glow, glimpsed ones are dim, the rest is dark. A year's progress at a glance. *Not in the MVP: it arrives with the second region (D-053).*
It always opens centred on where you are, at Region level, with a "back to here" control. *As built (D-092): one map, the region, no closer view; it opens centred on where you are and is dragged around once a region is bigger than the screen; tapping a stretch names its places in the box; pinch comes later if ever needed.* Old routes settle to dust and landmarks stay, so it never becomes a tangle. When a new word or Key arrives, every sealed place it can now open pulses across the map, in old regions too; tap one to go there (going back takes seconds). Waypoints show only for the next 7 days. Region sizes are set in Phase 5: the first region is small for the playable; later ones hold the route Dan's real hours need.

## Reading a record
The line of marks sits in a clean band on the stone and **never moves**. Tap a mark: corner ticks close round it; below, a fixed area says what you know of it. An unknown mark offers a few guesses as boxes; choosing one writes it under the mark with a question mark. Re-reading (later): a minimal before → now.

## Cutting a word (cinematic)
The interface fades away. You tap the marks in order; each is cut into the lintel **on the stone's own plane, in perspective**, with light filling the grooves; the word locks in its floating box; the stone sinks; the wall-cups wake one by one down the hall and the view moves towards the opening. The interface returns with "Go through".

## Day complete (cinematic)
Violet turns to gold from the floor up; "That's the day. Enough." The main action is resting ("Rest here for today"); reading and a quiet "Keep going" are secondary (on a High day it shows the deep route). The day's success is locked in either way (D-038).

## Sound (later; Claude's recommendation, Dan deferred)
Room tone and small material sounds (stone, flame, the cut of a mark) everyday; music at arrivals and reveals.
