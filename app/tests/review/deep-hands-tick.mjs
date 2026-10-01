// Hands-on review: ticking off (double taps on the chips), the step screen, Not today / Put back, Delete / Undo, the hold menu. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'tick' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete/.test(b)).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
await H.toToday();
await H.tap(H.btn('Order the cat’s medication: tick off'), 'tick cat');
await S('sheet');
/* double tap on 30 min */
const c = await H.btn('30 min').boundingBox();
await page.touchscreen.tap(c.x + 20, c.y + 20); await page.waitForTimeout(50); await page.touchscreen.tap(c.x + 20, c.y + 20);
await page.clock.runFor(1500); await page.waitForTimeout(3500);
await S('after-tick');
await page.waitForTimeout(3000); await page.clock.runFor(3000);
await S('after-tick-wait');
const f = await page.evaluate(() => JSON.parse(localStorage.getItem('save.v1') ?? '{}').facts?.filter(x => /jobDone|stepsGained|tick/i.test(x.type)).map(x => x.type + ':' + (x.minutes ?? '')));
H.say('FACTS after double tick: ' + JSON.stringify(f));
for (let i = 0; i < 5 && !(await H.onToday()); i++) { const b = (await page.locator('button.btn').count()) ? page.locator('button.btn').first() : page.locator('button.home'); H.say(' press ' + (await b.innerText().catch(() => '?')).replace(/\s+/g, ' ')); await H.tap(b, 'on'); await page.waitForTimeout(1500); await S('on' + i); }
H.say('TODAY: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
await H.close();
