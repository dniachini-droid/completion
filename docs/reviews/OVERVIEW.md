# The three reviews: what they found and what I recommend

> For Dan, the morning of 2026-09-28. Three separate windows reviewed the app after last night's TestFlight build:
> - **Break-it:** tried to break it.
> - **UI:** judged the whole UI.
> - **Productivity:** researched big new productivity features.
>
> Their full reports are next to this page: [`BREAK-IT.md`](BREAK-IT.md), [`UI-REVIEW.md`](UI-REVIEW.md) and [`PRODUCTIVITY-EXPANSION.md`](PRODUCTIVITY-EXPANSION.md).
>
> **Nothing new goes to your phone until you say so.** Spoiler-free.

## First: what's on your phone now

Last night's build (one send, as you asked) has:
- **Delete everywhere.** Deleting a done job removes its record, never its minutes.
- **The Satchel,** with its artwork: jobs with no day. Any job can have a list, which you strike off during the delve.
- **"Another day…"** is now the app's own calendar, so it no longer vanishes.
- **A fix for Done** silently failing after "Not this week".
- **Lighter / As planned / Fuller is gone.** Doing more than a normal day now brings the deep story moments by itself.

## The three reviews in one line each

- **Break-it:** the core is rock solid. 216,000 random actions found no double payments and no lost minutes. But the screens had **real bugs**: one crash, and a few ways to lose a job. **All of them are fixed, tested and waiting for your go** (decision 1).
- **UI:** it already looks and feels better than almost any habit or task app. But recent changes left **the same jobs in three lists**, **four different "add" boxes**, **a job editor you can only reach through the Week**, **Settings hidden in the Daybook**, and a few leftovers of removed things, including two that go against your "one continuous story" decision.
- **Productivity:** the app is already best-in-class at the hardest part, **getting you started**. The research says the next big wins are:
  - deciding *when* ahead of time ("after the gym → Spanish");
  - starting from anywhere (a lock-screen button);
  - **real long projects**.

## Your decisions, each with my recommendation

### 1. Send the bug-fix build → **my recommendation: yes, today**
The break-it review found these in the build you have now. All are fixed on the branch, with tests, and checked by a fresh reviewer:
- **A crash that repeats on every opening:** if two jobs you finish in the same week share a name (say "Shopping" twice), the next week's Daybook page broke, and the app opened on "Something went wrong" every time.
- **A quick double tap on Delete** could delete a second job, or lose the Undo.
- **The job editor could delete the job of a delve that was running.** Its name then turned into a code.
- **A delve that ended while you were typing** wasn't shown until the next time the app started.
- **Smaller fixes:**
  - "Let it go" had no Undo;
  - struck-off lines came back if you edited the list mid-delve;
  - long words ran off the screen;
  - Save with an empty name did nothing and said nothing;
  - setting the phone's clock back by hand could jumble the record.

The fixes are in [pull request #56](https://github.com/dniachini-droid/completion/pull/56), which is ready and not merged. **Say "send the fixes" and it goes to TestFlight.**

### 2. The story is still paced by calendar weeks, through Keys → **my recommendation: option C**
You decided the story is one continuous story, unlocked by work. The tester found one thing still holding it to the calendar:
- Many places wait for a **Key**, and Keys only come from keeping up your repeating jobs, **at most 5 a calendar week**.
- In a simulation, working 8 hours a day for three weeks got **no further** into the story than working 3 hours a day. On 19 of 21 days, the extra work showed no next place.
- When a Key finally came, several places arrived at once.

The options:
- **A:** Keys can also be earned by minutes, past the day's work.
- **B:** a repeating job's Key counts from its sessions, not the calendar week.
- **C:** **places behind a Key can be reached on foot, by minutes; the Key opens only the extra behind them (a sealed door, a side room).**
- **D:** keep it as it is.

**Why C:**
- It makes the story truly "unlocked by work", as you said.
- It still makes keeping up your repeating jobs worth something.
- It never lets small tasks farm Keys.

This is your call: it's a balance question (rule 20).

### 3. Tidy the UI, in three steps → **my recommendation: do step 1 now, then step 2**
- **Step 1, small polish (about 1–2 days):**
  - The Daybook's **"Next week"** heading becomes "Further on", and its pages are titled by dates, not "Week one, Week two". Both follow your one-story decision.
  - The **"ENOUGH"** label at a delve's end goes, as does "a delve" printed on every row.
  - **Settings moves out of the Daybook,** to the Week's links or a small gear on Today, and you can change the bedtime there.
  - The **story text at a delve's end** no longer runs almost to the phone's edge.
  - **Tonight** moves above the list near bedtime.
  - **One calendar picker** everywhere.
- **Step 2, one place for every job (about a week):**
  - "Choose a delve" merges into the **Satchel**, which becomes the one list of everything not on today: *no day yet*, then *repeating*.
  - "Something else…" and "Keep going" open it.
  - Three lists become one.
- **Step 3, one job menu (2–3 days):** a long press on any job, anywhere, gives *Delve · Edit · Put on a day · Delete*. So the job editor is one touch away from every job, and Delete no longer looks like every other link.

### 4. Make the day's finish line clear → **my recommendation: yes (small)**
- Today still says "the day's work is done" at a hidden count (3 jobs, or fewer if you open the app late). The UI review saw it say "done" while a job was still to come at 18:00.
- **The change:** "done" means *every job on today's list is done* (or what the Week planned).
- **One quiet line after that:** *"Anything more takes you deeper."* That way you know that doing more brings the deep moments.

### 5. Productivity: two small, invisible wins now; one big bet when you name a project

**Small, now (about a session each):**
- **Tonight: tomorrow's first job, and "anything on your mind?"**
  - At bedtime, one tap picks tomorrow's first job, and a box drops thoughts into the Satchel.
  - In the morning there's nothing to decide.
  - A good trial found that writing tomorrow's to-do list at bedtime helped people fall asleep about 10 minutes faster.
- **The planner learns your real minutes and your good hours** from your delves, with nothing to fill in. Weeks stop being quietly too full, and the job you put off lands at an hour you actually start things.

**The big bet: Great Works** (when you can name a real project):
- Name a project (the Course, Spanish, the tank) and give it a few milestones in your own words. Only the next step ever shows.
- The minutes you put in slowly open something new in the world: a new *ability*, not a number.
- It's the strongest-evidenced idea and fits the game best. It needs one or more real multi-week goals from you.

**Later, once you've played a few weeks:**
- **Start from anywhere:** a lock-screen or widget button that begins your next delve.
- **When–then cues:** "after the gym → Spanish".

**Not recommended**, because the research and the apps people abandon agree:
- an AI that plans your day;
- an hour-by-hour grid;
- streaks, charts, or anything social.

## One open item from last night
The Safari-engine test browser used in the online checks crashes at the end of a delve, now and then, on Linux only. No crash has been seen on your phone. For now those delve checks run in the Chrome engine instead. **If a delve's end ever freezes or closes the app on your phone, tell me at once.**

## Questions only you can answer

1. **Send the bug fixes to TestFlight now?** (I recommend yes.)
2. **The Keys and the story's pace:** A, B, C or D? (I recommend C.)
3. **UI tidy:** go ahead with step 1? And step 2, merging "Choose a delve" into the Satchel?
4. **The finish line:** "done" = today's list is done, plus the "Anything more takes you deeper" line?
5. **Tonight's "tomorrow starts with…" and "anything on your mind?":** yes?
6. **Great Works:** which real projects would you put in? The Course? Spanish? The tank? Something else?
7. **Do you wear an Apple Watch,** and would a "Begin next delve" button on your lock screen help, or feel like being watched?
