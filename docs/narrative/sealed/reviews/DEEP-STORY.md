# Deep review: the story and its content wiring (SEALED)

> **Sealed (D-015). Dan must not read this.** Full detail, with ids and story text. The Dan-facing version, with no story at all, is `docs/reviews/deep/STORY-SPOILER-FREE.md`.

_Reviewer: independent deep review, round 5 (branch `claude/review-round-5`), 2026-10-01. Nothing in `app/src` or the existing tests was changed. Probes: `app/tests/review/deep-story.test.ts` (26 probes, all passing: a passing `FINDING:` probe is a reproduced finding). The story words those probes need are kept in `deep-story-patterns.json` next to this file, so the test file holds ids only._

## How it was checked

- **Static wiring.** The whole `story` object (159 beats, 79 sealed rows, 63 records, 52 marks, 3 words, 96 finds, 21 camp views, 202 passages, 58 teasers, 42 learned lines, 4 month summaries, 14 open questions) was dumped and every id cross-checked: `req`, `until`, `seal`, `beat`, `arrival`, `carries.*`, `firstShown`, `guessAt`, `confirmedBy`, words, finds' `told`, camps' `look.find`, stretches' `req`, route places, open-question `req`.
- **Dynamic.** A simulated Dan who, unlike the rule sims, **spends his Keys** on the first niche `openable()` offers, guessing the true candidate, bedtime kept. Lives: Normal × 15 calendar weeks, High × 8, Low × 22, a "slow" life (Low on 3 days a week, 4 days away) × 22, Normal with late bedtime × 18, High with no bedtime × 12. Every run was checked with the existing `aheadOfDan` / `outOfOrder` guards, plus: what never played, what played twice, what each week close showed, and when.
- **Text.** Every player-facing string (lines, taps, choices, names, wheres, records' paper/full/sheet, struck lines, contexts) for markup, whitespace, quotes and calendar wording; names of places across files; WORLD_TRUTH, CHARACTERS, STORY_JOB §8, CLUE_LEDGER, NICHES, LIVES, ARRIVALS_REGION1/2 spot-checked against the app's text.
- **Leaks.** Truth-level names and terms across all non-sealed docs, `app/src`, `app/tests` and the last 60 commit messages; 7-word runs of every story string against `app/src/content/copy/en.ts` and every non-sealed text file.

## What holds (controls)

- Every id resolves. The only unresolved names are `b-w3.morning`, `b-w5.morning`, `b-w6.morning` (the `confirmedBy` of `mk-here`, `mk-door`, `mk-go`, `mk-eat`): they are written as `beatPlayed` facts by `morningAfter` with no beat behind them, by design (the weeks 8–14 test says so).
- The route: 14 weeks, 68 places, none twice, each an arrival/arrivalKey/word of its own week with a name; every `k` place is exactly one row's `arrival`; every stepKey has exactly one row; no arrival is off the route.
- Every record is carried by something; every guessable mark is offered at one place only (a row and its step count as one).
- **With Keys spent, over 14 story weeks at Normal pace: nothing plays twice (beats, places, rows, records), nothing is ahead of Dan or out of order (the guards are clean), and every row, every record and all 96 finds come.** The rule sims never spend a Key, so before this nobody had walked the 36 niches end to end.
- Paintings: every one of the 68 route places and 21 camp views has its own painting, and every stand-in exists.
- No truth term or character name outside the sealed folders, in the copy or in the last 60 commits. `en.ts` shares no 7-word run with any story string. The open docs (`LOCATIONS.md`, `GAME_BIBLE.md`, `DECISIONS.md`, design directions) share only week-1/week-3 surface phrasing (the lit lamp with no oil, the ladder, the lintel blank), which is open by design. `app/paint/places/` quotes many lines but declares itself sealed (its README and HOW-TO-PAINT).
- WORLD_TRUTH spot checks found no contradiction: personal names never cut (rings only; `ashti` renders as a name only with NAME, week 30, outside the MVP); the one name readable early is the email header *To: I. Halloran* (CHARACTERS allows exactly this); the shut door's record agrees with CHARACTERS ("He long-slept not when I shut it"); the wages cache agrees with the Surveyor's "owed for thirteen days"; the LOUD-as-rank chain (Copyist → Engineer) agrees; the Tenant name and the lesson-wall's day agree with LIVES; the stopped watch, the well and compasses agree with C-39b and C-49. Every new plant in weeks 8–14 is in CLUE_LEDGER or STORY_JOB §8.6 with its truth (rule 6).

## Findings

Severity: **H** a player will see something false or contradictory in normal play; **M** content lost or mis-ordered for some players, or a design rule broken; **L** cosmetic, stale or inconsistent. "Story call" means the fix needs a creative decision rather than wiring alone.

### H1. Week-close glimpses describe a thing as still shut after Dan has opened it (H; light story call)

The glimpse is a `close` beat picked at each **calendar** week close: the oldest unplayed one with `w <= storyWeek` whose stretch is visited (`game.ts` `weekClose`). Only `b-w2.close` has an `until`. Because the story now runs ahead of the calendar (D-123), the glimpse shown is often weeks behind, and four glimpses describe a state the story has since changed:

| Glimpse | Describes | Undone by |
|---|---|---|
| `b-w1.close` | the lintel: solid stone under it, a blank to cut | `b-3.A` (the first word) |
| `b-w4.close` | the great door: blank uncut, notches all dark | `b-7.C` |
| `b-w6.close` | the second lintel: solid stone beneath, a blank | `b-7.A` |
| `b-w9.close` | the lintel below the Water, over solid stone | `b-10.A` |

Reproduced: **Normal pace** shows `b-w6.close` after `b-7.A` and `b-w9.close` after `b-10.A`; **High** shows `b-w1.close`, `b-w4.close` and `b-w6.close` after theirs. (Probe: "week-close glimpses describe a sealed state…".)
**Fix:** give each glimpse an `until` (the table above; `b-w3.close` "you cannot yet tell what lies behind it" is safe in the MVP, since the little door never opens), and/or show the glimpse of the story week just finished rather than the oldest. Which beat ends each glimpse is a light story call; the wiring is not.

### M1. One camp line can never play: `b-w7.camp` (M; small story call)

The camp line plays at a kept goodnight only if `b.w === st.week` and its `req` is met (`game.ts`, `goodnight`). `b-w7.camp` needs `b-7.C`, week 7's last place; the moment it plays, week 7 is done and week 8 begins (no calendar wait, D-123), so `st.week` is never 7 with `b-7.C` played. Never played in any life (Normal, High, Low, slow; bedtime kept every night). Its authored morning ("the map: two ways down, both ending in the dark") is lost with it.
More generally (**M2**), any player who passes a whole story week between two bedtimes loses that week's camp line for good: the rule is a calendar-era leftover. **Fix:** let goodnight play the earliest unplayed camp line whose `req` is met and whose `until` is not, or drop the `b.w === st.week` test and keep only `req`/`until`; for `b-w7.camp` alone, an earlier `req` (`b-7.A`) would do but changes what it describes (story call).

### M3. Four mornings play before their own camp line (M; wiring)

Mornings that confirm marks (`b-w10.morning` … `b-w13.morning`) play on the first morning after their tablet's marks were offered, bedtime kept or not (D-073, right). But the same week's camp line needs a later beat (`b-10.A`, `b-11.A`, `b-12.A`, `b-13.A`), so at Normal pace each of those mornings comes the day before, or the same day as, its camp. In the authored order (STORY_JOB §8.3: "Camp: …; morning: …") the morning follows the camp. Reproduced in every kept-bedtime life. The lines do not refer to the camp, so nothing reads false; it is an order break the task asked to check. **Fix:** either accept it (record it as D-073's consequence), or give those camps an earlier `req` so the camp can come first.

### M4. The week close keeps a calendar rhythm the story no longer has (M; wiring, D-123 leftover)

One glimpse and at most three learned lines per calendar week. At High pace the story reached week 14 in calendar week 3, yet after 8 calendar weeks the glimpse being shown was week 8's (a lag of up to 9 story weeks) and 21 of 42 learned lines were still unshown. At Normal pace the lag is 1–3 weeks. Not wrong in itself, but it is the root of H1, and a fast player reads "this week's" glimpse about a place he left long ago. **Fix:** with H1's `until`s, skip glimpses already passed; consider raising the learned-line cap when several story weeks finished in one calendar week.

### M5. Month summaries: one line never shows, and a slow player gets empty months (M; wiring)

- `sf-m2` has six lines but `weekClose` keeps the first five whose beats played (`slice(0, 5)`). Once all six are met, `sf-m2-6` (the second clay lamp, unlit) can never show. Never shown in any life.
- The summaries are tied to **play weeks** 1, 5, 9, 13 (`(n - 1) % 4 === 0`). A player working about half the days (the "slow" life) reached story week 14, but at play weeks 9 and 13 the summary was empty: `sf-m3-*` and `sf-m4-*` need beats of weeks 8–13 he had not reached yet, and the next chance never comes. Ten summary lines lost for him.
**Fix:** cap at six, or cut one line; pick the month's summary by the story weeks played (or carry unshown lines to the next close) rather than by play week.

### M6. A clue the ledger hands over once is handed over six times (M; story call)

C-51a (stone chips on Dan's side of the shut door; CLUE_LEDGER: "the one physical clue for 'from this side', handed over once and never stated"; ARR2 notes: "handed over once, at 12.C") appears in `b-12.C`, `ps-d05`, `b-w12.tz2`, `b-w13.tz1`, `wc-w12-3` and the open question `aw-w12` ("Stone chips lie on this side of the shut door. What is behind it?"). STORY_JOB §8.8 says the week-12 and week-13 open questions were changed so they "no longer lead to the shut door's inference"; `aw-w12` still leads with the clue. The source tables (ARR2 week-12 and week-13 teasers) already repeat it, so the sealed docs disagree with themselves. Weight of a fair-play clue: needs a story decision (keep it at 12.C and the passage; drop it from the teasers, the learned line and the open question).

### M7. Rows the road opens without a Key still say their count fills with light (M; story call)

D-129 put 33 rows on the road ("No story line was changed"). 29 of their lines still describe the row of notches filling with light (e.g. `b-7.4`, `b-11.A`, `b-11.C`, `b-13.A`, `seal-9-5`, `seal-10-5`). In the fiction the count is the world on the hand (WORLD_TRUTH rule 6), which the road can honestly fill (Dan keeps going out and coming back), so this is not false; but the app teaches that notches mean "needs a Key" (Map, Today's "Needs a Key", teasers that end on a row of notches), and these rows open with no Key spent and no Key words. A player may read it as a Key spent behind his back (D-141's complaint). **Story call:** keep (the count fills from returns, Keys or not), or reword the road rows' opening sentences.

### L1. Literal asterisks reach the screen (L; wiring)

Thirteen texts carry markdown emphasis (`*…*`), and nothing in the UI renders it, so the asterisks show: `rec-l2`, `rec-l3`, `rec-l8`, `rec-l10` (her notebook), `seal-3-6`, `fd-c14`, `fd-d04`, `fd-e05`, `fd-e10`, `fd-f02`, `ps-s18`, `wc-w4-1`, `aw-w4`. **Fix:** render `*…*` as italics in the few text components, or strip them.

### L2. Quotes and apostrophes are mixed (L)

Most lines use the straight `'` (about 300 texts); the cut taps, the seals' and records' `where` labels and a handful of lines/records (`b-2.B`, `cv-09`'s look line, `rec-l3`, `rec-l4`) use the curly `’`. Double quotes are straight throughout. On screen the two apostrophes look different side by side (an arrival line with a cut's taps). **Fix:** one typographic pass, or convert at render.

### L3. Calendar-week wording (L; D-123)

`b-2.2`, `b-2.A`, `b-3.3` say "in your first week"; `b-w3.close` begins "The week ends with you…". With no story weeks shown and places coming as fast as Dan works, "your first week" may be day 2, and "the week ends" names a unit the app no longer has. **Fix:** "when you first came down", "you end at…".

### L4. Names (L)

- `b-14.A` is named *Behind the blast room's fall*; STORY_JOB §8.8 fixed that the blast room's heap is *the rubble*, never *the fall* (the fall is the square gallery's, `b-10.B`, `cv-21`, `b-13.B`). The line and the learned line say rubble; only the name breaks it.
- `b-4.C` is *The Lower Door, close*, and its line says "It has a name of its own, the Lower Door"; nowhere else calls it that (it is *the great door* about 33 times). Who named it is never said.
- `pl-w12-square-way` is named *The side gallery* and is followed by `b-12.C` *The side gallery's approach*: the approach after the gallery.
- `b-10.A`'s last tap calls the log "the book of paper"; everywhere else it is *the log*, and *the book* is the Copyist's bound book (`b-11.A`).
- *the Stair* is capitalised in about 110 places and lower-case in about 24 (`b-3.4`, `b-w6.close`, `b-7.3`, `cv-13`, `cv-14`, `ps-t04`, `ps-t06`, `ps-f02`, `ps-f06`…), mostly meaning the same Stair ("the stair wall"); only `b-w7.camp` and `pl-w8-steep-foot` mean the steep stair behind the great door, which the lower case then fails to set apart.

### L5. Content that never shows in practice (L)

- `b-w2.close` (`until: b-3.A`): the first word is cut before the second calendar week's close at Normal pace, so this glimpse shows only to slow players.
- Camp views `cv-03` (`until: b-3.A`, the hall before it is lit) and `cv-21` (the fall, weeks 10–13) were never offered in any life: a camp view comes only on a day that completes with no arrival, and those stretches are rarely where such a day ends.
- Deep beats `b-1.7` and `b-3.4` play only on a pushing day (High, a called push, or Keep going past the day). `b-3.4`'s record is also carried by `b-5.0`; `b-1.7`'s partial sign (the open hook) exists only there.

### L6. The camps' authored mornings are not wired (L; wiring)

Each camp beat has a `morning` field ("S1 re-rendered with HERE and DOOR", "the mark on the map: the lintel marked as a door", "the different hook on the wall by the lamp, highlighted once", "the map: two ways down…", "L8 next"). Nothing reads it. The Morning screen offers "read" on *the newest record with a guessed mark*, which is often not the record the morning was written for (week 3's is S1; by then the newest is usually another). The map marks and the highlight do not exist. **Fix:** point the Morning screen at a record named in data (a `morningRecord` id per camp), or drop the field.

### L7. Smaller content notes (L)

- `mk-world`, `mk-hear` (week 14) have no confirming beat, so they stay guesses at the MVP's end: intended (STORY_JOB §8.3: they settle in week 15 or later). Recorded so nobody "fixes" it.
- `rec-k2` is the only cut record without a `full` rendering, so the rendering test cannot check it.
- `rec-x-comb` cuts the same ring twice with two renderings ("Ashti" and "the ring"); harmless until NAME (week 30), then the second reads oddly.
- `b-w14.morning` and `b-w14.camp` say nearly the same thing (the log's hold-mark is not "hold").
- `b-w14.close` describes the stone "past" a door that is shut.
- `b-w13.morning` says "he counted the lamp marks" in the app's voice; STORY_JOB §8.8 removed *he* for whoever cut the tally in weeks 8–14. Here *he* is the teller (the salt-cutter), so it is defensible, but it is the one place the rule's spirit is close.

### L8. Sealed docs disagree on one niche (L; story call)

The child's pocket compass: `LIVES.md` (X-compass-child) has it in her folder, as paper of its age with a child's scrap (*it points at the hill. mam says leave it.*), "not the Loud Room"; `NICHES.md` and STORY_JOB §8.3 put it in a blast-room niche, "the app: it points at the hill". The app (`seal-12-6`) follows NICHES but its line drops "it points at the hill" ("Its needle is stuck fast against the glass"), so the link to E3's compasses is now the reader's to make. Decide which doc is canonical; fix the other.

### L9. Stale comments and dead data (L)

- `story-types.ts`: `BeatKind` still says `stepKey` "plays when its sealed thing's Key lands" and `arrivalKey` "a named place that plays when its Key lands"; `RouteWeek` says `k` "marks a place that plays when its Key lands". Since D-129 these play on the road.
- `route.ts`: `kGated` flags on six places are read by nothing.
- `paint/places/ai/README.md` says the 41 places of weeks 8–14 "show stand-ins now and have no kit painting yet"; all are painted.

## Not findings (checked and fine)

- D-073: no truth before its guess in any life (guards clean, Keys spent).
- D-129: no place waits on a Key; no Key opened a road row; every niche reachable by Keys in any order.
- Rule 6: every plant of weeks 1–14 checked against CLUE_LEDGER / STORY_JOB §8.6 has a predetermined truth; nothing contradicts WORLD_TRUTH.
- Nothing played twice; no record shown before its row; no find from an unvisited stretch.
- Paintings complete; no sealed text in the copy, the open docs beyond week-1 surface, tests or commit messages.

## Suggested order of fixes

1. H1 (glimpse `until`s) and L1 (asterisks): small, no story change beyond naming the superseding beats.
2. M1/M2 and M3 together (camp lines not tied to the current story week).
3. M5 (month summaries by story progress; six-line cap) and M4.
4. Story calls for Dan's story session (never in chat with Dan): M6, M7, L4's names, L8.
5. L2, L3, L6, L9 in a tidy pass.

## Built (FIX-LIST Stage 7, 2026-10-02)

- **H1 (S#1):** `until` on `b-w1.close` (`b-3.A`), `b-w4.close` (`b-7.C`), `b-w6.close` (`b-7.A`), `b-w9.close` (`b-10.A`), as in the table. At Normal pace `b-w6.close` now never shows (the story passes `b-7.A` before a close can show it), as `b-w2.close` already didn't.
- **M2 (S#2b), and M1 with it:** goodnight plays the earliest unplayed camp line with `w <= st.week` whose `req` is met and `until` is not. `b-w7.camp` now plays (the first kept night after `b-7.C`) with its `req` unchanged; whether to move it to `b-7.A` stays a story call.
- **M3 (S#3):** accepted as D-073's consequence; the probe is kept as an "accepted" control.
- **M4 (S#4):** a glimpse more than 3 story weeks behind is passed and never shown; learned lines: 3 per story week begun in the calendar week, at most 9.
- **M5 (S#5):** "so far" by story week: each month's lines (month `w` <= the story week) not shown yet whose beats have played, six at most a page; play weeks no longer decide.
- **L1 (S#8):** `*…*` rendered as italics (`src/ui/Prose.svelte`, `src/ui/emphasis.ts`) everywhere story text shows; the source keeps the asterisks.
- **L2 (S#9):** at load (`content/sealed/index.ts`, `curl`), every straight apostrophe inside a word or closing a plural possessive becomes `’`; double quotes untouched.
- **L3 (S#10):** "in your first week" → "when you first came down" (`b-2.2`, `b-2.A`, `b-3.3`); `b-w3.close` begins "You end at…".
- **L5 (S#12):** `nextCamp` offers an unused view with an `until` first (here, then back along the route): `cv-03` and `cv-21` now come. `b-w2.close` (slow players only) and the deep beats `b-1.7`, `b-3.4` (pushing days only) are left by design.
- **L6 (S#13):** `morningRecord` on ten camp beats, from their `morning` notes (S1, S2, S4, S8, V1, V2 by id); the Morning screen's "read" opens it when held, else the old rule. Not set for weeks 2, 4, 7 (the notes name map marks and a highlight, which don't exist) nor week 5 ("L8 next" names a record not yet held then).
- **L9 (S#16):** `story-types.ts` comments (a `stepKey` plays when its sealed thing opens, a niche by a Key or a road row; `arrivalKey` and `k` on the road); `kGated` removed; the painting README updated.
- **Left for the sealed story session:** M6 (S#6), M7 (S#7), L4's names (S#11), L8 (S#15), and M1's `req` (S#2).
