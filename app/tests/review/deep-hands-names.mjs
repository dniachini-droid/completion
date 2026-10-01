// Hands-on review: odd job names through Add a job: long, emoji, RTL, empty, spaces only, duplicates; then every screen they reach. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'names' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
const LONG = 'Write to the council about the broken streetlight on Hollybush Lane before Friday ends';
const NAMES = [LONG, '🐈‍⬛🧾 Pay the vet 💸💸💸', 'שלח מייל לרואה החשבון על הדוחות', 'Supercalifragilisticexpialidociousantidisestablishmentarianism', '   ', '', 'pay the vet'];
await H.toToday();
for (const n of NAMES) {
  await H.tap(H.btn('Add a job'), 'Add a job');
  const inp = page.locator('input').first();
  await inp.click(); await page.keyboard.type(n); await page.clock.runFor(300);
  H.say(`typing "${n}": add disabled=${await page.getByRole('button', { name: /Add to today/i }).isDisabled().catch(() => '?')}`);
  await page.keyboard.press('Enter'); await page.clock.runFor(1000);
  H.say('  after Enter: ' + (await H.screen()));
  await H.toToday();
}
await S('today-names');
H.say('ROWS: ' + (await page.locator('.rows button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || '));
/* set-up for long name */
await H.tap(page.locator('.rows button.row', { hasText: 'Hollybush' }), 'long row'); await S('set-long');
await H.tap('Begin'); await S('delve-long');
await H.tap(page.locator('button.home'), 'arrow'); await S('today-delve-long');
await H.tap(H.btn('Back to the delve'), 'back to delve');
await page.clock.runFor(60000);
await H.tap('Finish here'); await S('finish-long');
await H.tap(H.btn('Done'), 'Done'); await page.clock.runFor(4000); await S('done-long');
await H.toToday();
await H.hold(page.locator('.rows button.row', { hasText: 'Supercali' }), 'super'); await S('menu-super');
await page.locator('.menu .cancel').click().catch(() => {}); await page.clock.runFor(500);
await H.hold(page.locator('.rows button.row', { hasText: 'שלח' }), 'rtl'); await S('menu-rtl');
await page.locator('.menu .cancel').click().catch(() => {}); await page.clock.runFor(500);
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Week' }), 'Week'); await S('week-names');
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Satchel' }), 'Satchel'); await S('satchel-names');
await H.toToday();
await H.tap(H.btn('Errand run'), 'Errand run'); await S('errand-names');
await H.close();
