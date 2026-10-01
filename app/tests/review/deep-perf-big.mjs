// Deep review (performance): the app in the browser on saves of growing length (Chromium, CDP). For each save: time to
// the first drawn screen and to Today, long tasks, JS heap; the cost of a screen change (Today → Week → Today) and of a
// tap that writes a fact (a Satchel line added); a delve's processor time a second once rested.
// Usage: node tests/review/deep-perf-big.mjs http://localhost:4187/ <saves dir> [OUT.json]
import { writeFileSync, existsSync } from 'node:fs';
import { launch, open, save as readSaveFile, lastAt } from './deep-perf-lib.mjs';
const [,, url, dir, out] = process.argv;
const b = await launch();
const rows = [];
for (const w of [0, 4, 26, 52, 104]) {
  const path = `${dir}/save-${w}w.json`;
  const raw = w && existsSync(path) ? readSaveFile(path) : null;
  if (w && !raw) continue;
  const at = raw ? (() => { const d = new Date(lastAt(raw) + 12 * 3600_000); return `${d.toISOString().slice(0, 10)}T09:00:00+01:00`; })() : '2026-09-30T09:00:00+01:00';
  const P = await open(b, url, { save: raw, at, dpr: 3 });
  const { page } = P;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const g0 = Date.now();
  await page.goto(url);
  await page.waitForFunction(() => window.__c.first !== null, null, { timeout: 60000 });
  const firstMs = Math.round(await page.evaluate(() => window.__c.first));
  const ok = await P.toToday();
  const todayMs = Date.now() - g0;
  const lt = await page.evaluate(() => window.__c.longTasks);
  /* a screen change, timed in the page: click to the frame after */
  const change = async (sel) => page.evaluate(async (sel) => {
    const el = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === sel) ?? document.querySelector(sel);
    if (!el) return null;
    const t = performance.now(); el.click();
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
    return Math.round(performance.now() - t);
  }, sel);
  const times = { week: [], back: [] };
  for (let i = 0; i < 3; i++) {
    times.week.push(await change('Week')); await page.waitForTimeout(600);
    times.back.push(await change('button.home')); await page.waitForTimeout(600);
    await P.home();
  }
  /* a tap that writes a fact: a Satchel line */
  let add = null;
  if (await P.has('Satchel')) {
    await P.tap(P.btn('Satchel'));
    const box = page.locator('#satchel-box');
    if (await box.count()) {
      await box.fill('perf line');
      add = await page.evaluate(async () => {
        const el = document.querySelector('#satchel-box');
        const t = performance.now();
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        el.form?.requestSubmit?.();
        await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
        return Math.round(performance.now() - t);
      });
    }
    await P.home();
  }
  const facts = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('save.v1')).facts.length; } catch { return null; } });
  /* a delve, rested: processor time a second */
  let delve = null;
  const row = page.locator('.rows button.row:not(.done)');
  if (await row.count()) {
    await P.tap(row);
    if (await P.has('Begin')) await P.tap(P.btn('Begin'));
    if (await page.locator('.dv').count()) {
      await page.waitForTimeout(17000);
      const a = await metrics(); await page.waitForTimeout(10000); const z = await metrics();
      delve = { taskMsPerS: +((z.TaskDuration - a.TaskDuration) * 100).toFixed(1), scriptMsPerS: +((z.ScriptDuration - a.ScriptDuration) * 100).toFixed(1) };
    }
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const m = await metrics();
  const r = { weeks: w, facts, ok, firstMs, todayMs, longTasks: lt.length, longestTaskMs: Math.max(0, ...lt.map(x => x[1])), longTaskMs: lt.reduce((s, x) => s + x[1], 0),
    weekMs: times.week, backMs: times.back, satchelAddMs: add, delve, heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), errors: P.errors.length };
  rows.push(r);
  console.log(JSON.stringify(r));
  await page.close();
}
if (out) writeFileSync(out, JSON.stringify(rows, null, 1));
await b.close();
