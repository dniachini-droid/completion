# Camp where you are: the result (D-160) — for Dan

> **Spoiler-free.** No story here. The only areas named are the Mouth, the Lamp Hall, the Salt Gallery, the Box Room and the Stair; everything else is "deeper areas". The plan you're reading this alongside is `CAMP_PLAN.md`.
> Built on branch `claude/camp-where-you-are`. **Nothing is merged and nothing goes to TestFlight without your OK.**

_2026-10-08, evening (Sydney)._

---

## In one paragraph

It's built and checked. The day now ends only when you press **Go to sleep**, and you camp wherever you are when you press it. Nothing tells you the day is done or that you've done enough. The next day starts from that spot. You go down, and you camp where you end up. You never go back up to sleep. A trip back up happens only when the story gives a reason you'd accept, and the screen says so. Fresh reviewers played all fourteen weeks in the built app at three paces, from a fresh save and from old saves. They judged every screen. Each walk was fixed and played again: ten rounds in all. The results are below, including what is still weak.

## What you'll notice

- **Go to sleep is always on Today.** Press it at three in the afternoon or at midnight: that's where you camp. The night's screen says where you are and shows one small thing there. A second night at the same spot says "You have camped here before." and adds something new where there's something left to find.
- **No "done" or "enough" anywhere.** The end-of-day card is gone. Finishing your list ends nothing; you can add a job, or go to sleep.
- **If you never press it,** nothing pops up; in the morning you're where you stopped.
- **A very short first day** that ends before you've gone in: you camp where you are, at the way in.
- **In bed on time** still gives a small head start in the morning, as before. If you press Go to sleep twice in one night (a nap, more work, then bed), the last one counts as your bedtime.
- **The top is finished before you go down.** You take with you what you'll want to read later, and read it wherever you are. Once you're on the Stair, nothing pulls you back to the top to sleep.
- **When a job's moment happens in another room** (say, the Box Room while you're in the Salt Gallery), its screen says "You go to the Box Room for this, and then back to the Salt Gallery." You don't move: you camp where you were, and Today and the Map agree.
- **"Back up"** is the label whenever a screen takes you upwards, even a few steps, and each one says why in its first lines. The first word you cut opens the way down; its button reads "Look through", because you don't go down yet.

## Your save

Your save is from the last build. It carries on cleanly: everything you've reached stays reached, nothing you've seen plays again, and it can't get stuck. You stay where you actually are. A few scenes now sit at the top, before the way down, so a save that's already below hasn't seen them yet. They come as **one** trip back up, told on screen, with each place's reason. You go up, see them all, and come back down to where you were. The trip costs no walking. Scenes your save already saw under an older name count as seen.

## How it was checked, and the honest results

**The panel.** Each walk is all fourteen story weeks in the built app at phone size (390 × 844). Three fresh reviewers read every move as first-time players. Each move is judged on four questions: where am I, why am I here, does it follow from what I've seen, and is it real progress or filler. A move fails if two of the three fail it.

| Walk | Round 1 | Round 2 | Round 4 | Round 6 | Round 8 | Round 9 | Final (round 10) |
|---|---|---|---|---|---|---|---|
| Normal days (~3 h), fresh save | 31 of 108 | 22 of 110 | 8 of 105 | 7 of 99 | 2 of 99 | 4 of 99 | **1 of 99** |
| Short days (~1 h), fresh save | — | 22 of 156 | 17 of 151 | 10 of 141 | 8 of 142 | — | **5 of 142** |
| Long days (~8 h), fresh save | — | 14 of 67 | 8 of 65 | — | 6 of 61 | — | **6 of 61** |
| Saves from the last builds, carried on | heavy | ~40 of 150 | ~25 of 150 | ~20 of 150 | 22 of 150 | 16 of 150 | **4 of 150** |

(Rounds 3, 5 and 7 were partial; a dash means that walk wasn't judged that round. Round 7 was stopped and redone as round 8 because the fixes landed mid-capture.)

**The story reader** (a separate, strong reviewer reading the whole journey start to finish) passes only with no blocking problem and no more than three "should fix" points.

| Round | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9 | Final (10) |
|---|---|---|---|---|---|---|---|---|---|
| Blocking / should fix | 4 / 8 | 2 / 6 | 1 / 6 | 1 / 5 | 2 / 4 | 0 / 3 (pass) | 1 / 6 | 0 / 4 | **0 / 3 — pass** |

Every round's failures were fixed before the next. Most were small: a line naming something you hadn't seen yet, a screen that drifted into a second room, or a camp in the wrong spot. Some were real engine problems, found by the reviewers or by the independent code review. For example, a job's return could name a room as "back to" before you'd ever been in it, and on a long first day one early moment could be told twice.

**What is still weak** (said plainly):
- **The days at the top after the way down opens.** Every reviewer still names this the slowest stretch: the stair is open and you spend a few more days up top gathering what you'll need. Each of those days shows something new and the screen says why, so none of them fails, but it is where the game feels most like it's holding you.
- **One long climb back up, late on.** Deep down, the only way on sends you a long way back up, and the new way comes out close to where you were. The reason is on screen and it leads deeper, but reviewers read the whole thing as a loop. It's part of the layout of the deeper areas, so I left it for the story's own session rather than change it here.
- **Repeat nights.** When there's nothing new left to find where you are, a second night at the same spot says only "You have camped here before." It's honest, and it keeps the screen short, but on short days these come often.
- **The Map runs a little ahead.** It sometimes lists a locked thing a move or two before the screen has described it (three of the five short-day fails). Its "Ahead" line can also name something behind you.
- **Busy screens.** A few arrivals still carry three or four discoveries at once. On long days, one screen still uses a count a paragraph before the place that teaches it opens (one of the six long-day fails).
- **Old saves.** A save carried on from the old order, already past places it never saw under the new order, can meet a mention of them, and catch-up readings can pile onto one arrival screen. These were 4 of the 150 old-save moves in the last round. They don't stop or break the save.
- **Paintings.** Several camps borrow another place's painting until their own is made, and a few don't match (the reviewers mention a pointed-arch hall behind rooms described as square or rounded). They're listed for repainting.
- **After the last round** I changed two lines of wording that the long-day reviewers flagged (a reason to leave a place, and where some light starts). The rule suite covers them; no panel has re-read them.

**The rest of the bar.** All 598 rule tests pass. Typecheck is clean. The app's own flows ran at 390 × 844 and at 360 × 780, large text included: 55 of 56 passed in one go. The one that didn't (going back from the Map to Today, at 390 × 844) failed once while the rule suite was running on the same machine, then passed twice when run on its own. It passes at 360 × 780. The flows ran on the build before the two wording changes above. Two independent reviewers went through the branch looking for bugs. The first found four, all fixed. The second found two serious problems and several smaller ones. The serious ones and the smaller ones that affect play are fixed, with tests. Two were left on purpose: a place's opening line now starts with what you met on the way there, in the order it happened; and one concerned saves made only on this unreleased branch, which no real save has. The fixes:
- last night's camp screen reappearing in the morning;
- a second Go to sleep being ignored when your bedtime was scored;
- a move to another room going unsaid;
- old saves being sent up more than once;
- one early moment told twice on a long first day;
- "and then back to …" naming a room you hadn't reached on screen yet;
- a job's return telling something before the screen it depends on, and the order of what you met on the way to a place.

## What I'd like you to decide

1. **Locked things left at the top.** If you open one of them later with a Key from the Map, it's a trip you choose: you go back up for it, then back down. That's the one way the game takes you to the top after you've gone down, and it never prompts it. If you'd rather not have it, those locks stay shut until a later story reason takes you back up.
2. **The days at the top.** Every reviewer still finds the days between opening the way down and stepping onto the Stair the slowest stretch (you gather what you'll need before going down). They're shorter than before. Tell me if they feel long when you play.
3. **Merge and TestFlight:** only with your OK.

## Decisions recorded

D-161 (how D-160 is built: where you are, and where you camp), D-162 (saves from earlier builds under D-160) and D-163 (a job's moment in another room is a trip there and back), in `docs/DECISIONS.md`.
