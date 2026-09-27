# Scope (10): widget, share sheet and Siri / Shortcuts capture

> Stage 4 of `product/PRODUCTIVITY_PLAN.md`. Item 10 in `product/PRODUCTIVITY_REVIEW.md`. Nothing here is decided until Dan chooses. Spoiler-free.

## 1. What it is and why
There are three ways into the app from outside it:
- **A widget** on the home screen or lock screen: "Next: <job>". One tap opens that job. A small **+** opens the capture box.
- **The share sheet:** from Safari, Mail or Notes, "Share → Long Answer" puts the text or the page's title into the satchel.
- **Siri and Shortcuts:** "Add to the satchel in Long Answer". This also works from the **Action button** on Dan's iPhone 16 Pro Max.

The review scored capture 2.5/5 ("nothing from outside the app"). It said a widget "keeps the app in view without a notification". Stage 1's "+ Add" (item 7) already makes capture 1–2 taps **inside** the app. This item is for the moment the thought arrives while Dan is somewhere else.

## 2. What Dan sees, tap by tap
- **Widget:** he long-presses the home screen, taps +, finds Long Answer and picks the small widget. It shows the place's colour, "Next: Spanish" and a +. Tapping the job opens the app on that job's Begin. It does not start the timer; a tap on Today does that (D-104). Tapping + opens Today with the capture box focused. When the day is complete it says "It was enough" and names no job. After 04:00 it shows "A new day", until the app is opened.
- **Lock screen:** the same in one line, on the lock-screen widget row.
- **Share:** in Safari he taps Share → Long Answer. A small sheet shows the line (editable) → **Add**. It closes, and nothing else opens.
- **Siri / Action button:** "Add to the satchel in Long Answer" → Siri asks "What?" → "Ring the vet" → "Added." The app doesn't open.
- Next time the app opens, the lines are in the satchel, as if typed there.

## 3. Rules and facts
- **The inbox.** The share sheet and Siri run outside the game, so they can't write facts. Each writes a line (text, time, a fixed id) to a small inbox file in a folder shared by the app and its extensions (an **App Group**).
- **Draining.** On every open and return, `ui/game.svelte.ts` reads the inbox and writes one `itemAdded` fact per line. Each fact uses the line's own id, so a line is never added twice. It then removes only the lines it wrote. If the app is killed half-way, nothing is lost or doubled.
- **Facts.** No new fact type. `itemAdded` gains an optional `via: 'widget' | 'share' | 'siri'`, so the test's notes can see where a line came from. `opened` could gain `via: 'widget'` in the same way, so the test can tell a start that followed a widget tap. Old facts are still valid, so there is no new version. The example in `app/tests/rules/save.test.ts` shows the new field.
- **The widget's words** are worked out by core, which already picks the next job, and written to the shared folder whenever the screen changes. The widget only displays them. `core/` gains nothing new beyond a small "what the widget shows" view, like `ui/panel.ts` for the lock-screen panel.

## 4. Native work and Apple permissions
- **App Group** `group.com.dniachini.rlrpg`: a new entitlements file for the app, the widget extension and the share extension (none exists today). The App ID needs the capability at Apple. The Admin key's automatic signing *probably* sets it up (a guess until the first build from `main`).
- **Widget:** a second widget in the existing extension (`app/ios/App/LiveActivity/`, already a WidgetBundle), with small and lock-screen (`accessoryRectangular`) sizes. `WidgetCenter.reloadAllTimelines()` is called from a small plugin. There is no new bundle.
- **Share extension:** a new target and bundle (`com.dniachini.rlrpg.Share`) with a short SwiftUI sheet. `NSExtensionActivationRule` limits it to text and web links.
- **Siri / Shortcuts:** an App Intent, `AddToSatchel`, with one text field, plus an `AppShortcutsProvider` for the spoken phrase. No Siri entitlement is needed for App Shortcuts.
- **Opening on a job:** a URL scheme (`CFBundleURLTypes` in Info.plist, none today) and a route in the UI.
- **Only provable on the phone:** the widget's look, the shared folder working between targets, Siri hearing the phrase, the Action button, the share sheet appearing, and the drain on return.

## 5. Risks
- **The calm.** The widget must never show a count ("3 left"), a satchel total or red. The lock-screen panel's red means "paused" only (D-102); the widget doesn't use it. Guess: a job name staring from the home screen all day could feel like nagging on a low day. Dan should be able to live with it or remove it.
- **The new YouTube.** The share sheet invites "save this video for later", which would turn the satchel into a watch-later list. It takes text and a link's title only, and never opens or plays anything.
- **Privacy.** Nothing leaves the phone. Job names on the **lock screen** can be read by anyone holding the phone. The widget can hide them while locked (iOS's `privacySensitive`).
- **Task farming (rule 10).** Capturing earns nothing, as adding never does (P16). More capture means a longer satchel. The someday drift and the no-counts rule (P7) already handle that.

## 6. Effort and options
Effort: **L** for all three (native work, three targets), about 3–4 sessions.
- **A.** Siri / Shortcuts / Action-button capture only (App Group, inbox, drain): **S–M, 1 session**.
- **B.** A, plus the share sheet: **M, 1–2 sessions**.
- **C.** B, plus the home and lock-screen widget with "Next:" and +: **L, 3–4 sessions**.

**Claude's recommendation:** A first. It gives capture from anywhere, including the Action button, for the least native work, and it builds the inbox that B and C reuse. Add the widget (C) only if, after a few weeks, Dan finds he forgets to open the app. The widget's value is keeping the app in view, which a notification-free Dan may or may not want.

## 7. Questions only Dan can answer
1. Where does a thought usually arrive when you want to note it: talking to the phone, the Action button, or while reading in Safari?
2. Would "Next: <job>" on your home screen all day help you, or feel like being watched?
3. Is the Action button free, or already used for something you'd keep?
