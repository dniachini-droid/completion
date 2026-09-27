# (17) Projects as expeditions

> Stage 4 scope page (`product/PRODUCTIVITY_PLAN.md`, D-107). Nothing here is decided: Dan chooses, then it becomes a D-entry. Spoiler-free: mechanics only. **The story's side is scoped separately, sealed** (D-015, D-035).

## 1. What it is and why
- **The finding:** "Months, goals, projects: 0.5/5. Nothing above a single job" (`PRODUCTIVITY_REVIEW.md`, scores and item 17).
- **The idea:** a named goal ("Finish the course", "Sort the tax return") with an optional target month and ordered steps. Only the next step is ever offered (GTD's "next action").
- **Fact: this is already half-designed.** The game docs have a **great gate / great door** for "a large real project and its milestones", opened by one-tap milestone Keys that open only that project's door (`game/CORE_LOOPS.md` → Large projects; `QUEST_SYSTEM.md`; `BALANCING.md` §3; `ECONOMY.md`). It was never built. D-019 already says the story never waits on a project.
- **A naming clash (fact):** "the expedition" already means Dan's own journey through the Site (`narrative/TERMINOLOGY.md`, `TOOLS.md` §1). This feature needs another word (question 1).

## 2. What Dan sees, tap by tap
1. **Satchel → "+ A bigger thing".** One line for the name. Then an optional month (the phone's own wheel), then the steps: type or paste several lines, as in the satchel. Done. No other fields.
2. **Only the next step shows.** It behaves like a satchel line: Today when planned, Choose a delve, the Week's "Move to". The later steps stay folded inside the project.
3. **Doing a step:** Begin or Done, as for any job. The next step quietly takes its place. The step's own editor (Stage 2) gives it a length, a timer and a first step.
4. **The project's page** (from the satchel): the name, the month, the next step, and the steps already done, in plain words. No "3 of 7", no bar, no percentage.
5. **The month passes:** the Stage 3 question, once: *Still needed? · New month · Let it go*. No red, no count.
6. **Last step done:** one question, "Is it finished?" (Yes / Not yet: add a step). Yes is the one-tap milestone. In the world, the project's own door fills and opens (the story's side, sealed).

## 3. Rules and facts
- **New `core/projects.ts`**, pure: the live projects from the facts (next step, done steps, finished or let go).
- **`core/game.ts`:** a project's next step joins the pool as a one-off (`offeredOn`, Choose a delve). Other steps never appear.
- **`core/week.ts`:** `planWeek` may place each project's next step once a week, if a day has room (question 3). A step is then planned like any line.
- **Rewards (rule 10):** a step earns exactly what a job of its minutes earns. Splitting a project into more steps earns nothing, because steps are time (`BALANCING.md` §1). The door fills with **real minutes spent on the project's steps**, not with step count. It opens once, at "finished", and only if about 5 hours went in (a starting guess, for BALANCING). So a one-step project made to farm a door gets nothing.
- **Keys:** the door's opening is outside the weekly supply of 5 and opens only that door (BALANCING §3). The story's pace is untouched (D-047, D-019).
- **Failure (rule 9):** a project let go leaves no trace, and its door simply stays quiet. Done steps stay done, and their minutes stay counted.
- **New fact types:** `projectSaved` (the whole project, with step order; any edit saves it again), `projectEnded` (`finished` or `letGo`). Steps are jobs, so `jobBegun` / `jobDone` need no change. Each new type needs a sample save (D-106). Old saves load unchanged: no existing shape changes, so no new save version.
- **Rule tests:** only the next step is offered; step order survives edits; splitting earns nothing; the door needs minutes; let go leaves nothing behind.

## 4. Native work and Apple permissions
None. The month uses the same date wheel as Stage 3.

## 5. Risks
- **Calm:** a project page is a list, the thing lists do on low days (P2, P7). Keep it off Today and off the opening screen. Show only the next step, no remaining count, no progress bar.
- **"The new YouTube":** low. There is nothing to browse, and the door is one moment at the end.
- **Productivity theatre (rule 11):** the danger is planning a project's 30 steps instead of doing step 1. Mitigate: the steps can be added later, and one step is enough to start.
- **Earn complexity (rule 12):** a third kind of thing (rhythm, line, project). It is worth it only if Dan has real multi-week goals that aren't rhythms. The Course is already a rhythm.
- **Farming (rule 10):** covered by "steps are time" and "the door needs minutes".
- **Honour system:** "Is it finished?" is trusted, as all milestones are (`QUEST_SYSTEM.md`).

## 6. Effort and options
- **A. A project as an ordered satchel group:** only the next line shows, with no month and no door. S–M, 1 session.
- **B. A + target month + the passed-month question + the next step placed by Plan my week.** M, 1–2 sessions, after Stage 3.
- **C. B + the game's side:** the project's door fills with real minutes and opens at "finished". L, 3–4 sessions, plus the sealed story session for the doors' content and paintings.

**Claude's recommendation:** C, built as B first and the door second, but only after Stages 2 and 3, because it stands on the job editor and dates. If Dan has no real project beyond the Course right now, **not now**: the review's own finding is real, but it was scored for a general user.

## 7. Questions only Dan can answer
1. What should it be called? "Project", "expedition" (clashes with the journey's own name), or something of the world's (Claude would pick it in the sealed process)?
2. What real projects would you put in today? Name two if you can. If there are none, this can wait.
3. Should Plan my week place a project's next step by itself, or only when you move it onto a day?
