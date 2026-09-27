# Productivity expansion: what else the app could do

> Research asked for by Dan, 2026-09-27: "What else could it do? What does the research say? Is there a large addition or big project we can add to the app which turns it into a real productivity powerhouse? Look at what the absolute best apps do, and even if it's something big, let's consider it."
>
> **Research only.** Nothing here is decided or built. Dan chooses, and each choice then becomes a D-entry (rule 19). **Spoiler-free:** nothing under the sealed folders was opened. Where an idea touches the story, only the mechanics are described; the story's side goes through the sealed process (D-015, D-035).
>
> Read before writing: `CLAUDE.md`, `MASTER_BRIEF.md`, `PLAYER_MODEL.md`, `CURRENT_STATE.md`, `DESIGN_PRINCIPLES.md`, `ANTI_FEATURES.md`, `product/PRODUCTIVITY_REVIEW.md`, `product/PRODUCTIVITY_PLAN.md`, `product/scope/`, `game/TOOLS_RESEARCH.md`, `product/MVP.md` (the central test), and `DECISIONS.md` D-107 to D-127. It builds on `TOOLS_RESEARCH.md` and the scope pages rather than repeating them.

## For Dan, in one paragraph

The app is already better than the famous apps at the hardest part: **getting you started** on the thing you're putting off, and treating a low day kindly. What it lacks is not another list or screen. The research points to three kinds of help. First, **deciding "when and where" ahead of time.** "After breakfast I open Spanish" is the best-proven trick in the whole field. Second, **starting from wherever you are**: the lock screen, the Action button, Control Centre, your watch, not only from inside the app. Third, **real long projects** (the Course, getting Spanish going again) that the world notices and rewards with something new, not with a number. So my one big bet is **Great Works**: a real project you name, broken into a few milestones, where only the next step ever shows. The minutes you put in slowly open something in the world that you can use. Around it I'd add several small, invisible things:
- the app choosing tomorrow's first job with you at bedtime;
- "when–then" cues on your repeating jobs;
- the planner quietly learning how long things really take you and when you really start.

I'd **not** build an AI that plans your day for you, an hour-by-hour grid, charts, streaks or anything social. The research and the apps people abandon both say those turn into admin or guilt. One honest warning: you removed three things today because they were clutter. Every idea below has been judged against that.

## The one big bet I'd make, and why

**Great Works: real projects with milestones that open something in the world** (Big project 1 below; it builds on scope page 17 and the "great gate" already in `game/CORE_LOOPS.md`).

Why this one, over the other big ideas:
1. **It fills the biggest real gap.** The productivity review scored "months, goals, projects" at **0.5/5**. Everything else scored 2.5 or better, and most of the rest has since been built (dates, repeats, the calendar, reminders, capture, the look-ahead). Nothing in the app yet sits above a single job.
2. **It is where the evidence is strongest for someone like you.** Goals broken into near steps beat one distant goal (Bandura & Schunk 1981). Effort speeds up as a visible goal gets close (the goal-gradient effect, Kivetz et al. 2006). Progress on meaningful work is the strongest daily lift people report (Amabile & Kramer 2011). "Only the next step" is the GTD rule every good project tool uses.
3. **It is where the game and the productivity side make each other stronger, not just sit side by side.** Your player model says the thing that excites you most is **a new ability**: a spell, a power, a tool, never a bigger number. Your real life has exactly two kinds of big, absorbing goal (coding and the reef tank). A finished real project that unlocks a real new verb in the world is the purest form of this game's promise: *"I want to finish module 6 because of what it opens."*
4. **It is already half-designed and was always intended** (D-019, `CORE_LOOPS.md` → Large projects, scope 17). The anti-farming rule is solved: the door fills with **minutes**, not with step count.
5. **The other big candidates are either weaker on evidence** (body doubling, AI planners), **against rules Dan agreed for good reasons** (auto-scheduling, time-blocking), **or better as small features** (reflection, calendar write-back).

What it is **not**: a project manager with Gantt charts, percentages or a list of 30 steps. It shows one next step, and the world does the rest.

The condition: it's only worth building if Dan has **real multi-week goals beyond the daily rhythms**. The Course (24 weeks), restarting Spanish (20 paid lessons unused) and the tank are the likely first three. If Dan can't name one, it waits (as D-111 already says).

---

## What the research says, in brief

| Finding | Strength | What it means here |
|---|---|---|
| **If-then plans** ("if it's 9:00 at my desk, then I open the draft") raise follow-through. d ≈ 0.65 in the 2006 meta-analysis; 642 tests in the 2024 update, about 0.3–0.6 [1, 2]. Stronger when the plan is truly in if-then form, and when delivered interactively rather than on paper [3]. | **Strong** (the real effect is likely nearer 0.3) | The single best-proven lever. One tap: a cue and a first action. The app already has times and first steps; it lacks the *cue*. |
| **Monitoring progress** raises goal attainment, d ≈ 0.40 across 138 trials, more when progress is physically recorded or reported to someone [7]. | **Strong** | The world already records every minute with no admin. Sharing a record with someone (the psychologist) is supported. |
| **Near sub-goals beat distant goals** [18]. **Goal gradient**: effort rises near a goal [19]. **Small wins** are the biggest daily lift [20]. | Strong / moderate | Projects as milestones, next step only, visible nearness in the world. |
| **Habits take months, not 21 days** (median 66 days, range 18–254 [22]; 59–66 days, up to 335, in a 2024 review [23]). Missing one day doesn't matter. Habits are **cue → action** links; personal cues differ [24, 25]. | **Strong** | Stable cues on rhythms; misses are nothing, never a loss (already the rule). The app could learn Dan's own cues. |
| **Procrastination** is driven by task aversiveness, low confidence, impulsiveness and delay (Steel 2007 [26]). It is **short-term mood repair** (Sirois & Pychyl [27]). **Self-forgiveness reduces the next procrastination** [28, 29]. | Strong (correlates), moderate (interventions) | This backs rule 9 with evidence: the kind return after a gap is a working part, not decoration. Smaller first steps lower aversiveness; the story is the value; the reward at a delve's end cuts delay. |
| **Planning fallacy:** people underestimate durations even when they know past tasks overran [33]. Breaking a task into parts, and using one's own past (a reference class), reduce it [34, 35]. | Strong (bias), moderate (fixes) | Never ask Dan to estimate. The app has his real minutes; it can learn them quietly. |
| **Writing tomorrow's to-do list at bedtime** made people fall asleep **~10 minutes faster** than writing what they had done (Scullin et al. 2018, polysomnography, n = 57), and more specific lists meant faster sleep [53]. | Moderate (one good RCT) | Directly relevant to Dan's late nights: a bedtime "put it down" plus tomorrow's first job. |
| **Plan-making quiets unfinished goals** (Masicampo & Baumeister 2011 [5]). | **Contested** (not reliably replicated) | Used as a supporting idea only, never as the reason. |
| **Behavioural activation** (scheduling meaningful activity) works for low mood about as well as CBT. A BA app with activity scheduling plus a daily mood rating (Moodivate) cut depressive symptoms in primary-care trials [54, 55]. | Strong (BA), moderate (as an app) | The psychologist's "activity scheduler" advice is this. Its standard ingredient the app lacks is noticing **that action lifts mood**, which Dan already said about the gym. |
| **Temptation bundling:** audiobooks only at the gym raised visits by 51% at first, then faded (Milkman 2014 [51]). At scale, about +10–14% weekly workouts [52]. | Moderate (real, smaller at scale, decays) | The game is already a temptation bundle. A *heard* story during hands-busy jobs is its purest form (Big project 3). |
| **Gamification:** small effects overall. **Narrative fiction** is one of the few game elements that moderates *behaviour* [41, 42]. **Broken streaks reduce engagement**, worse when people blame themselves [44]. Built-in skip days help persistence [45]. Expected rewards paid per task can undermine interest [43]. | Moderate | Confirms the concept (story over points) and the anti-features (no streaks, no pay-per-task). |
| **Breaks and Pomodoro:** fixed breaks make work *feel* easier and more motivating, but don't raise output [9, 10]. **Attention residue:** an unfinished task lingers into the next [11]. | Moderate | The delve's value is lowering the cost of starting. "Where did you stop?" (built) is the right parking ritual. |
| **Notifications** raise inattention and hyperactivity symptoms (a within-person week-on, week-off study [39]). | Moderate | Keep alerts few and self-chosen (as now). A widget is the quiet alternative to a nudge. |
| **ADHD time blindness** is real [36, 37]. "Put time where the work is" (Barkley) is clinical consensus, not trial-proven for adults. Most ADHD tech research aims to "fix" people, not co-design with them [38]. | Strong (deficit), weak (specific fixes) | Time made visible *during* work (the ring, the lock-screen panel) is right; a grid of the whole day is not proven. |
| **Body doubling** is widely used and valued (a survey of 220 people [13]); only tiny experiments exist [14]. Focusmate's figures are its own survey [15]. The famous "76% with an accountability partner" (Dominican University) was never peer-reviewed [16]. | **Weak** | Don't build a big feature on it. |
| **AI help with goals:** an AI coach beat nothing but **not** a matched written questionnaire; its extra value came from feeling accountable [48]. **AI-written goals scored better on paper but people owned them less and acted on them less** (47% vs 73% acted; worst for low-confidence people) [49]. AI help can bring "metacognitive laziness" [50]. | Weak (preprints), but consistent | If AI helps break things down, it must **ask Dan first and suggest only when he's stuck**, and Dan edits. It must never write his plan. |

## What the best apps teach

From about twenty apps (details and sources in the research notes behind this page, listed under Sources):

**What the most loved apps share:**
1. **Capture that costs nothing:** Todoist's natural language and its Ramble voice brain-dump (in its first 3 weeks, 76,000 people used it about 290,000 times), Tiimo's AI brain-dump, Apple's suggested reminders.
2. **One calm focus:** Things, Llama Life ("one task at a time"), Structured.
3. **Time you can see:** Structured's timeline, Tiimo's countdown and Routinery's step timers. This is the most consistent ADHD praise.
4. **Short rituals that give the day a shape:** Sunsama's shutdown ("the day has a shape now"), Things' "This Evening", Sunsama's overcommit warning, Structured's Energy Monitor.
5. **Help starting, not only tracking:** Goblin.tools' "spiciness" slider, Tiimo's co-planner, Routinery, Focusmate.
6. **A gentle companion that never dies:** Finch, 4.9★; its bird never leaves.
7. **Living on system surfaces:** widgets, Live Activities, the Watch. Tiimo was Apple's iPhone App of the Year 2025 partly on these.

**What makes people leave:**
1. **Admin.** OmniFocus "demands maintenance"; Notion's "set up, show off, abandon" cycle; Akiflow's method takes a long time to learn. A 2024 review of 18 studies found a median of **70% of users stop within 100 days** [56].
2. **Shame.** Habitica's damage and death, Forest's dead trees, Streaks resetting to zero, Todoist Karma falling for overdue tasks.
3. **Rewards you can farm or that feel hollow.** Habitica lets players set their own task difficulty.
4. **Bloat.** TickTick's feature count; Motion's pivot to an "AI SuperApp".
5. **AI that takes control.** Motion's constant reshuffling feels "oppressive" and packs days too tightly; Reclaim's choices are opaque and fill the calendar with events. People **love AI that proposes** (a breakdown, a parsed line, a drafted summary) and **dislike AI that takes over the schedule**.
6. **Social mechanics that depend on others.** Habitica parties drift apart.

**Where the app stands against that list:** it already has 2, 3 (the ring and the lock-screen panel), 4 (Tonight, the week close and the look-ahead), part of 5 ("I can't start", first steps) and 6 in spirit (the world never punishes). Its gaps are **1** (capture is one line, no parsing, no voice brain-dump), **5 beyond one first step**, **7 beyond the delve's own panel**, and anything at the scale of **projects**.

---

## Ranked new features

Size: **S** hours to a day · **M** a session or two · **L** several sessions or native iOS work (as in `PRODUCTIVITY_REVIEW.md`). Each is new: none repeats a built stage or an item Dan already declined.

### 1. Tonight: tomorrow's first job, and "put it down"
- **What it is.** On Tonight (the evening part of Today, D-093), two quiet offers before Go to sleep:
  - **"Tomorrow starts with…"**: one tap on a job (the plan's first is pre-selected). In the morning, Today opens with that job leading and its delve set up.
  - **"Anything on your mind?"**: a box that drops lines straight into the Satchel, with no question asked.
  - Both can be skipped. Neither earns anything.
- **Evidence.**
  - Scullin 2018: a 5-minute to-do list at bedtime meant falling asleep about 10 minutes faster, and more specific lists were better [53].
  - Implementation intentions: a chosen first action with a cue ("tomorrow morning, first") [1].
  - Sunsama's shutdown ritual and Things' "This Evening" are the category's most praised bookends.
  - Masicampo & Baumeister (contested) as a supporting idea only.
- **Fit with the rules.**
  - Rule 8: nothing moves the world for planning (P16).
  - Rule 9: skipping says nothing.
  - Rule 11: it's two optional taps inside a moment that already exists, not a new ritual.
  - Rule 12: it serves two things Dan named himself: late bedtimes, and "a morning start moment and an evening close moment".
- **Size.** S (under a session). No new screen; one new fact (`firstChosen`) with its sample save (D-106).
- **Day to day.** At night you tap tomorrow's first job and maybe jot "ring the vet". In the morning there is nothing to decide: the one job is waiting, set up.
- **Risks.**
  - It adds a step at night, when Dan is often tired or up late. It must never block Go to sleep, never be asked twice, and a job chosen at night must not become a debt if the morning goes differently.
  - The brain-dump could grow the Satchel. The look-ahead's weekly "Still wanted?" already handles that.

### 2. When–then cues on repeating jobs
- **What it is.** In the job editor, an optional line: **"When…"**, with three kinds of cue:
  - a time ("at 9:00", which already exists);
  - **"after…"** another job or a fixed point ("after the gym", "after breakfast");
  - a **place** ("when I get home"), which is optional and needs location permission.

  The cue shows on Today as the job's quiet sub-line ("After the gym → Spanish"). When the anchor job's delve ends, the next job is offered in its place, and a place cue can send one opt-in alert ("You're home. The tank?").
- **Evidence.**
  - The strongest in the field. If-then plans [1, 2], with event cues ("habit stacking") as a form of them.
  - Habits are cue → action links, and stable context matters more than willpower [22–25].
  - Delivered interactively works better than on paper [3].
  - None of the reviewed apps does this well. Due and Apple Reminders do place-based reminders; no planner links jobs by "after".
- **Fit with the rules.**
  - Rule 11: optional, set once per rhythm, never required.
  - Rule 9: a cue that didn't happen is silent.
  - Rule 10: keeping to a cue earns nothing extra (P16).
  - Rule 16: Today still shows one next job; the cue only decides which one comes next.
- **Size.**
  - "After…" cues: M (1 session). New optional fields on a rhythm; no save version change.
  - Place cues: M–L (native geofencing through Core Location, a new permission, and checking on the phone).
  - Build "after…" first.
- **Day to day.** You finish the gym delve, and the next thing on the screen is Spanish, because that's what you said. You don't choose again, and you're already in motion.
- **Risks.**
  - A place cue means location permission. It stays on the phone, but it's a big permission for a small feature.
  - An "after" chain can read as a schedule to obey. Keep it to one link per job, and never show a chain.

### 3. The planner learns: your real minutes and your good hours
- **What it is.** Two quiet things the app works out from facts it already keeps, with nothing to fill in:
  - **Real minutes:** "about 2 h" on each day of the Week, and how full Plan my week makes a day, use how long each kind of job **actually** took you (the median of your last few delves on it), not the job's set minutes.
  - **Good hours:** the times of day when you most often start delves, especially on jobs you put off. Plan my week places avoided jobs there. A reminder's "15 min before" can lean to those hours when you choose a time.

  There are no charts. A tap on "about 2 h" can say why, in one line ("admin usually takes you about 50 minutes").
- **Evidence.**
  - Planning fallacy and reference-class forecasting: your own past is the best predictor [33–35].
  - Personal habit cues differ from person to person, and time of day is one of the strongest (Buyalskaya et al. 2023 [24]).
  - Sunsama's overcommit warning and Structured's Energy Monitor are loved, but both need the user to estimate or rate. This needs neither.
  - MASTER_BRIEF §17: "Over time the app should learn what works for Dan."
- **Fit with the rules.**
  - It removes admin rather than adding it (rule 11).
  - It doesn't touch rewards (rule 10).
  - It never shows a shortfall (rule 9): it adjusts the plan, and never says "you underestimated".
  - Anti-feature "manual estimating" is kept.
- **Size.** S–M (1 session): pure rules in `core/week.ts`, no new facts (everything is derived from delve records), plus rule tests.
- **Day to day.** Weeks planned by the app stop being quietly too full. The avoided job lands at an hour you've actually started things before, not at 9:00 because 9:00 looks neat.
- **Risks.**
  - Learned hours could lock in late nights (ADHD). So bedtime still bounds the day, and the learner ignores starts after bedtime.
  - It's unreliable in the first weeks, when there's little data: fall back to the set minutes until there are about 5 delves on a job.
  - Opacity (Reclaim's complaint): keep the one-line "why".

### 4. "Make it smaller" and "say it plainly", on the phone's own AI
- **What it is.** Apple's on-device model (the Foundation Models framework, iOS 26) helps in two places:
  - **Make it smaller:** from "I can't start" or a job's list, the app first asks **"What's the first thing you'd touch?"** (as now). Only if Dan taps **"Help me"** does it suggest three to five small steps. Dan edits them, and they go into the job's list (D-126), shown one at a time. A "spiciness" choice (Goblin.tools) sets how small the steps are.
  - **Say it plainly:** "+ Add" and Siri understand a line like "dentist Tuesday 3pm" or "tax return by the 31st". The date, time or "by" date is filled in, and Dan sees it before it lands. Voice brain-dumps ("shampoo, ring the vet, book Spanish…") become separate jobs.
- **Evidence.**
  - Goblin.tools' breakdown is loved for "step zero", and Tiimo's co-planner and Todoist's Assist and Ramble are the category's newest wins.
  - Breaking a task into parts reduces the planning fallacy [34] and lowers aversiveness, a core cause of procrastination [26].
  - **The warning:** AI-written goals lower ownership and follow-through [49], and AI help can breed "metacognitive laziness" [50]. Hence "ask first, suggest only when stuck, Dan edits". An AI coach's value came mostly from accountability, not from the text [48].
- **Fit with the rules.**
  - **Nothing leaves the phone.** It is Apple's on-device model: no network, no key, no cost, so the "no network" rule and `SECURITY_PRIVACY.md` hold. This is the version scope 19 called "the only one worth building".
  - It is about Dan's real jobs, never the story, so the anti-feature on AI lore doesn't apply.
  - Steps earn nothing; only minutes do (rule 10).
  - The P4 rule (no baby-talk steps) still holds: the prompt forbids them, and Dan edits.
- **Size.** M–L (2 sessions): a Swift plugin like `CalendarPlugin.swift`, structured output (Apple's "guided generation"), a fallback when Apple Intelligence is off, and checks that can only be done on the phone.
  - Dan's iPhone 16 Pro Max supports it. It needs iOS 26 and Apple Intelligence switched on (to check with Dan).
  - It raises the app's minimum iOS only for this feature. Older phones simply don't see "Help me".
- **Day to day.**
  - On a stuck day, "Sort the tax return" becomes "Find last year's letter", then "Open the tax site on the laptop", and so on, one at a time. You say "Help me" only when your own first step won't come.
  - Capture gets faster: say "dentist Tuesday 3" to the Action button and it's in the Week at 15:00.
- **Risks.**
  - Generic or patronising steps (P4).
  - "Help me" becoming a toy instead of a start (rule 11). It is limited to one suggestion per job a day, and "try again" is not offered.
  - Model quality from a ~3B model is decent for short steps, weaker for judgement.
  - Parsing errors: Todoist's own voice parsing succeeded only about 62% end to end at launch. So Dan always sees what was understood before it's saved.

### 5. "How was that?": noticing that doing lifts the day
- **What it is.**
  - At a delve's end, one optional tap: **Lighter · Same · Heavier** (how you feel now compared with before). It is never asked on every delve: at most once a day per job, and it can be switched off.
  - The Daybook's week page then says, in words and only when the pattern is real: *"The gym left you lighter 6 times out of 7."*
  - There are no charts, averages or mood history screens.
- **Evidence.**
  - Behavioural activation's core loop is **noticing that action improves mood**, which breaks "wait until I feel like it" (strong for BA [54]). Moodivate's daily mood rating plus activity scheduling worked in primary-care trials [55].
  - Dan said it himself: "the gym makes me feel better", and "what gets me started is mostly mood". Evidence from his own life is the most persuasive argument against waiting for the mood.
  - Progress monitoring is strongest when recorded [7].
- **Fit with the rules.**
  - **This changes a written decision:** the central test says "Not collected: mood" (`MVP.md`), so it needs Dan's explicit yes (rule 18), and ideally his psychologist's view (P15).
  - It is never a score, never shown as a low, never tied to rewards (rules 9, 10).
  - "Heavier" is information, and the app answers it with nothing but "noted".
- **Size.** S–M (1 session): one fact, one Daybook line, a switch.
- **Day to day.** Most days you ignore it or tap once. Every few weeks the Daybook shows you something true about yourself that makes the next couch moment a little easier to argue with.
- **Risks.**
  - Health data in the save and its copies (`SECURITY_PRIVACY.md` needs a line).
  - It could feel clinical, or like homework.
  - On a bad stretch, repeated "heavier" could weigh on him. So the Daybook only ever names a *lift*, never a run of heavy days.
  - It could muddy the central test. Starting it after the test's first weeks avoids that.

### 6. Your plan in the phone's calendar
- **What it is.** An opt-in switch: the Week's planned jobs **with a time** appear in a calendar of the app's own ("Long Answer") in Apple Calendar, and move or vanish when the plan changes. Untimed jobs stay out. This is write-back without the time-blocking: only what Dan already timed.
- **Evidence.**
  - "When and where" plans [1].
  - Barkley's "at the point of performance": your calendar is where you already look.
  - Structured, Tiimo and Reclaim do this. Reclaim's clutter complaint is avoided by writing only timed jobs to a calendar that can be hidden with one switch.
  - iOS 17 offers **write-only** calendar access, a smaller permission [57].
- **Fit with the rules.** It adds no planning and changes no rewards. The app still decides nothing: Dan gave the time. "No time-blocking" (P1) is kept.
- **Size.** S–M (1 session): the existing `CalendarPlugin.swift` gains writing to its own calendar, with the event ids kept so an event is never duplicated or orphaned.
- **Day to day.** Your 18:00 Spanish lesson sits in the same calendar as the dentist, on your watch face and in Siri's "what's on today", without opening the app.
- **Risks.**
  - Stale events if a change is missed. The app re-syncs on every opening and deletes only its own events.
  - A calendar full of "Spanish" could read as obligations. Only timed jobs appear, and one switch hides them all.

### 7. A week to show your psychologist
- **What it is.** In Settings (or the Daybook's week page), **"Make a page for someone"**: a plain, one-page PDF of a chosen week. It lists what was done and when, in minutes, plus any "How was that?" lines if feature 5 exists. It goes out through the share sheet (as Save a copy does). There's no in-app dashboard, and nothing is listed as missed.
- **Evidence.**
  - Progress monitoring works better when **reported to someone** [7].
  - Activity scheduling is the psychologist's own recommendation (P15), and a real record of the week is its standard material.
  - It turns the "Mixed" reading of the central test into something the psychologist can see too.
- **Fit with the rules.**
  - It lists only what happened (P7, rule 9).
  - Nothing leaves the phone unless Dan shares it (as with the test summary, D-054).
  - It is not an in-app stats screen (the anti-feature stays).
- **Size.** S–M (1 session). The PDF is drawn in the web layer; the share sheet already exists.
- **Day to day.** Before a session with your psychologist you tap once and send a clear page, instead of trying to remember the fortnight.
- **Risks.**
  - It could come to feel like an audit or a report card. Dan decides if it exists at all, and it never says "missed".
  - It holds health-adjacent data once shared.

### 8. Share into the Satchel
- **What it is.** "Share → Long Answer" from Mail, Safari or Notes puts the text, or the page's title, into the Satchel as a job (scope 10 B).
- **Evidence.** Effortless capture is common to every loved app. Apple's own Reminders now suggests to-dos from Mail and Safari.
- **Fit with the rules.** Capture earns nothing (P16), and it asks nothing.
- **Size.** M (1–2 sessions): a share extension, a new target and an App Group (none exists yet).
- **Day to day.** An email says "please send your form by Friday", and two taps put it in the Satchel.
- **Risks.**
  - Honestly, modest value: Dan's capture habit is still unknown, and Siri and the Action button already exist.
  - The watch-later trap: sharing YouTube videos into the Satchel. So it takes text and link titles only, and never plays anything.
  - Build it only if Dan finds he wants it.

**Also considered and left out of the ranking:** Focusmate's link (scope 22 B; weak evidence, and it works today on the laptop), search (declined in D-111 until needed), and a light mode (declined in D-111).

---

## The big projects

### Big project 1 (the bet): Great Works, real projects that open something in the world
- **What it is** (scope 17 option C, sharpened by the research):
  - **Name it:** from the Satchel, "+ A great work": a name and, optionally, a month.
  - **Milestones, not a task list:** three to six milestones in Dan's own words, e.g. "Course: module 6 finished". Each milestone holds jobs, but only **the next job of the next milestone** is ever offered: on Today when planned, in the Satchel and in Choose a delve. Feature 4's "Help me" can suggest milestones, but only after Dan tries his own.
  - **The world fills with real minutes** spent on the work (a door, a great gate, a machine: the story's side is sealed). The next milestone is always *visibly near* in the world (goal gradient), never shown as "3 of 7" or a bar.
  - **A milestone done** is one tap, trusted ("Module 6 finished?"), and brings a proximal moment in the world.
  - **The work finished** opens its door. By the player model, what's behind it should be **a capability**, something new to use in the game, not a number. What it is gets decided in the sealed process.
  - **The weekly look-ahead** (D-116) gains one line: the great work's next milestone, and it can be pinned as "what matters most".
  - **Letting go:** as with dates, one question, *Still wanted? · New month · Let it go*. A let-go work leaves no trace, and its minutes stay counted.
- **Evidence.**
  - Proximal sub-goals [18], goal gradient [19], small wins [20] and specific goals [17]; the progress principle.
  - GTD's "next action"; Things' projects and Sunsama's weekly objectives.
  - Narrative as the game element that moves behaviour [42].
  - Dan's own words: "Repetition is fine so long as it's for a goal that I can see", "knowing roughly what's coming, with the details a surprise", and abilities as his favourite reward.
- **Fit with the rules.**
  - **Rule 8:** only minutes of real work fill it.
  - **Rule 10:** splitting into more jobs or milestones earns nothing; the door needs about 5 hours in (scope 17's starting guess), so a one-step work made to farm a door gets nothing.
  - **Rule 9:** no deadlines in red, and letting go is clean.
  - **Rule 11:** a name plus a few milestones, never a 30-step plan; steps can come later.
  - **Rule 12:** Dan cares about capabilities and visible goals, and it's built only once Dan names a real project.
  - **Rule 15:** big goals were always meant to be "great gates" (D-019).
  - **The story never waits on a project** (D-019): a great work's door is side content, outside the weekly Keys.
- **Size.** **L**: 3–4 sessions for the mechanics (scope 17's B, then C), plus a sealed story session for each door's content and its painting. It builds on the job editor, dates, the Satchel's lists and the look-ahead, all built.
- **What Dan would feel day to day.**
  - Most days, nothing new on Today: the next Course job is simply one of the day's jobs.
  - About once a week, a milestone lands and the world visibly shifts closer to something you want.
  - Once in a while, the real "Holy shit, I finished it, and now I can do *this*" moment.
- **Risks.**
  - **Lists on low days** (P2): keep it off the opening screen; one next job only.
  - **The story's writing load:** D-123 already means a hard worker runs out of story sooner, and each great work needs sealed content. Its doors should be designed as a small reusable family, not bespoke each time.
  - **A third kind of thing** beside rhythms and one-offs. The Course is already a rhythm, so the rhythm must be able to *belong* to a great work, not be copied into one. That is the hardest design point.
  - **Honour system:** "Module 6 finished?" is trusted, as all milestones are.
  - **It muddies the central test** if built before it. Start Phase 10 first, or treat Great Works as part of what the test tests.

### Big project 2: Start from anywhere
- **What it is.** One press starts the next delve from wherever Dan is, using Apple's App Intents (the same mechanism as the Siri capture, D-113). It covers:
  - **An interactive widget** (home and lock screen): "Next: Spanish" and a **Begin** button that starts the delve (its Live Activity appears) without opening the app, plus **+** to capture.
  - **A Control Centre and lock-screen control** (iOS 18): "Begin next delve".
  - **The Action button:** today it adds a job (D-113); Dan could switch it to "Begin next", or use a long press for one and Siri for the other.
  - **Siri:** "Start my next delve in Long Answer."
  - **The Apple Watch:** the delve's Live Activity already mirrors to the Watch's Smart Stack on watchOS 11 with no work [58]. A small Watch control could start and pause it.
  - **A Focus mode link:** turning on a "Delve" Focus starts the next one (optional).
- **Evidence.**
  - Friction: the easier the start, the more starts. This is the product's own thesis (P1), and Dan's competitor is the phone on the couch, where the lock screen *is* the phone.
  - System surfaces are one of the seven things the most loved apps share (Tiimo, Structured).
  - Barkley's "point of performance".
  - A quiet widget in place of more notifications, which raise inattention [39].
- **Fit with the rules.**
  - Rule 8: it only starts real work.
  - Rule 11: no admin, and it removes taps.
  - Rule 16: the widget shows exactly one next job and never a count or red (scope 10's guard).
  - Rule 15: it's a way into work, not a way to stay in the app.
- **Size.** **L**, 3–4 sessions of native work: a widget and control in the existing widget extension, and an intent that writes a "delve begun" record the game reads on its next wake (as the Siri inbox does, D-113). The timer's rules live in the game's code, so the intent must start the Live Activity natively and the game must reconcile it faithfully, including pause rules (D-094), 04:00 and double starts (D-120). This is the riskiest engineering here; the done loop took several rounds to make robust.
- **What Dan would feel day to day.** On the couch, phone in hand, the next job is on the lock screen with Begin under it. One press and the ring is running on the lock screen and your wrist. Starting costs less than opening YouTube, which is the whole game.
- **Risks.**
  - "Next: …" staring from the home screen all day could feel like being watched (scope 10's question). Dan can remove it, and its words must stay calm.
  - Job names on the lock screen are private information; hide them while the phone is locked if Dan wants.
  - Reconciliation bugs in a timer started outside the game.
  - A delve started by accident. The Live Activity needs a clear "Stop, I didn't mean to" that leaves no record.

### Big project 3: A story in your ears (audio delves)
- **What it is.** An optional sound layer for hands-busy jobs (gym, housework, the tank, walks). While a delve runs with the phone locked in a pocket:
  - **First, ambience only:** the current place's sound (wind in a gallery, water, stone), plus one soft tone at the delve's end. S–M.
  - **Then, a heard story:** short narrated passages that play **only during delves**, the Zombies, Run! model, drawn from story content made for hearing. Never new canon: the same sealed truth, told aloud.
- **Evidence.**
  - Temptation bundling: story only while working raised gym visits by 51% at first (Milkman 2014 [51]), about 10–14% at scale, fading over time [52].
  - Zombies, Run! is the best-known story-led exercise app: people run "to find out what happens next" (`TOOLS_RESEARCH.md`).
  - Narrative is the game element that moves behaviour [42].
  - Housework is Dan's "particularly bad" avoided job, and the gym is inconsistent. Both are eyes-free, which is exactly where reading a screen can't help.
- **Fit with the rules.**
  - Rule 8: audio plays only while real work runs.
  - Rule 10: the audio earns nothing; minutes do.
  - Rule 15 (don't add because RPGs have it): MASTER_BRIEF §22 always expected audio "once the core works".
  - Rule 6: nothing new is invented; it's canon read aloud.
- **Size.**
  - Ambience: M.
  - The heard story: **XL**, a production project. It needs:
    - writing for the ear (the sealed process);
    - voice (a synthetic voice good enough for a dark, restrained tone, or a human);
    - background audio rules with the delve's pause (locking keeps it running; another app pauses it, D-094);
    - how heard story and read story share one order without double-telling.
- **What Dan would feel day to day.** "I'll do the kitchen so I can hear what's behind the door." Housework stops being the thing you avoid and becomes when the story happens.
- **Risks.**
  - **It is the most expensive thing on this page.**
  - A synthetic voice done badly would cheapen a story Dan has worked hard to make readable (D-097).
  - The story is consumed faster, adding to D-123's writing load.
  - Dan may simply prefer reading.
  - **Recommendation:** ambience first as a cheap test. Build the heard story only if Dan asks for more.

## The example big ideas weighed and not recommended as big projects

| Idea | Verdict | Why |
|---|---|---|
| **AI planning assistant** (a chat coach, a cloud AI that plans the day) | **No.** A small, on-device slice is feature 4. | AI-written plans lower ownership and follow-through [49]; an AI coach did no better than a matched questionnaire [48]; people abandon AI that takes over (Motion). A cloud AI breaks "nothing leaves the phone" and adds a running cost. |
| **Energy- and time-aware auto-scheduler with calendar write-back** (Motion, Reclaim) | **No.** The useful parts are features 3 and 6. | Motion's constant reshuffling is its most common complaint. An hour grid is an agreed anti-feature (P1), and Dan today removed a day-size choice as clutter (D-127). "Energy" rated by Dan every day is admin, but *learned* good hours (feature 3) is not. |
| **Accountability or body-doubling mode** | **No** (scope 22 A stands). | The weakest evidence of anything here [13–16]. A companion to watch pulls the eye to a screen the delve wants locked. The accountability that *is* supported (reporting to someone) is feature 7. |
| **Reflection and insight engine** | **Only as small pieces:** features 3, 5 and 7, as words in the Daybook. | Reflection and monitoring are supported [7, 8], but a dashboard, charts or percentages are agreed anti-features, and a big "insights" screen is the Notion trap. |
| **Apple Watch app, widgets, Live Activities** | **Yes, as Big project 2.** | See above. The Watch already gets the delve for free. |
| **Email and notes capture** | **Small:** feature 8, if wanted. | Reading Dan's mail (Gmail sign-in) would send data off the phone and add sign-in chores for little gain over the share sheet. |

## What not to build

These show up in the best apps and would be wrong here. Each item says why.
- **Streaks, counters, Karma, "days in a row."** Broken streaks reduce engagement, and more so in people who blame themselves [44]. Streaks, Todoist Karma, Forest's dead trees and Habitica's damage are why people leave. (Kept out: P6, anti-features.)
- **Damage, HP loss, death or a disappointed companion for misses.** Habitica is the case study, and the research on self-forgiveness says the opposite works [28]. This is a hard rule (§16).
- **Priority matrices, tags, contexts, perspectives, custom views** (TickTick's Eisenhower matrix, OmniFocus). These are power tools that "demand maintenance", which is rule 11 exactly.
- **Time estimates on every job.** That is the planning fallacy's own trap, and admin. Learn the minutes instead (feature 3).
- **An hour-by-hour grid, or AI that reshuffles your day.** Planning replaces starting (P1). Motion's churn "feels oppressive".
- **Stats, charts, "productivity score," heatmaps, habit grids.** These are agreed anti-features. A grid of empty squares is a wall of misses.
- **Social: leaderboards, parties, shared challenges.** Habitica's parties drift and shame. Built for Dan alone (§78).
- **AI that writes the story, or lore made up on the fly.** This breaks rules 5 and 6, whatever else it could do.
- **More notifications.** Keep them to what Dan timed, plus the off-by-default nudge (D-113). Notifications raise inattention [39].
- **Anything that makes the app a place to browse:** feeds, "insight" screens, long project pages. The competitor is YouTube; the app must not become it (P15).
- **A second list system.** The Satchel with lists (D-126) is enough. Do not add checklists, sub-projects and areas (Things' areas, Todoist sections): that is the "set up, show off, abandon" cycle.

## A suggested order, and the questions for Dan

**Honest note on timing.**
- The central test (Phase 10) hasn't started, and the productivity track has already added a great deal to Phase 9.
- Every change before the test makes its answer harder to read. So, in order:
  1. Build the **small, nearly invisible** things now, because they change the plan, not the game: feature 1 (Tonight's first job) and feature 3 (learned minutes and hours).
  2. Start the test.
  3. Build Great Works once Dan names a real project, as part of what the test watches.
  4. Build Start from anywhere and on-device AI after a few weeks of real play show where starting still fails.
- Features 5 and 7 wait for Dan's decision about mood and sharing.

**Questions only Dan can answer:**
1. **Great Works:** which real projects would you put in today? The Course? Spanish? The tank? Something else? What should they be called? If none, the big bet waits.
2. **When–then:** would "after the gym → Spanish" help, or feel like a schedule to obey? Is "when I get home" worth giving the app your location?
3. **"How was that?"** Would you want to see, in words, that doing things lifts you, or does rating your mood feel clinical? Would you like to ask your psychologist?
4. **Start from anywhere:** would "Next: Spanish" with a Begin button on your lock screen help you start, or feel like being watched? Do you wear an Apple Watch?
5. **AI help:** is Apple Intelligence switched on on your phone? Would "Help me" breaking a job into steps be welcome, or would you rather always write your own first step?
6. **Audio:** do you do the gym and housework with headphones in? Would place sounds during a delve appeal, as a first try?

---

## Sources

Research notes were gathered by two research passes (app landscape; evidence) plus Claude's own checks. Several sites blocked direct reading, so some figures come from abstracts or search summaries. Where a number was not checked against the primary source, the text above avoids it or says "about". Company figures are marked as such.

**Evidence**
1. Gollwitzer & Sheeran (2006). Implementation intentions and goal achievement: a meta-analysis. *Adv. Exp. Soc. Psych.* 38. https://doi.org/10.1016/S0065-2601(06)38002-1
2. Sheeran, Listrom & Gollwitzer (2024/25). The when and how of planning: 642 tests. *Eur. Rev. Soc. Psych.* 36. https://doi.org/10.1080/10463283.2024.2334563
3. Wang, Wang & Gai (2021). A meta-analysis of mental contrasting with implementation intentions. *Front. Psychol.* 12. https://doi.org/10.3389/fpsyg.2021.565202
4. Aeon, Faber & Panaccio (2021). Does time management work? *PLOS ONE* 16. https://doi.org/10.1371/journal.pone.0245066
5. Masicampo & Baumeister (2011). Consider it done! *JPSP* 101(4). https://doi.org/10.1037/a0024192
7. Harkin et al. (2016). Does monitoring goal progress promote goal attainment? *Psychol. Bull.* 142(2). https://doi.org/10.1037/bul0000025
8. Di Stefano, Gino, Pisano & Staats (2014). Learning by thinking. HBS WP 14-093 (working paper). https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2414478
9. Biwer et al. (2023). Pomodoro breaks vs self-regulated breaks. *BJEP* 93. https://doi.org/10.1111/bjep.12593
10. Albulescu et al. (2022). Micro-breaks meta-analysis. *PLOS ONE* 17. https://doi.org/10.1371/journal.pone.0272460
11. Leroy (2009). Attention residue. *OBHDP* 109. https://doi.org/10.1016/j.obhdp.2009.04.002
13. Eagle, Baltaxe-Admony & Ringland (2023). Body doubling. *ASSETS '23*. https://doi.org/10.1145/3597638.3614486
14. You are not alone: body doubling for ADHD in VR (2025, preprint). https://arxiv.org/abs/2509.12153
15. Focusmate (2024). Company survey, N = 834. https://www.focusmate.com/virtual-coworking-research/
16. Matthews (2007). Dominican University conference presentation (not peer-reviewed). https://scholar.dominican.edu/psychology-faculty-conference-presentations/3/
17. Locke & Latham (2002). Goal setting. *Am. Psychol.* 57(9). https://doi.org/10.1037/0003-066X.57.9.705
18. Bandura & Schunk (1981). Proximal self-motivation. *JPSP* 41(3). https://doi.org/10.1037/0022-3514.41.3.586
19. Kivetz, Urminsky & Zheng (2006). The goal-gradient hypothesis resurrected. *JMR* 43(1). https://doi.org/10.1509/jmkr.43.1.39
20. Amabile & Kramer (2011). *The Progress Principle*. HBR Press.
21. Dai, Milkman & Riis (2014). The fresh start effect. *Mgmt Sci.* 60(10). https://doi.org/10.1287/mnsc.2014.1901
22. Lally et al. (2010). How are habits formed. *EJSP* 40(6). https://doi.org/10.1002/ejsp.674
23. Singh et al. (2024). Time to form a habit. *Healthcare* 12(23). https://doi.org/10.3390/healthcare12232488
24. Buyalskaya et al. (2023). Machine learning and habit formation. *PNAS* 120(17). https://doi.org/10.1073/pnas.2216115120
25. Wood & Neal (2007), *Psychol. Rev.* 114(4), https://doi.org/10.1037/0033-295X.114.4.843; Wood & Rünger (2016), *Annu. Rev. Psychol.* 67, https://doi.org/10.1146/annurev-psych-122414-033417; Wood, Quinn & Kashy (2002), Habits in everyday life, https://dornsife.usc.edu/wendy-wood/wp-content/uploads/sites/183/2023/10/Wood.Quinn_.Kashy_.2002_Habits_in_everyday_life.pdf
26. Steel (2007). The nature of procrastination. *Psychol. Bull.* 133(1). https://doi.org/10.1037/0033-2909.133.1.65
27. Sirois & Pychyl (2013). Procrastination and short-term mood regulation. *SPPC* 7(2). https://doi.org/10.1111/spc3.12011
28. Wohl, Pychyl & Bennett (2010). I forgive myself, now I can study. *PAID* 48(7). https://doi.org/10.1016/j.paid.2010.01.029
29. Sirois (2014). Procrastination and stress: self-compassion. *Self and Identity* 13(2). https://doi.org/10.1080/15298868.2013.763404
30. van Eerde & Klingsieck (2018). Overcoming procrastination? *Educ. Res. Rev.* 25. https://doi.org/10.1016/j.edurev.2018.09.002
32. Hagger et al. (2016). Ego-depletion multilab replication. *Perspect. Psychol. Sci.* 11(4). https://doi.org/10.1177/1745691616652873
33. Buehler, Griffin & Ross (1994). The planning fallacy. *JPSP* 67(3). https://doi.org/10.1037/0022-3514.67.3.366
34. Kruger & Evans (2004). If you don't want to be late, enumerate. *JESP* 40(5). https://doi.org/10.1016/j.jesp.2003.11.001
35. Forsyth & Burt (2008). Task segmentation and the planning fallacy. *Mem. Cogn.* 36(4). https://doi.org/10.3758/MC.36.4.791
36. Zheng et al. (2022). Time perception deficits in ADHD. *J. Atten. Disord.* 26(2). https://doi.org/10.1177/1087054720978557
37. Time perception in adult ADHD (2023 review). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9962130/ ; Barkley (1997), *Psychol. Bull.* 121(1). https://doi.org/10.1037/0033-2909.121.1.65
38. Spiel et al. (2022). ADHD and technology research. *CHI '22*. https://doi.org/10.1145/3491102.3517592
39. Kushlev, Proulx & Dunn (2016). "Silence your phones". *CHI '16*. https://doi.org/10.1145/2858036.2858359
41. Hamari, Koivisto & Sarsa (2014). Does gamification work? *HICSS-47*. https://doi.org/10.1109/HICSS.2014.377
42. Sailer & Homner (2020). The gamification of learning. *Educ. Psychol. Rev.* 32. https://doi.org/10.1007/s10648-019-09498-w
43. Deci, Koestner & Ryan (1999). Extrinsic rewards and intrinsic motivation. *Psychol. Bull.* 125(6). https://doi.org/10.1037/0033-2909.125.6.627
44. Silverman & Barasch (2023). How (broken) streaks affect decisions. *JCR* 49(6). https://doi.org/10.1093/jcr/ucac029
45. Sharif & Shu (2017). The benefits of emergency reserves. *JMR* 54(3). https://doi.org/10.1509/jmr.15.0231
47. Bhattacharjee et al. (2024). LLMs and academic procrastination. *CHI '24*. https://doi.org/10.1145/3613904.3642081
48. Schimpf, Voigt & Bohné (2026, preprint). AI-assisted goal setting and social accountability. https://arxiv.org/abs/2603.17887
49. (2026, preprint). Optimized but unowned: AI-authored goals. https://arxiv.org/abs/2605.12344
50. Fan et al. (2025). Metacognitive laziness. *BJET* 56. https://doi.org/10.1111/bjet.13544
51. Milkman, Minson & Volpp (2014). Temptation bundling. *Mgmt Sci.* 60(2). https://doi.org/10.1287/mnsc.2013.1784
52. Kirgios et al. (2020). Teaching temptation bundling. *OBHDP* 161. https://doi.org/10.1016/j.obhdp.2020.09.003
53. Scullin et al. (2018). Bedtime writing and falling asleep: to-do lists vs completed lists. *J. Exp. Psychol. Gen.* https://doi.org/10.1037/xge0000374 ; Baylor summary: https://news.web.baylor.edu/news/story/2018/can-writing-your-dos-help-you-doze-baylor-study-suggests-jotting-down-tasks-can
54. Behavioural activation for depression: see `game/TOOLS_RESEARCH.md` note 12 (d ≈ 0.74–0.87 vs control).
55. Moodivate pilot RCT (2018), *Behavior Therapy*: https://www.sciencedirect.com/science/article/abs/pii/S0005789418301576 ; larger primary-care trial (MUSC, 2025): https://web.musc.edu/about/news-center/2025/04/14/mood-improving-app
56. Scoping review of app abandonment (2024; median 70% stop within 100 days). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11694054/
57. Apple: `requestWriteOnlyAccessToEvents`. https://developer.apple.com/documentation/eventkit/ekeventstore/requestwriteonlyaccesstoevents(completion:)
58. Apple WWDC24, Bring your Live Activity to Apple Watch. https://developer.apple.com/videos/play/wwdc2024/10068/ ; MacRumors: https://www.macrumors.com/2024/06/13/watchos-11-live-activities-suggested-widgets/

(Reference numbers follow the research notes; gaps are sources consulted but not cited above.)

**Apple platform**
- Foundation Models framework (on-device ~3B model, guided generation, iOS 26, Apple Intelligence devices): https://machinelearning.apple.com/research/apple-foundation-models-2025-updates · https://developer.apple.com/videos/play/meet-with-apple/205/ · https://developer.apple.com/apple-intelligence/acceptable-use-requirements-for-the-foundation-models-framework/
- Controls and App Intents across surfaces (WWDC24): https://developer.apple.com/videos/play/wwdc2024/10157/
- Reminders and Apple Intelligence suggestions: https://support.apple.com/guide/iphone/iphcb580b580/ios · Shortcuts "Use Model" (iOS 26): https://support.apple.com/en-us/125148

**Apps** (many sources are review blogs: indicative, not authoritative)
- Things 3: https://culturedcode.com/things/features/ · https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/
- Todoist Ramble and Assist: https://www.todoist.com/help/articles/dictate-to-add-tasks-with-ramble-P1Raq7vVF · https://www.producttalk.org/building-todoist-ramble-how-doist-turned-voice-braindumps-into-real-time-task-capture/ · https://techcrunch.com/2026/01/21/todoists-app-now-lets-you-add-tasks-to-your-to-do-list-by-speaking-to-its-ai/ · https://www.todoist.com/help/todoist/todoist-and-ai/introduction-to-todoist-assist-KgPP22q5O · Karma: https://www.todoist.com/help/todoist/features/introduction-to-karma-OgWkWy
- TickTick: https://help.ticktick.com/articles/7055782071033135104 · https://www.techradar.com/reviews/ticktick
- OmniFocus: https://support.omnigroup.com/documentation/omnifocus/universal/4.3.3/en/perspectives/ · https://merazoo.com/omnifocus-review-2026/
- Sunsama: https://www.sunsama.com/features/daily-planning-and-shutdown · https://help.sunsama.com/docs/daily-planning · https://help.sunsama.com/docs/weekly-objectives · https://roadmap.sunsama.com/changelog/daily-highlights
- Motion: https://www.morgen.so/blog-posts/motion-vs-reclaim · https://wezebo.com/reviews/motion-planner-review · https://sacra.com/c/motion/
- Akiflow: https://work-management.org/tasks/akiflow-review/ · https://thebusinessdive.com/akiflow-review
- Structured: https://help.structured.app/en/articles/1747650 · https://structured.app/blog/4-0 · https://apps.apple.com/us/app/structured-daily-planner-todo/id1499198946
- Amie: https://www.usecarly.com/blog/what-happened-to-amie/
- Reclaim: https://efficient.app/apps/reclaim · https://lifestack.ai/blog/reclaim-ai-review
- Notion: https://ones.com/blog/notion-as-task-manager-reddit-6-common-workflow-mistakes-discussed/
- Obsidian Tasks / Dataview: https://publish.obsidian.md/tasks/Other+Plugins/Dataview · https://taskforge.md/blog/obsidian-dataview-tasks/
- Forest: https://forestapp.cc/ · https://screentimeindex.com/posts/forest-app-review/
- Focusmate: https://www.focusmate.com/ · https://dl.acm.org/doi/full/10.1145/3689648
- Habitica: https://habitica.fandom.com/wiki/Death_Mechanics · https://habitica.fandom.com/wiki/Cheating · https://github.com/HabitRPG/habitica/issues/5919
- Finch: https://apps.apple.com/us/app/finch-self-care-pet/id1528595748 · https://slate.com/technology/2026/09/finch-app-self-care-wellness-review.html
- Streaks: https://www.fastcompany.com/4010412/apple-app-design-awards-winner-streaks
- Tiimo: https://apps.apple.com/us/app/tiimo-ai-planner-to-do/id1480220328 · https://www.tiimoapp.com/product/ai-planning · https://www.tiimoapp.com/product/widgets-live-activities
- Goblin.tools: https://www.focushack.io/reviews/goblin-tools-adhd-review/
- Llama Life: https://llamalife.co/adhd-to-do-list · Routinery: https://makeheadway.com/blog/routinery/ · Inflow: https://www.choosingtherapy.com/inflow-adhd-app-review/
- Zombies, Run!: https://www.gamesforchange.org/games/zombies-run/ · https://zombiesrun.fandom.com/wiki/Story_Missions
