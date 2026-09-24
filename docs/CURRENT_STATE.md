# Current State

> **Authoritative project-progress tracker.** Read at the start of every session; update before ending every substantial session.
> If Dan asks to work on something that skips substantially ahead of the current phase, point it out and ask whether he deliberately wants to deviate from the sequence (then record any deviation in `DECISIONS.md`).
> **Spoiler-free file.** Dan reads it. Never put `docs/narrative/sealed/` content here (D-015).

_Last updated: 2026-09-24 (Phase 7: stack agreed D-058; the four technical docs written D-059; waiting on Dan to close the phase)_

## Current phase

**PHASE 7 — TECHNICAL ARCHITECTURE** (Phase 6 closed 2026-09-24, D-055)

## Current objective

Choose the technology for the approved MVP (`product/MVP.md`), MASTER_BRIEF §62–66: compare credible options (iPhone-only vs multi-platform, native vs cross-platform, offline-first, local data, backups, the delve timer with the phone locked, painted and moving scenes, content size), recommend one, and explain the trade-offs in plain words. Also: how a painting for every named place is made at about 5 a week in direction D (D-054). Outputs: `technical/TECH_DECISIONS.md`, `technical/ARCHITECTURE.md`, `technical/DATA_MODEL.md`, `technical/SECURITY_PRIVACY.md`, `technical/TEST_STRATEGY.md`. No application code yet (Phase 8).

## Resume here (next session)
1. If Dan has agreed to close Phase 7: open the PR into `main` and merge it, then Phase 8 opens with the five trials in `technical/TECH_DECISIONS.md` → "Risks" (the delve alert with the phone locked, smoothness, real-app feel, the cloud-Mac pipeline, the painting kit's three invented sample places), and Dan's one-time Apple setup (Claude writes the steps).
2. In its own session, before the first playable's build: the sealed story-fix session (D-035), including week 6 of the clue ledger, the authoring list from `game/BALANCING.md` (D-049), the content budget in `product/MVP.md`, and whether weeks 1–6 need the before → now view (D-053). The Phase 8 prototype's throwaway data doesn't need it.
3. Whenever convenient: Dan looks at the planner screens on his phone (D-047).

## This session (2026-09-24, Phase 7)
Dan's answers (D-056): **iPhone, staying; no computer; up to ~$99 a year is fine; paintings stay code-painted.** `technical/TECH_DECISIONS.md` compared five options and recommended **web code in a real iPhone app** (TypeScript, Svelte, Capacitor), packaged by a cloud Mac and installed through TestFlight, everything on the phone, no server, no AI (D-057). The paintings: a **painting kit** from the approved hall's method, one short scene file per place, baked in the cloud with live layers on top, checked and critiqued, one painting session a week; Dan judges **three invented sample places** first. **Dan agreed** (D-058). Then the four technical docs (D-059): `ARCHITECTURE.md` (five parts, one-way dependencies, a log of facts as the source of truth, gifts recorded once, timers as timestamps, screens see only what's unlocked, all copy in one file), `DATA_MODEL.md`, `SECURITY_PRIVACY.md` (nothing leaves the phone; notifications the only permission), `TEST_STRATEGY.md`.

## Session before (2026-09-24, Phase 6)
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

- Application code, scaffolding, `package.json`, databases (Phase 8+). Phase 7 chooses the stack on paper only.
- Showing any sealed story content on a screen or in Dan-facing docs (D-015).
- More story depth beyond what the playable needs (D-004). Pending: the sealed story-fix session (D-035, before the first playable; top priority: the late-game choice must never look like a promise the fixed story can't keep); week 6 of the sealed clue ledger (D-023); the "company at work" during a delve (later).
- Optional, later: the zoomed-out whole-Site map mock-up.

## Phase 7 exit criteria

- [x] `technical/TECH_DECISIONS.md`: credible options compared, one recommended, trade-offs explained; Dan agrees (D-057, D-058).
- [x] How the paintings are made at about 5 a week, in direction D (D-054): the painting kit (D-057, D-058).
- [x] `technical/ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY_PRIVACY.md`, `TEST_STRATEGY.md` written for the MVP (no premature enterprise architecture) (D-059).
- [ ] Dan agrees to move to Phase 8 (prototype).

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

## Unresolved blockers

- None.
- **Jobs queued for later phases:** the language pass on every line the app says (**after Dan has played the first playable for 3–4 weeks**, D-046; nothing before it is final wording); the sealed story-fix session (D-035, before the first playable); a memory and recap system, a before → now re-read view, a guaranteed reward rhythm and high-day extras (D-035, Phase 5–6); jobs and targets as editable data (D-030, now in `technical/DATA_MODEL.md`); week 6 of the sealed clue ledger (D-023).
- Housekeeping (non-blocking): rename the GitHub repo once a product name exists (`narrative/NAMES.md`). (Privacy verified: private.)
- Open for Dan whenever he likes: the app name (`narrative/NAMES.md`).

## Recommended next action

**Dan:** say whether Phase 7 can close and Phase 8 (prototype) can open. Claude then merges Phase 7 into `main` and tells you the sentence for the new session.
