// Verification (review only): a component's teardown that writes a fact (Daybook's read()) during a screen change
// computes on the facts from before the change (Svelte's teardown old values), so facts written in the same tap vanish.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: process.argv[2] ?? '2026-10-12T09:00:00+01:00', from: process.argv[3] ?? 'save-w1-sun.json' });
await R.page.evaluate(() => {
  const w = window; w.__log = [];
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { if (k === 'save.v1') { const f = JSON.parse(v).facts; w.__log.push(`write n=${f.length} last=` + f.slice(-1).map(x => x.seq + ':' + x.type).join()); } return set.call(this, k, v); };
});
const btns = async () => (await R.page.locator('button:visible').allInnerTexts()).map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 30);
for (let k = 0; k < 6; k++) {
  const s = await L.screen(R);
  const h = await R.page.locator('.ui h1, .ui h2').first().innerText().catch(() => '');
  console.log(k, 'screen', s, '| buttons:', JSON.stringify(await btns()));
  if (await D.has(R, 'Plan it for me')) break;
  if (await D.has(R, 'Look ahead at the week?')) break;
  const big = R.page.locator('.ui button.btn:not([disabled])');
  if (s.includes('daybook') || h.includes('ay')) {}
  if (await big.count()) await L.tap(R, big.last(), 'big'); else if (await R.page.locator('button.home').count()) await L.tap(R, R.page.locator('button.home').first(), 'arrow');
}
const before = await D.facts(R);
const types = f => f.slice(before.length - 0).map(x => x.seq + ':' + x.type);
const mode = process.argv[4] ?? 'plan';
if (mode === 'pin' && await D.has(R, 'Look ahead')) {
  await D.tap(R, 'Look ahead');
  for (let k = 0; k < 12; k++) {
    if (await D.has(R, 'Keep')) { await D.tap(R, 'Keep'); continue; }
    const nx = R.page.locator('.offer button.next'); if (await nx.count()) { await L.tap(R, nx, 'next'); continue; }
    break;
  }
  const row = R.page.locator('.offer .rows button.row').first();
  console.log('pin on:', await row.innerText());
  await L.tap(R, row, 'pin');
  await R.page.clock.runFor(1500);
  const after = await D.facts(R);
  console.log('new facts kept in the save:', after.slice(before.length).map(x => x.seq + ':' + x.type).join(' '));
  console.log(await R.page.evaluate(() => window.__log.join('\n')));
} else if (await D.has(R, 'Plan it for me')) {
  await D.tap(R, 'Plan it for me');
  await R.page.clock.runFor(1500);
  const after = await D.facts(R);
  console.log('screen now', await L.screen(R), 'arrow:', await R.page.locator('button.home').first().innerText().catch(() => ''));
  console.log('new facts kept in the save:', after.slice(before.length).map(x => x.seq + ':' + x.type).join(' '));
  console.log('planMade for this week in save:', after.some(x => x.type === 'planMade' && x.seq > before.length - 1 + 0 && x.seq > before[before.length - 1].seq));
  console.log('planMade facts:', JSON.stringify(after.filter(x => x.type === 'planMade').map(x => [x.seq, x.week])));
  console.log(await R.page.evaluate(() => window.__log.join('\n')));
} else console.log('no Plan it for me found');
await D.done(R, 'vdaybook');
