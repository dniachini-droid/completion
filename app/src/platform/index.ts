import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics as CapHaptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import type { Platform } from './types';
import { sound } from './chime';

/* Prototype storage. On the web link: the browser's own. The fact log is the real save's shape; it moves to SQLite
   before the first playable (DATA_MODEL.md; PROTOTYPE_NOTES.md). */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  remove: (k: string) => { try { localStorage.removeItem(k); } catch { /* */ } },
};

/* In the app: the phone's own app settings (Preferences), which iOS never clears to save space and iCloud backs up.
   Read once at start into memory, so the game reads and writes as before; each write goes to the phone at once. */
const kept = new Map<string, string>();
const nativeStore = {
  get: (k: string) => kept.get(k) ?? null,
  set: (k: string, v: string) => { kept.set(k, v); void Preferences.set({ key: k, value: v }); },
  remove: (k: string) => { kept.delete(k); void Preferences.remove({ key: k }); },
};
async function readKept() {
  const { keys } = await Preferences.keys();
  for (const key of keys) { const { value } = await Preferences.get({ key }); if (value !== null) kept.set(key, value); }
}

const native: Platform = {
  store: nativeStore, sound, now: () => new Date(), ready: readKept,
  notifier: {
    locked: true,
    async permit() {
      const s = await LocalNotifications.checkPermissions();
      if (s.display === 'granted') return true;
      return (await LocalNotifications.requestPermissions()).display === 'granted';
    },
    async at(id, when, title, body) {
      await LocalNotifications.schedule({ notifications: [{ id, title, body, schedule: { at: when, allowWhileIdle: true }, sound: undefined }] });
    },
    async cancel(ids) { await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) }); },
  },
  haptics: { tick: () => CapHaptics.impact({ style: ImpactStyle.Light }), ring: () => CapHaptics.vibrate({ duration: 450 }) },
};

/* In a browser (the web link, tests): the end chimes if the page is open, and shows when you come back. */
const web: Platform = {
  store, sound, now: () => new Date(), ready: async () => {},
  notifier: { locked: false, permit: async () => false, at: async () => {}, cancel: async () => {} },
  haptics: {
    tick: async () => { try { navigator.vibrate?.(8); } catch { /* */ } },
    ring: async () => { try { navigator.vibrate?.(450); } catch { /* */ } },
  },
};

export const platform: Platform = Capacitor.isNativePlatform() ? native : web;
