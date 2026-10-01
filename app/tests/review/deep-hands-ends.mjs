// Hands-on review: a delve's ends: run out (Is it done? Yes/Not yet), Finish here, Pause, double taps on the end. Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '390', h = '844', mode = 'runout'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'ends-' + mode });
const { page } = H;
const S = async n => { H.say(`== ${n}: ${await H.screen()}`); H.say('  ' + (await H.buttons()).join('\n  ')); const o = await H.overflow(); if (o.length) H.say('  OVERFLOW ' + o.join(' | ')); await H.shot(n); };
const T = async () => H.say('  TEXTLEN ' + (await H.text()).length);
await H.toToday();
const startDelve = async (job, mins) => {
  await H.tap(page.locator('.rows button.row', { hasText: job }), job);
  await H.tap(H.btn(`${mins} minutes`), `${mins}`);
  while (!(await H.btn('One delve fewer').isDisabled())) await H.tap(H.btn('One delve fewer'), 'fewer', 300);
  await H.tap('Begin');
};
const JOB = process.env.JOB ?? 'Course'; await startDelve(JOB, 5);
if (mode === 'runout') {
  await page.clock.runFor(5 * 60 * 1000 + 2000); await page.waitForTimeout(500);
  await S('end-runout');
  /* double tap on the first big button */
  const b1 = page.locator('button.btn').first();
  const r = await b1.boundingBox();
  H.say('first btn: ' + (await b1.innerText()));
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.waitForTimeout(40); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
  await page.clock.runFor(4000);
  await S('after-double-yes');
  await page.clock.runFor(4000);
  await S('after-wait');
  for (let i = 0; i < 6 && !(await H.onToday()); i++) {
    const b = (await page.locator('button.btn').count()) ? page.locator('button.btn').first() : page.locator('button.home');
    H.say('  pressing: ' + (await b.innerText().catch(() => '?')).replace(/\s+/g, ' '));
    await H.tap(b, 'next'); await page.clock.runFor(2500); await S('step' + i);
  }
  H.say('TODAY TEXT: ' + (await H.text()).split('\n').filter(l => l.length < 60).join(' | '));
}
if (mode === 'finish') {
  await page.clock.runFor(2 * 60 * 1000);
  await H.tap('Finish here'); await S('finish-here');
  await H.tap(H.btn('Not yet').first(), 'Not yet'); await S('not-yet');
  const inp = page.locator('input, textarea').first();
  if (await inp.count()) { await inp.fill('page 42 of the second chapter where the diagrams start to make no sense at all'); await S('typed'); }
  await page.evaluate(() => history.back()); await page.clock.runFor(1500);
  await S('after-back');
  await H.toToday(); await S('today');
  H.say('TODAY TEXT: ' + (await H.text()).split('\n').filter(l => l.length < 80).join(' | '));
  await H.tap(page.locator('.rows button.row', { hasText: JOB }), JOB); await S('set-again');
}
if (mode === 'pause') {
  await page.clock.runFor(60 * 1000);
  await H.tap('Pause'); await S('paused');
  await page.clock.runFor(40 * 60 * 1000); await S('paused-40min');
  await H.tap(page.locator('button.btn').first(), 'resume'); await S('resumed');
  await page.clock.runFor(10 * 60 * 1000); await S('after-10');
}
await H.close();
