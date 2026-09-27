// Dan's reports (2026-09-27, D-120): with a job under way, "+ Add"'s box sat behind the job's words above the keyboard;
// and the under-way job's Done did nothing. On the iPhone the keyboard covers the page (the visible part shrinks, the
// page does not), so the check stands one in: the visual viewport is made shorter while the page stays its size, as there.
// The box must be wholly above the keyboard with nothing over it; after it closes, the page is back in place and Done,
// tapped, marks the job done. Usage: node tests/flows/capture-done.mjs http://localhost:4173/ [width height]
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
/* a job added on today in the Week, then begun from Today: under way */
await page.getByRole('button', { name: /^Week$/i }).click(); await page.clock.runFor(1500);
await page.locator('button.plus').first().click(); await page.keyboard.type('Test'); await page.keyboard.press('Enter'); await page.clock.runFor(800);
await page.locator('.home').click(); await page.clock.runFor(1500);
await page.locator('.rows button.row', { hasText: 'Test' }).click(); await page.clock.runFor(1500);
if ((await page.locator('.next h2').first().textContent())?.trim() !== 'Test') fails.push('Test is not under way');

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

/* Done, tapped as a finger would, where it is drawn */
const done = page.locator('.next button.btn');
const r = await done.boundingBox();
if (!r) fails.push('no Done under way');
else {
  const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('button')?.textContent?.trim(), [r.x + r.width / 2, r.y + r.height / 2]);
  if (!/done/i.test(hit ?? '')) fails.push(`a tap on Done lands on ${hit ?? 'nothing'}`);
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1500);
  if (!(await page.locator('.route').count())) fails.push('Done did nothing: no step shown');
}
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`capture-done (${W}x${H}): ok`);
