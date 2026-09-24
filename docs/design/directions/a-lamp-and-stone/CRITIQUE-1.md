# Direction A: Lamp and Stone (critique, round 1)

_Reviewed from `shots/`, fresh screenshots at 390×844 and 360×780, the cut screen held at `?t=1` and `?t=2.5`, and the HTML/CSS. Checked against `ART_DIRECTION.md` (brief and spec A), `PHASE4_RUN.md`, `ANTI_FEATURES.md` and `DESIGN_PRINCIPLES.md`._

## Verdict

The idea is right, and it's the clearest of the three: warm is you, and the only warm thing you can press is the next action. Camp and the morning's lower half show that the idea works. The execution is weaker than the idea. The Lamp Hall, which is the backdrop for four screens, still reads as a ribbed railway tunnel. Cold glow barely exists: the "place" is grey murk rather than cold light. The frame is hard-coded to 390×844, so on a smaller phone the navigation, buttons and labels are cut off. The tone is excellent for a low day. Nothing on these screens nags, counts or shouts.

| Test | Score |
|---|---|
| 1. Next action obvious | 7/10: strong on morning, delve, camp and satchel; wrong on record and daybook |
| 2. Beautiful and intentional | 5/10: camp and the map are good; the hall, the salt face, the ladder and the cut's close-up read as generated or vector |
| 3. No clutter | 7/10: the map and the morning's top third are busy; everything else is spare |
| 4. Readable at arm's length | 4/10: breaks at 360 px; 12–13.5 px Cinzel caps carry real information at about 3–4:1 contrast on the painting |
| 5. Works on a low day | 9/10: calm, kind copy, and no debts anywhere |

## Blockers

1. **All screens: the layout breaks on a smaller phone.** `.screen` is fixed at `width:390px; height:844px; overflow:hidden`, and content is positioned by absolute `top:` pixels. At 360×780 the morning's "Map" link and "bedtime" are clipped on the right. The bottom nav disappears on morning, map, satchel and daybook. The record's "Done for now" button is sliced in half, the delve's "The minutes still count." is cut off, and the map's "Survey Cut", "Lintel" and "further down" labels run off the edge. **Fix:** size the screen to `100vw × 100svh`. Anchor the lower blocks (next job, buttons, nav) with `bottom:` rather than `top:`. Place map labels and scene overlays in % or `clamp()`. Let the morning's header row wrap. Re-check every screen at 360×780 and at 430×932 (tall phones currently show a dead band under the 844 px frame).

2. **Morning: the Low / Normal / High row is the least readable thing on the most important screen.** It uses 12 px Cinzel caps in `#71858f` on the mid-tone vault, at about 3–4:1 contrast. The words don't look tappable, and the row overruns the gutter at 390 (it ends 14 px from the edge) and is clipped at 360. Dan asked to see this row. **Fix:** set it in Marcellus, lower case, 16 px, `--ink-2` for the chosen word and `--ink-3` for the others. Put "from last night's bedtime" on its own line beneath, at 15–16 px. Keep the warm point under Normal.

3. **Record: the warm button goes the wrong way.** The screen says "Tap a mark to guess what it means", but the marks aren't buttons (no `<button>`, no hit area). The only warm, dominant control is "Done for now", which is an exit. The one thing you can do there is invisible, and leaving is the lit path. This fails test 1 and A's own rule that warm is the action you're about to take. **Fix:** make each mark in the line a 48 px button. Give the first unguessed mark a faint warm breath as the invitation. Demote "Done for now" to quiet cold text, or to the top-left back link.

4. **Delve: the ring doesn't read as a ring (D-028).** The unfilled track is almost invisible, so what you see is an orange "C" arc. It floats on concentric arch ribs that are themselves rings, so two circular systems fight and the timer loses. Dan asked for "a circular timer that slowly fills up … with glow". **Fix:** make the whole track visible as a faint cold ring (about 2 px with haze, 30–35 % opacity) so the warm fill reads as progress around a closed circle. Inside the ring's radius, blur and darken the arch ribs (a vignette or mask) so the ring owns the centre.

5. **Morning, delve, cut, camp: the Lamp Hall is not the described place.** The brief asks for a long, high hall rounded like the inside of a shell, in cut stone. What's drawn is a set of evenly spaced concentric arch ribs that recede into a tube (the "tube of rings" the notes say was fixed; it wasn't). On the delve it becomes a vortex. The dark wall-cups are small crescents that read as birds or eyebrows. Because four screens use this backdrop, it sets the direction's quality. **Fix:** paint one continuous vault, with a smooth barrel whose curve tightens slightly with distance like a shell's interior. Use soft tool marks or courses in the stone rather than repeated ribs. Light it with a warm pool falling off from the lamp side and a cold glow at the far end. Draw the cups as recesses cut into the wall, each with a lip and a shadow and at irregular spacing, not as dark crescents.

## Should fix

1. **All screens: cold glow is missing.** The brief is "glow everywhere: mostly cold glow". In A, cold is just desaturated darkness. The only cold light is a haze at the far door, and daybook and camp are almost entirely warm or black. **Fix:** give the place its own cold light. Add a cold luminous haze at the far end of every hall view, cold dust in shafts of light, a faint cold light inside cut grooves (the spec says the Cut "glows faintly cold in the stone"), and a cold halo on sealed things (the lintel, the great door, the salt crack). Warm should read as the exception against visible cold light, not against black.

2. **All screens: the warm button is a stock glossy pill.** It has a radial gradient, an inset shadow and a 29 px radius. It reads as a generic web or iOS call to action and contradicts the spec's "no cards and no boxes". C uses the same pill shape, which blurs the difference between the directions. **Fix:** make it look lit rather than drawn. Options: carved letters sitting in a warm pool of light with no hard edge, or a shallow carved slot in the stone that is lit from within. Keep a 56 px hit area and the breathing swell.

3. **Cut: the close-up is a UI widget, not stone.** The blank is a dashed-outline pill, which reads as a form field. The new marks are neon line icons, although A's rule is that the Cut "never draws lines". The lower 55 % of the screen is empty fog. The payoff, the opened stone, is a flat black rectangle with three grey lines. The player also does nothing: it's a cutscene of Dan's own act. **Fix:** draw the blank as a rod-shaped recess cut into the lintel, and draw the marks as grooves filling with warm light from inside. Frame the close-up tighter, with the lintel filling the width. Paint the opening with depth: a stair going down, lit by lamplight from behind you. Give Dan one input, such as a warm "Cut" press or tapping the two marks in order, before the sequence plays.

4. **Complete: the salt face is still a window onto a cloudy sky** (the notes admit it). The crack is a zig-zag full of light-dots and reads as lightning or a zip. **Fix:** set the face into the wall plane with continuous stone around it and no arched frame. Use crystalline, grainy salt, lit cold from below, rather than a sky gradient. Draw the crack as a dark split that narrows and stops at knee height, with rubble packed into it.

5. **Morning, map, satchel, delve: Dan's own jobs set in monumental caps.** "ORDER THE CAT'S MEDICATION", "SORT THE FLAT BEFORE THE VISIT" and "COURSE: ONE HOUR" all wrap or shout, and caps read more slowly at a glance. "THAT'S THE DAY. ENOUGH." is the kindest line in the app and is set like an inscription. **Fix:** keep Cinzel caps for place names only. Set jobs, list titles and the arrival line in Marcellus in sentence case at 24–27 px. This still tests carved letters everywhere, because Marcellus is carved.

6. **Map: the densest screen, and mostly not tappable.** It has seven all-caps labels, each with a sub-label, plus the next job and Begin. Only the Lamp Hall is a link. The "faint" labels ("further down", `#5f7682`) are about 15 px at low contrast on fog. **Fix:** show sub-labels only for "you are here" and the sealed things ("needs a word", "a Key and a word"). Let the lit places speak for themselves. Make every place a ≥44 px target. Raise faint text to at least `--ink-3`.

7. **Daybook: a pointless warm button, and a vector picture.** "Close the book" is the lit primary action on a tab screen whose nav already leads Today. Warm should mean doing something. The ladder is a flat trapezoid with X-shaped diagonals, which makes it the least painted image of the nine. **Fix:** remove the button and let the page end on the "Next week" line. Repaint the ladder as a painted view down the shaft: rungs catching warm light from below, stone walls, and dust.

8. **Satchel: the tick controls are invisible.** They are 5 px dark dots with a 28 % cold ring on a near-black background. "Done" is shown only by greyer text. In the niches, the satchel is a modern handbag with a clasp, one find is a generic "eye" icon, and the other is a generic fantasy crystal. **Fix:** use a visible 14 px cold ring that fills warm when ticked. Draw a worn leather satchel with a flap and strap. Show the sample finds as plain, earthy objects (for example the player-safe tin box or the stone rod from `narrative/LOCATIONS.md`).

9. **Flow: the screens don't connect.** Morning and map "Begin" on *Order the cat's medication* open a delve on *Course: one hour*. The delve has no way on to the arrival. Nothing leads to the cut (the lintel on the map isn't a link). The arrival's "Done for now" jumps straight to 23:00 camp. **Fix:** make Begin open a delve on the named job. Let the delve's end lead to the arrival. Make the map's lintel open the cut. Let "Done for now" on the arrival return to Today.

10. **Morning: the next-job block collides with the painting.** The "NEXT" eyebrow sits on the lamp's shelf, whose edge runs under the text, and the lamp is cropped by the left edge. **Fix:** raise the lamp and shelf clear of the text block, or bring the vignette up so the words sit in true dark as the spec says ("words sit in its darkest part").

11. **Record: noise around the line.** An orphan small ring floats top right. Blurred rows of marks above and below compete with the one line that matters. "stone?" sits 17 px from the screen edge, and "count?" touches it at 360. **Fix:** remove the orphan ring. Drop the neighbouring rows to about half their current opacity. Inset the line to the 24 px gutter.

## Nits

- **Delve:** "A delve · 25 minutes" above "Course: one hour" gives two conflicting durations. Use "Course" as the title and "The first of two delves" beneath.
- **Nav (all tab screens):** the 12.5 px Cinzel caps are the smallest words in the set. Use 14 px, or Marcellus at 16 px.
- **Camp:** the lamp looks like smooth plastic (a gravy boat). Add clay grain, a chipped rim and soot at the nozzle. The shelf floats: seat it into the wall.
- **Cut (settled):** the woken cups are identical small flame icons, like repeated diya emoji. Show them as soft glow inside the recesses, varying in size with distance.
- **Record reached from the arrival:** the back link says "‹ Today". It should return to where you came from ("‹ Salt Gallery").
- **Morning header:** the three-dot map glyph beside "MAP" is ambiguous at arm's length. Use the word alone or a clearer lamp-point cluster.
- **Map:** the four-dot fill beside the great door reads a little like a progress meter. It's within spec ("a count that has not filled"), but keep it quiet and cold, as now, and never numbered.

## The single change that would most improve this direction

**Repaint the Lamp Hall as one continuous shell-like vault with real cold light at its far end, and reuse it everywhere.** It is the background for morning, delve, cut and camp, and it carries A's whole argument: cold is the place, warm is you. Currently the "cold" is only darkness and the hall reads as a tube, so the warm has nothing to push against. With a painted hall that glows cold, the lamp, the Begin button and the lit cups would carry the meaning the spec intends.
