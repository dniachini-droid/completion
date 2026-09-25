// The first playable walked on a fake clock at phone size, with a picture of every screen (TEST_STRATEGY.md → layer 5).
// Fails on any page error or any request leaving the app. Usage (from app/, with a build served):
//   PLAYWRIGHT=$(npm root -g)/playwright/index.mjs node tests/flows/heart-walk.mjs http://localhost:4173/ <out-dir> [width height]
// Day 1 (a Thursday): the Course, the gym, Spanish study → the first place; the map; records. Then more days (one High,
// for a deep push) until the first word is cut (slice 3): the cut, the stair, the marks. Slice 4: camp and Goodnight on
// day 1, the morning after, the week close on the first Monday (with Plan it for me and the week), the satchel, the
// rhythms, and a return after days away. The map on day 1 and again after the first word (every light tapped, one stretch
// looked at closer). No story text is asserted.
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const [,, url, out, w = '390', h = '844'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, timezoneId: 'Europe/London' });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!r.url().startsWith(url) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) errors.push('NETWORK ' + r.url()); });
await page.clock.install({ time: new Date('2026-09-24T09:00:00+01:00') });
await page.goto(url);
let i = 0;
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); };
const shot = async (name, settle = 1500) => { if (settle > 10000) await ff(settle); else await page.clock.runFor(settle); await page.waitForTimeout(300); await page.screenshot({ path: `${out}/${String(++i).padStart(2, '0')}-${name}.png` }); await fits(name); };
/** No words cut off: every visible line of text is on screen (or inside a box that scrolls), and none sits under a button.
 *  Reports the screen and the element's class only, never the words (the story stays sealed). */
const fits = async (name) => {
  const bad = await page.evaluate(() => {
    const H = innerHeight, W = innerWidth, out = [];
    const scroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p; } return null; };
    const shown = el => { for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
    /* text still fading in (a moment mid-animation) is not judged until it has settled */
    const settled = el => { let o = 1; for (let p = el; p; p = p.parentElement) o *= +getComputedStyle(p).opacity; return o >= 0.6; };
    const texts = [...document.querySelectorAll('p, h1, h2, h3, span, li, em, blockquote')].filter(el =>
      [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !el.closest('button, svg') && shown(el) && settled(el));
    /* each button as it is actually seen: cut to the box it scrolls in (a row scrolled out of view covers nothing) */
    const buttons = [...document.querySelectorAll('button')].filter(shown).map(b => {
      /* a quiet text link's tap area is taller than what it shows: measure its visible words, not its hit box */
      const vis = b.classList.contains('text-link') || b.classList.contains('home') ? (b.querySelector('span') ?? b) : b;
      const r = vis.getBoundingClientRect(), sc = scroller(b), c = sc ? sc.getBoundingClientRect() : { top: 0, bottom: H };
      return { left: r.left, right: r.right, top: Math.max(r.top, c.top), bottom: Math.min(r.bottom, c.bottom) };
    }).filter(r => r.right > r.left && r.bottom > r.top);
    for (const el of texts) {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const sc = scroller(el);
      const box = sc ? sc.getBoundingClientRect() : { top: 0, bottom: H, left: 0, right: W };
      if (!sc && (r.bottom > H + 1 || r.top < -1)) out.push(`off screen: ${el.tagName.toLowerCase()}.${el.className}`);
      const vt = Math.max(r.top, box.top), vb = Math.min(r.bottom, box.bottom);
      if (vb - vt > 4) for (const b of buttons) {
        const ix = Math.min(r.right, b.right) - Math.max(r.left, b.left), iy = Math.min(vb, b.bottom) - Math.max(vt, b.top);
        if (ix > 4 && iy > 4) { out.push(`under a button: ${el.tagName.toLowerCase()}.${el.className}`); break; }
      }
    }
    return [...new Set(out)];
  });
  for (const b of bad) errors.push(`${name}: ${b}`);
};
/** The phone's clock to a wall time on this game day, or `days` later (forward only). */
const toClock = async (days, hh, mm = 0) => {
  const n = await page.evaluate(() => Date.now());
  const to = await page.evaluate(([n, days, hh, mm]) => { const d = new Date(n); if (d.getHours() < 4) d.setDate(d.getDate() - 1); d.setDate(d.getDate() + days); d.setHours(hh, mm, 0, 0); return d.getTime(); }, [n, days, hh, mm]);
  if (to > n) { await page.clock.setSystemTime(to); await page.clock.runFor(500); }
};
const has = async (text) => (await page.getByRole('button', { name: text, exact: true }).count()) > 0;
const tap = async (text) => { await page.getByRole('button', { name: text, exact: true }).first().click({ timeout: 8000 }).catch(() => page.getByRole('button', { name: text, exact: true }).first().click({ force: true })); };
/** Today's one button: Delve on a delve job, Begin on one done away from the phone (D-077). */
const start = async () => { if (await has('Delve')) await tap('Delve'); else await tap('Begin'); };
/** Answer whatever guess the screen offers (the first option). */
const guessIfAny = async (name) => {
  const opts = page.locator('.opts .btn-quiet');
  if (await opts.count()) { await shot(name + '-guess', 800); await opts.first().click(); await shot(name + '-guessed', 800); }
};
/** The word, cut (slice 3): the rod, the two marks, the lock; the place answers; through to the stair. */
let cut = false;
const cutIfAny = async (name) => {
  if (!(await page.locator('button.rodbtn').count())) return false;
  await page.clock.runFor(2500); await page.waitForTimeout(1500); await shot(name + '-cut-0', 500);
  await guessIfAny(name + '-cut');   /* a mark the word needs, left unguessed, is asked before the first tap */
  await page.locator('button.rodbtn').click(); await shot(name + '-cut-1', 1200);
  await page.locator('button.key.ready').click(); await shot(name + '-cut-2', 1200);
  await page.locator('button.key.ready').click(); await shot(name + '-cut-3', 1200);
  await page.locator('button.rodbtn').click(); await shot(name + '-cut-lock', 1000);
  await shot(name + '-cut-answer', 2500);
  await shot(name + '-cut-settled', 6000);
  await tap('Go through'); await page.clock.runFor(800); await page.waitForTimeout(1500); await shot('stair', 4000);
  await tap('Today'); await page.clock.runFor(1500);
  cut = true;
  /* "Today" shows any place still waiting first (D-080): play it */
  for (let k = 0; k < 4 && (await page.locator('.arr').count()); k++) {
    await page.clock.runFor(6000);
    const o = page.locator('.opts .btn-quiet'); if (await o.count()) await o.first().click();
    if (await has('Rest here for today')) await tap('Rest here for today'); else await tap('Back to today');
    await page.clock.runFor(1500);
  }
  return true;
};
/** Play each arrival in turn, back to Today. */
const arrivals = async (name) => {
  for (let k = 0; k < 6; k++) {
    if (await cutIfAny(`${name}-${k}`)) continue;
    if (!(await page.locator('.arr').count())) return;
    await shot(`${name}-${k}`, 6000); await guessIfAny(`${name}-${k}`);
    if (await has('Rest here for today')) await tap('Rest here for today'); else await tap('Back to today');
    await page.clock.runFor(1500);
  }
};
/** Today's next job without pictures (the days between), answering guesses and playing arrivals. */
const quiet = async () => {
  if (await has('Done')) await tap('Done');
  else { await start(); await page.clock.runFor(900); if (await has('Begin')) await tap('Begin'); await ff(75 * 60_000); if (await has('Done')) await tap('Done'); }
  await page.clock.runFor(2500);
  const opts = page.locator('.opts .btn-quiet'); if (await opts.count()) await opts.first().click();
  if (await has('See where you are')) {
    await tap('See where you are'); await page.clock.runFor(1500);
    for (let k = 0; k < 6; k++) {
      if (await cutIfAny(`word`)) return;
      if (!(await page.locator('.arr').count())) break;
      await page.clock.runFor(6000);
      const o = page.locator('.opts .btn-quiet'); if (await o.count()) await o.first().click();
      if (await has('Rest here for today')) await tap('Rest here for today'); else await tap('Back to today');
      await page.clock.runFor(1500);
    }
  } else if (await has('Back to today')) { await tap('Back to today'); await page.clock.runFor(1500); }
};
/** Whatever waits on opening, once each: the morning after camp, the welcome back, the daybook's new page. */
let closes = 0, mornings = 0;
const openers = async (name) => {
  for (let k = 0; k < 4; k++) {
    /* a place reached overnight (the head start, D-083) opens the app */
    if (await page.locator('.arr').count() && !(await page.locator('button.rodbtn').count())) { await arrivals(name + '-open'); continue; }
    if (await has('On to today')) { if (mornings++ < 1) await shot(name + '-morning', 2500); await tap('On to today'); await page.clock.runFor(1500); continue; }
    if (await has('Back to today') && (await page.locator('.label-line.welcome').count())) { await shot(name + '-welcome', 2000); await tap('Back to today'); await page.clock.runFor(1500); continue; }
    if (await has('Plan it for me')) {
      if (closes++ === 0) {
        await shot(name + '-daybook', 2500);
        await page.locator('.body').evaluate(e => e.scrollTo(0, e.scrollHeight)); await shot(name + '-daybook-end', 500);
        await tap('Plan it for me'); await shot(name + '-week-planned', 1500);
        await page.locator('.body').evaluate(e => e.scrollTo(0, e.scrollHeight)); await shot(name + '-week-end', 500);
        await tap('Today'); await page.clock.runFor(1500); await shot(name + '-today-planned', 2500);
      } else { await tap('Not now'); await page.clock.runFor(1500); }
      continue;
    }
    return;
  }
};
/** Camp at the day's end: bedtime and Goodnight. */
const camp = async (name, loud) => {
  if (!(await has('To camp'))) return;
  await toClock(0, 22, 30);
  await tap('To camp'); if (loud) await shot(name + '-camp', 2500); else await page.clock.runFor(1500);
  await tap('Go to sleep'); if (loud) await shot(name + '-goodnight', 2500); else await page.clock.runFor(800);
  await tap('Today'); await page.clock.runFor(1000);
};
/** Do today's next job, whatever it is, and show its return. */
const doNext = async (name) => {
  if (await has('Done')) await tap('Done');
  else {
    await start(); await page.clock.runFor(900);
    if (await has('Begin')) { await shot(name + '-set', 800); await tap('Begin'); }
    await ff(75 * 60_000);
    if (await has('Done')) await tap('Done');
  }
  await shot(name + '-return', 2500); await guessIfAny(name);
  if (await has('See where you are')) { await tap('See where you are'); await page.clock.runFor(1500); await arrivals(name + '-arrival'); }
  else if (await has('Back to today')) { await tap('Back to today'); await page.clock.runFor(1500); }
};

/** Where every light on the map sits (relative to the map, so a long close view may scroll its own field), the map's
 *  size and place, the box's size, and the page's scroll: none may change when a light is picked (D-076). */
const mapGeometry = () => page.evaluate(() => {
  const svg = document.querySelector('.field svg').getBoundingClientRect(), field = document.querySelector('.field');
  const r4 = r => [r.x, r.y, r.width, r.height];
  return {
    lights: [...document.querySelectorAll('circle.node')].map(n => { const r = n.getBoundingClientRect(); return [r.x - svg.x, r.y - svg.y, r.width, r.height]; }),
    map: [svg.x, svg.y + field.scrollTop, svg.width, svg.height],
    box: r4(document.querySelector('.box').getBoundingClientRect()),
    page: [window.scrollX, window.scrollY, document.scrollingElement.scrollTop, document.querySelector('.ui').scrollTop],
    clipped: (() => { const b = document.querySelector('.box'); return b.scrollHeight > b.clientHeight + 1; })(),
  };
});
const still = async (before, what) => {
  await page.waitForTimeout(800);   /* past the crosshair's glide, the words' rise and any scroll */
  const after = await mapGeometry(), off = (a, b) => a.some((v, i) => Math.abs(v - b[i]) > 0.5);
  if (after.lights.length !== before.lights.length || after.lights.some((l, i) => off(l, before.lights[i]))) errors.push(`map: a light moved (${what})`);
  if (off(after.map, before.map)) errors.push(`map: the map moved or resized (${what})`);
  if (off(after.box, before.box)) errors.push(`map: the box changed size (${what})`);
  if (off(after.page, before.page)) errors.push(`map: the page scrolled (${what})`);
  if (after.clipped) errors.push(`map: the box overflows (${what})`);
};
/** The map: opens on the region at where Dan is; every light tapped (only the crosshair and the words may move); look
 *  closer; every light there tapped; back out. */
const mapWalk = async (name) => {
  await tap('Map'); await page.waitForTimeout(2500); await shot(name + '-region', 3500);
  let g = await mapGeometry();
  const n = await page.locator('circle.node').count();
  for (let k = 0; k < n; k++) { await page.locator('circle.node').nth(k).click(); await still(g, `${name} region light ${k}`); await shot(`${name}-tap-${k}`, 300); }
  await page.locator('circle.node[data-kind="here"]').first().click(); await still(g, `${name} back to here`);
  if (await has('Look closer')) {
    await tap('Look closer'); await page.waitForTimeout(2500); await shot(name + '-close', 3500);
    g = await mapGeometry();
    const m = await page.locator('circle.node').count();
    for (let k = 0; k < m; k++) { await page.locator('circle.node').nth(k).click(); await still(g, `${name} close light ${k}`); }
    await shot(name + '-close-tap', 300);
    await tap('See the whole region'); await page.clock.runFor(1200);
  }
  await tap('Today'); await page.clock.runFor(2500);
};
await shot('today', 2500);
/* the Course: Begin opens the run set to its hour; a breather; enough */
/* the day's plan leads Today (D-080); the Course is chosen through "Something else…" (D-077) */
await tap('Something else…'); await shot('choose', 1000);
await page.locator('.body button.row', { hasText: 'Course' }).first().click(); await shot('runset', 2000);
await tap('Begin'); await shot('delve', 10 * 60_000);
await ff(26 * 60_000); await shot('breather', 2000);
await ff(30 * 60_000); await shot('course-enough', 2000); await guessIfAny('course');
await tap('Back to today'); await page.clock.runFor(1500);
await doNext('d1-b');
await doNext('d1-c');
await shot('today-complete', 2500);
const campDay1 = true;
await mapWalk('map');
if (await has('Records')) {
  await tap('Records'); await shot('records', 1200);
  const r = page.locator('button.row').first();
  if (await r.count()) { await r.click(); await shot('record', 1200); await tap('Records'); await page.clock.runFor(500); }
  await tap('Today'); await page.clock.runFor(2500);
}
if (campDay1) await camp('d1', true);
for (let d = 2; d <= 24 && !cut; d++) {
  await toClock(1, 9); await page.reload(); await page.clock.runFor(1500);
  if (await cutIfAny(`d${d}-open`)) break;
  await openers(`d${d}`);
  const high = d === 3;
  if (high) await tap('High');
  const loud = d <= 3 || high;
  if (loud) await shot(`d${d}-today`, 2500);
  for (let k = 0; k < (high ? 5 : 3); k++) {
    if (!(await has('Begin')) && !(await has('Delve')) && !(await has('Done'))) break;
    if (loud) await doNext(`d${d}-${k}`); else await quiet();
    if (cut) break;
  }
  if (!cut) await camp(`d${d}`, d === 2);
}
if (!cut) errors.push('the first word was never cut');
await mapWalk('map-late');
await tap('Records'); await page.clock.runFor(800); await tap('Marks'); await shot('marks', 1500);
const openMark = page.locator('.cell .cap.new').first();
if (await openMark.count()) { await openMark.click(); await shot('marks-open', 800); }
const held = page.locator('.cell .cap.known').first();
if (await held.count()) { await held.click(); await shot('marks-held', 800); }
await tap('Today'); await page.clock.runFor(1500);
await toClock(1, 9); await page.reload(); await page.clock.runFor(2000);
await openers('last');
if (await has('I can’t start')) { await tap('I can’t start'); await shot('cant-start', 2000); await tap('Not now'); await page.clock.runFor(1500); }
/* slice 4's own screens, from Today's foot */
await tap('Satchel'); await shot('satchel', 1500);
await tap('Add a line'); await page.locator('textarea.lines').fill('Hoover the hall\nClear the desk\nWash the bedding\nTake the bottles out\nFix the shelf bracket\nRenew the parking permit');
await tap('Put it in'); await shot('satchel-lines', 1000);
await page.getByRole('button', { name: 'Today', exact: true }).nth(1).click(); await shot('satchel-today', 800);
await page.locator('.tickbox').nth(1).click(); await shot('satchel-ticked', 800);
await tap('Today'); await page.clock.runFor(1500); await shot('today-with-line', 2000);
await tap('Week'); await shot('week', 1500);
const row = page.locator('.day:not(.past) button.row:not([disabled])').first();
if (await row.count()) { await row.click(); await tap('Set a time'); await shot('week-edit', 800); await tap('Done'); await page.clock.runFor(500); }
await tap('What repeats'); await shot('rhythms', 1200);
await page.locator('button.row').first().click(); await shot('rhythm-edit', 800);
await page.locator('.body').evaluate(e => e.scrollTo(0, e.scrollHeight)); await shot('rhythm-edit-end', 500);
await tap('Cancel'); await page.clock.runFor(500);
await tap('This week'); await page.clock.runFor(500); await tap('Next week'); await shot('week-next', 1000);
await tap('Today'); await page.clock.runFor(1500);
await tap('Daybook'); await shot('daybook', 1500); await tap('Today'); await page.clock.runFor(1500);
/* away for four days: where you were, and a lighter day to come back to */
await toClock(4, 9); await page.reload(); await page.clock.runFor(1500);
await openers('back'); await shot('back-today', 2500);
if (!closes) errors.push('the week close never showed');
if (!mornings) errors.push('no morning after camp');
if (errors.length) { console.error(errors); process.exitCode = 1; } else console.log('walk: ' + i + ' screens, no errors, no network');
await browser.close();
