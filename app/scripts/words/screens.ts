/* The story's screens in the order the app plays them, from a simulated Normal run with bedtime kept (WRITING_PROCESS.md,
   step 1): places, steps, finds, camps, sealed things opened, guesses, records as rendered at that moment, marks settled,
   week closes. For cold readers. Usage (from app/): node node_modules/rolldown/bin/cli.mjs scripts/words/screens.ts
   --platform node --format esm --file <scratch>/screens.mjs && node <scratch>/screens.mjs > <scratch>/screens.json
   Set FROM_WEEK below to the first story week wanted. The output is sealed story text: keep it out of the repository and chat. */
import { sim } from '../../tests/rules/sim';
import * as S from '../../src/core/story';
import { content as C } from '../../src/content/world';
const s = C.story;
const FROM_WEEK = 8;
const p = sim(undefined, undefined, 'kept');
for (let i = 0; i < 15; i++) p.week('normal');
const F = p.facts;
const out: { w: number; kind: string; id: string; text: string }[] = [];
let wk = 1; let pend: any[] = [];
const renderAt = (id: string, i: number) => {
  const r = S.recordOf(s, id)!; const st = S.storyState(F.slice(0, i), s); const held = S.marksHeld(s, st);
  if (r.kind === 'paper') return (r.paper ?? []).join('\n');
  const lines = (r.cut ?? []).map(l => S.render(l, held, s).map(x => x.t === 'word' ? x.text + (x.guess ? '?' : '') : x.t === 'glyph' ? '[ ]' : x.t === 'pic' ? '[' + x.text + ']' : x.t === 'ring' ? '(ring)' : x.t === 'hand' ? ({ his: '(in the corner: the hook closed on a dot)', hers: '(in the corner: her hook with a tail)', surveyor: '(in the corner: the hook crossed by a short cut)', maker: '(in the corner: the maker\'s hook with a bar under it)' } as any)[x.who] ?? '' : x.text).join(' ').replace(/ ([.,;:])/g, '$1'));
  return lines.join(' / ') + (r.sheet ? '\n(Her pencilled sheet for this record says: ' + r.sheet + ')' : '');
};
for (let i = 0; i < F.length; i++) {
  const f: any = F[i];
  if (f.type === 'storyWeekBegan') wk = f.w;
  if (wk < FROM_WEEK) continue;
  const push = (kind: string, id: string, text: string) => out.push({ w: wk, kind, id, text });
  if (f.type === 'beatPlayed') {
    if (f.id === 'passage') { const ps = s.passages.find(x => x.id === f.passage); if (ps && ps.stretch.match(/water|reading|blast|side|lower/)) push('passage', ps.id, ps.line); continue; }
    const b = S.beatOf(s, f.id); if (!b) continue;
    if (b.kind === 'close') continue;
    push(b.kind, b.id, (b.name ? 'PLACE: ' + b.name + '\n' : '') + (b.line ?? '') + (b.taps ? '\nTAPS: ' + b.taps.join(' | ') : '') + (b.choice ? '\nCHOICE BUTTONS: ' + b.choice.join(' | ') : ''));
    out.push(...pend); pend = [];
    for (const m of s.marks.filter(m => m.confirmedBy === b.id)) push('marks-settled', m.id, 'The symbol "' + m.shape + '" now reads as: ' + (m.candidates?.[0] ?? m.sign.toLowerCase()) + (m.struck ? ' (if a wrong guess was made: "' + m.struck + '")' : ''));
  } else if (f.type === 'arrived' && f.kind === 'place') {
    const b = S.beatOf(s, f.id)!; push(b.kind === 'word' ? 'word' : 'arrival', b.id, 'PLACE: ' + b.name + '\n' + (b.line ?? '') + (b.taps ? '\nTAPS (one screen each): ' + b.taps.join(' | ') : '') + (b.choice ? '\nCHOICE BUTTONS: ' + b.choice.join(' | ') : ''));
    for (const m of s.marks.filter(m => m.confirmedBy === b.id)) push('marks-settled', m.id, 'The symbol "' + m.shape + '" now reads as: ' + (m.candidates?.[0] ?? m.sign.toLowerCase()) + (m.struck ? ' (if a wrong guess was made: "' + m.struck + '")' : ''));
  } else if (f.type === 'arrived') {
    const k = s.camps.find(x => x.id === f.id); if (k) push('camp-view', k.id, 'CAMP: ' + k.name + '\n' + k.line);
  } else if (f.type === 'sealOpened') {
    const x = S.sealOf(s, f.seal)!; if (x.line) push('opened', x.id, x.line);
    for (const m of x.carries?.guess ?? []) { const mk = S.markOf(s, m)!; pend.push({ w: wk, kind: 'guess', id: m, text: 'GUESS SCREEN: a symbol, ' + mk.shape + '. Beside it: ' + mk.context + '. Options: ' + (mk.candidates ?? []).join(' / ') }); }
  } else if (f.type === 'findGiven') { const x = s.finds.find(y => y.id === f.id); if (x) push('find', x.id, x.line); }
  else if (f.type === 'recordShown') { push('record', f.id, 'RECORD (' + S.recordOf(s, f.id)!.where + '): ' + renderAt(f.id, i)); }
  else if (f.type === 'weekClosed') {
    const L = [...f.learned.map((id: string) => s.learned.find(l => l.id === id)!.line), ...f.soFar.map((id: string) => s.soFar.flatMap(m => m.items ?? []).find(l => l.id === id)!.line)];
    const g = f.glimpse ? S.beatOf(s, f.glimpse)!.line : '';
    push('week-close', 'close', 'END OF WEEK. What you learned: ' + L.join(' | ') + (g ? '\nA GLIMPSE OF NEXT WEEK: ' + g : ''));
  }
}
const extra = { teasers: s.teasers.filter(t => t.w >= 8).map(t => ({ w: t.w, id: t.id, text: t.line })), questions: s.openQuestions.filter(q => q.w >= 7).map(q => ({ w: q.w, id: q.id, text: q.line })) };
console.log(JSON.stringify({ screens: out, extra }));
