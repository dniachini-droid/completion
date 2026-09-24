# Quest System

> How a real action becomes something the game responds to, and how anti-farming works without admin. Phase 2.
> Applies to the chosen loop (`CORE_LOOPS.md` Part 4).

_Status: **agreed with Dan** 2026-09-23. "Quest" is a design word here; what the app calls these is a Phase 3–4 choice._

## Kinds
| Kind | What it is | Where it comes from | Reward |
|---|---|---|---|
| **Main job** | One of the day's 2–5 real things | Suggested by the app from the pool below; Dan accepts or swaps | Step (a find if it's an avoided job) |
| **Day complete** | All the day's main jobs done | Automatic | Arrival |
| **Extra session** | Any delve beyond what the day's jobs need; before or after day complete, on any job (D-043) | Dan starts the timer on a job (one tap), so the app knows its kind without tagging | Step per 25 min, never slowed; a find for switching kinds after a long stretch (D-044); never fills a slot or completes the day |
| **Weekly target** | Dan's own weekly commitments (gym 4×, Spanish, cooking, meal prep, course) | Set once in Phase 1; changed only when Dan wants | Key |
| **One-off** | A typed line ("order the cat's medication") | Dan types one line | Becomes a main job candidate; avoided one-offs are suggested early |
| **Great gate** | A large real project and its milestones (the course, restarting Spanish lessons) | Set up once with Dan | Key per milestone; the great gate opens at the end |
| **Starter** | "I can't start": a teaser then one tiny physical step | One tap | The teaser's payoff after the job |
| **Return** | After an absence: one small welcoming step, a real job at Low size (D-043) | Suggested on the first day back | An arrival-sized welcome back, once that job is done |

Story beats are **not** quests. They arrive through steps, arrivals and Keys; Dan never has to "do" a story task.

## How a real action becomes a quest
1. **The pool** holds weekly targets still open this week, typed one-offs, great-gate milestones and rhythm things the app notices (never as main jobs, P11).
2. **Each morning** the app proposes the day's jobs for the capacity: first the job most likely to be avoided that matters this week, then a mix. One is shown first (P1). **No catch-up avalanche (D-038):** the day's size comes from capacity alone; open weekly targets never add jobs, and late in the week they are suggested no harder than early on. A disrupted week becomes a lighter week unless Dan asks to catch up.
3. **Dan accepts or swaps** from a short menu. No estimating, tagging or scoring (P9).
4. **The app learns** quietly from what gets swapped, when things get done and which suggestions work. Dan never configures it.

## Anti-farming, all structural (no admin)
1. Rewards attach to **slots**, not entries: typing many tiny jobs gives nothing extra.
2. Beyond the slots, only **time** earns, and time can't be split cheaply. Every delve minute moves Dan, on any job; only today's jobs complete the day (D-043).
3. **Variety is paid as a bonus, never a cut** (D-044, replaces the same-kind slowdown): after a long stretch (about 2 hours) of one kind of work, the first delve on a different kind brings a find; staying on the same job keeps full progress. Avoided work is protected by the day's jobs, which day complete needs.
4. **Keys** come from Dan's own weekly commitments and one-tap milestone confirmations, the only "approval" in the system. A change to a target applies from next week; a Key opens something the moment it's earned and is never held (D-043).
5. Signs and powers are paced by authored placement, so no amount of grinding skips the story.
There is no verification. Dan is the only player and the honour system is enough.

## Where the stress test settled the edges (D-043)
The day ends at about 4 am; capacity and Swap work until then, and lowering capacity can complete the day. A job's usual length defaults to 25 minutes and is never asked. "Avoided" is a mark on the job (pre-set for admin, Spanish, housework and typed one-offs; turned on for a job swapped away again and again; Dan's to change). A rhythm thing is a main job only as the day's pick for its weekly target, or as the Low day's real meal. Catching up is not a mode: Dan chooses High or swaps target jobs in. Editing jobs is on request only, from the job itself; the first playable starts preloaded. Tiny steps for "I can't start" are written for Dan's regular jobs; any other job gets one by its way (desk or away). Detail: `product/STRESS_TEST.md`.
