// Deep review (performance): what the fog's and grain's noise pictures (SVG feTurbulence data URIs in direction.css)
// cost to draw at the phone's size. Each fog layer is 200% of the frame wide, so on a 430 × 932 phone at 3× it is a
// 2580 × 2796 pixel picture (28 MB of pixels); Today has four. Timed by drawing each into a canvas of that size.
// Usage: node tests/review/deep-perf-fog.mjs http://localhost:4187/
import { launch } from './deep-perf-lib.mjs';
const [,, url] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: 430, height: 932 } });
await page.goto(url);
await page.waitForTimeout(2500);
const out = await page.evaluate(async () => {
  const urls = new Map();
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
    for (const r of rules) { const m = r.cssText?.match(/url\("(data:image\/svg\+xml[^"]+)"\)/); if (m && /feTurbulence/.test(m[1])) urls.set(r.selectorText, m[1]); } }
  const res = [];
  for (const [sel, u] of urls) {
    const img = new Image(); img.src = u; await img.decode();
    const big = /grain/.test(sel) ? [660, 660] : [2580, 2796];
    const c = document.createElement('canvas'); c.width = big[0]; c.height = big[1];
    const x = c.getContext('2d');
    const t = performance.now(); x.drawImage(img, 0, 0, big[0], big[1]); x.getImageData(0, 0, 1, 1); const ms = performance.now() - t;
    res.push({ sel, px: `${big[0]}x${big[1]}`, MB: +(big[0] * big[1] * 4 / 1048576).toFixed(1), ms: Math.round(ms) });
  }
  return res;
});
for (const r of out) console.log(JSON.stringify(r));
await b.close();
