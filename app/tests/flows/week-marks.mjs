// A recurring job's week (Dan, 2026-10-02/03): Gym (4 times a week) shows its sessions as notches under its row on Today
// and in the Satchel, "3 of 4 this week" for VoiceOver; once its fourth is done it is off Today the next day, and still in
// the Satchel; a rhythm reads "4 times a week", never "4 a week". SHOTS=<dir> saves pictures.
// Usage: node tests/flows/week-marks.mjs URL [w h]
import { kit } from './kit.mjs';
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const { open, helpers, fails, end } = await kit(url, w, h);
const shot = async (page, name) => { if (shots) { await page.waitForTimeout(800); await page.screenshot({ path: `${shots}/week-${name}-${w}.png` }); } };
const gymRow = page => page.locator('.rows .row', { has: page.locator('.t', { hasText: /^Gym/ }) }).first();
const marks = async page => {
  const r = gymRow(page);
  if (!(await r.count())) return null;
  return { all: await r.locator('.marks i').count(), lit: await r.locator('.marks i.on').count(), text: (await r.textContent()) ?? '' };
};

/* Wednesday, its third done today: Gym on Today with four notches, three lit */
{
  const page = await open('gym3', '2026-09-30T11:00:00+01:00');
  const m = await marks(page);
  if (!m) fails.push('Wednesday: no Gym on Today at 3 of 4');
  else {
    if (m.all !== 4 || m.lit !== 3) fails.push(`Wednesday: Gym shows ${m.lit} of ${m.all} notches lit, not 3 of 4`);
    if (!m.text.includes('3 of 4 this week')) fails.push('Wednesday: Gym\'s row doesn\'t say "3 of 4 this week" to VoiceOver');
  }
  await shot(page, '1-today-3of4');
  const { btn } = helpers(page);
  await btn('Satchel').click(); await page.clock.runFor(1200);
  if (!(await page.getByText('4 times a week').count())) fails.push('the Satchel doesn\'t say "4 times a week"');
  if (await page.getByText(/\b\d a week\b/).count()) fails.push('"N a week" is said in the Satchel');
  const s = await marks(page);
  if (!s || s.all !== 4 || s.lit !== 3) fails.push(`the Satchel: Gym shows ${s?.lit} of ${s?.all} notches lit, not 3 of 4`);
  const recurring = page.locator('.label-line', { hasText: 'Recurring jobs' });
  await recurring.scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, '2-satchel-3of4');
  await page.close();
}
/* Thursday, the fourth done today: still on Today, its diamond gold, all four notches lit */
{
  const page = await open('gym4', '2026-10-01T11:00:00+01:00');
  const m = await marks(page);
  if (!m || m.lit !== 4) fails.push(`Thursday after the fourth: Gym ${m ? `shows ${m.lit} lit` : 'is off Today'}`);
  if (!(await gymRow(page).locator('.pip.done').count())) fails.push('Thursday after the fourth: Gym\'s diamond isn\'t lit');
  await shot(page, '3-today-4of4');
  await page.close();
}
/* Friday: off Today; in the Satchel with four lit */
{
  const page = await open('gym4', '2026-10-02T09:00:00+01:00');
  if (await gymRow(page).count()) fails.push('Friday: Gym is still on Today with its 4 of 4 done');
  await shot(page, '4-today-friday');
  const { btn } = helpers(page);
  await btn('Satchel').click(); await page.clock.runFor(1200);
  const s = await marks(page);
  if (!s || s.lit !== 4) fails.push(`Friday: the Satchel's Gym ${s ? `shows ${s.lit} lit` : 'is missing'}`);
  await page.close();
}
/* the next week: offered again, nothing lit (on Today on the days its plan gives it, and in the Satchel) */
{
  const page = await open('gym4', '2026-10-05T09:00:00+01:00');
  const { btn, home } = helpers(page);
  /* three days away: the welcome back first */
  for (let k = 0; k < 4 && !(await page.locator('nav.foot').count()); k++) { if (await btn('Back to Today').count()) await btn('Back to Today').click(); else await home(); await page.clock.runFor(1500); }
  const m = await marks(page);
  if (m && (m.lit !== 0 || m.all !== 4)) fails.push(`Monday: Gym shows ${m.lit} of ${m.all} lit, not 0 of 4`);
  await shot(page, '5-today-monday');
  await btn('Satchel').click(); await page.clock.runFor(1200);
  const s = await marks(page);
  if (!s || s.lit !== 0) fails.push(`Monday: the Satchel's Gym ${s ? `shows ${s.lit} lit` : 'is missing'}`);
  await page.close();
}
await end('week marks');
