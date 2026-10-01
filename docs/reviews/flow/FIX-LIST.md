# The flow review: every finding, as one checklist

> The working list for the build after the flow review (D-143). It holds **every** finding from the four reports: **J** = [JOBS](JOBS.md), **S** = [STORY-KEYS-MAP](STORY-KEYS-MAP.md), **N** = [NAVIGATION](NAVIGATION.md), **L** = [TWO-WEEKS](TWO-WEEKS.md). Duplicates found by more than one reviewer are merged. Each item says how it is handled: **fix**, **D-143 X** (Dan's choice X decides it), or **leave** (with why). Tick each off with its commit; add a flow or rule test for every bug. **All 60 are in scope: nothing merges until every box is ticked, or Dan has agreed to move a named item later.** Spoiler-free.

## 1. Keys and the Map
- [ ] 1.1 **Map → Use a Key → Back to the Map loops forever** (S1, N bug 1). Fix: the opened screen is a look-through screen; back from the Map goes where it came from. Flow test: Today → Map → Use a Key → back lands on Today.
- [ ] 1.2 **"Use it on the Map" points nowhere** (S2, L A3, S11, L C1): Today and the Map use different tests; 18 of 36 niches never show on the Map. Fix: one definition, and the Map lists every niche a Key can open (D-143 A).
- [ ] 1.3 **"Ahead · Needs a Key" describes something behind Dan** (S3, L B2). Fix: when it's not on his stretch, say so ("Behind you · on the Map") and make the line open the Map there; prefer one on his stretch.
- [ ] 1.4 **Keys spent for him; no choice** (L B1). D-143 A: never auto-spent; "Use it here / Keep it" when something is locked where he is; else the Map.
- [ ] 1.5 **A Key where he stands still says "Use it on the Map"** (S6). Fixed by D-143 A ("Use it here" offered; recheck after a return's step brings a niche into view).
- [ ] 1.6 **Opened niches can't be read again** (S5, N clumsy 4; Dan's question). D-143 B: the Map lists opened ones under their place, "Opened · Read again".
- [ ] 1.7 **Daybook's Key line never fills** (S4): built only from removed floor Keys. Fix: from every Key-opened niche that week; with D-143 B the week page lists that week's finds and opened niches.
- [ ] 1.8 **"Use it" with 2+ Keys** (S polish). Fix: "Use one on the Map".
- [ ] 1.9 **Unused copy** `map.sealedLabel`, `map.sealedSay`, `welcome.at`, `welcome.ahead` (S polish). Fix: use (see 6.3) or delete.
- [ ] 1.10 **Opened screen's exits** (S polish): when reached from Today's link, offer Today as the quiet second exit.
- [ ] 1.11 **A fortnightly job kept up again gives no Key, silently** (L C4). Fix: one quiet line, "Already earned this fortnight's Key."
- [ ] 1.12 **Map "you are here" light vs box name differ** (L B7: the stretch's name vs the place's). Fix: the box says "In {stretch}" under the place, or the same name on both.

## 2. Today and the finish line
- [ ] 2.1 **The finish line moves after the shown jobs are done** (L A1). Fix: a job on the day's line stays on it when done, whatever put it there; the line never refills because of a completion. Rule test.
- [ ] 2.2 **"Add a job" on Today doesn't add to today** (J5). D-143 C.
- [ ] 2.3 **A half-done job vanishes overnight, minutes unseen** (J6). D-143 D ("N min so far" on Today).
- [ ] 2.4 **Rows say "25 min" though the set-up opens at 30; carried minutes never shown on the row** (J2). Fix: rows show the set-up's minutes; with carried minutes, "N min so far".
- [ ] 2.5 **During a delve, no "Add a job", no menus, no slides** (J9). D-143 E.
- [ ] 2.6 **Avoided job holds the day with no word** (L B6). D-143 G ("Only [job] left: that's the one.").
- [ ] 2.7 **"Not today" on a recurring job vanishes; undo only in the Week; "Put it back" dies on leaving Today** (J7). Fix: the row stays as "Not today · Put back" (struck, quiet) for the rest of the day.
- [ ] 2.8 **A done recurring row ignores taps** (J11). Fix: a tap opens its menu (Delve again · Not done after all), as the hold does.
- [ ] 2.9 **"Errand run" link from the first minute, with gym and study as errands** (J12, L C2). Fix: recurring jobs out of the errand pick list; the link only when two or more one-offs could go.
- [ ] 2.10 **A passed appointment sits unremarked** (L C5). Fix: its time reads "18:00 · went by", no reproach.
- [ ] 2.11 **"I can't start" only in the hold menu, undiscoverable** (J19, overview). Fix: one quiet hint once ("Press and hold a job for more"), and keep the menu.
- [ ] 2.12 **Today's held card doesn't say "first of two delves"** (J18). Fix: add it, as the delve screen does.

## 3. Jobs: adding, delves, ends
- [ ] 3.1 **Errand run: back on "What got done?" counts silently and loses the story** (J1). Fix: back leaves the question waiting (as "Is it done?" does); counting only by "Count them" or the next opening, and its story is then shown.
- [ ] 3.2 **"Where did you stop?" never shows after Finish here → Not yet on a one-off** (J3). Fix: show it there.
- [ ] 3.3 **Duplicate jobs from the Week's +, Tonight's line and Siri** (J4). Fix: the same name check the Satchel box uses.
- [ ] 3.4 **"Delve now" on a remembered job skips the set-up** (J8). Fix: it opens the set-up (carry line, dial), like every other start.
- [ ] 3.5 **"Is it done?" left by the arrow never says the minutes** (J10, J17). Fix: the question card says "N minutes on it".
- [ ] 3.6 **Same-day "No more" / "It's done" replays the road and counts from 0** (J13). Fix: show the line still, at the job's total, with no replay.
- [ ] 3.7 **"done for the day: 3 minutes"** (J14). Fix: under 5 minutes, "Counted: 3 minutes." without the congratulation.
- [ ] 3.8 **The Satchel's box after "Add a job"** has no label or Return hint (J15). With D-143 C this box is Today's own; give it a label and "Return adds it".
- [ ] 3.9 **Satchel suggestions can't be dismissed** (J16). Fix: they hide on a tap outside; check 360 × 780.
- [ ] 3.10 **Tick sheet: "No more" looks like a duration** (J20). Fix: set it apart (its own row).
- [ ] 3.11 **The errand run's end is a wall** (L B5): summary, story, four guesses, two finds. Fix: one errand's story per screen with "Next", guesses after.
- [ ] 3.12 **"1 minutes"** mid-count on the ring (L C6). Fix the grammar.

## 4. Getting around (back, exits, names)
- [ ] 4.1 **A delve's end is lost after opening a link from it** (N bug 2; same on Morning / Welcome → a record). Fix: the end (and morning, welcome) is marked seen only when left for Today, not for a look.
- [ ] 4.2 **"Back to Back"** (N bug 3). Fix: the set-up gets a name in the back labels.
- [ ] 4.3 **The word-cutting screen can't be left** (L A2, N bug 4). Fix: "Later" and the arrow go to Today (the "stay" route); Today shows a quiet "A word waits to be cut" line until he goes back.
- [ ] 4.4 **Records ⇄ Symbols stop being tabs after a mark is picked** (N clumsy 1). Fix: any Records ↔ Symbols move replaces, never pushes.
- [ ] 4.5 **"Done reading" goes to Today while the arrow goes back** (S8, N clumsy 7). Fix: "Done reading" goes back.
- [ ] 4.6 **The new Daybook page: back swallowed, offer gone for good if left by the arrow** (N clumsy 2). Fix: the offer stays on that page until answered or the week ends; with D-143 F the page no longer opens by itself after an absence.
- [ ] 4.7 **Look ahead / Plan it for me: three taps back to Today** (L B4). Fix: finishing it lands on the Week whose arrow says Today.
- [ ] 4.8 **Screens opened from the Satchel or Week drop him on Today** (N clumsy 3: tick off from the Satchel; "Not now" from I can't start). Fix: their exits go back where he came from.
- [ ] 4.9 **The phone's back swipe does nothing on waiting moments** (N clumsy 5). Fix: back on a fresh arrival, the morning or the welcome goes on to Today, as their own button does.
- [ ] 4.10 **Generic "Back" labels where he's deepest** (N clumsy 6, S7). Fix: every arrow names its destination (set-up, Welcome, Satchel from "Keep going", a record from a place).
- [ ] 4.11 **Two controls for one exit on most moments** (N clumsy 7). Fix: keep one exit per destination; where both stay, they must go to the same place.
- [ ] 4.12 **"Keep going", "Go down", "Recurring jobs" open the Satchel without saying so** (N clumsy 8, L C7). Fix: name it ("Keep going · the Satchel"); from the stair on a gold day, Today.
- [ ] 4.13 **Coming back after days away stacks screens** (L B3, S10). D-143 F.
- [ ] 4.14 **Welcome back's bare line and no arrow** (S9, N polish). Fix: label it ("Ahead of you: …", the unused copy); give the screen an arrow; after "Read the last record", back returns to it.
- [ ] 4.15 **Naming drift** (N polish): "Back to today" / "On to today" / "Today"; "Back to MAP" in capitals; "Edit" vs "Change the job". Fix: one word each.
- [ ] 4.16 **Daybook pager**: "Earlier" pushes, "Later" replaces (N polish). Fix: both replace.
- [ ] 4.17 **Settings' link to the trial controls repeats the heading** (N polish). Fix: a short link label.
- [ ] 4.18 **Today's "Daybook" link on a fresh save opens an empty page** (N polish). Fix: hide it until the first page exists.

## 5. Small phone (360 × 780)
- [ ] 5.1 **The job menu with its calendar hides Cancel** (N polish). Fix: the calendar replaces the menu's items, Cancel stays in view.
- [ ] 5.2 **A slid row hides the job's name** (N polish). Fix: narrower actions so the name stays readable.

## 6. Story world, one-time things
- [ ] 6.1 **Finds and job-return moments are one-time** (S5, the one-time table). D-143 B: the Daybook week page lists the week's finds (and opened niches).
- [ ] 6.2 **The side chamber leaves no trace of what was found** (S polish). Covered by 6.1.
- [ ] 6.3 **Earlier camps can't be re-read** once a later place is reached (S polish). Fix: the Map lists camps under their stretch, as it does places.
- [ ] 6.4 **Two records share one title** (L C3). Fix: a distinguishing word in the title (content, spoiler-checked).

## Left as they are (reviewers said fine or by design)
- Reload mid-screen returns to Today or what waits; a running delve is kept (N polish, S polish): acceptable. A half-typed editor is lost: leave.
- Double taps, hold vs tap vs slide, VoiceOver labels, delve across screens, Week / Map / Settings back chains, place read-again: all confirmed working (N, S, J).
