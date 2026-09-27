// What each main screen costs the phone while it sits open and untouched (D-132, Dan: "my phone still gets warm when
// using the app … not even on a delve"). Real time, no fake clock: the phone's own frames, timers and animation
// callbacks are counted as they happen. The game's clock is moved (to the evening, to a delve's end) by shifting Date
// alone, so nothing else is faked. Usage (from app/, with a build served):
//   node tests/flows/idle.mjs http://localhost:4173/ [seconds per screen, default 20] [width height]
// CHECK=1: fails if a settled screen keeps drawing frames, calling animation frames or burning processor time above the
// thresholds below (the standing check in CI, so the heat can't creep back).
// Frames are the compositor's (any moving layer, even one the graphics chip moves alone, makes the phone draw the screen
// again); the browser here has no graphics chip, so the milliseconds compare builds, they are not the phone's.
const { launch } = await import('./browser.mjs');
const [,, url, secsArg = '20', w = '430', h = '932'] = process.argv;
const secs = +secsArg, check = !!process.env.CHECK;
/* a settled screen draws nothing; a running delve redraws its countdown and ring once a second (a frame or two for each
   change, and a little slack for the chime and the clock) */
const LIMITS = { still: { fps: 0.5, raf: 0.2, taskMs: 8 }, delve: { fps: 4, raf: 0.2, taskMs: 25 } };

const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 3, timezoneId: 'Europe/London' });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
/* the game's clock: Date shifted, everything else (timers, animation frames, performance.now) real */
await page.addInitScript(() => {
  const R = Date; let shift = 0;
  class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + shift); } static now() { return R.now() + shift; } }
  window.Date = D;
  window.__at = (ms) => { shift = ms - R.now(); };
});
const setNow = (ms) => page.evaluate(ms => window.__at(ms), ms);
const now = () => page.evaluate(() => Date.now());
const jump = async (ms) => { await setNow((await now()) + ms); await page.waitForTimeout(1200); };
const btn = (name) => page.getByRole('button', { name, exact: true });
const has = async (name) => (await btn(name).count()) > 0;
const tap = async (loc) => { await loc.first().click({ timeout: 8000 }); await page.waitForTimeout(700); };
const home = async () => {
  for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) {
    if (await has('Back to today')) await tap(btn('Back to today'));
    else if (await page.locator('.home').count()) await tap(page.locator('.home'));
    else break;
  }
};

const cdp = await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
const rows = [], fails = [];
/* one reading: frames, calls and processor time over `span` seconds, from now */
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
  return {
    fps: +(events.filter(e => e.name === 'PipelineReporter' && (e.ph === 'b' || e.ph === 'B')).length / span).toFixed(1),
    mainFps: +count('Commit').toFixed(1),
    raf: +count('FireAnimationFrame').toFixed(1),
    timers: +count('TimerFire').toFixed(1),
    taskMs: +((z.TaskDuration - a.TaskDuration) * 1000 / span).toFixed(1),
    scriptMs: +((z.ScriptDuration - a.ScriptDuration) * 1000 / span).toFixed(1),
    styles: +((z.RecalcStyleCount - a.RecalcStyleCount) / span).toFixed(1),
    layouts: +((z.LayoutCount - a.LayoutCount) / span).toFixed(1),
    running: await page.evaluate(() => document.getAnimations().filter(an => an.playState === 'running').length),
  };
}
const line = (name, r) => console.log(`${name.padEnd(24)} frames/s ${String(r.fps).padStart(5)}  main ${String(r.mainFps).padStart(5)}  rAF/s ${String(r.raf).padStart(5)}  timers/s ${String(r.timers).padStart(4)}  task ms/s ${String(r.taskMs).padStart(6)}  script ${String(r.scriptMs).padStart(5)}  style/s ${String(r.styles).padStart(5)}  layout/s ${String(r.layouts).padStart(5)}  running ${r.running}`);
/* A screen just opened (or touched) moves for REST_AFTER (rest.ts, 15 s), then rests. MOVING=1 also reads the moving
   part, from 3 s after the screen opened (its entrance done) for 10 s. The settled reading starts 17 s after it opened. */
const REST = 15;
async function measure(name, kind = 'still') {
  const opened = Date.now();
  if (process.env.MOVING) { await page.waitForTimeout(3000); const m = await reading(10); rows.push({ screen: name, phase: 'moving', ...m }); line(name + ' (moving)', m); }
  await page.waitForTimeout(Math.max(0, (REST + 2) * 1000 - (Date.now() - opened)));
  const r = await reading(secs);
  rows.push({ screen: name, phase: 'settled', ...r });
  line(name, r);
  const L = LIMITS[kind];
  if (check) {
    if (r.fps > L.fps) fails.push(`${name}: ${r.fps} frames a second while untouched (limit ${L.fps})`);
    if (r.raf > L.raf) fails.push(`${name}: ${r.raf} animation-frame calls a second (limit ${L.raf})`);
    if (r.taskMs > L.taskMs) fails.push(`${name}: ${r.taskMs} ms of work a second (limit ${L.taskMs})`);
  }
}

await page.goto(url);
await setNow(new Date('2026-09-30T09:00:00+01:00').getTime());
await page.reload();
for (let k = 0; k < 40 && !(await page.locator('nav.foot').count()); k++) {
  if (await page.locator('button.btn').count()) await page.locator('button.btn').first().click().catch(() => {});
  await page.waitForTimeout(500);
}
await measure('today-morning');
for (const [name, label] of [['week', 'Week'], ['satchel', 'Satchel'], ['daybook', 'Daybook'], ['map', 'Map']]) {
  if (!(await has(label))) { fails.push(`no ${label} on Today`); continue; }
  await tap(btn(label)); await measure(name); await home();
}

/* a delve running, then its end */
await tap(page.locator('.next button.btn'));
if (await has('Begin')) await tap(btn('Begin'));
if (!(await page.locator('.dv').count())) fails.push('no delve after Delve');
await measure('delve-running', 'delve');
await jump(31 * 60_000);
await measure('delve-end');
if (await has('Done')) await tap(btn('Done'));
await home();

/* the day done: every job of the day delved to its end */
for (let k = 0; k < 8 && (await page.locator('.next button.btn').count()); k++) {
  await tap(page.locator('.next button.btn'));
  if (await has('Begin')) { if (await has('60 minutes')) await tap(btn('60 minutes')); await tap(btn('Begin')); }
  await jump(75 * 60_000);
  if (await has('Done')) await tap(btn('Done'));
  await home();
}
const gold = await page.evaluate(() => document.body.className);
await measure(`today-done${gold.includes('s-done') ? '' : '?'}`);

/* the evening: Tonight on Today, then Go to sleep */
const eve = await page.evaluate(() => { const d = new Date(Date.now()); d.setHours(22, 30, 0, 0); return d.getTime(); });
await setNow(eve); await page.waitForTimeout(1500);
await home();
await measure('today-evening');
if (await has('Go to sleep')) { await tap(btn('Go to sleep')); await measure('goodnight'); }
else fails.push('no Go to sleep in the evening');

await b.close();
if (process.env.OUT) (await import('node:fs')).writeFileSync(process.env.OUT, JSON.stringify(rows, null, 1));
if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(check ? 1 : 0); }
console.log(`idle (${w}x${h}, ${secs} s a screen): ${check ? 'ok' : 'measured'}`);
