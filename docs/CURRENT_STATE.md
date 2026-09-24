# Current State

> **Authoritative project-progress tracker.** Read at the start of every session; update before ending every substantial session.
> If Dan asks to work on something that skips substantially ahead of the current phase, point it out and ask whether he deliberately wants to deviate from the sequence (then record any deviation in `DECISIONS.md`).
> **Spoiler-free file.** Dan reads it. Never put `docs/narrative/sealed/` content here (D-015).

_Last updated: 2026-09-24, late evening (D polished; delve rules D-036/D-037; ChatGPT review of the principles waiting)_

## Current phase

**PHASE 4 — EXPERIENCE AND ART** (Phase 3 closed 2026-09-24, D-026)

## Current objective

Find how the game looks, moves and feels (MASTER_BRIEF §57–58). First a live taste session with Dan, then a long run that builds three genuinely distinct visual directions as real screens, each critiqued and revised (D-022). Work order: `design/PHASE4_PLAN.md`.

## Current session focus

**2026-09-24, the long visual run** (`design/PHASE4_RUN.md` has the full log). Branch: `claude/phase-4-direction-d-4jifz4` (carries all of `claude/phase-4-long-visual-run-08v7pn`; not yet merged; merge only after Dan approves).

What happened:
- **Model test** (D-029): the default model's morning screen won; Dan agreed ("the warm one").
- **Three directions** (A Lamp and Stone, B Engraved Light, C The Turning Day), nine screens each, two rounds of harsh critique and revision each (`design/directions/a-*`, `b-*`, `c-*`).
- **Dan walked through all three on his phone** and dictated picks screen by screen (`ART_DIRECTION.md` → "Dan's walkthrough"). He asked for a combination: **direction D, the combined look** (D-032): C's purple world, full screen, never framed; B's interface; A's map; B's word-cutting animation; C's arrival, camp, satchel, daybook.
- **D** is built (`design/directions/d-combined/`, eleven screens including the stair and the delve-length dial), critiqued twice, revised once. Dan: "everything that I've seen for D is very good."
- Also decided today: the delve timer is a glowing ring (D-028); jobs and targets are Dan's to edit (D-030); a language pass on all app copy is a job (D-031); the delve length is adjustable with a dial, 25/30/45/60 (D-033, Dan picked the dial); an outside review of the sealed story (D-034, D-035).
- Drafts written for Dan's approval: `design/DESIGN_SYSTEM.md`, `design/INTERACTION_NOTES.md`, `design/UX_PRINCIPLES.md`.

**This session (2026-09-24, evening, branch `claude/phase-4-direction-d-4jifz4`):** D's final fix round done (`design/directions/d-combined/REVISION-2.md`); stepping away and finishing a delve (D-036); distance comes from time, runs of delves set on the dial screen, places a working day apart (D-037); the delve screen relit (bright violet, sparkles); how the map scales written into `design/INTERACTION_NOTES.md`; all principles bundled for an outside review (`design/PRINCIPLES_FOR_REVIEW.md`). Zip: `sh docs/design/tools/netlify_zip.sh out.zip`.

**Resume here (next session), in order:**
1. **ChatGPT's review of `design/PRINCIPLES_FOR_REVIEW.md`** (Dan pastes it). Sort each point into act on / decline with reasons; apply what Dan agrees to, in the source docs (`DESIGN_PRINCIPLES.md`, `ANTI_FEATURES.md`, `design/UX_PRINCIPLES.md`, `design/INTERACTION_NOTES.md`, `design/DESIGN_SYSTEM.md`), then rebuild the bundle if useful. Record decisions.
2. Any last notes from Dan on the latest zip; apply them; send a fresh zip.
3. Optional (offered to Dan): mock the zoomed-out whole-Site map view.
4. **Dan approves D**, the design system, the interaction notes and the UX principles → tick the Phase 4 exit criteria.
5. **Open a PR into `main` and merge it** (D-006), once Dan says yes.
6. **Ask Dan to agree to Phase 5** (Concept synthesis), then start it in a new session. Phase 5 must set region sizes and step pacing numbers (D-037).
7. In parallel with Phase 5, before the first playable is built: **the sealed story-fix session** (D-035; its item list is in the sealed folder; top priority: the late-game choice must never look like a promise the fixed story can't keep). Keep Dan's view spoiler-free.

## Do NOT work on yet

- Application code, scaffolding, frameworks, databases, tech stack (Phase 7+). Static mock-up screens for Phase 4 are fine.
- Showing any sealed story content on a screen (D-015). Screens use the game bible, the terminology and the first region only.
- More story depth beyond what the playable needs (D-004). Pending, and not urgent: bring week 6 of the sealed clue ledger to full detail before the build (D-023); decide the "company at work" during a delve (later).

## Phase 4 exit criteria

- [x] Taste session done; answers in `design/ART_DIRECTION.md` (D-027).
- [x] Three directions with real screens, critiqued and revised (A, B, C: two rounds each).
- [ ] Dan picks or blends one. **Blend chosen (D-032); awaiting his approval of the finished D.**
- [ ] `design/UX_PRINCIPLES.md`, `design/DESIGN_SYSTEM.md`, `design/INTERACTION_NOTES.md` filled in enough for Phase 5. **Drafted; awaiting Dan.**
- [ ] Dan agrees to move to Phase 5 (Concept synthesis).

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

## Unresolved blockers

- None.
- **Jobs queued for later phases:** the language pass on every line the app says (D-031, Phase 5–6); the sealed story-fix session (D-035, before the first playable); a memory and recap system, a before → now re-read view, a guaranteed reward rhythm and high-day extras (D-035, Phase 5–6); jobs and targets as editable data (D-030, Phase 7); week 6 of the sealed clue ledger (D-023).
- Housekeeping (non-blocking): rename the GitHub repo once a product name exists (`narrative/NAMES.md`). (Privacy verified: private.)
- Open for Dan whenever he likes: the app name (`narrative/NAMES.md`).

## Recommended next action

**Dan: start a new session and paste:** "Read CLAUDE.md and docs/CURRENT_STATE.md, then continue Phase 4 from 'Resume here'. Here is ChatGPT's review of docs/design/PRINCIPLES_FOR_REVIEW.md: sort each point into act on / decline (with reasons), apply the ones I agree to, then guide me through approving D." (then paste the review)
