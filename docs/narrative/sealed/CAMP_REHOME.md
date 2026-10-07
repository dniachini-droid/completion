# Camp where you are (D-160): the re-homing design — SPOILERS

> **Sealed (D-015). Dan must not read this.** What happens to every scene, reading, lock, line and view set at the top (the Lamp Hall, the Salt Gallery, the Box Room) that could play after the way down opens, now that Dan camps wherever he presses sleep and never goes back to camp. Supersedes the evening model of D-154/D-155/D-159 (`ROUTE_REDESIGN.md` §4.2, §12, §13) for weeks 1–14. The truth, the ending and the sign order are unchanged; the geography changes listed in §6 follow MASTER_BRIEF's retcon procedure (conflict → why → options → choice → files).

_Written 2026-10-07 for D-160, from the content on `claude/camp-where-you-are` (route, beats, seals, camps, finds, passages, teasers, week close) and the simulated inventory of what plays at the top after `b-3.A`. Revised the same day after an independent check (§7, which overrides anything above it); built in `app/src/content/sealed/`._

---

## 0. The shape in one paragraph

The top is finished before Dan leaves it. Week 3 becomes **the lit top**: the first word lights the hall; Dan walks the salt by the new light, the crust over the tally opens and bares it to its end, and he **copies the whole tally** (and the lamp's base and the wall by the lamp) onto blank sheets from her pile, takes **her dated sheets, her notebook and her folder**, and looks at the great door close. Week 4 opens with the step through the lintel: **departure**. From then on the top's readings travel with him (his copy, her sheets, her notebook), the one lesson-tablet that was at the top (OPEN, EAT) is found in the square gallery instead, and the great door is **not opened in weeks 1–14** (§7.1): the steep stair at the Water's far shore climbs into the dark and poses the question, and the door opens on the later, story-driven return to the top (§6 Q1). No story moment sends him back to the top. The only trips up are two told returns within the journey (weeks 11 and 13; the week-10 one is gone, §7.2), each for a reason on screen, and a Key used on a lock left at the top, which is the player's own choice and is said on screen.

## 1. The principle for each family

| Family | Principle |
|---|---|
| **Departure** | Departure = the first arrival through the lintel, `b-3.B`, which moves to the head of route week 4. Week 3 is all at the top. Everything at the top that needs nothing from below plays in week 3. |
| **Tally readings (the salt)** | The tally is read **from Dan's copy** after departure. Planted: `b-3.5` (the crust opens; the rest of the tally is bare to its end, so nothing of it stays hidden) and `b-3.6` (Dan copies every cell of it, small strokes, pictures and the fingernail cross included, "most of it you cannot read yet", and takes her dated sheets). Each later reading keeps its week, its id and its confirmations, and becomes a `portable` step: "you take out your copy…". A record still shows only at its reading beat (no record is shown at the copying), so the revelation map holds. Her sheet against his copy replaces "her sheet against the salt". |
| **Salt niches and locks** | Locks on the salt that the copy needs (the crust) open **before departure, on the road** (`seal-5-2` → w3; `seal-12-2` folded into it). Key niches in the salt that were placed late (the hollow, the deep niche) are **brought into view in week 3 and become week-3 Key niches**; their filler places are cut (they were niche-fillers, ROUTE_REDESIGN §2.5 cause 2). The salt block (a road row) plays in week 3 as a step. |
| **Lamp Hall: lamp, wall, great door** | The lamp's base (K1) and the wall by the lamp (L1) are **copied** at `b-3.6` with the tally (week 3; §7.3), so every later night-thought about them reads true wherever Dan is. The great door is seen **whole and close in week 3** (`b-4.C`, which absorbs `pl-w3-far-end`). It is **not opened in weeks 1–14** (§7.1); `b-7.C` is retired. The ledge's underside niche comes into view in week 3 (`b-3.6`). |
| **The Box Room** | Played out in week 3: her notebook (already carried from `b-3.2`), **her folder taken with him** (`b-3.7`; its slate count travels like the notebook's back pocket already does), the recess above the cot seen and made a week-3 Key niche. Her dictionary (a week-4 slate) is found where she left it on the way down, at the second landing. |
| **Her notebook** | Unchanged (D-155): `portable` from Day 9. `b-3.2` (Day 6, the moment he takes it) plays before departure. |
| **One lesson-tablet** | The OPEN/EAT tablet (`seal-6-1`, `b-6.2`) moves from behind the salt crust to **a niche at the join in the square gallery** (week 6, beside the crew's records that say *he eats not with us*). It is the only sign-carrying row that was at the top after departure; every other tablet was already on the way down. |
| **Weekly camp lines (`b-wN.camp`)** | **Location-neutral night thoughts.** The sleep screen's first line says where he camps (§1, "camp views"); the week's camp line follows as what he thinks about before sleep. Lines that described the lamp, the wall or the door as seen now recall them (from his copy, or as the lamp left burning at the top). None says "by the lamp", "climb back", "at camp". |
| **Mornings (`b-wN.morning`)** | Already thoughts; made fully location-neutral (her sheet is carried; the wall by the lamp is in his copy). Confirmations unchanged. |
| **Camp views (`camps.ts`)** | **Where he camps tonight.** Rule: if he presses sleep less than half a place-gap (75 min) after reaching a place, he camps at that place (its name and painting, no view needed); otherwise at a view of his stretch, the stretch's own first, never another stretch's. Every stretch keeps at least two views; seven new views (§3.3). Views at the top end at departure (`until: b-3.B`). Every view is reworded from "you turn back / before heading back to the lamp" to camping there. |
| **Finds** | A find is only ever from the stretch Dan is on, and **never from the top after departure** (engine: `pickFind` stops walking back up into the top). The three top finds that pay off later moments are planted in week 3; the rest are optional texture (`CLUE_LEDGER` C-67 rule) and simply not given if not met. |
| **Passages** | No change: top passages show only on the top's stretches, and Dan is never there after departure. |
| **Teasers** | A teaser never points back up. Every teaser about a thing at the top ends at departure (`until: b-3.B`); those about moved things are re-keyed (§2.6). |
| **Keys for locks left at the top ("still locked, further back")** | **Kept, as a return the player chooses.** A Key used on a lock at the top (or anywhere behind him) plays a short errand screen: *"You go back up to {area} for it."*, the lock's contents, *"Then back down to where you were."* It does not move where Dan is, plays nothing else (no view, find, passage), and the game never prompts it (no teaser, no morning line; Today's list stays a quiet list, worded "Back up the way you came"). Why: the contents are optional by rule (NICHES: "nothing in a niche is required for the story"), but Keys are earned and a seen lock is a promise; stranding them would punish, and opening them free on the road would devalue Keys (rule 10). The reason is the player's own and is on screen (D-160 point 6). In week 4 the top is one flight behind him, so most such errands are short. |
| **Returns within the journey** | Each kept only with a reason on screen; "on the way back up [to camp]" is gone from every line. Turn-offs are labelled **"Back up"** (not "On the way back"). Kept: `pl-w11-far-end` (the log's tall man → where something stood), `b-13.B` (the shut door's record, the second's, speaks of moving stone → the fall at the end of the second's gallery; this trip goes on down into the new descent). **Cut** (§7.2): the week-10 trip (`pl-w10-deep-end`); the deep end is reached once, at `b-13.B`, and `b-10.B` becomes a step there. `pl-w14-mule-stone` is cut; its sighting is folded into `b-13.B`. |
| **Way-in lines (`route.ts` `wayIn`)** | Rewritten as how Dan gets there **from the area next to it**, never from camp ("Out into the Lamp Hall, where you sleep by the lamp" goes). |

## 2. Every item

Kinds: P place on the route, S step (`step`/`stepKey`), K Key niche, R road row, V camp view, F find, T teaser, C camp line, M morning, W week close / learned / so-far / question line. Decisions: **a** before departure · **b** travels · **c** relocated · **d** justified return · **e** cut · **f** location-neutral. "Copy" = Dan's copy (`b-3.6`); "sheets" = her dated sheets, taken at `b-3.6`.

### 2.1 Places at the top after `b-3.A`

| id | kind | now | dec. | where / how | needs / changes | risk |
|---|---|---|---|---|---|---|
| `pl-w3-salt-lit` | P | salt, w3 (evening) | a | Route w3, 2nd place, on foot: walks to the salt to see how far the light has reached | Line: drop "one evening"; reason is the light round the corner | low |
| `pl-w3-far-end` | P | hall, w3 (evening) | e | Merged into `b-4.C` (first the door whole, then close) | `tz-w3-b` req → `b-4.C`; `cv-04` unaffected; `pt-pl-w3-far-end` retired (or used as `b-4.C`'s first look) | low |
| `b-4.C` | P | hall, w6 (evening) | a | Route w3, 3rd place, on foot; w → 3 | req `b-6.A` → `b-3.A`; line: opens with the door whole by the new light (from `pl-w3-far-end`), then close; drop "with the square gallery's record…in mind" | low (C-05/C-23 earlier; fine) |
| `b-4.A` | P | salt, w4 (evening) | b | Portable step, w4, on the Stair: "you take out her sheet dated Day 9…" (S4 through her sheet) | kind arrival → step, `portable`; req + `b-3.6`; crust/lone-ring walk moves to `b-3.5`; inView `seal-5-2` → `b-3.1`; `pt-b-4.A` unused | low; S4 keeps week 4 |
| `b-4.B` | P (K, road) | salt, w4 (evening) | a | Step (`stepKey`, road) in w3: the salt block past the split | kind arrivalKey → stepKey; w → 3; `seal-4-2` w3, ordered before `seal-3-1`; drop "Back at camp after dark"; `pt-b-4.B` retired | low |
| `b-5.A` | P | salt, w5 (evening) | b | Portable step, w5: the formula at the head of every record, read in the copy; confirms ONCE | kind → step, `portable`; req `seal-5-1`, `b-3.6`; choices → "Reread your copy from the start" / "Look at your copy of the wall by the lamp"; `pt-b-5.A` unused | low |
| `pl-w6-folder` | P | Box Room, w6 (evening) | e | Place cut; the folder is taken at `b-3.7` (§3) and travels | `seal-6-5` → w3, `portable`; `tz-w6-b` rewritten (§2.6) | low |
| `b-7.C` | P (word, road) | hall, w7 (evening) | e (§7.1) | **Retired.** The great door is not opened in weeks 1–14; the steep stair poses the question at `pl-w8-steep-foot`; the door opens on the later return to the top (§6 Q1) | `seal-7-5` seen-only (no Key, no road); `b-w7.camp`, `b-w7.close`, `wc-w7-2`, `aw-w7`, `b-w7.tz2`, `b-w4.close` rewritten; `b-8.A`, `pl-w8-steep-foot`, `ps-w07`, `b-w8.camp` no longer say "from the great door" | none (it carried only the word) |
| `b-8.B` | P | salt, w8 (evening) | b | Portable step, w8: the copy's first line, the plain hooks and the small strokes beside them; confirms ONE and numbers | kind → step, `portable`; req `seal-8-1`, `b-3.6`; line: "In your copy…" (the strokes were copied without knowing why); `pt-b-8.B` unused | low |
| `b-9.B` | P | salt, w9 (evening) | b | Portable step, w9: her Day 9 sheet laid beside his copy of the same stretch: in his copy, after *held*, a cross; on her sheet nothing; confirms NOT | kind → step, `portable`; req `seal-9-1`, `b-3.6`; choices → "Read your copy further" / drop "Go back to the square gallery"; `b-w9.tz1` rewritten; `pt-b-9.B` unused | low (the turn keeps its week and its partner records) |
| `pl-w4-hollow` | P | salt, w10 (evening) | e | Place cut; the hollow is seen in week 3 at `b-3.6` | `seal-4-5` → w3 (in view via `b-3.6`); `tz-w4-a` req → `b-3.6`, `until` `b-3.B` | low |
| `b-12.B` | P (K, road) | salt, w12 (evening) | b | Portable step, w12: the tally's end, read in the copy (S8) | kind → step, `portable`; req `seal-12-1`, `b-3.6`; `seal-12-2` cut (§2.3); line drops the crust falling away; `pt-b-12.B` unused | low (S8 still pairs with week 13's dark door) |
| `pl-w4-recess-above-the-cot` | P | Box Room, w12 (evening) | e | Place cut; the recess is seen at `b-3.7` | `seal-4-3` → w3; `tz-w4-b` req → `b-3.7`, `until` `b-3.B` | low |
| `pl-w5-ledge-lip` | P | hall, w13 (evening) | e | Place cut; the notches under the ledge are seen at `b-3.3` (on his knees copying the base) | `seal-5-5` → w3; `tz-w5-a` req → `b-3.3`, `until` `b-3.B` | low |
| `pl-w14-deep-niche` | P | salt, w14 (evening) | e | Place cut; the deep niche is seen past the tally's end at `b-3.6` | `seal-14-5` → w3; `tz-w14-b` → w3, req `b-3.6`, `until` `b-3.B` | low |

### 2.2 Steps at the top after `b-3.A`

| id | kind | now | dec. | where / how | needs / changes | risk |
|---|---|---|---|---|---|---|
| `b-3.1` | S | salt, w3 | a | As now (S3; confirms PERSON, ME) | inView + `seal-5-2` (the crust ahead) | none |
| `b-3.2` | S | Box Room, w3 | a | As now (Day 6; he takes the notebook) | — | none |
| `b-3.3` | S | hall, w3 | a | As now: the lit lamp's base (K1); req `b-3.B` → `b-3.A`. **The copying, C-57 and the ledge's notches go to `b-3.6`** (§7.3), so a save that played `b-3.3` before still gets them | req; o3 | none |
| `b-4.3` | S | Box Room, w4, portable | b | Unchanged | — | none |
| `b-4.4` | S | salt, w4 | b | Portable, w4: in the copy every entry ends with the same mark, also on the lamp's base; her sheet's *signature?*; the wall's hook is not this hook | `portable`; req + `b-3.6` | low (hand-mark keeps week 4) |
| `b-5.2` | S | Box Room, w5, portable | b | Unchanged | — | none |
| `b-5.3` | S (road) | salt, w5 | b | Portable, w5: the stretch that was under the crust, in the copy (S5); confirms GIVE (provisional) | kind stepKey → step; seal removed (its count opens at `b-3.5`); req `b-5.A`, `b-3.6`; line keeps the landing's tablet as a memory | low |
| `b-6.1` | S | Box Room, w6, portable | b | Unchanged | — | none |
| `b-6.2` | S (road) | salt, w6 | c | **Square gallery**, w6: a niche low in the rounded stone just before the join, its count fills; the tablet (doorway / two drops parted; loaf / hook closed on a drop over a bar) | stretch → `st-square`; req `seal-5-2`,`b-4.C` → `b-6.A`,`b-4.C`; `b-6.A` inView + `seal-6-1` (new niche, **new physical feature**); line drops the salt crust and "past the tablet, the tally carries on"; `seal-6-1` loses `rec-s6` (read at `b-7.2`) | low; order kept (after `seal-5-1`, before `seal-6-2`, `seal-7-1`) |
| `b-7.2` | S | salt, w7 | b | Portable, w7: past the crust, in the copy: the barn and the owl (S6); confirms UP, CHILD | `portable`; req + `b-3.6`; `rec-s6` first shown here | low |
| `b-8.3`, `b-9.1`, `b-10.3`, `b-11.3`, `b-12.2`, `b-13.2` | S | Box Room, portable | b | Unchanged | — | none |
| `b-9.3` | S | salt, w9 | b | Portable, w9: the copy's next stretch (S7: the old man, the crack) | `portable`; req `b-9.B` | low |
| `b-14.4` | S (Key) | salt, w14 | a | Week-3 Key niche: the deep niche (S9) | w → 3; req `b-3.5`; no partial reading written in (S9 renders mostly as pictures if opened in week 3 and fills in on the records screen as signs come; a Key used on it from below is the player's own trip back up, §7.4) | low |

### 2.3 Locks (seals) at the top

| id | kind | now | dec. | where / how | needs / changes | risk |
|---|---|---|---|---|---|---|
| `seal-1-2`,`1-3`,`1-6`,`2-2`,`2-3`,`2-5`,`2-6`,`3-4`,`3-5` | K | top, w1–3 | a / d (player) | Open with Keys before departure; any left shut: the player's Key errand (§1) | errand screen; teasers `until: b-3.B` | low |
| `seal-4-2` | R | salt, w4 | a | Opened by `b-4.B` in w3 | w → 3, `o` before `seal-3-1` | low |
| `seal-4-3` | K | Box Room, w4 | a | In view at `b-3.7` | w → 3 | low; X-colleague (her name) first possible w3 |
| `seal-4-4` | seen | hall, w4 | a | Seen at `b-4.C` (w3) | w → 3 | none |
| `seal-4-5` | K | salt, w4 | a | In view at `b-3.6` | w → 3 | low |
| `seal-4-6` | K | Box Room, w4 | c | **The second landing** (`st-flight2`), w4: a slate low on the wall at the landing's foot, over her dictionary, left where she lightened her load going down (her foil blanket at the Stair's head is the precedent) | stretch → `st-flight2`; in view at `pl-w5-second-landing`; NICHES 4.6 row; **new placement** | low |
| `seal-5-2` | R | salt, w5 | a | Opened by **new `b-3.5`** in w3; the crust now runs from past the lone ring to the tally's end (one crust, one count) | w → 3, `o` before `seal-3-1`; `beat` → `b-3.5`; no record shown | low |
| `seal-5-4` | K | notebook pocket, w5 | b | Already carried (notebook) | `portable` flag; caption "her notebook's back pocket" | none |
| `seal-5-5` | K | hall, w5 | a | In view at `b-3.3` | w → 3 | low |
| `seal-6-1` | R | salt, w6 | c | Square gallery, w6 (with `b-6.2`) | stretch → `st-square`; carries guess only | low |
| `seal-6-5` | K | Box Room, w6 | b | Her folder, carried from `b-3.7`; opens with a Key wherever he is | w → 3, `portable`; ARR3 15.A (the folder's second pocket, week 15) then works anywhere | low |
| `seal-7-5` | R | hall, w7 | e (§7.1) | Seen-only from now on: the great door's count is seen at `b-4.C` (week 3) and nothing opens it in weeks 1–14 | `seenOnly`; kept for saves that opened it | none |
| `seal-12-2` | R | salt, w12 | e | Folded into `seal-5-2` (the one crust): nothing hidden is left at the top | seen-only, kept for old saves; NICHES 12.2 | low |
| `seal-14-5` | K | salt, w14 | a | In view at `b-3.6` | w → 3 | low |

Week 14 and week 12 each lose a row (`seal-14-5`, `seal-12-2`); week 3 gains five; week 4 has two rows (`4-1` road, `4-6`). Surplus Keys in weeks 4–6 meet the week-3 locks just behind him (the errand), or are held (D-079).

### 2.4 New planted moments (all steps, week 3, before departure; none is a place)

| new id | where | what it plants |
|---|---|---|
| `b-3.5` | salt, w3; req `b-3.1`; `stepKey` `seal-5-2` | Past the lone ring the carving goes under a crust of salt with notches (moved from `b-4.A`); the notches fill and the crust falls away along the wall; the tally runs on to its end, then bare salt to the floor. No reading; no record shown. (`fd-c15` can follow.) |
| `b-3.6` | salt, w3; req `b-3.5` | **Dan copies the tally**: every cell, with her pencil, on blank sheets from the bottom of her pile, the small strokes beside the plain hooks, the pictures, a fingernail-sized cross, "most of it you cannot read yet"; he takes **her dated sheets** with him. In view on the way: the hollow (`seal-4-5`; its four small pressed feet, from the cut place) and, past the tally's end, the deep niche (`seal-14-5`). |
| `b-3.6` (the hall part; was `b-3.3` extended) | salt → hall, w3 | He copies **the lamp's base and the wall by the lamp**; the carved lamp's cuts are sharp-edged (C-57); the ledge's underside notches (`seal-5-5`) (§7.3). |
| `b-3.7` | Box Room, w3; req `b-3.2` | **He packs her folder** (HILL on its spine, a slate count on its cover: he takes it, slate and all) and sees the recess above the cot with its slate and the empty drawing pin (`seal-4-3`, from the cut place). |

The route's week 3 is then `b-3.A` · `pl-w3-salt-lit` · `b-4.C`, with steps (in order) `b-3.1`, `b-3.3`, `b-4.B`, `b-3.2`, `b-3.5`, `b-3.6`, `b-3.7` (and the Key niche `b-14.4`). Week 4 is `b-3.B` (departure) · `b-3.C` · `pl-w5-worn-steps` · `pl-w5-second-landing`. Because `b-3.B` is in route week 4, it cannot come before week 3 is done (`weekDone` needs week 3's steps), so Dan never leaves before the copy and the packing; and the road rows `seal-4-2`, `seal-5-2` (week 3, o1–o2) come before `seal-3-1`, which moves to week 4 o1 with `b-3.B` (a week-3 row opened only by a week-4 place would hold week 3 open for ever). A long day plays the remaining week-3 steps on the way (D-129), at the top, before the step through the lintel.

### 2.5 Camp lines, mornings, closes

| id | dec. | change |
|---|---|---|
| `b-w1.camp`, `b-w2.camp`, `b-w3.camp` | f | Even at the top he may camp in the salt or her room: each becomes a thought ("before you sleep you think of the lamp…") or keeps its sight only by naming it as remembered. `b-w3.camp` keeps the lit hall and the glow on the salt as a memory of the day. |
| `b-w4.camp`, `b-w5.camp`, `b-w9.camp`, `b-w13.camp` | f | The lamp's base, from his copy ("on your copy of the lamp's base…"). |
| `b-w6.camp` | f | Recalls the carved lamp's sharp cuts (seen at `b-3.6`, §7.3), so L8 that week pays it (C-56, C-57). |
| `b-w7.camp` | f | req `b-7.A` (§7.1): the second lintel's stone gone and the Stair going on down; morning: the Stair going on past the second lintel. |
| `b-w8.camp` | f | "climb back to the Lamp Hall" goes; the still flames on the Water, or the cold air from the steep stair. |
| `b-w10.camp` | f | "climb back… powder smell as high as the second landing" goes; the powder smell where he lies. |
| `b-w11.camp` | f | His copy of the base's bar with a tick beside the same bar on the ledge's lip by the book (better than before: he is near it). |
| `b-w12.camp`, `b-w14.camp` | f | Already thoughts; drop "you sleep in the Lamp Hall". |
| `b-w4.morning` | f | "go to the wall by the lamp" → his copy of the wall: its last hook is not closed on a dot. Still confirms DEEP. |
| `b-w8.morning`–`b-w14.morning` | f | Drop place words ("in the Salt Gallery"; her sheet is carried). Confirmations unchanged. |
| `b-w3.close` | f | Week 3 now ends at the top: the opening under the lintel lit, the landing beyond, a stair going down (until `b-3.B`). Its current text (halfway down the top flight) moves to `b-w4.close`'s slot, req `pl-w5-worn-steps`, until `b-4.1`. |
| `b-w4.close` | f | Replaced as above (it crossed the Lamp Hall). |
| `b-w7.close` | f | req `b-7.A`, until `b-8.A`, stretch `st-flight2`: below the second lintel the Stair goes on down to water that does not move (§7.1). |
| `wc-w7-2`, `aw-w7` | f | Rewritten on `b-7.B` (the twelve rings and the thirteenth; the beginner's tablet) (§7.1). |
| `wc-w4-1`, `wc-w5-1`, `wc-w12-2`, `sf-m3-2`, `sf-m4-4`, `sf-m2-5` | — | Facts learned; unchanged (their beats keep their weeks; `sf-m2-5` earlier). |

### 2.6 Teasers, finds, views, way-in lines

| id | dec. | change |
|---|---|---|
| `tz-w1-a`, `tz-w1-b`, `tz-w1-c`, `tz-w2-a`, `tz-w2-b`, `tz-w2-c`, `tz-w3-c` | a | + `until: b-3.B` (never point back up) |
| `tz-w3-b` | a | req → `b-4.C`, `until: b-3.B` |
| `tz-w4-a`, `tz-w4-b`, `tz-w5-a`, `tz-w14-b` | a | w → 3; req → `b-3.6` / `b-3.7` / `b-3.3` / `b-3.6`; + `until: b-3.B` |
| `b-w6.tz2` | c | "In the square gallery, on the tablet in the niche by the join, a loaf…" |
| `tz-w6-b` | b | "In her folder, under the slate…" (req `b-3.7`, until `seal-6-5`) |
| `b-w7.tz2` | c | req `b-7.A`, until `b-8.A`: past the second lintel the Stair goes on down through light already burning (§7.1). |
| `b-w8.tz2`, `b-w9.tz1` | b | "In your copy of the tally…" |
| `fd-b03`, `fd-d10` | a | w → 3, req `b-6.1` → `b-3.A` (pencil grid under the carved lamp; her tallies above the cot): planted before L8, paid by it |
| `fd-c15` | a | w → 3, req `b-12.B` → `b-3.5` (the scuffed salt at the tally's end) |
| other top finds (`fd-b*`, `fd-c*`, `fd-d*`) | a / e | Given only before departure; any not given are not given (optional texture; told lines among them are optional by the C-67 rule) |
| `cv-04`, `cv-05`, `cv-06`, `cv-07`, `cv-09` | a | + `until: b-3.B` (`cv-03`, `cv-08` already end earlier) |
| `cv-01`–`cv-21` | f | Reworded to camping there ("you turn back today" / "before heading back to the lamp" go). `cv-20`'s "up towards the rubble" stays. |
| new `cv-22`–`cv-32` | new | See §7.6 (eleven views; stand-in paintings). |
| `wayIn` of all stretches | f | From the neighbouring area, never from camp; `st-hall`'s "where you sleep by the lamp" goes |

### 2.7 Returns within the journey (turn-offs, "back again")

| id | now | dec. | reason on screen (kept or new) | after |
|---|---|---|---|---|
| `b-7.B` | square gallery, w7 | keep | within the area | as now |
| `pl-w10-deep-end`, `b-10.B` | square gallery, w10, turn-off | e (§7.2) | Cut: the deep end is reached once, at `b-13.B`; `b-10.B` becomes a stepKey (w13) after the cut | `pl-w11-cupboard` no longer says "back in" |
| `pl-w11-far-end` | Water, w11, turn-off | d | the log's tall man with a lamp, and what stood at the far end in week 8 ("On the way back up" goes) | on to `b-11.B`, `b-13.C` across the Water; `b-12.A` back down to read on in the log |
| `b-11.B`, `b-12.A`, `pl-w9-approach`, `pl-w11-cupboard` | — | keep | already give reason and way | — |
| `pl-w14-mule-stone` | square gallery, w13, after `b-13.B` | e (§7.4) | Cut; `b-13.B` passes the mule-shoe's stone and sees the notches (`seal-14-4` in view) | `tz-w14-a` req `b-13.B` |
| `b-13.B` | square gallery, w13, turn-off | d | The shut door's record opens with two drops, like the square gallery's, and speaks of moving stone; the square gallery ends in a fall: he goes back up to it, finds the standing stone and its blank, and cuts (§7.2) | through the fall: `b-10.B` (V5), `pl-w13-lower-gallery`, the slope, the lower way (the trip up leads on down) |
| turn-off label | "On the way back" | f | → "Back up" | — |

## 3. Pacing

_Superseded in part by §7.5 (as built: 52 places on foot; weeks 8, 10, 13 and 14 lose a place each)._

Places on foot (the walking meter; evenings never cost minutes, so this is the fair comparison): **before 53 → after 56** (+3: `pl-w3-salt-lit`, `b-4.C`, `b-7.C` were evenings and are now walked to). Listed places: 68 → 56 (11 evenings cut or made steps; `pl-w3-far-end` merged).

| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| On foot before | 6 | 4 | 4 | 1 | 1 | 4 | 2 | 4 | 4 | 5 | 6 | 4 | 5 | 3 |
| On foot after | 6 | 4 | 3 | 4 | 1 | 4 | 2 | 5 | 4 | 5 | 6 | 4 | 5 | 3 |
| Listed before | 6 | 4 | 6 | 3 | 2 | 6 | 3 | 5 | 5 | 6 | 6 | 6 | 6 | 4 |

- **Thicker:** week 4 (the descent itself now has its places: the head, the top flight, the worn steps, the second landing); week 3 holds seven steps at the top.
- **Thinner (listed):** weeks 3, 6, 12 (−2), 5, 7, 9, 10, 13, 14 (−1). On foot, only week 3 (−1, the Stair moved to week 4); the others lose evenings only.
- **Still thin, not padded (no filler):** week 5 (one place: the gap) carries five steps (`b-5.0`, `b-5.1`, `b-5.A`, `b-5.2`, `b-5.3`); week 7 (two) carries five; week 14 (three). A week cannot end before its steps play, so they set its length.
- **The top lasts longer in effort**: 13 places on foot before departure (was 11), plus seven steps in week 3. The judges should be asked whether week 3 reads as "kept at the top"; it is the price of never going back. Lever if it does: `pl-w3-salt-lit` could become a step (its river stones, C-09, folded into `b-3.5`).

## 4. Rule 6 and the sign order, item by item

**Offers** (guess first shown), in order: LAMP, FIRE (`b-1.3`, `b-1.4`) · PERSON, ONE, ME (`b-2.1`) · GIVE (`b-2.2`) · HERE, DOOR (`b-3.B`, now route week 4; still after GIVE, before DEEP) · DEEP (`b-4.2`) · ONCE, PATH, GO (`b-5.1`) · OPEN, EAT (`b-6.2`, square gallery, after `b-6.A`; road order `seal-6-1` w6 o1 before `seal-6-2`, `seal-7-1`) · UP, STONE, CHILD (`b-7.1`) · SEE, COUNT, DAY, numbers (`b-8.1`; `seal-7-5` is seen-only, §7.1) · NOT · MOVE, WATER · VOICE, SLEEP · TAKE, HAND, GOOD · LONG-SLEEP, MARK · WORLD, HEAR. **Unchanged.** Only HERE/DOOR's story-week label moves 3 → 4 with departure; SCRIPT §6's table notes it.

**Confirmations**, in order: LAMP, FIRE (`b-3.A`) · PERSON, ME (`b-3.1`, w3, at the top) · HERE, DOOR (`b-w3.morning`, the first morning after `b-3.B`) · DEEP (`b-w4.morning`) · ONCE (`b-5.A`, copy) · GIVE (`b-5.3`, copy; req `b-5.A` holds the order) · GO (`b-w5.morning`) · EAT (`b-w6.morning`) · PATH, OPEN (`b-7.A`) · UP, CHILD (`b-7.2`, copy) · ONE, numbers, SEE, COUNT, DAY (`b-8.B`, copy) · NOT (`b-9.B`, copy + her sheet) · MOVE, WATER · VOICE (`b-11.B`) · SLEEP · TAKE, HAND, GOOD · LONG-SLEEP (`b-13.A`) · STONE (`b-13.B`) · MARK. **Unchanged.** Every confirming beat keeps its id and week; four now read from the copy.

**Contexts seen before guesses:** OPEN's doorway and the great door's symbols (`b-4.C`, now week 3, earlier); EAT's loaf (the tablet) and S2's *ate* (week 2); ONCE's setting sun (`b-5.1`) and the formula (in the copy); NOT's cross (in the copy since week 3, unread; her sheet without it). All seen first.

**Records shown before what needs them (req chains walked):**
- S3 `b-3.1` → `b-3.5` → `b-3.6` → every copy reading (`b-4.4`, `b-5.A`, `b-5.3`, `b-7.2`, `b-8.B`, `b-9.B`, `b-9.3`, `b-12.B`): all in week 3, so every later reading has its copy.
- S4 `b-4.A` (w4, her sheet) before `b-4.4` and `b-9.B` (the turn), `b-w9.morning`, `b-w14.morning`. Kept.
- `b-4.C` (w3) before `b-6.2` (w6), which names the door's symbol, and before `sf-m2-5`.
- C-57 (sharp carved lamp, `b-3.6` w3, §7.3) before `b-6.1` (L8, w6) and `b-w6.camp`. Was planted in week 6's camp; now three weeks earlier, still before its payoff.
- K1 copied at `b-3.6` (w3) before every night-thought about the base (w4, 5, 9, 11, 13).
- L1 copied at `b-3.6` before `b-5.A`'s second choice and `b-w4.morning`.
- `b-8.B` before `b-8.3` (L9, the eights; C-39 "seen before L9" holds).
- `b-9.2` (NOT) before `b-9.B`; `b-9.B` before `b-9.3`, `b-w9.camp`. Kept.
- `seal-12-1` before `b-12.B`; S8 (w12) still before week 13's dark door (the pairing, REVELATION_MAP note).
- `b-7.A` (OPEN-WAY, w7) before `b-w7.close`, `b-w7.camp`, `b-w7.tz2`; `b-7.B` before `wc-w7-2`, `aw-w7`; `pl-w8-steep-foot` and `b-8.B` before `b-w8.camp` (§7.1).
- `b-13.A` before `b-13.B` (the deep end, the mule-shoe's notches, the cut) before `b-10.B` (V5) before `pl-w13-lower-gallery` (§7.2).

**Earlier than before (allowed: earlier, never after the truth):** S9 (w14 → 3), X-colleague (w12 → 3), X-sheep (w10 → 3), X-hers-again (w13 → 3), X-neighbour (w4 → 3), the great door close (w6 → 3), the crust's opening (w5 → 3, no reading). None is a prerequisite for anything that moved later. **One thing moves later** (§7.2): V5, week 10 → 13, read at the standing stone the one time Dan reaches it.

**Canon checks:** no fact of any life changes; where a record is cut does not change (the tally is still on the salt wall; Dan reads a copy, like D-155's notebook); the lamp stays on its ledge, lit; the Custodian is never at the top while Dan is there and never behind him (the great door stays shut in weeks 1–14); nothing is locked behind Dan for good (the errand).

## 5. Retcons (MASTER_BRIEF), and the files

1. **Camp is no longer the Lamp Hall for the year.** Conflict: SITE ("Camp… is the Lamp Hall, by the lamp, for the whole year"), MVP_CONTENT §0.3, ROUTE_REDESIGN §4.1–4.2, every camp line. Why: D-160 (Dan). Options: keep camp at the top with returns (rejected by Dan); camp where he is (chosen). Changes: SITE "Camp, absence…" section; MVP_CONTENT §0.3 and §1; ROUTE_REDESIGN gets a pointer here.
2. **The salt's later tally is bared in week 3** (one crust, one count; `seal-12-2` folded in). Facts unchanged; only when the count opens and how many crusts. NICHES 5.2, 6.1, 12.2; SITE Salt Gallery row; ARR1 4.A/5.3; ARR2 12.B; REVELATION_MAP rows 4, 5, 12.
3. **The OPEN/EAT tablet is in the square gallery.** NICHES 6.1; SCRIPT §6 ("the Salt Gallery's sealed record (week 6…)"); CLUE_LEDGER C-66; SITE square stone note; ARR2 6.2.
4. ~~The great door has its count and blank on both faces, and is opened from below in week 8.~~ **Withdrawn after the check (§7.1):** the great door is not opened in weeks 1–14; no new physical fact. The retcon recorded instead is §7.7 R1.
5. **Her sheets and her folder travel with Dan** (as her notebook does, D-155). SITE Salt Gallery and Box Room rows; CLUE_LEDGER C-14a (her layer stays visible as hers).
6. **Her dictionary is at the second landing.** NICHES 4.6.
7. **Where Key niches' weeks moved** (4-3, 4-5, 5-5, 6-5, 14-5 → w3; 4-2, 5-2 → w3; 6-1, 7-5 places): NICHES as built table; MVP_CONTENT §5.

Also: `ARRIVALS_REGION1.md`, `ARRIVALS_REGION2.md` (week tables 3–8, camp rows), `STORY_JOB.md` (a §10 for this job), `LIVES.md` S9's week, `PAINTING_BRIEFS.md` (retired: `pt-pl-w3-far-end`, `pt-b-4.A`, `pt-b-4.B`, `pt-b-5.A`, `pt-pl-w6-folder`, `pt-b-8.B`, `pt-b-9.B`, `pt-pl-w4-hollow`, `pt-b-12.B`, `pt-pl-w4-recess-above-the-cot`, `pt-pl-w5-ledge-lip`, `pt-pl-w14-deep-niche` (kept in the kit; unused unless a niche view uses them); new: views 22–28 if drawn), `DECISIONS.md` (spoiler-free).

**Engine consequences (for the build, not story):** evenings go (`nextEvening`, `homeSteps`, `held`, `frontierNeeds`, `eveningsBehind`, the evening faces); `home` becomes "the top" (kept for `departed`, the errand, finds and views); `portable` on seals (`seal-5-4`, `seal-6-5`); the Key errand screen; `pickFind` never climbs into the top after departure; camp at a place vs a view (§1); the "Back up" label; the road row ordering for moved seals.

## 6. Open questions (only what this job cannot settle)

1. **Weeks 15–52 (not yet in the app) assume camp by the lamp all year** (ARR3 and ARR45 camp rows "The lamp…", "The ledge, empty"; the lamp leaving the ledge at week 45 for the Seed; S10, S11 in salt niches at weeks 18, 21; 22.3 and 33.3 re-reads at the top). The next story job must re-home them by this design's principles. Recommendation recorded here: the lamp's journey to the Seed is the one **story-driven return to the top** worth keeping, said on screen ("for the one who returns"), and it is where **the great door opens** (§7.1): up the steep stair from the Water's far shore, the door's count and blank met from below or cut from the hall, so that the way back down is the makers' straight descent C-05 always promised. **The ending is set at camp, by the lamp** (WORLD_TRUTH §10 step 7, the coda: week 52, "at camp, alone", the lesson-wall re-read; SITE region 5: the lamp leaves the ledge at week 45 and is back on it at week 51's camp; ARR45 51.1 holds the printed page from the recess above the cot beside the fifth name, which is why that page now travels in her folder, §7.4). So the year's last weeks must bring Dan back to the Lamp Hall with a reason on screen (carrying the lamp up and setting it back on its ledge), and from then on "camp" can again mean the hall. S10 and S11 should be found in that same visit or moved to readers' things below. Not decided here because those weeks are not written.
2. **Is week 3 too long at the top?** A judgement for the playthrough judges (§3); the lever is named.

## 7. After the independent check (2026-10-07; overrides §0–§6 where they differ; built)

An independent check of §0–§6 found three blockers and a list of smaller faults. Each decision below is built in `app/src/content/sealed/`.

### 7.1 B1 — the great door stays shut in weeks 1–14

**The check was right.** Opening the great door from below at the steep stair's head (old §2.1 `b-7.C`) contradicted canon (C-05's truth: the door opens *the makers' straight descent to the Water*, seen from the hall going down; ARR2 7.C "as far as the light"; SITE's step scale: a stair twice as steep, unlit, climbed in the dark the full height of the Site's first two regions is not believable), it ended at the top in sight of camp (reads as going home, against D-160 point 5), and it confirmed nothing (it carried only the word cut again).

**Decision:** the great door is not opened in weeks 1–14. `pl-w8-steep-foot` poses the question instead: a second, far steeper stair comes down to the Water's far shore, unlit, with cold air going up it; Dan climbs a few steps until the Water's light gives out and stops (too steep to take blind, nothing to see by). The one fair hint is the cold: he felt it coming off the great door's face in week 3 (`b-4.C`), and `b-w8.camp` puts the two side by side as a thought before sleep. Nothing says where the stair goes. The door opens on the story-driven return to the top (§6 Q1).

**Changed:** `b-7.C` retired (kept in beats.ts for old saves, off the route); `seal-7-5` seen-only (no Key, no road). Rewritten: `b-8.A` (no "from the great door"), `pl-w8-steep-foot`, `ps-w07`, `b-w7.camp` (req `b-7.A`), `b-w7.close` (req `b-7.A`, until `b-8.A`), `b-w7.tz2` (req `b-7.A`, until `b-8.A`), `wc-w7-2` and `aw-w7` (now on `b-7.B`), `b-w8.camp` (req + `pl-w8-steep-foot`), `b-w4.close` (until `b-5.0`; it no longer looks at the door). `b-7.A`'s line no longer points at the tablet's old place.

**Check of what `b-7.C` carried:** no record, no guess, no confirmation (`seal-7-5` carried only `wd-open-way`, already cut at `b-7.A` and again at `b-10.A`). No mark has `confirmedBy: b-7.C`. Nothing needed before week 15 is lost.

### 7.2 B2 — the standing stone is reached once, in week 13

**The check was right**, and neither of its two fixes holds. (a) An on-screen reason not to cut at `b-10.B` is not true to the established pattern: every word so far is cut the moment its two signs are held, from guesses (`b-3.A`, `b-7.A`), and the only candidate reason on the stone (V5's "This one [ ] days nine": someone waited) is resolved by nothing in weeks 11–13 that a player would accept (V6 says the waiting man's moving-stone cut stilled the Water: a reason for more caution, not less). (b) Cutting in week 10 would open the lower gallery, the slope and the lit lower way three weeks early, leaving weeks 11–13 in the blast room and side gallery with a lit way down unwalked behind a lifted fall: a worse "why don't I go on?".

**Decision (c):** Dan does not go to the deep end in week 10. The trip `pl-w10-deep-end` is retired. In week 13, `b-13.B` is the arrival at the deep end: the shut door's record (V6) opens with two drops like the square gallery's records (the second's) and speaks of moving stone; the second's gallery ends in a fall; he goes back up (turn-off, "Back up", reason in its first two sentences), passes the mule-shoe's stone (its notches, `seal-14-4`, folded in from the cut `pl-w14-mule-stone`), finds the standing stone with its blank beside the pair that stands together in V6, and cuts. `b-10.B` becomes a road `stepKey` (w13 o6, `seal-10-3` w13 o4) after the cut: the stone's count fills and V5 comes clear; `pl-w13-lower-gallery` waits for it ("thirty paces, as the standing stone said"). The trip up leads on down. No "why didn't I cut it then?": he was never there with the signs.

**Sign order:** unchanged (STONE confirmed at `b-13.B`; MOVE at `b-w10.morning`). **One record moves later:** V5, week 10 → 13 (retcon R2, §7.7). Nothing in weeks 10–12 reads or needs V5 (checked: no req, no line, no morning names it; FAIR_PLAY's Surveyor's-door rung V5 is still read in week 13 beside V6, its own week). `wc-w10-3` moves to week 13; `fd-g11` req `b-13.B`; `b-w13.tz2` now looks at the fall seen in week 6; `cv-21` and `tz-w10-a` retired with the place.

### 7.3 B3 — old saves never stall

A save that departed under the old order (the Stair in week 3) can lack: the places `pl-w3-salt-lit`, `b-4.C`; the steps `b-4.B` + `seal-4-2`, `b-3.5` + `seal-5-2`, `b-3.6`, `b-3.7`, `b-3.1`, `b-3.2`, `b-3.3`. Each now plays after departure as the engine's told trip ("Before you go on, you climb back up…" for a place; "First, a climb back up…" for a step) and leaves Dan where he was:

- **`b-3.6` (the copy) needs `seal-5-2`, not `b-3.5`** (+ `b-3.2` for her pencil, `b-3.3`). A save that opened the crust under the old `b-5.3` never plays `b-3.5` (a road step whose seal is open), so nothing new requires `b-3.5`: `fd-c15` needs `seal-5-2`; `tz-w4-a`, `tz-w14-b`, `b-14.4` need `b-3.5` but are optional (a teaser, a Key niche) and their niches are also brought into view by `b-3.6`.
- **The hall's copying is in `b-3.6`, not `b-3.3`**: the lamp's base, the wall by the lamp, C-57 (the carved lamp's sharp cuts) and the ledge's notches (`seal-5-5` in view). A save that played `b-3.3` before still gets all of it.
- **The road order:** week 3's road rows are `seal-4-2` (o1, `road: true`: nothing on the road needs it now that `b-4.B` is a step, so the flag keeps it on the road) and `seal-5-2` (o2); `seal-3-1` moves to week 4 o1 with `b-3.B`. An old save holding `seal-3-1` open and `seal-4-2`/`seal-5-2` shut has later road rows held by `roadTurn` until they open, and they are the first step candidates (week 3), so they play at the next returns: no stall.
- **Walked top places an old save may still owe:** two at most (`b-4.C`, `pl-w3-salt-lit`); everything else is a step. `pl-w3-far-end`, `pl-w6-folder`, `pl-w4-hollow`, `pl-w4-recess-above-the-cot`, `pl-w5-ledge-lip`, `pl-w14-deep-niche`, `pl-w14-mule-stone`, `pl-w10-deep-end` and `b-7.C` are off the route (kept in beats.ts, so facts naming them still resolve); `seal-12-2` and `seal-7-5` are seen-only.
- **Each top step reads right after "First, a climb back up to {area}…"**: `b-3.6`'s motive is general ("The tally runs far past anything her sheets cover… You do not want to leave it behind"), not "before you go down"; `b-3.5`, `b-3.7`, `b-4.B` begin where they are.
- **Tested** (scratch suite, not in the repo): the saved games in `app/tests/saves/route-old`, `route-d154` and `route-d159` carried on from the start of story weeks 4, 5, 6, 7, 9, 11 and 13 — see §7.8 for the result.

### 7.4 The smaller findings

| Finding | Decision |
|---|---|
| `b-4.1` out of order | req `pl-w5-worn-steps`; its line starts from halfway down the top flight. `pl-w5-second-landing` still needs `b-4.1`. |
| `b-3.C`'s "Go back and follow the tally" | Dropped: "Go on down" / "Look at the steps". |
| `b-3.C` at the same landing as `b-3.B` | Kept, and made to earn its place: Dan lowers himself off the landing onto the top flight and starts down it (the first look at the knee-high steps and the rail far below). Painting brief unchanged (from the top step, looking down). |
| `b-7.A` points at the tablet's old place | Now "the two drops parted from the tablet by the join". |
| `rec-s5` firstShown | `['b-5.3']` (no record when the crust opens); `rec-s6` `['b-7.2']`. |
| Week-3 order | Route: `b-3.A` · `b-4.C` · `pl-w3-salt-lit` (the corner is beside the great door, so the hall's far end leads into the salt; no out-and-back). Steps: `b-3.1`, `b-3.3`, `b-4.B` (req `pl-w3-salt-lit`), `b-3.2`, `b-3.5` (req `pl-w3-salt-lit`), `b-3.6` (req `seal-5-2`, `b-3.2`, `b-3.3`: her pencil and the lit base first), `b-3.7`. |
| The copy's believability | `b-3.6` gives the motive (the tally runs far past her sheets; he can read little of it; he will not leave it behind), the method (her blank sheets, her pencil, cell by cell, each checked against the salt) and the time ("It takes hours"). It does **not** list the small strokes or the cross. Each later reading says why it is noticed now: `b-4.A` (her notebook's Day 9), `b-4.4` (the records' ends), `b-5.A` (the tablet's bar with a tick), `b-5.3` (reading on), `b-7.2` (the tablet's sky and child), `b-8.B` (the Water's tablet counted in strokes; "You copied them without knowing why"), `b-9.B` (the Reading Room's cross), `b-9.3` (reading on), `b-12.B` (the far niche's hooks and full cell). |
| FAIR_PLAY, `b-9.B` on his own copy | Holds: R4's evidence is the strain inside S4 (*go*, *gave* beside *held me*) and the cross in the record; the copy is shown as faithful at `b-3.6` (each cell checked against the salt) and again at `b-9.B` ("You copied it from the salt and checked it there, as you did every cell"). Noted in FAIR_PLAY. |
| S9 in week 3 | Accepted, and said here: if the deep niche is opened in week 3, S9 renders mostly as its carved pictures (lambs, salt, the valley, a donkey) and fills in on the records screen as signs come; `b-14.4` carries no written partial reading. A Key used on it from below is the player's own trip up (the errand). Moving S9 lower would move a salt record off the salt: rejected. |
| `rec-x-colleague` | Stays in the recess above the cot (the drawing pin is its planted pair), but Dan **unpins it and keeps it in her folder** (`seal-4-3`'s line; `where`: "a printed email from the recess above the cot, kept in her folder"). ARR45 51.1 needs that page beside the fifth name at the doors. |
| st-mouth counts as the top | Yes (the engine's `isTop`). Views `cv-01`, `cv-02` end at `b-3.B`; top teasers end at departure or are shadowed by week 4's from then on. |
| The ending is set at camp | Named in §6 Q1. |
| `pl-w14-mule-stone` | Cut; its sighting (`seal-14-4` in view) folded into `b-13.B`; `tz-w14-a` req `b-13.B`. |
| `b-8.B`'s "Walk on along the wall" | "Read on in your copy". |
| `b-w7.camp`, `b-w7.close` req | `b-7.A` (§7.1). |
| Retired ids | Kept in the arrays with a `// NOTE: retired` line, off the route, nothing new requiring them: places `pl-w3-far-end`, `pl-w4-hollow`, `pl-w4-recess-above-the-cot`, `pl-w5-ledge-lip`, `pl-w6-folder`, `pl-w10-deep-end`, `pl-w14-deep-niche`, `pl-w14-mule-stone`, `b-7.C`; seals `seal-7-5`, `seal-12-2` (seen-only); view `cv-21`; teaser `tz-w10-a`. |
| Teaser order | The app shows the last eligible teaser in file order, so the week-3 teasers (`tz-w4-a`, `tz-w4-b`, `tz-w5-a`, `tz-w14-b`) sit before `b-w4.tz1`, which shadows them from week 4 on; `tz-w3-a` (the first turn) moves to week 4 after it. |
| Top passages and finds that show her sheets in their crack | `ps-c08`, `fd-c08`, `fd-c14` until `b-3.6` (he takes the sheets). |

### 7.5 Pacing, as built

| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| On foot (D-154) | 6 | 4 | 4 | 1 | 1 | 4 | 2 | 4 | 4 | 5 | 6 | 4 | 5 | 3 |
| On foot, as built | 6 | 4 | 3 | 4 | 1 | 4 | 2 | 4 | 4 | 3 | 6 | 4 | 4 | 3 |

52 places on foot (was 53), no evenings. Week 10 is now three places (the deep-end trip is gone) and carries three steps; week 13 four. No place was added to fill a week (D-160 point 8).

### 7.6 Camp views, as built

Every view's line says he camps there ("You camp…"); the top's views end at `b-3.B`. New, with stand-in paintings: `cv-22` the second landing (`st-flight2`), `cv-23` the steep stair's foot and `cv-31` by the channel (`st-water`), `cv-24` the inner door and `cv-32` the low bench (`st-reading`), `cv-25` the narrow way and `cv-26` by the log (`st-blast`), `cv-27` before the shut door (`st-side`), `cv-28` the head of the lower way (`st-lower`), `cv-29` under the crew's wall and `cv-30` the lower gallery (`st-square`). Views per stretch below the top: Stair 3, second flight 3, square gallery 3 (+ `cv-21` retired), Water 3, Reading Room 3, below the Water 3, side gallery 2, lower way 2.

### 7.7 Retcons (MASTER_BRIEF §55)

- **R1. The great door is not opened in weeks 1–14.** Conflict: CLUE_LEDGER C-05 payoff "month 2 (opens)", REVELATION_MAP row 7 (the Lower Door takes a Key and OPEN-WAY in week 7), ARR2 7.C and its camp row, NICHES 7.5, SITE gate rules ("the Lower Door … month 2"), SCRIPT §6 W2 row. Why: D-160 (no trips back to camp; a return needs a reason on screen) and §7.1 (the from-below variant broke canon). Options: open it from the hall in week 7 (a trip back to camp: rejected by D-160); open it from below in week 8 (§2.1, rejected by the check); leave it shut until the story returns to the top (chosen). Files: C-05 and C-66 payoff columns; REVELATION_MAP row 7 note; ARR2 week 7/8 as-built block; NICHES as built; SITE gate rules and Lamp Hall row; SCRIPT §6 W2 row; PAINTING_BRIEFS (`pt-b-7.C` retired for now).
- **R2. V5 is read in week 13, not week 10.** Conflict: REVELATION_MAP row 10, NICHES 10.5, LIVES V5 (wk 10), ARR2 10.B. Why: §7.2. Options: (a), (b), (c) as above. Choice: (c). Files: REVELATION_MAP rows 10 and 13; NICHES as built; ARR2 week 10/13 as-built block.
- **R3. The lamp's base and the wall by the lamp are copied with the tally at `b-3.6`** (was `b-3.3` extended in §2.4). No fact changes. Files: this section; CLUE_LEDGER C-57 (planted at `b-3.6`, week 3).
- **R4. Her dictionary is on the second landing** (§5.6, kept), **her folder and the colleague's email travel with Dan** (§5.5, extended to the email). Files: NICHES as built; SITE Box Room row; the record's `where`.
- **R5. `b-3.C` is on the top flight, not at the landing's edge.** No fact changes. File: ARR1 week 4 as-built block.

### 7.8 Tests run on the build

- **Fresh games** (five paces: normal with and without bedtime, short, long, high): all 14 weeks, every route place once, nothing played twice; the whole of week 3 (`b-3.1`, `b-3.2`, `b-3.3`, `b-3.5`, `b-3.6`, `b-3.7`, `b-4.B`, `b-4.C`, `pl-w3-salt-lit`) before `b-3.B`; every copy reading after `b-3.6` and in order; `b-13.B` → `b-10.B` → `pl-w13-lower-gallery`; after departure nothing at the top played and no camp at the top.
- **Saved games** (`route-old` ×4, `route-d154` ×2, `route-d159` ×4, carried on from the start of story weeks 4, 5, 6, 7, 9, 11, 13: 66 runs): no stall (week 14, the whole route), no replay, every copy reading played, `seal-4-2` and `seal-5-2` opened. The told trips an old save makes after departure: at most `b-3.5`, `b-4.C` (the one walked place), `b-3.6`, `b-3.7`; from week 6 on only `b-3.6` and `b-3.7`.
- **For the engine (not content):** the High day's deep push `b-1.7` (Lamp Hall, week 1) can still play after departure in an old save; a top find (`fd-c15`, `fd-a04`) can still be given at or after the departure arrival; `nextDeep` and the find given with an arrival should skip the top once `departed`.

### 7.9 After the fact-and-spoiler check (2026-10-07; built)

An independent line-by-line check of the built content (ids only here). Fixed in `app/src/content/sealed/`:

- **Order.** `b-w1.camp` req `b-1.A` (a kept bedtime before the first place played it, thinking of a lamp not yet seen). `b-5.B` req `b-5.A` (its "the same three symbols as every record in the tally" is what `b-5.A` finds; the place could come first on a long day). `b-4.B` (week 3) no longer says the hook closed on a dot "ends every record" (found at `b-4.4`, week 4): it is "the same small mark as in the corner of the lamp's base" (`b-3.3`). `b-14.4` (week 3) no longer says the niche's stretch "opens the way the tally's records do" (found at `b-5.A`). Views: `cv-05` req `b-1.B` (the corner, its troughs and the great door), `cv-11` req `b-3.C` (halfway down the top flight), `cv-12` req `b-4.1` (the first turn and the little door); `cv-14` no longer names "the square gallery" before `b-6.A` names it.
- **Spoiler.** `fd-b03` (the pencil grid under the carved lamp) back to w6, req `b-6.1`: in week 3, beside C-57 (`b-3.6`) and NICHES 3.4's chips and stub, it would answer R2 (wk 5–6) three weeks early; MVP_CONTENT has it as "R2, after the fact". As a top find it is now given only to an old save still at the top after L8. **Telegraph of `b-9.B`:** `b-4.A` no longer lays her Day 9 sheet beside the copy (the first side-by-side, and the missing cross, stay `b-9.B`'s); `b-4.4` now has its own reason (her sheet with the hook drawn and *signature?*).
- **D-160 wording.** `b-w10.camp` ("since the door below the Water opened, it has soaked into…" read wrong on the same night): now the narrow way. `cv-10` ("the first time you came this way", on the night of `b-3.B`): "before you came". `cv-26` (the log's pencil "has not moved", though Dan turns its pages): the pencil is simply in its fold. `cv-01` "white sky" at bedtime: "sky". `b-w4.camp`: symbols on a copy "stand", not "are cut".
- **Way in said twice.** `said: true` on `pl-w3-salt-lit`, `pl-w9-approach`, `b-12.A` (each comes back into its area from another, and its own first sentence says how, so the stretch's way-in line would repeat it).
- **Old saves** (wording that reads right either way): `b-3.6` and `b-3.7` and `b-13.B` no longer call notches "dark" that an old save may already have filled (`seal-5-5`, `seal-6-5`, `seal-10-3`); `b-3.6`'s sharp cuts are seen, not discovered; `b-4.C` drops "for the first time" (an old save saw the door at `pl-w3-far-end`); `pl-w8-steep-foot` drops "Where it goes, you cannot tell" (an old save that opened the great door at `b-7.C` knows); `b-6.2` introduces the niche by the join itself ("is a small niche"), since an old save read `b-6.A` before it named the niche.
- **Left, noted.** An old save that took the week-4 Key at `b-4.2` before the told trip to `b-3.6` can see `b-w4.morning` ("your copy of the wall by the lamp") before the copy is made; an old save that opened `seal-6-5` or `seal-4-3` under the old lines meets `b-3.7`'s first sight of the folder and recess. Both are narrow windows and need a conditional line, not a wording change.


## 8. Round 1 of the player's-eye review (2026-10-07; built)

The built game was played through all 14 story weeks at Normal pace and judged by three fresh reviewers and a whole-story reader (fix list and transcript in the session's scratchpad; move numbers below refer to that transcript). Every content item is fixed in `app/src/content/sealed/`; the engine items (views used only at their place, finds only from the area Dan is in, the Word screen at bedtime, Today's wording) are the build session's. Re-simulated at Normal, short and long days: the orders below hold at all three, except where noted.

### 8.1 What changed, item by item

| Item | Fault (as the player saw it) | Fix |
|---|---|---|
| **V** camp views | A view put Dan at another spot of the stretch; ~30 nights read only "You camp here tonight". | Every view has `near` (a new optional field on `CampView`: the route place it is at, or just past). 25 new views, `cv-33`–`cv-57`, so every route place but the Mouth has one (two at `b-14.B`, where he stays once the story's weeks run out): `cv-33` under the ledge, `cv-34` below the ring, `cv-35` by her boxes, `cv-36` under the lintel, `cv-37` where the crust fell, `cv-38` his copy, `cv-39` the worn dips, `cv-40` the long straight, `cv-41` below the twelve rings, `cv-42` by the open lintel, `cv-43` inside the Reading Room's doorway, `cv-44` before the lintel below the Water, `cv-45` in the opened doorway, `cv-46` by the cupboard, `cv-47` by the two books, `cv-48` by the crack, `cv-49` by the two dips, `cv-50` the bench apart, `cv-51` by the bucket, `cv-52` below the shelf, `cv-53` between the niches, `cv-54` at the shut door, `cv-55` by the standing stone, `cv-56` at the foot of the slope, `cv-57` above the bend. Each new view's look is a line (no find to run out of). `cv-01`/`cv-02` (the Mouth) have no `near`: they are for a night before the first place. Reworded: `cv-06` (no split before `b-1.5`; look `fd-c07`), `cv-11` (a view of the top flight, no size line), `cv-13` (no "she once found open" before the D9 note; req + `b-5.1`), `cv-20` (the cold air said once), `cv-26` (req `pl-w10-blast-floor`), `cv-28` (req `b-14.A`, look a line). `cv-21` (retired) gets `near: pl-w10-deep-end`, so it is never used. |
| **1** lintel before its introduction | `b-2.2` studied the lintel; the week's page `b-w1.close` then introduced it as new. | `b-2.2` now shows the lintel itself (worded to read true whether or not the page came first); `b-w1.close` `until: b-2.2`; `b-2.B` req + `b-2.2` (the rod's note names the lintel, and `b-2.2` can never be left to play on the way to the word); `b-w2.close` req `b-2.B`, `b-2.2`. |
| **2** the lamp's symbols contradicted | One line had a lone open hook in a box on the lamp's side "when you first came down" (only the High day's `b-1.7` shows it); another said three symbols on its base, never shown. | `b-1.A` shows the three small symbols on the base (move 1). `b-2.2` no longer recalls the hook on the lamp's side: it ties the hook-and-drop to the fourth symbol on her sheet from the tin box (true: `mk-give` is seen at `seal-2-1`). `b-1.7` unchanged (it agrees: three on the base, the open hook apart on the side). |
| **3** tally and "woman" named early | A find called a carving "the work of whoever cut the tally" before the tally; "the woman who lived here" before anything showed a woman. | `fd-b08`, `fd-c03`, `fd-c04`, `fd-c08`, `fd-c09` req `b-1.5`. `b-1.C`: "a pair of women's walking boots" (her boots, NICHES 1.4; no new fact about her). |
| **4** the smooth place; the Box Room without a reason | "The smooth place" was the corner's polished wall again; the Box Room was reached "on your way back towards the lamp". | `pl-w2-smooth-place` **retired** (off the route): its high, glossy patch is one clause of `b-1.B`, which now carries `seal-2-4` in view. `b-1.C` opens with the chalk arrow and CAMP on the floor, pointing at the doorway (the reason on screen); `fd-b10` (the same arrow) `until: b-1.C`. The salt passages that walked back to the hall's corner (`ps-c01`–`ps-c03`, moves 16–18) are rewritten as things in the Salt Gallery. |
| **5** the copy crammed into the Stair's arrival | `b-3.5`, `b-3.6`, `b-3.7` played on the way and showed after "With your copy… packed". | **`b-3.5` is a place** (arrivalKey, `seal-5-2` now `arrival: b-3.5`, o1, before `seal-4-2` o2): the salt by the new light, the river stones, the crust falling, the tally to its end; it absorbs `pl-w3-salt-lit` (**retired**). **`b-3.6` is a place**, "The tally's head", req `seal-5-2`, `b-3.1`, `b-3.2`, `b-3.7`, `seal-4-2`: every other week-3 moment comes first, so nothing of week 3 is left to play on the way to the Stair; one still owed plays on the way to the copy and reads true after it. The copy uses the stub of pencil lying with her sheets, not her notebook's. `b-3.3` (the lit base) is **retired** into `b-4.C`'s first sentences, so the base is always seen before it is copied. `b-3.B` starts "You step through the opening…" (nothing packed is presupposed). Week-3 step order: `b-3.1` · `b-3.2` · `b-3.7` · `b-4.B` (req `b-3.5`). |
| **6** the first turn before he reached it | The niche "Here at the first turn" opened before the first turn; a passage lowered him off the landing again; "the little door" named as if known; "she once found open" before the D9 note. | **`b-4.2` is a place**, "The first turn" (arrivalKey, `seal-4-1` `arrival: b-4.2`, after `pl-w5-worn-steps`): the rail's niche opens there, and it absorbs `b-4.1`'s look down the second flight ("a little door, small and shut"; the recess under the bend, `seal-5-1` in view). `b-4.1` **retired** (an off-route place, so it never plays again). `pl-w5-second-landing`, `cv-12`, `tz-w4-c`, `ps-t06`, `ps-t14`, `b-w4.close` req `b-4.2`; `ps-t18` until `b-4.2`; `ps-t01` (lowering off the landing) until `b-3.C`. `cv-13` as above. |
| **7** the gap's record before the tally's openings were read; the recess crammed in | `b-5.B` leaned on `b-5.A`'s finding; `b-5.1`, `b-5.A` played on the way; "held true: once" before the offer showed. | **`b-5.1` is a place**, "Under the second turn" (arrivalKey, `seal-5-1` `arrival: b-5.1`), on the second landing: ONCE, PATH, GO are offered on their own screen. `b-5.B` no longer needs `b-5.A` (req `[]`): its record "begins with three symbols you know from the tally: the bar with a tick, a ring, and a drop, but here the drop is doubled". `b-5.0` climbs a few steps back up from the landing. |
| **8** filler and repeated places | The crew's wall "returned to"; the shut door reached three times; the rubble only a shortcut; the door at the foot = the way down; the wall-shelf only a locked shelf. | `b-7.B` walks on to the end of the crew's wall (the twelve rings are further along). `pl-w13-side-gallery` stops a stride short of the door and is the niches; `b-13.A` is the hand on the door itself. `b-14.A` gives its reason (he climbs to see what blocks the lower way's head) and `b-14.1`/`b-14.2` go "through the gap" to the cupboard and the log, the shortcut's purpose. `b-10.A` is the notches lighting under the pair he holds, not a second description. `pl-w6-wall-shelf` **retired**: the shelf is seen at `pl-w6-square-gallery` (`seal-6-3` in view; `tz-w6-a` req it). |
| **9** the Reading Room spoiled; the channel's record before the channel | `b-w8.close` described the benches and the inner door's symbols; `b-8.2` played before `pl-w8-channel`. | `b-w8.close` is the open doorway only ("no sound at all comes out of it"), `until: b-9.A`. `b-8.2` req + `pl-w8-channel`. |
| **10** "This time you try the doorway" | Dan left the narrow way for the Reading Room with no reason. | **The narrow way is walked after the Reading Room**: `b-8.C` moves to route week 9 after `b-9.C` (`w` 9, `seal-8-4` w9 o5), and opens with the reason (past its inner door the Reading Room goes only into the dark; back at the far shore, the powder smell); `pl-w9-approach` follows straight on down. `b-9.A` comes from the steep stair's foot. `ps-w12` (the smell at the far shore) req `pl-w8-steep-foot`. |
| **11** mornings recalling readings never shown | `b-w9.morning` (S2: the tall one, bread and salt), `b-w12.morning` (the wading bird), `b-w10.morning` (S1's opening "in your head"); `b-8.3`'s "two hands". | Each morning now reads the lines from his copy on screen ("you take out your copy…"), so nothing is recalled that was not shown; `b-8.3` names "two plain hooks copied from the tally" (what `b-8.B` shows), not S8's "two hands". |
| **12** MOVE and WATER never taught | The tablet (`b-10.1`) played on the way to the word at `b-10.A`, and the word's screen does not show such bits. | The word comes first: `seal-10-2` o1, **`seal-9-5` → week 10 o2**, `seal-10-1` o3, `seal-10-4` o4, `seal-10-5` o5; `b-10.1` o3. Both niches beside the lintel now open as their own job returns after the cut (`b-10.1` reads "at the lintel at the foot of the narrow way"); MOVE/WATER are still offered before `b-w10.morning` confirms them and before anything uses them (week 11 on). Rule recorded: **nothing may be required by a word place** (a step on the way to a word is not shown); the words' reqs are places and marks only (`b-2.B` now carries `b-2.2` for the first word). |
| **13** returns re-describing | Troughs/polished wall, treads, powder smell, torn wall, the clear lake. | New lines: `ps-c01`–`ps-c03` (salt), `ps-t02`, `ps-w02`, `ps-w03`, `ps-b01`–`ps-b03`, `ps-b05`, `ps-b06` (each a new, plain thing; no clue). |
| **14** too many size hints | | Cut: `b-3.C`'s "built for someone much bigger", `cv-11`'s, `fd-e03`'s height, `fd-e10`'s "legs longer than mine", `ps-t07`, `ps-t19`, `ps-t21`, `b-w9.morning`'s "as tall as two of its teller". Kept (the strongest): the knee-high steps, her rail note (`fd-e05`), the worn steps' stride, the low doorway, the four long fingers (`b-7.3`), the benches and stylus, the far end's dips, the lower way's polish. |
| **15** week's pages out of step | Pages lagged (15, 41, 94, 108) or ran ahead (54). | `until`: `b-w1.close` `b-2.2`; `b-w5.close` `b-6.A` (req `b-5.B`); `b-w8.close` `b-9.A`; `b-w9.close` `pl-w9-approach` (req `b-8.C`); `b-w10.close` `b-11.A` (req `pl-w10-blast-floor`); `b-w11.close` `b-12.A` (req `b-11.2`); `b-w12.close` `b-12.C` (req `pl-w12-square-way`); `b-w13.close` `pl-w14-meeting`. A page whose glimpse is already passed is simply not shown (more weeks now have no page at Normal pace: a page is never a recap). |
| **16** nits | | `b-4.4` ends at the lamp's base (the wall's different hook is `b-w4.morning`'s alone); `cv-20` once; `b-11.A`, `b-13.3`: "the beginner's wax tablet under the twelve rings"; `fd-a02`'s arrow points up the shaft; the DOOR tablet (`b-3.B`) shows "a door, shut in its frame", the OPEN tablet (`b-6.2`) "a doorway with its door swung wide open" (`mk-door`, `mk-open` contexts; `b-5.3`, `wc-w5-2`, `b-w3.tz2` say door). |
| **17** kept at the top | | The top is 13 places on foot, as before, but each earns its place: week 1 loses the smooth place, week 3 has the lintel, the door (with the lit base), the salt with the crust, the copy. `pl-w13-lower-gallery` no longer says "as the standing stone said" (on a long day V5 can show after it). |

### 8.2 The route, as built after round 1

Week 1 `b-1.A` · `pl-w1-below-the-lamp` · `b-1.B` · `pl-w1-pick-niche` · `b-1.C` (5). Week 2 unchanged (4). Week 3 `b-3.A` · `b-4.C` · `b-3.5` (K) · `b-3.6` (4). Week 4 `b-3.B` (K) · `b-3.C` · `pl-w5-worn-steps` · `b-4.2` (K) · `pl-w5-second-landing` (5). Week 5 `b-5.1` (K) · `b-5.B` (2). Week 6 `b-6.A` · `pl-w6-square-gallery` · `b-6.B` (K) (3). Week 7 unchanged (2). Week 8 `b-8.A` · `pl-w8-channel` · `pl-w8-steep-foot` (3). Week 9 `b-9.A` · `pl-w9-benches` · `b-9.C` (K) · `b-8.C` (K) · `pl-w9-approach` (5). Weeks 10–14 unchanged. **53 places on foot** (was 52): +`b-3.6`, +`b-4.2`, +`b-5.1` (moments that need their own screen), +`b-3.5` (replaces `pl-w3-salt-lit`), −`pl-w2-smooth-place`, −`pl-w6-wall-shelf`.

Retired this round (kept in `beats.ts` with `retired: true`, off the route, so old saves' facts resolve): places `pl-w2-smooth-place`, `pl-w3-salt-lit`, `pl-w6-wall-shelf`; steps made off-route places so they can never play again: `b-3.3`, `b-4.1`. Painted places now off the route: `pt-pl-w2-smooth-place`, `pt-pl-w3-salt-lit` (its image suits `b-3.5`: re-key it), `pt-pl-w6-wall-shelf`; new places and views use stand-ins until drawn.

### 8.3 Old saves

`b-3.5`, `b-4.2`, `b-5.1` are K places: a save that already opened their rows (an old route's crust, the rail's niche, the recess) skips them, by design (nothing to show twice); `b-4.2` and `b-5.1` were played as steps in such saves, so only `b-3.5` is left unplayed, and nothing requires it (`b-3.6` needs `seal-5-2`, `b-4.B` is already played or its row open). `b-3.6` as a place plays for an old save as the told trip back up, as before.

### 8.4 Retcons (MASTER_BRIEF §55)

- **R6. The smooth place is part of the corner** (no fact changes; one place fewer). Files: NICHES 2.4 note; ARR1 as-built block.
- **R7. Her boots are women's walking boots.** Conflict: none (she is a woman in canon; the boots were "a pair of boots"). Why: the first "her"/"the woman" must have a cause on screen. Options: a hair elastic (a find, optional), her name (too early, X-colleague), the boots (chosen: always on screen at `b-1.C`). Files: this section.
- **R8. The DOOR tablet shows a shut door; the OPEN tablet an open doorway.** Conflict: MVP_CONTENT mark rows, CLUE_LEDGER C-66 ("beside a doorway"). Why: the same picture beside two signs muddled both. Files: MVP_CONTENT §6 rows, CLUE_LEDGER C-66 note.
- **R9. The narrow way below the Water is entered after the Reading Room** (week 9, not 8). No fact changes; the order of walking does. Files: ARR2 as-built block; NICHES (8.4 → week 9 o5; 9.5 → week 10 o2; 10.1–10.5 renumbered).
- **R10. The chalk "36 FT" arrow points up the shaft.** A drawn detail. File: MVP_CONTENT §8.1 (`fd-a02`).

No sign moved (offers and confirmations in the same order, §4), no record moved week, and the ending and canon are unchanged.

### 8.5 Tests

Run: `story-wiring`, `camp`, `route`, `road`, `continuity`, `weeks8-14`, `deep-story`, and `tsc`. Expectations this round changes (for the build session, which owns the tests): the paintings list (new places and views stand in); the week-close `until`s; week 8 now has three places; the old-route saves leave `b-3.5` unplayed (by design, §8.3); the count of glimpses never shown at Normal pace (pages that would lag are skipped); the mornings-before-camp-line list (now only `b-w12.morning`); the Key-idle probe (no idle Key in its run); and the long-day probe's "no next place" between `b-3.6` (the last place of week 3, after which nothing of week 3 remains) and the start of week 4 (an engine gap: `placeAhead` should step into the next week when the week is done and no bits stand between).
