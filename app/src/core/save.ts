/**
 * The save's shape and its upgrades (DATA_MODEL.md → versions and migrations). Pure: the storage is the platform's.
 * A save is the fact log plus the version of its shape and of the content it last ran with.
 */
import type { Fact } from './types';

/** 2: the story (slice 2); version 1 saves (the heart prototype) started afresh and are not upgraded. */
export const SAVE_VERSION = 2;
export interface Save { version: number; content: string; facts: Fact[]; }

/** MIGRATIONS[n] turns a version-n save into a version n+1 one. Each ships with the version it creates, and every version
    ever shipped keeps a sample save in `tests/saves/` that must still open and play on. A migration never changes what
    an old fact meant: it adds, or reshapes, only (DATA_MODEL.md). */
export type Migration = (s: { version: number; content: string; facts: unknown[] }) => { version: number; content: string; facts: unknown[] };
export const MIGRATIONS: Record<number, Migration> = {};

/** A save's text, read and brought up to this build's version. `from` is the version it was written at (a copy of it
    is kept before an upgraded save is written, DATA_MODEL.md → backups). Null: unreadable, from a newer build, or from
    a version with no way up; the caller keeps it aside and never writes over it (D-080). */
export function readSave(raw: string, to = SAVE_VERSION, steps = MIGRATIONS): { save: Save; from: number } | null {
  let s: { version: number; content: string; facts: unknown[] };
  try { s = JSON.parse(raw); } catch { return null; }
  if (!s || typeof s.version !== 'number' || !Array.isArray(s.facts)) return null;
  const from = s.version;
  if (from > to) return null;
  while (s.version < to) {
    const step = steps[s.version];
    if (!step) return null;
    const next = step(s);
    if (next.version !== s.version + 1 || !Array.isArray(next.facts)) return null;
    s = next;
  }
  return { save: { version: s.version, content: String(s.content ?? ''), facts: s.facts as Fact[] }, from };
}
