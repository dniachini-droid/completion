# "I'll read it later" for story screens between jobs

> Stage 4 scope page (`product/PRODUCTIVITY_PLAN.md`, D-107). Nothing here is decided: Dan chooses, then it becomes a D-entry. Spoiler-free: this is about *when* story screens show, never what they say. **Anything the story itself needs (for example, lines that still read well out of their moment) is scoped separately, sealed** (D-015, D-035).

## 1. What it is and why
- **The finding:** "The story screens are charming in week 1. Productivity reviewers expect them to feel like a toll by week 4 for someone who just wants 'tick, next'" (`PRODUCTIVITY_REVIEW.md` → where the reviewers pushed back).
- **That is a prediction, not an observation (fact).** The reviewers walked a simulated week. Dan hasn't reached week 4 of real play, and the six-week test hasn't started (Phase 10).
- **What already exists (fact):**
  - A job's return shows its story on its own screen, with "To today" one tap away (`ui/Step.svelte`, `ui/Delve.svelte`).
  - The words fold away, and **Look** shows the painting alone (D-085, D-105).
  - A word cut can already be left for later (`ui/Arrival.svelte`).
  - An unseen arrival, the morning, the welcome back and a new Daybook page are always shown before Today (D-080).
- **Why it matters for the test (fact):** "arrivals and records are skipped past; the steps are something to get through" is written down as evidence *against* the game working (`MVP.md` → Evidence against). A "Later" button could hide that signal, or it could rescue the story by moving it to a calmer time. Either way, the test's notes must tell "later" apart from "skipped".

## 2. What Dan sees, tap by tap (option B)
1. Dan finishes a job. The return screen shows as now, with one more quiet link beside "To today": **Later**.
2. **Later** goes straight to Today. The story line, any find, and any mark to guess are kept, unread. Nothing shows a count.
3. In the evening, **Tonight** on Today (D-093) carries one line: *"Something from today is waiting to be read."* A tap plays the kept returns in order, each on its own painting, then back to Today.
4. Anything still unread at the day's end is not a pile. It waits behind one quiet link on that week's Daybook page (new), where it can be read any time. It is never announced again.
5. **Arrivals** (day complete): the gold moment always plays, because it is the day's "Enough". Only its words can be kept for later (option C).

## 3. Rules and facts
- **The world doesn't wait.** Steps, finds, Keys and story beats are still worked out when the job is done (`beatPlayed`, `findGiven`), so nothing changes in the story's order or pace (`BALANCING.md` §2). Only the *showing* is moved.
- **Marks to guess** (D-077) are asked when the line is finally read, never before its marks have been seen.
- **`core/game.ts`:** the view gains a list of kept returns (the job's `jobDone` facts with no `seen`, but a `keptForLater`). `first()` in `ui/App.svelte` doesn't force them.
- **New fact types:** `keptForLater` (what: step or arrival; ref), and, for option C, `storyTiming` (show or evening). Reading one writes the existing `seen`. Each new type needs a sample save (D-106). No existing shape changes, so old saves load, and nothing in them is kept for later.
- **The test's notes:** kept, read later, and never read are three separate things. "Later" is not "skipped".
- **Rule tests:** kept returns play in order; a guess is never asked before its marks are shown; nothing about steps or Keys differs with "Later".

## 4. Native work and Apple permissions
None.

## 5. Risks
- **The core bet:** if Dan presses Later every time, the story isn't pulling him. That is the most important thing the test can learn, and it should be seen, not smoothed over (`MVP.md`, rule 14).
- **Calm (P7, no counts):** an unread queue is a pile. Keep it to one line, no number, gone at the day's end.
- **"The new YouTube":** a stack of story to read on the sofa each evening is a small pull to stay in the app. It is bounded by the day's jobs, so the risk is low.
- **Earn complexity (rule 12):** a third way past a story screen, after "To today" and Look. Unproven need.
- **Farming (rule 10):** none. It changes timing, not rewards.

## 6. Effort and options
- **A. Nothing new.** "To today" is already one tap. Just make sure it is visible at once on every return, with no wait. S, hours.
- **B. "Later" on a job's return, read in the evening from Tonight.** S–M, 1 session.
- **C. B plus a setting, "Story between jobs: show it / keep it for the evening", and arrival words kept too.** M, 1–2 sessions.

**Claude's recommendation:** not now. Check A (one visible tap past the story), then look again at week 4 of real play. If it feels like a toll by then, B, with "later" recorded apart from "skipped" so the test stays honest.

## 7. Questions only Dan can answer
1. Right now, do the story screens between jobs ever feel like something to get past?
2. If you kept them for later, when would you actually read them: the evening, the morning, or never?
