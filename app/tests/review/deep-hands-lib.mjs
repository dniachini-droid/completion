// Hands-on review helpers (deep review round). Review only: nothing here changes the app.
import { mkdirSync } from 'node:fs';
const { launch } = await import('../flows/browser.mjs');
export const ENG = process.env.BROWSER === 'webkit' ? 'webkit' : 'chromium';
export const OUT = '/tmp/claude-hands';
mkdirSync(OUT, { recursive: true });
export async function open({ w = 390, h = 844, at = '2026-10-01T09:00:00+01:00', save = null, tag = 'x' } = {}) {
  const b = await launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, timezoneId: 'Europe/London', hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message.split('\n')[0]));
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text().slice(0, 200)); });
  if (save) await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('save.v1', s); sessionStorage.setItem('seeded', '1'); } } catch {} }, save);
  await page.clock.install({ time: new Date(at) });
  await page.goto('http://localhost:4183/');
  for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
  const H = { b, ctx, page, errs, w, h, tag, log: [], n: 0 };
  H.say = (...a) => { const s = a.join(' '); H.log.push(s); console.log(s); };
  H.tap = async (loc, what, settle = 1200) => {
    const l = typeof loc === 'string' ? page.getByRole('button', { name: loc, exact: true }) : loc;
    await l.first().scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
    const r = await l.first().boundingBox().catch(() => null);
    if (!r) { H.say(`!! no ${what ?? loc} to tap`); return false; }
    await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
    await page.clock.runFor(settle); await page.waitForTimeout(80);
    return true;
  };
  H.hold = async (loc, what) => {
    const l = typeof loc === 'string' ? page.getByRole('button', { name: loc, exact: true }) : loc;
    await l.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
    const r = await l.first().boundingBox().catch(() => null);
    if (!r) { H.say(`!! no ${what} to hold`); return false; }
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.clock.runFor(700); await page.waitForTimeout(300); await page.mouse.up(); await page.clock.runFor(600);
    return true;
  };
  H.btn = name => page.getByRole('button', { name, exact: true });
  H.has = async name => (await H.btn(name).count()) > 0;
  H.shot = async name => { await page.waitForTimeout(700); const f = `${OUT}/${tag}-${String(++H.n).padStart(2, '0')}-${name}-${w}-${ENG}.png`; await page.screenshot({ path: f }); return f; };
  H.text = async () => (await page.locator('.phone').innerText().catch(() => '')).replace(/\n{2,}/g, '\n');
  H.buttons = async () => page.evaluate(() => [...document.querySelectorAll('.phone button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 1 && !b.closest('.sr') && !b.classList.contains('sr'); }).map(b => { const r = b.getBoundingClientRect(); return `${(b.getAttribute('aria-label') || b.innerText).replace(/\s+/g, ' ').slice(0, 40)} [${b.className.split(' ')[0]}${b.disabled ? ' disabled' : ''} y${Math.round(r.top)}-${Math.round(r.bottom)} x${Math.round(r.left)}-${Math.round(r.right)}]`; }));
  H.onToday = async () => (await page.locator('nav.foot').count()) > 0;
  H.toToday = async () => { for (let k = 0; k < 8 && !(await H.onToday()); k++) { const way = (await page.locator('button.home').count()) ? page.locator('button.home') : page.locator('button.btn'); if (!(await H.tap(way, 'a way to Today'))) break; } return H.onToday(); };
  H.arrow = () => page.locator('button.home span').first().textContent().then(s => s?.trim()).catch(() => null);
  H.overflow = async () => page.evaluate(() => { const se = document.scrollingElement; const W = innerWidth; const bad = []; if (se.scrollWidth > se.clientWidth + 1) bad.push(`page ${se.scrollWidth} wide`); for (const e of document.querySelectorAll('.phone *')) { if (e.closest('svg') || e.closest('[data-pan="map"]') || e.closest('.swipe')) continue; const r = e.getBoundingClientRect(); const txt = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(BUTTON|INPUT|TEXTAREA)$/.test(e.tagName); if (txt && r.width > 2 && r.height > 2 && (r.right > W + 2 || r.left < -2) && getComputedStyle(e).visibility !== 'hidden') { const c = String(e.className?.baseVal ?? e.className).split(' ')[0]; bad.push(`${e.tagName.toLowerCase()}.${c} ${Math.round(r.left)}..${Math.round(r.right)}`); } } return [...new Set(bad)].slice(0, 12); });
  H.screen = async () => page.evaluate(() => { const h1 = document.querySelector('.ui h1, h1'); return (document.querySelector('.dv') ? 'delve' : document.querySelector('.rs') ? 'set' : document.querySelector('nav.foot') ? 'today' : 'other') + ' / h1=' + (h1?.textContent?.trim().slice(0, 30) ?? '-') + ' / arrow=' + (document.querySelector('button.home span')?.textContent?.trim() ?? '-'); });
  H.close = async () => { if (H.errs.length) H.say('ERRORS:\n' + H.errs.join('\n')); await b.close(); };
  return H;
}
