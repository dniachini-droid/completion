# Test Strategy

> Phase 7 (MASTER_BRIEF §72–74). How the MVP is tested on the chosen stack (D-057, D-058): the rules, the story's order, locked information, saves, time, the flows and the look. Spoiler-free: tests about story content live beside it, in the sealed folders.

_Status: written 2026-09-24 (D-059). Tests are written with the features in Phase 8–9, not before._

## What matters most
Dan loses nothing, sees nothing early, and the rules do what the design docs say. **Narrative logic gets tests too** (§73). No coverage-percentage targets: a test earns its place by guarding something a player would feel.

## The layers
| Layer | Tool | Runs |
|---|---|---|
| 1. Rules | Vitest, on core | every push |
| 2. Story order and locked information | Vitest, on core + content | every push |
| 3. Saves and migrations | Vitest, with sample saves | every push |
| 4. Weeks played by a script | Vitest, simulated weeks | every push |
| 5. Flows and the look | Playwright at 390 × 844 and 360 × 780: the whole walk in Chromium, the short checks in WebKit (Safari's engine) too (`.github/workflows/tests.yml`, D-106) | every push touching the app |
| 6. On Dan's phone | By hand, a short list | each TestFlight build Claude flags |

## 1. Rules (from `game/BALANCING.md`, `PLANNER.md`, `TOOLS.md`)
- **Steps:** one per 25 minutes, in proportion; a no-timer job earns its length; splitting a job earns nothing extra.
- **Days:** Low 2 / Normal 3 / High up to 5; opening after 14:00 and 19:00; an appointment counts as a main job; day complete locks in.
- **Keys:** 5 a week at most, **however many rhythms exist** (the invariant, D-047); the floor of 2 with one day complete; a rhythm met past the supply gives one find; a new rhythm counts from its next full week.
- **Finds:** an avoided job always brings one; switching after 4 delves on one job; side chambers halfway between places, whatever the delves (D-122).
- **Delves and runs:** held delve keeps its minutes; pieces never earn more than an unbroken delve; Finish here counts every minute; any run of a whole minute on a repeating job is its day's session, and only sessions of 5 minutes or more count towards a Key (D-121).
- **Planner:** Plan my week's fixed rules; capacity overrides the plan; **no catch-up avalanche**; off-plan counts in full; the plan never holds more than a rhythm's enough.
- **Absence:** 3+ days → welcome back after one small job; first day back suggested Low; no passed-date question that day.
- **Exploit regressions:** every farming route found in play gets a test that keeps it closed (§73).

## 2. Story order and locked information
- Beats arrive **in order**, never ahead of where Dan is; a big day or week goes as far as its minutes reach (D-123).
- Places run ahead **by one story week at most**; signs never early; a partial sign only where written, at most one a week.
- **The "can see now" view never contains a locked item**, in any simulated state (tested by generating many states, not a few examples).
- Every content item's conditions can actually be met (no unreachable story), and every id referenced exists.
- The open route never ends in a wall.
- What was shown stays shown after a rules or content update.

## 3. Saves and migrations
`app/tests/rules/save.test.ts` (D-106), against Node's SQLite with the app's own SQL; sample saves in `app/tests/saves/`.
- Every fact type is saved and read back.
- Killing the app between any two facts loses at most the one in progress, and never corrupts the save.
- **Every save version ever shipped** has a sample save; each one opens, migrates and plays on.
- Save a copy → Load a copy gives the same game.

## 4. Weeks played by a script
Scripted players run whole weeks against the rules (the checks in `BALANCING.md` §8): Dan's honest Normal week (about 40 steps, about 5 places, 5 Keys); a Low week (the floor holds, nothing lost); a huge week (still 5 Keys; the open route extends); a week away (the world waits; the return is kind); six weeks in a row, to check the first word lands in week 2–3.

## Time
Run through layers 1–4 with a fake clock: 03:59 and 04:00; midnight; clock changes in spring and autumn; a trip across time zones; the phone's clock moved by hand; a delve running across 04:00; the app closed for a delve's whole length.

## 5. Flows and the look
- **The heart** (`product/MVP.md`): open → Begin → delve → back → Done → the step → day complete → arrival, then each slice's flows as it's built.
- Screenshots at both sizes for every screen, checked by Claude before a build reaches Dan.
- **Automatic checks for direction D's "Never" list** (`DESIGN_SYSTEM.md`): no red in the interface, text contrast ≥ 4.5:1 over the scene, nothing scrolls sideways, one main button per screen.
- **Copy:** no hard-coded sentences in screens; every copy key exists (D-046).
- **No network:** a flow fails if any request leaves the app (`SECURITY_PRIVACY.md`).
- **Paintings:** each baked image within the palette, readable where words sit, within its size.

## 6. On Dan's phone (by hand, short)
First, the Phase 8 trials (`TECH_DECISIONS.md` → "Risks"): the delve's end with the phone locked, on silent and in Focus; smooth motion; no bounce, no text selection, safe areas, instant start; the three sample paintings. After that, Claude lists only what a build changed that a browser can't check (sound, vibration, notifications). Never homework: a minute or two.

## Before each TestFlight build
All automated layers green; screenshots reviewed; the diff re-read against `DESIGN_PRINCIPLES.md` and `ANTI_FEATURES.md` (§74: a technically fine change can still be wrong for the game).
