/* The painting kit's automatic checks (TECH_DECISIONS.md → paintings, step 4).
   node paint/check.mjs paint/view/img/*.json [any.jpg|png|webp]   (a bare image: the colour checks only)
   For each baked painting:
     - no red: nothing reads as red (direction D: "No red anywhere"). Calibrated on the approved
       hall: the lamp's warm light on violet stone (dusky rust-mauve) is part of D and passes
     - within the palette: hues stay in D's violet-to-gold family. Calibrated on the approved hall (D-070):
       blue-violet (200–300°), gold and amber (20–60°), and the dusky mauve-rose between them where the
       lamp's gold meets violet stone (300–20°, not vivid) are all D; what is off is green or cyan
       (60–200°) and vivid pink or magenta. Before D-070 the hall itself failed at 4.7%
     - cold stone: of the coloured pixels, at least half are blue-violet (the hall: about 90%); the gold
       is the lamp's, never the whole room (D-070)
     - words stay readable: the brightest part of the top band (where the place
       name sits, under its scrim) keeps ink text at 4.5:1 or better
     - size: the image stays under the budget (0.7 MB)
   Decodes the webp in a headless browser; prints a line per check and exits 1 on a failure. */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(process.env.NODE_PATH || '', 'playwright'))); }

const INK = [242, 243, 251];                     /* --ink */
const SCRIM_TOP = .72;                           /* the scrim's strength behind the name (view/index.html) */
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

const browser = await chromium.launch();
const page = await browser.newPage();
let failed = 0;
for (const jf of process.argv.slice(2)) {
  const bare = !jf.endsWith('.json');
  const meta = bare ? { id: jf } : JSON.parse(await readFile(jf, 'utf8'));
  const img = await readFile(bare ? jf : jf.replace(/\.json$/, '.webp'));
  const type = jf.endsWith('.png') ? 'png' : /\.jpe?g$/.test(jf) ? 'jpeg' : 'webp';
  const stats = await page.evaluate(async ([b64, type]) => {
    const im = new Image(); im.src = `data:image/${type};base64,` + b64; await im.decode();
    const W = 258, H = Math.round(W * im.height / im.width);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data;
    let red = 0, off = 0, n = 0, col = 0, cold = 0, top = [0, 0, 0], topL = -1;
    const rows = Math.round(H * .22);            /* where the words sit */
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
      const k = (y * W + i) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
      n++;
      if (mx > 40 && sat > .25) {
        col++;
        let h = 0; if (mx === r) h = ((g - b) / (mx - mn)) % 6; else if (mx === g) h = (b - r) / (mx - mn) + 2; else h = (r - g) / (mx - mn) + 4;
        h = (h * 60 + 360) % 360;
        if (h >= 200 && h <= 300) cold++;
        if ((h < 20 || h > 335) && sat > .55 && mx > 110) red++;   /* true red; the lamp's dusky warmth on stone is allowed, as in the hall */
        else if ((h > 60 && h < 200) || ((h > 300 || h < 20) && sat > .6)) off++;   /* green or cyan; or a vivid pink, not the dusky bridge */
      }
      if (y < rows) { const L = .2126 * r + .7152 * g + .0722 * b; if (L > topL) { topL = L; top = [r, g, b]; } }
    }
    return { red: red / n, off: off / n, cold: col ? cold / col : 1, top };
  }, [img.toString('base64'), type]);
  const behind = stats.top.map(c => c * (1 - SCRIM_TOP) + 5 * SCRIM_TOP);
  const cr = contrast(INK, behind), kb = img.length / 1024;
  const rows = [
    ['no red', stats.red < .001, (stats.red * 100).toFixed(2) + '% of pixels'],
    ['palette', stats.off < .01, (stats.off * 100).toFixed(2) + '% outside violet–gold'],
    ['cold stone', stats.cold >= .5, (stats.cold * 100).toFixed(0) + '% of the colour is blue-violet'],
    ['words readable', cr >= 4.5, cr.toFixed(1) + ':1 at the brightest point behind the name'],
    ['size', kb <= 700, kb.toFixed(0) + ' KB'],
  ].slice(0, bare ? 3 : 5);
  console.log(meta.id);
  for (const [k, ok, v] of rows) { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${k}: ${v}`); if (!ok) failed++; }
}
await browser.close();
process.exit(failed ? 1 : 0);
