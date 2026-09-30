/**
 * Saves and migrations (TEST_STRATEGY.md → layer 3; D-106): every fact type written and read back; facts added one step
 * at a time; a write that fails part-way leaves the save as it was; the old way's saves brought into SQLite without
 * loss; every save version ever shipped still opens and plays on. Ids only: no story text here.
 */
import { describe, expect, test } from 'vitest';
import { act, see, settle } from '../../src/core/game';
import { copyDue, copyName, copySummary, readSave, SAVE_VERSION, type Migration, type Save } from '../../src/core/save';
import type { Fact, FactBody } from '../../src/core/types';
import { adopt, sqlSaves, textSaves } from '../../src/platform/saves';
import { content as C } from '../../src/content/world';
import { nodeDb, samples, tempFile } from './nodedb';
import { sim } from './sim';

/** One of every kind of fact: adding a fact type without one here fails the typecheck. */
const ONE: { [T in FactBody['type']]: Extract<FactBody, { type: T }> } = {
  opened: { type: 'opened' },
  capacityChosen: { type: 'capacityChosen', capacity: 'low', suggested: 'normal' },
  swapped: { type: 'swapped', from: 'a', to: 'b' },
  setAside: { type: 'setAside', job: 'a' },
  picked: { type: 'picked', job: 'a' },
  putBack: { type: 'putBack', job: 'a' },
  jobBegun: { type: 'jobBegun', job: 'a', from: 'record' },
  beginUndone: { type: 'beginUndone', job: 'a' },
  delveStarted: { type: 'delveStarted', job: 'a', minutes: 25, count: 3 },
  errandStruck: { type: 'errandStruck', run: 4, job: 'a' },
  errandShare: { type: 'errandShare', run: 4, job: 'a', minutes: 12 },
  breatherSkipped: { type: 'breatherSkipped' },
  delveHeld: { type: 'delveHeld', why: 'away' },
  delveResumed: { type: 'delveResumed' },
  delveEnded: { type: 'delveEnded', job: 'a', minutes: 17.5, how: 'finishedHere', run: 4 },
  jobDone: { type: 'jobDone', job: 'a', minutes: 60 },
  doneUndone: { type: 'doneUndone', job: 'a', on: '2026-09-29' },
  firstChosen: { type: 'firstChosen', job: 'a', on: '2026-09-30' },
  cantStartUsed: { type: 'cantStartUsed', job: 'a' },
  seen: { type: 'seen', what: 'welcome', ref: 9 },
  stepsGained: { type: 'stepsGained', minutes: 50, job: 'a', run: 4 },
  dayCompleted: { type: 'dayCompleted' },
  arrived: { type: 'arrived', kind: 'camp', id: 'x', how: 'key' },
  beatPlayed: { type: 'beatPlayed', id: 'x', job: 3, passage: 'y' },
  keyEarned: { type: 'keyEarned', rhythm: 'r' },
  keyHeld: { type: 'keyHeld' },
  keyUsed: { type: 'keyUsed' },
  sealOpened: { type: 'sealOpened', seal: 's' },
  findGiven: { type: 'findGiven', id: 'f', why: 'morning', job: 2 },
  recordShown: { type: 'recordShown', id: 'r' },
  storyWeekBegan: { type: 'storyWeekBegan', w: 3 },
  markGuessed: { type: 'markGuessed', mark: 'm', guess: 'g' },
  choiceMade: { type: 'choiceMade', beat: 'b', pick: 1 },
  recordOpened: { type: 'recordOpened', id: 'r' },
  rhythmSaved: { type: 'rhythmSaved', rhythm: { id: 'r', job: 'a', days: [1, 3], time: '18:00' }, job: { id: 'a', name: 'Café “Ñandú” — 2×', delve: true, length: 50, enoughAt: 40, avoided: true, doneBy: 'enough', firstStep: 'Open the book\nat the mark' } },
  rhythmStopped: { type: 'rhythmStopped', id: 'r' },
  itemAdded: { type: 'itemAdded', id: 'i', name: 'Renew the passport — by 3 Nov 🙂', via: 'siri', ref: '0E1B2C3D-0000-4000-8000-000000000001' },
  itemTicked: { type: 'itemTicked', id: 'i' },
  itemDropped: { type: 'itemDropped', id: 'i' },
  planMade: { type: 'planMade', week: '2026-09-28', entries: [{ id: 'e', job: 'a', day: '2026-09-29', time: '07:30' }] },
  planChanged: { type: 'planChanged', entry: 'e', day: null, time: null },
  planAdded: { type: 'planAdded', entry: { id: 'e2', job: 'b', day: '2026-09-30' } },
  bedtimeSet: { type: 'bedtimeSet', time: '23:00' },
  goodnight: { type: 'goodnight', kept: false },
  deepCalled: { type: 'deepCalled' },
  weekClosed: { type: 'weekClosed', week: '2026-09-28', n: 1, learned: ['a'], soFar: [], glimpse: null, seals: ['s'] },
  closeRead: { type: 'closeRead', week: '2026-09-28' },
  offerAnswered: { type: 'offerAnswered', week: '2026-09-28' },
  welcomed: { type: 'welcomed', since: '2026-09-20', question: null },
  reminderSet: { type: 'reminderSet', target: 'e:p20260928-3', lead: 15 },
  remindersSwitched: { type: 'remindersSwitched', on: false },
  jobSaved: { type: 'jobSaved', job: { id: 'j-x', name: 'Renew the passport', delve: false, length: 30, doneBy: 'dan', avoided: true, firstStep: 'Find the old one', note: 'photo booth at the station' } },
  jobRemoved: { type: 'jobRemoved', id: 'post' },
  doneHidden: { type: 'doneHidden', job: 'gym', on: '2026-09-28' },
  nudgeChosen: { type: 'nudgeChosen', on: true },
  calendarChosen: { type: 'calendarChosen', on: true, calendars: ['work'] },
  itemKept: { type: 'itemKept', id: 'it-1' },
  itemSomeday: { type: 'itemSomeday', id: 'it-2' },
  weekPinned: { type: 'weekPinned', week: '2026-09-28', job: 'cat' },
  lookAheadSeen: { type: 'lookAheadSeen', week: '2026-09-28', finished: true },
  calendarRead: { type: 'calendarRead', from: '2026-09-28', to: '2026-10-12', events: [
    { id: 'e1', cal: 'work', title: 'Dentist', start: '2026-09-29T10:00', end: '2026-09-29T11:00', allDay: false },
    { id: 'e2', cal: 'home', title: 'Mum’s birthday', start: '2026-10-03', end: '2026-10-03', allDay: true }] },
};
const every: Fact[] = Object.values(ONE).map((b, i) => ({ seq: i + 1, at: '2026-09-28T09:00:00+01:00', day: '2026-09-28', ...b }) as Fact);
const save = (facts: Fact[], version = SAVE_VERSION): Save => ({ version, content: C.version, facts });
const noFail = () => { throw new Error('no write should fail here'); };
const file = tempFile;

describe('the save in SQLite', () => {
  test('every fact type is written and read back as it was, after the app is closed and opened again', async () => {
    const path = file(), db = nodeDb(path), s = await sqlSaves(db, noFail);
    s.write('save.v1', save(every));
    await s.flush(); db.close();
    const again = await sqlSaves(nodeDb(path), noFail);
    expect(JSON.parse(again.get('save.v1')!)).toEqual(save(every));
    expect(readSave(again.get('save.v1')!)!.save.facts).toEqual(every);
  });

  test('weeks of play: only the new facts are written each time, and the save always reads back whole', async () => {
    const path = file(), db = nodeDb(path), s = await sqlSaves(db, noFail);
    const p = sim(undefined, undefined, 'kept');
    const statements: number[] = [];
    const run = db.run;
    db.run = async steps => { statements.push(steps.length); return run(steps); };
    for (let d = 0; d < 9; d++) {
      p.week(d === 4 ? 'high' : 'normal');
      s.write('save.v1', save(p.facts));
    }
    /* every write after the first adds rows and the head only: never the whole log again */
    expect(Math.max(...statements.slice(1))).toBeLessThan(p.facts.length / 3);
    await s.flush(); db.close();
    const again = await sqlSaves(nodeDb(path), noFail);
    expect(readSave(again.get('save.v1')!)!.save.facts).toEqual(p.facts);
  }, 60_000);

  test('a write that fails part-way leaves the save exactly as it was, and the game is told once', async () => {
    const path = file(), db = nodeDb(path);
    const told: unknown[] = [];
    const s = await sqlSaves(db, why => told.push(why));
    s.write('save.v1', save(every.slice(0, 10)));
    await s.flush();
    db.failAt = 3;   /* the third statement of the next write fails: after its first facts were inserted */
    s.write('save.v1', save(every));
    s.write('save.v1', save(every.concat(every[0])));
    await expect(s.flush()).rejects.toThrow();
    expect(told).toHaveLength(1);
    /* what the game did is still whole in memory, to be kept another way */
    expect(JSON.parse(Object.fromEntries(s.all())['save.v1']).facts).toHaveLength(every.length + 1);
    db.close();
    const again = await sqlSaves(nodeDb(path), noFail);
    expect(readSave(again.get('save.v1')!)!.save.facts).toEqual(every.slice(0, 10));
  });

  test('a save written anew (a fresh start, an upgrade) replaces the old facts in the same one step', async () => {
    const path = file(), db = nodeDb(path), s = await sqlSaves(db, noFail);
    s.write('save.v1', save(every));
    s.write('save.v1', save(every.slice(3, 5)));   /* not an extension of what is there */
    s.write('save.rehearsal', save(every.slice(0, 2)));
    s.keep('save.v1.backup', '{"version":2}');
    s.remove('save.rehearsal');
    await s.flush(); db.close();
    const again = await sqlSaves(nodeDb(path), noFail);
    expect(readSave(again.get('save.v1')!)!.save.facts).toEqual(every.slice(3, 5));
    expect(again.get('save.rehearsal')).toBeNull();
    expect(again.get('save.v1.backup')).toBe('{"version":2}');
  });
});

describe('saves written the old way, brought into SQLite', () => {
  const settings = (init: Record<string, string>) => {
    const m = new Map(Object.entries(init));
    return { keys: () => [...m.keys()], get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => void m.set(k, v), remove: (k: string) => void m.delete(k), m };
  };

  test('the first start on this build: the save moves into SQLite whole, and out of the settings, a copy kept', async () => {
    const old = JSON.stringify(save(every)), st = settings({ 'save.v1': old, 'save.v1.backup': 'yesterday', 'proto.settings': '{}' });
    const s = await sqlSaves(nodeDb(), noFail);
    await adopt(s, st, ['save.v1', 'save.rehearsal']);
    expect(readSave(s.get('save.v1')!)!.save.facts).toEqual(every);
    expect(s.get('save.v1.settings')).toBe(old);
    expect(s.get('save.v1.backup')).toBe('yesterday');
    expect([...st.m.keys()]).toEqual(['proto.settings']);
  });

  test('after SQLite failed and the settings kept the save, the longer log wins; a wiped save never comes back', async () => {
    const s = await sqlSaves(nodeDb(), noFail);
    s.write('save.v1', save(every.slice(0, 5)));
    await adopt(s, settings({ 'save.v1': JSON.stringify(save(every)) }), ['save.v1']);
    expect(readSave(s.get('save.v1')!)!.save.facts).toEqual(every);
    /* an older copy in the settings (SQLite's is newer) never replaces it */
    await adopt(s, settings({ 'save.v1': JSON.stringify(save(every.slice(0, 2))) }), ['save.v1']);
    expect(readSave(s.get('save.v1')!)!.save.facts).toEqual(every);
    /* the settings were emptied the first time, so a wipe in SQLite stays wiped at the next start */
    const st = settings({ 'save.v1': JSON.stringify(save(every)) });
    await adopt(s, st, ['save.v1']);
    s.remove('save.v1');
    await adopt(s, st, ['save.v1']);
    expect(s.get('save.v1')).toBeNull();
  });

  test('if SQLite fails while bringing it in, the settings keep the save', async () => {
    const db = nodeDb(), s = await sqlSaves(db, () => {});
    const st = settings({ 'save.v1': JSON.stringify(save(every)) });
    db.failAt = 1;
    await expect(adopt(s, st, ['save.v1'])).rejects.toThrow();
    expect(st.get('save.v1')).not.toBeNull();
  });

  test('the web link keeps the whole save as one text, as before', () => {
    const st = settings({});
    const s = textSaves(st, 'browser');
    s.write('save.v1', save(every));
    expect(st.get('save.v1')).toBe(JSON.stringify(save(every)));
  });
});

describe('versions and migrations', () => {
  test('a save of this version reads as it is; unreadable or newer ones are refused, to be kept aside', () => {
    expect(readSave(JSON.stringify(save(every)))).toEqual({ save: save(every), from: SAVE_VERSION });
    expect(readSave('not a save')).toBeNull();
    expect(readSave('{"version":2}')).toBeNull();
    expect(readSave(JSON.stringify(save(every, SAVE_VERSION + 1)))).toBeNull();
    /* version 1 (the heart prototype) started afresh: there is no way up from it */
    expect(readSave(JSON.stringify(save([], 1)))).toBeNull();
  });

  test('an old save is brought up one version at a time, each step once', () => {
    const steps: Record<number, Migration> = {
      2: s => ({ ...s, version: 3, facts: s.facts.map(f => ({ ...(f as object), v3: true })) }),
      3: s => ({ ...s, version: 4, facts: s.facts.concat([{ type: 'opened' }]) }),
    };
    const r = readSave(JSON.stringify(save(every.slice(0, 2), 2)), 4, steps)!;
    expect(r.from).toBe(2);
    expect(r.save.version).toBe(4);
    expect(r.save.facts).toHaveLength(3);
    expect(r.save.facts[0]).toMatchObject({ type: 'opened', v3: true });
    expect(readSave(JSON.stringify(save([], 2)), 4, { 2: steps[2] })).toBeNull();   /* a missing step: refused, not guessed */
  });

  /* every save version ever shipped: tests/saves/v<n>.json, two weeks of play at that version */
  const saved = samples();
  test('there is a sample save for this version', () => expect(Object.keys(saved)).toContain(`v${SAVE_VERSION}.json`));
  test.each(Object.keys(saved))('the sample save %s opens and plays on', (f: string) => {
    const r = readSave(saved[f])!;
    expect(r).not.toBeNull();
    let facts = r.save.facts;
    const last = facts[facts.length - 1].at, next = new Date(Date.parse(last) + 864e5).toISOString().slice(0, 10) + 'T09:00:00+01:00';
    const before = see(facts, C, last);
    /* what was shown stays shown: the places reached are still reached a day later */
    facts = facts.concat(settle(facts, C, next));
    facts = facts.concat(act(facts, C, { do: 'open' }, next));
    const v = see(facts, C, next);
    const places = (fs: Fact[]) => fs.filter(x => x.type === 'arrived').map(x => (x as { id: string }).id);
    expect(places(facts)).toEqual(expect.arrayContaining(places(r.save.facts)));
    expect(v.here.name).toBeTruthy();
    expect(before.here.name).toBeTruthy();
    const job = v.next?.job ?? v.order[0];
    expect(job).toBeTruthy();
    facts = facts.concat(act(facts, C, { do: 'startRun', job: job!, minutes: 25, count: 1 }, next));
    expect(facts.some(f => f.type === 'delveStarted' && f.job === job)).toBe(true);
  });
});

describe('copies of the save (D-107)', () => {
  test('a copy is the save as it is: read back whole by readSave, and it plays on', () => {
    const p = sim().week('normal');
    const text = JSON.stringify(save(p.facts));
    const r = readSave(text)!;
    expect(r.save.facts).toEqual(p.facts);
    const now = '2026-10-05T09:00:00+01:00';
    const facts = r.save.facts.concat(act(r.save.facts, C, { do: 'open' }, now));
    expect(see(facts, C, now).next).not.toBeNull();
  });
  test('a copy from an older version is brought up as any old save is; an unreadable or newer file is refused', () => {
    for (const raw of Object.values(samples())) expect(readSave(raw)).not.toBeNull();
    expect(readSave('{"hello": 1}')).toBeNull();
    expect(readSave('not a save')).toBeNull();
    expect(readSave(JSON.stringify(save([], SAVE_VERSION + 1)))).toBeNull();
  });
  test('the question before a restore says the copy’s last day and how much it holds', () => {
    const p = sim().week('normal');
    const s = copySummary(save(p.facts));
    expect(s.day).toBe(p.facts.at(-1)!.day);
    expect(s.done).toBe(p.facts.filter(f => f.type === 'jobDone').length);
    expect(s.done).toBeGreaterThan(0);
    expect(copySummary(save([]))).toEqual({ day: null, done: 0 });
  });
  test('the weekly copy: due with none yet, and again a week after the newest', () => {
    expect(copyName('2026-09-27')).toBe('Long Answer save 2026-09-27.json');
    expect(copyDue([], '2026-09-27')).toBe(true);
    const names = ['2026-09-06', '2026-09-20', '2026-09-13'].map(copyName);
    expect(copyDue(names, '2026-09-26')).toBe(false);
    expect(copyDue(names, '2026-09-27')).toBe(true);
    expect(copyDue(['something else.json'], '2026-09-27')).toBe(true);
  });
});
