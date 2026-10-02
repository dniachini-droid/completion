# Deep review: persistence, platform and native

Reviewer: persistence / platform / native (one of six). Branch `claude/review-round-5` (= newest `main`), 2026-10-01.
Scope: `app/src/platform/`, the save (SQLite, settings fallback, adopt, versions, Restore, weekly copy, daily backup), `app/ios/` (Swift plugins, Live Activity, App Intent, Info.plist), reminders and delve alerts, lifecycle (leave / lock / kill), calendar, haptics, sound.
Probes: `app/tests/review/deep-platform.test.ts` (9 tests, all passing; each one passes *while the problem is there*). Swift findings are reasoned from the code and from the Capacitor plugin sources in `node_modules`; nothing ran on a phone.
Spoiler-free: no story content is referred to.

**Counts:** urgent 0 · bug 8 · minor 16. Confirmed 16 (6 and 7 each with a suspected part), suspected 8; marked on each.

Nothing found loses progress in normal use. The SQLite path is sound: one transaction per write, the facts only ever added, and a fallback to the settings store that keeps everything in memory. The weak spots are around it: what Restore accepts, notifications once the app is not in front, the 15-second away timer, and things that the rules and the screen checks cannot see.

---

## Bugs

### 1. "Again in 10 min" on a reminder almost never works unless the app is open (bug, suspected with high confidence)
- **Where:** `app/src/platform/index.ts:94-106` (`readyAgain`), `:188-191` (`remind`); Capacitor `@capacitor/local-notifications/ios/.../LocalNotificationsHandler.swift:74-98`, `LocalNotificationsPlugin.swift:725-730`.
- **Reasoning:** the action is registered without `foreground: true`, so iOS handles the tap in the background and does not open the app. The plugin only passes the tap to JS through `notifyListeners(..., retainUntilConsumed: true)`, and the JS listener is added inside `readyAgain`, which runs only when `#remind()` lays out at least one reminder in this session.
  - App killed (the usual case hours after the last use): a background launch connects no scene, so no bridge or WebView is created. Capacitor's notification delegate is installed by the bridge, so it is likely nothing receives the response at all.
  - App suspended: the WebView's JS is suspended too. The event is kept and only runs when Dan next opens the app. It then schedules the repeat for 10 minutes after *opening*, and only if a reminder gets laid out in that session (otherwise the listener never exists).
- **What Dan sees:** he taps "Again in 10 min" on the lock screen and nothing comes 10 minutes later. Sometimes a stray repeat arrives 10 minutes after he next opens the app.
- **Fix:** handle the action natively. Add a small `UNUserNotificationCenterDelegate` step in Swift (or in AppDelegate before launch returns) that, for action `again`, schedules a copy of the request content 600 s later with an id from 240–245. Or make the action `foreground: true` (it then opens the app, which is less calm). Test it on the phone with the app killed.

### 2. Reminders keep the old time zone's moments after Dan travels (bug, confirmed by code)
- **Where:** `app/src/ui/game.svelte.ts:305-307` (the `#reminded` key), `:317-319`; the comment at `core/reminders.ts:7` promises that wall-clock times "move with Dan".
- **Reasoning:** each reminder is scheduled as an absolute instant: Capacitor turns `at` into a `UNTimeIntervalNotificationTrigger`. The instant is worked out from local wall time at the moment of scheduling. On return (`wake` → `reminders()`), the cache key is built only from wall-clock strings (`date`, `clock`, words) plus the nudge time. After a time-zone change these strings are identical, so `#remind` returns early and nothing is re-laid. DST is fine, because JS works out each future day's offset correctly. Moving between zones is not.
- **What Dan sees:** after a trip abroad (or back), "Gym at 18:00" sounds at 17:00 or 19:00 local time for up to a week, until the list changes or the app is cold-started.
- **Fix:** put the scheduled instants (`when.getTime()`) into the key, or add the current UTC offset.

### 3. A lock can be read as "went into another app" because of a leftover 15-second timer (bug, suspected)
- **Where:** `app/ios/App/App/AwayPlugin.swift:79-88`, `:105-124`, `:126-133`.
- **Reasoning:** each trip to the background schedules `decide()` 15 s later with `asyncAfter`. Coming back (`foreground`) clears `reading`, but not that scheduled call. Example: Dan goes to another app at T0, comes back at T0+5 (correctly never paused), then locks the phone at T0+8. The T0+15 `decide()` from the first trip fires, finds the second trip's `reading` only 7 s old and judges it. With a passcode, "protected data going away" comes about 10 s after the lock, so it is not there yet. The judgement then rests on the `com.apple.springboard.lockcomplete` Darwin notice alone (and on brightness reading 0, which some phones never report). If that notice is late or missing on his iOS version, the lock is read as leaving. The delve is paused from T0+8, its alerts are removed, and the lock-screen panel turns red.
- **What Dan sees:** "Paused while you were away" after he only locked the phone, shortly after a quick look at another app. This is the outcome D-094 says must never happen.
- **Fix:** give each trip a token (a counter or the `at` date), and make the delayed `decide` act only if `reading` still carries that token. Also end the old background task on `foreground` (this is already done).

### 4. Restore accepts a file the game cannot run, writes it over the save first, and then the app fails at every start (bug; urgent if it happens, unlikely)
- **Where:** `app/src/core/save.ts:21-35` (`readSave` checks only `version` and that `facts` is an array); `app/src/ui/Settings.svelte:45-61`; `app/src/ui/game.svelte.ts:372-379` (`saves.write` before `settle`); `app/src/ui/main.ts:37-46`.
- **Probe:** `F1`. A version-2 file whose facts include `null`, or a fact whose `at` is not a time, passes `readSave`. Then `settle`/`act`/`see` throw (`not a moment: …`, or a TypeError). Numbers and `{}` facts are accepted and carried along silently. A file from a newer build that has the same version number and unknown fact types is accepted too.
- **What Dan sees:** after Restore, the screen breaks. Every later start shows "Something went wrong starting up. Your save is safe." with only "Try again". The previous save exists only as the copy `save.v1.before-restore.<ms>` inside SQLite, and nothing in the app can bring it back. Settings, and so Restore, can't be reached.
- **Fix:** before writing, check the restored save by running it: `settle` + `see` in a try, and require every fact to be an object with numeric `seq`, a parseable `at` and a string `type`. Write only if that succeeds, and otherwise show "settings.restore.bad". Separately, see minor 17: give the start-up error screen a "Save a copy" button and an "Undo the last restore" option.

### 5. A save this build cannot read is replaced by a fresh game, silently, with no way back in the app (bug, latent)
- **Where:** `app/src/ui/game.svelte.ts:178-191` (`keptAside` is set but no screen reads it: `grep keptAside` finds only this file); `:47-53` (the fresh start is then written over the live key).
- **Reasoning:** a save from a newer version (for example after Dan rolls back a TestFlight build once `SAVE_VERSION` becomes 3), or one with no migration step, makes `readSave` return null. The raw text is kept as `save.v1.kept.<ms>` and the game starts empty, writing new facts under `save.v1`. Going forward again to the newer build then reads the *fresh* save. The progress sits only in a copy that no screen lists or restores, and the weekly copy in Files is the only route back.
- **What Dan sees:** an update (or rollback) opens on a brand-new game with no word of explanation.
- **Fix:** show `keptAside` (one calm line in Settings, plus a "Bring it back" that restores it once a build can read it). Better still, when the save is from a newer version, refuse to start rather than writing a fresh one ("This save is from a newer version: please update").

### 6. The calendar is written into the save again whenever EventKit returns the same events in another order (bug; confirmed in rules, order behaviour suspected)
- **Where:** `app/src/core/game.ts:1393-1401` (compares `JSON.stringify` of the arrays in order); `app/ios/App/App/CalendarPlugin.swift:65-66` (no sorting).
- **Probe:** `F2`. The same two events read as [a, b] and then [b, a] make a second `calendarRead` fact.
- **Reasoning:** `EKEventStore.events(matching:)` makes no ordering promise (Apple's own samples sort the result). The calendar is read on every open, every return and every `EKEventStoreChanged`, which fires on account syncs too. Each `calendarRead` fact holds up to 400 events with titles, so it could be tens of KB. Over months the save, its daily backup and the weekly copies can grow a lot, and start-up replays all of it.
- **What Dan sees:** nothing at first. Later, a slower start, bigger copies, and his calendar titles repeated many times in every copy.
- **Fix:** sort by `(start, id)` in Swift, and again in `act` before comparing. See also minor 11.

### 7. "Again in 10 min" repeats and the delve's alerts are not tied to what the game knows now (bug)
Two related problems:
- **(a) A snoozed reminder is never cancelled (confirmed).** `game.svelte.ts:308` cancels only `REMIND_IDS` and `NUDGE_ID`, never `AGAIN_IDS` (240–245). If Dan snoozes a reminder and then marks the job done or deletes it, the repeat still sounds. **Fix:** cancel `AGAIN_IDS` whose `extra` names a job that is done or gone. Simpler: cancel all of them whenever reminders are laid out again because the list changed.
- **(b) `alerts()` calls are not serialised (suspected, timing).** `game.svelte.ts:276-288`. Each call cancels, reads the run, awaits `permit()`, then awaits up to 24 `at()` calls one after another. A second call (Pause, Finish here, `away` on return, Restore) can cancel while the first is still adding, and the first then adds stale alerts after the cancel. **What Dan sees (rarely):** a "the delve has ended" alert for a delve he had paused or finished. **Fix:** chain `alerts()` the way `reminders()` is chained, and recompute the list after `permit()`.

### 8. A delve job from Siri can be cleared from the inbox before it is in the save (bug, small window; contradicts `product/scope/10-widget-share-siri.md`)
- **Where:** `app/src/ui/game.svelte.ts:92-101`; `app/src/platform/saves.ts:67-70`.
- **Reasoning:** `do({ do: 'takeInbox' })` only *queues* the SQLite write (`send` chains on `queue`). `inbox.clear` is sent at once on another plugin and usually lands first. If the app is killed in those milliseconds, the line is gone from the inbox and was never committed. The scope page says "If the app is killed half-way, nothing is lost or doubled". `AwayPlugin.take` (`AwayPlugin.swift:63-71`) has the same shape: the leave time is deleted natively before the `away` facts are written.
- **Fix:** expose `flush()` on `Saves` (it already exists on `SqlSaves`) and `await platform.saves.flush?.()` before `inbox.clear`. For Away, clear `leftKey` with a second call after the write.

---

## Minor

9. **The reminder cache is set before the reminders are actually laid out (confirmed).** `game.svelte.ts:306-311`. If Dan refuses notifications and later allows them in iOS Settings, or one `remind()` throws part-way, the same key returns early on every later return. Nothing is scheduled until the list changes or the app cold-starts. **Fix:** set `#reminded` only after the loop completes.

10. **Pending delve alerts survive swiping the app away (suspected, possibly by design).** `AwayPlugin.swift` only judges a trip once 15 s have passed, so a force-quit, or iOS killing the app in that window, records no leave time. The delve keeps counting and its "delve ended" alerts still sound. **Fix (if wanted):** stamp `leftKey` in `applicationWillTerminate` (sometimes called) or at `background()` time, with a "confirmed" flag set by `decide()`.

11. **The calendar read is cut at 400 events before sorting (suspected).** `CalendarPlugin.swift:66`. With an unsorted result, near events can be dropped and far ones kept. **Fix:** sort by start, then cut.

12. **`sqlSaves.write` checks only the last stored fact (confirmed, hardening).** `saves.ts:85-86`. Probe `F3`: a different, longer log that matches only at the old last index is written as an append, and the old first facts stay. No current code path does this (Restore of a longer, different log is the closest), but it is one string comparison away from silent mixing. **Fix:** compare the first fact too, or keep a hash of the prefix.

13. **One write that never answers stalls every later write, and start-up with them (confirmed in JS, native cause suspected).** `saves.ts:67-75`. Probe `F4`: `flush()` never settles and `failed` is never called, so `adopt()` → `ready()` → `main.ts` would leave a blank phone. **Fix:** a timeout on `db.run` (say 10 s) that counts as a failure and falls back.

14. **A copy Dan saves by hand into the app's own folder counts as the weekly copy and gets pruned (confirmed).** `core/save.ts:39-49`, `CopyPlugin.swift:79`. Probe `F5`. "Save a copy" → "On My iPhone → Long Answer" uses the same name pattern. It postpones the weekly copy and is deleted with the oldest four. **Fix:** a different prefix for the weekly copies ("Long Answer weekly …").

15. **The "daily" backup is overwritten on every cold start (confirmed).** `game.svelte.ts:192-202`. `#backedUp` starts empty in each session, so the backup holds the state at this launch, not yesterday's. A bug that spoils the save today also spoils the backup on the next relaunch. **Fix:** store the backup's day in the copy's key or in the settings store.

16. **The Live Activity's calls run as unordered Swift `Task`s (suspected).** `DelvePanelPlugin.swift:63-81`, `:105-110`. Two `show` calls close together for a new run can both see no panel and make two of them, one of which then never updates. A later `show` can also be applied before an earlier one, and an `end` racing a `show` can leave a counting panel behind (`#panel` is then `'none'`, so the app never ends it again). **Fix:** run these on one serial actor (`@MainActor` on the Tasks), or keep a per-run in-flight flag.

17. **The start-up error screen offers only "Try again" (confirmed).** `main.ts:42-45`. If the rules ever throw on the real save, Dan has no way to save a copy or undo a restore. `readKept()` (`index.ts:31-34`) is also unguarded inside `ready()`. **Fix:** a "Save a copy of my save" button there (it can read `platform.saves.get` directly), and a try/catch around `readKept`.

18. **The phone's own banner and sound appear on top of the delve screen at a delve's end (confirmed from plugin defaults).** `capacitor.config.ts` sets no `presentationOptions`, so `willPresent` shows banner, sound and list while the app is open, together with the in-app chime. **Fix (if not wanted):** `presentationOptions: []`, or `foreground: false` on the delve alerts.

19. **The long-press on a row has no haptic on the iPhone (confirmed).** `SwipeRow.svelte:38` uses `navigator.vibrate`, which WebKit does not have. **Fix:** `platform.haptics.tick()`.

20. **Sound after an interruption, and a sound engine that keeps running (suspected).** `platform/chime.ts:10-14` resumes only from `'suspended'`, but WebKit also reports `'interrupted'` after a call or Siri, which can leave chimes silent. The `AudioContext` also stays running for the whole session once a tap has unlocked it, rendering silence, which is relevant to the heat work in D-132. **Fix:** resume on any state except `'running'`, and `ctx.suspend()` a few seconds after each chime.

21. **The storyboard and the SceneDelegate each make a window (suspected).** `Info.plist:40` (`UISceneStoryboardFile` = Main, whose initial view controller is a `CAPBridgeViewController`) while `SceneDelegate` builds its own window with `MainViewController`. UIKit instantiates the storyboard's controller first. Its view is probably never loaded, so there is no second bridge, but there would be if anything touched it. **Fix:** remove `UISceneStoryboardFile` and `UIMainStoryboardFile`.

22. **A job from Siri while the app is open on screen waits for the next return (suspected).** Siri and the Action button only make the app inactive, and `drain()` runs on open, return and `focus` only. **Fix:** on `UIApplication.didBecomeActiveNotification`, `notifyListeners('inbox')` from `InboxPlugin`, or post a notification from `AddToSatchel.perform`.

23. **Copies kept aside are never pruned, and the fallback rewrites the whole save to UserDefaults on every fact (confirmed).** `.kept.<ms>`, `.before-restore.<ms>` and `.v<n>` accumulate in SQLite. Once SQLite has failed, `textSaves` stores the whole save JSON in `Preferences` on every fact, which happens about once a minute or more during a delve. **Fix:** keep the newest two of each kind. Ignore the fallback cost unless it is ever seen.

24. **Unhandled promise rejections (confirmed).** `index.ts:28-29` (`void Preferences.set/remove`), `game.svelte.ts:218` and `:382` (`void this.alerts()` has no catch; a rejected `schedule` also skips the remaining alerts), the `void platform.haptics.*` callers. These are harmless in WebKit (logged only), but one failed `at()` leaves the rest of the run's alerts unscheduled. **Fix:** `.catch(() => {})` and a per-alert try.

---

## Checked and found sound
- SQLite: `BEGIN IMMEDIATE`…`COMMIT` with rollback (`SavePlugin.swift:33-56`), WAL with `synchronous=FULL`, one serial queue, file in Application Support (backed up, never purged), protection until first unlock (writable while locked).
- A failed write: in memory nothing is lost. `failed` copies `sql.all()` into the settings store, and the next start's `adopt` (the longer log wins) brings it back into SQLite with only the new facts appended.
- A kill mid-write loses at most the facts still queued in JS, a few milliseconds' worth. The transaction is all or nothing.
- Versions: v1 saves are kept aside and the game starts again (as documented); `tests/saves/v2.json` loads. `MIGRATIONS` is empty, so there is no path yet to get wrong.
- DST: delve alerts are instants; reminders are worked out per day with that day's offset. The 04:00 turn in `wallOf` puts times before 04:00 on the next calendar date.
- The notification budget: 24 + 30 + 6 + 1 = 61, under iOS's 64.
- The Live Activity's "after" state and the `hold` on leaving are consistent with `panel.ts`. A panel left by a killed app is ended at the next start (`#panel` starts as `''`).
- Inbox: a lock around file reads and writes, atomic writes, ids, and a dedupe by `ref` in the rules.
