// Hands-on review: 30 jobs added in a row; Today, the Week, the Satchel, the errand run with them. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'many' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
await H.toToday();
await H.tap(H.btn('Add a job'), 'Add a job');
const t0 = Date.now();
for (let i = 1; i <= 30; i++) {
  if (!(await page.locator('input').count())) await H.tap(H.btn('Add a job'), 'Add a job', 400);
  if (!(await page.locator('input').count())) { H.say('NO INPUT at ' + i + ': ' + await H.screen()); H.say((await H.buttons()).join('\n')); await S('noinput'); break; }
  const inp = page.locator('input').first();
  await inp.fill(`Job number ${i}`); await page.keyboard.press('Enter'); await page.clock.runFor(1200);
  
}
H.say('30 adds took ' + (Date.now() - t0) + ' ms');
await H.toToday();
H.say('ROWS ' + (await page.locator('.rows button.row').count()));
H.say('TODAY: ' + (await H.text()).split('\n').filter(l => l.length < 50).join(' | '));
await S('today-30');
/* scroll to bottom of Today */
await page.evaluate(() => { for (const e of document.querySelectorAll('.ui, .scroll, .body, .col')) e.scrollTop = 1e6; });
await page.mouse.wheel(0, 5000); await page.clock.runFor(500);
await S('today-30-bottom');
const tb = Date.now(); await H.tap(page.locator('.rows button.row', { hasText: 'Job number 30' }), 'row 30'); H.say('tap to set-up took ' + (Date.now() - tb) + 'ms; ' + (await H.screen()));
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Week' }), 'Week'); await S('week-30');
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Satchel' }), 'Satchel'); await S('satchel-30');
await H.toToday();
await H.tap(H.btn('Errand run'), 'Errand run');
for (let i = 1; i <= 12; i++) await H.tap(page.locator('button', { hasText: new RegExp(`^\\s*Job number ${i}\\s*$`) }), 'pick ' + i, 200);
await S('errand-12');
await H.tap(H.btn('Start the run'), 'Start the run'); await S('errand-set');
await H.tap('Begin'); await S('errand-delve');
await H.close();
