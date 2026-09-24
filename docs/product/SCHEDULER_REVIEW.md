# Reconciling the outside review of the week planner

> ChatGPT reviewed `product/SCHEDULER_PROPOSAL.md` (2026-09-24; about 8.5/10, "approve the scheduler as a core direction, not every mechanic yet"). This file checks each recommendation against the agreed docs and does not accept any of it blindly. The resulting rules are in `game/PLANNER.md` (draft, for Dan with the mock-ups), and the decision is D-045. Spoiler-free.

**Verdicts:** 19 accepted · 3 modified · 10 already resolved; three parts rejected (below).

**Three disagreements, in short:**
- **No "stretch aim: 12 h" label.** A number that shows a bar above "enough" is exactly the debt-like display the design bans (UX 6), and Dan hasn't asked to see one.
- **No tray, not even as a secondary view.** The review would keep it for later. Claude would drop it: a job released from the plan is re-placed or falls away, and there's no holding area to look at.
- **No ranges at all.** The review kept "2–3×" with the lower number as the target. It's simpler to have one number, which is "enough"; anything beyond it already counts as more.

## Recommendation by recommendation

| # | Review says | Verdict | Why, against the repo |
|---|---|---|---|
| 1 | Keep the scheduler; design it now | **Accept** | Dan's request (D-020 first, now central). Already the plan. |
| 2 | Planner stays optional; Today works without it | **Already resolved** | Proposal §2; P1. |
| 3 | The token tray is a debt display in disguise | **Accept, and go further** | Right: "four gyms left" on a Thursday is a pile (P7). The review would keep a tray as a later, secondary view. **Claude: no tray at all.** Released jobs are re-placed quietly or fall away (row 13); nothing waits to be looked at. |
| 4 | "Plan my week" is the primary experience: the app proposes, Dan edits | **Accept** | P9 ("the app suggests, Dan chooses"). Matches Dan's own words: "it automatically schedules the delves per week". |
| 5 | Editing a proposal is easier than building from empty | **Accept** | Same. Building by hand stays possible (add, move) but is never the default path. |
| 6 | This week is the main view; next week is secondary | **Accept** | Weekly rhythms, Keys and the fresh start are calendar weeks (P6). A rolling window makes "4 this week" shift daily. Next week appears only as a quiet link, and through the Sunday offer. This answers Dan's taste question 1 unless he disagrees. |
| 7 | Course: 4 meaningful sessions of about 1 h, not 12 h; 12 h at most a "stretch aim" | **Modify** | The conflict is real: a 12-hour threshold makes 8 good hours "a miss", against P5 ("one hour counts as done") and the review's own "enough before ambition". But **Dan set "3 hours on 4 days" himself, and his rhythms are his (D-030)**. So: the rhythm keeps his numbers as the *plan* (4 days, 3-hour runs). A session **counts** once its first hour is done (P5, applied to every session). The other 2 hours are "more": they move him and are never "missing". **Rejected:** a visible "stretch aim: 12 h", which is a bar above enough (UX 6). **For Dan:** a course day counts at 1 hour (recommended), or only at the full 3? |
| 8 | Separate "enough" from "more" | **Already resolved** | D-011, D-039, D-044, `CORE_LOOPS.md` ("beyond the target … it all counts"). Adopted as the planner's wording: "Enough is fixed before more begins." |
| 9 | Core Keys must not scale with the number of rhythms | **Accept** (mostly resolved) | D-043 F6 and D-035 already fix the core story's order, so extra Keys open side things and never pull core marks ahead. Added: **the core story's pace does not depend on how many rhythms exist**, and a new rhythm earns Keys only from its next full period (extends F7). Step 3 sets how many Keys a week the core can take and what the rest open. |
| 10 | Never reward keeping to the plan | **Accept** | Proposal §4 already dropped the waypoint landmark. |
| 11 | Changing the plan is free and silent | **Already resolved** | Proposal §2. |
| 12 | Show only what happened; keep planned-vs-done internally; explain suggestions if asked | **Modify** | Keep the internal record: the first playable already has the app note by itself what Dan started and when (`GAME_DESIGN.md` → the test), and the planner can use it later. It is never shown by default and never becomes a statistic. **Rejected for now:** an "explain why" feature. Nothing in the first playable needs it; revisit if Dan asks. Stored data stays minimal (`OPEN_QUESTIONS.md` → ethics). |
| 13 | No catch-up avalanche, as an explicit invariant | **Already resolved; made explicit** | D-038, D-043 F12. Written as a planner rule: **a released job is only re-placed on a day still below its Normal size; otherwise it falls away.** |
| 14 | Capacity always overrides the plan | **Already resolved** | P3, D-043 F2, proposal §3. |
| 15 | Tell rhythms, appointments, deadlines and one-offs apart, without categories to manage | **Accept** | Most already exist: rhythms; appointments (P10, "life happens"); dated satchel items, which are deadlines (D-038); one-offs. The planner tells them apart **from what Dan typed** (a time makes an appointment, a "by" date makes a deadline), never from a category picker (P9). An appointment stays on Today even on a Low day and counts as a main job (P10). |
| 16 | No full recurrence engine in the first version | **Accept** | First version: *N a week*, *on set days*, *every 2 weeks*, with an optional length and time. Monthly comes later. |
| 17 | "2–3×": the lower number is the target; never show "2/3" | **Modify** | Simpler: **no ranges.** One number is enough; any extra already counts as more (D-044). Counts are never shown anyway (UX 6). |
| 18 | A much thinner first version | **Accept, with one keep** | Cut as the review says. Keep the Sunday offer: it is one line on a page that already exists, and the review's own walkthrough uses it. Moving is by tap in the first version; drag only if Phase 7 finds it cheap. |
| 19 | Defer Google Calendar | **Accept** | It was always "later" (D-020). An appointment typed in takes seconds. |
| 20 | Defer learning; start with simple rules | **Accept** | "Plan my week" uses fixed rules first (`PLANNER.md`). The morning suggestion's quiet learning from swaps (agreed in Phase 2) is unaffected. |
| 21 | The Sunday offer stays genuinely optional | **Already resolved** | Proposal §2. |
| 22 | Don't make Dan decode a metaphor to see "gym Wednesday" | **Accept** | Already a rule (D-038 point 15: readability beats diegesis). The planner is plain days and plain job names on a strong scrim; the world is behind it and the route is a thin line beside it. |
| 23 | Keep waypoints as a forecast | **Accept** | "Planning changes the forecast; doing changes the world." |
| 24 | Planning never creates progress | **Already resolved** | P16, D-038 point 11. |
| 25 | A normal planning session takes a few minutes | **Accept** | As a UX goal, not a timer. |
| 26 | Once the course is at "enough", stop suggesting it first; never cap its reward | **Already resolved; made explicit** | P5 and the morning lean; D-044 (no cap). Planner rule: once a rhythm's enough is met, it no longer leads Today's suggestion that week. |
| 28 | Walkthrough: an unplanned gym session counts fully, and the plan adapts | **Accept** | Planner rule: **the plan never holds more of a rhythm than its enough.** Once the week's enough is met, remaining planned sessions quietly leave the plan (Dan can still do more). Off-plan work always counts in full. |
| 29 | "The plan is a forecast, not a promise" | **Accept** | The planner's first rule. Proposed as a line in P16 once Dan approves. |
| 30 | "The app proposes structure; Dan edits reality" | **Already resolved** | This is P9. |
| 31 | "Enough is fixed before ambition begins" | **Already resolved** | P2 and D-011. Used as wording. |
| 32 | "Planning predicts progress. Action creates progress." | **Accept** | The planner's second rule (P16 in one line). |
| 33.17 | Mock up the planner before locking it | **Accept** | Done alongside this file (`design/directions/d-combined/week.html`, `rhythms.html`, `today-planned.html`). |

**Rejected:** the "stretch aim" label (row 7); the tray even as a secondary view (row 3); an "explain why" feature in the first playable (row 12).
