// Every painting loads, and nothing is refused by the page's security rules (deep review W F16: one "Refused to connect"
// for a painting was seen once in week 3). Run in WebKit too (Safari's engine, as on the iPhone). The places' paintings,
// the Map, the Week, the Satchel and a Daybook page, on a save some days in.
// Usage: node tests/flows/paintings.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;

const page = await K.open('keys', '2026-10-11T09:00:00+01:00');
const refused = [];
page.on('console', m => { if (/Refused to|Content Security Policy|violates/i.test(m.text())) refused.push(m.text().slice(0, 160)); });
page.on('requestfailed', r => { if (/\.(webp|jpg|png|svg)(\?|$)/.test(r.url())) refused.push(`failed: ${r.url().split('/').pop()}`); });
const { tap, home } = K.helpers(page);
/* every picture on the screen: drawn, with its size known */
async function pictures(where) {
  await page.clock.runFor(1500); await page.waitForTimeout(800);
  const bad = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')];
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
    return imgs.filter(i => !(i.complete && i.naturalWidth > 0)).map(i => (i.currentSrc || i.src).split('/').pop());
  });
  for (const b of bad) fails.push(`${where}: a picture did not load (${b})`);
}
await pictures('the first screen');
await home();
await pictures('Today');
for (const name of ['Week', 'Satchel']) {
  await tap(page.locator('.foot').getByRole('button', { name, exact: true }), name);
  await pictures(name);
  await home();
}
await tap(page.locator('.top .icon-link', { hasText: 'Map' }), 'the Map');
await pictures('the Map');
await home();
const placeName = page.locator('h1 button.here');
if (await placeName.count()) { await tap(placeName, 'the place read again'); await pictures('the place'); await home(); }
for (const r of refused) fails.push(`refused: ${r}`);
await page.close();
await K.end('paintings');
