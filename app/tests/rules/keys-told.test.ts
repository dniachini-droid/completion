/**
 * Every Key a recurring job earns is told on that job's return, when it is earned, whether it opens something at once or
 * is kept for later; a kept Key that opens something later says it was kept, never that the job in hand earned it
 * (Dan, 2026-10-01, D-141). Ids only: no story text is asserted or printed.
 */
import { describe, expect, it } from 'vitest';
import { returnOf } from '../../src/core/game';
import type { Fact } from '../../src/core/types';
import { content as C } from '../../src/content/world';
import { heavy } from '../review/heavy';

/* the Done whose facts a fact was written with: the last jobDone before it, the same day */
const doneOf = (facts: Fact[], seq: number) => [...facts].reverse().find(f => f.seq < seq && f.type === 'jobDone');
const arrivedSince = (facts: Fact[], from: number, to: number) => facts.some(f => f.seq > from && f.seq < to && f.type === 'arrived');

describe('Keys are told when earned, and kept Keys are told as kept (D-141)', () => {
  /* five weeks at 2 hours runs ahead of the niches in reach, so some Keys are kept for later */
  for (const [days, h] of [[21, 3], [21, 8], [35, 2]] as const) it(`${h} hours a day for ${days} days`, () => {
    const { facts } = heavy(days, h);
    let earned = 0, held = 0, keptOnReturn = 0;
    for (const f of facts) {
      if (f.type === 'keyEarned' && !f.rhythm.startsWith('floor:')) {
        const d = doneOf(facts, f.seq)!;
        const next = facts.find(g => g.seq === f.seq + 1)!;
        expect(returnOf(C, facts, d.seq).keyNote, `${f.day} ${f.rhythm}`).toBe(next.type === 'keyHeld' ? 'held' : 'earned');
        if (next.type === 'keyHeld') held++; else earned++;
      }
      /* a kept Key used on a job's return (not on an arrival the same Done reached) */
      if (f.type === 'keyUsed' && !f.chosen) {
        const d = doneOf(facts, f.seq);
        if (!d || d.day !== f.day || arrivedSince(facts, d.seq, f.seq)) continue;
        expect(returnOf(C, facts, d.seq).keyNote, f.day).toBe('kept');
        keptOnReturn++;
      }
    }
    expect(earned + held).toBeGreaterThan(0);
    /* kept Keys are used later: where Dan is, on a job's return, or on the Map (D-142) */
    if (days === 35) { expect(held, 'some Keys are kept').toBeGreaterThan(0); expect(keptOnReturn + facts.filter(f => f.type === 'keyUsed' && f.chosen).length).toBeGreaterThan(0); }
  }, 120_000);
});

describe('Today shows the Keys kept and what needs one (Dan, D-142)', () => {
  it('the count is the Keys earned and not yet used; "Needs a Key" only on a sealed thing a Key alone opens', async () => {
    const S = await import('../../src/core/story');
    const { see } = await import('../../src/core/game');
    /* (Keys kept, not spent on the Map: since D-160 the top's locks are all in view by week 3, so a player who spends every
       Key at the day's end never holds one overnight) */
    const { facts } = heavy(35, 2, true, 1, { noMap: true });
    let kept = 0, needs = 0;
    for (const day of [...new Set(facts.map(f => f.day))]) {
      const upTo = facts.filter(f => f.day <= day), last = upTo[upTo.length - 1];
      const v = see(upTo, C, last.at), st = S.storyState(upTo, C.story);
      expect(v.keys, day).toBe(st.held);
      const view = S.inView(C.story, st, st.stretch);
      expect(v.aheadKey, day).toBe(!!view && !S.onRoad(C.story, view.id));
      if (v.keys) kept++; if (v.aheadKey) needs++;
    }
    /* a light worker holds a Key on some days, and meets something only a Key opens */
    expect(kept).toBeGreaterThan(0);
    expect(needs).toBeGreaterThan(0);
  }, 120_000);
});

describe('a Key is never spent for Dan; the Map and Today agree (D-143 A)', () => {
  it('every Key earned is kept, and every Key used was chosen: none on a return or an arrival', () => {
    for (const h of [2, 3, 8]) {
      const { facts } = heavy(35, h, true, 1, { noMap: true });
      for (const f of facts) if (f.type === 'keyEarned') expect(facts.find(g => g.seq === f.seq + 1)?.type, `${h} h, ${f.day}`).toBe('keyHeld');
      expect(facts.filter(f => f.type === 'keyUsed').length, `${h} h: no Key used without the Map`).toBe(0);
      expect(facts.filter(f => f.type === 'sealOpened' && f.how !== 'road').length, `${h} h: nothing opened by a Key by itself`).toBe(0);
    }
  }, 240_000);
  it('wherever Today says a Key can be used, the Map lists that thing there with "Use a Key"; "here" only where Dan is', async () => {
    const S = await import('../../src/core/story');
    const { see } = await import('../../src/core/game');
    let pointed = 0;
    for (const h of [2, 3]) {
      const { facts } = heavy(35, h, true, 1, { noMap: true });
      for (const day of [...new Set(facts.map(f => f.day))]) {
        const upTo = facts.filter(f => f.day <= day), last = upTo[upTo.length - 1];
        const v = see(upTo, C, last.at), st = S.storyState(upTo, C.story);
        if (!v.keyUse) { expect(!st.held || !S.openable(C.story, st).length, `${h} h, ${day}`).toBe(true); continue; }
        pointed++;
        const listed = S.lockedOn(C.story, st, v.keyUse), open = new Set(S.openable(C.story, st).map(x => x.id));
        expect(listed.some(x => open.has(x.id)), `${h} h, ${day}: the Map's box on ${v.keyUse} offers a Key`).toBe(true);
        /* "here" is the area Dan is in, any stretch of it (D-154: the Stair's two flights are one area) */
        const area = (x: string) => S.areaOf(C.story, x as Parameters<typeof S.areaOf>[1]);
        if (v.keyHere) { expect(area(v.keyUse), day).toBe(area(st.stretch)); expect(open.has(v.keyHere), day).toBe(true); }
        else expect(S.openable(C.story, st).some(x => area(x.stretch) === area(st.stretch)), day).toBe(false);
      }
    }
    expect(pointed).toBeGreaterThan(0);
  }, 240_000);
  it('"Ahead" never names a locked thing behind Dan while one is in view where he is; behind, it says so', async () => {
    const S = await import('../../src/core/story');
    const { see } = await import('../../src/core/game');
    let behind = 0;
    /* (at three paces: since a job's moment elsewhere no longer moves Dan, D-160 round 8, one pace may never leave a
       locked thing only behind him) */
    for (const h of [2, 3, 8]) {
    const { facts } = heavy(35, h, true, 1, { noMap: true });
    for (const day of [...new Set(facts.map(f => f.day))]) {
      const upTo = facts.filter(f => f.day <= day), last = upTo[upTo.length - 1];
      const v = see(upTo, C, last.at), st = S.storyState(upTo, C.story);
      /* worked out here, not by inView's own stretch filter: every shut thing the story has shown, in the order shown */
      const shut = C.story.beats.filter(b => st.played.has(b.id)).flatMap(b => b.carries?.inView ?? [])
        .map(id => S.sealOf(C.story, id)).filter(x => !!x && !x.seenOnly && !st.opened.has(x.id));
      if (!shut.length || !v.aheadKey) continue;
      /* behind: in another area (D-154) */
      if (shut.some(x => S.areaOf(C.story, x!.stretch) === S.areaOf(C.story, st.stretch))) expect(v.aheadBehind, day).toBe(null);
      else { const x = shut[shut.length - 1]!; if (S.onRoad(C.story, x.id)) continue; behind++; expect(v.aheadBehind, day).toBe(x.stretch); }
    }
    }
    expect(behind, 'a day with a locked thing only behind Dan').toBeGreaterThan(0);
  }, 360_000);
  it('a niche of a later story week is never offered on a stretch the route loops back to (rule 5)', async () => {
    const S = await import('../../src/core/story');
    const { facts } = heavy(35, 2, true, 1, { noMap: true });
    for (const day of [...new Set(facts.map(f => f.day))]) {
      const st = S.storyState(facts.filter(f => f.day <= day), C.story);
      for (const x of S.openable(C.story, st)) expect(x.w <= st.week || (!!x.plain && x.w === st.week + 1), `${day}: ${x.id}`).toBe(true);
    }
  }, 120_000);
});

describe('Use a Key, on the Map (D-142)', () => {
  it('opens the niche chosen, spends one Key, is refused without a Key or on a niche not yet reached, and is no arrival\'s', async () => {
    const S = await import('../../src/core/story');
    const { act } = await import('../../src/core/game');
    const { facts } = heavy(35, 2, true, 1, { noMap: true });
    const st = S.storyState(facts, C.story), list = S.openable(C.story, st);
    expect(st.held).toBeGreaterThan(0);
    expect(list.length).toBeGreaterThan(0);
    const at = facts[facts.length - 1].at;
    /* not yet reachable: refused */
    const far = C.story.seals.find(x => !x.seenOnly && !S.onRoad(C.story, x.id) && !st.opened.has(x.id) && !list.includes(x))!;
    expect(act(facts, C, { do: 'useKey', seal: far.id }, at).filter(f => f.type === 'sealOpened')).toEqual([]);
    /* the last in the list (not the oldest): Dan chooses */
    const pick = list[list.length - 1];
    const out = facts.concat(act(facts, C, { do: 'useKey', seal: pick.id }, at));
    const after = S.storyState(out, C.story);
    expect(after.opened.has(pick.id)).toBe(true);
    expect(after.held).toBe(st.held - 1);
    /* the same tap again: nothing more */
    expect(act(out, C, { do: 'useKey', seal: pick.id }, at).filter(f => f.type === 'sealOpened')).toEqual([]);
    /* with no Key left, refused */
    let spent = out;
    for (let k = 0; k < 20; k++) { const s2 = S.storyState(spent, C.story), x = S.openable(C.story, s2)[0]; if (!s2.held || !x) break; spent = spent.concat(act(spent, C, { do: 'useKey', seal: x.id }, at)); }
    const s3 = S.storyState(spent, C.story), rest = S.openable(C.story, s3);
    if (!s3.held && rest.length) expect(act(spent, C, { do: 'useKey', seal: rest[0].id }, at).filter(f => f.type === 'sealOpened')).toEqual([]);
  }, 120_000);
  it('no niche needs another niche first, so they may open in any order', async () => {
    const S = await import('../../src/core/story');
    const niches = C.story.seals.filter(x => !x.seenOnly && !S.onRoad(C.story, x.id));
    const ids = new Set(niches.map(x => x.id));
    for (const x of niches) {
      const by = C.story.beats.filter(b => b.carries?.inView?.includes(x.id));
      for (const b of by) for (const r of b.req) expect(ids.has(r), `${x.id} seen by ${b.id} after ${r}`).toBe(false);
    }
  });
});

describe('what a week kept, and a Key already earned (D-143 B; the flow review S4, L C4)', () => {
  it('a Daybook page counts every niche a Key opened that week, and lists the week\'s finds', async () => {
    const { weekKept } = await import('../../src/core/game');
    const { calendarWeek } = await import('../../src/core/time');
    const { facts } = heavy(21, 2);
    const closes = facts.filter(f => f.type === 'weekClosed');
    expect(closes.length).toBeGreaterThan(0);
    let counted = 0;
    for (const p of closes) {
      if (p.type !== 'weekClosed') continue;
      const opened = facts.filter(f => f.type === 'sealOpened' && f.how !== 'road' && calendarWeek(f.day) === p.week).map(f => (f as { seal: string }).seal);
      expect(p.seals, p.week).toEqual(opened);
      expect(weekKept(facts, p.week).opened, p.week).toEqual(opened);
      expect(weekKept(facts, p.week).finds, p.week).toEqual([...new Set(facts.filter(f => f.type === 'findGiven' && calendarWeek(f.day) === p.week).map(f => (f as { id: string }).id))]);
      counted += opened.length;
    }
    expect(counted, 'some Keys were used and counted').toBeGreaterThan(0);
  }, 120_000);
  it('a recurring job kept up again in a period whose Key it earned says so; the session that earned it does not', async () => {
    const { act } = await import('../../src/core/game');
    let facts: Fact[] = [];
    const at = (d: number, h: number) => `2026-10-0${d}T${String(h).padStart(2, '0')}:00:00+01:00`;
    const run = (cmd: Parameters<typeof act>[2], when: string) => { facts = facts.concat(act(facts, C, cmd, when)); };
    run({ do: 'open' }, at(5, 8));
    /* the tank, fortnightly: once earns the fortnight's Key; again two days later says it was already earned */
    run({ do: 'tickOff', job: 'tank', minutes: 60 }, at(5, 9));
    const first = facts.filter(f => f.type === 'jobDone' && f.job === 'tank').pop()!;
    expect(facts.some(f => f.type === 'keyEarned' && f.rhythm === 'r-tank')).toBe(true);
    expect(returnOf(C, facts, first.seq).keyAlready).toBe(null);
    run({ do: 'open' }, at(7, 8));
    run({ do: 'tickOff', job: 'tank', minutes: 30 }, at(7, 9));
    const again = facts.filter(f => f.type === 'jobDone' && f.job === 'tank').pop()!;
    expect(again.seq).not.toBe(first.seq);
    expect(returnOf(C, facts, again.seq).keyAlready).toBe('fortnight');
    /* and it brings no Key note of its own */
    expect(returnOf(C, facts, again.seq).keyNote).toBe(null);
  }, 120_000);
});
