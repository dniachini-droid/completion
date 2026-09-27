# (19) Make it smaller: breaking a job into steps

> Stage 4 scope page (`product/PRODUCTIVITY_PLAN.md`, D-107). Nothing here is decided: Dan chooses, then it becomes a D-entry. Spoiler-free.

## 1. What it is and why
- **The finding:** "Starting a task: 7/10. Only the 8 starter jobs have first steps" (`PRODUCTIVITY_REVIEW.md`). Item 19: break a job into 3–5 tiny steps, suggested and editable, shown one at a time (as Goblin.tools does).
- **Partly covered already (fact):**
  - "I can't start" gives one written first step (P4, `TOOLS.md`).
  - Stage 2 adds a first step to every job, and asks "What's the first thing you'd touch?" when a job has none, and keeps the answer (`PRODUCTIVITY_PLAN.md`, item 4).
  - Item 14 shows "Where did you stop?" as the next first step.
- **So the real question** is whether a *suggested* breakdown adds enough beyond Dan's own first step to be worth it. The earlier research said "revisit later; it would need AI" (`TOOLS_RESEARCH.md`, proposal 2).

## 2. What Dan sees, tap by tap
1. On "I can't start" (or in the job's editor): a quiet **Make it smaller**.
2. Three to five short steps appear, each editable, with *Use these · Try again · Write my own*.
3. **Use these:** "I can't start" and the job's Begin now show **only the first step**. A tap on it ("Done, next") shows the next one. Nothing counts them.
4. The steps are kept on the job for next time. Dan can edit or clear them in the job editor (Stage 2).

## 3. Rules and facts
**Where the suggestion comes from (the main choice):**

| Source | Privacy and offline | Quality (Claude's judgement) |
|---|---|---|
| **Dan writes them** | Nothing leaves the phone; works offline | As good as Dan makes them, but it is typing, which is admin (rule 11) |
| **Rules on the phone** (patterns by kind: call, email, book, form, clean, buy; desk or away) | Nothing leaves; offline | Generic ("Open the page", "Find the number"). Risks the baby-talk steps P4 rules out |
| **Apple's on-device model** (Apple's Foundation Models framework, iOS 26) | Nothing leaves; offline | Probably decent for short steps. **Guess:** it needs an iPhone that runs Apple Intelligence (15 Pro or later) with it switched on; to check at build time |
| **A cloud AI** (e.g. Claude's API) | Job names leave the phone. It needs the network (today the app blocks all network use, `SECURITY_PRIVACY.md`), a key inside the app, and a running cost | Best |

- **Fact:** today nothing leaves the phone and the app makes no network requests. A cloud AI needs its own decision and an update to `SECURITY_PRIVACY.md` first (that page's "Later, if ever").
- **Not lore:** the steps are about Dan's real jobs, never the story, so the anti-feature "live AI-generated lore" doesn't apply.

**What changes in the rules:**
- **`core/types.ts`:** `Job` gains an optional list `steps`, saved with Stage 2's `jobSaved`. An optional field is backward-compatible: old saves load, and a job without steps behaves as now.
- **`core/game.ts`:** "I can't start" shows the first unticked step, otherwise `firstStep` as now.
- **Rewards (rule 10):** small steps **earn nothing**. Only the job's minutes do. Ten ticked steps are worth exactly one job.
- **New fact type:** `smallStepDone` (job, step), so the next step shows and the test can see whether steps led to a start. It needs a sample save (D-106). No save version change.
- **Rule tests:** steps earn nothing; the next step follows the last ticked; a job without steps is unchanged.

## 4. Native work and Apple permissions
- Rules, or Dan writing: **none**.
- Apple's model: a small Swift plugin (like `SavePlugin.swift`) and a newer iOS as the minimum. No permission prompt is expected (guess).
- A cloud AI: no Apple permission, but network access, a key and a privacy update.

## 5. Risks
- **Calm:** a list of 5 steps is a small list. Show one at a time; never "2 of 5".
- **Patronising steps** (P4, "no cheerleading or baby-talk"): the biggest risk with the rules and with any AI.
- **Productivity theatre (rule 11):** breaking down can stand in for starting. "Try again" must not become a toy.
- **"The new YouTube":** low.
- **Earn complexity (rule 12):** Stage 2 may already be enough. It is unknown until Dan has used it.
- **Farming (rule 10):** none, because steps earn nothing.

## 6. Effort and options
- **A. Stage 2 only** (Dan's own first step, asked once). Already planned; 0 extra.
- **B. Dan writes up to 5 steps in the editor, shown one at a time.** S, half a session.
- **C. B with suggestions from rules on the phone.** M, 1 session, plus writing the patterns.
- **D. B with suggestions from Apple's on-device model**, and C as a fallback on phones without it. M–L, 2 sessions, including the native plugin, proved only on the phone.

**Claude's recommendation:** not now. Build Stage 2's first step, use it for a few weeks, then decide. If more is wanted, D is the only version with good suggestions that keeps everything on the phone. A cloud AI isn't worth breaking "nothing leaves the phone" for this.

## 7. Questions only Dan can answer
1. When you can't start, is one first step enough, or do you want the next few too?
2. Which iPhone do you have, and is Apple Intelligence switched on?
3. Would you ever accept job names leaving the phone for better suggestions? (Claude recommends not.)
