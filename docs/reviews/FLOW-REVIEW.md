# The flow review: what Fable found and what I recommend

> For Dan, 2026-10-01. Spoiler-free.
>
> You asked for a thorough review of the whole app and how you move through it. Four reviewers (Fable, working independently) clicked through the app in a real browser at phone size, read the code behind each screen, and wrote a report:
> - **Jobs and delves** ([`flow/JOBS.md`](flow/JOBS.md)): adding jobs, working on them, how minutes are counted, coming back to them.
> - **The story world, Keys and the Map** ([`flow/STORY-KEYS-MAP.md`](flow/STORY-KEYS-MAP.md)): the road, arrivals, Keys from start to finish, Records, Symbols, Daybook.
> - **Getting around** ([`flow/NAVIGATION.md`](flow/NAVIGATION.md)): every screen's ways in and out, back, gestures, the small phone.
> - **Two weeks of real life** ([`flow/TWO-WEEKS.md`](flow/TWO-WEEKS.md)): 15 days played from a fresh start, with a diary.
>
> **Every finding from all four reports is in one checklist: [`flow/FIX-LIST.md`](flow/FIX-LIST.md).** This page is the summary.
>
> They reviewed everything including the Key changes not yet merged (pull request #77). **Nothing has been changed yet.**

## The verdict in one paragraph

**It is a game, not admin.** Over the simulated fortnight the next step was obvious on almost every opening. Nothing piled up. Failure was never shamed (a lazy Saturday, a late night, a forgotten lesson, three days away). Minutes agreed on every screen, a new place came every 150 minutes with no stall, and nothing could be earned twice. The delve loop is solid: double taps make one decision, and pause, carry on and "Not yet" all count correctly. **The spell breaks in four places:** the day's finish line can move after you do the jobs it showed you; one screen can't be left; Keys contradict themselves and you never get a real choice with them; and some things you see once can never be read again.

## Answer to your question first

**"When I open an area from the Map, does the screen only appear once or can I go back to it?"** Once, and it's worse than that. Two problems:
1. **You get stuck.** After "Use a Key" → "Back to the Map", the Map's back arrow leads back to the opened screen, which leads back to the Map, forever. Two reviewers found this separately. It's from today's change, and easy to fix.
2. **Its words are gone once you leave.** 23 of the 36 locked extras have no record, so their words exist only on that one screen. It's also inconsistent: a Key used when you *arrive* somewhere is re-readable under that place's entry, but one used on the Map or after a job is not.

The same is true of: the story moment after each job, every find (side chambers, morning finds), and the morning screen. **Places and records are the only things you can always read again** (from Today's place name and from the Map), and that works well.

## The worst problems (I'd fix all of these)

| # | What happens | Who found it |
|---|---|---|
| 1 | **The day's finish line moves.** Sunday listed three jobs under "Today"; you do all three; the day doesn't go gold. Two "If there's time" jobs jump up into "Today" instead. It happens when a job was on the list because it was due, not because the week's plan put it there. | Two weeks |
| 2 | **The word-cutting screen can't be left.** "Later" and the back arrow both bring the same screen straight back. You're stuck until you do the whole cut. | Two weeks, Navigation |
| 3 | **Map → Use a Key → Back to the Map loops forever.** | Story, Navigation |
| 4 | **"Use it on the Map" points nowhere.** Today and the Map use two different tests for "something a Key can open". 18 of the 36 extras can never appear on the Map. In 3 simulated weeks at 2 h a day, the link pointed somewhere useful 0 times out of 9. | Story, Two weeks |
| 5 | **"Ahead · Needs a Key" can describe something behind you,** in a part of the road you left days ago. | Story, Two weeks |
| 6 | **Errand run: the back arrow on "What got done?" counts the run silently.** The story moments for the errands you struck off are written but never shown. | Jobs |
| 7 | **The end of a delve gets lost** if you open a link from it (a record, "N thoughts parked") and come back. You land on Today instead. The same happens on the morning and welcome screens. | Navigation |

## Smaller bugs (fix, no decision needed)

- **The minutes on a job's row are wrong.** A new job's row says "25 min", but its set-up opens at 30. After "Not yet", the row never shows the minutes you've already done.
- **"Where did you stop?" never appears** after Finish here → Not yet on a one-off, which is the case it was built for.
- **Some ways of adding a job create a second copy** of a job you already have: the Week's +, Tonight's "Anything on your mind?" and Siri. The Satchel box and Park a thought already refuse duplicates.
- **"Back to Back"** shows as a button label (set-up → Change the job → Delete).
- **The Daybook's line for each Key used never fills in.** It only counted the free weekly Keys, which are gone.
- **After you leave Records ⇄ Symbols,** going back takes 6 taps, and the first one seems to do nothing.
- **A Key that can open something where you are still says "Use it on the Map".**
- **Small phone:** the job menu's Cancel button can be hidden below the calendar.
- **Wording:** "1 minutes" shows mid-count; "Use it" shows when you have 2 or more Keys; "Back to today" vs "On to today"; "Edit" vs "Change the job".

## Clumsy flow, where I need your view

These are design choices rather than bugs. My recommendation is first in each.

**A. Keys: give you the choice, or keep spending them for you?** The two-week reviewer earned 6 Keys and never once chose what to open. Each was either used on the spot or spent automatically on the next arrival.
- *Recommended:* a Key is never spent for you. When you earn one and something is locked right where you are, the screen offers **Use it here** / **Keep it**. Everything else is opened from the Map, which lists every locked thing you've passed. One rule, and Keys become something you hold and decide about.
- Or: keep today's rule (used automatically where you are; Map for the rest) and just fix the bugs above.

**B. Where do opened extras and finds live afterwards?**
- *Recommended:* an opened extra stays on the Map, under its place, marked "Opened · Read again", like places. Each Daybook week page lists that week's finds and opened extras, so the one-off words have a home.
- Or: only the Map, for opened extras.

**C. What does Today's "Add a job" do?** Today it puts the job in the Satchel's "No day yet", and getting it onto today's list takes five more taps.
- *Recommended:* "Add a job" on Today puts it on **today**. The Satchel's own box keeps adding to "No day yet".

**D. A job you've started but not finished.** Left on "Not yet" with 27 minutes done, it disappears from Today overnight into the Satchel, with nothing showing its minutes.
- *Recommended:* it stays on Today the next day, marked "27 min so far", until it's done or you move it.

**E. While a delve runs, the rest of your jobs are locked.** You can't add, edit, delete or move anything.
- *Recommended:* you can add, edit and move other jobs during a delve. You just can't start a second delve.

**F. Coming back after days away** shows two full screens before Today: the welcome back, then the Daybook's new page with its planning offer.
- *Recommended:* show the welcome back only. Today gets a quiet "A page was written for you · Daybook" line.

**G. The first day never went gold** after 3 hours of real work, because the avoided 25-minute job stayed on the list.
- *Recommended:* leave this as it is, since the avoided job is the point of the game. But say so: after the day's other jobs are done, Today's line reads "Only [job] left: that's the one."

## Minor polish (I'll fold these in)

- **Doubled exits.** Several one-off screens have two ways out that do the same thing (an arrow and a button).
- **Hidden destinations.** "Keep going" and "Go down" open the Satchel without saying so.
- **Hard to discover.** "I can't start" lives only in the press-and-hold menu.
- **Odd errand list.** The errand list can offer a 1-hour study session.
- **Repeated titles.** Two records can share a title.
- **A Key with no explanation.** A fortnightly job kept up a second time gives no Key, and nothing says why.
- **Unremarked appointments.** A time that has passed sits on Today with no word.
- **Phone back swipe.** It does nothing on screens that wait for you (a new arrival, the morning, a new Daybook page).

## What flows well (keep it)

- **Opening the app:** the next action is obvious; nothing piles up; old avoided jobs slide quietly into the Satchel.
- **The delve loop:** double taps, pause, carry on, the 3-hour finish, "Not yet" carry-over, "Not done after all" (nothing paid twice), Delete with Undo.
- **The other features:** Waiting on…, Park a thought, "I can't start" → 10 minutes, the errand run as designed.
- **Numbers:** they agree everywhere. 30 minutes' work is always 30 minutes nearer the next place, and a late-night delve counts for the right day.
- **Tone:** gentle on late nights, empty days and absences.
- **Getting around:** reading places again from Today and the Map, back arrows across the Week, Map and Settings, and VoiceOver labels on every icon.

## The plan I'd suggest

1. **One build of fixes:** the 7 worst problems, the smaller bugs, and whatever you choose on A–G. Pull request #77 (the Key count and the Map) gets folded into it rather than sent half-working.
2. **A flow test for every bug fixed**, so none of them comes back. For example: Map → Use a Key → back must land on Today; doing the jobs listed under "Today" must make the day go gold.
3. **One TestFlight send** when it's done and checked.
