// Hands-on review: a delve from Today, its set-up, double taps, pause, Finish here, Not yet, the note, back. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'delve' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
await H.toToday();
await H.tap(page.locator('.rows button.row', { hasText: 'Course' }), 'Course');
/* change to 5 minutes, 1 delve */
await H.tap(H.btn('5 minutes'), '5');
await H.tap(H.btn('One delve fewer'), 'fewer');
await S('set-5');
/* double tap Begin */
const r = await H.btn('Begin').boundingBox();
await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(60); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
await page.clock.runFor(1500);
await S('delve-start');
/* back to Today during the delve */
await H.tap(page.locator('button.home'), 'delve arrow');
await S('today-during');
H.say('TEXT: ' + (await H.text()).slice(0, 600).replace(/\n/g, ' | '));
/* back into the delve via the row */
const held = page.locator('.next button, .held button, button.btn').first();
await H.tap(page.locator('.rows button.row', { hasText: 'Course' }), 'Course row during delve');
await S('course-row-during');
await H.toToday();
/* other job's row during delve */
await H.tap(page.locator('.rows button.row', { hasText: 'Gym' }), 'Gym row during delve');
await S('gym-row-during');
await page.goBack(); await page.clock.runFor(1000);
await S('after-goBack');
await H.toToday();
/* return to delve: whatever control Today offers */
const toDelve = page.getByRole('button', { name: /delve|Back to/i });
H.say('delve-ish buttons: ' + (await toDelve.allTextContents()).join(' / '));
await page.clock.runFor(3 * 60 * 1000);
await S('today-3min');
await H.close();
