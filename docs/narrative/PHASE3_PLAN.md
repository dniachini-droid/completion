# Phase 3 — Overnight story run: the brief

> The work order for the first long, unattended Phase 3 session (D-008, D-015). Spoiler-free: Dan may read this.
> Before starting, read: `CLAUDE.md` → `docs/CURRENT_STATE.md` → `docs/MASTER_BRIEF.md` (esp. §51–56) → `docs/DECISIONS.md` → `docs/PLAYER_MODEL.md` → `docs/DESIGN_PRINCIPLES.md` → `docs/game/GAME_DESIGN.md` → `docs/game/CORE_LOOPS.md` Part 4 → `docs/game/PROGRESSION.md` → `docs/narrative/NARRATIVE_RULES.md`.

## What Dan asked for (2026-09-23)
- **A long run, about 8 hours, while he sleeps.** No one will answer questions. Where a choice genuinely needs Dan's taste, make a reasoned provisional choice, record it, and list it as a morning question. Don't stall.
- **The answers stay secret.** Dan is the only player. Everything that reveals the truth goes in `docs/narrative/sealed/`; nothing from it appears in chat, commit messages, PR text or open docs (D-015, NARRATIVE_RULES 9).
- **Three pitches, one developed fully.** Write three short, genuinely different pitches, pick the strongest yourself, and develop *that one* fully. The other two stay short (well under an hour together). If Dan prefers another in the morning, a later session develops it.
- **"I don't want the story to just be going nowhere. It needs to be unique and connected and have flow."** This is the quality bar (NARRATIVE_RULES 10): the ending is fixed first, every thread connects to the centre, every reveal builds towards the ending and changes what came before, and nothing is generic.

## The shape the story must fit (Phase 2, agreed)
*Explore · Decode · Connect* (D-010): real action moves Dan through a sealed place (the Site). Its records are written in a script he learns sign by sign. Signs combine into **words** that are powers. The records are the **linked lives of people from different ages**, converging on one mystery. Sealed things need a **Key** (earned by real life), a **word** (knowledge) or both (D-013). The first word arrives in **week 2–3**. High-day deep pushes can give **partial signs**. About 250 arrivals a year, around half carrying a record fragment, and up to ~250 Key-sealed things. Each visit is under a minute, so record fragments are short. The fiction can be very dark; the app's voice to Dan is always kind (P14). No life ever "waits on" Dan or suffers for his absence.

What Dan loves (PLAYER_MODEL): Eternal Darkness (linked lives across eras, runes, dread), *The Three-Body Problem* (vast timescales, alien intelligence), *Arrival* (language as power, non-linear understanding), Ocarina of Time ("everything was related"; Ganondorf, a powerful antagonist with depth), Mass Effect and Star Wars (alien civilisations, futuristic powers), Stargate (ancient technology that looks like magic). "The darker the better." He knows roughly what's coming but the details surprise. He stops when the story ends, so the story is the retention engine.

## Stages (rough time budget, about 8 h)

**0. Orient (~15 min).** Read the files above.

**1. Research (~1.5–2 h) → `docs/narrative/RESEARCH.md` (open).**
What makes long-form mysteries and revelation structures work, and why some go nowhere. For example:
- promise, progress and payoff; fair-play clueing; planting and payoff; stories planned to an ending vs improvised ones, and how each turned out;
- games built on decipherment and knowledge (e.g. *Heaven's Vault*, *Chants of Sennaar*, *Outer Wilds*, *Return of the Obra Dinn*, *Tunic*);
- the works Dan loves: what exactly makes each one hit.

End with concrete lessons for *this* game. Warning: Dan may not have played or watched some reference works. Keep plot spoilers for other works to what's needed, and mark them clearly.
Subagents may be used for parallel research.

**2. Three pitches, then choose (~45 min) → `docs/narrative/PITCHES.md` (open).**
Each pitch covers:
- a back-of-the-box paragraph;
- the fantasy, tone and setting;
- the flavour of the script and powers;
- what the linked lives feel like;
- why it fits Dan, and its main risk.

The three must differ in substance, not only in skin. Then pick one, give the reasons, and record it as a provisional decision in `DECISIONS.md` (Dan confirms in the morning). Nothing in `PITCHES.md` may give away the chosen story's answers.

**3. Develop the chosen story fully (~4–5 h) → `docs/narrative/sealed/`.**
Follow the MASTER_BRIEF order: thematic core → world rules → central fantasy → cosmology → history → **the hidden truth** → factions → key events → characters (above all the antagonist, with depth) → central mystery → secondary mysteries → revelation architecture.
- **The ending is fixed first.** The revelation map runs to the end: arc level for 12+ months, beat level for the first ~3 months.
- **The script system.** Sign inventory and how signs combine; the first word by week 2–3 and what it opens; partial signs; how re-reading changes old records.
- **The linked lives.** Who they are, in which ages, and how they connect. The two lives the first playable uses get full detail.
- **The first playable's region.** Every clue it plants goes in `sealed/CLUE_LEDGER.md` with its truth (rule 6).
- Use the existing sealed files (`WORLD_TRUTH`, `MYSTERIES`, `CLUE_LEDGER`, `REVELATION_MAP`, `TIMELINE`, `CHARACTERS`, `FACTIONS`, `PLAYER_KNOWLEDGE`) and add others inside `sealed/` if needed.
- Scope stays D-004: no full chapters of prose. Write a few **sample record fragments** in `sealed/` to prove the voice.

**4. Adversarial self-review (~45 min).**
Critique the work as a harsh editor would, then revise.
- **Does it go somewhere?** Does every thread connect?
- **Is it unique?** List the clichés you avoided and any that remain.
- **Does it flow?** Is each arc a turn?
- **Does it fit the game?** Check the content rate, Keys and words, the one-minute visits, and that nothing is guilt-making.
- **Is it consistent?** No contradictions anywhere in `sealed/`.
Record the critique and the fixes in `sealed/REVIEW.md`.

**5. Morning handover (~30 min), spoiler-free.**
- Update `docs/narrative/GAME_BIBLE.md` with the chosen world's *player-safe* overview.
- Record decisions in `DECISIONS.md` with neutral wording.
- Update `docs/CURRENT_STATE.md` with a short **Morning briefing for Dan**:
  - the three pitches in one line each;
  - which one was chosen and why;
  - what now exists, in neutral terms ("the full hidden truth, the ending, a 12-month revelation map");
  - up to 5 spoiler-free questions that need his taste;
  - "want a different pitch instead?"

## Working rules for the run
- **Commit and push after every stage** to the session's own branch. Never push to `main`. Commit messages stay spoiler-free (`narrative: draft sealed world truth`).
- No code, no tech stack, no art direction (Phase 4), no product name. Visual notes only as flavour.
- **Keep going.** If you are about to end a turn before stage 5 is done, first schedule a check-in to yourself with `send_later` (about 30–60 min) that says to continue this plan. A backup hourly Routine named **"Phase 3 overnight keep-alive"** also wakes the session. When stage 5 is done, find that Routine with `list_triggers` and delete it, and cancel any pending check-ins.
- If something blocks you (a tool is missing, a decision can't be made provisionally), record it in `CURRENT_STATE.md` and carry on with whatever is not blocked.
