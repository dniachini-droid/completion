# Deep review: three weeks lived as Dan (Mon 5 – Mon 26 October 2026)

**How.** I played a fresh save on a 390 × 844 touch screen (Chromium, Europe/London), using the fake clock to step through three real weeks: setting jobs up, hard days of 6–8 h, light days, two skipped days, four days away, nights past midnight and past 04:00, three week closes, and the clocks going back at 02:00 BST on Sunday 25 October. The scripts are `app/tests/review/deep-weeks-1.mjs` … `-5.mjs`, with helpers in `deep-weeks-lib.mjs` and targeted repros in `deep-weeks-probe.mjs`. Each part hands its save to the next through `/tmp/claude-weeks/save-*.json`. There are about 330 screenshots, plus the text of every screen, in `/tmp/claude-weeks/` (`log.txt`). The preview runs on port 4184. I changed nothing in `app/src`. Places are named only as "the Nth place", "a niche", "the word" and so on. No story text is quoted.

**Set-up done in the app:** Gym from 4 down to 3 a week (1 h). Course from 4 down to 2 a week (50 min, delved as 2 × 25). Tank clean every 2 weeks (preloaded). A new monthly bill on the 20th (15 min). "Book passport photo" by Mon 12. "Boiler repair" waiting on the landlord. The dentist on Wed 7 at 14:30 and a haircut on Fri 16 at 10:00, both from the Week's "+". "Send the birthday card" by Wed 14.

---

## Day-by-day log

**Week 1**
- **Mon 5 (hard, about 6.5 h).** Setting up in the Satchel and the editor was clear. The Week came already laid out and used the new numbers straight away (gym Mon/Wed/Fri, course Tue/Thu). I added "Write the quarterly report" and delved 3 × 90. The day reached the 2nd and 3rd places. I answered "Not yet" and typed where I stopped, and **"Back to today" led through both arrivals and back to the delve's end screen** (F2). Course was not on Today, so I delved it from the Satchel. I ticked off Gym at 1 h (a find), then finished the report (60 min, Done, a place). The minutes on the road line matched every time (270 → 330 → 390). The day never turned gold because of the preloaded avoided job (F11). Go to sleep at 23:30 said "Nothing is lost". Good.
- **Tue 6 (light).** Spanish study 30 min. The Course delve from 00:45 to 01:40 counted for Tuesday, which is right. Go to sleep at 01:45.
- **Wed 7.** The dentist row read "14:30", and at 15:40 "14:30 · went by". I ticked it off at 1 h, which reached a place. I added three errands. **"Buy stamps", added with "Add a job" (whose hint says Return adds it to today), landed under "If there's time"** (F10). For the errand run I picked 2, struck Bank off in the delve, and finished at 35 min. "What got done?" led to "Count them", then an end with one story moment. The errand left over went back to the Satchel. Spanish study 60 min earned **the first Key** ("You kept up Spanish study…", Use it here / Keep it, and I kept it). In bed by 22:50, so a +15 head start the next morning.
- **Thu 8 (hard, about 7 h).** Boiler repair came back from waiting ("Did they reply?"). I used Still waiting and set it until Thu 15. Tax return 90 × 2 and 60 × 2 (Not yet both times; "5 h so far" carried over), and Course 2 × 25. The lesson row climbed at 17:50. Ticked at 19:15, it earned **Key 2**. At 03:20 Friday I delved Spanish study until 04:20: it **counted for Thursday**, and Today had already turned to Friday's list. This time the end said "You already earned this week's Key", which is good.
- **Fri 9.** Not opened. Nothing was said about it later.
- **Sat 10.** I ticked off Tank clean, which earned Key 3. Use it here opened the niche ("2 Keys left"). **Back on the step screen it said "earned a Key, and used it here" and still offered Use it here / Keep it. Tapping it again spent a second kept Key** (F1). The Map opened from the top bar showed no "Use a Key" until a light was chosen. From Today's "Use it on the Map" it listed 4 at once, which is fine.
- **Sun 11.** Gym 60 (no Key, which is right: the old 4-a-week target still applied this week, as the editor said). Meal prep earned Key 4. Bed on time.

**Week 2**
- **Mon 12.** The morning find, then the Daybook page for 5–11 Oct. Its counts were all right (Course 3, Gym twice, Spanish study 3, report, dentist, bank, lesson, tank, meal prep), and it listed where I went, what I found, and the offer. I passed it with the arrow and reopened it from the foot. The hard day was about 8 h: Tax return 90 × 2 Done, slides 60 × 2 Not yet then 60 Done, Course, the passport photo ticked at 30 min, Gym, Spanish study. **From 14:05 a word waited to be cut, and Today's road line showed no minutes at all for the rest of the day**, although two more places were reached (F7). Bed at 00:30.
- **Tue 13 to Sat 17.** Not opened: one skipped day, then four days away. The Thursday lesson, the haircut, the birthday card's date and the boiler's "back on" day all passed.
- **Sun 18 (back).** **The first screen was the word to cut** (I had chosen Later on Monday), then a morning find, then the welcome back (F3, F8). The welcome had the right tone ("the road has waited", "One small task is enough") and asked about the birthday card ("was wanted by Wed 14 Oct. Still needed?"). **It said nothing about the haircut, which had silently become a "no day yet" line in the Satchel with its time gone** (F5). **Today then showed every missed recurring job under "Today": Meal prep, Course, Tank clean, Spanish study (about 4 h), plus Gym and the card under "If there's time". The Week showed Sunday as "about 5 h"** (F4). **Tank clean, done eight days earlier, was due again** (F6). Reopened ten minutes later, the word screen came back again (F3). I cut the word, and the road line returned ("next place in 1 h 35", with no minutes lost). Boiler "It's done" was ticked at 15 min. Gym was ticked at 1 h. Not today on Tank clean **pulled Gym up from "If there's time" onto the finish line** (F9).

**Week 3**
- **Mon 19.** The Daybook for 12–18 Oct: counts right and **no word about the missed days or the missed lesson**, which is exactly right. "Plan it for me" led to the Week, whose arrow said **Today** (B4 from the last review is fixed). I/I can't start on the cat's medication: "Start with one small thing" → Try ten minutes → 10-minute delve → Not yet → "10 min so far" stayed on Today. Course 2 × 25.
- **Tue 20.** The monthly bill appeared on the 20th. Ticked at 15 min, it earned a Key. Not today on "Sort the post" left it struck through with Put back, and nothing refilled the line. Gym 60.
- **Wed 21 (hard, about 6 h).** Newsletter 90 × 3, Tank clean (a Key for the new fortnight), Spanish study, newsletter 45. "Use one here" opened the Map, where I used a Key; the arrow said "Back to the Map" and "3 Keys left". Good.
- **Thu 22.** I ticked the lesson at 19:10, which earned a Key. **Fri 23:** Gym ticked.
- **Sat 24 → Sun 25, the clocks going back.** At 01:15 BST the set-up for 90 min said "finishing around 01:45", which is correct in GMT. The delve ran across 02:00 BST → 01:00 GMT and counted **exactly 90 minutes** for Saturday. Go to sleep at 01:45 GMT gave the gentle late-night line. A Course delve from 03:30 to 04:30 GMT counted for Saturday and earned a Key.
- **Sun 25.** Gym 60 earned the 5th Key of the week. **Meal prep, kept up, earned no Key and said nothing about why** (the weekly cap; F12). Bed on time.
- **Mon 26.** The morning find, then the Daybook for 19–25 Oct, with counts all right: Course twice, Gym 3, the bill, tank, Spanish study, lesson, newsletter, meal prep, six places, and the opened niche.

**Totals at the end:** 2,980 minutes walked, 20 arrivals, 9 Keys earned (3 used, 6 kept). Every delve's and every tick's minutes matched the road line and the Daybook to the minute.

---

## Findings

Severity: **urgent** (Dan would stop trusting it, or it breaks a promise) · **bug** · **clumsy** · **polish**.

### F1. Urgent: "Use it here" is offered again after it was used, and spends a second Key
- **Steps:** Sat 10. I held 2 Keys and ticked off Tank clean (kept up, so it earned a Key). On the step screen I tapped Use it here; the niche opened. I went back ("Back to Tank clean").
- **Expected:** "…earned a Key, and used it here", with no offer.
- **Seen:** that line **and** the "Use it here / Keep it" pair under it (`w1-sat-tank-02.png`). Tapping again opened a second niche and spent another kept Key (two `keyUsed` facts for one job's return, `w1-sat-tank-03.png`). "Keep it" after "used it here" contradicts itself. This is a Key spent for Dan in effect, which D-143 A rules out.
- **Likely file:** `app/src/ui/Return.svelte`. `offerHere` checks `!kept` but not `chosen === 'used'`.
- **Fix:** `offerHere = … && chosen !== 'used' && …`.

### F2. Bug: "Not yet" with a "where did you stop" note, then a place reached: "Back to today" returns to the delve's end
- **Steps:** a one-off delved long enough to reach a place, then "Not yet". Type a note in "Where did you stop?", then Back to today. Repro in `deep-weeks-probe.mjs` 5 and 6: with the note the screens run delve > arrival(s) > **delve end again**. Probe 1 (no note) reaches Today.
- **Expected:** arrival(s), then Today.
- **Seen:** the "Every minute counts… Back to today" screen again after the arrivals, with the note box empty (the note was kept). Dan presses "Back to today" twice and sees the same screen twice.
- **Likely file:** `app/src/ui/Delve.svelte` `leave()`. `keepNote()`'s `noteJob` and the `seen step` are sent back to back, and the `seen` most likely doesn't land (or lands against a stale `end`). `game.view.runEnd` stays set, so `App.svelte` `first()` sends Today back to `'delve'`.
- **Fix:** write the note and the `seen` together (one command), or mark it seen first. Add a flow check for this case.

### F3. Urgent: the word screen is forced again after every app restart, and even after days away
- **Steps:** Mon 12, a word waits. Choose Later; Today's line "A word waits to be cut" works. Then the app is closed (a reload), as iOS does on its own.
- **Expected:** the quiet line stays; after days away the welcome back comes first (D-143 F).
- **Seen:** on reopening on Sun 18, the first screen was the Cut, then a morning screen, then the welcome. Reopened 10 minutes later, the Cut came first again (`w2-sun-1030-open.png`, `w2-sun-1040-reopen`). This is A2 from the last review coming back whenever the app restarts.
- **Likely file:** `app/src/ui/moment.svelte.ts` (`wordLater` lives only in memory) and `App.svelte` `first()`.
- **Fix:** keep "Later" in the save (a `seen`-like fact, e.g. `wordLater: seq`), so `first()` skips the word after a restart.

### F4. Urgent: after days away the missed recurring jobs pile onto the day he comes back
- **Steps:** a plan for 12–18 Oct; not opened from Tue 13 to Sat 17; open Sun 18.
- **Expected:** "One small task is enough" (the welcome's own words). The day holds what Sunday was planned to hold (Meal prep, Gym). Nothing piles up (rule 9, "nothing accumulates").
- **Seen:** Today listed Meal prep, Course, Tank clean and Spanish study under "Today" (about 3 h 50, so the day can't be finished without them), plus Gym and the dated card under "If there's time". The Week showed Sunday as "about 5 h" with every missed session moved onto it (`w2-sun-1031.png`, `w2-sun-week`). Right after the gentlest screen in the app, Dan meets a heavier day than any he planned: a backlog in all but name.
- **Likely file:** `app/src/core/week.ts` (how missed plan entries carry to later days) and the slate/line in `core/game.ts`.
- **Fix:** after an absence (when the welcome back fires), re-lay the rest of the week from today and don't carry missed sessions forward. At most put the day's own plan on the finish line. Or cap the line at the day's planned size and put the rest under "If there's time".

### F5. Bug: an appointment that went by while he was away vanishes from its day, with no question
- **Steps:** the haircut on Fri 16 at 10:00, set in the Week; away until Sun 18.
- **Expected:** the welcome's slip "Haircut, on Fri at 10:00, went by. Still needed?" (the `slip.appt` copy exists), as the birthday card got one.
- **Seen:** only the card's slip. The haircut sits in the Satchel under "No day yet" with no time and no remark (`w2-sun-satchel`). Dan could believe he still has an appointment, or lose track that it needs rebooking.
- **Likely file:** `app/src/ui/Welcome.svelte` (`slip` seems to hold one item) and the plan carry in `core/week.ts`.
- **Fix:** show each slip, appointment and date alike (or the soonest of each kind), or leave the appointment on its day as "went by".

### F6. Bug: "Every 2 weeks" is a fixed fortnight on the calendar, not "two weeks after the last time"
- **Steps:** Tank clean ticked off Sat 10 Oct.
- **Expected:** due again around Sat 24.
- **Seen:** it was planned for Wed 14 and sat on Today on Sun 18 (8 days later). In week 3 it earned another Key on Wed 21 (11 days later). The cause is `sameFortnight` in `app/src/core/repeat.ts`, which takes `floor(epochDays(Monday) / 14)`, so 5–11 Oct is one fortnight and 12–25 Oct the next. A job done at the end of one fortnight is due again 2 days later, and two Keys can come 3 days apart. Dan, who cleans the tank every other weekend, is asked for it in the "wrong" week half the time.
- **Fix:** count the fortnight from the last session, as `everyDays: 14` does (`dueFrom`). Or anchor the fortnight to the week the rhythm was set up, and plan the second week of a done fortnight empty.

### F7. Bug: while a word waits, Today's road line shows no minutes at all
- **Steps:** Mon 12, from 14:05 (a word reached) until the cut on Sun 18.
- **Expected:** the line still shows where the minutes go (or says plainly that the road waits for the word), so 4 h 20 of Monday's work visibly counts.
- **Seen:** Today's line had the flame at "the next place" with no "in … min" and an empty `aria-label` (`w2-mon-1410.png`). Two more places were reached meanwhile, so the minutes did count (2,980 walked in total; none lost after the cut). The set-up showed the flame drawn *past* "the next place" under "To the next place" (`w2-mon-gym-set.png`). To Dan the road looks stopped for five days.
- **Likely file:** `app/src/ui/Today.svelte` (`roadSay`/`roadNotes`) and `EndRoad.svelte`, plus `v.road` in `core/game.ts` when the next beat is the word.
- **Fix:** when the next thing is the word, say it on the line ("The word waits at the lintel · cut it to go on") and keep counting the minutes beyond it. In the set-up, don't draw the flame beyond the place it is heading for.

### F8. Clumsy: three screens before Today after days away (word, morning, welcome); two on most Mondays
- **Seen:** Sun 18: the Cut, then "Something was waiting for you at camp", then Where you were. Mon 26 (bed kept): the morning find, then the Daybook page.
- **Fix:** F3 removes the first. After an absence, fold the morning find into the welcome or drop it. On a Monday, let the Daybook wait as Today's quiet line when a morning screen has already been shown.

### F9. Clumsy: "Not today" refills the finish line
- **Steps:** Sun 18, Not today on Tank clean (`deep-weeks-probe.mjs` 8).
- **Seen:** Gym (1 h) rose from "If there's time" into "Today". Dan takes an hour off his day and an hour goes back on. That is the same moving goalpost as A1 from the last review, but on the "lighten my day" action.
- **Fix:** an aside job shrinks the line. Only Dan's own "Put back" or a pick from "If there's time" grows it.

### F10. Clumsy: a job added with "Add a job" ("Return adds it to today") can land under "If there's time"
- **Steps:** Wed 7, three errands added one after the other.
- **Seen:** the third ("Buy stamps") showed under "If there's time" while the first two sat on the finish line (also in probe 4).
- **Fix:** a job Dan adds to today goes on the line (the line is his), or the box says "Added: if there's time".

### F11. Clumsy (B6 still there): 6.5 hours of work on day 1 and no gold
- **Steps:** Mon 5. The preloaded avoided job ("Order the cat's medication") was first on the list.
- **Seen:** report 5 h 30, Gym 1 h, and the day stayed open with "Only … left: that's the one." The avoided job then slid away to the Satchel by itself the next day, so it was never really a deadline. Course (2 a week, planned Tue/Thu) wasn't on Monday's Today, which is right but meant the 25-minute delve had to come from the Satchel.
- **Fix:** as B6 suggested: don't let a preloaded or avoided one-off hold the finish line once the day holds ~3 h of done work. Or put it under "If there's time" on its first day.

### F12. Clumsy: a recurring job kept up past the week's 5 Keys says nothing
- **Steps:** Sun 25. Meal prep (Sundays) kept up; five Keys already earned that week (bill, tank, lesson, course, gym).
- **Seen:** only "A FIND" (`w3-sun-meal-00`). The "already earned" lines exist for the period, but there is none for the weekly cap. Dan has learned "kept up → Key"; a silent no reads as a mistake.
- **Fix:** one quiet line, e.g. "Five Keys this week: this one brings a find instead."

### F13. Polish: the welcome says "Ahead of you: X" while he stands at X
- **Seen:** Sun 18. The welcome's "Ahead of you" names a locked thing at the side chamber passed in week 1, whose name matches the place he stands in. Today's "Ahead · Needs a Key" names the same thing. This is the B2 "Ahead is behind" issue in another form.
- **Fix:** use the same Behind you/Ahead rule as Today (D-143 S3) on the welcome.

### F14. Polish: the job editor
- (a) Monthly: "on the 20th of each month" is printed twice, as the stepper's value and as the note under it (`w1-mon-bill-editor.png`).
- (b) "A changed number counts from next week…" also shows on a brand-new recurring job, where nothing changed.
- (c) Course's preloaded 50 min can't be reached again once moved, because the length steps are 45/60.
- (d) "Each delve still starts at 30 minutes" disagrees with CURRENT_STATE ("Gym's set-up opens at 60, Course at 2 × 25"). Check which is true.

### F15. Polish: a passed "by" date lingers word for word
- **Seen:** "Send the birthday card · by Wed 14 Oct" was still printed so on Mon 19's Week and Today after the welcome asked about it (unanswered).
- **Fix:** after the date has passed, show "wanted by Wed 14" softly, or nothing.

### F16. Polish (needs a look): one CSP console error
- **Seen:** once in week 3: `Refused to connect to …/assets/pt-b-4.C-….webp because it violates … "connect-src 'none'"`. Something fetches a painting (not an `<img>`); with `connect-src 'none'` it is blocked.
- **Likely file:** `app/index.html` CSP, or a `fetch` of a painting URL (the bundle has two `fetch(` calls). Check that no painting fails to show on the phone.

---

## What held up (worth keeping)

- **Minutes are honest, every time.** About 50 delves and ticks: each moved the road by exactly its minutes. Places came every 150 min on 8-hour days with no stall. "N h so far" carried across days. The Daybook counts matched the facts all three weeks.
- **The day edge and the clock change are right.** Delves across midnight and across 04:00 counted for the evening's day. The 90-minute delve across 02:00 BST → 01:00 GMT counted 90 minutes, and its set-up said "finishing around 01:45", which is correct.
- **No guilt anywhere.** Late nights ("Nothing is lost"), the skipped days, the missed lesson, four days away and the absent week's Daybook page: nothing reproached him. "went by" on a passed appointment is neutral.
- **Keys are now Dan's.** Use it here / Keep it, the Map's "Use a Key" (from Today's link), "Back to the Map", "N Keys left", "already earned this week's Key". F1 is the one hole.
- **Waiting on, I can't start, errand runs, Plan it for me (arrow → Today), Not yet's carry-on note:** all worked as described in CURRENT_STATE.

**Counts:** 16 findings: 3 urgent (F1, F3, F4), 4 bugs (F2, F5, F6, F7), 5 clumsy (F8–F12), 4 polish (F13–F16).
