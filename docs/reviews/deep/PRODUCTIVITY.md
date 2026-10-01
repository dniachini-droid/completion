# Deep review: a day of real use, counted in taps

> Review round 5 (`claude/review-round-5`), 2026-10-01. **Lens:** a senior product designer for productivity and ADHD tools. This is not a bug hunt. I lived Dan's day in the built app (`app/dist`, iPhone sizes 390 × 844 and 375 × 667, the phone's clock faked) and counted taps and decisions. I looked for friction, for missing affordances, and for places where the app makes Dan administer it (rule 11).
>
> **Read first:** `PLAYER_MODEL.md`, `CLAUDE.md`, `product/PRODUCTIVITY_REVIEW.md`, `PRODUCTIVITY_PLAN.md`, `product/scope/`, `reviews/PRODUCTIVITY-EXPANSION.md`, `reviews/OVERVIEW.md`, and `DECISIONS.md` D-089 and D-107 to D-146.
>
> **Spoiler-free:** no story text is quoted. Screens were saved to `/tmp/claude-prod/` and are not committed. Nothing in `app/src` or the tests was changed.

## The short version

**The core loop is now very good.** Starting, being interrupted, carrying on and capturing a thought all take one or two taps. No good productivity app does it in fewer.

The friction that's left sits in four places:
1. **The edges of the day.** Last night's choice doesn't carry into the morning, and the welcome back says one thing while Today asks for another.
2. **Days that aren't normal.** A low day or a day off costs a string of separate "no"s.
3. **The best tool for starting is now hidden.** "I can't start" is behind a press and hold.
4. **The story toll on quick ticks.** Every tick off opens a story screen, and the shortest time you can give is 15 minutes.

Most fixes are **S**. None needs a new screen.

## The day, walked and counted

"Taps" counts touches. "Decisions" counts the times Dan has to choose something. Typing is noted separately.

| Moment | Path in the app | Taps | Decisions | Verdict |
|---|---|---|---|---|
| **Morning open** (after a kept bedtime) | Morning find → **Back to today** → Today | 1 | 0 | Good. But the job Dan chose last night is just row 1, with no mark and no Begin (see 1). |
| **Morning open after 2 days away** | Welcome back → Back to today | 1 | 0 | The words say *"One small task is enough to take it up again"*. Today then shows a **3-hour finish line** (Meal prep, Gym, Tank clean) and two more under "If there's time" (see 2). |
| **Choose what to do** | Today's list: 4 rows (Thu) to 7 rows (a heavy Sun), avoided job first | 0 | 1 of 4–7 | This is Dan's choice since D-135. The list is calm and clear. |
| **Start** | Tap row → set-up (preset minutes) → **Begin** | 2 | 0–1 (minutes) | Excellent. |
| **Can't start** | **Press and hold** row → *I can't start* → *Try ten minutes?* | 3 (1 is a hold) | 0 | Strong once found. But the hint *"Press and hold a job for more"* goes away after the menu's first use, and nothing on Today or the set-up points to it (see 3). |
| **Interrupted** (Pause, or leave the app) | Pause → Today shows **Carry on · Finish here**, "48 minutes left" | 1–2 | 0 | Excellent. Paused minutes aren't counted, and nothing is lost. |
| **Come back** | **Carry on** | 1 | 0 | Excellent. |
| **A stray thought mid-delve** | *Park a thought* → type → Return | 1 + typing | 0 | Excellent (D-138). |
| **Capture for today** | **Add a job** → type → Return | 1 + typing | 0 | Excellent. |
| **Capture for later** | Add a job → type → *Save for later* → back to Today | 3 + typing | 1 | Fine. It leaves Dan in the Satchel. |
| **Finish a recurring job** | Finish here → Back to today | 2 | 0 | Excellent. |
| **Finish a one-off early** | Finish here → *Is it done?* Not yet → (where I stopped, optional) → Back to today | 3 | 1 | Good. Today then says "12 min so far · It's done". |
| **Tick off** a done-elsewhere job | Circle → *How long?* (shortest **15 min**) → story screen → Back to today | 3 + reading | 1 | A 2-minute phone call has to be claimed as 15 minutes. Six errands ticked one by one means six story screens (see 5, 8). |
| **Errand run** of 3 | Errand run → tick 3 → Start → Begin → strike 3 → Finish → Count them → Next ×2–3 → out | ~15 | 2 | Fine for its job. Most of the cost is the stories at the end. |
| **Plan tomorrow** (bedtime) | Tonight: *Tomorrow starts with* → pick → (one line on your mind) → Go to sleep | 3 + typing | 1 | Good. But it only appears in the last hour before bedtime (at 21:30 it isn't there). |
| **Plan next week** | Week → Next week → Plan my week | 3 | 0 | Excellent. It is also automatic at the week's first opening. |
| **A timed appointment with a reminder** (dentist next Tue 15:00) | Week → Next week → + Tue → type → Add → tap the row → Set a time → time wheel → 1 h before | **~9** + typing | 3 | The slowest everyday task in the app (see 7). |
| **An overwhelming / low day** (keep only one of 4) | For each other row: slide → *Not today* | **3 slides + 3 taps** | 3 "no"s | Each one is a small refusal. The planner then spreads the work well: three low days in a row piled **nothing** up (checked). |
| **A day off planned ahead** (Sunday, 2–4 jobs) | Week → each job: tap → Move to (pick a day), or *Not this week* (which drops the session) | **2 per job**, ~8 | 1 per job | There's no "rest day", although `CONCEPT.md` and `CORE_LOOPS.md` designed one (see 6). |

**What already works, and must be kept:**
- the one-tap Carry on card;
- the carry of minutes on "Not yet";
- Park a thought;
- remembered jobs as you type;
- the planner that learns and never snowballs;
- Tonight;
- no counts and no red.

These are the parts an ADHD user feels every day.

## Improvements, ranked by value for effort

Effort: **S** = hours to a day · **M** = a session or two · **L** = several sessions or native work.

### 1. Last night's choice starts the morning: one tap to Begin
- **Problem.** Tonight asks *Tomorrow starts with:* (2 taps), which is exactly the right implementation-intention move (`PRODUCTIVITY-EXPANSION.md` §1).
  - In the morning the payoff is gone. The morning screen doesn't mention the choice, and on Today the chosen job (Spanish study, in my walk) is just row 1. Nothing tells it apart from a job the planner put first.
  - D-131 had it "lead the next morning as the big Delve". D-135 then removed the big card, so the cue no longer fires.
  - It costs 3 taps (Back to today, row, Begin), and Dan has to recognise the job as his own choice.
- **Proposal.** On the morning after a choice, until it is started, set aside or past noon:
  - Today's top card holds **"You chose to start with Spanish study"** with **Begin** (it opens the set-up), and *Add a job* sits under it.
  - The morning screen's button reads **"Start with Spanish study"** next to *Back to today*.
  - This is Dan's own choice from last night, not the app's suggestion.
- **Also:** offer *Tomorrow starts with* from the start of Tonight, not only in the last hour before bed. Dan's evening close moment comes before he goes to bed late.
- **Effort.** S.
- **Touches.** D-135 (no job put forward: this puts forward only what Dan chose, so ask him), D-131 point 4.

### 2. The welcome back keeps its promise
- **Problem.** After two days away, the welcome says *"One small task is enough to take it up again"*. Today then shows a 3-hour finish line of three hour-long jobs, plus two more (`/tmp/claude-prod/51-*.png`).
  - D-089 (kept in D-114 and D-127) says days away must not shrink the day, and **I am not re-raising the size choice.**
  - The new evidence is that the 3-hour line (D-131) came after D-089. Since then, the first screen after an absence says one thing and the gold line asks for another. That is the shame-free return the reviewers rated 8/10, quietly undone. Self-forgiveness lowering the next procrastination is the evidence-backed part of it (expansion, refs 28–29).
- **Proposal.** Dan picks one:
  - **A (keeps D-089):** change the words so they match Today. For example, drop "One small task is enough", or say it plainly as "Today is as planned; start anywhere".
  - **B (bends D-089 for one day only, Dan's call):** on the welcome-back day, the finish line is **the first job Dan finishes** (5+ real minutes, rule 10). The rest sits under "If there's time". Nothing new appears on screen.
  - I recommend **B**. The return is the moment that decides whether a lapse becomes a lost month.
- **Effort.** S (one branch where the line is built, `slateOf` in `core/game.ts`, plus tests).
- **Touches.** D-089, D-130/D-131 (the finish line), the welcome back's words (`welcome.say`), rule 9.

### 3. "I can't start" back where hesitation happens
- **Problem.** The feature every reviewer called best in class is now only in the press-and-hold menu (D-135 "noted for Dan", never chosen by him).
  - The hold hint disappears for good after the menu's first use.
  - In the couch moment Dan has to remember a hidden gesture. Rule 16 says the next action must be obvious on opening.
  - The real moment of hesitation is the **set-up**, where Dan sees "60 minutes · finishing around 10:10" and balks. The set-up already carries one quiet line for avoided jobs.
- **Proposal.** One quiet text link on every delve set-up, under Begin: **"Can't start? Just the first step"**. It opens the existing *I can't start* screen (its first step, then *Try ten minutes?*). Today stays unchanged.
- **Effort.** S (one link and copy, plus a flow check).
- **Touches.** D-135 point 2, rule 16. It doesn't put a job forward.

### 4. "Just this one today": a low day in one move
- **Problem.** Dan's own definition of a low day is one or two things ("a short walk and a real meal is enough"). Keeping one job of four costs **3 slides and 3 taps**, three separate "Not today" refusals. On a low day each one is a small act of saying no to yourself. The planner then handles the leftovers well.
- **Proposal.**
  - The job menu (press and hold) gets **"Just this one today"**. It sets every other job on today's line aside (the same *Not today*, shown struck with *Put it back*), with one Undo.
  - The day then finishes when that job does (D-130 already allows this).
  - There is no new button on Today and no size choice. It is a fast way to do what Dan already does by hand ("I set my days", D-089).
- **Effort.** S (one command that writes the same facts as Not today, plus a test).
- **Touches.** D-089 and D-127 (not the Lighter/Fuller chooser, which stays gone), D-130.

### 5. A 5-minute tick, so honest minutes are possible
- **Problem.** *How long did it take?* starts at **15 min** (`TICK_CHOICES`). Ringing the vet, posting a letter or ordering the cat's medication often takes 2–5 minutes.
  - Dan has to over-claim, or not tick at all.
  - Over-claiming also breaks rule 10: a 3-minute call buys 15 minutes of road.
  - Dan chose "I'll be honest with myself" (D-134), and the sheet doesn't let him be.
- **Proposal.** Add **5 min** and **10 min** before 15. A 5-minute tick still meets the story threshold (`RETURN_MIN`), so honesty never costs the moment.
- **Effort.** S (one constant, plus BALANCING §1 and a rule test).
- **Touches.** D-134, D-121's 5-minute line.

### 6. A rest day, set in the Week
- **Problem.** There is no way to say "Sunday is off".
  - Today it means tapping each of Sunday's jobs and moving it to a day Dan has to pick (2 taps and a decision per job, ~8 taps). The other choice is *Not this week*, which drops the recurring sessions.
  - The concept always had one: "Rest day: a camp day. A scene, no step, no cost, never scored" (`CONCEPT.md`, `CORE_LOOPS.md`, P12). It was never built.
  - MASTER_BRIEF §169: "Rest ≠ failure."
- **Proposal.**
  - A tap on a day's name in the Week (it already folds the day) also offers **"A rest day"**. That day's jobs go back to the planner, which lays them out on the other days with room (as *Lay out the rest of the week* does). Appointments stay where they are.
  - The day shows **"Rest"** in the Week. On the day itself, Today shows the camp and no list. The list is still one tap away if Dan changes his mind.
  - No reward and no cost.
  - The same item can sit in Today's settings gear as "Make today a rest day" for an unplanned day off.
- **Effort.** S–M (a `dayRested` fact with its sample save, the planner skips it, a Today state, tests).
- **Touches.** D-127 ("I'll set my days": this makes setting a day cheap), P12, PLANNER.md.

### 7. "Say it plainly": dates and times understood as you type
- **Problem.** The slowest everyday task is a timed one-off: about **9 taps** across the Week to put "dentist next Tuesday 3 pm, remind me an hour before" in place. A Siri line ("Add a job: dentist Tuesday 3pm") lands in *No day yet* with the words "Tuesday 3pm" left in its name.
- **Proposal.**
  - The add boxes (Today's, the Satchel's, the Week's +, Tonight's line) and Siri lines read a day, a time and a "by" date with simple on-device rules: "tue 3pm", "tomorrow", "by friday", "on the 12th".
  - What was understood shows **under the box as a chip** ("Tue 6 Oct · 15:00 ×") before Return. A tap on × keeps the words as typed. Nothing is ever asked.
  - A job with a time gets the reminder default Dan used last.
  - This is **not** the AI of scope 19 or expansion feature 4: a small date parser, with no model and no network.
- **Effort.** M (the parser, the chip in the boxes, Siri's inbox path, tests in English date forms).
- **Touches.** D-126 ("adding asks nothing", kept), D-113 (Siri), D-114 (dates), D-109 (reminders).

### 8. A tick's story moment can wait
- **Problem.** Since D-134 every tick off opens its story screen. Dan said he "might have a real day of ticked jobs".
  - Six errands ticked one by one means **six full story screens** to read or skip, 18 taps against 12.
  - This is the toll the productivity review predicted by week 4. Read-it-later B was parked "only if it feels like a toll by week 4". D-134 (ticks) and D-139 (errand runs, whose stories come one at a time with *Next*) are **new evidence** that the toll is now built into the quickest action.
- **Proposal.**
  - The step screen keeps its road line and count (Dan asked to see the progress), and gains a quiet **"Read it later"**.
  - The words then wait on Today as one line, **"A step waits · Read"**, readable at any time and offered again at Tonight. They are never lost and never counted.
  - Nothing changes for a delve's end.
- **Effort.** M (a pending-return state on Today, ordering with arrivals, tests).
- **Touches.** D-134 ("bring a story moment just like a delve": still true, only deferrable), `scope/read-it-later.md` option B (parked), D-129 continuity (the order of steps is unchanged).

### 9. "If there's time" folded to one quiet line
- **Problem.** On a heavy day (Sunday in my walk) Today shows the 3-hour line and then **two to four more rows** under *If there's time*. That is up to 7 rows on a phone where 3–4 fit under the header on a small screen.
  - Dan's own hypothesis is that a long list reads as "a field of obligations", and lists are useless on low days (Player Model).
  - The line is the day. The rest is optional.
- **Proposal.** *If there's time* starts folded as one line, **"More, if there's time ›"**, with no count (P7). It opens with a tap and stays open for the day. When the day turns gold it opens by itself, since it's then what Keep going is for.
- **Effort.** S.
- **Touches.** D-131 point 6, P7, rule 16.

### 10. Last night's lines, one tap onto today
- **Problem.**
  - Lines from Tonight's *Anything on your mind?*, Park a thought and Siri all go to *No day yet*. That is right, since capture never asks.
  - But the next morning nothing shows they exist. Using one costs Satchel → press and hold → Put on a day → today: 4 taps, if Dan remembers it at all.
  - For ADHD, capture without resurfacing turns into a black hole. The weekly *Still wanted?* sweep is the only way back.
- **Proposal.** On the morning after, under the chosen first job (item 1), list last night's lines once, in quiet italic, each with **"+ today"**. If ignored, they stay in the Satchel and never come back to Today. No count.
- **Effort.** S.
- **Touches.** D-131 point 4 (Tonight), D-126 (the Satchel), D-138.

## Considered and not proposed

| Idea | Why not now |
|---|---|
| A suggested "Up next" job on Today | **Declined** (D-135: "no suggestion at all"). Item 1 shows only Dan's own choice. |
| Lighter / As planned / Fuller, or a lighter day after a late night | **Declined** (D-089, D-114, D-127). Item 2 B touches only the return day, with new evidence. Items 4 and 6 are tools, not a size setting. |
| "Already done / yesterday" | Declined (D-089, D-117). Tick off covers today. |
| A timer that tolerates the job's own apps | Declined (D-107: leaving the phone pauses). |
| Start from anywhere (lock-screen Begin, widget, Watch) | **Parked** "after a few weeks of play". Nothing new: starting in the app is already 2 taps. A lock-screen "Next: X" would also clash with D-135. Look again with Phase 10 data. |
| When–then cues ("after the gym → Spanish") | **Parked** the same way. Watch the move between jobs (Back to today → row → Begin, 3 taps plus a choice) in play first. |
| Calendar events shown on Today (scope 9 C) | Dan chose B (D-111). This walk couldn't test the phone's calendar, so there's no new evidence. |
| Great Works | Waits for Dan to name a project (D-111). Unchanged. |
| An hour-by-hour view, AI step-making, body doubling, search, a mood rating | Declined or "not now" in D-111. No new evidence found here. |

## Small things noticed on the way (no proposal needed)
- **One-off job minutes:** the Week shows "Order the cat's medication · 25 minutes" while Today shows no minutes for the same job (D-144 point 5 removed the 25 on Today only). A one-line consistency fix.
- **Waiting on:** a job that waits stays under Today, unanswered, "day after day" (D-137). Several such jobs would collect into a small pile under the list. Watch it in play.
- **Small phone:** on a 375 × 667 phone, Today's header (road, Keys, Ahead) leaves room for 3 rows before the foot bar. Dan's phone is large, so this isn't a priority.
- **The big button:** Today's brightest control is *Add a job* (capture), not a start. This is Dan's choice (D-135). Items 1 and 3 give starting its weight back without changing it.

## How the walk was done
- Scripts drove the built app on port 4188 through `app/tests/flows/browser.mjs` (Chromium, touch, the clock faked through `page.clock`).
- **Days walked:**
  - Thursday 1 October from 08:30 to 00:40 (a fresh save);
  - Friday morning after Tonight;
  - a low Friday;
  - three low days in a row (Mon–Wed of the next week);
  - Sunday after two days away;
  - Sunday evening planning the next week;
  - a small phone.
- Taps were counted by the script. Decisions were counted by hand from the screens.
- **Screens:** `/tmp/claude-prod/01-*` to `96-*` (not committed).
