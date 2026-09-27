# Scope (20): a month view

> Stage 4 of the productivity track (`product/PRODUCTIVITY_PLAN.md`, D-107). Docs only; nothing is decided until Dan chooses. Spoiler-free.

## 1. What it is and why
- **The finding.** The review scored "months, goals, projects" 0.5/5: nothing in the app looks further ahead than next week (`product/PRODUCTIVITY_REVIEW.md`, item 20: "deadlines, yearly and monthly items, and expedition dates ahead").
- **What it would be.** One screen that shows what is coming beyond next week: dated jobs, monthly and yearly repeats, and appointments already placed in later weeks.
- **It depends on Stage 3.** Today there is almost nothing to show. The Week only knows this week and next (fact: `Week.svelte` shows only those two). Dates (5), monthly and yearly repeats (6) and paging to any week ahead all arrive in Stage 3. Before then, a month view would only show weekly rhythms repeated four times, which is noise.
- **Never the past.** `PLANNER.md` says the past shows only what was done, and D-038 rules out a calendar with empty slots for the trail. So this view looks forward only.

## 2. What Dan sees, tap by tap (option B, the recommended shape)
1. Dan opens the **Week** (from Today's foot, as now). At the foot, beside "What repeats" and "Next week", there is a quiet link: **Ahead**.
2. **Ahead** opens over the same blurred painting. It is a list, not a grid, grouped by month ("October", "November"). Only days that hold something appear:
   - "Fri 10 · Renew the passport" with "by" in the quiet italic;
   - "Sat 18 · Mum's birthday";
   - "Mon 1 · Rent".
3. Weekly rhythms (gym, Spanish) are left out, because they are always there.
4. A tap on a line opens the **Week for that week**, with the job's sheet open, so Dan can move it there as usual. A yearly item shows "Plan it", as Stage 3 already plans.
5. The back link returns to the Week.

## 3. Rules and facts
- **New:** one pure function, for example `ahead(content, facts, from, to)` in `core/week.ts`. It lists dated lines, monthly and yearly repeats and future planned entries, using Stage 3's date rules.
- **Facts:** none. The view only reads. Changes still happen in the Week and the job editor, through the facts they already write.
- Rule tests: weekly rhythms never appear; a passed date never appears (it goes through Stage 3's "Still needed?" question instead); nothing before today appears.

## 4. Native work and Apple permissions
None.

## 5. Risks
- **The calm.** A month of dates can read as a pile. So: no counts ("4 things in November"), no colour for busy weeks, no red, and passed dates never listed. It is reached from the Week only, never from Today.
- **Rule 16 (the next action is obvious).** Today does not change. The view is one level below the Week.
- **Productivity theatre (rule 11) and P15.** Browsing months ahead is planning, not starting. The view is read-mostly and earns nothing (P16), so there is no pull to linger.
- **Earn complexity (rule 12).** Guess: Dan has perhaps 5–15 dated things a quarter. That fits a short list. A grid would be mostly empty squares.

## 6. Effort and options for Dan
- **A.** No new screen. Stage 3's paging through weeks ahead is the month view. (Effort: none.)
- **B.** **Ahead**: a list of the rest of this month and the next two, only days that hold something. (S–M, about half a session to one session.)
- **C.** A month grid with a faint mark on days that hold something; a tap on a day opens its week. (M, one session; the grid needs care at 360 px wide.)
- **D.** C, plus planning from the month: move a dated job into a week and see each week's "about 2 h" (Stage 3's minutes). (M–L, one to two sessions.)

**Claude's recommendation.** B, but only after Stage 3 has been in use for two weeks or so. If paging the Week turns out to be enough, choose A and skip this. C and D add a calendar's look without adding much that a list can't show.

## 7. Questions only Dan can answer
1. When you think about "later this year", is it a list of dates or a picture of the month in your head?
2. How far ahead do you want to see: two months, three, or the whole year for birthdays and renewals?
