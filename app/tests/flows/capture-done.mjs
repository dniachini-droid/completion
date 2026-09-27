// Dan's reports (2026-09-27, D-120, D-117): "+ Add"'s box sat behind the next job's words above the keyboard; and a
// one-off job's Done did nothing. Every job is a delve now (D-117): a job added is a delve on its day, and it is done by
// delving on it and saying so. On the iPhone the keyboard covers the page (the visible part shrinks, the
// page does not), so the check stands one in: the visual viewport is made shorter while the page stays its size, as there.
// The box must be wholly above the keyboard with nothing over it; after it closes, the page is back in place, the line is
// on today, and a job added in the Week, delved on and said done, is done. Usage: node tests/flows/capture-done.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '440', h = '956'] = process.argv;
const W = +w, H = +h, KB = Math.round(H * 0.36);   /* an iPhone keyboard with its word bar: about a third of the screen */
const b = await launch();
const page = await b.newPage({ viewport: { width: W, height: H }, timezoneId: 'Europe/London', hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
/* the stand-in keyboard: window.visualViewport answers with a height the check sets, as the iPhone's does */
await page.addInitScript(() => {
  const t = new EventTarget(); let kb = 0;
  Object.defineProperties(t, { height: { get: () => innerHeight - kb }, width: { get: () => innerWidth }, offsetTop: { get: () => 0 }, offsetLeft: { get: () => 0 }, scale: { get: () => 1 } });
  Object.defineProperty(window, 'visualViewport', { get: () => t });
  window.__keyboard = (px) => { kb = px; t.dispatchEvent(new Event('resize')); };
});
await page.clock.install({ time: new Date('2026-09-27T15:00:00+01:00') });
await page.goto(url); await page.clock.runFor(2500);
const fails = [];
/* past anything that opens first (a welcome, a morning), to Today */
for (let k = 0; k < 8 && !(await page.locator('.foot .add').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
/* a job added on today in the Week: a delve on today (D-117) */
await page.getByRole('button', { name: /^Week$/i }).click(); await page.clock.runFor(1500);
await page.locator('button.plus').first().click(); await page.keyboard.type('Test'); await page.keyboard.press('Enter'); await page.clock.runFor(800);
await page.locator('.home').click(); await page.clock.runFor(1500);
const testRow = page.locator('.rows button.row', { hasText: 'Test' }).first();
if (!(await testRow.count())) fails.push('Test, added on today in the Week, is not on Today');
else if (/one-off|about/i.test(await testRow.innerText())) fails.push('Test is shown as a job without a timer');

/* "+ Add", with the keyboard up */
await page.locator('.foot .add').click();
await page.evaluate(k => window.__keyboard(k), KB); await page.clock.runFor(600);
await page.keyboard.type('milk');
const box = await page.evaluate(() => {
  const ta = document.querySelector('.capture textarea'), r = ta.getBoundingClientRect(), phone = document.querySelector('.phone').getBoundingClientRect();
  const pts = [[r.left + 6, r.top + 6], [r.right - 6, r.top + 6], [r.left + r.width / 2, r.top + r.height / 2], [r.left + 6, r.bottom - 6], [r.right - 6, r.bottom - 6]];
  return { top: r.top, bottom: r.bottom, phone: phone.height, covered: pts.filter(([x, y]) => document.elementFromPoint(x, y) !== ta).length,
    words: [...document.querySelectorAll('.next')].length, focused: document.activeElement === ta };
});
if (!box.focused) fails.push('the box is not the one being typed in');
if (box.bottom > H - KB || box.top < 0) fails.push(`the box is not wholly above the keyboard (${Math.round(box.top)}–${Math.round(box.bottom)}, keyboard from ${H - KB})`);
if (box.covered) fails.push(`something is drawn over the box at ${box.covered} of 5 points`);
if (box.words) fails.push('the next job\'s words are still shown under the box');
if (Math.abs(box.phone - (H - KB)) > 1) fails.push(`the phone frame is ${box.phone}px, not the ${H - KB}px above the keyboard`);
await page.keyboard.press('Enter'); await page.clock.runFor(300);
await page.evaluate(() => { document.activeElement?.blur(); window.__keyboard(0); }); await page.clock.runFor(800);
const after = await page.evaluate(() => ({ phone: document.querySelector('.phone').getBoundingClientRect().height, y: scrollY, vvh: document.documentElement.style.getPropertyValue('--vvh') }));
if (Math.abs(after.phone - H) > 1 || after.y || after.vvh) fails.push(`the page is not back in place after the keyboard (${JSON.stringify(after)})`);

/* what was put in with "+ Add" is on today (D-117) */
if (!(await page.locator('.rows button.row', { hasText: 'milk' }).count())) fails.push('"milk", put in with + Add, is not on Today');

/* a tap on Test opens its set-up, Begin starts its delve (D-124); finished and said done, it is done (Dan, D-117) */
await page.locator('.rows button.row', { hasText: 'Test' }).first().click(); await page.clock.runFor(1500);
if (await page.locator('.rs').count()) { await page.getByRole('button', { name: 'Begin', exact: true }).click(); await page.clock.runFor(1500); }
if (!(await page.locator('.dv').count())) fails.push('a tap on Test did not start its delve');
else {
  /* five minutes on: the clock jumps, as in delve-loop, rather than running every frame of the delve (WebKit's page
     crashed stepping 18,000 frames at once) */
  { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + 5 * 60_000); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); }
  await page.getByRole('button', { name: 'Finish here', exact: true }).first().click(); await page.clock.runFor(1500);
  const yes = page.getByRole('button', { name: 'Done', exact: true }).first();
  if (!(await yes.count())) fails.push('no "Is it done?" after finishing Test');
  else {
    const r = await yes.boundingBox();
    await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1500);
    await page.getByRole('button', { name: 'Back to today', exact: true }).first().click().catch(() => {}); await page.clock.runFor(1500);
    const row = page.locator('.rows button.row', { hasText: 'Test' }).first();
    if (!(await row.count()) || !/done/i.test(await row.innerText())) fails.push('Test, delved on and said done, is not done on Today');
  }
}
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`capture-done (${W}x${H}): ok`);
