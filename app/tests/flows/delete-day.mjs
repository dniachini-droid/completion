// Delete, everywhere, and "Another day…" (Dan, 2026-09-27, D-125). A row on Today slides left to Delete, and Undo brings
// it back; "Something else…" opens the Satchel (D-131); in the Week a job is deleted from its sheet, and a done job can be
// deleted too (its minutes stay); "Another day…" opens the app's one calendar, a month at a time (D-131: on the last day
// of a month, the next month is one tap away), which stays open until a day is chosen, and the job lands on that day. Usage: node tests/flows/delete-day.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '440', h = '956'] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const btn = (name) => page.getByRole('button', { name, exact: true });
const rowNamed = (name) => page.locator('.rows button.row', { hasText: name });
/* a job on today: the Week's + on today (D-131: "+ Add" is the Satchel's box, for no day) */
const add = async (name) => { await btn('Week').click(); await page.clock.runFor(1200); await page.locator('button.plus').first().click(); await page.keyboard.type(name); await page.keyboard.press('Enter'); await page.clock.runFor(800);
  await page.locator('.home').click(); await page.clock.runFor(1200); };

/* 1. Today: a row slides left to "Not today" and "Delete"; Delete, then Undo */
await add('Sweep the yard'); await add('Wash the car');
const strip = page.locator('.swipe', { hasText: 'Sweep the yard' }).first();
const r = await strip.boundingBox();
if (!r) fails.push('no Sweep the yard row');
else {
  await page.mouse.move(r.x + r.width - 30, r.y + r.height / 2); await page.mouse.down();
  await page.mouse.move(r.x + r.width - 260, r.y + r.height / 2, { steps: 8 }); await page.mouse.up(); await page.clock.runFor(600);
  const del = await strip.getByRole('button', { name: 'Delete', exact: true }).evaluate(e => getComputedStyle(e).backgroundColor).catch(() => ''), not = await strip.getByRole('button', { name: 'Not today', exact: true }).evaluate(e => getComputedStyle(e).backgroundColor).catch(() => '');
  if (del && del === not) fails.push('Delete looks like "Not today" on the slide');
  if (!(await strip.getByRole('button', { name: 'Not today', exact: true }).count())) fails.push('the swipe shows no "Not today"');
  await strip.getByRole('button', { name: 'Delete', exact: true }).click(); await page.clock.runFor(800);
  if (await rowNamed('Sweep the yard').count()) fails.push('Sweep the yard, deleted, is still on Today');
  if (!(await btn('Undo').count())) fails.push('no Undo after Delete on Today');
  await btn('Undo').click(); await page.clock.runFor(800);
  if (!(await rowNamed('Sweep the yard').count())) fails.push('Undo did not bring Sweep the yard back');
}

/* 2. Something else… opens the Satchel (D-131), where a job on today is not */
await page.locator('.today-add').click(); await page.clock.runFor(1200);
if (!(await page.locator('h1', { hasText: /satchel/i }).count())) fails.push('"Something else…" does not open the Satchel');
if (await page.locator('.item', { hasText: 'Wash the car' }).count()) fails.push('Wash the car, on today, is in the Satchel too');
await page.locator('button.home').click(); await page.clock.runFor(1200);

/* 3. the Week: a job's sheet → Another day… → the app's one calendar (D-130, D-131: a month at a time, from today on)
   stays open → the next month → a day → the job is there */
await btn('Week').click(); await page.clock.runFor(1500);
await page.locator('.day button.row', { hasText: 'Sweep the yard' }).first().click(); await page.clock.runFor(600);
await btn('Another day…').click(); await page.clock.runFor(3000);
const today = await page.locator('.cal button.today').count();
if (!today || !/September 2026/i.test(await page.locator('.cal .title').innerText())) fails.push('"Another day…" is not the app\'s calendar on this month, today marked');
else {
  /* the last day of September: the next month is one tap away (Dan, D-131), and Wednesday 14 October is the week after next */
  await page.locator('.cal').getByRole('button', { name: 'The next month' }).click(); await page.clock.runFor(400);
  await page.locator('.cal').getByRole('button', { name: /^Wednesday 14 October/ }).click(); await page.clock.runFor(1200);
  if (await page.locator('.day button.row', { hasText: 'Sweep the yard' }).count()) fails.push('Sweep the yard is still in this week after Another day');
  /* the week after next: it is there, on its Wednesday */
  await btn('Next week').click(); await page.clock.runFor(1200); await btn('The week after').click(); await page.clock.runFor(1200);
  if (!(await page.locator('.day button.row', { hasText: 'Sweep the yard' }).count())) fails.push('Sweep the yard is not in the week it was moved to');
}
/* 4. a done job in the Week: Delete; it leaves the week and the minutes stay */
for (let k = 0; k < 4 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.home').click(); await page.clock.runFor(1200); }
await page.locator('.rows button.row:not(.done)').first().click(); await page.clock.runFor(1200);
if (await page.locator('.rs').count()) {
  /* the set-up opens at 30 × 1 (D-124): shorter, so the test is quick */
  await btn('Begin').click(); await page.clock.runFor(1200);
}
{ const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 31 * 60_000); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(1500); }
if (await btn('Done').count()) { await btn('Done').click(); await page.clock.runFor(1500); }
for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) {
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
