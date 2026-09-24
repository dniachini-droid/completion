# Design Principles

> The product's rules, taken from discovery (`PLAYER_MODEL.md`, `DISCOVERY.md` → Phase 1). Every later mechanic must fit these. If it breaks one, change the principle deliberately, with an entry in `DECISIONS.md`. Do not work around it quietly.
> Game mechanics (XP, HP/MP, quests, abilities) belong to Phase 2. These principles say what those mechanics must achieve, not what they are.

_Status: **approved by Dan** 2026-09-23 (D-007)._

## The problem

> Dan usually knows what would make a day good, but starting depends on mood and energy, and on low days the couch and phone win. The product's job is to get him **started** on meaningful things at a size that fits the day, and to let a day count as **enough**, without guilt or admin.

Agreed by Dan (round 1). The main competitor is YouTube on the sofa, not other apps.

## Principles

**1. Starting beats planning.**
The app's first job is to get Dan started. Opening it shows one obvious next thing. "I can't start" is always one tap away.

**2. "Enough" is defined, and it's small.**
- **Normal day:** about **3 main jobs**.
- **Low day:** **getting outside plus a real meal** is a complete day. *Clarified 2026-09-24 (D-038):* that is the default low day, not a fixed rule. Swap works as on any day, so any two small real things can make it. A "real meal" is whatever Dan counts as one; the app never asks what he ate.

Anything beyond that is a bonus, never a debt. *Clarified (D-038):* day complete means the day's success is **locked in**; nothing after it can undo it. After it, rest is the main offer and a quiet way to keep going is always there, never pushed.

**Low floor, high ceiling** (added 2026-09-23, D-011). The small "enough" is the *floor*, not the design target. On high-capacity days the game must be able to make Dan **very** productive: more jobs, bigger pushes, richer rewards, with no cap that makes extra real effort pointless. The app is built for Dan at full strength as much as for Dan on a low day. *Clarified 2026-09-24 (D-039):* **effort is never turned away.** Every screen that ends something offers a way on when Dan wants it, and more real work always moves him further and brings more (Site, finds, records). The only thing paced is the order of the story's core marks (D-035); extra effort meets side content, never a wall or a "come back another day".

**3. Low days can fully succeed.**
Capacity is Low, Normal or High.
- It is **suggested from last night's bedtime** (a guess, not a verdict), and Dan can change it with one tap.
- It changes **how many and how big** the day's jobs are. It never changes whether the day can succeed.
- *Clarified 2026-09-24 (D-043):* it can be changed at any time until the day ends (about 4 am). Done jobs stay done; lowering it can complete the day.

**4. Story pulls, a tiny step pushes.**
"I can't start" gives **a story teaser first, then one tiny physical step** (e.g. "put your gym shoes on"). Afterwards it *offers* to continue and never demands. Steps are concrete and real, with no cheerleading, so they don't feel patronising. *Clarified (D-038):* the teaser is never new story. It is a line from just ahead, a sound behind a door, or something already found; its payoff comes only after the real job (`game/CORE_LOOPS.md` Part 4). Tapping it again the same day brings back the same teaser, so it can't be farmed.

**5. Aim the help at what's avoided.**
Suggestions lean towards what Dan puts off: admin, Spanish, housework, and one-off jobs with a real cost (the cat's medication). The Claude Code course is absorbing, so it needs less pushing. **One hour of course work counts as done** (two delves of 25, which with the breather is the hour on the clock; any 50 minutes of delves do it, D-038). More is a bonus, so the course can't crowd out the avoided jobs.

**6. Weekly rhythm, not streaks.**
Recurring targets are weekly, and Dan set them himself:
- Gym 4× (sauna after)
- Spanish: 1 lesson + 1 hour of study
- Cooking 2–3×
- Meal prep on Sunday
- Course: 1 h/day baseline

Each week starts fresh. Misses never carry over. *Clarified (D-038):* nor do they pile into the rest of the same week. The day's size comes from capacity alone; open targets never add jobs or raise it, and late in the week they are suggested no harder than early on. A disrupted week becomes a lighter week unless Dan asks to catch up.

*Clarified 2026-09-24 (D-030):* **these are Dan's current targets, not built into the app.** Dan can add, change, rename or remove any recurring target, and any kind of job, at any time. Every job name anywhere in the docs or mock-ups (gym, Spanish, the course, the cat's medication) is an example.

*Amended 2026-09-23 (D-020):* **a non-punitive trail** is allowed alongside the weekly rhythm: each day complete adds a marker, relics come from markers in total, and after a gap the trail branches rather than restarting, so nothing ever visibly breaks (`game/TOOLS.md` §5; revised by D-023). Punitive streaks stay excluded. *Clarified (D-038):* the trail shows only markers that were placed: no calendar, no empty slots, no ghost markers, no count of days in a row, nothing that marks a day without a marker.

**7. Nothing piles up.**
No overdue counts, no red badges, and no backlog on the opening screen. *Clarified (D-038):* the opening screen shows only **today's jobs** (the day's 2–5 main jobs, suggested for today and accepted or swapped), the next one leading. Never satchel items, *someday*, what's left of a weekly target, or any count. *Amended 2026-09-23 (D-020):* Dan can keep **lists on request**. Untouched items quietly move to *someday*, with no counts (`game/TOOLS.md` §2). After an absence, the world is still there. Dan sees a short "where you were" and one small, welcoming first step.

**8. Failure is information.**
When something is missed, the job waits, shrinks or changes route, or the app asks what happened. No lost progress, no shame, no guilt language (MASTER_BRIEF §16).

**9. The app suggests, Dan chooses.**
The app proposes the day's main jobs. Dan accepts them or swaps from a short menu. He adds one-off jobs by **typing one line**. The kinds of job and the weekly targets are his to edit (D-030), including whether any job runs as a delve (D-041); nothing about them is hard-coded. No estimating, tagging or scoring. The app learns over time; Dan doesn't administer it.

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
Productivity features (timer, lists, scheduling, calendar, the trail, record of progress) are in, but each one must move or reveal something in the game, must never create a pile, a debt or a red number, and must never let an easy thing stand in for the avoided thing (P5; D-023). Planning stays optional: starting beats planning (P1). *Clarified (D-038):* tools help real action happen; using a tool on its own (adding, sorting, planning, ticking an item that isn't one of the day's jobs) earns nothing. The world moves only for real action.

## Still to test in use (not settled)

- Whether 3 main jobs is the right number, and whether Low/Normal/High is fine-grained enough.
- Whether notifications help; what should happen at a missed expected time.
- Whether the dark tone lifts or weighs on him on low days.
- Whether bedtime reliably predicts capacity.
