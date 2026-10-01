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

/* ---------- getting about ---------- */
export const btn = (R, name) => R.page.getByRole('button', { name, exact: true });
export const has = async (R, name) => (await btn(R, name).count()) > 0;
export const onToday = async R => (await R.page.locator('nav.foot').count()) > 0 && !(await R.page.locator('.sheet[role=dialog]').count());
export async function tap(R, loc, what, settle = 1000) { return L.tap(R, typeof loc === 'string' ? btn(R, loc) : loc, what, settle); }
/** By the arrow, back to Today (never answering anything on the way). */
export async function home(R) {
  for (let k = 0; k < 8 && !(await onToday(R)); k++) {
    if (await R.page.locator('.sheet .cancel, .sheet button.item.cancel').count()) { await R.page.locator('.sheet .cancel, button.item.cancel').first().click().catch(() => {}); await R.page.clock.runFor(500); continue; }
    if (await R.page.locator('button.home').count()) await R.page.locator('button.home').first().click({ timeout: 3000 }).catch(() => {});
    else if (await has(R, 'Back to today')) await btn(R, 'Back to today').first().click().catch(() => {});
    else break;
    await R.page.clock.runFor(1200); await R.page.waitForTimeout(80);
  }
  return onToday(R);
}
/** Time passes with the app put away (hidden), then it is opened again. */
export async function later(R, days, hh, mm = 0) {
  await L.hide(R, true); await L.toClock(R, days, hh, mm); await L.hide(R, false);
  await R.page.clock.runFor(1500); await R.page.waitForTimeout(200);
}
/** The app closed for good and opened afresh at that time (a reload). */
export async function reopen(R, days, hh, mm = 0) {
  await L.hide(R, true); await L.toClock(R, days, hh, mm);
  await R.page.reload(); await R.page.clock.runFor(1500); await L.drawn(R); await R.page.waitForTimeout(200);
}
export const now = R => R.page.evaluate(() => new Date().toString().slice(0, 24));
/** Today's rows as drawn: [{name, note, done, section}] */
export async function rows(R) {
  return R.page.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll('.bottom button.row, .bottom .row.still')) {
      const sec = b.closest('.rows.aside') ? 'aside' : b.closest('.rows.replies') ? 'reply' : (b.closest('.rows')?.previousElementSibling?.classList.contains('if-time') ? 'ifTime' : 'today');
      out.push({ t: b.querySelector('.t')?.innerText.replace(/\n/g, ' ') ?? '', s: b.querySelector('.s')?.innerText ?? '', done: b.classList.contains('done') || !!b.querySelector('.pip.done'), sec });
    }
    return out;
  });
}
export const fmtRows = rs => rs.map(r => `${r.sec}:${r.done ? '[x]' : '[ ]'} ${r.t}${r.s ? ' (' + r.s + ')' : ''}`).join(' | ');
export async function road(R) { return R.page.evaluate(() => [document.querySelector('.where')?.getAttribute('aria-label') ?? '', document.querySelector('.where')?.innerText.replace(/\n/g, ' ') ?? '', document.querySelector('.keys')?.innerText ?? '', document.querySelector('.key-use')?.innerText ?? ''].join(' || ')); }

/** Today's state, said and pictured. */
export async function today(R, name) {
  await home(R);
  const rs = await rows(R); const rd = await road(R); const tl = await tally(R);
  say(R, `${name} @ ${await now(R)}  ROAD: ${rd}  FACTS: walked ${tl.steps}, keys earned ${tl.keys} used ${tl.used}, arrivals ${tl.places}\n    ROWS: ${fmtRows(rs)}`);
  await look(R, name, { full: true });
  return { rs, rd, tl };
}

/* ---------- through whatever comes after a delve or a tick, to Today ---------- */
export async function through(R, tag, o = {}) {
  const seen = [];
  for (let k = 0; k < 24; k++) {
    if (await onToday(R)) break;
    await R.page.clock.runFor(2500); await R.page.waitForTimeout(300);
    const s = await L.screen(R);
    const name = `${tag}-${String(k).padStart(2, '0')}`;
    const tx = await look(R, name, { full: true });
    seen.push(s);
    if (await has(R, 'Use it here') && await has(R, 'Keep it')) { await tap(R, o.key === 'use' ? 'Use it here' : 'Keep it'); continue; }
    const guess = R.page.locator('.guess .opts button');
    if (await guess.count()) { await L.tap(R, guess.nth(o.guess ?? 0), 'a guess'); continue; }
    if (await has(R, 'Done') && await has(R, 'Not yet')) { await tap(R, o.ask ?? 'Done'); continue; }
    if (o.stopAt && await R.page.locator('input.line.stop').count()) { await R.page.locator('input.line.stop').fill(o.stopAt); o.stopAt = null; }
    if (await has(R, 'Count them')) { for (const e of o.struck ?? []) { const b = R.page.locator('ul.list button', { hasText: e }); if (await b.count() && (await b.getAttribute('aria-pressed')) !== 'true') await L.tap(R, b, e, 300); } await tap(R, 'Count them'); continue; }
    if (await has(R, 'Next')) { await tap(R, 'Next'); continue; }
    if (await has(R, 'Later') && await R.page.locator('.rodbtn').count()) { await tap(R, 'Later'); continue; }
    if (await has(R, 'See where you are')) { await tap(R, 'See where you are'); continue; }
    if (await has(R, 'Back to today')) { await tap(R, btn(R, 'Back to today').last()); continue; }
    const big = R.page.locator('.ui button.btn:not([disabled])');
    if (await big.count()) { await L.tap(R, big.last(), 'the big button'); continue; }
    if (await R.page.locator('button.home').count()) { await L.tap(R, R.page.locator('button.home').first(), 'arrow'); continue; }
    R.fails.push(`[${tag}] stuck on ${s}`); break;
  }
  return seen;
}

/* ---------- doing jobs ---------- */
export const todayRow = (R, name) => R.page.locator('.bottom .rows button.row', { hasText: name }).first();
/** Set the set-up's dial and count. */
export async function setUp(R, min, n) {
  if (min) { const s = R.page.locator(`.rs button.stop[aria-label="${min} minutes"]`); if (await s.count()) await L.tap(R, s, `${min} min`, 500); else R.fails.push(`no ${min}-minute stop`); }
  for (let k = 0; k < 10; k++) {
    const cur = +(await R.page.locator('.rs .route').getAttribute('aria-valuenow').catch(() => '1'));
    if (!n || cur === n) break;
    await L.tap(R, btn(R, cur < n ? 'One more delve' : 'One delve fewer'), 'count', 300);
  }
}
/** Run the clock through a delve that is going: `mins` minutes of the app's time, in steps. */
export async function pass(R, mins, step = 5) {
  for (let m = 0; m < mins; m += step) { await L.ff(R, Math.min(step, mins - m) * 60_000); }
}
/** A delve on a job from Today's row (or the Satchel's), at `min` × `n`, run to its end or finished at `at` minutes. */
export async function delve(R, job, { min, n = 1, at = null, tag, from = 'today', ...o } = {}) {
  await home(R);
  if (from === 'today') { if (!(await todayRow(R, job).count())) { R.fails.push(`[${tag}] ${job} not on Today`); return null; } await L.tap(R, todayRow(R, job), job); }
  else { await L.tap(R, foot(R, 'Satchel'), 'Satchel'); await L.tap(R, R.page.locator('button.row', { hasText: job }).first(), job); }
  if (!(await R.page.locator('.rs').count())) { await look(R, `${tag}-noset`); R.fails.push(`[${tag}] no set-up for ${job}`); return null; }
  await setUp(R, min, n);
  await look(R, `${tag}-set`);
  await tap(R, 'Begin');
  const total = at ?? (n * min + (n - 1) * 5);
  await pass(R, total);
  if (at !== null && await has(R, 'Finish here')) await tap(R, btn(R, 'Finish here').first());
  await R.page.clock.runFor(2000);
  return through(R, tag, o);
}
/** Ticked off with the circle: `chip` is the sheet's choice ('15 min', '1 h' …, or its index). */
export async function tick(R, job, chip, tag, o = {}) {
  await home(R);
  if (o.from === 'satchel') await L.tap(R, foot(R, 'Satchel'), 'Satchel');
  const c = R.page.locator('.tickbtn', { has: R.page.locator('.ring') }).and(R.page.locator(`[aria-label="${job}: tick off"]`));
  if (!(await c.count())) { R.fails.push(`[${tag}] no tick circle for ${job}`); return null; }
  await L.tap(R, c, `${job} tick`, 600);
  await look(R, `${tag}-sheet`);
  const chips = R.page.locator('.sheet .chip');
  const pick = typeof chip === 'number' ? chips.nth(chip) : R.page.locator('.sheet .chip', { hasText: chip }).first();
  await L.tap(R, pick, `chip ${chip}`, 1500);
  return through(R, tag, o);
}
/** Slid left on Today, then "Not today". */
export async function notToday(R, job, tag) {
  await home(R);
  await L.slide(R, job);
  const b = R.page.getByRole('button', { name: `${job}: not today`, exact: true });
  if (!(await b.count())) { R.fails.push(`[${tag}] no Not today for ${job}`); return; }
  await b.first().click(); await R.page.clock.runFor(800);
}
/** A press and hold on a Today row: the job's menu. */
export async function menu(R, job, item, tag) {
  await home(R);
  const r = todayRow(R, job);
  const box = await r.boundingBox().catch(() => null);
  if (!box) { R.fails.push(`[${tag}] no row ${job} to hold`); return false; }
  await R.page.mouse.move(box.x + 60, box.y + box.height / 2); await R.page.mouse.down();
  await R.page.waitForTimeout(700); await R.page.clock.runFor(700); await R.page.mouse.up(); await R.page.clock.runFor(400);
  await look(R, `${tag}-menu`);
  if (!item) return true;
  const it = R.page.locator('.sheet button.item, button.item', { hasText: item }).first();
  if (!(await it.count())) { R.fails.push(`[${tag}] menu has no ${item}`); return false; }
  await it.click(); await R.page.clock.runFor(800);
  return true;
}
/** Add a job from Today's "Add a job": `how` 'today' (Return), 'later', 'now'. */
export async function addJob(R, name, how = 'today') {
  await home(R);
  await L.tap(R, R.page.locator('.today-add').first(), 'Add a job', 600);
  await R.page.keyboard.type(name);
  if (how === 'today') await R.page.keyboard.press('Enter');
  else await tap(R, how === 'later' ? 'Save for later' : 'Delve now');
  await R.page.clock.runFor(800);
}
/** A button found by its accessible name and clicked by script (rows' hidden swipe actions). */
export async function press(R, name, settle = 900) {
  const b = R.page.getByRole('button', { name, exact: true }).first();
  if (!(await b.count())) { R.fails.push(`[${R.label}] no button "${name}"`); return false; }
  await b.evaluate(e => e.click()); await R.page.clock.runFor(settle); await R.page.waitForTimeout(60); return true;
}
export async function toSatchel(R) { await home(R); await L.tap(R, foot(R, 'Satchel'), 'Satchel'); }
export async function toWeek(R) { await home(R); await L.tap(R, foot(R, 'Week'), 'Week'); }
