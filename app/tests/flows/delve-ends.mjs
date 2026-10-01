// A delve's end after the flow review (J1, J3, J8, J13, J14, J16, J17, J20, L B5, L C6): the errand run's "What got done?"
// left by the arrow waits on Today and is never counted behind Dan's back; "Delve now" on a job he has opens its set-up;
// the suggestions fold away; "Is it done?" says the minutes on it; "Where did you stop?" after Not yet; a few minutes'
// session is counted, never congratulated; the ring's unit; "No more" on its own row, and the line standing still after it.
// SHOTS=<dir> saves pictures. Usage: node tests/flows/delve-ends.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
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
const jump = async min => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + min * 60_000); await page.clock.runFor(800); await page.waitForTimeout(150); await page.clock.runFor(400); };
const shot = async n => { if (shots) { await page.waitForTimeout(1200); await page.screenshot({ path: `${shots}/delve-ends-${n}-${w}.png` }); } };
const facts = () => page.evaluate(() => JSON.parse(localStorage.getItem('save.v1') ?? '{"facts":[]}').facts);
const toSatchel = async () => { await toToday(); await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'the Satchel'); };
const save = async name => { await page.locator('.satchel-add input').focus(); await page.keyboard.type(name); await page.keyboard.press('Enter'); await page.clock.runFor(800); };
await toToday();

/* J1: an errand run's "What got done?", left by the arrow */
await toSatchel();
await save('Bank'); await save('Post office');
await page.locator('.satchel-add input').blur(); await page.clock.runFor(400);
await tap(btn('Errand run'), 'Errand run');
for (const n of ['Bank', 'Post office']) await tap(page.getByRole('checkbox', { name: `${n}: take it on the run`, exact: true }), `the ${n} tick`);
await tap(btn('Start the run'), 'Start the run'); await tap(btn('Begin'), 'Begin');
await jump(10); await tap(btn('Finish here'), 'Finish here');
if (!(await page.getByText('What got done?').count())) fails.push('no "What got done?" at the errand run\'s end');
await tap(page.getByRole('button', { name: /Bank/ }).first(), 'Bank, struck off');
await tap(page.locator('button.home'), 'the arrow');
if (!(await onToday())) fails.push('the arrow on "What got done?" did not lead to Today');
if (!(await page.getByText('What got done on the errand run?').count())) fails.push('Today does not say the errand run\'s question waits');
if ((await facts()).some(f => f.type === 'errandsCounted')) fails.push('the arrow counted the errand run');
await shot('1-waits');
await tap(btn('Strike them off'), 'Strike them off');
if (!(await page.getByText('What got done?').count())) fails.push('"Strike them off" did not lead back to the question');
await tap(btn('Count them'), 'Count them');
if (!(await page.getByText('Bank is done.').count())) fails.push('the errand run\'s end does not show Bank\'s story moment');
await shot('2-counted');
await toToday();

/* J16, J8: the suggestions fold away; "Delve now" on a job Dan has opens its set-up */
await toSatchel();
await page.locator('.satchel-add input').focus(); await page.keyboard.type('Post'); await page.clock.runFor(400);
if (!(await page.locator('ul.before').count())) fails.push('no suggestions under the box for "Post"');
await page.mouse.click(10, h - 10); await page.clock.runFor(400);
if (await page.locator('ul.before').count()) fails.push('the suggestions did not fold away with a tap elsewhere');
await page.locator('.satchel-add input').fill('Post office'); await page.clock.runFor(300);
await tap(btn('Delve now'), 'Delve now');
if (!(await page.locator('.rs').count())) fails.push('"Delve now" on Post office, already in the Satchel, did not open its set-up');
await tap(btn('Begin'), 'Begin');

/* J17, J3: "Is it done?" says the minutes; Not yet asks where Dan stopped */
await jump(4); await tap(btn('Finish here'), 'Finish here');
const onIt = await page.locator('.on-it').textContent().catch(() => '');
if (!/minutes? on it$/.test(onIt?.trim() ?? '')) fails.push(`"Is it done?" says "${onIt}", not the minutes on it`);
await tap(btn('Not yet'), 'Not yet');
if (!(await page.getByRole('textbox', { name: 'Where did you stop? (for next time)' }).count())) fails.push('no "Where did you stop?" after Not yet');
await shot('3-not-yet');
await tap(btn('Back to today'), 'Back to today');

/* J14, L C6: a session of a few minutes, counted; the ring's unit */
await tap(page.locator('.rows button.row').filter({ has: page.locator('.t', { hasText: /^Course$/ }) }), 'the Course row');
await tap(btn('Begin'), 'Begin'); await jump(3); await tap(btn('Finish here'), 'Finish here');
const said = (await page.locator('h2.m').textContent().catch(() => ''))?.trim();
if (!/^Counted: 3 minutes\.$/.test(said ?? '')) fails.push(`a 3-minute session says "${said}"`);
const unit = (await page.locator('.count .unit').textContent().catch(() => ''))?.trim();
if (unit !== 'min') fails.push(`the ring's unit is "${unit}"`);
await toToday();

/* J20, J13: "No more" on its own row; the line and count stand still after it */
await tap(page.getByRole('button', { name: 'Post office: tick off', exact: true }), 'the tick circle on Post office');
if (!(await page.locator('.sheet .chip.nomore').count())) fails.push('"No more" is not on its own row');
if (await page.locator('.sheet .grid .chip', { hasText: 'No more' }).count()) fails.push('"No more" is among the times');
await tap(btn('No more'), 'No more');
if (await page.locator('.tally.counting').count()) fails.push('after "No more", the ring counts as if the minutes were new');
await shot('4-no-more');

await b.close();
if (errors.length) fails.push(...errors.map(e => `page error: ${e}`));
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('delve-ends: ok');
