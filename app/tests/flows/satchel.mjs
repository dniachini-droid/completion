// The satchel (Dan, 2026-09-27, D-126; one place for every job, D-131): every job not on today, in three sections. Reached
// from Today's foot by day and at night; a job saved for later has no day; a list kept a line at a time; "Put on a day"
// on a later day moves it to "Coming up" with its day (a day next month too, the calendar a month at a time), and a tap
// on that day moves it; Delete is a slide, with Undo; "Delve now" starts a delve at once; a tap delves, the list shows in
// the delve, a line struck off there goes when it ends. Usage: node tests/flows/satchel.mjs URL [w h]
const { launch } = await import('./browser.mjs');
const [,, url, w = '440', h = '956'] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const btn = (name) => page.getByRole('button', { name, exact: true });
const item = (name) => page.locator('.item', { hasText: name }).first();
const put = async (name) => { await page.locator('form.satchel-add input').fill(name); await btn('Save for later').click(); await page.clock.runFor(600); };
/* a slide to the left on a row, by the finger's own path */
const slide = async (row) => { await row.scrollIntoViewIfNeeded(); await page.clock.runFor(100); const r = await row.boundingBox(); const y = r.y + r.height / 2; await page.mouse.move(r.x + r.width - 30, y); await page.mouse.down();
  for (let k = 1; k <= 8; k++) { await page.mouse.move(r.x + r.width - 30 - k * 25, y); await page.clock.runFor(16); } await page.mouse.up(); await page.clock.runFor(400); };
const section = async (label) => page.evaluate(l => [...document.querySelectorAll('.label-line')].some(x => x.textContent.trim() === l), label);
/* the foot fits on one line, Satchel included, and nothing slides sideways */
const foot = await page.evaluate(() => { const f = document.querySelector('.foot'); return { w: f.scrollWidth, cw: f.clientWidth, h: f.getBoundingClientRect().height }; });
if (foot.w > foot.cw + 1) fails.push(`the foot is wider than the screen (${foot.w} > ${foot.cw})`);

/* 1. in, with no day */
await btn('Satchel').click(); await page.clock.runFor(1200);
if (!(await page.locator('img.art').count())) fails.push('no satchel picture');
for (const l of ['No day yet', 'Recurring jobs']) if (!(await section(l))) fails.push(`no "${l}" section`);
/* the recurring jobs are here, and nothing on today is */
const recurring = await page.locator('.item button.row, .rows button.row').allTextContents();
if (!recurring.some(x => /Gym/.test(x))) fails.push('the gym is not under Recurring jobs');
if (await page.getByRole('button', { name: 'Add a recurring job' }).count() === 0) fails.push('no way to add a recurring job');
await put('Shopping'); await put('Errands'); await put('Old plan');
const names = await page.locator('.item .t').allTextContents();
if (names.slice(0, 3).join('|') !== 'Old plan|Errands|Shopping') fails.push(`the satchel is not newest first: ${names.join(', ')}`);
/* 2. a list, a line at a time */
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.type('shampoo'); await item('Shopping').getByRole('button', { name: /^Close:/ }).click(); await page.clock.runFor(400);
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.type('milk'); await item('Shopping').getByRole('button', { name: /^Close:/ }).click(); await page.clock.runFor(400);
const pv = await item('Shopping').locator('.preview').innerText().catch(() => '');
if (pv !== 'shampoo · milk') fails.push(`the list reads "${pv}", not "shampoo · milk"`);
/* 2b. typed, then left by the way back (not Done): what was typed is kept (review, D-126) */
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.type('bread');
await page.locator('button.home').click(); await page.clock.runFor(800);
await btn('Satchel').click(); await page.clock.runFor(1000);
const pv2 = await item('Shopping').locator('.preview').innerText().catch(() => '');
if (pv2 !== 'shampoo · milk · bread') fails.push(`left by the way back, the list reads "${pv2}"`);
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.press('Backspace'); for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
await item('Shopping').getByRole('button', { name: /^Close:/ }).click(); await page.clock.runFor(400);
/* 3. Put on a day: a day next month (the calendar a month at a time, D-131), then Coming up with its day */
await item('Errands').getByRole('button', { name: /^Put on a day:/ }).click(); await page.clock.runFor(400);
const cal = item('Errands').locator('.cal');
const title0 = await cal.locator('.title').innerText().catch(() => '');
if (!/September 2026/i.test(title0)) fails.push(`the calendar's title is "${title0}", not September 2026`);
if (!(await cal.getByRole('button', { name: 'The month before' }).isDisabled())) fails.push('the calendar goes back before this month');
await cal.getByRole('button', { name: 'The next month' }).click(); await page.clock.runFor(300);
const title1 = await cal.locator('.title').innerText().catch(() => '');
if (!/October 2026/i.test(title1)) fails.push(`the next month's title is "${title1}"`);
const cell = cal.getByRole('button', { name: /^Friday 16 October$/ });
if (!(await cell.count())) fails.push('no Friday 16 October in the next month');
else {
  const box = await cell.boundingBox();
  if (box.height < 43.5 || box.width < 43.5 * (+w >= 390 ? 1 : 0.9)) fails.push(`a calendar day is ${Math.round(box.width)}×${Math.round(box.height)}, under 44 points`);
  await cell.click(); await page.clock.runFor(800);
  if (!(await section('Coming up'))) fails.push('no "Coming up" after putting Errands on a later day');
  const day = page.getByRole('button', { name: /^Errands: on Fri 16 Oct/ });
  if (!(await day.count())) fails.push('Errands is not under Coming up with "Fri 16 Oct"');
  const inNoDay = await page.evaluate(() => { const labels = [...document.querySelectorAll('.label-line')]; const a = labels.find(x => x.textContent.trim() === 'No day yet'), b = labels.find(x => x.textContent.trim() === 'Coming up');
    let n = a?.nextElementSibling, out = false; while (n && n !== b) { if (n.textContent.includes('Errands')) out = true; n = n.nextElementSibling; } return out; });
  if (inNoDay) fails.push('Errands is in No day yet and Coming up at once');
  /* a tap on the day moves it: to today, and it leaves the Satchel for Today */
  if (await day.count()) { await day.click(); await page.clock.runFor(300);
    await page.locator('.cal').first().getByRole('button', { name: /today$/ }).click(); await page.clock.runFor(800);
    if (await page.locator('.rows button.row', { hasText: 'Errands' }).count()) fails.push('Errands, moved to today, is still in the Satchel'); }
}
/* 4. Delete: a slide, and Undo */
await slide(item('Old plan').locator('button.row'));
const del = item('Old plan').locator('.acts .act.del');
if (!(await del.count())) fails.push('a slide on Old plan shows no Delete');
else await del.click();
await page.clock.runFor(600);
if (await item('Old plan').count()) fails.push('Old plan, deleted, is still in the satchel');
if (await btn('Undo').count()) { await btn('Undo').click(); await page.clock.runFor(600); } else fails.push('no Undo after Delete');
if (!(await item('Old plan').count())) fails.push('Undo did not bring Old plan back');
/* 4b. "Delve now": a new job's delve begins at once, and it is on Today, not here */
await page.locator('form.satchel-add input').fill('Ring the vet'); await btn('Delve now').click(); await page.clock.runFor(1500);
if (!(await page.locator('.dv').count())) fails.push('"Delve now" did not start a delve');
else {
  await btn('Finish here').click(); await page.clock.runFor(1200);
  if (await btn('Not yet').count()) { await btn('Not yet').click(); await page.clock.runFor(800); }
  for (let k = 0; k < 4 && !(await page.locator('nav.foot').count()); k++) { await page.locator('.home').first().click().catch(() => {}); await page.clock.runFor(1200); }
  if (!(await page.locator('.rows button.row', { hasText: 'Ring the vet' }).count() + (await page.locator('.next h2', { hasText: 'Ring the vet' }).count()))) fails.push('"Ring the vet", delved on now, is not on Today');
  await btn('Satchel').click(); await page.clock.runFor(1200);
  if (await item('Ring the vet').count()) fails.push('"Ring the vet" is on Today and in the Satchel');
}
/* 5. a tap delves; the list is there; a line struck off goes when the delve ends */
await item('Shopping').locator('button.row').click(); await page.clock.runFor(1200);
if (await page.locator('.rs').count()) { await btn('Begin').click(); await page.clock.runFor(1200); }
if (!(await page.locator('.dv').count())) fails.push('a tap on Shopping did not open its delve');
else {
  const line = page.locator('.dv ul.list button', { hasText: 'shampoo' });
  if (!(await line.count())) fails.push('the delve does not show the list');
  else { await line.click(); await page.clock.runFor(400);
    if ((await line.getAttribute('aria-pressed')) !== 'true') fails.push('shampoo is not struck off in the delve'); }
  { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 3 * 60_000); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); }
  await btn('Finish here').click(); await page.clock.runFor(1200);
  if (await btn('Not yet').count()) { await btn('Not yet').click(); await page.clock.runFor(800); }
  for (let k = 0; k < 4 && !(await page.locator('nav.foot').count()); k++) { await page.locator('.home').first().click().catch(() => {}); await page.clock.runFor(1200); }
  /* delved on and "Not yet": it is on Today now, and only there (D-131); its set-up shows what is left of the list */
  await btn('Satchel').click(); await page.clock.runFor(1200);
  if (await item('Shopping').count()) fails.push('Shopping, delved on today, is still in the Satchel');
  await page.locator('button.home').click(); await page.clock.runFor(1200);
  const onToday = page.locator('.rows button.row', { hasText: 'Shopping' }).first();
  if (!(await onToday.count())) fails.push('Shopping, delved on and "Not yet", is not on Today');
  else { await onToday.click(); await page.clock.runFor(1200);
    const after = await page.locator('.rs .last').innerText().catch(() => '');
    if (after !== 'milk') fails.push(`after the delve the list reads "${after}", not "milk"`);
    await page.locator('.home').first().click(); await page.clock.runFor(1200); }
}
/* 6. at night the satchel is still one tap from Today */
{ const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 13 * 3600_000); await page.clock.runFor(2000); }
for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn, .home').first().click().catch(() => {}); await page.clock.runFor(1500); }
if (!(await btn('Satchel').count())) fails.push('no Satchel on Today at night');
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`satchel (${w}x${h}): ok`);
