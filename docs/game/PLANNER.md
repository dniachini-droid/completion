# The week planner

> The scheduler Dan asked for (D-020, made central 2026-09-24). Built from `product/SCHEDULER_PROPOSAL.md` and the outside review (`product/SCHEDULER_REVIEW.md`, D-045). Mock-ups: `design/directions/d-combined/week.html`, `rhythms.html`, `today-planned.html`. Spoiler-free.

_Status: **draft for Dan** (2026-09-24). Locks when Dan approves these rules and the mock-ups._

## Four rules
1. **The plan is a forecast, not a promise.** It can change at any time, for free, and nothing is lost when it does.
2. **Planning predicts progress; action creates it.** Planning, moving or rearranging earns nothing (P16). Only real action moves Dan.
3. **The app proposes, Dan edits.** "Plan my week" does the work; Dan changes what looks wrong (P9).
4. **Enough is fixed before more begins.** Each rhythm has one number that is enough; anything beyond it is more, which always counts and is never expected (P2, D-011, D-044).

## Rhythms: what repeats
Every rhythm is **Dan's own input**. He can add, change or delete any of them at any time (D-030). A rhythm is:
- **what** (a name; that's the only required field);
- **how often**: *N times a week*, *on set days* (Sundays), or *every 2 weeks*. Monthly comes later;
- **how long each time** (optional, default 25 minutes): this sets the run of delves the planner schedules and the steps the job earns (D-037);
- **a time** (optional): this makes it an appointment, like the Spanish lesson on Thursday at 18:00;
- **delve or not**, as for any job (D-041).

**No ranges.** One number is enough. A third Spanish session is simply more.

**When a rhythm counts.** Each session counts when its job is done. For a job measured in time, that's once the first hour is done (P5), or its full length if that's shorter. The rest of a long session is more: it moves Dan and is never "missing". *For Dan: is a 3-hour course day done at 1 hour (recommended) or only at 3?*

**Keys.** A rhythm met in its period earns a Key (weekly, or fortnightly). A new rhythm, or a changed number, counts for Keys from its next full period (D-043 F7); it can be planned straight away. The core story's pace does not depend on how many rhythms exist: extra Keys open side things, never the core ahead of order (D-035, D-043 F6). Step 3 sets the numbers.

**Dan's starting set** (preloaded, all editable; his own numbers, 2026-09-24):

| Rhythm | How often | Each time |
|---|---|---|
| Gym, then the sauna | 4 a week | about 1 h |
| Spanish study | 2 a week | 1 h |
| Spanish lesson | Thursdays, 18:00 | 1 h |
| Course | 4 a week | 3 h |
| Tank clean | every 2 weeks | 1 h |
| Meal prep | Sundays | — |

## The week (on request only)
- Opened from Today and the map ("Week"). It is never the opening screen, never prompted and never required. **Without a plan, Today works exactly as before.**
- It shows **this week**, one row per day: each day's jobs in plain words, with a time where one is set. **Next week** is a quiet link (and the Sunday offer). No hour grid; no tray of unplaced jobs.
- **Plan my week** (one tap) lays out the week's rhythms using fixed rules: appointments and set days first; the same rhythm spread across days (no gym two days running where it can be avoided); no day above Normal size; one lighter day; no two long jobs of the same kind on one day; avoided jobs early in the week. No learning in the first version.
- **Editing:** tap a job to move it to another day, give it a time, or take it off this week. Add a one-off or an appointment by typing one line. No confirmations and no history shown. A normal planning session should take a couple of minutes.
- **The past shows only what was done.** A planned job that didn't happen leaves no trace on its day.
- **The forecast:** one line in the world's terms says where the plan would take the expedition ("If the week goes like this: the Salt Gallery by Thursday"). Planned days show as waypoints on the map's route ahead. The forecast changes with the plan; only doing things moves Dan.
- **Sunday:** the daybook's week close may end with one quiet offer, "Plan next week? · Plan it for me · Not now". It is never repeated, never a notification, and never needed.

## How the week drives Today
- **Today starts from today's plan** (a job with a time leads as that time nears), topped up by the usual suggestion to fit capacity.
- **Capacity overrides the plan** (P3). On a Low day, Today is a Low day: appointments stay (P10), and the other planned jobs are released.
- **No catch-up avalanche.** A released job is re-placed only on a later day still below its Normal size; otherwise it falls away. A disrupted week becomes a lighter week (D-038).
- **Off-plan counts in full.** A job done on another day, at another time, or unplanned earns exactly what it would have on plan. There is no bonus for keeping to the plan.
- **The plan never holds more of a rhythm than its enough.** Once the week's enough is met, remaining planned sessions quietly leave the plan; Dan can still do more. That rhythm also stops leading Today's suggestion for the week (P5).
- Swap, "I can't start", the one next job, and "only today's jobs on the opening screen" are unchanged.

## What the planner tells apart (from what Dan types, never a category)
| Kind | How it's recognised | Behaviour |
|---|---|---|
| **Rhythm** | Set up as repeating | Planned by "Plan my week"; falls away at the period's end |
| **Appointment** | Has a time | Fixed; stays on a Low day; counts as a main job (P10) |
| **Deadline** | Has a "by" date (a dated satchel item) | Suggested as the date nears; the passed-date question as in D-038 / D-043 |
| **One-off** | A typed line | Flexible; the satchel's rules |

## What the app keeps
Planned, moved and done are kept internally, so the planner can improve later and the first playable's test notes are honest. They are **never shown by default**: no adherence, no percentages, no "rescheduled 3 times".

## First playable
**In:** rhythms (N a week, set days, every 2 weeks, optional length and time); This week with Plan my week; tap to move, set a time or remove; add a one-off or appointment; Today from the plan with capacity on top; the forecast line and map waypoints; the Sunday offer.
**Later:** drag and drop (if Phase 7 finds it cheap, sooner), monthly rhythms, Google Calendar (read, then write), learning from how Dan edits, planning beyond next week, an "explain why".
