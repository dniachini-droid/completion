# The deep review: the build list (D-147)

> The working list for the window that builds everything from the deep review. Dan chose **every recommended fix and improvement** in [MORNING-REPORT.md](MORNING-REPORT.md) (his answers: [DAN-CHOICES.md](DAN-CHOICES.md); the decision: `DECISIONS.md` D-147). Tick each box as it is built. Each item names the report that has the detail (file:line, repro, suggested fix): **R** = [RULES](RULES.md), **P** = [PLATFORM](PLATFORM.md), **H** = [HANDS-ON](HANDS-ON.md), **W** = [THREE-WEEKS](THREE-WEEKS.md), **C** = [CODE](CODE.md), **A** = [WORDS-A11Y](WORDS-A11Y.md), **F** = [PERFORMANCE](PERFORMANCE.md), **S** = [STORY-SPOILER-FREE](STORY-SPOILER-FREE.md) (detail sealed: `docs/narrative/sealed/reviews/DEEP-STORY.md`), **D** = [DESIGN](DESIGN.md), **Q** = [PRODUCTIVITY](PRODUCTIVITY.md), **V** = [VERIFIED](VERIFIED.md) (the checker's minimal fixes and risks: read its row before each fix).
>
> **How to build it.**
> - Work on `claude/review-round-5`, in the stages below. Commit and push after each stage.
> - Before each fix, flip its probe in `app/tests/review/deep-*.test.ts`: each one asserts the bug as it is now. Make it fail on today's code, then make it pass.
> - Add a rule test or a flow (`app/tests/flows/`) for each fix.
> - Run `npm test`, `npm run typecheck` and the flows at 390 × 844 and 360 × 780.
> - At the end: a fresh adversarial review of the whole branch, its findings fixed, then Dan's OK, a squash merge into `main` and one TestFlight send.
> - **Spoiler-free:** the story's wiring fixes are done from the sealed report. No sealed text goes in commits, this file or the PR.

## Stage 1: urgent
- [x] **U1 A closing screen wipes what the same tap saved.**
  - Keep the true log in a plain private field in `ui/game.svelte.ts`. `do()` and `append()` work from that field, so a teardown holding stale state can't shrink the log.
  - Teardowns: `Delve.svelte:139`, `Daybook.svelte:59`.
  - Flows: Look ahead → pin a job → leave (the pin survives a reload); Plan it for me; Not yet + note → Back to today (lands on Today).
  - (V NEW-1, W F2.)
- [x] **U2 Head start paid on every restart.**
  - Keep both guards: a later morning find, or a later `stepsGained` with `job: 'sleep'`. The find is given separately, once.
  - (R#1; V: the edge case on old saves.)
- [x] **U3 Delve now: no end alert, no panel.**
  - Lay out alerts and the panel on any change of the run, whatever the command.
  - Add a test that every way of starting a delve lays them out.
  - (C#1.)
- [x] **U4 The save watched item by item.**
  - `facts = $state.raw`, and Settings' `asking` too.
  - CI's battery check also runs on a played save of 3–6 months (make one with the rules, as `tests/flows/saves/` does). Its limits must hold there.
  - (F#1, F#3; V.)
- [x] **U5 The word's "Later" forgotten on restart.**
  - Keep it per save (`platform.store`). After days away the welcome back comes first; the word waits as Today's line.
  - (W F3.)

## Stage 2: the rules
- [x] **B2 Later delves join the day's session (Dan's choice).** Every delve on a recurring job that day adds to its session (3 + 60 = 63), counted for the Key; `paidBefore` still stops double pay. (R#3.)
- [x] **B3 Take back the tick (Dan's choice).** "Not done after all" on a ticked job takes its ticked minutes off the road; a re-tick pays only the new amount; delved minutes are never taken back. Nothing already reached is taken away (rule 9): if the taken-back minutes had already carried him past a place or chamber, it stays reached and the flame stays put. Those minutes are owed instead: the next real minutes fill them before the flame moves on, and the screen says so once, plainly ("The 3 h were taken back: the next 2 h 30 min make them up."). (R#4, A#28.)
- [x] **B4 Every N days:** a Key whenever `!keyedAlready && sessionsIn(min 5) >= 1`. (R#2.)
- [x] **B5 The side chamber passed in a big move:** check each stretch's chamber before each arrival. (R#5.)
- [x] **R#6 Flying west:** the game day never goes back behind the latest opened day.
- [x] **R suspicions (4):** look at each; fix the ones that are real (a one-off made recurring keeps its Not yet minutes in its count; a stopped rhythm's Key; `paidBefore` for a former recurring job; `pauseAway`'s stamp).
- [x] **Part 2 #1 Welcome-back day:** missed recurring sessions don't pile onto it; its line is just what was planned for that day (W F4, Q#2).
- [x] **Part 2 #2 Ticks:** add 5 and 10 minutes to the tick sheet; no cap (D-134 stands).
- [x] **Part 2 #3 The finish line:** a job added today always joins the line, never "If there's time" (W F10); "Not today" shortens the line, never refills it (W F9).
- [x] **Part 2 #4 Every 2 weeks:** counted from the last time done (planned like every 14 days; its Key per 14 days as B4) (W F6). Existing fortnightly jobs carry over from their last session.
- [x] **Part 2 #5 Passed appointments:** every appointment that went by while away is asked about, in one list, on the welcome back ("went by · still needed?"), alongside the dated job (W F5).
- [x] **W F12** A recurring job kept up past the week's 5 Keys says so: "This week's five Keys are already earned."
- [x] **W F11** The avoided job still holds the day's gold after 6.5 hours: **kept as designed** (D-143 G names it). No change, and no work needed.

## Stage 3: screens and getting around
- [x] **B1** "Use it here / Keep it" hidden once chosen (`Return.svelte:29` `chosen !== 'used'`); the choice kept across restarts. (W F1, H#1.)
- [x] **B6** The Map says "Behind you" / "Ahead" as Today does (`Map.svelte:77`). (A#4.)
- [x] **B7** The morning screen never goes on the back trail. (C#2.)
- [x] **B8** Leaving the word clears it from the trail; the place's name on Today reads the place, never the word. (H#3, C#8.)
- [x] **B9** A tick's count plays once (`moment.ends[seq]` as Delve does). (C#9, H#2.)
- [x] **B10** The set-up: no overlap at any size (with a note, a carry line, a 3-line or 120-character name); the note shown in full (a few lines). (H#4, H#5.)
- [x] **B13** The road line while a word waits counts from the last place reached. (W F7.)
- [x] **B17** The Week's + on a name already had says what happened, in the Satchel's words. (H#7.)
- [x] **B19** A later week: "no plan for that week yet"; its arrow names it rightly; Next ⇄ This leaves no dead back step. (A#2, A#3, C#4.)
- [x] **C#3** A new day reached on waking clears the trail, an open menu and the Undo (and the error screen's reset too).
- [x] **C#5** No command while the return from another app is being taken (the `#waking` guard in `do()`).
- [x] **C#10** The set-up and "I can't start" go to the delve only if the run started.
- [x] **C#13** The "is in a delve" refusal only for a delve still under way.
- [x] **C#14** Tonight's message timer cleared.
- [x] **H#6** With the keyboard up, the "Where did you stop?" box scrolls above it; the end's ring and road labels never collide.
- [x] **H#8** "Use one here" on Today uses a Key here (Use it here / Keep it) when something is locked where Dan is. Otherwise the link reads "On the Map". Merge Today's two Key links into the one-line Key block (D simplify 2).
- [x] **H#9** Delete on a recurring job from Today's menu asks once ("Delete Gym and its plan?" · Delete · Keep); Undo stays.
- [x] **H#10** During an errand run, its errands are marked on Today ("in the errand run"), their greyed menus say why, and no menu covers "Strike them off".
- [x] **H#11** One name limit (120) in every box, never a silent cut.
- [x] **H#12** Today's fixed header has a backdrop; rows never show through the passage.
- [x] **H#13 / A#50** A place read again says "Read again", not "Arrived".
- [x] **H#14** The tap guard never swallows a second "Add a job".
- [x] **H#15** The errand run's set-up: "… and N more", never an ellipsis.
- [x] **W F8** After days away: the welcome back, then Today (the morning folded into the welcome; the word as Today's line, U5). On Mondays: one screen before Today, not two.
- [x] **W F13** The welcome never says "Ahead of you: X" while Dan stands at X.
- [x] **W F14** The job editor: no doubled "on the 20th"; no "counts from next week" on a new job; any 5-minute length can be set again (Course's 50).
- [x] **W F15** A passed "by" date drops from the line once its question is answered.
- [x] **W F16** Check on a WebKit flow that every painting loads; no CSP change unless something fails.

## Stage 4: the save and the phone
- [x] **B12** "Again in 10 min" handled in Swift (it works with the app closed); a snooze is cancelled when its job is done or deleted (`AGAIN_IDS`). (P#1, P#7.)
- [x] **B14** Restore tries the copy on the rules before writing it, and refuses it plainly if it can't run. The start-up error screen gets "Save a copy" and "Undo the restore"; `readKept()` is guarded. (P#4, P#17.)
- [x] **B15** A save this build can't read (newer, or broken) is never written over. Say "This save is from a newer version of the app: update it" and keep it safe. (P#5.)
- [x] **B16** The delve's alerts are laid out one batch at a time, in order, like the reminders. (C#7, P#7.)
- [x] **P#2** Reminders laid out again on a time-zone change (the zone goes into the cache key).
- [x] **P#3** The leftover 15-second timer is cancelled on the next trip.
- [x] **P#6** The calendar is compared as a set, sorted by start, before writing. A failed or revoked read is reported as failed (Swift too), never as "empty". (C#6.)
- [x] **P#8** A Siri job is written to the save before it leaves the inbox; the Away leave-time likewise.
- [x] **P#9–P#24, every minor item**, with each one's suggested fix:
  - the reminder cache is set only after success;
  - a write that never answers times out;
  - the save check compares the whole log;
  - a hand-saved copy is never pruned as the weekly one;
  - the daily backup is made once a day, not at every start;
  - the Live Activity calls run in order;
  - no phone banner over an open delve (`presentationOptions`);
  - long-press haptics via `platform.haptics`;
  - sound after an interruption, and the sound engine resting;
  - one window, not two;
  - a Siri job while the app is on screen is taken at once;
  - kept copies pruned (keep the latest few);
  - promise rejections caught.
  - P#10 (a force-quit within 15 s) is left as designed.

## Stage 5: words and accessibility
- [x] **B11** The editor's line follows the job: recurring jobs start at their own minutes; one-offs at 30. (A#1.)
- [x] **B18** "On top of the {min} already counted". (A#5.)
- [x] **Every other item in WORDS-A11Y (A#6–A#50)**, with its suggested replacement. Among them:
  - one way to write a length;
  - "Once a week", never "1 a week" (C#16);
  - 24-hour times everywhere;
  - "Return" made clear;
  - no reminder that calls Dan back to the app;
  - the late-night line without what he missed (rule 9);
  - one name for the trial screen, with no decision numbers on screen.
- [x] **Accessibility (A#33–A#49):**
  - honour the phone's text size (Dynamic Type), with layouts checked at the larger sizes and at 360 wide;
  - menus and sheets take VoiceOver focus and return it;
  - the ring reads its minutes once;
  - each unknown symbol has its own name;
  - the road line is spoken;
  - Today's rows read the job first;
  - faded text is hidden from VoiceOver;
  - targets at least 44 pt;
  - no text under 14 px;
  - Reduce Motion followed live.
- [x] **C#11** "about 60 min" only from 60; **C#12** "Back to …" labels.
- [x] **C#15** Type-check the `.svelte` files (`svelte-check` in `npm run typecheck`); remove the `as never` / `as CopyKey` casts that hide copy-key mistakes.
- [x] **Cleanup:**
  - C#17–C#22 (dead branches, unused or one-way facts, small timers);
  - the ~34 unused copy keys (A#19, C#20);
  - the stale review tools that look for removed labels (`tests/review/tour.mjs`, `lib.mjs`).

## Stage 6: performance
- [x] **F#2** The Map's sparks rest (CSS `offset-path` motion, or SMIL paused and unpaused in `rest()` / `wake()`).
- [x] **F#4** The rules index the log once per log (by type, day and week, with `calendarWeek` cached). The delve's once-a-second tick recomputes only the run's part of the view.
- [x] **F#5** Fog drawn at low resolution and scaled up; each fog's two banks merged; no `will-change` on warm banks at warmth 0.
- [x] **F#6** Pre-blurred pictures for the tunnel's nebula and glows; `screen` blending only where needed.
- [x] **F#8**
  - remove `-webkit-overflow-scrolling` (`Map.svelte:334`);
  - shrink `.wash` (`Words.svelte:29`).
- [ ] Re-run `deep-perf-big.mjs` and `deep-perf-frames.mjs` on a 6-month save; the numbers go in `technical/PERFORMANCE.md`.

## Stage 7: the story's wiring (B20; build from the sealed report only)
- [x] S#1 (the glimpses), S#8 (the asterisks), S#2b, S#3, S#4, S#5, S#9, S#10, S#12, S#13, S#16: the wiring, with no story decision needed. Built: glimpses stop once the story moves past them and lag at most 3 story weeks; bedtime lines no longer tied to the story week (so S#2's line now plays too); S#3 kept on purpose (a morning's confirmation never waits on bedtime, D-073); more learned lines when several story weeks were walked; the monthly summary by story progress, six lines a page; emphasis in italics; one apostrophe; no calendar-week wording; camp views that would expire come first (the rest of S#12 is by design: one glimpse only a slow player sees, push-only moments); the morning's "read" points at its own record where one is named; stale comments and dead data gone. Rule tests: `tests/rules/story-wiring.test.ts`; probes turned round in `tests/review/deep-story.test.ts`.
- [ ] S#6, S#7, S#11, S#15 and the small calls in S#2 go to a **sealed story session**. Dan only needs to know they're pending. (S#2's line now plays through the S#2b wiring; whether its own condition should change is still the story session's call.)

## Stage 8: improvements (MORNING-REPORT Part 3, and the simplifications)
- [x] **3 The avoided job's mark:**
  - a hollow gold ◇ on an "I tend to put this off" job's row (and in its VoiceOver name);
  - "a find waits" on its set-up;
  - on its return, the find shown first.
- [x] **4 "Can't get started?":**
  - one quiet line at the foot of Today until the day's first start, opening "I can't start" for the first undone job on the line (the avoided one first);
  - the same line on every delve set-up;
  - it stays in the job menu too.
- [x] **5 Last night's choice starts the morning:** when Tonight's first job was chosen, the morning screen's button reads "Start with X", and Today shows "You chose to start with X · Begin" until it is started or the day ends. Tonight's choice is offered all evening, not only the last hour. (D-135 stands otherwise.)
- [x] **6 The 5-minute mark:** a notch on the ring at 5 minutes (the lock-screen panel too), and the line under the countdown says "It counts now." once. No sound.
- [x] **7 "Just this one today":** one item in the job menu sets the day's other jobs aside, with one Undo.
- [x] **8 Re-reading made felt:** when a symbol becomes known, "N records you found now read differently · Read them". A soft glow on those records until opened. Check in a sealed session that no change tells more than the symbol does.
- [x] **9 The week's close as a chapter:**
  - order: the furthest place reached, with its painting, then Learned, then Further on;
  - the tallies on one line;
  - the "Look ahead" offer as one quiet link at the foot (D simplify 3).
- [x] **10 A Map that connects:** a faint gold path between the places walked; the next place as a dim outline with its minutes. Keep the forecast waypoints uncluttered.
- [x] **Simplify:**
  - "Errand run" off Today's main screen (kept in the Satchel and the job menu);
  - Today's Key block as one line ("5 Keys · Use one here" / "· On the Map").

## After this build (recorded, not in it)
- **Part 3 #1 The test:**
  - once this build is on TestFlight and Dan has used it a few days without an urgent report: a feature freeze (bug fixes only), a fresh save, the 10-minute baseline chat (MVP → "Before day 1"), and the seven-week test (Phase 10 needs Dan's agreement to the phase change).
  - New ideas go on a list for after week 3.
- **Part 3 #2 / question (c) The story ahead:** yes. Start writing further on in sealed sessions now, in their own windows alongside this build. Keep at least 4 weeks of written story ahead of Dan's real pace. The gauge is hours of written story left ÷ Dan's weekly minutes.
- **Part 3 #11, only if the test shows the story pulling:**
  - the world widget (never a job);
  - records grouped by whose life (released by the story);
  - words as powers on the Map.
- **Question (a) The big button:** keep "Add a job" (D-135). Part 3 #5 gives the morning a big Begin when Dan chose a job the night before.
- **Question (b) Keys rarer:** no change during the test, because an economy change mid-test muddies it. Look again at week 3 with real numbers: Keys earned, Keys kept, things opened.
- **Not chosen, for after the test** (from the reviewers' longer lists):
  - a rest day set in the Week (Q#6);
  - dates understood as typed (Q#7);
  - a tick's story moment saved for later (Q#8);
  - "If there's time" folded (Q#9);
  - last night's lines offered "+ today" (Q#10);
  - "Ahead" as one line, sealed writing (D#7);
  - "Waiting on…" folded into "Put on a day" (D simplify 4);
  - the Daybook's per-job tallies (covered by #9).
- **Owed:** a Safari-engine pass of the hands-on and performance reviews. CI's WebKit flows cover the checks; the exploratory scripts in `tests/review/deep-hands-*.mjs` and `deep-perf-*.mjs` take `BROWSER=webkit`.
