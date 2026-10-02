// Remembered jobs (Dan, D-136): "Go to the bank" saved with a list, ticked off; the next day "bank" typed in the
// Satchel's box brings it up underneath (with "usually …" once learned); a tap fills the box and the new job carries the
// list; a recurring job picked is the job itself, never added twice; "Delve now" from a pick delves with the list; a
// name added a third time in 28 days brings "… keeps coming back. Make it a recurring job?": "No thanks" never asks again, "Make
// it repeat" opens the editor with How often ready. Nothing slides sideways; each suggestion is a finger high.
// SHOTS=<dir> saves pictures. Usage: node tests/flows/remember.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
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
const shot = async (name) => { if (shots) { await page.waitForTimeout(3600); await page.screenshot({ path: `${shots}/remember-${name}-${w}.png` }); } };
const toToday = async () => { for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) { const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn'); await tap(way, 'way back to Today'); } };
const toSatchel = async () => { await toToday(); await tap(page.locator('.today-add'), 'Add a job'); };
const box = () => page.locator('form.satchel-add input');
const type = async (text) => { await box().fill(''); await box().pressSequentially(text); await page.clock.runFor(300); };
const picks = () => page.locator('ul.before button.pick');
const item = (name) => page.locator('.item', { hasText: name });
const wide = async (where) => {
  const o = await page.evaluate(() => [document.documentElement, ...document.querySelectorAll('.ui, .body, form.satchel-add')].some(e => e.scrollWidth > e.clientWidth + 1));
  if (o) fails.push(`something slides sideways (${where})`);
};
/* ticked off at 15 minutes from its circle: finished, so the next of its name is a new job */
const tickOff = async (name) => {
  if (!(await tap(page.getByRole('button', { name: `${name}: tick off`, exact: true }), `the tick circle on ${name}`))) return;
  await tap(btn('15 min'), '15 min'); await page.waitForTimeout(3600); await page.clock.runFor(4000); await toToday();
};

/* 1. a first trip to the bank, with a list, ticked off */
await toSatchel();
await type('Go to the bank'); await tap(btn('Save for later'), 'Save for later');
await tap(item('Go to the bank').getByRole('button', { name: /^List:/ }), 'List on Go to the bank');
await page.keyboard.type('passport'); await tap(item('Go to the bank').getByRole('button', { name: /^Close:/ }), 'Close');
await tickOff('Go to the bank');

/* 2. the next day: "bank" brings it up under the box; a tap fills the box and the list comes with it */
await ff(24 * 3600_000); await toToday();
await toSatchel();
await type('bank');
if ((await picks().count()) !== 1) fails.push(`"bank" brings up ${await picks().count()} jobs, not 1`);
else {
  const t = await picks().first().locator('.t').innerText();
  if (t !== 'Go to the bank') fails.push(`"bank" brings up "${t}"`);
  const r = await picks().first().boundingBox();
  if (r.height < 43.5) fails.push(`a suggestion is ${Math.round(r.height)} px high, under 44`);
  const f = await box().boundingBox(), s2 = await btn('Save for later').boundingBox();
  if (!(r.y >= s2.y + s2.height - 1 && s2.y > f.y)) fails.push('the suggestions are not under the box and its buttons');
}
await wide('suggestions');
await shot('1-suggest');
await tap(picks().first(), 'the suggestion');
if ((await box().inputValue()) !== 'Go to the bank') fails.push(`the box says "${await box().inputValue()}" after the tap`);
if (await picks().count()) fails.push('the suggestions stay after one is picked');
await tap(btn('Save for later'), 'Save for later');
if (!(await item('Go to the bank').count())) fails.push('the picked job is not in No day yet');
const pv = await item('Go to the bank').locator('.preview').innerText().catch(() => '');
if (pv !== 'passport') fails.push(`the new job's list reads "${pv}", not "passport"`);

/* 3. a recurring job picked is the job itself: never added twice */
await type('gym');
const g = picks().filter({ hasText: 'Gym' });
if (!(await g.count())) fails.push('"gym" does not bring up the gym');
else {
  await tap(g, 'the gym');
  await tap(btn('Save for later'), 'Save for later');
  const said = await page.locator('.said').innerText().catch(() => '');
  if (!/recurring jobs/.test(said)) fails.push(`picking the gym and Save for later says "${said}"`);
  if (await item('Gym').count()) fails.push('the gym was added to No day yet');
}
/* a job still in the satchel, typed again: already there */
await type('go to the BANK'); await tap(btn('Save for later'), 'Save for later');
if ((await item('Go to the bank').count()) !== 1) fails.push(`"Go to the bank" is in the satchel ${await item('Go to the bank').count()} times`);
if (!/already in your Satchel/.test(await page.locator('.said').innerText().catch(() => ''))) fails.push('no "already in your Satchel"');

/* 4. "Delve now" from a pick: the delve shows the list */
await tickOff('Go to the bank');
await toSatchel(); await type('bank'); await tap(picks().first(), 'the suggestion'); await tap(btn('Delve now'), 'Delve now');
if (!(await page.locator('.dv').count())) fails.push('"Delve now" from a pick did not start a delve');
else if (!(await page.locator('.dv ul.list button', { hasText: 'passport' }).count())) fails.push('the delve does not show the list carried over');
await ff(20 * 60_000);
if (await btn('Finish here').count()) { await tap(btn('Finish here'), 'Finish here'); }
if (await btn('Done').count()) await tap(btn('Done'), 'Done');
else if (await btn('Not yet').count()) await tap(btn('Not yet'), 'Not yet');
await page.waitForTimeout(3600); await page.clock.runFor(4000);

/* 5. the third within 28 days: the offer, once; "No thanks" never asks again */
await toSatchel();
const offer = page.locator('.offer');
if (!(await offer.count())) fails.push('no offer after "Go to the bank" was added a third time');
else {
  const o = await offer.locator('p').innerText();
  if (o !== 'Go to the bank keeps coming back. Make it a recurring job?') fails.push(`the offer reads "${o}"`);
  for (const n of ['Make it recurring', 'No thanks']) { const r = await btn(n).boundingBox(); if (!r || r.height < 43.5) fails.push(`"${n}" is not a finger high`); }
  await wide('the offer');
  await shot('2-offer');
  await tap(btn('No thanks'), 'No thanks');
  if (await offer.count()) fails.push('the offer stays after No thanks');
  await toToday(); await toSatchel();
  if (await offer.count()) fails.push('the offer came back after No thanks');
}

/* 6. "Make it recurring": the editor with How often ready; saved, it is a recurring job and the offer is gone */
for (let k = 0; k < 3; k++) { await type('Water the plants'); await tap(btn('Save for later'), 'Save for later'); if (k < 2) { await tickOff('Water the plants'); await toSatchel(); } }
if (!(await btn('Make it recurring').count())) fails.push('no offer for Water the plants');
else {
  await tap(btn('Make it recurring'), 'Make it recurring');
  const pressed = await page.locator('.seg.often button[aria-pressed="true"]').allInnerTexts();
  if (!pressed.length || /once/i.test(pressed[0])) fails.push(`the editor opens with How often "${pressed.join(', ')}"`);
  await shot('3-editor');
  await tap(btn('Save'), 'Save');
  if (!(await page.locator('form.satchel-add').count())) fails.push('Save did not come back to the Satchel');
  if (await btn('Make it recurring').count()) fails.push('the offer stays once the job repeats');
  const rec = await page.locator('.rows button.row', { hasText: 'Water the plants' }).count();
  if (!rec) fails.push('Water the plants is not under Recurring jobs');
}
await wide('the end');
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`remember (${w}x${h}): ok`);
