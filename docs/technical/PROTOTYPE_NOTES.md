# Prototype notes (Phase 8)

> The trials, what each one found, and every temporary compromise, so nothing ugly or provisional becomes permanent by accident (MASTER_BRIEF §67). Spoiler-free.

_Started 2026-09-24 (D-061)._

## The five trials (`TECH_DECISIONS.md` → "Risks")
| # | Trial | How | Status |
|---|---|---|---|
| 1 | The delve alert with the phone locked, on silent, in Focus | Trial build: pick 1 / 3 / 25 min, Begin, lock the phone | Built; waits for TestFlight |
| 2 | Smooth paintings and motion (iPhone 16 Pro Max) | Trial build: baked hall with fog, drift and motes moving on top | Built; waits for TestFlight |
| 3 | Feels like a real app: no bounce, no text selection, safe areas, instant start, haptics | Trial build: Low / Normal / High and the lengths tick under the thumb | Built; waits for TestFlight |
| 4 | Cloud Mac → TestFlight end to end | `.github/workflows/testflight.yml` | Written; waits for Dan's Apple steps (`APPLE_SETUP.md`) |
| 5 | The painting kit: three invented sample places, judged by Dan against the approved hall | — | Next session |

**What Dan checks on the phone (trials 1–3), a few minutes:**
1. Open the app. It should appear at once on a dark screen, never white.
2. Tap Low / Normal / High and the lengths: each should tick under the thumb. Try to drag the screen: nothing should bounce. Long-press a word: nothing should get selected.
3. Watch the hall for ten seconds: fog, a slow drift and specks of light should move smoothly.
4. Choose **1 min** → **Begin** → allow alerts → lock the phone. After a minute it should sound (or vibrate on silent). Repeat once with a Focus mode on.
5. Begin **3 min**, close the app fully (swipe it away), open it again: the delve should still be running at the right time.

## Temporary compromises (to undo before the first playable)
- **Trial screens and words** (`trial.*` copy keys, `Hall.svelte`, `Delve.svelte`) are throwaway: they test the phone, not the game.
- **The delve ring** is a plain SVG ring, not `delve.html`'s tunnel and ring. The heart slice ports the real one.
- **The lamp's flame is baked still** in the hall image; in the mock-up it flickers. The kit's live layers must bring back the flame.
- **App icon and launch screen** are placeholders made from the hall (`paint/icons.mjs`) until the app has its name and mark.
- **Home-screen name "Lamp Hall"** is provisional (`narrative/NAMES.md`).
- **Storage** is the simple key-value store; the fact log in SQLite comes with the heart slice.
- **Flow tests run in Chromium**, not WebKit, in the cloud container; Dan's phone is the real check.
- **Notification sound** is the phone's default; the delve's own sound comes later (sound design is out of the MVP).
- The copy test (no sentence typed into a screen) is not written yet: it comes with the heart slice.
