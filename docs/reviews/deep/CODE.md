# Deep review: code (UI layer and its glue)

Reviewer: senior engineer's line-by-line read of `app/src/ui/*.svelte`, `app/src/ui/game.svelte.ts`, `App.svelte` and
the small UI modules (`nav.ts`, `menu.svelte.ts`, `moment.svelte.ts`, `taps.ts`, `rest.ts`), with the PR #77 / #75 diffs
(`76c10dc`, `5f86197`) and D-140 to D-146 / `docs/reviews/flow/FIX-LIST.md` as intent. Branch `claude/review-round-5`
at `12876e8`. Baseline: `npm test` 457 passed / 8 skipped, `npm run typecheck` clean (note: `tsc` does not check
`.svelte` files; see finding 15).

There is no DOM test environment in the repo (no jsdom / happy-dom, browsers not installed here), so the UI findings
are shown by tracing the exact lines end to end instead of by a vitest. "Confirmed" means the trace is complete and
leaves no doubt; "likely" means one platform behaviour is assumed; "possible" means timing or rare state is needed.

Counts: **1 urgent, 6 bug, 9 minor, 6 cleanup** (22 findings).

---

## Urgent

### 1. "Delve now" starts a delve with no delve-end alert and no lock-screen panel
- **Severity:** urgent · **Confidence:** confirmed
- **Where:** `app/src/ui/game.svelte.ts:218`; `app/src/ui/Satchel.svelte:74`; core `app/src/core/game.ts:1329-1341`
  (`delveNow` writes `delveStarted`, through `beginRun` too when the line matches a job Dan already has).
- **What happens:** `Game.do()` lays out the delve's alerts and shows the panel only for commands in the list
  `['startRun', 'startErrands', 'skipBreather', 'stepAway', 'resume', 'finishHere', 'away']`, or when a run *ends*
  (`before && !this.view.run`). `delveNow` also starts a run but is not in the list. Nothing else makes up for it:
  `tick()` redraws the panel only when the phase or delve number changes (`game.svelte.ts:264`). `wake()` never calls
  `alerts()`. A lock is not leaving (`platform/types.ts:24`), so locking the phone never sends the `away` command
  that would lay the alerts out.
- **Steps:** Satchel → type "Call the bank" → **Delve now** → lock the phone. Result: no Live Activity on the lock
  screen, and no alert when the 30-minute delve ends. The phone stays silent, though this is the core loop's moment.
  The first-Begin permission prompt is never shown on this path either. The panel appears only at the first breather,
  or after the phone is unlocked (`#wake` → `panel()`). The alerts never come, unless Dan pauses and carries on, or
  leaves for another app.
- **Fix:** add `'delveNow'` to the list. More robust: compare `before?.seq` with `this.view.run?.seq` and call
  `alerts()` + `panel()` whenever the run's identity or phase changed, whatever the command. A rule-free UI test (or a
  flow check) that every command whose facts include `delveStarted` lays out alerts would pin it.

---

## Bugs

### 2. Monday morning: the Daybook's arrow (and the Week's after "Plan it for me") says "In the morning"
- **Severity:** bug · **Confidence:** confirmed (by trace)
- **Where:** `app/src/ui/App.svelte:109` with `:113-121`; `Morning.svelte:24-28`; `Daybook.svelte:57,68`.
- **What happens:** `go('today')` redirects to `first()`. The only `LOOK` screen `first()` can return is `'daybook'`,
  and in that case the `LOOK` branch pushes the screen being left onto the trail. On a Monday after a kept bedtime,
  `first()` is `'morning'`. Morning's button calls `go('today')`, which is redirected to `'daybook'`, and
  `{screen:'morning'}` is pushed.
- **Steps:** Sunday: Go to sleep in time. Monday: open the app → the Morning → its "Today" button → the Daybook. The
  Daybook's arrow reads **"In the morning"** (`nameOf` → `morning.label`). Tapping it pops `morning`, and the Morning
  mounts with `m === null`. Its effect calls `go('today')`, so the screen flashes and then lands on Today. Worse, from
  the same Daybook, **Plan it for me** → `toWeek()` = `go('back'); go('week')`. The first call sets `screen='morning'`
  and the second pushes it, so the Week's arrow says "In the morning", not "Today". That contradicts FIX-LIST/L B4 and
  D-144 §9 ("Plan it for me leaves the Week's arrow on Today"). `nav-flow.mjs` tests only the path from Today's
  "A page was written" line (trail `[today]`), so it passes. The same happens when the moment left is an unseen
  arrival (the Daybook's arrow then names the place, and back re-opens it as an old arrival with Rest / Keep going),
  or a delve's end (a flash of the empty Delve).
- **Fix:** in `go`, when `to === 'today'` is redirected, reset the trail to `[{screen:'today'}]` (or `[]`) before the
  `LOOK` branch, so the page's way back is always Today. For example, compute `redirected = to !== original` and treat
  a redirected `daybook` as a root screen.

### 3. A new day reached by waking resets the screen but not the back trail
- **Severity:** bug · **Confidence:** confirmed (by trace)
- **Where:** `app/src/ui/App.svelte:70` (also the error boundary's reset, `:238`).
- **What happens:** `$effect(() => { if (game.woke !== lastWoke) { …; screen = first(); arg = undefined; } })`
  bypasses `go()`. The trail, the open job menu or tick sheet, `game.deleted` and the `still` flag stay as they were
  the night before. When `first()` is `'daybook'` (a `LOOK` screen whose arrow pops the trail), its back goes to
  yesterday's screen.
- **Steps:** Sunday night: Today → Map → Records (trail `[today, map]`). Leave the app in the background (no
  goodnight). Monday after 04:00: return → `#wake` → `open` → `woke++` → `screen = 'daybook'`. The Daybook's arrow
  says **"Map"** and leads to Sunday's Map, then Today. With `{screen:'set', arg:<job>}` on the stale trail, back
  re-opens a set-up from the day before. The same stale trail survives the boundary's "Today" reset after a screen
  error.
- **Fix:** route both resets through one helper: `trail = []; closeMenu(); closeTick(); closeRows(); game.deleted =
  null; screen = first(); arg = undefined`. Or call `go('today')`, whose redirect already does the rest.

### 4. Week: "Next week" then "This week" leaves a back step that goes nowhere, and a later arrow says "Next week" about this week
- **Severity:** bug · **Confidence:** confirmed (by trace)
- **Where:** `App.svelte:115-121` (the "same screen, another page: replaced" rule) and `:132` (`nameOf` for `week`);
  `Week.svelte:227`.
- **Steps:** Today → Week (arg `undefined`, trail `[today]`) → **Next week**: `go('week', next)`. The current arg is
  `undefined` and the new one is defined, so `{week, undefined}` is pushed. → **This week**: `go('week', thisWeek)`.
  The trail top `{week, undefined}` doesn't equal `thisWeek`, the current arg is defined, so the page is *replaced*.
  Now the screen is this week and the trail top is `{week, undefined}`, i.e. this week too. The arrow says "This week",
  and tapping it shows the same page again; only a second tap reaches Today. If Dan opens a job's editor from there,
  `{week, thisWeek}` is pushed and the editor's arrow reads **"Next week"**, because `nameOf` says `week.next` for any
  truthy arg. "The week after" is also labelled "Next week".
- **Fix:** normalise the Week's arg (`undefined` for the current week, in `go` or in `Week.svelte`). Name it by
  comparing with `calendarWeek(game.view.day)`: `undefined`/this → "This week", +7 → "Next week", else
  `week.later`/`week.after`. Then the pop rule (`top.arg === a`) catches the return to this week.

### 5. A tap in the first moments after coming back can count the time spent in another app
- **Severity:** bug · **Confidence:** possible (needs a tap inside the `away.take()` window, up to 2 s on its timeout)
- **Where:** `game.svelte.ts:73-77` (`#wake` awaits `platform.away.take()` before `away()`); `do()` at `:212` has no
  `#waking` guard. `tick()` does have one (`:250`).
- **Steps:** a 25-minute delve. Dan goes to another app for 10 minutes, comes back, and taps **Finish here** (or
  Pause) at once. `do('finishHere')` runs with the time away still counted as delve time, and only afterwards does
  `#wake` send `away`, which then finds no run to pause. The 10 minutes away are credited as delving, which goes
  against D-094.
- **Fix:** in `do()`, if `this.#waking` is set, queue the command: `await this.#waking`, then act. Or make the
  screens' buttons inert while waking (a `game.waking` `$state`).

### 6. A failed or revoked calendar read is written down as "the calendar is now empty"
- **Severity:** bug · **Confidence:** likely
- **Where:** `game.svelte.ts:105-109` (`readCalendar`); `platform/index.ts:137` (`events()` returns `[]` on any error);
  core `game.ts:1393-1401`.
- **Steps:** the calendar is on, and one read fails (plugin error, or permission revoked in iOS Settings). `events()`
  gives `[]`, and `calendarRead` sees a change, so it writes a `calendarRead` fact with no events. Every appointment
  goes from the Week and the planner (which plans round them) until the next good read. When reads flap, each pair
  writes two facts of up to 400 events into the log.
- **Fix:** make the platform return `null` on failure (keep `[]` for a real empty calendar), and skip the command on
  `null`.

### 7. `alerts()` runs unserialised: overlapping runs can leave a stale delve-end alert
- **Severity:** bug · **Confidence:** possible
- **Where:** `game.svelte.ts:276-287`. Compare `reminders()` at `:291`, which is chained.
- **Steps:** two commands in the list close together (Begin, then Pause; or `away` followed by Carry on). Call A
  awaits `cancel`, then `permit`, then schedules up to 16 alerts, one `await` each. Call B cancels in the middle of
  that loop and schedules nothing (the run is held). A's later `notifier.at` calls then land *after* B's cancel. The
  phone chimes "delve ended" during a pause.
- **Fix:** chain it like `reminders()`: `this.#alerting = this.#alerting.then(() => this.#alerts()).catch(() => {})`.
  Inside, read `this.view.run` after the last await.

---

## Minor

### 8. While a word is left for later, Today's place name opens the word, not the place
- **Severity:** minor · **Confidence:** confirmed (by trace)
- **Where:** `Today.svelte:231`; `Arrival.svelte:23-25,33`.
- **Steps:** a word arrival. Tap **Later** (`moment.wordLater = seq`), then tap the place's name on Today, which calls
  `go('arrival', 'again:<placeSeq>')`. In `Arrival`, `again` is `null` because `v.arrival` exists, `a = v.arrival`,
  and `word` is true, so the Cut opens again, the very thing Dan just put off. The same goes for a delve's end
  **See where you are** (`Delve.svelte:278,309`).
- **Fix:** when `seq !== null` (an explicit read-again), prefer `again` over `v.arrival`, or skip `v.arrival` while
  `v.arrival.seq === moment.wordLater`.

### 9. A tick's return replays its count every time Dan comes back to it
- **Severity:** minor · **Confidence:** confirmed (by trace)
- **Where:** `Step.svelte:50,56` (`mode={moved ? 'play' : 'still'}`).
- **Steps:** tick off a recurring job with 30 min. The step plays its ring and road count. Then **Use it here** (a
  Key) → the opened niche → back, or a record → back. The step remounts and plays the whole count again. D-145's
  polish ("the count already played, never twice") was done for the delve's end only (`moment.ends`), not for the
  step.
- **Fix:** keep a `moment.stepsPlayed: Record<number, true>` (or reuse `moment.ends` keyed by the `jobDone` seq) and
  pass `'still'` once played.

### 10. `RunSet.start()` goes to the delve even when the rules refused the run
- **Severity:** minor · **Confidence:** confirmed. The refusal is rare: a run is under way or an errand run's end
  waits, which the screens before it guard against.
- **Where:** `RunSet.svelte:146-147`; also `CantStart.svelte:23-24`. The errand branch does check `game.view.run`
  (`:144`) but says nothing when refused.
- **What happens:** with no run and no end, `Delve`'s `$effect` sends Dan on to Today: a flash, and the Begin seems
  to do nothing, without a word.
- **Fix:** `if (!game.view.run) { said = …; return; }` before `go('delve')`, as the errand branch does, with a line
  saying why.

### 11. `Week.about()` says "about 60 min" for 58 or 59 minutes
- **Severity:** minor · **Confidence:** confirmed
- **Where:** `Week.svelte:105`.
- **What happens:** for `m` from 57.5 to 59.9, `m < 60` takes the minutes branch and `Math.round(m / 5) * 5` gives
  60, so the day reads "about 60 min" where every other day reads "about 1 h".
- **Fix:** round first (`const r = Math.round(m / 5) * 5; if (r < 60) …`).

### 12. Copy: "Back to {label}" with a capitalised or bare label
- **Severity:** minor · **Confidence:** confirmed
- **Where:** `nav.ts:11` (`backTo`), used by `Step.svelte:63`, `Opened.svelte:58`, `Arrival.svelte:123`,
  `Rhythms.svelte:129`.
- **What happens:** only "Map" and "Today" are special-cased. Other labels give "Back to This week", "Back to Next
  week", "Back to Satchel", "Back to Records", "Back to Delves" (the set-up of a deleted job), "Back to Arrived"
  (`arrive.label` fallback) and "Back to Recurring jobs".
- **Fix:** give each `NAMES` entry an in-sentence form ("the Satchel", "this week", "your records"), as `opened.toMap`
  does, and look it up in `backTo`.

### 13. "{job} is in a delve: finish it first." is said for a delve that has already ended
- **Severity:** minor · **Confidence:** confirmed
- **Where:** `game.svelte.ts:129` (`cantDelete` for `runEnd` and errand-end jobs too); copy `job.cantDelete` (en.ts:412).
- **Steps:** a delve ends, and Dan looks at its parked thoughts (Satchel), then slides that job's row → Delete. The
  line says the job "is in a delve", though the delve is over and only its "Is it done?" waits.
- **Fix:** a second line for the end case ("…: its delve's end is still to be answered.").

### 14. Tonight's "Put it in" message can be cut short, and its timer outlives Today
- **Severity:** minor · **Confidence:** confirmed
- **Where:** `Today.svelte:171`.
- **What happens:** `setTimeout(() => (mindSaid = false), 4000)` is never cleared. A second line put in 3 s after the
  first shows its confirmation for 1 s only. `Delve.park` has `clearTimeout(sayTimer)` and an unmount cleanup;
  Today's copy of the same pattern has neither.
- **Fix:** keep the id, clear it before setting a new one, and clear it in an `$effect` teardown.

### 15. Svelte files are not type-checked; `as never` / `as CopyKey` hide copy-key mistakes
- **Severity:** minor · **Confidence:** confirmed
- **Where:** `package.json` (`typecheck` is `tsc --noEmit`, which skips `.svelte`); for example `App.svelte:150`
  `t(NAMES[top.screen] as never)`, `Today.svelte:30`, `Return.svelte:34`, `Week.svelte:121`.
- **What happens:** `CopyKey` typing protects the `.ts` files only. A misspelt key in a screen renders `undefined`, or
  throws inside `.replace`, and only a flow would catch it. A scripted check of every literal `t('…')` in `src/ui`
  against `en.ts` found **no missing key today**, and every dynamic family (`step.keyAlready.*`, `part.*`,
  `remind.*`, `days.*`) is complete. The guard is luck, not tooling.
- **Fix:** add `svelte-check` to `typecheck` (and CI), and type `NAMES` as `Partial<Record<Screen, CopyKey>>` so the
  casts go.

### 16. Recurring row says "1 a week" where its editor says "Once a week"
- **Severity:** minor · **Confidence:** confirmed
- **Where:** `en.ts:585` (`oftenWords` → `rhythms.nWeek`) shown at `Satchel.svelte:283`; the editor uses
  `rhythms.onceWeek` (`Rhythms.svelte:153`).
- **Fix:** in `oftenWords`, `r.times === 1 ? t('rhythms.onceWeek') : t('rhythms.nWeek', …)`.

---

## Cleanup

### 17. Dead branch: `'stay'`
`App.svelte:108-109`. `go('today', 'stay')` is never called anywhere (`grep "'stay'"` finds only this line); the
"word left for later" now works through `moment.wordLater`. Remove the condition and its comment.

### 18. Dead call: `else this.tick()` in `#wake`
`game.svelte.ts:80`. By the time `#wake` resumes after its first `await`, `this.#waking` has been assigned, so
`tick()` returns at once (`:250`, `if (document.hidden || this.#waking) return;`). The settling it was meant to do is
already done at `:76`, and native/panel follow. Remove it, or call the settle-and-chime part directly if the chime was
wanted.

### 19. `reset()` (Trial → Wipe) leaves a running delve's alerts scheduled, and the in-memory moments
`game.svelte.ts:401-410`. Unlike `restore()` and `setRehearsal()`, it never calls `alerts()`. After `facts = []`,
`do('open')` sees no run before or after, so the old delve's end alerts still fire. `moment.wordLater`, `ends`,
`keyChoice` and `errandPick` keep seqs from the wiped log, and in a new log the same seqs mean different facts. The
same seq collision applies to `restore()`. Fix: `void this.alerts()`, and reset `moment`/`errandPick` in
`reset`/`restore`/`setRehearsal`. This is trial-only, but `restore()` is Dan's.

### 20. Unused copy keys (34)
Scripted check of `en.ts` against all of `src` and `tests`, with the dynamic families accounted for. **Orphaned by
PR #77:** `today.aside.said`, `job.back`, `settings.trial`. **Older:** `today.teaser.avoided`, `today.teaser.delve`,
`today.delve`, `delve.towards`, `guess.label`, `marks.keep`, `map.reached`, `map.forecastLabel`, `proto.rehearsal`,
`proto.close`, `cant.keep`, `today.notToday`, `today.else`, `tonight.first.others`, `tonight.first.keep`,
`tonight.mind.hint`, `daybook.held`, `daybook.times`, `daybook.reached`, `daybook.offer`, `daybook.close`,
`rhythms.say`, `rhythms.add`, `rhythms.editing`, `by.passed`, `rhythms.stop`, `job.onceUntil`, `job.others`. Delete
them, or keep them with a comment if they are kept on purpose for a later build.

### 21. `recordOpened` is written but never read, and only from one entry point
`Records.svelte:23` writes `{do:'read'}` on every open from the list. Links from a return, an arrival, the welcome,
the morning or an opened niche (`go('records', id)`) write nothing, and core never reads `recordOpened`
(`grep` finds only `game.ts:1042` and the type). Either drop the write, or make it consistent if it is meant to feed
anything ("unread" marks, the Daybook).

### 22. Small redundancies
- `App.svelte:229`: `{#key arg}` around `Rhythms` inside the outer `{#key screen + arg}`. It is redundant; remove it.
- `Map.svelte:172`, `RunSet.svelte:71`: a `setTimeout` or `requestAnimationFrame` not cancelled on unmount. It only
  writes to a dead component; cancel it for hygiene.
- `Settings.svelte:24`: the `calendars().then` has no `catch`. It is safe only because the platform swallows errors
  (`platform/index.ts:136`); a comment, or `.catch(() => {})`, would make that explicit.

---

## Checked and found sound (so nobody re-checks them)
- Copy keys: every literal and dynamic key the UI uses exists. Plurals: `minutesWords`, `delves`, `park.count`,
  `today.keys.*`, `opened.left.*`, `jobs.one/many`, `rhythms.onceWeek/timesWeek` all branch on 1. The tick sheet's
  "1½ h" / "2 h" are right.
- UI guards against core: Today's and the Satchel's `busy` (`run || runEnd.pending`) agree with core's `tickOff` and
  `startRun`/`startErrands` refusals. JobMenu's Delete / Waiting-on disabled conditions match `game.remove` and core
  `waitOn`. Map's **Use a Key** (`v.keys && openable`) and Return's **Use it here** (`v.keyHere`) use the same
  `openable()` as core `useKey`, so the opened screen is never reached unopened. The Satchel's **Delve now** marks a
  looked-at end seen before core's `delveNow` (which refuses on any `runEnd`).
- Double taps: every command button either calls `steady()` or changes screen through `go()` (which does), and core
  refuses the second command (`useKey` with no Key, `done` already done, `startRun` with a run).
- Effects: the `App` route effects (`runEnd`, `arrival`) are guarded by their `last…` seqs and do not loop, though
  `go()` called inside them makes `trail`/`screen` their dependencies. Every listener and timer in SwipeRow, hold,
  Look, Stair, Scene, Cut, Delve and Map's ResizeObserver is cleaned up. Errors thrown in the platform's async calls
  are swallowed in `platform/index.ts`, so the `void` calls in `game.svelte.ts` cannot reject.
- The Daybook marks its page read on any way out (`onMount` teardown); the delve's end keeps its answer, story and
  count across a look away (`moment.ends`); the arrival's and word's phone-back handling matches their arrows.
