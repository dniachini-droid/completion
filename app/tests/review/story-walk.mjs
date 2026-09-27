// The screens the story brings, walked hostilely (no story words are read or printed; screens by class, buttons by UI
// word or position): long runs until places are reached; on every screen reached, each visible button pressed in turn
// (the screen's state rebuilt by a reload of the same save when a press leaves it), the phone's back pressed repeatedly,
// the screen turned sideways and back, and the Records ⇄ Symbols tab flipped fast. Then night (Go to sleep ×2), the
// morning after, and a welcome back after four days away. Usage (from app/): node tests/review/story-walk.mjs [w h]
import * as L from './lib.mjs';
import { launch } from '../flows/browser.mjs';
const [,, w = '390', h = '844'] = process.argv;
const browser = await launch();
const R = await L.start({ w: +w, h: +h, at: '2026-09-30T08:30:00+01:00', browser, tag: 'story' });
const foot = name => R.page.locator('.foot').getByRole('button', { name, exact: true });
const cls = () => R.page.evaluate(() => [...document.querySelectorAll('.phone > *')].map(e => String(e.className?.baseVal ?? e.className).split(' ')[0]).filter(Boolean).slice(0, 5).join('|'));
const visited = new Map();

/* a long run on the next job: n delves of 60 minutes, run to its end */
async function longRun(n) {
  await L.toToday(R);
  await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…');
  await R.page.locator('form.new input').fill(`Run ${visited.size}`); await L.tap(R, R.page.locator('form.new button'), 'Delve on it');
  await L.tap(R, R.page.getByRole('button', { name: '60 minutes', exact: true }), '60');
  for (let i = 1; i < n; i++) await L.tap(R, R.page.getByRole('button', { name: 'One more delve', exact: true }), '+', 300);
  await L.tap(R, 'Begin');
  for (let i = 0; i < n; i++) { await L.ff(R, 61 * 60_000); if (await L.has(R, 'Start it now')) await L.tap(R, 'Start it now'); }
  await L.ff(R, 60_000);
}
/* every screen met on the way from a delve's end back to Today: audited, turned, backed out of, its buttons pressed */
async function follow(tag) {
  for (let step = 0; step < 14; step++) {
    const s = await L.screen(R), c = await cls();
    const key = s.startsWith('other') ? c : s;
    await L.audit(R, `${tag} ${key}`);
    if (!visited.has(key)) {
      visited.set(key, tag);
      /* turned sideways and back */
      await R.page.setViewportSize({ width: +h, height: +w }); await R.page.clock.runFor(500);
      await R.page.setViewportSize({ width: +w, height: +h }); await R.page.clock.runFor(500);
      await L.audit(R, `${tag} ${key} after turning`);
    }
    if (s === 'today') return;
    /* the main way on: Done / Not yet first, then the primary button */
    if (await L.has(R, 'Done')) { await L.tap(R, 'Done'); continue; }
    const primary = R.page.locator('.ui button.btn').last();
    if (await primary.count()) { await L.tap(R, primary, 'the main button'); continue; }
    if (await R.page.locator('button.home').count()) { await L.tap(R, R.page.locator('button.home'), 'arrow'); continue; }
    R.fails.push(`${tag}: STUCK on ${key} (no main button, no arrow)`); return;
  }
  R.fails.push(`${tag}: never got back to Today (${await L.screen(R)})`);
}

/* the look screens: every visible button, and history back ×3 */
async function lookAround(path, tag) {
  await L.toToday(R);
  for (const p of path) { if (typeof p === 'string') await L.tap(R, R.page.getByRole('button', { name: p, exact: true }).first(), p); else await L.tap(R, p, 'step'); }
  const here = await cls();
  await L.audit(R, `${tag}`);
  const n = await R.page.locator('.phone button').count();
  for (let i = 0; i < n; i++) {
    const b = R.page.locator('.phone button').nth(i);
    if (!(await b.isVisible().catch(() => false)) || await b.isDisabled().catch(() => true)) continue;
    const isHome = await b.evaluate(e => e.classList.contains('home'));
    if (isHome) continue;
    await L.tap(R, b, `${tag} button #${i}`, 900);
    await L.audit(R, `${tag} after button #${i}`);
    if ((await L.screen(R)) === 'OOPS') R.fails.push(`${tag} button #${i}: Something went wrong`);
    /* back to the screen: by the arrow, until the look screen is there again */
    if ((await cls()) !== here) { await R.page.goBack().catch(() => {}); await R.page.clock.runFor(900); }
    if ((await cls()) !== here) { await L.toToday(R); for (const p of path) { if (typeof p === 'string') await L.tap(R, R.page.getByRole('button', { name: p, exact: true }).first(), p); else await L.tap(R, p, 'step'); } }
  }
  for (let i = 0; i < 3; i++) { await R.page.goBack().catch(() => {}); await R.page.clock.runFor(700); }
  const s = await L.screen(R);
  if (s === 'blank') { R.notes.push(`${tag}: three backs left the page (browser only)`); await R.page.goForward(); await R.page.clock.runFor(1500); await L.drawn(R); }
}

try {
  /* day 1: three long runs, each to its end and on to Today */
  for (const [k, n] of [[1, 3], [2, 3], [3, 2]]) { await longRun(n); await follow(`run${k}`); }
  R.notes.push(`screens met: ${[...visited.keys()].join(', ')}`);
  R.notes.push(`minutes walked: ${await L.walked(R)}`);
  /* the map, records, symbols */
  await lookAround(['Map'], 'map');
  if (await R.page.getByRole('button', { name: 'Records', exact: true }).count()) {
    await lookAround(['Records'], 'records');
    /* Records ⇄ Symbols flipped fast, ten times */
    await L.toToday(R); await L.tap(R, 'Records');
    for (let i = 0; i < 10; i++) { const t = (await L.has(R, 'Symbols')) ? 'Symbols' : 'Records'; await R.page.getByRole('button', { name: t, exact: true }).last().click(); await R.page.clock.runFor(120); }
    await L.audit(R, 'records/symbols flipped');
    const trail = [];
    for (let i = 0; i < 6 && (await L.screen(R)) !== 'today'; i++) { trail.push((await R.page.locator('button.home span').innerText().catch(() => '?')).trim()); await L.tap(R, R.page.locator('button.home'), 'back', 600); }
    R.notes.push(`records/symbols ×10 then the arrow: ${trail.length} steps to Today`);
    if (trail.length > 3) R.fails.push(`after flipping Records ⇄ Symbols ten times the arrow takes ${trail.length} steps back to Today`);
    await lookAround(['Records', 'Symbols'], 'symbols');
  } else R.notes.push('no Records link on Today after three long runs');
  /* the evening: Go to sleep twice fast; the morning after */
  await L.toClock(R, 0, 22, 15); await L.toToday(R); await L.audit(R, 'evening');
  if (await L.has(R, 'Go to sleep')) { await L.multiTap(R, 'Go to sleep', 2, 60, 'Go to sleep ×2'); await L.audit(R, 'night');
    const gn = (await L.facts(R)).filter(f => f.type === 'goodnight').length; if (gn !== 1) R.fails.push(`${gn} goodnight facts after Go to sleep ×2`); }
  else R.notes.push('no Go to sleep at 22:15');
  await lookAround(['Satchel'], 'satchel at night');
  await L.toClock(R, 1, 7, 30); for (let i = 0; i < 3; i++) { await R.page.clock.runFor(800); await R.page.waitForTimeout(100); }
  await follow('morning');
  /* four days away: the welcome back */
  await L.hide(R, true); await L.toClock(R, 4, 10); await L.hide(R, false); for (let i = 0; i < 3; i++) { await R.page.clock.runFor(800); await R.page.waitForTimeout(100); }
  R.notes.push(`after four days away: ${await L.screen(R)} (${await cls()})`);
  await follow('welcome');
  await L.reload(R); await follow('after reload');
} catch (e) { R.fails.push(`script stopped: ${e.message.split('\n')[0]}`); }
/* DUMP=<file>: the save as it ends, to replay a crash (it holds only the test's own jobs and the game's facts) */
if (process.env.DUMP) { const fs = await import('fs'); fs.writeFileSync(process.env.DUMP, JSON.stringify({ facts: await L.facts(R), raw: await R.page.evaluate(() => localStorage.getItem('save.v1')) })); }
const x = await L.finish(R, 'story-walk');
await browser.close();
process.exit(x.errors ? 2 : x.fails ? 1 : 0);
