# Scope (9): calendar import, read-only

> Stage 4 of `product/PRODUCTIVITY_PLAN.md`. Item 9 in `product/PRODUCTIVITY_REVIEW.md`. Nothing here is decided until Dan chooses. Spoiler-free.

## 1. What it is and why
The app would read the phone's calendar and show its events as **fixed points**: in the Week, and perhaps on Today. It would never write to the calendar. Apple's calendar framework (EventKit) reads every calendar the phone shows, so a Google calendar comes too, **if** its account is added in iOS Settings → Calendar → Accounts.

The review called this "the single biggest step from blind to credible". Today the planner knows nothing about a dentist appointment or a busy workday unless Dan types it in again. The critic's line was: "Pair it with a calendar and it works; use it alone and things will slip."

`game/TOOLS.md` §4 first imagined this with Google's private calendar address. That would send a request over the internet, which the app never does (`technical/SECURITY_PRIVACY.md`). EventKit reads what is already on the phone, so nothing leaves it.

## 2. What Dan sees, tap by tap
1. Daybook → settings (the screen Stage 1 adds) → **Show my calendar**. Off until he turns it on.
2. iOS asks once: "Long Answer would like full access to your calendar", with the app's own reason in plain words. If he says no, nothing changes and the switch explains how to allow it later.
3. A short list of his calendars, each with a switch (for example Work on, Birthdays off).
4. **The Week:** each day shows its timed events in the quiet italic, above the jobs: "10:00 Dentist". All-day events show as one faint line. Events are not jobs. They can't be ticked or begun, and they earn nothing.
5. **Plan my week** (if chosen): a day with a lot of timed events gets less work placed on it.
6. **Today** (if chosen): one quiet line under the job list, "Also today: 10:00 Dentist". Today still leads with one next job (P1, P7).
7. Turning the switch off hides every event at once.

## 3. Rules and facts
- **Reading happens outside core.** The app reads the next 14 days of events when it opens, and whenever iOS says the calendar changed.
- **A new fact, `calendarRead`,** keeps what was read: each event's start, end, whether it is all-day, a short fixed id, and its title. It is written only when the read differs from the last one. This keeps the rules deterministic: same facts, same screen (`technical/ARCHITECTURE.md`). It also means a plan made on Monday can always be explained later.
- **A second new fact, `calendarChosen`,** records the switch and which calendars are on.
- **core/week.ts:** `weekOf` shows the latest read's events for each day. `planWeek` treats busy minutes as used room. This fits best once Stage 3's "plan by minutes" (item 11) exists. Before that, the only option is "a day with 4 h or more of events gets one job fewer".
- **core/game.ts:** events never enter `orderOn` or `offeredOn`, so they never become the day's jobs by themselves. Dan can still add one as a job, as now (P10).
- **Saves:** two new fact types, so each needs its example in `app/tests/rules/save.test.ts` and a sample save (D-106). Old saves have neither fact and load as they are. Claude's view: raise the save version to 3 with an empty upgrade step, so an older build never meets facts it doesn't know (D-080).

## 4. Native work and Apple permissions
- **A small plugin of the app's own** (`app/ios/App/App/CalendarPlugin.swift`, like `SavePlugin.swift`). It asks for access, lists calendars, reads events in a date range and reports changes (the `EKEventStoreChanged` notice). EventKit expands repeating events itself.
- **Info.plist:** `NSCalendarsFullAccessUsageDescription`. From iOS 17, reading needs *full* access, because "add only" access cannot read. No entitlement and no new extension target are needed.
- **Tests** use made-up events; the real calendar can only be proved on the phone.
- **Only provable on the phone:** the permission prompt, a Google calendar appearing, how quickly a change made in Google reaches the phone (iOS syncs it on its own schedule), and all-day events and time zones.
- **Docs to update:** `SECURITY_PRIVACY.md` says "no calendar permission".

## 5. Risks
- **The calm.** A packed week could read as a wall of obligations. Mitigations: events stay faint, with no count of meetings and no "busy" label. A busy day gets a lighter plan, never a warning.
- **The new YouTube.** Low risk. The danger is planning theatre instead: tidying the Week around the calendar rather than starting. Events can't be moved or edited here, which helps.
- **Privacy.** Nothing leaves the phone. However, event titles (including other people's meeting names) would sit in the save, and so in any "Save a copy" file (Stage 1). A choice for Dan: keep titles, or keep only "busy 10:00–11:00".
- **Task farming (rule 10).** Events earn nothing and never count towards "enough". A calendar full of meetings must not make a day complete by itself.
- **Trust.** If iOS hasn't synced yet, an event may be missing. The app should never claim to show "everything".

## 6. Effort and options
Effort: **M–L**, about 2–3 sessions for the fullest version.
- **A.** Events shown in the Week only, read-only, with no effect on the plan: **M, 1 session**.
- **B.** A, plus Plan my week giving busy days less work (best after Stage 3's item 11): **M, 1–2 sessions**.
- **C.** B, plus the quiet "Also today" line on Today, and titles-or-busy-only as a setting: **L, 2–3 sessions**.

**Claude's recommendation:** B, built after Stage 3 so the planner already counts minutes. It fixes the review's main complaint without touching Today. Add the Today line (C) only if Dan finds he misses appointments with B.

## 7. Questions only Dan can answer
1. Which calendars do you actually use: Apple's, Google's, a work one? Is Google already added to the iPhone?
2. Should the app keep event titles, or only "busy" times?
3. Do you want events on Today at all, or only in the Week?
