# app/ — the game (Phase 8 onward)

Shape and rules: `docs/technical/ARCHITECTURE.md`, `DATA_MODEL.md`, `TEST_STRATEGY.md`.

| Folder | Part | Notes |
|---|---|---|
| `src/core/` | the rules | pure TypeScript; no screens, no storage, the clock passed in |
| `src/content/` | authored data | `copy/` (every line the app says), `world/`; story content will live in a marked sealed folder (D-015) |
| `src/platform/` | the phone's services | `web/` (prototype, tests) and `native/` (Capacitor) behind one interface |
| `src/ui/` | the screens | Svelte; direction D ported from `docs/design/directions/d-combined/` |
| `paint/` | the painting kit | `kit/` (shared hand), `samples/` (invented places, not story), `regression/` (the hall repainted by the kit: bake and compare after any kit change), `view/` (the sample viewer), `bake.mjs`, `check.mjs`. Real places' scene files will live in a marked sealed folder |
| `tests/` | the tests | `rules/` (Vitest: the rules, the story, the saves), `saves/` (a sample save for every save version shipped), `flows/` (Playwright walks, run in CI in Chromium and WebKit) |

Commands (from `app/`): `npm test`, `node tests/flows/heart-walk.mjs <url> <out-dir> [w h]` (the whole first playable walked at phone size with pictures; see its header; `BROWSER=webkit` for Safari's engine), `tap-row.mjs` and `back-from-record.mjs` (short checks), `npm run typecheck`, `npm run paint` (bake the samples; needs Playwright's Chromium: `NODE_PATH=$(npm root -g)`), `npm run paint:check`.
Sample viewer for the phone: `sh paint/view/pack.sh <dir> <zip>` → drag the zip onto app.netlify.com/drop.
