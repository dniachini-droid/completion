# Open Questions

> Every unresolved major question. Remove or mark resolved (with a pointer to `DECISIONS.md`) as they are settled.

## Player
- Which specific game experiences genuinely absorb Dan, and why?
- Which fictional worlds and tones reliably interest him?
- Which reward structures motivate him, and which quickly become meaningless? *(Round 1: new abilities strongly motivate; grinding doesn't.)*
- How far can revisionist history ("the evil side had a point") go before it spoils the good-vs-evil stakes he likes? *(Round 2: villain depth is wanted.)*
- Dead civilisations (ruins) vs living alien cultures? *(Round 2: likes discovering living alien life too.)*
- ~~What makes a goal feel "visible"?~~ Knowing roughly what's coming; the details a surprise (round 3).
- ~~How dark should the tone be?~~ "The darker the better" (round 3). New question: how does a dark world coexist with a kind app?
- ~~Does loot/collecting/rarity motivate him?~~ Only gear with powers; collectibles are mild (round 5).

## Behaviour
- What causes initiation vs avoidance for him, specifically?
- ~~What does "a good day" actually mean to him?~~ About 3 main jobs; low day = outside + a real meal (Phase 1; `DESIGN_PRINCIPLES.md` P2).
- ~~How does his capacity vary, and can he self-report it?~~ He can tell from last night's bedtime; one-tap Low/Normal/High, pre-set from bedtime (P3). Whether bedtime reliably predicts capacity: test in use.
- ~~Is initiation the main problem?~~ Yes: starting, not choosing (Phase 1 round 1). "Enough" is defined in P2.
- ~~Why are admin, housework and Spanish avoided?~~ Boredom, easier alternatives (phone/YouTube), pile-up; Spanish lapsed with 20 prepaid lessons unused (round 5).
- How can the app beat YouTube at the couch moment?
- ~~Can the game help with sleep without creating sleep anxiety?~~ Reward winding down and bedtime, never hours slept (P11).
- Is Pomodoro the natural unit of effort?

## Game design
- ~~Do HP/MP add real meaning?~~ No: dropped with XP, levels and currencies (D-012). Revisit if Dan misses a sense of size in use.
- ~~Which core loop?~~ A blend, *Explore · Decode · Connect* (D-010).
- ~~Is the same-kind slowdown the right high-day balance?~~ Replaced by a find for switching kinds; staying keeps full progress (D-044). Whether the find is enough pull towards variety: test in use.
- ~~What is XP even for?~~ Dropped (D-012). Still open: how do daily repetitive inputs unlock *new verbs* often enough without inflation? *(Pacing in `game/PROGRESSION.md`.)*
- ~~How many core daily actions define a complete day?~~ About 3 main jobs (P2). Test in use.
- Does collection/rarity motivate him in practice, and how to prevent farming?
- Do bosses for large projects amplify or trivialise real achievement? *(Proposed instead: great gates opened by real milestones, `game/QUEST_SYSTEM.md`.)*
- ~~Could a composable ability system be the core progression?~~ Yes: signs combine into words that are powers (`game/PROGRESSION.md`).
- Is creative building worth its cost here, or is it a separate game?
- The trail (D-023): do markers in total, with relics at milestones, feel as good as a days-in-a-row streak, without turning into pressure? *(Test in use.)*
- Can the app read and write Google Calendar simply and safely? *(Phase 7.)*

## Narrative
- Which world direction? (Deliberately undecided; do not anchor on the "arrival in an abandoned world" premise.)
- How much authored vs generated content? **Sharpened by round 3:** story is why he plays and he stops when it ends, so the rate of authored story must keep pace with his real-life activity for months.
- Could a multi-era, multi-protagonist structure (Eternal Darkness) fit a real-life-driven game?

## Productivity
- What in his past tool history worked, and why did he stop using things?
- ~~Where is the boundary between inside and outside the system?~~ Chosen hobbies may appear; rest acknowledged, never scored (P12).
- Do reminders/notifications help at all? *(Dan unsure. Test in the prototype.)*
- What should happen when he misses an expected time? *(Dan unsure. Test in the prototype.)*

## UX
- ~~What visual references?~~ Ancient stone/glyphs + dark sci-fi; the Stargate dialling sequence (round 6). Refine in Phase 4.
- ~~Phone, desktop?~~ Phone only (round 6).
- **Job to do: a language pass on every line the app says** (Dan, 2026-09-24, D-031). Lines on the Phase 4 mock-ups such as "The lintel needs a word" read as stilted, AI-sounding English. Before the first playable, rewrite the app's own voice so it sounds like a person: plain, natural, varied, not clipped. Not during the visual pass. Owner: Claude, with Dan reviewing a sample page of lines. ~~Suggested slot: Phase 5 or 6.~~ **Moved (Dan, D-046): after he has played the first playable for 3–4 weeks.** He wants to see the app working first. All copy until then is placeholder, and the build keeps it easy to change.

## Technology
- _(deferred to Phase 7)_

## Ethics / privacy
- What personal data is acceptable to store, and where? *(Now concrete: mental-health context and sleep. Design docs should record only what's needed.)*
- The game supports recovery but is not treatment. **His psychologist recommends an activity scheduler.** The product should be compatible with that, and Dan may share it with them.
- What should any AI component be allowed to see?
