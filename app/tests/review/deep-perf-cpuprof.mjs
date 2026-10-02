// Deep review (performance): where the processor goes during a rested delve on a long save, in the browser (Chromium
// CPU profile). The build is minified, so each hot spot is printed with a few characters of the bundle around it, to
// tell the rules' code from the framework's (Svelte's reactive proxies). No story text is printed (code only).
// Usage: node tests/review/deep-perf-cpuprof.mjs http://localhost:4187/ save.json
import { readFileSync, readdirSync } from 'node:fs';
import { launch, open, save as readSaveFile, lastAt } from './deep-perf-lib.mjs';
const [,, url, savePath] = process.argv;
const raw = readSaveFile(savePath);
const d = new Date(lastAt(raw) + 12 * 3600_000);
const at = `${d.toISOString().slice(0, 10)}T09:00:00+01:00`;
const b = await launch();
const P = await open(b, url, { save: raw, at, dpr: 1 });
const { page } = P;
await page.goto(url);
await P.toToday();
await P.tap(page.locator('.rows button.row:not(.done)'));
if (await P.has('Begin')) await P.tap(P.btn('Begin'));
await page.waitForTimeout(17000);
const cdp = await page.context().newCDPSession(page);
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
await cdp.send('Profiler.start');
await page.waitForTimeout(6000);
const { profile } = await cdp.send('Profiler.stop');
const dt = new Map();
profile.samples.forEach((id, i) => dt.set(id, (dt.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0)));
const self = new Map(); let total = 0;
for (const n of profile.nodes) {
  const t = dt.get(n.id) ?? 0; total += t;
  const f = n.callFrame, k = `${f.functionName || '(anon)'}|${f.url.split('/').pop()}|${f.lineNumber}|${f.columnNumber}`;
  self.set(k, (self.get(k) ?? 0) + t);
}
const dist = new URL('../../dist/assets/', import.meta.url);
const files = Object.fromEntries(readdirSync(dist).filter(f => f.endsWith('.js')).map(f => [f, readFileSync(new URL(f, dist), 'utf8').split('\n')]));
const idle = [...self].filter(([k]) => k.startsWith('(idle)') || k.startsWith('(program)')).reduce((s, [, t]) => s + t, 0);
console.log(`busy ${(100 * (total - idle) / total).toFixed(0)}% of 6 s`);
for (const [k, t] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 16)) {
  const [name, file, line, col] = k.split('|');
  const src = files[file]?.[+line]?.slice(Math.max(0, +col - 10), +col + 70).replace(/\s+/g, ' ') ?? '';
  console.log(`${(100 * t / total).toFixed(1).padStart(5)}%  ${name} ${file}:${line}:${col}  ${/["'`]/.test(src) ? src.replace(/(["'`]).*?\1/g, '$1…$1') : src}`);
}
await b.close();
