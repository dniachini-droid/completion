# Review 2: an independent click-through (2026-09-25)

One reviewer played the app at phone size (440 × 956 and 360 × 780) the way a player would: Today, a two-delve run with a pause, a place reached, records and marks, the map at both zooms, camp and the morning after, "I can't start", Not today, the satchel, the week (moving a job, a time, next week), what repeats and the daybook; then the full screen walk past the first word and the stair. No crash, no blank screen. The findings were checked again on `main` after the story-words merge; all still stood except the early Goodnight (already fixed, D-083). Spoiler-free: no story words here. Decisions: D-088 (the fixes), D-089 (Dan's two removals).

| # | Finding | Outcome |
|---|---|---|
| 1 | The back arrow always went to Today, whatever screen had opened the one you were on | **Fixed**: it returns to that screen and says its name |
| 2 | The phone's own back did nothing (the browser's back left the app; no swipe from the edge in the app) | **Fixed**: both step back one screen |
| 3 | A record opened from a place said "‹ Records" but went back to the place | **Fixed** (the arrow names where it goes) |
| 4 | The map's closer view had three ways back on one screen | **Fixed**: See the whole region is the one way out |
| 5 | Goodnight in the morning spent the night with no word | Already fixed (D-083) |
| 6 | Not today could not be undone, and the Week still showed the job as today's | **Fixed**: "Put it back" on Today; the Week says "not today" and has "Back on today" |
| 7 | Begin on a job done away from the phone could not be taken back | **Fixed**: "I haven't started" |
| 8 | Done / Already done could not be undone | **Not changed**: Done plays story that can't be taken back (rule 5). "Already done" is gone anyway (D-089) |
| 9 | Satchel lines could not be removed | **Fixed**: tap a line, "Let it go" |
| 10 | Setting a time moved 15 minutes a tap (36 taps to 9:00) | **Fixed**: a tap opens the phone's time wheel; − and + still nudge |
| 11 | The week's edit button said "Done", which on Today means the job is finished | **Fixed**: Save |
| 12 | Next week said "There is no plan for this week" | **Fixed** |
| 13 | "Plan my week" on What repeats only opened the week | **Fixed**: the link is gone (the arrow goes to the week) |
| 14 | "The day's work is done" while a job at a set time was still to come | **Fixed**: "Still to come: …" under it |
| 15 | Empty headings for days already gone | **Fixed**: a past day shows only if something was done |
| 16 | At the first hall the two "look at" choices opened each other's page | **Fixed** (ids only: b-1.A) |
| 17 | At four places both choices opened the same page | **Fixed**: only the choice that opens the page is shown (b-1.5, b-1.C, b-2.A, b-6.A) |
| 18 | At two places the written choices never showed (no page attached) | **Left as is**: the place's own buttons already go on (b-3.C, b-5.A) |
| 19 | "Step away" paused the delve, and the pause was called "A breather" | **Fixed**: Pause, and Paused |
| 20 | On the delve set-up, "here" and the next place's label printed over each other | **Fixed** |
| 21 | Small phone: Plan my week / Not now ran off the edge; the repeat editor's choices wrapped; its title repeated the arrow | **Fixed** |
| 22 | Satchel: two different "Today" on one screen | **Fixed**: "Put on today" |
| 23 | Camp: the Trial link overlapped Goodnight | Already fixed (it moved to the top bar) |
| 24 | In a week planned from a Thursday, Spanish study (2 a week) had no day | **Question**: probably the short week; to watch in play |
| 25 | (Dan, on his phone) The screen could be dragged sideways on Today; the words moved | **Fixed**: the top bar fits (the rehearsal badge wraps), nothing can slide sideways or bounce anywhere, and the screen walk checks it on every screen |
| 26 | (Dan) The week gets too long | **Fixed**: tap a day's name to fold it; days already gone start folded |
| 27 | (Dan) Friday 10 pm, and the app had moved to Saturday | **Explained**: a rehearsal was on (its clock runs 60× faster). A "Rehearsal ×60" tag now shows on every screen while one is on, until Dan is happy with the app |
