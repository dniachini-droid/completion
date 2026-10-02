// Hands-on review: a one-off's delve runs out: "Is it done?"; the arrow away and the card on Today; a double tap on Not yet. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'isdone' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete|\[row/.test(b)).join('\n  ')); await H.shot(n); };
await H.toToday();
for (let k = 0; k < 3 && !(await page.locator('.rs').count()); k++) await H.tap(page.locator('.rows button.row', { hasText: 'Order the cat' }).first(), 'cat');
await H.tap(H.btn('5 minutes'), '5'); await H.tap('Begin');
await page.clock.runFor(5 * 60000 + 3000); await page.waitForTimeout(500); await S('is-it-done');
await H.tap(page.locator('button.home'), 'arrow'); await S('today-question');
H.say('TODAY: ' + (await H.text()).split('\n').filter(l => l.length < 80 && !/: (not today|delete|tick off)/.test(l)).slice(6, 16).join(' | '));
/* back to the question via whatever Today offers */
const q = page.locator('button.btn').first(); H.say('big button: ' + (await q.innerText()).replace(/\s+/g, ' ')); await H.tap(q, 'big'); await S('question-again');
const ny = H.btn('Not yet'); const r = await ny.boundingBox();
if (r) { await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(70); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1500); }
await S('after-double-notyet');
await H.close();
