# Phase 4 helper tools (not app code)

- `shot.js` — phone-size screenshot of a mock-up: `NODE_PATH=$(npm root -g) node docs/design/tools/shot.js out.jpg <screen.html> 390 844 <wait-ms>` (a `.jpg` output path gives JPEG).
- `contact.js` — one sheet of a folder's `shots/*.jpg`: `NODE_PATH=$(npm root -g) node docs/design/tools/contact.js <shots-dir> out.jpg`.
- **Netlify zip for Dan** (how it was built): copy `fonts/` and each `directions/<dir>/` (its `.html`, `.css`, `.js` and `shots/`) into a folder, put `design/tour.html` in it as `index.html`, and zip the folder's contents. Dan drags the zip onto app.netlify.com/drop. `tour.html` lists directions and screens in `D`, `N` and `EXTRA` at the top of its script.
- `CRITIQUE_PROMPT.md` — the brief used for every critique round (fill `{NAME}`, `{DIR}`, `{ROUND}`, `{EXTRA}`).
- `NEXT_FIX_ROUND_D.md` — the prepared, not-yet-run final fix round for direction D.
- The gallery (tap Love/Yes/Maybe/No) is `design/gallery.html`, published at https://claude.ai/artifact/EBEqyRdckoyj48k7HmZxn8 (reactions stored in its `reactions` collection). Dan found Netlify + dictation easier; the gallery is optional.
