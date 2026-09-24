# Direction A: Lamp and Stone (notes)

Revised after critique round 1: see `REVISION-1.md` for what changed.

Nine static screens and `index.html`, built to the spec in `../../ART_DIRECTION.md` → "A — Lamp and Stone", using the shared day in `../../PHASE4_RUN.md`. Phone-size pictures are in `shots/`.

## Key design choices
- **The world is the screen.** Every screen is a painted view of a place, done in inline SVG: layered gradients, blurred shapes, turbulence for stone and grain, and dust drifting in the light. Words sit in the darkest part of the painting. There are no cards, boxes, panels or dividers.
- **Light as meaning.** Cold (`--cold` #9fc4d8) is the place: the far door, sealed things, marks not yet known, the unfilled part of the delve ring. Warm (`--warm` #f0a24a) is you: the clay lamp, the one warm button, jobs done, cairns, places you've been, your guesses under the marks.
- **One warm thing to press per screen**: carved capitals in a soft pool of lamplight, with no hard edge. It breathes slowly and swells warm when tapped. Everything else you can tap is quiet cold text.
- **Glow is soft points and haze. It is never drawn as lines.** The map joins places with dust (scattered motes), not strokes. Marks are cut grooves with a faint cold haze inside them.
- **Way-finding.** Today, Map, Satchel and Daybook appear as four Marcellus words at the bottom, with a warm point over the current one. Screens you pass through (delve, record, cut, day complete, camp) have a small "‹ Today" at the top left instead.
- **Morning** follows Dan's feedback from the model test: "Thursday · The Lamp Hall" with Map at the top; Low / Normal / High as three quiet words with Normal lit and "from last night's bedtime"; the plain "Ahead" line placed beside the lintel it describes; the teaser under the next job; and the other two jobs with their state on the right. The next job and Begin are still the dominant thing.
- **The delve ring** is a whole circle: a visible cold track, with a warm fill that grows clockwise (layered haze, and a bright bead at its tip). The time left sits inside in Marcellus. The passage is darkened inside the ring's radius so the ring owns the centre. Behind the ring, the lamp's light moves slowly down the passage (no figure), so the expedition visibly goes on. The counter ticks in real time.
- **Cinematic moments** start only once the first frame has painted, so they're seen from the beginning. *Cutting a word* (about 6 s, after Dan presses "Cut the word"; in the prototype it also starts by itself after a moment): close on the lintel; two marks are cut in warm light with a spark at the rod; the word locks and the question marks drop from "wake?" and "stone?"; the view crossfades and pulls back to the hall; the wall-cups wake one pair at a time down the hall; the stone under the lintel opens on a stair going down; then the text rises. *Day complete* (about 4 s): the scene fades up and pulls back, the salt face brightens, four cairn stones settle one by one, and "That's the day. Enough." rises. Both screens respect `prefers-reduced-motion`, which shows the settled state at once. For review, `cut.html?t=2.5` (or `complete.html?t=2.5`) holds the sequence at that second.
- **Story constraints kept.** No figure appears anywhere. The wall-cups are dark on every screen except `cut.html`. The clay lamp is always lit.

## The two open questions
1. **Cold and warm balance: warm is you.** The place stays cold everywhere, and warm appears only where Dan has acted or will act. So the amount of warm on screen *is* the record of effort: lit places and cairns on the map, a done job's warm point, warm guesses under cold marks. A good week visibly warms the map. The risk is that on a sparse day the screens look mostly cold. The lamp is always there, so a screen is never without warmth.
2. **Carved letters everywhere.** Cinzel capitals set place names and small labels. Marcellus, a carved face with lower case, sets everything else: jobs, sentences, times, the nav, the daybook. After round 1, jobs moved from Cinzel capitals to Marcellus sentence case, because capitals shouted Dan's own errands and read slowly. The result is still fully carved, and it reads well at 16–28 px. The lesson: carved letters can set the whole interface, provided capitals are kept for names.

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
- The Salt Gallery's end wall still reads a little like large brickwork.
- The painted scenes are heavy to render: the cut screen takes a few seconds to paint on a laptop, and phones may be slower.
- On the map, the Mouth, the Survey Cut and the great door are tap targets but have no screen behind them yet.
