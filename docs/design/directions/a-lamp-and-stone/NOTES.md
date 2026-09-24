# Direction A: Lamp and Stone (notes)

Nine static screens and `index.html`, built to the spec in `../../ART_DIRECTION.md` → "A — Lamp and Stone", using the shared day in `../../PHASE4_RUN.md`. Phone-size pictures are in `shots/`.

## Key design choices
- **The world is the screen.** Every screen is a painted view of a place, done in inline SVG: layered gradients, blurred shapes, turbulence for stone and grain, and dust drifting in the light. Words sit in the darkest part of the painting. There are no cards, boxes, panels or dividers.
- **Light as meaning.** Cold (`--cold` #9fc4d8) is the place: the far door, sealed things, marks not yet known, the unfilled part of the delve ring. Warm (`--warm` #f0a24a) is you: the clay lamp, the one warm button, jobs done, cairns, places you've been, your guesses under the marks.
- **One warm button per screen**, lit like lamp light. It breathes slowly and swells warm when tapped. Everything else you can tap is quiet cold text.
- **Glow is soft points and haze. It is never drawn as lines.** The map joins places with dust (scattered motes), not strokes. Marks are cut grooves with a faint cold haze inside them.
- **Way-finding.** Today, Map, Satchel and Daybook appear as four carved words at the bottom, with a warm point over the current one. Screens you pass through (delve, record, cut, day complete, camp) have a small "‹ Today" at the top left instead.
- **Morning** follows Dan's feedback from the model test: "Thursday · The Lamp Hall" with Map at the top; Low / Normal / High as three quiet words with Normal lit and "from last night's bedtime"; the plain "Ahead" line placed beside the lintel it describes; the teaser under the next job; and the other two jobs with their state on the right. The next job and Begin are still the dominant thing.
- **The delve ring** is a thin warm ring that fills clockwise, with layered haze and a bright bead at its tip. The time left sits inside in Marcellus. The unfilled part is only a faint cold trace. Behind the ring, the lamp's light moves slowly down the passage (no figure), so the expedition visibly goes on. The counter ticks in real time.
- **Cinematic moments** start only once the first frame has painted, so they're seen from the beginning. *Cutting a word* (about 6 s): close on the lintel; two marks are cut in warm light with a spark at the rod; the word locks and the question marks drop from "wake?" and "stone?"; the view crossfades and pulls back to the hall; the wall-cups wake one pair at a time down the hall; the stone under the lintel opens; then the text rises. *Day complete* (about 4 s): the scene fades up and pulls back, the salt face brightens, four cairn stones settle one by one, and "That's the day. Enough." rises. Both screens respect `prefers-reduced-motion`, which shows the settled state at once. For review, `cut.html?t=2.5` (or `complete.html?t=2.5`) holds the sequence at that second.
- **Story constraints kept.** No figure appears anywhere. The wall-cups are dark on every screen except `cut.html`. The clay lamp is always lit.

## The two open questions
1. **Cold and warm balance: warm is you.** The place stays cold everywhere, and warm appears only where Dan has acted or will act. So the amount of warm on screen *is* the record of effort: lit places and cairns on the map, a done job's warm point, warm guesses under cold marks. A good week visibly warms the map. The risk is that on a sparse day the screens look mostly cold. The lamp is always there, so a screen is never without warmth.
2. **Carved letters everywhere.** Cinzel sets names, labels and buttons in small caps. Marcellus, a carved face with lower case, sets every sentence, time and the daybook. The result: it holds up better than expected. Marcellus reads easily at 17–19 px and keeps the carved voice in running text. Its numerals (14:12, 23:00) look good. The weak points are **Cinzel all-caps at small sizes** (the 12.5 px nav, the Low/Normal/High words), which read more slowly than lower case, and **long Cinzel titles**, which wrap to two lines ("Order the cat's medication", "Sort the flat before the visit"). If Dan likes this direction, keep carved letters for everything, but set small labels in Marcellus lower case rather than Cinzel caps.

## Tried and rejected
- **Vault ribs as stroked arches.** They read as a tube of rings. They became soft, displaced "painted" volumes that are warm on the lamp side and cold on the far side.
- **The lintel as a lit slab on its own.** It looked like a hanging sign, which was also the model-test reviewers' complaint. It now sits over a blind doorway with shaded jambs and only stone beneath.
- **Hall cups at eye level.** They made a dashed line along the horizon. They were raised to head height so they recede along the walls.
- **A salt face in streaked noise** read as a waterfall, and then as a cloudy sky. It is now a faceted, vignetted rock face with a crack that thins to nothing at knee height, packed with stones.
- **Cairns as flat ellipses** looked like floating discs. They became irregular stacked pebbles with a warm rim, standing on a lit floor.
- **In the cut, shrinking the close-up into the hall** showed a rectangular card flying away. It is now a crossfade while the hall pulls back.
- **A single stroke for the delve ring** was too thin to read as glow, so it now has three haze layers and a bead.
- **Stroked "lit cups" for jobs done** (the model test's idea) conflicts with the rule that the cups are dark until the word is cut. Done jobs are shown as a warm point of light instead.
- **Invented marks that looked like letters** (X, π, N, E, a warning triangle, a smiley) were redrawn as curves and hooks.

## Known weak spots
- The Salt Gallery is still framed like a window, and it is the flattest painting of the nine.
- The painted scenes are heavy to render: the cut screen takes a few seconds to paint on a laptop, and phones may be slower.
- Only the Lamp Hall label on the map is a link; the other places are not tappable yet.
