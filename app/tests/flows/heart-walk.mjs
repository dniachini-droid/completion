// The first playable walked on a fake clock at phone size, with a picture of every screen (TEST_STRATEGY.md → layer 5).
// Fails on any page error or any request leaving the app. Usage (from app/, with a build served):
//   node tests/flows/heart-walk.mjs http://localhost:4173/ <out-dir> [width height]
// Day 1 (a Thursday): the Course, the gym, Spanish study → the first place; the map; records. Then more days (one busier,
// for a deep push) until the first word is cut (slice 3): the cut, the stair, the marks. Slice 4: camp and Goodnight on
// day 1, the morning after, the week close on the first Monday (with Plan it for me and the week), + Add and the job editor, the
// rhythms, and a return after days away. The map on day 1 and again after the first word (every light tapped, one stretch
// looked at closer). No story text is asserted.
const { launch } = await import('./browser.mjs');
const [,, url, out, w = '390', h = '844'] = process.argv;
const browser = await launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, timezoneId: 'Europe/London' });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!r.url().startsWith(url) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) errors.push('NETWORK ' + r.url()); });
/* FREEZE=1: every animation stopped at the same instant for each picture, and chance made repeatable, so two builds'
   pictures can be compared pixel for pixel (a change meant to leave the look alone, D-103) */
if (process.env.FREEZE) await page.addInitScript(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
await page.clock.install({ time: new Date('2026-09-24T09:00:00+01:00') });
await page.goto(url);
let i = 0;
/* after a jump the page is given a moment of real time too, so what the jump brings (a delve's end) is on screen before
   the walk looks for it (2026-09-26) */
const ff = async (ms) => { const n = await page.evaluate(() => Date.now()); await page.clock.setSystemTime(n + ms); await page.clock.runFor(500); await page.waitForTimeout(250); await page.clock.runFor(250); };
const shot = async (name, settle = 1500) => { if (settle > 10000) await ff(settle); else await page.clock.runFor(settle); await page.waitForTimeout(300); const held = process.env.FREEZE ? await page.evaluate(() => (window.__held = document.getAnimations().filter(a => a.playState === 'running').map(a => { const t = a.currentTime; a.pause(); a.currentTime = 2300; return [a, t]; })).length) : 0; await page.screenshot({ path: `${out}/${String(++i).padStart(2, '0')}-${name}.png` }); if (held) await page.evaluate(() => window.__held.forEach(([a, t]) => { a.currentTime = t; a.play(); })); await fits(name); await locked(name); if (process.env.COST) await cost(name); };
/** COST=1: what each screen costs the phone while it sits still (D-103), written to <out>/cost.json. The processor's
 *  time for two seconds of the screen's clock, and a census of what keeps moving: animations the graphics chip can run
 *  alone (a moving or fading layer) and those it can't (the phone repaints pixels for them every frame), see-through
 *  blended layers, live canvases. */
const cdp = process.env.COST ? await page.context().newCDPSession(page) : null;
if (cdp) await cdp.send('Performance.enable');
const costs = [];
const metric = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
const cost = async (name) => {
  const a = await metric(); await page.clock.runFor(2000); const b = await metric();
  const census = await page.evaluate(() => {
    const onGpu = new Set(['transform', 'opacity', 'translate', 'scale', 'rotate', 'filter']);
    const desc = e => { const c = e.className?.baseVal ?? e.className; return e.tagName.toLowerCase() + (c ? '.' + String(c).trim().split(/\s+/).slice(0, 2).join('.') : ''); };
    const running = document.getAnimations().filter(an => an.playState === 'running' && an.effect?.target && (an.effect.getComputedTiming().iterations === Infinity || (an.effect.getComputedTiming().endTime - (an.currentTime ?? 0)) > 0));
    const repaint = [], gpu = [];
    for (const an of running) {
      const t = an.effect.target, props = [...new Set(an.effect.getKeyframes().flatMap(k => Object.keys(k).filter(x => !['offset', 'easing', 'composite', 'computedOffset'].includes(x))))];
      const svgChild = t instanceof SVGElement && !(t instanceof SVGSVGElement);
      const cheap = !svgChild && props.every(x => onGpu.has(x)) && !(props.includes('filter'));
      (cheap ? gpu : repaint).push(`${desc(t)} [${props.join(',')}]${an.effect.getComputedTiming().iterations === Infinity ? ' ∞' : ''}`);
    }
    const all = [...document.querySelectorAll('.phone *, body > *')];
    const blends = all.filter(e => getComputedStyle(e).mixBlendMode !== 'normal').map(desc);
    const filters = all.filter(e => { const f = getComputedStyle(e).filter; return f !== 'none'; }).map(e => desc(e) + ' ' + getComputedStyle(e).filter.slice(0, 40));
    const canvases = [...document.querySelectorAll('canvas')].map(c => `${desc(c)} ${c.width}x${c.height}`);
    return { repaint, gpu: gpu.length, gpuList: gpu, blends: blends.length, blendList: blends, filters, canvases, smil: document.querySelectorAll('animate, animateMotion, animateTransform').length };
  });
  const ms = k => +((b[k] - a[k]) * 1000 / 2).toFixed(1);
  costs.push({ screen: name, taskMsPerS: ms('TaskDuration'), scriptMsPerS: ms('ScriptDuration'), styleMsPerS: ms('RecalcStyleDuration'), layoutMsPerS: ms('LayoutDuration'), ...census });
};
/** The screen never slides (Dan, review 2): nothing can be scrolled sideways, and the page itself never scrolls. */
const locked = async (name) => {
  const bad = await page.evaluate(() => [document.scrollingElement, ...document.querySelectorAll('.phone *')].filter(e => {
    if (!e) return false; const s = getComputedStyle(e);
    /* the map alone is dragged around, and only once a region is wider than the screen (D-092) */
    if (e.dataset?.pan === 'map') { const svg = e.querySelector('svg'); if (svg && svg.getBoundingClientRect().width > e.clientWidth + 1) return false; }
    const sideways = (s.overflowX === 'auto' || s.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 1;
    return sideways || e.scrollLeft > 0 || (e === document.scrollingElement && e.scrollTop > 0);
  }).map(e => e.className?.baseVal ?? e.className ?? e.tagName));
  for (const c of bad) errors.push(`SLIDES ${name}: .${String(c).split(' ')[0]} can move sideways`);
  /* nor up and down just because a glow overhangs it: on a phone that turns a press into a small drag (Dan, 2026-09-26).
     A box may scroll only for what is really in it: measured again with every ::before and ::after taken away. */
  const drags = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('.phone *')].filter(e => { const o = getComputedStyle(e).overflowY; return o === 'auto' || o === 'scroll'; });
    const all = boxes.map(e => e.scrollHeight - e.clientHeight);
    const s = document.createElement('style'); s.textContent = '.phone *::before, .phone *::after { content: none !important; }';
    document.head.appendChild(s);
    const real = boxes.map(e => e.scrollHeight - e.clientHeight); s.remove();
    return boxes.map((e, k) => [e, k]).filter(([, k]) => all[k] > 1 && all[k] > real[k] + 1).map(([e, k]) => `${String(e.className?.baseVal ?? e.className).split(' ')[0]} (${all[k]}px, ${Math.max(0, real[k])}px real)`);
  });
  for (const d of drags) errors.push(`DRAGS ${name}: .${d} scrolls only because a glow overhangs it`);
};
/** No words cut off: every visible line of text is on screen (or inside a box that scrolls), and none sits under a button.
 *  Reports the screen and the element's class only, never the words (the story stays sealed). */
const fits = async (name) => {
  /* judged once the screen has settled: a crossfade (words arriving where a button is leaving) runs on the screen's own
     clock, not the walk's, and on a busy machine it can still be half-way here; looping motion (dust, glow) doesn't count */
  for (let k = 0; k < 20 && await page.evaluate(() => document.getAnimations().some(a => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity)); k++) await page.waitForTimeout(150);
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
/** Back along the trail with the arrow at the top left until Today (its foot links) is on screen (review 2, D-088). */
const home = async () => { for (let k = 0; k < 6 && !(await page.locator('nav.foot').count()); k++) { await page.locator('button.home').first().click(); await page.clock.runFor(1200); } };
const backSays = async () => (await page.locator('button.home').first().innerText()).trim().toLowerCase();
const has = async (text) => (await page.getByRole('button', { name: text, exact: true }).count()) > 0;
/** A button by its name. Stuck (no such button): a picture of the screen, `stuck-<name>.png`, and the screen's own class
 *  names only (never its words: the story stays sealed), before the walk fails. */
const tap = async (text) => {
  const b = page.getByRole('button', { name: text, exact: true }).first();
  try { await b.click({ timeout: 8000 }); return; } catch { /* covered, or not there */ }
  /* a delve that ended while the walk was elsewhere is shown when it ends, or on the way back to Today (D-120): the walk
     takes its end as Dan would (Not yet, then back to Today) and goes on */
  if (await page.locator('.dv').count() && !(await b.count())) {
    for (const w of ['Not yet', 'Back to today']) { const x = page.getByRole('button', { name: w, exact: true }).first(); if (await x.count()) { await x.click(); await page.clock.runFor(1200); } }
    try { await b.click({ timeout: 8000 }); return; } catch { /* still not there */ }
  }
  try { await b.click({ force: true, timeout: 8000 }); return; } catch (e) {
    await page.screenshot({ path: `${out}/stuck-${text.replace(/\W+/g, '-')}.png` }).catch(() => {});
    const where = await page.evaluate(() => [...document.querySelectorAll('.phone > *, #app > *, .ui, main')].map(x => x.className?.baseVal ?? x.className).filter(Boolean).slice(0, 8).join(' | ')).catch(() => '?');
    console.error(`STUCK: no "${text}" button; the screen: ${where}; ${screensSoFar()} screens so far`);
    throw e;
  }
};
const screensSoFar = () => i;
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
/** Looking at the painting (D-105), on the first arrival: "Look" fades everything laid over it; two fingers zoom the
 *  painting alone and one moves it; the page itself never zooms or moves; a tap comes back with the screen as it was. */
let looked = false;
const lookCheck = async (name) => {
  looked = true;
  const state = () => page.evaluate(() => {
    const pic = document.querySelector('.paint.scene'), ui = document.querySelector('.ui'), b = document.querySelector('.phone').getBoundingClientRect();
    return { t: pic.style.transform, ui: +getComputedStyle(ui).opacity, look: !!document.querySelector('.look'),
      page: [scrollX, scrollY, document.scrollingElement.scrollTop, visualViewport.scale, b.x, b.y, b.width, b.height] };
  });
  const before = await state();
  await tap('Look'); await page.clock.runFor(600); await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${String(++i).padStart(2, '0')}-${name}-look.png` });
  let s = await state();
  if (!s.look || s.ui > 0.05) errors.push(`LOOK ${name}: the words did not fade (${s.ui})`);
  /* two fingers spread from the middle, then one finger drags */
  await page.evaluate(() => {
    const el = document.querySelector('.look'), f = (type, id, x, y) => el.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: id === 1 }));
    const cx = innerWidth / 2, cy = innerHeight / 2;
    f('pointerdown', 1, cx - 20, cy); f('pointerdown', 2, cx + 20, cy);
    for (let k = 1; k <= 10; k++) { f('pointermove', 1, cx - 20 - k * 8, cy); f('pointermove', 2, cx + 20 + k * 8, cy); }
    f('pointerup', 2, cx + 100, cy);
    for (let k = 1; k <= 5; k++) f('pointermove', 1, cx - 100 + k * 10, cy + k * 10);
    f('pointerup', 1, cx - 50, cy + 50);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${String(++i).padStart(2, '0')}-${name}-look-zoom.png` });
  s = await state();
  const m = /scale\(([\d.]+)\)/.exec(s.t);
  if (!m || +m[1] < 2.5) errors.push(`LOOK ${name}: the painting did not zoom (${s.t})`);
  if (!s.look) errors.push(`LOOK ${name}: a pinch closed the look`);
  if (JSON.stringify(s.page) !== JSON.stringify(before.page)) errors.push(`LOOK ${name}: the page moved or zoomed ${JSON.stringify(s.page)}`);
  /* a tap comes back */
  await page.locator('.look').click(); await page.clock.runFor(800); await page.waitForTimeout(800);
  s = await state();
  if (s.look || s.t || s.ui < 0.95) errors.push(`LOOK ${name}: did not come back as it was (${s.t}, ${s.ui})`);
  if (JSON.stringify(s.page) !== JSON.stringify(before.page)) errors.push(`LOOK ${name}: the page moved after looking`);
  /* a tap on the clear painting looks too */
  const gap = page.locator('.gap'); await gap.click(); await page.clock.runFor(300);
  if (!(await page.locator('.look').count())) errors.push(`LOOK ${name}: a tap on the painting did not look`);
  await page.locator('.look').click(); await page.clock.runFor(800); await page.waitForTimeout(600);
};
/** Play each arrival in turn, back to Today. */
const arrivals = async (name) => {
  for (let k = 0; k < 6; k++) {
    if (await cutIfAny(`${name}-${k}`)) continue;
    if (!(await page.locator('.arr').count())) return;
    await shot(`${name}-${k}`, 6000); if (!looked) await lookCheck(`${name}-${k}`); await guessIfAny(`${name}-${k}`);
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
  /* up to eight screens can wait on an opening (arrivals, a morning, a welcome, a week close): each is seen in turn */
  for (let k = 0; k < 8; k++) {
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
        await home(); await page.clock.runFor(1500); await shot(name + '-today-planned', 2500);
      } else if (closes === 2) {
        /* the week's look-ahead (D-116): still wanted, coming up, what matters most, and on to the week */
        await tap('Look ahead'); await page.clock.runFor(600); await shot(name + '-look', 600);
        for (let n = 0; n < 3 && await has('Keep'); n++) { await tap('Keep'); await page.clock.runFor(300); }
        if (await has('Next')) { await shot(name + '-coming', 500); await tap('Next'); await page.clock.runFor(400); }
        await shot(name + '-matters', 500);
        if (!(await has('Nothing in particular'))) errors.push('LOOK AHEAD never asked what matters most');
        else { await page.locator('.offer button.row').first().click(); await page.clock.runFor(1500); }
        if (!(await page.locator('h1', { hasText: /this week/i }).count())) errors.push('LOOK AHEAD did not end in the week');
        await home(); await page.clock.runFor(1500);
      } else { await tap('Not now'); await page.clock.runFor(1500); }
      continue;
    }
    return;
  }
};
/* Going to bed lives on Today (no camp page, D-093): "Tonight" with Go to sleep shows only in the evening */
const camp = async (name, loud) => {
  /* only from Today: an arrival also offers "Keep going", and the walk once took it for Today and waited for Go to sleep
     there (the stall seen since 2026-09-26) */
  if (!(await has('Keep going')) || !(await page.locator('nav.foot').count())) return;
  if (await has('Go to sleep')) errors.push('TONIGHT offered before the evening');
  await toClock(0, 22, 30); await page.clock.runFor(1500);
  if (loud) await shot(name + '-tonight', 1500);
  await tap('Go to sleep'); if (loud) await shot(name + '-goodnight', 2500); else await page.clock.runFor(800);
  if (!(await page.locator('nav.foot').count())) errors.push('TONIGHT Go to sleep left Today');
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

/** Where every light on the map sits (relative to the map), the map's
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
/** The map: one map (D-092), opening on the region at where Dan is; every light tapped (only the crosshair and the
 *  words may move). */
const mapWalk = async (name) => {
  await tap('Map'); await page.waitForTimeout(2500); await shot(name + '-region', 3500);
  let g = await mapGeometry();
  const n = await page.locator('circle.node').count();
  for (let k = 0; k < n; k++) { await page.locator('circle.node').nth(k).click(); await still(g, `${name} region light ${k}`); await shot(`${name}-tap-${k}`, 300); }
  await page.locator('circle.node[data-kind="here"]').first().click(); await still(g, `${name} back to here`);
  if (await has('Look closer')) errors.push(`map: a second, closer map is back (${name}, D-092)`);
  await home(); await page.clock.runFor(2500);
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
  await home(); await page.clock.runFor(2500);
}
if (campDay1) await camp('d1', true);
for (let d = 2; d <= 24 && !cut; d++) {
  await toClock(1, 9); await page.reload({ waitUntil: 'domcontentloaded' }); await page.clock.runFor(1500);
  if (await cutIfAny(`d${d}-open`)) break;
  await openers(`d${d}`);
  const high = d === 3;
  /* no Low / Normal / High on Today any more (Dan, D-089): a busy day is Dan's own "Something else…" */
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
/* a word cut first thing on opening comes before that morning's screens: they are seen now (2026-09-26) */
await openers('late');
await mapWalk('map-late');
await tap('Records'); await page.clock.runFor(1500); await tap('Symbols');   /* the Marks tab is called Symbols now */
/* Records ⇄ Marks is a tab: nothing rises or fades in again, the heading stays put (Dan, D-093) */
if ((await page.locator('h1').first().evaluate(e => getComputedStyle(e).animationName)) !== 'none') errors.push('TABS the heading moved on switching');
await shot('marks', 1500);
const openMark = page.locator('.cell .cap.new').first();
if (await openMark.count()) { await openMark.click(); await shot('marks-open', 800); }
const held = page.locator('.cell .cap.known').first();
if (await held.count()) { await held.click(); await shot('marks-held', 800); }
await home(); await page.clock.runFor(1500);
await toClock(1, 9); await page.reload({ waitUntil: 'domcontentloaded' }); await page.clock.runFor(2000);
await openers('last');
if (await has('I can’t start')) { await tap('I can’t start'); await shot('cant-start', 2000); await tap('Not now'); await page.clock.runFor(1500); }
/* slice 4's own screens, from Today's foot */
/* one-tap capture (D-107, D-117): "+ Add" opens a box already typing; Return puts the job on today, a delve */
{ await page.clock.runFor(1500); await page.waitForTimeout(300);   /* the screen settled: no fading one still on it */
  await tap('Add a job to today'); await page.clock.runFor(300);
  if (!(await page.evaluate(() => document.activeElement?.tagName === 'TEXTAREA'))) errors.push('CAPTURE the box was not already typing');
  await page.keyboard.type('Call the bank'); await shot('today-capture', 300);
  await page.keyboard.press('Enter'); await page.clock.runFor(500);
  if (!(await page.locator('nav.foot').getByText('On today').count())) errors.push('CAPTURE did not say it was put on today');
  if (!(await page.locator('nav.foot').count())) errors.push('CAPTURE left Today');
  const row = page.locator('.rows button.row', { hasText: 'Call the bank' });
  if (!(await row.count())) errors.push('CAPTURE the job is not on today');
  else if (/one-off|about/i.test(await row.first().innerText())) errors.push('CAPTURE the job is shown as one without a timer'); }
/* the job editor (D-112), from What repeats' other jobs: renamed; removed, Undo brings it back */
await tap('Week'); await page.clock.runFor(1200); await tap('What repeats'); await page.clock.runFor(1200);
await page.locator('button.row', { hasText: 'Call the bank' }).first().click(); await shot('job-edit', 800);
await page.locator('.editor input.line').first().fill('Call the bank about the card'); await tap('Save'); await page.clock.runFor(800);
if (!(await page.locator('button.row', { hasText: 'Call the bank about the card' }).count())) errors.push('EDIT the job was not renamed');
await page.locator('button.row', { hasText: 'Call the bank about the card' }).first().click(); await page.clock.runFor(800);
await tap('Remove it'); await shot('job-removed', 600);
await tap('Undo'); await page.clock.runFor(800);
if (!(await page.locator('button.row', { hasText: 'Call the bank about the card' }).count())) errors.push('EDIT Undo did not bring the job back');
await home(); await page.clock.runFor(1500); await shot('today-with-line', 2000);
await tap('Week'); await shot('week', 1500);
/* a day folds away with a tap on its name, and opens again (Dan, review 2) */
{ const dn = page.locator('.day:not(.past) button.dname').first(); const n0 = await page.locator('.day button.row').count();
  await dn.click(); await shot('week-folded', 500);
  if ((await page.locator('.day button.row').count()) >= n0) errors.push('FOLD a day did not fold');
  await dn.click(); await page.clock.runFor(300);
  if ((await page.locator('.day button.row').count()) !== n0) errors.push('FOLD a day did not open again'); }
const row = page.locator('.day:not(.past) button.row:not([disabled])').first();
/* a job's sheet: the time box is the phone's own; a tap on a day moves the job there at once (D-093) */
if (await row.count()) {
  await row.click(); await page.locator('.sheet .clock-btn input').fill('14:30'); await page.locator('.sheet .clock-btn input').dispatchEvent('change');
  await shot('week-edit', 800);
  /* "Remind me" where the time is set (D-107): off by default, one tap sets it */
  if (!(await page.locator('.sheet .remind button[aria-pressed="true"]', { hasText: 'Off' }).count())) errors.push('REMIND a reminder was on before it was asked for');
  await page.locator('.sheet .remind button', { hasText: '15 min before' }).click(); await page.clock.runFor(300);
  if (!(await page.locator('.sheet .remind button[aria-pressed="true"]', { hasText: '15 min before' }).count())) errors.push('REMIND the choice was not kept');
  if (!(await page.locator('.day button.row', { hasText: '14:30' }).count())) errors.push('WEEK the time was not kept');
  /* followed by its name to the day it is moved to: counting the day it left is no test, since a job missed earlier in
     the week takes the freed place (D-080). The sheet's days run from today to Sunday, the week's last days on screen.
     A day already holding that job is not chosen (a second session there quietly leaves, PLANNER.md). */
  const name = (await page.locator('.day button.row.open .t').innerText()).trim();
  const moves = page.locator('.sheet .days button'), m = await moves.count(), all = await page.locator('.day').count();
  const holds = async (k) => (await page.locator('.day').nth(all - m + k).locator('button.row .t').allInnerTexts()).filter(x => x.trim() === name).length;
  let to = -1;
  for (let k = m - 1; k >= 0 && to < 0; k--) if ((await moves.nth(k).getAttribute('aria-pressed')) === 'false' && !(await holds(k))) to = k;
  if (to < 0) { console.log('week: no other day this week to move it to; the move is not checked this time'); await page.locator('.day button.row.open').click(); await page.clock.runFor(300); }
  else {
    await moves.nth(to).click(); await page.clock.runFor(500);
    if (await page.locator('.sheet').count()) errors.push('WEEK the sheet stayed open after a move');
    if ((await holds(to)) !== 1) errors.push('WEEK a tap on a day did not move the job there');
  }
}
/* adding a one-off: the + on a day opens a line under it, already typing; Enter puts it there (D-093) */
{ await page.locator('.day:not(.past) button.plus').first().click(); await page.clock.runFor(300);
  if (!(await page.evaluate(() => document.activeElement?.closest('form.new')))) errors.push('WEEK the new line was not ready to type');
  await shot('week-adding', 500);
  await page.keyboard.type('The dentist'); await page.keyboard.press('Enter'); await page.clock.runFor(500);
  if (!(await page.locator('.day:not(.past)').first().locator('button.row', { hasText: 'The dentist' }).count())) errors.push('WEEK the one-off did not land on its day'); }
await tap('What repeats'); await shot('rhythms', 1200);
await page.locator('button.row').first().click(); await shot('rhythm-edit', 800);
await page.locator('.body').evaluate(e => e.scrollTo(0, e.scrollHeight)); await shot('rhythm-edit-end', 500);
await tap('Cancel'); await page.clock.runFor(500);
await tap('This week'); await page.clock.runFor(500); await tap('Next week'); await shot('week-next', 1000);
await home(); await page.clock.runFor(1500);
await tap('Daybook'); await shot('daybook', 1500); await home(); await page.clock.runFor(1500);
/* the back trail (review 2, D-088): each arrow returns where its screen was opened from, and says so */
{
  const expect = (what, got, want) => { if (got !== want) errors.push(`BACK ${what}: arrow says "${got}", expected "${want}"`); };
  await tap('Week'); await tap('Map'); await page.clock.runFor(1500); expect('week → map', await backSays(), 'this week');
  await page.locator('button.home').first().click(); await page.clock.runFor(1200);
  if (!(await page.locator('h1', { hasText: /this week/i }).count())) errors.push('BACK map → week did not return to the week');
  await tap('What repeats'); expect('week → what repeats', await backSays(), 'this week');
  await page.locator('button.home').first().click(); await page.clock.runFor(800);
  await tap('Next week'); expect('this week → next week', await backSays(), 'this week');
  await page.goBack(); await page.clock.runFor(800);
  if (!(await page.locator('h1', { hasText: /this week/i }).count())) errors.push('BACK the phone’s own back did not step back one screen');
  await home();
  await tap('Daybook'); await tap('Settings'); await page.clock.runFor(1500); expect('daybook → settings', await backSays(), 'daybook');
  await page.locator('.remind button', { hasText: '1 h before' }).click(); await shot('settings', 800);
  /* Save a copy, then Restore from it (D-107): the copy is read back, asked about, and restored */
  { const [dl] = await Promise.all([page.waitForEvent('download'), tap('Save a copy')]);
    const file = `${out}/copy.json`; await dl.saveAs(file);
    if (!/^Long Answer save \d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename())) errors.push(`COPY named "${dl.suggestedFilename()}"`);
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), tap('Restore from a copy')]);
    await fc.setFiles(file); await page.clock.runFor(500);
    await shot('settings-restore', 500);
    await tap('Restore it'); await page.clock.runFor(500);
    if (!(await page.getByText('The copy is restored.').count())) errors.push('COPY the restore did not say it was done'); }
  /* the calendar, read-only (D-115): a made-up one stands for the phone's; turned on, its event shows in the week */
  { const day = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
    await page.evaluate(d => localStorage.setItem('bench.calendar', JSON.stringify({ calendars: [{ id: 'w', title: 'Work' }],
      events: [{ id: 'e1', cal: 'w', title: 'Dentist (calendar)', start: `${d}T21:00`, end: `${d}T21:30`, allDay: false }] })), day);
    await tap('Show it'); await page.clock.runFor(800); await shot('settings-calendar', 600);
    await page.locator('button.home').first().click(); await page.clock.runFor(800); await home(); await page.clock.runFor(1200);
    await tap('Week'); await page.clock.runFor(1200); await shot('week-calendar', 800);
    if (!(await page.locator('.event', { hasText: 'Dentist (calendar)' }).count())) errors.push('CALENDAR the event is not in the week');
    await home(); await page.clock.runFor(800); await tap('Daybook'); await tap('Settings'); await page.clock.runFor(1200); }
  await tap('The trial’s own controls'); await page.clock.runFor(1500); expect('settings → trial', await backSays(), 'settings');
  await home();
  await tap('Something else…'); await page.locator('.body button.row').first().click(); await page.clock.runFor(800);
  expect('choose → delves', await backSays(), 'back');
  await home();
  await home(); await page.clock.runFor(1500);
  if (!(await page.locator('nav.foot').count())) errors.push('BACK never reached Today');
}
/* away for four days: where you were, and a lighter day to come back to */
await toClock(4, 9); await page.reload({ waitUntil: 'domcontentloaded' }); await page.clock.runFor(1500);
await openers('back'); await shot('back-today', 2500);
if (!closes) errors.push('the week close never showed');
if (!mornings) errors.push('no morning after camp');
if (!looked) errors.push('LOOK never tried: no arrival reached');
if (errors.length) { console.error(errors); process.exitCode = 1; } else console.log('walk: ' + i + ' screens, no errors, no network');
if (process.env.COST) (await import('node:fs')).writeFileSync(`${out}/cost.json`, JSON.stringify(costs, null, 1));
await browser.close();
