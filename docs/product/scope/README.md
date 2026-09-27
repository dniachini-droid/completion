# Stage 4: the scope pages, and what Dan chooses

> The productivity track's Stage 4 (`product/PRODUCTIVITY_PLAN.md`, D-107). One page per larger idea, each with options from smallest to fullest and Claude's recommendation. **Nothing here is decided until Dan chooses**; each choice then becomes a D-entry (from D-111), and the chosen items are ordered into Stage 5 onwards. Spoiler-free: mechanics only; any story side goes through the sealed process.

## The choices at a glance
| Item | Page | Options (smallest → fullest) | Claude recommends | When |
|---|---|---|---|---|
| (9) Calendar import | `09-calendar-import.md` | A events in the Week · B + busy days get less · C + a line on Today | **B** (M, 1–2 sessions) | After Stage 3 |
| (10) Widget, share sheet, Siri | `10-widget-share-siri.md` | A Siri/Shortcuts/Action button capture · B + share sheet · C + widget | **A** (S–M, 1 session) | Any time after Stage 1 |
| (17) Projects | `17-expeditions.md` | A ordered group · B + month and planning · C + its own door in the world | **C, as B then the door**, only if Dan has real projects (L) | After Stages 2–3 |
| (18) Weekly look-ahead | `18-weekly-review.md` | A as now · B "Still wanted?" sweep · C full look-ahead · D + a moment of the world | **C, no reward** (M) | After Stage 3 |
| (19) Make it smaller | `19-make-it-smaller.md` | A Stage 2's first step · B own steps · C rule suggestions · D Apple's on-device model | **Not now** (use A first) | Look again in a few weeks |
| (20) Month view | `20-month-view.md` | A Week paging · B an "Ahead" list · C grid · D plan from it | **B** (S–M), or A if paging is enough | 2 weeks after Stage 3 |
| (21) Hour-by-hour today | `21-hour-view.md` | A not now · B today's shape · C "could fit" · D time-blocking | **Not now** | With calendar import |
| (22) Body doubling | `22-body-doubling.md` | A Focusmate on the laptop, nothing built · B a link and a note · C a companion in the world | **A** | If Dan uses Focusmate |
| (23) Re-entry nudge | `23-re-entry-nudge.md` | A not now · B once a week after 3 quiet days, off by default · C Dan picks days and hour | **B, off by default** (S) | After Stage 1 |
| Accessibility | `accessibility.md` | A fixes · B text size follows the phone (capped) · C no cap · D light mode | **A** (S), B if Dan uses larger text | Any time |
| Search | `search.md` | A not now · B find · C "last done" in the editor · D + notes and past weeks | **Not now**; C if "when did I last…" matters | After Stage 2 |
| "I'll read it later" | `read-it-later.md` | A make "To today" visible at once · B "Later", read at Tonight · C a setting | **A now**, B only if it feels like a toll by week 4 | Week 4 of real play |
| Onboarding | `onboarding.md` | A not now · B hidden "Start empty" · C three-question start · D guided first delve | **A**, unless someone else will use it | — |

Claude's suggested order, if Dan agrees with the recommendations: **Stage 5** accessibility A + read-it-later A (small, any time) · **Stage 6** capture (10 A) and the nudge (23 B) · **Stage 7** calendar import (9 B) · **Stage 8** the weekly look-ahead (18 C) · **Stage 9** projects (17), if Dan has real ones · then the month view (20 B) if still wanted.

## Things the scoping found that Dan should know
1. **Older docs still say "no notifications" and "no calendar permission"** (`technical/ARCHITECTURE.md`, `technical/SECURITY_PRIVACY.md`, `product/MVP.md`). D-107 changed that; they are brought in step when Stage 1's reminders land.
2. **A count already shows on the Week:** a folded day says "{n} to do" (`week.fold.left`). The design rules (P7) say no counts of undone things. Small fix; Dan's call whether it stays.
3. **A reward for the weekly review** would break "planning earns nothing" (P16, D-038, D-048). The recommendation keeps it reward-free; a reward would need Dan to change that rule on purpose.
4. **Camp is no longer a page** (D-093), so the weekly review can't be "the camp scene" as the review suggested; it would live in the Daybook.
5. **"Expedition" already names Dan's own journey** in the game's words, so projects need another name (question on the page).
6. **Projects were half-designed long ago** (a great gate / door with milestone Keys, `game/CORE_LOOPS.md`, D-019) and never built; page 17 builds on that design.
7. **Two design docs disagree on the smallest carved label** (14 px vs 13 px); the Week's day names are 13 px.
8. **The lock-screen panel turns red when paused** (D-102, Dan's choice), an exception to "no red"; the widget page keeps red out of any widget.
9. **Calendar through Google's private address** (`game/TOOLS.md` §4) would break "nothing leaves the phone"; EventKit, as scoped, doesn't.
