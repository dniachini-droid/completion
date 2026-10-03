// Words and accessibility after the deep review (D-147, Stage 5): Today's small targets are a finger high; no visible
// text under 14 px on the main screens; the job menu takes VoiceOver's focus, leaves the screen under it inert, and
// gives focus back to the row; each unknown symbol has a name of its own; a recurring job reads "once a week", never
// "1 a week". TS=1.3 runs it with the phone's text size set larger (Dynamic Type).
// Usage: node tests/flows/a11y5.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;
const small = page => page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.phone *')) {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    if (!r.width || !r.height || s.visibility === 'hidden' || +s.opacity < .05 || el.closest('[aria-hidden="true"], .sr-only, .sr')) continue;
    if (parseFloat(s.fontSize) < 13.95) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${s.fontSize}`);
  }
  return [...new Set(out)];
});

{
  const page = await K.open('keys', '2026-10-08T09:00:00+01:00');
  const { tap, home, btn, row } = K.helpers(page);
  await home();
  for (const [sel, what] of [['button.keys', 'the Keys'], ['h1 button.here', 'the place\'s name'], ['.key-line .key-use', 'the Key link']]) {
    const b = await page.locator(sel).first().boundingBox().catch(() => null);
    if (b && b.height < 43.5) fails.push(`${what} is ${Math.round(b.height)} px high, under 44`);
  }
  for (const [where, go] of [['Today', null], ['the Satchel', 'Satchel'], ['the Week', 'Week']]) {
    if (go) { await home(); await tap(page.locator('.foot').getByRole('button', { name: go, exact: true }), go); }
    for (const x of await small(page)) fails.push(`${where}: text under 14 px: ${x}`);
  }
  /* a recurring job: once a week, never "1 a week" */
  if (await page.getByText(/\b\d a week\b/).count()) fails.push('"N a week" is said somewhere: it reads "N times a week"');
  await home();
  /* the job menu takes focus, the screen under it is inert, and focus returns */
  const r = row('Course').or(page.locator('.rows button.row:not(.done)')).first();
  const box = await r.boundingBox().catch(() => null);
  if (box) {
    await r.focus();
    await page.mouse.move(box.x + 60, box.y + box.height / 2); await page.mouse.down();
    await page.waitForTimeout(700); await page.clock.runFor(700); await page.mouse.up(); await page.clock.runFor(400);
    if (!(await page.evaluate(() => !!document.activeElement?.closest('.menu')))) fails.push('the job menu did not take focus');
    if (!(await page.evaluate(() => [...document.querySelectorAll('main.phone > .ui')].every(e => e.inert)))) fails.push('the screen under the job menu is not inert');
    await page.locator('.menu button.item.cancel').click(); await page.clock.runFor(400);
    if (!(await page.evaluate(() => document.activeElement?.classList.contains('row')))) fails.push('focus did not return to the row');
  } else fails.push('no job row to hold');
  /* each unknown symbol its own name */
  await tap(page.locator('.navs').getByRole('button', { name: 'Records', exact: true }), 'Records');
  await tap(btn('Symbols'), 'Symbols');
  const names = await page.locator('.grid.small button.cell').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label')));
  if (names.length > 1 && new Set(names).size !== names.length) fails.push('unknown symbols share one name');
  for (const x of await small(page)) fails.push(`Symbols: text under 14 px: ${x}`);
  await page.close();
}

await K.end('a11y5');
