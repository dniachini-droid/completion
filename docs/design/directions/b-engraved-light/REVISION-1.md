# B — Engraved Light: revision 1

This answers `CRITIQUE-1.md`. Every screen is re-shot at 390×844 and 360×780.

## What changed across all screens
- **Layout.** Every screen is now a vertical flow (a flex column). The viewport takes the space that's left, and plates stack beneath it. Bottom actions respect `env(safe-area-inset-bottom)`. There are no overlaps, clipping or sideways scroll at 360×780.
- **The world is painted, not wireframed.** A new painter draws the Lamp Hall as dark basalt masonry in perspective:
  - a vault that swells like a shell (a superellipse cross-section)
  - every block its own tone, with dark cut joints and a darker crown
  - flagstones, grain, and haze with light falling off toward the far end
  - the cups as shadowed recesses with a lit lip, dark everywhere except the cut
- **Lines of cold light only for engraved things:** the lintel's marks and rod-blank, the great door's count (a ring of empty notches, no longer clock ticks) and its blank, faint rows of script at hand height, and the interface itself.
- **Type sizes.** Labels are at least 13 px. The rail is 13 px, with "Today" at 14. Capacity is 15 px, with a lit, framed selected state. Map names are 15.5 px and their sub-lines 17.5 px, both drawn inside the SVG so they scale with the chart. Timer captions are at least 13 px.
- **Warm is rare again.** Only the clay lamp and one next action are warm: Begin, Next delve (the breather), Go through and Goodnight. Every exit is cold: Done reading, Done for today, Add, Look closer.
- The rail title is centred on the screen.

## Per screen
- **morning:**
  - The hall is repainted, and the lintel is a stone beam over a recessed, stone-filled opening.
  - The lamp sits on a ledge with soot above it.
  - NEXT and the teaser are now cold; only Begin is warm.
  - "I can't start" sits in the Next plate.
  - A labelled tab row (Satchel · Daybook · Camp) gives the evening route into camp.
  - The done row falls back a step.
  - "from last night's bedtime" wraps under Low / Normal / High.
- **delve:**
  - The graticule rings are gone, and the tunnel sits at about 40% brightness behind the ring.
  - The ticks are strictly regular: 50 marks, a long one every 5 minutes and a medium one every minute.
  - The numerals are inside the SVG, so the ring scales cleanly.
  - When the timer ends, or at `delve.html#breather`, a **breather** appears: "Half the hour", with a warm Next delve and a quiet Done for now. It no longer jumps to day complete.
- **map:**
  - It opens on *you are here*, with no call to action.
  - Tapping a place changes the card. The lintel's card offers a cold "Look closer" that leads to the cut.
  - Sealed places have full-strength labels. The head of the stair is the dimmest thing on the chart, label included.
  - There is one small cairn per walked route.
  - `map.html#stair` shows the state after the lintel opens.
- **record:**
  - The bracketed wall line is exactly the seven panel marks, with the ring among them, centred so it survives any crop.
  - Lines are uneven, and salt crust has taken parts of the surface.
  - The cells can be tapped (hint shown, selection state).
  - The hand-mark ornament is replaced by a divider.
  - "Done reading" is cold.
- **cut:**
  - Dan now performs it: tap *wake?*, then *stone?*. Each tap cuts that mark into the rod. The word locks, the script and lintel light run, the cups wake one by one down the hall, and the stone under the lintel opens onto the stair.
  - The guesses turn upright without "?", because a word that works confirms its marks (the Game Bible's rule). The line reads "The place agreed: wake, stone."
  - The rail reads "The Lamp Hall".
  - "Go through" leads to the map after the lintel opens (`map.html#stair`).
  - The lintel's own two marks are now neutral sample shapes, so they don't echo any known mark.
- **complete:**
  - The Salt Gallery has its own silhouette: taller, narrower and ashlar-cut, with salt blooming on the stones.
  - The salt face is a darker crust with a ragged edge. The fissure is a clean dark split down to knee height, with packed stones inside, marked "sealed".
  - The camera pushes in, the face takes the light, the seam glows, then the words, then the cairn.
  - The trail now shows the new cairn alone, with one older cairn fading off to the side, so there is no row to count.
  - The rail and caption no longer both say "Arrival".
  - "Done for today" is cold, and "Read the tally" leads to the record.
- **camp:**
  - The lamp now has glaze, a chipped rim, and soot on the wall above it.
  - The dead band is gone: the bedtime plate and Goodnight sit directly under the view.
- **satchel:** a side-view flap satchel with a buckle, its strap running across the plate. "Add" is cold.
- **daybook:**
  - The page flows, and the mini-map no longer touches the "Next week" rule.
  - The duplicate "Back to this week" button is removed; "‹ Today" is the exit.

## Declined or partly done
- **"Only offer to cut the word once it can actually be done today":** kept as is. Dan knows the two marks, so the cut is available. The map offers it only as a cold "Look closer" on the lintel's own card.
- **Cut: fully performed.** The prototype still performs the two taps by itself after about 2 seconds with no input, so the moment can be seen in screenshots and by anyone clicking through. In the real game it would wait for Dan.
- **"Return to morning with the course row showing progress in words":** Done for now returns to the single morning mock, which still shows the start of the day. A second morning state wasn't worth a tenth file.
- **Record from the map's Salt Gallery:** the Salt Gallery is only *seen* on the morning map, so its tally can't be read yet. The record is reached from the arrival instead ("Read the tally").
- **Camp in morning's tabs:** it is always visible in the mock. In the app it would appear in the evening.
