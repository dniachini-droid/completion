# Proposal: the week planner (a scheduler inside the game)

> Written 2026-09-24 at Dan's request, for Dan and an outside review (ChatGPT) before anything is decided. Spoiler-free.
> **Superseded:** reviewed and reconciled (`product/SCHEDULER_REVIEW.md`, D-045). The current rules are in `game/PLANNER.md`. Kept as the version that was reviewed.
> **Reviewer:** the context section below is all you need. Please say plainly what is weak, what conflicts with the principles quoted, and what you would cut. Questions for you are at the end.

---

## Context for the reviewer

**The product.** A single-player game on Dan's phone, in which real-life action is the only way to make progress. Each real job (the gym, Spanish, an AI course, housework) moves him further into a sealed underground place, where he decodes an ancient script and uncovers a long story. It is a real game, not a to-do app with a skin. It is also, in effect, the **activity scheduler his psychologist recommended**, in game form.

**Dan.** He has ADHD. His problem is **starting**, not knowing what to do. On low days the couch and YouTube win. Piles of undone things make him avoid everything. He dislikes punitive streaks and doesn't want to administer a system. Scheduled things (a weekly Spanish lesson) have worked for him before.

**How a day works today (agreed design).**
- **Capacity** (Low / Normal / High) is suggested each morning from last night's bedtime. It sets the size of the day: about 3 main jobs on a Normal day, 2 on a Low day, up to 5 on a High day.
- **The morning screen** shows only today's jobs, with **one next job** leading, plus Begin, Swap and "I can't start". It never shows a backlog, counts or leftover weekly targets.
- **Day complete** (the day's jobs done) locks the day in as "enough". More work always counts and is never capped.
- Work is done as **delves**: 25-minute focus timers, run in a series. **25 minutes of real work = one step** further into the place.
- **Weekly targets** are Dan's own (currently: gym 4×, a Spanish lesson + 1 hour of study, cooking 2–3×, Sunday meal prep, 1 hour of the course a day). Each target met earns a **Key**, which opens a sealed door he can already see. Weeks start fresh: nothing carries over, and there's no catch-up pile.
- **The satchel** holds typed lists, on request only.

**The principles this must not break** (quoted from the agreed principles):
- **P1 Starting beats planning.** "Opening it shows one obvious next thing." Planning stays optional.
- **P5 Aim at what's avoided.** "One hour of course work counts as done… so the course can't crowd out the avoided jobs."
- **P6 Weekly rhythm, not streaks.** "Each week starts fresh. Misses never carry over… nor do they pile into the rest of the same week."
- **P7 Nothing piles up.** "No overdue counts, no red badges, no backlog on the opening screen."
- **P8 Failure is information.** "No lost progress, no shame, no guilt language."
- **P9 The app suggests, Dan chooses.** "No estimating, tagging or scoring… Dan doesn't administer it."
- **P16 Every tool is part of the world.** A tool must move or reveal something in the game, never create a pile or a red number, and **"using a tool on its own (adding, sorting, planning…) earns nothing."**
- **Anti-features:** no hour-by-hour time-blocking, no required planning, no stats or percentages, no guilt notifications.

**What was already agreed about planning** (Sept 2026). Dan asked for "a scheduler" when the productivity tools were designed. A light version was agreed and then **deferred until after the first playable**. In that version, Dan could put a job on a day or a time, where it showed as a **waypoint** on the map. Only the next 7 days showed, and a passed time went quietly back, with no "missed". The tools research rated it the **best-evidenced tool in the design**: planning *when and where* ("implementation intentions") is one of the most reliable effects in behaviour science, and it is what activity scheduling is.

## What Dan asked for (2026-09-24, his words, lightly trimmed)

> "What I think is missing is a scheduler… I can plan my week, whenever I want, almost like a calendar. For example, I want to go to the gym at least four times a week. I want at least one Spanish lesson a week, or to study Spanish two or three times a week for an hour. Or I want to do my AI course for at least three hours a day, four days a week. And other things will come up that I want to schedule, like cleaning my tank: that takes about an hour, and I want to do it once a fortnight… rather than just every day, 'what am I doing today?'… I don't want it to be an afterthought. I want it to be an integrated part of the app."

Two things in that are new to the design:
1. **Richer repeating jobs**: counts per week *and* a length each time, several days a week at a set amount, fortnightly (and so presumably monthly) jobs, and ranges ("two or three times").
2. **A week view that Dan can plan in whenever he likes**, which then drives what "today" is.

---

## The proposal

> **Dan's clarification (2026-09-24, after this went for review):** nothing in the planner is fixed. Every rhythm is Dan's own input: **what it is, how long each time takes, how many times a week (or fortnight)**. Any rhythm can be added, edited or deleted at any time. The examples below are only his current starting set, loaded in the first version so day one needs no setup. From each rhythm's length and count, the planner **schedules the week's delves automatically** (e.g. Spanish study 2× at 1 h → two 1-hour runs placed on two days), and Dan adjusts if he wants. This matches the agreed rule that jobs and targets are Dan's to edit and nothing is hard-coded (D-030, D-041); the reconciliation keeps it.

### 1. Rhythms: one kind of repeating job
Weekly targets grow into **rhythms**. A rhythm is a repeating job with:
- **how often:** a number of times per week, per fortnight or per month, or a set amount on a number of days a week;
- **how much each time** (optional): a length, which is also what the timer and the steps use;
- **at least:** the lower number of a range is the target; anything above it is a bonus, never expected.

Dan's examples as rhythms:

| Rhythm | How often | Each time | Target (earns the Key) |
|---|---|---|---|
| Gym (sauna after) | 4× a week | ~1 h | 4 |
| Spanish lesson | 1× a week | 1 h, often at a fixed time | 1 |
| Spanish study | 2–3× a week | 1 h | 2 (the 3rd is a bonus) |
| AI course | 4 days a week | 3 h | 12 hours in the week (see below) |
| Tank clean | every 2 weeks | 1 h | 1 per fortnight |
| Meal prep | Sundays | — | 1 |

- **A rhythm met in its period earns a Key.** A weekly one earns one a week; a fortnightly one earns one a fortnight. How many Keys the story can absorb is set with the game's numbers.
- **Nothing carries over**, at any length of period. A missed fortnightly job is simply due in the next fortnight, with no overdue marker.
- **Editing** follows the agreed rules: only on request, only a name required, sensible defaults, and a change to a rhythm's target applies from the next period (so it can't be lowered mid-week to collect a Key).

**The course needs care.** "3 hours on 4 days" counted strictly by day means a 2 h 50 day "doesn't count", which is the brittle, all-or-nothing feel the design avoids elsewhere. It would also raise the day's bar far above P5's "one hour counts as done". Proposed:
- **The course's day job is done at 1 hour, as now.** Day complete stays reachable, and the course can't crowd out avoided jobs (P5 unchanged).
- **The rhythm counts the week's total** (12 hours). Planning shows it as 4 blocks of 3 hours. Every minute beyond the first hour still moves Dan and counts towards the 12.

### 2. The week: a planner Dan opens when he wants
- **On request only.** A quiet "This week" from Today and from the map. It is never the opening screen, never prompted and never required. If Dan never plans, the app works exactly as now: each morning it suggests the day.
- **What it shows:** this week and next, one row per day. Each day lists its planned jobs, an optional time ("18:00 Spanish lesson"), and fixed appointments if the calendar is linked. **No hour grid** (time-blocking is an anti-feature).
- **Placing things:** each rhythm's remaining times this week wait in a small tray as tokens (four gym stones, two Spanish-study stones). Dan drags them onto days. One-offs from the satchel (like "renew passport") can be dragged in too. The tray shows **tokens, never numbers**, lives only in the planner, and empties at the end of the week without a trace.
- **"Plan it for me"** (one tap): the app lays the week's rhythms across the days, avoiding appointments, spreading the gym, keeping one day light, and learning from how Dan moves things. He adjusts by dragging, or accepts it as it is. This is what keeps planning from becoming admin.
- **Changing the plan is free and silent.** No confirmations, no "are you sure", no history of changes.
- **The past shows only what was done.** A planned job that didn't happen leaves no trace on the past day. Its token quietly returns to the tray if the week still has room, and otherwise disappears. This follows the rule already agreed for the trail: show only what was placed, never the gaps.
- **Sunday offer (optional).** The week closes itself on Sunday night with an automatic journal page. That page can end with one quiet offer: "Plan next week? / Plan it for me / Not now". It is never repeated that week, never sent as a notification, and never needed.

### 3. How the week drives Today
- **Today's jobs come from today's plan first**, in order (a job with a time leads as that time nears). Then the suggestion tops the day up to its capacity, as now.
- **Capacity still decides the size of the day.** If Dan planned four jobs and wakes on a Low day, Today shows a Low day. The other planned jobs go back to the tray, and the app may re-place them. **It never pushes a later day above its size** (the agreed "no catch-up avalanche"). If the week has no room, they drop off.
- **Swap, "I can't start", the one next job, and "only today's jobs on the opening screen" are unchanged.**

### 4. How it lives in the world (P16)
- **Planned jobs are waypoints on the route ahead** on the map. Dan can see where the planned week will take him ("by Friday, the stair"). That view of the destination is planning's only reward: **planning itself earns nothing.**
- **No extra reward for keeping the plan.** The earlier draft left a landmark when Dan reached a waypoint he had plotted. The research flagged that this rewards *keeping the plan*, so a plan that passes leaves a visible absence. Proposed: drop it. Doing the job earns what it always earns, planned or not.
- The planner's look belongs to the game's existing style: the route ahead as a line through the place, with days as stretches of it. It is not a generic calendar grid. Shown as mock-ups before it's agreed.

### 5. The calendar link
Reading Dan's Google Calendar is easy (a private address he pastes once). Appointments then appear in the planner as fixed items and on Today as jobs, and "Plan it for me" plans around them. Writing back to Google is a moderate job, and stays later. Proposed: **read-only in the first playable**, if the technical phase confirms it is as simple as the research says.

---

## The risks, honestly

| Risk | Why it's real for Dan | Guard |
|---|---|---|
| **Planning replaces starting** | A beautiful planner is the most satisfying way to feel productive without doing anything | Planning earns nothing; "Plan it for me" makes it one tap; the opening screen never needs a plan |
| **Plans become promises, then visible failures** | Unmet plans are a pile with dates on | The past shows only what was done; unmet plans vanish quietly; no "% of plan" anywhere |
| **Over-planning on a good Sunday** | A heavy plan for a week he won't feel like on Tuesday | Capacity still sizes each day; "Plan it for me" never plans a day above Normal size; Dan may, but Today still shrinks to fit |
| **The tray reads as a to-do count** | "3 gym left" on a Thursday is a debt | Tokens not numbers; only inside the planner; gone at the week's end |
| **Raised bars** (3 h of course a day) | A higher target makes a normal day feel short | The day's job stays at 1 hour; the rhythm counts the week's total |
| **More rhythms → more Keys → the story runs faster** | Keys open sealed things; the story is paced | The core story's order is fixed; extra Keys open side content; the game's numbers set the supply |
| **Build size** | Drag and drop, repeat rules, auto-planning and a calendar feed are real work | A thin first version (below) |

## A thin first version (for the first playable)
**In:** rhythms (weekly, fortnightly, several-days-a-week, ranges), the week view (this week and next) with the tray and drag, "Plan it for me" (simple rules, learning later), optional times, Today reading from the plan, waypoints on the map, the Sunday offer.
**Later:** monthly rhythms, writing to Google Calendar, planning more than two weeks ahead, smarter learning in "Plan it for me".

---

## When to do it (Claude's advice to Dan)

**Don't stop Phase 5, and don't start a separate research phase.** This isn't a new concept. It's a tool Dan already asked for and agreed, deferred at the time, now made central. The research on it already exists and is favourable. But **do it now, inside Phase 5, before the numbers**, because it changes three things Phase 5 is about to set:
1. **Weekly targets become rhythms**, which changes how Keys are earned and so the story's reward rhythm (step 3).
2. **Today starts from a plan**, which changes the morning suggestion.
3. **It moves from "later" to "in the first playable"** (step 4).

Proposed order:
1. ChatGPT reviews this file.
2. A short reconciliation session: Claude checks the review against the agreed docs (as with the principles review), and Dan agrees the result. It is recorded as a decision, and the Phase 5 plan gains this as a step.
3. **Mock-ups of the planner in the game's look** (about three screens: the week, the week after "Plan it for me", and Today reading from it), so Dan can judge whether it feels integrated. This is a new screen in the agreed look, not a change to it.
4. Then Phase 5 carries on: the numbers (step 3) and the first playable's contents (step 4).

Cost: about two extra sessions. Benefit: the scheduler is designed in with everything else, not bolted on after the first playable.

---

## Questions

**For the reviewer:**
1. Does this break any principle quoted above? Where exactly?
2. Is the tray (tokens still to place this week) a debt display in disguise? Is there a better shape?
3. Is dropping the reward for keeping a plan right, given the implementation-intentions evidence?
4. Is "the past shows only what was done" honest enough, or does it hide useful information from Dan?
5. What would you cut from the thin first version?
6. Anything from ADHD-focused planners (Tiimo, Structured, Sunsama, Routinery…) that is worth taking, or that is a known trap?

**For Dan (taste and priorities, after the review):**
1. This week and next, or a rolling 7 days?
2. The course: counted as 12 hours a week (proposed), or strictly 3 hours on 4 days?
3. "Plan it for me": the main way to plan, with dragging for changes (proposed), or do you want to place everything yourself?
4. The Sunday "Plan next week?" offer: wanted, or should planning never be offered at all?
