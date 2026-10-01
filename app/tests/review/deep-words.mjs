// Deep review (words and accessibility): walks the main screens, and on each records the accessibility snapshot, the
// controls without a name, tap targets under 44 px, text under 14 px, images without alt, and the chrome's visible
// words. Review only: nothing here changes the app. Usage (from app/): URL=http://localhost:4185/ node tests/review/deep-words.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as L from './lib.mjs';
const OUT = process.env.OUT ?? '/tmp/deep-words';
mkdirSync(OUT, { recursive: true });
const report = [];

async function a11y(R, name) {
  const { page } = R;
  await page.clock.runFor(1500); await page.waitForTimeout(400);
  const snap = await page.locator('body').ariaSnapshot().catch(e => 'ERR ' + e.message);
  writeFileSync(`${OUT}/${name}.aria.txt`, snap);
  if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/${name}.png` });
  const r = await page.evaluate(() => {
    const shown = el => { for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
    const hidden = el => !!el.closest('[aria-hidden=true]');
    const cls = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const path = e => { const p = []; for (let x = e; x && x !== document.body && p.length < 3; x = x.parentElement) p.unshift(cls(x)); return p.join('>'); };
    const label = e => (e.getAttribute('aria-label') || (e.getAttribute('aria-labelledby') && document.getElementById(e.getAttribute('aria-labelledby'))?.textContent) || e.innerText || e.getAttribute('placeholder') || e.getAttribute('title') || '').trim().replace(/\s+/g, ' ');
    const out = { small: [], noname: [], tiny: [], img: [], words: [], hiddenFocusable: [] };
    for (const e of document.querySelectorAll('button, [role=button], a[href], input, select, textarea, [role=slider], [tabindex]')) {
      if (!shown(e)) continue;
      const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue;
      if (hidden(e)) { if (!e.disabled && e.tabIndex >= 0) out.hiddenFocusable.push(path(e)); continue; }
      const nm = label(e);
      if (!nm && e.type !== 'hidden') out.noname.push(path(e));
      if ((b.width < 44 || b.height < 44) && !e.closest('svg')) out.small.push(`${path(e)} "${nm.slice(0, 30)}" ${Math.round(b.width)}×${Math.round(b.height)}`);
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seenT = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const s = n.textContent.trim(); if (!s) continue;
      const el = n.parentElement; if (!el || !shown(el) || el.closest('.sr, .sr-live, svg')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      const k = path(el) + fs;
      if (fs < 14 && !seenT.has(k)) { seenT.add(k); out.tiny.push(`${path(el)} ${fs}px "${s.slice(0, 24)}"`); }
    }
    for (const i of document.querySelectorAll('img, svg, canvas')) {
      if (!shown(i) || hidden(i)) continue;
      if (i.tagName === 'IMG' && i.getAttribute('alt') === null) out.img.push(path(i));
      if (i.tagName.toLowerCase() === 'svg' && !i.closest('button, [role=button], [role=slider]') && !i.getAttribute('aria-label') && !i.getAttribute('role') && i.getBoundingClientRect().width > 30) out.img.push('svg unlabelled, not hidden: ' + path(i));
    }
    return out;
  });
  report.push(`\n## ${name}\n` + Object.entries(r).filter(([, x]) => x.length).map(([k, x]) => `- ${k}:\n  ` + [...new Set(x)].join('\n  ')).join('\n'));
}

const b = await (await import('../flows/browser.mjs')).launch();
const tap = (R, x, w) => L.tap(R, x, w);

/* 1. a fresh game, 09:00 */
{
  const R = await L.start({ w: 390, h: 844, at: '2026-09-30T09:00:00+01:00', browser: b });
  await a11y(R, '01-today');
  await tap(R, R.page.locator('button.keys'), 'keys'); await a11y(R, '02-today-keys-open');
  await tap(R, R.page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true })); await a11y(R, '03-satchel'); await L.toToday(R);
  await tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true })); await a11y(R, '04-week');
  await tap(R, 'Recurring jobs'); await a11y(R, '05-rhythms'); await L.toToday(R);
  await tap(R, R.page.getByRole('button', { name: 'Map', exact: true })); await a11y(R, '06-map'); await L.toToday(R);
  await tap(R, R.page.getByRole('button', { name: 'Settings', exact: true })); await a11y(R, '07-settings'); await L.toToday(R);
  await tap(R, R.page.getByRole('button', { name: /: tick off$/ }).first()); await a11y(R, '08-ticksheet');
  await tap(R, R.page.locator('.sheet').getByRole('button', { name: 'Cancel', exact: true }));
  /* the job menu: press and hold the first row */
  const row = R.page.locator('.rows button.row').first(); const bx = await row.boundingBox();
  if (bx) { await R.page.mouse.move(bx.x + 60, bx.y + bx.height / 2); await R.page.mouse.down(); await R.page.clock.runFor(900); await R.page.waitForTimeout(700); await R.page.mouse.up(); await R.page.clock.runFor(500); }
  await a11y(R, '09-jobmenu');
  await tap(R, R.page.locator('.menu').getByRole('button', { name: 'I can’t start', exact: true }), 'cant'); await a11y(R, '10-cant'); await L.toToday(R);
  /* set-up and delve */
  await tap(R, R.page.locator('.rows button.row').first()); await a11y(R, '11-runset');
  await tap(R, 'Begin'); await a11y(R, '12-delve');
  await tap(R, 'Pause'); await a11y(R, '13-paused');
  await tap(R, R.page.getByRole('button', { name: /^Carry on|Back to the delve$/ }).first());
  await L.ff(R, 6 * 60_000); await tap(R, 'Finish here'); await a11y(R, '14-delve-end-ask');
  await tap(R, 'Done'); await R.page.clock.runFor(5000); await a11y(R, '15-after-done');
  for (let k = 0; k < 3; k++) { if (await R.page.locator('button.btn').count()) { await tap(R, R.page.locator('button.btn').first()); await a11y(R, `16-next-${k}`); } }
  await L.toToday(R); await a11y(R, '17-today-after');
  await tap(R, 'Errand run').catch(() => {}); await a11y(R, '18-errands'); await L.toToday(R);
  /* evening */
  await L.toClock(R, 0, 22, 30); await L.toToday(R); await a11y(R, '19-tonight');
  await tap(R, 'Go to sleep'); await a11y(R, '20-night');
  await L.toClock(R, 1, 8, 0); await L.drawn(R); await a11y(R, '21-morning');
  await R.context.close();
}
/* 2. the saved game with Keys */
{
  const save = readFileSync(new URL('../flows/saves/keys.json', import.meta.url), 'utf8');
  const context = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Europe/London', hasTouch: true });
  const page = await context.newPage();
  await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('save.v1', s); sessionStorage.setItem('seeded', '1'); } } catch { } }, save);
  await page.clock.install({ time: new Date('2026-10-08T09:00:00+01:00') });
  await page.goto(L.URL);
  const R = { browser: b, context, page, errors: [], fails: [], notes: [], label: 'keys' };
  await L.drawn(R); await a11y(R, '30-keys-first');
  await L.toToday(R); await a11y(R, '31-keys-today');
  await tap(R, page.locator('.key-use button')); await a11y(R, '32-keys-map');
  await tap(R, page.getByRole('button', { name: /^Use a Key: / }).first()); await a11y(R, '33-opened');
  await L.toToday(R);
  if (await L.has(R, 'Records')) { await tap(R, 'Records'); await a11y(R, '34-records'); if (await L.has(R, 'Symbols')) { await tap(R, 'Symbols'); await a11y(R, '35-symbols'); } }
  await L.toToday(R);
  if (await L.has(R, 'Daybook')) { await tap(R, R.page.locator('.foot').getByRole('button', { name: 'Daybook', exact: true })); await a11y(R, '36-daybook'); }
  await L.toToday(R);
  await tap(R, page.locator('h1 button.here')); await a11y(R, '37-arrival-again');
  await context.close();
}
await b.close();
writeFileSync(`${OUT}/report.md`, report.join('\n'));
console.log(report.join('\n'));
