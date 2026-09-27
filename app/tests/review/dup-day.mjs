// A repeating job with several sessions a week, two of them moved onto the same day (the Week's "Move to"): does Today
// (rows keyed by job id), the Week, or the Monday look-ahead (keyed by day + job + kind) throw on the duplicate?
// Usage (from app/): node tests/review/dup-day.mjs [w h]
import * as L from './lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const R = await L.start({ w: +w, h: +h, at: '2026-09-30T09:00:00+01:00', tag: 'dup day' });
const foot = name => R.page.locator('.foot').getByRole('button', { name, exact: true });
/* the plan's rows of one repeating job: its later session moved to today */
await L.tap(R, foot('Week'), 'Week');
const moveRowTo = async (rowIndexFromEnd, dayIndex) => {
  const rows = R.page.locator('.day:not(.past) button.row:not(.done)');
  const names = await rows.locator('.t').allTextContents();
  /* a name that appears on two different days */
  const counts = names.reduce((m, n) => m.set(n, (m.get(n) ?? 0) + 1), new Map());
  const twice = [...counts].find(([, k]) => k >= 2)?.[0];
  if (!twice) { R.notes.push('no job planned twice this week'); return null; }
  const all = R.page.locator('.day:not(.past) button.row:not(.done)', { hasText: twice });
  await L.tap(R, all.nth(await all.count() - 1 - rowIndexFromEnd), 'its later session', 500);
  await L.tap(R, R.page.locator('.sheet .seg.days button').nth(dayIndex), 'to the first day');
  return twice;
};
const which = await moveRowTo(0, 0);
await L.audit(R, 'week with a job twice on today');
const onToday = await R.page.locator('.day.today button.row', { hasText: which ?? '---' }).count();
R.notes.push(`the job now shows ${onToday} times on today in the Week`);
await L.toToday(R);
await L.audit(R, 'today with a job planned twice');
if ((await L.screen(R)) === 'OOPS') R.fails.push('CRASH: Today with a repeating job planned twice on it');
const rows = await R.page.locator('.rows .swipe').count();
R.notes.push(`Today shows ${rows} rows`);
/* next week: two sessions moved onto Monday; then Monday's look-ahead */
await L.tap(R, foot('Week'), 'Week'); await L.tap(R, 'Next week');
if (await L.has(R, 'Plan my week')) await L.tap(R, 'Plan my week');
const which2 = await moveRowTo(0, 0);
await L.audit(R, 'next week with a job twice on Monday');
await L.toToday(R);
await L.toClock(R, 4, 22); await L.toToday(R);
await L.toClock(R, 1, 9); for (let i = 0; i < 3; i++) { await R.page.clock.runFor(800); await R.page.waitForTimeout(100); }
const seen = [];
for (let i = 0; i < 12; i++) {
  const s = await L.screen(R); seen.push(s);
  if (s === 'OOPS' || s === 'today') break;
  const n = ['Look ahead', 'Keep', 'Skip', 'Next', 'Nothing in particular', 'Not now', 'On to today', 'Back to today'];
  let hit = false; for (const x of n) if (await L.has(R, x)) { await L.tap(R, x); await L.audit(R, `Monday: after ${x}`); hit = true; break; }
  if (!hit) await L.tap(R, R.page.locator('.ui button.btn').last().or(R.page.locator('button.home')), 'the way on');
}
R.notes.push(`Monday: ${seen.join(' → ')}`);
if (seen.includes('OOPS')) R.fails.push('CRASH: Monday\'s week close with a job planned twice on one day');
await L.audit(R, 'Monday today');
if ((await L.screen(R)) === 'OOPS') R.fails.push('CRASH on Monday\'s Today');
const x = await L.finish(R, 'dup-day');
process.exit(x.errors ? 2 : x.fails ? 1 : 0);
