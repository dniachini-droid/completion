# Week 1 places, round 3: critique (art director's pass)

> **SEALED (D-015).** Quotes the painting briefs. Dan must not read this.

Reviewed: the contact sheet `r3/sheet.jpg`, the five round-3 bakes at full size (660×1434), crops of each look-at (`k4/`), round 2 (`r2/`) side by side, `hall.jpg` (the approved hall, the bar), the five scene files, `kit/lib.js` and `render.js` (kit v2: `gold`, light-gated glints, `engrave()`), the anchors in `r3/<id>.json`. Measured with `tools.mjs stats` on the 660-wide bakes; point colours are 9–17 px means read with `samp.mjs`; camera checks with `proj.mjs`.

| | Hall (bar) | b-1.A Lamp Hall | b-1.B Corner | pick niche | b-1.C Survey Cut | below the lamp |
|---|---|---|---|---|---|---|
| Median luminance | 37 | 40 | **29** | 37 | 33 | 34 |
| 90th percentile | 87 | 77 | 66 | 97 | **52** | **55** |
| Brightest 1 % | 177 | 146 | 122 | 155 | **69** | **90** |
| Top band (words), mean | 26 | 29 | 24 | 27 | 26 | 25 |
| Lower third (button), mean | 37 | 42 | 30 | 36 | 36 | 39 |
| Lower third busyness (hall 0.37) | 0.37 | 0.44 | 0.45 | 0.29 | 0.38 | 0.28 |
| Warm pixels | 4.8 % | 5.2 % | 0 % | 0 % | 8.3 % | 10.8 % |
| Mean RGB | 50 41 70 (mauve) | 49 41 69 | 38 32 **60** | 51 44 78 | 36 31 **56** (royal blue) | 38 32 45 |
| Colour of the warm light | 200 151 121 (wall over the lamp) | 172 141 131 (peach, paler) | none | none | **90 71 64** (brown, floor before the boots) | 136 110 85 (tan-gold, wall foot) |
| Round 2 → round 3 | | small (mean diff 2.5) | darker, calmer | re-framed, no stars | re-framed, re-propped | re-framed, cold again |

## Verdict

- **Real progress: every number is now inside the kit's place checks, and the three worst round-2 faults are gone.** No more salmon or terracotta fields in the button zone; no night sky; no mouse hole, no clogs, no trestle table. The set now looks like one cold violet world. **What still stops them is the look-at, four times out of five**: the troughs still read as pipes, the niche's strokes as slots in a pasted plate, the Cut's boots as toy wellies in a dim brown pool, and the recess under the lamp as a small appliance. Round 3 fixed the *frames*; round 4 has to fix the *things*.
- **pt-b-1.A, the Lamp Hall: 7/10.** Unchanged score. The door now stands as a dark arch in the glow and the rings are carved, not inked. But the glow is still smaller and greyer than the hall's, the cups' new sills make them more like windows, and the lamp's wall is peach, not the hall's gold.
- **pt-b-1.B, the Corner: 6/10** (was 5). The bleached wall is gone, and the lit turn is now the loveliest passage in the set. But the troughs still read as two half-pipes lying on the floor, and they fill half the frame.
- **pt-pl-w1-pick-niche: 6/10** (was 5). The starfield and the bread oven are gone, and the niche is the right shape: long, low, flat-headed. But its lip is a pale rectangular plate with six dark pill slots (a toaster, a letterbox), and the salt has turned into crazy paving.
- **pt-b-1.C, the Survey Cut: 6/10** (was 4). The biggest jump. It is a low room someone lived in, with a real camp cot on X-legs and boots beneath. But it is dim and royal blue with no light in it (top 1 % at 69), the lamp's pool is brown, the boots are toy-like, and the notebook is missing.
- **pt-pl-w1-below-the-lamp: 5/10** (was 3). Cold stone is back, the gold sits in a thin line at the wall's foot, and the oil reads as a soft darkening. But the recess has a glowing outline, the strokes are five identical capsules, and the ledge is a floating hood: together they read as a vent over a screen under a cooker hood.

Counts: **5 blockers, 22 should-fix, 8 nits** (A 0/4/3, B 1/4/1, niche 1/5/1, C 1/5/2, below 2/4/1). Round 2 had 13 blockers.

---

## 1. pt-b-1.A, the Lamp Hall (7/10)

*Still the hall, same hand. The door arrived; the glow didn't come back; the cups became windows.*

### Round-2 notes
- Fixed: **the door** (partly: a darker leaf now stands in the glow, see should-fix 3); **the rings** (now `engrave()`d, soft, no ink; count cut to `.22`, kept off the ledge); **sheen** `.22 → .16`.
- Not fixed: **the far light** (core 195,189,231 at u .5 v .45; the hall's is 227; asked ≥ 220); **the cups** (worse, below); **the lamp's gold** (no `gold` on this scene); the lintel still reads as a bench.

### Blockers
None. Dan would still recognise it as the hall he approved.

### Should fix
1. **The glow is still not the hall's.** The mean difference against `hall.jpg` is 9.3 (it was 9.4), with 38 % of pixels more than 8 levels apart. The far end is a small, grey-lilac arch with a crisp shape. The hall has a broad, near-white cloud that fills the far third of the corridor. Moving the light to the door is right, but its core got no brighter. **Fix:** far light `k 470 → 560`, `r 36 → 40`. Add `bloomPow: 18` (the default reads tighter than the hall's) and `bloom: { alpha: .26 }`. Check that `(330,640)` reads ≥ 220 and that the glow's half-brightness width at v .45 is ≥ 150 px (the hall: about 160; now about 95).
2. **The cups now read as a cloister of arched windows.** The `M_DRESSED` sill `(.08 × .025 × .36)` is exactly a window sill. The bowls are still invisible (their clay tint `.8,.66,.6` sits in a recess that gets no light). The jitter wasn't added, so they still march at 3.1 m. **Fix:** drop the sill box. Make each recess a *cup*, not an opening: shallower (`3.04 - ax → 2.94 - ax`), with a round head as wide as it is tall (`archOpening2(…, .34, .66) → (.3, .42)`), and with the bowl's rim proud of the wall face (`q.x - 2.87 → - 2.8`) so the fill catches its lip. Jitter the pitch: `zl = mod(p.z - z0 + .25 * (h2(vec2(floor((p.z - z0) / 3.1), side)) - .5), 3.1) - 1.55`.
3. **The door reads as a doorway, not "most of the wall".** The dark leaf is about 50 px wide inside a 140-px far end, a door the width of a person seen from far away. **Fix:** the leaf is modelled 4.2 m wide, but only its middle survives the fog. Drop the door-head light `p [0,7.8,63.5] → [0, 6.9, 63.2]`, `k 60 → 90`, `r 3 → 4.5`, so the arch's *jambs* get a thin rim of violet down both sides. Keep the leaf `M_DARK`. Target: two faint pale verticals at about u .40 and u .60 framing the dark leaf.
4. **The lamp's wall is peach, the hall's is gold.** Above the ledge it reads 172,141,131 (G/B 1.08). The hall's is 200,151,121 (G/B 1.25), and the hall's warmth reaches further along the wall (at u .76 v .49: the hall 125,94,106, here 72,58,84). **Fix:** add `gold: .7` (the kit's new option: this scene doesn't use it). Lamp `warm .1 → .13`, `r 1 → 1.25`. The live flame then sits in a pool the hall's size.

### Nits
1. The rings now render as crescents (lit lower lip only), and several read as the letter C. Raise the engrave width `.03 → .04` and depth `.012 → .008`, so the upper lip shades softly instead of vanishing.
2. The lintel box and its post still read as a bench with one leg. Remove the post line (it is the M_CUT_SMALL blank's edge at x −2.83) or sink it into shadow (`gStain .3`).
3. The vault shows a crisp centre crease and a mirrored diamond lattice, from top to v .3 (it was in round 2 too). The hall's vault joints are irregular and have no ridge line. A kit-side check: `regression/lamp-hall.js` vs `hall.jpg` should be run again, since the kit's hall has drifted from the approved one.

---

## 2. pt-b-1.B, the Corner (6/10)

*The turn is beautiful now. The troughs are still two pipes on the floor.*

### Round-2 notes
- Fixed: **the bleached wall** (p99 197 → 122; the brightest thing is now the polished band at the turn, 148,130,192, which is right); **the words band** (42 → 24); **the perforations** (the marks are now sparse, small cut ticks; they are felt, not counted); **dead glints** (all four at u .68–.77 on the floor past the turn); **the gallery light lowered** to `y .5`; **the grade** applied; **the inner wall's bounce light** added.
- Not fixed: **the troughs** (blocker 1); the inner wall is still a board; the vault bands are still a skate bowl; the colour is still bluer than the hall.

### Blockers
1. **The troughs still read as raised half-pipes.** At full size, two long rounded ridges run toward the turn, lit along their crests, with segment joints across them like pipe sections. The inner edge of the right one is a hard black step, so the floor beyond it reads as a raised platform. The cause is in the profile: round 2 asked for `dep ∝ (1 - e*e)` eased into the floor with smoothstep. The scene uses `dep = .15 * fade * sqrt(q)`, which is a half-*ellipse*: flat-topped in the middle and **vertical at its edges**. A hollow with vertical walls, lit end-on, shades exactly like a cylinder (bright middle, dark sides), so the eye reads it as convex. The vertical outer wall is the black step. **Fix:**
   - Profile: `e = s / .27; q = max(0., 1. - e*e); dep = .11 * fade * q * q;` (broad, shallow, zero slope at the rim). Keep `min(p.y + dep, .3 - abs(s)) * .5` → raise the bound to `.4 - abs(s)` so it never clips the new width.
   - Occlusion sells concavity: `if (p.y < .02 && q > 0.) gTint = vec3(1. - .35 * q * fade);` so the bottom of each hollow is darker than the floor either side.
   - Light *across* them, not along: the spill at the turn `p [beyond(1.5), 3.5] → [beyond(1.5).x + 1.5, .7, beyond(1.5).z]`, `k 18 → 34`. Each trough then shows a lit outer flank and a shadowed inner one. The polish streak (`gPolish .9 * sqrt(q)`) should sit on the lit flank: use `gPolish = .9 * fade * smoothstep(.2, .8, e)` (one side only).
   - Check at full size: with the glints off, cover the top half. The hollows must read as hollows on their own.

### Should fix
1. **The inner wall (right third, top to v .5) is still a flat board** (11,9,22 at the top, 55,45,69 at v .42), with a hard vertical edge. The bounce light (`k 6`) lands low and doesn't give it form. **Fix:** `k 6 → 14`, `y 1.6 → 2.4`. Round the arris where it meets the turn (`hallAir` wall edge softened by `smin .15` at `b.y > ZC`), and let the courses show (`gTint .8` above y 3.5 so the joints read against a lighter face).
2. **The polished band reads as a tide line, not a shine.** It shows as brighter stone below a wavy dark edge (the shadow of `top`'s noise), like a damp mark. The band should be matt stone with a *streak* of specular in it. **Fix:** most of the band's brightness is the grazing light on its lower wall, not the polish, so keep that light but make the *edge* the polish: tighten the sheen `specP 60 → 90` with `specK 1.3 → 1.8`, and reduce `top`'s noise amplitude `.3 → .12`, so the band's edge is a soft level line at twice shoulder height.
3. **The vault bands are still a water slide** (the top 25 %: perfect parallel curves, now with a pale blotch at u .3–.5, v .05–.2). **Fix:** as round 2: `CUT_SMALL` joints across the bands, and `hazeFar .07 → .05` at the top. The blotch is the gallery light's spill through the bend's inside: `gTint .7` for `p.y > 4.6`.
4. **Bluer and darker than the hall.** Mean 38,32,60 (B/R 1.58; the hall's is 1.40). The median is 29 against 37, so the lower half is murky. **Fix:** `grade [1.12,.98,.86] → [1.16,.98,.82]`, `expo 1.6 → 1.75`. Recheck the top band stays ≤ 30.

### Nits
1. The joints across the troughs are arcs, which read as pipe-section seams. Once the hollows read, make them straight slab joints worn soft (`joint width × 1.6` inside `q > 0`).

---

## 3. pt-pl-w1-pick-niche (6/10)

*The right niche now, in the wrong frame: a toaster plate on a crazy-paved wall.*

### Round-2 notes
- Fixed: **the night sky** (the roof is M_ROCK and black, 10,8,19; no stars); **the oven** (a long, low, flat-headed slot, the brief's shape); **the score marks** (five blade cuts, all one way, big enough to read); **the cliff lip** (smooth now); **the floor wedge at the button** (lower third 36, busyness .29, the calmest in the set); **dead anchors** (all six glints on the salt near the niche, both beams in frame); **pink stays 0** (commented).
- Not fixed: **the strokes are still not readable as strokes, and they are not the brightest edges** (blocker 1); **the salt banding** (worse: it is now a mosaic).

### Blockers
1. **The lip is a pasted plate with pill slots, and the eye goes elsewhere.** The `M_DRESSED` region is painted by a rectangular mask (`abs(m.x) < .43 …, m.y > -.08`). It renders as a pale grey rectangle with hard edges, stuck under the slot like a label or a toaster's front plate. The six strokes are dark capsule holes (16,14,28): rounded both ends, the same length, facing the camera with no light raking into them. With the dark slot above, the whole reads as a letterbox or a toaster. Meanwhile the brightest things in the frame are the far glow (208,196,236 at u .09) and a light wedge on the floor (143,129,195 at u .18 v .56), so the eye lands left, far from the niche. **Fix:**
   - The lip is the slot's own worn sill, not a plate. Build it as geometry: a sill `.05` proud of the salt, `.08` tall, running `±.40`, with a rounded arris (`box` with `r .015`, then `- .006 * fbm`). No albedo rectangle: let `M_DRESSED` follow the sill's SDF (`if (sill < .004)`), so its edge is its shape.
   - Strokes are blade cuts, not holes: taper each one along its length (`w = .016 * (1. - pow(abs(m.y + .04) / .03, 2.))`), with a shallow depth (`.014 → .006`) and lengths varied `.04–.06` by `h2(k)`. Five, not six.
   - Light them: the lip key `[1.55, .12, ZN + .9] k .25 → [1.5, .2, ZN + .7] k 1.4, r .5`, so each cut shows a lit left flank. The sill's top edge should then be the brightest edge right of u .3 (target ≥ 150).
   - Take the eye off the left: the main light `y .45 → 1.1` (it makes the floor wedge from so low), and the far light `k 60 → 40`.

### Should fix
1. **The salt is crazy paving.** Every crystal is a flat-shaded facet with a darker edge (Voronoi cells about 25 px wide), so the whole right half reads as a giraffe pattern or cracked mosaic, darker toward the roof. The grey-and-white *beds* the brief asks for (and round 2's best feature) are gone. **Fix (kit, `M_SALT`):** crystal normal bump `cn * .3 → cn * .1`, cell scale `p * 28. → p * 45.` (the crystals were fist-sized at 1 m). In the scene, restore the banding's contrast by removing the upward `gTint` darkening below 1.4 m (`smoothstep(1.1, 2.) → smoothstep(1.6, 2.4)`).
2. **Glints: many, tiny, uniform.** The light gate works (none in the roof). But the lit wall is dusted with about 60 single-pixel white points, at even density, including well away from the light. **Fix:** `step(.9, …) → step(.965, …)` and cell scale `70 → 40` (fewer and larger), or leave the glints to the live layer's six anchors.
3. **The black roof is 35 % of the frame, a flat, unmodelled wedge,** with a pale diagonal stripe (the roof's lip) cutting from u .3 v .35 to the top right. **Fix:** give the roof M_ROCK's roughness in the faint fill (`fill k .4 → 1.2`, aimed up: `[0, .4, ZN - 2]`), and blur the lip (`blur.d0 3 → 2`).
4. **The score marks are drawn, not cut:** thin dark lines with no lit lip. **Fix:** engrave width `.011 → .016`, depth `.012 → .007`, and taper them as the strokes. The raking light from the left then lights their right flank.
5. **The far glow is small** compared with round 2's. Pull `bloomAt` to `ZN + 22` and `bloomPow 14 → 10`, so the gallery's end is a cloud, not a lamp.

### Nits
1. The salt wall's foot is a wavy black line along the floor, like a tide mark. Soften it (`rough` amplitude at `p.y < .1`: `.05 → .02`).

---

## 4. pt-b-1.C, the Survey Cut (6/10)

*A real room at last, but dim, royal blue, and lit brown. The boots are toys.*

### Round-2 notes
- Fixed: **the tan floor** (lower third 60 → 36, busyness 2.02 → .38); **the chamber** (low and close, reframed exactly as asked: boots at u .66 v .60, cot above, shelf left); **the cot** (X-legs, a visible sag, rails outside the canvas: it reads as a camp cot); **the boots' clogs and mats** (gone; they read as boots now); **the beam anchor** off the lower third; **the shelf's pegs**; the tin is cool, not wood.
- Not fixed: **the look-at is not lit as the brightest thing** (the floor in front of the boots is brighter than the boots, and both are dim); **the warm is brown, not gold** (floor 90,71,64, G/B 1.1; asked ≥ 1.6); **the doorway's shape on the floor** (not legible).

### Blockers
1. **There is no light in the picture, and what there is is brown.** The top 1 % is 69 (the hall: 177). The 90th percentile is 52: the whole frame sits in one dim mid-dark, with nothing to look at first. The lamp's pool (90,71,64 on the floor before the boots) is mauve-brown, even with `gold: 1`, because `warm .006` is nearly off. The violet ambient is strong enough (`ambC [.75,.7,1.7]`, `amb .55`) to wash any warm light back toward rose. The brief's "warm, weak" means weak *next to the hall*, not a 69-level painting. **Fix:**
   - Lamp `k 11 → 18`, `warm .006 → .06`. `ambC → [.8,.72,1.45]`, `amb .55 → .42`, so the corners stay violet and the lit floor can be gold.
   - The toe kick `k .1 → .5`, `r .3 → .4`: the boots' toes and cuffs should reach about 150 (now 57–68).
   - Targets: p99 ≥ 130, warm ≤ 12 %, and the floor at `(400,1000)` with G/B ≥ 1.4.

### Should fix
1. **The boots read as toy wellingtons.** The legs are straight ribbed cylinders with thick round open tops (a pipe section), the lacing reads as rings round the leg, and the feet are quilted pillows. **Fix:** oval, not round, legs (`q.xz * vec2(1., 1.25) → vec2(1., 1.6)`), the leg tapering to the ankle (`- .004 * q.y → - .012 * (.18 - abs(q.y - .18))`), and the cuff thinner (`.014 → .008`), folded down one side only (`* step(0., q.z)`). Lacing on the front only (`q.x < -.03` is right, but the cut width `.003` renders as rings: use `engrave(lace, .005, .002)`, and limit it to `abs(q.z) < .025`). Flatten the foot's quilting: the foot box's rounding `.036 → .022` with a lower, longer toe (`.11 → .125`). One boot leans against the other (`lean .1 → .18` toward `+z`), which says "put down for the morning".
2. **The notebook is missing.** It is modelled at `y .452 - .13 = .322`, and the canvas at z 1.62 sags to about .344, so the notebook and pencil sit *inside* the canvas. **Fix:** place it on the sagging canvas: `y = .47 - sag(z 1.62, x .86) + .008 ≈ .352`, i.e. `.452 - .13 → .452 - .1`, the same for the page and pencil. Tilt it a little with the sag (`rotate x by .08`).
3. **The walls are royal blue, not the hall's mauve.** They read 29,28,64 (B/R 2.2; the hall's shadowed stone is about 1.4), and they fill 60 % of the frame, saturated and flat. The painting reads as another game's night-time bedroom. **Fix:** the `ambC` change in the blocker, plus `grade: [1.12, .98, .86]` (as the corner) and the fill lights' colour `[.4,.37,.85] → [.46,.4,.8]`.
4. **The doorway's shape on the floor isn't legible.** There is a vague darker triangle at lower left and a fan of light to the boots, but no two straight shadow edges. With `k 18` and `r 1.2 → .8` (and `blur.px 1.4` kept), the jambs' shadows should show. Check the threshold stone isn't casting the whole shape away (it's `.04` tall at the lamp's height 1.6: fine).
5. **The first beam anchor is huge and at the words' edge:** u .24 v .23, scale 1.31, 0.65 m from the camera. On device it will be a broad shaft right under the place name. **Fix:** move it into the room, where the doorway's light passes over the cot: `p [.2, 1.1, 1.8]`, `w .2`, and check `s` ≤ .6.

### Nits
1. The rod on the shelf is still barely there (a dark line on a dark plank at u .1–.25 v .36). The violet rim light (`k .25`) is too weak: `k .6`, and the rod's radius `.018 → .022`.
2. Two comments share one line again (`/* the roof close and dark overhead */ /* the near floor, … */`), and the near-floor comment belongs to the line above. Also in the lights (`/* a little violet on the cot's things */ /* under the roof */`).

---

## 5. pt-pl-w1-below-the-lamp (5/10)

*Cold, quiet and gold at the foot, but it reads as a vent over a screen under a cooker hood.*

### Round-2 notes
- Fixed: **the mouse hole** (a rounded, slightly uneven recess with a visible back); **the hard oil oval** (now a soft ring, heavier low and to the sides, with a dull sheen); **the salmon field** (the warm is a band at the wall's foot, 136,110,85, tan-gold; the lower third 82 → 39); **cold stone** (the wall away from the pool is violet, 46,40,74; the quilting is gone); **the ledge's arris** rounded; **the beam anchors** in frame; **the comment** fixed.
- Not fixed: **the vertical joint** at u .35 (still a full-height pipe); the upper corners are still warm-lit wall inside the words band.

### Blockers
1. **The recess and its strokes read as an appliance.** The mouth has a thin pale rim all round, a *glowing outline*: the "wiped clean" gap (`smoothstep(.0, .025, sd)`) sits exactly where the floor glow lights the lip. It draws the shape like a screen's bezel, and the brief rules out outlined objects. The five strokes are identical capsules at an exact `.05` pitch, rounded both ends, each with a lit bottom: they read as a vent grille or a row of indicator lights. A vent over a rounded screen is a TV or a microwave, not an old hand-cut niche. **Fix:**
   - Rim: start the oil at the edge, lighter there: `ring = smoothstep(-.005, .04, sd) * …` with `gStain = .88 * ring * mix(.6, 1., smoothstep(.0, .05, sd))`, so the clean edge is a darker stone, not a pale line. And lower the floor-glow light `k .2 → .12`, which is what lights the lip from below.
   - Strokes: uneven and tapered, as cut by hand. Pitch `.05 + .012 * (h2(vec2(k, 3.)) - .5)`, length `.026 ± .008 * h2(vec2(k, 9.))`, a slight lean (`sz += (q.y - .34) * .12 * (h2(vec2(k,5.)) - .5)`), and a taper as in § niche blocker 1. Depth `.012 → .007`, width `.011 → .014`.
2. **The ledge is a floating hood, not a band.** The brief asks for "the ledge's underside as a dark band across the top of the frame". What renders is a dark trapezoid whose ends converge to v .22, with lit wall visible in both upper corners (74,59,61 at top left): a box seen from below, like a cooker hood. The camera can't come close enough to make a 0.68-m ledge span the frame (checked with `proj.mjs`: at `x 2.2` the wall line still falls inside u .09–.98, and the wall's foot drops to v .84). So darken what's beside it. **Fix:** `if (p.y > .98 && abs(p.z - 5.6) > .3) gTint *= .35;` The wall beside and above the ledge's ends is out of the lamp's downward light anyway: the ledge shades it. Then the top 22 % is one dark band, with the underside's lower edge a slightly lighter line where the floor glow catches it (`gTint .5 → .6` for `p.y < 1.14` near the front arris only).

### Should fix
1. **The eye lands on the gold pool, not the ring.** The brightest value (138,113,87) is the wall's foot at v .57–.64, below the niche. The look-at is "the dark ring round the niche's mouth": a dark look-at needs the *sharpest edge* and a *lit surround*. **Fix:** the pool light's `bloomAt` up to the niche's sill (`[2.6, .2, 5.6]`), `bloomPow 6 → 9`. Put a little of the violet graze on the ring's outer edge (`[2.5,.55,4.5] k .35 → .7`), so the ring is framed by lit stone on the left and gold below.
2. **The vertical joint at u .35 is still a pipe,** a dark full-height band with a light edge from the ledge to the floor. **Fix:** as round 2: break it at a course line (`p.y ≈ .62`), offset the upper half by .18 m, and lower the joint's contrast (`M_CUT` joint width here `× .6`).
3. **The floor's hard horizon at v .73.** A slab joint parallel to the wall runs clean across the frame, splitting the lower third into a lit strip and a dead dark field. **Fix:** move the slab line out of frame (`hallAir` floor slab offset `+ .35` along x), or soften it (`gTint .9` either side).
4. **The oil has no sheen yet.** `gPolish .3` is set, but no light reaches the ring at a glancing angle, so it reads as soot, not oil. The violet graze in should-fix 1 will give it a dull streak. Check that a faint lighter smear shows on the ring's lower-left quarter.

### Nits
1. The top beam anchor starts at v .13, inside the words band. Start it at the ledge's lower lip instead (`p [2.45, 1.08, 5.6]` → v ≈ .2), or set the live layer to fade it above v .22.

---

## What would lift all five (kit-level)

1. **`engrave()` cuts need a taper and a light.** Every cut mark in the set (the niche's strokes, below the lamp's strokes, the corner's ticks, the rings) now renders as a *capsule*: a groove with a constant width and round ends. Where the light doesn't rake across it, it goes dark, so it reads as a slot or a pill. Add an `engraveStroke(vec2 q, float len, float w, float dp)` that tapers the width to 0 at both ends (`w * (1. - pow(t, 2.))`, `t` along the stroke) and gives a slightly asymmetric profile (the lower flank steeper). Document that a cut needs a light within 30° of the surface to read.
2. **`M_SALT` crystals are too big and too faceted** (§ niche, should-fix 1): `cells3(p * 28.) → p * 45.`, facet normals `.3 → .1`. That keeps the salt a *mass* with banding, glinting at the edges of the light. Weeks 2–4 depend on it.
3. **The place checks should add the two round 2 asked for and this round needed:**
   - **warm hue:** the warm pixels' mean G/B ≥ 1.3 (the hall's lamp: 1.25–1.45). The Cut passes the 15 % check with a brown pool at G/B 1.1.
   - **look-at:** each scene declares `lookAt: [x,y,z]`, and the check fails if the brightest 1 % cluster or the sharpest-edge cluster lies more than 0.12 from its projection. That would have flagged the niche (eye on the far glow) and below the lamp (eye on the pool).
   - **dynamic range:** p99 ≥ 110 (the hall: 177). The Cut is at 69.
4. **The kit's hall has drifted from the approved hall.** `pt-b-1.A` differs from `hall.jpg` by a mean of 9.3, and the kit's own `regression/lamp-hall.js` numbers (far light `k 420`, lamp `c [1,.58,.24]`) don't reproduce `hall.jpg`'s glow either. Re-baseline: render `regression/lamp-hall.js`, `diff` it against `hall.jpg`, and fix the kit (bloom, far-light falloff, vault joints) until the diff is under 2, *before* tuning pt-b-1.A again.

---

## If only one more round

The two or three changes most likely to lift each painting below 8 to 8, in priority order.

**pt-b-1.A (7):**
1. Get the hall's glow back: kit re-baseline against `hall.jpg` (kit 4), then far light `k 560, r 40`, `bloomPow 18`, `bloom.alpha .26`; core ≥ 220, width ≥ 150 px.
2. Cups, not windows: drop the sill, shallower round-headed recess (`.3 × .42`, depth to `2.94`), bowl rim proud, jittered pitch.
3. `gold: .7`, lamp `warm .13`, `r 1.25`: a gold pool the hall's size under the live flame.

**pt-b-1.B (6):**
1. Trough profile `dep = .11 * fade * q * q` with `e = s / .27`, plus the bottom darkened by `gTint 1 - .35q`. This alone decides whether the look-at reads.
2. Light across the troughs: the turn's spill to `y .7`, `k 34`, offset 1.5 m to the outer side; the polish streak on the lit flank only.
3. The inner wall given form (bounce `k 14, y 2.4`, courses), and `expo 1.75` so the lower half isn't murky.

**pt-pl-w1-pick-niche (6):**
1. The lip as a real worn sill (geometry, no albedo rectangle) with five tapered, shallow strokes, lit by the lip key at `k 1.4`: the sill's edge the brightest right of u .3.
2. The salt: crystals `p * 45.`, facets `.1`, banding restored below 1.6 m.
3. Take the eye off the left: the main light `y 1.1` (no floor wedge), the far light `k 40`.

**pt-b-1.C (6):**
1. Light and colour: lamp `k 18, warm .06`, `ambC [.8,.72,1.45]`, `amb .42`, toe kick `k .5`. Targets: p99 ≥ 130, a gold floor (G/B ≥ 1.4), walls mauve not royal blue.
2. The boots as worn leather boots: oval tapering legs, a thin cuff folded one side, front-only lacing, a flatter foot, one leaning on the other.
3. Lift the notebook and pencil onto the canvas (`y ≈ .352`), so the room carries its second human object.

**pt-pl-w1-below-the-lamp (5):**
1. Kill the appliance read: no pale rim round the mouth (the oil starts at the edge), five hand-cut, uneven, tapered strokes.
2. The top 22 % as one dark band: darken the wall beside and above the ledge's ends (`gTint .35` for `p.y > .98`, `|z - 5.6| > .3`).
3. Put the eye on the ring: the glow's bloom up to the sill, the violet graze `k .7` on the ring's outer edge so the oil shows a dull sheen, and the vertical joint broken at a course.
