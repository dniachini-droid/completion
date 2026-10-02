// Screens and getting around after the deep review (D-147, Stage 3): the delve set-up never overlaps itself (a long
// name and a note); a word left for later keeps Today's road line counting and never stands in for the place read again
// ("Read again"); the Week's + on a name Dan has says where it is and moves nothing; Next week ⇄ This week leaves no dead
// back step; Delete on a recurring job asks once; a Key's "Use it here" is offered once, never again after a reload.
// Usage: node tests/flows/screens3.mjs http://localhost:4173/ [width height]
const { kit } = await import('./kit.mjs');
const [,, url, w = '390', h = '844'] = process.argv;
const K = await kit(url, w, h);
const { fails } = K;
const overlap = (a, b) => a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/* 1. the set-up: a 120-character name and a note, nothing overlaps (B10) */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const { btn, tap, has, addJob, row, ff, home } = K.helpers(page);
  const name = 'A very long job name that goes on and on about the things that need doing before the end of the week x';
  await addJob(name);
  await tap(row(name.slice(0, 30)), 'the long job');
  const stop = page.locator('.rs button.stop[aria-label="5 minutes"]');
  if (await stop.count()) await tap(stop, '5 min', 500);
  await tap('Begin'); await ff(6 * 60_000); await page.clock.runFor(2000);
  if (await has('Not yet')) {
    await tap('Not yet');
    await page.locator('input.line.stop').fill('page 42 of the second chapter, where the diagrams start to make no sense at all to me');
    await tap(btn('Back to today').last(), 'Back to today');
  } else fails.push('no Not yet on the long job');
  await home();
  await tap(row(name.slice(0, 30)), 'the long job again');
  const boxes = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
    return { long: r('.rs .stop.long'), head: r('.rs .run h2'), name: r('.rs .job h1'), note: r('.rs .last.note'), dial: r('.rs .dial'), stops: [...document.querySelectorAll('.rs .stops .stop')].map(e => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }) };
  });
  if (!boxes.note) fails.push('the set-up does not show where he stopped');
  if (overlap(boxes.long, boxes.head)) fails.push('the long delve\'s stop overlaps the road\'s heading');
  for (const [k, b] of [['name', boxes.name], ['note', boxes.note]]) {
    if (overlap(b, boxes.dial)) fails.push(`the ${k} overlaps the dial`);
    if (boxes.stops.some(s => overlap(b, s))) fails.push(`the ${k} overlaps a stop of the dial`);
  }
  const lines = await page.locator('.rs .last.note').evaluate(e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
  if (lines < 2) fails.push('the note is cut to one line');
  await page.close();
}

/* 2. a word left for later: the road line counts on; the place's name reads the place, "Read again" (B8, B13, H#13) */
{
  const page = await K.open('word', '2026-10-06T11:05:00+01:00');
  const { btn, tap, home, arrow } = K.helpers(page);
  for (let k = 0; k < 4 && !(await btn('Later').count()); k++) { const way = (await btn('See where you are').count()) ? btn('See where you are') : page.locator('button.btn').first(); await tap(way, 'on to the word'); }
  if (!(await btn('Later').count())) fails.push('the word\'s screen did not come');
  else {
    await btn('Later').click(); await page.clock.runFor(1200);
    /* what waits after Later has Today behind it, never the word */
    const a = await arrow();
    if (a && a !== 'Today' && !(await page.locator('nav.foot').count())) fails.push(`after Later, the arrow says "${a}", not Today`);
    await home();
    const say = await page.locator('.where').getAttribute('aria-label').catch(() => null);
    if (!say) fails.push('while the word waits, Today\'s road line says nothing');
    const here = page.locator('h1 button.here');
    if (await here.count()) {
      await tap(here, 'the place\'s name');
      if (await page.locator('button.rodbtn').count()) fails.push('the place\'s name opened the word');
      const label = (await page.locator('.label-line').first().textContent().catch(() => ''))?.trim();
      if (label !== 'Read again') fails.push(`the place read again says "${label}"`);
    }
  }
  await page.close();
}

/* 3. the Week: + on a name he has; Next ⇄ This; Delete asks once (B17, B19, H#9) */
{
  const page = await K.open(null, '2026-09-30T09:00:00+01:00');
  const { btn, tap, home, arrow, row, onToday } = K.helpers(page);
  await home();
  const cat = 'Order the cat’s medication';
  const onTodayBefore = await row(cat).count();
  await tap(page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'the Week');
  await tap(page.getByRole('button', { name: 'Add to Friday', exact: true }), '+ on Friday');
  await page.keyboard.type(cat); await page.keyboard.press('Enter'); await page.clock.runFor(800);
  const said = (await page.locator('.said').first().textContent().catch(() => ''))?.trim() ?? '';
  if (!/already/.test(said)) fails.push(`the Week's + on a name he has says "${said}"`);
  await tap(btn('Next week'), 'Next week');
  await tap(btn('This week'), 'This week');
  await tap(page.locator('button.home'), 'the Week\'s arrow');
  if (!(await onToday())) fails.push(`Next week → This week → the arrow did not reach Today (arrow said "${await arrow()}")`);
  if (onTodayBefore && !(await row(cat).count())) fails.push('the Week\'s + moved the cat\'s medication off Today');
  /* Delete on a recurring job asks once */
  const course = row('Course');
  const box = await course.boundingBox().catch(() => null);
  if (box) {
    await page.mouse.move(box.x + 60, box.y + box.height / 2); await page.mouse.down();
    await page.waitForTimeout(700); await page.clock.runFor(700); await page.mouse.up(); await page.clock.runFor(400);
    await page.locator('.menu button.item.del').click(); await page.clock.runFor(300);
    if (!(await page.getByText('Delete Course and its plan?').count())) fails.push('Delete on Course did not ask');
    await page.locator('.menu button.item', { hasText: 'Keep' }).click(); await page.clock.runFor(300);
    await page.locator('.menu button.item.cancel').click().catch(() => {}); await page.clock.runFor(300);
    if (!(await row('Course').count())) fails.push('Keep deleted Course');
  } else fails.push('no Course row to hold');
  await page.close();
}

/* 4. a Key earned with something locked here: Use it here once; back and reload never offer it again (B1) */
{
  const page = await K.open('keys', '2026-10-08T09:00:00+01:00');
  const { btn, tap, home, reload } = K.helpers(page);
  let offered = false;
  for (const day of ['2026-10-08', '2026-10-09', '2026-10-10']) {
    await home();
    const c = page.getByRole('button', { name: 'Course: tick off', exact: true });
    if (!(await c.count())) { await page.clock.setSystemTime(new Date(`${day}T09:00:00+01:00`)); continue; }
    await tap(c, 'Course tick');
    await tap(page.locator('.sheet .chip', { hasText: /^1 h$/ }), '1 h', 1500);
    if (await btn('Use it here').count()) { offered = true; break; }
    await page.clock.setSystemTime(new Date(`${day.slice(0, 8)}${String(+day.slice(8) + 1).padStart(2, '0')}T09:00:00+01:00`)); await page.clock.runFor(1500);
  }
  if (offered) {
    await tap(btn('Use it here'), 'Use it here');
    await tap(page.locator('button.home'), 'back to the return');
    if (await btn('Use it here').count()) fails.push('Use it here was offered again after it was used');
    await reload();
    if (await btn('Use it here').count()) fails.push('Use it here was offered again after a reload');
  } else console.log('screens3: no Key with something locked here came up (B1 not exercised on this save)');
  await page.close();
}

await K.end('screens3');
