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
export interface Platform {
  notifier: Notifier; haptics: Haptics; store: Store; sound: Sound; now(): Date;
  /** Wait for the save to be read, before the game starts. */
  ready(): Promise<void>;
}
