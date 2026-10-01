// Three weeks as Dan, week 1: Monday 5 to Sunday 11 October 2026, from a fresh save. Review only.
// Usage (from app/, preview on 4184): node tests/review/deep-weeks-1.mjs
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-05T07:45:00+01:00' });
const S = (s) => D.say(R, s);

/* ===== Mon 5 Oct: set up, then a hard day ===== */
S('MON 5 OCT: fresh save, setting up');
await D.today(R, 'w1-mon-0745-first');
await D.toSatchel(R);
await D.press(R, 'Gym, then the sauna: edit'); await D.look(R, 'w1-mon-gym-editor', { full: true });
await D.press(R, 'Fewer'); await D.look(R, 'w1-mon-gym-3'); await D.press(R, 'Save');
await D.press(R, 'Course: edit'); await D.press(R, 'Fewer'); await D.press(R, 'Fewer'); await D.look(R, 'w1-mon-course-2'); await D.press(R, 'Save');
/* a monthly bill on the 20th, 15 minutes */
await D.press(R, 'Add a recurring job'); await R.page.locator('input.line').first().fill('Pay the credit card');
await D.press(R, 'Monthly');
for (let k = 0; k < 15; k++) await D.press(R, 'More', 150);
for (let k = 0; k < 4; k++) await D.press(R, 'Shorter', 150);
await D.look(R, 'w1-mon-bill-editor', { full: true }); await D.press(R, 'Save');
/* a one-off wanted by a date: "Book passport photo" (the editor's By: a week from today) */
await R.page.locator('#satchel-box').fill('Book passport photo'); await D.press(R, 'Save for later');
await D.press(R, 'Book passport photo: edit'); await D.press(R, 'By'); await D.look(R, 'w1-mon-passport-by', { full: true }); await D.press(R, 'Save');
/* a job waiting on someone */
await R.page.locator('#satchel-box').fill('Boiler repair'); await D.press(R, 'Save for later');
await D.look(R, 'w1-mon-satchel-after-setup', { full: true });
/* the dentist on Wednesday at 14:30, from the Week */
await D.toWeek(R); await D.look(R, 'w1-mon-week', { full: true });
const wed = R.page.getByRole('button', { name: /^Add to Wed/ }).first();
if (await wed.count()) { await L.tap(R, wed, 'Add to Wed', 400); await R.page.keyboard.type('Dentist'); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(600); }
else R.fails.push('no Add to Wednesday');
await L.tap(R, R.page.locator('.day button.row', { hasText: 'Dentist' }).first(), 'Dentist in the week', 500);
await D.press(R, 'Set a time').catch(() => {});
await D.look(R, 'w1-mon-dentist-sheet', { full: true });
const ti = R.page.locator('.sheet input[type=time]');
if (await ti.count()) { await ti.fill('14:30'); await ti.dispatchEvent('change'); await R.page.clock.runFor(500); } else R.fails.push('no time box for Dentist');
await D.look(R, 'w1-mon-week-dentist', { full: true });
/* Boiler repair: waiting on the landlord, from the Satchel's menu (hold) */
await D.toSatchel(R);
{
  const r = R.page.locator('.item', { hasText: 'Boiler repair' }).first().locator('button.row').first();
  const box = await r.boundingBox().catch(() => null);
  if (box) { await R.page.mouse.move(box.x + 60, box.y + box.height / 2); await R.page.mouse.down(); await R.page.waitForTimeout(700); await R.page.clock.runFor(700); await R.page.mouse.up(); await R.page.clock.runFor(400); }
  await D.look(R, 'w1-mon-boiler-menu');
  if (await D.has(R, 'Waiting on…')) { await D.press(R, 'Waiting on…'); await R.page.locator('input[placeholder^="Who or what"]').fill('the landlord'); await D.look(R, 'w1-mon-boiler-wait'); await L.tap(R, R.page.locator('.wait-soon'), 'Back on …'); }
  else R.fails.push('no Waiting on… in the Satchel menu');
  await D.look(R, 'w1-mon-satchel-wait', { full: true });
}
await D.today(R, 'w1-mon-0800-after-setup');

/* the work: a big report, 3 × 90 from 09:00 */
await L.toClock(R, 0, 9, 0);
await D.addJob(R, 'Write the quarterly report');
await D.today(R, 'w1-mon-0900-report-added');
await D.delve(R, 'Write the quarterly report', { min: 90, n: 3, tag: 'w1-mon-report1', ask: 'Not yet', stopAt: 'section 3, the figures' });
await D.today(R, 'w1-mon-1345-after-report1');
await L.toClock(R, 0, 14, 0);
await D.delve(R, 'Course', { min: 25, n: 2, tag: 'w1-mon-course', from: 'satchel' });
await D.today(R, 'w1-mon-1500');
await D.later(R, 0, 18, 45);
await D.tick(R, 'Gym, then the sauna', '1 h', 'w1-mon-gym-tick');
await D.today(R, 'w1-mon-1850');
await L.toClock(R, 0, 20, 0);
await D.delve(R, 'Write the quarterly report', { min: 60, n: 1, tag: 'w1-mon-report2', ask: 'Done' });
await D.today(R, 'w1-mon-2105');
await D.later(R, 0, 23, 30);
await D.today(R, 'w1-mon-2330-night');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w1-mon-2331-sleep', { full: true });
await D.keep(R, 'save-w1-mon.json');

/* ===== Tue 6 Oct: a light day, then a late night past midnight ===== */
S('TUE 6 OCT: light day');
await D.reopen(R, 1, 8, 40);
await D.look(R, 'w1-tue-0840-open', { full: true });
await D.through(R, 'w1-tue-0840-waits');
await D.today(R, 'w1-tue-0841');
await D.notToday(R, 'Order the cat’s medication', 'w1-tue-cat');
await D.today(R, 'w1-tue-0842-cat-aside');
await D.delve(R, 'Spanish study', { min: 30, n: 1, tag: 'w1-tue-spanish' });
await D.today(R, 'w1-tue-0915');
await D.home(R); await L.tap(R, D.btn(R, 'Map'), 'Map'); await D.look(R, 'w1-tue-map', { full: true });
await D.later(R, 0, 21, 30);
await D.today(R, 'w1-tue-2130');
/* past midnight: the course from 00:45 to 01:40 (still Tuesday's game day) */
await L.toClock(R, 0, 0, 45).catch(() => {});
await R.page.clock.setSystemTime(new Date('2026-10-07T00:45:00+01:00')); await R.page.clock.runFor(800);
await D.today(R, 'w1-tue-0045-wed');
const onToday = await D.todayRow(R, 'Course').count();
await D.delve(R, 'Course', { min: 25, n: 2, tag: 'w1-tue-course-late', from: onToday ? 'today' : 'satchel' });
await D.today(R, 'w1-tue-0140-after-course');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w1-tue-0141-sleep', { full: true });
await D.keep(R, 'save-w1-tue.json');

/* ===== Wed 7 Oct: the dentist at 14:30, an errand run, Spanish ===== */
S('WED 7 OCT: dentist, errands');
await D.reopen(R, 1, 10, 0);
await D.through(R, 'w1-wed-1000-waits');
await D.today(R, 'w1-wed-1000');
await D.later(R, 0, 15, 40);
await D.today(R, 'w1-wed-1540-dentist-went-by');
await D.tick(R, 'Dentist', '1 h', 'w1-wed-dentist');
await D.today(R, 'w1-wed-1545');
for (const e of ['Bank: pay in the cheque', 'Post the parcel', 'Buy stamps']) await D.addJob(R, e);
await D.today(R, 'w1-wed-1550-errands-added');
await D.home(R); await L.tap(R, D.btn(R, 'Errand run'), 'Errand run'); await D.look(R, 'w1-wed-errand-pick', { full: true });
for (const e of ['Bank: pay in the cheque', 'Post the parcel', 'Buy stamps']) { const c = R.page.getByRole('checkbox', { name: `${e}: take it on the run` }); if (await c.count()) await L.tap(R, c, e, 300); else R.fails.push('no errand pick ' + e); }
await D.look(R, 'w1-wed-errand-picked', { full: true });
await D.press(R, 'Start the run');
await D.setUp(R, 45, 1); await D.look(R, 'w1-wed-errand-set'); await D.press(R, 'Begin');
await D.pass(R, 20);
{ const b = R.page.locator('ul.list button', { hasText: 'Bank' }); if (await b.count()) await L.tap(R, b, 'strike Bank', 400); }
await D.look(R, 'w1-wed-errand-in', { full: true });
await D.pass(R, 15);
await D.press(R, 'Finish here');
await D.through(R, 'w1-wed-errand-end', { struck: ['Post the parcel'] });
await D.today(R, 'w1-wed-1630');
await L.toClock(R, 0, 19, 0);
await D.delve(R, 'Spanish study', { min: 60, n: 1, tag: 'w1-wed-spanish', from: (await D.todayRow(R, 'Spanish study').count()) ? 'today' : 'satchel' });
await D.today(R, 'w1-wed-2005');
await D.later(R, 0, 22, 50); await D.today(R, 'w1-wed-2250');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w1-wed-2251-sleep');
await D.keep(R, 'save-w1-wed.json');
await D.done(R, 'week 1 Mon-Wed');
