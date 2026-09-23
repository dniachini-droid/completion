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

*Amended 2026-09-23 (D-020):* **a non-punitive trail** is allowed alongside the weekly rhythm: each day complete adds a marker, relics come from markers in total, and after a gap the trail branches rather than restarting, so nothing ever visibly breaks (`game/TOOLS.md` §5; revised by D-023). Punitive streaks stay excluded.

**7. Nothing piles up.**
No overdue counts, no red badges, and no list on the opening screen. *Amended 2026-09-23 (D-020):* Dan can keep **lists on request**. Untouched items quietly move to *someday*, with no counts (`game/TOOLS.md` §2). After an absence, the world is still there. Dan sees a short "where you were" and one small, welcoming first step.

**8. Failure is information.**
When something is missed, the job waits, shrinks or changes route, or the app asks what happened. No lost progress, no shame, no guilt language (MASTER_BRIEF §16).

**9. The app suggests, Dan chooses.**
The app proposes the day's main jobs. Dan accepts them or swaps from a short menu. He adds one-off jobs by **typing one line**. No estimating, tagging or scoring. The app learns over time; Dan doesn't administer it.

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

## Still to test in use (not settled)

- Whether 3 main jobs is the right number, and whether Low/Normal/High is fine-grained enough.
- Whether notifications help; what should happen at a missed expected time.
- Whether the dark tone lifts or weighs on him on low days.
- Whether bedtime reliably predicts capacity.
