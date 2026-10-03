# The week planner

> The scheduler Dan asked for (D-020, made central 2026-09-24). Built from `product/SCHEDULER_PROPOSAL.md` and two outside reviews (`product/SCHEDULER_REVIEW.md`, D-045, D-047). Mock-ups: `design/directions/d-combined/week.html`, `rhythms.html`, `today-planned.html`, and the Course run in `delve-set.html` / `delve.html`. Spoiler-free.

_Status: **locked: approved by Dan** (2026-09-24, D-048). Changes follow the usual rule: a new decision in `DECISIONS.md`._

**In one breath:** the plan is a forecast; action creates progress; enough is real; more remains valuable. A three-hour Course plan never makes one good hour feel like failure.

## Four rules
1. **The plan is a forecast, not a promise.** It can change at any time, for free, and nothing is lost when it does.
2. **Planning predicts progress; action creates it.** Planning, moving or rearranging earns nothing (P16). Only real action moves Dan.
3. **The app proposes, Dan edits.** "Plan my week" does the work; Dan changes what looks wrong (P9).
4. **Enough is fixed before more begins.** Each rhythm has one number that is enough; anything beyond it is more, which always counts and is never expected (P2, D-011, D-044).

## Rhythms: what repeats
Every rhythm is **Dan's own input**. He can add, change or delete any of them at any time (D-030). A rhythm is:
- **what** (a name; that's the only required field);
- **how often**: *N times a week*, *on set days* (Sundays), or *every 2 weeks*. Monthly comes later;
- **how long each time** (optional, default 25 minutes): the room the planner gives it, and the steps a job without a timer earns (D-037);
- **enough at** (only for a rhythm run as delves; optional, default *all of it*): the point where a session counts. The Course is preloaded at 1 hour of its 3 (Dan, D-047);
- **a time** (optional): this makes it an appointment, like the Spanish lesson on Thursday at 18:00;
- **delve or not**, as for any job (D-041).

**No ranges.** One number is enough. A third Spanish session is simply more.

**When a session counts (D-121, replacing D-047's "each job's own enough"; every job is a delve, D-117):**
| How the job runs | Example | It counts when… |
|---|---|---|
| **Repeating** | Gym, Course, Spanish, Tank clean | a delve on it ends (Finish here, or it runs out) with at least one whole minute: that is the day's session, credited with the minutes run. Every job opens at one 30-minute delve and Dan sets the rest; a job's minutes only set its room in the plan (D-124: no "enough at"). A session under 5 minutes meets the rhythm but brings no story step, find or Key and doesn't count towards the day (rule 10) |
| **One-off** | the cat's medication | Dan says it's done ("Is it done?" at the delve's end, or "It's done" on Today, D-036, D-120); a job said done with no minute delved earns nothing (D-117) |

Everything past enough is **more**: it moves Dan in full, uncapped (D-044), and is never shown as owed.

**The Course day (Dan, D-047).** A Course day counts once its **first hour** is done (two delves of 25; any 50 minutes of delves, as P5). The planned 3 hours are **room, not the bar**. The interaction contract:
1. **Planned:** the week and Today show it as "1 h · room for 3", never "3 hours · six delves".
2. **Begin** opens the run set to the hour. The run line carries a small gold **enough** mark; if Dan sets a longer run, the line reads "enough around 10:25 · ends 12:25".
3. **The hour is its own moment:** "Course session complete. Enough for today." It counts for the rhythm and the day, and Today shows the Course as done ("enough · more if you like"), not as two hours still to go.
4. **Stopping there is a full success.** Continuing is always an explicit choice: **Continue** and **Back to today** sit side by side with equal weight. Continue carries on into the day's remaining room, as more. If Dan set a longer run before Begin, the enough moment still appears; the run then carries on by itself as he set it (D-037), with Finish here beside it.
5. **Past enough, the words say "more"** ("more · the third delve"), never "the third of six". Nothing counts down the planned remainder.

**Keys.** Meeting rhythms earns the period's Keys. **Invariant (D-047): adding rhythms never raises the most Keys a period can usefully give** (`ECONOMY.md`). Each period has a bounded Key supply set by the game, not by the number of rhythms; rhythms are how Dan earns it. Once it is used up, more real effort still pays in full through steps, distance, finds, side chambers and the deep route. A new rhythm, or a changed number, counts from its next full period (D-043 F7); it can be planned straight away. The core story's pace does not depend on how many rhythms exist (D-035, D-043 F6). Step 3 sets the numbers.

**Dan's starting set** (preloaded, all editable; his own numbers, 2026-09-24):

| Rhythm | How often | Each time |
|---|---|---|
| Gym, then the sauna | 4 a week | about 1 h |
| Spanish study | 2 a week | 1 h |
| Spanish lesson | Thursdays, 18:00 | 1 h |
| Course | 4 a week | 3 h of room; enough at 1 h |
| Tank clean | every 2 weeks | 1 h |
| Meal prep | Sundays | — |

## The week (on request only)
- Opened from Today and the map ("Week"). It is never the opening screen, never prompted and never required. **Without a plan, Today works exactly as before.**
- It shows **this week**, one row per day: each day's jobs in plain words, with a time where one is set. **Next week** is a quiet link (and the Sunday offer). No hour grid; no tray of unplaced jobs.
- **Plan my week** (one tap) lays out the week's rhythms using fixed rules: appointments and set days first; the same rhythm spread across days (no gym two days running where it can be avoided); no day above Normal size; one lighter day; no two long jobs of the same kind on one day; avoided jobs early in the week. No learning in the first version.
- **Editing:** tap a job to move it to another day, give it a time, or take it off this week. Add a one-off or an appointment by typing one line. No confirmations and no history shown. A normal planning session should take a couple of minutes. The question is "does this week look roughly right?", not "how do I build my schedule?".
- **Stopping a rhythm:** "Stop repeating" in the rhythm's editor. It ends future sessions only; what was done stays done. No confirmation.
- **The past shows only what was done.** A planned job that didn't happen leaves no trace on its day.
- **The forecast:** one line in the world's terms says where the plan points ("Current forecast: the Salt Gallery around Thursday"). Planned days show as waypoints on the map's route ahead, marked *forecast*. The words are predictive, never contractual: "around", not "by"; never "if the plan holds" (D-047). The forecast changes with the plan; only doing things moves Dan.
- **Sunday:** the daybook's week close may end with one quiet offer, "Plan next week? · Plan it for me · Not now". It is never repeated, never a notification, and never needed.

## How the week drives Today
- **Today starts from today's plan** (a job with a time leads as that time nears), topped up by the usual suggestion to fit capacity.
- **Capacity overrides the plan** (P3). On a Low day, Today is a Low day: appointments stay (P10), and the other planned jobs are released. Today says only "A lighter day." It never narrates where released jobs go (D-047); that shows only if Dan opens the week.
- **No catch-up avalanche.** A released job is re-placed only on a later day still below its Normal size; otherwise it falls away. A disrupted week becomes a lighter week (D-038).
- **Off-plan counts in full.** A job done on another day, at another time, or unplanned earns exactly what it would have on plan. There is no bonus for keeping to the plan.
- **The plan never holds more of a rhythm than its enough.** Once the week's enough is met, remaining planned sessions quietly leave the plan; Dan can still do more. That rhythm also stops leading Today's suggestion for the week (P5). A **"times a week"** job (not set days) whose number is met leaves Today, the evening's "Tomorrow starts with" and its reminders for the rest of the week, and comes back on Monday; it stays in the Satchel, and starting it again by hand puts it back on Today (D-149).
- **A recurring job's week is shown** under its row on Today and in the Satchel: one thin notch per session its week asks for, each session done lighting one (gold on a day it is done), all dark again on Monday; VoiceOver hears "3 of 4 this week". Only for rhythms counted by the week (N a week, set days) (D-149).
- Swap, "I can't start", the one next job, and "only today's jobs on the opening screen" are unchanged.

## What the planner tells apart (from what Dan types, never a category)
| Kind | How it's recognised | Behaviour |
|---|---|---|
| **Rhythm** | Set up as repeating | Planned by "Plan my week"; falls away at the period's end |
| **Appointment** | Has a time | Fixed; stays on a Low day; counts as a main job (P10) |
| **Deadline** | Has a "by" date (a dated satchel item) | Suggested as the date nears; the passed-date question as in D-038 / D-043 |
| **One-off** | A typed line | Flexible; the satchel's rules |

## What the app keeps
Planned, moved and done are kept internally, so the planner can improve later and the first playable's test notes are honest. They are **never shown by default**: no adherence, no percentages, no "rescheduled 3 times", no planning streak, no scoring.

## First playable
**In:** rhythms (N a week, set days, every 2 weeks, optional length, enough and time); This week with Plan my week; tap to move, set a time or remove; add a one-off or appointment; Today from the plan with capacity on top; the forecast line and map waypoints; the Sunday offer.
**Later:** drag and drop (if Phase 7 finds it cheap, sooner), monthly rhythms, advanced recurrence, Google Calendar (read, then write), learning from how Dan edits, planning beyond next week, adherence analytics (probably never), an "explain why".

**Readability:** Dan opens the mock-ups on his own phone and checks the quiet text (done, one-off, times, italic lines, the footer, the forecast) is easy to read half-awake at normal distance. At true size in the browser (360×780 and 390×844) it is, and every quiet colour measures 6:1 or better against the scene (D-047).
