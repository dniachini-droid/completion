# Productivity review: the app judged as a productivity and planning tool

> Asked for by Dan, 2026-09-27: an independent review of the app **purely as a productivity app**, ignoring the project's own rules and goals. What would reviewers rate it, and what do the most successful apps have that would make it more useful? **Spoiler-free:** the reviewers never opened the sealed folders and quote no story text.
>
> Nothing here is decided yet. Several recommendations reverse earlier decisions on purpose (marked **⚑ reverses D-xxx / anti-feature**). Dan chooses; each choice is then recorded in `DECISIONS.md`.

## How the review was done
- The first playable was built and walked at phone size: 77 screens over about a week of simulated play.
- Five separate reviewers each looked at the screens and the code through one lens:
  1. **App-store critic.** Rated it against Todoist, Things 3, TickTick, Structured, Tiimo, Sunsama, Finch, Habitica and Llama Life.
  2. **Feature-gap auditor.** Checked about 45 standard features in the code.
  3. **ADHD coach.** Looked at executive-function support.
  4. **Friction tester.** Drove the real app through 12 everyday jobs and counted the taps.
  5. **Planning-systems expert.** Looked at planning horizons, GTD and weekly review.
- Claude checked the most serious claims in the code before writing them here.

## The verdict in one paragraph
**About 2.5 / 5 as a general productivity app, and about 3.5 / 5 for adults with ADHD or procrastination.** Every reviewer said separately that it is **the best "get me started" experience they have seen**:
- one next job and one big button;
- "I can't start" with a real first step;
- "enough" as opposed to "everything";
- runs of focus sessions that carry you through the breaks;
- no red, no overdue and no streaks to lose;
- a kind return after days away.

It is **weak at the dull basics every paid planner has:**
- reminders at the right time;
- dates and deadlines;
- anything beyond next week;
- quick capture from outside the app;
- editing any job;
- backing up your data.

The critic's summary: *"A strong starter and a weak organiser. Pair it with a calendar and it works; use it alone and things will slip."* The ADHD coach: *"Unusually strong in the moment, and weak at anything that depends on remembering at the right time, which is exactly the part ADHD makes hardest."*

## Scores by area

| Area | Score | In short |
|---|---|---|
| Starting a task | 7/10 | One job, "I can't start", a first step. Only the 8 starter jobs have first steps. |
| Staying focused / transitions | 8/10 | Runs of delves, automatic breathers, pause, the lock-screen panel. |
| Emotional safety (shame, overwhelm) | 9/10 | Best in category. |
| Recovering after a bad day or week | 8/10 | The welcome back and a lighter day. |
| Today | 4/5 | Strongest screen. |
| The week | 3/5 | Good one-tap first draft. Can't re-plan mid-week, and only two weeks exist. |
| Capture / inbox | 2.5/5 | Pasting a list works. Nothing from outside the app; lines have only a name. |
| Recurring life admin | 2.5/5 | Only N a week, set weekdays or fortnightly. Nothing monthly or yearly. |
| Remembering at the right time | 2/10 | Only the end of a focus timer ever alerts. The 18:00 lesson never does. |
| Reflection / review | 1.5/5 | The Daybook looks back. Nothing helps plan forward. |
| Deadlines | 0.5/5 | No date field exists anywhere. |
| Months, goals, projects | 0.5/5 | Nothing above a single job. |
| Data safety | Poor | One phone. No export. The only safety net is iCloud device backup, if it is switched on. |

## What it does better than the category leaders
- **One next action, the avoided one first.** Todoist and Things show a wall of tasks. This app names one, and puts the one you're putting off first. Closest rivals: Llama Life and Tiimo's "now" card.
- **"I can't start" on the main screen.** It offers a physical first step, then "try ten minutes". Goblin Tools and Tiimo have task breakdown, but no major planner puts this on its opening screen.
- **Flexible habits done properly.** "4 a week, spread out" is something Streaks and Habitica can't express, and Todoist can only fake it.
- **A gentle auto-planner.** Appointments go first, sessions are spread across the week, each day has a cap, and missed work never snowballs. This is a softer version of Sunsama's workload guard.
- **Focus timer with a finish line.** "Enough by around 09:55", the lock screen and the Dynamic Island. An interruption never wipes progress, where Forest kills your tree.
- **The end of the day and the week.** "It was enough" is the healthiest day-complete screen in the category. Bedtime is part of tomorrow's plan, which is rare and useful.
- **Craft.** The paintings, type and haptics are better than anything reviewed except Finch and Structured.

## Bugs and traps found
These are bugs rather than missing features, and Claude confirmed each one in the code.
1. **Adding one item to a day can wipe that day's habits off Today.**
   - A single hand-added entry (for example, a dentist appointment next Tuesday) makes the app treat the whole week as "planned" (`core/week.ts:81`).
   - On a planned week, Today shows only the plan (`core/game.ts:151-161`). So that Tuesday shows only the dentist, and the gym, Spanish and the Course are gone.
   - **This is the most serious trust problem found.**
2. **The cat-medication job's first step pauses its own timer.** It is a timed job whose first step is "open the vet's page on your phone". Going to another app pauses the delve.
3. **A stopped rhythm can come back.** Its job can reappear as a one-off until it is done once, and it stays in the "Choose a delve" list for good.
4. **Ticked satchel lines never leave.** They keep taking the first 5 visible spots.
5. **A tap on a timed row starts the timer**, even when you only wanted to mark it done. There is no way to say "did it yesterday".

## Recommendations, ranked by real-world usefulness
Effort: **S** = hours to a day · **M** = a session or two · **L** = several sessions or native iOS work.

### Tier 1: the basics (do these first)
| # | Change | Effort | Who does it best | Notes |
|---|---|---|---|---|
| 1 | **Fix the planned-week bug (bug 1)**, so a hand-added item is an extra, not a takeover | S–M | n/a | Bug |
| 2 | **Reminders for things with a time**: appointments, the lesson, a bedtime nudge. Opt-in for each item, one alert with "again in 10", in the app's calm voice. Never "you haven't opened the app". | S–M (the notification plumbing already exists) | Things 3, Structured, Due | **⚑ reverses "no notifications"** (MVP test design, anti-features) |
| 3 | **Save a copy / restore**: export the save to Files or iCloud Drive, automatically once a week, plus a button | S (manual), M (automatic) | Things Cloud, Structured | Protects everything else |
| 4 | **Edit any job**: rename, length, delete (with undo), "I tend to put this off", and a first step for every job, including new ones. Also allow editing the satchel's lines. | S–M | Things 3 | Keeps "I can't start" and the avoided-job reward alive as the real list drifts away from the starter set |
| 5 | **Dates and deadlines**: a "by" date on satchel lines and one-offs. The planner works back from the date. Dated lines never fall into Someday. A passed date asks "Still needed? · New date · Let it go", with no red. | M | Todoist, TickTick | Designed in `PLANNER.md` but never built |
| 6 | **Monthly, yearly and "every N days" repeats**: rent on the 1st, birthdays, renewals, haircuts | S–M | Todoist | Covers most of life admin |
| 7 | **One-tap capture on Today**: "+ Add" writes to the satchel. The text box opens already focused. | S | Things quick entry | 4 taps become 1–2 |
| 8 | **A timer that tolerates the job's own apps** (a grace period, or "this job uses my phone"), plus 5, 10, 15 and 90-minute lengths | S | Llama Life, Flow | Fixes bug 2 |

### Tier 2: from a helper to somewhere you can run your life
| # | Change | Effort | Who does it best | Notes |
|---|---|---|---|---|
| 9 | **Read-only calendar import** (Apple/Google through iOS). Events show as fixed points in the Week and on Today, and busy days get a smaller plan. | M–L | Sunsama, Structured, Akiflow | The single biggest step from "blind" to "credible" |
| 10 | **Home-screen and lock-screen widget**: "Next: …", one tap to start, and + to capture. Also a share-sheet and Siri "add to satchel". | M–L (native) | Structured, Things | Keeps the app in view without a notification |
| 11 | **Plan by minutes, not job count.** A Course, gym and Spanish day is not the same as three 5-minute errands. Show a faint "about 2 h" on each day. | S–M | Sunsama | |
| 12 | **"Lay out the rest of the week"** after a plan exists, for a disrupted Tuesday | S | Motion (continuous) | |
| 13 | **A chosen lighter day**: pick Low / Normal / High yourself on the first open, with the suggested one pre-selected | S | Finch | **⚑ touches** "no mandatory check-in" (it stays optional) |
| 14 | **A note on each job**, including one saved at "Finish here" ("stopped at module 3, video 2") and shown next time as the first step | S | Llama Life, Things | |
| 15 | **"Already done" / "did it yesterday"** without starting a timer | S | every to-do app | **⚑ reverses D-089** ("Already done" removed) |
| 16 | **"What slipped" in one line** after an absence: a missed appointment or a passed date | S | | |

### Tier 3: bigger ideas that also feed the game
| # | Change | Effort | Who does it best | Game hook |
|---|---|---|---|---|
| 17 | **Projects as "expeditions"**: a named goal with a target month and ordered steps. Only the next step is offered (GTD's "next action"). The Daybook shows plain counts per expedition. | L | Things projects, Todoist | The richest hook: real long-term goals get weight in the world, with side chambers and a set-piece arrival at the end |
| 18 | **A 90-second weekly review in the Daybook**: sweep old satchel lines, see what's coming (appointments, dates, monthly items), pin "what matters most", then "Plan it for me". Skippable. | M | Sunsama, GTD | Could be the camp scene. It rewards doing the review, never the week's results |
| 19 | **"Make it smaller"**: break a job into 3–5 tiny steps (suggested, and editable), shown one at a time | M | Goblin Tools | |
| 20 | **A month view**: deadlines, yearly and monthly items, and expedition dates ahead | M | | |
| 21 | **An optional hour-by-hour view of today** | M–L | Structured, Tiimo | **⚑ against** "no time-blocking" |
| 22 | **Body doubling**: a link out to Focusmate for a delve, or an in-world companion | M–L | Focusmate | |
| 23 | **An opt-in re-entry nudge**, at most once a week and only after silence | S | Finch | **⚑ reverses "no notifications"** |

### Also noted
- **Accessibility.** There is no Dynamic Type (text sizes are fixed), the app is dark mode only, and several screens have no VoiceOver labels. The Week and Satchel screens have dim grey text.
- **No search.**
- **No onboarding.** A new user starts with Dan's jobs, and the two starter one-offs can't be deleted. This only matters if anyone else will ever use the app.

## Where the reviewers pushed back on the design itself
These points challenge earlier choices directly, so Dan should weigh them rather than Claude.
- **"No notifications at all" is the app's biggest real-world risk.** All five reviewers said so. It is why an appointment can be missed, and why a bad week can become a lost month. The suggestion is not nagging: opt-in, one-shot reminders only for things Dan gave a time.
- **No history or stats.** Reviewers accept this for emotional safety, but note that it leaves no feedback loop for improving the plan itself.
- **Reading between jobs.** The story screens are charming in week 1. Productivity reviewers expect them to feel like a toll by week 4 for someone who just wants "tick, next". An "I'll read it later" option would keep both.

## A suggested order
1. Tier 1, items 1–8, in about 2–3 sessions. These are mostly small, and they fix the risks (missed appointments, lost data, a trust-breaking bug) without touching what makes the app distinctive. The critic estimates they move it to about **3.5 / 5 overall and 4 / 5 for ADHD**.
2. Calendar import and the widget (items 9–10).
3. Expeditions and the weekly review (items 17–18). These are where productivity and the game strengthen each other.
