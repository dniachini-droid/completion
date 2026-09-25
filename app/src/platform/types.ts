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
export interface Platform {
  notifier: Notifier; haptics: Haptics; store: Store; sound: Sound; now(): Date; away: Away;
  /** Inside the phone app (no browser around it: the app draws its own swipe back from the left edge). */
  readonly app: boolean;
  /** Wait for the save to be read, before the game starts. */
  ready(): Promise<void>;
}
