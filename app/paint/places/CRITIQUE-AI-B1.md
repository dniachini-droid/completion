# Critique — AI repaint, batch 1 (weeks 1–2)
> Sealed (D-015). Separate critic, 2026-09-26.

Judged against `docs/narrative/sealed/PAINTING_BRIEFS.md`, the scene files' header comments and code, and the current kit painting (brightened). Every mark row was zoomed and counted in both. Boxes are pixels (x0,y0,x1,y1) in the 1320×2868 frame; anchors as (u,v). Working crops are in the session scratchpad `ai/crit1/`.

| Id | Verdict | Look-at | Marks | Anchors |
|---|---|---|---|---|
| pt-b-1.A | **FAIL** (fixable) | lamp, lit: OK | rings changed from cut grooves to raised, metal-looking rings; one new spiral | flame OK |
| pt-b-1.B | PASS | troughs: OK | n/a (see note) | glints OK |
| pt-pl-w1-pick-niche | **FAIL** (fixable) | lip strokes now read as block joints | lip 6 = 6 but reads as seams; score marks 5 → **4** | OK |
| pt-b-1.C | **FAIL** (fixable) | boots: OK | tin box: slate and strokes gone, **latch added** | beams OK |
| pt-pl-w1-below-the-lamp | PASS | dark ring: OK | 5 = 5, same slants and order | beams OK |
| pt-b-2.A | **FAIL** (keep kit's tally) | lone ring: OK | tally redrawn: **small rings under the lone ring gone**, no drops | g2 on band (minor) |
| pt-pl-w2-above-the-ring | PASS (fix the anchors) | pale thing: OK, cool white | 5 = 5 | **g0 off the pale thing; g3 on the count** |
| pt-b-2.B | **FAIL** (fixable) | edge: OK but rod reads as steel | **handle marks and hook gone** | **g0 on bare shelf** |
| pt-pl-w2-smooth-place | **FAIL** (fixable) | patch became a polished band or rail | **no marks anywhere**, so no "rubbed away" | glints about 70 px above the hotspot |
| pt-pl-w2-box-by-the-cot | **FAIL** (fixable) | upside-down mug: OK | slate count 7 → **6**, raised and segmented | OK |

Overall: the finish is far above the kit everywhere. In 7 of 10 places, though, the model redrew a mark row or a key object: it changed counts, made cuts look raised or metal, turned strokes into seams, and added a latch. Only 1.B, below-the-lamp and above-the-ring can go in now (above-the-ring after its anchor fix).

---

**pt-b-1.A: FAIL (fixable).**
1. Look-at: a clay lamp on the right-wall ledge with a painted flame at (1079,1419). This is where the eye goes second, after the far glow. Read correctly. The far end is a lit opening, as in the kit. The lintel's sealed blank (left, about 230,1250–330,1570) is filled with blocks, as in the kit.
2. Marks: the hall's rings (cut grooves in the kit) are painted as **raised, rimmed tori with a metal sheen**, e.g. (1255,1560,1320,1660) and (600,1330,660,1400) on the left wall. At phone size they read as iron tie-rings fixed to the wall, which changes the material. A **new spiral or curl** at about (1260,1680,1305,1740) replaces a plain arc.
3. Added: see above. Nothing else.
4. Anchors: the flame anchor (0.819,0.494) sits on the painted flame. OK.
- Fix: *change every ring on both walls to a shallow groove cut flush into the stone (no raised rim, no metal sheen), and change the curl at (1260–1305,1680–1740) to a plain cut ring.*
- Note: the brief says the approved hall painting is to be reused unchanged. Whoever directs the work should confirm that a repaint of 1.A is wanted at all.

**pt-b-1.B: PASS.**
1. The two troughs lead the eye into the turn and are read correctly. The polished band sits low on the outer (left) wall with a soft shine, and a lit spot at its foot as in the kit.
2. No counted marks. Should fix (not a failure): the kit has scattered short cuts on the courses *above* the band, so the band reads as "marks rubbed off below". The repaint has none. Adding a few faint short cuts above the band would keep the link to `pt-pl-w2-smooth-place`.
3. The ledge line along the top of the band is new but harmless.
4. Glints (0.675–0.725, 0.489–0.500) land on the floor at the foot of the inner pillar, beyond the turn. That is OK as "salt glitter beyond".

**pt-pl-w1-pick-niche: FAIL (fixable).**
1. The niche is present, low, and three-quarter on, as in the kit. But the sill is painted as **a row of separate stone blocks**, each with a vertical joint on its front face.
2. Lip strokes: kit (700,1415,925,1510), 6 short V-cuts in the middle of a single continuous sill. Repaint (690,1440,935,1540): 6 lines, but each runs the full width of the sill and lines up with a block joint. They read as **seams between blocks, not empty strokes**, so the look-at is lost. Score marks in the salt: kit (525,1220,610,1315) has **5** uneven cuts (the 2nd sits close to the 1st and the 3rd close to the 4th, and the lengths differ). Repaint (540,1230,615,1318) has **4** evenly spaced cuts.
3. Nothing else added.
4. Glints are on the salt and the sill. OK.
- Fix: *change the sill to one continuous slab of dressed stone (no joints on its front face); cut six short V-strokes into the middle of its top, none alike, not reaching its edges; and change the score marks beside the niche to five short uneven cuts, all slanting the same way.*

**pt-b-1.C: FAIL (fixable).**
1. The boots stand side by side under the cot's edge, laced, in the pool of lamp light, and read correctly as the look-at. There is a notebook with a pencil at (900,1480,1030,1580) (closed, with the pencil at its edge; acceptable). The shelf with the dark rod is at (60,1060,370,1120). OK.
2. The tin box on the cot (842,1400,965,1462) has **no slate on its lid** and so no row of strokes. The brief asks for "a tin box with its slate and count", and its teaser describes cut strokes across the lid.
3. Added: a **strap and hasp latch** on the box front, which reads as a box opened by a catch.
4. Beams are loose. OK.
- Fix: *change the tin box's lid to a plain tin lid with a thin grey slate laid across it bearing a row of short cut strokes; remove the strap and hasp.*

**pt-pl-w1-below-the-lamp: PASS.**
1. The small arched recess sits at knee height on a sill, raised off the floor, with a dark oily ring round its mouth. It reads as a niche, not a fireplace or tunnel. Lamp light lies on the floor below it.
2. Strokes: kit (520,1165,805,1280), repaint (515,1170,845,1290). **5 = 5**, with the same slants in order: right, upright, right, left, left. Minor: the kit sets strokes 2–3 as a close pair, while the repaint spaces them evenly. Not a wrong reading at phone size.
3. Should fix: the stain is fuzzy and fairly even all round, including the top of the arch. The brief weights it to the sill. Not a failure.
4. Beams are loose. OK.

**pt-b-2.A: FAIL (keep the kit's tally).**
1. The lone ring sits above the band on the salt, catching the light. Read correctly. Kit (573,1326,628,1448); repaint (550,1213,644,1393), larger and higher, which is fine.
2. Tally: kit (0,1505,770,1670) is a mixed row of bars, ticked bars, short drops, gaps and **small rings**, with three small rings under and just past the lone ring at about (654,1528), (685,1528) and (704,1528). Repaint (120,1515,1085,1640) has only bars and ticked bars at a regular pitch: **no small rings and no drops**. The designed "two small rings under the lone one, smaller than it" are gone, and the sequence differs.
3. Nothing else added.
4. Glint g2 (0.647,0.560) lands on the band's face just under the tally, where it could read as a mark. Move it to the salt below the band: (0.647,0.595).
- Fix: *change the tally to the kit's row, mark for mark, including the small cut rings beneath the lone ring.* An image model is unlikely to reproduce the exact sequence. If one pass fails, **keep kit**, or composite the kit's band onto the repaint.

**pt-pl-w2-above-the-ring: PASS (fix the anchors before shipping).**
1. The pale sliver lies far back in the crack at (661,1582). It is cool white, not warm, and reads as an object, not a flame. The crack has a lit lip and black depth with no built surround. Read correctly.
2. Count: kit (855,1660,1100,1800), repaint (840,1670,1110,1830). **5 = 5**, parallel and slanting the same way, with similar spacing.
3. Nothing added.
4. **g0 (0.463,0.589) sits on the crack's lip about 90 px below the pale thing**, so it would read as a second pale object. Correct it to **(0.501,0.552)**. **g3 (0.736,0.605) lands between count strokes 3 and 4**, where it would single out a stroke. Correct it to **(0.80,0.55)** on the bare salt. g1 and g2 are on the salt. OK.

**pt-b-2.B: FAIL (fixable).**
1. The rod lies at a low diagonal on the shelf, and its edge takes a warm line of light. But the whole rod is faceted and glossy, so at phone size it reads as a **forged steel bar**, not dark fine-grained stone. It also lies flat, with no chip lifting the point.
2. Handle marks: the kit has a line of small marks in cells on the handle's top, ending in a hook with a tail (about 870,1500,1000,1560). The repaint's handle (870,1500,1110,1620) is **plain: no marks and no hook**. The pencilled line under the shelf is present, thin and flat grey. It does not read as a groove. OK.
3. Added: the metal reading, as above.
4. **Glint g0 (0.260,0.517) lands on bare shelf stone** left of the rod, where it reads as a small loose object. Correct it to the lit edge at **(0.414,0.516)**.
- Fix: *change the rod to matt, dark, fine-grained stone (no sheen on its faces), keep one thin gold line along the blade's edge only, rest its point on a small chip of stone, and cut a line of small marks in cells along the handle's top with a hook with a tail in the last cell's corner.* If the marks will not come, composite the kit's handle.

**pt-pl-w2-smooth-place: FAIL (fixable).**
1. The brightest thing is a **long polished streak along a projecting course** of the outer wall, hottest at (457,1447). It reads as a worn rail or ledge, not as one mirror-smooth patch at hand height on a flat wall.
2. The kit has short cut marks on the courses around the patch, fading toward it. The repaint has **no marks at all**, so "the marks rubbed away" cannot be read.
3. Added: the projecting course, which is new geometry.
4. Glints (0.317,0.481) and (0.309,0.488) sit about 70 px above the hotspot. If the repaint is kept, move them to (0.346,0.505).
- Fix: *change the polished course to a flat wall; make one oval patch at about (440,1400) worn to a mirror, the brightest value in the frame; and cut short marks into the stones around it, full depth far off, faint near the patch, none on it.*

**pt-pl-w2-box-by-the-cot: FAIL (fixable).**
1. The tin mug is upside down, with its rolled rim and low handle on the slate and a plain base on top. It does not read as a lid. The box is soft pale card, and the slate is grey and askew. Read correctly, and the look-at works.
2. Count: kit (375,1580,640,1690) has **7** short sunk cuts, with the 2nd and 3rd close. Repaint (410,1635,645,1735) has **6**, evenly spaced, **pale, raised and segmented**, like inlaid bars rather than cuts.
3. Nothing else added.
4. Glint g0 (0.583,0.587) is on the mug's rim, as the brief asks. OK.
- Fix: *change the slate's marks to seven short cut grooves, sunk and dark in their floors, not raised or segmented, with the 2nd and 3rd closer together.*

## Re-check after edits

Same critic, 2026-09-26. These are the new finals, each after one targeted edit, judged against the clarified bar: a mark row passes if it is present, roughly the right number and form, and does not read as something else at phone size. Boxes are pixels in the 1320×2868 frame. Anchor indices are 0-based within each layer of the place's `.json`.

| Id | Verdict | Reason |
|---|---|---|
| pt-b-1.A | PASS | The rings are now flush cut grooves on both walls. The old curl is now a small ring inside a ring at (1265,1690,1300,1740). It is minor and reads as a cut ring. The flame anchor sits on the lamp's wick. |
| pt-pl-w1-pick-niche | PASS (fix one anchor) | The sill is one continuous slab. The lip carries **7** short cuts across its front arris (kit has 6), bunched at the left half (745,1480,865,1560). There are **6** score marks in the salt (kit has 5) at (500,1225,620,1340). Both are within the bar and read as cut strokes, not seams. Glint [3] sits on the first lip stroke, where it could read as the stroke "filling"; move it to the salt. |
| pt-b-1.C | PASS (should fix) | The edit did not fully take: the strap and hasp remain, and no strokes are visible on the lid (845,1395,975,1465). At phone size the box is about 35 pt wide, so neither reads, and the kit shows no strokes at this distance either. Remove the hasp if another pass is cheap. |
| pt-b-2.A | PASS (fix the anchors) | The tally row is back with mixed marks: bars, small cut rings (several, including under the lone ring), and a few ticked bars. It reads as a tally, and the lone ring stays the largest ring. Small rings are more frequent than in the kit and drops are absent; neither changes the reading. Glint [2] is on the band face under the tally and glint [3] is on the band's top arris. |
| pt-b-2.B | PASS (fix one anchor) | The rod is now matt dark stone with one thin gold line along the edge. The handle carries a line of cells ending in a hook in the last cell (930,1590,1060,1660). The cells are empty rather than each holding a sign, which is acceptable at phone size. The point rests flat, with no chip; minor. The pencil line under the shelf is still present. Glint [0] is still on bare shelf. |
| pt-pl-w2-smooth-place | PASS (should fix) | The wall is flat and covered in short cut marks, with one bright oval at (470,1250,640,1470), the brightest value in the frame. At phone size it reads as a worn, shining patch. Should fix: the marks and joints run through the bright oval instead of being rubbed out, and there is a faint dark smudge just right of it at about (600,1300). Glints are on the hotspot. |
| pt-pl-w2-box-by-the-cot | **FAIL** | The slate count is now **5** (kit has 7) at (420,1630,630,1745). The 5th is faint. The strokes are still pale and segmented, like inlay, though now each has a dark sunk edge. The mug, box and glint are fine. Fix: *change the slate's count to seven short cuts, sunk and dark in their floors, not pale or segmented.* If a second pass misses again, composite the kit's count, or **keep kit**. |

pt-pl-w2-above-the-ring (unchanged painting): glint **[0]** (0.4629,0.5889) is the one on the **crack's lip**, and glint **[2]** (0.7364,0.6053) is the one on the **count**. In the first section above I called these g0 and g3; the count glint is index 2. Glints [1] and [3] are on the salt and stay.

Anchor corrections (all others stay as auto-moved):

```json
[
  {"id": "pt-pl-w1-pick-niche", "layer": "glints", "index": 3, "u": 0.786, "v": 0.462},
  {"id": "pt-b-2.A", "layer": "glints", "index": 2, "u": 0.6394, "v": 0.600},
  {"id": "pt-b-2.A", "layer": "glints", "index": 3, "u": 0.7379, "v": 0.5056},
  {"id": "pt-b-2.B", "layer": "glints", "index": 0, "u": 0.3917, "v": 0.5119},
  {"id": "pt-pl-w2-above-the-ring", "layer": "glints", "index": 0, "u": 0.5008, "v": 0.5516},
  {"id": "pt-pl-w2-above-the-ring", "layer": "glints", "index": 2, "u": 0.800, "v": 0.550}
]
```

No correction is needed for pt-b-1.A (flame on the wick), pt-b-1.C (beams only), pt-pl-w2-smooth-place (glints on the hotspot at 0.420,0.472) or pt-pl-w2-box-by-the-cot (glint on the mug's rim).
