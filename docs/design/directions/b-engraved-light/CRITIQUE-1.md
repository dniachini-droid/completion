# B — Engraved Light: critique, round 1

_Reviewer: fresh eyes, harsh brief. Sources: `shots/*.jpg`, new screenshots at 390×844 and 360×780, cut/complete at 300–9000 ms, and the HTML/CSS._

## Verdict

The interface layer is the best thing here: the plates, corner ticks, the carved-caps and Garamond pairing, and the delve ring are exact and feel like an instrument. Destiny's menus are a fair comparison. But the world inside the viewport is a **wireframe tunnel, not a painted place**. Every location is the same set of concentric arches over near-flat blue, so it reads as a sci-fi corridor. It is not a cut-stone hall rounded like a shell, and it fails "painted and atmospheric" (5C). Warm light is meant to be rare, but it sits on a bottom button on seven of nine screens. The layout also breaks badly on a 360-wide phone. The direction is distinct from A and C, and the cold-lines test is worth running, but in its current form it is testing wireframe, not engraving.

| Test | Score |
|---|---|
| 1. Next action obvious | 7/10 |
| 2. Beautiful and intentional | 5/10 |
| 3. No clutter | 7/10 |
| 4. Readable at arm's length | 4/10 |
| 5. Works on a low day | 7/10 |

## Blockers

1. **All screens: layout breaks on a smaller phone (360×780).** Everything is positioned with absolute pixels (`morning.html` `.rest{top:654px}`, `.foot{bottom:18px}`, and so on), so:
   - **morning:** the job rows slide under the Next plate, "I can't start" is printed on top of "Course: one hour", the satchel and daybook icons overlap the rows, and the header wraps to "THE LAMP / HALL".
   - **map:** the chart doesn't scale. "THE SURVEY CU…" and "the head of the sta…" are clipped, and the warm button is cut off the bottom.
   - **record:** the row of seven cells overflows its plate on the right, and the bracket marking the line on the wall disappears.
   - **delve:** "…when the delve is done." collides with Pause.
   - **daybook:** the mini-map's lintel sits on the "Next week" rule.
   - **cut:** "Go through" covers the bottom of the Word plate.

   **Fix:** use a vertical flow layout (flex column; the viewport takes `flex:1` with a min-height, and plates stack beneath). Scale every SVG from its viewBox and don't place labels in fixed pixels over it; put map labels inside the SVG. Add `env(safe-area-inset-bottom)` to every bottom action. Re-shoot every screen at 360×780 and 390×844 before the next round.

2. **All scenes (morning, cut, camp, complete, delve background): the world is drawn as wireframe, not painted stone.** The hall is 8–10 evenly shrinking semicircular arcs with perspective floor lines, which is a railway tunnel or Tron corridor. There are no cut blocks, no joints, no tool marks, and no sense of a rounded shell. The "painted depth behind" is one gradient and some noise. The wall-cups are tiny icon glyphs, not recesses in stone. The Salt Gallery (complete) is the same tunnel with a bright rectangle at the end, so two different places look identical. That breaks the brief (5C painted and atmospheric; Dan said no to 5B flat vector and to 6C's sci-fi feel). It also means the "cold lines" test is being run on the wrong thing: Dan will be judging wireframes, not engraving.

   **Fix:** paint the place first:
   - dark basalt with course joints and cut faces
   - a vault that swells like a shell interior, not a series of hoops
   - real cups as shadowed recesses
   - haze and light falloff toward the far end

   Then **restrict the lines of light to engraved things**: the lintel's marks, the great door's count and blank, a few structural edges picked out like inlay, and the interface. Lines should be cut *into* a painted wall, not *be* the wall. Give each place its own silhouette: the Salt Gallery should be a narrower, taller cut with a crystalline salt face, not the same tube.

3. **Morning, map, delve, all rails: text that matters is below 16 px.**
   - Low / Normal / High: 11.5 px Cinzel caps, `.capacity button`
   - "Ahead": 11 px
   - Map place names: 12 px, `.nl .n`
   - The rail titles and "Today": 12 px
   - "of twenty-five": 10.5 px
   - "from last night's bedtime": 15 px

   Widely spaced small caps are the Destiny look, but at arm's length the capacity words are unreadable, and they are information Dan asked for by name. **Fix:** capacity 15–16 px caps with a clearer selected state (a filled cold pill or a brighter word, not just a 1 px underline). Map place names at least 14 px, with their sub-lines at 16 px. Rail at least 13 px, with "Today" at 14 px. Keep 11–12 px only for purely decorative labels ("ONE LINE", "THE WORD").

## Should fix

4. **Most screens: warm isn't rare any more.** The spec says warm is only the lamp and *the single next action*. In practice there is a full-width warm button on record ("Done reading"), cut, complete, camp, satchel ("Add"), map and daybook ("Back to this week"). Exits and navigation are not "the next action". On morning the Next plate has three warm elements (the NEXT label, the teaser, and Begin) plus the lamp. **Fix:** make exits cold: "Done reading", "Back to this week" (which duplicates "‹ Today" anyway, so delete it), and "Go to the lintel". Keep warm for Begin, Goodnight and perhaps Go through. On morning, make the NEXT label cold and keep warm for the button (and at most the teaser).

5. **Map: the warm call to action fights the morning screen.** The morning screen says the next thing is the cat's medication, and the map's biggest, brightest element says "Go to the lintel". On a low day that is a second demand. **Fix:** open the map with the card on *you are here* (the Lamp Hall, "the lamp is lit"). Tapping the lintel shows its card with a cold "Look closer" button. Only offer to cut the word once it can actually be done today, and never as the warm primary.

6. **Navigation: several links contradict the day.**
   - **delve → complete:** the first of two delves ends on "That's the day. Enough." while the cat's medication and the second delve are still open. Return to morning with the course row showing its progress in words.
   - **cut → "Go through" → map:** this should go to the head of the stair (or an arrival), not the map.
   - **record and camp can't be reached from morning:** camp only through complete, record from nowhere. Add an evening route into camp from morning after about 20:00, and reach the record from the Salt Gallery on the map.

7. **Record: the zoom doesn't match, and the wall looks generated.**
   - The bracketed line on the wall doesn't contain the seven marks shown in the "One line" panel.
   - The ringed name floats alone at the top of the wall instead of sitting in the line.
   - The wall itself is an even grid of random glyphs with runs of `||||`: it reads as filler.
   - Nothing tells you the cells can be tapped.
   - The *hand* mark is reused as a decorative icon above "The same hand cut all of this". That links the mark to the sentence and risks planting an unintended clue (rule 6).

   **Fix:** make the bracketed wall line literally the seven panel marks, with the ring among them. Give the wall uneven line lengths, weathering, and gaps where salt has taken the surface. Show a quiet "tap a mark" state, with one mark's leader line drawing out. Replace the ornament with the divider.

8. **Complete: the salt face and the trail.**
   - The salt face is the brightest, flattest rectangle on screen and reads as a lit screen. The split is a stack of black blocks that looks like a glitch.
   - "Sealed" isn't shown.
   - The trail is six evenly spaced cairns on a baseline. Even with the fade it counts as a row, so it reads as a streak.

   **Fix:** paint the face as a salt crust with depth and a clean dark fissure, top to knee height, closed by something visible (a cap or seal). Show the new cairn alone with the trail line vanishing behind it, one older cairn at most, placed irregularly.

9. **Cut: the payoff is watched, not performed.** Dan does nothing for about 6 seconds and then gets a button. "Cutting a word" should have one input: tap the first mark and then the second, or hold the rod, with the lock and the lamps as the answer. The two marks also still show "wake?" and "stone?" with question marks after the lintel has answered. Decide whether a correct cut confirms them (and show it, e.g. the italic turning upright), or say why not.

10. **Morning: the viewport's two sealed things are unreadable as what they are.** The lintel is a floating plate on a pin line, like a HUD callout. The great door's count ring looks exactly like a clock face, which muddles it with the delve timer. **Fix:** draw the lintel as a stone beam over a real opening, with its two marks and the rod-shaped blank cut into it. Draw the count as a ring of empty notches, not clock ticks.

11. **Delve: too many circles.** Three families of concentric curves compete: the tick ring, the graticule rings and the tunnel arches. The tick lengths also look irregular rather than a clean long mark every 5 minutes. **Fix:** remove the graticule rings, let the tunnel fall to about 30% brightness behind the ring, and make the ticks strictly regular.

12. **Map:**
    - "The great door" is dimmer than every other label and sits on its diamond.
    - "the head of the stair" (not reached) is brighter than its own faint shape.
    - The small cairn glyphs on the routes read as beads or insects at this size.

    **Fix:** give sealed places full-strength labels. Make unreached places the dimmest thing on the map, label included. Use a single small stacked-stone mark per walked route, or none.

13. **Satchel: the icon reads as a modern handbag or padlock.** Draw a flap satchel with a strap across the plate (a side view, buckle and flap), in the same line weight as everything else.

## Nits

- **Rails:** the title is centred in the space left after "‹ Today", not on the screen. On delve, "A DELVE" sits right of the centred "COURSE: ONE HOUR" below it. Centre the title on the screen.
- **Morning:** the done row (Gym) is as bright as the pending row. Let the done job fall back a step (ink-2), with its filled diamond carrying the state.
- **Morning:** the satchel and daybook icons have no labels. On a clean screen that's acceptable, but give them 14 px labels or an accessible name you can see on a long press.
- **Camp:** there's a dead band of about 150 px between the bedtime plate and Goodnight. The lamp is a smooth gradient object that looks more clip-art than painted: add some glaze, a chipped rim, and soot on the ledge.
- **Complete:** "An arrival" in the rail and "ARRIVAL" in the caption duplicate each other. Drop one.
- **Cut:** "The lintel" in the rail and "The lintel answered." duplicate each other. Make the rail "The Lamp Hall".
- **Capacity:** at 360, "from last night's bedtime" presses against "HIGH". Let it wrap under the three words.
- **Map source comment:** "needs a Key and a word" doesn't match the player-facing sample ("a count that has not filled"). Keep the terminology consistent even in comments.

## The single change that would most improve this direction

**Repaint the viewport as a place and keep the light-lines for what is engraved.** Paint the basalt hall with its shell-like vault, cut joints, real cups and haze. Draw only the marks, the lintel, the door's count and the interface as cold lines of light. This one change makes it painted and atmospheric, gives each location its own look, and turns the "cold lines" test into what Dan should actually be judging: fine light cut into dark stone.
