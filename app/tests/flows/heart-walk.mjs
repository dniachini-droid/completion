// The first playable walked on a fake clock at phone size, with a picture of every screen (TEST_STRATEGY.md → layer 5).
// Fails on any page error or any request leaving the app. Usage (from app/, with a build served):
//   PLAYWRIGHT=$(npm root -g)/playwright/index.mjs node tests/flows/heart-walk.mjs http://localhost:4173/ <out-dir> [width height]
// Day 1 (a Thursday): the Course, the gym, Spanish study → the first place; the map; records. Then two more days,
// so steps, a sealed thing opening and a guess play. No story text is asserted.
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const [,, url, out, w = '390', h = '844'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, timezoneId: 'Europe/London' });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!r.url().startsWith(url) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) errors.push('NETWORK ' + r.url()); });
await page.clock.install({ time: new Date('2026-09-24T09:00:00+01:00') });
await page.goto(url);
let i = 0;
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); };
const shot = async (name, settle = 1500) => { if (settle > 10000) await ff(settle); else await page.clock.runFor(settle); await page.waitForTimeout(300); await page.screenshot({ path: `${out}/${String(++i).padStart(2, '0')}-${name}.png` }); };
const has = async (text) => (await page.getByRole('button', { name: text, exact: true }).count()) > 0;
const tap = async (text) => { await page.getByRole('button', { name: text, exact: true }).first().click({ timeout: 8000 }).catch(() => page.getByRole('button', { name: text, exact: true }).first().click({ force: true })); };
/** Answer whatever guess the screen offers (the first option). */
const guessIfAny = async (name) => {
  const opts = page.locator('.opts .btn-quiet');
  if (await opts.count()) { await shot(name + '-guess', 800); await opts.first().click(); await shot(name + '-guessed', 800); }
};
/** Play each arrival in turn, back to Today. */
const arrivals = async (name) => {
  for (let k = 0; k < 6; k++) {
    if (!(await page.locator('.arr').count())) return;
    while (await has('Go on')) { await tap('Go on'); await page.clock.runFor(600); }
    await shot(`${name}-${k}`, 6000); await guessIfAny(`${name}-${k}`);
    if (await has('Rest here for today')) await tap('Rest here for today'); else await tap('Back to today');
    await page.clock.runFor(1500);
  }
};
/** Do today's next job, whatever it is, and show its return. */
const doNext = async (name) => {
  if (await has('Done')) await tap('Done');
  else {
    await tap('Begin'); await page.clock.runFor(900);
    if (await has('Begin')) { await shot(name + '-set', 800); await tap('Begin'); }
    await ff(75 * 60_000);
    if (await has('Done')) await tap('Done');
  }
  await shot(name + '-return', 2500); await guessIfAny(name);
  if (await has('See where you are')) { await tap('See where you are'); await page.clock.runFor(1500); await arrivals(name + '-arrival'); }
  else if (await has('Back to today')) { await tap('Back to today'); await page.clock.runFor(1500); }
};

await shot('today', 2500);
/* the Course: Begin opens the run set to its hour; a breather; enough */
await tap('Begin'); await shot('runset', 2000);
await tap('Begin'); await shot('delve', 10 * 60_000);
await ff(26 * 60_000); await shot('breather', 2000);
await ff(30 * 60_000); await shot('course-enough', 2000); await guessIfAny('course');
await tap('Back to today'); await page.clock.runFor(1500);
await doNext('d1-b');
await doNext('d1-c');
await shot('today-complete', 2500);
await tap('Map'); await shot('map-close', 1500); await tap('Region'); await shot('map-region', 1500); await tap('Today'); await page.clock.runFor(2500);
if (await has('Records')) {
  await tap('Records'); await shot('records', 1200);
  const r = page.locator('button.row').first();
  if (await r.count()) { await r.click(); await shot('record', 1200); await tap('Records'); await page.clock.runFor(500); }
  await tap('Today'); await page.clock.runFor(2500);
}
for (const d of [2, 3]) {
  await ff(24 * 3600_000); await page.reload(); await shot(`d${d}-today`, 2500);
  for (let k = 0; k < 3; k++) { if (!(await has('Begin')) && !(await has('Done'))) break; await doNext(`d${d}-${k}`); }
}
await ff(24 * 3600_000); await page.reload(); await page.clock.runFor(2000);
if (await has('I can’t start')) { await tap('I can’t start'); await shot('cant-start', 2000); }
if (errors.length) { console.error(errors); process.exitCode = 1; } else console.log('walk: ' + i + ' screens, no errors, no network');
await browser.close();
