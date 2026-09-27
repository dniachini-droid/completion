# The productivity track: the plan

> Dan, 2026-09-27, after `PRODUCTIVITY_REVIEW.md`: "Let's do all of your suggestions, staged", **except** the timer that tolerates the job's own apps. Leaving the phone pauses a delve, as now (D-094); Dan does jobs like the cat's medication on his laptop. The medium-to-large and big ideas are **scoped first** (with Dan), then built. Decision: **D-107**. Spoiler-free.
>
> **How to use this page.** Each stage runs in its own session, started by the previous one (D-069), on the working branch named in `CURRENT_STATE.md`. A stage is done when:
> - its items are built;
> - rule tests cover the new rules;
> - typecheck and build are clean;
> - the screen walk passes at both sizes;
> - it is committed and pushed, and its line below is ticked. (There is no web link any more: the app is the iPhone app only, D-108.)
>
> Merging into `main` waits for Dan's OK (D-006). Numbers in brackets are the item numbers in `PRODUCTIVITY_REVIEW.md`.

## Ground rules for every stage
- **Keep what reviewers praised.** One next job on Today, no red, no overdue counts, no streaks, a calm voice. Every new line of copy goes in `content/copy/en.ts`.
- **A new fact type needs its sample save.** The typecheck enforces this (D-106). Old saves must still load: add a save version and a one-step upgrade when shapes change.
- **Reminders are only for things Dan gave a time or a date.** Never "you haven't opened the app". The one exception is the re-entry nudge (23), which is only scoped in Stage 4 and only built if Dan says yes.
- **The central test's notes** (`MVP.md`) must be able to tell a start that followed a reminder from one that didn't, and a job recorded as already done from one begun in the app.

## Stage 1: trust and safety (one session) — done 2026-09-27 (D-109)
- [x] **(1) The planned-week bug.** A hand-added week entry (`planAdded`) or a satchel line put on a day must not turn the week into "planned".
  - Today stays as it would be without a plan, plus the added entry.
  - Only **Plan my week** (`planMade`) makes Today follow the plan (D-078).
  - Code: `planOf` / `plannedToday` in `core/week.ts:76+` and `planLeads` / `orderOn` in `core/game.ts:147-170`.
  - Rule tests: one entry added to an unplanned week keeps the day's rhythms on Today, and a planned week behaves as before.
- [x] **(2) Reminders for things with a time.**
  - What gets one: appointments (rhythms or entries with a time), planned entries with a time, and optionally bedtime.
  - **Opt-in per item:** a "Remind me" choice where the time is set, with a lead time of at the time, 15 min or 1 h. Default off, plus one global switch in the Daybook's settings.
  - **One alert per item,** in the app's voice, with an "Again in 10 min" action if cheap.
  - Build: a pure `core/reminders.ts` (what alerts, and when, from the content, facts and now), scheduled by `ui/game.svelte.ts` through `platform.notifier.at` in its own ID range beside the delve alerts. Rescheduled on every change and on start.
  - Rule tests.
  - Record a `reminded` note for the test, only if it can be done without a fact on every alert. Otherwise derive it.
- [x] **(3) Save a copy / restore.**
  - A settings screen (move the rehearsal "TRIAL" controls under it) with **Save a copy**: the save as a JSON file through the iOS share sheet, to Files or iCloud Drive.
  - **Restore from a copy:** read it with `readSave()`, keep the current save aside first, and confirm in plain words.
  - **Automatic:** once a week, write a copy into the app's Documents folder, visible in Files (set `UIFileSharingEnabled` and `LSSupportsOpeningDocumentsInPlace`). Keep the last 4.
- [x] **(7) One-tap capture.**
  - Today gets a quiet "+ Add" that writes a satchel line in one step, with the text box already focused. Pasting several lines works, as in the satchel.
  - The satchel's "Add a line" focuses its box at once (as `Week.svelte:startAdd` does).
  - This is capture only; it never starts a delve.

## Stage 2: edit anything (one session)
> **Running beside Stage 1 (D-110):** the four items below that touch none of Stage 1's files were built on `claude/productivity-app-review-8txb0y` while Stage 1 runs on `claude/productivity-app-review-kazbf7`. The job editor (4), "Already done" (15) and notes (14) wait for Stage 1, because they share its screens and its saved data.
- [x] **(4) Edit any job.** One job editor, opened from What repeats, from the satchel and from a job on the Week. It covers:
  - name, length, and timer or no timer;
  - repeats (optional: "doesn't repeat");
  - **I tend to put this off**;
  - **first small step**;
  - **delete**, with an undo line.
  
  Code and facts:
  - New facts `jobSaved` and `jobRemoved`, folded in `live()` (`core/week.ts:32`).
  - Satchel lines can be renamed.
  - A new job asks for its first step (optional). If it has none, "I can't start" asks "What's the first thing you'd touch?" and keeps the answer.
- [x] **Bug: a stopped rhythm comes back.** Stopping a rhythm that was never done must not leave a one-off behind (`offeredOn`, `core/game.ts:132`). Stopped jobs leave Choose a delve. Rule test.
- [x] **Bug: ticked satchel lines never leave.** A ticked line leaves the list the day after it is ticked (`items()`, `core/week.ts:60`).
- [x] **(15) Already done / did it yesterday** (reverses D-089, Dan's OK 2026-09-27).
  - Any job, timed or not, can be marked done without starting a timer, today or yesterday.
  - Recorded as `jobBegun from: 'record'` + `jobDone` (the test's "logged afterwards"). It earns what a no-timer job earns (BALANCING §1).
  - A tap on a timed row still starts it (D-104). "Already done" sits in the row's swipe or in Choose a delve.
- [x] **(8, lengths only) Delve lengths 5, 10, 15 and 90 min** beside 25/30/45/60 (`RunSet.svelte`), and repeat lengths down to 5 min (`LEN`, `Rhythms.svelte`). Check the step, reward and run rules at the new ends (BALANCING).
- [x] **(14) A note on each job.**
  - One line, editable in the job editor.
  - "Finish here" offers "Where did you stop?" (optional). The answer shows on that job's next Begin, and in "I can't start" as its first step.
- [x] **Starter set:** the cat's medication first step becomes "Open the vet's page on your laptop" (Dan works on his laptop).

## Stage 3: dates and time (one session, maybe two)
- [ ] **(5) Deadlines.** An optional **by** date on satchel lines and one-offs, set with the phone's date wheel. The satchel and the Week show "by Fri 10 Oct" in the quiet italic.
  - **Planner:** Plan my week places dated work first, on the last day with room at least 2 days before the date.
  - **Today:** within 3 days of the date, the job is offered even without a plan.
  - A dated line never goes to Someday.
  - **Once a date passes,** the job asks one question: *Still needed? · New date · Let it go*. There is no red and no count (D-038).
  - **Reminders (from Stage 1):** "Remind me" on a date means the morning of the date or the day before.
  - The Week can page through any week ahead, and "Move to" can reach other weeks.
  - **Game:** finishing dated work before its date may bring a find. It rewards doing the work, never keeping to the plan.
- [ ] **(6) More repeat types.** Monthly (a day of the month, or "the last Friday"), yearly (a date, e.g. birthdays, renewals) and **every N days since last done**. The rules to extend:
  - `sessions` / `need` in `week.ts`;
  - `offeredOn` in `game.ts`;
  - `planWeek` places them like the fortnightly ones.
  
  Yearly items show in the Week two weeks ahead with "Plan it". Each gets a new choice in the editor's "How often".
- [ ] **(11) Plan by minutes, not job count.**
  - Each day has room in minutes, set by capacity (e.g. low 1.5 h, normal 3 h, high 5 h; tune with BALANCING) and optionally per weekday.
  - `planWeek` fills by length, not by the cap of 3.
  - The Week shows a faint "about 2 h" per day. It is a shape, not a score.
- [ ] **(12) Lay out the rest of the week.** Once a plan exists, a quiet link in the Week re-runs `planWeek` from today. It keeps the entries Dan placed himself and replaces the rest.
- [ ] **(13) Choose a lighter day.** On the first open of the day, an optional Low / Normal / High choice with the suggested one pre-selected. It is never required: ignoring it keeps the suggestion.
- [ ] **(16) What slipped.** After an absence (the welcome back), one line names a missed appointment or a passed date, with the same Still needed? question. It never lists everything.

## Stage 4: scoping, with Dan (one session, docs only) ✓ done (D-111)
For each item below, write a one-page scope in `docs/product/scope/`:
- what it is and why;
- what Dan sees, tap by tap;
- what changes in the rules and the facts;
- native work and Apple permissions;
- risks, including against the calm and against "the app must not become the new YouTube";
- effort, and the options.

Then ask Dan to choose, record each choice as a D-entry, and order stages 5 onwards.
- **(9) Calendar import**, read-only: Apple Calendar through EventKit (covers Google if it is added to iOS).
- **(10) Widget, share sheet and Siri / Shortcuts capture**: an App Group inbox drained into satchel facts.
- **(17) Projects as expeditions**, including the game's side of it. The story's side goes through the sealed process (D-015, D-035); scope the mechanics only.
- **(18) A 90-second weekly review** in the Daybook, perhaps the camp scene.
- **(19) Make it smaller**: step breakdown. On-device rules, or an AI suggestion? Privacy and offline to weigh.
- **(20) Month view.**
- **(21) An hour-by-hour view of today.**
- **(22) Body doubling**: a Focusmate link, or an in-world companion.
- **(23) An opt-in re-entry nudge**, at most once a week, only after silence.
- **Accessibility**: Dynamic Type, VoiceOver labels on every screen, contrast on the Week and Satchel. A light mode? (Likely only the first three.)
- **Search** in the satchel, the Week and past weeks.
- **"I'll read it later"** for story screens between jobs.
- **Onboarding / an empty start**, only if anyone other than Dan will use the app.

- [x] **Scope pages written** (`product/scope/`, index `scope/README.md`), and **Dan chose Claude's recommendations** (D-111, 2026-09-27).

## Stage 5 onwards (Dan's choices, D-111)
One session each unless noted; a stage waits for the earlier stages it builds on.
- **Stage 5: accessibility A and "I'll read it later" A** (`scope/accessibility.md`, `scope/read-it-later.md`). The parts on screens Stage 1 doesn't touch go first; the rest (the title read on each screen in `App.svelte`, "Not today" reachable on Today, the satchel's box, the 13 px labels on the Week, What repeats and Today) after Stage 1 is merged in.
  - [x] a label on Choose's new-job box, on the job editor's boxes (D-112) and on the satchel's paste box
  - [x] each new screen's title read out (focus moves to it, `App.svelte`)
  - [x] "Not today" (and Done) reachable without a swipe: the same two actions, heard but not seen, on each row
  - [x] no carved label under 14 px (Records/Marks switch, Marks' "new", the Week's day names and buttons, What repeats' days, Today's foot and nav)
  - [x] Increase Contrast honoured (the quiet ink colours lifted, `direction.css`)
  - [x] "To today" visible at once on every return and arrival, with no wait: already so (every story screen has "Today" at the top left with no delay; the welcome back's button shows within 0.2 s); nothing to build
- **Stage 6: capture and the nudge** (`scope/10-widget-share-siri.md` A, `scope/23-re-entry-nudge.md` B, off by default). After Stage 1.
- **Stage 7: calendar import** (`scope/09-calendar-import.md` B). After Stage 3.
- **Stage 8: the weekly look-ahead** (`scope/18-weekly-review.md` C, no reward). After Stage 3.
- **Stage 9: projects** (`scope/17-expeditions.md`, B then its door). After Stages 2–3, once Dan names a real project; its name is chosen then.
- **Later, if still wanted:** the month view as an "Ahead" list (`scope/20-month-view.md` B), two weeks after Stage 3 is in use.
- **Not now** (look again as noted on each page): make it smaller (19), hour-by-hour today (21), body doubling beyond Focusmate on the laptop (22), search, onboarding.
