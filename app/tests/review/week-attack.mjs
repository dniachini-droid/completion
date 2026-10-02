// The Week, attacked: jobs moved between days and weeks ("Move to", "Another day…"), "Not this week", back again, then
// the clock run to those days and the jobs delved on and said done there; Next week / The week after many times; Plan my
// week and "Lay out the rest of the week" tapped twice; days folded and unfolded fast; a job moved while its delve runs;
// the week boundary crossed with jobs waiting in the next week. Jobs are the test's own.
// Usage (from app/): node tests/review/week-attack.mjs [w h] [only]
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
  const x = await L.finish(R, `week-attack #${n} ${title}`); total.fails += x.fails; total.errors += x.errors;
};
const foot = (R, name) => R.page.locator('.foot').getByRole('button', { name, exact: true });
const toWeek = async R => { await L.toToday(R); await L.tap(R, foot(R, 'Week'), 'Week'); };
const wrow = (R, name) => R.page.locator('.day button.row', { hasText: name }).first();
const dayOf = async (R, name) => R.page.evaluate(n => { for (const d of document.querySelectorAll('.day')) if ([...d.querySelectorAll('button.row .t')].some(t => t.textContent.includes(n))) return [...(d.querySelector('.dname')?.childNodes ?? [])].filter(x => x.nodeType === 3).map(x => x.textContent.trim()).join('') || '?'; return null; }, name);
const heading = R => R.page.locator('.ui h1').first().innerText().catch(() => '');
const dates = R => R.page.locator('p.dates').innerText().catch(() => '');

/* 1. Move to: every day of this week in turn, fast; then Not this week; the Satchel; back on a day; Done */
await S(1, 'move around this week', async R => {
  await L.addToday(R, 'Kilo'); await L.addToday(R, 'Lima');
  await toWeek(R);
  for (let i = 0; i < 5; i++) {
    await L.tap(R, wrow(R, 'Kilo'), 'Kilo', 500);
    const seg = R.page.locator('.sheet .seg.days button');
    const n = await seg.count();
    if (!n) { R.fails.push(`#1 round ${i}: Kilo's sheet has no days`); break; }
    await L.tap(R, seg.nth((i * 2) % n), `day ${(i * 2) % n}`, 500);
  }
  R.notes.push(`#1 Kilo after 5 moves is on ${await dayOf(R, 'Kilo')}`);
  await L.audit(R, '#1 after moves');
  /* the sheet's day tapped twice fast: one move, and the second tap? */
  await L.tap(R, wrow(R, 'Lima'), 'Lima', 500);
  await L.multiTap(R, R.page.locator('.sheet .seg.days button').nth(2), 2, 60, 'a day ×2');
  const open = await R.page.locator('.sheet').count();
  R.notes.push(`#1 Move-to day tapped twice: Lima on ${await dayOf(R, 'Lima')}, a sheet ${open ? 'is open (the second tap opened a row beneath)' : 'is closed'}`);
  /* Not this week → Satchel → Put on today → Today → delve → Done */
  if (await R.page.locator('.sheet').count()) await L.tap(R, R.page.locator('button.row.open'), 'close sheet', 400);
  await L.tap(R, wrow(R, 'Kilo'), 'Kilo', 500); await L.tap(R, 'Not this week');
  if (await wrow(R, 'Kilo').count()) R.fails.push('#1 Kilo still in the week after Not this week');
  await L.toToday(R); await L.tap(R, foot(R, 'Satchel'), 'Satchel');
  if (!(await L.item(R, 'Kilo').count())) R.fails.push('#1 Kilo, Not this week, is not in the Satchel');
  else { await L.tap(R, L.item(R, 'Kilo').getByRole('button', { name: /: put on a day$/ }), 'Put on a day'); await L.tap(R, L.item(R, 'Kilo').locator('.cal button').first(), 'today'); }
  await L.toToday(R);
  await L.tap(R, L.row(R, 'Kilo').first(), 'Kilo on Today'); await L.tap(R, 'Begin'); await L.ff(R, 6 * 60_000);
  await L.tap(R, 'Finish here'); await L.tap(R, 'Done'); await L.toToday(R);
  if (!/done/i.test(await L.row(R, 'Kilo').first().innerText().catch(() => ''))) R.fails.push('#1 Kilo, moved around and said done, is not done on Today');
  await toWeek(R); await L.audit(R, '#1 week at the end');
  const dupe = await R.page.locator('.day button.row', { hasText: 'Kilo' }).count();
  if (dupe > 1) R.fails.push(`#1 Kilo shows ${dupe} times in the week`);
});

/* 2. Another day…: to next week, the week after, the farthest day; followed there; the clock run there; Done */
await S(2, 'another day and later weeks', async R => {
  await L.addToday(R, 'Mike'); await L.addToday(R, 'November');
  await toWeek(R);
  await L.tap(R, wrow(R, 'Mike'), 'Mike', 500); await L.tap(R, 'Another day…', 'Another day…', 800);
  const cells = R.page.locator('.sheet .cal button');
  if ((await cells.count()) !== 28) R.fails.push(`#2 Another day… shows ${await cells.count()} days`);
  await L.audit(R, '#2 another day open');
  await L.tap(R, cells.nth(0), 'Monday next week');
  await L.tap(R, wrow(R, 'November'), 'November', 500); await L.tap(R, 'Another day…', 'Another day…', 800);
  await L.tap(R, R.page.locator('.sheet .cal button').nth(27), 'the farthest day');
  /* Next week: Mike there; The week after ×4, then back */
  await L.tap(R, 'Next week');
  if (!(await wrow(R, 'Mike').count())) R.fails.push('#2 Mike is not in next week');
  const seen = [];
  for (let i = 0; i < 5; i++) { seen.push(await dates(R)); if (!(await L.has(R, 'The week after'))) { R.fails.push(`#2 no "The week after" at step ${i}`); break; } await L.tap(R, 'The week after'); await L.audit(R, `#2 later week ${i}`); }
  if (new Set(seen).size !== seen.length) R.fails.push(`#2 "The week after" did not move on each time: ${seen.join(' | ')}`);
  let foundNov = false;
  await L.tap(R, 'This week');
  for (let i = 0; i < 6 && !foundNov; i++) { foundNov = !!(await wrow(R, 'November').count()); if (!foundNov) await L.tap(R, (await L.has(R, 'The week after')) ? 'The week after' : 'Next week'); }
  if (!foundNov) R.fails.push('#2 November, moved to the farthest day, is in no week');
  else {
    /* from a later week, Another day… again: 28 days after that week (to week 9) */
    await L.tap(R, wrow(R, 'November'), 'November', 500); await L.tap(R, 'Another day…', 'Another day…', 800);
    await L.tap(R, R.page.locator('.sheet .cal button').nth(27), 'further still'); await L.audit(R, '#2 moved further');
  }
  /* back along the trail: the arrow says where it goes, and ends on Today */
  const trail = [];
  for (let i = 0; i < 12 && (await L.screen(R)) !== 'today'; i++) { trail.push((await R.page.locator('button.home span').innerText().catch(() => '?')).trim()); await L.tap(R, R.page.locator('button.home'), 'back', 600); }
  R.notes.push(`#2 the arrow's labels on the way back: ${trail.join(' → ')}`);
  if ((await L.screen(R)) !== 'today') R.fails.push('#2 the arrow never reached Today');
  /* the clock to next Monday: Mike on Today, delved, done */
  await L.toClock(R, 5, 9); await L.toToday(R);
  await L.audit(R, '#2 Monday');
  if (!(await L.row(R, 'Mike').count()) && !(await R.page.locator('.next h2', { hasText: 'Mike' }).count())) R.fails.push('#2 Mike is not on Today on the Monday it was moved to');
  else {
    const where = (await L.row(R, 'Mike').count()) ? L.row(R, 'Mike').first() : R.page.locator('.next button.btn');
    await L.tap(R, where, 'Mike'); await L.tap(R, 'Begin'); await L.ff(R, 7 * 60_000); await L.tap(R, 'Finish here'); await L.tap(R, 'Done'); await L.toToday(R);
    if (!(await L.facts(R)).some(f => f.type === 'jobDone' && f.day >= '2026-10-05')) R.fails.push('#2 Mike not done on Monday');
  }
});

/* 3. Plan my week and "Lay out the rest" tapped twice; days folded fast */
await S(3, 'plan twice and fold', async R => {
  await toWeek(R);
  const before = (await L.facts(R)).filter(f => f.type === 'planMade').length;
  if (await L.has(R, 'Plan my week')) await L.multiTap(R, 'Plan my week', 2, 60, 'Plan my week ×2');
  if (await L.has(R, 'Lay out the rest of the week')) await L.multiTap(R, 'Lay out the rest of the week', 2, 60, 'Lay out ×2');
  const after = (await L.facts(R)).filter(f => f.type === 'planMade').length;
  R.notes.push(`#3 planMade facts: ${before} → ${after}`);
  await L.audit(R, '#3 planned');
  const rows = await R.page.locator('.day button.row').allTextContents();
  R.notes.push(`#3 rows in the week: ${rows.length}`);
  for (let i = 0; i < 6; i++) { await L.multiTap(R, R.page.locator('button.dname').nth(i % 3), 3, 40, 'fold ×3'); }
  await L.audit(R, '#3 after folding');
  /* the + opened on two days in turn, fast */
  await L.multiTap(R, R.page.locator('button.plus').nth(0), 2, 40, '+ ×2');
  const inputs = await R.page.locator('form.new input').count();
  R.notes.push(`#3 + tapped twice: ${inputs} input(s) open`);
  await L.tap(R, 'Next week'); await L.tap(R, 'Plan my week'); await L.audit(R, '#3 next week planned');
  await L.tap(R, 'The week after'); if (await L.has(R, 'Plan my week')) await L.tap(R, 'Plan my week'); await L.audit(R, '#3 week after planned');
});

/* 4. A job moved while its delve runs; Not this week while it runs; then Done */
await S(4, 'move while delving', async R => {
  await L.addToday(R, 'Oscar');
  await L.tap(R, L.row(R, 'Oscar').first(), 'Oscar'); await L.tap(R, 'Begin'); await L.ff(R, 4 * 60_000);
  await L.tap(R, R.page.locator('button.home'), 'Today');
  await L.tap(R, foot(R, 'Week'), 'Week');
  await L.tap(R, wrow(R, 'Oscar'), 'Oscar', 500);
  await L.tap(R, R.page.locator('.sheet .seg.days button').nth(2), 'another day');
  await L.audit(R, '#4 moved while running');
  await L.toToday(R);
  const s = await L.screen(R);
  if (!(await L.has(R, 'Back to the delve'))) R.fails.push(`#4 after moving the running job to another day, Today has no way back to the delve (${s})`);
  else { await L.tap(R, 'Back to the delve'); await L.tap(R, 'Finish here'); await L.tap(R, 'Done'); await L.toToday(R); }
  const done = (await L.facts(R)).filter(f => f.type === 'jobDone');
  if (done.length !== 1) R.fails.push(`#4 ${done.length} jobDone for Oscar`);
  await toWeek(R); await L.audit(R, '#4 week after');
  const on = await dayOf(R, 'Oscar');
  R.notes.push(`#4 Oscar, moved to another day while delving and then said done today, shows in the week on: ${on}`);
  if (on && !/Wednesday|WEDNESDAY/i.test(on) && (await R.page.locator('.day button.row:not(.done)', { hasText: 'Oscar' }).count())) R.fails.push(`#4 Oscar, said done, still waits undone on ${on}`);
});

/* 5. The week boundary: jobs in next week; the clock to Sunday night, Monday morning; the Daybook's close */
await S(5, 'week boundary', async R => {
  await L.addToday(R, 'Papa');
  await toWeek(R); await L.tap(R, 'Next week');
  await L.tap(R, R.page.locator('button.plus').first(), '+ on Monday', 300); await R.page.keyboard.type('Quebec'); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(500);
  await L.toToday(R);
  await L.toClock(R, 4, 23, 30); await L.toToday(R); await L.audit(R, '#5 Sunday 23:30');
  await L.toClock(R, 1, 8); for (let i = 0; i < 3; i++) { await R.page.clock.runFor(800); await R.page.waitForTimeout(100); }
  const first = await L.screen(R);
  R.notes.push(`#5 Monday 08:00 opens on: ${first}`);
  await L.audit(R, '#5 Monday first screen');
  /* the daybook's close: every button on the way through */
  for (let i = 0; i < 8 && (await L.screen(R)) !== 'today'; i++) {
    const pick = async () => { for (const n of ['Look ahead', 'Keep', 'Skip', 'Next', 'Nothing in particular', 'Not now', 'On to today', 'Back to today']) if (await L.has(R, n)) return n; return null; };
    const n = await pick();
    if (!n) { await L.tap(R, R.page.locator('button.home, button.btn').first(), 'a way on'); continue; }
    await L.tap(R, n); await L.audit(R, `#5 week close: after ${n}`);
  }
  if ((await L.screen(R)) !== 'today') R.fails.push(`#5 STUCK: never reached Today on Monday (${await L.screen(R)})`);
  if (!(await L.row(R, 'Quebec').count()) && !(await R.page.locator('.next h2', { hasText: 'Quebec' }).count())) R.fails.push('#5 Quebec, put on next Monday, is not on Today on Monday');
  await L.tap(R, foot(R, 'Satchel'), 'Satchel');
  R.notes.push(`#5 Papa (Wednesday's, never done) is ${await L.item(R, 'Papa').count() ? 'in the Satchel' : 'not in the Satchel'} on Monday`);
});

await browser.close();
console.log(`week-attack ${w}x${h}: ${total.fails} problem(s), ${total.errors} page error(s)`);
process.exit(total.errors ? 2 : total.fails ? 1 : 0);
