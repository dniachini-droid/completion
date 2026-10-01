// Hands-on review: a fresh game opened late at night: what a row tap does. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, at = '2026-10-01T22:20:00+01:00'] = process.argv;
const H = await open({ w: 390, h: 844, tag: 'night', at });
const { page } = H;
await H.toToday();
await H.shot('today');
H.say((await H.buttons()).filter(b => !/tick off/.test(b)).join('\n'));
await H.tap(page.locator('.rows button.row', { hasText: 'Gym' }).first(), 'Gym');
H.say('after Gym tap: ' + await H.screen());
await H.shot('gymtap');
await H.close();
