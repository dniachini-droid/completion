import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.NODE_PATH ? process.env.NODE_PATH + '/playwright' : 'playwright');
const b = await chromium.launch(); const p = await b.newPage();
for (const f of process.argv.slice(2)) {
  const t = f.endsWith('.webp') ? 'webp' : 'jpeg';
  const r = await p.evaluate(async src => { const i = new Image(); i.src = src; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); const d = x.getImageData(0, 0, i.width, i.height).data;
    const L = [], m = [0,0,0]; for (let k = 0; k < d.length; k += 4) { L.push(.299*d[k]+.587*d[k+1]+.114*d[k+2]); m[0]+=d[k]; m[1]+=d[k+1]; m[2]+=d[k+2]; } const n = L.length; L.sort((a,b)=>a-b);
    return { med: L[n>>1]|0, p90: L[n*.9|0]|0, p99: L[n*.99|0]|0, mean: m.map(v => v/n|0) }; }, `data:image/${t};base64,` + (await readFile(f)).toString('base64'));
  console.log(f.split('/').pop(), JSON.stringify(r));
}
await b.close();
