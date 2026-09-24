# The MVP's content, in full — SPOILERS

> **Sealed (D-015). Dan must not read this.** Everything the MVP shows from the story, for **six story weeks plus the run-ahead** (story week 7), sized to `product/MVP.md` → "The words and pictures it needs" and `game/BALANCING.md` §2–5, §7. Written by the story job (D-066; `STORY_JOB.md` §4). Every item has a **stable id**, its **type** (`technical/DATA_MODEL.md` → "Authored content"), and **when it may appear**, so Phase 9 can turn it into app content without re-deciding anything.
> **Nothing is duplicated.** Beats already written in `ARRIVALS_REGION1.md` (weeks 1–5), `ARRIVALS_REGION2.md` (weeks 6–7), `NICHES.md` and `LIVES.md` are listed here by id and stay authoritative there; only new content is written out in full here. Where the two disagree, those files win and this one is fixed.
> **Wording had its language pass on 2026-09-24** (D-074, brought forward by D-073 from D-046): whole sentences in the voice of a told tale; ids, conditions, order and every fact unchanged. Voice rules: `ARRIVALS_REGION1.md` → "Voice rules for the app's lines".

_Written 2026-09-24._

---

## 0. How to read this file

### 0.1 Ids
Ids are lowercase, never reused once shipped (DATA_MODEL → "Versions").

| Prefix | Type (DATA_MODEL) | Example | Notes |
|---|---|---|---|
| `b-` | a story beat: an arrival, step, camp line, morning, teaser or week close already written in ARR1/ARR2 | `b-1.A`, `b-3.2`, `b-w2.camp`, `b-w2.morning`, `b-w2.tz1`, `b-w2.close` | The id is the visit id in the ARR table. An arrival beat is also a **Place** (§2) |
| `pl-` | Place (a named place that carries no fragment) | `pl-w1-pick-niche` | New in this file |
| `cv-` | Camp with a view | `cv-01` | New |
| `rec-` | Record fragment | `rec-s1`, `rec-l3`, `rec-x-daughter` | Text in LIVES / ARR; ids follow LIVES |
| `seal-` | Sealed thing | `seal-1-2` (NICHES week 1, row 2) | Five new rows are added to NICHES (`seal-1-6`, `seal-2-6`, `seal-3-6`, `seal-4-6`, `seal-6-6`) |
| `mk-` | Sign / mark | `mk-lamp`, `mk-ring`, `mk-hand` | §6 |
| `wd-` | Word | `wd-light`, `wd-open-way` | §7 |
| `fd-` | Find | `fd-c06` | §8 |
| `tl-` | a told line carried by a find or sealed thing | `tl-wool` | §8.2; sign-authored |
| `ps-` | Passage line | `ps-h12` | §9 |
| `wc-` | Week-close "learned" line; `sf-` the month's "so far" | `wc-w3-2`, `sf-m1` | §10 |
| `tz-` | Teaser ("I can't start") | `tz-w4-b` | §11; the ARR teasers keep their `b-` ids |
| `pt-` | Painting | `pt-pl-w1-pick-niche`, `pt-b-1.A`, `pt-cv-03` | Briefs in `PAINTING_BRIEFS.md` |

Copy keys (D-046) are the id plus a field: `pl-w1-pick-niche.name`, `pl-w1-pick-niche.line`, `fd-c06.line`, `mk-lamp.cand.2`, `b-3.A.tap.3`.

### 0.2 When an item may appear
Every item carries `w` (story week), `o` (order in that week, where order matters) and `req` (ids that must have been shown first). The rules (BALANCING §2; ARR notes):
- **At most one story week per calendar week.** A story week ends when its last ordered beat has played; a thin week stretches it, an absence pauses it.
- **Places are reached by steps** (8 between named places, BALANCING §1), down the week's **route** (§1) in order. A place whose `req` is not met is **skipped for now** and plays as soon as it is met, before the route goes on; so no week can stall behind one Key. *(Key)* arrivals, and arrivals gated by a Key (`b-2.B`, `b-5.A`, `b-7.A`: marked **K-gated** in §1), are the usual case.
- **Day complete plays the day's places.** Places reached during the day are held and played at day complete, in order, the last as the arrival; a High day that reached three places plays three. Places reached after day complete ("Keep going") play when they are reached. A day that reached none ends at a camp view.
- **Steps** (after a main job) play the week's authored step beats in ARR order, one per job return, **each only after the nearest arrival above it in its week's ARR table has played** (so the Salt Gallery's steps wait for the corner, and 3.3 waits for the word); a job return with no step beat free shows a **passage line** (§9) or a **script glimpse** (§9.9), alternating.
- **Keys and views.** A Key opens the first sealed thing in NICHES order **that is in view**; if none of the week's is in view yet, it opens the first one at the next arrival, whose scene ends on that count filling. A Key from the **floor of 2** at week close opens its sealed thing on the week close page (the count shown filling); if that sealed thing is a *(Key)* arrival, its scene plays as the first arrival of the next day complete.
- **Places may run one story week ahead** (a deep push, "Keep going"): the next week's **`pl-` places**, in their order, skipping its story arrivals, each needing only its own physical `req` (§1); never a sign, never a record ahead of its turn. A record seen early is shown as its glyphs and read in its turn. Past that, the open route (passage lines, side chambers, finds).
- **Low day**: if the day completes short of the next named place, the arrival is a **camp with a view** (§3) for the current stretch.
- **Keys** open sealed things in NICHES order, story counts first (BALANCING §3); a surplus opens next week's first rows that carry neither a sign nor a record (§5).
- **Finds** (§8) come from the pool for the current stretch and window, in the listed order, each once. If every pool within reach is used up (a very large run of weeks), a find source gives the oldest record in view re-surfaced with its newest rendering instead, never nothing and never a bare reward.
- **Absence** (3+ days): "where you were" (the last place, the sealed thing in view, one unfinished record) is worked out, and names the one open question for the story week Dan is in (§10.3).

### 0.3 Stretches (where Dan is on the map)
| Stretch | Id | From | Places on it |
|---|---|---|---|
| The Mouth and the pipe | `st-mouth` | w1 | the shaft foot; the curved passage |
| The Lamp Hall | `st-hall` | w1 (dark until `b-3.A`, lit after) | the ledge, the wall by the lamp, the lintel, the far end, the corner |
| The Salt Gallery | `st-salt` | w1 | the split, the tally, the niches in the salt |
| The Survey Cut | `st-camp` | w1 | her camp |
| The top of the Stair | `st-stair` | w3 (after `b-3.A`) | the landing, the top flight, the first turn |
| The second flight | `st-flight2` | w4 (seen), w5 (walked) | the little door, the recess under the second turn, the gap, the second landing |
| The square gallery | `st-square` | w6 | the side passage, the crew's wall, the square floor |

### 0.4 Two canon clarifications this file relies on (recorded in `STORY_JOB.md` §4)
- **The counts on her things** (the tin box, the stove's box, the recess above the cot, her folder) are cut in thin slates of the hall's stone laid over them: a count works only in laced stone (WORLD_TRUTH rule 2). He sealed her camp after she went down, as he seals every reader's things for the next one. The app never says who cut them; ARR1's "a row of cut strokes on its lid" is the slate on the lid.
- **The square gallery is cut into rock close round the Site, where the lacing still runs** (WORLD_TRUTH §5.1: it spreads outward and thins), so it holds counts; further out, the Cut is dead (rule 2); it has no lamp-cups, because the makers did not cut it. Its light comes in from the round stone.

---

## 1. The route, week by week (arrival order)

Five named places a story week (BALANCING §2); fragments ride on about half of them. `(K)` = plays when its Key lands.

| Wk | o1 | o2 | o3 | o4 | o5 |
|---|---|---|---|---|---|
| 1 | `b-1.A` The Lamp Hall | `b-1.B` The corner | `pl-w1-pick-niche` | `b-1.C` The Survey Cut | `pl-w1-below-the-lamp` |
| 2 | `b-2.A` The Salt Gallery, further in | `pl-w2-above-the-ring` | `b-2.B` The rod (K-gated) | `pl-w2-smooth-place` | `pl-w2-box-by-the-cot` |
| 3 | `b-3.A` The lintel (the word) | `b-3.B` The head of the Stair (K) | `pl-w3-salt-lit` | `b-3.C` The top flight | `pl-w3-far-end` |
| 4 | `b-4.A` The sheet dated Day 9 | `pl-w4-hollow` | `b-4.B` The salt block (K) | `pl-w4-recess-above-the-cot` | `b-4.C` The Lower Door, close |
| 5 | `pl-w5-ledge-lip` | `pl-w5-worn-steps` | `b-5.A` The tally, from the head (K-gated) | `b-5.B` Through a gap | `pl-w5-second-landing` |
| 6 | `b-6.A` The side passage | `pl-w6-square-gallery` | `b-6.B` The crew's wall (K) | `pl-w6-wall-shelf` | `pl-w6-folder` |
| 7 (run-ahead) | `b-7.A` The lintel at the foot of the second flight (the word; K-gated) | `b-7.B` The crew's wall, again (K) | `b-7.C` The great door (K; the word again) | — | — |

`req` for the pinned story arrivals: `b-2.B` req `b-2.1` (the box opened); `b-2.2` req `seal-2-1` (GIVE can only be guessed once the sheet is out); `b-3.A` belongs to weeks 2–3 (D-013) and **plays as soon as its req is met, even in story week 2**, ahead of any week 2 place still to come (the rest of week 3 waits for the calendar); `b-3.A` req `b-2.B` and `mk-give` guessed (`b-2.2`), and plays on the first arrival after the next main job (ARR1 2.B); `b-4.A` req `b-3.1`; `b-5.A` req `seal-5-1` (ONCE); `b-6.A` req `b-5.B`; `b-7.A` req `seal-7-1`; `b-7.C` req `b-7.A`. The `pl-` places need only physical access, so a deep push can reach them a week early: `pl-w2-above-the-ring` req `seal-1-1`; `pl-w2-smooth-place` req `b-1.B`; `pl-w2-box-by-the-cot`, `pl-w4-recess-above-the-cot`, `pl-w6-folder` req `b-1.C`; `pl-w3-salt-lit`, `pl-w3-far-end` req `b-3.A`; `pl-w5-worn-steps` req `b-3.C`; `pl-w5-second-landing` req `b-4.1`; `pl-w6-square-gallery` req `b-6.A`; `pl-w6-wall-shelf` req `pl-w6-square-gallery`; the rest none.

---

## 2. Named places (33)

**Fifteen are story arrivals already written** (ARR1/ARR2; their title is the name and their scene is the line): `b-1.A`, `b-1.B`, `b-1.C`, `b-2.A`, `b-2.B`, `b-3.A`, `b-3.B`, `b-3.C`, `b-4.A`, `b-4.B`, `b-4.C`, `b-5.A`, `b-5.B`, `b-6.A`, `b-6.B`. **Three are the run-ahead:** `b-7.A`, `b-7.B`, `b-7.C`. **Fifteen are new**, below: places with a name and a line and no fragment, each ending on something Dan can see (usually a sealed thing now in view, so the heart's "a sealed thing ahead you can see" always has something to point at). Every one is a real spot in region 1–2's geography (`SITE.md`) and plants nothing without a row in `CLUE_LEDGER.md`.

| Id | w / o | Name | Line (the arrival, under a minute) | In view after it | Ties |
|---|---|---|---|---|---|
| `pl-w1-pick-niche` | 1 / 3 | **The pick niche.** | Low in the wall of the Salt Gallery is a niche the length of an arm, and on its lip is a row of cut strokes, every one of them empty. The salt beside it is scored with short cuts, close together. | `seal-1-2` | the pick (NICHES 1.2); texture |
| `pl-w1-below-the-lamp` | 1 / 5 | **Below the lamp.** | Under the ledge, at the height of your knee, is a small niche with a row of cut strokes on its lip. The stone round its mouth is darker than the rest, and greasy to the touch. | `seal-1-3` | the saucer (NICHES 1.3): the lamp once burned oil (S1); C-01 |
| `pl-w2-above-the-ring` | 2 / 2 | **Above the ring.** | Over the lone ring the salt has a crack in it two fingers wide, with a small count cut beside it. Far back in the crack is something pale, too far in to reach. | `seal-2-3` | the comb (NICHES 2.3); C-12 |
| `pl-w2-smooth-place` | 2 / 4 | **The smooth place.** | At the corner, on the polished wall, there is one patch at the height of a long hand where the marks are rubbed away altogether. The stone there has gone smooth, the way a banister does. | the corner's troughs | NICHES 2.4 (now seen, not sealed); C-04a |
| `pl-w2-box-by-the-cot` | 2 / 5 | **The box by the cot.** | In her camp, pushed against the wall, is a box the size of a shoebox. A thin slate is laid across its lid with a count cut in it, and on the slate stands a tin mug, upside down. | `seal-2-5` | the stove's box (NICHES 2.5) |
| `pl-w3-salt-lit` | 3 / 3 | **The salt, lit.** | In the glow that comes round the corner from the lit hall, the salt is banded grey and pink, and it glitters. The stones packed in the split are river stones, round and brown, carried up from somewhere with water in it. | the split | C-09 |
| `pl-w3-far-end` | 3 / 5 | **The far end.** | The last lamp before the far end is a stride from the great door, and in its light the door goes up past where the flames reach, into the curve of the ceiling. Cold comes off its face, the way it comes off a window in winter. | the great door (`b-4.C`) | C-05 (a descent behind it; the cold air of 7.C) |
| `pl-w4-hollow` | 4 / 2 | **The hollow.** | Low in the salt is a hollow the size of two cupped hands, worn smooth inside, with a count on its rim. The salt at the bottom is pressed flat in four small places. | `seal-4-5` | the clay sheep's four feet (NICHES 4.5) |
| `pl-w4-recess-above-the-cot` | 4 / 4 | **The recess above the cot.** | Above her cot, at the height of a raised arm, is a recess in the wall, closed by a slate with a count on it. Beside it a drawing pin is pushed into a crack, on its own. | `seal-4-3` | the printed page (NICHES 4.3) |
| `pl-w5-ledge-lip` | 5 / 2 | **The ledge's lip.** | Under the lamp's ledge the stone is cut too. There is a small count there, low enough that nobody standing would see it. | `seal-5-5` | *Hers again* (NICHES 5.5) |
| `pl-w5-worn-steps` | 5 / 3 | **The worn steps.** | Halfway down the top flight, every step is worn in two places a stride apart, and the stride is longer than yours. The rail beside them shines along its top. | the rail | C-04a (the same stride as the corner's troughs); C-36 later |
| `pl-w5-second-landing` | 5 / 5 | **The second landing.** | Where the second flight turns there is a landing as wide as the hall above, and the lamps along its wall are lit. In the wall across from the stair is a doorway, square at the corners, too low for whoever made the stair. | the side passage (`b-6.A`) | C-58 |
| `pl-w6-square-gallery` | 6 / 2 | **The square gallery.** | The gallery runs straight, as tall as a tall man and no taller, its ceiling flat and its walls covered in small, even chisel marks. There are no cups in these walls. The light comes in from the round stone and gives out. Far down, the floor goes under a slope of broken stone. | the roof-fall (week 10) | C-58; the fall (ARR2 10.B) |
| `pl-w6-wall-shelf` | 6 / 4 | **The wall-shelf.** | A shelf cut into the square wall at the height of your chest, with a count on its lip. Along the shelf's edge someone has scratched a line, dead level, with a short tick at each end. | `seal-6-3` | the level (NICHES 6.3); C-64 |
| `pl-w6-folder` | 6 / 5 | **Her folder.** | Under her cot, pushed to the back, lies a document folder with an elastic band round it, and on its cover is a thin slate with a count. On its spine, in marker, is the word HILL. | `seal-6-5` | her folder (NICHES 6.5); C-65 |

---

## 3. Camps with a view (15)

A Low day, or any day that completes short of the next named place, ends at a **camp with a view**: where Dan is on the route, and **one thing to look at** (BALANCING §4). Each view is shown once; when a stretch's views are used up, its first view repeats with the next unused find from that stretch's pool (§8) as the thing to look at. The thing to look at is given as a find (`findGiven`, why: *camp*) or, for `cv-09`, a line re-surfaced.

| Id | Stretch | w from | The view | One thing to look at |
|---|---|---|---|---|
| `cv-01` | `st-mouth` | 1 | **The ladder's foot.** Eleven metres above you is a square of white sky, and the ladder climbs up to it. The air moves up past you and out. | `fd-a02` (the chalk arrow) |
| `cv-02` | `st-mouth` | 1 | **The pipe.** The passage leads away from the ladder, its floor and walls one curve, and it bends so gently that you only see the bend by where the light gives out. | `fd-a05` (bootprints both ways) |
| `cv-03` | `st-hall` | 1 (until `b-3.A`) | **The hall, from the passage.** Just inside stands the lamp on its ledge, and past it the hall goes away into the dark. | `fd-b12` (the flame that does not flicker) |
| `cv-04` | `st-hall` | 3 (after `b-3.A`) | **The hall, from the far end.** From the great door, the two lines of flames run back up the hall to the ledge. Round the corner beside you, a glow lies on the salt. | `fd-b11` (rings on the ceiling) |
| `cv-05` | `st-hall` | 1 | **In the trough.** You stand in one of the two troughs at the corner. The other is a stride away, just as deep and just as smooth. | `fd-c01` (the leaf) |
| `cv-06` | `st-salt` | 1 | **The salt, close.** At arm's length the salt face shows bands of grey and white, and where the air comes through the split it has a skin of fine crystals. | `fd-c09` (salt grown in the cuts) |
| `cv-07` | `st-salt` | 2 | **The tally, end on.** When you look along the gallery wall, the tally is a line of shadow running from the first stretch into the dark. | `fd-c12` (the lone ring's single stroke) |
| `cv-08` | `st-camp` | 1 | **Her cot.** From the doorway you look into her camp. There is the cot with the boots under it, the notebook with the pencil in it, and a shelf. | `fd-d08` (DAY 1 on tape) |
| `cv-09` | `st-camp` | 2 (after `b-2.B`) | **Her shelf.** On the shelf where the rod lay, a clean stripe the length of a forearm is left in the dust. | the pencil line under the shelf, re-surfaced (L4's English: *For the next one. Cut the two marks on the lintel. Don't be precious about it.*) |
| `cv-10` | `st-stair` | 3 | **The landing.** At the head of the stair the landing is wide enough for a cart, and the flight goes down into lamplight you did not light. | `fd-e07` (the first ring of the Stair) |
| `cv-11` | `st-stair` | 3 | **Halfway down.** From the middle of the top flight, every step is as high as your knee, and the rail is at your chest. | `fd-e09` (the finger hollows, four and four) |
| `cv-12` | `st-stair` | 4 | **The first turn.** The rail curls round the turn, and below it the second flight goes down, and on it is a small door with a count. | `fd-e05` (her pencil tick on the rail) |
| `cv-13` | `st-flight2` | 5 / `b-5.0` | **The second flight.** The little door is shut, and its count is full. Beside it is the one sharp ring among the worn ones. | `fd-f02` (her pencil on the jamb) |
| `cv-14` | `st-flight2` | 5 / `b-5.B` | **The gap.** Through the gap at the height of your shoulder you can see square stone, and a draught comes through that smells of old smoke. | `fd-f06` (the chippings) |
| `cv-15` | `st-square` | 6 | **The join.** The square stone and the round fit so closely that you could not slip a blade into the join. | `fd-g09` (the lead poured in the joint) |

---

## 4. Record fragments (two lives, and what they touch)

Text is in `LIVES.md` (sign strings, renderings, her sheets, tellings) and the rendering at each week is in ARR1/ARR2. **Build rule:** every Cut text is stored as its sign string with each sign aligned to its English (`LIVES.md` §0.1 notation), so the partial rendering for any set of held signs is computed, never hand-typed: a confirmed sign renders its English, a guessed sign its guess with a question mark (the authored renderings assume every sign confirmed), an unheld sign stays a glyph, a picture renders in brackets (SCRIPT §8.2). The authored full rendering is the check.

| Id | Life | Text in | First shown (beat) | w | Readable in full |
|---|---|---|---|---|---|
| `rec-l1` | Linguist | LIVES §2 L1 (the wall by the lamp) | `b-1.A`, `b-1.3`, `b-1.4` | 1 | last line month 9; meant month 12 |
| `rec-l2` | Linguist | LIVES §2 L2 (notebook, English) | `b-1.C` | 1 | at once |
| `rec-s1` | Salt-Cutter | LIVES §1 S1 + her Day 1 sheet | `b-1.5` | 1 | month 5 |
| `rec-k1` | (his) | LIVES §6 K1 (the lamp's base) | `b-1.A` (seen), `b-3.3` | 1 | week 5 |
| `rec-x-pick` | chorus | LIVES §12 (the pick) | `seal-1-2` | 1 | month 4 |
| `rec-s2` | Salt-Cutter | LIVES §1 S2 + her Day 4 sheet | `b-2.A` | 2 | month 5 |
| `rec-l3` | Linguist | LIVES §2 L3 | `b-2.3` | 2 | at once |
| `rec-x-daughter` | chorus | LIVES §8, §12 | `b-2.4` (`seal-2-2`) | 2 | week 12 |
| `rec-x-comb` | chorus | LIVES §12 (the comb) | `seal-2-3` | 2 | month 8 |
| `rec-l4` | Linguist | LIVES §2 L4 (the rod's handle + pencil) | `b-2.B` | 2 | pencil at once; handle month 9 |
| `rec-s3` | Salt-Cutter | LIVES §1 S3 | `b-3.1` | 3 | month 5 |
| `rec-l5` | Linguist | LIVES §2 L5 | `b-3.2` (req `b-3.1`) | 3 | at once |
| `rec-x-cord` | chorus | LIVES §12 (the cord) | `seal-3-3` | 3 | month 6 |
| `rec-s4` | Salt-Cutter | LIVES §1 S4 + her Day 9 sheet | `b-4.A` | 4 | week 22 |
| `rec-l6` | Linguist | LIVES §2 L6 | `b-4.3` | 4 | at once |
| `rec-x-neighbour` | chorus | LIVES §8, §12 | `b-4.B` (`seal-4-2`) | 4 | week 11 |
| `rec-x-colleague` | chorus (paper) | LIVES §8 | `seal-4-3` | 4 | at once |
| `rec-x-sheep` | chorus | LIVES §12 (the clay sheep) | `seal-4-5` | 4 | month 6 |
| `rec-k2` | (his) | LIVES §6 K2 (the sharp ring) | `b-3.4` (High) or `b-5.0` | 3–5 | month 8 |
| `rec-s5` | Salt-Cutter | LIVES §1 S5 | `b-5.3` (`seal-5-2`) | 5 | month 5 |
| `rec-l7` | Linguist | LIVES §2 L7 | `b-5.2` | 5 | at once |
| `rec-x-wax` | chorus | LIVES §12 (the wax crumbs) | `seal-5-3` | 5 | month 5 |
| `rec-x-hers-again` | chorus | LIVES §12 (hers again) | `seal-5-5` | 5 | month 8 |
| `rec-v1` | Surveyor (third life, begun) | LIVES §3 V1 | `b-5.B` (seen), `b-6.A` | 5–6 | month 6 |
| `rec-l8` | Linguist | LIVES §2 L8 | `b-6.1` | 6 | at once |
| `rec-v2` | Surveyor | LIVES §12 V2 + her crew-line sheet | `b-6.B` | 6 | week 22 |
| `rec-x-foreman` | chorus | LIVES §8, §12 | `b-6.B` (`seal-6-2`) | 6 | month 4 |
| `rec-x-mule` | chorus | LIVES §12 (X-mule-driver) | `b-6.3` | 6 | month 4 |
| `rec-s6` | Salt-Cutter (run-ahead) | LIVES §1 S6 | `seal-6-1` (seen), `b-7.2` | 6–7 | month 6 |

**Two lives' fragments inside the six weeks: 13** (S1–S5, L1–L8), plus S6 seen, plus V1–V2 (the next life begun), K1–K2 and eleven chorus lines: 29 record items against the budget's 15 (the budget counted the two lives only).

---

## 5. Sealed things (30, plus the run-ahead)

`seal-W-R` = `NICHES.md` week W, row R. Order within a week is the NICHES row order; it is the Key order.

| Week | Opened by a Key, in order | Seen, not sealed (no Key) |
|---|---|---|
| 1 | `seal-1-1` the inner count (S2's stretch) · `seal-1-2` the pick niche · `seal-1-3` the niche below the ledge · `seal-1-5` the shaft recess · **`seal-1-6` the flask niche (new)** | `seal-1-4` her boots |
| 2 | `seal-2-1` the tin box (**GIVE, PERSON, ONE, ME**) · `seal-2-2` the tally-stick · `seal-2-3` the comb's crack · `seal-2-5` the box by the cot · **`seal-2-6` the torch slate (new)** | `seal-2-4` the smooth place (now a named place, `pl-w2-smooth-place`) |
| 3 | `seal-3-1` the Stair niche (**HERE, DOOR**) · `seal-3-3` the cord recess · `seal-3-4` the wall's foot · `seal-3-5` the cassettes' ledge · **`seal-3-6` the landing crack (new)** | `seal-3-2` S3's stretch |
| 4 | `seal-4-1` the second niche (**DEEP**) · `seal-4-2` the salt block · `seal-4-3` the recess above the cot · `seal-4-5` the hollow · **`seal-4-6` the back-wall slate (new)** | `seal-4-4` the Lower Door's count (nothing opens yet) |
| 5 | `seal-5-1` the recess under the second turn (**ONCE, PATH, GO**) · `seal-5-2` S5's crust · `seal-5-3` the gap's sill · `seal-5-4` the notebook's back pocket · `seal-5-5` the ledge's lip | — |
| 6 | `seal-6-1` the last crust (**OPEN, EAT**; S6 behind it) · `seal-6-2` the pay tablet · `seal-6-3` the wall-shelf · `seal-6-5` her folder · **`seal-6-6` the jar niche (new)** | `seal-6-4` the mule-shoe |
| 7 (run-ahead) | `seal-7-1` (**UP, STONE, CHILD**) · `seal-7-2` the boy's slate · `seal-7-3` the rail's recess · `seal-7-4` the wages · `seal-7-5` the great door (Key + word) | — |

**Five new sealed things** (added to `NICHES.md` as row 6 of their week), each authored against what is already true. The app's line is the step that plays when its Key lands (Kind: *step (Key)*):

| Id | Where | The line when it opens | What it is (truth) | Ties |
|---|---|---|---|---|
| `seal-1-6` | the Salt Gallery, a niche by the split, low | The strokes on the niche by the split fill. Inside is a small clay flask, stoppered with a twist of wool, empty and as light as an eggshell. | The first's oil flask: he went in "as far as the oil" (S1's telling: a lamp with a hand of oil) | S1; C-01 (the lamp burned oil, once) |
| `seal-2-6` | her camp, a slate on the floor by the cot's head | By the head of the cot, the count on a slate on the floor fills. Under the slate lies a head torch, its strap gone stiff, and in its battery case is a crust of white powder. | Hers: she saw by it until the batteries died, and after Day 6 by the lamps (L5: "the tape is dying; batteries") | L5; the lamps rule |
| `seal-3-6` | the head of the Stair, a crack in the landing's floor | Along a crack in the landing's floor runs a count, and it fills. Inside the crack is a foil blanket still in its packet, and on the packet, in pencil: *in case I'm an idiot*. | Hers: she was careful, then less so (L6's rule; L8) | L6, L8; C-24, C-35 (texture) |
| `seal-4-6` | her camp, a slate low on the back wall | Low on the back wall of her camp is a slate with a count, and the count fills. Behind it is a paperback dictionary of a dead language, its spine broken open at the grammar and its margins full of pencil. | Hers: her trade; the grammar she brought down (CHARACTERS §6: dictionaries, morphemes) | texture (the Linguist) |
| `seal-6-6` | the square gallery, a niche cut square, low | The count on a square niche low in the square wall fills. Inside is a clay water jar with its neck stopped with wax, and the wax is cracked. | The road-works crew's water: they worked the gallery and stopped at the light (V1) | V1; C-59 (texture) |

The NICHES rule stands, made exact: if Dan earns more Keys than a week's rows, the surplus opens next week's first rows that carry **neither a sign nor a record** (from week 6 that is `seal-7-3` only; any surplus beyond it goes to finds, BALANCING §3). **Build rule:** a *(Key)* step reads correctly even if its sealed thing had not been seen before (each line names the place and its count; in week 1, its strokes). The NICHES rows with no *(Key)* step line written in ARR1/ARR2 get one composed from NICHES' "What the count opens" column, so a Key never waits for a view. Since the language pass (D-074) the form is a whole sentence, *The count on [the place] fills.* (in week 1, *The strokes on [the place] fill.*), then what lies inside, said as a sentence. The composed lines, as the app carries them:

| Id | Where | The line when it opens |
|---|---|---|
| `seal-1-2` | The Salt Gallery, the pick niche | The strokes on the pick niche fill. Inside lies a bronze salt-pick, its edge worn to a curve and its handle wrapped in cord gone black. Beside it on the wall is a short line in the tally's hand. |
| `seal-1-3` | The Lamp Hall, a low niche under the ledge | The strokes on the niche below the ledge fill. Inside is a clay saucer, the twin of the lamp's foot, and it is empty. |
| `seal-1-5` | The Mouth, a recess in the shaft wall | The strokes on the recess in the shaft wall fill. Inside, hung on a nail, is a brass tag stamped with a shaft number. |
| `seal-2-3` | The Salt Gallery, a crack above the lone ring | The count by the crack above the ring fills. Inside is a bone comb with two teeth gone, and beside it on the wall is a short line in the tally's hand. |
| `seal-2-5` | The Survey Cut, the box by the cot | The count on the box by the cot fills. Inside are a tin of tea, a spoon, a candle stub, and a shopping list in her hand: batteries, batteries, tape. |
| `seal-3-3` | The Stair's first turn, a recess | The count on the recess at the first turn fills. Inside is a coil of measuring cord, knotted every ten paces, the knots gone stiff. Beside it on the wall is a short line in the tally's hand. |
| `seal-3-4` | The Lamp Hall, the foot of the wall by the lamp | The count at the foot of the wall by the lamp fills. Inside lies a stub of stone, the broken edge of a rod, and with it a scatter of chips. |
| `seal-3-5` | The Survey Cut, a ledge | The count on the ledge in her camp fills. On the ledge is a box of tape cassettes, and three of them are labelled in her hand: DAY 3 (HIM), DAY 6 (IT WORKS), DAY 14. |
| `seal-4-3` | The Survey Cut, the recess above the cot | The count on the recess above the cot fills. Inside, pinned to the back of the recess, is a printed email. |
| `seal-4-5` | The Salt Gallery, a hollow in the salt | The count on the hollow in the salt fills. In it lies a child's clay animal, a sheep, with one leg mended with salt. Beside it on the wall is a short line in the tally's hand. |
| `seal-5-3` | The Stair, the gap's sill | The count on the sill of the gap fills. On the sill lie wax crumbs and a broken stylus, and beside them on the wall is a short line in the tally's hand. |
| `seal-5-4` | The Survey Cut, the notebook's back pocket | The count on the notebook's back pocket fills. Inside is a folded map of the hill, with the shaft marked in pen and, in another pen, SALT? and TUNNEL? |
| `seal-5-5` | The Lamp Hall, the ledge's underside | The count on the ledge's lip fills. Under the ledge is a ring cut small, where no one would look, and beside it is a short line in the tally's hand. |
| `seal-6-3` | The square gallery, a wall-shelf | The count on the wall-shelf fills. On the shelf lies a bronze level, its bubble long dry. |
| `seal-6-5` | The Survey Cut, her folder | The count on her folder fills. In its first pocket are a letter from the council about the shaft and a note from a car's windscreen: "Your car's been here nine days. Ring me." |

---

## 6. Marks (signs), with their candidates

Every new mark arrives with a context and **four candidates**, one tempting but wrong (SCRIPT §9); a guess renders with a question mark in every record that contains it; the place confirms later, and a rejected guess is **one line in the marks screen**, never "wrong" at guess time. `mk-give`'s first three candidates are all provisionally right until month 9 (SCRIPT §7.6).

| Id | Sign | w | Context (where it is guessed) | Candidates (the true one first here; the app shuffles) | Tempting wrong | Confirmed by | The line if a wrong guess is struck |
|---|---|---|---|---|---|---|---|
| `mk-lamp` | LAMP | 1 | `b-1.3` a carved lamp beside it | lamp · cup · hand · fire | cup | `b-3.A` (the lamp-cups wake) | *Not a cup. A cup with fire in it.* |
| `mk-fire` | FIRE | 1 | `b-1.4` a carved flame beside it | fire · light · sun · fork | light | `b-3.A`, then `b-3.1` (the flame's mark and the hook-and-drop in one cell) | *That's the flame's own mark: the flame itself.* |
| `mk-give` | GIVE | 2 | `b-2.2` the lintel; her box sheet has only a question mark | give · send · answer · open | open | give / send / answer: all provisional until month 9. *Open* dies at `b-5.3` | *Not open. Here it stands with the lamp's mark and the flame's, and there is no door near it.* |
| `mk-person` | PERSON | 2 | `seal-2-1` her box sheet (*someone*) | person · someone · stranger · standing | stranger | `b-3.1` (S3: *he stood and counted*) | *Not just a stranger. Anyone at all who stands.* |
| `mk-one` | ONE | 2 | `seal-2-1` (*one*) | one · the first · a drop · small | a drop | week 8 (the numbers: it is the numeral 1) | *A drop, yes, but it's counting. One.* |
| `mk-me` | ME | 2 | `seal-2-1` (*me*) | me · you · mine · here | you | `b-3.1` (S3: *I sat*) | *It's whoever is doing the talking.* |
| `mk-here` | HERE | 3 | `seal-3-1` a carved bar beside it | here · floor · ground · place | floor | the morning after `b-3.B` (S1 re-rendered) | *It means where you are. Here.* |
| `mk-door` | DOOR | 3 | `b-3.B` a carved doorway beside it | door · lintel · gate · arch | lintel | S3 re-rendered at the morning after `b-3.B` (*two marks by the door*), with the opened lintel as the evidence | *Not the lintel. All of it: a door.* |
| `mk-deep` | DEEP | 4 | `b-4.2` a carved well beside it | deep · down · well · water | well | the week's morning: S1 re-rendered with DEEP beside her sheet's *in* | *The well was only the picture. It's how far down.* |
| `mk-once` | ONCE | 5 | `b-5.1` a setting sun beside it | once · evening · over · end | evening | `b-5.A` (every record opens with it) and K1 (*Lit.*) | *Something that's over, not the evening.* |
| `mk-path` | PATH | 5 | `b-5.1` a road beside it | way · road · line · floor | road | week 7 (`wd-open-way` opens the lintel) | *Not only a road. Any way at all.* |
| `mk-go` | GO | 5 | `b-5.1` the same bar, its drop at the far end | go · leave · arrive · walk | arrive | the week's morning: S4 re-rendered, *…: go.* | *The drop's at the far end: leaving, not arriving.* |
| `mk-open` | OPEN | 6 | `b-6.2` a doorway beside it | open · gap · two · apart | two | week 7 (`wd-open-way`) | *Not two. A door with its lintel gone: open.* |
| `mk-eat` | EAT | 6 | `b-6.2` a loaf beside it | eat · bread · take · food | bread | the week's morning (S2 re-rendered, *ate [ ]*), then S6 at `b-7.2` (*ate [ ]*) | *The loaf's the picture. The mark is what you do with it.* |
| `mk-up` | UP | 7 (run-ahead) | `b-7.1` the sky beside it | up · out · sky · roof | sky | week 7 (S6 at `b-7.2`: *up [a barn]*) | *Not the sky. Which way: up, and out.* |
| `mk-stone` | STONE | 7 | `b-7.1` a block beside it | stone · wall · block · hill | wall | week 13 (`wd-move-stone`) | *Not the wall. What the wall is made of.* |
| `mk-child` | CHILD | 7 | `b-7.1` a child's tablet beside it | child · boy · small · pupil | boy | week 7: S6 at `b-7.2` (*gave child*) and V3 at `b-7.B` | *Not only a boy. Any child.* |

**True synonyms are accepted.** Where a candidate is a true second sense (*place* for HERE, *down* for DEEP, *leave* for GO, *out* for UP, *the first* for ONE, *someone* for PERSON), choosing it counts as right: it renders as its own word and is never struck. Only the listed tempting wrong one is struck, and only when the confirming beat plays.

**Marks recognised, not guessed** (no candidates; the marks screen names the shape): `mk-ring` (week 1; *a ring*; her sheets give *[name]*, so by week 2 the screen says *a ring: a name*); `mk-hand` (week 4, `b-4.4`: *a hook closed on a dot*, her sheet's *signature?*; the rod's hook is *a hook with a tail*, named at `b-2.B`; the wall by the lamp's hook is described only as *not this hook* (`b-4.4`) and is never named or matched to the rod's before L8, week 6). The partial signs are `mk-give`'s hook (`b-1.7`, High) and `mk-deep`'s wedge (`b-3.4`, High), both already written.

**Count against the budget:** 14 marks guessed inside the six weeks plus 2 recognised, and 3 in the run-ahead, against the budget's 8–12. The budget was an estimate; the sealed order is canon (SCRIPT §6: region 1 front-loads its marks so the first word lands in week 2–3), and weeks 5–6 each carry three or two. No change.

---

## 7. Words, with the cutting cinematic

Both are already written as four-tap arrivals (one line per tap; no title or line names the word). The cinematic adds only what the build needs: what moves, when, and where the camera is. Motion follows direction D (smooth everyday, cinematic at big moments); no sound in the MVP.

**`wd-light` (FIRE-GIVE), `b-3.A`, week 2–3.** req: `b-2.B`, `b-2.2`.
1. Tap 1, *You set the rod's edge in the blank.* Camera close on the side-wall lintel, the hall behind in the dark, the clay lamp's glow at the frame's edge. The rod's edge settles into the blank with a small haptic.
2. Tap 2, *You cut the first mark, the flame's.* The flame's mark cuts in, a line of violet-white light following the stroke.
3. Tap 3, *You cut the second, the hook and the drop.* The second mark cuts in.
4. Tap 4, *Light fills the cuts along the wall, and the rod rings once, low, like a struck pipe.* Both marks fill; light runs out of them along the lacing on the wall (a thin line, left and right) for about a second. A single long haptic for the ring.
5. **The wake** (no tap, about 6 s, cinematic): the camera pulls back and turns down the hall; the cups wake one by one, near to far, down both walls (a hand of them, then quicker, then more than can be counted), round the corner, and a glow comes up on the salt. The stone under the lintel is not there: it goes to dust-light and is gone. Beyond: the landing, already lit.
6. The arrival settles on the open lintel and the lit landing. Gold comes up the floor as the day completes, as at every arrival. The map fills (the hall lit; the head of the Stair) the next time it is opened.
Painting states needed: the hall with cups **dark** and **lit**, and the live layer **waking** (hall.js already has all three); the lintel **sealed** and **open**.

**`wd-open-way` (PATH-OPEN), `b-7.A` and again at `b-7.C`, week 7 (run-ahead).** req: `mk-path`, `mk-open`.
The same four beats at the lintel at the foot of the second flight; after tap 4 the stone under the lintel is not there and the Stair's lamps go on down, lit, past the frame (no wake: these were lit already). At `b-7.C` the fourth beat is the great door's count filling stroke by stroke, then the door not there, and the hall's light going down eleven steps of a steeper stair and stopping. Cold air: the fog layer runs out of the door toward the camera, once.

---

## 8. Finds (72)

A find is **a thing already true, delivered as a find, never a bare reward** (sealed README). About twelve a week (BALANCING §4–5): an avoided job always brings one; switching after a long stretch; every side chamber on the open route; camp (the morning, if bedtime was kept, and the camp views, §3); a rhythm met past the week's supply. **Drawn from the pool for the stretch Dan is on, in the listed order, each once**, within its window. If a stretch's pool runs out, the next stretch back up the route gives its next one. Side chambers take their stretch's **told-line** finds first (about one in three side chambers holds one, BALANCING §5), so the told lines surface on long delves. Every find is either tied to a clue in `CLUE_LEDGER.md` or is texture whose truth is stated here in a clause and plants nothing.

`w` = earliest story week; `req` = must have played first. Line = what the app shows (one or two whole sentences about one drawable thing).

### 8.1 The pool

| Id | Stretch | w / req | Line | Truth (and ties) |
|---|---|---|---|---|
| `fd-a01` | mouth | 1 | At the ladder's foot, an old rung lies in the dust, bent in the middle, and the rung above it on the ladder is newer than the rest. | The council replaced it when it put up its notice: two ages of the one shaft (X-padlock). Texture |
| `fd-a02` | mouth | 1 | On the brick of the shaft at the ladder's foot is an arrow in old chalk, pointing down, and beside it: 36 FT. | The company's shaft-sinkers' mark, in the railway age's feet (SCRIPT §11). The trial shaft (X-padlock). Texture |
| `fd-a03` | mouth | 1 | Behind a bracket, folded small and pushed in, is a cereal-bar wrapper, foil side out. | Hers. Texture |
| `fd-a04` | mouth | 1 | Where the shaft's brick stops, its last course is laid right against the stone below, with no mortar between them. The stone was here first. | The trial shaft broke into the makers' passage from above. Texture |
| `fd-a05` | mouth | 1 | In the dust of the passage are bootprints, all of one size, going in and out, so many that they have worn a path. | Her daily rule, go up every night (L6). Texture |
| `fd-a06` | mouth | 1 | A length of blue rope is tied to the bottom rung. It has been cut, and the end melted into a knob. | She lowered what her car held down the shaft at Day 40 (L15, month 4). Ties `fd-e08` |
| `fd-b01` | hall | 1 | On the lip of the ledge is a drip of glaze the colour of the lamp, as hard as glass. | He glazed the lamp new with the Site's dust when the first came back old (S7; WORLD_TRUTH rule 2). Ties C-01 |
| `fd-b02` | hall | 3 / `b-3.A` | In each cup the flame has no wick. It stands on the mark itself. | The Cut is technology; the mark burns (rule 1). R1 |
| `fd-b03` | hall | 6 / `b-6.1` | Under the carved lamp on the wall, faint in pencil, is a grid of small squares, the kind you draw before you cut. | She laid out the wall (L8). R2, after the fact |
| `fd-b04` | hall | 1 | On the ceiling above the ledge is a fan of old soot, thick at its point. | The lamp burned oil in the first's day (S1), and her candles later. C-01 |
| `fd-b05` | hall | 1 | Five candle stubs stand in a row on the floor by the ledge, burned down to the stone. | Hers, before the lamps woke (Days 1–6, L5). Texture |
| `fd-b06` | hall | 3 / `b-3.A` | One cup near the corner was broken at the lip and has been mended with a paste of the same stone. The flame's mark inside it is whole. | He mends what he keeps (the mended cup, week 23). Texture |
| `fd-b07` | hall | 1, until `b-7.C` | At the foot of the great door, the dust lies in a line along the floor, finer than anywhere else, as if air has moved under it for a long time. | The makers' straight descent behind it (C-05); the cold air of 7.C |
| `fd-b08` | hall | 1 (side) | In a crack beside the ledge lies the burnt end of a wick, and beside it, cut small, is a line in the tally's hand. | `tl-wick` (§8.2) |
| `fd-b09` | hall | 1 | Under the ledge lies a flake of glaze, a shade darker than the lamp's. | The lamp's first glaze, before it was made new (S7). Ties C-01 |
| `fd-b10` | hall | 1 | On the floor of the hall, in chalk, is an arrow pointing at the side chamber, and the word CAMP. | Hers. Texture |
| `fd-b11` | hall | 3 / `b-3.A` | In the lamplight there are rings on the ceiling too, cut where no ladder has been. | Cut at his reach, twice a man's height (C-04a; C-04) |
| `fd-b12` | hall | 1 | The lamp's flame does not bend, even when you breathe on it. | It burns by his word, not by oil (C-01, C-02) |
| `fd-c01` | hall (the corner) | 1 | In the bottom of one trough at the corner lies a dry leaf, brown and crumbling, of the kind that grows on a hedge. | Carried in on her boot from the field: the only thing from the world on this floor. Texture |
| `fd-c02` | salt | 1 (side) | At the gallery's first turn, a knot of wool gone grey is tied round a knob of salt, and a short line is cut beside it. | `tl-wool` |
| `fd-c03` | salt | 2 (side) | In a crack in the salt lies a small cake of salt with a thumbprint pressed into it, and under it is a line in the tally's hand. | `tl-salt-cake` |
| `fd-c04` | salt | 1 (side) | A chip of salt lies here, scratched with strokes in rows of five, and beside it is a line in the tally's hand. | `tl-count` |
| `fd-c05` | salt | 2 (side) | A carrying pole lies in the salt, a length of wood worn smooth in two grooves, and a few marks are cut beside it. | `tl-yoke` |
| `fd-c06` | salt | 1 | A bronze awl gone green is stuck point first in a crack of the salt. | The first's age (bronze). Texture |
| `fd-c07` | salt | 1 | There is a strip of hide here, gone as hard as wood and knotted in a loop. | A donkey's halter (the salt went down the hill on a donkey, S9 in month 4). Texture |
| `fd-c08` | salt | 1 | In the crack with her sheets is a pencil, worn down to the length of a thumb. | Hers. Texture |
| `fd-c09` | salt | 1 | In the tally's lowest cuts, salt has grown in small crystals, like frost in a crack. | Air from the split. Texture |
| `fd-c10` | salt | 1 | In the salt floor by the split is the print of a sandal, set hard, with the marks of its straps still showing. | The first's, from the day the hill split. Texture |
| `fd-c11` | salt | 1 | Between two of the stones in the split is a plug of wool with salt worked into it. | He sealed the crack himself on the way out (S4). C-09 |
| `fd-c12` | salt | 2 / `b-2.A` | Seen close, the lone ring over the tally is a single cut, with no place where it starts or stops. | The ring is the only curve (SCRIPT §2), cut by a hand that has cut thousands. C-12 |
| `fd-c13` | salt | 1 / `seal-1-2` | In the pick niche, the floor is scored where a pick was laid down and taken up, many times. | The first's pick. Texture |
| `fd-c14` | salt | 2 / `b-2.A` | On the back of her Day 4 sheet she has sketched the corner's two troughs and measured across them, and written: *stride?? 1.4 m* | Hers. C-04a |
| `fd-d01` | camp | 1 | A hair elastic is wound round the notebook's pencil. | Hers. Texture |
| `fd-d02` | camp | 1 | Among her things is a page from an old railway timetable, thinly printed. One line is ringed in pencil, and the station's name is torn away. | Hers: she traced the railway company (TIMELINE). Texture |
| `fd-d03` | camp | 1 | A tea bag has dried to paper on the lid of a mug. | Hers. Texture |
| `fd-d04` | camp | 2 | Among her papers is a photocopy of a page of handwriting in brown ink. At the top it says *Log.*, and the rest is greyed out by the copier. | The Engineer's log, copied from the archive (TIMELINE). Ties E1 (week 10) |
| `fd-d05` | camp | 1 | A roll of black tape lies here, and a battery with its label peeled off. | Her tapes and their batteries (L5). Texture |
| `fd-d06` | camp | 1 | A thermos stands on the shelf with its cup upside down, and a brown ring has dried inside the cup. | Hers. Texture |
| `fd-d07` | camp | 1 | There is a crossword torn from a newspaper, half done in pencil, with the date torn off. | Hers. Texture |
| `fd-d08` | camp | 1 | On the frame of the cot is a strip of masking tape with DAY 1 written on it in marker. | Hers. Texture |
| `fd-d09` | camp | 1 | There is a box of matches with three left in it. | Hers, before the lamps woke. Texture |
| `fd-d10` | camp | 6 / `b-6.1` | On the wall above the cot are pencil tallies in fives, twelve strokes in all, and a line is drawn under the last. | The nights she went up, from her rule on Day 9 to Day 20 (L6, L8). C-35 |
| `fd-d11` | camp | 1 | A paperback thriller lies face down, open at page 211. | Hers. Texture |
| `fd-d12` | camp | 1 | A fleece hat hangs on a nail by the door. | Hers. Texture |
| `fd-e01` | stair | 3 | Where a step's edge is chipped, the stone inside is darker and threaded with something like glass. | The lacing: the Seed's material, in the Site's rock (WORLD_TRUTH rule 2). Texture |
| `fd-e02` | stair | 3 (side) | At the edge of the landing lies a wax seal the size of a coin, its stamp worn flat, and the tally's hand has cut a line beside it. | `tl-seal` |
| `fd-e03` | stair | 3 | Down the wall of the top flight runs a long band, polished smooth at the height of a long hand, as if one hand went down this wall many times. | His hand on the wall (C-04a; the rail at week 7, C-36) |
| `fd-e04` | stair | 3 | A bronze nail with a square head is driven into a crack at the first turn. | A surveyor's station mark: the second measured the Stair (V1's paces). Texture |
| `fd-e05` | stair | 3 | On the rail is a pencil tick, and beside it is written: *1.3 m. Rail for somebody tall.* | Hers. C-04a |
| `fd-e06` | stair | 3 | On the top step lies a flake of candle wax, and beside it is the print of a trainer's sole. | Hers, from Day 6 (L5). Texture |
| `fd-e07` | stair | 3 | On the wall at the head of the top flight is one ring, set apart from the rest and cut deeper. | The first ring of the Stair: his list begins its halls with it (K4, week 43.2). Tied to K4 |
| `fd-e08` | stair | 4 | Round the edge of one step a rope has worn a groove, and a thread of blue is caught in it. | Her rope, Day 40 (L15). Ties `fd-a06` |
| `fd-e09` | stair | 3 | In the wall of the top flight, at the height of your head, is a row of small cut hollows, each the size of a fingertip. There are four, then a space, then four more. | Holds for a four-fingered hand (C-10) |
| `fd-e10` | stair | 3 | A folded page is wedged under a step. On it is a sketch of the stair with every step marked *50 cm*, and underneath is written *built for legs longer than mine*. | Hers. C-04a |
| `fd-f01` | flight2 | 4 | By the little door lies a square of foam mat, cut to kneel on. | Hers: she knelt at it; it opened to her (L6: *the little door there is open*). C-24 |
| `fd-f02` | flight2 | 5 / `b-5.0` | Written in pencil on the jamb of the little door are the words *open. D9* | It opened to her; it is shut to you: a count knows its bearer (C-24) |
| `fd-f03` | flight2 | 4 | Along the wall of the second flight, at the height of your waist, runs a straight black line, snapped like a chalk line. | The second's levelling line (he was vain about his levels). Texture |
| `fd-f04` | flight2 | 5 | In a corner of the second landing stands a small clay lamp with a spout and a handle. There is soot in the spout, and the lamp is cold. | The second's own lamp: every reader carried one down (R9.5, month 11). Texture |
| `fd-f05` | flight2 | 5 | Down the second flight, a long shallow groove runs through the dust of every step, where something heavy was dragged. | Hers, Day 40 (L15). Texture |
| `fd-f06` | flight2 | 5 | A heap of square-edged stone chips has been swept against the wall under the gap. | The crew widened the gap; the boy cut marks through it (the wax crumbs, `seal-5-3`). Texture |
| `fd-f07` | flight2 | 4 | On the riser of one step is a ring worn so smooth that it is only a shine in the stone. | Worn by ages of touch: the opposite of the sharp ring (C-29) |
| `fd-f08` | flight2 | 5 | There is a leather thong here, dry and curled, with a bronze bead on it. | The boy's (V3, X-boy at week 7). Texture |
| `fd-g01` | square | 6 (side) | In a niche at the height of a man's head, under a patch of soot, stands a clay lamp with a spout. Beneath it, cut small, is a line in the tally's hand. | `tl-lamp` |
| `fd-g02` | square | 6 (side) | A small sandal lies against the square wall, its hobnails in rows, and above it is a line of marks. | `tl-sandal` |
| `fd-g03` | square | 6 | Seen close, the square wall bears chisel marks a finger's width across, row on row, each one angled the same way. | Human cutting, beside the makers' toolless curve (C-58) |
| `fd-g04` | square | 6 | An iron hobnail has rusted to a brown stain on the floor. | The crew's. Texture |
| `fd-g05` | square | 6 | Strokes are scratched into the square wall at a man's height, in tens, with a gap after each ten. | The crew's days, in tens (SCRIPT §11). Texture |
| `fd-g06` | square | 6 | A wooden peg is driven into a crack, charred black at its end. | A torch-holder: the crew's light. Texture |
| `fd-g07` | square | 6 | Here lies a sherd of a big jar, with a stamped mark on it rubbed smooth. | The road-works' stores. Texture |
| `fd-g08` | square | 6 | A grey whetstone lies here, worn hollow in the middle. | The crew's. Texture |
| `fd-g09` | square | 6 | In the join where square meets round, a sliver of grey metal has been poured into a crack to key a block. | Lead, the masons' key (C-58) |
| `fd-g10` | square | 6 | At the height of your knee, a line is cut the length of the gallery, dead level. | The crew's level line, by the foreman's level (C-64) |

### 8.2 The told lines (8, in the Cut)

Objects from before paper carry no writing of their own; their lines are cut beside them in his hand, with his hand-mark (LIVES §8). Each is a sign string (SCRIPT §8.2); the app computes the partial rendering from the signs held (§4). Every sign used is in SCRIPT §3; pictures are in brackets.

| Id | Find | Cut | Rendering when held | At its earliest week |
|---|---|---|---|---|
| `tl-wick` | `fd-b08` | VOICE OF ONE: [wick] OF LAMP OF ME · ONCE {h} | *Told: my lamp's [wick]. Once.* | w1: *[ ] [ ] [ ]: [a wick] [ ] lamp [ ] [ ] · [ ].* |
| `tl-wool` | `fd-c02` | VOICE OF ONE: [wool] HERE · ME GO UP, FIRE NOT; HAND STONE {h} | *Told: [wool], here. I went up, no fire; hand on stone.* | w1: *[ ] [ ] [ ]: [wool] [ ] · [ ] [ ] [ ], fire [ ]; [ ] [ ].* |
| `tl-salt-cake` | `fd-c03` | VOICE OF ONE: [salt cake] · ME GIVE; ONE TAKE NOT {h} | *Told: [a salt cake]. I gave it; he took it not.* | w2: *[ ] [ ] one: [a salt cake] · me [give?]; one [ ] [ ].* |
| `tl-count` | `fd-c04` | VOICE OF ONE: COUNT [salt block] · HAND HAND, with 8+2 cut beside {h} | *Told: the count of [salt blocks]: a hand, a hand.* (beside it, in eights: 8+2) | w1: *[ ] [ ] [ ]: [ ] [salt blocks] · [ ] [ ]*, and the small strokes beside |
| `tl-yoke` | `fd-c05` | VOICE OF ONE: [pole] OF ME · [salt block] TWO {h} | *Told: my [pole]. [Blocks], two.* (one at each end) | w2: *[ ] [ ] one: [a pole] [ ] me · [salt blocks] [ ].* |
| `tl-seal` | `fd-e02` | VOICE OF TWO: [seal] · MARK TOWARD ring {h} | *Told: [a seal]; marks for [ring].* | w3: *[ ] [ ] [ ]: [a seal] · [ ] [ ] [ring].* |
| `tl-lamp` | `fd-g01` | VOICE OF TWO: LAMP OF PERSON ALL · PERSON ALL GO DEEP NOT {h} | *Told: the men's lamp. The men went not in.* | w6: *[ ] [ ] [ ]: lamp [ ] person [ ] · person [ ] went deep [ ].* |
| `tl-sandal` | `fd-g02` | VOICE OF TWO: [sandal] OF CHILD · CHILD GO DEEP; PERSON ALL NOT {h} | *Told: the child's [sandal]. The child went in; the men, not.* | w6: *[ ] [ ] [ ]: [a sandal] [ ] [ ] · [ ] went deep; person [ ] [ ].* |

What each keeps true: `tl-wick`, the lamp burned oil once (C-01); `tl-wool`, the first went up with no fire, hand on stone (S4); `tl-salt-cake`, he takes no food, as he eats none (C-11, C-61); `tl-count`, the transcriber counts in eights beside the reader's fives (C-11a); `tl-yoke`, the first carried salt on a pole before the donkey (S9, month 4); `tl-seal`, the second's reports went to the overseer (V1's *marks for [ring]*); `tl-lamp`, the men stopped at the light (V1, C-59); `tl-sandal`, the child went further than the men (X-boy, the wax crumbs).

---

## 9. Passage lines (160)

One is shown for a step that has no authored step beat (§0.2; shared with script glimpses, §9.9), on the main line and on the open route, for the stretch Dan is on. **Shown in order within a stretch; none repeats until the stretch's list is used up** (BALANCING §5: about three Normal weeks of steps a region before a line repeats). A line with a condition is skipped while its condition is false. Voice: say what is there; one drawable noun; no mood words; no count of anything missed.

### `st-mouth` (w1)
| Id | Line | Condition |
|---|---|---|
| `ps-m01` | The rungs are cold, and the ninth one is loose in its bracket. | |
| `ps-m02` | Up the shaft, the ladder's rails narrow and meet in the daylight. | |
| `ps-m03` | The draught goes up the shaft past your face, steady, and smells of nothing. | |
| `ps-m04` | In the shaft wall at the ladder's foot is a recess with a row of cut strokes on its lip, and a nail above it. | until `seal-1-5` |
| `ps-m05` | The passage curves off to the left, so slowly it hardly seems to. | |
| `ps-m06` | Dust on the passage floor, finer than flour. It lifts round your boots and settles again. | |
| `ps-m07` | The walls here are smooth enough that the dust does not stay on them. | |
| `ps-m08` | A bracket for a cable is bolted into the shaft's brick, but there is no cable. | |
| `ps-m09` | The passage floor dips a hand's depth down its middle, worn by feet. | |
| `ps-m10` | From the passage, the only sound is the air going up behind you. | |

### `st-hall` (w1; dark until `b-3.A`, lit after)
| Id | Line | Condition |
|---|---|---|
| `ps-h01` | The hall goes on past where the lamp's light reaches, and the air is colder that way. | before `b-3.A` |
| `ps-h02` | A cup is cut in the wall at the height of your head. It is empty, and the flame's mark is inside it. | before `b-3.A` |
| `ps-h03` | Another cup comes, and then another, a few paces apart, and all of them are empty. | before `b-3.A` |
| `ps-h04` | There are rings on the wall at the height of your shoulder, dozens of them, worn soft at the edges. | |
| `ps-h05` | The floor is one stone as far as the lamp shows, with no joins in it. | before `b-3.A` |
| `ps-h06` | From here the lamp on its ledge is small, and it does not flicker. | before `b-3.A` |
| `ps-h07` | The ceiling curves over so high the lamp's light gives out before it does. | before `b-3.A` |
| `ps-h08` | The marks go on up the wall past where you can reach. | |
| `ps-h09` | On the side wall, the lintel with only stone beneath it, and the blank beside its two marks. | before `b-3.A` |
| `ps-h10` | At the far end the lamp's light stops well short of the door. | before `b-3.A` |
| `ps-h11` | The hall smells of dry stone and, very faintly, of salt. | |
| `ps-h12` | The cups burn along both walls, each flame the same height as the last. | after `b-3.A` |
| `ps-h13` | In the lamplight every cut in the walls stands out in its own shadow. | after `b-3.A` |
| `ps-h14` | The lamps go round the corner and on toward the salt. | after `b-3.A` |
| `ps-h15` | The cups throw small half-moons of light on the floor, in a row. | after `b-3.A` |
| `ps-h16` | The stone under the lintel is gone, and the landing beyond it is lit. | after `b-3.A` |
| `ps-h17` | The flames stand straight. The draught along the hall does not move them. | after `b-3.A`, until `b-7.C` |
| `ps-h18` | Lit, the hall's floor shows a paler path worn down its middle. | after `b-3.A` |
| `ps-h19` | At the far end the great door fills the wall, and the lamps stop short of it. | after `b-3.A` |
| `ps-h20` | The light reaches the ceiling now, and there are marks there too, with rings among them. | after `b-3.A` |
| `ps-h21` | The flames in the cups are the colour of the clay lamp's, and there is no oil in any of them. | after `b-3.A` |
| `ps-h22` | The ledge is cut out of the wall itself, with no join. | |

### `st-salt` (w1; the corner is on this stretch's first steps)
| Id | Line | Condition |
|---|---|---|
| `ps-c01` | At the corner the floor dips twice, a stride apart, and the dips are smooth as a basin. | |
| `ps-c02` | The polished wall at the corner shines where the rest of the hall is matt. | |
| `ps-c03` | Past the turn, the smell of salt gets stronger. | |
| `ps-c04` | The gallery floor is salt here, packed hard and grey, and it creaks underfoot. | |
| `ps-c05` | The salt face is streaked in bands of grey and white. | |
| `ps-c06` | The tally runs along the wall at the height of a man's chest. | |
| `ps-c07` | The tally's lowest cuts are furred white. | |
| `ps-c08` | Her sheets are in the crack, and the top one is curling at the corner. | |
| `ps-c09` | The split is packed tight, stone against stone, salt in every gap. | |
| `ps-c10` | Between the tally's marks are small pictures, a lamb, a loaf and a bird with long legs. | from w2 (`seal-1-1`) |
| `ps-c11` | The roof is low here, and the salt overhead has a sheen on it. | |
| `ps-c12` | Where the cut stone meets the salt, the line between them is as straight as a rule. | |
| `ps-c13` | Salt dust lies drifted against the wall, as fine as sugar. | |
| `ps-c14` | The salt face is marked with pick scars, short and slanting. | |
| `ps-c15` | The tally goes under a crust of salt and comes out the other side. | from w4 |
| `ps-c16` | Past the split the gallery narrows to the width of a man's arms held out. | |
| `ps-c17` | Now and then the salt ticks, like a stove cooling. | |
| `ps-c18` | In the glow from the corner, the salt's bands show all the way up the face. | after `b-3.A` |
| `ps-c19` | The lone ring over the tally catches the light before anything near it. | from w2 (`b-2.A`) |
| `ps-c20` | In front of the tally, a hollow worn in the floor where someone stood to read it. | |

### `st-camp` (w1)
| Id | Line | Condition |
|---|---|---|
| `ps-s01` | Her camp smells of paraffin and paper. | |
| `ps-s02` | The cot's canvas sags in the middle, in the shape of whoever slept on it. | |
| `ps-s03` | A bootlace hangs out from under the cot, untied at one end. | |
| `ps-s04` | On the wall above the cot is a nail with nothing on it. | |
| `ps-s05` | On the wall by the doorway are sums in pencil, crossed out. | |
| `ps-s06` | The notebook's pencil has tooth marks all along it. | |
| `ps-s07` | The chamber is rounded like the hall, but the ceiling is low enough to touch. | |
| `ps-s08` | A folding chair stands here with one leg wrapped in tape. | |
| `ps-s09` | There is dust on the shelf, and a clean stripe where something long used to lie. | after `b-2.B` |
| `ps-s10` | A pair of socks hangs on a string across the corner, as stiff as card. | |
| `ps-s11` | Her things stand in piles along the wall, each pile squared off. | |
| `ps-s12` | A plastic crate is turned over for a table, with rings of mug stains on top. | |

### `st-stair` (w3, after `b-3.A`)
| Id | Line | Condition |
|---|---|---|
| `ps-t01` | The landing has no rail at its edge. The drop to the first step is a stride. | |
| `ps-t02` | The treads are deep enough to lie down on. | |
| `ps-t03` | The steps are worn pale down the middle. | |
| `ps-t04` | The rail is cut out of the wall itself, at the height of your chest. | |
| `ps-t05` | The stair's lamps go down ahead of you, one every few steps. | |
| `ps-t06` | Past the first turn the hall's light is behind you, and the stair's own lamps go on. | from w4 |
| `ps-t07` | There are rings on the stair wall too, at the height of a tall man's eye. | |
| `ps-t08` | The air comes up the stair, slow, a little warmer than the hall's. | |
| `ps-t09` | One step has a chip out of its edge, and the chip still lies on the step below. | |
| `ps-t10` | The walls are cut with marks all the way up past the lamps. | |
| `ps-t11` | From the landing the top flight looks shorter than it is. | |
| `ps-t12` | At the first turn there is a niche with a count beside the rail, and its strokes are empty. | until `seal-4-1` |
| `ps-t13` | The rail's top is polished darker than the wall. | |
| `ps-t14` | The stair's lamps light the underside of the flight above. | from w4 |
| `ps-t15` | Grit on one step crunches under your boot, and the next is swept clean. | |
| `ps-t16` | At the first turn the wall bulges round the rail like a knuckle. | |
| `ps-t17` | Two lamps stand at the turn, one on either side, like the posts of a gate. | |
| `ps-t18` | From the first turn, the second flight goes down, and there is a small door on it. | until `b-4.1` |
| `ps-t19` | A long hand could rest on this rail without bending. | |
| `ps-t20` | The steps have no joins. The whole flight is one stone. | |

### `st-flight2` (w4 seen from the turn; walked from w5)
| Id | Line | Condition |
|---|---|---|
| `ps-f01` | The second flight is steeper than the first. | |
| `ps-f02` | A finger's width of dark runs down one edge of the little door. | |
| `ps-f03` | Under the second turn is the recess, with its count. | until `seal-5-1` |
| `ps-f04` | The lamps on the second flight are further apart. | |
| `ps-f05` | At the second turn the stone goes paler, almost cream. | |
| `ps-f06` | At the gap the round stone has been cut back, rough, by smaller tools. | from w5 (`b-5.B`) |
| `ps-f07` | The second landing's floor is worn in a curve toward the low doorway. | from w5 |
| `ps-f08` | On the second landing the lamps are set lower in the wall than on the stair. | from w5 (`pl-w5-second-landing`) |
| `ps-f09` | The rings here are smaller and closer together. | |
| `ps-f10` | One step has a ring cut in its riser, where no one standing would read it. | |
| `ps-f11` | Below the second landing the stair goes on, and a lintel stands over it with only stone beneath. | from w6 |
| `ps-f12` | The rail on the second flight is broken off for a stride, and the break is old and smooth. | |
| `ps-f13` | From the second landing you can hear air moving below, a long way down. | from w5 |
| `ps-f14` | A small square stone lies on the landing. It is not the stair's stone, and someone brought it in. | from w5 |
| `ps-f15` | The lamps on the second landing throw your shadow back up the stair. | from w5 |
| `ps-f16` | The second flight's steps are as high as the first's, and narrower. | |

### `st-square` (w6)
| Id | Line | Condition |
|---|---|---|
| `ps-g01` | The square gallery runs straight, as if someone drew it with a rule. | |
| `ps-g02` | The chisel marks are small and close, row on row. | |
| `ps-g03` | The ceiling is flat. It is the only flat ceiling down here. | |
| `ps-g04` | The square walls are bare, except where the tally's hand has cut on them. | |
| `ps-g05` | In the dust of the square floor, old and hard, are the marks of hobnails. | |
| `ps-g06` | The gallery smells of old smoke. | |
| `ps-g07` | Every ten paces, a short line cut at the edge of the floor. | |
| `ps-g08` | A square beam-slot is cut in the wall, with nothing in it. | |
| `ps-g09` | The square stone is darker than the round, and it has cracks in it. | |
| `ps-g10` | The gallery's corners are sharp enough to cut a finger on. | |
| `ps-g11` | A crack in the ceiling has been stopped with a wedge of wood gone grey. | |
| `ps-g12` | Down the middle of the ceiling runs a faint line of soot, where lights were carried. | |
| `ps-g13` | The floor rises very slightly toward the middle, the way a road does to shed water. | |
| `ps-g14` | The dust gets thicker toward the far end. | |
| `ps-g15` | There is a pale patch on the square wall where a board was fixed, and four holes for its pegs. | |
| `ps-g16` | Behind you the stair is lit. Ahead, the square stone goes dark. | |

### Anywhere (4)
| Id | Line | Condition |
|---|---|---|
| `ps-x01` | Now and then a draught comes up from below, enough to lift the dust. | |
| `ps-x02` | It is so quiet that you can hear your own boots. | |
| `ps-x03` | Far behind you, the lamp's light still shows on the wall. | before `b-3.A` |
| `ps-x04` | Dust turns slowly in the light and does not settle. | |

Count: 10 + 22 + 20 + 12 + 20 + 16 + 16 + 4 = 120, plus the 40 below: **160**.
### More, where the early weeks run short (40)

The first weeks' stretches are the ones a Normal week walks most (about 35 steps without a beat), so they get more.

| Id | Stretch | Line | Condition |
|---|---|---|---|
| `ps-m11` | mouth | The shaft's brick is stamped with a maker's mark, worn to a blur. | |
| `ps-m12` | mouth | A bolt in the brick, and a brown rust stain running down from it. | |
| `ps-m13` | mouth | Where the passage leaves the shaft, the floor is scuffed grey by boots. | |
| `ps-m14` | mouth | The passage is just too wide to touch both walls at once. | |
| `ps-h23` | hall | The lamp's light lies on the floor in an oval, and the rest is dark. | before `b-3.A` |
| `ps-h24` | hall | The wall by the ledge is cut so densely it looks like woven cloth. | |
| `ps-h25` | hall | One cup has a hairline crack across its lip. | |
| `ps-h26` | hall | The hall's floor is cold through your boots. | before `b-3.A` |
| `ps-h27` | hall | Two rings are cut so close together that their curves touch. | |
| `ps-h28` | hall | Somewhere past the lamp's light, the hall's far wall gives back your footsteps late. | before `b-3.A` |
| `ps-h29` | hall | Near the lintel, the marks are cut deeper than anywhere else on the wall. | before `b-3.A` |
| `ps-h30` | hall | The flames in the cups nearest the ledge lean very slightly toward it. | after `b-3.A` |
| `ps-c21` | salt | The salt floor is ridged, like sand after the tide. | |
| `ps-c22` | salt | A lump of salt the size of a fist has fallen from the roof and lies where it fell. | |
| `ps-c23` | salt | The cut stone band that carries the tally is a hand's width proud of the salt. | |
| `ps-c24` | salt | The gallery's air is drier than the hall's, and tastes of salt. | |
| `ps-c25` | salt | Where the tally turns a corner of the wall, its line does not break. | |
| `ps-c26` | salt | Her pencil has ticked some marks on the tally's first stretch, very lightly. | |
| `ps-c27` | salt | The salt face has a vein of darker grey running through it at a slant. | |
| `ps-c28` | salt | There is a dip in the salt floor shaped like a boot heel, and another beside it. | |
| `ps-c29` | salt | In the corner where the split meets the floor lies a little heap of salt grains, as fine as flour. | |
| `ps-c30` | salt | The tally's cuts are all the same depth, from the first to the last you can see. | |
| `ps-s13` | camp | A mug stands on the floor by the cot, with a dry brown ring at the bottom of it. | |
| `ps-s14` | camp | The camp's doorway is round-topped, and she has hung a jacket from a crack in it. | |
| `ps-s15` | camp | There is paper everywhere, weighted down with small stones. | |
| `ps-s16` | camp | A washing-up bowl stands dry, with a sponge gone hard in it. | |
| `ps-s17` | camp | A rolled mat leans against the wall, its strap undone. | |
| `ps-s18` | camp | On a cardboard box she has written FOOD, and under it, in smaller letters, *mostly*. | |
| `ps-s19` | camp | A plastic water bottle stands a third full, the water gone flat and clear. | |
| `ps-s20` | camp | By the door the smell of her camp gives way, and the air smells of stone again. | |
| `ps-t21` | stair | The lamps on the stair are set at the height of a tall man's hand. | |
| `ps-t22` | stair | A long crack runs down one side of the flight, and no step has moved. | |
| `ps-t23` | stair | The steps' edges are rounded, not sharp, from use. | |
| `ps-t24` | stair | Looking down the stair from the landing, the lamps make a line that bends at the turn. | |
| `ps-t25` | stair | A ring is cut low on the face of a step, half worn away by feet. | |
| `ps-g17` | square | One pick-mark in the square wall is deeper than the rest, where a blow went wrong. | |
| `ps-g18` | square | The square floor has been swept once, long ago: a clean strip along one wall. | |
| `ps-g19` | square | A grey stub of candle-grease sits on the lip of a crack. | |
| `ps-g20` | square | The gallery's walls lean in very slightly toward the top. | |
| `ps-g21` | square | Two chisel marks cross each other, the only crossed marks on the wall. | |


**Passage lines that imply a person, and who** (rule 6): `ps-c20` the hollow before the tally: hers, standing to read it with her sheets; `ps-c26` her ticks; `ps-f10` the ring in a riser: his, like every ring (C-29); `ps-f12` the broken rail: broken in the makers' own age and worn smooth since, nothing more; `ps-f14` the square stone on the landing: a squared chip the second carried in from his gallery (C-58); `ps-g17`, `ps-g18`, `ps-g19` the crew; `ps-s*` hers. Every other passage line describes stone, salt, light or air.

### 9.9 Script glimpses (computed, not written)

Between passage lines, a step may instead show **a line of script**: one sign group from a record Dan has already seen, in its current rendering (held signs in English, guesses with a question mark, the rest as glyphs), with the record's place named: *On the salt: once, [ring] one.* It is built from the sign strings (§4), never shows a sign Dan hasn't met, never an unseen record, and never the lesson-wall's last line or anything from after week 6. It keeps the step reward varied without new writing, and it is what BALANCING §4 calls "a line of script".

**How the step reward is shared out:** an authored step beat when one is free; otherwise passage line and script glimpse alternating, one of each per stretch visit; a sound (`ps-x` lines) at most once a day. With 160 passage lines and the glimpses, a Normal week's ~35 unbeaten steps in the first weeks use about 18 passage lines, so the region's lines last about four Normal weeks before any repeats (the four stretches open in weeks 1–2 hold 94 of them, plus the 4 for anywhere).


---

## 10. The week close: "learned" lines (18) and the month's "so far" (2)

**Learned lines** (BALANCING §7): up to three a week, one line each, **facts only, in the world's words, never the inference** (outside review S4). A line shows only if its beat played in that story week; if a beat has not played, its line waits for the week it does. Nothing here names a mark in English that Dan does not hold, and nothing says "you should have".

| Id | Shows if | Line |
|---|---|---|
| `wc-w1-1` | `b-1.A` | The lamp on the ledge was lit when you came down, and there is no oil in it. |
| `wc-w1-2` | `b-1.5` | Along the salt, one hand cut a long line of marks, and someone left pencilled sheets beside it. |
| `wc-w1-3` | `b-1.C` | Someone lived in the side chamber, and left boots, a notebook and a rod. |
| `wc-w2-1` | `b-2.A` | The tally tells of someone standing where the way turns, as tall as two of whoever told it, and a lamb. |
| `wc-w2-2` | `b-2.3` | She met someone where the corridor turns, and took him for a pillar. |
| `wc-w2-3` | `b-2.B` | The rod was left for the next one, with a note: cut the two marks on the lintel. |
| `wc-w3-1` | `b-3.A` | The lintel took the rod, and the lamps woke all down the hall. |
| `wc-w3-2` | `b-3.2` | She cut the same two marks on her sixth day, and a door opened for her too. |
| `wc-w3-3` | `b-3.B` | At the head of the stair there is a second clay lamp, unlit. |
| `wc-w4-1` | `b-4.A` | Her sheet for the stretch past the ring says: *go home… lamp… gave… went up.* |
| `wc-w4-2` | `b-4.4` | Nearly every record here ends with a hook closed on a dot. The wall by the lamp has another hook. |
| `wc-w4-3` | `b-4.3` | On her ninth day she made herself a rule: go up every night. |
| `wc-w5-1` | `b-5.A` | Every line of the tally begins with the same three marks, the bar with a tick, a ring and a single drop. |
| `wc-w5-2` | `b-5.3` | Behind the salt crust, the lamp's mark, the flame's and the hook-and-drop stand in a row, with no door near. |
| `wc-w5-3` | `b-5.2` | She called him the Tenant, and he let her. |
| `wc-w6-1` | `b-6.1` | The wall by the lamp was cut on her twentieth day, for the next one. |
| `wc-w6-2` | `b-6.A` | Square stone meets the round, and the record on it begins like the tally does. |
| `wc-w6-3` | `b-6.B` | In the square gallery there is a crew's wall, and a pay tablet with a ring at the head of every row. |

**The month's "so far"** (BALANCING §7: the first week close of each **month of play**, i.e. calendar weeks 1 and 5, whatever story week Dan is in; 3–5 lines, in the world's words, the open questions as things, never homework). Each line shows only if its beat has played; the week close shows the first five whose beats have.

| Id | Shows if | Line |
|---|---|---|
| `sf-m1-1` | `b-1.A` | The lamp on the ledge was lit before you came, and there is no oil in it. |
| `sf-m1-2` | `b-1.C` | Someone camped in the side chamber and left a rod behind. |
| `sf-m1-3` | `b-1.5` | The long line of marks in the salt was cut by one hand. |
| `sf-m1-4` | `b-1.A` | At the far end of the hall there is a door that is most of the wall. |
| `sf-m2-1` | `b-2.3` | The lamp on the ledge was lit for her too. |
| `sf-m2-2` | `b-2.A`, `b-2.3` | The tally's teller and she both met someone tall where the way turns. |
| `sf-m2-3` | `b-4.4` | Nearly everything here was cut by one hand. The wall by the lamp was not. |
| `sf-m2-4` | `b-4.3`, `b-5.0` | The little door she found open is shut to you. |
| `sf-m2-5` | `b-4.C` | The great door has a count, and two marks beside a blank. |
| `sf-m2-6` | `b-3.B` | At the head of the stair there is a second clay lamp, unlit. |

(`sf-m2-3` says *the wall by the lamp*: R2 completes at story week 6.)

### 10.3 Where you were: the one open question (6)

After an absence, "where you were" names the one open question for the story week Dan is in (BALANCING §7). One line, in the world's words; the week's first line whose beat has played, else the week before's.

| Id | Week | Shows if | Line |
|---|---|---|---|
| `aw-w1` | 1 | `b-1.A` | The lamp was lit when you came down, and there is no oil in it. |
| `aw-w2` | 2 | `b-2.B` | The rod is in your hand, and the lintel on the side wall has a blank the width of its edge. |
| `aw-w3` | 3 | `b-3.B` | The stair goes down from the landing, lit, and you did not light it. |
| `aw-w4` | 4 | `b-4.A` | Past the lone ring, her sheet says: *…go home… he held me… lamp… gave… went up…* |
| `aw-w5` | 5 | `b-5.A` | Every record in the tally begins the same way. The wall by the lamp does not. |
| `aw-w6` | 6 | `b-6.A` | Through the side passage lies square stone, and on it a record in the tally's hand. |

---

## 11. Teasers for "I can't start" (30)

Always **from just ahead**, a thing Dan can see and not yet reach; never a consequence, never new story (MVP; BALANCING). The app shows the **first teaser whose condition holds**, newest-written first within the week; the ARR teasers keep their ids and conditions.

| Id | w | Shows | Line |
|---|---|---|---|
| `b-w1.tz1` | 1 | before `b-1.A` | *Under the cap, eleven metres of ladder go down, and the air that comes up is dry.* (ARR1) |
| `b-w1.tz2` | 1 | after `b-1.A` | *There are three marks on the base of the lamp, and the lamp is warm.* (ARR1) |
| `tz-w1-a` | 1 | after `pl-w1-pick-niche`, until `seal-1-2` | *In the salt is a niche the length of an arm, with cut strokes along its lip.* |
| `tz-w1-b` | 1 | after `b-1.C`, until `seal-2-1` | *On her cot lies a tin box with a row of cut strokes across its lid.* |
| `tz-w1-c` | 1 | after `pl-w1-below-the-lamp`, until `seal-1-3` | *Under the lamp's ledge is a small niche, and the stone round its mouth is darker.* |
| `b-w2.tz1` | 2 | before `b-2.B` | *On the shelf in her camp lies a rod of stone, with one edge finer than a knife's.* (ARR1) |
| `b-w2.tz2` | 2 | after `b-2.B` | *The rod is in your hand, and on the lintel is a blank the width of its edge.* (ARR1) |
| `tz-w2-a` | 2 | after `pl-w2-above-the-ring`, until `seal-2-3` | *Above the lone ring, something pale lies far back in a crack.* |
| `tz-w2-b` | 2 | after `pl-w2-box-by-the-cot`, until `seal-2-5` | *In her camp, a tin mug stands upside down on a box with a count.* |
| `tz-w2-c` | 2 | after `b-2.A`, until `seal-2-2` | *In the salt is a long, narrow niche with a count, the length of a stick.* |
| `b-w3.tz1` | 3 | before `b-3.A` | *The rod is in your hand, and on the lintel is a blank the width of its edge.* (ARR1) |
| `b-w3.tz2` | 3 | after `b-3.A` | *At the head of the stair is a lid with a doorway carved on it.* (ARR1) |
| `tz-w3-a` | 3 | after `b-3.C`, until `seal-4-1` | *At the stair's first turn there is a niche with a count beside the rail.* |
| `tz-w3-b` | 3 | after `pl-w3-far-end` | *At the far end stands the great door, and cold comes off its face.* |
| `tz-w3-c` | 3 | after `b-3.B`, until `seal-3-5` | *On a ledge in her camp is a box with a count, and on its side a label in her hand.* |
| `b-w4.tz1` | 4 | always | *Every record here was cut by the same hand, except two.* (ARR1) |
| `tz-w4-a` | 4 | after `pl-w4-hollow`, until `seal-4-5` | *Low in the salt is a hollow with four small flat marks in its floor.* |
| `tz-w4-b` | 4 | after `pl-w4-recess-above-the-cot`, until `seal-4-3` | *Above her cot is a recess with a count, and a drawing pin beside it.* |
| `tz-w4-c` | 4 | after `b-4.1`, until `seal-5-1` | *Under the second turn is a recess with a count of its own.* |
| `b-w5.tz1` | 5 | always | *One line here does not begin with the bar with a tick.* (ARR1) |
| `tz-w5-a` | 5 | after `pl-w5-ledge-lip`, until `seal-5-5` | *Under the lamp's ledge is a count, where no one standing would see it.* |
| `tz-w5-b` | 5 | after `b-5.B`, until `b-6.A` | *Through the gap you can see a record in the tally's hand, on square stone.* |
| `tz-w5-c` | 5 | after `b-5.0` | *On the second flight the little door's count is full, and it does not open.* |
| `b-w6.tz1` | 6 | before `b-6.A` | *Past the second landing is a low doorway, with square stone beyond it.* (ARR2) |
| `b-w6.tz2` | 6 | after `b-6.2` | *On the salt, a loaf is carved beside a mark.* (ARR2) |
| `tz-w6-a` | 6 | after `pl-w6-wall-shelf`, until `seal-6-3` | *On the square wall is a shelf with a count, and a level line is scratched along it.* |
| `tz-w6-b` | 6 | after `pl-w6-folder`, until `seal-6-5` | *Under her cot lies a folder with HILL on its spine.* |
| `tz-w6-c` | 6 | after `b-6.A`, until `b-6.B` | *On the square wall is a second record, longer than the first, with a niche under it.* |
| `b-w7.tz1` | 7 | before `b-7.3` | *At the first turn of the stair, the rail has the shape of a hand in it.* (ARR2) |
| `b-w7.tz2` | 7 | after `b-7.A` | *Beside the great door's blank are the two marks from the lintel on the stair.* (ARR2) |

---

## 12. The budget, met

| Content (`product/MVP.md`) | Budget | Here | Where |
|---|---|---|---|
| Named places, each a name and a line | 30–35 | **33** (15 story arrivals + 15 new places, weeks 1–6; 3 run-ahead) | §1–2 |
| Camps with a view, each with one thing to look at | 15 | **15** | §3 |
| Record fragments from two lives | 15 | **13** from the two lives inside the six weeks, plus S6 seen, V1–V2, K1–K2 and 11 chorus lines: **29** record items | §4 |
| Sealed things for Keys | 30 | **30** (5 a week; 5 new) + 5 run-ahead | §5 |
| Marks with 3–4 candidates | 8–12 | **14** guessed + 2 recognised; 3 run-ahead (the sealed order; see §6) | §6 |
| Words, with the cutting cinematic | 1–2 | **2** (one in week 2–3; the second in the run-ahead) | §7 |
| Finds | about 70 | **72**, 8 of them told lines in the Cut | §8 |
| Passage lines for the open route | about 120 | **160** (40 more for the main line's first weeks), plus computed script glimpses | §9 |
| Week close "learned" lines; the month's "so far" | 18; 2 | **18; 2** (10 lines, shown by beat) + 6 "where you were" questions | §10 |
| Teasers for "I can't start" | about 30 | **30** (18 new, 12 from ARR1/ARR2) | §11 |
| Painted scenes | 30–35 + camp and views | **33 places + 15 camp views = 48 briefs** | `PAINTING_BRIEFS.md` |

**The story clock holds:** everything above is ordered by story week; no mark, record or word appears before its week; places run at most one week ahead; the two partial signs are the only ones (weeks 1 and 3, High days); the first word lands in week 2–3.

---

## 13. Shaping it for the build (Phase 9)

**Type mapping** (`technical/DATA_MODEL.md` → "Authored content"):
| This file | DATA_MODEL type | Fields to fill |
|---|---|---|
| `b-` arrival, `pl-` | Place | name, line, painting id (`pt-…`), route position (`w`, `o`), thing to look at (§2 "In view after it") |
| `cv-` | Camp with a view | the view (name + line), the thing to look at (a find id or a re-surfaced line), painting id, stretch, `w` |
| `rec-`, `tl-` | Record fragment | life, sign string with each sign aligned to its English, the full rendering (the check), her-sheet gloss where there is one, first beat |
| `b-` step, camp, morning, week close glimpse | Copy (keyed by beat id) + the beat's trigger (job return / bedtime / morning / week close) | as ARR's Kind column says |
| `seal-` | Sealed thing | where, what it opens or gives (a mark tablet, a record stretch, a find, a place), its NICHES order, its line |
| `mk-` | Sign / mark | shape (SCRIPT §2 elements), candidates, the true meaning, the confirming beat, the rejection line |
| `wd-` | Word | marks, blank location, the four tap lines, the cinematic beats and painting states |
| `fd-` | Find | line, stretch, `w`/`req`, told line id if any, the truth clause (kept out of the app) |
| `ps-` | Passage line | stretch, condition, order |
| `tz-`, `b-…tz` | Teaser | condition (after / until), line |
| `wc-`, `sf-` | Week-close lines | the beat it needs (`wc-`), or the week it closes (`sf-`) |
| `pt-` | Painting | the brief (`PAINTING_BRIEFS.md`), states, live layers |

**Two small additions the build will want** (spoiler-free, for the data model when Phase 9 opens it): a **story beat** type for the ARR step / camp / morning rows (id, week, order, trigger, copy key, what it carries), and a **stretch** field on places, finds and passage lines (§0.3).

**What never ships:** every column in this file headed *Truth*, *Ties* or *Carries*, and every `STORY_JOB.md`, `WORLD_TRUTH.md` or ledger text (ARCHITECTURE → "Story and what Dan may see"). The app receives only lines, names, sign strings with their English, conditions and order.

**Tests this file implies** (`technical/TEST_STRATEGY.md`, story unlocks): no mark renders in English before its `mk-` week; no `b-`, `pl-` or `rec-` item is visible before its `w` (places: at most `w − 1` on a deep push, never a sign or record); every `req` chain resolves (no deadlock) for a Low, a Normal and a High week and after a two-week absence; every `(Key)` step reads correctly when its sealed thing was not seen first; passage lines never repeat within a stretch until the list is used; a teaser whose condition is false never shows.
