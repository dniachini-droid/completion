// The begin → delve → pause → done loop, tried the ways Dan uses it (2026-09-27, D-120): a delve left for another app
// and carried on, from the delve and from Today; Finish here straight away; "Is it done?" answered "Not yet", then said
// done from Today; a satchel line put on today, begun and ticked; a satchel line delved on through "Something else…" and
// ticked mid-delve (the delve ends there); a double tap on Begin, Finish here and Done makes one decision; a delve that
// ends while Dan is in the Week is shown to him, and once said done it never comes back. Leaving the app is stood in for by hiding the page, as the screen checks do.
// Usage: node tests/flows/delve-loop.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '440', h = '956'] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('.foot .add, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); };
const hide = async (on) => { await page.evaluate(on => { Object.defineProperty(document, 'hidden', { get: () => on, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, on); await page.clock.runFor(300); };
const away = async (ms) => { await hide(true); await ff(ms); await hide(false); await page.clock.runFor(1500); };
/* a tap as a finger makes it, where the button is drawn */
const tap = async (loc, what) => {
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const btn = (name) => page.getByRole('button', { name, exact: true });
const screen = async () => (await page.locator('.dv').count()) ? 'delve' : (await page.locator('.rs').count()) ? 'set' : (await page.locator('.route').count()) ? 'step' : (await page.locator('.foot .add').count()) ? 'today' : '?';
const expectOn = async (want, when) => { const s = await screen(); if (s !== want) fails.push(`${when}: on ${s}, not ${want}`); return s === want; };
const has = async (name, when) => { if (!(await btn(name).count())) fails.push(`${when}: no "${name}"`); };
/* back to Today, past whatever the day brings first (a place reached, the stair) */
const toToday = async () => {
  for (let k = 0; k < 6 && (await screen()) !== 'today'; k++) {
    const way = (await page.locator('.home').count()) ? page.locator('.home') : page.getByRole('button', { name: /today/i }).or(page.locator('button.btn'));
    await tap(way, 'way back to Today');
  }
};

/* 1. the next job's delve; another app; Carry on; Today; another app from Today; Carry on there; Finish here straight */
await tap(page.locator('.next button.btn'), 'Delve');
if (await page.locator('.rs').count()) await tap(btn('Begin'), 'Begin on the set-up');
await expectOn('delve', 'after Delve');
await ff(3 * 60_000); await away(60_000);
if (!(await page.getByText('Paused while you were away').count())) fails.push('a delve left for another app is not paused');
await tap(page.getByRole('button', { name: /^Carry on/ }), 'Carry on on the delve');
await has('Pause', 'carried on');
await tap(page.locator('.home'), 'Today from the delve');
await has('Back to the delve', 'Today while delving');
await away(60_000);
await has('Carry on', 'Today after another app'); await has('Finish here', 'Today after another app');
await tap(btn('Carry on'), 'Carry on on Today'); await expectOn('delve', 'Carry on from Today');
await tap(btn('Finish here'), 'Finish here');
/* 2. "Is it done?" → Not yet → Today → It's done */
await has('Not yet', 'the delve finished'); await tap(btn('Not yet'), 'Not yet');
if (await page.getByText(/\b0 minutes/).count()) fails.push('"0 minutes so far" said');
await tap(btn('Back to today'), 'Back to today'); await expectOn('today', 'after Not yet');
await tap(btn('It’s done'), 'It’s done on Today'); await expectOn('step', 'It’s done');
await toToday();

/* 3. a satchel line: put on today, begun, ticked in the satchel */
const addLine = async (txt) => { await tap(btn('Satchel'), 'Satchel'); await tap(page.getByRole('button', { name: /add a line/i }), 'Add a line'); await page.keyboard.type(txt); await tap(page.locator('.btn-row .btn'), 'Put it in'); };
await addLine('Letters');
await tap(page.locator('.item', { hasText: 'Letters' }).getByRole('button', { name: /today/i }), 'Today on the line');
await tap(page.locator('.home'), 'back from the satchel');
await tap(page.locator('.rows button.row', { hasText: 'Letters' }), 'the Letters row');
if ((await page.locator('.next h2').first().textContent())?.trim() !== 'Letters') fails.push('Letters is not under way');
await tap(btn('Satchel'), 'Satchel'); await tap(page.locator('.item', { hasText: 'Letters' }).locator('.tickbox'), 'tick on Letters');
await expectOn('step', 'ticking a line under way'); await toToday();

/* 4. a satchel line delved on through "Something else…", ticked mid-delve: the delve ends there */
await addLine('Bills'); await tap(page.locator('.home'), 'back from the satchel');
await tap(page.locator('.rows button.row.else'), 'Something else…');
await tap(page.locator('button', { hasText: 'Bills' }), 'Bills in Choose'); await tap(btn('Begin'), 'Begin'); await expectOn('delve', 'delving on Bills');
await ff(4 * 60_000);
await tap(page.locator('.home'), 'Today'); await tap(btn('Satchel'), 'Satchel');
await tap(page.locator('.item', { hasText: 'Bills' }).locator('.tickbox'), 'tick on Bills'); await expectOn('step', 'ticking Bills mid-delve');
await toToday();
if (await btn('Back to the delve').count()) fails.push('the delve on Bills still runs after Bills was ticked');

await toToday();
/* 5. double taps: each makes one decision, never a second one on the screen that replaces it */
const double = async (loc, what) => { const r = await loc.first().boundingBox().catch(() => null); if (!r) { fails.push(`no ${what}`); return; }
  for (let i = 0; i < 2; i++) { await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(250); } await page.clock.runFor(1200); };
const choose = async (name) => { await tap(page.locator('.rows button.row.else, .after .btn-quiet'), 'Something else… or Keep going'); await tap(page.locator('.ui button').filter({ hasText: name }), name + ' in Choose'); };
await choose('Course');
await double(btn('Begin'), 'Begin');
if (!(await btn('Pause').count())) fails.push('Begin tapped twice did not leave the delve running');
await double(btn('Finish here'), 'Finish here');
if (await btn('Finish here').count() || !(await page.locator('.dv').count())) fails.push('Finish here tapped twice did not end on the delve\'s end');
if (await btn('Done').count()) { await double(btn('Done'), 'Done'); if (!(await page.locator('.dv').count())) fails.push('Done tapped twice skipped the job\'s return'); }
await toToday();

/* 6. a delve that ends while Dan is in the Week is shown to him; said done, it never comes back */
{
  await choose('Sort the post'); await tap(btn('Begin'), 'Begin');
  await tap(page.locator('.home'), 'Today'); await tap(btn('Week'), 'Week');
  await ff(26 * 60_000); await page.clock.runFor(1500);
  if (!(await page.locator('.dv').count())) fails.push('a delve that ended in the Week was not shown');
  await tap(page.locator('.home'), 'the arrow from the end');
  await tap(page.getByRole('button', { name: 'It’s done', exact: true }), 'It’s done for the post');
  await toToday();
  await page.reload(); await page.clock.runFor(2500);
  if (await page.locator('.dv').count()) fails.push('the delve\'s end came back after it was said done');
}

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`delve-loop (${w}x${h}): ok`);
