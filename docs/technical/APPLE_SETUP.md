# Apple setup (Dan, once, on the iPhone)

> Phase 8 (D-057, D-058). What Dan does so the cloud can put the game on his iPhone through TestFlight. About an hour in total, in two sittings, because Apple takes a day or two to approve the membership. **No Mac needed.** Spoiler-free.

_Written 2026-09-24. Apple changes its screens often: if a screen doesn't match these words, tell Claude what you see and we'll find the way together. Nothing here can break anything._

## Sitting 1: join the developer programme (now, about 15 minutes)
1. Check your Apple Account has **two-factor authentication** on: Settings → your name → Sign-In & Security. (Almost certainly already on.)
2. From the App Store, install **Apple Developer** (Apple's own app, blue icon).
3. Open it → **Account** → sign in with your usual Apple Account → **Enroll Now**. Enrol as an **individual**, with your legal name and address. Pay the **$99 a year** in the app.
4. Wait for Apple's email saying you're in. Usually within a day or two.

While you wait, also install **TestFlight** from the App Store (Apple's app for testing apps before they're public).

## Sitting 2: after Apple says yes (about 45 minutes)
Use **Safari** on the phone. If a page is cramped, tap **aA** in the address bar → **Request Desktop Website**.

**A. Register the app's ID**
1. Go to **developer.apple.com/account** → **Certificates, IDs & Profiles** → **Identifiers** → **+**.
2. Choose **App IDs** → **App**. Description: `Real life RPG`. Bundle ID: **Explicit**, `com.dniachini.rlrpg`.
3. Tick nothing else. **Continue** → **Register**.

**B. Create the app's record**
1. Go to **appstoreconnect.apple.com** → **Apps** → **+** → **New App**.
2. Platform **iOS**. Name: anything unique for now, e.g. `Real Life RPG (Dan)` (it's only a working name; the real name comes later, `narrative/NAMES.md`). Language English. Bundle ID: pick `com.dniachini.rlrpg`. SKU: `rlrpg`. Access: **Full Access**. **Create**.

**C. Make one key for the cloud Mac**
1. In App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** → **Team Keys** → **+** (the first time, it may ask you to request access: accept).
2. Name `cloud build`, access **Admin** → **Generate**. (Admin lets the cloud Mac sign the app with Apple's own cloud certificate, so there are no certificate files to handle.)
3. Note the **Issuer ID** (above the list) and the key's **Key ID**.
4. **Download API Key** (you can only download it once). Safari saves a file ending `.p8` in **Files → Downloads**.

**D. Give the key to the repository (never to the chat)**
The key stays in GitHub's locked secrets, where only the build can use it. **Don't paste it into our conversation.** Four secrets in all.
1. In **Files → Downloads**, long-press the `.p8` file → **Rename** → change the ending to `.txt` → open it → select all → **Copy**.
2. In Safari go to **github.com/dniachini-droid/completion** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, four times:
   - `ASC_KEY_P8` → paste the whole text you copied (including the BEGIN and END lines)
   - `ASC_KEY_ID` → the Key ID
   - `ASC_ISSUER_ID` → the Issuer ID
   - `APPLE_TEAM_ID` → your **Team ID**: 10 letters and numbers, at **developer.apple.com/account** → **Membership details**
3. Delete the `.txt` file from Downloads.

**E. Tell Claude "Apple setup done."** Claude then builds, the cloud Mac packages the app and sends it to Apple, and it appears in **TestFlight** on your phone, usually within an hour. You'll get a TestFlight invitation (you're the internal tester); open it and tap **Install**.

## Sitting 3: two checks on the phone (about 10 minutes, once the app is installed)
These are trials (b) and (c) (`TECH_DECISIONS.md` → "Risks"). Tell Claude what happened, in any words; a "no" is useful, not a failure.

**(b) Does the delve's end reach you with the phone locked?**
1. Open the app → **Prototype** → **Start a rehearsal** (minutes pass 60 times faster, on a separate save: a delve lasts under a minute).
2. **Begin** a job. The first time, the phone asks whether the app may send notifications: **Allow**.
3. Lock the phone straight away and put it face down. Does it chime or buzz when the delve ends?
4. Again with the **ring/silent switch on silent** (it should buzz only), and again in a **Focus** (e.g. Do Not Disturb). In a Focus it stays quiet unless you add the app to that Focus's allowed apps; say which you'd prefer.

**(c) Does it feel like a real app?**
- It opens in a second or two, with no white flash.
- Nothing bounces or scrolls when you drag the screen; long-pressing words doesn't select them.
- Nothing sits under the notch or the bar at the bottom.
- On a longer job (like the Course), Begin shows the dial: turning it gives small ticks you can feel.
- Close the app fully (swipe it away) and reopen: you're where you left off.

Then **Prototype → Back to real time** to go back to your own save.

## Good to know
- The key can be **revoked** at any time in App Store Connect → Users and Access → Integrations. The app on your phone keeps working.
- TestFlight builds expire after **90 days**; a monthly rebuild keeps a fresh one on the phone (`TECH_DECISIONS.md`). Your save is never touched by an update or an expiry.
- Nothing here makes the app public. Only you can install it.
- If anything asks for a **Mac**, **Xcode** or a **certificate** file, stop: the cloud does those parts. Tell Claude what it said.
