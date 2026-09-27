# Scope: onboarding, an empty start

> Stage 4 of the productivity track (`product/PRODUCTIVITY_PLAN.md`, D-107). Docs only; nothing is decided until Dan chooses. Spoiler-free.
>
> **The condition comes first:** this is only worth doing if someone other than Dan will use the app. `MASTER_BRIEF.md` §78–81 and `ANTI_FEATURES.md` exclude "broad onboarding" because the app is built for Dan, not a market.

## 1. What it is and why
- **The finding.** Under "Also noted" in `product/PRODUCTIVITY_REVIEW.md`: "A new user starts with Dan's jobs, and the two starter one-offs can't be deleted."
- **The facts:**
  - The starting set is Dan's own: 8 jobs and 6 rhythms (`app/src/content/world/dan.ts`).
  - The two one-offs ("Order the cat's medication", "Sort the post") can't be deleted today. Stage 2's job editor (4) adds delete, which fixes this for Dan too.
  - The app opens straight onto Today, the morning, or the welcome back (`App.svelte`, `first()`). There is no first-run screen.
- **What onboarding would be.** A first open that doesn't assume Dan's life. It needs an empty or chosen starting set, and just enough explanation to reach a first delve.
- **Unknown.** Whether the story ever assumes Dan's own jobs (the Course, the gym) could only be checked in a sealed session. That check is Claude's job, and it is never shown to Dan.

## 2. What Dan (or a new player) sees, tap by tap (option C)
1. On the very first open, before Today: one painted screen, one sentence about what the app is, and **Begin**.
2. "What repeats in your week?" Up to three lines, each with how often ("3 a week", "Sundays"). There is a **Skip**.
3. "One thing you keep putting off?" One line. It becomes the avoided one-off (P5). **Skip** again.
4. "When do you usually go to bed?" The phone's time wheel. It sets bedtime and the first capacity guess.
5. Today opens, with the first job leading and "I can't start" under it, as Dan's does now.
- Dan's own phone never sees this. His save already has facts, so it is not a first open.

## 3. Rules and facts
- **Facts.** The answers reuse facts that exist: `rhythmSaved`, `itemAdded` (plus Stage 2's "I tend to put this off") and `bedtimeSet`.
- **One new fact** such as `startChosen { set: 'empty' | 'dan' }` records which starting set applies, so `live()` in `core/week.ts` can start from an empty set. It needs a sample save (D-106).
- **Old saves.** A save without the new fact is read as Dan's set, so it still loads as it does now. No save version is needed if the fact is only added (guess; to confirm against `technical/DATA_MODEL.md`).
- **Rule tests with an empty set:** Today with no jobs; Plan my week with nothing to plan; the story's pace and Keys with no rhythms. `PLANNER.md` says the story's pace doesn't depend on the number of rhythms, but "zero" has never been tested.

## 4. Native work and Apple permissions
- None in the app.
- Outside the app: other people's phones need **TestFlight external testing**, which needs Apple's beta review, or each person added as an internal tester (`technical/APPLE_SETUP.md`).
- The privacy notes (`technical/SECURITY_PRIVACY.md`) would need a line for other people's data, even though it stays on their phones.

## 5. Risks
- **The calm.** Onboarding questions can feel like a form. So: at most three, each skippable, with no progress dots ("step 2 of 4") and no tutorial overlay.
- **Rule 16.** After the last question, Today must show one obvious next job. An empty set with nothing to suggest would break this, so an empty day needs one line of its own ("Add one thing for today").
- **Productivity theatre (rule 11).** Setting up a system before playing is exactly what P9 warns against. Keep it under a minute.
- **Earn complexity (rule 12).** For Dan alone this is pure cost. It is also a new promise: other players mean other people's bugs and saves to look after.

## 6. Effort and options for Dan
- **A.** Not now: the app stays Dan's. Stage 2's delete fixes the stuck one-offs for him anyway. (Effort: none.)
- **B.** A hidden "Start empty" choice for a tester: an empty set, and Today says "Add what repeats". (S, about half a session.)
- **C.** The three-question first open above. (M, about one session, plus the TestFlight setup for testers.)
- **D.** C, plus a short guided first delve and an explanation of the world, the map and the satchel. (L, two or more sessions, and some of it touches the story's opening, which goes through the sealed process.)

**Claude's recommendation.** A, unless you can name a real person who will use the app soon. If you can, B first: it is the cheapest honest way to see whether the app works for someone else before building a proper welcome.

## 7. Questions only Dan can answer
1. Is there anyone (a friend, your psychologist, someone with ADHD) you would like to try the app, and when?
2. If so, should their app be the same world and story as yours, or is the story yours alone?
