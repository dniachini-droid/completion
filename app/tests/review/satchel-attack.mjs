// The Satchel, lists, Delete and Undo, attacked: empty and whitespace entries; Delete, Undo, Delete again; Delete tapped
// twice fast (the list moves up under the finger); two Deletes then Undo; lists edited, struck in a delve, edited while
// the delve runs, then the delve ended; Put on a day (today, far ahead), then "Not this week" and back; reloads mid-edit.
// The same double-tap Delete is tried in Choose a delve and on Today's slid row. Jobs are the test's own.
// Usage (from app/): node tests/review/satchel-attack.mjs [w h] [only]
import * as L from './lib.mjs';
import { launch } from '../flows/browser.mjs';
const [,, w = '390', h = '844', only] = process.argv;
const browser = await launch();
let total = { fails: 0, errors: 0 };
const S = async (n, title, fn, at = '2026-09-30T09:00:00+01:00') => {
  if (only && String(n) !== only) return;
  const R = await L.start({ w: +w, h: +h, at, browser, tag: `#${n}` });
  R.label = `#${n} ${title}`;
  try { await fn(R); } catch (e) { R.fails.push(`[#${n}] script stopped: ${e.message.split('\n')[0]}`); }
  const x = await L.finish(R, `satchel-attack #${n} ${title}`); total.fails += x.fails; total.errors += x.errors;
};
const toSatchel = async R => { await L.toToday(R); await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Satchel', exact: true }), 'Satchel'); };
const names = R => R.page.locator('.item .t').allTextContents();
/* names of jobs deleted and not brought back by Undo (jobRemoved after the last jobSaved of that id) */
const deletedNow = async R => { const f = await L.facts(R), name = new Map(), gone = new Set();
  for (const x of f) { if (x.type === 'itemAdded') name.set(x.id, x.name); if (x.type === 'jobRemoved') gone.add(x.id); if (x.type === 'jobSaved') gone.delete(x.job.id); }
  return [...gone].map(id => name.get(id) ?? id); };
const liveNames = async R => { /* jobs added and not removed (or brought back) */
  const f = await L.facts(R), m = new Map();
  for (const x of f) { if (x.type === 'itemAdded') m.set(x.id, x.name); if (x.type === 'jobRemoved') m.delete(x.id); if (x.type === 'jobSaved' && x.job.id.startsWith('it-')) m.set(x.job.id, x.job.name); }
  return [...m.values()];
};

/* 1. empty, whitespace-only and odd entries */
await S(1, 'odd entries', async R => {
  await toSatchel(R);
  const input = R.page.locator('form.new input');
  await input.click(); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(400);
  await input.fill('     '); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(400);
  await input.fill('\t'); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(400);
  if ((await names(R)).length) R.fails.push(`#1 an empty/whitespace entry made a job: ${(await names(R)).length}`);
  if (!(await R.page.locator('form.new button').isDisabled())) R.fails.push('#1 Put in is enabled with only spaces');
  for (const t of ['<b>bold</b>', '{{x}}', '${x}', 'עברית ושלום', 'مرحبا بالعالم', '🧹🧺✨👨‍👩‍👧', '- • * dashes']) {
    await input.fill(''); await input.click(); await R.page.keyboard.insertText(t); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(500);
  }
  if (await R.page.locator('.item b').count()) R.fails.push('#1 HTML typed into a job was rendered as HTML');
  const got = await names(R);
  if (!got.includes('<b>bold</b>') || !got.includes('{{x}}') || !got.includes('${x}')) R.fails.push(`#1 odd names not kept literally: ${JSON.stringify(got)}`);
  R.notes.push(`#1 "- • * dashes" became ${JSON.stringify(got.find(x => /dashes/.test(x)))}`);
  /* a 5,000-character paste (the box keeps 120), one long word, and emoji */
  await input.fill(''); await input.click(); await R.page.keyboard.insertText('x'.repeat(5000)); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(500);
  const long = (await names(R)).find(x => /^x+$/.test(x));
  if (!long) R.fails.push('#1 the 5,000-character paste made no job'); else R.notes.push(`#1 the 5,000-character paste kept ${long.length} characters`);
  await input.click(); await R.page.keyboard.insertText('Supercalifragilistic'.repeat(6)); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(500);
  await L.audit(R, '#1 satchel with odd names');
  await L.tap(R, L.item(R, 'Supercali').locator('button.row'), 'the long word');
  await L.audit(R, '#1 set-up of a long word');
  await L.tap(R, 'Begin'); await L.audit(R, '#1 delve of a long word');
  await L.ff(R, 2 * 60_000); await L.tap(R, 'Finish here'); await L.audit(R, '#1 end of a long word');
  await L.tap(R, 'Not yet'); await L.audit(R, '#1 kept, long word');
  await L.toToday(R); await L.audit(R, '#1 today with a long word row');
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week'); await L.audit(R, '#1 week with long names');
  await L.toToday(R); await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…'); await L.audit(R, '#1 choose with long names');
  await L.reload(R); await toSatchel(R);
  if ((await names(R)).length < 8) R.fails.push(`#1 after reload the satchel has ${(await names(R)).length} jobs`);
});

/* 2. Delete, Undo, Delete again; Undo twice; two Deletes then Undo */
await S(2, 'delete and undo', async R => {
  await toSatchel(R);
  for (const n of ['Alpha', 'Bravo', 'Charlie', 'Delta']) await L.putSatchel(R, n);
  const del = n => L.item(R, n).getByRole('button', { name: /: delete$/ });
  await L.tap(R, del('Alpha'), 'Delete Alpha'); await L.tap(R, 'Undo');
  if (!(await L.item(R, 'Alpha').count())) R.fails.push('#2 Undo did not bring Alpha back');
  await L.tap(R, del('Alpha'), 'Delete Alpha again');
  if (await L.item(R, 'Alpha').count()) R.fails.push('#2 Alpha, deleted again, is still there');
  await L.multiTap(R, 'Undo', 2, 40, 'Undo ×2');
  if ((await deletedNow(R)).includes('Alpha')) R.fails.push('#2 Undo ×2 did not bring Alpha back');
  if ((await L.screen(R)) !== 'satchel') { R.fails.push(`#2 Undo tapped twice (40 ms): the second tap opened ${await L.screen(R)} (the row that moved under the finger)`); await toSatchel(R); }
  const dup = (await names(R)).filter(x => x === 'Alpha').length;
  if (dup !== 1) R.fails.push(`#2 Undo ×2: Alpha shows ${dup} times`);
  /* two Deletes, then Undo: only the last comes back (is the first lost for good, with no way to get it back?) */
  await L.tap(R, del('Bravo'), 'Delete Bravo'); await L.tap(R, del('Charlie'), 'Delete Charlie');
  await L.tap(R, 'Undo');
  const back = await names(R);
  R.notes.push(`#2 after Delete Bravo, Delete Charlie, Undo: ${back.includes('Bravo') ? 'Bravo back' : 'Bravo gone'}, ${back.includes('Charlie') ? 'Charlie back' : 'Charlie gone'}`);
  if (!back.includes('Bravo')) R.fails.push('#2 two Deletes in a row: the first (Bravo) can no longer be undone (only the last Delete has an Undo)');
  /* Undo gone once the screen is left */
  await L.tap(R, del('Delta'), 'Delete Delta'); await L.toToday(R); await toSatchel(R);
  if (await L.has(R, 'Undo')) R.notes.push('#2 Undo survives leaving the screen'); else R.notes.push('#2 Undo is gone once the Satchel is left (by design, D-125)');
  await L.audit(R, '#2 end');
});

/* 3. Delete tapped twice fast, and 600 ms apart: the list moves up under the finger */
for (const [k, gap] of [[31, 40], [32, 150], [33, 600]]) {
  await S(k, `double Delete ${gap} ms`, async R => {
    await toSatchel(R);
    for (const n of ['Alpha', 'Bravo', 'Charlie', 'Delta']) await L.putSatchel(R, n);
    /* newest first: Delta, Charlie, Bravo, Alpha. Delete on Charlie, twice */
    await L.multiTap(R, L.item(R, 'Charlie').getByRole('button', { name: /: delete$/ }), 2, gap, 'Delete Charlie ×2');
    const gone = await deletedNow(R), scr = await L.screen(R), undo = await L.has(R, 'Undo');
    R.notes.push(`#${k} Delete ×2 (${gap} ms) in the Satchel: deleted ${JSON.stringify(gone)}, now on ${scr}, Undo shown: ${undo}`);
    if (gone.length > 1) R.fails.push(`#${k} DATA: Delete tapped twice ${gap} ms apart deleted ${gone.length} jobs`);
    if (scr !== 'satchel' && !undo) {
      await toSatchel(R);
      R.fails.push(`#${k} DATA: Delete tapped twice ${gap} ms apart in the Satchel: one job deleted, the second tap opened another job's ${scr} screen, and the Undo was lost with the screen change (Undo on the Satchel now: ${await L.has(R, 'Undo')})`);
    }
  });
}

/* 4. The same in Choose a delve (Something else…) and on Today's slid row */
await S(4, 'double Delete in Choose and Today', async R => {
  for (const n of ['Alpha', 'Bravo', 'Charlie', 'Delta']) await L.addToday(R, n);
  await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…');
  await L.multiTap(R, R.page.locator('.line', { hasText: 'Bravo' }).getByRole('button', { name: /delete/i }), 2, 60, 'Delete Bravo ×2 in Choose');
  let gone = await deletedNow(R);
  if (gone.length > 1) { R.fails.push(`#4 DATA: in Choose a delve, Delete tapped twice (60 ms) deleted ${gone.length} jobs (the next line's Delete moved under the finger)`);
    if (await L.has(R, 'Undo')) { await L.tap(R, 'Undo'); const still = await deletedNow(R); if (still.length) R.fails.push(`#4 DATA: after Undo in Choose, still lost for good: ${still.join(', ')}`); } }
  await L.toToday(R);
  const strip = await L.slide(R, 'Charlie');
  if (strip) {
    const before = await deletedNow(R);
    await L.multiTap(R, strip.getByRole('button', { name: 'Delete', exact: true }), 2, 60, 'Delete Charlie ×2 on Today');
    const now = (await deletedNow(R)).filter(x => !before.includes(x)), s = await L.screen(R), undo = await L.has(R, 'Undo');
    if (now.length > 1) R.fails.push(`#4 DATA: on Today, Delete tapped twice deleted ${now.length} rows`);
    if (s !== 'today') { await L.toToday(R); R.fails.push(`#4 DATA: on Today, Delete tapped twice (60 ms): the second tap opened the next row's ${s}, and Charlie's Undo was lost (Undo on Today now: ${await L.has(R, 'Undo')})`); }
  }
  await L.audit(R, '#4 end');
});

/* 5. A list: typed, struck in the delve, edited while the delve runs, the delve ended */
await S(5, 'lists in a delve', async R => {
  await toSatchel(R); await L.putSatchel(R, 'Shopping');
  const it = () => L.item(R, 'Shopping');
  await L.tap(R, it().getByRole('button', { name: /: list$/ }), 'List');
  await R.page.keyboard.type('one\ntwo\nthree\nfour');
  await L.tap(R, it().getByRole('button', { name: /: done$/ }), 'Done (list)');
  if ((await L.preview(R, 'Shopping')) !== 'one · two · three · four') R.fails.push(`#5 preview reads "${await L.preview(R, 'Shopping')}"`);
  await L.tap(R, it().locator('button.row'), 'Shopping'); await L.tap(R, 'Begin');
  const line = t => R.page.locator('.dv ul.list button', { hasText: new RegExp(`^${t}$`) });
  await L.tap(R, line('two'), 'strike two', 400);
  await L.multiTap(R, line('three'), 2, 40, 'strike three twice fast');
  const s3 = await line('three').getAttribute('aria-pressed');
  R.notes.push(`#5 "three" tapped twice fast: struck=${s3}`);
  if (s3 !== 'true') R.fails.push('#5 a quick double tap on a list line un-struck it (two decisions from one double tap)');
  await L.audit(R, '#5 delve with list');
  /* while the delve runs: the Satchel, the list edited (a line added at the end) */
  await L.tap(R, R.page.locator('button.home'), 'Today');
  await toSatchel(R);
  await L.tap(R, it().getByRole('button', { name: /: list$/ }), 'List during delve');
  await R.page.keyboard.type('five');
  await L.tap(R, it().getByRole('button', { name: /: done$/ }), 'Done (list) during delve');
  await L.toToday(R); await L.tap(R, 'Back to the delve');
  const struckNow = await R.page.locator('.dv ul.list button[aria-pressed=true]').allTextContents();
  R.notes.push(`#5 after adding "five" to the list during the delve, struck lines: ${JSON.stringify(struckNow)}`);
  if (struckNow.length < 1) R.fails.push('#5 adding a line to the list during the delve un-struck every line already struck (the strikes are lost; those lines stay on the list after the delve)');
  await L.ff(R, 3 * 60_000); await L.tap(R, 'Finish here'); await L.tap(R, 'Not yet'); await L.toToday(R);
  await toSatchel(R);
  R.notes.push(`#5 list after the delve: "${await L.preview(R, 'Shopping')}"`);
  /* strike everything, reload mid-delve, end: the list empties, the job stays */
  await L.tap(R, it().locator('button.row'), 'Shopping'); await L.tap(R, 'Begin');
  for (const b of await R.page.locator('.dv ul.list button').all()) { await b.click(); await R.page.clock.runFor(300); }
  await L.reload(R);
  const kept = await R.page.locator('.dv ul.list button[aria-pressed=true]').count();
  if (kept !== (await R.page.locator('.dv ul.list button').count())) R.fails.push(`#5 strikes lost on reload (${kept} kept)`);
  await L.ff(R, 60_000); await L.tap(R, 'Finish here'); await L.tap(R, 'Not yet'); await L.toToday(R); await toSatchel(R);
  if (!(await L.item(R, 'Shopping').count())) R.fails.push('#5 Shopping left the satchel after its whole list was struck');
  if (await L.preview(R, 'Shopping')) R.fails.push(`#5 struck lines stayed: "${await L.preview(R, 'Shopping')}"`);
  await L.audit(R, '#5 end');
});

/* 6. A list: long lines, a 2,000+ paste, typed then left by reload (is it kept?) */
await S(6, 'long lists', async R => {
  await toSatchel(R); await L.putSatchel(R, 'Notes');
  const it = () => L.item(R, 'Notes');
  await L.tap(R, it().getByRole('button', { name: /: list$/ }), 'List');
  await R.page.keyboard.insertText('Pneumonoultramicroscopicsilicovolcanoconiosis'.repeat(5) + '\n' + 'short\n' + 'word '.repeat(80));
  await L.tap(R, it().getByRole('button', { name: /: done$/ }), 'Done');
  await L.audit(R, '#6 satchel with a long list');
  await L.tap(R, it().locator('button.row'), 'Notes'); await L.audit(R, '#6 set-up with a long list');
  await L.tap(R, 'Begin'); await L.audit(R, '#6 delve with a long list');
  await L.tap(R, 'Pause'); await L.audit(R, '#6 paused with a long list');
  await L.tap(R, R.page.locator('.dv button.back'), 'resume'); await L.tap(R, 'Finish here'); await L.tap(R, 'Not yet'); await L.toToday(R);
  /* a paste of 2,500 characters in 50 lines */
  await toSatchel(R);
  await L.tap(R, it().getByRole('button', { name: /: list$/ }), 'List');
  await R.page.keyboard.press('ControlOrMeta+a'); await R.page.keyboard.press('Delete');
  const lines = Array.from({ length: 50 }, (_, i) => `line ${String(i).padStart(2, '0')} ` + 'abcdefghij'.repeat(4));
  await R.page.keyboard.insertText(lines.join('\n'));
  const typed = await R.page.locator('textarea.list').inputValue();
  await L.tap(R, it().getByRole('button', { name: /: done$/ }), 'Done');
  const saved = (await L.savedJob(R, await L.idOf(R, 'Notes')))?.list ?? '';
  R.notes.push(`#6 50 lines × 48 characters pasted: the box took ${typed.length} characters, ${typed.split('\n').length} lines; kept ${saved.split('\n').filter(Boolean).length} lines (${saved.length} chars)`);
  if (typed.split('\n').length > saved.split('\n').length && typed.length <= 2000) R.fails.push('#6 whole lines the box accepted were dropped from the list');
  if (typed.length >= 2000 && !typed.endsWith(lines[lines.length - 1])) R.notes.push('#6 the box cut the paste mid-line at 2,000 characters; the cut last line was ' + (saved.endsWith(typed.split('\n').pop()) ? 'kept (a half line)' : 'dropped'));
  /* typed, then the page reloaded before Done or leaving (the phone closed the app) */
  await L.tap(R, it().getByRole('button', { name: /: list$/ }), 'List');
  await R.page.keyboard.type('typed before reload');
  await L.reload(R); await toSatchel(R);
  if (!/typed before reload/.test(await L.preview(R, 'Notes'))) R.notes.push('#6 a line typed and then the page reloaded (no blur) was not kept');
  await L.audit(R, '#6 end');
});

/* 7. Put on a day, "Not this week", back in the satchel; Put on a day far ahead; then done */
await S(7, 'put on a day', async R => {
  await toSatchel(R);
  for (const n of ['Alpha', 'Bravo', 'Charlie']) await L.putSatchel(R, n);
  const day = n => L.item(R, n).getByRole('button', { name: /: put on a day$/ });
  await L.tap(R, day('Alpha'), 'Put on a day');
  const cells = L.item(R, 'Alpha').locator('.cal button');
  const nCells = await cells.count();
  R.notes.push(`#7 Put on a day offers ${nCells} days`);
  await L.audit(R, '#7 calendar open');
  await L.tap(R, cells.first(), 'today');
  if (await L.item(R, 'Alpha').count()) R.fails.push('#7 Alpha, put on today, is still in the satchel');
  await L.tap(R, day('Bravo'), 'Put on a day'); await L.tap(R, L.item(R, 'Bravo').locator('.cal button').last(), 'the last day');
  /* toggle the calendar open and shut fast */
  await L.multiTap(R, day('Charlie'), 3, 60, 'Put on a day ×3');
  await L.audit(R, '#7 after toggling');
  await L.toToday(R);
  if (!(await L.row(R, 'Alpha').count())) R.fails.push('#7 Alpha, put on today, is not on Today');
  /* "Not this week" on Alpha: back in the satchel */
  await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week');
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Alpha' }).first(), 'Alpha in the Week');
  await L.tap(R, 'Not this week');
  await toSatchel(R);
  if (!(await L.item(R, 'Alpha').count())) R.fails.push('#7 Alpha, taken off this week, is not back in the satchel');
  /* Bravo in a later week: find it */
  await L.toToday(R); await L.tap(R, R.page.locator('.foot').getByRole('button', { name: 'Week', exact: true }), 'Week');
  let found = false;
  for (let i = 0; i < 6 && !found; i++) {
    found = (await R.page.locator('.day button.row', { hasText: 'Bravo' }).count()) > 0;
    if (!found) { const nx = (await L.has(R, 'The week after')) ? 'The week after' : 'Next week'; if (!(await L.has(R, nx))) break; await L.tap(R, nx); }
  }
  if (!found) R.fails.push('#7 Bravo, put on the calendar\'s last day, is in no week');
  else { await L.audit(R, '#7 later week with Bravo');
    await L.tap(R, R.page.locator('.day button.row', { hasText: 'Bravo' }).first(), 'Bravo');
    await L.tap(R, 'Another day…'); await L.audit(R, '#7 another day on a later week');
    const c = R.page.locator('.sheet .cal button'); R.notes.push(`#7 "Another day…" on a later week offers ${await c.count()} days`);
    await L.tap(R, c.last(), 'the last day'); await L.audit(R, '#7 moved further'); }
  /* Alpha: put on today again from the satchel, delved, Done */
  await toSatchel(R); await L.tap(R, day('Alpha'), 'Put on a day'); await L.tap(R, L.item(R, 'Alpha').locator('.cal button').first(), 'today');
  await L.toToday(R); await L.tap(R, L.row(R, 'Alpha').first(), 'Alpha'); await L.tap(R, 'Begin'); await L.ff(R, 6 * 60_000);
  await L.tap(R, 'Finish here'); await L.tap(R, 'Done'); await L.toToday(R);
  if ((await L.facts(R)).filter(f => f.type === 'jobDone').length !== 1) R.fails.push('#7 Alpha, delved after Not this week, is not done once');
  await toSatchel(R); if (await L.item(R, 'Alpha').count()) R.fails.push('#7 Alpha, done, is still in the satchel');
});

await browser.close();
console.log(`satchel-attack ${w}x${h}: ${total.fails} problem(s), ${total.errors} page error(s)`);
process.exit(total.errors ? 2 : total.fails ? 1 : 0);
