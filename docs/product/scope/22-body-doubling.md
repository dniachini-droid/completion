# Scope (22): body doubling

> Stage 4 of `product/PRODUCTIVITY_PLAN.md`. Item 22 in `product/PRODUCTIVITY_REVIEW.md`. Nothing here is decided until Dan chooses. Spoiler-free: the companion's identity belongs to the story and is settled only in the sealed process (D-015, D-035). This page scopes the mechanics only.

## 1. What it is and why
Body doubling means working while someone else works alongside you. It is a common ADHD aid. There are two kinds:
- **Focusmate:** a website and app that pairs you with a stranger on video for 25, 50 or 75 minutes. Each person says what they'll do, works, and reports back.
- **An in-world companion:** while a delve runs, a figure in the painting is visibly at work too. `game/TOOLS.md` §1 already lists this as "company at work": a thing to try, not a promise, because the evidence is weak (`game/TOOLS_RESEARCH.md`).

The review rated focus 8/10 already and put this in Tier 3 (M–L), citing Focusmate. It is the least evidenced item in the track.

**One fact that shapes everything:** going into another app on the phone pauses a delve (D-094, kept by Dan in D-107). A Focusmate call **on the phone** would pause the delve it's meant to support. Focusmate therefore only fits if it runs on the laptop, where Dan already does jobs like the cat's medication.

## 2. What Dan sees, tap by tap
**Focusmate link (option B):**
1. On the delve's length screen, a quiet line: "With Focusmate". Tapping it opens Focusmate in Safari to book or join, before the delve starts, so nothing pauses.
2. Back in the app, he picks 25 or 50 (Focusmate's lengths are on the dial) and begins as usual. The delve records that it had company.
3. He locks the phone, and the call runs on the laptop.

**Companion (option C):**
1. He begins a delve. In the painting behind the ring, a figure is at work: a light, a tool moving. It is there only while the delve runs.
2. During a breather the figure rests too. When the delve ends, it's gone.
3. No words, no reward, no tap. It's company, not a character to manage.

## 3. Rules and facts
- **Focusmate:** `delveStarted` gains an optional `company: 'focusmate'`, so the test's notes can compare delves with and without company. Old facts are unchanged, so there is no save version. The example in `app/tests/rules/save.test.ts` shows the field. The rules don't treat it differently: company earns nothing extra (rule 10, P16).
- **Companion:** nothing in `core/`, and no fact. It's a live layer in `ui/` shown whenever a delve is running. Who it is, and whether it changes as the story goes on, is content from the sealed process. If it ever changes with the story, it follows the "can see now" view like any other story content (`technical/ARCHITECTURE.md`).

## 4. Native work and Apple permissions
- **Focusmate:** none. Opening a web link in Safari is Safari's request, not the app's, so the no-network rule (`technical/SECURITY_PRIVACY.md`) still holds. No permission is needed.
- **Companion:** none native. It needs painting work: a small moving layer per place, or one figure reused across places. It can't appear on the lock-screen panel, because Apple allows only still designs there (D-095). So the companion is only seen with the screen on.
- **Only provable on the phone:** that the companion's motion doesn't cost battery (D-093's concern), and how it feels on a real delve.

## 5. Risks
- **The calm.** Low for both. Focusmate adds a stranger's expectations. That's its point, but it can feel like an appointment to dread on a low day. It must stay optional, with no reminder to book.
- **The new YouTube.** The companion's main risk is that it gives Dan a reason to **watch the screen** during a delve. The app's design pushes the other way: lock the phone and work (D-093, D-095). A companion worth watching works against the delve.
- **Privacy.** The app sends nothing. Focusmate is a separate company with its own account and video, and it is Dan's own choice. The app would store only "with company", never who.
- **Task farming (rule 10).** Neither changes what a delve earns.
- **Scope.** The companion needs the story to decide who it is (a sealed session) and painting work, for a benefit the research calls weak.

## 6. Effort and options
- **A.** Nothing built: Dan uses Focusmate on the laptop with the delve on the locked phone, as he could today. **0 sessions.**
- **B.** The "With Focusmate" link and the `company` note on the delve: **S, under 1 session**.
- **C.** The in-world companion as a live layer during delves, after a sealed session decides who it is: **M–L, 2–3 sessions plus painting**.

**Claude's recommendation:** A now. Tell Dan it works, and see if he uses Focusmate at all. If he does, B is a small addition that lets the test see whether company helps. Not now for C: it pulls the eye to a screen the app wants locked, and its evidence is weak. Revisit it with the story.

## 7. Questions only Dan can answer
1. Have you tried Focusmate or any body doubling? Did it help, or feel like pressure?
2. When you do a delve, is the phone face down and locked, or do you glance at it?
3. Would a quiet figure working in the painting appeal to you, or just be decoration?
