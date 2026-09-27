// Dan's report (2026-09-26): a tap on a job on Today swapped something else in. A tap starts that job, and no other row
// moves (D-100). Every job is a delve now (D-117). Usage: node tests/flows/tap-row.mjs http://localhost:4173/
const { launch } = await import('./browser.mjs');
const b = await launch();
const page = await b.newPage({ viewport: { width: 440, height: 956 }, timezoneId: 'Europe/London' });
await page.clock.install({ time: new Date('2026-09-30T09:00:00+01:00') });
await page.goto(process.argv[2]); await page.clock.runFor(2500);
const fails = [];
const names = async () => page.locator('.rows button.row:not(.else) .t').allTextContents();
const nextName = async () => (await page.locator('.next h2').first().textContent())?.split(' · ')[0].trim();
/* Today's list fades in: it is read only once its rows are drawn (read too early, it came back empty, 2026-09-26) */
const drawn = async () => { await page.locator('.rows button.row:not(.else) .t').first().waitFor(); await page.locator('.next h2').first().waitFor(); };
/* every job is a delve (D-117): a tap on a row opens that job's own set-up or delve, never another's */
{
  await drawn();
  const rows = await names();
  const notes = await page.locator('.rows button.row:not(.else) .s').allTextContents();
  const k = notes.findIndex(n => /delve/i.test(n));
  if (k < 0) fails.push('no delve row on Today');
  else {
    const name = rows[k];
    await page.locator('.rows button.row:not(.else)').nth(k).click(); await page.clock.runFor(1200);
    const onSet = await page.locator('.rs').count(), onDelve = await page.locator('.dv').count();
    const shown = await page.locator('main, body').first().textContent();
    if (!onSet && !onDelve) fails.push(`a tap on ${name} opened neither its delve nor its set-up`);
    else if (!shown.includes(name)) fails.push(`the delve opened is not ${name}'s`);
  }
}
await b.close();
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); } else console.log('tap-row: ok');
