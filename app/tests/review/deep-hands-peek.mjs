// Hands-on review: a first look at Today at a given size and engine. Review only.
const { launch } = await import('../flows/browser.mjs');
const [,, w = '390', h = '844', at = '2026-10-01T09:00:00+01:00', tag='peek'] = process.argv;
const b = await launch();
const page = await b.newPage({ viewport: { width: +w, height: +h }, timezoneId: 'Europe/London', hasTouch: true, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', e => errs.push('pageerror ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
await page.clock.install({ time: new Date(at) });
await page.goto('http://localhost:4183/');
for (let k = 0; k < 20; k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
await page.screenshot({ path: `/tmp/claude-hands/${tag}-${w}-${process.env.BROWSER||'chromium'}.png` });
console.log(await page.locator('.phone').innerText().catch(()=>'' ));
console.log(await page.evaluate(() => [...document.querySelectorAll('button')].map(b => (b.getAttribute('aria-label')||b.innerText).replace(/\s+/g,' ').slice(0,50) + ' .' + b.className.split(' ')[0]).join('\n')));
console.log(errs.join('\n'));
await b.close();
