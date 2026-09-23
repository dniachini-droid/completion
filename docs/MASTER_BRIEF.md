# Master Brief — Real-Life RPG (provisional name: `real-life-rpg`)

> Founding document of the project, written by Dan at project start (2026-09-23).
> This is the canonical statement of intent. It is condensed from the original
> prompt but preserves every requirement. If this document and a later decision
> conflict, the later decision (recorded in `DECISIONS.md`) wins — but only if it
> was made explicitly.

---

## 0. The central idea

Build a beautiful, deeply engaging **single-player RPG whose primary input is progress in Dan's real life.**

- It is **not** a productivity app with an RPG skin.
- It is intended to become **a genuine long-running RPG in which real-life actions are the controller.**
- The fiction should ultimately be compelling enough that Dan wants to know what happens next even without thinking of it as a productivity tool.
- Meaningful progression in the fictional world should primarily occur because Dan does meaningful things in the real world.

Example real-world inputs: studying Spanish; studying Claude Code / AI / software development; gym; cooking; meal prep; life admin; home maintenance; creative projects; learning; exploring; completing difficult projects; eventually other parts of life.

**Foundational distinction:**
Not *"I should study Spanish because my productivity app says so."*
But *"I want to do my Spanish because I want to see what happens next."*

## Roles Claude plays (at different stages)

Product discovery partner, game designer, narrative designer, behavioural-design partner, UX designer, art-direction partner, technical architect, software engineer, tester, reviewer, documentation maintainer, and long-term custodian of the project's internal logic. **Do not jump into coding.** The order of operations is deliberate.

## 1. Background about Dan

- Dan, 39. Currently not working → much more unstructured time than during most of adult life.
- Work used to provide external structure: deadlines, meetings, projects, expectations, responsibilities, people depending on him, reasons to start things at particular times. That structure is largely absent now.
- In theory there's time for many valued things; in practice, **initiating** them can be surprisingly hard.
- **Recovering from an injury**; motivation and capacity are inconsistent. Some days very engaged; other days ordinary tasks feel hard to begin.
- The issue is usually **not** not knowing what to do. He generally knows.
- Current candidate activities: Spanish, Claude Code / AI / software course, gym, cooking, meal prep, groceries, life admin, home maintenance, technical and creative projects, hobbies, learning things of interest.
- Loves games — particularly discovery, progression, exploration, rich systems, collecting, mystery, beautiful worlds, interesting characters, meaningful long-term development.
- **Claude must interview Dan extensively rather than assume** from this short description.

## 2. The real problem may not be productivity

Do not assume "Dan needs a better task manager." Likely real problems include:
initiation; lack of external structure; decision paralysis; momentum; reward; curiosity; inconsistent capacity; difficulty deciding what counts as "enough" for a day; too much available time → no urgency; tasks feeling emotionally flat even when intellectually valued.

A conventional productivity system can make this worse: a list of Spanish / Claude / gym / meal prep / groceries / clean / admin / aquarium / coding / reading / appointments / misc reads as **a large field of obligations**.

The system must answer:
- **What would make today a good day?**
- **What should I do next?**
- **How can we make beginning easier?** (perhaps the most important)

## 3. Hypothesised experience (not a spec)

A good day might contain only a few meaningful core actions, e.g.:

```
TODAY'S QUESTS
KNOWLEDGE — Spanish, 25 minutes
FORGE     — Claude Code, one meaningful section
BODY      — Gym
(optional activities beneath)
```

Completing them → **DAY COMPLETE**, not "3 of 14 tasks completed". That distinction matters.

Do **not** automatically implement three tasks. Determine via interview whether three, four, points, time budgets, categories, flexible goals, player-selected quests, system-selected quests, a combination, or something entirely different works better.

## 4. The game

Game design is a first-class discipline, not decoration.

Mechanics of interest (possibilities only — do **not** include all): HP, MP, XP, levels, attributes, skill trees, equipment, loot, rarity, inventory, artefacts, collections, creatures, flora, minerals, books, lore, maps, exploration, quests / side quests / major quests, bosses, characters, companions, factions, reputation, base building, settlement restoration, crafting, puzzles, hidden areas, secrets, narrative choices, world-state changes, long-term mysteries.

Claude's job includes identifying which mechanics **genuinely help** versus which are merely attractive feature ideas.

## 5. The story must be extremely deep

Not shallow autogenerated flavour text. A world and story with enough structure to unfold over **months or years**. Substantial narrative effort is welcome.

Wanted: intentional foreshadowing; deep history; mysteries with actual answers; recurring symbols; archaeological clues; environmental storytelling; unreliable information; competing historical interpretations; secrets; factions; character motives; relationships; mythology; ideology; forgotten events; artefacts whose importance is initially unclear; apparently unrelated events that later connect; clues discovered months before their significance becomes apparent.

Target moment: **"Holy shit. That was there the entire time."**

- Do not create such moments by retroactive invention.
- **For major mysteries: know the truth before planting the clues.**
- Respect Dan's intelligence. Don't over-explain. Some information stays uncertain for long periods.

## 6. Narrative information must be structured

Maintain strict distinctions between:

| Layer | Meaning |
|---|---|
| **World truth** | What actually happened. May contain info the player must not see during normal play. |
| **Player-known information** | What Dan/his character has actually discovered. |
| **Character beliefs** | What specific NPCs believe — may be correct, partial, mistaken, biased, propaganda-based, or deliberate lies. |
| **Public history** | What people in the world commonly believe. |
| **False information** | Rumours, myths, propaganda, mistakes, deception. |
| **Unresolved questions** | Mysteries not yet revealed. |
| **Clue ledger** | Every important clue: where it appears, when, what it superficially suggests, what it actually relates to, prerequisites, later payoff, whether encountered. |
| **Revelation map** | How major truths are progressively revealed. |

This is necessary to create mystery without contradiction.

## 7. Possible world direction (nothing decided)

Do **not** default to medieval fantasy. Options include: dark fantasy, science fantasy, lost civilisation, archaeological mystery, forgotten advanced society, abandoned future, post-collapse, mythological, cosmic mystery, magical realism, dreamlike, historical influences, ancient technology, something completely original.

One rough premise that currently appeals (example only — **do not anchor prematurely**): I arrive somewhere unfamiliar. Something has happened. The world is partly abandoned. Structures remain; some systems function, others are dormant. I don't understand where I am or why. Evidence slowly suggests my presence may not be accidental. Different regions reveal different parts of the history. Early beliefs may later prove incomplete or wrong.

## 8. Real life should control the game

Candidate domains (do not assume a simple one-to-one category system is optimal — explore alternatives):

- **Knowledge** — Spanish, courses, reading, learning
- **Building** — Claude Code, programming, app development, creative projects, producing things
- **Physical** — gym, walking, exercise, physical challenges
- **Life** — cooking, meal prep, groceries, cleaning, admin, maintaining environment
- **Exploration** — museums, new places, events, travel, new experiences, trying unfamiliar things
- **Major projects** — completing a course, building an app, finishing a substantial personal objective

## 9. Capacity must matter

Days don't have identical capacity. Maybe Low / Normal / High, maybe something more sophisticated. **A low-capacity day must still be capable of being a successful day.** The system might reduce number of quests, duration, difficulty, expected effort, complexity. E.g. Normal: Spanish 40 min; Low: Spanish 10 min, or "open Spanish and complete one exercise". The point is not to trivialise goals but to **preserve momentum and lower activation energy.**

## 10. The "I can't start" system

Potentially one of the most important mechanics. A button/action equivalent to **"I can't get started."** The system temporarily ignores the ambitious plan and gives the **smallest meaningful next action** (put on gym clothes; open the Spanish app; open the Claude project; read one paragraph; put the saucepan on the bench). Afterward it may ask whether to continue. Explore deeply in product discovery. **It must never be patronising.**

## 11. HP and MP

Liked, but must have actual meaning. Hypothesis: **HP** = physical/general capacity today; **MP** = cognitive focus capacity. Focus sessions consume MP, physical activity consumes HP, mixed tasks both. Running out of MP → "Knowledge quests complete for today", not "You failed" — giving something productivity systems rarely provide: **permission to stop.** Determine whether HP/MP actually improves the system; don't include RPG mechanics just because RPGs have them.

## 12. Collection and discovery

Collecting is suspected to be highly motivating. Possible discoverables: artefacts, relics, books, creatures, flora, minerals, maps, fossils, tech components, weapons, armour, spells, documents, memories, fragments, keys, mysterious objects. Rarity is liked (Common / Uncommon / Rare / Epic / Legendary / Unknown/special) but needs careful economy design. **Must not become "create 100 tiny tasks → farm 100 item rolls."** Meaningful progress → meaningful rewards.

## 13. Variable reward

Not always knowing the reward may be engaging. Completing a difficult real action might reveal an item, clue, encounter, map section, character interaction, rare discovery, new location, environmental change, or fragment of a larger object. Rewards should create **curiosity**. **Avoid manipulative casino-style design** — exciting, not exploitative.

## 14. World development

Real progress might evolve the world, e.g. study restores an Archive; building software repairs an ancient machine; physical activity allows expeditions further from base; cooking/home maintenance develop a settlement/sanctuary; large projects unlock major world events. Examples only — explore whether mappings feel meaningful or forced.

## 15. Bosses

Large real projects may map to bosses (e.g. a Claude Code course module = THE AUTOMATON, HP 1,000; meaningful work damages it; completed exercises more; finishing the module defeats it). **The RPG metaphor must not trivialise serious real achievements** — fictional victory should amplify real satisfaction.

## 16. Failure must not be punitive — HARD RULE

No: dead companions, destroyed settlements, lost rare equipment, lost levels, broken giant streaks, disappointed NPCs, shame, hostile motivational language.

Missing something generates information. Possible responses: quest remains; world waits; task shrinks; difficulty recalibrates; system asks what happened; a different route appears; expectation is reconsidered.

**Failure should generate information, not shame.**

## 17. No productivity theatre

Very little maintenance. No life spent tagging, recolouring, managing dashboards, relabelling, reorganising, estimating trivial tasks, optimising the system instead of doing things. Over time the app should learn what works for Dan. **The player plays the game and lives his life; he is not the game's administrator.**

## 18. No task farming

Entering "stand up / walk to sink / drink water / put glass down / walk back" must not beat a difficult 45-minute study session. Some model may account for significance, difficulty, time, avoidance, consistency, real progress, task type, novelty — **without Dan manually scoring everything.**

## 19. Rest is part of the system

Rest ≠ failure to be productive. Possibly rest days, recovery states, sanctuary, camp, low-capacity days, intentional breaks. But **don't turn every relaxing activity into another quantified task. Some life should remain outside the system.** Discovery must determine where that boundary is.

## 20. Weekly success

Dislikes punitive streaks. May prefer flexible consistency, e.g. Spanish 4/5 ✓, Claude 3/4 ✓, Gym 4/4 ✓, Life 2/2 ✓ → successful week. Explore weekly goals, rolling consistency, adaptive goals, chapters, seasons, quest chains, flexible frequency. Streaks are not assumed.

## 21. Aesthetics matter enormously

Beautiful. **Not** Jira-with-swords, Todoist-with-fantasy-background, Habitica, generic AI fantasy, or mobile-game visual clutter. Possibly: sophisticated, atmospheric, cinematic, mysterious, premium, elegant, restrained, tactile, beautifully illustrated, highly polished — **but interview Dan.** Strong visual hierarchy. **Obvious what to do next.** Deep game, non-chaotic interface.

## 22. Audio may eventually matter

Ambient environments, music, discovery sounds, subtle UI sounds, completion cues, narrative audio. Not prioritised before the core experience works.

## 23. Anti-goals — what this must NOT become

Habitica clone · Todoist with XP · shallow gamification · generic fantasy · generic AI writing · meaningless XP inflation · endless currencies · notification spam · guilt engine · punitive streak app · complicated life-management dashboard · game that rewards maintaining the app · game exploitable by task farming · AI inventing contradictory lore daily · NPCs constantly praising Dan · a software project so enormous Dan never gets to use it.

## 24. Primary design questions

- **Product:** How do we make it easier for Dan to initiate meaningful activities in a life with limited external structure?
- **Game:** How do we make the fictional world compelling enough that he genuinely wants to progress?
- **Integration:** How do we make meaningful real-life progress the primary mechanism for advancing that world?
- **Narrative:** How do we create a mystery-rich long-term story that stays coherent over months or years?
- **Behavioural:** How do we reward action without shame, pressure, or manipulation?

## 25–27. Repository setup, CLAUDE.md, initial commit

Initialise a documentation-only repository (structure in `README.md`). No app scaffold, framework, `package.json`, database or technical architecture decisions at setup. `CLAUDE.md` holds permanent project rules and the current phase. First commit: `chore: initialize real-life RPG discovery repository`. A private GitHub repo is acceptable if already authenticated; **never public**. Don't let GitHub setup derail discovery.

## 28. Phase model

| # | Phase |
|---|---|
| 0 | Player discovery |
| 1 | Product discovery |
| 2 | Game design |
| 3 | Narrative and world design |
| 4 | Experience / art / UX design |
| 5 | Concept synthesis |
| 6 | MVP definition |
| 7 | Technical architecture |
| 8 | Prototype |
| 9 | First playable |
| 10 | Personal alpha |
| 11 | Iteration and expansion |

Not rigid waterfall — feedback loops expected — but **ordering matters. Don't skip phases because coding is fast.**

## 29–38. Phase 0 — Player discovery

- **No application code.** Understand Dan.
- Interview conversationally, **~5–10 questions per round**, follow-ups based on actual answers; investigate interesting threads; not a mechanical questionnaire.
- Start with Dan as a game player: favourite games, obsessions, hundreds-of-hours games, games expected to love but abandoned, games returned to, favourite RPGs and non-RPGs, specific remembered moments; exploration, combat, puzzles, progression, collecting, crafting, base building, loot, skills, builds, choices, characters, mysteries, worlds, music, art, difficulty, UIs, maps, discovery, quest structures, surprises, secrets. **Repeatedly ask why.** Not "I like Skyrim" but *what exactly* — and what became boring.
- Other media: books, film, TV, architecture, art, museums, mythology, history, SF, fantasy, horror, mystery, music, environments. Identify recurring themes (ancient ruins? technological mystery? political intrigue? cosmic horror? melancholy? beauty? wonder? discovery? archaeology? unreliable narration? philosophy? epic vs intimate stakes?). **Ask, don't assume.**
- Motivation patterns: what's initiated easily vs avoided and why; absorption/hyperfocus triggers; what kills interest; satisfying completions; meaningless rewards; role of anticipation, rarity, uncertainty, mastery, completion, discovery, competition, social accountability, progress bars, deadlines, external expectation; what makes him reopen an app. Specific examples.
- Actual days: waking, mornings, sharpest time, motivation dips, gym/study timing, derailers, overwhelm, what follows a bad start, very good vs bad days, end-of-day regrets, weekends, whether scheduled blocks help or annoy.
- Productivity tool history (to-do apps, calendars, planners, reminders, timers, habit trackers, streak apps, Notion, Todoist, Tiimo, Finch, Amazing Marvin, paper, whiteboards, alarms…): liked, disliked, kept using, why stopped, what became work, what felt rewarding, which notifications were ignored.
- After each meaningful round update `docs/PLAYER_MODEL.md` (sections: explicit facts/preferences; strong hypotheses; weak hypotheses; motivators; demotivators; behavioural patterns; game / narrative / UX preferences; uncertainties). **Never collapse hypotheses into facts.**
- Maintain `docs/DISCOVERY.md` (readable, extracted, session-dated — not transcripts) and `docs/OPEN_QUESTIONS.md` (grouped: player, behaviour, game design, narrative, productivity, UX, technology, ethics/privacy).
- **Don't rush.** May take multiple long sessions. Periodically report what's understood, uncertain, surprising, contradictory; let Dan correct.
- **Exit criteria** — articulate with reasonable confidence:
  1. What game experiences genuinely absorb Dan.
  2. What commonly makes him stop playing games.
  3. Which reward structures motivate him.
  4. Which rapidly become meaningless.
  5. What causes him to initiate real-world activities.
  6. What causes avoidance.
  7. What "a good day" actually means to him.
  8. What level of structure helps.
  9. What level becomes oppressive.
  10. What fictional worlds reliably interest him.
  11. What UX aesthetics he responds to.
  12. What he strongly does not want.

  **Ask Dan explicitly whether the player model is accurate enough before closing Phase 0.**

## 39–41. Phase 1 — Product discovery

Define the behavioural/product problem **before** game mechanics. Questions: Is initiation the main problem? Is prioritisation equally important? Does scheduling help? Reminders? How should capacity work? Repeated avoidance? Disappearing for a week? What's a completed day? What should / shouldn't be tracked? How much automatic planning vs retained control? Manual task entry? Recurring activities? Large projects? Unexpected obligations? Rest?

Produce `docs/DESIGN_PRINCIPLES.md` derived from discovery (candidates: progress over perfection; starting > planning; low-capacity days can succeed; curiosity beats guilt; failure produces information; minimise administration; real life stays larger than the app; optional complexity must not obscure today's next action).

Maintain `docs/ANTI_FEATURES.md`: deliberate exclusions with reasons (e.g. punitive streak loss, XP for trivial spam, dozens of currencies, unnecessary social features, daily guilt notifications, manual estimation of every task).

## 42–50. Phase 2 — Game design

Only after player and product are understood. **Develop multiple candidate core loops; don't converge immediately.** For each: player fantasy; daily / weekly / monthly / long-term loops; progression; reward; collection; failure; rest; story integration; real-world integration.

- **Core loop** (`game/CORE_LOOPS.md`) — derive it; the example below is not to be used blindly:
  receive/choose meaningful quest → begin real action → complete meaningful threshold → return → world responds → discovery/progression/consequence → new question/possibility → curiosity rises → want next real action.
- **Daily loop:** exactly what happens on opening in the morning. Ask capacity? Know recurring goals? Suggest quests? Player chooses? Present one first? Game or planner first? What is "day complete"? Continue after core day? Low-capacity days? Opening at 4 pm?
- **Weekly loop:** planning, progress, recovery, larger objectives, world changes, chapter pacing. **Sunday night must not become an admin meeting with myself.**
- **Long-term loop:** sustain 1 / 3 / 6 / 12+ months. Unfold content and mechanics gradually; don't expose every system in week one.
- **Progression** (`game/PROGRESSION.md`): need XP? character level? skill levels? world level? reputation? equipment? abilities? exploration progress? Every axis must answer **"what meaningful change does increasing this create?"** Delete meaningless numbers.
- **Economy** (`game/ECONOMY.md`): for each currency/resource — source, sink, purpose, reason to exist, exploit risks, relation to real tasks. **Fewer currencies.** None exist merely because games have currencies.
- **Quest system** (`game/QUEST_SYSTEM.md`): core daily, optional, recurring, story, major, bosses, exploratory, recovery, tiny initiation steps. How a real action becomes a quest.
- **Anti-farming:** meaningful duration, difficulty, significance, diminishing returns on repeats, milestone recognition, rarity limits, manual approval of major achievements — **without an anti-cheat system Dan has to administer.**

## 51–56. Phase 3 — Narrative and world design

Only after the core game is understood. Don't start with chapters. Order: thematic core → world rules → central player fantasy → cosmology (if relevant) → world history → actual hidden truth → major factions → key historical events → major characters → central mystery → secondary mysteries → revelation architecture.

- A specialist narrative agent (e.g. Fable) may be used extensively if available; otherwise Claude does it. Any specialist must first read MASTER_BRIEF, PLAYER_MODEL, DESIGN_PRINCIPLES, GAME_DESIGN, CORE_LOOPS, NARRATIVE_RULES. **No specialist may silently override project decisions.**
- **World truth first:** write canonical hidden answers in `narrative/sealed/WORLD_TRUTH.md` (what really happened, chronology, causes, secret relationships, true motives, hidden systems, major revelations, explanations). Player-facing content must not leak it.
- **Mystery graph** (`sealed/MYSTERIES.md`, `sealed/CLUE_LEDGER.md`), per mystery: question; actual answer; false candidate explanations; who knows part of the truth; misleading evidence; early / middle / late clues; revelation trigger; consequences.
- **Foreshadowing is intentional**; plant and track evidence before reveals. If a major truth changes, review related clues for contradictions. **Never casually retcon.** If necessary: identify conflict → explain why → propose options → update affected docs → record in `DECISIONS.md`.
- **Characters** have desires, fears, histories, biases, conflicting objectives, relationships, secrets, imperfect knowledge, changing states. No NPCs who exist only to congratulate. No sycophancy. Characters may dislike, distrust, misunderstand, or oppose the player when appropriate.

## 57–58. Phase 4 — Experience and art direction

Interview Dan about visual taste across games, film, architecture, graphic design, illustration, maps, typography, animation, interfaces. Develop **≥3 genuinely distinct directions** (not colour swaps), each covering mood, materiality, typography, world presentation, UI philosophy, map style, inventory style, animation philosophy, narrative presentation → `design/ART_DIRECTION.md`.

**UX principle:** however deep the RPG, on opening the app it must be **extremely obvious what to do next.** Deep system, simple moment-to-moment interaction — a deliberate tension.

## 59. Phase 5 — Concept synthesis

Generate ~3–4 substantially different complete concepts (e.g. A: exploration mystery; B: restoration; C: character-driven expedition; D: something discovered in research). Each: player fantasy, daily use, story, core loop, collection, progression, real-life connection, strengths, risks, longevity, implementation complexity. Discuss with Dan. **Do not choose on his behalf.** Record choice and rationale.

## 60–61. Phase 6 — MVP

The smallest **true** version of the game — must already feel like the product, **not "task manager now, RPG later."** A possible MVP: one beautiful starting location, one meaningful NPC, daily quest generation, a capacity mechanic, the "I can't start" mechanic, one collection, one progression system, one real mystery, several discoveries, the first significant narrative hook — but derive it from the chosen concept.

**Central MVP test:** *Does wanting to progress the fictional world make Dan more likely to initiate meaningful real-world actions?* Define supporting evidence, weakening evidence, what to observe, what not to overinterpret. Avoid invasive analytics; qualitative evidence matters.

## 62–66. Phase 7 — Technical architecture

Only now choose technology. Don't assume React Native, Swift, Supabase etc. Evaluate: iPhone-only vs multi-platform; native vs cross-platform; offline-first; local data; sync; AI requirements; narrative data size; assets; notifications; save-state reliability; security/privacy; future expansion; dev speed; visual fidelity. Compare credible options, recommend, explain trade-offs → `technical/TECH_DECISIONS.md`.

- **Privacy:** collect only what's useful; avoid tracking. Document what data exists, why, where it lives, whether it leaves the device, backups, what AI sees, what APIs receive → `technical/SECURITY_PRIVACY.md`.
- **Architecture principles:** clear modules; explicit state models; testability; migrations; deterministic game rules where appropriate; separate authored canon from generated dialogue; separate game logic from UI; separate narrative truth from player-visible state; versioned content where appropriate. **No premature enterprise architecture.**
- **AI in the product:** don't assume live AI-generated story (continuity risk). Investigate hybrids: authored core narrative and mysteries; deterministic progression; AI-assisted incidental dialogue, quest breakdown, personal planning, difficulty interpretation, flavour within strict canon. Core truth and major reveals probably stay controlled. Decide later.
- **Build vertically:** thin complete slice first — open app → see today's meaningful objective → start real action → return → complete → real in-game consequence → discover something → want to continue. Make that feel good, then expand.

## 67–70. Phases 8–10 — Prototype, first playable, personal alpha

- **Prototype** the central interaction, prioritising emotional feel, clarity, narrative payoff, reward timing, friction, beauty. Placeholders OK, but never let temporary ugliness become permanent by accident; record compromises.
- **First playable:** persists state, survives restart, real quest flow, game consequence, genuine narrative, a discovery, basic failure/recovery, usable repeatedly. Claude tests technically, then Dan uses it.
- **Personal alpha:** Dan is the real player. Don't answer every request with a feature. Investigate underlying causes (e.g. "ignored the app for three days" → notifications? weak rewards? wrong quests? weak story? friction? asks too much? predictable?). **Fix causes, not symptoms.**
- Maintain `docs/PLAYTEST_LOG.md` (date, what happened, behaviour, friction, motivation, surprises, hypotheses, potential changes, decisions).

## 71. Review before large features

1. What player problem does this solve? 2. What game problem? 3. How does it support the core loop? 4. Does it introduce maintenance? 5. Exploitability? 6. Cognitive load? 7. Simpler version? 8. Is it actually fun? 9. Are we adding it because games normally have it? 10. Does it conflict with an anti-feature?

## 72–74. Code quality, testing, review

- Clean, understandable modules; test important rules; careful persistence; typed models where appropriate; no giant files; no premature abstraction; run formatters/linters/tests; review changes; deliberate dependencies. Don't leave the repo broken after a completed feature unless noted.
- `technical/TEST_STRATEGY.md`: economy unit tests, quest generation, progression, save/load, migrations, narrative unlock conditions, critical-flow UI tests, tests preventing access to locked information, exploit regression tests. **Narrative logic deserves tests too.**
- Review not only code but against MASTER_BRIEF, PLAYER_MODEL, DESIGN_PRINCIPLES, ANTI_FEATURES, GAME_DESIGN, ART_DIRECTION, NARRATIVE_RULES. A technically elegant feature can still be wrong for the product.

## 75–77. Commits, history, audits

- Meaningful, focused commits (`docs: capture player discovery round 4`, `design: define candidate game loops`, `narrative: establish canonical world timeline`, `feat: add daily quest selection`, `test: cover quest scaling by capacity`…). Branch before risky work.
- Don't delete history lightly. When direction changes, update current docs but preserve rationale in `DECISIONS.md` (decision, date, context, alternatives, rationale, consequences, reversibility).
- **Periodic audit** at milestones: still solving the original problem? RPG becoming compelling? Too complex? Productivity layer become admin? Narrative continuity holding? Systems rewarding meaningful behaviour? Building for hypothetical users instead of Dan? What should be removed? What's the weakest part? Document results.

## 78–81. Scope philosophy

- **Designed for Dan**, not a mass market. No teams, social networks, billing, subscriptions, public profiles, enterprise settings, broad onboarding — not now.
- If it proves motivating it may grow (regions, evolving settlement, character arcs, expeditions, collections, equipment, specialisation, companions, complex mysteries, multiple arcs, seasons, real-world exploration, bosses, physical integrations, richer sound, custom art, AI) — but **earn complexity.**
- **Content quantity ≠ depth.** Depth = relationships, consequences, consistency, layered meaning, foreshadowing, interconnection, history, discovery. Prefer 20 meaningful things to 2,000 meaningless ones.
- **Gamification ≠ fun.** Points, XP, streaks, progress bars are not inherently motivating. Keep asking: **"Would Dan actually care about this?"** If not, remove it.

## 82. Desired emotional experience

| Moment | Target feeling |
|---|---|
| Opening the app | "I wonder what happens today." — not "time to manage my productivity." |
| Completing something difficult | "Fuck yes. Show me what I found." |
| Low-capacity day | "That was enough. I still moved forward." |
| Returning after days away | "Good. The world is still here. Where was I?" |
| Long-planted mystery pays off | "Holy shit." |

## 83–86. How Claude interacts with Dan

- Collaborative, **not sycophantic.** Say why weak ideas are weak. Flag conflicts with earlier principles. Explain trade-offs when excitement meets high complexity / low benefit. Don't automatically agree — but don't shut down ambitious ideas just because they're hard. Separate *difficult but potentially valuable* from *complicated and unnecessary.*
- Discovery questions: 5–10 at a time; concrete; ask for examples; follow emotional reactions. (Not "what progression do you enjoy?" but "think of a game where levelling up genuinely excited you — what did the level give you that made you care?")
- Don't interview forever without synthesis: periodically summarise what's known, suspected, contradictory, emerging opportunities, unresolved — let Dan correct, then continue.
- Documentation should be useful, not ceremonial: concise, cross-referenced, not duplicated across files.

## Pacing amendment (added by Dan, 2026-09-23)

Phases 0–5 should be thorough but pragmatic. The goal is not to perfect the entire eventual game before implementation. Conduct enough discovery to understand Dan and establish the core game concept, then prioritise getting a **small but beautiful first playable** into his hands quickly. Deep worldbuilding and narrative can continue in parallel after the core loop is proven. (See `DECISIONS.md` D-004.)

## 87–89. Continuity and phase changes

- **Progress tracker** (added by Dan, 2026-09-23): `docs/CURRENT_STATE.md` is the authoritative record of current phase, objective, session focus, what must NOT be worked on yet, exit criteria, milestones, blockers and exactly one recommended next action. Read it at the start of every session; update it before ending every substantial session. If Dan asks for work that skips substantially ahead, point it out and ask whether he deliberately wants to deviate.
- **Session start:** read `docs/CURRENT_STATE.md` first; before consequential decisions also read `CLAUDE.md`, `docs/MASTER_BRIEF.md`, `docs/DECISIONS.md`, `docs/PLAYER_MODEL.md`, relevant domain docs. The repository — not conversational memory — is the source of continuity.
- **Session close:** update docs; add/resolve open questions; record decisions; update phase if appropriate; run tests if code exists; review diff; commit coherent work (don't force a commit if work is unfinished or contradictory); short summary (what changed, what we learned, unresolved issues, logical next session).
- **Phase changes need explicit acknowledgement:** say what phase is finishing, why exit criteria are met, what remains uncertain, what the next phase will do. Get Dan's agreement before major irreversible design transitions (not for every minor action).
