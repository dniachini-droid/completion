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

## D-013 — Phase 2 review: Keys vs words, early first word, partial signs, the playable test
- **Date:** 2026-09-23
- **Context:** Reviewing the Phase 2 drafts, Claude raised four gaps; Dan agreed with all four recommendations.
- **Decision:**
  1. Every sealed thing shows whether it needs a **Key** (real life) or a **word** (knowledge); the largest gates need both.
  2. The **first word** arrives in week 2–3, not month 2; later words slow to about one a month.
  3. Deep pushes on High days can yield **partial signs**, completed by the next Key, never ahead of the story's authored order.
  4. The first playable is tested for **3–4 weeks**; the app notes starts, avoided jobs done, "I can't start" use and returns after gaps, without admin; then a short chat with Dan.
- **Alternatives:** keep Keys and words overlapping; first word at month 2; High days yield only more records; leave the test open-ended.
- **Rationale:** Clarity of goals (P1); new powers are what Dan loves most; D-011 needs big days to pay off in something usable; rule 14 needs a defined test.
- **Consequences:** `CORE_LOOPS.md` Part 4, `PROGRESSION.md`, `ECONOMY.md` and `GAME_DESIGN.md` updated. Phase 3 must author an early first word and partial-sign states.
- **Reversible:** Yes.

## D-014 — Phase 2 closed; Phase 3 (Narrative and world) opened
- **Date:** 2026-09-23
- **Context:** All Phase 2 exit criteria met (D-010–D-013). Dan: "Yes. Move to phase 3."
- **Decision:** Phase 2 is closed and Phase 3 is open. Phase 2 work is merged into `main`.
- **Alternatives:** More Phase 2 iteration before any story work.
- **Rationale:** The core loop, progression, economy, quests and first-playable needs are agreed. The story is now the main unknown, and the game design constrains it enough to begin.
- **Consequences:** Phase 3 follows MASTER_BRIEF §51–56, within D-004's pre-playable scope and at D-008's depth.
- **Reversible:** Phase 2 docs can be reopened if the story needs a mechanic changed (record it).

## D-015 — Sealed truth, story quality bar, and the overnight run
- **Date:** 2026-09-23
- **Context:** Dan is the game's only player. Starting Phase 3, Dan chose to **keep the story's answers secret** from himself. He asked for an overnight run of about 8 hours: three pitches, with Claude picking one and **developing it fully**, while the other two stay short. He added: "I don't want the story to just be going nowhere. It needs to be unique and connected and have flow." He left the model choice to Claude.
- **Decision:**
  1. Truth-bearing narrative docs live in `docs/narrative/sealed/`. Dan doesn't read them. Nothing from them appears in chat, commits, PRs or open docs. Dan approves spoiler-free material: pitches, tone, setting, the player-safe `GAME_BIBLE.md`.
  2. Quality bar (NARRATIVE_RULES 10): the ending is fixed before anything is planted; every thread connects to the centre; every reveal builds towards the ending.
  3. The run follows `docs/narrative/PHASE3_PLAN.md`. Claude makes taste choices provisionally overnight, and Dan confirms or redirects them in the morning (a deliberate, recorded exception to rule 20's "ask first", for this run only).
  4. The run uses **Claude Fable 5.1**, Anthropic's most capable model for long-horizon work, which fits MASTER_BRIEF §51's suggestion of a specialist narrative agent. It keeps itself going with self-scheduled check-ins and a backup hourly keep-alive Routine.
- **Alternatives:** Dan sees everything (co-author, but plays a game he knows the answers to); pitches only overnight (wastes most of the night); Opus 5.5 (cheaper, but this is the single highest-value content in the project).
- **Rationale:** Dan plays for the story and to be surprised. A long story needs a fixed destination to avoid "going nowhere".
- **Consequences:** Dan's control over the story is at the level of the pitch, the tone and morning questions. The sealed folder must stay internally consistent, because Dan won't catch contradictions in it. Each Phase 3 run includes an adversarial self-review for that reason.
- **Reversible:** Yes. Dan can open the sealed folder at any time; that can't be undone for him.

## D-016 — Provisional story pitch: *The Long Answer* (Pitch 1)
- **Date:** 2026-09-23 (overnight run; **awaiting Dan's confirmation**)
- **Context:** Stage 2 of `docs/narrative/PHASE3_PLAN.md`. Three pitches were written (`docs/narrative/PITCHES.md`): 1 *The Long Answer* (a quiet cut-stone place under our own world, built to finish something over ages; a figure present in every age), 2 *The Unmade* (a fallen thing taken apart into a language inside a mountain), 3 *The Last Run* (an engine under the world that restarts the ages). Dan was asleep; D-015 allows a provisional choice.
- **Decision:** Develop Pitch 1 fully in `docs/narrative/sealed/`. The other two stay short.
- **Alternatives:** Pitches 2 and 3; developing two pitches thinly.
- **Rationale:** Pitch 1 is the one whose ending is latent in its premise (NARRATIVE_RULES 10), whose lives are pieces of one thing rather than episodes, whose central figure can be revealed by staircase over a year, and whose fiction never makes Dan's progress feel like damage (P8, P14). Full reasons in `PITCHES.md`.
- **Consequences:** Sealed docs are written against Pitch 1. Working in-world names (the place "the Quiet", the script "the Cut") are provisional and listed as morning questions. If Dan chooses another pitch, the sealed work is kept on the branch and a later session develops the chosen one.
- **Reversible:** Yes, until clues are planted in a playable.

## D-017 — Overnight taste calls for the story (provisional; Dan confirms or redirects)
- **Date:** 2026-09-23 (overnight run, stages 3–5; D-015 allows provisional choices)
- **Context:** Developing Pitch 1 fully required several choices that are matters of taste. Each was made with a reason and is listed as a morning question in `docs/CURRENT_STATE.md`.
- **Decision (all provisional):**
  1. **Our own world, ages unnamed.** The records are set in our past, but no country, century or date is ever named; objects, trades and units carry the era. Alternative: a secondary world with invented ages (more work, less resonance; rejected for now).
  2. **One fixed ending, no branching.** The story ends one way (NARRATIVE_RULES 10). Small in-game choices (routes, which record, which words to try) never change the ending.
  3. **The central figure is a single figure present in every age**, revealed by staircase over the year (effect → presence → face → reason → nature), with one late speech and a reason a sane person could hold.
  4. **Five major lives plus a chorus of single witnesses**, each life with its own document form and voice rules; the first playable uses two lives in full.
  5. **A previous reader's partial translations bootstrap week 1.** The most recent reader left an English notebook; her partial (and sometimes wrong) translations are shown in her hand, and Dan reads past them as he learns. Alternative: pure sign-by-sign decoding from nothing (the research shows it stalls in the first hour).
  6. **Working names:** the place is *the Quiet*, the script *the Cut*, a sign *a mark*, a power *a word*. Alternatives are listed in `narrative/GAME_BIBLE.md`.
  7. **The script:** about 50 concept-signs by the end of year 1, sharing visual elements; nine words in twelve months; the first in week 2–3 (D-013); a fixed "cutting" ritual for every word.
- **Alternatives:** see each item.
- **Rationale:** each choice follows a binding lesson in `narrative/RESEARCH.md` or a Phase 2 decision; none is load-bearing for the truth, so any can be reversed without a retcon.
- **Consequences:** open docs (`GAME_BIBLE.md`, `TERMINOLOGY.md`, `LOCATIONS.md`) use the working names; sealed docs are written against these choices.
- **Reversible:** Yes, before the first playable is built. Renaming is free; changing item 1 or 5 would need a sealed revision pass.

## D-018 — Story review outcomes (provisional; overnight run, stage 4)
- **Date:** 2026-09-23
- **Context:** The sealed story was put through an adversarial self-review (two independent passes plus Claude's own; `narrative/sealed/REVIEW.md`). Several findings needed decisions rather than fixes.
- **Decision (all provisional, spoiler-free wording):**
  1. **Records are authored as sign strings.** Every record in the script is a short string of learnable marks (plus small carved pictures) with a terse rendering; richer prose exists only where the fiction allows it (a recent reader's paper notebook) and as the author's reference. The app never "secretly translates" beyond the marks Dan holds.
  2. **Words are cut only where the place names them.** A power word can only be cut into a blank that shows its marks; small "open cells" on the walls accept any two-mark experiment and answer with one line and no progress. This keeps the authored order without the place ever refusing a valid word.
  3. **The ending is fixed.** Whatever else Dan tries at the end, the place answers honestly and the ending does not change.
  4. **Nothing waits on Dan, in the letter as well as the spirit.** Locks never shut for good; the fiction never makes a character wait for the player; no record gives real-life advice.
  5. **Every Key opens something already seen.** Each learnable mark is delivered inside a sealed thing Dan has already seen, never as a bare reward.
- **Alternatives:** free-text or fully rendered translations (rejected: breaks the "place never lies" rule); a branching ending (rejected: NARRATIVE_RULES 10); locks that penalise absence (rejected: P7, P8).
- **Rationale:** the review showed each of these as a place where the story's logic and the game's rules could come apart; the decisions close them.
- **Consequences:** `narrative/sealed/` revised accordingly; `GAME_BIBLE.md` and `LOCATIONS.md` aligned. Later narrative sessions sign-author every record before it is planted.
- **Reversible:** Yes, before the first playable is built.

## D-019 — The story's largest gate never waits on one real-life milestone alone

- **Date:** 2026-09-23
- **Context:** The sealed revelation map had the story's last great door open only on the largest Key (a great real-life milestone). A fresh-eyes review of the ending pointed out that a real project's milestone can be months away, so the story could stall in its last act, against the rule that nothing waits on Dan (P7, P8, D-018 item 4).
- **Decision (provisional):** the last door's count can be filled two ways: a great milestone fills it at once, and ordinary weeks of play fill it slowly. The milestone accelerates the ending and never gates it. In the same review the ending was spread over more visits (the last four beats no longer share one week), the figure's one speech was shortened and softened, and the case where Dan does nothing at the story's last gate is now written (the place stays as it is; no nudge).
- **Alternatives:** keep the milestone-only gate (rejected: stalls); drop the milestone from the gate (rejected: the largest Key should still open the largest door).
- **Rationale:** the ending must be reachable by steady play and made sooner by a great day, never the reverse.
- **Consequences:** `narrative/sealed/` revised (site, truth, map, visit tables, pacing). The exact counts belong to the Key economy in Phase 6.
- **Reversible:** Yes, before the first playable is built.

## D-020 — Productivity tools, built into the world
- **Date:** 2026-09-23
- **Context:** After Phase 2 closed, Dan asked for "the functionality of some of the best productivity apps", integrated into the game, "not just plonked into the app". He chose: the timer inside the story, the Chronicle, a calendar link, **lists**, **a scheduler** "if that won't be crazy to do", and **streaks** that feed the story or the collection. Lists, planning and streaks were limited or excluded in Phase 1 (P6, P7, anti-features) because of pile-up and punitive streaks, so this reverses part of that.
- **Decision:** Add `game/TOOLS.md`:
  - the timer becomes *the delve* (moves the expedition; four in a row reach deeper);
  - lists become *the satchel* (on request; worked under the timer; stale items drift to *someday*);
  - light, optional **plotting** of jobs to days or times (waypoints, no time-blocking, a passed time returns quietly);
  - a **calendar link** (subject to Phase 7 feasibility);
  - **non-punitive runs** (low and rested days count; one missed day is forgiven; lamps and relics are kept forever);
  - **the Chronicle** (an automatic journal of real progress, no stats).
  New principle P16: every tool must move or reveal something in the world, and must never create a pile, a debt or a red number. P6, P7 and anti-features amended.
- **Alternatives:** Keep the Phase 1 exclusions (safer against pile-up, but Dan wants these, and a game that fits only his low days is D-011's mistake again). Add the tools as a separate "productivity" tab (easier, but "plonked").
- **Rationale:** Dan's preference, and the tools make the app useful on ordinary and high days. The original harms were pile-up, guilt and planning instead of starting. Each is designed out rather than the tool being banned.
- **Consequences:** More to build. The first playable adds the delve, the satchel, daily runs and a simple Chronicle; plotting and the calendar come later. Phase 3 names the delve, satchel, lamps, relics and Chronicle in the chosen world, a small addition that doesn't change the story work.
- **Reversible:** Yes. Any tool that creates pressure in use is cut or softened.

## D-021 — App name brought forward into Phase 3
- **Date:** 2026-09-23
- **Context:** Product naming was deferred until later in the plan. Dan asked for an app name now.
- **Decision:** Deliberate deviation from the sequence. The overnight Phase 3 run proposes 5–8 candidate names drawn from the chosen world in `narrative/NAMES.md`, each checked for clashes with existing products. No name may hint at sealed truth. Dan chooses **whenever he's ready, with no rush**, at the latest in Phase 5. Dan: "We can name it later if appropriate."
- **Alternatives:** Wait for Phase 5 concept synthesis.
- **Rationale:** A name grounded in the world is best found while the world is being made, and it costs little.
- **Consequences:** Once chosen, the GitHub repo can be renamed (housekeeping item in `CURRENT_STATE.md`).
- **Reversible:** Yes, until the name is used publicly or in code.

## D-022 — Phase 4 gets its own long, visual run
- **Date:** 2026-09-23
- **Context:** Dan wants the app to "look stunning" and asked whether a long Fable session would help.
- **Decision:** Phase 4 starts with a short taste session with Dan (20–30 min, reacting to visual references), after the Phase 3 world is chosen. Then comes a long, unattended Fable run (about 6–8 h, set up like the Phase 3 run: keep-alive, minimum run time). It produces **three genuinely distinct visual directions as real, viewable screens**: the morning screen, the timer (delve), the map, reading a record, day complete, camp. Each goes through repeated rounds of critique and revision. Dan picks or blends one. The first playable later gets a dedicated visual polish pass.
- **Alternatives:** Start visual work now (it would be blind to the world and to Dan's taste); do Phase 4 as ordinary short sessions.
- **Rationale:** Beauty is a stated core want (player model). Long runs pay off most when they can iterate on real screens. Taste has to come from Dan first (rule 20).
- **Consequences:** When Phase 3 closes, Claude sets up the taste session, then the long run.
- **Reversible:** Yes.

## D-023 — Tools revised with the overnight research
- **Date:** 2026-09-24
- **Context:** `game/TOOLS_RESEARCH.md` stress-tested the tools draft (D-020) against productivity apps and ADHD research and proposed ten changes. Dan approved all ten.
- **Decision:** `game/TOOLS.md` revised:
  1. During the day only main jobs move the world; the delve is how you do them. Satchel items move the expedition only once accepted as a main job, or after day complete. P16 gains a third test: no tool lets an easy thing stand in for the avoided thing.
  2. Streaks become a **trail**: each day complete adds a marker; relics come from markers in total, not days in a row; after a gap the trail branches instead of restarting. (Streaks no longer use lamps, because in the chosen world a lamp means a word woke something.)
  3. No weekly runs.
  4. The camp break ends itself, with "next delve" as the obvious button.
  5. The Chronicle is the week close; no "best run"; a thin week gets a different kind of page, not a shorter one.
  6. A deep delve allows gaps of up to about 20 minutes.
  7. The satchel shows a handful of items; *someday* has no count; groups later; an item swapped away twice rests for a week.
  8. "10 minutes?" as the first delve after "I can't start".
  9. **The playable test runs 5–6 weeks, not 3–4** (amends D-013), and isn't judged on week 4 alone.
  10. Plotting (later): "move it?" only when Dan opens the app; only the next 7 days of waypoints show.
  Also noted for later: company at work during a delve (weak evidence, worth a try).
- **Alternatives:** keep the draft as written; keep days-in-a-row streaks as the main display (Dan chose totals).
- **Rationale:** the research (see `TOOLS_RESEARCH.md`): visibly broken streaks lower effort most for people who blame themselves; easy lists replace avoided jobs; the break is where the phone wins; novelty dips around week 4.
- **Consequences:** `TOOLS.md`, `GAME_DESIGN.md`, `CORE_LOOPS.md`, `COLLECTIONS.md`, `DESIGN_PRINCIPLES.md`, `OPEN_QUESTIONS.md` updated. The first playable needs about six weeks of content; the sealed year already has it, and the sealed clue ledger is flagged for completion of week 6 before the build.
- **Reversible:** Yes. The trail is tested in use (`OPEN_QUESTIONS.md`).

## D-024 — Dan confirms the story and approves the game bible
- **Date:** 2026-09-24
- **Context:** The morning briefing's seven questions (`CURRENT_STATE.md`, 2026-09-23). Dan: "I like everything you wrote so let's go with that."
- **Decision:** All provisional story decisions are confirmed: *The Long Answer* (D-016); our own world with ages never named, the notebook left by the last reader, the working names *the Quiet* and *the Cut* (D-017); the review outcomes (D-018); the last door filled by a great day or by steady weeks (D-019); the fiction as dark as it needs, the game's voice always kind. `narrative/GAME_BIBLE.md` is approved.
- **Alternatives:** Pitches 2 and 3 (kept, short, in `PITCHES.md`).
- **Rationale:** Dan's answer.
- **Consequences:** The Phase 3 exit criteria for the pitch and the bible are met. Renaming stays free until the first playable.
- **Reversible:** Yes, before clues are planted in a playable.

## D-025 — The tools get in-world names
- **Date:** 2026-09-24
- **Context:** D-020 left the tools' names to Phase 3. Dan approved "everything" in the morning plan, which included this naming job.
- **Decision:** the timer is **a delve**, its break **a breather** (not *camp*, which already means the evening close), four in one sitting **a long delve**; lists are **the satchel**, with *someday* as **the bottom of the satchel**; plotted jobs are **waypoints**; the streak is a line of **cairns** (not lamps, which mean something in the story); relics and Site finds are both **finds**; the Chronicle is **the daybook**, Dan's own page in plain English.
- **Alternatives:** lamps for the streak (clashes with the story's lamps); *the log* for the Chronicle (too close to a record in the story); *camp* for the break (already taken).
- **Rationale:** plain, drawable words that follow the app's voice rules (no fantasy-speak) and never touch the sealed truth; checked privately against it (`sealed/README.md`).
- **Consequences:** `TERMINOLOGY.md` and `TOOLS.md` updated. Renaming stays free until the first playable.
- **Reversible:** Yes.

## D-026 — Phase 3 closed; Phase 4 (Experience and art) opened
- **Date:** 2026-09-24
- **Context:** The morning plan ended: "After that, Phase 3 closes with your agreement and the Phase 4 taste session begins." Dan: "Do everything you listed. I like everything you wrote, so let's go with that… The works. Go." All Phase 3 exit criteria are met: story confirmed and bible approved (D-024), tools named (D-025), app-name shortlist written (`narrative/NAMES.md`).
- **Decision:** Phase 3 closes. Phase 4 opens with the work order `design/PHASE4_PLAN.md`: a live taste session, then the long visual run (D-022).
- **Alternatives:** keep deepening the story first (not needed before the first playable, D-004); start with the unattended run (it would be blind to Dan's taste, rule 20).
- **Rationale:** D-004 pacing: a small but beautiful first playable, soon. The story is complete to the end of the year.
- **Consequences:** `CLAUDE.md` and `CURRENT_STATE.md` move to Phase 4. Story work continues only as needed (week 6 of the clue ledger before the build, D-023; the company at work, later).
- **Reversible:** Yes. Dan can reopen story questions at any time without reopening the phase.

## D-027 — Taste session done; brief for the three directions
- **Date:** 2026-09-24
- **Context:** Phase 4 Part 1 (`design/PHASE4_PLAN.md`). Dan answered ten prompts, reacted to a page of visual samples (`design/taste/samples.html`), and answered three follow-ups. Record: `design/ART_DIRECTION.md` → "Dan's taste".
- **Decision:** The long visual run builds from the brief in `ART_DIRECTION.md`: dark cool stone with glow everywhere, mostly cold with some warm, painted and atmospheric, a carved serif voice, clean and precise layout, smooth everyday motion with cinematic big moments, a map of lit places on dark. The three directions must differ in real ways inside that brief, and between them test the two open questions (how cold and warm glow are balanced; carved letters everywhere or with a companion face). Sound: room tone and material sounds, music at arrivals and reveals (Claude's recommendation; Dan deferred; audio is later).
- **Also:** The long run opens with a short model comparison: the same screen built by the default model and by Fable; the better result, judged by Dan or by blind reviewers if he is away, sets the model for the rest of the run. Dan asked whether Fable suits the graphics work.
- **Alternatives:** three directions spread across everything he said yes to in the broad lists (rejected: the forced choices were far sharper and contradicted parts of the broad yeses, e.g. flat vector and sci-fi type).
- **Rationale:** Rule 20 (ask Dan about taste); the forced choices discriminate, the lists did not.
- **Consequences:** Phase 4 exit criterion 1 met. `PHASE4_PLAN.md` Part 2 updated.
- **Reversible:** Yes. Dan picks or blends at the end of the run.

## D-028 — The delve timer is a glowing ring with the number inside
- **Date:** 2026-09-24
- **Context:** During the visual run, Dan asked for "a circular timer that slowly fills up as the time increases. With glow. And the number inside it. Rather than just a task bar." `TOOLS.md` §1 had said the delve "is not a number counting down".
- **Decision:** The delve shows a circular ring that fills with glow as the minutes pass, with the time left in the middle. The expedition still moves in the world around it, and the phone can still be put away. Each of the three directions draws the ring in its own style.
- **Alternatives:** keep the delve as a moving scene with no number (the earlier line); a bar (Dan: no).
- **Rationale:** Dan's taste (rule 20). A ring and a number don't conflict with the reason for the earlier line, which was that the world should visibly move, not only a count.
- **Consequences:** `TOOLS.md` §1, `ART_DIRECTION.md`, `PHASE4_RUN.md` updated.
- **Reversible:** Yes.

## D-029 — The visual run uses the default model (confirmed by Dan)
- **Date:** 2026-09-24
- **Context:** D-027's model comparison. The default model (Opus 5.5) and Fable 5.1 built the same morning screen from one prompt. Dan was shown both, blind; three blind reviewers judged them (`design/model-test/RESULT.md`).
- **Decision:** Reviewers picked the default model's screen two to one, so it builds the rest of the run. Provisional until Dan gives his own pick; if he prefers the other, the run switches from that point on.
- **Alternatives:** Fable (picked by one reviewer); waiting for Dan before building (would stall an unattended run).
- **Rationale:** D-027's rule: blind reviewers decide if Dan is away. Caveat recorded: two reviewers shared a model family with the winner.
- **Consequences:** The directions and screens are built by the default model.
- **Dan's pick (same morning):** "I like the warm one. It's awesome." That is X, with the warm lamp and warm Begin button: the default model's screen. The result stands, now confirmed by Dan.
- **Reversible:** Yes.

## D-030 — Jobs and weekly targets are Dan's to edit; none are hard-coded
- **Date:** 2026-09-24
- **Context:** Seeing the mock-ups, Dan checked that "the course", "gym", "Spanish" and so on are examples: "they are things I want to do but it can't be how the app is hard coded." The docs implied this (P6 "Dan set them himself", P9 "typing one line") but never said it outright. He asked for it to be recorded.
- **Decision:** Every kind of job and every weekly target is Dan's data. He can add, change, rename or remove them at any time. The ones named in the docs and on the mock-ups are his current set, used as examples. Rules that depend on a kind of job (leaning towards what's avoided, P5; "one hour of course work counts as done") apply to whatever he sets, not to fixed names.
- **Alternatives:** none considered; this makes explicit what was always intended.
- **Rationale:** P9 (the app suggests, Dan chooses); his life and goals will change over a year of play.
- **Consequences:** `DESIGN_PRINCIPLES.md` (P6, P9) and `technical/DATA_MODEL.md` updated. Phase 7 designs the data this way. How Dan edits targets without it becoming admin (P15, "no productivity theatre") is a Phase 5–6 UX question.
- **Reversible:** No need; it is a baseline requirement.

## D-031 — A language pass on the app's voice is a recorded job
- **Date:** 2026-09-24
- **Context:** Seeing the Phase 4 screens, Dan said some lines ("The lintel needs a word") sound AI-generated and stilted: "at one point we need to go over it and fix. Not now, since it's visual pass but we do need to record it as a job to do."
- **Decision:** Before the first playable, every line the app itself says gets a dedicated language pass so it reads like a person wrote it: natural rhythm, contractions, variety, no clipped formula lines. Dan reviews a sample. The Phase 4 mock-up copy is placeholder and is not the voice.
- **Alternatives:** fixing copy during the visual run (Dan: not now).
- **Rationale:** P14 (a plain, warm, honest voice); Dan knows how AI sounds and it breaks the spell.
- **Consequences:** Listed as a job in `OPEN_QUESTIONS.md` → UX, and in the Phase 4 handover. Suggested slot: Phase 5 or 6, before copy is fixed in the build.
- **Reversible:** Yes.

## D-032 — Dan combines the directions into one look
- **Date:** 2026-09-24
- **Context:** Dan walked through the three directions screen by screen on his phone and dictated what he liked (`ART_DIRECTION.md` → "Dan's walkthrough").
- **Decision:** Build a fourth, combined direction, **D**: C's purple world, full screen and never framed; B's interface (boxed buttons, labels with a line, selectable Low/Normal/High, line icons); A's map layout with B's animation and tap-to-select descriptions; B's cutting-a-word animation made full screen and purple; C's day complete, camp (with more depth), satchel (more realistic, gently glowing) and daybook. Spec: `ART_DIRECTION.md` → "D — The combined look".
- **Alternatives:** pick one of A, B or C whole (Dan preferred parts of each).
- **Rationale:** Dan's taste (rule 20). It also answers the two open questions: glow is purple for the place and the day, turning gold as the day completes; carved capitals set buttons and labels, plain print carries sentences.
- **Consequences:** The rest of the run builds D and puts it through critique. A, B and C stay in the repo as the record. Phase 4's "Dan picks or blends one" is met once he approves D.
- **Reversible:** Yes.

## D-033 — The delve length is adjustable, with a beautiful control
- **Date:** 2026-09-24
- **Context:** Dan, on seeing direction D: the Pomodoro is central for him. He wants to set the focus time by how he feels (25 by default, up to 30, 45 or 60 minutes; breaks stay 5), to keep going when in flow, and to skip the break without penalty. The control must be beautiful (a dial, a slider, the lamp's flame), not typed. As the time rises, the screen should hint that he'll go further and reach somewhere new. He asked for light research into beautiful ways to do this.
- **Decision:** Adopted. `TOOLS.md` §1 amended. The visual run researches duration controls briefly and builds the setting screen in direction D with two or three variants for Dan to try. Rewards stay time-based: a longer delve moves further in proportion, and the existing anti-farming slow-down after about two extra hours of the same kind of work still applies (P13).
- **Alternatives:** keep 25/5 fixed (the original draft); a free number field (Dan: no).
- **Rationale:** Dan's taste and self-knowledge (rule 20); P13 (real effort outweighs trivial input); P1 (starting stays one tap: the default needs no setting).
- **Risks noted:** a visible "you'd reach further" must never read as pressure on a low day (P3, P8): it appears only as he raises the time, never as a default nag. Skipping breaks during hyperfocus is his call; the app doesn't lecture.
- **Reversible:** Yes.

## D-034 — An outside review of the sealed story, by ChatGPT
- **Date:** 2026-09-24
- **Context:** Dan wants a second opinion on whether the story is deep, interesting, connected and flows well, from a different AI company. He accepted the spoiler risk and gave explicit permission to send the sealed files out.
- **Decision:** Claude made one bundle of the sealed story files with a warning to Dan at the top and instructions for ChatGPT inside: a spoiler-free verdict in chat for Dan, and a detailed critique as a separate file that Dan hands back to Claude unopened. Claude then judges the feedback and changes the story only with Dan's agreement, following the retcon procedure (MASTER_BRIEF §55), describing any change without spoilers.
- **Alternatives:** a fresh Claude critic with no spoiler risk (offered; Dan chose the outside review).
- **Risks:** Dan sees the story by accident; ChatGPT leaks detail into its chat reply. Mitigated by the warning and the instructions, not eliminated.
- **Reversible:** The review is; a spoiler is not.

## D-035 — Acting on the outside story review (plan only; spoiler-free)
- **Date:** 2026-09-24
- **Context:** ChatGPT's review of the sealed story (D-034) came back; Dan pasted it without reading. Detail and Claude's item-by-item verdicts: `narrative/sealed/REVIEW_EXTERNAL_1.md`.
- **Decision:** Claude agrees with nearly all of it (one point only in part). No rewrite. The fixes fall in three places: **a short sealed story session** before the first playable is built (a handful of precision fixes to the late story's presentation, one character's reasoning, how one mechanism is explained in the fiction, one location detail, and wording of two internal rules); **Phase 5–6 product design** (a formal memory and recap system so a year-long story delivered in small pieces stays remembered, a clear before/after for re-reading, a guaranteed reward rhythm, and high-energy days always unlocking something real); and **the first playable's test plan** (does Dan remember what he learns, and does it feel like discovery rather than homework). A second small story pass follows the playtest.
- **Top priority of the story session (confirmed 2026-09-24):** the late game must never appear to promise a meaningful choice that the fixed story cannot honour. The fixed ending and existing canon stay; the fix is in presentation and interaction, not branching.
- **Mark pacing:** the authored order of core marks and reveals stays fixed unless the playtest shows a real retention problem. High-energy days get meaningful side content instead (exploration, experiments, extra records, finds), never marks ahead of order.
- **Alternatives:** make every change now (not needed before the playable, and pacing changes should wait for the playtest); ignore it (the points are well founded).
- **Consequences:** Listed in `CURRENT_STATE.md` for the next phases. One line of the open game bible about how the doors fill may be reworded, without changing anything Dan already knows.
- **Reversible:** Yes, until clues are planted in the playable.

## D-036 — Stepping away from a delve: it is held, not paused
- **Date:** 2026-09-24
- **Context:** Dan, reviewing D: what happens when a delve is interrupted (a phone call, the toilet, or a longer absence)? He proposed jumping straight to the breather, keeping the minutes done, and carrying on the same delve afterwards; and, for a long absence, coming back later to the same job.
- **Decision:** Adopted, with one simplification (Claude's, agreed by Dan):
  1. During a delve, a quiet **"Step away"** replaces "Stop for now". It keeps the minutes done (they count towards the job at once), **holds** the delve with its time left, and goes straight into the breather.
  2. In the breather the main button is **"Back to the delve · N min left"**: the same delve carries on. The pieces add up to one delve and earn exactly what an unbroken one would.
  3. If the interruption runs long, nothing is needed: the breather ends as usual and the delve waits, with no countdown and no "you've been gone". Whenever Dan next opens Today that day, its first offer is **"Carry on: <job> · N min left"**, with starting afresh as the quieter option.
  4. The hold belongs to the job, not the screen: Dan can go anywhere in the app, or close it, and the spot is kept. A running delve also keeps running while he looks at other screens.
  5. Only one thing is ever held: starting a delve on another job closes the held one quietly (its minutes stay counted). A held delve closes at the end of the day; tomorrow starts fresh, with nothing owed.
  6. Fairness: a delve's reward still needs its full length in total, however many pieces; time stepped away never counts against a long delve's gaps.
  7. **Amended the same day (Dan): stopping is separate from stepping away.** The delve shows two quiet options: "Step away" (above) and **"Finish here"**. Finish here ends the delve now and every minute done counts at once. For a job measured in time (the Course's hour) nothing is asked. For a done-or-not job (the cat's medication) one question follows, "Is it done?" (Done / Not yet): Done completes the job and moves the world as usual; Not yet keeps the minutes. Finishing early is never shown as falling short (no unused minutes, no half-empty ring).
  8. **Kept simple (Dan: "make sure we aren't building in lots of ways to end it").** Only two ideas, always in the same words: "Step away" and "Finish here" (which also replaces "Done for now"). Each delve state has at most one main button and one quiet "Finish here". "Skip the breather" is dropped: "Next delve" during the breather starts it at once. The held breather has no separate "Back to today" (the Today link at the top does it, and offers Carry on). The mock-up's hidden tap-the-ring shortcut is removed.
- **Alternatives:** a pause button (a frozen timer waiting for you reads as an unfinished debt); asking at the moment of interruption whether it is short or long (a decision at the worst time).
- **Rationale:** interruptions are normal with ADHD (`TOOLS_RESEARCH.md`, proposal 6); failure is information, not punishment (rule 9); one button covers both cases, so nothing needs deciding mid-interruption (P1); pieces can't out-earn a whole (rule 10).
- **Consequences:** `game/TOOLS.md` §1, `design/INTERACTION_NOTES.md` (the delve) and the D mock-up (`delve.html`, `morning.html`) updated.
- **Reversible:** Yes.

## D-037 — Distance comes from time; runs of delves; places a working day apart
- **Date:** 2026-09-24
- **Context:** Dan, reviewing the delve-length dial: he usually works for a few hours or more, as runs of 25-minute delves with 5-minute breathers, and wants to set the run at the start. Four delves should take him four times as far as one, and getting somewhere must not be easy. The dial built for D-033 promised two named places in one hour, and the Phase 2 rule "one main job = one step" meant four hours on the course moved him barely more than one.
- **Decision (agreed by Dan):**
  1. **One step = 25 minutes of real effort**, in proportion: a 45-minute delve is 1.8 steps; four delves of 25 are 4 steps. A job done without a timer counts by **its usual length**, which is part of the job and Dan's to edit (D-030): the gym's hour = 2.4 steps, the sauna's 20 minutes = 0.8. The Course's hour is 2 steps (was 1). Only real time moves the expedition, so nothing can be split to earn more.
  2. **Named places are about a full working day apart** (roughly 6–8 delves; a starting guess, tuned in play). Every delve still shows something small (a passage, a line of script, a sound behind a wall). A short day ends at a camp between places ("a camp with a view"); a long day reaches the next named place. The arrival at day complete is wherever the day's steps reached.
  3. **Time speeds the Site, never the story.** Records, signs and words stay paced by days and Keys (unchanged). Four or more delves in one sitting (a long delve) reach a side chamber a single delve can't.
  4. **The open route before each seal is long enough for Dan's real hours** (side passages, deeper routes): a Phase 5–6 authoring requirement, so time is never wasted while a word is awaited.
  5. The existing slowdown stays: after about 2 extra hours of the same kind of work, steps come slower; switching jobs restores them. Slots still apply to jobs without timers (ten tiny jobs earn nothing extra).
  5a. **Finishing early never costs anything** (Dan, same day). A job finished before its delve ends (Finish here → Done) counts as done in full: it fills its slot, counts towards day complete, and an avoided job still brings its find. Distance follows the minutes actually spent. A delve's length is a limit, not a target.
  6. **Runs of delves.** The delve-length screen also sets **how many delves** (a run). The route ahead is one line: each delve adds a segment in proportion to its minutes, the next named place sits at its real distance and lights when the run reaches it, a long delve shows its side chamber, and one plain line gives the finish time ("4 delves of 25 · done around 13:55"). No debt numbers. **When a breather ends, the next delve starts by itself** (Dan's choice over waiting for a tap); Step away and Finish here (D-036) work across the run, and Finish here ends the whole run.
- **Alternatives:** keep one step per job (time beyond the job barely counts, and the dial's promises stay dishonest); a fixed step per non-timed job regardless of length (the gym's hour and a 5-minute call would count the same); next delve waits for a tap (Dan: it should start by itself).
- **Rationale:** rule 10 and P13 (real effort outweighs trivial input); Dan's actual working pattern (hours, not single sessions); story pacing protected (D-013, rule 6); one honest picture of time = distance on the one screen that sets it.
- **Consequences:** `game/CORE_LOOPS.md` (unit of effort, reward sizes), `game/ECONOMY.md`, `game/PROGRESSION.md`, `game/TOOLS.md` §1, `design/INTERACTION_NOTES.md` and the D mock-up (`delve-set.html`, `delve.html`, `morning.html`) updated. Supersedes D-033's destination list (a single delve no longer names far places).
- **Reversible:** Yes; the numbers are provisional until the first playable.

## D-038 — Reconciling the outside review of the principles
- **Date:** 2026-09-24
- **Context:** ChatGPT reviewed `design/PRINCIPLES_FOR_REVIEW.md` (15 points: 4 blockers, 7 should-fix, 4 nits). Dan asked for a reconciliation pass against the repo, not a blind implementation: a consistency and pressure-risk pass before approving Phase 4, not new design.
- **Decision:** Each point checked against the source docs. Verdicts: **accepted** 1, 2, 9, 10, 11, 12, 14, 15; **accepted as a wording fix** (the design already said it) 3, 6, 8, 13; **modified** 4, 7; **no design change** 5 (wording only). Changes, all in the source docs:
  1. **Day complete locks the day's success in.** Rest stays the main offer; a quiet "Keep going" is there on every day (with the deep route on a High day). Fixes a drift in the Phase 4 drafts, which had dropped the "keep going" of `CORE_LOOPS.md` Part 4 and D-011. Mock-ups: `complete.html`, `morning.html#done`.
  2. **The opening screen shows only today's jobs** (the 2–5 accepted main jobs), never satchel items, *someday*, what's left of a weekly target, or counts. P7 now says "no backlog" instead of "no list".
  3. **"I can't start" gives a teaser, never new story**: a line from just ahead, a sound, or something already found; the payoff comes after the job; the same teaser returns if tapped again that day. (`CORE_LOOPS.md` Part 4 already said this; P4's "story reveal" was loose.)
  4. **Not every job is a delve.** A job done away from the phone (gym, cooking, errands, appointments) has no ring: Begin marks it under way, Done on return plays its steps by the job's usual length (D-037). The app picks the way from the kind of job; one tap switches it if wrong. *Modified:* the review's three named execution modes were not adopted; the existing two kinds (timed desk work and jobs with a usual length, D-036/D-037) already cover gym, appointments and errands, so only the Begin rule needed writing down.
  5. **The breather:** no contradiction in the design. Inside a run Dan set, the next delve starts by itself (Dan's own choice, D-037); "Start it now" skips the breather early. Added: after a single delve nothing starts by itself. Stale button names fixed ("Next delve", "done for now").
  6. **Rest is never scored or counted against Dan.** The breather's 5 minutes run in the background: a gentle cue, at most a faint line, no numbers.
  7. **The low day is a default, not a fixed rule.** Outside + a real meal stays the default (Dan's own definition); Swap works as on any day. The app never asks what the meal was. *Modified:* no list of approved substitutions is added.
  8. **Capacity is a suggestion from bedtime** (the wording now says so; one-tap change was already there).
  9. **Dated items don't drift to *someday*.** Suggested as the date nears, no countdown or red; after the date, one question on opening: Done / New date / Let it go.
  10. **No catch-up avalanche.** Open weekly targets never add jobs or raise the day's size, and aren't pushed harder late in the week. A disrupted week becomes a lighter week unless Dan asks.
  11. **Using a tool alone earns nothing** (adding, sorting, planning); the world moves only for real action. P16 and the tool rule clarified.
  12. **The trail shows only placed markers**: no calendar, empty slots, ghost markers, or count of days in a row. *This reverses one detail of D-023* (a days-in-a-row count as a quiet detail), which already contradicted the "no streak numbers" rule in the Phase 4 drafts.
  13. **The course hour = two delves of 25** (the hour on the clock with the breather; any 50 delve minutes).
  14. **Nothing cinematic delays starting.** Begin starts at once; big moments come after action and a tap settles them.
  15. **Readability beats diegesis.** Dense screens (satchel, daybook) set text as a steady column on a strong scrim; a scrim is not a frame.
- **Alternatives:** implement the review as written (adds an execution-mode system and substitution rules nobody needs yet); change nothing (leaves real contradictions: the missing keep-going, the streak count, the list wording).
- **Rationale:** most points were wording drift between Phase 1–2 docs and the Phase 4 drafts; the real gaps (keep going, dated items, catch-up, non-desk jobs, the streak count) each close with one rule and no new system (rule 12). No sealed or story content touched.
- **Consequences:** `DESIGN_PRINCIPLES.md` (P2–P7, P16), `ANTI_FEATURES.md`, `game/TOOLS.md`, `game/CORE_LOOPS.md`, `game/QUEST_SYSTEM.md`, `design/UX_PRINCIPLES.md`, `design/INTERACTION_NOTES.md`, `design/DESIGN_SYSTEM.md`, the D mock-ups `complete.html` and `morning.html`. `design/PRINCIPLES_FOR_REVIEW.md` stays as the snapshot that was reviewed.
- **Reversible:** Yes. Point 12 needs Dan's nod, since it changes a detail he approved in D-023.

## D-039 — No dead ends for effort
- **Date:** 2026-09-24
- **Context:** Approving D, Dan asked about the stair screen ("The stair will keep. You can go down another day.", with only "Back to today"): "I want to be able to keep going if I want. Especially if I am feeling motivated. Shouldn't be punished for doing more work. Should be rewarded."
- **Decision:** Effort is never turned away. Every screen that ends something offers a way on when Dan wants it: quiet after day complete (D-038), the main button at a newly opened place. More real work always moves him further and brings more (Site, finds, records). The only thing paced is the order of the story's core marks (D-035); extra effort meets side content, never a wall or a "come back another day". The stair screen now reads "Every delve from here takes you further down", with **Go down** (opens the run screen) as the main button and a quiet "Today".
- **Alternatives:** keep the stair as a natural stopping point (it reads as being sent home at the moment of most motivation).
- **Rationale:** D-011 (low floor, high ceiling: "don't make it just for crippled me"); D-035 (high-energy days always unlock something real); rule 10 (real effort must be rewarded).
- **Consequences:** `DESIGN_PRINCIPLES.md` (P2), `design/UX_PRINCIPLES.md` (12), the D mock-up `stair.html`. Phase 5–6 authoring: the route past every newly opened place must hold Dan's real hours (already required by D-037).
- **Reversible:** Yes.

## D-040 — Phase 4 closed; Phase 5 (Concept synthesis) opened
- **Date:** 2026-09-24
- **Context:** Dan agreed with every verdict of the principles reconciliation (D-038, including removing the days-in-a-row count), raised the stair (D-039), and said "we are ready to move to phase 5".
- **Decision:** Direction D (D-032, with the motion pass of D-041), `design/UX_PRINCIPLES.md`, `design/DESIGN_SYSTEM.md` and `design/INTERACTION_NOTES.md` approved. Phase 4 closed; the work merged into `main`. Phase 5 opens. The zoomed-out whole-Site map mock-up is left for later (optional).
- **Alternatives:** mock the whole-Site map first (not needed to approve the look).
- **Consequences:** `CLAUDE.md` and `CURRENT_STATE.md` move to Phase 5. Phase 5 must set region sizes and step pacing numbers (D-037) and take in the product items from D-035.
- **Reversible:** Phase changes need Dan's agreement either way.

## D-041 — Every screen keeps moving; any job can be a delve
- **Date:** 2026-09-24
- **Context:** Before moving to Phase 5, Dan: the stair looks static; "all screens should look as beautiful as that but have some movement or reveal". A measurement of the D mock-ups confirmed it: once settled, only the delve and the word-cutting visibly moved. Separately, Dan: "I should be able to state what jobs I want to make delve jobs … I could even put gym as a delve job … If it locks me into what I've just told you, it wouldn't function very well."
- **Decision:**
  1. **The world is always alive** (UX 19). A shared `ambient.js` gives every screen a little life after it settles: scene screens drift slowly like a breathing camera (their light moves with them); fog drifts visibly faster; light motes rise (gold after day complete); the map sends a spark along walked routes and pulses "you are here". The stair lights its steps one by one going down, then a pulse keeps running down them into the mist. Reading screens never move the words (UX 17, D-038 point 15). Reduced motion turns all of it off.
  2. **Delve or not is Dan's to set, for any job** (amends D-038 point 4). One-offs, weekly targets, daily jobs and satchel items can all be delves, including the gym or reading. It's set when adding or editing a job and switchable for today with one tap; the app's first guess for a new job is only a default, and Dan's choice is kept.
- **Alternatives:** leave the reading screens as still as before (Dan asked for life everywhere); let the app decide delve-or-not with overrides (Dan: that would lock him in).
- **Rationale:** Dan's taste (taste session: smooth, quiet everyday motion); D-030 (jobs are Dan's to edit); rule 12 (one setting per job, no modes).
- **Consequences:** `design/UX_PRINCIPLES.md`, `design/INTERACTION_NOTES.md`, `game/TOOLS.md`, `game/CORE_LOOPS.md`, `DESIGN_PRINCIPLES.md` (P9); the D mock-ups (`ambient.js`, `direction.css`, `stair.html`, and eight screens load `ambient.js`).
- **Reversible:** Yes.

## D-042 — Phase 5 synthesises the chosen concept; no new concepts
- **Date:** 2026-09-24
- **Context:** MASTER_BRIEF §59 asks Phase 5 for 3–4 substantially different concepts to choose from. The concept was already chosen piece by piece: loop (D-010), story (D-024), tools (D-020, D-023), look (D-032, D-040). Dan: "No need to invent other new concepts. I think that's wasting time given how much work has gone into this one."
- **Decision:** A deliberate deviation from §59. Phase 5 writes **one** synthesis of the chosen concept (`product/CONCEPT.md`, under §59's headings), stress-tests it against the principles, sets the numbers the build needs (D-035, D-037), and lists the first playable's contents. Work order: `product/PHASE5_PLAN.md`.
- **Alternatives:** generate fresh concepts as §59 says (costs time and risks unsettling agreed work for no expected gain).
- **Rationale:** D-004 (thorough but pragmatic; get a small, beautiful first playable into Dan's hands quickly); the comparison §59 wants already happened in Phase 2 (`game/CORE_LOOPS.md` Parts 2–3).
- **Consequences:** `CLAUDE.md`, `CURRENT_STATE.md`, new `product/PHASE5_PLAN.md`.
- **Reversible:** Yes.

## D-043 — The concept's stress test: sixteen small rules at the edges
- **Date:** 2026-09-24
- **Context:** Phase 5 step 2 (`product/PHASE5_PLAN.md`): `product/CONCEPT.md` checked against the principles, the anti-features and the MASTER_BRIEF §71 checklist, and walked through a low, normal and high day, an interrupted delve, a week away and a disrupted week. Full record: `product/STRESS_TEST.md`.
- **Decision:** The concept holds; nothing is redesigned. Sixteen gaps, mostly where two agreed rules meet without saying what happens, are closed with one rule each (Claude's routine calls, per D-006; Dan sees them at step 5):
  F1 the app's day ends at about 4 am; F2 capacity and Swap work at any time until then, and lowering capacity can complete the day; F3 every delve minute moves Dan, on any job, while only today's jobs fill and complete the day; F4 a job's usual length defaults to 25 minutes and is never asked; F5 "avoided" is a mark on the job (pre-set, learned from repeated swaps, Dan's to change); F6 a Key opens something the moment it's earned and is never held, and a sealed thing that takes a Key is always in view; F7 a change to a weekly target applies from next week; F8 editing jobs is on request only, from the job itself, with defaults everywhere and the first playable preloaded; F9 the welcome back after an absence follows one small real job, the first day back is suggested Low, and passed-date questions come at most one a day and none on the first day back; F10 a week with nothing done gets no daybook page; F11 "Keep going" leads to the deep route on any day; F12 catching up is not a mode; F13 tiny steps are written for regular jobs, and other jobs get one by their way (desk or away); F14 a rhythm thing is a main job only as its weekly target's pick or the Low day's meal; F15 "Start it now" is the one name for skipping the breather; F16 "growing into it" is out of the first playable.
- **For Dan (step 5):** D1, keep the same-kind slowdown or pay variety as a bonus instead (Claude recommends the bonus: the job slate already protects avoided work, and the slowdown limits the course hours Dan wants); D2, a nod on evening "enough" (F2).
- **For step 3:** a weekly floor in the reward rhythm (a week with no target met would open nothing and could stall the first word), the day's edge, the absence threshold, late opening, what low and normal arrivals always carry, and how often a side chamber holds an authored find.
- **Alternatives:** leave the edges to the build (they would be decided by accident in code); larger fixes such as new modes for catching up or returning (rule 12).
- **Rationale:** rule 8 (the free welcome moved the world without action), P7 (stacked questions on return), P9 (asking a length for every line), D-039 (effort on an off-list job or on a day suggested Normal was turned away), D-012 (held Keys would be a currency), rule 10 (mid-week target edits).
- **Consequences:** `product/CONCEPT.md`, `product/STRESS_TEST.md` (new), `DESIGN_PRINCIPLES.md` (P3), `game/QUEST_SYSTEM.md`, `game/TOOLS.md`, `game/CORE_LOOPS.md`, `game/ECONOMY.md`, `OPEN_QUESTIONS.md`.
- **Reversible:** Yes, every rule; the numbers stay provisional until the first playable.

## D-044 — No slowdown for staying on one job; a find for switching
- **Date:** 2026-09-24
- **Context:** The two points D-043 left for Dan. D1: the same-kind slowdown (steps slower after about 2 extra hours of one kind of work, `QUEST_SYSTEM.md`) limited the course hours Dan wants. D2: lowering capacity in the evening to complete a two-job day (D-043, F2).
- **Decision (Dan):** D1, "Something extra if I switch, but still progress if I don't." The slowdown is removed: staying on one job always keeps full progress (25 minutes = one step). After a long stretch of one kind of work (about 2 hours, tuned in step 3), the first delve on a different kind brings a **find**. D2, yes: F2 stands as written.
- **Alternatives:** keep the slowdown (a penalty for doing more of what Dan wants to do); no variety pull at all (loses a gentle push towards avoided work).
- **Rationale:** D-039 ("shouldn't be punished for doing more work"); rule 9; the day's job slate already keeps the course from crowding out avoided work (P5), so the bonus only needs to invite variety, not enforce it.
- **Consequences:** `product/CONCEPT.md`, `product/STRESS_TEST.md`, `game/QUEST_SYSTEM.md`, `game/TOOLS.md`, `game/CORE_LOOPS.md`, `game/ECONOMY.md`, `OPEN_QUESTIONS.md`, `CURRENT_STATE.md`. Supersedes D-037 point 5's slowdown (its slot rule stays). Step 3 sets the stretch length and counts these finds in the year's supply.
- **Reversible:** Yes.

## D-045 — The week planner: reconciling the outside review (draft, for Dan)
- **Date:** 2026-09-24
- **Context:** Dan asked for a scheduler integrated into the app, not an afterthought: plan the week whenever he likes, with repeating jobs he defines himself (how long, how many times a week or fortnight), and delves scheduled automatically. He first asked for one at D-020; it was deferred. Claude's proposal (`product/SCHEDULER_PROPOSAL.md`) went to ChatGPT, which approved the direction and not every mechanic (about 8.5/10). Reconciled item by item in `product/SCHEDULER_REVIEW.md`.
- **Decision (draft; locks when Dan approves the rules and the mock-ups):** the rules in `game/PLANNER.md`. Four rules: the plan is a forecast, not a promise; planning predicts progress and action creates it; the app proposes and Dan edits; enough is fixed before more begins. Weekly targets become **rhythms**, all Dan's own input (N a week, set days, every 2 weeks; optional length and time; no ranges). **This week** is the view, and **Plan my week** is the main action (fixed rules, no learning yet). There is **no tray** of unplaced jobs. Capacity overrides the plan. Released jobs are re-placed only below a day's Normal size, otherwise they fall away. Off-plan work counts in full, and keeping to the plan earns nothing extra. The plan never holds more of a rhythm than its enough. The past shows only what was done, while planned-vs-done is kept internally and never shown. The core story's pace does not depend on the number of rhythms. The planner is in the first playable, **without Google Calendar**.
- **Disagreements with the review:** no "stretch aim: 12 h" label (a bar above enough, UX 6); no tray, even as a secondary view; no ranges; no "explain why" feature in the first playable.
- **For Dan:** whether a 3-hour course day counts at its first hour (recommended; P5) or only at the full 3. Approval of `game/PLANNER.md` and the mock-ups (`week.html`, `rhythms.html`, `today-planned.html`).
- **Alternatives:** keep planning deferred past the first playable (Dan: it must not be an afterthought); the tray-first proposal (a debt display); a full recurrence engine and calendar sync now (too much before the planner's value is tested).
- **Rationale:** Dan's request; planning *when and where* is the best-evidenced tool in the design (`TOOLS_RESEARCH.md` §3) and is the activity scheduling his psychologist recommended; P1, P3, P6, P7, P9 and P16 are kept by the four rules.
- **Consequences:** new `game/PLANNER.md`, `product/SCHEDULER_REVIEW.md`; `TOOLS.md` §3 points to it; three new D mock-ups. Once approved: fold rhythms into `QUEST_SYSTEM.md`, `CORE_LOOPS.md` and P6/P16, add the step to `PHASE5_PLAN.md`, and step 3 sets the Key numbers.
- **Reversible:** Yes.

## D-046 — The language pass comes after 3–4 weeks of play
- **Date:** 2026-09-24
- **Context:** Reading the planner review file, Dan: the language is "very AI like". He confirmed the language pass (D-031) must happen, and said: "I want to see the app before the language pass so build it in after my 3-4 week test."
- **Decision:** The language pass on every line the app says moves from "Phase 5–6, before copy is fixed in the build" to **after Dan has played the first playable for 3–4 weeks**. Until then all copy (mock-ups, first playable) is placeholder. The first playable must keep every line easy to change in one place (a Phase 7 requirement), so the pass needs no rebuild.
- **Note:** the behaviour test was set at 5–6 weeks (D-023), so the pass may land inside it. That's fine as long as it's recorded, since changed wording is one more thing that changes during the test.
- **Alternatives:** do the pass before the build (D-031's slot; Dan wants to see the app first).
- **Rationale:** Dan's choice; wording is judged best on real screens in real use.
- **Consequences:** `CURRENT_STATE.md`, `OPEN_QUESTIONS.md`, `design/UX_PRINCIPLES.md`. Phase 7 records the one-place copy requirement. Supersedes D-031's suggested slot.
- **Reversible:** Yes.

## D-047 — The week planner: the second review reconciled; the Course day counts at its hour
- **Date:** 2026-09-24
- **Context:** ChatGPT's second review of the planner (D-045) agreed with the direction and with all three of Claude's rejections, and asked for a small reconciliation. Dan answered D-045's open question himself: a 3-hour Course day counts once its first hour is done. Record: `product/SCHEDULER_REVIEW.md` → "The second review" (6 accepted, 1 modified, 8 already resolved, none rejected).
- **Decision:**
  1. **The Course day counts at its first hour** (Dan). The planned 3 hours are room, not the bar; the rest is more, which moves Dan in full (D-044) and is never shown as owed. Contract: planned as "1 h · room for 3"; Begin opens the run at the hour, with a gold *enough* mark on the line; the hour ends in its own moment ("Course session complete. Enough for today."), which counts at once; then **Continue** and **Back to today** with equal weight, neither the default; past enough the words say "more", never "of six". If Dan set a longer run himself before Begin, the moment still shows and the run carries on by itself (D-037 kept).
  2. **Each job has its own enough, read from how it's set up** (no categories; D-038 point 4 kept): a delve rhythm counts at its *enough at* (one optional field, delve rhythms only, default all of it; the Course preloaded at 1 hour); a delve one-off when Dan says it's done; a job without a timer when marked done, its length only planning and paying steps. Replaces the draft "one hour = done" rule for every timed job.
  3. **Invariant: adding rhythms never raises the most Keys a period can usefully give** (`game/ECONOMY.md`). The period's Key supply is bounded by the game; once used up, effort still pays through steps, distance, finds, side chambers and the deep route. Step 3 sets the numbers.
  4. Copy: the Low day says only "A lighter day."; the forecast is predictive ("Current forecast: … around Thursday"; waypoints tagged *forecast*); "Stop this one" becomes "Stop repeating".
  5. The readability check gates the planner's lock, not Phase 4 (closed, D-040): passed at true size in the browser (every quiet colour 6:1 or better); Dan's check on his own phone remains.
- **Disagreements with the review:** only item 14's timing (Phase 4 is already closed). Kept, with reasons: the D-037 auto-continue for a run Dan lengthens himself.
- **Alternatives:** count the Course only at 3 hours (turns 2 good hours into a miss, against P5); keep one hour as the rule for every timed job (wrong for completion jobs); a per-job completion setting for every job (setup Dan doesn't want, P9); Continue as the main button (makes more the expected path).
- **Rationale:** P2, P5, P7, P9, rule 10 (trivial or multiplied inputs must not out-earn real effort), rule 11, UX 6.
- **Consequences:** `game/PLANNER.md` (reconciled, ready for Dan's approval), `game/ECONOMY.md`, `product/PHASE5_PLAN.md` (step 3 input), `product/SCHEDULER_REVIEW.md`, `design/INTERACTION_NOTES.md`, mock-ups `today-planned.html`, `week.html`, `rhythms.html`, `delve-set.html`, `delve.html` and their `NOTES.md`. Answers D-045's open question.
- **Reversible:** Yes.

## D-048 — The week planner approved and locked
- **Date:** 2026-09-24
- **Context:** Dan reviewed the reconciliation of the second review (D-047), the revised rules and the changed screens.
- **Decision (Dan):** "Yes. Proceed." `game/PLANNER.md` is locked. Weekly targets become rhythms throughout the docs; the planner is in the first playable (without Google Calendar). P16 gains the planner's line: *the plan is a forecast, not a promise; planning predicts progress, action creates it.*
- **Alternatives:** none open; D-045 and D-047 hold them.
- **Consequences:** `game/PLANNER.md` (locked), `DESIGN_PRINCIPLES.md` (P5, P6, P16 clarified), `game/QUEST_SYSTEM.md`, `game/CORE_LOOPS.md`, `game/TOOLS.md`, `game/GAME_DESIGN.md` (planner in the first playable; plotting no longer "later"), `product/CONCEPT.md`, `product/PHASE5_PLAN.md` (step 2a). Phase 5 continues at step 3; readability on Dan's own phone is still worth a look whenever convenient.
- **Reversible:** Yes, by a new decision.

## D-049 — The numbers (Phase 5 step 3; draft for Dan)
- **Date:** 2026-09-24
- **Context:** `product/PHASE5_PLAN.md` step 3: set the numbers the build needs, as starting guesses. Inputs: D-035 (reward rhythm, high days, memory), D-037 (distance), D-043 (seven step-3 inputs), D-044 (switching), D-047 (the Key invariant), and the sealed pacing ledger (checked privately).
- **Decision (Claude's routine call, D-006; Dan reviews at step 5):** `game/BALANCING.md`. Two clocks: **time moves the Site**, uncapped; **the story keeps its order**, at most one story week per calendar week, stretched by thin weeks and paused by absence. Places may run one story week ahead, never signs. Named places **8 steps** apart. **5 useful Keys a week**, one per rhythm met, story counts first; a **floor of 2** for any week with a day complete; a rhythm met past the supply brings one find (at most one a week); milestone Keys only fill their own great door. Every side chamber holds a find, about one in three record-bearing. The long stretch for the switching find: 4 delves on one job in a day. Opening late: after 14:00 one fewer job, after 19:00 one job completes the day. Absence: 3 days. Memory: the week close names up to 3 things learned; each month's first week close adds a 3–5 line "so far"; before → now on re-reads; the absence welcome names the nearest open question.
- **Replaces:** "a strongly exceeded target can open a sealed thing" (`CORE_LOOPS.md`), which broke the D-047 invariant.
- **Alternatives:** let hours advance the story (spends a year's story in weeks for a heavy worker, and breaks clue order); a hard daily cap (against D-011, D-039); Keys scaled by how much of each rhythm was done (a partial-credit meter, against P6 and UX 6).
- **Rationale:** D-011, D-035, D-037, D-039, D-047, rule 10; Dan's honest week of rhythms comes to about 40 steps, which the 8-step spacing turns into one story week of places.
- **Consequences:** `game/BALANCING.md` (new content), `CORE_LOOPS.md`, `ECONOMY.md`, `PROGRESSION.md`, `product/CONCEPT.md`, `product/STRESS_TEST.md`, `product/PHASE5_PLAN.md`; the D mock-ups' sample distance (`delve.html`, `delve-set.html`) moves from 7 to 8 delves; a sealed alignment note and an authoring list for the story-fix session.
- **Reversible:** Yes: all numbers are tuned in play.

## D-050 — The first playable's contents (Phase 5 step 4; draft for Dan)
- **Date:** 2026-09-24
- **Context:** `product/PHASE5_PLAN.md` step 4: what is in and out of the first playable, sized for the 5–6 week test (D-023).
- **Decision (draft; Dan reviews at step 5):** `product/FIRST_PLAYABLE.md`. In: Today with capacity, the delve and runs (with the Course's enough moment), jobs with and without timers, the week planner (D-048), the satchel, one region with its open route, the map, two lives, the first marks and the first word in week 2–3, Keys by `BALANCING.md`, finds, the deep push, camp and bedtime, the trail's first relic, the daybook as week close with memory lines, absence handling. Out: calendar, drag and drop, advanced rhythms, planner learning, company at work, satchel groups, more great doors and milestone Keys, more lives, sound design, notifications, AI text. Before the build: the sealed story-fix session with week 6 and the new authoring list; Phase 7's requirements; Dan's phone check.
- **For Dan:** great doors for big projects (the Course's modules) now or later (Claude leans later).
- **Alternatives:** the Phase 2 draft as it stood (predates the planner, runs, the enough moment and the numbers).
- **Consequences:** new `product/FIRST_PLAYABLE.md`; `game/GAME_DESIGN.md` and `game/TOOLS.md` point to it; `product/PHASE5_PLAN.md`.
- **Reversible:** Yes; Phase 6 may cut it further.

## D-051 — Step 5: Dan approves the numbers and the first playable's contents
- **Date:** 2026-09-24
- **Context:** Phase 5 step 5. Dan heard a three-point summary (the numbers, the contents list, one question) and answered by voice.
- **Decision (Dan):** "The numbers feel right" (`game/BALANCING.md`, D-049, approved). "Nothing is missing" (`product/FIRST_PLAYABLE.md`, D-050, approved). Great doors for big projects (the Course's modules) come **later**: "it already counts" every day.
- **Consequences:** both docs marked approved; `PHASE5_PLAN.md` step 5 done. Remaining for Phase 5: Dan's agreement to close it and move to Phase 6 (step 6). Still pending in parallel: the sealed story-fix session (D-035) and Dan's look at the planner screens on his phone (D-047).
- **Reversible:** Yes.

## D-052 — Phase 5 closed; Phase 6 (MVP) opened
- **Date:** 2026-09-24
- **Context:** Phase 5's exit criteria are met: one concept (D-042), written and stress-tested (D-043, D-044), the week planner added and locked (D-045, D-047, D-048), the numbers set (D-049) and the first playable's contents listed (D-050), both approved (D-051).
- **Decision (Dan):** "Yes." Phase 5 is closed and merged into `main`. Phase 6 (MVP, MASTER_BRIEF §60–61) opens in a new session.
- **Carried into Phase 6:** the sealed story-fix session with week 6 and the new authoring list (D-035, D-049), before the build; Dan's phone check of the planner screens (D-047); the language pass after 3–4 weeks of play (D-046).
- **Reversible:** Phase changes need Dan's agreement.

## D-053 — The MVP and the central test (Phase 6; draft for Dan)
- **Date:** 2026-09-24
- **Context:** Phase 6 (MASTER_BRIEF §60–61): cut the approved first playable (D-050, D-051) to the smallest true version, and write the central test.
- **Decision (draft; Claude's routine calls, D-006, with four points for Dan):** `product/MVP.md`. A four-question bar for every item (loop or test broken? task manager with a picture? a wall within six weeks? met before the test ends?). The first playable stays whole except: the map's whole-Site zoom level (out until a second region); forecast waypoints on the map (out; the forecast line stays; for Dan, since D-048 locked them); the morning deep push (out; "Keep going" reaches the same route; for Dan); before → now only if the story's weeks 1–6 need it; **one painted scene per area** with named places reusing it (for Dan). A content budget for six story weeks, week 7 onward drafted during the test. Build order in four slices; the test starts only when all four are in, on a fresh save. The test measures **starting**, above all avoided jobs, and separates jobs started from the app from jobs logged afterwards; a baseline chat and written predictions before day 1; notes stay on the phone; three short chats; evidence for, against, what not to overinterpret, and what each reading leads to.
- **Alternatives:** cut the planner or the satchel (Dan asked for both, D-020, D-045; and without them normal use hits a wall); start the test with slices 1–2 and add the rest mid-test (the first word would arrive in a changing app, and mid-test bugs spoil the evidence); count total hours or Keys as the measure (they reward the Course and the gym, which already happen, and hide the avoided jobs).
- **Rationale:** rule 13, rule 14, D-004 (small but beautiful, quickly), D-023 (5–6 weeks), MASTER_BRIEF §61 (qualitative, no invasive analytics).
- **Consequences:** `product/MVP.md` (new content); `CURRENT_STATE.md`. On Dan's answers: `FIRST_PLAYABLE.md`, `PLANNER.md`, `INTERACTION_NOTES.md` note the cuts. The story-fix session (D-035) gains two jobs: say whether weeks 1–6 need before → now, and supply the content budget.
- **Reversible:** Yes.

## D-054 — Dan's four answers on the MVP
- **Date:** 2026-09-24
- **Context:** the four points in `product/MVP.md` (D-053).
- **Decision (Dan):** **a painting for every named place** (not one per area, reused); **forecast waypoints on the map stay**; **the morning deep push stays**; **the test notes stay on the phone**, and Dan decides at the end whether to share the summary.
- **Claude's note, said once:** a painting per place means about 30–35 before the test and about 5 a week after it (about 260 in a year). It is Dan's call on beauty, and it moves the biggest cost of the build into art production.
- **Consequences:** `product/MVP.md` updated: the MVP now differs from the first playable only by the whole-Site zoom level (out until a second region) and before → now (only if the story needs it). **Phase 7** must choose how the paintings are made at that rate while keeping direction D (D-040). The start of the test moves later accordingly. `FIRST_PLAYABLE.md` and `INTERACTION_NOTES.md` note the zoom cut.
- **Reversible:** Yes.

## D-055 — The MVP approved; Phase 6 closed; Phase 7 (technical architecture) opened
- **Date:** 2026-09-24
- **Context:** Phase 6's exit criteria: `product/MVP.md` written (D-053), the central test written in it, Dan's four answers folded in (D-054).
- **Decision (Dan):** "Proceed." The MVP and its test are approved; Phase 6 is closed and merged into `main`; Phase 7 (MASTER_BRIEF §62–66) opens in a new session.
- **Carried into Phase 7:** the requirements in `FIRST_PLAYABLE.md` (the delve's end heard or felt with the phone locked; state survives restarts; all copy in one place, D-046; jobs and rhythms as data, D-030; planned / moved / done kept, never shown, D-045); the test notes on the phone only, with a summary Dan may share (D-054); **how a painting per named place is made at about 5 a week in direction D** (D-054). Still pending in parallel: the sealed story-fix session (D-035) with the MVP's content budget; Dan's phone check of the planner screens (D-047).
- **Reversible:** Phase changes need Dan's agreement.

## D-056 — Dan's answers for the technical choice
- **Date:** 2026-09-24
- **Context:** Phase 7 opens (D-055). Four things only Dan knows decide the stack (MASTER_BRIEF §62).
- **Decision (Dan):** **iPhone, staying** (no Android); **no computer at home**; **up to about $99 a year** is fine (Apple's developer membership); the paintings stay **code-painted, as in the mock-ups** (not AI images, not a hired artist).
- **Consequences:** build for iPhone only; nothing depends on Dan running a Mac (a cloud Mac packages the app); TestFlight is the install route; the painting kit (D-057) extends the method of `design/directions/d-combined/hall.js`.
- **Reversible:** Yes (a new phone or computer reopens the choice; the paintings' method can be revisited if the kit can't reach the bar).

## D-057 — The stack: web code in a real iPhone app; the painting kit (draft for Dan)
- **Date:** 2026-09-24
- **Context:** Phase 7 (MASTER_BRIEF §62–66). Requirements from `FIRST_PLAYABLE.md` → "What must exist before the build", `product/MVP.md`, `design/DESIGN_SYSTEM.md` and D-056.
- **Decision (draft; Claude's recommendation, Dan to agree):** `technical/TECH_DECISIONS.md`. Option B: **TypeScript + Svelte + Vite inside Capacitor**, built in a Linux container, packaged by a cloud Mac (GitHub Actions + fastlane; Codemagic fallback), installed through **TestFlight**. Local only: SQLite on the phone, no server, account, analytics or AI. The delve's end is a **local notification** scheduled at Begin; timers are worked out from the clock. The Phase 8 prototype runs the same code as a web link. **Paintings:** a reusable painting kit (ray-cast lit masses, shared stone, forms, light and live layers), one short scene file per place, baked in the cloud to an image with live layers on top, automatic checks plus a critique round, one sealed-aware painting session a week; Dan judges three invented sample places before the build.
- **Alternatives:** A, home-screen web app (no locked-phone alert without a server; storage can be cleared; kept as the Phase 8 prototype route); C, React Native with Expo (easiest no-Mac builds, but direction D rebuilt and screens judged through an imitation); D, native Swift (best on iPhone, but with no Mac Claude builds blind); E, Flutter (C's rebuild cost without its no-Mac ease). For paintings: AI images or an artist (Dan chose code-painted, D-056).
- **Rationale:** reuses the approved look exactly (D-040); meets the locked-phone requirement with no server; every screen checked at true size before Dan sees it; nothing leaves the phone (§63); fastest build for the MVP (D-004, rule 13).
- **Consequences:** Dan's one-time setup on his phone (membership, app record, a key for the cloud Mac, TestFlight), started during Phase 8. A scheduled monthly rebuild so TestFlight's 90-day expiry never bites. Five early trials open Phase 8 (locked-phone alert, smoothness, real-app feel, the pipeline, the kit's sample places); option C is the fallback if the first or third fails badly. Next: `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY_PRIVACY.md`, `TEST_STRATEGY.md`.
- **Reversible:** Yes, until Phase 8 builds on it; the game rules and data would carry over to C.

## D-058 — Dan agrees to the stack and the painting plan
- **Date:** 2026-09-24
- **Context:** `technical/TECH_DECISIONS.md` (D-057).
- **Decision (Dan):** "Yes, proceed." Option B (web code in a real iPhone app, via TestFlight) and the painting kit, with three invented sample places for Dan to judge first.
- **Consequences:** `TECH_DECISIONS.md` marked agreed; the four remaining technical docs are written on this stack (D-059).
- **Reversible:** Yes, until Phase 8 builds on it (fallback: option C).

## D-059 — Architecture, data model, privacy and test strategy (Claude's routine calls, D-006)
- **Date:** 2026-09-24
- **Context:** Phase 7's remaining exit criterion (MASTER_BRIEF §63–64, §72–74), for the MVP on the agreed stack (D-058).
- **Decision:** `technical/ARCHITECTURE.md`: five parts (core, content, platform, ui, paint) with one-way dependencies; the source of truth is an append-only **log of facts** (what Dan did, and what the world gave, recorded once so later rule changes never take anything back), with a rebuildable snapshot; timers are timestamps; the 04:00 day edge in one function; the clock passed in; screens receive only a "can see now" view; canon never shipped; all copy in one file; content shipped per build, a week ahead. `technical/DATA_MODEL.md`: Dan's data, the fact types, authored content types with stable ids, save and content versions, migrations with a backup first, sample saves for every version. `technical/SECURITY_PRIVACY.md`: no network at all (enforced), notifications the only permission, Apple the only outside service, the test summary shared only if Dan exports it. `technical/TEST_STRATEGY.md`: six layers, including story order and locked-information tests over generated states, scripted weeks against `BALANCING.md` §8, time edge cases, and the direction D "Never" list checked automatically.
- **Alternatives:** storing only current state (simpler, but rule changes could silently rewrite the past, and the test's notes would need separate tracking); working out the world's gifts on every open (a rules change would replay the story differently); a state library or server (premature).
- **Rationale:** rules 9, 13, 18; D-015, D-030, D-045, D-046; MASTER_BRIEF §64's principles; the MVP's no-tracking test notes.
- **Consequences:** Phase 8 creates `app/` in this shape. Story content and painting scene files live in marked sealed folders.
- **Reversible:** Yes.

## D-060 — Phase 7 closed; Phase 8 (prototype) opened; when the story job happens
- **Date:** 2026-09-24
- **Context:** Phase 7's exit criteria met: the stack and the painting kit agreed (D-057, D-058), the four technical docs written (D-059).
- **Decision (Dan):** "Yes, proceed." Phase 7 closed and merged into `main`; Phase 8 (MASTER_BRIEF §67) opens in a new session. Dan also noted the sealed story-fix session (D-035) is still to do, "assuming it can come after the MVP".
- **Claude's answer on timing:** not after the MVP, because the MVP carries the story's first six weeks and its places' paintings, and the test can't start without them. It **can** come after the prototype: Phase 8 uses throwaway data and invented places. So it runs in its own session **after the prototype and before the first playable's content goes in** (Phase 9), and the real places' paintings follow it.
- **Consequences:** `CLAUDE.md` and `CURRENT_STATE.md` move to Phase 8 with its exit criteria (five trials, the sample paintings approved, TestFlight working, the heart slice felt on Dan's phone). The story job is placed in the plan.
- **Reversible:** Phase changes need Dan's agreement; the story job's timing can move earlier at any time.

## D-061 — Phase 8 begins: the painting kit's method, the app skeleton, Apple setup (Claude's routine calls, D-006)
- **Date:** 2026-09-24
- **Context:** Phase 8 opens (D-060). Trial (a) first: can a reusable kit reach the approved hall's quality in three invented places (`TECH_DECISIONS.md` → paintings)? Apple's membership takes a day or two, so Dan's steps go out now.
- **Decision:** (1) **The kit marches rays on the GPU** (WebGL2 in a headless browser at bake time) instead of the hall's hand-written ray-caster on the CPU. Same method and look: lit masses from point lights, the hall's own stone function (joints, bevels, chisel, stains), its haze, bloom, depth blur, tone and dither, ported line for line. What changes is that a place is built from shared forms (halls, shafts, domes, arcades, stairs, spiral stairs, water, raw rock) in one short scene file, and a full-size painting bakes in 10–60 seconds. (2) Three invented sample places (not in the story): **The Well Stair**, **The Rib Gallery**, **The Pool Dome**, in `app/paint/samples/`, shown to Dan in a phone viewer beside the approved hall, which is drawn live exactly as in Phase 4. (3) **Automatic checks** per painting (`app/paint/check.mjs`): no true red (calibrated on the approved hall, whose lamp-lit stone is dusky rust-mauve and passes), hues within violet-to-gold, the place name readable at ≥ 4.5:1 under its scrim, size under 0.7 MB. (4) `app/` created in `ARCHITECTURE.md`'s shape with Vite, Svelte 5, TypeScript and Vitest, pinned; the first rule is the 04:00 day edge, worked from the phone's local wall clock, with tests. (5) The app's ID is `com.dniachini.rlrpg`; Dan's Apple steps are `technical/APPLE_SETUP.md` (the key goes straight into GitHub's secrets, never into chat).
- **Alternatives:** keep the CPU ray-caster and generalise it (slow at full size, and every new form means new intersection code); paint in the browser on the phone (hot, slow to open; rejected in D-057).
- **Rationale:** D-057's kit, at a pace that makes about 5 paintings a week steady work; rule 13 (thin slices); SECURITY_PRIVACY (no key in chat).
- **Consequences:** the baked images are small (50–110 KB each so far, far under the 0.3–0.7 MB budget). Dan judges the samples on his phone; if the kit can't reach the bar, we stop and talk (D-058).
- **Reversible:** Yes.

## D-062 — Dan approves the sample paintings; Apple membership active; his iPhone
- **Date:** 2026-09-24
- **Context:** Phase 8 trial (a) (D-061): the kit's three invented sample places, seen on Dan's phone beside the approved hall.
- **Decision (Dan):** the samples "look good": **the painting kit reaches the bar** (D-058). Dan's Apple developer membership is active. His phone is an **iPhone 16 Pro Max**, with an **iPhone 18 Pro Max** coming soon.
- **Consequences:** trial (a) passes. Paintings bake at the 16 Pro Max's own resolution (1320 × 2868; 440 × 956 points), so nothing is scaled up; a newer phone of the same class is checked when it arrives. Next: Apple setup sitting 2 (`technical/APPLE_SETUP.md`), then Capacitor, the cloud-Mac pipeline and a first TestFlight build carrying trials (b) and (c).
- **Reversible:** Yes (the kit can be revisited if later paintings fall short).

## D-063 — The iPhone wrapper and the cloud-Mac pipeline (Claude's routine calls, D-006)
- **Date:** 2026-09-24
- **Context:** Phase 8 trials (b)–(d) need a real app on Dan's phone (D-057, D-062).
- **Decision:** Capacitor 8 wraps the web code (`app/ios/`, Swift Package Manager, no CocoaPods): iPhone only, portrait only, dark, no bounce, iOS 17 or later, and the "no special encryption" answer so TestFlight doesn't ask each build. The **pipeline** (`.github/workflows/testflight.yml`) runs on GitHub's macOS runner: tests, web build, archive unsigned, then **Xcode signs and uploads in one step** with Apple's cloud-managed distribution certificate, reached through the App Store Connect API key. That needs the key at **Admin** access and a fourth secret, the Team ID (`APPLE_SETUP.md` updated). It runs only when started by hand, on a commit marked `[testflight]`, or monthly (TestFlight's 90 days); Mac minutes are scarce. A Linux workflow runs the tests on every push. The first test app is a throwaway **trials screen** on the Well Stair painting: a one-minute delve whose end is a local notification (trial b), and a tap with a haptic tick plus the no-bounce, no-selection, safe-area checks (trial c).
- **Alternatives:** fastlane with match (needs a separate certificate store and more secrets; the D-057 plan, kept as the fallback if cloud signing is refused); Codemagic (the fallback if GitHub's Mac minutes run short).
- **Rationale:** fewest moving parts and nothing Dan must handle beyond four secrets on his phone.
- **Consequences:** if Apple refuses cloud signing on the first run, we fall back to fastlane match or Codemagic (reversible, no change for Dan beyond possibly one more secret).
- **Reversible:** Yes.

## D-064 — The heart slice built first as a web link, while Apple setup waits (Dan's call; Claude's routine calls, D-006)
- **Date:** 2026-09-24
- **Context:** Apple setup sitting 2 is blocked: Apple's developer pages don't work on Dan's phone, and he will do them on a computer later. Trials (b)–(d) need TestFlight. Dan asked for the heart slice meanwhile, as a web link on his phone (as `CURRENT_STATE.md` already planned: "as a web link on Dan's phone and then through TestFlight").
- **Decision (Dan):** build the heart slice now, before trials (b)–(d). This is a small, deliberate change of order inside Phase 8 (rule 13 asked for the trials first); the trials still happen before Phase 8 closes.
- **Decision (Claude, routine):** (1) **The rules** (`app/src/core/`): the fact log is the source of truth; a run of delves is worked out from timestamps and Dan's marks (Start it now, Step away, Back to the delve, Finish here); the world's gifts (steps, day complete, the arrival) are written once, when they happen, stamped with the moment they really happened, even if the phone was locked. A run's minutes belong to the game day it began (a delve across 04:00). An arrival not yet seen isn't where Dan stands until its own screen reveals it. (2) **Fact log additions** to `DATA_MODEL.md`: `delveStarted` carries the run's count (later delves in a run start by themselves and are worked out, not written); `dayCompleted` (the day's lock-in, written once); `seen` (a step or an arrival looked at; the test's "opened or skipped past"); `delveEnded` and run steps carry the run they belong to. (3) **Throwaway content** (`app/src/content/world/prototype.ts`): the three invented sample places on one route (the second 75 minutes of effort from the start, so a first Normal day arrives somewhere), three camps, passage lines and teasers that are not the story, and a stand-in job list from Dan's starting set (not editable until the planner slice). (4) **The screens**, ported from direction D's mock-ups: Today, the dial and run line, the delve (the approved tunnel, ring and dust, unchanged), the step, day complete and the arrival, "I can't start". Paintings are lifted so their light sits between the words. (5) **The link**: the whole app folded into one self-contained page (`npm run build:link`) and published as a private claude.ai link, instead of a Netlify zip: nothing for Dan to upload, and still no network requests from the page. (6) A **rehearsal** mode (minutes pass 60 times faster, on its own throwaway save) so the whole day can be felt in a few minutes; temporary, behind a "Prototype" link.
- **Alternatives:** wait for Apple (loses days of feel-testing); Netlify Drop (Dan would have to upload a zip from his phone); GitHub Pages (the repository is private).
- **Consequences:** on the web link the delve's end cannot sound with the phone locked; it chimes if the page is open and shows the end when Dan comes back. The save is the browser's own storage (throwaway). Both are recorded in `technical/PROTOTYPE_NOTES.md` and go away with the TestFlight build.
- **Reversible:** Yes.
