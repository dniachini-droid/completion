// Hands-on review: the word to cut (from the word save): reach it, back swipe, Later, return, cut it by taps (guesses, rod, marks), arrival after. Review only.
import { readFileSync } from 'node:fs';
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const save = readFileSync(new URL('../flows/saves/word.json', import.meta.url), 'utf8');
const H = await open({ w: +w, h: +h, tag: 'word', save, at: '2026-10-06T11:05:00+01:00' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete/.test(b)).slice(0, 20).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
await S('first');
for (let k = 0; k < 4 && !(await H.btn('Later').count()); k++) { const way = (await H.btn('See where you are').count()) ? H.btn('See where you are') : page.locator('button.btn').first(); H.say('pressing ' + (await way.first().innerText()).replace(/\s+/g, ' ')); await H.tap(way, 'on'); await S('on' + k); }
/* the phone's back on the word */
await page.evaluate(() => history.back()); await page.clock.runFor(1500); await S('word-back');
await H.toToday(); await S('today');
const waits = H.btn('A word waits to be cut');
H.say('word line on Today: ' + await waits.count());
await H.tap(waits, 'word line'); await S('word-again');
/* cut it: guesses first, then the rod, then the marks */
for (let i = 0; i < 12; i++) {
  const g = page.locator('.ask button:not([disabled])').first();
  if (await g.count()) { H.say('guess: ' + (await g.getAttribute('aria-label') ?? '').slice(0, 30)); await H.tap(g, 'guess', 1500); const opt = page.locator('.ask button:not([disabled])'); H.say('  options now ' + await opt.count()); continue; }
  const rod = page.locator('button.rodbtn:not([disabled])');
  if (await rod.count()) { await H.tap(rod, 'rod', 2500); continue; }
  const key = page.locator('button.key:not([disabled])');
  if (await key.count()) { await H.tap(key, 'key', 2500); continue; }
  break;
}
await S('after-cut');
await page.clock.runFor(8000); await page.waitForTimeout(1500); await S('after-cut-wait');
await page.evaluate(() => history.back()); await page.clock.runFor(1500); await S('after-cut-back');
await H.close();
