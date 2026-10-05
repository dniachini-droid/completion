// The acceptance walk (D-154): every move of a save through fourteen story weeks, shown by the built app at phone size.
// For each arrival (and each evening at camp): the arrival screen as it first plays, then Today with it looked at, then
// the Map opened on where Dan is; a picture of each and its words, for a fresh reviewer to read as a player. Pictures and
// words go to <out> (outside the repository: they hold story text, D-015). Usage (from app/, with a build served):
//   JOURNEY=<out> npx vitest run tests/review/journey.test.ts && node tests/flows/journey.mjs http://localhost:4173/ <out> [w h]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const { launch } = await import('./browser.mjs');
const [,, url, out, w = '390', h = '844'] = process.argv;
const J = JSON.parse(readFileSync(`${out}/journey.json`, 'utf8'));
const only = process.env.LIVES ? process.env.LIVES.split(',') : null;
mkdirSync(`${out}/shots`, { recursive: true });
const b = await launch();
const errors = [], log = [];
const words = async (page) => page.evaluate(() => (document.querySelector('.ui') ?? document.body).innerText.replace(/\n{2,}/g, '\n').trim());
async function open(save, at) {
  const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: 1 });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('save.v1', s); sessionStorage.setItem('seeded', '1'); } } catch { /* about:blank */ } }, save);
  await page.clock.install({ time: new Date(Date.parse(at) + 60_000) });
  await page.goto(url);
  for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home, .cut').count()); k++) { await page.waitForTimeout(150); await page.clock.runFor(250); }
  /* the screens' words fade in on the page's own (real) clock: give them time before the picture */
  await page.clock.runFor(6000); await page.waitForTimeout(3500);
  return page;
}
const tap = async (page, loc) => { const r = await loc.first().boundingBox().catch(() => null); if (!r) return false; await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(2500); await page.waitForTimeout(300); return true; };
for (const life of J.lives) {
  if (only && !only.includes(life.name)) continue;
  let k = 0;
  for (const cut of life.cuts) {
    const facts = life.facts.slice(0, cut), looked = new Set(facts.filter(f => f.type === 'seen' && f.what === 'arrival').map(f => f.ref));
    /* the arrival the app shows: the first not yet looked at */
    const arr = facts.find(f => f.type === 'arrived' && !looked.has(f.seq));
    if (!arr) continue;
    const at = facts[facts.length - 1].at, name = `${life.name}-${String(++k).padStart(3, '0')}`;
    const save = JSON.stringify({ version: J.version, content: J.content, facts });
    /* Today as the player sees it once this arrival is looked at (a later one in the same batch still waits its turn) */
    const last = facts[facts.length - 1], upTo = facts.filter(f => !(f.type === 'arrived' && f.seq > arr.seq && !looked.has(f.seq)));
    const seen = JSON.stringify({ version: J.version, content: J.content, facts: [...upTo, { seq: last.seq + 1, at, day: last.day, type: 'seen', what: 'arrival', ref: arr.seq }] });
    const entry = { life: life.name, n: k, id: arr.id, kind: arr.kind, how: arr.how ?? null, day: arr.day, between: life.between?.[life.cuts.indexOf(cut)] ?? [] };
    /* the arrival as it plays */
    let page = await open(save, at);
    await page.screenshot({ path: `${out}/shots/${name}-a.png` });
    entry.arrival = await words(page);
    await page.close();
    /* Today, and the Map opened on where Dan is */
    page = await open(seen, at);
    for (let g = 0; g < 6 && !(await page.locator('nav.foot').count()); g++) { const way = (await page.locator('button.home').count()) ? page.locator('button.home') : page.locator('button.btn'); if (!(await tap(page, way))) break; }
    await page.screenshot({ path: `${out}/shots/${name}-t.png` });
    entry.today = await words(page);
    if (await tap(page, page.locator('button.icon-link', { hasText: 'Map' }))) {
      await page.clock.runFor(3000); await page.waitForTimeout(400);
      await page.screenshot({ path: `${out}/shots/${name}-m.png` });
      entry.map = await words(page);
    }
    await page.close();
    log.push(entry);
    writeFileSync(`${out}/walk-${w}.json`, JSON.stringify(log, null, 1));
  }
}
await b.close();
writeFileSync(`${out}/walk-${w}.json`, JSON.stringify(log, null, 1));
console.log(`${log.length} moves captured at ${w}x${h}; ${errors.length} page errors`);
if (errors.length) { console.log([...new Set(errors)].slice(0, 10).join('\n')); process.exit(1); }
