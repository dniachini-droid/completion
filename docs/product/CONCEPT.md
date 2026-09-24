# Concept — *The Long Answer*

> The one agreed concept, written up whole (Phase 5, D-042). Nothing here is new: every line comes from an agreed doc, linked where the detail lives. Headings follow MASTER_BRIEF §59.
> **Spoiler-free: Dan reads this.** Story content is limited to what the open game bible says (`narrative/GAME_BIBLE.md`, D-015).
> Words: the app's in-world names are used (the Quiet, marks, a delve); the design words are in `narrative/TERMINOLOGY.md`.

_Status: step 1 of `PHASE5_PLAN.md`, written 2026-09-24. Stress-tested (step 2, `product/STRESS_TEST.md`): the gaps it found are closed by the small rules of D-043, folded in below. Numbers to come (step 3)._

---

## In one paragraph

A single-player game for Dan, on his phone, in which **real hours of real life are the only way to move**. Under a hill there is a quiet place that was not made by us, cut all over with a script that does things when it is read. Every real job Dan does (the gym, the Spanish lesson, the course, the cat's medication) takes him further down into it. What he finds there is written in marks he slowly learns; marks combine into words that are powers and open doors; and the records turn out to be the linked lives of people from different ages who came down before him, converging on one mystery with a fixed answer. A low day still arrives somewhere. A great day goes much deeper. Nothing is ever lost, nothing piles up, and the app is always kind, however dark the story.

Working name of the loop: *Explore · Decode · Connect* (D-010). Story: *The Long Answer* (D-016, D-024). Look: direction D (D-032, D-040). App name: open (`narrative/NAMES.md`).

---

## 1. The player fantasy

> "Every real hour takes me further into a sealed place, and what I find there is written in a script only I am learning. The records are the lives of people from different ages, and slowly I see they are one story." (`game/CORE_LOOPS.md` Part 4)

Why this fantasy, for Dan (`PLAYER_MODEL.md`):
- **Discovery and grandeur**: the Temple of Time, Stargate, alien civilisations. The Quiet is vast, old and not human.
- **A new, mysterious power** is the reward he values most. Here, every power is a word he has learned to cut.
- **Linked lives across time** was his favourite part of *Eternal Darkness*. The records are exactly that.
- **"Repetition is fine so long as it's for a goal I can see."** A sealed door in view, showing what it needs, is always on screen.
- **"The darker the better"**, with an app that is never harsh with him (P14).

It is a genuine game, not a productivity app with an RPG skin: the tools (timer, lists, the weekly page) exist inside the world, and each one moves or reveals something there (P16, `game/TOOLS.md`).

---

## 2. A day of use

A normal day, as it plays (detail: `game/CORE_LOOPS.md` Part 4 → "The daily loop"; screens: `design/INTERACTION_NOTES.md`).

| When | What Dan sees and does | Time in app |
|---|---|---|
| **Morning** | The Lamp Hall, painted full-screen in violet light. Where he stands, one plain sentence about the sealed thing ahead, capacity (Low / Normal / High) already suggested from last night's bedtime. **One** next job with a short teaser, **Begin** and **Swap**. Today's other jobs as quiet rows. "I can't start" one tap away. Nothing else: no backlog, no counts (P1, P7, D-038). | seconds |
| **A desk job** (the course) | Begin opens the run screen already set from the job ("2 delves of 25"). One more tap. A glowing ring fills while the expedition visibly travels; the phone goes away. A breather of 5 minutes ends by itself; inside a run, the next delve starts by itself (D-037). Interrupted? **Step away** holds it; **Finish here** counts every minute (D-036). | a tap per run |
| **A job away from the phone** (the gym) | Begin marks it under way. He goes. **Done** on return plays its steps by the job's usual length (the gym's hour ≈ 2.4 steps, D-037). Any job can be a delve instead; Dan's choice (D-041). | seconds |
| **Coming back** | The step plays (20–40 s): the map extends, often a small find or a line of script. At most one small choice (which way; which record). Out. An avoided job always brings a **find**, never just a corridor (P5). | under a minute |
| **Stuck** | "I can't start": a teaser from just ahead (a line one mark short of meaning, a sound behind a door), then one tiny physical step ("put your gym shoes on"), then "10 minutes?". Never a demand; never new story (P4, D-038). | seconds |
| **Day complete** | Violet turns to gold from the floor up. "That's the day. Enough." The arrival: wherever the day's steps reached, a named place on a long day, a camp with a view on a short one. The day's success is **locked in**. Rest is the main offer; a quiet "Keep going" is always there (D-038, D-039). | a few seconds |
| **Evening** | **Camp**, by the lamp. A short wind-down. Going to bed by his chosen time means something is waiting in the morning; missing it removes nothing. Bedtime sets tomorrow's suggested capacity (P11). | seconds |

**The day's edge** (D-043): the app's day runs until about 4 am, so late work counts to the day it belongs to. Capacity and Swap work at any time until then; done jobs stay done, and lowering capacity can complete the day.

**Low day:** two jobs (by default, outside and a real meal; any two small real things, D-038). A short, safe push that still arrives. The screen is calm; its main button is resting.

**High day:** up to five jobs, plus open-ended delves after day complete, with **no daily cap** (D-011). A **deep push** can be called in the morning: a route to places a normal day doesn't reach (deeper chambers, rarer records, sometimes part of a mark). On any day, "Keep going" after day complete leads there too (D-043). Four delves in one sitting (a **long delve**) reach a side chamber. Effort is never turned away (D-039).

**Rest day:** a camp day. A scene, no step, no cost, never scored (P12).

**Sunday night → Monday:** the week closes itself. The **daybook** writes a short page from what he actually did, and shows next week's biggest sealed thing. No planning needed, no Sunday meeting (`game/TOOLS.md` §6); one quiet "Plan next week?" offer at most. **Planning the week is optional** (`game/PLANNER.md`, D-048): "Plan my week" lays out Dan's rhythms, he changes what looks wrong, and Today starts from the plan with capacity on top. The plan is a forecast, not a promise.

---

## 3. The core loop

```
real job done ─► a step into the Quiet ─► something is there (a passage, a door, a record)
      ▲                                              │
      │                                  one small choice (which way; which record;
      │                                  which word to try on a door)
      │                                              │
 want the next real action ◄─ a new question ◄─ decode ► a line of a life ► it links to another
      ▲                                                                                │
      └──────────── a sealed thing ahead you can see, and what it needs ◄──────────────┘
```

**Three sizes of reward** (`game/CORE_LOOPS.md` Part 4):

| Size | Earned by | What it gives |
|---|---|---|
| **Step** | every 25 minutes of real effort, in proportion (D-037) | the map extends; often a small find or a line of script |
| **Arrival** | day complete | a place (or a camp with a view), and usually a record's line to decode |
| **Key** | each weekly target met; each milestone of a big project | opens something **already seen and sealed** |

**What opens what (D-013).** Every sealed thing shows what it needs: a **Key** (earned by living the week), a **word** (earned by learning), or, for the great doors, both.

**Time speeds the place, never the story** (D-037). Steps come from minutes; marks, words and the core reveals come in a fixed, authored order, paced by days and Keys (D-035). Extra effort always meets more place and side content (passages, finds, extra records), never a wall.

**Anti-farming is structural, never admin** (`game/QUEST_SYSTEM.md`): every delve minute moves Dan, on any job, but only today's jobs fill the day and complete it; a job without a timer moves him only as one of today's jobs, so ten tiny entries earn nothing extra; time can't be split; nothing ever slows: staying on one job keeps full progress, and switching kinds after about 2 hours on one brings a find (D-044); Keys come only from Dan's own rhythms and one-tap milestones, and more rhythms never raise the week's Key supply (D-047); a change to a target applies from next week. No verification: the honour system is enough.

**Keys are never held** (D-043): each opens something the moment it's earned (the sealed thing Dan last looked at, or the nearest on his route), and one that takes a Key is always in view.

---

## 4. The story (player-safe)

From the open game bible (`narrative/GAME_BIBLE.md`, approved D-024). The answers are sealed and fixed before any clue is planted (rule 6, D-015).

- **The Quiet.** A dry, cut-stone descent under a hill, not made by us. Long high halls rounded like the inside of a shell. Lamps cut in the walls wake when the right word is cut nearby. Doors answer words; locks fill with time. Nothing rots; nothing waits.
- **The Cut.** The script. Marks are concepts, not letters (the mark for *lamp* contains *fire*). Names are ringed. Two to four marks cut together make a **word**, and a word is a power because the place obeys it. Cutting one is a short fixed ritual, the same in week two and month twelve.
- **The readers.** Five or so people from different, never-named ages found the place by accident and each learned a few marks: a salt-cutter, a surveyor, an engineer, a woman who read the engineer's log. A chorus of single witnesses leaves one fragment each. A family of objects passes from hand to hand across the ages and ends in Dan's.
- **The figure.** Tall, courteous, very good at waiting. Present in every age's records under a different name.
- **Dan** is the latest to come down. The lamp is already lit. There is no oil in it.
- **Shape**: the place answers → everyone met him → what the makers left → what he wants → the bottom. Dan knows roughly what's coming; the details are the surprise. It has a fixed ending.
- **Tone**: dark, cosmic, patient; the people in the records ordinary, concrete and often funny. **Everyone in the records is finished**: nobody waits on Dan, nobody needs rescuing, nothing gets worse while he's away. Progress is excavation.

**How story reaches him:** in lines short enough to read in under a minute, at arrivals and Keys, never as a task. "I can't start" uses a teaser from just ahead, never new story. A small, planned second story pass comes after the playtest, and a sealed fix session runs before the build (D-035); neither changes anything Dan already knows.

---

## 5. Collection

**One collection: finds** (`game/COLLECTIONS.md`, `game/TOOLS.md` §5). They come from three places:
- **avoided jobs** (admin, Spanish, housework, costly one-offs always turn a step into a find). "Avoided" is a mark on the job: pre-set for admin, Spanish, housework and every typed one-off, turned on quietly for a job Dan keeps swapping away, and his to change (D-043);
- **long delves and deep pushes** (a side chamber, a deeper route);
- **cairns**: each day complete leaves a small stack of stones on the route. Finds come at about the 7th, 15th, 30th and 50th cairn **ever placed**, not days in a row. After a gap the cairns turn off in a new direction; they never visibly break, and no count of days in a row is shown (D-023, D-038).

Every find belongs to the world's truth and can be read with the Cut. No shop, no random loot, no rarity tiers, nothing to spend (D-012).

The real collection, and the one Dan cares about most, is **the marks and words** themselves, and the web of lives they unlock (section 6).

---

## 6. Progression

Three axes, **none of them a number on screen** (`game/PROGRESSION.md`, D-012):

| Axis | Grows by | What changes |
|---|---|---|
| **The Quiet** (map) | steps and arrivals | new places, routes and sealed things become visible: somewhere to want to go |
| **Marks → words** | Keys; some arrivals and records | more records become readable; old records **re-read** differently; words open doors, wake lamps, reach new parts of the place |
| **The web of lives** | decoding records | links appear between people and events across ages; the central mystery takes shape |

They feed each other: the place leads to records, records teach marks, marks make words, words open more place.

**Guessing, not typing** (bible): a new mark arrives with context and three or four candidate meanings. Dan picks one; it shows with a question mark wherever it appears until the place confirms it. He's never told he's wrong. Small **open cells** on the walls take any two marks and answer with one line: a language he can speak, not only read.

**Pacing** (starting points, tuned in play): the first word in **week 2–3** (D-013); then marks at about 1–2 a week, words about one a month. A great day can give **part of a mark**; the next Key finishes it, never ahead of the story's order.

**Deliberately absent:** XP, levels, HP/MP, attributes, skill trees, stat gear, currencies, reputation bars (D-012, `game/ECONOMY.md`). Capacity (Low / Normal / High) does HP/MP's one useful job.

**Large projects** (the 24-week course; restarting Spanish lessons) are **great doors** visible from far off. Each real milestone, confirmed with one tap, is a Key towards them. The fiction amplifies the real achievement and never makes it look small.

---

## 7. The real-life connection

Real action is the main input, and the only thing that moves the world (rule 8, P16).

- **The unit of effort:** one step = 25 minutes of real effort. Delve jobs count their minutes; other jobs count their usual length, which Dan sets (D-037).
- **"Enough" is small and defined** (P2): about 3 main jobs on a normal day, 2 on a low day. Day complete locks the day in.
- **Capacity sizes the day, never whether it can succeed** (P3). Suggested from bedtime; one tap to change.
- **Aimed at what's avoided** (P5): the morning suggestion leans towards admin, Spanish, housework and costly one-offs, and those bring richer rewards. One hour of course work counts as done, so the absorbing thing can't crowd out the avoided ones.
- **Weekly rhythm, not streaks** (P6): Dan's rhythms (currently gym 4×, Spanish study 2× plus the Thursday lesson, course 4× with 3 hours of room and enough at 1, tank clean fortnightly, Sunday meal prep; `game/PLANNER.md`) fill themselves from completed jobs, on plan or off; each met is a Key, within the week's bounded supply (D-047). Weeks start fresh. **No catch-up avalanche**: open targets never add jobs or raise the day's size (D-038).
- **Everything about jobs is Dan's to edit**: kinds of job, targets, usual lengths, which jobs are delves. The names in these docs are examples (D-030, D-041). **Editing never becomes admin** (D-043): only on request, never prompted; only a name is required; every field has a default (a usual length of 25 minutes, one step); a job is edited from its own row; the first playable starts preloaded with Dan's current jobs and targets.
- **Tools inside the world** (`game/TOOLS.md`): the **delve** (the focus timer), the **satchel** (lists, on request, never on the opening screen; untouched items sink to the bottom quietly; dated items are suggested as the date nears), **cairns** (the non-punitive trail), the **daybook** (the week close). Later: waypoints (light plotting) and a read-only calendar link. Using a tool on its own earns nothing (D-038).
- **Absence:** "where you were" (last place, the door he was looking at, one unfinished record) and one small welcoming step, a real job suggested at Low size; doing it plays the welcome (D-043). No counts, no summary of what was missed, no daybook page for an empty week, and at most one passed-date question a day, none on the first day back. Dust has settled; nothing has broken.
- **Life stays larger than the app** (P15): sessions are in, started, out. It complements the activity scheduling his psychologist recommended; it is not treatment.

---

## 8. Strengths

- **Every reward is story or power**, which is what Dan plays for. No grind for its own sake.
- **A goal he can see** at all times: a sealed thing that shows what it needs.
- **Low floor, high ceiling** (D-011): a two-job day fully succeeds; a ten-delve day is rewarded in full, with no cap.
- **Failure costs nothing** (rule 9): no streak to break, no debt, no red, no one waiting. Hard weeks become lighter weeks.
- **Re-reading** turns foreshadowing into a mechanic: "that was there the entire time".
- **Content load is manageable**: the place gives systemic beats (passages, doors, routes) cheaply; authored prose is needed only at arrivals and Keys (`game/CORE_LOOPS.md` → "Content load").
- **Beauty**: direction D, a full-screen painted world that is never still, with a precise interface on top (`design/DESIGN_SYSTEM.md`).
- **The tools Dan asked for** (timer, lists, a weekly record) are part of the game, not a tab beside it (D-020).

---

## 9. Risks

What could make this fail, and where it is handled (or still open). Step 2 walks through these in detail.

| Risk | Current answer | Status |
|---|---|---|
| **The core bet fails**: wanting to go further in doesn't make Dan start things (rule 14) | The first playable exists to test exactly this, over 5–6 weeks, not judged on week 4 (D-013, D-023) | Test |
| **Story in tiny pieces is forgotten** over months | Memory and recap system; a before → now re-read view (D-035) | **Step 3** |
| **Rewards feel thin or uneven** some days or weeks | A guaranteed reward rhythm per delve, day, week (D-035) | **Step 3** |
| **A great day feels wasted** because marks are paced | Extra effort always unlocks something real: side content, finds, extra records (D-035, D-039) | **Step 3** |
| **Not enough place for Dan's real hours** before the next seal | Open route past every opened place sized for his hours (D-037, D-039) | **Step 3** |
| **It becomes reading homework** on a low day | Lines are short; the low day's main button is rest, not reading | Test (D-035) |
| **The app becomes the new YouTube** (P15) | Nothing moves without real action; nothing to do in the app otherwise | Watch in play |
| **Editing jobs and targets becomes admin** (D-030) | On request only, defaults everywhere, preloaded (D-043) | Closed |
| **A bad early fortnight stalls the first word** (no targets met → no Keys) | A weekly floor in the reward rhythm | **Step 3** |
| **Novelty dips around week 4** | Judge over 5–6 weeks; the first word lands in week 2–3 | Test |
| **The dark tone weighs on a low day** | Kind voice (P14); calm low-day screens | Test |
| **The app's lines sound AI-written** | Language pass on every line before the build (D-031) | Phase 5–6 |
| **The late story seems to promise a choice it can't keep** | Sealed story-fix session before the build (D-035) | Own session |

---

## 10. Longevity

Story is why Dan plays, and he stops when it ends (player model). So the design plans for a year and unfolds systems slowly (`game/CORE_LOOPS.md` → "The long-term loop"):

| When | New to Dan |
|---|---|
| Week 1 | The Quiet, steps, arrivals, one record, one door in view |
| Weeks 2–4 | The first marks; decoding; the first Key opens something; route choices; **the first word** |
| Month 2 | More words to try on doors; two records turn out to describe the same event from different ages |
| Month 3 | Re-reading changes an old record's meaning; deep pushes lead somewhere important |
| Months 4–6 | A second region that reframes the first; the first major revelation about who the readers were |
| Months 6–12+ | The lives converge on the central mystery; big real milestones open the largest doors |

The story is written, sealed and reviewed to the end of the first year (D-016 to D-019, D-024). Rough content rate for a year: ~250 arrivals (perhaps half with a record's line) and up to ~250 sealed things for Keys. The story has a fixed ending; what comes after it is not designed yet, deliberately (D-004).

---

## 11. How hard it is to build

Honest shape, for Phase 6–7 (no tech choices here; D-004, CLAUDE.md).

**Simpler than it looks:**
- **No economy**: no currencies, shop, inventory maths or levels (D-012).
- **Deterministic rules**: steps from minutes, Keys from targets, authored order for marks. No AI-written story (anti-features).
- **One player, one phone**, no social features or accounts beyond Dan's own (MASTER_BRIEF §78).

**The real work:**
- **Authored content**: records, lines, marks, words, finds, each tied to the sealed truth. The first playable needs about 5–6 weeks of it (D-023); week 6 of the sealed clue ledger is still to finish.
- **The painted world and its motion**: direction D's full-screen scenes, ambient life on every screen, two cinematic moments (cutting a word; the arrival). The look is set; the build must keep it (D-040).
- **The map** at three zoom levels, growing by about one named place per working day (`design/INTERACTION_NOTES.md` → "The map").
- **The delve timer** must be heard or felt with the phone locked and away (a Phase 7 requirement), and state must survive restarts and interruptions (held delves, D-036).
- **The morning suggestion**: choosing today's jobs from the pool, leaning towards the avoided, learning quietly from swaps (`game/QUEST_SYSTEM.md`).
- **Data Dan owns and edits**: jobs, targets, usual lengths, delve-or-not (D-030, D-041).

**Deliberately later** (`game/GAME_DESIGN.md` → "Out"): waypoints, the calendar link, company at work during a delve, satchel groups, great doors beyond one, more lives, sound, notifications (tested separately).

---

## Known gaps, for steps 3–4

Step 2 is done (`product/STRESS_TEST.md`, D-043). Step 3 is drafted: items 1–4 below are set in `game/BALANCING.md` (D-049). Still open:
1. The numbers: region sizes, distance between named places, route length past each opened place (D-037, D-039); the day's edge and what counts as an absence.
2. The guaranteed reward rhythm per delve, day and week, **including a weekly floor** so a week with no target met still opens something (D-035, D-043).
3. What extra effort always unlocks on a high day, and how often a long delve's side chamber holds an authored find (D-035, D-011).
4. Memory and recap, and the before → now re-read view (D-035).
5. The first playable's contents list (step 4), from `game/GAME_DESIGN.md` → "What the first playable needs".
6. ~~For Dan: the slowdown and evening "enough"~~ Answered by Dan (D-044): the slowdown is gone and switching brings a find; evening "enough" agreed.
