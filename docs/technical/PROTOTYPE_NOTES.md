# Prototype notes (Phase 8)

> What is temporary, rough or unproven in the prototype, so none of it becomes permanent by accident (CURRENT_STATE → Phase 8 objective). Spoiler-free. Each line says when it gets fixed.

| What | Why it's like this | Fixed when |
|---|---|---|
| Its words (`content/copy/en.ts`) | First pass in the told-tale voice Dan asked for (D-073); the story's own sealed lines get theirs in a separate session | The language pass (brought forward, D-073) |
| The app icon | A crop of an invented sample painting | When the app has its name (`narrative/NAMES.md`) |
| The App Store Connect record may still be called "Real Life RPG (Dan)" | Dan renames it there if he likes (D-071) | Before anything is public |
| The delve alert uses the phone's default sound | The delve's own sound isn't made yet | Heart slice or later, if play shows sound matters |
| The fact log is saved as one text value: the browser's own storage on the web link, the phone's app settings (Capacitor Preferences, kept by iOS and backed up by iCloud) in the TestFlight build; no snapshot, no migrations yet | Enough for a prototype's small log, with nothing new to trust | SQLite, the snapshot and migrations before the first playable |
| Screens checked in Chromium at phone size, not WebKit | The container has only Chromium; TEST_STRATEGY asks for WebKit | Dan's phone checks each build; add WebKit to CI when the flow tests arrive |
| The painting kit samples bake in 10–80 s each; no scene of a real place yet | Real places wait for the sealed story-fix session (D-060) | After the story-fix session |
| Trials (b) and (c) run on the heart itself, in a rehearsal (alerts come 60 times sooner there); Dan's checklist is `APPLE_SETUP.md` → Sitting 3 | The trials screen was removed when the heart came first (D-064) | Done once, on the first TestFlight build |
| On the web link the delve's end can't sound with the phone locked: it chimes only while the page is open, and shows when Dan comes back | Web pages can't schedule alerts | The TestFlight build (local notifications are already wired) |
| The chime is a synthesised bell | The delve's own sound isn't made | When sound gets its pass |
| The word's cutting scene uses the approved painted Lamp Hall (`ui/scene/hall.js`) for every word, including the run-ahead's second word at another lintel | The first word's own hall is what the MVP's weeks meet; the second is in the run-ahead | When the run-ahead's places are painted |
| Places show a stand-in painting for their stretch (one of the three samples) | Week 1's first round (`paint/places/`) fell short of the hall; the kit needs materials before real places reach the bar | As each place is painted at the hall's level |
| Camps with a view reuse their stretch's stand-in painting | Camp paintings follow the places | The painting weeks |
| The "Prototype" link on Today, and rehearsal mode (×60, separate save) | To feel a whole day in minutes | Removed before the test starts |
| The "Rehearsal ×60" tag on every screen while a rehearsal is on | A rehearsal's evening passes in minutes; the tag stops its day being taken for the real one (Dan, review 2) | Removed once Dan is happy with the app (Dan), with rehearsal mode |
| The single-page web link inlines everything (≈ 0.6 MB) | A private claude.ai link, nothing for Dan to upload | Replaced by TestFlight |
| The flow walk (`app/tests/flows/heart-walk.mjs`) runs in Chromium by hand, not in CI | Playwright isn't in the app's dependencies yet | Add to CI with WebKit when the flow tests grow |
| The map's layout is hand-placed for the first region | One region in the MVP | The second region |
| Satchel lines have no dates yet ("renew the passport by 3 Nov"); no passed-date question | Dated lines need a date typed and read back; Dan's list is short for now | If the test shows he needs them |
| The trail (a marker for each day complete, relics at the 7th, 15th…) is not built | Not in the MVP's slice 4 list; Keys and the daybook already reward the week | After the test, if wanted |
| The week close is written at the first opening of the next week, not on Sunday night | One reliable moment, with the weekly floor's counts on it | If Dan wants it on Sunday evening |
| Goodnight is the only sign of bedtime: kept if tapped from three hours before bedtime to fifteen minutes after | The phone can't know when Dan is in bed | If play shows it doesn't fit his evenings |
