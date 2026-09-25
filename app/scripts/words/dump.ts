/* Dump every story line in the app as JSON [{key, text, ctx, w}] (WRITING_PROCESS.md, step 1).
   Usage (from app/): node node_modules/rolldown/bin/cli.mjs scripts/words/dump.ts --platform node --format esm --file /tmp/dump.mjs && node /tmp/dump.mjs > current.json
   The output is sealed story text: keep it out of the repository and out of chat. */
import { story } from '../../src/content/sealed/index';
const out: { key: string; text: string; ctx: string; w?: number }[] = [];
const add = (key: string, text: string | undefined, ctx: string, w?: number) => { if (text && text.trim()) out.push({ key, text, ctx, w }); };
for (const b of story.beats) {
  add(`beat.${b.id}.line`, b.line, `${b.kind}${b.name ? ', place: ' + b.name : ''}`, b.w);
  b.taps?.forEach((t, i) => add(`beat.${b.id}.tap${i + 1}`, t, `tap ${i + 1} of ${b.taps!.length}`, b.w));
  b.choice?.forEach((t, i) => add(`beat.${b.id}.choice${i + 1}`, t, 'one-tap choice button', b.w));
}
for (const s of story.seals) { add(`seal.${s.id}.where`, s.where, 'where a sealed thing sits', s.w); add(`seal.${s.id}.line`, s.line, 'when it opens', s.w); }
for (const r of story.records) { add(`record.${r.id}.where`, r.where, 'where a record is', r.w); r.paper?.forEach((p, i) => add(`record.${r.id}.p${i + 1}`, p, 'written on paper, paragraph ' + (i + 1), r.w)); }
for (const f of story.finds) add(`find.${f.id}.line`, f.line, 'a find', f.w);
for (const c of story.camps) { add(`camp.${c.id}.line`, c.line, 'camp for the night', c.w); if ('line' in c.look) add(`camp.${c.id}.look`, c.look.line, 'the thing to look at in camp', c.w); }
for (const p of story.passages) add(`passage.${p.id}.line`, p.line, 'a stretch of passage walked');
for (const t of story.teasers) add(`teaser.${t.id}.line`, t.line, 'a glimpse ahead', t.w);
for (const l of story.learned) add(`learned.${l.id}.line`, l.line, 'end of week', l.w);
for (const m of story.soFar) m.lines.forEach((l, i) => add(`sofar.${m.id}.l${i + 1}`, l, 'end of month', m.w));
for (const q of story.openQuestions) add(`question.${q.id}.line`, q.line, 'end of week: a question', q.w);
console.log(JSON.stringify(out));
