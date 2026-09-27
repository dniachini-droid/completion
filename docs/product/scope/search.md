# Scope: search in the satchel, the Week and past weeks

> Stage 4 of the productivity track (`product/PRODUCTIVITY_PLAN.md`, D-107). Docs only; nothing is decided until Dan chooses. Spoiler-free.

## 1. What it is and why
- **The finding.** "No search" is listed under "Also noted" in `product/PRODUCTIVITY_REVIEW.md`. No reviewer ranked it, and it has no effort estimate.
- **An earlier promise.** `game/TOOLS.md` §2 already says *someday* "shows only when searched". Today, *someday* is a link in the satchel instead.
- **What Dan could look for:**
  - a satchel line or a *someday* line ("did I write down the boiler thing?");
  - a job planned in a week ahead (after Stage 3);
  - when a job was last done ("when did I last clean the tank?");
  - a job's note (after Stage 2, item 14).
- **Facts about the size.** Ticked lines leave the next day (D-110). Lines go to *someday* after 21 days (`core/week.ts`). The Week holds this week and next, and the past shows only what was done. So the lists are short. Guess: Dan will rarely have more than a screenful.

## 2. What Dan sees, tap by tap (option B)
1. In the **satchel**, beside "Add a line" and "Someday", there is a quiet **Find** link. The Week has the same link at its foot.
2. It opens a box, already focused, over the blurred painting. Dan types "tank".
3. The results appear as he types, grouped in plain words, with no numbers:
   - **In the satchel**: "Tank filter, order a spare";
   - **Someday**: any match;
   - **Ahead**: "Tank clean · Sat 18";
   - **Done before**: "Tank clean · last done Sat 4 Oct".
4. A tap on a satchel line shows it in the satchel with its usual choices (Put on today, Let it go). A tap on a planned job opens that week with its sheet open. "Done before" is an answer only, with nothing to open.
5. Closing the box returns to where Dan was.

## 3. Rules and facts
- **New:** one pure function, for example `find(content, facts, text, day)` in a new `core/search.ts`. It searches only **Dan's own words**: job names, satchel lines, and notes (after Stage 2).
- It never searches the Daybook or any story text. That keeps it simple, and it can never surface a story line out of order.
- **Facts:** none. Searching is not recorded and earns nothing.
- Rule tests: a dropped line is not found; a *someday* line is; "Done before" shows only the latest date, never a count.

## 4. Native work and Apple permissions
None. Only the phone's keyboard.

## 5. Risks
- **The calm.** "Done before" is a small piece of history, and the reviewers noted the app keeps none. It must stay one date, never "done 3 times this month" and never a list of misses (`ANTI_FEATURES.md`: no stats).
- **Rule 16.** Nothing changes on Today. Find lives in the satchel and the Week only.
- **Productivity theatre (rule 11).** This is low risk. A search is quick, and it helps Dan leave the app sooner.
- **Earn complexity (rule 12).** This is the real risk. With short lists, a search box may never be used. It would be one more link on two screens that are already busy.

## 6. Effort and options for Dan
- **A.** Not now. (Effort: none.)
- **B.** Find across the satchel, *someday*, weeks ahead and "last done", as above. (M, about one session.)
- **C.** Only "when did I last…": a line in each job's editor (Stage 2) saying "last done Sat 4 Oct". There is no search box. (S, a few hours, after Stage 2.)
- **D.** B, plus the notes and past weeks day by day, from the Daybook. (M–L, one to two sessions.)

**Claude's recommendation.** Not now. The lists are kept short on purpose, so a search box would rarely earn its place. If "when did I last…" is a real question for Dan, C answers it with no new screen. Look at B again if the satchel regularly runs past a screen once Stage 3's dates are in.

## 7. Questions only Dan can answer
1. Have you ever opened the satchel and not been able to find something? What was it?
2. Do you ever wonder when you last did a job (the tank, a haircut)? Would seeing the date help, or feel like keeping score?
