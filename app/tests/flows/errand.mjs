// The errand run (Dan, D-139): three jobs saved in the Satchel (Bank, Post office, Chemist); the Satchel's "Errand run"
// opens the pick list; all three ticked → "Start the run" → the usual set-up titled "Errand run" → Begin; in the delve the
// errands are a list struck off with a tap (Bank, Post office); 20 minutes in, Finish here: the end names the run's 20
// minutes, Bank and Post office done with 10 each, Chemist still to do, and the ring counts 20 (the road moved once).
// Bank and Post office are done on Today; Chemist waits in the Satchel. Today's own "Errand run" link opens the pick list.
// Nothing slides sideways. SHOTS=<dir> saves pictures. Usage: node tests/flows/errand.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250); };
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const btn = (name) => page.getByRole('button', { name, exact: true });
const shot = async (name) => { if (shots) { await page.waitForTimeout(3600); await page.screenshot({ path: `${shots}/errand-${name}-${w}.png` }); } };
const toToday = async () => { for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) { const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn'); await tap(way, 'way back to Today'); } };
/* nothing wider than the phone: no screen slides sideways */
const flat = async (where) => {
  /* as the whole walk checks it: nothing can scroll sideways, and nothing has */
  const wide = await page.evaluate(() => [document.scrollingElement, ...document.querySelectorAll('*')].some(e => {
    const s = getComputedStyle(e);
    return ((s.overflowX === 'auto' || s.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 1) || e.scrollLeft > 0;
  }));
  if (wide) fails.push(`${where} is wider than the phone`);
};
const save = async (name) => { await page.keyboard.type(name); await page.keyboard.press('Enter'); await page.clock.runFor(800); };

/* 1. three jobs saved for later in the Satchel ("Add a job" opens its box) */
await tap(page.locator('.today-add'), 'Add a job');
for (const n of ['Bank', 'Post office', 'Chemist']) { await page.locator('.satchel-add input').focus(); await save(n); }
await page.locator('.satchel-add input').blur(); await page.clock.runFor(600);

/* 2. the Satchel's "Errand run": the pick list, "Start the run" waiting for two ticks */
await tap(btn('Errand run'), 'the Satchel\'s Errand run');
if (!(await page.locator('h1', { hasText: /errand run/i }).count())) fails.push('the pick list has no "Errand run" heading');
if (!(await btn('Start the run').isDisabled().catch(() => false))) fails.push('"Start the run" is open with nothing ticked');
for (const n of ['Bank', 'Post office', 'Chemist']) await tap(page.getByRole('checkbox', { name: `${n}: take it on the run`, exact: true }), `the ${n} tick`);
const ticked = await page.locator('[role=checkbox][aria-checked=true]').count();
if (ticked !== 3) fails.push(`${ticked} jobs ticked, not 3`);
await flat('the pick list');
await shot('1-pick');
await tap(btn('Start the run'), 'Start the run');

/* 3. the set-up: titled "Errand run", naming the three */
if (!(await page.locator('.rs h1', { hasText: 'Errand run' }).count())) fails.push('the set-up is not titled "Errand run"');
if (!(await page.getByText(/^3 errands: (?=.*Bank)(?=.*Post office)(?=.*Chemist)/).count())) fails.push('the set-up does not name the three errands');
await flat('the set-up');
await shot('2-set');
await tap(btn('Begin'), 'Begin');

/* 4. the delve: the errands, struck off with a tap (and back) */
if (!(await page.locator('.dv h2', { hasText: 'Errand run' }).count())) fails.push('the delve is not titled "Errand run"');
await tap(btn('Bank'), 'Bank in the delve');
await tap(btn('Chemist'), 'Chemist in the delve');
await tap(btn('Chemist: struck off'), 'Chemist struck off, tapped back');
await tap(btn('Post office'), 'Post office in the delve');
const struck = await page.locator('.list button.struck').count();
if (struck !== 2) fails.push(`${struck} errands struck off, not 2`);
await flat('the delve');
await shot('3-delve');
await ff(20 * 60_000 + 20_000);
await tap(btn('Finish here'), 'Finish here');

/* 5. the end: the run's minutes, each errand with its share, the ring counting the run's 20 minutes */
await page.waitForTimeout(3600); await page.clock.runFor(3600);
if (!(await page.getByText('An errand run of 20 minutes.').count())) fails.push('the end does not say "An errand run of 20 minutes."');
for (const [n, s] of [['Bank', 'done · 10 min'], ['Post office', 'done · 10 min'], ['Chemist', 'still to do']]) {
  if (!(await page.locator('.errs li', { hasText: n }).filter({ hasText: s }).count())) fails.push(`the end does not show ${n}: ${s}`);
}
const ring = await page.evaluate(() => document.querySelector('.dv .ring .count .sr')?.textContent?.trim() ?? null);
if (ring !== null && ring !== '20 minutes') fails.push(`the ring counts to ${ring}, not 20 minutes`);
if (await page.getByText('Is it done?').count()) fails.push('an errand run asked "Is it done?"');
await flat('the end');
await shot('4-end');
const out = (await btn('See where you are').count()) ? btn('See where you are') : btn('Back to today');
await tap(out, 'the way out of the end');
await toToday();

/* 6. Bank and Post office are done on Today; Chemist waits in the Satchel */
for (const n of ['Bank', 'Post office']) if (!(await page.locator('button.row.done', { hasText: n }).count())) fails.push(`${n} is not done on Today`);
await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
if (!(await page.locator('button.row', { hasText: 'Chemist' }).count())) fails.push('Chemist is not in the Satchel');
if (await page.locator('button.row', { hasText: 'Bank' }).count()) fails.push('Bank, done, is still in the Satchel');
await toToday();

/* 7. Today's own link, quietly at the list's end, opens the pick list (Chemist and today's jobs) */
if (await tap(btn('Errand run'), 'Today\'s Errand run')) {
  if (!(await page.getByRole('checkbox', { name: 'Chemist: take it on the run', exact: true }).count())) fails.push('Chemist is not on the pick list from Today');
  if (await page.getByRole('checkbox', { name: 'Bank: take it on the run', exact: true }).count()) fails.push('Bank, done, is on the pick list');
  await flat('the pick list from Today');
  await tap(page.locator('.home'), 'back from the pick list');
  if (!(await page.locator('nav.foot').count())) fails.push('back from the pick list did not return to Today');
}

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`errand (${w}x${h}): ok`);
