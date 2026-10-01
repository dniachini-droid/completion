// Hands-on review: the word screen: what a finger hits where the marks sit before the rod is set; the Daybook loop on back. Review only.
import { readFileSync } from 'node:fs';
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const save = readFileSync(new URL('../flows/saves/word.json', import.meta.url), 'utf8');
const H = await open({ w: +w, h: +h, tag: 'word2', save, at: '2026-10-06T11:05:00+01:00' });
const { page } = H;
for (let k = 0; k < 4 && !(await H.btn('Later').count()); k++) { const way = (await H.btn('See where you are').count()) ? H.btn('See where you are') : page.locator('button.btn').first(); await H.tap(way, 'on'); }
await page.waitForTimeout(1500);
const hit = await page.evaluate(() => [...document.querySelectorAll('button.key, button.go, .after-row button')].map(b => { const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); const s = getComputedStyle(b); return `${b.className.split(' ')[0]} '${b.innerText.trim().replace(/\s+/g,' ')}' op=${s.opacity} pe=${s.pointerEvents} vis=${s.visibility} → hit ${e?.closest('button')?.className.split(' ')[0] ?? e?.tagName}`; }));
H.say(hit.join('\n'));
/* the loop by the buttons: Later → Daybook → its arrow → ? */
await H.btn('Later').click(); await page.clock.runFor(1500); H.say('after Later: ' + await H.screen());
await H.shot('daybook-after-later');
for (let i = 0; i < 5 && !(await H.onToday()); i++) { await H.tap(page.locator('button.home'), 'arrow'); await page.waitForTimeout(800); H.say(`arrow ${i}: ${await H.screen()} later=${await H.btn('Later').count()}`); if (await H.btn('Later').count()) { await H.btn('Later').click(); await page.clock.runFor(1500); H.say('  pressed Later: ' + await H.screen()); } }
await H.close();
