// Three weeks as Dan, part 3: the week close on Monday 12 October, a hard Monday, then four days away (Wed 14 to Sat
// 17) and back on Sunday 18; the second week close on Monday 19. From deep-weeks-2's save. Review only.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-12T07:30:00+01:00', from: 'save-w1-sun.json' });
const S = (s) => D.say(R, s);
const fromRow = async (job) => (await D.todayRow(R, job).count()) ? 'today' : 'satchel';

/* ===== Mon 12 Oct: the week close ===== */
S('MON 12 OCT: week close');
await D.look(R, 'w2-mon-0730-open', { full: true });
if (await D.has(R, 'Look ahead')) {
  await D.press(R, 'Look ahead'); await D.look(R, 'w2-mon-look1', { full: true });
  for (let k = 0; k < 6 && (await D.has(R, 'Keep')); k++) { await D.press(R, 'Keep'); await D.look(R, `w2-mon-look-still-${k}`, { full: true }); }
  if (await D.has(R, 'Skip')) await D.press(R, 'Skip');
  await D.look(R, 'w2-mon-look2', { full: true });
  if (await D.has(R, 'Next')) await D.press(R, 'Next');
  await D.look(R, 'w2-mon-look3', { full: true });
  const tax = R.page.locator('button.row', { hasText: 'Tax return' }); if (await tax.count()) await L.tap(R, tax.first(), 'Tax return'); else R.fails.push('Tax return not offered as what matters most');
  await D.look(R, 'w2-mon-look-done', { full: true });
  S('after the look-ahead the arrow says: ' + await R.page.locator('button.home').first().innerText().catch(() => '?'));
} else R.fails.push('no Daybook page with Look ahead on Monday 12');
await D.today(R, 'w2-mon-0735');
await D.home(R); await L.tap(R, D.foot(R, 'Daybook'), 'Daybook'); await D.look(R, 'w2-mon-daybook-again', { full: true });
await D.toWeek(R); await D.look(R, 'w2-mon-week', { full: true });
/* a haircut on Friday at 10:00 (in the days away), a birthday card wanted by Wednesday */
{ const fri = R.page.getByRole('button', { name: /^Add to Fri/ }).first(); await L.tap(R, fri, 'Add to Fri', 400); await R.page.keyboard.type('Haircut'); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(600);
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Haircut' }).first(), 'Haircut', 500);
  const ti = R.page.locator('.sheet input[type=time]'); if (await ti.count()) { await ti.fill('10:00'); await ti.dispatchEvent('change'); await R.page.clock.runFor(500); } else R.fails.push('no time box for the Haircut'); }
await D.toSatchel(R);
await R.page.locator('#satchel-box').fill('Send the birthday card'); await D.press(R, 'Save for later');
await D.press(R, 'Send the birthday card: edit'); await D.press(R, 'By'); await D.press(R, 'Change');
{ const d = R.page.getByRole('button', { name: /14 Oct/ }); if (await d.count()) await L.tap(R, d.first(), '14 Oct', 400); else R.fails.push('no 14 Oct'); }
await D.look(R, 'w2-mon-card-by', { full: true }); await D.press(R, 'Save');
await D.today(R, 'w2-mon-0800');
/* the hard day: 8 hours */
await L.toClock(R, 0, 8, 30);
await D.delve(R, 'Tax return', { min: 90, n: 2, tag: 'w2-mon-tax', ask: 'Done', from: await fromRow('Tax return') });
await D.today(R, 'w2-mon-1140');
await D.addJob(R, 'Prepare the slides');
await L.toClock(R, 0, 12, 0);
await D.delve(R, 'Prepare the slides', { min: 60, n: 2, tag: 'w2-mon-slides', ask: 'Not yet' });
await D.today(R, 'w2-mon-1410');
await L.toClock(R, 0, 14, 30);
await D.delve(R, 'Course', { min: 25, n: 2, tag: 'w2-mon-course', from: await fromRow('Course') });
await D.tick(R, 'Book passport photo', '30 min', 'w2-mon-passport', { from: await fromRow('Book passport photo') });
await D.today(R, 'w2-mon-1600');
await L.toClock(R, 0, 17, 0);
await D.delve(R, 'Gym, then the sauna', { min: 60, n: 1, tag: 'w2-mon-gym', key: 'keep', from: await fromRow('Gym') });
await L.toClock(R, 0, 19, 0);
await D.delve(R, 'Prepare the slides', { min: 60, n: 1, tag: 'w2-mon-slides2', ask: 'Done', from: await fromRow('Prepare the slides') });
await D.today(R, 'w2-mon-2005');
await L.toClock(R, 0, 21, 0);
await D.delve(R, 'Spanish study', { min: 60, n: 1, tag: 'w2-mon-spanish', key: 'keep', from: await fromRow('Spanish study') });
await D.today(R, 'w2-mon-2205');
await D.later(R, 1, 0, 30);
await D.today(R, 'w2-mon-0030-tue');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w2-mon-0031-sleep', { full: true });
await D.keep(R, 'save-w2-mon.json');

/* ===== Tue 13: not opened. Wed 14 – Sat 17: away. Sun 18 Oct: back ===== */
S('SUN 18 OCT: back after Tue + four days away');
await D.reopen(R, 6, 10, 30);   /* 00:30 Tuesday is still Monday’s game day: +6 is Sunday 18 */
await D.look(R, 'w2-sun-1030-open', { full: true });
S('first screen after the days away: ' + await L.screen(R));
await D.through(R, 'w2-sun-1030-waits');
await D.today(R, 'w2-sun-1031');
await D.keep(R, 'save-w2-sun-open.json');
await D.done(R, 'week 2 to Sunday');
