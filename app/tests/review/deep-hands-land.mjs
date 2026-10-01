// Hands-on review: the phone turned sideways (844 × 390): Today, the set-up, the delve, the menu. Review only.
import { open } from './deep-hands-lib.mjs';
const H = await open({ w: 844, h: 390, tag: 'land' });
const { page } = H;
await H.toToday(); await H.shot('today');
H.say('today ' + (await H.overflow()).join(' | '));
await H.tap(page.locator('.rows button.row', { hasText: 'Course' }), 'Course'); await H.shot('set');
H.say('set: ' + (await H.buttons()).filter(b => /BEGIN|TODAY/.test(b)).join(' / '));
await H.tap('Begin'); await H.shot('delve');
H.say('delve: ' + (await H.buttons()).join(' / '));
/* rotate back mid-delve */
await page.setViewportSize({ width: 390, height: 844 }); await page.clock.runFor(1000); await H.shot('delve-portrait');
H.say('portrait: ' + (await H.overflow()).join(' | ') + ' scrollX=' + await page.evaluate(() => scrollX + '/' + document.scrollingElement.scrollLeft));
await H.close();
