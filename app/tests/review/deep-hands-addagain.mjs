// Hands-on review: Add a job, Return, Add a job again: how often the second tap does nothing, by wait after Return. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, waitMs = '1200'] = process.argv;
const H = await open({ w: 390, h: 844, tag: 'addagain' });
const { page } = H;
await H.toToday();
let miss = [];
for (let i = 1; i <= 20; i++) {
  const b = await H.btn('Add a job').boundingBox();
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.clock.runFor(600); await page.waitForTimeout(100);
  if (!(await page.locator('input').count())) { miss.push(i); await page.clock.runFor(1000); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.clock.runFor(600); }
  if (!(await page.locator('input').count())) { miss.push(i + '!'); continue; }
  await page.locator('input').first().fill(`Thing ${i}`); await page.keyboard.press('Enter'); await page.clock.runFor(+waitMs); await page.waitForTimeout(100);
}
H.say(`wait ${waitMs}: missed taps at ${miss.join(',') || 'none'}`);
await H.close();
