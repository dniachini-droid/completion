# C — The Turning Day: critique, round 2

_Reviewer: new, and harsher than round 1. Sources: `shots/*.jpg`; fresh screenshots at 390×844 and 360×780; `morning.html#later`, `delve.html#breather` and `map.html#stair`; frozen frames `cut.html#t=1.8/3.2/4.6` and `complete.html#t=1/3/6`; the HTML and CSS; `ART_DIRECTION.md` (the brief and spec C); `PHASE4_RUN.md`; `ANTI_FEATURES.md`; `DESIGN_PRINCIPLES.md`; `CRITIQUE-1.md`; `REVISION-1.md`. The violet stone was the player's own request, so this critique judges how well it is done, not whether it should be violet._

## Verdict

Revision 1 fixed the mechanics. The layout holds at 360, the two voices can now be told apart, navigation exists, and "Rest here for today" leads on the complete screen. The delve ring and camp are the best screens in the set. But the fix for "tint, don't light" swung too far. The screen is now violet from morning to night, and the gold the direction exists to test is a lamp-sized smudge that is already there at 9am. `morning` and `morning#later` are almost the same picture, and C's camp is less warm than A's. So the one idea C is meant to show Dan, **the day turning from cold to gold**, can't be seen. Without it, C reads as A in purple, with a periwinkle button. The painting has also got weaker at the edges of the set: the satchel is clip-art, the salt face is a lit curtain with a zip, the cut's opening is a flat black rectangle, and the daybook stands in front of a brick wall. And the map shows warm lights inside the Lamp Hall.

| Test | Score |
|---|---|
| 1. Next action obvious | 7/10 |
| 2. Beautiful and intentional | 5/10 |
| 3. No clutter | 7/10 |
| 4. Readable at arm's length | 6/10 |
| 5. Works on a low day | 7/10 |

### Round-1 check
- **Landed:** layout at 360 (blocker 1); a way to reach the satchel, daybook and camp (blocker 2, the morning half); "Rest here" leads on complete (blocker 3); no more sepia or parchment; carved caps against plain Spectral; "Stop" confirms before it consoles; the map's plain wording; "Replay" centred; the stair drawn as steps; daybook contrast.
- **Landed in name only:** complete's salt face and split (blocker 4) and should-fix 11, the cut staged on the lintel; see B2 and S1 below. Also should-fix 4 (C's own composition) and 14 (the painted satchel); see S3 and S5.
- **Not done:** nit 4, freezing the delve clock. The shot shows 14:12, but a fresh load reads 14:02 and keeps running.

## Blockers

**B1. Direction-wide: the "turning day" can't be seen. It is C's whole reason to exist.**
- `morning` (`s-dawn`) and `morning#later` (`s-day2`, warmth .55) are nearly pixel-identical. The only change is a slightly warmer haze in the dark left margin.
- `camp` is the same violet hall with the lamp moved closer. The spec says camp is "fully warm". Here the gold covers perhaps 15% of the frame, less than direction A's camp.
- `complete` ends 80% violet, with a thin beige band at the floor.
- The `.pool` gradient uses `mix-blend-mode: screen` at `rgba(255,196,110,.55)` over violet mid-tones. Screen blending onto a light lilac comes out as a pale pinkish-grey, not gold. That is why the floor on complete and camp reads as mauve.
- **Result:** A and C now differ mainly in hue. Both are a cold hall with a warm lamp on a ledge and a door at the end.
- **Fix:** keep the violet *stone* (Dan's ask), but make the gold own the lower part of the frame as the day goes on:
  - `s-day2`: the floor and the lower third of the walls are lit gold from the lamp, with long warm reflections on the floor.
  - `s-done`: gold light rakes up the salt face to half its height.
  - `s-evening`: the lamp light fills the lower 50–60% of camp. The fog there is amber, and only the vault stays violet.
  - Use `normal` or `soft-light` blending with a saturated amber (#f0a24a range), not `screen` with pale gold.
  - Put `morning` and `morning#later` side by side in the index. The difference should be obvious at thumbnail size. If it isn't, the direction isn't being tested.

**B2. `cut`: the big moment's staging reads as broken geometry.**
- The lintel is a flat, pale slab hanging off the left edge. It has no underside, no jambs and no thickness, and its top edge doesn't meet the vault's perspective.
- When it "opens", the space beneath becomes a flat brown-black rectangle with a hard vertical right edge at about x=245. A floor wedge cuts across its lower left corner. It looks like a missing texture, not a doorway you could walk through.
- The "rod-shaped recess" is a black rounded pill with a hard edge: round 1's "UI capsule" in a new colour.
- The two marks already on the lintel are drawn as thick black marker strokes on top of the stone, not cut into it. So the new glowing strokes don't read as the same act.
- **Fix:**
  - Draw the lintel as a beam that rests on two jambs, with a visible soffit and a shadowed underside.
  - Draw the opening as a lit depth: a floor that runs through it, gold spilling out towards the viewer, and a faint suggestion of the landing beyond. It should not be a filled rectangle.
  - Make the recess a shallow cut channel, with a shadowed top lip and a lit bottom lip, the same colour as the stone.
  - Draw every mark (old and new) as an incised groove: a dark stroke with a 1px light edge below.
  - Keep the cups waking. They are still the best beat in the set.

**B3. `map`: warm lights inside the Lamp Hall.** A column of five warm pale-yellow dots runs down the middle of the hall's glowing shape (at about y 540, 627, 715, 880 and 960 in the 2× shot). The dots on the Mouth path and the Survey Cut path are presumably cairns, but the ones *inside the hall* read as lit lamps along the hall. The story constraint is that the wall-cups are dark on every screen except the cut. At map scale, warm dots in the hall are lit cups.
- **Fix:**
  - Take the warm dots out of the hall shape.
  - If the trail has to run through the hall, draw the cairns there as small cold-grey stacks, or move the trail line along one edge and keep it violet inside the hall.
  - The only warm thing in the hall should be the one "you are here" lamp.
  - Keep the dark cup ticks along the edges.

## Should fix

**S1. `complete`: the salt face and the reward don't land.**
- The face is a flat rectangle of light lilac with dark side vignettes. It reads as a lit curtain or a projection screen with snowflakes.
- The split is a black ribbon with evenly spaced pale dots in it, which still reads as a zip. It starts *above* the face, in the dark ceiling band beside the title.
- There is no scale, so "knee height" can't be read, and the "seal" is a white ellipse that looks like a spotlight on the floor.
- The cairn is lilac-grey, not warm, although the notes say "the cairn glows".
- "A cairn on the trail" (`#f0dcc0`, 16px italic) sits on the pinkish-lit floor at roughly 1.5–2:1. That is the reward line, and it can't be read.
- **Fix:**
  - Give the face depth: a vault overhead, the floor running into it, and crystalline facets with specular glints, not flakes.
  - Make the split an irregular crack with a dark interior and a lit lip, with no repeating dots.
  - Start the split below the title, and end it at a height the floor line makes legible.
  - Draw the seal as a band of fused, glassy salt across its foot.
  - Make the cairn the warmest object on screen.
  - Set the caption in `--ink` over a dark scrim, or place it above the floor light.

**S2. `morning`/`camp`: the hall is not "rounded like the inside of a shell", and `cut` shows a different hall.**
- `morning` and `camp` show a pointed, ribbed Gothic nave with a tiled grid floor: a cathedral or railway tunnel in one-point perspective, the same vanishing point as A.
- `cut` shows a rounded barrel vault of large blocks.
- The lamp's ledge in `morning` is a floating plank that sticks out at an angle the wall doesn't support.
- **Fix:**
  - Pick one hall: the rounded, slightly flattened shell section from `cut` is closer to the brief. Use it on `morning`, `camp` and `satchel`.
  - Drop the tile grid for large worn flags.
  - Seat the ledge into the wall as a cut shelf, with its shadow on the wall.
  - Move the vanishing point off-centre and lower, so C stops sharing A's composition.

**S3. `satchel`: the bag is still clip-art.**
- It is a brown box, the shape of a toaster, with a plastic side-release buckle icon.
- The strap comes out of its top and runs *under the lamp*.
- It is flat-shaded with a hard outline, unlike every other painted object.
- **Fix:**
  - Paint a soft leather messenger bag slumped on the ledge, with the flap draped over and a metal or bone toggle.
  - Light it from the lamp on one side, with a soft cast shadow and the same grain and fog as the hall.
  - Keep the strap away from the flame.

**S4. `satchel`: the brightest thing on the list screen is "Add a line".** On a low day, the most prominent action on a list asks for more. P7 and anti-features: lists are on request, and nothing should pile up.
- **Fix:** give the screen no filled button. Make "Add a line" a quiet link or a faint input row at the foot of the list, and let the lit "done" circle be the one bright thing.

**S5. `daybook`: brick, not cut stone.** Evenly coursed rectangles with dark mortar read as a modern brick wall or a cellar, not the Lamp Hall's blocks. The lamp sits on a thin grey shelf that floats.
- **Fix:** use the Lamp Hall's own large, irregular ashlar, softer and further out of focus behind the text. Seat the shelf into the wall.

**S6. `morning`: the capacity row and its source are hard to read on the painting.**
- "Low" and "High" (`--ink-3` #9da1c4) and "from last night's bedtime" (15px italic, same colour) sit over the brightest part of the vault, at about 1.5–2:1.
- This is part of the agreed morning content. "from" is also below the 16px floor.
- **Fix:** darken the painting behind the header: a top scrim, or crop the lit vault lower. Lift the unpressed words to `--ink-2` and "from last night's bedtime" to 16px.

**S7. `morning`: the "Begin" button is the least designed thing in the direction.**
- It is a flat periwinkle rounded rectangle with dark text: a default web or Material button.
- Dan's clearest signal so far was "I like the warm one" on a warm button, and here the button is cold by thesis.
- Two options:
  - **(a)** Keep it cold, but give it a form of its own: a lit edge, fog inside it, a soft bloom that breathes. It should look like light in the fog, not a form control.
  - **(b)** Let the *action you're about to take* carry a small warm core, a lamp-coloured inner glow on the cold button. That tests whether "warm = what you're about to do" survives inside C's cold morning. Either way, don't ship the flat pill.

**S8. `record`: no clear primary action, and the row doesn't show the sample line.**
- The only affordance is a soft halo behind the middle mark, captioned "tap to guess" in 15px italic.
- The bottom offers two equal quiet links.
- The row shows *stone?*, the new mark and *hand*, then a clipped ring at the right edge, and a clipped fragment at x≈0. *count?* is never visible, and nothing tells you the row scrolls.
- The new mark (a Y on a bar) is almost the same shape as the known *lamp* mark in the daybook (a Y on a bowl), which invites confusion.
- The salt reads as cloudy sky with barcode ticks over it.
- **Fix:**
  - Show the whole sample line at a smaller size (4–5 marks at about 56px), with the new mark lifted and pulsing.
  - Put "What might it be?" in the bank as a real 44px target.
  - Redraw the new mark so it is clearly unlike *lamp*.
  - Paint the tally as irregular hand-cut strokes in groups, catching light on one edge, not as evenly spaced tick lines on fog.

**S9. `map`: labels are under the size floor, and the hall reads as a pill.**
- The Cinzel labels in the SVG are about 14px at 390 and about 13px at 360, with a black stroke that blurs them.
- At 360, "THE MOUTH" crowds "the first region".
- The Lamp Hall is a glowing capsule, like a test tube, which is round 1's "UI pill" complaint again.
- **Fix:**
  - Set labels at 16px or more, and scale the viewBox so they stay there at 360.
  - Replace the stroke with a soft dark halo.
  - Draw the hall as a tapered, asymmetric shell outline with a slightly broken edge.

**S10. `map`: in the morning, the bank's bright primary is "Try a word here".** Opened from the morning screen, the map offers a story puzzle with a full-strength button, next to an unstarted avoided job (P5: aim the help at what's avoided).
- **Fix:** on the map the bank describes the selected place. Make its action a quiet link, and let the only filled button in the app on a work morning be the next job.

**S11. `delve#breather`: the rest looks like another timer.**
- A full, bright ring counts down from 5:00, and "Next delve" is a filled primary under "then it ends by itself".
- It reads as a push to keep going, and it is visually the same object as the work ring.
- **Fix:** show the ring fully bloomed and still, with no countdown number and the passage opening beyond it. Make "Next delve" and "Done for now" equal, quiet choices, or make "Done for now" the default. That matches P2: one delve of the course is not a shortfall.

**S12. Navigation state is wrong in several places.**
- `complete` "‹ Today" returns to the dawn morning, where the cat's medication is still "Next" after the day is done.
- "Camp" is offered from the 9am morning, but camp's copy summarises a finished day.
- `daybook` has both "‹ Today" and "Close" going to the same place.
- **Fix:**
  - `complete` → `morning#later` (or a done-state morning).
  - Hide "Camp" from the footer until the day is complete, or in the morning show camp's state as "Bedtime 23:00" only.
  - `daybook`: keep one exit.

## Nits

1. **`morning` and `daybook`:** "THE LINTEL" set in carved caps at 14.5px inside a 17px Spectral sentence looks like an acronym, with a shadow that smudges. Either set it at the sentence's cap height with less tracking, or keep place names in the sentence as plain Spectral and let only titles be carved.
2. **`morning`:** the left third of the painting is a black smudge with no stone in it. Crop or repaint so the hall fills the frame, or put the text there deliberately with a scrim.
3. **`morning`:** a dust mote sits on "High" at 360 (visible in the shot). Keep motes out of the header band.
4. **`delve`:** the clock runs live, so stills don't match the sample's 14:12. Honour `#t=` here as on the cut.
5. **`delve`:** the concentric arches still sit up and to the right of the ring and compete with it. Blur them further, or crop them out.
6. **`record`:** a warm band glows just above the bank for no reason in the scene (it isn't the lamp or the floor). Remove it, or explain it with a source.
7. **`cut`:** "wake" and "stone" sit in white 17px text half on the stone and half on the black opening. Seat them on the stone, under their marks.
8. **`camp`:** "Change" at 17px with an underline sits apart from 23:00. Fine, but "Bedtime" in italic and "Change" in roman on one line look unplanned. Match the styles.
9. **`daybook`:** "The daybook" is a small italic kicker, while "Week 2" is the title. That's fine, but the ‹ in "‹ Week 1" is in a different face and size from the text beside it.
10. **`complete` and `cut`:** "Replay" at 13.5px in `--ink-3` is tooling, as intended. Keep it out of the gallery screenshots Dan sees, or label the gallery "Replay is for the mock-up only".
11. **`index.html`:** it claims "fills camp at night". It doesn't yet (B1).

## The single change that would most improve this direction

**Let the gold take the floor.** Keep the violet stone Dan loves. Then make the day's warmth *visibly grow* in the lower half of every frame: a trace at dawn, the floor gold-lit by mid-afternoon, and the salt face raked with gold at the arrival. By camp, gold light should fill the lower half of the hall, with only the vault still violet. It must be saturated amber light, not a pale screen blend, and it must be clear at thumbnail size across `morning`, `morning#later`, `complete` and `camp`. Everything else here is polish. Without this, C is A in purple, and Dan can't judge the question C was built to ask.
