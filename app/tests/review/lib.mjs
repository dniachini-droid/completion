// Shared helpers for the hostile screen review (tests/review/*.mjs). Review only: nothing here changes the app.
// Every report names screens by their class names and jobs by the test's own names, never by story words (D-015).
// Usage from an attack script: const R = await start({ w: 390, h: 844, at: '2026-09-30T09:00:00+01:00' });
import { launch } from '../flows/browser.mjs';

export const URL = process.env.URL ?? 'http://localhost:4173/';

export async function start({ w = 390, h = 844, at = '2026-09-30T09:00:00+01:00', tag = '', browser: shared = null } = {}) {
  const browser = shared ?? await launch();
  const context = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: 'Europe/London', hasTouch: true });
  const page = await context.newPage();
  const errors = [], fails = [], notes = [];
  const where = () => R.label;
  page.on('pageerror', e => errors.push(`[${where()}] pageerror: ${e.message.split('\n')[0]}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${where()}] console.error: ${m.text().split('\n')[0].slice(0, 200)}`); });
  await page.clock.install({ time: new Date(at) });
  await page.goto(URL);
  const R = { browser, context, page, errors, fails, notes, w, h, tag, label: 'start', shared: !!shared };
  await drawn(R);
  await toToday(R);
  return R;
}

/** Wait until the app has drawn something to press. */
export async function drawn(R) {
  const { page } = R;
  for (let k = 0; k < 40 && !(await page.locator('nav.foot, button.btn, button.home').count()); k++) { await page.waitForTimeout(250); await page.clock.runFor(250); }
}

export const btn = (R, name) => R.page.getByRole('button', { name, exact: true });

/** Which screen is on: by the screen's own class names only. */
export async function screen(R) {
  return R.page.evaluate(() => {
    if (document.querySelector('.oops')) return 'OOPS';
    if (document.querySelector('.dv')) return 'delve';
    if (document.querySelector('.rs')) return 'set';
    if (document.querySelector('nav.foot')) return 'today';
    const h1 = document.querySelector('.ui h1');
    const heads = { 'The Satchel': 'satchel', 'This week': 'week', 'Next week': 'week', 'A later week': 'week', 'Settings': 'settings' };
    if (h1 && heads[h1.textContent.trim()]) return heads[h1.textContent.trim()];
    if (document.querySelector('.route')) return 'step';
    if (document.querySelector('.cal') && document.querySelector('.ui .body')) return 'screen-with-cal';
    const ui = document.querySelector('.phone > .ui, .phone .ui');
    return ui ? 'other:' + [...document.querySelectorAll('.phone > *')].map(e => String(e.className?.baseVal ?? e.className).split(' ')[0]).filter(Boolean).slice(0, 4).join('|') : 'blank';
  });
}

/** Clock helpers (the app's clock is Playwright's fake one). */
export async function ff(R, ms) {
  const { page } = R;
  const n = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(250);
}
export async function run(R, ms) { await R.page.clock.runFor(ms); }
/** To a wall time `days` game-days on (the game day turns at 04:00). Forward only. */
export async function toClock(R, days, hh, mm = 0) {
  const { page } = R;
  const n = await page.evaluate(() => Date.now());
  const to = await page.evaluate(([n, days, hh, mm]) => { const d = new Date(n); if (d.getHours() < 4) d.setDate(d.getDate() - 1); d.setDate(d.getDate() + days); d.setHours(hh, mm, 0, 0); return d.getTime(); }, [n, days, hh, mm]);
  if (to > n) { await page.clock.setSystemTime(to); await page.clock.runFor(500); await page.waitForTimeout(200); await page.clock.runFor(500); }
}
/** Another app: the page hidden, time passes, the page shown again (as the flow checks do). */
export async function hide(R, on) {
  await R.page.evaluate(on => { Object.defineProperty(document, 'hidden', { get: () => on, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, on);
  await R.page.clock.runFor(300);
}
export async function away(R, ms) { await hide(R, true); await ff(R, ms); await hide(R, false); await R.page.clock.runFor(1500); await R.page.waitForTimeout(150); }

/** A finger's tap where the thing is drawn. Returns false (and records it) if it isn't there. */
export async function tap(R, loc, what, settle = 1200) {
  const l = typeof loc === 'string' ? btn(R, loc) : loc;
  await l.first().scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
  const r = await l.first().boundingBox().catch(() => null);
  if (!r) { R.fails.push(`[${R.label}] no ${what ?? loc} to tap (screen: ${await screen(R)})`); return false; }
  await R.page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
  await R.page.clock.runFor(settle); await R.page.waitForTimeout(60);
  return true;
}
/** Taps `n` times at the same point, `gap` ms of the app's clock apart. */
export async function multiTap(R, loc, n, gap, what) {
  const l = typeof loc === 'string' ? btn(R, loc) : loc;
  await l.first().scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
  const r = await l.first().boundingBox().catch(() => null);
  if (!r) { R.fails.push(`[${R.label}] no ${what ?? loc} to multi-tap`); return false; }
  /* real time between and after the taps: the fake clock also flows in real time, so the app sees the taps as far apart
     as a finger makes them (advancing it with runFor while Chromium delivers a tap late made taps look a second apart) */
  for (let i = 0; i < n; i++) { await R.page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); if (i < n - 1) await R.page.waitForTimeout(gap); }
  await R.page.waitForTimeout(1200);
  return true;
}
export async function has(R, name) { return (await btn(R, name).count()) > 0; }

/** Back to Today by the arrow (or the end's own way out), past whatever waits. */
export async function toToday(R) {
  const { page } = R;
  for (let k = 0; k < 10 && (await screen(R)) !== 'today'; k++) {
    for (const w of ['Not yet']) if (await has(R, w)) { await page.getByRole('button', { name: w, exact: true }).first().click(); await page.clock.runFor(900); }
    const way = (await page.locator('button.home').count()) ? page.locator('button.home').first()
      : (await btn(R, 'Back to today').count()) ? btn(R, 'Back to today').first() : page.locator('button.btn').first();
    await way.click({ timeout: 3000 }).catch(() => {}); await page.clock.runFor(1300); await page.waitForTimeout(50);
  }
  return (await screen(R)) === 'today';
}

/** Add a job to today with Today's "Add a job". */
export async function addToday(R, name) {
  await R.page.locator('.today-add').first().click(); await R.page.clock.runFor(300);
  await R.page.keyboard.type(name); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(800);
}
/** Put a job in the satchel (on the satchel screen). */
export async function putSatchel(R, name) {
  await R.page.locator('form.new input').fill(name); await R.page.locator('form.new button').click(); await R.page.clock.runFor(600);
}
export const row = (R, name) => R.page.locator('.rows button.row', { hasText: name });
export const item = (R, name) => R.page.locator('.item', { hasText: name }).first();

/** A row slid left on Today (a mouse drag, as delete-day.mjs does). */
export async function slide(R, name) {
  const strip = R.page.locator('.swipe', { hasText: name }).first();
  const r = await strip.boundingBox().catch(() => null);
  if (!r) { R.fails.push(`[${R.label}] no row ${name} to slide`); return null; }
  await R.page.mouse.move(r.x + r.width - 30, r.y + r.height / 2); await R.page.mouse.down();
  await R.page.mouse.move(r.x + r.width - 260, r.y + r.height / 2, { steps: 8 }); await R.page.mouse.up(); await R.page.clock.runFor(600);
  return strip;
}

/** Begin a delve on the set-up screen, if it's there. */
export async function beginIfSet(R) { if (await R.page.locator('.rs').count()) await tap(R, 'Begin'); }

/** Looks at the screen as it is and records anything sideways, cut off or broken. Names classes only. */
export async function audit(R, name) {
  R.label = name;
  const { page } = R;
  /* let one-shot animations settle (looping ones don't count) */
  /* CSS animations run on real time, not the fake clock: wait in real time (as heart-walk's fits() does) */
  for (let k = 0; k < 24 && await page.evaluate(() => document.getAnimations().some(a => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity)); k++) { await page.clock.runFor(100); await page.waitForTimeout(150); }
  const out = await page.evaluate(() => {
    const W = innerWidth, H = innerHeight, bad = [];
    const cls = e => { const c = e.className?.baseVal ?? e.className; return e.tagName.toLowerCase() + (c ? '.' + String(c).trim().split(/\s+/).slice(0, 2).join('.') : ''); };
    const path = e => { const p = []; for (let x = e; x && x !== document.body && p.length < 3; x = x.parentElement) p.unshift(cls(x)); return p.join('>'); };
    const shown = el => { for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
    if (document.querySelector('.oops')) bad.push('OOPS: "Something went wrong" screen');
    const se = document.scrollingElement;
    if (se.scrollWidth > se.clientWidth + 1) bad.push(`page is ${se.scrollWidth}px wide for a ${se.clientWidth}px screen`);
    if (scrollX || se.scrollLeft) bad.push(`page scrolled sideways by ${scrollX || se.scrollLeft}px`);
    if (scrollY || se.scrollTop) bad.push(`page scrolled down by ${scrollY || se.scrollTop}px`);
    for (const e of document.querySelectorAll('.phone *')) {
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
      const s = getComputedStyle(e);
      if (e.scrollLeft > 0 && !/^(INPUT|TEXTAREA)$/.test(e.tagName)) bad.push(`${path(e)} scrolled sideways by ${e.scrollLeft}px`);
      if (e.dataset?.pan === 'map' || e.closest('[data-pan="map"]')) continue;
      if ((s.overflowX === 'auto' || s.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 1) bad.push(`${path(e)} can scroll sideways (${e.scrollWidth} > ${e.clientWidth})`);
    }
    /* words: every line of text as drawn (Range rects), on the screen sideways and not clipped by a box around it */
    const clipBox = el => { for (let p = el; p && p !== document.body; p = p.parentElement) { const ps = getComputedStyle(p); if (ps.overflowX !== 'visible' || ps.overflowY !== 'visible') return p; } return null; };
    const walker = document.createTreeWalker(document.querySelector('.phone') ?? document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest('svg, .sr, .sr-live, [aria-hidden=true]') || !shown(el)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const rects = [...rg.getClientRects()].filter(r => r.width > 1 && r.height > 1);
      if (!rects.length) continue;
      const box = clipBox(el), br = box?.getBoundingClientRect();
      /* a row slid aside (Not today / Delete showing) is clipped by design; a row at rest is not */
      const slid = el.closest('.swipe button.row')?.style.transform;
      const inSwipe = box?.classList.contains('swipe') && !!slid && !/translateX\(0px\)/.test(slid);
      const ellipsisOwn = box === el && getComputedStyle(el).textOverflow === 'ellipsis';
      if (ellipsisOwn) { if (el.scrollWidth > el.clientWidth + 1 && !seen.has('ell' + path(el))) { seen.add('ell' + path(el)); bad.push(`${path(el)} truncated with an ellipsis (by design?)`); } continue; }
      for (const r of rects) {
        const key = path(el);
        if ((r.right > W + 1 || r.left < -1) && !inSwipe && !seen.has('side' + key)) { seen.add('side' + key); bad.push(`${key} text runs off the side (${Math.round(r.left)}..${Math.round(r.right)} of ${W})`); }
        if (box && !inSwipe && (r.right > br.right + 1 || r.left < br.left - 1) && !seen.has('cut' + key)) { seen.add('cut' + key); bad.push(`${key} text cut at the side of ${cls(box)} (${Math.round(r.left)}..${Math.round(r.right)} in ${Math.round(br.left)}..${Math.round(br.right)})`); }
        /* cut top or bottom by a box that does not scroll */
        if (box && !inSwipe && getComputedStyle(box).overflowY !== 'auto' && getComputedStyle(box).overflowY !== 'scroll' && (r.bottom > br.bottom + 2 || r.top < br.top - 2) && !seen.has('cutv' + key)) {
          const clamp = getComputedStyle(box).webkitLineClamp;
          if (!clamp || clamp === 'none') { seen.add('cutv' + key); bad.push(`${key} text cut top/bottom by ${cls(box)}`); }
        }
      }
      if (getComputedStyle(el).textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && !seen.has('ell' + path(el))) { seen.add('ell' + path(el)); bad.push(`${path(el)} truncated with an ellipsis`); }
    }
    /* controls that can't be reached: drawn above or below the screen, with no box that scrolls to bring them in */
    /* a control's words, only when they are the app's own chrome (never story words) */
    const CH = /^(\+ Add|Satchel|Week|Daybook|Delve|I can’t start|Not today|Something else…|Map|Records|Begin|Pause|Finish here|Done|Not yet|Back to today|Back to the delve|Carry on|Delete|Undo|List|Put on a day|Put in|Go to sleep|Keep going|Plan my week|Settings|Today|It’s done|Put it back|Delve on it|Add|Another day…|Not this week|Change the job)$/;
    const chrome = el => { const x = (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' '); return CH.test(x) ? `"${x}"` : `(${el.tagName.toLowerCase()})`; };
    const scroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p; } return null; };
    for (const e of document.querySelectorAll('.phone button, .phone input, .phone textarea, .phone label.bed')) {
      if (e.closest('.sr') || e.classList.contains('sr') || !shown(e) || e.disabled) continue;
      if (e.closest('[data-pan="map"]')) continue;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      if ((r.top >= H - 2 || r.bottom > H + 8 || r.bottom <= 0) && !scroller(e)) bad.push(`UNREACHABLE ${path(e)} ${chrome(e)} at y ${Math.round(r.top)}..${Math.round(r.bottom)} of ${H}, nothing scrolls to it`);
    }
    /* controls themselves (a button or box) off the side of the screen */
    for (const e of document.querySelectorAll('.phone button, .phone input, .phone textarea')) {
      if (e.closest('.sr') || e.classList.contains('sr') || !shown(e)) continue;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      const box = clipBox(e); if (box?.classList.contains('swipe') || e.closest('.swipe')) continue;
      if (r.right > W + 1 || r.left < -1) bad.push(`${path(e)} control runs off the side (${Math.round(r.left)}..${Math.round(r.right)} of ${W})`);
    }
    return [...new Set(bad)];
  });
  for (const b of out) R.fails.push(`[${name} @${R.w}x${R.h}] ${b}`);
  return out;
}

/** A tap that must change something on the screen (the DOM's text or which screen is on); a dead button otherwise. */
export async function tapChanges(R, loc, what) {
  const sig = () => R.page.evaluate(() => (document.querySelector('.phone')?.innerHTML.length ?? 0) + ':' + (document.querySelector('.phone')?.innerText ?? '').length + ':' + document.querySelectorAll('.phone *').length);
  const a = await sig();
  const ok = await tap(R, loc, what);
  if (!ok) return false;
  const b = await sig();
  if (a === b) R.fails.push(`[${R.label}] DEAD: tapping ${what} changed nothing`);
  return a !== b;
}

export async function reload(R) {
  await R.page.reload(); await R.page.clock.runFor(1500); await drawn(R);
}

export async function finish(R, scriptName) {
  if (R.shared) await R.context.close(); else await R.browser.close();
  const all = [...R.fails, ...R.errors];
  for (const n of R.notes) console.log('NOTE:', n);
  for (const f of all) console.log('FAIL:', f);
  console.log(`${scriptName} (${R.w}x${R.h}${R.tag ? ' ' + R.tag : ''}): ${all.length ? all.length + ' problem(s)' : 'ok'}; page errors: ${R.errors.length}`);
  return { fails: R.fails.length, errors: R.errors.length };
}

/** A job's list as the Satchel shows it (the preview line). */
export async function preview(R, name) { return item(R, name).locator('.preview').innerText().catch(() => ''); }

/** The save's facts, as the browser keeps them (the bench's localStorage). */
export async function facts(R) { return R.page.evaluate(() => { try { return JSON.parse(localStorage.getItem('save.v1') ?? '{"facts":[]}').facts; } catch { return null; } }); }
/** Minutes walked: the sum of stepsGained (what moves the expedition). */
export async function walked(R) { const f = await facts(R); return (f ?? []).filter(x => x.type === 'stepsGained').reduce((a, x) => a + x.minutes, 0); }
/** A job's list as saved (from its latest jobSaved, or the content). */
export async function savedJob(R, id) { const f = await facts(R); const s = (f ?? []).filter(x => x.type === 'jobSaved' && x.job.id === id); return s.length ? s[s.length - 1].job : null; }
/** The id of a job added by name (itemAdded). */
export async function idOf(R, name) { const f = await facts(R); const a = (f ?? []).filter(x => x.type === 'itemAdded' && x.name === name); return a.length ? a[a.length - 1].id : null; }
export async function running(R) { return R.page.evaluate(() => !!document.querySelector('.dv')); }
