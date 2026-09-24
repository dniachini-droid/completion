# Apple setup (Dan, once, on the iPhone)

> Phase 8 (D-057, D-061). What Dan does once so the cloud Mac can put the app on his phone through TestFlight. About 30 minutes, all in Safari on the iPhone. Spoiler-free.

_Status: step 0 done (membership approved, 2026-09-24). Steps 1–7 to do._

**One rule:** the key made in step 4 goes **only** into GitHub's secrets (step 6). Never paste it into a chat, a note or a message, including to Claude. If it ever leaks, revoke it in App Store Connect and make a new one; nothing else breaks.

If a page is awkward on the phone, tap **aA** in Safari's address bar → **Request Desktop Website**.

## 1. Find your Team ID
1. Open **developer.apple.com/account** and sign in.
2. Scroll to **Membership details**. Note the **Team ID** (10 letters and numbers). You'll need it in step 6.

## 2. Register the app's ID
1. Open **developer.apple.com/account/resources/identifiers**.
2. Tap **+** → **App IDs** → Continue → **App** → Continue.
3. Description: `Lamp Hall`. Bundle ID: **Explicit**, exactly `com.dniachini.rpg`.
4. Leave every capability unticked (the delve alert needs none) → Continue → **Register**.

## 3. Create the app in App Store Connect
1. Open **appstoreconnect.apple.com** → **Apps** → **+** → **New App**.
2. Platform: **iOS**. Name: anything unique on the App Store, e.g. `Lamp Hall Trial` (only you will see it; the real name comes later, `narrative/NAMES.md`). Primary language: English (U.K.). Bundle ID: pick `com.dniachini.rpg`. SKU: `rpg-001`. User access: Full Access.
3. Tap **Create**. Nothing else on that page needs filling in: the app is never published, only tested.

## 4. Make the key for the cloud Mac
1. In App Store Connect: **Users and Access** → **Integrations** tab → **App Store Connect API** → **Team Keys**. (The first time, Apple may ask you to request access and accept terms. Do that; it's instant.)
2. Tap **+** (Generate API Key). Name: `Cloud Mac`. Access: **Admin** (needed so it can sign the app by itself).
3. Note two things on that page: the **Issuer ID** (above the list, a long code with dashes) and the new key's **Key ID** (10 characters).
4. Tap **Download** on the new key. **Apple lets you download it only once.** It saves as `AuthKey_….p8` in Files → Downloads.

## 5. Copy the key's text
1. Open the **Files** app → **Downloads**.
2. Long-press the `AuthKey_….p8` file → **Rename** → change the ending `.p8` to `.txt` → Done.
3. Tap it. It shows a few lines starting with `-----BEGIN PRIVATE KEY-----`.
4. Long-press the text → **Select All** → **Copy**.

## 6. Put four secrets into GitHub
1. In Safari, open **github.com/dniachini-droid/completion** → **Settings** → **Secrets and variables** → **Actions**.
2. Tap **New repository secret** four times. Names exactly as written:

| Name | Value |
|---|---|
| `ASC_KEY_P8` | paste the key's text (all of it, including the BEGIN and END lines) |
| `ASC_KEY_ID` | the Key ID from step 4 |
| `ASC_ISSUER_ID` | the Issuer ID from step 4 |
| `APPLE_TEAM_ID` | the Team ID from step 1 |

3. Delete the `.txt` key file from Downloads, then from **Recently Deleted**. GitHub keeps its own sealed copy; nobody (Claude included) can read it back.

## 7. Install TestFlight
Install **TestFlight** from the App Store and sign in with the same Apple ID.

## Then tell Claude: "Apple secrets added"
Claude starts the first build on the cloud Mac (about 15–25 minutes) and then gives you the last small step: adding yourself as a tester in App Store Connect → the app → **TestFlight** → **Internal Testing**. From then on, each new build arrives on the phone through TestFlight by itself.

## For later sessions (Claude)
- The pipeline is `.github/workflows/testflight.yml`: it runs on a commit whose message contains `[testflight]`, by hand, and monthly (TestFlight's 90-day limit). Build number = the workflow's run number.
- Signing is automatic via the API key (`xcodebuild -allowProvisioningUpdates` with the key); no certificates are stored anywhere (D-061).
- Bundle id `com.dniachini.rpg` is fixed once step 2 is done. The home-screen name (`CFBundleDisplayName`, "Lamp Hall") is provisional and can change at any time.
