// Today shows where Dan is on this stretch (Dan, D-140): the delve's end's road line, still, under the place's name,
// with the minutes to the next place and the side chamber; it moves on after work (a job ticked off for 30 minutes).
// SHOTS=<dir> saves pictures. Usage: node tests/flows/today-road.mjs http://localhost:4173/ [width height]
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(url);
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.btn').first().click(); await page.clock.runFor(1500); }
const fails = [];
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const shot = async (name) => { if (shots) { await page.waitForTimeout(1500); await page.screenshot({ path: `${shots}/today-road-${name}-${w}.png` }); } };
const toToday = async () => { for (let k = 0; k < 8 && !(await page.locator('nav.foot').count()); k++) { const way = (await page.locator('.home').count()) ? page.locator('.home') : page.locator('button.btn'); await tap(way, 'way back to Today'); } };
const read = () => page.evaluate(() => ({
  line: !!document.querySelector('.where .road'),
  words: document.querySelector('.where')?.getAttribute('aria-label') ?? '',
  labels: [...document.querySelectorAll('.where .lab')].map(e => e.textContent.trim()),
  flame: (() => { const f = document.querySelector('.where .road .flame'); return f ? new DOMMatrix(getComputedStyle(f).transform).m41 : null; })(),
}));

/* 1. the line and its minutes (in its labels, and said by VoiceOver), at the start of the day */
const a = await read();
if (!a.line) fails.push('no road line on Today');
if (!/^The next place in \d/.test(a.words)) fails.push(`the line is read out as "${a.words}"`);
if (!a.labels.some(l => /^the next place\s*\d/.test(l))) fails.push(`no minutes by "the next place": ${a.labels.join(' | ')}`);
if (!a.labels.some(l => /^a side chamber\s*\d/.test(l))) fails.push(`no minutes by "a side chamber": ${a.labels.join(' | ')}`);
await shot('1-before');

/* 2. 30 minutes' work moves the flame on and takes 30 off the next place */
await tap(page.locator('.today-add'), 'Add a job'); await page.keyboard.type('Bank'); await page.keyboard.press('Enter'); await page.clock.runFor(800);
await tap(page.getByRole('button', { name: 'Bank: tick off', exact: true }), 'the tick circle on Bank');
await tap(page.getByRole('button', { name: '30 min', exact: true }), '30 min');
await page.waitForTimeout(3600);
await toToday();
const z = await read();
if (!z.line) fails.push('no road line on Today after the work');
if (z.flame !== null && a.flame !== null && !(z.flame > a.flame)) fails.push(`the flame did not move on (${a.flame} → ${z.flame})`);
const mins = s => { const m = /The next place in (?:(\d+) h)? ?(?:(\d+) min)?/.exec(s); return m ? (+(m[1] ?? 0)) * 60 + (+(m[2] ?? 0)) : null; };
if (mins(a.words) !== null && mins(z.words) !== null && mins(a.words) - mins(z.words) !== 30) fails.push(`the next place went from "${a.words}" to "${z.words}"`);
/* nothing on the line moves on Today (D-132) */
const moving = await page.evaluate(() => document.querySelector('.where .road')?.getAnimations({ subtree: true }).filter(x => x.playState === 'running').length ?? 0);
if (moving) fails.push(`${moving} animation(s) running on Today's road line`);
await shot('2-after');

await b.close();
console.log(JSON.stringify({ before: a, after: z }));
if (errors.length) fails.push(...errors.map(e => `page error: ${e}`));
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('today-road: ok');
