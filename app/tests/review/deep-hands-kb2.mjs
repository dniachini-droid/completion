// Hands-on review: the keyboard (pretended, as deep-hands-kb.mjs) on Tonight's "Anything on your mind?" and the "Where did you stop?" box. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '360', h = '780'] = process.argv;
const KB = +(process.env.KB ?? 300);
const H = await open({ w: +w, h: +h, tag: 'kb2', at: '2026-10-01T22:20:00+01:00' });
const { page } = H;
const kbUp = async () => { await page.evaluate(v => { document.documentElement.style.setProperty('--vvh', v + 'px'); document.documentElement.classList.add('kb'); }, +h - KB); await page.clock.runFor(400); await page.waitForTimeout(300); };
const kbDown = async () => { await page.evaluate(() => { document.documentElement.style.removeProperty('--vvh'); document.documentElement.classList.remove('kb'); }); await page.clock.runFor(400); };
const check = async (name) => {
  const r = await page.evaluate(lim => { const a = document.activeElement; if (!a || !/INPUT|TEXTAREA/.test(a.tagName)) return 'no focused box'; const b = a.getBoundingClientRect(); const sib = a.parentElement.querySelector('button'); const s = sib?.getBoundingClientRect(); return `box ${Math.round(b.top)}-${Math.round(b.bottom)} (visible to ${lim}) ${b.bottom > lim || b.top < 0 ? 'COVERED/OFF' : 'ok'}${s ? `; its button ${sib.innerText.trim()} ${Math.round(s.top)}-${Math.round(s.bottom)}` : ''}`; }, +h - KB);
  H.say(`== ${name}: ${r}`);
  await page.screenshot({ path: `/tmp/claude-hands/kb2-${name}-${w}.png`, clip: { x: 0, y: 0, width: +w, height: +h - KB } });
};
await H.toToday();
const mind = page.locator('input[placeholder*="mind"], textarea').first();
H.say('mind box: ' + await mind.count());
await mind.scrollIntoViewIfNeeded().catch(() => {}); await mind.focus(); await kbUp(); await page.keyboard.type('pay the window cleaner'); await check('tonight'); await kbDown();
await page.keyboard.press('Escape');
/* Not yet's box */
await page.locator('input').first().blur().catch(() => {});
for (let k = 0; k < 3 && !(await page.locator('.rs').count()); k++) { await H.tap(page.locator('.rows button.row', { hasText: 'Order the cat' }).first(), 'cat'); }
await H.tap('Begin'); await page.clock.runFor(120000); await H.tap('Finish here'); await H.tap(H.btn('Not yet'), 'Not yet');
const stop = page.locator('input').first(); await stop.focus(); await kbUp(); await page.keyboard.type('the vet form'); await check('where-stopped'); await kbDown();
await H.close();
