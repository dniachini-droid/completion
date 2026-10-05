# The route, rebuilt as a journey: the result (D-154, Stage 2) — for Dan

> **Spoiler-free.** No story here; the detail is in the sealed record. The only areas named are the Mouth, the Lamp Hall, the Salt Gallery, the Box Room and the Stair; everything else is "deeper areas".
> Built on branch `claude/route-chapters`. **Nothing is merged and nothing is on TestFlight yet:** that waits for your OK.

_2026-10-05._

---

## 1. In one paragraph

The journey is built as you approved it (pace (a)): one way down with home at the top, and an evening at camp for what's worth seeing up there. Every place is now one of four kinds, and the screen says which: a new area, the next place on, a turn-off on the way back, or an evening at camp. Location reads "Area · place" everywhere. The Survey Cut is the Box Room. Your save carries on. The built app was played through all 14 story weeks, from a fresh save and from old-order saves, and judged move by move by fresh reviewers. That went nine rounds. It went from about two moves in three passing to 75–78 of 79 on a fresh save, and 83–89 of 90 on old saves. In the last rounds, every move to another area said how and why you went. What reviewers still fail is either a split between them or the look of a few screens, which are yours to call (§6).

## 2. The playthrough verdicts (the acceptance test)

The built app was played on a phone-sized screen (390 × 844). A fresh save went through all 14 story weeks: 79 moves. Saves made under the old order of places, stopped at nine points you could be at now, were then played on for 10 moves each: 90 moves. Every screen that played was captured, with Today's heading afterwards and the Map's box. Each round, **two fresh reviewers** read the whole journey as first-time players. A new pair read each round, and none had any part in the design. They judged every move: *do I know where I am, do I know why I moved, does the area read as a place with places in it?* They passed or failed each move, and after each round I fixed what failed and played it again.

| Round | Reviewer 1: fresh save | Reviewer 1: old saves | Reviewer 2: fresh save | Reviewer 2: old saves |
|---|---|---|---|---|
| 1 | 50 of 80 | 58 of 90 | 63 of 80 | 74 of 90 |
| 2 | 47 of 79 | 45 of 90 | 63 of 79 | 80 of 90 |
| 3 | 68 of 79 | 83 of 90 | 74 of 79 | 88 of 90 |
| 4 | 74 of 79 | 83 of 90 | 72 of 79 | 85 of 90 |
| 5 | 77 of 79 | 88 of 90 | 77 of 79 | 89 of 90 |
| 6 | 77 of 79 | 89 of 90 | 71 of 79 | 86 of 90 |
| 7 | 78 of 79 | 89 of 90 | 78 of 79 | 88 of 90 |
| 8 | 78 of 79 | 88 of 90 | 76 of 79 | 84 of 90 |
| 9 | 77 of 79 | 86 of 90 | 75 of 79 | 83 of 90 |

(Reviewer 2 was on a different model from round 3 on: the first one ran out of usage credits. Round 6's reviewer 2 was the strictest yet: it failed a return that said how you got there but not why, which earlier reviewers had passed. Those got their reasons in round 7. From round 8 the reviewers began to disagree. A move one failed for saying "Arrived", the next failed for saying "Back again". So the loop stopped there, rather than chase one reviewer's taste against another's.)

**Weeks 3–4, the thing you asked me to watch.** In every round from 2 on, every reviewer said the same thing plainly: it does **not** read as being made to stay at the top. Each day goes one place further down the Stair, and the evenings are clearly evenings. Several said it still feels "slowed" or "pulled home", because the evenings carry a lot of the reading. Two evenings that came back to back were moved apart in round 3, and one was moved two weeks later. On a fresh save, no two evenings now come in a row on the Stair; each day's walk down sits between them. An old save that was holding an evening can still have two nights in a row once.

## 3. What you will notice

- **Today's big title is the area you're in** (for example "The Stair"). The place inside it is the line underneath, and you can tap it to read it again. The title only changes when you move to another area.
- **Every arrival says what kind of move it was**, in the small gold label at the top:
  - **A new area**: the first place in an area, with one line on how you got there.
  - **Arrived**: the next place in the area you're in.
  - **Back again**: an area you've been in before, with how you got there and why.
  - **On the way back**: a turn-off on your way back up, for a reason the place gives.
  - **Tonight, at camp** (or **Last night, at camp**): an evening at home. It doesn't move where you are.
  - **Where you turned back**: a day that ended short of a new place. It is always in the area you're walking, and it doesn't move you either.
- **Evenings at camp.** Once the way down is open, the things worth seeing at the top come as evenings:
  - they play when you say goodnight, or the next time you open the app if you skipped goodnight;
  - they only come after a day with real work in it;
  - they cost no walking, and they never hold back your next place.
- **The story runs about a fifth faster for the same effort.** That was your pace choice (a).
- **The Map draws one light per area.** Tap an area and its box lists every place in it, in the order you walked them, with the one you're in marked. Its locked things come below. Camp is marked by the lamp.
- **"Area · place" everywhere else too:** the delve screen, Welcome back, the lock screen, and the Daybook (where places can now be tapped to read again).
- **The Survey Cut is now the Box Room.**
- **About a hundred story lines changed:**
  - a reason sentence for each evening and turn-off;
  - lines that assumed the old order;
  - a few place names;
  - every "Survey Cut".
- **Your save carries on:**
  - everything you've reached stays reached;
  - nothing you've seen plays again;
  - you stay where you actually were;
  - anything that moved earlier and that you haven't reached simply comes next.

## 4. Tests run, and their results

- **Rule tests: 583 passed, 14 skipped** (the skipped ones are long checks run on demand). This includes the new route tests:
  - every place is reached once and nothing plays twice;
  - where you are changes area at most 20 times in 14 weeks (it was 48);
  - every move to another area is announced, with how you got there;
  - every evening and turn-off states its reason;
  - nothing names something you haven't seen yet;
  - a night's bedtime line is said once;
  - the finds a day's stop carries still reach you another way;
  - old-order saves carry on to week 14 with no stall, no replay and every move announced. These saves are: one stopped after every place of weeks 1–6, plus three others, including one that used Keys on the Map and then had a week away.
- **Typecheck:** no errors.
- **Every flow in the app's own suite at 390 × 844 and at 360 × 780** (the large-text runs included): 56 of 56 passed, on the build before the last two-label change. After that change, the main walk-through passed again at both sizes.
- **The playthrough:** nine rounds, as in §2.
- **Two independent reviews of the whole branch** (continuity, your save, the code), with no part in the work. The first found one blocker and nine things to fix; the second, one blocker and four. All were fixed. The second found no stall, replay or crash on any old save.
- **A fact-and-spoiler check of every story line this branch changed**, against the sealed record. Everything it found was fixed, with one exception it left to the author (§6).

## 5. Changed from the proposal you approved

- **Turn-offs and short days are labelled as the proposal said.** A turn-off is "On the way back", and a day that ends short is "Where you turned back". A return that is neither says "Back again", with how you got there and why.
- **"The shoebox by the cot" keeps "cot".** The proposal said "bed". But the Box Room's bed is a camp cot in every other line, so "bed" would have given one thing two names.
- **Three places at home moved later, not earlier.** The proposal said places only ever move earlier. In the first playthrough rounds, the Stair weeks read as kept at the top. So three small things at home moved to evenings in later weeks, where they no longer crowd the first nights. I checked that nothing earlier depends on them, and nothing pays off before they come. One other evening moved two weeks later for the same reason.
- **Two small details were added to the deeper areas** so the movement there makes sense. They add nothing to the story, and they are recorded in the sealed record.
- **The proof of your save** covers every point in weeks 1–6 on one sample save. On three others it covers the end of each of weeks 1–6 and the middle of weeks 7, 13 and 14. One of those used Keys on the Map and had a week away. The proposal said every point on all of them; the coverage is as stated here.

## 6. Unresolved, or for you

- **For you, when you play it (taste, not bugs).** The reviewers kept raising these. Each is a deliberate design of the screens, so I haven't changed them unasked:
  1. **Evenings at camp carry a lot of the reading in the Stair weeks.** Every reviewer said it doesn't read as being kept at the top, but several said it "pulls you home". If it feels that way to you, the next step would be one place per evening, or some reading moved onto the Stair itself.
  2. **On arrival screens the words fold under "Look"** after a few lines (D-085). Several reviewers said the line saying how you got there was the one hidden.
  3. **On the Map, "needs a Key" sits under every area with something locked in it** (D-142), including areas you walk through every day. Some reviewers read it as the area itself being locked.
  4. **The Map's box lists an area's places in the order you walked them**, as the proposal said, not by where they sit.
- **Two story names in the later weeks come before they are introduced** (a person, and a role). This is the weeks 8–14 writing, not the route. It goes on the list for that writing's next pass.
- **Old saves.** Two kinds of old-order save already hold, from before this change, a moment that mentions something they hadn't yet seen (the old order skipped past places that weren't ready). What a save has already read stays as it was; the new order plays the missing scene next.
  One more case can't come up for you: a save stopped in the middle of week 14 under the old order meets one place with a slightly wrong way in.
- **Not done, as agreed:** no pull request, no merge, no TestFlight.
