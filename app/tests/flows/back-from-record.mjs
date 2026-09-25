// Dan's report (2026-09-25): from a place, "Look at …" opens a record; its back arrow must return to the place, not to Records.
// Usage: PLAYWRIGHT=$(npm root -g)/playwright/index.mjs node tests/flows/back-from-record.mjs http://localhost:4173/
const { chromium } = await import(process.env.PLAYWRIGHT);
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 440, height: 956 }, timezoneId: 'Europe/London' });
await page.clock.install({ time: new Date('2026-09-24T09:00:00+01:00') });
await page.goto(process.argv[2]); await page.clock.runFor(2500);
let ok = false;
const has = async t => (await page.getByRole('button', { name: t, exact: true }).count()) > 0;
const tap = async t => page.getByRole('button', { name: t, exact: true }).first().click();
for (let k = 0; k < 12 && !(await has('See where you are')); k++) {
  if (await page.locator('.arr').count()) { await page.clock.runFor(6000); const o = page.locator('.opts .btn-quiet'); if (await o.count()) await o.first().click(); await tap(await has('Rest here for today') ? 'Rest here for today' : 'Back to today'); await page.clock.runFor(1500); continue; }
  /* a job done the long way (no "Already done" since D-089): Begin → Done, or Delve (→ Begin) → its end → Done */
  if (await has('Begin') || await has('Delve')) {
    await tap(await has('Begin') ? 'Begin' : 'Delve'); await page.clock.runFor(900);
    if (await has('Begin')) await tap('Begin');
    const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 75 * 60_000); await page.clock.runFor(2500);
    if (await has('Done')) { await tap('Done'); await page.clock.runFor(2500); }
    const o = page.locator('.opts .btn-quiet'); if (await o.count()) await o.first().click();
    if (await has('See where you are')) break;
    if (await has('Back to today')) await tap('Back to today'); await page.clock.runFor(1500);
  }
  else break;
}
await tap('See where you are'); await page.clock.runFor(3000);
const links = page.locator('.choice .text-link');
console.log('place screen:', await page.locator('.arr').count() > 0, 'look links:', await links.count());
if (await links.count()) {
  await links.first().click(); await page.clock.runFor(1200);
  console.log('opened a record:', await page.locator('.cutline, .paper').count() > 0);
  await page.locator('button.home').first().click(); await page.clock.runFor(1500);
  ok = await page.locator(".arr").count() > 0;
}
await b.close();
if (!ok) { console.log("FAIL: back did not return to the place"); process.exit(1); } else console.log("back-from-record: ok");
