// Deep review (performance): each main screen moving, rested (17 s+ untouched) and touched again, in either engine
// (BROWSER=webkit for Safari's). Counts script animation frames, timer fires and running/endless animations per screen.
// Usage (from app/): node tests/review/deep-perf-idle.mjs http://localhost:4187/ [OUT.json]
import { writeFileSync } from 'node:fs';
import { launch, open } from './deep-perf-lib.mjs';
const [,, url, out] = process.argv;
const b = await launch();
const P = await open(b, url);
const { page } = P;
await page.goto(url);
if (!(await P.toToday())) { console.log('FAIL: no Today'); process.exit(1); }
const rows = [];
async function measure(name) {
  const t0 = Date.now();
  await page.waitForTimeout(3000);
  const moving = await P.reading(5);
  await page.waitForTimeout(Math.max(0, 18000 - (Date.now() - t0)));
  const rested = await P.reading(10);
  /* a touch somewhere harmless (the top corner of the frame): the world wakes */
  await page.evaluate(() => document.querySelector('.phone')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
  await page.waitForTimeout(500);
  const touched = await P.reading(4);
  const dom = await P.dom();
  const r = { screen: name, moving, rested, touched, dom };
  rows.push(r);
  console.log(`${name.padEnd(16)} moving rAF/s ${moving.raf} endless ${moving.endlessRunning} | rested rAF/s ${rested.raf} timers/s ${rested.timers} running ${rested.running} endless ${rested.endlessRunning} resting=${rested.resting} [${rested.names.join(',')}] | touched endless ${touched.endlessRunning} | nodes ${dom.nodes} paintings ${dom.paintings} canvases ${dom.canvases}`);
}
await measure('today');
for (const label of ['Week', 'Satchel', 'Map']) {
  if (!(await P.has(label))) { console.log('no', label); continue; }
  await P.tap(P.btn(label)); await measure(label.toLowerCase()); await P.home();
}
await P.tap(page.locator('.rows button.row:not(.done)').first());
if (await P.has('Begin')) await P.tap(P.btn('Begin'));
if (await page.locator('.dv').count()) {
  await measure('delve-running');
  await P.setNow((await P.now()) + 31 * 60_000); await page.waitForTimeout(1500);
  await measure('delve-end');
}
if (out) writeFileSync(out, JSON.stringify(rows, null, 1));
console.log('errors:', P.errors.length ? P.errors : 'none');
await b.close();
