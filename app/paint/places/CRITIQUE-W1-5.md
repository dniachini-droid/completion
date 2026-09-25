# Week 1 places, round 5: critique

> **SEALED (D-015).** Quotes the painting briefs. Dan must not read this.

Same bar as round 4: **8/10 or better goes into the app; below 8 stays out and keeps its stand-in.** 8 means Dan, who approved the hall, would accept it beside the hall as the same painter's work: beautiful, with a clear thing to look at, and it would not embarrass the game. pt-b-1.A is already in (round 4) and is only here as a second reference.

Reviewed: the four round-5 bakes at full size (1320×2868, `r5f/`), each beside round 4 (`r4/`, half size) and `hall-ref.jpg`; crops of every look-at and of the words and button bands; the round-5 diff (commit `990e503`). Measured with `stats.mjs` and the kit's `check.mjs` (all checks pass); point colours are 12 px means. u/v are fractions of the frame from top left.

| | Hall (bar) | b-1.A (in) | b-1.B Corner | pick niche | b-1.C Survey Cut | below the lamp |
|---|---|---|---|---|---|---|
| Median luminance | 36 | 41 | 38 (was 35) | 43 (43) | 30 (33) | 30 (34) |
| 90th percentile | 87 | 77 | 96 (80) | 93 (100) | 61 (55) | 63 (73) |
| Brightest 1 % | 177 | 140 | 166 (156) | 167 (203) | 112 (98) | 105 (109) |
| Words band (top 22 %), mean (kit) | 26 | 30 | 26 (32) | 26 (24) | 22 (26) | **11** (26) |
| Button band (lower third), mean / busyness (kit; hall .37) | 37 / .37 | 42 / .42 | 35 / .38 | 41 / .19 | 36 / .41 | 39 / .19 |
| Warm share (kit) | 5 % | 6.7 % | 0 % | 0 % | 12.5 % | **14.3 %** |
| Mean RGB | 49 41 70 (B/R 1.43) | 50 42 68 | 51 41 69 (1.35, was 1.57) | 52 45 81 | 39 32 52 | **36 29 36** (grey-brown) |
| Key light | door glow 212 208 240 | | bend glow 221 203 241 (u .56 v .47); **wall-foot hotspot 210 188 229 (u .26 v .49)** | floor wedge 179 165 227 (u .30 v .56) > glow by niche 172 158 210 (u .42 v .50) | pool before the boots 157 128 98 (G/B 1.31); walls 48 43 89 (B/R 1.85) | gold at wall foot 138 111 82 (u .55 v .57); mouth 1 1 1 |
| Round 4 → round 5 | | | grade warmed, vault darkened, bounce on inner wall, troughs deeper + rake light | lip rebuilt flush, slot roughened, pitch −9, roof fill | boots remodelled, lamp raised, near floor cold | mouth rounded and black, ring widened, ledge darkened, joint moved |

## Verdict

- **Two more reach the bar: pt-b-1.B and pt-b-1.C.** Each fixed the one thing round 4 said it needed. The niche lost its bench but gained a label; the recess under the lamp stopped being an appliance and became a black hole in a smudge.
- **pt-b-1.B, the Corner: 8/10** (was 7). **In.**
- **pt-pl-w1-pick-niche: 6/10** (unchanged). Out.
- **pt-b-1.C, the Survey Cut: 8/10** (was 7). **In.**
- **pt-pl-w1-below-the-lamp: 5/10** (unchanged). Out.

Counts: **2 blockers, 13 should-fix, 7 nits** (B 0/3/2, niche 1/3/2, C 0/4/2, below 1/3/1). Round 4 had 4 blockers.

---

## 1. pt-b-1.B, the Corner (8/10) — in

*The troughs are now grooves in the floor, not rails lying on it. The light is still the best in the set.*

### What improved
- **The troughs read as hollows.** Deeper (`dep .11 → .14`), the polish now only on the flank facing the outer side (`lit` mask), the other flank darkened (`gTint 1 − .6·q·fade·(1 − lit)`). The lit streak down the middle of the right trough is gone. Across the frame at v .80 the right trough is now a dark channel (16–24 at u .78–.88) between lit floor (45–48) and a lit outer rim (35 at u .97), and the slab joints visibly dip where they cross both troughs near the bend (u .25–.65, v .52–.60). That dip is what sells it: the eye reads worn grooves.
- **The inner wall has form.** The new bounce high on it (`arcX(1.3,.5)`, `k 16`) lifts its upper courses and leaves the foot darker; the courses show. It is no longer a flat board.
- **The grade is warmer** (`[1.2, 1, .8]`): mean B/R 1.57 → 1.35, now at the hall's mauve (1.43). Beside the hall it looks like the same place round the corner.
- **The vault is quieter** (`gTint` to .38 above `y 4.2`): the water-slide bands are dimmer and the words band is back at the hall's 26.
- The lower third is calmer (busyness .38, mean 35).

### Why 8 and not 7
Beside the hall and A it is the same hand: same stone, same violet, same fog, and a stronger single light than either. The thing to look at is clear (the lit bend, with two grooves leading to it along the outer side), and nothing in the frame now reads as a wrong object. What is left is polish, not legibility.

### Blockers
None.

### Should fix (after it ships)
1. **The troughs don't catch the light.** They read as hollows by shadow and by the dipping joints, but the brief says they catch the gallery's violet, and they are the darkest things in the lower half; the lit-flank polish (`gPolish .95·q·fade·lit`) doesn't show at this exposure. The new rake light (`p y .16`, `k 7`, `r 1.6`) spends itself on the wall rather than across the floor: move it off the wall and lower (`y .08`), or give the lit flank a faint sheen from the bend light.
2. **A second white spot at the outer wall's foot** (210,188,229 at u .26 v .49), almost as bright as the bend glow (221 at u .56 v .47). It is the rake light's own falloff on the wall. It splits the eye between two points; dim it or pull the light 0.5 m off the wall.
3. **The polished band on the outer wall** (twice a shoulder) reads as pale lower courses, not a sheen in matt stone; the shine should have a soft top edge and a highlight, not just be lighter paint.

### Nits
1. The small dark ticks on the left wall (u .02–.35, v .08–.35) still read as drips.
2. The vault's parallel curves are dimmer but still there in the top quarter.

---

## 2. pt-pl-w1-pick-niche (6/10) — out

*The bench is gone. What replaced it is a paper label under a black letterbox.*

### What improved
- **No more furniture.** The proud sill (`box … .06 × .035 × .43`) is gone; the lip is now a band set flush in the salt, `.008` proud at its face, with no shadow gap under it.
- **The slot's mouth is rough** (`rough(p, .03, 7.)`): its top edge wanders.
- **The eye is closer to the look-at.** The glow beside it (u .42 v .50) now lights the band's face; p99 203 → 167, so nothing blazes.
- The roof has a trace of fill (`k .12`) and the lower third is very calm (busyness .19).

### Blockers
1. **The lip reads as a strip of pale paper stuck on the salt, and the slot as a black box above it.** The band (`gTint .92`, `M_DRESSED`) is flat, even and paler than the salt, with ragged top and bottom edges (the `foot` fbm, `end` fbm) that look torn, not cut; its right end runs past the slot and sits on the salt like the end of a label (u .80–.84 v .48–.53). It has no thickness and no arris, so it doesn't read as the slot's floor carried out. The slot above is uniform black (14–15 at u .60–.70 v .475) with near-vertical square ends and no floor, back or roof visible, so it reads as a letterbox or vent, not an arm-deep hollow. The five strokes are dark keyhole shapes (round head, pointed foot), which adds to the "fitting" read. Nothing here looks hand-cut in stone.

### Should fix
1. **The roof is still a third of the frame and flat black** (8,6,17 at u .30 v .15), with the pale diagonal stripe along its lip.
2. **The floor wedge at lower left is now the brightest thing** (179,165,227 at u .30 v .56), brighter than the glow at the niche (172 at u .42 v .50).
3. **The salt's grey-and-white banding is still too faint** to read at a glance.

### Nits
1. A thin pale bar with a few glints sits in the dark roof at upper left (u .11–.26, v .19–.23): it reads as a stick.
2. The salt's foot is still a wavy black line along the floor (u .40–.95, v .52–.62).

### What is still short
- Give the lip body: the slot's floor, carried out as a rounded sill of the same stone as the slot, darker than the salt not paler, lit on its top arris only, with its ends buried in the salt rather than lying on it.
- Let the slot have depth: the trace of violet at its back (`k .02`) raised until its floor and back wall read as grey stone going dark, not a flat black.
- Strokes as cuts: straight V-grooves lit on one flank, not keyholes.
- Crop the roof (pitch further down, or `cy` up) so the salt and the niche fill the middle.

---

## 3. pt-b-1.C, the Survey Cut (8/10) — in

*Now they are someone's boots, standing where he left them. The room is still bluer than the hall.*

### What improved
- **The boots are boots.** Oval legs narrowing to the ankle (`r mix(.04, .054)`), a slumped back with a fold and a pull-loop at the cuff, a low foot built from heel, instep and toe ellipsoids, a real toe, crossed laces down the front, a thin sole. At phone size they read as a pair of worn leather lace-up boots, toes out, side by side: exactly the brief. This was the blocker, and it is gone.
- **The pool is gold and a little brighter:** 157,128,98 before the toes (G/B 1.31, better than the hall's 1.25), p99 98 → 112.
- **The near floor is cold and dark** (`gTint .16,.15,.24`), which frames the pool and keeps the button band calm (36, busyness .41).
- The ambient is a step less saturated (`ambC [.86,.76,1.45]`); mean B/R 1.43 → 1.33.

### Why 8 and not 7
The eye goes straight to the boots in their pool of lamplight under the cot, and they now say what they must say: a person slept here and meant to walk out in the morning. The shelf, rod, cot, pillow and tin are all present and legible. Beside the hall it is darker and bluer, but the same hand, and nothing in it looks like a game asset any more.

### Blockers
None.

### Should fix (after it ships)
1. **The walls are still royal blue** (48,43,89 at u .30 v .50, B/R 1.85; the hall's stone is about 1.4). The room is the one place in the set that looks cold-saturated rather than violet-grey. Pull `ambC` to `[.9, .8, 1.3]` or grade the walls toward the hall's mauve.
2. **The cot's canvas doesn't read.** It is flat and the colour of the floor (u .60–.95, v .45–.58), so the cot reads as two rails and a ladder of shadows; the sag and the canvas's own tone are lost. Give the canvas a paler, warmer tone than the stone and a visible sag shadow.
3. **The boots float slightly.** With the lamp raised (`y 1.95`) their cast shadows are almost gone, and the bright double line of the sole reads as a plate under each foot. A contact shadow under each sole, and one sole line not two.
4. **The doorway's shape on the floor** is still not there; the pool is a soft oval, not a doorway laid on the floor by the lamp behind you.

### Nits
1. The laces run onto the toe cap (to about `q.x −.15`); stop them at the instep.
2. The cot's near leg (a single slanting plank, lower right, u .93–.99 v .60–.66) still reads as a fallen board, and the near rail's square end sticks out past it.

---

## 4. pt-pl-w1-below-the-lamp (5/10) — out

*No longer an appliance: now a black hole in a smudge of soot, and the hall's violet has drained out.*

### What improved
- **No more screen.** The mouth is rounded and uneven (`length(mc)` plus fbm and a 3-lobe wobble), there is no flat back panel and no lilac rim.
- **The ledge is a dark band** (`gTint .2/.3`, and `.75` darkening above `y .8`): the top 22 % is one dark mass (mean 11).
- **The vertical joint is gone** (`d.z += 1.1`), and the violet graze on the right is down to a trace (`k .07`).
- The ring is now continuous on all sides.

### Blockers
1. **The look-at reads as a black hole punched in a sooty wall, and the picture has lost the hall's colour.** The mouth is pure black (1,1,1 at u .45 v .47) with a thin dark outline, so it has no depth, no floor, no stone inside: a flat cut-out. The ring round it is now a wide soft cloud of dark (26,22,23 at u .30 v .45) that reads as smoke or scorching, not as oil with a dull sheen worn by hands; there is no lit stone framing it except the gold smear below. And the whole wall has gone grey-brown: mean RGB 36,29,36 against the hall's 49,41,70; the violet survives only at the right edge (64,53,85 at u .90 v .45). The brief says the hall's violet keeps the stone cold; now it is warm mud. Warm share is 14 % against the hall's 5 %. The frame is a dark top, a dark middle with a black blob, a gold smear and a flat floor: nothing in it is beautiful yet.

### Should fix
1. **The strokes read as pegs or nails** (cylinder-shaded, with a pale end, at u .42–.62 v .37–.39), not cuts.
2. **The floor's hard horizons** at v .61 and v .73 still cut the lower half into strips.
3. **The mouth needs the trace of lamp inside it** (`k .003` is invisible): a dim warm floor just inside the lip would give it depth and make it a recess, not a hole.

### Nits
1. The comment on the recess's `gTint` line carries two comments again ("rough inside…" and "inside, the dark of a hand's depth…").

### What is still short
- Put the violet back on the wall: the hall's fill at its round-4 strength on the stone around the ring, so the ring is dark against lit violet stone, not dark on dark.
- Narrow the ring and give it the sheen (`gPolish` on the face, visible), heaviest at the sill: oil, not soot.
- A mouth with an inside: a dim stone floor and sides catching the trace of lamp, black only at the back.
- Strokes as V-cuts lit on one flank.

---

## Summary

| Id | Score | Goes in? |
|---|---|---|
| pt-b-1.A | 8 (round 4) | yes (already in) |
| pt-b-1.B | 8 | **yes** |
| pt-pl-w1-pick-niche | 6 | no (stand-in) |
| pt-b-1.C | 8 | **yes** |
| pt-pl-w1-below-the-lamp | 5 | no (stand-in) |

B and C made it by fixing exactly their named blocker; their should-fix lists are post-ship polish. The two close-ups are still out for the same underlying reason: each small hand-cut feature is built as a clean-edged shape (a paper strip, a black blob) rather than cut stone with depth, lit on its edges. Both need form in the feature itself, not more tuning of the light around it.
