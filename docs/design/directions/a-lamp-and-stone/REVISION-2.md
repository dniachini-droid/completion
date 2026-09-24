# Direction A: revision 2

This answers `CRITIQUE-2.md`. I followed the order in the brief: the Lamp Hall first, then the cut, then the Salt Gallery, then everything else. Every screen was checked at 390×844 and 360×780. There is one new file, `morning-violet.html`, which is linked from `index.html`.

## One painting rule
World objects are now built from lit masses and texture rather than outlines:
- Stone gets its relief from `feTurbulence` plus `feDiffuseLighting` (the new `relief` and `reliefFine` filters), blended over the shading.
- The salt uses a point light from below, with diffuse and specular lighting.
- Grooves, recesses, reveals and lips are drawn as filled shapes offset against each other. The only strokes left are the Cut's grooves themselves, and they are cut dark, with light inside.

## Blockers
- **The Lamp Hall** (new `vault2.py`; used by morning, cut and camp):
  - The section is now a tall barrel that is round to slightly pointed. The walls rise almost straight and lean into the crown, with no corner at the floor.
  - The radiating seams are gone. In their place are soft, broken courses that follow the curve at irregular depths, a cold sheen where the walls turn into the vault, and lit relief over the whole surface. On the 360 screenshot you can now see the vault's arch.
  - The cups are recesses at head height: a shadowed inside, a lit lower lip, no outline. They are about 20 px near you and shrink to specks down the hall, and they stay dark.
  - The lintel is a beam in the right wall's own perspective, over a recessed blind doorway whose far-jamb reveal shares the wall's vanishing lines.
  - The great door now has jambs, a lit threshold, cold light spilling round it, and its count cut as notches, not dots.
- **Cut:**
  - The close view is a thick stone beam with lit relief. The blank is a rod-shaped groove cut into it, with shadow inside and a lit lower lip, and no border.
  - "wake?" and "stone?" sit inside the groove as faint warm ghosts, and each fades as its mark is cut. The button is warm from the first frame, and the close view has a "‹ Map" back link.
  - Once settled, the opening sits in the wall plane: dark inside, the far jamb's reveal, and three treads with lamplight on the first two only, falling away into cold air.
  - The woken cups are soft warm glows inside their recesses, not flame icons.
  - The caption's marks are lit grooves, and the caption now reads "The cups woke down the hall".
- **Salt Gallery:**
  - No bricks and no hole. The upper part of the picture is the salt face itself: dark grey-rose rock salt with faint pale veins, lit cold from below with relief and glints.
  - The split runs from the top edge to knee height and narrows to nothing, dark and deep, with packed stones and salt showing at its lips.
  - The cairn is five flat, angular stones of the same cold rock, each with a warm rim on the lamp side.

## Should fix
1. **One warm thing on the morning.** The teaser is now `--cold-hi`, "NEXT" is `--ink-3`, and the capacity and nav dots are ink-white. Warm is left for the lamp, Begin and the done job. Warm motes now drift only within 80 px of the flame, so they can't read as a lit cup.
2. **Violet cold.** This is `morning-violet.html`, a copy of the morning in which the place's light (the far glow, halos, cold dust, and the cold tokens `--cold #a8b4f0` and `--cold-dim #7f8ee0`) leans blue-violet. The stone stays near-neutral and warm still means you. It's linked from the index as a variant.
3. **One painting style.** See the rule above. The lamp has been redrawn in masses: a lower, rounder body, a pinched nozzle, a visible chip on the rim, and soot on the nozzle.
4. **Record:**
   - The background is now dressed stone with soft courses and relief, with a single ring above the tally.
   - The invited mark has a warm caret under it, and the question sits directly beneath it.
5. **Record candidates** are plain warm words with a 1 px warm dot. Only the one you tap swells. *hand* is confirmed, so it is no longer a button, and its label says "Confirmed".
6. **Satchel:**
   - "Add a line" is quiet cold text. The warm action is "Take one into today", which puts an item into the day, where it can move the expedition.
   - The finds are larger and lit warm from below: the tin box has its lid seam and cut strokes, and the rod is round with a highlight.
   - The satchel has a flat flap, and its strap falls to one side.
7. **Arrival:**
   - The warm action is "Read the wall" (the reward), with a quiet "Back to camp" beside it. The back link is "‹ Map".
   - The breather now shows the passage, with the lamp's light resting on the floor and the ring gone.
8. **Flow:**
   - The arrival and the record now lead to camp, never back to a morning that still shows a next job.
   - Back links name where they go: "‹ Map" on the cut and the arrival, "‹ The Salt Gallery" on the record.
   - `delve.html?job=cat` starts at a fresh 25:00, with "It may not need all of it."
9. **Map:**
   - Places are Marcellus sentence case at 17–18 px, with capitals kept for "The Quiet".
   - The stray dark lobes are gone.
   - Places are soft warm or cold points with halos, not drawn lamps.
   - The door's need is shown as cut notches.
10. **Daybook:** the view down the shaft is irregular coursed brick, with the rails running in from beyond the frame. Only the lowest three rungs catch lamplight; the rest are silhouettes.
11. **Readability:**
    - The morning header is 15 px with "Thursday" in `--ink-2` (14.5 px on phones narrower than 370 px, so Map stays on its line).
    - "from last night's bedtime" is 16 px.

## Nits
- Delve: the wall script is cut as grooves with a faint cold light inside.
- Camp:
  - The recess behind the lamp now runs away in perspective and ends before the far end, so the cold far door stays visible.
  - The eyebrow is no longer warm.
- Warm button: the underline slot is now 30% wide and soft.
- "‹ Week one" is now on the left.
- The candidate-meaning mechanic is marked as a proposal in `NOTES.md`.

## Declined or partly done
- **"Go through" at the lintel still opens the map.** No head-of-the-stair screen exists in this run, and the brief allowed only one extra file (the violet variant). The map is where the newly opened way would show.
- **The cut still auto-starts** 1.2 s after the first paint, in this prototype only, so it can be seen without a tap. At 1500 ms it shows its opening state, and it has settled by 9 s.
- **The lintel on the morning** is in perspective now but still reads a little like a plate. The opened doorway in the cut is a clear improvement but is still a simple wall-plane cutaway.
