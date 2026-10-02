// Today after the flow review (D-143 C, E, G; J7, J9, J11, J18, J19, J2): the hint about the job menu, said until the menu
// is found; the avoided job named once it alone holds the day; a done recurring row opens its menu with a tap (Delve
// again, Not done after all); "Not today" stays on Today, struck, with Put it back, after a visit elsewhere; during a
// delve, "Add a job" and the other jobs' menus stay (only a second delve is blocked); the held card says which of the
// run's delves; a one-off says the minutes it has, never a number nobody set.
// SHOTS=<dir> saves pictures. Usage: node tests/flows/today-flow.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
/* a Thursday: gym, the course, the lesson at 18:00 and the avoided cat's medication on the list */
await page.clock.install({ time: new Date('2026-10-01T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
const fails = [];
const btn = name => page.getByRole('button', { name, exact: true });
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(250);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const onToday = async () => (await page.locator('nav.foot').count()) > 0;
const toToday = async () => { for (let k = 0; k < 8 && !(await onToday()); k++) { const way = (await page.locator('button.home').count()) ? page.locator('button.home') : page.locator('button.btn'); await tap(way, 'a way back to Today'); } };
const shot = async n => { if (shots) { await page.waitForTimeout(1200); await page.screenshot({ path: `${shots}/today-flow-${n}-${w}.png` }); } };
const row = name => page.locator('.rows button.row').filter({ has: page.locator('.t', { hasText: new RegExp(`^${name}`) }) }).first();
const hold = async (loc, what) => {
  await loc.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(400);
  const r = await loc.boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what} to hold`); return false; }
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.clock.runFor(700); await page.waitForTimeout(300); await page.mouse.up(); await page.clock.runFor(600);
  return true;
};
const tickOff = async (name, label) => { await tap(page.getByRole('button', { name: `${name}: tick off`, exact: true }), `the tick circle on ${name}`); await tap(btn(label), label); await page.waitForTimeout(500); await toToday(); };
await toToday();

/* J19: the hint, until the menu is found */
if (!(await page.getByText('Tap a job to delve on it. Press and hold for more.').count())) fails.push('no hold hint on a fresh Today');
/* J2: a one-off nobody gave minutes says none */
const catNote = (await row('Order the cat').locator('.s').textContent().catch(() => ''))?.trim();
if (catNote) fails.push(`the cat's medication row says "${catNote}"`);
await shot('1-fresh');
/* N polish: no Daybook link before there is a page in it */
if (await page.locator('.foot').getByRole('button', { name: 'Daybook', exact: true }).count()) fails.push('a Daybook link on a fresh save, with no page yet');

/* N polish, small phone: the job menu's calendar takes its place, Cancel in view under it */
if (await hold(row('Course'), 'Course')) {
  await tap(page.locator('.menu').getByRole('button', { name: 'Put on a day', exact: true }), 'Put on a day');
  const c = await page.locator('.menu .cancel').boundingBox().catch(() => null);
  if (!c || c.y < 0 || c.y + c.height > +h) fails.push(`with the calendar open, Cancel is not in view (${JSON.stringify(c)})`);
  if (await page.locator('.menu').getByRole('button', { name: 'Edit', exact: true }).count()) fails.push('the menu\'s other items stay under the open calendar');
  await tap(page.locator('.menu .cancel'), 'Cancel');
}
/* N polish, small phone: a row slid open keeps the job's name in view */
{
  const strip = page.locator('.swipe').filter({ has: page.locator('.t', { hasText: /^Course/ }) }).first();
  const r = await strip.boundingBox().catch(() => null);
  if (r) {
    await page.mouse.move(r.x + r.width - 30, r.y + r.height / 2); await page.mouse.down();
    await page.mouse.move(r.x + r.width - 260, r.y + r.height / 2, { steps: 8 }); await page.mouse.up(); await page.clock.runFor(600); await page.waitForTimeout(400);
    const t = await strip.locator('.t').boundingBox().catch(() => null);
    if (!t || t.x < 0 || t.width < 40) fails.push(`a slid row hides the job's name (${JSON.stringify(t)})`);
    await shot('1b-slid');
    await tap(row('Course'), 'the Course row (closes the slide)');
  }
}

/* G: the line's other jobs done, the avoided one is named */
const line = await page.locator('.rows').first().locator('.t').allTextContents();
for (const n of line.map(x => x.trim()).filter(x => !/^Order the cat/.test(x))) await tickOff(n, '1 h');
if (!(await page.getByText(/^Only Order the cat’s medication left: that’s the one\.$/).count())) fails.push('no "Only … left: that’s the one." with the avoided job alone on the line');
await shot('2-only');

/* J11: a done recurring row opens its menu with a tap */
await tap(row('Gym'), 'the done Gym row');
if (!(await page.locator('.menu').count())) fails.push('a tap on the done Gym row opened nothing');
else {
  if (!(await page.locator('.menu').getByRole('button', { name: 'Delve again', exact: true }).count())) fails.push('no "Delve again" in a done recurring job\'s menu');
  if (!(await page.locator('.menu').getByRole('button', { name: 'Not done after all', exact: true }).count())) fails.push('no "Not done after all" in its menu');
  await tap(page.locator('.menu').getByRole('button', { name: 'Cancel', exact: true }), 'Cancel');
}
/* the menu found: the hint is said no more */
await tap(page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week'); await toToday();
if (await page.getByText('Tap a job to delve on it. Press and hold for more.').count()) fails.push('the hold hint is still said after the menu was used');

/* J7: Not today stays, struck, with Put it back, after a visit to the Satchel */
/* (the slide's own action, as VoiceOver reaches it: the slide itself is checked in delete-day) */
await page.getByRole('button', { name: 'Order the cat’s medication: not today', exact: true }).dispatchEvent('click'); await page.clock.runFor(800);
await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel'); await toToday();
if (!(await page.locator('.aside-row', { hasText: 'Order the cat' }).count())) fails.push('"Not today" is gone from Today after a visit to the Satchel');
await shot('3-aside');
await tap(btn('Order the cat’s medication: put it back on today'), 'Put it back');
if (!(await row('Order the cat').count()) || await page.locator('.aside-row', { hasText: 'Order the cat' }).count()) fails.push('Put it back did not put the job back on the list');

/* E, J18: a run of two delves on a new job; paused, Today keeps Add a job and the menus, and says which delve */
/* (the day is done now: "Not today" on its last job finished it, D-130; Keep going leads to the Satchel) */
await tap(btn('Keep going'), 'Keep going');
await page.locator('.satchel-add input').focus(); await page.keyboard.type('Letters'); await page.keyboard.press('Enter'); await page.clock.runFor(1200);
await tap(page.locator('.item button.row').filter({ has: page.locator('.t', { hasText: /^Letters/ }) }), 'Letters in the Satchel');
await tap(btn('One more delve'), 'One more delve');
await tap(btn('Begin'), 'Begin');
await tap(btn('Pause'), 'Pause');
await tap(page.locator('button.home'), 'the arrow to Today');
if (!(await page.getByText(/the first of two delves/).count())) fails.push('the held card does not say "the first of two delves"');
if (!(await page.locator('.today-add').count())) fails.push('no "Add a job" during a delve');
if (await hold(row('Order the cat'), 'the cat\'s medication during the delve')) {
  const m = page.locator('.menu');
  if (!(await m.count())) fails.push('no job menu on another job during a delve');
  else {
    if (!(await m.getByRole('button', { name: 'Delve', exact: true }).isDisabled())) fails.push('a second delve can be started from the menu during a delve');
    if (await m.getByRole('button', { name: 'Edit', exact: true }).isDisabled()) fails.push('Edit is blocked during a delve');
    await tap(m.getByRole('button', { name: 'Cancel', exact: true }), 'Cancel');
  }
}
await shot('4-held');
/* J2: after "Not yet", the row says the minutes it has */
await tap(btn('Carry on'), 'Carry on');
const n0 = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n0 + 12 * 60_000); await page.clock.runFor(800);
await tap(btn('Finish here'), 'Finish here');
await tap(btn('Not yet'), 'Not yet'); await tap(btn('Back to today'), 'Back to today'); await toToday();
const lettersNote = (await row('Letters').locator('.t small').textContent().catch(() => ''))?.trim();
if (!/so far$/.test(lettersNote ?? '')) fails.push(`after "Not yet", Letters says "${lettersNote}", not the minutes so far`);
await shot('5-sofar');

await b.close();
if (errors.length) fails.push(...errors.map(e => `page error: ${e}`));
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('today-flow: ok');
