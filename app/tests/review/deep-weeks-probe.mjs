// Three weeks as Dan: small probes of things seen on the way (review only). Usage: node tests/review/deep-weeks-probe.mjs [n]
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const only = process.argv[2];
const P = async (n, at, fn) => { if (only && only !== String(n)) return; const R = await D.open({ at }); D.say(R, `PROBE ${n}`); try { await fn(R); } catch (e) { R.fails.push(`probe ${n} stopped: ${e.message.split('\n')[0]}`); } await D.done(R, `probe ${n}`); };

/* 1. A one-off delved long enough to reach two places, answered Not yet: where does "Back to today" lead? */
await P(1, '2026-10-05T09:00:00+01:00', async R => {
  await D.addJob(R, 'Big job');
  await D.delve(R, 'Big job', { min: 90, n: 3, tag: 'p1-notyet', ask: 'Not yet' });
  D.say(R, 'p1 ended on Today: ' + await D.onToday(R));
});
/* 2. The same, answered Done */
await P(2, '2026-10-05T09:00:00+01:00', async R => {
  await D.addJob(R, 'Big job');
  await D.delve(R, 'Big job', { min: 90, n: 3, tag: 'p2-done', ask: 'Done' });
});
/* 3. Two jobs added one after the other with Add a job: does the second keep its first word? */
await P(3, '2026-10-05T09:00:00+01:00', async R => {
  await D.addJob(R, 'Bank first');
  await D.look(R, 'p3-after-first', { full: true });
  await D.home(R);
  await L.tap(R, R.page.locator('.today-add').first(), 'Add a job', 600);
  await D.look(R, 'p3-box-open');
  const focused = await R.page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  D.say(R, 'p3 focused after the tap: ' + focused);
  await R.page.keyboard.type('Post the parcel'); await D.look(R, 'p3-typed');
  const val = await R.page.locator('#satchel-box').inputValue().catch(() => '?');
  D.say(R, 'p3 box holds: ' + val);
});
/* 4. The same three errands added on Wednesday of week 1 (from the kept save) */
if (!only || only === '4') {
  const R = await D.open({ at: '2026-10-07T15:40:00+01:00', from: 'save-w1-tue.json' });
  await D.through(R, 'p4-waits');
  for (const e of ['Bank: pay in the cheque', 'Post the parcel', 'Buy stamps']) {
    await D.home(R); await L.tap(R, R.page.locator('.today-add').first(), 'Add a job', 600);
    for (const ch of e) { await R.page.keyboard.type(ch); const v = await R.page.locator('#satchel-box').inputValue().catch(() => '?'); if (!v.endsWith(ch)) D.say(R, `p4 typing "${e}": after "${ch}" the box holds "${v}"`); }
    await D.look(R, 'p4-typed-' + e.slice(0, 4));
    await R.page.keyboard.press('Enter'); await R.page.clock.runFor(800);
  }
  D.say(R, 'p4 rows: ' + D.fmtRows(await D.rows(R)));
  await D.done(R, 'probe 4');
}
/* 5. As 1, with a note typed in "Where did you stop?" */
await P(5, '2026-10-05T09:00:00+01:00', async R => {
  await D.addJob(R, 'Big job');
  const seen = await D.delve(R, 'Big job', { min: 90, n: 3, tag: 'p5-notyet-note', ask: 'Not yet', stopAt: 'page 4' });
  D.say(R, 'p5 screens: ' + seen.join(' > '));
});
/* 6. As 1, with a note, one place only (60 min) */
await P(6, '2026-10-05T09:00:00+01:00', async R => {
  await D.addJob(R, 'Big job');
  const seen = await D.delve(R, 'Big job', { min: 90, n: 1, tag: 'p6-notyet-note', ask: 'Not yet', stopAt: 'page 4' });
  D.say(R, 'p6 screens: ' + seen.join(' > '));
});
/* 7. Saturday week 1, 1 Key kept: "Use it on the Map" from Today, then each light */
if (!only || only === '7') {
  const R = await D.open({ at: '2026-10-10T11:30:00+01:00', from: 'save-w1-sat.json' });
  await D.through(R, 'p7-waits'); await D.home(R);
  await D.press(R, 'Use it on the Map'); await D.look(R, 'p7-map-from-today', { full: true });
  D.say(R, 'p7 Use a Key buttons from the link: ' + await R.page.locator('button.use:not(.again)').count());
  await D.done(R, 'probe 7');
}
