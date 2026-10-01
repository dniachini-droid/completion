// Three weeks as Dan, part 4: Sunday 18 October after the days away, the cut, and the week close on Monday 19.
// From deep-weeks-3's save. Review only.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-18T10:40:00+01:00', from: 'save-w2-sun-open.json' });
const S = (s) => D.say(R, s);
const fromRow = async (job) => (await D.todayRow(R, job).count()) ? 'today' : 'satchel';
S('SUN 18 OCT (cont.): reopened ten minutes later');
await D.look(R, 'w2-sun-1040-reopen', { full: true });
S('first screen on reopening: ' + await L.screen(R) + (await R.page.locator('.cut').count() ? ' (the word screen again)' : ''));
await D.toSatchel(R); await D.look(R, 'w2-sun-satchel', { full: true });
await D.toWeek(R); await D.look(R, 'w2-sun-week', { full: true });
await D.home(R);
/* the boiler: done */
if (await D.has(R, 'Boiler repair: it’s done')) { await D.press(R, 'Boiler repair: it’s done'); await D.look(R, 'w2-sun-boiler-sheet'); await L.tap(R, R.page.locator('.sheet .chip').first(), '15 min', 1500); await D.through(R, 'w2-sun-boiler'); }
else R.fails.push('no "It’s done" for the boiler');
await D.today(R, 'w2-sun-1045');
/* the word, cut at last */
if (await D.has(R, 'A word waits to be cut')) { await D.press(R, 'A word waits to be cut'); await D.cut(R, 'w2-sun-cut'); await D.through(R, 'w2-sun-after-cut'); }
await D.today(R, 'w2-sun-1050-after-cut');
await D.tick(R, 'Gym, then the sauna', '1 h', 'w2-sun-gym', { key: 'keep', from: await fromRow('Gym') });
await D.today(R, 'w2-sun-1100');
await D.notToday(R, 'Tank clean', 'w2-sun-tank-aside');
await D.notToday(R, 'Spanish study', 'w2-sun-spanish-aside');
await D.today(R, 'w2-sun-1101-asides');
await L.toClock(R, 0, 15, 0);
await D.delve(R, 'Course', { min: 25, n: 2, tag: 'w2-sun-course', key: 'keep', from: await fromRow('Course') });
await D.today(R, 'w2-sun-1600');
await D.later(R, 0, 23, 50);
await D.today(R, 'w2-sun-2350');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w2-sun-2351-sleep');
await D.keep(R, 'save-w2-sun.json');

/* ===== Mon 19 Oct: the week close after the week of days away ===== */
S('MON 19 OCT: week 2 close');
await D.reopen(R, 1, 8, 0);
for (let k = 0; k < 4 && !(await D.onToday(R)); k++) {
  await D.look(R, `w3-mon-0800-open-${k}`, { full: true });
  if (await D.has(R, 'Plan it for me')) { await D.press(R, 'Plan it for me'); await D.look(R, 'w3-mon-planned', { full: true }); S('after Plan it for me, the arrow says: ' + await R.page.locator('button.home').first().innerText().catch(() => '?')); await L.tap(R, R.page.locator('button.home').first(), 'arrow'); continue; }
  if (await D.has(R, 'Back to today')) { await D.press(R, 'Back to today'); continue; }
  await L.tap(R, R.page.locator('button.home').first(), 'arrow');
}
await D.today(R, 'w3-mon-0805');
if (await D.has(R, 'A page was written for you · Daybook')) { await D.press(R, 'A page was written for you · Daybook'); await D.look(R, 'w3-mon-daybook', { full: true }); }
await D.home(R); await L.tap(R, D.foot(R, 'Daybook'), 'Daybook'); await D.look(R, 'w3-mon-daybook-foot', { full: true });
await D.toWeek(R); await D.look(R, 'w3-mon-week', { full: true });
await D.keep(R, 'save-w3-mon-open.json');
await D.done(R, 'week 2 Sunday and close');
