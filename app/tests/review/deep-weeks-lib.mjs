// Three weeks lived as Dan (review only): shared helpers for deep-weeks-*.mjs. Nothing here changes the app.
// The save is carried from one script to the next through /tmp/claude-weeks/save-<n>.json, so each week can be re-run.
import * as L from './lib.mjs';
import { launch } from '../flows/browser.mjs';
import fs from 'node:fs';
export { L };
export const URL = process.env.URL ?? 'http://localhost:4184/';
export const SHOTS = '/tmp/claude-weeks';
const LOG = `${SHOTS}/log.txt`;
fs.mkdirSync(SHOTS, { recursive: true });

export async function open({ at, from = null }) {
  const browser = await launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Europe/London', hasTouch: true });
  const page = await context.newPage();
  const errors = [], fails = [], notes = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message.split('\n')[0]}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text().split('\n')[0].slice(0, 200)}`); });
  if (from) {
    const saved = fs.readFileSync(`${SHOTS}/${from}`, 'utf8');
    await context.addInitScript(s => { if (!sessionStorage.getItem('__seeded')) { const o = JSON.parse(s); for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); } }, saved);
  }
  await page.clock.install({ time: new Date(at) });
  await page.goto(URL);
  const R = { browser, context, page, errors, fails, notes, w: 390, h: 844, tag: '', label: 'start', shared: false };
  await L.drawn(R);
  return R;
}
export async function keep(R, name) {
  const s = await R.page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
  fs.writeFileSync(`${SHOTS}/${name}`, s);
}
let n = 0;
/** A picture and the screen's words, into the log. */
export async function look(R, name, { full = false } = {}) {
  await R.page.clock.runFor(300); await R.page.waitForTimeout(250);
  const file = `${SHOTS}/${name}.png`;
  await R.page.screenshot({ path: file, fullPage: full }).catch(() => {});
  const txt = await R.page.evaluate(() => (document.querySelector('.phone') ?? document.body).innerText).catch(() => '');
  const when = await R.page.evaluate(() => new Date().toString().slice(0, 21));
  fs.appendFileSync(LOG, `\n===== ${name}  [${when}]  screen=${await L.screen(R)}\n${txt.replace(/\n{2,}/g, '\n')}\n`);
  return txt;
}
export const say = (R, s) => { console.log('  ' + s); fs.appendFileSync(LOG, `\n>>> ${s}\n`); };
export const foot = (R, name) => R.page.locator('.foot').getByRole('button', { name, exact: true });
export const text = R => R.page.evaluate(() => (document.querySelector('.phone') ?? document.body).innerText);
/** The save's facts. */
export const facts = R => L.facts(R);
export async function tally(R) {
  const f = (await L.facts(R)) ?? [];
  const steps = f.filter(x => x.type === 'stepsGained').reduce((a, x) => a + x.minutes, 0);
  const keys = f.filter(x => x.type === 'keyEarned').length, used = f.filter(x => x.type === 'keyUsed').length;
  const places = f.filter(x => x.type === 'arrived').length;
  return { steps, keys, used, held: keys - used, places, n: f.length };
}
export async function done(R, name) {
  await R.browser.close();
  for (const x of R.notes) console.log('NOTE:', x);
  for (const x of [...R.fails, ...R.errors]) console.log('FAIL:', x);
  console.log(`${name}: ${R.fails.length} fails, ${R.errors.length} errors`);
}
