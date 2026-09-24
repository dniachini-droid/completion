// The app icon and launch image, made from the baked hall (placeholders until the app has its name and mark; D-061).
// Run after bake: node paint/icons.mjs
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const hall = fs.readFileSync(path.resolve(here, '../public/paint/hall-early.jpg')).toString('base64');
const assets = path.resolve(here, '../ios/App/App/Assets.xcassets');

const browser = await chromium.launch();
async function shot(file, size, body) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#05050c;width:${size}px;height:${size}px;overflow:hidden">${body}</body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: file, omitBackground: false });
  await page.close();
}

// Icon: the hall's far light, with the delve's ring around it.
await shot(path.join(assets, 'AppIcon.appiconset/AppIcon-512@2x.png'), 1024, `
  <div style="position:absolute;inset:0;background:url(data:image/jpeg;base64,${hall}) 50% 43.5% / 190% auto no-repeat"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%, transparent 30%, rgba(5,5,12,.55) 75%)"></div>
  <svg viewBox="0 0 1024 1024" style="position:absolute;inset:0">
    <defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter></defs>
    <circle cx="512" cy="512" r="300" fill="none" stroke="#8f86ff" stroke-width="30" filter="url(#g)" opacity=".9"/>
    <circle cx="512" cy="512" r="300" fill="none" stroke="#e6e3ff" stroke-width="12"/>
  </svg>`);

// Launch: the night colour, so opening never flashes white.
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  await shot(path.join(assets, 'Splash.imageset', f), 2732, '');
}
await browser.close();
console.log('icons done');
