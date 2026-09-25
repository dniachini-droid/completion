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
/** What the delve's panel on the lock screen and in the Dynamic Island shows (D-094; ui/panel.ts works it out).
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
}
export interface Panel { show(p: PanelState): Promise<void>; end(): Promise<void>; }
export interface Platform {
  notifier: Notifier; haptics: Haptics; store: Store; sound: Sound; now(): Date;
  /** The delve's panel on the lock screen and in the Dynamic Island (the app only; the web link has none). */
  panel: Panel;
  /** Inside the phone app (no browser around it: the app draws its own swipe back from the left edge). */
  readonly app: boolean;
  /** Wait for the save to be read, before the game starts. */
  ready(): Promise<void>;
}
