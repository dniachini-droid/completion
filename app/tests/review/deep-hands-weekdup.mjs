// Hands-on review: the Week's + with a name already on the list: what happens, and what is said. Review only.
import { open } from './deep-hands-lib.mjs';
const H = await open({ w: 390, h: 844, tag: 'weekdup' });
const { page } = H;
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Week' }), 'Week');
const dayText = async d => (await page.locator('.phone').innerText()).split(/\n(?=THURSDAY|FRIDAY|SATURDAY|SUNDAY)/).find(s => s.startsWith(d))?.split('\n').filter(l => l.length > 2 && !/about|^\+$/.test(l)).join(' | ');
for (const [name, day] of [['Sort the post', 0], ['sort the post', 0], ['Order the cat’s medication', 1], ['Spanish lesson', 2]]) {
  await H.tap(page.locator('button.plus').nth(day), '+'); await page.locator('form input').first().fill(name); await page.keyboard.press('Enter'); await page.clock.runFor(1000);
  const said = (await H.text()).split('\n').filter(l => /already|is on|comes round/i.test(l)).join(' | ');
  H.say(`+ "${name}" on day ${day}: said "${said}"; THU: ${await dayText('THURSDAY')} ;; FRI: ${await dayText('FRIDAY')} ;; SAT: ${await dayText('SATURDAY')}`);
}
await H.close();
