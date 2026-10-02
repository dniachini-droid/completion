# Deep review, round 5: independent verification

Verifier: one skeptical pass over the findings named in the brief, on branch `claude/review-round-5` (2026-10-01). Nothing in
`app/src` or the existing tests was changed. Spoiler-free: ids and numbers only, and no story text, place names or painting
contents.

**How each was checked.** I read every code path from start to end. Where I could, I also reproduced it:
- `app/tests/review/deep-verify.test.ts` loads the real `ui/game.svelte.ts` against a stand-in phone that records every
  call (notifications, panel, away). It has 6 probes, all passing; each asserts the behaviour **as it is now**. Vitest
  compiles `.svelte.ts` for the server, so `$state` is a plain value there. Probes that need client reactivity were run in
  the browser instead.
- Playwright scripts run against `vite preview` on port 4189:
  - `deep-verify-f2.mjs`: Not yet, then a note, then Back to today. It logs every save write.
  - `deep-verify-daybook.mjs`: the Daybook's Plan it for me and Look ahead → pin. It logs every save write.
  - `deep-verify-wake.mjs`: the game day turns while the app is open.

  These scripts use the carried saves in `/tmp/claude-weeks/`.
- The reviewers' own probes were re-run where relevant (`deep-rules.test.ts` → head start).

**Counts:**
- **40 real, 0 not real, 2 uncertain**, out of 42 findings.
- Of the 40 real ones, 7 are **real as designed**. The code does what an earlier decision chose, so whether to change it
  is Dan's call, not a defect.
- Several severities are lower than the reviewers rated them.
- **One new urgent finding (NEW-1)** turned up while verifying THREE-WEEKS F2. It is the real cause of F2, and it is
  worse than F2.

---

## NEW-1 (urgent, found here): a screen's teardown that writes a fact erases the facts written in the same tap, from memory and from the save

- **Mechanism (Svelte 5.57, client build).** While a component is being destroyed, any `$state` read that changed in the
  current batch returns its **value from before the batch**. This is Svelte's `old_values`, used when
  `is_destroying_effect` is set (`node_modules/svelte/src/internal/client/runtime.js:659`). `game.facts` is such a
  source.
  - Two teardowns call `game.do()`:
    - `Delve.svelte:139`, which calls `keepNote()` and `park`.
    - `Daybook.svelte:59`, which calls `read()`.
  - They run during the flush that follows a tap which has already written facts and changed screen.
  - Each one therefore runs `act()` on the old log and sets `this.facts = old.concat(new)`. That drops every fact the tap
    wrote, and `save()` writes the shorter log. On the phone, `sqlSaves.write` sees fewer facts than it holds, so it runs
    `DELETE FROM facts` and rewrites the log (`platform/saves.ts:85-92`).
  - The log is supposed to only ever grow. Here it shrinks.
- **Reproduced in Chromium (save writes logged):**
  - **Daybook → Look ahead → pick what matters most.** The tap writes `itemKept`, `weekPinned`, `planMade` (replan),
    `offerAnswered`, `lookAheadSeen` and `closeRead` (seq 219–224). Then the teardown rewrites the log with only
    `219:closeRead`. **Dan's pinned job and the replan are gone.**
  - **Daybook → Plan it for me.** `offerAnswered` is lost the same way.
  - **Delve end → Not yet → type where you stopped → Back to today.** The writes are `18:jobSaved`, then `19:seen`, then a
    rewrite to `18:jobSaved`. The `seen` is erased, so the delve's end comes back after the arrivals. **This is THREE-WEEKS
    F2.** The reviewer's guess at the cause (the order of two commands) is wrong.
  - Same cause, not run but certain by trace:
    - Not yet + a note → the Satchel: the `seen` is lost, so the end asks again.
    - The phone's back, or the arrow, on a delve's end with a note typed: `go()` writes `seen` (`App.svelte:88`), then the
      teardown erases it.
- **Would Dan hit it?** Yes:
  - every week the Daybook's look-ahead is used;
  - every time he types where he stopped and leaves.
- **Minimal fix** (`ui/game.svelte.ts:42`, `:208`, and each assignment of `facts`). Keep the true log in a plain private
  field and compute from that, never from the signal:
  ```ts
  #log: Fact[] = [];
  // append(f): this.#log = this.#log.concat(f); this.facts = this.#log; this.save();   (save() writes this.#log)
  // do(): act(this.#log, ...); load/restore/setRehearsal/reset: this.#log = ...; this.facts = this.#log;
  ```
  The teardowns then compute on the real log. Their guards may still see old values, but core already dedupes:
  - `closeRead`/`offerAnswered` are once per week (`core/game.ts:1376-1377`);
  - `noteJob` with the same text writes nothing (`:1204`).
  - Belt and braces: give `Delve`/`Daybook` a plain (non-`$state`) `done` flag that `leave()` sets, so their teardowns do
    nothing after an explicit exit.
- **Risk:** every place that assigns `this.facts` must also set `#log`. There are 5, all in `game.svelte.ts`. Add a
  flow that checks the save after Look ahead → pin, and after Not yet + note → Back to today.

---

## Verdicts

Severity is judged for Dan on his iPhone. Where it differs from the report, the reviewer's rating is shown as *(was …)*.

| Finding | Verdict | Real severity | Evidence (one line) | Minimal fix | Risk |
|---|---|---|---|---|---|
| CODE #1 Delve now: no alerts / panel | **REAL** (reproduced) | **urgent** | Probe: after `delveNow` the phone log is only `watch:true`; no `cancel`/`at`/`panel:show`. Pause→resume then lays them out | `game.svelte.ts:218`: add `'delveNow'` to the list; more robust: `if (before?.seq !== this.view.run?.seq \|\| before?.phase !== this.view.run?.phase)` | None. `alerts()` and `panel()` are idempotent. The first Begin's permission prompt now also shows on this path (wanted) |
| CODE #2 Monday Daybook arrow "In the morning" | **REAL** (reproduced) | bug (cosmetic, weekly on Mondays after a kept bedtime) | Browser: Morning → Today → Daybook arrow "IN THE MORNING"; Plan it for me → Week arrow "IN THE MORNING"; back from it flashes the Morning | `App.svelte:109`: when `to==='today'` is redirected, reset `trail = []` before the LOOK branch (a redirected screen is a root) | Low. The Daybook's back then goes straight to Today, as intended (D-144 §9) |
| CODE #3 day turn keeps a stale trail | **REAL** (trace; partly seen) | minor | `App.svelte:70` sets `screen = first()` and never clears `trail`/menus. In my run the Morning path hid it (Morning's own `go('today')` resets the trail); without a morning, `first()` = Daybook and its arrow names yesterday's screen | One `home()` helper: `trail = []; closeMenu(); closeTick(); closeRows(); game.deleted = null; screen = first(); arg = undefined`, used at `:70` and `:238` | Low |
| CODE #4 Week Next ⇄ This leaves a dead back step | **REAL** (trace) | minor | `Week.svelte:227` passes `thisWeek` (defined), so `App.svelte:115` replaces instead of popping; `nameOf` (`:132`) says "Next week" for any truthy arg | `Week.svelte:227`: `go('week', isNext ? undefined : addDays(thisWeek, 7))`; `nameOf`: compare with `calendarWeek(game.view.day)` (+7 → next, beyond → `week.later`) | Low. `go('week', undefined)` then matches the trail top and pops |
| CODE #5 tap during `away.take()` counts time away | **REAL** (trace) | cosmetic in practice | `do()` has no `#waking` guard, while `tick()` has one. But `take()` is one local native call (ms); a human tap after an app switch comes ≥300 ms later. Only hit if the bridge stalls (up to the 2 s timeout) | `game.svelte.ts:213`: `if (this.#waking) { void this.#waking.then(() => this.do(cmd)); return []; }` (only for run commands) | Callers that use the return value (`Satchel` reads `game.view.run` right after) would see the old state; limit it to `finishHere`/`stepAway`/`resume`/`skipBreather` |
| CODE #6 failed calendar read = empty calendar | **REAL** (narrower than stated) | minor | JS `events()` returns `[]` on error, and **Swift also resolves `[]` when access is revoked** (`CalendarPlugin.swift:50`). Revoked → empty is arguably right; a JS bridge error is rare | Swift `events`: `call.reject("denied")` when not allowed; JS `events()` returns `null` on error; `readCalendar` skips on `null` (`game.svelte.ts:107`) | Revoking access then keeps the old events shown until it is turned off in Settings. Say so, or clear on a definite "denied" |
| CODE #7 / PLATFORM #7b `alerts()` unserialised | **REAL** (reproduced) | minor (rare) | Probe: Begin, then Pause while the first `alerts()` is part-way through its `at()` loop → **4 delve-end alerts left scheduled for a held run**. Needs a Pause within the ~24 native round-trips after Begin (or `away` + Carry on) | `game.svelte.ts:276`: `alerts() { return (this.#alerting = this.#alerting.then(() => this.#alerts()).catch(() => {})); }`, reading `this.view.run` after `permit()` | None |
| CODE #8 place name opens the word left for later | **REAL** (minor; partly defensible) | polish | `Arrival.svelte:24-25,36`: `v.arrival` wins over `again`, and `word` is true, so the Cut reopens. If the word's place is the newest place, the name *is* that place (defensible); if places were reached after it, the tap opens the wrong thing | `Arrival.svelte:24`: `const a = $derived(seq !== null && again ? again : v.arrival ?? …)` with `again` computed whenever `seq !== null`; keep `word` false for an explicit read-again | Reading the word's own place "again" must not reveal it uncut. Show the quiet "A word waits" link instead |
| CODE #9 tick's count replays on remount | **REAL** (trace) | polish | `Step.svelte:50,56`: `mode={moved ? 'play' : 'still'}` with no memory | Record `moment.ends[seq] = { played: true }` once played (as Delve does) and pass `'still'` after | None |
| CODE #10 RunSet goes to the delve after a refused run | **REAL** (trace) | cosmetic (rare) | `RunSet.svelte:146-147` (and `CantStart.svelte:23-24`) call `go('delve')` without checking `game.view.run` | `if (!game.view.run) return;` (plus a line) before `go('delve')` | None |
| PLATFORM #1 "Again in 10 min" | **REAL** (high confidence by code; not run on a phone) | bug (only if Dan uses reminders) | The action has no `foreground`, so iOS handles it in the background. The plugin passes it to JS only via `notifyListeners(..., retainUntilConsumed)`; the listener exists only after `#remind()` ran this session; a killed app gets a background launch with no bridge | Simplest: `actions: [{ id: 'again', title, foreground: true }]` (`platform/index.ts:97`): it opens the app (less calm). Proper: a native `UNUserNotificationCenterDelegate` step that reschedules +600 s | `foreground: true` brings the app forward on the tap. Test on the phone with the app killed |
| PLATFORM #2 reminders keep the old time zone | **REAL** (trace) | minor *(was bug)* | Cache key `game.svelte.ts:305` holds wall-clock strings only. But the list changes as soon as a reminder passes or any fact changes it, so the wrong time lasts to roughly the next open after one fires, not a week | Add the instants: `words.map(w => [..., this.realDate(...).getTime()])`, or `new Date().getTimezoneOffset()`, into the key | None |
| PLATFORM #3 stale 15 s timer reads a lock as leaving | **REAL** (logic; low likelihood) | minor | `AwayPlugin.swift:87`: `asyncAfter` from the first trip calls `decide()` on the second trip's `reading` 7 s in. A lock still posts `lockcomplete` at once, so it misreads only if that notice is late or missing. It does shorten "another app" to under 15 s | A `trip` counter: `let n = trips += 1; asyncAfter { if self.trips == n { self.decide() } }` | None |
| PLATFORM #4 Restore accepts an unrunnable file | **REAL** (reproduced) | minor (unlikely; serious if it happens) | Probe: `readSave` accepts `{version:2, facts:[null]}` and a fact with `at:'not a time'`; `see`/`settle` then throw. `restore()` writes before running it | `Settings.svelte:50` / `game.svelte.ts:372`: validate (each fact an object with numeric `seq`, string `type`, parseable `at`), then `try { see(s.facts.concat(settle(...)), …) } catch { said = t('settings.restore.bad'); return; }` before `saves.write` | Validation must accept every real fact type; check against `tests/saves/v2.json` |
| PLATFORM #5 unreadable/newer save replaced silently | **REAL** (latent) | minor today; bug once `SAVE_VERSION` moves | `keptAside` is read by no screen. Worse than reported: the comment says a newer save is "never written over", but `load()` returns `[]`, `open` appends, and `sqlSaves.write` sees a version mismatch, so it runs `DELETE` and rewrites the live key (the raw copy survives only as `.kept.<ms>`) | `game.svelte.ts:178-191`: when `readSave` fails on a *newer* version, refuse to start (a "please update" screen) rather than start fresh; show `keptAside` in Settings | None for today's saves |
| PLATFORM #6 calendar re-written on reorder | **UNCERTAIN** | minor | Code: `core/game.ts:1398` compares in order and `CalendarPlugin.swift:65` doesn't sort. Whether EventKit actually varies its order between calls is not verified | Sort in core before comparing: `events.sort((a, b) => a.start.localeCompare(b.start) \|\| a.id.localeCompare(b.id))` (and sort before the 400 cut in Swift) | One extra fact on the first read after the change |
| PLATFORM #7a snoozed repeat never cancelled | **REAL** (code) | polish (nested in #1: snooze rarely works anyway) | `game.svelte.ts:308` cancels `REMIND_IDS` + `NUDGE_ID` only | Cancel `AGAIN_IDS` too when the list is laid out again | A snooze is lost when the list changes. Acceptable |
| PLATFORM #8 Siri line cleared before it is written | **REAL** (code; ms window) | cosmetic | `do('takeInbox')` only queues the SQL; `inbox.clear` goes out at once on another plugin queue | `game.svelte.ts:99`: `await (platform.saves as { flush?: () => Promise<void> }).flush?.().catch(() => {});` before `clear` | If the flush rejects, the fallback already holds the facts; clearing is still safe |
| PLATFORM #18 banner + sound over the open delve | **REAL** (plugin defaults) | polish | No `presentationOptions` → `willPresent` returns banner/sound/list; the app also chimes | `capacitor.config.ts`: `LocalNotifications: { iconColor, presentationOptions: [] }` | Reminders while the app is open then show nothing. Probably right |
| PLATFORM #19 long-press has no haptic | **REAL** | polish | `SwipeRow.svelte:38` `navigator.vibrate` (absent in WebKit) | `void platform.haptics.tick()` | None |
| THREE-WEEKS F1 Use it here offered after use | **REAL** (save shows two `keyUsed` 10 s apart) | bug *(was urgent)* | `Return.svelte:29` lacks `chosen !== 'used'`. The second Key needs Dan's own second tap (not "spent for him"), but the line and the offer contradict each other | `offerHere = ... && chosen !== 'used' && ...` | None |
| THREE-WEEKS F2 "Back to today" returns to the end | **REAL** (reproduced; **cause is NEW-1**) | bug → see NEW-1 (urgent) | The `seen` fact is written, then erased by Delve's teardown | NEW-1 fix | — |
| THREE-WEEKS F3 word forced again after restart | **REAL** (code) | bug | `moment.wordLater` lives in memory only; `App.svelte:47` | Keep it per save: `platform.store.set(`${game.saveKey}.wordLater`, seq)`, read in `moment` init | Seqs from another save (a rehearsal or a restore) must not match: key it by the save |
| THREE-WEEKS F4 missed sessions pile onto the return day | **REAL, as designed** | clumsy; Dan's call | `core/week.ts:408-425` re-places a recurring job's missed sessions on the first day under `PLAN_MIN` (420 min) by design (D-131, PLANNER). It ignores an absence | In `weekAt`: don't re-place a missed session from a day that was never opened when today is a welcome-back day | Rules change: the L A1 tests on re-placed sessions must still hold |
| THREE-WEEKS F5 passed appointment vanishes | **REAL, as designed (one slip)** | minor | `slipped()` (`week.ts:465`) returns one item, a date first (P7 "never a list"), so the appointment is dropped | Product call. E.g. a "went by" note on the Satchel row for a passed own appointment | — |
| THREE-WEEKS F6 every 2 weeks = fixed fortnight | **REAL, as designed** | minor | `repeat.ts:12` uses an epoch fortnight; D-073 §2 "every-2-weeks once in the fortnight" | Product call: plan "every 2 weeks" like `everyDays: 14` | Changes Key periods |
| THREE-WEEKS F7 road line blank while a word waits | **REAL** (trace) | minor | Unseen arrivals are left out of story state, so `toNext = max(0, nextAt - w) = 0` → no `roadNotes.place` and an empty `aria-label` (`Today.svelte:129-136`) | When `v.arrival` is the word and `toNext === 0`, show the "word waits" line on the road | None |
| THREE-WEEKS F9 Not today refills the line | **REAL, as designed** | clumsy; Dan's call | The line is "first 3 h of the slate" (`game.ts:1757-1760`); an aside job leaves the slate, so the next one rises | Count aside jobs' room into `sum` (keep the line's size) | Changes when the day turns gold |
| THREE-WEEKS F10 added job lands in If there's time | **REAL, as designed** | clumsy | Same rule: Dan's own jobs come after planned ones in `cand` | Product call: a job added "to today" joins the line | Same |
| THREE-WEEKS F12 silent past the weekly Key cap | **REAL** | polish | `game.ts:545-553`: past `KEYS_A_WEEK` only a surplus find; `keyAlreadyOf` covers the period, not the cap | Return a `keyAlready: 'cap'` when `keysIn >= KEYS_A_WEEK` and add one copy line | None |
| THREE-WEEKS F16 CSP connect-src error for a painting | **UNCERTAIN** | none on the phone, as far as can be seen | Paintings load by `<img>` (img-src); the bundle's only `fetch`es are Vite's modulepreload polyfill (JS) and Capacitor's web http. No app code fetches a .webp; not reproduced | None until seen in WebKit | — |
| WORDS #1 "Each delve still starts at 30 minutes" | **REAL** | bug (wrong words) | `Rhythms.svelte:207` is unconditional; `presetRun` (`game.ts:1967`) opens recurring jobs at their own length | Two keys chosen by `d.often === 'once'` | None |
| WORDS #2 later week says "next week" | **REAL** | polish | `Week.svelte:144` uses `isNext` (any later week) | `wk === addDays(thisWeek, 7) ? 'week.none.next' : 'week.none.later'` | None |
| WORDS #3 arrow "Next week" for any later week | **REAL** (= CODE #4's naming) | polish | `App.svelte:132` | As CODE #4 | — |
| WORDS #4 Map says "Ahead" for a thing behind | **REAL** | minor (contradicts Today, D-143 S3) | `Map.svelte:77` always uses `today.ahead`; Today uses `v.aheadBehind` | `${v.aheadBehind ? t('today.behind') : t('today.ahead')}: …` | None |
| WORDS #5 "you delved" for ticked minutes | **REAL** | polish | `behindOf` (`game.ts:510`) counts `tickedOn` too; `en.ts:288` says "delved" | `'On top of the {min} already counted'` | None |
| WORDS #27 a new job ticked at 3 h = 180 min | **REAL, as designed (D-134)** | design tension with rule 10 | `tickOff` (`game.ts:1117-1133`): any `TICK_CHOICES` value, no gate | Dan's call (e.g. cap an undelved one-off's tick at 60) | Changes D-134 |
| WORDS #34 menu / tick sheet don't take focus | **REAL** | bug for VoiceOver only; Dan does not hit it unless he uses VoiceOver | No focus or `inert` handling in `JobMenu.svelte`/`TickSheet.svelte` | Focus the first button on open; `inert` on `.ui`; restore focus on close | Moving focus slid screens before (D-111): use `preventScroll: true` |
| WORDS #35 ring reads "min 25 minutes" | **REAL** | VoiceOver only | `EndRing.svelte:69` `.unit` not hidden; `Delve.svelte:187` keeps `role="timer"` with an empty label | `aria-hidden="true"` on `.unit`; drop the role when `!run` | None |
| RULES #1 head start paid on every open | **REAL** (reviewer's probes re-run; the real-content one too) | **urgent** | `game.ts:819` guards only on a later morning `findGiven`; when `pickFind` gives none, each `open` (every cold start) adds 15 min | `game.ts:819`: `if (!night \|\| w.all.some(f => f.seq > night.seq && ((f.type === 'findGiven' && f.why === 'morning') \|\| (f.type === 'stepsGained' && f.job === 'sleep')))) return;` | See the note below. Keep **both** conditions |
| PERF #1 deep proxy over the log | **REAL** (compiled code checked) | **urgent over months** (heat, sluggish taps) | dist: `set facts(e){C(this.#t,e,!0)}` (set with `should_proxy = true`). The reviewer's before/after build numbers stand | `game.svelte.ts:42`: `facts = $state.raw<Fact[]>([])` | Safe; see the note below. One catch: `Settings.svelte`'s `asking` is a deep `$state`, so `restore(asking)` passes a proxied log back in |
| PERF #2 Map's SMIL never rests | **REAL** (code) | minor (only while the Map is open on an unlocked screen) | `Map.svelte:236` `<animateMotion repeatCount="indefinite">`; `rest.ts` pauses only `document.getAnimations()`, which lists no SMIL | `rest()`: `document.querySelectorAll('svg').forEach(s => s.pauseAnimations())`; `wake()`: `unpauseAnimations()`; on the Map's mount, pause it if at rest (`onRest`) | Only the Map uses SMIL. The spark's CSS opacity animation is already paused, so both stop together |

---

## Notes

**RULES #1: the proposed fix and its edge cases.** "Skip if a `stepsGained {job:'sleep'}` exists after the night" is
right, with these edge cases:
1. **Older saves: a find with no head start.** The head start came with D-083, after save v2 (D-066). So a v2 night from
   before D-083 can have a morning find and no `sleep` payment. Guarding on the payment alone would pay that old night
   once, on the first open after the update, if it is still the last night kept. Keeping the old find condition *as well*
   (OR) avoids this.
2. **A find after a payment.** With the payment as the guard, a find that `pickFind` couldn't give at the first open is
   never retried. That is fine (there was none to give). The Morning screen then doesn't appear, since `view.morning`
   needs a morning beat or find, and the head start is silent. That is acceptable, or `morning.headStart` could show on
   Today.
3. **Nothing else writes `job:'sleep'`** (grep: only `game.ts:821`), and `Morning.svelte:43` reads it by day. So the guard
   cannot be confused by other facts.
4. **Saves that already hold duplicate payments** keep them. Facts are never retconned, which is correct.

Also, `gifts()` at `:822` was re-run on every open too. The fix stops that as well.

**PERF #1: is `$state.raw` safe?** I searched all of `src` for in-place change of the log or of a fact:
- **The array.** No `push`/`splice`/`sort`/index assignment on `facts` anywhere. All 5 writes reassign it
  (`game.svelte.ts:49, 208, 376, 392, 407`). Core copies before it writes: `writer()` does `facts.slice()`.
- **Facts and plan entries.** `week.ts:251` (`e.day = …`) changes a *copy* (`{ ...e }`). No UI code writes to a fact.
- **Caches.** They are keyed by the array (`WeakMap<Fact[]>` in `week.ts`, `done.ts`) or by the fact (`lineMemo`). With raw
  values the keys are plain objects, which is if anything more stable.
- **Readers.** Every `$derived` in the screens reads `game.facts` or `game.view`, and both change identity on every
  append. Nothing relies on deep reactivity.
- **One catch.** `Settings.svelte`: `let asking = $state<Save | null>` deep-proxies the picked save, and
  `game.restore(asking)` then assigns a proxied `facts` back in. It still works, but it is slow until the next start. Make
  `asking` a `$state.raw` too, or call `$state.snapshot(s)` in `restore`.
- **Not changed by this fix.** `$state.raw` does not touch NEW-1: raw sources still get old values in teardown. The two
  fixes are independent.

**Severities I lowered:**
- F1 (Dan taps twice himself) to bug.
- PLATFORM #2 (the wrong window is short) to minor.
- CODE #5 (the timing window is a few ms in practice) to cosmetic.
- CODE #6 (Swift returns `[]` on revoke anyway; the JS-only fix is not enough) to minor.

**Real as designed (Dan's call, not defects):** F4, F5, F6, F9, F10, WORDS #27. Each matches a recorded decision
(D-131, P7, PLANNER's fortnight, the finish line, D-134) while pulling against rule 9 or rule 10. They belong on a list
of questions for Dan, not on the fix list.

**What would Dan hit first, in order:**
1. NEW-1 (Daybook look-ahead, "where did you stop")
2. RULES #1 (once the morning finds run out)
3. CODE #1 (Satchel → Delve now)
4. PERF #1 (grows weekly)
5. F3
6. CODE #2
7. F1
8. WORDS #1
