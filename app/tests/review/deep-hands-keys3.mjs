// Hands-on review: from the keys save, tick off the recurring jobs one after another and look at each return for "Use it here / Keep it". Review only.
import { readFileSync } from 'node:fs';
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844', choice = 'Use it here'] = process.argv;
const save = readFileSync(new URL('../flows/saves/keys.json', import.meta.url), 'utf8');
const H = await open({ w: +w, h: +h, tag: 'keys3', save, at: '2026-10-08T09:00:00+01:00' });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).filter(b => !/tick off|: not today|: delete|\[row/.test(b)).slice(0, 14).join('\n  ')); await H.shot(n); };
await H.toToday();
for (let day = 0; day < 6; day++) {
  const ticks = page.getByRole('button', { name: /: tick off$/ });
  const names = (await ticks.evaluateAll(bs => bs.map(b => b.getAttribute('aria-label').replace(/: tick off$/, ''))));
  H.say(`day ${day}: can tick ${names.join(', ')} keys=${await page.locator('button.keys').innerText().catch(() => '-')}`);
  for (const n of names.filter(n => /Course|Gym|Spanish study|Tank|Meal/.test(n))) {
    await H.tap(page.getByRole('button', { name: `${n}: tick off`, exact: true }), 'tick ' + n); await H.tap(H.btn('1 h'), '1 h'); await page.waitForTimeout(800);
    for (let i = 0; i < 8 && !(await H.onToday()); i++) {
      const txt = await H.text();
      if (/Key/.test(txt)) { await S(`d${day}-${n.slice(0, 6)}-${i}`); H.say('  KEY LINES: ' + txt.split('\n').filter(l => /Key/.test(l)).join(' | ')); }
      if (await H.has('Use it here') && await H.has('Keep it')) { await H.tap(H.btn(choice), choice); await S(`chose-${day}`); H.say('  AFTER CHOICE: ' + (await H.text()).split('\n').filter(l => /Key|used|keep/i.test(l)).join(' | ')); continue; }
      const guess = page.locator('.guess .opts button'); if (await guess.count()) { await H.tap(guess.first(), 'guess'); continue; }
      if (await H.has('Later')) { await H.tap(H.btn('Later'), 'Later'); continue; }
      const b = (await page.locator('button.btn').count()) ? page.locator('button.btn').first() : page.locator('button.home'); await H.tap(b, 'on', 1500);
    }
    await H.toToday();
  }
  /* next day */
  await page.clock.setSystemTime(new Date(`2026-10-${String(9 + day).padStart(2, '0')}T09:00:00+01:00`)); await page.clock.runFor(2000); await page.waitForTimeout(500);
  await H.toToday();
}
await H.close();
