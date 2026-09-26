// What each screen costs the phone while it sits still: repaints, rasterised area and script time a second, measured
// from the browser's own trace over a few seconds of real time (D-099, D-103). The browser here has no graphics chip,
// so the numbers compare before and after; they are not the phone's. Usage (from app/, with a build served):
//   PLAYWRIGHT=$(npm root -g)/playwright/index.mjs node tests/flows/cost.mjs http://localhost:4173/ [seconds]
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const [,, url, secs = '4'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, timezoneId: 'Europe/London' });
const tap = (text) => page.getByRole('button', { name: text, exact: true }).first().click({ timeout: 8000 });
const cdp = await page.context().newCDPSession(page);

async function measure(name) {
  await page.waitForTimeout(3000);   /* entrances settle */
  const events = [];
  cdp.on('Tracing.dataCollected', d => events.push(...d.value));
  const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
  await page.waitForTimeout(+secs * 1000);
  await cdp.send('Tracing.end'); await done;
  cdp.removeAllListeners('Tracing.dataCollected');
  const main = events.filter(e => e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask');
  const paints = events.filter(e => e.name === 'Paint');
  const area = paints.reduce((s, e) => { const c = e.args?.data?.clip; if (!c) return s; const w = Math.abs(c[2] - c[0]), h = Math.abs(c[5] - c[1]); return s + w * h; }, 0);
  const script = events.filter(e => ['FunctionCall', 'FireAnimationFrame', 'TimerFire'].includes(e.name)).reduce((s, e) => s + (e.dur ?? 0), 0);
  const frames = events.filter(e => e.name === 'FireAnimationFrame').length;
  const layout = events.filter(e => e.name === 'Layout').length;
  const style = events.filter(e => e.name === 'UpdateLayoutTree').length;
  const s = +secs;
  console.log(`${name.padEnd(12)} paints/s ${(paints.length / s).toFixed(1).padStart(6)}  painted px/s ${(area / s / 1e3).toFixed(0).padStart(6)}k  script ms/s ${(script / 1e3 / s).toFixed(1).padStart(5)}  rAF/s ${(frames / s).toFixed(0).padStart(3)}  style/s ${(style / s).toFixed(0).padStart(3)}  layout/s ${(layout / s).toFixed(0).padStart(3)}`);
}

await page.goto(url);
await page.waitForTimeout(2500);
await measure('today');
await tap('Map'); await measure('map');
await page.locator('button.home').first().click(); await page.waitForTimeout(1500);
await tap('Something else…'); await page.waitForTimeout(800);
await page.locator('.body button.row', { hasText: 'Course' }).first().click(); await measure('runset');
await tap('Begin'); await measure('delve');
await browser.close();
