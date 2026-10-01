// Deep review (performance): shared helpers. Real clock; only Date is shifted (as tests/flows/idle.mjs), so timers,
// animation frames and CSS animations run as on the phone. Engine-neutral counters injected before the app loads:
// requestAnimationFrame calls, timer fires, live intervals/timeouts, listeners added/removed on window/document.
// Screens are named by class names only, never by story words (D-015).
import { readFileSync } from 'node:fs';
const { launch } = await import('../flows/browser.mjs');
export { launch };

export async function open(b, url, { w = 430, h = 932, dpr = 3, at = '2026-09-30T09:00:00+01:00', save = null } = {}) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, timezoneId: 'Europe/London' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.split('\n')[0]));
  await page.addInitScript(([at, save]) => {
    /* the clock: Date shifted, the shift kept across reloads */
    const R = Date; let shift = sessionStorage.getItem('__shift');
    shift = shift === null ? (new R(at).getTime() - R.now()) : +shift;
    sessionStorage.setItem('__shift', String(shift));
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + shift); } static now() { return R.now() + shift; } }
    window.Date = D;
    window.__at = (ms) => { shift = ms - R.now(); sessionStorage.setItem('__shift', String(shift)); };
    if (save && !sessionStorage.getItem('__seeded')) { localStorage.setItem('save.v1', save); sessionStorage.setItem('__seeded', '1'); }
    /* counters */
    const c = window.__c = { raf: 0, timerFires: 0, liveTimeouts: 0, liveIntervals: 0, addL: 0, removeL: 0, t0: performance.now(), first: null, longTasks: [] };
    const rAF = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (f) => rAF((t) => { c.raf++; f(t); });
    const sT = window.setTimeout.bind(window), cT = window.clearTimeout.bind(window), sI = window.setInterval.bind(window), cI = window.clearInterval.bind(window);
    const live = new Set(), ivs = new Set();
    window.setTimeout = (f, ms, ...a) => { const id = sT((...x) => { live.delete(id); c.timerFires++; typeof f === 'function' ? f(...x) : 0; }, ms, ...a); live.add(id); return id; };
    window.clearTimeout = (id) => { live.delete(id); cT(id); };
    window.setInterval = (f, ms, ...a) => { const id = sI((...x) => { c.timerFires++; f(...x); }, ms, ...a); ivs.add(id); return id; };
    window.clearInterval = (id) => { ivs.delete(id); cI(id); };
    window.__live = () => ({ timeouts: live.size, intervals: ivs.size });
    for (const T of [EventTarget.prototype]) {
      const add = T.addEventListener, rem = T.removeEventListener;
      T.addEventListener = function (...a) { if (this === window || this === document || this === window.visualViewport) c.addL++; return add.apply(this, a); };
      T.removeEventListener = function (...a) { if (this === window || this === document || this === window.visualViewport) c.removeL++; return rem.apply(this, a); };
    }
    /* first interactive screen: Today's foot, or any main button */
    new MutationObserver((_, o) => { if (document.querySelector('nav.foot, button.btn, button.home')) { c.first ??= performance.now(); o.disconnect(); } })
      .observe(document, { childList: true, subtree: true });
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) c.longTasks.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch { /* WebKit: none */ }
  }, [at, save]);
  const P = { page, errors };
  P.btn = (name) => page.getByRole('button', { name, exact: true });
  P.has = async (name) => (await P.btn(name).count()) > 0;
  P.tap = async (loc, wait = 700) => { await loc.first().click({ timeout: 8000 }); await page.waitForTimeout(wait); };
  P.home = async () => {
    for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) {
      if (await P.has('Back to today')) await P.tap(P.btn('Back to today'));
      else if (await page.locator('.home').count()) await P.tap(page.locator('.home'));
      else break;
    }
  };
  P.toToday = async () => {
    for (let k = 0; k < 30 && !(await page.locator('nav.foot').count()); k++) {
      await page.waitForTimeout(800);
      if (await page.locator('nav.foot').count()) break;
      if (!(await page.locator('.next').count()) && await page.locator('button.btn').count()) await page.locator('button.btn').first().click({ timeout: 3000 }).catch(() => {});
      else if (await page.locator('button.home').count()) await page.locator('button.home').first().click({ timeout: 3000 }).catch(() => {});
    }
    return (await page.locator('nav.foot').count()) > 0;
  };
  P.setNow = (ms) => page.evaluate(ms => window.__at(ms), ms);
  P.now = () => page.evaluate(() => Date.now());
  P.counters = () => page.evaluate(() => ({ ...window.__c, longTasks: window.__c.longTasks.length, live: window.__live() }));
  /* what is moving on the page: animations by state, and the endless ones running */
  P.anims = () => page.evaluate(() => {
    const all = document.getAnimations();
    const endless = a => a.effect?.getComputedTiming().iterations === Infinity;
    return { running: all.filter(a => a.playState === 'running').length, endlessRunning: all.filter(a => a.playState === 'running' && endless(a)).length,
      paused: all.filter(a => a.playState === 'paused').length, resting: document.documentElement.hasAttribute('data-resting'),
      marked: document.querySelectorAll('[data-rest],[data-rest-before],[data-rest-after]').length,
      names: [...new Set(all.filter(a => a.playState === 'running' && endless(a)).map(a => a.animationName ?? 'script'))].slice(0, 12) };
  });
  /* a reading of `secs` seconds: rAF/s, timer fires/s, animations */
  P.reading = async (secs) => {
    const a = await P.counters();
    await page.waitForTimeout(secs * 1000);
    const z = await P.counters();
    return { raf: +((z.raf - a.raf) / secs).toFixed(1), timers: +((z.timerFires - a.timerFires) / secs).toFixed(1), ...(await P.anims()) };
  };
  P.dom = () => page.evaluate(() => ({ nodes: document.getElementsByTagName('*').length, imgs: document.images.length,
    paintings: [...new Set([...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(s => /pt-|sample-/.test(s)))].length,
    canvases: document.querySelectorAll('canvas').length, svgs: document.querySelectorAll('svg').length }));
  return P;
}

export const save = (path) => readFileSync(path, 'utf8');
/** The last moment written in a save (to start the clock just after it). */
export function lastAt(raw) {
  const facts = JSON.parse(raw).facts;
  let m = 0;
  for (const f of facts) { const t = Date.parse(f.at ?? ''); if (t > m) m = t; }
  return m;
}
