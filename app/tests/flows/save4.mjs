// The save after the deep review (D-147, Stage 4): a save from a newer version of the app opens on a screen that says so
// and is never written over; Restore tries a file on the rules before writing it and refuses one the game can't run,
// changing nothing; a good copy still restores.
// Usage: node tests/flows/save4.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;

/* 1. a save from a newer version */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const newer = JSON.stringify({ version: 99, content: 'later', facts: [{ seq: 1, at: '2026-09-29T09:00:00+01:00', day: '2026-09-29', type: 'opened', more: true }] });
  await page.evaluate(s => localStorage.setItem('save.v1', s), newer);
  const { reload, btn } = K.helpers(page);
  await reload();
  if (!(await page.getByText(/newer version of the app/).count())) fails.push('a newer save does not say "update it"');
  if (!(await btn('Save a copy of it').count())) fails.push('no "Save a copy of it" for a save this build can\'t read');
  await page.clock.runFor(70_000);
  if ((await page.evaluate(() => localStorage.getItem('save.v1'))) !== newer) fails.push('the newer save was written over');
  await page.close();
}

/* 1b. a broken save: kept, never a newer one, so it has a way on: a new game, the broken save kept aside (fresh review) */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const broken = '{"version": 2, "facts": [oops';
  /* yesterday's good backup beside it: offered, and never put over by the broken save (re-review) */
  const good = JSON.stringify({ version: 2, content: 'x', facts: [{ seq: 1, at: '2026-09-29T09:00:00+01:00', day: '2026-09-29', type: 'opened' }] });
  await page.evaluate(([s, g]) => { localStorage.setItem('save.v1', s); localStorage.setItem('save.v1.backup', g); localStorage.setItem('save.v1.backupDay', '2026-09-29'); }, [broken, good]);
  const { reload, btn, tap, onToday } = K.helpers(page);
  await reload();
  if (!(await page.getByText(/can’t be read by this version/).count())) fails.push('a broken save does not say so');
  if (!(await btn('Carry on from yesterday’s backup').count())) fails.push('a broken save does not offer yesterday\'s backup');
  if (!(await btn('Start a new game (this save stays kept)').count())) fails.push('a broken save has no way on');
  else {
    await tap('Start a new game (this save stays kept)');
    if (!(await onToday())) fails.push('a new game from a broken save did not reach Today');
    const kept = await page.evaluate(b => Object.keys(localStorage).some(k => k.startsWith('save.v1.kept.') && localStorage.getItem(k) === b), broken);
    if (!kept) fails.push('the broken save was not kept aside');
    await page.clock.runFor(70_000);
    if ((await page.evaluate(() => localStorage.getItem('save.v1.backup'))) !== good) fails.push('the good backup was written over after a new game');
  }
  await page.close();
}

/* 2. Restore: a broken file is refused, nothing changes; a good copy restores */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const { tap, btn, home, facts } = K.helpers(page);
  await home();
  const before = JSON.stringify(await facts());
  const offer = async text => {
    await tap(page.locator('button.gear'), 'Settings');
    const chooser = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
    await tap(btn('Restore from a copy'), 'Restore from a copy');
    const fc = await chooser;
    if (!fc) { fails.push('no file chooser for Restore'); return; }
    await fc.setFiles({ name: 'copy.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await page.clock.runFor(1200); await page.waitForTimeout(300);
  };
  await offer(JSON.stringify({ version: 2, content: 'x', facts: [null] }));
  if (!(await page.getByText('That file is not a save this app can read. Nothing was changed.').count())) fails.push('a broken file was not refused');
  if (JSON.stringify(await facts()) !== before) fails.push('a refused file changed the save');
  await home();
  /* a good copy: the save as it is, one day on */
  const good = await page.evaluate(() => localStorage.getItem('save.v1'));
  await offer(good);
  if (!(await btn('Restore it').count())) fails.push('a good copy was not offered to restore');
  else {
    await tap(btn('Restore it'), 'Restore it');
    if (!(await page.getByText('The copy is restored.').count())) fails.push('the good copy did not restore');
  }
  await page.close();
}

await K.end('save4');
