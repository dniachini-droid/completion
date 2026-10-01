# Flow review — moving through the story world: Keys, Map, arrivals, Records & Symbols, Daybook, morning and welcome screens

Reviewer: story/progression area. Branch `claude/keys-visible`, built copy at port 4174, driven with Playwright at iPhone size (390 × 844, touch), plus simulated saves made with the game's own rules (`tests/review/heavy.ts`): 10, 14 and 21 days at 2, 3 and 5 hours a day, and the ready save with 2 kept Keys. Every path below was actually tapped through unless marked "code only". Screenshots and scripts are in `scratchpad/review/story/`.

No story text, place names, record names or symbols appear in this report (Dan is the player).

---

## The short answer to Dan's question

**"Once an area is opened from the Map, can I ever see that screen again?"** — No. The "You used a Key" screen is shown once. If the niche carried a record, the record stays in Records for ever; but 23 of the 36 niches carry only a few lines of story and no record, so for those the words are gone the moment Dan taps "Back to the Map" (or if the app is reopened on that screen). Worse, right now the screen *does* come back — but by accident, in a loop that traps him (bug 1 below).

The same is true of several other one-time screens; the full table is at the end. Places are the one thing that is consistently re-readable (from Today's place name and from the Map), and that works well.

---

## Confirmed bugs (ranked by how much they would hurt)

### 1. After using a Key on the Map, Dan is trapped between the Map and the "You used a Key" screen
**What Dan does:** Today → "Use it on the Map" (or Map) → a stretch → "Use a Key" → reads the opened screen → "Back to the Map".
**What happens:** The Map's top-left arrow now reads **"Back"** instead of "Today". Tapping it goes back to the "You used a Key" screen. Its arrow says "Map" and goes to the Map, whose arrow again says "Back" and goes to the opened screen… for ever. The phone's own back gesture does the same (it calls the same back). The Map has no other way out. The only escape is a niche that happened to carry a record ("Read it in your records" → Records → "Done reading" → Today), or killing the app.
**Confirmed:** clicked, `loop.mjs`: `back arrow #1 → You used a Key`, `#2 → Map (label Back)`, `#3 → You used a Key`, `#4 → Map`… Screenshots `loop-3-map.png`, `loop-4-back1..4.png`.
**Why:** `App.svelte:69` lists the screens that keep a "trail" for back. `opened` is not on the list, so arriving on it wipes the trail (`App.svelte:98`); then `Opened.svelte:35/51` go to `map`, which *is* on the list, so the Map pushes "opened" onto the trail as the place to go back to.
**Fix:** treat `opened` as a looked-through screen (add it to `LOOK`) so the Map's back returns to Today; or have Opened's two buttons call `go('back')` and record where the Map was reached from. Add a flow test: Today → Map → Use a Key → Back to the Map → arrow → must land on Today.

### 2. "Use it on the Map" sends Dan to a stretch where there is nothing to use
**What Dan does:** Today shows "2 Keys" and the gold link "Use it on the Map". He taps it.
**What happens:** The Map opens with the crosshair on a stretch whose box says only "Walked" and "the way you came in" — no "Use a Key", no "needs a Key". He has to tap every light to find out whether any of them lets him use the Key. In the 14-day save, one other light did; in the 21-day 2-hour simulation, on all 9 day-ends with a Key held, *none* did.
**Confirmed:** clicked, `drive.mjs save14`: `after Use it on the Map … locks: 0 | use buttons: 0`, screenshot `save14-03-map-from-today.png`; rules probe (`probe3.out`): at 2 h/day over 3 weeks, 9 of 21 day-ends have a Key held and on all 9 the link points at a stretch with no "Use a Key"; only 1 Key could be used on the Map in three weeks and 4 niches the rules call openable are invisible on the Map. At 3 h/day: 5 of 21.
**Why:** two different definitions of "a locked thing Dan can see". Today's link (`game.ts:1850`) uses `openable()` (`story.ts:302`), which counts any shut niche on a stretch Dan has visited. The Map (`Map.svelte:61`) lists a niche only when some story beat has explicitly "brought it into view" — and **18 of the 36 niches have no such beat at all** (probe: 1 in the first stretch, 2 and 4 and 3 in the next ones, …). Those 18 can be opened by the rules but can never appear on the Map, so a Key can only reach them by luck: being in that stretch when a job ends.
**Fix (pick one):** (a) make the Map list every niche `openable()` returns for the stretch (simplest: use `openable()` in `sealedOn`, keeping the in-view ones first), or (b) make `keyUse` and `openable()` require the same "brought into view" test the Map uses, and give the 18 niches an in-view beat in the content. (a) matches D-142's promise that "anything behind him is his to choose on the Map". Either way the link should point at a stretch that really shows "Use a Key".

### 3. "Ahead · Needs a Key" can describe something *behind* Dan
**What Dan does:** reads Today after moving to a new stretch.
**What happens:** "AHEAD · NEEDS A KEY" names a locked thing in a stretch he left days ago. In the 14-day save he is on the fourth stretch and "Ahead" is a niche on the second. The Map's "You are here" box repeats it as "Ahead: …".
**Confirmed:** `save14-01-today.png` plus the rules probe (`inView` on one stretch, `here` on another). Code: `story.ts:351` picks the most recently seen unopened niche wherever it is; `game.ts:1849`.
**Why it's wrong:** it contradicts the new rule that a Key only opens by itself what is where Dan is; the thing called "ahead" needs the Map. A first-time player reads "ahead" as "on my road".
**Fix:** when the in-view niche is not on Dan's stretch, label it "Behind you · Needs a Key" (or "Left locked · on the Map") and make the whole line a tap to the Map on that stretch; or prefer an in-view niche on the current stretch when there is one.

### 4. The Daybook never records a Key used (dead line)
The weekly page has a line for "a row of notches filled with light" per Key used, but it is built only from the old weekly-floor Keys (`game.ts:764`), which D-142 removed. Keys earned by recurring jobs, used on a return, on arrival or on the Map, never reach the page. **Confirmed:** `drive.mjs`: `Daybook … count lines: 0` on every save, including the one where 7 Keys were used that week; code only for the cause.
**Fix:** build `seals` from every `sealOpened` in the week whose opener was a Key (any `keyUsed`/`keyEarned` just before it), and drop the floor filter. This would also give line-only niches a second life: the Daybook page is the one place they could be re-read.

---

## Clumsy flow (not broken, but loses or puzzles him)

### 5. One-time story is thrown away: nothing Key-opened or finds can be re-read
Of the 36 niches, 23 carry no record — only their own lines. Those lines are shown once (on a job's return, on an arrival, or on the opened screen) and are never kept anywhere Dan can reach. The same is true of every job return's story moment, every find (side chamber, surplus, morning, switching), and the morning screen's find. Only places (and records) are kept. Reopening the app on the opened screen goes straight to Today (`drive.mjs keysave`: `after reload on Opened → today`) and the words are gone. **Consistency problem:** a Key used *on arrival* IS re-readable (its lines are appended to that place's entry: `save14-10-arrival-again.png`), a Key used on a job's return or on the Map is not. Dan will reasonably expect the three to behave the same.
**Fix:** a "Keyed" or "Opened" section (or the niche's lines under its place's entry) so a niche opened from the Map reads again from the Map like a place does; or list opened niches as records. At minimum, let the Daybook page carry them (fix 4).

### 6. A Key right where Dan stands still says "Use it on the Map"
In the ready save the openable niche was on his *own* stretch (the Map box said "You are here" with "Use a Key"), yet Today said "Use it on the Map" and the Keys explanation says "A Key opens what is locked where you are by itself." Both true, but they read as a contradiction. Cause: the thing came into view through a job's story step, which plays *after* that job's Key check, so nothing opens until the *next* job ends. **Confirmed** `drive.mjs keysave`: `after Use it on the Map: box label: You are here … use buttons: 1`.
**Fix:** after a return's step brings a niche into view, run the kept-Key check once more (or say "Use it here" / "It opens on your next finished job").

### 7. The Map arrow label "Back" vs "Today"
After the Opened loop (bug 1) and also when the Map is opened from the Welcome screen, the arrow says just "Back"; everywhere else it names the screen. Minor once bug 1 is fixed, but a `NAMES` entry for `opened`/`welcome` would keep the pattern.

### 8. "Done reading" on a record jumps to Today, dropping the trail
Map → place "Read it again" → its record → "Done reading" goes to Today (`Records.svelte:89`), not back to the place or Map; the arrow beside it goes back properly. Two exits with different destinations on one screen. Suggest "Done reading" = back.

### 9. The welcome-back screen's bare line
Under "Where you were" and the place name sits a line with no label: it is the locked thing in view, but nothing says so (`Welcome.svelte:47`; `save-welcome-1-first.png`). The copy already has unused lines for this ("You were at…", "Ahead of you: …", `en.ts:295-296`). After "Read the last record" the screen cannot be returned to (back lands on whatever waits next — in the test, the Daybook).

### 10. Welcome back, a new Daybook page and the morning all stack up
Returning after six days: Welcome → (back) → Daybook page with the look-ahead offer → Today. Three screens before he can act. Each is good on its own; together they are a corridor. Consider letting the Daybook page wait for its usual place (the Daybook link) when a welcome has already been shown that day.

### 11. The Map does not say what a Key is *for* when he has none and nothing is in view
With "No Keys" on Today the explanation appears on tap, good. But on the Map, a stretch with a locked thing says "needs a Key" plus "Keep up a recurring job to earn a Key." — while a stretch with an invisible niche (bug 2) says nothing, so Dan cannot tell where his future Key will be useful. Fixing 2 fixes this.

---

## Minor polish

- "Use **it** on the Map" when he holds 2 or more Keys ("Use one on the Map").
- `map.sealedLabel` / `map.sealedSay` and `welcome.at` / `welcome.ahead` are unused copy (0 references); either use or delete.
- On the "You used a Key" screen the big button and the arrow both go to the Map; fine, but when the niche came from Today's link, Dan may expect "Back to today". After bug 1 is fixed, consider "Today" as the quiet second button.
- The side-chamber's "a side chamber · 30 min" label on Today's road line disappears once its find is given, with no trace of what was found (by design, but it's one more one-time thing).
- A camp (a day that ends short of a place) can be re-read only via "See where you are" while it is the latest arrival; the Map lists places only (`Map.svelte:76`), so earlier camps' lines are lost.
- Double-tapping "Use a Key" spends only one Key (confirmed: "1 Key left" from 2). Good.
- Reopening the app on the Map, Records or Symbols returns to Today (no state kept) — acceptable; on the opened screen it loses the words (see 5).

---

## Every one-time screen: can it be seen again, and from where?

| Screen | Shown when | Seen again? | Where | Consistent? |
|---|---|---|---|---|
| Arrival at a place | minutes reach a place | **Yes** | Today: tap the place name (latest only); Map: stretch box → place names / "Read it again" (every place). Lines a Key added on arrival come with it. | Good |
| Camp (day ends short of a place) | day complete | Partly | "See where you are" on Today, only while it is the latest arrival | Lost once the next place is reached |
| Job return (story moment, Key note, find) | a job is done | **No** | Records it added: yes, in Records. Its lines, find, Key sentence: nowhere | Inconsistent with arrival |
| "You used a Key" (opened from Map) | Use a Key | **No** (except by the loop bug) | Its record, if any (13 of 36 niches): Records. Line-only niches (23): nowhere | Inconsistent with a Key used on arrival |
| Key used on arrival | arrive with a kept Key | **Yes** | appended to that place's entry (Map / place name) | — |
| Side-chamber / surplus / switching find | at a delve's end or a tick | **No** | a find that "tells" a record: that record in Records; others nowhere | — |
| Morning after a kept bedtime | first open next day | **No** | "Read the record again" only when a story morning confirmed a guess; the find: nowhere | — |
| Welcome back | first open after days away | **No** | its record link → Records; the open question: nowhere | — |
| Week close (Daybook page) | first open of the new week | **Yes** | Daybook, Earlier/Later pager; the look-ahead offer only once | Good |
| Cutting the word / the stair | first word arrival | Partly | the place reads again as a plain arrival; the stair screen only then | OK |
| Guess a symbol | offered on return/arrival | **Yes** | Symbols page: "new" until guessed; "Change it" until confirmed; struck line kept | Good |
| Symbol confirmed ("your guess held") | the confirming place/morning | **Yes** | Symbols page shows the meaning and the struck guess | Good |

---

## What flows well

- Places are the model: tap the name on Today or any name on the Map, read the whole entry with its painting, "Look" to see the picture alone, one clear way back that names where you came from. This is exactly what Dan asked for and it works (`save14-10-arrival-again.png`).
- Records ⇄ Symbols is one place with two tabs; a symbol tapped inside a record opens its own read-out and back returns to the record, then to the list, then to Today — the trail is right every step (confirmed).
- A guess is never asked on the screen that answers it; a wrong guess is struck with one line, never scolded; the Symbols page keeps the whole history.
- Today's road line with minutes to the side chamber and the next place, plus the Key count under it, make "where am I, what's next" readable at a glance; the count and "left" numbers agreed everywhere I checked (2 → 1 → 1 after reload).
- The Daybook page reads as a page, not a report; Earlier/Later paging is simple.
- The screens that must be seen (arrival, morning, welcome, a fresh Daybook page) are queued on opening and cannot be skipped by "Today", yet each has one obvious way on. Reloading mid-screen never loses the save or lands on a blank screen.
- A Key can't be spent twice by a double tap; a Key used on the Map plays over its own place's painting, not where Dan now stands (D-142's intent, confirmed on screen).

---

### Files and scripts
- Driver scripts: `scratchpad/review/story/drive.mjs` (Keys, Map, arrival-again, Records, Daybook), `loop.mjs` (the trap), `mw.mjs` (morning / welcome). Saves: `save14.json`, `save10.json`, `save-morning.json`, `save-welcome.json`; rule probes `probe.out`, `probe2.out`, `probe3.out`.
- Nothing in the repository was changed; the three temporary vitest files used for the probes were deleted (`git status` clean).
