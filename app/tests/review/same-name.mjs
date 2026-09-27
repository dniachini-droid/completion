// Two jobs with the same name, both done in one week (e.g. "Shopping" added twice), then the week closes: the Daybook's
// "the week held" list is keyed by job name (Daybook.svelte `{#each held as h (h.name)}`), so its new page throws and the
// screen shows "Something went wrong"; each opening of the app, and every way to Today, goes to that page first.
// Usage (from app/): node tests/review/same-name.mjs [w h]
import * as L from './lib.mjs';
const [,, w = '390', h = '844'] = process.argv;
const R = await L.start({ w: +w, h: +h, at: '2026-09-30T09:00:00+01:00', tag: 'same name' });
const doneOnce = async () => {
  await L.tap(R, L.row(R, 'Shopping').filter({ hasNotText: 'done' }).first(), 'a Shopping row'); await L.tap(R, 'Begin'); await L.ff(R, 6 * 60_000);
  await L.tap(R, 'Finish here'); await L.tap(R, 'Done'); await L.toToday(R);
};
await L.addToday(R, 'Shopping'); await L.addToday(R, 'Shopping');
await doneOnce(); await doneOnce();
const done = (await L.facts(R)).filter(f => f.type === 'jobDone').length;
if (done !== 2) R.notes.push(`only ${done} Shopping jobs done`);
/* the week closes: the app opened on Sunday night, then Monday morning */
await L.toClock(R, 4, 22); await L.toToday(R);
await L.toClock(R, 1, 9); for (let i = 0; i < 3; i++) { await R.page.clock.runFor(800); await R.page.waitForTimeout(100); }
const seen = [];
for (let i = 0; i < 8; i++) {
  const s = await L.screen(R); seen.push(s);
  if (s === 'OOPS' || s === 'today') break;
  const way = (await R.page.locator('.ui button.btn').count()) ? R.page.locator('.ui button.btn').last() : R.page.locator('button.home');
  await L.tap(R, way, 'the way on');
}
R.notes.push(`Monday: ${seen.join(' → ')}`);
if (seen.includes('OOPS')) {
  R.fails.push('CRASH: the week close with two done jobs of the same name shows "Something went wrong"');
  await L.tap(R, 'Today');
  R.notes.push(`after the crash screen's Today: ${await L.screen(R)}`);
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week');
  await L.tap(R, R.page.locator('button.home'), 'the arrow to Today');
  if ((await L.screen(R)) === 'OOPS') R.fails.push('CRASH again: Week → arrow to Today leads back to the unread Daybook page, which throws');
  if (await L.has(R, 'Today')) await L.tap(R, 'Today');
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Daybook', exact: true }), 'Daybook');
  if ((await L.screen(R)) === 'OOPS') R.fails.push('CRASH: the Daybook itself can no longer be opened');
}
await L.reload(R);
if ((await L.screen(R)) === 'OOPS') R.fails.push('CRASH after reload: the app opens on "Something went wrong"');
const x = await L.finish(R, 'same-name');
process.exit(x.errors ? 2 : x.fails ? 1 : 0);
