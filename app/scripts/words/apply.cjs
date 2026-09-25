/* Load checked story lines into app/src/content/sealed/ (docs/narrative/WRITING_PROCESS.md, step 5).
   Usage (from app/): node scripts/words/apply.cjs <new.json {key: text}> <current.json from dump>
   Replaces each changed line's exact string literal; keeps *italics*; prints anything it could not place.
   Afterwards collapse any doubled **italics** and re-dump to confirm 0 mismatches. */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../../src/content/sealed');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).map(f => path.join(dir, f));
const src = Object.fromEntries(files.map(f => [f, fs.readFileSync(f, 'utf8')]));
const a = require(path.resolve(process.argv[3] || 'lines.json')), g = require(path.resolve(process.argv[2]));
const norm = s => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
function withItalics(o, n) {
  for (const sp of (o.match(/\*[^*]+\*/g) || [])) {
    const inner = sp.slice(1, -1);
    const i = norm(n).indexOf(norm(inner));
    if (i < 0) return null;
    n = n.slice(0, i) + '*' + n.slice(i, i + inner.length) + '*' + n.slice(i + inner.length);
  }
  return n;
}
const lit = (s, q) => q + (q === "'" ? s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  : q === '"' ? s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  : s.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')) + q;
let done = 0; const unres = [], ital = [], multi = [];
for (const x of a) {
  let n = g[x.key];
  if (n.replace(/\*/g, '') === x.text.replace(/\*/g, '')) continue;
  const ni = withItalics(x.text, n);
  if (ni === null) { ital.push(x.key); continue; }
  n = ni;
  let hit = false;
  for (const q of ["'", '"', '`']) {
    const L = lit(x.text, q);
    const fl = files.filter(f => src[f].includes(L));
    if (!fl.length) continue;
    let cnt = 0; for (const f of fl) cnt += src[f].split(L).length - 1;
    if (cnt > 1) multi.push(x.key + ' x' + cnt);
    for (const f of fl) src[f] = src[f].split(L).join(lit(n, q));
    hit = true; break;
  }
  hit ? done++ : unres.push(x.key);
}
for (const f of files) fs.writeFileSync(f, src[f]);
console.log('replaced', done, 'unresolved', unres.length, JSON.stringify(unres), 'italics-lost', JSON.stringify(ital), 'multi', JSON.stringify(multi));
