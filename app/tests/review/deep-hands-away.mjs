// Hands-on review: a delve begun, the phone put away, and opened again later: are its minutes counted? Review only.
import { open } from './deep-hands-lib.mjs';
const [,, startAt, backAt, mins = '90', job = 'Gym'] = process.argv;
const H = await open({ w: 390, h: 844, tag: 'away', at: startAt });
const { page } = H;
const hide = async on => { await page.evaluate(on => { Object.defineProperty(document, 'hidden', { get: () => on, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, on); await page.clock.runFor(300); };
await H.toToday();
const road = async () => (await H.text()).split('\n').filter(l => /side chamber|next place/.test(l)).join(' ');
H.say('road before: ' + await road());
for (let k = 0; k < 3 && !(await page.locator('.rs').count()); k++) { await H.tap(page.locator('.rows button.row', { hasText: job }).first(), job); await page.waitForTimeout(500); }
H.say('set-up: ' + await H.screen());
await H.tap(H.btn(`${mins} minutes`), mins);
while (!(await H.btn('One delve fewer').isDisabled())) await H.tap(H.btn('One delve fewer'), 'fewer', 300);
await H.tap('Begin');
H.say('running: ' + await H.screen());
if (process.env.HIDE) await hide(true); await page.clock.setSystemTime(new Date(backAt)); await page.clock.runFor(500); if (process.env.HIDE) await hide(false); await page.clock.runFor(3000); await page.waitForTimeout(2500); await page.clock.runFor(3000);
H.say('back: ' + await H.screen());
H.say('end says: ' + (await H.text()).split('\n').filter(l => l.length < 90).slice(0, 14).join(' | '));
await H.shot('end');
const facts = await page.evaluate(() => JSON.parse(localStorage.getItem('save.v1') ?? '{}').facts?.slice(-8).map(x => `${x.type}${x.minutes != null ? ':' + x.minutes : ''}${x.reason ? ':' + x.reason : ''}${x.day ? '@' + x.day : ''}`));
H.say('last facts: ' + facts.join(', '));
await H.toToday();
H.say('road after: ' + await road());
await H.close();
