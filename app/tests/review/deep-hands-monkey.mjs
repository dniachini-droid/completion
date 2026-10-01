// Hands-on review: an impatient thumb: random taps on whatever is on screen (with typing into boxes, back swipes, time
// passing), watching for page errors, "Something went wrong", sideways scroll, and screens with no way out. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '360', h = '780', seed0 = '7', steps = '250', saveName = ''] = process.argv;
import { readFileSync } from 'node:fs';
const save = saveName ? readFileSync(new URL(`../flows/saves/${saveName}.json`, import.meta.url), 'utf8') : null;
const H = await open({ w: +w, h: +h, tag: `monkey${seed0}`, save, at: saveName === 'keys' ? '2026-10-08T09:00:00+01:00' : saveName === 'word' ? '2026-10-06T11:05:00+01:00' : '2026-10-01T09:00:00+01:00' });
const { page } = H;
let seed = +seed0; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const WORDS = ['Bank', 'Write the report for Tuesday’s meeting with the whole regional team 📊', 'x', 'Course', 'שלום', '   spaces   '];
const trail = [];
let stuck = 0;
for (let i = 0; i < +steps; i++) {
  const state = await H.screen().catch(() => 'gone');
  const errs = H.errs.length;
  const cands = await page.evaluate(() => [...document.querySelectorAll('.phone button:not([disabled]), .phone input:not([disabled]), .phone [role=slider]')].filter(b => { const r = b.getBoundingClientRect(); const s = getComputedStyle(b); return r.width > 4 && r.height > 4 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && s.visibility !== 'hidden' && +s.opacity > 0.1 && !b.closest('.sr') && !b.classList.contains('sr'); }).map((b, k) => { const r = b.getBoundingClientRect(); return { k, tag: b.tagName, label: (b.getAttribute('aria-label') || b.innerText || b.placeholder || '').replace(/\s+/g, ' ').slice(0, 30), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  const r = rnd();
  let did;
  if (!cands.length) { stuck++; did = 'NOTHING TO TAP'; await page.evaluate(() => history.back()); }
  else if (r < 0.06 && !(await H.onToday())) { did = 'BACK'; await page.evaluate(() => history.back()); }
  else if (r < 0.09) { const ms = [60e3, 5 * 60e3, 30 * 60e3, 3 * 3600e3][Math.floor(rnd() * 4)]; did = `TIME +${ms / 60e3}m`; await page.clock.runFor(ms); }
  else {
    const c = cands[Math.floor(rnd() * cands.length)];
    if (c.tag === 'INPUT') { did = `TYPE in ${c.label}`; await page.touchscreen.tap(c.x, c.y); await page.keyboard.type(WORDS[Math.floor(rnd() * WORDS.length)]); if (rnd() < 0.6) await page.keyboard.press('Enter'); }
    else if (rnd() < 0.12) { did = `DOUBLE ${c.label}`; await page.touchscreen.tap(c.x, c.y); await page.waitForTimeout(60); await page.touchscreen.tap(c.x, c.y); }
    else if (rnd() < 0.06) { did = `HOLD ${c.label}`; await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.clock.runFor(700); await page.mouse.up(); }
    else { did = `tap ${c.label}`; await page.touchscreen.tap(c.x, c.y); }
  }
  await page.clock.runFor(700); await page.waitForTimeout(40);
  const now = await H.screen().catch(() => 'gone');
  trail.push(`${i}: [${state}] ${did}`);
  if (now === 'gone' || /h1=- \/ arrow=-/.test(now) && !(await page.locator('.phone button').count())) { H.say(`LEFT THE APP / BLANK at step ${i} after ${did} (from ${state})`); await page.goto('http://localhost:4183/'); for (let k = 0; k < 20 && !(await page.locator('.phone button').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); } }
  const oops = await page.locator('.oops').count();
  const side = await page.evaluate(() => scrollX || document.scrollingElement.scrollLeft || [...document.querySelectorAll('.ui, .ui .scroll, .ui .body')].some(e => e.scrollLeft > 0));
  if (oops || H.errs.length > errs || side) { H.say(`!! step ${i} ${oops ? 'OOPS ' : ''}${side ? 'SIDEWAYS ' : ''}${H.errs.slice(errs).join(' ; ')}`); H.say('   last steps: ' + trail.slice(-6).join(' | ')); await H.shot(`problem-${i}`); }
}
H.say(`done ${steps} steps, stuck ${stuck}, errors ${H.errs.length}`);
await H.close();
