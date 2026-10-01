// Three weeks as Dan, part 2: Thursday 8 to Sunday 11 October (week 1's end), from deep-weeks-1's save. Review only.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-08T08:30:00+01:00', from: 'save-w1-wed.json' });
const S = (s) => D.say(R, s);

/* ===== Thu 8 Oct: a hard day; the boiler reply; the lesson at 18:00; a delve across 04:00 ===== */
S('THU 8 OCT: hard day');
await D.through(R, 'w1-thu-0830-waits');
await D.today(R, 'w1-thu-0830');
/* Boiler repair is back from waiting: still waiting, a few days more */
if (await D.has(R, 'Boiler repair: still waiting, choose a day')) {
  await D.press(R, 'Boiler repair: still waiting, choose a day'); await D.look(R, 'w1-thu-boiler-still', { full: true });
  const other = R.page.locator('.replies button.text-link.other'); if (await other.count()) await L.tap(R, other, 'Another day', 400);
  await D.look(R, 'w1-thu-boiler-cal', { full: true });
  /* back on Thursday 15th: the middle of the days away */
  const d15 = R.page.getByRole('button', { name: /Thursday 15 Oct/ }); if (await d15.count()) await L.tap(R, d15.first(), '15th'); else { R.fails.push('no 15 Oct in the wait calendar'); await L.tap(R, R.page.locator('.wait-soon'), 'soon'); }
} else R.fails.push('Boiler repair not back on Thursday');
await D.today(R, 'w1-thu-0832-boiler');
await D.notToday(R, 'Gym, then the sauna', 'w1-thu-gym-aside');
await D.today(R, 'w1-thu-0833-gym-aside');
await D.addJob(R, 'Tax return');
await L.toClock(R, 0, 9, 0);
await D.delve(R, 'Tax return', { min: 90, n: 2, tag: 'w1-thu-tax1', ask: 'Not yet', stopAt: 'expenses page' });
await D.today(R, 'w1-thu-1215');
await L.toClock(R, 0, 12, 30);
await D.delve(R, 'Course', { min: 25, n: 2, tag: 'w1-thu-course', from: (await D.todayRow(R, 'Course').count()) ? 'today' : 'satchel' });
await D.today(R, 'w1-thu-1330');
await L.toClock(R, 0, 14, 0);
await D.delve(R, 'Tax return', { min: 60, n: 2, tag: 'w1-thu-tax2', ask: 'Not yet' });
await D.today(R, 'w1-thu-1610');
await D.later(R, 0, 17, 50); await D.today(R, 'w1-thu-1750-lesson-soon');
await D.later(R, 0, 19, 15);
await D.tick(R, 'Spanish lesson', '1 h', 'w1-thu-lesson', { key: 'keep' });
await D.today(R, 'w1-thu-1916');
/* the gym after all: Put it back, delve 60 */
if (await D.has(R, 'Gym, then the sauna: put it back on today')) await D.press(R, 'Gym, then the sauna: put it back on today');
await L.toClock(R, 0, 20, 0);
await D.delve(R, 'Gym, then the sauna', { min: 60, n: 1, tag: 'w1-thu-gym' });
await D.today(R, 'w1-thu-2105');
/* a delve across 04:00 Friday: Spanish study 03:20 to 04:20 */
await D.later(R, 1, 3, 20);
await D.today(R, 'w1-thu-0320-fri');
await D.delve(R, 'Spanish study', { min: 60, n: 1, tag: 'w1-thu-spanish-across4', from: (await D.todayRow(R, 'Spanish study').count()) ? 'today' : 'satchel' });
await D.today(R, 'w1-thu-0425-fri');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w1-thu-0426-sleep', { full: true });
await D.keep(R, 'save-w1-thu.json');

/* ===== Fri 9: not opened. Sat 10 Oct: light; the tank; Keys; the Map ===== */
S('SAT 10 OCT: light; Keys');
await D.reopen(R, 1, 11, 0);   /* from 04:26 Friday's game day is Friday; +1: Saturday */
await D.look(R, 'w1-sat-1100-open', { full: true });
await D.through(R, 'w1-sat-1100-waits');
await D.today(R, 'w1-sat-1100');
await D.tick(R, 'Tank clean', '1 h', 'w1-sat-tank', { key: 'use', from: (await D.todayRow(R, 'Tank clean').count()) ? 'today' : 'satchel' });
await D.today(R, 'w1-sat-1105');
await D.home(R); await L.tap(R, D.btn(R, 'Map'), 'Map'); await D.look(R, 'w1-sat-map', { full: true });
const use = R.page.getByRole('button', { name: /Use a Key/ });
S(`Map Use a Key buttons: ${await use.count()}`);
if (await use.count()) { await L.tap(R, use.first(), 'Use a Key'); await D.look(R, 'w1-sat-opened', { full: true }); }
await D.today(R, 'w1-sat-1110');
await D.keep(R, 'save-w1-sat.json');

/* ===== Sun 11 Oct: gym, meal prep; Tonight; bed on time ===== */
S('SUN 11 OCT');
await D.reopen(R, 1, 10, 0);
await D.through(R, 'w1-sun-1000-waits');
await D.today(R, 'w1-sun-1000');
await D.delve(R, 'Gym, then the sauna', { min: 60, n: 1, tag: 'w1-sun-gym', key: 'keep', from: (await D.todayRow(R, 'Gym').count()) ? 'today' : 'satchel' });
await D.today(R, 'w1-sun-1105');
await D.later(R, 0, 13, 0);
await D.tick(R, 'Meal prep', '1 h', 'w1-sun-meal', { key: 'keep' });
await D.today(R, 'w1-sun-1305');
await D.later(R, 0, 22, 30);
await D.today(R, 'w1-sun-2230-tonight');
if (await D.has(R, 'Go to sleep')) await D.press(R, 'Go to sleep');
await D.look(R, 'w1-sun-2231-sleep', { full: true });
await D.keep(R, 'save-w1-sun.json');
await D.done(R, 'week 1 Thu-Sun');
