/**
 * Deep review, persistence / platform / native (docs/reviews/deep/PLATFORM.md). Each probe states what happens now;
 * `it.fails` is not used: every probe passes while the problem is there (its expectation describes the problem).
 * Ids only: no story text here.
 */
import { describe, expect, it } from 'vitest';
import { act, see, settle } from '../../src/core/game';
import { copyDue, copyName, COPY_PREFIX, readSave, SAVE_VERSION } from '../../src/core/save';
import type { Fact } from '../../src/core/types';
import { sqlSaves, type Arg, type Db } from '../../src/platform/saves';
import { content as C } from '../../src/content/world';
import { nodeDb } from '../rules/nodedb';

const NOW = '2026-10-01T10:00:00+01:00';
/** What game.restore() does after Settings accepted the file: the save is written FIRST, then the rules run on it. */
function restoreLike(text: string): { accepted: boolean; threw: string | null } {
  const read = readSave(text);
  if (!read) return { accepted: false, threw: null };
  try {
    const facts = read.save.facts;
    const more = settle(facts, C, NOW);
    const all = facts.concat(more);
    act(all, C, { do: 'open' }, NOW);
    see(all, C, NOW);
    return { accepted: true, threw: null };
  } catch (e) { return { accepted: true, threw: String((e as Error)?.message ?? e).slice(0, 80) }; }
}

describe('F1: Restore accepts files the rules cannot run (and the save is written before they run)', () => {
  const cases: [string, unknown[]][] = [
    ['a null fact', [null]],
    ['a fact with an unreadable time', [{ seq: 1, at: 'yesterday', day: '2026-09-30', type: 'opened' }]],
  ];
  for (const [name, facts] of cases) {
    it(`${name}: readSave accepts it, the rules throw`, () => {
      const r = restoreLike(JSON.stringify({ version: SAVE_VERSION, content: 'x', facts }));
      expect(r.accepted).toBe(true);
      expect(r.threw).not.toBeNull();
    });
  }
  it('a number or an empty object for a fact: accepted and carried in the save as it is (no throw on this path)', () => {
    for (const facts of [[1], [{}]]) expect(restoreLike(JSON.stringify({ version: SAVE_VERSION, content: 'x', facts }))).toEqual({ accepted: true, threw: null });
  });
  it('what the throwing cases say', () => {
    expect(restoreLike(JSON.stringify({ version: SAVE_VERSION, content: 'x', facts: [null] })).threw).toMatch(/null|undefined/);
    expect(restoreLike(JSON.stringify({ version: SAVE_VERSION, content: 'x', facts: [{ seq: 1, at: 'yesterday', day: '2026-09-30', type: 'opened' }] })).threw).toMatch(/not a moment/);
  });
  it('a save from a newer build (same version number, a fact type this build does not know) is accepted', () => {
    const facts = [{ seq: 1, at: '2026-09-30T09:00:00+01:00', day: '2026-09-30', type: 'opened' },
      { seq: 2, at: '2026-09-30T09:01:00+01:00', day: '2026-09-30', type: 'someFutureFact', x: 1 }];
    const r = restoreLike(JSON.stringify({ version: SAVE_VERSION, content: 'x', facts }));
    expect(r.accepted).toBe(true);   /* whether it then plays correctly is down to every rule ignoring unknown types */
  });
});

describe('F2: the calendar read is written again when only the order of the same events changed', () => {
  it('two reads of the same events in another order make two calendarRead facts', () => {
    let facts: Fact[] = [];
    const run = (cmd: Parameters<typeof act>[2]) => { facts = facts.concat(act(facts, C, cmd, NOW)); };
    run({ do: 'open' });
    run({ do: 'calendarShow', on: true, calendars: null });
    const a = { id: 'a@2026-10-01T12:00', cal: 'c', title: 'A', start: '2026-10-01T12:00', end: '2026-10-01T13:00', allDay: false };
    const b = { id: 'b@2026-10-02T12:00', cal: 'c', title: 'B', start: '2026-10-02T12:00', end: '2026-10-02T13:00', allDay: false };
    run({ do: 'calendarRead', events: [a, b], days: 14 });
    run({ do: 'calendarRead', events: [a, b], days: 14 });
    const once = facts.filter(f => f.type === 'calendarRead').length;
    run({ do: 'calendarRead', events: [b, a], days: 14 });
    expect(once).toBe(1);
    expect(facts.filter(f => f.type === 'calendarRead').length).toBe(2);
  });
});

describe('F3: sqlSaves trusts one fact to stand for the whole log', () => {
  it('a different, longer log that happens to share the fact at the old last index is written as an append: the old prefix stays', async () => {
    const db = nodeDb();
    const s = await sqlSaves(db, () => { throw new Error('no failure expected'); });
    const f = (seq: number, type = 'opened'): Fact => ({ seq, at: `2026-09-2${seq}T09:00:00+01:00`, day: `2026-09-2${seq}`, type } as Fact);
    s.write('save.v1', { version: SAVE_VERSION, content: 'c', facts: [f(1), f(2)] });
    /* another log: a different first fact, the same second one, and one more */
    s.write('save.v1', { version: SAVE_VERSION, content: 'c', facts: [f(1, 'dayCompleted'), f(2), f(3)] });
    await s.flush();
    const back = await sqlSaves(db, () => {});
    const facts = JSON.parse(back.get('save.v1')!).facts as Fact[];
    expect(facts[0].type).toBe('opened');   /* not the new log's first fact */
  });
});

describe('F4: a write that never answers stalls every later write, and the start that waits on it', () => {
  it('flush() never settles if one run() never settles; nothing falls back', async () => {
    let calls = 0;
    const hung: Db = {
      run: async () => { if (++calls > 1) return new Promise<void>(() => {}); },   /* the schema runs; then nothing answers */
      all: async (): Promise<Arg[][]> => [],
    };
    let failed = false;
    const s = await sqlSaves(hung, () => { failed = true; });
    s.write('save.v1', { version: SAVE_VERSION, content: 'c', facts: [] });
    const r = await Promise.race([s.flush().then(() => 'flushed'), new Promise(ok => setTimeout(() => ok('still waiting'), 200))]);
    expect(r).toBe('still waiting');
    expect(failed).toBe(false);
  });
});

describe('F5: a copy Dan saves by hand into the app\'s own folder counts as the weekly copy', () => {
  it('a manual "Save a copy" named like the weekly ones postpones the weekly copy and is pruned with them', () => {
    expect(copyName('2026-10-01').startsWith(COPY_PREFIX)).toBe(true);
    /* the last weekly copy was 2026-09-24; Dan saved one by hand on 2026-09-30 into On My iPhone → Long Answer */
    expect(copyDue(['Long Answer save 2026-09-24.json', 'Long Answer save 2026-09-30.json'], '2026-10-01')).toBe(false);
  });
});
