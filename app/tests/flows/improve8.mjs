// The improvements (D-147, Stage 8; MORNING-REPORT Part 3) as Dan meets them: the put-off job's mark; "Can't get
// started?" on Today and the set-up; "Just this one today" with one Undo; the 5-minute mark and "It counts now."; last
// night's choice shown on Today; the week's close led by the furthest place; the Map's gold path. Ids and names of his
// own jobs only (D-015).
// Usage: node tests/flows/improve8.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;
const hold = async (page, loc) => {
  const box = await loc.boundingBox().catch(() => null);
  if (!box) return false;
  await page.mouse.move(box.x + 60, box.y + box.height / 2); await page.mouse.down();
  await page.waitForTimeout(700); await page.clock.runFor(700); await page.mouse.up(); await page.clock.runFor(400);
  return true;
};

/* 1. Today: the mark, "Can't get started?", "Just this one today" */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const { tap, btn, home } = K.helpers(page);
  await home();
  if (!(await page.locator('.rows .t.putoff').count())) fails.push('no put-off job carries its mark');
  const cant = btn('Can’t get started?').or(page.getByRole('button', { name: /^Can’t get started on .*\?$/ }));
  if (!(await cant.count())) fails.push('Today has no "Can\'t get started?" before the day\'s first start');
  else {
    await tap(cant, 'Can\'t get started?');
    if (await page.locator('nav.foot').count()) fails.push('"Can\'t get started?" did not open "I can\'t start"');
    await home();
  }
  const rows = page.locator('.bottom .rows button.row:not(.done)');
  const n = await rows.count();
  if (n < 2) fails.push(`only ${n} jobs on Today to try "Just this one today"`);
  else {
    await hold(page, rows.first());
    if (!(await tap(page.locator('.menu').getByRole('button', { name: 'Just this one today', exact: true }), 'Just this one today'))) fails.push('no "Just this one today" in the job menu');
    if ((await rows.count()) !== 1) fails.push(`after "Just this one today" ${await rows.count()} jobs are left on Today`);
    if (!(await tap(page.locator('.said.deleted').getByRole('button', { name: 'Undo', exact: true }), 'its Undo'))) fails.push('no Undo after "Just this one today"');
    else if ((await rows.count()) !== n) fails.push(`Undo brought back ${await rows.count()} of ${n} jobs`);
  }
  await page.close();
}

/* 2. the set-up and the delve: "Can't get started?", the 5-minute notch, "It counts now." */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const { tap, btn, home, ff } = K.helpers(page);
  await home();
  await tap(page.locator('.bottom .rows button.row:not(.done)').first(), 'a job');
  if (!(await btn('Can’t get started?').count())) fails.push('the set-up has no "Can\'t get started?"');
  await tap(btn('Begin'), 'Begin', 1500);
  if (!(await page.locator('.dv .ring .five').count())) fails.push('the ring has no 5-minute notch');
  await ff(5 * 60_000 + 10_000);
  await page.clock.runFor(1100); await page.waitForTimeout(150);   /* the next second drawn */
  const said = (await page.locator('.dv .ring .left').first().textContent().catch(() => ''))?.trim();
  if (said !== 'It counts now.') fails.push(`at 5 minutes the line under the countdown reads "${said}"`);
  await ff(2 * 60_000); await page.clock.runFor(1100); await page.waitForTimeout(150);
  const later = (await page.locator('.dv .ring .left').first().textContent().catch(() => ''))?.trim();
  if (later === 'It counts now.') fails.push('"It counts now." is said for more than a minute');
  await page.close();
}

/* 3. last night's choice on Today the next morning */
{
  const page = await K.open(null, '2026-09-30T20:00:00+01:00');
  const { tap, home, ff, reload } = K.helpers(page);
  await home();
  if (!(await tap(page.locator('button.first-job').first(), 'tomorrow\'s first job'))) fails.push('Tonight offers no choice of tomorrow\'s first job in the evening');
  else {
    const pick = page.locator('.choices button.choice:not([aria-pressed="true"])').first();
    const name = (await pick.evaluate(e => e.firstChild?.textContent ?? '').catch(() => ''))?.trim();
    await tap(pick, 'another first job');
    await ff(13 * 3600_000); await reload(); await home();
    const line = (await page.locator('.chosen-first').textContent().catch(() => ''))?.trim() ?? '';
    if (!line.startsWith(`You chose to start with ${name}`)) fails.push(`the morning after, Today reads "${line}", not "You chose to start with ${name}"`);
  }
  await page.close();
}

/* 4. a played save: the week's close led by the furthest place; the Map's gold path */
{
  const page = await K.open('keys', '2026-10-08T09:00:00+01:00');
  const { tap, home } = K.helpers(page);
  await home();
  await tap(page.locator('button.icon-link', { hasText: /^Map$/i }).first(), 'the Map');
  if (!(await page.locator('svg path[stroke="#f2c170"]').count())) fails.push('the Map has no gold path along the way walked');
  await home();
  const daybook = page.locator('.foot').getByRole('button', { name: 'Daybook', exact: true });
  if (await daybook.count()) {
    await tap(daybook, 'the Daybook');
    if (!(await page.locator('.reached').count())) fails.push('the week\'s close does not lead with the furthest place');
  }
  await page.close();
}

await K.end('improve8');
