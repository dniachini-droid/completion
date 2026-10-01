// Deep review (performance): compositing layers per screen (Chromium LayerTree): how many, and how many pixels they hold
// at 3× (a proxy for the graphics memory and fill the phone's compositor has to move each frame while the world moves).
// Usage: node tests/review/deep-perf-layers.mjs http://localhost:4187/
import { launch, open } from './deep-perf-lib.mjs';
const [,, url] = process.argv;
const b = await launch();
const P = await open(b, url);
const { page } = P;
const cdp = await page.context().newCDPSession(page);
let layers = [];
cdp.on('LayerTree.layerTreeDidChange', e => { if (e.layers) layers = e.layers; });
await cdp.send('LayerTree.enable');
await page.goto(url);
await P.toToday();
async function read(name) {
  await page.waitForTimeout(4000);
  const drawn = layers.filter(l => l.drawsContent);
  const px = drawn.reduce((s, l) => s + l.width * l.height * 9, 0);
  const big = drawn.filter(l => l.width * l.height >= 430 * 932 * 0.9).length;
  console.log(`${name.padEnd(14)} layers ${layers.length}, drawing ${drawn.length}, full-screen-or-larger ${big}, ${(px * 4 / 1048576).toFixed(0)} MB of pixels at 3x`);
}
await read('today');
for (const label of ['Week', 'Map']) { if (await P.has(label)) { await P.tap(P.btn(label)); await read(label.toLowerCase()); await P.home(); } }
await P.tap(page.locator('.rows button.row:not(.done)'));
if (await P.has('Begin')) await P.tap(P.btn('Begin'));
if (await page.locator('.dv').count()) await read('delve');
await b.close();
