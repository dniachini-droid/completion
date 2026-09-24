# CLAUDE.md — Project rules

A single-player RPG for **Dan** whose primary controller is meaningful progress in his real life.
It is a genuine game, not a productivity app with an RPG skin. Provisional name: `real-life-rpg`.

## Current phase

**PHASE 8 — PROTOTYPE** (opened 2026-09-24; Phase 7 closed with Dan's agreement, D-060)

Prototype the central interaction on the agreed stack (`docs/technical/TECH_DECISIONS.md`, D-057, D-058) under MASTER_BRIEF §67: feel, clarity, reward timing, friction, beauty. First the five trials (the delve alert with the phone locked, smoothness, real-app feel, the cloud-Mac pipeline to TestFlight, the painting kit's three invented sample places), then the heart slice on throwaway data. Code follows `docs/technical/ARCHITECTURE.md` and `TEST_STRATEGY.md`. The story **stays sealed from Dan** (`docs/narrative/sealed/`, D-015); the sealed story-fix session (D-035) runs in its own session, in parallel with Phase 8, from `docs/narrative/sealed/STORY_FIX_BRIEF.md`, and is done **before the first playable's content goes in** (D-061). Details and exit criteria: `docs/CURRENT_STATE.md`. Phase changes require Dan's explicit agreement.

Phase order: 0 Player discovery → 1 Product discovery → 2 Game design → 3 Narrative/world → 4 Experience/art/UX → 5 Concept synthesis → 6 MVP → 7 Technical architecture → 8 Prototype → 9 First playable → 10 Personal alpha → 11 Iteration.

## Pacing (D-004)

Phases 0–5 are **thorough but pragmatic**: do enough discovery to understand Dan and settle the core game concept, not to design the whole eventual game. Then get a **small but beautiful first playable** into Dan's hands quickly. Deep worldbuilding and narrative continue in parallel after the core loop is proven. Before the first playable, narrative work covers only the thematic core, the central mystery's truth, and the truth behind any clue the playable actually plants. Rule 6 still applies: nothing is planted without a predetermined answer.

## Working agreement with Dan (D-006)

Dan has no coding background and has asked Claude to **direct the build and keep the work safe**. So Claude, without being asked:
- **Commits and pushes** after every meaningful step (each interview round, each doc change, each working feature). Work is never left only in the container.
- At the end of each phase or build slice, once Dan has approved it, **opens a pull request into `main` and merges it**, so `main` always holds the latest agreed state. Nothing is merged before Dan's approval. Force-pushes and history rewrites are never used on `main`.
- **Tells Dan when to start a new session**: at phase or slice boundaries, or when a conversation grows long. Gives him the exact sentence to paste to resume.
- Explains technical matters in plain language and makes routine technical choices itself (recorded in `DECISIONS.md`). It asks Dan only about taste, priorities and things only he knows.

## Session start

**Always read `docs/CURRENT_STATE.md` first** — it is the authoritative progress tracker (phase, objective, what not to work on yet, exit criteria, blockers, the one recommended next action). Update it before ending every substantial session.

If Dan asks to work on something that skips substantially ahead of the current phase, point that out and ask whether he deliberately wants to deviate from the sequence; record any deliberate deviation in `docs/DECISIONS.md`.

Before any consequential decision, also read: this file → `docs/MASTER_BRIEF.md` → `docs/DECISIONS.md` → `docs/PLAYER_MODEL.md` → relevant domain docs. The repository, not conversation memory, is the source of continuity.

## Permanent rules

1. Read `docs/MASTER_BRIEF.md` before major decisions.
2. Read the relevant decision/design documents before changing a system.
3. Never treat uncertain hypotheses as settled facts. Keep facts, strong hypotheses and weak hypotheses separate.
4. Update documentation when decisions change.
5. Preserve narrative continuity. Never casually retcon; follow the retcon procedure in MASTER_BRIEF §55.
6. Major mysteries must have predetermined truths (`docs/narrative/sealed/WORLD_TRUTH.md`) before clues are planted.
7. Never reveal WORLD_TRUTH content in player-facing material unless it has been legitimately unlocked. **Dan is the player: never show him `docs/narrative/sealed/` content, in chat, commit messages, PR text or any non-sealed doc (D-015).**
8. Real-world action is the main input to game progression.
9. Failure is information, not punishment. No shame, lost progress, dead companions, guilt language.
10. Avoid task farming: trivial inputs must never out-earn meaningful effort.
11. Avoid productivity theatre: Dan plays the game and lives his life; he does not administer the system.
12. Earn complexity. Every mechanic must answer "would Dan actually care about this?"
13. Build vertically: thin, complete, good-feeling slices before broad systems.
14. Test the core behavioural hypothesis early: *does wanting to progress the world make Dan more likely to start meaningful real-world actions?*
15. Do not add mechanics simply because RPGs conventionally have them.
16. UX must stay clear however deep the systems get: on opening, the next action is obvious.
17. Before coding a major feature, understand why it exists (MASTER_BRIEF §71 checklist).
18. Do not silently override prior decisions.
19. Record significant product/game/narrative/architecture decisions in `docs/DECISIONS.md` (date, context, alternatives, rationale, consequences, reversibility).
20. When a subjective creative decision genuinely needs Dan's preference, ask him rather than inventing one.

## Working style

- Collaborative, not sycophantic. Say plainly when an idea is weak or conflicts with earlier principles; separate "difficult but valuable" from "complicated and unnecessary".
- Synthesise periodically during discovery; let Dan correct the model.
- Docs are working tools: concise, cross-referenced, not duplicated.
- Tech stack chosen in Phase 7 (`docs/technical/`); application code lives in `app/` from Phase 8.
- Focused commits with conventional prefixes (`docs:`, `design:`, `narrative:`, `feat:`, `test:`).
- Session close: update `docs/CURRENT_STATE.md` → update docs → open questions → decisions → phase → tests (if code) → review diff → commit → brief summary.
