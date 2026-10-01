// Deep review (words and accessibility), part 2: the screens part 1 could not reach by finger, by direct presses; the
// same checks (names, targets, small text, the accessibility snapshot), and a probe of the tick-off (rule 10).
// Review only. Usage (from app/): URL=http://localhost:4185/ node tests/review/deep-words2.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const { launch } = await import('../flows/browser.mjs');
const APP = process.env.URL ?? 'http://localhost:4185/';
const OUT = process.env.OUT ?? '/tmp/deep-words2';
mkdirSync(OUT, { recursive: true });
const report = []; const _push = report.push.bind(report); report.push = (...x) => { console.log(...x); return _push(...x); };
const b = await launch();

async function open({ at, save, w = 390, h = 844, reduce = false }) {
  const context = await b.newContext({ viewport: { width: w, height: h }, timezoneId: 'Europe/London', hasTouch: true, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', e => report.push(`pageerror: ${e.message.split('\n')[0]}`));
  if (save) await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('save.v1', s); sessionStorage.setItem('seeded', '1'); } } catch { } }, save);
  await page.clock.install({ time: new Date(at) });
  await page.goto(APP);
  for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
  return { context, page };
}
const settle = async (page, ms = 1300) => { await page.clock.runFor(ms); await page.waitForTimeout(120); };
const press = async (page, loc) => { const l = typeof loc === 'string' ? page.getByRole('button', { name: loc, exact: true }).first() : loc.first(); if (!(await l.count())) { report.push(`  (no ${typeof loc === 'string' ? loc : 'locator'})`); return false; } await l.dispatchEvent('click'); await settle(page); return true; };
const toToday = async page => { for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { const way = (await page.locator('button.home').count()) ? page.locator('button.home') : page.locator('button.btn'); if (!(await way.count())) break; await way.first().dispatchEvent('click'); await settle(page); } };

async function a11y(page, name) {
  await settle(page, 1500);
  const snap = await page.locator('body').ariaSnapshot().catch(e => 'ERR ' + e.message);
  writeFileSync(`${OUT}/${name}.aria.txt`, snap);
  if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/${name}.png` });
  const r = await page.evaluate(() => {
    const shown = el => { for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
    const cls = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const path = e => { const p = []; for (let x = e; x && x !== document.body && p.length < 3; x = x.parentElement) p.unshift(cls(x)); return p.join('>'); };
    const label = e => (e.getAttribute('aria-label') || e.innerText || e.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ');
    const out = { small: [], noname: [], tiny: [] };
    for (const e of document.querySelectorAll('button, [role=button], input, [role=slider], label.bed, label.clock-btn')) {
      if (!shown(e) || e.closest('[aria-hidden=true]')) continue;
      const bx = e.getBoundingClientRect(); if (bx.width < 2 || bx.height < 2) continue;
      const nm = label(e); if (!nm) out.noname.push(path(e));
      if (bx.width < 44 || bx.height < 44) out.small.push(`${path(e)} "${nm.slice(0, 30)}" ${Math.round(bx.width)}×${Math.round(bx.height)}`);
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const s = n.textContent.trim(); if (!s) continue;
      const el = n.parentElement; if (!el || !shown(el) || el.closest('.sr, .sr-live, svg')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize), k = path(el) + fs;
      if (fs < 14 && !seen.has(k)) { seen.add(k); out.tiny.push(`${path(el)} ${fs}px "${s.slice(0, 24)}"`); }
    }
    return out;
  });
  report.push(`\n## ${name}\n` + Object.entries(r).filter(([, x]) => x.length).map(([k, x]) => `- ${k}:\n  ` + [...new Set(x)].join('\n  ')).join('\n'));
}
const road = page => page.locator('section.where').getAttribute('aria-label').catch(() => '');

if (!process.env.PART || process.env.PART.includes('A'))
{
  const { context, page } = await open({ at: '2026-09-30T09:00:00+01:00' });
  await toToday(page);
  await press(page, page.locator('nav.foot').getByRole('button', { name: 'Week', exact: true })); await a11y(page, 'A1-week');
  await press(page, page.locator('.day button.row:not([disabled])')); await a11y(page, 'A2-week-row-open');
  await press(page, page.getByRole('button', { name: 'Next week', exact: true })); await a11y(page, 'A3-next-week');
  await press(page, page.getByRole('button', { name: 'The week after', exact: true })); await a11y(page, 'A4-week-after');
  await press(page, page.getByRole('button', { name: 'This week', exact: true }));
  report.push(`  arrow on "This week" reached from a later week: "${await page.locator('button.home span').first().textContent()}" (h1 "${await page.locator('h1').first().textContent()}")`);
  await press(page, page.getByRole('button', { name: 'Map', exact: true }));
  report.push(`  arrow on the Map reached from that This week: "${await page.locator('button.home span').first().textContent().catch(() => '')}"`);
  await a11y(page, 'A5-map');
  await toToday(page);
  await press(page, page.getByRole('button', { name: 'Settings', exact: true })); await a11y(page, 'A6-settings');
  await press(page, 'Trial controls'); await a11y(page, 'A7-proto');
  await toToday(page);
  /* the job editor of a recurring job, from its set-up */
  await press(page, page.locator('.rows button.row', { hasText: 'Course' })); await a11y(page, 'A8-runset-course');
  await press(page, 'Edit'); await a11y(page, 'A9-rhythms-course');
  await press(page, 'More…'); await a11y(page, 'A10-rhythms-more');
  await toToday(page);
  /* a natural end of a 25-minute delve on Course */
  await press(page, page.locator('.rows button.row', { hasText: 'Course' })); await press(page, 'Begin');
  for (let i = 0; i < 6; i++) { await page.clock.runFor(5 * 60_000); }
  await settle(page, 3000); await a11y(page, 'A11-delve-breather');
  await press(page, 'Finish here'); await settle(page, 4000); await a11y(page, 'A12-course-end');
  await toToday(page);
  /* a one-off: 10 minutes, Finish here, Not yet */
  const r0 = await road(page);
  await press(page, page.locator('.rows button.row', { hasText: 'Order' })); await press(page, 'Begin');
  await page.clock.runFor(10 * 60_000 + 500); await settle(page);
  await press(page, 'Finish here'); await a11y(page, 'A13-oneoff-ask');
  await press(page, 'Not yet'); await a11y(page, 'A14-oneoff-notyet');
  await toToday(page); await a11y(page, 'A15-today-after-notyet');
  report.push(`  road before: "${r0}"  after 10 min: "${await road(page)}"`);
  /* rule 10: a job typed and ticked off at once for 3 h */
  await press(page, 'Add a job');
  await page.locator('.satchel-add input').fill('Fold one sock');
  await press(page, 'Add to today'); await toToday(page);
  const r1 = await road(page);
  await press(page, page.getByRole('button', { name: 'Fold one sock: tick off', exact: true }));
  await press(page, '3 h'); await settle(page, 5000); await a11y(page, 'A16-tick-3h-return');
  await toToday(page); await settle(page, 2000);
  report.push(`  rule 10 probe: road before the 3 h tick: "${r1}", after: "${await road(page)}"`);
  /* and again: not done after all, then tick off again */
  await page.evaluate(() => 0);
  await context.close();
}
if (!process.env.PART || process.env.PART.includes('B'))
{
  const { context, page } = await open({ at: '2026-09-30T22:30:00+01:00', reduce: true });
  await toToday(page); await a11y(page, 'B1-tonight');
  await press(page, page.locator('.first-job')); await a11y(page, 'B2-tonight-choose');
  await press(page, 'Go to sleep'); await a11y(page, 'B3-night');
  await page.clock.setSystemTime(new Date('2026-10-01T08:00:00+01:00')); await settle(page, 2000);
  await page.reload(); await settle(page, 3000); await a11y(page, 'B4-morning');
  const anims = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.animationName ?? a.constructor.name) + ':' + (a.effect?.target?.className?.baseVal ?? a.effect?.target?.className ?? '')).slice(0, 20));
  report.push(`  B4 running animations with Reduce Motion on: ${JSON.stringify(anims)}`);
  await context.close();
}
if (!process.env.PART || process.env.PART.includes('C'))
{
  const save = readFileSync(new URL('../flows/saves/keys.json', import.meta.url), 'utf8');
  const { context, page } = await open({ at: '2026-10-08T09:00:00+01:00', save });
  await a11y(page, 'C0-first');
  await toToday(page); await a11y(page, 'C1-today');
  await press(page, page.locator('.key-use button')); await a11y(page, 'C2-map');
  await press(page, page.getByRole('button', { name: /^Use a Key: / })); await a11y(page, 'C3-opened');
  await toToday(page);
  if (await press(page, page.locator('.topbar').getByRole('button', { name: 'Records', exact: true }))) {
    await a11y(page, 'C4-records');
    await press(page, page.getByRole('button', { name: 'Symbols', exact: true })); await a11y(page, 'C5-symbols');
  }
  await toToday(page);
  if (await press(page, page.locator('nav.foot').getByRole('button', { name: 'Daybook', exact: true }))) await a11y(page, 'C6-daybook');
  await toToday(page);
  await press(page, page.locator('h1 button.here')); await a11y(page, 'C7-arrival-again');
  await context.close();
}
await b.close();
writeFileSync(`${OUT}/report.md`, report.join('\n'));
console.log(report.join('\n'));
