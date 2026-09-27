# (18) A 90-second weekly review

> Stage 4 scope page (`product/PRODUCTIVITY_PLAN.md`, D-107). Nothing here is decided: Dan chooses, then it becomes a D-entry. Spoiler-free: mechanics only. **Any story in it is scoped separately, sealed** (D-015, D-035).

## 1. What it is and why
- **The finding:** "Reflection / review: 1.5/5. The Daybook looks back. Nothing helps plan forward" (`PRODUCTIVITY_REVIEW.md`, item 18).
- **The idea:** a short, skippable look ahead at the end of the week's Daybook page: sweep a few old satchel lines, see next week's fixed things, pick one thing that matters most, then "Plan it for me".
- **What exists (fact):** the week close already ends with one quiet offer, "Plan next week? · Plan it for me · Not now", never repeated (D-045; `ui/Daybook.svelte`). This item extends that offer; it is not a new screen from nothing.
- **Two conflicts with the plan's wording (fact):**
  - "It rewards doing the review" runs against P16 and `PLANNER.md` rule 2: *planning, moving or rearranging earns nothing; only real action moves Dan* (D-038, D-048). A reward in the world for reviewing would need Dan to change that rule on purpose.
  - "Perhaps the camp scene": camp is no longer a page. Dan found it "a random page" and it was removed (D-093).

## 2. What Dan sees, tap by tap
1. The week's Daybook page opens as now. At the foot: *"Look ahead? About a minute." · Not now*.
2. **Still wanted?** Up to 3 of the oldest satchel lines, one at a time: *Keep · Let go · Someday*. Never more than 3, and never the whole list.
3. **Coming up.** Next week's fixed points, one line each, read only: appointments, dated lines, monthly and yearly items (Stage 3), and a project's next step (item 17, if built). Five lines at most, then "and more" folded.
4. **What matters most?** Pick one job or line, or "Nothing in particular". It is placed first in the plan and leads Today on its day.
5. **Plan it for me.** Runs Plan my week and opens the Week, as today's offer does.
- Any step can be skipped, and "Not now" on the first card ends it. Nothing asks again that week, and nothing is a notification.

## 3. Rules and facts
- **`core/week.ts`:** `items()` treats a kept line as touched (its three weeks towards Someday start again). `planWeek` places the pinned job first, early in the week, like an avoided job.
- **`core/game.ts`:** the pinned job leads Today on the day it is planned. Off the plan, it earns the same as always (no bonus for keeping to it, `PLANNER.md`).
- **Rewards (recommended):** none in the world. The page itself can carry a line of the world's voice (story side, sealed). If Dan wants a reward, the fair version is small and once a week, paid for **opening the look-ahead**, never for how the week went. It would still amend P16, so it needs its own D-entry.
- **New fact types:** `itemKept` (id), `weekPinned` (week, job), `lookAheadSeen` (week, finished or not, for the test's notes). "Let go" and "Someday" reuse `itemDropped`, or a new `itemSomeday` if Someday must be set by hand. Each new type needs a sample save (D-106). No existing shape changes, so old saves load as they are.
- **Rule tests:** a kept line doesn't go to Someday; the pin leads its day; a week without the look-ahead plays exactly as now.

## 4. Native work and Apple permissions
None.

## 5. Risks
- **Productivity theatre (rule 11):** this is the "Sunday admin meeting" `CORE_LOOPS.md` rules out ("No planning required"). It stays safe only if it is short, optional, offered once, and the week plays the same without it.
- **Calm:** the sweep must never show the pile. Three lines, no count of how many are left, no "overdue".
- **"The new YouTube":** low. It has a fixed end, and it ends in the Week.
- **Earn complexity (rule 12):** weak without Stage 3. Until dates and monthly items exist, "Coming up" holds only appointments, which the Week already shows.
- **Farming (rule 10):** none if it earns nothing. With a reward, it is once a week and can't be repeated.

## 6. Effort and options
- **A. Keep today's offer as it is.** Nothing to build.
- **B. Add "Still wanted?"** (up to 3 old lines) before the existing Plan it. S, half a session.
- **C. The full look-ahead:** sweep, coming up, one pin, plan it, in the Daybook, with no reward in the world. M, 1–2 sessions, after Stage 3.
- **D. C with a written moment of the world** (the story's side, sealed) and a once-a-week reward for opening it. This amends P16. M–L, 2 sessions plus sealed content.

**Claude's recommendation:** C, after Stage 3, with no reward for the review itself. The payoff is a better week, which then earns in the usual way. If Stage 3 slips, B alone is worth doing.

## 7. Questions only Dan can answer
1. Would you open a one-minute look-ahead on a Sunday, or do you plan when you wake up, as you said at D-089?
2. Should reviewing ever earn something in the world, knowing that it bends "only real action moves you"?
3. "What matters most": useful, or one more thing to decide?
