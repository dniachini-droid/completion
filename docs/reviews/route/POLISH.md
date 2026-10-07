# The route, polished (D-155 to D-159) — for Dan

> **Spoiler-free.** No story here; the detail is in the sealed record. The only areas named are the Mouth, the Lamp Hall, the Salt Gallery, the Box Room and the Stair; everything else is "deeper areas".
> Built on branch `claude/route-polish`, from `main` after the route went in (PR #83). **Nothing is merged and nothing is on TestFlight yet.**

_2026-10-06 to 07._

---

## 1. What changed, and what you will notice

You said: "keep going with improvements as suggested." Each of RESULT.md §6's suggestions is built the recommended way:

1. **Evenings are lighter, and her notebook comes down the Stair with you.**
   - From her Day 6 page you take **her notebook with you**. Every later page is read **where you are**, at the end of a job on the way down, not on an evening at camp.
   - An evening now plays its place and **one** more moment at home, not every one that is ready; the rest come on later nights (D-159). In practice most evenings already held one or two, so this trims the heaviest ones rather than changing every night.
   - Evenings keep what belongs at home (the salt wall, the Lamp Hall), and the Box Room hop is gone from them.
   - Nothing about her changes, only where you read her.
   - **Honestly:** the reviewers still feel some pull up to the top in the Stair weeks (§2). They all say it doesn't read as being kept at home.
2. **How and why you came is never hidden.** On an arrival screen, the line saying how you got there and the place's first sentence always show under the title, whatever the text size. Only the rest folds under "Look", as before. A kept guess now quotes its word, in quotation marks.
3. **On the Map, a lock is inside an area, not the area.** An area says "1 lock inside" or "3 locks inside". Only the locked thing's own row says "needs a Key" (or "Use a Key"). Areas you walk through every day no longer read as locked, and the labels wrap so they never run off the screen.
4. **The Map's box numbers the places: 1, 2, 3…** in the order you walked them. I looked at a caption ("In the order you walked") and at numbers side by side on a phone. The numbers were clearer and take no extra line.
5. **Two names in the later weeks** are now introduced on the screen where you first meet them. This was checked against the sealed record. A few other lines the reviewers tripped on now say what they lean on (a reason for going back to a place; a thing you'll later need, shown where you first see it).
6. Smaller things the reviewers found along the way:
   - when a day ends short at a place you already know, its row in the Map's box says "Turned back here", so it doesn't look like a second visit;
   - the small labels under the Map's areas wrap instead of running off the screen, and no longer run into the next area's name;
   - on Today, the "Still locked, further back · needs a Key" heading wraps as one line instead of breaking in two;
   - on an arrival, the guesses and the record links below the words keep to their own space and scroll, rather than slipping under the buttons, even with large text.

## 2. The playthrough verdicts: a fixed panel of three

The built app was played through all 14 story weeks on a phone-sized screen (390 × 844), from a fresh save (75 moves) and from nine saves made under the old order of places, played on for 10 moves each (90 moves). Every screen was captured, with Today's heading afterwards and the Map's box. Each walk, **three fresh reviewers** (none with any part in the work) read the whole journey as first-time players and passed or failed every move. As you asked, **a move counts as failed only if two of the three fail it.** After each walk I fixed what the panel failed, and also the things single reviewers raised that were plainly right, then played it again.

| Walk | Fresh save: passed (two of three) | Old saves: passed (two of three) | Moves at least one reviewer failed |
|---|---|---|---|
| 1 | 75 of 75 | 90 of 90 | fresh: 4 moves; old: 3 moves |
| 2 | 74 of 75 | 90 of 90 | fresh: 4 moves; old: 5 moves |
| 3 | 75 of 75 | 89 of 90 | fresh: 7 moves; old: 2 moves |
| 4 | 75 of 75 | 90 of 90 | fresh: 1 move; old: none |
| 5 | **75 of 75** | **90 of 90** | fresh: 1 move; old: 3 moves |

- Walk 2's failed move: a return in the first weeks whose reason didn't follow from what you had seen. Fixed in the writing.
- Walk 3's failed move: an old save's return to the Lamp Hall with no reason given. Fixed in the writing (its place now says why you go back), and walk 4 passed it.
- Single reviewers' points that were plainly right were fixed too: a cut that relied on symbols not yet shown, a contradiction about her sheets, the Map's labels running into each other, Today's locked heading breaking in two, a Map line caught half-drawn in the capture (not a fault in the app).
- Walk 4's reviewers said the screens' text sometimes sat under the buttons, or under the band where the folded words start. That was a layout slip from the fixes after walk 3, and it is fixed: walk 5 judged that build.
- **Walks 4 and 5 both pass every move under the two-of-three rule.** After walk 5 I made two small fixes that more than one reviewer had raised (no single one was a panel fail): the Map's line to the deepest area now clearly leaves from the area you came through, and one day's-end line no longer credits her notebook with something you saw elsewhere. The rule tests and every flow were run again on that final build (§3).

**The Stair weeks, the thing you asked me to watch.** In every walk, every reviewer said plainly that it does **not** read as being kept at the top: each day goes one place further down. They still describe a pull up the hill: in walks 4 and 5, "slow descent, yes; kept at home, no", and "it reads as going down by day and coming home at night". The evenings now carry less (her notebook comes down with you, one home moment a night), but a camp evening still falls between most days on the Stair, and they carry much of the story. So the goal "reviewers no longer say pulled home" is **not fully met**. The next lever would be fewer evenings in those weeks (for example none on a day that reached a new place). That changes the game's rhythm, so it is your call (§4).

## 3. Tests run, and their results

- **Rule tests: 586 passed, 14 skipped** (the skipped ones are long checks run on demand). New ones on this branch:
  - a save made under the last build's order (D-154) keeps every notebook page its evenings played, and carries on to week 14 from the end of each of weeks 3–6: no stall, no replay, every page once and in order;
  - an evening plays at most one home moment of its own week.
- **Typecheck:** no errors.
- **Every flow in the app's own suite at 390 × 844 and at 360 × 780,** the large-text runs included: **56 of 56 passed** on the final build.
- **Large text on short phones:** the arrival screens with the longest opening lines were measured at 360 × 780, 390 × 844 and 375 × 667 with text at 130%: the buttons stay on screen and the opening line stays readable.
- **Two independent reviews of the branch,** with no part in the work. The first found one blocker (old evenings losing a notebook page) and several things to fix. The second found one blocker (with very large text on a short phone, a long opening line pushed the buttons off the screen). All were fixed.
- **A fact-and-spoiler check** (independent) of every story line written for this branch before the panel walks, against the sealed record; everything it found was fixed. The handful of lines changed during the walks I checked against the sealed record myself, and they are listed there (ids only).

## 4. Unresolved, or for you

- **For you: the Stair weeks' evenings (§2).** If they still feel like a pull home when you play, the next step would be no evening on a day that reached a new place. That's a change to the game's rhythm, so I haven't made it unasked.
- **Things reviewers raised that I left, with reasons:**
  - a few "places" are really things in a room (in one of the deeper areas especially), so that area's Map box reads like a list. Changing that is a design change to the Map, not a fix;
  - the bar on Today says "a side chamber" for the half-way point of a walk, which some read as a real room;
  - one reviewer in walk 4 failed a day's end that rests a little way on from where you are (single reviewer, not a panel fail).
- **Very small phones:** on the smallest iPhone screen (320 × 568) with text at 130%, an arrival's second button can sit partly below the screen. That was true before this branch too, and that size isn't in the check set.
- **Not done, as agreed:** no pull request, no merge, no TestFlight.

