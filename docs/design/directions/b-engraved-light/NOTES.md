# B — Engraved Light: notes

Nine static screens, `direction.css` (shared tokens and pieces), `index.html` (gallery), `shots/` (phone-size pictures). Revised after rounds 1 and 2: see `REVISION-1.md` and `REVISION-2.md`. A tenth screen, `stair.html`, is where "Go through" arrives. Spec: `ART_DIRECTION.md` → "B — Engraved Light".

## Key choices
- **An instrument, not a painting.** The world always sits in a framed **viewport** (hairline border, corner ticks, a graticule scale on one edge). Everything else is a **plate** on a 20 px gutter with 8 px steps. The corner tick is the signature: plates have it, and the one warm button has its own brackets just outside its edge.
- **Painted stone, engraved light.** One Lamp Hall is painted once and cropped per screen: a tall shell vault, courses running down the hall to one vanishing point, every block toned by one light model (cold haze from the far end, warm from the lamp), with lit relief texture. The Salt Gallery is its own narrower cut, ending in pale crystalline rock salt. Lines of cold light (#bfefff) are kept for what is *engraved*: marks, the lintel, the door's count, the script at hand height, and the interface. The light is cut into the stone; it is never the wall itself.
- **Warm is rare.** Only the clay lamp and one next action are warm (Begin, Next delve, Go through, Goodnight). Exits are cold. The delve screen has no warm at all: while you work, the place is cold. The wall cups are dark everywhere except the cut, where they wake one by one down the hall. That's the one time warm fills a screen, so it lands.
- **Type.** Cinzel, small and widely spaced, for place names, labels, titles, buttons and numerals (14:12, 23:00). EB Garamond for every sentence, list item and guess. Guesses are italic with a question mark; confirmed marks are upright.
- **Records** are an engraved panel of cells. The line being read is bracketed on the wall and "zoomed" to the panel on dotted lines. Guesses hang under their marks on leader lines, like annotations.
- **Map** is a star chart: graticule rings around the Lamp Hall, straight engraved routes, the ladder drawn as rungs, and cairns beside walked routes (no counts). Nodes show their state by shape: reached (bright point), seen (open ring), sealed by what they need (a rod-blank for a word; a lozenge with a count ring and a rod-blank for both), and not reached (a faint stair). The Lamp Hall's node holds the only warm point: the lamp.
- **Delve ring.** It has 125 fine ticks (a long one each 5 minutes). A line of cold light travels round clockwise, and the ticks it has passed light up. The time left is in carved numerals. The passage behind drifts slowly forward, dust moves, and a small point of light advances along the route strip beneath.
- **Motion.** Everyday screens: plates arrive on one exact curve (0.8 s, staggered). Cinematic: **cut** is performed. Dan taps the first mark, then the second; the word locks; the light runs along every engraved line in the hall at once; the lamps wake in order down the hall; the stone under the lintel opens onto the stair. The guesses turn upright once the place has agreed. **Complete** (about 5 s): the camera pushes into the Salt Gallery, the salt face takes the light, the seam glows and is marked "sealed", then "That's the day. Enough." and a single cairn stacks itself on the trail. All motion respects `prefers-reduced-motion` (it jumps to the settled state).

## The two open questions
- **Cold and warm balance:** warm as rare and precious. It tests "glow everywhere, mostly cold" at its purest. The risk to watch is that the screens feel cold on a low day. The lamp and the warm button carry the kindness. If Dan finds it too cold, the first thing to warm is the done-job marker on the morning screen, not the world.
- **Carved letters:** a companion face. Carved for what you *name or press*; book serif for what you *read*. In practice the carved face does the "Destiny menu" job (crisp, small, spaced), and Garamond keeps long lines readable at arm's length.
- **Cold lines:** used throughout, done precisely (thin, glowing, geometric, over painted stone). This should show whether his "no" to 4B was about lines as such, or about lines drawn crudely.

## Tried and rejected
- A heavy capacity chip (a reviewer's dislike on X). Low / Normal / High are three quiet words in a row, with Normal lit by a hairline (Dan asked for Y's information).
- A long leader line across the hall floor to the "Ahead" note: it cut the painting in half. It is now a short drop from the lintel.
- Corner brackets on every button: too many ticks. Only the warm button keeps them.
- Lamp glow at full reach on the camp screen: it washed the whole hall brown and broke "warm is rare". It is now a local pool on the ledge and the near wall.
- A "brushed" fibre texture on the daybook: it read as metal. It is now a fine, even grain with faint ruled lines and a double margin rule, so it reads as paper, not stone.
- Cairns as an even row on day complete: that read as a countable streak. Older cairns now fade into the distance.
