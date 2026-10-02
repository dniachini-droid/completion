// Hands-on review: the set-up's parts drawn over each other (name, notes, dial labels, "90 · one long delve", the road heading), by size and name. Review only.
import { open } from './deep-hands-lib.mjs';
const cases = [[360, 780, 'Course', ''], [390, 844, 'Course', ''], [360, 780, 'Order the cat', 'note'], [390, 844, 'Order the cat', 'note'], [430, 932, 'Order the cat', 'note'], [360, 780, 'Write to the council about the broken streetlight', ''], [390, 844, 'Write to the council about the broken streetlight', 'note'], [430, 932, 'Write to the council about the broken streetlight', 'note']];
for (const [w, h, job, note] of cases) {
  const H = await open({ w, h, tag: 'setlap' });
  const { page } = H;
  await H.toToday();
  if (job.startsWith('Write')) { await H.tap(H.btn('Add a job'), 'Add'); await page.locator('input').first().fill(job + ' on Hollybush Lane'); await page.keyboard.press('Enter'); await page.clock.runFor(1500); await H.toToday(); }
  if (note) { for (let k = 0; k < 3 && !(await page.locator('.rs').count()); k++) await H.tap(page.locator('.rows button.row', { hasText: job }).first(), job); await H.tap('Begin'); await page.clock.runFor(120000); await H.tap('Finish here'); await H.tap(H.btn('Not yet'), 'Not yet'); await page.locator('input').first().fill('page 42 where the diagrams start'); await H.tap(page.locator('button.home'), 'arrow'); await H.toToday(); }
  for (let k = 0; k < 3 && !(await page.locator('.rs').count()); k++) await H.tap(page.locator('.rows button.row', { hasText: job }).first(), job);
  await page.waitForTimeout(1500);
  const laps = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.rs h1, .rs .job p, .rs .stop, .rs .stop.long, .rs .run h2, .rs .route .lbl, .rs .route span, .rs .count .n, .rs .inner')].filter(e => e.getBoundingClientRect().height > 2);
    const out = [];
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      if (els[i].contains(els[j]) || els[j].contains(els[i])) continue;
      const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 4 && oy > 3) out.push(`${els[i].tagName.toLowerCase()}.${els[i].className.split(' ')[0]} "${els[i].textContent.trim().slice(0, 14)}" × ${els[j].tagName.toLowerCase()}.${els[j].className.split(' ')[0]} "${els[j].textContent.trim().slice(0, 14)}" (${Math.round(oy)}px)`);
    }
    return out;
  });
  console.log(`${w}x${h} ${job.slice(0, 20)} ${note}: ${laps.length ? laps.join(' | ') : 'no overlaps'}`);
  await H.shot(`${job.slice(0, 5)}-${note}`);
  await H.close();
}
