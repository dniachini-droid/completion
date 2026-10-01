// Hands-on review: the number in the ring at a one-off's Done after Finish here, after the count has settled. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, mins = '3', job = 'Order the cat'] = process.argv;
const H = await open({ w: 390, h: 844, tag: 'ring' });
const { page } = H;
await H.toToday();
for (let k = 0; k < 3 && !(await page.locator('.rs').count()); k++) await H.tap(page.locator('.rows button.row', { hasText: job }).first(), job);
await H.tap('Begin');
await H.tap(page.locator('button.home'), 'arrow'); await H.tap(H.btn('Back to the delve'), 'back');
await page.clock.runFor(+mins * 60000 + 5000);
await H.tap('Finish here'); await H.tap(H.btn('Done'), 'Done');
for (let i = 0; i < 6; i++) { await page.waitForTimeout(1000); await page.clock.runFor(1000); }
H.say('ring/lines: ' + (await H.text()).split('\n').filter(l => l.length < 60).slice(0, 12).join(' | '));
await H.shot('done');
const f = await page.evaluate(() => JSON.parse(localStorage.getItem('save.v1') ?? '{}').facts?.filter(x => /delveEnded|jobDone|stepsGained/.test(x.type)).map(x => x.type + ':' + x.minutes));
H.say('facts: ' + f.join(', '));
await H.close();
