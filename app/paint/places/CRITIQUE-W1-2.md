# Week 1 places, round 2: critique (art director's pass)

> **SEALED (D-015).** Quotes the painting briefs. Dan must not read this.

Reviewed: the contact sheet `r2/sheet.jpg`, the five round-2 bakes at full size (660×1434), crops of each look-at, round 1 (`base/`) for context, `hall.jpg` (the approved hall, the bar), the five scene files, `kit/lib.js` and `render.js` (kit v1). Measured with `tools.mjs stats` on 390-wide copies; point colours read from the 660-wide bakes (11×11 px means).

| | Hall (bar) | b-1.A Lamp Hall | b-1.B Corner | pick niche | b-1.C Survey Cut | below the lamp |
|---|---|---|---|---|---|---|
| Median luminance | 37 | 41 | 41 | 31 | 35 | **57** |
| 90th percentile | 87 | 79 | **112** | 76 | 72 | 101 |
| Brightest 1 % | 177 | 142 | **197** | 160 | **91** | 134 |
| Top band (words), mean | 26 | 27 | **42** | 26 | 30 | 28 |
| Lower third (button), mean | 37 | 44 | 38 | 28 | **60** | **82** |
| Lower third busyness (hall = 0.37) | 0.37 | 0.46 | 0.60 | 0.31 | **2.02** | 0.32 |
| Warm pixels (R > B, lit) | 4.8 % | 5.7 % | 0 % | 0 % | **30 %** | **53 %** |
| Mean RGB | 50 41 70 (mauve) | 49 40 69 | 56 50 **91** (indigo) | 41 36 66 | 47 36 54 | **71 52 59** (rose) |
| Colour of the warm light | 163 107 74 (gold, lamp) | 61 42 46 (rose, ledge wall) | none | none | **114 81 72** (terracotta floor) | **164 126 117** (salmon floor) |
| Round 1 → round 2 change | | **none** (mean diff 0.05) | lighter, bluer | darker, cleaner | much lighter | lower half brighter |

## Verdict

- **None of the five is ready for Dan, and only the Lamp Hall is close.** Round 2 has fixed the round-1 complaint that everything is "the same beige stone". The new materials exist, the violet is back, and two of the five now have real atmosphere (the Corner's sweep, the niche's deep glow). But three new failures have taken beige's place. **(1) Warm light still turns pink, not gold**: the Survey Cut's floor is terracotta and Below the lamp's is salmon, in the very places the brief wants the lamp's gold. **(2) Look-at objects read as the wrong thing**: kerbs for troughs, clogs on mats for boots, a bench for a cot, a bread oven with a grille for the niche, a cartoon mouse hole for the oiled niche. **(3) The kit's close-range details read as drawn**: rings and strokes come out as ink outlines, salt seams as contour lines, salt glints as a starfield, and the pick grain as quilted plaster.
- **pt-b-1.A, the Lamp Hall: 7/10.** It is still the hall and the same painter. It was not re-painted this round. It is dimmer and busier than the bar (outlined rings, windows for cups), and the great door doesn't read as a door.
- **pt-b-1.B, the Corner: 5/10.** The boldest composition in the set: a real, dramatic bend. But the troughs are raised kerbs, and a washed near-white wall steals the eye and pushes into the words.
- **pt-pl-w1-pick-niche: 5/10.** The best atmosphere and the calmest button zone, but the roof is a night sky full of stars, and the niche is a bread oven with a vent grille. The strokes and score marks it exists for can't be read.
- **pt-b-1.C, the Survey Cut: 4/10.** A tan, grainy floor fills the button zone. The props read as furniture from another game (a trestle table and two wooden clogs), and the room is a big empty tunnel, not a low lived-in chamber.
- **pt-pl-w1-below-the-lamp: 3/10.** A frontal cartoon mouse hole in a hard black oval, on pink stucco, over a salmon glow where the button goes. It has the least of the hall in it.

Counts: **13 blockers, 26 should-fix, 12 nits** (A 0/5/3, B 3/5/2, niche 2/6/3, C 4/5/2, below 4/5/2).

---

## 1. pt-b-1.A, the Lamp Hall (7/10)

*Same hall, same hand. Dimmer, busier, and its new details are drawn rather than carved.*

### Blockers
None. Dan would recognise it as the hall he approved. Everything below is what keeps it from 8.

### Should fix
1. **Not re-painted.** The bake is pixel-identical to round 1 (mean difference 0.05). Against the bar it differs by 9.4 on average, with 40 % of pixels more than 8 levels apart. The far light's core is 193 against the hall's 227, so the far end is a smaller, greyer arch instead of the hall's cloud of light. The brief says "reuse the approved painting … unchanged": the door's light must be at least the hall's. **Fix:** raise the far light `k 420 → 520`, and bring `bloomAt` / default `bloomPow 30` back to the hall's broad cloud (check the core reads ≥ 220 at u .5 v .45). Run `tools.mjs diff hall.jpg` with the week-1 additions switched off: that diff must be under 1.
2. **The rings are ink circles.** `rings()` cuts a groove `g = abs(length(f)-rr)*.55 - .012` about 2 px wide at this range. It renders as a dark hairline with a pale rim, which is an outlined object, and the brief rules those out. The half-circles cut off by the ledge (u .9, v .55) look like stickers. **Fix:** make them shallow dishes, not grooves. Give them a width `.035–.05`, a soft profile (`smoothstep` across the groove, not `abs`), and a depth of 0.01. Cut the count by about a third (`pick < .32 → .22`) and keep them off the plane of the ledge (`length(p.zy - vec2(5.6,1.22)) > .7`).
3. **The cups read as a row of arched windows.** Nine identical dark arches per wall at 3.1 m pitch, with nothing visible inside (the bowls are lost in black), make a cloister, not wall-cups. **Fix:** give each recess a sill that catches the violet (a `M_DRESSED` lip 0.04 proud), make the bowl a lighter clay (`gTint vec3(.7,.6,.55)` on M_ROCK) so its rim shows against the dark, and jitter the spacing by `±.25*h2(floor(...))` so they stop marching.
4. **The great door doesn't read as a door.** The brief's signature is "a door at the far end that is most of the wall". The door is modelled (`archOpening2(…, 2.1, 6.2)`), but the light at z 58, 8 m in front of it, fogs it into a glow the width of a corridor. **Fix:** move the far light to *behind and above* the leaf's arch (`p [0, 7.5, 64]`), light the leaf's edges with a thin rim, and let the leaf itself stay a shade darker than the air around it, a tall dark shape inside the glow. The glow must stay (it's what Dan loved), with the door as its silhouette.
5. **The lamp's wall is rose, not gold** (61,42,46 above the ledge). The live flame will add gold, but the baked spill under it should already be gold, as the hall's is (163,107,74). **Fix:** lamp colour `c [1,.58,.24] → [1,.68,.3]`, `warm .085 → .11`, plus the kit's warm-to-gold guard (§ kit, 1).

### Nits
1. The lintel box and its post read as a bench against the wall. A slightly deeper shadow under it (`amb` locally, or a `gStain .3` strip under the soffit) would seat it in the wall.
2. The lower third is a shade lighter than the hall's (44 against 37). Pull the floor sheen `sheen .22 → .16`.
3. The ledge is bare in the bake. That is fine because the live layer draws the lamp body (anchor `body: true`, u .83 v .48). Check it on device, since the lamp is this scene's look-at.

---

## 2. pt-b-1.B, the Corner (5/10)

*A great bend, spoiled: the troughs are kerbs, and the brightest thing is a bleached wall pressing into the words.*

### Blockers
1. **The troughs read as raised kerbs, not hollows.** At full size, two long rounded ridges run toward the turn, lit along their crests with a flat shoulder beside them, like a bobsled run or escalator handrails. The brief's look-at is "the troughs' two smooth hollows catching the light". Cause: `dep = .06` is too shallow to read at this range, and the `min(p.y + dep, .3 - abs(s))` term builds a lit shoulder at the trough's edge that reads as a crest. **Fix:** a single smooth basin profile, `p.y + .13 * fade * (1. - e*e)` for `|e| < 1` with no rim term, and the edges eased into the floor with `smoothstep`. Then light the hollow's far flank: drop the gallery light `y 1.8 → .5` so it grazes the floor and each trough shows a lit far side and a shadowed near side. Keep `gPolish` in the hollows so a soft violet streak runs down each trough toward the turn.
2. **A near-white wall steals the eye.** The outer wall at the turn is 216,205,244, the brightest thing in the frame (p99 197, the hall 177). It is brighter than the troughs, so the eye lands on bare wall. The washed band reaches up into the words: the top band's mean is 42 against the hall's 26, textured with the marks. **Fix:** halve the gallery light (`k 380 → 190`), `glow.k .8 → .5`, and drop `expo 1.8 → 1.6`. Put the brightest value round the corner (`bloomAt` beyond the bend, `bloomPow 14 → 24`) so the light is air, not plaster. The top 22 % must come back to about 28.
3. **The marks above the band read as perforations.** `marks()` makes short vertical slots `.16 × .3` that render as punched holes or braille in a metal sheet. They cover the top-left quarter where the words sit. **Fix:** fewer, larger and shallower. Use a cell of `.35 × .5`, raise the pick `h2 < .5 → .3`, and give each cut a sloped floor that catches light on its lower lip. Keep them above v .25, or let the wall above the band fall into shadow so they are felt, not counted.

### Should fix
1. **The polished band doesn't read as polish.** The whole lower wall is lit evenly bright, so the band is simply "the lit part", not "a shine in matt stone". **Fix:** keep the band's albedo the same as the wall above (`gPolish` currently brightens albedo by 30 %). Let it show only as specular: a narrow horizontal highlight that follows the band's curve, with `pow(..., 34)` → about 60 for a tighter sheen.
2. **The inner wall (right third, from the top to v .52) is a flat blank board** (20,17,34), 30 % of the frame with no form. **Fix:** give it the hall's courses (`M_CUT`, not the wall's shadowed face alone), a faint violet bounce from the lit wall opposite (a light at the turn, `k 6, r 3`, aimed at x +2.7), and a slightly rounded arris where it turns the corner.
3. **Bluer than the hall.** The mean is 56,50,91: the round-1 drift toward cold indigo (R ≈ G) is back, where the hall is mauve (50,41,70). **Fix:** `grade [1.08,1,.95] → [1.12,.98,.86]`, and `bloomC [.5,.46,.9] → [.56,.5,.86]`.
4. **Dead glint anchors.** Two of the four glints project at u .93 and 1.0, on or past the frame's edge. Put all four inside u .55–.85 on the floor past the turn, where the brief's "faint salt glitter beyond" belongs.
5. **The vault's sweeping bands** read as a concrete skate bowl or a water slide: perfect parallel curves, no joints. Add `CUT_SMALL` joints across the bands, and let the top 15 % of the frame fall darker (`hazeBase` stays, `hazeFar .26 → .18`).

### Nits
1. The floor's slab joints stop at the trough edges. Run them across the troughs, worn soft (the troughs wore into existing slabs).
2. The lower-left dark trough is a near-black wedge (28,23,53). A trace of the floor sheen in it would read as a hollow.

---

## 3. pt-pl-w1-pick-niche (5/10)

*The best air in the set, but it's under a starry sky, and the thing to look at is a bread oven.*

### Blockers
1. **The roof is a night sky.** Everything that isn't floor is `M_SALT` (`d.yzw = … M_SALT`), including the unlit roof. The salt's glints (`specK 2.2`, `specP 140`) fire on faint fill and speckle the black upper-left quarter with stars. Together with the overhanging roof lip's cliff silhouette, the top half reads as a canyon at night, outdoors. That breaks the Site. **Fix (scene):** make the roof `M_ROCK` above `p.y 2.2`, and keep `M_SALT` for the wall band `wl > .1`. **Fix (kit):** gate glints by direct light (§ kit, 2).
2. **The niche is a bread oven with a vent grille, and its strokes can't be read.** The look-at is "the empty strokes on the lip". What renders is a tall round-headed arch in a thick `M_DRESSED` ring, standing on a sill with nine regular dark slots: a pizza oven, a fireplace, a mouse hole with a heating grille. The score marks, the signature ("the first human tool-marks in the Site"), are a 30-px smudge at u .5 v .465. **Fix:**
   - Make it the brief's "a niche the length of an arm, low": a long, low slot, `archOpening2(m, .36, .14)` → half-width **.38**, height **.16**, head nearly flat (a segmental arch, rise .04). Lose the ring: the salt runs straight to the slot's cut-stone lip.
   - Make the strokes the brightest edges in the frame. Use 5–7 strokes, not 9, at irregular spacing (`.075 ± .012*h2(k)`), each with a lit lower bevel. Put a small violet key light `k 3, r .6` at `[1.5, .15, ZN + .9]` raking along the lip from the left.
   - Double the score marks' size (`.07 → .12` pitch, `abs(w.y) < .16`) and let them catch the same key light.
   - Crop so the niche sits at u .55–.7, v .5–.55 (`cam.z ZN - 1.15 → ZN - .85`, `yaw 27 → 34`; check with `project([2,.3,ZN])`).

### Should fix
1. **The salt reads as contour lines.** The banding comes out as thin dark wavy lines on uniform violet (the seams), not "grey and white banding". **Fix:** widen the bed contrast (`grey .27 → .2`, `wh .9 → .95`) and cut the dark seam strength `.35 → .15`. Let the white beds catch the raking light as pale bands a hand wide.
2. **The rock lip over the far passage** (u 0–.4, v .25–.35) is a lumpy cliff silhouette against the glow. Lower its roughness (`rough(p,.25,1.3) → rough(p,.12,2.)`) and let it sit in haze (it's 5 m away: `blur.d0 4 → 3`).
3. **The floor is 45 % of the frame and empty,** a flat violet plane with one hard light wedge at the lower right (u .7–1, v .77–1) where the button goes. **Fix:** kill the wedge (it's the right wall's foot catching the fill from behind: `fill k 1.5 → .6`). Add a scatter of fallen salt crumbs near the wall's foot (small `M_SALT` lumps at `p.y < .06`, within 0.3 m of the wall) to carry the eye back to the niche.
4. **Dead anchors:** one glint projects at u −0.33 and one beam at u −0.51. Move them inside the frame, on the salt near the niche (u .5–.8).
5. **The glow's pillar edge.** The far light makes a vertical pale slab with a hard left edge at u .02–.2. Push `bloomPow 22 → 14` so it spreads into cloud.
6. `salt.pink` is 0. Correct per the brief (grey and white here, pink only in week 3's lit salt). Keep it at 0, and say so in the scene's comment so no one "fixes" it.

### Nits
1. The niche's inside is flat black (7,6,14). Let a trace of the violet reach its back wall (fill `k .3` inside) so it has a depth, not a hole.
2. The glints on the near wall are good. Keep them fewer and larger, as in critique 1.
3. The wall's lower seam (v .6–.62) steps in a crisp line. Soften it with `rough()`.

---

## 4. pt-b-1.C, the Survey Cut (4/10)

*A human room that reads as a furniture store at dusk: a trestle table, two clogs, and a tan floor filling the button zone.*

### Blockers
1. **The lower third is a bright tan floor, and the busiest part of the frame.** It is terracotta (114,81,72 at v .94), with a mean of 60 against the hall's 37 and busyness 2.02, 5× the hall. The busyness comes from `grain .6` + `shadowJitter` + the lamp's hard shadow across a close floor. "Painted and atmospheric" fails, and the button will sit on sandpaper. **Fix:** lamp `k 30 → 12`, colour `[1,.6,.28] → [1,.7,.34]`. Floors are excluded from grain in the kit, so the busyness is the shadow banding: raise the lamp's `r 1.6 → 2.4` for a softer penumbra. Tint the near floor down with `if (p.z < .8 && p.y < .02) gTint = vec3(.6)`. Target a lower third ≤ 40 and busyness ≤ .5.
2. **The props don't read.** The boots are two wooden L-blocks (clogs) standing on dark rectangular mats: the `M_SLATE` soles box out wider than the foot and read as plates under them. Laces, creases and a leather sheen don't show. The cot is a trestle table with a flat top (`sag .05` is invisible). The notebook reads as a tray, and the tin box renders brown like wood: M_TIN's cool grey is lost under the warm light. **Fix:**
   - *Boots:* the sole `vec3(.19,.008,.055)` → `(.13,.012,.035)` in `M_LEATHER` darker (`gTint .6`), not slate. The leg `.27` tall → **.32**, slightly slumped (`lean .04 → .1` on one). The top cuff folded over (a torus `.06/.012` at the top). A lace row, a few `.004` dark cuts across the front of the leg.
   - *Cot:* `sag .05 → .14`, the canvas wrapping over the side rails (canvas box above the rails, not between them), and X-legs (two crossed `box`es per end) instead of four posts. A camp cot's silhouette is the X.
   - *Tin:* put it where the violet fill reaches, or give M_TIN a cool rim so it doesn't read as wood.
3. **The look-at isn't the brightest thing.** The brief: "the boots, side by side 'as if for the morning'". The brightest values are the cot's canvas top and the near floor, and the boots sit in the cot's shadow. **Fix:** lay the doorway's warm trapezoid on the floor so it *ends on the boots*: move the lamp to `[-.3, 1.6, -3.4]` so the lit shape reaches z ≈ 1.4, and light the boots' toes with a small warm kick (`k 1.2, r .35` at `[.45, .25, 1.0]`). The canvas above stays in half-light.
4. **The chamber reads as a big empty tunnel,** not "a low rounded chamber, ceiling near". Pitch −24 looks down at 45 % floor, and the walls are 50 % of the frame as featureless indigo (16,14,36 in the vault). The drawn arch line (the vault's joint, a crisp pale curve) makes it a Quonset hut. **Fix:** reframe low and close: `cam { x: -.25, y: 1.05, z: .25, pitch: -13, yaw: 22, f: .72, cy: .46 }`. That puts the boots at u .69 v .60, the cot at v .49, the shelf at u .14 v .37, and the back wall's foot at v .48, so the ceiling comes into the top of the frame, low, above the words. Lower the vault so it's close overhead (`hallAir(p, 1.7, 1.15, …)` → wall height 1.0), and soften the arch joint (`M_CUT` joint width down, or `blur.d0 3.4 → 2.4`).

### Should fix
1. **The doorway's shape on the floor is missing.** The scene comment promises it. With the lamp behind a 1.36-m door, the cast must show two straight shadow edges converging into the room. A lamp `r ≤ 1` with `shadow: 1` is needed for a clean edge, which conflicts with blocker 1's softer `r`: take `r 1.2` and put the blur in `blur.px`.
2. **The shelf and rod** (the week's other object) are a faint line at u .1–.3 v .38. The rod needs its own dark, fine sheen (`M_SLATE specK .45 → .9`) and a violet rim from the corner fill so it reads as stone laid on wood.
3. **The beam anchor** projects at v .63 with scale .43, a huge overlay right at the lower third's edge. Put it at the doorway (v .3–.5), or drop it.
4. **Warm 30 % of the frame, and it's brown.** Per the rules the Site is violet and the lamp is "warm, weak". Once blocker 1 is done, check warm ≤ 12 % and that the warm reads gold (G/B ≥ 1.6), not terracotta (G/B 1.1 now).
5. **The blanket** (the `gTint .62,.6,.72` box) reads as another plank. Round its edges (`box → rounded box r .03`) and let it slump over the cot's end.

### Nits
1. The notebook's pencil is invisible. Make it `.006` thick and 0.17 long, set at an angle across the page.
2. The shelf plank at the upper left sits on nothing. Add the two pegs the comment mentions.

---

## 5. pt-pl-w1-below-the-lamp (3/10)

*A frontal cartoon mouse hole in a black oval, on pink stucco, over a salmon glow where the button goes.*

### Blockers
1. **The niche is a cartoon mouse hole.** A round-headed arch meeting a flat bottom, pure black inside (18,14,15), centred dead-frontal: it is Tom and Jerry's hole, and Dan will laugh. **Fix:** a low rectangular recess with slightly rounded corners, `archOpening2(m, .14, .15)` → a rounded box, half-size `(.16, .1)`, corner `.03`. Give its sill a lit lip (the floor glow catches it from below). Let a faint warm bounce reach the back wall (`k .15, r .2` inside at `q.x .2`), so "VP inside the niche" reads as a space with a back.
2. **The oil stain is a hard black oval halo, not oil.** `gStain .9` inside `smoothstep(.2,.245, rr)` gives a crisp elliptical blob. It reads as a hole's shadow or a burn, the darkest and hardest shape in the frame. The brief's look-at is "the dark ring round the niche's mouth", "an oily darkening like a shadow that doesn't move". **Fix:** feather it (`smoothstep(.1, .34, rr)`), raise the edge noise `.035 → .12` at `fbm(m*3.,4)`, and weight it to the sill and lower sides (`*= smoothstep(.25, -.1, m.y)`), where hands reached in. Leave oil a *dull sheen*, not dead matt: `gStain .55` + `gPolish .25`, so the lamp's glow slides across it. A ring, not a disc: keep clean stone within 0.03 of the mouth, where fingers wiped.
3. **The brightest part of the frame is the button zone, in salmon.** The floor glow at v .87–1 is 164,126,117 (hue 9°: salmon-pink, not gold), and the lower third's mean is 82 against the hall's 37. This is critique 1's "pink, not gold" again, and it lands where the arrival's line and the button go. **Fix:** reframe so the floor is a band, not half the picture: `cam { x: 1.75, y: .42, z: 5.6, pitch: 4, yaw: 89, f: .74, cy: .44 }` (checked: the wall's foot at v .62, the niche at v .46, the ledge's lip at v .22). The pool light's `k .55 → .2`, colour `[1,.62,.32] → [1,.72,.36]`, and `bloomC [.1,.07,.06] → [.08,.06,.03]`. The warm should be a thin gold line along the wall's foot, not a pink field at the frame's bottom.
4. **Cold stone is gone.** The mean RGB is 71,52,59 with 53 % warm. The wall (72,51,58) is pink plaster with a regular quilted dimple pattern (`grain .8`: the pick dents at `uv*19` read as upholstery at 0.85 m). The brief's rules: "the stone reads blue-grey to violet in shadow". **Fix:** `grain .8 → .35`, the violet fill from the hall `k 5 → 9`, and `ambC` toward `[.75,.72,1.9]`, so the wall away from the pool is violet stone and the warm only licks its lower 30 cm.

### Should fix
1. **The strokes are five outlined rectangles** (staples). `st` cuts a `.009 × .056` box to depth `.012`, and it renders as outline plus pale fill. **Fix:** V-cut strokes: depth by distance to the stroke's axis (`-(.012 - abs(sz)*1.3)`), with a lit lower lip from the floor glow. See § kit, 3.
2. **The ledge is a brown table top.** A box 0.16 thick with `gTint .45`, flat, filling the top 17 %. Its underside is fine as a dark band (the words sit there), but its front edge must be stone: a worn, rounded arris (`lg.x -= .02 → .04`) with a violet rim from the hall, not a brown box face.
3. **Dead anchors:** both beams project off-frame (v −0.47 and v 1.56), so the live layers do nothing. Put one beam through the frame from the ledge's lip down to the wall's foot (from `[2.4, 1.1, 5.6]` to `[2.55, .02, 5.6]`), narrow (`w .15`).
4. **The upper-right corner** is a pale beige wedge (104,70,58) in the top band: the hall beyond, lit warm. Let it fall into violet haze (`hazeFar .08 → .16`), or crop it with `yaw 89 → 86`.
5. **The vertical joint** at u .22 runs the full height like a pipe. Break it at a course line, and give it the hall's courses so the wall reads as the hall's wall (this is the hall, under its ledge).

### Nits
1. The comment and the lights disagree: two comments on one line (`/* … from the left */ /* … from behind on the left */`). Keep one.
2. Rings are excluded near the niche, which is right. The ones that remain are invisible at this range, so drop `rings()` here or make them the dishes of § A should-fix 2.

---

## What would lift all five (kit-level)

1. **A warm-to-gold guard in the tone map (`lib.js`, before output).** Warm light on the kit's violet albedo `(.5,.5,.62)` lands on salmon, rose and terracotta every time (the ledge wall 61,42,46; the Cut's floor 114,81,72; below the lamp 164,126,117), because the violet ambient refills blue and the warm light has little green. The hall's gold is 163,107,74 (G/B 1.45). Add, per pixel: `float w = clamp((c.r - c.b) / max(c.r, 1e-3) * 2., 0., 1.); c.b = mix(c.b, min(c.b, c.g * .7), w); c.g = mix(c.g, max(c.g, c.r * .66), w * .6);`. Also give the kit a named `GOLD = [1,.7,.34]` for every lamp, and make scenes use it instead of `[1,.58,.24]` / `[1,.6,.28]`. This one change fixes the worst colour fault in three of the five, and it is the family trait ("violet to gold") the hall is built on.
2. **Glints and specular only where there is direct light.** Gate `specK` for glints by the direct (not ambient) term. Inside `lightAt`, multiply each light's specular by `smoothstep(.02, .08, diffuse_i)`, so salt, tin and polish can't sparkle in the dark. That fixes the niche's starfield and future salt scenes (weeks 2–4 are full of salt).
3. **An `engrave()` helper for every cut mark.** Rings, strokes, marks and score cuts are all SDF grooves one or two pixels wide at their distance, rendering as dark outlines with pale rims: drawn, not carved. That breaks "no outlined objects", and it's where the Site's writing lives, so it will recur every week. The helper takes `(dist2D, width, depth)`. It returns a V-profile (depth ∝ `width - |d|`), and it clamps `width` to at least 3 pt on screen at the hit's distance (from `fpx`, as `stone()` does). The lower lip catches light and the upper lip shades. Replace `rings()`, the strokes in both niches, `marks()` and the score cuts with it.
4. **Grain and shadow banding, tamed for close views.** `uGrain`'s pick dents sit on a regular `uv*19` cell grid: at under a metre it reads as quilted upholstery (below the lamp), and `shadowJitter` + hard lamp shadows make close floors grainy (the Cut's busyness 2.02). Fade grain by the lit term (`*= smoothstep(.05,.3,lum)`), randomise cell scale by `±30 %`, and cap it at `.4`. Blur close floors by default (`blur.d0` relative to the camera's height, not absolute metres).
5. **Bake-time checks that would have caught most of this round.** The kit's automatic text-zone check should also fail the bake when:
   - the lower third's mean is > 45 or its busyness is > .6 (the hall: 37 / .37);
   - the top 22 % is > 32;
   - warm pixels are > 15 %, or the warm hue sits outside 20–45°;
   - any anchor projects outside u/v 0–1 (six dead anchors this round);
   - the scene declares a `lookAt: [x,y,z]` and the frame's brightest 1 % cluster lies more than 0.12 from its projection.
   
   Run the hall's regression diff (`diff hall.jpg`) on every kit change: round 2's b-1.A drifted from the bar and nobody noticed.
