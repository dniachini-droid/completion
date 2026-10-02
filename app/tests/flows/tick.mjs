// A job ticked off without a delve, with the time it took (Dan, D-134): "+ Add" a job, tap the circle on its row, "How
// long did it take?" → 30 min: the step screen shows the road line and the ring's count, the job is done on Today; the
// next job ticked off from its card; a job delved on and left "Not yet" says "On top of …" and takes "No more"; the job
// menu's Tick off; Cancel counts nothing. SHOTS=<dir> saves pictures. Usage: node tests/flows/tick.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); };
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const btn = (name) => page.getByRole('button', { name, exact: true });
const shot = async (name) => { if (shots) { await page.waitForTimeout(3600); await page.screenshot({ path: `${shots}/tick-${name}-${w}.png` }); } };
const toToday = async () => { for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) { const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn'); await tap(way, 'way back to Today'); } };
const add = async (name) => { await tap(page.locator('.today-add'), '+ Add'); await page.keyboard.type(name); await page.keyboard.press('Enter'); await page.clock.runFor(800); };
/* done: no tick circle for it anywhere, on Today or in the Satchel */
const tickable = async (name) => {
  if (await page.getByRole('button', { name: `${name}: tick off`, exact: true }).count()) return true;
  await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
  const n = await page.getByRole('button', { name: `${name}: tick off`, exact: true }).count();
  await toToday();
  return n > 0;
};
const tickOn = async (name) => {
  const c = page.getByRole('button', { name: `${name}: tick off`, exact: true });
  if (await c.count()) return tap(c, `the tick circle on ${name}`);
  return tap(page.locator('.next').getByRole('button', { name: 'Tick off', exact: true }), `Tick off on ${name}'s card`);
};

/* 1. the circle on a row (on Today, where "Add a job" puts it, D-143 C): 30 min → the step screen with its road line and count */
await add('Bank');
await tap(page.getByRole('button', { name: 'Bank: tick off', exact: true }), 'the tick circle on Bank');
if (!(await page.getByText('How long did it take?').count())) fails.push('no "How long did it take?" after the circle');
await shot('1-sheet');
/* Cancel counts nothing */
await tap(btn('Cancel'), 'Cancel');
if (!(await page.getByRole('button', { name: 'Bank: tick off', exact: true }).count())) fails.push('Cancel ticked Bank off');
await tap(page.getByRole('button', { name: 'Bank: tick off', exact: true }), 'the tick circle again');
await tap(btn('30 min'), '30 min');
if (!(await page.locator('.road').count())) fails.push('no road line after the tick');
await page.waitForTimeout(3600);
const n = await page.evaluate(() => document.querySelector('.tring .count .sr')?.textContent?.trim() ?? null);
if (n !== null && n !== '30 minutes') fails.push(`the ring counts to ${n}, not 30 minutes`);
await shot('2-step');
await toToday();
if (await tickable('Bank')) fails.push('Bank, ticked off, can still be ticked off');

/* 2. a job on Today's list: its circle (no job is put forward any more, D-135) */
if (await page.locator('.rows .tickbtn').count()) {
  await tap(page.locator('.rows .tickbtn').first(), 'the first circle on Today');
  await tap(btn('1 h'), '1 h');
  if (!(await page.locator('.road').count())) fails.push('no road line after ticking the next job');
  await toToday();
} else fails.push('no tick circle on Today\'s list');

/* 3. a job delved on and left "Not yet": "On top of …", then "No more" */
await add('Letters');
await tap(page.locator('button.row', { hasText: 'Letters' }), 'the Letters row');
if (await page.locator('.rs').count()) await tap(btn('Begin'), 'Begin');
await ff(12 * 60_000 + 20_000);
await tap(btn('Finish here'), 'Finish here');
await tap(btn('Not yet'), 'Not yet'); await tap(btn('Back to today'), 'Back to today');
await tickOn('Letters');
if (!(await page.getByText(/On top of the 12 minutes already counted/).count())) fails.push('no "On top of the 12 minutes already counted"');
await tap(btn('No more'), 'No more');
await toToday();
if (await tickable('Letters')) fails.push('Letters, ticked off with No more, can still be ticked off');

/* 4. the job menu's Tick off */
await add('Post');
/* "Post" only, never "Sort the post": the job is on Today now (D-143 C) */
const row = page.locator('button.row').filter({ has: page.locator('.t', { hasText: /^Post$/ }) }).first();
await row.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
const r = await row.boundingBox();
if (r) { await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.clock.runFor(700); await page.waitForTimeout(300); await page.mouse.up(); await page.clock.runFor(600); }
await page.waitForTimeout(500);
if (await page.locator('.menu').getByRole('button', { name: 'Tick off', exact: true }).count()) {
  await tap(page.locator('.menu').getByRole('button', { name: 'Tick off', exact: true }), 'Tick off in the menu');
  await tap(btn('15 min'), '15 min');
  await toToday();
  if (await tickable('Post')) fails.push('Post, ticked off from the menu, can still be ticked off');
} else fails.push('no Tick off in the job menu');

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`tick (${w}x${h}): ok`);
