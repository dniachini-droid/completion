// Every screen reachable from Today, by day and at night, at a given size: each one audited for sideways overflow, cut-off
// words, "Something went wrong" and page errors; then every button on Today and on each screen one step away is pressed
// (in a fresh game each time a press changes the game) and the screen it leads to is audited too. Dead buttons are
// reported. Buttons are named by their class and position, or by their UI word when it is a known chrome word.
// Usage (from app/): node tests/review/tour.mjs [w h] [HH:MM]   (SHOTS=dir for pictures)
import * as L from './lib.mjs';
const [,, w = '390', h = '844', hm = '09:00'] = process.argv;
const at = `2026-09-30T${hm}:00+01:00`;
const SHOTS = process.env.SHOTS;
const CHROME = new Set(['Map', 'Records', 'Satchel', 'Week', 'Daybook', '+ Add', 'Delve', 'I can’t start', 'Not today', 'Something else…', 'Settings',
  'Plan my week', 'What repeats', 'Next week', 'This week', 'The week after', 'Today', 'Back', 'Put in', 'Marks', 'Keep going', 'Go to sleep', 'Begin',
  'Lay out the rest of the week', 'Earlier', 'Later', 'Add a job', 'Trial', 'Close', 'Delve on it', 'List', 'Put on a day', 'Delete', 'Undo', 'Cancel', 'Put it in']);
const name = (label, cls, i) => CHROME.has(label.trim()) ? `"${label.trim()}"` : `button#${i}.${cls}`;
const all = { fails: 0, errors: 0 };
const { launch } = await import('../flows/browser.mjs');
const browser = await launch();
const summary = [];

async function buttons(R) {
  return R.page.evaluate(() => [...document.querySelectorAll('.phone button, .phone [role=button], .phone label.bed, .phone label.clock-btn')].map((b, i) => {
    const r = b.getBoundingClientRect(), s = getComputedStyle(b);
    const vis = r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && !b.closest('.sr') && !b.classList.contains('sr') && r.bottom > 0 && r.top < innerHeight;
    return { i, vis, label: (b.getAttribute('aria-label') || b.innerText || '').replace(/\s+/g, ' ').slice(0, 40), cls: String(b.className).split(' ')[0] || b.tagName.toLowerCase(), disabled: b.disabled };
  }));
}
async function pressNth(R, i) {
  const l = R.page.locator('.phone button, .phone [role=button], .phone label.bed, .phone label.clock-btn').nth(i);
  await l.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
  const sig = () => R.page.evaluate(() => (document.querySelector('.phone')?.innerText ?? '').length + ':' + document.querySelectorAll('.phone *').length + ':' + [...document.querySelectorAll('[aria-pressed=true],[aria-expanded=true]')].length);
  const a = await sig();
  const r = await l.boundingBox().catch(() => null);
  if (!r) return 'gone';
  await R.page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await R.page.clock.runFor(1300); await R.page.waitForTimeout(60);
  const b = await sig();
  return a === b ? 'nochange' : 'changed';
}

/* the screens reached from Today, and one step further from each */
const froms = [
  ['today', []],
  ['satchel', ['Satchel']], ['week', ['Week']], ['daybook', ['Daybook']], ['map', ['Map']],
  ['choose', ['Something else…']], ['set', [null]], ['cant', ['I can’t start']], ['settings', ['Daybook', 'Settings']],
  ['week-next', ['Week', 'Next week']], ['week-after', ['Week', 'Next week', 'The week after']], ['rhythms', ['Week', 'What repeats']],
];
for (const [label, path] of froms) {
  /* a fresh game for each screen: the buttons pressed on one never change what the next finds */
  let R = await L.start({ w: +w, h: +h, at, tag: hm, browser });
  const goPath = async (R) => {
    for (const p of path) {
      if (p === null) { await L.tap(R, R.page.locator('.next button.btn'), 'Delve'); continue; }
      if (!(await L.has(R, p))) { R.fails.push(`[${label}] no "${p}" on the way`); return false; }
      await L.btn(R, p).first().click(); await R.page.clock.runFor(1400);
    }
    return true;
  };
  if (!(await goPath(R))) { const x = await L.finish(R, `tour ${label}`); all.fails += x.fails; all.errors += x.errors; continue; }
  const here = await L.screen(R);
  await L.audit(R, label);
  if (SHOTS) await R.page.screenshot({ path: `${SHOTS}/${w}x${h}-${hm.replace(':', '')}-${label}.png` });
  const list = (await buttons(R)).filter(b => b.vis && !b.disabled);
  summary.push(`${label} (${here}): ${list.length} buttons`);
  /* each button: pressed; audited where it leads; dead if nothing changed */
  for (const b of list) {
    const res = await pressNth(R, b.i);
    const s = await L.screen(R);
    await L.audit(R, `${label} → ${name(b.label, b.cls, b.i)}`);
    if (res === 'nochange' && !/^(label)/.test(b.cls)) R.notes.push(`[${label}] ${name(b.label, b.cls, b.i)} changed nothing visible`);
    if (s === 'OOPS') R.fails.push(`[${label}] ${name(b.label, b.cls, b.i)} led to "Something went wrong"`);
    /* back to where the button was, in a fresh game if the press changed the game or left the screen */
    await R.context.close();
    R2: {
      const errs = R.errors, fails = R.fails, notes = R.notes;
      R = await L.start({ w: +w, h: +h, at, tag: hm, browser });
      R.errors.push(...errs); R.fails.push(...fails); R.notes.push(...notes);
      await goPath(R);
    }
  }
  const x = await L.finish(R, `tour ${label}`); all.fails += x.fails; all.errors += x.errors;
}
await browser.close();
console.log(summary.join('\n'));
console.log(`tour ${w}x${h} ${hm}: ${all.fails} problem(s), ${all.errors} page error(s)`);
process.exit(all.errors ? 2 : all.fails ? 1 : 0);
