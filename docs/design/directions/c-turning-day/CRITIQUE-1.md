# C — The Turning Day: critique, round 1

_Reviewer: fresh eyes, harsh brief. Sources: `shots/*.jpg`, new screenshots at 390×844 and 360×780 (with `#t=` frames of `cut` and `complete`), the HTML/CSS, `ART_DIRECTION.md` (brief and spec C), `PHASE4_RUN.md`, `ANTI_FEATURES.md`, `DESIGN_PRINCIPLES.md`._

## Verdict

The morning, delve and camp screens are calm, the hierarchy is clear, and the delve ring does what D-028 asks. The direction's big idea ("the glow follows the day") is currently done as a **colour filter over the whole screen, not as light in the scene**. So cold stone turns periwinkle in the morning and sepia or brown by evening. Day complete and the daybook end up looking like parchment, which is the look Dan rejected. The "two voices" test is barely visible, because Forum and Spectral both read as light serifs. The painting uses the same hall layout as A and B, so what sets C apart comes down to a glass card and a tint. The layout is fixed in pixels and breaks on a 360-wide phone. Navigation is missing: from the morning screen you cannot reach the satchel, the daybook or camp.

| Test | Score |
|---|---|
| 1. Next action obvious | 7/10 |
| 2. Beautiful and intentional | 5/10 |
| 3. No clutter | 7/10 |
| 4. Readable at arm's length | 5/10 |
| 5. Works on a low day | 7/10 |

## Blockers

1. **All screens: the layout breaks at 360×780.** Every element is `position:absolute` at fixed pixel offsets inside `.phone { overflow:hidden }`, so anything that doesn't fit is silently cut off, and the page can't scroll to reach it.
   - `morning`: the Ahead sentence wraps into the Low/Normal/High row, "from last night's bedtime" wraps to two lines, and the *Course: one hour* row disappears below the fold. That breaks the agreed morning content.
   - `satchel`: the "Add a line" button is cut off at the bottom.
   - `record`: *count?* and its mark are clipped at the right edge.
   - `cut`: the word capsule runs off the right edge. The SVG is a fixed `width:390px`.
   - `map`: the labels are in px but the painting is `object-fit:cover`, so labels drift off their places. "The great door / needs a word and a Key" runs into the card, and "The Mouth" touches the edge.
   - `complete`: the cairn and "A cairn on the trail" vanish behind the buttons. This is the screen's reward.
   - `delve`: "You can put the phone away" collides with "the first of two delves".

   **Fix:** lay out top, middle and bottom as a flex column. The top block sits at the top, the card is pinned to the bottom with `bottom: max(24px, env(safe-area-inset-bottom))`, and the middle takes the remaining space. Scale the mark rows and the map from a `viewBox` using `width:100%`, and position map labels in the same coordinate space as the painting (inside the SVG, or in % of a fixed-aspect box). Re-shoot every screen at 360×780 and at 390×844 before calling it done.

2. **Navigation: the satchel, daybook and camp cannot be reached.** `morning.html` links only to `delve` and `map`. The spec says "everything else is a swipe or a tap away", but nothing offers the swipe or the tap. Lists on request (D-020) and the daybook are part of the agreed product.
   **Fix:** add one quiet line under the job rows on the morning screen, such as "Satchel · Daybook", in Spectral at 16px with 44px targets. Alternatively, add a small pull-up handle on the card that shows those two. In the evening, the morning screen's card should become the camp card, so camp is simply what "Today" shows after the day is complete.

3. **`complete`: after "That's the day. Enough." the warm primary button is "Read the tally".** On a low day, the biggest, brightest thing after "enough" asks for more. That contradicts P2, P15 and test 5, and the spec's own claim to be "the calmest of the three on a low day".
   **Fix:** make the primary "Rest here for today", going to camp. Demote "Read the tally" to the quiet link, or offer it through the new place on the map tomorrow.

4. **`complete`: the salt face is sepia parchment with a black lightning bolt down it.** The split is a hard-outlined zigzag full of cobbles. It reads as a sticker or a lightning icon, not a split in stone, and nothing shows it is *sealed*. The gold "tint" (`mix-blend-mode: color`) recolours the entire face to sand or paper, so there is no cold stone left, which breaks the brief. The notes already flag this.
   **Fix:** keep the salt face cold, pale grey-white crystalline stone. Draw the split as a narrow dark seam that runs from the top to about a third of the height (knee height needs scale, so add the floor line and a lamp for reference). Show the seal as a band of fused salt across its foot. Bring the gold in as *light* from below: a warm wash across the floor and the lower third of the face, plus the cairn glowing. Don't recolour the whole painting with `color` blend.

## Should fix

1. **Direction-wide: the temperature is a filter, not light.** `t-cold`, `t-dusk` and `t-warm` retint everything. The morning stone is saturated periwinkle (#8fa8ff everywhere), which reads as a blue night filter, not "dark, cool stone". Camp's stone turns brown, and the arches read as wood. **Fix:** keep the stone a desaturated blue-grey on every screen, and move the temperature into the light sources: the fog colour, the cups, bounce light on the floor, the card's glow and the button. Warm should *arrive in the stone*, not replace it.

2. **Direction-wide: temperature is keyed to the screen, not to the day.** `record` and `satchel` are "dusk" (lilac) whatever the time, so the satchel opened at 9am is lilac. That undermines the idea. **Fix:** derive the temperature from the day's state (before the first job is done, jobs done, day complete, evening). Show the morning screen in two states (just woken; two jobs done) so Dan can actually see the day turning. That is the thing this direction exists to test.

3. **Direction-wide: the two voices can't be told apart.** Forum at 24–36px and Spectral at 17–28px are both light, rounded serifs. "The Lamp Hall" and "Order the cat's medication" look like one family set at two sizes, and nobody will hear "the stone's voice". **Fix:** make the place voice unmistakably carved. Use Cinzel capitals, or Forum with an incised treatment (inner shadow and highlight, wider tracking, a slight stone texture fill), and keep Spectral plain. Test it: cover the labels and ask whether you can tell which lines the stone says.

4. **Direction-wide: the hall painting is the same composition as A and B,** a straight tunnel of arches with a door at the end, the lamp on the right and the lintel on the left. It also isn't the brief's hall. It reads as a railway tunnel of evenly spaced ribs, not "a long high hall rounded like the inside of a shell", and there is no cut stone (no joints, no tool marks, only smooth gradients). **Fix:** repaint the vault as one continuous, taller, slightly flattened shell curve with faint coursing lines. Make the ribs subtle, and use a view from the side (from a lower angle, or three-quarter) so C doesn't share A's and B's vanishing point.

5. **Direction-wide: the glass card and pill button read as a generic iOS "glassmorphism" template.** A frosted rounded rectangle, a gradient pill and a big blurred halo, identical on seven screens, look generated, not designed for this world. **Fix:** keep the single card, but give it C's own form. Make it a pool of light with no hard border, or a softly lit slab edge that belongs to the fog, and drop the 1px inner border and the `saturate(1.25)`. Make the button less glossy: a flat fill of the glow colour with a soft outer bloom, and no white radial highlight.

6. **`morning`: the lintel painted in the hall is a tilted signpost** with a floating Latin-looking glyph (it reads as "AY"). The "Ahead" text also sits right over its post. **Fix:** set the lintel into the wall as a stone beam over a low opening, with the marks cut into it and a visible rod-shaped recess. Move "Ahead" clear of it (or let the text sit where the painting is darkest).

7. **`morning`: the job rows sit in the home-indicator zone.** The Course row is at about y 790–830 of 844. **Fix:** respect the safe-area inset. If the card needs room, tighten the space between "Next" and the teaser rather than pushing rows off the bottom.

8. **`record`: two competing actions and an unclear primary.** "Tap an unread mark to try a guess" (an action on the painting) sits above a big "Read on" button, whose meaning is unclear. "Leave it here for now" goes to `camp.html`, which is the wrong place. **Fix:** decide the one action. Either the unread mark is the primary (make it pulse and make it the only glowing affordance, with "Read on" as a quiet link), or "Read on" is primary and the hint goes. "Leave it here" should return to where you came from.

9. **`record`: the line is small, not "floating large across the fog" as the spec says.** The marks are about 40px in a row that fills the width and clips. The unknown mark's label is a lone "·" that looks like a stray pixel. The blurred background rows read as out-of-focus text or a barcode. **Fix:** show three or four marks at 64–72px with the row scrollable, and give the unknown mark a small "?" or leave its label empty. Make the background tally read as cut strokes in stone, sharper and lower in contrast, not blurred type.

10. **`record`: the small ringed name floating top right, next to the header,** reads as a badge or logo. **Fix:** remove it, or place it in the stone well away from the UI, as part of the painting.

11. **`cut`: the act of cutting is missing.** The "blank" is a dashed UI capsule, the locked word is a gold-outlined pill that looks like a search field or toggle, and it floats in UI space, detached from the tiny lintel in the painting. The subtitle "Cut the word with the rod." is an order, but the player does nothing. **Fix:** stage the cut on the lintel itself, drawn large (crop in close to the beam). Draw the rod-shaped recess in stone, and have the strokes appear *in* it with stone dust. Change the subtitle to a statement ("The rod cuts the word."), or design the player's gesture (tap each mark in order). The cups waking down the hall is the best moment in the set, so keep it.

12. **`cut`: "Go through" goes to `map.html`.** **Fix:** it should go to the new place (the head of the stair), or at least to the hall with the lintel open.

13. **`daybook`: a large, bright beige paper card.** It breaks the dark-stone world (Dan rejected ink and paper, 5A), it glares at night, and there is no painting behind it. The captions `#8a6a4c` on about `#d8c09c` measure about **2.8:1**, which is unreadable at arm's length ("written for you, Sunday night", "lamp", "hand"). **Fix:** set the page on the dark, as warm-lit text on stone, like a page lit by the lamp: warm ink-white on dark with a soft gold glow behind. If a page surface is kept, make it dark and warm (about `#2a1d14`) and keep every caption at 4.5:1 or better.

14. **`satchel`: the bag is flat clip-art.** It has a brown fill, a uniform outline, a white "document" icon inside, and it floats in a purple void on a single line. It is the weakest painting and doesn't belong to the same painter as the halls. At 360 it also overlaps the subtitle. **Fix:** paint it with the same stone, fog and depth-of-field treatment. Rest it on a real ledge in the Lamp Hall by the lamp, lit by it, with no paper icon (the list itself is the contents).

15. **`map`: the fog still reads as daytime cumulus clouds** (light grey puffs on a dark blue sky), so it looks like looking *up*, not down into a place underground. The labels are far from their places ("The Survey Cut" floats above its blob, "The Salt Gallery" sits below its own). **Fix:** make the fog darker than the places, low-contrast and violet-black, with the places the only bright things. Anchor each label within about 12px of its place with the same alignment rule throughout.

16. **`delve`: the arches behind are concentric arcs around the ring,** so the ring gets lost among them and the fill has to fight the painting. The unfilled track is almost as bright as the fill. **Fix:** dim and blur the arches behind the ring (or crop so no arch shares its centre). Drop the empty track to about 15% opacity so only the filled part glows.

## Nits

1. `morning`: "Thursday · The Lamp Hall" mixes Spectral 17 and Forum 24 on one baseline, and the dot sits low. Align the baselines, or set "Thursday" as a small line above the hall name.
2. `morning`: the wall-cups are drawn as small "‿" curves that read like little smiles or emoticons along the walls, here and on `camp` and `cut`. Give them a lip and a shadowed bowl.
3. `delve`: "Every minute done still counts." consoles before anything has gone wrong, which hints that you might stop. Show it only after "Stop for now" is tapped.
4. `delve`: the sample says 14:12 left, the shot shows 14:09 (it's live). Freeze it with `#t=` for stills so the sample matches.
5. `map`: "needs a word and a Key". The capitalised Key is jargon Dan hasn't met on any other screen, and the sample content says "a count that has not filled, and a blank for a word". Match the sample's plain wording.
6. `map`: "the head of the stair" is drawn as stacked horizontal lines that read as a hamburger-menu icon. Draw a few steps going down in perspective.
7. `map`: the lintel is shown twice (ring and label on the map, plus a card with the same title). Drop the label's "needs a word" when the card is open.
8. `record`: the "‹" at the far left of the mark row is half clipped and looks like a glitch. Either make it a real 44px affordance or remove it.
9. `satchel`: the done item's strikethrough text in `--ink-3` on the card is faint. Lift it to `--ink-2` and let the lit circle carry the "done".
10. `camp`: the "‹ Today" back link at night is odd. Use "‹ Back", or no back link (camp *is* today in the evening).
11. `daybook`: "Week 1" sits right next to a huge glowing "Close the book", and the close button outshines the page. Make "Close" quiet and give the page the light.
12. `cut` / `complete`: the "Again" link is mock-up tooling in the chrome. Label it "Replay" and set it apart (smaller, top centre), so it isn't mistaken for a game action.
13. `index.html`: fine. The `.n` numbers are below 15px, which is acceptable only because it's the gallery page.

## The single change that would most improve this direction

**Light the stone; don't tint the screen.** Keep the painting cold blue-grey cut stone on every screen, and make the day's turn happen through light sources inside it: cups waking, gold light pooling on the floor, warm fog, the card's glow. That one change fixes the parchment look on day complete and the daybook, the brown camp, the arbitrary lilac screens and the loss of "cold stone". It also makes the direction's core idea visible as *warmth earned in a cold place*, which is the thing Dan is meant to judge.
