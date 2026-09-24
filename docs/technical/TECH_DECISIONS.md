# Tech Decisions

> Phase 7 (MASTER_BRIEF §62–66, D-055). How the MVP (`product/MVP.md`) gets built, and why. Plain words first; the technical names are in brackets for later sessions. **Spoiler-free: Dan reads this.**

_Status: **agreed by Dan** (2026-09-24, D-058). Built on Dan's four answers (D-056)._

## In one breath
Build the game as **web code inside a real iPhone app** (TypeScript, Svelte and Capacitor). Claude builds and tests it in the cloud, a cloud Mac packages it, and it arrives on Dan's iPhone through **TestFlight**, Apple's app for testing. Everything lives **on the phone only**: no account, no server, no tracking, no AI. The paintings stay **code-painted, as in the mock-ups**, made with a shared painting kit so about 5 a week is steady work, not heroics.

## What Dan told us (D-056)
| Question | Answer | What it decides |
|---|---|---|
| Phone | **iPhone, staying** | Build for iPhone only. No Android. |
| Computer | **None** | Nothing can depend on Dan running a Mac. Building and packaging happen in the cloud. |
| Paying | **Up to about $99 a year** | Apple's developer membership is fine: the proper way to install a home-made app that keeps working. |
| Paintings | **Code-painted, like now** | The approved hall was painted by code (`design/directions/d-combined/hall.js`). Keep that method and make it scale. |

## What decides the choice
The MVP is small in features and large in paintings and words. These are the requirements that actually separate the options:
1. **Looks exactly like direction D.** Full-bleed paintings that move, violet-to-gold light, the carved type, the glowing ring (`design/DESIGN_SYSTEM.md`). The approved mock-ups are already web code.
2. **The delve's end is heard or felt with the phone locked and in a pocket** (`FIRST_PLAYABLE.md` → "What must exist before the build").
3. **Nothing is ever lost.** Delve, hold and plan state survive the app closing, the phone restarting and app updates. The save is backed up.
4. **Works with no signal.** Everything on the phone; no waiting on a network.
5. **About 5 new paintings a week,** in direction D, for as long as Dan plays (about 260 a year).
6. **Buildable with no Mac,** by Claude working in a Linux cloud container, with every screen checked at true phone size before Dan sees it.
7. **Private:** nothing leaves the phone that doesn't have to (MASTER_BRIEF §63, `product/MVP.md` → "What the app notes by itself").
8. **Easy to change:** all words in one place for the language pass (D-046); jobs and rhythms are Dan's data (D-030); content arrives weekly.

## The options
Five credible ways to build an iPhone app. Android-capable options (B, C, E) keep that door open for free, but it's not a reason to pick them.

| | A. Web app on the home screen | **B. Web code in a real app** | C. React Native (Expo) | D. Native Swift | E. Flutter |
|---|---|---|---|---|---|
| What it is | A website Dan saves to his home screen | The same web code, wrapped as a true iPhone app | Apps written in JavaScript, drawn with iPhone's own parts | Apple's own language and tools | Google's toolkit, draws everything itself |
| Direction D as approved | **Reused directly** | **Reused directly** | Rebuilt; the painting and CSS layers ported | Rebuilt from scratch | Rebuilt from scratch |
| Delve end, phone locked | **Weak.** Needs a server to send a push at the right moment | **Yes.** The phone schedules its own alert with sound and vibration | Yes | Yes | Yes |
| Save reliability | Fair. The phone can clear website storage under pressure | **Good.** App storage, included in iCloud backups | Good | Best | Good |
| Offline | Yes | Yes | Yes | Yes | Yes |
| No Mac needed | Yes | Yes, with a cloud Mac for packaging | **Easiest** (Expo's cloud builds) | **Hard.** Every change needs a cloud Mac; Claude can't run the app | Yes, with a cloud Mac |
| Claude can see every screen before Dan does | Yes | **Yes** (a Safari-like browser in the container) | Partly (a web preview that isn't the real thing) | No | Partly |
| Install and updates | A link; instant | TestFlight; automatic updates | TestFlight | TestFlight | TestFlight |
| Apple membership ($99/yr) | Not needed | Needed | Needed | Needed | Needed |
| Build speed for Claude | Fastest | **Fast** | Medium | Slow | Medium |
| Later: lock-screen timer, widget, Watch | No | Possible (a small native add-on) | Possible | Best | Awkward |

**Why not the others, in a sentence each**
- **A (home-screen web app)** fails requirement 2 without adding a server, and iPhone can clear a website's storage. It stays useful as the **Phase 8 prototype**: the same code, opened as a link, before the app wrapper exists.
- **C (React Native)** is the easiest to get onto a phone without a Mac, but direction D would be rebuilt rather than reused, and Claude would be judging screens through an imitation. The paintings are the product's biggest cost; this makes them costlier.
- **D (native Swift)** is the gold standard on iPhone, but with no Mac Claude would be building blind: every change goes through a slow cloud build, and no screen can be checked before Dan sees it. That breaks the way this project has worked so far (every screen checked at true size).
- **E (Flutter)** has C's rebuild cost without its no-Mac ease.

## Recommendation: B, web code in a real iPhone app
**Why:**
- **The approved look is kept, not redone.** Direction D's screens, fonts, fog and ring are web code today. The app uses the same code.
- **The delve's end works with the phone locked.** When a delve starts, the app asks the phone to sound an alert at the end time (a local notification). The phone does this itself, locked or not, with no server. The timer is worked out from the clock, never counted in the background, so closing the app loses nothing.
- **Claude can check everything first.** Every screen, at 390 × 844 and 360 × 780, in a Safari-like browser, before a build reaches Dan.
- **Everything stays on the phone,** in app storage that iCloud backs up with the rest of the phone.
- **One small door stays open:** a lock-screen timer (a Live Activity) or a widget can be added later as a small native piece, if play shows it's worth it.

**What it costs, plainly:**
- **$99 a year** for Apple's membership (Dan's answer: fine).
- **About an hour of setup by Dan, once**, on his phone: join the developer programme, create the app's record, make one key for the cloud Mac, install TestFlight. Claude writes the steps. Apple's approval of the membership can take a day or two, so this starts during Phase 8.
- **A web app inside a wrapper can feel like a website** if it's careless: page bounce, text selection, slow starts. These are known and fixable (list in "Risks"), and checked on Dan's phone.
- **TestFlight builds stop opening after 90 days.** A scheduled monthly rebuild keeps a fresh one on the phone. The save is untouched when a build expires or updates.

## How it gets onto the iPhone (no computer)
1. Claude writes and tests the code in the cloud container (this session's kind).
2. On a push, a **cloud Mac** (GitHub Actions; Codemagic as a fallback) packages the app and uploads it to Apple.
3. Dan's iPhone gets it through **TestFlight**, which updates it automatically.
4. **During Phase 8** (before any of that): the prototype runs as a web link on Dan's phone, the way he saw the Phase 4 screens. Prototype data is throwaway (`MVP.md` → "Build order").

Free cloud-Mac time for private repositories is limited; weekly builds plus fixes fit, and Codemagic's free tier covers any overflow. The limits are checked when the pipeline is set up.

## How the paintings get made (about 5 a week, direction D; D-054, D-056)
The mock-up hall is one 40 KB program that paints one room. Painting 260 rooms a year that way is heroics. The plan is to **turn it into a kit, then paint with the kit.**

**1. The painting kit (built once, in Phase 8, grown weekly).**
The same method as the approved hall, with the parts made reusable: a small ray-caster that paints **lit masses, relief, haze and depth** from one light source and one vanishing point; shared **stone** (cut blocks, chisel texture, bevelled joints, rough rock, worn floors); shared **forms** (halls, vaults, galleries, stairs, doors, niches, chambers, shafts, water); the **light** of direction D (violet place-light, the warm lamp, the gold of the day turning); and the **live layers** that keep every screen moving (D-041): fog, flame, glints, dust, waking cups.

**2. Each place is a short scene file.** About a page each: its forms, its camera, its light, the **one thing to look at**, and what moves. Most weeks the kit also gains one new form, material or light, so the Site keeps changing as Dan goes deeper and places don't become the same room with a different number.

**3. Baked, then brought to life.** The heavy painting is done once, in the cloud, at iPhone Pro Max resolution, and saved as an image (about 0.3–0.7 MB). On the phone, the live layers move on top of it. This keeps the phone cool and the battery calm, and the app opens instantly.

**4. Checked before shipping.** Each week's batch gets: automatic checks (colours within direction D's palette, text stays readable where words sit, file size); a contact sheet; a critique by a second Claude against the direction D rules (`design/tools/CRITIQUE_PROMPT.md`, `DESIGN_SYSTEM.md` → "Never"); one revision round.

**5. The rhythm.** One painting session a week (or ten every two weeks), in a session allowed to read the sealed story, because what a place looks like is story. The MVP's first 30–35 paintings take about six or seven such sessions before the test.

**What Dan sees, and when.** Paintings of real places are spoilers, so Dan meets them **in play**, not in review. Before the build, Claude paints **three invented sample places** (not in the story) with the kit, and Dan judges them on his phone against the approved hall. That is the quality bar. If the kit can't reach it, we stop and talk about other ways (reversible).

## Routine choices (Claude's, D-006)
Recorded so later sessions don't re-decide them. Dan doesn't need to review these.
- **Language:** TypeScript (JavaScript with checked types, so mistakes are caught early).
- **Screens:** Svelte, built with Vite. Close to plain HTML, so the D mock-ups port almost line for line.
- **App wrapper:** Capacitor, with its official plugins for local notifications, haptics and storage.
- **Storage:** SQLite on the phone (a small database that doesn't half-write); the browser's own storage for the web prototype. One storage interface, two versions.
- **Game rules:** plain TypeScript with no screen code in it, deterministic, with the clock passed in, so every rule can be tested at any time of day, any date, any clock change.
- **Tests:** Vitest for rules and story unlocks; Playwright for whole flows and true-size screenshots in a Safari-like browser (WebKit).
- **Cloud build:** GitHub Actions on a macOS runner with fastlane; Codemagic as the fallback.
- **No server, no account, no analytics, no crash-reporting service, no AI.** TestFlight's own crash reports (Apple) are the only thing that can leave the phone, and only if Dan chooses to send them.
- Details: `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY_PRIVACY.md`, `TEST_STRATEGY.md` (D-059).

## Answers to MASTER_BRIEF §62's list
| Question | Answer |
|---|---|
| iPhone-only or multi-platform | iPhone only (Dan). The code could reach Android later without a rewrite, but nothing is done for it. |
| Native or cross-platform | Web code in a native wrapper (B). |
| Offline-first, local data | Yes, completely. Nothing needs a network. |
| Sync | None: one phone. Backed up by iCloud's phone backup, plus a "save a copy" button that writes the save to Files. |
| AI | None in the MVP (`FIRST_PLAYABLE.md` → "Out"). Any later AI goes through the canon rules (§65) and its own decision. |
| Story data size | Small: six weeks of words is well under 1 MB. |
| Assets | About 20–25 MB for the MVP's paintings; about 150 MB a year at 5 a week. Fine for an iPhone; older ones can be thinned later if ever needed. |
| Notifications | Only the delve's end and the breathers' end, which Dan starts himself. **No reminders** (MVP). |
| Save-state reliability | Every action saved the moment it happens; nothing half-written; versioned saves with migrations; backups. |
| Security and privacy | On the phone only; see `SECURITY_PRIVACY.md`. |
| Future expansion | Lock-screen timer, widget, Watch, sound, calendar reading: all possible later as small additions. |
| Build speed | Fast: Claude builds and checks in the container; the cloud Mac only packages. |
| Visual fidelity | Direction D as approved, from the same code. |

## Risks, and how we find out early
Checked with small trials at the start of Phase 8, before any real building:
1. **The delve alert with the phone locked,** on silent, and in a Focus mode. (On silent, it vibrates only; whether it breaks through Focus depends on a setting Dan chooses.)
2. **Paintings and motion stay smooth** on Dan's iPhone (which model? asked in Phase 8).
3. **"Feels like a real app":** no bounce, no text selection, safe areas, instant start, haptics on the dial.
4. **The cloud Mac pipeline** delivers a build to TestFlight end to end.
5. **The painting kit** reaches the approved hall's quality in three invented places.
If 1 or 3 fails badly, option C is the fallback; the game rules and data carry over unchanged.

## Dan's answer
**"Yes, proceed"** (D-058): option B via TestFlight, and the painting plan.
