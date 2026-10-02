// Three weeks as Dan, part 5: Monday 19 to Monday 26 October, the clocks going back on Sunday 25 (Europe/London).
// From deep-weeks-4's save. Review only.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-19T08:10:00+01:00', from: 'save-w3-mon-open.json' });
const S = (s) => D.say(R, s);
const fromRow = async (job) => (await D.todayRow(R, job).count()) ? 'today' : 'satchel';
const at = async (iso) => { await L.hide(R, true); await R.page.clock.setSystemTime(new Date(iso)); await R.page.clock.runFor(500); await L.hide(R, false); await R.page.clock.runFor(1500); await R.page.waitForTimeout(150); };

/* ===== Mon 19: light; the avoided job, "I can't start" ===== */
S('MON 19 OCT: light');
await D.through(R, 'w3-mon-0810-waits');
await D.today(R, 'w3-mon-0810');
await D.menu(R, 'Order the cat’s medication', 'I can’t start', 'w3-mon-cat');
await D.look(R, 'w3-mon-cant', { full: true });
if (await D.has(R, 'Try ten minutes?')) await D.press(R, 'Try ten minutes?');
else { const b = R.page.locator('.ui button.btn').first(); if (await b.count()) await L.tap(R, b, 'the cant-start button'); }
await D.look(R, 'w3-mon-cant-2');
if (await R.page.locator('.rs').count()) await D.press(R, 'Begin');
await D.pass(R, 10); await R.page.clock.runFor(2000);
await D.through(R, 'w3-mon-cat-end', { ask: 'Not yet' });
await D.today(R, 'w3-mon-0825');
await L.toClock(R, 0, 18, 0);
await D.delve(R, 'Course', { min: 25, n: 2, tag: 'w3-mon-course', key: 'keep', from: await fromRow('Course') });
await D.today(R, 'w3-mon-1900');
await D.later(R, 0, 22, 45); await D.today(R, 'w3-mon-2245');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');

/* ===== Tue 20: the monthly bill; gym; Not today ===== */
S('TUE 20 OCT: the bill');
await D.reopen(R, 1, 7, 50);
await D.through(R, 'w3-tue-waits');
await D.today(R, 'w3-tue-0750');
await D.tick(R, 'Pay the credit card', '15 min', 'w3-tue-bill', { key: 'keep', from: await fromRow('Pay the credit card') });
await D.today(R, 'w3-tue-0755');
await D.notToday(R, 'Sort the post', 'w3-tue-post');
await D.today(R, 'w3-tue-0756-post-aside');
await D.later(R, 0, 18, 30);
await D.delve(R, 'Gym, then the sauna', { min: 60, n: 1, tag: 'w3-tue-gym', key: 'keep', from: await fromRow('Gym') });
await D.today(R, 'w3-tue-1935');

/* ===== Wed 21: hard day ===== */
S('WED 21 OCT: hard day');
await D.reopen(R, 1, 8, 45);
await D.through(R, 'w3-wed-waits');
await D.today(R, 'w3-wed-0845');
await D.addJob(R, 'Write the newsletter');
await L.toClock(R, 0, 9, 0);
await D.delve(R, 'Write the newsletter', { min: 90, n: 3, tag: 'w3-wed-news', ask: 'Not yet' });
await D.today(R, 'w3-wed-1345');
await L.toClock(R, 0, 14, 30);
await D.tick(R, 'Tank clean', '1 h', 'w3-wed-tank', { key: 'keep', from: await fromRow('Tank clean') });
await L.toClock(R, 0, 16, 0);
await D.delve(R, 'Spanish study', { min: 60, n: 1, tag: 'w3-wed-spanish', key: 'keep', from: await fromRow('Spanish study') });
await D.today(R, 'w3-wed-1705');
await L.toClock(R, 0, 20, 0);
await D.delve(R, 'Write the newsletter', { min: 45, n: 1, tag: 'w3-wed-news2', ask: 'Not yet' });
await D.today(R, 'w3-wed-2050');
/* a Key, chosen on the Map */
if (await D.has(R, 'Use one on the Map') || await D.has(R, 'Use it on the Map')) {
  await D.press(R, (await D.has(R, 'Use one on the Map')) ? 'Use one on the Map' : 'Use it on the Map');
  await D.look(R, 'w3-wed-map', { full: true });
  const u = R.page.locator('button.use:not(.again)'); S('Use a Key on the Map: ' + await u.count());
  if (await u.count()) { await L.tap(R, u.first(), 'Use a Key'); await D.look(R, 'w3-wed-opened', { full: true }); S('opened screen arrow: ' + await R.page.locator('button.home').first().innerText().catch(() => '?')); }
} else if (await D.has(R, 'Use one here') || await D.has(R, 'Use it here')) {
  await D.press(R, (await D.has(R, 'Use one here')) ? 'Use one here' : 'Use it here'); await D.look(R, 'w3-wed-map-here', { full: true });
  const u = R.page.locator('button.use:not(.again)'); S('Use a Key here: ' + await u.count());
  if (await u.count()) { await L.tap(R, u.first(), 'Use a Key'); await D.look(R, 'w3-wed-opened', { full: true }); }
}
await D.today(R, 'w3-wed-2100');

/* ===== Thu 22: the lesson; Fri 23 light ===== */
S('THU 22 OCT');
await D.reopen(R, 1, 17, 45);
await D.through(R, 'w3-thu-waits');
await D.today(R, 'w3-thu-1745');
await D.later(R, 0, 19, 10);
await D.tick(R, 'Spanish lesson', '1 h', 'w3-thu-lesson', { key: 'keep' });
await D.today(R, 'w3-thu-1915');
S('FRI 23 OCT');
await D.reopen(R, 1, 12, 0);
await D.through(R, 'w3-fri-waits');
await D.today(R, 'w3-fri-1200');
await D.tick(R, 'Gym, then the sauna', '1 h', 'w3-fri-gym', { key: 'keep', from: await fromRow('Gym') });
await D.today(R, 'w3-fri-1205');
await D.keep(R, 'save-w3-fri.json');

/* ===== Sat 24 → Sun 25: the clocks go back at 02:00 BST (01:00 GMT) ===== */
S('SAT 24 OCT: late night across the clock change');
await at('2026-10-24T22:00:00+01:00');
await D.through(R, 'w3-sat-waits');
await D.today(R, 'w3-sat-2200');
await at('2026-10-25T01:15:00+01:00');
await D.today(R, 'w3-sat-0115bst');
/* 90 minutes from 01:15 BST: the clock reads 02:00 → 01:00 on the way; it ends at 01:45 GMT */
await D.delve(R, 'Write the newsletter', { min: 90, n: 1, tag: 'w3-sat-news-dst', ask: 'Done', from: await fromRow('Write the newsletter') });
S('after the 90-minute delve across the change: ' + await D.now(R));
await D.today(R, 'w3-sat-0145gmt');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w3-sat-sleep', { full: true });
/* a second delve begun 03:30 GMT, across 04:00 */
await at('2026-10-25T03:30:00Z');
await D.today(R, 'w3-sat-0330gmt');
await D.delve(R, 'Course', { min: 60, n: 1, tag: 'w3-sat-course-0330', key: 'keep', from: await fromRow('Course') });
await D.today(R, 'w3-sun-0430gmt');

/* ===== Sun 25: gym, meal prep, Tonight ===== */
S('SUN 25 OCT (GMT)');
await at('2026-10-25T10:00:00Z');
await D.through(R, 'w3-sun-waits');
await D.today(R, 'w3-sun-1000');
await D.delve(R, 'Gym, then the sauna', { min: 60, n: 1, tag: 'w3-sun-gym', key: 'keep', from: await fromRow('Gym') });
await D.tick(R, 'Meal prep', '1 h', 'w3-sun-meal', { key: 'keep', from: await fromRow('Meal prep') });
await D.today(R, 'w3-sun-1210');
await at('2026-10-25T22:30:00Z');
await D.today(R, 'w3-sun-2230');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w3-sun-sleep', { full: true });
await D.keep(R, 'save-w3-sun.json');

/* ===== Mon 26: week 3 close ===== */
S('MON 26 OCT: week 3 close');
await R.page.clock.setSystemTime(new Date('2026-10-26T08:00:00Z')); await R.page.reload(); await R.page.clock.runFor(1500); await L.drawn(R);
for (let k = 0; k < 4 && !(await D.onToday(R)); k++) { await D.look(R, `w4-mon-open-${k}`, { full: true }); if (await D.has(R, 'Not now')) await D.press(R, 'Not now'); else await L.tap(R, R.page.locator('button.home').first(), 'arrow'); }
await D.today(R, 'w4-mon-0800');
await D.home(R); await L.tap(R, D.foot(R, 'Daybook'), 'Daybook'); await D.look(R, 'w4-mon-daybook', { full: true });
await D.keep(R, 'save-w4-mon.json');
await D.done(R, 'week 3');
