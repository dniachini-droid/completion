# Critique — AI repaint test (four places)

> Sealed (D-015). Separate critic, 2026-09-26. Candidates `free0` / `free1` from an AI image model (current painting as loose layout guide, approved Lamp Hall as style), judged against the briefs (`docs/narrative/sealed/PAINTING_BRIEFS.md`) and the current painting's middle crop. All coordinates are pixels in the 1024×1536 frame (x0,y0,x1,y1). Working crops in the session scratchpad `crit-ai/`.

| Id | Chosen | Wrong readings | Marks |
|---|---|---|---|
| pt-pl-w1-below-the-lamp | free1 | PASS | MATCH |
| pt-b-2.B | free0 | **FAIL** (fixable) | DIFFERS (pencil line) |
| pt-pl-w2-above-the-ring | free1 | PASS | MATCH (count, place); slant pattern differs slightly |
| pt-pl-w2-box-by-the-cot | free0 | **FAIL** (fixable) | MATCH |

Overall: the AI candidates are far richer than the current paintings (real stone texture, lamp pools, depth); every one is at the Lamp Hall's level of finish. But in two of four the model changed what a thing *is* (pencil into carving, card into stone, mug base into a lid), and one rejected candidate per place added or changed something story-bearing (cups in the shelf, a flame in the crack, a tunnel for a niche). AI repaints need a clue-by-clue check every time.

---

**pt-pl-w1-below-the-lamp — free1. PASS.**
- Why not free0: the niche sits at floor level with the floor running into it and walls converging, so it reads as the **mouth of a tunnel / a fireplace** (heavy soot fanning up round a thick rolled arch lip, the old oven reading). It also adds **drip streaks running down from the strokes** into the stain (x 390–625, y 630–700), which could read as the strokes leaking or bleeding: a new clue.
- free1: an arched recess raised on a sill in a block wall, dark inside, empty; a soft dark stain round the mouth. Reads as a small wall niche with a stain, not an oven or mousehole. The lamp's warm pool on the floor below confirms light from above. Should fix: the stain is weighted to the upper right of the arch (x 620–700, y 700–900) rather than evenly round the mouth and heaviest at the sill as the brief asks; staining *above* an arch is a fireplace cue, so move the weight down to the sill. The niche is large (≈ x 360–700, y 730–1060); a little smaller would help "a hand's depth".
- Marks: five cut strokes in a row, same order and slants (1 leans right, 2 upright, 3 leans right, 4 and 5 lean left). Crop (407,565,620,647); free1 (415,571,620,644). **MATCH.** Minor: free1's stroke edges are ragged/serrated rather than clean, and the close 2–3 pair is slightly less close (gap ≈42 px vs 35 px). Not a wrong reading at phone size; clean the edges if retouching.
- Quality: much better than the current flat violet wall; real cut stone and a lamp-lit floor.

**pt-b-2.B — free0. FAIL (fixable).**
- Why not free1: it adds **three half-round cups/holes in the shelf's front face** (≈ (250,1130,300,1190), (475,1195,565,1255), (800,1265,920,1345)): new marks, and cups are a named story object. Hard fail.
- free0, the rod: a dark stone blade with a clean tapered point and a lit edge; no ruler graduations, no splintered tip, so the driftwood/ruler readings are gone. Should fix: the highlight is a broad glossy streak on the bevel (x 250–560, y 690–800), a little metallic; keep the flats matt and narrow the light to a thin line on the one edge.
- **The wrong reading:** the pencilled line under the shelf is repainted as a **carved groove** with a shadowed channel and a lit lower lip. It now reads as a chiselled line in the stone, i.e. made by the builders, not a pencil mark made by her. That is a planted mark reading wrongly.
- Marks: handle marks and hook are not visible in the crop nor in either candidate (the scene draws them but they are sub-pixel at this scale): MATCH (absent both). Pencil line: crop (25,1015,1024,1228), a flat thin dark line; free0 ≈ (100,1108,1024,1300), a carved groove, starting ~75 px further right and ~90 px lower. **DIFFERS.**
- Also remove: faint pock marks in the back wall (≈ (555,605,665,700)), a loose cluster that could be counted.
- Fix: repaint the line as a flat thin grey graphite stroke with no relief, shadow or lit lip, on the crop's path; clean the wall pocks; narrow the edge highlight.
- Quality: far better than the current painting (real shelf, stone, lamp pool), once the line is fixed.

**pt-pl-w2-above-the-ring — free1. PASS.**
- Why not free0: the pale thing is **warm, flame-coloured, with a warm glow on the crack walls round it**: it reads as a **candle flame burning inside the crack**. Warm light is reserved for the lamp (and later the cups); a flame here is a false clue.
- free1: a small cool-white pale shape deep in the dark crack, the brightest small value in the frame, with only a faint halo; reads as "something pale far back in the crack", as the current painting does. Should fix: its teardrop shape (in the current painting too) is flame-like; a blunter, less pointed highlight would remove the last hint of flame. Keep it cool.
- Marks: five strokes beside the crack, all leaning the same way. Crop (663,947,852,1048); free1 (659,911,844,1006), about 35–40 px higher. **MATCH** on count, order and place. The crop's slants increase stroke to stroke; free1's are nearly uniform. The scene file sets these tilts by hash (random), so this is not meaningful.
- Pale thing: crop (499,894,510,913); free1 ≈ (488,865,502,915).
- Quality: much richer salt relief and raking light than the current; the crack reads deeper.

**pt-pl-w2-box-by-the-cot — free0. FAIL (fixable).**
- Chosen over free1 because its mug keeps the current painting's taper (wider at the slate), which helps "upside down", and its handle is cleaner. free1 has the same two faults, and its top is more of a domed cap.
- **Wrong reading 1 (the look-at):** the mug's top (its base) is painted as a **separate disc with a seam and an overhanging edge** (≈ (575,700,730,760)): it reads as a **lid**, so the mug reads as a lidded tin standing the right way up, and a lid suggests something inside. The rolled rim on the slate still helps, but the lid cue competes. Fix: a plain closed flat base, one piece with the wall, at most a small recessed foot ring; no seam and no overhang.
- **Wrong reading 2:** the box is painted as a **cut-stone block** (chisel texture, hard arrises), so it reads as a stone plinth, part of the Site, not her cardboard shoebox. This reverses the signature (her world on his). Fix: matt pale grey-brown card gone soft, slumped corners, a lid seam, no stone texture. The same applies to free1's box.
- Marks: seven strokes in a row on the slate, same order and spacing. Crop (292,882,492,965); free0 (300,910,507,995). **MATCH.** (free1 also has seven: (275,915,462,1005).)
- Quality: better light and texture than the current (warm doorway light, stone floor), but the two readings above must be fixed before it can replace the current painting.

---

## Final composites (2026-09-26)

The four chosen candidates, the two fails each given one targeted edit, fitted into the full game frame (1320×2868; AI picture in the middle, blended into the original's dark top and bottom, lower third softened). Files: session scratchpad `ai/free-out/<id>.jpg`, judged against the game's current `img/<id>.webp`. Coordinates below are in the **1320×2868** frame. The live-layer anchors in each `<id>.json` are unchanged from the current painting, so I also checked where they land on the new picture.

No hard seams: row-mean luminance never jumps more than 2.3 levels between adjacent rows in any composite, and the top blends read as ceiling shadow.

| Id | Wrong readings | Marks |
|---|---|---|
| pt-pl-w1-below-the-lamp | PASS | MATCH |
| pt-b-2.B | **FAIL** | DIFFERS (pencil line) |
| pt-pl-w2-above-the-ring | **FAIL** (the ring is lost) | MATCH |
| pt-pl-w2-box-by-the-cot | PASS | MATCH |

**pt-pl-w1-below-the-lamp: PASS, marks MATCH.** Five strokes with the same order and slants: current (525,1172,799,1278), final (535,1180,798,1274). The niche reads as a raised wall niche with a stain, not an oven. Blend: a **second, ghost light pool** from the original's floor shows below the AI pool, at about (400,2500,900,2800) in the softened lower third. It reads faintly as a second light source. Should fix: mask it out of the bottom blend. The beam anchor at (624,2257) sits between the two pools; move it onto the AI pool at about (620,2050).

**pt-b-2.B: FAIL, marks DIFFER.** The edit fixed the rod: the highlight is now a thin line on one edge, the flats are matt, and the wall pocks are gone. But the pencilled line is now a **pale, near-invisible band**: lighter than the stone, with a faint dark edge, and not findable at native brightness. Where it is seen, a pale line on stone reads as a scratch or incised mark, not graphite. Current: a clear dark line, (35,1755,1320,2025). Final: (130,1880,1320,2105), starting ~95 px further right and ~110 px lower. Fix: repaint as a dark grey graphite stroke about 3–4 px wide, clearly darker than the surrounding stone (≥15% luminance drop), with no highlight edge, ideally on the current line's path. Handle marks: not visible in either (MATCH, absent). The glint anchor (360,1455) sits on the shelf just below the blade, as it does in the current; moving it onto the lit edge at about (390,1395) would match the brief.

**pt-pl-w2-above-the-ring: FAIL, marks MATCH.** Five strokes: current ≈ (855,1665,1090,1790), final (850,1619,1089,1741). Pale thing: current (645,1596,657,1617), final ≈ (632,1555,652,1600), cool white and deep in the crack. Good. But **the ring is gone**: the current painting's arc of the lone ring at the bottom edge (y 2550–2868) was replaced by the dark bottom blend. The place loses the object it is named after and located by. Fix: restore the ring's arc from the current painting in the bottom band, keeping it above the softening so it stays visible. Also, the pale-thing glint anchor (645,1639) now lands ~50–60 px below the pale thing, in the dark crack, where a live glint would read as a second pale object. Move it to about (642,1578).

**pt-pl-w2-box-by-the-cot: PASS, marks MATCH.** The edit fixed both readings. The mug's top is now a plain closed rounded base with no seam, with the taper wider at the slate and the rolled rim on the slate, so it reads upside down. The box is now a pale, matt card shoebox with a lid. Seven strokes: current (377,1583,640,1690), final (385,1615,648,1728). Should fix:
- The pale box is now the brightest large mass and competes with the mug; drop its value ~20%.
- The glint anchor (775,1571) lands mid-body; the brief puts it on the rim, at about (775,1650).
- Clean the tiny pale chip on the slate at about (623,1740).
- Faint vertical ghost edges from the original show in the softened bottom band, at about x 80 and x 720, y 2600–2868; mask them.

Quality: all four are far richer than the current paintings. Once the two fails are fixed (the rod's pencil line, the ring's arc), all four are fit to replace the current paintings.
