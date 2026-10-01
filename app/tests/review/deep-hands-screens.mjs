// Hands-on review: every screen one step from Today, pictured and checked for sideways overflow. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'screens' });
const { page } = H;
await H.toToday();
await H.shot('today');
const visits = [
  ['satchel', async () => H.tap(page.locator('nav.foot').getByRole('button', { name: 'Satchel' }), 'Satchel')],
  ['week', async () => H.tap(page.locator('nav.foot').getByRole('button', { name: 'Week' }), 'Week')],
  ['map', async () => H.tap(page.locator('.icon-link', { hasText: /map/i }), 'Map')],
  ['settings', async () => H.tap(page.getByRole('button', { name: 'Settings' }), 'Settings')],
  ['addjob', async () => H.tap(H.btn('Add a job'), 'Add a job')],
  ['errand', async () => H.tap(H.btn('Errand run'), 'Errand run')],
  ['set-course', async () => H.tap(page.locator('.rows button.row', { hasText: 'Course' }), 'Course row')],
  ['set-gym', async () => H.tap(page.locator('.rows button.row', { hasText: 'Gym' }), 'Gym row')],
  ['menu-cat', async () => H.hold(page.locator('.rows button.row', { hasText: 'Order the cat' }), 'cat row')],
  ['tick-course', async () => H.tap(H.btn('Course: tick off'), 'tick')],
  ['keys', async () => H.tap(page.locator('button.keys'), 'Keys')],
  ['ahead', async () => H.tap(page.locator('.ahead-text'), 'ahead text')],
  ['placename', async () => H.tap(page.locator('h1').first(), 'place name')],
];
for (const [name, go] of visits) {
  await H.toToday();
  await go();
  await page.clock.runFor(800);
  H.say(`== ${name}: ${await H.screen()}`);
  const o = await H.overflow(); if (o.length) H.say('  OVERFLOW', o.join(' | '));
  H.say('  ' + (await H.buttons()).join('\n  '));
  await H.shot(name);
  /* close any menu/sheet */
  if (await page.locator('.menu .cancel, .sheet .cancel').count()) await H.tap(page.locator('.menu .cancel, .sheet .cancel'), 'cancel');
  await page.keyboard.press('Escape').catch(() => {});
}
await H.close();
