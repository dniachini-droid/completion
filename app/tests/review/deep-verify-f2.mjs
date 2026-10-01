// Verification of THREE-WEEKS F2 (review only): Not yet + a note + a place reached; what facts are written, step by step.
import * as D from './deep-weeks-lib.mjs';
const { L } = D;
const R = await D.open({ at: '2026-10-05T09:00:00+01:00' });
await D.addJob(R, 'Big job');
const mode = process.argv[2] ?? 'tap';
await D.home(R);
await L.tap(R, D.todayRow(R, 'Big job'), 'Big job');
await D.setUp(R, 90, 3);
await D.tap(R, 'Begin');
await D.pass(R, 3 * 90 + 10);
await R.page.clock.runFor(2000);
const tail = async label => { const f = await D.facts(R); console.log(label, 'screen=' + await L.screen(R), f.slice(-4).map(x => `${x.seq}:${x.type}${x.what ? '/' + x.what + '@' + x.ref : ''}`).join(' ')); };
await tail('end:');
await D.tap(R, 'Not yet'); await tail('after Not yet:');
const inp = R.page.locator('input.line.stop');
console.log('note box:', await inp.count());
await inp.fill('page 4'); await tail('after fill:');
await R.page.evaluate(() => {
  const w = window; w.__log = [];
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { if (k === 'save.v1') { const f = JSON.parse(v).facts; w.__log.push('write ' + f.slice(-1).map(x => x.seq + ':' + x.type).join()); } return set.call(this, k, v); };
  document.addEventListener('click', e => w.__log.push('click ' + (e.target.closest('button')?.textContent ?? e.target.tagName) + ' prevented=' + e.defaultPrevented), true);
  document.addEventListener('click', e => w.__log.push('click(bubble) prevented=' + e.defaultPrevented), false);
  document.addEventListener('focusout', () => w.__log.push('focusout'), true);
});
const b = D.btn(R, 'Back to today');
console.log('see-button count', await b.count(), 'focused:', await R.page.evaluate(() => document.activeElement?.className));
if (mode === 'click') await b.first().click(); else {
  const r = await b.first().boundingBox(); console.log('box', JSON.stringify(r));
  const hit = await R.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e?.outerHTML.slice(0, 80); }, [r.x + r.width / 2, r.y + r.height / 2]);
  console.log('element at centre:', hit);
  await R.page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
}
await R.page.clock.runFor(1500); await tail('after Back to today:');
console.log(await R.page.evaluate(() => window.__log.join('\n')));
await D.done(R, 'vf2');
