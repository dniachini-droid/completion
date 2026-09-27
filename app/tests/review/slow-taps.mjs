// The half-second guard (D-120) on a slow CPU: Chrome's CPU throttling (RATE× slower) stands in for a busy phone. A
// Begin double tap (30 ms) and a Finish here triple tap (40 ms), each tried N times; the guard compares performance.now()
// when the tap is handled, so a second tap queued behind drawing the delve screen may count as a new decision.
// Usage (from app/): RATE=4 N=5 node tests/review/slow-taps.mjs [w h]
import * as L from './lib.mjs';
import { launch } from '../flows/browser.mjs';
const [,, w = '390', h = '844'] = process.argv;
const RATE = +(process.env.RATE ?? 4), N = +(process.env.N ?? 5);
const browser = await launch();
let beginBad = 0, finishBad = 0, errors = 0;
for (let i = 0; i < N; i++) {
  const R = await L.start({ w: +w, h: +h, browser, tag: `slow ${RATE}x` });
  await L.addToday(R, 'Alpha');
  const cdp = await R.context.newCDPSession(R.page);
  await L.tap(R, L.row(R, 'Alpha').first(), 'Alpha');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await L.multiTap(R, 'Begin', 2, 30, 'Begin ×2');
  await R.page.waitForTimeout(1500);
  const f = await L.facts(R);
  if (f.some(x => x.type === 'delveEnded')) beginBad++;
  if (!f.some(x => x.type === 'delveEnded')) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await L.ff(R, 3 * 60_000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
    await L.multiTap(R, 'Finish here', 3, 40, 'Finish here ×3');
    await R.page.waitForTimeout(1500);
    /* past "Is it done?": answered Not yet or Done by the extra taps */
    if (!(await L.has(R, 'Not yet')) || !(await L.has(R, 'Done'))) finishBad++;
  }
  const x = await L.finish(R, `slow-taps run ${i + 1}`); errors += x.errors;
}
await browser.close();
console.log(`slow-taps ${RATE}x (${w}x${h}): Begin ×2 ended the delve at once in ${beginBad}/${N}; Finish here ×3 went past "Is it done?" in ${finishBad}/${N - beginBad}`);
process.exit(errors ? 2 : beginBad || finishBad ? 1 : 0);
