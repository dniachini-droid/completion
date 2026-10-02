// Hands-on review: days passing: Not yet then the morning, a night (last hour before bed), days away (welcome back), a delve left running over 04:00. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'days' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete/.test(b)).slice(0, 18).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
const hide = async on => { await page.evaluate(on => { Object.defineProperty(document, 'hidden', { get: () => on, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, on); await page.clock.runFor(300); };
const jump = async to => { await hide(true); await page.clock.setSystemTime(new Date(to)); await page.clock.runFor(500); await hide(false); await page.clock.runFor(2000); await page.waitForTimeout(500); };
await H.toToday();
await H.tap(page.locator('.rows button.row', { hasText: 'Order the cat' }), 'cat'); await H.tap(H.btn('10 minutes'), '10'); await H.tap('Begin');
await page.clock.runFor(4 * 60 * 1000); await H.tap('Finish here'); await H.tap(H.btn('Not yet'), 'Not yet'); await H.toToday();
/* night: 22:20 (bed 23:00) */
await jump('2026-10-01T22:20:00+01:00'); await S('night');
H.say('NIGHT: ' + (await H.text()).split('\n').filter(l => l.length < 70 && !/: (not today|delete|tick off)/.test(l)).join(' | '));
/* a delve started at 23:50, left running past 04:00 */
await H.tap(page.locator('.rows button.row, button.btn', { hasText: /Course|Gym/ }).first(), 'a row'); await S('night-set');
if (await page.locator('.rs').count()) { await H.tap(H.btn('90 minutes'), '90'); await H.tap('Begin'); }
await jump('2026-10-02T05:30:00+01:00'); await S('next-morning-after-running');
for (let i = 0; i < 5 && !(await H.onToday()); i++) { const b = (await page.locator('button.btn').count()) ? page.locator('button.btn').first() : page.locator('button.home'); H.say('press ' + (await b.innerText().catch(() => '?')).replace(/\s+/g, ' ')); await H.tap(b, 'b', 2000); await S('m' + i); }
H.say('MORNING TODAY: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
/* days away */
await jump('2026-10-07T10:00:00+01:00'); await S('away');
for (let i = 0; i < 6 && !(await H.onToday()); i++) { const b = (await page.locator('button.btn').count()) ? page.locator('button.btn').first() : page.locator('button.home'); H.say('press ' + (await b.innerText().catch(() => '?')).replace(/\s+/g, ' ')); await H.tap(b, 'b', 2000); await S('w' + i); }
H.say('AWAY TODAY: ' + (await H.text()).split('\n').filter(l => l.length < 70 && !/: (not today|delete|tick off)/.test(l)).join(' | '));
await H.close();
