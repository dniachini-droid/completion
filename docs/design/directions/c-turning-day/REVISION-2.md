# C — The Turning Day: revision 2

I worked from `CRITIQUE-2.md` and the coordinator's notes. The stone stays violet, as the player asked. Everything else here is about making warm light *arrive* over the day.

## Blockers
- **B1, the turning day:**
  - **How it's done now:**
    - Amber light is a layer with normal blending (`.pool`), in saturated #f08822-range amber rather than the pale screen-blend gold. That keeps it from going mauve.
    - It has one strength per state of the day, set in `direction.css`: `s-day` gives a trace near the lamp; `s-day2` lights the floor and lower walls; `s-done` lights the salt face to about half its height; `s-evening` fills the lower 55% of the hall.
    - A warm fog bank, now saturated amber, and the lamp's own glow both grow with the same states.
  - **Checked side by side:** I put `morning`, `morning#later`, `complete` and `camp` next to each other in one contact sheet, and the progression reads at thumbnail size.
  - **Index:** the gallery now lists the morning at three moments (`morning`, `#later` and the new `#done`).
- **B2, cut:**
  - **The lintel:** it is now a beam of wall stone with a lit top arris and a dark soffit line. It sits over an opening that has a lit far-jamb reveal and a set-back stone fill with its own joints.
  - **Marks:** every mark, old and new, is an incised groove, meaning a dark stroke with a light lower lip. The new marks are cut as grooves first, and then light fills them.
  - **The recess:** it is a shallow channel in stone colour, with a shadowed top lip and a lit bottom lip. It is no longer a black pill.
  - **When the way opens:** it becomes a passage with depth. There is a side wall that grows warmer the deeper it goes, a lit floor that runs out towards the viewer, gold spilling onto the hall floor, and a dark ceiling. It is no longer a filled rectangle.
  - "wake" and "stone" now sit on the stone, under their marks.
- **B3, map:**
  - There are no warm dots inside the Lamp Hall any more. The cairns only mark the Mouth and Survey Cut paths, and the one warm thing in the hall is the "you are here" lamp.
  - The cup ticks along the hall's edges stay dark.

## Should-fix
- **S1, day complete:**
  - **The face:** it is crystalline rock salt, made of a jittered field of facets under a specular point light from below. A dark vault overhead and flagged floor running into the face give it depth.
  - **The crack:** it is irregular, with a dark interior and a lit lip, and no repeating dots. It starts below the title and ends at knee height above a readable floor line, with a band of fused, glassy salt at its foot.
  - **The light and the reward:** gold rakes up the face in normal blending, and the cairn is now the warmest object on screen. "A cairn on the trail" is in `--ink` over a dark scrim.
- **S2, one hall:**
  - The vault curve is rounder, like the inside of a shell, and is used on every hall screen.
  - The floor is now large, worn flags instead of a tile grid.
  - Stone relief comes from `feDiffuseLighting`.
  - The lamp's shelf is seated in the wall, with its shadow cast on the wall.
  - Morning and camp use a lower vanishing point, set off to the right.
- **S3, satchel:** it is now a soft, slumped messenger bag with a draped flap and a bone toggle. It is lit warm from the lamp on its left, with a violet rim and a soft cast shadow. The strap falls away to the right, away from the flame. There are no outlines on it.
- **S4, satchel:** there is no filled button any more. "Add a line" is a quiet row at the foot of the list, so the lit "done" circle is the brightest thing on the screen.
- **S5, daybook:** the wall is now large, irregular ashlar, out of focus with relief, and the shelf is seated with a shadow. The top back link is gone, so "Close" is the one exit, and "Week 1" uses the same back chevron as everywhere else.
- **S6, morning:** a top scrim sits behind the header. The unpressed capacity words use `--ink-2`, and "from last night's bedtime" is 16px.
- **S7, Begin:** I went with option (b). Begin is cold light with a warm core, meaning "the thing you're about to do". It has an inner lit edge and a soft bloom that breathes. It is no longer a flat pill.
- **S8, record:**
  - The whole sample line is visible without scrolling: five marks at up to 60px. The new mark is lifted up, glows and pulses.
  - "What might it be?" is a real 44px button.
  - The new mark is redrawn as a diamond with a bar, which is unlike *lamp*.
  - The tally is drawn as hand-cut strokes in groups, some crossed, catching light on one edge.
  - The warm band is gone, because nothing in the scene would cast it.
- **S9, map:**
  - Labels are 17.5 units, which is about 16px at 360. They sit on a soft dark halo instead of a stroke.
  - The map moved down so "THE MOUTH" no longer crowds the title.
  - The hall is a tapered, asymmetric outline with a broken edge.
- **S10, map:** the bank's action is now a quiet link, so the only filled button on a work morning is the next job.
- **S11, breather:** the ring blooms and then stays still, with no number. "Done for now" and "Next delve" are equal quiet choices, and "Done for now" comes first.
- **S12, navigation:**
  - `morning#done` is a calm "That's the day. Enough." state, with "To camp" as its action.
  - "Camp" appears in the footer only once the day is done.
  - Day complete and camp both go back to `morning#done`. The map after the lintel goes back to today.

## Nits
- Done:
  - Place names inside sentences are now plain Spectral; only titles are carved.
  - Dust motes stay out of the header band.
  - The delve honours `#t=`, and its arches are blurred further.
  - On camp, "Bedtime" and "Change" are in matching roman type.
  - The index says "Replay (mock-up only)".
- Declined:
  - Hiding "Replay" in the screenshots. It is small and labelled as part of the mock-up on the index.

## Marks
- The lintel's own two marks don't reuse any shape from the record's marks or its ringed name.
- The record's new mark was redrawn so it no longer echoes *lamp*.
- *stone* appears both in the record and in the cut. That is deliberate, because it is the same known mark with the same guess.
