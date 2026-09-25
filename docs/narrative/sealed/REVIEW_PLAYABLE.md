# Story review of the first playable — SPOILERS

> **Sealed (D-015).** Adversarial review, lens: the story end to end for the six weeks the MVP carries, as the app actually plays it (`app/src/core/story.ts`, `game.ts`, `app/src/content/sealed/`), checked against `MVP_CONTENT.md`, `ARRIVALS_REGION1/2.md`, `FAIR_PLAY.md`, `PLAYER_KNOWLEDGE.md`, `PACING.md`, `LAMP_ANCHORS.md`, `WORLD_TRUTH.md`. Written 2026-09-25 on branch `claude/delve-selection-ux-flow-ma4sis`. The spoiler-free version of each finding was returned to the orchestrator; this file holds the detail.

## How it was checked
Simulated play with `tests/rules/sim.ts` (Dan's real jobs and rhythms from `content/world/dan.ts`): six Normal weeks with bedtime kept, the same without bedtime, six Low-heavy weeks (5 Low days, 2 away), six High weeks, 40 random mixes of Normal/Low/High/away (half with bedtime kept), and a variant of the sim that never answers the GIVE guess. Each run logged story weeks, arrivals (foot/key), beats, seals, guesses and records in order; a checker flagged beats/arrivals played before their `req`, confirmations before the mark was offered, and known contradictions. Scratch scripts only; nothing in the repo was changed except this file.

## Findings (detail)

### 1. BLOCKER — an unanswered GIVE guess freezes the story for good
`b-3.A` (the word) has `req: ['b-2.B', 'mk-give']`; every other week-3 place requires `b-3.A`; `weekDone(3)` needs them all. The guess is optional on every screen (Return, Arrival, Marks). Sim that never answers GIVE: story week 3 begins on time, then **24 consecutive days end at the same camp (`cv-10`)** until the end of the run; the story never moves again. In the same run the week-3 Key opens `seal-3-1`, and `landKey` plays its arrival **`b-3.B` (the head of the Stair, "light that is already burning") while the lintel is still stone** — `arrive()` never checks the beat's `req`. The same pattern exists at `b-7.A` (req `mk-path`, `mk-open`) with `b-7.C` (the great door word, via `seal-7-5`) able to play before the lintel it repeats.
Fix: a word never waits on a guess. Drop `mk-give` from `b-3.A.req` (keep `b-2.B`, add `b-2.2`); if the mark is still unguessed when the word plays, ask it inside the Cut screen before tap 1 (one tap, any candidate). Same for `b-7.A`. In `landKey`, never `arrive()` a beat whose `req` is unmet: leave the seal shut (skip it in `nextSeal`) until it is.

### 2. MAJOR — the "morning" confirmations fire before the mark is ever offered, and only with bedtime kept
`mk-here`, `mk-door` (`b-w3.morning`), `mk-deep` (`b-w4.morning`), `mk-go` (`b-w5.morning`), `mk-eat` (`b-w6.morning`). The camp line plays on the **first** kept goodnight of the story week (usually Monday night), so its morning plays Tuesday, before the Key tablets that offer those marks (`seal-3-1`, `seal-4-1`, `seal-5-1`, `seal-6-1`) usually open. Checker: in 17–20 of 20 bedtime-kept runs, each of the five was confirmed before offered. Effects: the records render HERE/DOOR/DEEP/GO/EAT in English before the mark was introduced (breaks MVP §13 "no mark renders in English before its week"); the guess is later offered for a mark already settled (`Guess.svelte` shows options; the first guess is accepted); Settled never shows the moment; a tempting wrong guess is struck silently. In the Low run DEEP was "learned" without its tablet ever opening. Without bedtime kept (normal_no_bed run) the five **never** confirm in six weeks, so a wrong guess stays wrong-rendered for the whole test; this contradicts D-073's "Late or missed: nothing is said and nothing is lost".
Fix: confirmation must follow the offer, not the bedtime. Either (a) move `confirmedBy` to real beats that follow the offer (HERE/DOOR → `b-3.3` or the first arrival after `b-3.B`; DEEP → `b-4.A`/`b-4.4` if after `b-4.2`, else the next arrival; GO → `b-5.2`/`b-5.3`; EAT → `b-6.3`), or (b) keep morning ids but give each morning a `req` (the offering beat) and play it at the first opening after that req is met, bedtime or not (bedtime adds the camp line and a find, never truth).

### 3. MAJOR — Keys open sealed things that are not yet in view, including the first Key of the game
`nextSeal` ignores MVP §0.2's "opens the first sealed thing … that is in view; if none, at the next arrival". Normal run: `seal-1-1` (`b-1.6`, "In the Salt Gallery, where the first stretch of the line ends…") opens on day 2 **before `b-1.5`** introduces the Salt Gallery; in the High run it opens on day 1 before `b-1.B` (the corner, first smell of salt). The first Key of the whole game talks about a place Dan has not been told of. Checker: `b-3.B` before the word in 4/40 runs; `b-3.3` ("Now that the hall is lit") before `b-3.A` in 2/40. `seal-1-3` also opens before `pl-w1-below-the-lamp` (acceptable per the build rule, but the in-view rule would avoid it).
Fix: `nextSeal` takes only seals in view (carried by a played beat's `inView`) or whose arrival beat's `req` is met; add `inView: ['seal-1-1']` to `b-1.5` and `inView: ['seal-3-1']` to `b-3.A`; a Key with nothing in view waits (the doc's "opens at the next arrival").

### 4. MAJOR — last week's plain niches jump ahead of this week's story Keys
`nextSeal` sorts by week then row, so leftover plain seals from earlier weeks (saucer, brass tag, flask, tea box, torch…) open before this week's story seals. BALANCING §3 / MVP §0.2 say "story counts first". Low run: in story week 2 the Keys went to `seal-1-3`, `seal-1-5`, `seal-1-6` before the tin box `seal-2-1`, so the rod and the first word slipped a full calendar week; by the end of six Low weeks the DEEP tablet (`seal-4-1`) never opened while five plain week-3 niches had.
Fix: order due seals as (story seals of any week ≤ current, by week/row) then (plain seals), where "story" = has `carries.guess`/`records`, an `arrival`, or a `beat` on the route.

### 5. MAJOR — camp lines play without their preconditions
`goodnight` picks the story week's camp beat by `w` only. Low run: `b-w3.camp` ("The lamps along the hall are lit now…") played the night **before** `b-3.A` lit them. `b-w7.camp` ("The great door at the far end is open now") can play before `b-7.C`. `b-w6.camp` (the carved lamp's sharp cuts) lands best after `b-6.1`.
Fix: give camp beats `req` (`b-w3.camp` → `b-3.A`; `b-w6.camp` → `b-6.1`; `b-w7.camp` → `b-7.C`) and have `goodnight` choose the camp line only when met.

### 6. MAJOR — D-077 moves a guess to whatever place the job reached, often the wrong one
`arrivalOf` pulls the job's return guesses onto the arrival that same job reached. The K-gated places make this systematic: `seal-5-1` (the tablet under the second turn: ONCE, PATH, GO) and `b-5.A` (the salt tally) came from one job in the Normal and High runs, so the three marks are asked **at the salt tally**, which is also `mk-once`'s confirming beat: `Settled` on that screen is derived, so the moment Dan taps a candidate the verdict appears on the same screen (a tempting "evening" is struck instantly), against "never wrong at guess time". `seal-2-1` (tin box: PERSON, ONE, ME, GIVE) and `b-2.B` (the rod) coincide the same way (Low and High runs). The reminder line "One of the marks you saw at {place}" (`seenAt`) points to the first place whose records hold the mark (e.g. ONCE → the Lamp Hall; DOOR → the rod), a third place. This generalises Dan's "asked one place late" instead of fixing it.
Fix: move a guess to the arrival only when that arrival's own records or line carry the mark; otherwise keep it on the step screen before the arrival plays. Never ask a guess on the screen of its own confirming beat (defer the confirmation to the next beat). `seenAt` should prefer the beat that offered it (the tablet), described by its `where`.

### 7. MAJOR — her hand-mark is drawn as his
`Records.svelte` draws every `{hand}` token with the `mk-hand` glyph (a hook closed on a dot); `render()` keeps `who` but the view ignores it, and `lettering.ts` has no glyph for hers. So `rec-l1` (the wall by the lamp) and `rec-l4` (the rod's handle) show **his** mark in her corner. That contradicts `b-2.B` ("a hook with a tail"), `b-4.4` ("the hook in the corner is not this hook"), `wc-w4-2`, `sf-m2-3`, and the voice rule's fixed names; it breaks R2's fair-play base (FAIR_PLAY R2: "Her hand-mark differs (C-28)"). `marksSeen` also adds `mk-hand` for her tokens. The week-4 morning that ARR1 specifies ("the different hook on the wall by the lamp, highlighted once") is not implemented (Morning shows only Settled + a find).
Fix: add a `hers` glyph (hook with a tail) in `lettering.ts`; Records chooses by `who`; `marksSeen` adds `mk-hand` only for `his`; implement the week-4 morning highlight (or a line) so C-28 surfaces as designed.

### 8. MAJOR — quoted renderings in beat lines are hard-coded to the right answers
`b-6.A`, `b-6.B`, `b-6.3`, `b-7.2`, `b-7.B`, `b-7.4` quote partial renderings as fixed text ("…way … here … once… went deep… A lamp, lit"; "…one ate…door open…"). They assume every guess is right and every mark guessed. A player who guessed "road" for PATH, "two" for OPEN, "arrive" for GO, "well" for DEEP or "bread" for EAT reads the true word in the arrival text weeks before its designed confirmation (PATH/OPEN at week 7), while his Records show his own guess: the arrival quietly answers and contradicts him. If a guess was skipped, the English leaks before any guess.
Fix: store the quoted span as a record reference (`rec-v1` line range, etc.) and render it with `render()` at display time; or replace the quotes with a description of glyphs.

### 9. MAJOR — GIVE is asked at the tin box, and the lintel close-up can follow the word
`seal-2-1.carries.guess` includes `mk-give`, and `rawReturn` merges seal and beat guesses, so GIVE is offered at `b-2.1` (whose sheet has only "?") with a context line about a lintel not yet looked at; ARR1 puts the guess at `b-2.2`. `words.ts` and MVP §7 require `b-2.2` before the word, but `b-3.A.req` omits it: High run, `b-3.A` (lintel opens) then `b-2.2` plays ("Beneath the lintel there is no door, only stone").
Fix: remove `mk-give` from `seal-2-1.carries.guess` (keep `seen`); add `b-2.2` to `b-3.A.req`.

### 10. MAJOR — pacing: the week is spent by Wednesday, then the same camp every night
Normal/High runs: places are banked by distance and next week's `pl-` places are pulled forward on ordinary days (`nextPlace` allows "ahead" for any walk; MVP §0.2 says only a deep push / Keep going). Result: Monday often plays 2–3 arrivals back to back (10-19 and 11-02 in the Normal run); from about Thursday every day ends at a camp view, and when a stretch's views are used the first repeats: `cv-06` five days running in week 5, `cv-15` five in week 6. Days ending at a camp per calendar week (Normal, bedtime kept): 1, 1, 3, 3, 5, 5. The late weeks of the test are the thinnest.
Fix: only a High day, a called deep push or Keep going may take "ahead" places; cap banked distance at one place (walked beyond the next mark carries over at most `PLACE_GAP`); rotate a stretch's camp views (and let views of earlier stretches on the route serve) rather than repeating the first.

### 11. MAJOR (needs Dan: test length) — the six-week test ends before its next big payoff
At most one story week per calendar week means the test can reach story week 6, never 7. The second word (OPEN-WAY), the great door opening, and the confirmations of PATH and OPEN are all in week 7; ONE confirms in week 8. The test ends with the Lower Door, the little door and the second-flight lintel all shut and two of the last marks unconfirmed. Weeks 4–5 carry no model-changing reveal (R2 lands in week 6).
Options: extend the test to seven weeks (Dan's call), or in the sealed session bring one payoff into week 6 (e.g. confirm PATH or OPEN by a week-6 beat, or let the second-flight lintel's word land at the end of week 6).

### 12. MAJOR — after the first word, the cut mark still reads as a guess, and the copy says it shouldn't
GIVE is provisional (SCRIPT §7.6), so after `b-3.A` holds, "give?" keeps its question mark while LAMP (not in the word) is confirmed. The Marks screen copy (`marks.guess`) says "You will know you were right when a word you cut holds" — which just happened. A player will read this as a bug at the game's biggest moment.
Fix: a provisional mark gets its own line once its word has held (e.g. "The word held with it. What exactly it means, the place has not said yet."); `Settled` on the Cut screen can say the same once.

### 13. MAJOR — "the lamp" is still unanchored (tracked, not done)
`LAMP_ANCHORS.md` items are unchanged in the data (`b-w1.tz2`, `b-1.7`, `rec-k1.where`, `pl-w1-below-the-lamp`, ps-h lines). Also ambiguous and not on the list: `b-w1.camp`, `b-w4.camp`, `b-w5.camp`, `b-w7.camp` ("beside the lamp"), `fd-b12` ("The lamp's flame"), `b-1.3` ("the wall by the lamp" is fine), and from week 3 the second clay lamp (`b-3.B`, `wc-w3-3`, `sf-m2-6`) makes bare "the lamp" worse. Keep the planted ambiguity inside the records (S1/S4's lamp) as the file says.

### 14. MINOR — stale lines once the word is cut in week 2
`b-w2.tz2` (teaser) and `aw-w2` ("…a blank the width of its edge") and the glimpse `b-w2.close` still show after `b-3.A` has played in story week 2 (the Normal run cuts it on day 5 of week 2). Fix: `until: 'b-3.A'` on the teaser and question; a second glimpse for week 2 when the word is already cut.

### 15. MINOR — the rod's pencil line is not in Records
`rec-l4` is `kind: 'cut'` with the pencil in `paper`; Records renders only `cut`, so the "For the next one…" line is readable only on the arrival. Fix: render `paper` too when a cut record has it.

### 16. MINOR — guess contexts read as authoring notes
`Guess.svelte` shows `mark.context` as is: "her box sheet: someone", "the lintel, beside the flame's mark; her box sheet has only a question mark", "the same bar, its drop at the far end". Rewrite as whole sentences in the voice ("On her sheet, under this mark, she has written *someone*.").

### 17. MINOR — an unanswered question a sharp player will ask
Her car stood by the shaft for days, a colleague asks where she is, the council notice says the shaft is monitored, and the cap has been open with its padlock cut ever since — yet her camp eleven metres down is untouched. The canon has no stated answer for why no one came down after her (rule 6 wants one before it can be noticed). Add one line of truth to `CHARACTERS.md`/`TIMELINE.md` and, if needed, one plant.

### Outside the lens but asked for by Dan: the week plan vs Today
`planLeads` (`core/game.ts:105`) is true only after **Plan my week** (`planMade`). If the week was built by adding entries (`planAdded`), the Week screen shows a plan (`planOf` non-null) but Today still fills from every rhythm, so "Course" (4 a week, offered every day) reappears on a Friday that doesn't list it. D-078 fixed only the Plan-my-week case. Fix: `planLeads = planOf(facts, week) !== null`.

## What holds
Every `req`/record/mark id resolves; each guessed mark has four candidates with the true one; the order of her notebook days, the three hooks' names in the lines, the email header name, K1's three marks against L6, and the one-week-ahead rule for places all check out. The two-week absence pauses and resumes cleanly.

## Status (2026-09-25, the story-fix pass)
Fixed in the app and the sealed docs, each guarded by a rule test (`app/tests/rules/continuity.test.ts` unless noted):
1. A mark in a `req` is met once offered; the word's Cut screen asks an unguessed req mark before the first tap; a *(Key)* arrival waits (Key kept) until its beat's `req` is met. Test: a Dan who never guesses reaches story week 6 with nothing out of order.
2. Morning confirmations play the first morning after their tablet opened, bedtime or not; bedtime brings the camp line and a find. Tests: no confirmation before its offer; with no kept bedtime every offered morning-confirmed mark is confirmed; `b-w4.morning` plays.
3. `nextSeal` honours `inView` (`seal-1-1` in view at `b-1.5`, `seal-3-1` at `b-3.A`) and a Key arrival's `req`, else the Key is kept. Test: no seal opens before its introducing beat.
4. Story seals (step, place, record or guess) of any week up to the current open before plain ones.
5. Camp lines: `b-w3.camp` req `b-3.A`, `b-w7.camp` req `b-7.C`; `b-w2.camp` until `b-3.A`. `b-w6.camp` left as is (it describes what is there before `b-6.1`). Test: every beat's `req` met and `until` unmet when it plays.
6. D-077 narrowed: a return's guess moves to the arrival only if that place's records carry the mark, never onto its confirming beat; a tablet a kept Key opens on an arrival asks its marks there. `seenAt` unchanged. Tests: continuity (arrivals) and `week.test.ts` (D-077).
7. Her hand-mark has its own glyph (`mk-hand-hers`); Records draws by `who`; the marks list counts only his. `b-w4.morning` has one line (never names or matches the hook).
8. `b-6.A`, `b-6.B`, `b-7.B`, `b-7.4`: readings of marks not yet confirmed when they play are `[ ]`. `b-6.3` and `b-7.2` needed no change (their readings are confirmed by then, or by the beat itself).
9. `seal-2-1` no longer offers GIVE (seen only); `b-3.A` req adds `b-2.2`. Test: each mark offered only at its own guessing place.
10. Next week's `pl-` places only on a deep push; one place a day on foot otherwise (the distance is kept); camp views rotate, unused ones back along the walked route first. Test: the pace of a Normal week. Normal run now: camps per week 2, 1, 4, 3, 2, 3 (was 1, 1, 3, 3, 5, 5 with five-day repeats).
11. Open for Dan: six or seven weeks (not changed).
12. `marks.guess` copy no longer promises that a word confirms a guess.
13. Lamp lines anchored (see `LAMP_ANCHORS.md`).
14. `b-w2.tz2` and `aw-w2` until `b-3.A`; the week-2 glimpse is skipped once `b-3.A` has played.
15. Records shows a cut record's pencil line (`rec-l4`).
16. Five guess contexts rewritten as sentences; her pencilled words under PERSON, ONE and ME kept (they are her sheet's evidence, not a hint the app adds).
17. The truth of why no one came down after her is in `TIMELINE.md`; nothing planted.
(The plan/Today point is handled elsewhere.)
