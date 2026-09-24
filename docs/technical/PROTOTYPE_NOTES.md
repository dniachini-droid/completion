# Prototype notes (Phase 8)

> What is temporary, rough or unproven in the prototype, so none of it becomes permanent by accident (CURRENT_STATE → Phase 8 objective). Spoiler-free. Each line says when it gets fixed.

| What | Why it's like this | Fixed when |
|---|---|---|
| Its words (`content/copy/en.ts`) | Placeholder, like all copy before the language pass (D-046) | The language pass |
| The app icon | A crop of an invented sample painting | When the app has its name (`narrative/NAMES.md`) |
| The working app name "Real Life RPG" | Apple needs one to make the record | Same |
| The delve alert uses the phone's default sound | The delve's own sound isn't made yet | Heart slice or later, if play shows sound matters |
| The fact log is saved as one text value: the browser's own storage on the web link, the phone's app settings (Capacitor Preferences, kept by iOS and backed up by iCloud) in the TestFlight build; no snapshot, no migrations yet | Enough for a prototype's small log, with nothing new to trust | SQLite, the snapshot and migrations before the first playable |
| Screens checked in Chromium at phone size, not WebKit | The container has only Chromium; TEST_STRATEGY asks for WebKit | Dan's phone checks each build; add WebKit to CI when the flow tests arrive |
| The painting kit samples bake in 10–80 s each; no scene of a real place yet | Real places wait for the sealed story-fix session (D-060) | After the story-fix session |
| Cloud signing (D-063) is unproven | First run pending Dan's secrets | The first TestFlight build |
| Trials (b) and (c) run on the heart itself, in a rehearsal (alerts come 60 times sooner there); Dan's checklist is `APPLE_SETUP.md` → Sitting 3 | The trials screen was removed when the heart came first (D-064) | Done once, on the first TestFlight build |
| On the web link the delve's end can't sound with the phone locked: it chimes only while the page is open, and shows when Dan comes back | Web pages can't schedule alerts | The TestFlight build (local notifications are already wired) |
| The chime is a synthesised bell | The delve's own sound isn't made | When sound gets its pass |
| The job list is a fixed stand-in from Dan's starting set; Today's jobs are its first 2, 3 or 5, changed by Swap | Editing jobs and the planner are slice 4 | Slice 4 |
| Capacity is always suggested Normal ("a suggestion") | Bedtime and absence set the suggestion in slice 4 | Slice 4 |
| No map, records, sealed things, finds or Keys; "Ahead" is one invented sentence per place | Those are slices 2–3 | Slices 2–3 |
| After day complete the main button is "See where you are" (the arrival again), not "To camp" | Camp is slice 4 | Slice 4 |
| A place's arrival shows only its name and line; camps reuse the current place's painting | No camp paintings; invented places only | The story-fix session and the painting weeks |
| The "Prototype" link on Today, and rehearsal mode (×60, separate save) | To feel a whole day in minutes | Removed with the prototype |
| The single-page web link inlines everything (≈ 0.6 MB) | A private claude.ai link, nothing for Dan to upload | Replaced by TestFlight |
| The flow walk (`app/tests/flows/heart-walk.mjs`) runs in Chromium by hand, not in CI | Playwright isn't in the app's dependencies yet | Add to CI with WebKit when the flow tests grow |
