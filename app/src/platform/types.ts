// The phone's services behind small interfaces (ARCHITECTURE.md → "platform").
// Two versions of each: native (Capacitor, the app) and web (the browser prototype and tests).

export interface Storage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface Notifications {
  /** Asks once, in plain words, at the first Begin. Resolves to whether alerts may sound. */
  ensurePermission(): Promise<boolean>;
  /** The phone sounds this itself at `at`, locked or not. Replaces any alert with the same id. */
  schedule(id: number, at: Date, title: string, body: string): Promise<void>;
  cancel(id: number): Promise<void>;
}

export interface Haptics {
  /** A light tick: a selection changing. */
  tick(): Promise<void>;
  /** A firm tap: the main button. */
  tap(): Promise<void>;
  /** Something finished well. */
  success(): Promise<void>;
}

export interface Platform {
  kind: 'native' | 'web';
  storage: Storage;
  notifications: Notifications;
  haptics: Haptics;
  now(): number;
}
