# Review 1: the first playable, seven ways (2026-09-25)

Seven independent critics reviewed the app, each told to find problems, not to praise. A separate sceptic then checked every finding against the code and threw out the ones it could not confirm: **86 of 92 confirmed**. Several critics found the same problem, so the 86 overlap. Story findings name ids only; the detailed story report is sealed (`narrative/sealed/REVIEW_PLAYABLE.md`). Decisions: D-079, D-080, D-081.

**How "fixed" is proved:** where a finding can be tested, it has a rule test (113 in all), and every phone build runs them first, so a build that brings one back cannot reach the phone. The continuity guard (21 simulated six-week playthroughs) checks that the story never runs ahead of where Dan has been. Screen findings were checked with pictures at four phone sizes and the flow walk (81+ screens, both sizes).

**Totals:** Fixed 66, Your call 5, Left as is 10, Partly fixed 5.

## Story and marks (sealed: ids only, details in the sealed review)

| # | Severity | Finding | Outcome |
|---|---|---|---|
| story-0 | blocker | Skipping an optional guess could stop the story | **Fixed** |
| story-1 | major | Some confirmations came before the guess, and only if bedtime was kept | **Fixed** |
| story-2 | major | Keys could open things before they were in view | **Fixed** |
| story-3 | major | Older plain places could open before this week's story | **Fixed** |
| story-4 | major | Some camp lines came before what they describe | **Fixed** |
| story-5 | major | A guess could be asked at an unrelated place (from D-077) | **Fixed** |
| story-6 | major | Two marks were drawn alike, which broke a clue | **Fixed** |
| story-7 | major | Some arrival lines assumed every guess was right | **Fixed** |
| story-8 | major | A guess came a step early, and a close look could come after a change | **Fixed** |
| story-9 | major | Normal weeks ran out of new places; the same camp view repeated | **Fixed** |
| story-10 | minor | The six-week test ends just before a big turn | **Decided (D-082)**: the test runs seven weeks |
| story-11 | minor | After a word works, its mark still read as a guess | **Fixed** |
| story-12 | minor | "The lamp" was ambiguous in some lines | **Fixed** |
| story-13 | major | The week plan and Today could disagree | **Fixed** |
| story-14 | minor | Some lines still described a place after it changed | **Fixed** |
| story-15 | minor | Part of one record never showed | **Fixed** |
| story-16 | minor | Some guess hints read like notes | **Fixed** |
| story-17 | minor | One background question had no set answer | **Fixed** |

## Interface

| # | Severity | Finding | Outcome |
|---|---|---|---|
| ui-0 | blocker | Week plan and Today disagree: a week Dan filled himself does not lead Today (Dan's Friday / Course bug) | **Fixed** |
| ui-1 | major | The '‹ Today' link on the job-done and delve-end screens silently skips the place just reached; it comes back only on a cold start | **Fixed** |
| ui-2 | minor | Delve end with a guess: the ring overlaps the headings, and at 360 wide the main button is pushed off-screen | **Fixed** |
| ui-3 | major | Today on opening has about 17 tap targets; the one next action does not stand alone (Dan: 'too many buttons', 'slop') | **Decided (D-082)**: Dan keeps Today as it is, as long as he can change what's on it |
| ui-4 | minor | One screen, three names: 'Something else…', 'Keep going' and 'Choose a delve' | **Left as is**: minor: the three routes to the chooser are one screen, reached from three places |
| ui-5 | major | 'Start this save again' and the rehearsal switch sit one tap from Today during a six-week test | **Fixed** |
| ui-6 | minor | The record page looks unfinished compared with its mock-up | **Fixed** |
| ui-7 | minor | Back navigation differs from screen to screen and is often stacked | **Partly fixed**: records now return to where they were opened; other screens keep their own back |
| ui-8 | minor | Week screen: stray dots on empty days, notes that wrap, a button label that doesn't fit | **Fixed** |
| ui-9 | minor | Today tells Dan to 'tap one of your jobs below' when there are none | **Fixed** |
| ui-10 | minor | Marks screen: the status 'new' looks like a meaning, and opening it starts a quiz | **Fixed**: Marks opens with nothing selected (D-082) |
| ui-11 | minor | At 375×667 and below, Today's footer and the arrival's text overlap or fall off-screen | **Fixed** |

## Psychology and staying on track

| # | Severity | Finding | Outcome |
|---|---|---|---|
| psych-0 | blocker | Dan's Friday bug: Today still suggests jobs that aren't in the week unless 'Plan my week' was pressed (and the partial fix isn't on his phone) | **Fixed** |
| psych-1 | major | Capacity (Low, opened after 14:00/19:00) hides planned jobs on Today while the Week still lists them for today | **Fixed** |
| psych-2 | major | A satchel line put 'on today' doesn't appear on Today when the planned day is already full | **Fixed** |
| psych-3 | major | 'Not today' on a planned week makes the day impossible to complete from the list | **Fixed** |
| psych-4 | major | A missed appointment is moved to a later day as if it were a movable job | **Fixed** |
| psych-5 | minor | After a miss or an absence, re-placement fills the lighter day and packs the rest of the week to three jobs a day | **Left as is**: minor: re-placing a missed job after a gap can fill later days to three |
| psych-6 | minor | Tapping Begin and then Done within seconds counts as 'started from the app', which contaminates the test's main measure | **Left as is**: noted for the test: a Begin then Done within seconds still counts as started in the app; the test notes will read it with care |
| psych-7 | minor | A satchel line or a line added in Week earns 25 minutes and a full day's slot for one tick | **Left as is**: minor: a satchel line done counts as a job; watched in the test |
| psych-8 | minor | Choosing High on a planned week changes nothing on Today | **Fixed**: a High day adds one job beyond the plan (D-082) |
| psych-9 | major | The prototype controls, including 'wipe the save', are one link from Today | **Fixed** |

## Bugs and rules

| # | Severity | Finding | Outcome |
|---|---|---|---|
| bugs-0 | blocker | A short delve leaves the job stuck as the lead ('Under way') for the rest of the day; the plan can't lead and nothing gets past it | **Fixed** |
| bugs-1 | major | 'Not today' on a planned job makes the day impossible to complete from its list | **Fixed** |
| bugs-2 | minor | A week built only from added lines still fills Today with every job (Dan's exact complaint, second route) | **Fixed** |
| bugs-3 | major | Taking a planned job 'off this week' also deletes Dan's own added line | **Fixed** |
| bugs-4 | major | Missed appointments come back on another day at their old time; the lighter day fills to 3 | **Fixed** |
| bugs-5 | blocker | The daily 'open' runs only on a cold launch, so mornings, week closes, floor Keys and absence depend on iOS killing the app | **Fixed** |
| bugs-6 | minor | A paused ('Step away') run never ends: it blocks Today for days and, when finished, pays out to the old day | **Fixed** |
| bugs-7 | major | A save that can't be read, or has another version, is silently replaced by an empty one | **Fixed** |
| bugs-8 | minor | Story ids missing after a content update crash the whole view | **Partly fixed**: a screen error now shows a way back instead of a blank phone |
| bugs-9 | minor | A job planned for the day can be missing from Today on a Low day, with no row to reach it | **Fixed** |
| bugs-10 | minor | A rhythm added or stopped mid-week on a planned week vanishes from both Today and the Week screen | **Partly fixed**: a rhythm added mid-week joins the plan next week; this week it is one tap away in Something else… |

## Navigation

| # | Severity | Finding | Outcome |
|---|---|---|---|
| nav-0 | blocker | Coming back to the app from the background never 'opens' it: no morning gift, welcome back, week-close page or opening screen | **Fixed** |
| nav-1 | major | Today still disagrees with the week: every new week until Plan my week is pressed, and on weeks with only added lines | **Fixed** |
| nav-2 | major | The Stair's Go down picks a job for Dan; its fallback is the first delve job in content (Course) even when it isn't planned | **Fixed** |
| nav-3 | major | Today during a running delve shows the running job as 'Next' with Delve, I can't start, Already done and Not today | **Fixed** |
| nav-4 | major | Once-each screens don't chain: after Morning (or an Arrival), a new daybook page or welcome waits for the next cold launch | **Fixed** |
| nav-5 | major | Opening a record from an arrival or a delve's return strands Dan: back goes to the Records list, and the arrival or end is unreachable until relaunch | **Fixed** |
| nav-6 | major | The back arrow on a delve end that completed the day skips the arrival | **Fixed** |
| nav-7 | major | The Trial link sits on Today's top bar during the real test: one tap starts a rehearsal on an empty save, two taps wipe the real save | **Fixed** |
| nav-8 | minor | Map's back always goes to Today, whichever screen opened it | **Left as is**: minor |
| nav-9 | minor | Duplicate controls: two buttons to the same place on several screens | **Left as is**: minor |
| nav-10 | minor | The same label means two different things: 'Plan my week' and 'Today' | **Left as is**: minor |
| nav-11 | minor | On a big day, 'Keep going' on the first arrival skips the other unseen arrivals | **Fixed** |
| nav-12 | minor | The empty Today says 'Tap one of your jobs below' when nothing is below | **Fixed** |

## A new player, first fortnight

| # | Severity | Finding | Outcome |
|---|---|---|---|
| newplayer-0 | blocker | The week-start plan offer is skipped, so Monday's Today is filled with unplanned jobs (Dan's bug returns every week) | **Fixed** |
| newplayer-1 | minor | A week that Dan planned by hand still lets Today fill up with unplanned jobs | **Fixed** |
| newplayer-2 | major | Low, or opening the app late, quietly hides jobs that the week still lists for today | **Fixed** |
| newplayer-3 | major | Stopping a delve early locks Today on 'Under way … Done', and Done then counts a full session | **Fixed** |
| newplayer-4 | major | A missed appointment is moved to another day with its time | **Fixed** |
| newplayer-5 | minor | On a planned week, High does nothing and the deep push can't be reached from Today | **Fixed**: a High day adds one job beyond the plan (D-082) |
| newplayer-6 | major | After reopening from the background the next morning, the camp screen offers yesterday's Goodnight | **Fixed** |
| newplayer-7 | major | Two taps from Today wipe the six-week save, with no backup | **Fixed** |
| newplayer-8 | minor | Putting a satchel line on a full planned day makes it vanish, and the Satchel still offers 'Today' | **Fixed** |
| newplayer-9 | minor | 'Not today' takes a job off Today but the week still shows it for today | **Left as is**: minor: the Week still lists a job set aside for today |
| newplayer-10 | minor | The morning after camp can appear days later, and it hides the welcome back | **Left as is**: minor: a morning after camp that waited days shows before the welcome back |

## Phone and the save

| # | Severity | Finding | Outcome |
|---|---|---|---|
| phone-0 | blocker | Any save-version bump, older build or unreadable save silently erases the whole save | **Fixed** |
| phone-1 | blocker | Builds nobody chose can reach Dan's phone mid-test (monthly cron from main, any claude/** push) | **Fixed** |
| phone-2 | major | Coming back from the background never runs the day's 'open': no morning, week close, story week, welcome or 'opened' fact | **Fixed** |
| phone-3 | minor | The rehearsal setting and the wipe button stay in the saved settings; removing the link won't turn rehearsal off | **Fixed** |
| phone-4 | major | The delve-end alert fails without a word when notifications are denied, the phone is on silent, or a Focus is on, yet the screen says a sound will come | **Fixed** |
| phone-5 | major | A startup error or unreadable state leaves a blank screen with no way back except deleting the app, which deletes the save | **Fixed** |
| phone-6 | minor | The 250 ms ticker rebuilds the whole view four times a second on every screen, even with no delve running | **Fixed** |
| phone-7 | minor | The in-app chime is lost for good after the app has been in the background once | **Fixed** |
| phone-8 | minor | Tapping the delve-end alert, or coming back after a delve ended, doesn't take Dan to the end if he had left the delve screen | **Partly fixed**: coming back on a new day shows what waits; on the same day, the delve end shows on the next tap |
| phone-9 | minor | Renaming the app must never change its bundle id, or the save is left behind | **Left as is**: a rule, not a bug: the app id must never change; recorded |
| phone-10 | minor | Text ignores the iPhone's own text size setting | **Left as is**: Dan's text size is fine (D-082) |

## Questions for Dan

- **Q1 (story-10).** The six-week test ends just before the story's next big turn. Run the test for seven weeks so it ends on that answer, or keep six and have the sealed story session bring one answer forward into week 6? The behaviour test is the same either way.
- **Q2 (ui-3).** Today, on opening: the day, Map, Low/Normal/High, Ahead, the next job with one Delve button, three small links (I can't start · Already done · Not today), the day's list, "Something else…", and the four links at the foot. Is anything still too much? If one thing should go, which?
- **Q3 (ui-10).** Should the Marks page open with nothing selected, rather than on a mark waiting for a guess?
- **Q4 (psych-8, newplayer-5).** On a High day, the plan still holds three jobs; going further (and the deep push) is your own choice through "Something else…". Is that right, or should High add a job or two to the day by itself?
- **Q5 (phone-10).** Do you use a larger text size on your iPhone? If so, the app should follow it.
