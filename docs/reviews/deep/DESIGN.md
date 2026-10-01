# Deep review: the game design (what would make it a better game for Dan)

> One of the round-5 reviews (branch `claude/review-round-5`). Not a bug hunt: the question is **what would make The Long Answer a better game for Dan**, judged against rule 14 (does wanting to go further in make Dan *start* real things, above all the ones he avoids?), the reward loop's feel, anticipation, pacing, the obvious next action (rule 16), the daily loop's friction, and weeks 3–8.
> Method: read CLAUDE.md, MASTER_BRIEF, PLAYER_MODEL, DECISIONS (D-089, D-117 to D-146 closely), CURRENT_STATE, the reviews (OVERVIEW, FLOW-REVIEW, flow/TWO-WEEKS), MVP, CONCEPT, CORE_LOOPS, PROGRESSION; then played the built app at 390 × 844 (a fresh start, a delve, a tick-off, "I can't start", the job menu; a mid-game save from `tests/flows/saves/keys.json`: Today with Keys, the Map, Records, the Daybook's week page).
> **Spoiler-free:** mechanics, structure and feel only. No place names, story lines or record contents.

## The verdict in one paragraph

The **tool** is now very good: starting takes two taps, nothing piles up, failure is never shamed, minutes are honest, and the "I can't start" screen is excellent (a line from just ahead, one small physical step, "Try ten minutes?"). The **game** is thinner than the tool. The last three weeks of work (D-117 to D-146) were nearly all about how jobs are entered, counted, moved and finished. Meanwhile the three things Dan's player model ranks highest are under-delivered on screen:
- **new abilities to use** (words are rare and are used once, at a story gate);
- **"everything was related"** (Records is a flat list, the Map is lights with no links between them, and nothing marks a re-read);
- **"a goal I can see"** (Today's "Ahead" is four lines of prose about where Dan stands, and nothing on an avoided job says what it will bring).

The core hypothesis is also **still untested**: the seven-week test (MVP → the central test) has not started, and the app changes every few days. Most of what follows aims the existing world at the moment of starting, and makes the payoffs Dan has already earned felt.

---

## Ranked improvements (value ÷ effort, best first)

### 1. Freeze features and start the seven-week test, on a fresh save
- **What:** a feature freeze (bug fixes only), a fresh save, the 10-minute baseline chat (MVP → "Before day 1"), and the test's notes switched on. New ideas, including the ones below, go on a list for after week 3.
- **Why:** rule 14 is the project's whole bet, and it has not been measured. Each new productivity feature (Waiting on, errand runs, remembered jobs, the planner learning) makes "it was the tools, not the world" more likely, which the MVP lists as evidence *against*. Dan has also been reading the opening story on test saves, so its first-time pull is being spent on testing. The player model says he stops when the story ends. Story heard twice is story half-spent.
- **On screen:** nothing new. A fresh start.
- **Effort:** S (a decision, a reset, a chat). **Risk:** Dan may feel the build is "not done". But a test on a moving build measures nothing.

### 2. Show what an avoided job will bring, on its row
- **What:** jobs marked "I tend to put this off" (`avoided`) already *always* bring a find (`core/game.ts`, P5). Nothing tells Dan this before he starts. Add a small glowing ◇ mark on the row, and the words "a find waits" in its set-up (and its VoiceOver label). After the job, show the find first on its return screen, above the story text, with its own small reveal.
- **Why:** this is the sharpest line of the test (avoided jobs started *from the app*). Dan: "Repetition is fine so long as it's for a goal that I can see", and "knowing roughly what's coming, with the details a surprise". Today the reward for the cat's medication is real but invisible, so it can't pull. That makes it a surprise bonus, not a lure.
- **On screen:** `◇ Order the cat's medication` with the mark in gold, the same weight as the "done" diamond but hollow. Nothing for jobs that aren't avoided. No counts, no red.
- **Effort:** S. **Risk:** low. Rule 10 holds, because the find is already given; this only tells Dan about it.

### 3. Put "I can't start" back where the couch moment happens
- **What:** a quiet text link at the foot of Today's list, "Can't get started?", visible until the day's first delve or tick. It opens the existing CantStart screen for the first undone job on the finish line, with the avoided job first if there is one. It stays in the job menu too.
- **Why:** the player model calls mood-independent starting "the single most valuable thing the product does". Since D-135 it lives only in a press-and-hold menu, behind a gesture whose hint disappears once used. In the couch moment, Dan won't go looking for it. Today shows "Errand run" (a rare tool) but not this.
- **On screen:** under "Press and hold a job for more.", in the same italic, one line. It goes once the day has begun.
- **Effort:** S. **Risk:** low. Dan asked for no *suggested job* on Today (D-135). This puts forward a door, not a job, but check with him.

### 4. Make re-reading felt: "N records now read differently"
- **What:** when a symbol becomes *known* (the place confirms a guess), the screen that confirms it adds one line: "2 records you found now read differently · Read them". In Records, each changed record gets a soft new-light glow until it is opened.
- **Why:** this is the "Holy shit, that was there the entire time" moment (MASTER_BRIEF §5) and CORE_LOOPS' "Re-read" decision. Records already re-render from held symbols, so the payoff exists, but silently. Dan would have to re-open old records by chance to notice. This is the mystery pleasure he plays for, and it is earned but not felt.
- **On screen:** one gold line under the confirmation; a faint glow beside a record's title in Records.
- **Effort:** S–M (diff each record's rendering before and after the symbol is held; no new content). **Risk:** low. Check with the sealed-story owner that no record "changes" in a way that tells more than the symbol does.

### 5. Watch the story's runway, and write ahead of Dan
- **What:** a standing, spoiler-free number for Claude: **hours of written story left ÷ Dan's real weekly minutes = weeks of runway**. Keep at least 4 weeks ahead. Start writing story weeks 15+ now, before the test needs them.
- **Why:** "Once I finish the story I stop basically." Since D-123 (Dan's choice, and a good one), pace follows minutes. The written 14 story weeks are about 67 places × 150 min ≈ 170 hours. At 3 h a day that is about 8 weeks; at a "like a job" 4 h of Course plus the gym, about 6 weeks. That is inside the test window. The rules review also found the morning-find pool running dry by week 4 in a simulated on-time bedtime run. The fallback, "the open road" (passages, camps, finds), is repetition **without a visible goal**: exactly what Dan calls grinding.
- **On screen:** nothing for Dan, unless he wants a line in Settings ("written well ahead").
- **Effort:** M ongoing (the writing is the cost; the gauge is S). **Risk:** high if ignored. It is the most likely cause of a week 5–8 drop.

### 6. A world widget, not a to-do widget
- **What:** a home and lock screen widget that shows **the world**: the current place's painting (small), the road line, and "the next place · 25 min" (or "a side chamber · 8 min"). No job names, no counts. A tap opens Today.
- **Why:** the competitor is the couch, the phone and YouTube (player model). The app never calls Dan back, which is right (no notifications, rule 9), so the world is out of sight exactly when the decision is made. The scope page (`product/scope/10`) designed "Next: <job>", an obligation staring from the home screen. This version shows curiosity instead: "25 minutes to somewhere new" is the hook the MVP's heart depends on. The Live Activity extension is already a WidgetBundle.
- **On screen:** a small square: painting, a thin gold line with the flame, one italic label.
- **Effort:** M (native: an App Group and a timeline written on each change). **Risk:** a widget can become wallpaper after two weeks. That is fine: it costs nothing, and Dan can remove it.

### 7. "Ahead" as one line of pull, not four lines of description
- **What:** Today's "Ahead" block currently shows a long paragraph (folded at four lines). On a fresh save it describes where Dan *stands*. Replace it with one short teaser sentence per stretch about the next thing (the sealed thing, the next place's silhouette), plus its distance: "Ahead · 1 h 15 min". "Read more" opens the full text.
- **Why:** rule 16 and "know roughly what's coming". The top of Today is prime space. A truncated paragraph mid-sentence reads as text to get through, not a hook. One concrete line is a goal to want.
- **On screen:** label `AHEAD · 1 h 15 min`, one italic line, nothing else.
- **Effort:** S–M (about one written line per stretch, in a sealed session). **Risk:** low.

### 8. The week close as a chapter, not a ledger
- **What:** reorder the Daybook's week page. Lead with the furthest place reached that week (its painting, large), then "Learned", then "Further on". Put the tallies on one compact line ("Gym 4 · Course 4 · Spanish 3 · …", one-offs as "and 7 other jobs"). Move the "Look ahead / Plan it for me / Not now" offer to a single quiet line at the foot.
- **Why:** the week close is the one weekly ritual, the natural place for the Stargate-dial feeling of "something big just happened". Today it opens on a long list of jobs and counts (a test save showed 14 rows before any story), then asks a planning question. Dan doesn't want to administer the system, and he sets his days himself (D-089, D-127).
- **On screen:** painting → two short story sections → one tally line → one quiet link.
- **Effort:** S. **Risk:** low.

### 9. A waymark at 5 minutes: "it counts now"
- **What:** in the delve, when the first 5 minutes pass (`RETURN_MIN`, the point where work earns a return), the ring gets a small lit notch and the line under the countdown changes once, quietly: "It counts now." The lock-screen panel shows the same notch.
- **Why:** Pomodoro worked for Dan because "only 25 minutes" bounded the commitment. The hardest minutes are the first ones. A visible first threshold says "just get to five". It is honest too: under 5 minutes really earns nothing (rule 10), and Dan currently can't see that line.
- **On screen:** one notch on the ring at 5 minutes, one word change. No sound, no pop-up.
- **Effort:** S. **Risk:** a distraction mid-work. Keep it silent and static.

### 10. A Map that shows connection and what's next
- **What:** draw the path between the lights (the road walked, in faint gold). Show the next place as a dim outlined light with its minutes. Put a small lock glyph on lights that hold something a Key opens, and a different one for a word-lock. Name a light when it is tapped.
- **Why:** "everything was related" and the Temple of Time linked to the temples are Dan's favourite structures. Today the Map is a few glowing dots with a box underneath: no route, no sense of what's ahead, no link between places. It should be the place he goes to *want* something.
- **On screen:** the same starfield, now joined by a thread, with one unlit outline ahead.
- **Effort:** M. **Risk:** low. Keep the forecast waypoints (D-054) from cluttering it.

### 11. Records grouped by whose hand
- **What:** Records lists finds newest first, titled by where they were found. Add a second view: by **whose life** each record belongs to (the data already has this). Unnamed hands get a glyph until the story names them. Where two records are about the same event, draw a thin line between them once the story has made that link.
- **Why:** linked lives across eras is Dan's stated favourite (Eternal Darkness: "they were all linked. That was my favourite part"). The flat list hides the structure the story was built on. Seeing a second hand appear, or two pages from different ages linked, is a reward Dan would feel without extra writing.
- **On screen:** Records · **By hand** · Symbols tabs; each hand a short column with its glyph.
- **Effort:** M. **Risk:** spoilers. The grouping and the links must be released by the story (a sealed-session check), never shown ahead of what Dan has learned.

### 12. Words as powers you take back through the world (later, after week 3 of the test)
- **What:** after a word is cut, two to four earlier, already-seen "word-locked" niches across the Map light up: "You can open these now." Dan goes back and opens them himself. This is Zelda's hookshot targets: a new ability that changes old places. It is separate from Keys (real life) and from the road.
- **Why:** "the most rewarding achievements give a new ability to use"; "capabilities beat numbers". Words come rarely (PROGRESSION: about one a month) and are used once, at the gate that teaches them. So the axis Dan values most is the one least felt between words. Backtracking with a new power is exactly OoT's and Metroid's pleasure, and it gives weeks 3–8 a reason to revisit the Map.
- **On screen:** after the cut, a Map moment: the lights holding word-locks glow; each opens to a short scene.
- **Effort:** L (sealed content: word-locked niches per word, their truths fixed first, rule 6). **Risk:** complexity (rule 12) and content cost. Do it only if the test shows the story pulling.

---

## Five things to remove or simplify

1. **"Errand run" off Today's main screen.** It is a rare tool in prime space on the opening screen (rule 16), sitting where "I can't start" should be (item 3). Keep it in the Satchel and the job menu.
2. **Today's Key cluster down to one line.** On a mid-game save the top of Today holds: the Key count, "Use one here", a "Behind you · Needs a Key" heading, a description, and "On the Map", all above the list. Make it one line: `5 Keys · Use one here` (or `· On the Map`). The detail belongs on the Map.
3. **The Monday "Look ahead → What matters most?" offer.** A weekly planning ritual Dan never asked for. He has said he sets his own days (D-089, D-127). Plan it for me stays in the Week. *Question for Dan:* have you used Look ahead once?
4. **"Waiting on…" folded into "Put on a day" with a note.** It brings a seventh item in the job menu, a fourth Satchel section, a date picker and a "Did they reply?" prompt, for a case "Put on a day: Thursday, note: the vet" already covers. *Question for Dan* (he asked for it, D-137): has it come up in real life yet?
5. **Tallies in the Daybook to one line** (see item 8). Counting every one-off by name ("once, once, once…") is accounting, not memory.

---

## Questions for Dan (decisions he made, asked, not relitigated)

- **The big button (D-135).** The largest thing on Today is "Add a job", an admin act, while starting is a tap on a smaller row. You chose no suggested job, and that stands. Would a big button that *starts* (a row tapped makes it the big one, say) feel better than a big button that *adds*?
- **Keys outnumbering locks (D-129, D-142).** Keeping up every recurring job earns about 59 Keys in 10 weeks against about 36 locked things. A test save already held 5. A Key you can't spend becomes a number, which you said doesn't move you. Would you rather Keys were rarer and each opened something bigger?
- **Every 150 minutes (D-123).** Right for pace, but at your hours the written story may run out within the test (item 5). Happy for Claude to write ahead now, even if it means fewer new features meanwhile?

---

## What already works, and should be protected

- **"I can't start"** (the screen itself): the best-designed moment in the app. Make it easier to reach; don't change it.
- **The delve set-up's road line**: seeing that two delves pass the side chamber is real anticipation at the moment of starting.
- **No pile-up, no shame**: absence, late nights, "Not today" and a missed lesson are all handled with the right words (TWO-WEEKS confirms this over 15 days).
- **Tick off with the time it took** (D-134): it keeps real life countable without a timer, and it stays honest.
- **Bedtime → morning find**: a small, real pleasure tied to something Dan controls.

## The risk curve, weeks 3–8

| Week | Likely feeling | Main risk | Covered by |
|---|---|---|---|
| 1–2 | Novelty, paintings, first places | Reading load after every job | 7, 8 |
| 3–4 | The first word; Keys pile up | Keys become a number; the Map has nothing to want | 10, 12, Keys question |
| 5–6 | Routine | Story runway; finds repeat; no new verbs | 5, 4, 11 |
| 7–8 | Decides whether he stays | The open road with no goal; the tool outlives the game | 5, 12 |
