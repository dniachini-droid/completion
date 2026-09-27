// Delete, everywhere, and "Another day…" (Dan, 2026-09-27, D-125). A row on Today slides left to Delete, and Undo brings
// it back; Choose a delve deletes a job; in the Week a job is deleted from its sheet, and a done job can be deleted too
// (its minutes stay); "Another day…" opens the app's own four weeks, which stay open until a day is chosen, and the job
// lands on that day. Usage: node tests/flows/delete-day.mjs http://localhost:4173/ [width height]
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
const btn = (name) => page.getByRole('button', { name, exact: true });
const rowNamed = (name) => page.locator('.rows button.row', { hasText: name });
const add = async (name) => { await page.locator('.foot .add').click(); await page.keyboard.type(name); await page.keyboard.press('Enter'); await page.clock.runFor(800); };

/* 1. Today: a row slides left to "Not today" and "Delete"; Delete, then Undo */
await add('Sweep the yard'); await add('Wash the car');
const strip = page.locator('.swipe', { hasText: 'Sweep the yard' }).first();
const r = await strip.boundingBox();
if (!r) fails.push('no Sweep the yard row');
else {
  await page.mouse.move(r.x + r.width - 30, r.y + r.height / 2); await page.mouse.down();
  await page.mouse.move(r.x + r.width - 260, r.y + r.height / 2, { steps: 8 }); await page.mouse.up(); await page.clock.runFor(600);
  if (!(await strip.getByRole('button', { name: 'Not today', exact: true }).count())) fails.push('the swipe shows no "Not today"');
  await strip.getByRole('button', { name: 'Delete', exact: true }).click(); await page.clock.runFor(800);
  if (await rowNamed('Sweep the yard').count()) fails.push('Sweep the yard, deleted, is still on Today');
  if (!(await btn('Undo').count())) fails.push('no Undo after Delete on Today');
  await btn('Undo').click(); await page.clock.runFor(800);
  if (!(await rowNamed('Sweep the yard').count())) fails.push('Undo did not bring Sweep the yard back');
}

/* 2. Something else… (Choose a delve): Delete on a job's line */
await page.locator('.rows button.row.else').click(); await page.clock.runFor(1200);
const line = page.locator('.line', { hasText: 'Wash the car' }).first();
if (!(await line.count())) fails.push('Wash the car is not in Choose a delve');
else {
  await line.getByRole('button', { name: /delete/i }).click(); await page.clock.runFor(800);
  if (await page.locator('.line', { hasText: 'Wash the car' }).count()) fails.push('Wash the car, deleted in Choose, is still there');
  if (!(await btn('Undo').count())) fails.push('no Undo after Delete in Choose');
}
await page.locator('button.home').click(); await page.clock.runFor(1200);

/* 3. the Week: a job's sheet → Another day… → the app's four weeks stay open → a day → the job is there */
await btn('Week').click(); await page.clock.runFor(1500);
await page.locator('.day button.row', { hasText: 'Sweep the yard' }).first().click(); await page.clock.runFor(600);
await btn('Another day…').click(); await page.clock.runFor(3000);
const days = page.locator('.cal button');
if ((await days.count()) !== 28) fails.push(`"Another day…" shows ${await days.count()} days, not four weeks`);
else {
  await days.nth(9).click(); await page.clock.runFor(1200);   /* the Wednesday of the week after next */
  if (await page.locator('.day button.row', { hasText: 'Sweep the yard' }).count()) fails.push('Sweep the yard is still in this week after Another day');
  /* the week after next: it is there, on its Wednesday */
  await btn('Next week').click(); await page.clock.runFor(1200); await btn('The week after').click(); await page.clock.runFor(1200);
  if (!(await page.locator('.day button.row', { hasText: 'Sweep the yard' }).count())) fails.push('Sweep the yard is not in the week it was moved to');
}
/* 4. a done job in the Week: Delete; it leaves the week and the minutes stay */
for (let k = 0; k < 4 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.home').click(); await page.clock.runFor(1200); }
await page.locator('.next button.btn').click(); await page.clock.runFor(1200);
if (await page.locator('.rs').count()) {
  /* the set-up opens at 30 × 1 (D-124): shorter, so the test is quick */
  await btn('Begin').click(); await page.clock.runFor(1200);
}
{ const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 31 * 60_000); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(1500); }
if (await btn('Done').count()) { await btn('Done').click(); await page.clock.runFor(1500); }
for (let k = 0; k < 6 && !(await page.locator('.foot .add').count()); k++) {
  const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn').first();
  await way.click().catch(() => {}); await page.clock.runFor(1500);
}
await btn('Week').click(); await page.clock.runFor(1500);
const doneRow = page.locator('.day button.row.done').first();
if (!(await doneRow.count())) fails.push('no done job in the Week to delete');
else {
  const name = (await doneRow.locator('.t').innerText()).trim();
  await doneRow.click(); await page.clock.runFor(600);
  await page.locator('.sheet').getByRole('button', { name: 'Delete', exact: true }).click(); await page.clock.runFor(800);
  if (await page.locator('.day button.row.done', { hasText: name }).count()) fails.push(`${name}, done and deleted, is still in the Week`);
}
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`delete-day (${w}x${h}): ok`);
