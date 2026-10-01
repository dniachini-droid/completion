# The deep review: what it found, and what I propose

> For Dan, the morning of 2026-10-02. Spoiler-free. **Nothing has been changed in the app.** Everything below is a proposal, waiting for your go.
> Branch: `claude/review-round-5`. The full reports sit next to this page in `docs/reviews/deep/`.

## In one paragraph

Ten separate reviews looked at the app overnight, each from a different angle. An eleventh then checked every finding no test had already proved, to throw out false alarms. **The heart is sound:**
- no minutes were lost in three simulated weeks, across the clocks going back on 25 October;
- about 1,000 random taps never crashed it;
- double taps never paid twice;
- the story's wiring holds;
- no guilt language anywhere.

But the reviews found **5 urgent problems**, about **20 real bugs**, a long tail of small ones, and a clear set of improvements. **Of the 42 findings the checker looked at, 40 were real**, and none was a false alarm (2 it could not settle).

## The reviews

| Review | Angle | Report |
|---|---|---|
| The rules | minutes, Keys, the 04:00 day turn, the clock change, travel | [RULES.md](RULES.md) |
| The save and the phone | save, Restore, reminders, lock-screen panel, Siri | [PLATFORM.md](PLATFORM.md) |
| Hands-on | every screen, fast taps, long names, the keyboard | [HANDS-ON.md](HANDS-ON.md) |
| Three weeks as you | 5–26 October lived day by day, from a fresh save | [THREE-WEEKS.md](THREE-WEEKS.md) |
| The code | a line-by-line read of the screens | [CODE.md](CODE.md) |
| Words and accessibility | every sentence, VoiceOver, sizes, the game's own rules | [WORDS-A11Y.md](WORDS-A11Y.md) |
| Performance | battery, heat, speed as the save grows | [PERFORMANCE.md](PERFORMANCE.md) |
| The story's wiring | whether every piece connects (detail sealed) | [STORY-SPOILER-FREE.md](STORY-SPOILER-FREE.md) |
| Game design | what would make it a better game for you | [DESIGN.md](DESIGN.md) |
| Daily use | a real day counted in taps | [PRODUCTIVITY.md](PRODUCTIVITY.md) |
| The checker | each unproven finding re-tested | [VERIFIED.md](VERIFIED.md) |

One gap: this container only has Chrome's engine, not Safari's. So the hands-on and performance passes ran in Chrome. The automatic checks on every push do run Safari's engine.

---

## Part 1: bugs to fix (my proposal: fix all of these, one build)

### Urgent (things you'd feel, or that lose something)

- **U1. A screen closing can wipe what you just did.** Two screens save one last thing as they close: the delve, with your "where did you stop" note, and the Daybook's week page. That last save works from an out-of-date copy, so it can erase what the same tap just saved, in the phone's save too.
  - **Pinning a job in the Daybook's "Look ahead":** the pin and the re-plan are lost.
  - **"Plan it for me":** its answer is lost.
  - **"Not yet" with a note, then "Back to today":** this is why it leads back to the delve's end.
  - **Fix:** the game keeps one true copy of the save that a closing screen can't shrink. Medium effort; I'd test it hard.
- **U2. The night's 15-minute head start is paid again every time the app restarts**, once the morning finds have run out. The simulation reached that point in week 4. iPhones restart apps often, so the road jumps with no work done.
  - **Fix:** remember that the night was paid, not only that its find was given. Small.
- **U3. "Delve now" from the Satchel starts a delve with no end alert and no lock-screen panel.** Lock the phone and the delve ends in silence.
  - **Fix:** one line, so that every way of starting a delve sets them up.
- **U4. The app gets slower and warmer the longer you play.** The whole save is watched for changes, item by item, every second of a delve. Measured (in Chrome on a desktop, so the real phone will differ):

  | Save | Delve CPU (ms per second) | Adding a job |
  |---|---|---|
  | 4 weeks | 40 | – |
  | 6 months | 198 | – |
  | 1 year | 483 | 2 s |

  - **Fix:** a one-word change (`$state.raw`), checked as safe. With it, a year's save drops to 31 ms per second and the tap to 0.17 s.
  - Also: the automatic battery check only ever tests an empty save. It should test a played one.
- **U5. The word to cut comes back after every restart.** "Later" is only remembered until the app closes, so after days away the first thing you saw was the word, not the welcome back.
  - **Fix:** remember "Later" in the save. Small.

### Bugs

- **B1. "Use it here / Keep it" stays on a job's return after you used the Key.** A second tap spends a second Key. Fix: hide it once used.
- **B2. A recurring job's 3-minute first session swallows the day's real one.** Stop the gym after 3 minutes, then "Delve again" for 60: the record keeps 3 minutes. Four real gym hours that way gave no Key. Fix: the later delve joins that day's session.
- **B3. "Not done after all" on a ticked-off job keeps its minutes, and ticking it again pays them again.** Correcting a wrong "3 h" to "30 min" leaves 210 minutes. Fix: taking back a tick takes back its minutes.
- **B4. An "every N days" job done more often than every N days earns one Key, then never another.** Doing more earns less. Fix: one condition.
- **B5. A big tick that passes two places skips the side chamber between them for good.** Fix: check each chamber on the way.
- **B6. The Map labels a locked thing behind you "Ahead"**, while Today rightly says "Behind you". Fix: use Today's words.
- **B7. Monday mornings: the Daybook's arrow says "In the morning"**, and so does the Week's after "Plan it for me". Fix: the morning screen doesn't go on the trail.
- **B8. "Later" on the word leads straight back to it** through the Daybook's arrow. Fix: leaving the word clears its place from the trail.
- **B9. The ring and flame on a ticked job's return replay from zero** each time you come back to it. A delve's end already remembers this. Fix: the same memory for ticks.
- **B10. The delve set-up's "90 · one long delve" sits on top of "Towards the next place"** at 360–390 wide, when there's a note or a long name. A tap on the heading picks 90. Fix: layout.
- **B11. The job editor says "Each delve still starts at 30 minutes"**, which hasn't been true for recurring jobs since D-146. Fix: the words follow the job.
- **B12. "Again in 10 min" on a reminder almost never works unless the app is open.** iPhone handles that button without opening the app. Fix: handle it in the phone's own code. Medium; only matters if you use reminders.
- **B13. While a word waits to be cut, Today's road line shows no minutes**, though places are still reached. Fix: count from the last place reached.
- **B14. Restore accepts a damaged file**, writes it over the save, and then the app fails at every start. Unlikely, but serious. Fix: try the file before writing it, and give the error screen "Save a copy".
- **B15. A save from a newer build is quietly replaced by a fresh game.** This could bite if a TestFlight build is ever rolled back. Fix: never write over it; say so.
- **B16. A brief pause and resume can leave a stale "the delve is over" alert behind.** Fix: lay the alerts out one at a time, in order.
- **B17. The Week's "+" with a name you already have says nothing**, and silently moves the job. The Satchel's box explains. Fix: the same words.
- **B18. On the tick sheet, "On top of the 3 hours you delved"** is said about minutes that were ticked, not delved. Fix: "already counted".
- **B19. A later week says "There is no plan for next week yet"**, and its back arrow says "Next week". Fix: the words.
- **B20. The story's wiring (detail sealed):** the end-of-week glimpse can describe something as still shut after you opened it, and 13 story texts show stray asterisks. A few other pieces still run on calendar weeks, which since D-123 they shouldn't. Most fixes need no story decision; four small ones go to a sealed story session.

### Small things (I'd sweep them up in the same build)

The full lists are in the reports. In short:
- **Wording:**
  - one length written four ways ("1 h 30 min", "1 hour 30 minutes", "1½ h", "about 2½ h");
  - "1 a week";
  - "6 pm" in a 24-hour app;
  - "Return keeps it here";
  - a reminder that calls you back to the app, which Settings promises never happens;
  - about 34 unused leftover lines.
- **VoiceOver:**
  - the job menu doesn't take focus;
  - the ring reads "min 25 minutes";
  - 29 symbols share one name;
  - the road line is silent.
- **Sizes:** the Keys button is 28 points tall (44 is the norm); some text is 12–13 px; text can't be made larger with the phone's text-size setting.
- **The phone:**
  - no haptic on press-and-hold (it uses a web call iPhones ignore);
  - the phone's own banner shows on top of an open delve;
  - Siri's job waits while the app is on screen;
  - the daily backup is overwritten at each start, so it isn't really yesterday's.
- **Battery:** the Map's moving sparks never rest; the fog is drawn at three times the size it needs.

---

## Part 2: for you to decide (the code does what an earlier choice said, but it pulls against your rules)

1. **After days away, the missed gym and course sessions pile onto the day you come back:** about 4 hours on the finish line, under a welcome that says "One small task is enough". *My recommendation:* on the welcome-back day, missed sessions don't pile up, and the day's line is just what was planned for that day.
2. **A job typed a second ago and ticked off at "3 h" moves the road 3 hours** (rule 10, task farming). You chose no daily limit (D-134), and you're honest with yourself. *My recommendation:* leave it, but add 5 and 10 minutes to the tick sheet. Today the shortest choice is 15 minutes, so a 3-minute call has to be over-claimed.
3. **"Not today" pulls the next job up onto the finish line**, and a job added with "Add a job" can land under "If there's time". *My recommendation:* a job added today always joins the line, and "Not today" shortens the line rather than refilling it.
4. **"Every 2 weeks" is a fixed fortnight on the calendar**, not two weeks after you last did it, so the tank came due 4 days after it was cleaned. *My recommendation:* count from the last time.
5. **An appointment that went by while you were away vanishes from its day**, with no question (only one "went by" question is ever asked). *My recommendation:* ask about each one, in one list, on the welcome back.

## Part 3: improvements that aren't bugs

The design and daily-use reviewers each ranked a dozen. Here are the ones I agree with, in the order I'd do them. S = small, M = medium.

1. **Start the real test soon (S, a decision).** The game's central question has still not been measured: does wanting to go further make you start real things, especially the ones you put off? It needs a few steady weeks on a fresh save, with bug fixes only. Each new feature makes the result harder to read. *Proposal:* after this fix build, a feature freeze and a fresh save, and the test begins.
2. **Write the story ahead (M, ongoing, sealed).** The 14 written story weeks are about 170 hours of work, which at your pace is 6–8 weeks. That ends inside the test, and you've said you stop when the story ends. I'd start writing further on now, in sealed sessions.
3. **Show what an avoided job brings (S).** A job marked "I tend to put this off" already always brings a find, but nothing says so until after. A small hollow gold ◇ on its row and "a find waits" on its set-up would turn the hidden bonus into a pull, right where it's needed most.
4. **"Can't get started?" back on Today (S).** The "I can't start" screen is the best thing in the app, but it's only behind press-and-hold now. Add one quiet line at the foot of Today until the day's first start, and on the delve set-up.
5. **Last night's choice starts the morning (S).** If at Tonight you chose what to start with, the morning shows "You chose to start with X · Begin". It's your own choice, not a suggestion. It touches D-135, so it's your call.
6. **A 5-minute mark in the delve (S).** Under 5 minutes earns nothing, and you can't see that line. A small notch on the ring at 5 minutes, and once, quietly, "It counts now." It makes "just get to five" a visible goal.
7. **"Just this one today" (S).** On a low day, one item in a job's menu sets every other job aside, with one Undo. Today that takes three separate "Not today"s.
8. **Re-reading made felt (S–M).** When a symbol becomes known, old records already read differently, but silently. Add one line, "2 records you found now read differently · Read them", and a soft glow on those records.
9. **The week's close as a chapter, not a ledger (S).** Lead with the furthest place reached and its painting, then what you learned. Put the tallies on one line, and the "Look ahead" offer on one quiet line at the foot.
10. **A Map that connects (M).** A faint gold path between the places you've walked, and the next place as a dim outline with its minutes.
11. **Later, if the test shows the story pulling:**
    - a home-screen widget showing the world (the place, the road, "the next place · 25 min"), never a job;
    - records grouped by whose life they belong to;
    - words as powers that open old locks on the Map.

**Things I'd simplify:**
- "Errand run" off Today's main screen (keep it in the Satchel);
- Today's Key block down to one line;
- the Monday "Look ahead / What matters most?" offer down to one quiet link.

**Three questions the design reviewer asked for you** (no rush; they don't block the fixes):
- (a) Would a big button on Today that *starts* work feel better than one that *adds* a job?
- (b) Keys will outnumber the things they open, about 59 against 36 over 10 weeks. Would you rather Keys were rarer and each opened something bigger?
- (c) Are you happy for me to write the story ahead now, even if new features slow down?

---

## What I suggest for today

1. **Say go on Part 1** (the urgent ones, B1–B20 and the small things). I build them on this branch, add a test for each, and run every check. Then a fresh adversarial review of the fixes, then your OK to merge and one TestFlight send.
2. **Answer Part 2's five choices** when you have a minute: a word each is enough ("1 yes, 2 leave it…"). They can ride the same build.
3. **Pick from Part 3** whatever you like. My picks for the same build are 3, 4 and 6, which are small and aimed at starting. Then 1, the test.
