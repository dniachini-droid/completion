# Security & Privacy

> Phase 7 (MASTER_BRIEF §63). What data exists, why, where it lives, whether it leaves the phone, backups, what AI and outside services see. For the MVP on the chosen stack (D-057, D-058). Spoiler-free.

_Status: written 2026-09-24 (D-059)._

## In one breath
**Everything stays on Dan's iPhone.** No account, no server, no analytics, no tracking, no AI. The app makes no network requests at all. The only outside company involved is Apple, for installing the app. Dan decides whether anything is ever shared.

## What data exists
| Data | Why | Where | Leaves the phone? |
|---|---|---|---|
| Dan's jobs, rhythms, satchel, plan, settings | To play: the day, the planner, the lists | The save, on the phone | Only in iCloud backup, or a copy Dan saves |
| The fact log (what he did and when, what the world gave) | The game's state; the test's notes | The save | Same |
| The test summary | To answer the central test | Worked out on the phone | **Only if Dan exports it** (D-054) |
| Story, paintings, copy | The game | Inside the app | It came from the build |

**Not collected** (`product/MVP.md`): mood, health, location, contacts, other apps, anything typed beyond what the app needs to work. The test is not a health measure and nothing in it is clinical.

Job names can be personal ("the cat's medication", an appointment). They stay in the save and are treated like the rest of it.

## What outside services receive
| Service | Receives | When |
|---|---|---|
| **Apple (TestFlight, App Store Connect)** | That the app is installed and which build; **crash reports and feedback only if Dan chooses to send them** in TestFlight | Install and updates |
| **Apple (iCloud Backup)** | The save, inside the phone's normal encrypted backup, if Dan has it on | Apple's schedule |
| **Local notifications** | Nothing. The phone schedules the delve's end itself; no push server | — |
| **AI** | **Nothing.** No AI in the MVP | — |
| **Fonts, images, libraries** | Nothing. All bundled; no web fonts, no CDNs | — |
| **Netlify** (Phase 8 prototype only) | Nothing personal: the prototype's files. Its data stays in the phone's browser and is throwaway | Prototype only |

A **no-network rule** is set in the app (a content security policy that blocks requests), and a test fails if any flow tries to reach the network.

## Permissions
**Notifications only**, asked at the first Begin in plain words ("So you hear when a delve ends."). If Dan says no, delves still work; the end shows when he returns. No location, camera, contacts, health, calendar or tracking permission.

## The repository and the build
- The GitHub repository is **private** (verified). It holds code, docs and authored content, **never Dan's save** and never his test data.
- **Secrets:** the App Store Connect key lives only in the repository's encrypted secrets, added by Dan. It is never written in chat, in files or in commit messages. It can be revoked from App Store Connect at any time.
- **Dependencies** are few and deliberate (MASTER_BRIEF §72), pinned with a lockfile, and reviewed when added.
- **Story content** sits in marked sealed folders; Dan-facing text never quotes it (D-015). This is about spoilers, not security.

## Backups and loss
- Every action is saved the moment it happens, in one step (`ARCHITECTURE.md`).
- iCloud phone backup, plus "Save a copy" to Files, plus an automatic copy before each migration (`DATA_MODEL.md`).
- **Deleting the app deletes the save** (except in backups and copies). This is the one way everything can be lost, and it's Dan's to take.
- A TestFlight build expiring or updating never touches the save.

## Later, if ever
Any future feature that sends data anywhere (Google Calendar, AI help, sync, sharing) needs its own decision in `DECISIONS.md` first, updating this page: what goes out, to whom, why, and how to turn it off.
