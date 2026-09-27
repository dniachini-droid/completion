// The UI tidy's step 2 and 3 on the screen (D-131). A press and hold leaves every row perfectly still (Dan's screenshot:
// a pressed row slid out of line), on Today and in the Satchel, and opens the job menu (Delve · Edit · Put on a day ·
// Delete); Edit is titled with the job's name and, for a one-off, shows only three things until "More…"; the day's jobs
// past its first 3 hours sit under "If there's time"; a done job slides to "Not done after all"; in the last hour before
// bed, Tonight offers "Tomorrow starts with" and "Anything on your mind?", and the next morning starts with the job chosen.
// Usage: node tests/flows/step2.mjs URL [w h]
const { launch } = await import('./browser.mjs');
const [,, url, w = '430', h = '932'] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
/* a Sunday: the plan puts more than 3 hours on it */
await page.clock.install({ time: new Date('2026-10-04T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('.foot .add, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
const toToday = async () => { for (let k = 0; k < 8 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.btn, .home').first().click().catch(() => {}); await page.clock.runFor(1500); } };
await toToday();
const fails = [];
const btn = (name) => page.getByRole('button', { name, exact: true });
const jump = async (min) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + min * 60_000); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); };

/** Every row's box, to the tenth of a pixel. */
const boxes = () => page.evaluate(() => [...document.querySelectorAll('.rows button.row')].map(r => { const b = r.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; }));
/** A press and hold with a finger's small tremble (a pixel or two, never a slide): no row may move by more than 0.5 px. */
async function pressStill(where, row) {
  /* brought into view first, and let settle (a scroll runs on the real clock, not the page's) */
  await row.scrollIntoViewIfNeeded(); await page.clock.runFor(300); await page.waitForTimeout(500);
  const before = await boxes(), r = await row.boundingBox(), x = r.x + r.width / 2, y = r.y + r.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  let worst = 0, how = '';
  for (const [dx, dy] of [[1, 0], [-2, 1], [2, -1], [-1, 2], [3, 1], [-3, -2], [0, 0]]) {
    await page.mouse.move(x + dx, y + dy); await page.clock.runFor(50);
    const now = await boxes();
    for (let i = 0; i < Math.min(now.length, before.length); i++) for (let k = 0; k < 4; k++) { const d = Math.abs(now[i][k] - before[i][k]); if (d > worst) { worst = d; how = `row ${i}, ${['left', 'top', 'width', 'height'][k]}`; } }
  }
  const moved = await page.evaluate(() => [...document.querySelectorAll('.rows button.row')].some(r => getComputedStyle(r).transform !== 'none'));
  if (worst > 0.5) fails.push(`${where}: a press and hold moved a row by ${worst.toFixed(1)} px (${how})`);
  if (moved) fails.push(`${where}: a pressed row was given a transform`);
  /* held on: the job menu (step 3) */
  await page.clock.runFor(400);
  await page.mouse.up(); await page.clock.runFor(300);
}

/* 1. Today: the finish line and "If there's time" */
if (!(await page.locator('.label-line', { hasText: /If there.s time/ }).count())) fails.push('no "If there\'s time" on a day planned past its first 3 hours');

/* 2. Today: a press and hold leaves the rows still, and opens the job menu */
const first = page.locator('.rows button.row:not(.else)').first();
const name = (await first.locator('.t').innerText()).trim();
await pressStill('Today', first);
const menu = page.locator('.menu[role=dialog]');
if (!(await menu.count())) fails.push('a press and hold on a row on Today opened no menu');
else {
  const items = (await menu.locator('button.item').allTextContents()).map(x => x.trim());
  for (const x of ['Delve', 'Edit', 'Put on a day', 'Delete']) if (!items.includes(x)) fails.push(`the job menu has no "${x}" (${items.join(', ')})`);
  if ((await menu.locator('.name').innerText()).trim() !== name) fails.push('the job menu does not name the job');
  const del = await menu.locator('button.item.del').evaluate(e => getComputedStyle(e).color), edit = await btn('Edit').evaluate(e => getComputedStyle(e).color);
  if (del === edit) fails.push('Delete looks like every other choice');
  /* Edit: the editor, titled with the job's name */
  await btn('Edit').click(); await page.clock.runFor(1200);
  const title = (await page.locator('h1').first().innerText()).trim();
  if (title.toLowerCase() !== name.toLowerCase()) fails.push(`the editor is titled "${title}", not "${name}"`);
  await page.locator('.home').first().click(); await page.clock.runFor(1200);
}
if (await page.locator('.menu[role=dialog]').count()) fails.push('the job menu stayed open');

/* 3. a one-off's editor: What, About how long, By a date; the rest under "More…" */
await btn('Satchel').click(); await page.clock.runFor(1200);
await page.locator('form.satchel-add input').fill('Fix the shelf'); await btn('Save for later').click(); await page.clock.runFor(600);
const shelf = page.locator('.item', { hasText: 'Fix the shelf' }).first().locator('button.row');
await pressStill('the Satchel', shelf);
if (!(await page.locator('.menu[role=dialog]').count())) fails.push('a press and hold in the Satchel opened no menu');
else {
  await btn('Edit').click(); await page.clock.runFor(1200);
  const labels = (await page.locator('.editor .label-line').allTextContents()).map(x => x.trim().toLowerCase());
  if (labels.some(l => /how often|put this off|first small step/.test(l))) fails.push(`a one-off's editor shows more than three things: ${labels.join(', ')}`);
  if (!(await btn('More…').count())) fails.push('no "More…" in a one-off\'s editor');
  else { await btn('More…').click(); await page.clock.runFor(300);
    if (!(await page.locator('.editor .label-line', { hasText: /How often/i }).count())) fails.push('"More…" shows no "How often"'); }
  await page.locator('.home').first().click(); await page.clock.runFor(1200);
}
await toToday();

/* the rest delves and jumps the clock across days, which Linux's WebKit crashes on (D-106): there, the press checks only */
if (process.env.BROWSER === 'webkit') { console.log('step2: in WebKit the delve and Tonight parts are left to Chromium (D-106)'); }
else {
/* 4. a done job slides to "Not done after all", and is a job to do again */
const target = page.locator('.rows button.row:not(.else)').first();
const tname = (await target.locator('.t').innerText()).trim();
await target.click(); await page.clock.runFor(1200);
if (await page.locator('.rs').count()) { await btn('Begin').click(); await page.clock.runFor(1200); }
await jump(6);
await btn('Finish here').click(); await page.clock.runFor(1200);
if (await btn('Done').count()) { await btn('Done').click(); await page.clock.runFor(1200); }
/* the job's return: its story words keep the column's margins, never running to the phone's edges (D-130, D-131) */
{ const out = await page.evaluate(() => [...document.querySelectorAll('.words p, .key-note')].map(p => { const r = p.getBoundingClientRect(); return [r.left, innerWidth - r.right]; }));
  for (const [l, r] of out) if (l < 17 || r < 17) fails.push(`a line of the return runs to ${Math.round(Math.min(l, r))} px from the edge`); }
await toToday();
const doneRow = page.locator('.rows button.row.done', { hasText: tname }).first();
if (!(await doneRow.count())) fails.push(`${tname}, delved on and done, is not a done row on Today`);
else {
  await doneRow.scrollIntoViewIfNeeded(); await page.clock.runFor(200);
  const r = await doneRow.boundingBox(), y = r.y + r.height / 2;
  await page.mouse.move(r.x + r.width - 30, y); await page.mouse.down();
  for (let k = 1; k <= 8; k++) { await page.mouse.move(r.x + r.width - 30 - k * 30, y); await page.clock.runFor(16); }
  await page.mouse.up(); await page.clock.runFor(400);
  const undo = page.locator('.act', { hasText: 'Not done after all' });
  if (!(await undo.count())) fails.push('a done row slides to no "Not done after all"');
  else { await undo.first().click(); await page.clock.runFor(800);
    if (await page.locator('.rows button.row.done', { hasText: tname }).count()) fails.push(`${tname} is still done after "Not done after all"`);
    const again = await page.locator('.rows button.row', { hasText: tname }).count() + await page.locator('.next h2', { hasText: tname }).count();
    if (!again) fails.push(`${tname} is not a job to do again`); }
}

/* 5. Tonight, in the last hour before bed (23:00): tomorrow's first job, and anything on your mind */
await page.clock.setSystemTime(new Date('2026-10-04T22:20:00+01:00')); await page.clock.runFor(2000);
await toToday();
if (!(await page.getByText('Tomorrow starts with:').count())) fails.push('no "Tomorrow starts with:" in the last hour before bed');
else {
  await page.getByRole('button', { name: 'Choose what tomorrow starts with' }).click(); await page.clock.runFor(300);
  const choices = page.locator('.choices .choice');
  const n = await choices.count();
  if (n < 2) fails.push('only one job to choose tomorrow\'s first from');
  const pick = choices.nth(n - 1), picked = (await pick.innerText()).split('\n')[0].trim();
  await pick.click(); await page.clock.runFor(400);
  const shown = (await page.getByRole('button', { name: 'Choose what tomorrow starts with' }).innerText()).trim();
  if (shown !== picked) fails.push(`tomorrow starts with "${shown}", not the "${picked}" chosen`);
  await page.getByRole('textbox', { name: 'Anything on your mind?' }).fill('Ring the vet'); await page.keyboard.press('Enter'); await page.clock.runFor(400);
  await btn('Go to sleep').click(); await page.clock.runFor(800);
  /* the next morning: the chosen job is the big Delve */
  await page.clock.setSystemTime(new Date('2026-10-05T08:30:00+01:00')); await page.clock.runFor(2500);
  await toToday();
  const next = (await page.locator('.next h2').first().innerText()).split(' · ')[0].trim();
  if (next !== picked) fails.push(`the morning opens with "${next}", not "${picked}"`);
  await btn('Satchel').click(); await page.clock.runFor(1200);
  if (!(await page.locator('.item', { hasText: 'Ring the vet' }).count())) fails.push('"Ring the vet", on your mind last night, is not in the Satchel');
}

}
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`step2 (${w}x${h}): ok`);
