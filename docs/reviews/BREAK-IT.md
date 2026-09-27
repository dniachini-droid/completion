# Break-it review, 2026-09-27

> A hostile test of the build on `main` at `cef7dc0` (PR #55, D-117 to D-127), through the screens and through the rules.
> Review only: no app code was changed. Spoiler-free: story items are named by id only.
> Scripts: `app/tests/review/` (see *How to rerun* at the end).

## For Dan, in plain words

I tried hard to break the app in two ways:
- **By hand, through the screens.** A robot pressed every button on two iPhone sizes, double- and triple-tapped, left mid-delve, jumped the clock by hours and days, and typed silly text.
- **Through the rules underneath.** I fed about 216,000 random actions into them.

The core is solid. Minutes are never paid twice. The delve survives leaving the app, crossing 04:00, crossing a week, and a clock change. Saves read back exactly. Nothing throws.

I found five things worth fixing soon:
1. **One crash that repeats every time you open the app.** If two jobs you finish in the same week have the same name (say "Shopping" twice), the next week's Daybook page breaks. The app then opens on "Something went wrong" every time.
2. **A quick double tap on Delete can delete a second job,** or lose the Undo for the first.
3. **The job editor can delete the job whose delve is running.** The screen then shows a code name instead of the job's name.
4. **A delve that ends while you're typing isn't shown to you** until the next time the app starts.
5. **The story is still paced by calendar weeks, through the Keys.** You decided on one story unlocked by work. But after three weeks, someone working 8 hours a day is exactly as far into the story as someone working 3 hours a day: story week 6. The reason is that many places wait for a Key, and Keys only come from repeating jobs, at most 5 per calendar week. That part is your call (a balance question), so I describe options rather than pick one.

The rest is small: long words running off the screen edge, a few silent buttons, and similar.

## Ranked problems

Severity: **High** = crash, lost data or a broken promise to Dan; **Medium** = confusing or stuck; **Low** = rough edge.
"Seen" says how the problem was found and how often it repeated.

### 1. High: the Daybook crashes, for good, when two jobs done in one week share a name
- **Reproduce:**
  1. Put "Shopping" in twice, delve on each and say Done.
  2. Open the app after the week ends.
  3. The week's Daybook page opens first and shows "Something went wrong". So does every later opening, and the Daybook itself.
  - A one-off you name like a repeating job (for example "Course") and finish in the same week as that job should do the same (read from the code, not run).
- **Player experience:**
  - The app opens on an error every morning.
  - The week's page, its offer and the look-ahead can't be reached.
  - The page is never marked read, so it never goes away.
- **Seen:** `same-name.mjs`, 2 of 2 runs, at 390×844 and 360×780. I reran it myself. The console shows Svelte's `each_key_duplicate`.
- **Cause:** `app/src/ui/Daybook.svelte:108` keys the list by job name (`{#each held as h (h.name)}`). The list is built per job id at lines 27–33.
- **Fix:** carry the id (`{ id: job, name, k }` at line 33) and key by `h.id`. Check the other keyed `{#each}` blocks for any key that isn't an id.

### 2. High (a design question for Dan): the story is still held back by the calendar week, through Keys
> **Resolved by D-129 (Dan chose option c, 2026-09-28).** The probe now asserts. At 8 hours a day: story week 14, 67 places on foot (all the minutes allow), and 5 of 21 days with no next place in reach, each waiting on a story step, never on a Key. At 3 hours a day: story week 5.

- **Reproduce:** `REVIEW_SLOW=1 npx vitest run tests/review/pace.test.ts` (from `app/`). A simulated player delves every day for three weeks from a Monday. Each day's end records the story week, minutes walked and what the story waits on.
- **Result:**

  | Per day, for 21 days | Minutes walked | Places reached on foot | Places the minutes alone would reach | Story week at the end | Days ending with no next place in reach |
  |---|---|---|---|---|---|
  | 3 hours | 3,780 | 25 | 25 | 6 | 0 of 21 |
  | 8 hours | 10,080 | 27 | 67 | 6 | 19 of 21 |

- **Why:**
  - D-123 removed the one-place-a-day and one-story-week-a-week limits, and those are gone from the code (`story.ts` `mayAdvance` ignores the day).
  - But a story week ends only when all its places are played. Story weeks 3, 4 and 6 to 13 each have Key rows (18 in all), and many places and steps need a seal opened by a Key first. In the 8-hour run, each stall waited on one of these: `seal-1-1`, `b-2.1`, `seal-2-1`, `b-3.B`, `b-4.B`, `seal-5-1`, `b-6.B`.
  - Keys come only from meeting a repeating job in its period: gym 4 times a **calendar week**, on four different days, since each job counts once a day. There are at most 5 Keys a calendar week, plus the weekly floor, which lands at the next week's first opening.
  - So Monday to Wednesday of a new week usually bring no Key at all, whatever Dan does. In the run, 5 to 7 October ended with 0 Keys each after 8 hours of work.
- **Player experience:**
  - Past about 3 hours a day, extra work stops showing a next place: 19 of 21 days ended with "no next place in reach".
  - When a Key finally lands, several places arrive in a burst (six in one day on 3 October in the run).
  - This is the "holding position after I accomplish my work" that D-123 set out to remove. D-123 point 3 kept "Keys 5 a calendar week", but the effect of that on pacing was not spelled out.
- **Options for Dan (a balance choice, rule 20):**
  - (a) Also earn Keys from minutes, e.g. one per N minutes past the day's work, still capped per day to keep rule 10.
  - (b) Count a rhythm's Key from its sessions, not its calendar week.
  - (c) Let a Key row be reached on foot once its minutes are passed, with the Key opening only its extra.
  - (d) Keep it as it is, and tell Dan the story's pace is set by his repeating jobs.

### 3. High: a double tap on Delete deletes a second job, or loses the Undo
- **Reproduce:**
  - **Choose a delve:** tap a job's Delete twice (60, 300 or 600 ms apart). Two jobs are deleted, and Undo brings back only the second.
  - **Satchel, or a slid row on Today:** tap Delete twice. The second tap opens the next job's set-up, and leaving the screen clears the Undo.
- **Player experience:** a job is lost with no way back.
- **Seen:** `satchel-attack.mjs` #2, #4, #31 to #33, 3 of 3 gaps, twice each, at both sizes. I reran it myself.
- **Cause:** the half-second guard (`ui/taps.ts`, D-120) arms only when the screen or the delve's phase changes (`App.svelte:69`, `:124`). A Delete moves the list under the finger without either.
- **Fix:**
  - Call `steady()` in `game.remove`, `removeDone` and `undoRemove` (`ui/game.svelte.ts:126–148`), and in the other taps that add or remove a row: Today's Not today, the Satchel's Put in and Put on a day.
  - Consider keeping the Undo across one screen change.
  - Two Deletes in a row also keep only the last Undo, which is worth fixing at the same time.

### 4. Medium-high: the job of a running delve can be deleted from the job editor
- **Reproduce:** delve on a job. Go to Week, tap the job, then Change the job, then Delete.
- **Player experience:**
  - The delve carries on under the internal id (e.g. `it-1`) in place of its name.
  - At its end, "It's done" says done but records no Done. The minutes do count.
- **Seen:**
  - Screens: `delve-attack.mjs` #8, 3 runs.
  - Rules: the fuzz found the same state through any removal the rules accept. `removeJob`, and the old `dropItem`, are refused only by the screens (`game.remove`), not by `act()`. The fuzz test's `R5` covers this.
- **Cause:**
  - `ui/Rhythms.svelte:94–100` `remove()` calls `removeJob` directly, skipping `game.remove()`'s check for a running delve.
  - "Let it go" at `Rhythms.svelte:154` and in the Daybook (`Daybook.svelte:67`) does the same.
- **Fix:** route them through `game.remove()`, and put the same refusal in core's `removeJob` and `dropItem`.
  - When a job was deleted after its delve ended but before its end was looked at (a rare order, fuzz seed 7005), the end screen should still show the job's name. Keep the name in the `delveEnded` fact, or fall back to the last saved name.

### 5. Medium-high: a delve that ends while Dan is typing is not shown that session
- **Reproduce:**
  1. Begin a 5-minute delve on a Satchel job.
  2. Go to Satchel and start typing in Put in.
  3. Let it end, then tap the arrow.
  - Today shows, not the end. Nothing brings it back that session. It appears, hours late, at the next cold start.
- **Player experience:** the question "Is it done?" never comes. A Satchel job has no "It's done" on Today to fall back on. This is the case D-120 point 3 meant to close.
- **Seen:** `edge-attack.mjs` #5, 4 runs, at both sizes.
- **Cause:** `ui/App.svelte:75`. `go('back')` sets the screen straight from the trail, skipping the "Today never skips what waits" check on line 79.
- **Fix:** apply the same `first()` check when back lands on Today, and check again when a text box loses focus.

### 6. Medium: a Satchel job's set-up opens during another job's delve, and its Begin silently shows the other delve
- **Reproduce:**
  1. Begin a delve on one Satchel job.
  2. Go to Satchel, tap another job, then Begin.
  - The first job's delve is shown instead.
- **Player experience:** "I started it and it didn't start", with no reason given.
- **Seen:** `delve-attack.mjs` #7, 2 runs.
- **Cause:** Satchel rows stay tappable during a delve. Today's rows don't (`disabled={!!v.run}`). Core refuses the second `startRun`.
- **Fix:** disable Satchel rows during a delve as Today does, or have the set-up say another delve is under way.

### 7. Medium: "Let it go" deletes with no Undo
- **Reproduce:** give a job a date, let the date pass, then go to What repeats and tap "Let it go". The same is true of the Daybook look-ahead's "Let go".
- **Player experience:** gone at once, against D-125's "every Delete shows Undo".
- **Seen:** `text-attack.mjs` #5, 3 runs.
- **Fix:** use `game.remove()` and show `<Deleted />` there. This also brings item 4's check.

### 8. Medium-low: editing a list during its delve brings back the lines already struck
- **Reproduce:**
  1. A job's list has one to four. In its delve, strike "two".
  2. Go to Satchel, then List, and add "five".
  3. End the delve. "two" is still on the list.
- **Player experience:** what was already bought comes back.
- **Seen:**
  - Screens: `satchel-attack.mjs` #5, 2 runs.
  - Rules: `probes.test.ts`, "editing a list during its delve…" (`it.fails`).
- **Cause:** `core/game.ts:808` clears `struck` on any list edit, on purpose ("a list edited afresh starts with nothing struck").
- **Fix:** keep the strikes of lines whose text is unchanged (map by text), or don't allow list edits while its delve runs.

### 9. Low-medium: long words run off the side of the screen
- **Reproduce:** name a job with a 120-character word with no spaces, such as a pasted link.
- **Player experience:**
  - The name is cut at the screen edge on Today, Week, Choose and Satchel rows, and the note to its right is pushed out of sight.
  - The same happens in the set-up and delve titles, "Is it done?", and the Satchel's list preview.
  - The delve's list can be scrolled sideways, against "the screen never slides".
- **Seen:** every run at 390 and 360 (`satchel-attack.mjs` #1 and #6, `text-attack.mjs` #1 to #3).
- **Fix:** `overflow-wrap: anywhere` on row names (`ui/direction.css:382`), `.say`, `.say-lg`, the titles, the Satchel preview and `Delve .list button`, plus `overflow-x: hidden` on the delve's list.

### 10. Low-medium: Save in the job editor with an empty name does nothing, and says nothing
- **Reproduce:** Week, then a job, then Change the job. Clear "What", then Save.
  - "Set days" with no day chosen is the same (`Rhythms.svelte:73`).
- **Fix:** disable Save, or say what's missing.

### 11. Low: the phone's clock set back mid-delve
- **Reproduce:**
  - Rules: `fuzz.test.ts` `R7`, seeds 2001 and 2017.
  - Screens: `edge-attack.mjs` #2, 1 run, suspected only.
- **Player experience:**
  - Facts are written earlier than ones already in the log.
  - A delve's end can say "0 minutes" when 30 were counted.
  - On screen the countdown restarts, and the minutes delved may not show.
  - Nothing is paid twice.
  - This happens only if Dan changes the time by hand. Time zones and summer time are fine: tried both, and the log uses real instants.
- **Fix:** stamp each new fact no earlier than the log's last fact (`writer()` in `core/game.ts`), as `pauseAway` already does.

### 12. Low (latent; the screens don't do it today)
- `movePlan` to a day in **another week** makes `weekOf` throw (`core/week.ts`, `at(e.day)!`). The Week routes such moves through `planJob` (`Week.svelte:83–87`), so only a future screen could hit it. Reproduced in `probes.test.ts` (`it.fails`).
  - **Fix:** refuse a cross-week `movePlan` in `act()`, or skip entries outside the week in `weekOf`.
- **Other rough edges** (screens, confirmed):
  - A double tap on a list line strikes it and unstrikes it.
  - A full 2,000-character list opened again won't take a new line, and says nothing.
  - A paste past 2,000 characters keeps half a line.
  - Text typed but not yet left (List, + Add, a Week line) is lost if the app is killed at that moment, or if you go to "Next week".
  - "Not yet" is forgotten on reload, so "Is it done?" asks again (nothing is lost).
  - Begin, then a second tap 0.6 s later, lands on Finish here: just past the half-second guard.
  - In landscape the main buttons are below the screen. The iPhone build is portrait-only, so this matters only in a browser or on an iPad.
- **An existing rule test is close to its time limit:** `tests/rules/story.test.ts` "never more than 5 useful Keys a week, whatever the effort" timed out at vitest's 5 s default in 3 of about 9 full runs here (the whole rule suite takes about 130 s). CI could go red for no real reason. **Fix:** give that test a longer timeout, as the other long simulations have.
- **Suspected only:** a repeating job's session moved onto a day that already has one shows once in the Week (`dup-day.mjs`, 1 run). This may be the planner's intent.

## What held up

**The rules**
- 216,000 random steps: about 1,100 sequences of 150 to 200 actions, with clock jumps from minutes to 12 days and time-zone changes.
- These all held:
  - nothing threw, in `act`, `settle`, `see` or the reminders;
  - every fact's day is a real date, including plan changes' own day or none (D-125);
  - the log stays in time order while the clock only moves forward;
  - minutes are never negative;
  - no job is done twice on a day, and no run is ended twice;
  - no run is paid more than it was set for, or than the clock allows;
  - a delve's end always says what its steps paid;
  - no place is arrived at twice, and never more than 5 Keys a week;
  - a Done under 5 minutes never brings a step, find or Key;
  - the slate never names a missing job;
  - the Satchel never lists a repeating, done, stopped or deleted job;
  - every save round-trips to the same facts and the same view.
- Leaving mid-delve, across 04:00, across a week, after 3.7 days, and the October clock change: minutes were kept exactly, and time away was never counted.
- Speed: `see()` takes about 9 ms on six months of play (4,500 facts) on this machine (`REVIEW_SLOW=1 … perf.test.ts`). There is plenty of room, even though a delve rebuilds the view once a second.

**The screens**
- No page errors on any tour of every button: by day, at 22:30 and at 02:30, at 390×844, 360×780, 375×667 and in landscape. The only exception is item 1.
- No sideways slide or cut-off text with normal names.
- The one-tap guard held for these (also under 4× and 6× CPU slow-down, 15 of 15):
  - Begin, twice and three times;
  - Pause and Back to the delve, ten times each;
  - Finish here ×3, Done ×3, Not yet ×2, "It's done" ×2, Go to sleep ×2 and Plan my week ×2.
- **Reloads:** mid-delve, while paused, on "Is it done?" and mid-strike. Strikes were kept.
- **Moving jobs:**
  - five fast moves round the Week, and "Another day…" across 28 days;
  - "Not this week", then Done;
  - a move while the job's delve ran.
- **Typing:** HTML, `{{x}}`, right-to-left text and emoji show literally, with no injection. The Satchel caps a name at 120 characters and refuses empty text.

## How to rerun

From `app/`:

**Rules** (vitest, part of `npm test`):
- `npx vitest run tests/review`
- The larger fuzz run: `FUZZ_RUNS=250 FUZZ_LEN=200 npx vitest run tests/review/fuzz.test.ts`.
- The exploration runner (`RUNS=… npx vitest run tests/review/explore.test.ts`) lists each problem kind with its first seed. `CASES="seed:step:kind:ui:back"` replays one case.
- `it.fails` marks a finding: it passes while the problem is there and fails once it is fixed, so it can then become an ordinary test.

**Screens** (Playwright, Chromium):
1. `npm run -s build && npx vite preview --port 4173`.
2. Run `node tests/review/<name>.mjs`.
   - Scripts: `tour`, `delve-attack`, `satchel-attack`, `text-attack`, `week-attack`, `edge-attack`, `same-name`, `dup-day`, `story-walk`, `slow-taps`.
   - Each exits 2 on page errors, 1 on findings, and 0 when clean. They are not in CI; several fail today by design, showing the findings above.
