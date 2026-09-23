# Phase 4 — Experience and art: the plan

> Work order for Phase 4 (MASTER_BRIEF §57–58, D-022). Spoiler-free: Dan may read this.
> Before starting, read: `CLAUDE.md` → `docs/CURRENT_STATE.md` → `docs/MASTER_BRIEF.md` §57–58 → `docs/PLAYER_MODEL.md` (visual notes) → `docs/DESIGN_PRINCIPLES.md` → `docs/narrative/GAME_BIBLE.md` → `docs/narrative/TERMINOLOGY.md` → `docs/game/CORE_LOOPS.md` → `docs/game/TOOLS.md`.

## What we already know about Dan's taste (PLAYER_MODEL)
- He likes both **ancient stone and glowing glyphs** and **sleek dark sci-fi screens**: "pick one or combine". *Ancient technology that looks like magic.*
- He wants beauty, and apps that are **intentionally designed**. Not Habitica, not Jira with swords, not generic AI fantasy, not mobile-game clutter.
- Rule 16 and P1: on opening, the next action is obvious. Deep system, simple moment.

## Part 1 — The taste session (live with Dan, 20–30 minutes)

Quick reactions, not essays. For each prompt Dan says "yes / no / more like this / less like this" and, if he wants, one reason. Claude records the answers in `design/ART_DIRECTION.md` → "Dan's taste".

1. **Games he finds beautiful.** Warm-ups first: *Journey*, *Outer Wilds*, *Hollow Knight*, *Tunic*, *Heaven's Vault*, *Chants of Sennaar*, *Return of the Obra Dinn*, *Monument Valley*, *Disco Elysium*, *Destiny*'s menus, *Mass Effect*'s galaxy map. Which ones would he like to be *in*? Then any he'd add.
2. **Film and TV.** *Arrival* (the heptapod writing, the grey light), *Dune* (Villeneuve: scale, stone, restraint), *Prometheus* (the engineers' halls), *Annihilation*, *Stargate*, *Andor*. Which rooms feel like the Quiet?
3. **Architecture and places.** Petra, Göbekli Tepe, Brutalist concrete, cathedral crypts, salt mines (Wieliczka), cisterns (Istanbul), Tadao Ando's light-and-concrete. Warm stone or cold stone?
4. **Light.** One warm lamp in the dark, *or* cold glowing lines, *or* both (warm for the human, cold for the place)?
5. **Line and texture.** Hand-drawn ink and paper (an explorer's notebook), *or* crisp flat vector, *or* painted and atmospheric, *or* 3D and lit?
6. **Type.** A carved serif, a clean geometric sans, a typewriter or field-notebook hand, or a mix?
7. **The map.** A surveyor's section drawing (the place cut open from the side), a top-down plan, a painted scene you look *into*, or a single path you walk down?
8. **Motion.** Almost still (dust, a flicker), *or* smooth and responsive like a good phone app, *or* rich and cinematic moments at big reveals only?
9. **Screens he loves** on his own phone (any app, not only games), and the ones he finds ugly or cluttered.
10. **Sound** (just a first reaction; audio is later): silence and room tone, or music?

## Part 2 — The long visual run (unattended, about 6–8 hours; D-022)

Set up like the Phase 3 overnight run: a keep-alive Routine, a minimum run time, commits after every stage, work on its own branch.

1. **Three genuinely distinct directions** (not colour swaps), each covering mood, materiality, typography, world presentation, UI philosophy, map style, collection style, animation, and how records are shown (MASTER_BRIEF §57). Written into `design/ART_DIRECTION.md`, grounded in Dan's taste answers.
2. **Each direction as real, viewable screens** (static HTML is fine; this is not app code, and no tech stack is chosen): the morning screen, a delve running, the map, reading a record with marks and guesses, cutting a word, day complete, camp, the satchel, the daybook page.
3. **Critique and revision rounds.** Each direction gets at least two rounds of harsh critique (by fresh reviewers) against: the next action is obvious (rule 16), it's beautiful and intentional, no clutter, readable on a phone at arm's length, and it works on a low day.
4. **Spoiler rule.** Screens use only player-safe content: the game bible, terminology, the first region's locations. The run may read `narrative/sealed/` only to avoid visual choices that contradict the truth. It never shows sealed content on a screen, in a commit message, or in an open doc (D-015).
5. **Morning handover.** A short briefing in `CURRENT_STATE.md`: one line per direction, links to its screens, Claude's pick and why, and three to five questions for Dan.

## Exit criteria for Phase 4
- [ ] Taste session done; answers in `design/ART_DIRECTION.md`.
- [ ] Three directions with real screens, critiqued and revised.
- [ ] Dan picks or blends one.
- [ ] `design/UX_PRINCIPLES.md`, `design/DESIGN_SYSTEM.md` and `design/INTERACTION_NOTES.md` filled in for the chosen direction, enough for Phase 5.
- [ ] Dan agrees to move to Phase 5 (Concept synthesis).
