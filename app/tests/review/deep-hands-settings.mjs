// Hands-on review: Settings (bedtime change, every toggle tapped twice) and Add a recurring job (empty name, Save). Review only.
import { open } from './deep-hands-lib.mjs';
const [,, w = '360', h = '780'] = process.argv;
const H = await open({ w: +w, h: +h, tag: 'settings' });
const { page } = H;
await H.toToday();
await H.tap(page.getByRole('button', { name: 'Settings' }), 'Settings');
await H.tap(H.btn('Change'), 'Change'); await H.shot('bed-change');
H.say('after Change: ' + (await H.buttons()).slice(0, 12).join(' / '));
const bottom = await page.evaluate(() => { const s = [...document.querySelectorAll('.phone *')].find(e => { const o = getComputedStyle(e).overflowY; return (o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1; }); if (s) s.scrollTop = 1e5; return !!s; });
await page.waitForTimeout(400); await H.shot('settings-bottom');
H.say('bottom buttons: ' + (await H.buttons()).filter(b => /y[4-7]\d\d/.test(b)).join(' / '));
await H.toToday();
await H.tap(page.locator('nav.foot').getByRole('button', { name: 'Satchel' }), 'Satchel');
await H.tap(H.btn('Add a recurring job'), 'Add a recurring job'); await H.shot('rhythm-new');
H.say('new rhythm: ' + await H.screen() + ' :: ' + (await H.buttons()).filter(b => /SAVE|CANCEL|Save|Cancel/.test(b)).join(' / '));
const save = page.getByRole('button', { name: /^Save$/i });
H.say('save disabled with empty name: ' + await save.isDisabled().catch(() => '?'));
if (!(await save.isDisabled().catch(() => true))) { await H.tap(save, 'Save'); H.say('after empty save: ' + await H.screen()); await H.shot('rhythm-empty-saved'); H.say('satchel rows: ' + (await page.locator('button.row').allInnerTexts()).map(s => s.replace(/\n/g, ' ')).join(' || ')); }
await H.close();
