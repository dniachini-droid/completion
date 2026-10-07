/**
 * Deep review of the story and its content wiring (sealed report: docs/narrative/sealed/reviews/DEEP-STORY.md;
 * Dan-facing summary: docs/reviews/deep/STORY-SPOILER-FREE.md). Ids only: no story text is asserted or printed (D-015).
 *
 * Like the other deep reviews, a probe named "FINDING:" asserts the problem as it stands, so a passing FINDING is a
 * reproduced finding (it will fail once fixed, and should then be turned round or removed). Probes without the prefix
 * are controls: they pass when the wiring holds. Probes named "fixed (S#n)" were findings, turned round once the wiring
 * was built (FIX-LIST Stage 7): they fail on the code before it. "accepted" ones record a finding kept on purpose.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle, PAINTED, paintingOf, STAND_IN, type Command } from '../../src/core/game';
import * as S from '../../src/core/story';
import type { Fact } from '../../src/core/types';
import type { Story } from '../../src/core/story-types';
import { content as C } from '../../src/content/world';
import { aheadOfDan, outOfOrder } from '../rules/guards';

const s: Story = C.story;
/* Node's own bits, reached without Node's types (as tests/review/node.ts and tests/rules/nodedb.ts do) */
const node = (globalThis as unknown as { process: { cwd(): string; getBuiltinModule(n: string): any } }).process;
const fs = node.getBuiltinModule('node:fs'), path = node.getBuiltinModule('node:path'), cp = node.getBuiltinModule('node:child_process');
const join = (...p: string[]): string => path.join(...p);
const readFileSync = (p: string, e: 'utf8'): string => fs.readFileSync(p, e);
const readdirSync = (p: string): string[] => fs.readdirSync(p);
const statSync = (p: string): { isDirectory(): boolean } => fs.statSync(p);
const execSync = (c: string, o: { cwd: string }): string => cp.execSync(c, o).toString();
const ROOT = path.resolve(node.cwd(), node.cwd().endsWith('/app') ? '..' : '.');
/* the story words a probe needs live in a sealed file, so this file carries none (D-015) */
const SEALED = JSON.parse(readFileSync(join(ROOT, 'docs/narrative/sealed/reviews/deep-story-patterns.json'), 'utf8')) as Record<string, string>;
const rx = (k: string, f = '') => new RegExp(SEALED[k], f);

/* ---------- a simulated Dan who also spends his Keys (the rule sims never use one) ---------- */

type Day = 'normal' | 'low' | 'high' | 'away';
function player(bed?: 'kept' | 'late', keys = true) {
  let facts: Fact[] = [];
  let now = Date.parse('2026-09-28T08:00:00+01:00');   /* a Monday */
  const at = () => new Date(now + 3_600_000).toISOString().slice(0, 19) + '+01:00';
  const run = (cmd: Command) => { facts = facts.concat(act(facts, C, cmd, at())); };
  const wait = (min: number) => { now += min * 60_000; facts = facts.concat(settle(facts, C, at())); };
  const answer = () => {
    const st = S.storyState(facts, s);
    for (const m of st.offered) if (!st.guessed.has(m)) { const mk = S.markOf(s, m); if (mk?.candidates) run({ do: 'guess', mark: m, guess: mk.candidates[0] }); }
    if (keys) for (let k = 0; k < 10; k++) {
      const st2 = S.storyState(facts, s), x = S.openable(s, st2)[0];
      if (!x || st2.held < 1) break;
      run({ do: 'useKey', seal: x.id });
    }
    let a = see(facts, C, at()).arrival;
    while (a) { run({ do: 'seen', what: 'arrival', ref: a.seq }); a = see(facts, C, at()).arrival; }
  };
  const day = (kind: Day) => {
    const d0 = now;
    if (kind === 'away') { now = d0 + 864e5; return; }
    run({ do: 'open' });
    if (kind === 'low') run({ do: 'capacity', capacity: 'low' });
    if (kind === 'high') run({ do: 'capacity', capacity: 'high' });
    for (let guard = 0; guard < 12; guard++) {
      answer();
      const v = see(facts, C, at());
      if (v.complete && kind !== 'high') break;
      if (v.complete && guard > 8) break;
      const job = v.next?.job ?? v.order.find(j => !v.done.has(j)) ?? (kind === 'high' ? C.jobs.find(j => !v.done.has(j.id) && !j.item)?.id : undefined);
      if (!job) break;
      const j = C.jobs.find(x => x.id === job)!;
      if (j.delve) { run({ do: 'startRun', job, minutes: 25, count: Math.ceil((j.enoughAt ?? j.length) / 25) }); wait((j.enoughAt ?? j.length) * 1.3 + 10); if (!see(facts, C, at()).done.has(job)) run({ do: 'done', job }); }
      else { run({ do: 'begin', job }); wait(j.length); run({ do: 'done', job }); }
      const e = see(facts, C, at()).runEnd; if (e) run({ do: 'seen', what: 'step', ref: e.seq });
    }
    answer();
    if (bed) { now = Math.max(now, d0 + (bed === 'kept' ? 13.75 : 15.5) * 3_600_000); run({ do: 'goodnight' }); }
    now = d0 + 864e5;
  };
  return {
    get facts() { return facts; },
    week(k: Day | Day[]) { for (let i = 0; i < 7; i++) day(Array.isArray(k) ? k[i] : k); return this; },
  };
}
/* runs shared by the probes below, made once */
const memo = new Map<string, Fact[]>();
function life(name: 'normal' | 'high' | 'slow' | 'normal-late'): Fact[] {
  const hit = memo.get(name);
  if (hit) return hit;
  const slow: Day[] = ['low', 'away', 'low', 'away', 'low', 'away', 'away'];
  const p = player(name === 'normal-late' ? 'late' : 'kept');
  if (name === 'normal' || name === 'normal-late') for (let i = 0; i < 15; i++) p.week('normal');
  if (name === 'high') for (let i = 0; i < 8; i++) p.week('high');
  if (name === 'slow') for (let i = 0; i < 22; i++) p.week(slow);
  memo.set(name, p.facts);
  return p.facts;
}
const playedIds = (facts: Fact[]) => facts.flatMap(f => f.type === 'beatPlayed' && f.id !== 'passage' ? [f.id] : f.type === 'arrived' && f.kind === 'place' ? [f.id] : []);
const closes = (facts: Fact[]) => facts.filter((f): f is Extract<Fact, { type: 'weekClosed' }> => f.type === 'weekClosed');

/* ---------- every player-facing string, with where it lives ---------- */

const TEXT_KEYS = new Set(['line', 'lines', 'paper', 'sheet', 'name', 'taps', 'choice', 'where', 'shape', 'struck', 'context', 'full']);
function texts(): { id: string; key: string; text: string }[] {
  const out: { id: string; key: string; text: string }[] = [];
  const walk = (o: unknown, id: string) => {
    if (Array.isArray(o)) { o.forEach(v => walk(v, id)); return; }
    if (!o || typeof o !== 'object') return;
    const rec = o as Record<string, unknown>, me = typeof rec.id === 'string' ? rec.id : id;
    for (const [k, v] of Object.entries(rec)) {
      if (TEXT_KEYS.has(k)) for (const t of Array.isArray(v) ? v : [v]) { if (typeof t === 'string') out.push({ id: me, key: k, text: t }); }
      else if (typeof v === 'object') walk(v, me);
    }
  };
  walk(s, '');
  return out;
}

describe('deep story: the content wiring (static)', () => {
  it('every id named anywhere resolves, except three week-morning ids that are fact ids with no beat', () => {
    const ids = new Set<string>([...s.beats, ...s.seals, ...s.records, ...s.marks, ...s.finds, ...s.camps, ...s.words, ...s.passages, ...s.teasers].map(x => x.id));
    const bad: string[] = [];
    const chk = (from: string, id: string | undefined) => { if (id && !ids.has(id)) bad.push(`${from}->${id}`); };
    for (const b of s.beats) { b.req.forEach(r => chk(b.id, r)); chk(b.id, b.until); chk(b.id, b.seal); for (const k of ['records', 'guess', 'seen', 'inView'] as const) b.carries?.[k]?.forEach(r => chk(b.id, r)); chk(b.id, b.carries?.word); }
    for (const x of s.seals) { chk(x.id, x.beat); chk(x.id, x.arrival); for (const k of ['records', 'guess', 'seen', 'inView'] as const) x.carries?.[k]?.forEach(r => chk(x.id, r)); chk(x.id, x.carries?.word); }
    for (const r of s.records) { r.firstShown.forEach(f => chk(r.id, f)); for (const l of r.cut ?? []) for (const t of l) { if ('s' in t && typeof t.s === 'string' && !('ring' in t)) chk(r.id, t.s); if ('ring' in t) t.s?.forEach(q => chk(r.id, q)); } }
    for (const m of s.marks) { chk(m.id, m.guessAt); chk(m.id, m.confirmedBy); }
    for (const w of s.words) [...w.marks, ...w.beats, ...w.req].forEach(q => chk(w.id, q));
    for (const f of s.finds) { f.req.forEach(q => chk(f.id, q)); chk(f.id, f.until); chk(f.id, f.told); }
    for (const k of s.camps) { k.req.forEach(q => chk(k.id, q)); chk(k.id, k.until); if ('find' in k.look) chk(k.id, k.look.find); }
    for (const p of [...s.passages, ...s.teasers]) { p.req.forEach(q => chk(p.id, q)); chk(p.id, p.until); }
    for (const l of [...s.learned, ...s.soFar.flatMap(m => m.items ?? [])]) l.req.forEach(q => chk(l.id, q));
    for (const q of s.openQuestions) { (q.req ?? []).forEach(r => chk(q.id, r)); chk(q.id, q.until); }
    for (const x of s.stretches) x.req.forEach(q => chk(x.id, q));
    for (const rw of s.route) rw.places.forEach(p => chk(`route ${rw.w}`, p.id));
    expect(bad.sort()).toEqual(['mk-door->b-w3.morning', 'mk-eat->b-w6.morning', 'mk-go->b-w5.morning', 'mk-here->b-w3.morning']);
  });

  it('every route place is a named place of its week; a Key-marked place is exactly one sealed row\'s arrival', () => {
    const bad: string[] = [];
    const seen = new Set<string>();
    for (const rw of s.route) for (const p of rw.places) {
      const b = S.beatOf(s, p.id)!;
      if (seen.has(p.id)) bad.push(`twice:${p.id}`); seen.add(p.id);
      if (!['arrival', 'arrivalKey', 'word'].includes(b.kind) || !b.name || b.w !== rw.w) bad.push(`shape:${p.id}`);
      const rows = s.seals.filter(x => x.arrival === p.id);
      if (!!p.k !== (rows.length === 1)) bad.push(`k:${p.id}`);
    }
    for (const b of s.beats) if (['arrival', 'arrivalKey', 'word'].includes(b.kind) && !seen.has(b.id) && !b.retired) bad.push(`off-route:${b.id}`);
    for (const b of s.beats.filter(x => x.kind === 'stepKey')) if (s.seals.filter(x => x.beat === b.id && x.id === b.seal).length !== 1) bad.push(`stepKey:${b.id}`);
    expect(bad).toEqual([]);
  });

  it('every record is carried by something; every guessable mark is offered at one place', () => {
    const carried = new Set<string>([...s.beats.flatMap(b => b.carries?.records ?? []), ...s.seals.flatMap(x => x.carries?.records ?? []), ...s.finds.flatMap(f => f.told ? [f.told] : [])]);
    expect(s.records.filter(r => !carried.has(r.id)).map(r => r.id)).toEqual([]);
    for (const m of s.marks.filter(x => x.candidates?.length)) {
      const at = [...s.beats.filter(b => b.carries?.guess?.includes(m.id)).map(b => b.seal ?? b.id), ...s.seals.filter(x => x.carries?.guess?.includes(m.id)).map(x => x.id)];
      expect(new Set(at).size, m.id).toBe(1);
    }
  });

  it('FINDING: two guessable marks have no confirming beat in the content (they stay guesses at the end)', () => {
    expect(s.marks.filter(m => m.candidates?.length && !m.confirmedBy).map(m => m.id).sort()).toEqual(['mk-hear', 'mk-world']);
  });

  it('FINDING: every route place and camp view has its own painting, but the views D-160 added (their stretch\'s painting stands in)', () => {
    const missing = [...s.route.flatMap(r => r.places.map(p => p.id)), ...s.camps.map(c => c.id)].filter(id => !PAINTED.has(id) && paintingOf(id, 'st-mouth') === STAND_IN['st-mouth']);
    /* the places D-160 made (the copy, the first turn, the gap's record) and its views: their stretch's painting stands in */
    expect(missing).toEqual(['b-3.2', 'b-3.6', 'b-4.2', 'b-5.1', 'b-13.1', ...Array.from({ length: 36 }, (_, i) => `cv-${22 + i}`)]);
  });

  it('fixed (S#5): one month\'s summary has six lines, and a week close can show six', () => {
    const long = s.soFar.filter(m => (m.items ?? []).length > 5).map(m => m.id);
    expect(long).toEqual(['sf-m2']);
    expect(Math.max(...s.soFar.map(m => (m.items ?? []).length))).toBeLessThanOrEqual(6);
  });

  it('FINDING: one cut record has no authored full rendering to test against', () => {
    expect(s.records.filter(r => r.kind === 'cut' && !r.full).map(r => r.id)).toEqual(['rec-k2']);
  });
});

describe('deep story: text hygiene', () => {
  it('no double spaces, stray whitespace, HTML, TODOs or empty strings', () => {
    const bad = texts().filter(t => /  |^\s|\s$|<[a-z/]|TODO|TBD|FIXME/.test(t.text) || !t.text.trim()).map(t => `${t.id}.${t.key}`);
    expect(bad).toEqual([]);
  });
  it('fixed (S#8): the 13 texts with authored emphasis show it in italics, never as a literal asterisk', async () => {
    const hit = texts().filter(t => t.text.includes('*'));
    expect([...new Set(hit.map(t => t.id))].sort()).toEqual(['aw-w4', 'fd-c14', 'fd-d04', 'fd-e05', 'fd-e10', 'fd-f02', 'ps-s18', 'rec-l10', 'rec-l2', 'rec-l3', 'rec-l8', 'seal-3-6', 'wc-w4-1']);
    const { emphasis } = await import('../../src/ui/emphasis');
    for (const t of hit) {
      const parts = emphasis(t.text);
      expect(parts.some(p => p.t.includes('*')), t.id).toBe(false);
      expect(parts.some(p => p.em), t.id).toBe(true);
    }
  });
  it('fixed (S#9): one apostrophe throughout, the curly one (none straight, in a word or closing one)', () => {
    const all = texts();
    expect(all.filter(t => /\w'\w|s'(?!\w)/.test(t.text)).map(t => `${t.id}.${t.key}`)).toEqual([]);
    expect(all.filter(t => /’/.test(t.text)).length).toBeGreaterThan(200);
  });
  it('fixed (S#10): no calendar-week wording left in the story lines (D-123)', () => {
    const hit = s.beats.filter(b => /\b(your first week|The week ends)\b/.test(b.line ?? '')).map(b => b.id).sort();
    expect(hit).toEqual([]);
  });
  it('fixed (D-154): no place name uses the word the weeks 8-14 editing pass kept for another place', () => {
    expect(S.beatOf(s, 'b-14.A')!.name).not.toMatch(rx('reservedWord'));
    /* (the other place it was kept for is a moment at the standing stone since D-160, with no name of its own) */
  });
  it('FINDING: one physical clue the ledger hands over once appears in seven texts', () => {
    const ids = [...s.beats, ...s.passages, ...s.teasers, ...s.learned, ...s.openQuestions]
      .filter(x => rx('clueA').test(x.line ?? '') && rx('clueB').test(x.line ?? '')).map(x => x.id).sort();
    expect(ids).toEqual(['aw-w12', 'b-12.C', 'b-w12.close', 'b-w12.tz2', 'b-w13.tz1', 'ps-d05', 'wc-w12-3']);
  });
  it('FINDING: most rows the road opens without a Key still describe their count filling with light (D-129)', () => {
    const road = [...S.roadSeals(s)];
    const lit = road.filter(id => {
      const x = S.sealOf(s, id)!, b = S.beatOf(s, x.beat ?? x.arrival ?? '');
      return rx('countLit', 'i').test(b?.line ?? x.line ?? '');
    });
    expect(road.length).toBe(30);
    expect(lit.length).toBe(28);
  });
});

describe('deep story: nothing sealed outside the sealed places', () => {
  const TRUTH = rx('truthTerms'), BENIGN = rx('benignTerms', 'g');
  const files = (dir: string, out: string[] = []): string[] => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (/node_modules|sealed|\.git$|paint\/places|ios|dist/.test(p)) continue;
      if (statSync(p).isDirectory()) files(p, out); else if (/\.(md|ts|svelte|js|mjs|json|html)$/.test(f)) out.push(p);
    }
    return out;
  };
  it('no truth-level name or term in the app copy, the open docs, the app code or tests (outside sealed folders)', () => {
    const hits = [...files(join(ROOT, 'docs')), ...files(join(ROOT, 'app/src')), ...files(join(ROOT, 'app/tests'))]
      .filter(p => { const t = readFileSync(p, 'utf8'); return TRUTH.test(t.replace(BENIGN, '')); });
    expect(hits.map(p => p.slice(ROOT.length + 1))).toEqual([]);
  });
  it('no truth-level term in the last 60 commit messages', () => {
    const log = execSync('git log --format=%B -60', { cwd: ROOT });
    expect(TRUTH.test(log)).toBe(false);
  });
  it('the app copy repeats no seven-word run of any story text', () => {
    const norm = (t: string) => t.toLowerCase().replace(/[’'-]+/g, ' ').replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);
    const runs = new Set<string>();
    for (const t of texts()) { const w = norm(t.text); for (let i = 0; i + 7 <= w.length; i++) runs.add(w.slice(i, i + 7).join(' ')); }
    const w = norm(readFileSync(join(ROOT, 'app/src/content/copy/en.ts'), 'utf8'));
    let n = 0; for (let i = 0; i + 7 <= w.length; i++) if (runs.has(w.slice(i, i + 7).join(' '))) n++;
    expect(n).toBe(0);
  });
});

describe('deep story: fourteen story weeks played through, Keys spent (dynamic)', () => {
  it('Normal, bedtime kept: nothing plays twice, nothing ahead of Dan or out of order; every row, record and find comes', () => {
    const f = life('normal'), st = S.storyState(f, s);
    expect(st.week).toBe(14);
    const ids = playedIds(f);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
    const opened = f.flatMap(x => x.type === 'sealOpened' ? [x.seal] : []);
    expect(opened.filter((x, i) => opened.indexOf(x) !== i)).toEqual([]);
    expect(aheadOfDan(f)).toEqual([]);
    expect(outOfOrder(f)).toEqual([]);
    expect(s.seals.filter(x => !x.seenOnly && !st.opened.has(x.id)).map(x => x.id)).toEqual([]);
    expect(s.records.filter(r => !st.records.includes(r.id)).map(r => r.id)).toEqual([]);
    /* every find below the top comes; the top's are texture that can pass unseen once Dan has gone down (D-160) */
    expect(s.finds.filter(x => !st.given.has(x.id) && !S.isTop(s, x.stretch)).map(x => x.id)).toEqual([]);
  }, 300_000);

  it('fixed (S#2b): every camp line plays, at any pace, bedtime kept every night', () => {
    for (const name of ['normal', 'high'] as const) {
      const played = new Set(playedIds(life(name)));
      expect(s.beats.filter(b => b.kind === 'camp' && !played.has(b.id)).map(b => b.id), name).toEqual([]);
    }
  }, 300_000);

  /* accepted (S#3): a morning that confirms marks never waits on bedtime (D-073), and nothing in those lines refers to the
     camp line, so the order stays */
  it('accepted (S#3, D-073): in four story weeks the morning beat plays before that week\'s own camp line (Normal pace)', () => {
    const f = life('normal'), at = new Map<string, number>();
    f.forEach((x, i) => { if (x.type === 'beatPlayed' && !at.has(x.id)) at.set(x.id, i); });
    const early = s.beats.filter(b => b.kind === 'morning' && b.w > 1).filter(b => {
      const m = at.get(b.id), c = at.get(b.id.replace('.morning', '.camp'));
      return m !== undefined && c !== undefined && m < c;
    }).map(b => b.id);
    /* (three since D-154: the night's line waits for what Dan has been shown, and week 10's now comes first) */
    expect(early).toEqual(['b-w12.morning', 'b-w13.morning']);
  }, 300_000);

  it('fixed (S#1): no week-close glimpse describes a sealed state after Dan has opened it (Normal, High)', () => {
    /* glimpse -> the beat that opens what it describes as still shut */
    const SUPERSEDED: Record<string, string> = { 'b-w1.close': 'b-3.A', 'b-w4.close': 'b-7.C', 'b-w6.close': 'b-7.A', 'b-w9.close': 'b-10.A' };
    const stale = (f: Fact[]) => { const played = new Set<string>(), out: string[] = [];
      for (const x of f) {
        const id = x.type === 'beatPlayed' ? x.id : x.type === 'arrived' && x.kind === 'place' ? x.id : null;
        if (!id) continue;
        if (SUPERSEDED[id] && played.has(SUPERSEDED[id])) out.push(id);
        played.add(id);
      }
      return out; };
    expect(stale(life('normal'))).toEqual([]);
    expect(stale(life('high'))).toEqual([]);
  }, 300_000);

  it('fixed (S#4): at a High pace the glimpse lags the story by 3 story weeks at most, and the learned lines keep up', () => {
    const f = life('high');
    let wk = 1; const lag: number[] = [];
    for (const x of f) {
      if (x.type === 'storyWeekBegan') wk = x.w;
      if (x.type === 'weekClosed' && x.glimpse) lag.push(wk - S.beatOf(s, x.glimpse)!.w);
    }
    expect(Math.max(...lag)).toBeLessThanOrEqual(3);
    const shown = new Set(closes(f).flatMap(c => c.learned));
    /* 8 calendar weeks, the story ended in week 3: at most one page's worth waits for the page not written yet */
    expect(s.learned.filter(l => !shown.has(l.id)).length).toBeLessThanOrEqual(3);
  }, 300_000);

  it('a glimpse not shown at Normal pace is only one the story moved past before a close could show it (S#1, S#12)', () => {
    const f = life('normal'), shown = new Set(closes(f).map(c => c.glimpse)), st = S.storyState(f, s);
    const missed = s.beats.filter(b => b.kind === 'close' && !shown.has(b.id));
    expect(missed.filter(b => !(b.until && S.met(st, b.until))).map(b => b.id)).toEqual([]);
    /* (the story runs a little faster for the same effort since evenings cost no walking, D-154: one more is passed; and a
       page now waits for what it says Dan has seen, so one more is passed before a close could show it: four, each
       superseded, as the line above holds) */
    /* FINDING (D-160): ten pass unseen at Normal pace now: a page shows the week just walked, and the review's round 1 ended
       each glimpse once the story moves past what it says, so most weeks' glimpses are passed between two pages */
    expect(missed.length).toBeLessThanOrEqual(10);
  }, 300_000);

  it('fixed (S#12): a camp view that stops being offered later comes first in its area (Normal, High, slow; D-154)', () => {
    /* where Dan turns back is always in the area he is walking (D-154), so a view with an end is offered whenever he turns
       back in its area while it lasts, before that area's others; one in an area he never turns back in may pass */
    for (const name of ['normal', 'high', 'slow'] as const) {
      const f = life(name), bad: string[] = [];
      for (let i = 0; i < f.length; i++) {
        const x = f[i];
        /* (a camp at the place he reached is no view, D-160) */
        if (x.type !== 'arrived' || x.kind !== 'camp' || x.where === 'place') continue;
        const st = S.storyState(f.slice(0, i), s), area = S.areaOf(s, st.stretch);
        /* (a view of the place he camps at, D-160: the views are tied to places) */
        const due = s.camps.filter(c => c.until && (c.near ? c.near === st.here : S.areaOf(s, c.stretch) === area) && st.visited.has(c.stretch) && c.w <= st.week
          && c.req.every(r => S.met(st, r)) && !S.met(st, c.until) && !st.campsShown.includes(c.id));
        if (due.length && !due.some(c => c.id === x.id)) bad.push(`${x.day} ${x.id} (${due.map(c => c.id).join(',')} due)`);
      }
      expect(bad, name).toEqual([]);
    }
  }, 600_000);

  it('fixed (S#5): every line of every month\'s summary is shown (Normal)', () => {
    const shown = new Set(closes(life('normal')).flatMap(c => c.soFar));
    expect(s.soFar.flatMap(m => m.items ?? []).filter(l => !shown.has(l.id)).map(l => l.id)).toEqual([]);
  }, 300_000);

  it('fixed (S#5): a player working half the days gets every month\'s summary line whose beats he has reached (by story week)', () => {
    const f = life('slow'), last = closes(f).at(-1)!;
    /* what his story held at the last page written (a line whose beats played since waits for the next page) */
    const st = S.storyState(f.filter(x => x.seq <= last.seq), s);
    const shown = new Set(closes(f).flatMap(c => c.soFar));
    const due = s.soFar.filter(m => m.w <= st.week).flatMap(m => m.items ?? []).filter(l => l.req.every(r => S.met(st, r)));
    expect(due.filter(l => !shown.has(l.id)).map(l => l.id)).toEqual([]);
    expect(due.filter(l => l.id.startsWith('sf-m3') || l.id.startsWith('sf-m4')).length).toBeGreaterThan(0);
    /* (since Part 2 #1 he walks less: missed sessions no longer pile onto a return; still deep into the story) */
    expect(S.storyState(f, s).week).toBeGreaterThanOrEqual(12);
  }, 600_000);
});
