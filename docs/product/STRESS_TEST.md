# Stress test of the concept

> Phase 5 step 2 (`PHASE5_PLAN.md`). Checks `CONCEPT.md` against the principles (`DESIGN_PRINCIPLES.md`), the anti-features (`ANTI_FEATURES.md`) and the MASTER_BRIEF §71 checklist, then walks six real days through it. Where it found a gap, it adds the smallest rule that closes it, and logs it in D-043.
> **Spoiler-free: Dan reads this.** No story content beyond the open game bible.

_Status: written 2026-09-24. The fixes are Claude's calls (routine, reversible) unless marked **for Dan**. They go to Dan at step 5._

---

## The verdict in short

The concept holds. No principle is broken by the design itself, and nothing needs redesigning. The stress test found **16 small gaps**. Most are places where two agreed rules meet and neither says what happens, like a late night, a week away, or a job typed in one line. Each is closed with one rule. **Two points need Dan** (at the end). **Seven numbers** go to step 3.

The three most important findings:
1. **The day needs an edge.** Dan goes to bed late. Nothing said when "today" ends, so a delve at 00:30 had no day. Fix: the day ends at about 4 am (F1).
2. **A normal day that goes wrong at 3 pm needs a way to still be enough.** Capacity could only be set in the morning. Fix: capacity and Swap work at any time until the day ends, and lowering capacity can complete the day (F2). This is P3 applied all day, not just at breakfast.
3. **Coming back after a week away could open on a pile.** Several passed-date questions would stack up on the first screen back, which is exactly when a pile does most harm. Fix: at most one such question a day, and none on the first day back (F9).

---

## 1. The fixes (logged as D-043)

| # | Gap found | Smallest rule that closes it | Principle |
|---|---|---|---|
| **F1** | Nothing said when a day ends. Late work, held delves (D-036) and "day complete" all depend on it. | **The app's day ends at about 4 am**, not midnight. Work after midnight belongs to the day before. Camp records bedtime but does not end the day, so work after camp still counts. | P2, P11 |
| **F2** | Capacity is set in the morning. A day that turns bad (or good) at 3 pm had no way to resize. | **Capacity and Swap work at any time until the day ends.** Done jobs stay done; the undone ones resize. Lowering capacity can complete the day at once (two jobs done on a day turned Low is a complete low day). The app never prompts for it. | P3, P8, P10 |
| **F3** | Two earning rules met without saying what happens between them. "Extra sessions" earned only after day complete, and satchel items moved only as main jobs. So 25 real minutes on a job not on today's list earned nothing, which contradicts D-039. | **Every delve minute moves Dan, on any job, at any time** (25 min = one step; D-044 later removed the slowdown). **Only today's jobs fill the day and complete it.** A job without a timer still moves him only as one of today's jobs. "Extra session" stops being a separate kind. | P2 (D-039), P5, P13 |
| **F4** | D-037 counts a job without a timer by its usual length. Asking for a length on every typed line is estimating (P9). | **A job's usual length defaults to 25 minutes (one step).** It is never asked when a job is added; Dan can change it on any job later. Jobs he already has (the gym's hour) keep their lengths. | P9 |
| **F5** | Avoided jobs bring finds, but nothing said how the app knows which jobs are avoided without tagging. | **"Avoided" is a mark on the job, already set.** It is pre-set for admin, Spanish, housework and typed one-offs. The app turns it on quietly for any job Dan swaps away again and again. Dan can change it on any job. | P5, P9 |
| **F6** | Nothing said when a Key is used, or on what. Keys held for later would be a count and a currency (D-012). | **A Key is never held: it opens something the moment it's earned.** It opens the sealed thing Dan last looked at if that needs a Key, otherwise the nearest one on his route. Authoring rule: **at least one sealed thing that takes a Key is always in view.** Extra Keys open side things; they never pull core marks ahead (D-035). | P7, D-012 |
| **F7** | Weekly targets are editable (D-030). Lowering one on Thursday would hand over a Key at once, which would hollow Keys out (rule 10). | **A change to a weekly target applies from next week.** Changes to kinds of job, usual lengths, delve-or-not and avoided marks apply at once. A missed target costs nothing anyway (P6). | Rule 10, P6 |
| **F8** | Known gap: editing jobs and targets without it turning into admin (D-030). | **Editing is only on request, never prompted.** Only a name is required, and every field has a default (F4, F5, D-041). A job is edited from the job itself (tap its row), with no settings maze. The first playable starts **preloaded with Dan's current jobs and targets**, so day one needs no setup. The app never asks him to review his goals. | P9, rule 11 |
| **F9** | Return after an absence gave "an arrival-sized welcome" automatically. That would move the world without real action (rule 8). Also, passed-date questions (D-038) could stack up on the first screen back. | **The welcoming step is one small real job;** doing it plays the arrival-sized welcome. The first day back suggests Low. **At most one passed-date question a day, and none on the first day back;** the rest wait quietly, with no count. | Rule 8, P7 |
| **F10** | The week closes itself with a daybook page. A week with nothing done would get a page about nothing. | **A week with nothing done gets no page**, and no gap is marked (like the cairns, D-038). A thin week still gets its different kind of page (`TOOLS.md` §6). | P8, P14 |
| **F11** | The deep route was offered only on a High morning. So a day that was suggested Normal from bedtime but turned great could never reach it, which contradicts D-039. | **"Keep going" after day complete leads to the deep route on any day.** A High morning's offer just lets Dan start on it earlier. | P2 (D-039), P3 |
| **F12** | "A disrupted week becomes lighter unless Dan asks to catch up" (D-038), but there was nothing to ask with. | **Catching up is not a mode.** Dan asks by choosing High, or by swapping target jobs in. Nothing else to build. | Rule 12 |
| **F13** | "I can't start" needs a tiny physical step for every job, including a typed one-off. Writing those on the fly would need AI (anti-feature). | **Tiny steps are written for Dan's regular jobs.** Any other job gets one chosen by its way: a desk job ("open it, phone face down") or an away job ("shoes on, keys in hand"). Dan may write his own on a job; he is never asked to. | P4, anti-features |
| **F14** | Cooking is a weekly target (2–3×), yet P11 says cooking is "noticed, not a main job", and the Low day's "real meal" *is* a main job. | **A rhythm thing is a main job only when it's the day's pick for its weekly target, or the Low day's real meal** (Dan's own definition). Otherwise it's not on Today. | P2, P11 |
| **F15** | Wording drift: skipping the breather is "Start it now" in one place and "Next delve" in another (`TOOLS.md` §1). | One name: **"Start it now"**. The rest goes to the language pass (D-031). | UX 12 |
| **F16** | "Growing into it" (the app offers to raise a normal day's size, `CORE_LOOPS.md`) moves the goalposts P2 fixed. Since D-039 extra effort is already rewarded in full, so the offer adds pressure without adding reward. | **Out of the first playable.** Revisit only if the test shows Dan wants it. | P2, P14 |

---

## 2. Walkthroughs

Numbers are D-037's starting guesses: a step is 25 minutes, and named places are about 6–8 steps apart.

### A low day
Late bedtime → the morning suggests **Low**: outside, and a real meal. He goes for a 30-minute walk (not a delve): Begin, go, Done, and it plays 1.2 steps. Then the meal (default length, one step). **Day complete** at about 2 steps: gold light, "That's the day. Enough.", a camp with a view. The main button is rest. A cairn is placed.
- **Holds:** the day succeeds in full (P3). Nothing to read unless he wants to. Nothing says it was small.
- **Gaps found:** where a meal stands as a main job (F14). The meal had no length (F4).
- **For step 3:** 2 steps don't reach a named place. The low day's arrival must still feel like arriving, so it needs something guaranteed (the reward rhythm).

### A normal day
Normal is suggested. The leading job is admin (marked avoided, F5), with the course hour and the gym beneath it. Admin as a 25-minute delve is 1 step and a **find**. The course hour opens the run screen already set at 2 delves, which is 2 steps. The gym, done away from the phone, is 2.4 steps. **Day complete** at about 5.4 steps, short of the next named place: a camp with a view and a record's line. He's still motivated, so "Keep going" leads to 2 more course delves on the deep route (F11).
- **Holds:** one obvious next job; Begin starts at once; the avoided job is paid in finds, not pressure.
- **Gap found:** without F3, a delve on a satchel job before day complete earned nothing.
- **Watch in play:** leading every morning with the avoided job may make *opening the app* feel like facing the hard thing. Swap and "I can't start" are one tap away; watch whether that's enough.
- **For step 3:** a normal day usually ends at a camp. That's fine if camps carry something.

### A high day
High is suggested (early bedtime, and something is waiting at camp). The morning offers the deep route. Five jobs, including 4 hours of course work as runs of 4 delves. Each run is a **long delve** and reaches a side chamber. Day complete at about 14 steps, past two named places. He does 2 more hours in the evening.
- **Holds:** no cap; the story's core order is unmoved; extra effort meets place, finds and records (D-039).
- **Tension, for Dan (D1):** the same-kind slowdown kicks in after about 2 extra hours of course work, the one thing Dan *wants* to do for 4 hours a day. It limits the course's extra hours, not the avoided jobs.
- **For step 3:** if every long delve brings an authored find, daily course runs would use up a year's finds in months. A side chamber should be mostly place, with a find only sometimes.

### An interrupted delve
The phone rings at minute 12. **Step away**: the 12 minutes count, the delve is held, the breather starts. The call runs 40 minutes; the breather ends by itself. He opens the app: "Carry on: the course · 13 min left". He finishes the delve. The pieces earn exactly one delve.
- **Holds:** one button in the moment, no decision mid-interruption, no "you've been gone" (D-036).
- **Gap found:** a delve held past midnight had no day to close in (F1).
- **Accepted risk:** if he walks off mid-run *without* Step away, the run carries on by itself (D-037, Dan's choice) and counts minutes he didn't work. Honour system; watch in play.

### A week away
Ill, or away for 8 days. On his return: "where you were" (the last place, the door he was looking at, one unfinished record). The day is suggested **Low**, and its first job is small and real; doing it plays the welcome (F9). Satchel items untouched for weeks have quietly gone to *someday*. Two items passed their dates while he was away. One question tomorrow, one the day after, never both at once (F9). No daybook page for the empty week (F10). The weekly targets for this part-week are unchanged and suggested no harder (no avalanche).
- **Holds:** no counts, no summary of what was missed, nothing broken, dust settled.
- **Gaps found:** a free welcome (rule 8) and stacked questions (P7), closed by F9.

### A disrupted week
A good Monday; ill Tuesday to Thursday (two Low days and a rest day); a visit Friday; better at the weekend. Low days complete with two small things. The rest day is a camp day. One target is met (the course, by Monday's long run), which gives one Key. The others are missed and nothing carries over. The daybook writes a thin week's page ("a hard crossing"), not a shorter one.
- **Holds:** a hard week becomes a lighter week (P6, D-038).
- **Gaps found:** no way to "ask to catch up" (F12). A target can't be lowered mid-week for a quick Key (F7).
- **For step 3:** **a week with some days complete but no target met opens nothing.** Two such weeks early on would stall the first word (due in week 2–3). The weekly guarantee needs a floor.

---

## 3. The §71 checklist, mechanic by mechanic

The questions: what problem it solves (player / game); does it support the loop; maintenance; exploits; cognitive load; a simpler version; is it fun; is it only there because RPGs have it; does it clash with an anti-feature. Only the answers that matter are written out.

| Mechanic | Why it's here | Exploit and guard | Load and maintenance | Verdict |
|---|---|---|---|---|
| **Steps from minutes** (D-037) | Real effort moves the world, in proportion (rule 8, P13) | Split time? Can't: minutes are minutes. Inflated usual lengths: honour system. Tiny jobs: slots (F3, F4). | None for Dan | **Keep** |
| **Day complete → arrival** | "Enough" made real and locked in (P2) | Lowering capacity to complete (F2): allowed. Two real jobs *is* Dan's own "enough". | None | **Keep** |
| **Capacity** | Sizes the day from bedtime (P3); does HP/MP's one job | None | One optional tap | **Keep**; works all day (F2) |
| **The delve and runs** | The Pomodoro that already works for Dan, inside the world | Walking off mid-run: honour | Two words only (D-036) | **Keep** |
| **Long delve → side chamber** | Rewards sustained focus in kind | Daily runs could drain authored finds: step 3 | Content: mostly place | **Keep**; step 3 sizes the find rate |
| **Deep route** | Low floor, high ceiling (D-011, D-039) | Part-marks never jump the order (D-035) | None | **Keep**; any day (F11) |
| **Same-kind slowdown** | Keeps the course from crowding out avoided work | — | Invisible rule | **Replaced** (Dan, D-044): a find for switching, full progress for staying |
| **"I can't start"** | Starting is the problem (P1, P4) | Same teaser all day, so it can't be farmed | Tiny steps authored (F13) | **Keep** |
| **Finds** | Aims reward at what's avoided (P5); a collection tied to the truth | One-offs default to avoided (F5): slots cap it | Authored: step 3 sets the rate | **Keep** |
| **Cairns** | A trail Dan likes, without a streak (P6) | Needs day complete, which is slot-based | None | **Keep** |
| **Weekly targets → Keys** | The week matters without a meeting (P6) | Mid-week lowering (F7); no held Keys (F6) | Targets preloaded (F8) | **Keep**; needs a weekly floor (step 3) |
| **Great doors** | Big projects feel big (MASTER_BRIEF §15) | One-tap milestone, honour | Set up once | **Keep**, one door in the first playable |
| **Marks, guessing, words** | A new mysterious power, the reward Dan values most | Authored order (D-035) | Content: authored | **Keep** |
| **Open cells** (two marks → one line) | Speaking the language, not only reading it | None | Needs a line for every pair; grows fast | **Keep in the design; out of the first playable** (step 4) |
| **Records and the web of lives** | Linked lives, Dan's favourite (*Eternal Darkness*) | Paced by days and Keys | Authored; memory risk: step 3 | **Keep** |
| **Small choices** (route, record, word) | Dan: "super fun" | Never required to progress | One tap | **Keep** |
| **The satchel** | Lists on request (D-020) | Ticking alone earns nothing (P16) | Someday drift; dated items (F9) | **Keep** |
| **The daybook** | Evidence he moved, with no dashboard | Written from real completions only | Automatic | **Keep**; no page for an empty week (F10) |
| **Camp and bedtime** | Sleep helped by behaviour, never outcome (P11) | Honour | One tap | **Keep** |
| **"Growing into it"** | — | — | Pressure | **Out of the first playable** (F16) |

**Is anything there only because RPGs have it?** No. XP, levels, HP/MP, currencies, loot tiers and bosses were already removed (D-012). The closest thing is **the number of reward kinds** (steps, finds, records, marks, part-marks, words, Keys, side chambers, cairns, great doors). Each one answers a different "why", but together they are a lot to learn. The long-term loop already brings them in slowly (week 1 has only steps, arrivals, one record and one door). Step 4 should keep the first playable to the ones the 5–6-week test needs.

**Does anything clash with an anti-feature?** Only three near-misses, all closed: the free welcome back (F9), stacked questions (F9), and "growing into it" (F16).

---

## 4. For Dan (step 5, taste and priorities)

**Answered by Dan, 2026-09-24 (D-044):** D1: the slowdown goes. "Something extra if I switch, but still progress if I don't." D2: yes.

- **D1. The same-kind slowdown.** Today, after about 2 extra hours of the same kind of work, steps come slower. It was meant to stop the course crowding out Spanish and admin. But the day's job slate already does that, since day complete needs the avoided jobs. Meanwhile the slowdown limits the course hours Dan *wants* ("ideally 4 hours a day"). His own words at D-039: "Shouldn't be punished for doing more work."
  - *Option A:* keep it as it is.
  - *Option B (Claude's recommendation):* drop the slowdown. Instead, the first delve on a different kind of job after a long stretch of one kind brings a find. The balance is the same, but it is paid as a bonus instead of taken as a cut.
- **D2. Evening "enough" (F2), for a nod.** If a Normal day ends with two jobs done, Dan can tap Low and the day completes. Claude's view: that's his own definition of enough, and it's P3 applied all day. The risk is that Normal days quietly become two-job days. Watch in play.

## 5. For step 3 (the numbers)

1. The day's edge: about 4 am (F1).
2. What counts as an absence (how many days) (F9).
3. When opening late shrinks the day, and by how much (`CORE_LOOPS.md`, "opening late").
4. **A weekly floor:** a week with at least one day complete opens something, even with no target met. It protects the first word in week 2–3.
5. A low day's and a normal day's guaranteed arrival (usually a camp): what it always carries.
6. How often a long delve's side chamber holds an authored find, against the year's supply.
7. How long "a long stretch" of one kind is before switching brings a find (about 2 hours; D-044).

## 6. To watch in play (not rules)
Whether leading each morning with the avoided job makes opening the app feel heavy. Whether evening lowering (F2) hollows out Normal days. Whether typed one-offs as "avoided" (F5) bring too many finds. Walking off mid-run. Bedtime taps are on trust.
