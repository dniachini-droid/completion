# Architecture

> Phase 7 (MASTER_BRIEF §64). How the MVP is put together on the chosen stack (`TECH_DECISIONS.md`, D-057, D-058). Sized for one player on one phone: **no premature enterprise architecture.** Spoiler-free.

_Status: written 2026-09-24 (D-059). Claude's routine technical calls (D-006); changed by a new decision if the build shows a better way._

## In one breath
One app, five parts, one direction of dependency. **The rules are plain code that knows nothing about screens.** Everything Dan does is written down the moment it happens, as a list of facts; what the game shows is worked out from those facts, the authored content and the clock. Words live in one file. Paintings are made before the app is built, not on the phone.

## The five parts
| Part | What it holds | Knows about |
|---|---|---|
| **core** | The game's rules: days and capacity, jobs and rhythms, delves and runs, steps and distance, the two clocks (`BALANCING.md`), Keys and the floor, finds, the planner, the week close, absence. Pure functions; no screens, no storage, no real clock | content's *types* only |
| **content** | Authored, versioned data: places, camps, records, sealed things, signs, words, finds, passage lines, teasers, the week-close lines; **all copy** (every line the app says, one file per language, D-046); Dan's starting rhythms | nothing |
| **platform** | The phone's services behind small interfaces: storage, notifications, haptics, the clock, sharing a file. Two versions of each: **native** (Capacitor, the app) and **web** (the browser, for the Phase 8 prototype and tests) | nothing in the game |
| **ui** | The screens (Svelte), direction D's tokens and components ported from `design/directions/d-combined/`, the live layers of each painting, motion | core, content, platform |
| **paint** | The painting kit and one scene file per place; run in the cloud at build time to bake images (`TECH_DECISIONS.md` → paintings). Not shipped as code | the design tokens |

Dependencies only point one way: **ui → core → (content types)**. core never imports ui or platform, so every rule runs in a test with no phone and no browser.

## How state works
**The source of truth is a list of facts, in the order they happened** (an append-only log). Two kinds:
- **What Dan did:** chose Low, began a job, started a delve of 30, stepped away, finished here, marked done, tapped bedtime, moved a plan entry, added a rhythm, cut a mark, guessed a sign.
- **What the world gave:** reached a place, a record fragment shown, a Key earned and where it went, a find, a sign learned.

The world's gifts are **worked out once, when they happen, and then kept as facts.** So a later change to the numbers or the rules never takes back anything Dan has already seen (rule 9, rule 18), and the story never replays differently.

**What the game shows** is worked out from: the facts + the authored content + the rules + the clock. No snapshot is saved: working out every screen from a year of facts takes about 15 ms, so the log is the only thing kept (D-106).

Why this shape:
- **Nothing is half-saved:** each fact is written the moment it happens, in one step (SQLite transaction).
- **Deterministic and testable:** same facts, same content, same clock → same screen.
- **The test's notes come for free** (`product/MVP.md` → "What the app notes by itself"): they are questions asked of the log, not extra tracking.
- **Planned / moved / done** (D-045) is just part of the log, never shown.

## Time
- **Timers are timestamps, never counting.** A delve is "started at 10:02, 30 minutes". When the app opens, it works out where things stand from the clock. Closing the app, a restart or a dead battery loses nothing.
- **The day ends at 04:00 local** (`BALANCING.md` §6). One function decides which game day a moment belongs to; every rule asks it.
- **The clock is passed in** to core, never read inside it, so tests can play any hour, any date, a clock change or a trip abroad.
- If the phone's time jumps (travel, a manual change), the rules use the phone's local time and never take anything back.

## The delve's end, with the phone locked
1. Begin: core records the start; platform asks the phone to sound an alert at the end time (a local notification with the delve's own sound).
2. Step away, Finish here, Start it now or a change of length: the alert is cancelled or moved.
3. A run sets one alert per delve and breather end.
4. Back in the app, the screen is worked out from the clock, whether or not the alert was seen.
The only permission the app asks for is notifications, at the first Begin, in plain words. No reminders are ever sent (MVP).

## Story and what Dan may see
- **The canon stays out of the app.** `docs/narrative/sealed/WORLD_TRUTH.md` and the other sealed working files are never shipped. The app holds only what the player can eventually read, and the order it comes in.
- Each content item carries **when it may appear** (its story week, its order, what must come first).
- **Screens only ever receive what is unlocked.** core hands ui a "what the player can see now" view; locked items never reach it, so a screen bug can't leak one. Tested (`TEST_STRATEGY.md`).
- Story content in the repository sits in one clearly marked folder with a warning, like `docs/narrative/sealed/` (D-015). Commit messages and PR text about it stay spoiler-free.

## Content and updates
- Content ships **inside each build** (offline). Each build carries a content version.
- New weeks (places, paintings, words) arrive in the **weekly build**, at least a week ahead of where Dan could reach (`BALANCING.md` §2: places run ahead by one story week at most).
- If Dan somehow reaches the end of what's shipped, the open route still extends with passages and finds (§5). Never a wall.

## Copy (D-046)
Every line the app says comes from one copy file, looked up by a key. No sentence is typed into a screen. The language pass then edits one file and needs no rebuild of any screen's logic. A test fails if a screen contains a hard-coded sentence.

## Build and release
1. Claude works in the cloud container: code, tests, true-size screenshots.
2. Every push runs the tests (Linux).
3. A release build runs on a cloud Mac (GitHub Actions macOS + fastlane): paintings baked, app packaged, signed with the App Store Connect key held in the repository's secrets, uploaded to TestFlight.
4. A scheduled monthly rebuild keeps TestFlight's 90-day limit away.
5. Phase 8's prototype was also folded into one self-contained web page (D-064). That page is gone (D-108): the app is the iPhone app only. A browser stand-in for the phone's services remains only for the automated screen checks.

## Where things will live (Phase 8 creates them)
```
app/
  src/core/        rules, pure TypeScript
  src/content/     copy/, world/ (non-story), story/ (sealed, marked)
  src/platform/    native/ and web/
  src/ui/          screens, components, tokens, live layers
  paint/kit/       the painting kit
  paint/scenes/    one file per place (sealed, marked)
  tests/           rules, story, save, flows, visuals
docs/              unchanged
```

## Deliberately not here
A server; accounts; sync; an analytics or crash service; a state-management library, plugin system or dependency-injection framework; feature flags; multiple languages beyond the copy file's shape; Android. Each can be added if play earns it (rule 12).

## Checklist for later (MASTER_BRIEF §64)
| Principle | Where it's met |
|---|---|
| Clear modules | The five parts; one-way dependencies |
| Explicit state models | The fact log, the "can see now" view |
| Testability | core is pure, clock passed in; `TEST_STRATEGY.md` |
| Migrations | `DATA_MODEL.md` → versions |
| Deterministic rules | core; gifts recorded once |
| Authored canon apart from generated dialogue | No generated dialogue in the MVP; content is authored only |
| Game logic apart from UI | core vs ui |
| Narrative truth apart from player-visible state | Canon never shipped; "can see now" view |
| Versioned content | Content version per build; stable ids |
