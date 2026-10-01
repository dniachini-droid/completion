// Hands-on review: the Week: open a row, move it, the time picker, delete, the + box, Next week, "about" taps, back chains. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'week' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Week' }), 'Week');
await H.tap(page.locator('button.row', { hasText: 'Order the cat' }).first(), 'cat row'); await S('row-open');
H.say('open row buttons: ' + (await H.buttons()).filter(b => /y[2-9]\d\d/.test(b)).slice(0, 30).join(' / '));
await H.tap(page.getByRole('button', { name: 'Another day…' }), 'Another day'); await S('another-day');
await H.tap(page.getByRole('button', { name: 'Another day…' }), 'Another day close');
/* move to Sat */
const sat = page.locator('.seg.days button', { hasText: /^Sa/ }).first();
H.say('day buttons: ' + (await page.locator('.seg.days button').allInnerTexts()).join(','));
await H.tap(sat, 'Sat'); await S('moved');
H.say('THURSDAY ROWS NOW: ' + (await page.locator('.phone').innerText()).split('FRIDAY')[0].split('\n').slice(-12).join(' | '));
/* + on Thursday with a duplicate name */
await H.tap(page.locator('button.plus').first(), '+'); await page.locator('form input').first().fill('Course'); await page.keyboard.press('Enter'); await page.clock.runFor(800); await S('dup-course');
H.say('after dup: ' + (await page.locator('.phone').innerText()).split('FRIDAY')[0].split('\n').filter(l => /Course/.test(l)).join(' | '));
await H.tap(page.getByRole('button', { name: 'Next week' }), 'Next week'); await S('next-week');
await H.tap(page.getByRole('button', { name: 'The week after' }), 'The week after'); await S('week-after');
for (let i = 0; i < 4; i++) { H.say(`arrow ${i} says ${await H.arrow()}`); await H.tap(page.locator('button.home'), 'arrow'); if (await H.onToday()) { H.say('today after ' + (i + 1)); break; } }
await H.close();
