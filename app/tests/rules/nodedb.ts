/** SQLite for the save's tests: Node's own, standing in for the phone's (SavePlugin.swift does the same three things:
    open one file, run a list of statements as one transaction, return a query's rows). */
import type { Arg, Db } from '../../src/platform/saves';

/* Node's own modules, reached without Node's types (the project keeps them out of the app's code) */
interface Stmt { run(...a: Arg[]): unknown; all(...a: Arg[]): Record<string, Arg>[]; }
interface Sqlite { exec(sql: string): void; prepare(sql: string): Stmt; close(): void; }
const builtin = (name: string) => (globalThis as unknown as { process: { getBuiltinModule(n: string): any } }).process.getBuiltinModule(name);
const { DatabaseSync } = builtin('node:sqlite') as { DatabaseSync: new (path: string) => Sqlite };
const fs = builtin('node:fs'), os = builtin('node:os'), pathMod = builtin('node:path');

/** A fresh database file in a new temporary folder. */
export const tempFile = (): string => pathMod.join(fs.mkdtempSync(pathMod.join(os.tmpdir(), 'save-')), 'game.sqlite');
/** The sample saves, `tests/saves/v<n>.json`, by file name. */
export const samples = (): Record<string, string> => {
  const dir = pathMod.join(pathMod.dirname(new URL(import.meta.url).pathname), '../saves');
  return Object.fromEntries((fs.readdirSync(dir) as string[]).filter(f => /^v\d+\.json$/.test(f)).map(f => [f, fs.readFileSync(pathMod.join(dir, f), 'utf8') as string]));
};

/** `failAt`: the nth statement run from now on throws (a write that fails part-way through its transaction). */
export function nodeDb(path = ':memory:') {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL'); db.exec('PRAGMA synchronous=FULL');
  let count = 0;
  const me: Db & { failAt: number; close(): void } = {
    failAt: 0,
    close: () => db.close(),
    async run(steps: { sql: string; args?: Arg[] }[]) {
      db.exec('BEGIN IMMEDIATE');
      try {
        for (const s of steps) {
          if (me.failAt && ++count >= me.failAt) throw new Error('disk full');
          db.prepare(s.sql).run(...(s.args ?? []));
        }
        db.exec('COMMIT');
      } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    async all(sql: string, args?: Arg[]) { return db.prepare(sql).all(...(args ?? [])).map(r => Object.values(r) as Arg[]); },
  };
  return me;
}
