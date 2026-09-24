// Phase 4 helper, not app code: phone-size screenshots of the static mock-ups.
// Run: NODE_PATH=$(npm root -g) node docs/design/tools/shot.js out.png docs/design/.../screen.html
// usage: node shot.js out.png file.html [width height] [waitms]
const { chromium } = require('playwright');
(async () => {
  const [out, file, w='390', h='844', wait='1500'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
  await p.goto('file://' + require('path').resolve(file));
  await p.waitForTimeout(+wait);
  await p.screenshot({ path: out, fullPage: false, ...(/\.jpe?g$/i.test(out) ? { type: 'jpeg', quality: 82 } : {}) });
  await b.close();
})();
