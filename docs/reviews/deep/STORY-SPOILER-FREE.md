# Deep review: the story's wiring (spoiler-free)

_Round 5 review, 2026-10-01. Safe for Dan: no story content, no names, no ids. The full report is sealed (D-015) and is for Claude's story sessions only._

**What was checked:** whether every piece of the story the app carries is connected properly. Each piece has to point at things that exist. Each one has to be reachable, show once, and come in the right order. Text has to be clean. Nothing secret can leak outside the sealed folders. To check this, a simulated player played through all 14 story weeks at several paces. This time he also spent his Keys, which the existing tests never do. The checks are written as tests (`app/tests/review/deep-story.test.ts`, 26 checks, all passing). A passing check marked "FINDING" means the problem was reproduced.

## The short version

The wiring itself is sound. Nothing points at something missing. Nothing plays twice, and nothing shows before what it depends on. With Keys spent, every sealed niche, record and find in the 14 weeks can be reached. Every place and camp view has its painting. Nothing secret leaked into the app's ordinary text, the open docs, the tests or the last 60 commit messages.

What's left mostly comes from one change: the story no longer waits for the calendar (D-123). The end-of-week page, the bedtime line and the monthly summary still run on calendar weeks, so for a fast or slow player they fall out of step with where he actually is.

## Findings

| # | What happens (mechanically) | How many | Severity | Needs a story decision? |
|---|---|---|---|---|
| 1 | The end-of-week page's short glimpse can describe something as still closed after the player has already opened it. This happens because the page runs one calendar week at a time while the story runs ahead. | 4 glimpses can do this. 2 do at a normal pace, 3 at a fast pace | **High** | Light. Mostly wiring: each glimpse needs a "stop showing once…" condition |
| 2 | One week's bedtime line can never play. Its condition is met only when that story week is already over. | 1 line | Medium | Small |
| 2b | More generally, a player who gets through a whole story week between two bedtimes loses that week's bedtime line for good. | rule-level | Medium | No (wiring) |
| 3 | In four story weeks, the morning that should follow the bedtime line arrives before it. | 4 mornings | Medium | No. Either accept it or reorder |
| 4 | The end-of-week page shows one glimpse and three "learned" lines per calendar week. At a fast pace it ends up many story weeks behind. In one run it was 9 weeks behind, with half the learned lines still unshown 5 weeks after the story ended. | rule-level | Medium | No (wiring) |
| 5 | Monthly summary: one month has six lines but only five can ever show. Also, the summaries are tied to play weeks 1, 5, 9 and 13, so a player working about half the days got empty summaries in months 3 and 4 and never saw those lines. | 1 line never shows. 10 lost for a slow player | Medium | No (wiring) |
| 6 | One clue that the story plan says is "handed over once" is repeated in six different places. One of them is a welcome-back question that leads straight to it. | 1 clue, 6 places | Medium | **Yes** |
| 7 | Most story items that now open on their own as you walk (the change that stopped Keys holding up the story, D-129) still describe themselves opening the way a Key-locked thing does. The app elsewhere teaches that this look means "needs a Key". | 29 of 33 items | Medium | **Yes** |
| 8 | Some text shows literal asterisks (leftover formatting marks) on screen. | 13 texts | Low | No |
| 9 | Straight and curly apostrophes are mixed, so they can look different on the same screen. | about 30 texts use the other style | Low | No |
| 10 | Some text still talks about calendar weeks ("your first week", "the week ends"). | 4 lines | Low | Wording only |
| 11 | Naming slips: one place name uses a word that was kept for a different place; one name is used once and never again; two places' names come in an odd order; one object is called by two names. | 5 small slips | Low | Some (names) |
| 12 | Content that exists but almost never shows: one glimpse (normal pace), two camp views (any pace), and two "push deeper" moments that only come on pushing days. | 5 items | Low | No |
| 13 | Each bedtime line has a planned note on what the next morning should point to, but nothing in the app reads it. The morning's "read" link picks a record by a general rule instead, often not the intended one. | 13 notes | Low | No |
| 14 | Two symbols offered in the last week have nothing yet that confirms them. This is intended, because they settle in weeks not yet written. Noted so no one "fixes" it. | 2 | Info | No |
| 15 | Two of the sealed planning documents disagree about where one small object is. | 1 | Low | **Yes** (which document wins) |
| 16 | Out-of-date code comments and unused data left over from before D-129. | 3 spots | Low | No |

## What needs Dan, and what doesn't

- **Wiring only, no story decision (Claude can do these):** 2b, 3, 4, 5, 8, 9, 13, 16. Most of 1 too, since each glimpse needs a condition and which event sets it is plain.
- **Needs a story decision**, to be made in a sealed story session and never shown to Dan in chat: 6, 7, 15, and the small calls in 2 and 11. Dan needs to know only that a few story wording choices are pending. He doesn't need to know what they are.

## Suggested order

1. The glimpses (1) and the asterisks (8). Small, and they're the things a player would actually notice.
2. Bedtime lines and mornings (2, 2b, 3), so they follow story progress rather than the calendar week.
3. The monthly summary and the end-of-week pace (4, 5).
4. The story calls (6, 7, 11, 15) in the next sealed story session.
5. A tidy pass for the rest (9, 10, 12, 13, 16).
