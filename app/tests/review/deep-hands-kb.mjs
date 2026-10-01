// Hands-on review: the keyboard. Headless browsers have no on-screen keyboard; this pretends one as keyboard.ts sees it
// (the visible part 844 - 336 = ~460 px tall: --vvh and .kb), then checks the box being typed in and its button are above it. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const KB = +w <= 360 ? 300 : 336;
const H = await open({ w: +w, h: +h, tag: 'kb' });
const { page } = H;
const kbUp = async () => { await page.evaluate(v => { document.documentElement.style.setProperty('--vvh', v + 'px'); document.documentElement.classList.add('kb'); }, +h - KB); await page.clock.runFor(400); };
const kbDown = async () => { await page.evaluate(() => { document.documentElement.style.removeProperty('--vvh'); document.documentElement.classList.remove('kb'); }); await page.clock.runFor(400); };
const check = async (name) => {
  const r = await page.evaluate(lim => {
    const a = document.activeElement; if (!a || !/INPUT|TEXTAREA/.test(a.tagName)) return 'no focused box';
    const b = a.getBoundingClientRect();
    const form = a.closest('form') ?? a.parentElement;
    const btns = [...(form?.querySelectorAll('button') ?? [])].map(x => { const r = x.getBoundingClientRect(); return `${x.innerText.trim().slice(0, 20)}@${Math.round(r.top)}-${Math.round(r.bottom)}`; });
    return `box ${Math.round(b.top)}-${Math.round(b.bottom)} (visible to ${lim}) ${b.bottom > lim ? 'COVERED' : 'ok'}; buttons ${btns.join(', ')}`;
  }, +h - KB);
  H.say(`== ${name}: ${r}`);
  await page.screenshot({ path: `/tmp/claude-hands/kb-${name}-${w}.png`, clip: { x: 0, y: 0, width: +w, height: +h - KB } });
};
await H.toToday();
await H.tap(H.btn('Add a job'), 'Add a job'); await page.locator('input').first().focus(); await kbUp(); await page.keyboard.type('Bank'); await page.clock.runFor(300); await check('addjob');
await kbDown(); await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Satchel' }), 'Satchel'); await page.locator('input').first().focus(); await kbUp(); await page.keyboard.type('Ba'); await check('satchel'); await kbDown(); await H.toToday();
/* Edit from the job menu */
await H.hold(page.locator('.rows button.row', { hasText: 'Order the cat' }), 'cat'); await H.tap(page.locator('.menu').getByRole('button', { name: 'Edit' }), 'Edit');
H.say('edit screen: ' + await H.screen());
const inputs = page.locator('.phone input, .phone textarea');
H.say('edit inputs: ' + await inputs.count());
for (let i = 0; i < Math.min(4, await inputs.count()); i++) { await inputs.nth(i).focus(); await kbUp(); await check('edit-' + i); await kbDown(); }
await H.toToday();
/* park a thought in a delve */
await H.tap(page.locator('.rows button.row', { hasText: 'Course' }), 'Course'); await H.tap('Begin');
await H.tap(page.getByRole('button', { name: 'Park a thought' }), 'park'); await page.locator('.phone input, .phone textarea').first().focus(); await kbUp(); await page.keyboard.type('call mum'); await check('park'); await kbDown();
await H.tap(page.getByRole('button', { name: /^Cancel$|^Not now$/ }).first(), 'cancel park');
/* Finish here → done for recurring; use the week's + */
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Week' }), 'Week');
await H.tap(page.locator('button', { hasText: /^\+$/ }).nth(1), 'Friday +');
const wi = page.locator('.phone input').first();
if (await wi.count()) { await wi.focus(); await kbUp(); await page.keyboard.type('Dentist'); await check('week-plus'); await kbDown(); } else H.say('no input after Week +; ' + (await H.buttons()).slice(0, 8).join(' / '));
await H.close();
