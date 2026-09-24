# B — Engraved Light: critique, round 2

_Reviewer: new eyes, harsher brief. Sources: `shots/*.jpg`; new screenshots at 390×844 and 360×780; cut at 1.5 s, 4 s and 9 s; complete at 0.3 s, 1.5 s, 2.5 s and 4 s; `delve.html#breather` and `map.html#stair`; and the HTML/CSS. Compared at a glance with A and C, only to check that B is distinct from them._

## Verdict

The interface layer is now good. The layout flows at 360, the type is readable, warm is rare, and the plates, corner ticks and Cinzel/Garamond pairing make a real family, clearly distinct from A (words on the painting) and C (a single card in fog). The world inside the frame is still the weak half:
- The Lamp Hall is a squat, evenly banded **tube** (a culvert or a railway tunnel), not a long, high hall rounded like a shell.
- The Salt Gallery is the same tube with a noise-textured rectangle and a lightning-bolt zigzag.
- The delve's world is almost pure black.

Round 1's "paint the place" landed as *blocks drawn on the wireframe*, not as painting. The biggest moment, the cut, also ends on a map whose state contradicts itself. B is the most *usable* of the three and the least *beautiful*.

| Test | Score |
|---|---|
| 1. Next action obvious | 8/10 |
| 2. Beautiful and intentional | 5/10 |
| 3. No clutter | 7/10 |
| 4. Readable at arm's length | 7/10 |
| 5. Works on a low day | 7/10 |

### Round 1: did it land?
- **Blocker 1 (layout at 360): landed.** Nothing overlaps or clips any more, with two exceptions:
  - the daybook's "THE LAMP HALL" touches the plate edge;
  - at 360 the morning lamp is cropped to a sliver under the "Ahead" gradient (see S2).
- **Blocker 2 (painted, not wireframe): partly landed.** There are now blocks and joints, but the structure is still concentric hoops, now banded. This is carried forward as B1.
- **Blocker 3 (type sizes): landed.** Capacity is 15 px with a framed selected state, map names are 15.5 and 17.5 px in the SVG, and the rail is 13–14 px.
- **Should-fix 4 (warm is rare): landed.**
- **Should-fix 5 (map call to action): landed.**
- **Should-fix 6 (navigation): partly landed.** Begin still goes to the wrong screen (S1), and complete is unreachable.
- **Should-fix 7 (record): mostly landed.** The wall still reads as filler (S6).
- **Should-fix 8 (complete): not landed visually.** See B2.
- **Should-fix 9 (the cut is performed): landed** in the mock-up.
- **Should-fix 10 (lintel and door): not landed.** See S3.
- **Should-fix 11 (delve circles): partly landed.** It introduced new problems (B3).
- **Should-fix 12 (map): partly landed** (S4).
- **Should-fix 13 (satchel icon): landed.**

**Story constraint:** outside the cut, the wall-cups are dark everywhere (morning, delve, camp: `cupShade` recesses, cold lip). There are no warm dots along the hall walls, and no figure appears anywhere. **Pass.**

---

## Blockers

**B1. Morning, cut, camp, delve: the Lamp Hall still isn't the place described.**
- **The shape is wrong.** Every view is the same low, round-topped tube: nested superellipse rings of equal-width bands with a flat floor. It reads as a sewer, a culvert or the Tron corridor again with a brick texture. "Long, high, rounded like the inside of a shell" needs **height**: walls rising well above the frame, a vault that curls over and tightens toward the far end, and asymmetry. At the moment it is a pipe you look down.
- **The lintel isn't on a side wall.** On morning and cut, it sits on a free-standing column of blocks projecting into the middle of the corridor, like a door frame standing in the hall. The shared sample says "the lintel, *on the side wall*".
- **The painting is lost at 360.** The morning view shrinks to about 150 px, and the clay lamp (the one warm thing in the world) is covered by the "Ahead" gradient.

**Fix:**
- Redraw the hall as a tall section, with the vault breaking the top of the frame, and drop the camera slightly low.
- Set the lintel *into* the right-hand wall surface: a beam and a recessed opening flush with the courses, in perspective with that wall.
- Break the regular banding with larger, irregular courses, and add a few highlights on the cut faces where the lamp catches them.
- Move "Ahead" off the painting (a line under the viewport, like the map card), or pin the lamp to the viewport's upper-left so no crop can hide it.

**B2. Complete: the Salt Gallery reads as a lit screen with a lightning bolt.**
- At 0.3 s the raw painting shows it plainly: flat, voxel-like wall slabs framing a grey noise rectangle.
- The "fissure" is a zigzag with pale rectangles inside, which reads as a zipper, a film strip or a cartoon crack.
- "Sealed" is a floating italic word with a black sticker outline (`paint-order:stroke`) and a HUD bracket.
- A block of glyphs floats in mid-air on the left wall, with no surface under it.
- There is no salt: no crystal, no bloom, no white crust. It is not recognisably a different place from the hall, only a boxier one.

**Fix:**
- Paint the salt face as a wall of pale, crystalline crust with visible thickness at its edges and blooms spilling onto the floor.
- Make the split a narrow, near-straight dark cleft from the top to about knee height, clearly anchored to the floor line so "knee height" reads, with its lower end closed by a fitted stone.
- Drop the HUD bracket. Let the engraved "sealed" state be a fine line of light cut *across* the cleft (B's own language), with no caption.
- Put the left-wall glyphs *on* a wall plane, in perspective.

**B3. Delve: a second progress bar, and a world you can't see.**
- **The route strip is a bar.** Under the ring, a line with a moving dot is exactly the "task bar" Dan asked not to have (D-028), and it disagrees with the ring. At 14:12 left the ring is 43% full. The traveller sits at 14% (`8+192*p*.5`), while the solid segment runs to 57% regardless.
- **The world is black.** Inside the viewport, everything outside the ring is near-black, so "the expedition still visibly moves in the world around it" isn't true.
- **The cups strike through the numerals.** The row of dark wall-cups runs as a dotted horizontal line straight through "14:09", like a strike-through.

**Fix:**
- Delete the route strip.
- Show movement in the painting: the passage behind the ring at about 40% with visible walls and floor, the drift already coded, and a faint point of light (the lamp you carry) moving a little further down the passage as the ring fills.
- Keep the cups above or below the ring's centre band, or mask them inside the ring.

**B4. Cut → "Go through" lands on a broken, self-contradicting map.** This is the payoff of the biggest moment, and `map.html#stair` shows:
- the lintel still labelled "needs a word";
- the head of the stair still drawn in the dim "not reached" style, while the card says "Open now";
- the reticle's brackets and the dotted route cutting through "the head of the stair" and "needs a word";
- "THE SURVEY CUT" sitting on the Mouth–Hall ladder line (also true in the default state).

Going through a door you have just opened should arrive *somewhere*, not in a diagram.

**Fix:** "Go through" leads to a short arrival view at the head of the stair: a landing, the top of the stair going down into the dark, and one line of copy. It can reuse complete's structure without the day-complete words. If it stays on the map:
- change the lintel's sub-label to "opened" and its node to the reached style;
- draw the stair node and label at full strength with a solid route;
- move the label clear of the reticle.

---

## Should fix

**S1. Morning → Begin opens the Course delve.** The next job is *Order the cat's medication*, but Begin (`morning.html:706`) goes to `delve.html`, titled "COURSE: ONE HOUR". Dan will notice straight away that the app started the wrong thing. **Fix:** put the delve behind the Course row (tap the row), and have Begin lead to a one-step "Doing it" state for the medication (or back to morning with the row marked done). Also, **complete.html is unreachable** except from the gallery. Link it from the breather's "Done for now" when the day's three jobs are done, or from the second delve's end.

**S2. Morning: the lintel and the great door still read as HUD and machinery.**
- The lintel is a glowing plate inside four target-lock brackets, a sci-fi callout (6C, which Dan rejected).
- The great door's "ring of empty notches" at this size reads as a cog or a porthole.

**Fix:**
- Drop the brackets. The lintel's marks and rod-blank should be the *only* light, cut into a stone beam that is the same colour as the wall.
- Draw the door's count as eight to twelve separate small recessed notches spaced round an arch *above* the door, not a disc on its face.

**S3. Lintel marks echo the ringed name (rule 6 risk).** REVISION-1 says the lintel's two marks are "neutral sample shapes". But the second lintel mark (morning and cut, `cut.html:679` `lm2`) is a circle with a tail, the same "Q" shape that sits inside the **ringed name** on the record (and in the wall filler). The first lintel mark (an arch) also repeats the record line's fourth, unknown mark. Two unplanned echoes between the lintel and the tally's name is exactly the kind of accidental clue rule 6 forbids. **Fix:** give the lintel two shapes that appear nowhere else in any of the nine screens, and remove the Q form from the wall filler.

**S4. Map: labels and cairns.**
- "THE SURVEY CUT" is set on the ladder line, about 120 px from its node, so it reads as a label for the ladder.
- The cairns are little stacked-oval glyphs floating *between* routes. They read as Wi-Fi icons.
- The card repeats "you are here / The Lamp Hall", which is already on the chart.
- The dark outline strokes on "you are here" and the other labels look like meme text.

**Fix:**
- Anchor each label to its node (Survey Cut label right-aligned under its node).
- Put one tiny cairn *on* each walked route line, or none.
- Give the default card something new, such as "The lamp is lit. Camp is here." with no heading.
- Replace the black text stroke with a soft dark halo (a blurred shadow), or clear the lines under the labels.

**S5. Delve breather: rest has a countdown, and a warm push back to work.** "4:56 left of 5 minutes" on the same instrument as the delve turns rest into a timed obligation. "It ends by itself" doesn't say *into what* (in the code, nothing happens at zero). On a low day, one delve is a fair stop, but "Done for now" is a quiet link under a glowing "Next delve".

**Fix:**
- No countdown during the breather: an empty, softly breathing ring.
- Replace "It ends by itself" with "Take a breather. The second delve is here when you want it."
- Keep "Next delve" warm, but make "Done for now" a real cold button of equal height, not a link.

**S6. Record: the wall is still filler.**
- The rows are evenly spaced strings of a dozen repeated glyphs, with `||||` runs.
- The salt "crust" is soft grey cloud shapes with white bubble dots. It reads as sky or smoke over the wall, not as salt eating the surface.

**Fix:**
- Vary the line length and spacing.
- Leave larger blank, weathered patches (no glyphs at all) instead of pasted clouds.
- Draw the salt as hard-edged pale crust with crystalline edges.
- Cut the glyph variety to 8–10 shapes with visible repetition, so it reads as a script.

**S7. Camp: the lamp is still clip-art, and the ledge is a kitchen counter.**
- The lamp is a smooth gradient body with a single white gloss streak.
- The "ledge" is a big flat grey trapezoid across half the view, like a worktop.
- The soot mentioned in REVISION-1 isn't visible.
- The hall behind is almost black, so camp has no sense of place.

**Fix:**
- A narrow ledge cut into the wall (a lip with its own shadow).
- On the lamp: matte clay with rough glaze, a visible chip, and the rim catching the flame.
- A dark soot plume on the stone above the flame.
- Enough warm spill to show three or four wall courses and one dark cup next to it.

---

## Nits

- **Daybook:** "THE LAMP HALL" in the mini-map runs into the plate's right edge at 390. There is about 300 px of empty page between the mini-map and "Next week". Pull "Next week" up under the map or enlarge the map.
- **Satchel:** there are about 330 px of dead space between the list and the input. The strap lines leave the header plate at the top edge and look like stray strokes. Stop them at the plate's hairline.
- **Delve:** "left" plus "OF 25 MINUTES" is two captions for one number; keep "left". The five long ticks fall at 72° steps, not at clock positions, so at a glance the ring reads as irregular. Either drop the long ticks or say so with a 0/5/10/15/20 notch only.
- **Morning:** "Thursday · The Lamp Hall" and the three tabs are 13 px caps, legal but the smallest things on the busiest screen. Make the tabs 14 px. At 360, "SATCHEL" touches the daybook icon, so add a column gap.
- **Map:** "the head of the stair" at `#6f8795` × 0.8 opacity is about 3:1. "Dimmest thing on the chart" is right, but it's shared content, so bring it to about 4.5:1 and let the *stair glyph* carry the faintness.
- **Complete:** the reward moment has no warm at all. That's defensible under the spec, but it's the one screen where Dan's "loved the warm button" signal says to let the new cairn take a trace of lamp-warm (the cairn is *his*, not the place's).
- **Cut:** mid-sequence, the hint reads "The word locks." a second before the lock ring appears. Show it on `lock`, not on `c2`.
- **Colour, for Dan's decision, not a fix:** #bfefff ice-cyan is the "cold glowing lines" family Dan said no to in 4B, and he has since said he "really loves the purple light" in C. Keep B's identity (lines, not fog), but consider showing one frame with the line colour pushed toward cold periwinkle (about #c9d6ff) so the lines-versus-colour question isn't confounded.

---

## The single change that would most improve this direction

**Repaint the Lamp Hall once, properly, and reuse it everywhere.** Paint one tall, shell-vaulted hall: high walls that curl over, irregular courses, the lamp's warm catching real cut faces, and the lintel set flush into the side wall. Use that single painting as the plate behind morning, delve (dimmed), cut and camp. B's interface is already the cleanest of the three. What is losing it the comparison is that the world in its frame looks like a tunnel diagram. Fix the one painting and five screens improve at once.
