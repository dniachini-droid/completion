# Current State

> **Authoritative project-progress tracker.** Read at the start of every session; update before ending every substantial session.
> If Dan asks to work on something that skips substantially ahead of the current phase, point it out and ask whether he deliberately wants to deviate from the sequence (then record any deviation in `DECISIONS.md`).
> **Spoiler-free file.** Dan reads it. Never put `docs/narrative/sealed/` content here (D-015).

_Last updated: 2026-09-24 (Phase 9: slice 2 built, D-068; a session per slice, D-069)_

## Current phase

**PHASE 9 — FIRST PLAYABLE** (Phase 8 closed 2026-09-24, D-065)

## Current objective

Build the whole MVP (`product/MVP.md` → build order): **slice 2** the Quiet answers (the map at two levels, records, a sealed thing in view, rhythms and Keys, finds), **slice 3** learning the Cut (signs and guessing, the first word, the cutting cinematic, the stair), **slice 4** the week and the gaps (the planner, the satchel, camp and bedtime, the daybook week close, absence). Each slice thin, complete and good-feeling before the next (rule 13), on the heart as built. The sealed story job is **done** (D-066, D-067), so each slice loads the real content for six story weeks from `narrative/sealed/` as it is built (never shown to Dan outside the game), and the real places' paintings are made from its briefs with the painting kit. Dan sees each slice on the web link as it lands, then on TestFlight.

## Resume here (next session)
**Each slice runs in its own session, started by the previous one (D-069).** The working branch is `claude/phase-8-continuation-ttngwy` (everything since Phase 8's merge; not yet merged into `main`).
1. **Claude: build slice 3, learning the Cut** (`product/MVP.md` → build order): the marks screen (every mark seen, its guess or meaning, a struck guess as one line, SCRIPT §9), the confirming beats (a guess settling when its place confirms it), the words as the real cutting cinematic (the story job's §7: `wd-light` at the lintel, the hall's cups waking; the stair's "Go down", D-039), the partial signs of a deep push, and the Cut's own lettering for the marks (replacing the stand-in `ui/Glyph.svelte`). Read first: `game/CORE_LOOPS.md` (decode), the D mock-ups `cut.html`, `record.html`, `stair.html`, `technical/PROTOTYPE_NOTES.md`, and D-068 (how slice 2 runs the story). Sealed sources for the builder only: `narrative/sealed/SCRIPT.md`, `MVP_CONTENT.md` §6–7, `LIVES.md`. Then, per D-069: tests, the flow walk at 440 × 956 and 360 × 780, commit, push, publish the web link (`npm run build:link`, then the Artifact at the same link, below), update this file and start the slice 4 session.
2. **The real paintings** (D-067): week 1's five places were painted from the briefs in `app/paint/places/` (sealed); the app still shows stand-ins until they are wired in (`ui/paintings.ts`, by place id, falling back to the stretch's stand-in). Continue about 5 a week alongside the slices.
3. **Waiting on Dan (whenever he's at a computer):** Apple setup sitting 2 (`technical/APPLE_SETUP.md`), then "Apple setup done"; then sitting 3 (trials b and c).
4. **The web link:** https://claude.ai/artifact/TcH91A1SxeEvEnLJbRE4pi (private; one link, updated in place each slice).

## Last session (2026-09-24, Phase 9, slice 2)
Slice 2, the Quiet answers, built on the real sealed content (D-068): the story transcribed into typed data (`app/src/content/sealed/`: the route, 78 story moments, 40 sealed things, 38 records, 48 marks, 72 finds, 160 passage lines, camps, teasers, week-close lines), the story's rules (`app/src/core/story.ts`: the story clock, places by effort, Keys from rhythms with the weekly floor, a job's return, finds), and the screens (Today's "Ahead", the step and the delve's end carrying the story, arrivals with the word's four taps, the map in two levels, records with computed readings, guessing a mark). 39 rule tests pass, including six simulated weeks (Normal, Low, High, an absence). The whole flow walked at 440 × 956 and 360 × 780: no errors, no network. Dan asked for a fresh session per slice, started automatically (D-069).

## Earlier (2026-09-24, Phase 8 close)
Dan asked Claude to check the story job from another session was done: it was (D-066, D-067: the review's fixes, week 6 of the ledger, before → now not needed for weeks 1–6, the MVP's content in full, 48 painting briefs), on `claude/story-job` and never merged; now merged with this phase's work, its decision numbers moved to D-066/D-067. Dan on the heart: it "ran beautifully", looked beautiful, "was great"; too small to test much (only the timer), so no more changes: build the app (D-065). Phase 8 closed with trials (b)–(d) carried into Phase 9 for the first TestFlight build. Before that, the app build was readied for them: the save is kept by the phone (Capacitor Preferences, not the browser's storage), a rehearsal now also brings the locked-phone alert 60 times sooner, and Dan's phone checklist is `APPLE_SETUP.md` → Sitting 3.

## Earlier (2026-09-24, Phase 8, the heart)
Apple setup blocked (the developer pages don't work on Dan's phone), so Dan asked for the heart slice first, as a web link (D-064). Built on the agreed stack: the rules as pure code over a fact log (a run of delves worked out from timestamps, so a locked phone or a closed app loses nothing; steps, day complete and the arrival written once when they happen), with 28 rule tests; the screens ported from direction D (Today, the dial and run line, the delve with the approved tunnel and ring, the step, day complete and the arrival, "I can't start"); throwaway content on the three invented sample places. The whole flow was walked at 390 × 844 and 360 × 780 with pictures of every screen: no errors, no network requests. Published as one self-contained page at a private claude.ai link. Compromises (no locked-phone alert on the web, browser storage, stand-in job list, no camp or map yet) are in `technical/PROTOTYPE_NOTES.md`.

## Earlier (2026-09-24, Phase 8 start, second)
Capacitor wrapper, trials screen and the TestFlight pipeline (D-063); Dan approved the three sample paintings (D-062).

## Earlier (2026-09-24, Phase 8 start)
Trial (a), the painting kit: the approved hall's method made reusable (`app/paint/kit/`: GPU ray-marching with the hall's own stone, light, haze, blur, bloom; one short scene file per place; bake, automatic checks, live layers). Three invented sample places: **The Well Stair, The Rib Gallery, The Pool Dome**. A critic (a second Claude) scored the first round 4, 6 and 5 of 10 against the hall (`app/paint/CRITIQUE-1.md`: the gold was gone, the darks washed out, focal lights hard-edged); one revision round addressed its blockers. The kit repaints the approved hall itself almost exactly (a regression scene), so it is the same hand. `app/` skeleton created with the first rule (the 04:00 day edge) and its tests. Dan's Apple steps written (`technical/APPLE_SETUP.md`). D-061.

## Session before (2026-09-24, Phase 7)
Dan's answers (D-056): **iPhone, staying; no computer; up to ~$99 a year is fine; paintings stay code-painted.** `technical/TECH_DECISIONS.md` compared five options and recommended **web code in a real iPhone app** (TypeScript, Svelte, Capacitor), packaged by a cloud Mac and installed through TestFlight, everything on the phone, no server, no AI (D-057). The paintings: a **painting kit** from the approved hall's method, one short scene file per place, baked in the cloud with live layers on top, checked and critiqued, one painting session a week; Dan judges **three invented sample places** first. **Dan agreed** (D-058). Then the four technical docs (D-059): `ARCHITECTURE.md` (five parts, one-way dependencies, a log of facts as the source of truth, gifts recorded once, timers as timestamps, screens see only what's unlocked, all copy in one file), `DATA_MODEL.md`, `SECURITY_PRIVACY.md` (nothing leaves the phone; notifications the only permission), `TEST_STRATEGY.md`. Dan closed Phase 7 (D-060) and noted the story job still to do: it comes after the prototype and before the first playable's content, not after the MVP (the MVP carries the story's first six weeks).

## Earlier (2026-09-24, Phase 6)
`product/MVP.md` drafted (D-053). The first playable was already cut hard in Phase 5, so the MVP keeps it whole except a few second doors: the map's whole-Site zoom, forecast waypoints on the map, the morning deep push, and before → now unless the story needs it. The real size is in paintings and words: one painted scene per area proposed, and a content budget for six story weeks. Build order in four slices; the test starts only when all four are in. The central test is written: it measures **starting** (above all avoided jobs; started from the app vs logged afterwards), with a baseline chat and predictions before day 1, notes kept on the phone, three short chats, evidence for and against, what not to overinterpret, and what each answer leads to.
Dan's answers (D-054): a painting for **every** named place (Phase 7 must find how to make about 5 a week); map waypoints and the morning deep push stay; test notes stay on the phone, shared only if he chooses. Dan approved the MVP and closed Phase 6 (D-055).

## Earlier (2026-09-24, planner reconciliation)
ChatGPT's second planner review reconciled (D-047): 6 accepted, 1 modified, 8 already resolved. Dan decided the Course day counts at its first hour; the run now has its own "enough" moment, then Continue or Back to today with equal weight. Each job counts at its own enough (not "one hour" for everything). New invariant: more rhythms never mean more Keys. Copy fixed (forecast words, "A lighter day.", "Stop repeating"). Screens checked at true phone size. Dan approved; the planner is locked and rhythms are folded into the docs (D-048). Then step 3, the numbers (two clocks: time moves the Site, the story keeps its order; 5 Keys a week with a floor of 2; D-049), and step 4, the first playable's contents (D-050).

## Earlier (2026-09-24, late night, second)
Phase 5 step 2: the concept stress-tested against the principles, the anti-features and the §71 checklist, with six walkthroughs (`product/STRESS_TEST.md`). It holds; 16 small gaps closed with one rule each (D-043), folded into `CONCEPT.md` and the game docs. The biggest: the day ends at about 4 am; capacity works all day; every delve minute counts on any job; the return after a week away never opens on a pile. Two points wait for Dan; seven numbers go to step 3.

## Earlier (2026-09-24, late night)
Phase 5 step 1: `product/CONCEPT.md` written, one page under MASTER_BRIEF §59's headings, pulled only from agreed docs (nothing new invented; player-safe, from the open game bible). It ends with the known gaps for steps 2–3.

## Earlier still (2026-09-24, night)
ChatGPT's review of the principles reconciled (D-038; Dan agreed with every verdict). No dead ends for effort: the stair screen now offers "Go down" (D-039). Every screen keeps moving once settled, and the stair lights its steps going down (D-041); any job can be a delve, Dan's choice (D-041). Dan approved direction D and the three design docs; Phase 4 closed and merged into `main` (D-040).

## Do NOT work on yet

- A slice before the one before it feels good (rule 13); anything in `product/FIRST_PLAYABLE.md` → "Out".
- Showing any sealed story content on a screen or in Dan-facing docs (D-015).
- More story depth beyond what the playable needs (D-004). The story job is done (D-067); still later: the cadence audit of the later months after playtest feedback (D-035) and the "company at work" during a delve.
- Optional, later: the zoomed-out whole-Site map mock-up.

## Phase 9 exit criteria

- [ ] Slices 2, 3 and 4 built on the heart (`product/MVP.md` → build order). Slice 2 built (D-068).
- [ ] Carried from Phase 8 (D-065): trials (b) the delve's end with the phone locked, (c) real-app feel, (d) a build through TestFlight.
- [x] The sealed story job done (D-066, D-067).
- [ ] The real content for six story weeks loaded, and its paintings made from the briefs (`product/MVP.md` → budget).
- [ ] SQLite save with snapshot and migrations; the flow tests in CI (`TEST_STRATEGY.md`; `PROTOTYPE_NOTES.md` emptied of anything that must not reach the test).
- [ ] MASTER_BRIEF §67–70's bar: persists state, survives restart, real quest flow, game consequence, genuine narrative, a discovery, basic failure and recovery, usable repeatedly. Claude tests technically, then Dan uses it.
- [ ] Dan agrees to move to Phase 10 (personal alpha: the central test, on a fresh save).

## Phase 8 (closed) exit criteria

- [~] The five trials: (a) passed; (b)–(d) carried into Phase 9 (D-065).
- [x] The painting kit's three invented sample places approved by Dan on his phone (D-062).
- [~] TestFlight: membership active, pipeline written (D-063); sitting 2 pending, carried into Phase 9 (D-065).
- [ ] The heart (slice 1) prototyped and felt on Dan's phone: open → one job → Begin → delve → back → Done → the step → day complete → arrival; state survives a restart. (Dan: "great", D-065.)
- [x] Compromises recorded (`technical/PROTOTYPE_NOTES.md`); Dan agrees to move to Phase 9 (D-065).

## Phase 7 (closed) exit criteria

- [x] `technical/TECH_DECISIONS.md`: credible options compared, one recommended, trade-offs explained; Dan agrees (D-057, D-058).
- [x] How the paintings are made at about 5 a week, in direction D (D-054): the painting kit (D-057, D-058).
- [x] `technical/ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY_PRIVACY.md`, `TEST_STRATEGY.md` written for the MVP (no premature enterprise architecture) (D-059).
- [x] Dan agrees to move to Phase 8 (prototype) (D-060).

## Phase 6 (closed) exit criteria

- [x] `product/MVP.md`: the smallest true version, cut from `product/FIRST_PLAYABLE.md` (D-053, D-054).
- [x] The central MVP test written (evidence for, evidence against, what to observe, what not to overinterpret).
- [x] Dan agrees to move to Phase 7 (D-055).

## Phase 5 (closed) exit criteria

- [x] Dan agrees how Phase 5 runs: one synthesis of the chosen concept, no new concepts (D-042).
- [x] `product/CONCEPT.md` written and stress-tested against the principles (`product/STRESS_TEST.md`, D-043).
- [x] The week planner designed, reviewed and approved (D-045, D-047, D-048).
- [x] The numbers set (as starting guesses, tuned in play): `game/BALANCING.md` (D-049; draft, Dan reviews at step 5).
- [x] The first playable's contents list written (step 4): `product/FIRST_PLAYABLE.md` (D-050, draft).
- [x] Dan agrees to move to Phase 6 (MVP) (D-052).

## Phase 4 (closed) exit criteria

- [x] Taste session done (D-027).
- [x] Three directions with real screens, critiqued and revised.
- [x] Dan picks or blends one: direction D, approved (D-032, D-040).
- [x] `design/UX_PRINCIPLES.md`, `design/DESIGN_SYSTEM.md`, `design/INTERACTION_NOTES.md` approved (D-040).
- [x] Dan agrees to move to Phase 5 (D-040).

## Completed milestones

- 2026-09-23 — Repository initialised with documentation skeleton, `CLAUDE.md`, `MASTER_BRIEF.md`.
- 2026-09-23 — Pacing decision D-004 (pragmatic Phases 0–5; first playable prioritised).
- 2026-09-23 — **Phase 0 complete.** Six interview rounds; player model confirmed by Dan (D-005). Summary: `DISCOVERY.md` → "Phase 0 synthesis".
- 2026-09-23 — Working agreement D-006 (Claude saves work, handles PRs, directs the build).
- 2026-09-23 — **Phase 1 complete.** Two interview rounds; problem statement agreed; `DESIGN_PRINCIPLES.md` and `ANTI_FEATURES.md` approved by Dan (D-007, D-009).
- 2026-09-23 — D-008: the story gets dedicated deep, research-led sessions in Phase 3.
- 2026-09-23 — Phase 2: three candidate core loops compared; Dan chose a blend (D-010); low floor, high ceiling (D-011); no XP/levels/HP/MP/currencies (D-012).
- 2026-09-23 — Phase 2 drafts reviewed and agreed (D-013).
- 2026-09-23 — **Phase 2 complete** (D-014). Phase 3 opened; story answers sealed from Dan (D-015).
- 2026-09-23 — Productivity tools built into the world (D-020); app naming brought forward (D-021); Phase 4 long visual run planned (D-022).
- 2026-09-23 — Overnight story run: research, three pitches, the whole story written and sealed, fifteen review passes (D-016 to D-019).
- 2026-09-24 — Tools research adopted (D-023). Story confirmed and game bible approved (D-024). Three branches merged into `main`.
- 2026-09-24 — Tools named in the world (D-025); app-name shortlist written (`narrative/NAMES.md`).
- 2026-09-24 — **Phase 3 complete** (D-026). Phase 4 opened.
- 2026-09-24 — Taste session done; brief for the three directions written (D-027).
- 2026-09-24 — Long visual run: three directions built and critiqued; Dan's combined look D built (D-028 to D-033); outside story review planned (D-034, D-035).
- 2026-09-24 — D's final polish; delve interruptions and finishing (D-036); distance from time and runs of delves (D-037).
- 2026-09-24 — Outside review of the principles reconciled (D-038); no dead ends for effort (D-039); every screen keeps moving, any job can be a delve (D-041).
- 2026-09-24 — **Phase 4 complete** (D-040). Direction D and the design docs approved; merged into `main`. Phase 5 opened.
- 2026-09-24 — Phase 5 set up: one synthesis of the chosen concept, no new concepts (D-042); work order `product/PHASE5_PLAN.md`.
- 2026-09-24 — Phase 5 steps 1–2: `product/CONCEPT.md` written and stress-tested; 16 edge rules (D-043). Dan: no slowdown, a find for switching; evening "enough" agreed (D-044).
- 2026-09-24 — The week planner designed, reviewed twice by ChatGPT and reconciled (D-045, D-047); the Course day counts at its hour (Dan); approved and locked (D-048).
- 2026-09-24 — Phase 5 steps 3–5: the numbers (D-049) and the first playable's contents (D-050), approved by Dan (D-051).
- 2026-09-24 — **Phase 5 complete** (D-052). Merged into `main`. Phase 6 opened.
- 2026-09-24 — Phase 6: the MVP and its central test written (D-053); Dan: a painting for every named place, waypoints and the morning deep push kept, test notes on the phone (D-054).
- 2026-09-24 — **Phase 6 complete** (D-055). Merged into `main`. Phase 7 opened.
- 2026-09-24 — Phase 7: Dan's answers (D-056); the stack and the painting kit agreed (D-057, D-058); the four technical docs written (D-059).
- 2026-09-24 — **Phase 7 complete** (D-060). Merged into `main`. Phase 8 opened.
- 2026-09-24 — Phase 8: the painting kit and three sample places; `app/` skeleton; Apple steps for Dan (D-061).
- 2026-09-24 — Trial (a) passed: Dan approves the samples; iPhone 16 Pro Max (D-062). Capacitor wrapper, trials screen, TestFlight pipeline (D-063).
- 2026-09-24 — The heart slice built and published as a web link while Apple setup waits (D-064).
- 2026-09-24 — **The sealed story job done** in its own session (D-066, D-067); merged at Phase 9's start.
- 2026-09-24 — **Phase 8 complete** (D-065): the heart felt great; trials (b)–(d) carried into Phase 9. Merged into `main`. Phase 9 opened.

## Unresolved blockers

- None.
- **Jobs queued for later phases:** the language pass on every line the app says (**after Dan has played the first playable for 3–4 weeks**, D-046; nothing before it is final wording); a memory and recap system, a before → now re-read view, a guaranteed reward rhythm and high-day extras (D-035, Phase 5–6); jobs and targets as editable data (D-030, now in `technical/DATA_MODEL.md`).
- Housekeeping (non-blocking): rename the GitHub repo once a product name exists (`narrative/NAMES.md`). (Privacy verified: private.)
- Open for Dan whenever he likes: the app name (`narrative/NAMES.md`).

## Recommended next action

**Claude:** slice 3 (learning the Cut), in its own session (D-069). **Dan:** nothing needed; look at the web link whenever curious; Apple setup when at a computer. To resume by hand, paste: "Read CLAUDE.md and docs/CURRENT_STATE.md on branch claude/phase-8-continuation-ttngwy, then continue Phase 9."
