# Flow review — jobs and delves (how jobs are put on, measured, and gone back to)

Reviewer area: every way a job enters, is worked on, is measured, and is come back to. Branch `claude/keys-visible`, built copy at port 4173, driven by Playwright at phone size (390 × 844, touch). Scripts and screenshots: `scratchpad/review/jobs/` (`p1-add.mjs` … `p8-last.mjs`, `p*-*.png`). No story text or place names appear below.

Ranking is by how much it would hurt Dan's play: **confirmed bugs** first (something is lost or wrong), then **clumsy flow** (works, but the path is odd or the words mislead), then **minor polish**.

---

## Confirmed bugs

### 1. Leaving the errand run's "What got done?" screen by the back arrow silently counts the run and throws away the story moments
**What Dan does:** finishes an errand run (Finish here, or it runs out). The end asks "What got done?" with the errands to strike off and one button, "Count them". He taps the top-left arrow ("Today") instead — the natural thing if he thinks he'll come back to it, or just wants out.
**What happens:** the run is counted at once, exactly as it stands (whatever was struck), each struck errand is marked done with its share of the minutes and **its story moment is written to the log — but never shown**. The end screen is marked "seen", so it never comes back; Today just shows the errand as done. The story beat is gone from view for good.
**Confirmed:** clicked (`p2-errand.mjs`): one errand struck, arrow tapped → facts written in that one tap: `errandsCounted, errandShare, jobBegun, jobDone, beatPlayed, seen`; the screen landed on Today; no return screen. Code: `Delve.svelte:158` (the arrow calls `leave('today')` → `seen`), `game.ts:927` (any command other than strike/park/away counts a pending errand run first), `App.svelte:78` (the phone's back does the same).
**Why it hurts:** a delve's story moment is the reward for the work (rule 8/9); this is the one screen in the app where the back arrow destroys it. Dan would not know anything was lost.
**Fix:** on the pending "What got done?" screen, make the arrow behave like "Count them" and then *show* the counted end (don't mark it seen), or disable/hide the arrow there and let "Count them" be the only way on (the screen already explains the rest stay as they are). At minimum, after an arrow-leave, the struck errands' returns should be shown on the next opening as a delve end would be.

### 2. The row for a job you added says "25 min", but its delve opens at 30 — and after "Not yet" it still says 25 next day
**What Dan does:** adds "Tax return" (any way: the Satchel box, the Week's +, Tonight's line, Siri). Looks at its row on Today, then taps it.
**What happens:** the row says "25 min" (the Week says "25 minutes"). The set-up dial opens at **30**. The 25 is a hard-coded default nobody chose. Worse: after he delves 27 minutes on it and says "Not yet", the row on Today hides the note (shows "It's done" instead, fine) — but tomorrow, when the job has moved to the Satchel, or when it comes back via "Back to it", the row says "25 min" again, with no sign of the 27 minutes it carries. Only the set-up's quiet line ("Carries on from 27 minutes.") and the tick sheet ("On top of the 27 minutes you delved") know.
**Confirmed:** clicked (`p1-add.mjs`: row "Tax return [25 min]", dial 30; `p5-wait.mjs`: after "Back to it", row "Call the vet [25 min]" with 12 minutes carried; `p7-rollover.mjs`: next-day Satchel row shows nothing). Code: `week.ts:75` (`length: 25` for every added job), `Today.svelte:43` (`j.item ? '' : minutesShort(j.length)` — added jobs never have `item`, so the comment "a line jotted says nothing" is no longer true), `game.ts:1860` (`PRESET = 30`).
**Fix:** for a job with no minutes set by Dan, show nothing (as the code intends) — or better, show what is actually known: "27 min so far" when minutes are carried, "usually 40 min" once learned, else nothing. Make the default length 30 to match the dial if a number must be shown.

### 3. "Where did you stop? (for next time)" never appears where it was meant to
**What Dan does:** delves on a one-off, taps Finish here, answers "Not yet". This is exactly the moment D-112 added the "Where did you stop?" box for.
**What happens:** the box is not there. It only ever appears in one odd case: a *recurring* job's delve finished within its first minute (or a recurring job's second run of the day). After "Not yet" there is only "Every minute counts… / Nothing is lost…" and "Back to today".
**Confirmed:** clicked (`p8-last.mjs`): one-off "Is it done?" → `input.stop` count 0; after "Not yet" → 0; recurring job finished at 20 s → 1. Code: `Delve.svelte:277` — the input is inside the final `else` branch, which is never reached when `end.ask` is true or `answer === 'no'`.
**Fix:** show the box in the "Not yet" branch (and maybe nowhere else). It's the one place the note is useful: it feeds "Last time: …" on the next set-up and "I can't start".

### 4. The same job can be added twice from three of the five ways in
**What Dan does:** has "Bank" waiting in the Satchel. Types "bank" into the Week's + on today, or into Tonight's "Anything on your mind?", or says it to Siri.
**What happens:** a second job "bank" is made. The Satchel then shows "bank" and "Bank" side by side. The Satchel box and "Park a thought" *do* recognise the name ("bank is already on today's list"), so the app is inconsistent with itself.
**Confirmed:** clicked (`p4-paths.mjs`: Week + → Today has "bank", Satchel still has "Bank"; `p6-misc.mjs`: Tonight's line → Satchel rows `["bank", "Bank", …]`). Code: `game.ts:1289` (`addToWeek`) and `game.ts:1164` (`addItems`) never call `tieFor`; D-136 recorded this as "left as it is".
**Fix:** run the same name check in `addToWeek`, `addItems` and `takeInbox`: if a job of that name is still Dan's, put *that* job on the day (or say where it is) instead of making a twin.

---

## Clumsy flow

### 5. Today's big button "Add a job" does not add a job to today
**What Dan does:** on Today, taps the one big button, "Add a job", types "Tax return", presses Return.
**What happens:** he is on the Satchel screen, and the job is in "No day yet" — not on today's list. To get it onto today he must: find it under "No day yet" → "Put on a day" → open the calendar → tap today → back arrow. (Or tap "Delve now", which starts a 30-minute timer at once — not what he wants if he's just listing the day.) Pressing Return is "Save for later", not "Delve now".
**Confirmed:** clicked (`p1-add.mjs`): after Enter, Today has no "Tax return"; after Put on a day → today, it does. Code: `Satchel.svelte:148` (form submit = `later()`), `game.ts:1275` (`saveForLater` writes only `itemAdded`). D-135's review noted this ("Add a job opens the Satchel, whose Save for later keeps a job off today").
**Why it's clumsy:** the button is on *Today*, labelled "Add a job"; a first-time player will expect it to add to today. It is the single most common thing he'll do and it takes five taps and a screen change.
**Fix:** give the box a third choice, or make the choices "Today" · "Delve now" · "Later" — or have Today's button open the box with "Add to today" as the Return action and "Save for later" as the quiet alternative; the Satchel's own box can keep its current pair.

### 6. A half-done job disappears from Today overnight with no sign of its minutes
**What Dan does:** delves 27 minutes on "Tax return", says "Not yet", goes to bed.
**What happens:** next morning it is not on Today. It sits in the Satchel's "No day yet", looking like every other untouched line (no "27 min so far"), and so does yesterday's other undone one-off. He has to know to look in the Satchel, and nothing there tells him this one is in progress until he opens its set-up ("Carries on from 27 minutes.").
**Confirmed:** clicked (`p7-rollover.mjs`): next day Today rows have no "Tax return"; Satchel row `Tax return []`; set-up says carries on. Code: `week.ts:408–410` (a one-off whose day passed goes back to No day yet, D-131), `Today.svelte:43`.
**Fix:** either keep a job with carried minutes on Today the next day (it is plainly "in progress"), or at least mark its row ("27 min so far") in the Satchel and on Today. The minutes are safe (I checked: the carry and the Done count are right); it's the *telling* that is missing, the same shape of problem Dan reported in D-133.

### 7. "Not today" on a recurring job: it vanishes, and the only way back is in the Week
**What Dan does:** slides a recurring job (e.g. a course session) off today with "Not today". "Taken off today. Put it back" appears. He visits the Satchel and comes back.
**What happens:** the "Put it back" line is gone (it lives only while Today stays open). The job is not in the Satchel (recurring jobs set aside are not listed there; a one-off would be). It is only in the Week, under today, marked "not today", with "Back on today" in its sheet. Nothing tells him that.
**Confirmed:** clicked (`p6-misc.mjs`): after a round trip "Put it back" absent; Satchel has no Course under No day yet; Week shows `Course [not today]` and the sheet has "Back on today". Code: `Today.svelte:70–71` (`lastAside` is local state), `week.ts:571–573` (only one-offs set aside appear in the Satchel).
**Fix:** keep the undo on Today for the rest of the day (read it from the facts, not screen state), or show set-aside jobs on Today in a folded "Not today" line with "Put it back".

### 8. "Delve now" on a remembered job skips the set-up
**What Dan does:** types the name of a job he already has (a recurring one, or one waiting in the Satchel) into the Satchel box and taps "Delve now".
**What happens:** a 30-minute delve starts immediately — no dial, no count, no "Carries on from…" line, no note. Every other way of starting a job (tapping its row, the menu's Delve, Tick off's sheet) goes through the set-up first.
**Confirmed:** clicked (`p4-paths.mjs`): typed a recurring job's name → straight to the delve, "29:59 left of 30 minutes". Code: `game.ts:1267` (`beginRun` with `PRESET`). D-136 chose this deliberately for a *new* line, which is fine; for a remembered job it is a different behaviour from its own row one screen away.
**Fix:** when the typed name is tied to an existing job, "Delve now" should open that job's set-up (as its row does), or be relabelled "Delve" so the set-up is expected.

### 9. While a delve runs or is paused, Today loses "Add a job" and every job's menu
**What Dan does:** has a 60-minute delve running (or paused), comes to Today to add something or edit/delete another job.
**What happens:** the big card is the delve's ("Back to the delve" / "Carry on · Finish here"); "Add a job" is gone. Rows are disabled: no tap, no slide, no press-and-hold, so no Edit, Delete, Put on a day, Waiting on… for any job, anywhere on Today or in the Satchel. The Week still allows the menu, and the Satchel's box still allows "Save for later".
**Confirmed:** clicked (`p3-pause.mjs`: "Add a job present? 0" while paused; `p6-misc.mjs`: running job hidden from the list, other rows without menus). Code: `Today.svelte:232–250` (the card), `Today.svelte:288` and `Satchel.svelte:192` (`disabled={!!v.run}`), `SwipeRow.svelte:29` (disabled blocks the hold too).
**Why it's clumsy:** a delve can last 90 minutes; a thought about *another* job (rename it, move it to Thursday) has to wait or go through the Week. Only the delve's own job needs guarding.
**Fix:** keep "Add a job" visible under the delve card; disable only *starting* a delve (tap, Delve, Tick off) during a run, but leave the slide and the hold menu working.

### 10. Finished the "Is it done?" question with the arrow: fine, but the end never says the minutes
**What Dan does:** at "Is it done?" taps the arrow instead of Done / Not yet (e.g. phone rang).
**What happens:** this is handled well — the question doesn't come back after a reload, and the row on Today carries "It's done". But the "Every minute counts: N minutes so far" line is only on the "Not yet" screen, so a Dan who left by the arrow is never told the minutes were kept; the row then shows no minutes (see 2).
**Confirmed:** clicked (`p3-pause.mjs`: arrow, reload → Today, row `Write report [] over:It's done`). Code: `Delve.svelte:68–72`, `Today.svelte:58–61`.
**Fix:** falls out of fixing 2 (show "N min so far" on the row).

### 11. A recurring job's row, once done today, does nothing when tapped
**What Dan does:** did a 20-minute course session this morning; in the afternoon taps its (done) row to do another.
**What happens:** nothing. The menu (press and hold) does offer "Delve", and it works, but the tap — the one action the whole app teaches — is dead on that row.
**Confirmed:** clicked (`p8-last.mjs`: tap on done Course row → still Today). Code: `SwipeRow.svelte:69` (`!done`), `Today.svelte:288` (`done={v.done.has(id)}`).
**Fix:** for a recurring job, let a tap on its done row open the set-up (a second session is normal); keep the tap dead only for a finished one-off.

### 12. Today's "Errand run" link shows from the first minute, with gym and study as "errands"
**What Dan does:** opens a fresh save. At the foot of Today's list: "Errand run".
**What happens:** the link is there because any two jobs on today count, including recurring ones ("Gym, then the sauna", "Course"). A first-time player won't know what an errand run is, and the pick list offers his gym as an errand.
**Confirmed:** clicked (`p8-last.mjs`: fresh Today foot links = `["Errand run"]`). Code: `game.ts:1725–1729` (`errandChoices` takes the whole slate), `Today.svelte:125`.
**Fix:** show the link only when at least two *one-off* jobs are to do (recurring sessions are not errands), and give it a one-line hint the first time.

---

## Minor polish

13. **The step screen after "No more" / "It's done" on the same day replays the road.** Tick "No more" (or "It's done") on a job whose minutes were all delved today: the flame travels those minutes again and the ring counts 0 → N, as if they were new. Nothing is double-counted in the facts; it is only the picture. On a later day it correctly stands still. (`Step.svelte:21–28`: `moved = jd.ticked ?? gained`, where `gained` is all of today's minutes; `p5-wait.mjs` vs `p1-add.mjs`.) Fix: when nothing new was earned, show the line still and the count resting on N.
14. **"Your Course is done for the day: 3 minutes."** A recurring job's delve finished after 3 minutes marks the session done (D-121, Dan's choice) — but the sentence reads like a congratulation for 3 minutes, and the job is then "done" on Today (its row inert, see 11). Consider "Course: 3 minutes today." for sessions under the 5-minute story line.
15. **The Satchel's two buttons after "Add a job" from Today** are "Delve now" / "Save for later"; the back arrow says "Today". Fine — but the text box has no label beyond the placeholder "A new job", and nothing says Return = "Save for later". A first-time player will press Return and wonder where it went (see 5).
16. **Satchel suggestions can't be dismissed** except by clearing the box; they push the list down. Fine on a tall phone; worth a look at 360 × 780.
17. **The delve-end "Is it done?" has no minutes on it.** The ring waits at the carried minutes (correct), but the question card itself could say "27 minutes on it" so the answer is informed.
18. **Today's held card** ("Carry on with X / You have 25 minutes left in this delve") doesn't say "first of two delves" for a run; the delve screen does.
19. **The job menu's "I can't start"** is only in the press-and-hold menu (D-135). A first-time player will never find a press-and-hold menu on his own; one hint ("press and hold a job for more") somewhere once would do.
20. **Tick sheet grid**: with carried minutes it has 8 chips in 4 columns, "No more" first. Clear enough; just note "No more" is the odd one out visually (it is an answer, not a duration).

---

## What flows well (checked by clicking)

- **Set-up → delve → Finish here → Is it done? → Done/Not yet** is solid. Double taps on Pause, Finish here and Done are swallowed (`taps.ts`); the second tap never makes a second decision. Breathers, "Start it now", 2-delve runs and "finishing around HH:MM" all behave.
- **"Not yet" keeps the minutes correctly, everywhere it counts.** Set-up: "Carries on from 27 minutes."; running delve: "27 min on it so far" ticking up; end ring: counts from carried to total; tick sheet: "On top of the 27 minutes you delved" + "No more"; a Done after three delves lands on the right total (12 = 5 + 5 + 2 checked). The road only moves for new minutes. The *facts* are right; the gaps are in what the rows say (2, 6).
- **Pause → Today → "Carry on" / "Finish here" card**, and a delve paused for 3 hours finishing itself and asking "Is it done?" on return. Leaving the question by the arrow, reloading: it doesn't nag, and "It's done" is on the row.
- **Waiting on…** is clean end to end: the menu's calendar, "Back on Sat 3 Oct", the said-line with "Back to it" on Today and in the Satchel, the Satchel's Waiting section, "Did they reply?" under (not on) Today's list on the day, "Still waiting" with a new date, "Back to it" putting it on today, "It's done" → tick sheet with "No more" for carried minutes. Typing the same name in the box says "already waiting: back Sat 3 Oct."
- **Errand run** when used as designed: pick list from Satchel or Today, set-up titled Errand run, strike in the delve and on "What got done?", "Count them", shares, "still to do" rows, unstruck shares carried into the next set-up ("Carries on from 5 minutes."). Done errands drop off the next pick list.
- **"Not done after all" → delve again → Done**: no second payment, the count still shows, nothing jiggles. **Delete → Undo** on a done row restores it in place.
- **Park a thought**: recognises a name already on the list, the "Parked:" line, "One thought parked in the Satchel" at the end.
- **"I can't start" → Try ten minutes?** starts a 10-minute delve that carries the job's earlier minutes ("8 min on it so far").
- **Back arrows** return where each screen was opened from (set-up from Satchel → Satchel; from Today → Today).

---

## How I checked
Playwright/Chromium at 390 × 844 with touch, fake clock (`page.clock`), fresh save each run; time jumped with `setSystemTime` for delves, 3-hour holds and day rollovers (reload after the jump). Facts read from `localStorage['save.v1']` to confirm what was written. Code references are to `app/src/…` on `claude/keys-visible`. Nothing in the repo was modified.
