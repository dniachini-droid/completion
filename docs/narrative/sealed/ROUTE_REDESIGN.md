# The route redesign (D-153, D-154): audit and design — SPOILERS

> **Sealed (D-015). Dan must not read this.** Stage 1 of the route job: the audit of how the player moves through the Site in story weeks 1–14, the root cause, and the design of the fix. No content or code changes until Dan approves the spoiler-free proposal (`docs/reviews/route/PROPOSAL.md`). The fixed ending, the truth and the sign order are unchanged; the one geography change is a §55 retcon (§4.7).

_Written 2026-10-05; revised the same day after a fresh adversarial review (§11). Brief (Dan, through the orchestrating session): "There needs to be coherent movement throughout the game. Clear locations… It needs to be intentional. If it is not intentional, then we need to perform a broader fix." And: "I want it fixed. Properly." Not a mechanical one-area-at-a-time rule (that was D-153's first brief, now replaced: D-154); the journey as a whole, not week by week._

---

## 1. How the audit was done

- **The order as played**, not as listed. A simulated player (`tests/rules/sim.ts`, bedtime kept) lived 26 calendar weeks of Normal, of Low and of High days on the current `main` content; every `arrived` (place) fact was written down with its beat's `stretch`. All three lives play the 68 places in **the same order** (route order, with one swap in week 5: `b-5.B` before `b-5.A`, because `b-5.A` waits on the recess under the second turn).
- **Every move between areas** was read against the place's own line (`beats.ts`), the steps between, `SITE.md`'s map, `MVP_CONTENT.md` §0–§2, `ARRIVALS_REGION1/2/3.md` and `STORY_JOB.md` §4 and §8, and sorted into three kinds:
  - **clear**: the story gives a reason to go there then, and the line says where you are going (and, where it isn't obvious, why);
  - **never told**: there is a story reason (a sign just learned, a record now readable), but nothing on screen says Dan went back for it or how he got there;
  - **arbitrary**: no story reason to go there then; the place is there because the week needed a place (usually a niche in view).
- **The location model as Dan sees it**: a read-only audit of the app's screens (`app/src/ui`, `core/game.ts`, the copy, the Map, paintings), §3.
- **The fresh review** (§11) re-checked all 48 moves against `beats.ts`, applied the design's order and data changes to a scratch copy and ran the simulator for 26 weeks of each life (all 68 places in the table's order, story week 14 reached, no stall), and found the faults this revision fixes.

## 2. The audit

### 2.1 The numbers

| Measure (68 places, weeks 1–14) | Now |
|---|---|
| Area changes | **48** |
| … in the first 20 places | **15** |
| … worst run of 20 consecutive places | **16** |
| A→B→A bounces (out to an area and straight back) | **10** |
| Moves clear | **14** |
| Moves with a reason never told | **16** |
| Moves arbitrary | **18** |
| Moves with no reason on screen (never told + arbitrary) | **34** |
| Longest stay in one area | 4 places (week 6, the square gallery); weeks 1–5 never more than 3 in a row |

### 2.2 Every move, as played

| # | Wk | From → to | Place reached | Kind | Why |
|---|---|---|---|---|---|
| 1 | 1 | hall → salt | `pl-w1-pick-niche` | clear | `b-1.B` ends on the salt smell beyond the turn; the niche is "round the corner" |
| 2 | 1 | salt → camp | `b-1.C` | clear | "In the side wall of the Lamp Hall… you go through it" (how; the why is exploring) |
| 3 | 1 | camp → hall | `pl-w1-below-the-lamp` | arbitrary | A niche at the ledge, placed to put `seal-1-3` in view |
| 4 | 2 | hall → salt | `b-2.A` | never told | The row of strokes filled (`b-1.6`); nothing says he went back to read on |
| 5 | 2 | salt → camp | `b-2.B` | never told | The tin box opened (`b-2.1`); no link from the salt |
| 6 | 2 | camp → hall | `pl-w2-smooth-place` | arbitrary | A seen-only thing at the corner; nothing calls Dan there |
| 7 | 2 | hall → camp | `pl-w2-box-by-the-cot` | arbitrary | Filler for `seal-2-5` |
| 8 | 3 | camp → hall | `b-3.A` | clear | The rod's note: cut the two marks on the lintel |
| 9 | 3 | hall → stair | `b-3.B` | clear | Through the opening |
| 10 | 3 | stair → salt | `pl-w3-salt-lit` | clear | "You go round the corner… The glow of the lit hall comes with you" (the jump back from the new stair is still abrupt) |
| 11 | 3 | salt → stair | `b-3.C` | arbitrary | "You go to the edge of the landing": he is on the landing again without having gone back |
| 12 | 3 | stair → hall | `pl-w3-far-end` | arbitrary | Back up for the great door, unasked |
| 13 | 4 | hall → salt | `b-4.A` | never told | Her Day 9 sheet; `b-3.1` set it up, nothing says he went for it |
| 14 | 4 | salt → camp | `pl-w4-recess-above-the-cot` | arbitrary | Filler for `seal-4-3` |
| 15 | 4 | camp → hall | `b-4.C` | never told | The Lower Door, close: "today", for no stated reason |
| 16 | 5 | hall → stair | `pl-w5-worn-steps` | never told | The descent resumes after a week away from it |
| 17 | 5 | stair → flight2 | `b-5.B` | never told | Down again, unannounced |
| 18 | 5 | flight2 → salt | `b-5.A` | never told | ONCE etc. from the recess (`b-5.1`); the line starts "You go back along the Salt Gallery" with no climb |
| 19 | 5 | salt → flight2 | `pl-w5-second-landing` | arbitrary | "You go on down the second flight": he was in the salt |
| 20 | 6 | flight2 → square | `b-6.A` | clear | Through the low doorway into the gallery seen through the gap |
| 21 | 6 | square → camp | `pl-w6-folder` | arbitrary | From the square gallery to under her cot, for `seal-6-5` |
| 22 | 7 | camp → flight2 | `b-7.A` | never told | PATH and OPEN held; the word starts at the blank |
| 23 | 7 | flight2 → square | `b-7.B` | arbitrary | The way down just opened; "Back in the square gallery" says where, not why |
| 24 | 7 | square → hall | `b-7.C` | clear | "The same two symbols as beside the second lintel" (the climb is not told) |
| 25 | 8 | hall → water | `b-8.A` | clear | "You follow the Stair on down past the second lintel" |
| 26 | 8 | water → salt | `b-8.B` | clear | "Back up in the Salt Gallery… with the tablet's strokes and bars fresh in your mind" |
| 27 | 8 | salt → water | `pl-w8-steep-foot` | arbitrary | "You follow the shore round": he was in the salt |
| 28 | 8 | water → blast | `b-8.C` | clear | The narrower way down at the far shore |
| 29 | 9 | blast → reading | `b-9.A` | clear | The hall of benches across the Water (week 8's close) |
| 30 | 9 | reading → salt | `b-9.B` | never told | The cross; the line names it but never says Dan climbed back up |
| 31 | 9 | salt → reading | `b-9.C` | arbitrary | "In the Reading Room": no way back down |
| 32 | 9 | reading → blast | `pl-w9-approach` | clear | "From the Water's far shore you follow the narrow way down again" |
| 33 | 10 | blast → square | `pl-w10-deep-end` | never told | MOVE (`b-10.1`) and the slope of broken stone seen in week 6: a reason exists, the line gives none |
| 34 | 10 | square → blast | `b-10.A` | arbitrary | Straight back down |
| 35 | 10 | blast → square | `b-10.B` | never told | Up again for the standing stone (its blank needs MOVE); not said |
| 36 | 10 | square → blast | `b-10.C` | arbitrary | Down again |
| 37 | 11 | blast → reading | `b-11.B` | clear | "You go back round the Water… with the cupboard's tablet in mind" |
| 38 | 11 | reading → water | `pl-w11-far-end` | clear | "You walk to the far end of the Water… where something tall was standing" |
| 39 | 11 | water → blast | `b-11.C` | never told | Back to the torn wall |
| 40 | 12 | blast → salt | `b-12.B` | never told | TAKE, HAND, GOOD (`b-12.1`) make the tally's end readable; not said |
| 41 | 12 | salt → side | `pl-w12-square-way` | arbitrary | "At the side of the blast room": he was in the salt |
| 42 | 13 | side → square | `b-13.B` | never told | The shut door's record speaks of moving stone; not said |
| 43 | 13 | square → reading | `b-13.C` | never told | The bench apart (week 13's teaser `tz-w13-b` points at it); the line says nothing of going there |
| 44 | 13 | reading → square | `pl-w13-lower-gallery` | arbitrary | "You walk through where the fall stood": he was in the Reading Room |
| 45 | 14 | square → blast | `b-14.A` | never told | The same word on the other fall; but the lower gallery he was in already runs on to rounded stone (its own line; week 13's close) |
| 46 | 14 | blast → square | `pl-w14-mule-stone` | arbitrary | Back to the mule-shoe for `seal-14-4` |
| 47 | 14 | square → lower | `b-14.B` | arbitrary | "You go through the gap behind the rubble": the rubble is in the blast room |
| 48 | 14 | lower → salt | `pl-w14-deep-niche` | arbitrary | From the deepest place yet to the top, for `seal-14-5` |

The steps make it worse. Nearly every week has a step in her camp (her notebook, a page a week: `b-2.3`, `b-3.2`, `b-4.3`, `b-5.2`, `b-6.1`, `b-8.3`, `b-9.1`, `b-10.3`, `b-11.3`, `b-12.2`, `b-13.2`) and one in the salt (the tally: `b-3.1`, `b-4.4`, `b-5.3`, `b-6.2`, `b-7.2`, `b-9.3`, `b-14.4`), each starting "In the Survey Cut…" / "In the Salt Gallery…" between two jobs while the day's place is far below.

### 2.3 Is there a geography, and does the route respect it?

**There is a geography, and it is coherent.** `SITE.md` draws it: the shaft to the Lamp Hall; the Salt Gallery round the corner at the hall's far end and her camp through a doorway in its side wall; the lintel in the side wall to the head of the Stair; the Stair down two flights to the Water, with the square gallery off its second landing; the great door's steep stair to the Water's far shore; across the Water the Reading Room; at the far shore the narrow way below the Water to the blast room, the side gallery off it, and behind its fall the lower way. The lines almost always describe a real spot correctly.

**The route respects which rooms exist, not how you get between them.** No move crosses ground that isn't there, but many happen with no travel at all (the deepest point to the top in one arrival, `#48`; the salt to "the side of the blast room", `#41`; the Reading Room to "where the fall stood", `#44`). Week 14 contradicts the geography: the lower gallery already runs on to the lower way, yet the route sends Dan back round by the blast room and the square gallery (`#45`–`#47`).

**Does the player know where he is?** Rarely, beyond the room in front of him (§3).

### 2.4 Verdict

**The movement was not designed.** It is the by-product of a week-by-week schedule. Nobody ever decided how the player moves through the Site; each week was filled with what the story needed to show that week, wherever it happened to be, and the order of a week's places was the order of its visit table. The places are good and true to the map; the path between them was never a design object.

### 2.5 Root causes (with the evidence)

1. **The route was built week by week from the visit tables.** `STORY_JOB.md` §4, call 1: "A week is a *route* of five named places: the story arrivals already written, **pinned where they were**, and new places between them." The visit tables were written to the sign order (`SCRIPT.md` §6) and the lives' records, one stretch of each a week, before any route existed; §8.1 repeats it for weeks 8–14. No document ever defined an order of travel.
2. **The filler places followed the Key economy.** §4 call 1: each new place "ends on a sealed thing now in view"; call 2: a new place is a spot "usually where a NICHES item already sits". `NICHES.md` spreads each week's rows over every room, so the fillers followed the niches: 12 of the 18 arbitrary moves reach a `pl-` filler.
3. **Every place costs walking.** Minutes are distance (BALANCING §1; D-123): every place, filler or not, is 150 minutes of Dan's effort. So a week's five places had to be *somewhere* on foot, including places at the top long after the way down was open.
4. **Two lives' records are fixed to the top and read a little every week.** The tally is on the salt wall; her notebook is on her cot. So every week is tied to the top however deep the frontier: 7 of the 12 weeks after the Stair opens have a place in the salt, and 11 weeks have a notebook step in her camp.
5. **The camp rule was written and never shown.** Canon: Dan sleeps in the Lamp Hall by the lamp every night (`SITE.md` "Camp… is the Lamp Hall, by the lamp, for the whole year"; every camp line; `b-w8.camp` "you climb back to the Lamp Hall to sleep"). In the fiction every day starts at the top and every evening comes back: the natural reason to see the top again. No arrival and no screen uses it.
6. **The engine has no idea of travel.** "Where Dan is" is the last place's stretch (`storyState`). A place whose `req` is unmet is skipped for the next one in the list, whatever area it is in (`nextPlace`; `MVP_CONTENT` §0.2), and next week's `pl-` places may come "ahead" from any area: so week 5 bounces (`#18`, `#19`).
7. **No review ever looked at movement.** The outside review, both cold-reader rounds and the fact checks tested pacing, facts, fair play and voice. D-079 noted that "the route loops between areas" and fixed only its symptom. One cold reader noticed the camp contradiction ("You stop for the night at…" vs sleeping by the lamp); it was "left for Dan" (`STORY_JOB.md` §8.8).
8. **Not a cause:** saving paintings. Every place has its own painting (D-100); the returns to the square gallery in weeks 10–14 come from canon (the standing stone, the mule line).

## 3. The location model as Dan sees it (read-only audit of the app)

**Two levels exist in the data and are mixed on screen.** Every place, niche, camp view, find and passage knows its stretch; every place has its own painting. But:

1. **The same carved title means an area on one screen and a place on another.** Area: the Map's lights and walked-area boxes, the Stair screen (`ui/Stair.svelte`, in the place-heading style). Place: Today's title (`ui/Today.svelte` 251), the arrival screen (`ui/Arrival.svelte` 87), the delve screen (`ui/Delve.svelte` 192), Welcome back, the lock screen and Live Activity. Before the first place, Today's title shows the area instead.
2. **Eight places share their area's name**: `b-1.A`, `b-1.C`, `b-8.A`, `b-9.A`, `b-8.C`, `b-14.B`, `pl-w12-square-way`, nearly `pl-w6-square-gallery`; camp views `cv-19`, `cv-20` too.
3. **Nothing says which area a place is in, or that Dan has entered a new one** (except the Map box's "Here · {area}"). The only "new area" moment, the Stair screen, looks like a place.
4. **On the Map, the area Dan stands in hides its own places** (its box shows "Read it again" and its camp views); every other area lists them, below the niche rows, usually out of sight in a 180 px box.
5. **Links that do the same thing look different**: Today's title re-reads a place but looks like plain text; the Map's place names are inline links mixed with camp views; niches are separate rows ("Use a Key" / "Opened · Read again"); the Daybook's places can't be tapped, its niches can. Dan's "different looking links to get into each location".
6. **Niches look like places**: "The Salt Gallery, the pick niche" (a niche row) and `pl-w1-pick-niche` (a place) side by side.
7. **Area names drift in the free-text `where` fields**: "The Mouth" / "The Mouth and the pipe"; "The head of the Stair", "The Stair", "The Stair's first turn" for `st-stair`; "The blast room", "The Water's far shore" for `st-blast`.
8. **The job-return screen's back arrow names the next place** before it is reached (`ui/Step.svelte` 52); the Map marks the next place only in Dan's area or an unwalked one.
9. **Camp is invisible.** Dan sleeps by the lamp every night; a short day's end says "You make your camp at {view}", against the bedtime line.

D-092 (Dan's call) stands: **one map**, no closer view. The fix stays inside it.

---

## 4. The design

### 4.1 The shape of the whole journey

**A descent with one spine and a home at the top.**

- **Home** is the top: the Lamp Hall, with the lamp on its ledge where Dan sleeps every night; the Box Room (her camp, renamed, §6) through the doorway in its side wall; the Salt Gallery round the corner at its far end.
- **The spine** goes down, one way: the Lamp Hall → the lintel → **the Stair** (top flight, first turn, second flight, second landing, the second lintel at its foot) → **the Water** → the narrow way **below the Water** → the blast room → (week 14) **the lower way**, on into weeks 15–26.
- **Branches** open off the spine, each entered when first reached, walked, and left: the **square gallery** (off the second landing; behind its fall, the lower gallery runs on to the lower way); the **Reading Room** (across the Water); the **side gallery** (off the blast room). The great door's steep stair is a second way from home to the Water's far shore (week 7).
- **The two ways meet.** In week 14 Dan reaches the lower way the old surveyors' way, through the gallery behind the lifted fall; he walks up it to the back of the blast room's rubble, cuts the word there and steps through into the blast room: a short way home opened from the far side (§4.7). From then on the spine runs straight down.

The shape the player should feel: **weeks 1–3**, home explored (the hall, the salt, her room) until the first word opens the way down; **weeks 3–7**, the Stair a stage at a time, with the square gallery off its landing; **weeks 8–9**, the Water and what lies round it; **weeks 10–13**, below the Water, with turn-offs on the way home that the story asks for; **week 14**, the two ways meet and the descent goes on.

### 4.2 How the player moves (the movement principle)

In the fiction, every day Dan sets out from camp, goes down to where he got to, goes on, and comes back to the lamp at night. Every place is one of four kinds. The kind is **worked out when the place plays**, from where Dan has been (never stored, so old saves and long days can't make it wrong):

1. **On**: the next place along the way, in the area Dan is walking.
2. **A new area**: the first arrival in an area. Its own arrival face (§5.2), with the area's way-in line.
3. **An evening at home**: a place at the top (Lamp Hall, Box Room, Salt Gallery) **after the frontier has left home** (from `b-3.B` on). Before then home *is* the frontier, and its places are "on" or "new area".
4. **A turn-off**: a place in an area walked before that is neither home nor where the frontier is: a branch revisited on the way back up, only because something learned below asks for it.

**Evenings (the rules that make them work):**
- **Off the walking meter.** An evening costs no minutes. Only frontier places are spaced 150 minutes apart (53 of the 68 places).
- **One a night,** at goodnight; or, with no goodnight, at the first open of the next day ("Last night, at camp"). Two a night when the story week is otherwise done, so a week waits at most two nights on its evenings. Only after a day whose work is done (day complete): opening the app earns nothing (rule 10).
- **Home steps are evening scenes too.** Once the frontier has left home, a step whose area is home (her notebook; the tally) is not shown between two jobs; it is shown with that night's evening (all that are ready).
- **Reasons, never filler.** An evening is in the route only for a reason it states in its first sentence. Two kinds, both honest: a **reason evening** (a sign, record or page learned at the frontier makes something at home readable tonight; or the light just woken); a **camp-side find** (something at the lamp or in her room, found by lamplight, at most one a week, never in the salt). Each is listed in §4.4.
- **Bits stay at the frontier.** The story bits an evening waits for (e.g. `b-5.1` for `b-5.A`) play at the frontier during the day, as now; an evening plays only once they have. An evening's screen never shows a frontier opening.
- **A frontier place that needs an evening waits for that night** (the minutes are kept): `b-9.C` after `b-9.B`; `b-7.A` after `b-6.2`'s OPEN (a home step). Stage 2's rule test lists every such wait; none longer than a night.

**The road:**
- **No skipping across areas.** A place whose `req` is unmet no longer lets the route jump to a place in another area; the bits it waits for play on the way (D-129's `wayTo`).
- **"Ahead" only along the way.** Next week's `pl-` places may come early only if they are the next place in the same area as the frontier (so `pl-w14-meeting`, `pl-w14-deep-niche`, `pl-w9-approach` and `pl-w4-hollow` can no longer arrive early from elsewhere).
- **A day that ends short of a place** ends where Dan turned back: the camp view becomes "where you turned back today"; the bedtime line by the lamp follows. (Settles `STORY_JOB.md` §8.8's open contradiction.)
- **"Where you are"** is the last place walked to: on, new area or turn-off. Evenings never change it.
- **Lines never assume the place before.** How Dan got there is told by the area's way-in line (data, one per area, shown when the last place shown was in another area) and, for evenings and turn-offs, by the reason sentence, which is true whenever it plays because it points at what Dan has learned (its `req`).
- **The week** (`weekDone`) counts the frontier places, steps and road rows, and the evenings (which play one or two a night, above). The niches wait for Keys as now (D-129).

### 4.3 The areas, how they connect, and their places

Stretch ids stay (content keys on them; facts store place ids only). Two display changes: the two Stair stretches show as **one area, the Stair**; the Box Room shows as a room off the Lamp Hall. Each area has a chosen **establishing picture** (data, not "the first place's").

| Area (as shown) | Ids | Joins | Places, in walk order (E evening, T turn-off) | Picture |
|---|---|---|---|---|
| The Mouth | `st-mouth` | the shaft; its pipe opens into the Lamp Hall's near end | (steps only) | `pt-b-w1.morning` |
| The Lamp Hall | `st-hall` | the Mouth; the Box Room (side wall); the Salt Gallery (far corner); the Stair (the lintel); the steep stair (the great door) | `b-1.A`, `pl-w1-below-the-lamp`, `b-1.B`, `pl-w2-smooth-place`, `b-3.A`; E `pl-w3-far-end`, `b-4.C`, `pl-w5-ledge-lip`, `b-7.C` | `pt-b-1.A` |
| The Box Room | `st-camp` | the Lamp Hall | `b-1.C`, `pl-w2-box-by-the-cot`, `b-2.B`; E `pl-w4-recess-above-the-cot`, `pl-w6-folder` | `pt-b-1.C` |
| The Salt Gallery | `st-salt` | the Lamp Hall's far corner | `pl-w1-pick-niche`, `b-2.A`, `pl-w2-above-the-ring`; E `pl-w3-salt-lit`, `b-4.A`, `pl-w4-hollow`, `b-4.B`, `b-5.A`, `b-8.B`, `b-9.B`, `b-12.B`, `pl-w14-deep-niche` | `pt-pl-w1-pick-niche` |
| The Stair | `st-stair`, `st-flight2` | the lintel; the square gallery (second landing); the Water (foot) | `b-3.B`, `b-3.C`, `pl-w5-worn-steps`, `pl-w5-second-landing`, `b-5.B`, `b-7.A` | `pt-b-3.B` |
| The square gallery | `st-square` | the second landing; behind its fall, the lower gallery to the lower way | `b-6.A`, `pl-w6-square-gallery`, `b-6.B`, `pl-w6-wall-shelf`, `b-7.B`; T `pl-w10-deep-end`, `b-10.B`, `b-13.B`; `pl-w13-lower-gallery`, `pl-w14-mule-stone` | `pt-b-6.A` |
| The Water | `st-water` | the Stair's foot; the steep stair (far shore); the Reading Room (across); below the Water (far shore) | `b-8.A`, `pl-w8-channel`, `pl-w8-steep-foot`; T `pl-w11-far-end` | `pt-b-8.A` |
| The Reading Room | `st-reading` | across the Water | `b-9.A`, `pl-w9-benches`, `b-9.C`; T `b-11.B`, then `b-13.C` (on) | `pt-b-9.A` |
| Below the Water | `st-blast` | the far shore; the side gallery; the lower way (once the rubble is cleared) | `b-8.C`, `pl-w9-approach`, `b-10.A`, `pl-w10-blast-floor`, `b-10.C`, `pl-w11-cupboard`, `b-11.A`, `b-11.C`, `b-12.A`, `pl-w12-shelf` | `pt-pl-w10-blast-floor` |
| The side gallery | `st-side` | the blast room | `pl-w12-square-way`, `b-12.C`, `pl-w13-side-gallery`, `b-13.A` | `pt-pl-w12-square-way` |
| The lower way | `st-lower` | the lower gallery (partway down); the back of the rubble (its head) | `pl-w14-meeting`, `b-14.A` (stretch changed from `st-blast`), `b-14.B` | `pt-b-14.B` |

### 4.4 The new route, place by place

Kinds as derived for a fresh save: **N** new area, **·** on, **E** evening (r = reason evening, c = camp-side find), **T** turn-off. "Line" = what Stage 2 does to the place's line: **—** nothing; **R** a reason sentence first; **S** make it stand alone (drop an assumption about the place before); **W** rewritten (§4.7); **n** a place-name change only (§5.1). Week moves are marked ←.

| Wk | # | Place | Area | Kind | Reason the player is given | Line |
|---|---|---|---|---|---|---|
| 1 | 1 | `b-1.A` | Lamp Hall | N | the pipe opens into the hall | n |
| 1 | 2 | `pl-w1-below-the-lamp` | Lamp Hall | · | at the ledge, under the lamp | — |
| 1 | 3 | `b-1.B` | Lamp Hall | · | the length of the hall, to the corner | — |
| 1 | 4 | `pl-w2-smooth-place` ← w2 | Lamp Hall | · | at the corner, the polish high above | S |
| 1 | 5 | `pl-w1-pick-niche` | Salt Gallery | N | the salt smell beyond the turn (`b-1.B`; `b-1.5` folds into the way-in) | — |
| 1 | 6 | `b-1.C` | Box Room | N | on the way back to the lamp, the doorway in the side wall | S, n |
| 2 | 7 | `b-2.A` | Salt Gallery | · | the strokes in the tally filled; the tally goes on | S |
| 2 | 8 | `pl-w2-above-the-ring` | Salt Gallery | · | below the lone ring | S |
| 2 | 9 | `pl-w2-box-by-the-cot` | Box Room | · | her room: the box by the cot | — |
| 2 | 10 | `b-2.B` | Box Room | · | the tin box opened; the rod on the shelf → the lintel | — |
| 3 | 11 | `b-3.A` | Lamp Hall | · | the rod's note: cut the lintel | — |
| 3 | 12 | `b-3.B` | Stair | N | through the opening | — |
| 3 | 13 | `b-3.C` | Stair | · | the landing's edge, the top flight | — |
| 3 | 14 | `pl-w5-worn-steps` ← w5 | Stair | · | halfway down the top flight (before `b-4.1` reaches the turn) | — |
| 3 | 15 | `pl-w3-salt-lit` | Salt Gallery | E r | the first night the hall is lit: the glow round the corner | R |
| 3 | 16 | `pl-w3-far-end` | Lamp Hall | E r | by the new light, the great door seen whole | R |
| 3 | 17 | `b-4.C` ← w4 | Lamp Hall | E r | by the new light, close to the great door: what is cut on it | R ("today" goes) |
| 4 | 18 | `pl-w5-second-landing` ← w5 | Stair | · | on down the second flight to where it turns (req `b-4.1`) | — |
| 4 | 19 | `b-4.A` | Salt Gallery | E r | her notebook's Day 9 (`b-4.3`, the rule) → her sheet dated Day 9, against the salt | R |
| 4 | 20 | `pl-w4-hollow` | Salt Gallery | E r | walking the stretch her Day 9 sheet covers, further in | R |
| 4 | 21 | `b-4.B` | Salt Gallery | E r | past the split, the niche's count lit, seen from her sheet's stretch | R |
| 4 | 22 | `pl-w4-recess-above-the-cot` | Box Room | E c | reading her notebook in her room by lamplight, the recess above the cot | R |
| 5 | 23 | `b-5.B` | Stair | · | a few steps back up from the landing, the gap at shoulder height | S |
| 5 | 24 | `b-5.A` | Salt Gallery | E r | the recess tablet's signs (`b-5.1`): the tally's head, read tonight | R |
| 5 | 25 | `pl-w5-ledge-lip` | Lamp Hall | E c | at camp, on your knees by the ledge | R |
| 6 | 26 | `b-6.A` | square gallery | N | through the low doorway, the gallery seen through the gap | — |
| 6 | 27 | `pl-w6-square-gallery` | square gallery | · | on in | S, n |
| 6 | 28 | `b-6.B` | square gallery | · | the crew's wall | — |
| 6 | 29 | `pl-w6-wall-shelf` | square gallery | · | the shelf | — |
| 6 | 30 | `pl-w6-folder` | Box Room | E c | at camp, under her cot | R |
| 7 | 31 | `b-7.B` | square gallery | · | the crew's wall, its second niche lit | S |
| 7 | 32 | `b-7.A` | Stair | · | out to the second landing and down to the lintel at the foot: PATH and OPEN held (a preface, `b-7.A` has taps only) | S |
| 7 | 33 | `b-7.C` | Lamp Hall | E r | the great door bears the same two symbols: cut it tonight | R |
| 8 | 34 | `b-8.A` | Water | N | the Stair on down past the second lintel | — |
| 8 | 35 | `pl-w8-channel` | Water | · | along the edge to the channel | — |
| 8 | 36 | `pl-w8-steep-foot` | Water | · | round to the far shore | — |
| 8 | 37 | `b-8.C` | Below the Water | N | the narrower way down at the far shore | — |
| 8 | 38 | `b-8.B` | Salt Gallery | E r | the tablet's strokes and bars: the tally's first line, tonight | R (exists) |
| 9 | 39 | `b-9.A` | Reading Room | N | across the Water, the hall of benches | n |
| 9 | 40 | `pl-w9-benches` | Reading Room | · | between the benches; **one stands apart** (sets up `b-13.C`) | add |
| 9 | 41 | `b-9.B` | Salt Gallery | E r | the cross (`b-9.2`): her sheet against the salt tonight | R |
| 9 | 42 | `b-9.C` | Reading Room | · | the low bench, its count lit (waits for the night of 41) | S |
| 9 | 43 | `pl-w9-approach` | Below the Water | · | the narrow way down again | — |
| 10 | 44 | `b-10.A` | Below the Water | · | the lintel at the way's foot | — |
| 10 | 45 | `pl-w10-blast-floor` | Below the Water | · | through into the room beyond | — |
| 10 | 46 | `b-10.C` | Below the Water | · | the torn wall | — |
| 10 | 47 | `pl-w10-deep-end` | square gallery | T | the tablet's lifted block (MOVE, `b-10.1`) and the slope of broken stone seen in week 6: on the way up, turn off at the second landing | R |
| 10 | 48 | `b-10.B` | square gallery | T | the standing stone's count, lit | S |
| 11 | 49 | `pl-w11-cupboard` | Below the Water | · | (way-in) the blast room again | S |
| 11 | 50 | `b-11.A` | Below the Water | · | the ledge's row lit | — |
| 11 | 51 | `b-11.C` | Below the Water | · | the crack by the torn wall | — |
| 11 | 52 | `pl-w11-far-end` | Water | T | the log's "tall man with a lamp" (`b-10.2`; req added) and what stood at the far end in week 8: on the way up, go round to look | R |
| 11 | 53 | `b-11.B` | Reading Room | T | the cupboard's tablet (VOICE): the inner door's lintel | — (exists) |
| 11 | 54 | `b-13.C` ← w13 | Reading Room | · | still in the Reading Room: the bench that stands apart, its count lit | S |
| 12 | 55 | `b-12.A` | Below the Water | · | (way-in) the log's next page | S |
| 12 | 56 | `pl-w12-shelf` | Below the Water | · | the long shelf | — |
| 12 | 57 | `b-12.B` | Salt Gallery | E r | the far end's tablet (TAKE, HAND, GOOD, `b-12.1`): the tally's last stretch, tonight | R |
| 12 | 58 | `pl-w12-square-way` | side gallery | N | past the end of the rails, the low doorway | S, n |
| 12 | 59 | `b-12.C` | side gallery | · | the sill | — |
| 13 | 60 | `pl-w13-side-gallery` | side gallery | · | to its end | — |
| 13 | 61 | `b-13.A` | side gallery | · | the shut door | — |
| 13 | 62 | `b-13.B` | square gallery | T | the shut door's record speaks of moving stone: on the way up, the standing stone's blank | R |
| 13 | 63 | `pl-w13-lower-gallery` | square gallery | · | through where the fall stood, thirty paces | — |
| 14 | 64 | `pl-w14-mule-stone` | square gallery | · | on the way down through the square gallery to the lower gallery, the mule-shoe's stone | S |
| 14 | 65 | `pl-w14-meeting` | lower way | N | the lower gallery comes out onto a wider way of lit cups and cold air, going down | W |
| 14 | 66 | `b-14.A` | lower way | · | up the lower way to its head: the back of the blast room's rubble; the word; through | W |
| 14 | 67 | `b-14.B` | lower way | · | from its head, the lit way going down: the way on | W |
| 14 | 68 | `pl-w14-deep-niche` | Salt Gallery | E r | the morning's thought of her Day 9 sheet (`b-w14.morning`; req added): tonight, past the lone ring, the deep niche | R |

Weeks: 6, 4, 7, 5, 3, 5, 3, 5, 5, 5, 6, 5, 4, 5 places (68); on foot 53, evenings 15.

### 4.5 The numbers, before → after

"Where you are" counts the places walked to (evenings don't move it), with the Stair shown as one area as it will be; with its two stretches counted apart, add one.

| Measure | Before | After |
|---|---|---|
| "Where you are" changes | 48 | **20** |
| Changes among places 1–20 (like for like: every change) | 15 | **10** (of which **6** move where you are) |
| Worst run of 20 places walked to | 16 | **9** (weeks 9–13: the Water's four neighbours; every move told) |
| A→B→A bounces with no reason | 10 | **0** (one A→B→A remains, weeks 1–2 at home: the salt, her room, the salt, each a day from camp, each told) |
| Every change, evenings included | 48 | 36 |
| Evenings at home | — | 15 (11 with a story reason, 4 camp-side finds, one a week at most) |
| Moves with no reason on screen | 34 | **0** by design; Stage 2's acceptance walk is the proof |
| Places on the walking meter | 68 | 53 |

### 4.6 Data changes

**Moved between weeks:** `pl-w2-smooth-place` w2→w1; `pl-w5-worn-steps` w5→w3; `pl-w5-second-landing` w5→w4; `b-4.C` w4→w3 (as built it stays in w4, §12; its `seal-4-4` is seen-only: nothing to open; `sf-m2-5` keys on it and still shows at month 2); `b-13.C` w13→w11 with `seal-13-5` (w13→w11, `o` after `seal-11-4`), its teaser `tz-w13-b` (→ w11) and its learned line `wc-w13-3` (→ w11; week 11 then has four: Stage 2 trims to three). Nothing moves later. `pl-w4-recess-above-the-cot` and `pl-w14-mule-stone` stay in their weeks (so no niche is in view as "needs a Key" before its week, D-142).

**Re-ordered inside a week:** weeks 1–14 as the table.

**Changed fields:** road row order `seal-10-4` o3, `seal-10-5` o4, `seal-10-3` o5 (the scar, then the shelf's line, then the standing stone after the turn-off; no sign or record depends on the order); `b-14.1` `req` + `b-14.A` (its tablet is in the blast room's cupboard, reached in week 14 only through the rubble; WORLD and HEAR settle in week 15 or later either way); `pl-w11-far-end` `req` + `b-10.2`; `pl-w14-deep-niche` `req` + `b-w14.morning`; `b-14.A` stretch `st-blast` → `st-lower`; `st-lower` req `b-14.A` → `b-13.B`; `pl-w14-meeting` req → `pl-w13-lower-gallery`; `b-14.A` req → `pl-w14-meeting`; `b-14.B` req → `b-14.A`. New data: each area's display name, parent, way-in line and picture; each evening's and turn-off's reason sentence is part of its line (no stored kind).

### 4.7 The one retcon (MASTER_BRIEF §55): how the lower way is first reached

- **Conflict.** Canon (ARR3 14.A, 14.B; `STORY_JOB.md` §8.3 week 14) has Dan clear the blast room's far fall with STONE-MOVE and go through to the lower way, the lower gallery joining it later. But week 13 lifts the square gallery's fall, and the lower gallery runs on to rounded stone (its line; week 13's close says it runs towards the blast room's far side). Sending Dan back round by the blast room is the incoherent `#45`–`#47`.
- **Why it matters.** It is the clearest single case of the route ignoring the map; under the new principle it would be a move with no honest reason.
- **Options.** (a) Keep the order and invent an obstacle at the lower gallery's end (a new fact made only to force a detour: rejected, it is exactly "forcing"). (b) Keep it and say nothing (the audit's finding). (c) **Reverse the approach**: the lower gallery comes out partway down the lower way (`pl-w14-meeting`, now the lower way's first sight: the lit cups no one lit, the cold air); Dan walks up to its head, which is the far face of the blast room's rubble, cuts the same word there (`b-14.A`), the rubble settles aside, and he steps through into the blast room and looks back; `b-14.B` is then the lit way going down, seen from its head: the way on. **Chosen: (c).**
- **What it adds, said plainly.** One physical fact: the rubble's blank for STONE-MOVE, with its two signs, is on its **far** (lower-way) face. And one order: ECHO's blank, low on the scar's rounded stone (`seal-14-3`, seen), is seen as Dan walks up to the rubble, before the cut, not revealed by it. It is still only seen; no word is cut there before week 17.
- **What stays.** The word, the fall, ECHO's blank and where it is, the lit cups, the cold air, the meeting of the two ways, the tall door at the lower way's end (`b-w14.close`), and weeks 15–26: nothing in ARR3 15–26 needs a first approach from the blast room (15.B "at the lower way's end"; 17.A's blast wall), and the blast room becomes the short way home from week 15. The truth, the ending and the sign order are untouched.
- **Paintings.** None redrawn: `pt-b-14.A` is drawn from the blast room's side (the parted fall, the scar going on into rounded stone, the low blank): the look back as Dan steps through. `pt-b-14.B` is drawn from the top looking down: the way on. `pt-pl-w14-meeting` looks from the lower way into the gallery: the look back as Dan steps out. The lower way's establishing picture is `pt-b-14.B`.
- **Files (Stage 2).** `ARRIVALS_REGION3.md` 14.A, 14.B and the week's notes; `STORY_JOB.md` §8.3 week 14; `REVELATION_MAP.md` row 14; `SITE.md` (the Loud Room's row); `MVP_CONTENT.md` route; `beats.ts` (`b-14.A`, `b-14.B`, `pl-w14-meeting`; taps); teasers `b-w14.tz0`, `b-w14.tz1`; `weekclose.ts` `wc-w14-1`, `wc-w14-2`; `PAINTING_BRIEFS.md` (camera notes); `DECISIONS.md` (spoiler-free).

**Set up, not added:** the bench apart (`b-13.C`) is mentioned at `pl-w9-benches` (one stands apart from the rest), so it points back to something seen; it is already canon (ARR2 13.C). Moving it to week 11 plants its told line (`tl-one-stroke`, "the one stroke", AGAIN week 20) two weeks sooner: earlier, never after its truth (rule 6); `REVELATION_MAP.md` and `CLUE_LEDGER.md` rows updated in Stage 2.

**Rule checks:** nothing moves later than its payoff; no clue row names a moved place's week except C-68 (`pl-w11-far-end`, same week) and the bench apart (earlier); nothing plays in an area Dan hasn't been (evenings are home, visited from week 1; turn-offs are to areas walked before; D-079); road rows and Key niches as before, with the one renumbering (D-129, D-142); no sealed thing opens before its week, and none is in view as "needs a Key" before its week because of a move.

### 4.8 Pace

53 places on foot instead of 68: the same effort reaches the story's places about a fifth sooner. Two ways: (a) keep 150 minutes between places on foot (a Normal day still reaches a place, D-064; the story never waits, D-123; it just runs a little faster), or (b) lengthen the gap to about 190 minutes so the old effort-to-story ratio holds. **Recommended: (a)**; it keeps the felt rhythm, and slow weeks never stall. It is Dan's call (a priority, not a technical matter); the proposal asks it. Stage 2 re-runs the pace probe either way.

## 5. How the app shows location

### 5.1 One naming rule

- **Area · place**, wherever both are named: "The Salt Gallery · the pick niche". The area name is one form only; the `where` prefixes are derived from it.
- **No place shares its area's name.** `b-1.A` "the near end"; `b-1.C` "her cot"; `b-8.A` "the last step"; `b-9.A` "the first tablet"; `b-8.C` "the niche with no back"; `b-14.B` "the lit way down"; `pl-w12-square-way` "the low doorway"; `pl-w6-square-gallery` "the long straight"; camp views `cv-19`, `cv-20` likewise. Final wording in Stage 2's language pass.
- **"Her camp" becomes "her room"** in every line (`b-2.1`, `b-5.2`, `b-6.1`, `b-9.1`, …), so "camp" is only Dan's (the lamp).
- **Niches are things, not places**: shown in their own list, never among the places.

### 5.2 Screens

- **Today's title** is the **area** (big carved title; changes only when Dan moves area), with the **place** under it ("at the pick niche"). It shows where Dan is (never an evening). Tapping it re-reads that place; it looks tappable, like every "read again".
- **Arrivals have four faces**, from the kind:
  1. **A new area**: label "A new area", the area's name as the title, its way-in line and establishing picture, then the place's name and scene.
  2. **On**: label "Arrived", the area small above, the place as the title.
  3. **A turn-off**: label "On the way back", the area small above ("The square gallery"), the place as the title.
  4. **An evening**: label "Tonight, at camp" (or "Last night, at camp" at the next open), "The Salt Gallery · the tally's head", lamp-lit, the held home steps after it, then the camp line. A Key may be used here on that evening's niche ("Use one here" means the evening's place while its screen is open).
- **The Map** (one map, D-092): the areas drawn as the descent: home at the top with the Box Room and the Salt Gallery attached to the Lamp Hall, the Stair as one line down, the branches off it. **Camp** is marked by the lamp at the Lamp Hall's ledge; **where you are** separately. Tap an area: its name; **every place in walk order, the current one included and marked**, then its niches in their own list. One row style for all: name and state ("here", "read again", "needs a Key", "use a Key"). Places first, so always in view. The next place is marked on its area, walked or not.
- **The road line and the delve**: "Further into the Salt Gallery" when the next place is in Dan's area, "On down" when it is in a new one; never the next place's name before it is reached. Evenings are off the road, so it always points at the next place on foot. The job-return screen's back arrow says "Arrive".
- **Welcome back, the lock screen, the Live Activity, the Daybook, records**: "Area · place" (records: "Area, thing"). The Daybook's places are tappable like everywhere else; its day lists that night's evening under "At camp".
- **A day that ends short of a place**: "Where you turned back today: …" (the camp view), then the bedtime line.
- **The Stair screen** (after the first word) becomes face 1, "A new area: the Stair".

## 6. "The Survey Cut", renamed

**Chosen: the Box Room.** Her room's own first line already calls it "a small side chamber, like a box room" (that sentence goes, so it isn't said twice). It says plainly what it is to a UK reader: a small spare room off the hall, full of someone's things. It is drawable, it gives nothing away, and it never collides with Dan's own camp by the lamp ("her camp" would). The things in it are renamed where they would collide: "the box by the cot" → "the shoebox by the bed" (`pl-w2-box-by-the-cot`, `seal-2-5`), the tin box stays "the tin box".
**Runner-ups:** *Her Room* (warm and true, but a place name that leans on a person before week 1 has shown one); *The Den* (plain and homely, but lighter in tone than the world's voice). Considered and dropped: *the Cot Room* (to a UK reader a cot is a baby's bed), *the Side Room* (too close to "the side gallery").

## 7. Dan's save

- Facts store place ids; no id changes. Places played stay played; the new order applies only to what is not yet played. Nothing replays.
- "Where you are" is worked out from the places walked to, so an old save whose last place is now an evening (e.g. in the salt) shows where Dan really was, never a teleport.
- Kinds are derived when a place plays, from where Dan has been, so an old save never meets a wrong face (e.g. a week-7 save that played `b-7.A` but not `b-7.B` gets `b-7.B` as a turn-off, not "on").
- Places moved earlier that an old save has not reached come next, with lines that stand alone. Week moves were all earlier in the design; the build moved three home places later (§12: `pl-w4-hollow` w10, `pl-w4-recess-above-the-cot` w12, `pl-w5-ledge-lip` w13). An old save that already saw one keeps it; one that didn't meets it as an evening in its new week. No old save waits on them: an evening never holds the week or the way down.
- The no-skip rule: an old save holding a skipped place (e.g. week 5's `b-5.A`) plays it when its bits have played.
- **Proven in Stage 2** on every sample save (`app/tests/saves`, `app/tests/flows/saves`) and on old-route saves stopped at every place in weeks 1–6, mid-week 7, 13 and 14 (including `b-14.A` already played under its old text: its later lines must still read true), each walked on to week 14, with and without goodnight, and with High days that reach an evening and the next place together (rows 41→42; `b-6.2`→`b-7.A`): no stall, no replay, no move without its reason, "where you are" never jumps back without a turn-off.

## 8. Stage 2: the acceptance test

1. **Rule tests:** every route `req` met by an earlier place or an on-the-way bit, and every wait on an evening listed and at most a night; the properties themselves (where you are moves only by on, new-area or turn-off places; every evening and turn-off states its reason first; no A→B→A without a turn-off; "ahead" only in the same area); the old-route saves above; evenings off the meter and one a night (two when the week is done); the existing continuity, road, pace and week tests stay green, any changed expected number named.
2. **The real playthrough:** a fresh save walked through all 14 story weeks in the built app (Playwright, 390 × 844), capturing at every arrival and every evening the arrival screen, Today's title and the Map; then the same from saves at Dan's possible points under the old route (every week end, weeks 1–6, mid-week in weeks 2–4).
3. **The judge:** a fresh reviewer with no part in this design reads the whole captured journey as a player and judges every move: *do I know where I am; do I know why I moved; does each area read as a place with places inside it?* Any move that fails is fixed and the walk runs again, until every move passes. The verdicts are kept (sealed where they quote story).

## 9. Stage 2: the work, in order

1. **Sealed docs first:** `MVP_CONTENT.md` §0.2 (the rules), §0.3 (areas, joins), §1 (the route), §2 (names); `STORY_JOB.md` (§9: this job); `ARRIVALS_REGION1/2/3.md`; `NICHES.md` (the renumbering, `seal-13-5`'s week); `PAINTING_BRIEFS.md`; `SITE.md`, `LOCATIONS.md`; `CLUE_LEDGER.md`, `REVELATION_MAP.md`.
2. **Lines** (to `WRITING_PROCESS.md`, two cold-reader rounds): about 20 reason sentences, about 14 lines made to stand alone, the three week-14 rewrites and their teasers and learned lines, the bench apart's set-up, 11 way-in lines, about 10 place names, every "Survey Cut" and "her camp".
3. **Content data:** `route.ts`, `beats.ts`, `seals.ts`, `teasers.ts`, `weekclose.ts`, area data.
4. **Engine:** kinds derived at play; where-you-are; evenings off the meter, one a night, at goodnight or the next open, after a done day; home steps held for the evening; no skip across areas; "ahead" only along the way; week close as §4.2.
5. **UI:** §5.
6. **Tests and the acceptance walk** (§8), then a fresh adversarial review, then Dan.

**Size:** the largest change since weeks 8–14: a few days of focused build and test work, plus the writing rounds and the judge's loop. One branch, one PR, Dan's OK before merge.

## 10. Risks and open points

- **Week 3 is evening-heavy** (three evenings of the hall's first light) and **week 4 has four evenings** (her Day 9 sheet and her room), with one place on foot each week further down the Stair. The frontier never waits on them (they are off the meter), and week 4 waits at most two nights on them. The judge will say if it reads as being kept at the top.
- **The Water's four neighbours** give the worst run (9 in 20, weeks 9–13), each move told.
- **Week 11 has six places, week 2 four**: within the pace tests' range; re-run.
- **Pace** (§4.8): Dan's call.

## 11. The fresh review, and what changed

A fresh adversarial reviewer (no part in the design) checked the first draft against the sealed docs and the engine, and simulated its order. Its verdict: the spine-and-branches shape and the week-14 reversal are real design, grounded in `SITE.md` and the camp canon, not a relabelling; but as first specified the evenings were walked to with full effort (so weeks 3–5 risked reading as "kept at the top"), and about half were fillers relabelled. Fixed in this revision:
- **Evenings off the walking meter**, one a night at goodnight or the next open, after a done day, bits kept at the frontier, frontier waits on an evening listed (§4.2). *(blocker)*
- **Home is the frontier until `b-3.B`**: weeks 1–2's home places are "on"/"new area", not evenings; the numbers recomputed and compared like for like (§4.5).
- **Every evening has its reason or is an honest camp-side find** (one a week at most); weak ones re-placed: `b-4.C` into week 3's first light; `pl-w11-far-end` tied to the log's tall man; `pl-w14-deep-niche` to the week-14 morning; `b-13.C` moved to week 11 beside `b-11.B`; the mule stone kept in week 14, on the way down.
- **No niche in view before its week** because of a move (the recess and the mule stone stay; D-142).
- **Road row order** `seal-10-4`, `-10-5`, `-10-3`, so the shelf's line opens in the blast room.
- **"Ahead" only along the way.**
- **The retcon's file list completed** and the added fact stated (§4.7); the lower way's picture is `pt-b-14.B`; the meeting carries its first sight.
- **A new decision entry** (D-154) records that this replaces D-153's chapter brief (rule 18).
- **Kinds derived at play, not stored**; lines that assumed the place before made to stand alone.
- **Screens:** the road ignores evenings; Today's title re-reads where Dan is; the evening face holds the night's home steps; a Key at an evening; "her camp" swept.
- **Saves and acceptance** widened (weeks 7, 13, 14; no goodnight; High days across an evening).
- **The audit made fairer:** moves 2, 10, 24, 32 are clear (their lines say how); 33, 35, 40, 43 have a reason, never told: 14 clear, 16 never told, 18 arbitrary. Two causes added: minutes are distance, and the "ahead" rule. Worn steps moved before the first turn's step. `b-1.5` folds into the salt's way-in. The name reconsidered against its collisions (§6).

---

## 12. As built (Stage 2), and the calls made on the way

Dan approved Stage 1 ("Go", pace (a): the walk between places as it is). What the build changed from §4–§5, each a routine call recorded here:

- **Evenings trail; they never hold the week or the road** (§4.2 said a week waits up to two nights on them). D-129 (long days never hold a place back) wins: a story week ends on its frontier; its evenings play one a night after, two when one is waiting from a week behind. An evening needs only a day with real work in it (five minutes or more walked), not a completed day (a day of one long delve never said done still has its evening).
- **A moment at home the way down needs is never held:** it plays on a job's return as before (e.g. `b-5.3`, `b-6.2`: OPEN for `b-7.A`). On a very long day, if the way down waits on an evening's place (a sign it brings into view), that evening plays at once, as that night's ("Dan goes up to camp for it"). Computed from the content (`frontierNeeds` in `core/story.ts`), not listed by hand.
- **`b-9.C` no longer waits on `b-9.B`** (its `req` is the NOT tablet, `b-9.2`): an evening never holds a frontier place. NOT reads as Dan's guess on the child's tablet until the turn confirms it at `b-9.B`; the turn is still the first record NOT turns.
- **The road's own row order ignores rows at home once the way down is open** (they come with the evenings, in their own order).
- **Faces:** four on screen, derived when a place plays: "A new area", "Arrived", "Back again" (a return, with the area's way-in line; a designed turn-off is a "Back again" whose own first sentences say why, on the way up), "Tonight, at camp" / "Last night, at camp". An evening with no place ("By the lamp") holds only the night's moments at home. The word-cutting screen says the area, and for a return or an evening its reason before the first tap.
- **The Stair screen** (after the first word) keeps "Beyond the lintel": the Stair's first place is the new area's arrival, and one "A new area" for it is enough.
- **Where Dan turned back** is always in the area he is walking; one elsewhere only when his has none (then the deepest walked, never home once the way down is open). Two views with an end can now pass unseen (`cv-03`, `cv-21`); the deep review's S#12 test now checks the rule in the area.
- **The week close** may show up to a week's worth of lines left behind as well as the week's (evenings can trail their week).
- **Copy:** "Today brought you to {area}, {place}."; Today's title is the area, the place under it; the delve says the area, the place under it; the set-up says "Further into {area}" or "On down"; the lock screen says "Area · place".
- **Tests changed where the order legitimately changed** (each in its own comment): heart (the second place is below the lamp), road (home places come as evenings; the home rows' order is their own; a bit at home shows on its evening), weeks 8–14 (four to six places a week), deep review (the reserved word fixed; one more glimpse passed at the faster pace; S#12 in the area), cut (a provisional mark's struck guess stays a guess), keys-told (a Key need not be kept overnight). New: `tests/rules/route.test.ts` (the journey's shape, every move announced, evenings never move him; old-route saves from every stop point carried on to week 14).
- **After the second playthrough review and the independent review of the branch** (both on the build):
  - **Three home places moved later** (round 1 of the judges: weeks 3–5 read as kept at the top): `pl-w4-hollow` w4→w10 (after `b-10.2`), `pl-w4-recess-above-the-cot` w4→w12, `pl-w5-ledge-lip` w5→w13. Each is an evening; its niche (`seal-4-5`, `seal-4-3`, `seal-5-5`) can be opened only once it is in view, so the three side-life records (`rec-x-sheep`, `rec-x-colleague`, `rec-x-hers-again`) first appear 6–8 weeks later than MVP_CONTENT's record table says. Checked: their payoffs are month 6, at once (a stand-alone paper) and month 8, all still later; no clue row names them; their teasers key on the place, not the week. A recorded exception to "nothing moves later".
  - **`b-4.C` stays in week 4** (it was moved to w7 in round 1, then back): `b-6.2` names the door's symbol as already seen, so `b-6.2` now also requires `b-4.C`. `b-w4.close` no longer assumes the door's symbols were seen, and it no longer says "one last time" (both judges read it as leaving for good).
  - **A job's return comes from where Dan has been shown he is** (both judges' first finding): a place reached during a job is shown on its own screen after the job's end, so the job's step, deep beat, passage line and find are chosen as if that place were not yet reached (`knownState` in `core/game.ts`; finds already did this). Before, a step written inside a new room played on the screen before "A new area".
  - **A night's bedtime line is said once:** on the evening (its last section), not again on Today's "Tonight" panel.
  - **The Daybook** cuts the log at the week's last dated fact (a plan change's `day` is the plan's, not the fact's; it crashed the page).

  - **`pl-w14-mule-stone` moves to week 13, after `b-13.B` and before `pl-w13-lower-gallery`** (as §4.4 had it; both judges failed it as an "Arrived" after the gallery beyond it): the day after the word at the deep end, Dan walks back down through the square gallery and stops at the stone on his way to the fall. Its line says "towards the fall at its deep end" (it named the gallery beyond the fall, not yet seen); `req` `b-13.B`.
  - **`b-12.B` requires `seal-12-1`** (its line knows the far niche's tablet). **`pl-w14-deep-niche` keeps `req: []`**, not `b-w14.morning` as §4.6 said: a morning plays only after a goodnight, so the requirement stranded a player who never says goodnight (the rule test caught it), and the line stands alone.
  - **`fd-b08`** (a week-1 find in the hall that names the Salt Gallery) waits for `pl-w1-pick-niche`. **The night's line at camp** is chosen from what Dan has been shown, like a job's return: `b-w7.camp` (the great door open) waits until the word at the door has been cut, not just reached.
  - **"Last night, at camp"** plays only for the night before this opening; after days away the evening waits for the next one Dan works for (evenings trail and catch up, two a night).
  - **"Here" is the area, not the stretch**: Today's "Use a Key" and "still locked, further back", `inView`'s preference, and the Map's opening light all compare areas (the Stair's two flights are one area).
  - **Today's end-of-day line** names today's walk only (its last place, or where it turned back), never an evening nor a place reached on another day.
  - **An evening with no one place** is titled for the area it begins in (it was "By the lamp" under the area's name, then the area again); each section names its area only when it changes.
  - **The finds a passed-by view at day's end carried** (`cv-03`'s `fd-b12`, `cv-21`'s `fd-g11`) still reach Dan from the ordinary find pool in every life simulated; a rule test now holds every camp view's find to that.
  - **Tests:** a fourth old-route save, `keys-light` (made on `main`'s code, Keys used on the Map 23 times, carried on after a week away), stopped at the end of each of weeks 1–6; the old-save test now also requires a way-in line (or the place's own words) on every return to an area; `keys-told` keeps its "a Key is held on some days" assertion (restored) and compares areas; the sim looks at the evening right after goodnight, as the app shows it. Coverage as built: every place of weeks 1–6 for `normal-kept`; the end of each of weeks 1–6 and mid-weeks 7, 13 and 14 for `normal-nobed`, `high-kept` and `keys-light`.
  - **Known limit:** a save stopped in the middle of week 14 under the old order (after the old `b-14.A`) meets `pl-w14-meeting` as a return with the lower way's way-in line, which assumes the rubble cleared from behind. Dan's save is in the early weeks, so it cannot meet this; left as is.
- **After the third playthrough review** (judges on Opus and Sonnet; the Fable judge ran out of credits):
  - **`b-4.C` moves to week 6**, the evening after `pl-w6-square-gallery` (it stood in week 4, where it made two evenings back to back on the Stair; both judges: "not kept at home, but slowed by it"). `b-6.2` still requires it; it is in its own week, so the evening comes first (`frontierNeeds` plays it at once on a long day if the way down waits on `b-6.2`).
  - **The week's page (a calendar week's glimpse) honours its beat's `req`**; `b-w3.close` ("you end at the first turn") requires `b-3.2`, the walk down to the first turn.
  - **Labels as PROPOSAL §4 had them:** a turn-off (`turnOff: true` on `pl-w10-deep-end`, `pl-w11-far-end`, `b-13.B`) is "On the way back"; a day's end short of a place is "Where you turned back" (the Map's "Turned back here"). Before, the turn-offs said "Back again" over words that said "on the way back up", and the day's ends said "On the way back" while never moving Dan. `said` now only drops the way-in line.
  - **`b-5.B`** says Dan finds the gap climbing back up from the second landing (it is above it, reached after). **`b-7.A`** says its way and reason: out of the square gallery's low doorway onto the Stair, on down past the second landing, both symbols in mind (`said`; the Stair's own way-in line, from the Lamp Hall, read wrong from the square gallery).
  - **Locks in view only where seen:** `pl-w10-blast-floor` brings `seal-11-6` (by the rails) into view, and `b-5.B` brings `seal-5-3` (the gap's sill): the Map listed both on their stretch before the room or the gap was seen.
  - **A stop at day's end made again** says only "you stop again at …" and its new find, never its words twice; the Map re-reads its first night.
  - **`cv-20`**: the cold air goes up "towards the rubble", not the blast room (the rubble is shown to be the blast room's fall only at `b-14.A`).
  - **Capture fixes (not the app):** the walk now cuts each word as a player does and records each tap's line (the place's answer last); it waits for the Map to draw (its lights fade in on real time); a find at a day's end is not listed twice.
- **The fact-and-spoiler check of every line the branch changed** (WRITING_PROCESS step 5; the playthrough judges were the cold readers, reading every screen in play order with no repository):
  - **Facts:** `b-7.A` named the wrong source for its two symbols (they come from the tablets under the second turn and in the salt, not the square gallery) and walked "past" the second landing that is the second flight's foot; fixed. `b-4.A`, `pl-w4-hollow` and `pl-w14-deep-niche` carried her sheets round to the salt, where they already lie in their crack; fixed.
  - **Order:** `b-w3.close` says Dan ends halfway down the top flight (true at the end of week 3) and requires `pl-w5-worn-steps` (`b-3.2` is a notebook page, not the walk). `b-w4.close` no longer shows the great door's notches before `b-4.C` does. `pl-w10-deep-end` requires `b-10.1` and `b-13.B` requires `b-13.A`, the moments their reasons name (both open on the road, no Key). `pl-w14-meeting` says Dan comes back down to it and names the lower way, which `b-14.A` then climbs; `b-14.A` says the rubble *seems* to be the back of the blast room's fall (the cut confirms it); `b-14.B` no longer repeats the meeting's lit cups and cold air; the stone's line says "where the fall stood".
  - **One name per thing:** "the Lower Door" is gone (`b-4.C` is "The great door, close"); the Lamp Hall's place is "The ledge's underside" (the blast room's niche keeps "the ledge's lip"); the square gallery is never "the side passage" (`b-6.A` is "The way in"), so "side gallery" means only the one off the blast room; `seal-3-3` is "a recess in the wall at the first turn" (beside `seal-7-3`, "the rail's recess"; the checker's "the cord's recess" would have named what is inside); "the Box Room, her room" loses its second name.
  - **Stock phrases:** the 21 day's-end stops no longer all open "On your way back to the lamp today, you stop for a while" (the label says where he turned back): five openers in turn, none naming the lamp before Dan has seen it. `b-8.B` and `b-12.B` lead with their reason; `b-7.C` and `b-4.B` no longer repeat themselves or a nightly glow.
  - **Also:** the Mouth's way-in line goes back along the pipe to the ladder (from camp), `seal-8-4` is on the narrow way down, `wc-w14-1` says which two symbols. **Left as is:** `pl-w11-far-end` sets the log's tall man beside the figure at the far end (it pays off in month 6; the checker left it to the author: it stays, the player still has to make the link); SITE's geography has the lower gallery come out on the lower way below the Water, though the square gallery opens off the second landing high above it: no line says the galleries go down, and the Map draws them as joined, so a careful player may notice. A question for the next story job, not this route.
- **After the fourth playthrough review** (Opus and Sonnet; Fable still out of credits): both judges say the Stair stretch "does not read as being kept at the top"; what they failed, fixed:
  - **The second lintel is seen before its word:** `pl-w5-second-landing` now shows the Stair going on down under a second lintel over solid stone (it was first described only on week 6's page, a glimpse that can pass unshown); `b-w6.close` and `b-7.A` recall it.
  - **`b-4.1`** no longer says "the little door you saw before" (week 3's page, which shows it, may now come after); `b-w3.close` stops once `b-4.1` has taken Dan to the first turn (`until`). `b-w7.close` ("both end at water") requires `b-8.A`; `b-4.C` requires `b-6.A` (its reason is the record read inside the gallery).
  - **The blast room's finds and passages** (`fd-i03`–`fd-i06`, `ps-b04`–`ps-b10`) require `pl-w10-blast-floor`, where the room is first stood in and named, not the word on its lintel.
  - **`b-9.A`** starts back at the Water and names the doorway as the one seen across it. **`pl-w14-meeting`** starts at the end of the lower gallery (no retelling). **`b-14.A`'s answer** leaves Dan on the lower way's side of the opened gap (it stepped him into another area with no arrival).
  - **Names:** `b-7.B` is "The twelve rings" (not a second "crew's wall"); `cv-10` is "The head of the Stair" (one name for the spot). A stop made again says "Today you turn back at the same spot as before" (its name is the title; the old template made "at by the torn wall").
  - **Not changed, for the record:** two evenings in a row on an old save that had one waiting; the evening screens that take in several places at home (the label says "Tonight, at camp"; each section names its area); the delve screen that an old save opens on mid-delve (the delve's own words, not the route's); the Map's "needs a Key" on every area with a lock (D-142's choice).
- **After the fifth playthrough review** (Opus 77 of 79 fresh moves, 88 of 90 old; Sonnet 77 of 79, one old move failed; the same three failures from both):
  - **A day's-end stop's find comes from its own area** (`pickFind`'s `area`): a stop at the join had a find from the Box Room pasted under it.
  - **`pl-w10-blast-floor` shows the low doorway in its side wall** (it was first met only as the way into the side gallery, three weeks on).
  - **A moment at home on a job's end, once the way down is open, is captioned "At camp · area"** (an old save can hold one that plays while Dan is deep down).
  - **`cv-08`** calls the Box Room "the small room off the hall", so "a side chamber" on the road means only the side chambers on the way.
  - **The walk's transcript** no longer lists a night's bedtime line separately when the evening's screen ends on it (the app shows it once).
- **After the sixth playthrough review** (Opus 77 of 79 fresh, 89 of 90 old; a stricter Sonnet 71 of 79, 86 of 90, failing returns that gave only the way):
  - **Four returns now give a reason as well as the way** (`pl-w2-box-by-the-cot`: to see what else she left; `pl-w9-approach`: the powder smell, to find where it comes from; `pl-w11-cupboard`: back to look at the log; `b-12.A`: to read on in it). Each reason is something Dan already has.
  - **`pl-w3-salt-lit`** no longer says "that first night" (the bedtime line before it already was); **`b-5.B`** says Dan goes down to the second landing again and notices the gap above it (forward, not "climbing back up"); **`b-w4.close`** no longer says "on your way to the Stair" (a week's page can show later).
  - **The slope down to the lower way** (`pl-w14-meeting`): past the lower gallery's square stone the floor tips into a long, steep slope, down until Dan must be as deep as the Water, and the lower way opens at its foot. SITE notes it under the Surveyor's galleries. Before, thirty level paces from a gallery high on the Stair came out beside the blast room below the Water (the fact check's open geography question, now answered).
  - **A stop made again** says "Today you turn back here again, as you did once before", then one line of what is there (its words' second sentence), then any new find.
- **After the seventh playthrough review** (Opus 78 of 79 fresh, 89 of 90 old; Sonnet 78 of 79, 88 of 90; both: no unexplained jump between areas left in the fresh save):
  - **A stop's find is from its own stretch** (the Stair is one area of two flights: a stop on the landing showed a find from the second flight).
  - **A stop made again** keeps its first two sentences (where it is, and one line of what is there), then "You have stopped here once before": the second sentence alone left "them" with nothing to refer to.
  - **`b-9.A`** gives its reason: the Water has two ways on, and this time Dan tries the doorway on its far shore.
  - **Known, not fixable here:** two old-order saves (`old-754`, `old-903` in the walk) already hold `b-6.2`, which names the great door's blank, from before they saw `b-4.C` (the old order skipped past places that weren't ready, D-154 §2). The new order plays `b-4.C` next; what such a save already read stays as it was.
- **The second independent review of the whole branch** (after round 7; no stall, replay or crash on any old save, every old arrival marked seen): fixed
  - **An evening that is a word** (`b-7.C`): the cut screen now shows the rest of that evening (each part under its area, with its notes) once the word has settled; before, those moments and that night's bedtime line were shown nowhere.
  - **The set-up says "On the way back"** before a place in an area walked before (a turn-off, a return), not "On down".
  - **Today's end-of-day line** is built from today's own arrival (not one still waiting to be shown); a day ending short says "Today you turned back short of the next place: {area}" (a stop's name is never put inside a sentence, and nothing of sleep before goodnight).
  - **An older night's evening** still plays at the next opening, as "One evening, at camp" (one night back only would leave a player who opens every other day without evenings). The step screen's way on says "See where you are" when what waits is a stop or an evening. The Map centres by area.
  - **Ids only outside the sealed files:** a test, two code comments and four commit subjects on this branch named story things; the comments and test are ids now, and the commit subjects were reworded (this branch only, before any merge).
- **After the eighth playthrough review** (Opus 78 of 79, 88 of 90; Sonnet 76 of 79, 84 of 90):
  - **A day's-end stop is on Dan's own stretch first, then the deepest of his area** (it could be the head of the Stair when he was two flights down).
  - **`b-7.B` and `pl-w14-mule-stone` are "Back again"** (`backWithin`, with their own words for the way): both are back along the area Dan is in.
  - **The Map:** a stop with a place's own name is one row with it; the join between the blast room and the lower way is drawn once `b-14.A` has opened it.
- **After the ninth playthrough review** (Opus 77 of 79, 86 of 90; Sonnet 75 of 79, 83 of 90), the loop stops:
  - **`backWithin` is taken back out:** round 8's Sonnet failed `b-7.B` and `pl-w14-mule-stone` as "Arrived", round 9's Opus failed them as "Back again" (not having left the area); round 7's two judges passed them as "Arrived", so "Arrived" it is.
  - **What the last three rounds' judges still fail is either split between them** (one judge's failure is another's pass, as above) **or the screens' standing design, not the route:** the story's words folded under "Look" on the arrival screen (D-085); "needs a Key" on every area of the Map with a lock in it (D-142); the Map's box listing places in walking order (PROPOSAL §4, approved); evenings that take in two or three places at home. These are Dan's to judge (`reviews/route/RESULT.md` §6), not this build's to change unasked.
  - **Every move to another area now states how and why** (round 7's Opus: "no unexplained jump between areas"; rounds 7–9: none failed for a missing way or reason).

## 13. The polish (D-155 to D-158): the panel walks' story fixes

The notebook carried from `b-3.2` on is in `SITE.md` (the Box Room row) and D-155. The panel walks (three judges, a move fails on two of three) changed these lines, no fact changed:
- `b-2.A`: the reason is the tally's notches filling with light; her sheets on top do not cover the next stretch (they did not say so before, and `b-4.A` looks right through them). `b-4.A` and the line after `b-2.A` agree.
- `pl-w2-smooth-place`: opens with its reason (the polished wall seen at the corner, `b-1.B`'s finds), so it reads both as the next place (a fresh save) and as a return (an old save that left the hall: old-248).
- `pl-w5-second-landing`: shows the blank and the two symbols beside the second lintel (as `b-w6.close` says), so the cut at the foot of the second flight never rests on a thing not shown.
