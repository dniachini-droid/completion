# Camp where you are: the result (D-160) — for Dan

> **Spoiler-free.** No story here. The only areas named are the Mouth, the Lamp Hall, the Salt Gallery, the Box Room and the Stair; everything else is "deeper areas". The plan you're reading this alongside is `CAMP_PLAN.md`.
> Built on branch `claude/camp-where-you-are`. **Nothing is merged and nothing goes to TestFlight without your OK.**

_2026-10-08 (Sydney)._

---

## In one paragraph

It's built and checked. The day now ends only when you press **Go to sleep**, and you camp wherever you are when you press it. Nothing tells you the day is done or that you've done enough. The next day starts from that spot. You go down, and you camp where you end up. You never go back up to sleep. A trip back up happens only when the story gives a reason you'd accept, and the screen says so. Fresh reviewers played all fourteen weeks in the built app at three paces, from a fresh save and from old saves. They judged every screen. Each walk was fixed and played again, ROUNDS rounds in all. The results are below, including what is still weak.

## What you'll notice

- **Go to sleep is always on Today.** Press it at three in the afternoon or at midnight: that's where you camp. The night's screen says where you are and shows one small thing there. A second night at the same spot says "You have camped here before." and adds something new where there's something left to find.
- **No "done" or "enough" anywhere.** The end-of-day card is gone. Finishing your list ends nothing; you can add a job, or go to sleep.
- **If you never press it,** nothing pops up; in the morning you're where you stopped.
- **In bed on time** still gives a small head start in the morning, as before. If you press Go to sleep twice in one night (a nap, more work, then bed), the last one counts as your bedtime.
- **The top is finished before you go down.** You take with you what you'll want to read later, and read it wherever you are. Once you're on the Stair, nothing pulls you back to the top to sleep.
- **When a job's moment happens in another room** (say, the Box Room while you're in the Salt Gallery), its screen says "You go to the Box Room for this", and you camp there.
- **Two trips back up**, both deep down, each with its reason in the first lines of the screen, labelled "Back up". The first word you cut opens the way down; its button now reads "Look through", because you don't go down yet.

## Your save

Your save is from the last build. It carries on cleanly: everything you've reached stays reached, nothing you've seen plays again, and it can't get stuck. You stay where you actually are. A few scenes now sit at the top, before the way down, so a save that's already below hasn't seen them yet. They come as **one** trip back up, told on screen, with its reason. You go up, see them all, and come back down to where you were. The trip costs no walking. Scenes your save already saw under an older name count as seen.

## How it was checked, and the honest results

**The panel.** Each walk is all fourteen story weeks in the built app at phone size (390 × 844). Three fresh reviewers read every move as first-time players. Each move is judged on four questions: where am I, why am I here, does it follow from what I've seen, and is it real progress or filler. A move fails if two of the three fail it.

| Walk | Round 1 | Round 2 | Round 3 | Round 4 | Round 5 | Final |
|---|---|---|---|---|---|---|
| Normal days (~3 h), fresh save | 31 of 108 | 22 of 110 | 16 of 105 | 8 of 105 | 3 of 105 | FINAL_N |
| Short days (~1 h), fresh save | — | 22 of 156 | — | 17 of 151 | 6 of 152 | FINAL_S |
| Long days (~8 h), fresh save | — | 14 of 67 | — | 8 of 65 | 9 of 65 | FINAL_L |
| Saves from the last builds, carried on | heavy | ~40 of 150 | ~47 of 150 | ~25 of 150 | ~17 of 150 | FINAL_O |

**The story reader** (a separate, strong reviewer reading the whole journey start to finish) passes only with no blocking problem and no more than three "should fix" points.

| Round | 1 | 2 | 3 | 4 | 5 | Final |
|---|---|---|---|---|---|---|
| Blocking problems / should fix | 4 / 8 | 2 / 6 | 1 / 6 | 1 / 5 | 2 / 4 | FINAL_R |

Every round's failures were fixed before the next. Most were small: a line naming something you hadn't seen yet, a screen that drifted into a second room, or a camp in the wrong spot. A few were real engine problems. For example, the game lost track of where you were when one job both reached a place and brought a moment from another room.

**What is still weak** (said plainly):
WEAK

**The rest of the bar.** All 597 rule tests pass. Typecheck is clean. Every flow in the app's own suite passes at 390 × 844 and at 360 × 780, large text included (FLOWS). An independent reviewer went through the whole branch looking for bugs. It found four real ones, all fixed with tests:
- last night's camp screen reappearing in the morning;
- a second Go to sleep being ignored when your bedtime was scored;
- a move to another room going unsaid;
- old saves being sent up more than once.

## What I'd like you to decide

1. **Locked things left at the top.** If you open one of them later with a Key from the Map, it's a trip you choose: you go back up for it, then back down. That's the one way the game takes you to the top after you've gone down, and it never prompts it. If you'd rather not have it, those locks stay shut until a later story reason takes you back up.
2. **The weeks at the top.** Reviewers still find the days between opening the way down and stepping onto the Stair the slowest stretch. They're shorter now. Tell me if they feel long when you play.
3. **Merge and TestFlight:** only with your OK.

## Decisions recorded

D-161 (how D-160 is built: where you are, and where you camp) and D-162 (saves from earlier builds under D-160), in `docs/DECISIONS.md`.
