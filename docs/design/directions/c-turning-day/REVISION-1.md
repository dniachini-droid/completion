# C — The Turning Day: revision 1

I worked from `CRITIQUE-1.md` and the coordinator's notes, including Dan's own reaction: "I really love the purple light. That looks awesome."

## Across all screens
- **The stone stays violet on every screen, and the warmth is light inside the scene** instead of a colour wash over the whole screen. The purple is kept because Dan asked for it. That reverses the reviewer's note about blue-grey stone.
  - The day's warmth appears as gold light: it pools on the floor, it forms a warm fog bank low in the scene, the lamp's glow spreads, and a warm bloom shows in the card.
  - The earlier `mix-blend-mode: color` wash is gone, so nothing turns brown, sepia or parchment.
- **The light follows the state of the day, not which screen you are on.** There are five states in `direction.css`: `s-dawn`, `s-day`, `s-day2`, `s-done` and `s-evening`. Each state sets how much warmth shows and whether the glow is violet or gold.
  - `morning.html#later` shows the same morning after two jobs, with the lamp's gold spread further into the hall.
- **The two voices are now clearly different.**
  - The place speaks in Cinzel capitals, cut into the stone: wide letter spacing with an inner shadow and a highlight.
  - Dan's own life speaks in Spectral, in sentence case. That covers jobs, buttons, times, the satchel and the daybook.
- **C now has its own compositions.**
  - A new generator draws the Lamp Hall as coursed, cut-stone blocks under a tall shell vault, seen three-quarter along the left wall.
  - The screens use close, low views: the lintel beam in close-up, the lamp in the foreground at camp, the salt face seen from low down, and a straight-on stone wall for the daybook.
- **The card is now a "bank of light".** It is a fog bank pinned to the bottom of the screen, with no border and no frosted glass. Buttons are a flat fill of the glow colour with a soft bloom, and no gloss.
- **Layout holds at 390×844 and at 360×780.** Every screen is a flex column: header at the top, a flexible middle, and the bank at the bottom with the safe-area inset. Anything that has to line up with the painting sits inside the painting's own SVG coordinates: the map labels, and the marks and captions on the lintel. All nine screens were checked at both sizes.
- **Wall-cups** are drawn with a lip and a shadowed bowl. They stay dark everywhere except the cut. I redrew the lintel's own two sample marks after they read as a letter, a Wi-Fi symbol and a frowning face.

## Per screen
- **Morning:**
  - "Thursday" sits on a small line above the hall name, with the Map link beside it.
  - The Ahead line has moved clear of the painting's lintel.
  - A quiet "Satchel · Daybook · Camp" line under the job rows gives the light way to reach the other screens.
  - Nothing sits in the home-indicator zone at the bottom of the screen.
- **Delve:**
  - The passage now flows from a vanishing point offset from the ring, and is dimmed and blurred behind it.
  - The empty track is at 15%, and the ring scales with the screen.
  - "Every minute done still counts" appears only after you tap Stop, as a confirmation.
  - The first delve ends in a breather with "Next delve" and "Done for now". The second (`#second`) leads on to day complete.
- **Map:**
  - Labels are carved capitals placed in the painting's coordinates, so they stay next to their places.
  - The fog is darker and sparser, and the places are the bright things.
  - The head of the stair is now drawn as steps going down.
  - The great door's label uses the sample's wording: "needs a word, and a count to fill".
  - `#stair` is the map after "Go through" on the cut screen.
- **Record:**
  - The one new mark glows and pulses, and is the only live affordance. Tapping it opens a small tray of guesses. "Next line" and "Leave it for now" are quiet links.
  - The marks are 76px, in one row that scrolls sideways inside itself.
  - The tally is cut sharp into the salt at low contrast.
  - The floating ring badge is gone.
  - "Back" returns to day complete in its finished state.
- **Cut:**
  - The cut happens on the lintel itself, drawn large. Each stroke is drawn into the rod-shaped recess in stone, with stone dust falling.
  - The lock flashes, the question marks drop, and the cups wake one by one down the hall. The opening goes dark, with gold spilling onto the floor.
  - The subtitle is now a statement: "The rod cuts the word."
  - "Go through" goes to `map.html#stair`. "Replay" is small and centred at the top.
- **Day complete:**
  - The salt face stays violet-grey crystal.
  - The split is a narrow dark seam from the top to knee height, packed with rubble, with fused salt at its foot above the floor line.
  - The gold rises as light from the floor, and the cairn glows.
  - The brightest action is "Rest here for today", which goes to camp. "Read the tally" is a quiet link.
- **Camp:** the lamp is close and low in the foreground. Its gold is widest here, in a hall that is still violet. The back link is now "‹ Back".
- **Satchel:**
  - The bag is repainted, resting on a ledge beside the lit lamp, with the hall out of focus behind it. There is no paper icon.
  - The done item's text is lifted to the brighter secondary colour.
- **Daybook:**
  - There is no paper sheet any more. The page is lamp-lit text set on a wall of cut stone, with the clay lamp below it.
  - Captions are warm ink on dark, above 4.5:1 contrast.
  - "Close" is a quiet link.

## Declined or partly done
- **Blue-grey stone (should-fix 1):** reversed. Dan asked to keep the purple, so the stone stays violet and only the light sources carry the temperature.
- **Camp becoming the "Today" screen in the evening (blocker 2, second half):** not done. The morning screen reaches camp through the quiet link instead. Making the time of day switch the screen needs app logic, which belongs to a later phase.
- **The player's own gesture for cutting (tapping each mark in order):** left for later. The cut plays as a ritual, and the subtitle now describes what happens rather than giving an order.
