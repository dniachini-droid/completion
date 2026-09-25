/* node sheet.mjs out.jpg h img1 img2 ...  (side by side at height h); crop: img@x0,y0,x1,y1 (fractions) */
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH ? process.env.NODE_PATH + '/playwright' : 'playwright');
const [out, h, ...imgs] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage();
const data = [];
for (const s of imgs) { const [f, c] = s.split('@'); const t = f.endsWith('.webp') ? 'webp' : 'jpeg';
  data.push({ src: `data:image/${t};base64,` + (await readFile(f)).toString('base64'), crop: c ? c.split(',').map(Number) : [0,0,1,1] }); }
const r = await p.evaluate(async ({ data, H }) => {
  const ims = await Promise.all(data.map(async d => { const i = new Image(); i.src = d.src; await i.decode(); return { i, c: d.crop }; }));
  const ws = ims.map(({ i, c }) => Math.round(H * (c[2]-c[0]) * i.width / ((c[3]-c[1]) * i.height)));
  const cv = document.createElement('canvas'); cv.width = ws.reduce((a, b) => a + b + 6, 0); cv.height = H;
  const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,cv.width,H); let o = 0;
  ims.forEach(({ i, c }, k) => { x.drawImage(i, c[0]*i.width, c[1]*i.height, (c[2]-c[0])*i.width, (c[3]-c[1])*i.height, o, 0, ws[k], H); o += ws[k] + 6; });
  return cv.toDataURL('image/jpeg', .9);
}, { data, H: +h });
await writeFile(out, Buffer.from(r.split(',')[1], 'base64')); await b.close();
