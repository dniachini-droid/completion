// Getting around after the flow review (N, S, L): coming back after days away shows the welcome only, with an arrow, its
// locked thing said as what it is, and a record read from it returns to it; the phone's back goes on from a moment that
// waits; the Daybook's new page waits as a line on Today, its offer kept until answered, and "Plan it for me" leaves the
// Week's arrow on Today; Records ⇄ Symbols are tabs; "Done reading" goes back; every arrow names where it goes; a job's
// return opened from the Satchel goes back there, as "Not now" does; a word to cut can be left for later.
// Usage: node tests/flows/nav-flow.mjs http://localhost:4173/ [width height]
import { readFileSync } from 'node:fs';
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
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
  for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
  await page.clock.runFor(1500);
  return page;
}
const helpers = page => {
  const btn = name => page.getByRole('button', { name, exact: true });
  const tap = async (loc, what) => {
    await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(250);
    const r = await loc.first().boundingBox().catch(() => null);
    if (!r) { fails.push(`no ${what}`); return false; }
    await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
  };
  const arrow = async () => (await page.locator('button.home span').first().textContent().catch(() => null))?.trim() ?? null;
  const onToday = async () => (await page.locator('nav.foot').count()) > 0;
  const back = async () => { await page.goBack().catch(() => {}); await page.clock.runFor(1200); await page.waitForTimeout(150); };
  return { btn, tap, arrow, onToday, back };
};

/* 1. back after four days away */
{
  const page = await open('keys', '2026-10-11T09:00:00+01:00');
  const { btn, tap, arrow, onToday, back } = helpers(page);
  if (!(await page.getByText('Where you were').count())) fails.push('after days away the app does not open on the welcome back');
  if ((await arrow()) !== 'Today') fails.push(`the welcome back has no arrow to Today (${await arrow()})`);
  const line = (await page.locator('.top .say').first().textContent().catch(() => ''))?.trim() ?? '';
  if (line && !/^(Ahead of you: |Behind you: |Still locked, further back: |Here: )/.test(line)) fails.push(`the welcome's line about the locked thing has no label: "${line.slice(0, 24)}…"`);
  if (!(await btn('Read the last record').count())) fails.push('the welcome back offers no "Read the last record"');
  else {
    await tap(btn('Read the last record'), 'Read the last record');
    if ((await arrow()) !== 'Where you were') fails.push(`the record's arrow says "${await arrow()}", not "Where you were"`);
    await tap(btn('Done reading'), 'Done reading');
    if (!(await page.getByText('Where you were').count())) fails.push('Done reading on the record did not return to the welcome back');
  }
  /* the phone's back on a moment that waits goes on, as its arrow does */
  await back();
  for (let k = 0; k < 4 && !(await onToday()); k++) await back();
  if (!(await onToday())) fails.push('the phone\'s back never left the welcome back and what waits after it');
  /* F: the Daybook's new page waits as a line on Today */
  const pageLine = page.getByRole('button', { name: 'A page was written for you · Daybook', exact: true });
  if (!(await pageLine.count())) fails.push('Today has no "A page was written for you · Daybook" line');
  else {
    await tap(pageLine, 'the page line');
    const offered = async () => (await btn('Plan it for me').count()) > 0;
    if (!(await offered())) fails.push('the new page has no offer');
    await tap(page.locator('button.home'), 'the Daybook\'s arrow');
    await tap(page.locator('.foot').getByRole('button', { name: 'Daybook', exact: true }), 'the Daybook');
    if (!(await offered())) fails.push('the offer was gone after leaving the page by its arrow');
    await tap(btn('Plan it for me'), 'Plan it for me');
    if ((await arrow()) !== 'Today') fails.push(`after Plan it for me, the Week's arrow says "${await arrow()}", not Today`);
    await tap(page.locator('button.home'), 'the Week\'s arrow');
  }
  /* Records ⇄ Symbols are tabs; Done reading goes back */
  if (!(await onToday())) fails.push('not on Today before Records');
  await tap(page.locator('.navs').getByRole('button', { name: 'Records', exact: true }), 'Records');
  await tap(page.locator('.body button.row').first(), 'a record');
  await tap(btn('Done reading'), 'Done reading');
  if (!(await page.locator('.body button.row').count())) fails.push('Done reading did not go back to the list of records');
  await tap(btn('Symbols'), 'the Symbols tab');
  await tap(btn('Records'), 'the Records tab');
  await tap(btn('Symbols'), 'the Symbols tab again');
  await tap(page.locator('button.home'), 'the arrow');
  if ((await page.locator('.ui h1').first().textContent().catch(() => ''))?.includes('What you can read')) fails.push('back from Symbols went to Symbols (the tabs stacked)');
  for (let k = 0; k < 3 && !(await onToday()); k++) await tap(page.locator('button.home'), 'the arrow');
  if (!(await onToday())) fails.push('three arrows from Records did not reach Today');
  /* bug 3: the editor from the set-up: "Back to <the job>", never "Back to Back" */
  /* (any job on Today: after days away the day holds only what was planned for it, deep review Part 2 #1) */
  await tap(page.locator('.rows button.row:not(.done)').first(), 'a job\'s row');
  await tap(btn('Edit'), 'Edit on the set-up');
  const named = await arrow();
  if (!named || named === 'Back' || named === 'Today') fails.push(`the editor from the set-up says "${named}", not the job`);
  await tap(page.locator('button.home'), 'the editor\'s arrow'); await tap(page.locator('button.home'), 'the set-up\'s arrow');
  /* clumsy 3: a tick from the Satchel's job menu; its return goes back to the Satchel; "Not now" too */
  await tap(page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'the Satchel');
  const tickHere = page.locator('.item').getByRole('button', { name: /: tick off$/ }).first();
  if (!(await tickHere.count())) fails.push('the Satchel has no job to tick off');
  else {
    await tap(tickHere, 'a tick circle in the Satchel'); await tap(btn('15 min'), '15 min'); await page.waitForTimeout(600);
    const say = await arrow();
    if (say !== 'Satchel' && say !== 'See where you are') fails.push(`the return of a job ticked in the Satchel says "${say}"`);
    if (say === 'Satchel') { await tap(page.locator('button.home'), 'the return\'s arrow'); if ((await page.locator('.ui h1').first().textContent())?.trim() !== 'The Satchel') fails.push('back from the return did not go to the Satchel'); }
  }
  await page.close();
}

/* 2. the word, left for later */
{
  const page = await open('word', '2026-10-06T11:05:00+01:00');
  const { btn, tap, onToday } = helpers(page);
  /* past the delve's end to the word */
  for (let k = 0; k < 4 && !(await btn('Later').count()); k++) { const way = (await btn('See where you are').count()) ? btn('See where you are') : page.locator('button.btn').first(); await tap(way, 'on to the word'); }
  if (!(await btn('Later').count())) fails.push('the word\'s screen did not come');
  else {
    /* (Playwright's own click waits for the word's screen to stand still: a tap while it rises can land on a guess) */
    await btn('Later').click(); await page.clock.runFor(1200);
    /* (the Daybook has a "Later" of its own: the word's screen is told by its rod) */
    if (await page.locator('button.rodbtn').count()) fails.push('"Later" on the word did not leave it');
    /* past anything else that waits (a new Daybook page) to Today */
    for (let k = 0; k < 4 && !(await onToday()); k++) await tap(page.locator('button.home'), 'a way on to Today');
    const waits = btn('A word waits to be cut');
    if (!(await waits.count())) fails.push('Today has no "A word waits to be cut"');
    else {
      await tap(waits, 'the word line');
      if (!(await page.locator('button.rodbtn').count())) fails.push('the word line did not return to the word');
      await tap(page.locator('button.home'), 'the word\'s arrow');
      if (!(await onToday())) fails.push('the word\'s arrow did not leave it');
    }
  }
  await page.close();
}

await b.close();
if (errors.length) fails.push(...errors.map(e => `page error: ${e}`));
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('nav-flow: ok');
