# Deep review: the rules engine (app/src/core)

> One of six adversarial reviews (round 5, branch `claude/review-round-5`). The focus here is the rules engine: minutes, Keys, carried "Not yet" minutes, the 04:00 day turn, weeks, DST, travel, recurring periods, edits and deletes, errand runs, ticks, the finish line and the story's pace.
> Probes: `app/tests/review/deep-rules.test.ts` (11 tests, all passing). Each probe asserts the bug **as it behaves now**, so a passing probe means the bug was reproduced. Once a bug is fixed, flip its assertion.
> Spoiler-free: ids and numbers only.

## Confirmed bugs (reproduced)

### 1. urgent: the night's 15-minute head start is paid again on every app start when no morning find is left
- **Where:** `app/src/core/game.ts:819` (the guard) and `:821` (the payment), in `morningAfter`, which `open` calls every time (`:1030`). The UI sends `open` on every cold start (`ui/game.svelte.ts:53`, and `restore`/`reset`).
- **Cause:** the only thing that marks "this night's head start was paid" is a later `findGiven` with `why: 'morning'`. When `pickFind` has no find to give (the pool for that stretch and week is used up), `giveFind` writes nothing. Each later `open` then sees an unpaid night and writes another `stepsGained {job:'sleep', minutes: 15}`. This repeats on every later day too, for as long as that night is the last one kept.
- **Real content, not just a contrived save:** a simulated Dan with on-time bedtimes reaches this state in week 4. In 6 weeks, 6 of 41 kept nights had no morning find (22 and 23 Oct, 2, 3, 4 and 8 Nov).
- **Repro:** `Morning head start … › BUG: with no find to give, every later "open" … pays the 15-minute head start again`: 5 opens the next morning give 75 minutes, and two more opens 3 days later give 105. `… › BUG (real content): five weeks of on-time bedtimes, then four app starts on 2 Nov pay the head start four times`.
- **What Dan sees:** the flame jumps 15 minutes each time iOS restarts the app. Places and side chambers can arrive with no work done. This breaks rule 10 and D-083 ("once per night").
- **Fix:** guard on the payment itself, not on the find. Skip if any `stepsGained` with `job === 'sleep'` exists with `seq > night.seq`. Give the find separately, and only once.

### 2. bug: an every-N-days job kept up more often than every N days earns its first Key, then never another
- **Where:** `app/src/core/game.ts:545` (`sessionsIn(...) === needOf(r)`) with `app/src/core/repeat.ts:47` (the period of an every-N-days rhythm is a sliding window of the last N days).
- **Cause:** `needOf` is 1. Any two sessions within N days make the window count 2, so the `=== 1` test is never true again. Example: every 3 days, done every 2 days. Day 0 gives a Key. Day 2 gives nothing (keyed already). Day 4 has days 2 and 4 in its window, so the count is 2. The same holds every day after.
- **Repro:** `Keys: every N days › BUG: an every-3-days job kept up every 2 days earns its first Key, then never another` gives 14 sessions in 28 days and 1 Key. The control `… every 3 days exactly earns a Key each time` gives 9 Keys. Doing more earns less.
- **What Dan sees:** after the first one, no Key ever again for that job. There is not even FIX-LIST 1.11's "Already earned…" line: `keyAlreadyOf` (`game.ts`, `keyAlreadyOf`) finds no Key in the current window, so it says nothing.
- **Fix:** for `everyDays`, land the Key when `!keyedAlready && sessionsIn(min 5) >= 1`. `keyedAlready` already means "no Key from this rhythm in the last N days". For the other periods, `>= need` with `keyedAlready` is equivalent to `===` except after a capped week, so it could be used throughout if the cap's meaning is kept.

### 3. bug: a recurring job's short first session swallows the day's real session ("Delve again" never joins it)
- **Where:** `app/src/core/game.ts:595-596` (`sessionEnds` requires `!doneOn(day)`) and `:545` (only sessions of ≥ 5 minutes count towards a Key).
- **Cause:** a recurring delve that ends with any whole minute is that day's session, so Finish here after 3 minutes gives a done record of 3 minutes. The job menu then offers **Delve again** (`ui/JobMenu.svelte:65`). Its run moves the road, but `sessionEnds` is false (already done today), so the hour never joins the session record. The session stays at 3 minutes, which is under `RETURN_MIN`: it has no return, does not count towards the Key, and does not count as work on the day (`workedOn`).
- **Repro:** `Recurring job: a short first session… › BUG: a 3-minute gym session then a 60-minute "Delve again"…`: the done records are `[3]` and the road shows 63. `… › BUG: …so a week of four real gym sessions earns no Key`: the records are `[3, 60, 60, 60]` and 0 Keys for `r-gym` (`times: 4`).
- **What Dan sees:** he did four gym hours and got no Key and no word why. The only way out is "Not done after all" *before* delving again, and nothing tells him that.
- **Fix:** when a run on a recurring job ends and that day's standing record is under `RETURN_MIN` (or always, for "Delve again"), write `doneUndone` for it and then `markDoneIn` again. `ownDay` already sums every delve of the day, and `paidBefore` stops anything being paid twice. Another option: Delve again on a done record under 5 minutes goes through notDone first.

### 4. bug: "Not done after all" on a ticked-off job keeps its ticked minutes, and ticking it off again pays them again
- **Where:** `app/src/core/game.ts:1136` (`notDone` only writes `doneUndone`), `:1123` (a one-off taken back may be ticked again) and `:1131` (the tick's `stepsGained` is written again in full). `markDoneIn` `:517` (`ownDay` sums every tick of the day for a recurring job).
- **Repro:** `"Not done after all" then ticked off again › BUG: a one-off ticked at 3 h by mistake, taken back, ticked at 30 min…`: the road shows 210 and the records are `[180, 210]`. `… › BUG: the same loop on a recurring job…`: 120 taken back, 60 given, the road shows +180 and the session 180.
- **What Dan sees:** he corrects a wrong "How long did it take?" (180 picked instead of 30). The correction adds 30 to the wrong 180 instead of replacing it, and the record then shows 210 minutes. The loop (tick 3 h → take it back → tick 3 h…) also mints unlimited road minutes for one job, against rule 10. With delves this is fine, because their minutes are real. Ticks are claims, and a taken-back claim should not stand.
- **Fix:** when a done record carrying `ticked` is taken back, take back its tick too. Options: a `stepsGained` correction, or no stepsGained when re-ticking up to the taken-back amount ("On top of" counts only the delved minutes). At least, a re-tick after a take-back should pay only `max(0, new − taken back)`.

### 5. bug: a single move that passes a place, the next side chamber and the next place skips that chamber for good
- **Where:** `app/src/core/game.ts:439-457` (`reach()` arrives at every place in reach in one loop) and the `sideChamber` calls only before and after it (`:1131`/`:1133` for ticks, `:634` and the `settleIn` loop for delves).
- **Cause:** `chamberFound` and `toChamber` only look at the stretch since the *last* place reached. When two places arrive in one go, the chamber of the stretch between them is never checked. This happens with a 3-hour tick, or when minutes piled up while no place was reachable and then several arrive at once.
- **Repro:** `The side chamber halfway (D-122) › BUG: a 180-minute tick that passes a place, the next chamber and the next place skips that chamber for good`: at 400 minutes walked there are 3 places and 2 chambers. The one at 300 is never found, and the road now reads 375 → 450.
- **What Dan sees:** a side chamber (and its find) is missing from the stretch. This is quiet and nobody is told, but D-122's "one halfway on every stretch" fails.
- **Fix:** in `reach()`, before each `arrive`, call `sideChamber` for the stretch being closed. Or give each chamber passed on the way (`chamberAt` of each stretch ≤ walked) before the next arrival.

## Minor (reproduced)

### 6. minor: flying west after 04:00 sends the game day back, and the log's days run backwards
- **Where:** `app/src/core/game.ts:368` (`day = gameDay(now)`, with only `at` held to time order) and `time.ts` `gameDay`.
- **Repro:** `Clocks › MINOR: flying west after 04:00 sends the game day back…`. A gym session on Tuesday at 04:30 London, then the app opens in New York at 02:00. Today reads Monday again, and a second gym session is written to Monday, after Tuesday's facts. Nothing crashes and no minutes are lost or doubled (real time is counted). But Monday's list, a closed week's Daybook page (if the trip crosses Sunday → Monday) and the weekly count can change after the fact, and one real morning can give two sessions of a 4-a-week rhythm.
- **Fix (if wanted):** never let the game day go back behind the latest `opened` day. Write new facts on `max(gameDay(now), lastOpenedDay)`.

## Checked and holding (no finding)
- DST, 25 Oct: a 2 × 90 delve begun 00:30 BST and settled at 02:30 GMT counts 90 + 85 minutes of real time. Nothing is lost or doubled (`Clocks › holds: …`). `gameDay` reads wall clocks, the change happens at 01:00–02:00 and the day turns at 04:00, so the two never meet. Reminders use wall clocks.
- Delves across 04:00: a recurring run's session goes on its own day, and `crossedIn` never pays a one-off twice. A held delve finishes at its pause on a new day or after 3 h.
- Carried "Not yet" minutes (D-133): delete and Undo keep them (same id). Ticks and errand shares join the carry. The road is moved once.
- Keys: one per rhythm per period, also after "Not done after all" and redo (`keyedAlready`). The cap of 5 a week holds. The fortnight anchoring (`repeat.ts` `sameFortnight`) is consistent across years. Monthly last-day and nth-weekday rules and the yearly 29 Feb rule are correct.
- Errand runs: a pending "What got done?" is counted before any other command and never twice. A strike with a share of 0 marks nothing done.

## Suspicions (not reproduced as bugs, worth a look)
- **A one-off with "Not yet" minutes made recurring loses them from its own count.** `carriedOf` returns 0 for any job with a rhythm (`game.ts`, `carriedOf`), so its first session counts only that day's minutes. The road keeps them. Minor.
- **A rhythm stopped mid-week can still land a Key that week.** The Key reads the rhythms as they stood at the week's start (`game.ts:540`, `W.live(…, calendarWeek(day))`), so a stopped job's session can still land it. This is by D-043 F7's logic, but surprising.
- **`paidBefore` for a former recurring job** (`game.ts`, `paidBefore`) treats any undone session of ≥ 5 minutes from its recurring past as "already paid". A job turned from recurring to one-off may then never get its one return.
- **`pauseAway` stamps the hold no earlier than the log's last fact** (`game.ts`, `pauseAway`). If a background write (a Siri inbox drain or a calendar read) lands with a time after Dan left, the hold moves later and that time away counts. Not reproduced. It depends on the order of the UI's wake calls (`away` runs first today).

## Counts
- urgent 1 (#1), bug 4 (#2–#5), minor 1 (#6) confirmed; 4 suspicions.
