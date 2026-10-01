// Hands-on review: the job menu: Waiting on…, Put on a day, I can't start, Delete and Undo, at a size; and the Satchel's slide. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '360', h = '780'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'menu' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => /item|cancel|wait|DayPick|day|cal|btn/.test(b) && !/tick off|\[row/.test(b)).slice(0, 26).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
const row = n => page.locator('.rows button.row', { hasText: n }).first();
await H.toToday();
await H.hold(row('Order the cat'), 'cat'); await H.tap(page.locator('.menu').getByRole('button', { name: 'Waiting on…' }), 'Waiting on'); await S('waiting');
await H.tap(page.locator('.menu .wait-soon'), 'until soon'); await S('after-wait');
H.say('ROWS: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
await H.hold(row('Course'), 'course'); await H.tap(page.locator('.menu').getByRole('button', { name: 'I can’t start' }), 'cant'); await S('cant');
await H.tap(page.getByRole('button', { name: 'Not now' }), 'Not now'); await S('after-cant');
await H.hold(row('Course'), 'course'); await H.tap(page.locator('.menu').getByRole('button', { name: 'Delete' }), 'Delete'); await S('deleted');
const undo = page.getByRole('button', { name: 'Undo' });
H.say('undo there: ' + await undo.count());
if (await undo.count()) { await H.tap(undo, 'Undo'); await S('undone'); }
H.say('ROWS: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
/* Not today by slide, then Put back */
const strip = page.locator('.swipe', { hasText: 'Gym' }).first(); const r = await strip.boundingBox();
await page.mouse.move(r.x + r.width - 30, r.y + r.height / 2); await page.mouse.down(); await page.mouse.move(r.x + r.width - 260, r.y + r.height / 2, { steps: 8 }); await page.mouse.up(); await page.clock.runFor(600);
await S('slid');
await H.tap(page.getByRole('button', { name: 'Gym, then the sauna: not today' }), 'not today');
await S('not-today');
H.say('ROWS: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
await H.close();
