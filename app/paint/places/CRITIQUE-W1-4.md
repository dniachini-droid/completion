# Week 1 places, round 4: critique (art director's final pass)

> **SEALED (D-015).** Quotes the painting briefs. Dan must not read this.

This is the last round. **8/10 or better goes into the app; below 8 stays out and keeps its stand-in.** 8 means Dan, who approved the hall, would accept it beside the hall as the same painter's work: beautiful, with a clear thing to look at, and it would not embarrass the game.

Reviewed: the contact sheet `r4/sheet.jpg`, the five round-4 bakes at full size (660×1434), crops of each look-at (`k5/`), round 3 (`r3/`) side by side, `hall.jpg` (the bar), the round-4 diff of the five scene files (commit `454b590`), the anchors in `r4/<id>.json`. Measured with `tools.mjs stats`; point colours are 7–17 px means read with `samp.mjs`.

| | Hall (bar) | b-1.A Lamp Hall | b-1.B Corner | pick niche | b-1.C Survey Cut | below the lamp |
|---|---|---|---|---|---|---|
| Median luminance | 37 | 41 | 36 | 43 | 33 | 34 |
| 90th percentile | 87 | 77 | 80 | 100 | **55** | 74 |
| Brightest 1 % | 177 | 140 | 156 | 203 | **98** | 109 |
| Top band (words), mean | 26 | 30 | 31 | 24 | 26 | 26 |
| Lower third (button), mean | 37 | 42 | 37 | 43 | 37 | 43 |
| Lower third busyness (hall 0.37) | 0.37 | 0.42 | 0.42 | 0.31 | 0.42 | 0.28 |
| Warm pixels | 4.8 % | 6.7 % | 0 % | 0 % | 10.3 % | 5.2 % |
| Mean RGB | 50 41 70 | 50 42 68 | 47 40 74 | 55 48 83 | 38 32 **56** (royal blue) | 42 36 59 |
| Colour of the warm light | 200 151 121 (G/B 1.25) | 157 127 112 (1.13); 128 99 84 lower (1.18) | none | none | 118 94 75 (1.25, floor before the boots) | 141 115 95 (1.21, wall foot) |
| Far-glow core / half-width | 232 / ~130 px | 201 / ~135 px | | | | |
| Round 3 → round 4 | | small: cups, gold | brighter, troughs reshaped | lip rebuilt, salt finer | brighter, gold pool | corners darkened, strokes tapered |

## Verdict

- **One painting reaches the bar: pt-b-1.A.** The other four improved, and all are now inside the kit's checks, but none has fixed its *look-at* well enough: the troughs are still ambiguous, the niche's lip has become a wall-mounted bench, the boots are still toys, and the recess under the lamp is still a screen under a hood.
- **pt-b-1.A, the Lamp Hall: 8/10** (was 7). **In.**
- **pt-b-1.B, the Corner: 7/10** (was 6). Out, but close.
- **pt-pl-w1-pick-niche: 6/10** (unchanged). Out.
- **pt-b-1.C, the Survey Cut: 7/10** (was 6). Out, but close.
- **pt-pl-w1-below-the-lamp: 5/10** (unchanged). Out.

Counts: **4 blockers, 17 should-fix, 7 nits** (A 0/3/2, B 1/3/1, niche 1/4/2, C 1/4/1, below 1/3/1). Round 3 had 5 blockers.

---

## 1. pt-b-1.A, the Lamp Hall (8/10) — in

*The hall, same hand, a little dimmer at the far end. It passes.*

### What improved
- **The cups are cups, not a cloister.** The sill is gone, and the recesses are shallower and round-headed (`.3 × .42`, depth to `2.94`); the nearer ones now read as small arched hollows in the wall, as in the hall.
- **The lamp's wall is warmer and wider** (`gold .7`, `warm .13`, `r 1.25`). Above the ledge 157,127,112, below it 128,99,84: tan-gold, not round 3's peach, and it spreads over two courses. With the live layer's flame and lamp body (`flame.body: true`, anchor at u .83 v .48, inside the lit patch) the lamp is the thing to look at, as the brief asks.
- **The far light is a little stronger** (`k 560, r 40`): core 201 (was 195), half-brightness width about 135 px, now the hall's width.
- The door stands as a dark arch inside the glow: the hall's signature ("a door at the far end that is most of the wall") is readable in a way the approved hall only hints at.

### Why 8 and not 7
Seen beside `hall.jpg` on the contact sheet, it is the same hall by the same painter: same camera, vault, courses, floor slabs, fog, lamp position, violet-and-gold balance (warm share 6.7 % against 4.8 %). Every difference left is one of degree, not of kind. Dan would not notice a different painting; he might notice the far end is a shade less luminous.

### Blockers
None.

### Should fix (after it ships, when the kit is re-baselined)
1. **The far glow is dimmer and its surround darker than the hall's.** Core 201 against 232; the walls beside it read 81–90 against the hall's 106–113. It is the right width now, but it doesn't lift the corridor around it. The kit re-baseline (round 3, kit 4) is still the right fix; don't tune this scene alone.
2. **The lamp's wall is still less gold than the hall's** (G/B 1.13–1.18 against 1.25). `gold .7 → .9`.
3. **The cups still read slightly as windows** in the far rows (tall dark slots at u .10–.20 left). The pitch jitter wasn't added; they still march.

### Nits
1. The rings still render as crescents (letter C) on the right wall near the ledge.
2. The lintel and its post still read as a bench with one leg (left, u .10–.28 v .37–.54).

---

## 2. pt-b-1.B, the Corner (7/10) — out

*The loveliest light in the set, over two long shapes the eye can't settle.*

### What improved
- **The black step is gone.** The profile is now `dep = .11 * fade * q * q` with the bottom darkened, so both troughs have soft rims. The left one reads as a hollow (a dark channel with a lit far rim).
- **Light and exposure** (`expo 1.75`): median 29 → 36, p99 122 → 156; the lower half is no longer murky. The turn, with its lit polished band and the glow in the bend, is beautiful and the brightest passage, as it should be.
- The words band and button band are within checks (31 / 37).

### Blockers
1. **The right trough still reads as a rounded rail, not a hollow.** A lit streak runs along its middle with dark on both sides, so it shades like a cylinder lying on the floor; and the strip between the two troughs reads as a raised walkway. The polish was put on the whole hollow (`gPolish = .9 * q * fade`), not on the lit flank only, and the light across the troughs (round 3: the turn's spill to `y .7`, offset 1.5 m to the outer side, `k 34`) was not added, so nothing lights one flank and shadows the other. The look-at ("two smooth hollows catching the light") is still only half legible.

### Should fix
1. **The inner wall (right third) is still a flat board** with a hard vertical edge; the bounce light and courses weren't changed.
2. **The vault bands are still a water slide** (the top quarter: parallel sweeping curves).
3. **Still bluer than the hall** (mean 47,40,74, B/R 1.57; the hall 1.40). The grade was not warmed (`[1.12,.98,.86]` kept).

### Nits
1. Small dark vertical ticks on the left wall (u .02–.40, v .08–.40) read as drips or rain streaks, not cut marks.

### What is still short
- Make the troughs read as hollows on their own: a low light raking across them from the outer side, the polish on the lit flank only, the inner flank in shadow. Check with the top half covered.
- Give the inner wall form (a bounce light high on it, the courses showing) and warm the grade a step toward the hall's mauve.

---

## 3. pt-pl-w1-pick-niche (6/10) — out

*The salt is finally salt; the niche's lip has become a bench fixed to the wall.*

### What improved
- **The salt** (kit: finer crystals). The crazy paving is gone; the wall is now a soft, crystalline mass with faint beds. It is the best salt the kit has made.
- **The score marks** read: faint diagonal blade scratches in the salt left of the niche (u .15–.40 v .43–.48).
- **The strokes are tapered** (hand-cut, uneven, narrowing to the foot): no longer pill slots.
- Button band calm (busyness .31); pink stays 0.

### Blockers
1. **The lip is a proud bar, and with the slot above it the whole reads as a wall-mounted bench or rack.** The sill (`box … vec3(.06, .035, .43)`, pushed out of the salt) renders as a long rectangular beam standing clear of the wall, with a hard black shadow line under it and its ends cut square; the dark slot above reads as the bench's seat and back. Its front face, where the strokes are, is in shadow (42,37,71), because the only strong light is the glow behind and left of it (237,229,250 at u .39 v .50, the brightest point in the frame). So the eye goes to the glow, then sees furniture. Round 3 asked for a sill `.05` proud, `.08` tall, lit from the front-left at `k 1.4`; what was built is deeper, and the lip light is `k .7`, low (`y .1`) and behind the sill's face.

### Should fix
1. **The black roof is still a third of the frame**, flat and unmodelled, with the pale diagonal lip stripe.
2. **The glow behind the sill steals the eye.** It sits just left of the look-at, which is better than round 3's far-left glow, but it back-lights the lip instead of lighting its face.
3. **The floor wedge of light at lower left** (213,202,243 at u .30 v .56) is still the second-brightest thing.
4. **The salt's banding is faint.** Grey-and-white beds should read at a glance; now they need looking for.

### Nits
1. A few glints sparkle on the roof's lip at upper left (u .14–.20 v .23–.26), outside the light.
2. The salt's foot is still a wavy black line along the floor.

### What is still short
- Sink the lip into the salt: a worn sill barely proud of it, rounded, ends feathered into the salt, no shadow gap beneath, so the niche reads as *cut into* the wall, not something mounted on it.
- Light the strokes from the front-left, low and raking, so the sill's top edge and the cuts' flanks are the brightest thing right of the glow; move the glow off the lip.
- Model the roof in the faint fill, or crop it down, so a third of the frame isn't flat black.

---

## 4. pt-b-1.C, the Survey Cut (7/10) — out

*A room someone slept in, now with light in it. The boots are still toys, and the walls still another game's blue.*

### What improved
- **There is light, and it is gold.** p99 69 → 98, the floor before the boots 118,94,75 (G/B 1.25, was 1.1), and the boots stand in a soft pool with long shadows. The look-at is now unmistakable: the eye goes straight to the boots under the cot.
- **The notebook is back on the canvas** (`y .358`), and the pencil reads; the tin sits by the pillow. The room now carries its human objects.
- **The rod on the shelf** reads at upper left.
- The boots lean toward each other, and the ambient is less saturated (`ambC [.8,.72,1.45]`, `amb .42`).

### Blockers
1. **The boots still read as toy wellingtons.** Round, straight-sided, ribbed legs with thick round open tops; quilted, pillowy feet with stitch-like marks on the toes. The leg now *widens* upward (`+ .03 * q.y`) instead of tapering to an ankle, which makes them more like rubber boots, and the lacing still reads as rings. At the size they are (the look-at, centre of the frame), this is the first thing Dan sees, and it looks like a game asset, not an old pair of leather boots.

### Should fix
1. **Still dim and blue.** The lamp was raised only to `k 12, warm .01` (round 3 asked `k 18, warm .06`); p99 is 98 against the target 130, the 90th percentile 55. The walls are still 33–35,29–33,63–74 (B/R 2.1): saturated royal blue over 60 % of the frame. The grade and the fill lights' colour weren't changed.
2. **The doorway's shape on the floor** is still a vague dark band at lower left, not two jamb shadows.
3. **The big dark floor** below the pool (v .70–1.0) is empty and murky; fine for the button, but it makes the painting bottom-heavy.
4. **The notebook** is a faint pale rectangle; the pencil reads better than the book.

### Nits
1. The cot's near leg (a single slanting plank, lower right) reads as a fallen board.

### What is still short
- Remodel the boots as worn leather: an oval leg that narrows to the ankle, a soft fold at the cuff, a flat low foot with a real toe, the laces only down the front.
- Finish the light: lamp `k 18`, `warm .06`, the hall's grade on the walls, so the room is mauve with a gold pool, p99 ≥ 130.

---

## 5. pt-pl-w1-below-the-lamp (5/10) — out

*Quieter and darker round the edges, but still a small screen under a hood.*

### What improved
- **The top corners are darker** (the wall beside the ledge's ends `gTint` down): the top band is nearer one dark mass.
- **The pale bezel is mostly gone:** the oil now starts at the mouth's edge.
- **The strokes are tapered and uneven.**
- The near floor darker, so the lower third is calm (busyness .28).

### Blockers
1. **It still reads as an appliance.** The mouth is a rounded rectangle with a wavy top and a visible flat back panel, still with a thin lilac rim round it; the five strokes, tapered now, sit evenly above it like a row of nails or indicator marks. With the ledge a grey box overhead, the picture reads as a screen under a hood. The dark ring (the look-at) is soft and barely there on the left and gone on the right, where the violet graze washes the wall (the brightest wall value is the violet patch at u .95 v .45). The eye goes to the gold at the wall foot (141,115,95), then to the violet patch, not to the ring.

### Should fix
1. **The ledge is still a trapezoid hood**, a large lit grey box filling the top 22 %, not a dark band across the frame.
2. **The vertical joint at u .35** is still a full-height pipe.
3. **The floor's hard horizon** at v .61 and the second at v .73 still cut the lower half into strips.

### Nits
1. Two comments on one line again (the `gTint` line for the ledge's ends carries the near floor's old comment).

### What is still short
- Make the niche old and hand-cut: an irregular, rounder mouth with no rim and no flat back panel showing, the strokes fewer-looking and less regular, and a clear dark oil ring on all sides, framed by lit stone.
- Make the ledge a dark band, not a lit box: its underside in shadow, the top 22 % one dark mass.
- Break the vertical joint and soften the floor lines so the ring is the only strong shape in the frame.

---

## Summary

| Id | Score | Goes in? |
|---|---|---|
| pt-b-1.A | 8 | **yes** |
| pt-b-1.B | 7 | no (stand-in) |
| pt-pl-w1-pick-niche | 6 | no (stand-in) |
| pt-b-1.C | 7 | no (stand-in) |
| pt-pl-w1-below-the-lamp | 5 | no (stand-in) |

The two nearest the bar (B and C) each need one thing: B, a light that makes its troughs hollows; C, boots that look like a person's. Either is a focused scene-file change, not a kit change.
