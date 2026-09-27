// Every text box, attacked: "+ Add", the Satchel, Something else…, the Week's +, the job editor (name, first step, note),
// "I can't start", "Where did you stop?". Each gets empty and whitespace-only text, 5,000 characters, a long word, emoji,
// right-to-left text and HTML-like text; afterwards every screen the text shows on is audited for overflow and cut-off
// words. Also: the editor's Save with no name, and "Let it go" on a job whose date passed (a Delete with no Undo?).
// Usage (from app/): node tests/review/text-attack.mjs [w h] [only]
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
  const x = await L.finish(R, `text-attack #${n} ${title}`); total.fails += x.fails; total.errors += x.errors;
};
const LONGWORD = 'Donaudampfschifffahrtsgesellschaftskapitaen'.repeat(3);
const ODD = ['<b>x</b><img src=x onerror=alert(1)>', '{{x}} ${x} %s', 'שלום עולם مرحبا', '👩‍👩‍👧‍👦🧗🏽‍♀️🏳️‍🌈' .repeat(3), LONGWORD];
const foot = (R, name) => R.page.locator('.foot').getByRole('button', { name, exact: true });
const htmlLeak = async R => (await R.page.locator('.phone b, .phone img[src="x"]').count()) > 0;
let alerted = false;

/* 1. "+ Add" on Today */
await S(1, '+ Add', async R => {
  R.page.on('dialog', d => { alerted = true; d.dismiss(); });
  const box = async (text, how = 'insert') => {
    await L.tap(R, R.page.locator('.foot .add'), '+ Add', 300);
    if (how === 'insert') await R.page.keyboard.insertText(text); else await R.page.keyboard.type(text);
    await L.audit(R, `#1 typing (${text.length} chars)`);
    await R.page.keyboard.press('Enter'); await R.page.clock.runFor(700);
  };
  const rows0 = await R.page.locator('.rows .swipe').count();
  await box(''); await box('   '); await box('\n\n');
  const rows1 = await R.page.locator('.rows .swipe').count();
  if (rows1 !== rows0) R.fails.push(`#1 empty/whitespace "+ Add" made ${rows1 - rows0} rows`);
  /* the box still open after an empty Enter? */
  if (await R.page.locator('.capture textarea').count()) { R.notes.push('#1 "+ Add" with nothing typed: Enter leaves the box open'); await L.tap(R, R.page.locator('.capture button[type=button]'), 'Cancel'); }
  for (const t of ODD) await box(t);
  await box('y'.repeat(5000));
  const lines = Array.from({ length: 40 }, (_, i) => `- pasted line ${i}`).join('\n');
  await box(lines);
  const rows2 = await R.page.locator('.rows .swipe').count();
  R.notes.push(`#1 after odd entries, a 5,000-char paste and a 40-line paste: ${rows2 - rows0} new rows on Today`);
  if (await htmlLeak(R) || alerted) R.fails.push('#1 HTML typed into "+ Add" was rendered');
  await L.audit(R, '#1 today with odd rows');
  await R.page.locator('.rows').evaluate(e => e.closest('.scroll')?.scrollTo(0, 99999));
  await L.audit(R, '#1 today scrolled to the end');
  /* the foot still there with 40+ rows */
  const fr = await foot(R, 'Week').boundingBox();
  if (!fr || fr.y + fr.height > +h) R.fails.push('#1 with 40+ rows the foot is pushed off the screen');
  await L.tap(R, foot(R, 'Week'), 'Week'); await L.audit(R, '#1 week with odd rows');
  await L.toToday(R); await L.tap(R, foot(R, 'Satchel'), 'Satchel'); await L.audit(R, '#1 satchel');
  await L.toToday(R); await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…'); await L.audit(R, '#1 choose with odd rows');
  await L.reload(R); await L.toToday(R); await L.audit(R, '#1 today after reload');
});

/* 2. Something else… (Choose a delve) and the Week's + */
await S(2, 'Choose and Week inputs', async R => {
  await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…');
  const inp = R.page.locator('form.new input');
  await inp.fill('    '); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(600);
  if ((await L.screen(R)) === 'set') R.fails.push('#2 whitespace in Something else… opened a set-up');
  await inp.fill(''); await inp.click(); await R.page.keyboard.insertText('z'.repeat(5000)); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(1200);
  await L.audit(R, '#2 set-up of a 5,000-char paste');
  const name = await R.page.locator('.rs h1').innerText().catch(() => '');
  R.notes.push(`#2 Something else… with a 5,000-char paste: set-up titled with ${name.length} chars`);
  await L.toToday(R);
  await L.tap(R, foot(R, 'Week'), 'Week');
  const plus = R.page.locator('button.plus').first();
  for (const t of ['   ', ...ODD]) {
    await L.tap(R, plus, 'the + on today', 300);
    await R.page.keyboard.insertText(t); await R.page.keyboard.press('Enter'); await R.page.clock.runFor(500);
  }
  if (await htmlLeak(R)) R.fails.push('#2 HTML typed in the Week was rendered');
  await L.audit(R, '#2 week with odd names');
  /* the + on the last day, then its input left open and the week changed */
  await L.tap(R, R.page.locator('button.plus').last(), 'the + on the last day', 300);
  await R.page.keyboard.type('half typed');
  await L.tap(R, 'Next week'); await L.audit(R, '#2 next week after a half-typed line');
  await L.tap(R, 'This week');
  R.notes.push(`#2 a half-typed Week line, then Next week and back: ${await R.page.getByText('half typed').count() ? 'kept' : 'dropped silently'}`);
  /* a job with odd name: its sheet, Another day… */
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Donau' }).first(), 'the long word row');
  await L.audit(R, '#2 sheet of a long word');
  await L.tap(R, 'Another day…'); await L.audit(R, '#2 another day open');
});

/* 3. The job editor: an empty name, very long fields, odd text; then the job everywhere */
await S(3, 'job editor', async R => {
  await L.addToday(R, 'Hotel');
  await L.tap(R, foot(R, 'Week'), 'Week');
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Hotel' }).first(), 'Hotel');
  await L.tap(R, 'Change the job'); await L.audit(R, '#3 editor');
  const name = R.page.getByRole('textbox', { name: 'What', exact: true });
  await name.fill('');
  await L.tap(R, 'Save');
  const still = await name.count();
  if (still) R.fails.push('#3 DEAD: Save with an empty name does nothing and says nothing (the editor just stays)');
  await name.fill(''); await name.click(); await R.page.keyboard.insertText(LONGWORD + ' ' + '🧗'.repeat(20));
  await R.page.getByRole('textbox', { name: 'First small step' }).click(); await R.page.keyboard.insertText('s'.repeat(5000));
  await R.page.getByRole('textbox', { name: 'A note' }).click(); await R.page.keyboard.insertText('<b>n</b> ' + 'n'.repeat(400));
  await L.audit(R, '#3 editor filled');
  await L.tap(R, 'Save'); await L.audit(R, '#3 after save');
  await L.toToday(R); await L.audit(R, '#3 today');
  const row = R.page.locator('.rows button.row', { hasText: 'Donau' }).first();
  if (!(await row.count())) R.fails.push('#3 the renamed job is not on Today');
  else {
    await L.tap(R, R.page.locator('.cant').getByRole('button', { name: 'I can’t start' }).first(), 'I can’t start (next job)');
    await L.toToday(R);
    await L.tap(R, row, 'the renamed job'); await L.audit(R, '#3 set-up with a long note');
    await L.tap(R, 'Begin'); await L.audit(R, '#3 delve'); await L.ff(R, 2 * 60_000);
    await L.tap(R, 'Finish here'); await L.audit(R, '#3 end');
    await L.tap(R, 'Not yet'); await L.audit(R, '#3 kept');
  }
  if (await htmlLeak(R)) R.fails.push('#3 HTML in the editor was rendered');
});

/* 4. "I can't start" and "Where did you stop?" */
await S(4, 'cant start and where stopped', async R => {
  await L.addToday(R, 'India');
  /* Today's next job's I can't start */
  await L.tap(R, R.page.locator('.cant').getByRole('button', { name: 'I can’t start' }).first(), 'I can’t start');
  const ask = R.page.locator('input.ask');
  if (await ask.count()) {
    await ask.click(); await R.page.keyboard.insertText(LONGWORD + LONGWORD);
    await L.audit(R, '#4 cant start typed');
    await L.tap(R, 'Not now');
    await L.tap(R, R.page.locator('.cant').getByRole('button', { name: 'I can’t start' }).first(), 'I can’t start again');
    await L.audit(R, '#4 cant start with the kept first step');
    await L.toToday(R);
  } else R.notes.push('#4 I can\'t start asked nothing (the job has a first step)');
  await L.toToday(R);
  /* "Where did you stop?" shows after Finish here with no whole minute on a repeating job (not a session, no question) */
  await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…');
  /* a repeating job from the starting set (the Course repeats; a job name, not story text) */
  const rep = R.page.locator('.line button.row', { hasText: 'Course' }).first();
  await L.tap(R, rep, 'a repeating job'); await L.tap(R, 'Begin'); await L.tap(R, 'Finish here');
  const stop = R.page.locator('input.stop');
  if (await stop.count()) {
    await stop.click(); await R.page.keyboard.insertText('w'.repeat(5000)); await L.audit(R, '#4 where stopped typed');
    const len = (await stop.inputValue()).length;
    await L.tap(R, R.page.locator('button.home'), 'Today');
    await L.tap(R, R.page.locator('.rows button.row.else'), 'Something else…');
    await L.tap(R, rep, 'the job again'); await L.audit(R, '#4 set-up with a 160-char note');
    const shown = await R.page.locator('.rs p.last').count();
    if (!shown) R.fails.push(`#4 a "Where did you stop?" note (${len} chars) typed and left by the arrow is not on the next set-up`);
  } else R.notes.push('#4 no "Where did you stop?" on that end');
});

/* 5. "Let it go" on a job whose date passed: a delete with no Undo, and no guard for a running delve */
await S(5, 'let it go', async R => {
  await L.addToday(R, 'Juliet');
  await L.tap(R, foot(R, 'Week'), 'Week');
  await L.tap(R, R.page.locator('.day button.row', { hasText: 'Juliet' }).first(), 'Juliet');
  await L.tap(R, 'Change the job');
  await L.tap(R, R.page.getByRole('button', { name: 'By', exact: true }), 'By a date');
  await L.tap(R, 'Save');
  await L.toToday(R);
  await L.toClock(R, 9, 10); await L.toToday(R);
  await L.tap(R, foot(R, 'Week'), 'Week'); await L.tap(R, 'What repeats');
  await L.audit(R, '#5 what repeats with a passed date');
  const letGo = L.btn(R, 'Let it go');
  if (!(await letGo.count())) { R.notes.push('#5 no "Let it go" shown for Juliet'); return; }
  await L.tap(R, letGo, 'Let it go');
  const gone = (await L.facts(R)).some(f => f.type === 'jobRemoved');
  if (gone && !(await L.has(R, 'Undo'))) R.fails.push('#5 "Let it go" deletes the job with no Undo (every Delete has Undo, D-125)');
});

await browser.close();
console.log(`text-attack ${w}x${h}: ${total.fails} problem(s), ${total.errors} page error(s)`);
process.exit(total.errors ? 2 : total.fails ? 1 : 0);
