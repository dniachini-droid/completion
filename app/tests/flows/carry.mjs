// "Not yet" keeps the minutes and the next delve carries on from them (Dan's report and choice, D-133): a one-off added
// with "+ Add", delved on for 27 minutes, Finish here → Not yet (the minutes kept, the road line shown, no count); the
// same job again: the set-up says it carries on from 27 minutes, the delve shows the job's minutes so far; Finish here →
// Not yet again (37 kept); a third delve → Done: the road line and the ring's count, ending on the job's 42 minutes.
// SHOTS=<dir> saves a picture of each end. Usage: node tests/flows/carry.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('.foot .add, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); };
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const btn = (name) => page.getByRole('button', { name, exact: true });
/* the words, once the game's clock has looked (once a second, D-132) */
const say = async (re, when) => {
  for (let k = 0; k < 6 && !(await page.getByText(re).count()); k++) { await page.clock.runFor(1000); await page.waitForTimeout(100); }
  if (!(await page.getByText(re).count())) fails.push(`${when}: no "${re.source}"`);
};
const road = async (when) => { if (!(await page.locator('.dv .road').count())) fails.push(`${when}: no road line`); };
const shot = async (name) => { if (shots) { await page.waitForTimeout(3600); await page.screenshot({ path: `${shots}/${name}-${w}.png` }); } };
/* the number the ring's count rests on, read from its digits' steps once they have run */
const ringNumber = async () => page.evaluate(() => {
  const n = document.querySelector('.dv .ring .count .sr'); return n ? n.textContent.trim() : null;
});
const begin = async (job) => {
  await tap(page.locator('.rows button.row', { hasText: job }), `the ${job} row`);
  if (!(await page.locator('.rs').count())) { fails.push(`${job}: no set-up`); return; }
};

await tap(page.locator('.foot .add'), '+ Add'); await page.keyboard.type('Tax return'); await page.keyboard.press('Enter'); await page.clock.runFor(800);

/* 1. 27 minutes, Finish here, Not yet */
await begin('Tax return');
if (await page.getByText(/Carries on from/).count()) fails.push('a new job says it carries on');
await tap(btn('Begin'), 'Begin');
await ff(27 * 60_000 + 20_000);
await tap(btn('Finish here'), 'Finish here');
await road('Is it done?');
await tap(btn('Not yet'), 'Not yet');
await say(/27 minutes so far/, 'Not yet after 27');
await road('Not yet');
await shot('1-not-yet');
if ((await ringNumber()) !== '27 minutes') fails.push(`the ring after Not yet shows ${await ringNumber()}, not 27`);
await tap(btn('Back to today'), 'Back to today');

/* 2. the same job again: it carries on from 27 */
await begin('Tax return');
await say(/Carries on from 27 minutes/, 'the set-up');
await shot('2-setup');
await tap(btn('Begin'), 'Begin again');
await ff(3 * 60_000 + 20_000);
await say(/30 min on it so far/, 'the delve, 3 minutes in');
await shot('3-delve');
await ff(7 * 60_000);
await tap(btn('Finish here'), 'Finish here again');
await tap(btn('Not yet'), 'Not yet again');
await say(/37 minutes so far/, 'Not yet after 27 + 10');
await tap(btn('Back to today'), 'Back to today');

/* 3. a third delve, Done: the count ends on the job's 42 minutes */
await begin('Tax return');
await say(/Carries on from 37 minutes/, 'the set-up, third time');
await tap(btn('Begin'), 'Begin a third time');
await ff(5 * 60_000 + 20_000);
await tap(btn('Finish here'), 'Finish here a third time');
await tap(btn('Done'), 'Done');
await road('Done');
/* the count partway: the flame, the ring's sparkle and the minutes on their way */
if (shots) for (const t of [300, 700]) { await page.waitForTimeout(t); await page.screenshot({ path: `${shots}/4-done-${t}-${w}.png` }); }
await page.waitForTimeout(3600);
if ((await ringNumber()) !== '42 minutes') fails.push(`the ring after Done shows ${await ringNumber()}, not 42`);
/* the digits rest on 4 and 2 (their strips moved by the count's steps) */
const digits = await page.evaluate(() => [...document.querySelectorAll('.dv .ring .count .strip')].map(s => Math.round(-new DOMMatrix(getComputedStyle(s).transform).m42 / parseFloat(getComputedStyle(s).fontSize))));
if (digits.join('') !== '42') fails.push(`the ring's digits rest on ${digits.join('')}, not 42`);
await shot('4-done');
/* nothing keeps moving once the count is over (D-132) */
const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity).length);
if (running) fails.push(`${running} of the count's animations still running after it`);

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`carry (${w}x${h}): ok`);
