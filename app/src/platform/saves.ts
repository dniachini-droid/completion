/**
 * Where the save is kept (DATA_MODEL.md; ARCHITECTURE.md → "nothing is half-saved").
 * On the phone: SQLite, each new fact written in one transaction as it happens, never the whole log again. In the
 * screen checks: the browser's storage, the whole save as one text, as before. Both are read once at start and kept
 * in memory, so the game reads them at once.
 */
import type { Save } from '../core/save';
import type { Store } from './types';

export interface Saves {
  /** A live save, or a copy kept aside, as the text of a save (null: none). */
  get(key: string): string | null;
  /** A live save as it is now: the facts past what was written before are added, in one step. */
  write(key: string, save: Save): void;
  /** A copy kept aside (a daily backup, a save this build couldn't read, a wiped one): never read by the game itself. */
  keep(key: string, raw: string): void;
  remove(key: string): void;
  /** Where it is kept, for the trial screen. */
  readonly where: 'sqlite' | 'settings' | 'browser';
}

/** The browser's storage, or the phone's app settings when SQLite can't be opened (the old way: the whole save each time). */
export function textSaves(store: Store, where: 'settings' | 'browser'): Saves {
  return {
    where,
    get: k => store.get(k),
    write: (k, s) => store.set(k, JSON.stringify(s)),
    keep: (k, raw) => store.set(k, raw),
    remove: k => store.remove(k),
  };
}

/** What SQLite is asked to do: a list of statements run as one transaction (all or nothing), or a query. */
export type Arg = string | number | null;
export interface Db {
  run(steps: { sql: string; args?: Arg[] }[]): Promise<void>;
  all(sql: string, args?: Arg[]): Promise<Arg[][]>;
}

const SCHEMA = [
  /* a live save's head: the version of its shape and of the content it last ran with */
  'CREATE TABLE IF NOT EXISTS saves (key TEXT PRIMARY KEY, version INTEGER NOT NULL, content TEXT NOT NULL)',
  /* its facts, one row each, in order (n from 0); a fact is written once and never changed */
  'CREATE TABLE IF NOT EXISTS facts (key TEXT NOT NULL, n INTEGER NOT NULL, body TEXT NOT NULL, PRIMARY KEY (key, n))',
  'CREATE TABLE IF NOT EXISTS copies (key TEXT PRIMARY KEY, body TEXT NOT NULL, at INTEGER NOT NULL)',
];

interface Live { version: number; content: string; bodies: string[]; }

export type SqlSaves = Saves & {
  /** Every live save and copy as held in memory (always up to date, written or not), to keep them another way. */
  all(): [string, string][];
  /** Wait until everything asked so far is written; fails if a write failed. */
  flush(): Promise<void>;
};

/** The save in SQLite. Writes go one after another, each one transaction. If one fails, `failed` is told once and no
    more are sent: what the game did is still in memory (`all`), for the caller to keep another way. */
export async function sqlSaves(db: Db, failed: (why: unknown) => void, now = () => Date.now()): Promise<SqlSaves> {
  await db.run(SCHEMA.map(sql => ({ sql })));
  const live = new Map<string, Live>(), copies = new Map<string, string>();
  for (const [key, version, content] of await db.all('SELECT key, version, content FROM saves'))
    live.set(String(key), { version: Number(version), content: String(content), bodies: [] });
  for (const [key, body] of await db.all('SELECT key, body FROM facts ORDER BY key, n')) live.get(String(key))?.bodies.push(String(body));
  for (const [key, body] of await db.all('SELECT key, body FROM copies')) copies.set(String(key), String(body));

  let queue: Promise<void> = Promise.resolve(), broken = false;
  const send = (steps: { sql: string; args?: Arg[] }[]) => {
    queue = queue.then(() => broken ? undefined : db.run(steps)).catch(why => { if (!broken) { broken = true; failed(why); } });
  };

  const me: SqlSaves = {
    where: 'sqlite',
    all: () => [...live.keys(), ...copies.keys()].map(k => [k, me.get(k)!]),
    async flush() { await queue; if (broken) throw new Error('the save could not be written'); },
    get(key) {
      const l = live.get(key);
      if (l) return `{"version":${l.version},"content":${JSON.stringify(l.content)},"facts":[${l.bodies.join(',')}]}`;
      return copies.get(key) ?? null;
    },
    write(key, save) {
      const l = live.get(key), bodies = l?.bodies ?? [];
      /* only facts are ever added to a live save; anything else (a fresh start after a save was kept aside, an upgrade)
         is written anew, in the same one step */
      const adds = !!l && l.version === save.version && save.facts.length >= bodies.length
        && (bodies.length === 0 || bodies[bodies.length - 1] === JSON.stringify(save.facts[bodies.length - 1]));
      const from = adds ? bodies.length : 0;
      const fresh = save.facts.slice(from).map(f => JSON.stringify(f));
      if (adds && !fresh.length && l!.content === save.content) return;
      const steps: { sql: string; args?: Arg[] }[] = [];
      if (!adds) steps.push({ sql: 'DELETE FROM facts WHERE key = ?', args: [key] });
      steps.push({ sql: 'INSERT OR REPLACE INTO saves (key, version, content) VALUES (?, ?, ?)', args: [key, save.version, save.content] });
      fresh.forEach((body, i) => steps.push({ sql: 'INSERT INTO facts (key, n, body) VALUES (?, ?, ?)', args: [key, from + i, body] }));
      if (adds) { l!.content = save.content; bodies.push(...fresh); }
      else live.set(key, { version: save.version, content: save.content, bodies: fresh });
      send(steps);
    },
    keep(key, raw) {
      copies.set(key, raw);
      send([{ sql: 'INSERT OR REPLACE INTO copies (key, body, at) VALUES (?, ?, ?)', args: [key, raw, now()] }]);
    },
    remove(key) {
      live.delete(key); copies.delete(key);
      send([{ sql: 'DELETE FROM facts WHERE key = ?', args: [key] }, { sql: 'DELETE FROM saves WHERE key = ?', args: [key] },
        { sql: 'DELETE FROM copies WHERE key = ?', args: [key] }]);
    },
  };
  return me;
}

const facts = (raw: string | null) => { try { const f = raw && JSON.parse(raw).facts; return Array.isArray(f) ? f.length : -1; } catch { return -1; } };

/** Saves written the old way (the phone's app settings, up to this build, or after SQLite failed) brought into SQLite.
    A live save there that is longer than SQLite's is the newer one (facts are only ever added): it is written into
    SQLite and, once that is done, moved to a copy (`<key>.settings`) and taken out of the settings, so it is never read
    again. A shorter one (SQLite's is newer) is moved to a copy too. Copies kept aside move as they are. */
export async function adopt(into: SqlSaves, old: Store & { keys(): string[] }, liveKeys: string[]): Promise<string[]> {
  const moved: string[] = [];
  for (const key of old.keys().filter(k => k.startsWith('save.'))) {
    const raw = old.get(key);
    if (raw === null) continue;
    if (liveKeys.includes(key)) {
      if (facts(raw) > Math.max(0, facts(into.get(key)))) {
        const s = JSON.parse(raw);
        into.write(key, { version: s.version, content: String(s.content ?? ''), facts: s.facts });
      }
      into.keep(`${key}.settings`, raw);
    } else into.keep(key, raw);
    await into.flush();
    old.remove(key);
    moved.push(key);
  }
  return moved;
}
