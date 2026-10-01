// Hands-on review: a Key earned at a return, "Use it here", back to the return: is the choice offered again, and what does a second press spend? Review only.
import { readFileSync } from 'node:fs';
import { open } from './deep-hands-lib.mjs';
const save = readFileSync(new URL('../flows/saves/keys.json', import.meta.url), 'utf8');
const H = await open({ w: 390, h: 844, tag: 'keys4', save, at: '2026-10-08T09:00:00+01:00' });
const { page } = H;
const keyFacts = async () => page.evaluate(() => JSON.parse(localStorage.getItem('save.v1')).facts.filter(x => /^key/.test(x.type)).map(x => x.type + (x.niche ? '(' + String(x.niche).slice(0, 12) + ')' : x.ref ? '(' + String(x.ref).slice(0,12) + ')' : '')).slice(-6).join(', '));
const tickDay = async (job) => { await H.tap(page.getByRole('button', { name: `${job}: tick off`, exact: true }), 'tick'); await H.tap(H.btn('1 h'), '1 h'); await page.waitForTimeout(800); };
await H.toToday();
for (const d of ['2026-10-08', '2026-10-09']) { if (d !== '2026-10-08') { await page.clock.setSystemTime(new Date(d + 'T09:00:00+01:00')); await page.clock.runFor(2000); } await H.toToday(); await tickDay('Course'); await H.toToday(); }
await page.clock.setSystemTime(new Date('2026-10-10T09:00:00+01:00')); await page.clock.runFor(2000); await H.toToday();
H.say('keys before: ' + await page.locator('button.keys').innerText());
await tickDay('Course');
for (let i = 0; i < 6 && !(await H.has('Use it here')); i++) { const b = page.locator('button.btn').first(); if (!(await b.count())) break; await H.tap(b, 'on', 1500); }
H.say('return text: ' + (await H.text()).split('\n').filter(l => /Key|kept/i.test(l)).join(' | '));
H.say('return buttons: ' + (await H.buttons()).join(' / '));
for (let i = 0; i < 6; i++) { await page.waitForTimeout(500); await page.clock.runFor(500); } await H.shot('return');
await H.tap(H.btn('Use it here'), 'Use it here'); await page.waitForTimeout(10); H.say('opened: ' + (await H.text()).split('\n').filter(l => /Key/i.test(l)).join(' | ') + ' arrow=' + await H.arrow()); await H.shot('opened1');
H.say('facts: ' + await keyFacts());
const ringNum = () => page.evaluate(() => [...document.querySelectorAll('.phone *')].find(e => e.children.length === 0 && /^\d+$/.test(e.textContent.trim()) && e.getBoundingClientRect().top < 250)?.textContent.trim());
H.say('ring on first show (settled): ' + await ringNum());
await H.tap(page.locator('button.home'), 'arrow back', 150);
for (const t of [0, 600, 1500, 3000]) { await page.waitForTimeout(t ? t - (t === 600 ? 0 : t === 1500 ? 600 : 1500) : 0); await page.screenshot({ path: `/tmp/claude-hands/keys4-ring-${t}.png`, clip: { x: 100, y: 80, width: 200, height: 140 } }); }
H.say('back on return: ' + (await H.text()).split('\n').filter(l => /Key|kept/i.test(l)).join(' | '));
H.say('buttons now: ' + (await H.buttons()).join(' / '));
await H.shot('return-again');
if (await H.has('Use it here')) { await H.tap(H.btn('Use it here'), 'Use it here again'); H.say('opened again: ' + (await H.text()).split('\n').filter(l => /Key/i.test(l)).join(' | ')); await H.shot('opened2'); H.say('facts: ' + await keyFacts()); }
await H.toToday();
H.say('keys after: ' + await page.locator('button.keys').innerText());
await H.close();
