// What the deep review's flows share (D-147): a phone-sized page on a pretend clock, from a fresh save or one made by the
// rules (tests/flows/saves/), taps where a finger would land, and the save read back as the phone keeps it.
// Ids only in what they print (D-015).
import { readFileSync } from 'node:fs';
const { launch } = await import('./browser.mjs');

export async function kit(url, w = '390', h = '844') {
  const b = await launch();
  const fails = [], errors = [];
  async function open(saveName, time) {
    const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true });
    page.on('pageerror', e => errors.push(e.message));
    if (saveName) {
      const save = readFileSync(new URL(`./saves/${saveName}.json`, import.meta.url), 'utf8');
      await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('save.v1', s); sessionStorage.setItem('seeded', '1'); } } catch { /* */ } }, save);
    }
    await page.clock.install({ time: new Date(time) });
    await page.goto(url);
    await drawn(page);
    return page;
  }
  async function drawn(page) {
    for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
    await page.clock.runFor(1500);
  }
  const helpers = page => {
    const btn = name => page.getByRole('button', { name, exact: true });
    const tap = async (loc, what, settle = 1200) => {
      const l = typeof loc === 'string' ? btn(loc) : loc;
      await l.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(200);
      const r = await l.first().boundingBox().catch(() => null);
      if (!r) { fails.push(`no ${what ?? loc}`); return false; }
      await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(settle); await page.waitForTimeout(60); return true;
    };
    const has = async name => (await btn(name).count()) > 0;
    const arrow = async () => (await page.locator('button.home span').first().textContent().catch(() => null))?.trim() ?? null;
    const onToday = async () => (await page.locator('nav.foot').count()) > 0 && !(await page.locator('.sheet[role=dialog]').count());
    const facts = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('save.v1') ?? '{"facts":[]}').facts; } catch { return null; } });
    const h1 = async () => (await page.locator('.ui h1').first().textContent().catch(() => ''))?.trim() ?? '';
    /** By the arrow, back to Today (answering nothing on the way). */
    const home = async () => {
      for (let k = 0; k < 8 && !(await onToday()); k++) {
        if (await page.locator('button.home').count()) await page.locator('button.home').first().click({ timeout: 3000 }).catch(() => {});
        else break;
        await page.clock.runFor(1200); await page.waitForTimeout(80);
      }
      return onToday();
    };
    /** The clock moved on by `ms` while the app stays open. */
    const ff = async ms => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(150); await page.clock.runFor(250); };
    /** The app closed for good and opened again (iOS does it on its own). */
    const reload = async () => { await page.reload(); await drawn(page); };
    /** A job added from Today's "Add a job": `how` 'today' (Return), 'later', 'now'. */
    const addJob = async (name, how = 'today') => {
      await home();
      await tap(page.locator('.today-add').first(), 'Add a job', 600);
      await page.keyboard.type(name);
      if (how === 'today') await page.keyboard.press('Enter'); else await tap(how === 'later' ? 'Save for later' : 'Delve now');
      await page.clock.runFor(800);
    };
    const row = name => page.locator('.bottom .rows button.row', { hasText: name }).first();
    return { btn, tap, has, arrow, onToday, facts, h1, home, ff, reload, addJob, row };
  };
  async function end(name) {
    await b.close();
    if (errors.length) fails.push(...errors.map(e => `page error: ${e}`));
    if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
    console.log(`${name}: ok`);
  }
  return { open, helpers, fails, end };
}
