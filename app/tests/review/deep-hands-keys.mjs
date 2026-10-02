// Hands-on review: Keys from the keys save: Today's link, the Map, Use a Key double-tapped, read again, back chains. Review only.
import { readFileSync } from 'node:fs';
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const save = readFileSync(new URL('../flows/saves/keys.json', import.meta.url), 'utf8');
const H = await open({ w: +w, h: +h, tag: 'keys', save, at: '2026-10-08T09:00:00+01:00' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete/.test(b)).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
const keysUsed = async () => page.evaluate(() => JSON.parse(localStorage.getItem('save.v1') ?? '{}').facts?.filter(x => /key/i.test(x.type)).map(x => x.type).join(','));
await S('first');
await H.toToday();
await S('today');
H.say('keys facts: ' + await keysUsed());
await H.tap(page.locator('.key-use button'), 'key link'); await S('map');
const use = page.getByRole('button', { name: /^Use a Key: / }).first();
const r = await use.boundingBox().catch(() => null);
if (r) { await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(80); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1500); }
await S('opened');
H.say('keys facts after double tap: ' + await keysUsed());
await page.evaluate(() => history.back()); await page.clock.runFor(1200); await S('back1');
await page.evaluate(() => history.back()); await page.clock.runFor(1200); await S('back2');
H.say('Keys line: ' + await page.locator('button.keys').innerText().catch(() => '-'));
await H.close();
