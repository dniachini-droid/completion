// Verification (review only), CODE #3: a new day reached with the app open resets the screen but not the back trail.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-11T19:00:00+01:00', from: 'save-w1-sun.json' });
await D.through(R, 'vw');
await D.home(R);
await L.tap(R, D.foot(R, 'Week'), 'Week');
await L.tap(R, R.page.getByRole('button', { name: 'Map', exact: true }).first(), 'Map');
console.log('before: screen', await L.screen(R), 'arrow:', await R.page.locator('button.home').first().innerText().catch(() => '-'));
await R.page.clock.setSystemTime(new Date('2026-10-12T09:00:00+01:00'));
await R.page.clock.runFor(3000); await R.page.waitForTimeout(300); await R.page.clock.runFor(1500);
const h = await R.page.locator('.ui h1, .ui h2').first().innerText().catch(() => '');
console.log('after 04:00: screen', await L.screen(R), '| heading:', h.slice(0, 30), '| arrow:', await R.page.locator('button.home').first().innerText().catch(() => '-'));
await R.page.locator('button.home').first().click().catch(() => {}); await R.page.clock.runFor(1500);
console.log('after the arrow: screen', await L.screen(R), '| arrow:', await R.page.locator('button.home').first().innerText().catch(() => '-'));
for (let k = 0; k < 4; k++) {
  if (!(await R.page.locator('button.home').count())) { console.log('no arrow: on', await L.screen(R)); break; }
  await R.page.locator('button.home').first().click().catch(() => {}); await R.page.clock.runFor(1500);
  const hh = await R.page.locator('.ui h1').first().innerText().catch(() => '');
  console.log('arrow again ->', await L.screen(R), '| h1:', hh.slice(0, 24), '| arrow now:', await R.page.locator('button.home').first().innerText().catch(() => '-'));
}
await D.done(R, 'vwake');
