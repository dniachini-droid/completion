// Deep review (performance): compositor frames, main-thread frames, rAF, timers and processor time per screen, moving
// and rested, on a played save (Chromium, CDP trace, as tests/flows/idle.mjs, but loading a save so the Map has walked
// routes and Today a real history). Also counts SMIL animations (<animate*>), which getAnimations() and rest.ts never see.
// Usage: node tests/review/deep-perf-frames.mjs http://localhost:4187/ save.json [OUT.json]
import { writeFileSync } from 'node:fs';
import { launch, open, save as readSaveFile, lastAt } from './deep-perf-lib.mjs';
const [,, url, savePath, out] = process.argv;
const raw = savePath ? readSaveFile(savePath) : null;
/* the next morning after the save's last moment, 09:00 */
const at = raw ? (() => { const d = new Date(lastAt(raw) + 12 * 3600_000); return `${d.toISOString().slice(0, 10)}T09:00:00+01:00`; })() : '2026-09-30T09:00:00+01:00';
const b = await launch();
const P = await open(b, url, { save: raw, at });
const { page } = P;
const cdp = await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
async function reading(span) {
  const events = [];
  const collect = d => events.push(...d.value);
  cdp.on('Tracing.dataCollected', collect);
  const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,cc,benchmark', transferMode: 'ReportEvents' });
  const a = await metrics();
  await page.waitForTimeout(span * 1000);
  const z = await metrics();
  await cdp.send('Tracing.end'); await done;
  cdp.off('Tracing.dataCollected', collect);
  const count = n => events.filter(e => e.name === n && e.ph !== 'e' && e.ph !== 'E').length / span;
  const smil = await page.evaluate(() => document.querySelectorAll('animate, animateMotion, animateTransform, set').length);
  const paints = events.filter(e => e.name === 'Paint').length / span;
  return { fps: +(events.filter(e => e.name === 'PipelineReporter' && (e.ph === 'b' || e.ph === 'B')).length / span).toFixed(1),
    main: +count('Commit').toFixed(1), paints: +paints.toFixed(1), raf: +count('FireAnimationFrame').toFixed(1), timers: +count('TimerFire').toFixed(1),
    taskMs: +((z.TaskDuration - a.TaskDuration) * 1000 / span).toFixed(1), smil, ...(await P.anims()) };
}
const rows = [];
async function measure(name) {
  const t0 = Date.now();
  await page.waitForTimeout(3000);
  const moving = await reading(6);
  await page.waitForTimeout(Math.max(0, 17500 - (Date.now() - t0)));
  const rested = await reading(10);
  rows.push({ screen: name, moving, rested, dom: await P.dom() });
  console.log(`${name.padEnd(14)} moving fps ${moving.fps} main ${moving.main} paints ${moving.paints} task ${moving.taskMs} | rested fps ${rested.fps} main ${rested.main} paints ${rested.paints} rAF ${rested.raf} timers ${rested.timers} task ${rested.taskMs}ms/s endlessRunning ${rested.endlessRunning} smil ${rested.smil} resting=${rested.resting}`);
}
const tStart = Date.now();
await page.goto(url);
if (!(await P.toToday())) { console.log('FAIL: no Today'); process.exit(1); }
const c = await P.counters();
console.log(`first screen drawn at ${Math.round(c.first)} ms; Today reached ${Date.now() - tStart} ms after goto (incl. the morning's screens); long tasks ${c.longTasks}`);
await measure('today');
for (const label of ['Week', 'Satchel', 'Map', 'Daybook']) {
  if (!(await P.has(label))) { console.log('no', label); continue; }
  await P.tap(P.btn(label)); await measure(label.toLowerCase()); await P.home();
}
if (out) writeFileSync(out, JSON.stringify(rows, null, 1));
console.log('errors:', P.errors.length ? P.errors : 'none');
await b.close();
