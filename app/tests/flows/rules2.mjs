// The deep review's rule fixes as Dan meets them (D-147, Stage 2): the tick sheet offers 5 and 10 minutes; a job ticked
// at 3 h by mistake, "Not done after all", says plainly that the 3 h were taken back and what makes them up, the flame
// staying put; after days away the welcome back asks about every appointment that went by, in one list.
// Usage: node tests/flows/rules2.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;

/* 1. ticks: 5 and 10; a 3 h tick taken back */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const { btn, tap, has, home, addJob, facts } = K.helpers(page);
  await home();
  await addJob('Sort the receipts');
  const circle = page.getByRole('button', { name: 'Sort the receipts: tick off', exact: true });
  await tap(circle, 'the tick circle');
  for (const c of ['5 min', '10 min']) if (!(await page.locator('.sheet .chip', { hasText: new RegExp(`^${c}$`) }).count())) fails.push(`the tick sheet has no ${c}`);
  await tap(page.locator('.sheet .chip', { hasText: /^3 h$/ }), '3 h', 1500);
  await home();
  const walked = async () => (await facts()).filter(f => f.type === 'stepsGained').reduce((a, f) => a + f.minutes, 0);
  const road = async () => (await page.locator('.where').getAttribute('aria-label').catch(() => '')) ?? '';
  const before = await road();
  const undo = page.getByRole('button', { name: 'Sort the receipts: not done after all', exact: true });
  if (!(await undo.count())) fails.push('no "Not done after all" on the ticked job');
  else {
    await undo.first().evaluate(e => e.click()); await page.clock.runFor(900);
    const said = (await page.locator('.said.owed').textContent().catch(() => ''))?.trim() ?? '';
    if (!/^The 3 h were taken back: the next 3 h make them up\.$/.test(said)) fails.push(`the taken-back line reads "${said}"`);
    if ((await road()) !== before) fails.push('the road line moved back after "Not done after all"');
    if (!(await facts()).some(f => f.type === 'tickTakenBack' && f.minutes === 180)) fails.push('the 3 h were not taken back');
    /* ticked again at 30 min: 2 h 30 left */
    await tap(page.getByRole('button', { name: 'Sort the receipts: tick off', exact: true }), 'the tick circle again');
    await tap(page.locator('.sheet .chip', { hasText: /^30 min$/ }), '30 min', 1500);
    await home();
    const again = (await page.locator('.said.owed').textContent().catch(() => ''))?.trim() ?? '';
    if (!/the next 2 h 30 min make them up/.test(again)) fails.push(`after a tick of 30 min the line reads "${again}"`);
    if ((await walked()) !== 210) fails.push(`the log's minutes are ${await walked()}, not 210`);
  }
  void btn; void has;
  await page.close();
}

/* 2. back after days away: every appointment that went by, in one list */
{
  const page = await K.open(null, '2026-09-28T09:00:00+01:00');
  const { tap, home, btn, ff, reload } = K.helpers(page);
  await home();
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('save.v1'));
    let seq = raw.facts.at(-1).seq;
    const at = raw.facts.at(-1).at, day = raw.facts.at(-1).day;
    let n = raw.facts.filter(f => f.type === 'itemAdded').length;
    for (const [name, d, time] of [['Haircut', '2026-09-30', '10:00'], ['Dentist', '2026-10-01', '15:00']]) {
      const id = `it-${++n}`;
      raw.facts.push({ seq: ++seq, at, day, type: 'itemAdded', id, name });
      raw.facts.push({ seq: ++seq, at, day, type: 'planAdded', entry: { id: `pa-x${n}`, job: id, day: d, time } });
    }
    localStorage.setItem('save.v1', JSON.stringify(raw));
  });
  await reload();
  await ff(6 * 86_400_000);
  await reload();
  if (!(await page.getByText('Went by · still needed?').count())) fails.push('the welcome back has no "Went by · still needed?" list');
  for (const n of ['Haircut', 'Dentist']) if (!(await page.locator('.appts li', { hasText: n }).count())) fails.push(`the welcome back does not ask about ${n}`);
  const li = page.locator('.appts li', { hasText: 'Haircut' });
  await tap(li.getByRole('button', { name: 'Put it on today', exact: true }), 'Put it on today');
  if (await page.locator('.appts li', { hasText: 'Haircut' }).count()) fails.push('the answered appointment stayed in the list');
  void btn;
  await page.close();
}

await K.end('rules2');
