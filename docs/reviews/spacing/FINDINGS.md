# The spacing review (Dan, 2026-10-03)

Dan: "review the button and text placement throughout the app … gaps too big or too small." Four reviewers, each a
group of screens, compared every screen at 390 × 844, 360 × 780, 440 × 956 and 390 × 844 with text at 1.3×, measured
the borderline ones in the running build, and found each cause. Merged and de-duplicated here. **Spoiler-free**: no
story text, elements by role only (D-015). Ids: **T** Today and the day, **D** the delve and around it, **S** the
Satchel, editors, Week, Settings, **M** the Map, records, the cut, the Daybook. Sizes in CSS px.

Note: the larger-text pictures of the short flows were not actually enlarged (those scripts don't read TS); the
reviewers checked the larger text in their own runs.

## Must fix: touching, overlapping or cut off

| Id | Where | What's wrong | Fix (cause) |
|---|---|---|---|
| X1 | Every delve end, Step, the record "opened" screen, Course "enough" | The story text under a heading is pulled up 12 px into it (overlaps by 3–6 px) | `Words.svelte` `.scroll`/`.plain .scroll`: `margin-top: 0` (it inherits base.css's −12 px); first story line 8 px under the heading (`Delve.svelte` `p.say` 8px 0 16px) |
| X2 | Every delve end, Step, Today's road | The road's "next place" label hangs 12 px below its box: 2 px from the label under it, overlapping by 4 px at large text; the side-chamber label touches its arch at large text | `EndRoad.svelte` `.road { height: calc(44px + 20px * var(--ts)) }`, side label anchored upward (`bottom: 12px`) |
| X3 | Today, Satchel and every list | A job name sits 1 px under the hairline above it; rows with notches have all their space below; time and tick ring sit lower than the name | `.row { padding-block: 8px }`, notches `margin: 6px 0 0`; time and ring aligned with the name on rows with notches |
| T1 | Today, day complete | "In the Satchel, choose what comes next" overlaps the Keep going button by 4 px | `.next .soft.to-satchel { margin: 8px 0 0 }`; the "deeper" line centred like its neighbours |
| T2 | Today at 390 × 844 and 360 | "Can't get started?" sits half-faded just above Satchel · Week (the list overflows by 34 px) | Trim the head: key line 8px auto 0, Add a job label 16/8, `.cant` 0 (saves ~16 px); see **C1** for the rest |
| T3 | Today at 360 and large text | The top bar wraps: the gear (or Records) drops to a line of its own and pushes the place name down 44 px | `.navs` gap 0, links padded 6 px, never wrap (the group moves as one at large text) |
| T4 | Today near bedtime | The gold "Go to sleep" button is half under the list's bottom fade | Tonight's block moves out of the scrolling list, fixed above it |
| T11 | Today at 360, a delve carried on | "Finish here" runs 9 px past the column edge | `.btn-row.lead` stacks under 370 px wide |
| D3 | Run set-up at large text | "Towards the next place" is cut off at the right | `runset.css` heading may wrap (balanced) |
| D4 | "Not yet" / Finish here end | The "Where did you stop?" box touches the main button's corner marks | `input.stop { margin: 4px 0 16px }` |
| D5 | The delve (all sizes) | Pause / Finish here touch the "first of two delves" line (0 px) under an empty band | `.dv .two-quiet { margin: 16px auto 0 }`; errand list's bottom margin 0 |
| D15 | Today, an errand run's "What got done?" | Its heading touches the button's corner marks | `.next .lead { margin-top: 16px }` |
| S1 | Satchel (the known "No day yet"), Week, recurring-job editor, Settings | The list scrolls up under the header with a hard cut, so a half-scrolled label looks like an overlap | One shared rule: the scrolling body starts 8 px lower and fades in over 12 px; the Satchel's jump to "Recurring jobs" lands below the fade |
| S3 | Satchel at large text; Week's back label | "Save for later" is cut off; "This week" wraps to two lines | The two buttons wrap only when they must; back labels never wrap |
| S6 | Week day headings | Day name 11 px higher than its total and +; "today" runs into the total at large text | `.dhead` centred; the name wraps under itself when needed |
| S7 | Recurring-job editor at 360 and large text | The "How often" choices run past the column / off the screen | The choices flow onto as many rows as they need, 8 px apart |
| S8 | Recurring-job editor; job editor | Save touches the note box (0 px); 5 px under "More…" | `.editor .btn-row { margin-top: 24px }` |
| M1 | The cut, large text and 360 | An invisible heading takes room, pushing the keys below the screen (the main action can't be seen at large text) | The hidden heading is taken out of the flow until the word settles |
| M3 | Map, a light tapped | Its box cuts the last row in half, no sign it scrolls; at large text "Read it again" is lost | Box height follows text size; a fade at its foot |
| M4 | Map | Two lights' labels overlap by 4 px; the crosshair draws over a label | That one label moves below its light |
| M5 | Map at large text | The left label starts off the screen; another 6 px from the edge; lines touch | Label lines and wrap follow the text size; left label on the gutter |
| M6a | Records / Symbols | The label sits 2 px under the tabs; at large text the tabs' words touch each other and "TODAY" | Label 8 px lower; at large text see **C4** |

## Should fix: clearly uneven, cramped or loose

| Id | Where | What's wrong | Fix |
|---|---|---|---|
| T5 | Tonight | Uneven gaps; the paragraph nearly touches the input | 8/16 px steps, duplicate rule removed |
| T7 | Today, "Did they reply?" | Two hairlines 10 px apart look like a glitch | One hairline |
| T9 | Today, "waits until …" and "only that job left" lines | 5 px under the button's corners; wrapped text left, its link centred | 8 px above and below, centred |
| T12 | The morning | The label sits nearer the line above than its own text | 16 px above it, 8 below |
| T13 | The welcome back | Label tight under the back link (14 px less than the morning); "Read the last record" crowds the button | Same steps as the morning |
| D6 | Delve-end headings | Two-line headings look like two separate lines (35 px apart); a lone last word | Line height 1.2, balanced lines |
| D9 | Arrival, Step | The two "read" links are 62 px apart, looser than anything around them | No extra gap between their rows |
| D10 | Arrival | The note under Keep going is 2 px from it | 8 px |
| D11 | Errand delve and its end | The tick lists are narrower than the buttons and change width between screens | On the column's edges |
| D13 | Run set-up | Road labels as close to the count line as to their road | Count line 8 px lower |
| D14 | Run set-up | More empty space above the dial than below | Dial 16 px higher on normal phones |
| S2 | Satchel | "Add to today" is italic and smaller, 6 px above / 14 below (a note's style catches it) | The style keeps to the note |
| S4 | Satchel | (with X3) rows jump between 48 and 67 px | Every row 8 px above and below |
| S5 | Satchel, "No day yet" | List / Put on a day sit nearer the next job than their own | Links 8 px closer to their job |
| S12 | Week's job sheet | More room at the bottom than the top; the seven day buttons cramped, overlapping at large text | 16 px top and bottom; days wrap at large text |
| S13 | Remind me (Settings, Week, editor) | "At the time" wraps, boxes uneven, text against their sides | Tighter letters; 2 × 2 at large text |
| M7 | Records list | Two-line titles nearly touch the hairlines; no line under the last | 8 px above and below; a closing hairline |
| M8 | Map, Records, Symbols, Daybook, the cut, the stair | The label → title gap under the top bar is 0–14 px, different on each | 8 / 8 everywhere |
| M9 | Daybook | Section labels float between sections; scrolled text butts against the header | 32 px above a section label; a fade under the header |
| M10 | The cut | The box jumps 50 px when "Later" goes | "Later" keeps its room (hidden) |
| M11 | Symbols | The read-out crowds the grid; at large text the grid vanishes | The read-out scrolls on its own; the grid keeps 120 px |

## Polish

T8 the reply's links 8 px past the name · T14 a slid row's time touches "Not today" · D12 the park-a-thought panel wider
than the column · D16 label → place name 4 / 8 / 12 px on different screens (8 everywhere) · D17 a find's spacing differs
between the delve end and Step · D18 the scrolling story fades under the button's corner marks (8 px) · S10 "More…" 8 px
in from the column · S11 "Plan my week" crowds Monday · S14 "Gone from your lists" left, its links centred · S15 the job
menu 8 px wider than the column · S16 small alignments (the Week's calendar line, Settings' calendar row, 4/6/10/14 px
steps onto the 8 px rhythm, the Week's add box at large text) · M12 "Use a Key" 8 px in · M13 Earlier / Later 8 px in ·
M14 guess buttons 10 px gaps and 46 px tall (12 and 48 elsewhere) · M15 Symbols at 440: a 100 px band · M16 empty bands
inside the cut's box.

## Your call (changes how something looks)

| Id | Choice | Recommendation |
|---|---|---|
| C1 | **Today's "Ahead" passage**: show 3 lines instead of 4 on phones up to the standard height (it opens in full on a tap), so the whole list and "Can't get started?" fit without scrolling | Yes |
| C2 | **Today on the biggest phone**: a 100–180 px band of painting between "Ahead" and TODAY. Keep it (the painting shows) or cap it so the list sits higher | Keep it |
| C3 | **Job editors**: Save and Delete move to the foot of the screen, always visible, rather than straight under the fields (where they sit mid-screen with empty space below) | Yes |
| C4 | **Records / Symbols tabs**: move from the top bar to their own row under it, two equal halves (they don't fit at large text) | Yes |
| C5 | **"Parked: …"** (after parking a thought mid-delve): show it in the top bar where you tapped, instead of over the place name | Yes |
| C6 | **The tick sheet's times**: 3 × 3 instead of 4 + 4 + 1, so "1 h 30 min" fits on one line | Yes |
| C7 | **The delve's ring on bigger phones**: a little larger (up to 290 px from 250) to fill the empty painting above and below | Yes |
| C8 | **Step** (a tick's return): the road above the heading, in the same order as a delve's end | Yes |
