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
