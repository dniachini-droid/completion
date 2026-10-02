// Deep review (words), part 3: two probes. (1) The arrow's name on the Map opened from "A later week" and from "Next
// week". (2) Rule 10: a job ticked off for 3 h, "Not done after all", then ticked off again: does it pay twice?
// Review only. Usage (from app/): URL=http://localhost:4185/ node tests/review/deep-words3.mjs
const { launch } = await import('../flows/browser.mjs');
const APP = process.env.URL ?? 'http://localhost:4185/';
const b = await launch();
const context = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Europe/London', hasTouch: true });
const page = await context.newPage();
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(APP);
for (let k = 0; k < 40 && !(await page.locator('nav.foot').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
const settle = async () => { await page.clock.runFor(1300); await page.waitForTimeout(100); };
const press = async (loc) => { const l = typeof loc === 'string' ? page.getByRole('button', { name: loc, exact: true }).first() : loc.first(); if (!(await l.count())) { console.log('  no', loc); return; } await l.dispatchEvent('click'); await settle(); };
const arrow = () => page.locator('button.home span').first().textContent();
const toToday = async () => { for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.home, button.btn').first().dispatchEvent('click'); await settle(); } };
const road = () => page.locator('section.where').getAttribute('aria-label');

await press(page.locator('nav.foot').getByRole('button', { name: 'Week', exact: true }));
await press('Next week'); await press('Map'); console.log(`Map from Next week: arrow "${await arrow()}"`);
await press('button.home'.length ? page.locator('button.home') : '');
await press('The week after'); console.log(`h1 "${await page.locator('h1').first().textContent()}"`);
await press('Map'); console.log(`Map from the week after: arrow "${await arrow()}"`);
await toToday();

console.log('road at start:', await road());
await press('Add a job'); await page.locator('.satchel-add input').fill('Fold one sock'); await press('Add to today'); await toToday();
await press(page.getByRole('button', { name: 'Fold one sock: tick off', exact: true })); await press('3 h'); await toToday();
console.log('after the first 3 h tick:', await road());
await press(page.getByRole('button', { name: 'Fold one sock: not done after all', exact: true }));
const again = page.getByRole('button', { name: 'Fold one sock: tick off', exact: true });
console.log('tick off offered again after "Not done after all":', await again.count());
if (await again.count()) {
  await press(again); console.log('sheet buttons:', await page.locator('.sheet button').allTextContents());
  await press('3 h'); await toToday(); console.log('after the second 3 h tick:', await road());
}
/* a second new job, ticked at once */
await press('Add a job'); await page.locator('.satchel-add input').fill('Fold another sock'); await press('Add to today'); await toToday();
await press(page.getByRole('button', { name: 'Fold another sock: tick off', exact: true })); await press('3 h'); await toToday();
console.log('after a second new job ticked 3 h:', await road(), '| place name:', await page.locator('h1').first().textContent());
await b.close();
