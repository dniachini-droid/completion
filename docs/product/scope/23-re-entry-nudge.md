# Scope (23): an opt-in re-entry nudge

> Stage 4 of `product/PRODUCTIVITY_PLAN.md`. Item 23 in `product/PRODUCTIVITY_REVIEW.md`. D-107 reversed "no notifications" for things with a time. This nudge is the only exception, and it is **scoped only**, to be built only if Dan says yes. Spoiler-free.

## 1. What it is and why
One gentle notification after the app has gone unopened for a few days. It's **off unless Dan turns it on**, it's sent **at most once a week**, and it's **only sent after silence**. It never goes out on a day he has opened the app.

All five reviewers named "no notifications at all" as the app's biggest real-world risk. The planning expert said: "a bad week can become a lost month". The app already welcomes Dan back kindly (the welcome back, a Low first day), but only once he returns by himself. Anti-features still exclude "notification spam, daily guilt notifications" (`ANTI_FEATURES.md`). The design question is whether one nudge can help without becoming that.

## 2. What Dan sees, tap by tap
1. Daybook → settings (Stage 1's screen) → **"Nudge me if I've been away"**. Off by default. One line explains it: "At most once a week, only after a few quiet days."
2. Nothing happens while he opens the app most days.
3. After 3 days without opening (the same as the welcome back's absence, `ABSENCE_DAYS` in `core/game.ts`), one notification arrives at a calm hour: "Everything's where you left it. One small thing, whenever you like." It says nothing about how long he's been away, and has no badge on the icon and no sound beyond the phone's default.
4. Tapping it opens the welcome back as usual, with one small first step.
5. If he ignores it, nothing more comes that week. **Suggested:** after two nudges in a row go unanswered, they stop until he next opens the app. He is never chased.

## 3. Rules and facts
- **A pure rule** in `core/` (beside Stage 1's `core/reminders.ts`): `nudgeAt(facts, settings)` gives the one moment the nudge would sound. That is the day of the last `opened` + 3 days, at the chosen hour, and never within 7 days of the last nudge. It returns nothing if two nudges went unanswered.
- **Scheduling without a server.** Every time the app opens or goes to the background, it cancels and re-schedules that single alert with the phone. Opening the app therefore always pushes it further away. That's what makes it "only after silence".
- **New facts:** `nudgeChosen { on }` for the switch, and `nudged { at }`. The app can't know a nudge fired while it was closed, so `nudged` is written on return, when the scheduled moment has passed. `opened` gains an optional `via: 'nudge'` when he came in by tapping it.
- **The central test** (`product/MVP.md` → "What the app notes by itself") currently reads "there are no notifications, so every return is Dan's own". With these facts it can tell a return after a nudge from one without, as D-107 requires.
- **Saves:** two new fact types, so each needs its example in `app/tests/rules/save.test.ts` and a sample save (D-106). Old saves load unchanged. Claude's view: raise the save version with an empty upgrade step.

## 4. Native work and Apple permissions
- **Nothing new native.** The local notifications plugin and its permission already exist (asked at the first Begin, `platform/index.ts`), and Stage 1's reminders share them. The nudge takes its own ID, apart from the delve alerts and the reminders.
- If Dan never allowed notifications, the switch says so and points to iOS Settings.
- **Only provable on the phone:** that the alert sounds after days with the app closed, how a Focus mode treats it, and that a tap lands on the welcome back.

## 5. Risks
- **The calm (rule 9).** This is the item most likely to break it. A notification after a bad patch can land as "you've failed again", and with ADHD and anxiety an unopened notification can itself become something to avoid. Safeguards: opt-in, no count of days, no "missed", no streak talk, no badge, and it stops after two unanswered.
- **The new YouTube.** It brings Dan into the app, which is only good if he leaves it again to do something real. The tap goes to one small real step, never to the story or the map.
- **Privacy.** A local notification. Nothing leaves the phone, and there is no push server.
- **Task farming (rule 10).** Nothing to farm: opening and nudges earn nothing.
- **The test (rule 14).** A nudge muddies "does wanting to progress the world bring Dan back?". The facts above keep the two kinds of return apart, but the sample stays small either way.

## 6. Effort and options
Effort: **S**, under one session (the plumbing exists after Stage 1).
- **A.** Not now: rely on the welcome back and Stage 1's reminders: **0 sessions**.
- **B.** The nudge as above, with 3 days and a fixed hour, off by default: **S, under 1 session**.
- **C.** B, plus Dan choosing the quiet days (3, 5 or 7) and the hour: **S, 1 session**.

**Claude's recommendation:** B, built after Stage 1's reminders and left **off**. Dan turns it on only if he notices a quiet stretch turning into a long one. The reviewers' risk is real, but so is the guilt risk. An off switch Dan controls answers both, and the facts keep the test honest.

## 7. Questions only Dan can answer
1. After a few days away, would a gentle note help you come back, or make coming back harder?
2. If yes, what time of day would you want it, and after how many quiet days?
3. Should the words come from the world (the expedition waiting) or plainly from the app?
