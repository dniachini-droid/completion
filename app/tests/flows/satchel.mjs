// The satchel (Dan, 2026-09-27, D-126): the jobs with no day. Reached from Today's foot by day and at night; a job put in
// with no day; a list kept a line at a time; "Put on a day" takes it out onto that day; Delete with Undo; a tap delves,
// the list shows in the delve, a line struck off there goes when it ends. Usage: node tests/flows/satchel.mjs URL [w h]
const { launch } = await import('./browser.mjs');
const [,, url, w = '440', h = '956'] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('.foot .add, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const btn = (name) => page.getByRole('button', { name, exact: true });
const item = (name) => page.locator('.item', { hasText: name }).first();
const put = async (name) => { await page.locator('form.new input').fill(name); await page.locator('form.new button').click(); await page.clock.runFor(600); };
/* the foot fits on one line, Satchel included, and nothing slides sideways */
const foot = await page.evaluate(() => { const f = document.querySelector('.foot'); return { w: f.scrollWidth, cw: f.clientWidth, h: f.getBoundingClientRect().height }; });
if (foot.w > foot.cw + 1) fails.push(`the foot is wider than the screen (${foot.w} > ${foot.cw})`);

/* 1. in, with no day */
await btn('Satchel').click(); await page.clock.runFor(1200);
if (!(await page.locator('img.art').count())) fails.push('no satchel picture');
await put('Shopping'); await put('Errands'); await put('Old plan');
const names = await page.locator('.item .t').allTextContents();
if (names.slice(0, 3).join('|') !== 'Old plan|Errands|Shopping') fails.push(`the satchel is not newest first: ${names.join(', ')}`);
/* 2. a list, a line at a time */
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.type('shampoo'); await item('Shopping').getByRole('button', { name: /^Done:/ }).click(); await page.clock.runFor(400);
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.type('milk'); await item('Shopping').getByRole('button', { name: /^Done:/ }).click(); await page.clock.runFor(400);
const pv = await item('Shopping').locator('.preview').innerText().catch(() => '');
if (pv !== 'shampoo · milk') fails.push(`the list reads "${pv}", not "shampoo · milk"`);
/* 2b. typed, then left by the way back (not Done): what was typed is kept (review, D-126) */
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.type('bread');
await page.locator('button.home').click(); await page.clock.runFor(800);
await btn('Satchel').click(); await page.clock.runFor(1000);
const pv2 = await item('Shopping').locator('.preview').innerText().catch(() => '');
if (pv2 !== 'shampoo · milk · bread') fails.push(`left by the way back, the list reads "${pv2}"`);
await item('Shopping').getByRole('button', { name: /^List:/ }).click(); await page.keyboard.press('Backspace'); for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
await item('Shopping').getByRole('button', { name: /^Done:/ }).click(); await page.clock.runFor(400);
/* 3. Put on a day: out of the satchel, onto that day */
await item('Errands').getByRole('button', { name: /^Put on a day:/ }).click(); await page.clock.runFor(400);
const cells = item('Errands').locator('.cal button');
if (!(await cells.count())) fails.push('Put on a day shows no days');
else { await cells.nth(2).click(); await page.clock.runFor(800);
  if (await item('Errands').count()) fails.push('Errands, put on a day, is still in the satchel'); }
/* 4. Delete, and Undo */
await item('Old plan').getByRole('button', { name: /: delete$/ }).click(); await page.clock.runFor(600);
if (await item('Old plan').count()) fails.push('Old plan, deleted, is still in the satchel');
await btn('Undo').click(); await page.clock.runFor(600);
if (!(await item('Old plan').count())) fails.push('Undo did not bring Old plan back');
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
  for (let k = 0; k < 4 && !(await page.locator('.foot .add').count()); k++) { await page.locator('.home').first().click().catch(() => {}); await page.clock.runFor(1200); }
  await btn('Satchel').click(); await page.clock.runFor(1200);
  const after = await item('Shopping').locator('.preview').innerText().catch(() => '');
  if (after !== 'milk') fails.push(`after the delve the list reads "${after}", not "milk"`);
  await page.locator('button.home').click(); await page.clock.runFor(1200);
}
/* 6. at night the satchel is still one tap from Today */
{ const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 13 * 3600_000); await page.clock.runFor(2000); }
for (let k = 0; k < 6 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.btn, .home').first().click().catch(() => {}); await page.clock.runFor(1500); }
if (!(await btn('Satchel').count())) fails.push('no Satchel on Today at night');
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`satchel (${w}x${h}): ok`);
