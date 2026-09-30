// Park a thought mid-delve (Dan, D-138): a delve on a new job; "Park a thought" in its top bar opens one line over the
// lower part of the screen, above the keyboard; Return keeps it in the Satchel's No day yet, the box closes, "Parked:
// must email Sam" shows for a few seconds; the delve ran on untouched meanwhile (never paused); empty text does
// nothing; "Park it" works while paused, and the delve stays paused; the box opened, then the delve left alone: nothing
// keeps running; the end says "2 thoughts parked in the Satchel", and a tap opens the Satchel with both.
// SHOTS=<dir> saves pictures. Usage: node tests/flows/park.mjs http://localhost:4173/ [width height]
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
const shot = async (name) => { if (shots) { await page.waitForTimeout(600); await page.screenshot({ path: `${shots}/park-${name}-${w}.png` }); } };
const time = () => page.evaluate(() => document.querySelector('.dv .ring .time')?.textContent?.trim() ?? null);
/* the box sits inside the screen, whole, and nothing of the page slides sideways */
const inView = async (when) => {
  const r = await page.locator('form.park').boundingBox();
  if (!r) { fails.push(`${when}: no box`); return; }
  if (r.x < -0.5 || r.x + r.width > +w + 0.5 || r.y < 0 || r.y + r.height > +h + 0.5) fails.push(`${when}: the box is not wholly on screen (${JSON.stringify(r)})`);
  const slid = await page.evaluate(() => [...document.querySelectorAll('.ui, .ui .scroll, .ui .body')].some(e => e.scrollLeft) || scrollX || scrollY);
  if (slid) fails.push(`${when}: the screen slid`);
};
const typeAndPark = async (text, how) => {
  await tap(btn('Park a thought'), 'Park a thought');
  if (!(await page.locator('form.park input').count())) { fails.push(`${text}: no box`); return; }
  const focused = await page.evaluate(() => document.activeElement?.closest('form.park') != null);
  if (!focused) fails.push(`${text}: the box did not take the keyboard`);
  await inView(`${text}, the box open`);
  await page.keyboard.type(text);
  if (how === 'return') await page.keyboard.press('Enter'); else await tap(btn('Park it'), 'Park it');
  await page.clock.runFor(300);
};

/* a job and its delve, as Dan would: Add a job → Delve now */
await tap(page.locator('.today-add'), 'Add a job');
await page.keyboard.type('Tax return');
await tap(btn('Delve now'), 'Delve now');
if (!(await page.locator('.dv').count())) fails.push('no delve');
await ff(3 * 60_000);

/* 1. Return parks it: the box closes, the line shows, the delve runs on */
const before = await time();
await typeAndPark('must email Sam', 'return');
if (await page.locator('form.park').count()) fails.push('the box stayed open after Return');
if ((await page.locator('.parked-say.shown').textContent().catch(() => '')) !== 'Parked: must email Sam') fails.push('no "Parked: must email Sam"');
if (!(await page.evaluate(() => document.activeElement?.classList.contains('park-link')))) fails.push('the focus did not return to "Park a thought"');
await shot('1-parked');
await page.clock.runFor(5000); await page.waitForTimeout(200);
if (await page.locator('.parked-say.shown').count()) fails.push('"Parked" stayed longer than a few seconds');
const after = await time();
if (!before || !after || before === after) fails.push(`the delve did not run on while parking (${before} → ${after})`);
if (!(await btn('Pause').count())) fails.push('the delve is no longer running');

/* 2. empty text does nothing; Cancel closes */
await tap(btn('Park a thought'), 'Park a thought');
if (!(await page.locator('form.park button[type=submit]:disabled').count())) fails.push('"Park it" is open with nothing typed');
await page.keyboard.press('Enter'); await page.clock.runFor(300);
if (await page.locator('.parked-say.shown').count()) fails.push('an empty thought was parked');
await shot('2-open');
await tap(btn('Cancel'), 'Cancel');
if (await page.locator('form.park').count()) fails.push('Cancel left the box open');

/* 3. paused: parking keeps it paused, with "Park it" */
await tap(btn('Pause'), 'Pause');
const held = await page.getByText(/left$/).first().textContent().catch(() => null);
await typeAndPark('book the dentist', 'button');
await ff(2 * 60_000);
if (!(await page.getByText('Paused', { exact: true }).count())) fails.push('the delve is no longer paused after parking');
const held2 = await page.getByText(/left$/).first().textContent().catch(() => null);
if (held !== held2) fails.push(`the paused delve moved (${held} → ${held2})`);
await tap(page.getByRole('button', { name: /^Back to the delve/ }), 'Back to the delve');

/* 4. the box open over a running delve adds nothing that keeps running (D-132) */
await tap(btn('Park a thought'), 'Park a thought');
await page.clock.runFor(2000); await page.waitForTimeout(400);
const endless = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running'
  && a.effect?.getTiming().iterations === Infinity && a.effect?.target?.closest?.('form.park, .parked-say, .park-link')).length);
if (endless) fails.push(`${endless} endless animation(s) in the park box`);
await tap(btn('Cancel'), 'Cancel');

/* 4b. a thought typed, then Today: it is kept, never lost; back to the delve */
await tap(btn('Park a thought'), 'Park a thought');
await page.keyboard.type('water the plants');
await tap(page.locator('.home'), 'Today');
await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
if (!(await page.getByText('water the plants', { exact: true }).count())) fails.push('a thought typed and left behind was lost');
await tap(page.locator('.home'), 'back');
await tap(page.getByRole('button', { name: /Back to the delve/ }), 'Back to the delve');
if (!(await page.locator('.dv').count())) fails.push('no way back to the delve');

/* 5. the end: "2 thoughts parked in the Satchel", a tap opens the Satchel with both */
await ff(40 * 60_000);
/* the game's clock looks once a second (D-132): wait for the end's question, however slow the runner */
const until = async (loc) => { for (let k = 0; k < 20 && !(await loc.count()); k++) { await page.clock.runFor(1000); await page.waitForTimeout(150); } return (await loc.count()) > 0; };
if (await until(btn('Not yet'))) await tap(btn('Not yet'), 'Not yet'); else fails.push('no "Is it done?" at the end');
const line = page.getByRole('button', { name: '3 thoughts parked in the Satchel', exact: true });
if (!(await until(line))) fails.push('no "3 thoughts parked in the Satchel" at the end');
await shot('3-end');
await tap(line, 'the parked line');
if (!(await page.locator('form.satchel-add').count())) fails.push('the parked line did not open the Satchel');
for (const x of ['must email Sam', 'book the dentist', 'water the plants']) if (!(await page.getByText(x, { exact: true }).count())) fails.push(`${x} is not in the Satchel`);
/* never parked twice, never the end again */
if ((await page.getByText('must email Sam', { exact: true }).count()) > 1) fails.push('must email Sam is in the Satchel twice');
await tap(page.locator('.home'), 'back');
if (!(await page.locator('nav.foot').count())) fails.push('back from the Satchel did not reach Today');
if (await page.locator('.dv').count()) fails.push('the delve\'s end came back');

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`park (${w}x${h}): ok`);
