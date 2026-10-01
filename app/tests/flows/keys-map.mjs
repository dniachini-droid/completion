// Keys and the Map (D-143 A, B; the flow review's S1, S2): from a save with Keys kept and something a Key can open,
// Today's link opens the Map where "Use a Key" is; the niche opened there is read, and back goes back: the Map, then
// Today, never round in a loop; the niche can be read again from the Map, "Opened · Read again".
// SHOTS=<dir> saves pictures. Usage: node tests/flows/keys-map.mjs http://localhost:4173/ [width height]
import { readFileSync } from 'node:fs';
const { launch } = await import('./browser.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const shots = process.env.SHOTS;
const save = readFileSync(new URL('./saves/keys.json', import.meta.url), 'utf8');
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: shots ? 2 : 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
/* the save, once, before the app reads it: the day after its last */
await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('save.v1', s); sessionStorage.setItem('seeded', '1'); } } catch { /* about:blank */ } }, save);
await page.clock.install({ time: new Date('2026-10-08T09:00:00+01:00') });
await page.goto(url);
const fails = [];
const tap = async (loc, what) => {
  await loc.first().scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(200);
  const r = await loc.first().boundingBox().catch(() => null);
  if (!r) { fails.push(`no ${what}`); return false; }
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await page.clock.runFor(1200); return true;
};
const shot = async (name) => { if (shots) { await page.waitForTimeout(1200); await page.screenshot({ path: `${shots}/keys-map-${name}-${w}.png` }); } };
const onToday = async () => (await page.locator('nav.foot').count()) > 0;
for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
/* past what waits (the morning, a new Daybook page…) to Today */
for (let k = 0; k < 8 && !(await onToday()); k++) {
  const way = (await page.locator('button.home').count()) ? page.locator('button.home') : page.locator('button.btn');
  await tap(way, 'a way on to Today');
}
const arrow = () => page.locator('button.home span').first().textContent().then(s => s?.trim()).catch(() => null);
const btn = name => page.getByRole('button', { name, exact: true });

if (!(await onToday())) fails.push('never reached Today');
const keys = await page.locator('button.keys span').textContent().catch(() => '');
if (!/\d Keys?/.test(keys ?? '')) fails.push(`Today does not show the Keys kept: "${keys}"`);
const link = page.locator('.key-use button');
const linkSays = (await link.textContent().catch(() => ''))?.trim();
if (!/^Use (it|one) (here|on the Map)$/.test(linkSays ?? '')) fails.push(`no "Use it on the Map" link: "${linkSays}"`);
await shot('1-today');

/* S2: the link opens the Map on a stretch whose box offers "Use a Key" */
await tap(link, 'the Key link');
const useKey = () => page.getByRole('button', { name: /^Use a Key: / }).first();
const uses = await page.getByRole('button', { name: /^Use a Key: / }).count();
if (!uses) fails.push('the Map the link opened offers no "Use a Key"');
await shot('2-map');

/* S1: use it, read it, back to the Map, back to Today */
await tap(useKey(), 'Use a Key');
const label = (await page.locator('.label-line').first().textContent().catch(() => ''))?.trim();
if (!/You used a Key/i.test(label ?? '')) fails.push(`the opened screen says "${label}"`);
if ((await arrow()) !== 'Map') fails.push(`the opened screen's arrow says "${await arrow()}", not Map`);
await shot('3-opened');
await tap(page.locator('button.home'), 'the arrow on the opened screen');
if (!(await page.locator('.field[data-pan="map"]').count())) fails.push('back from the opened screen is not the Map');
if ((await arrow()) !== 'Today') fails.push(`back on the Map, its arrow says "${await arrow()}", not Today (the loop)`);

/* B: the niche opened is listed under its stretch, to read again; back returns to the Map */
const again = page.getByRole('button', { name: /^Opened with a Key: read again/ });
if (!(await again.count())) fails.push('the opened niche is not listed on the Map to read again');
else {
  await tap(again, 'Opened · Read again');
  const l2 = (await page.locator('.label-line').first().textContent().catch(() => ''))?.trim();
  if (!/Opened with a Key/i.test(l2 ?? '')) fails.push(`read again, the screen says "${l2}"`);
  if (await page.locator('.left').count()) fails.push('read again, it still counts the Keys left');
  await tap(page.locator('button.home'), 'the arrow');
  if (!(await page.locator('.field[data-pan="map"]').count())) fails.push('back from reading again is not the Map');
}
await shot('4-map-again');
await tap(page.locator('button.home'), 'the Map\'s arrow');
if (!(await onToday())) fails.push('the Map\'s arrow does not lead to Today');
/* and the phone's back on Today from here never lands on the opened screen */
await page.goBack().catch(() => {}); await page.clock.runFor(800);
if (await page.locator('.label-line', { hasText: /You used a Key/i }).count()) fails.push('the phone\'s back returned to the opened screen');

await b.close();
if (errors.length) fails.push(...errors.map(e => `page error: ${e}`));
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('keys-map: ok');
