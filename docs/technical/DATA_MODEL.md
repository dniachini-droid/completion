# Data Model

> Phase 7. What the app stores and in what shape, for the MVP (`product/MVP.md`) on the chosen stack (D-057, D-058). Built on the fact log in `ARCHITECTURE.md`. Names are the design words; the in-world names are in `narrative/TERMINOLOGY.md`. **Spoiler-free: types only, no story content.**

_Status: written 2026-09-24 (D-059). Field lists are a starting shape; Phase 8 refines them with tests._

## Requirement noted before Phase 7 (D-030)
- Jobs, kinds of job and weekly targets are **user data that Dan edits**, never constants in code. The examples in the design docs (gym ×4, Spanish, cooking, meal prep, the course, the cat's medication) are only the first set he gave. The rules that lean towards avoided jobs (P5) and the course's one-hour rule must work on whatever he sets, e.g. a job kind he marks as "I tend to put this off".

## Three kinds of data
| Kind | Examples | Who changes it | Where |
|---|---|---|---|
| **Dan's own** | rhythms, one-offs, satchel items, appointments, settings | Dan, on request only | the save, on the phone |
| **What happened** | the fact log | the app, as things happen | the save, on the phone |
| **Authored** | places, records, copy, paintings | Claude, per build | inside the app, read-only |

The save never contains authored content, only its ids. The app never changes authored content.

## Dan's own data
**Job** (anything Dan does: a rhythm's session, a one-off, a satchel item, an appointment)
- `id`, `name` (the only required field)
- `delve`: yes / no (Dan's choice, D-041; a first guess offered for new jobs)
- `length` in minutes (default 25), `enoughAt` in minutes (delve rhythms only; default all of it; the Course 60)
- `avoided`: "I tend to put this off" (D-030, P5)
- `doneBy`: *enough reached* (repeating delves) or *Dan says done* (one-offs, no-timer jobs) (`PLANNER.md`)
- `dueDate` (dated satchel items), `time` (makes it an appointment)
- `someday` (quietly set after about 3 weeks untouched; never announced)

**Rhythm** (what repeats; `PLANNER.md`)
- `id`, the job it makes, `how often`: *N a week* | *set days* | *every 2 weeks*, `startsCounting` (its next full week, D-043 F7), `stopped` (Stop repeating: future only)

**Plan entry**: `job`, `day`, optional `time`. Planned, moved and removed are recorded as facts; never shown (D-045).

**Settings**: bedtime chosen; default delve length; the day's edge stays 04:00 (not a setting in the MVP).

**Preloaded:** Dan's starting set (`PLANNER.md` → "Dan's starting set"), all editable.

## The fact log
Each fact: `seq` (order), `at` (timestamp with the phone's time zone), `gameDay` (by the 04:00 edge), `type`, and its few fields. Appended, never edited.

**What Dan did**
| Type | Fields |
|---|---|
| `capacityChosen` | Low / Normal / High, suggested value |
| `jobBegun` | job, from: *app* (Begin) or *record* (Done without Begin; the test's sharpest line) |
| `delveStarted` | job, minutes, how many delves in the run (the later ones start by themselves and are worked out, not written; D-064) |
| `delveHeld` / `delveResumed` | job, minutes done, minutes left |
| `delveEnded` | job, minutes counted, how: *ran out* / *finished here*, the run it ends |
| `breatherSkipped` | — |
| `jobDone` | job, minutes (if timed) |
| `cantStartUsed` | job; whether a job began within 30 minutes is worked out, not stored |
| `swapped` | from job, to job |
| `bedtimeTapped` | time |
| `planChanged` | added / moved / removed / planned-by-app, job, day, time |
| `jobEdited` / `rhythmEdited` | what changed (so rules read the right version at any date) |
| `markCut`, `signGuessed` | mark, guess |
| `opened` | the app was opened (no screen tracking beyond the test's list) |
| `worldItemOpened` / `worldItemSkipped` | arrival or record id (test: opened or skipped past) |
| `seen` | a step or an arrival looked at (the heart slice's form of the above, D-064) |
| `passedDateAnswered` | item, Done / New date / Let it go |

**What the world gave** (worked out once, then kept)
| Type | Fields |
|---|---|
| `stepsGained` | minutes (a step is 25), the job, the run if from a delve. A run's steps belong to the game day the run began |
| `dayCompleted` | — (the day's lock-in, written once; D-064) |
| `arrived` | place or camp id |
| `recordShown` | fragment id |
| `keyEarned` | rhythm met or the floor; `keySpent` | sealed thing id |
| `findGiven` | find id, why (avoided job, switching, side chamber, camp, beyond supply) |
| `signLearned`, `wordCut` | ids |
| `trailMarker`, `relicGiven` | count, relic id |
| `storyWeekAdvanced` | story week |
| `weekClosed` | which lines were shown |

## What's worked out, not stored
Today's jobs and the one that leads; the day's size and whether it's complete; where Dan is on the map; the story week and what's due next; Keys left (never shown, UX 6); this week's plan; the forecast; the week close; "where you were"; the test summary. All from the log + content + rules + clock. Nothing of this is saved: a year of play works out in about 15 ms, so no snapshot is kept (D-106).

## Authored content (types only)
Each item has a **stable id** that never changes once shipped, its **copy keys**, and **when it may appear** (story week, order, what must come first).
| Type | Holds |
|---|---|
| Place | name, line, painting id, where it sits on the route, optional thing to look at |
| Camp with a view | the thing to look at, painting id |
| Record fragment | the life it belongs to, text keys, marks it contains |
| Sealed thing | what a Key opens, what it gives |
| Sign / mark | its shape, candidate meanings, the right one |
| Word | its marks, its cinematic |
| Find | what it is, where it can come from |
| Passage line | route stretch, reusable |
| Teaser | the "I can't start" line, from just ahead |
| Week-close lines | "learned" lines, the month's "so far" |
| Painting | baked image, its live layers |
| Copy | key → sentence (D-046) |

## Versions and migrations
- The save carries a **save version** and the **content version** it last ran with.
- Each change to the save's shape comes with a **migration**: a small function from version N to N+1, run once on open, after a backup copy is written. Old facts are never rewritten in meaning; new fact types are added.
- A content id is **never reused**. Retired content stays readable in old facts (MASTER_BRIEF §55: no casual retcons).
- Every save version ever shipped keeps a sample save in the tests; all must still open.

## Backups
- iCloud's phone backup includes the save (app storage).
- **"Save a copy"** (a quiet setting): writes the save to Files as one file; **"Load a copy"** restores it, after a confirm.
- Before any migration, the app writes its own copy of the previous save.

## The test summary (`product/MVP.md`)
A set of questions asked of the log at the end of the test (starts from the app vs recorded, avoided jobs, "I can't start" followed by a job, gaps and returns, planned / moved / done, opened or skipped). Shown to Dan on the phone; shared only if **he** exports it.
