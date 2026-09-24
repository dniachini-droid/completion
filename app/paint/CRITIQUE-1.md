# Painting kit v0: critique 1 (art director's pass)

Reviewed: the contact sheet, `v-0…v-3.jpg`, the baked `view/img/*.webp` at full size, the three scene files, `kit/lib.js`, `render.js`, `live.js`. Measured on 390×844 greyscale copies: hall / well / rib / pool.

| | Hall | Well Stair | Rib Gallery | Pool Dome |
|---|---|---|---|---|
| Median luminance | 38 | 52 | 34 | 41 |
| 90th percentile (how much is truly lit) | 100 | 85 | **47** | 70 |
| Top band (words), mean | 28 | 32 | 32 | **58** |
| Lower third (button), mean | 37 | **67** | 33 | 31 |
| Lower third busyness (hall = 0.41) | 0.41 | **1.78** | 0.49 | 0.46 |
| Warm pixels (R > B, lit) | **12.5 %** | 0.1 % | 0.7 % | 0.8 % |
| Mean RGB | 56 46 72 (mauve) | 53 49 98 | 34 30 61 | 42 39 79 |

## Verdict

- **None of the three is ready for Dan.** The kit makes competent geometry and a consistent violet, but it has lost the two things that make the hall sing: **the gold** (the hall is about 12 % warm light, the samples under 1 %) and **a light that is haze, not a surface** (every sample's focal light is a hard-edged object: a white disc, a lavender egg, a white squiggle).
- **The Well Stair: 4/10.** A striking graphic idea, rendered as a washed-out, machined turbine. The brightest, busiest part of the frame is where the button goes.
- **The Rib Gallery: 6/10.** The closest to the hall's quality, and the reason is that it *is* nearly the hall: the same one-point corridor with a glow in the middle. It is murky, and its focal "crack" reads as a ghost.
- **The Pool Dome: 5/10.** The best idea of the three (a shaft of light on a standing stone over still water), let down by a clipped white "moon" jammed under the words, and a tan cardboard monolith on a frosted cake.

Counts: **10 blockers, 17 should-fix, 9 nits** (Well 4/5/2, Rib 3/6/3, Pool 3/6/4).

---

## 1. The Well Stair (4/10)

### Blockers
1. **Washed out; no darks.** The whole frame sits in one mid-lavender value (median 52 against the hall's 38). There is no night (`--night` #05050c to `--stone-1`) framing the light, so nothing glows: *glow everywhere but not washed out* fails. Causes: three violet lights up the shaft (`k 520 / 40 / 34`) plus `hazeFar [.12,.11,.32]` over a 90 m view, plus the kit's whole-image screen bloom. **Fix:** drop the two fill lights at y −24 and −9 (or cut them to k ≈ 6), lower `hazeFar` to about `[.05,.045,.14]`, and let the near wall and the upper stair fall to near-black. The light should live only in the depths.
2. **The lower third is the brightest and busiest part of the frame** (mean 67, busyness 4× the hall). Concentric brick courses fill the button zone, and the main button will fight them. **Fix:** reframe so the well's centre projects at v ≈ 0.45–0.50, not 0.62 (raise `cam.cy` to ~0.54 and steepen `pitch` toward −64, checked with `project([0,-46,0])`). Then darken the near courses and blur them. The near wall in the lower third must be calm, dark and soft, like the hall's floor.
3. **A turbine, not a stair.** The lower turns and shaft wall form a dense radial comb (88 treads per turn and `CUT_SMALL` 0.7 × 1.4 m courses seen straight down). It reads as a machined jet-engine intake or piano keys, and it is the most "CG" thing in the set. **Fix:** blur the mid depths much sooner (`blur.d0 18 → 7`, `d1 50 → 26`), thicken the fog (`fogK 1/48 → 1/28`) so each turn down loses a step of contrast, and use `M_CUT` for the shaft wall. Add mist banks *between* turns (a second fog anchor at y ≈ −17) so the spiral fades into cloud instead of repeating crisply.
4. **The light at the bottom is a flat lavender egg.** The mist bank is a lid with a clean outline, not the "nebula-like cloud" Dan loves. **Fix:** in the scene, `mist.thick 5 → 12`. In the kit, give the mist a height-density term (denser with depth) so it is a volume and its top edge feathers into the wall. Put the glow *inside* the cloud (bloomAt at the mist's heart, `bloomPow 6 → 14`, brighter `bloomC`) so it is a lit cloud, not a lit plate.

### Should fix
1. **Two subjects.** The scene's comment says the lamp's doorway is the thing to look at, but the frame and the line say the light below is. The lamp sits at u 0.84 at 4 % scale, as a pink smudge on the right edge. Choose the light (it matches the line). Then move the lamp's doorway onto the stair's curve as a warm stepping stone toward it (u ≈ 0.62, one turn nearer, so about twice the size), or drop the lamp.
2. **The flame has no lamp.** The anchor lacks `body: true`, so a flame floats in a half-cut arch. The clay lamp is always present (DESIGN_SYSTEM → World). Set `body: true` and give it a gold core (see the kit note).
3. **No gold at all** (0.1 % warm). Violet-to-gold is the family trait. At least one real warm note on a leading line is needed.
4. **The near stair's silhouette is a vector-sharp curve** (upper left): a perfect arc, perfect sawtooth, no wear and no underside shadow. Add `rough()` chipping to the tread noses and outer edge, darken the underside, and let the kerb vary in height.
5. **No sense of scale.** There is nothing at human size near the camera (the hall has its plaque, ledge and sconces). A near doorway, niche or rail at the top turn would anchor it.

### Nits
1. The stair's surface colour and the wall's surface colour are identical. The worn treads should be a step lighter and smoother, like the hall floor.
2. The subtitle sits over mid-value textured stone. It is readable now, but the fix for blocker 1 must keep the band above v 0.2 dark.

---

## 2. The Rib Gallery (6/10)

### Blockers
1. **The crack reads as a white squiggle, a ghost or a flame figure,** not a split in rock. The `cr` term is a smooth S (`sin(p.y*1.3)`), the rock around it vanishes into the bloom, and the end wall is invisible. It is the thing to look at, and it is ambiguous. **Fix:** make it jagged (high-frequency `vn`, not sine), wide at the floor and tapering to a hairline near the top. Light the end wall's rock faces with a dim violet light at z ≈ 48 so the lips of the split read as dark rock against the glow. Keep the glow behind it as haze rather than a white shape (see the kit note).
2. **Too close to the hall.** At a swipe it reads as the Lamp Hall with arches: the same centred one-point corridor, the glow at the same height (v 0.47 against 0.46), the same slabs. TECH_DECISIONS names exactly this risk ("the same room with a different number"). **Fix:** change the view, not the room. Put the camera low at the channel's edge (`y 1.45 → 0.7`), yaw 10–14° so one arcade becomes a big dark near frame on one side, and let the water lead the eye to the crack. Alternatively, look from inside an aisle through one arch into the nave.
3. **The water reads as a black trench.** The line says "water runs down the middle", but the channel is a near-black wedge that mirrors nothing, with no streak of the crack's light. Combined with the dead-black right aisle, the lower-right quarter is a hole. **Fix (kit):** give water the same toward-the-light sheen floors get (`pow(dot(reflect(d,wn), uBloomDir), n)`), so every channel and pool carries a long violet-white streak of its light source toward the viewer. Raise the Fresnel floor from 0.25 to about 0.4. The lower camera in blocker 2 also helps.

### Should fix
1. **Murky.** Only 10 % of the frame is brighter than 47 (the hall: 100), and the source never reaches white. Broaden and strengthen the far glow to the hall's values: `bloomPow 90 → 30–40`, `bloomC` toward the hall's `[.6,.56,.9]`, crack light `k 300 → ~500`.
2. **The right-hand piers are dusty rose** (102,73,83), while the left-hand piers are cold. It reads as a warm light off frame. If it is the lamp, make the lamp visibly responsible (bigger, nearer, gold). If not, kill the spill (lamp `r .9`, `air .05`).
3. **Dead regularity.** Identical bays at exactly 3.6 m and identical arches read as an infinite-corridor render. Jitter bay length with `h2(floor(z/P))`, block a couple of arcade openings (`M_DARK`), break one rib, and hang a haze sheet between bays (fog anchors at 2–3 depths, not one).
4. **The ribs are smooth plastic bands.** `M_DRESSED` at `stone(uv*vec2(.3,3), …, 9, 9)` gives them no joints. Give them voussoir joints along the arc (`CUT_SMALL` with v following the vault).
5. **The aisles are flat black.** Dan wants deep views. A faint violet fill deep in one aisle, or a second lamp, would give layered depth instead of voids.
6. **One tiny lamp** (0.7 % warm). The hall's sconce rows are its gold leading lines. Put 3–4 lamps along the walkway receding toward the crack, so gold leads to violet.

### Nits
1. Large-scale floor mottling (`fbm` at 0.45) reads as dirty smudges in the foreground. Add joint wear and small chips as the hall's floor has, and lower the mottling amplitude near the camera.
2. The channel has no lip or kerb. A dressed edge stone would sell it as built.
3. The warm pool on the floor by the lamp is lovely. Keep it.

---

## 3. The Pool Dome (5/10)

### Blockers
1. **The oculus is a clipped white moon.** It is a hard-edged ellipse at (250,250,252) with the shaft's brick courses visible inside, like a ping-pong ball or a lit igloo. Light 0 (`k 520, r 5.5`) sits *inside* the shaft at y 17 and blasts its walls to white, and `M_GLOW` at y 24 adds more. **Fix:** move that light above the glow plane (y ≈ 26) or darken the shaft walls. Let the opening's rim be a dark, slightly broken silhouette against a soft corona: `bloomAt [0,16,0]` with `bloomPow 60 → ~20` and the kit's glow pass. Nothing in the frame should be pure white.
2. **The brightest thing in the frame collides with the words.** The oculus spans v ≈ 0.18–0.27, right under the subtitle, and the top band's mean is 58 (hall: 28). **Fix:** reframe so the oculus sits clear at v ≈ 0.30–0.34 (for example `pitch 13 → ~18` with `f .6 → ~.52` to keep the island in, checked with `project([0,12.6,0])`). Or take it out of the top of the frame and let only the beam enter. Keep the band above v 0.22 at hall darkness.
3. **The standing stone is a tan cardboard box on a frosted cake.** Its lit face is salmon and peach (188,148,143 at the foot). The island's top is a smooth, pale near-white disc, and it is the brightest solid in the scene, beating the stone. The shape is a stock tapered box on a plinth. It is the thing to look at and the least crafted object in the set. **Fix:** dark cool stone. Since the light is directly above, the top should catch the light and the sides only graze. Chip the edges (`rough()` on `st`), add a weathering streak or a carved band, and give it a slight lean or broken top. Make the island rough rock (`rough(p,.18,1.4)` → amplitude ~0.4) and darker, so it does not out-shine the stone.

### Should fix
1. **The raw rock courses read as snowdrifts or foam** heaped at the pool's far edge, pale lumps in front of a coursed wall. Darken `M_ROCK` in shadow, reduce the bump amplitude, and make the raw zone one continuous rock face that the courses sit on.
2. **The dome is a planetarium or igloo.** Clean concentric rings, regular joints, even light. Darken toward the crown except inside the beam, add vertical water staining down from the oculus, and leave a few missing or displaced stones.
3. **The beam is a glass tube.** It has hard parallel edges and uniform brightness (the kit's beam is chord length through a hard cylinder), and it doesn't land. **Fix (kit):** a soft radial falloff at the beam's edge, `fbm` density along its height, and a lit spot where it meets the island and the water.
4. **A bullseye.** Oculus, beam, stone, reflection and lamp are all stacked on one vertical axis. Move the stone off-centre (x ≈ 0.8) or the camera further off-axis, so the composition has a diagonal.
5. **The water is 40 % of the frame at near-black** (16,15,36). That is fine for the button, but it is dead. The reflected corona of the oculus and the beam's reflection should put a soft violet smear into it (this also follows from the kit's water sheen).
6. **Pink, not gold.** The lamp is too weak to have a gold core, so its light only tints the violet salmon. Give it a gold core and a visible halo, or it isn't the clay lamp.

### Nits
1. The stone's reflection ends in a hard square cut. Fade the reflection with depth or ripple.
2. The near basin rim is a perfect geometric ellipse. Break it with `rough()`, as the far side is broken.
3. The near floor slab joints radiate oddly toward the bottom edge. Lay those slabs concentric with the basin.
4. The motes in the beam are good. Slightly fewer, and larger near the camera.

---

## Family and one hand

- The three samples are consistent **with each other** (the same indigo, exposure, fog and lamp) but have drifted **from the hall**. The hall's stone is a mauve-grey (mean R > G), warmed by gold. The samples are a colder, more saturated blue-indigo (R ≈ G) with almost no warmth. Side by side on the sheet, the hall looks like one painter and the samples like another.
- There is **no red**, but the warm-into-violet mixes land on salmon and rose rather than gold (the pool's stone foot, the rib's right piers, the well's lamp).
- **Process gap:** the kit has no scene file for the hall itself. Until the kit can re-paint the approved hall close to the original, "one hand" is an assertion. Add `samples/lamp-hall.js` as a regression image and compare it with `prev/hall.jpg` on every kit change.

## The single kit change that would raise all three

**Replace the finishing bloom (`render.js`: the whole image, blurred 16 pt, screened at 0.34) with a light-driven glow. Take a bright-pass (threshold on luminance) of the float buffer, blur it at 2–3 radii (about 8, 24 and 64 pt), and add it back. Pair this with a hue-preserving highlight shoulder in `lib.js`, so bright violet stays violet instead of clipping to white or drifting to beige.**

Why this one:
- **It fixes the focal light in all three:** the white moon, the lavender egg and the ghost squiggle all become light sources that bleed into the air, as the hall's does.
- **It stops the wash.** Screening the whole blurred image lifts every dark by up to a third of its surroundings, which flattens the well and muddies the rib. A thresholded glow leaves the night dark and makes only lit things glow: "glow everywhere, not washed out."
- **It fixes the colour drift.** It carries lamp flames as gold halos (flames pass the threshold, so they glow gold instead of tinting violet stone salmon), which begins to restore the hall's violet-to-gold.

Re-paint the hall through it first. It must stay the hall.
