// Today with no job put forward (Dan, D-135): one "Add a job" button (the Satchel's box, ready to type), every job of
// the day in the list, no "+ Add" and no "Something else…"; "I can't start" in the job menu; a place reached (by ticking
// jobs off) is read again from the place's name on Today, and from "Read again" on the Map.
// SHOTS=<dir> saves pictures. Usage: node tests/flows/today-list.mjs http://localhost:4173/ [width height]
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
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const btn = (name) => page.getByRole('button', { name, exact: true });
const shot = async (name) => { if (shots) { await page.waitForTimeout(1500); await page.screenshot({ path: `${shots}/today-${name}-${w}.png` }); } };
const toToday = async () => { for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn'); await tap(way, 'way back to Today'); } };

/* 1. no job put forward: one button, the whole day in the list */
if (!(await btn('Add a job').count())) fails.push('no "Add a job" on Today');
if (await btn('Delve').count()) fails.push('a job is still put forward with its own Delve button');
if (await page.getByRole('button', { name: /^\+ Add$/ }).count()) fails.push('"+ Add" is still at the foot');
if (await page.getByText('Something else…').count()) fails.push('"Something else…" is still in the list');
const rows = await page.locator('.rows button.row .t').count();
if (rows < 2) fails.push(`only ${rows} job(s) in Today's list`);
await shot('1-today');

/* 2. "I can't start" lives in the job menu now */
{
  const row = page.locator('.rows button.row').first(), r = await row.boundingBox();
  if (r) { await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.clock.runFor(700); await page.waitForTimeout(300); await page.mouse.up(); await page.clock.runFor(600); }
  await page.waitForTimeout(400);
  if (!(await page.locator('.menu').getByRole('button', { name: 'I can’t start', exact: true }).count())) fails.push('no "I can’t start" in the job menu');
  await tap(page.locator('.menu .cancel'), 'Cancel in the menu');
}

/* 3. Add a job: the Satchel's box, ready to type */
await tap(btn('Add a job'), 'Add a job');
if (!(await page.locator('h1', { hasText: /satchel/i }).count())) fails.push('"Add a job" does not open the Satchel');
const focused = await page.evaluate(() => document.activeElement?.closest?.('.satchel-add') !== null && document.activeElement?.tagName === 'INPUT');
if (!focused) fails.push('the Satchel\'s box is not ready to type in');
await page.keyboard.type('Errands'); await btn('Save for later').click().catch(() => {}); await page.clock.runFor(800);
await toToday();

/* 4. a place reached (three long jobs ticked off), read again from its name on Today */
for (let k = 0; k < 3 && (await page.locator('.rows .tickbtn').count()); k++) {
  await tap(page.locator('.rows .tickbtn').first(), 'a tick circle');
  await tap(btn('3 h'), '3 h');
  for (let j = 0; j < 8 && !(await page.locator('nav.foot').count()); j++) {
    const way = (await page.locator('.arr').count()) ? page.locator('.arr .home') : (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn');
    await tap(way, 'way back to Today');
  }
}
const place = (await page.locator('h1 .here').innerText().catch(() => '')).trim();
if (!place) fails.push('the place\'s name on Today is not a button after reaching a place');
else {
  await tap(page.locator('h1 .here'), 'the place\'s name');
  if (!(await page.locator('.arr').count())) fails.push('the place\'s name does not open its entry');
  await shot('2-again');
  await tap(page.locator('.arr .home'), 'Today from the entry');
  if (!(await page.locator('nav.foot').count())) fails.push('the entry read again does not go back to Today');
}

/* 5. the Map: Read it again */
await tap(btn('Map'), 'Map');
const read = page.locator('.read');
if (!(await read.count())) fails.push('no "Read again" on the Map');
else {
  await tap(read, 'Read again');
  if (!(await page.locator('.arr').count())) fails.push('"Read again" does not open the place\'s entry');
  await shot('3-map-read');
  await tap(page.locator('.arr .home'), 'back from the entry');
  if (!(await page.locator('.field, .sky').count())) fails.push('the entry opened from the Map does not go back to the Map');
}

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`today-list (${w}x${h}): ok`);
