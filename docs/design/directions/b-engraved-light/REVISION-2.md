# B — Engraved Light: revision 2

This answers `CRITIQUE-2.md`. Every screen is re-shot at 390×844 and 360×780.

## The painting (B1, B2, and "one painting everywhere")
- **One Lamp Hall, painted once, reused.** A single canvas is cropped per screen:
  - morning: the whole hall, anchored to the floor, with the vault rising out of frame
  - delve: the same hall, dimmed, with no cups
  - cut: the lintel side, with the cups lit
  - camp: the lamp side, with the lamp's light up
- **The shape** is tall, not a tube: near-vertical walls curl into a high vault, and the hall is about twice as high as it is wide. Courses run *along* the hall and converge on one vanishing point, so there are no hoops.
- **One light model** tones every block: cold haze from the far end, and warm from the clay lamp falling off with distance. The lamp catches the cut edges near it.
- **Texture, not outlines:** lit relief (`feDiffuseLighting`) blended over the stone, fading toward the far end; soft joints; shadow where wall meets floor. Filters now run in sRGB, which also removes the green and purple casts the linear blur was adding.
- **The lintel sits in the right-hand wall:**
  - the beam is stone flush with the courses;
  - the opening is a recessed face with its far jamb catching light, closed by fitted stone;
  - only the two marks and the rod-blank carry light.
- **The great door's count** is eleven separate small notches round an arch above the door, not a disc.
- **Wall-cups** are small shadowed recesses with a faint lower lip. They are dark everywhere except the cut, where they wake one by one down the hall.
- **The Salt Gallery (complete):**
  - Its own silhouette: a taller, narrower cut with a lower, flatter vault and salt blooming on the lower courses toward the end.
  - The face is **pale crystalline rock salt**: faceted, with a specular glint and a rough crust standing proud at its edges, and blooms spilling onto the floor.
  - The split runs near-straight from the top to knee height, packed with stones and closed below by a fitted stone.
  - "Sealed" is now a single fine line of light cut across the cleft. The HUD bracket and caption are gone.
  - The tally is cut into the left wall plane.

## Blockers and should-fix
- **B3 delve:**
  - The route strip is gone; the ring is the only progress.
  - The world behind the ring is painted and visible. A faint point of cold light moves down the passage floor as the ring fills.
  - There are no cups in the delve view, so nothing crosses the numerals.
  - A single caption, "left", under the number.
  - 25 plain minute ticks with one start mark.
- **B4 cut → "Go through":** now arrives at a new screen, `stair.html` (the head of the stair): a landing, the steps going down into the dark, and one line of copy. `map.html#stair` is also fixed: the lintel reads "opened", the stair is at full strength, and the labels are clear of the reticle.
- **S1 flow:**
  - **Begin** starts a delve on *Order the cat's medication* (`delve.html#cat`), with an "It's done" link back to morning.
  - Morning then shows the Course as next (`morning.html#cat-done`).
  - The Course row is tappable and opens the Course delve (the shared sample, 14:12 left).
  - When it ends: breather, then Next delve, then the second delve (`#second`). That one ends by itself after 40 seconds and leads to **day complete**, then camp.
  - "Today" from complete and camp leads to `morning.html#done`, a calm "That's the day." state with no next job.
- **S2:** the brackets are gone from the lintel, and the count is an arch of notches above the door.
- **S3:** the lintel has two new mark shapes that appear nowhere else. The wall script uses its own filler set (eight shapes). None of the filler shapes is a record mark, the ring, the cut word or a lintel mark, and the Q form is gone from the filler.
- **S4 map:**
  - Labels sit by their nodes and are no longer cut off.
  - There is one small cairn on each walked route.
  - The default card has no heading: "The lamp is lit. Camp is here."
  - Labels use a soft blurred halo instead of the black outline.
  - "the head of the stair" has readable contrast; the stair glyph carries the faintness.
- **S5 breather:**
  - No countdown: the ring is empty and breathes softly.
  - Copy: "Take a breather. A soft chime when it's over; the second delve is here when you want it."
  - Next delve (warm) and Done for now (cold) are buttons of equal size.
- **S6 record wall:**
  - The filler is a real script: eight shapes, repeated, with uneven line lengths and spacing, and gaps.
  - There are worn patches with no marks at all.
  - Salt is drawn as hard-edged pale crust with crystalline facets, not cloud.
- **S7 camp:**
  - The ledge is a narrow lip cut into the wall, with its own shadow.
  - The lamp is matte clay with a rough glaze and a chip; the rim nearest the flame catches the light.
  - There is a soot plume above the flame.
  - The warm spill shows several wall courses and a dark cup beside it.

## Nits
- **Daybook:** "Next week" sits under the map, and the map labels are larger.
- **Satchel:** the input follows the list, and the strap ends inside the plate.
- **Morning:** tabs are 14 px, with a column gap.
- **Cut:** "The word locks." appears on lock.
- **Complete:** the new cairn has a trace of the lamp's warm.

## Declined
- **Periwinkle line colour:** left for Dan to decide. Recolouring every line, glyph and glow changes the whole direction, not one frame. It's a palette variable (`--light`) plus the SVG strokes, so it can be tried quickly once he chooses.
- **"Go through" to an arrival:** `stair.html` is a tenth screen, added because the critique asked for somewhere to arrive.
- **Morning states:** these are prototype states on the one morning file (`#cat-done`, `#done`), not extra screens.
