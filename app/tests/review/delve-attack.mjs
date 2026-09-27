// The delve, attacked: Begin/Pause/Finish here/Done/Not yet tapped twice and three times (fast and past the half-second
// guard); pause and carry on interleaved; another app with the clock jumped (minutes, across 04:00, across a week, 3+ days);
// the screen turned sideways mid-flow; reloads mid-delve; a second job begun from the Satchel while one runs; the running
// job deleted by every door (Satchel, Week sheet, the job editor). Jobs are the test's own ("Alpha", "Bravo"…).
// Usage (from app/): node tests/review/delve-attack.mjs [w h] [only-scenario-number]
import * as L from './lib.mjs';
import { launch } from '../flows/browser.mjs';
const [,, w = '390', h = '844', only] = process.argv;
const browser = await launch();
let total = { fails: 0, errors: 0 };
const S = async (n, title, at, fn) => {
  if (only && String(n) !== only) return;
  const R = await L.start({ w: +w, h: +h, at, browser, tag: `#${n}` });
  R.label = `#${n} ${title}`;
  try { await fn(R); } catch (e) { R.fails.push(`[#${n}] script stopped: ${e.message.split('\n')[0]}`); }
  const x = await L.finish(R, `delve-attack #${n} ${title}`); total.fails += x.fails; total.errors += x.errors;
};
const pauseBtn = R => L.btn(R, 'Pause');
/* the paused delve's own way back: its name carries the minutes left ("Back to the delve 25 minutes left") */
const resumeBtn = R => R.page.locator('.dv button.back');
const onDelving = async R => (await pauseBtn(R).count()) > 0;
const startJob = async (R, name) => {
  await L.tap(R, L.row(R, name).first(), name);
  if (!(await R.page.locator('.rs').count())) { R.fails.push(`[${R.label}] a tap on ${name} did not open its set-up`); return false; }
  return true;
};

/* 1. Begin tapped twice fast, three times fast, and twice 600 ms apart */
await S(1, 'Begin taps', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Alpha'); await L.addToday(R, 'Bravo');
  for (const [n, gap, what] of [[2, 30, 'double'], [3, 40, 'triple'], [2, 600, 'two 600 ms apart']]) {
    await startJob(R, 'Alpha');
    await L.multiTap(R, 'Begin', n, gap, 'Begin');
    const on = await L.screen(R), delving = await onDelving(R);
    if (!delving) R.notes.push(`#1 Begin ${what}: ended on ${on} with ${await L.has(R, 'Done') ? '"Is it done?"' : 'no running delve'}`);
    if (n <= 3 && gap < 500 && !delving) R.fails.push(`#1 Begin ${what} did not leave the delve running (on ${on})`);
    /* clean up: finish, answer, back */
    if (await L.has(R, 'Finish here')) await L.tap(R, 'Finish here');
    if (await L.has(R, 'Not yet')) await L.tap(R, 'Not yet');
    await L.toToday(R);
    await L.audit(R, `#1 after Begin ${what}`);
  }
});

/* 2. Pause and carry on, hammered; Finish here tapped two and three times */
await S(2, 'Pause/resume/finish taps', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Alpha');
  await startJob(R, 'Alpha'); await L.tap(R, 'Begin');
  await L.ff(R, 4 * 60_000);
  const before = await L.facts(R);
  await L.multiTap(R, 'Pause', 3, 40, 'Pause');
  const heldOrRun = (await resumeBtn(R).count()) ? 'held' : await onDelving(R) ? 'running' : await L.screen(R);
  if (heldOrRun !== 'held') R.fails.push(`#2 Pause tapped three times fast: ended ${heldOrRun}, not paused`);
  await L.audit(R, '#2 paused');
  /* Pause → Back to the delve → Pause ... 10 times, 600 ms apart (each a real choice) */
  for (let i = 0; i < 10; i++) {
    const b = (await L.has(R, 'Pause')) ? L.btn(R, 'Pause') : (await resumeBtn(R).count()) ? resumeBtn(R) : null;
    if (!b) { R.fails.push(`#2 lost both Pause and Back to the delve at round ${i} (on ${await L.screen(R)})`); break; }
    await L.tap(R, b, 'pause/resume', 600); await L.ff(R, 20_000);
  }
  await L.audit(R, '#2 after 10 pause toggles');
  /* the facts: every hold has a resume, strictly alternating */
  const f = (await L.facts(R)).slice(before.length).filter(x => ['delveHeld', 'delveResumed'].includes(x.type)).map(x => x.type[5]);
  if (/HH|RR/.test(f.join(''))) R.fails.push(`#2 holds/resumes out of order: ${f.join('')}`);
  if (await resumeBtn(R).count()) await L.tap(R, resumeBtn(R), 'resume');
  const m0 = await L.walked(R);
  await L.multiTap(R, 'Finish here', 3, 40, 'Finish here');
  if (!(await L.has(R, 'Done')) || !(await L.has(R, 'Not yet'))) R.fails.push(`#2 Finish here ×3 fast did not stop on "Is it done?" (on ${await L.screen(R)}; Back to today: ${await L.has(R, 'Back to today')})`);
  await L.audit(R, '#2 is it done');
  const m1 = await L.walked(R);
  if (m1 - m0 < 4) R.fails.push(`#2 ${m1 - m0} minutes counted for a delve of 4+ minutes`);
  /* Done tapped three times fast: once said, the job's return shows, not skipped */
  await L.multiTap(R, 'Done', 3, 40, 'Done');
  const s = await L.screen(R);
  if (s !== 'delve') R.fails.push(`#2 Done ×3 fast left the delve's end (now on ${s}): the return was skipped`);
  await L.audit(R, '#2 after done');
  const done = (await L.facts(R)).filter(x => x.type === 'jobDone').length;
  if (done !== 1) R.fails.push(`#2 ${done} jobDone facts after Done ×3`);
  await L.toToday(R);
  await L.audit(R, '#2 today after');
});

/* 3. Finish here straight away, "Not yet", Today, It's done; then It's done tapped twice; Not yet twice */
await S(3, 'Not yet / It’s done', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Alpha'); await L.addToday(R, 'Bravo');
  await startJob(R, 'Alpha'); await L.tap(R, 'Begin');
  await L.ff(R, 7 * 60_000);
  await L.tap(R, 'Finish here');
  await L.multiTap(R, 'Not yet', 2, 40, 'Not yet');
  if (!(await L.has(R, 'Back to today'))) R.fails.push(`#3 after Not yet ×2 no "Back to today" (on ${await L.screen(R)})`);
  await L.audit(R, '#3 kept');
  await L.multiTap(R, 'Back to today', 2, 40, 'Back to today');
  await L.audit(R, '#3 today with It’s done');
  const done = R.page.locator('.swipe', { hasText: 'Alpha' }).getByRole('button', { name: 'It’s done', exact: true }).or(R.page.locator('.next').getByRole('button', { name: 'It’s done', exact: true }));
  if (!(await done.count())) R.fails.push('#3 no It’s done for Alpha on Today after Not yet');
  else {
    await L.multiTap(R, done, 2, 40, 'It’s done');
    const s = await L.screen(R);
    await L.audit(R, '#3 after It’s done');
    const n = (await L.facts(R)).filter(x => x.type === 'jobDone').length;
    if (n !== 1) R.fails.push(`#3 ${n} jobDone after It’s done ×2`);
    R.notes.push(`#3 It's done ×2 ended on ${s}`);
    await L.toToday(R);
  }
});

/* 4. Another app, then back after minutes, across 04:00, across a week, and after 3+ days */
for (const [k, at, awayMs, what] of [
  [41, '2026-09-30T14:00:00+01:00', 90_000, '90 seconds'],
  [42, '2026-09-30T23:30:00+01:00', 5.5 * 3600_000, 'across 04:00 (23:30 → 05:00)'],
  [43, '2026-10-04T22:00:00+01:00', 12 * 3600_000, 'across the week (Sun 22:00 → Mon 10:00)'],
  [44, '2026-09-30T18:00:00+01:00', 3.7 * 86400_000, '3.7 days'],
  [45, '2026-09-30T03:30:00+01:00', 40 * 60_000, 'from 03:30 to 04:10'],
]) {
  await S(k, `away ${what}`, at, async R => {
    await L.addToday(R, 'Alpha');
    if (!(await L.row(R, 'Alpha').count())) { R.notes.push(`#${k} Alpha not on Today at this hour; delving via Something else…`); }
    if (await L.row(R, 'Alpha').count()) await startJob(R, 'Alpha');
    else { await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…'); await R.page.locator('form.new input').fill('Alpha2'); await L.tap(R, R.page.locator('form.new button'), 'Delve on it'); }
    await L.tap(R, 'Begin'); await L.ff(R, 6 * 60_000);
    const m0 = await L.walked(R);
    await L.away(R, awayMs);
    for (let i = 0; i < 4; i++) { await R.page.clock.runFor(800); await R.page.waitForTimeout(80); }
    const s = await L.screen(R);
    await L.audit(R, `#${k} back after ${what}`);
    R.notes.push(`#${k} back after ${what}: on ${s}; Carry on=${await L.has(R, 'Carry on')} Finish here=${await L.has(R, 'Finish here')} Done=${await L.has(R, 'Done')} Not yet=${await L.has(R, 'Not yet')}`);
    /* whatever shows, there is a way forward to Today, and the 6 minutes are not lost */
    if (await L.has(R, 'Finish here')) await L.tap(R, 'Finish here');
    if (await L.has(R, 'Not yet')) await L.tap(R, 'Not yet');
    const ok = await L.toToday(R);
    if (!ok) R.fails.push(`#${k} STUCK: could not get back to Today after ${what} (on ${await L.screen(R)})`);
    await L.audit(R, `#${k} today after ${what}`);
    const m1 = await L.walked(R);
    if (m1 - m0 < 6 && m1 < 6) R.fails.push(`#${k} after ${what}: only ${m1} minutes walked in all for a 6-minute delve`);
    if (m1 > 6 + 2) R.fails.push(`#${k} after ${what}: ${m1} minutes walked for a 6-minute delve (time away counted?)`);
    /* reload: nothing comes back that was answered */
    await L.reload(R); await L.toToday(R);
    if (await L.running(R)) R.fails.push(`#${k} after reload a delve screen came back`);
  });
}

/* 5. The screen turned sideways mid-flow: set-up, delve, pause, end; turned back */
await S(5, 'rotation', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Alpha');
  const turn = async (name) => { await R.page.setViewportSize({ width: +h, height: +w }); R.w = +h; R.h = +w; await R.page.clock.runFor(600); await L.audit(R, `#5 ${name} sideways`); await R.page.setViewportSize({ width: +w, height: +h }); R.w = +w; R.h = +h; await R.page.clock.runFor(600); await L.audit(R, `#5 ${name} upright again`); };
  await turn('today');
  await startJob(R, 'Alpha'); await turn('set-up');
  await L.tap(R, 'Begin'); await turn('delve');
  await L.tap(R, 'Pause'); await turn('paused');
  await L.tap(R, resumeBtn(R), 'resume'); await L.ff(R, 3 * 60_000);
  await L.tap(R, 'Finish here'); await turn('is it done');
  await L.tap(R, 'Done'); await turn('the return');
  await L.toToday(R); await turn('today after');
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week'); await turn('week');
  await L.toToday(R);
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel'); await turn('satchel');
});

/* 6. Reload mid-delve, while paused, on "Is it done?", on "Not yet"'s page */
await S(6, 'reloads', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Alpha');
  await startJob(R, 'Alpha'); await L.tap(R, 'Begin'); await L.ff(R, 5 * 60_000);
  const left = async () => R.page.locator('.dv .time').innerText().catch(() => '?');
  const a = await left();
  await L.reload(R);
  if (!(await L.running(R))) R.fails.push('#6 reload mid-delve: the delve screen is not shown');
  const b = await left();
  R.notes.push(`#6 time left before reload ${a}, after ${b}`);
  await L.tap(R, 'Pause'); await L.reload(R);
  if (!(await resumeBtn(R).count())) R.fails.push(`#6 reload while paused: no way back to the delve (on ${await L.screen(R)})`);
  await L.tap(R, resumeBtn(R), 'resume');
  await L.ff(R, 2 * 60_000);
  await L.tap(R, 'Finish here'); await L.reload(R);
  if (!(await L.has(R, 'Done'))) R.fails.push(`#6 reload on "Is it done?": the question is gone (on ${await L.screen(R)})`);
  if (await L.has(R, 'Not yet')) { await L.tap(R, 'Not yet'); await L.reload(R); R.notes.push(`#6 reload after Not yet: on ${await L.screen(R)}, It's done on Today: ${await R.page.getByRole('button', { name: 'It’s done' }).count()}`); }
  await L.toToday(R); await L.audit(R, '#6 today after reloads');
  const m = await L.walked(R);
  if (m < 7) R.fails.push(`#6 only ${m} minutes kept for ~7 minutes delved across reloads`);
});

/* 7. While a delve runs: the Satchel's own job tapped and begun; the running job deleted from the Satchel */
await S(7, 'satchel during a delve', '2026-09-30T09:00:00+01:00', async R => {
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
  await L.putSatchel(R, 'Charlie'); await L.putSatchel(R, 'Delta');
  await L.tap(R, L.item(R, 'Charlie').locator('button.row'), 'Charlie');
  await L.tap(R, 'Begin');
  if (!(await onDelving(R))) R.fails.push('#7 Charlie did not start');
  await L.tap(R, R.page.locator('button.home'), 'Today');
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
  const names = await R.page.locator('.item .t').allTextContents();
  R.notes.push(`#7 satchel during Charlie's delve lists: ${names.join(', ')}`);
  /* the running job's Delete: must say it can't */
  if (await L.item(R, 'Charlie').count()) {
    await L.tap(R, L.item(R, 'Charlie').getByRole('button', { name: /: delete$/ }), 'Delete Charlie');
    if (!(await R.page.locator('.deleted').count())) R.fails.push('#7 Delete on the running job said nothing');
  }
  /* another job begun while Charlie runs */
  await L.tap(R, L.item(R, 'Delta').locator('button.row'), 'Delta');
  const onSet = await R.page.locator('.rs').count();
  if (onSet) {
    await L.tap(R, 'Begin');
    const h2 = await R.page.locator('.dv h2').first().innerText().catch(() => '');
    if (h2.includes('Charlie')) R.fails.push('#7 CONFUSING: Delta\'s set-up was offered while Charlie runs, and its Begin opened Charlie\'s delve (Delta never started, no word why)');
    else if (h2.includes('Delta')) R.fails.push('#7 two delves at once?');
  }
  await L.audit(R, '#7 after second Begin');
  await L.toToday(R);
});

/* 8. The running job deleted through the job editor (Week → its sheet → Change the job → Delete) */
await S(8, 'delete the running job via the editor', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Echo');
  await startJob(R, 'Echo'); await L.tap(R, 'Begin'); await L.ff(R, 3 * 60_000);
  await L.tap(R, R.page.locator('button.home'), 'Today');
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week');
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Echo' }).first(), 'Echo in the Week');
  const sheetDel = await R.page.locator('.sheet').getByRole('button', { name: 'Delete', exact: true }).count();
  if (sheetDel) R.fails.push('#8 the Week sheet offers Delete on the running job');
  if (!(await L.has(R, 'Change the job'))) { R.fails.push('#8 no Change the job on the running job\'s sheet'); return; }
  await L.tap(R, 'Change the job');
  await L.audit(R, '#8 editor');
  if (!(await L.has(R, 'Delete'))) { R.notes.push('#8 the editor offers no Delete'); return; }
  await L.tap(R, 'Delete');
  const s = await L.screen(R);
  await L.audit(R, '#8 after Delete in the editor');
  const removed = (await L.facts(R)).some(f => f.type === 'jobRemoved');
  if (removed) R.fails.push(`#8 DATA: the running delve's job was deleted through the job editor (guard bypassed; now on ${s})`);
  /* and then: what does the delve do? */
  await L.toToday(R); await L.audit(R, '#8 today after');
  const onToday = await R.page.locator('.next').innerText().catch(() => '');
  R.notes.push(`#8 Today after: running-block present=${/Back to the delve/.test(onToday)}`);
  if (await L.has(R, 'Back to the delve')) { await L.tap(R, 'Back to the delve'); await L.audit(R, '#8 the orphaned delve'); await L.ff(R, 60_000); if (await L.has(R, 'Finish here')) await L.tap(R, 'Finish here'); await L.audit(R, '#8 orphaned end'); if (await L.has(R, 'Done')) await L.tap(R, 'Done'); await L.audit(R, '#8 orphan done'); }
  await L.toToday(R);
  await L.reload(R); await L.toToday(R); await L.audit(R, '#8 after reload');
});

/* 9. "Not this week" on the running job, then its delve ended and said done */
await S(9, 'Not this week while running', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Foxtrot');
  await startJob(R, 'Foxtrot'); await L.tap(R, 'Begin'); await L.ff(R, 3 * 60_000);
  await L.tap(R, R.page.locator('button.home'), 'Today');
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week');
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Foxtrot' }).first(), 'Foxtrot');
  await L.tap(R, 'Not this week');
  await L.audit(R, '#9 week after');
  await L.toToday(R);
  await L.audit(R, '#9 today');
  if (await L.has(R, 'Back to the delve')) await L.tap(R, 'Back to the delve');
  if (await L.has(R, 'Finish here')) await L.tap(R, 'Finish here');
  if (await L.has(R, 'Done')) await L.tap(R, 'Done'); else R.fails.push(`#9 no "Is it done?" (on ${await L.screen(R)})`);
  await L.audit(R, '#9 done');
  await L.toToday(R);
  const n = (await L.facts(R)).filter(x => x.type === 'jobDone').length;
  if (n !== 1) R.fails.push(`#9 ${n} jobDone`);
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel');
  if (await L.item(R, 'Foxtrot').count()) R.fails.push('#9 Foxtrot, done, is still in the Satchel');
});

/* 10. The delve's arrow to Today and back again, fast, many times; browser back mid-delve */
await S(10, 'back and forth', '2026-09-30T09:00:00+01:00', async R => {
  await L.addToday(R, 'Golf');
  await startJob(R, 'Golf'); await L.tap(R, 'Begin');
  for (let i = 0; i < 6; i++) {
    await L.tap(R, R.page.locator('button.home'), 'Today', 300);
    await L.tap(R, 'Back to the delve', 'Back to the delve', 300);
  }
  if (!(await onDelving(R))) R.fails.push(`#10 after 6 round trips: not on the running delve (${await L.screen(R)})`);
  /* the browser's back, once: Today (a second back from Today leaves the page, as it would leave any site) */
  await R.page.goBack().catch(() => {}); await R.page.clock.runFor(800);
  const s = await L.screen(R);
  if (s !== 'today') R.fails.push(`#10 browser back from the delve ended on ${s}`);
  await L.audit(R, '#10 after back');
  if (!(await L.has(R, 'Back to the delve'))) R.fails.push('#10 no way back to the running delve on Today');
});

await browser.close();
console.log(`delve-attack ${w}x${h}: ${total.fails} problem(s), ${total.errors} page error(s)`);
process.exit(total.errors ? 2 : total.fails ? 1 : 0);
