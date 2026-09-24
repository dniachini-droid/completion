// The heart, walked on a fake clock at phone size, with a picture of every screen (TEST_STRATEGY.md → layer 5).
// Fails on any page error or any request leaving the app. Usage (from app/, with a build served):
//   PLAYWRIGHT=$(npm root -g)/playwright/index.mjs node tests/flows/heart-walk.mjs http://localhost:4173/ <out-dir> [width height]
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
const tap = async (text) => { await page.getByRole('button', { name: text, exact: true }).first().click(); };
await shot('today', 2500);
await tap('Begin'); await shot('delve-running', 10 * 60_000);
await ff(16 * 60_000); await shot('delve-ask');
await tap('Done'); await shot('delve-done');
await tap('Back to today'); await shot('today-later', 2500);
await shot('today-course-next', 500);
await tap('Begin'); await shot('runset', 2000);
await page.getByRole('button', { name: 'One more delve' }).click(); await page.getByRole('button', { name: 'One more delve' }).click(); await shot('runset-4', 1500);
await page.getByRole('button', { name: 'One delve fewer' }).click(); await page.getByRole('button', { name: 'One delve fewer' }).click();
await tap('Begin'); await shot('delve-course', 3 * 60_000);
await tap('Step away'); await shot('delve-held', 60_000);
await tap('Today'); await shot('today-carry', 1500);
await tap('Carry on'); await shot('delve-resumed', 1000);
await ff(24 * 60_000); await shot('breather', 2000);
await ff(30 * 60_000); await shot('run-enough', 2000);
await tap('Back to today'); await shot('today-gym', 2500);
await tap('Begin'); await shot('today-underway', 1500);
await ff(60 * 60_000); await tap('Done'); await shot('step', 2500);
await tap('See where you are'); await shot('arrival-early', 1200); await shot('arrival-settled', 6000);
await tap('Rest here for today'); await shot('today-complete', 2500);
await tap('Prototype'); await shot('proto', 1000);
await tap('Today');
// a fresh day for "I can't start"
await ff(24 * 3600_000); await page.reload(); await shot('today-next-day', 2500);
await tap("I can’t start"); await shot('cant-start', 2000);
if (errors.length) { console.error(errors); process.exitCode = 1; } else console.log('heart walk: ' + i + ' screens, no errors, no network');
await browser.close();
