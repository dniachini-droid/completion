# Scope: accessibility (text size, VoiceOver, contrast, a light mode?)

> Stage 4 of the productivity track (`product/PRODUCTIVITY_PLAN.md`, D-107). Docs only; nothing is decided until Dan chooses. Spoiler-free. The audit below was read from the code on 2026-09-27 (`app/src/ui/`). It has not been tried on a phone.

## 1. What it is and why
**The finding** (`product/PRODUCTIVITY_REVIEW.md`, "Also noted"): no Dynamic Type, dark mode only, missing VoiceOver labels on several screens, and dim grey text on the Week and the Satchel. **What the code shows:**
- **Text size is fixed.** 60 font sizes are set in pixels across 17 of the 27 screen files (Today 11, Week 10, Cut 5, Rhythms 5, Satchel 4, Marks 4, Records 4, Map 3…), plus 21 in `direction.css`. Only RunSet uses relative sizes. `base.css` pins the page at 100% (`-webkit-text-size-adjust`), so the iPhone's Text Size setting changes nothing. The lock-screen panel (`DelveLiveActivity.swift`) also uses fixed sizes, from 10 to 30 pt.
- **Below the app's own floor.** `DESIGN_SYSTEM.md` says carved labels are at least 14 px; `UX_PRINCIPLES.md` §3 says 13. Found:
  - The Week's day names are at 13 px (carved).
  - The Week and Rhythms day buttons, Today's foot and nav words, and the Records/Marks switch are at 13 px.
  - The "new" caption in Marks is 11 px.
  - Trial-only text (the rehearsal badge, the Daybook's trial link, Proto) is at 10.5–12 px.
- **VoiceOver is better than the review says.** There are 130 labels and states in the markup:
  - every back link has words, and its arrow is hidden;
  - paintings, fog and washes are hidden;
  - the delve ring is a labelled timer, and the length dial a slider;
  - the + and − buttons, the satchel's tick boxes and the Week's + are labelled.
- **The real VoiceOver gaps:**
  1. **Changing screens moves nothing.** `App.svelte` swaps screens with no focus handling. VoiceOver can stay on something that has gone, and the new screen's title is never read.
  2. **"Not today" on Today's rows can't be reached.** It exists only while a row is swiped (`Today.svelte`), and VoiceOver uses swipes for itself. Only the leading job's "Not today" link works.
  3. **Three text boxes have no label.** The name box in What repeats has none at all. Choose's new-job box and the satchel's paste box have only their grey hint.
  4. **Smaller gaps.** A done row on Today reads as "dimmed", not "done". The *someday* tick boxes don't say whether they're ticked. The marks are drawings with no words, which is part of the puzzle, so this is left as it is.
- **Contrast.** The quietest text colour (`--ink-3`) measures 8.6:1 on the darkest stone, 5.5:1 on the lightest stone colour, and falls under 4.5:1 on anything lighter. The Week and the Satchel sit on a blurred painting of the current place, and they use this colour for past days, a day's summary and ticked lines. The true figure depends on the place: it has to be measured on screenshots, not guessed.
- **Already there:** reduced motion is honoured in 5 files (the map, the cut, the stair, the length dial and the shared drift).

## 2. What Dan sees, tap by tap
- **Text size:** Dan sets Settings → Accessibility → Larger Text on his iPhone. The app's words grow with it, up to a cap. The paintings don't change.
- **VoiceOver:** each new screen reads its title first. Every row on Today offers "Not today" in VoiceOver's actions menu (swipe up or down).
- **Contrast:** with the iPhone's Increase Contrast switched on, quiet text brightens one step and the washes behind lists get stronger.
- Nothing changes for Dan if he uses none of these settings.

## 3. Rules and facts
None. This is presentation only: no change in `core/`, no new fact types, no save change.

## 4. Native work and Apple permissions
- **No permissions.**
- **Dynamic Type:** the web view does not follow the phone's text size by itself. Capacitor's own Text Zoom plugin reads the phone's setting and applies it (to confirm on the phone). `base.css`'s pinned 100% has to give way to it.
- **The lock-screen panel:** Swift changes to use the system's text styles, within Apple's fixed panel height.

## 5. Risks
- **The look.** Carved capitals are letter-spaced and set on one line (the main button doesn't wrap). At large sizes they will overflow. Hence a cap, or layouts that wrap. The delve ring and the length dial hold text in a fixed circle.
- **Rule 16.** Bigger text pushes the main button down. It must stay in view, with the words above it scrolling (`base.css` `.scroll` already does this).
- **The calm and theatre.** None: nothing new to look at or count.
- **A light mode.** Every screen is a painting in violet dark (`DESIGN_SYSTEM.md`). A light mode would mean washing out or repainting 89 places, against the chosen look. Not proposed.

## 6. Effort and options for Dan
- **A.** The fixes only: a title read on each screen, "Not today" reachable, labels on the three boxes, the 13 px labels back to 14, Increase Contrast honoured. (S, about half a session.)
- **B.** A, plus Dynamic Type up to a cap (about one and a third times), and the screen walk run at the largest size. (M, about one session.)
- **C.** B with no cap, up to the largest accessibility sizes: layouts that wrap, the lock-screen panel on system text styles, and contrast measured behind text in the screen walk. (M–L, about two sessions.)
- **D.** C, plus a light mode. (L, several sessions and new paintings; not recommended.)

**Claude's recommendation.** A now: it is cheap, and it fixes real faults, including one that goes against the design's own 14 px rule. B if Dan's phone uses larger text. C only if other people will use the app. No light mode.

## 7. Questions only Dan can answer
1. Is your iPhone's text size set larger than standard? Do you ever squint at the Week or the Satchel?
2. Should the app follow your phone's text size, even if the carved lettering then looks less balanced?
