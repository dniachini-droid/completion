// Bakes paintings to images, once, before the app is built (TECH_DECISIONS.md → "How the paintings get made").
// Phase 8 trial: the approved hall from the Phase 4 mock-up (docs/design/directions/d-combined/hall.js), unchanged,
// at iPhone Pro Max size (440 × 956 points, 3× pixels). The painting kit replaces this source later.
// Run: npm run bake   (needs Playwright's Chromium; see /opt/pw-browsers in the cloud container)
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const d = path.resolve(here, '../../docs/design/directions/d-combined');
const out = path.resolve(here, '../public/paint');
fs.mkdirSync(out, { recursive: true });

const W = 440, H = 956, DPR = 3;
const scenes = [
  // name, Hall.draw options (the morning screen's camera, morning.html)
  ['hall-early', { cam: { x: .2, y: 1.6, z: 1.5, f: .62, cx: .5, cy: .47 }, gold: .12, res: 2 }],
];

const html = (opts) => `<!doctype html><html><head><meta charset="utf-8">
<style>${fs.readFileSync(path.join(d, 'direction.css'), 'utf8')}</style>
<style>html,body{margin:0;background:#05050c;display:block}#hall{position:fixed;inset:0}#hall>*{position:absolute;inset:0;width:100%;height:100%}</style>
</head><body><div id="hall"></div>
<script>${fs.readFileSync(path.join(d, 'lamp.js'), 'utf8')}</script>
<script>${fs.readFileSync(path.join(d, 'hall.js'), 'utf8')}</script>
<script>window.__h = Hall.draw(document.getElementById('hall'), ${JSON.stringify(opts)}); window.__done = true;</script>
</body></html>`;

const browser = await chromium.launch();
for (const [name, opts] of scenes) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
  await page.setContent(html(opts));
  await page.waitForFunction(() => window.__done === true, null, { timeout: 120000 });
  await page.waitForTimeout(400);
  // Freeze any SVG/CSS animation at a pleasant frame before capture.
  await page.addStyleTag({ content: '*{animation-play-state:paused!important}' });
  const file = path.join(out, `${name}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 86 });
  console.log(file, Math.round(fs.statSync(file).size / 1024) + ' KB');
  await page.close();
}
await browser.close();
