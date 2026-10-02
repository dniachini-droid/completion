// Bakes the fog banks (deep review F#5): each was an SVG noise filter the phone drew at its full pixel size (2580 × 2796
// at 3×, 27 MB, up to a second to draw each); the noise is soft, so one small picture per bank, drawn once, looks the same.
// Half the viewBox's size is plenty: the noise's finest grain is 12 units. Writes src/ui/scene/fog/*.webp. Usage: node scripts/bake-fog.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
const pw = await import(process.env.PLAYWRIGHT ?? 'playwright');

/* each bank's noise, as the CSS once drew it (viewBox 780 × 844, stretched over twice the screen's width) */
const banks = {
  'cold-a': "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 780 844' width='780' height='844' preserveAspectRatio='none'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.008' numOctaves='4' seed='4'/><feColorMatrix values='0 0 0 0 0.60  0 0 0 0 0.58  0 0 0 0 1.000  0 0 0 1.3 -0.6'/></filter><rect width='780' height='844' filter='url(#f)'/></svg>",
  'cold-b': "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 780 844' width='780' height='844' preserveAspectRatio='none'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.009 0.02' numOctaves='3' seed='9'/><feColorMatrix values='0 0 0 0 0.62  0 0 0 0 0.60  0 0 0 0 1.000  0 0 0 1.17 -0.65'/></filter><rect width='780' height='844' filter='url(#f)'/></svg>",
  'warm-a': "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 780 844' width='780' height='844' preserveAspectRatio='none'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.01' numOctaves='4' seed='19'/><feColorMatrix values='0 0 0 0 1.000  0 0 0 0 0.659  0 0 0 0 0.314  0 0 0 1.3 -0.55'/></filter><rect width='780' height='844' filter='url(#f)'/></svg>",
  'warm-b': "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 780 844' width='780' height='844' preserveAspectRatio='none'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.009 0.02' numOctaves='3' seed='9'/><feColorMatrix values='0 0 0 0 1.000  0 0 0 0 0.659  0 0 0 0 0.314  0 0 0 1.17 -0.60'/></filter><rect width='780' height='844' filter='url(#f)'/></svg>",
  'front': "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 780 844\" width=\"780\" height=\"844\" preserveAspectRatio=\"none\"><filter id=\"ff\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\".006 .012\" numOctaves=\"3\" seed=\"33\"/><feColorMatrix values=\"0 0 0 0 .75  0 0 0 0 .78  0 0 0 0 1  0 0 0 1.4 -.6\"/></filter><rect width=\"780\" height=\"844\" filter=\"url(#ff)\"/></svg>",
};

const b = await pw.chromium.launch(), page = await b.newPage();
const out = new URL('../src/ui/scene/fog/', import.meta.url);
mkdirSync(out, { recursive: true });
/* each fog's two banks are drawn into one picture, at the opacities the CSS gave them: one layer moving instead of two */
const pictures = { cold: [['cold-a', .42], ['cold-b', .3]], warm: [['warm-a', .42], ['warm-b', .3]], front: [['front', 1]] };
for (const [name, layers] of Object.entries(pictures)) {
  const data = await page.evaluate(async layers => {
    const c = document.createElement('canvas'); c.width = 390; c.height = 422;
    const g = c.getContext('2d');
    for (const [svg, alpha] of layers) {
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
      g.globalAlpha = alpha; g.drawImage(img, 0, 0, 390, 422);
    }
    return c.toDataURL('image/webp', 0.8);
  }, layers.map(([k, a]) => [banks[k], a]));
  writeFileSync(new URL(`${name}.webp`, out), Buffer.from(data.split(',')[1], 'base64'));
  console.log(name);
}
await b.close();
