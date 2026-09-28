/**
 * The save's shape and its upgrades (DATA_MODEL.md → versions and migrations). Pure: the storage is the platform's.
 * A save is the fact log plus the version of its shape and of the content it last ran with.
 */
import type { Fact } from './types';
import { doneFacts } from './done';

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

/* ---------- copies of the save (D-107) ---------- */

/** A copy's file name: "Long Answer save 2026-09-27.json". Names sort by date. */
export const COPY_PREFIX = 'Long Answer save ';
export const copyName = (day: string) => `${COPY_PREFIX}${day}.json`;
/** Weekly copies kept in the app's Documents folder. */
export const COPIES_KEPT = 4;
/** Whether the weekly copy is due today: none yet, or the newest is a week old. */
export function copyDue(names: string[], today: string): boolean {
  const days = names.map(n => n.slice(COPY_PREFIX.length, COPY_PREFIX.length + 10)).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (!days.length) return true;
  return (Date.parse(today) - Date.parse(days[days.length - 1])) / 864e5 >= 7;
}
/** What a copy holds, for the question before a restore: the last day played in it and how many jobs were done. */
export function copySummary(s: Save): { day: string | null; done: number } {
  /* a plan change's "day" is where it moves to, not a day played (D-125) */
  const last = [...s.facts].reverse().find(f => f.type !== 'planChanged');
  return { day: last?.day ?? null, done: doneFacts(s.facts).length };
}
