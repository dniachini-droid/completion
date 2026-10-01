/**
 * Deep review verification (round 5): probes that load the real UI glue (ui/game.svelte.ts) against a recording
 * stand-in for the phone, to reproduce or refute the reviewers' findings. Each test asserts what happens NOW.
 * Spoiler-free: ids and numbers only.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';

/* ---- a phone that records ---- */
const rec = vi.hoisted(() => {
  const g = globalThis as any;
  g.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
  g.window = { setTimeout: () => 0, clearTimeout() {}, addEventListener() {}, removeEventListener() {} };
  const r = {
    clock: new Date('2026-10-05T09:00:00Z').getTime(),
    log: [] as string[],
    take: async () => null as number | null,
    events: [] as unknown[],
    kv: new Map<string, string>(),
    store: new Map<string, string>(),
    alertsAt: [] as { id: number; when: number }[],
    remindAt: [] as { id: number; when: number }[],
  };
  return r;
});

vi.mock('../../src/platform', () => {
  const store = { get: (k: string) => rec.store.get(k) ?? null, set: (k: string, v: string) => void rec.store.set(k, v), remove: (k: string) => void rec.store.delete(k) };
  const saves = {
    where: 'browser', get: (k: string) => rec.kv.get(k) ?? null,
    write: (k: string, s: unknown) => void rec.kv.set(k, JSON.stringify(s)),
    keep: (k: string, raw: string) => void rec.kv.set(k, raw), remove: (k: string) => void rec.kv.delete(k),
  };
  const tick = () => new Promise(r => setTimeout(r, 1));
  return {
    platform: {
      store, saves, saveTrouble: null, app: false, now: () => new Date(rec.clock), ready: async () => {},
      sound: { unlock() {}, chime: (k: string) => void rec.log.push(`chime:${k}`) },
      haptics: { tick: async () => {}, ring: async () => {} },
      away: { first: null, watch: (on: boolean) => void rec.log.push(`watch:${on}`), take: () => rec.take(), log: async () => [] },
      notifier: {
        locked: true,
        permit: async () => { await tick(); rec.log.push('permit'); return true; },
        at: async (id: number, when: Date) => { await tick(); rec.alertsAt.push({ id, when: when.getTime() }); rec.log.push(`at:${id}`); },
        cancel: async (ids: number[]) => { await tick(); rec.log.push(`cancel:${ids[0]}..${ids.length}`); if (ids[0] === 100) rec.alertsAt.length = 0; else rec.remindAt = rec.remindAt.filter(a => !ids.includes(a.id)); },
        remind: async (id: number, when: Date) => { await tick(); rec.remindAt.push({ id, when: when.getTime() }); rec.log.push(`remind:${id}`); },
      },
      panel: { show: async (p: { phase: string }) => void rec.log.push(`panel:show:${p.phase}`), end: async () => void rec.log.push('panel:end') },
      copies: { share: async () => {}, pick: async () => null, keep: async () => {}, list: async () => [] },
      inbox: { take: async () => [], clear: async () => {} },
      calendar: { permit: async () => true, calendars: async () => [], events: async () => rec.events, onChange() {} },
    },
  };
});

const settleAsync = () => new Promise(r => setTimeout(r, 200));
let game: any;
beforeAll(async () => { ({ game } = await import('../../src/ui/game.svelte')); await settleAsync(); });

describe('ui glue (game.svelte.ts) on a recording phone', () => {
  it('runes work here: the view follows the facts', () => {
    const n = game.facts.length;
    expect(n).toBeGreaterThan(0);
    expect(game.view.day).toBe('2026-10-05');
  });

  it('CODE #1: "Delve now" starts a run but lays out no delve-end alerts and no panel', async () => {
    rec.log.length = 0; rec.alertsAt.length = 0;
    game.do({ do: 'delveNow', line: 'Call the bank' });
    await settleAsync();
    expect(!!game.view.run).toBe(true);
    const shows = rec.log.filter(x => x.startsWith('panel:show'));
    const ats = rec.log.filter(x => x.startsWith('at:'));
    console.log('[CODE#1] after delveNow:', JSON.stringify(rec.log));
    expect(ats.length).toBe(0);          /* bug: no alert scheduled */
    expect(shows.length).toBe(0);        /* bug: no panel */
    /* control: Pause then Back to the delve lays them out */
    game.do({ do: 'stepAway' }); await settleAsync();
    game.do({ do: 'resume' }); await settleAsync();
    expect(rec.alertsAt.length).toBeGreaterThan(0);
    game.do({ do: 'finishHere' }); await settleAsync();
  });

  it('CODE #7 / PLATFORM #7b: two alerts() calls close together leave alerts scheduled for a held run', async () => {
    /* start a fresh run */
    const end = game.view.runEnd;
    if (end) game.do({ do: 'seen', what: 'step', ref: end.seq });
    rec.clock += 60 * 60_000;
    const job = game.view.order.find((j: string) => !game.view.done.has(j));
    rec.log.length = 0;
    game.do({ do: 'startRun', job, minutes: 25, count: 4 });   /* alerts() A begins */
    /* A is part-way through laying its alerts out (one per await) when Dan taps Pause */
    for (let i = 0; i < 200 && !rec.log.includes('at:101'); i++) await new Promise(r => setTimeout(r, 1));
    game.do({ do: 'stepAway' });                                 /* alerts() B: held, should leave none */
    await settleAsync();
    console.log('[CODE#7] log:', JSON.stringify(rec.log));
    console.log('[CODE#7] run phase:', game.view.run?.phase, 'alerts left:', rec.alertsAt.length);
    expect(game.view.run?.phase).toBe('held');
    /* what happens now: */
    expect(rec.alertsAt.length).toBeGreaterThan(0);
    game.do({ do: 'resume' }); await settleAsync();
    game.do({ do: 'finishHere' }); await settleAsync();
  });

  it('PLATFORM #2: after a time-zone change the reminders are not laid out again (same wall-clock key)', async () => {
    /* covered by reasoning; key is wall-clock only: check the source line */
    const src: string = (await import('node:fs')).readFileSync(new URL('../../src/ui/game.svelte.ts', import.meta.url), 'utf8');
    expect(src).toMatch(/const key = JSON\.stringify\(\[words\.map\(w => \[w\.a\.date, w\.a\.clock, w\.title, w\.body\]\), nudge\?\.getTime\(\) \?\? 0\]\)/);
  });
});

/* ---- core-only probes ---- */
import { act, see, settle } from '../../src/core/game';
import { content as C } from '../../src/content/world';
import { readSave } from '../../src/core/save';
import type { Fact } from '../../src/core/types';
const fs = (globalThis as any).process.getBuiltinModule('node:fs');
const run = (facts: Fact[], cmd: any, at: string) => facts.concat(act(facts, C, cmd, at));

describe('THREE-WEEKS F2: Not yet + a note, then Back to today', () => {
  it('the note and the seen are both written by the rules', () => {
    let f: Fact[] = [];
    const t0 = '2026-10-05T09:00:00+01:00';
    f = run(f, { do: 'open' }, t0);
    f = run(f, { do: 'saveForLater', line: 'Big job' }, t0);
    const id = see(f, C, t0).content.jobs.find(j => j.name === 'Big job')!.id;
    f = run(f, { do: 'startRun', job: id, minutes: 90, count: 3 }, t0);
    const t1 = '2026-10-05T14:00:00+01:00';
    f = f.concat(settle(f, C, t1));
    const end = see(f, C, t1).runEnd!;
    expect(end).toBeTruthy();
    const a = act(f, C, { do: 'noteJob', job: id, note: 'page 4' }, t1);
    f = f.concat(a);
    const v = see(f, C, t1);
    console.log('[F2] after noteJob: facts', a.map(x => x.type), 'runEnd still', !!v.runEnd, 'arrival', !!v.arrival);
    const b = act(f, C, { do: 'seen', what: 'step', ref: end.seq }, t1);
    console.log('[F2] seen writes', b.map(x => x.type));
    expect(b.some(x => x.type === 'seen')).toBe(true);
  });
});

/* PERFORMANCE #1: not probed here. Vitest compiles .svelte.ts for the server, where $state is a plain value (checked:
   util.types.isProxy(game.facts) is false here). The client build is what matters: dist's Game has
   `set facts(e){C(this.#t,e,!0)}`, i.e. set(source, value, should_proxy=true): every assigned log is deeply proxied. */

describe('PLATFORM #4: a restored file the game cannot run', () => {
  it('readSave accepts a v2 save with a null fact, and the rules then throw', () => {
    const r = readSave(JSON.stringify({ version: 2, content: 'x', facts: [null] }));
    expect(r).not.toBeNull();
    expect(() => see(r!.save.facts, C, '2026-10-05T09:00:00+01:00')).toThrow();
    const r2 = readSave(JSON.stringify({ version: 2, content: 'x', facts: [{ seq: 1, type: 'opened', day: '2026-10-05', at: 'not a time' }] }));
    expect(r2).not.toBeNull();
    let threw = false; try { const f = r2!.save.facts.concat(settle(r2!.save.facts, C, '2026-10-05T09:00:00+01:00')); see(f, C, '2026-10-05T09:00:00+01:00'); } catch { threw = true; }
    console.log('[PLAT#4] bad "at" throws in settle/see:', threw);
  });
});
