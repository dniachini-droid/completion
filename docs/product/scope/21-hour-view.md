# Scope (21): an optional hour-by-hour view of today

> Stage 4 of the productivity track (`product/PRODUCTIVITY_PLAN.md`, D-107). Docs only; nothing is decided until Dan chooses. Spoiler-free.
>
> **⚑ This touches an anti-feature.** "Hour-by-hour time-blocking, required planning" is excluded in `ANTI_FEATURES.md` (P1). `PLANNER.md` (locked, D-048) says "no hour grid", and `game/TOOLS.md` §3 says "light, not time-blocking". D-107 reopened this **only as a scoping question**. Any option beyond A needs a new decision that says so.

## 1. What it is and why
- **The finding.** Review item 21 (M–L): Structured and Tiimo show the day as a timeline. For ADHD this helps with "time blindness", which means not feeling how much of the day is left.
- **The reviewers did not rank it highly.** It is Tier 3, and the reviewers' pushback was about reminders, not an hour grid.
- **What exists already.** A job on the Week can have a time (the Week's time box, `planChanged` with `time`). A job with a time leads Today as that time nears. Bedtime is known (Tonight, `bedtimeSet`). So the app already knows the day's fixed points and its end.

## 2. What Dan sees, tap by tap (option B)
1. On the **Week**, today's row has one quiet link: **by the hour**. Today itself does not change.
2. It opens a vertical strip **from now to bedtime**. The hours already gone are not shown.
3. Fixed things sit at their times: the Spanish lesson at 18:00, a timed entry, and calendar events if (9) is built.
4. Between them, the free stretches are named in words: "Free until 18:00 · about 3 h".
5. Today's jobs without a time are listed underneath as **Any time today**. They are not placed on the strip.
6. A tap on a job opens its sheet, as in the Week (move it, give it a time, not this week). The back link returns to the Week.

## 3. Rules and facts
- **B and C:** a pure function, for example `dayShape(content, facts, day, now, bedtime)` in `core/week.ts`. C also fits untimed jobs into the free stretches by length (it needs Stage 3's minutes) and recomputes each time. **Facts: none.** Suggestions are never saved.
- **D (real time-blocking)** is the hard one. Today a job with a time is an **appointment**. By `PLANNER.md`'s table it is fixed, it stays on a Low day, and (after Stage 1) it can have a reminder. Blocking every job into hours would quietly turn them all into appointments. D would need a "soft time" on a plan entry that is not an appointment. That is a new field or fact, so it needs a sample save (D-106), and old saves must still load. It would also need new rules for what a soft time does on a Low day.

## 4. Native work and Apple permissions
None for B–D. If calendar events are shown, that is item (9)'s Calendar permission, scoped on its own page.

## 5. Risks
- **Planning replaces starting (P1).** This is the reason the anti-feature exists. Arranging hours can feel like progress, and it earns nothing (P16). Productivity theatre (rule 11).
- **The calm.** A blocked 10:00–11:00 that slips makes the rest of the day look "late". That is a visible failure every morning, against P8 and rule 9. B and C avoid this: they block nothing, and the past hours simply aren't there.
- **Rule 16.** Today must keep its one next job. The strip lives under the Week, never as the opening screen.
- **Earn complexity (rule 12).** Guess: Dan has few fixed appointments (the lesson, the odd dentist). Without calendar import, the strip would mostly say "free until bedtime".

## 6. Effort and options for Dan
- **A.** Not now. Keep "no time-blocking". (Effort: none.)
- **B.** **Today's shape**, read only: fixed things and free stretches from now to bedtime. (S–M, about one session.)
- **C.** B, plus untimed jobs suggested into the free stretches as "could fit", recomputed, never saved. (M, one to two sessions, after Stage 3.)
- **D.** Real time-blocking: drag jobs into hours, saved as soft times, with optional reminders. (L, two to three sessions; reverses the anti-feature and changes the locked planner.)

**Claude's recommendation.** Not now (A). Look at it again with calendar import (9): the strip is only useful once real events fill it. If Dan wants it sooner, B only. D goes against a principle Dan agreed for good reasons, and nothing in the review shows he needs it.

## 7. Questions only Dan can answer
1. Do you often lose track of how much of the day is left, or is the problem more about starting?
2. On a low day, would seeing "about 5 h free" help you, or feel like pressure?
3. Is this really a wish to see your calendar in the app (item 9)?
