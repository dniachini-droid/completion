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
