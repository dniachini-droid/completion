// What a tap writes is kept (deep review, Stage 1: U1, U5). A screen that closes never wipes what the same tap saved:
// the Daybook's Look ahead → pin a job (the pin and the replan survive a reload), its Plan it for me (the offer stays
// answered), and Not yet with where he stopped → Back to today (lands on Today, the end never asked again). A word
// left for later stays a quiet line on Today after the app is closed and opened again.
// Usage: node tests/flows/kept.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;

/* 1. Not yet, where he stopped, Back to today */
{
  const page = await K.open(null, '2026-10-05T09:00:00+01:00');
  const { btn, tap, has, onToday, facts, home, ff, reload, addJob, row } = K.helpers(page);
  await addJob('Big job');
  await tap(row('Big job'), 'the Big job row');
  const stop = page.locator('.rs button.stop[aria-label="15 minutes"]');
  if (await stop.count()) await tap(stop, '15 min', 500);
  await tap('Begin');
  for (let m = 0; m < 17; m += 4) await ff(4 * 60_000);
  await page.clock.runFor(2000);
  if (!(await has('Not yet'))) fails.push('the delve\'s end has no Not yet');
  else {
    await tap('Not yet');
    const box = page.locator('input.line.stop');
    if (!(await box.count())) fails.push('no "Where did you stop?" box after Not yet');
    else {
      await box.fill('page 4');
      const n = (await facts()).length;
      await tap(btn('Back to today').last(), 'Back to today');
      await page.clock.runFor(1500);
      const f = await facts();
      if (f.length < n) fails.push(`the save shrank after Back to today (${n} → ${f.length})`);
      if (!f.some(x => x.type === 'jobSaved' && x.job?.note === 'page 4')) fails.push('the note was not kept');
      if (!f.slice(n).some(x => x.type === 'seen' && x.what === 'step')) fails.push('the delve\'s end was not kept as seen');
      await home();
      if (!(await onToday())) fails.push('Back to today did not land on Today');
      await reload();
      if (await page.locator('.dv').count()) fails.push('after a reload the delve\'s end asked again');
    }
  }
  await page.close();
}

/* 2. the Daybook's Look ahead → pin a job; and Plan it for me */
for (const mode of ['pin', 'plan']) {
  const page = await K.open('keys', '2026-10-11T09:00:00+01:00');
  const { btn, tap, has, facts, home, reload } = K.helpers(page);
  await home();
  const pageLine = btn('A page was written for you · Daybook');
  if (!(await pageLine.count())) { fails.push(`[${mode}] Today has no Daybook page line`); await page.close(); continue; }
  await tap(pageLine, 'the page line');
  const n = (await facts()).length;
  if (mode === 'pin') {
    await tap('Look ahead');
    for (let k = 0; k < 12; k++) {
      if (await has('Keep')) { await tap('Keep'); continue; }
      const nx = page.locator('.offer button.next'); if (await nx.count()) { await tap(nx, 'Next'); continue; }
      break;
    }
    const pick = page.locator('.offer .rows button.row').first();
    if (!(await pick.count())) { fails.push('Look ahead offered nothing to pin'); await page.close(); continue; }
    await tap(pick, 'a job to pin');
    await page.clock.runFor(1500);
    let f = await facts();
    if (f.length < n) fails.push(`[pin] the save shrank (${n} → ${f.length})`);
    for (const t of ['weekPinned', 'offerAnswered', 'closeRead']) if (!f.slice(n).some(x => x.type === t)) fails.push(`[pin] ${t} was not kept`);
    await reload();
    f = await facts();
    if (!f.slice(n).some(x => x.type === 'weekPinned')) fails.push('[pin] the pin did not survive a reload');
  } else {
    if (!(await has('Plan it for me'))) { fails.push('no Plan it for me'); await page.close(); continue; }
    await tap('Plan it for me');
    await page.clock.runFor(1500);
    const f = await facts();
    if (f.length < n) fails.push(`[plan] the save shrank (${n} → ${f.length})`);
    for (const t of ['offerAnswered', 'closeRead']) if (!f.slice(n).some(x => x.type === t)) fails.push(`[plan] ${t} was not kept`);
  }
  await page.close();
}

/* 3. the word left for later, then the app closed and opened again */
{
  const page = await K.open('word', '2026-10-06T11:05:00+01:00');
  const { btn, tap, onToday, home, reload } = K.helpers(page);
  for (let k = 0; k < 4 && !(await btn('Later').count()); k++) { const way = (await btn('See where you are').count()) ? btn('See where you are') : page.locator('button.btn').first(); await tap(way, 'on to the word'); }
  if (!(await btn('Later').count())) fails.push('the word\'s screen did not come');
  else {
    await btn('Later').click(); await page.clock.runFor(1200);
    await home();
    await reload();
    if (await page.locator('button.rodbtn').count()) fails.push('after a restart the word was forced again');
    await home();
    if (!(await onToday())) fails.push('not on Today after the restart');
    if (!(await btn('A word waits to be cut').count())) fails.push('after a restart Today has no "A word waits to be cut"');
  }
  await page.close();
}

await K.end('kept');
