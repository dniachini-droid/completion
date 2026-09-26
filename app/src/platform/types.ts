import type { Saves } from './saves';
/** The phone's services, behind small interfaces (ARCHITECTURE.md → platform). */
export interface Notifier {
  /** Whether an alert can sound with the phone locked (the app: yes; a web page: no). */
  readonly locked: boolean;
  /** Ask once, in plain words, at the first Begin. Returns whether alerts may sound. */
  permit(): Promise<boolean>;
  /** Sound an alert at a moment, even with the phone locked. */
  at(id: number, when: Date, title: string, body: string): Promise<void>;
  cancel(ids: number[]): Promise<void>;
}
/** tick: a small tap (the rod settling, a mark cut); ring: one long buzz (a word locking, the story job's §7). */
export interface Haptics { tick(): Promise<void>; ring(): Promise<void>; }
export interface Store { get(key: string): string | null; set(key: string, value: string): void; remove(key: string): void; }
/** A soft sound while the app is open: a delve's end, or a breather's. */
export interface Sound { unlock(): void; chime(kind: 'delveEnd' | 'breatherEnd'): void; }
/** Leaving the app during a delve (D-094): only the phone app can tell it from locking. */
export interface Away {
  /** Watch for Dan going into another app while a delve runs; `alerts` are the delve's alerts to silence if he does. */
  watch(on: boolean, alerts: number[]): void;
  /** When Dan last went into another app during a delve (the phone's ms), once: null if he didn't (a lock is not leaving). */
  take(): Promise<number | null>;
  /** The same, read once before the game starts (a cold start after the phone closed the app while he was away). */
  readonly first: number | null;
  /** The last few times the app went to the background during a delve, and how each was read (the trial screen). */
  log(): Promise<{ at: number; how: 'locked' | 'left' | 'unsure'; signs: string[] }[]>;
}
/** What the delve's panel on the lock screen and in the Dynamic Island shows (D-095; ui/panel.ts works it out).
    Times are the phone's real instants in ms; the phone ticks the countdown and the ring itself, so the app needn't run. */
export interface PanelState {
  /** The run it follows (its fact's number): a new run replaces the panel, the same one updates it. */
  run: number;
  place: string; job: string;
  phase: 'delve' | 'breather' | 'held';
  label: string; line: string; left: string;
  /** The current delve's or breather's start and end. */
  start: number; end: number;
  /** While paused: how much of the delve is done, and its time left ("12:40"), still. */
  heldFraction: number; heldTime: string;
  /** What it shows once `end` passes with the app closed (it can't change its words without the app): the rest of
      the run, counted down to its end, or (afterStart = afterEnd = 0) that the delve is over. */
  afterLabel: string; afterLine: string; afterLeft: string;
  afterStart: number; afterEnd: number;
  /** When the panel turns to its "after" (0: never, while paused). */
  staleAt: number;
  /** What the phone itself turns it to if Dan goes into another app (the app is asleep by then, D-094): paused where
      he left, with these words. `awayLen` is one delve's length on the game's clock, for the time left (0 while paused). */
  awayLabel: string; awayLine: string; awayLeft: string; awayLen: number;
}
export interface Panel { show(p: PanelState): Promise<void>; end(): Promise<void>; }
export interface Platform {
  notifier: Notifier; haptics: Haptics; store: Store; sound: Sound; now(): Date; away: Away;
  /** The save (D-106): SQLite on the phone, the browser's storage on the web link. */
  readonly saves: Saves;
  /** Why the phone's save fell back to the app settings, if it did (the trial screen shows it). */
  readonly saveTrouble: string | null;
  /** The delve's panel on the lock screen and in the Dynamic Island (the app only; the web link has none). */
  panel: Panel;
  /** Inside the phone app (no browser around it: the app draws its own swipe back from the left edge). */
  readonly app: boolean;
  /** Wait for the save to be read, before the game starts. */
  ready(): Promise<void>;
}
