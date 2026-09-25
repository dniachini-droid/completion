# Batch 1 (D-075, room scale): critique

> **SEALED (D-015).** Quotes the painting briefs. Dan must not read this.

Same bar as `CRITIQUE-W2-2.md`: **8/10 goes in**; **7 goes in** for places with 3+ critiqued rounds (below-the-lamp, smooth place, b-2.B, box by the cot). Camp views are judged as camp views (one form, one light, a close thing to look at), with the same beauty bar. 8 means Dan would accept it beside the hall as the same painter's work.

Reviewed: the ten full-size bakes (1320×2868, `camp/final/`, `hall/final/`), each whole at phone size beside `hall-ref.jpg` and the accepted `pt-b-1.A/B/C`, `pt-b-2.A`; crops of every look-at. `check.mjs`: all ten pass every line. Brightest = brightest 24 px block. u/v are fractions of the frame from top left.

| | Hall | b-2.B | box | recess | cv-08 | cv-09 | smooth | below | cv-03 | cv-04 | cv-05 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Median / p90 / p99 | 36/87/177 | 19/54/86 | 19/52/76 | 25/56/74 | 14/47/74 | 23/68/112 | 22/78/132 | 32/85/132 | 22/39/106 | 24/47/90 | 21/70/155 |
| Words / button mean, busy | 26 / 37 .37 | 11 / 17 .26 | 15 / 21 .21 | 23 / 16 .23 | 12 / 12 .17 | 14 / 20 .36 | 18 / 15 .47 | 24 / 28 .22 | 11 / 23 .26 | 14 / 27 .39 | 22 / 13 .24 |
| Warm | 5 % | 6.6 % | 0.3 % | 0 % | 1.1 % | 1.0 % | 0 % | 3.1 % | **11.7 %** | 2.7 % | 0.1 % |
| Brightest | door glow | rod's blade (u .43 v .53) | glint on the slate (u .54 v .52) | open wall (u .39 v .54); pin ≈ 10 px | DAY 1 tape (u .63 v .52) | lit end of shelf (u .66 v .50) | the patch (u .34 v .47) | open wall (u .79 v .34) | lamp's wall pool (u .83 v .46) | near cup's wall (u .15 v .45) | far wall glow (u .50 v .44) |

## Verdict

- **One of ten reaches its bar: pt-pl-w2-smooth-place, 7, in** (4th round).
- Room scale fixed the "toy close-up" problem and broke something else: in the camp, the look-at is now a small object in a large, dim, empty lilac room. p99 74–112 against the hall's 177; at phone size the frames read as murk with a speck. The hall-side views keep the hall's depth but miss their look-ats.
- **Neighbours that read alike:**
  - **smooth place and cv-05 are nearly the same picture**: the same curved corner, troughs running in from the lower left, the same far violet glow low right of centre. cv-05 must turn across the troughs, as the brief says, not along them.
  - **b-2.B and cv-09 are the same floating shelf** on the same wall, seen from the same side, at the same height. Give cv-09 the brief's "eye height, VP along it", low and end-on, so the shelf runs away from the camera.
  - **cv-04 reads as hall-ref**: a symmetric corridor with a violet glow at the VP. "The hall seen backwards" doesn't come across.
  - The five camp frames share one dim lilac wall with one small object, low contrast. They need a light each can own.

---

## 1. pt-b-2.B, the rod (5/10; was 4) — out

*A table knife on a floating plank.*
1. **The rod reads as a kitchen knife**: a pale steel-grey blade with a rounded tip, a guard step, and a darker rounded handle (crop u .38–.55 v .50–.54). No stone, no marks, no hook visible. Tint the whole rod one dark stone value (`gTint ≈ .3`, matt), taper blade into handle with no step (`smin` ≥ .02), and leave the light only on the edge's thin line.
2. **The look-at is ~15 % of the frame width in a 70 % empty frame.** Room scale is right, but not this far: step to ~1 m, `f` longer, so the shelf crosses the frame from lower left and the rod spans ≥ 35 % of the width. The warm haze on the wall above (u .40–.55 v .40–.47) reads as a smudge; tie the lamp's light to the edge (`reach`) instead.
3. The shelf is a thin plank on one bracket, floating off the wall (u .10–.35 v .53–.57). Make it cut stone, deeper, meeting the wall; show the pencilled line under it.

**What is still short:** dark stone, whole and large in the frame, a single gold line along its edge the brightest thing; a shelf that is part of the wall.

## 2. pt-pl-w2-box-by-the-cot (5/10; unchanged) — out

*A grey ingot box with a can on it, small in an empty corner.*
1. **Too small and too far**: the still life spans u .38–.60, v .50–.56; the rest is dark wall and a bare corner. Come to ~0.8 m low along the wall; the box should fill the lower middle third.
2. **Materials still wrong**: the box is a hard grey block with a seam (stone or metal, not soft card); the slate is fitted square as a lid; the mug is a closed can. Soften the card (bellied, rounded, a dent, matt paper grey), turn the slate off-square, and show the dark crescent of the open rim against the slate.
3. **Brightest is the glint on the slate** (u .54 v .52), not the mug's rim. Pull the pool light down and give the rim alone a `reach`-limited warm point.

**What is still short:** a soft card box close enough to read, a slate laid across it, a tin mug plainly upside down, one warm glint on its rim.

## 3. pt-pl-w4-recess-above-the-cot (4/10; round 1) — out

*A dark tile stuck on a blank wall, with a thumbtack in a seam.*
1. **No recess.** The slate is a dark square plaque on a flat wall (u .45–.55 v .40–.47); there is no mouth, no depth, no stone round it. Cut the recess (a hand deep) and set the slate across its mouth, a dark gap showing above or at one side.
2. **The pin is ~10 px at full size and not the brightest thing** (open wall at u .39 v .54 is). It reads as a pale disc on a stitched line. The crack is an aliased dotted seam (u .43–.47 v .38–.46): widen it slightly, soft-edge it, give it an inner shadow. Give the pin a steel shaft glint and a `reach`-limited cold-white point so it is the frame's peak.
3. **80 % of the frame is blank lilac wall** and the floor is black (v .78–1). From the cot's foot, looking up, the arch should frame the recess, with the warm light coming from below.

**What is still short:** a real recess with a slate across it, the lamp's weak light raking up the wall, and a tiny steel point that is the brightest thing.

## 4. pt-cv-08, her cot (5/10) — out

*A wooden bench in the dark; the tape is right.*
1. **The cot reads as a bench or ironing board**: a flat wooden frame, a flat dark top, cross legs (u .30–.95 v .45–.58). The signature, the sag, is absent. Give the canvas a visible catenary sag and a fabric sheen along it.
2. **The frame is dim and top-heavy**: median 14, the upper 45 % empty vault, the boots black blobs cut by the frame bottom (u .40–.55 v .58–.66). pt-b-1.C works because of its warm floor pool: bring the lamp's weak pool onto the cot and the floor under it.
- Good: DAY 1 on the tape is the brightest thing and readable (u .63 v .52).

**What is still short:** a canvas cot that sags, in the lamp's warm pool, the tape as the one bright note.

## 5. pt-cv-09, her shelf (5/10) — out

*A concrete slab with a grey strip painted on it.*
1. **The clean stripe reads as a painted or taped band** with a hard jog in it (u .45–.62 v .50–.52): two offset rectangles. Make it a soft-edged stripe, rod-shaped (narrow at the tip, wider at the handle), with dust grain round it thinning toward the edges.
2. **The shelf floats** (a slab in front of the wall, lit end at u .66 v .50 brighter than the stripe). Same fix as 2.B: stone shelf joined to the wall, camera at eye height looking along it.
3. Reads as b-2.B minus the knife; see Sameness.

**What is still short:** an absence you see as a shape: a rod-shaped clean stripe in grey dust, grazed by the warm light, on a stone shelf.

## 6. pt-pl-w2-smooth-place (7/10; was 6) — **in** (4th round)

*The room scale suits it: the curve, the troughs, a gleam on the wall.*
- Why it passes: beside the hall it is the same hand: the vault curving away, the troughs leading in, fog, and the patch is the frame's brightest value (197 175 224 at u .34 v .47). The smudges are gone.
1. **The patch still reads as a light falling on the wall, not a polish**: a soft round bloom with the course joints running straight through it (u .30–.38). Erase the joints and marks inside the patch, lift its base tint a step, and stretch the highlight along the course.
2. **Marks still crisp black hairs** right next to the patch (u .20–.45 v .30–.55). Fade them toward the patch as the brief asks.
3. The far glow (155 at u .90 v .53) nearly matches; drop it a step. The black upper right (u .55–1 v 0–.40) is a hole in the picture; a trace of fill on the vault.

**What is still short:** a patch that is a different surface: joints gone, a streak of sheen along it, the marks around it fading.

## 7. pt-pl-w1-below-the-lamp (5/10; was 6) — out

*Room scale lost the niche: a tar splat under a floating crate.*
1. **The niche is a black blob**: a jagged, even black shape with a dark rim (u .43–.58 v .40–.47), no inside, no oil sheen. Round 7's lit inner floor is gone. Restore the recess's interior light and the oil's dull sheen, heaviest at the sill.
2. **The ledge is a dark crate in the top-left corner** (u .0–.45 v .0–.12), not the brief's band across the top. Kneeling and looking at the niche, the ledge's underside should span the top of the frame.
3. **Brightest is open violet wall** (u .79 v .34); the strokes are still raised pale pegs (u .45–.58 v .37). The lower 45 % is empty floor with diagonal joints. Come closer (≤ 1.2 m), lower, so niche and ledge fill the frame.
- Good: the gold at the wall's foot is back (u .35–.60 v .55–.60).

**What is still short:** round 7's close composition with its lit mouth, plus the gold at the foot: an oiled niche with an inside, under a dark ledge band.

## 8. pt-cv-03, the hall from the passage (6/10) — out

*The right idea, one small warm light against a long dark, in sepia.*
1. **The flame is a flat yellow egg** (u .76 v .45); the brightest value is the wall pool beside it (u .83 v .46). The lamp is a dark pebble on a floating box-ledge. Give the flame a tiny hot core and a halo, and make the flame the peak.
2. **The violet glow at the VP** (u .40 v .45) contradicts "going away into dark" and before-state light by the lamp alone. Dim it to a trace.
3. **Warm 11.7 %**: the whole right wall is sepia-brown, like a toned photo. Limit the lamp's reach so the gold stays on the ledge and a metre of wall.

**What is still short:** a single steady flame, hot and tiny, as the brightest thing, and the hall beyond falling into cold dark.

## 9. pt-cv-04, the hall from the far end (6/10) — out

*Two lines of cups going back. It reads as the hall forwards.*
1. **The look-at is missing**: "rings on the ceiling, lit". The vault is black with diagonal joints (crop u .3–.7 v .3–.5); the rings are on the walls. Pitch up, put rings in the vault, and let the cups' light catch them.
2. **It reads as hall-ref**: symmetric, VP violet glow. Looking back to the ledge, the far end should be the lamp's warm point, not a violet door. The salt glow round the corner beside the camera is not visible; bring it in at one edge.
3. The near niches are big dark D shapes (u .0–.2 v .40–.55); crop or dim them.

**What is still short:** lit rings overhead, the lines of flames converging on the ledge's warm point, a cold salt glow at one edge.

## 10. pt-cv-05, in the trough (6/10) — out

*A lovely corner; the leaf is a sticker in a spotlight.*
1. **The leaf floats on the trough's rim in a pale spotlight disc** (u .72 v .57): flat, saw-edged, no contact, no shadow. Put it down in the trough bottom, curled, with contact shadow, and take the disc away; it should be lit only by the place-light.
2. **Brightest is the far wall glow** (213 at u .50 v .44); the leaf is ~2 % of width. Camera lower and nearer, the leaf in the lower-middle third.
3. **Same picture as the smooth place**; the brief looks *across* at the other trough. Turn the camera ~70° so the second trough runs across the frame.

**What is still short:** a curled brown leaf resting in the trough, the only warm-brown thing, with the other trough across the frame.

---

## Summary

| Id | Score | Goes in? |
|---|---|---|
| pt-b-2.B | 5 | no |
| pt-pl-w2-box-by-the-cot | 5 | no |
| pt-pl-w4-recess-above-the-cot | 4 | no |
| pt-cv-08 | 5 | no |
| pt-cv-09 | 5 | no |
| pt-pl-w2-smooth-place | 7 | **yes** (4th round) |
| pt-pl-w1-below-the-lamp | 5 | no (was 6) |
| pt-cv-03 | 6 | no |
| pt-cv-04 | 6 | no |
| pt-cv-05 | 6 | no |

Room scale suits the large forms (the corner's curve, the long hall), and it lost the small look-ats: the camp objects shrank into dim empty rooms and read as CG props (knife, ingot, tile, bench). Keep room scale, but at 0.8–1.2 m for camp objects, with the lamp's light limited by `reach` to the one thing, so its value reaches the hall's peak.
