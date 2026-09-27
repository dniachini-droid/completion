// Edge cases: a job deleted while its delve's end waits unanswered (the end reached while Dan types in the Satchel, so it
// isn't shown); the phone's clock set back two hours mid-delve; a delve across the October clock change (BST → GMT);
// a list at its 2,000-character limit opened again. Usage (from app/): node tests/review/edge-attack.mjs [w h] [only]
import * as L from './lib.mjs';
import { launch } from '../flows/browser.mjs';
const [,, w = '390', h = '844', only] = process.argv;
const browser = await launch();
let total = { fails: 0, errors: 0 };
const S = async (n, title, fn, at = '2026-09-30T09:00:00+01:00') => {
  if (only && String(n) !== only) return;
  const R = await L.start({ w: +w, h: +h, at, browser, tag: `#${n}` });
  R.label = `#${n} ${title}`;
  try { await fn(R); } catch (e) { R.fails.push(`[#${n}] script stopped: ${e.message.split('\n')[0]}`); }
  const x = await L.finish(R, `edge-attack #${n} ${title}`); total.fails += x.fails; total.errors += x.errors;
};
const foot = (R, name) => R.page.locator('.foot').getByRole('button', { name, exact: true });

/* 1. the delve ends while Dan types in the Satchel; he deletes that job there; then Today */
await S(1, 'delete with an end waiting', async R => {
  await L.tap(R, foot(R, 'Satchel'), 'Satchel'); await L.putSatchel(R, 'Romeo');
  await L.tap(R, L.item(R, 'Romeo').locator('button.row'), 'Romeo');
  await L.tap(R, R.page.getByRole('button', { name: '5 minutes', exact: true }), '5');
  await L.tap(R, 'Begin');
  await L.tap(R, R.page.locator('button.home'), 'Today'); await L.tap(R, foot(R, 'Satchel'), 'Satchel');
  await R.page.locator('form.new input').click(); await R.page.keyboard.type('typing…');
  await L.ff(R, 6 * 60_000); await R.page.clock.runFor(1500);
  const s0 = await L.screen(R);
  R.notes.push(`#1 the delve ended while typing in the Satchel: still on ${s0}`);
  if (s0 !== 'satchel') return;
  if (!(await L.item(R, 'Romeo').count())) { R.notes.push('#1 Romeo is not in the Satchel after its delve'); return; }
  await L.tap(R, L.item(R, 'Romeo').getByRole('button', { name: /: delete$/ }), 'Delete Romeo');
  const del = (await L.facts(R)).some(f => f.type === 'jobRemoved');
  R.notes.push(`#1 Delete on Romeo with its end unanswered: ${del ? 'deleted' : 'refused'}`);
  await L.tap(R, R.page.locator('button.home'), 'the arrow');
  const s = await L.screen(R);
  R.notes.push(`#1 the arrow from the Satchel then led to: ${s}; walked minutes ${await L.walked(R)}`);
  await L.audit(R, '#1 after');
  if (s === 'OOPS') R.fails.push('#1 CRASH: the end of a deleted job\'s delve');
  if (s === 'delve') {
    const title = (await R.page.locator('.dv h2, .dv p.say').allTextContents()).join(' ');
    if (/\bit-\d+\b/.test(title)) R.fails.push('#1 the end of a deleted job\'s delve shows the job\'s internal id');
    if (await L.has(R, 'Done')) { await L.tap(R, 'Done'); await L.audit(R, '#1 done on a deleted job'); if (!(await L.facts(R)).some(f => f.type === 'jobDone')) R.fails.push('#1 "Done" on the end of a deleted job\'s delve records nothing'); }
    await L.toToday(R);
  }
  if (del && await L.has(R, 'Undo')) R.notes.push('#1 Undo still offered');
});

/* 2. the phone's clock set back two hours mid-delve, then forward again */
await S(2, 'clock backwards', async R => {
  await L.addToday(R, 'Sierra');
  await L.tap(R, L.row(R, 'Sierra').first(), 'Sierra'); await L.tap(R, 'Begin'); await L.ff(R, 10 * 60_000);
  const t0 = await R.page.locator('.dv .time').innerText().catch(() => '?');
  const n = await R.page.evaluate(() => Date.now());
  await R.page.clock.setSystemTime(n - 2 * 3600_000); await R.page.clock.runFor(1500); await R.page.waitForTimeout(200);
  const t1 = await R.page.locator('.dv .time').innerText().catch(() => '?');
  R.notes.push(`#2 time left ${t0}, after the clock went back 2 h: ${t1}`);
  await L.audit(R, '#2 clock back');
  if (/^-|NaN/.test(t1)) R.fails.push(`#2 the countdown shows "${t1}" after the clock went back`);
  const m = /^(\d+):/.exec(t1); if (m && +m[1] > 30) R.fails.push(`#2 the countdown shows ${t1} left of a 30-minute delve`);
  await L.tap(R, 'Finish here');
  const f = (await L.facts(R)).filter(x => x.type === 'delveEnded').pop();
  R.notes.push(`#2 Finish here after the clock went back: ${f?.minutes} minutes`);
  if (f && f.minutes < 0) R.fails.push(`#2 negative minutes (${f.minutes})`);
  await L.tap(R, 'Not yet'); await L.toToday(R); await L.audit(R, '#2 today');
  const facts = await L.facts(R);
  const order = facts.every((x, i) => !i || x.seq > facts[i - 1].seq);
  if (!order) R.fails.push('#2 the log is out of order');
});

/* 3. a delve across the clock change: 25 October 2026, 01:59 BST → 01:00 GMT */
await S(3, 'clock change', async R => {
  await L.addToday(R, 'Tango');
  await L.tap(R, L.row(R, 'Tango').first(), 'Tango');
  await L.tap(R, R.page.getByRole('button', { name: '60 minutes', exact: true }), '60'); await L.tap(R, 'Begin');
  await L.ff(R, 90 * 60_000); await R.page.clock.runFor(1500);
  await L.audit(R, '#3 the end after the clock change');
  const f = (await L.facts(R)).filter(x => x.type === 'delveEnded').pop();
  R.notes.push(`#3 a 60-minute delve begun 01:20 BST ended with ${f?.minutes} minutes on ${f?.day}`);
  if (!f || f.minutes !== 60) R.fails.push(`#3 a 60-minute delve across the clock change counted ${f?.minutes}`);
  await L.toToday(R); await L.audit(R, '#3 today');
}, '2026-10-25T01:20:00+01:00');

/* 4. a list at its limit, opened again: can a line still be typed? */
await S(4, 'full list', async R => {
  await L.tap(R, foot(R, 'Satchel'), 'Satchel'); await L.putSatchel(R, 'Uniform');
  const it = () => L.item(R, 'Uniform');
  await L.tap(R, it().getByRole('button', { name: /^List:/ }), 'List');
  await R.page.keyboard.insertText(Array.from({ length: 100 }, (_, i) => `item ${String(i).padStart(3, '0')} ${'q'.repeat(10)}`).join('\n'));
  await L.tap(R, it().getByRole('button', { name: /^Done:/ }), 'Done');
  await L.tap(R, it().getByRole('button', { name: /^List:/ }), 'List again');
  const before = await R.page.locator('textarea.list').inputValue();
  await R.page.keyboard.type('milk');
  const after = await R.page.locator('textarea.list').inputValue();
  R.notes.push(`#4 a full list opened again: ${before.length} chars in the box; typing "milk" ${after.includes('milk') ? 'worked' : 'did nothing, with no word why'}`);
  if (!after.includes('milk')) R.fails.push('#4 a list at its 2,000-character limit: typing a new line does nothing, with no word why');
  await L.audit(R, '#4 full list');
});

/* 5. the same end reached while typing, with nothing deleted: is it shown on the way back to Today (D-120 point 3)? */
await S(5, 'end while typing', async R => {
  await L.tap(R, foot(R, 'Satchel'), 'Satchel'); await L.putSatchel(R, 'Victor');
  await L.tap(R, L.item(R, 'Victor').locator('button.row'), 'Victor');
  await L.tap(R, R.page.getByRole('button', { name: '5 minutes', exact: true }), '5'); await L.tap(R, 'Begin');
  await L.tap(R, R.page.locator('button.home'), 'Today'); await L.tap(R, foot(R, 'Satchel'), 'Satchel');
  await R.page.locator('form.new input').click(); await R.page.keyboard.type('typing');
  await L.ff(R, 6 * 60_000); await R.page.clock.runFor(1500);
  const seen = [await L.screen(R)];
  await L.tap(R, R.page.locator('button.home'), 'the arrow'); seen.push(await L.screen(R));
  await L.tap(R, foot(R, 'Week'), 'Week'); await L.tap(R, R.page.locator('button.home'), 'the arrow'); seen.push(await L.screen(R));
  await L.ff(R, 3 * 3600_000); seen.push(await L.screen(R));
  R.notes.push(`#5 end reached while typing in the Satchel; then: ${seen.join(' → ')}`);
  if (!seen.slice(1).includes('delve')) R.fails.push('#5 a delve end reached while typing is never shown on the way back to Today (arrow, Week, 3 hours)');
  await L.reload(R);
  if ((await L.screen(R)) === 'delve') R.fails.push('#5 …and it appears, stale, at the next cold open');
});

await browser.close();
console.log(`edge-attack ${w}x${h}: ${total.fails} problem(s), ${total.errors} page error(s)`);
process.exit(total.errors ? 2 : total.fails ? 1 : 0);
