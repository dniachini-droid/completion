/** The phone's services, behind small interfaces (ARCHITECTURE.md → platform). */
export interface Notifier {
  /** Ask once, in plain words, at the first Begin. Returns whether alerts may sound. */
  permit(): Promise<boolean>;
  /** Sound an alert at a moment, even with the phone locked. */
  at(id: number, when: Date, title: string, body: string): Promise<void>;
  cancel(id: number): Promise<void>;
}
export interface Haptics { tick(): Promise<void>; }
export interface Store { get(key: string): string | null; set(key: string, value: string): void; remove(key: string): void; }
export interface Platform { notifier: Notifier; haptics: Haptics; store: Store; now(): Date; }
