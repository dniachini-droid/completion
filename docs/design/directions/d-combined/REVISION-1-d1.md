# D — Revision 1, part 1: the hall, the cut, the stair, the shared rules

_Answers `CRITIQUE-1.md`, for `direction.css`, the new `hall.js`, `morning.html`, `cut.html`, `camp.html` and `stair.html`. The other screens are revised in part 2 (`REVISION-1-d2.md`)._

## The one real hall (`hall.js`)
The critique's main point was "paint one real hall and use it everywhere". `hall.js` paints the Lamp Hall pixel by pixel into any element, from a camera position you choose. The hall is long and high, shaped like the inside of a shell: the walls lean out from the floor, swell, and curve without a break into a slightly pointed vault about 2.8 times taller than it is wide. It is built from large ashlar blocks (1.3 m courses, 2.9 m long). The joints wander a little and the blocks are bevelled, with chisel texture, water streaks and faces slightly out of true, so a point light picks out the relief. Arched wall-cup recesses, in true perspective, run a third of the way up both walls, with a small dark clay cup on each sill. The heavy lintel beam stands proud of the left wall over a sealed blank. The clay lamp sits on a stone ledge on the right wall and is always lit. The great door is at the far end. The light is violet and the haze deepens toward the far end. Everything shares one vanishing point, and far surfaces are blurred by depth. A bloom pass lays haze over the stone, so no line-work shows. Options: camera position and crop, cups `dark` / `waking` / `lit`, lintel `sealed` / `open` / `opening`, and gold level. A `stair` scene uses the same hand. Morning, cut, camp and stair all draw from it; the old baked SVG paintings are gone (the files shrank from 140–340 KB to 4–15 KB).

## Blockers
1. **Cut is full-screen (done).** The camera now faces the lintel across the hall. After the second mark: the lintel's marks flash and lock, then the top bar, heading, keys, hint and "Later" fade out (about 450 ms). The word box stays and floats over the scene. The stone slab sinks out of the blank, top edge first, and the opening becomes a dark recess lit from below, with light spilling onto the floor. The cups wake one by one from near to far, and the camera pushes down the hall toward the opening (scale 1.42 plus translate, 3.2 s). At about 4.9 s the interface returns: carved "THE LINTEL", then "The lintel answered.", then **Go through**. The marks are cut on the lintel itself, in the painting's perspective, and they turn gold as the hall wakes.
2. Complete: part 2.
3. **Stair goes down (done).** You stand on the landing beside the stair's open side. The treads step down in a clear sawtooth into a level bank of lit mist. The passage roof tilts down with the stair, and the light comes from below, up the well. There is no door straight ahead. It is the same painting (`hall.js`, `scene: 'stair'`), so the vault and stone match the hall. One deviation from the critique's fix: a dead-centre view down a straight stair always shows the steps rising toward their vanishing point, and I tried five framings of it. None read as "down", so I chose the side view with the open edge.
4. **Figure-like mark (done).** The lintel's two sample marks are now a hooked bar and a notched square. I checked every mark in the set: the cut's *wake?* (an arc over a dot, with a lower arc, like an eye) and *stone?* (a leaning quadrilateral) have no head-and-limbs reading. All are invented samples.

## Should fix
1. **Hall looks like a subway (done).** See above: fewer, much larger blocks, a shell section taller than wide, the cup line a third of the way up with empty dark stone above, and haze and bloom over the geometry.
2. **Morning (done).** The header is tighter: 8 px less above the selector, and the "Ahead" label is dropped so the sentence stands alone. The lintel is a heavy beam set into the wall over a blank. The corner brackets are finer (0.8 px) and at about half their old opacity (0.4, breathing to 0.22). Every cup sits in a recess on the cup line, so none floats. Begin now goes to `delve-set.html`, as the coordinator asked.
3. Map: part 2.
4. **One rule for headings and top bars (done in `direction.css`).** It is written at the top-bar section. The top bar is Today (or the day), then nothing, then Map or nothing. It never has a title (`.topbar .title` is hidden) or a replay control. The h1 is the place or object name in carved capitals, with any sentence in plain print under it. Cut now heads "THE LINTEL", and camp's top-right Daybook link is now Map. Stair and camp use morning's map icon. Daybook's "WEEK TWO" is part 2's file.
5–7. Record, satchel: part 2.
8. **Camp lamp (done).** The camera stands closer to the lamp. The whole dish, flame and halo sit inside the right third, the gold stays near the lamp (the pool is centred on it), and the hall still runs deep behind.
9. **Small carved labels (done).** `.label-line` and `.label` are now 14px with .2em tracking; `.home`, `.icon-link`, the nav row and the morning day are 15px; `.carve.sm` is 14px. The morning nav row still fits at 360 wide, with 12 px gaps. No screen scrolls sideways at 360.

## Nits
1. **Replay (done).** It is gone from the cut's top bar. The moment still plays by itself on load, and tapping the marks plays it too. The gallery page belongs to the coordinator.
6. **Alignment (done).** "Now the second." sits centred inside the word box, with the box's centred label and rod.

## Known limits
- The painting renders on load (about 1.2 s on a laptop, and twice for the cut). It fades in, so the page never shows a half-drawn frame. A real build would pre-render it.
- In the stair, the landing floor in the lower third is plain, but it sits under the bottom scrim.
