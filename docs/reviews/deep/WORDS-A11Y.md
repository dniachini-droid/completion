# Deep review: the words, accessibility and the game's own principles

_Reviewer 6 of 6, 2026-10-01, branch `claude/review-round-5`. Report only: nothing in `app/src` or the existing tests was changed._
_Spoiler-free: no story text is quoted. Places and niches are named by role only ("a locked niche behind Dan")._

**How it was checked.** I read every line of `app/src/content/copy/en.ts`, scanned every screen's markup for hard-coded words, and walked the built app (Chromium, 390 × 844) with three scripts (`app/tests/review/deep-words.mjs`, `deep-words2.mjs`, `deep-words3.mjs`). On each screen the scripts took Playwright's accessibility snapshot (`ariaSnapshot`) and measured tap targets, text sizes, nameless controls and images. Screens covered: Today (morning, evening, after Go to sleep), the Satchel (both ways in), the Week (this, next and later weeks, a row's sheet), the job menu, the tick sheet, I can't start, the set-up, the delve (running, paused, the breather, the natural end, Finish here with Done and with Not yet), a job's return after a tick-off, the morning, Settings, the trial controls, the job editor, and from `tests/flows/saves/keys.json` the Daybook, the Map with Keys, the opened niche, Records, Symbols and a place read again. Reduce Motion was emulated for the evening and morning (no running animations: good).

**Counts:** 11 bugs · 21 clumsy · 18 polish (50 findings).

Severity: **bug** = wrong, contradicts another screen or a rule, or blocks a VoiceOver user. **clumsy** = works, but reads badly or makes a player stop and wonder. **polish** = small.

---

## A. Wrong words and contradictions

1. **bug: the job editor says every delve starts at 30 minutes, but a recurring job's no longer does.** `en.ts:403` `rhythms.each.say`, shown in `Rhythms.svelte:207` for every job. Since D-146 a recurring job's set-up opens at its own minutes (Course's editor says "50 minutes" and its set-up opens at 2 × 25; Gym's at 60). The line is still true for one-offs only.
   Replace: for a recurring job, `'For planning the week, and the length its delves start at.'`; for a one-off, `'For planning the week. Each delve starts at 30 minutes.'` (two keys, chosen by `d.often === 'once'`).

2. **bug: "A later week" says there is no plan for *next* week.** `Week.svelte:143` uses `week.none.next` whenever `isNext`, which is any week after this one. Seen on the page headed "A later week" (12 – 18 October).
   Add `'week.none.later': 'There is no plan for that week yet.'` and use it when `wk !== addDays(thisWeek, 7)`.

3. **bug: the back arrow says "Next week" for a later week.** `App.svelte:132`: `t(top.arg ? 'week.next' : 'week.label')`. Probe: "The week after" → Map, and the Map's arrow said "Next week" (`deep-words3.mjs`). Any `arg`, including a week two or more ahead, is named "Next week".
   Fix: name it as the Week's own heading does: `this week` if `arg` is missing or equals the current week, `week.next` if it is one week on, else `week.later`.

4. **bug: the Map calls a locked niche behind Dan "Ahead".** `Map.svelte:77` always prefixes `today.ahead` ("Ahead: …"). For the same niche, Today says "Behind you · Needs a Key" (D-143 S3: a locked thing left behind is never called ahead). Seen with the keys save: Today shows "Behind you" and the Map's "here" box shows "Ahead:" for the same niche.
   Fix: use `v.aheadBehind ? t('today.behind') : t('today.ahead')` there too.

5. **bug: the tick sheet says "you delved" about minutes that were ticked off.** `en.ts:288` `tick.onTop` ("On top of the {min} you delved"). After a tick-off and "Not done after all", the sheet says "On top of the 3 hours you delved", and nothing was delved.
   Replace: `'On top of the {min} already counted'`.

6. **clumsy: one-offs show a length in the Week that nobody chose, and a different one from the set-up.** `Week.svelte:41` falls back to `minutesWords(job.length)`, so a one-off reads "25 minutes" in the Week, Today shows no number for it (J2, "never a number nobody chose"), and its set-up opens at 30 (D-124). That is three answers for one job.
   Fix: for a one-off with no time or date, show nothing (as Today does), or its minutes so far (`row.sofar`).

7. **clumsy: the Satchel's first line doesn't match what it lists.** `en.ts:419` `satchel.say` ("Every job that isn't on today.") is shown above "Recurring jobs", which lists Gym and Course while they are on today's list.
   Replace: `'Jobs with no day yet, jobs coming up, and the ones that recur. Delve on any of them whenever you like.'`

8. **clumsy: a reminder calls Dan back to the app, which Settings promises it never does.** `en.ts:496` `remind.bed.0` ("…Go to sleep is waiting in the app.") against `settings.reminders.say` ("…never to call you back to the app"). It also uses a button's name as the subject of a sentence.
   Replace: `'It is the bedtime you chose.'`

9. **clumsy: "Your Course is done for the day".** `en.ts:96` `delve.sessionComplete`. "Your" before a job's name reads oddly ("Your Gym, then the sauna is done…", "Your Spanish study…").
   Replace: `'{job} is done for the day: {min}.'`

10. **clumsy: the step screen's arrow names an action, not a place, and says the same as the button under it.** `Step.svelte:44`: when a place is reached, the arrow reads "See where you are" (it wraps to two lines at 390 px) and so does the gold button. That breaks "every arrow names where it goes".
    Fix: give the arrow the place's name (as `nameOf` does for an arrival: `game.view.arrival.name`), or "Today".

11. **clumsy: two words for one thing.** Recurring jobs are "Recurring jobs" everywhere, but the Satchel's offer says `satchel.offer` "Make it repeat?" and `satchel.offer.yes` "Make it repeat". The Satchel/satchel is capitalised in `park.count`, `today.keepGoingSay` and the nav, and lowercase in `wait.said`, `satchel.saved`, `satchel.have.noDay`, `tonight.mind.said` ("In the satchel.") and `tonight.mind.hint`. The Map and Daybook are "Map"/"Daybook" in the nav, but `map.label` is "The map" and `daybook.label` is "The daybook" (seen as the Daybook's label). `welcome.say` says "One small task" where everything else says "job".
    Replace: `'{job} keeps coming back. Make it a recurring job?'` / `'Make it recurring'`; "the Satchel" in all six lines; `'The Map'`, `'The Daybook'`; "One small job is enough…".

12. **clumsy: "The week after" leads to a page titled "A later week".** `en.ts` `week.after` vs `week.later`. Pick one: title the page `'The week after'` when it is two weeks on, or name the button `'A later week'`.

13. **clumsy: "Return keeps it here, with no day."** `en.ts:422` `satchel.return.today` / `satchel.return.later`. To a non-technical player, "Return" reads as the verb ("return it"), not the keyboard key.
    Replace: `'The keyboard’s return key keeps it here, with no day.'` and `'The keyboard’s return key adds it to today.'`

14. **clumsy: "Keep up a recurring job" doesn't say what earns a Key.** `en.ts:13` `today.keys.say` and `map.noKey`. Dan has never seen himself earn one (D-142), and "keep up" doesn't tell him how many sessions it takes.
    Replace: `'Keys open the locked things you pass. Do a recurring job as often as you set it (Gym 4 times in a week, say) to earn one.'`

15. **clumsy: "these last days".** `en.ts:131` `step.keyAlready.days` (for an "every few days" job).
    Replace: `'You already earned the Key for {job} since it last came round.'`

16. **polish: the forecast names today by its weekday.** On Wednesday the Week says "…the next place around Wednesday" and the Map says "Wednesday · forecast". `Week.svelte:45`, `Map.svelte:108`.
    Fix: use "today" or "tomorrow" when the day is today or tomorrow.

17. **polish: the trial screen has four names.** "Trial" (`nav.proto`), "Trial controls" (`settings.trialLink`), "The trial's own controls" (`proto.title`), "Prototype" (`proto.label`). It also shows a decision number to Dan: `proto.leave.about` "(D-094)". Pick "Trial controls" throughout and drop "(D-094)".

18. **polish: Settings' toggle reads "On / All off"** (`settings.reminders.off`) while every other toggle is "On / Off". Use `'Off'`.

19. **polish: leftover lines of removed features are still in the copy** (no screen uses them): `today.else` "Something else…", `today.teaser.avoided`, `today.teaser.delve`, `today.delve`, `today.aside.said`, `today.notToday`, `delve.towards`, `guess.label`, `marks.keep`, `map.reached`, `map.forecastLabel`, `proto.rehearsal`, `proto.close`, `cant.keep`, `tonight.first.others`, `tonight.first.keep`, `tonight.mind.hint`, `daybook.held`, `daybook.times`, `daybook.reached`, `daybook.offer`, `daybook.close`, `rhythms.say`, `rhythms.add`, `rhythms.editing`, `rhythms.stop`, `by.passed`, `job.onceUntil`, `job.others`, `job.back`, `settings.trial`. Delete them, so no one wires an old line back in. The review tooling is stale too: `tests/review/tour.mjs` (CHROME list: "+ Add", "Something else…", "What repeats", "Marks") and `tests/review/lib.mjs` `addToday` (`.foot .add`) still look for removed controls.

## B. Numbers, times and plurals

20. **clumsy: one length is written four ways.** Today and Satchel rows show "1 h 30 min" (`minutesShort`), Week rows and the job editor show "1 hour 30 minutes" (`minutesWords`), the tick sheet shows "1½ h" (`tick.halfHour`), and the Week's day total shows "about 2½ h" (`Week.svelte:99`). The same Gym session reads "1 h" on Today and "1 hour" in the Week.
    Fix: use `minutesShort` in every row (the Week included), and "1 h 30 min" on the tick sheet and in the Week's total ("about 2 h 30 min").

21. **clumsy: "1 a week".** `en.ts:585` `oftenWords` → `rhythms.nWeek` with `times ?? 1` gives "1 a week" on a Satchel row, while the editor says "Once a week".
    Fix: `r.times === 1 || !r.times ? t('rhythms.onceWeek').toLowerCase() : t('rhythms.nWeek', …)` ("once a week").

22. **polish: the month is shortened two ways.** `byWords` and `dayShort` (`en.ts:552`, `:590`) cut `month.N` to three letters ("Sep", "Jun", "Jul"), while `monthShort` gives "Sept", "June", "July" (Daybook titles "28 Sept – 4 Oct"). So "by Mon 7 Sep" and "28 Sept – 4 Oct" can sit on the same screen.
    Fix: use `monthShort` in both functions.

23. **polish: "6 pm".** `en.ts:472` `settings.nudge.say`. Everywhere else the app uses the 24-hour clock ("23:00", "18:00 · went by").
    Replace "at 6 pm" with "at 18:00".

24. **polish: "Try ten minutes?"** (`cant.ten`). Every other length is in figures ("10 min", "10 minutes"). Use `'Try 10 minutes?'`.

25. **polish: the set-up's count line leaves out the unit.** `set.count` ("{n} of {len}") gives "2 delves of 25 finishing around 09:55", and the slider is named "2 delves of 25".
    Replace: `'{n} of {len} minutes'`, then `'{n} of {len} minutes, finishing around {end}'`.

26. **polish: a recurring row runs its time on without a separator.** `Satchel.svelte:283` puts `r.time` in the row's right column after "Thursdays · 1 h", so VoiceOver reads "Spanish lesson Thursdays · 1 h 18:00". Give the row an `aria-label` such as `'{job}, Thursdays, 1 hour, at 18:00'`.

## C. The game's own principles

27. **bug (rule 10, task farming): a job typed a second ago and ticked off is worth 3 hours of progress, as often as you like.** Probe (`deep-words3.mjs`, a fresh game): Add a job "Fold one sock" → tick off → "3 h" moved the road 180 minutes and passed the next place. A second new job ticked the same way reached another place. Two taps on a trivial line out-earn six honest 30-minute delves. D-134 chose "no daily limit", but rule 10 says trivial inputs must never out-earn meaningful effort, and nothing here asks for more than a name.
    Suggest (Dan's call): a one-off with no delved minutes ticks off at most 1 h; anything longer offers "Delve on it" instead. Or ticked minutes past 3 h in a day count as half.

28. **bug (rule 10): "Not done after all", then tick it off again, pays the minutes twice.** Same probe: after the first 3 h tick, "Not done after all" made the job tickable again, and a second "3 h" moved the road another 180 minutes (45 min to the next place became 15 min, with a place passed in between). D-131 says what a job earned "is never paid twice".
    Fix: a job taken back offers only "No more", or extra minutes on top of what it already counted (as the delve path does).

29. **clumsy (rule 16, the next action obvious): Today's one big button adds a job; it doesn't start one.** With three jobs on the list, the eye goes to "Add a job". Nothing tells a new player that a tap on a row begins it: the only hint is "Press and hold a job for more." D-135 was Dan's choice, so this is for him to weigh.
    Suggest: while the list has jobs to do, the hint reads `'Tap a job to delve on it. Press and hold for more.'`

30. **clumsy (rule 9): a late night is pointed out at the moment of going to bed.** `en.ts:310` `camp.sleep.late` ("…The head start is for nights you are in bed by {bedtime}. Nothing is lost."). It explains what he missed, every late night.
    Replace: `'Sleep well. Nothing is lost.'` (the head start can be explained once, in `today.tonight.say`, as it already is).

31. **polish (rule 9): "still counts" consoles, which suggests something went wrong.** `daybook.camped` ("…and every step of it still counts.") and `welcome.say` ("You have been away, but…").
    Replace: `'It was a week of camps and short roads, every step of it on the way.'` and `'The road has waited for you. One small job is enough to take it up again.'`

32. **polish (rule 11, productivity theatre): the Daybook's week close asks for a weekly review.** It shows "Look ahead at the week? About a minute.", then "Still wanted? Keep / Let it go" for each job, then "What matters most?", with "Plan it for me" and "Not now" beside it. It is optional and quiet, but it is planning administration inside the story's page. Worth watching in Dan's real use: if he skips it every week, fold it into "Plan my week".

## D. Accessibility (VoiceOver, sizes, motion)

33. **bug: Dynamic Type is ignored, and zoom is off.** Every size is fixed in px (`direction.css` body 17px; nothing uses `-apple-system-body` or Capacitor's text zoom), and `index.html:5` sets `maximum-scale=1, user-scalable=no`. A player who enlarges text in iOS Settings gets nothing.
    Fix: set the root size from `font: -apple-system-body` (WKWebView scales it with Dynamic Type) and express sizes in `rem`, or add `@capacitor/text-zoom`; at least drop `user-scalable=no`.

34. **bug: the job menu and the tick sheet don't take VoiceOver focus.** `JobMenu.svelte:59`, `TickSheet.svelte:35` are `role="dialog" aria-modal="true"`, but nothing moves focus into them or back to the row when they close, and the page behind isn't made `inert`. After a double-tap-and-hold, VoiceOver stays on the row and the player doesn't know a menu opened. The snapshot also shows the whole page still readable under the dialog.
    Fix: focus the dialog's first button when it opens, put `inert` on `.ui` while it is open, and return focus to the row on close.

35. **bug: the ring at a delve's end and on a job's return reads "min 25 minutes".** `Delve.svelte:187` keeps `role="timer"` with an empty `aria-label` after the delve ends. Inside, the drawn unit "min" (`EndRing.svelte`, `.unit`) is not hidden, so VoiceOver reads it before the full words. The step screen reads "min 3 hours".
    Fix: `aria-hidden="true"` on `.unit`; at the end drop `role="timer"` (or give `aria-label={minutesWords(end.total)}`).

36. **bug: Symbols has 29 buttons with the same long name.** In Symbols, every unknown symbol is a button named "You have seen this symbol, but its meaning is still hidden from you." (`marks.seen` used as its name), so VoiceOver can't tell one from another.
    Fix: name each `'A symbol not known yet, {n} of {count}'` (or by where it was seen), and keep the sentence for the detail.

37. **clumsy: each Today row is four VoiceOver stops, with "Not today" and "Delete" read before the job.** The snapshot order per row is "X: not today", "X: delete", "X", "X: tick off". With six jobs that is 24 stops before the foot's links, and Delete comes before the job itself. Same in the Satchel ("X: edit", "X: delete" first).
    Fix: put the row's own button first in the DOM (tick, row, then the slide actions), or hide the slide actions from VoiceOver (`aria-hidden` until slid) and rely on the job menu, which already has Delete.

38. **clumsy: the "Ahead" text is a button whose name is the whole passage.** `Today.svelte:233`: the passage that folds open is a `<button>`, so VoiceOver reads a paragraph-long button name. Give it `aria-label={aheadOpen ? 'Fold it away' : 'Read it all'}` and leave the paragraph outside the button, or drop the button role for VoiceOver (the text is read in full anyway).

39. **clumsy: text faded to nothing is still read.** `Delve.svelte:182`: "While you work, the expedition goes on beneath the hill." is hidden by `opacity: 0` (`.gone`, and `.breath-hide` in `tunnel.css`) when paused, in the breather and at the end, but VoiceOver still reads it on every one of those screens.
    Fix: `aria-hidden={!run || run.phase !== 'delve'}`.

40. **clumsy: tap targets under 44 pt.** Measured at 390 × 844: the Keys button on Today, 92 × 28 (`Today.svelte` `.keys`, padding 4px); the place's name on Today, which reads it again (`h1 button.here`), 139 × 29 on a one-line name; "On the Map" under Behind you, 86 × 36 (`.behind-map .text-link { min-height: 36px }`); "Read it again" on the Map, 95 × 40.
    Fix: `min-height: 44px` (padding, not font) on all four.

41. **clumsy: text under 14 px.** The road's labels and minutes on Today, the delve's end and the step screen, 13px (`EndRoad.svelte:85`); the Satchel box's label, 12px (`Satchel.svelte:308`); the job editor's "How often" choices, 13px (`Rhythms.svelte:285`); Remind me's four choices, 13px (`Remind.svelte:20`); the calendar's small marks, 13px (`DayPick.svelte:62`); the rehearsal badge, 10.5px (`App.svelte:249`). The road labels carry real information (minutes to the next place).
    Fix: 14px minimum; let the Remind row wrap to two lines rather than shrink.

42. **clumsy: the road line at a delve's end and on a job's return is hidden from VoiceOver.** `EndRoad.svelte` is `aria-hidden="true"`. Only Today gives it words (`roadSay`), so a VoiceOver player never hears how far the delve moved him, the game's main reward.
    Fix: on the delve's end and the step screen, a visually hidden line built like `roadSay` ("The next place in 45 min").

43. **clumsy: after a screen change, VoiceOver's cursor is left wherever it falls.** `App.svelte:62–68` announces the new title through a live line (on purpose, D-111: focus moves slid the screen). The pressed button is gone, though, so the cursor lands at random, often mid-page. Fix: after the announcement, focus the new screen's arrow (`button.home`) with `preventScroll: true`. That is the top of the page, so nothing slides.

44. **polish: the countdown's name reads like a clock time.** `Delve.svelte:187` `aria-label="29:57 left of 30 minutes"`: VoiceOver says "twenty-nine fifty-seven". Use `'{m} minutes left of {len}'` (whole minutes; the name needn't change every second).

45. **polish: names that join two things without a pause.** "Back to the delve 30 minutes left" (`Delve.svelte` held button), the Map's "…needs a Key" run on after a niche's name, "Wednesday today" on the Week's day button. Add `aria-label`s with a comma: `'Back to the delve, 30 minutes left'`, `'{where}, needs a Key'`, `'Wednesday, today'`.

46. **polish: steppers and groups without context.** The job editor's − / + are named "Fewer", "More", "Shorter", "Longer" for three different values, and two groups are both named "How often" (`Rhythms.svelte:138`, `:145`).
    Fix: `'Fewer times a week'`, `'Shorter: {len}'`…, and name the second group `'Other ways it recurs'`.

47. **polish: the place's name on Today is a heading named "Read again: …".** `Today.svelte:231`: heading navigation reads "Read again: [place], heading". Keep the heading's own text as its name (`aria-describedby` for "read it again"), or put the button after the `h1`.

48. **polish: "Tap to move it" inside a VoiceOver name.** `satchel.move` ("{job}: on {day}. Tap to move it"). VoiceOver users double-tap, and the role already says it is a button. Replace: `'{job}: on {day}, move it'`. Also make the order consistent: "List: Sort the post" and "Put on a day: Sort the post" (`Satchel.svelte:236–237`) put the action first, while every other row label puts the job first ("Sort the post: tick off").

49. **polish: the Reduce Motion check in `main.ts:11` reads the setting once, at start-up.** Turning Reduce Motion on while the app runs leaves the script-driven motion going until restart (the CSS rules do follow at once). Listen to the media query's `change` event.

50. **polish: "Look" and "Arrived" out of context.** On a story screen the button "Look" (`look.open`) doesn't say what it looks at: `aria-label="Look at the painting"`. A place read again from Today's name is labelled "Arrived" (`arrive.label`), as if newly reached: use `'Read again'` for the again view (`Arrival.svelte:83`).

---

**What holds up well:** the copy is almost all in one file and almost always in full sentences. Plurals are handled for Keys, minutes, delves, jobs, thoughts and times. No nameless buttons or images without alt were found on any screen walked. Increase Contrast lifts the quiet inks. Reduce Motion stops every running animation (none were left running on the morning screen). Nothing in the copy uses shame or blame words: no "missed", "failed", "streak" or "behind schedule".

Scripts (review only): `app/tests/review/deep-words.mjs`, `deep-words2.mjs`, `deep-words3.mjs`. Run them with `URL=http://localhost:4185/ node tests/review/deep-words2.mjs` from `app/` against `vite preview`.
