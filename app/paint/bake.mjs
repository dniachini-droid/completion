/* Bake the painting kit's scenes to images, in a headless browser.
   node paint/bake.mjs [--scale 0.25] [--ss 2] [--only id] [--out dir] scene.js ...
   --ss 2: paint at twice the size and scale down (smooth edges, no stair-steps; four times the time: finals only)
   Writes <id>.webp (the painting) and <id>.json (anchors for the live layers). */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');                 /* app/ */
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const ss = +opt('--ss', 1), scale = +opt('--scale', 1), outDir = resolve(opt('--out', join(here, 'out'))), quality = +opt('--q', .86);
const preview = args.includes('--jpg'); if (preview) args.splice(args.indexOf('--jpg'), 1);
const files = args.map(a => resolve(a));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(process.env.NODE_PATH || '', 'playwright'))); }

const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' };
const server = createServer(async (req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<!doctype html><body></body>'); }
  try { const b = await readFile(join(root, decodeURIComponent(req.url.split('?')[0]))); res.writeHead(200, { 'content-type': types[extname(req.url.split('?')[0])] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--disable-gpu-watchdog', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('console', m => console.log('  [page]', m.text()));
await page.goto(`http://localhost:${port}/`);
await mkdir(outDir, { recursive: true });
for (const f of files) {
  const rel = '/' + relative(root, f).split('\\').join('/');
  const W = Math.round(1320 * scale), H = Math.round(2868 * scale);
  const t0 = Date.now();
  const r = await page.evaluate(async ({ rel, W, H, quality, ss }) => {
    const { paint } = await import('/paint/kit/render.js');
    const scene = (await import(rel + '?' + Date.now())).default;
    const cv = document.createElement('canvas');
    const out = await paint(cv, scene, { width: W * ss, height: H * ss });
    if (ss > 1) {                                          /* down to size: each pixel the mean of ss × ss */
      const small = document.createElement('canvas'); small.width = W; small.height = H;
      const sx = small.getContext('2d'); sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = 'high';
      let src = cv; for (let k = ss; k > 1; k /= 2) { const t = document.createElement('canvas'); t.width = Math.round(W * k / 2); t.height = Math.round(H * k / 2); const tx = t.getContext('2d'); tx.imageSmoothingQuality = 'high'; tx.drawImage(src, 0, 0, t.width, t.height); src = t; }
      sx.drawImage(src, 0, 0); cv.width = W; cv.height = H; cv.getContext('2d').drawImage(small, 0, 0);
    }
    return { id: scene.id, name: scene.name, line: scene.line, live: scene.live || {}, anchors: out.anchors,
      img: cv.toDataURL('image/webp', quality), jpg: cv.toDataURL('image/jpeg', .9) };
  }, { rel, W, H, quality, ss });
  const buf = Buffer.from(r.img.split(',')[1], 'base64');
  await writeFile(join(outDir, r.id + '.webp'), buf);
  if (preview) await writeFile(join(outDir, r.id + '.jpg'), Buffer.from(r.jpg.split(',')[1], 'base64'));
  const meta = { id: r.id, name: r.name, line: r.line, width: W, height: H, live: r.live, anchors: r.anchors };
  await writeFile(join(outDir, r.id + '.json'), JSON.stringify(meta, null, 1));
  console.log(`${r.id}: ${W}×${H}, ${(buf.length / 1024).toFixed(0)} KB, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
await browser.close(); server.close();
