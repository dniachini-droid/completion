# Week 2 places, round 1 (and week 1's last two, round 6): critique

> **SEALED (D-015).** Quotes the painting briefs. Dan must not read this.

Same bar as rounds 4 and 5: **8/10 or better goes into the app; below 8 stays out and keeps its stand-in.** 8 means Dan, who approved the hall, would accept it beside the hall as the same painter's work: beautiful, with one clear thing to look at, and it would not embarrass the game. The words sit in the top 22 % and the button in the lower third, so those bands stay calm.

Reviewed: the seven bakes at full size (1320×2868, `w2f/`); week 2's five side by side, and beside `hall-ref.jpg` and the accepted `pt-b-1.A/B/C`; crops of every look-at; the two week-1 close-ups beside round 5 (`r5f/`) and the round-6 diff (`321d0de..c07944a`). Measured with `stats.mjs` and the kit's `check.mjs` (all checks pass for all seven); point colours are 12 px means, "brightest" is the brightest 24 px block. u/v are fractions of the frame from top left.

| | Hall (bar) | b-2.A Gallery further in | above the ring | b-2.B the rod | smooth place | box by the cot | pick niche (r6) | below the lamp (r6) |
|---|---|---|---|---|---|---|---|---|
| Median luminance | 36 | 27 | 36 | 34 | 29 | 40 | 45 (was 43) | 36 (30) |
| 90th percentile | 87 | 86 | 78 | **51** | 118 | **52** | 96 (93) | 72 (63) |
| Brightest 1 % | 177 | 172 | 121 | **75** | 168 | **63** | 168 (167) | 119 (105) |
| Words band (top 22 %), mean (kit) | 26 | 18 | 25 | 20 | 20 | 30 | 31 (26) | 13 (11) |
| Button band, mean / busyness (kit; hall .37) | 37 / .37 | 25 / .51 | 33 / .51 | 37 / .35 | 26 / **.58** | 37 / .33 | 43 / .20 | 43 / .20 |
| Warm share (kit) | 5 % | 0 % | 0 % | 3.0 % | 0 % | 1.8 % | 0 % | **15 %** |
| Mean RGB (B/R) | 49 41 70 (1.43) | 40 35 62 (1.55) | 44 39 67 (1.52) | 37 30 47 (1.27) | 53 44 70 (1.32) | 37 32 57 (1.54) | 55 48 86 (1.56) | 42 35 45 (1.07, was 1.00) |
| Brightest | door glow 212 208 240 | 243, the wall **beside** the ring (u .54 v .47) | 152, the pale thing (u .60 v .40) | 90, the shelf top (u .40 v .53), **not the edge** | 211, the patch (u .47 v .51) | 82, the mug's top (u .43 v .54) | 209, glow left of the niche (u .46 v .46) | 159, gold on the floor (u .55 v .64) |
| The look-at itself | | ring 206 194 234 (u .46 v .48) | pale thing 216 201 233 | blade top 75 63 97 (u .30 v .47) | patch 161 141 197; wall below it 137 115 161 | mug top ≈ 82; slate 44 36 52 | slot mouth 19 17 33; slot floor 35 30 62 | mouth 3 3 3 (u .45 v .47) |

## Verdict

- **None of the seven reaches the bar.** Week 2 is a first round and reads like one: every look-at is present and in the right place, but three of the five are built as clean geometric objects (a spatula, a lidded wooden box and mug, an exclamation mark) rather than painted things in light. The week-1 close-ups moved a step each and are still short for the same reason as round 5.
- **pt-b-2.A, the Salt Gallery further in: 6/10.** Out. The best of the week, with real atmosphere; one blocker.
- **pt-pl-w2-above-the-ring: 3/10.** Out.
- **pt-b-2.B, the rod: 3/10.** Out.
- **pt-pl-w2-smooth-place: 5/10.** Out.
- **pt-pl-w2-box-by-the-cot: 5/10.** Out.
- **pt-pl-w1-pick-niche: 6/10** (unchanged). Out.
- **pt-pl-w1-below-the-lamp: 5/10** (unchanged). Out.

Counts: **10 blockers, 22 should-fix, 8 nits** (2.A 1/4/1, above 2/3/1, 2.B 2/3/1, smooth 1/3/1, box 2/3/1, niche 1/3/2, below 1/3/1).

### The week side by side (sameness)

The briefs ask that no two neighbouring scenes read the same. Two pairs do, or nearly:
- **pt-b-2.B and the box by the cot** read as the same picture: a dark brown object lying level across the middle of the frame on a flat ledge, in blue murk, with an empty dark upper half. Both reuse pt-b-1.C's room and both have lost what makes that room good (the gold pool). When they are redone, keep them apart on purpose: the rod close, diagonal, warm-edged and high in the frame; the box low at the floor, looking along the wall, cooler, with the mug small against a large dark room.
- **pt-b-2.A and the smooth place** both put a pale oval hotspot at the frame's centre (u .54 v .47 and u .47 v .51) on a lit lilac wall sweeping diagonally. Once the smooth place's patch reads as polish rather than a spot of light (below) and 2.A's peak moves onto the ring, this goes away.
- 2.A and above-the-ring share the salt and the ring but are different enough in camera; that pairing is fine.

---

## 1. pt-b-2.A, the Salt Gallery further in (6/10) — out

*A real gallery with real light in it. The salt's beds have become a mountain range cut from black paper.*

### What works
- **The light rakes.** One cold light from further in on the right, a far glow (137 121 182 at u .90 v .47) giving depth, the wall falling off into dark near the camera. It is the only week-2 painting with the hall's sense of air.
- **The ring reads**: one clean round cut, its inside fresh and bright (`gPolish .7`, `gTint 1.15`), set above the line of marks with salt around it. The tally band is legible and varied (bars, ticked bars, drops, gaps), and looks hand-made.
- The words band is one dark mass (18) and the camera, eye height with the gallery running off right, is the brief's.

### Blockers
1. **The salt's beds read as torn black paper, or a mountain skyline, not banded salt.** Two dark bands with hard, jagged, ridge-profile edges run the length of the wall (u .0–.80, v .23–.48, the lower one passing just over the ring). They are the strongest shapes in the frame, they lead the eye along the wall past the ring, and they look like nothing in pt-pl-w1-pick-niche's salt (which is soft grey-white banding). They look like hard cast shadows of the wall's `rough(p, .05, 5.)` relief under the raking key (`shadow: 1`, `r 4.5`) at a grazing angle. Soften them: smaller relief (`.05 → .02`) or a higher frequency so the relief makes crystal texture, not ridges; a softer shadow on this light; and let the banding come from the salt material's grey and white beds, soft-edged.

### Should fix
1. **The ring is not the brightest thing: the wall just right of it is** (243 at u .54 v .47 against about 206 on the ring). The catching light (`p [-1.5, 1.95, ZR + .5]`, `k 1.1`, `r .32`) sits half a metre past the ring, so its peak lands beside it. Put it at `ZR` (or `ZR − .1`, so the lit side of the cut faces the camera) and let the ring's cut hold the peak.
2. **The ring is small** (about 57 px across at 1320 wide) and nothing near it shows it is "larger than the others": the tally's small rings (`kind > .92`) are too rare to be seen near it. Put one or two small rings in the tally below it (force `kind` for a couple of cells near `ZR`), and enlarge the ring a step (`.12 → .15`).
3. **The button band is busy** (.51 against the hall's .37): the band's black underside, the wall base line and diagonal floor joints all converge in the lower third. Darken the near floor more (`mix(.4, 1., …)` → `.25`) and let the band's shadow fade into the dark instead of making a hard black stripe (u .0–.60, v .58–.62).
4. **The tally band reads as a metal ruler or rail**: dead straight, even width, with a clean specular stripe along its top arris. Give its top edge wear (roughen the arris, break the highlight), and let its line wander more than `.015 * sin(p.z * .7)`.

### Nits
1. The glints cluster up-left of the ring (u .35–.48, v .40–.46) like a spray of stars; spread them along the crystals, fewer near the ring.

### What is still short
- Salt that reads as salt (soft beds, crystal, no black silhouettes), and the peak of light on the ring itself. With those two, this is close to 8.

---

## 2. pt-pl-w2-above-the-ring (3/10) — out

*At a glance it is an exclamation mark.*

### What works
- The pale thing is, technically, the brightest value (216 201 233 at u .60 v .40), as the look-at should be.
- The lower third is calm in tone (33), and the palette is the Site's.

### Blockers
1. **The composition is a "!" glyph.** A vertical black crack, pointed at its foot, stands directly over a round ring, both centred (u .55–.72, v .16–.62). At phone size this is the first and only read. It will look like a UI symbol behind a button, not a painting.
2. **There is no depth and no looking up.** The camera faces the wall almost square (`yaw −94`, `pitch 20`), so the salt is a flat plane; the dark roof strip (v .12–.20) and the dark band across the middle (v .32–.46) read as painted stripes on a flag. The crack is a flat black ribbon with blade-tip ends, no inner walls going back into the dark, so "far back in the crack" can't be seen. The pale thing is a crisp white rectangle (`box` `.01 × .034 × .008`, `gTint 1.2`) that sits visually at the crack's mouth, and reads as a sticker or a dead pixel, not something deep inside.

### Should fix
1. **The ring reads as a glass or rubber washer lying on the wall**: bright inner and outer rims, embossed rather than cut (`engrave(rr, .017, .016)` with `gPolish .6` on both flanks). Light one flank only.
2. **The count beside the crack is five identical slots** (u .66–.75, v .40): a vent grille. Vary spacing, length and tilt as in the tally of 2.A.
3. **The salt's crystal cells show as a Voronoi pattern** at this magnification (u .0–1, v .45–.80): crazy paving again. The close camera needs the finer salt, or more blur on the near wall (`blur.k .6 → 1`).

### Nits
1. The glints to the right of the crack (u .95–.97, v .41–.47) sit at the frame edge, outside any light.

### What is still short
- Rethink the camera: close to the wall and **looking up it steeply** (pitch 45–60), offset so the crack runs diagonally away into the dark; the ring small at the bottom edge or just out of frame, so the two never stack into a glyph.
- A crack with inside: two lit lips, inner walls stepping down into black, and at the back one small, soft pale highlight (a glint on a sliver, not a lit rectangle), with dark between it and the mouth.

---

## 3. pt-b-2.B, the rod (3/10) — out

*A paint scraper on a block, on a shelf, in the dark.*

### What works
- The camera is close on the shelf, and the button band is calm (37 / .35).

### Blockers
1. **The rod reads as a metal spatula, a paint scraper or a diving board.** A flat blade of even width with a square end, a black rubber-looking grip with ridges (the handle marks read as grip), resting on a chip that renders as a large square stand (u .07–.20, v .47–.52). It lies level across the frame at v .47, not at a low diagonal. Nothing says stone, nothing says old, nothing says fine.
2. **The edge doesn't catch the light, and nothing else does either.** The brief's look-at is "the rod's fine edge, catching light like a blade". The brightest thing is the shelf top (90 at u .40 v .53); the blade's top is 75; p99 is 75 (the hall 177). The edge light (`p [-.3, 1.7, 3.2]`, `k .1`, `r .2`) is far too weak and not at a grazing angle. The picture is 45 % empty murk above a brown plank; it has no beauty in it yet.

### Should fix
1. **The shelf's front edge** is a brown plank straight across the frame (u .0–1, v .53–.56): it cuts the picture in two. Lower the camera or angle the shelf so its edge runs diagonally, darker.
2. **The pencilled line under the shelf is invisible** (`gTint .42 .42 .48`, `.0022` wide). Graphite should show as a faint grey line with a slight sheen; widen it and give it `gPolish`.
3. **The pale wedge of floor at lower left** (u .0–.45, v .93–1.0) is the room's floor seen past the shelf: crop it or darken it.

### Nits
1. The notch where the handle meets the blade (u .59–.61, v .47) reads as a machined shoulder.

### What is still short
- A stone rod, not a tool from a shop: dark, fine-grained, a bevel that narrows to a honed edge, small irregular chip under the blade end, the handle a worn round of the same stone with cut marks, not ridges.
- Camera low and close, the rod crossing the frame on a rising diagonal (lower left to upper right), its edge turned to the lamp so a thin line of warm light runs along it: the brightest, sharpest thing in the frame, the shelf and wall falling off into violet dark.

---

## 4. pt-pl-w2-smooth-place (5/10) — out

*A handsome corner with a torch beam on the wall.*

### What works
- **The vault.** The courses sweeping up and round to the upper right are the most striking composition of the week, and they belong to the corner and to nowhere else.
- The patch is the brightest area (211 at u .47 v .51), in the right place, high on the wall.
- The words band is dark (20) and the place is recognisably pt-b-1.B's bend seen from below.

### Blockers
1. **The patch reads as a spotlight on the wall, not a mirror worn by touch.** It is an even pale ellipse with a uniform soft edge (`k = 1 − smoothstep(.3, .38, r)`, `gTint 1 + .55k`), no highlight, no reflection, no gradient of wear, and a course joint crossing it still shows. A polished patch should read through **specular**: a streak or soft reflection of the bend's light, the stone's mottling vanishing inside it, and the polish fading out gradually to the rubbed zone. And the "marks rubbed faint" round it are the crispest things on the wall: black ticks like hairs or nails (u .30–.95, v .40–.50), which say the opposite of the brief.

### Should fix
1. **The lower courses compete** (137 115 161 at u .3 v .60 against the patch's 161): a large lit wall under the patch. Darken the wall below `y 2.4` further (`mix(.38, 1., lo)` → `.25`) or pull the key's falloff up.
2. **The troughs aren't in the frame**; the bottom fifth is black floor (4 3 8 at u .5 v .90) with a hard curved edge at v .75–.80 cutting across the button band: busyness .58, the highest of the set. Show the trough rims faintly lit, low in the frame, and soften that edge.
3. **The patch and 2.A's hotspot** make the same picture: a pale oval at the centre of a raking lilac wall (see "The week side by side").

### Nits
1. A few stray dark specks in the upper-left courses (u .05–.20, v .23–.30) read as holes.

### What is still short
- Make the patch the polish: tint lift down (`1.55 → 1.2`), let `gPolish 1` carry it, and place the light so its specular lands on the patch; blend the edge over a much wider band (`smoothstep(.15, .45, r)`); fill the joint inside it.
- Marks that fade toward the patch, shallower and paler (engrave depth `× (1 − faint)`), never black.

---

## 5. pt-pl-w2-box-by-the-cot (5/10) — out

*Clear what to look at; but a wooden box and a lidded mug in a blue room, and nothing lit.*

### What works
- **One clear thing to look at**: the mug on the box, alone against a long wall, the camera low at the floor as the brief asks.
- Words band 30, button band calm (37 / .33). It won't confuse anyone.

### Blockers
1. **The still life reads as a solid wooden chest with a lid and an upright mug, not soft card, a slate and an upturned tin mug.** The box is crisp-edged and dark brown with square corners (the `.012` rounding and the slump don't show); the slate is the same brown as the box (44 36 52), so it reads as the box's lid, not a thin grey stone laid across it. The mug's upturned base is a flat pale disc on top, which reads as an upright mug with a lid (or full of milk); there is a notch in its rim at top left (u .40 v .535) where the hollow's cap (`m.y − .085`) coincides with the top face; the handle is a thick toy torus. Nothing tells the eye "upside down": give the open end a rolled rim bead where it meets the slate, the top a pressed base ring, and a thin strap handle; make the slate grey-black with a paler cut count; give the card sagging sides, a dented corner and a paler, papery tone.
2. **Nothing is lit.** p99 63, brightest 82 (the mug's top); the lamp's warm light barely registers (warm 1.8 %) and the "glint on the mug's rim" is not visible. The walls are plain royal blue (B/R 1.54) filling the top half. Beside the hall it is flat and dim; it has none of pt-b-1.C's gold pool. Raise the lamp's light where it falls on the box (`room.lights[0] k 6` is too low from here; or add its pool on the floor before the box), and let the mug's rim catch it.

### Should fix
1. **The count on the slate is seven neat parallel slots** (u .20–.32, v .56–.58): a vent. Vary them as in 2.A's tally.
2. **The wall-foot step** runs as a hard diagonal band across the lower half (u .0–1, v .56–.75); with the vault corner's straight seams (upper right) the room looks modelled rather than cut. Soften the step or crop it.
3. **Same picture as pt-b-2.B** (see "The week side by side").

### Nits
1. The box floats a little: its contact shadow on the step is thin; darken the join.

### What is still short
- Real materials (soft card, grey slate, dented tin) and a small pool of warm light on them, so the mug's rim is the brightest, sharpest edge in the frame.

---

## 6. pt-pl-w1-pick-niche, round 6 (6/10) — out

*The label is gone; in its place a padded bumper under a letterbox.*

### What changed
- Pitch −9 → −12; the niche's back fill `k .02 → .1`; the lip rebuilt as a rounded sill (`box` in the slot's frame, `smin .03`, `M_CUT_SMALL`, `gTint .72`), proud by `pr .016` in the middle; strokes widened and made uniform (`engrave(ln, .009, .007)`).

### What improved
- **The slot has a floor.** A violet floor and back are faintly visible inside it now (35 30 62 at u .75 v .51); it is less of a flat black box.
- **The lip is darker than the salt**, not paler, and has no torn edges. Round 5's paper label is gone.

### Blockers
1. **The lip is a proud, rounded bar again, and the niche reads as mounted on the wall.** The sill is cushion-round along its whole length (the `.016` rounding plus `.016` protrusion), with a dark shadow line under it, and its right end runs well past the slot and ends in a lit rounded cap standing clear of the salt (u .82–.88, v .49–.53). The strokes are five identical vertical slots, evenly spaced. Together: a letterbox over a padded bumper, round 4's "bench" in another form. The ends need to die into the salt, the sill to be barely proud (lose `pr`, or `.004`), and its top arris only lit.

### Should fix
1. **The roof is still a third of the frame and flat black** (12 10 23 at u .30 v .15). The pitch change didn't crop it. `cy` up or pitch −16.
2. **The eye goes to the glow left of the niche** (209 at u .46 v .46) and the floor wedge (156 at u .30 v .56), not to the strokes. The raking light on the lip (`p [1.62, .34, ZN + .5]`, `k .3`) needs to be the strongest near the look-at.
3. **The salt's banding is still too faint**, and its crystal cells read as a cell pattern close up.

### Nits
1. The pale stick in the roof at upper left (u .11–.26, v .19–.23) is still there.
2. The salt's foot is still a wavy black line (u .40–.95, v .52–.62).

### What is still short
- As round 5: a sill of the slot's own stone carried out, flush, its ends buried; strokes as V-cuts lit on one flank, each different; the roof cropped.

---

## 7. pt-pl-w1-below-the-lamp, round 6 (5/10) — out

*Nearly the same picture: the black hole in the soot is a little violet round the top.*

### What changed
- Recess trace `k .003 → .006`; a violet light on the stone round the ring (`p [2.2, .75, 5.25]`, `k .17`, `r .6`); the ring narrowed (`smoothstep(.05, .16, …)`), stain `.85`, polish `.45 → .8`; the strokes' engrave made uniform (`.008, .006`); the recess's inside `gTint mix(.55, .06, …)`.

### What improved
- **A little violet is back** above the ring (mean RGB 42 35 45 from 36 29 36; B/R 1.07 from 1.00), and the ring is a step narrower.
- A faint brown lip shows just inside the mouth's edge.

### Blockers
1. **Unchanged from round 5: a black hole in a smudge, and the picture is still warm mud.** The mouth is still pure black (3 3 3 at u .45 v .47) with a thin outline, with no inside to be seen; the ring is still a soft soot cloud with no sheen (the `gPolish .8` doesn't show, because no light glances off the face toward the camera); the stone round it is still grey-brown except at the edges (72 62 89 at u .90 v .45); warm share 15 % (hall 5 %). Round 5's "what is still short" list (violet on the stone at round-4 strength, the oil's sheen, a mouth with a floor and sides, V-cut strokes) has been touched at strengths too small to see.

### Should fix
1. **The strokes still read as pegs or pins** (cylinder-shaded with pale ends, u .42–.62 v .37–.39); making the engrave uniform made them more so.
2. **The floor's horizons** at v .61 and v .73 still cut the lower half into strips.
3. **The brightest thing is the gold on the floor** (159 at u .55 v .64), below the look-at; the ring has no lit stone framing it.

### Nits
1. The recess's `gTint` line still carries two comments.

### What is still short
- As round 5, at strengths that show: violet stone round the ring (`k .17 → .6` or more), a visible sheen on the oil (a light placed so its reflection lands on the face), a dim floor inside the mouth, V-cut strokes lit on one flank.

---

## Summary

| Id | Score | Goes in? |
|---|---|---|
| pt-b-2.A | 6 | no (stand-in) |
| pt-pl-w2-above-the-ring | 3 | no (stand-in) |
| pt-b-2.B | 3 | no (stand-in) |
| pt-pl-w2-smooth-place | 5 | no (stand-in) |
| pt-pl-w2-box-by-the-cot | 5 | no (stand-in) |
| pt-pl-w1-pick-niche | 6 | no (stand-in) |
| pt-pl-w1-below-the-lamp | 5 | no (stand-in) |

Week 2's look-ats are all in place; what is missing is the thing the week is meant to add to the kit (small niches a hand deep, and stone polished by touch): the crack, the patch and the rod's edge each need to be **modelled in light** (a specular line, a sheen, an inside going dark), not drawn as a clean shape. 2.A is nearest and needs its salt and its peak of light fixed. The rod and above-the-ring need a new camera, not tuning. The two week-1 close-ups have now had three rounds of small parameter steps; each needs its feature rebuilt (a sill buried in the salt; a recess with an inside and oil with a sheen), not another small step.
