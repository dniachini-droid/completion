# Blender test, round 1: pt-pl-w2-box-by-the-cot, critique

> **SEALED (D-015).** Quotes the painting brief. Dan must not read this.

Same bar as the kit rounds (`paint/places/CRITIQUE-W2-2.md`): **8/10 or better goes into the app; below 8 stays out and keeps its stand-in.** 8 means Dan, who approved the hall, would accept it beside the hall as the same painter's work: beautiful, with one clear thing to look at, and it would not embarrass the game. The words sit in the top 22 % and the button in the lower third, so those bands stay calm. This place is on its first round under the new pipeline (D-090), so the round-3 "7 goes in" rule does not apply.

Reviewed: the Blender render at full size (1320×2868, `blender/img/`), side by side with the kit's round-2 version (scored 5), the brighter grade, `hall-ref.jpg` and the accepted `pt-b-1.C` (her camp, the same room); crops of the mug, the slate and box, and the wall; the scene source `blender/pt-pl-w2-box-by-the-cot.py`. Point colours are 12 px means, "brightest" the brightest 24 px block; u/v are fractions of the frame from top left. The automatic checks pass (words band 19, button band 34 / .47, warm 0 %).

| | Hall (bar) | Kit round 2 | **Blender** | Blender, brighter grade |
|---|---|---|---|---|
| Median luminance | 36 | 26 | 39 | 59 |
| 90th percentile | 87 | 46 | 95 | 138 |
| Brightest 1 % | 177 | 76 | 143 | 203 |
| Words band / button band (mean / busyness) | 26 / 37 / .37 | 15 / 29 / .40 | 19 / 34 / .47 | – / **51** (fails) |
| Warm share | 5 % | 13 % | **0 %** | – |
| Mean RGB (B/R) | 49 41 70 (1.43) | 29 24 37 (1.28) | 42 43 69 (**1.64**, G ≥ R) | 63 64 100 (1.59) |
| Brightest | door glow 212 208 240 | a streak across the slate | **240 240 248, the upturned base's top edge** (u .50 v .41), cold white | |
| The look-at | | mug body 158 136 91, rim dull | rim: a dull copper line, 150 125 107 at its warmest (u .43 v .50); lit flank 137 141 171; shadow flank 2–10 | |

---

## pt-pl-w2-box-by-the-cot, Blender (6/10) — out

*A clean product shot: a tin cup on a dark tablet on a shoebox, in periwinkle studio light.*

### What improved (against the kit's 5)
- **Every object is the right kind of object, as a shape.** The box is plainly a two-part shoebox (a lid with a real overhang, grey card, the body under it). The slate is thin and smaller than the lid, laid askew (9°), not a fitted lid. The mug is a straight-walled tin cup, cool grey, dented in the source, with a strap handle. The kit's padded jewellery box and brass mug are gone.
- **Contact and weight.** The box sits on the floor with a real contact shadow; the slate casts a soft shadow on the lid; the mug sits on the slate. Nothing floats, nothing is lumpy. This is the thing the kit never managed.
- **One clear look-at.** At phone size the eye goes straight to the mug: it is the largest light shape, the sharpest thing (focus on it, `fstop 3.5`), and the brightest block is on it. The composition is the brief's: low, close to the floor, the wall running to a vanishing point on the right.
- **The bands are calm.** Words band one dark wall (19), the button band a quiet floor (34).

### Blockers
1. **The mug still does not read upside down, and its brightest point says "open mouth".** The camera (`CAM y .26`) sits only 4 cm above the mug's top (`~.217`), so the closed base is seen almost edge-on: a thin pale line across the top, and the brightest block of the frame (253 254 254 at u .50 v .414) sits on it, which reads as the lit lip of an open cup. At the foot, the rolled rim (the `rim` torus) reads as a base ring or a coaster with a copper band. The 2.4° tilt's "dark crescent" does not show at all. The wall's cloudy mottling (the `n2` ramp at scale 6) reads as smoke or marble, not tin, and the dents (`≤ .0028`) are invisible. In the scene: raise the camera to `y .30–.32` and pitch down (`-13 → -20`) so the closed base shows as a flat disc with its pressed ring (deepen the ring: `(.0355, .0012) → (.034, .003)`); raise the tilt to `4–5°` and let the lifted side face the camera so a dark sliver of the inside shows under the rim; turn the mug so the handle's lower rivet (now near the slate) is side-on and plainly nearer the slate than the top; cut the "cold lift on the tin" (`10 → 3`, aimed at the flank at `y .15`, not the top edge) so the base's edge stops being the peak; swap the cloud noise for fine vertical brushing (anisotropic, or a stretched noise `scale (4, 4, 120)`) and double the dents so they break the highlight.
2. **The lamp's warmth is missing and the glint is not a glint.** Warm share 0 %; the brief's light is the clay lamp's, warm and weak, from the doorway, and the week needs the box to carry a trace of it (with the gold kept to the rod, per round 2). The point light `clay lamp` (60 W, 3 m back in the passage) contributes nothing visible; the whole frame is lit by the violet fills. The two `only=[rim]` spots light the whole front arc of the rim as an even copper line (u .38–.52, v .50), which reads as a band of copper, and at 150 125 107 it is a fifth the brightness of the base's cold edge. Make the glint one point: give the rim its own material with low roughness (`.12`, not the tin's `.30–.55` ramp, which smears the reflection along the arc), keep one spot only, tight (`spot 4°`, radius `.002`), strong enough that its highlight is the brightest small value in the frame (≥ 230, warm). And bring the lamp in: a weak warm area light at the doorway side (`~(-1.0, .35, 1.6)`, aimed low at the box's front and the floor before it, `k` so warm share lands at 2–5 %), so the card's near face and the floor at its foot take a faint gold under the violet.
3. **The surfaces are clean CG, not the hall's painter.** Beside `hall-ref` and `pt-b-1.C` this is a different hand: the walls are smooth, even plaster with thin wobbly grooves like piped icing (u .0–.6, v .29–.33); no mottling, no chisel, no value change block to block. The slate is a dark, uniformly bevelled slab with seven even slots (u .23–.55, v .51–.53): it reads as a tablet with a speaker grille. The card is crisp-edged; "gone soft" barely shows. In the scene: give `stone_mat` large tonal mottling (noise scale 1.5–3 mixed into base colour at ±15 %, the hall's blotchy fbm), a per-block value offset (±8 %), a fine chisel bump, and joints drawn as darker, wider, slightly soft lines (the hall's joints are dark and read as drawn); give the slate riven edges (displace the outline with noise, drop the clean bevel), a faint layered grain and a lighter grey, and cut the count as pale scratched V-strokes of uneven length and spacing (lighter floor, not dark slots); give the card a sagging lid (`.006 → .012`), a visibly crushed near corner (move the crush to the camera side), a damp tideline and a darker wicked bottom edge.

### Should fix
1. **The colour is periwinkle, not the hall's mauve** (mean 42 43 69, B/R 1.64, green at or above red; the hall's red leads green, B/R 1.43). Warm the violet lights and the world: `(.42, .38, .9) → (.50, .40, .84)` and similar for the others.
2. **The darks are crushed to black**: the mug's shadow flank 2–10 (u .40–.44 v .44), the box's left end 0 0 0 (u .03–.20 v .62–.66), the top-right corner 1 1 6. The hall's darks are violet, never black. Add a low violet fill from the camera side (`area`, `k ~1`, large) or raise `haze_k`, so the shadow side of the mug keeps its form and the box end is a dark violet plane.
3. **The box is cut by the left edge and falls into black there**, and the lower 30 % is an empty floor crossed by two hard joint lines (u .0–.6, v .83–.90; busyness .47 against the hall's .37). Yaw a few degrees left (`-27 → -23`) or step back 5 cm so the whole box sits in frame with a margin, and soften or offset the floor joints so none crosses the button band as a hard diagonal.
4. **The eye drifts right to the lit floor and far corner** (96 97 145 at u .75 v .60, brighter than the box's lid face 104 106 144 is by contrast with its surroundings). Pull the `violet, far right` area down a step (`2 → 1.2`) so the room recedes behind the still life.

### Nits
1. The handle is a wire-thin loop (`hw .0029`, `ht .0008`) like a ceramic mug's; a tin strap is wider and flat (`hw .004`, `ht .0006`), with a visible rivet.
2. The very shallow focus plus clean surfaces gives it a product-photography feel; `fstop 3.5 → 5.6` would keep the box's front sharper and read more like a painting's soft edges than a lens's.

### What is still short
- A mug that is plainly upside down: the closed base seen as a disc, a dark sliver of its open rim lifted off the slate, dents breaking the highlight on dull tin.
- One warm point on the rim that is the brightest thing in the frame, and a faint trace of the lamp's gold on the card's near face and the floor.
- Cut stone, riven slate and soft card with the hall's mottled, hand-made texture, in mauve half-light with violet (not black) darks.

### The brighter grade
Median 59, p99 203, button band 51 (fails). It is airier, and it shows why Dan liked a brighter draft: the objects read even more clearly. But the lift is global, so it flattens the frame into an even periwinkle wash and makes the plaster-smooth stone and the tablet-like slate more obvious, not less; the mug's peak gets no more special. Brightness should come from light placed in the scene (the warm pool at the box's foot, violet darks lifted off black), not from the grade. Keep the darker grade as the base.

---

## Summary

| Id | Score | Goes in? |
|---|---|---|
| pt-pl-w2-box-by-the-cot (Blender) | 6 | no (stand-in) |

Counts: 3 blockers, 4 should-fix, 2 nits.

---

## The pipeline

**Judged from this one picture, Blender looks like a route to 8, but not by itself; it moved the problem rather than solving it.** The kit's persistent failure was form and material: padded, lumpy, brass-coloured objects that were the wrong thing. Blender fixed that in one round: real geometry, contact shadows, soft bounce light, correct perspective and focus make every object legible. That is a genuine step, and it is the step the kit could not take in two rounds (5 → 5).

**What it does worse:** its default look is a clean clay/product render. The kit's ray-marcher had the hall's hand built in (fbm mottling everywhere, fog, drawn dark joints, a grade tuned to the hall's mauve); this render has none of it, so it sits beside the hall as a different painter. Procedural materials here are thin (one noise per material), the lights are many fills that flatten, and the grade drifted to periwinkle with crushed blacks. It also made it easy to get the objects "right" and still miss the brief's reading (upside down) and its light (the lamp's warmth).

**What would most likely lift it to 8, in order:**
1. **Stone and surface texture matched to the hall** (the biggest gap): a shared `stone_mat` with large mottling, per-block value, chisel bump and dark drawn joints, tested once against `hall-ref` and then reused by every place. Image textures (scanned stone, slate, card) would get there faster than more noise nodes.
2. **Lighting that follows the brief, with one key and one peak**: the lamp as a real warm key (weak), the violet as fill, violet (not black) darks, and the look-at's glint as the single brightest value. Fewer lights, placed with intent.
3. **A compositing grade and haze locked to the hall** (mauve, lifted darks, a trace of fog in the depth), shared across scenes, so every Blender place starts in the hall's colour.
4. **Props from Meshy** would help the slate and card look hand-worn and irregular, but they are not the main blocker here: the mug's geometry is already good, and its failures are camera, tilt and light. If used, strip or override Meshy's baked colour so its lighting doesn't fight the scene's.

With (1)–(3) done as shared pieces, this picture looks one round from 7 and two from 8; the kit showed no such path for it.
