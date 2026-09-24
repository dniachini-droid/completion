// The web link (Phase 8 prototype): fold the built page's script and styles into one self-contained HTML file.
// Nothing is fetched from anywhere; the page's policy still forbids any network request (SECURITY_PRIVACY.md).
import fs from 'node:fs';
import path from 'node:path';
const dir = 'dist-link', out = process.argv[2] ?? 'dist-link/heart.html';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
html = html.replace(/<script type="module" crossorigin src="\/?(assets\/[^"]+)"><\/script>/, (_, f) =>
  `<script type="module">${fs.readFileSync(path.join(dir, f), 'utf8').replace(/<\/script/g, '<\\/script')}</script>`);
html = html.replace(/<link rel="stylesheet" crossorigin href="\/?(assets\/[^"]+)">/, (_, f) =>
  `<style>${fs.readFileSync(path.join(dir, f), 'utf8')}</style>`);
html = html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'");
if (/src="\/?assets|href="\/?assets/.test(html)) throw new Error('an asset was left outside the page');
fs.writeFileSync(out, html);
console.log(out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');

// For a claude.ai link, the host adds the page's skeleton (doctype, head, viewport): keep only the title, styles, mount point and script.
if (process.argv[3]) {
  const title = /<title>[^<]*<\/title>/.exec(html)[0];
  const styles = [...html.matchAll(/<style>[\s\S]*?<\/style>/g)].map(m => m[0]).join('\n');
  const script = /<script type="module">[\s\S]*<\/script>/.exec(html)[0];
  /* the app pads its own interface by the phone's safe areas; the painting itself runs under the notch (DESIGN_SYSTEM → full-bleed) */
  const own = '<style>:root{padding:0!important}html,body{height:100%;margin:0;background:#05050c}</style>';
  fs.writeFileSync(process.argv[3], `${title}\n${own}\n${styles}\n<div id="app"></div>\n${script}\n`);
  console.log(process.argv[3]);
}
