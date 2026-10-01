// Deep review (performance): memory and leaks across 200 screen changes (Today ⇄ Week, Satchel, Map, a delve's set-up).
// Chromium only (CDP heap and node counts); with BROWSER=webkit only the engine-neutral counters (timers, listeners,
// animations, DOM nodes) are read. Every 20 changes: garbage collected, then read.
// Usage: node tests/review/deep-perf-mem.mjs http://localhost:4187/ [changes=200] [save.json] [OUT.json]
import { writeFileSync } from 'node:fs';
import { launch, open, save as readSaveFile, lastAt } from './deep-perf-lib.mjs';
const [,, url, nArg = '200', savePath, out] = process.argv;
const N = +nArg;
const raw = savePath ? readSaveFile(savePath) : null;
const at = raw ? new Date(lastAt(raw) + 6 * 3600_000).toISOString() : '2026-09-30T09:00:00+01:00';
const b = await launch();
const P = await open(b, url, { save: raw, at, dpr: 1 });
const { page } = P;
const webkit = process.env.BROWSER === 'webkit';
const cdp = webkit ? null : await page.context().newCDPSession(page);
if (cdp) await cdp.send('Performance.enable');
await page.goto(url);
if (!(await P.toToday())) { console.log('FAIL: no Today'); process.exit(1); }
const read = async (k) => {
  let m = {};
  if (cdp) {
    await cdp.send('HeapProfiler.collectGarbage');
    m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  }
  const c = await P.counters(), a = await P.anims(), d = await P.dom();
  const all = await page.evaluate(() => document.getAnimations().length);
  return { changes: k, heapMB: m.JSHeapUsedSize ? +(m.JSHeapUsedSize / 1048576).toFixed(1) : null, nodes: m.Nodes ?? d.nodes, listeners: m.JSEventListeners ?? null,
    docs: m.Documents ?? null, frames: m.Frames ?? null, liveTimeouts: c.live.timeouts, liveIntervals: c.live.intervals, winDocListenersNet: c.addL - c.removeL,
    animations: all, endlessRunning: a.endlessRunning, imgs: d.imgs, longTasks: c.longTasks };
};
const rows = [await read(0)];
console.log(JSON.stringify(rows[0]));
const cycle = [
  async () => { await P.tap(P.btn('Week'), 400); },
  async () => { await P.tap(P.btn('Satchel'), 400); },
  async () => { await P.tap(P.btn('Map'), 400); },
  async () => { const r = page.locator('.rows button.row:not(.done)'); if (await r.count()) await P.tap(r, 400); },
];
let k = 0, i = 0, misses = 0;
const t0 = Date.now();
while (k < N) {
  try { await cycle[i++ % cycle.length](); } catch { misses++; }
  k++;
  await P.home(); k++;
  if (!(await page.locator('nav.foot').count())) { await P.toToday(); }
  if (k % 20 === 0) { const r = await read(k); rows.push(r); console.log(JSON.stringify(r)); }
}
console.log(`${N} changes in ${((Date.now() - t0) / 1000).toFixed(0)} s, ${misses} misses; errors: ${P.errors.length ? P.errors.join(' | ') : 'none'}`);
if (out) writeFileSync(out, JSON.stringify(rows, null, 1));
await b.close();
