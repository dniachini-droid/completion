# Principles bundle for outside review

_Compiled 2026-09-24 from the project repo. Spoiler-free._

> **Snapshot as sent for review.** The review was reconciled in D-038; the source docs are now authoritative and differ from this copy in places.

## Context for the reviewer
This is a single-player phone game for one player, Dan. Its main input is meaningful progress in his real life: gym, a course, Spanish, admin, housework. Real effort moves an expedition through a sealed, ancient place, where he learns a script sign by sign and pieces together a mystery. It is meant to be a real game, not a productivity app with an RPG skin. Dan has ADHD traits: starting is the hard part, and shame or backlogs make him quit.

Terms: a **job** is a real-life task; a **delve** is a focus timer (25–60 min), run in sets with 5-minute **breathers**; **day complete** is reached after about 3 main jobs (2 on a low day); **Low / Normal / High** is the day's capacity; **Keys** are earned by weekly targets; **words** are powers learned from the script; **the satchel** holds lists; **the daybook** is the weekly journal. Direction **D** is the chosen visual look: a full-screen violet painted world with a crisp interface on top, turning gold as the day completes.

The first two sections below are agreed. The last three are drafts awaiting Dan's approval at the end of Phase 4 (experience and art). There is no code yet; the next phases are concept synthesis, then a small first playable.

## What to review
1. Contradictions between the principles, or between a principle and the UX, interaction and design rules.
2. Gaps: situations a principle doesn't cover, especially low days, interruptions, absences, and hyperfocus.
3. Anything that could feel like guilt, pressure, a backlog or productivity admin to a player with ADHD traits.
4. Anything that makes progress too easy or farmable, or makes real effort feel unrewarded.
5. Rules that are vague, untestable or unnecessary ("earn complexity").

Please give a short verdict, then numbered issues, each with severity (blocker / should fix / nit), the rule it concerns, and a concrete fix.

---

## Game design principles (Phase 1, agreed)

> The product's rules, taken from discovery (`PLAYER_MODEL.md`, `DISCOVERY.md` → Phase 1). Every later mechanic must fit these. If it breaks one, change the principle deliberately, with an entry in `DECISIONS.md`. Do not work around it quietly.
> Game mechanics (XP, HP/MP, quests, abilities) belong to Phase 2. These principles say what those mechanics must achieve, not what they are.

_Status: **approved by Dan** 2026-09-23 (D-007)._

### The problem

> Dan usually knows what would make a day good, but starting depends on mood and energy, and on low days the couch and phone win. The product's job is to get him **started** on meaningful things at a size that fits the day, and to let a day count as **enough**, without guilt or admin.

Agreed by Dan (round 1). The main competitor is YouTube on the sofa, not other apps.

### Principles

**1. Starting beats planning.**
The app's first job is to get Dan started. Opening it shows one obvious next thing. "I can't start" is always one tap away.

**2. "Enough" is defined, and it's small.**
- **Normal day:** about **3 main jobs**.
- **Low day:** **getting outside plus a real meal** is a complete day.

Anything beyond that is a bonus, never a debt.

**Low floor, high ceiling** (added 2026-09-23, D-011). The small "enough" is the *floor*, not the design target. On high-capacity days the game must be able to make Dan **very** productive: more jobs, bigger pushes, richer rewards, with no cap that makes extra real effort pointless. The app is built for Dan at full strength as much as for Dan on a low day.

**3. Low days can fully succeed.**
Capacity is Low, Normal or High.
- It is **pre-set from last night's bedtime**, and Dan can change it with one tap.
- It changes **how many and how big** the day's jobs are. It never changes whether the day can succeed.

**4. Story pulls, a tiny step pushes.**
"I can't start" gives **a story reveal first, then one tiny physical step** (e.g. "put your gym shoes on"). Afterwards it *offers* to continue and never demands. Steps are concrete and real, with no cheerleading, so they don't feel patronising.

**5. Aim the help at what's avoided.**
Suggestions lean towards what Dan puts off: admin, Spanish, housework, and one-off jobs with a real cost (the cat's medication). The Claude Code course is absorbing, so it needs less pushing. **One hour of course work counts as done.** More is a bonus, so the course can't crowd out the avoided jobs.

**6. Weekly rhythm, not streaks.**
Recurring targets are weekly, and Dan set them himself:
- Gym 4× (sauna after)
- Spanish: 1 lesson + 1 hour of study
- Cooking 2–3×
- Meal prep on Sunday
- Course: 1 h/day baseline

Each week starts fresh. Misses never carry over.

*Clarified 2026-09-24 (D-030):* **these are Dan's current targets, not built into the app.** Dan can add, change, rename or remove any recurring target, and any kind of job, at any time. Every job name anywhere in the docs or mock-ups (gym, Spanish, the course, the cat's medication) is an example.

*Amended 2026-09-23 (D-020):* **a non-punitive trail** is allowed alongside the weekly rhythm: each day complete adds a marker, relics come from markers in total, and after a gap the trail branches rather than restarting, so nothing ever visibly breaks (`game/TOOLS.md` §5; revised by D-023). Punitive streaks stay excluded.

**7. Nothing piles up.**
No overdue counts, no red badges, and no list on the opening screen. *Amended 2026-09-23 (D-020):* Dan can keep **lists on request**. Untouched items quietly move to *someday*, with no counts (`game/TOOLS.md` §2). After an absence, the world is still there. Dan sees a short "where you were" and one small, welcoming first step.

**8. Failure is information.**
When something is missed, the job waits, shrinks or changes route, or the app asks what happened. No lost progress, no shame, no guilt language (MASTER_BRIEF §16).

**9. The app suggests, Dan chooses.**
The app proposes the day's main jobs. Dan accepts them or swaps from a short menu. He adds one-off jobs by **typing one line**. The kinds of job and the weekly targets are his to edit (D-030); nothing about them is hard-coded. No estimating, tagging or scoring. The app learns over time; Dan doesn't administer it.

**10. Life happens, and it counts.**
A real unplanned obligation (e.g. an appointment) can be added afterwards as one of the day's main jobs. The rest of the day shrinks to fit.

**11. The day has a shape.**
- A **morning start moment**.
- An **evening close moment** that rewards winding down and records bedtime.

The app rewards **behaviour Dan controls** (winding down, going to bed), never the outcome (hours slept). Daily rhythm things such as breakfast and cooking are *noticed*, but they are not main jobs.

**12. Rest is acknowledged, never scored.**
Hobbies Dan chooses (the reef tank, coding for fun) may appear in the app. Rest can be marked ("rested today") but is never a job, a score or a shortfall.

**13. Real effort outweighs trivial input.**
Bounded focus sessions (Pomodoro-style, a proven unit for Dan) are the currency of meaningful effort. Splitting work into many tiny entries must never earn more than one real session (MASTER_BRIEF §18).

**14. Dark world, kind app.**
The fiction can be as dark as Dan likes. The app's voice *towards Dan* is plain, warm and honest. It is never guilty-making and never sycophantic.

**15. Real life stays larger than the app.**
Sessions in the app are short: in, started, out. The app must never become the thing he does instead. It complements, and does not replace, the activity scheduling his psychologist recommended. It is not treatment.

**16. Every tool is part of the world** (added 2026-09-23, D-020).
Productivity features (timer, lists, scheduling, calendar, the trail, record of progress) are in, but each one must move or reveal something in the game, must never create a pile, a debt or a red number, and must never let an easy thing stand in for the avoided thing (P5; D-023). Planning stays optional: starting beats planning (P1).

### Still to test in use (not settled)

- Whether 3 main jobs is the right number, and whether Low/Normal/High is fine-grained enough.
- Whether notifications help; what should happen at a missed expected time.
- Whether the dark tone lifts or weighs on him on low days.
- Whether bedtime reliably predicts capacity.

---

## Anti-features: what the game must never do (Phase 1, agreed)

> Deliberate exclusions and why. Protects against feature creep. Reviewed in Phase 1 (2026-09-23) against discovery; the principle numbers refer to `DESIGN_PRINCIPLES.md`.

### From the founding brief (reviewed; all kept)

| Excluded | Why | Evidence / principle |
|---|---|---|
| Punitive streak loss | Failure must produce information, not shame. | Dan dislikes punitive streaks; P6, P8 |
| Lost levels, equipment or companions, or destroyed settlements, for missed tasks | Same hard rule. | MASTER_BRIEF §16; P8 |
| Disappointed NPCs, guilt language, hostile motivation | His bad days already involve self-criticism; the app must not add to it. Sycophancy is also excluded. | Player model (bad days); P14 |
| XP for trivial task spam | Farming would make real effort meaningless. | P13 |
| Many or endless currencies | Each currency needs a real purpose, source and sink. | Capabilities beat numbers (player model) |
| Notification spam, daily guilt notifications | A guilt engine. Whether *any* notifications help is untested. | P8; test in use |
| Manual estimating, tagging or scoring of every task | Productivity theatre. | P9 |
| A complex life-management dashboard | The next action must be obvious. | P1 |
| Social features, teams, billing, public profiles, broad onboarding | Built for Dan, not a market. | MASTER_BRIEF §78 |
| Live AI-generated lore without canon control | Breaks continuity and mysteries whose answers are fixed in advance. | CLAUDE.md rules 5–6 |

### Added from Phase 1 discovery

| Excluded | Why | Evidence / principle |
|---|---|---|
| Overdue counters, red badges, a backlog on the opening screen | Pile-up is a stated trigger for avoidance. Lists on request are allowed (D-020). | Round 5; P7 |
| Carry-over of missed weekly targets | Each week starts fresh; debt makes restarting harder. | Round 2 (Q5); P6 |
| A daily quota that makes 1 hour of course work feel like failure | 4 h/day is the ceiling, not the bar; 1 h = done. | Round 2 (Q2); P5 |
| Scoring sleep outcomes (hours slept, sleep quality) | He can't fully control them, and with ADHD and anxiety this risks sleep anxiety. Bedtime and winding down are rewarded instead. | Round 4; P11 |
| Scoring rest, or treating rest as a shortfall | Rest is acknowledged, never measured. | Round 2 (Q1); P12 |
| Cheerleading or baby-talk micro-steps | "I can't start" must never be patronising. | MASTER_BRIEF §10; P4 |
| A mandatory morning check-in | Capacity is pre-set from bedtime; the tap is optional. | Round 1 (Q3); P3, P9 |
| Long lists shown **up front** (on request is fine, D-020) | Lists only work on good days; on low days they read as a field of obligations. | Round 5; P2 |
| Rhythm things (breakfast, cooking) as daily main jobs | They would fill a slot every day and dilute "enough". | Round 2 (Q3); P11 |
| Features that keep Dan in the app longer than needed | The app must not become the new YouTube. | P15 |
| Hour-by-hour time-blocking, required planning | Planning replaces starting. Light, optional plotting only (D-020). | P1 |
| Stats dashboards, charts, percentages | The Chronicle shows evidence of progress without measurement (D-020). | P1, player model |

---

## UX principles (Phase 4, draft)

> Deep system, simple moment-to-moment interaction; the next action always obvious (MASTER_BRIEF §57–58, rule 16, P1).
> **Draft, 2026-09-24**, from the Phase 4 visual run: what held true across the directions and every round of critique (`directions/*/CRITIQUE-*.md`), plus Dan's walkthrough. Direction-independent; the chosen look (D) is in `DESIGN_SYSTEM.md` and `INTERACTION_NOTES.md`. Dan confirms at the end of Phase 4.

### The screen
1. **One primary action per screen**, and it is the most visually loud thing on it. Everything else is quieter by design, not by accident.
2. **The primary action is the one warm (or brightest) thing you can press.** Exits, "later", "done for now" are never styled like the action. (Critics caught warm exits on every direction.)
3. **The next action is readable in two seconds at arm's length.** Anything that matters is at least 16 px; small labels at least 13 px with real contrast against the painting.
4. **Within thumb reach.** Primary actions sit in the lower third; tap targets at least 44 px.
5. **Works on small phones.** Every screen holds at 360 × 780 as well as 390 × 844: flowing layout, never fixed pixel positions for interface.

### The morning screen carries (Dan, via the model test)
- Where you are (day · place) and a way to the map.
- One plain sentence about the sealed thing ahead.
- Low / Normal / High, visible but quiet, marked "from last night's bedtime".
- The one next job, a short teaser under it, Begin and Swap.
- The day's other jobs as plain rows with their state on the right.
- "I can't start", always one tap away.
- After day complete, the morning screen shows the day as done, not a next job.

### Pressure
6. **No numbers that can read as debt**: no counts of undone things, no streak numbers, no progress bars. The delve's glowing ring (D-028) is the only progress shape.
7. **Cairns are shown as a place, never as a row to count.**
8. **Rest is never timed.** The breather ends by itself with a gentle cue; no countdown on rest.
9. **On a low day the screen is calm**: the arrival's main button is resting, not reading more.

### The world
10. **The painting is the place, drawn to the description**: a long high hall rounded like the inside of a shell, cut stone, dark wall-cups, the clay lamp on its ledge. Painted masses and light, not outlined shapes.
11. **Every screen stays in the world**, including the satchel and the daybook: finds and lists live in niches, on stone, in lamplight, never on a generic card.

### Flow
12. **Every screen has an obvious way back to today**, and each screen's exits go somewhere that makes sense in the day (a delve ends in a breather, the last delve of the day leads to the arrival, the arrival leads to camp).
13. **Big moments are cinematic and short** (cutting a word, an arrival): a few seconds, then settle. They are done by you (a tap), not only watched.

### Dan's own rules (from his walkthrough)
15. **Never frame the world.** No scene in a box or window; the painting fills the phone.
16. **Interface precise and aligned**: one grid, truly centred.
17. **Things that you read stay still**: selecting something never moves the rest of the screen (the record strip).
18. **Text on a surface in the scene follows that surface's perspective** (marks on the lintel).

### Copy
14. Mock-up copy is placeholder. **A language pass on every line is a recorded job** (D-031): natural, human, not clipped formula lines.

---

## Interaction notes (Phase 4, draft)

> How the chosen look (direction D, D-032) moves and responds. Mock-up behaviour in `directions/d-combined/`; spoiler-free. **Draft for Dan's approval**, 2026-09-24.

### Motion principle
**Smooth and quiet every day; cinematic at the big moments only** (taste session, 8B + 8C).
- Everyday: taps answer at once with a short light swell; screens ease in (≈ 200–300 ms, ease-out); the lamp breathes; fog drifts.
- Big moments (cutting a word, an arrival): a few seconds of orchestrated motion, then everything settles and the main button is there. The main button never takes longer than ≈ 2.5 s to appear.
- `prefers-reduced-motion`: every animation jumps to its settled state.

### The morning
Starting needs no decision: **Begin** on a short job starts a single 25-minute delve at once; a job that takes hours (the Course) opens the run screen already set from the job (e.g. 2 delves of 25), so it is one more tap on Begin. Swap and "I can't start" are one tap away. After day complete, morning shows the day as done ("To camp"), not a next job.

### Setting the delve's length (D-033, Dan's pick: the dial)
- A ring with four stops: **25, 30, 45, 60 minutes**. Drag the glowing handle round, tap a number, or use the keys.
- The ring fills in proportion to the time (30 = half, 60 = full) with violet light; the number ticks up; each stop gives a small visual tick and a gentle settle on release (phone vibration is unreliable on the web, so the visual tick carries the feel).
- Underneath, **the run (D-037)**: one route line. Each delve adds a segment in proportion to its minutes (set the count with − / + or by tapping along the line); the next named place sits at its real distance and lights when the run reaches it; four or more show a side chamber; one plain line gives the finish time. No debt numbers. During the run, the next delve starts by itself when a breather ends.
- The breather stays 5 minutes. B (the hall slider) and C (the flame) are kept in `delve-set-variants.html` for comparison.

### The delve
The glowing ring fills with the time left in the middle (D-028); the destination is the headline ("Towards the Salt Gallery"); the tunnel and fog move so the world is visibly travelling. The phone can go away; the end must be heard or felt (Phase 7). **In flow:** "Keep going" at the end; during the breather, "Next delve" starts the next one at once (that is how the breather is skipped), without loss. **Only two ideas, always in the same words:** "Step away" (hold it, I'll be back) and "Finish here" (I'm done, count what I did). Every delve state has at most one main button and one quiet "Finish here"; the Today link at the top is the way back. **Interrupted (D-036):** a quiet "Step away" keeps the minutes, holds the delve and starts the breather, whose main button becomes "Back to the delve · N min left". If he's gone longer, the morning screen's first offer is "Carry on: <job> · N min left". Dan can go anywhere in the app meanwhile; the hold belongs to the job. Beside it, **"Finish here"** ends the delve with every minute counted; a done-or-not job then asks "Is it done?" (Done / Not yet). Never shown as falling short.

### The map
Routes draw themselves in, then settle to dust. Tap a place: a crosshair closes on it and its description rises in a box underneath. Places you've walked are warm-lit; places seen but not reached are dim; the unknown is dark.

### Reading a record
The line of marks sits in a clean band on the stone and **never moves**. Tap a mark: corner ticks close round it; below, a fixed area says what you know of it. An unknown mark offers a few guesses as boxes; choosing one writes it under the mark with a question mark. Re-reading (later): a minimal before → now.

### Cutting a word (cinematic)
The interface fades away. You tap the marks in order; each is cut into the lintel **on the stone's own plane, in perspective**, with light filling the grooves; the word locks in its floating box; the stone sinks; the wall-cups wake one by one down the hall and the view moves towards the opening. The interface returns with "Go through".

### Day complete (cinematic)
Violet turns to gold from the floor up; "That's the day. Enough." The main action is resting ("Rest here for today"); reading is quiet and secondary.

### Sound (later; Claude's recommendation, Dan deferred)
Room tone and small material sounds (stone, flame, the cut of a mark) everyday; music at arrivals and reveals.

---

## Design system (Phase 4, draft)

> The look chosen in Phase 4: **direction D, the combined look** (D-032), built from Dan's screen-by-screen picks. Source of truth for values: `directions/d-combined/direction.css`; this page explains them. Spoiler-free.
> Status: **draft for Dan's approval**, 2026-09-24. Mock-up values, not final code (no tech stack until Phase 7).

### The rule in one line
The world is a full-screen painting in violet light; a crisp, precise interface sits on top of it; the day turns from violet to gold.

### World
- **Always full-bleed.** Every screen is a painted scene edge to edge. **Never a scene inside a box or window** (Dan, four times).
- **Painted, not drawn:** lit masses, texture, haze and depth, one light source per scene, one vanishing point. No outlined objects. Strokes belong to the interface only.
- **The Lamp Hall is one painting** (`hall.js`), reused behind morning, word-cutting, camp and the stair, framed by camera position.
- **Nebula fog** drifts slowly on most screens; faster in the delve.
- **The clay lamp is always lit** and is the one warm thing present from the first minute.

### Colour
| Role | Token | Value | Used for |
|---|---|---|---|
| Night | `--night`, `--stone-0…3` | #05050c → #2b2e56 | the dark and the stone |
| Violet (the working day) | `--violet`, `--violet-hi`, `--cold` | #8f86ff, #d9d6ff, #8fa8ff | light in the place, fog, **the main button**, selection |
| Light edges | `--edge…--edge-4` | violet-white at 62% → 10% | boxes, rules, hairlines |
| Gold (the day turned) | `--gold`, `--gold-hi`, `--amber` | #f2c170, #ffe6b8, #e8954a | the arrival, camp, the main button once the day is done |
| Flame | `--flame` | #ffc766 | the clay lamp only |
| Ink | `--ink`, `--ink-2`, `--ink-3` | #f2f3fb, #c7c9e6, #a3a6cc | text; the smallest labels still ≥ 4.5:1 |

**What colour means:** violet is the place and the work in progress. Gold arrives as the day completes: a trace in the morning, the floor at the arrival, the hall at camp. Gold is never used for exits or secondary actions. **No red anywhere.**

### Type
| Role | Face | Where |
|---|---|---|
| The stone speaks | **Cinzel** (carved capitals), letter-spaced | place names, labels ("NEXT ——"), buttons |
| Your own life | **Spectral** (plain print), sentence case | sentences, jobs, times, the daybook |
Sizes: anything that matters ≥ 16 px; carved labels ≥ 14 px. Fonts are open-licence and vendored (`fonts/`).

### Layout
- **One centred column**, 24 px gutter (20 px on small phones), 8 px rhythm. Everything aligns to it; rows of links span edge to edge with equal gaps.
- **Holds at 360 × 780** as well as 390 × 844. The main action sits in the lower third, within thumb reach.
- Content (text, records, marks) sits **in the open** on the scene, washed by soft scrims, not in panels.

### Components
| Piece | What it is |
|---|---|
| **Main button** (`.btn`) | A crisp box of violet light with a fine bright edge and corner brackets; a slow breath. Gold once the day has turned. One per screen. |
| **Quiet button** (`.btn-quiet`) | The same box, unlit. For Swap, Change, secondary choices. |
| **Label with line** (`.label-line`) | "NEXT ——", "AHEAD ——", "THIS MARK ——": carved capitals and a hairline. |
| **Selectable boxes** (`.seg`) | Low / Normal / High, guess choices. The chosen one lights. |
| **Line icon + word** (`.icon-link`) | Map, Satchel, Daybook, Camp. |
| **Boxed panel** (`.box` + `.ticks`) | Only where Dan asked: the map's description, the cut's word. |
| **Job rows** (`.row`, `.pip`) | The day's jobs on hairlines; state on the right ("done this morning", "two delves"). |
| **The ring** | The delve timer (D-028) and the length dial (D-033); the only progress shape in the app. |

### Never
Red; counts of undone things; badges; streak numbers; progress bars; a scene in a frame; outlined illustration; exits styled like the main action; fantasy-speak in the app's own voice (copy is placeholder until the language pass, D-031).
