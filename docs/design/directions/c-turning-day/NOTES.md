# C — The Turning Day: notes

> **Revised in round 1.** See `REVISION-1.md`. The stone now stays violet-lit on every screen, and the day's warmth arrives as gold light inside the scene rather than as a tint over the whole screen. The place's voice is carved Cinzel capitals, and the "card" is now a bank of light. Where the notes below say otherwise, `REVISION-1.md` is current.

Nine static screens, `direction.css` (shared tokens and pieces), `index.html`, and phone-size pictures in `shots/`. Spec: `design/ART_DIRECTION.md` → "C — The Turning Day".

## Key design choices
- **The glow follows the day.** Screens are set to three temperatures (`body.t-cold`, `t-dusk`, `t-warm` in `direction.css`), and the tokens switch with them. Morning, delve, map and cut are cold blue-violet (#8fa8ff). The record and satchel sit at dusk (lilac). Day complete turns gold on screen, and camp and the daybook are fully warm. Warm light appears early only where it has been earned: the clay lamp (always lit), the pip on the job done this morning, and the cairns on the map.
- **Two voices.** The place speaks in carved letters: Forum for place names, record titles and the lintel, and Cinzel small capitals for the odd carved label. Your own life speaks in Spectral: jobs, buttons, times, the ring's number, the satchel and the daybook. The daybook also sets one place name in Forum inside a Spectral sentence ("the lintel"), to show the two voices meeting.
- **One thing at a time.** Every screen is a full-bleed painting with one "card of light" (a frosted, glowing panel) that carries the single action. There is no tab bar, and a small "‹ Today" link goes back to the morning.
- **Painted and atmospheric.** Each painting is SVG: fractal-noise stone, brush displacement, depth-of-field blur, blooms and grain. Two drifting fog layers sit over it on every screen. Static paintings are turned into images once, so heavy filters never re-run while fog, flames and dust move.
- **Motion.** Everyday motion is fog drift, dust motes, a breathing lamp and a bloom where you tap. There are two cinematic moments. In `cut.html` (about 7 s) the marks are cut stroke by stroke, the word locks with a flash, the question marks drop from *wake?* and *stone?*, the wall-cups wake one by one down the hall, the word turns gold and the air warms. In `complete.html` gold rises up the screen from the floor, leaving dusk-violet at the top. Both have an "Again" button to replay, and `#t=<seconds>` freezes a frame for stills. With reduced motion, both show their settled state.
- **The delve ring** is a soft cold ring that fills clockwise and gets brighter towards its leading edge. It carries a glowing tip, a halo that grows as the delve goes on, and fog drifting through its middle. The passage keeps flowing out of its centre, so the expedition visibly moves. Tapping the ring previews the bloom at the end.
- **Constraints kept.** No figure appears on any screen. The wall-cups are dark everywhere except `cut.html`, and the clay lamp is always lit. Marks are invented sample shapes. There are no counts of undone things, no red, no bars, no badges, and no text below 15.5px apart from the index's small numbers.
- **Dan's morning feedback, carried out.** The morning screen has the header "Thursday · The Lamp Hall" with a Map link, the plain "Ahead" sentence, and Low / Normal / High as three quiet words with Normal lit. It keeps the teaser line and shows the other two jobs as rows with their state on the right. The next job's card still dominates.

## The two open questions
- **Cold and warm balance:** let the day decide. Cold means work and the place. Warm is the reward for a finished day, so it grows as the day goes on and fills the screen only at the arrival and camp. The test is whether warmth feels like something earned or like something withheld in the morning.
- **Carved letters everywhere?** No. They are kept for the world: the stone's voice is carved and the app's voice is plain print. Buttons, times and lists are never carved.

## Tried and rejected
- A saturated royal-blue opening for day complete looked like a filter, so it now starts in dark desaturated violet.
- The salt split first read as a zip, then as tape. It is now a dark crack with rubble set in it and a pale edge.
- The first versions of the marks looked like Latin letters (A, P, b, Ÿ) or a signal-strength icon. They were redrawn so none reads as an alphabet.
- The first fog on the map read as daytime clouds. It is now dark, sparse violet wisps, masked to thin along the walked route.
- A capsule-shaped hall on the map looked like a UI pill, so it is now tapered and shell-like with cups along its edges.
- A handbag-style satchel with an upright strap was replaced by an open messenger bag with a slack strap.
- The daybook page started full height, which left dead space. It now sizes to its text.
- Running the fog as animated SVG filters stalled rendering and made the cinematic jump. The paintings are now pre-rendered images, and the cinematics start only after the first paint.

## Weak spots to look at next
- Day complete: the salt face still reads a little like parchment once it has turned gold.
- The satchel and camp props are simpler than the halls.
- The small lintel in the hall painting reads as a sign more than as carved stone.
