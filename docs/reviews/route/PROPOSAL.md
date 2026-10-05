# The route: what went wrong, and the proper fix (D-153) — for Dan

> **Spoiler-free.** No story here: the detail is in the sealed record. The only areas named are the Mouth, the Lamp Hall, the Salt Gallery, the Survey Cut (and its new name) and the top of the Stair. Everything else is "deeper areas".
> **Stage 1 of 2.** This is the audit and the design. Nothing in the app or the story has changed yet. If you approve this, Stage 2 builds it.

_2026-10-05._

---

## 1. The honest verdict: it was not intentional

You were right. **Movement through the game was never designed.** It is the by-product of how the story was planned:

- The story was written **one week at a time**, as a list of what each week had to show: which symbols you learn, which piece of each old record you read.
- Each week's five places were then filled in **wherever that week's things happened to be**. The order inside a week was simply the order of that list.
- The places added between the story's main moments were chosen to put **something locked in view** at the end of every day. The locked things are spread over every area, so those places hopped too.
- Two of the main records you read a little of each week sit at the **top** of the map. So every week pulled you back up, however deep you had got.
- In the story you **sleep by the lamp in the Lamp Hall every night**. That is the natural reason to see the top again, but the app never shows it. A trip back up looks like a jump, and the next day back down looks like another.
- The game has **no idea of travel**. "Where you are" is just the last place reached. When a place wasn't ready yet, it skipped to the next one on the list, whatever area that was in.
- **Nobody ever checked movement.** Every review looked at pacing, facts, fairness and the writing, never at how you get from one place to the next. One earlier fix (D-079) noticed the looping and fixed only a side effect.

The places themselves are sound. The map behind them is coherent: every area joins the others in a way that makes sense, and every line describes a real spot. **What was never designed was the path between them.**

### The numbers (weeks 1–14, 68 places, as you'd actually play them)

I walked a simulated player through all 14 weeks: ordinary weeks, slow weeks and big weeks. All three meet the places in the same order. Of the **48 times you change area**:

| How it reads on screen | Count |
|---|---|
| A clear reason to go, and the screen tells you | 10 |
| There is a reason, but the screen never tells you (no "you go back up…") | 16 |
| No reason at all: the place was there to fill the week | 22 |

- **15 area changes in the first 20 places.** At worst, 16 in 20.
- **10 times** you go out to an area and straight back with no reason given.
- Before week 6 you never stay more than 3 places in one area.

## 2. Why "the Survey Cut" and other confusions: how the app shows location

I went through every screen that names or pictures where you are. The game has two levels, **areas** (like the Salt Gallery) and **places inside them** (a niche, a far end, a doorway). But the screens mix them:

1. **The same big title means an area on one screen and a place on another.** The Map's titles are areas. Today's title, the arrival screen and the delve screen show a place. The screen after your first word shows an area, but styled like a place.
2. **Eight places have the same name as the area they're in.** So "The Lamp Hall" is both the area and a place inside it.
3. **Nothing ever tells you which area a place is in, or that you've entered a new area.**
4. **On the Map, the area you're standing in hides its own places.** Every other area lists them.
5. **Links that do the same thing look different.** This is your "different looking links to get into each location":
   - Today's title re-reads a place, but looks like plain text.
   - The Map uses small inline names, with camp views mixed in.
   - Locked things are separate rows with their own wording.
   - In the Daybook, places can't be tapped but locked things can.
6. **Locked things look like places**, side by side in the same list.
7. **Area names drift between screens.** One area appears under three different names in different places.
8. **Camp is invisible.** You sleep by the lamp every night, but a short day says "You make your camp at…" somewhere else.

## 3. The fix: a journey you can follow

### The shape of the whole journey (not week by week)

The Site is a **descent with a home at the top**:

- **Home** is the top. The Lamp Hall, where you sleep by the lamp every night, with two side rooms: the Survey Cut (renamed, below) through the doorway in its side wall, and the Salt Gallery round its far corner.
- **One way down** runs from home through the top of the Stair, a flight at a time, into the deeper areas, and on.
- **Side branches** open off the way down. Each is entered when you reach it, walked, and left.
- Later, two ways down **meet**, and the descent goes on as one.

The feel: the first weeks explore home until the first word opens the way down. Then you go down a stage at a time. You come back up each night, and once in a while you turn off on the way home because something you've just learned asks you to.

### The movement principle: every place is one of four kinds, and you always know which

1. **On**: the next place along the way. Most places are this.
2. **A new area**: the first place in an area. It gets its own arrival: the area's name, one line on how you got there, then the place.
3. **An evening at home**: something at the top worth looking at tonight, because of what you learned today. It shows as the evening, back by the lamp, and **does not move where you are**: tomorrow you carry on from where you got to. Its first sentence says why tonight.
4. **A turn-off on the way home**: a branch you've walked before, revisited on the way back up only when something you learned below asks for it. The first sentence says what.

**No more skipping into another area.** If a place isn't ready, the little story moments it waits for play on the way, as long days already do. Your notebook-and-record moments at the top become **evening scenes** too, instead of popping up between two jobs while you're deep down.

**A day that ends short of a place** says where you turned back, not where you "camped": you always sleep by the lamp.

### The numbers after

| Measure | Now | After |
|---|---|---|
| Times "where you are" changes | 48 | **19** |
| … in the first 20 places | 15 | **7** |
| … worst run of 20 places | 16 | **9** (one deeper region has four areas around one spot, and every move there is told) |
| Out and straight back, no reason | 10 | **0** |
| Moves with no reason on screen | 38 | **0** |
| Evenings at home (shown as evenings, not as moves) | — | 18 |

### What changes in the story

- **No canon changes**, and the ending, the truth and the order you learn the symbols are all untouched.
- Most changes **re-order places inside a week**. Four places move to a nearby week, always earlier, never later.
- In the later weeks, **one approach is reversed**, so you walk on instead of doubling back. Every fact stays; only the direction you first walk it changes. This is recorded by the project's retcon rule.
- About **100 lines** are touched: a reason sentence for each evening and turn-off, sentences that assumed the old order, about ten place names, and every "Survey Cut". They go through the usual writing process with cold readers.
- **No new paintings.** Every place keeps its own.

## 4. How location will look in the app

- **One naming rule everywhere: "Area · place"**, for example "The Salt Gallery · the pick niche". No place shares its area's name, and each area has one name only.
- **Today's title is the area** (it changes only when you move area). The place is the small line under it. Tapping it re-reads, and it looks tappable.
- **Arrivals have three looks, one per kind:**
  - **A new area**: "A new area", the area's name large, how you got there, then the place.
  - **Next place in the same area**: "Arrived", the area small above, the place as the title.
  - **An evening**: "Tonight, at camp", "The Salt Gallery · …", lamp-lit, then the bedtime line.
- **The Map stays one map** (your call, D-092):
  - The areas are drawn as the descent: home at the top with its two side rooms attached to the Lamp Hall, the way down as one line, the branches off it.
  - **Camp** is marked by the lamp. **Where you are** is marked separately.
  - Tap an area: its name, **every place in walking order** (including the one you're in, marked), then its locked things in their own list.
  - Every row looks the same: a name and its state ("here", "read again", "needs a Key", "use a Key"). The places come first so you always see them.
  - The next place is marked on its area.
- **The delve and the road line** say "Further into the Salt Gallery" or "On down". They never name a place before you reach it.
- **Welcome back, the lock screen, the Daybook and records** all use "Area · place". The Daybook's places become tappable like everywhere else.
- The screen after your first word becomes a "new area" arrival for the Stair.

## 5. The new name for the Survey Cut

**The Box Room.** Its own first line already describes it as "a small side chamber, like a box room". It says plainly what it is: a small room off the hall, full of someone's things. It never gets mixed up with your own camp by the lamp, and it gives nothing away.

Runner-ups:
- **Her Room**: warm, but it leans on a person before the first week has shown one.
- **The Side Room**: the plainest, but it sounds too much like an area you'll meet later.

## 6. Your save

- **Everything you've reached stays reached, and nothing you've seen plays again.**
- "Where you are" becomes the furthest point you've actually got to. So if the last thing you saw is now an evening at home, the app still puts you where you really were. No teleporting.
- Anything that moved earlier and you haven't reached yet simply comes next, as an evening or the next place on the way, with its reason. No line assumes which place you saw before it.
- This is proven on every sample save, and on saves made under the old order stopped at every point in weeks 1–6 (so wherever you are now is covered), each walked on to week 14.

## 7. How we'll know it's right (the acceptance test)

1. **Rule tests**:
   - every place can be reached, with no stalls;
   - every move has a kind, and every evening and turn-off has its reason;
   - "where you are" changes at most 19 times in weeks 1–14 and never goes out and straight back without a stated turn-off;
   - old saves carry on cleanly;
   - all the existing tests still pass (with any changed number named).
2. **A real playthrough of the built app** on a phone-sized screen (390 × 844). A fresh save is walked through all 14 story weeks, capturing every arrival, Today's title and the Map at each move. Then the same from saves at your possible points under the old order.
3. **A fresh reviewer**, who had no part in the design, reads that whole journey as a player and judges every move:
   - Do I know where I am?
   - Do I know why I moved?
   - Does each area read as a place with places inside it?

   Any move that fails is fixed and the walk runs again, until every move passes.

## 8. The work (Stage 2), and its size

1. The sealed story documents first (they are the source of truth), then the lines through the writing process.
2. The story data: order, weeks, and the "kind" of each place.
3. The engine:
   - "where you are" ignores evenings;
   - evening scenes come at the day's close;
   - no skipping into other areas.
4. The screens: Today's title, the three arrival looks, the Map's drawing and its area box, one link style, the road and delve labels, and the naming on every other screen.
5. Tests, the full playthrough and the reviewer's loop, then an independent review, then you.

**Size:** the biggest change since weeks 8–14 went in. A couple of days of focused build and test work, plus the writing rounds and the reviewer loop. One branch, one pull request, and nothing merged without your OK.

**One thing to watch:** in week 4 you'll spend four evenings in a row at home while the way down waits at the Stair's first turn, because that week's story is at the top. It's the story's own pause, not a wall. The reviewer will say if it reads as being made to stay put, and if so it gets changed.

---

**To approve:** say "Go" (or tell me what to change), and Stage 2 starts.
