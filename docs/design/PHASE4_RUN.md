# Phase 4 — The long visual run: working brief

> The operating brief for the unattended run in `PHASE4_PLAN.md` Part 2 (D-022, D-027). **Spoiler-free: Dan may read this.**
> Started 2026-09-23 23:36 UTC (Thursday 24 Sep, 9:36 am Sydney), on branch `claude/phase-4-long-visual-run-08v7pn`.

## Minimum run time

Dan wants 6–8 hours of real depth. **Do not treat the work as finished, and do not delete the keep-alive Routine, before 05:45 UTC on 2026-09-24** (3:45 pm Thursday, Sydney; check with `date -u`). Hard stop around 07:45 UTC (5:45 pm Sydney). Dan is in Sydney: give him times in Sydney time.

## Stages (commit and push after each)

0. **Setup.** This brief, the shared screen content below, vendored fonts (`fonts/`), a phone-size screenshot script, a keep-alive Routine.
1. **Model comparison (D-027).** The same screen (the morning screen) built from the same prompt by the default model and by Fable. Three blind reviewers judge the pair from phone-size screenshots. The winner builds the rest of the run. Recorded in `DECISIONS.md`.
2. **Three directions in words**, in `ART_DIRECTION.md` → "Directions": mood, materiality, typography, world presentation, UI philosophy, map, collection, animation, how records are shown. Each takes a different position on the two open questions (cold/warm balance; carved letters everywhere or a companion face).
3. **Screens.** Nine per direction (below), static HTML, phone first.
4. **Critique round 1.** Fresh reviewers per direction, from screenshots and the HTML, against the five tests. Then revise.
5. **Critique round 2.** New reviewers, same tests, harsher. Then revise.
6. **Handover.** A gallery page for Dan's phone; the morning briefing in `CURRENT_STATE.md`.
7. **If time remains:** a third round on the weakest screens; the big cinematic moment (cutting a word) as a motion study in each direction; a first-draft token sheet for Claude's pick.

## The nine screens

1. `morning.html` — the morning screen
2. `delve.html` — a delve running
3. `map.html` — the map
4. `record.html` — reading a record, with marks and guesses
5. `cut.html` — cutting a word
6. `complete.html` — day complete (an arrival)
7. `camp.html` — camp (the evening close)
8. `satchel.html` — the satchel
9. `daybook.html` — a daybook page

Files: `design/directions/<a|b|c>-<slug>/`, each with an `index.html` linking its nine screens. Model test: `design/model-test/`.

## The five tests (every critique round)

1. **The next action is obvious** within two seconds of opening (rule 16, P1).
2. **Beautiful and intentional**: it looks designed, not generated; nothing generic-fantasy.
3. **No clutter**: nothing on screen that doesn't earn its place.
4. **Readable on a phone at arm's length**: size, contrast, tap targets.
5. **Works on a low day**: calm, no pressure, nothing that reads as a debt.

Plus two hard checks: the brief (`ART_DIRECTION.md` → "Brief for the directions") and the anti-features (no red, no counts, no badges, no streak numbers, no XP/levels/bars, no guilt language, no cheerleading).

## Rules for every screen

- **Static HTML and CSS, one file per screen**, small inline JS only for motion. No frameworks, no build step, no network: fonts come from `../../fonts/fonts.css`, all imagery is CSS, SVG or canvas drawn in the file. Designed at 390 × 844 (a phone); must not scroll sideways.
- **Player-safe content only** (D-015): the sample content below, the game bible, terminology and the first region. **No figure appears on any screen.** Marks shown are invented sample shapes, not the game's real marks.
- The app's voice is plain, warm English: no fantasy-speak, no "the Ancients", no capitalised abstractions, no ellipses for portent (TERMINOLOGY). Dark world, kind app (P14).

## Shared sample content (all three directions use the same day)

**Every mark shape, mark meaning and record line here is an invented sample for the mock-ups. None of it is the game's real script or records.**

- **The day:** a Thursday in week 3. Capacity **Normal** (set from last night's bedtime, 23:10). Three main jobs, one done.
- **Main jobs:**
  1. *Gym, then the sauna* — done this morning.
  2. **Order the cat's medication** — the suggested next job (an avoided job: it will turn its step into a find).
  3. *Course: one hour* (two delves).
  - Swap options: *Spanish: an hour of study*, *Sort the post pile*.
- **Where you stand:** the Lamp Hall. The clay lamp is lit on its ledge. The cups along the walls are dark.
- **Ahead, seen and sealed:** the lintel on the side wall (two marks beside a rod-shaped blank: it needs a word); the great door at the far end (a count that has not filled, and a blank for a word: it needs both).
- **The map, first region:** the Mouth (the capped shaft, the ladder), the Lamp Hall (you are here), the Salt Gallery, the Survey Cut, the lintel, the great door, and beyond the lintel the head of the stair (not yet reached, shown as a faint shape).
- **Marks Dan knows (samples):** five, two confirmed, three guessed. Sample guesses: *lamp* (confirmed), *hand* (confirmed), *stone?*, *count?*, *wake?*.
- **A record:** the long tally in the Salt Gallery, in one hand. Show one line of it as a row of marks: some read (with Dan's guess beneath, guesses carrying a question mark), one ringed name (unreadable, recognised), some unknown. A sample rendering of what's readable: "— *stone?* … *hand* … [a ring] … *count?* —". Beside it, one plain-English line from the app: "The same hand cut all of this."
- **Cutting a word:** at the lintel. Two known marks, *wake?* and *stone?*, cut in order with the rod; the word locks; the lintel answers. (Sample only.)
- **Day complete (arrival):** the Salt Gallery, first time. The salt face split from the top to knee height, and sealed. "That's the day. Enough." A cairn is added to the trail.
- **Camp:** by the lamp in the Lamp Hall. Bedtime set for 23:00. What's waiting in the morning if you're in bed by then: something small (not named).
- **The satchel:** "Sort the flat before the visit": *hoover the hall*, *clear the desk*, *wash the bedding*, *take the bottles out*, *fix the shelf bracket*, and more folded away. No counts shown.
- **A delve:** 25 minutes, 14:12 left, on *Course: one hour* (the first of two). **Dan's ask (D-028): a circular ring that slowly fills with glow as time passes, with the number (time left) inside it; not a bar.** Each direction draws the ring its own way. The expedition still visibly moves in the world around it; the phone can be put away.
- **A daybook page (week 2, plain English, written for Dan):** "Gym four times, the sauna after each. The Spanish lesson booked for next Tuesday. Two hours on the course. You went down the ladder and found the lamp already lit. The wall taught you two marks. Next week: the lintel on the side wall is still waiting for a word." No numbers-as-scores, no charts.

## Progress log (Sydney time, 24 Sep)
- 9:36 am — Setup done; keep-alive Routine hourly.
- 9:48 am — Stage 1 done: model comparison, reviewers 2–1 for the default model (D-029, provisional until Dan picks). Dan asked for the delve timer as a glowing ring with the number inside (D-028).
- 9:50 am — Stage 2 done: three directions written (`ART_DIRECTION.md`). Stage 3 started: three builders working in parallel, one per direction.
