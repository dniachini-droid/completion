// Hands-on review: on each screen, does the phone's back land where the arrow says? Paths from Today, in the keys save. Review only.
import { readFileSync } from 'node:fs';
import { open } from './deep-hands-lib.mjs';
const save = readFileSync(new URL('../flows/saves/keys.json', import.meta.url), 'utf8');
const H = await open({ w: 390, h: 844, tag: 'back', save, at: '2026-10-08T09:00:00+01:00' });
const { page } = H;
const title = () => page.evaluate(() => (document.querySelector('nav.foot') ? 'Today' : document.querySelector('.rs') ? 'set:' + document.querySelector('.rs h1')?.textContent.trim() : (document.querySelector('.ui h1, h1')?.textContent.trim() ?? '?')).slice(0, 30));
const PATHS = [
  ['Satchel', 'Recurring jobs row Course'], ['Week', 'Next week'], ['Week', 'row Course', 'Edit'], ['Map', 'Read again'], ['Records', 'Symbols'],
  ['Daybook', 'Settings'], ['Settings'], ['row Course', 'Edit'], ['place'], ['Satchel', 'Errand run'],
];
const go = async step => {
  if (step === 'place') return H.tap(page.locator('button.here'), 'place');
  if (step.startsWith('row ')) return H.tap(page.locator('button.row', { hasText: step.slice(4) }).first(), step);
  if (step === 'Recurring jobs row Course') return H.tap(page.locator('button.row', { hasText: 'Course' }).last(), step);
  if (step === 'Read again') return H.tap(page.getByRole('button', { name: /^Read (it )?again/ }).first(), step);
  return H.tap(page.getByRole('button', { name: step, exact: true }).first(), step);
};
for (const p of PATHS) {
  await H.toToday();
  const seen = [];
  for (const s of p) { await go(s); seen.push(await title()); }
  /* back all the way, comparing arrow and destination */
  const out = [];
  for (let i = 0; i < 5 && !(await H.onToday()); i++) {
    const before = await title(), says = await H.arrow();
    await page.evaluate(() => history.back()); await page.clock.runFor(1200); await page.waitForTimeout(80);
    const after = await title();
    out.push(`${before} —arrow "${says}"→ back lands ${after}`);
  }
  H.say(`PATH ${p.join(' > ')}: ${seen.join(' > ')}\n   ` + out.join('\n   '));
}
await H.close();
