# D — The combined look: notes

Spec: `design/ART_DIRECTION.md` → "D — The combined look" (Dan's walkthrough, D-032). Ten screens, `direction.css`, `index.html`, phone pictures in `shots/`.

## The shared system (`direction.css`)
- **World (C).** Full-bleed painting on every screen: `.paint`, `.pool` (gold arriving with the day), `.fog` (two drifting nebula layers; `.warm`, `.fast`), `.grain`, `.vignette`, and `.scrim-top` / `.scrim-bottom` washes so words read on the scene without panels. Nothing is ever framed.
- **One grid.** Every piece of interface sits in a `.col`: one centred column, 24px gutter (20px under 370px wide), 8px rhythm. The top bar is a three-column grid, so its title is truly centred. The nav row (`.nav-row`) puts its first link on the column's left edge and its last on the right edge, with equal gaps between. This fixes the misalignment Dan saw in B.
- **Interface (B), in violet.** `.btn` is the main action: a crisp box of purple light with a fine bright edge and corner brackets, and a slow breath. It turns gold only when the day has turned (`body.s-done`, `s-evening`, or `.btn.gold`). `.btn-quiet` is the same box unlit. There is also `.label-line` ("NEXT ——"), `.seg` (selectable Low / Normal / High boxes), `.icon-link` (line icon + carved word), `.box` + `.ticks` (the few things Dan asked to see boxed: the map's description, the cut's word), `.row`/`.pip` (the day's jobs on hairlines), and `.text-link`.
- **Type.** Carved Cinzel capitals for labels, buttons and place names. Plain Spectral for sentences, jobs and times.

## Screens by this builder
- **Morning.** C's hall, repainted from C's generator and lifted so that the lamp and the far door sit between the words. On it: B's boxes, the Low / Normal / High selector, "NEXT ——" and line icons. A fine bracket on the lintel in the painting ties it to "Ahead". It also has `#later` (the afternoon) and `#done` (the day done, with a gold "To camp").
- **Delve.** C's tunnel and ring. The destination is now the headline ("Towards / The Salt Gallery"), and the nebula visibly drifts (fast fog, three moving colour clouds, ribs flowing past). The first delve ends in a breather (`#breather`). The second (`#second`) ends with "See where you are", which goes to day complete.
- **Map.** A's layout and look: places as lit pools in purple haze, walked routes dusted with light, cairns, the stair as a faint shape. From B, the routes draw themselves in, and tapping a place moves the crosshair onto it and puts its description in a box underneath. The lintel's description offers "Try a word" (to the cut). `#stair` shows the map after the lintel opens ("Go down", to the stair); `#sel=<place>` preselects a place.

## Constraints kept
No figure; wall-cups dark (the morning painting is C's, with dark cups); the clay lamp always lit. The lintel marks in the morning painting are C's `l1`/`l2` sample shapes, kept only for the lintel: the record's line and ring must not reuse them. No counts of undone things, no bars (the ring is the only progress), no red.

## Weak spots
- The lintel in the morning painting still reads a little like a sign (carried over from C).
- The map's lines are B-bright. If Dan wants it closer to A's softness, the next step is to dim them to dust once they have drawn in.
