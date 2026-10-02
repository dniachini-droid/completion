# Deep review: hands-on, as an impatient player on a phone

> One of six independent adversarial reviews of the newest `main` (D-142 to D-146, on TestFlight). **Spoiler-free:**
> story passages, place names and record titles are never quoted; they are called "the story passage", "the place's
> name" and so on. Review only: nothing in `app/src` or the existing tests was changed.

## How it was tested

- The built app (`app/dist`) served by `vite preview`, driven by Playwright with touch taps (`hasTouch`), a fake clock
  (`page.clock`), at **390 × 844** and **360 × 780** (spot checks at 430 × 932 and sideways at 844 × 390).
- **Engine: Chromium only.** WebKit is not installed in this container (`/opt/pw-browsers` holds Chromium only;
  `BROWSER=webkit` fails to launch) and installing browsers was ruled out, so none of this was seen in Safari's engine.
  The findings below are layout and logic ones, so they are very likely the same on the iPhone, but a WebKit pass is
  still owed.
- Saves: a fresh game, and the flows' `saves/keys.json` (5 Keys kept, things locked nearby) and `saves/word.json` (a word
  to cut).
- The scripts are `app/tests/review/deep-hands-*.mjs` (one per area: screens, delve, ends, names, many, kb, kb2, keys,
  keys2–4, word, word2, errand, days, away, night, week, weekdup, menu, tick, ring, huge, setlap, settings, isdone, land,
  back, addagain, monkey). The screenshots are in `/tmp/claude-hands/`.
- The phone's keyboard can't be shown in a headless browser. The keyboard checks pretend one the way `keyboard.ts`
  sees it (`--vvh` set to the screen height minus 300–346 px, and the `kb` class).

**Counts: 1 urgent, 3 bugs, 6 clumsy, 5 polish.**

---

## Urgent

### 1. A job's return keeps offering "Use it here / Keep it" after the Key was used: each press spends another kept Key
- **Size / engine:** 390 × 844, Chromium (not size-dependent).
- **Steps** (`deep-hands-keys4.mjs`): the keys save, clock at 2026-10-08 09:00 (5 Keys). Tick off Course for 1 h on
  Oct 8, Oct 9 and Oct 10 (the third completes its week). The return says "You kept up Course and earned a Key.
  Something here is locked, and the Key would open it." with **Use it here · Keep it**. Tap **Use it here**: the opened
  screen says "You used a Key · 5 Keys left", and its arrow says "Course". Tap the arrow.
- **Seen:** back on the return, the Key line now says the Key was "used it here", **but Use it here and Keep it are still
  shown under it**. Tapping Use it here again opens a second locked thing and says "4 Keys left". In a longer run
  (`deep-hands-keys3.mjs`), going back and forth between the return and the opened screen took Dan's kept Keys from 5 to
  1 on the returns of two jobs. Each time, the return claims only one Key was earned and used. **Keep it** is also still
  offered after the Key was spent, and it means nothing then.
- **Expected:** once Use it here or Keep it is chosen, the return shows only what happened (no buttons). Kept Keys are
  spent only from the Map or Today's link, where Dan knows he's spending them.
- **Likely file:** `app/src/ui/Return.svelte`. `offerHere` checks `!kept`, but not `chosen === 'used'`. The choice is
  also kept only in memory (`moment.keyChoice`), so after the app is closed and reopened, a return looked at again (from
  the Daybook, say) would offer the choice afresh.
- **Fix:** `offerHere = r?.keyNote === 'held' && !chosen && …`. Better still, work out "used" from the save (a `keyUsed`
  after this `jobDone`, before the next return) rather than from `moment`, so a reload can't bring the offer back. Add a
  flow check: Use it here → arrow back → no offer, and the Key count unchanged.

## Bugs

### 2. The tick-off return replays its count when Dan comes back to it
- **Size / engine:** 390 × 844, Chromium.
- **Steps:** as in 1 (or any tick-off whose return has a link out: a record, Use it here). Leave the return for the
  opened screen and tap its arrow back.
- **Seen:** the ring starts again from **0 min**, counts up to 60 and the flame travels again (screenshots
  `keys4-ring-0.png`, `-1500`, `-3000`: 0 → 50 → 60). The return plays the "just now" moment as if it were new.
- **Expected:** shown still, as left. Dan's watch list says this for a delve's end ("the end as he left it, the count not
  replayed"), and `Delve.svelte` keeps `moment.ends[seq].played` for exactly this. The tick-off return (Step) has no such
  memory.
- **Likely file:** `app/src/ui/Step.svelte` (line 50, `mode={moved ? 'play' : 'still'}`).
- **Fix:** remember that a return's count has played, by `seq` (a `moment.steps[seq]` like `moment.ends`), and pass
  `mode='still'` when it is shown again.

### 3. "Later" on the word leads to a Daybook page whose arrow (and the phone's back) goes back into the word
- **Size / engine:** 390 × 844, Chromium.
- **Steps** (`deep-hands-word2.mjs`): the word save, clock at 2026-10-06 11:05. Done on the delve's end, then See where
  you are, which opens the word to cut. Tap **Later**.
- **Seen:** the new Daybook week page opens (that's expected: it was waiting). **Its arrow is named after the word's
  place and leads straight back into the word**, and the phone's back does the same. Dan said "Later" and is put back in
  front of the word one tap later. Only a second "Later" reaches Today. The same happens with the phone's back on the
  word: back → Daybook → back → the word again → back → Today.
- **Expected:** Later means "not now". What waits after it (the Daybook page) has Today behind it, never the word, and
  Today then shows "A word waits to be cut" (that part works).
- **Likely file:** `app/src/ui/App.svelte`, `go()`. Leaving the word with `'later'` turns into `'today'`, which is
  redirected to the waiting Daybook as a looked-through screen, so the word stays on the trail.
- **Fix:** when the word is left by Later (or the arrow, or back), clear the trail before routing on to what waits, so the
  Daybook's arrow says Today.

### 4. On the delve set-up, "90 · one long delve" sits on top of "Towards the next place" (360 and 390 wide)
- **Size / engine:** 360 × 780 and 390 × 844, Chromium. Fine at 430 × 932.
- **Steps** (`deep-hands-setlap.mjs`): open the set-up of a job whose header runs to more lines: a job with minutes
  carried and a "Where did you stop?" note ("Carries on from…", "Last time: …"), an avoided job ("Put off a while…"), or
  a name of three lines or more (e.g. a 60–90 character name).
- **Seen:** the "90 · one long delve" stop overlaps the road's heading "Towards the next place" by 12–22 px. The two
  lines of text are drawn through each other (`names-02-set-long-360`, `huge-02-set-360`). Because the stop is a button,
  a tap on the left or middle of the heading picks 90 minutes. With a 120-character name (the longest the Add a job box
  keeps), the name also runs into the dial's "60" label.
- **Expected:** the dial and its labels shrink, or the header gives way (name clamped to two lines, notes to one each), so
  nothing overlaps at 360.
- **Likely file:** `app/src/ui/RunSet.svelte` (`.job` header, `.stage`/`.dialwrap` sizing, `.stop.long`).
- **Fix:** size the dial from the space left after the header (e.g. `min(…, available height)` via a container query, or
  measure it). Clamp `h1` to 2 lines and each note to 1 line. Add the set-up with a note and a long name at 360 × 780 to
  the layout check.

## Clumsy

### 5. The "Where did you stop?" note is cut off on the set-up, with no way to read it all
- **Size / engine:** 390 × 844 and 360 × 780, Chromium.
- **Steps:** delve on a one-off, Finish here → Not yet, and type a note of a sentence or so (e.g. "page 42 of the second
  chapter where the diagrams start to make no sense at all"). Open its set-up again.
- **Seen:** "Last time: page 42 of the second chapter where the d…": one line, cut with an ellipsis. The note is shown
  nowhere else on the way into the delve.
- **Expected:** the note is the whole point of the field (where to pick up), so it should be readable in full.
- **Likely file:** `app/src/ui/RunSet.svelte` line 173 (`set.stopped`).
- **Fix:** allow two lines (`-webkit-line-clamp: 2`), and a tap to show the rest. Also show it in the delve itself under
  the job's name.

### 6. With the keyboard up, the "Where did you stop?" box sits partly under it, and the end's ring and road labels collide
- **Size / engine:** 390 × 844 (pretended keyboard of 336 px) and 360 × 780 (300 px), Chromium. Fine at 430 × 932.
- **Steps** (`deep-hands-kb2.mjs`): a one-off delve, Finish here → Not yet, then tap into "Where did you stop?".
- **Seen:** the box's lower edge is about 11 px under the keyboard, and Back to Today is fully under it. In the squeezed
  frame, the ring's "2 min" is drawn over the "a side chamber" label (`kb2-where-stopped-390.png`). The arrow at the top
  is pushed against the top edge.
- **Expected:** the box fully above the keyboard, with no overlaps.
- **Likely file:** `app/src/ui/Delve.svelte` (the end's layout under `.kb`), with `keyboard.ts`.
- **Fix:** under `.kb`, hide the ring and road (or shrink them hard) while typing in the end's box, as is likely done
  elsewhere. Return ("done") should blur and save.

### 7. The Week's + with a name Dan already has does something different each time, and says nothing
- **Size / engine:** 390 × 844, Chromium.
- **Steps** (`deep-hands-weekdup.mjs`): the Week, + on a day, then type:
  - "Order the cat's medication" (on today) on Friday: **it silently leaves today's list and moves to Friday**.
  - "Sort the post" (on Friday) on Thursday: silently moved to Thursday.
  - "Spanish lesson" (a Thursdays-only recurring job) on Saturday: nothing at all.
  - "Course" on today, where it already is: nothing at all.
- **Seen:** the line box closes each time with no word. The Satchel's box says "… is already on today's list." / "… is
  already on {day}." / "… is one of your recurring jobs …" in the same cases.
- **Expected:** the same words the Satchel box uses, and a move only when it's clearly meant ("Moved to Friday", with
  Undo). The cat's medication quietly leaving Today is the worst of these.
- **Likely file:** `app/src/ui/Week.svelte` `add()` (and `addToWeek` in core).
- **Fix:** before adding, run the Satchel's `satchel.have.*` check and show its line under the day, keeping the box open.

### 8. "Use one here" on Today opens the Map instead of using a Key here
- **Size / engine:** 390 × 844, Chromium.
- **Steps:** the keys save, Today: under the Key count, "Use one here".
- **Seen:** it opens the Map, which lists the locked things on this stretch with "Use a Key". The link promises an action
  where Dan stands but is really a link to a list. Just below it, the "Behind you · Needs a Key" block offers a second
  Key link ("On the Map") to a different place. Two gold Key links on Today point to two places.
- **Expected:** the words say where they go, as every arrow now does.
- **Likely file:** `app/src/ui/Today.svelte` line 242 (`today.keys.hereMany`, `today.keys.here`).
- **Fix:** "Choose one here · Map" (or, with one locked thing here, open it directly as the return's Use it here does).
  Show one Key link on Today at a time.

### 9. Delete in Today's job menu removes a whole recurring job in one tap
- **Size / engine:** 360 × 780, Chromium.
- **Steps:** press and hold Course on Today → Delete.
- **Seen:** "Course is gone from your lists. Undo": every future session, not just today's. There is no confirm, and the
  Undo is a quiet line on Today. Dan may mean "not this one" (Not today exists, but only on a slide).
- **Expected:** for a recurring job, Delete says what it does before doing it ("Delete Course and all its days?"), or the
  menu offers Not today next to it.
- **Likely file:** `app/src/ui/JobMenu.svelte` (`item del`).
- **Fix:** a confirming second tap for recurring jobs ("Delete all of Course?"), and "Not today" in the menu for jobs on
  today.

### 10. During an errand run, its errands still look like ordinary jobs on Today
- **Size / engine:** 390 × 844, Chromium.
- **Steps** (`deep-hands-errand.mjs`): an errand run with three jobs, Begin, then the arrow to Today.
- **Seen:** the three errands are plain rows in the list. A tap opens the job menu with Delve, Tick off and I can't start
  greyed, with no reason. After the run ends and "What got done?" waits, a tap on any job opens the same greyed menu, and
  that menu covers "Strike them off".
- **Expected:** errands on the run marked as such ("on the run"), and the greyed items say why ("after the run" /
  "answer What got done? first").
- **Likely file:** `app/src/ui/Today.svelte` (rows), `app/src/ui/JobMenu.svelte`.
- **Fix:** a small "on the run" note on those rows. A one-line reason above greyed menu items.

## Polish

### 11. Name lengths disagree between boxes
- Add a job / the Satchel box has **no** `maxlength`: a 408-character paste is accepted and silently cut to 120 when
  saved. The Week's + allows 120, but the job editor (Edit) allows only **60**: a 61–120-character name opened in Edit
  can't be typed into (only deleted from), and nothing says why. **Files:** `Satchel.svelte` line 177, `Week.svelte`
  line 169, `Rhythms.svelte` line 134. **Fix:** one limit everywhere (e.g. 80), set on every box.

### 12. Today's list scrolls under a fixed header, with faint rows showing through behind the story passage
- At 360 × 780 with ~30 jobs (`many-03-today-30-bottom`), the place, road, Keys and three-line Ahead passage stay put, and
  the list scrolls in the ~300 px below. Rows scrolled up show faintly through the Ahead text, which has no backdrop.
  **File:** `Today.svelte`. **Fix:** a solid fade/backdrop at the list's top edge, or let the header scroll away with the
  list.

### 13. Reading a place again from Today's place name still says "Arrived"
- Tapping the place's name on Today reopens its entry, labelled "Arrived", as if Dan had just reached it.
  **File:** `Arrival.svelte` (`arrive.label`). **Fix:** "Here" (or "Read again") when opened with `again:`.

### 14. A quick second "Add a job" tap is sometimes swallowed
- Adding jobs one after another (Return, then Add a job again at the same spot within about half a second), 1 in 20
  second taps did nothing (`deep-hands-addagain.mjs 300`). This is the one-tap guard (`taps.ts`, `STEADY_MS = 500`)
  working as designed, but Return is a keyboard press, not the earlier tap. **Fix:** let a keyboard-caused screen change
  skip `steady()`, or reset `last` on Enter.

### 15. The errand run's set-up lists its errands on two lines, cut with an ellipsis
- With 12 errands, the set-up shows "12 errands: Job number 1 · Job number 2 · … · Job…". Fine, but the delve then lists
  only the first five in view, with no hint the list scrolls. **Files:** `RunSet.svelte` line 167, `Delve.svelte` (the
  strike list). **Fix:** "and 7 more" instead of the ellipsis, and a fade at the strike list's foot.

---

## What held up (checked and fine)

- **Double taps:** on Begin, Back to Today, a tick chip (30 min credited once), Use a Key on the Map (one Key spent), Not
  yet and Done.
- **A random thumb:** 4 runs × 260 steps (fresh, keys and word saves; 360 and 390) of random taps, double taps, holds,
  typing odd names, back swipes and time jumps (`deep-hands-monkey.mjs`). No page errors, no console errors, no "Something
  went wrong", no sideways scroll, no screen without a way out.
- **Back vs arrow:** on 10 paths (Satchel → set-up, Week → Next week, Week → Edit, Map → read again, Records ⇄ Symbols,
  Settings, set-up → Edit, the place, Satchel → Errand run), the phone's back always landed where the arrow said.
- **No sideways overflow on any screen at 360 × 780.** Odd names held up: 87-character, emoji, Hebrew (RTL), a
  62-letter word, spaces only (Add disabled) and empty (Add disabled).
- **30 jobs:** Today, the Week, the Satchel and the errand pick list stay usable. Today's list scrolls, and Add a job
  remains reachable by scrolling during a delve.
- **The delve loop:** set-up at the job's own minutes (Gym 60, Course 2 × 25, a one-off 30). During a delve, other jobs'
  menus open with Delve and Tick off greyed. "Not yet" keeps "N min so far" on Today, and the set-up says "Carries on
  from N minutes". "Is it done?" shows "N minutes on it".
- **A delve left running while the phone is locked** (page visible, clock jumped) past bedtime and past 04:00: its 90
  minutes counted and the road moved. Hiding the page pauses it, as D-094 and D-096 intend for another app.
- **Tonight, the morning after, and days away:** the Tonight block, "18:00 · went by", the welcome back. The Week's
  move-to-day, Another day…, Next week and The week after work.
- **Sideways (844 × 390):** the layout breaks (Today shows no list; the set-up's arrow is off the top). This doesn't
  matter: the iPhone app is portrait-only (`Info.plist`).

## Owed

- The whole pass in **WebKit** once it is available (`BROWSER=webkit`). Items 4, 6 and 12 especially, since they depend
  on text metrics and the keyboard.
- A check of item 1 after a reload (the choice is held only in memory).
