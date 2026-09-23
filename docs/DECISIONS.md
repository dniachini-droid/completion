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
- **Status:** Approved by Dan, 2026-09-23.

## D-008 — The story gets dedicated, deep, research-led sessions
- **Date:** 2026-09-23
- **Context:** During Phase 1, Dan asked that when story work begins, it be treated as a major effort, not a side task: "a huge long session, even multiple sessions… deep research what makes the best story… like 5–7 hours overnight to really truly make something special."
- **Decision:** When Phase 3 (narrative and world) starts, Claude plans one or more long dedicated sessions of 5–7 hours or more, which can run unattended overnight, for the story alone. They begin with deep research into what makes great stories and mysteries: craft, structure, foreshadowing, and the works Dan loves (OoT, Eternal Darkness, Three-Body, Stargate, Mass Effect, Arrival). Only then does Claude develop the story.
- **Alternatives:** Treat narrative as a quick pass inside normal sessions.
- **Rationale:** The story is Dan's retention engine: he stops playing when the story ends (player model). Its quality matters more than any other single piece of content.
- **Consequences:** This covers depth of effort, not scope. D-004 still limits what must be written *before* the first playable (thematic core, the central mystery's truth, and the truth behind planted clues). That core gets this deep treatment, and later arcs get it too as they're developed. The research and the reasoning behind choices are recorded in `docs/narrative/`.
- **Reversible:** Yes.

## D-009 — Phase 1 closed; Phase 2 begins
- **Date:** 2026-09-23
- **Context:** Two interview rounds; all Phase 1 exit criteria met. Dan approved `DESIGN_PRINCIPLES.md` and `ANTI_FEATURES.md` and agreed to move on ("Yes. Yes.").
- **Alternatives:** A third round on notifications, the number of main jobs, and tone on low days.
- **Rationale:** These are better answered in use (D-004, D-005). They are listed under "Still to test in use" in `DESIGN_PRINCIPLES.md`.
- **Consequences:** Phase 2 (Game Design) starts. Mechanics must fit the approved principles.
- **Reversible:** Discovery can be reopened if the principles prove wrong in use.

## D-010 — Core loop: a blend, *Explore · Decode · Connect*
- **Date:** 2026-09-23
- **Context:** Three candidate loops were presented (`game/CORE_LOOPS.md` Parts 2–3): A *Decipherment*, B *Expedition*, C *Linked Lives*. Dan chose "a blend… the best way to do it", wants small in-game decisions ("super fun"), and found C's paused-life pull "probably a nag".
- **Decision:** B's explorable Site is the skeleton; A's script, signs and words supply finds and powers; C's linked lives across eras supply the records' content. C's mapping of life areas to characters, and any life "waiting on" Dan, is dropped. Small one-tap choices (route, which record, words on a gate) are in.
- **Alternatives:** any single candidate; A alone as a cheaper first test.
- **Rationale:** Dan's choice. It also covers each candidate's main weakness: A's passivity, B's thin story, C's writing load and guilt risk.
- **Consequences:** Build cost is higher than A alone, so the first playable is limited to one small region (`game/GAME_DESIGN.md`). Phase 3 must design a script, a place and linked lives together.
- **Reversible:** Yes, until Phase 3 content is written against it.

## D-011 — Low floor, high ceiling
- **Date:** 2026-09-23
- **Context:** Reviewing the chassis, Dan said: "when I'm at capacity I want the app to be able to make me super productive. So don't make it just for crippled me."
- **Decision:** The small "enough" (P2) is the floor, not the target. High days offer up to 5 main jobs and optional deep pushes; effort after day complete keeps counting with **no daily cap**. The earlier proposal of one capped bonus per day is withdrawn. Anti-farming on high days relies on time-based sessions and a slowdown after ~2 extra hours of the same kind of work. The app may *offer* to raise the normal-day size after sustained good weeks. A low day stays a complete day.
- **Alternatives:** keep the bonus cap (protects against the course crowding out avoided jobs, but makes extra effort pointless).
- **Rationale:** A game that only serves low days would stop being useful as Dan recovers, and would feel patronising.
- **Consequences:** P2 in `DESIGN_PRINCIPLES.md` amended. `CORE_LOOPS.md` Part 1 point 3 superseded.
- **Reversible:** Yes.

## D-012 — No XP, levels, HP/MP or currencies
- **Date:** 2026-09-23
- **Context:** Dan: "whatever you think is best." The player model says capabilities beat numbers.
- **Decision:** Progression is the Site, signs → words (powers), and the web of lives (`game/PROGRESSION.md`). No currency; real action converts directly into steps, arrivals and Keys (`game/ECONOMY.md`).
- **Alternatives:** XP/levels as a background momentum signal; HP/MP as capacity (MASTER_BRIEF §11); a single currency with a shop.
- **Rationale:** Each would be a number with no meaningful change behind it, or would duplicate capacity and "day complete". Shops add decisions Dan doesn't care about and invite farming.
- **Consequences:** Simpler first playable. Progress must be *felt* through the map, powers and story, so those must be visible and satisfying.
- **Reversible:** Yes. If in use Dan misses a sense of size, add one number that names what it changes.
