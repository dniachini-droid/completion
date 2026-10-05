# The route redesign (D-153): audit and design — SPOILERS

> **Sealed (D-015). Dan must not read this.** Stage 1 of the route job: the audit of how the player moves through the Site in story weeks 1–14, the root cause, and the design of the fix. No content or code changes until Dan approves the spoiler-free proposal (`docs/reviews/route/PROPOSAL.md`). The fixed ending, the truth and the sign order are unchanged by everything below; the one geography change is a §55 retcon (§4.6).

_Written 2026-10-05. Brief (Dan, through the orchestrating session): "There needs to be coherent movement throughout the game. Clear locations… It needs to be intentional. If it is not intentional, then we need to perform a broader fix." And: "I want it fixed. Properly." Not a mechanical one-area-at-a-time rule; the journey as a whole, not week by week._

---

## 1. How the audit was done

- **The order as played**, not as listed. A simulated player (`tests/rules/sim.ts`, bedtime kept) lived 26 calendar weeks of Normal, of Low and of High days on the current `main` content; every `arrived` (place) fact was written down with its beat's `stretch`. All three lives play the 68 places in **the same order** (route order, with one swap in week 5: `b-5.B` before `b-5.A`, because `b-5.A` waits on the recess under the second turn). So the order below is what Dan meets, whatever his days are like.
- **Every move between areas** (a place whose stretch differs from the place before it) was read against the place's own line (beats.ts), the steps between, `SITE.md`'s map, `MVP_CONTENT.md` §0–§2, `ARRIVALS_REGION1/2/3.md` and `STORY_JOB.md` §4 and §8, and sorted into three kinds:
  - **motivated and clear**: the story gives a reason to go there then, and the line (or the line before) says where you are going and why;
  - **motivated but never told**: there is a story reason (a sign just learned, a record that can now be read), but nothing on screen says you went back for it, or how you got there;
  - **arbitrary**: no story reason to go there then; the place is there because the week needed a place (usually a niche in view).
- **The location model as Dan sees it**: a read-only audit of the app's screens (`app/src/ui`, `core/game.ts`, the copy, the Map, paintings), §3.

## 2. The audit

### 2.1 The numbers

| Measure (68 places, weeks 1–14) | Now |
|---|---|
| Area changes | **48** |
| Area changes in the first 20 places | **15** |
| Worst run of 20 consecutive places | **16** changes |
| A→B→A bounces (out to an area and straight back) | **10** |
| Moves motivated and clear | **10** |
| Moves motivated but never told | **16** |
| Moves arbitrary | **22** |
| Longest stay in one area | 4 places (week 6, the square gallery); weeks 1–5 never more than 3 in a row |

### 2.2 Every move, as played

| # | Wk | From → to | Place reached | Kind | Why |
|---|---|---|---|---|---|
| 1 | 1 | hall → salt | `pl-w1-pick-niche` | clear | `b-1.B` ends "beyond the turn a gallery opens, and the air smells of salt"; the niche's line says it is round the corner |
| 2 | 1 | salt → camp | `b-1.C` | never told | Exploring the doorway in the hall's side wall is natural, but nothing says Dan turned back from the salt |
| 3 | 1 | camp → hall | `pl-w1-below-the-lamp` | arbitrary | A niche at the ledge, placed to put `seal-1-3` in view |
| 4 | 2 | hall → salt | `b-2.A` | never told | The row of strokes filled (`b-1.6`) and the tally runs on; the line never says why he went back |
| 5 | 2 | salt → camp | `b-2.B` | never told | The tin box opened (`b-2.1`); the rod is in her camp; no link from the salt |
| 6 | 2 | camp → hall | `pl-w2-smooth-place` | arbitrary | A seen-only thing at the corner; nothing calls Dan there |
| 7 | 2 | hall → camp | `pl-w2-box-by-the-cot` | arbitrary | Filler for `seal-2-5` |
| 8 | 3 | camp → hall | `b-3.A` | clear | The rod's note: cut the two marks on the lintel |
| 9 | 3 | hall → stair | `b-3.B` | clear | Through the opening under the lintel |
| 10 | 3 | stair → salt | `pl-w3-salt-lit` | never told | The light reaches the salt; but Dan has just gone down the new stair and is back in the salt with no word |
| 11 | 3 | salt → stair | `b-3.C` | arbitrary | "You go to the edge of the landing": he is on the landing again without having gone back |
| 12 | 3 | stair → hall | `pl-w3-far-end` | arbitrary | Back up for the great door, unasked |
| 13 | 4 | hall → salt | `b-4.A` | never told | Her Day 9 sheet; `b-3.1` set it up, nothing says he went for it |
| 14 | 4 | salt → camp | `pl-w4-recess-above-the-cot` | arbitrary | Filler for `seal-4-3` |
| 15 | 4 | camp → hall | `b-4.C` | never told | The Lower Door, close; no reason "today" |
| 16 | 5 | hall → stair | `pl-w5-worn-steps` | never told | The descent resumes after a week away from it, unannounced |
| 17 | 5 | stair → flight2 | `b-5.B` | never told | Down the Stair again; unannounced |
| 18 | 5 | flight2 → salt | `b-5.A` | never told | ONCE etc. from the recess (`b-5.1`) make the tally's head readable; the line starts "You go back along the Salt Gallery" with no climb |
| 19 | 5 | salt → flight2 | `pl-w5-second-landing` | arbitrary | "You go on down the second flight": he was in the salt |
| 20 | 6 | flight2 → square | `b-6.A` | clear | Through the low doorway into the gallery seen through the gap |
| 21 | 6 | square → camp | `pl-w6-folder` | arbitrary | From the square gallery to under her cot, for `seal-6-5` |
| 22 | 7 | camp → flight2 | `b-7.A` | never told | PATH and OPEN held; the line starts at the blank |
| 23 | 7 | flight2 → square | `b-7.B` | arbitrary | The way down just opened; "Back in the square gallery" says where, not why |
| 24 | 7 | square → hall | `b-7.C` | never told | The great door has the same two symbols (a teaser says so); the arrival does not |
| 25 | 8 | hall → water | `b-8.A` | clear | "You follow the Stair on down past the second lintel" |
| 26 | 8 | water → salt | `b-8.B` | clear | "Back up in the Salt Gallery… with the tablet's strokes and bars fresh in your mind" |
| 27 | 8 | salt → water | `pl-w8-steep-foot` | arbitrary | "You follow the shore round": he was in the salt |
| 28 | 8 | water → blast | `b-8.C` | clear | The narrower way down at the far shore |
| 29 | 9 | blast → reading | `b-9.A` | clear | The hall of benches across the Water (week 8's close) |
| 30 | 9 | reading → salt | `b-9.B` | never told | The cross on the Reading Room's tablet; the line names it but never says Dan climbed back up with it |
| 31 | 9 | salt → reading | `b-9.C` | arbitrary | "In the Reading Room": no way back down |
| 32 | 9 | reading → blast | `pl-w9-approach` | never told | The narrow way down again |
| 33 | 10 | blast → square | `pl-w10-deep-end` | arbitrary | From below the Water to the square gallery's far end, unasked |
| 34 | 10 | square → blast | `b-10.A` | arbitrary | Straight back down |
| 35 | 10 | blast → square | `b-10.B` | arbitrary | Up again for the standing stone's Key |
| 36 | 10 | square → blast | `b-10.C` | arbitrary | Down again |
| 37 | 11 | blast → reading | `b-11.B` | clear | "You go back round the Water to the Reading Room… with the cupboard's tablet in mind" |
| 38 | 11 | reading → water | `pl-w11-far-end` | clear | "You walk to the far end of the Water… where something tall was standing" |
| 39 | 11 | water → blast | `b-11.C` | never told | Back to the torn wall |
| 40 | 12 | blast → salt | `b-12.B` | arbitrary | From the blast room's shelf to the tally's end |
| 41 | 12 | salt → side | `pl-w12-square-way` | arbitrary | "At the side of the blast room": he was in the salt |
| 42 | 13 | side → square | `b-13.B` | never told | The shut door's record speaks of moving stone; not said |
| 43 | 13 | square → reading | `b-13.C` | arbitrary | A bench never mentioned before |
| 44 | 13 | reading → square | `pl-w13-lower-gallery` | arbitrary | "You walk through where the fall stood": he was in the Reading Room |
| 45 | 14 | square → blast | `b-14.A` | never told | The same word on the other fall; but the lower gallery he was in already runs on to rounded stone (its own line, and week 13's close) |
| 46 | 14 | blast → square | `pl-w14-mule-stone` | arbitrary | Back to the mule-shoe for `seal-14-4` |
| 47 | 14 | square → lower | `b-14.B` | arbitrary | "You go through the gap behind the rubble": the rubble is in the blast room |
| 48 | 14 | lower → salt | `pl-w14-deep-niche` | arbitrary | From the deepest place yet to the top, for `seal-14-5` |

The steps make it worse. Between places, nearly every week has a step in her camp (her notebook, a page a week: `b-2.3`, `b-3.2`, `b-4.3`, `b-5.2`, `b-6.1`, `b-8.3`, `b-9.1`, `b-10.3`, `b-11.3`, `b-12.2`, `b-13.2`) and one in the salt (the tally: `b-3.1`, `b-4.4`, `b-5.3`, `b-6.2`, `b-7.2`, `b-9.3`, `b-14.4`), each starting "In the Survey Cut…" / "In the Salt Gallery…" while the day's place is far below.

### 2.3 Is there a geography, and does the route respect it?

**There is a geography, and it is coherent.** `SITE.md` draws it: the shaft to the Lamp Hall; the Salt Gallery round the corner at the hall's far end and her camp through a doorway in its side wall; the lintel in the side wall to the head of the Stair; the Stair down two flights to the Water, with the square gallery off its second landing; the great door's steep stair down to the Water's far shore; across the Water the Reading Room; at the far shore the narrow way below the Water to the blast room, the side gallery off it, and behind its fall the lower way. The lines themselves almost always describe a real spot correctly.

**The route respects which rooms exist, not how you get between them.** No move ever crosses ground that isn't there, but 22 moves happen with no travel at all (the deepest point to the top in one arrival, `#48`; the salt to "the side of the blast room", `#41`; the Reading Room to "where the fall stood", `#44`). Week 14 even contradicts the geography: the lower gallery already runs on to the lower way (`pl-w13-lower-gallery`'s line; week 13's close), yet the route sends Dan back round by the blast room and the square gallery (`#45`–`#47`).

**Does the player know where he is?** Rarely, beyond the room in front of him (§3). The arrival names only the place; nothing marks entering a new area; the Map's box for the area he is in hides that area's places.

### 2.4 Verdict

**The movement was not designed.** It is the by-product of a week-by-week schedule. Nobody ever decided how the player moves through the Site; each week was filled with what the story needed to show that week, wherever it happened to be, and the order of a week's places was the order of its visit table. The places themselves are good and true to the map; the route between them was never a design object.

### 2.5 Root causes (with the evidence)

1. **The route was built week by week from the visit tables.** `STORY_JOB.md` §4, creative call 1: "A week is a *route* of five named places: the story arrivals already written, **pinned where they were**, and new places between them." The visit tables (`ARRIVALS_REGION1/2.md`) were written to the sign order (`SCRIPT.md` §6) and to the lives' records, one stretch of each per week, before any route existed. §8.1 repeats it for weeks 8–14 ("the ARR arrivals pinned where they were"). No document ever defined an order of travel.
2. **The filler places were chosen for the Key economy, not for the walk.** §4 call 1: "each ends on a sealed thing now in view, which gives every day's arrival the heart's last link: *a sealed thing ahead you can see*"; call 2: a new place is a real spot "usually where a NICHES item already sits". `NICHES.md` spreads each week's five rows over every room (salt, camp, hall, stair…), so the fillers followed the niches all over the map: 13 of the 22 arbitrary moves reach a `pl-` filler.
3. **Two lives' records are fixed to the top of the map and read a little every week.** The tally is on the Salt Gallery's wall and her notebook is on her cot. The story reads both a stretch or a page a week, in step with the signs, so every week is tied to the top however deep the frontier is: 7 of the 14 weeks have a place in the salt after the Stair opens, and 11 have a notebook step in her camp.
4. **The camp rule was written and never shown.** Canon: Dan sleeps in the Lamp Hall by the lamp every night (`SITE.md` "Camp… is the Lamp Hall, by the lamp, for the whole year"; every camp line says so; `b-w8.camp`: "you climb back to the Lamp Hall to sleep"). So in the fiction every day starts at the top and goes down, and every evening comes back. That is the natural reason to see the top again, but no arrival and no screen uses it: the app shows a trip back to the salt as a jump, and the next day's place below as another jump.
5. **The engine has no idea of travel.** Where Dan "is" is simply the last place's stretch (`core/story.ts` `storyState`); a place whose `req` is unmet is skipped for the next one in the list, whatever area that is (`nextPlace`; `MVP_CONTENT` §0.2 "skipped for now"), which is how week 5 bounces (`#18`, `#19`).
6. **No review ever looked at movement.** The outside review, the two cold-reader rounds and the fact checks tested pacing, continuity of facts, fair play and voice. D-079 noted that "the route loops between areas" and fixed only its symptom (a story bit about a place not yet reached). The one cold reader who noticed a camp contradiction ("You stop for the night at…" vs sleeping by the lamp) was "left for Dan" (`STORY_JOB.md` §8.8).
7. **Not a cause:** saving paintings. Every place has its own painting (82 of 89 repainted, D-100); the returns to the square gallery in weeks 10–14 come from canon (the standing stone, the mule line), not from reusing a painting.

## 3. The location model as Dan sees it (read-only audit of the app)

**Two levels exist in the data and are mixed on screen.** Every place, niche, camp view, find and passage knows its stretch (`story-types.ts`). Every place has its own painting. But:

1. **The same carved title means an area on one screen and a place on another.** Area: the Map's lights and walked-area boxes, the Stair screen (`ui/Stair.svelte`, "The top of the Stair" in the place-heading style). Place: Today's title (`ui/Today.svelte` 251), the arrival screen (`ui/Arrival.svelte` 87), the delve screen (`ui/Delve.svelte` 192), Welcome back, the lock screen and Live Activity. Before the first place, Today's title shows the area instead.
2. **Eight places share their area's name**, so "The Lamp Hall" is both the area and a place inside it: `b-1.A`, `b-1.C`, `b-8.A`, `b-9.A`, `b-8.C`, `b-14.B`, `pl-w12-square-way`, and nearly `pl-w6-square-gallery`; camp views `cv-19`, `cv-20` too.
3. **Nothing says which area a place is in, or that Dan has entered a new one.** The one exception is the Map box's "Here · {area}". The only "new area" moment is the Stair screen, and it looks like a place.
4. **On the Map, the area Dan stands in hides its own places**: its box shows only "Read it again" (the last place) and its camp views; every other area lists all its places. The places sit below the niche rows in a 180 px box, usually out of sight.
5. **Links that do the same thing look different.** Today's title re-reads the last place but looks like plain text; the Map's place names are inline links joined by " · " with the camp views mixed in; niches are separate rows with "Use a Key" / "Opened · Read again"; the Daybook's places are not tappable, its niches are ("Read again"). This is Dan's "different looking links to get into each location".
6. **Niches look like places**: the niche row "The Salt Gallery, the pick niche" and the place `pl-w1-pick-niche` both sit in the salt's box.
7. **Area names drift in the free-text `where` fields**: "The Mouth" vs "The Mouth and the pipe"; "The head of the Stair", "The Stair", "The Stair's first turn" for `st-stair`; "The blast room", "The Water's far shore" for `st-blast`.
8. **The job-return screen's back arrow names the next place** before it is reached (`ui/Step.svelte` 52), and the Map marks the next place only when it is in Dan's area or an unwalked one.
9. **Camp is invisible.** Dan sleeps by the lamp every night, but no screen shows camp as a place you return to; a short day's end says "You make your camp at {view}", which contradicts the bedtime line.

D-092 (Dan's call) stands: **one map**, no closer view. The fix below stays inside it.

---

## 4. The design

### 4.1 The shape of the whole journey

**A descent with one spine and a home at the top.**

- **Home** is the top: the Lamp Hall, with the lamp on its ledge where Dan sleeps every night, the Box Room (her camp, renamed, §6) through the doorway in its side wall, and the Salt Gallery round the corner at its far end.
- **The spine** goes down, one way: the Lamp Hall → the lintel → **the Stair** (its top flight, then its second flight) → **the Water** at its foot → the narrow way **below the Water** → the blast room → (week 14) **the lower way**, going on down into weeks 15–26.
- **Branches** open off the spine, each entered when it is first reached, walked, and left: the **square gallery** (off the Stair's second landing; its lower gallery runs on, behind its fall, to the lower way); the **Reading Room** (across the Water); the **side gallery** (off the blast room). The great door's steep stair is a second way down from home to the Water's far shore (week 7).
- **The two ways meet.** The square gallery's lower gallery and the blast room both lead to the lower way. In week 14 Dan reaches the lower way the old surveyors' way (the gallery behind the lifted fall), walks up it to the back of the blast room's rubble, cuts the word there, and steps through into the blast room: a short way home opened from the far side (§4.6). From then on the spine runs straight: the Stair, the Water, below the Water, the blast room, the lower way.

The overall shape the player should feel: **weeks 1–3** home, explored (the hall, the salt, her room) until the first word opens the way down; **weeks 3–7** the Stair, a flight at a time, with the square gallery off its landing; **weeks 8–9** the Water and what lies round it; **weeks 10–13** below the Water, with two turn-offs on the way home that the story asks for (the square gallery's fall, the Reading Room); **week 14** the two ways meet and the descent goes on.

### 4.2 How the player moves: the four kinds of move (the movement principle)

Every day, in the fiction, Dan sets out from camp, goes down to where he got to, goes on, and comes back to the lamp at night. Every place reached is one of four kinds, and **the kind is data on the place** (no inference):

1. **On** (`on`): the next place along the way, in the area Dan is in or the next one down. This is most places.
2. **A new area** (`enter`): the first place in an area. It gets its own arrival (§5.2), with the area's way-in line.
3. **An evening at home** (`evening`): a place at the top (the Lamp Hall, the Box Room, the Salt Gallery) once the frontier has left them. It plays as that evening's scene, back at camp, and **does not move where Dan is**: the frontier stays where it was. It is in the route only where the story gives a reason to look at it tonight (a sign just learned makes the tally readable; her notebook; the light just woken), and its first sentence says so.
4. **A turn-off on the way home** (`turn`): a branch revisited on the way back up, only when something learned below calls for it, said in the place's first sentence (week 10: the sign for move → the square gallery's fall; week 11: the cupboard's tablet → the Reading Room's lintel; week 13: the shut door's record → the standing stone). The next day the frontier is back below.

**Rules** that make it hold for any day, any history:
- A place never says where Dan came from by assuming the place before it. How he got there is told by **its area's way-in line** (data, one per area, §5.3), shown only when the last place shown was in another area, and by the reason sentence where the move is a turn-off or an evening.
- **No skipping across areas.** A place whose `req` is unmet no longer lets the route jump to a place in another area. The story bits it waits for (a step, a road row) play on the way, as D-129 already does when nothing else is in reach (`wayTo`). (Every route `req` is met by an earlier place or by a bit that plays on the way; Stage 2 adds a rule test.)
- **Home steps are evenings too.** Once the frontier has left the top (from `b-3.B`), a step whose area is home (her notebook, the tally) is not shown between two jobs. It is held and shown with the day's close, as "that evening, at camp". Steps at the frontier, or on the way down (e.g. `b-12.1` at the Water's far end), stay as they are.
- **A day that ends short of a place** ends where Dan turned back: the camp view becomes "where you turned back today" (it never says he camped there; he sleeps by the lamp). This also settles the contradiction noted in `STORY_JOB.md` §8.8.

### 4.3 The areas, how they connect, and their places

The stretch ids stay (saves and content key on them). Two display changes: the two Stair stretches show as **one area, the Stair**, and the Box Room shows as a room off the Lamp Hall.

| Area (as shown) | Ids | Joins | Places (new route order) |
|---|---|---|---|
| The Mouth | `st-mouth` | the shaft; its pipe opens into the Lamp Hall's near end | (steps only) |
| The Lamp Hall | `st-hall` | the Mouth (near end); the Box Room (side wall); the Salt Gallery (round the far corner); the Stair (the lintel); the great door's steep stair (far end) | `b-1.A`, `pl-w1-below-the-lamp`, `b-1.B`, `pl-w2-smooth-place`, `b-3.A`; evenings `pl-w3-far-end`, `b-4.C`, `pl-w5-ledge-lip`, `b-7.C` |
| The Box Room | `st-camp` | the Lamp Hall | evenings: `b-1.C`, `pl-w2-box-by-the-cot`, `pl-w4-recess-above-the-cot`, `b-2.B`, `pl-w6-folder` |
| The Salt Gallery | `st-salt` | the Lamp Hall's far corner | `pl-w1-pick-niche`, `b-2.A`, `pl-w2-above-the-ring`; evenings `pl-w3-salt-lit`, `b-4.A`, `pl-w4-hollow`, `b-4.B`, `b-5.A`, `b-8.B`, `b-9.B`, `b-12.B`, `pl-w14-deep-niche` |
| The Stair | `st-stair`, `st-flight2` | the lintel (top); the square gallery (second landing); the Water (foot) | `b-3.B`, `b-3.C`, `pl-w5-worn-steps`, `b-5.B`, `pl-w5-second-landing`, `b-7.A` |
| The square gallery | `st-square` | the Stair's second landing; behind its fall, the lower gallery to the lower way | `b-6.A`, `pl-w6-square-gallery`, `b-6.B`, `pl-w6-wall-shelf`, `b-7.B`; turn-offs `pl-w10-deep-end`, `b-10.B`; `pl-w14-mule-stone` (moved to w13), `b-13.B`, `pl-w13-lower-gallery` |
| The Water | `st-water` | the Stair's foot; the steep stair (far shore); the Reading Room (across); below the Water (far shore) | `b-8.A`, `pl-w8-channel`, `pl-w8-steep-foot`; on the way up `pl-w11-far-end` |
| The Reading Room | `st-reading` | across the Water | `b-9.A`, `pl-w9-benches`, `b-9.C`; turn-offs `b-11.B`, `b-13.C` |
| Below the Water | `st-blast` | the Water's far shore; the side gallery; the lower way (once the rubble is cleared) | `b-8.C`, `pl-w9-approach`, `b-10.A`, `pl-w10-blast-floor`, `b-10.C`, `pl-w11-cupboard`, `b-11.A`, `b-11.C`, `b-12.A`, `pl-w12-shelf` |
| The side gallery | `st-side` | the blast room | `pl-w12-square-way`, `b-12.C`, `pl-w13-side-gallery`, `b-13.A` |
| The lower way | `st-lower` | the lower gallery (partway down); the back of the blast room's rubble (its head) | `pl-w14-meeting`, `b-14.A` (stretch changed from `st-blast`), `b-14.B` |

### 4.4 The new route, place by place

`E` = evening at home, `T` = turn-off on the way home, `N` = a new area, `·` = on. "Line" = what the place's line needs in Stage 2: **—** nothing; **R** a reason sentence first (evening or turn-off); **F** fix a sentence that assumes the old place before it; **W** rewritten (§4.6); **N** a place-name change only (§5.1). Every row's `req` is met before it (checked by hand here; Stage 2's rule test proves it).

| Wk | # | Place | Area | Kind | Reason the player is given | Line |
|---|---|---|---|---|---|---|
| 1 | 1 | `b-1.A` | Lamp Hall | N | the pipe opens into the hall | N |
| 1 | 2 | `pl-w1-below-the-lamp` | Lamp Hall | · | at the ledge, under the lamp | — |
| 1 | 3 | `b-1.B` | Lamp Hall | · | the length of the hall, to the corner | — |
| 1 | 4 | `pl-w2-smooth-place` (from w2) | Lamp Hall | · | still at the corner, looking up | F |
| 1 | 5 | `pl-w1-pick-niche` | Salt Gallery | N | the salt smell beyond the turn (`b-1.B`) | — |
| 1 | 6 | `b-1.C` | Box Room | E | back by the lamp for the night, the doorway in the side wall | R, N |
| 2 | 7 | `b-2.A` | Salt Gallery | · | the strokes in the tally filled; read on | F |
| 2 | 8 | `pl-w2-above-the-ring` | Salt Gallery | · | further in, below the lone ring | — |
| 2 | 9 | `pl-w2-box-by-the-cot` | Box Room | E | at camp: her room, the box by the cot | R |
| 2 | 10 | `pl-w4-recess-above-the-cot` (from w4) | Box Room | E | at camp: the recess above the cot | R |
| 2 | 11 | `b-2.B` | Box Room | E | at camp: the tin box opened; the rod on the shelf | R |
| 3 | 12 | `b-3.A` | Lamp Hall | · | the rod's note: cut the lintel | — |
| 3 | 13 | `b-3.B` | Stair | N | through the opening | — |
| 3 | 14 | `b-3.C` | Stair | · | the landing's edge, the top flight | — |
| 3 | 15 | `pl-w3-salt-lit` | Salt Gallery | E | the first night the hall is lit: the glow round the corner | R |
| 3 | 16 | `pl-w3-far-end` | Lamp Hall | E | by the new light, the great door seen whole | R |
| 4 | 17 | `b-4.C` | Lamp Hall | E | at the great door again, close | R |
| 4 | 18 | `b-4.A` | Salt Gallery | E | her Day 9 sheet, for the stretch past the lone ring (`b-3.1`) | R |
| 4 | 19 | `pl-w4-hollow` | Salt Gallery | E | further in along the salt | R |
| 4 | 20 | `b-4.B` | Salt Gallery | E | past the split, the niche's count filled | R |
| 4 | 21 | `pl-w5-worn-steps` (from w5) | Stair | · | down the top flight again (way-in) | F |
| 5 | 22 | `b-5.B` | Stair | · | on down to the second flight | F |
| 5 | 23 | `pl-w5-second-landing` | Stair | · | the second flight's turn | — |
| 5 | 24 | `b-5.A` | Salt Gallery | E | the recess tablet's signs (`b-5.1`) make the tally's head readable | R |
| 5 | 25 | `pl-w5-ledge-lip` | Lamp Hall | E | at camp, on your knees by the ledge | R |
| 6 | 26 | `b-6.A` | square gallery | N | through the low doorway seen through the gap | — |
| 6 | 27 | `pl-w6-square-gallery` | square gallery | · | on in | N |
| 6 | 28 | `b-6.B` | square gallery | · | further along, the crew's wall | — |
| 6 | 29 | `pl-w6-wall-shelf` | square gallery | · | the shelf | — |
| 6 | 30 | `pl-w6-folder` | Box Room | E | at camp, under her cot | R |
| 7 | 31 | `b-7.B` | square gallery | · | the crew's wall again, the second niche lit (week opens below) | F |
| 7 | 32 | `b-7.A` | Stair | · | out to the second landing and down to the lintel at the foot; PATH and OPEN held | F |
| 7 | 33 | `b-7.C` | Lamp Hall | E | the great door bears the same two symbols: cut it tonight | R |
| 8 | 34 | `b-8.A` | Water | N | the Stair on down past the second lintel | — |
| 8 | 35 | `pl-w8-channel` | Water | · | along the edge to the channel | — |
| 8 | 36 | `pl-w8-steep-foot` | Water | · | round to the far shore | — |
| 8 | 37 | `b-8.C` | Below the Water | N | the narrower way down at the far shore | — |
| 8 | 38 | `b-8.B` | Salt Gallery | E | the tablet's strokes and bars: back at camp, the tally's first line | R (exists) |
| 9 | 39 | `b-9.A` | Reading Room | N | across the Water, the hall of benches | N |
| 9 | 40 | `pl-w9-benches` | Reading Room | · | between the benches; **one stands apart** (set up for 13.C) | add |
| 9 | 41 | `b-9.B` | Salt Gallery | E | the cross (`b-9.2`): her sheet against the salt tonight | R |
| 9 | 42 | `b-9.C` | Reading Room | · | (way-in) the low bench, its count lit | F |
| 9 | 43 | `pl-w9-approach` | Below the Water | · | the narrow way down again | — |
| 10 | 44 | `b-10.A` | Below the Water | · | the lintel at the way's foot | — |
| 10 | 45 | `pl-w10-blast-floor` | Below the Water | · | through into the room beyond | — |
| 10 | 46 | `b-10.C` | Below the Water | · | the torn wall | — |
| 10 | 47 | `pl-w10-deep-end` | square gallery | T | the tablet's lifted block (MOVE, `b-10.1`) and the slope of broken stone seen in week 6: on the way up, turn off at the second landing | R |
| 10 | 48 | `b-10.B` | square gallery | T | the standing stone's count, lit | F |
| 11 | 49 | `pl-w11-cupboard` | Below the Water | · | (way-in) the blast room again | F |
| 11 | 50 | `b-11.A` | Below the Water | · | the ledge's row lit | — |
| 11 | 51 | `b-11.C` | Below the Water | · | the crack by the torn wall | — |
| 11 | 52 | `pl-w11-far-end` | Water | T | on the way up, round to where something tall stood in week 8 | R |
| 11 | 53 | `b-11.B` | Reading Room | T | the cupboard's tablet (VOICE): the inner door's lintel (exists) | — |
| 12 | 54 | `b-12.A` | Below the Water | · | (way-in) the log's next page | F |
| 12 | 55 | `pl-w12-shelf` | Below the Water | · | the long shelf | — |
| 12 | 56 | `b-12.B` | Salt Gallery | E | the far end's tablet (TAKE, HAND, GOOD; `b-12.1`): tonight the tally's last stretch | R |
| 12 | 57 | `pl-w12-square-way` | side gallery | N | (way-in) past the end of the rails, the low doorway | F, N |
| 12 | 58 | `b-12.C` | side gallery | · | the sill | — |
| 13 | 59 | `pl-w13-side-gallery` | side gallery | · | to its end | — |
| 13 | 60 | `b-13.A` | side gallery | · | the shut door | — |
| 13 | 61 | `b-13.C` | Reading Room | T | on the way up, the bench that stands apart has its count lit, seen from the doorway | R |
| 13 | 62 | `pl-w14-mule-stone` (from w14) | square gallery | T | the shut door's record speaks of moving stone: up to the standing stone, past the mule-shoe | R |
| 13 | 63 | `b-13.B` | square gallery | T | the standing stone's blank | — |
| 13 | 64 | `pl-w13-lower-gallery` | square gallery | · | through where the fall stood, thirty paces | — |
| 14 | 65 | `pl-w14-meeting` | lower way | N | the lower gallery comes out onto a wider way going down | W |
| 14 | 66 | `b-14.A` | lower way | · | up the lower way to its head: the back of the blast room's rubble; the word; through | W |
| 14 | 67 | `b-14.B` | lower way | · | from its head, the lit way going down | W |
| 14 | 68 | `pl-w14-deep-niche` | Salt Gallery | E | at camp: past the lone ring, the deep niche | R |

Weeks: 6, 5, 5, 5, 4, 5, 3, 5, 5, 5, 5, 5, 6, 4 places (68).

### 4.5 The numbers, before → after

| Measure | Before | After |
|---|---|---|
| "Where you are" changes (the frontier; evenings don't move it) | 48 | **19** (18 counting the Stair as one area) |
| … in the first 20 places | 15 | **7** (6) |
| … worst run of 20 | 16 | **9** (the Water's four neighbours, weeks 9–13; every one a told move) |
| A→B→A bounces with no reason | 10 | **0** |
| Evenings at home (shown as evenings, not moves) | — | 18 |
| Every change counted, evenings included | 48 | 36 |
| Moves with no reason on screen (never told + arbitrary) | 38 | **0** (Stage 2's acceptance walk is the proof) |

### 4.6 What changes in the story, and the one retcon (§55)

**Moved between weeks (pl- places only; their sealed things keep their weeks):** `pl-w2-smooth-place` w2→w1; `pl-w4-recess-above-the-cot` w4→w2 (`seal-4-3` still opens from week 4: seen two weeks sooner, the email unchanged); `pl-w5-worn-steps` w5→w4 (physical access only, req `b-3.C`); `pl-w14-mule-stone` w14→w13 (`seal-14-4` still week 14). Their teasers keep their weeks. Ids never change.

**Re-ordered inside a week:** weeks 1, 3, 4, 5, 7, 8, 10, 11, 13, 14 (table above). **Changed data:** `seal-10-3` and `seal-10-4` swap their row order (`o` 3↔4) so the road opens the scar before the standing stone (no sign or record depends on the order); `b-14.1` gains `req: ["b-14.A"]` (its tablet is in the blast room's cupboard, reached in week 14 only through the rubble; WORLD and HEAR settle in week 15 or later either way); `b-14.A`'s stretch `st-blast` → `st-lower`; `st-lower`'s req `b-14.A` → `b-13.B`; `pl-w14-meeting` req → `["pl-w13-lower-gallery"]`; `b-14.A` req → `["pl-w14-meeting"]`; `b-14.B` req → `["b-14.A"]`. Places get the `kind` field of §4.2.

**The retcon (MASTER_BRIEF §55): how the lower way is first reached.**
- *Conflict.* Canon (ARR3 14.A/14.B, STORY_JOB §8.3 week 14) has Dan clear the blast room's far fall with STONE-MOVE and go through to the lower way, with the lower gallery joining it later. But week 13 already lifts the square gallery's fall, and the lower gallery behind it runs on to rounded stone (its own line; week 13's close says it runs towards the blast room's far side). Sending Dan back round by the blast room is the incoherent move `#45`–`#47`.
- *Options.* (a) Keep the order and add an obstacle at the lower gallery's end (invents a new physical fact to force a detour: rejected, it is exactly "forcing"). (b) Keep the order, say nothing (the audit's finding). (c) **Reverse the approach:** the lower gallery leads to the lower way (`pl-w14-meeting`); Dan walks up it to its head, which is the far face of the blast room's rubble; he cuts the same word there (`b-14.A`), the rubble settles aside, and he steps through into the blast room and looks back (the painting `pt-b-14.A` is already drawn from the blast room's side: the parted fall, the scar going on into rounded stone, the low blank); `b-14.B` is then the lit way going down, seen from its head (its painting is drawn from the top). **Chosen: (c).**
- *What stays.* Every fact: the word, the fall, ECHO's blank low on the scar (`seal-14-3`, seen), the lit cups no one lit, the cold air, the meeting of the two ways, the tall door at the lower way's end, week 15 on. The paintings need no redraw (§4.7). Only the direction Dan first walks it changes, and the blast room becomes the short way home from week 15.
- *Files (Stage 2).* `ARRIVALS_REGION3.md` 14.A, 14.B (and the week's notes); `STORY_JOB.md` §8.3 week 14; `MVP_CONTENT.md` route; `beats.ts` `b-14.A`, `b-14.B`, `pl-w14-meeting` lines and taps; `weekclose.ts` `wc-w14-1`; `PAINTING_BRIEFS.md` (camera notes only).

**Set up, not added:** the bench apart (`b-13.C`) is mentioned for the first time at `pl-w9-benches` (one sentence: one bench stands apart from the rest), so its turn-off in week 13 points back to something seen. No new thing: the bench is already canon (ARR2 13.C "the second bench, across the Water").

**Rule checks (rule 6, D-079, D-129, D-142):** nothing planted moves later than its payoff (every cross-week move is earlier, every in-week move keeps its payoffs in later weeks); no clue in `CLUE_LEDGER.md` names a moved place's week except C-68 (`pl-w11-far-end`, unchanged week); nothing plays in an area Dan hasn't been (evenings are home, visited from week 1; turn-offs are to areas walked before); road rows and Key niches as before, with the one `o` swap; no sealed thing opens before its week.

### 4.7 Paintings

No new painting is needed. Every place keeps its own. `pt-b-14.A` (drawn from the blast room side) and `pt-b-14.B` (from the lower way's top, looking down) already match the reversed approach; `pt-pl-w14-meeting` is drawn from the lower way through the opening into the gallery, which is the look back as Dan steps out. Each area's **establishing picture** (§5.2) is its first place's painting.

## 5. How the app shows location (the design)

### 5.1 One naming rule

- **Area · place**, everywhere both are named: "The Salt Gallery · the pick niche". The area name is the stretch's display name, one form only (the drifting `where` prefixes are derived from it, not typed).
- **No place shares its area's name.** Place names become place-level: `b-1.A` "the near end" (where the pipe comes in and the lamp stands), `b-1.C` "her cot", `b-8.A` "the last step", `b-9.A` "the first tablet", `b-8.C` "the niche with no back", `b-14.B` "the lit way down", `pl-w12-square-way` "the low doorway", `pl-w6-square-gallery` "the long straight"; camp views `cv-19`, `cv-20` likewise. (Names in the Cut's voice rules: drawable things, plain; final wording in Stage 2's language pass.)
- **Niche rows are named as things, not places**: "the pick niche" is a niche (with its count), shown in its own list, never in the places list.

### 5.2 Screens

- **Today's title** is the **area** (big carved title; it changes only when Dan moves area), with the **place** under it in the small line ("at the pick niche"). It keeps the frontier during evenings. Tapping it re-reads the last place; it gets the same tap affordance as every other "read again" link.
- **Arrivals have three faces**, one per kind:
  1. **A new area**: label "A new area", the area's name as the carved title, its way-in line, then the place's name and scene (the area's first place's painting is the area's picture).
  2. **On, in the same area**: label "Arrived", "The Salt Gallery" small above, the place as the title.
  3. **An evening**: label "Tonight, at camp", "The Salt Gallery · the tally's head" as the title line, the lamp-lit painting; then the camp line as now. A turn-off uses face 2 with the area named ("Back in the square gallery").
- **The Map** (one map, D-092): the areas drawn as the descent (home at the top, the Box Room and the Salt Gallery drawn attached to the Lamp Hall, the Stair as one line down, the branches off it), **camp marked** by the lamp at the Lamp Hall's ledge, **where you are** marked separately. Tapping an area opens its box: the area's name; **every place in walk order, the current one included and marked**, then its niches in their own list. All rows share one row style: name, state ("here", "read again", "needs a Key", "use a Key"). The next place is marked on its area whether walked or not. The places come first so they are always in view.
- **The delve and the road line**: "Further into the Salt Gallery" when the next place is in the same area; "On down" when it is in a new one (never the next place's name before it is reached; the job-return screen's back arrow says "Arrive" instead of the name).
- **Welcome back, the lock screen, the Live Activity, the Daybook**: "Area · place". The Daybook's places are tappable like everywhere else.
- **Records' `where`**: "Area, thing", derived.
- **A day that ends short of a place**: "Where you turned back today: …" (the camp view), then the bedtime line by the lamp.
- **The Stair screen** (after the first word) becomes face 1, "A new area: the Stair".

### 5.3 Data the screens need (Stage 2)

Per place: `kind` (`on` / `enter` / `evening` / `turn`), a short place name. Per area: display name, its way-in line (one plain sentence: how you get there from camp; e.g. "Down the Stair, past the second lintel, to the Water."), its parent for the Map (the Box Room → the Lamp Hall), its position on the drawn descent. The two Stair stretches share one display area.

## 6. "The Survey Cut", renamed

**Chosen: the Box Room.** Her camp's own first line already calls it that ("a small side chamber, like a box room"); it says plainly what it is, a small room off the hall full of someone's things (her tin box, the box by the cot, her folder); it is a drawable place, not a job title; it never collides with Dan's own camp by the lamp (which "her camp" would); it gives nothing away.
**Runner-ups:** *Her Room* (warm, and true from her first sheets, but "her" in a place name leans on a person before week 1 has shown one); *The Side Room* (plainest of all, but too close to "the side gallery" of week 12).
"Camp" in the app stays Dan's: the lamp on the ledge.

## 7. Dan's save

- Facts store place ids; no id changes. Places played stay played; the new order applies only to what is not yet played. Nothing replays (a played id is never offered again).
- "Where you are" is the last **non-evening** place played, so an old save whose last place is in the salt (an evening now) shows the frontier it was really on, never a teleport.
- Places moved to an earlier week that an old save has not reached come next, as evenings or as the next place on the way, with their reason sentence (true whatever came before, because reasons point at what Dan has learned, which their `req` guarantees). Lines never assume the previous place (§4.2).
- The no-skip rule: an old save holding a skipped place (e.g. week 5's `b-5.A`) simply plays it when its bits have played.
- Stage 2 proves it on every sample save (`app/tests/saves`, `app/tests/flows/saves`: weeks 1–2, 1–3, 1–14) and on saves built under the old route at every stop point in weeks 1–6 (each place, mid-week and at week ends), walked on to week 14: no stall, no replay, no move without its reason, "where you are" never jumps backwards.

## 8. Stage 2: the acceptance test

1. **Rule tests:** every route `req` met by an earlier place or an on-the-way bit; every move between areas has a kind and, for evenings and turn-offs, a reason sentence; "where you are" changes ≤ 19 over weeks 1–14 and never A→B→A without a turn-off; the old-route saves walk on cleanly; the existing continuity, road, pace and week tests stay green (expected numbers updated only where the order changed, each named).
2. **The real playthrough:** a fresh save walked through all 14 story weeks in the built app (Playwright, 390 × 844), capturing at every arrival the arrival screen, Today's title and the Map. Then the same from saves at Dan's possible points under the old route (every week end, weeks 1–6, and mid-week in weeks 2–4).
3. **The judge:** a fresh reviewer with no part in this design reads the whole captured journey as a player and judges every move: *do I know where I am; do I know why I moved; does each area read as a place with places inside it?* Any move that fails is fixed and the walk runs again, until every move passes. The verdicts are kept (sealed where they quote story).

## 9. Stage 2: the work, in order

1. **Sealed docs** (authoritative first): `MVP_CONTENT.md` §0.2 (the rules: no skipping, evenings, kinds), §0.3 (areas and joins), §1 (the route), §2 (place names); `STORY_JOB.md` (a §9 record of this job); `ARRIVALS_REGION1/2/3.md` (week columns of moved places, the rewritten lines); `NICHES.md` (the `o` swap); `PAINTING_BRIEFS.md` (camera notes, the Box Room); `SITE.md`, `LOCATIONS.md` (the name); `CLUE_LEDGER.md` (place names).
2. **Lines** (to `WRITING_PROCESS.md`, two cold-reader rounds): about 20 reason sentences (evenings and turn-offs), about 12 sentences that assumed the old place before, the three week-14 rewrites and `wc-w14-1`, the bench apart's set-up, 11 area way-in lines, about 10 place names, every "Survey Cut" (≈ 40 lines in content, plus open design docs).
3. **Content data:** `route.ts`, `beats.ts` (w, o, req, stretch, kind), `seals.ts` (`o` swap), teasers' weeks unchanged.
4. **Engine:** where-you-are ignores evenings; evening places play last in a day's batch; home steps held for the evening; no skip across areas; the arrival's face from `kind`.
5. **UI:** Today's title, the three arrival faces, the Map's drawn descent and box, the row style, the road and delve labels, Welcome/lock screen/Daybook/records naming, the turned-back line, the Stair screen.
6. **Tests and the acceptance walk** (§8), then the fresh adversarial review, then Dan.

**Size:** the largest change since weeks 8–14: about two days of focused work for the build and tests, plus the writing process for ~100 lines and the judge's loop. One branch, one PR, Dan's OK before merge.

## 10. Risks and open points

- **Evenings make the top busy at night**: 18 evenings in 68 places, 4 in a row in week 4 (the frontier waits at the first turn while week 4's story is at home: her Day 9 sheet, the salt block, the Lower Door). It is the story's own pause, not a wall; the judge will say if it reads as staying put.
- **The Water's four neighbours** give the worst run (9 changes in 20 places, weeks 9–13). Each is told; the alternative (long stays) would put story beats far from where they are found.
- **Five places in week 1 → six**, week 14 → four: within the pace the tests allow; the pace tests are re-run.
- **Home steps held for the evening** change how many story bits a job's return shows between jobs in weeks 3–14 (fewer; passage lines fill as now). The pace probe is re-run.
