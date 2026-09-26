// The browser the flows run in: Chromium, or WebKit (Safari's engine, as on Dan's iPhone) with BROWSER=webkit
// (TEST_STRATEGY.md → layer 5). Playwright from the app's own packages, or PLAYWRIGHT=<path to its index.mjs>.
const pw = await import(process.env.PLAYWRIGHT ?? 'playwright');
export const engine = process.env.BROWSER === 'webkit' ? pw.webkit : pw.chromium;
export const launch = () => engine.launch();
