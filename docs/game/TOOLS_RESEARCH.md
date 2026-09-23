# Tools research: a stress-test of `TOOLS.md`

> Research and proposals for Dan to review. Nothing here changes the design yet. `TOOLS.md` and the other design docs are untouched. If Dan agrees with a proposal, it goes into `TOOLS.md` with a decision entry.
> Written overnight, 2026-09-23 → 24. It covers the tools only. Nothing about the story.

_Status: **awaiting Dan's review.**_

## The short version

The draft is mostly right. The research backs its instincts: no punishment, time-based effort, a record of progress, and lists kept off the opening screen. Five things are worth changing before the first playable:

1. **Close the satchel loophole.** As written, a timer on an easy list earns steps just like the day's main jobs, so tidying a list can quietly replace the avoided job. This is the most important fix.
2. **Make relics count lamps in total, not days in a row.** Research shows that seeing a *broken* streak lowers people's effort afterwards, especially people who blame themselves. Collecting in total keeps everything Dan likes about streaks and removes the moment of loss.
3. **Drop weekly runs.** Keys already reward the week, and a weekly run carries weeks over, which conflicts with "each week starts fresh" (P6).
4. **Protect the 5-minute break.** For Dan, the danger is the break turning into YouTube, not the work session.
5. **The Chronicle *is* the week close.** Merge them, and take "best run" out of it, because it's a comparison.

Details, sources and the rest of the list follow.

---

## Part 1 — What the research says

How much weight each point carries: **[Review]** a meta-analysis or systematic review. **[Study]** one or a few published studies. **[Expert]** clinical advice or theory. **[Company]** a company's own figures (not independently checked). **[Journalism]** press reporting. **[Anecdote]** user reports, reviews and blogs.
Caveat: several sites blocked direct reading, so some figures come from abstracts or search summaries. Numbers that only appear on marketing sites with no traceable source were left out. One widely repeated example is "62% of Duolingo users feel guilty".

### 1a. The apps: what works, what makes people quit, and what turns into admin

| App | What works | Why people quit / what becomes admin |
|---|---|---|
| **Duolingo** (streaks) | Their own tests found that **flexibility drove daily use most** [Company]. Changes that helped: a streak needs only one lesson; up to **two** streak freezes (three were no better, and "trained users to take more time off"); two free freezes when a new streak starts; replacing paid "streak repair" with **Earn Back** (come back and do a few lessons, get the streak back); a gold "perfect streak" with no reward attached, introduced only after day 7. Offering a weekend pass made learners 4% more likely to return a week later.¹ | The goal shifts to the number. People do the easiest lesson at 11:45 pm to "save" the streak, and some quit after losing a long one [Anecdote]². Duolingo optimises for opening the app daily, which is not the same as meaningful effort. |
| **Finch** | A pet you care for; nothing bad ever happens if you skip. Goals can be tiny ("get out of bed"), and on bad days it offers first-aid actions. Neurodivergent and depressed users say it's the first self-care app they kept [Anecdote]³. | An aggressive paywall; "gamification fatigue" once the cosmetics run out; the pet can itself start to feel like a chore [Anecdote]³. |
| **Forest** | A tree grows while you stay off your phone. Instant, visible and self-contained. Pairs naturally with Pomodoro. | Novelty fades after a month or two, and "determined procrastinators learn to ignore dead trees" [Anecdote]⁴. |
| **Habitica** | Turns tasks into an RPG. | Missed dailies cost HP; dying loses a level, gold and gear. A field study found **every participant** hit counterproductive effects: punished during their busiest weeks, and gaming the rules to avoid damage. The more unfair it felt, the faster motivation fell [Study]⁵. The community keeps a whole page on *adapting Habitica for ADHD*, which is admin by definition. |
| **Todoist / Things** | Fast capture; lists that feel good on good days. | **The overdue pile.** "87 overdue tasks within a month"; opening the app triggers shame; people abandon it or declare "task bankruptcy" [Anecdote]⁶. Todoist's karma *drops* for tasks 5+ days overdue [Company]. |
| **Streaks** (iOS) | Simple "don't break the chain". | A missed day can reset to zero, which reviewers call a top reason for quitting [Anecdote]. |
| **Sunsama** | A calm morning plan and an evening "shutdown". | **The ritual is the product**: about 10–15 minutes each morning. For ADHD users with variable days it "becomes its own obstacle, another thing to fail at", and missed days grow a backlog [Anecdote]⁷. |
| **Tiimo / Structured** | Visual day timeline; helps time-blind users *see* the day. Tiimo was Apple's App of the Year 2025. | Heavy setup, sync bugs, clutter: "spent more time fighting the app than using it" [Anecdote]⁸. |
| **Llama Life** | One task on screen with its own countdown. Users call it "Pomodoro on steroids". | Alarms that don't fire with the screen locked; subscription [Anecdote]⁹. |
| **Focusmate** | Timed video coworking with a stranger (body doubling). A person waiting provides "activation energy". | Scheduling friction. The company's "+143% productivity" is its own survey [Company]. |
| **Goblin.tools** | Breaks a vague task into small steps, with a slider for how small. No account, no system to learn [Anecdote]. | — |
| **Amazing Marvin** | 100+ optional "strategies". Those who stay love it. | The first week is "genuinely overwhelming"; configuration *is* admin [Anecdote]. |
| **Zombies, Run!** (story-led success) | Story arrives in short bursts *during* the real activity. Users run because they "want to find out what happens next" [Study]¹⁰. The free tier releases one new mission a week, and seasons are annual. No punishment. Its creator later wrote a book attacking loss-based gamification. | — |

The pattern: the tools people keep are **single-purpose and forgiving** (Forest, Finch, Goblin.tools, Llama Life, Zombies, Run!). The tools people drop **punish misses, pile things up, or need a ritual or setup** (Habitica, Todoist overdue, Streaks, Sunsama, Marvin).

### 1b. ADHD and productivity: the evidence

| Topic | What's known | Strength |
|---|---|---|
| **Time blindness** | Real and moderate to large. People with ADHD judge time less accurately (effect g ≈ 0.4–0.7) and tend to overestimate durations.¹¹ | [Review] |
| **Visual timers** | Widely recommended ("put time where the work is", Barkley). One small trial in children found time aids helped. **No trial in adults.** | [Expert] + one small [Study] |
| **Task initiation / activity scheduling** | Behavioural activation (scheduling meaningful activities) works for depression about as well as CBT (d ≈ 0.74–0.87).¹² This backs the psychologist's advice. But it was studied in therapist-guided treatment, not in an app, and not in ADHD. | [Review] |
| **Body doubling** | In a survey of 220 neurodivergent people, most said a person nearby makes finishing more likely.¹³ Only one tiny controlled experiment exists (12 adults, VR, a preprint). | [Anecdote], weak [Study] |
| **Pomodoro** | Three trials in students without ADHD found fixed breaks no more productive than self-chosen ones; one found more fatigue.¹⁴ **Nothing in ADHD.** Its value for Dan is most likely as a *way to start* ("only 25 minutes"), which matches what he said. | [Study], not ADHD |
| **Streaks and loss** | Seeing an intact streak increases effort. Seeing a *broken* one lowers it, **more so when people blame themselves**, and less when the streak can be repaired.¹⁵ Goals with built-in "emergency skips" produce more persistence, even after failure.¹⁶ When GitHub removed its streak counters, very long streaks disappeared: streaks do drive activity, including token activity.¹⁷ | [Study] |
| **Missing a day** | In a habit-formation study, missing one day did not materially affect forming the habit. Habits took a median of 66 days (range 18–254).¹⁸ | [Study] |
| **Fresh starts** | People are more likely to start goals after "landmarks" (a new week, month or birthday).¹⁹ | [Study] |
| **Lists and overwhelm** | "Choice overload" averages out to about zero across 50 studies, so a long list isn't automatically paralysing.²⁰ But unfinished goals *nag*, and **making a specific plan for them quiets that**.²¹ Pile-up shame is well documented in user reports, and Dan named it himself. | [Review], [Study], [Anecdote] |
| **Plans for when and where** ("if it's Thursday 6 pm, I go to the lesson") | Strong effect on following through (d ≈ 0.65).²² In children with ADHD they improved self-control in a lab task. | [Review]; ADHD evidence is lab-only |
| **Rewards and novelty** | People with ADHD prefer rewards that come sooner (small to medium effect).²³ Gamification effects **dip at about 4 weeks**, then partly recover as people get used to the system.²⁴ Fitocracy users enjoyed it less the longer they used it.²⁵ Rewards that feel like *payment* can undercut interest; feedback and meaning don't.²⁶ | [Review], [Study] |
| **Apps for ADHD / mental health** | Of 109 ADHD apps reviewed, none had peer-reviewed evidence of effectiveness. Digital interventions show small effects overall. The median mental-health app keeps **under 4%** of users after 15 days.²⁷ | [Review] |
| **After a lapse** | Students who forgave themselves for procrastinating procrastinated less next time. Self-compassion after failure increases the effort to improve.²⁸ All-or-nothing rules invite "what the hell, I've already broken it".²⁹ | [Study] |

### 1c. Gamified productivity apps that failed, and why

- **Novelty wore off.** Points, levels and loot peak within weeks (Fitocracy study, the gamification novelty dip; Habitica users: "the thrill faded… it felt like another chore").²⁵ ²⁴
- **Punishment misfired.** Habitica punished people in their most productive weeks and taught them to cheat their own system.⁵
- **Social guilt.** Party damage and sad mascots turned accountability into anxiety (Habitica, Duolingo) [Anecdote].
- **The metric replaced the goal.** Streak-saving with token actions (Duolingo, GitHub).¹⁷
- **Logging became a job.** One long-time Habitica user quit when he realised he needed a daily task just for updating Habitica [Anecdote].
- **Business death**, whatever the design: Mindbloom's Life Game (1M users) vanished after an acquisition; EpicWin stalled; Nike's FuelBand was cut. Habitica's Tavern and Chore Wars were closed by the cost of moderating public chat [Journalism/Company]. *Not a risk here*, because this game has no market or social layer. It's a reason Dan's game has one advantage those didn't.

**What the survivors share:** a story people want to continue (Zombies, Run!), care with no loss (Finch), loss that is tiny and contained in one session (Forest), and a single clear job (Goblin.tools).

---

## Part 2 — Section-by-section critique of `TOOLS.md`

### The P16 rule
**Strong.** "Moves the world, never makes a pile, debt or red number" is exactly the line between the apps people keep and the ones they drop. **One gap:** it doesn't mention *substitution*: a tool must also never let an easy thing stand in for the avoided thing (P5). See the satchel below.

### 1. The delve (timer)
**Strong:**
- It builds on what already worked for Dan ("I just followed the timer").
- Movement instead of a countdown, and phone-down, both match what users love about Forest.
- Partial minutes counting is Duolingo's "flexibility wins" lesson.
- No death mechanic is right: Forest's dead tree works for some people, but a shame-prone player is the wrong one for it.

**Likely to backfire for Dan:**
- **The break, not the work.** A 5-minute break that invites "a glance" at the phone is where YouTube wins, and Dan's stated competitor is the phone on the couch. The camp beat needs a clear end and an obvious "next delve" (proposal 4).
- **"Four in a row"** is an all-or-nothing rule in disguise. An interrupted third session (a delivery, a call) loses the deep chamber. With ADHD, interruptions are the norm (proposal 6).
- **Unclear double-counting.** Does a delve on a main job earn a step *and* the job's step? `CORE_LOOPS.md` says steps come from main jobs, and from sessions *after* day complete. `TOOLS.md` says "each finished delve = a step". These need reconciling (proposal 1 does it).
- **Practical:** the delve's end must be heard or felt with the phone locked and away. The most common Llama Life complaint is alarms that don't fire. This is a requirement to carry into Phase 7, not a design change.

### 2. The satchel (lists)
**Strong:**
- On request only, never on the opening screen.
- No counts; quiet drift to *someday*.
- Pasting a whole list at once.
- A brain-dump has real value: writing a plan for unfinished things quiets them.²¹

**Likely to backfire:**
- **The loophole (most important).** "Working a list = a delve on the list… the delve earns the step." Before day complete, that makes an easy list (sort the cables) earn the same as the avoided main job (call the vet). On a middling day Dan will, very reasonably, do the list. This is the productivity-app trap: busy, not moving. It breaks P5 and the spirit of rule 10.
- **Someday is still a pile.** It's just a pile one tap further away. If Dan ever opens it, he sees months of unmet intentions: the Todoist graveyard.⁶
- **Groups are admin.** Naming and sorting groups is configuration (the Marvin problem). Useful later, perhaps; not in the first playable.
- **The morning suggestion drawing from the satchel** could keep re-offering the same avoided item every day. That's a nag by repetition.
- **A long list on screen** on a low day is a "field of obligations" (Dan's own words), even when he opened it himself.

### 3. Plotting
**Strong:** the best-evidenced idea in the draft. Planning *when and where* is one of the most reliable effects in behaviour science,²² and it fits activity scheduling.¹² "Goes quietly back" and asking only once is right.

**Risks, smaller:**
- A future day filling up with waypoints becomes a Sunsama-style plan to live up to.
- "Move it?" asked by notification would be a guilt engine.
- The landmark for reaching a plotted waypoint rewards *keeping the plan*, so a plot that passes leaves a visible absence. That's mild, but worth knowing.

It's already deferred past the first playable, which is right.

### 4. Calendar link: is it common, and how hard?
It's common: Sunsama, Structured, Tiimo and Todoist all read Google Calendar. There are two routes. **Reading only** is the easy one. Google gives every calendar a private "secret address", which Dan would paste into the app once. The app then reads his appointments from it. It's small to build, but that address works like a password. **Two-way** (writing waypoints back into his calendar) needs a proper "Sign in with Google". That's a moderate job: calendar access counts as sensitive to Google, and a private, unpublished app has to be signed back in about every 7 days unless it goes through Google's review. So: reading is easy, writing is a moderate chore. Phase 7 should start with reading only.

### 5. Runs (streaks)
**Strong:**
- Low days and rest count.
- One missed day is forgiven, which matches Duolingo's evidence and the "emergency skips" studies.
- Lit lamps and relics are never lost.
- No "streak lost" message.
- Runs are tied to day complete, so a token action can't feed them. That fixes Duolingo's one-lesson loophole.

This is already one of the most forgiving streak designs anywhere.

**Likely to backfire for Dan specifically:**
- **The reset still happens, just silently.** After two bad days, Dan opens the app to "the first lamp of a new path". He will notice. The research is clear that a visibly broken streak lowers effort, *most for people who blame themselves*.¹⁵ Dan's bad days already involve self-criticism, and the reset lands exactly when he is lowest. Quietness doesn't remove the loss; it just doesn't mention it.
- **Milestones at 7, 14, 30 and 60 days create "almost there" pressure** on days 6, 13, 29 and 59. That's the pull behind Duolingo's 11:45 pm lessons. Tied to day complete, it would push Dan to finish a day he should have let be a rest day. Marking the day *rested* to protect a run also turns rest into a tool, which quietly breaks P12.
- **Two misses can come from one bad weekend or one migraine.** Duolingo found people who were away for three days became unlikely to return. The run is most likely to end right when a warm welcome back matters most.
- **Weekly runs** duplicate Keys, and they carry weeks over, against P6 ("each week starts fresh; misses never carry over").
- **Three consistency systems** (weekly targets, daily runs, weekly runs) are more than one person needs. Rule 12: earn complexity.

### 6. The Chronicle
**Strong:** probably the highest-value, lowest-risk tool here.
- Evidence of progress on low days fits self-compassion research.
- It's automatic, so no admin.
- It has no stats.
- The Zombies, Run! lesson applies: the record of *his* expedition sits beside the story.

**Risks:**
- **"The best run is kept in the Chronicle"** is a comparison, the thing the section says it avoids.
- **A thin week will produce a thin page.** If page length reflects output, the Chronicle becomes a bar chart made of prose.
- **It overlaps the week close** in `CORE_LOOPS.md` (the 20-second Sunday-night recap). Two weekly summaries is one too many.

### Collection, and the first-playable list
**Fine.** One collection, nothing bought, nothing random.

One caution for the test: gamification effects dip at about **week 4**,²⁴ and the planned test is 3–4 weeks (D-013). It will end *at* the dip, and could read a normal novelty dip as failure. See proposal 9.

---

## Part 3 — Proposed changes, ranked by value

| # | Change | Why | Cost |
|---|---|---|---|
| **1** | **Satchel delves earn steps only when the item is one of the day's main jobs, or after day complete.** Before that, ticking satchel items feels good (a sound, a line in the Chronicle) but doesn't move the expedition. Same rule for any delve: during the day, *main jobs* move the world; the delve is how you do them. | Stops the easy list replacing the avoided job (P5, rule 10). Also settles the double-counting question. | Tiny: a rule, not a feature |
| **2** | **Relics come from lamps lit in total** (e.g. a relic at the 7th, 15th, 30th and 50th lamp ever lit), not from days in a row. The path of lamps stays. After a gap, the new path **branches from the last lit lamp** rather than starting a new one, so it looks like a route that turned, not a line that snapped. If Dan wants a days-in-a-row number, it's a quiet detail, not the main thing shown. | Keeps what Dan likes (lighting the next lamp, milestones, relics) and removes the moment of loss that the research says hurts self-blaming people most.¹⁵ Rest-marking no longer "protects" anything, so rest stays unscored (P12). | Small; simpler than the draft |
| **3** | **Drop weekly runs.** Keys already reward each week. | P6: weeks start fresh. Rule 12: one consistency system per timescale. | Removes work |
| **4** | **Protect the break.** The camp beat is **short and self-ending**: the find is shown, then the camp packs up and the obvious button is "next delve" or "done for now". Nothing to scroll or browse, and a gentle sound when the 5 minutes are up. | The break is where the phone wins. | Small |
| **5** | **Merge the Chronicle into the week close.** One weekly page, written automatically. Remove "best run". **Low weeks get a different *kind* of page** (a camp, a hard crossing, a rest), not a shorter one. | No duplicate recaps; no comparison; no bar chart made of prose. | Small; removes a duplicate |
| **6** | **A deep delve = four delves in one sitting, with short gaps allowed** (e.g. up to ~20 minutes between them), rather than strictly back to back. | Removes an all-or-nothing rule. Interruptions are normal with ADHD. | Tiny |
| **7** | **Satchel hygiene for the first playable.** The satchel shows the first handful of items, with the rest folded away ("and more"). Groups come later. An item Dan swaps away twice isn't suggested again for a week. *Someday* has no count and is only shown if searched for, or when a good day's suggestion pulls from it. | Keeps lists useful on good days without turning into a field of obligations or a graveyard. | Small |
| **8** | **A shorter starting delve.** After "I can't start" and the tiny step, the offer to continue can be "10 minutes?" instead of 25. Minutes count towards the job as usual; a step still needs the full delve, so nothing becomes farmable. | Pomodoro's value for Dan is *starting*. A smaller first commitment is the same trick, one size down. | Small |
| **9** | **Test note, not a design change:** read the first-playable results knowing novelty dips at about week 4. If possible, run the test 5–6 weeks, or at least don't judge on week 4 alone. | Avoids mistaking a normal dip for failure (rule 14). | None; Dan's call (it touches D-013) |
| **10** | **Plotting, when it comes:** "move it?" is asked only when Dan opens the app, never by notification. Only a few waypoints show ahead (say, the next 7 days), so it never looks like a filled-in calendar. | Keeps plotting the evidence-backed light version, not Sunsama. | Tiny, and later |

**Dan's call:** proposal 2 changes something Dan explicitly asked for (streaks). The research points one way, but he knows how streaks feel to him. The question for him: *"Would lamps counted in total, with relics at lamp milestones, feel as good as days in a row? Or do you want the days-in-a-row number to be the main thing?"*

---

## Part 4 — Missing tools worth considering

Checked against P16 (moves the world; no pile, debt or red number) and the anti-features.

1. **A companion at work during the delve** (body doubling without people). While a delve runs, someone in the world is visibly working alongside the expedition: a figure at the dig, a light in the next chamber. It could come with optional ambient sound. It's cheap, it fits "don't watch the screen", and it has no social features. **Evidence is weak** (self-reports only),¹³ so it's a thing to try, not a promise. **Recommended as a small addition** to the delve, once Phase 3 knows who that figure could be.
2. **"Make it smaller"** (Goblin.tools-style breakdown) for a satchel item or job that feels too big: one tap gives a first concrete step. Users praise this as one of the few tools that just works. **Not for the first playable:** doing it for any item Dan types would need AI, and "AI-written anything" is out for now. The hand-made "I can't start" tiny step already covers the core need. **Revisit later.**

Considered and **not** recommended:
- a Tiimo-style visual timeline of the day (it's time-blocking under another name, and heavy setup);
- a Sunsama-style daily plan or shutdown ritual (the ritual becomes the obstacle);
- Forest-style "tree dies if you leave" (loss mechanics are wrong for Dan);
- streak freezes as items to collect or spend (that becomes a currency, which D-012 rules out, and proposal 2 makes them unnecessary).

---

## Sources

1. Duolingo retention lead Jackson Shuttleworth on Lenny's Podcast (transcript): https://github.com/ChatPRD/lennys-podcast-transcripts/blob/main/episodes/jackson-shuttleworth/transcript.md · Duolingo blog: https://blog.duolingo.com/improving-the-streak · https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/
2. https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification · https://talentandsarcasm.substack.com/p/i-rage-quit-duolingo-today
3. https://www.audhdflourishing.com/post/finch-adhd-self-care-app · https://habitbox.app/blog/finch-app-review
4. https://www.selfpause.com/resources/forest · https://forestapp.cc/
5. Diefenbach & Müssig (2019), *Int. J. Human-Computer Studies*: https://www.sciencedirect.com/science/article/abs/pii/S1071581918305135 · https://habitica.fandom.com/wiki/Adapting_Habitica_for_ADHD
6. https://thawly.ai/reviews/todoist-for-adhd · https://betterlateadhd.substack.com/p/your-to-do-list-is-lying-to-you · https://support.todoist.com/hc/en-us/articles/206209959-Karma
7. https://www.sunsama.com/features/daily-planning-and-shutdown · https://blog.rivva.app/p/best-sunsama-alternatives-for-adhders
8. https://www.selfpause.com/resources/tiimo · https://blog.saner.ai/structured-review/
9. https://www.focusbear.io/blog-post/review-of-llama-life-by-an-audhder
10. Farič et al. (2021), *Games for Health Journal*: https://pubmed.ncbi.nlm.nih.gov/34813376/ · https://medium.com/@adrianhon/how-we-made-an-app-store-subscription-success-25f4ea75500f
11. Zheng et al. (2022): https://journals.sagepub.com/doi/abs/10.1177/1087054720978557 · https://www.tandfonline.com/doi/full/10.1080/87565641.2023.2293712
12. Cuijpers et al. (2007): https://www.sciencedirect.com/science/article/abs/pii/S027273580600136X · Ekers et al. (2014): https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0100100
13. Eagle et al. (2024), *ACM TACCESS*: https://dl.acm.org/doi/full/10.1145/3689648 · VR preprint: https://arxiv.org/abs/2509.12153
14. Biwer et al. (2023): https://pubmed.ncbi.nlm.nih.gov/36859717/ · Smits et al. (2025): https://www.semanticscholar.org/paper/defa071a4ae9da869677deb1df8d9c0d503cf7f3
15. Silverman & Barasch (2023), *Journal of Consumer Research*: https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414
16. Sharif & Shu (2017, 2019): https://journals.sagepub.com/doi/10.1509/jmr.15.0231 · https://www.sciencedirect.com/science/article/abs/pii/S0749597818304187
17. GitHub streak removal (natural experiment): https://arxiv.org/pdf/2006.02371
18. Lally et al. (2010): https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674
19. Dai, Milkman & Riis (2014): https://pubsonline.informs.org/doi/10.1287/mnsc.2014.1901
20. Scheibehenne et al. (2010): https://academic.oup.com/jcr/article-abstract/37/3/409/1827647
21. Masicampo & Baumeister (2011): https://users.wfu.edu/masicaej/MasicampoBaumeister2011JPSP.pdf
22. Gollwitzer & Sheeran (2006): https://www.researchgate.net/publication/37367696 · Gawrilow & Gollwitzer (2008): https://link.springer.com/article/10.1007/s10608-007-9150-1
23. Marx et al. (2021): https://journals.sagepub.com/doi/10.1177/1087054718772138
24. Rodrigues et al. (2022), novelty and familiarisation effects: https://link.springer.com/article/10.1186/s41239-021-00314-6 · Hamari et al. (2014): https://www.researchgate.net/publication/256743509
25. Koivisto & Hamari (2014), Fitocracy: https://www.sciencedirect.com/science/article/abs/pii/S0747563214001289 · https://www.androidpolice.com/gamifying-daily-habits/
26. Deci, Koestner & Ryan (1999): https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf
27. ADHD app review: https://www.sciencedirect.com/science/article/abs/pii/S138650561830323X · Baumel et al. (2019): https://www.jmir.org/2019/9/e14567/
28. Wohl, Pychyl & Bennett (2010): https://www.sciencedirect.com/science/article/abs/pii/S0191886910000474 · Breines & Chen (2012): https://journals.sagepub.com/doi/abs/10.1177/0146167212445599
29. Herman & Polivy (1975), the "what the hell" effect: https://en.wikipedia.org/wiki/Counterregulatory_eating
- Google Calendar secret address: https://support.google.com/calendar/answer/37648 · Google sign-in expiry for unpublished apps: https://developers.google.com/identity/protocols/oauth2
- Failed apps: Mindbloom https://www.linkedin.com/pulse/whatever-happened-successful-lifegame-mindbloom-marc-van-der-heijden · Nike FuelBand https://www.engadget.com/2014-04-18-nike-fuelband-team-fired.html · Chore Wars https://www.chorewars.com/news.php · Habitica Tavern https://habitica.fandom.com/wiki/Tavern_and_Guild_Shutdown_FAQ · Yu-kai Chou on "black hat" gamification https://yukaichou.com/gamification-study/white-hat-black-hat-gamification-octalysis-framework/ · Bogost https://bogost.com/writing/blog/gamification_is_bullshit/
