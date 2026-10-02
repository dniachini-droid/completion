// Hands-on review: an errand run from Today: pick, set-up, strike in the delve, the end's "What got done?", back, Today's waiting line. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'errand' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete/.test(b)).slice(0, 20).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
await H.toToday();
for (const n of ['Buy stamps', 'Return the library books']) { await H.tap(H.btn('Add a job'), 'Add'); await page.locator('input').first().fill(n); await page.keyboard.press('Enter'); await page.clock.runFor(1500); }
await H.tap(H.btn('Errand run'), 'Errand run');
for (const n of ['Order the cat', 'Buy stamps', 'Return the library']) await H.tap(page.locator('.phone button', { hasText: n }), n, 400);
await S('picked');
await H.tap(H.btn('Start the run'), 'Start'); await H.tap(H.btn('15 minutes'), '15'); await H.tap('Begin'); await S('delve');
await H.tap(page.locator('.phone li button', { hasText: 'Buy stamps' }), 'strike stamps'); await S('struck');
/* leave to Today mid-run */
await H.tap(page.locator('button.home'), 'arrow'); await S('today-mid');
await H.tap(H.btn('Back to the delve'), 'back to delve');
await page.clock.runFor(15 * 60 * 1000 + 2000); await page.waitForTimeout(800); await S('end');
await page.evaluate(() => history.back()); await page.clock.runFor(1500); await S('end-back');
H.say('TODAY: ' + (await H.text()).split('\n').filter(l => l.length < 70 && !/: (not today|delete|tick off)/.test(l)).join(' | '));
/* try to start something while the question waits */
await H.tap(page.locator('.rows button.row', { hasText: 'Course' }), 'Course'); await S('course-while-waiting');
await H.tap(page.locator('.menu .cancel'), 'cancel');
const strike = H.btn('Strike them off');
if (await strike.count()) { await H.tap(strike, 'Strike them off'); await S('strike'); }
for (let i = 0; i < 8 && !(await H.onToday()); i++) { const b = (await page.locator('button.btn').count()) ? page.locator('button.btn').first() : page.locator('button.home'); H.say('press ' + (await b.innerText().catch(() => '?')).replace(/\s+/g, ' ')); await H.tap(b, 'b', 2000); await S('e' + i); }
H.say('TODAY: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Satchel' }), 'Satchel'); await S('satchel-after');
await H.close();
