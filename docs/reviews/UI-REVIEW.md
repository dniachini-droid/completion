# Whole-app UI review

> 2026-09-27, one of the three review windows before the overview (`CURRENT_STATE.md`). A review only: no app code was changed.
> **Spoiler-free.** Places and story items are named by screen only; no story text is quoted. The screenshots showed story text, so they were not committed; what they showed is described here instead.

## For Dan, in plain words

The app already looks and feels better than almost any habit or task app. The paintings, the purple-to-gold light, the dial, the delve ring and the Today screen's clear "one next thing" are genuinely world-class, and nothing in it shames you. Where it falls short is **how the pieces fit together**. The last few weeks of changes (everything a delve, the Satchel back, delete everywhere, no day size) each made sense on their own. Together, they left **three lists of the same jobs** (Choose a delve, the Satchel, and "Other jobs" under What repeats), **four boxes for adding a job**, **a job editor you can only find through the Week**, and **Settings hidden inside the Daybook**. There are also a few leftovers of things you removed. The Daybook still labels a piece of the story **"Next week"**, which goes against your one-continuous-story decision (D-123). A delve's end still says **"Enough"**, which went with D-121. My main advice is to **merge Choose a delve into the Satchel**, so there is one place for every job that isn't on today. After that, make **one editor reachable from any job**, **move Settings out of the Daybook**, and **clear the leftovers**. None of this touches the look. Most of it is a few days' work. The one real restructure (merging the lists) is about a week.

---

## How this was reviewed

- Read `CLAUDE.md`, `MASTER_BRIEF.md`, `CURRENT_STATE.md`, `design/UX_PRINCIPLES.md`, `design/ART_DIRECTION.md` and D-117 to D-127, plus every screen's code in `app/src/ui/` and the app's own words in `content/copy/en.ts`. Nothing under `narrative/sealed/` or `content/sealed/` was opened.
- Built the app and drove it in Chromium on a fake clock at **390 × 844** and **360 × 780**, by day, in the evening and at night:
  - the existing screen walk (`heart-walk.mjs`): 82 screens at 360, with no page errors. At 390 the walk stopped on a morning screen it didn't expect; that is the walk's fault, not the app's;
  - a second walk written for this review, covering the Satchel with a list, Choose by day and at night, pause, "Is it done?", "Not yet", a row's swipe, the Week's sheet and "Another day…", the empty Daybook, Settings, the trial's controls, the evening and the night;
  - on every screen, an automatic check for text under 13 px, tap targets under 44 px and words running past the side margins.
- Judged against Apple's Human Interface Guidelines and against Things 3, Structured, Streaks, Apple Fitness, Finch and Habitica. It was also judged against the project's own rules: 9 (no guilt), 11 (no admin), 12 (earn complexity), 16 (the next action obvious on opening), and `UX_PRINCIPLES.md` 1–19.

---

## Dan's seven questions, answered

### 1. Is it a world-class UI?

**Where it is.**
- **The world.** Full-bleed paintings, never framed; the violet day turns to gold at the arrival and in the evening. The satchel artwork, the delve tunnel and the stair are beautiful. Every screen has something alive. Among the apps named, only Finch has this much atmosphere, and this is more grown-up.
- **Today's hierarchy**, most of the day: day and place, a short "Ahead", then NEXT, the job, one glowing **Delve**, two quiet links and the rest as plain rows. It passes the two-second test at arm's length. This is what Things 3's Today and Apple Fitness's rings do well: one thing matters, and the rest waits.
- **The run set-up.** The dial with its magnetic stops and haptic ticks, the one long 90 under it, and a route line where time is distance, with "here", the side chamber and the next place drawn on it. There's nothing like it in Structured or Streaks. It is the app's signature control.
- **The delve and its lock-screen panel.** The ring, the paused state that says your minutes are safe, and the panel turning red when paused.
- **The tone.** "It will keep." "Nothing is lost." "The road has waited for you." No counts of undone things, no red, and no confirmation dialogs (Undo instead). Rule 9 holds everywhere I looked.

**Where it is not.**
- **The structure grew by accretion.** Each decision from D-107 to D-127 added a list, a box or a link where it was needed at the time. Nobody has since stepped back to fold them into one model (question 5).
- **Every control is the same italic underlined link.** "I can't start", "Not today", "It's done", "List", "Put on a day", "Delete", "Change the job", "Not this week", "Another day…", "Look", "See where you are", "Earlier", "Settings" and the four foot items all look alike. So a destructive Delete looks like "List". A row in the Satchel carries three of them, and a sheet in the Week carries five. Well-regarded iOS apps use a few distinct shapes for this: swipe actions, a "…" menu, a context menu on a long press, and a toolbar.
- **The same action looks different on different screens.** Delete is a swipe on Today, a link at the end of every line in Choose a delve, a link under each row in the Satchel, a link in the Week's sheet, and a text button at the foot of the editor.
- **Layout bugs a world-class app wouldn't ship** (listed under "Screen by screen"). The main one: the story's words at a delve's end, on an arrival and on a job's return run to **6 px from the phone's edges**, outside the 18 px column everything else keeps.
- **Fixed-size text.** Every size is set in pixels, so the iPhone's Larger Text setting has no effect. Apple's guidelines expect Dynamic Type; Things, Streaks and Fitness all honour it.

### 2. Is it easy to navigate, by best practice?

**Mostly yes, by day. Less so at the edges.**

- **Hub and spoke from Today, with a "back" that names where it goes.** This is right for a game whose home is one place (Finch and Streaks do the same). The trail of backs (D-088), the swipe from the left edge and the gold "day turned" colour all work.
- **Today's foot works as a tab bar, but is styled as four italic links.** It mixes one action (+ Add) with three places (Satchel, Week, Daybook). Apple's guidelines keep tab bars for places and put actions elsewhere (Things' floating "+", Structured's "+"). The items are 14 px italic, spread with `space-around`, with no icon and no "you are here". That's fine while Today is the only place you return to, but it reads as a footer, not as navigation.
- **Some screens are reached only through another screen:**
  - Settings is reached only from the Daybook.
  - The job editor is reached from What repeats, or from the Week's sheet ("Change the job").
  - What repeats is reached only from the Week.
  - The Symbols are reached only as a tab inside Records.
  - Records is reached only from Today's top bar, once a record exists, and from the welcome back.
- **Double exits:**
  - The morning screen has a back arrow and "On to today".
  - A record has a back arrow and "Done reading".
  - The stair screen has a back arrow and a "Today" button.
  - The delve's end has a back arrow and "Back to today".

  These are harmless, but each is a second word for the same thing.
- **The arrow's label is sometimes generic.** It says "Back" on the run set-up when opened from Choose a delve, and "Back" on the Daybook when it opened by itself on a new week. "Choose a delve" and "Today" would say where it goes.

### 3. Could it be simplified or organised better? What belongs in Today's foot?

Yes. The model underneath is simple: **today · jobs without a day · the week · the story's record**. The screens should follow that model one-to-one. The proposed map is in the "Navigation map" section below. In short:

| Today's foot | Now | Proposed |
|---|---|---|
| + Add | adds to today only | **stays**, one capture for everything: today by default, one tap for "No day" (the Satchel) or a day |
| Satchel | undated one-offs | **stays**, and becomes the one list of every job not on today: No day yet, then Repeating. "Something else…" and "Keep going" open it. Choose a delve goes. |
| Week | the plan, What repeats, next weeks | **stays**: the plan. "What repeats" goes into the Satchel's Repeating section; Settings joins its links (or a gear on Today's top bar). |
| Daybook | week pages, Look ahead, Settings | **stays**: the week's page and the Look ahead only. Its foot link is hidden until the first page exists. |

The top bar keeps **Map** and **Records**. If Settings doesn't go to the Week, a small gear here is Apple's usual home for it.

### 4. Are things hidden that would be easier shown another way?

- **"Something else…" as the only daytime way into Choose a delve.** This is the right place, but it's styled as the last row of today's list, in italic grey. It reads as a row, not as a way in. If Choose merges into the Satchel (recommendation 1), this row becomes the natural way into the Satchel. The foot's Satchel link then goes to the same place, so nothing is hidden.
- **The job editor behind What repeats.** This is the biggest hidden thing. From the Satchel, a tap delves, and none of List, Put on a day or Delete lets you rename or date the job. From Today, a tap delves and the swipe offers Not today and Delete. From Choose, a tap delves. So renaming a Satchel job, giving it a date, or marking it "I tend to put this off" means going Week → What repeats → Other jobs → the job. **Proposal:** a long press on any job, anywhere, opens the same menu (Delve · Edit · Put on a day · Delete). That is the iPhone's standard context menu. Also add one quiet "Change the job" link on the run set-up screen, which every job passes through.
- **Settings inside the Daybook.** The Daybook is the story's record of a week. Settings is plumbing: reminders, calendar, backup and the trial. It sits at 12 px in the Daybook's top corner. In week one the Daybook is an empty page, so Settings is reached through a blank screen. **Proposal:** move it to the Week's links ("What repeats · Settings") or to a gear on Today's top bar. Also let Settings change the bedtime. Today, bedtime can only be changed on Today from 18:00, and Settings shows it as read-only text.
- **Go to sleep on a day not finished.** From 18:00 the "Tonight" block sits under the day's list. With four or five jobs left it is below the fold, so at 21:30 Today's next action is still "Delve". Once the time is within about an hour of bedtime, Tonight should come above the list.
- **The job's list (D-126)** can only be written in the Satchel. When a job with a list is on Today, you can see the list in the delve but not add to it until the job is back in the Satchel.

### 5. Is there redundancy?

Yes. It is the main issue.

- **Three lists of the same undated jobs.**
  - **Choose a delve → "Your other jobs"** shows every unfinished job: the Satchel's jobs *and* the repeating ones.
  - **The Satchel** shows the undated one-offs.
  - **What repeats → "Other jobs"** shows the one-offs again, with their dates.

  In the walk, "Renew passport" and "Fix the shelf" showed in all three.
- **A job can be in the Satchel and on Today at once.** After a delve on a Satchel job, "Not yet" puts it on Today with "It's done" while it stays in the Satchel. That is two places for one job, with two ways to finish it.
- **Four boxes to add a job, with four verbs:** "+ Add" → "Put it in" (today); the Satchel → "Put in" (no day); the Week's + → "Add" (that day); Choose → "Name it" → "Delve on it" (today, and starts). Also "Add one" in What repeats, and Siri. The contextual ones (the Week's +, the Satchel's box) are fine. Today's + Add and Choose's box overlap.
- **Several "done" paths:**
  - a repeating job's delve ending (done by itself, D-121);
  - "Is it done?" → Done at a one-off's end;
  - "It's done" as Today's next job;
  - "It's done" on a row.

  The first two are the delve's own end; the two "It's done" links are the same action in two spots, which is acceptable. **Not redundant, but hard to follow:** "Done" on the delve's end, the "Done" label on the step screen, and "Done" in the Satchel's List (it closes the list box) are three different meanings of one word. Rename the list's button to "Close" or "Keep".
- **Several ways to put a job on a day:**
  - + Add (today);
  - the Week's + (a day);
  - the Week's sheet: Move to, and Another day…;
  - the Satchel's "Put on a day";
  - Choose's new name (today);
  - the welcome back's "Put it on today";
  - the Week's "Back on today";
  - Plan my week / Lay out the rest of the week;
  - the Look ahead's "What matters most?".

  Most are contextual and fine. Two things are genuine duplicates:
  - **Two different calendars.** The Week's "Another day…" is its own grid: four weeks, starting the week after. The Satchel uses `DayPick`: five weeks from this Monday, with "today" marked. Use one, and include the rest of this week.
  - **Two words for one thing.** "Not this week" and "Not today" both send a job away, and nothing says the job goes to the Satchel.
- **Repeated delve instructions.** The delve says "Lock the phone and put it away…" (four lines) on every delve, every day. Show it on the first few delves, then keep only a small "?".

### 6. Leftovers of removed features, or calendar-week timing in the story?

**Calendar-week timing in the story (against D-123):**
1. **The Daybook's "NEXT WEEK" heading** above the story's glimpse (`daybook.next`). It tells Dan the story is paced by weeks. **Fix:** "Further on", or "Ahead".
2. **The Daybook's page titles "Week one", "Week two"…** mix the real week's record (what you did, where you went) with the story's recap under a story-week number. **Fix:** title the page with the dates ("28 September – 4 October"), as the Week does.
3. **"So far"**, the monthly recap, is written on the pages of story weeks 1, 5, 9 and 13 (per `core/game.ts`). The glimpse, too, is picked by story week. Dan never sees the number, but a recap that turns up "every four weeks" is story timing by the calendar. Ideally it would follow places reached, not weeks passed. That is a small rules change and needs its own decision.
4. **Keys are 5 a calendar week, and sealed doors open with Keys (D-123 point 3).** So a sealed door can still make the story wait for next week. That is by design, but it is the one place where Dan could still *feel* a weekly limit. It is worth saying so in the game, where a door is shut: "It opens as you keep up your repeating jobs", not a date.

**Leftovers of removed features:**
1. **"ENOUGH"** as the label on a repeating job's delve end (`delve.enoughLabel`), and its line "It is enough, and more would be a gift, not a debt." D-121 removed the "enough" moment. The label still shows on every gym or Course session ("ENOUGH · Your Course is done for the day: 50 minutes").
2. **"a delve"** on the right of every row on Today. Before D-117 it told delves apart from jobs without a timer. Now every row says it, so it says nothing. **Fix:** the job's length ("50 min"), its time, or nothing.
3. **"Any job can be a delve."**, the subtitle of Choose a delve. It is true of everything now (D-117).
4. **The trial's controls** still say "The first playable, being built" and "The paintings are stand-ins until each place is painted". Every place has been painted since D-101.
5. **The deep-push offer** ("It is a great day. Will you push deeper?", "Push deeper") is still in Today's code and copy. It can no longer appear, because nothing sets a High day now (D-127). It is harmless, but it should go with its words.
6. **Unused words** in `en.ts`: `today.teaser.away` (jobs away from the phone, D-117), `today.swap`, `row.about`, `step.*` comments "for a job done away from the phone", `today.underWay` (now reused for a running delve, which is fine).
7. **"Each time"** in the job editor. After D-124 a job's minutes only tell the Week how full a day is; each delve opens at 30 regardless. "Each time" suggests it sets the delve. **Fix:** "About how long", with a note: "for planning the week".
8. **"What repeats" as the editor's back label and heading** when the job is a one-off ("Once"). The editor is now every job's editor (D-112).
9. **Code comments** that describe removed behaviour: Welcome's "The day is suggested Low"; Week's "no tray of unplaced jobs" (the Satchel is now that tray); the run set-up's "after Begin on a longer job".

### 7. The day size is gone and deep moments come from doing more. Is anything left confusing?

Yes, one thing, and it matters for rule 16.

- **"The day's work is done, and it was enough"** still comes at a hidden count. On a week you haven't planned, a day is "enough" after **3 jobs** (`DAY_SIZE.normal`). It is **2** if you first open the app after 14:00, and **1** after 19:00. On a planned week, it is what the plan put on the day. Dan can no longer see or set any of this (D-127: "I'll set my days"). In the walk, day one was declared done with the Spanish lesson still on the list for 18:00. It said so ("Still to come: Spanish lesson at 18:00"), but "the day's work is done" and "a job still to come" on one screen contradict each other.
- **Pushing deeper is now invisible.** Past "a normal day's jobs", the deep story moment plays by itself, once a day. That's lovely as a surprise, but Dan has no way to know that doing more is what brings the deep moments. That is exactly what D-127 wants him to feel.
- **Proposal (needs Dan's decision, since it touches the game's rules):**
  - Make "enough" mean **today's list as Dan left it**: every job on Today is done, or the plan's count on a planned week. Drop the hidden 3 and the afternoon discounts.
  - After the day turns gold, one quiet line under "Keep going": *"Anything more takes you deeper."*
  - Neither is a count or a bar (rule 6), and both make the promise visible.

---

## Top 5 recommendations

| # | What | Why | Size |
|---|---|---|---|
| **1** | **Merge Choose a delve into the Satchel.** The Satchel becomes the one list of every job not on today: **No day yet** (newest first, as now), then **Repeating** (What repeats' list, moved here). "Something else…" and "Keep going" open it. Its box adds a job with no day, and a "Delve on it" choice replaces Choose's box. A job put on Today (by a delve, "Put on a day" or + Add) leaves the Satchel. Delete becomes a swipe, as on Today, not a link on every line. | Removes three lists of the same jobs, one screen and one add box (questions 4 and 5). "Where are my jobs?" gets one answer. Rule 12: nothing lost, less to learn. | **Restructure**, about a week: Choose.svelte goes; Satchel gains a section and a swipe; What repeats keeps only its editor; the flows `satchel.mjs`, `delve-loop.mjs` and `heart-walk.mjs` change. A decision for Dan (it touches D-077 and D-126). |
| **2** | **One job menu, from any job.** A long press on a job anywhere (Today, Satchel, Week) opens: Delve · Edit · Put on a day · Delete. Edit opens the one editor, titled with the job's name, not "Change it". Add a quiet "Change the job" on the run set-up screen. Slim the editor for a one-off: What, About how long, By a date, and "More…" for the rest. | The editor is currently reachable only through the Week. Destructive and harmless actions currently look identical. This follows Apple's guidelines (context menus, swipe actions) and Things 3 (a tap opens, a long press shows the menu). | **Medium**, 2–3 days. The menu is one shared component. The editor's layout changes, not its rules. |
| **3** | **Take Settings out of the Daybook.** Put it with the Week's links ("What repeats · Settings") or as a gear on Today's top bar, and add the bedtime to it (editable). The Daybook becomes only the week's page and the Look ahead. Hide the Daybook's foot link until its first page exists, or give week one a page that says what's coming. | Settings is plumbing, not story. A foot link to an empty page is a dead end (UX 12). Bedtime can currently be changed only in the evening. | **Small**, half a day. |
| **4** | **Clear the leftovers and the calendar-week story timing.** Rename "Next week" → "Further on". Title Daybook pages by dates. Remove the "ENOUGH" label and its line. Replace "a delve" on rows with the length or nothing. Remove Choose's subtitle, the stale trial copy, the dead deep-push offer and the unused words. Change "Each time" → "About how long". Use one calendar picker everywhere. | D-121, D-123 and D-127 are in force, but the screens still say otherwise in places (question 6). Each leftover is a small lie about how the game works. | **Small polish**, a day. Only the "So far by story week" change (question 6, item 3) is a rules change; leave it for its own decision. |
| **5** | **Fix the layout bugs and make the day's finish line legible.** Bugs: story text at 6 px from the edges; the map's label cut off at the left; 12 px controls; Tonight hidden below the list in the evening; the scrolled list sliding under "Ahead"; "Plan it for me" touching its box's edges at 360. Legibility: "enough" = today's list (or the plan), plus the "Anything more takes you deeper" line (question 7). | The bugs are the difference between beautiful and world-class. The finish line is rule 16 at the end of the day: "what now?" should have an obvious answer. | Bugs: **small polish**, 1–2 days. The finish line: **small rules change**, a decision for Dan. |

Also worth doing, but not top five: honour Dynamic Type (text sizes in `rem` scaled from the phone's setting), a medium change touching every screen's CSS. Also a first-time hint for the long press, once.

---

## Navigation map

### Before (as built, 2026-09-27)

```
Opening screens (once each, then Today): Delve end · Arrival (→ word-cutting → stair) · Morning · Welcome back · Daybook page

TODAY ─ top: day · Map · Records (⇄ Symbols tab) · [Rehearsal badge → Trial]
│  Ahead (tap: unfold)
│  NEXT job → Delve → RUN SET-UP (dial, route) → Begin → DELVE (Pause · Finish here)
│      │                                               └→ breather → … → DELVE END ("Is it done?" · Enough · return · find · guess)
│      │                                                     → Back to today | See where you are → ARRIVAL (→ Keep going → CHOOSE)
│      ├ I can't start → JUST AHEAD → Try ten minutes? (starts a 10-min delve) | Not now
│      ├ It's done (a delved one-off) → STEP (return) → Today | Arrival
│      └ Not today
│  rows: tap → RUN SET-UP · swipe → Not today · Delete · "It's done"
│  + Something else… → CHOOSE A DELVE (today's list · your other jobs · name something new) [Delete on every line]
│  (day done) Keep going → CHOOSE A DELVE · See where you are → ARRIVAL
│  (evening) Tonight: Bed by [time] · Go to sleep   (below the list if the day isn't done)
│  (night) Goodnight + the list
└─ foot: + Add (inline box → today)
         Satchel → SATCHEL (box · List · Put on a day [calendar A] · Delete; tap → RUN SET-UP)
         Week → WEEK (Plan my week · days · + per day · job sheet: Move to · Another day… [calendar B] · time · remind ·
                     Not this week · Change the job → EDITOR · Delete) · Map
                     links: What repeats → WHAT REPEATS (repeats · Other jobs · Add one) → EDITOR
                            Next week / The week after · Lay out the rest of the week
         Daybook → DAYBOOK (Week N page · Next week glimpse · Look ahead → Still wanted? → Coming up → What matters most? → WEEK)
                   top: Settings → SETTINGS (reminders · nudge · calendar · save/restore) → Trial's controls → TRIAL
```

### After (proposed)

```
Opening screens: unchanged.

TODAY ─ top: day · Map · Records (⇄ Symbols) · [⚙ Settings, if not in the Week]
│  Ahead · NEXT job · Delve · I can't start · Not today       (unchanged)
│  rows: tap → RUN SET-UP · swipe → Not today · Delete · long press → JOB MENU
│  + Something else… → SATCHEL
│  (day done: every job on today's list, or the plan's count) "Anything more takes you deeper." · Keep going → SATCHEL
│  (from ~1 h before bedtime) Tonight above the list
└─ foot: + Add → one capture sheet: [Today | No day | A day…] (Today by default)
         Satchel → SATCHEL: add box (Put in · Delve on it)
                            NO DAY YET (newest first; list preview)  ─┐ tap → RUN SET-UP
                            REPEATING (was What repeats)              ─┘ swipe → Put on a day · Delete; long press → JOB MENU
         Week → WEEK: days · + per day · job sheet (Move to · one calendar · time · remind · Not this week → Satchel · Edit · Delete)
                links: Plan / Lay out the rest · Next week · Settings
         Daybook → DAYBOOK: page titled by dates · "Further on" · Look ahead   (hidden until the first page)

JOB MENU (any job, anywhere): Delve · Edit → EDITOR (named for the job; one-off: short form + "More…") · Put on a day · Delete
RUN SET-UP: + a quiet "Change the job"
SETTINGS: + Bedtime (editable)
```

Screens removed: **Choose a delve** (into the Satchel) and **What repeats** as a separate list (into the Satchel). Screens added: none; the job menu is a small sheet.

---

## Screen by screen, by severity

**High** means it breaks a project rule or is a visible bug a first-time user hits. **Medium** means friction or inconsistency. **Low** means polish. Each item is marked *(polish)* or *(restructure)*.

### Today
- **High, polish:** In the evening of a day not finished, the "Tonight" block (bedtime, Go to sleep) sits below the list. At 390 × 844 with four jobs left it starts at the bottom of the screen and needs a scroll; the next action shown is still "Delve". Bring Tonight above the list from about an hour before bedtime.
- **Medium, polish:** The lower list scrolls under the "Ahead" paragraph with only a thin fade. In the evening and at night the rows, or the night's line, visibly slide into the Ahead text (both sizes). "Ahead" takes up to four lines, about a third of the screen. Once the day is under way, fold it to two lines, or give the scroll area a clear top edge.
- **Medium, polish:** "a delve" on every row (question 6).
- **Medium, rules:** The day completes at a hidden count, and "done" shows beside "still to come" (question 7).
- **Medium, polish:** The next job's teaser, "The passage runs on from where you last set down your lamp.", is the same line on every job, every day. Either vary it from the story or drop it. At 390 it also sits in the brightest part of the glow, in italic grey, with weak contrast.
- **Low, polish:** A row slid open shows "Not today" and "Delete" at 96 px each, which pushes the job's name off the left edge. You can't see which job you're deleting (both sizes). Make each action 80 px, or keep the name visible.
- **Low, polish:** The foot mixes an action (+ Add, in violet) with three places (grey). Consider a small icon over each, or give + Add its own place (a round "+" at the right of the foot), as in Things and Structured.
- **Low, polish:** At night, after Go to sleep, the whole list stays, with Delve rows and "Something else…". "Put the phone down now" is undercut by a full list. Consider folding the list at night.

### The run set-up
- **Medium, polish:** The arrow says "Back" when opened from Choose a delve. Say the screen's name.
- **Low, polish:** "90 · one long delve" is a plain text line under the dial. It is a button, but it doesn't look like one.
- **Low, polish:** The label "DELVES" above the job's name reads like a count. "Delve on" or nothing would do.
- **Works well:** the dial, the stops, the route line, the side chamber staying put (the walk measured 0.506 of the way at four different settings), and "finishing around 09:30".

### The delve
- **Medium, polish:** The headline is the place you're *in* ("FURTHER IN" + the current place's name). Direction D asked for the destination as the headline ("Towards …"). The set-up says "Towards the next place", and the delve says where you already are.
- **Medium, polish:** The four-line "Lock the phone and put it away…" on every delve (question 5).
- **Low, polish:** A job's list lines strike off when tapped, but nothing says so: there's no box or tick. Add a small circle on the left, like Reminders.
- **Works well:** Pause and Finish here equal and quiet, the paused screen's "Your minutes are safe", "Paused while you were away", and the breather.

### The delve's end, a job's return (step), the arrival
- **High, polish (a bug):** The story's words run to **6 px from the phone's edges** (measured at 390: 6..384). The cause is a CSS clash: `.col .scroll` pulls the scroll box 18 px into each side and pads it back, and `Words.svelte`'s `.plain .scroll { padding: 0 }` removes the padding. So every return, find and arrival text sits outside the column, and the edge fade cuts the first and last letters. One line fixes it; it's in `Words.svelte`.
- **Medium, polish:** Long story passages are centred across the full width. Centred text over six lines is hard to read; the arrival and Today set their text left. Keep centring for one or two lines only.
- **Medium, polish:** "ENOUGH" label and line (question 6).
- **Low, polish:** The heading "It is done, and the day goes on." wraps with "on." alone at 360. Balance the heading's lines (`text-wrap: balance`).
- **Low, polish:** The arrival's "Look" link sits alone at the right under the words, 15 px italic. It is easy to miss; the painting-tap that does the same is invisible.

### Choose a delve ("Something else…" / "Keep going")
- **High, restructure:** A duplicate of the Satchel and of What repeats → Other jobs (recommendation 1).
- **Medium, polish:** A "Delete" link at the end of **every** line: nine to eleven in one view. A destructive action styled like the content, repeated down the screen. Use a swipe, as on Today.
- **Low, polish:** Repeating and one-off jobs are mixed under "Your other jobs" with nothing telling them apart.

### The Satchel
- **Medium, restructure:** A job delved on and answered "Not yet" is on Today (with "It's done") *and* still in the Satchel.
- **Medium, polish:** Three text actions under every job (List · Put on a day · Delete) double each row's height. With ten jobs this becomes a long scroll of links. A swipe for Put on a day / Delete, and a tap on the list preview to edit it, would halve it.
- **Medium, polish:** The artwork takes about 30 % of the screen above the list and box, so the third job is near the fold at 390. Let it shrink as the list scrolls (a collapsing header, as Apple Music does), or cap it at about 20 %.
- **Low, polish:** "Done" closes the list box. It's a third meaning of "Done" (question 5). Use "Close".
- **Low, polish:** "List" is a 39 × 40 target (under 44).

### The Week, a job's sheet, "Another day…"
- **Medium, polish:** The sheet holds nine controls: seven days, Another day…, the time, four reminder choices, Not this week, Change the job and Delete. It works, but it's the densest screen in the app. With recommendation 2, "Change the job" and "Delete" go into the job menu.
- **Medium, polish:** "Another day…" is a different calendar from the Satchel's (question 5). It starts at next week, so there is no way to jump to a day this week other than the day buttons above it. That's fine, but not obvious.
- **Low, polish:** A day's header is 36 px tall and its "+" is 44 × 30, both under 44.
- **Low, polish:** A "Map" link at the top right of the Week, with no clear reason to be there. The forecast line above already talks about places; tapping *it* could open the map.
- **Works well:** folding past days, "about 2 h", the forecast in the world's words, "Lay out the rest of the week", events from the phone's calendar.

### What repeats and the job editor
- **High, restructure:** The editor can only be reached through What repeats or the Week (recommendation 2).
- **Medium, polish:** "How often" has seven choices in two rows, at **12 px**, under the 13 px floor (UX 3). "FORTNIGHTLY" and "EVERY FEW DAYS" are squeezed. Use a single "Once ▾ / Repeats ▾" choice that reveals the rest.
- **Medium, polish:** A one-off's editor is a long form (What, How often, Each time, By a date, I tend to put this off, First small step, A note). Save sits below the fold at 360 and 390. For a jotted job that is administration (rule 11). Show What, About how long, By a date and Save; put the rest under "More…".
- **Medium, polish:** Its title is "Change it" and the back arrow says "What repeats", even for a one-off. Title it with the job's name.
- **Low, polish:** "Each time" (question 6). The "A changed number counts from next week" note is correct (it's about rhythms, not story), but only needed when the number changed.

### The Daybook and its Look ahead
- **High, polish:** "NEXT WEEK" over the story's glimpse, and "Week one / two / three" titles (question 6).
- **Medium, polish:** Empty for the whole first week ("The pages are still blank…"), yet on Today's foot from day one. Settings is reached through it.
- **Medium, polish:** On a page with no "Learned" heading, a story line sits straight under "Written for you as the week drew to its close." with no label, so it reads as part of that sentence (seen on week two).
- **Low, polish:** "PLAN IT FOR ME" fills its box edge to edge at 360.
- **Works well:** the week held (job · once / twice / 3 times), with no totals, no charts and no comparisons. The Look ahead is short and skippable, and nothing is earned from it.

### Settings and the trial's controls
- **Medium, polish:** Reached only from the Daybook; its link is 12 px (recommendation 3).
- **Medium, polish:** Bedtime is shown ("Bedtime, 23:00") but can't be changed here.
- **Low, polish:** The reminder choices (Off · At the time · 15 min before · 1 h before) are 12 px and wrap onto two lines. The same component appears in the Week's sheet.
- **Low, polish:** The trial's stale words (question 6). "Start this save again" has the same weight as "Start a rehearsal"; it asks twice, which is good, but it should look destructive at the first tap.

### The Map
- **Medium, polish (a bug):** The label under the "you are here" node runs off the left edge at both sizes. It read "…ere · Thursday · forecast", with its start cut off.
- **Low, polish:** The "here" node also carries the forecast ("Thursday · forecast"). It reads as if *here* is forecast for Thursday. Put the forecast on the "somewhere ahead" node, or only in the card.
- **Works well:** the glowing nodes, the crosshair, the card that comes up, the region title and the dotted walk.

### Records and Symbols
- **Low, polish:** Three names for one screen: the tab "RECORDS", the label "RECORDS" and the title "What you've found". Likewise "SYMBOLS" and "What you can read". Keep the tab and the title.
- **Low, polish:** A record has "Done reading" and a back arrow, both going back.
- **Works well:** the record's strip stays still whatever you tap (Dan's rule 17). The Symbols grid is gorgeous, and the guesses are in italic with "?".

### The arrival screens, the morning, the welcome back, "I can't start", the stair
- **Low, polish:** Several of these carry both a back arrow and a big button to the same place (question 2). On a moment screen, drop the arrow and keep the button.
- **Low, polish:** The welcome back has no arrow, but has a "Map" link in the top corner. Welcome is a moment; the map can wait until Today.
- **Works well:** the welcome back's tone ("the road has waited for you"), the one "what slipped" question with no list, "I can't start" asking for the first thing you'd touch and offering ten minutes, the morning's head start, and the stair.

### Across the app
- **Medium, polish:** Text sizes are fixed in pixels, so Larger Text has no effect (question 1).
- **Medium, polish:** One style (italic, underlined, 14–16 px) for every secondary control, including destructive ones (question 1). Give Delete its own treatment: the swipe on lists, and a separate line at the end of sheets.
- **Low, polish:** The arrow's label is sometimes "Back" (question 2).

---

## What already works well (keep it)

- **Rule 16 holds by day.** On opening there is one glowing button with the job's name above it. Things 3's Today, Apple Fitness and Streaks all aim for this; this app gets it, with a world behind it.
- **Rule 9 holds everywhere.** No counts of undone things, no red, no streaks, no "you missed". Undo instead of confirmation. "It will keep." "Nothing is lost." The welcome back asks one question and never lists what slipped.
- **Rule 11 mostly holds.** Adding a job asks nothing (Satchel, + Add). The planner lays out the week. Reminders are opt-in and one per thing. The editor is the exception (above).
- **The art direction is carried through**: the violet day, gold at the arrival and in the evening, carved capitals for the place, plain print for your own life (direction D). Nothing is framed except the record's tablet and the Map's card, which are content, not the world.
- **The dial and route line, the delve ring, the pause, the lock-screen panel.** These are the app's signature. No productivity app has anything like them.
- **The Week**: folding, "about 2 h", the forecast in the world's words, the phone's calendar alongside.
- **Records and Symbols**: a still strip, guesses in italic, a grid of symbols seen but not yet known.
- **Robustness**: no page errors in either walk, no sideways scroll, and the foot never leaves the screen.

---

## Checks behind this report

- The screen walk (`tests/flows/heart-walk.mjs`) at 360 × 780: 82 screens, no errors, no network, the side chamber at 0.506 of the way at four settings. At 390 × 844 the walk stopped at "+ Add" because a morning screen came first; this is a limit of the walk, not the app (the morning screen was correct and its "On to today" worked).
- A second walk written for this review (not committed; the rules forbid committing screenshots): 28 screens at each size, no page errors, each checked for text under 13 px, targets under 44 px and words past the margins. That check found: 12 px on the reminder choices and Settings' link; 39 × 40 "List"; 36 px day headers and a 44 × 30 "+" in the Week; 38 px calendar cells at 360; a swiped row's name off-screen.
- The story-text width was measured directly on a delve's end at 390 × 844: the text box runs from 6 px to 384 px.
