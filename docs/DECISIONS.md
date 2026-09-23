# Decision Log

> Significant product, game, narrative and technical decisions. Newest last.
> Format: decision · date · context · alternatives · rationale · consequences · reversible?

---

## D-001 — Repository is documentation-only during discovery
- **Date:** 2026-09-23
- **Context:** Founding brief requires discovery before any technical choice.
- **Alternatives:** Scaffold an app early.
- **Rationale:** Avoid anchoring on technology or mechanics before understanding the player and the problem.
- **Consequences:** No framework, `package.json`, database or architecture until Phase 7.
- **Reversible:** Yes, by explicit agreement.

## D-002 — Project lives at the root of the existing `completion` repository
- **Date:** 2026-09-23
- **Context:** Work began in a pre-existing GitHub repo (`dniachini-droid/completion`) containing only a stub README. The brief suggested a `real-life-rpg/` directory.
- **Alternatives:** Nest everything under `real-life-rpg/`; create a new GitHub repo.
- **Rationale:** The repo itself is the project; nesting would add a pointless directory level. `real-life-rpg` remains the provisional project name.
- **Consequences:** Paths in docs are relative to the repo root. The repo can be renamed on GitHub when a final name is chosen.
- **Reversible:** Yes.

## D-003 — `docs/CURRENT_STATE.md` is the authoritative progress tracker
- **Date:** 2026-09-23
- **Context:** Dan asked for a single place recording phase, objective, session focus, out-of-scope work, exit criteria, milestones, blockers and exactly one next action.
- **Alternatives:** Track state only in `CLAUDE.md` or `DISCOVERY.md`.
- **Rationale:** One small file read first each session prevents drift and phase-skipping.
- **Consequences:** Read at every session start; updated before every substantial session ends. Requests that skip ahead substantially are flagged and require a deliberate choice to deviate.
- **Reversible:** Yes.

## D-004 — Pragmatic pre-production; first playable prioritised
- **Date:** 2026-09-23
- **Context:** Dan clarified that Phases 0–5 must not attempt to perfect the eventual game before implementation.
- **Decision:** Phases 0–5 are thorough but pragmatic. Do enough discovery to understand Dan and settle the core game concept, then prioritise a small but beautiful first playable. Deep worldbuilding and narrative continue in parallel once the core loop is proven.
- **Alternatives:** Complete full narrative and world design (Phase 3) before any implementation, as a strict reading of the brief implies.
- **Rationale:** The central behavioural hypothesis (does wanting to progress the world make Dan start real actions?) can only be tested with something playable. Over-designing first risks the "project so enormous I never use it" anti-goal.
- **Consequences:** Phase 3, before the first playable, is scoped to the thematic core, world rules, the central mystery's hidden answer, and the truth behind every clue the playable plants. Later arcs, factions and secondary mysteries are designed in parallel afterwards. The "truth before clues" rule is unchanged, but it applies per clue rather than requiring the whole world to be finished first. The phase order stays the same.
- **Reversible:** Yes.

## D-005 — Phase 0 closed; Phase 1 begins
- **Date:** 2026-09-23
- **Context:** Six interview rounds; all 12 exit criteria answered (see the synthesis table in `DISCOVERY.md`). Dan confirmed the player model: "This is fantastic. Yes."
- **Alternatives:** More interview rounds on structure, notifications and failure handling.
- **Rationale:** The latest answers showed diminishing returns ("don't know", "we could try"). Those questions are better answered by observing Dan with a prototype (D-004).
- **Consequences:** Low-confidence areas (criteria 9, 11, 12) are carried as hypotheses to test in use. Phase 1 (Product Discovery) starts.
- **Reversible:** Discovery can be reopened at any time if the model proves wrong.

## D-006 — Working agreement: Claude directs the build and safeguards the work
- **Date:** 2026-09-23
- **Context:** Dan has no coding background and asked Claude to save work automatically, handle PRs, direct the build, and say when to start new sessions.
- **Decision:** Claude commits and pushes after every meaningful step. At each Dan-approved phase or slice end, it opens a PR into `main` and merges it. It tells Dan when to start a new session and what to paste. It makes routine technical choices itself, recorded here, and asks Dan only about taste, priorities and personal knowledge.
- **Alternatives:** Dan manages PRs and merges himself.
- **Rationale:** Removes admin from Dan (anti productivity theatre) and keeps continuity in the repo rather than in chat.
- **Consequences:** `main` is the source of truth between sessions. Feature branches are short-lived.
- **Reversible:** Yes.

## D-007 — Product rules from Phase 1 discovery
- **Date:** 2026-09-23
- **Context:** Phase 1 rounds 1–2. Dan answered directly on a complete day, capacity, "I can't start", planning, absences and weekly targets.
- **Decision:** Adopt `DESIGN_PRINCIPLES.md` (15 principles) and the reviewed `ANTI_FEATURES.md`. Key rules:
  - About 3 main jobs make a normal day; outside + a real meal makes a low day.
  - Capacity is pre-set from bedtime and changeable with one tap.
  - "I can't start" = a story reveal, then one tiny physical step.
  - Weekly targets that reset fresh; no backlog.
  - 1 h of course work = done.
  - The app suggests and Dan chooses; one-offs are typed as one line.
  - Rest is acknowledged, not scored.
  - The app rewards bedtime behaviour, not sleep outcomes.
- **Alternatives:** More interview rounds, or leaving these open until Phase 2.
- **Rationale:** Dan's answers were clear and consistent with the player model. The remaining unknowns (notifications, the exact number of jobs, tone on low days) are better tested in use (D-004, D-005).
- **Consequences:** Phase 2 mechanics must fit these principles. The course's 4 h/day ambition is a ceiling, not a target.
- **Reversible:** Yes. Change a principle through a new decision entry.
- **Status:** Principles pending Dan's final approval at the end of Phase 1.

## D-008 — The story gets dedicated, deep, research-led sessions
- **Date:** 2026-09-23
- **Context:** During Phase 1, Dan asked that when story work begins, it be treated as a major effort, not a side task: "a huge long session, even multiple sessions… deep research what makes the best story… like 5–7 hours overnight to really truly make something special."
- **Decision:** When Phase 3 (narrative and world) starts, Claude plans one or more long dedicated sessions of 5–7 hours or more, which can run unattended overnight, for the story alone. They begin with deep research into what makes great stories and mysteries: craft, structure, foreshadowing, and the works Dan loves (OoT, Eternal Darkness, Three-Body, Stargate, Mass Effect, Arrival). Only then does Claude develop the story.
- **Alternatives:** Treat narrative as a quick pass inside normal sessions.
- **Rationale:** The story is Dan's retention engine: he stops playing when the story ends (player model). Its quality matters more than any other single piece of content.
- **Consequences:** This covers depth of effort, not scope. D-004 still limits what must be written *before* the first playable (thematic core, the central mystery's truth, and the truth behind planted clues). That core gets this deep treatment, and later arcs get it too as they're developed. The research and the reasoning behind choices are recorded in `docs/narrative/`.
- **Reversible:** Yes.
