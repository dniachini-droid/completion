# Core Loops

> Phase 2. Candidate core loops for Dan to compare, then (once chosen) the full daily, weekly and long-term loops.
> Built on `DESIGN_PRINCIPLES.md` (P1–P15) and `ANTI_FEATURES.md`. The fiction is kept abstract on purpose: names in *italics* are placeholders, not setting choices (the setting is Phase 3).

_Status: **Dan chose a blend (D-010), 2026-09-23.** Parts 1–3 are kept as the record of the options. The design now lives in Part 4, which overrides Part 1 wherever they differ._

---

## How to read this

Every candidate sits on the same **chassis**: the day, the week and the rules Dan already approved in Phase 1. Those don't change between candidates. What changes is the **game layer**: what the real action turns into, what Dan sees when he comes back, and what pulls him forward.

So: Part 1 is the shared chassis (proposals where Phase 1 left gaps, marked **[proposal]**). Part 2 is the three candidates. Part 3 compares them.

---

## Part 1 — The shared chassis

### The unit of effort
- A **main job** is the unit the game rewards. A normal day has about 3, a low day has 2 (outside + a real meal). (P2)
- Jobs are finished either by a **real-world completion** (went to the gym, booked the Spanish lesson, ordered the cat's medication) or by **focus sessions**: a bounded 25-minute timer, the Pomodoro unit that already works for Dan (P13). One hour of course work = 2 sessions = the job is done (P5). **Distance comes from time (D-037):** one step = 25 minutes of effort, and a job done without a timer counts by its usual length (the gym's hour = 2.4 steps).
- Dan taps "done". There is no proof, no verification, no anti-cheat to run. [proposal]

### Anti-farming without admin [proposal]
Farming is prevented by **structure**, not by policing:
1. **Rewards attach to slots, not entries.** The day has 3 main-job slots (2 on a low day). Typing ten tiny jobs earns nothing extra: only what fills a slot counts.
2. **"Day complete" is the big reward.** It comes once per day, whatever the day's size.
3. **Bonus effort is time, not entries.** After day complete, extra *focus sessions* keep earning. Time can't be split into cheaper pieces. ~~Capped at one bonus find per day~~: removed by D-011 (low floor, high ceiling). See Part 4 → "High days".
4. **Avoided jobs are worth more, quietly.** When the app suggests the day, it leans towards what Dan avoids (P5). If an avoided job is done, its reward is richer (a better reveal, not a bigger number). Dan never scores anything.

### The day
| Moment | What happens |
|---|---|
| **Morning start** | Opening shows the day's capacity (pre-set from last night's bedtime, one tap to change) and **one** suggested next job, with the other two beneath it. Dan accepts or swaps from a short menu. A waiting story hook is visible, not a list. (P1, P3, P9) |
| **During** | Start a job → optional focus timer → come back → the game responds in **under a minute** → out. (P15) |
| **"I can't start"** | One tap. A story reveal first (a teaser whose payoff is on the other side of the job), then one tiny physical step ("put your gym shoes on"). Then it offers to continue. It never demands. (P4) |
| **Day complete** | 3 jobs (or 2 on a low day) → the day's main reward. Anything after is a bonus, never a debt. (P2) |
| **Opening at 4 pm** [proposal] | No morning ceremony, no comment on the time. The day shrinks to what fits (usually 1–2 jobs) and can still complete. |
| **Life happens** | A real obligation (an appointment) can be added afterwards as a main job; the day shrinks to fit. (P10) |
| **Evening close** | A short wind-down moment. Going to bed by his chosen time gives a small night reward (behaviour he controls, never hours slept) and sets tomorrow's capacity. Missing it removes nothing. (P11) |
| **Rest** | "Rested today" can be marked. It is acknowledged in the fiction, never scored. (P12) |

### The week [proposal]
- Weekly targets (gym 4×, Spanish lesson + 1 h, cooking 2–3×, Sunday meal prep, course) are **filled in automatically** from the jobs Dan completes. No weekly planning.
- The week closes itself (Sunday night → Monday morning) with a short, automatic recap and one thing to look forward to. **No Sunday admin meeting.**
- **Targets reset; the story waits.** Missed targets don't carry over (P6). Story progress, abilities and the world never go backwards (P8). An unmet goal simply stays where it was.

### Things no candidate has [proposal]
- **No XP, no levels, no HP/MP numbers.** Capacity already does HP/MP's useful job (sizing the day, giving permission to stop), and "day complete" says "enough" more clearly than an empty MP bar. Progression is shown by **new abilities and a changed world**, which the player model says Dan actually cares about. If a candidate needs a number, it must say what changes when it goes up.
- No streaks, no backlog, no decay, no loss. (Anti-features.) *Superseded in part by D-020 and D-023: a non-punitive trail and lists on request, see `TOOLS.md`.*

### The shared content-rate problem
Story is why Dan plays, and he stops when it ends. With about one main beat per completed day plus small beats per job, a year of play needs roughly **250 main beats and ~750 small ones**. Each candidate below handles this differently; it's one of the biggest differences between them.

---

## Part 2 — The candidates

### Candidate A — *The Decipherment*
**Fantasy:** "I'm the only one who can read it." A dead civilisation left a script nobody understands. Every real thing Dan does lets him read a little more, and each new sign he learns changes what the old texts meant.

**What the real action becomes:** each main job reveals one *sign* in the day's line of text. Day complete = the line becomes readable: a reveal.
- Low day: a shorter line (2 signs), still a complete sentence. "That was enough."

**The game moment (≈30 s):** the sign lights, locks into place, and a fragment translates. On day complete, the whole line resolves.

**Progression:** a **lexicon of signs**. Each sign is also a power: signs combine into *words* that open sealed texts and act in the world (Eternal Darkness runes; *Arrival*). Crucially, **learning a new sign re-reads old texts**: a line from week 2 changes meaning in month 4. "That was there the entire time" becomes a mechanic, not just a story beat.

**Weekly:** each week is one *text* (a tablet, a record). A weekly target met = a new sign learned. A missed target: the sign stays unlearned and turns up again later. The text continues next week where he left off.

**Long-term:** 1 month: the first texts connect. 3 months: the lexicon is big enough to compose words and open sealed archives. 6 months: re-reading overturns an early "fact". 12 months: the script's authors, and why they wrote it.

**"I can't start":** an untranslated line appears, one sign short of meaning something. The tiny step follows.

**Evening close:** overnight, the signs rearrange: a small insight is waiting in the morning if he went to bed on time.

**Rest:** a quiet page (an illustration, a margin note) with nothing to decode.

**Collection:** the lexicon itself. Nothing else.

**Strengths**
- The most direct story engine: every reward *is* story.
- The re-reading mechanic turns foreshadowing into a system.
- Language as power fits Stargate and *Arrival*, and may give Spanish a quiet resonance.
- Cheapest to build. Fastest way to test the core hypothesis.

**Risks**
- **Passive.** Little "play": it could become an e-reader with a ritual on top.
- One kind of reward (text). Could feel monotone by month 2.
- Highest writing load: every beat is authored prose.
- Reading on a low day may feel like homework.

---

### Candidate B — *The Expedition*
**Fantasy:** "Every real hour takes me further in." An explorer pushing into a vast, sealed place: a network of sites and gates (Zelda's temples, Stargate's gate network). Each gate visibly needs a capability he doesn't have yet.

**What the real action becomes:** each main job moves the expedition **one step** on the map: a new room, a passage, a find. Day complete = **arrival** somewhere (a site, a view, a sealed door seen for the first time).
- Low day: a short, safe step that still arrives somewhere (a camp with a view).

**The game moment (≈30–45 s):** the step happens; the map extends. At a fork, Dan makes one light choice of route. The choice is in the game, never in the planning.

**Progression:** **capabilities that open gates** (a way to cross the drop, to read the lock, to wake the lift). Gear exists only when it grants a power. The goal is literally visible: Dan can see the door and what it needs, not the details of what's behind it. This matches "a goal I can see" and "know roughly what's coming".

**Weekly:** the week's targets are the expedition's **big moves**: each one met opens a gate or earns a part of a capability. A missed target: the gate is still there next week. Nothing closes behind him.

**Long-term:** 1 month: first region mapped, first capability. 3 months: capabilities combine; old areas reopen with new routes (Metroidvania backtracking, done in seconds). 6 months: a second region that reframes the first. 12 months: the centre of the map.

**"I can't start":** a sound or light from beyond the next door. The tiny step follows.

**Evening close:** camp. Going to bed on time = a night at camp with a small find in the morning.

**Rest:** a rest day is a camp day: a scene, no step taken, no cost.

**Collection:** capabilities and a few artefacts that have powers. The map itself is the progress display.

**Strengths**
- The most *game*: space, choice, ability-gating, "I wonder what's through there".
- The visible goal is literal and spatial, which is what the player model predicts works.
- Content is partly **systemic** (rooms, routes, gates), so the writing load per beat is lower than A.
- The map shows progress without a single number.

**Risks**
- Most expensive to build (map, sites, route logic), and the most art-hungry.
- **Could pull him into the app** (P15). Mitigation: nothing moves without real action, and there's nothing to do in the app otherwise.
- "One job = one step" is abstract: the link between gym and a corridor is arbitrary.
- Route choices could feel trivial if not designed well.

---

### Candidate C — *The Linked Lives*
**Fantasy:** "Several people across the ages, and I'm what connects them." Eternal Darkness / Three-Body: a handful of protagonists in different eras of the same world, whose stories turn out to be one story.

**What the real action becomes:** each weekly-target area drives **one thread** (e.g. body → one life, learning → another, home and admin → another; placeholders). A main job plays **one scene** of that thread. Day complete = a **crossing**: a moment where two threads touch (an object hidden in one era is found in another).
- Low day: getting outside and a real meal drive a short "interlude" thread of its own that still completes the day.

**The game moment (≈45 s):** a short scene from that life. On crossings, a connection lights up between eras.

**Progression:** each protagonist gains abilities in their own era, and **echoes** carry across (a power learned in one life shows up, altered, in another). The thread web itself is the progress display.

**How it aims at avoided jobs:** a thread whose area Dan hasn't touched **pauses on a mystery**: what was in the letter, whose voice was that. The pull toward Spanish or admin is curiosity about that life, not a nagging task. **Hard rule:** threads pause on a *question*, never on *danger*. No character is ever at risk because Dan didn't go to the gym.

**Weekly:** each thread gets its week; the week's recap shows which lives moved and hints at the next crossing. Missed areas: those lives wait, safely.

**Long-term:** 1 month: each life established, the first crossing. 3 months: the lives visibly share one mystery. 6 months: a revelation recasts one protagonist entirely. 12 months: the threads converge.

**"I can't start":** the paused thread's question, restated in one line. The tiny step follows.

**Evening close:** the lives at night: a single line from whichever life he'll likely touch tomorrow.

**Rest:** a rest day is a still day for all lives.

**Collection:** almost none. Connections between eras are the collectable.

**Strengths**
- The strongest built-in answer to "aim the help at what's avoided" (P5), and it works by curiosity, not pressure.
- Dan's stated favourite structure ("I LOVED how the stories jumped between different characters and they were all linked").
- Interconnection ("everything was related") is the core mechanic.
- Variety: each area of life feels different.

**Risks**
- **Highest writing load**: several threads need steady content in parallel.
- Mapping life areas to characters can feel forced ("why does housework move the soldier?").
- A paused life could still read as a neglected person, i.e. guilt with a face. Needs very careful writing.
- Each thread moves slowly, and the most complex to explain in week one.

---

## Part 3 — Comparison

| | A · Decipherment | B · Expedition | C · Linked Lives |
|---|---|---|---|
| The fantasy | Reading the unreadable | Going further in | Connecting lives across time |
| After a real job, Dan… | reads a fragment | takes a step, sometimes chooses a route | watches a scene |
| Pull toward avoided jobs | richer reveals when suggested | gates that need what he's been avoiding (weak) | paused lives (strong) |
| Progression | signs that are powers; re-reading | capabilities that open gates | abilities that echo across eras |
| Feels most like | *Arrival*, Stargate linguistics | Zelda, Metroidvania, gate network | Eternal Darkness, Three-Body |
| Writing load | High | Medium | Highest |
| Build cost for a first playable | Low | High | Medium |
| Biggest risk | Passive, monotone | Expensive; lures him into the app | Guilt with a face; content burn |

### Blends worth naming
The candidates aren't exclusive. The most natural blend is **B's skeleton with A's and C's content**: explore a sealed place (B), where what you find are **records in a script you're learning** (A), and those records turn out to be **the linked lives of people from different eras** (C). That's essentially how Eternal Darkness delivers its chapters: you find a page, then you live it.

Claude's honest view, for Dan to push against: a blend like that is probably the strongest *eventual* game, and **A is the cheapest thing that could test the core hypothesis first.** A first playable could start as A inside a small corner of B, and grow. But Dan's gut reaction matters more than this analysis: this is a taste call (rule 20).

## Dan's answers (2026-09-23)
1. **A blend** of all three: "the best way to do it."
2. After a job: **a blend** again.
3. C's paused life pulling towards Spanish: **"probably a nag."** That mechanism is dropped.
4. Small in-game decisions: **yes**, "super fun."
5. No XP/levels/HP/MP: "whatever you think is best." Claude's call: keep them out (Part 4).
6. The chassis is too focused on the minimum: **"when I'm at capacity I want the app to be able to make me super productive. So don't make it just for crippled me."** Led to D-011.

## Questions sent 2026-09-23
1. Which fantasy gives you the "I want to see what happens" feeling? Rank A, B, C.
2. Just after finishing a real job, which do you want most: 30 seconds of **reading/decoding**, a **step and a small choice** on a map, or a **short scene** from someone's life?
3. C: would "the Spanish life is paused on a mystery" pull you toward Spanish, or feel like a nag?
4. Do you want small in-game decisions (like choosing a route), or should real action be the *only* thing you do?
5. Proposal check: **no XP, levels or HP/MP numbers**; progress shown only through new abilities and a changing world. OK, or do you miss numbers?
6. Anything in the shared chassis (Part 1) that feels wrong?

---

## Part 4 — The chosen loop: *Explore · Decode · Connect* (D-010)

_Working name only. Agreed with Dan 2026-09-23 (D-010–D-013)._

### The fantasy
"Every real hour takes me further into a sealed place, and what I find there is written in a script only I am learning. The records are the lives of people from different ages, and slowly I see they are one story."

- **B gives the skeleton:** a place to explore, with gates you can see and routes to choose.
- **A gives the finds and the powers:** records in an unknown script; signs you learn; signs that combine into *words* that act as powers.
- **C gives the content:** the records are fragments of **linked lives across eras**. Which life you learn about next depends on where you go.
- **Dropped from C:** life areas no longer drive particular characters, and no life ever "waits on" Dan (Dan: "probably a nag"). Lives are found, never neglected.

### The core loop
```
real job done ─► a step into the Site ─► something is there (a passage, a gate, a record)
      ▲                                              │
      │                                    a small choice (which way; which record;
      │                                    which words to try on a gate)
      │                                              │
 want the next real action ◄─ a new question ◄─ decode ► a fragment of a life ► it connects to another
      ▲                                                                                │
      └──────────── a gate ahead you can see, and roughly what it needs ◄──────────────┘
```
Each return to the app takes **under a minute** (a decode included: a record fragment is short enough to read in that time; longer records are split across visits), and every one ends by showing something ahead that Dan can see but not yet reach.

### Three sizes of reward
| Size | Earned by | What Dan gets |
|---|---|---|
| **Step** | every 25 minutes of real effort, in proportion (D-037): delves, and jobs without a timer by their usual length | the map extends; often a small find or a line of script. Named places are about a working day apart. |
| **Arrival** | day complete | wherever the day's steps reached: a named place on a long day, a camp with a view on a short one; a record whose fragment you can decode |
| **Key** | each weekly target met; major milestones | opens something **already seen and sealed**: a gate, a sealed record, a new sign |

**What opens what (D-013).** Every sealed thing shows what it needs: a **Key** (earned by living the week) or a **word** (earned by learning). The largest gates need both. Dan can always see which, so the goal is clear.

Avoided jobs (admin, Spanish, housework, costly one-offs) always turn a step into a **find**: never just a corridor. This is the "aim at what's avoided" pull (P5), done through reward, not pressure.

### Small in-game decisions (Dan: "super fun")
Kept small, one tap each, and never required to progress:
- **Route:** at a fork, which way. It changes which life's records you find next.
- **Which record to decode** when there are several.
- **Words on a gate:** try a combination of known signs on a sealed gate or device. A light puzzle, not a test. A wrong guess gives a clue; nothing is lost.
- **Re-read:** a newly learned sign marks old records that now read differently. Dan chooses whether to look now.

### Capacity: low floor, high ceiling (D-011)
| Day | Main jobs | What the game offers |
|---|---|---|
| **Low** | 2 (by default outside + a real meal; swappable, D-038) | A short, safe push that still **arrives** somewhere. "That was enough. I still moved forward." |
| **Normal** | about 3 | A full arrival. |
| **High** | up to 5, plus open-ended sessions | Dan can call a **deep push** in the morning: a route to places a normal day doesn't reach (deeper chambers, rarer records, harder gates, and sometimes **part of a sign**, D-013). |

- **After day complete, effort keeps counting.** Every further focus session is another step. There is **no daily cap**.
- **Anti-farming on high days** is gentle, and all of it is automatic:
  - time can't be split into cheaper pieces;
  - after about 2 extra hours of the *same* kind of work, steps come slower. Switching to another kind of job makes them full again. This keeps the course from crowding out Spanish and admin (P5) without punishing a long course day.
- **A deep push that falls short loses nothing.** Every step taken is kept. The deep route is still there tomorrow.
- **Growing into it:** if Dan's weeks are mostly Normal and High for a while, the app **offers** (never imposes) to raise the size of a normal day. A low day stays a complete day forever. *Out of the first playable (D-043): since D-039 extra effort is rewarded in full, the offer adds pressure without reward. Revisit only if the test shows Dan wants it.*

### The daily loop
| Moment | What happens |
|---|---|
| **Morning** | Capacity is already suggested from bedtime (one tap to change). Screen: where you stand in the Site, the next gate you can see, and **one** suggested first job (the day's other jobs beneath; only today's, never a backlog, D-038). Accept or swap from a short menu. On a High day: an offer of a deep push. |
| **Doing a job** | A delve job runs as a delve; any job can be one, Dan's choice (D-041). A job that isn't (gym, cooking, errands, unless he makes them delves) has no timer: Dan goes, and taps Done on return (D-038). |
| **Coming back** | Tap done → the step plays (≈20–40 s) → at most one small choice → out. |
| **"I can't start"** | A **teaser from just ahead** (a line of script one sign short of meaning, a sound behind the gate). Then one tiny physical step. Then an offer to continue, never a demand. The teaser's payoff is on the other side of the job. |
| **Day complete** | The arrival. The day is explicitly **enough**, and its success is locked in. Rest is the main offer; a quiet "keep going" is there on every day, and it leads to the deep route on any day (D-038, D-043). |
| **Opening late (4 pm)** | No comment on the time. The day shrinks to what fits and can still complete. |
| **The day's edge (D-043)** | The day runs until about 4 am. Capacity and Swap work at any time until then; done jobs stay done, and lowering capacity can complete the day. |
| **Life happens** | An appointment added afterwards counts as a main job. |
| **Evening close** | **Camp.** A short wind-down scene. Going to bed by the chosen time → something is waiting at camp in the morning (a decoded line, a map mark). Missing it removes nothing. Bedtime sets tomorrow's capacity. |
| **Rest day** | A camp day: a scene, no step, no cost, no score. |

### The weekly loop
- Weekly targets fill themselves from completed jobs. Each target met is a **Key**, so a good week opens up to five sealed things Dan has already seen.
- **Beyond the target:** gym a 5th time, Spanish past the hour, more course hours. It all counts as steps, and a strongly exceeded target can open a sealed thing on the deep route.
- **The week closes itself** Sunday night → Monday morning: a 20-second recap ("this week you went through the lower gate; three records decoded; one of them names the other") and a glimpse of next week's biggest sealed thing. **No planning. No Sunday admin meeting.** This recap is the Chronicle's weekly page (`TOOLS.md` §6, D-023).
- Missed targets: nothing carries over. The gate is still there, still sealed, no worse.

### The long-term loop
Systems unfold gradually (MASTER_BRIEF §262), so week one is simple:
| When | New to Dan |
|---|---|
| Week 1 | The Site, steps, arrivals, one record, one gate he can see. |
| Weeks 2–4 | The first signs; decoding; the first Key opens a gate. Route choices begin. **The first word** (week 2–3, D-013) opens something. |
| Month 2 | More words to try on gates. The first time two records turn out to be about the same event, from different ages. |
| Month 3 | Re-reading: a new sign changes an old record's meaning. Deep pushes lead somewhere important. |
| Months 4–6 | A second region that reframes the first. The first major revelation about who the lives were. |
| Months 6–12+ | The lives converge on the central mystery. Big real milestones (finishing the course) open the largest gates. |

### Large projects
A big real project (the 24-week Claude course, a module of it, restarting Spanish lessons) is a **great gate** visible from far off. Its parts open as real milestones are reached. Dan confirms the milestone with one tap ("finished module 3"): the only "approval" in the system. The fiction amplifies the real achievement; it never makes it look small (MASTER_BRIEF §15).

### Tools inside the loop (D-020)
The focus timer (*the delve*), lists (*the satchel*), plotting, the calendar link, the trail and the Chronicle are specified in `TOOLS.md`. Each feeds the same three reward sizes: step, arrival, Key. During the day only main jobs move the world; the delve is how you do them (D-023). The trail adds relics to the collection.

### Absence
After days away: a short "where you were" (last place, the gate you were looking at, one unfinished record), and one small welcoming step: a real job, with the day suggested at Low; doing it plays the welcome (D-043). No counts, no summary of what was missed.

### Content load
Better than any single candidate. The Site gives **systemic** beats (passages, gates, routes) that need design but little prose. Records need **authored** prose, but only at arrivals and Keys, not every step. Rough year: ~250 arrivals, of which perhaps half carry a record fragment, plus up to ~250 sealed things for Keys to open (5 targets × 52 weeks), and a Site large enough for uncapped High days. Phase 3 plans the writing around that rate.
