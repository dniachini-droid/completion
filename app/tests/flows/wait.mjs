// Waiting on a reply (Dan, D-137): a job saved for later, press and hold → "Waiting on…" → "the vet" → "Back on …": it
// leaves No day yet for the Satchel's quiet Waiting ("Waiting on the vet · back Sat 3 Oct"), and "Back to it" there puts it
// back. A job on Today set waiting leaves Today, saying where it went. On its day it is back under Today's list with "Did
// they reply?": Still waiting (a new day), Back to it (an ordinary row again), It's done (ticked off with the time it
// took). A recurring job's menu has no "Waiting on…". Nothing slides sideways at the phone's width.
// SHOTS=<dir> saves pictures. Usage: node tests/flows/wait.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
/* Wednesday 30 September */
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const hold = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what} to hold`); return false; }
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.clock.runFor(700); await page.waitForTimeout(300);
  await page.mouse.up(); await page.clock.runFor(600); await page.waitForTimeout(300);
  if (!(await page.locator('.menu').count())) { fails.push(`holding ${what} opened no menu`); return false; }
  return true;
};
const btn = (name) => page.getByRole('button', { name, exact: true });
const shot = async (name) => { if (shots) { await page.waitForTimeout(1500); await page.screenshot({ path: `${shots}/wait-${name}-${w}.png` }); } };
const onToday = async () => (await page.locator('nav.foot').count()) > 0 && (await page.locator('.today-add, .addcard, .next').count()) > 0;
const toToday = async () => {
  for (let k = 0; k < 10 && !(await onToday()); k++) {
    const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn');
    if (!(await tap(way, 'way back to Today'))) break;
  }
};
const toSatchel = () => tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
const noSlide = async (where) => {
  /* as the whole walk checks it: nothing can be scrolled sideways, nothing is scrolled sideways */
  const over = await page.evaluate(() => [document.scrollingElement, ...document.querySelectorAll('.phone *')].some(e => {
    if (!e) return false; const s = getComputedStyle(e);
    return ((s.overflowX === 'auto' || s.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 1) || e.scrollLeft > 0;
  }));
  if (over) fails.push(`${where} slides sideways at ${w} wide`);
};
/* every choice of "Waiting on…" whole on the screen, none cut off at its edge */
const fits = async (where) => {
  const cut = await page.evaluate(() => [...document.querySelectorAll('.wait button, .wait input')].filter(e => {
    const r = e.getBoundingClientRect(), box = e.closest('.menu, .reply, .ui')?.getBoundingClientRect();
    return r.left < 0 || r.right > innerWidth || (box && r.right > box.right + 0.5) || e.scrollWidth > e.clientWidth + 1;
  }).map(e => e.textContent?.trim() || e.getAttribute('aria-label')));
  if (cut.length) fails.push(`${where}: cut off at ${w} wide: ${cut.join(', ')}`);
};
/* a new day: the clock moved on and the app opened again, with anything the morning shows looked through */
const days = async (n) => {
  const t = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(t + n * 86_400_000); await page.clock.runFor(1500);
  await page.reload();
  for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
  await toToday();
};
const inSection = async (label, name) => page.evaluate(([label, name]) => {
  const heads = [...document.querySelectorAll('.label-line')];
  const at = heads.findIndex(x => x.textContent?.trim().toLowerCase() === label.toLowerCase());
  if (at < 0) return false;
  let e = heads[at].nextElementSibling;
  while (e && !e.classList.contains('label-line')) { if (e.textContent?.includes(name)) return true; e = e.nextElementSibling; }
  return false;
}, [label, name]);

/* 1. a job saved for later, set waiting on the vet from its menu in the Satchel */
await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'the Satchel'); await page.locator('.satchel-add input').focus(); await page.keyboard.type('Vet results'); await page.keyboard.press('Enter'); await page.clock.runFor(800);
if (!(await inSection('No day yet', 'Vet results'))) fails.push('Vet results is not in No day yet');
if (await hold(page.locator('button.row', { hasText: 'Vet results' }), 'Vet results')) {
  await tap(page.locator('.menu').getByRole('button', { name: 'Waiting on…', exact: true }), 'Waiting on… in the menu');
  await fits('the menu\'s Waiting on…');
  await tap(page.getByRole('textbox', { name: 'Vet results: waiting on who or what' }), 'the who box');
  await page.keyboard.type('the vet');
  await shot('1-menu');
  await tap(btn('Back on Sat 3 Oct'), '"Back on Sat 3 Oct" (in 3 days)');
}
if (await inSection('No day yet', 'Vet results')) fails.push('Vet results, waiting, is still in No day yet');
if (!(await inSection('Waiting', 'Vet results'))) fails.push('Vet results is not in Waiting');
if (!(await page.getByText('Waiting on the vet · back Sat 3 Oct').count())) fails.push('no "Waiting on the vet · back Sat 3 Oct"');
await noSlide('the Satchel with Waiting');
await shot('2-satchel');
/* "Back to it" from the Waiting row: with no day again; then waiting once more, on another day from the calendar */
await tap(page.getByRole('button', { name: 'Vet results: back to it', exact: true }), 'Back to it in Waiting');
if (!(await inSection('No day yet', 'Vet results'))) fails.push('Back to it did not put Vet results back in No day yet');
if (await page.getByText('Waiting on the vet').count()) fails.push('Vet results still shows as waiting after Back to it');
if (await hold(page.locator('button.row', { hasText: 'Vet results' }), 'Vet results')) {
  await tap(page.locator('.menu').getByRole('button', { name: 'Waiting on…', exact: true }), 'Waiting on… again');
  const box = page.getByRole('textbox', { name: 'Vet results: waiting on who or what' });
  if ((await box.inputValue().catch(() => '')) !== '') fails.push('the who box kept an old line after Back to it');
  await tap(box, 'the who box'); await page.keyboard.type('the vet');
  await tap(page.locator('.menu').getByRole('button', { name: 'Another day…', exact: true }), 'Another day…');
  await tap(page.locator('.menu').getByRole('button', { name: /^Friday 2 October/ }), 'Friday 2 October on the calendar');
}
if (!(await page.getByText('Waiting on the vet · back Fri 2 Oct').count())) fails.push('no "Waiting on the vet · back Fri 2 Oct"');

/* 2. a job on Today set waiting: off Today, saying where it went, with "Back to it" at hand */
await toToday();
if (await page.locator('button.row', { hasText: 'Vet results' }).count()) fails.push('Vet results, waiting, is on Today');
const first = page.locator('.rows button.row').first();
const name = (await first.locator('.t').textContent().catch(() => ''))?.trim() ?? '';
if (!name) fails.push('no job on Today to set waiting');
else if (await hold(first, name)) {
  await tap(page.locator('.menu').getByRole('button', { name: 'Waiting on…', exact: true }), `Waiting on… for ${name}`);
  await tap(page.locator('.menu .wait-soon'), 'the default day');
  if (await page.locator('.rows button.row', { hasText: name }).count()) fails.push(`${name}, waiting, is still on Today's list`);
  if (!(await page.getByText(`${name}: in the satchel until Sat 3 Oct.`).count())) fails.push(`no "${name}: in the satchel until Sat 3 Oct."`);
  await noSlide('Today');
  await shot('3-today');
  /* its "Back to it" takes the wait back: on today's list again */
  await tap(page.getByRole('button', { name: `${name}: back to it`, exact: true }), `Back to it for ${name}`);
  if (!(await page.locator('.rows button.row', { hasText: name }).count())) fails.push(`Back to it did not put ${name} back on Today`);
  if (await hold(page.locator('.rows button.row', { hasText: name }), name)) {
    await tap(page.locator('.menu').getByRole('button', { name: 'Waiting on…', exact: true }), `Waiting on… for ${name} again`);
    await tap(page.locator('.menu .wait-soon'), 'the default day');
  }
  if (await page.locator('.rows button.row', { hasText: name }).count()) fails.push(`${name}, waiting again, is still on Today's list`);
}
/* a recurring job's menu has no "Waiting on…" */
await toSatchel();
const rec = page.locator('.label-line', { hasText: 'Recurring jobs' }).locator('xpath=following-sibling::div[1]').locator('button.row').first();
if (await hold(rec, 'a recurring job')) {
  if (await page.locator('.menu').getByRole('button', { name: 'Waiting on…', exact: true }).count()) fails.push('a recurring job offers Waiting on…');
  await tap(page.locator('.menu').getByRole('button', { name: 'Cancel', exact: true }), 'Cancel');
}
await toToday();

/* set waiting from the Week: said nowhere, and nothing stale is said on Today afterwards (review of D-137) */
await tap(page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week');
const later = page.locator('button.row:not(.done):not([disabled])', { hasText: 'Sort the post' });
if (!(await later.count())) fails.push('no Sort the post ahead in the Week');
else if (await hold(later, 'Sort the post in the Week')) {
  await tap(page.locator('.menu').getByRole('button', { name: 'Waiting on…', exact: true }), 'Waiting on… in the Week');
  await tap(page.locator('.menu .wait-soon'), 'the default day');
}
await toToday();
if (await page.getByText(/in the satchel until/).count()) fails.push('a wait set in the Week (or earlier) is still said on Today');

/* 3. Friday: Vet results is back under Today's list, "Did they reply?"; Still waiting → Monday */
await days(2);
const ask = () => page.locator('.reply', { hasText: 'Vet results' });
if (!(await ask().count())) fails.push('Vet results is not back on Today on its day');
else {
  if (!(await ask().getByText('Did they reply?').count())) fails.push('no "Did they reply?" under Vet results');
  if (!(await ask().getByText('Waiting on the vet').count())) fails.push('no "Waiting on the vet" under its name');
  await noSlide('Today with a reply');
  await shot('4-reply');
  await tap(page.getByRole('button', { name: 'Vet results: still waiting, choose a day', exact: true }), 'Still waiting');
  await fits('Still waiting on Today');
  await tap(ask().getByRole('button', { name: 'Another day…', exact: true }), 'Another day… for Still waiting');
  await tap(ask().getByRole('button', { name: /^Monday 5 October/ }), 'Monday 5 October');
  if (await ask().count()) fails.push('Still waiting left Vet results on Today');
}

/* 4. Saturday: the job waiting from Today is back; "It's done" ticks it off with the time it took */
await days(1);
const back = page.locator('.reply', { hasText: name });
if (!name || !(await back.count())) fails.push(`${name} is not back on Today on Saturday`);
else {
  await tap(page.getByRole('button', { name: `${name}: it’s done`, exact: true }), `It's done on ${name}`);
  if (!(await page.getByText('How long did it take?').count())) fails.push('It\'s done did not ask "How long did it take?"');
  await tap(btn('15 min'), '15 min');
  await toToday();
  if (await back.count()) fails.push(`${name}, done, still asks "Did they reply?"`);
}

/* 5. Monday: Back to it → an ordinary row on today's list */
await days(2);
if (!(await ask().count())) fails.push('Vet results is not back on Today on Monday');
else {
  await tap(page.getByRole('button', { name: 'Vet results: back to it', exact: true }), 'Back to it on Today');
  if (await ask().count()) fails.push('Back to it left "Did they reply?"');
  if (!(await page.locator('.rows button.row', { hasText: 'Vet results' }).count())) fails.push('Back to it did not put Vet results on today\'s list');
}
await noSlide('Today');

if (errors.length) fails.push(...errors.map(e => 'page error: ' + e));
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log(`wait (${w}x${h}): ok`);
